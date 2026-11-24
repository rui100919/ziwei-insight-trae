import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { isDemoMode } from '@/lib/demo';
import { getPaymentProvider, isPaymentsConfigured } from '@/lib/payments/config';
import { createOrder, FULL_REPORT_AMOUNT, FULL_REPORT_CURRENCY } from '@/lib/paypal';

export const runtime = 'nodejs';

/**
 * POST /api/paypal/create-order — 创建 PayPal 订单，返回 orderID 给智能按钮。
 * 前端流程：createOrder → 用户在 PayPal 弹窗 Approve → onApprove 调 /api/paypal/capture-order。
 * 金额只来自服务端常量，不接收前端金额。
 */
export async function POST(request: Request) {
  if (isDemoMode()) return NextResponse.json({ error: 'DEMO_MODE' }, { status: 400 });
  if (getPaymentProvider() !== 'paypal' || !isPaymentsConfigured()) {
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

    // 复用 30 分钟内的 pending 订单，避免用户狂点产生一堆废单。
    const { data: pending } = await admin
      .from('orders')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let orderId: string;
    if (pending && Date.now() - new Date(pending.created_at).getTime() < 30 * 60 * 1000) {
      orderId = pending.id;
    } else {
      const { data: order, error } = await admin
        .from('orders')
        .insert({
          user_id: user.id,
          amount: FULL_REPORT_AMOUNT,
          currency: FULL_REPORT_CURRENCY,
          payment_provider: 'paypal',
          status: 'pending',
        })
        .select('id')
        .single();
      if (error) throw error;
      orderId = order.id;
    }

    // custom_id 回填本地订单 id，捕获时用它找回订单，不信任前端传来的 id。
    const paypalOrder = await createOrder({
      amount: FULL_REPORT_AMOUNT.toFixed(2),
      currency: FULL_REPORT_CURRENCY,
      customId: orderId,
      description: 'Zi Wei Insight - Full Report',
    });

    const { error: updErr } = await admin
      .from('orders')
      .update({ checkout_session_id: paypalOrder.id })
      .eq('id', orderId);
    if (updErr) throw updErr;

    return NextResponse.json({ orderID: paypalOrder.id, status: paypalOrder.status });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'UNKNOWN';
    return NextResponse.json({ error: 'CREATE_ORDER_FAILED', detail }, { status: 500 });
  }
}
