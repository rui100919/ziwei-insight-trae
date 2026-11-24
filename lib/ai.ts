import { LANG_META, type Lang } from '@/lib/i18n';
import { plainOf, parseSiHua } from '@/lib/star-language';

export interface ReadingContent {
  overview: string;
  personality: string;
  strengths: string;
  caveats: string;
}

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('AI_BAD_JSON');
  return JSON.parse(cleaned.slice(start, end + 1));
}

/** 从命盘事实里挑出主星与四化，附上白话译法，供模型照着说人话。 */
function plainGlossary(facts: unknown, lang: Lang): string {
  const f = facts as {
    mingPalace?: { majorStars?: string[]; siHua?: string[] };
  };
  const stars = f?.mingPalace?.majorStars ?? [];
  const lines: string[] = [];
  for (const name of stars) {
    const p = plainOf(name);
    if (!p) continue;
    const e = p[lang];
    lines.push(lang === 'zh'
      ? `${name} → ${e.label}；性格：${e.traits} 擅长：${e.talent}`
      : `${name} → ${e.label}; traits: ${e.traits} strengths: ${e.talent}`);
  }
  for (const raw of f?.mingPalace?.siHua ?? []) {
    const s = parseSiHua(raw);
    if (s) lines.push(`${raw} → ${s.plain[lang]}`);
  }
  return lines.join('\n');
}

/** 精简基础解读：只写四个维度，不写大限/流年/事件预测，全部用大白话。 */
export async function generateBasicReading(
  facts: unknown,
  lang: Lang,
): Promise<{ content: ReadingContent; model: string }> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('AI_NOT_CONFIGURED');

  const base = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  const glossary = plainGlossary(facts, lang);
  // 非中文：共用英文规则，但在最前面强制要求用目标语言（母语名）输出，绝不回退英文。
  const aiName = LANG_META[lang].aiName;

  const system = lang === 'zh'
    ? [
        '你是一位解读紫微斗数的助手，正在给第一次使用的普通用户写一份免费的基础解读。',
        '最重要的要求：说大白话。像跟一位不懂命理的朋友解释一样，让人读完就知道「我在日常里大概是个什么样的人」。',
        '禁止堆砌术语。不要直接写「命宫落在某位」「五行属某局」「主星为某某」「四化为某某」这类话；星曜名如果必须出现，要紧接着用日常语言说明它代表什么样的行为倾向。',
        '下面附了星曜的白话参考译法，请优先按这个口径来写，保持温和、具体、可对照生活：',
        glossary ? `【白话参考】\n${glossary}` : '【白话参考】本次命盘核心位置没有主星，可按「不易被单一标签定义」来讲。',
        '严格规则：只能使用用户提供的命盘事实，不得自行推算、补全或编造任何星曜、宫位、四化、大限、流年、事件。',
        '输出仅限性格与行事方式的温和描述；不做预测、不判断吉凶、不给人生建议。',
        '只输出 JSON，含 overview / personality / strengths / caveats 四个字符串字段，每段 120 字以内。',
        'overview 用一两句点出最突出的性格关键词；personality 讲这是个什么样的人；strengths 讲日常里比较擅长什么；caveats 用大白话说明这是性格参考、不是预言，不替人做决定，但不出现「时辰索引」等内部字段。',
      ].join('\n')
    : [
        `Write the entire reading in ${aiName}. Every JSON field — overview, personality, strengths, caveats — must be in ${aiName}; do not write any part of the reading in English.`,
        'You are writing a free introductory Zi Wei Dou Shu reading for a first-time user who knows nothing about it.',
        'Most important: write in plain, everyday language — like explaining to a friend. After reading, people should know "what kind of person I tend to be in daily life".',
        'Never pile up jargon. Do not write things like "the Ming palace falls in the X branch" or "the X element phase". If a star name must appear, immediately explain the everyday behaviour it points to.',
        'A plain-language glossary of the stars is attached; follow its wording and stay warm, concrete and relatable:',
        glossary ? `[Glossary]\n${glossary}` : '[Glossary] No major star in the core palace this time — describe this as "hard to box into one label".',
        'Strict rules: use only the chart facts provided. Never compute, complete or invent stars, palaces, si hua, da xian, yearly luck or events.',
        'Stay within gentle descriptions of character and behaviour. No predictions, no fortune judgements, no life advice.',
        'Output JSON only, with four string fields: overview, personality, strengths, caveats. Max 120 words each.',
        'overview names the standout trait in a sentence or two; personality describes what the person is like; strengths covers what comes naturally; caveats says in plain words that this is a reflection, not a prediction, and doesn\'t decide anything for them — never expose internal fields like "hour branch index".',
      ].join('\n');

  const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(facts) },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`AI_HTTP_${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('AI_EMPTY');

  const parsed = extractJson(raw) as Record<string, unknown>;
  const content: ReadingContent = {
    overview: String(parsed.overview ?? '').slice(0, 800),
    personality: String(parsed.personality ?? '').slice(0, 800),
    strengths: String(parsed.strengths ?? '').slice(0, 800),
    caveats: String(parsed.caveats ?? '').slice(0, 800),
  };
  if (!content.overview || !content.personality) throw new Error('AI_INCOMPLETE');
  return { content, model };
}
