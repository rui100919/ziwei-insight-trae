import { NextResponse } from 'next/server';
import {
  buildChart,
  ENGINE_NAME,
  ENGINE_VERSION,
  CHART_RULE_VERSION,
} from '@/lib/engine';
import { generateFullReading } from '@/lib/full-report';
import { checkRateLimit, clientKey } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { isLang } from '@/lib/i18n';

export const runtime = 'nodejs';

/**
 * 由已保存的基础报告升级为完整报告。
 *
 * 出生资料与盘面全部取自该报告自己的记录，不接受前端传入的出生字段；
 * 权益校验在 create_full_report 内完成（未购买返回 PAYMENT_REQUIRED），
 * 因此不能通过改参数绕过付费。
 */
export async function POST(request: Request) {
  const rl = checkRateLimit(clientKey(request, 'report-full'), 6, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', retryAfter: rl.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  try {
    const body = (await request.json()) as { reportId?: string };
    if (!body.reportId) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return NextResponse.json({ error: 'NEED_LOGIN' }, { status: 401 });

    const admin = createAdmin();
    const { data: row } = await admin
      .from('reports')
      .select('id, user_id, language, report_type, status, locked_at, chart_id')
      .eq('id', body.reportId)
      .maybeSingle();
    if (!row || row.user_id !== user.id) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }
    if (row.locked_at) {
      return NextResponse.json({ error: 'REPORT_LOCKED' }, { status: 403 });
    }
    if (row.report_type === 'full') {
      return NextResponse.json({ reportId: row.id, cached: true });
    }

    const { data: chartRow } = await admin
      .from('charts')
      .select('chart_data, birth_profile:birth_profiles(label, birth_date, birth_time, birth_time_known, birth_place, timezone, utc_offset, chart_preferences)')
      .eq('id', row.chart_id)
      .maybeSingle();
    const profile = (chartRow as unknown as {
      birth_profile?: {
        label: string;
        birth_date: string;
        birth_time: string | null;
        birth_time_known: boolean;
        birth_place: string | null;
        timezone: string;
        utc_offset: string | null;
        chart_preferences: Record<string, unknown> | null;
      } | null;
    } | null)?.birth_profile;
    if (!profile) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const lang = isLang(row.language) ? row.language : 'zh';
    const prefs = profile.chart_preferences ?? {};
    const gender = prefs.gender === 'male' ? 'male' : 'female';
    const built = buildChart(
      {
        birthDate: profile.birth_date,
        birthTime: profile.birth_time ? profile.birth_time.slice(0, 5) : '',
        timeKnown: profile.birth_time_known,
        birthPlace: profile.birth_place ?? '',
        timezone: profile.timezone,
        longitude: typeof prefs.longitude === 'number' ? prefs.longitude : null,
        gender,
      },
      lang,
    );

    const content = generateFullReading(built.chart, built.timeNote, lang, {
      timeStatus: built.timeStatus,
      hasDST: built.hasDST,
    });

    const { data: reportId, error } = await supabase.rpc('create_full_report', {
      p_idempotency_key: `upgrade-${row.id}`,
      p_profile_label: profile.label,
      p_birth_date: profile.birth_date,
      p_birth_time: profile.birth_time_known ? profile.birth_time : null,
      p_birth_time_known: profile.birth_time_known,
      p_birth_place: profile.birth_place,
      p_timezone: profile.timezone,
      p_utc_offset: profile.utc_offset,
      p_chart_preferences: prefs,
      p_chart_data: built.chart,
      p_language: lang,
      p_content: content,
      p_engine_name: ENGINE_NAME,
      p_engine_version: ENGINE_VERSION,
      p_chart_rule_version: CHART_RULE_VERSION,
      p_ai_model: 'local-template',
      p_prompt_version: 'full-plain-v1',
    });

    if (error) {
      const message = error.message || '';
      if (message.includes('PAYMENT_REQUIRED') || message.includes('AUTH_REQUIRED')) {
        return NextResponse.json({ error: 'PAYMENT_REQUIRED' }, { status: 402 });
      }
      if (message.includes('IDEMPOTENCY_KEY_REUSED')) {
        return NextResponse.json({ error: 'IDEMPOTENCY_KEY_REUSED' }, { status: 409 });
      }
      throw error;
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
