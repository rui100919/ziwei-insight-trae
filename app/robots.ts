import type { MetadataRoute } from 'next';

/**
 * robots.txt：允许抓取公开页面，禁止抓取账户与接口。
 * 站点地址优先取 NEXT_PUBLIC_SITE_URL。
 */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account', '/api/', '/payment/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
