/**
 * 城市 → 经纬度 + IANA 时区 查找。
 * 数据来源：GeoNames cities15000（CC BY 4.0，可商用需署名）。
 *
 * 首屏只加载人口前 3000 的核心包（约 420KB，压缩后一百多 KB），
 * 小城市在核心包里搜不到时才懒加载全量数据，避免每位访客都先下 1.7MB。
 */

import type { Lang } from '@/lib/i18n';

export type City = {
  n: string;          // 主显示名（中国城市为中文，国外城市多为英文）
  a: string[];        // 别名（英文/拼音/中文/代码）
  lat: number;
  lon: number;
  tz: string;         // IANA 时区
  c: string;          // 国家代码
  p: number;          // 人口
};

let core: City[] | null = null;
let full: City[] | null = null;
let coreLoading: Promise<City[]> | null = null;
let fullLoading: Promise<City[] | null> | null = null;

export function loadCities(): Promise<City[]> {
  if (core) return Promise.resolve(core);
  if (coreLoading) return coreLoading;
  coreLoading = fetch('/data/cities-core.json')
    .then((r) => {
      if (!r.ok) throw new Error('cities data unavailable');
      return r.json() as Promise<City[]>;
    })
    .then((data) => { core = data; return data; })
    .catch((e) => { coreLoading = null; throw e; });
  return coreLoading;
}

/** 全量城市只在核心包搜不到时加载；失败也不影响已经可用的核心包。 */
export function loadFullCities(): Promise<City[] | null> {
  if (full) return Promise.resolve(full);
  if (fullLoading) return fullLoading;
  fullLoading = fetch('/data/cities.json')
    .then((r) => (r.ok ? (r.json() as Promise<City[]>) : null))
    .then((data) => { full = data; return data; })
    .catch(() => null);
  return fullLoading;
}

/** 返回按人口降序、最多 limit 条的城市候选。Query 支持中英文与拼音。 */
export function searchCities(query: string, limit = 8): City[] {
  const data = full ?? core;
  if (!data) return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const prefix: City[] = [];
  const contains: City[] = [];
  for (const city of data) {
    let matchedPrefix = false;
    for (const alias of city.a) {
      const a = alias.toLowerCase();
      if (a.startsWith(q)) { matchedPrefix = true; break; }
      if (a.includes(q)) { contains.push(city); break; }
    }
    if (matchedPrefix) prefix.push(city);
    if (prefix.length + contains.length >= limit * 3) break;
  }
  return [...prefix, ...contains].slice(0, limit);
}

/**
 * 取城市的本地化显示名。
 * - zh：优先用别名里的中文名；
 * - 其它语言：优先用别名里的纯英文名（含小写字母、避开 SHA/TYO 这类机场代码），
 *   让 es/fr/de/ja 用户看到国际通用名，而不是中文或乱码。
 */
export function cityName(city: City, lang: Lang): string {
  if (lang === 'zh') {
    return city.a.find((a) => /[\u4e00-\u9fff]/.test(a)) ?? city.n;
  }
  const ascii = city.a.find((a) => /^[\x20-\x7E]+$/.test(a) && /[a-z]/.test(a));
  return ascii ?? city.n;
}

/** 下拉候选里的展示：城市名 · 国家代码。 */
export function formatCity(city: City, lang: Lang): string {
  return `${cityName(city, lang)} · ${city.c}`;
}
