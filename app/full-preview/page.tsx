import type { Metadata } from 'next';
import Client from './FullPreviewClient';

/** 样品页是唯一有实质内容的公开页，必须自指 canonical，否则会被当成首页副本。 */
export const metadata: Metadata = {
  title: '完整报告样品 · 十二宫逐宫解读',
  description:
    '紫微斗数完整报告样品：十二宫逐宫解读、十二段大限与当前阶段，排盘由开源引擎计算，解读只基于命盘事实。先看样品，再决定是否生成自己的报告。',
  alternates: { canonical: '/full-preview' },
  openGraph: {
    type: 'website',
    url: '/full-preview',
    siteName: 'Zi Wei Insight',
    title: '完整报告样品 · 十二宫逐宫解读',
    description: '十二宫逐宫解读、十二段大限与当前阶段，先看样品再决定。',
  },
};

/**
 * 壳页：强制按请求渲染。
 * 页面内容全在客户端组件里，静态预渲染只会生成一层壳；
 * 一旦被缓存长期命中，部署后用户仍会拿到旧壳与旧 chunk。
 */
export const dynamic = 'force-dynamic';

export default function Page() {
  return <Client />;
}