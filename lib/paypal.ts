/**
 * PayPal REST API 服务端客户端（Orders API v2）
 *
 * 安全约定：
 * - 密钥（PAYPAL_SECRET）只在服务端使用，绝不进前端、绝不加 NEXT_PUBLIC_ 前缀。
 * - Client ID 本身是公开标识，但本项目仍由后端接口下发给前端，避免散落在代码里。
 * - 环境由 PAYPAL_MODE 决定：sandbox（默认）/ live。
 */

export type PayPalEnv = 'sandbox' | 'live';

function baseUrl(): string {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

/** 是否配置了 PayPal（有 Client ID + Secret 即可收款）。 */
export function isPayPalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET);
}

/** 前端渲染智能按钮所需的公开配置。 */
export function paypalPublicConfig() {
  return {
    clientId: process.env.PAYPAL_CLIENT_ID ?? '',
    currency: FULL_REPORT_CURRENCY.toUpperCase(),
    mode: (process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox') as PayPalEnv,
  };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/** OAuth2 client credentials 换取 access token，进程内缓存至过期前 2 分钟。 */
export async function getAccessToken(): Promise<string> {
  if (!isPayPalConfigured()) throw new Error('PAYPAL_NOT_CONFIGURED');
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const id = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_SECRET!;
  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`PAYPAL_TOKEN_FAILED_${res.status}`);

  const data = await res.json() as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(0, data.expires_in - 120) * 1000,
  };
  return data.access_token;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${baseUrl()}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    body: init.body,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PAYPAL_API_${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export type CreateOrderResult = { id: string; status: string };

/** 创建 CAPTURE 意图的订单；custom_id 回填本地订单 id，用于捕获时找回订单。 */
export async function createOrder(params: {
  amount: string;
  currency: string;
  customId: string;
  description: string;
}): Promise<CreateOrderResult> {
  return api<CreateOrderResult>('/v2/checkout/orders', {
    method: 'POST',
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        custom_id: params.customId,
        description: params.description,
        amount: { currency_code: params.currency, value: params.amount },
      }],
    }),
  });
}

export type CaptureResult = {
  id: string;
  status: string;
  purchase_units: {
    custom_id?: string;
    payments?: {
      captures?: {
        id: string;
        status: string;
        amount: { currency_code: string; value: string };
      }[];
    };
  }[];
};

/** 捕获已授权的订单（用户 Approve 后调用，真正扣款）。 */
export async function captureOrder(orderId: string): Promise<CaptureResult> {
  return api<CaptureResult>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export type OrderResult = {
  id: string;
  status: string;
  purchase_units: {
    custom_id?: string;
    amount?: { currency_code: string; value: string };
  }[];
};

/** 查询订单详情（服务端主动核实发货）。 */
export async function getOrder(orderId: string): Promise<OrderResult> {
  return api<OrderResult>(`/v2/checkout/orders/${encodeURIComponent(orderId)}`);
}

/** 完整报告价格：与订单表、PayPal 下单金额保持一致，服务端常量，不接收前端金额。 */
export const FULL_REPORT_AMOUNT = 9.99;
export const FULL_REPORT_CURRENCY = 'USD';
