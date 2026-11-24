import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { getStripe, isPaymentsConfigured, FULL_REPORT_AMOUNT, FULL_REPORT_CURRENCY } from '@/lib/stripe';
import { isDemoMode } from '@/lib/demo';
import { getPaymentProvider } from '@/lib/payments/config';

export const runtime = 'nodejs';

/**
 * POST /api/checkout — 创建 Stripe Checkout 会话
 * Body: { productId: 'full_report' }
 * 服务端定价：金额只来自环境变量，不接收前端金额。
 */
export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: 'DEMO_MODE' }, { status: 400 });
  }
  if (getPaymentProvider() !== 'stripe') {
    return NextResponse.json({ error: 'PAYMENT_PROVIDER_MISMATCH' }, { status: 409 });
  }
  if (!isPaymentsConfigured()) {
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
    const priceId = process.env.STRIPE_PRICE_FULL_REPORT!;
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');

    // 防狂点：复用该用户仍 pending 且未过期的会话（创建时间 30 分钟内）。
    const { data: pending } = await admin
      .from('orders')
      .select('id, checkout_session_id, created_at')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pending?.checkout_session_id) {
      const createdAt = new Date(pending.created_at).getTime();
      if (Date.now() - createdAt < 30 * 60 * 1000) {
        try {
          const existing = await getStripe().checkout.sessions.retrieve(pending.checkout_session_id);
          if (existing?.url) {
            return NextResponse.json({ url: existing.url });
          }
        } catch {
          // 会话失效则继续新建
        }
      }
    }

    // 创建本地 pending 订单（金额来自服务端常量）
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        amount: FULL_REPORT_AMOUNT / 100,
        currency: FULL_REPORT_CURRENCY.toUpperCase(),
        payment_provider: 'stripe',
        status: 'pending',
        price_id: priceId,
      })
      .select('id')
      .single();
    if (orderError) throw orderError;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // 支付方式由 Stripe Dashboard 的动态支付方式统一管理（新版不再支持 payment_method_types）。
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: order.id,              // Webhook 靠它找回订单
      customer_email: user.email ?? undefined,
      success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/full-preview?canceled=1`,
      // Stripe Tax 需在后台启用；未启用时保持关闭，避免创建会话失败。
      automatic_tax: { enabled: process.env.STRIPE_TAX_ENABLED === 'true' },
      metadata: { order_id: order.id, user_id: user.id },
    });

    const { error: updErr } = await admin
      .from('orders')
      .update({ checkout_session_id: session.id })
      .eq('id', order.id);
    if (updErr) throw updErr;

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'UNKNOWN';
    return NextResponse.json({ error: 'CHECKOUT_FAILED', detail }, { status: 500 });
  }
}
