'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CityPicker } from '@/components/CityPicker';
import { PayPalButton } from '@/components/PayPalButton';
import { Starfield } from '@/components/oriental/Starfield';
import { CoverChart } from '@/components/oriental/CoverChart';
import type { City } from '@/lib/cities';
import { PALACE_LABELS, t, type Lang } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';

/** 完整报告内容为单语言结构：所有字符串已是生成时的目标语言。 */
type FullContent = {
  overview: string;
  personality: string;
  palaces?: { key: string; title: string; text: string }[];
  daXian?: { label: string; text: string }[];
  patterns?: { title: string; text: string; count: number };
  currentPhase?: string;
  caveats: string;
};

/** 本页局部文案（字典里没有的条目），六语言各自独立翻译。 */
type PreviewStrings = {
  home: string; redirecting: string; birthDetails: string; changeToRerun: string;
  sampleChart: string; age: string; palaces: string; phases: string;
};
const S: Record<Lang, PreviewStrings> = {
  zh: { home: '返回首页', redirecting: '正在跳转支付…', birthDetails: '出生资料', changeToRerun: '改一下就能重新推演。', sampleChart: '示例命盘', age: '虚岁', palaces: '宫', phases: '段大限' },
  en: { home: 'Home', redirecting: 'Redirecting…', birthDetails: 'Birth details', changeToRerun: 'Change any field to run it again.', sampleChart: 'Sample chart', age: 'age', palaces: 'palaces', phases: 'phases' },
  es: { home: 'Inicio', redirecting: 'Redirigiendo…', birthDetails: 'Datos de nacimiento', changeToRerun: 'Cambia cualquier campo para volver a calcularlo.', sampleChart: 'Carta de ejemplo', age: 'edad', palaces: 'palacios', phases: 'etapas' },
  fr: { home: 'Accueil', redirecting: 'Redirection…', birthDetails: 'Données de naissance', changeToRerun: 'Modifiez un champ pour relancer le calcul.', sampleChart: 'Thème d’exemple', age: 'âge', palaces: 'palais', phases: 'périodes' },
  de: { home: 'Startseite', redirecting: 'Weiterleitung…', birthDetails: 'Geburtsdaten', changeToRerun: 'Ändere ein Feld, um es neu zu berechnen.', sampleChart: 'Beispielhoroskop', age: 'Alter', palaces: 'Paläste', phases: 'Phasen' },
  ja: { home: 'ホームに戻る', redirecting: '支払いに移動中…', birthDetails: '出生情報', changeToRerun: '項目を変更すると再計算できます。', sampleChart: 'サンプル命盤', age: '数え年', palaces: '宮', phases: '段階' },
};
type Meta = {
  birthInfo: { year: number; month: number; day: number; hour?: number; gender: string; city: string };
  wuxingJu?: string;
  mingZhu?: string;
  lunar?: { lunarYear: number; lunarMonth: number; lunarDay: number };
  currentAge?: number;
  palaceCount: number;
  daXianCount: number;
};

/** 从大限标签解析起止虚岁，识别当前段索引；无法识别返回 -1。标签形如「5–14 岁 · 命宫」。 */
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

type TocItem = { id: string; label: string };
/** 依据实际存在的章节生成目录顺序（供 TOC 编号与章节编号共用，避免硬编码序号错位）。 */
function buildToc(content: FullContent | null, lang: Lang): TocItem[] {
  if (!content) return [];
  const items: TocItem[] = [
    { id: 'overview', label: t(lang, 'overview') },
    { id: 'personality', label: t(lang, 'personality') },
  ];
  if (content.palaces?.length) items.push({ id: 'palaces', label: t(lang, 'fullPalaces') });
  if (content.daXian?.length) items.push({ id: 'daxian', label: t(lang, 'fullDaXian') });
  if (content.patterns) items.push({ id: 'patterns', label: content.patterns.title });
  items.push({ id: 'caveats', label: t(lang, 'caveats') });
  return items;
}

export default function FullPreviewPage() {
  const { lang } = useLang();
  const router = useRouter();
  const zones = useMemo(() => {
    try { return Intl.supportedValuesOf('timeZone'); } catch { return ['Asia/Shanghai', 'Asia/Kuala_Lumpur', 'Europe/London', 'America/New_York']; }
  }, []);
  const [birthDate, setBirthDate] = useState('1990-06-15');
  const [birthTime, setBirthTime] = useState('14:30');
  const [timeKnown, setTimeKnown] = useState(true);
  const [birthPlace, setBirthPlace] = useState('上海');
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [longitude, setLongitude] = useState('121.5');
  const [cityPicked, setCityPicked] = useState(true);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [content, setContent] = useState<FullContent | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyMode, setBusyMode] = useState<'sample' | 'full' | null>(null);
  const requestRef = useRef<{ signature: string; key: string } | null>(null);
  // 样品请求竞态防护：切换语言时，旧语言的异步响应不得覆盖新语言内容。
  const sampleTokenRef = useRef(0);
  const [error, setError] = useState('');
  const [pay, setPay] = useState<{ isDemo: boolean; paymentsEnabled: boolean; provider?: string; loggedIn: boolean; unlocked: boolean } | null>(null);
  const [buying, setBuying] = useState(false);
  const [payError, setPayError] = useState('');

  function handleCitySelect(city: City) {
    setLongitude(String(city.lon));
    setTimezone(city.tz);
    setBirthPlace(lang === 'zh' ? (city.a.find((a) => /[\u4e00-\u9fff]/.test(a)) ?? city.n) : city.n);
    setCityPicked(true);
  }
  function handlePlaceChange(value: string) {
    setBirthPlace(value);
    if (cityPicked) { setCityPicked(false); setLongitude(''); }
  }

  async function generateSample() {
    const token = ++sampleTokenRef.current;
    setBusy(true); setBusyMode('sample'); setError(''); setPayError('');
    try {
      const res = await fetch('/api/reading/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate, birthTime, timeKnown, birthPlace, timezone,
          longitude: longitude === '' ? null : Number(longitude),
          gender, lang, sample: true,
        }),
      });
      const data = await res.json();
      // 切换语言或再次点击后，旧请求作废，只采纳最新一次响应。
      if (token !== sampleTokenRef.current) return;
      if (!res.ok) {
        setError(t(lang, 'errorGeneric'));
        return;
      }
      setContent(data.content as FullContent);
      setMeta(data.meta as Meta);
    } catch {
      if (token !== sampleTokenRef.current) return;
      setError(t(lang, 'errorGeneric'));
    } finally {
      if (token === sampleTokenRef.current) {
        setBusy(false); setBusyMode(null);
      }
    }
  }

  async function generateFull() {
    if (busy) return;
    const input = {
      birthDate, birthTime, timeKnown, birthPlace, timezone,
      longitude: longitude === '' ? null : Number(longitude),
      gender, lang,
    };
    const signature = JSON.stringify(input);
    if (!requestRef.current || requestRef.current.signature !== signature) {
      requestRef.current = { signature, key: crypto.randomUUID() };
    }
    setBusy(true); setBusyMode('full'); setError(''); setPayError('');
    try {
      const res = await fetch('/api/reading/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, idempotencyKey: requestRef.current.key }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'NEED_LOGIN') setError(t(lang, 'buyNeedLogin'));
        else if (data.error === 'PAYMENT_REQUIRED') setError(t(lang, 'buyIntro'));
        else if (data.error === 'INVALID_TIMEZONE') setError(t(lang, 'invalidTimezone'));
        else setError(t(lang, 'errorGeneric'));
        return;
      }
      if (!data.reportId) { setError(t(lang, 'errorGeneric')); return; }
      router.push(`/report/${data.reportId}`);
    } catch {
      setError(t(lang, 'errorGeneric'));
    } finally {
      setBusy(false); setBusyMode(null);
    }
  }

  // 打开即生成一次示例；切换 UI 语言时用新语言重新生成样品（竞态由 sampleTokenRef 防护）。
  useEffect(() => { generateSample(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [lang]);

  // 查询购买/解锁状态（演示模式隐藏购买卡片）
  useEffect(() => {
    fetch('/api/payment/entitlement')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setPay(d); })
      .catch(() => {});
  }, []);

  async function buy() {
    setBuying(true); setError('');
    try {
      const endpoint = pay?.provider === 'dodo' ? '/api/dodo/checkout' : '/api/checkout';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'full_report' }),
      });
      const data = await res.json();
      if (res.ok && data.url) { window.location.href = data.url; return; }
      if (data.error === 'NEED_LOGIN') setError(t(lang, 'buyNeedLogin'));
      else if (data.error === 'PAYMENTS_NOT_CONFIGURED' || data.error === 'DEMO_MODE') setError(t(lang, 'buyUnavailable'));
      else setError(t(lang, 'buyError'));
    } catch {
      setError(t(lang, 'buyError'));
    } finally {
      setBuying(false);
    }
  }

  function handlePayPalError(code: string) {
    if (code === 'NEED_LOGIN') setPayError(t(lang, 'buyNeedLogin'));
    else setPayError(t(lang, 'buyError'));
  }

  const L = (k: keyof PreviewStrings) => S[lang][k];

  const tocItems = buildToc(content, lang);
  const sectionNo = (id: string) => {
    const i = tocItems.findIndex((it) => it.id === id);
    return i < 0 ? '' : String(i + 1).padStart(2, '0');
  };
  const curDaXian = content?.daXian?.length ? currentDaXianIndex(content.daXian, meta?.currentAge) : -1;

  return (
    <>
      {/* 深色封面：.cover 背景 + Starfield + CoverChart，目录锚点到各章节 */}
      <section className="cover" id="top">
        <div className="cover-bg" aria-hidden="true" />
        <Starfield />
        <CoverChart labels={PALACE_LABELS[lang]} />
        <div className="wrap cover-inner">
          <p className="label" data-reveal>
            <span className="cn">{t(lang, 'fullBadge')}</span>
            <span className="en">{t(lang, 'previewSampleChart')}</span>
          </p>
          <h1 data-reveal>{t(lang, 'previewTitle')}</h1>
          <p className="intro" data-reveal>{t(lang, 'previewIntro')}</p>

          <div className="cover-meta" data-reveal>
            {meta ? (
              <>
                <span>{L('sampleChart')}</span>
                <i aria-hidden="true" />
                <span>{meta.birthInfo.year}-{String(meta.birthInfo.month).padStart(2, '0')}-{String(meta.birthInfo.day).padStart(2, '0')}</span>
                <i aria-hidden="true" />
                <span>{meta.birthInfo.city}</span>
                <i aria-hidden="true" />
                <span>{L('age')} {meta.currentAge}</span>
                <i aria-hidden="true" />
                <span>{meta.palaceCount} {L('palaces')}</span>
                <i aria-hidden="true" />
                <span>{meta.daXianCount} {L('phases')}</span>
              </>
            ) : busy ? (
              <span>{t(lang, 'fullSampleGenerating')}</span>
            ) : null}
          </div>

          <div className="cover-actions" data-reveal>
            <a href="#unlock" className="btn">{t(lang, 'previewUnlock')}<span className="arw" aria-hidden="true">→</span></a>
            <a href="#birth" className="btn-ghost">{L('birthDetails')}</a>
          </div>

          <p className="cover-note" data-reveal>{t(lang, 'fullSampleHint')}</p>
        </div>
      </section>

      {/* 可修改的出生资料：放在深色区，CityPicker 用默认外观（不传 sheet） */}
      <section id="birth" style={{ background: 'var(--ink)' }}>
        <div className="wrap" style={{ paddingTop: 'clamp(64px, 8vw, 104px)', paddingBottom: 'clamp(64px, 8vw, 104px)' }}>
          <div data-reveal>
            <p className="eyebrow">{L('birthDetails')}</p>
            <p style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)' }}>{L('changeToRerun')}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2" data-reveal style={{ marginTop: 28 }}>
            <div>
              <label className="label">{t(lang, 'birthDate')}</label>
              <input className="input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div style={{ position: 'relative' }}>
              <label className="label">{t(lang, 'birthTime')}</label>
              <label style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                <input type="checkbox" style={{ accentColor: 'var(--gold)' }} checked={!timeKnown} onChange={(e) => setTimeKnown(!e.target.checked)} />
                {t(lang, 'timeUnknown')}
              </label>
              <input className="input" type="time" value={birthTime} disabled={!timeKnown} onChange={(e) => setBirthTime(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2" data-reveal style={{ marginTop: 5 }}>
            <div>
              <label className="label">{t(lang, 'birthPlace')}</label>
              <CityPicker lang={lang} value={birthPlace} onChange={handlePlaceChange} onSelect={handleCitySelect} />
              {cityPicked && longitude !== '' && (
                <p style={{ marginTop: 8, fontSize: 12, color: '#a8c49c' }}>✓ {t(lang, 'autoResolved')} · {Number(longitude).toFixed(2)}° · {timezone}</p>
              )}
            </div>
            <div>
              <label className="label">{t(lang, 'gender')}</label>
              <select className="input" value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')}>
                <option value="male">{t(lang, 'male')}</option>
                <option value="female">{t(lang, 'female')}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3" data-reveal style={{ marginTop: 28 }}>
            <button className="btn-ghost" disabled={busy} onClick={generateSample}>
              {busyMode === 'sample' ? t(lang, 'fullSampleGenerating') : t(lang, 'fullRegenerate')}
            </button>
            {pay?.unlocked && !pay.isDemo && (
              <button className="btn" disabled={busy} onClick={generateFull}>
                {busyMode === 'full' ? t(lang, 'fullGenerating') : t(lang, 'fullGenerateSaved')}
                {busyMode !== 'full' ? ' →' : ''}
              </button>
            )}
          </div>
          <p style={{ marginTop: 14, fontSize: 12, lineHeight: 1.7, color: 'var(--muted)' }} data-reveal>
            {pay?.unlocked && !pay.isDemo ? t(lang, 'fullSaveHint') : t(lang, 'fullSampleHint')}
          </p>
          {error && <p style={{ marginTop: 12, fontSize: 14, color: '#d98a7a' }}>{error}</p>}
        </div>
      </section>

      {/* 报告正文：浅色宣纸容器 .report，正文为 API 目标语言文本，直接渲染不翻译 */}
      {content && (
        <section className="report" id="report">
          <div className="report-wrap">
            {/* 目录 */}
            <div className="toc" data-reveal>
              {tocItems.map((it, i) => (
                <a key={it.id} href={`#${it.id}`}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <span>{it.label}</span>
                </a>
              ))}
            </div>

            <section className="chapter" id="overview" data-reveal>
              <div className="ch-head">
                <span className="ch-no">{sectionNo('overview')}</span>
                <h2>{t(lang, 'overview')}</h2>
              </div>
              <p className="ch-body" style={{ whiteSpace: 'pre-wrap' }}>{content.overview}</p>
            </section>

            <section className="chapter" id="personality" data-reveal>
              <div className="ch-head">
                <span className="ch-no">{sectionNo('personality')}</span>
                <h2>{t(lang, 'personality')}</h2>
              </div>
              <p className="ch-body" style={{ whiteSpace: 'pre-wrap' }}>{content.personality}</p>
            </section>

            {/* 十二宫：解锁后用手风琴 .palace；样品未解锁用深色 .locked 卡片替代 */}
            {content.palaces && content.palaces.length > 0 ? (
              <section className="chapter" id="palaces" data-reveal>
                <div className="ch-head">
                  <span className="ch-no">{sectionNo('palaces')}</span>
                  <h2>{t(lang, 'fullPalaces')}</h2>
                </div>
                <p className="ch-body" style={{ marginTop: -8, marginBottom: 30 }}>{t(lang, 'palacesChapterIntro')}</p>
                <div className="palaces">
                  {content.palaces.map((p, i) => (
                    <details className="palace" key={p.key} open={i === 0}>
                      <summary>
                        <span className="pno">{String(i + 1).padStart(2, '0')}</span>
                        <span className="pt">{p.title}</span>
                        <span className="kw" />
                        <span className="pm" aria-hidden="true" />
                      </summary>
                      <div className="body">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{p.text}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ) : (
              <div className="locked" id="palaces" data-reveal>
                <div className="seal" aria-hidden="true">十二宫</div>
                <h2>{t(lang, 'fullSampleLockedTitle')}</h2>
                <p>{t(lang, 'fullSampleLockedText')}</p>
                <div className="locked-actions">
                  <a href="#unlock" className="btn">{t(lang, 'previewUnlock')}<span className="arw" aria-hidden="true">→</span></a>
                </div>
              </div>
            )}

            {/* 十年大限 */}
            {content.daXian && content.daXian.length > 0 && (
              <section className="chapter" id="daxian" data-reveal>
                <div className="ch-head">
                  <span className="ch-no">{sectionNo('daxian')}</span>
                  <h2>{t(lang, 'fullDaXian')}</h2>
                </div>
                <p className="ch-body" style={{ marginTop: -8, marginBottom: 30 }}>{t(lang, 'fullDaXianNote')}</p>
                <div className="decades">
                  {content.daXian.map((d, i) => {
                    const [agePart, ...rest] = d.label.split(' · ');
                    const palPart = rest.join(' · ');
                    return (
                      <div key={i} className={`decade${i === curDaXian ? ' current' : ''}`}>
                        <span className="age">{agePart}</span>
                        <span className="pal">{palPart}</span>
                        <span style={{ fontSize: 13.5, lineHeight: 1.95, color: 'rgba(27,23,16,.72)' }}>{d.text}</span>
                        <span className="mark">{i === curDaXian ? t(lang, 'decadeMarkCurrent') : ''}</span>
                      </div>
                    );
                  })}
                </div>
                {content.currentPhase && (
                  <div className="now" data-reveal>
                    <span className="cap">{t(lang, 'fullCurrent')}</span>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{content.currentPhase}</p>
                  </div>
                )}
              </section>
            )}

            {/* 格局 */}
            {content.patterns && (
              <section className="chapter" id="patterns" data-reveal>
                <div className="ch-head">
                  <span className="ch-no">{sectionNo('patterns')}</span>
                  <h2>{content.patterns.title}</h2>
                </div>
                <p className="ch-body" style={{ whiteSpace: 'pre-wrap' }}>{content.patterns.text}</p>
              </section>
            )}

            {/* 实话实说 */}
            <section className="chapter" id="caveats" data-reveal>
              <div className="ch-head">
                <span className="ch-no">{sectionNo('caveats')}</span>
                <h2>{t(lang, 'caveats')}</h2>
              </div>
              <p className="ch-body" style={{ whiteSpace: 'pre-wrap' }}>{content.caveats}</p>
              <p className="fineprint" data-reveal>
                {t(lang, 'fullNote')} {t(lang, 'disclaimer')}
              </p>
            </section>
          </div>
        </section>
      )}

      {/* 购买 / 解锁卡片：东方深色卡片，保留现有 pay 权益逻辑与 buy()/PayPalButton */}
      {pay && (
        <section className="unlock" id="unlock" data-reveal>
          <div className="seal" aria-hidden="true">紫微</div>
          <p className="label"><span className="cn">{t(lang, 'previewUnlock')}</span></p>
          <h2>{pay.unlocked ? t(lang, 'buyOwned') : t(lang, 'endTitle')}</h2>
          <p>{t(lang, 'buyIntro')}</p>
          <p style={{ color: 'var(--gold-lit)', letterSpacing: '.06em' }}>{t(lang, 'buyPrice')}</p>
          <div className="unlock-actions">
            {!pay.unlocked && pay.paymentsEnabled && pay.provider === 'paypal' && (
              <PayPalButton onError={handlePayPalError} />
            )}
            {!pay.unlocked && pay.paymentsEnabled && (pay.provider === 'stripe' || pay.provider === 'dodo') && (
              <button className="btn" disabled={buying} onClick={buy}>
                {buying ? L('redirecting') : t(lang, 'buyUnlock')}{!buying ? ' →' : ''}
              </button>
            )}
            {!pay.paymentsEnabled && <p style={{ marginTop: 0 }}>{t(lang, 'buyUnavailable')}</p>}
          </div>
          {(error || payError) && (
            <p style={{ color: '#d98a7a', marginTop: 18 }}>{error || payError}</p>
          )}
          <p className="fine">{t(lang, 'previewUnlockFine')}</p>
        </section>
      )}
    </>
  );
}
