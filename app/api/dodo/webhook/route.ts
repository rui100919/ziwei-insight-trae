import { NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import {
  fulfillDodoPayment,
  revokeDodoRefund,
  DodoValidationError,
  type DodoPaymentLike,
  type DodoRefundLike,
} from '@/lib/dodo';

export const runtime = 'nodejs';

type DodoWebhookPayload = {
  type?: string;
  data?: DodoPaymentLike | DodoRefundLike;
};

/**
 * POST /api/dodo/webhook — Dodo Payments 回调：支付成功发货、退款成功回收。
 *
 * 关键：必须用原始 body 验签；只有验签通过的 payment.succeeded / refund.succeeded 才处理。
 * 校验类失败直接确认收到（重投也不会成功），只有临时错误返回 500 让 Dodo 重试。
 */
export async function POST(request: Request) {
  const key = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!key) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 503 });

  const raw = await request.text(); // 必须先拿原始文本，不能先 parse
  const headers = {
    'webhook-id': request.headers.get('webhook-id') ?? '',
    'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': request.headers.get('webhook-signature') ?? '',
  };

  try {
    new Webhook(key).verify(raw, headers);
  } catch {
    return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 400 });
  }

  let payload: DodoWebhookPayload;
  try {
    payload = JSON.parse(raw) as DodoWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  if (!payload.data) {
    return NextResponse.json({ received: true });
  }

  try {
    if (payload.type === 'payment.succeeded') {
      const result = await fulfillDodoPayment(payload.data as DodoPaymentLike);
      return NextResponse.json({ received: true, ...result });
    }
    if (payload.type === 'refund.succeeded') {
      const result = await revokeDodoRefund(payload.data as DodoRefundLike);
      return NextResponse.json({ received: true, refundStatus: result.status });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof DodoValidationError) {
      console.error('dodo webhook ignored:', error.message);
      return NextResponse.json({ received: true, ignored: error.message });
    }
    console.error('dodo webhook processing failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'PROCESSING_FAILED' }, { status: 500 });
  }
}
