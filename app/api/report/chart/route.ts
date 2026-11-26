import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { toPreviewChart } from '@/lib/chart-preview';
import type { ZiweiChart } from '@/lib/ziwei/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 取某份报告的盘面 + 出生档案（仅本人可见）。
 *
 * 为什么不用数据库里的 get_report_chart：那个函数按「full_report 权益是否可用」
 * 判断能否看完整盘面；而付费权益在生成成功后会置为已消耗，导致用户看自己的
 * 已购完整报告时被判成未付费、只拿到预览盘。这里改为按报告本身判断：
 * 已生成的完整解读就是已付款产物，本人查看始终返回完整盘面。
 */
export async function GET(request: Request) {
  const reportId = new URL(request.url).searchParams.get('report');
  if (!reportId) return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'NEED_LOGIN' }, { status: 401 });

  const admin = createAdmin();
  const { data: report } = await admin
    .from('reports')
    .select('id, user_id, report_type, status, locked_at, language, chart_id')
    .eq('id', reportId)
    .maybeSingle();
  if (!report || report.user_id !== user.id) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }
  if (report.status === 'deleted' || report.locked_at) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const { data: chartRow } = await admin
    .from('charts')
    .select('chart_data, birth_profile_id')
    .eq('id', report.chart_id)
    .maybeSingle();
  if (!chartRow?.chart_data) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  const { data: bp } = await admin
    .from('birth_profiles')
    .select('label, birth_date, birth_time, birth_time_known, birth_place, timezone')
    .eq('id', chartRow.birth_profile_id)
    .maybeSingle();

  // 完整解读：本人查看一律给完整盘面；基础解读：仍按未使用的完整报告权益判断。
  let full = report.report_type === 'full';
  if (!full) {
    const { data: ent } = await admin
      .from('user_entitlements')
      .select('status')
      .eq('user_id', user.id)
      .eq('benefit_code', 'full_report')
      .eq('status', 'available')
      .maybeSingle();
    full = Boolean(ent);
  }

  return NextResponse.json({
    full,
    chart: full
      ? chartRow.chart_data
      : toPreviewChart(chartRow.chart_data as unknown as ZiweiChart),
    profile: bp ? {
      label: bp.label ?? '',
      birthDate: bp.birth_date ?? '',
      birthTime: bp.birth_time ? String(bp.birth_time).slice(0, 5) : '',
      timeKnown: Boolean(bp.birth_time_known),
      birthPlace: bp.birth_place ?? '',
      timezone: bp.timezone ?? '',
    } : null,
    language: report.language,
    reportType: report.report_type,
  });
}