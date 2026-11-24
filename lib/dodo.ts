import DodoPayments from 'dodopayments';
import { createAdmin } from '@/lib/supabase/admin';

/**
 * Dodo Payments 服务端客户端（通过环境变量选择测试或正式模式）。
 *
 * 安全约定：
 * - DODO_PAYMENTS_API_KEY / DODO_PAYMENTS_WEBHOOK_KEY 只在服务端使用，绝不加 NEXT_PUBLIC_ 前缀。
 * - 创建 Checkout 与核实支付都以服务端订单为准，不采信前端传来的金额或状态。
 * - 订单金额由服务端下单时写入，Dodo 返回金额必须与该订单金额匹配才发货。
 *   （按订单校验可兼容调价前后的历史订单：9.90 的旧订单与 9.99 的新订单各自成立。）
 */

export const FULL_REPORT_AMOUNT = 9.99;
export const FULL_REPORT_CURRENCY = 'USD';
/** 当前售价（分），仅用于创建订单；发货校验以订单自身金额为准。 */
export const FULL_REPORT_AMOUNT_CENTS = Math.round(FULL_REPORT_AMOUNT * 100);

/** 默认使用测试模式，只有显式配置 live_mode 才会进入正式支付环境。 */
function dodoEnvironment(): 'test_mode' | 'live_mode' {
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode';
  if (environment !== 'test_mode' && environment !== 'live_mode') {
    throw new Error('DODO_INVALID_ENVIRONMENT');
  }
  return environment;
}

let cached: DodoPayments | null = null;

export function getDodo(): DodoPayments {
  if (cached) return cached;
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) throw new Error('DODO_NOT_CONFIGURED');
  cached = new DodoPayments({ bearerToken: key, environment: dodoEnvironment() });
  return cached;
}

/** 是否配置了 Dodo（API Key 与商品 ID 齐全即可购买）。 */
export function isDodoConfigured(): boolean {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PAYMENTS_PRODUCT_ID);
}

/** 调用方传入的数据不符合发货条件；这类错误重试也不会成功，Webhook 不应要求重投。 */
export class DodoValidationError extends Error {}

export type DodoCheckoutSession = {
  sessionId: string;
  url: string;
};

/**
 * 创建一次性托管 Checkout。
 * Dodo 的 checkout_url 是一次性的，每次支付尝试都必须新建，不能复用。
 */
export async function createDodoCheckout(params: {
  orderId: string;
  userId: string;
  email?: string | null;
  customerName?: string | null;
  siteUrl: string;
}): Promise<DodoCheckoutSession> {
  const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
  if (!productId) throw new Error('DODO_NOT_CONFIGURED');

  const email = params.email ?? null;
  const session = await getDodo().checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    // 不指定 billing_currency：Dodo 自适应定价会按账单国家展示当地币种（CN→CNY、DE→EUR…），
    // 商户结算仍为 USD，发货金额核验不受影响。
    customer: email
      ? { email, name: params.customerName?.trim() || email.split('@')[0] }
      : undefined,
    return_url: `${params.siteUrl}/payment/success?provider=dodo&order_id=${params.orderId}`,
    cancel_url: `${params.siteUrl}/full-preview?canceled=1`,
    metadata: { order_id: params.orderId, user_id: params.userId },
  });

  if (!session.checkout_url) throw new Error('DODO_CHECKOUT_URL_MISSING');
  return { sessionId: session.session_id, url: session.checkout_url };
}

/** 发货所需的 Dodo 支付字段；Webhook 与主动查询返回的结构一致。 */
export type DodoPaymentLike = {
  payment_id: string;
  checkout_session_id?: string | null;
  metadata?: Record<string, string | number | boolean> | null;
  status?: string | null;
  currency: string;
  total_amount: number;
  tax?: number | null;
  settlement_currency?: string | null;
  settlement_amount?: number | null;
  settlement_tax?: number | null;
};

/**
 * 校验 Dodo 支付并幂等发货。
 *
 * 只接受 `succeeded` 的支付；以 checkout_session_id 找回本地订单，
 * 再核对 metadata、币种和金额，全部通过后才发放 full_report 权益。
 */
export async function fulfillDodoPayment(
  payment: DodoPaymentLike,
  expectedOrderId?: string,
): Promise<{ orderId: string; alreadyPaid: boolean }> {
  const sessionId = payment.checkout_session_id;
  if (!sessionId) throw new DodoValidationError('DODO_SESSION_MISSING');
  if (payment.status !== 'succeeded') throw new DodoValidationError('DODO_PAYMENT_NOT_SUCCEEDED');

  const admin = createAdmin();
  const { data: order, error } = await admin
    .from('orders')
    .select('id, user_id, amount, status, currency, payment_provider')
    .eq('checkout_session_id', sessionId)
    .maybeSingle();
  if (error) throw error;
  if (!order) throw new DodoValidationError('DODO_ORDER_NOT_FOUND');
  if (order.payment_provider !== 'dodo') throw new DodoValidationError('DODO_ORDER_PROVIDER_MISMATCH');
  if (expectedOrderId && order.id !== expectedOrderId) throw new DodoValidationError('DODO_ORDER_MISMATCH');

  // metadata 是辅助证据：存在就必须与本地订单一致，但不作为订单定位依据。
  const metadata = payment.metadata ?? {};
  if (metadata.order_id && String(metadata.order_id) !== order.id) {
    throw new DodoValidationError('DODO_ORDER_MISMATCH');
  }
  if (metadata.user_id && String(metadata.user_id) !== String(order.user_id)) {
    throw new DodoValidationError('DODO_ORDER_MISMATCH');
  }

  // 自适应定价下，客户支付币种（如 CNY）可能不同于本地订单；商户结算字段才与订单计价一致。
  const settlementCurrency = payment.settlement_currency ?? payment.currency;
  if (settlementCurrency.toUpperCase() !== order.currency.toUpperCase()) {
    throw new DodoValidationError('DODO_CURRENCY_MISMATCH');
  }

  const total = Number(payment.settlement_amount ?? payment.total_amount);
  const tax = Number(payment.settlement_tax ?? payment.tax ?? 0);
  if (!Number.isFinite(total) || !Number.isFinite(tax) || tax < 0 || tax > total) {
    throw new DodoValidationError('DODO_AMOUNT_INVALID');
  }
  // 以订单自身金额为准（下单时由服务端写入），而不是当前售价常量：
  // 这样调价前创建的 9.90 订单仍能正常发货，也不会因为改常量而放宽校验。
  const expectedCents = Math.round(Number(order.amount) * 100);
  if (!Number.isFinite(expectedCents) || expectedCents <= 0) {
    throw new DodoValidationError('DODO_AMOUNT_INVALID');
  }
  // 税额含在结算总价内时用净额比对，税额另计时用总额比对；两者都不符则不发货。
  const netMatches = Math.abs(total - tax - expectedCents) <= 1;
  const grossMatches = Math.abs(total - expectedCents) <= 1;
  if (!netMatches && !grossMatches) throw new DodoValidationError('DODO_AMOUNT_MISMATCH');

  if (order.status === 'paid') return { orderId: order.id, alreadyPaid: true };

  const { error: rpcError } = await admin.rpc('fulfill_checkout', {
    p_order_id: order.id,
    p_provider_order_id: payment.payment_id,
    p_amount_total: order.amount,
    p_currency_display: settlementCurrency.toUpperCase(),
    p_amount_tax: tax / 100,
  });
  if (rpcError) throw rpcError;

  return { orderId: order.id, alreadyPaid: false };
}

/** 退款事件里用于回收权益的字段。 */
export type DodoRefundLike = {
  refund_id?: string | null;
  payment_id: string;
  status?: string | null;
};

/**
 * 退款成功 → 订单置 refunded 并回收 full_report 权益。
 *
 * 以 payment_id 找回本地订单（发货时已存进 provider_order_id）；
 * 幂等：已退款的订单重复回调直接返回 already_refunded。
 */
export async function revokeDodoRefund(refund: DodoRefundLike): Promise<{ status: string }> {
  if (refund.status !== 'succeeded') throw new DodoValidationError('DODO_REFUND_NOT_SUCCEEDED');
  if (!refund.payment_id) throw new DodoValidationError('DODO_PAYMENT_ID_MISSING');

  const admin = createAdmin();
  const { data, error } = await admin.rpc('refund_checkout', {
    p_provider_order_id: refund.payment_id,
  });
  if (error) {
    // 本地没有这笔订单（例如非本站发起的支付）属于校验类失败，重投也不会成功。
    if (error.code === 'P0002' || error.message.includes('ORDER_NOT_FOUND')) {
      throw new DodoValidationError('DODO_REFUND_ORDER_NOT_FOUND');
    }
    throw error;
  }
  return { status: String(data) };
}
