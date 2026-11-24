import { calculateTrueSolarTime, resolveZiweiDayOffset, shiftGregorianDate } from '@/lib/ziwei/true-solar-time';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';
import { getTimezoneOffsetMinutes, isValidTimeZone } from '@/lib/time';
import { isChinaDST, chinaDSTRange, chinaDSTSpan } from '@/lib/ziwei/dst-cn';
import type { Lang } from '@/lib/i18n';

// 版本常量集中在 engine-version.ts，便于浏览器端计算缓存键时复用（不打包 iztro）。
export { ENGINE_NAME, ENGINE_VERSION, CHART_RULE_VERSION, PROMPT_VERSION } from '@/lib/engine-version';

export interface ChartInput {
  birthDate: string;        // YYYY-MM-DD
  birthTime: string;        // HH:MM
  timeKnown: boolean;
  birthPlace: string;
  timezone: string;
  longitude?: number | null;
  gender: 'male' | 'female';
}

/** 时间来源元数据，供调用方按语言分支，避免解析多语言 timeNote 文本。 */
export type TimeStatus = 'unknown' | 'clock' | 'corrected';

export interface BuiltChart {
  birthInfo: BirthInfo;
  chart: ZiweiChart;
  timeNote: string;
  utcOffset: string;
  /** unknown=出生时间未知；clock=仅按当地钟表时间；corrected=已按经度/均时差校正 */
  timeStatus: TimeStatus;
  /** 出生日期是否落在中国大陆夏令时区间（只用于提示；偏移已按 IANA 含夏令时计算，不再手动加减） */
  hasDST: boolean;
}

function parseDate(s: string): { year: number; month: number; day: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new Error('INVALID_DATE');
  const year = Number(m[1]); const month = Number(m[2]); const day = Number(m[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    throw new Error('INVALID_DATE');
  }
  return { year, month, day };
}

function parseTime(s: string): { clockHour: number; clockMinute: number } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) throw new Error('INVALID_TIME');
  const clockHour = Number(m[1]); const clockMinute = Number(m[2]);
  if (clockHour > 23 || clockMinute > 59) throw new Error('INVALID_TIME');
  return { clockHour, clockMinute };
}

/** 1-indexed 月份名（index 0 占位），用于本地化夏令时区间。 */
const MONTH_EN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_ES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTH_FR = ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTH_DE = ['', 'Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

function dstWhen(year: number, lang: Lang): string {
  const span = chinaDSTSpan(year);
  if (!span) {
    switch (lang) {
      case 'zh': return '当年夏季';
      case 'en': return 'that summer';
      case 'es': return 'ese verano';
      case 'fr': return 'cet été-là';
      case 'de': return 'in jenem Sommer';
      case 'ja': return 'その年の夏';
    }
  }
  const { startMonth, startDay, endMonth, endDay } = span;
  switch (lang) {
    case 'zh': return `${startMonth} 月 ${startDay} 日至${endMonth} 月 ${endDay} 日`;
    case 'en': return `${MONTH_EN[startMonth]} ${startDay} – ${MONTH_EN[endMonth]} ${endDay}`;
    case 'es': return `del ${startDay} de ${MONTH_ES[startMonth]} al ${endDay} de ${MONTH_ES[endMonth]}`;
    case 'fr': return `du ${startDay} ${MONTH_FR[startMonth]} au ${endDay} ${MONTH_FR[endMonth]}`;
    case 'de': return `${startDay}. ${MONTH_DE[startMonth]} bis ${endDay}. ${MONTH_DE[endMonth]}`;
    case 'ja': return `${startMonth}月${startDay}日〜${endMonth}月${endDay}日`;
  }
}

/**
 * 中国大陆夏令时提示：出生日期落在站内夏令时表区间时给出核对提醒。
 * 真太阳时换算本身已经使用出生地当时的实际偏移（IANA，含夏令时），
 * 所以这里只做说明、不再让用户手动加减一小时——否则会重复调整。
 */
export function chinaDSTNotice(year: number, month: number, day: number, lang: Lang): string | null {
  if (!isChinaDST(year, month, day)) return null;
  const when = dstWhen(year, lang);
  switch (lang) {
    case 'zh':
      return `${year} 年中国大陆实行过夏令时（${when}）。本盘按你填写的钟表时间换算真太阳时，不用自己再加减一小时；如果你填的其实是已经换算成标准时间的时间，请改回当年的钟表读数再排一次。`;
    case 'en':
      return `Mainland China observed daylight saving time in ${year} (${when}). This chart converts the time you entered as the clock reading of that period, so you do not need to shift anything yourself. If you entered a standard time that was already converted, please re-enter the original clock reading.`;
    case 'es':
      return `En ${year}, la China continental aplicó el horario de verano (${when}). Esta carta convierte la hora que introdujiste como la lectura del reloj de entonces, así que no necesitas ajustar nada. Si introdujiste una hora estándar ya convertida, vuelve a introducir la lectura original del reloj.`;
    case 'fr':
      return `En ${year}, la Chine continentale a appliqué l’heure d’été (${when}). Ce thème convertit l’heure saisie comme l’heure lue sur l’horloge de l’époque : inutile de la décaler vous-même. Si vous avez saisi une heure standard déjà convertie, saisissez à nouveau l’heure d’horloge d’origine.`;
    case 'de':
      return `In ${year} galt in Festlandchina die Sommerzeit (${when}). Dieses Horoskop rechnet die eingegebene Zeit als damalige Uhrzeit um, du musst also nichts selbst verschieben. Wenn du bereits eine umgerechnete Standardzeit eingegeben hast, gib bitte die ursprüngliche Uhrzeit erneut ein.`;
    case 'ja':
      return `${year}年、中国本土では夏時間（${when}）が実施されていました。この命盤は入力された時刻を当時の時計の時刻として真太陽時に換算するため、ご自身で1時間を足し引きする必要はありません。すでに標準時に換算した時刻を入力した場合は、当時の時計の時刻に戻して再入力してください。`;
  }
}

function timeNoteCorrected(hour: number, y: number, m: number, d: number, lang: Lang): string {
  const date = `${y}-${m}-${d}`;
  switch (lang) {
    case 'zh': return `已按经度与均时差校正，时辰索引 ${hour}，排盘日 ${date}。`;
    case 'en': return `Corrected for longitude and equation of time; hour branch ${hour}; chart date ${date}.`;
    case 'es': return `Corregido por longitud y ecuación del tiempo; rama horaria ${hour}; fecha de la carta ${date}.`;
    case 'fr': return `Corrigé selon la longitude et l’équation du temps ; branche horaire ${hour} ; date du thème ${date}.`;
    case 'de': return `Nach Länge und Zeitgleichung korrigiert; Stundenast ${hour}; Kartendatum ${date}.`;
    case 'ja': return `経度と均時差で補正済み；時辰索引 ${hour}；排盤日 ${date}。`;
  }
}

function timeNoteClock(lang: Lang): string {
  switch (lang) {
    case 'zh': return '未填经度，按当地钟表时间排盘。';
    case 'en': return 'No longitude provided; local clock time used.';
    case 'es': return 'No se indicó la longitud; se usa la hora local del reloj.';
    case 'fr': return 'Aucune longitude fournie ; l’heure locale du réveil est utilisée.';
    case 'de': return 'Kein Längengrad angegeben; die lokale Uhrzeit wird verwendet.';
    case 'ja': return '経度が未入力のため、現地の時計の時刻で排盤します。';
  }
}

function timeNoteUnknown(lang: Lang): string {
  switch (lang) {
    case 'zh': return '出生时间未知，按子时起盘；涉及时辰的结论精度受限。';
    case 'en': return 'Birth time unknown; 子时 (first hour branch) assumed. Time-sensitive conclusions are limited.';
    case 'es': return 'Hora de nacimiento desconocida; se toma 子时 (primera rama horaria). Las conclusiones que dependen de la hora son limitadas.';
    case 'fr': return 'Heure de naissance inconnue ; 子时 (première branche horaire) est retenu. Les conclusions liées à l’heure sont limitées.';
    case 'de': return 'Geburtszeit unbekannt; 子时 (erster Stundenast) angenommen. Zeitabhängige Schlussfolgerungen sind eingeschränkt.';
    case 'ja': return '出生時刻が不明のため、子時で起盤します；時辰に関わる結論の精度は限られます。';
  }
}

/** 命盘事实由引擎计算；模型不会接触未经引擎确认的星曜信息。 */
export function buildChart(input: ChartInput, lang: Lang): BuiltChart {
  const date = parseDate(input.birthDate);
  let hour: number;
  let chartDate = date;
  let timeNote: string;
  let timeStatus: TimeStatus;
  let utcOffset = '';

  // 时区是外部输入（高级面板可手填），非法值会让 Intl 抛错，这里转成可识别的业务错误。
  if (!isValidTimeZone(input.timezone)) throw new Error('INVALID_TIMEZONE');

  if (input.timeKnown) {
    const { clockHour, clockMinute } = parseTime(input.birthTime);
    const offsetMin = getTimezoneOffsetMinutes(
      input.timezone, date.year, date.month, date.day, clockHour, clockMinute,
    );
    const sign = offsetMin >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMin);
    utcOffset = `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;

    const solar = calculateTrueSolarTime({
      ...date,
      clockHour,
      clockMinute,
      longitude: input.longitude ?? undefined,
      utcOffsetMinutes: offsetMin,
    });
    chartDate = shiftGregorianDate(date, resolveZiweiDayOffset(solar, 'next-day'));
    hour = solar.branch;
    if (solar.corrected) {
      timeStatus = 'corrected';
      timeNote = timeNoteCorrected(hour, chartDate.year, chartDate.month, chartDate.day, lang);
    } else {
      timeStatus = 'clock';
      timeNote = timeNoteClock(lang);
    }
  } else {
    hour = 0;
    timeStatus = 'unknown';
    timeNote = timeNoteUnknown(lang);
  }

  // 夏令时提示：仅判定、不自动改时间（遵循上游引擎口径）。
  const inDST = isChinaDST(date.year, date.month, date.day);
  const hasDST = input.timeKnown && inDST;
  const dst = inDST ? chinaDSTNotice(date.year, date.month, date.day, lang) : null;
  if (input.timeKnown && dst) timeNote += ` ${dst}`;

  const birthInfo: BirthInfo = {
    ...chartDate,
    hour,
    gender: input.gender,
    province: input.birthPlace,
    city: input.birthPlace,
    longitude: input.longitude ?? undefined,
  };

  const chart = generateChart(birthInfo);
  return { birthInfo, chart, timeNote, utcOffset, timeStatus, hasDST };
}

const INSTRUCTION: Record<Lang, string> = {
  zh: '只使用上述命盘事实。不要自行推算或补充任何星曜、宫位、四化、大限、流年。',
  en: 'Use only the facts above. Do not compute or invent any stars, palaces, si hua, da xian or yearly luck.',
  es: 'Usa solo los hechos anteriores. No calcules ni inventes ninguna estrella, palacio, si hua, da xian ni suerte anual.',
  fr: 'N’utilise que les faits ci-dessus. Ne calcule ni n’invente aucune étoile, palais, si hua, da xian ni chance annuelle.',
  de: 'Verwende nur die oben genannten Fakten. Berechne oder erfinde keine Sterne, Paläste, Si Hua, Da Xian oder Jahresglück.',
  ja: '上記の命盤の事実だけを使用してください。星曜、宮位、四化、大限、流年を自分で計算したり補ったりしないでください。',
};

/** 把完整命盘压缩成模型可读、且不可自行推演的事实摘要。 */
export function chartFacts(chart: ZiweiChart, timeNote: string, lang: Lang, timeStatus?: TimeStatus, hasDST?: boolean) {
  const palaces = (chart.palaces ?? []).map((p) => ({
    name: p.name,
    branch: p.branch,
    majorStars: (p.stars ?? []).filter((s) => s.type === 'major').map((s) => s.name),
    siHua: (p.stars ?? []).filter((s) => s.siHua).map((s) => `${s.name}${s.siHua}`),
  }));
  const ming = palaces.find((p) => p.name.includes('命宫'));
  const shen = palaces.find((p) => p.name.includes('身宫'));

  return {
    language: lang,
    timeNote,
    timeStatus,
    hasDST,
    lunarDate: chart.lunarInfo
      ? `${chart.lunarInfo.lunarYear}-${chart.lunarInfo.lunarMonth}-${chart.lunarInfo.lunarDay}`
      : undefined,
    fourPillars: chart.lunarInfo?.fourPillars,
    wuxingJu: chart.wuxingJuName,
    mingGongBranch: chart.mingGongBranch,
    shenGongBranch: chart.shenGongBranch,
    mingZhu: chart.mingZhu,
    shenZhu: chart.shenZhu,
    mingPalace: ming ?? null,
    shenPalace: shen ?? null,
    palaces,
    instruction: INSTRUCTION[lang],
  };
}
