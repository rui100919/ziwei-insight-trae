import Link from 'next/link';
import { guidePath, readingMinutes, relatedFor, type Guide } from '@/lib/guides';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ziwei-insight.com').replace(/\/$/, '');

/**
 * 内容页正文（服务端组件）。
 *
 * 这类页面存在的意义是让搜索引擎抓到「命盘怎么读」的实质内容，
 * 所以正文必须直接渲染进 HTML，不放进客户端组件、不按需加载。
 * 结构化数据用 Article + FAQPage：前者说明这是一篇解释性文章，
 * 后者让 FAQ 有机会出现在搜索结果摘要里。
 */
export default function GuideArticle({ guide }: { guide: Guide }) {
  const related = relatedFor(guide);
  const url = `${SITE}${guidePath(guide)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        inLanguage: 'zh-CN',
        mainEntityOfPage: url,
        url,
        articleSection: guide.kind === 'palace' ? '十二宫' : '十四主星',
        author: { '@type': 'Organization', name: 'Zi Wei Insight', url: SITE },
        publisher: { '@type': 'Organization', name: 'Zi Wei Insight', url: SITE },
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

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
            <span className="current">{guide.name}</span>
          </nav>

          <p className="eyebrow">{guide.eyebrow}</p>
          <h1>{guide.title}</h1>
          <div className="guide-meta">
            <span>{readingMinutes(guide)} 分钟阅读</span>
            <span>只描述倾向，不做预言</span>
          </div>

          {guide.lead.map((text) => (
            <p className="guide-lead" key={text.slice(0, 12)}>
              {text}
            </p>
          ))}

          {guide.sections.map((section) => (
            <section className="guide-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((text) => (
                <p key={text.slice(0, 12)}>{text}</p>
              ))}
            </section>
          ))}

          <section className="guide-faq" aria-labelledby="guide-faq-title">
            <h2 id="guide-faq-title">常见问题</h2>
            <dl>
              {guide.faq.map((item) => (
                <div className="guide-faq-item" key={item.question}>
                  <dt>{item.question}</dt>
                  <dd>{item.answer}</dd>
                </div>
              ))}
            </dl>
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

          <nav className="guide-related" aria-label="相关条目">
            <p className="eyebrow">继续读</p>
            <ul>
              {related.map((item) => (
                <li key={`${item.kind}-${item.slug}`}>
                  <Link href={guidePath(item)}>
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