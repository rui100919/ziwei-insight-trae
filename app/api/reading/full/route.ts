import { NextResponse } from 'next/server';
import {
  buildChart,
  ENGINE_NAME,
  ENGINE_VERSION,
  CHART_RULE_VERSION,
  type ChartInput,
} from '@/lib/engine';
import { generateFullReading } from '@/lib/full-report';
import { isDemoMode, DEMO } from '@/lib/demo';
import { findCachedFullReportId } from '@/lib/report-cache';
import { checkRateLimit, clientKey } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { isLang, type Lang } from '@/lib/i18n';
import { SAMPLE_BIRTH, SAMPLE_PROFILE_LABEL } from '@/lib/sample-birth';

export const runtime = 'nodejs';

/** 防滥用：完整报告更重，正式模式限流更严。 */
const RATE_WINDOW_MS = 60_000;

/** 未指定档案名称时完整报告的默认标签（六语言）。 */
const DEFAULT_PROFILE_LABEL: Record<Lang, string> = {
  zh: '我的完整命盘',
  en: 'My full chart',
  es: 'Mi carta completa',
  fr: 'Mon thème complet',
  de: 'Mein vollständiges Horoskop',
  ja: '私の完全な命盤',
};

/** 付费完整报告：样品只返回节选；正式报告校验权益后事务性保存。 */
export async function POST(request: Request) {
  const demo = isDemoMode();
  const limit = demo ? 30 : 6;
  const rl = checkRateLimit(clientKey(request, 'reading-full'), limit, RATE_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', retryAfter: rl.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  try {
    const body = await request.json() as ChartInput & {
      lang?: Lang;
      sample?: boolean;
      idempotencyKey?: string;
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
    const isSample = body.sample === true;

    // 样例请求完全忽略客户端出生字段：固定使用服务端的虚构样例资料，
    // 避免把访客真实出生资料渲染成「示例命盘」。
    if (!isSample && (!body.birthDate || !body.birthPlace || !body.timezone || (body.timeKnown === true && !body.birthTime))) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }
    if (!isSample && body.gender !== 'male' && body.gender !== 'female') {
      return NextResponse.json({ error: 'INVALID_GENDER' }, { status: 400 });
    }
    if (!demo && !isSample && (!body.idempotencyKey || body.idempotencyKey.length < 8)) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }

    // 正式生成先做一次权限预检；数据库函数仍会再次校验，不能靠客户端绕过。
    const supabase = !demo && !isSample ? await createClient() : null;
    let userId: string | null = null;
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'NEED_LOGIN' }, { status: 401 });
      userId = user.id;
      const { data: ent } = await supabase
        .from('user_entitlements')
        .select('status')
        .eq('user_id', user.id)
        .eq('benefit_code', 'full_report')
        .eq('status', 'available')
        .maybeSingle();
      if (!ent) return NextResponse.json({ error: 'PAYMENT_REQUIRED' }, { status: 402 });
    }

    const birth = isSample
      ? SAMPLE_BIRTH
      : {
          birthDate: body.birthDate,
          birthTime: body.birthTime,
          timeKnown: body.timeKnown === true,
          birthPlace: body.birthPlace,
          timezone: body.timezone,
          longitude: body.longitude,
          gender: body.gender,
        };
    const input = { ...birth };
    const built = buildChart(input, lang);
    const profileLabel = isSample
      ? SAMPLE_PROFILE_LABEL
      : typeof body.profileLabel === 'string' && body.profileLabel.trim()
        ? body.profileLabel
        : DEFAULT_PROFILE_LABEL[lang];

    // 同一命盘 + 同一虚岁已有完整报告：直接复用，不重复落库、不重复生成。
    // 身份 = 姓名 + 出生资料（与网络/IP 无关）；只对「正式保存」请求生效，样品仍即时生成。
    if (userId) {
      const cachedReportId = await findCachedFullReportId(
        createAdmin(),
        userId,
        { ...input, name: profileLabel },
        built.chart.currentAge,
        lang,
      );
      if (cachedReportId) {
        return NextResponse.json({ reportId: cachedReportId, cached: true });
      }
    }

    const content = generateFullReading(built.chart, built.timeNote, lang, {
      timeStatus: built.timeStatus,
      hasDST: built.hasDST,
    });
    const meta = {
      birthInfo: built.chart.birthInfo,
      wuxingJu: built.chart.wuxingJuName,
      mingZhu: built.chart.mingZhu,
      lunar: built.chart.lunarInfo,
      currentAge: built.chart.currentAge,
      palaceCount: built.chart.palaces?.length ?? 0,
      daXianCount: built.chart.daXians?.length ?? 0,
    };

    // 演示模式保留完整本地样品，且不写远端账户。
    if (demo) return NextResponse.json({ demo: DEMO, content, meta });

    // 正式环境的免费样品只返回节选，付费章节不会随响应下发。
    if (isSample) {
      return NextResponse.json({
        demo: DEMO,
        content: {
          overview: content.overview,
          personality: content.personality,
          caveats: content.caveats,
        },
        meta,
      });
    }

    const { data: reportId, error: saveError } = await supabase!.rpc('create_full_report', {
      p_idempotency_key: body.idempotencyKey,
      p_profile_label: profileLabel,
      p_birth_date: input.birthDate,
      p_birth_time: input.timeKnown ? input.birthTime : null,
      p_birth_time_known: input.timeKnown,
      p_birth_place: input.birthPlace,
      p_timezone: input.timezone,
      p_utc_offset: built.utcOffset || null,
      // 性别一并落库：缓存键需要用它区分命盘，否则女性报告会因默认 male 而缓存不命中。
      p_chart_preferences: {
        ...(input.longitude != null ? { longitude: input.longitude } : {}),
        gender: input.gender,
      },
      p_chart_data: built.chart,
      p_language: lang,
      p_content: content,
      p_engine_name: ENGINE_NAME,
      p_engine_version: ENGINE_VERSION,
      p_chart_rule_version: CHART_RULE_VERSION,
      p_ai_model: 'local-template',
      p_prompt_version: 'full-plain-v1',
    });
    if (saveError) {
      const message = saveError.message || '';
      if (message.includes('PAYMENT_REQUIRED') || message.includes('AUTH_REQUIRED')) {
        return NextResponse.json({ error: 'PAYMENT_REQUIRED' }, { status: 402 });
      }
      if (message.includes('IDEMPOTENCY_KEY_REUSED')) {
        return NextResponse.json({ error: 'IDEMPOTENCY_KEY_REUSED' }, { status: 409 });
      }
      throw saveError;
    }

    return NextResponse.json({ reportId });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'UNKNOWN';
    if (detail === 'INVALID_TIMEZONE') {
      return NextResponse.json({ error: 'INVALID_TIMEZONE' }, { status: 400 });
    }
    return NextResponse.json({ error: 'SERVER_ERROR', detail }, { status: 500 });
  }
}
