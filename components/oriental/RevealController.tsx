'use client';

import { useEffect } from 'react';

/**
 * 全局 IntersectionObserver：为 [data-reveal] 元素进入视口时加 .in。
 * 用 MutationObserver 捕获后续动态加入的节点（如客户端拉取报告数据后渲染的段落），
 * 以及 Next.js 客户端路由切换后的新内容。reduced-motion 下直接全部显示。
 */
export function RevealController() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observed = new WeakSet<Element>();

    const reveal = (el: Element) => {
      if (observed.has(el)) return;
      observed.add(el);
      if (reduce || !('IntersectionObserver' in window)) {
        el.classList.add('in');
        return;
      }
      io.observe(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    const scan = (root: ParentNode) => {
      root.querySelectorAll('[data-reveal]').forEach(reveal);
    };

    scan(document);

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as Element;
          if (el.matches('[data-reveal]')) reveal(el);
          scan(el);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
