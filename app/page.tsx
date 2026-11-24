import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { t, normalizeLang, type Lang } from '@/lib/i18n';
import { Home } from './_home';

/**
 * 服务端只能依据请求头猜测语言（用户选择保存在 localStorage，服务端读不到），
 * 用于生成静态 <title>/<description>；正文的实时多语言由客户端 <Home /> 通过 useLang() 渲染。
 */
async function detectLang(): Promise<Lang> {
  try {
    const h = await headers();
    const accept = h.get('accept-language');
    if (accept) return normalizeLang(accept.split(',')[0]);
  } catch {
    // headers() 在某些渲染上下文不可用时回退默认语言。
  }
  return 'zh';
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await detectLang();
  return {
    title: t(lang, 'pageIndexTitle'),
    description: t(lang, 'pageIndexDesc'),
  };
}

export default function Page() {
  return <Home />;
}
