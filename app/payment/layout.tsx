import type { Metadata } from 'next';

/** 支付结果页是对账用途的单次页面，不参与索引。 */
export const metadata: Metadata = {
  title: '支付结果',
  robots: { index: false, follow: false },
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}