/**
 * 支付通道配置：默认 Dodo Payments，保留 PayPal / Stripe 作为可切换选项。
 *
 * 切换方式：把 PAYMENT_PROVIDER 设为 'dodo'、'paypal' 或 'stripe'，并确保对应环境变量齐全。
 */
export type PaymentProvider = 'dodo' | 'paypal' | 'stripe';

export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYMENT_PROVIDER === 'stripe') return 'stripe';
  if (process.env.PAYMENT_PROVIDER === 'paypal') return 'paypal';
  return 'dodo';
}

/** 当前通道是否已配置完整（可启用购买入口）。 */
export function isPaymentsConfigured(): boolean {
  const provider = getPaymentProvider();
  if (provider === 'stripe') {
    return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_FULL_REPORT);
  }
  if (provider === 'dodo') {
    return Boolean(process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PAYMENTS_PRODUCT_ID);
  }
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET);
}
