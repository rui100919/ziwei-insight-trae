'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { demoStore, isDemoMode } from '@/lib/demo';
import { t, LANG_META, PALACE_LABELS, palaceName, isLang, type Lang } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { StatusBadge } from '@/components/StatusBadge';
import { ChartBoard } from '@/components/ChartBoard';
import { ReportCoverDesktop, type CoverProps, type CoverText } from '@/components/report/ReportCoverDesktop';
import { ReportCoverMobile } from '@/components/report/ReportCoverMobile';
import { Starfield } from '@/components/oriental/Starfield';
import { trackEvent, E } from '@/lib/analytics';
import type { ChartView } from '@/lib/chart-preview';

type Profile = { label: string; birthDate: string; birthTime: string; birthPlace: string; timezone: string; timeKnown: boolean };
/** 兼容单语言新报告与旧双语报告：palaces / daXian / patterns 两种字段形态都接受。 */
type CompatPalace = { key: string; title?: string; titleZh?: string; titleEn?: string; text?: string; textZh?: string; textEn?: string };
type CompatDaXian = { label?: string; labelZh?: string; labelEn?: string; text?: string; textZh?: string; textEn?: string };
type CompatPatterns = { title?: string; titleZh?: string; titleEn?: string; text?: string; textZh?: string; textEn?: string; count?: number };
type ReportContent = {
  overview?: string;
  personality?: string;
  strengths?: string;
  caveats?: string;
  palaces?: CompatPalace[];
  daXian?: CompatDaXian[];
  patterns?: CompatPatterns;
  currentPhase?: string;
  oneLine?: string;
  topics?: { key: string; title: string; text: string }[];
  strength?: { text: string };
};
type Report = {
  id: string;
  language: string;
  report_type?: string;
  status?: string;
  content: ReportContent | null;
  created_at: string;
  profile?: Profile;
  chart?: ChartView | null;
};

/** 报告页局部文案（字典里没有的条目），六语言各自独立翻译。 */
type ReportStrings = {
  chart: string; backToAccount: string;
  statusFailed: string; statusProcessing: string; statusCompleted: string;
  fullReportTitle: string; basicReportTitle: string;
  savedToAccount: string; savedLocally: string; savePdf: string; deleteReport: string;
  demoReport: string; anonReportNote: string; entitlement: string;
};
const S: Record<Lang, ReportStrings> = {
  zh: { chart: '命盘', backToAccount: '返回账户', statusFailed: '生成失败', statusProcessing: '生成中', statusCompleted: '已完成', fullReportTitle: '紫微完整报告', basicReportTitle: '紫微基础解读', savedToAccount: '已保存在你的账户中', savedLocally: '已保存在当前浏览器', savePdf: '保存为 PDF', deleteReport: '删除报告', demoReport: '演示报告：命盘由真实引擎计算、数据已入库，但文字由本地示例模板生成。接入 AI 密钥后即为完整解读。', anonReportNote: '这份基础解读只保存在当前浏览器。登录后可保存到账户，并解锁逐宫展开的完整报告。', entitlement: '内容根据你的出生时间地点推算，用大白话写成。仅供自我了解与文化研究，不是预言，也不构成任何建议。' },
  en: { chart: 'Chart', backToAccount: 'My account', statusFailed: 'Failed', statusProcessing: 'Processing', statusCompleted: 'Completed', fullReportTitle: 'Zi Wei full report', basicReportTitle: 'Zi Wei basic reading', savedToAccount: 'Saved to your account', savedLocally: 'Saved in this browser', savePdf: 'Save as PDF', deleteReport: 'Delete report', demoReport: 'Demo report: the real chart and database were used, but the text came from a local template. Add an AI key for full interpretation.', anonReportNote: 'This basic reading is stored only in this browser. Sign in to save it to your account and unlock the full report.', entitlement: 'Written in plain language from your birth time and place. For self-reflection and cultural research only — not a prediction or advice.' },
  es: { chart: 'Carta', backToAccount: 'Mi cuenta', statusFailed: 'Fallido', statusProcessing: 'Procesando', statusCompleted: 'Completado', fullReportTitle: 'Informe completo de Zi Wei', basicReportTitle: 'Lectura básica de Zi Wei', savedToAccount: 'Guardado en tu cuenta', savedLocally: 'Guardado en este navegador', savePdf: 'Guardar como PDF', deleteReport: 'Eliminar informe', demoReport: 'Informe de demostración: la carta y la base de datos son reales, pero el texto proviene de una plantilla local. Añade una clave de IA para obtener la interpretación completa.', anonReportNote: 'Esta lectura básica solo se guarda en este navegador. Inicia sesión para guardarla en tu cuenta y desbloquear el informe completo.', entitlement: 'Elaborado en lenguaje sencillo a partir de tu hora y lugar de nacimiento. Solo para autoconocimiento e investigación cultural; no es una predicción ni un consejo.' },
  fr: { chart: 'Thème', backToAccount: 'Mon compte', statusFailed: 'Échec', statusProcessing: 'En cours', statusCompleted: 'Terminé', fullReportTitle: 'Rapport complet Zi Wei', basicReportTitle: 'Lecture de base Zi Wei', savedToAccount: 'Enregistré dans votre compte', savedLocally: 'Enregistré dans ce navigateur', savePdf: 'Enregistrer en PDF', deleteReport: 'Supprimer le rapport', demoReport: 'Rapport de démonstration : le thème et la base de données sont réels, mais le texte provient d’un modèle local. Ajoutez une clé d’IA pour l’interprétation complète.', anonReportNote: 'Cette lecture de base n’est enregistrée que dans ce navigateur. Connectez-vous pour l’enregistrer dans votre compte et débloquer le rapport complet.', entitlement: 'Rédigé en langage simple à partir de votre heure et lieu de naissance. Pour la réflexion personnelle et la recherche culturelle uniquement — pas une prédiction ni un conseil.' },
  de: { chart: 'Horoskop', backToAccount: 'Mein Konto', statusFailed: 'Fehlgeschlagen', statusProcessing: 'In Bearbeitung', statusCompleted: 'Abgeschlossen', fullReportTitle: 'Zi Wei Vollbericht', basicReportTitle: 'Zi Wei Basisdeutung', savedToAccount: 'In deinem Konto gespeichert', savedLocally: 'In diesem Browser gespeichert', savePdf: 'Als PDF speichern', deleteReport: 'Bericht löschen', demoReport: 'Demo-Bericht: Das Horoskop und die Datenbank sind echt, aber der Text stammt aus einer lokalen Vorlage. Füge einen KI-Schlüssel hinzu für die vollständige Deutung.', anonReportNote: 'Diese Basisdeutung wird nur in diesem Browser gespeichert. Melde dich an, um sie in deinem Konto zu speichern und den Vollbericht freizuschalten.', entitlement: 'In einfacher Sprache aus deiner Geburtszeit und deinem Geburtsort erstellt. Nur zur Selbstreflexion und kulturellen Forschung — keine Vorhersage oder Beratung.' },
  ja: { chart: '命盤', backToAccount: 'アカウントに戻る', statusFailed: '生成失敗', statusProcessing: '生成中', statusCompleted: '完了', fullReportTitle: '紫微完全版レポート', basicReportTitle: '紫微基礎解読', savedToAccount: 'アカウントに保存済みです', savedLocally: 'このブラウザに保存済み', savePdf: 'PDFとして保存', deleteReport: 'レポートを削除', demoReport: 'デモレポート：命盤は実際のエンジンで計算されデータも保存されていますが、文章はローカルのテンプレートで生成されています。AIキーを設定すると完全な解読になります。', anonReportNote: 'この基礎解読は現在のブラウザにのみ保存されています。ログインするとアカウントに保存し、完全版レポートを解除できます。', entitlement: '出生時刻と場所に基づいて平易な言葉で記述されています。自己理解と文化研究のみを目的とし、予測や助言ではありません。' },
};

/**
 * 报告内容的语言以 report.language 为准，不随 UI 语言切换而重建（避免破坏已付费的历史报告）。
 * 新报告优先读单语言字段（title/text/label）；旧双语报告按 report.language 回退到 *Zh/*En。
 */
function pickLegacy(rl: Lang, zh?: string, en?: string): string {
  return rl === 'zh' ? (zh ?? '') : (en ?? '');
}
const palaceTitle = (p: CompatPalace, rl: Lang) => p.title ?? pickLegacy(rl, p.titleZh, p.titleEn);
const palaceText = (p: CompatPalace, rl: Lang) => p.text ?? pickLegacy(rl, p.textZh, p.textEn);
const daXianLabel = (d: CompatDaXian, rl: Lang) => d.label ?? pickLegacy(rl, d.labelZh, d.labelEn);
const daXianText = (d: CompatDaXian, rl: Lang) => d.text ?? pickLegacy(rl, d.textZh, d.textEn);
const patternsTitle = (p: CompatPatterns, rl: Lang) => p.title ?? pickLegacy(rl, p.titleZh, p.titleEn);
const patternsText = (p: CompatPatterns, rl: Lang) => p.text ?? pickLegacy(rl, p.textZh, p.textEn);

/** 依据虚岁定位当前大限（仅用于高亮，不改动数据/兼容/权益逻辑）。 */
function currentDaXianIndex(daXian: { label: string }[], currentAge?: number): number {
  if (!currentAge || !daXian.length) return -1;
  for (let i = 0; i < daXian.length; i++) {
    const nums = daXian[i].label.match(/\d+/g);
    if (!nums || nums.length < 2) continue;
    const start = Number(nums[0]);
    const end = Number(nums[1]);
    if (currentAge >= start && currentAge <= end) return i;
  }
  return -1;
}
const pad = (n: number) => String(n).padStart(2, '0');

export default function ReportPage() {
  const { lang } = useLang();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  /** 报告仅存在于浏览器本地（未登录访客生成的基础解读）。 */
  const [localOnly, setLocalOnly] = useState(false);
  /** 命盘是否完整版（服务端按权益裁剪，前端只读结果）。 */
  const [chartFull, setChartFull] = useState(false);
  /** 报告因订单退款被关闭（区别于普通加载失败）。 */
  const [locked, setLocked] = useState(false);
  const [pay, setPay] = useState<{ isDemo: boolean; paymentsEnabled: boolean; provider?: string; loggedIn: boolean; unlocked: boolean } | null>(null);
  // 排障用：地址带 ?diag=1 时在页面底部显示渲染自检信息（默认不显示）。
  const [diag, setDiag] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  // 内容语言以报告生成时的 report.language 为准——UI 切语言只换界面文案，不重建已付费报告。
  const rl: Lang = report && isLang(report.language) ? report.language : 'zh';
  const L = (k: keyof ReportStrings) => S[lang][k];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!new URLSearchParams(window.location.search).has('diag')) return;
    const errs: string[] = [];
    const onErr = (e: ErrorEvent) => errs.push(String(e.message).slice(0, 80));
    window.addEventListener('error', onErr);
    const timer = window.setTimeout(() => {
      const chs = document.querySelectorAll('.chapter');
      const first = chs[0] as HTMLElement | undefined;
      const cs = first ? getComputedStyle(first) : null;
      const rep = document.querySelector('.report') as HTMLElement | null;
      setDiag([
        `viewport=${window.innerWidth}x${window.innerHeight} dpr=${window.devicePixelRatio}`,
        `chapters=${chs.length}`,
        `firstOpacity=${cs?.opacity} color=${cs?.color} display=${cs?.display}`,
        `reportBg=${rep ? getComputedStyle(rep).backgroundColor : '-'}`,
        `paperVar=${getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || 'undefined'}`,
        `dark=${window.matchMedia('(prefers-color-scheme: dark)').matches} htmlClass=${document.documentElement.className || '-'}`,
        `textLen=${(document.body.innerText || '').length}`,
        `type=${report?.report_type ?? '-'}`,
        `palaces=${Array.isArray((report?.content as { palaces?: unknown[] })?.palaces) ? (report!.content as { palaces: unknown[] }).palaces.length : '-'}`,
        `errs=${errs.length ? errs.join(';') : 'none'}`,
      ].join(' | '));
    }, 3000);
    return () => { clearTimeout(timer); window.removeEventListener('error', onErr); };
  }, [report]);

  useEffect(() => {
    // 未登录访客的基础解读只存在浏览器本地：优先读本地，命中就不再请求服务端。
    const local = demoStore.getReport(id);
    if (local) {
      setReport(local as Report);
      setLocalOnly(true);
      // 演示模式本地库里有完整盘面；未登录访客的本地报告只存预览盘。
      setChartFull(isDemoMode());
      return;
    }
    if (isDemoMode()) {
      setError(t(lang, 'errorGeneric'));
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace(`/auth?next=${encodeURIComponent(`/report/${id}`)}`); return; }
      const { data: row, error } = await supabase
        .from('reports')
        .select('id, language, report_type, status, content, created_at')
        .eq('id', id)
        .maybeSingle();
      if (error || !row) {
        // 报告行被 RLS 隐藏时，再问一次是「不存在」还是「退款关闭」。
        const { data: state } = await supabase.rpc('report_access_state', { p_report_id: id });
        const isLocked = state === 'locked';
        setLocked(isLocked);
        setError(t(lang, isLocked ? 'reportLocked' : 'errorGeneric'));
      } else {
        const raw = row as unknown as Record<string, unknown>;
        // 盘面与出生档案走服务端接口：已生成的完整解读本人可看完整盘面，
        // 基础解读仍按权益裁剪成预览盘。
        type ChartPayload = {
          full?: boolean;
          chart?: ChartView | null;
          profile?: {
            label?: string; birthDate?: string; birthTime?: string | null;
            timeKnown?: boolean; birthPlace?: string; timezone?: string;
          } | null;
        };
        let payload: ChartPayload | null = null;
        try {
          const res = await fetch(`/api/report/chart?report=${encodeURIComponent(id)}`);
          if (res.ok) payload = (await res.json()) as ChartPayload;
        } catch {
          payload = null;
        }
        if (!payload) {
          const { data: view } = await supabase.rpc('get_report_chart', { p_report_id: id });
          payload = (view ?? null) as ChartPayload | null;
        }
        const bp = payload?.profile ?? null;
        setChartFull(Boolean(payload?.full));
        setReport({
          id: String(raw.id),
          language: String(raw.language),
          report_type: raw.report_type ? String(raw.report_type) : undefined,
          status: raw.status ? String(raw.status) : undefined,
          content: raw.content as Report['content'],
          created_at: String(raw.created_at),
          chart: (payload?.chart ?? null) as ChartView | null,
          profile: bp ? {
            label: bp.label ?? '',
            birthDate: bp.birthDate ?? '',
            birthTime: bp.birthTime ?? '',
            birthPlace: bp.birthPlace ?? '',
            timezone: bp.timezone ?? '',
            timeKnown: Boolean(bp.timeKnown),
          } : undefined,
        });
      }
    });
  }, [id, lang, router]);

  // 权益状态：决定基础报告显示「锁定区」还是「完整版入口」，不参与报告内容渲染。
  useEffect(() => {
    let alive = true;
    fetch('/api/payment/entitlement')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) {
          setPay(d);
          // 漏斗埋点：未解锁且未拥有完整版 → 用户看到了付费墙
          if (!d.unlocked && d.paymentsEnabled) {
            trackEvent(E.PAYWALL_SEEN, { provider: d.provider || 'unknown' });
          }
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  /** 已解锁用户：用本报告自己的出生资料生成完整报告，权益由服务端再次校验。 */
  async function upgradeToFull() {
    if (upgrading) return;
    setUpgrading(true);
    setError('');
    try {
      const res = await fetch('/api/report/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: id }),
      });
      const data = await res.json();
      if (res.ok && data.reportId) {
        router.push(`/report/${data.reportId}?v=4`);
        return;
      }
      setError(data.error === 'PAYMENT_REQUIRED' ? t(lang, 'buyIntro') : t(lang, 'errorGeneric'));
    } catch {
      setError(t(lang, 'errorGeneric'));
    } finally {
      setUpgrading(false);
    }
  }

  // 打印/导出 PDF 前展开所有折叠宫位：浏览器只打印已展开的 details 正文，
  // 否则 PDF 里会只剩宫位标题、下面一片空白。
  useEffect(() => {
    const opened: HTMLDetailsElement[] = [];
    const before = () => {
      document.querySelectorAll<HTMLDetailsElement>('details').forEach((d) => {
        if (!d.open) { d.open = true; opened.push(d); }
      });
    };
    const after = () => { opened.splice(0).forEach((d) => { d.open = false; }); };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  async function deleteReport() {
    if (!window.confirm(t(lang, 'confirmDelete'))) return;
    // 本地报告（演示 / 未登录访客）只能从浏览器删除，没有服务端记录可删。
    if (isDemoMode() || localOnly) {
      demoStore.deleteReport(id);
      router.replace(isDemoMode() ? '/account?v=3' : '/');
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.rpc('soft_delete_report', { p_report_id: id });
    if (error) { setError(error.message); return; }
    router.replace('/account?v=3');
  }

  // 解锁 CTA 走真实支付：复用现有结账发起逻辑（Dodo / 默认 checkout），不使用原型假解锁。
  async function buy() {
    setBuying(true);
    setError('');
    trackEvent(E.PAYMENT_START, { provider: pay?.provider || 'unknown' });
    try {
      const endpoint = pay?.provider === 'dodo' ? '/api/dodo/checkout' : '/api/checkout';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'full_report' }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error === 'NEED_LOGIN') {
        // 只有解锁完整版才要求登录：引导登录，回跳后继续结账。
        router.push(`/auth?next=${encodeURIComponent(`/report/${id}`)}`);
        return;
      } else if (data.error === 'PAYMENTS_NOT_CONFIGURED' || data.error === 'DEMO_MODE') setError(t(lang, 'buyUnavailable'));
      else setError(t(lang, 'buyError'));
    } catch {
      setError(t(lang, 'buyError'));
    } finally {
      setBuying(false);
    }
  }

  const isFull = report?.report_type === 'full';
  const fullContent = isFull ? report?.content : null;
  const sections = report?.content
    ? [
        ['overview', t(lang, 'overview'), report.content.overview],
        ['personality', t(lang, 'personality'), report.content.personality],
        ...(!isFull ? [
          ['strengths', t(lang, 'strengths'), report.content.strengths],
          ['caveats', t(lang, 'caveats'), report.content.caveats],
        ] : []),
      ].filter(([, , v]) => Boolean(v))
    : [];

  const linkedPalaces = new Set((fullContent?.palaces ?? []).map((p) => p.key));

  // 仅用于展示的派生值（不改动任何数据获取 / 兼容 / 权益逻辑）。
  const nSec = sections.length;
  // 章节编号按实际渲染顺序连续递增，新增章节时无需手改数字。
  const chNo: Record<string, string> = (() => {
    let c = nSec;
    const out: Record<string, string> = {};
    const add = (id: string, present: boolean) => {
      if (present) out[id] = pad(++c);
    };
    add('oneline', Boolean(fullContent?.oneLine));
    add('palaces', Boolean(fullContent?.palaces?.length));
    add('topics', Boolean(fullContent?.topics?.length));
    add('daxian', Boolean(fullContent?.daXian?.length));
    add('patterns', Boolean(fullContent?.patterns?.text));
    add('strength', Boolean(fullContent?.strength?.text));
    out.caveats = pad(++c);
    return out;
  })();
  const dateStr = report
    ? new Date(report.created_at).toLocaleDateString(LANG_META[lang].locale, { year: 'numeric', month: 'short', day: 'numeric' })
    : '';
  const reportYear = report ? String(new Date(report.created_at).getFullYear()) : '';
  const curDaXian = fullContent?.daXian?.length
    ? currentDaXianIndex(fullContent.daXian.map((d) => ({ label: daXianLabel(d, rl) })), report?.chart?.currentAge)
    : -1;
  const coverMeta: string[] = report
    ? (() => {
        const parts: string[] = [t(lang, 'readingGeneratedAt').replace('{date}', dateStr)];
        if (isFull) {
          if (report.profile?.label) parts.push(report.profile.label);
          if (report.profile?.birthDate) parts.push(report.profile.birthDate);
          if (report.profile?.timeKnown && report.profile?.birthTime) parts.push(report.profile.birthTime);
          if (report.profile?.birthPlace) parts.push(report.profile.birthPlace);
        }
        parts.push(t(lang, 'readingReportId').replace('{id}', report.id.slice(0, 8).toUpperCase()));
        return parts;
      })()
    : [];

  // 封面文案只算一次，电脑与手机两套封面共用（components/report/）。
  const coverText: CoverText = {
    eyebrow: isFull ? L('fullReportTitle') : L('basicReportTitle'),
    title: isFull ? t(lang, 'fullCoverTitle') : t(lang, 'readingCoverTitle'),
    dedication: isFull && report?.profile?.label
      ? t(lang, 'coverDedication').replace('{name}', report.profile.label)
      : undefined,
    intro: isFull ? t(lang, 'fullCoverIntro') : t(lang, 'readingCoverIntro'),
    archive: isFull && report
      ? `${t(lang, 'metaArchive')} · ZW-${reportYear}-${report.id.slice(0, 8).toUpperCase()}`
      : undefined,
    statusLabel: report?.status === 'failed' ? L('statusFailed') : report?.status === 'pending' ? L('statusProcessing') : L('statusCompleted'),
    statusTone: report?.status === 'failed' ? 'consumed' : report?.status === 'pending' ? 'reserved' : 'completed',
    backLabel: t(lang, 'back'),
    note: isFull ? undefined : t(lang, 'readingCoverNote'),
    sealChars: t(lang, 'sealChars').split(/\s+/),
    medalCap: t(lang, 'readingMedalCap'),
    medalYear: reportYear,
  };
  const coverProps: CoverProps = {
    text: coverText,
    meta: coverMeta,
    isFull,
    palaceLabels: PALACE_LABELS[rl],
  };

  return (
    <>
      {diag && (
        <div
          style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
            background: '#fffbe8', color: '#111', font: '12px/1.5 monospace',
            padding: '8px 12px', borderTop: '2px solid #f0c040', whiteSpace: 'pre-wrap',
          }}
        >
          {diag}
        </div>
      )}
      {/* 加载中 */}
      {!report && !error && (
        <section className="cover" data-reveal>
          <div className="cover-bg" aria-hidden="true" />
          <Starfield />
          <div className="wrap cover-inner">
            <div className="intro">
              <p className="eyebrow">{t(lang, 'reports')}</p>
              <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-ink/10" />
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-ink/10" />
            </div>
          </div>
        </section>
      )}

      {/* 加载失败 / 未找到 */}
      {!report && error && (
        <section className="cover" data-reveal>
          <div className="cover-bg" aria-hidden="true" />
          <Starfield />
          <div className="wrap cover-inner">
            <p className="eyebrow">{t(lang, 'reports')}</p>
            <h1>{locked ? t(lang, 'reportLockedTitle') : t(lang, 'errorGeneric')}</h1>
            <p className="intro">{error}</p>
            <div className="cover-actions">
              <Link className="btn-ghost" href="/account?v=3">{L('backToAccount')}</Link>
            </div>
          </div>
        </section>
      )}

      {report && (
        <>
          {/* 深色封面：电脑与手机各一套结构，见 components/report/ */}
          <ReportCoverDesktop {...coverProps} />
          <ReportCoverMobile {...coverProps} />

          {/* 02 排盘资料与确认项：区分已确认输入、依赖时辰的判断与倾向性解释 */}
          {isFull && report.profile && (
            <section className="meta-panel" data-reveal>
              <div className="wrap">
                <p className="eyebrow">{t(lang, 'metaTitle')}</p>
                <div className="meta-grid">
                  {report.profile.birthDate && (
                    <div className="meta-cell">
                      <b>{report.profile.birthDate}</b>
                      <span>{t(lang, 'reportGregorian')}</span>
                    </div>
                  )}
                  <div className="meta-cell">
                    <b>{report.profile.timeKnown && report.profile.birthTime ? report.profile.birthTime : '—'}</b>
                    <span>{t(lang, 'birthTime')}</span>
                  </div>
                  {report.profile.birthPlace && (
                    <div className="meta-cell">
                      <b>{report.profile.birthPlace}</b>
                      <span>{report.profile.timezone}</span>
                    </div>
                  )}
                  <div className="meta-cell">
                    <b>ZW-{reportYear}-{report.id.slice(0, 8).toUpperCase()}</b>
                    <span>{t(lang, 'metaArchive')}</span>
                  </div>
                </div>
                <p className={`meta-note${report.profile.timeKnown === false ? ' warn' : ''}`}>
                  {report.profile.timeKnown === false ? t(lang, 'metaTimeUnknown') : t(lang, 'metaTimeKnown')}
                </p>
                <p className="meta-sub">{t(lang, 'metaDepends')}</p>
                <p className="meta-sub">{t(lang, 'metaInterpretation')}</p>
              </div>
            </section>
          )}

          {/* 开篇说明：整份报告只在这里讲一次"如何看待它" */}
          {isFull && (
            <section className="prenote" data-reveal>
              <div className="wrap">
                <p className="prenote-kicker">{t(lang, 'noteTitle')}</p>
                <h2 className="prenote-head">{t(lang, 'noteHeadline')}</h2>
                <p className="prenote-body">{t(lang, 'noteBody')}</p>
              </div>
            </section>
          )}

          {report.chart && (
            <section id="chart" className="bg-paper scroll-mt-24" data-reveal>
              <div className="wrap py-10">
                <ChartBoard
                  chart={report.chart}
                  lang={lang}
                  linkedPalaces={chartFull && linkedPalaces.size ? linkedPalaces : undefined}
                />
                {/* 未解锁：盘面只显示十二宫骨架与主星，完整星曜在购买后由服务端下发。 */}
                {!chartFull && (
                  <div className="locked mt-8" data-reveal>
                    <div className="lock-header">
                      <p className="eyebrow">{t(lang, 'chartPreviewLocked')}</p>
                      <h3>{t(lang, 'chartPaywallTitle')}</h3>
                      <p>{t(lang, 'chartPaywallDesc')}</p>
                    </div>
                    <div className="locked-actions">
                      <button className="btn" onClick={buy} disabled={buying}>
                        {buying ? t(lang, 'payOverlaySub') : t(lang, 'chartPaywallCta')}
                      </button>
                      <Link className="btn-ghost" href="/full-preview?v=3">{t(lang, 'lockedCtaSample')}</Link>
                    </div>
                    <p className="fine">
                      {t(lang, 'chartPaywallPrice')} · {t(lang, 'chartPaywallOneTime')}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 浅色宣纸报告正文：整段不要 data-reveal——区块极高，12% 阈值永远达不到，
              会一直停在 opacity:0，深色底上看起来就是整页没有文字。 */}
          <section className="report">
            <div className="report-wrap">
              <div className="birth">
                <div>
                  <h2>{t(lang, 'chartFormAria')}</h2>
                  <div className="vals">
                    {report.profile?.birthDate && (
                      <span className="v"><b>{report.profile.birthDate}</b><span>{t(lang, 'reportGregorian')}</span></span>
                    )}
                    {report.profile?.timeKnown && report.profile?.birthTime && (
                      <span className="v"><b>{report.profile.birthTime}</b><span>{t(lang, 'birthTime')}</span></span>
                    )}
                    {report.profile?.birthPlace && (
                      <span className="v"><b>{report.profile.birthPlace}</b><span>{report.profile.timezone}</span></span>
                    )}
                    {report.profile?.label && (
                      <span className="v"><b>{report.profile.label}</b><span>{LANG_META[rl].name}</span></span>
                    )}
                  </div>
                </div>
                <Link className="edit" href="/chart/new?v=3">{t(lang, 'reportEditBirth')}</Link>
              </div>

              {error && (
                <div className="rounded-lg border border-[rgba(244,238,225,.18)] bg-[rgba(244,238,225,.04)] px-4 py-3 text-sm print:hidden">{error}</div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[rgba(244,238,225,.18)] py-3 print:hidden">
                <p className="fineprint">{localOnly ? L('savedLocally') : L('savedToAccount')}</p>
                <div className="flex items-center gap-4">
                  <button
                    className="text-sm text-[rgba(244,238,225,.72)] underline underline-offset-4 decoration-[rgba(244,238,225,.3)] hover:text-gold hover:decoration-gold"
                    onClick={() => window.print()}
                  >
                    {L('savePdf')}
                  </button>
                  <button
                    className="text-sm text-[rgba(244,238,225,.72)] underline underline-offset-4 decoration-[rgba(244,238,225,.3)] hover:text-gold hover:decoration-gold"
                    onClick={deleteReport}
                  >
                    {L('deleteReport')}
                  </button>
                </div>
              </div>

              {isDemoMode() ? (
                <p className="fineprint">{L('demoReport')}</p>
              ) : localOnly ? (
                <p className="fineprint">{L('anonReportNote')}</p>
              ) : null}

              <article>
                {sections.map(([anchor, title, value], i) => (
                  <section className="chapter" id={anchor} key={anchor}>
                    <div className="ch-head">
                      <span className="ch-no">{pad(i + 1)}</span>
                      <h2>{title}</h2>
                    </div>
                    <div className="ch-body">
                      <p className="whitespace-pre-wrap">{value}</p>
                    </div>
                  </section>
                ))}

                {isFull && fullContent?.oneLine && (
                  <section className="chapter" id="oneline">
                    <div className="ch-head">
                      <span className="ch-no">{chNo.oneline}</span>
                      <h2>{t(lang, 'fullOneLine')}</h2>
                    </div>
                    <div className="ch-body">
                      <p className="whitespace-pre-wrap">{fullContent.oneLine}</p>
                    </div>
                  </section>
                )}

                {isFull && fullContent?.palaces && fullContent.palaces.length > 0 && (
                  <section className="chapter" id="palaces">
                    <div className="ch-head">
                      <span className="ch-no">{chNo.palaces}</span>
                      <h2>{t(lang, 'fullPalaces')}</h2>
                    </div>
                    <div className="ch-body">
                      {fullContent.palaces.map((p, i) => (
                        <details
                          className="palace"
                          key={p.key}
                          id={`palace-${p.key}`}
                          open
                        >
                          <summary>
                            <span className="pno">{pad(i + 1)}</span>
                            <span className="pt"><b>{palaceName(p.key, rl)}</b>{palaceTitle(p, rl)}</span>
                            <span className="pm" aria-hidden="true" />
                          </summary>
                          <div className="body">
                            <p className="whitespace-pre-wrap">{palaceText(p, rl)}</p>
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                {isFull && fullContent?.topics && fullContent.topics.length > 0 && (
                  <section className="chapter" id="topics">
                    <div className="ch-head">
                      <span className="ch-no">{chNo.topics}</span>
                      <h2>{t(lang, 'fullTopics')}</h2>
                    </div>
                    <div className="ch-body">
                      {fullContent.topics.map((tp) => (
                        <div className="topic" key={tp.key}>
                          <h3 className="topic-title">{tp.title}</h3>
                          <p className="whitespace-pre-wrap">{tp.text}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {isFull && fullContent?.daXian && fullContent.daXian.length > 0 && (
                  <section className="chapter" id="daxian">
                    <div className="ch-head">
                      <span className="ch-no">{chNo.daxian}</span>
                      <h2>{t(lang, 'fullDaXian')}</h2>
                    </div>
                    <div className="ch-body">
                      <p className="fine">{t(lang, 'fullDaXianNote')}</p>
                      <div className="decades">
                        {fullContent.daXian.map((d, i) => {
                          const [agePart, ...rest] = daXianLabel(d, rl).split(' · ');
                          const palPart = rest.join(' · ');
                          return (
                            <div key={i} className={`decade${i === curDaXian ? ' current' : ''}`}>
                              <span className="age">{agePart}</span>
                              <span className="pal">{palPart}</span>
                              <span className="theme whitespace-pre-wrap">{daXianText(d, rl)}</span>
                              <span className="mark">{i === curDaXian ? t(lang, 'decadeMarkCurrent') : ''}</span>
                            </div>
                          );
                        })}
                      </div>
                      {fullContent.currentPhase && (
                        <div className="now" id="current">
                          <span className="cap">{t(lang, 'fullCurrent')}</span>
                          <p className="whitespace-pre-wrap">{fullContent.currentPhase}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {isFull && fullContent?.patterns && (
                  <section className="chapter" id="patterns">
                    <div className="ch-head">
                      <span className="ch-no">{chNo.patterns}</span>
                      <h2>{patternsTitle(fullContent.patterns, rl)}</h2>
                    </div>
                    <div className="ch-body">
                      <p className="whitespace-pre-wrap">{patternsText(fullContent.patterns, rl)}</p>
                    </div>
                  </section>
                )}

                {isFull && fullContent?.strength?.text && (
                  <section className="chapter" id="strength">
                    <div className="ch-head">
                      <span className="ch-no">{chNo.strength}</span>
                      <h2>{t(lang, 'fullStrength')}</h2>
                    </div>
                    <div className="ch-body">
                      <p className="whitespace-pre-wrap">{fullContent.strength.text}</p>
                    </div>
                  </section>
                )}

                {isFull && fullContent?.caveats && (
                  <section className="chapter" id="caveats">
                    <div className="ch-head">
                      <span className="ch-no">{chNo.caveats}</span>
                      <h2>{t(lang, 'caveats')}</h2>
                    </div>
                    <div className="ch-body">
                      <p className="whitespace-pre-wrap">{fullContent.caveats}</p>
                    </div>
                  </section>
                )}

                {isFull && (
                  <section className="colophon">
                    <div className="colo-seal" aria-hidden="true">
                      {t(lang, 'sealChars')
                        .split(/\s+/)
                        .map((c, i) => (
                          <span key={i}>{c}</span>
                        ))}
                    </div>
                    <p className="colo-line">{t(lang, 'colophonLine')}</p>
                    <p className="colo-note">{t(lang, 'colophonNote')}</p>
                    <div className="colo-foot">
                      <span>{t(lang, 'brand')}</span>
                      <i aria-hidden="true" />
                      <span>{dateStr}</span>
                    </div>
                  </section>
                )}

                {/* 基础报告：未拥有完整版 → 锁定区 + 真实支付 CTA；已拥有 → 完整版入口 */}
                {!isFull &&
                  (pay?.unlocked ? (
                    <div className="unlock" data-reveal>
                      <p className="eyebrow">{t(lang, 'reportFullReadingLabel')}</p>
                      <h2>{t(lang, 'unlockedTitle')}</h2>
                      <p>{t(lang, 'unlockedBody')}</p>
                      <div className="unlock-actions">
                        <button className="btn" onClick={upgradeToFull} disabled={upgrading}>
                          {upgrading ? t(lang, 'payOverlaySub') : `${t(lang, 'fullGenerateSaved')} →`}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="locked" data-reveal>
                      <div className="lock-header">
                        <h3>{t(lang, 'lockedTitle')}</h3>
                        <p>{t(lang, 'lockedBody')}</p>
                      </div>
                      <div className="lock-list">
                        <div className="lock-row">
                          <span className="ico" aria-hidden="true">✦</span>
                          <div>
                            <strong>{t(lang, 'fullPalaces')}</strong>
                            <p>{t(lang, 'lockedPalacesDesc')}</p>
                          </div>
                        </div>
                        <div className="lock-row">
                          <span className="ico" aria-hidden="true">✦</span>
                          <div>
                            <strong>{t(lang, 'lockedDecades')}</strong>
                            <p>{t(lang, 'lockedDecadesDesc')}</p>
                          </div>
                        </div>
                        <div className="lock-row">
                          <span className="ico" aria-hidden="true">✦</span>
                          <div>
                            <strong>{t(lang, 'lockedCurrent')}</strong>
                            <p>{t(lang, 'lockedCurrentDesc')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="locked-actions">
                        <button className="btn" onClick={buy} disabled={buying}>
                          {buying ? t(lang, 'payOverlaySub') : t(lang, 'readingUnlock')}
                        </button>
                        <Link className="btn-ghost" href="/full-preview?v=3">{t(lang, 'lockedCtaSample')}</Link>
                      </div>
                      <p className="fine">{t(lang, 'buyPrice')}</p>
                    </div>
                  ))}

                {/* 完整报告：结尾 */}
                {isFull && (
                  <div className="unlock" data-reveal>
                    <div className="seal" aria-hidden="true">{t(lang, 'endLabel')}</div>
                    <p className="eyebrow">{t(lang, 'endLabel')}</p>
                    <h2>{t(lang, 'endTitle')}</h2>
                    <p>{t(lang, 'endBody')}</p>
                    <div className="unlock-actions">
                      <Link className="btn" href="/full-preview?v=3">{t(lang, 'endCtaNew')} →</Link>
                      <Link className="btn-ghost" href="/account?v=3">{t(lang, 'back')}</Link>
                    </div>
                    <p className="fine">{t(lang, 'endFine')}</p>
                  </div>
                )}
              </article>

              <p className="fineprint report-foot">{isFull ? t(lang, 'disclaimer') : L('entitlement')}</p>
            </div>
          </section>
        </>
      )}
    </>
  );
}
