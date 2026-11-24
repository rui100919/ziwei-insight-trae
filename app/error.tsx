'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { LogoMark } from '@/components/Logo';
import { useLang } from '@/components/LangProvider';
import type { Lang } from '@/lib/i18n';

const S: Record<Lang, { title: string; subtitle: string; retry: string; home: string }> = {
  zh: { title: '出了点问题', subtitle: '页面加载时发生了意外错误。你可以重试一次，或回到首页。', retry: '重试', home: '回到首页' },
  en: { title: 'Something went wrong', subtitle: 'An unexpected error occurred while loading the page. You can try again or go back home.', retry: 'Retry', home: 'Back to home' },
  es: { title: 'Algo salió mal', subtitle: 'Ocurrió un error inesperado al cargar la página. Puedes intentarlo de nuevo o volver al inicio.', retry: 'Reintentar', home: 'Volver al inicio' },
  fr: { title: 'Une erreur est survenue', subtitle: 'Une erreur inattendue s’est produite pendant le chargement. Vous pouvez réessayer ou retourner à l’accueil.', retry: 'Réessayer', home: 'Retour à l’accueil' },
  de: { title: 'Etwas ist schiefgelaufen', subtitle: 'Beim Laden der Seite ist ein unerwarteter Fehler aufgetreten. Du kannst es erneut versuchen oder zur Startseite zurückkehren.', retry: 'Erneut versuchen', home: 'Zurück zur Startseite' },
  ja: { title: '問題が発生しました', subtitle: 'ページの読み込み中に予期しないエラーが発生しました。再試行するか、ホームに戻ることができます。', retry: '再試行', home: 'ホームに戻る' },
};

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { lang } = useLang();
  const s = S[lang];
  useEffect(() => {
    // 生产环境可在这里上报到错误监控服务。
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-5 pt-28 pb-20 text-center">
      <div className="flex justify-center"><LogoMark className="h-12 w-12 text-gold" /></div>
      <h1 className="mt-8 font-serif text-[30px] leading-tight text-ink">{s.title}</h1>
      <p className="mt-5 text-sm leading-relaxed text-ink-soft">{s.subtitle}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="btn px-6 py-3" onClick={() => reset()}>{s.retry}</button>
        <Link href="/" className="btn-ghost px-6 py-3">{s.home}</Link>
      </div>
    </div>
  );
}
