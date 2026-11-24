import Link from 'next/link';

// 固定精度，避免三角函数在服务端/客户端产生末位浮点差异导致水合不匹配。
const r = (n: number) => Math.round(n * 1e6) / 1e6;

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  const ticks = Array.from({ length: 12 }, (_, index) => {
    const angle = (index * 30 * Math.PI) / 180;
    return {
      x1: r(24 + Math.cos(angle) * 15.5),
      y1: r(24 + Math.sin(angle) * 15.5),
      x2: r(24 + Math.cos(angle) * 20.5),
      y2: r(24 + Math.sin(angle) * 20.5),
    };
  });

  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="21.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="14.5" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      {ticks.map((tick, index) => (
        <line
          key={index}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.7"
        />
      ))}
      <path
        d="M24 13.5l2.9 7.6 7.6 2.9-7.6 2.9-2.9 7.6-2.9-7.6-7.6-2.9 7.6-2.9z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Wordmark({
  href = '/',
  tone = 'dark',
  label = 'Zi Wei Insight',
  className = '',
}: {
  href?: string;
  tone?: 'dark' | 'light';
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 ${tone === 'light' ? 'text-paper' : 'text-ink'} ${className}`}
    >
      <LogoMark className="h-9 w-9 text-gold transition-transform duration-500 group-hover:rotate-12" />
      <span className="whitespace-nowrap font-serif text-[19px] leading-none tracking-tight">
        {label}
      </span>
    </Link>
  );
}
