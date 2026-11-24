import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { buildChart, chartFacts, ENGINE_NAME, ENGINE_VERSION, CHART_RULE_VERSION, PROMPT_VERSION, type ChartInput } from '@/lib/engine';
import { chartCacheKey } from '@/lib/chart-cache';
import { findCachedBasicReportId } from '@/lib/report-cache';
import { generateBasicReading } from '@/lib/ai';
import { isDemoMode, generateDemoReading, DEMO, type DemoReport } from '@/lib/demo';
import { checkRateLimit, clientKey } from '@/lib/rate-limit';
import { toPreviewChart } from '@/lib/chart-preview';
import { isLang, type Lang } from '@/lib/i18n';

export const runtime = 'nodejs';

/** 防滥用：演示模式放宽以便本地验证，正式模式按 IP 收紧。 */
const RATE_WINDOW_MS = 60_000;

/** 未指定档案名称时的默认标签（六语言），与排盘页口径一致。 */
const DEFAULT_PROFILE_LABEL: Record<Lang, string> = {
  zh: '我的命盘',
  en: 'My Chart',
  es: 'Mi carta',
  fr: 'Mon thème',
  de: 'Mein Horoskop',
  ja: '私の命盤',
};

export async function POST(request: Request) {
  // 限流须在解析请求体之前，避免被畸形请求绕过。
  const demo = isDemoMode();
  const limit = demo ? 30 : 10;
  const rl = checkRateLimit(clientKey(request, 'reading'), limit, RATE_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', retryAfter: rl.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  try {
    const body = await request.json() as ChartInput & {
      lang?: Lang;
      idempotencyKey?: string;
      profileId?: string;
      profileLabel?: string;
    };
    // 语言校验：缺失默认 zh；存在但非法返回 400。body 来自 JSON，须按 unknown 运行时校验。
    const rawLang = body.lang as unknown;
    let lang: Lang;
    if (rawLang === undefined) {
      lang = 'zh';
    } else if (!isLang(rawLang)) {
      return NextResponse.json({ error: 'INVALID_LANGUAGE' }, { status: 400 });
    } else {
      lang = rawLang;
    }

    // 演示模式：真实引擎排盘，解读用本地模板，报告对象返回前端存入本地存储。
    if (isDemoMode()) {
      const { demoStore } = await import('@/lib/demo');
      // 若指定了已保存的出生档案，用档案数据覆盖表单数据，实现档案复用。
      let input: ChartInput = body;
      let profileLabel = body.profileLabel;
      if (body.profileId) {
        const saved = demoStore.getBirthProfile(body.profileId);
        if (!saved) return NextResponse.json({ error: 'PROFILE_NOT_FOUND' }, { status: 404 });
        input = {
          birthDate: saved.birthDate,
          birthTime: saved.birthTime,
          timeKnown: saved.timeKnown,
          birthPlace: saved.birthPlace,
          timezone: saved.timezone,
          longitude: saved.longitude === '' ? null : Number(saved.longitude),
          gender: saved.gender,
        };
        profileLabel = saved.label;
      }
      if (!input.birthDate || !input.birthPlace || !input.timezone) {
        return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
      }
      if (input.gender !== 'male' && input.gender !== 'female') {
        return NextResponse.json({ error: 'INVALID_GENDER' }, { status: 400 });
      }
      const built = buildChart(input, lang);
      const facts = chartFacts(built.chart, built.timeNote, lang, built.timeStatus, built.hasDST);
      const report: DemoReport = {
        id: crypto.randomUUID(),
        language: lang,
        report_type: 'basic',
        created_at: new Date().toISOString(),
        content: generateDemoReading(facts, lang),
        chart: built.chart,
        cacheKey: chartCacheKey({ ...input, name: profileLabel || DEFAULT_PROFILE_LABEL[lang] }),
        profile: {
          label: profileLabel || DEFAULT_PROFILE_LABEL[lang],
          birthDate: input.birthDate,
          birthTime: input.birthTime,
          birthPlace: input.birthPlace,
          timezone: input.timezone,
          timeKnown: input.timeKnown,
        },
      };
      return NextResponse.json({ reportId: report.id, report, demo: DEMO });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 未登录访客：不写库、不占用免费额度，直接返回基础解读，先把价值给到人。
    // 单独收紧 IP 限流，避免被当成免费生成接口刷。
    if (!user) {
      const anonRl = checkRateLimit(clientKey(request, 'reading-anon'), 5, 10 * 60_000);
      if (!anonRl.ok) {
        return NextResponse.json(
          { error: 'RATE_LIMITED', retryAfter: anonRl.retryAfter },
          { status: 429, headers: { 'Retry-After': String(anonRl.retryAfter) } },
        );
      }
      const input: ChartInput = body;
      if (!input.birthDate || !input.birthPlace || !input.timezone) {
        return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
      }
      if (input.gender !== 'male' && input.gender !== 'female') {
        return NextResponse.json({ error: 'INVALID_GENDER' }, { status: 400 });
      }
      const built = buildChart(input, lang);
      const facts = chartFacts(built.chart, built.timeNote, lang, built.timeStatus, built.hasDST);
      const label = body.profileLabel || DEFAULT_PROFILE_LABEL[lang];
      const report: DemoReport = {
        id: crypto.randomUUID(),
        language: lang,
        report_type: 'basic',
        created_at: new Date().toISOString(),
        content: generateDemoReading(facts, lang, { variant: 'preview' }),
        // 未付费访客只拿到预览盘：十二宫骨架 + 主星名，完整星曜/四化/大限不下发。
        chart: toPreviewChart(built.chart),
        cacheKey: chartCacheKey({ ...input, name: label }),
        profile: {
          label,
          birthDate: input.birthDate,
          birthTime: input.birthTime,
          birthPlace: input.birthPlace,
          timezone: input.timezone,
          timeKnown: input.timeKnown,
        },
      };
      return NextResponse.json({ reportId: report.id, report, anonymous: true });
    }

    if (!body.idempotencyKey || body.idempotencyKey.length < 8) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }
    const admin = createAdmin();

    // 复用已保存的出生档案：前端只传 profileId，出生资料由服务端补全。
    let input: ChartInput = body;
    let profileLabel = body.profileLabel;
    let profileId = body.profileId as string | undefined;
    if (profileId) {
      const { data: saved } = await admin
        .from('birth_profiles')
        .select('id, user_id, label, birth_date, birth_time, birth_time_known, birth_place, timezone, chart_preferences')
        .eq('id', profileId)
        .maybeSingle();
      if (!saved || saved.user_id !== user.id) {
        return NextResponse.json({ error: 'PROFILE_NOT_FOUND' }, { status: 404 });
      }
      const prefs = (saved.chart_preferences ?? {}) as { gender?: string; longitude?: number | null };
      input = {
        ...body,
        birthDate: saved.birth_date,
        // Postgres time 带秒（10:10:00），排盘引擎只接受 HH:MM。
        birthTime: String(saved.birth_time ?? '12:00').slice(0, 5),
        timeKnown: saved.birth_time_known,
        birthPlace: saved.birth_place ?? '',
        timezone: saved.timezone,
        longitude: prefs.longitude ?? null,
        gender: prefs.gender === 'female' ? 'female' : 'male',
      };
      profileLabel = saved.label;
    }

    if (input.gender !== 'male' && input.gender !== 'female') {
      return NextResponse.json({ error: 'INVALID_GENDER' }, { status: 400 });
    }
    if (!input.timezone || !input.birthDate || !input.birthPlace) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }

    // 同一命盘已有基础解读：直接返回，不扣额度、不新建命盘、不调用 AI。
    // 身份 = 姓名 + 出生资料（与网络/IP 无关），同一账号换 WiFi 也命中同一份。
    const cachedReportId = await findCachedBasicReportId(
      admin,
      user.id,
      { ...input, name: profileLabel || DEFAULT_PROFILE_LABEL[lang] },
      lang,
    );
    if (cachedReportId) {
      return NextResponse.json({ reportId: cachedReportId, cached: true });
    }

    const built = buildChart(input, lang);

    // 没有指定档案时，按表单数据新建一份。
    if (!profileId) {
      const { data: created, error: profileError } = await admin
        .from('birth_profiles')
        .insert({
          user_id: user.id,
          label: profileLabel || DEFAULT_PROFILE_LABEL[lang],
          birth_date: input.birthDate,
          birth_time: input.timeKnown ? input.birthTime : null,
          birth_time_known: input.timeKnown,
          birth_place: input.birthPlace,
          timezone: input.timezone,
          utc_offset: built.utcOffset || null,
          chart_preferences: {
            ...(input.longitude != null ? { longitude: input.longitude } : {}),
            gender: input.gender,
          },
        })
        .select('id')
        .single();
      if (profileError) throw profileError;
      profileId = created.id;
    }

    const { data: chartRow, error: chartError } = await admin
      .from('charts')
      .insert({
        user_id: user.id,
        birth_profile_id: profileId,
        chart_data: built.chart,
        engine_name: ENGINE_NAME,
        engine_version: ENGINE_VERSION,
        chart_rule_version: CHART_RULE_VERSION,
      })
      .select('id')
      .single();
    if (chartError) throw chartError;

    const { data: jobId, error: reserveError } = await supabase.rpc('reserve_free_basic_reading', {
      p_chart_id: chartRow.id,
      p_language: lang,
      p_idempotency_key: body.idempotencyKey,
    });
    if (reserveError) {
      const message = reserveError.message || '';
      if (message.includes('FREE_READING_UNAVAILABLE')) {
        return NextResponse.json({ error: 'FREE_USED' }, { status: 403 });
      }
      if (message.includes('EMAIL_NOT_VERIFIED') || message.includes('IDENTITY_NOT_VERIFIED')) {
        return NextResponse.json({ error: 'NEED_VERIFY' }, { status: 403 });
      }
      throw reserveError;
    }

    // 重试同一个幂等键时，若报告已成功生成，直接返回，不重复调用 AI。
    const { data: existingJob } = await admin
      .from('generation_jobs')
      .select('status, report_id')
      .eq('id', jobId as string)
      .single();
    if (existingJob?.status === 'succeeded') {
      return NextResponse.json({ reportId: existingJob.report_id });
    }

    try {
      const facts = chartFacts(built.chart, built.timeNote, lang, built.timeStatus, built.hasDST);
      const { content, model } = await generateBasicReading(facts, lang);

      const { error: completeError } = await supabase.rpc('complete_generation', {
        p_job_id: jobId as string,
        p_content: content,
        p_ai_model: model,
        p_prompt_version: PROMPT_VERSION,
      });
      if (completeError) throw completeError;

      const { data: done } = await admin
        .from('generation_jobs')
        .select('report_id')
        .eq('id', jobId as string)
        .single();

      return NextResponse.json({ reportId: done?.report_id });
    } catch (aiError) {
      await supabase.rpc('fail_generation', {
        p_job_id: jobId as string,
        p_error_code: 'AI_FAILED',
      });
      const detail = aiError instanceof Error ? aiError.message : 'AI_FAILED';
      return NextResponse.json({ error: 'AI_FAILED', detail }, { status: 502 });
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'UNKNOWN';
    if (detail === 'INVALID_TIMEZONE') {
      return NextResponse.json({ error: 'INVALID_TIMEZONE' }, { status: 400 });
    }
    return NextResponse.json({ error: 'SERVER_ERROR', detail }, { status: 500 });
  }
}
