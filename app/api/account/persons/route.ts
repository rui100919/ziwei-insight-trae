import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { isDemoMode } from '@/lib/demo';

export const runtime = 'nodejs';

/** 报告列表的一行（不含正文，只带一段摘要）。 */
type ReportRow = {
  id: string;
  report_type: string;
  status: string;
  created_at: string;
  locked: boolean;
  overview: string | null;
};

/** 「一个人」= 同姓名 + 同出生日期 + 同地点；一个框里放这个人的基础解读与完整解读。 */
type Person = {
  key: string;
  label: string;
  birthDate: string;
  birthPlace: string;
  timeKnown: boolean;
  birthTime: string | null;
  reports: ReportRow[];
};

type ChartEmbed = {
  birth_profiles: {
    label: string | null;
    birth_date: string | null;
    birth_place: string | null;
    birth_time: string | null;
    birth_time_known: boolean | null;
  } | null;
};

function identity(label: string, birthDate: string, birthPlace: string): string {
  return `${label.trim()}|${birthDate.trim()}|${birthPlace.trim()}`;
}

/** 按人聚合报告：同人（姓名 + 出生日期 + 地点）合成一个卡片，基础/完整各一份。 */
export async function GET() {
  if (isDemoMode()) return NextResponse.json({ persons: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'NEED_LOGIN' }, { status: 401 });

  // 用 service_role 读：报告列表需要出生档案的姓名/地点，而 charts 表已对前端封闭。
  const { data, error } = await createAdmin()
    .from('reports')
    .select(
      'id, report_type, status, created_at, locked_at, content, charts!inner(birth_profiles(label, birth_date, birth_place, birth_time, birth_time_known))',
    )
    .eq('user_id', user.id)
    .neq('status', 'deleted')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const persons = new Map<string, Person>();
  for (const row of (data ?? []) as unknown as Array<Record<string, unknown>>) {
    const chart = row.charts as ChartEmbed | null;
    const bp = chart?.birth_profiles ?? null;
    const label = bp?.label?.trim() || '';
    const birthDate = bp?.birth_date ?? '';
    const birthPlace = bp?.birth_place ?? '';
    const key = identity(label, birthDate, birthPlace);
    let person = persons.get(key);
    if (!person) {
      person = {
        key,
        label,
        birthDate,
        birthPlace,
        timeKnown: Boolean(bp?.birth_time_known),
        birthTime: bp?.birth_time ? String(bp.birth_time).slice(0, 5) : null,
        reports: [],
      };
      persons.set(key, person);
    }
    const content = (row.content ?? null) as { overview?: string } | null;
    person.reports.push({
      id: String(row.id),
      report_type: String(row.report_type),
      status: String(row.status),
      created_at: String(row.created_at),
      locked: row.locked_at !== null && row.locked_at !== undefined,
      overview: content?.overview ? String(content.overview) : null,
    });
  }

  // 没有报告的出生档案也要出现在人物栏里（刚添加、还没生成的人）。
  const { data: profiles } = await createAdmin()
    .from('birth_profiles')
    .select('label, birth_date, birth_place, birth_time, birth_time_known, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  for (const p of (profiles ?? []) as Array<Record<string, unknown>>) {
    const label = String(p.label ?? '').trim();
    const birthDate = String(p.birth_date ?? '');
    const birthPlace = String(p.birth_place ?? '');
    const key = identity(label, birthDate, birthPlace);
    if (persons.has(key)) continue;
    persons.set(key, {
      key,
      label,
      birthDate,
      birthPlace,
      timeKnown: Boolean(p.birth_time_known),
      birthTime: p.birth_time ? String(p.birth_time).slice(0, 5) : null,
      reports: [],
    });
  }

  return NextResponse.json({ persons: Array.from(persons.values()) });
}