const TONES = {
  available: 'border-gold/40 bg-gold/10 text-gold-soft',
  reserved: 'border-[#c4685a]/40 bg-[#c4685a]/10 text-[#c4685a]',
  consumed: 'border-line bg-paper-deep/70 text-ink-muted',
  completed: 'border-[#7a9a6d]/45 bg-[#7a9a6d]/12 text-[#a8c49c]',
  neutral: 'border-line bg-ink/5 text-ink-muted',
  danger: 'border-[#c4685a]/45 bg-[#c4685a]/10 text-[#c4685a]',
} as const;

export type BadgeTone = keyof typeof TONES;

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${TONES[tone]}`}>
      {label}
    </span>
  );
}
