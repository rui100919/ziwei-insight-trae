/**
 * 星曜白话词典：把排盘引擎给出的传统星曜名翻译成普通人能懂的日常描述。
 * 只描述性格与行事倾向，不做吉凶判断、不预测具体事件。
 * 译法是传统紫微斗数的通俗讲法，不是引擎计算出的新事实。
 *
 * 全部六种语言（zh / en / es / fr / de / ja）各有独立译文，新语言绝不复制英文。
 */

import type { Lang } from '@/lib/i18n';

export type StarPlainEntry = {
  /** 一句话标签，如「爱琢磨、点子多」 */
  label: string;
  /** 性格白话，1-2 句 */
  traits: string;
  /** 擅长什么，1 句 */
  talent: string;
};

export type StarPlain = Record<Lang, StarPlainEntry>;

const STARS: Record<string, StarPlain> = {
  紫微: {
    zh: { label: "有主见、想挑大梁", traits: "你做事喜欢自己拿主意，也愿意站出来带队伍。别人拿不准的时候，往往先想到问你。", talent: "统筹、拍板、把一群人组织起来。" },
    en: { label: "independent, natural leader", traits: "You like to make your own decisions and don’t mind taking charge. When others are unsure, they often turn to you first.", talent: "Coordinating, deciding, and bringing people together." },
    es: { label: "con criterio propio, líder nato", traits: "Te gusta decidir por tu cuenta y no te importa hacerte cargo. Cuando otros no están seguros, suelen recurrir a ti primero.", talent: "Coordinar, decidir y reunir a la gente." },
    fr: { label: "assuré, leader naturel", traits: "Vous aimez décider seul et prendre les choses en main. Quand les autres hésitent, c’est souvent à vous qu’ils s’adressent en premier.", talent: "Coordonner, trancher et fédérer les gens." },
    de: { label: "eigenständig, geborene Führungspersönlichkeit", traits: "Du entscheidest gern selbst und übernimmst gern Verantwortung. Wenn andere unsicher sind, fragen sie oft zuerst dich.", talent: "Koordinieren, entscheiden und Menschen zusammenbringen." },
    ja: { label: "自分の意思を持ち、先頭に立ちたい", traits: "物事は自分で決めたいタイプで、進んで人をまとめようとします。周りが迷ったとき、真っ先にあなたに相談することが多いでしょう。", talent: "全体を取りまとめ、決断し、人を一つにすること。" },
  },
  天机: {
    zh: { label: "脑子快、爱琢磨", traits: "你反应灵敏，一件事会在脑子里转好几遍，点子也比别人多。代价是有时想太多，容易累。", talent: "分析、出主意、临场应变。" },
    en: { label: "quick-thinking, curious", traits: "You pick things up fast and turn a problem over in your mind several times. You have more ideas than most — the trade-off is overthinking.", talent: "Analysing, brainstorming, adapting on the spot." },
    es: { label: "ágil, curioso", traits: "Aprendes rápido y le das vueltas a un problema varias veces en la cabeza. Tienes más ideas que la mayoría; a cambio, a veces piensas de más y te cansas.", talent: "Analizar, dar ideas y adaptarte sobre la marcha." },
    fr: { label: "vif, curieux", traits: "Vous saisissez vite et remuez un problème plusieurs fois dans votre tête. Vous avez plus d’idées que la plupart ; en contrepartie, vous réfléchissez parfois trop et vous épuisez.", talent: "Analyser, trouver des idées et s’adapter sur le terrain." },
    de: { label: "schnell denkend, neugierig", traits: "Du erfasst Dinge schnell und drehst ein Problem mehrmals im Kopf herum. Du hast mehr Ideen als die meisten – der Preis ist, dass du manchmal zu viel nachdenkst und erschöpfst.", talent: "Analysieren, Ideen entwickeln und spontan reagieren." },
    ja: { label: "頭の回転が速く、思索を楽しむ", traits: "反応が素早く、物事を何度も頭の中で反芻し、人より多くのアイデアを思いつきます。その分、考えすぎて疲れやすい面もあります。", talent: "分析し、アイデアを出し、その場で臨機応変に対応すること。" },
  },
  太阳: {
    zh: { label: "热心、爱照顾人", traits: "你外放、有能量，愿意为别人忙前忙后，也在意别人怎么看你。被需要的时候你最有干劲。", talent: "表达、服务他人、站在台前。" },
    en: { label: "warm, generous", traits: "You’re open and energetic, happy to go out of your way for people, and you do care how others see you. Being needed brings out your best.", talent: "Communicating, helping others, being visible." },
    es: { label: "cálido, generoso", traits: "Eres abierto y enérgico, te gusta esforzarte por los demás y te importa lo que piensen de ti. Cuando te necesitan, das lo mejor de ti.", talent: "Expresarte, servir a los demás y estar en primer plano." },
    fr: { label: "chaleureux, généreux", traits: "Vous êtes ouvert et énergique, prêt à vous dépasser pour les autres, et vous tenez à ce qu’on pense de vous. Quand on a besoin de vous, vous donnez le meilleur de vous-même.", talent: "Vous exprimer, aider les autres et être visible." },
    de: { label: "herzlich, großzügig", traits: "Du bist offen und energiegeladen, machst dich gerne für andere stark und dir ist wichtig, wie andere dich sehen. Wenn man dich braucht, zeigst du deine beste Seite.", talent: "Kommunizieren, anderen helfen und im Mittelpunkt stehen." },
    ja: { label: "情熱的で人の面倒を見る", traits: "外交的でエネルギーに満ち、人のために尽くすのを厭わず、周りからどう見られるかも気にします。必要とされるときに一番力を発揮します。", talent: "表現し、人に尽くし、表に立つこと。" },
  },
  武曲: {
    zh: { label: "务实、说一不二", traits: "你重实际、讲原则，决定的事就往下做，不太爱把感情挂在嘴上。别人可能觉得你有点冷，其实你只是不爱空谈。", talent: "管钱、执行、做艰难的决定。" },
    en: { label: "practical, decisive", traits: "You’re grounded and principled — once you decide, you follow through. You don’t wear your heart on your sleeve; people may read that as cold, but it’s really a dislike of empty talk.", talent: "Managing money, executing, making tough calls." },
    es: { label: "práctico, firme", traits: "Eres realista y de principios: una vez que decides, lo cumples. No te gusta hablar de tus sentimientos; algunos pueden verte frío, pero en realidad solo detestas las palabras vacías.", talent: "Gestionar dinero, ejecutar y tomar decisiones difíciles." },
    fr: { label: "pratique, ferme", traits: "Vous êtes terre-à-terre et de principe : une fois décidé, vous allez au bout. Vous n’exhibez pas vos sentiments ; certains peuvent le lire comme de la froideur, mais c’est surtout un refus des discours creux.", talent: "Gérer l’argent, exécuter et prendre des décisions difficiles." },
    de: { label: "praktisch, konsequent", traits: "Du bist bodenständig und prinzipientreu – einmal entschieden, ziehst du es durch. Du trägst dein Herz nicht auf der Zunge; andere halten dich vielleicht für kühl, aber eigentlich hasst du nur leere Worte.", talent: "Geld verwalten, umsetzen und schwierige Entscheidungen treffen." },
    ja: { label: "現実的で、言ったことは曲げない", traits: "実際的で筋を通し、決めたことはやり遂げます。感情を口にするのは得意でなく、冷たく見えることもありますが、単に空論を嫌うだけです。", talent: "お金を管理し、実行し、難しい決断をすること。" },
  },
  天同: {
    zh: { label: "随和、心软", traits: "你好相处、不爱计较，懂得享受生活，也见不得别人受苦。缺点是有时太迁就，该争取的没争取。", talent: "调和气氛、包容别人、把日子过得舒服。" },
    en: { label: "easy-going, kind-hearted", traits: "You’re easy to get along with, slow to take offence, and know how to enjoy life. You hate seeing others suffer. The downside is you can be too accommodating.", talent: "Smoothing tensions, being accommodating, and making life comfortable." },
    es: { label: "afable, bondadoso", traits: "Eres fácil de tratar, no te ofendes fácilmente y sabes disfrutar de la vida. No soportas ver a los demás sufrir. Lo malo es que a veces te acomodas demasiado y no luchas por lo que te toca.", talent: "Suavizar tensiones, ser comprensivo y llevar la vida con comodidad." },
    fr: { label: "facile à vivre, au cœur tendre", traits: "Vous êtes facile à vivre, vous ne vous offusquez pas vite et vous savez jouir de la vie. Vous ne supportez pas de voir les autres souffrir. Le revers : vous vous accommodez parfois trop et ne revendiquez pas ce qui vous revient.", talent: "Apaiser les tensions, être tolérant et rendre la vie agréable." },
    de: { label: "locker, weichherzig", traits: "Du bist leicht im Umgang, beleidigst dich nicht schnell und weißt das Leben zu genießen. Du kannst es nicht ertragen, wenn andere leiden. Der Nachteil: Du bist manchmal zu entgegenkommend und holst dir nicht, was dir zusteht.", talent: "Spannungen glätten, anderen entgegenkommen und es sich gemütlich machen." },
    ja: { label: "気さくで心が柔らかい", traits: "人付き合いが良く、細かいことを気にせず、人生を楽しむのが上手です。他人が苦しむのを見るのは辛い。欠点は、時に妥協しすぎて、当然の権利を主張しないことです。", talent: "場の空気を和らげ、人を受け入れ、心地よく暮らすこと。" },
  },
  廉贞: {
    zh: { label: "感情浓、有个性", traits: "你对人在乎得很深，做事有自己的一套，既讲规矩又带点叛逆。情绪来得快，但保鲜期不一定长。", talent: "经营关系、审美、拿捏分寸。" },
    en: { label: "intense, individualistic", traits: "You care deeply about people and do things your own way — rule-following with a rebellious streak. Feelings come on strong, though they don’t always last.", talent: "Building relationships, aesthetics, reading the room." },
    es: { label: "intenso, con carácter", traits: "Te importa mucho la gente y haces las cosas a tu manera: cumples las reglas, pero con un punto rebelde. Las emociones llegan con fuerza, aunque no siempre duran.", talent: "Cultivar relaciones, tener buen gusto y medir las situaciones." },
    fr: { label: "intense, original", traits: "Vous tenez beaucoup aux gens et faites les choses à votre façon : vous suivez les règles, mais avec une touche rebelle. Les émotions sont fortes, sans toujours durer.", talent: "Cultiver des relations, l’esthétique et lire la situation." },
    de: { label: "intensiv, eigenwillig", traits: "Dir liegen die Menschen sehr am Herzen und du machst die Dinge auf deine Art – regelbewusst, aber mit einer rebellischen Ader. Gefühle kommen stark, halten aber nicht immer lange.", talent: "Beziehungen aufbauen, Ästhetik und Situationen richtig einschätzen." },
    ja: { label: "情が深く、個性がある", traits: "人を大切に思い、物事には自分の流儀があり、規則を守りつつも反骨精神があります。感情は強く湧き上がりますが、長続きしないこともあります。", talent: "人間関係を築き、審美眼を持ち、場の空気を読むこと。" },
  },
  天府: {
    zh: { label: "稳重、会过日子", traits: "你给人踏实的感觉，能包容、会储存、懂规划，不喜欢大起大落。风险来的时候，你是那个稳住阵脚的人。", talent: "管理、理财、统筹资源。" },
    en: { label: "steady, dependable", traits: "You come across as solid and dependable — good at saving, planning, and keeping things stable. When trouble hits, you’re the one who keeps a cool head.", talent: "Managing, budgeting, organising resources." },
    es: { label: "estable, confiable", traits: "Transmites solidez y confianza: sabes ahorrar, planificar y mantener todo estable. Cuando surge un problema, tú eres quien mantiene la cabeza fría.", talent: "Gestionar, administrar el dinero y organizar los recursos." },
    fr: { label: "stable, fiable", traits: "Vous inspirez confiance et solidité : vous savez épargner, planifier et garder les choses stables. Quand le problème éclate, c’est vous qui gardez la tête froide.", talent: "Gérer, budgéter et organiser les ressources." },
    de: { label: "ruhig, verlässlich", traits: "Du wirkst solide und verlässlich – gut im Sparen, Planen und Stabilhalten. Wenn Schwierigkeiten auftauchen, bist du derjenige, der einen kühlen Kopf behält.", talent: "Verwalten, budgetieren und Ressourcen organisieren." },
    ja: { label: "穏やかで、生活上手", traits: "周囲に安心感を与え、人を受け入れ、蓄え、計画を立てるのが得意で、波乱万丈なのは苦手です。危機が来たとき、場を落ち着かせるのはあなたです。", talent: "管理し、資金をやりくりし、資源を配分すること。" },
  },
  太阴: {
    zh: { label: "细腻、敏感", traits: "你心思细，能察觉别人没说出口的情绪，眼光和审美也好。情绪容易受环境影响，需要能安心独处的空间。", talent: "观察细节、感受氛围、审美判断。" },
    en: { label: "sensitive, perceptive", traits: "You notice what others don’t say and have a good eye for beauty. Your mood is easily shaped by your surroundings, so you need space to recharge alone.", talent: "Noticing detail, sensing atmosphere, aesthetic judgement." },
    es: { label: "sensible, perceptivo", traits: "Notas lo que los demás no dicen y tienes buen ojo para la belleza. Tu estado de ánimo depende mucho del entorno, así que necesitas espacio para recargar energías a solas.", talent: "Observar detalles, percibir la atmósfera y juzgar estéticamente." },
    fr: { label: "sensible, perceptif", traits: "Vous remarquez ce que les autres ne disent pas et avez un bon œil pour la beauté. Votre moral dépend fortement de votre environnement, donc vous avez besoin d’espace pour vous ressourcer seul.", talent: "Noter les détails, sentir l’atmosphère et juger de l’esthétique." },
    de: { label: "feinfühlig, wahrnehmend", traits: "Du bemerkst, was andere nicht aussprechen, und hast ein gutes Auge für Schönheit. Deine Stimmung hängt stark von deiner Umgebung ab, deshalb brauchst du Raum, um allein neue Kraft zu schöpfen.", talent: "Details bemerken, Atmosphäre erspüren und ästhetisch urteilen." },
    ja: { label: "繊細で感受性が豊か", traits: "人が口にしない感情に気づき、美しいものを見る目も持っています。気分は環境に左右されやすく、一人で安心して過ごせる空間を必要とします。", talent: "細部に気づき、雰囲気を感じ取り、美しさを見極めること。" },
  },
  贪狼: {
    zh: { label: "兴趣广、会来事", traits: "你对新鲜东西好奇，样样都想试，跟谁都聊得来，也很会享受生活。缺点是劲头来得快、去得也快。", talent: "交际、才艺、把冷场盘活。" },
    en: { label: "curious, sociable", traits: "You’re curious about everything, willing to try a bit of everything, easy to talk to, and know how to have a good time. The catch is your enthusiasm can fade quickly.", talent: "Socialising, creative hobbies, livening things up." },
    es: { label: "curioso, sociable", traits: "Sientes curiosidad por todo, quieres probar un poco de todo, hablas con cualquiera y sabes disfrutar de la vida. Lo malo: tu entusiasmo llega y se va rápido.", talent: "Socializar, tener talentos artísticos y animar cualquier reunión." },
    fr: { label: "curieux, sociable", traits: "Vous êtes curieux de tout, prêt à tout essayer, vous parlez à tout le monde et savez profiter de la vie. Le revers : votre enthousiasme peut disparaître aussi vite qu’il est venu.", talent: "Socialiser, avoir des loisirs créatifs et égayer les rencontres." },
    de: { label: "neugierig, gesellig", traits: "Du bist neugierig auf alles, probierst gerne alles aus, redest mit jedem und weißt das Leben zu genießen. Der Haken: Deine Begeisterung kann schnell wieder abklingen.", talent: "Kontakte knüpfen, kreative Hobbys und Stimmung machen." },
    ja: { label: "好奇心が旺盛で、世渡りが上手", traits: "新しいものに興味があり、何でも試したくなり、誰とでも話せて、人生を楽しむのが上手です。欠点は、熱しやすく冷めやすいことです。", talent: "人付き合いし、芸術的な才能を持ち、場を盛り上げること。" },
  },
  巨门: {
    zh: { label: "爱追问、嘴利", traits: "你脑子爱较真，碰到事情习惯问到底，话说得清也说得透。这份本事让你看得比别人深，但也容易多疑、把人聊怼。", talent: "表达、分析、把道理讲明白。" },
    en: { label: "questioning, articulate", traits: "You dig into things and won’t take them at face value. You can explain things clearly and see deeper than most — but that same edge can make you suspicious or too blunt.", talent: "Communicating, analysing, explaining things clearly." },
    es: { label: "indagador, elocuente", traits: "Te metes a fondo en las cosas y no te quedas con las apariencias. Explicas con claridad y ves más allá que la mayoría; pero esa misma agudeza puede hacerte desconfiar o ser demasiado directo.", talent: "Expresarte, analizar y explicar las cosas con claridad." },
    fr: { label: "investigateur, éloquent", traits: "Vous approfondissez les choses et ne vous contentez pas des apparences. Vous expliquez clairement et voyez plus loin que la plupart ; mais cette même acuité peut vous rendre soupçonneux ou trop direct.", talent: "Vous exprimer, analyser et expliquer les choses clairement." },
    de: { label: "nachfragend, redegewandt", traits: "Du gehst Dingen auf den Grund und nimmst nichts für bare Münze. Du kannst klar erklären und siehst tiefer als die meisten – aber diese Schärfe kann dich auch misstrauisch oder zu direkt machen.", talent: "Kommunizieren, analysieren und Dinge klar erklären." },
    ja: { label: "根掘り葉掘り聞き、言葉が鋭い", traits: "物事の本質を追究し、表面的な受け取り方をしません。物事を筋道立てて説明し、人より深く見通せますが、その鋭さから疑り深くなったり、人を言い負かしたりすることもあります。", talent: "表現し、分析し、理屈を分かりやすく説くこと。" },
  },
  天相: {
    zh: { label: "厚道、讲体面", traits: "你待人厚道、重形象，做事讲规矩，愿意帮人把场面圆起来。有时太顾及别人感受，自己反而拿不定主意。", talent: "协调、辅助、维护信誉。" },
    en: { label: "decent, diplomatic", traits: "You treat people well, care about appearances, and play by the rules. You’re happy to smooth things over for others — sometimes so much that you lose sight of your own preference.", talent: "Coordinating, supporting, keeping trust." },
    es: { label: "buena persona, diplomático", traits: "Tratas bien a la gente, cuidas tu imagen y sigues las reglas. Te gusta arreglar las situaciones por los demás; a veces tanto que pierdes de vista lo que tú quieres.", talent: "Coordinar, apoyar y mantener la confianza." },
    fr: { label: "correct, diplomate", traits: "Vous traitez les gens avec égards, soignez votre image et suivez les règles. Vous aimez arranger les situations pour les autres – parfois au point de perdre de vue vos propres préférences.", talent: "Coordonner, soutenir et préserver la confiance." },
    de: { label: "anständig, diplomatisch", traits: "Du behandelst andere gut, achtest auf dein Auftreten und hältst dich an Regeln. Du glättest gerne Situationen für andere – manchmal so sehr, dass du deine eigenen Wünsche aus den Augen verlierst.", talent: "Koordinieren, unterstützen und Vertrauen wahren." },
    ja: { label: "誠実で、体面を重んじる", traits: "人に誠実に接し、自分のイメージを大切にし、規則を守ります。人のために場を取り持つのが好きですが、時に相手の気持ちを優先しすぎて、自分の意思が定まらなくなることもあります。", talent: "調整し、補佐し、信頼を守ること。" },
  },
  天梁: {
    zh: { label: "爱操心、讲道理", traits: "你有正义感，见不得不公平，遇到事爱帮人拿主意、讲道理，像身边的老大哥大姐。代价是操心多，偶尔爱说教。", talent: "给人建议、帮扶他人、守住原则。" },
    en: { label: "principled, protective", traits: "You have a strong sense of fairness and can’t stand injustice. You like to advise and look out for people, like the wise older sibling. The cost is a lot of worry and the occasional lecture.", talent: "Giving advice, helping others, holding the line." },
    es: { label: "principista, protector", traits: "Tienes un fuerte sentido de la justicia y no soportas las injusticias. Te gusta aconsejar y cuidar a los demás, como un hermano mayor sabio. El costo es mucha preocupación y, de vez en cuando, un sermón.", talent: "Dar consejos, ayudar a los demás y defender tus principios." },
    fr: { label: "intègre, protecteur", traits: "Vous avez un grand sens de l’équité et ne supportez pas l’injustice. Vous aimez conseiller et veiller sur les autres, comme un frère ou une sœur aîné(e) avisé. Le coût : beaucoup d’inquiétude et, parfois, une leçon de morale.", talent: "Conseiller, aider les autres et défendre ses principes." },
    de: { label: "prinzipientreu, beschützend", traits: "Du hast einen starken Gerechtigkeitssinn und kannst Ungerechtigkeit nicht ertragen. Du berätst und behütest andere gern, wie ein weiser älterer Bruder oder eine ältere Schwester. Der Preis ist viel Sorge und ab und zu eine Predigt.", talent: "Ratschläge geben, anderen helfen und an Prinzipien festhalten." },
    ja: { label: "心配性で、理屈を重んじる", traits: "正義感が強く、不公平には黙っていられません。困った人に助言し、理屈を説いて導く、頼れる兄貴分・姉貴分のような存在です。その分心配事が多く、時に説教じみることもあります。", talent: "人に助言し、人を支え、筋を守ること。" },
  },
  七杀: {
    zh: { label: "果断、能扛事", traits: "你独立、抗压，认准了就冲，不喜欢被人管。越是有难度的事你越来劲，但脾气急、耐性有限。", talent: "攻坚、决断、独自把难题啃下来。" },
    en: { label: "bold, resilient", traits: "You’re independent and handle pressure well — once you set your mind on something, you go. The harder the challenge, the more fired up you get, though your temper is short.", talent: "Tackling hard problems, deciding fast, working solo." },
    es: { label: "decidido, resistente", traits: "Eres independiente y aguantas bien la presión: una vez que te decides, vas a por ello. Cuanto más difícil es el reto, más te motivas, aunque te impacientas y tu paciencia tiene límites.", talent: "Atacar problemas difíciles, decidir rápido y resolver solo." },
    fr: { label: "audacieux, résistant", traits: "Vous êtes indépendant et tolérez bien la pression : une fois décidé, vous foncez. Plus le défi est dur, plus vous êtes motivé, mais vous vous emportez vite et votre patience a des limites.", talent: "S’attaquer à des problèmes difficiles, décider vite et travailler seul." },
    de: { label: "entschlossen, belastbar", traits: "Du bist unabhängig und hältst Druck gut aus – einmal im Kopf, gehst du vor. Je härter die Herausforderung, desto mehr Feuer fängst du, obwohl du schnell reagierst und deine Geduld Grenzen hat.", talent: "Schwierige Probleme anpacken, schnell entscheiden und alleine durchbeißen." },
    ja: { label: "決断力があり、困難に耐える", traits: "自立しており、プレッシャーに強く、一度決めたら突き進みます。人に指図されるのは好きではなく、難しい課題ほど燃えますが、短気で忍耐強くない面もあります。", talent: "難関に挑み、即断即決し、一人で難問をやり遂げること。" },
  },
  破军: {
    zh: { label: "敢变、不守旧", traits: "你不喜欢一成不变，敢推倒重来，看到不顺眼的总想改一改。冲劲是你的长处，也是你容易翻车的地方。", talent: "开创、改革、打破旧局。" },
    en: { label: "bold, change-loving", traits: "You hate routine and aren’t afraid to tear things down and start over. If something looks wrong, you want to fix it. That drive is your strength — and where you can trip up.", talent: "Pioneering, reforming, breaking stale patterns." },
    es: { label: "audaz, amante del cambio", traits: "Odias la rutina y no te asusta echarlo todo abajo para empezar de nuevo. Si algo no te convence, quieres cambiarlo. Ese impulso es tu punto fuerte… y donde puedes tropezar.", talent: "Innovar, reformar y romper con lo establecido." },
    fr: { label: "audacieux, friand de changement", traits: "Vous détestez la routine et n’avez pas peur de tout casser pour repartir. Si quelque chose ne va pas, vous voulez le changer. Cet élan est votre force… et l’endroit où vous pouvez trébucher.", talent: "Innover, réformer et briser les schémas figés." },
    de: { label: "mutig, veränderungslustig", traits: "Du hasst Routine und scheust dich nicht, Dinge niederzureißen und neu anzufangen. Wenn etwas nicht passt, willst du es ändern. Dieser Antrieb ist deine Stärke – und da, wo du stolpern kannst.", talent: "Neues erschließen, reformieren und alte Muster brechen." },
    ja: { label: "変化を恐れず、古いものに縛られない", traits: "同じことの繰り返しは嫌いで、思い切ってゼロからやり直す勇気があり、気に入らないものは改めたくなります。その突進力は長所であると同時に、失敗しやすい部分でもあります。", talent: "新しい道を切り開き、改革し、古い枠を打ち破ること。" },
  },
};

/** 四化：传统上把星曜的四种变化说成禄/权/科/忌，这里译成日常语言。 */
const SIHUA: Record<string, Record<Lang, string>> = {
  禄: {
    zh: "这件事上，你比较容易得到回报和机会",
    en: "in this area, rewards and opportunities tend to come your way",
    es: "en este ámbito, las recompensas y oportunidades suelen llegar a ti",
    fr: "dans ce domaine, les récompenses et les opportunités ont tendance à vous venir",
    de: "in diesem Bereich kommen dir Belohnungen und Gelegenheiten eher zu",
    ja: "この分野では、報酬や機会に恵まれやすいです",
  },
  权: {
    zh: "这件事上，你更有话语权，也握得住主动",
    en: "in this area, you tend to have more say and control",
    es: "en este ámbito, tienes más voz y controlas la iniciativa",
    fr: "dans ce domaine, vous avez plus de poids et gardez l’initiative",
    de: "in diesem Bereich hast du mehr Mitspracherecht und behältst die Initiative",
    ja: "この分野では、発言力が強く、主導権を握りやすいです",
  },
  科: {
    zh: "这件事上，你的用心容易被看见、被认可",
    en: "in this area, your efforts tend to get noticed and recognised",
    es: "en este ámbito, tu esfuerzo suele notarse y reconocerse",
    fr: "dans ce domaine, vos efforts ont tendance à être remarqués et reconnus",
    de: "in diesem Bereich werden deine Bemühungen eher gesehen und anerkannt",
    ja: "この分野では、あなたの努力が目に留まり、認められやすいです",
  },
  忌: {
    zh: "这件事上，你容易较真、纠结，放不下",
    en: "in this area, you tend to overthink and struggle to let go",
    es: "en este ámbito, te obsesionas, te enredas y te cuesta soltar",
    fr: "dans ce domaine, vous avez tendance à trop réfléchir et à avoir du mal à lâcher prise",
    de: "in diesem Bereich neigst du dazu, zu viel nachzudenken und schwer loszulassen",
    ja: "この分野では、こだわりすぎて思い悩み、執着しやすいです",
  },
};

/**
 * 异名 → 正名。只用于星曜词条查找，十二神神名不走这张表。
 * 出处见 docs/knowledge-candidates/minor-stars-candidates.md 第二、三批记录。
 */
const STAR_ALIAS: Record<string, string> = {
  截路: '截空',
  空亡: '副截',
  旬中: '旬空',
  飞廉: '蜚廉',
  // 主星传统称谓（第三批）——只用于词条查找，盘面仍显示正名。
  帝星: '紫微',
  福星: '天同',
  囚星: '廉贞',
  印星: '天相',
  荫星: '天梁',
  将星: '七杀',
  杀星: '七杀',
  耗星: '破军',
  暗星: '巨门',
  桃花星: '贪狼',
  令星: '天府',
  财星: '武曲',
  // 单字与俗称异名（第四批）——只用于词条查找，盘面仍显示正名。
  日: '太阳',
  月: '太阴',
  羊刃: '擎羊',
};

function canonicalStar(name: string): string {
  return STAR_ALIAS[name] ?? name;
}

/** 取星曜的白话资料；未收录的星返回 null，调用方应安全跳过。 */
export function plainOf(star: string): StarPlain | null {
  return STARS[canonicalStar(star)] ?? null;
}

/** 解析「天机禄」这类四化字符串，返回 { star, type, plain }；无法解析返回 null。 */
export function parseSiHua(raw: string): { star: string; type: string; plain: Record<Lang, string> } | null {
  const type = raw.slice(-1);
  const plain = SIHUA[type];
  if (!plain) return null;
  const star = raw.slice(0, -1);
  return { star, type, plain };
}

/**
 * 辅星/煞星词条。第三批起 54 条全部为 label / traits / talent 三字段，
 * 不再保留单句形态。
 */
/** 常见辅星/煞星的白话，供完整版逐宫解读使用。只讲倾向，不判吉凶。 */
const AUX: Record<string, StarPlain> = {
  左辅: {
    zh: { label: "有人搭手，也爱搭手", traits: "你身边常常有人愿意帮一把，你也乐意回帮别人。做事时不太爱单打独斗，习惯找人一起商量。", talent: "借力协作、把人和资源凑到一起。" },
    en: { label: "supported, supportive", traits: "There’s usually someone willing to lend a hand, and you’re just as ready to return the favour. You rarely want to go it alone and tend to talk things through with others.", talent: "Getting support, and bringing people and resources together." },
    es: { label: "acompañado y dispuesto a ayudar", traits: "Suele haber alguien dispuesto a echarte una mano, y tú devuelves el favor con la misma facilidad. Rara vez quieres hacerlo todo solo y sueles consultarlo con otros.", talent: "Apoyarte en los demás y reunir personas y recursos." },
    fr: { label: "bien entouré, serviable", traits: "Il y a souvent quelqu’un prêt à vous donner un coup de main, et vous rendez volontiers la pareille. Vous aimez rarement agir seul et préférez en parler avec les autres.", talent: "Obtenir du soutien et rassembler les personnes et les ressources." },
    de: { label: "unterstützt und hilfsbereit", traits: "Meist findet sich jemand, der dir hilft, und du hilfst genauso bereitwillig zurück. Du willst selten alles allein machen und besprichst Dinge gern mit anderen.", talent: "Unterstützung holen und Menschen sowie Ressourcen zusammenbringen." },
    ja: { label: "支えられ、支える", traits: "周りに手を貸してくれる人が多く、あなたも同じように返します。一人で抱え込むより、人と相談しながら進めるタイプです。", talent: "人に助けを求め、人と資源をつなぐこと。" },
  },
  右弼: {
    zh: { label: "配合顺手、不抢风头", traits: "你做事愿意配合别人，擅长在团队里补位，不一定非要当那个发号施令的人。", talent: "协作补位、把团队的缝隙填平。" },
    en: { label: "a natural team player", traits: "You work well with others and are good at filling the gaps in a team — you don’t need to be the one giving orders.", talent: "Cooperating and covering what a team leaves open." },
    es: { label: "buen compañero de equipo", traits: "Trabajas bien con otros y sabes cubrir los huecos del equipo; no necesitas ser quien da las órdenes.", talent: "Colaborar y cubrir lo que el equipo deja suelto." },
    fr: { label: "coéquipier naturel", traits: "Vous travaillez bien avec les autres et savez combler les vides dans une équipe, sans avoir besoin de donner les ordres.", talent: "Collaborer et couvrir ce que l’équipe laisse de côté." },
    de: { label: "geborener Teamplayer", traits: "Du arbeitest gut mit anderen und füllst die Lücken im Team – du musst nicht derjenige sein, der Anweisungen gibt.", talent: "Zusammenarbeiten und das abdecken, was im Team offen bleibt." },
    ja: { label: "息の合う協働役", traits: "人と組んで動くのが得意で、チームの隙間を埋める役回りに向いています。自分が指示を出すことにこだわりません。", talent: "協力し、チームに足りない部分を補うこと。" },
  },
  天魁: {
    zh: { label: "关键时有人提携", traits: "到了要紧关头，常会遇到愿意拉你一把的长辈或前辈。你也容易得到正式场合的引荐。", talent: "接住机会、把贵人的助力用起来。" },
    en: { label: "mentors at key moments", traits: "At important junctures, an elder or senior figure tends to step in and help you. You’re also often introduced in formal settings.", talent: "Catching opportunities and making good use of a mentor’s push." },
    es: { label: "padrinos en momentos clave", traits: "En los momentos importantes suele aparecer un mayor o un superior dispuesto a ayudarte. También recibes presentaciones en ámbitos formales.", talent: "Aprovechar las oportunidades y el impulso de un mentor." },
    fr: { label: "parrainé aux moments clés", traits: "Aux moments importants, un aîné ou un supérieur intervient souvent pour vous aider. On vous présente aussi volontiers dans des cadres officiels.", talent: "Saisir les occasions et tirer parti du coup de pouce d’un mentor." },
    de: { label: "Förderer in Schlüsselmomenten", traits: "In wichtigen Momenten taucht meist eine ältere oder ranghöhere Person auf, die dir hilft. Auch in offiziellen Kreisen wirst du oft empfohlen.", talent: "Gelegenheiten ergreifen und die Unterstützung eines Mentors nutzen." },
    ja: { label: "要所で引き立てられる", traits: "大事な場面で、目上の人や先輩が手を差し伸べてくれやすいです。公式の場で紹介される機会にも恵まれます。", talent: "好機をつかみ、後ろ盾の力を活かすこと。" },
  },
  天钺: {
    zh: { label: "暗处有人帮", traits: "帮你的力量往往不声张，可能是背后的一句话、一个顺水人情。机会常在你没刻意争取时出现。", talent: "感知暗中的善意、把巧劲用在关键处。" },
    en: { label: "quiet help behind the scenes", traits: "The help you get is often unspoken — a word in the right ear, a quiet favour. Opportunities tend to appear when you’re not pushing for them.", talent: "Noticing quiet goodwill and applying effort where it counts." },
    es: { label: "ayuda discreta", traits: "La ayuda suele llegar sin aspavientos: una palabra a tiempo, un favor callado. Las oportunidades aparecen cuando no estás empujando por ellas.", talent: "Percibir la buena disposición silenciosa y usar la fuerza justa." },
    fr: { label: "aide discrète", traits: "L’aide arrive souvent sans bruit : un mot glissé au bon endroit, un service rendu en douce. Les occasions se présentent quand vous ne forcez pas.", talent: "Repérer la bienveillance discrète et doser votre effort." },
    de: { label: "leise Hilfe im Hintergrund", traits: "Hilfe kommt oft ohne Worte – ein Wort zur richtigen Zeit, ein stiller Gefallen. Gelegenheiten tauchen auf, wenn du nicht darauf drängst.", talent: "Stille Zuwendung wahrnehmen und Kraft gezielt einsetzen." },
    ja: { label: "陰で支えられる", traits: "助けはたいてい表に出ず、陰からの一言やさりげない好意として届きます。無理に求めていないときに機会が訪れます。", talent: "表に出ない善意に気づき、力を要所で使うこと。" },
  },
  文昌: {
    zh: { label: "条理清楚、学得快", traits: "你吸收信息快，表达有条理，写出来的东西比说出来的更清楚。做事习惯先理出框架。", talent: "学习、写作、把复杂的事说明白。" },
    en: { label: "clear-headed and quick to learn", traits: "You absorb information fast and express yourself in order; you’re often clearer in writing than in speech. You like to build a framework before acting.", talent: "Learning, writing, and explaining complex things clearly." },
    es: { label: "ordenado y de aprendizaje rápido", traits: "Absorbes información rápido y te expresas con orden; por escrito sueles ser más claro que hablando. Te gusta armar un esquema antes de actuar.", talent: "Aprender, escribir y explicar lo complejo con claridad." },
    fr: { label: "méthodique et vif", traits: "Vous absorbez vite l’information et vous exprimez avec ordre ; à l’écrit, vous êtes souvent plus clair qu’à l’oral. Vous aimez poser un cadre avant d’agir.", talent: "Apprendre, écrire et expliquer clairement des choses complexes." },
    de: { label: "strukturiert und lernfreudig", traits: "Du nimmst Informationen schnell auf und drückst dich geordnet aus; schriftlich bist du oft klarer als mündlich. Du baust gern erst ein Gerüst, bevor du handelst.", talent: "Lernen, schreiben und Kompliziertes verständlich erklären." },
    ja: { label: "筋道を立て、覚えが早い", traits: "情報の飲み込みが早く、筋道立てて表現します。話すより書くほうが伝わりやすいタイプです。行動する前にまず枠組みを作ります。", talent: "学び、書き、複雑なことをわかりやすく説明すること。" },
  },
  文曲: {
    zh: { label: "有感觉、说话有灵气", traits: "你对美感、语气和氛围敏感，表达里带点个人味道。比起硬邦邦的道理，你更相信感觉。", talent: "审美、口头表达、把气氛调对。" },
    en: { label: "expressive, with a feel for beauty", traits: "You’re sensitive to beauty, tone and atmosphere, and your way of expressing things has a personal flavour. You trust feeling more than bare logic.", talent: "Aesthetics, spoken expression, and setting the right mood." },
    es: { label: "sensible y con gracia", traits: "Eres sensible a la belleza, el tono y el ambiente, y tu forma de expresarte tiene un sello personal. Confías más en la sensación que en la lógica seca.", talent: "Estética, expresión oral y crear el clima adecuado." },
    fr: { label: "sensible et inspiré", traits: "Vous êtes sensible à la beauté, au ton et à l’atmosphère, et votre expression a une saveur personnelle. Vous faites davantage confiance au ressenti qu’à la logique sèche.", talent: "L’esthétique, l’expression orale et l’art de poser une ambiance." },
    de: { label: "feinfühlig und ausdrucksstark", traits: "Du bist empfänglich für Schönheit, Ton und Atmosphäre, und deine Art zu sprechen hat eine persönliche Note. Du vertraust dem Gefühl mehr als trockener Logik.", talent: "Ästhetik, mündlicher Ausdruck und die richtige Stimmung." },
    ja: { label: "感性豊かで表現に趣がある", traits: "美しさや語調、場の雰囲気に敏感で、表現に自分らしい味わいがあります。理屈よりも感覚を信じるタイプです。", talent: "審美眼、話し方、場の空気を整えること。" },
  },
  禄存: {
    zh: { label: "对资源有数、会攒", traits: "你对钱和资源心里有本账，习惯留余地、存底子，不太爱冒险把家底押出去。", talent: "积累、保管、把资源用在刀刃上。" },
    en: { label: "resourceful and good at saving", traits: "You keep a mental ledger of money and resources, prefer a buffer, and don’t like staking everything on a risk.", talent: "Accumulating, safeguarding, and spending resources where they count." },
    es: { label: "previsor y ahorrador", traits: "Llevas la cuenta del dinero y los recursos, prefieres tener un colchón y no te gusta arriesgar todo de una vez.", talent: "Acumular, conservar y usar los recursos donde importan." },
    fr: { label: "prévoyant et économe", traits: "Vous tenez les comptes de l’argent et des ressources, aimez garder une réserve et répugnez à tout miser sur un coup de risque.", talent: "Accumuler, préserver et employer les ressources à bon escient." },
    de: { label: "ressourcenbewusst und sparsam", traits: "Du hast Geld und Ressourcen im Blick, hältst gern einen Puffer und setzt nicht alles auf eine riskante Karte.", talent: "Ansammeln, sichern und Ressourcen gezielt einsetzen." },
    ja: { label: "資源に明るく、蓄え上手", traits: "お金や資源の勘定が頭に入っており、余裕を残すのが習慣です。全部をリスクに賭けるようなことは好みません。", talent: "蓄え、守り、資源を肝心なところで使うこと。" },
  },
  天马: {
    zh: { label: "停不下来、适合流动", traits: "你不太受得了原地不动，换环境、跑动、出差这类节奏反而让你有精神。", talent: "适应变化、在路上办事、把资源带着走。" },
    en: { label: "restless, built for movement", traits: "You struggle to stay put; changing scenes, travelling and being on the move actually energise you.", talent: "Adapting to change, getting things done on the road, and carrying resources with you." },
    es: { label: "inquieto, hecho para moverse", traits: "Te cuesta quedarte quieto; cambiar de entorno, viajar y estar en movimiento te dan energía.", talent: "Adaptarte al cambio, resolver fuera de casa y llevar los recursos contigo." },
    fr: { label: "agité, fait pour bouger", traits: "Vous supportez mal l’immobilité ; changer de cadre, voyager et être en mouvement vous donnent de l’élan.", talent: "S’adapter au changement, agir en déplacement et emporter les ressources avec vous." },
    de: { label: "ruhelos, auf Bewegung gebaut", traits: "Du hältst es schlecht an einem Ort aus; Ortswechsel, Reisen und Unterwegssein geben dir Energie.", talent: "Sich an Veränderungen anpassen, unterwegs erledigen und Ressourcen mitnehmen." },
    ja: { label: "じっとしていられない", traits: "同じ場所に留まるのが苦手で、環境を変えたり出張したり、動き続けるほうが元気が出ます。", talent: "変化に適応し、移動しながら物事を進め、資源を携えること。" },
  },
  红鸾: {
    zh: { label: "感情线显眼", traits: "你在感情和缘分上的存在感比较强，容易被人注意到你的喜好与在意。", talent: "经营亲密感、把关系里的仪式感做出来。" },
    en: { label: "a visible romantic streak", traits: "Feelings and romance are a noticeable part of how people see you; your likes and attachments are easy to read.", talent: "Building intimacy and giving relationships a sense of occasion." },
    es: { label: "vena romántica visible", traits: "Los sentimientos y el romance destacan en cómo te ve la gente; se nota lo que te gusta y a quién quieres.", talent: "Crear intimidad y dar solemnidad a las relaciones." },
    fr: { label: "veine romantique visible", traits: "Les sentiments et le romantisme marquent la façon dont on vous perçoit ; on voit aisément ce qui vous plaît et à qui vous tenez.", talent: "Créer de l’intimité et donner du relief aux relations." },
    de: { label: "sichtbare romantische Ader", traits: "Gefühle und Romantik fallen an dir auf; man erkennt leicht, was du magst und an wem dir liegt.", talent: "Nähe aufbauen und Beziehungen einen feierlichen Rahmen geben." },
    ja: { label: "恋愛の気配が目立つ", traits: "感情や縁が人から見えやすく、好きなものや大切にしている人が伝わりやすいです。", talent: "親密さを育て、関係に節目や趣を添えること。" },
  },
  天喜: {
    zh: { label: "开朗、有喜气", traits: "你自带一点喜气，爱笑、会捧场，也重视人情往来和值得庆祝的时刻。", talent: "活跃气氛、经营人情、把好事分享出去。" },
    en: { label: "upbeat and celebratory", traits: "You carry a bit of festive energy — quick to smile, good at cheering others on, and you value goodwill and occasions worth marking.", talent: "Lifting a room, nurturing goodwill, and sharing good news." },
    es: { label: "alegre y festivo", traits: "Llevas algo de espíritu festivo: sonríes con facilidad, animas a los demás y valoras los gestos de afecto y los momentos que merecen celebrarse.", talent: "Levantar el ánimo, cultivar la buena voluntad y compartir las buenas noticias." },
    fr: { label: "enjoué et festif", traits: "Vous portez une énergie de fête : sourire facile, goût d’encourager les autres, et attachement aux gestes d’amitié comme aux occasions à célébrer.", talent: "Animer un groupe, entretenir la bonne entente et partager les bonnes nouvelles." },
    de: { label: "fröhlich und feierfreudig", traits: "Du bringst eine festliche Energie mit – lächelst schnell, munterst andere auf und legst Wert auf gute Gesten und Momente, die man feiern sollte.", talent: "Stimmung heben, gute Beziehungen pflegen und Gutes teilen." },
    ja: { label: "明るくお祝い好き", traits: "どこかお祭り気分を持っていて、よく笑い、人を盛り立てます。お付き合いや祝うべき節目も大切にします。", talent: "場を明るくし、人付き合いを育て、良い知らせを分かち合うこと。" },
  },
  华盖: {
    zh: { label: "爱独处、内里丰富", traits: "你需要自己的精神角落，独处时反而最能想清楚事。对玄学、艺术、哲思这类东西容易有兴趣。", talent: "独立思考、钻研偏门、把感受变成作品。" },
    en: { label: "solitary, with a rich inner world", traits: "You need your own corner of the mind; solitude is often when you think most clearly. You’re drawn to the esoteric, the artistic or the philosophical.", talent: "Thinking independently, digging into niche subjects, and turning feeling into work." },
    es: { label: "solitario y de mundo interior rico", traits: "Necesitas tu propio rincón mental; en soledad sueles pensar con más claridad. Te atraen lo esotérico, lo artístico o lo filosófico.", talent: "Pensar por tu cuenta, profundizar en temas minoritarios y convertir la sensación en obra." },
    fr: { label: "solitaire, intérieurement riche", traits: "Vous avez besoin de votre coin à vous ; c’est souvent dans la solitude que vous pensez le plus clairement. L’ésotérique, l’artistique ou le philosophique vous attirent.", talent: "Penser par vous-même, creuser des sujets de niche et transformer le ressenti en œuvre." },
    de: { label: "eigenbrötlerisch, innerlich reich", traits: "Du brauchst deine eigene geistige Ecke; allein denkst du oft am klarsten. Esoterik, Kunst oder Philosophie ziehen dich an.", talent: "Eigenständig denken, Nischenthemen vertiefen und Gefühl in Arbeit verwandeln." },
    ja: { label: "孤独を好み、内面が豊か", traits: "自分の精神的な居場所が必要で、一人のときにこそ物事が整理できます。神秘的なもの、芸術、哲学に惹かれやすいです。", talent: "自分で考え、ニッチな分野を掘り下げ、感覚を作品にすること。" },
  },
  擎羊: {
    zh: { label: "有冲劲、锋芒外露", traits: "你做事肯往前顶，遇到阻力也不轻易退。代价是容易急、说话直，和人硬碰硬。", talent: "攻坚、打开局面、在压力下推进。" },
    en: { label: "driven, with an edge", traits: "You push forward and don’t back off easily when you meet resistance. The cost is impatience, bluntness and the occasional head-on clash.", talent: "Breaking through, opening things up, and pushing under pressure." },
    es: { label: "impulsivo y con filo", traits: "Empujas hacia adelante y no retrocedes fácil ante la resistencia. El precio es la prisa, la franqueza y algún choque frontal.", talent: "Abrir camino, romper bloqueos y avanzar bajo presión." },
    fr: { label: "entreprenant, avec du tranchant", traits: "Vous avancez et reculez rarement devant la résistance. Le prix : de l’impatience, une certaine brusquerie et quelques affrontements directs.", talent: "Ouvrir une brèche, débloquer les situations et avancer sous pression." },
    de: { label: "antreibend, mit Kante", traits: "Du gehst voran und weichst bei Widerstand nicht sofort zurück. Der Preis: Ungeduld, Direktheit und gelegentliche frontale Zusammenstöße.", talent: "Durchbrechen, Wege öffnen und unter Druck vorankommen." },
    ja: { label: "突き進み、角が立つ", traits: "抵抗があっても簡単には引きません。その代わり、せっかちで物言いが直線的になり、正面衝突しやすい面があります。", talent: "難所を突破し、道を開き、プレッシャーの中で進めること。" },
  },
  陀罗: {
    zh: { label: "慢工出细活、爱绕圈", traits: "你做事细，愿意一遍遍磨，但容易卡在细节里反复想，进度被自己拖慢。", talent: "打磨、查漏补缺、处理需要耐心的细活。" },
    en: { label: "meticulous, prone to circling", traits: "You’re thorough and willing to polish things again and again, but you can get stuck in details and slow yourself down.", talent: "Refining, catching what’s missed, and handling patient detail work." },
    es: { label: "minucioso y dado a dar vueltas", traits: "Eres detallista y estás dispuesto a pulir una y otra vez, pero puedes atascarte en los detalles y frenarte a ti mismo.", talent: "Perfeccionar, detectar lo que falta y hacer trabajos que exigen paciencia." },
    fr: { label: "minutieux, enclin à tourner en rond", traits: "Vous êtes minutieux et prêt à peaufiner sans cesse, mais vous pouvez vous enliser dans les détails et vous ralentir vous-même.", talent: "Affiner, repérer les oublis et gérer le travail de patience." },
    de: { label: "gründlich, zum Kreisen neigend", traits: "Du bist sorgfältig und bereit, Dinge immer wieder zu schleifen, kannst dich aber in Details verheddern und dich selbst ausbremsen.", talent: "Verfeinern, Lücken finden und geduldige Feinarbeit leisten." },
    ja: { label: "丁寧だが堂々巡りしやすい", traits: "細部まで丁寧に仕上げる一方、こだわりすぎて同じところを回り、自分で進行を遅らせることがあります。", talent: "磨き上げ、抜けを拾い、根気のいる細かい作業をこなすこと。" },
  },
  火星: {
    zh: { label: "来得快、热度猛", traits: "你反应快、行动也快，情绪一上来就立刻有动作。好处是利落，坏处是容易三分钟热度。", talent: "快速启动、临场爆发、在紧急时顶上。" },
    en: { label: "fast to ignite", traits: "You react and act quickly; when emotion rises, you move at once. The upside is decisiveness, the downside is a short fuse and short-lived enthusiasm.", talent: "Starting fast, rising to the occasion, and stepping up in an emergency." },
    es: { label: "se enciende rápido", traits: "Reaccionas y actúas con rapidez; cuando la emoción sube, pasas a la acción de inmediato. Lo bueno es la decisión; lo malo, el poco aguante y el entusiasmo breve.", talent: "Arrancar rápido, responder en el momento y cubrir una urgencia." },
    fr: { label: "s’enflamme vite", traits: "Vous réagissez et agissez vite ; dès que l’émotion monte, vous passez à l’acte. L’avantage : la décision ; le revers : peu de patience et un enthousiasme de courte durée.", talent: "Démarrer vite, répondre dans l’instant et assurer l’urgence." },
    de: { label: "schnell entflammt", traits: "Du reagierst und handelst schnell; steigt die Emotion, folgt sofort die Tat. Der Vorteil ist Entschlossenheit, der Nachteil eine kurze Zündschnur und kurzer Atem.", talent: "Schnell starten, im Moment reagieren und im Notfall einspringen." },
    ja: { label: "火がつくのが早い", traits: "反応も行動も速く、感情が高ぶるとすぐ動きます。決断の速さが長所ですが、短気で熱が冷めるのも早い面があります。", talent: "素早く始め、その場で対応し、緊急時に前に出ること。" },
  },
  铃星: {
    zh: { label: "闷着发力、爆发猛", traits: "你不太把情绪摆在脸上，习惯憋着劲儿做事；一旦压不住，反应会比别人想的更激烈。", talent: "忍耐、暗中推进、在沉默里积累力量。" },
    en: { label: "quiet build-up, sudden burst", traits: "You don’t wear your feelings openly and tend to work with held-in energy; if it finally breaks out, it’s fiercer than people expect.", talent: "Enduring, advancing quietly, and gathering strength in silence." },
    es: { label: "acumula en silencio y estalla", traits: "No muestras tus emociones y sueles trabajar con energía contenida; si al final estalla, es más fuerte de lo que otros esperan.", talent: "Aguantar, avanzar sin ruido y acumular fuerza en silencio." },
    fr: { label: "accumule en silence, explose soudainement", traits: "Vous n’exposez pas vos émotions et travaillez avec une énergie retenue ; si elle finit par sortir, c’est plus fort qu’on ne l’imagine.", talent: "Endurer, avancer discrètement et accumuler de la force en silence." },
    de: { label: "staut sich auf, bricht plötzlich hervor", traits: "Du zeigst Gefühle nicht offen und arbeitest mit zurückgehaltener Energie; bricht sie hervor, ist sie heftiger als erwartet.", talent: "Aushalten, leise vorankommen und in der Stille Kraft sammeln." },
    ja: { label: "静かに溜めて一気に爆発", traits: "感情を表に出さず、力をためて取り組みます。抑えきれなくなると、周りが思う以上に激しく出ることがあります。", talent: "耐え、静かに進め、黙って力を蓄えること。" },
  },
  地空: {
    zh: { label: "想法飘、不爱被框", traits: "你的思路不受常规约束，常冒出别人想不到的角度。落地时容易飘，需要有人帮你收口。", talent: "出奇想、跳出框架、给僵局提供新视角。" },
    en: { label: "free-ranging ideas", traits: "Your thinking isn’t bound by convention and you often come up with angles others miss. On execution you can drift, so it helps to have someone ground you.", talent: "Imagining the unusual, breaking frames, and offering a fresh angle on a deadlock." },
    es: { label: "ideas que vuelan", traits: "Tu pensamiento no se ata a lo convencional y a menudo das ángulos que otros no ven. Al ejecutar puedes dispersarte, así que te ayuda alguien que te aterrice.", talent: "Imaginar lo insólito, romper esquemas y aportar una mirada nueva." },
    fr: { label: "idées en liberté", traits: "Votre pensée ne se limite pas aux conventions et vous trouvez souvent des angles que les autres manquent. À l’exécution, vous pouvez vous disperser : un point d’ancrage vous aide.", talent: "Imaginer l’inattendu, casser les cadres et offrir un regard neuf." },
    de: { label: "frei schwebende Ideen", traits: "Dein Denken hält sich nicht an Konventionen und du findest oft Blickwinkel, die andere übersehen. Beim Umsetzen schweifst du ab – jemand, der dich erdet, hilft.", talent: "Ungewöhnliches ersinnen, Rahmen sprengen und frischen Blick bieten." },
    ja: { label: "発想が自由", traits: "考えが既成概念に縛られず、人が見落とす角度を思いつきます。実行段階では漂いやすいので、着地を助けてくれる人がいると楽です。", talent: "奇想を生み、枠を破り、行き詰まりに新しい視点を与えること。" },
  },
  地劫: {
    zh: { label: "看得开、起伏大", traits: "你对得失看得比多数人淡，敢打破现状，但节奏容易大起大落，不太按常理出牌。", talent: "止损、重新开始、在剧变里找到新路。" },
    en: { label: "detached, with big swings", traits: "You take gain and loss more lightly than most and dare to break the status quo, though your rhythm swings hard and rarely follows the expected path.", talent: "Cutting losses, starting over, and finding a way through upheaval." },
    es: { label: "desapegado y de grandes altibajos", traits: "Te tomas las pérdidas y ganancias con más calma que la mayoría y te atreves a romper lo establecido, aunque tu ritmo oscila mucho y rara vez sigue lo esperado.", talent: "Cortar pérdidas, empezar de nuevo y encontrar salida en la agitación." },
    fr: { label: "détaché, avec de fortes variations", traits: "Vous prenez les gains et les pertes avec plus de distance que la plupart et osez briser l’ordre établi, mais votre rythme oscille fort et suit rarement le chemin attendu.", talent: "Couper les pertes, repartir de zéro et trouver une issue dans le bouleversement." },
    de: { label: "gelassen, mit starken Schwankungen", traits: "Du nimmst Gewinn und Verlust leichter als die meisten und traust dich, den Status quo zu brechen – dein Rhythmus schwankt aber stark und folgt selten dem Erwarteten.", talent: "Verluste begrenzen, neu anfangen und im Umbruch einen Weg finden." },
    ja: { label: "執着が薄く、浮き沈みが大きい", traits: "損得を多くの人より軽く受け止め、現状を破ることを恐れません。ただリズムの振れ幅が大きく、常識的な道をたどりにくい面があります。", talent: "損切りし、やり直し、激変の中で道を見つけること。" },
  },
  天刑: {
    zh: { label: "原则性强、要求高", traits: "你心里有把尺，对规矩和自己的要求都不低，看不过去的事很难装作没看见。", talent: "守标准、做判断、在需要原则时站稳。" },
    en: { label: "principled and demanding", traits: "You carry a clear internal ruler and hold both rules and yourself to a high standard; you find it hard to look away from something that’s wrong.", talent: "Holding standards, making judgments, and standing firm when principles matter." },
    es: { label: "de principios y exigente", traits: "Llevas una regla interna clara y exiges mucho tanto a las normas como a ti mismo; te cuesta hacer la vista gorda ante lo que está mal.", talent: "Mantener criterios, juzgar y sostenerte cuando importan los principios." },
    fr: { label: "de principe et exigeant", traits: "Vous avez une règle intérieure nette et vous êtes exigeant envers les règles comme envers vous-même ; il vous est difficile de fermer les yeux sur ce qui cloche.", talent: "Tenir un standard, juger et rester ferme quand les principes comptent." },
    de: { label: "prinzipientreu und anspruchsvoll", traits: "Du hast ein klares inneres Maß und legst an Regeln wie an dich selbst hohe Maßstäbe; bei etwas Falschem kannst du nur schwer wegsehen.", talent: "Standards halten, urteilen und bei Prinzipien standhaft bleiben." },
    ja: { label: "信念が強く、要求が高い", traits: "自分の中に明確な物差しがあり、ルールにも自分にも高い水準を求めます。おかしいことを見て見ぬふりするのは苦手です。", talent: "基準を守り、判断し、原則が問われる場面で踏ん張ること。" },
  },
  孤辰: {
    zh: { label: "独立、习惯一个人", traits: "你习惯自己消化事情，独立性强，不太依赖别人；但情绪低落时也容易觉得没人真正懂你。", talent: "独处、自己扛事、在没人帮忙时也能推进。" },
    en: { label: "independent, used to solitude", traits: "You’re used to processing things alone and don’t lean on others much; when you’re low, though, it’s easy to feel that no one quite gets you.", talent: "Being alone, carrying things yourself, and making progress without help." },
    es: { label: "independiente y acostumbrado a la soledad", traits: "Estás acostumbrado a digerir las cosas solo y no dependes mucho de los demás; aun así, cuando estás bajo, es fácil sentir que nadie te entiende del todo.", talent: "Estar solo, cargar con lo tuyo y avanzar sin ayuda." },
    fr: { label: "indépendant, habitué à la solitude", traits: "Vous avez l’habitude de digérer les choses seul et ne vous appuyez pas beaucoup sur les autres ; pourtant, dans les moments bas, il est facile de sentir que personne ne vous comprend vraiment.", talent: "Rester seul, porter les choses et avancer sans aide." },
    de: { label: "unabhängig, Einsamkeit gewohnt", traits: "Du verarbeitest Dinge gewöhnlich allein und lehnst dich wenig an andere; in Tiefphasen fühlt es sich aber leicht so an, als würde dich niemand wirklich verstehen.", talent: "Allein sein, Dinge selbst tragen und ohne Hilfe vorankommen." },
    ja: { label: "自立し、一人に慣れている", traits: "物事を一人で消化するのに慣れ、人にあまり頼りません。ただ落ち込んでいるときは、誰にも本当にわかってもらえないと感じやすいです。", talent: "一人でいること、自分で抱えること、助けなしで進めること。" },
  },
  寡宿: {
    zh: { label: "不爱热闹、感情内敛", traits: "你对人多的场合兴趣不大，情绪也不太外露，别人常常要相处久了才知道你在想什么。", talent: "安静做事、保守秘密、在喧闹里保持距离。" },
    en: { label: "private, not one for crowds", traits: "Crowds don’t appeal to you much and you keep feelings close; people often need time before they know what you’re thinking.", talent: "Working quietly, keeping confidences, and holding distance amid noise." },
    es: { label: "reservado, poco amigo de multitudes", traits: "Las multitudes no te atraen mucho y guardas tus sentimientos; la gente suele necesitar tiempo para saber qué piensas.", talent: "Trabajar en silencio, guardar secretos y mantener distancia en el ruido." },
    fr: { label: "réservé, peu porté sur les foules", traits: "Les foules vous attirent peu et vous gardez vos sentiments pour vous ; il faut souvent du temps aux autres pour savoir ce que vous pensez.", talent: "Travailler en silence, garder les confidences et prendre de la distance dans le bruit." },
    de: { label: "zurückhaltend, kein Freund von Menschenmengen", traits: "Menschenmengen sagen dir wenig zu und du hältst Gefühle bedeckt; andere brauchen oft Zeit, bis sie wissen, was in dir vorgeht.", talent: "Leise arbeiten, Vertrauliches bewahren und Abstand im Trubel halten." },
    ja: { label: "賑やかさを好まず、感情は内に", traits: "人が多い場にはあまり惹かれず、感情も表に出しません。周りがあなたの考えを知るには、たいてい時間がかかります。", talent: "静かに仕事をし、秘密を守り、騒がしさの中で距離を保つこと。" },
  },
  天姚: {
    zh: { label: "有魅力、懂风情", traits: "你自带一点吸引力，懂得在互动里留余地、给台阶，和人相处有分寸感。", talent: "营造暧昧得体的氛围、处理人际里的微妙分寸。" },
    en: { label: "charming, socially graceful", traits: "You carry a natural appeal and know how to leave room and give people a graceful way out; you handle social nuance well.", talent: "Setting a warm, graceful mood and managing delicate social dynamics." },
    es: { label: "con encanto y don de gentes", traits: "Tienes un atractivo natural y sabes dejar espacio y dar salida con elegancia; manejas bien los matices sociales.", talent: "Crear un clima cálido y elegante y manejar dinámicas sociales delicadas." },
    fr: { label: "charmant, à l’aise socialement", traits: "Vous avez un attrait naturel et savez laisser de l’espace et offrir une sortie élégante ; vous gérez bien les nuances sociales.", talent: "Créer une ambiance chaleureuse et gérer les rapports délicats." },
    de: { label: "charmant, sozial gewandt", traits: "Du hast eine natürliche Ausstrahlung und weißt, Raum zu lassen und anderen einen eleganten Ausweg zu bieten; soziale Feinheiten liegen dir.", talent: "Eine warme, gewandte Stimmung schaffen und heikle Kontakte meistern." },
    ja: { label: "魅力があり、間合いを知る", traits: "自然な吸引力があり、相手に余地を残し、逃げ道を用意するのが上手です。人付き合いの微妙な間合いを心得ています。", talent: "温かく品のある雰囲気を作り、人付き合いの微妙な駆け引きを扱うこと。" },
  },
  咸池: {
    zh: { label: "有吸引力、感情随缘", traits: "你对人有吸引力，感情上偏随缘，容易被氛围和眼缘带着走，不太按清单挑人。", talent: "感知吸引力、经营气氛、让关系保持新鲜。" },
    en: { label: "attractive, led by feeling", traits: "You draw people in and take romance as it comes, often following atmosphere and chemistry rather than a checklist.", talent: "Reading attraction, shaping atmosphere, and keeping relationships fresh." },
    es: { label: "atractivo y guiado por la sensación", traits: "Atraes a la gente y vives el romance según llega, guiándote más por el ambiente y la química que por una lista.", talent: "Percibir la atracción, crear ambiente y mantener frescas las relaciones." },
    fr: { label: "attirant, guidé par le ressenti", traits: "Vous attirez et vivez le romantisme au gré des rencontres, en suivant l’ambiance et l’alchimie plutôt qu’une liste de critères.", talent: "Sentir l’attirance, façonner l’ambiance et garder les relations vivantes." },
    de: { label: "attraktiv, vom Gefühl geleitet", traits: "Du ziehst Menschen an und lässt Romantik auf dich zukommen – eher nach Atmosphäre und Chemie als nach einer Liste.", talent: "Anziehung wahrnehmen, Stimmung gestalten und Beziehungen lebendig halten." },
    ja: { label: "人を惹きつけ、感覚で恋をする", traits: "人を引きつける力があり、恋愛は流れに任せがちです。条件表より、場の雰囲気や相性で選びます。", talent: "引力を察し、雰囲気をつくり、関係を新鮮に保つこと。" },
  },
  破碎: {
    zh: { label: "计划常被打断", traits: "你办事容易遇到半路插进来的事，节奏被打断是常态，所以更需要留缓冲。", talent: "应对突发、临时改道、把碎掉的事重新拼起来。" },
    en: { label: "plans often interrupted", traits: "Something tends to cut in midway, so interrupted rhythm is normal for you — which makes leaving a buffer especially useful.", talent: "Handling surprises, rerouting on the fly, and piecing things back together." },
    es: { label: "planes que se interrumpen", traits: "Suele aparecer algo a mitad de camino, así que un ritmo interrumpido es normal para ti; por eso te conviene dejar margen.", talent: "Manejar imprevistos, cambiar de ruta y recomponer lo que se rompe." },
    fr: { label: "des plans souvent interrompus", traits: "Quelque chose vient souvent couper en cours de route ; un rythme interrompu vous est normal, d’où l’utilité de garder une marge.", talent: "Gérer l’imprévu, changer d’itinéraire et recomposer ce qui se défait." },
    de: { label: "Pläne werden oft unterbrochen", traits: "Meist kommt etwas dazwischen, ein unterbrochener Rhythmus ist bei dir normal – deshalb ist ein Puffer besonders sinnvoll.", talent: "Überraschungen meistern, spontan umplanen und Zerbrochenes wieder zusammenfügen." },
    ja: { label: "計画が途中で途切れやすい", traits: "物事の途中で割り込みが入りやすく、リズムが途切れるのはあなたにとって日常です。だからこそ余白を残すと楽になります。", talent: "不意の出来事に対応し、その場で進路を変え、砕けたものを組み直すこと。" },
  },
  大耗: {
    zh: { label: "花得大方、开销意外", traits: "你在投入上不太计较，用得着就花，容易一次投出不少；对意外开销也见怪不怪。", talent: "敢投入、会用资源换机会、不被小钱绊住。" },
    en: { label: "generous spender", traits: "You’re not fussy about spending when it’s needed and can put out a lot at once; surprise expenses don’t shock you.", talent: "Daring to invest, trading resources for opportunity, and not getting stuck on small costs." },
    es: { label: "gasta con generosidad", traits: "No te complicas cuando hay que gastar y puedes soltar mucho de una vez; los gastos imprevistos no te sorprenden.", talent: "Atreverte a invertir, cambiar recursos por oportunidades y no atascarte en gastos pequeños." },
    fr: { label: "dépensier généreux", traits: "Vous ne chipotez pas quand il faut dépenser et pouvez lâcher beaucoup d’un coup ; les dépenses imprévues ne vous étonnent pas.", talent: "Oser investir, échanger des ressources contre des occasions et ne pas se bloquer sur de petites sommes." },
    de: { label: "großzügiger Ausgeber", traits: "Du bist beim Ausgeben nicht kleinlich, wenn es nötig ist, und kannst auf einmal viel einsetzen; unerwartete Ausgaben erschüttern dich nicht.", talent: "Mutig investieren, Ressourcen gegen Chancen tauschen und nicht an Kleingeld hängen bleiben." },
    ja: { label: "気前よく使う", traits: "必要なら出し惜しみせず、一度に大きく投入することもあります。思わぬ出費にも動じにくいです。", talent: "思い切って投資し、資源を機会に変え、小銭で足を止めないこと。" },
  },

  // ── 杂曜补充（2026-11-24，第一批 30 条）──────────────────────────
  // 覆盖 iztro 盘面 38 颗杂曜中此前缺词条的 29 颗，另含项目补星「副旬」
  // 与改名后的「截空 / 副截」。出处、置信度与审核记录见
  // docs/knowledge-candidates/minor-stars-candidates.md。
  // 只写倾向，不判吉凶；传统断语（孤克、淫、官灾、夭寿等）已去事件化。

  天哭: {
    zh: { label: "共情强、易感伤", traits: "你对别人的情绪很敏感，看到难过的事自己也容易跟着低落。这份共情让你体贴，但也容易把别人的情绪背在身上。", talent: "察觉情绪、陪人度过低谷、替人把难过说出口。" },
    en: { label: "deeply empathetic, easily moved", traits: "You pick up on other people’s feelings quickly and can be pulled down by sad news yourself. That empathy makes you caring, though you sometimes carry others’ moods on your shoulders.", talent: "Sensing feelings, sitting with people through low points, and putting sadness into words." },
    es: { label: "muy empático, se entristece fácil", traits: "Captas rápido lo que sienten los demás y las malas noticias pueden bajarte el ánimo. Esa empatía te hace atento, aunque a veces cargas con el estado de ánimo ajeno.", talent: "Percibir emociones, acompañar en los malos momentos y poner en palabras la tristeza." },
    fr: { label: "très empathique, vite attristé", traits: "Vous captez vite les émotions des autres et une mauvaise nouvelle peut vous faire baisser le moral. Cette empathie vous rend attentif, même si vous portez parfois l’humeur des autres.", talent: "Percevoir les émotions, accompagner dans les moments difficiles et mettre des mots sur la tristesse." },
    de: { label: "sehr empathisch, leicht betrübt", traits: "Du nimmst schnell wahr, was andere fühlen, und schlechte Nachrichten können dich selbst runterziehen. Diese Empathie macht dich fürsorglich, auch wenn du manchmal die Stimmung anderer mitträgst.", talent: "Gefühle wahrnehmen, in schweren Momenten beistehen und Traurigkeit in Worte fassen." },
    ja: { label: "共感が強く、感傷的になりやすい", traits: "人の気持ちをすぐに察し、悲しい出来事があると自分まで気分が沈みがちです。その共感力は優しさになりますが、他人の感情を背負い込むこともあります。", talent: "感情を察し、落ち込む人に寄り添い、悲しみを言葉にすること。" },
  },
  天虚: {
    zh: { label: "心里易空、需实感", traits: "你偶尔会有说不清的空落感，做事需要看得见摸得着的东西才安心。给目标配上具体步骤，你会踏实很多。", talent: "把抽象想法拆成可执行步骤，用实际成果安自己的心。" },
    en: { label: "a quiet inner emptiness", traits: "You sometimes feel a vague emptiness and need something concrete to hold on to before you feel secure. When a goal comes with real steps, you settle down much more easily.", talent: "Breaking abstract ideas into concrete steps and steadying yourself with real results." },
    es: { label: "cierto vacío interior", traits: "A veces sientes un vacío difuso y necesitas algo concreto a lo que agarrarte para estar tranquilo. Cuando un objetivo trae pasos claros, te asientas mucho mejor.", talent: "Descomponer ideas abstractas en pasos concretos y estabilizarte con resultados reales." },
    fr: { label: "un vide intérieur diffus", traits: "Vous ressentez parfois un vide difficile à nommer et avez besoin de concret pour vous sentir rassuré. Quand un objectif s’accompagne d’étapes réelles, vous vous posez bien plus facilement.", talent: "Découper des idées abstraites en étapes concrètes et vous rassurer par des résultats réels." },
    de: { label: "eine leise innere Leere", traits: "Manchmal spürst du eine unbestimmte Leere und brauchst etwas Greifbares, um dich sicher zu fühlen. Wenn ein Ziel konkrete Schritte hat, kommst du viel leichter zur Ruhe.", talent: "Abstrakte Ideen in konkrete Schritte zerlegen und dich mit echten Ergebnissen erden." },
    ja: { label: "心に空白を感じやすい", traits: "何とも言えない空虚さを覚えることがあり、確かな手ごたえがないと落ち着きません。目標に具体的な手順があると、ぐっと安心できます。", talent: "抽象的な考えを実行できる手順に分け、実際の成果で自分を落ち着かせること。" },
  },
  龙池: {
    zh: { label: "爱整洁、好收藏", traits: "你讲究干净和细节，东西要归位、用品要称手。遇到好东西你倾向收着、留着，不轻易用掉。", talent: "整理收纳、挑品质物件、把日子过得有条理。" },
    en: { label: "tidy and fond of collecting", traits: "You care about cleanliness and detail — things should have their place and tools should feel right. When you find something good, you tend to keep it rather than use it up.", talent: "Organising, choosing quality objects, and keeping daily life in order." },
    es: { label: "ordenado y coleccionista", traits: "Te importan la limpieza y el detalle: cada cosa en su sitio y cada útil que se sienta bien. Cuando encuentras algo bueno, tiendes a guardarlo en vez de gastarlo.", talent: "Organizar, elegir objetos de calidad y mantener la vida diaria en orden." },
    fr: { label: "soigné et collectionneur", traits: "Le propre et le détail comptent pour vous : chaque chose à sa place, chaque outil agréable à utiliser. Quand vous trouvez quelque chose de bien, vous le gardez plutôt que de l’user.", talent: "Ranger, choisir des objets de qualité et tenir le quotidien en ordre." },
    de: { label: "ordentlich und sammelfreudig", traits: "Sauberkeit und Details sind dir wichtig – alles an seinem Platz, Werkzeug, das sich richtig anfühlt. Wenn du etwas Gutes findest, hebst du es eher auf, als es zu verbrauchen.", talent: "Ordnen, hochwertige Dinge auswählen und den Alltag übersichtlich halten." },
    ja: { label: "清潔好きで、集めるのが好き", traits: "清潔さと細部にこだわり、物は定位置に、道具は手に合うものを選びます。良いものを見つけると使い切るより取っておくタイプです。", talent: "整理整頓し、質の良いものを選び、暮らしを整えること。" },
  },
  凤阁: {
    zh: { label: "重仪表、有品味", traits: "你在意自己呈现出来的样子，穿什么、怎么摆都讲究一点。对美的东西你一眼就能分辨，也愿意为此花心思。", talent: "打理形象、搭配布置、把场面弄得好看。" },
    en: { label: "polished, with taste", traits: "You care how you come across — what you wear and how things are arranged get some thought. You spot beauty quickly and are willing to put effort into it.", talent: "Shaping an image, styling and arranging spaces, making a scene look good." },
    es: { label: "cuidadoso y con gusto", traits: "Te importa cómo te presentas: qué llevas puesto y cómo están dispuestas las cosas. Detectas la belleza de inmediato y estás dispuesto a dedicarle esfuerzo.", talent: "Cuidar la imagen, combinar y ambientar, hacer que todo luzca bien." },
    fr: { label: "soigné et de bon goût", traits: "Vous tenez à l’image que vous renvoyez : ce que vous portez et la façon dont les choses sont disposées comptent. Vous repérez vite la beauté et acceptez d’y consacrer des efforts.", talent: "Soigner son image, composer et aménager, faire en sorte que tout soit beau." },
    de: { label: "gepflegt und geschmackvoll", traits: "Dir ist wichtig, wie du wirkst – was du trägst und wie Dinge angeordnet sind, bekommt Beachtung. Du erkennst Schönheit sofort und investierst gern Mühe darin.", talent: "Image pflegen, zusammenstellen und einrichten, für ein gutes Erscheinungsbild sorgen." },
    ja: { label: "身だしなみとセンスを重んじる", traits: "自分がどう見えるかを気にし、服装や物の配置にも気を配ります。美しいものをすぐに見分け、そこに手間をかけるのも厭いません。", talent: "身だしなみを整え、組み合わせや配置を考え、場を美しく見せること。" },
  },
  三台: {
    zh: { label: "常被推到台前", traits: "你容易被大家推到前面，别人指望你出面时你也不太推辞。你愿意帮人把场面撑住，不介意当那个站在明处的人。", talent: "出面应对、撑住场面、让事情看起来体面。" },
    en: { label: "often put in the spotlight", traits: "People tend to push you forward, and you rarely refuse when they expect you to step up. You’re happy to hold the room together and don’t mind being the one in the light.", talent: "Stepping up in public, holding a scene together, and giving things a presentable face." },
    es: { label: "suele quedar en primer plano", traits: "La gente tiende a ponerte adelante y no sueles negarte cuando esperan que des la cara. Te gusta sostener el ambiente y no te incomoda estar en el foco.", talent: "Dar la cara, sostener una situación y darle una imagen presentable." },
    fr: { label: "souvent mis en avant", traits: "On a tendance à vous pousser devant et vous refusez rarement quand on attend que vous preniez la parole. Vous aimez tenir la scène et cela ne vous dérange pas d’être en pleine lumière.", talent: "Prendre la parole en public, tenir une situation et lui donner une belle façade." },
    de: { label: "oft in den Vordergrund gestellt", traits: "Man schiebt dich oft nach vorn, und du lehnst selten ab, wenn man erwartet, dass du dich zeigst. Du hältst gern die Stellung und hast nichts dagegen, im Licht zu stehen.", talent: "Öffentlich auftreten, eine Situation zusammenhalten und ihr einen guten Anschein geben." },
    ja: { label: "前に出されやすい", traits: "周りから前に押し出されることが多く、期待されれば断りにくいタイプです。場を支えるのが好きで、表に立つことも気にしません。", talent: "表に出て対応し、場を支え、見栄えを整えること。" },
  },
  八座: {
    zh: { label: "坐得住、讲秩序", traits: "你在自己的位置上待得住，做事有次序，不喜欢乱糟糟的场面。体面和规矩对你来说不是虚的，而是让人安心的东西。", talent: "守位尽责、建立秩序、把场合办得体面。" },
    en: { label: "steady in place, orderly", traits: "You settle into your position and stay there, doing things in order and disliking a messy scene. Dignity and rules aren’t empty words to you — they’re what makes things feel safe.", talent: "Holding a role, establishing order, and giving an occasion its proper dignity." },
    es: { label: "firme en su lugar, ordenado", traits: "Te instalas en tu puesto y allí te quedas, haciendo las cosas por orden y sin gusto por el desorden. La compostura y las reglas no son palabras vacías para ti: te dan seguridad.", talent: "Cumplir un rol, establecer orden y dar dignidad a una ocasión." },
    fr: { label: "stable à sa place, ordonné", traits: "Vous vous installez à votre place et y restez, en faisant les choses dans l’ordre et sans aimer le désordre. Les convenances et les règles ne sont pas vaines pour vous : elles rassurent.", talent: "Tenir un rôle, instaurer l’ordre et donner de la tenue à une occasion." },
    de: { label: "fest an seinem Platz, ordentlich", traits: "Du findest deinen Platz und bleibst dort, erledigst Dinge der Reihe nach und magst kein Durcheinander. Form und Regeln sind für dich nicht leer – sie geben Sicherheit.", talent: "Eine Rolle ausfüllen, Ordnung schaffen und einem Anlass würdigen Rahmen geben." },
    ja: { label: "自分の位置を守り、秩序を重んじる", traits: "自分の持ち場に落ち着き、物事を順序立てて進め、乱れた場面が苦手です。格式や決まりは形だけではなく、安心につながるものだと感じます。", talent: "役割を守り、秩序を整え、場にふさわしい体裁を整えること。" },
  },
  恩光: {
    zh: { label: "付出容易被看见", traits: "你做过的事不容易被埋掉，往往会被该看见的人注意到，还被记住。这让你更愿意把事做好、做在明处。", talent: "把事情做出成果、让人记住你的贡献。" },
    en: { label: "efforts are noticed", traits: "What you do rarely stays buried — the right people tend to notice, and they remember. That makes you more willing to do things well and do them visibly.", talent: "Turning work into visible results and making your contribution remembered." },
    es: { label: "su esfuerzo se nota", traits: "Lo que haces rara vez queda enterrado: quien debe verlo suele notarlo y recordarlo. Eso te anima a hacer las cosas bien y a la vista.", talent: "Convertir el trabajo en resultados visibles y lograr que tu aporte se recuerde." },
    fr: { label: "des efforts remarqués", traits: "Ce que vous faites reste rarement enfoui : les bonnes personnes le remarquent et s’en souviennent. Cela vous encourage à bien faire, et à le faire au grand jour.", talent: "Transformer le travail en résultats visibles et faire retenir votre contribution." },
    de: { label: "Einsatz wird bemerkt", traits: "Was du tust, bleibt selten verborgen – die richtigen Leute bemerken es und erinnern sich. Das macht dich eher bereit, Dinge gut und sichtbar zu erledigen.", talent: "Arbeit in sichtbare Ergebnisse verwandeln und deinen Beitrag erinnerbar machen." },
    ja: { label: "したことが見られやすい", traits: "やったことは埋もれにくく、見るべき人が気づいて覚えていてくれます。だからこそ、物事をきちんと表立ってやろうと思えます。", talent: "仕事を目に見える成果に変え、自分の貢献を覚えてもらうこと。" },
  },
  天贵: {
    zh: { label: "关键处有人递机会", traits: "到了要紧的时候，常有人替你把机会递过来，或把你带上一条路。你不太需要四处求人，人脉往往自己找上来。", talent: "接住机会、把别人的引荐变成实际的下一步。" },
    en: { label: "opportunities arrive through people", traits: "At the crucial moment, someone often hands you an opportunity or opens a path. You don’t have to chase contacts everywhere — connections tend to come to you.", talent: "Catching opportunities and turning an introduction into a real next step." },
    es: { label: "oportunidades que llegan por personas", traits: "En el momento decisivo, alguien suele acercarte una oportunidad o abrirte un camino. No necesitas buscar contactos por todas partes: las relaciones suelen llegar a ti.", talent: "Aprovechar oportunidades y convertir una presentación en un paso real." },
    fr: { label: "des occasions qui viennent par les autres", traits: "Au moment décisif, quelqu’un vous tend souvent une occasion ou vous ouvre une voie. Vous n’avez pas à chercher des contacts partout : les liens viennent plutôt à vous.", talent: "Saisir les occasions et transformer une recommandation en étape concrète." },
    de: { label: "Gelegenheiten kommen über Menschen", traits: "Im entscheidenden Moment reicht dir oft jemand eine Gelegenheit oder öffnet dir einen Weg. Du musst nicht überall Kontakte suchen – Verbindungen kommen eher zu dir.", talent: "Gelegenheiten ergreifen und eine Empfehlung in einen echten nächsten Schritt verwandeln." },
    ja: { label: "要所で機会を渡される", traits: "肝心な場面で、誰かが機会を差し出したり道を開いてくれたりします。あちこちで人脈を探す必要はなく、縁のほうから近づいてきます。", talent: "機会を受け止め、紹介を現実の次の一歩に変えること。" },
  },
  天官: {
    zh: { label: "重名分、讲规矩", traits: "你在意自己的位置和名分，做事讲章程，不喜欢含糊其辞。别人觉得是形式的东西，你往往认真对待。", talent: "按规矩办事、界定职责、把事情办得名正言顺。" },
    en: { label: "cares about role and rules", traits: "You care about your position and standing, do things by the book, and dislike vagueness. What others dismiss as formality, you tend to take seriously.", talent: "Working by the rules, defining responsibilities, and making things formally sound." },
    es: { label: "le importan rango y normas", traits: "Te importan tu lugar y tu reconocimiento, haces las cosas según las normas y no te gusta la ambigüedad. Lo que otros ven como pura formalidad, tú sueles tomarlo en serio.", talent: "Actuar según las normas, delimitar responsabilidades y dar respaldo formal a lo que haces." },
    fr: { label: "attaché au rang et aux règles", traits: "Votre place et votre reconnaissance comptent, vous agissez selon les règles et n’aimez pas l’ambiguïté. Ce que d’autres prennent pour de la pure forme, vous le prenez souvent au sérieux.", talent: "Agir selon les règles, délimiter les responsabilités et donner un cadre formel aux choses." },
    de: { label: "Rang und Regeln sind wichtig", traits: "Deine Position und dein Ansehen sind dir wichtig, du handelst nach Vorschrift und magst keine Unklarheit. Was andere für bloße Formsache halten, nimmst du meist ernst.", talent: "Nach Regeln arbeiten, Zuständigkeiten klären und Dinge formal sauber machen." },
    ja: { label: "役職と決まりを重んじる", traits: "自分の立場や名分を気にし、物事を規則どおりに進め、曖昧なままを嫌います。人が形だけと見ることも、あなたは案外真剣に受け止めます。", talent: "規則に沿って進め、役割をはっきりさせ、筋の通った形にすること。" },
  },
  天福: {
    zh: { label: "有人兜底、懂得享福", traits: "你遇到麻烦时，常常会有人或某种巧合替你兜住，不容易真正掉到底。你也不太会苦着自己，知道怎样把日子过得舒服。", talent: "在逆境里等到转机，也把自己照顾舒服。" },
    en: { label: "a safety net, and enjoys life", traits: "When trouble comes, someone or some coincidence usually catches you and you rarely hit the bottom. You also don’t make life hard on yourself and know how to keep things comfortable.", talent: "Waiting out a rough patch until it turns, and taking good care of your own comfort." },
    es: { label: "con red de apoyo y gusto por vivir", traits: "Cuando surge un problema, alguien o alguna casualidad suele atraparte y rara vez tocas fondo. Tampoco te castigas: sabes mantener la vida cómoda.", talent: "Aguantar un mal momento hasta que cambie y cuidar tu propio bienestar." },
    fr: { label: "un filet de sécurité, et l’art de vivre", traits: "Quand un problème arrive, quelqu’un ou une coïncidence vous rattrape souvent et vous touchez rarement le fond. Vous ne vous malmenez pas non plus : vous savez garder la vie confortable.", talent: "Laisser passer un mauvais moment jusqu’au retournement et veiller à votre confort." },
    de: { label: "ein Sicherheitsnetz und Lebensfreude", traits: "Wenn Schwierigkeiten kommen, fängt dich meist jemand oder ein Zufall auf, und du fällst selten ganz durch. Du machst es dir auch nicht schwer und weißt, das Leben angenehm zu halten.", talent: "Eine schwierige Phase aussitzen, bis sie kippt, und gut für dein Wohlbefinden sorgen." },
    ja: { label: "支えがあり、暮らしを楽しむ", traits: "困りごとが起きても、誰かや偶然が受け止めてくれて、どん底まで落ちることは少ないです。自分を追い詰めず、心地よく暮らす術も知っています。", talent: "悪い時期を転機まで耐え、自分の快適さを整えること。" },
  },
  天空: {
    zh: { label: "想法飘、看得开", traits: "你的念头容易飘远，常常一下子想到很大的地方，对得失也看得开；这和地空那种「空」不是一回事。你更多是想法轻、落地慢，事情有人催才容易落到实处。", talent: "跳出现有框架想问题、给人换个角度看事。" },
    en: { label: "drifting ideas, detached", traits: "Your thoughts drift far and you often leap to the big picture, and you stay fairly detached about gains and losses; this is not the same “emptiness” as Di Kong. Yours is more light-footed thinking with slow follow-through — a nudge helps things land.", talent: "Thinking outside the current frame and offering people another angle." },
    es: { label: "ideas que flotan y desapego", traits: "Tus pensamientos se van lejos y sueles saltar a lo grande, y ves las ganancias y pérdidas con bastante desapego; esto no es la misma «nada» que Di Kong. En tu caso es una mente ligera y una puesta en marcha lenta: un empujón ayuda a aterrizar.", talent: "Pensar fuera del marco actual y ofrecer otra perspectiva." },
    fr: { label: "idées flottantes et détachement", traits: "Vos pensées s’envolent loin et vous sautez souvent vers le tableau d’ensemble, en gardant une certaine distance face aux gains et aux pertes ; ce n’est pas le même « vide » que Di Kong. Chez vous, l’esprit est léger et la concrétisation lente : un coup de pouce aide à atterrir.", talent: "Penser hors du cadre habituel et offrir un autre angle de vue." },
    de: { label: "schwebende Ideen, gelassen", traits: "Deine Gedanken schweifen weit und du springst oft zum großen Ganzen, bleibst bei Gewinn und Verlust ziemlich gelassen; das ist nicht die gleiche „Leere“ wie bei Di Kong. Bei dir ist der Geist leicht und die Umsetzung langsam – ein Anstoß hilft beim Landen.", talent: "Außerhalb des gewohnten Rahmens denken und anderen eine andere Sicht geben." },
    ja: { label: "発想が浮かび、達観している", traits: "考えがあちこちに飛び、すぐ大きな話に飛びやすい一方、損得にはわりと淡泊です。これは地空の「空」とは別物で、あなたの場合は発想が軽く、実行が遅めなだけ。後押しがあると地に足がつきます。", talent: "今の枠を外して考え、人に別の角度を示すこと。" },
  },
  解神: {
    zh: { label: "想得开、会化解", traits: "事情卡住时，你比较容易绕过去、想开一点，不会一直拧着。身边的人起了结，你也常能把话说到能解开的地方。", talent: "解开僵局、把话说到点上、帮人放下。" },
    en: { label: "lets go, untangles", traits: "When something gets stuck, you find it easier to go around it and let it go instead of staying knotted up. When people around you clash, you often find the words that loosen it.", talent: "Loosening deadlocks, saying the right thing, and helping people let go." },
    es: { label: "sabe soltar y desenredar", traits: "Cuando algo se atasca, te resulta más fácil rodearlo y soltarlo en vez de quedarte enganchado. Si la gente a tu alrededor choca, sueles encontrar las palabras que aflojan.", talent: "Aflojar bloqueos, dar con la frase justa y ayudar a soltar." },
    fr: { label: "lâche prise et démêle", traits: "Quand quelque chose se bloque, vous trouvez plus facilement un contournement et vous lâchez prise au lieu de rester noué. Quand votre entourage s’oppose, vous trouvez souvent les mots qui desserrent.", talent: "Dénouer les blocages, dire la phrase juste et aider à lâcher prise." },
    de: { label: "lässt los und entwirrt", traits: "Wenn etwas feststeckt, findest du leichter einen Weg daran vorbei und lässt los, statt verkrampft zu bleiben. Wenn es im Umfeld knirscht, findest du oft die Worte, die es lockern.", talent: "Blockaden lösen, das richtige Wort treffen und anderen beim Loslassen helfen." },
    ja: { label: "割り切りがよく、ほぐすのが得意", traits: "物事が行き詰まっても、こじらせずに回り道をして手放しやすいです。周りでもめごとが起きたとき、ほどける言葉を選ぶのが上手です。", talent: "行き詰まりをほぐし、的確な一言を選び、手放すのを助けること。" },
  },
  阴煞: {
    zh: { label: "对暗处敏感、易多想", traits: "你对没说出口的话、背后的动静特别敏感，常能先察觉到气氛不对。代价是容易越想越多，把不确定的事放大。", talent: "察觉隐情、提前发现苗头、读懂话外之意。" },
    en: { label: "alert to what’s hidden", traits: "You’re especially alert to unspoken words and things moving in the background, and often sense a shift in mood early. The cost is that you can spiral, magnifying what isn’t certain.", talent: "Spotting hidden motives, catching early signs, and reading between the lines." },
    es: { label: "alerta a lo oculto", traits: "Eres especialmente sensible a lo que no se dice y a lo que se mueve por detrás, y sueles notar antes que algo cambió. El precio es que puedes darle demasiadas vueltas y agrandar lo incierto.", talent: "Detectar lo no dicho, anticipar señales y leer entre líneas." },
    fr: { label: "attentif à ce qui est caché", traits: "Vous êtes particulièrement sensible aux non-dits et à ce qui bouge en coulisses, et vous sentez souvent un changement d’ambiance avant les autres. Le revers : vous pouvez broder et grossir l’incertain.", talent: "Repérer les non-dits, anticiper les signaux et lire entre les lignes." },
    de: { label: "wach für Verborgenes", traits: "Du bist besonders hellhörig für Ungesagtes und für das, was sich im Hintergrund bewegt, und spürst oft früh, dass sich etwas verändert. Der Preis: Du kannst dich hineinsteigern und Unsicheres vergrößern.", talent: "Ungesagtes bemerken, frühe Zeichen erkennen und zwischen den Zeilen lesen." },
    ja: { label: "隠れたことに敏感", traits: "口に出されない言葉や背後で動く気配にとても敏感で、雰囲気の変化を早く察します。その分、考えすぎて不確かなことを大きくしやすい面もあります。", talent: "隠れた意図に気づき、兆しを早めに見つけ、行間を読むこと。" },
  },
  蜚廉: {
    zh: { label: "消息灵、嘴快", traits: "你消息来得快，也藏不住话，听到什么容易顺着说出去。这和博士十二神里的「飞廉」不是同一位：你更像是话题的传递者，也因此容易卷进口舌。", talent: "打听消息、传递讯息、把话题带热。" },
    en: { label: "well-informed, quick-tongued", traits: "News reaches you fast and you don’t hold words back — what you hear tends to travel on. This is not the same as Fei Lian among the twelve Doctor spirits: you’re more a carrier of talk, which is exactly how you get drawn into gossip.", talent: "Finding things out, passing information on, and getting a conversation going." },
    es: { label: "bien informado y de lengua rápida", traits: "Las noticias te llegan rápido y no te guardas las palabras: lo que oyes tiende a seguir circulando. No es el mismo Fei Lian de los doce espíritus Doctor: tú eres más un transmisor de temas, y por eso te ves metido en habladurías.", talent: "Enterarte de las cosas, transmitir información y animar una conversación." },
    fr: { label: "bien informé, langue rapide", traits: "Les nouvelles vous parviennent vite et vous ne gardez pas les mots : ce que vous entendez circule volontiers. Ce n’est pas le même Fei Lian que parmi les douze esprits Docteur : vous êtes plutôt un passeur de sujets, d’où votre tendance à être mêlé aux ragots.", talent: "S’informer, transmettre l’information et lancer les conversations." },
    de: { label: "gut informiert, schnell mit Worten", traits: "Neuigkeiten erreichen dich schnell, und du hältst Worte nicht zurück – was du hörst, wandert weiter. Das ist nicht der Fei Lian der zwölf Gelehrten-Geister: Du gibst Themen eher weiter und gerätst dadurch in Gerede.", talent: "Dinge herausfinden, Informationen weitergeben und Gespräche anstoßen." },
    ja: { label: "情報が早く、口が軽い", traits: "情報が早く入り、口も軽いので、聞いた話がそのまま広がりやすいです。博士十二神の「飛廉」とは別の星で、あなたは話題の伝え役。そのぶん噂話に巻き込まれやすい面があります。", talent: "情報を集め、伝え、話題を温めること。" },
  },
  台辅: {
    zh: { label: "辅助位、托得住人", traits: "你在辅助的位置上最自在，能把主角背后的杂事稳稳接住。你不抢镜，但少你那一角，场面就容易散。", talent: "做后盾、处理细务、让人放心把背交给你。" },
    en: { label: "a reliable support", traits: "You’re most at ease in a supporting role, quietly holding the chores behind the main act. You don’t grab the spotlight, yet without your corner the scene tends to fall apart.", talent: "Backing someone up, handling the details, and being someone others can rely on." },
    es: { label: "apoyo fiable", traits: "Estás más cómodo en un papel de apoyo, sosteniendo en silencio los detalles detrás del protagonista. No buscas el foco, pero sin tu parte la escena se desarma.", talent: "Ser respaldo, encargarte de los detalles y ser alguien en quien confiar." },
    fr: { label: "un soutien fiable", traits: "Vous êtes plus à l’aise dans un rôle de soutien, tenant discrètement les détails derrière le premier rôle. Vous ne cherchez pas les projecteurs, mais sans votre coin, la scène se défait.", talent: "Servir d’appui, gérer les détails et inspirer confiance." },
    de: { label: "eine verlässliche Stütze", traits: "Am wohlsten ist dir eine unterstützende Rolle, in der du still die Details hinter dem Hauptdarsteller hältst. Du suchst keine Bühne, doch ohne deinen Part fällt das Ganze auseinander.", talent: "Rückhalt geben, Details erledigen und jemand sein, auf den man sich verlassen kann." },
    ja: { label: "支える立場で頼れる", traits: "支える立場が一番落ち着き、主役の後ろで細かなことをしっかり引き受けます。目立とうとはしませんが、あなたの持ち場がないと場が崩れます。", talent: "後ろ盾になり、細事を整え、背中を預けられる存在でいること。" },
  },
  封诰: {
    zh: { label: "在意名分与认可", traits: "你在意头衔、证书、正式承认这类东西，觉得有名有分才踏实。做事也倾向走正规渠道，把该盖的章盖齐。", talent: "争取正式认可、办手续、让成果有名有分。" },
    en: { label: "values titles and recognition", traits: "Titles, credentials and formal recognition matter to you — things feel solid only when they’re properly named. You tend to go through official channels and make sure every stamp is in place.", talent: "Securing formal recognition, handling paperwork, and giving results an official standing." },
    es: { label: "valora títulos y reconocimiento", traits: "Los títulos, credenciales y el reconocimiento formal te importan: las cosas se sienten firmes solo cuando tienen nombre. Sueles ir por canales oficiales y asegurarte de que no falte ningún sello.", talent: "Conseguir reconocimiento formal, gestionar trámites y dar respaldo oficial a los logros." },
    fr: { label: "attaché aux titres et à la reconnaissance", traits: "Les titres, les diplômes et la reconnaissance officielle comptent pour vous : une chose n’est solide que lorsqu’elle est bien nommée. Vous passez volontiers par les canaux officiels et veillez à ce que tout soit en règle.", talent: "Obtenir une reconnaissance formelle, gérer les démarches et donner un statut officiel aux résultats." },
    de: { label: "Titel und Anerkennung sind wichtig", traits: "Titel, Nachweise und offizielle Anerkennung bedeuten dir etwas – erst wenn etwas richtig benannt ist, fühlt es sich solide an. Du gehst eher über offizielle Wege und sorgst dafür, dass alle Stempel da sind.", talent: "Formale Anerkennung sichern, Formalitäten erledigen und Ergebnisse offiziell verankern." },
    ja: { label: "肩書きと評価を気にする", traits: "肩書きや資格、正式な承認を重んじ、名分がはっきりして初めて安心できます。物事も正規のルートで進め、必要な手続きをきちんと整えがちです。", talent: "正式な評価を得て、手続きを進め、成果に名分を与えること。" },
  },
  天巫: {
    zh: { label: "亲近玄学与老传统", traits: "你对玄学、医药、老传统这类东西天然有兴趣，愿意花时间去琢磨。别人觉得玄的东西，你更愿意当成一门手艺去研究。", talent: "钻研老学问、整理冷门知识、把经验传下来。" },
    en: { label: "drawn to the esoteric and old lore", traits: "You have a natural interest in metaphysics, medicine and old traditions, and you’ll spend time digging into them. What others find mysterious, you prefer to study like a craft.", talent: "Digging into old knowledge, organising niche material, and passing experience on." },
    es: { label: "atraído por lo esotérico y lo antiguo", traits: "Sientes un interés natural por la metafísica, la medicina y las tradiciones antiguas, y dedicas tiempo a estudiarlas. Lo que otros ven como misterioso, tú prefieres tratarlo como un oficio.", talent: "Profundizar en saberes antiguos, ordenar conocimiento poco común y transmitir experiencia." },
    fr: { label: "attiré par l’ésotérique et l’ancien", traits: "La métaphysique, la médecine et les vieilles traditions vous intéressent naturellement, et vous y consacrez du temps. Ce que d’autres trouvent mystérieux, vous préférez l’étudier comme un métier.", talent: "Approfondir les savoirs anciens, organiser des connaissances rares et transmettre l’expérience." },
    de: { label: "offen für Esoterik und altes Wissen", traits: "Metaphysik, Medizin und alte Traditionen interessieren dich von Natur aus, und du nimmst dir Zeit dafür. Was andere geheimnisvoll finden, untersuchst du lieber wie ein Handwerk.", talent: "Altes Wissen ergründen, seltene Kenntnisse ordnen und Erfahrung weitergeben." },
    ja: { label: "占いや古い伝統に親しむ", traits: "占いや医学、古い伝統に自然と惹かれ、時間をかけて調べます。人から不思議がられることも、あなたは一つの技として研究するほうです。", talent: "古い学問を掘り下げ、珍しい知識を整理し、経験を伝えること。" },
  },
  天月: {
    zh: { label: "对环境变化敏感", traits: "你对季节、光线、环境的细微变化很敏感，也能很快察觉自己状态的高低起伏。换个环境或调整节奏，你的感受会明显不同。", talent: "调整环境、挑对时机、把氛围调到舒服。" },
    en: { label: "sensitive to surroundings", traits: "You’re keenly aware of small shifts in season, light and surroundings, and you notice quickly when your own energy rises or falls. A change of setting or pace makes a visible difference to how you feel.", talent: "Adjusting the environment, picking the right moment, and tuning the mood." },
    es: { label: "sensible al entorno", traits: "Percibes con nitidez los cambios pequeños de estación, luz y ambiente, y notas pronto cuándo sube o baja tu propia energía. Cambiar de lugar o de ritmo marca una diferencia clara en cómo te sientes.", talent: "Ajustar el entorno, elegir el momento adecuado y afinar el ambiente." },
    fr: { label: "sensible à l’environnement", traits: "Vous percevez finement les petits changements de saison, de lumière et d’ambiance, et vous remarquez vite quand votre énergie monte ou baisse. Changer de cadre ou de rythme fait une nette différence sur votre ressenti.", talent: "Ajuster le cadre, choisir le bon moment et régler l’ambiance." },
    de: { label: "feinfühlig für die Umgebung", traits: "Du nimmst kleine Veränderungen von Jahreszeit, Licht und Umgebung genau wahr und merkst schnell, wenn deine Energie steigt oder sinkt. Ein Wechsel von Ort oder Tempo macht einen deutlichen Unterschied für dein Empfinden.", talent: "Die Umgebung anpassen, den richtigen Zeitpunkt wählen und die Stimmung abstimmen." },
    ja: { label: "環境の変化に敏感", traits: "季節や光、環境のわずかな変化を細やかに感じ取り、自分の調子の上下にもすぐ気づきます。場所やリズムを変えると、感じ方がはっきり変わります。", talent: "環境を整え、頃合いを見計らい、雰囲気を心地よくすること。" },
  },
  天才: {
    zh: { label: "学得快、有灵气", traits: "你上手新东西的速度比别人快，某个领域常常一点就通。学得轻松，但要练到深，还得靠耐心。", talent: "快速上手、举一反三、把新技能摸出门道。" },
    en: { label: "quick to learn, naturally gifted", traits: "You pick up new things faster than most and often get the hang of some field at first touch. Learning comes easily, though going deep still takes patience.", talent: "Getting up to speed fast, drawing inferences, and working out the knack of a new skill." },
    es: { label: "aprende rápido, con talento", traits: "Aprendes cosas nuevas más rápido que la mayoría y en algún campo todo te sale a la primera. Aprender te resulta fácil, aunque llegar a fondo exige paciencia.", talent: "Ponerte al día rápido, sacar conclusiones y encontrarle la maña a una habilidad nueva." },
    fr: { label: "apprend vite, avec du don", traits: "Vous assimilez plus vite que la plupart et, dans un domaine, tout vous paraît évident au premier contact. Apprendre vous est facile, même si aller au fond demande de la patience.", talent: "Monter vite en compétence, faire des déductions et trouver le tour de main d’un nouveau savoir-faire." },
    de: { label: "lernt schnell, mit Begabung", traits: "Du lernst Neues schneller als die meisten und hast in einem Bereich oft sofort den Dreh raus. Lernen fällt dir leicht, auch wenn Tiefe Geduld braucht.", talent: "Schnell auf Stand kommen, Schlüsse ziehen und den Kniff einer neuen Fertigkeit finden." },
    ja: { label: "覚えが早く、才気がある", traits: "新しいことを人より早く身につけ、ある分野では一度でこつをつかみます。覚えるのは楽ですが、深めるには忍耐が要ります。", talent: "素早く習得し、応用を利かせ、新しい技能の勘所をつかむこと。" },
  },
  天寿: {
    zh: { label: "节奏稳、耐性好", traits: "你做事不急，按自己的节奏来，一件事能慢慢磨下去。你不喜欢被赶、被推着变来变去，更愿意把局面稳住。", talent: "长期坚持、稳住节奏、把难事一点点做完。" },
    en: { label: "steady pace, patient", traits: "You don’t rush; you work at your own pace and can keep grinding on one thing slowly. You dislike being hurried or pushed to change course, and would rather hold things steady.", talent: "Staying with something long term, keeping a steady rhythm, and finishing hard things bit by bit." },
    es: { label: "ritmo estable, paciente", traits: "No te apresuras: avanzas a tu ritmo y puedes pulir una misma cosa despacio. No te gusta que te metan prisa ni te empujen a cambiar, y prefieres mantener la situación estable.", talent: "Sostener algo a largo plazo, mantener el ritmo y terminar lo difícil poco a poco." },
    fr: { label: "rythme régulier, patient", traits: "Vous ne vous pressez pas : vous avancez à votre rythme et pouvez travailler lentement la même chose. Vous n’aimez pas être bousculé ni poussé à changer, et préférez garder les choses stables.", talent: "Tenir sur la durée, garder un rythme régulier et terminer les choses difficiles pas à pas." },
    de: { label: "gleichmäßig, geduldig", traits: "Du hetzt nicht, gehst in deinem Tempo und kannst dich langsam an einer Sache abarbeiten. Du magst es nicht, gehetzt oder zu Änderungen gedrängt zu werden, und hältst lieber alles stabil.", talent: "Langfristig dranbleiben, ein ruhiges Tempo halten und Schwieriges Stück für Stück erledigen." },
    ja: { label: "マイペースで忍耐強い", traits: "急がず自分のペースで進み、一つのことをゆっくり磨き続けられます。せかされたり、次々に変えるよう押されたりするのが苦手で、状況を落ち着かせておくほうを好みます。", talent: "長く続け、一定のリズムを保ち、難しいことも少しずつ仕上げること。" },
  },
  截空: {
    zh: { label: "半路被截断", traits: "你的事常在做到一半时被截住，或原来的路忽然走不通。所以你和计划之间，最好始终留一条备用的路。", talent: "预判中断、提前安排退路、被打断后重新接上。" },
    en: { label: "cut off midway", traits: "Your efforts often get stopped halfway, or the original route suddenly closes. So it’s wise to keep a backup path between you and any plan.", talent: "Foreseeing interruptions, arranging a fallback early, and reconnecting after a break." },
    es: { label: "cortado a mitad de camino", traits: "Tus asuntos suelen quedar cortados a medio hacer, o el camino previsto se cierra de golpe. Por eso conviene que siempre haya una ruta alternativa entre tú y tus planes.", talent: "Prever interrupciones, preparar una salida con antelación y retomar tras un corte." },
    fr: { label: "coupé en cours de route", traits: "Vos élans sont souvent stoppés à mi-chemin, ou la voie prévue se ferme soudain. Mieux vaut donc toujours garder une solution de repli entre vous et vos projets.", talent: "Anticiper les interruptions, prévoir une porte de sortie et reprendre après une coupure." },
    de: { label: "mittendrin abgeschnitten", traits: "Deine Vorhaben werden oft auf halbem Weg gestoppt, oder der geplante Weg schließt sich plötzlich. Deshalb ist es klug, zwischen dir und jedem Plan immer einen Ausweichweg offen zu halten.", talent: "Unterbrechungen voraussehen, früh einen Rückweg einplanen und nach einem Bruch wieder anknüpfen." },
    ja: { label: "途中で断たれやすい", traits: "物事が半ばで止められたり、元の道が急に閉ざされたりしがちです。だからこそ、計画には常に別ルートを用意しておくのが賢明です。", talent: "中断を見越し、早めに逃げ道を用意し、途切れたあとに再接続すること。" },
  },
  副截: {
    zh: { label: "收尾时拐弯", traits: "和截空成对，你这边更容易在快结束的时候改道，方向说变就变。不是做不成，而是结局常和开头设想的不一样。", talent: "临门改向、收尾时调整、把变化接成新结果。" },
    en: { label: "turns at the finish", traits: "Paired with Jie Kong, your pattern is more about changing course right before the end — the direction can shift suddenly. It’s not failure; the ending just rarely matches the opening plan.", talent: "Turning at the last minute, adjusting the close, and shaping change into a new result." },
    es: { label: "gira al final", traits: "En pareja con Jie Kong, en tu caso es más fácil cambiar de rumbo justo antes de terminar: la dirección puede virar de repente. No es fracasar; el final simplemente rara vez coincide con el plan inicial.", talent: "Girar a última hora, ajustar el cierre y convertir el cambio en un nuevo resultado." },
    fr: { label: "bifurque à l’arrivée", traits: "En binôme avec Jie Kong, votre tendance est plutôt de changer de cap juste avant la fin : la direction peut basculer d’un coup. Ce n’est pas un échec ; la fin correspond rarement au plan de départ.", talent: "Virer au dernier moment, ajuster la conclusion et transformer le changement en résultat." },
    de: { label: "biegt kurz vor dem Ziel ab", traits: "Als Gegenstück zu Jie Kong wechselst du eher kurz vor dem Ende die Richtung – sie kann plötzlich kippen. Das ist kein Scheitern; das Ende passt nur selten zum ursprünglichen Plan.", talent: "Kurz vor Schluss umlenken, den Abschluss anpassen und Veränderung in ein neues Ergebnis bringen." },
    ja: { label: "終盤で向きが変わる", traits: "截空と対になる星で、あなたの場合は終わり際に進路が変わりやすいです。方向が急に転じることもありますが、失敗ではなく、結末が最初の想定と違うだけです。", talent: "土壇場で向きを変え、締めくくりを調整し、変化を新しい成果につなげること。" },
  },
  旬空: {
    zh: { label: "忙一场、未落实", traits: "你常有这种体验：忙了很久，回头一看却觉得没留下什么实在的东西。这不等于白做，只是成果的落点比预期晚、也更隐蔽。", talent: "复盘过程、找出真正有效的部分、为下一轮留经验。" },
    en: { label: "busy, but it doesn’t land", traits: "You often know the feeling: after a long stretch of effort, you look back and find little solid left. That isn’t the same as doing nothing — results just land later and less visibly than expected.", talent: "Reviewing a process, spotting what actually worked, and carrying lessons into the next round." },
    es: { label: "mucho trajín, poco aterrizaje", traits: "Sueles vivir esto: tras un largo esfuerzo, miras atrás y sientes que no quedó nada concreto. No es lo mismo que no hacer nada; los frutos simplemente llegan más tarde y menos a la vista.", talent: "Revisar el proceso, detectar lo que sí sirvió y llevarte la lección a la siguiente vuelta." },
    fr: { label: "beaucoup d’effort, peu de prise", traits: "Vous connaissez souvent ce sentiment : après un long effort, vous regardez en arrière et trouvez peu de concret. Ce n’est pas n’avoir rien fait ; les résultats arrivent simplement plus tard et moins visiblement.", talent: "Revoir un processus, repérer ce qui a vraiment marché et en tirer une leçon pour la suite." },
    de: { label: "viel Mühe, wenig Greifbares", traits: "Du kennst das oft: Nach einer langen Anstrengung blickst du zurück und findest wenig Handfestes. Das ist nicht dasselbe wie nichts getan – die Ergebnisse kommen nur später und weniger sichtbar.", talent: "Einen Prozess nachvollziehen, erkennen, was wirklich gewirkt hat, und die Lehre mitnehmen." },
    ja: { label: "忙しくても実りが薄い", traits: "長く頑張ったのに、振り返ると確かなものが残っていないと感じることがよくあります。何もしなかったのとは違い、成果の現れ方が遅く、目立ちにくいだけです。", talent: "過程を振り返り、本当に効いた部分を見つけ、次の回に活かすこと。" },
  },
  副旬: {
    zh: { label: "白忙一阵", traits: "和旬空成对，你更容易遇到「忙了半天、像在原地打转」的阶段。与其硬推，不如趁机歇一歇、重新看方向。", talent: "及时止损、承认空转、把力气换到对的地方。" },
    en: { label: "a wasted spell", traits: "Paired with Xun Kong, you’re more likely to hit phases of “busy all day, yet somehow going in circles.” Instead of forcing it, it pays to pause and recheck the direction.", talent: "Cutting losses early, admitting a spin, and moving your energy where it counts." },
    es: { label: "una racha de esfuerzo baldío", traits: "En pareja con Xun Kong, es más probable que atravieses etapas de «todo el día ocupado, pero dando vueltas». En vez de forzar, conviene parar y revisar la dirección.", talent: "Cortar a tiempo, reconocer el giro en vacío y mover tu energía a donde rinde." },
    fr: { label: "une période d’efforts vains", traits: "En binôme avec Xun Kong, vous risquez davantage des phases de « occupé toute la journée, mais à tourner en rond ». Plutôt que de forcer, il vaut mieux faire une pause et revoir la direction.", talent: "Couper les pertes à temps, reconnaître le surplace et déplacer votre énergie là où elle compte." },
    de: { label: "eine Phase des Leerlaufs", traits: "Als Gegenstück zu Xun Kong gerätst du eher in Phasen, in denen du „den ganzen Tag beschäftigt bist und doch im Kreis läufst“. Statt zu erzwingen, lohnt es sich, innezuhalten und die Richtung zu prüfen.", talent: "Rechtzeitig die Notbremse ziehen, Leerlauf zugeben und deine Kraft dorthin lenken, wo sie wirkt." },
    ja: { label: "空回りする時期", traits: "旬空と対になる星で、「一日中忙しいのに、なぜか堂々巡り」という時期に入りやすいです。無理に押すより、いったん止まって方向を見直すほうが得策です。", talent: "早めに損切りし、空回りを認め、力を効く場所へ移すこと。" },
  },
  月德: {
    zh: { label: "心宽、少结怨", traits: "你不太记仇，别人有对不住的地方也容易过去，所以身边少有人跟你结死梁子。这份宽和常换成关键时刻有人搭把手。", talent: "化解恩怨、缓和关系、让人愿意帮你。" },
    en: { label: "forgiving, rarely makes enemies", traits: "You don’t hold grudges and get over other people’s slights fairly easily, so few end up locked against you. That mildness often turns into a hand at the crucial moment.", talent: "Dissolving grudges, easing relationships, and making people willing to help." },
    es: { label: "comprensivo, sin enemigos", traits: "No guardas rencor y te resulta fácil pasar por alto las ofensas, así que pocos acaban enfrentados contigo. Esa suavidad suele convertirse en una mano en el momento clave.", talent: "Disolver rencores, suavizar relaciones y lograr que la gente quiera ayudarte." },
    fr: { label: "indulgent, peu d’ennemis", traits: "Vous ne gardez pas rancune et passez assez facilement sur les torts des autres, si bien que peu de gens se braquent contre vous. Cette douceur se transforme souvent en coup de main au bon moment.", talent: "Dissoudre les rancunes, apaiser les relations et donner envie d’aider." },
    de: { label: "nachsichtig, selten Feinde", traits: "Du trägst keinen Groll und kommst über Kränkungen ziemlich leicht hinweg, deshalb stellen sich nur wenige gegen dich. Diese Milde wird oft zu einem helfenden Händedruck im richtigen Moment.", talent: "Groll auflösen, Beziehungen entspannen und andere zum Helfen bringen." },
    ja: { label: "心が広く、恨みを買いにくい", traits: "恨みを引きずらず、人の失礼もわりとすぐ流せるので、あなたと本気で敵対する人は少ないです。その穏やかさが、肝心なときの助け手に変わります。", talent: "わだかまりを溶かし、関係を和らげ、人に助けてあげたいと思わせること。" },
  },
  天德: {
    zh: { label: "留余地、被体谅", traits: "你说话做事习惯给别人留一步，不把人逼到墙角。也正因为这样，你自己出错时，旁人也更愿意往好处想你。", talent: "照顾各方感受、收住话说、把冲突化小。" },
    en: { label: "leaves room, is given grace", traits: "In word and deed you tend to leave others a step of room and don’t back them into a corner. Because of that, when you slip up, people are more inclined to assume the best.", talent: "Considering everyone’s feelings, holding back a remark, and shrinking a conflict." },
    es: { label: "deja margen y se le disculpa", traits: "Al hablar y actuar sueles dejar un paso de margen y no acorralas a nadie. Por eso, cuando te equivocas, la gente tiende a pensar bien de ti.", talent: "Cuidar los sentimientos de todos, contener una frase y reducir un conflicto." },
    fr: { label: "laisse de la place, est compris", traits: "Dans vos paroles et vos actes, vous laissez souvent une marge aux autres sans les acculer. C’est pourquoi, quand vous commettez une erreur, on incline à penser du bien de vous.", talent: "Ménager les sensibilités, retenir une phrase et désamorcer un conflit." },
    de: { label: "lässt Raum, wird geschont", traits: "In Wort und Tat lässt du anderen meist einen Schritt Raum und drängst sie nicht in die Ecke. Genau deshalb neigen Leute bei deinen Fehlern eher zum Guten.", talent: "Auf alle Gefühle achten, eine Bemerkung zurückhalten und einen Konflikt verkleinern." },
    ja: { label: "余地を残し、理解されやすい", traits: "言葉でも行動でも、相手に一歩の余地を残し、追い詰めません。だからこそ、あなたが失敗したときも、周りは好意的に解釈してくれます。", talent: "それぞれの気持ちに配慮し、言葉を飲み、衝突を小さくすること。" },
  },
  天伤: {
    zh: { label: "为别人耗神、操心多", traits: "你对朋友、同事、下属的事上心，容易替他们操心到把自己搭进去。帮人是你的本能，但你的精力也需要有边界。", talent: "替人分忧、照看团队、把别人的难题接过来。" },
    en: { label: "wears itself out for others", traits: "You take your friends’, colleagues’ and team members’ troubles to heart and can worry yourself into exhaustion on their behalf. Helping is instinctive for you, though your energy needs a boundary.", talent: "Shouldering others’ worries, looking after a team, and taking on other people’s problems." },
    es: { label: "se desgasta por los demás", traits: "Te tomas a pecho los problemas de amigos, colegas y subordinados, y puedes preocuparte hasta desgastarte por ellos. Ayudar es instintivo en ti, aunque tu energía necesita límites.", talent: "Asumir las preocupaciones ajenas, cuidar del equipo y hacer tuyos los problemas de otros." },
    fr: { label: "s’épuise pour les autres", traits: "Vous prenez à cœur les soucis de vos amis, collègues et collaborateurs, au point de vous épuiser pour eux. Aider est chez vous un réflexe, mais votre énergie a besoin de limites.", talent: "Porter les soucis d’autrui, veiller sur une équipe et assumer les problèmes des autres." },
    de: { label: "verausgabt sich für andere", traits: "Die Sorgen von Freunden, Kollegen und Mitarbeitern nimmst du dir zu Herzen und kannst dich für sie aufreiben. Helfen ist bei dir instinktiv, doch deine Energie braucht Grenzen.", talent: "Sorgen anderer mittragen, ein Team im Blick behalten und fremde Probleme übernehmen." },
    ja: { label: "人のために気を耗やす", traits: "友人や同僚、部下のことを気にかけ、彼らのために心配しすぎて自分まで疲れてしまいがちです。助けるのは本能ですが、自分の体力には境界線が必要です。", talent: "人の悩みを引き受け、チームを気遣い、他人の難題を代わりに抱えること。" },
  },
  天使: {
    zh: { label: "跑腿传话、闲不住", traits: "你常被叫去跑腿、传话、张罗杂事，自己也闲不下来。你在这些来回里消耗精力，却也是把人和事串起来的那根线。", talent: "来回奔走、传话对接、把零散的事串起来。" },
    en: { label: "runs errands, can’t sit still", traits: "You’re often asked to run errands, pass messages or handle the odds and ends, and you can’t sit still anyway. All that back-and-forth drains you, yet you’re the thread linking people and tasks.", talent: "Moving between places, relaying messages, and linking scattered pieces together." },
    es: { label: "hace recados, no para quieto", traits: "Suelen pedirte recados, mensajes y mil tareas sueltas, y además no te quedas quieto. Tanto ir y venir te desgasta, pero eres el hilo que une a las personas y los asuntos.", talent: "Ir y venir, hacer de enlace y conectar piezas dispersas." },
    fr: { label: "court partout, ne tient pas en place", traits: "On vous demande souvent des courses, des messages ou mille petites choses, et vous ne tenez pas en place de toute façon. Ces allers-retours vous épuisent, mais vous êtes le fil qui relie les gens et les tâches.", talent: "Faire la navette, servir d’intermédiaire et relier des éléments épars." },
    de: { label: "ständig unterwegs, unruhig", traits: "Man bittet dich oft um Besorgungen, Botschaften oder allerlei Kleinkram, und ohnehin sitzt du nicht still. Das Hin und Her zehrt an dir, doch du bist der Faden zwischen Menschen und Aufgaben.", talent: "Wege laufen, Botschaften weitergeben und Verstreutes verbinden." },
    ja: { label: "走り回り、じっとしていない", traits: "用事や伝言、細々したことを頼まれることが多く、自分でもじっとしていられません。行き来するうちに体力は削られますが、人と用事をつなぐ糸になっています。", talent: "あちこち走り回り、伝言をつなぎ、ばらばらのことを結びつけること。" },
  },
  天厨: {
    zh: { label: "讲究吃、有口福", traits: "你对吃的讲究，愿意为一顿好饭花时间，也常能吃上不错的。生活上的品质你在意，但更像是享受，而不是攀比。", talent: "挑食材、安排饭局、把一顿饭吃得舒服。" },
    en: { label: "particular about food, eats well", traits: "You take food seriously, will spend time on a good meal, and often end up eating well. You care about quality of life, but more as enjoyment than as one-upmanship.", talent: "Choosing ingredients, arranging meals, and making a dinner feel right." },
    es: { label: "exigente con la comida, come bien", traits: "Te tomas en serio la comida, dedicas tiempo a un buen plato y sueles acabar comiendo bien. Te importa la calidad de vida, más por disfrute que por comparación.", talent: "Elegir ingredientes, organizar comidas y hacer que una mesa se sienta bien." },
    fr: { label: "exigeant sur la table, mange bien", traits: "La nourriture compte pour vous : vous prenez le temps d’un bon repas et finissez souvent par bien manger. La qualité de vie vous importe, par plaisir plutôt que par comparaison.", talent: "Choisir les ingrédients, organiser les repas et rendre une table agréable." },
    de: { label: "anspruchsvoll beim Essen", traits: "Essen ist dir wichtig, für eine gute Mahlzeit nimmst du dir Zeit, und meist isst du auch gut. Lebensqualität zählt für dich – eher als Genuss denn als Vergleich.", talent: "Zutaten auswählen, Essen organisieren und eine Tafel stimmig machen." },
    ja: { label: "食にこだわり、食べるのに恵まれる", traits: "食べることにこだわり、良い食事のためなら時間も惜しみません。実際に良いものを食べる機会も多いです。暮らしの質は気にしますが、見栄より楽しみとして捉えます。", talent: "食材を選び、食事の段取りを組み、食卓を心地よく整えること。" },
  },
  年解: {
    zh: { label: "遇事常有转圜", traits: "你碰到卡点，往往还能找到回旋的余地，不至于一次走死。这条更偏流年意味：它说的是「有转机」，不是保证每次都顺。", talent: "找台阶、留缓冲、把死局谈成活局。" },
    en: { label: "usually a way around", traits: "When you hit a blockage, there’s often still some room to manoeuvre instead of a dead end. This one leans toward the annual cycle: it points to a turning point, not a guarantee that everything goes smoothly.", talent: "Finding a step down, keeping a buffer, and talking a deadlock into a workable deal." },
    es: { label: "suele haber salida", traits: "Cuando topas con un bloqueo, a menudo queda margen para maniobrar en vez de un callejón sin salida. Esta se inclina hacia el ciclo anual: señala un punto de giro, no garantiza que todo salga bien.", talent: "Encontrar una salida, dejar margen y convertir un callejón sin salida en algo viable." },
    fr: { label: "il y a souvent une issue", traits: "Quand vous butez sur un obstacle, il reste souvent une marge de manœuvre plutôt qu’un cul-de-sac. Cette étoile penche vers le cycle annuel : elle indique un tournant, sans garantir que tout roule.", talent: "Trouver une porte de sortie, garder une marge et transformer un blocage en accord possible." },
    de: { label: "meist gibt es einen Ausweg", traits: "Wenn du an eine Blockade stößt, bleibt oft noch Spielraum statt einer Sackgasse. Diese Konstellation neigt zum Jahreszyklus: Sie deutet auf einen Wendepunkt, nicht auf eine Garantie, dass alles glattläuft.", talent: "Einen Ausweg finden, einen Puffer lassen und aus einer Sackgasse eine machbare Lösung machen." },
    ja: { label: "たいてい逃げ道がある", traits: "行き詰まっても、行き止まりにならずに動かせる余地が残ることが多いです。これは年運寄りの星で、「転機がある」を示すもので、毎回うまくいく保証ではありません。", talent: "逃げ道を見つけ、余白を残し、袋小路を話し合いで活路に変えること。" },
  },
};

/** 查辅星白话；未收录返回 null。 */
export function plainAux(name: string): StarPlain | null {
  return AUX[canonicalStar(name)] ?? null;
}

/**
 * 十二神白话。四组（长生 / 博士 / 将前 / 岁前）共 48 个神位，
 * 其中 小耗、官符、病符 三组重名，合并为一条，故本表 45 条。
 * 第四批起 45 条全部为 label / traits / talent 三字段，不再保留单句形态。
 *
 * 口径：十二神多是岁运、阶段性的标记，不是先天性格；
 * 文案只说明「这个标记偏向什么」，不判吉凶、不预测事件、不提健康与寿命。
 * 星曜词条（STARS / AUX）与本表互不复用。
 */
type ShierShenPlain = StarPlain;

const SHIER_SHEN_PLAIN: Record<string, ShierShenPlain> = {
  // ── 长生十二神（随五行局起，看阶段）──
  长生: {
    zh: { label: "起步、打底、往前长", traits: "你正处在起步和打基础的阶段，愿意学、愿意往前试，对新鲜事还有劲头。", talent: "开新局、打基础、把长期的事慢慢铺开。" },
    en: { label: "starting out, growing", traits: "You’re in a starting phase, building foundations and still eager to learn and try new things.", talent: "Opening new ground, laying foundations, and unfolding long-term work slowly." },
    es: { label: "arrancando y creciendo", traits: "Estás en una fase de arranque, poniendo bases y aún con ganas de aprender y probar cosas nuevas.", talent: "Abrir camino, sentar bases y desarrollar lo largo plazo con calma." },
    fr: { label: "démarrer et grandir", traits: "Vous êtes dans une phase de démarrage : vous posez les bases et gardez l’envie d’apprendre et d’essayer.", talent: "Ouvrir de nouveaux chemins, poser des bases et faire mûrir un projet long." },
    de: { label: "im Aufbruch, im Wachstum", traits: "Du bist in einer Startphase: Du legst Grundlagen und hast noch Lust zu lernen und Neues auszuprobieren.", talent: "Neues öffnen, Grundlagen legen und Langfristiges in Ruhe aufbauen." },
    ja: { label: "始まり、土台づくり、成長", traits: "始まりと土台づくりの段階で、学ぶ意欲や新しいことを試す勢いがまだあります。", talent: "新しい局面を開き、土台を築き、長期の物事をゆっくり進めること。" },
  },
  沐浴: {
    zh: { label: "未定型、爱新鲜", traits: "你还处在没定型的阶段，容易被新鲜事吸引，想法和状态都变得快。", talent: "尝新、转换视角、在变化里找感觉。" },
    en: { label: "unsettled, drawn to novelty", traits: "You’re not fully formed yet, easily drawn to what’s new, and your ideas and moods can shift quickly.", talent: "Trying new things, switching perspectives, and finding a feel for change." },
    es: { label: "sin definir, atraído por lo nuevo", traits: "Todavía no estás del todo formado, te atrae lo nuevo y tus ideas y tu ánimo cambian rápido.", talent: "Probar cosas nuevas, cambiar de perspectiva y encontrar el pulso del cambio." },
    fr: { label: "pas encore fixé, attiré par la nouveauté", traits: "Vous n’êtes pas encore tout à fait formé, la nouveauté vous attire et vos idées comme votre humeur bougent vite.", talent: "Expérimenter, changer d’angle et trouver le bon tempo dans le changement." },
    de: { label: "noch ungefestigt, neugierig", traits: "Du bist noch nicht ganz gefestigt, fühlst dich von Neuem angezogen, und Ideen wie Stimmung wechseln schnell.", talent: "Neues ausprobieren, Blickwinkel wechseln und im Wandel ein Gefühl finden." },
    ja: { label: "まだ定まらず、新鮮さに惹かれる", traits: "まだ形が定まっておらず、目新しいものに惹かれやすく、考えや気分も移ろいやすいです。", talent: "新しいことを試し、視点を変え、変化の中で感覚をつかむこと。" },
  },
  冠带: {
    zh: { label: "重体面、按部就班", traits: "你开始在意体面和规矩，愿意把该做的步骤走完整，不太喜欢跳步。", talent: "立规矩、做流程、把台面上的事办得体面。" },
    en: { label: "presentable, orderly", traits: "You care about appearances and rules now, and prefer to complete each step properly rather than skip ahead.", talent: "Setting rules, running process, and handling things with a presentable finish." },
    es: { label: "formal y ordenado", traits: "Empiezas a cuidar la imagen y las normas, y prefieres completar cada paso sin saltarte ninguno.", talent: "Poner reglas, ordenar procesos y dejar las cosas bien presentadas." },
    fr: { label: "soigné et méthodique", traits: "Vous commencez à tenir à l’apparence et aux règles, et préférez suivre chaque étape sans sauter.", talent: "Poser des règles, structurer les processus et soigner la présentation." },
    de: { label: "auftrittsbewusst und geordnet", traits: "Du legst nun Wert auf Auftreten und Regeln und gehst lieber Schritt für Schritt, statt etwas zu überspringen.", talent: "Regeln setzen, Abläufe ordnen und Dinge ordentlich zu Ende bringen." },
    ja: { label: "体面と段取りを重んじる", traits: "見栄えや作法を気にし始め、手順を飛ばさずに一つずつ進めたいタイプです。", talent: "ルールを決め、流れを整え、表向きの物事をきちんと仕上げること。" },
  },
  临官: {
    zh: { label: "独当一面、愿意接事", traits: "你开始独立承担事情，责任心被激活，遇到任务不太会往后躲。", talent: "接手、负责、把事情从「有人带」变成「自己扛」。" },
    en: { label: "stepping up, taking charge", traits: "You’re starting to carry things on your own; responsibility kicks in and you’re less inclined to hang back from tasks.", talent: "Taking over, owning outcomes, and moving from being guided to being responsible." },
    es: { label: "asume y se hace cargo", traits: "Empiezas a cargar con las cosas por tu cuenta; la responsabilidad se activa y te echas menos atrás ante las tareas.", talent: "Asumir, responder por los resultados y pasar de que te guíen a cargar tú." },
    fr: { label: "prend ses responsabilités", traits: "Vous commencez à porter les choses seul ; la responsabilité s’active et vous reculez moins devant les tâches.", talent: "Reprendre, assumer les résultats et passer d’être guidé à être responsable." },
    de: { label: "übernimmt Verantwortung", traits: "Du fängst an, Dinge selbst zu tragen; Verantwortung wird aktiv und du weichst Aufgaben weniger aus.", talent: "Übernehmen, für Ergebnisse einstehen und vom Angeleitet-Werden zum Selbsttragen kommen." },
    ja: { label: "独り立ちし、進んで引き受ける", traits: "自分で物事を担い始め、責任感が働いて、仕事から逃げにくくなります。", talent: "引き受け、結果に責任を持ち、教わる側から担う側へ移ること。" },
  },
  帝旺: {
    zh: { label: "势头足、想主导", traits: "你正处在劲头最足的阶段，自信、外放，容易想拿主意；用力过猛时要留意。", talent: "冲高、带头、在关键场面把气势撑起来。" },
    en: { label: "peak momentum, wants to lead", traits: "You’re at your most energetic: confident, outgoing and eager to make the call — just watch for overdoing it.", talent: "Pushing for a peak, leading from the front, and holding the energy in key moments." },
    es: { label: "impulso máximo, ganas de liderar", traits: "Estás en tu momento de más energía: seguro, extrovertido y con ganas de decidir; solo cuida pasarte de fuerza.", talent: "Empujar hacia arriba, liderar desde el frente y sostener la energía en momentos clave." },
    fr: { label: "plein élan, envie de mener", traits: "Vous êtes au maximum de votre énergie : confiant, extraverti et désireux de trancher ; attention simplement à forcer.", talent: "Pousser vers le haut, mener devant et tenir l’énergie dans les moments clés." },
    de: { label: "volle Dynamik, will führen", traits: "Du hast gerade am meisten Energie: selbstbewusst, extrovertiert und entscheidungsfreudig – achte nur darauf, es nicht zu übertreiben.", talent: "Nach oben drücken, vorangehen und in Schlüsselmomenten Energie halten." },
    ja: { label: "勢いが強く、主導したい", traits: "最も勢いのある段階で、自信に満ち外向的、自分で決めたがります。力みすぎには注意が必要です。", talent: "上を目指して押し上げ、先頭に立ち、大事な場面で気勢を保つこと。" },
  },
  衰: {
    zh: { label: "放慢、守成、少冒险", traits: "你的节奏开始放慢，更愿意守住已有的东西，对冒险的兴致下降。", talent: "守成、收口、把已有资源维持住。" },
    en: { label: "slowing down, consolidating", traits: "Your pace is easing; you’d rather keep what you have than gamble, and the appetite for risk drops.", talent: "Consolidating, wrapping up, and maintaining existing resources." },
    es: { label: "baja el ritmo, consolida", traits: "Tu ritmo se frena; prefieres conservar lo que tienes antes que arriesgar, y baja el apetito de riesgo.", talent: "Consolidar, cerrar etapas y mantener los recursos que ya tienes." },
    fr: { label: "ralentit, consolide", traits: "Votre rythme baisse ; vous préférez garder ce que vous avez plutôt que risquer, et l’appétit de risque diminue.", talent: "Consolider, clôturer et maintenir les ressources existantes." },
    de: { label: "langsamer, bewahrend", traits: "Dein Tempo nimmt ab; du hältst lieber, was du hast, statt zu riskieren, und die Lust am Risiko sinkt.", talent: "Bewahren, abschließen und vorhandene Ressourcen halten." },
    ja: { label: "ペースを落とし、守りに入る", traits: "動きのテンポが落ち、新しい冒険より今あるものを守りたくなります。", talent: "現状を守り、区切りをつけ、持っている資源を維持すること。" },
  },
  病: {
    zh: { label: "气力偏弱、依赖节奏", traits: "你处在一段气力偏弱的阶段，做事更依赖自己的节奏和休整，硬撑反而不划算。", talent: "细水长流、按节奏推进、把消耗降到最低。" },
    en: { label: "lower energy, needs rhythm", traits: "You’re in a lower-energy stretch and work better with your own rhythm and rest; forcing it tends not to pay off.", talent: "Pacing yourself, advancing steadily, and keeping expenditure low." },
    es: { label: "energía baja, necesita ritmo", traits: "Estás en una etapa de menos energía y rindes mejor con tu propio ritmo y descanso; forzar no suele compensar.", talent: "Dosificar el esfuerzo, avanzar con constancia y gastar lo mínimo." },
    fr: { label: "énergie basse, besoin de rythme", traits: "Vous traversez une période de moindre énergie et fonctionnez mieux à votre rythme, avec du repos ; forcer ne paye guère.", talent: "Doser l’effort, avancer régulièrement et réduire la dépense." },
    de: { label: "wenig Energie, braucht Rhythmus", traits: "Du bist in einer Phase mit weniger Energie und arbeitest besser im eigenen Rhythmus mit Erholung; Erzwingen lohnt sich meist nicht.", talent: "Kräfte einteilen, gleichmäßig vorangehen und den Verbrauch niedrig halten." },
    ja: { label: "力が弱まり、リズムが要る", traits: "気力がやや弱まる時期で、自分のペースと休息があるほうが進めやすく、無理に押すのは得策ではありません。", talent: "力を配分し、一定のペースで進み、消耗を抑えること。" },
  },
  死: {
    zh: { label: "收尾、沉静、内省", traits: "你处在一段收尾和沉淀的阶段，话变少，更愿意向内整理，而不是向外扩张。", talent: "复盘、收尾、把经验沉淀成自己的东西。" },
    en: { label: "closing, quiet, inward", traits: "You’re in a closing and settling phase: you speak less and prefer to sort things inward rather than expand outward.", talent: "Reviewing, closing loops, and turning experience into something of your own." },
    es: { label: "cierre, calma, introspección", traits: "Estás en una fase de cierre y sedimentación: hablas menos y prefieres ordenar hacia dentro en vez de expandirte.", talent: "Revisar, cerrar ciclos y convertir la experiencia en algo propio." },
    fr: { label: "clôture, calme, intérieur", traits: "Vous êtes dans une phase de clôture et de décantation : vous parlez moins et préférez ranger à l’intérieur plutôt que vous étendre.", talent: "Faire le bilan, boucler les cycles et transformer l’expérience en acquis." },
    de: { label: "Abschluss, ruhig, nach innen", traits: "Du bist in einer Abschluss- und Klärungsphase: Du sprichst weniger und ordnest lieber nach innen, statt dich auszudehnen.", talent: "Bilanzieren, abschließen und Erfahrung in Eigenes verwandeln." },
    ja: { label: "収束、静けさ、内省", traits: "物事を収めて沈める段階で、口数が減り、外へ広げるより内側を整理したくなります。", talent: "振り返り、区切りをつけ、経験を自分のものとして蓄えること。" },
  },
  墓: {
    zh: { label: "积累、保管、偏保守", traits: "你开始把东西往库里收，重视积累和保管，行事比之前保守。", talent: "整理、存档、把资源分类收好。" },
    en: { label: "accumulating, storing, cautious", traits: "You’re putting things into storage, valuing accumulation and safekeeping, and acting more cautiously than before.", talent: "Organising, archiving, and sorting resources into their places." },
    es: { label: "acumula, guarda, prudente", traits: "Empiezas a guardar las cosas, valoras acumular y conservar, y actúas con más cautela que antes.", talent: "Ordenar, archivar y clasificar los recursos en su sitio." },
    fr: { label: "accumule, conserve, prudent", traits: "Vous rangez les choses, tenez à l’accumulation et à la conservation, et agissez plus prudemment qu’avant.", talent: "Organiser, archiver et classer les ressources à leur place." },
    de: { label: "sammelt, bewahrt, vorsichtig", traits: "Du räumst Dinge ins Lager, legst Wert auf Ansammeln und Aufbewahren und handelst vorsichtiger als zuvor.", talent: "Ordnen, archivieren und Ressourcen an ihren Platz bringen." },
    ja: { label: "蓄え、保管し、慎重に", traits: "物を蔵に収めるように、蓄えることと保管を重んじ、これまでより慎重に動きます。", talent: "整理し、保管し、資源を分類して収めること。" },
  },
  绝: {
    zh: { label: "换轨、推倒重来", traits: "你走到旧路的尽头，需要换一条轨；这阶段容易放下旧东西，也更容易从头开始。", talent: "断舍离、重启、在空地上重新搭结构。" },
    en: { label: "changing track, starting over", traits: "You’ve reached the end of an old road and need a new track; letting go comes easier, and so does starting from scratch.", talent: "Letting go, restarting, and building a new structure on open ground." },
    es: { label: "cambia de vía, empieza de nuevo", traits: "Llegaste al final de un camino y necesitas otra vía; soltar resulta más fácil, y también empezar de cero.", talent: "Soltar, reiniciar y levantar una estructura nueva sobre terreno libre." },
    fr: { label: "change de voie, repart de zéro", traits: "Vous arrivez au bout d’un ancien chemin et avez besoin d’une nouvelle voie ; lâcher prise est plus facile, comme repartir de zéro.", talent: "Lâcher, redémarrer et bâtir une nouvelle structure sur terrain libre." },
    de: { label: "Spurwechsel, Neuanfang", traits: "Du bist am Ende eines alten Weges und brauchst eine neue Spur; Loslassen fällt leichter, ebenso ein Neustart bei null.", talent: "Loslassen, neu starten und auf freiem Grund eine neue Struktur bauen." },
    ja: { label: "路線を変え、立て直す", traits: "古い道の終わりに来て、新しい路線が必要な段階です。手放すのも、ゼロから始めるのも以前より楽になります。", talent: "手放し、再出発し、更地に新しい仕組みを組むこと。" },
  },
  胎: {
    zh: { label: "未成形、可能性多", traits: "你像刚受孕的想法，可能性很多但还没定形，适合多试几种方向而不是急着定型。", talent: "孕育新想法、保留选项、把雏形养出来。" },
    en: { label: "unformed, full of possibility", traits: "You’re like an idea just conceived: many possibilities, no fixed shape yet — better to try directions than to settle too early.", talent: "Incubating ideas, keeping options open, and nurturing a rough shape." },
    es: { label: "sin formar, muchas posibilidades", traits: "Eres como una idea recién concebida: muchas posibilidades y ninguna forma fija; conviene probar direcciones antes que definirte pronto.", talent: "Incubar ideas, mantener opciones y cuidar un primer boceto." },
    fr: { label: "pas encore formé, plein de possibles", traits: "Vous êtes comme une idée à peine conçue : beaucoup de possibles, pas encore de forme fixe ; mieux vaut essayer des directions que vous figer trop tôt.", talent: "Couver des idées, garder des options et faire grandir une ébauche." },
    de: { label: "noch ungeformt, viele Möglichkeiten", traits: "Du bist wie eine frisch empfangene Idee: viele Möglichkeiten, noch keine feste Form – besser Richtungen ausprobieren, als sich zu früh festzulegen.", talent: "Ideen ausbrüten, Optionen offen halten und einen Entwurf hegen." },
    ja: { label: "まだ形にならず、可能性が多い", traits: "生まれたばかりのアイデアのように、可能性は多いものの形はまだ定まっていません。早く決めるより、いくつか試すのが向いています。", talent: "新しい考えを育て、選択肢を残し、原型を養うこと。" },
  },
  养: {
    zh: { label: "蓄力、重环境与照顾", traits: "你处在一段被养着的阶段，环境和照顾对你很重要，适合慢慢蓄力而不是急着出场。", talent: "养精蓄锐、经营环境、为下一步做准备。" },
    en: { label: "recharging, needs a good environment", traits: "You’re in a nurtured phase where environment and care matter; better to build strength slowly than to rush into the spotlight.", talent: "Recharging, shaping your environment, and preparing for the next step." },
    es: { label: "recarga, cuida el entorno", traits: "Estás en una fase de crianza: el entorno y los cuidados importan, y conviene acumular fuerza despacio en vez de lanzarte.", talent: "Recargar, cuidar el entorno y preparar el siguiente paso." },
    fr: { label: "se ressource, soigne son cadre", traits: "Vous êtes dans une phase où l’on prend soin de vous : le cadre et l’attention comptent ; mieux vaut accumuler lentement que vous précipiter.", talent: "Recharger, façonner son environnement et préparer la suite." },
    de: { label: "Kraft sammeln, Umfeld pflegen", traits: "Du bist in einer behüteten Phase: Umgebung und Zuwendung sind wichtig; besser langsam Kraft sammeln als vorschnell auftreten.", talent: "Kraft tanken, das Umfeld gestalten und den nächsten Schritt vorbereiten." },
    ja: { label: "力を蓄え、環境と気遣いを重んじる", traits: "養われる段階にあり、環境と気遣いが大切です。急に表へ出るより、ゆっくり力を蓄えるのが向いています。", talent: "英気を養い、環境を整え、次の一歩に備えること。" },
  },

  // ── 博士十二神（生年禄存起）──
  博士: {
    zh: { label: "爱钻研、先弄明白", traits: "这一标记偏向学识、文书和点子，遇事愿意先弄明白再动手。", talent: "查资料、讲清楚、把知识变成办法。" },
    en: { label: "studious, wants to understand", traits: "This marker leans toward learning, documents and ideas: it prefers to understand before acting.", talent: "Researching, explaining clearly, and turning knowledge into method." },
    es: { label: "estudioso, quiere entender", traits: "Esta marca se inclina al saber, los documentos y las ideas: prefiere entender antes de actuar.", talent: "Investigar, explicar con claridad y convertir el saber en método." },
    fr: { label: "studieux, veut comprendre", traits: "Ce marqueur penche vers le savoir, les documents et les idées : il préfère comprendre avant d’agir.", talent: "Chercher, expliquer clairement et transformer le savoir en méthode." },
    de: { label: "wissbegierig, will verstehen", traits: "Diese Markierung neigt zu Wissen, Schriftstücken und Ideen: Sie will erst verstehen, dann handeln.", talent: "Recherchieren, klar erklären und Wissen in Methode verwandeln." },
    ja: { label: "学び好きで、まず理解したい", traits: "学識・文書・アイデア寄りの印で、まず理解してから動こうとします。", talent: "調べ、わかりやすく説明し、知識を方法に変えること。" },
  },
  力士: {
    zh: { label: "肯出力、亲自动手", traits: "这一标记偏向体力与执行，肯出力，习惯亲自动手。", talent: "执行、动手、把力气用在实处。" },
    en: { label: "hands-on, hard-working", traits: "This marker leans toward strength and execution: it is willing to put in effort and prefers hands-on work.", talent: "Executing, working with your hands, and putting effort where it counts." },
    es: { label: "trabajador y práctico", traits: "Esta marca se inclina a la fuerza y la ejecución: se esfuerza y prefiere el trabajo manual.", talent: "Ejecutar, trabajar con las manos y poner el esfuerzo donde importa." },
    fr: { label: "travailleur, manuel", traits: "Ce marqueur penche vers la force et l’exécution : il est prêt à l’effort et préfère le travail manuel.", talent: "Exécuter, travailler de ses mains et mettre l’effort là où il compte." },
    de: { label: "kräftig, packt an", traits: "Diese Markierung neigt zu Kraft und Umsetzung: Sie ist einsatzbereit und arbeitet gern praktisch.", talent: "Umsetzen, selbst Hand anlegen und Kraft sinnvoll einsetzen." },
    ja: { label: "力を惜しまず、自分で動く", traits: "体力と実行寄りの印で、力を惜しまず、自分で手を動かすのを好みます。", talent: "実行し、手を動かし、力を実のあるところに使うこと。" },
  },
  青龙: {
    zh: { label: "带喜气、会暖场", traits: "这一标记偏向喜事与顺畅气氛，待人有热度，容易把场面带活。", talent: "活跃气氛、待人热络、把好事说出来。" },
    en: { label: "cheerful, warms a room", traits: "This marker leans toward festive, smooth atmosphere: it is warm with people and good at livening a room.", talent: "Livening the mood, being warm with people, and voicing good news." },
    es: { label: "alegre, anima el ambiente", traits: "Esta marca se inclina a un ambiente festivo y fluido: trata a la gente con calidez y anima la reunión.", talent: "Animar el ambiente, tratar a la gente con calidez y contar lo bueno." },
    fr: { label: "joyeux, met l’ambiance", traits: "Ce marqueur penche vers une ambiance festive et fluide : il est chaleureux et sait animer.", talent: "Animer l’ambiance, être chaleureux et annoncer les bonnes nouvelles." },
    de: { label: "fröhlich, belebt die Runde", traits: "Diese Markierung neigt zu festlicher, flüssiger Stimmung: Sie ist warmherzig und belebt eine Runde.", talent: "Stimmung beleben, warmherzig sein und Gutes aussprechen." },
    ja: { label: "明るく、場を和ませる", traits: "祝い事や和やかな空気寄りの印で、人に熱意を向け、場を活気づけるのが得意です。", talent: "場を明るくし、人に温かく接し、良いことを言葉にすること。" },
  },
  小耗: {
    zh: { label: "小处易耗", traits: "这一标记偏向小额消耗，钱或精力容易从细处慢慢流走。", talent: "看清零碎开销、把小事收口。" },
    en: { label: "small leaks", traits: "This marker points to small drains: money or energy tends to seep away in little bits.", talent: "Spotting small drains and closing the little gaps." },
    es: { label: "pequeñas fugas", traits: "Esta marca apunta a pequeños desgastes: el dinero o la energía se escapan en detalles.", talent: "Detectar pequeños desgastes y cerrar los huecos menudos." },
    fr: { label: "petites fuites", traits: "Ce marqueur indique de petites pertes : l’argent ou l’énergie s’échappent par petits bouts.", talent: "Repérer les petites pertes et boucher les menus trous." },
    de: { label: "kleine Abflüsse", traits: "Diese Markierung deutet auf kleine Verluste: Geld oder Energie sickern in kleinen Beträgen weg.", talent: "Kleine Verluste erkennen und die kleinen Lücken schließen." },
    ja: { label: "小さな漏れ", traits: "小さな消耗寄りの印で、お金や気力が細かいところから少しずつ減りやすいです。", talent: "細かい消耗に気づき、小さな穴をふさぐこと。" },
  },
  将军: {
    zh: { label: "气场强、想拍板", traits: "这一标记偏向威势与主导，遇事想拿主意，气场偏强。", talent: "压场、决断、在关键处站出来。" },
    en: { label: "commanding, decisive", traits: "This marker leans toward authority and initiative: it wants to make the call and carries a strong presence.", talent: "Holding the room, deciding, and stepping forward at key moments." },
    es: { label: "con mando y decisión", traits: "Esta marca se inclina a la autoridad y la iniciativa: quiere decidir y tiene una presencia fuerte.", talent: "Sostener el espacio, decidir y dar un paso al frente en momentos clave." },
    fr: { label: "autoritaire, décidé", traits: "Ce marqueur penche vers l’autorité et l’initiative : il veut décider et impose une présence forte.", talent: "Tenir la salle, trancher et avancer au moment clé." },
    de: { label: "dominant, entscheidungsfreudig", traits: "Diese Markierung neigt zu Autorität und Eigeninitiative: Sie will entscheiden und hat eine starke Präsenz.", talent: "Den Raum halten, entscheiden und im entscheidenden Moment vortreten." },
    ja: { label: "威があり、決めたがる", traits: "威勢と主導寄りの印で、進んで采配を振り、存在感が強めです。", talent: "場を押さえ、決断し、肝心なところで前に出ること。" },
  },
  奏书: {
    zh: { label: "会传达、善整理", traits: "这一标记偏向文书与传达，擅长整理信息、把话说明白。", talent: "写材料、传话、把复杂事说明白。" },
    en: { label: "good with documents", traits: "This marker leans toward documents and communication: it is good at organising information and making things clear.", talent: "Writing, relaying messages, and making complex things clear." },
    es: { label: "bueno con documentos", traits: "Esta marca se inclina a los documentos y la comunicación: ordena información y explica con claridad.", talent: "Redactar, transmitir mensajes y explicar lo complejo con claridad." },
    fr: { label: "à l’aise avec les écrits", traits: "Ce marqueur penche vers les documents et la communication : il organise l’information et clarifie les choses.", talent: "Rédiger, transmettre et rendre clair ce qui est complexe." },
    de: { label: "schriftgewandt", traits: "Diese Markierung neigt zu Schriftstücken und Vermittlung: Sie ordnet Informationen und schafft Klarheit.", talent: "Schreiben, weitergeben und Komplexes verständlich machen." },
    ja: { label: "文書と伝達が得意", traits: "文書と伝達寄りの印で、情報を整理し、わかりやすく伝えるのが得意です。", talent: "書くこと、伝えること、複雑なことをわかりやすく説明すること。" },
  },
  飞廉: {
    zh: { label: "反应快、话直", traits: "这一标记偏向外务与口舌，反应快、说话直，容易着急。", talent: "外联、快答、把话挑明（注意别急）。" },
    en: { label: "quick, blunt", traits: "This marker leans toward external dealings and sharp words: quick to react, blunt, and easily rushed.", talent: "Reaching out, answering fast, and saying it plainly (without rushing)." },
    es: { label: "rápido y directo", traits: "Esta marca se inclina a los tratos externos y la palabra afilada: reacción rápida, franqueza y prisa.", talent: "Contactar, responder rápido y decir las cosas claras (sin precipitarse)." },
    fr: { label: "rapide, direct", traits: "Ce marqueur penche vers les affaires extérieures et les mots tranchants : réaction rapide, franchise et précipitation.", talent: "Aller vers les autres, répondre vite et dire les choses clairement (sans se précipiter)." },
    de: { label: "schnell, direkt", traits: "Diese Markierung neigt zu Außenkontakten und scharfen Worten: schnell reagierend, direkt, leicht getrieben.", talent: "Kontakte knüpfen, schnell antworten und Klartext reden (ohne Hetze)." },
    ja: { label: "反応が速く、物言いが直い", traits: "外向きの用事と言葉寄りの印で、反応が速く、物言いが直線的で、急ぎやすいです。", talent: "外とつなぎ、素早く答え、はっきり言うこと（急ぎすぎに注意）。" },
  },
  喜神: {
    zh: { label: "爱笑、亲和", traits: "这一标记偏向喜气与亲和，人前爱笑，容易带动气氛。", talent: "拉近距离、制造轻松、把气氛抬起来。" },
    en: { label: "smiling, approachable", traits: "This marker leans toward cheer and warmth: it smiles easily in company and lifts the mood.", talent: "Closing distance, easing tension, and lifting the mood." },
    es: { label: "sonriente y cercano", traits: "Esta marca se inclina a la alegría y la cercanía: sonríe con facilidad y levanta el ánimo.", talent: "Acercar posturas, relajar y levantar el ánimo." },
    fr: { label: "souriant, accessible", traits: "Ce marqueur penche vers la joie et la chaleur : il sourit facilement et met de bonne humeur.", talent: "Rapprocher, détendre et remonter l’ambiance." },
    de: { label: "lächelnd, nahbar", traits: "Diese Markierung neigt zu Freude und Nähe: Sie lächelt leicht und hebt die Stimmung.", talent: "Nähe schaffen, entspannen und die Stimmung heben." },
    ja: { label: "よく笑い、親しみやすい", traits: "喜びと親しみ寄りの印で、人前でよく笑い、場の空気を明るくします。", talent: "距離を縮め、場をゆるめ、空気を明るくすること。" },
  },
  病符: {
    zh: { label: "状态偏慢、易拖沓", traits: "这一标记偏向拖沓与提不起劲，状态不好时节奏容易慢下来。", talent: "慢下来时按节奏走、把休整排进日程。" },
    en: { label: "slower pace, easily stalled", traits: "This marker leans toward sluggishness: when energy is low, the pace easily slows.", talent: "Keeping your own pace when energy is low and scheduling rest." },
    es: { label: "ritmo lento, se estanca", traits: "Esta marca se inclina a la dejadez: cuando baja la energía, el ritmo se frena.", talent: "Mantener tu ritmo cuando baja la energía y agendar el descanso." },
    fr: { label: "rythme lent, vite bloqué", traits: "Ce marqueur penche vers la langueur : quand l’énergie baisse, le rythme ralentit.", talent: "Garder votre rythme quand l’énergie baisse et prévoir du repos." },
    de: { label: "langsamer, leicht stockend", traits: "Diese Markierung neigt zu Trägheit: Bei wenig Energie wird das Tempo leicht langsamer.", talent: "Im eigenen Tempo bleiben, wenn die Energie sinkt, und Ruhe einplanen." },
    ja: { label: "ペースが鈍り、だれやすい", traits: "だるさ寄りの印で、調子が落ちると、どうしてもペースが鈍ります。", talent: "気力が落ちるときは自分のペースを守り、休息を予定に入れること。" },
  },
  大耗: {
    zh: { label: "投入大、花得猛", traits: "这一标记偏向大额消耗，投起来不惜力，也容易一次花掉不少。", talent: "看住大额支出、把投入分出阶段。" },
    en: { label: "big outflows", traits: "This marker points to large outflows: it invests without counting and can spend a lot at once.", talent: "Watching large expenses and splitting big investments into stages." },
    es: { label: "grandes salidas", traits: "Esta marca apunta a grandes salidas: invierte sin medir y puede gastar mucho de golpe.", talent: "Vigilar los gastos grandes y repartir las inversiones por etapas." },
    fr: { label: "grosses sorties", traits: "Ce marqueur indique de grosses sorties : il investit sans compter et peut dépenser beaucoup d’un coup.", talent: "Surveiller les grosses dépenses et étaler les investissements." },
    de: { label: "große Abflüsse", traits: "Diese Markierung deutet auf große Abflüsse: Sie setzt ohne Zögern ein und gibt leicht viel auf einmal aus.", talent: "Große Ausgaben im Blick behalten und Investitionen aufteilen." },
    ja: { label: "大きく使う", traits: "大きな消耗寄りの印で、惜しまず投入し、一度に多く使うこともあります。", talent: "大きな出費を見張り、投入を段階に分けること。" },
  },
  伏兵: {
    zh: { label: "少声张、先观察", traits: "这一标记偏向暗中蓄势，不爱声张，习惯先观察再动。", talent: "蓄势、观察、在暗处做准备。" },
    en: { label: "quiet, watchful", traits: "This marker leans toward hidden build-up: it keeps quiet and prefers to watch before moving.", talent: "Building up quietly, observing, and preparing out of sight." },
    es: { label: "callado y observador", traits: "Esta marca se inclina a la acumulación oculta: calla y prefiere observar antes de moverse.", talent: "Acumular en silencio, observar y prepararse sin ruido." },
    fr: { label: "discret, observateur", traits: "Ce marqueur penche vers une montée en puissance discrète : il reste discret et observe avant d’agir.", talent: "Accumuler en silence, observer et préparer sans bruit." },
    de: { label: "still, beobachtend", traits: "Diese Markierung neigt zu verborgenem Sammeln: Sie hält sich zurück und beobachtet erst, bevor es losgeht.", talent: "Im Verborgenen sammeln, beobachten und vorbereiten." },
    ja: { label: "声高にせず、まず観察", traits: "陰で力を蓄える寄りの印で、声高にせず、まず観察してから動きます。", talent: "静かに力を蓄え、観察し、陰で準備すること。" },
  },
  官符: {
    zh: { label: "重规矩、讲名分", traits: "这一标记偏向规矩与名分，重程序，也容易在条文上较真。", talent: "立流程、对条文、把该走的程序走全。" },
    en: { label: "procedural, status-aware", traits: "This marker leans toward rules and proper standing: it values procedure and can get hung up on the letter of the rules.", talent: "Setting process, checking the letter, and completing proper steps." },
    es: { label: "formal, atento al estatus", traits: "Esta marca se inclina a las normas y el estatus: valora el procedimiento y puede enredarse en la letra.", talent: "Fijar procesos, revisar la letra y completar los pasos debidos." },
    fr: { label: "procédurier, attentif au statut", traits: "Ce marqueur penche vers les règles et le statut : il tient à la procédure et peut se crisper sur la lettre.", talent: "Poser des procédures, vérifier la lettre et suivre les étapes requises." },
    de: { label: "regelbewusst, statusorientiert", traits: "Diese Markierung neigt zu Regeln und Ansehen: Sie legt Wert auf Verfahren und hängt sich gern an Formalien.", talent: "Verfahren setzen, den Wortlaut prüfen und nötige Schritte abschließen." },
    ja: { label: "規則と名分を重んじる", traits: "規則と名分寄りの印で、手続きを重んじ、条文にこだわりやすいです。", talent: "手順を決め、条文を確認し、必要な段取りを全部踏むこと。" },
  },

  // ── 将前十二神（三合帝旺位起）──
  将星: {
    zh: { label: "想主导、愿安排", traits: "这一标记偏向主导与统御，愿意站到前面安排事情。", talent: "带头、分工、把一盘散沙拢起来。" },
    en: { label: "leading, organising", traits: "This marker leans toward leadership: it is willing to step forward and arrange things.", talent: "Taking the lead, dividing work, and pulling loose ends together." },
    es: { label: "lidera y organiza", traits: "Esta marca se inclina al liderazgo: se pone al frente y organiza.", talent: "Encabezar, repartir tareas y reunir lo disperso." },
    fr: { label: "mène et organise", traits: "Ce marqueur penche vers la direction : il se place devant et organise.", talent: "Prendre la tête, répartir les tâches et rassembler ce qui est dispersé." },
    de: { label: "führt, ordnet", traits: "Diese Markierung neigt zu Führung: Sie tritt nach vorn und ordnet Dinge.", talent: "Vorangehen, Aufgaben verteilen und Verstreutes bündeln." },
    ja: { label: "主導し、段取りする", traits: "主導と統率寄りの印で、進んで前に立ち、物事を段取りします。", talent: "先頭に立ち、役割を分け、ばらばらなものをまとめること。" },
  },
  攀鞍: {
    zh: { label: "会借力、往上走", traits: "这一标记偏向进取与借力，懂得找台阶、跟着更强的人往上走。", talent: "找台阶、跟对人、借势往上。" },
    en: { label: "good at leverage", traits: "This marker leans toward advancement and leverage: it knows how to find a step and rise alongside stronger people.", talent: "Finding a step, choosing the right company, and rising with the momentum." },
    es: { label: "sabe apoyarse", traits: "Esta marca se inclina al ascenso y al apoyo: busca escalón y sube junto a gente más fuerte.", talent: "Buscar escalón, elegir buena compañía y subir con el impulso." },
    fr: { label: "sait s’appuyer", traits: "Ce marqueur penche vers l’ascension et l’appui : il sait trouver un marchepied et monter avec plus fort que soi.", talent: "Trouver un marchepied, bien s’entourer et monter avec l’élan." },
    de: { label: "nutzt Unterstützung", traits: "Diese Markierung neigt zu Aufstieg und Unterstützung: Sie findet eine Stufe und steigt mit Stärkeren auf.", talent: "Eine Stufe finden, sich gut umgeben und mit dem Schwung aufsteigen." },
    ja: { label: "力を借りて上を目指す", traits: "上昇と援用寄りの印で、足がかりを見つけ、強い人と一緒に上を目指します。", talent: "足がかりを見つけ、良い仲間を選び、勢いで上ること。" },
  },
  岁驿: {
    zh: { label: "待不住、常在路上", traits: "这一标记偏向走动与奔波，待不住，常在换环境或赶路。", talent: "跑动、换环境、把行程安排顺。" },
    en: { label: "restless, often on the move", traits: "This marker leans toward movement: it can’t stay put and often changes settings or travels.", talent: "Travelling, changing settings, and keeping itineraries smooth." },
    es: { label: "inquieto, siempre en marcha", traits: "Esta marca se inclina al movimiento: no se queda quieto y suele cambiar de entorno o viajar.", talent: "Viajar, cambiar de entorno y organizar los trayectos." },
    fr: { label: "agité, toujours en route", traits: "Ce marqueur penche vers le mouvement : il ne tient pas en place et change souvent de cadre ou voyage.", talent: "Voyager, changer de cadre et organiser les trajets." },
    de: { label: "unruhig, ständig unterwegs", traits: "Diese Markierung neigt zu Bewegung: Sie hält es nicht an einem Ort aus und wechselt oft Umgebung oder ist unterwegs.", talent: "Reisen, Umgebung wechseln und Wege gut planen." },
    ja: { label: "じっとせず、移動が多い", traits: "移動と奔走寄りの印で、じっとしておれず、環境を変えたり移動したりします。", talent: "動き回り、環境を変え、行程を整えること。" },
  },
  息神: {
    zh: { label: "话少、按自己节奏", traits: "这一标记偏向收束与安静，话不多，喜欢按自己的节奏来。", talent: "静下来、收束、给自己留独处时间。" },
    en: { label: "quiet, on your own pace", traits: "This marker leans toward quiet and withdrawal: it says little and follows its own pace.", talent: "Settling down, pulling inward, and keeping time alone." },
    es: { label: "callado, a su ritmo", traits: "Esta marca se inclina a la calma y el recogimiento: habla poco y sigue su propio ritmo.", talent: "Calmarse, recogerse y reservar tiempo a solas." },
    fr: { label: "discret, à son rythme", traits: "Ce marqueur penche vers le calme et le repli : il parle peu et suit son propre rythme.", talent: "Se poser, se replier et garder du temps seul." },
    de: { label: "wortkarg, eigenes Tempo", traits: "Diese Markierung neigt zu Ruhe und Rückzug: Sie sagt wenig und folgt dem eigenen Tempo.", talent: "Zur Ruhe kommen, sich sammeln und Zeit allein einplanen." },
    ja: { label: "口数が少なく、自分のペース", traits: "収束と静けさ寄りの印で、口数が少なく、自分のペースを守ります。", talent: "静まり、内に収め、一人の時間を確保すること。" },
  },
  华盖: {
    zh: { label: "爱独处、有才艺", traits: "这一标记偏向独处与才艺，有自己的精神角落，不太爱凑热闹。", talent: "钻研手艺、独立创作、守住自己的角落。" },
    en: { label: "solitary, artistic", traits: "This marker leans toward solitude and craft: it keeps a private inner corner and isn’t keen on crowds.", talent: "Deepening a craft, creating independently, and guarding your own corner." },
    es: { label: "solitario y con oficio", traits: "Esta marca se inclina a la soledad y el oficio: tiene su rincón interior y no es amiga de multitudes.", talent: "Profundizar en un oficio, crear solo y cuidar tu rincón." },
    fr: { label: "solitaire, artisan", traits: "Ce marqueur penche vers la solitude et le métier : il garde un coin intérieur et n’aime guère les foules.", talent: "Approfondir un métier, créer seul et protéger son coin." },
    de: { label: "eigenbrötlerisch, künstlerisch", traits: "Diese Markierung neigt zu Einsamkeit und Können: Sie hat eine eigene innere Ecke und mag keine Menschenmengen.", talent: "Ein Handwerk vertiefen, allein schaffen und die eigene Ecke hüten." },
    ja: { label: "独処を好み、才芸がある", traits: "孤独と才芸寄りの印で、自分の精神的な一角を持ち、賑やかさを好みません。", talent: "技を深め、一人で作り、自分の一角を守ること。" },
  },
  劫煞: {
    zh: { label: "变化多、计划易改", traits: "这一标记偏向突发与变数，常被推着改变原计划。", talent: "应变、改方案、在变数里找新路。" },
    en: { label: "prone to sudden turns", traits: "This marker leans toward sudden turns: it is often pushed to change plans.", talent: "Adapting, revising plans, and finding a new route amid change." },
    es: { label: "giros súbitos", traits: "Esta marca se inclina a los giros súbitos: a menudo se ve empujada a cambiar de plan.", talent: "Adaptarse, revisar planes y encontrar otra ruta en el cambio." },
    fr: { label: "virages soudains", traits: "Ce marqueur penche vers les tours soudains : il est souvent poussé à changer de plan.", talent: "S’adapter, réviser les plans et trouver une autre voie dans le changement." },
    de: { label: "plötzliche Wendungen", traits: "Diese Markierung neigt zu plötzlichen Wendungen: Sie wird oft gedrängt, Pläne zu ändern.", talent: "Sich anpassen, Pläne ändern und im Wandel einen neuen Weg finden." },
    ja: { label: "変化が多く、予定が変わりやすい", traits: "急変と波乱寄りの印で、予定を変えざるを得ないことが多いです。", talent: "臨機応変に対応し、案を練り直し、変化の中に新しい道を探すこと。" },
  },
  灾煞: {
    zh: { label: "冲劲足、过程有反复", traits: "这一标记偏向波折与冲劲，做事猛，但过程容易有反复。", talent: "硬推一段、也懂得在反复里调整。" },
    en: { label: "forceful, with repeats", traits: "This marker leans toward setbacks and drive: it acts forcefully, but the process tends to repeat itself.", talent: "Pushing hard for a stretch, and adjusting when things repeat." },
    es: { label: "con empuje y repeticiones", traits: "Esta marca se inclina a los contratiempos y el impulso: actúa con fuerza, pero el proceso suele repetirse.", talent: "Empujar con fuerza un tramo y ajustar cuando algo se repite." },
    fr: { label: "élan et répétitions", traits: "Ce marqueur penche vers les revers et l’élan : il agit avec force, mais le processus a tendance à se répéter.", talent: "Pousser fort un moment et ajuster quand cela se répète." },
    de: { label: "energisch, mit Wiederholungen", traits: "Diese Markierung neigt zu Rückschlägen und Antrieb: Sie handelt energisch, aber der Ablauf wiederholt sich leicht.", talent: "Eine Zeit lang hart vorangehen und bei Wiederholungen nachjustieren." },
    ja: { label: "勢いはあるが、過程が繰り返す", traits: "波乱と突進寄りの印で、勢いはありますが、過程が繰り返しになりやすいです。", talent: "一気に押し進め、繰り返しの中でも調整すること。" },
  },
  天煞: {
    zh: { label: "孤高、原则硬", traits: "这一标记偏向孤高与刚硬，原则性强，不太肯低头。", talent: "守原则、扛压力、不轻易妥协。" },
    en: { label: "aloof, principled", traits: "This marker leans toward aloofness and rigidity: strong principles, reluctant to bend.", talent: "Holding principles, bearing pressure, and not bending easily." },
    es: { label: "altivo, de principios", traits: "Esta marca se inclina a la altivez y la rigidez: principios firmes y poca disposición a ceder.", talent: "Sostener principios, aguantar presión y no ceder fácil." },
    fr: { label: "hautain, de principes", traits: "Ce marqueur penche vers la hauteur et la rigidité : principes forts, peu enclin à plier.", talent: "Tenir ses principes, supporter la pression et ne pas plier facilement." },
    de: { label: "distanziert, prinzipienstark", traits: "Diese Markierung neigt zu Distanz und Härte: starke Prinzipien, wenig bereit, sich zu beugen.", talent: "Prinzipien halten, Druck aushalten und nicht leicht nachgeben." },
    ja: { label: "孤高で、信念が硬い", traits: "孤高と硬さ寄りの印で、信念が強く、簡単には頭を下げません。", talent: "原則を守り、圧力に耐え、簡単に妥協しないこと。" },
  },
  指背: {
    zh: { label: "在意议论、易惹口舌", traits: "这一标记偏向背后议论，容易在意别人怎么说，也要留意口舌。", talent: "留意言辞、把话说到位、少留话柄。" },
    en: { label: "sensitive to talk", traits: "This marker leans toward talk behind your back: it is sensitive to what others say, and worth watching your words.", talent: "Watching your words, saying things properly, and leaving less to gossip." },
    es: { label: "sensible a las habladurías", traits: "Esta marca se inclina a las habladurías: es sensible a lo que dicen los demás y conviene cuidar las palabras.", talent: "Cuidar las palabras, decir las cosas bien y dejar menos pretextos." },
    fr: { label: "sensible aux rumeurs", traits: "Ce marqueur penche vers les rumeurs : sensible à ce que disent les autres, et mieux vaut surveiller ses mots.", talent: "Surveiller ses mots, bien formuler et laisser moins de prise." },
    de: { label: "empfindlich für Gerede", traits: "Diese Markierung neigt zu Gerede: Sie ist empfindlich dafür, was andere sagen – und besser auf die eigenen Worte achten.", talent: "Worte bedenken, klar sagen und weniger Angriffsfläche lassen." },
    ja: { label: "陰口を気にしやすい", traits: "陰口寄りの印で、人がどう言うかを気にしやすく、言葉にも注意が必要です。", talent: "言葉に気を配り、きちんと伝え、揚げ足を取られる隙を減らすこと。" },
  },
  咸池: {
    zh: { label: "重感觉、带吸引力", traits: "这一标记偏向情感与吸引力，重感觉，人缘里带点暧昧。", talent: "营造气氛、经营亲密、把握分寸。" },
    en: { label: "feeling-led, magnetic", traits: "This marker leans toward feeling and attraction: it trusts chemistry, with a hint of ambiguity in relationships.", talent: "Setting a mood, building closeness, and keeping boundaries." },
    es: { label: "se guía por la química", traits: "Esta marca se inclina al sentimiento y la atracción: se guía por la química y hay cierta ambigüedad en los vínculos.", talent: "Crear ambiente, cultivar la cercanía y cuidar los límites." },
    fr: { label: "sensible à l’alchimie", traits: "Ce marqueur penche vers le ressenti et l’attraction : il suit l’alchimie, avec une pointe d’ambiguïté dans les relations.", talent: "Créer une ambiance, cultiver la proximité et garder les limites." },
    de: { label: "gefühlsbetont, anziehend", traits: "Diese Markierung neigt zu Gefühl und Anziehung: Sie folgt der Chemie, mit einem Hauch von Mehrdeutigkeit in Beziehungen.", talent: "Stimmung schaffen, Nähe aufbauen und Grenzen wahren." },
    ja: { label: "感覚を重んじ、引力がある", traits: "感情と引力寄りの印で、相性を重んじ、人間関係に少し曖昧さが漂います。", talent: "雰囲気をつくり、親密さを育て、距離感を保つこと。" },
  },
  月煞: {
    zh: { label: "心思细、易被牵动", traits: "这一标记偏向情绪与家事，心思细，容易被身边人和事牵动。", talent: "体察情绪、照顾家事、把细节顾到。" },
    en: { label: "attentive, easily moved", traits: "This marker leans toward mood and family matters: attentive, easily moved by the people and things around.", talent: "Reading moods, handling family matters, and catching details." },
    es: { label: "atento y sensible", traits: "Esta marca se inclina al ánimo y los asuntos familiares: atenta y fácil de conmover por lo cercano.", talent: "Leer el ánimo, atender asuntos familiares y cuidar los detalles." },
    fr: { label: "attentif et sensible", traits: "Ce marqueur penche vers l’humeur et les affaires familiales : attentif, facilement touché par ce qui l’entoure.", talent: "Lire l’humeur, gérer les affaires familiales et soigner les détails." },
    de: { label: "aufmerksam, leicht bewegt", traits: "Diese Markierung neigt zu Stimmung und Familienangelegenheiten: aufmerksam und leicht von Nahem bewegt.", talent: "Stimmungen lesen, Familienangelegenheiten regeln und Details beachten." },
    ja: { label: "細やかで、揺れやすい", traits: "感情と家庭事情寄りの印で、細やかで、身近な人や出来事に揺れやすいです。", talent: "気持ちを察し、家のことを整え、細部まで気を配ること。" },
  },
  亡神: {
    zh: { label: "想得深、易丢三落四", traits: "这一标记偏向心思深沉与易失，想得多，也容易丢三落四。", talent: "深想、复盘、也提醒自己别遗漏。" },
    en: { label: "deep-thinking, forgetful", traits: "This marker leans toward deep thought and losing track: it thinks a lot, and easily mislays things.", talent: "Thinking deeply, reviewing, and reminding yourself not to leave gaps." },
    es: { label: "piensa mucho, algo despistado", traits: "Esta marca se inclina al pensamiento profundo y al despiste: piensa mucho y pierde cosas con facilidad.", talent: "Pensar a fondo, revisar y recordarte no dejar cabos sueltos." },
    fr: { label: "réfléchi, distrait", traits: "Ce marqueur penche vers la profondeur d’esprit et la distraction : il pense beaucoup et égare facilement.", talent: "Penser en profondeur, revoir et vous rappeler de ne rien oublier." },
    de: { label: "tiefdenkend, zerstreut", traits: "Diese Markierung neigt zu tiefem Denken und Verlieren: Sie denkt viel und verlegt leicht Dinge.", talent: "Tief nachdenken, überprüfen und dich erinnern, nichts zu übersehen." },
    ja: { label: "深く考え、忘れ物が多い", traits: "思索の深さと失念寄りの印で、考え込む一方、物をなくしやすいです。", talent: "深く考え、振り返り、抜けがないよう自分に言い聞かせること。" },
  },

  // ── 岁前十二神（岁建起顺行）──
  岁建: {
    zh: { label: "定调、讲名分", traits: "这一标记像一年的主位，重在定调，做事讲究名正言顺。", talent: "定方向、正名分、把一年的主线立起来。" },
    en: { label: "sets the tone", traits: "This marker is like the year’s anchor: it sets the tone and prefers things to be properly named.", talent: "Setting direction, naming things properly, and establishing the year’s main line." },
    es: { label: "marca el tono", traits: "Esta marca es como el ancla del año: marca el tono y prefiere que las cosas tengan nombre claro.", talent: "Fijar dirección, nombrar bien y establecer la línea principal del año." },
    fr: { label: "donne le ton", traits: "Ce marqueur est comme l’ancre de l’année : il donne le ton et préfère les choses clairement nommées.", talent: "Fixer la direction, bien nommer et établir la ligne principale de l’année." },
    de: { label: "gibt den Ton an", traits: "Diese Markierung ist wie der Anker des Jahres: Sie gibt den Ton an und mag klar benannte Dinge.", talent: "Richtung setzen, Dinge klar benennen und die Hauptlinie des Jahres festlegen." },
    ja: { label: "調子を定め、名分を重んじる", traits: "一年の主軸となる印で、調子を定め、筋の通った名分を重んじます。", talent: "方向を定め、名分を正し、一年の主軸を立てること。" },
  },
  晦气: {
    zh: { label: "易闷、易受阻", traits: "这一标记偏向闷与阻滞，心情容易受天气和环境拖累。", talent: "换个环境、调整心情、别硬扛低潮。" },
    en: { label: "easily dulled, blocked", traits: "This marker leans toward dullness and blockage: mood is easily dragged down by weather and surroundings.", talent: "Changing the setting, adjusting your mood, and not forcing it through a low patch." },
    es: { label: "se apaga, se bloquea", traits: "Esta marca se inclina al desánimo y el bloqueo: el ánimo se deja arrastrar por el clima y el entorno.", talent: "Cambiar de entorno, ajustar el ánimo y no forzar en un bajón." },
    fr: { label: "morose, bloqué", traits: "Ce marqueur penche vers la morosité et le blocage : l’humeur se laisse tirer par le temps et le cadre.", talent: "Changer de cadre, ajuster l’humeur et ne pas forcer dans un creux." },
    de: { label: "trüb, blockiert", traits: "Diese Markierung neigt zu Trübsinn und Blockade: Die Stimmung wird leicht von Wetter und Umgebung heruntergezogen.", talent: "Die Umgebung wechseln, die Stimmung anpassen und im Tief nicht erzwingen." },
    ja: { label: "沈みやすく、滞りやすい", traits: "沈みと停滞寄りの印で、天気や環境に気分を引っ張られやすいです。", talent: "環境を変え、気分を整え、低調なときは無理をしないこと。" },
  },
  丧门: {
    zh: { label: "易低落、重离别", traits: "这一标记偏向低落与送别，重感情，容易被离别牵动。", talent: "珍惜相聚、好好道别、给情绪留空间。" },
    en: { label: "low spirits, farewells", traits: "This marker leans toward low spirits and farewells: it is emotional and easily moved by partings.", talent: "Valuing time together, parting well, and giving feelings room." },
    es: { label: "ánimo bajo, despedidas", traits: "Esta marca se inclina al decaimiento y las despedidas: emotiva y fácil de conmover por las separaciones.", talent: "Valorar los encuentros, despedirse bien y dar espacio a las emociones." },
    fr: { label: "vague à l’âme, adieux", traits: "Ce marqueur penche vers le vague à l’âme et les adieux : émotif et facilement touché par les séparations.", talent: "Tenir aux rencontres, bien se séparer et laisser de la place aux émotions." },
    de: { label: "gedrückt, Abschiede", traits: "Diese Markierung neigt zu Niedergeschlagenheit und Abschied: gefühlsbetont und leicht von Trennungen bewegt.", talent: "Zusammenkünfte schätzen, sich gut verabschieden und Gefühlen Raum geben." },
    ja: { label: "落ち込みやすく、別れを重んじる", traits: "落ち込みと別れ寄りの印で、情に厚く、別れに揺れやすいです。", talent: "集いを大切にし、きちんと別れ、感情に余白を残すこと。" },
  },
  贯索: {
    zh: { label: "事情易缠、需耐心", traits: "这一标记偏向牵连与缠绕，事情容易一件套一件，需要耐心理线。", talent: "理线、拆事、一件一件解开。" },
    en: { label: "easily entangled", traits: "This marker leans toward entanglement: matters tend to chain together, needing patience to untangle.", talent: "Untangling, breaking things down, and solving one strand at a time." },
    es: { label: "se enreda", traits: "Esta marca se inclina al enredo: los asuntos se encadenan y piden paciencia para desenredarlos.", talent: "Desenredar, dividir y resolver hilo por hilo." },
    fr: { label: "s’enchevêtre", traits: "Ce marqueur penche vers l’enchevêtrement : les affaires s’enchaînent et demandent de la patience à démêler.", talent: "Démêler, décomposer et résoudre fil par fil." },
    de: { label: "verstrickt sich", traits: "Diese Markierung neigt zu Verstrickung: Dinge hängen sich aneinander und brauchen Geduld zum Entwirren.", talent: "Entwirren, aufteilen und Faden für Faden lösen." },
    ja: { label: "絡まりやすく、根気が要る", traits: "絡まり寄りの印で、物事が次々つながり、ほどくには根気が要ります。", talent: "糸をほどき、物事を分け、一つずつ解くこと。" },
  },
  岁破: {
    zh: { label: "敢破旧、易顶牛", traits: "这一标记偏向破局与冲撞，敢破旧，也容易与人顶牛。", talent: "打破旧局、也把冲突谈成方案。" },
    en: { label: "breaks old ground", traits: "This marker leans toward breaking patterns and friction: it dares to break the old, but easily locks horns.", talent: "Breaking old patterns and turning clashes into proposals." },
    es: { label: "rompe lo viejo", traits: "Esta marca se inclina a romper esquemas y al choque: se atreve a romper lo viejo, pero topa con facilidad.", talent: "Romper esquemas y convertir el choque en propuesta." },
    fr: { label: "rompt l’ancien", traits: "Ce marqueur penche vers la rupture et le choc : il ose briser l’ancien, mais se heurte facilement.", talent: "Briser les anciens schémas et transformer le choc en proposition." },
    de: { label: "bricht Altes", traits: "Diese Markierung neigt zu Aufbruch und Reibung: Sie traut sich, Altes zu brechen, stößt aber leicht an.", talent: "Alte Muster brechen und Konflikte in Vorschläge verwandeln." },
    ja: { label: "古いものを壊し、ぶつかりやすい", traits: "破局と衝突寄りの印で、古いものを壊す勇気がある一方、ぶつかりやすいです。", talent: "旧弊を破り、衝突を案に変えること。" },
  },
  龙德: {
    zh: { label: "有转圜、常遇台阶", traits: "这一标记偏向贵气与转圜，关键处常有人递台阶。", talent: "找贵人、留余地、在关键处接住机会。" },
    en: { label: "finds a way through", traits: "This marker leans toward grace and turning points: someone often offers a step at the crucial moment.", talent: "Finding support, leaving room, and catching the opening at the key moment." },
    es: { label: "encuentra salida", traits: "Esta marca se inclina a la gracia y los giros: a menudo alguien ofrece una salida en el momento clave.", talent: "Encontrar apoyo, dejar margen y aprovechar la apertura en el momento clave." },
    fr: { label: "trouve une issue", traits: "Ce marqueur penche vers la grâce et les tournants : quelqu’un offre souvent une issue au moment clé.", talent: "Trouver de l’appui, laisser une marge et saisir l’ouverture au bon moment." },
    de: { label: "findet einen Ausweg", traits: "Diese Markierung neigt zu Gunst und Wendung: Im entscheidenden Moment bietet oft jemand eine Stufe an.", talent: "Unterstützung finden, Raum lassen und im richtigen Moment die Öffnung nutzen." },
    ja: { label: "転機があり、逃げ道がある", traits: "貴と転機寄りの印で、肝心なところで人が逃げ道を用意してくれます。", talent: "支えを見つけ、余白を残し、肝心なところで好機をつかむこと。" },
  },
  白虎: {
    zh: { label: "脾气直、遇不公易硬碰", traits: "这一标记偏向强硬与冲突，脾气直，遇到不公容易硬碰。", talent: "据理力争、也懂得把火气转成行动。" },
    en: { label: "blunt, quick to confront", traits: "This marker leans toward toughness and conflict: a blunt temper, quick to push back against unfairness.", talent: "Standing up for what’s fair and turning anger into action." },
    es: { label: "directo, confronta", traits: "Esta marca se inclina a la dureza y el conflicto: genio directo y rápido para enfrentar la injusticia.", talent: "Defender lo justo y convertir el enfado en acción." },
    fr: { label: "direct, prompt au conflit", traits: "Ce marqueur penche vers la dureté et le conflit : tempérament direct, prompt à s’opposer à l’injustice.", talent: "Défendre le juste et transformer la colère en action." },
    de: { label: "direkt, konfrontativ", traits: "Diese Markierung neigt zu Härte und Konflikt: direktes Temperament, schnell gegen Ungerechtigkeit.", talent: "Für Fairness einstehen und Wut in Handlung umsetzen." },
    ja: { label: "気性が直く、不公平に立ち向かう", traits: "強硬と衝突寄りの印で、気性が直線的で、不公平にはすぐ立ち向かいます。", talent: "筋を通し、怒りを行動に変えること。" },
  },
  天德: {
    zh: { label: "宽厚、易被体谅", traits: "这一标记偏向宽厚与化解，待人留余地，也容易被人体谅。", talent: "待人留余地、化解矛盾、把话说软。" },
    en: { label: "generous, forgiving", traits: "This marker leans toward generosity and resolution: it leaves people room and is often given the benefit of the doubt.", talent: "Leaving people room, defusing friction, and softening your words." },
    es: { label: "generoso, comprensivo", traits: "Esta marca se inclina a la generosidad y la resolución: deja espacio y suele recibir comprensión.", talent: "Dejar espacio, desactivar roces y suavizar las palabras." },
    fr: { label: "généreux, conciliant", traits: "Ce marqueur penche vers la générosité et l’apaisement : il laisse de la place et est souvent compris.", talent: "Laisser de la place, désamorcer les frictions et adoucir les mots." },
    de: { label: "großzügig, versöhnlich", traits: "Diese Markierung neigt zu Großzügigkeit und Ausgleich: Sie lässt Raum und wird oft nachsichtig behandelt.", talent: "Raum lassen, Reibung entschärfen und Worte sanfter wählen." },
    ja: { label: "寛厚で、理解されやすい", traits: "寛厚と化解寄りの印で、人に余地を残し、周りからも理解されやすいです。", talent: "人に余地を残し、摩擦をほどき、言葉を柔らかくすること。" },
  },
  吊客: {
    zh: { label: "重人情、常为他人跑", traits: "这一标记偏向探望与牵挂，重人情，常为别人的事跑动。", talent: "探望、牵挂、把人情的线维系住。" },
    en: { label: "caring, often running for others", traits: "This marker leans toward visiting and caring: it values ties and often runs around for others.", talent: "Visiting, keeping people in mind, and maintaining the threads of connection." },
    es: { label: "cuida y se mueve por otros", traits: "Esta marca se inclina a las visitas y el cuidado: valora los lazos y suele moverse por los demás.", talent: "Visitar, tener presentes a los demás y mantener los lazos." },
    fr: { label: "attentionné, se déplace pour autrui", traits: "Ce marqueur penche vers les visites et le souci des autres : il tient aux liens et se déplace souvent pour autrui.", talent: "Rendre visite, garder les autres en tête et entretenir les liens." },
    de: { label: "anteilnehmend, für andere unterwegs", traits: "Diese Markierung neigt zu Besuchen und Anteilnahme: Sie schätzt Bindungen und ist oft für andere unterwegs.", talent: "Besuchen, andere im Blick behalten und Verbindungen pflegen." },
    ja: { label: "人情を重んじ、人のために動く", traits: "見舞いと気遣い寄りの印で、人情を重んじ、人のために動き回ります。", talent: "見舞い、気にかけ、人と人との縁をつなぐこと。" },
  },
};

/** 查十二神白话；未收录返回 null。全部为三字段。 */
export function plainShierShen(name: string, lang: Lang): StarPlainEntry | null {
  return SHIER_SHEN_PLAIN[name]?.[lang] ?? null;
}

/**
 * 流曜：只在大限 / 流年等运限层出现，不是本命星。
 * 文案按「这一层运限的阶段性标记」写，只讲倾向与用法，不预测具体事件、不判吉凶。
 * 本批收 17 条：流四化 4 + 流六煞 6 + 流马 / 流鸾 / 流喜 + 流魁 / 流钺 / 流昌 / 流曲。
 */
const LIU_STARS: Record<string, Record<Lang, string>> = {
  流禄: {
    zh: "偏向资源与实惠的标记，适合把已有的东西盘活、用在实处。",
    en: "a marker leaning toward resources and practical gain: good for putting what you already have to work.",
    es: "una marca inclinada a los recursos y la ganancia práctica: buena para poner en uso lo que ya tienes.",
    fr: "un marqueur orienté vers les ressources et le gain concret : bon pour mettre à profit ce que vous avez déjà.",
    de: "eine Markierung in Richtung Ressourcen und praktischem Gewinn: gut geeignet, Vorhandenes nutzbar zu machen.",
    ja: "資源と実利寄りの印。すでにあるものを活かして使うのに向いています。",
  },
  流权: {
    zh: "偏向掌控与话语权的标记，容易想拍板，也容易把事揽到自己身上。",
    en: "a marker leaning toward control and say: easy to want to make the call, and easy to take too much on.",
    es: "una marca inclinada al control y la voz: fácil querer decidir y fácil cargar con demasiado.",
    fr: "un marqueur orienté vers le contrôle et la parole : facile de vouloir trancher, et facile d’en prendre trop sur soi.",
    de: "eine Markierung in Richtung Kontrolle und Mitsprache: leicht, entscheiden zu wollen, und leicht, zu viel auf sich zu nehmen.",
    ja: "主導権と発言力寄りの印。自分で決めたくなりやすく、抱え込みやすいです。",
  },
  流科: {
    zh: "偏向名声、文书与被认可的标记，适合把成果摆到台面上。",
    en: "a marker leaning toward reputation, documents and recognition: good for putting results on the table.",
    es: "una marca inclinada a la reputación, los documentos y el reconocimiento: buena para mostrar resultados.",
    fr: "un marqueur orienté vers la réputation, les documents et la reconnaissance : bon pour exposer des résultats.",
    de: "eine Markierung in Richtung Ansehen, Schriftstücke und Anerkennung: gut geeignet, Ergebnisse sichtbar zu machen.",
    ja: "名声・文書・評価寄りの印。成果を表に出すのに向いています。",
  },
  流忌: {
    zh: "偏向执念与卡点的标记，容易在一件事上反复用力，宜给自己留退路。",
    en: "a marker leaning toward fixation and sticking points: easy to keep pushing at one thing, so leave yourself a way out.",
    es: "una marca inclinada a la obsesión y los puntos trabados: fácil insistir en una sola cosa, así que déjate una salida.",
    fr: "un marqueur orienté vers la fixation et les points bloqués : facile de s’acharner sur une chose, alors gardez-vous une porte de sortie.",
    de: "eine Markierung in Richtung Fixierung und Hängepunkte: leicht, an einer Sache festzuhalten – lass dir einen Ausweg.",
    ja: "執着と引っかかり寄りの印。一つのことに力を注ぎ続けやすいので、逃げ道を残しておくと楽です。",
  },
  流羊: {
    zh: "偏向冲劲与摩擦的标记，行动快，也容易与人硬碰，宜把力气用在正事上。",
    en: "a marker leaning toward drive and friction: fast to act, easy to clash, so aim the force at the real task.",
    es: "una marca inclinada al impulso y la fricción: rápido para actuar y fácil de chocar; dirige la fuerza a lo importante.",
    fr: "un marqueur orienté vers l’élan et la friction : vite en action, facile à heurter ; visez la vraie tâche.",
    de: "eine Markierung in Richtung Antrieb und Reibung: schnell im Handeln, leicht im Konflikt – richte die Kraft aufs Wesentliche.",
    ja: "突進と摩擦寄りの印。動きは速くぶつかりやすいので、力を本題に向けるとよいです。",
  },
  流陀: {
    zh: "偏向拖延与绕圈的标记，事情容易拉长，耐心比速度更管用。",
    en: "a marker leaning toward delay and circling: things stretch out, and patience works better than speed.",
    es: "una marca inclinada a la demora y las vueltas: las cosas se alargan y la paciencia rinde más que la prisa.",
    fr: "un marqueur orienté vers le retard et les détours : les choses s’étirent, et la patience vaut mieux que la vitesse.",
    de: "eine Markierung in Richtung Verzögerung und Kreisen: Dinge ziehen sich, und Geduld hilft mehr als Tempo.",
    ja: "遅れと堂々巡り寄りの印。物事が長引きやすく、速さより根気が効きます。",
  },
  流火: {
    zh: "偏向急性与爆发的标记，起得快也退得快，宜先缓一拍再动手。",
    en: "a marker leaning toward sudden heat: quick to start and quick to fade, so pause a beat before acting.",
    es: "una marca inclinada al arrebato: rápido para empezar y para apagarse; espera un momento antes de actuar.",
    fr: "un marqueur orienté vers l’embrasement : vite parti, vite retombé ; marquez une pause avant d’agir.",
    de: "eine Markierung in Richtung plötzlicher Hitze: schnell entfacht, schnell verflogen – kurz innehalten, bevor du handelst.",
    ja: "急な熱発寄りの印。始まりも冷めも早いので、一拍置いてから動くとよいです。",
  },
  流铃: {
    zh: "偏向闷压与积攒的标记，表面平静、内里绷得紧，宜找出口释放。",
    en: "a marker leaning toward held-in pressure: calm outside, tight inside, so find a release valve.",
    es: "una marca inclinada a la presión contenida: calma por fuera, tensa por dentro; busca una válvula de salida.",
    fr: "un marqueur orienté vers la pression retenue : calme dehors, tendu dedans ; trouvez une soupape.",
    de: "eine Markierung in Richtung aufgestautem Druck: außen ruhig, innen angespannt – such dir ein Ventil.",
    ja: "内にこもる圧寄りの印。外は平静でも内側は張りつめやすいので、発散口を用意するとよいです。",
  },
  流空: {
    zh: "偏向落空与转向的标记，计划容易变，宜留备选、别把话说满。",
    en: "a marker leaning toward plans coming loose: keep alternatives and don’t promise more than you can hold.",
    es: "una marca inclinada a que los planes se aflojen: mantén alternativas y no prometas más de lo que puedes sostener.",
    fr: "un marqueur orienté vers des plans qui se desserrent : gardez des alternatives et ne promettez pas plus que de raison.",
    de: "eine Markierung in Richtung lockerer Pläne: halte Alternativen bereit und versprich nicht mehr, als du halten kannst.",
    ja: "計画がほどけやすい印。代替案を残し、言い切らないほうが安全です。",
  },
  流劫: {
    zh: "偏向得失起伏的标记，容易破旧立新，也容易推倒重来，宜先算底线。",
    en: "a marker leaning toward swings in gain and loss: easy to break the old and start over, so check your bottom line first.",
    es: "una marca inclinada a los altibajos de pérdidas y ganancias: fácil romper lo viejo y empezar de nuevo; revisa primero tu límite.",
    fr: "un marqueur orienté vers les variations de gain et de perte : facile de casser l’ancien et de repartir ; vérifiez d’abord votre limite.",
    de: "eine Markierung in Richtung Schwankungen bei Gewinn und Verlust: leicht, Altes zu brechen und neu zu starten – prüfe zuerst deine Untergrenze.",
    ja: "損得の振れ幅寄りの印。古いものを壊してやり直しやすいので、まず下限を確認するとよいです。",
  },
  流马: {
    zh: "偏向走动与奔波的标记，换环境、跑动的节奏变多，宜把行程留松。",
    en: "a marker leaning toward movement: more changes of scene and running about, so keep the schedule loose.",
    es: "una marca inclinada al movimiento: más cambios de escenario y traslados; deja el horario holgado.",
    fr: "un marqueur orienté vers le mouvement : plus de changements de cadre et de déplacements ; gardez un emploi du temps souple.",
    de: "eine Markierung in Richtung Bewegung: mehr Ortswechsel und Unterwegssein – halte den Zeitplan locker.",
    ja: "移動寄りの印。環境の変化や走り回る用事が増えやすいので、予定に余白を残すとよいです。",
  },
  流鸾: {
    zh: "偏向感情与缘分的标记，容易被人注意到你的在意，宜把分寸拿稳。",
    en: "a marker leaning toward romance and connection: your attachments are easier to notice, so keep your sense of proportion.",
    es: "una marca inclinada al romance y los vínculos: se nota más a quién quieres; cuida las proporciones.",
    fr: "un marqueur orienté vers le romantisme et les liens : on voit plus facilement à qui vous tenez ; gardez la mesure.",
    de: "eine Markierung in Richtung Romantik und Bindung: man erkennt leichter, an wem dir liegt – wahre das Maß.",
    ja: "恋愛と縁寄りの印。大切にしている人が伝わりやすいので、程よい距離感を保つとよいです。",
  },
  流喜: {
    zh: "偏向喜气与人情的标记，聚会和庆祝的场合变多，宜享受也别透支。",
    en: "a marker leaning toward cheer and social occasions: more gatherings and celebrations, so enjoy without overspending yourself.",
    es: "una marca inclinada a la alegría y los encuentros: más reuniones y celebraciones; disfruta sin desgastarte.",
    fr: "un marqueur orienté vers la joie et les occasions sociales : plus de retrouvailles et de fêtes ; profitez sans vous épuiser.",
    de: "eine Markierung in Richtung Freude und Anlässe: mehr Treffen und Feste – genieße, ohne dich zu verausgaben.",
    ja: "喜びと集まり寄りの印。集まりや祝いの場が増えやすいので、楽しみつつ使い切らないように。",
  },
  流魁: {
    zh: "偏向有人搭把手、被注意到的标记，容易发现愿意帮你的人，宜主动开口。",
    en: "a marker leaning toward a helping hand and being noticed: good at spotting people willing to support you, so speak up first.",
    es: "una marca inclinada a la ayuda y a ser tenido en cuenta: buena para detectar a quien quiere apoyarte, así que da el primer paso.",
    fr: "un marqueur orienté vers l’appui et la reconnaissance : bon pour repérer qui souhaite vous soutenir, alors faites le premier pas.",
    de: "eine Markierung in Richtung Unterstützung und Beachtung: gut darin, Menschen zu erkennen, die dich stützen wollen – sprich sie zuerst an.",
    ja: "援助と注目寄りの印。支えてくれそうな人に気づきやすいので、自分から声をかけるとよいです。",
  },
  流钺: {
    zh: "偏向被引荐与获得支持的标记，机会常从人际里来，宜把关系维护在日常。",
    en: "a marker leaning toward introductions and support: openings tend to come through people, so tend your relationships day to day.",
    es: "una marca inclinada a las presentaciones y el respaldo: las oportunidades suelen llegar por la gente, así que cuida los vínculos a diario.",
    fr: "un marqueur orienté vers les présentations et le soutien : les occasions viennent souvent des gens, alors entretenez vos liens au quotidien.",
    de: "eine Markierung in Richtung Empfehlung und Rückhalt: Gelegenheiten kommen oft über Menschen – pflege die Beziehungen im Alltag.",
    ja: "紹介と後押し寄りの印。機会は人づてに来やすいので、日ごろから関係を手入れするとよいです。",
  },
  流昌: {
    zh: "偏向考试、文书与表达的标记，适合把想法写下来、把材料理清楚。",
    en: "a marker leaning toward exams, documents and expression: good for writing ideas down and getting materials in order.",
    es: "una marca inclinada a los exámenes, los documentos y la expresión: buena para poner ideas por escrito y ordenar materiales.",
    fr: "un marqueur orienté vers les examens, les documents et l’expression : bon pour coucher les idées et ordonner les supports.",
    de: "eine Markierung in Richtung Prüfungen, Schriftstücke und Ausdruck: gut geeignet, Ideen aufzuschreiben und Unterlagen zu ordnen.",
    ja: "試験・文書・表現寄りの印。考えを書き留め、資料を整理するのに向いています。",
  },
  流曲: {
    zh: "偏向才艺、口才与灵感的标记，适合用作品或表达打开局面。",
    en: "a marker leaning toward craft, speech and inspiration: good for opening doors with work or words.",
    es: "una marca inclinada al oficio, la palabra y la inspiración: buena para abrir camino con obra o palabra.",
    fr: "un marqueur orienté vers le métier, la parole et l’inspiration : bon pour ouvrir des portes par l’œuvre ou la parole.",
    de: "eine Markierung in Richtung Können, Rede und Inspiration: gut geeignet, mit Werk oder Wort Türen zu öffnen.",
    ja: "才芸・話術・ひらめき寄りの印。作品や言葉で局面を開くのに向いています。",
  },
};

/** 查流曜白话；未收录返回 null。 */
export function plainLiu(name: string, lang: Lang): string | null {
  return LIU_STARS[name]?.[lang] ?? null;
}

/** 命宫无主星时的中性兜底说法：不引入引擎未给出的星曜。 */
export const NO_MAJOR: Record<Lang, StarPlainEntry> = {
  zh: {
    label: "不被单一标签定义",
    traits: "你这一宫没有落主星。传统上把这类人看作可塑性更强——不太会被一种说法框住，反而更像你接触什么、就长成什么。",
    talent: "适应不同环境、不把自己局限在一种角色里。",
  },
  en: {
    label: "hard to pin down",
    traits: "No major star falls in this palace. Traditionally this is read as flexibility — you’re not easily boxed into one label, and you tend to grow into whatever you’re exposed to.",
    talent: "Adapting to new settings and refusing to be one thing.",
  },
  es: {
    label: "difícil de encasillar",
    traits: "Ninguna estrella principal cae en esta casa. Tradicionalmente se lee como mayor plasticidad: no te dejas encerrar en una sola etiqueta, sino que más bien te moldeas con lo que te rodea.",
    talent: "Adaptarte a entornos distintos y no limitarte a un solo papel.",
  },
  fr: {
    label: "difficile à cerner",
    traits: "Aucune étoile principale ne tombe dans cette maison. Traditionnellement, on y voit une plus grande plasticité : on ne vous enferme pas facilement dans une étiquette, vous grandissez plutôt avec ce qui vous entoure.",
    talent: "Vous adapter à des environnements différents et refuser de vous limiter à un seul rôle.",
  },
  de: {
    label: "schwer festzulegen",
    traits: "In diesem Palast fällt kein Hauptstern. Traditionell wird das als größere Formbarkeit gedeutet – du lässt dich nicht leicht in eine Schublade stecken, sondern wirst eher zu dem, dem du ausgesetzt bist.",
    talent: "Sich an neue Umgebungen anpassen und sich nicht auf eine Rolle festlegen.",
  },
  ja: {
    label: "一つのレッテルで括れない",
    traits: "この宮には主星がありません。伝統的には、それだけ可塑性が高いと見なします——一つの決めつけに縛られることなく、接したものから自らを形作っていくタイプです。",
    talent: "さまざまな環境に適応し、自分を一つの役割に限定しないこと。",
  },
};

type PatternTemplates = {
  none: string;
  high2: string; high2Caut: string;
  high1: string; high1Caut: string;
  caut2: string;
  plain: string;
};

const PATTERN_TEMPLATES: Record<Lang, PatternTemplates> = {
  zh: {
    none: "这张盘没有特别突出的固定组合，属于比较均衡、按自己节奏走的类型。",
    high2: "几个比较好的组合叠在一起，传统上认为这张盘的底子不错、助力也多。",
    high2Caut: " 同时也带着一些需要注意的地方，算是优势和后顾之忧并存。",
    high1: "命中了一个比较受认可的组合，说明这张盘在某一方面有自己的长处。",
    high1Caut: " 同时也伴着一些提醒，别只看好的那一面。",
    caut2: "传统上标出了几处需要留意的地方，意思是这些方面更容易有摩擦，不是好坏的定论。",
    plain: "整体组合比较平常，谈不上特别突出，也没有明显的短板——平平稳稳的一种。",
  },
  en: {
    none: "No standout fixed combination here — a fairly balanced chart that runs at its own pace.",
    high2: "Several favourable combinations stack up; traditionally this is read as a solid foundation with plenty of support.",
    high2Caut: " There are also a few things to watch — strengths and worries side by side.",
    high1: "One well-regarded combination stands out, suggesting a real strength in one area.",
    high1Caut: " A few cautions come with it, so don’t look only at the bright side.",
    caut2: "A few areas are traditionally flagged as more friction-prone — a heads-up, not a verdict on your worth.",
    plain: "The overall combination is unremarkable — neither standout nor obviously weak. Steady is the word.",
  },
  es: {
    none: "En esta carta no hay ninguna combinación fija destacada; es un tipo bastante equilibrado que sigue su propio ritmo.",
    high2: "Varias combinaciones favorables se superponen; tradicionalmente esto se lee como una base sólida con mucho apoyo.",
    high2Caut: " Además hay algunos puntos a vigilar: ventajas y preocupaciones conviven.",
    high1: "Una combinación bien considerada destaca, lo que sugiere una fuerza real en algún ámbito.",
    high1Caut: " Lleva también algunas advertencias, así que no te fijes solo en el lado bueno.",
    caut2: "Tradicionalmente se marcan varios puntos a los que estar atento: significa que en esos ámbitos es más fácil haber fricciones, no un juicio sobre tu valor.",
    plain: "La combinación general es común: no destaca especialmente, pero tampoco tiene debilidades evidentes. Es un tipo tranquilo y estable.",
  },
  fr: {
    none: "Aucune combinaison fixe ne ressort ici — un thème assez équilibré qui va à son propre rythme.",
    high2: "Plusieurs combinaisons favorables s’empilent ; traditionnellement, on y voit une base solide avec beaucoup de soutien.",
    high2Caut: " Il y a aussi quelques points à surveiller : atouts et inquiétudes côte à côte.",
    high1: "Une combinaison réputée se détache, ce qui suggère une vraie force dans un domaine.",
    high1Caut: " Quelques mises en garde l’accompagnent, donc ne regardez pas seulement le bon côté.",
    caut2: "Traditionnellement, plusieurs zones sont signalées comme plus exposées aux frictions : ce n’est pas un jugement sur votre valeur.",
    plain: "La combinaison générale est ordinaire : elle ne ressort pas particulièrement, sans faiblesse évidente non plus. Un profil stable et paisible.",
  },
  de: {
    none: "Keine auffällige feste Kombination – ein relativ ausgewogenes Horoskop, das in seinem eigenen Tempo läuft.",
    high2: "Mehrere günstige Kombinationen überlagern sich; traditionell wird das als solide Grundlage mit viel Unterstützung gelesen.",
    high2Caut: " Zudem gibt es einiges zu beachten – Stärken und Sorgen nebeneinander.",
    high1: "Eine anerkannte Kombination hebt sich hervor und deutet auf eine echte Stärke in einem Bereich hin.",
    high1Caut: " Einige Warnungen kommen dazu, also schau nicht nur auf die gute Seite.",
    caut2: "Traditionell werden einige Bereiche als reibungsträchtiger markiert – das ist ein Hinweis, kein Urteil über deinen Wert.",
    plain: "Die Gesamtkombination ist unauffällig – weder besonders herausragend noch offensichtlich schwach. Ein ruhiger, stabiler Typ.",
  },
  ja: {
    none: "この命盤には特に目立つ固定の組み合わせはなく、比較的バランスが取れ、自分のペースで進むタイプです。",
    high2: "いくつかの良い組み合わせが重なっており、伝統的にはこの命盤の素地が良く、助力も多いと見なします。",
    high2Caut: " 同時に気をつけるべき点もあり、強みと懸念が共存しています。",
    high1: "一つ、評価される組み合わせに恵まれており、この命盤にはある面で独自の長所があることを示します。",
    high1Caut: " 同時にいくつかの注意点も伴うので、良い面だけを見ないようにしましょう。",
    caut2: "伝統的にいくつか気をつけるべき箇所が指摘されますが、それはそれらの面で摩擦が生じやすいということで、あなたの価値を否定するものではありません。",
    plain: "全体の組み合わせはごく普通で、特に目立つ長所もなければ、明らかな短所もない——穏やかで安定したタイプです。",
  },
};

/**
 * 把格局识别结果翻成大白话。只按命中的数量和整体倾向说话，
 * 刻意不列出格局名、不引用任何古籍或讲义原文（那些内容不在本项目的商用授权内）。
 * 返回目标语言的单段文字。
 */
export function patternLevelPlain(high: number, caution: number, total: number, lang: Lang): string {
  const tpl = PATTERN_TEMPLATES[lang];
  if (total === 0) return tpl.none;
  if (high >= 2) return tpl.high2 + (caution ? tpl.high2Caut : "");
  if (high === 1) return tpl.high1 + (caution ? tpl.high1Caut : "");
  if (caution >= 2) return tpl.caut2;
  return tpl.plain;
}
