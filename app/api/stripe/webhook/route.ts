import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createAdmin } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

/**
 * POST /api/stripe/webhook — 支付发货回调
 * 关键：读原始 body 验签；只有签名通过的 checkout.session.completed 才发货。
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 503 });

  const raw = await request.text(); // 必须先拿原始文本，不能先 parse
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'MISSING_SIGNATURE' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 400 });
  }

  const admin = createAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== 'paid') break; // 异步支付未完成，不发货

        const orderId = session.client_reference_id || (session.metadata?.order_id ?? null);
        if (!orderId) break;

        // 金额校验：用 subtotal（不含税）对本地基础价，coin 转元。
        const subtotal = session.amount_subtotal ?? session.amount_total ?? 0;
        const currencyDisplay = session.currency?.toUpperCase() ?? null;
        const amountTax = (session.amount_total ?? 0) - (session.amount_subtotal ?? 0);

        const { error } = await admin.rpc('fulfill_checkout', {
          p_order_id: orderId,
          p_provider_order_id: (session.payment_intent as string) || session.id,
          p_amount_total: subtotal / 100,
          p_currency_display: currencyDisplay,
          p_amount_tax: Math.max(0, amountTax) / 100,
        });
        if (error) console.error('fulfill_checkout failed:', error.message);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent = charge.payment_intent as string | null;
        if (!paymentIntent) break;
        const { error } = await admin.rpc('refund_checkout', {
          p_provider_order_id: paymentIntent,
        });
        if (error) console.error('refund_checkout failed:', error.message);
        break;
      }

      default:
        break;
    }

    // 始终 200，避免 Stripe 无限重试
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('webhook processing error:', error);
    return NextResponse.json({ error: 'PROCESSING_FAILED' }, { status: 500 });
  }
}
