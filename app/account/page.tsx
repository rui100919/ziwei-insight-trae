'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { demoStore, isDemoMode, type DemoUserProfile } from '@/lib/demo';
import { t, normalizeLang, LANG_META, SUPPORTED_LANGS, type Lang } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { StatusBadge } from '@/components/StatusBadge';

type Report = {
  id: string;
  language: string;
  report_type: string;
  status?: string;
  created_at: string;
  locked?: boolean;
  content?: { overview?: string } | null;
  profile?: { label: string; birthDate: string; birthTime: string; birthPlace: string; timeKnown: boolean };
};

/** 报告列表的一行（服务端按人聚合后返回）。 */
type PersonReport = {
  id: string;
  report_type: string;
  status: string;
  created_at: string;
  locked?: boolean;
  overview?: string | null;
};

/** 一个人 = 同姓名 + 同出生日期 + 同地点；基础与完整解读收在同一个框里。 */
type Person = {
  key: string;
  label: string;
  birthDate: string;
  birthPlace: string;
  reports: PersonReport[];
};

type Entitlement = { status: string };
type Order = { id: string; amount: number; currency: string; status: string; created_at: string };

type AccountStrings = {
  welcomeBack: string; subtitle: string;
  freeReading: string; freeAvail: string; freeDone: string; freeAvailDesc: string; freeDoneDesc: string;
  fullReport: string; fullUnlocked: string; orders: string; fullDesc: string; genFull: string;
  orderPaid: string; orderRefunded: string; orderPending: string;
  savedReadings: string; repOne: string; repOther: string;
  myReports: string; personUnit: string; basicReading: string; fullReading: string;
  allPeople: string;
  notGenerated: string; genBasic: string; unlockFull: string;
  noReadings: string; noReadingsHint: string;
  fullReportLabel: string; basicReportLabel: string;
  reportFailed: string; reportPending: string; reportCompleted: string; reportLocked: string;
  viewReport: string;
  birthDetails: string; savedBirth: string; profOne: string; profOther: string; noBirth: string;
  addBirth: string;
  yourData: string; deleteAccount: string; requestDelete: string; deleteConfirmText: string;
  profileEyebrow: string; yourDetails: string; memberSince: string;
  displayName: string; yourName: string; readingLanguage: string; langHint: string;
  savedCheck: string; saveProfile: string;
  privacy: string; privateByDesign: string; priv1: string; priv2: string; priv3: string;
  delBirthConfirm: string;
  signOut: string;
};

const S: Record<Lang, AccountStrings> = {
  zh: {
    welcomeBack: '欢迎回来', subtitle: '你的命盘、免费解读和资料，都安静地放在这里。',
    freeReading: '我的免费解读', freeAvail: '一次免费基础解读', freeDone: '解读已完成',
    freeAvailDesc: '补充一份解读随时可用。填好出生资料后，我们就开始。',
    freeDoneDesc: '你的一次免费基础解读已生成。删除报告不会恢复这次机会。',
    fullReport: '完整报告', fullUnlocked: '已解锁完整报告', orders: '购买记录',
    fullDesc: '你可以为任意出生资料生成详细推演。', genFull: '生成完整报告',
    orderPaid: '已支付', orderRefunded: '已退款', orderPending: '处理中',
    savedReadings: '已保存的解读', repOne: '份报告', repOther: '份报告',
    myReports: '我的报告', personUnit: '位', basicReading: '基础解读', fullReading: '完整解读', allPeople: '全部',
    notGenerated: '未生成', genBasic: '生成基础解读', unlockFull: '解锁完整报告',
    noReadings: '还没有解读', noReadingsHint: '生成第一份后，它会保存在这里。',
    fullReportLabel: '紫微完整报告', basicReportLabel: '紫微基础解读',
    reportFailed: '生成失败', reportPending: '生成中', reportCompleted: '已完成', reportLocked: '已退款关闭', viewReport: '查看解读',
    birthDetails: '出生档案', savedBirth: '已保存的资料', profOne: '份', profOther: '份',
    noBirth: '还没有保存出生资料。', addBirth: '添加出生资料',
    yourData: '你的数据', deleteAccount: '删除账户', requestDelete: '申请删除整个账户',
    deleteConfirmText: '输入 DELETE 确认。此操作会删除你的个人数据，订单等法定记录将匿名保留。',
    profileEyebrow: '账户', yourDetails: '你的资料', memberSince: '注册于',
    displayName: '显示名称', yourName: '你的名字', readingLanguage: '报告语言',
    langHint: '用于生成报告；界面语言会随之切换。', savedCheck: '已保存 ✓', saveProfile: '保存资料',
    privacy: '隐私', privateByDesign: '设计上就是私密的',
    priv1: '报告只保存在你的账户里，只有你自己能看到。',
    priv2: '删除报告会把它从账户移除，免费次数不会恢复。',
    priv3: '一个人一份：同姓名、同出生日期、同地点，不会重复生成第二份。',
    delBirthConfirm: '删除这份出生资料？已生成的报告会保留。',
    signOut: '退出登录',
  },
  en: {
    welcomeBack: 'Welcome back', subtitle: 'Your chart, your free reading, and the details behind it — all in one private place.',
    freeReading: 'My free reading', freeAvail: 'One free basic reading', freeDone: 'Reading complete',
    freeAvailDesc: 'Your complimentary reading is ready when you are. Add your birth details below to prepare it.',
    freeDoneDesc: 'Your one-time free basic reading has been generated. Deleting a report does not restore this reading.',
    fullReport: 'Full report', fullUnlocked: 'Full report unlocked', orders: 'Order history',
    fullDesc: 'You can generate a detailed reading for any birth profile.', genFull: 'Generate full report',
    orderPaid: 'Paid', orderRefunded: 'Refunded', orderPending: 'Pending',
    savedReadings: 'Saved readings', repOne: 'report', repOther: 'reports',
    myReports: 'My reports', personUnit: 'people', basicReading: 'Basic reading', fullReading: 'Full report', allPeople: 'All',
    notGenerated: 'Not generated', genBasic: 'Generate basic reading', unlockFull: 'Unlock full report',
    noReadings: 'No readings yet', noReadingsHint: 'Your first report will appear here after your chart is generated.',
    fullReportLabel: 'Zi Wei full report', basicReportLabel: 'Zi Wei basic reading',
    reportFailed: 'Failed', reportPending: 'Processing', reportCompleted: 'Completed', reportLocked: 'Closed after refund', viewReport: 'View report',
    birthDetails: 'Birth details', savedBirth: 'Saved birth details', profOne: 'profile', profOther: 'profiles',
    noBirth: 'No birth details saved yet.', addBirth: 'Add birth details',
    yourData: 'Your data', deleteAccount: 'Delete account', requestDelete: 'Request account deletion',
    deleteConfirmText: 'Type DELETE to confirm. Personal data will be removed; legally required order records are anonymised.',
    profileEyebrow: 'Profile', yourDetails: 'Your details', memberSince: 'Member since',
    displayName: 'Display name', yourName: 'Your name', readingLanguage: 'Reading language',
    langHint: 'Used for generated reports; the interface language follows.', savedCheck: 'Saved ✓', saveProfile: 'Save profile',
    privacy: 'Privacy', privateByDesign: 'Private by design',
    priv1: 'Reports are saved to your account and visible only to you.',
    priv2: 'Deleting a report removes it from your account. Your free reading stays used.',
    priv3: 'One person, one set: the same name, birth date and birth place never produces a second copy.',
    delBirthConfirm: 'Delete this birth profile? Saved reports will be kept.',
    signOut: 'Sign out',
  },
  es: {
    welcomeBack: 'Bienvenido de nuevo', subtitle: 'Tu carta, tu lectura gratuita y todos tus datos, reunidos en un solo lugar privado.',
    freeReading: 'Mi lectura gratuita', freeAvail: 'Una lectura básica gratuita', freeDone: 'Lectura completada',
    freeAvailDesc: 'Tu lectura gratuita está lista cuando tú lo estés. Añade tus datos de nacimiento a continuación para prepararla.',
    freeDoneDesc: 'Tu lectura básica gratuita ya se ha generado. Borrar un informe no recupera esta oportunidad.',
    fullReport: 'Informe completo', fullUnlocked: 'Informe completo desbloqueado', orders: 'Historial de pedidos',
    fullDesc: 'Puedes generar una lectura detallada para cualquier perfil de nacimiento.', genFull: 'Generar informe completo',
    orderPaid: 'Pagado', orderRefunded: 'Reembolsado', orderPending: 'Pendiente',
    savedReadings: 'Lecturas guardadas', repOne: 'informe', repOther: 'informes',
    myReports: 'Mis informes', personUnit: 'personas', basicReading: 'Lectura básica', fullReading: 'Informe completo', allPeople: 'Todos',
    notGenerated: 'Sin generar', genBasic: 'Generar lectura básica', unlockFull: 'Desbloquear informe completo',
    noReadings: 'Aún no hay lecturas', noReadingsHint: 'Tu primer informe aparecerá aquí después de generar tu carta.',
    fullReportLabel: 'Informe completo de Zi Wei', basicReportLabel: 'Lectura básica de Zi Wei',
    reportFailed: 'Fallido', reportPending: 'En proceso', reportCompleted: 'Completado', reportLocked: 'Cerrado por reembolso', viewReport: 'Ver lectura',
    birthDetails: 'Datos de nacimiento', savedBirth: 'Datos de nacimiento guardados', profOne: 'perfil', profOther: 'perfiles',
    noBirth: 'Aún no hay datos de nacimiento guardados.', addBirth: 'Añadir datos de nacimiento',
    yourData: 'Tus datos', deleteAccount: 'Eliminar cuenta', requestDelete: 'Solicitar la eliminación de toda la cuenta',
    deleteConfirmText: 'Escribe DELETE para confirmar. Se eliminarán tus datos personales; los registros de pedido exigidos por la ley se conservarán de forma anónima.',
    profileEyebrow: 'Perfil', yourDetails: 'Tus datos', memberSince: 'Miembro desde',
    displayName: 'Nombre para mostrar', yourName: 'Tu nombre', readingLanguage: 'Idioma de la lectura',
    langHint: 'Se usa para generar los informes; el idioma de la interfaz cambia con él.', savedCheck: 'Guardado ✓', saveProfile: 'Guardar perfil',
    privacy: 'Privacidad', privateByDesign: 'Privado por diseño',
    priv1: 'Los informes se guardan en tu cuenta y solo tú puedes verlos.',
    priv2: 'Eliminar un informe lo quita de tu cuenta; la lectura gratuita no se recupera.',
    priv3: 'Una persona, un conjunto: el mismo nombre, fecha y lugar de nacimiento no generan una segunda copia.',
    delBirthConfirm: '¿Eliminar estos datos de nacimiento? Los informes ya generados se conservarán.',
    signOut: 'Cerrar sesión',
  },
  fr: {
    welcomeBack: 'Bon retour', subtitle: 'Votre thème, votre lecture gratuite et toutes vos données, réunis dans un seul espace privé.',
    freeReading: 'Ma lecture gratuite', freeAvail: 'Une lecture de base gratuite', freeDone: 'Lecture terminée',
    freeAvailDesc: 'Votre lecture gratuite vous attend. Ajoutez vos données de naissance ci-dessous pour la préparer.',
    freeDoneDesc: 'Votre lecture de base gratuite a déjà été générée. Supprimer un rapport ne récupère pas cette chance.',
    fullReport: 'Rapport complet', fullUnlocked: 'Rapport complet débloqué', orders: 'Historique des commandes',
    fullDesc: 'Vous pouvez générer une lecture détaillée pour tout profil de naissance.', genFull: 'Générer le rapport complet',
    orderPaid: 'Payé', orderRefunded: 'Remboursé', orderPending: 'En attente',
    savedReadings: 'Lectures enregistrées', repOne: 'rapport', repOther: 'rapports',
    myReports: 'Mes rapports', personUnit: 'personnes', basicReading: 'Lecture de base', fullReading: 'Rapport complet', allPeople: 'Tous',
    notGenerated: 'Non généré', genBasic: 'Générer la lecture de base', unlockFull: 'Débloquer le rapport complet',
    noReadings: 'Aucune lecture pour le moment', noReadingsHint: 'Votre premier rapport apparaîtra ici après la génération de votre thème.',
    fullReportLabel: 'Rapport complet Zi Wei', basicReportLabel: 'Lecture de base Zi Wei',
    reportFailed: 'Échec', reportPending: 'En cours', reportCompleted: 'Terminé', reportLocked: 'Fermé après remboursement', viewReport: 'Voir la lecture',
    birthDetails: 'Données de naissance', savedBirth: 'Données de naissance enregistrées', profOne: 'profil', profOther: 'profils',
    noBirth: 'Aucune donnée de naissance enregistrée pour le moment.', addBirth: 'Ajouter des données de naissance',
    yourData: 'Vos données', deleteAccount: 'Supprimer le compte', requestDelete: 'Demander la suppression de l’ensemble du compte',
    deleteConfirmText: 'Saisissez DELETE pour confirmer. Vos données personnelles seront supprimées ; les enregistrements de commande requis par la loi seront conservés de façon anonymisée.',
    profileEyebrow: 'Profil', yourDetails: 'Vos informations', memberSince: 'Membre depuis',
    displayName: 'Nom affiché', yourName: 'Votre nom', readingLanguage: 'Langue de la lecture',
    langHint: 'Utilisé pour générer les rapports ; la langue de l’interface s’ensuit.', savedCheck: 'Enregistré ✓', saveProfile: 'Enregistrer le profil',
    privacy: 'Confidentialité', privateByDesign: 'Privé par conception',
    priv1: 'Les rapports sont enregistrés dans votre compte et ne sont visibles que par vous.',
    priv2: 'Supprimer un rapport le retire de votre compte ; la lecture gratuite reste consommée.',
    priv3: 'Une personne, un jeu : même nom, même date et même lieu de naissance ne produisent pas de second exemplaire.',
    delBirthConfirm: 'Supprimer ces données de naissance ? Les rapports déjà générés seront conservés.',
    signOut: 'Se déconnecter',
  },
  de: {
    welcomeBack: 'Willkommen zurück', subtitle: 'Dein Horoskop, deine kostenlose Deutung und alle deine Daten — an einem privaten Ort.',
    freeReading: 'Meine kostenlose Deutung', freeAvail: 'Eine kostenlose Basisdeutung', freeDone: 'Deutung abgeschlossen',
    freeAvailDesc: 'Deine kostenlose Deutung wartet auf dich. Gib unten deine Geburtsdaten ein, um sie vorzubereiten.',
    freeDoneDesc: 'Deine einmalige kostenlose Basisdeutung wurde erstellt. Einen Bericht zu löschen stellt diese Möglichkeit nicht wieder her.',
    fullReport: 'Vollbericht', fullUnlocked: 'Vollbericht freigeschaltet', orders: 'Bestellverlauf',
    fullDesc: 'Du kannst für jedes Geburtsprofil eine detaillierte Deutung erstellen.', genFull: 'Vollbericht erstellen',
    orderPaid: 'Bezahlt', orderRefunded: 'Erstattet', orderPending: 'Ausstehend',
    savedReadings: 'Gespeicherte Deutungen', repOne: 'Bericht', repOther: 'Berichte',
    myReports: 'Meine Berichte', personUnit: 'Personen', basicReading: 'Basisdeutung', fullReading: 'Vollbericht', allPeople: 'Alle',
    notGenerated: 'Nicht erstellt', genBasic: 'Basisdeutung erstellen', unlockFull: 'Vollbericht freischalten',
    noReadings: 'Noch keine Deutungen', noReadingsHint: 'Dein erster Bericht erscheint hier, nachdem dein Horoskop erstellt wurde.',
    fullReportLabel: 'Zi Wei Vollbericht', basicReportLabel: 'Zi Wei Basisdeutung',
    reportFailed: 'Fehlgeschlagen', reportPending: 'In Bearbeitung', reportCompleted: 'Abgeschlossen', reportLocked: 'Nach Erstattung geschlossen', viewReport: 'Deutung ansehen',
    birthDetails: 'Geburtsdaten', savedBirth: 'Gespeicherte Geburtsdaten', profOne: 'Profil', profOther: 'Profile',
    noBirth: 'Noch keine Geburtsdaten gespeichert.', addBirth: 'Geburtsdaten hinzufügen',
    yourData: 'Deine Daten', deleteAccount: 'Konto löschen', requestDelete: 'Löschung des gesamten Kontos beantragen',
    deleteConfirmText: 'Gib DELETE ein, um zu bestätigen. Personenbezogene Daten werden entfernt; gesetzlich erforderliche Bestelldatensätze bleiben anonymisiert erhalten.',
    profileEyebrow: 'Profil', yourDetails: 'Deine Angaben', memberSince: 'Mitglied seit',
    displayName: 'Anzeigename', yourName: 'Dein Name', readingLanguage: 'Sprache der Deutung',
    langHint: 'Wird für die Erstellung der Berichte verwendet; die Oberflächensprache folgt dieser Einstellung.', savedCheck: 'Gespeichert ✓', saveProfile: 'Profil speichern',
    privacy: 'Datenschutz', privateByDesign: 'Von Grund auf privat',
    priv1: 'Berichte werden in deinem Konto gespeichert und sind nur für dich sichtbar.',
    priv2: 'Einen Bericht zu löschen entfernt ihn aus deinem Konto; die kostenlose Deutung bleibt verbraucht.',
    priv3: 'Eine Person, ein Set: gleicher Name, gleiches Geburtsdatum und gleicher Ort erzeugen keine zweite Kopie.',
    delBirthConfirm: 'Diese Geburtsdaten löschen? Bereits erstellte Berichte bleiben erhalten.',
    signOut: 'Abmelden',
  },
  ja: {
    welcomeBack: 'おかえりなさい', subtitle: 'あなたの命盤、無料解読、そしてすべてのデータが、プライベートな一箇所にまとまっています。',
    freeReading: 'マイ無料解読', freeAvail: '無料の基礎解読を1回', freeDone: '解読は完了しました',
    freeAvailDesc: '無料解読はいつでも利用できます。下に出生情報を追加して準備しましょう。',
    freeDoneDesc: '1回分の無料基礎解読はすでに生成されています。レポートを削除しても、この機会は元に戻りません。',
    fullReport: '完全版レポート', fullUnlocked: '完全版レポートのロックを解除済み', orders: '購入履歴',
    fullDesc: '任意の出生プロフィールについて詳細な解読を生成できます。', genFull: '完全版レポートを生成',
    orderPaid: '支払い済み', orderRefunded: '返金済み', orderPending: '処理中',
    savedReadings: '保存済みの解読', repOne: '件', repOther: '件',
    myReports: 'マイレポート', personUnit: '人', basicReading: '基本解読', fullReading: '完全版レポート', allPeople: 'すべて',
    notGenerated: '未生成', genBasic: '基本解読を作成', unlockFull: '完全版レポートを解除',
    noReadings: 'まだ解読はありません', noReadingsHint: '最初のレポートは、命盤を生成した後にここに表示されます。',
    fullReportLabel: '紫微完全版レポート', basicReportLabel: '紫微基礎解読',
    reportFailed: '生成失敗', reportPending: '生成中', reportCompleted: '完了', reportLocked: '返金により閉鎖', viewReport: '解読を見る',
    birthDetails: '出生情報', savedBirth: '保存済みの出生情報', profOne: '件', profOther: '件',
    noBirth: 'まだ出生情報は保存されていません。', addBirth: '出生情報を追加',
    yourData: 'あなたのデータ', deleteAccount: 'アカウントを削除', requestDelete: 'アカウント全体の削除を申請',
    deleteConfirmText: '確認のため DELETE と入力してください。個人データは削除されますが、法律上必要な注文記録は匿名化されて保持されます。',
    profileEyebrow: 'プロフィール', yourDetails: 'あなたの情報', memberSince: '登録日',
    displayName: '表示名', yourName: 'あなたのお名前', readingLanguage: '解読の言語',
    langHint: 'レポート生成に使用されます。画面の言語もこれに合わせて切り替わります。', savedCheck: '保存しました ✓', saveProfile: 'プロフィールを保存',
    privacy: 'プライバシー', privateByDesign: '設計からプライベート',
    priv1: 'レポートはあなたのアカウントに保存され、あなた自身だけが閲覧できます。',
    priv2: 'レポートを削除するとアカウントから削除され、無料回数は元に戻りません。',
    priv3: '一人につき1セット：同じ氏名・生年月日・出生地では2部目は生成されません。',
    delBirthConfirm: 'この出生情報を削除しますか？生成済みのレポートは残ります。',
    signOut: 'ログアウト',
  },
};

function fmtDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(LANG_META[lang].locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** 演示模式：本地报告没有服务端聚合，按同样的「人」口径在前端合并。 */
function personsFromLocalReports(rows: Report[], labels: { basic: string; full: string }): Person[] {
  const map = new Map<string, Person>();
  for (const r of rows) {
    const label = (r.profile?.label ?? '').trim() || (r.report_type === 'full' ? labels.full : labels.basic);
    const birthDate = r.profile?.birthDate ?? '';
    const birthPlace = r.profile?.birthPlace ?? '';
    const key = `${label}|${birthDate}|${birthPlace}`;
    let person = map.get(key);
    if (!person) {
      person = { key, label, birthDate, birthPlace, reports: [] };
      map.set(key, person);
    }
    person.reports.push({
      id: r.id,
      report_type: r.report_type,
      status: r.status ?? 'completed',
      created_at: r.created_at,
      locked: Boolean(r.locked),
      overview: r.content?.overview ?? null,
    });
  }
  return Array.from(map.values());
}

export default function AccountPage() {
  const { lang, setLang } = useLang();
  const s = S[lang];
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullUnlocked, setFullUnlocked] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  // 人物栏里选中的人；空串表示「全部」。
  const [selectedPerson, setSelectedPerson] = useState('');
  const [userProfile, setUserProfile] = useState<DemoUserProfile>({ displayName: '', preferredLanguage: 'zh', memberSince: '' });
  const [displayName, setDisplayName] = useState('');
  const [prefLang, setPrefLang] = useState<Lang>('zh');
  const [savedProfile, setSavedProfile] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode()) {
      const user = demoStore.getUser();
      if (!user) { router.replace('/auth?next=/account'); return; }
      setEmail(user.email ?? '');
      setPhone(user.phone ?? '');
      setPersons(personsFromLocalReports(demoStore.getReports() as Report[], {
        basic: S[lang].basicReading,
        full: S[lang].fullReading,
      }));
      const p = demoStore.getUserProfile();
      setUserProfile(p);
      setDisplayName(p.displayName);
      setPrefLang(p.preferredLanguage);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) { router.replace('/auth?next=/account'); return; }
      setEmail(user.email ?? '');
      setPhone((user.user_metadata?.phone as string) ?? '');
      const [fullEnt, ords, prof, personsRes] = await Promise.all([
        supabase.from('user_entitlements').select('status').eq('benefit_code', 'full_report').eq('status', 'available').maybeSingle(),
        supabase.from('orders').select('id, amount, currency, status, created_at').order('created_at', { ascending: false }),
        supabase.from('profiles').select('display_name, preferred_language, created_at').maybeSingle(),
        // 报告按「人」聚合：姓名 + 出生日期 + 地点相同的报告合成一个卡片。
        fetch('/api/account/persons').then((r) => (r.ok ? r.json() : { persons: [] })).catch(() => ({ persons: [] })),
      ]);
      setFullUnlocked(Boolean(fullEnt.data));
      setOrders((ords.data as Order[]) ?? []);
      setPersons(((personsRes as { persons?: Person[] }).persons ?? []) as Person[]);
      const pp = prof.data as { display_name?: string; preferred_language?: string; created_at?: string } | null;
      const ppLang = normalizeLang(pp?.preferred_language);
      setUserProfile({
        displayName: pp?.display_name ?? '',
        preferredLanguage: ppLang as DemoUserProfile['preferredLanguage'],
        memberSince: pp?.created_at ?? user.created_at,
      });
      setDisplayName(pp?.display_name ?? '');
      setPrefLang(ppLang);
      setLoading(false);
    });
  }, [router]);

  async function saveProfile() {
    const next = prefLang as DemoUserProfile['preferredLanguage'];
    if (isDemoMode()) {
      demoStore.setUserProfile({ displayName, preferredLanguage: next, memberSince: userProfile.memberSince || new Date().toISOString() });
      setUserProfile({ displayName, preferredLanguage: next, memberSince: userProfile.memberSince || new Date().toISOString() });
      if (prefLang !== lang) setLang(prefLang);
    } else {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName,
        preferred_language: prefLang,
        email: email || null,
        updated_at: new Date().toISOString(),
      });
      if (prefLang !== lang) setLang(prefLang);
    }
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2000);
  }

  async function deleteReport(id: string) {
    if (!window.confirm(t(lang, 'confirmDelete'))) return;
    const supabase = createClient();
    const { error } = await supabase.rpc('soft_delete_report', { p_report_id: id });
    if (error) { setError(t(lang, 'errorGeneric')); return; }
    setPersons((prev) => prev
      .map((p) => ({ ...p, reports: p.reports.filter((r) => r.id !== id) }))
      .filter((p) => p.reports.length > 0));
  }

  async function signOut() {
    if (isDemoMode()) demoStore.clearUser();
    else await createClient().auth.signOut();
    router.replace('/');
  }

  async function deleteAccount() {
    setBusy(true); setError('');
    const res = await fetch('/api/account/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'DELETE' }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || t(lang, 'errorGeneric'));
      setBusy(false);
      return;
    }
    if (isDemoMode()) {
      demoStore.clearUser();
      demoStore.resetEntitlement();
    } else {
      await createClient().auth.signOut();
    }
    router.replace('/');
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse px-5 pt-28 pb-20">
        <div className="h-3 w-16 rounded bg-line/70" />
        <div className="mt-4 h-9 w-72 max-w-full rounded bg-line/50" />
        <div className="mt-3 h-3 w-full max-w-xl rounded bg-line/40" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="h-48 rounded-2xl border border-line bg-ink/5" />
            <div className="h-64 rounded-2xl border border-line bg-ink/5" />
          </div>
          <div className="h-72 rounded-2xl border border-line bg-ink/5" />
        </div>
      </div>
    );
  }

  const memberSinceText = userProfile.memberSince ? fmtDate(userProfile.memberSince, lang) : '';
  // 选中某个人时只显示这个人的报告框；未选显示全部。
  const visiblePersons = selectedPerson ? persons.filter((p) => p.key === selectedPerson) : persons;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-28 pb-20">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{t(lang, 'account')}</p>
          <h1 className="mt-2 font-serif text-[40px] leading-[1.04] tracking-tight text-ink">
            {s.welcomeBack}{displayName ? `, ${displayName}` : ''}.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {s.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="link shrink-0 text-sm text-ink-muted hover:text-gold"
        >
          {s.signOut}
        </button>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {/* 完整报告权益 + 订单 */}
          {!isDemoMode() && (fullUnlocked || orders.length > 0) && (
            <section className="card p-7">
              <p className="eyebrow">{s.fullReport}</p>
              <h2 className="mt-2 font-serif text-2xl text-ink">
                {fullUnlocked ? s.fullUnlocked : s.orders}
              </h2>
              {fullUnlocked && (
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {s.fullDesc}{' '}
                  <Link href="/full-preview" className="link text-sm">{s.genFull} →</Link>
                </p>
              )}
              {orders.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-line pt-4">
                  {orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-ink-muted">
                        {fmtDate(o.created_at, lang)}
                        {' · '}{o.currency} {(o.amount).toFixed(2)}
                      </span>
                      <StatusBadge
                        label={o.status === 'paid' ? s.orderPaid : o.status === 'refunded' ? s.orderRefunded : s.orderPending}
                        tone={o.status === 'paid' ? 'completed' : o.status === 'refunded' ? 'consumed' : 'reserved'}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 我的报告：一个人一个框，基础与完整各一行 */}
          <section className="card p-7">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="eyebrow">{t(lang, 'reports')}</p>
                <h2 className="mt-1 font-serif text-2xl text-ink">{s.myReports}</h2>
              </div>
              <span className="text-xs text-ink-muted">{visiblePersons.length} {s.personUnit}</span>
            </div>
            {/* 人物栏：点谁只看谁的报告；末尾可添加新的出生资料 */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedPerson('')}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition ${selectedPerson === '' ? 'border-gold bg-gold/15 text-ink' : 'border-line text-ink-soft hover:border-gold/60'}`}
              >
                {s.allPeople}
              </button>
              {persons.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setSelectedPerson(p.key)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs transition ${selectedPerson === p.key ? 'border-gold bg-gold/15 text-ink' : 'border-line text-ink-soft hover:border-gold/60'}`}
                >
                  {p.label || s.basicReading}
                  {p.birthDate ? <span className="ml-1 text-ink-muted">{p.birthDate}</span> : null}
                </button>
              ))}
              <Link
                href="/chart/new"
                className="rounded-full border border-dashed border-line-strong px-3.5 py-1.5 text-xs text-ink-soft transition hover:border-gold hover:bg-gold/10 hover:text-ink"
              >
                ＋ {s.addBirth}
              </Link>
            </div>
            {visiblePersons.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-ink">{s.noReadings}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {s.noReadingsHint}
                </p>
                <Link href="/chart/new" className="link mt-4 inline-block text-sm">{s.genBasic} →</Link>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {visiblePersons.map((p) => {
                  const basic = p.reports.find((r) => r.report_type === 'basic');
                  const full = p.reports.find((r) => r.report_type === 'full');
                  const rows: { kind: 'basic' | 'full'; title: string; report?: PersonReport }[] = [
                    { kind: 'basic', title: s.basicReading, report: basic },
                    { kind: 'full', title: s.fullReading, report: full },
                  ];
                  return (
                    <article key={p.key} className="rounded-xl border border-line bg-ink/5 p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line/70 pb-3">
                        <p className="font-serif text-lg text-ink">{p.label}</p>
                        <p className="text-xs text-ink-muted">
                          {p.birthDate}{p.birthPlace ? ` · ${p.birthPlace}` : ''}
                        </p>
                      </div>
                      <div className="mt-3 space-y-2.5">
                        {rows.map((row) => (
                          <div key={row.kind} className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-ink">{row.title}</span>
                              {row.report ? (
                                <StatusBadge
                                  label={row.report.locked ? s.reportLocked : row.report.status === 'failed' ? s.reportFailed : row.report.status === 'pending' ? s.reportPending : s.reportCompleted}
                                  tone={row.report.locked || row.report.status === 'failed' ? 'consumed' : row.report.status === 'pending' ? 'reserved' : 'completed'}
                                />
                              ) : (
                                <span className="text-[11px] text-ink-muted">{s.notGenerated}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {row.report ? (
                                <>
                                  <Link href={`/report/${row.report.id}`} className="link text-sm">{s.viewReport}</Link>
                                  <button className="text-xs text-[#c4685a] underline decoration-[#c4685a]/40 underline-offset-4 hover:decoration-[#c4685a]" onClick={() => row.report && deleteReport(row.report.id)}>
                                    {t(lang, 'del')}
                                  </button>
                                </>
                              ) : row.kind === 'basic' ? (
                                <Link href="/chart/new" className="link text-sm">{s.genBasic} →</Link>
                              ) : fullUnlocked ? (
                                <Link href="/chart/new?full=1" className="link text-sm">{s.genFull} →</Link>
                              ) : (
                                <Link href="/full-preview" className="link text-sm">{s.unlockFull} →</Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {basic?.overview && (
                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-soft">{basic.overview}</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
            {fullUnlocked && (
              <Link
                href="/chart/new?full=1"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm font-medium text-ink-soft transition hover:border-gold hover:bg-gold/10 hover:text-ink"
              >
                <span className="text-lg leading-none">＋</span> {s.genFull}
              </Link>
            )}
          </section>

          {/* 删除账户 */}
          <section className="card border-plum/50 p-7">
            <p className="eyebrow text-[#c4685a]">{s.yourData}</p>
            <h2 className="mt-2 font-serif text-xl text-ink">{s.deleteAccount}</h2>
            {!confirmDelete ? (
              <button className="btn-ghost mt-4 px-4 py-2 text-sm text-[#c4685a]" onClick={() => setConfirmDelete(true)}>
                {s.requestDelete}
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm leading-relaxed text-ink-soft">
                  {s.deleteConfirmText}
                </p>
                <input className="input max-w-xs" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
                <button className="btn bg-plum text-sm" disabled={busy || confirmText !== 'DELETE'} onClick={deleteAccount}>DELETE</button>
              </div>
            )}
            {error && <p className="mt-3 text-sm text-[#c4685a]">{error}</p>}
          </section>
        </div>

        <aside className="space-y-6">
          {/* 账户信息（可编辑） */}
          <section className="card p-7">
            <p className="eyebrow">{s.profileEyebrow}</p>
            <h2 className="mt-2 font-serif text-2xl text-ink">{s.yourDetails}</h2>
            <div className="mt-5 space-y-4 border-t border-line pt-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{t(lang, 'emailTab')}</p>
                <p className="mt-1 break-all text-sm text-ink">{email || phone}</p>
                {memberSinceText && (
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {s.memberSince} {memberSinceText}
                  </p>
                )}
              </div>
              <div>
                <label className="label">{s.displayName}</label>
                <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={s.yourName} />
              </div>
              <div>
                <label className="label">{s.readingLanguage}</label>
                <select className="input" value={prefLang} onChange={(e) => setPrefLang(e.target.value as Lang)}>
                  {SUPPORTED_LANGS.map((l) => (
                    <option key={l} value={l}>{LANG_META[l].name}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
                  {s.langHint}
                </p>
              </div>
            </div>
            <button className="btn mt-5 w-full" onClick={saveProfile}>
              {savedProfile ? s.savedCheck : s.saveProfile}
            </button>
          </section>

          {/* 隐私说明 */}
          <section className="card p-7">
            <p className="eyebrow">{s.privacy}</p>
            <h2 className="mt-2 font-serif text-2xl text-ink">{s.privateByDesign}</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
              <p>{s.priv1}</p>
              <p>{s.priv2}</p>
              <p>{s.priv3}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
