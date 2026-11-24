// 固定精度，避免三角函数在服务端/客户端产生末位浮点差异导致水合不匹配。
const r = (n: number) => Math.round(n * 1e6) / 1e6;

/** 装饰性十二宫罗盘。纯展示，命盘数据来自排盘引擎而非此组件。 */
export function ChartWheel({
  labels,
  className = '',
  showLabels = true,
}: {
  labels: readonly string[];
  className?: string;
  showLabels?: boolean;
}) {
  const latinLabels = labels.some((name) => /[A-Za-zÀ-ÿ]/.test(name));
  const spokes = Array.from({ length: 12 }, (_, index) => {
    const angle = (index * 30 * Math.PI) / 180;
    return {
      x1: r(200 + Math.cos(angle) * 118),
      y1: r(200 + Math.sin(angle) * 118),
      x2: r(200 + Math.cos(angle) * 190),
      y2: r(200 + Math.sin(angle) * 190),
    };
  });

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      role="img"
      aria-label="Decorative Zi Wei Dou Shu chart with twelve palaces"
    >
      <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="1" opacity="0.75" />
      <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
      <circle cx="200" cy="200" r="118" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      {spokes.map((spoke, index) => (
        <line
          key={index}
          x1={spoke.x1}
          y1={spoke.y1}
          x2={spoke.x2}
          y2={spoke.y2}
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.45"
        />
      ))}
      {showLabels &&
        labels.slice(0, 12).map((palace, index) => {
          const angle = ((index * 30 - 90) * Math.PI) / 180;
          const radius = 175;
          const x = r(200 + Math.cos(angle) * radius);
          const y = r(200 + Math.sin(angle) * radius);
          return (
            <text
              key={palace}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="currentColor"
              fontSize={latinLabels ? 9 : 11}
              letterSpacing={latinLabels ? 0.4 : 1.5}
              opacity="0.8"
              style={{ fontFamily: '"Iowan Old Style", "Songti SC", "Noto Serif CJK SC", serif' }}
            >
              {palace}
            </text>
          );
        })}
      <circle cx="200" cy="200" r="66" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
      <path
        d="M200 166l9.5 24.5L234 200l-24.5 9.5L200 234l-9.5-24.5L166 200l24.5-9.5z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="200" cy="200" r="2.5" fill="currentColor" />
    </svg>
  );
}
