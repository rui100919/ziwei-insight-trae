import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { getPaymentProvider, isPaymentsConfigured } from '@/lib/payments/config';
import { getStripe } from '@/lib/stripe';
import { getOrder } from '@/lib/paypal';
import { getDodo, fulfillDodoPayment } from '@/lib/dodo';

export const runtime = 'nodejs';

/**
 * GET /api/payment/status?session_id=xxx&order_id=xxx&payment_id=xxx&provider=dodo|stripe|paypal
 * 支付成功页轮询订单状态。
 *
 * - Stripe：url 带 session_id，订单 pending 时服务端主动向 Stripe 核实发货（Webhook 兜底）。
 * - PayPal：捕获接口已完成发货，url 带本地 order_id；这里只做状态确认 + 权益核对。
 * - Dodo：url 带本地 order_id 与 payment_id；pending 时查询 Dodo 支付并走同一发货校验。
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'NEED_LOGIN' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') ?? getPaymentProvider();
  const sessionId = searchParams.get('session_id');
  const orderIdParam = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  if (!sessionId && !orderIdParam) return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });

  const admin = createAdmin();

  // 定位本地订单
  let orderQuery = admin.from('orders').select('id, status, user_id, checkout_session_id, amount, payment_provider');
  if (orderIdParam) orderQuery = orderQuery.eq('id', orderIdParam);
  else if (sessionId) orderQuery = orderQuery.eq('checkout_session_id', sessionId);
  const { data: order } = await orderQuery.maybeSingle();

  if (!order || order.user_id !== user.id) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Stripe 分支：pending 时主动向 Stripe 核实（Webhook 可能晚到或未配置）。
  if (provider === 'stripe' && order.status === 'pending' && sessionId && isPaymentsConfigured()) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid' && session.client_reference_id === order.id) {
        const subtotal = session.amount_subtotal ?? session.amount_total ?? 0;
        const amountTax = (session.amount_total ?? 0) - (session.amount_subtotal ?? 0);
        await admin.rpc('fulfill_checkout', {
          p_order_id: order.id,
          p_provider_order_id: (session.payment_intent as string) || session.id,
          p_amount_total: subtotal / 100,
          p_currency_display: session.currency?.toUpperCase() ?? null,
          p_amount_tax: Math.max(0, amountTax) / 100,
        });
        order.status = 'paid';
      }
    } catch (err) {
      console.error('stripe payment status verify failed:', err instanceof Error ? err.message : err);
    }
  }

  // PayPal 分支：捕获接口通常已发货；这里对 pending 订单做一次兜底核实（防用户 Approve 后跳页丢失捕获请求）。
  if (provider === 'paypal' && order.status === 'pending' && order.checkout_session_id && isPaymentsConfigured()) {
    try {
      const po = await getOrder(order.checkout_session_id);
      const unit = po.purchase_units?.[0];
      const paidAmount = Number(unit?.amount?.value);
      if (po.status === 'COMPLETED' && Number.isFinite(paidAmount) && Math.abs(paidAmount - order.amount) <= 0.01) {
        await admin.rpc('fulfill_checkout', {
          p_order_id: order.id,
          p_provider_order_id: po.id,
          p_amount_total: paidAmount,
          p_currency_display: unit?.amount?.currency_code?.toUpperCase() ?? null,
          p_amount_tax: 0,
        });
        order.status = 'paid';
      }
    } catch (err) {
      console.error('paypal payment status verify failed:', err instanceof Error ? err.message : err);
    }
  }

  // Dodo 分支：Webhook 可能晚到或未配置，pending 时用 payment_id 主动核实并走同一发货校验。
  if (provider === 'dodo' && order.status === 'pending' && order.payment_provider === 'dodo'
      && paymentId && orderIdParam && isPaymentsConfigured()) {
    try {
      const payment = await getDodo().payments.retrieve(paymentId);
      await fulfillDodoPayment(payment, order.id);
      order.status = 'paid';
    } catch (err) {
      console.error('dodo payment status verify failed:', err instanceof Error ? err.message : err);
    }
  }

  // 以数据库最新状态为准，避免 Webhook 与本次查询并发时读到旧值。
  const { data: latest } = await admin
    .from('orders')
    .select('status')
    .eq('id', order.id)
    .maybeSingle();
  const currentStatus = latest?.status ?? order.status;

  const { data: ent } = await admin
    .from('user_entitlements')
    .select('status')
    .eq('user_id', user.id)
    .eq('benefit_code', 'full_report')
    .maybeSingle();

  return NextResponse.json({
    status: currentStatus,
    unlocked: currentStatus === 'paid' && ent?.status === 'available',
  });
}
