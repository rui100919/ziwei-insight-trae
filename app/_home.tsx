'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { HOME_SAMPLE_LABELS, PALACE_LABELS, t } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { Starfield } from '@/components/oriental/Starfield';
import { trackEvent, E } from '@/lib/analytics';

/** 三步段的中文序号（艺术类标签，跨语言保留中文）。 */
const STEP_NUMS = ['壹', '贰', '叁'] as const;

/** data-reveal 交错延迟的内联自定义属性。 */
function revealDelay(ms: string): CSSProperties {
  return { '--d': ms } as CSSProperties;
}

/** 印章文字拆成竖排两行：拉丁按空格拆，中文按字拆。 */
function sealLines(s: string): string[] {
  return s.includes(' ') ? s.split(' ') : Array.from(s);
}

export function Home() {
  const { lang } = useLang();

  const steps: [string, string][] = [
    [t(lang, 'step1'), t(lang, 'step1d')],
    [t(lang, 'step2'), t(lang, 'step2d')],
    [t(lang, 'step3'), t(lang, 'step3d')],
  ];

  return (
    <>
      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-veil" aria-hidden="true" />
        <Starfield />

        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow" data-reveal>
              <span className="dot" />
              {t(lang, 'heroEyebrow')}
            </p>
            <h1 className="hero-title" data-reveal style={revealDelay('.1s')}>
              {t(lang, 'brand')}
            </h1>
            <p className="hero-sub" data-reveal style={revealDelay('.22s')}>
              {t(lang, 'heroSub')}
            </p>
            <div className="hero-actions" data-reveal style={revealDelay('.34s')}>
              <Link href="/chart/new" className="btn" onClick={() => trackEvent(E.CTA_CLICK, { button: 'hero_start' })}>
                {t(lang, 'start')}
                <span className="arw" aria-hidden="true">→</span>
              </Link>
              <Link href="/full-preview" className="btn-ghost" onClick={() => trackEvent(E.CTA_CLICK, { button: 'hero_full_sample' })}>
                {t(lang, 'heroCtaFullSample')}
              </Link>
            </div>
            <p className="hero-note" data-reveal style={revealDelay('.46s')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                <path d="M12 2.6l2.2 6.1 6.1 2.2-6.1 2.2L12 19.2l-2.2-6.1L3.7 10.9l6.1-2.2z" />
              </svg>
              {t(lang, 'tagline')}
            </p>
          </div>
        </div>

        <div className="hero-edge" aria-hidden="true">
          <i />
          <span>{t(lang, 'heroEdge')}</span>
        </div>
        <div className="scroll-cue" aria-hidden="true">
          <span>SCROLL</span>
          <span className="line" />
        </div>
      </section>

      {/* CREED */}
      <section className="creed" id="creed">
        <div className="wrap">
          <div className="creed-inner">
            <div data-reveal>
              <p className="label">
                <span className="cn">{t(lang, 'creedLabel')}</span>
              </p>
              <h2>{t(lang, 'creedTitle')}</h2>
              <p className="creed-body">{t(lang, 'creedBody')}</p>
              <div className="creed-meta">
                <span className="seal" aria-hidden="true">
                  {sealLines(t(lang, 'sealChars')).map((ch, i) => (
                    <span key={i}>{ch}</span>
                  ))}
                </span>
              </div>
            </div>
            <div className="scroll-strip" data-reveal style={revealDelay('.15s')} aria-hidden="true">
              <p className="vertical">
                <span>{t(lang, 'creedScroll')}</span>
              </p>
              <span className="cap">Zi Wei Insight</span>
            </div>
          </div>
        </div>
      </section>

      {/* PALACES */}
      <section className="palaces" id="palaces">
        <div className="wrap">
          <div className="palaces-head">
            <div data-reveal>
              <p className="label">
                <span className="cn">{t(lang, 'navPalaces')}</span>
              </p>
              <h2>{t(lang, 'palacesTitle')}</h2>
            </div>
            <p data-reveal style={revealDelay('.12s')}>
              {t(lang, 'palacesDesc')}
            </p>
          </div>

          <div className="chart-grid" data-reveal>
            {PALACE_LABELS[lang].map((name, i) => (
              <div className={`palace p${i + 1}`} key={name}>
                <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className={`nm${lang === 'zh' || lang === 'ja' ? '' : ' translated'}`}>{name}</div>
                </div>
              </div>
            ))}

            <div className="mid">
              <div className="mid-inner">
                <svg className="mid-mark" viewBox="0 0 80 80" fill="none" aria-hidden="true">
                  <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
                  <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="0.6" opacity="0.3" strokeDasharray="2 5" />
                  <circle cx="40" cy="40" r="18" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
                  <path d="M40 22l5 13 13 5-13 5-5 13-5-13-13-5 13-5z" fill="currentColor" opacity="0.9" />
                  <circle cx="40" cy="40" r="2" fill="#FCF8EF" />
                </svg>
                <div className="mid-name">{t(lang, 'palacesMidName')}</div>
                <div className="mid-line" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* READING SAMPLE */}
      <section className="reading" id="sample">
        <div className="wrap">
          <div className="reading-inner">
            <div data-reveal>
              <p className="label">
                <span className="cn">{t(lang, 'sampleLabel')}</span>
              </p>
              <h2>{t(lang, 'sampleTitle2')}</h2>
              <p className="intro">{t(lang, 'sampleIntro')}</p>
            </div>

            <div className="excerpt" data-reveal style={revealDelay('.12s')}>
              {HOME_SAMPLE_LABELS[lang].map((label, i) => (
                <div className="excerpt-item" key={label}>
                  <span className="no">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{label}</h3>
                    <p>{t(lang, 'sampleNote')}</p>
                    <Link href="/full-preview" className="tag">
                      {t(lang, 'heroCtaFullSample')}
                      <span aria-hidden="true"> →</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="steps" id="steps">
        <div className="wrap">
          <div className="steps-head">
            <div data-reveal>
              <p className="label">
                <span className="cn">{t(lang, 'how')}</span>
              </p>
              <h2>{t(lang, 'stepsTitle')}</h2>
            </div>
          </div>
          <div className="steps-grid">
            {steps.map(([title, desc], i) => (
              <div className="step" key={title} data-reveal style={revealDelay(`${i * 0.12}s`)}>
                <div className="step-num">{STEP_NUMS[i]}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section className="final" id="start">
        <div className="final-media" aria-hidden="true" />
        <div className="final-inner">
          <div className="final-frame" data-reveal>
            <div className="final-seal" aria-hidden="true">
              {sealLines(t(lang, 'sealChars')).map((ch, i) => (
                <span key={i}>{ch}</span>
              ))}
            </div>
            <p className="label">
              <span className="cn">{t(lang, 'finalLabel')}</span>
            </p>
            <h2>{t(lang, 'finalTitle')}</h2>
            <p>{t(lang, 'finalBody')}</p>
            <div className="final-actions">
              <Link href="/chart/new" className="btn" onClick={() => trackEvent(E.CTA_CLICK, { button: 'final_start' })}>
                {t(lang, 'start')}
                <span className="arw" aria-hidden="true">→</span>
              </Link>
              <Link href="/full-preview" className="btn-ghost" onClick={() => trackEvent(E.CTA_CLICK, { button: 'final_sample' })}>
                {t(lang, 'finalCtaSample')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
