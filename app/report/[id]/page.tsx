'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { demoStore, isDemoMode } from '@/lib/demo';
import { t, LANG_META, PALACE_LABELS, isLang, type Lang } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { StatusBadge } from '@/components/StatusBadge';
import { ChartBoard } from '@/components/ChartBoard';
import { CoverChart } from '@/components/oriental/CoverChart';
import { Starfield } from '@/components/oriental/Starfield';
import { trackEvent, E } from '@/lib/analytics';
import type { ZiweiChart } from '@/lib/ziwei/types';

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
};
type Report = {
  id: string;
  language: string;
  report_type?: string;
  status?: string;
  content: ReportContent | null;
  created_at: string;
  profile?: Profile;
  chart?: ZiweiChart | null;
};

/** 报告页局部文案（字典里没有的条目），六语言各自独立翻译。 */
type ReportStrings = {
  chart: string; backToAccount: string;
  statusFailed: string; statusProcessing: string; statusCompleted: string;
  fullReportTitle: string; basicReportTitle: string;
  savedToAccount: string; savePdf: string; deleteReport: string;
  demoReport: string; entitlement: string;
};
const S: Record<Lang, ReportStrings> = {
  zh: { chart: '命盘', backToAccount: '返回账户', statusFailed: '生成失败', statusProcessing: '生成中', statusCompleted: '已完成', fullReportTitle: '紫微完整报告', basicReportTitle: '紫微基础解读', savedToAccount: '已保存在你的账户中', savePdf: '保存为 PDF', deleteReport: '删除报告', demoReport: '演示报告：命盘由真实引擎计算、数据已入库，但文字由本地示例模板生成。接入 AI 密钥后即为完整解读。', entitlement: '内容根据你的出生时间地点推算，用大白话写成。仅供自我了解与文化研究，不是预言，也不构成任何建议。' },
  en: { chart: 'Chart', backToAccount: 'My account', statusFailed: 'Failed', statusProcessing: 'Processing', statusCompleted: 'Completed', fullReportTitle: 'Zi Wei full report', basicReportTitle: 'Zi Wei basic reading', savedToAccount: 'Saved to your account', savePdf: 'Save as PDF', deleteReport: 'Delete report', demoReport: 'Demo report: the real chart and database were used, but the text came from a local template. Add an AI key for full interpretation.', entitlement: 'Written in plain language from your birth time and place. For self-reflection and cultural research only — not a prediction or advice.' },
  es: { chart: 'Carta', backToAccount: 'Mi cuenta', statusFailed: 'Fallido', statusProcessing: 'Procesando', statusCompleted: 'Completado', fullReportTitle: 'Informe completo de Zi Wei', basicReportTitle: 'Lectura básica de Zi Wei', savedToAccount: 'Guardado en tu cuenta', savePdf: 'Guardar como PDF', deleteReport: 'Eliminar informe', demoReport: 'Informe de demostración: la carta y la base de datos son reales, pero el texto proviene de una plantilla local. Añade una clave de IA para obtener la interpretación completa.', entitlement: 'Elaborado en lenguaje sencillo a partir de tu hora y lugar de nacimiento. Solo para autoconocimiento e investigación cultural; no es una predicción ni un consejo.' },
  fr: { chart: 'Thème', backToAccount: 'Mon compte', statusFailed: 'Échec', statusProcessing: 'En cours', statusCompleted: 'Terminé', fullReportTitle: 'Rapport complet Zi Wei', basicReportTitle: 'Lecture de base Zi Wei', savedToAccount: 'Enregistré dans votre compte', savePdf: 'Enregistrer en PDF', deleteReport: 'Supprimer le rapport', demoReport: 'Rapport de démonstration : le thème et la base de données sont réels, mais le texte provient d’un modèle local. Ajoutez une clé d’IA pour l’interprétation complète.', entitlement: 'Rédigé en langage simple à partir de votre heure et lieu de naissance. Pour la réflexion personnelle et la recherche culturelle uniquement — pas une prédiction ni un conseil.' },
  de: { chart: 'Horoskop', backToAccount: 'Mein Konto', statusFailed: 'Fehlgeschlagen', statusProcessing: 'In Bearbeitung', statusCompleted: 'Abgeschlossen', fullReportTitle: 'Zi Wei Vollbericht', basicReportTitle: 'Zi Wei Basisdeutung', savedToAccount: 'In deinem Konto gespeichert', savePdf: 'Als PDF speichern', deleteReport: 'Bericht löschen', demoReport: 'Demo-Bericht: Das Horoskop und die Datenbank sind echt, aber der Text stammt aus einer lokalen Vorlage. Füge einen KI-Schlüssel hinzu für die vollständige Deutung.', entitlement: 'In einfacher Sprache aus deiner Geburtszeit und deinem Geburtsort erstellt. Nur zur Selbstreflexion und kulturellen Forschung — keine Vorhersage oder Beratung.' },
  ja: { chart: '命盤', backToAccount: 'アカウントに戻る', statusFailed: '生成失敗', statusProcessing: '生成中', statusCompleted: '完了', fullReportTitle: '紫微完全版レポート', basicReportTitle: '紫微基礎解読', savedToAccount: 'アカウントに保存済みです', savePdf: 'PDFとして保存', deleteReport: 'レポートを削除', demoReport: 'デモレポート：命盤は実際のエンジンで計算されデータも保存されていますが、文章はローカルのテンプレートで生成されています。AIキーを設定すると完全な解読になります。', entitlement: '出生時刻と場所に基づいて平易な言葉で記述されています。自己理解と文化研究のみを目的とし、予測や助言ではありません。' },
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
  /** 报告因订单退款被关闭（区别于普通加载失败）。 */
  const [locked, setLocked] = useState(false);
  const [pay, setPay] = useState<{ isDemo: boolean; paymentsEnabled: boolean; provider?: string; loggedIn: boolean; unlocked: boolean } | null>(null);
  const [buying, setBuying] = useState(false);

  // 内容语言以报告生成时的 report.language 为准——UI 切语言只换界面文案，不重建已付费报告。
  const rl: Lang = report && isLang(report.language) ? report.language : 'zh';
  const L = (k: keyof ReportStrings) => S[lang][k];

  useEffect(() => {
    if (isDemoMode()) {
      const row = demoStore.getReport(id);
      if (!row) setError(t(lang, 'errorGeneric'));
      else setReport(row as Report);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace(`/auth?next=${encodeURIComponent(`/report/${id}`)}`); return; }
      const { data: row, error } = await supabase
        .from('reports')
        .select('id, language, report_type, status, content, created_at, chart:charts(chart_data, birth_profile:birth_profiles(label, birth_date, birth_time, birth_time_known, birth_place, timezone))')
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
        const chart = (Array.isArray(raw.chart) ? raw.chart[0] : raw.chart) as Record<string, unknown> | null | undefined;
        const nested = chart?.birth_profile;
        const bp = (Array.isArray(nested) ? nested[0] : nested) as Record<string, unknown> | null | undefined;
        setReport({
          id: String(raw.id),
          language: String(raw.language),
          report_type: raw.report_type ? String(raw.report_type) : undefined,
          status: raw.status ? String(raw.status) : undefined,
          content: raw.content as Report['content'],
          created_at: String(raw.created_at),
          chart: (chart?.chart_data ?? null) as ZiweiChart | null,
          profile: bp ? {
            label: String(bp.label),
            birthDate: String(bp.birth_date),
            birthTime: String(bp.birth_time ?? ''),
            birthPlace: String(bp.birth_place ?? ''),
            timezone: String(bp.timezone),
            timeKnown: Boolean(bp.birth_time_known),
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

  async function deleteReport() {
    if (!window.confirm(t(lang, 'confirmDelete'))) return;
    if (isDemoMode()) {
      demoStore.deleteReport(id);
      router.replace('/account');
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.rpc('soft_delete_report', { p_report_id: id });
    if (error) { setError(error.message); return; }
    router.replace('/account');
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
      if (data.error === 'NEED_LOGIN') setError(t(lang, 'buyNeedLogin'));
      else if (data.error === 'PAYMENTS_NOT_CONFIGURED' || data.error === 'DEMO_MODE') setError(t(lang, 'buyUnavailable'));
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

  const toc: [string, string][] = report
    ? [
        ...(report.chart ? [['chart', L('chart')] as [string, string]] : []),
        ['overview', t(lang, 'overview')],
        ['personality', t(lang, 'personality')],
        ...(isFull
          ? [
              ['palaces', t(lang, 'fullPalaces')],
              ['daxian', t(lang, 'fullDaXian')],
              ['current', t(lang, 'fullCurrent')],
            ] as [string, string][]
          : []),
        ['caveats', t(lang, 'caveats')],
      ]
    : [];

  // 仅用于展示的派生值（不改动任何数据获取 / 兼容 / 权益逻辑）。
  const nSec = sections.length;
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

  return (
    <>
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
              <Link className="btn-ghost" href="/account">{L('backToAccount')}</Link>
            </div>
          </div>
        </section>
      )}

      {report && (
        <>
          {/* 深色封面 */}
          <section className="cover" id="top" data-reveal>
            <div className="cover-bg" aria-hidden="true" />
            <Starfield />
            {isFull && <CoverChart labels={PALACE_LABELS[rl]} />}
            <div className={`wrap cover-inner${isFull ? '' : ' two-col'}`}>
              <div className="intro">
                <p className="eyebrow">{isFull ? L('fullReportTitle') : L('basicReportTitle')}</p>
                <h1 data-reveal>{isFull ? t(lang, 'fullCoverTitle') : t(lang, 'readingCoverTitle')}</h1>
                <p className="intro" data-reveal>{isFull ? t(lang, 'fullCoverIntro') : t(lang, 'readingCoverIntro')}</p>
                <div className="cover-meta" data-reveal>
                  {coverMeta.map((m, i) => (
                    <span key={i}>
                      {m}
                      {i < coverMeta.length - 1 && <i aria-hidden="true" />}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <StatusBadge
                    label={report.status === 'failed' ? L('statusFailed') : report.status === 'pending' ? L('statusProcessing') : L('statusCompleted')}
                    tone={report.status === 'failed' ? 'consumed' : report.status === 'pending' ? 'reserved' : 'completed'}
                  />
                </div>
                {/* 正文就在封面下方，直接滚动即可阅读，不再拦截成「开始阅读」按钮。 */}
                {isFull && (
                  <div className="cover-actions">
                    <Link className="btn-ghost" href="/account">{t(lang, 'back')}</Link>
                  </div>
                )}
                {!isFull && <p className="cover-note">{t(lang, 'readingCoverNote')}</p>}
              </div>

              {!isFull && (
                <div className="medallion" aria-hidden="true" data-reveal>
                  <div className="rings">
                    <svg viewBox="0 0 320 320" fill="none">
                      <g stroke="#B8945C">
                        <circle cx="160" cy="160" r="154" strokeWidth="0.7" strokeDasharray="2 8" opacity="0.8" />
                        <circle cx="160" cy="160" r="140" strokeWidth="0.5" strokeDasharray="1 6" opacity="0.55" />
                        <g opacity="0.7">
                          <circle cx="160" cy="6" r="1.6" fill="#B8945C" stroke="none" />
                          <circle cx="314" cy="160" r="1.6" fill="#B8945C" stroke="none" />
                          <circle cx="160" cy="314" r="1.6" fill="#B8945C" stroke="none" />
                          <circle cx="6" cy="160" r="1.6" fill="#B8945C" stroke="none" />
                        </g>
                      </g>
                      <g stroke="#B8945C" opacity="0.5">
                        <circle cx="160" cy="160" r="118" strokeWidth="0.5" strokeDasharray="1 4" />
                        <circle cx="160" cy="160" r="104" strokeWidth="0.5" />
                      </g>
                      <path d="M160 126l8.4 25.6L194 160l-25.6 8.4L160 194l-8.4-25.6L126 160l25.6-8.4z" fill="#B8945C" opacity="0.45" />
                    </svg>
                  </div>
                  <div className="stamp">
                    {t(lang, 'sealChars').split(/\s+/).map((c, i) => (
                      <span key={i}>{c}</span>
                    ))}
                  </div>
                  <div className="medal-cap"><b>{t(lang, 'readingMedalCap')}</b>{reportYear}</div>
                </div>
              )}
            </div>
          </section>

          {report.chart && (
            <section id="chart" className="bg-paper scroll-mt-24" data-reveal>
              <div className="wrap py-10">
                <ChartBoard chart={report.chart} lang={lang} linkedPalaces={linkedPalaces.size ? linkedPalaces : undefined} />
              </div>
            </section>
          )}

          {/* 浅色宣纸报告正文 */}
          <section className="report" data-reveal>
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
                <Link className="edit" href="/chart/new">{t(lang, 'reportEditBirth')}</Link>
              </div>

              {error && (
                <div className="rounded-lg border border-[rgba(27,23,16,.18)] bg-[rgba(27,23,16,.04)] px-4 py-3 text-sm print:hidden">{error}</div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[rgba(27,23,16,.18)] py-3 print:hidden">
                <p className="fineprint">{L('savedToAccount')}</p>
                <div className="flex items-center gap-4">
                  <button
                    className="text-sm text-[rgba(27,23,16,.72)] underline underline-offset-4 decoration-[rgba(27,23,16,.3)] hover:text-gold hover:decoration-gold"
                    onClick={() => window.print()}
                  >
                    {L('savePdf')}
                  </button>
                  <button
                    className="text-sm text-[rgba(27,23,16,.72)] underline underline-offset-4 decoration-[rgba(27,23,16,.3)] hover:text-gold hover:decoration-gold"
                    onClick={deleteReport}
                  >
                    {L('deleteReport')}
                  </button>
                </div>
              </div>

              {isDemoMode() && <p className="fineprint">{L('demoReport')}</p>}

              {toc.length > 1 && (
                <nav className="toc" aria-label={t(lang, 'reports')} data-reveal>
                  {toc.map(([anchor, label]) => (
                    <a key={anchor} href={`#${anchor}`}>{label}</a>
                  ))}
                </nav>
              )}

              <article>
                {sections.map(([anchor, title, value], i) => (
                  <section className="chapter" id={anchor} key={anchor} data-reveal>
                    <div className="ch-head">
                      <span className="ch-no">{pad(i + 1)}</span>
                      <h2>{title}</h2>
                    </div>
                    <div className="ch-body">
                      <p className="whitespace-pre-wrap">{value}</p>
                    </div>
                  </section>
                ))}

                {isFull && fullContent?.palaces && fullContent.palaces.length > 0 && (
                  <section className="chapter" id="palaces" data-reveal>
                    <div className="ch-head">
                      <span className="ch-no">{pad(nSec + 1)}</span>
                      <h2>{t(lang, 'fullPalaces')}</h2>
                    </div>
                    <div className="ch-body">
                      {fullContent.palaces.map((p, i) => (
                        <details
                          className="palace"
                          key={p.key}
                          id={`palace-${encodeURIComponent(p.key)}`}
                          open={i === 0}
                        >
                          <summary>
                            <span className="pno">{pad(i + 1)}</span>
                            <span className="pt">{palaceTitle(p, rl)}</span>
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

                {isFull && fullContent?.daXian && fullContent.daXian.length > 0 && (
                  <section className="chapter" id="daxian" data-reveal>
                    <div className="ch-head">
                      <span className="ch-no">{pad(nSec + 2)}</span>
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
                        <div className="now" id="current" data-reveal>
                          <span className="cap">{t(lang, 'fullCurrent')}</span>
                          <p className="whitespace-pre-wrap">{fullContent.currentPhase}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {isFull && fullContent?.patterns && (
                  <section className="chapter" id="patterns" data-reveal>
                    <div className="ch-head">
                      <span className="ch-no">{pad(nSec + 3)}</span>
                      <h2>{patternsTitle(fullContent.patterns, rl)}</h2>
                    </div>
                    <div className="ch-body">
                      <p className="whitespace-pre-wrap">{patternsText(fullContent.patterns, rl)}</p>
                    </div>
                  </section>
                )}

                {isFull && fullContent?.caveats && (
                  <section className="chapter" id="caveats" data-reveal>
                    <div className="ch-head">
                      <span className="ch-no">{pad(nSec + (fullContent.patterns ? 4 : 3))}</span>
                      <h2>{t(lang, 'caveats')}</h2>
                    </div>
                    <div className="ch-body">
                      <p className="whitespace-pre-wrap">{fullContent.caveats}</p>
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
                        <Link className="btn" href="/full-preview">{t(lang, 'fullGenerateSaved')} →</Link>
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
                        <Link className="btn-ghost" href="/full-preview">{t(lang, 'lockedCtaSample')}</Link>
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
                      <Link className="btn" href="/full-preview">{t(lang, 'endCtaNew')} →</Link>
                      <Link className="btn-ghost" href="/account">{t(lang, 'back')}</Link>
                    </div>
                    <p className="fine">{t(lang, 'endFine')}</p>
                  </div>
                )}
              </article>

              <p className="fineprint report-foot">{L('entitlement')}</p>
            </div>
          </section>
        </>
      )}
    </>
  );
}
