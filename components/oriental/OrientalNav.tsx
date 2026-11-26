'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { demoStore, isDemoMode } from '@/lib/demo';
import { t } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LogoMark } from '@/components/Logo';

/** 全站深色东方导航（替代旧 Header）。集成 LanguageSwitcher 与登录/账户状态。 */
export function OrientalNav() {
  const { lang } = useLang();
  const pathname = usePathname() ?? '/';
  const [signedIn, setSignedIn] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // 登录态检测（沿用全站模式：demoStore.getUser 或 supabase.auth.getUser；
  // 不使用 getSession/onAuthStateChange，因为演示客户端未实现它们）。
  // 依赖 pathname：登录/登出后总会发生导航，导航时重新检测。
  useEffect(() => {
    let active = true;
    if (isDemoMode()) {
      setSignedIn(!!demoStore.getUser());
      return;
    }
    createClient().auth.getUser().then(({ data }) => {
      if (active) setSignedIn(!!data.user);
    });
    return () => { active = false; };
  }, [pathname]);

  // 滚动态：.scrolled（滚动>24）与 .on-paper（nav 压在 creed/report 浅色段上时）
  useEffect(() => {
    const onScroll = () => {
      const el = navRef.current;
      if (!el) return;
      const y = window.scrollY;
      el.classList.toggle('scrolled', y > 24);
      let onPaper = false;
      const papers = document.querySelectorAll('.creed, .report');
      papers.forEach((p) => {
        const r = p.getBoundingClientRect();
        if (r.top <= 80 && r.bottom >= 80) onPaper = true;
      });
      el.classList.toggle('on-paper', onPaper);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const demo = isDemoMode();
  const accountLink = signedIn || demo;
  const authHref = `/auth?next=${encodeURIComponent(pathname.startsWith('/auth') ? '/' : pathname)}`;

  async function handleSignOut() {
    if (isDemoMode()) demoStore.clearUser();
    else await createClient().auth.signOut();
    window.location.href = '/';
  }

  return (
    <nav ref={navRef} className="nav" aria-label={t(lang, 'navMainAria')}>
      <div className="nav-inner">
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
          <Link href="/full-preview" className="nav-link">
            {t(lang, 'navSample')}
          </Link>
          {accountLink ? (
            <Link href="/account" className="nav-link">
              {t(lang, 'account')}
            </Link>
          ) : (
            <Link href={authHref} className="nav-link">
              {t(lang, 'signIn')}
            </Link>
          )}
          {accountLink && (
            <button type="button" onClick={handleSignOut} className="nav-link nav-signout">
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
    </nav>
  );
}
