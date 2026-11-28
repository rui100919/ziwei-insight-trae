import type { MetadataRoute } from 'next';

/**
 * robots.txt：允许抓取公开页面，只挡住接口。
 * 账户、报告、登录、支付等私有页改用页面级 noindex——
 * 在 robots 里 Disallow 会让爬虫看不到 noindex 标签，反而不利于清理收录。
 */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
