'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { demoStore, isDemoMode, type DemoBirthProfile, type DemoUserProfile } from '@/lib/demo';
import { t, normalizeLang, LANG_META, SUPPORTED_LANGS, type Lang } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { StatusBadge, type BadgeTone } from '@/components/StatusBadge';

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

type Entitlement = { status: string };
type Order = { id: string; amount: number; currency: string; status: string; created_at: string };

type AccountStrings = {
  welcomeBack: string; subtitle: string;
  freeReading: string; freeAvail: string; freeDone: string; freeAvailDesc: string; freeDoneDesc: string;
  fullReport: string; fullUnlocked: string; orders: string; fullDesc: string; genFull: string;
  orderPaid: string; orderRefunded: string; orderPending: string;
  savedReadings: string; repOne: string; repOther: string;
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
    priv3: '出生资料可以随时删除，关联的命盘和报告会一并移除。',
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
    priv3: 'Birth details can be deleted at any time. Related charts and reports are removed with them.',
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
    priv3: 'Los datos de nacimiento se pueden eliminar en cualquier momento. Las cartas e informes asociados se eliminan con ellos.',
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
    priv3: 'Les données de naissance peuvent être supprimées à tout moment. Les thèmes et rapports associés sont supprimés en même temps.',
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
    priv3: 'Geburtsdaten können jederzeit gelöscht werden. Zugehörige Horoskope und Berichte werden dabei ebenfalls entfernt.',
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
    priv3: '出生情報はいつでも削除できます。関連する命盤とレポートも一緒に削除されます。',
    delBirthConfirm: 'この出生情報を削除しますか？生成済みのレポートは残ります。',
    signOut: 'ログアウト',
  },
};

function fmtDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(LANG_META[lang].locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AccountPage() {
  const { lang, setLang } = useLang();
  const s = S[lang];
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [fullUnlocked, setFullUnlocked] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [birthProfiles, setBirthProfiles] = useState<DemoBirthProfile[]>([]);
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
      setEntitlement({ status: demoStore.getEntitlement().status });
      setReports(demoStore.getReports() as Report[]);
      setBirthProfiles(demoStore.getBirthProfiles());
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
      const [ent, fullEnt, ords, reps, profiles, prof] = await Promise.all([
        supabase.from('user_entitlements').select('status').eq('benefit_code', 'free_basic_reading').maybeSingle(),
        supabase.from('user_entitlements').select('status').eq('benefit_code', 'full_report').eq('status', 'available').maybeSingle(),
        supabase.from('orders').select('id, amount, currency, status, created_at').order('created_at', { ascending: false }),
        supabase.rpc('list_my_reports'),
        supabase.from('birth_profiles').select('id, label, birth_date, birth_time, birth_time_known, birth_place, timezone, chart_preferences, created_at').order('created_at', { ascending: true }),
        supabase.from('profiles').select('display_name, preferred_language, created_at').maybeSingle(),
      ]);
      setEntitlement(ent.data as Entitlement | null);
      setFullUnlocked(Boolean(fullEnt.data));
      setOrders((ords.data as Order[]) ?? []);
      setReports(((reps.data as Record<string, unknown>[] | null) ?? []).map((r) => ({
        id: String(r.id),
        language: String(r.language),
        report_type: String(r.report_type),
        status: r.status ? String(r.status) : undefined,
        created_at: String(r.created_at),
        locked: Boolean(r.locked),
        content: r.overview ? { overview: String(r.overview) } : null,
      })));
      const pp = prof.data as { display_name?: string; preferred_language?: string; created_at?: string } | null;
      const ppLang = normalizeLang(pp?.preferred_language);
      setUserProfile({
        displayName: pp?.display_name ?? '',
        preferredLanguage: ppLang as DemoUserProfile['preferredLanguage'],
        memberSince: pp?.created_at ?? user.created_at,
      });
      setDisplayName(pp?.display_name ?? '');
      setPrefLang(ppLang);
      setBirthProfiles((profiles.data ?? []).map((r: Record<string, unknown>) => {
        const prefs = (r.chart_preferences ?? {}) as { gender?: string; longitude?: number | null };
        return {
          id: String(r.id),
          label: String(r.label),
          birthDate: String(r.birth_date),
          birthTime: String(r.birth_time ?? '12:00'),
          timeKnown: Boolean(r.birth_time_known),
          birthPlace: String(r.birth_place ?? ''),
          timezone: String(r.timezone),
          longitude: '',
          gender: (prefs.gender === 'female' ? 'female' : 'male') as 'male' | 'female',
          createdAt: String(r.created_at),
        };
      }) as DemoBirthProfile[]);
      setLoading(false);
    });
  }, [router]);

  const available = !entitlement || entitlement.status === 'available';
  const badgeTone: BadgeTone = available ? 'available' : entitlement?.status === 'reserved' ? 'reserved' : 'consumed';
  const statusText = () => {
    if (available) return t(lang, 'freeAvailable');
    if (entitlement?.status === 'reserved') return t(lang, 'freeReserved');
    return t(lang, 'freeUsed');
  };

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
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  async function deleteBirthProfile(id: string) {
    if (!window.confirm(s.delBirthConfirm)) return;
    if (isDemoMode()) {
      demoStore.deleteBirthProfile(id);
      setBirthProfiles((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from('birth_profiles').delete().eq('id', id);
    if (error) { setError(t(lang, 'errorGeneric')); return; }
    setBirthProfiles((prev) => prev.filter((p) => p.id !== id));
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
          {/* 免费额度 */}
          <section className="card p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{s.freeReading}</p>
                <h2 className="mt-2 font-serif text-2xl text-ink">
                  {available ? s.freeAvail : s.freeDone}
                </h2>
              </div>
              <StatusBadge label={statusText()} tone={badgeTone} />
            </div>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
              {available ? s.freeAvailDesc : s.freeDoneDesc}
            </p>
            {available && (
              <Link href="/chart/new" className="link mt-5 inline-block text-sm">
                {t(lang, 'start')} →
              </Link>
            )}
          </section>

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

          {/* 报告列表（带摘要） */}
          <section className="card p-7">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="eyebrow">{t(lang, 'reports')}</p>
                <h2 className="mt-1 font-serif text-2xl text-ink">{s.savedReadings}</h2>
              </div>
              <span className="text-xs text-ink-muted">{reports.length} {reports.length === 1 ? s.repOne : s.repOther}</span>
            </div>
            {reports.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-ink">{s.noReadings}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {s.noReadingsHint}
                </p>
                {available && <Link href="/chart/new" className="link mt-4 inline-block text-sm">{t(lang, 'start')} →</Link>}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="rounded-xl border border-line bg-ink/5 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-ink">
                            {r.profile?.label || (r.report_type === 'full'
                              ? s.fullReportLabel
                              : s.basicReportLabel)}
                          </p>
                          <StatusBadge
                            label={r.locked ? s.reportLocked : r.status === 'failed' ? s.reportFailed : r.status === 'pending' ? s.reportPending : s.reportCompleted}
                            tone={r.locked ? 'consumed' : r.status === 'failed' ? 'consumed' : r.status === 'pending' ? 'reserved' : 'completed'}
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {fmtDate(r.created_at, lang)}
                          {r.profile?.birthPlace ? ` · ${r.profile.birthPlace}` : ''} · {r.language}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/report/${r.id}`} className="link text-sm">{s.viewReport}</Link>
                        <button className="text-sm text-[#c4685a] underline decoration-[#c4685a]/40 underline-offset-4 hover:decoration-[#c4685a]" onClick={() => deleteReport(r.id)}>
                          {t(lang, 'del')}
                        </button>
                      </div>
                    </div>
                    {r.content?.overview && (
                      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">{r.content.overview}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 出生档案 */}
          <section className="card p-7">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="eyebrow">{s.birthDetails}</p>
                <h2 className="mt-1 font-serif text-2xl text-ink">{s.savedBirth}</h2>
              </div>
              <span className="text-xs text-ink-muted">{birthProfiles.length} {birthProfiles.length === 1 ? s.profOne : s.profOther}</span>
            </div>
            {birthProfiles.length === 0 ? (
              <p className="py-8 text-center text-xs text-ink-muted">{s.noBirth}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {birthProfiles.map((p) => (
                  <div key={p.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-ink/5 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{p.label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                        {p.gender === 'female' ? t(lang, 'female') : t(lang, 'male')} · {p.birthDate} · {p.timeKnown ? p.birthTime : t(lang, 'timeUnknown')} · {p.birthPlace}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">{p.timezone}</p>
                    </div>
                    <button
                      className="shrink-0 text-xs text-red-700 underline decoration-red-300 underline-offset-4 hover:decoration-red-600"
                      onClick={() => deleteBirthProfile(p.id)}
                    >
                      {t(lang, 'del')}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/chart/new"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm font-medium text-ink-soft transition hover:border-gold hover:bg-gold/10 hover:text-ink"
            >
              <span className="text-lg leading-none">＋</span> {s.addBirth}
            </Link>
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
