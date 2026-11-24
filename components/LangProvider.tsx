'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { isLang, LANG_META, normalizeLang, type Lang } from '@/lib/i18n';

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LanguageContext = createContext<Ctx>({ lang: 'zh', setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh');

  useEffect(() => {
    const saved = window.localStorage.getItem('zw-lang');
    if (isLang(saved)) { setLangState(saved); return; }
    // 没有手动选择过时，按浏览器语言列表的第一个受支持主语言显示。
    const browser = navigator.languages?.length ? navigator.languages : [navigator.language];
    const detected = browser.map((item) => item.toLowerCase().split('-')[0]).find(isLang);
    setLangState(detected ?? normalizeLang(navigator.language));
  }, []);

  // 切语言时同步 <html lang>，屏幕阅读器和浏览器翻译都依赖它。
  useEffect(() => {
    document.documentElement.lang = LANG_META[lang].htmlLang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem('zw-lang', l);
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}
