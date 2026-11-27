'use client';

import Link from 'next/link';
import { t, type Lang } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LogoMark } from '@/components/Logo';

type Props = {
  lang: Lang;
  accountLink: boolean;
  authHref: string;
};

/**
 * 手机端导航：只有品牌 + 语言 + CTA。
 * 手机屏幕放不下四个文字链接，也不该塞进去——账户入口靠 CTA 与报告页返回。
 * 只在 ≤1080px 显示（切换规则见 globals.css 的 .nav-desktop / .nav-mobile）。
 */
export function MobileNav({ lang, accountLink, authHref }: Props) {
  return (
    <div className="nav-mobile">
      <Link href="/" className="brand" aria-label={t(lang, 'navBrandHomeAria')}>
        <span className="brand-mark">
          <LogoMark />
        </span>
        <span>
          <span className="brand-name">{t(lang, 'brand')}</span>
          {lang === 'zh' && <span className="brand-sub">Zi Wei · Guang Nian</span>}
        </span>
      </Link>

      <div className="nav-right">
        <Link
          href={accountLink ? '/account?v=3' : authHref}
          className="nav-icon"
          aria-label={accountLink ? t(lang, 'account') : t(lang, 'signIn')}
          title={accountLink ? t(lang, 'account') : t(lang, 'signIn')}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="8.4" r="3.6" />
            <path d="M4.6 20c0-3.9 3.3-6.6 7.4-6.6s7.4 2.7 7.4 6.6" />
          </svg>
        </Link>
        <LanguageSwitcher className="nav-lang" compact />
        <Link href={accountLink ? '/chart/new' : authHref} className="nav-cta">
          {accountLink ? t(lang, 'navChart') : t(lang, 'signUp')}
          <span className="nav-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}