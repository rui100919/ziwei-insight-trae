import type { Metadata } from 'next';

/** 法务页是公开页，但页面本体是客户端组件，metadata 只能放在这一层布局里。 */
export const metadata: Metadata = {
  title: '服务条款与隐私政策',
  description:
    '紫微光年的服务条款与隐私政策：出生资料如何保存与删除、生成内容如何使用、支付与退款说明、联系邮箱。',
  alternates: { canonical: '/legal' },
  openGraph: {
    type: 'website',
    url: '/legal',
    siteName: 'Zi Wei Insight',
    title: '服务条款与隐私政策',
    description: '出生资料如何保存与删除、生成内容如何使用、支付与退款说明。',
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}