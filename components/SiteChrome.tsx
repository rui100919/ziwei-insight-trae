'use client';

import Link from 'next/link';
import { isDemoMode } from '@/lib/demo';
import type { Lang } from '@/lib/i18n';
import { useLang } from './LangProvider';

const DEMO_BANNER: Record<Lang, string> = {
  zh: '演示模式 · 排盘由真实引擎计算，解读为示例文案，数据仅存于本机浏览器',
  en: 'Demo mode · charts are calculated by the real engine, readings are sample copy, data stays in your browser only',
  es: 'Modo demo · las cartas las calcula el motor real, las lecturas son de ejemplo; los datos solo se guardan en tu navegador',
  fr: 'Mode démo · les thèmes sont calculés par le vrai moteur, les lectures sont des exemples ; les données restent dans votre navigateur',
  de: 'Demo-Modus · Horoskope werden von der echten Engine berechnet, Deutungen sind Beispiele; Daten bleiben nur in deinem Browser',
  ja: 'デモモード · 命盤は実際のエンジンで計算され、解読はサンプル文案です。データはご利用のブラウザにのみ保存されます',
};

const FOOTER: Record<Lang, { guides: string; legal: string; cultural: string }> = {
  zh: { guides: '十二宫与主星', legal: '隐私政策 · 服务条款 · 免责声明', cultural: '仅供文化研究与自我探索 · 18+' },
  en: { guides: 'Palaces & stars', legal: 'Privacy · Terms · Disclaimer', cultural: 'For cultural reflection and self-exploration · 18+' },
  es: { guides: 'Palacios y estrellas', legal: 'Privacidad · Términos · Aviso legal', cultural: 'Solo para investigación cultural y autoexploración · 18+' },
  fr: { guides: 'Palais et étoiles', legal: 'Confidentialité · Conditions · Avertissement', cultural: 'Réservé à la réflexion culturelle et à l’exploration personnelle · 18+' },
  de: { guides: 'Paläste & Sterne', legal: 'Datenschutz · Bedingungen · Haftungsausschluss', cultural: 'Nur für kulturelle Reflexion und Selbsterkundung · 18+' },
  ja: { guides: '十二宮と主星', legal: 'プライバシー · 利用規約 · 免責事項', cultural: '文化研究と自己探求のみを目的とします · 18歳以上' },
};

/** 顶部演示模式提示条（仅演示模式渲染）。 */
export function DemoBanner() {
  const { lang } = useLang();
  if (!isDemoMode()) return null;
  return (
    <div className="border-b border-gold/30 bg-[#1c1610] px-5 py-2 text-center text-xs text-[#E6CB92] print:hidden">
      {DEMO_BANNER[lang]}
    </div>
  );
}

/** 全站页脚：法务入口、文化用途提示与第三方署名。 */
export function SiteFooter() {
  const { lang } = useLang();
  const f = FOOTER[lang];
  return (
    <footer className="border-t border-line/80 px-5 py-5 text-center text-[11px] leading-relaxed text-ink-muted print:hidden">
      <p>
        <Link href="/guides" className="underline decoration-line hover:text-gold">
          {f.guides}
        </Link>
        <span className="mx-2 text-line-strong">|</span>
        <Link href="/legal" className="underline decoration-line hover:text-gold">
          {f.legal}
        </Link>
        <span className="mx-2 text-line-strong">|</span>
        <span>{f.cultural}</span>
      </p>
      <p className="mt-1 text-ink-muted/70">
        Engine:{' '}
        <a href="https://github.com/Renhuai123/ziwei-doushu" target="_blank" rel="noopener noreferrer" className="underline decoration-line hover:text-gold">
          ziwei-doushu
        </a>{' '}
        (MIT) · City data: GeoNames (CC BY 4.0)
      </p>
    </footer>
  );
}
