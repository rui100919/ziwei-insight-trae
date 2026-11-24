import type { Star, ZiweiChart } from '@/lib/ziwei/types';

/**
 * 命盘展示视图。
 *
 * - 完整视图：排盘引擎产出的 ZiweiChart（付费用户 / 演示模式）。
 * - 预览视图：只保留十二宫骨架、命宫/身宫标记和主星名（免费用户）。
 *
 * 两者共用 ChartBoard 渲染，所以这里用结构类型而不是直接 Pick<ZiweiChart>，
 * 允许预览缺少大限、亮度、四化等付费字段。
 */
export type ChartStarView = {
  name: string;
  type: Star['type'];
  brightnessRaw?: string;
  siHua?: string;
};

export type ChartPalaceView = {
  branch: number;
  stem?: number;
  name: string;
  stars: ChartStarView[];
  isMingGong?: boolean;
  isShenGong?: boolean;
  isCurrentDaXian?: boolean;
  daXianAge?: [number, number];
  isEmpty?: boolean;
  borrowedStars?: string[];
};

export type ChartView = {
  birthInfo?: ZiweiChart['birthInfo'];
  lunarInfo?: ZiweiChart['lunarInfo'];
  mingGongBranch?: number;
  shenGongBranch?: number;
  wuxingJu?: number;
  wuxingJuName: string;
  ziweiPos?: number;
  mingZhu?: string;
  shenZhu?: string;
  yinYangGender?: string;
  currentAge?: number;
  palaces: ChartPalaceView[];
};

/**
 * 免费预览盘：十二宫位置 + 宫名 + 命宫/身宫标记 + 主星名。
 *
 * 剔除的内容（需付费解锁）：辅星/煞星、亮度、四化、大限年龄段与当前大限、
 * 长生/博士十二神。服务端 SQL 版本 `get_report_chart` 保持同一口径，
 * 两边改动必须同步。
 */
export function toPreviewChart(chart: ZiweiChart): ChartView {
  return {
    birthInfo: chart.birthInfo,
    lunarInfo: chart.lunarInfo,
    mingGongBranch: chart.mingGongBranch,
    shenGongBranch: chart.shenGongBranch,
    wuxingJu: chart.wuxingJu,
    wuxingJuName: chart.wuxingJuName,
    ziweiPos: chart.ziweiPos,
    mingZhu: chart.mingZhu,
    shenZhu: chart.shenZhu,
    yinYangGender: chart.yinYangGender,
    palaces: chart.palaces.map((palace) => ({
      branch: palace.branch,
      stem: palace.stem,
      name: palace.name,
      isMingGong: palace.isMingGong,
      isShenGong: palace.isShenGong,
      isEmpty: palace.isEmpty,
      borrowedStars: palace.borrowedStars,
      stars: palace.stars
        .filter((star) => star.type === 'major')
        .map((star) => ({ name: star.name, type: star.type })),
    })),
  };
}
