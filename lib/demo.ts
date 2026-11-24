/**
 * 演示模式：未配置 Supabase 密钥时自动启用。
 * 用浏览器本地存储模拟登录态与报告，排盘仍由真实引擎计算，
 * 解读文案由本地模板生成（不调用 AI）。仅用于产品预览。
 */

import { plainOf, parseSiHua, NO_MAJOR, type StarPlain } from '@/lib/star-language';
import type { Lang } from '@/lib/i18n';

// 时间来源元数据（与 lib/engine 的 TimeStatus 同形；这里内联以避免把排盘算法打进客户端包）。
type TimeStatus = 'unknown' | 'clock' | 'corrected';

export const DEMO = 'demo' as const;

export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

const K_USER = 'zw-demo-user';
const K_REPORTS = 'zw-demo-reports';
const K_ENTITLEMENT = 'zw-demo-entitlement';
const K_PROFILES = 'zw-demo-birth-profiles';
const K_USER_PROFILE = 'zw-demo-profile';

export type DemoUser = { id: string; email?: string; phone?: string };

/** 可复用的出生档案，对齐 schema.sql 的 birth_profiles 表字段。 */
export type DemoBirthProfile = {
  id: string;
  label: string;
  birthDate: string;
  birthTime: string;
  timeKnown: boolean;
  birthPlace: string;
  timezone: string;
  longitude: string;
  gender: 'male' | 'female';
  createdAt: string;
};

/** 用户可编辑的基本资料（昵称、偏好语言、注册时间）。 */
export type DemoUserProfile = {
  displayName: string;
  preferredLanguage: Lang;
  memberSince: string;
};

export type DemoReport = {
  id: string;
  language: string;
  report_type: string;
  created_at: string;
  content: {
    overview: string;
    personality: string;
    strengths: string;
    caveats: string;
  };
  chart?: unknown;
  /** 命盘缓存键：同一份出生资料再次提交时，直接复用这份报告。 */
  cacheKey?: string;
  /** 生成这份报告所用的出生档案快照，用于列表摘要与报告页标注。 */
  profile?: { label: string; birthDate: string; birthTime: string; birthPlace: string; timezone: string; timeKnown: boolean };
};

/** 演示账号预置的两份出生档案，对应参考产品的 My Chart / Mum。 */
function seedBirthProfiles(): DemoBirthProfile[] {
  return [
    {
      id: 'demo-profile-chart',
      label: 'My Chart',
      birthDate: '1990-05-17',
      birthTime: '14:30',
      timeKnown: true,
      birthPlace: 'Kuala Lumpur',
      timezone: 'Asia/Kuala_Lumpur',
      longitude: '101.69',
      gender: 'female',
      createdAt: '2026-11-17T00:00:00.000Z',
    },
    {
      id: 'demo-profile-mum',
      label: 'Mum',
      birthDate: '1962-08-03',
      birthTime: '12:00',
      timeKnown: false,
      birthPlace: 'London',
      timezone: 'Europe/London',
      longitude: '-0.13',
      gender: 'female',
      createdAt: '2026-11-17T00:00:01.000Z',
    },
  ];
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const demoStore = {
  getUser: (): DemoUser | null => read<DemoUser | null>(K_USER, null),
  setUser: (user: DemoUser) => write(K_USER, user),
  clearUser: () => write(K_USER, null),

  getReports: (): DemoReport[] => read<DemoReport[]>(K_REPORTS, []),
  addReport: (report: DemoReport) => {
    const all = read<DemoReport[]>(K_REPORTS, []);
    write(K_REPORTS, [report, ...all]);
  },
  deleteReport: (id: string) => {
    write(K_REPORTS, read<DemoReport[]>(K_REPORTS, []).filter((r) => r.id !== id));
  },
  getReport: (id: string): DemoReport | null =>
    read<DemoReport[]>(K_REPORTS, []).find((r) => r.id === id) ?? null,
  /** 同一命盘 + 同一语言已有基础解读时返回它，避免重复生成与重复扣额度。 */
  findReportByCacheKey: (cacheKey: string, language: string): DemoReport | null =>
    read<DemoReport[]>(K_REPORTS, []).find(
      (r) => r.cacheKey === cacheKey
        && r.language === language
        && (r.report_type ?? 'basic') === 'basic',
    ) ?? null,

  getEntitlement: (): { status: 'available' | 'reserved' | 'consumed' } =>
    read(K_ENTITLEMENT, { status: 'available' as const }),
  consumeEntitlement: () => write(K_ENTITLEMENT, { status: 'consumed' }),
  resetEntitlement: () => write(K_ENTITLEMENT, { status: 'available' }),

  // 出生档案：首次访问时写入两份预置资料，之后完全由用户增删改。
  getBirthProfiles: (): DemoBirthProfile[] => {
    if (typeof window === 'undefined') return seedBirthProfiles();
    const raw = window.localStorage.getItem(K_PROFILES);
    if (raw === null) {
      const seeded = seedBirthProfiles();
      write(K_PROFILES, seeded);
      return seeded;
    }
    try { return JSON.parse(raw) as DemoBirthProfile[]; } catch { return seedBirthProfiles(); }
  },
  addBirthProfile: (profile: DemoBirthProfile) => {
    write(K_PROFILES, [...demoStore.getBirthProfiles(), profile]);
  },
  deleteBirthProfile: (id: string) => {
    write(K_PROFILES, demoStore.getBirthProfiles().filter((p) => p.id !== id));
  },
  getBirthProfile: (id: string): DemoBirthProfile | null =>
    demoStore.getBirthProfiles().find((p) => p.id === id) ?? null,

  // 用户资料（昵称 / 偏好语言 / 注册时间）
  getUserProfile: (): DemoUserProfile =>
    read<DemoUserProfile>(K_USER_PROFILE, {
      displayName: '',
      preferredLanguage: 'zh',
      memberSince: new Date().toISOString(),
    }),
  setUserProfile: (profile: DemoUserProfile) => write(K_USER_PROFILE, profile),
};

type QueryResult<T> = { data: T | null; error: { message: string } | null };

function query<T>(rows: () => T[]) {
  let filtered = rows();
  const builder: Record<string, unknown> = {
    select() { return builder; },
    eq(column: string, value: unknown) {
      filtered = filtered.filter((r) => (r as Record<string, unknown>)[column] === value);
      return builder;
    },
    order() { return builder; },
    maybeSingle(): Promise<QueryResult<T>> {
      return Promise.resolve({ data: filtered[0] ?? null, error: null });
    },
    single(): Promise<QueryResult<T>> {
      return Promise.resolve({ data: filtered[0] ?? null, error: filtered[0] ? null : { message: 'no rows' } });
    },
    then(resolve: (v: QueryResult<T[]>) => unknown) {
      return Promise.resolve({ data: filtered, error: null }).then(resolve);
    },
  };
  return builder;
}

type ChartFacts = {
  lunarDate?: string;
  fourPillars?: unknown;
  wuxingJu?: string;
  mingPalace?: { branch?: number; name?: string; majorStars?: string[]; siHua?: string[] } | null;
  shenPalace?: { majorStars?: string[] } | null;
  timeNote?: string;
  timeStatus?: TimeStatus;
  hasDST?: boolean;
};

/** 演示用解读：把引擎算出的星曜翻译成大白话，不调用 AI、不预测、不判吉凶。 */
export function generateDemoReading(facts: ChartFacts, lang: Lang) {
  const L = (r: Record<Lang, string>): string => r[lang];

  const majorNames = facts.mingPalace?.majorStars ?? [];
  const starInfos = majorNames.map((n) => plainOf(n)).filter((p): p is StarPlain => Boolean(p));
  const siHuaInfos = (facts.mingPalace?.siHua ?? [])
    .map((raw) => parseSiHua(raw))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // 时间说明：优先用引擎的 timeStatus/hasDST 元数据分支，避免解析多语言 timeNote 文本；
  // 仅当元数据缺失时才回退到中文 timeNote 的旧关键字（兼容旧 facts）。
  const timeStatus: TimeStatus = facts.timeStatus
    ?? (facts.timeNote?.includes('未知') ? 'unknown' : facts.timeNote?.includes('未填经度') ? 'clock' : 'corrected');
  const hasDST = facts.hasDST ?? Boolean(facts.timeNote?.includes('夏令时'));

  const TIME: Record<TimeStatus, Record<Lang, string>> = {
    unknown: {
      zh: '你的出生时间不确定，所以下面不涉及具体时辰的判断。',
      en: 'Your birth time is unknown, so nothing below depends on a specific hour.',
      es: 'No conoces tu hora de nacimiento, así que nada de lo que sigue depende de una hora concreta.',
      fr: 'Votre heure de naissance est inconnue, donc rien de ce qui suit ne dépend d’une heure précise.',
      de: 'Deine Geburtszeit ist unbekannt, also hängt nichts von dem Folgenden von einer bestimmten Stunde ab.',
      ja: '出生時刻が不明なため、以下は特定の時辰に依存しません。',
    },
    clock: {
      zh: '时间按你填的当地钟表时间计算。',
      en: 'Time was taken from the local clock time you entered.',
      es: 'La hora se tomó de la hora local del reloj que introdujiste.',
      fr: 'L’heure a été prise sur l’heure locale du réveil que vous avez saisie.',
      de: 'Die Zeit wurde anhand der von dir eingegebenen lokalen Uhrzeit genommen.',
      ja: '時刻は入力された現地の時計の時刻に基づいています。',
    },
    corrected: {
      zh: '已根据你的出生地点校正过时间。',
      en: 'The time was adjusted for your birth location.',
      es: 'La hora se ajustó según tu lugar de nacimiento.',
      fr: 'L’heure a été ajustée selon votre lieu de naissance.',
      de: 'Die Zeit wurde nach deinem Geburtsort korrigiert.',
      ja: '出生場所に基づいて時刻を補正しました。',
    },
  };
  const timePlain = L(TIME[timeStatus]);

  const DST: Record<Lang, string> = {
    zh: ' 另外提醒：你出生那年赶上过夏令时，如果填的是当时的钟表时间，和现在差一小时，可以把时间调一小时再排一次看看。',
    en: ' Also, daylight saving time was in effect when you were born; if you entered the clock reading from back then, try shifting it by one hour and recalculating.',
    es: ' Además, en el año de tu nacimiento estuvo en vigor el horario de verano; si introdujiste la hora del reloj de entonces, prueba a desplazarla una hora y recalcular.',
    fr: ' De plus, l’heure d’été était en vigueur l’année de votre naissance ; si vous avez saisi l’heure du réveil de l’époque, essayez de la décaler d’une heure et de recalculer.',
    de: ' Außerdem galt in deinem Geburtsjahr die Sommerzeit; wenn du die damalige Uhrzeit eingegeben hast, versuche, sie um eine Stunde zu verschieben und neu zu berechnen.',
    ja: ' また、あなたの生まれた年は夏時間が実施されていました。当時の時計の時刻を入力した場合は、1時間ずらして再計算してみてください。',
  };
  const dstPlain = hasDST ? L(DST) : '';

  const labels = starInfos.map((s) => s[lang].label).join(lang === 'zh' ? '、' : ' + ');
  const traits = starInfos.map((s) => s[lang].traits).join(lang === 'zh' ? '' : ' ');
  const talents = starInfos.map((s) => s[lang].talent).join(lang === 'zh' ? '另外，' : ' ');
  const siHuaText = siHuaInfos
    .map((s) => `${s.star}${lang === 'zh' ? '——' : ' — '}${s.plain[lang]}`)
    .join(lang === 'zh' ? '；' : '; ');
  const period = lang === 'zh' ? '。' : '.';

  const OVERVIEW_STARS: Record<Lang, string> = {
    zh: '你这张盘最突出的关键词是：{labels}。下面用大白话讲讲，这意味着日常里的你大概是什么样。',
    en: 'The standout theme in your chart is {labels}. In everyday terms, here is what that tends to look like.',
    es: 'Lo que más resalta en tu carta es {labels}. En términos cotidianos, así es como suele verse.',
    fr: 'Le thème le plus marquant de votre thème est {labels}. Concrètement, voici à quoi cela ressemble au quotidien.',
    de: 'Das auffälligste Thema in deinem Horoskop ist {labels}. Im Alltag sieht das meist so aus.',
    ja: 'この命盤で最も際立つキーワードは「{labels}」です。日常的な言葉で言うと、それはあなたの普段の姿がどんなものかを示しています。',
  };
  const OVERVIEW_NONE: Record<Lang, string> = {
    zh: '你这张盘的核心位置没有落主星。传统上把这类人看作不被一种标签框住——下面是一段大白话的讲法。',
    en: "No major star sits in this palace. Traditionally that's read as someone who isn't boxed into one label — here's a plain-language take on it.",
    es: 'Ninguna estrella principal ocupa esta casa. Tradicionalmente se lee como alguien a quien no se encasilla en una sola etiqueta: aquí va una versión en lenguaje sencillo.',
    fr: 'Aucune étoile majeure ne siège dans cette maison. Traditionnellement, on y voit quelqu’un qui ne se laisse pas enfermer dans une étiquette – voici une version en langage simple.',
    de: 'In diesem Palast sitzt kein Hauptstern. Traditionell wird das als jemand gelesen, der sich nicht in eine Schublade stecken lässt – hier eine schlichte Erklärung dazu.',
    ja: 'この宮に主星はありません。伝統的には、一つのレッテルに縛られない人と見なします——以下は平易な言葉での説明です。',
  };
  const overview = starInfos.length ? L(OVERVIEW_STARS).replace('{labels}', labels) : L(OVERVIEW_NONE);

  const PERSONALITY_STARS: Record<Lang, string> = {
    zh: '{traits}这些是从星曜翻成的性格倾向，不是给你贴的标签——你身上大概率不止这一面。',
    en: '{traits} Think of this as a gentle description of tendencies, not a fixed definition of who you are.',
    es: '{traits} Tómalo como una descripción suave de tendencias, no como una definición fija de quién eres.',
    fr: '{traits} Considérez cela comme une douce description de tendances, non comme une définition figée de qui vous êtes.',
    de: '{traits} Sieh das als sanfte Beschreibung von Tendenzen, nicht als feste Definition deiner Person.',
    ja: '{traits}これらは星曜から読み取った性格の傾向であり、あなたに貼られたレッテルではありません——あなたにはきっとこの一面だけではない姿があります。',
  };
  const PERSONALITY_NONE_SUFFIX: Record<Lang, string> = {
    zh: '这同样只是一个观察角度，不是对你的定义。',
    en: ' Again, this is a starting point for reflection, not a definition.',
    es: ' Igualmente, esto es solo un punto de observación, no una definición sobre ti.',
    fr: ' Là encore, ce n’est qu’un angle d’observation, pas une définition de vous.',
    de: ' Auch das ist nur ein Beobachtungswinkel, keine Definition von dir.',
    ja: ' これも一つの見方に過ぎず、あなたを定義づけるものではありません。',
  };
  const personality = starInfos.length
    ? L(PERSONALITY_STARS).replace('{traits}', traits)
    : NO_MAJOR[lang].traits + L(PERSONALITY_NONE_SUFFIX);

  const STRENGTHS_PREFIX: Record<Lang, string> = {
    zh: '你比较擅长的是：',
    en: 'What tends to come naturally: ',
    es: 'Lo que se te da bien: ',
    fr: 'Ce qui vous vient naturellement : ',
    de: 'Was dir leicht fällt: ',
    ja: 'あなたが比較的得意なのは：',
  };
  const STRENGTHS_SIHUA: Record<Lang, string> = {
    zh: '盘里还特别标出了：',
    en: ' The chart also highlights: ',
    es: ' La carta también resalta: ',
    fr: ' La carte met aussi en évidence : ',
    de: ' Das Horoskop hebt zudem hervor: ',
    ja: ' さらに命盤では：',
  };
  const strengths = starInfos.length
    ? L(STRENGTHS_PREFIX) + talents + (siHuaInfos.length ? L(STRENGTHS_SIHUA) + siHuaText + period : '')
    : L(STRENGTHS_PREFIX) + NO_MAJOR[lang].talent;

  const CAVEATS_INTRO: Record<Lang, string> = {
    zh: '这是一份基于传统方法的性格参考，不是预言。它不会告诉你将来会发生什么，也不替你做人生决定。',
    en: "This is a reflection based on an old system, not a prediction. It won't tell you what will happen or make decisions for you. ",
    es: 'Esta es una referencia de personalidad basada en un método tradicional, no una predicción. No te dirá qué pasará en el futuro ni tomará decisiones por ti. ',
    fr: 'Ceci est une référence de personnalité fondée sur une méthode traditionnelle, ce n’est pas une prédiction. Il ne vous dira pas ce qui arrivera ni ne prendra de décisions à votre place. ',
    de: 'Das ist eine Persönlichkeitsreferenz auf Basis eines alten Systems, keine Vorhersage. Es sagt dir nicht, was passieren wird, und trifft keine Entscheidungen für dich. ',
    ja: 'これは伝統的な手法に基づく性格の参考であり、予言ではありません。将来起こることを告げたり、人生の決断を代行したりすることはありません。',
  };
  const CAVEATS_MIDDLE: Record<Lang, string> = {
    zh: '这里说得再准，也只是个参考——真正让你成为你的，还是你自己的练习和选择。',
    en: " Anything here that's worth acting on still comes from your own practice and choices. ",
    es: ' Por muy acertado que parezca, no es más que una referencia: lo que realmente te hace quien eres son tus propios hábitos y decisiones. ',
    fr: ' Quoi qu’il en soit, ce n’est qu’une référence : ce qui vous fait vraiment qui vous êtes, ce sont vos propres pratiques et choix. ',
    de: ' So treffend es auch klingen mag, es bleibt eine Referenz – was dich wirklich zu dir macht, sind deine eigenen Übungen und Entscheidungen. ',
    ja: ' どんなに的確に思えても、あくまで参考です——本当にあなたをあなたたらしめているのは、あなた自身の実践と選択です。 ',
  };
  const CAVEATS_DEMO: Record<Lang, string> = {
    zh: '当前是演示版，解读由内置文案生成；正式版会在同样的边界内由语言模型撰写。',
    en: 'This is a product demo; the live version writes the reading with a language model under the same limits.',
    es: 'Esto es una demostración del producto; la versión en vivo redacta la lectura con un modelo de lengua bajo los mismos límites.',
    fr: 'Ceci est une démonstration du produit ; la version en ligne rédige la lecture avec un modèle de langage dans les mêmes limites.',
    de: 'Das ist eine Produkt-Demo; die Live-Version verfasst die Deutung mit einem Sprachmodell unter denselben Einschränkungen.',
    ja: 'これは製品のデモです；正式版では同じ制約のもと、言語モデルが解読を執筆します。',
  };
  const caveats = L(CAVEATS_INTRO) + timePlain + dstPlain + L(CAVEATS_MIDDLE) + L(CAVEATS_DEMO);

  return { overview, personality, strengths, caveats };
}

/** 模拟 supabase-js 的浏览器客户端，接口只覆盖本项目用到的部分。 */
export function createDemoClient() {
  return {
    auth: {
      async getUser() {
        return { data: { user: demoStore.getUser() }, error: null };
      },
      async signUp({ email }: { email?: string }) {
        const user: DemoUser = { id: 'demo-user', email: email || 'demo@example.com' };
        demoStore.setUser(user);
        return { data: { user, session: { access_token: 'demo' } }, error: null };
      },
      async signInWithPassword({ email }: { email?: string }) {
        const user: DemoUser = { id: 'demo-user', email: email || 'demo@example.com' };
        demoStore.setUser(user);
        return { data: { user, session: { access_token: 'demo' } }, error: null };
      },
      async signInWithOtp({ phone }: { phone?: string }) {
        const user: DemoUser = { id: 'demo-user', phone };
        demoStore.setUser(user);
        return { data: {}, error: null };
      },
      async verifyOtp({ phone }: { phone?: string }) {
        const user: DemoUser = { id: 'demo-user', phone };
        demoStore.setUser(user);
        return { data: { user, session: { access_token: 'demo' } }, error: null };
      },
      async signOut() {
        demoStore.clearUser();
        return { error: null };
      },
    },
    from(table: string) {
      if (table === 'reports') return query<DemoReport>(() => demoStore.getReports());
      if (table === 'user_entitlements') {
        return query<{ status: string }>(() => [demoStore.getEntitlement()]);
      }
      if (table === 'birth_profiles') {
        return query<DemoBirthProfile>(() => demoStore.getBirthProfiles());
      }
      if (table === 'profiles') {
        const p = demoStore.getUserProfile();
        return query<Record<string, unknown>>(() => [{
          display_name: p.displayName,
          email: demoStore.getUser()?.email ?? '',
          preferred_language: p.preferredLanguage,
          created_at: p.memberSince,
        }]);
      }
      return query<Record<string, unknown>>(() => []);
    },
    async rpc(name: string, args?: Record<string, unknown>) {
      if (name === 'soft_delete_report') {
        demoStore.deleteReport(String(args?.p_report_id ?? ''));
        return { data: null, error: null };
      }
      return { data: null, error: null };
    },
  };
}
