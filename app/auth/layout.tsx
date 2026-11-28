import type { Metadata } from 'next';

/** 登录/注册及其子页（忘记密码、重设密码）都不该进搜索索引。 */
export const metadata: Metadata = {
  title: '登录与注册',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}