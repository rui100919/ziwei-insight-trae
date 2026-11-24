'use client';

import { useEffect, useRef, useState } from 'react';

type PayPalConfig = { enabled: boolean; clientId?: string; currency?: string; mode?: string };

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError?: (err: unknown) => void;
        style?: Record<string, string>;
      }) => { render: (selector: string) => Promise<void> };
    };
  }
}

/** PayPal 智能按钮：动态加载 SDK，下单→Approve→服务端捕获→跳成功页。 */
export function PayPalButton({ onError }: { onError?: (msg: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<PayPalConfig | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/paypal/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: PayPalConfig | null) => { if (!cancelled) setConfig(d); })
      .catch(() => { if (!cancelled) setLoadError('config'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!config?.enabled || !config.clientId || !containerRef.current) return;

    const render = () => {
      if (!window.paypal || !containerRef.current) return;
      containerRef.current.innerHTML = '';
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
        createOrder: async () => {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: 'full_report' }),
          });
          const data = await res.json();
          if (!res.ok || !data.orderID) {
            if (data.error === 'NEED_LOGIN') onError?.('NEED_LOGIN');
            else onError?.('CREATE_FAILED');
            throw new Error(data.error || 'CREATE_ORDER_FAILED');
          }
          return data.orderID as string;
        },
        onApprove: async (data) => {
          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          const result = await res.json();
          if (!res.ok || !result.ok) {
            onError?.('CAPTURE_FAILED');
            throw new Error(result.error || 'CAPTURE_FAILED');
          }
          window.location.href = `/payment/success?order_id=${encodeURIComponent(result.orderId)}&provider=paypal`;
        },
        onError: () => onError?.('PAYPAL_ERROR'),
      }).render('#paypal-button-container');
    };

    if (window.paypal) { render(); return; }

    const script = document.createElement('script');
    const base = config.mode === 'live' ? 'https://www.paypal.com/sdk/js' : 'https://www.paypal.com/sdk/js';
    script.src = `${base}?client-id=${encodeURIComponent(config.clientId)}&currency=${encodeURIComponent(config.currency ?? 'USD')}&intent=capture`;
    script.async = true;
    script.onload = render;
    script.onerror = () => setLoadError('sdk');
    document.head.appendChild(script);

    return () => { /* SDK 常驻，避免重复挂载 */ };
  }, [config, onError]);

  if (loadError) return <p className="text-xs text-red-700">PayPal 组件加载失败，请刷新重试。</p>;
  if (!config) return <p className="text-xs text-ink-muted">…</p>;
  if (!config.enabled) return null;

  return <div id="paypal-button-container" ref={containerRef} className="w-full min-w-[220px]" />;
}
