import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

/**
 * 命盘付费墙的数据库层验收测试（本地临时 Postgres，不连接生产库）。
 *
 * 目的：RLS / SECURITY DEFINER 这类权限改动必须先在这里验证，通过评审后才上生产。
 * 覆盖：
 *   1. 免费用户只能拿到预览盘（十二宫骨架 + 主星，无四化/亮度/大限）；
 *   2. 已购用户拿到完整盘；
 *   3. 别人的报告与盘面一律不可见；
 *   4. 退款锁定的报告不可见、盘面返回空；
 *   5. 007 之后 authenticated 不能直读 charts（006 之前可以直读，因此必须收紧）。
 */

const U_FREE = '11111111-1111-1111-1111-111111111111';
const U_PAID = '22222222-2222-2222-2222-222222222222';
const U_OTHER = '33333333-3333-3333-3333-333333333333';
const U_REFUNDED = '44444444-4444-4444-4444-444444444444';

const SCHEMA = readFileSync('schema.sql', 'utf8');
const MIGRATION_FILES = [
  'migrations/001_payments.sql',
  'migrations/004_refund_lock.sql',
  'migrations/006_chart_paywall.sql',
];
const LOCKDOWN = readFileSync('migrations/007_chart_rls_lockdown.sql', 'utf8');

/** Supabase 默认提供的基础对象（本地库需要自己补）。 */
const SUPABASE_STUBS = `
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key,
  email text,
  email_confirmed_at timestamptz,
  phone text,
  phone_confirmed_at timestamptz,
  raw_user_meta_data jsonb default '{}'::jsonb
);
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin; exception when duplicate_object then null; end $$;
grant usage on schema auth to anon, authenticated, service_role;
`;

/** 一张完整的假命盘，结构对齐排盘引擎实际输出。 */
function makeChart() {
  const names = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'];
  return {
    birthInfo: { year: 1990, month: 6, day: 15, hour: 14, gender: 'female', city: '上海' },
    lunarInfo: { lunarYear: 1990, lunarMonth: 5, lunarDay: 23 },
    mingGongBranch: 0,
    shenGongBranch: 6,
    wuxingJu: 3,
    wuxingJuName: '水二局',
    ziweiPos: 0,
    mingZhu: '贪狼',
    shenZhu: '天相',
    yinYangGender: '阴女',
    currentAge: 37,
    currentDaXianIndex: 3,
    daXians: names.map((name, i) => ({ label: `${5 + i * 10}–${14 + i * 10} 岁 · ${name}`, text: 'x' })),
    palaces: names.map((name, i) => ({
      branch: i,
      stem: i % 10,
      name,
      isMingGong: i === 0,
      isShenGong: i === 6,
      isCurrentDaXian: i === 3,
      isEmpty: false,
      changsheng12: '长生',
      boshi12: '博士',
      oppositeBranch: (i + 6) % 12,
      borrowedStars: i === 5 ? ['天机'] : [],
      daXianAge: [5 + i * 10, 14 + i * 10],
      stars: [
        { name: '紫微', type: 'major', brightnessRaw: '庙', ...(i === 0 ? { siHua: '禄' } : {}) },
        { name: '左辅', type: 'lucky', brightnessRaw: '得' },
        { name: '擎羊', type: 'sha' },
      ],
    })),
  };
}

type SeedIds = { bf: string; ch: string; rp: string };

async function boot(withLockdown: boolean) {
  const db = new PGlite();
  await db.exec(SUPABASE_STUBS);
  await db.exec(SCHEMA);
  for (const file of MIGRATION_FILES) await db.exec(readFileSync(file, 'utf8'));
  if (withLockdown) await db.exec(LOCKDOWN);
  const ids = await seed(db);
  return { db, ids };
}

async function seed(db: PGlite) {
  await db.exec(`
insert into auth.users (id, email) values
  ('${U_FREE}', 'free@example.com'),
  ('${U_PAID}', 'paid@example.com'),
  ('${U_OTHER}', 'other@example.com'),
  ('${U_REFUNDED}', 'refunded@example.com');
`);
  const chart = JSON.stringify(makeChart());
  const ids = new Map<string, SeedIds>();
  for (const uid of [U_FREE, U_PAID, U_OTHER, U_REFUNDED]) {
    const row = { bf: randomUUID(), ch: randomUUID(), rp: randomUUID() };
    ids.set(uid, row);
    await db.query(
      `insert into public.birth_profiles (id, user_id, label, birth_date, birth_time, birth_place, timezone)
       values ($1, $2, '样例', '1990-06-15', '14:30', '上海', 'Asia/Shanghai')`,
      [row.bf, uid],
    );
    await db.query(
      `insert into public.charts (id, user_id, birth_profile_id, chart_data, engine_name, engine_version, chart_rule_version)
       values ($1, $2, $3, $4::jsonb, 'ziwei', '1', '1')`,
      [row.ch, uid, row.bf, chart],
    );
    await db.query(
      `insert into public.reports (id, user_id, chart_id, report_type, language, content, status)
       values ($1, $2, $3, 'basic', 'zh', '{"overview":"x"}'::jsonb, 'completed')`,
      [row.rp, uid, row.ch],
    );
  }
  // 已购用户：用户级永久权益
  await db.query(
    `insert into public.user_entitlements (user_id, benefit_code, status) values ($1, 'full_report', 'available')`,
    [U_PAID],
  );
  // 退款用户：报告已锁定
  await db.query(`update public.reports set locked_at = now() where id = $1`, [ids.get(U_REFUNDED)!.rp]);
  return ids;
}

async function asUser(db: PGlite, uid: string) {
  await db.exec(`reset role`);
  await db.exec(`select set_config('request.jwt.claim.sub', '${uid}', false)`);
  await db.exec(`set role authenticated`);
}

async function asAnon(db: PGlite) {
  await db.exec(`reset role`);
  await db.exec(`select set_config('request.jwt.claim.sub', '', false)`);
  await db.exec(`set role anon`);
}

async function chartOf(db: PGlite, reportId: string) {
  const res = await db.query<{ payload: Record<string, unknown> | null }>(
    `select public.get_report_chart($1) as payload`,
    [reportId],
  );
  return res.rows[0].payload;
}

test('免费用户：预览盘只有十二宫骨架与主星', async () => {
  const { db, ids } = await boot(true);
  await asUser(db, U_FREE);
  const payload = (await chartOf(db, ids.get(U_FREE)!.rp))!;
  assert.equal(payload.full, false);

  const chart = payload.chart as Record<string, any>;
  assert.equal(chart.palaces.length, 12);
  assert.equal(chart.daXians, undefined, '预览盘不应包含大限表');
  assert.equal(chart.currentAge, undefined, '预览盘不应包含当前虚岁');
  assert.equal(chart.mingGongBranch, 0);

  for (const palace of chart.palaces) {
    assert.equal(palace.changsheng12, undefined);
    assert.equal(palace.boshi12, undefined);
    assert.equal(palace.daXianAge, undefined);
    assert.equal(palace.isCurrentDaXian, undefined);
    for (const star of palace.stars) {
      assert.equal(star.type, 'major');
      assert.equal(star.brightnessRaw, undefined);
      assert.equal(star.siHua, undefined);
    }
  }
  assert.ok(chart.palaces[0].isMingGong);
  assert.ok(chart.palaces[6].isShenGong);
  await db.close();
});

test('免费用户：直读 charts 表被拒绝（007 生效）', async () => {
  const { db } = await boot(true);
  await asUser(db, U_FREE);
  await assert.rejects(
    () => db.query(`select chart_data from public.charts where user_id = $1`, [U_FREE]),
    /permission denied/i,
  );
  await db.close();
});

test('007 之前 charts 可被本人直读（证明收紧是必要的）', async () => {
  const { db } = await boot(false);
  await asUser(db, U_FREE);
  const res = await db.query(`select chart_data from public.charts where user_id = $1`, [U_FREE]);
  assert.equal(res.rows.length, 1);
  await db.close();
});

test('已购用户：返回完整盘面', async () => {
  const { db, ids } = await boot(true);
  await asUser(db, U_PAID);
  const payload = (await chartOf(db, ids.get(U_PAID)!.rp))!;
  assert.equal(payload.full, true);
  const chart = payload.chart as Record<string, any>;
  assert.equal(chart.daXians.length, 12);
  assert.equal(chart.palaces[0].stars.length, 3);
  assert.equal(chart.palaces[0].stars[0].siHua, '禄');
  assert.equal(chart.palaces[0].stars[1].brightnessRaw, '得');
  await db.close();
});

test('跨账号：读不到别人的报告与盘面', async () => {
  const { db, ids } = await boot(true);
  await asUser(db, U_OTHER);
  const freeReport = ids.get(U_FREE)!.rp;
  assert.equal(await chartOf(db, freeReport), null);
  const reports = await db.query(`select id from public.reports where id = $1`, [freeReport]);
  assert.equal(reports.rows.length, 0);
  await db.close();
});

test('退款锁定：报告不可见且盘面为空', async () => {
  const { db, ids } = await boot(true);
  await asUser(db, U_REFUNDED);
  const report = ids.get(U_REFUNDED)!.rp;
  assert.equal(await chartOf(db, report), null);
  const reports = await db.query(`select id from public.reports where id = $1`, [report]);
  assert.equal(reports.rows.length, 0);
  await db.close();
});

test('匿名：既不能读 charts，也不能调用盘面函数', async () => {
  const { db, ids } = await boot(true);
  await asAnon(db);
  await assert.rejects(
    () => db.query(`select chart_data from public.charts`),
    /permission denied/i,
  );
  await assert.rejects(
    () => db.query(`select public.get_report_chart($1)`, [ids.get(U_FREE)!.rp]),
    /permission denied/i,
  );
  await db.close();
});
