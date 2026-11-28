import type { Metadata } from 'next';

/** 报告页是登录后内容，不含可公开索引的信息。 */
export const metadata: Metadata = {
  title: '解读报告',
  robots: { index: false, follow: false },
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}