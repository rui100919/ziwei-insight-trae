'use client';

import Link from 'next/link';
import { t, type Lang } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LogoMark } from '@/components/Logo';

type Props = {
  lang: Lang;
  /** 已登录（或演示模式）：显示「我的账户 / 退出」，CTA 指向排盘。 */
  accountLink: boolean;
  authHref: string;
  onSignOut: () => void;
};

/**
 * 电脑端导航：品牌 + 四个文字链接 + 语言 + CTA。
 * 只在 ≥1081px 显示（切换规则见 globals.css 的 .nav-desktop / .nav-mobile）。
 * 状态与副作用由外层 OrientalNav 负责，这里只负责结构。
 */
export function DesktopNav({ lang, accountLink, authHref, onSignOut }: Props) {
  return (
    <div className="nav-desktop">
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
        <Link href="/" className="nav-link">
          {t(lang, 'navHome')}
        </Link>
        <Link href="/full-preview?v=3" className="nav-link">
          {t(lang, 'navSample')}
        </Link>
        {accountLink ? (
          <Link href="/account?v=3" className="nav-link">
            {t(lang, 'account')}
          </Link>
        ) : (
          <Link href={authHref} className="nav-link">
            {t(lang, 'signIn')}
          </Link>
        )}
        {accountLink && (
          <button type="button" onClick={onSignOut} className="nav-link nav-signout">
            {t(lang, 'signOut')}
          </button>
        )}
        <LanguageSwitcher className="nav-lang" />
        <Link href={accountLink ? '/chart/new' : authHref} className="nav-cta">
          {accountLink ? t(lang, 'navChart') : t(lang, 'signUp')}
          <span className="nav-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}