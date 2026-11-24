import { test } from 'node:test';
import assert from 'node:assert/strict';

import { chartCacheKey } from '../lib/chart-cache';
import { findCachedBasicReportId, findCachedFullReportId } from '../lib/report-cache';
import type { ChartInput } from '../lib/engine';

/**
 * 缓存命中逻辑的单元测试。
 * 用内存假客户端替代 Supabase，不连真实数据库；重点验证：
 *   1) 指纹一致才命中；
 *   2) 基础解读不按年龄过滤，完整报告必须同虚岁；
 *   3) 语言、状态、软删除、user_id 隔离都会让缓存落空。
 */

type Row = Record<string, unknown>;
type Filter = { column: string; op: 'eq' | 'in' | 'is'; value: unknown };

/** 支持 `chart_data->>currentAge` 形式的 JSON 取值。 */
function valueAt(row: Row, column: string): unknown {
  const [head, jsonKey] = column.split('->>');
  if (jsonKey) {
    const nested = row[head];
    return nested && typeof nested === 'object' ? (nested as Row)[jsonKey] : undefined;
  }
  return row[head];
}

function matches(row: Row, f: Filter): boolean {
  const actual = valueAt(row, f.column);
  if (f.op === 'eq') return String(actual) === String(f.value);
  if (f.op === 'in') return (f.value as unknown[]).map(String).includes(String(actual));
  // is(null) 同时把缺失字段视为 null，贴近 PostgREST 的语义。
  return f.value === null ? actual === null || actual === undefined : actual === f.value;
}

/** 最小 Supabase 查询链：select / eq / in / is / order / limit / maybeSingle / then。 */
function makeAdmin(tables: Record<string, Row[]>) {
  const calls: Array<{ table: string; filters: Filter[] }> = [];

  function from(table: string) {
    const filters: Filter[] = [];
    calls.push({ table, filters });

    const rows = () => (tables[table] ?? []).filter((row) => filters.every((f) => matches(row, f)));
    const builder = {
      select: () => builder,
      eq: (column: string, value: unknown) => {
        filters.push({ column, op: 'eq', value });
        return builder;
      },
      in: (column: string, values: unknown[]) => {
        filters.push({ column, op: 'in', value: values });
        return builder;
      },
      is: (column: string, value: unknown) => {
        filters.push({ column, op: 'is', value });
        return builder;
      },
      order: () => builder,
      limit: () => builder,
      maybeSingle: () => Promise.resolve({ data: rows()[0] ?? null, error: null }),
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve({ data: rows(), error: null }).then(resolve),
    };
    return builder;
  }

  return {
    client: { from } as unknown as Parameters<typeof findCachedBasicReportId>[0],
    calls,
  };
}

const INPUT: ChartInput = {
  birthDate: '1990-01-01',
  birthTime: '14:30',
  timeKnown: true,
  birthPlace: '北京',
  timezone: 'Asia/Shanghai',
  longitude: 116.4,
  gender: 'male',
};

const PROFILE: Row = {
  id: 'p1',
  user_id: 'u1',
  birth_date: '1990-01-01',
  timezone: 'Asia/Shanghai',
  birth_time: '14:30:00',
  birth_time_known: true,
  chart_preferences: { gender: 'male', longitude: 116.4 },
};

const CHART: Row = {
  id: 'c1',
  user_id: 'u1',
  birth_profile_id: 'p1',
  chart_data: { currentAge: 38 },
};

function report(overrides: Row = {}): Row {
  return {
    id: 'r1',
    user_id: 'u1',
    chart_id: 'c1',
    report_type: 'basic',
    language: 'zh',
    status: 'completed',
    deleted_at: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function fixture(reports: Row[], profiles: Row[] = [PROFILE], charts: Row[] = [CHART]) {
  return makeAdmin({ birth_profiles: profiles, charts, reports });
}

// ── 指纹本身 ──────────────────────────────────────────────────────────

test('chartCacheKey：重复计算结果稳定', () => {
  const keys = new Set(Array.from({ length: 50 }, () => chartCacheKey(INPUT)));
  assert.equal(keys.size, 1);
});

test('chartCacheKey：格式差异归一（字符串经度、带秒的时间）', () => {
  assert.equal(chartCacheKey({ ...INPUT, longitude: '116.4' }), chartCacheKey(INPUT));
  assert.equal(chartCacheKey({ ...INPUT, birthTime: '14:30:00' }), chartCacheKey(INPUT));
});

test('chartCacheKey：时辰未知时忽略具体时间', () => {
  assert.equal(
    chartCacheKey({ ...INPUT, timeKnown: false, birthTime: '08:00' }),
    chartCacheKey({ ...INPUT, timeKnown: false, birthTime: '20:00' }),
  );
  assert.notEqual(chartCacheKey({ ...INPUT, timeKnown: false }), chartCacheKey(INPUT));
});

test('chartCacheKey：日期 / 时辰 / 经度 / 时区 / 性别不同则不相等', () => {
  const base = chartCacheKey(INPUT);
  assert.notEqual(chartCacheKey({ ...INPUT, birthDate: '1990-01-02' }), base);
  assert.notEqual(chartCacheKey({ ...INPUT, birthTime: '16:30' }), base);
  assert.notEqual(chartCacheKey({ ...INPUT, longitude: 121.47 }), base);
  assert.notEqual(chartCacheKey({ ...INPUT, timezone: 'Asia/Tokyo' }), base);
  assert.notEqual(chartCacheKey({ ...INPUT, gender: 'female' }), base);
});

test('chartCacheKey：姓名不同则不相等（同生辰的不同人区分开）', () => {
  const zhang = chartCacheKey({ ...INPUT, name: '张三' });
  const li = chartCacheKey({ ...INPUT, name: '李四' });
  assert.notEqual(zhang, li);
  assert.notEqual(zhang, chartCacheKey(INPUT));
});

test('chartCacheKey：姓名归一（首尾空白、连续空白、大小写）', () => {
  assert.equal(
    chartCacheKey({ ...INPUT, name: '  Zhang   San ' }),
    chartCacheKey({ ...INPUT, name: 'zhang san' }),
  );
});

// ── 基础解读缓存 ──────────────────────────────────────────────────────

test('基础解读：同命盘 + 同语言命中，且查询带 user_id 限定', async () => {
  const { client, calls } = fixture([report()]);
  const id = await findCachedBasicReportId(client, 'u1', INPUT, 'zh');

  assert.equal(id, 'r1');
  const profileCall = calls.find((c) => c.table === 'birth_profiles');
  assert.ok(profileCall?.filters.some((f) => f.column === 'user_id' && f.value === 'u1'));
  const reportCall = calls.find((c) => c.table === 'reports');
  assert.ok(reportCall?.filters.some((f) => f.column === 'user_id' && f.value === 'u1'));
});

test('基础解读：只查指纹匹配的档案，不匹配的档案不参与', async () => {
  const otherProfile: Row = {
    ...PROFILE,
    id: 'p2',
    birth_time: '10:00:00',
  };
  const { client, calls } = fixture(
    [report()],
    [otherProfile, PROFILE],
  );
  const id = await findCachedBasicReportId(client, 'u1', INPUT, 'zh');

  assert.equal(id, 'r1');
  const chartCall = calls.find((c) => c.table === 'charts');
  const profileFilter = chartCall?.filters.find((f) => f.column === 'birth_profile_id');
  assert.deepEqual(profileFilter?.value, ['p1']);
});

test('基础解读：语言不同不命中', async () => {
  const { client } = fixture([report({ language: 'en' })]);
  assert.equal(await findCachedBasicReportId(client, 'u1', INPUT, 'zh'), null);
});

test('基础解读：未完成或已删除的报告不命中', async () => {
  for (const bad of [report({ status: 'pending' }), report({ deleted_at: '2026-02-01T00:00:00Z' })]) {
    const { client } = fixture([bad]);
    assert.equal(await findCachedBasicReportId(client, 'u1', INPUT, 'zh'), null);
  }
});

test('基础解读：其他用户的档案不命中（隔离）', async () => {
  const { client } = fixture([report()], [{ ...PROFILE, user_id: 'u2' }]);
  assert.equal(await findCachedBasicReportId(client, 'u1', INPUT, 'zh'), null);
});

test('基础解读：生辰相同但姓名不同不命中；同名命中', async () => {
  const named: Row = { ...PROFILE, label: '张三' };
  const { client } = fixture([report()], [named]);

  assert.equal(await findCachedBasicReportId(client, 'u1', { ...INPUT, name: '李四' }, 'zh'), null);
  assert.equal(await findCachedBasicReportId(client, 'u1', { ...INPUT, name: '张三' }, 'zh'), 'r1');
});

test('基础解读：姓名仅空白/大小写差异仍命中', async () => {
  const named: Row = { ...PROFILE, label: 'Zhang San' };
  const { client } = fixture([report()], [named]);
  assert.equal(
    await findCachedBasicReportId(client, 'u1', { ...INPUT, name: '  zhang   san ' }, 'zh'),
    'r1',
  );
});

test('基础解读：不按虚岁过滤（跨年后仍复用）', async () => {
  const { client, calls } = fixture([report()]);
  await findCachedBasicReportId(client, 'u1', INPUT, 'zh');

  const chartCall = calls.find((c) => c.table === 'charts');
  assert.ok(!chartCall?.filters.some((f) => f.column === 'chart_data->>currentAge'));
});

// ── 完整报告缓存 ──────────────────────────────────────────────────────

test('完整报告：同命盘 + 同虚岁 + 同语言命中', async () => {
  const { client, calls } = fixture([report({ report_type: 'full' })]);
  const id = await findCachedFullReportId(client, 'u1', INPUT, 38, 'zh');

  assert.equal(id, 'r1');
  const chartCall = calls.find((c) => c.table === 'charts');
  assert.ok(chartCall?.filters.some(
    (f) => f.column === 'chart_data->>currentAge' && f.value === '38',
  ));
});

test('完整报告：虚岁不同不命中', async () => {
  const { client } = fixture([report({ report_type: 'full' })]);
  assert.equal(await findCachedFullReportId(client, 'u1', INPUT, 39, 'zh'), null);
});

test('完整报告：语言不同不命中', async () => {
  const { client } = fixture([report({ report_type: 'full', language: 'ja' })]);
  assert.equal(await findCachedFullReportId(client, 'u1', INPUT, 38, 'zh'), null);
});

test('完整报告：只有基础解读时不会误命中', async () => {
  const { client } = fixture([report({ report_type: 'basic' })]);
  assert.equal(await findCachedFullReportId(client, 'u1', INPUT, 38, 'zh'), null);
});
