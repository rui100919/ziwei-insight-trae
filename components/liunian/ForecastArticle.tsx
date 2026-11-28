import Link from 'next/link';
import type { ReactNode } from 'react';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ziwei-insight.com').replace(/\/$/, '');

export type ForecastSection = { heading: string; paragraphs: string[] };
export type ForecastFaq = { question: string; answer: string };
export type ForecastRelated = { href: string; name: string; title: string };

type Props = {
  /** 页面路径，如 /liunian/2028，用于 JSON-LD 与 canonical 对齐。 */
  path: string;
  /** 眉标：流年 · 2028 戊申。 */
  eyebrow: string;
  /** 面包屑当前项：2028 戊申年。 */
  crumb: string;
  title: string;
  description: string;
  minutes: number;
  lead: string[];
  sections: ForecastSection[];
  faq: ForecastFaq[];
  related: ForecastRelated[];
  /** 相邻年份互链，让同系列页面连成一条线而不是孤岛。 */
  prevYear?: { href: string; name: string };
  nextYear?: { href: string; name: string };
};

/**
 * 流年页正文（服务端组件）。
 *
 * 与 /guides 的 GuideArticle 同版式，但流年是逐年增加的一组页面，
 * 所以把骨架抽出来：新增年份只需要补一份数据，不必复制整段 JSX。
 * 正文必须直接进入 HTML，不放进客户端组件。
 */
export default function ForecastArticle({
  path,
  eyebrow,
  crumb,
  title,
  description,
  minutes,
  lead,
  sections,
  faq,
  related,
  prevYear,
  nextYear,
}: Props) {
  const url = `${SITE}${path}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title,
        description,
        inLanguage: 'zh-CN',
        mainEntityOfPage: url,
        url,
        articleSection: '流年',
        author: { '@type': 'Organization', name: 'Zi Wei Insight', url: SITE },
        publisher: { '@type': 'Organization', name: 'Zi Wei Insight', url: SITE },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  const yearNav: ReactNode =
    prevYear || nextYear ? (
      <nav className="guide-related" aria-label="相邻年份">
        <p className="eyebrow">同一组流年</p>
        <ul>
          {prevYear && (
            <li>
              <Link href={prevYear.href}>
                <span className="nm">{prevYear.name}</span>
                <span className="tt">看前一年</span>
              </Link>
            </li>
          )}
          {nextYear && (
            <li>
              <Link href={nextYear.href}>
                <span className="nm">{nextYear.name}</span>
                <span className="tt">看下一年</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    ) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="guide">
        <div className="guide-inner">
          <nav className="guide-crumb" aria-label="面包屑导航">
            <Link href="/">首页</Link>
            <span aria-hidden="true">/</span>
            <Link href="/guides">命理笔记</Link>
            <span aria-hidden="true">/</span>
            <span className="current">{crumb}</span>
          </nav>

          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <div className="guide-meta">
            <span>{minutes} 分钟阅读</span>
            <span>只描述倾向，不做预言</span>
          </div>

          {lead.map((text) => (
            <p className="guide-lead" key={text.slice(0, 12)}>
              {text}
            </p>
          ))}

          {sections.map((section) => (
            <section className="guide-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((text) => (
                <p key={text.slice(0, 12)}>{text}</p>
              ))}
            </section>
          ))}

          <section className="guide-faq" aria-labelledby="forecast-faq-title">
            <h2 id="forecast-faq-title">常见问题</h2>
            <dl>
              {faq.map((item) => (
                <div className="guide-faq-item" key={item.question}>
                  <dt>{item.question}</dt>
                  <dd>{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="digest-note">
            以上内容基于传统紫微斗数，只描述倾向，不构成任何预测、诊断或决策建议。命盘是观察自己的一个角度，不是结论。
          </p>

          <div className="guide-cta">
            <div>
              <p className="eyebrow">下一步</p>
              <h2>对照完清单，不如看自己的盘</h2>
              <p>输入出生时间，排盘由开源引擎计算，解读只引用命盘里实际存在的星曜与四化。</p>
            </div>
            <Link href="/chart/new" className="btn">
              开始排盘
              <span className="arw" aria-hidden="true">
                →
              </span>
            </Link>
          </div>

          {yearNav}

          <nav className="guide-related" aria-label="相关条目">
            <p className="eyebrow">继续读</p>
            <ul>
              {related.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className="nm">{item.name}</span>
                    <span className="tt">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </article>
    </>
  );
}