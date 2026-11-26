/**
 * 命盘缓存键。
 *
 * 只由「会改变命盘结构」的出生资料决定：日期、时间（未知时辰统一记 unknown）、
 * 时区、经度、性别。出生地名称只是显示标签，不参与计算，因此不进键。
 *
 * 不含引擎/提示词版本：同一份出生资料升级引擎后，仍应优先返回用户已有的报告，
 * 而不是让免费额度已用尽的用户拿不到结果。版本信息仍记录在 charts 表中便于追溯。
 *
 * 不含当前年龄/大限：本模块服务于基础解读（不随年份变化），
 * 完整报告里的「当前阶段」由引擎按当天日期实时生成，不走这里。
 */
export interface ChartCacheInput {
  /** 出生档案姓名（表单里的「姓名 / 资料名称」）。同一生辰的不同人靠它区分。 */
  name?: string | null;
  /** 出生地点：只用于「同一个人」判定（姓名 + 日期 + 地点），不参与命盘指纹。 */
  birthPlace?: string | null;
  birthDate: string;
  birthTime?: string | null;
  timeKnown?: boolean;
  timezone: string;
  longitude?: number | string | null;
  gender: 'male' | 'female';
}

/** 32 位 FNV-1a；两轮不同种子拼成 16 位十六进制。不依赖 node:crypto，浏览器与服务端一致。 */
function hash32(text: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function hex8(n: number): string {
  return n.toString(16).padStart(8, '0');
}

export function chartCacheKey(input: ChartCacheInput): string {
  const time = input.timeKnown && input.birthTime
    ? String(input.birthTime).trim().slice(0, 5)
    : 'unknown';

  const rawLon = input.longitude;
  const lonNum = rawLon === null || rawLon === undefined || rawLon === ''
    ? NaN
    : Number(rawLon);
  const longitude = Number.isFinite(lonNum) ? lonNum.toFixed(2) : 'none';

  // 姓名归一：去首尾空白、压缩连续空白、统一小写（中文不受影响），空串按「未填」处理。
  const name = String(input.name ?? '').trim().replace(/\s+/g, ' ').toLowerCase() || 'none';

  const canonical = [
    name,
    String(input.birthDate).trim(),
    time,
    String(input.timezone).trim(),
    longitude,
    input.gender,
  ].join('|');

  return hex8(hash32(canonical, 0x811c9dc5)) + hex8(hash32(canonical, 0x9e3779b9));
}
