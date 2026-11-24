'use client';

import { LANG_META, SUPPORTED_LANGS, type Lang } from '@/lib/i18n';
import { useLang } from './LangProvider';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <select
      value={lang}
      onChange={(event) => setLang(event.target.value as Lang)}
      aria-label="Language"
      className={`cursor-pointer rounded-lg bg-transparent px-2 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink ${className}`}
    >
      {SUPPORTED_LANGS.map((item) => (
        <option key={item} value={item}>{LANG_META[item].name}</option>
      ))}
    </select>
  );
}
