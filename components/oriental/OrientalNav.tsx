'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { demoStore, isDemoMode } from '@/lib/demo';
import { t } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { DesktopNav } from '@/components/nav/DesktopNav';
import { MobileNav } from '@/components/nav/MobileNav';

/**
 * 全站深色东方导航外壳。
 * 登录态、滚动状态、登出等副作用集中在这里；电脑与手机两套结构分别在
 * components/nav/DesktopNav.tsx 与 MobileNav.tsx，靠 CSS 断点切换显示。
 */
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
      // 只把真正的浅色纸面段算进来；报告正文已是暗色，导航保持深色。
      const papers = document.querySelectorAll('.creed');
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
        <DesktopNav lang={lang} accountLink={accountLink} authHref={authHref} onSignOut={handleSignOut} />
        <MobileNav lang={lang} accountLink={accountLink} authHref={authHref} />
      </div>
    </nav>
  );
}
