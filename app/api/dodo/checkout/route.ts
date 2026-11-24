import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { isDemoMode } from '@/lib/demo';
import { getPaymentProvider, isPaymentsConfigured } from '@/lib/payments/config';
import { createDodoCheckout, FULL_REPORT_AMOUNT, FULL_REPORT_CURRENCY } from '@/lib/dodo';

export const runtime = 'nodejs';

/**
 * POST /api/dodo/checkout — 创建 Dodo 托管 Checkout，返回跳转 URL。
 * Body: { productId: 'full_report' }
 *
 * 金额与商品都来自服务端，不接收前端价格；每次支付尝试新建本地订单与 session。
 * 展示币种交给 Dodo 按账单国家自适应定价，本地订单仍以 USD 记账。
 */
export async function POST(request: Request) {
  if (isDemoMode()) return NextResponse.json({ error: 'DEMO_MODE' }, { status: 400 });
  if (getPaymentProvider() !== 'dodo' || !isPaymentsConfigured()) {
    return NextResponse.json({ error: 'PAYMENTS_NOT_CONFIGURED' }, { status: 503 });
  }

  try {
    const body = await request.json() as { productId?: string };
    if (body.productId !== 'full_report') {
      return NextResponse.json({ error: 'INVALID_PRODUCT' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'NEED_LOGIN' }, { status: 401 });

    const admin = createAdmin();
    const { data: order, error } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        amount: FULL_REPORT_AMOUNT,
        currency: FULL_REPORT_CURRENCY,
        payment_provider: 'dodo',
        status: 'pending',
      })
      .select('id')
      .single();
    if (error) throw error;

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    const displayName = (user.user_metadata?.display_name as string | undefined) ?? null;
    const session = await createDodoCheckout({
      orderId: order.id,
      userId: user.id,
      email: user.email,
      customerName: displayName,
      siteUrl,
    });

    // 先落库再返回跳转地址，Webhook 才能按 session 找回订单。
    const { error: updErr } = await admin
      .from('orders')
      .update({ checkout_session_id: session.sessionId })
      .eq('id', order.id);
    if (updErr) throw updErr;

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'UNKNOWN';
    return NextResponse.json({ error: 'CHECKOUT_FAILED', detail }, { status: 500 });
  }
}
