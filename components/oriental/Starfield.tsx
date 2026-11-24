'use client';

import { useEffect, useState } from 'react';

type Star = {
  left: string;
  top: string;
  size: string;
  o: string;
  dur: string;
  delay: string;
  glow: boolean;
};

/** 随机星点装饰。随机数仅在客户端生成，避免 SSR/CSR 水合不一致；reduced-motion 下不生成。 */
export function Starfield({ count = 70, className = '' }: { count?: number; className?: string }) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const arr: Star[] = [];
    for (let i = 0; i < count; i++) {
      const big = Math.random() >= 0.86;
      const size = big ? Math.random() * 2.2 + 1.6 : Math.random() * 1.5 + 0.8;
      arr.push({
        left: (Math.random() * 100).toFixed(2) + '%',
        top: (Math.random() * 100).toFixed(2) + '%',
        size: size.toFixed(2) + 'px',
        o: (Math.random() * 0.5 + 0.25).toFixed(2),
        dur: (Math.random() * 6 + 4).toFixed(1) + 's',
        delay: (Math.random() * 6).toFixed(2) + 's',
        glow: size > 2.1,
      });
    }
    setStars(arr);
  }, [count]);

  return (
    <div className={`stars ${className}`} aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={
            {
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              '--o': s.o,
              '--dur': s.dur,
              '--delay': s.delay,
              boxShadow: s.glow ? '0 0 6px 1px rgba(230,203,146,.5)' : undefined,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
