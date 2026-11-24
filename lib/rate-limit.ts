/**
 * 轻量滑动窗口限流，无外部依赖。
 *
 * 说明：此实现基于单个 Node 进程内存，适合早期单实例部署。
 * 若将来部署到多实例（如 Vercel 多区域），应改用共享存储（Upstash Redis 等），
 * 届时只需替换 checkRateLimit 内部实现，调用方无需改动。
 */

type Bucket = { times: number[] };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  retryAfter: number;
  remaining: number;
};

/** 对指定 key 在 windowMs 毫秒内最多放行 limit 次。 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { times: [] };

  bucket.times = bucket.times.filter((t) => now - t < windowMs);

  if (bucket.times.length >= limit) {
    const oldest = bucket.times[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, bucket);
    return { ok: false, retryAfter, remaining: 0 };
  }

  bucket.times.push(now);
  buckets.set(key, bucket);

  // 防止 key 无限增长：bucket 过多时顺手清理过期项。
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      const live = b.times.filter((t) => now - t < windowMs);
      if (live.length === 0) buckets.delete(k);
      else b.times = live;
    }
  }

  return { ok: true, retryAfter: 0, remaining: limit - bucket.times.length };
}

/** 从请求中提取客户端 IP，作为限流维度。 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : request.headers.get('x-real-ip') ?? 'local';
  return `${scope}:${ip}`;
}
