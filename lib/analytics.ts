'use client';

/**
 * Plausible 自定义事件封装。
 *
 * Plausible 自动追踪：
 *   - 页面浏览（pageview）
 *   - 出站链接点击（outbound）
 *   - 404（404）
 *
 * 手动 trackEvent 用于转化漏斗关键点。所有事件白名单参数（number/string，
 * 禁止原文/错误信息/URL 等敏感字段进入埋点）。
 *
 * 未配置 NEXT_PUBLIC_PLAUSIBLE_DOMAIN 时（window.plausible 不存在）静默 no-op，
 * 不影响页面行为。
 */

type TrackProps = Record<string, number | string | boolean | undefined | null>;

declare global {
  interface Window {
    plausible?: (event: string, props?: TrackProps) => void;
  }
}

/** 漏斗事件命名 — 与前端/API/服务端统一口径。 */
export const E = {
  CTA_CLICK: 'cta_click',
  CHART_SUBMIT: 'chart_submit_attempt',
  CHART_GENERATED: 'chart_generated',
  PAYWALL_SEEN: 'paywall_seen',
  PAYMENT_START: 'payment_start',
  PAYMENT_SUCCESS: 'payment_success',
  AUTH_REDIRECT: 'auth_redirect',
} as const;

export function trackEvent(name: string, props?: TrackProps) {
  if (typeof window === 'undefined') return;
  const fn = window.plausible;
  if (typeof fn !== 'function') return;
  fn(name, props || {});
}
