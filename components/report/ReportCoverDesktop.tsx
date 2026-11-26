'use client';

import Link from 'next/link';
import { Starfield } from '@/components/oriental/Starfield';
import { CoverChart } from '@/components/oriental/CoverChart';
import { StatusBadge } from '@/components/StatusBadge';

/** 封面文案在页面层算好，两套封面共用，避免各自去查语言包。 */
export type CoverText = {
  eyebrow: string;
  title: string;
  /** 已替换好姓名的致语 */
  dedication?: string;
  intro: string;
  archive?: string;
  statusLabel: string;
  statusTone: 'consumed' | 'reserved' | 'completed';
  backLabel: string;
  /** 基础解读（无完整内容）时的脚注 */
  note?: string;
  /** 徽章中间的四字印，以及徽章下方的年份说明 */
  sealChars: string[];
  medalCap: string;
  medalYear: string;
};

export type CoverProps = {
  text: CoverText;
  /** 生成于 / 姓名 / 生日 / 地点 */
  meta: string[];
  /** 完整报告才会画右侧星盘 */
  isFull: boolean;
  palaceLabels: readonly string[];
};

/**
 * 电脑端封面：整屏、金色细框、右侧十二宫星盘，基础解读时改画中央徽章。
 * 手机端见 ReportCoverMobile.tsx；两者靠 .cover-desktop / .cover-mobile 切换显示。
 */
export function ReportCoverDesktop({ text, meta, isFull, palaceLabels }: CoverProps) {
  return (
    <section className="cover cover-desktop" id="top" data-reveal>
      <div className="cover-bg" aria-hidden="true" />
      <Starfield />
      {isFull && <CoverChart labels={palaceLabels} />}
      <div className={`wrap cover-inner${isFull ? '' : ' two-col'}`}>
        <div className="intro">
          <p className="eyebrow">{text.eyebrow}</p>
          <h1 data-reveal>{text.title}</h1>
          {text.dedication && (
            <p className="cover-dedication" data-reveal>{text.dedication}</p>
          )}
          <p className="intro" data-reveal>{text.intro}</p>
          <div className="cover-meta" data-reveal>
            {meta.map((m, i) => (
              <span key={i}>
                {m}
                {i < meta.length - 1 && <i aria-hidden="true" />}
              </span>
            ))}
          </div>
          {text.archive && <p className="cover-archive" data-reveal>{text.archive}</p>}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <StatusBadge label={text.statusLabel} tone={text.statusTone} />
          </div>
          {/* 正文就在封面下方，直接滚动即可阅读，不再拦截成「开始阅读」按钮。 */}
          {isFull && (
            <div className="cover-actions">
              <Link className="btn-ghost" href="/account?v=3">{text.backLabel}</Link>
            </div>
          )}
          {!isFull && text.note && <p className="cover-note">{text.note}</p>}
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
              {text.sealChars.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
            <div className="medal-cap"><b>{text.medalCap}</b>{text.medalYear}</div>
          </div>
        )}
      </div>
    </section>
  );
}