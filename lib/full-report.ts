/**
 * 付费完整报告生成：用排盘引擎的真实数据（十二宫、大限、四化）生成结构化详细解读。
 * 全部翻成大白话；只描述倾向，不预测具体事件、不判吉凶、不给人生建议。
 * 演示版用本地模板生成；正式版可把同样的 facts 交给语言模型按此结构撰写。
 *
 * 输出为单语言结构（palaces / daXian / patterns 的字符串都已是目标语言），
 * 不附带双语字段，也不在运行时调用翻译 API。
 */

import { plainOf, plainAux, plainShierShen, plainLiu, parseSiHua, NO_MAJOR, type StarPlain, patternLevelPlain } from '@/lib/star-language';
import { detectPatterns } from '@/lib/ziwei/patterns';
import { jiangQianShenName, suiQianShenName, shierShenLabel } from '@/lib/ziwei/shier-shen';
import { chinaDSTNotice, type TimeStatus } from '@/lib/engine';
import type { Lang } from '@/lib/i18n';

/** 单宫解读：标题与正文都已是目标语言。 */
export type PalaceSection = {
  key: string;
  title: string;
  text: string;
};

/** 大限一段：标签与正文都已是目标语言。 */
export type DaXianSection = { label: string; text: string };

/** 格局与神煞：只取引擎的判定结果，用白话转述，不引古籍或讲义原文。 */
export type PatternsSection = { title: string; text: string; count: number };

export type FullReportContent = {
  overview: string;
  personality: string;
  palaces: PalaceSection[];
  daXian: DaXianSection[];
  patterns?: PatternsSection;
  currentPhase: string;
  caveats: string;
};

/** 生成完整报告所需的时间元数据（来自引擎，避免解析多语言 timeNote 文本）。 */
export type FullTimeMeta = { timeStatus: TimeStatus; hasDST: boolean };

type PalaceMeta = { title: string; area: string };

/** 引擎宫位名 → 生活领域的白话标题与引导语（六语言）。 */
const PALACE_META: Record<string, Record<Lang, PalaceMeta>> = {
  命宫: {
    zh: { title: '你这个人的底色', area: '你给人的第一印象和处事底色' },
    en: { title: 'Your core self', area: 'the impression you give and your basic approach' },
    es: { title: 'Tu esencia', area: 'la primera impresión que das y tu forma básica de actuar' },
    fr: { title: 'Votre noyau', area: 'l’impression que vous donnez et votre approche de base' },
    de: { title: 'Dein Kern', area: 'der Eindruck, den du machst, und deine grundlegende Herangehensweise' },
    ja: { title: 'あなたの本質', area: '人に与える第一印象と、物事への基本的な向き合い方' },
  },
  身宫: {
    zh: { title: '后天活成的样子', area: '你越活越像的样子、后天用在什么地方' },
    en: { title: 'Who you become', area: 'what you grow into and where you invest yourself' },
    es: { title: 'En lo que te conviertes', area: 'en lo que te vas pareciendo más y dónde inviertes tu energía' },
    fr: { title: 'Ce que vous devenez', area: 'ce en quoi vous évoluez et où vous investissez vous-même' },
    de: { title: 'Wer du wirst', area: 'womit du dich im Laufe des Lebens identifizierst und worin du dich investierst' },
    ja: { title: '後天的になる姿', area: '生きていくうちに近づく姿と、後天的に力を注ぐ場所' },
  },
  兄弟: {
    zh: { title: '兄弟姐妹与同辈', area: '和兄弟姐妹、同辈相处的模式' },
    en: { title: 'Siblings & peers', area: 'how you relate to siblings and peers' },
    es: { title: 'Hermanos y compañeros', area: 'cómo te relacionas con tus hermanos y tus iguales' },
    fr: { title: 'Frères, sœurs et pairs', area: 'la façon dont vous entrez en relation avec vos frères et sœurs et vos pairs' },
    de: { title: 'Geschwister & Gleichaltrige', area: 'wie du mit Geschwistern und Gleichaltrigen umgehst' },
    ja: { title: '兄弟姉妹と同輩', area: '兄弟姉妹や同輩との付き合い方' },
  },
  夫妻: {
    zh: { title: '感情与伴侣', area: '你在亲密关系里的样子' },
    en: { title: 'Love & partnership', area: 'how you show up in close relationships' },
    es: { title: 'Amor y pareja', area: 'cómo eres en las relaciones cercanas' },
    fr: { title: 'Amour et couple', area: 'comment vous vous présentez dans les relations intimes' },
    de: { title: 'Liebe & Partnerschaft', area: 'wie du in engen Beziehungen auftauchst' },
    ja: { title: '恋愛とパートナー', area: '親密な関係の中でのあなたの姿' },
  },
  子女: {
    zh: { title: '子女与晚辈', area: '和子女、晚辈、你带的人之间的关系' },
    en: { title: 'Children & younger people', area: 'your relationship with children and those you mentor' },
    es: { title: 'Hijos y jóvenes', area: 'tu relación con los hijos, los más jóvenes y a quienes guías' },
    fr: { title: 'Enfants et plus jeunes', area: 'votre relation avec les enfants, les plus jeunes et ceux que vous guidez' },
    de: { title: 'Kinder & Jüngere', area: 'deine Beziehung zu Kindern, Jüngeren und denen, die du anleitest' },
    ja: { title: '子女と後輩', area: '子ども、後輩、そしてあなたが指導する人との関係' },
  },
  财帛: {
    zh: { title: '钱与赚钱方式', area: '你怎么看钱、钱通常怎么来' },
    en: { title: 'Money & earning', area: 'how you think about money and how it tends to come in' },
    es: { title: 'Dinero y cómo ganarlo', area: 'cómo ves el dinero y cómo suele llegar' },
    fr: { title: 'Argent et revenus', area: 'comment vous envisagez l’argent et comment il a tendance à arriver' },
    de: { title: 'Geld & Einkommen', area: 'wie du über Geld denkst und wie es meist zu dir kommt' },
    ja: { title: 'お金と稼ぎ方', area: 'お金への考え方と、お金が入ってくる傾向' },
  },
  疾厄: {
    zh: { title: '身体与精力', area: '身体和精力上需要留意的地方' },
    en: { title: 'Body & energy', area: 'what to be mindful of regarding health and energy' },
    es: { title: 'Cuerpo y energía', area: 'qué tener presente sobre la salud y la energía' },
    fr: { title: 'Corps et énergie', area: 'ce qu’il faut surveiller concernant la santé et l’énergie' },
    de: { title: 'Körper & Energie', area: 'was du bezüglich Gesundheit und Energie beachten solltest' },
    ja: { title: '身体とエネルギー', area: '健康や精力で気をつけるべき点' },
  },
  迁移: {
    zh: { title: '出门与外面的世界', area: '你到了外面的环境里是什么状态' },
    en: { title: 'Going out & the wider world', area: 'how you are in unfamiliar or public settings' },
    es: { title: 'Salir y el mundo exterior', area: 'cómo te desenvuelves en entornos desconocidos o públicos' },
    fr: { title: 'Sortir et le monde extérieur', area: 'comment vous vous comportez dans des environnements nouveaux ou publics' },
    de: { title: 'Unterwegs & die weite Welt', area: 'wie du dich in unbekannten oder öffentlichen Situationen verhältst' },
    ja: { title: '外出と外の世界', area: '見知らぬ場所や公の場でのあなたの状態' },
  },
  仆役: {
    zh: { title: '朋友与人际', area: '你交朋友、处圈子的风格' },
    en: { title: 'Friends & social circle', area: 'how you make friends and handle your circle' },
    es: { title: 'Amigos y círculo social', area: 'cómo haces amigos y gestionas tu entorno' },
    fr: { title: 'Amis et cercle social', area: 'comment vous vous faites des amis et gérez votre cercle' },
    de: { title: 'Freunde & soziales Umfeld', area: 'wie du Freunde findest und deinen Kreis gestaltest' },
    ja: { title: '友人と人間関係', area: '友人を作り、人間関係の輪を回すスタイル' },
  },
  官禄: {
    zh: { title: '事业与工作', area: '你做事、发展事业的路子' },
    en: { title: 'Career & work', area: 'how you work and build a career' },
    es: { title: 'Carrera y trabajo', area: 'cómo trabajas y construyes tu carrera' },
    fr: { title: 'Carrière et travail', area: 'comment vous travaillez et développez votre carrière' },
    de: { title: 'Karriere & Arbeit', area: 'wie du arbeitest und eine Karriere aufbaust' },
    ja: { title: '事業と仕事', area: '仕事の進め方と、事業を築いていく道筋' },
  },
  田宅: {
    zh: { title: '家与安稳', area: '家庭、住处、让你安心的事' },
    en: { title: 'Home & stability', area: 'family, home, and what makes you feel secure' },
    es: { title: 'Hogar y estabilidad', area: 'la familia, la vivienda y lo que te da seguridad' },
    fr: { title: 'Foyer et stabilité', area: 'la famille, le logement et ce qui vous rassure' },
    de: { title: 'Heimat & Stabilität', area: 'Familie, Zuhause und was dich sicher fühlen lässt' },
    ja: { title: '家庭と安らぎ', area: '家庭、住まい、そして安心を与えてくれるもの' },
  },
  福德: {
    zh: { title: '心情与精神生活', area: '你的心境、兴趣和充电方式' },
    en: { title: 'Mind & wellbeing', area: 'your state of mind, interests and how you recharge' },
    es: { title: 'Mente y bienestar', area: 'tu estado de ánimo, tus intereses y cómo recargas energía' },
    fr: { title: 'Esprit et bien-être', area: 'votre état d’esprit, vos centres d’intérêt et comment vous vous ressourmez' },
    de: { title: 'Seele & Wohlbefinden', area: 'deine Geisteshaltung, Interessen und wie du neue Kraft schöpfst' },
    ja: { title: '心と精神生活', area: 'あなたの心の状態、興味、そして充電の方法' },
  },
  父母: {
    zh: { title: '父母与长辈', area: '和父母、长辈、上级的关系' },
    en: { title: 'Parents & elders', area: 'your relationship with parents, elders and authority' },
    es: { title: 'Padres y mayores', area: 'tu relación con los padres, los mayores y la autoridad' },
    fr: { title: 'Parents et aînés', area: 'votre relation avec vos parents, vos aînés et les figures d’autorité' },
    de: { title: 'Eltern & Ältere', area: 'deine Beziehung zu Eltern, Älteren und Autoritäten' },
    ja: { title: '父母と目上の人', area: '父母、目上の人、上司との関係' },
  },
};

const BRANCH_ZH = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 流曜是运限层的阶段标记，渲染时标明，避免被当成先天星曜。 */
const LIU_MARK: Record<Lang, string> = {
  zh: '运限标记',
  en: 'phase marker',
  es: 'marca de etapa',
  fr: 'marqueur d’étape',
  de: 'Phasenmarker',
  ja: '運限の印',
};

function starLine(names: string[], lang: Lang): string {
  const isZh = lang === 'zh';
  const parts: string[] = [];
  for (const n of names) {
    const main = plainOf(n);
    if (main) {
      const e = main[lang];
      parts.push(isZh ? `${n}（${e.label}）——${e.traits}` : `${n} (${e.label}) — ${e.traits}`);
      continue;
    }
    const aux = plainAux(n);
    if (aux) {
      const e = aux[lang];
      parts.push(isZh ? `${n}（${e.label}）——${e.traits}` : `${n} (${e.label}) — ${e.traits}`);
      continue;
    }
    // 流曜只在运限层出现；数据里若带了流曜名，也给出白话并标明是阶段标记。
    const liu = plainLiu(n, lang);
    if (liu) {
      parts.push(isZh ? `${n}（${LIU_MARK.zh}）——${liu}` : `${n} (${LIU_MARK[lang]}) — ${liu}`);
      continue;
    }
    // 劫煞 / 龙德 等由十二神表覆盖，星曜词条里没有，用神名白话兜底。
    const shen = plainShierShen(n, lang);
    if (shen) parts.push(isZh ? `${n}（${shen.label}）——${shen.traits}` : `${n} (${shen.label}) — ${shen.traits}`);
  }
  // 词典句子自带句号，去掉尾部标点，避免与外层标点叠成「。。」
  const joined = parts.join(' ').trim();
  return joined.replace(/[。.\s]+$/, '');
}

type RawPalace = {
  name: string;
  branch?: number;
  stars?: { name: string; type?: string; brightnessRaw?: string; siHua?: string }[];
  daXianAge?: [number, number];
  isEmpty?: boolean;
  /** 长生十二神（引擎原值） */
  changsheng12?: string;
  /** 博士十二神（引擎原值） */
  boshi12?: string;
};

type RawChart = {
  birthInfo?: { year: number; month: number; day: number };
  palaces?: RawPalace[];
  daXians?: { startAge: number; endAge: number; palaceBranch: number; palaceName: string }[];
  currentAge?: number;
  currentDaXianIndex?: number;
  mingZhu?: string;
  shenZhu?: string;
  wuxingJuName?: string;
  mingGongBranch?: number;
  lunarInfo?: { lunarYear: number; lunarMonth: number; lunarDay: number; yearBranch?: number; yearStem?: number };
};

/** 带前缀/后缀的句式片段，用于把动态内容（星曜列表等）嵌进目标语言句子。 */
type Slot = { prefix: string; suffix: string };

/** 静态模板：占位符用 {k} / {area} / {title} / {theme} 等，运行时 replace。 */
const T = {
  overviewPrefix: {
    zh: '你这张盘的关键词是「{k}」。',
    en: 'The keywords of your chart are "{k}". ',
    es: 'Las palabras clave de tu carta son "{k}". ',
    fr: 'Les mots-clés de votre thème sont « {k} ». ',
    de: 'Die Schlagworte deines Horoskops sind "{k}". ',
    ja: 'この命盤のキーワードは「{k}」です。',
  },
  overviewCoreStars: {
    zh: '核心星曜是{k}。',
    en: 'Core stars: {k}. ',
    es: 'Estrellas principales: {k}. ',
    fr: 'Étoiles principales : {k}. ',
    de: 'Hauptsterne: {k}. ',
    ja: '主星は{k}です。',
  },
  overviewNoMajor: {
    zh: '核心位置没有落主星。',
    en: 'No major star in the core palace. ',
    es: 'Ninguna estrella principal en la casa central. ',
    fr: 'Aucune étoile principale dans la maison centrale. ',
    de: 'Kein Hauptstern im zentralen Palast. ',
    ja: '核心の宮に主星はありません。',
  },
  overviewWuxing: {
    zh: '传统上把它归到{k}。',
    en: "Traditionally it's grouped as {k}. ",
    es: 'Tradicionalmente se agrupa como {k}. ',
    fr: 'Traditionnellement, il est classé sous {k}. ',
    de: 'Traditionell wird es als {k} eingeordnet. ',
    ja: '伝統的には{k}に分類されます。',
  },
  overviewLunar: {
    zh: '对应农历{k}。',
    en: 'It corresponds to the lunar date {k}. ',
    es: 'Corresponde a la fecha lunar {k}. ',
    fr: 'Cela correspond à la date lunaire {k}. ',
    de: 'Es entspricht dem Monddatum {k}. ',
    ja: '旧暦{k}に対応します。',
  },
  overviewClosing: {
    zh: '下面的详细解读，就是把这些翻译成你日常里的样子。',
    en: 'What follows translates all of this into everyday language.',
    es: 'Lo que sigue traduce todo esto al lenguaje cotidiano.',
    fr: 'Ce qui suit traduit tout cela en langage quotidien.',
    de: 'Im Folgenden wird das in Alltagssprache übersetzt.',
    ja: '以下の詳しい解読は、これらを日常の言葉に翻訳したものです。',
  },
  personalityShen: {
    zh: ' 后天你越来越活成的样子，则和「{k}」代表的方向有关。',
    en: ' Over time you grow more into the direction of {k}. ',
    es: ' Con el tiempo te vas pareciendo más a la dirección que representa {k}. ',
    fr: ' Avec le temps, vous évoluez davantage dans la direction représentée par {k}. ',
    de: ' Mit der Zeit entwickelst du dich stärker in die Richtung, die {k} repräsentiert. ',
    ja: ' 後天的にあなたが近づいていく姿は、「{k}」が表す方向と関係しています。',
  },
  personalityClosing: {
    zh: ' 记住这只是倾向，你身上从来不止这一面。',
    en: ' These are tendencies, never the whole of you.',
    es: ' Son tendencias, nunca la totalidad de quien eres.',
    fr: ' Ce sont des tendances, jamais la totalité de qui vous êtes.',
    de: ' Das sind Tendenzen, nie das Ganze deiner Person.',
    ja: ' これらは傾向に過ぎず、あなたの全てでは決してありません。',
  },
  personalityNoMajorSuffix: {
    zh: ' 你身上从来不止一种样子，这反而是你的余地。',
    en: ' That leaves you room to be more than one thing.',
    es: ' Eso te deja espacio para ser más de una cosa.',
    fr: ' Cela vous laisse de la place pour être plus qu’une seule chose.',
    de: ' Das lässt dir Raum, mehr als nur eine Sache zu sein.',
    ja: ' それはあなたが一つの姿に縛られない余地でもあります。',
  },
  palaceEmpty: {
    zh: '这一宫没有落主要星曜，传统上把它看作这一块比较随缘、可塑性大——不必特别解读，顺着自己的情况来就好。',
    en: 'No major stars here. Traditionally this area is read as open-ended — nothing to over-interpret; just go with your own situation.',
    es: 'Aquí no hay estrellas principales. Tradicionalmente esta zona se lee como abierta: no hay que sobreinterpretarla; sigue tu propia situación.',
    fr: 'Aucune étoile majeure ici. Traditionnellement, cette zone est lue comme ouverte – rien à surinterpréter ; suivez simplement votre propre situation.',
    de: 'Keine Hauptsterne hier. Traditionell wird dieser Bereich als offen gelesen – nichts zu überinterpretieren; geh einfach deinen Weg.',
    ja: 'この宮に主星はありません。伝統的には、この部分は縛りが少なく可塑性が高いと見なします——特に深読みする必要はなく、自分の状況に合わせれば大丈夫です。',
  },
  palaceIntro: {
    zh: '说到{area}：',
    en: 'Regarding {area}: ',
    es: 'En cuanto a {area}: ',
    fr: 'En ce qui concerne {area} : ',
    de: 'Was {area} betrifft: ',
    ja: '{area}について言うと：',
  },
  palaceClosing: {
    zh: '合起来看，这一块的主题是{title}——当作一个观察自己的角度，不是定论。',
    en: 'Together the theme is {title} — a lens for reflection, not a verdict.',
    es: 'En conjunto, el tema de esta zona es {title}: un ángulo para observarte, no una sentencia.',
    fr: 'Ensemble, le thème de cette zone est {title} – un prisme pour réfléchir, pas un verdict.',
    de: 'Zusammengefasst ist das Thema hier {title} – eine Brille zur Selbstreflexion, kein Urteil.',
    ja: '総合すると、この部分のテーマは「{title}」です——自分を見つめる一つの視点であり、決定論ではありません。',
  },
  daXianThemeFallback: {
    zh: '相对平静、按部就班',
    en: 'quieter, steady-going',
    es: 'más tranquilo, siguiendo el ritmo',
    fr: 'plus calme, régulier',
    de: 'ruhiger, beständig',
    ja: '比較的穏やかで、順調に進む',
  },
  daXianFarNote: {
    zh: '（排位）',
    en: ' (slot only)',
    es: ' (solo casilla)',
    fr: ' (case uniquement)',
    de: ' (nur Slot)',
    ja: '（枠のみ）',
  },
  daXianFarText: {
    zh: '这一段只是十二格排满后落在「{k}」上的位置，没有现实参考价值——列出来是为了让十二宫的循环完整，不代表会活到这个岁数。',
    en: 'This slot simply lands on {k} once the twelve-palace cycle is filled. It has no practical relevance — it’s listed only to complete the cycle, not as a lifespan prediction.',
    es: 'Este tramo solo cae en {k} una vez completado el ciclo de las doce casas. No tiene relevancia práctica: se lista solo para completar el ciclo, no como predicción de longevidad.',
    fr: 'Cette étape tombe simplement sur {k} une fois le cycle des douze maisons rempli. Elle n’a aucune pertinence pratique : elle n’est listée que pour compléter le cycle, pas comme une prédiction de longévité.',
    de: 'Dieser Abschnitt fällt nur auf {k}, sobald der Zyklus der zwölf Paläste gefüllt ist. Er hat keine praktische Bedeutung – er dient nur der Vervollständigung des Zyklus, keiner Lebenserwartungsprognose.',
    ja: 'この区間は、十二宮のサイクルを埋めた結果「{k}」に位置するだけで、現実的な参考にはなりません——十二宮の循環を完整にするために載せているだけで、その年齢まで生きることを意味するものではありません。',
  },
  daXianOpening: {
    zh: '这十年主题偏向「{theme}」，对应的生活面是{area}。',
    en: 'The theme leans toward "{theme}", around {area}. ',
    es: 'El tema de esta década se inclina hacia «{theme}», en torno a {area}. ',
    fr: 'Le thème de cette décennie penche vers « {theme} », autour de {area}. ',
    de: 'Das Thema dieser Dekade tendiert zu „{theme}“, rund um {area}. ',
    ja: 'この十年のテーマは「{theme}」に偏り、対応する生活面は{area}です。',
  },
  daXianClosing: {
    zh: '可以把它理解为这段时间你大概会把心力放在哪一类事情上——不是预言会发生什么。',
    en: 'Think of it as where you may direct your energy — not a prediction of events.',
    es: 'Piénsalo como el tipo de cosas en las que probablemente concentres tu energía en este periodo, no como una predicción de lo que sucederá.',
    fr: 'Considérez-le comme le type de choses sur lesquelles vous porterez probablement votre énergie durant cette période – non comme une prédiction d’événements.',
    de: 'Sieh es als das, worauf du in dieser Zeit vermutlich deine Energie richtest – keine Vorhersage von Ereignissen.',
    ja: 'この時期にあなたがどんなことに力を注ぐかの傾向と理解してください——何が起こるかの予言ではありません。',
  },
  currentPhaseYes: {
    zh: '按引擎的计算，你现在大约 {age} 岁（虚岁），正走在「{label}」这一段。{text}',
    en: 'By the engine, you’re around {age} (East Asian age reckoning), in the phase "{label}". {text}',
    es: 'Según el motor, tienes unos {age} años (edad tradicional china) y estás en la etapa «{label}». {text}',
    fr: 'Selon le moteur, vous avez environ {age} ans (décompte traditionnel est-asiatique), dans la phase « {label} ». {text}',
    de: 'Der Berechnung zufolge bist du etwa {age} (ostasiatische Alterszählung) in der Phase „{label}“. {text}',
    ja: 'エンジンの計算によると、あなたは現在約{age}歳（数え年）で、「{label}」の段階にいます。{text}',
  },
  currentPhaseNo: {
    zh: '按引擎的计算，你现在大约 {age} 岁（虚岁）。具体处在哪一段大限，请以排盘页面为准。',
    en: 'By the engine, you’re around {age} (East Asian age reckoning). Check the chart page for the exact phase.',
    es: 'Según el motor, tienes unos {age} años (edad tradicional china). Consulta la página del cálculo para la etapa exacta.',
    fr: 'Selon le moteur, vous avez environ {age} ans (décompte traditionnel est-asiatique). Consultez la page du calcul pour l’étape exacte.',
    de: 'Der Berechnung zufolge bist du etwa {age} (ostasiatische Alterszählung). Die genaue Phase findest du auf der Chart-Seite.',
    ja: 'エンジンの計算によると、あなたは現在約{age}歳（数え年）です。具体的にどの大限にいるかは、排盤ページで確認してください。',
  },
  patternsTitle: {
    zh: '组合起来看',
    en: 'The bigger picture',
    es: 'Visión de conjunto',
    fr: 'Vue d’ensemble',
    de: 'Das Gesamtbild',
    ja: '全体を見る',
  },
  patternsIntro: {
    zh: '排盘引擎还看了这张盘的「格局」——也就是几颗星凑在一起形成的整体组合。{tone}',
    en: 'The engine also looked at chart patterns — combinations of stars that form a bigger picture. {tone}',
    es: 'El motor también analizó los «patrones» de la carta: combinaciones de estrellas que forman un conjunto. {tone}',
    fr: 'Le moteur a aussi examiné les « configurations » du thème – des combinaisons d’étoiles qui forment un ensemble. {tone}',
    de: 'Der Engine hat auch die „Muster“ des Horoskops betrachtet – Kombinationen von Sternen, die ein größeres Ganzes ergeben. {tone}',
    ja: '排盤エンジンはこの命盤の「格局」——複数の星が集まってできる全体的な組み合わせ——も見ています。{tone}',
  },
  patternsShen: {
    zh: ' 传统上命宫还会带几个星神（{k}）。这些多是看岁运、看阶段的标记，不是先天性格；当作古人给命盘做的备注就好，不必当成对你的定义。',
    en: ' Traditionally your core palace also carries a few markers ({k}). Most describe stage or yearly-cycle positions rather than inborn character — treat them as old notes on the chart, not as a definition of you. ',
    es: ' Tradicionalmente, tu palacio central también lleva algunos marcadores ({k}). La mayoría describe etapas o posiciones del ciclo anual, no el carácter de nacimiento: tómalos como notas antiguas de la carta, no como una definición de ti. ',
    fr: ' Traditionnellement, votre palais central porte aussi quelques marqueurs ({k}). La plupart décrivent des étapes ou des positions du cycle annuel, non le caractère de naissance : voyez-les comme de vieilles notes sur le thème, non comme une définition de vous. ',
    de: ' Traditionell trägt dein Kernpalast auch ein paar Markierungen ({k}). Die meisten beschreiben Etappen oder Positionen im Jahreszyklus, nicht den angeborenen Charakter – betrachte sie als alte Notizen zum Horoskop, nicht als Definition deiner selbst. ',
    ja: ' 伝統的には、命宮にいくつかの星神（{k}）も添えられます。多くは歳運や段階の位置を示すもので、生まれつきの性格ではありません。古人が命盤に付けた覚え書き程度に受け止め、あなたを定義するものとは考えないでください。',
  },
  caveatsIntro: {
    zh: '几句实话：这份报告把引擎算出的命盘翻成了大白话，方便你对照自己的生活想一想。',
    en: "A few honest notes: this report turns the engine's chart into plain language, so you can reflect on your own life. ",
    es: 'Algunas notas honestas: este reportaje traduce la carta del motor a lenguaje sencillo, para que puedas reflexionar sobre tu propia vida. ',
    fr: 'Quelques mots honnêtes : ce rapport traduit le thème du moteur en langage simple, pour que vous puissiez réfléchir à votre propre vie. ',
    de: 'Ein paar ehrliche Worte: Dieser Bericht übersetzt das Horoskop des Engines in einfache Sprache, damit du über dein eigenes Leben nachdenken kannst. ',
    ja: '率直なお断り：このレポートはエンジンが出した命盤を平易な言葉に翻訳し、自分の生活と照らし合わせて考えるためのものです。',
  },
  caveatsTimeUnknown: {
    zh: '你的出生时间不确定，所以没有涉及具体时辰的判断。',
    en: 'Your birth time is unknown, so nothing depends on a specific hour. ',
    es: 'Tu hora de nacimiento es incierta, así que nada depende de una hora concreta. ',
    fr: 'Votre heure de naissance est inconnue, donc rien ne dépend d’une heure précise. ',
    de: 'Deine Geburtszeit ist unbekannt, also hängt nichts von einer bestimmten Stunde ab. ',
    ja: '出生時刻が不明なため、特定の時辰に関わる判断は含まれません。',
  },
  caveatsTimeClock: {
    zh: '时间按你填的当地钟表时间算。',
    en: 'The time was taken from the local clock time you entered. ',
    es: 'La hora se tomó del reloj local que introdujiste. ',
    fr: 'L’heure a été prise sur le réveil local que vous avez saisi. ',
    de: 'Die Zeit stammt aus der lokalen Uhrzeit, die du eingegeben hast. ',
    ja: '時刻は入力された現地の時計の時刻に基づいています。',
  },
  caveatsTimeCorrected: {
    zh: '时间已按出生地点校正。',
    en: 'The time was adjusted for your birth location. ',
    es: 'La hora se ajustó según tu lugar de nacimiento. ',
    fr: 'L’heure a été ajustée selon votre lieu de naissance. ',
    de: 'Die Zeit wurde nach deinem Geburtsort korrigiert. ',
    ja: '出生場所に基づいて時刻を補正しました。',
  },
  caveatsClosing: {
    zh: '它不预测将来会发生什么，不判断吉凶，也不会替你做任何决定。事业、感情、健康上的具体选择，请靠现实里的信息和专业意见。把它当成一面提供不同角度的镜子就好。',
    en: "It predicts nothing, judges no outcome, and makes no decisions for you. For real choices about career, relationships or health, rely on real information and qualified advice. Treat it as a mirror offering a different angle.",
    es: 'No predice nada, no juzga resultados y no toma decisiones por ti. Para decisiones reales sobre carrera, relaciones o salud, apóyate en información real y en opinión cualificada. Trátalo como un espejo que ofrece otro ángulo.',
    fr: 'Il ne prédit rien, ne juge aucun résultat et ne prend aucune décision pour vous. Pour de vrais choix sur la carrière, les relations ou la santé, appuyez-vous sur des informations réelles et un avis qualifié. Considérez-le comme un miroir offrant un autre angle.',
    de: 'Es sagt nichts voraus, beurteilt kein Ergebnis und trifft keine Entscheidungen für dich. Bei echten Entscheidungen über Karriere, Beziehungen oder Gesundheit, vertraue auf echte Informationen und qualifizierten Rat. Betrachte es als Spiegel mit einem anderen Blickwinkel.',
    ja: '将来起こることを予測したり、吉凶を判断したり、あなたに代わって決断したりすることはありません。キャリア、人間関係、健康に関する具体的な選択は、現実の情報と専門家の意見に依拠してください。別の角度を提供する鏡として捉えれば十分です。',
  },
} satisfies Record<string, Record<Lang, string>>;

/** 主星/辅星/四化嵌入句的前缀与后缀（六语言）。 */
const SLOT: Record<'majors' | 'aux' | 'sihua', Record<Lang, Slot>> = {
  majors: {
    zh: { prefix: '这里有', suffix: '。' },
    en: { prefix: '', suffix: '. ' },
    es: { prefix: 'Aquí tienes ', suffix: '. ' },
    fr: { prefix: 'Ici, ', suffix: '. ' },
    de: { prefix: 'Hier sind ', suffix: '. ' },
    ja: { prefix: 'ここには', suffix: '。' },
  },
  aux: {
    zh: { prefix: '另外', suffix: '。' },
    en: { prefix: 'Also ', suffix: '. ' },
    es: { prefix: 'Además ', suffix: '. ' },
    fr: { prefix: 'De plus ', suffix: '. ' },
    de: { prefix: 'Außerdem ', suffix: '. ' },
    ja: { prefix: 'さらに', suffix: '。' },
  },
  sihua: {
    zh: { prefix: '还标出了', suffix: '。' },
    en: { prefix: 'Marked: ', suffix: '. ' },
    es: { prefix: 'Señalado: ', suffix: '. ' },
    fr: { prefix: 'Marqué : ', suffix: '. ' },
    de: { prefix: 'Markiert: ', suffix: '. ' },
    ja: { prefix: '次が示されています：', suffix: '。' },
  },
};

/** 生成完整报告；输入引擎原始 chart、已算好的 timeNote、目标语言与时间元数据。 */
export function generateFullReading(
  raw: unknown,
  timeNote: string,
  lang: Lang,
  timeMeta: FullTimeMeta,
): FullReportContent {
  void timeNote; // timeNote 仅作兼容留参；分支逻辑改用 timeStatus / hasDST 元数据
  const L = (r: Record<Lang, string>): string => r[lang];
  const sub = (r: Record<Lang, string>, map: Record<string, string>): string => {
    let s = r[lang];
    for (const [k, v] of Object.entries(map)) s = s.replace(`{${k}}`, v);
    return s;
  };

  const chart = raw as RawChart;
  const palaces = chart.palaces ?? [];
  const majorOf = (p: RawPalace) => (p.stars ?? []).filter((s) => s.type === 'major').map((s) => s.name);
  const auxOf = (p: RawPalace) => (p.stars ?? []).filter((s) => s.type !== 'major').map((s) => s.name);

  const ming = palaces.find((p) => p.name.includes('命宫'));
  const majorNames = ming ? majorOf(ming) : [];
  const mainInfos = majorNames.map((n) => plainOf(n)).filter((p): p is StarPlain => Boolean(p));
  const keywords = mainInfos.map((s) => s[lang].label).join(lang === 'zh' ? '、' : ' + ') || NO_MAJOR[lang].label;

  const lunar = chart.lunarInfo
    ? (lang === 'zh'
        ? `${chart.lunarInfo.lunarYear}年${chart.lunarInfo.lunarMonth}月${chart.lunarInfo.lunarDay}日`
        : `${chart.lunarInfo.lunarYear}-${String(chart.lunarInfo.lunarMonth).padStart(2, '0')}-${String(chart.lunarInfo.lunarDay).padStart(2, '0')}`)
    : '';

  const overview =
    sub(T.overviewPrefix, { k: keywords }) +
    (majorNames.length
      ? sub(T.overviewCoreStars, { k: majorNames.join(lang === 'zh' ? '、' : ', ') })
      : L(T.overviewNoMajor)) +
    (chart.wuxingJuName ? sub(T.overviewWuxing, { k: chart.wuxingJuName }) : '') +
    (lunar ? sub(T.overviewLunar, { k: lunar }) : '') +
    L(T.overviewClosing);

  const personality = mainInfos.length
    ? `${mainInfos.map((s) => s[lang].traits).join(lang === 'zh' ? '' : ' ')}` +
      (chart.shenZhu ? sub(T.personalityShen, { k: chart.shenZhu }) : '') +
      L(T.personalityClosing)
    : `${NO_MAJOR[lang].traits}` + L(T.personalityNoMajorSuffix);

  // 十二宫逐宫：只取最有信息量的宫，避免把 12 个空宫都写成废话。
  const palaceOrder = ['命宫', '身宫', '夫妻', '财帛', '官禄', '迁移', '福德', '疾厄', '田宅', '父母', '兄弟', '子女', '仆役'];
  const palaceSections: PalaceSection[] = [];
  for (const key of palaceOrder) {
    const p = palaces.find((x) => x.name.includes(key));
    if (!p) continue;
    const metaLang = PALACE_META[key]?.[lang];
    if (!metaLang) continue;
    const majors = majorOf(p);
    const auxs = auxOf(p).slice(0, 3);
    const sihua = (p.stars ?? []).filter((s) => s.siHua).map((s) => `${s.name}${s.siHua}`);
    const hasInfo = majors.length || auxs.length || sihua.length;
    if (!hasInfo) {
      palaceSections.push({ key, title: metaLang.title, text: L(T.palaceEmpty) });
      continue;
    }
    const sihuaSlot = SLOT.sihua[lang];
    const sihuaList = sihua
      .map((s) => { const q = parseSiHua(s); return q ? `${q.star}${lang === 'zh' ? '——' : ' — '}${q.plain[lang]}` : s; })
      .join(lang === 'zh' ? '；' : '; ');
    const text =
      sub(T.palaceIntro, { area: metaLang.area }) +
      (majors.length ? `${SLOT.majors[lang].prefix}${starLine(majors, lang)}${SLOT.majors[lang].suffix}` : '') +
      (auxs.length ? `${SLOT.aux[lang].prefix}${starLine(auxs, lang)}${SLOT.aux[lang].suffix}` : '') +
      (sihua.length ? `${sihuaSlot.prefix}${sihuaList}${sihuaSlot.suffix}` : '') +
      sub(T.palaceClosing, { title: metaLang.title });
    palaceSections.push({ key, title: metaLang.title, text });
  }

  // 大限：每十年一个阶段，取该阶段宫位的星曜翻译，只讲主题不讲事件。
  // 年龄前缀与单位按语言分别写成映射，避免嵌套三元把英文错落到德文 Jahre。
  const AGE_PREFIX: Record<Lang, string> = { zh: '', ja: '', en: 'Age ', es: 'Edad ', fr: 'Âge ', de: 'Alter ' };
  const AGE_UNIT: Record<Lang, string> = { zh: ' 岁', ja: '歳', en: ' years', es: ' años', fr: ' ans', de: ' Jahre' };
  // 宫名：zh / ja 沿用汉字（日文同字），其余语言用 PALACE_META 的本地化标题，不在西/法/德文里露出中文。
  const palaceNameIn = (name: string) =>
    lang === 'zh' || lang === 'ja' ? name : (PALACE_META[name]?.[lang]?.title ?? name);
  const daXianSections: DaXianSection[] = (chart.daXians ?? []).map((d) => {
    const p = palaces.find((x) => x.branch === d.palaceBranch);
    const majors = p ? majorOf(p) : [];
    const plain = majors.map((n) => plainOf(n)).filter((x): x is StarPlain => Boolean(x));
    const theme = plain.length ? plain.map((s) => s[lang].label).join(lang === 'zh' ? '、' : ' + ') : L(T.daXianThemeFallback);
    const farOut = d.startAge >= 95;
    const label = `${AGE_PREFIX[lang]}${d.startAge}–${d.endAge}${AGE_UNIT[lang]} · ${palaceNameIn(d.palaceName)}${farOut ? L(T.daXianFarNote) : ''}`;
    if (farOut) {
      return { label, text: sub(T.daXianFarText, { k: palaceNameIn(d.palaceName) }) };
    }
    const areaLang = PALACE_META[d.palaceName]?.[lang]?.area ?? d.palaceName;
    const text =
      sub(T.daXianOpening, { theme, area: areaLang }) +
      (majors.length ? `${SLOT.majors[lang].prefix}${starLine(majors, lang)}${SLOT.majors[lang].suffix}` : '') +
      L(T.daXianClosing);
    return { label, text };
  });

  const idx = typeof chart.currentDaXianIndex === 'number' ? chart.currentDaXianIndex : -1;
  const cur = idx >= 0 ? daXianSections[idx] : undefined;
  const age = chart.currentAge;
  const currentPhase = cur
    ? sub(T.currentPhaseYes, { age: String(age ?? ''), label: cur.label, text: cur.text })
    : sub(T.currentPhaseNo, { age: String(age ?? '') });

  // 格局与神煞：引擎负责判定「命中了什么」，我们只把它翻成白话，不引用古籍/讲义原文。
  // 格局名本身是传统术语，这里刻意不逐个列出，只讲整体倾向，避免又把术语堆回给用户。
  let patternsSection: PatternsSection | undefined;
  try {
    const hits = detectPatterns(raw as Parameters<typeof detectPatterns>[0]);
    const levels = hits.map((p) => p.level);
    const high = levels.filter((l) => l === 'excellent' || l === 'good').length;
    const caution = levels.filter((l) => l === 'caution').length;
    const mingBranch = typeof chart.mingGongBranch === 'number'
      ? chart.mingGongBranch
      : (ming?.branch ?? 0);
    const yearBranch = chart.lunarInfo?.yearBranch;
    const shenNames: string[] = [];
    if (typeof yearBranch === 'number') {
      shenNames.push(jiangQianShenName(yearBranch, mingBranch));
      shenNames.push(suiQianShenName(yearBranch, mingBranch));
    }
    if (ming?.changsheng12) shenNames.push(ming.changsheng12);
    if (ming?.boshi12) shenNames.push(ming.boshi12);
    // 四组神名可能重名（如小耗 / 官符 / 病符），去重后再逐条说明。
    const shenPlain = Array.from(new Set(shenNames)).map((n) => {
      const label = shierShenLabel(n, lang);
      const p = plainShierShen(n, lang);
      if (!p) return label;
      const traits = p.traits.replace(/[。.]\s*$/, '');
      return lang === 'zh' || lang === 'ja'
        ? `${label}（${p.label}）——${traits}`
        : `${label} (${p.label}) — ${traits}`;
    });
    const tone = patternLevelPlain(high, caution, hits.length, lang);
    const text = sub(T.patternsIntro, { tone }) +
      (shenPlain.length ? sub(T.patternsShen, { k: shenPlain.join(lang === 'zh' ? '、' : ', ') }) : '');
    patternsSection = { title: L(T.patternsTitle), text, count: hits.length };
  } catch {
    // 格局识别若因异常命盘失败，不影响主报告其余部分。
    patternsSection = undefined;
  }

  // 夏令时核对提醒：沿用引擎口径，只提示不自动改时间（用 hasDST 元数据，不解析 timeNote）。
  const bi = chart.birthInfo;
  const dstText = timeMeta.hasDST && bi
    ? ` ${chinaDSTNotice(bi.year, bi.month, bi.day, lang) ?? ''}`
    : '';

  const timeCaveat =
    timeMeta.timeStatus === 'unknown' ? L(T.caveatsTimeUnknown)
    : timeMeta.timeStatus === 'clock' ? L(T.caveatsTimeClock)
    : L(T.caveatsTimeCorrected);

  const caveats = L(T.caveatsIntro) + timeCaveat + dstText + L(T.caveatsClosing);

  return {
    overview,
    personality,
    palaces: palaceSections,
    daXian: daXianSections,
    patterns: patternsSection,
    currentPhase,
    caveats,
  };
}
