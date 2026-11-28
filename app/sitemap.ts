import type { MetadataRoute } from 'next';
import { ALL_GUIDES, guidePath } from '@/lib/guides';

/** 站点地图：只收录公开可索引页面。账户、支付、报告等私密页不收录。 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '');
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/full-preview`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/guides`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...ALL_GUIDES.map((guide) => ({
      url: `${base}${guidePath(guide)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: `${base}/legal`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}