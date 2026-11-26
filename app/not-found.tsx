'use client';

import Link from 'next/link';
import { LogoMark } from '@/components/Logo';
import { useLang } from '@/components/LangProvider';
import type { Lang } from '@/lib/i18n';

const S: Record<Lang, { title: string; subtitle: string; home: string; gen: string }> = {
  zh: { title: '这一页不在命盘上', subtitle: '你访问的页面不存在，或者已经被移除了。', home: '回到首页', gen: '生成解读' },
  en: { title: "This page isn't on the chart.", subtitle: 'The page you visited does not exist or has been removed.', home: 'Back to home', gen: 'Generate a reading' },
  es: { title: 'Esta página no está en la carta', subtitle: 'La página que buscas no existe o ha sido eliminada.', home: 'Volver al inicio', gen: 'Generar una lectura' },
  fr: { title: 'Cette page n’est pas sur le thème', subtitle: 'La page que vous cherchez n’existe pas ou a été supprimée.', home: 'Retour à l’accueil', gen: 'Générer une lecture' },
  de: { title: 'Diese Seite ist nicht im Horoskop', subtitle: 'Die von dir besuchte Seite existiert nicht oder wurde entfernt.', home: 'Zurück zur Startseite', gen: 'Eine Deutung erstellen' },
  ja: { title: 'このページは命盤にありません', subtitle: 'アクセスしたページは存在しないか、削除されました。', home: 'ホームに戻る', gen: '解読を生成' },
};

export default function NotFound() {
  const { lang } = useLang();
  const s = S[lang];
  return (
    <div className="mx-auto max-w-lg px-5 pt-28 pb-20 text-center">
      <div className="flex justify-center"><LogoMark className="h-12 w-12 text-gold" /></div>
      <p className="mt-8 font-serif text-[72px] leading-none tracking-tight text-ink-muted">404</p>
      <h1 className="mt-4 font-serif text-[30px] leading-tight text-ink">{s.title}</h1>
      <p className="mt-5 text-sm leading-relaxed text-ink-soft">{s.subtitle}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn px-6 py-3">{s.home} <span aria-hidden="true">→</span></Link>
        <Link href="/chart/new?v=3" className="btn-ghost px-6 py-3">{s.gen}</Link>
      </div>
    </div>
  );
}
