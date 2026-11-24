import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { isDemoMode } from '@/lib/demo';
import { getPaymentProvider, isPaymentsConfigured } from '@/lib/payments/config';
import { captureOrder } from '@/lib/paypal';

export const runtime = 'nodejs';

/**
 * POST /api/paypal/capture-order — 用户 Approve 后捕获付款并发货。
 * Body: { orderID: string }
 *
 * 安全：
 * - 订单归属校验（order.user_id 必须是当前登录用户）。
 * - 金额校验：PayPal 返回金额必须与本地订单金额一致，防篡改。
 * - 幂等：发货走 fulfill_checkout，重复捕获不会重复发权益。
 */
export async function POST(request: Request) {
  if (isDemoMode()) return NextResponse.json({ error: 'DEMO_MODE' }, { status: 400 });
  if (getPaymentProvider() !== 'paypal' || !isPaymentsConfigured()) {
    return NextResponse.json({ error: 'PAYMENTS_NOT_CONFIGURED' }, { status: 503 });
  }

  try {
    const body = await request.json() as { orderID?: string };
    if (!body.orderID) return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'NEED_LOGIN' }, { status: 401 });

    // 先按 checkout_session_id 找到本地订单，确认归属当前用户。
    const admin = createAdmin();
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, amount, status, currency')
      .eq('checkout_session_id', body.orderID)
      .maybeSingle();
    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const result = await captureOrder(body.orderID);

    // 从 PayPal 响应里找 capture（不信任前端），校验状态与金额。
    const unit = result.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    if (result.status !== 'COMPLETED' || !capture || capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'PAYMENT_NOT_COMPLETED', status: result.status }, { status: 402 });
    }

    const paidAmount = Number(capture.amount?.value);
    const paidCurrency = capture.amount?.currency_code?.toUpperCase() ?? order.currency;
    if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - order.amount) > 0.01) {
      return NextResponse.json({ error: 'AMOUNT_MISMATCH' }, { status: 400 });
    }

    // 用 PayPal 返回的 custom_id 找回本地订单（双保险：与查到的 order 一致才发货）。
    const customOrderId = unit?.custom_id;
    if (customOrderId && customOrderId !== order.id) {
      return NextResponse.json({ error: 'ORDER_MISMATCH' }, { status: 400 });
    }

    // 幂等发货。已 paid 时 fulfill_checkout 直接返回 'already_paid'。
    if (order.status === 'pending') {
      const { error } = await admin.rpc('fulfill_checkout', {
        p_order_id: order.id,
        p_provider_order_id: capture.id,
        p_amount_total: paidAmount,
        p_currency_display: paidCurrency,
        p_amount_tax: 0,
      });
      if (error) throw error;
    }

    return NextResponse.json({ ok: true, orderId: order.id, providerOrderId: capture.id });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'UNKNOWN';
    return NextResponse.json({ error: 'CAPTURE_FAILED', detail }, { status: 500 });
  }
}
