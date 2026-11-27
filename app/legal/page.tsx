'use client';

import Link from 'next/link';
import type { Lang } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { getLegalContent, LEGAL_CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE } from '@/lib/legal-content';

const S: Record<Lang, { eyebrow: string; effective: string; navAria: string; contact: string; back: string }> = {
  zh: { eyebrow: '条款与政策', effective: '生效日期', navAria: '章节导航', contact: '联系邮箱', back: '← 返回首页' },
  en: { eyebrow: 'TERMS & POLICIES', effective: 'Effective', navAria: 'Section navigation', contact: 'Contact', back: '← Back to home' },
  es: { eyebrow: 'TÉRMINOS Y POLÍTICAS', effective: 'Vigencia', navAria: 'Navegación por secciones', contact: 'Contacto', back: '← Volver al inicio' },
  fr: { eyebrow: 'CONDITIONS & POLITIQUES', effective: 'Entrée en vigueur', navAria: 'Navigation par section', contact: 'Contact', back: '← Retour à l’accueil' },
  de: { eyebrow: 'BEDINGUNGEN & RICHTLINIEN', effective: 'Gültig ab', navAria: 'Abschnittsnavigation', contact: 'Kontakt', back: '← Zurück zur Startseite' },
  ja: { eyebrow: '規約とポリシー', effective: '発効日', navAria: 'セクションナビゲーション', contact: 'お問い合わせ', back: '← ホームに戻る' },
};

export default function LegalPage() {
  const { lang } = useLang();
  const s = S[lang];
  const c = getLegalContent(lang);
  const effective = LEGAL_EFFECTIVE_DATE[lang];

  return (
    <div className="legal-page mx-auto max-w-3xl px-5 pt-28 pb-20">
      <p className="eyebrow">{s.eyebrow}</p>
      <h1 className="serif mt-3 text-4xl font-normal tracking-tight text-ink sm:text-5xl">{c.title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{c.intro}</p>
      <p className="mt-2 text-xs text-ink-muted">
        {s.effective}: {effective}
      </p>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label={s.navAria}>
        {c.sections.map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            className="rounded-full border border-line px-4 py-1.5 text-xs text-ink-soft transition-colors hover:border-gold hover:text-gold"
          >
            {sec.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-14">
        {c.sections.map((sec) => (
          <section key={sec.id} id={sec.id} className="scroll-mt-24">
            <h2 className="serif border-b border-line pb-3 text-2xl font-normal text-ink">{sec.title}</h2>
            <div className="mt-5 space-y-4">
              {sec.blocks.map((b, i) => {
                if (b.kind === 'h') {
                  return <h3 key={i} className="pt-2 text-sm font-semibold text-gold">{b.text}</h3>;
                }
                if (b.kind === 'list') {
                  return (
                    <ul key={i} className="ml-5 list-disc space-y-2 text-sm leading-[1.8] text-ink-soft">
                      {b.items.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  );
                }
                return <p key={i} className="text-sm leading-[1.85] text-ink-soft">{b.text}</p>;
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 border-t border-line pt-6 text-xs text-ink-muted">
        <p>
          {s.contact}:{' '}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="underline decoration-line hover:text-gold">{LEGAL_CONTACT_EMAIL}</a>
        </p>
        <Link href="/" className="link mt-4 inline-block text-sm">
          {s.back}
        </Link>
      </div>
    </div>
  );
}
