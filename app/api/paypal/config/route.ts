import { NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demo';
import { getPaymentProvider, isPaymentsConfigured } from '@/lib/payments/config';
import { paypalPublicConfig } from '@/lib/paypal';

export const runtime = 'nodejs';

/** GET /api/paypal/config — 前端渲染 PayPal 智能按钮所需的公开配置（不含密钥）。 */
export async function GET() {
  if (isDemoMode() || getPaymentProvider() !== 'paypal' || !isPaymentsConfigured()) {
    return NextResponse.json({ enabled: false }, { status: 200 });
  }
  return NextResponse.json({ enabled: true, ...paypalPublicConfig() });
}
