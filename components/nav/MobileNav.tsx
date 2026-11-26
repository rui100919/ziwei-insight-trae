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
        <LanguageSwitcher className="nav-lang" />
        <Link href={accountLink ? '/chart/new' : authHref} className="nav-cta">
          {accountLink ? t(lang, 'navChart') : t(lang, 'signUp')}
          <span className="nav-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}