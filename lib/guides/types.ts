/**
 * /guides 内容页的数据结构。
 *
 * 为什么要做成数据：十二宫与十四主星是 26 个天然长尾入口，
 * 每页都需要独立 title、description、正文与 FAQ。把正文写成数据后，
 * 路由只负责渲染，内容可以逐篇润色，不必碰组件。
 *
 * 写作约束（全篇一致）：
 * - 只描述倾向，不下判断、不预言、不承诺结果；
 * - 疾厄宫与健康相关的内容不做医学表述；
 * - 财帛、官禄相关的内容不做投资与收入承诺；
 * - 每篇正文（导语 + 小节）800–1200 汉字。
 */
export type GuideKind = 'palace' | 'star';

export type GuideSection = {
  /** 小节标题：10–22 字，陈述句，不用问号。 */
  heading: string;
  /** 2–3 段，每段 50–110 字。 */
  paragraphs: string[];
};

export type GuideFaqItem = {
  question: string;
  /** 40–90 字，直接回答，不绕。 */
  answer: string;
};

export type Guide = {
  kind: GuideKind;
  /** URL 片段，拼音小写，如 ming / ziwei。 */
  slug: string;
  /** 条目名：命宫 / 紫微。 */
  name: string;
  /** 眉标：十二宫 · 命宫。 */
  eyebrow: string;
  /** H1：一句话说清这篇在读什么。 */
  title: string;
  /** 浏览器标题，模板会自动补「 · Zi Wei Insight」。 */
  metaTitle: string;
  /** meta description，70–110 字。 */
  description: string;
  /** 导语 2 段。 */
  lead: string[];
  /** 4–5 个小节。 */
  sections: GuideSection[];
  /** 3 条问答，用于页面 FAQ 与 FAQPage 结构化数据。 */
  faq: GuideFaqItem[];
};

/** 正文汉字数（不含 FAQ），用于阅读时长与质量校验。 */
export function bodyCharCount(guide: Guide): number {
  const text = [...guide.lead, ...guide.sections.flatMap((s) => s.paragraphs)].join('');
  return (text.match(/[\u4e00-\u9fa5]/g) || []).length;
}

/** 按每分钟 350 字估算阅读时长，最少 2 分钟。 */
export function readingMinutes(guide: Guide): number {
  return Math.max(2, Math.round(bodyCharCount(guide) / 350));
}