import { ImageResponse } from 'next/og';

export const alt = 'Zi Wei Insight — an accurate chart, a measured reading';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** 社交分享图：品牌深色底 + 金色罗盘 + 英文文案（避免中文字体缺失导致方框）。 */
export default function OpengraphImage() {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    return {
      x1: 120 + Math.cos(angle) * 78,
      y1: 120 + Math.sin(angle) * 78,
      x2: 120 + Math.cos(angle) * 100,
      y2: 120 + Math.sin(angle) * 100,
    };
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#15130f',
          padding: '72px 84px',
          color: '#f7f2e8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width="120" height="120" viewBox="0 0 240 240" fill="none">
            <circle cx="120" cy="120" r="108" stroke="#c9a45c" strokeWidth="3" />
            <circle cx="120" cy="120" r="72" stroke="#c9a45c" strokeWidth="1.5" opacity="0.55" />
            {ticks.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#c9a45c" strokeWidth="2" opacity="0.7" />
            ))}
            <path d="M120 68l14.5 38 38 14.5-38 14.5-14.5 38-14.5-38-38-14.5 38-14.5z" fill="#c9a45c" />
          </svg>
          <div style={{ fontSize: 30, letterSpacing: 2, color: '#c9a45c' }}>ZI WEI INSIGHT</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 64, lineHeight: 1.1, maxWidth: 900 }}>An accurate chart.</div>
          <div style={{ fontSize: 64, lineHeight: 1.1, maxWidth: 900, color: '#c9a45c' }}>A measured reading.</div>
          <div style={{ fontSize: 26, color: 'rgba(247,242,232,0.62)', marginTop: 8 }}>
            Zi Wei Dou Shu · plain-language readings · one free on sign-up
          </div>
        </div>
      </div>
    ),
    size,
  );
}
