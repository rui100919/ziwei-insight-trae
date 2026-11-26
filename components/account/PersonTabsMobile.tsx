'use client';

import Link from 'next/link';
import type { PersonTab } from './PersonTabsDesktop';

type Props = {
  persons: PersonTab[];
  selected: string;
  onSelect: (key: string) => void;
  allLabel: string;
  addLabel: string;
  emptyLabel: string;
  addHref?: string;
};

/**
 * 手机端人物栏：一行横滑，胶囊只显示姓名。
 * 出生日期留在下方卡片的出生档案里，不在这一行争宽度，
 * 这样「＋ 添加资料」永远停在行尾看得见。
 */
export function PersonTabsMobile({ persons, selected, onSelect, allLabel, addLabel, emptyLabel, addHref = '/chart/new?v=3' }: Props) {
  return (
    <div className="person-tabs-mobile">
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