import type { SupabaseClient } from '@supabase/supabase-js';
import type { ChartCacheInput } from '@/lib/chart-cache';
import type { Lang } from '@/lib/i18n';

/**
 * 报告缓存查询（服务端专用）。
 *
 * 「同一个人」= 姓名 + 出生日期 + 出生地点 三项一致（产品规则：一人一份）。
 * 基础解读：同人 + 同语言即可复用（内容不含年龄）。
 * 完整报告：同人 + 同虚岁 + 同语言才复用（内容含「当前大限/当前阶段」，跨年会变）。
 *
 * 全部按 user_id 限定，只复用用户自己的报告，不做跨账号共享。
 */

type AdminClient = SupabaseClient;

/** 归一化文本：去首尾空白、压缩连续空白、统一小写；缺失按空串处理。 */
function norm(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * 找出与本次输入「同一个人」的历史出生档案。
 *
 * 口径（产品规则）：姓名 + 出生日期 + 出生地点 三项都一致即视为同一个人，
 * 不再生成第二份；时辰/时区/性别只影响命盘本身，不参与「是不是同一个人」的判断。
 */
async function matchingProfileIds(
  admin: AdminClient,
  userId: string,
  input: ChartCacheInput,
): Promise<string[]> {
  const { data, error } = await admin
    .from('birth_profiles')
    .select('id, label, birth_place')
    .eq('user_id', userId)
    .eq('birth_date', input.birthDate);
  if (error || !data?.length) return [];

  const name = norm(input.name);
  const place = norm(input.birthPlace);
  return data
    .filter((p) => norm(p.label) === name && norm(p.birth_place) === place)
    .map((p) => String(p.id));
}

/** 这些档案下已经排过的命盘 id。 */
async function chartIdsFor(
  admin: AdminClient,
  userId: string,
  profileIds: string[],
): Promise<string[]> {
  if (!profileIds.length) return [];
  const { data, error } = await admin
    .from('charts')
    .select('id')
    .eq('user_id', userId)
    .in('birth_profile_id', profileIds);
  if (error || !data?.length) return [];
  return data.map((c) => String(c.id));
}

/** 在给定命盘里找最新一份已完成报告。 */
async function latestReportId(
  admin: AdminClient,
  userId: string,
  chartIds: string[],
  reportType: 'basic' | 'full',
  lang: Lang,
): Promise<string | null> {
  if (!chartIds.length) return null;
  const { data, error } = await admin
    .from('reports')
    .select('id')
    .eq('user_id', userId)
    .in('chart_id', chartIds)
    .eq('report_type', reportType)
    .eq('language', lang)
    .eq('status', 'completed')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data?.id) return null;
  return String(data.id);
}

/** 同一命盘已完成的基础解读（不随年龄变化）。 */
export async function findCachedBasicReportId(
  admin: AdminClient,
  userId: string,
  input: ChartCacheInput,
  lang: Lang,
): Promise<string | null> {
  const profiles = await matchingProfileIds(admin, userId, input);
  const charts = await chartIdsFor(admin, userId, profiles);
  return latestReportId(admin, userId, charts, 'basic', lang);
}

/** 同一命盘 + 同一虚岁的完整报告（当前大限/当前阶段随年龄变化）。 */
export async function findCachedFullReportId(
  admin: AdminClient,
  userId: string,
  input: ChartCacheInput,
  currentAge: number,
  lang: Lang,
): Promise<string | null> {
  const profiles = await matchingProfileIds(admin, userId, input);
  if (!profiles.length) return null;

  // 完整报告要连虚岁一起命中：跨年后当前大限会变，旧报告不应被复用。
  const { data, error } = await admin
    .from('charts')
    .select('id')
    .eq('user_id', userId)
    .in('birth_profile_id', profiles)
    .eq('chart_data->>currentAge', String(currentAge));
  if (error || !data?.length) return null;

  return latestReportId(admin, userId, data.map((c) => String(c.id)), 'full', lang);
}
