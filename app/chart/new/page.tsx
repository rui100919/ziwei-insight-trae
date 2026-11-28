import type { Metadata } from 'next';
import Client from './ChartNewClient';

/** 表单页对搜索没有价值，且含账户态内容，明确 noindex。 */
export const metadata: Metadata = {
  title: '排盘',
  robots: { index: false, follow: false },
};

/** 壳页：强制按请求渲染，避免静态预渲染被缓存长期命中后仍展示旧版表单。 */
export const dynamic = 'force-dynamic';

export default function Page() {
  return <Client />;
}