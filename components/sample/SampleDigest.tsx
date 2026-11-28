import { SAMPLE_INTRO, SAMPLE_NOTE, SAMPLE_SECTIONS } from '@/lib/sample-report';

/**
 * 服务端渲染的样例解读。
 * 放在客户端实时样品之前：爬虫能拿到完整文字，访客先读到的是稳定的样例，
 * 再往下才是会自动重新生成的实时样品。
 */
export default function SampleDigest() {
  return (
    <section className="digest" aria-labelledby="digest-title">
      <div className="digest-inner">
        <p className="eyebrow">示例解读 · 节选</p>
        <h2 id="digest-title">一张固定的虚构命盘，十二宫怎么看</h2>
        {SAMPLE_INTRO.map((text) => (
          <p className="lead" key={text.slice(0, 12)}>
            {text}
          </p>
        ))}
        {SAMPLE_SECTIONS.map((section) => (
          <div className="digest-item" key={section.palace}>
            <h3>{section.title}</h3>
            {section.paragraphs.map((text) => (
              <p key={text.slice(0, 12)}>{text}</p>
            ))}
          </div>
        ))}
        <p className="digest-note">{SAMPLE_NOTE}</p>
      </div>
    </section>
  );
}