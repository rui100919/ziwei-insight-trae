import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GuideArticle from '@/components/guides/GuideArticle';
import { PALACE_GUIDES, getGuide, guidePath } from '@/lib/guides';

type Params = { slug: string };

/**
 * 十二宫内容页。
 *
 * 正文由 GuideArticle 在服务端渲染，爬虫拿到的就是全文。
 * canonical 必须自指：这 12 页主题相近，指错会互相吞掉排名。
 */
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide('palace', slug);
  if (!guide) return { title: '页面未找到', robots: { index: false, follow: false } };

  const path = guidePath(guide);
  return {
    title: guide.metaTitle,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      siteName: 'Zi Wei Insight',
      title: guide.metaTitle,
      description: guide.description,
    },
  };
}

export function generateStaticParams() {
  return PALACE_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export default async function PalaceGuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = getGuide('palace', slug);
  if (!guide) notFound();
  return <GuideArticle guide={guide} />;
}