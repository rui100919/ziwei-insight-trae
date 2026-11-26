'use client';

import Link from 'next/link';

export type PersonTab = { key: string; label: string; birthDate: string };

type Props = {
  persons: PersonTab[];
  /** '' 表示「全部」 */
  selected: string;
  onSelect: (key: string) => void;
  allLabel: string;
  addLabel: string;
  emptyLabel: string;
  addHref?: string;
};

/**
 * 电脑端人物栏：换行排布，每个胶囊显示「姓名 + 出生日期」。
 * 手机端见 PersonTabsMobile.tsx；两者靠 .person-tabs / .person-tabs-mobile 切换显示。
 */
export function PersonTabsDesktop({ persons, selected, onSelect, allLabel, addLabel, emptyLabel, addHref = '/chart/new?v=3' }: Props) {
  return (
    <div className="person-tabs">
      <button
        type="button"
        onClick={() => onSelect('')}
        className={`rounded-full border px-3.5 py-1.5 text-xs transition ${selected === '' ? 'border-gold bg-gold/15 text-ink' : 'border-line text-ink-soft hover:border-gold/60'}`}
      >
        {allLabel}
      </button>
      {persons.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onSelect(p.key)}
          className={`rounded-full border px-3.5 py-1.5 text-xs transition ${selected === p.key ? 'border-gold bg-gold/15 text-ink' : 'border-line text-ink-soft hover:border-gold/60'}`}
        >
          {p.label || emptyLabel}
          {p.birthDate ? <span className="ml-1 text-ink-muted">{p.birthDate}</span> : null}
        </button>
      ))}
      <Link
        href={addHref}
        className="rounded-full border border-dashed border-line-strong px-3.5 py-1.5 text-xs text-ink-soft transition hover:border-gold hover:bg-gold/10 hover:text-ink"
      >
        ＋ {addLabel}
      </Link>
    </div>
  );
}