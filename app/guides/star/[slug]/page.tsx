import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GuideArticle from '@/components/guides/GuideArticle';
import { STAR_GUIDES, getGuide, guidePath } from '@/lib/guides';

type Params = { slug: string };

/** 十四主星内容页，写法与十二宫一致，只是数据源不同。 */
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide('star', slug);
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
  return STAR_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export default async function StarGuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = getGuide('star', slug);
  if (!guide) notFound();
  return <GuideArticle guide={guide} />;
}