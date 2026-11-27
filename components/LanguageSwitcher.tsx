'use client';

import { LANG_META, SUPPORTED_LANGS, type Lang } from '@/lib/i18n';
import { useLang } from './LangProvider';

/**
 * 语言切换。
 * compact：手机导航里只显示短代码（中文 / EN / DE …），
 * 避免「Español」这种长选项把胶囊撑宽、挤掉旁边的 CTA。
 */
export function LanguageSwitcher({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <select
      value={lang}
      onChange={(event) => setLang(event.target.value as Lang)}
      aria-label="Language"
      className={`cursor-pointer rounded-lg bg-transparent px-2 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink ${className}`}
    >
      {SUPPORTED_LANGS.map((item) => (
        <option key={item} value={item}>{compact ? LANG_META[item].short : LANG_META[item].name}</option>
      ))}
    </select>
  );
}
