'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** 工具型页面（登录、排盘、账户、支付）用更清晰的产品化排版；阅读与营销页保留书卷气。 */
const APP_ROUTES = ['/auth', '/chart', '/account', '/payment'];

export function MainFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const isApp = APP_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  // 导航为 fixed，页面各自控制宽度与内边距（重做页用 .wrap/.hero-inner；其余页面在自身容器内处理）。
  return <main className={`min-h-dvh ${isApp ? 'app-surface' : ''}`}>{children}</main>;
}
