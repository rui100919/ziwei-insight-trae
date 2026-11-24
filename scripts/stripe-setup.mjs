/**
 * 用 Stripe API 创建「完整命理报告」产品与 $9.90 一次性价格，把 price_id 写回 .env.local。
 * 幂等：若已有同名产品且价格相同，直接复用。
 *
 * 用法：node scripts/stripe-setup.mjs
 */
import fs from 'node:fs';
import Stripe from 'stripe';

const envText = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const key = envText.match(/^STRIPE_SECRET_KEY=(.*)$/m)?.[1]?.trim();
if (!key?.startsWith('sk_')) {
  console.error('缺少有效的 STRIPE_SECRET_KEY。');
  process.exit(1);
}

const PRODUCT_NAME = 'Full Report · 完整命理报告';
const AMOUNT = 990; // USD 分
const CURRENCY = 'usd';
const CURRENT_PRICE = envText.match(/^STRIPE_PRICE_FULL_REPORT=(.*)$/m)?.[1]?.trim() || '';

const stripe = new Stripe(key);

try {
  // 已配置过则先验证该价格是否仍有效
  if (CURRENT_PRICE.startsWith('price_')) {
    try {
      const p = await stripe.prices.retrieve(CURRENT_PRICE);
      if (p.active && p.unit_amount === AMOUNT && p.currency === CURRENCY) {
        console.log(`✓ 已配置价格有效，无需变更: ${CURRENT_PRICE}`);
        process.exit(0);
      }
    } catch { /* 失效则重建 */ }
  }

  // 找已有同名产品（幂等）
  const list = await stripe.products.list({ active: true, limit: 100 });
  let product = list.data.find((p) => p.name === PRODUCT_NAME);

  if (!product) {
    product = await stripe.products.create({
      name: PRODUCT_NAME,
      description: '十二宫逐宫解读、十年大限、当前阶段与格局——为任意出生资料生成的完整紫微斗数报告。',
    });
    console.log(`✓ 产品已创建: ${product.id}`);
  } else {
    console.log(`✓ 复用已有产品: ${product.id}`);
  }

  // 找该产品下金额匹配的有效价格
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  let price = prices.data.find((p) => p.unit_amount === AMOUNT && p.currency === CURRENCY);

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: AMOUNT,
      currency: CURRENCY,
      // one-time 默认就是一次性；不设 recurring 即非订阅
    });
    console.log(`✓ 价格已创建: ${price.id}`);
  } else {
    console.log(`✓ 复用已有价格: ${price.id}`);
  }

  // 写回 .env.local
  const updated = envText.replace(
    /^STRIPE_PRICE_FULL_REPORT=.*$/m,
    `STRIPE_PRICE_FULL_REPORT=${price.id}`,
  );
  fs.writeFileSync(new URL('../.env.local', import.meta.url), updated);
  console.log(`✓ 已写入 .env.local: STRIPE_PRICE_FULL_REPORT=${price.id}`);
} catch (err) {
  console.error('✗ 失败:', err.message);
  process.exitCode = 1;
}
