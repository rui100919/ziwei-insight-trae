'use client';

import { useEffect, useMemo, useState } from 'react';

const CX = 220;
const CY = 220;
const r2 = (n: number) => Math.round(n * 100) / 100;
const polar = (radius: number, angleDeg: number) => ({
  x: r2(CX + Math.cos(((angleDeg - 90) * Math.PI) / 180) * radius),
  y: r2(CY + Math.sin(((angleDeg - 90) * Math.PI) / 180) * radius),
});

type ChartStar = { x: number; y: number; r: number; opacity: number };

/**
 * 封面动态星盘 SVG（圆环 / 放射线 / 十二宫标签 / 中心星）。
 * 静态几何用确定性三角函数计算（SSR/CSR 一致），随机星点仅客户端生成。
 */
export function CoverChart({ labels, className = '' }: { labels: readonly string[]; className?: string }) {
  const [chartStars, setChartStars] = useState<ChartStar[]>([]);
  const latinLabels = labels.some((name) => /[A-Za-zÀ-ÿ]/.test(name));

  useEffect(() => {
    const arr: ChartStar[] = [];
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const radius = 88 + Math.random() * 116;
      arr.push({
        x: r2(CX + Math.cos(a) * radius),
        y: r2(CY + Math.sin(a) * radius),
        r: r2(Math.random() * 1.2 + 0.5),
        opacity: r2(Math.random() * 0.4 + 0.15),
      });
    }
    setChartStars(arr);
  }, []);

  const outerDots = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const d = i * 15;
        const p = polar(211, d);
        return { ...p, r: d % 45 === 0 ? 1.6 : 0.9, opacity: d % 45 === 0 ? 0.8 : 0.35 };
      }),
    []
  );

  const innerTicks = useMemo(
    () =>
      Array.from({ length: 72 }, (_, t) => {
        const p1 = polar(198, t * 5);
        const p2 = polar(t % 6 === 0 ? 190 : 194, t * 5);
        return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, major: t % 6 === 0 };
      }),
    []
  );

  const radials = useMemo(
    () =>
      Array.from({ length: 12 }, (_, p) => {
        const a = p * 30;
        const inner = polar(82, a);
        const outer = polar(216, a);
        return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
      }),
    []
  );

  const labelNodes = useMemo(
    () =>
      labels.slice(0, 12).map((name, idx) => {
        const p = polar(167, idx * 30);
        return { ...p, name, opacity: idx === 0 ? 0.9 : 0.55 };
      }),
    [labels]
  );

  return (
    <figure className={`cover-chart ${className}`} aria-hidden="true">
      <svg viewBox="0 0 440 440" fill="none">
        <g opacity="0.65">
          {chartStars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#E6CB92" opacity={s.opacity} />
          ))}
        </g>
        <g className="ring-spin" stroke="#B8945C" opacity="0.55">
          <circle cx={CX} cy={CY} r={206} strokeWidth="0.6" strokeDasharray="2 7" opacity="0.55" />
          <circle cx={CX} cy={CY} r={188} strokeWidth="0.5" strokeDasharray="1 5" opacity="0.45" />
          {outerDots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#B8945C" stroke="none" opacity={d.opacity} />
          ))}
        </g>
        <g className="ring-spin-rev" stroke="#B8945C" opacity="0.32">
          {innerTicks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              strokeWidth={t.major ? 0.9 : 0.5}
            />
          ))}
        </g>
        <circle cx={CX} cy={CY} r={216} stroke="#B8945C" strokeWidth="0.6" opacity="0.45" />
        <circle cx={CX} cy={CY} r={198} stroke="#B8945C" strokeWidth="0.45" opacity="0.18" />
        <circle cx={CX} cy={CY} r={132} stroke="#B8945C" strokeWidth="0.45" opacity="0.26" />
        <circle cx={CX} cy={CY} r={82} stroke="#B8945C" strokeWidth="0.45" opacity="0.22" />
        <g stroke="#B8945C" strokeWidth="0.45" opacity="0.22">
          {radials.map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
          ))}
        </g>
        <g
          fill="#C8A86F"
          fontSize={latinLabels ? 9 : 12}
          letterSpacing={latinLabels ? 0.4 : 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Songti SC, Noto Serif SC, serif"
        >
          {labelNodes.map((l, i) => (
            <text key={i} x={l.x} y={l.y} opacity={l.opacity}>
              {l.name}
            </text>
          ))}
        </g>
        <path
          d="M220 185l9.4 25.6L255 220l-25.6 9.4L220 255l-9.4-25.6L185 220l25.6-9.4z"
          fill="#E6CB92"
          opacity="0.85"
        />
        <circle cx={CX} cy={CY} r={3} fill="#FCF8EF" />
      </svg>
    </figure>
  );
}
