import type { Lang } from '@/lib/i18n';

/** 上线前请替换：隐私/支持联系邮箱、运营主体名称、生效日期。 */
export const LEGAL_CONTACT_EMAIL = 'ziwei-insight@outlook.com';
export const LEGAL_ENTITY = 'Zi Wei Insight';
export const LEGAL_EFFECTIVE_DATE: Record<Lang, string> = {
  zh: '2026 年 11 月 17 日',
  en: 'November 17, 2026',
  es: '17 de noviembre de 2026',
  fr: '17 novembre 2026',
  de: '17. November 2026',
  ja: '2026年11月17日',
};

type Block =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[] };

type Section = { id: string; title: string; blocks: Block[] };

const content: Record<Lang, { title: string; intro: string; sections: Section[] }> = {
  zh: {
    title: '法律与隐私',
    intro: '本页说明我们如何收集、使用与保护你的数据，以及使用本服务需要了解的规则。若你有疑问，请联系 ' + LEGAL_CONTACT_EMAIL + '。',
    sections: [
      {
        id: 'privacy',
        title: '隐私政策',
        blocks: [
          { kind: 'h', text: '我们收集什么' },
          { kind: 'p', text: '为了提供解读服务，我们会收集你主动填写的出生资料（出生日期、时间、地点、时区与性别）、你选择的出生档案，以及账户信息（邮箱或手机号）。支付由第三方支付机构处理，我们不会接触你的完整银行卡信息。' },
          { kind: 'h', text: '我们如何使用' },
          { kind: 'list', items: [
            '根据你的出生资料排盘并生成解读报告；',
            '管理你的账户、免费额度与已购报告；',
            '保障服务安全，识别并拦截滥用行为。',
          ] },
          { kind: 'h', text: '第三方服务' },
          { kind: 'p', text: '我们使用 Supabase 存储账户与报告数据，使用 AI 服务生成解读文字，使用 Dodo Payments 作为 Merchant of Record 处理支付，使用邮件服务发送验证邮件。发送给 AI 的仅为排盘得出的命盘事实，不含你的姓名或联系方式。' },
          { kind: 'h', text: '你的权利与数据删除' },
          { kind: 'p', text: '你可以在「我的账户」中删除任意报告，或删除整个账户及其关联数据。根据适用的数据保护法（包括欧盟 GDPR），你有权访问、更正或请求删除你的个人数据。如需协助，请发送邮件至 ' + LEGAL_CONTACT_EMAIL + '。' },
          { kind: 'h', text: '保留期限' },
          { kind: 'p', text: '你的数据会在账户存续期间保留；账户删除后，关联的个人数据将被删除或匿名化，法律要求保留的记录除外。' },
          { kind: 'h', text: 'Cookie' },
          { kind: 'p', text: '我们仅使用维持登录会话与记住语言偏好所必需的技术性存储，不投放广告追踪。' },
        ],
      },
      {
        id: 'terms',
        title: '服务条款',
        blocks: [
          { kind: 'h', text: '服务性质' },
          { kind: 'p', text: '本服务基于传统紫微斗数，提供性格参考与文化研究内容。它不预测未来、不作诊断，也不构成医疗、法律、财务或人生决策建议。' },
          { kind: 'h', text: '账户与额度' },
          { kind: 'p', text: '注册后你将获得一次免费基础解读。你可以保存多份出生档案并复用。付费报告为数字内容，一旦生成即视为交付；除因我们的技术故障外，不支持无理由退款。' },
          { kind: 'h', text: '禁止行为' },
          { kind: 'list', items: [
            '批量注册账号以套取免费额度，或用脚本刷取报告；',
            '逆向、抓取或干扰服务的正常运行；',
            '将解读内容冒充专业医疗、法律或投资意见对外提供。',
          ] },
          { kind: 'h', text: '知识产权' },
          { kind: 'p', text: '排盘引擎来自开源项目 ziwei-doushu（MIT 许可），城市数据来自 GeoNames（CC BY 4.0）。网站界面、解读文案与编排为本服务所有。' },
          { kind: 'h', text: '责任限制' },
          { kind: 'p', text: '在法律允许的最大范围内，本服务按「现状」提供，我们对因使用解读内容而产生的任何决定或后果不承担责任。' },
          { kind: 'h', text: '条款变更' },
          { kind: 'p', text: '我们可能适时更新本条款，更新后的版本会在此页公布并标注生效日期。' },
        ],
      },
      {
        id: 'disclaimer',
        title: '免责声明与年龄限制',
        blocks: [
          { kind: 'p', text: '本服务仅供自我探索与文化娱乐，不构成任何形式的预测、诊断或专业建议。涉及健康、心理、法律、财务的重要决定，请咨询具备资质的专业人士。' },
          { kind: 'p', text: '排盘依据你填写的出生时间与地点计算，并会按真太阳时校正。数据填写不准确会影响结果，请自行核对。' },
          { kind: 'p', text: '本服务面向 18 岁及以上用户。未满 18 岁者请勿注册或使用。' },
        ],
      },
    ],
  },
  en: {
    title: 'Legal & privacy',
    intro: 'This page explains how we collect, use and protect your data, and the rules for using this service. For questions, contact ' + LEGAL_CONTACT_EMAIL + '.',
    sections: [
      {
        id: 'privacy',
        title: 'Privacy policy',
        blocks: [
          { kind: 'h', text: 'What we collect' },
          { kind: 'p', text: 'To provide readings we collect the birth details you enter (date, time, place, timezone and gender), your saved birth profiles, and account information (email or phone). Payments are handled by a third-party processor; we never receive your full card details.' },
          { kind: 'h', text: 'How we use it' },
          { kind: 'list', items: [
            'To calculate your chart and generate your reading;',
            'To manage your account, free quota and purchased reports;',
            'To keep the service secure and block abuse.',
          ] },
          { kind: 'h', text: 'Third-party services' },
          { kind: 'p', text: 'We use Supabase to store account and report data, an AI service to write readings, Dodo Payments as our Merchant of Record to process payments, and an email service for verification. Only chart facts — never your name or contact details — are sent to the AI service.' },
          { kind: 'h', text: 'Your rights and deletion' },
          { kind: 'p', text: 'You can delete any report, or delete your entire account and its associated data, from My Account. Under applicable data protection law (including the EU GDPR), you have the right to access, correct or request deletion of your personal data. Write to ' + LEGAL_CONTACT_EMAIL + ' for help.' },
          { kind: 'h', text: 'Retention' },
          { kind: 'p', text: 'Your data is kept while your account exists. After deletion it is removed or anonymised, except where law requires us to retain records.' },
          { kind: 'h', text: 'Cookies' },
          { kind: 'p', text: 'We only use technical storage required to keep you signed in and remember your language. We do not run advertising trackers.' },
        ],
      },
      {
        id: 'terms',
        title: 'Terms of service',
        blocks: [
          { kind: 'h', text: 'Nature of the service' },
          { kind: 'p', text: 'This service offers personality reflections and cultural research based on traditional Zi Wei Dou Shu. It does not predict the future, diagnose anything, or constitute medical, legal, financial or life advice.' },
          { kind: 'h', text: 'Accounts and quota' },
          { kind: 'p', text: 'Registration grants one free basic reading. You may save multiple birth profiles and reuse them. Full reports are digital content and are deemed delivered once generated; refunds are not offered except for technical faults on our side.' },
          { kind: 'h', text: 'Prohibited use' },
          { kind: 'list', items: [
            'Creating accounts in bulk to claim free quota, or scripting report generation;',
            'Reverse engineering, scraping or disrupting the service;',
            'Presenting readings as professional medical, legal or investment advice.',
          ] },
          { kind: 'h', text: 'Intellectual property' },
          { kind: 'p', text: 'The charting engine comes from the open-source project ziwei-doushu (MIT); city data from GeoNames (CC BY 4.0). The interface, reading copy and arrangement belong to this service.' },
          { kind: 'h', text: 'Limitation of liability' },
          { kind: 'p', text: 'To the maximum extent permitted by law, the service is provided "as is", and we are not liable for decisions or consequences arising from the use of its content.' },
          { kind: 'h', text: 'Changes' },
          { kind: 'p', text: 'We may update these terms; revised versions will be posted here with an effective date.' },
        ],
      },
      {
        id: 'disclaimer',
        title: 'Disclaimer & age limit',
        blocks: [
          { kind: 'p', text: 'This service is for self-exploration and cultural entertainment only. It is not a prediction, diagnosis or professional advice. For important decisions about health, mental health, law or finances, consult a qualified professional.' },
          { kind: 'p', text: 'Charts are calculated from the birth time and place you provide, corrected for true solar time. Inaccurate input affects results — please double-check your details.' },
          { kind: 'p', text: 'This service is intended for users aged 18 and over. If you are under 18, please do not register or use it.' },
        ],
      },
    ],
  },
  es: {
    title: 'Legal y privacidad',
    intro: 'Esta página explica cómo recopilamos, usamos y protegemos tus datos, así como las normas para usar este servicio. Si tienes dudas, escribe a ' + LEGAL_CONTACT_EMAIL + '.',
    sections: [
      {
        id: 'privacy',
        title: 'Política de privacidad',
        blocks: [
          { kind: 'h', text: 'Qué recopilamos' },
          { kind: 'p', text: 'Para ofrecer las lecturas recopilamos los datos de nacimiento que introduces (fecha, hora, lugar, zona horaria y sexo), tus perfiles de nacimiento guardados y la información de la cuenta (correo o teléfono). Los pagos los gestiona un procesador tercero; nunca recibimos los datos completos de tu tarjeta.' },
          { kind: 'h', text: 'Cómo lo usamos' },
          { kind: 'list', items: [
            'Para calcular tu carta y generar tu lectura;',
            'Para gestionar tu cuenta, tu cupo gratuito y los informes comprados;',
            'Para mantener el servicio seguro y bloquear el uso indebido.',
          ] },
          { kind: 'h', text: 'Servicios de terceros' },
          { kind: 'p', text: 'Usamos Supabase para almacenar los datos de la cuenta y de los informes, un servicio de IA para redactar las lecturas, Dodo Payments como Merchant of Record para procesar los pagos y un servicio de correo para la verificación. Solo se envían al servicio de IA los hechos de la carta, nunca tu nombre ni tus datos de contacto.' },
          { kind: 'h', text: 'Tus derechos y la eliminación' },
          { kind: 'p', text: 'Puedes eliminar cualquier informe, o eliminar toda tu cuenta y sus datos asociados, desde Mi cuenta. Según la normativa de protección de datos aplicable (incluido el RGPD de la UE), tienes derecho a acceder, corregir o solicitar la eliminación de tus datos personales. Escribe a ' + LEGAL_CONTACT_EMAIL + ' para obtener ayuda.' },
          { kind: 'h', text: 'Conservación' },
          { kind: 'p', text: 'Tus datos se conservan mientras exista tu cuenta. Tras la eliminación se borran o anonimizan, salvo cuando la ley nos obliga a conservar registros.' },
          { kind: 'h', text: 'Cookies' },
          { kind: 'p', text: 'Solo usamos el almacenamiento técnico necesario para mantener la sesión iniciada y recordar tu idioma. No ejecutamos rastreadores publicitarios.' },
        ],
      },
      {
        id: 'terms',
        title: 'Términos del servicio',
        blocks: [
          { kind: 'h', text: 'Naturaleza del servicio' },
          { kind: 'p', text: 'Este servicio ofrece reflexiones de personalidad e investigación cultural basadas en el Zi Wei Dou Shu tradicional. No predice el futuro, no diagnostica nada ni constituye asesoramiento médico, legal, financiero ni vital.' },
          { kind: 'h', text: 'Cuentas y cupo' },
          { kind: 'p', text: 'El registro otorga una lectura básica gratuita. Puedes guardar varios perfiles de nacimiento y reutilizarlos. Los informes completos son contenido digital y se consideran entregados una vez generados; no se ofrecen reembolsos, excepto por fallos técnicos de nuestra parte.' },
          { kind: 'h', text: 'Uso prohibido' },
          { kind: 'list', items: [
            'Crear cuentas en masa para reclamar cupo gratuito, o generar informes con scripts;',
            'Realizar ingeniería inversa, extraer datos o perturbar el servicio;',
            'Presentar las lecturas como asesoramiento médico, legal o de inversión profesional.',
          ] },
          { kind: 'h', text: 'Propiedad intelectual' },
          { kind: 'p', text: 'El motor de cartas procede del proyecto de código abierto ziwei-doushu (MIT); los datos de ciudades, de GeoNames (CC BY 4.0). La interfaz, el texto de las lecturas y su composición pertenecen a este servicio.' },
          { kind: 'h', text: 'Limitación de responsabilidad' },
          { kind: 'p', text: 'En la máxima medida permitida por la ley, el servicio se ofrece «tal cual» y no nos hacemos responsables de decisiones o consecuencias derivadas del uso de su contenido.' },
          { kind: 'h', text: 'Cambios' },
          { kind: 'p', text: 'Podemos actualizar estos términos; las versiones revisadas se publicarán aquí con una fecha de entrada en vigor.' },
        ],
      },
      {
        id: 'disclaimer',
        title: 'Aviso legal y límite de edad',
        blocks: [
          { kind: 'p', text: 'Este servicio es solo para autoexploración y entretenimiento cultural. No es una predicción, un diagnóstico ni un consejo profesional. Para decisiones importantes sobre salud, salud mental, derecho o finanzas, consulta a un profesional cualificado.' },
          { kind: 'p', text: 'Las cartas se calculan a partir de la hora y el lugar de nacimiento que proporcionas, corregidas según la hora solar verdadera. Una entrada incorrecta afecta los resultados; comprueba bien tus datos.' },
          { kind: 'p', text: 'Este servicio está destinado a usuarios mayores de 18 años. Si eres menor de 18, no te registres ni lo uses.' },
        ],
      },
    ],
  },
  fr: {
    title: 'Mentions légales & vie privée',
    intro: 'Cette page explique comment nous recueillons, utilisons et protégeons vos données, ainsi que les règles d’utilisation du service. Pour toute question, écrivez à ' + LEGAL_CONTACT_EMAIL + '.',
    sections: [
      {
        id: 'privacy',
        title: 'Politique de confidentialité',
        blocks: [
          { kind: 'h', text: 'Ce que nous recueillons' },
          { kind: 'p', text: 'Pour fournir les lectures, nous recueillons les données de naissance que vous saisissez (date, heure, lieu, fuseau horaire et sexe), vos profils de naissance enregistrés et les informations de compte (e-mail ou téléphone). Les paiements sont traités par un prestataire tiers ; nous ne recevons jamais vos coordonnées bancaires complètes.' },
          { kind: 'h', text: 'Comment nous l’utilisons' },
          { kind: 'list', items: [
            'Calculer votre thème et générer votre lecture ;',
            'Gérer votre compte, votre quota gratuit et vos rapports achetés ;',
            'Garantir la sécurité du service et bloquer les abus.',
          ] },
          { kind: 'h', text: 'Services tiers' },
          { kind: 'p', text: 'Nous utilisons Supabase pour stocker les données du compte et des rapports, un service d’IA pour rédiger les lectures, Dodo Payments en tant que Merchant of Record pour traiter les paiements, et un service e-mail pour la vérification. Seuls les faits du thème sont envoyés au service d’IA — jamais votre nom ni vos coordonnées.' },
          { kind: 'h', text: 'Vos droits et la suppression' },
          { kind: 'p', text: 'Vous pouvez supprimer tout rapport, ou supprimer l’ensemble de votre compte et de ses données associées, depuis Mon compte. En vertu du droit applicable à la protection des données (y compris le RGPD de l’UE), vous avez le droit d’accéder à vos données personnelles, de les corriger ou d’en demander la suppression. Écrivez à ' + LEGAL_CONTACT_EMAIL + ' pour obtenir de l’aide.' },
          { kind: 'h', text: 'Conservation' },
          { kind: 'p', text: 'Vos données sont conservées tant que votre compte existe. Après suppression, elles sont effacées ou anonymisées, sauf lorsque la loi nous oblige à conserver des enregistrements.' },
          { kind: 'h', text: 'Cookies' },
          { kind: 'p', text: 'Nous n’utilisons que le stockage technique nécessaire pour vous maintenir connecté et mémoriser votre langue. Nous n’utilisons aucun traceur publicitaire.' },
        ],
      },
      {
        id: 'terms',
        title: "Conditions d'utilisation",
        blocks: [
          { kind: 'h', text: 'Nature du service' },
          { kind: 'p', text: 'Ce service propose des réflexions de personnalité et de la recherche culturelle fondées sur le Zi Wei Dou Shu traditionnel. Il ne prédit pas l’avenir, n’établit aucun diagnostic et ne constitue ni un avis médical, ni juridique, ni financier, ni un conseil de vie.' },
          { kind: 'h', text: 'Comptes et quota' },
          { kind: 'p', text: 'L’inscription donne droit à une lecture de base gratuite. Vous pouvez enregistrer plusieurs profils de naissance et les réutiliser. Les rapports complets sont des contenus numériques réputés livrés dès leur génération ; aucun remboursement n’est proposé, sauf en cas de panne technique de notre côté.' },
          { kind: 'h', text: 'Utilisation interdite' },
          { kind: 'list', items: [
            'Créer des comptes en masse pour réclamer le quota gratuit ou générer des rapports par script ;',
            'Procéder à de l’ingénierie inverse, extraire des données ou perturber le service ;',
            'Présenter les lectures comme des conseils médicaux, juridiques ou en investissement professionnels.',
          ] },
          { kind: 'h', text: 'Propriété intellectuelle' },
          { kind: 'p', text: 'Le moteur de thème provient du projet open source ziwei-doushu (MIT) ; les données de villes de GeoNames (CC BY 4.0). L’interface, le texte des lectures et leur mise en forme appartiennent à ce service.' },
          { kind: 'h', text: 'Limitation de responsabilité' },
          { kind: 'p', text: 'Dans toute la mesure permise par la loi, le service est fourni « tel quel » et nous ne sommes pas responsables des décisions ou conséquences découlant de l’utilisation de son contenu.' },
          { kind: 'h', text: 'Modifications' },
          { kind: 'p', text: 'Nous pouvons mettre à jour ces conditions ; les versions révisées seront publiées ici avec une date d’entrée en vigueur.' },
        ],
      },
      {
        id: 'disclaimer',
        title: 'Avertissement & limite d’âge',
        blocks: [
          { kind: 'p', text: 'Ce service est réservé à l’exploration personnelle et au divertissement culturel. Il ne constitue ni une prédiction, ni un diagnostic, ni un conseil professionnel. Pour toute décision importante concernant la santé, la santé mentale, le droit ou les finances, consultez un professionnel qualifié.' },
          { kind: 'p', text: 'Les thèmes sont calculés à partir de l’heure et du lieu de naissance que vous indiquez, corrigés à l’heure solaire vraie. Une saisie inexacte affecte les résultats — vérifiez bien vos informations.' },
          { kind: 'p', text: 'Ce service s’adresse aux utilisateurs âgés d’au moins 18 ans. Si vous avez moins de 18 ans, veuillez ne pas vous inscrire ni l’utiliser.' },
        ],
      },
    ],
  },
  de: {
    title: 'Rechtliches & Datenschutz',
    intro: 'Auf dieser Seite erklären wir, wie wir deine Daten erheben, nutzen und schützen, sowie die Regeln für die Nutzung dieses Dienstes. Bei Fragen wende dich an ' + LEGAL_CONTACT_EMAIL + '.',
    sections: [
      {
        id: 'privacy',
        title: 'Datenschutzerklärung',
        blocks: [
          { kind: 'h', text: 'Was wir erheben' },
          { kind: 'p', text: 'Um Deutungen anzubieten, erheben wir die von dir eingegebenen Geburtsdaten (Datum, Uhrzeit, Ort, Zeitzone und Geschlecht), deine gespeicherten Geburtsprofile sowie Kontoinformationen (E-Mail oder Telefon). Zahlungen werden von einem Drittanbieter abgewickelt; wir erhalten nie deine vollständigen Kartendaten.' },
          { kind: 'h', text: 'Wie wir sie nutzen' },
          { kind: 'list', items: [
            'Zur Berechnung deines Horoskops und Erstellung deiner Deutung;',
            'Zur Verwaltung deines Kontos, deines kostenlosen Kontingents und gekaufter Berichte;',
            'Zur Sicherheit des Dienstes und zur Bekämpfung von Missbrauch.',
          ] },
          { kind: 'h', text: 'Dienste Dritter' },
          { kind: 'p', text: 'Wir nutzen Supabase zur Speicherung von Konto- und Berichtsdaten, einen KI-Dienst zum Verfassen der Deutungen, Dodo Payments als Merchant of Record zur Zahlungsabwicklung und einen E-Mail-Dienst zur Verifizierung. An den KI-Dienst gehen nur Horoskop-Fakten — niemals dein Name oder deine Kontaktdaten.' },
          { kind: 'h', text: 'Deine Rechte und die Löschung' },
          { kind: 'p', text: 'Du kannst jeden Bericht oder dein gesamtes Konto mit allen zugehörigen Daten unter „Mein Konto“ löschen. Nach geltendem Datenschutzrecht (einschließlich der EU-DSGVO) hast du das Recht auf Zugang, Berichtigung oder Löschung deiner personenbezogenen Daten. Schreibe für Hilfe an ' + LEGAL_CONTACT_EMAIL + '.' },
          { kind: 'h', text: 'Speicherdauer' },
          { kind: 'p', text: 'Deine Daten werden solange gespeichert, wie dein Konto besteht. Nach der Löschung werden sie entfernt oder anonymisiert, sofern das Gesetz keine Aufbewahrungspflicht vorsieht.' },
          { kind: 'h', text: 'Cookies' },
          { kind: 'p', text: 'Wir nutzen nur technische Speicher, die zum Aufrechterhalten der Anmeldung und zur Speicherung deiner Sprache nötig sind. Wir setzen keine Werbe-Tracker ein.' },
        ],
      },
      {
        id: 'terms',
        title: 'Nutzungsbedingungen',
        blocks: [
          { kind: 'h', text: 'Art des Dienstes' },
          { kind: 'p', text: 'Dieser Dienst bietet Persönlichkeitsreflexionen und kulturelle Forschung auf Basis des traditionellen Zi Wei Dou Shu. Er sagt keine Zukunft voraus, stellt keine Diagnosen und stellt keine medizinische, rechtliche, finanzielle oder Lebensberatung dar.' },
          { kind: 'h', text: 'Konten und Kontingent' },
          { kind: 'p', text: 'Die Registrierung gewährt eine kostenlose Basisdeutung. Du kannst mehrere Geburtsprofile speichern und wiederverwenden. Vollberichte sind digitale Inhalte und gelten mit der Erstellung als geliefert; eine Rückerstattung erfolgt nicht, außer bei technischen Fehlern unsererseits.' },
          { kind: 'h', text: 'Verbotene Nutzung' },
          { kind: 'list', items: [
            'Massenweises Erstellen von Konten zur Beanspruchung des kostenlosen Kontingents oder das skriptgestützte Erstellen von Berichten;',
            'Reverse Engineering, Scraping oder Stören des Dienstes;',
            'Darstellen von Deutungen als professionelle medizinische, rechtliche oder Anlageberatung.',
          ] },
          { kind: 'h', text: 'Geistiges Eigentum' },
          { kind: 'p', text: 'Die Horoskop-Engine stammt aus dem Open-Source-Projekt ziwei-doushu (MIT); die Städtedaten von GeoNames (CC BY 4.0). Benutzeroberfläche, Deutungstexte und deren Gestaltung gehören zu diesem Dienst.' },
          { kind: 'h', text: 'Haftungsbeschränkung' },
          { kind: 'p', text: 'Soweit gesetzlich zulässig, wird der Dienst „wie besehen“ bereitgestellt, und wir übernehmen keine Haftung für Entscheidungen oder Folgen, die sich aus der Nutzung seiner Inhalte ergeben.' },
          { kind: 'h', text: 'Änderungen' },
          { kind: 'p', text: 'Wir können diese Bedingungen aktualisieren; überarbeitete Versionen werden hier mit einem Gültigkeitsdatum veröffentlicht.' },
        ],
      },
      {
        id: 'disclaimer',
        title: 'Haftungsausschluss & Altersgrenze',
        blocks: [
          { kind: 'p', text: 'Dieser Dienst dient ausschließlich der Selbstexploration und kulturellen Unterhaltung. Er ist keine Vorhersage, Diagnose oder professionelle Beratung. Bei wichtigen Entscheidungen zu Gesundheit, psychischer Gesundheit, Recht oder Finanzen konsultiere eine qualifizierte Fachkraft.' },
          { kind: 'p', text: 'Horoskope werden anhand der von dir angegebenen Geburtszeit und -orts berechnet und auf die wahre Sonnenzeit korrigiert. Ungenaue Eingaben beeinflussen die Ergebnisse — bitte prüfe deine Angaben sorgfältig.' },
          { kind: 'p', text: 'Dieser Dienst ist für Nutzer ab 18 Jahren bestimmt. Wenn du unter 18 bist, registriere dich bitte nicht und nutze ihn nicht.' },
        ],
      },
    ],
  },
  ja: {
    title: '法律とプライバシー',
    intro: 'このページでは、お客様のデータをどのように収集・利用・保護するか、および本サービスの利用ルールを説明します。ご質問は ' + LEGAL_CONTACT_EMAIL + ' までご連絡ください。',
    sections: [
      {
        id: 'privacy',
        title: 'プライバシーポリシー',
        blocks: [
          { kind: 'h', text: '収集するもの' },
          { kind: 'p', text: '解読を提供するため、お客様が入力する出生情報（生年月日、時刻、場所、タイムゾーン、性別）、保存された出生プロフィール、アカウント情報（メールアドレスまたは電話番号）を収集します。支払いは第三者の決済代行業者が処理し、当社がカード情報全体を受け取ることはありません。' },
          { kind: 'h', text: '利用方法' },
          { kind: 'list', items: [
            '命盤を計算し、解読を生成するため。',
            'アカウント、無料枠、購入済みレポートを管理するため。',
            'サービスの安全性を確保し、不正利用を防ぐため。',
          ] },
          { kind: 'h', text: '第三者サービス' },
          { kind: 'p', text: '当社では、アカウントとレポートのデータ保存に Supabase を、解読の文章作成に AI サービスを、決済処理に Merchant of Record として Dodo Payments を、本人確認にメールサービスを利用しています。AI サービスに送信されるのは命盤の事実のみで、お客様の氏名や連絡先は送信されません。' },
          { kind: 'h', text: 'お客様の権利と削除' },
          { kind: 'p', text: '「マイアカウント」から、任意のレポートを削除したり、アカウント全体と関連データを削除したりできます。適用されるデータ保護法（EU の GDPR を含む）に基づき、お客様は個人データへのアクセス、訂正、削除請求を行う権利を有します。サポートが必要な場合は ' + LEGAL_CONTACT_EMAIL + ' までご連絡ください。' },
          { kind: 'h', text: '保持期間' },
          { kind: 'p', text: 'お客様のデータはアカウントが存在する間保持されます。削除後は、法律上の保存義務がある場合を除き、データは消去または匿名化されます。' },
          { kind: 'h', text: 'Cookie' },
          { kind: 'p', text: '当社では、ログイン状態の維持と言語設定の記憶に必要な技術的な保存のみを使用し、広告トラッカーは使用しません。' },
        ],
      },
      {
        id: 'terms',
        title: '利用規約',
        blocks: [
          { kind: 'h', text: 'サービスの性質' },
          { kind: 'p', text: '本サービスは、伝統的な紫微斗数に基づく性格の考察と文化研究のコンテンツを提供します。未来を予測したり診断したりするものではなく、医療、法律、財務、人生に関する助言を構成するものでもありません。' },
          { kind: 'h', text: 'アカウントと利用枠' },
          { kind: 'p', text: '登録すると、基礎解読を1回無料で利用できます。出生プロフィールを複数保存して再利用できます。完全版レポートはデジタルコンテンツであり、生成された時点で提供されたものとみなされます。当社側の技術的な不具合を除き、理由のない返金には応じられません。' },
          { kind: 'h', text: '禁止行為' },
          { kind: 'list', items: [
            '無料枠を不正に取得するためにアカウントを大量に作成すること、またはスクリプトでレポートを生成すること。',
            'リバースエンジニアリング、スクレイピング、サービスの妨害を行うこと。',
            '解読内容を、専門的な医療、法律、投資の助言として提示すること。',
          ] },
          { kind: 'h', text: '知的財産' },
          { kind: 'p', text: '命盤エンジンはオープンソースプロジェクト ziwei-doushu（MIT ライセンス）、都市データは GeoNames（CC BY 4.0）に由来します。サイトの画面、解読の文章、構成は本サービスに帰属します。' },
          { kind: 'h', text: '責任の制限' },
          { kind: 'p', text: '法律で許容される最大限の範囲において、本サービスは「現状有姿」で提供され、そのコンテンツの利用によって生じた決定や結果について当社は責任を負いません。' },
          { kind: 'h', text: '変更' },
          { kind: 'p', text: '当社は本規約を適宜更新する場合があります。更新後の版は、生效日を記載してこのページに掲載されます。' },
        ],
      },
      {
        id: 'disclaimer',
        title: '免責事項と年齢制限',
        blocks: [
          { kind: 'p', text: '本サービスは、自己探求と文化的な娯楽のみを目的としており、予測、診断、専門的助言を構成するものではありません。健康、メンタルヘルス、法律、財務に関する重要な決定については、有資格の専門家にご相談ください。' },
          { kind: 'p', text: '命盤は、お客様が入力した出生時刻と場所に基づいて計算され、真太陽時に補正されます。入力が正確でないと結果に影響しますので、内容をご確認ください。' },
          { kind: 'p', text: '本サービスは18歳以上のユーザーを対象としています。18歳未満の方は登録および利用しないでください。' },
        ],
      },
    ],
  },
};

export function getLegalContent(lang: Lang) {
  return content[lang];
}
