'use client';

import Link from 'next/link';
import { Starfield } from '@/components/oriental/Starfield';
import { StatusBadge } from '@/components/StatusBadge';
import type { CoverProps } from './ReportCoverDesktop';

/**
 * 手机端封面：不要星盘、不要金框、不留大块空白，标题 34px。
 * 首屏的任务只是「让你知道这是谁的报告，然后往下滑」。
 * 文案与电脑版共用同一份（由页面层算好传入）。
 */
export function ReportCoverMobile({ text, meta, isFull }: CoverProps) {
  return (
    <section className="cover cover-mobile" data-reveal>
      <div className="cover-bg" aria-hidden="true" />
      <Starfield />
      <div className="wrap cover-inner">
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
          {isFull && (
            <div className="cover-actions">
              <Link className="btn-ghost" href="/account?v=3">{text.backLabel}</Link>
            </div>
          )}
          {!isFull && text.note && <p className="cover-note">{text.note}</p>}
        </div>
      </div>
    </section>
  );
}