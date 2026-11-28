import type { Guide, GuideKind } from './types';
import { MING_GUIDE } from './palaces-ming';
import { GUIDES as PALACES_A } from './palaces-a';
import { GUIDES as PALACES_B } from './palaces-b';
import { ZIWEI_GUIDE } from './stars-ziwei';
import { GUIDES as STARS_A } from './stars-a';
import { GUIDES as STARS_B } from './stars-b';

export type { Guide, GuideKind, GuideSection, GuideFaqItem } from './types';
export { bodyCharCount, readingMinutes } from './types';

/** 顺序即页面列表顺序：按十二宫传统次序。 */
export const PALACE_GUIDES: Guide[] = [MING_GUIDE, ...PALACES_A, ...PALACES_B];

/** 十四主星，按传统次序（紫微起）。 */
export const STAR_GUIDES: Guide[] = [ZIWEI_GUIDE, ...STARS_A, ...STARS_B];

export const ALL_GUIDES: Guide[] = [...PALACE_GUIDES, ...STAR_GUIDES];

export function guidePath(guide: Guide): string {
  return `/guides/${guide.kind}/${guide.slug}`;
}

export function getGuide(kind: GuideKind, slug: string): Guide | undefined {
  const pool = kind === 'palace' ? PALACE_GUIDES : STAR_GUIDES;
  return pool.find((guide) => guide.slug === slug);
}

/**
 * 页内互链：同类的第 3 个邻居 + 一个异类条目。
 * 用固定步长而不是「上下一条」，是为了让内链把整组页面串成网，
 * 而不是只连成一条链。
 */
export function relatedFor(guide: Guide, count = 3): Guide[] {
  const same = guide.kind === 'palace' ? PALACE_GUIDES : STAR_GUIDES;
  const other = guide.kind === 'palace' ? STAR_GUIDES : PALACE_GUIDES;
  const index = same.findIndex((item) => item.slug === guide.slug);
  const picked: Guide[] = [];
  const seen = new Set<string>([`${guide.kind}:${guide.slug}`]);

  for (let step = 1; step < same.length && picked.length < count - 1; step += 1) {
    const candidate = same[(index + step * 3) % same.length];
    const key = `${candidate.kind}:${candidate.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(candidate);
  }
  const cross = other[Math.max(0, index) % other.length];
  if (!seen.has(`${cross.kind}:${cross.slug}`)) picked.push(cross);

  return picked;
}