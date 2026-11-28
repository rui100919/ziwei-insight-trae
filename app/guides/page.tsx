import type { Metadata } from 'next';
import Link from 'next/link';
import { PALACE_GUIDES, STAR_GUIDES, guidePath, type Guide } from '@/lib/guides';

export const metadata: Metadata = {
  title: '十二宫与十四主星：逐条读法',
  description:
    '紫微斗数十二宫与十四主星的逐条解读：每一宫在看什么、主星怎么读、常见表现、容易踩的坑与可以怎么用。全部免费阅读，不预言、不下判断。',
  alternates: { canonical: '/guides' },
  openGraph: {
    type: 'website',
    url: '/guides',
    siteName: 'Zi Wei Insight',
    title: '十二宫与十四主星：逐条读法',
    description: '每一宫在看什么、主星怎么读、常见表现与容易踩的坑。全部免费阅读。',
  },
};

/** 目录条目：编号 + 名称 + 一句话标题，保持与文章页同一套版式。 */
function GuideCard({ guide, index }: { guide: Guide; index: number }) {
  return (
    <Link className="guide-card" href={guidePath(guide)}>
      <span className="idx">{String(index + 1).padStart(2, '0')}</span>
      <span className="body">
        <span className="nm">{guide.name}</span>
        <span className="tt">{guide.title}</span>
      </span>
    </Link>
  );
}

export default function GuidesPage() {
  return (
    <div className="guide">
      <div className="guide-inner">
        <nav className="guide-crumb" aria-label="面包屑导航">
          <Link href="/">首页</Link>
          <span aria-hidden="true">/</span>
          <span className="current">命理笔记</span>
        </nav>

        <p className="eyebrow">命理笔记</p>
        <h1>十二宫与十四主星，逐条读懂</h1>
        <p className="guide-lead">
          紫微斗数的门槛不在排盘，在读盘：同一颗星落在不同宫位，说的完全是两件事。这里把十二宫和十四主星拆成
          26 篇，每篇只讲一个条目——它管什么、怎么读、常见表现、容易踩的坑，以及可以怎么用。
        </p>
        <p className="guide-lead">
          全部免费阅读，不需要注册。写这些字的目的是让你看懂自己的盘在说什么，而不是替你下结论。
        </p>

        <section className="guide-section">
          <h2>十二宫</h2>
          <div className="guide-grid">
            {PALACE_GUIDES.map((guide, i) => (
              <GuideCard key={guide.slug} guide={guide} index={i} />
            ))}
          </div>
        </section>

        <section className="guide-section">
          <h2>十四主星</h2>
          <div className="guide-grid">
            {STAR_GUIDES.map((guide, i) => (
              <GuideCard key={guide.slug} guide={guide} index={i} />
            ))}
          </div>
        </section>

        <section className="guide-section">
          <h2>流年</h2>
          <div className="guide-grid">
            <Link className="guide-card" href="/liunian/2027">
              <span className="idx">2027</span>
              <span className="body">
                <span className="nm">丁未年</span>
                <span className="tt">这一年适合做什么，别硬扛什么</span>
              </span>
            </Link>
            <Link className="guide-card" href="/liunian/2028">
              <span className="idx">2028</span>
              <span className="body">
                <span className="nm">戊申年</span>
                <span className="tt">机会变多，怎么选才不白忙</span>
              </span>
            </Link>
          </div>
        </section>

        <p className="digest-note">
          以上内容只描述倾向，不构成任何决策建议。命盘是观察自己的一个角度，不是结论。
        </p>

        <div className="guide-cta">
          <div>
            <p className="eyebrow">下一步</p>
            <h2>看完解释，不如看自己的盘</h2>
            <p>输入出生时间，排盘由开源引擎计算，解读只引用命盘里实际存在的星曜与四化。</p>
          </div>
          <Link href="/chart/new" className="btn">
            开始排盘
            <span className="arw" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}