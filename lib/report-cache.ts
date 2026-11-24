import type { SupabaseClient } from '@supabase/supabase-js';
import { chartCacheKey, type ChartCacheInput } from '@/lib/chart-cache';
import type { Lang } from '@/lib/i18n';

/**
 * 报告缓存查询（服务端专用）。
 *
 * 基础解读：同命盘 + 同语言即可复用（内容不含年龄）。
 * 完整报告：同命盘 + 同虚岁 + 同语言才复用（内容含「当前大限/当前阶段」，跨年会变）。
 *
 * 全部按 user_id 限定，只复用用户自己的报告，不做跨账号共享。
 */

type AdminClient = SupabaseClient;

/** 找出与本次输入指纹一致的历史出生档案（姓名 + 出生资料一起比对）。 */
async function matchingProfileIds(
  admin: AdminClient,
  userId: string,
  input: ChartCacheInput,
): Promise<string[]> {
  const target = chartCacheKey(input);

  // 先用出生日期 + 时区缩小候选档案，再在内存里比对指纹（姓名/时辰/经度/性别）。
  const { data, error } = await admin
    .from('birth_profiles')
    .select('id, label, birth_time, birth_time_known, chart_preferences')
    .eq('user_id', userId)
    .eq('birth_date', input.birthDate)
    .eq('timezone', input.timezone);
  if (error || !data?.length) return [];

  return data
    .filter((p) => {
      const prefs = (p.chart_preferences ?? {}) as { gender?: string; longitude?: number | string | null };
      return chartCacheKey({
        name: String(p.label ?? ''),
        birthDate: input.birthDate,
        birthTime: String(p.birth_time ?? ''),
        timeKnown: Boolean(p.birth_time_known),
        timezone: input.timezone,
        longitude: prefs.longitude ?? null,
        gender: prefs.gender === 'female' ? 'female' : 'male',
      }) === target;
    })
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
