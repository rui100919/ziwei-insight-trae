import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LangProvider } from '@/components/LangProvider';
import { Header } from '@/components/Header';
import { MainFrame } from '@/components/MainFrame';
import { DemoBanner, SiteFooter } from '@/components/SiteChrome';
import { ScrollProgress } from '@/components/oriental/ScrollProgress';
import { RevealController } from '@/components/oriental/RevealController';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Zi Wei Insight · 紫微光年',
    template: '%s · Zi Wei Insight',
  },
  description:
    '精准紫微斗数排盘，克制的白话解读。注册即享一次免费基础解读，保存在你的私人账户。',
  applicationName: 'Zi Wei Insight',
  keywords: ['紫微斗数', '命盘', '排盘', 'Zi Wei Dou Shu', 'astrology', 'birth chart'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Zi Wei Insight',
    title: 'Zi Wei Insight · 紫微光年',
    description: '精准紫微斗数排盘，克制的白话解读。注册即享一次免费基础解读。',
    url: '/',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zi Wei Insight · 紫微光年',
    description: '精准紫微斗数排盘，克制的白话解读。',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#07080A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="zh" data-scroll-behavior="smooth">
      <body className="min-h-dvh bg-paper text-ink antialiased">
        {/* Plausible 埋点：仅当 NEXT_PUBLIC_PLAUSIBLE_DOMAIN 已配置时注入。
            隐私友好，无需 GDPR 弹窗；出站链接追踪自动内置。 */}
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
        <LangProvider>
          <div className="grain" aria-hidden="true" />
          <div className="vignette" aria-hidden="true" />
          <ScrollProgress />
          <RevealController />
          <DemoBanner />
          <Header />
          <MainFrame>{children}</MainFrame>
          <SiteFooter />
        </LangProvider>
      </body>
    </html>
  );
}
