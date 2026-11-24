import Stripe from 'stripe';

/** 服务端专用 Stripe 客户端。密钥只从环境变量读，绝不进前端。 */
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_NOT_CONFIGURED');
  cached = new Stripe(key);
  return cached;
}

/**
 * 是否配置了收款（密钥与价格 ID 齐全即可购买）。
 * Webhook 密钥是可选增强：未配置时走「支付成功页服务端主动核实」发货；
 * 正式上线建议配置 Webhook，两条路径幂等并存。
 */
export function isPaymentsConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PRICE_FULL_REPORT,
  );
}

/** 完整报告价格（USD 分），仅用于创建本地 pending 订单的金额占位；
 *  真实结算金额以 Stripe Price 为准，Webhook 会用 amount_total 覆盖校验。 */
export const FULL_REPORT_AMOUNT = 999; // $9.99
export const FULL_REPORT_CURRENCY = 'usd';
