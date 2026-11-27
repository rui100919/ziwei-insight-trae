'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { LogoMark } from '@/components/Logo';
import { useLang } from '@/components/LangProvider';
import type { Lang } from '@/lib/i18n';

type Status = 'checking' | 'processing' | 'unlocked' | 'failed';

const S: Record<Lang, {
  paid: string; unlocked: string; unlockedDesc: string; genNow: string; viewLater: string;
  failed: string; failedDesc: string; goAccount: string; checking: string; checkingDesc: string;
}> = {
  zh: {
    paid: '支付成功', unlocked: '完整报告已解锁',
    unlockedDesc: '付款已确认，你的账户现已解锁完整报告。现在可以生成一份详细推演。',
    genNow: '立即生成完整报告', viewLater: '稍后在账户中查看',
    failed: '暂时没能确认付款',
    failedDesc: '如果付款已完成，权益通常会在几分钟内到账。请稍后刷新本页，或到账户页查看；若持续未到账，请联系我们并提供支付邮箱。',
    goAccount: '前往我的账户', checking: '正在确认付款…',
    checkingDesc: '付款正在通过安全校验，通常几秒钟即可完成。请勿关闭本页。',
  },
  en: {
    paid: 'Payment successful', unlocked: 'Full report unlocked',
    unlockedDesc: 'Payment confirmed. Your account now has full-report access. You can generate your detailed reading now.',
    genNow: 'Generate my full report', viewLater: 'View my account later',
    failed: 'Could not confirm payment',
    failedDesc: 'If your payment went through, access is usually granted within a few minutes. Please refresh shortly or check your account. If it persists, contact us with your payment email.',
    goAccount: 'Go to my account', checking: 'Confirming your payment…',
    checkingDesc: 'Your payment is being verified securely. This usually takes a few seconds. Please keep this page open.',
  },
  es: {
    paid: 'Pago confirmado', unlocked: 'Informe completo desbloqueado',
    unlockedDesc: 'Tu pago está confirmado y tu cuenta ya tiene acceso al informe completo. Ya puedes generar tu lectura detallada.',
    genNow: 'Generar mi informe completo ahora', viewLater: 'Ver mi cuenta más tarde',
    failed: 'No se pudo confirmar el pago',
    failedDesc: 'Si el pago se realizó, el acceso suele activarse en pocos minutos. Actualiza la página más tarde o revisa tu cuenta. Si persiste, contáctanos indicando tu correo de pago.',
    goAccount: 'Ir a mi cuenta', checking: 'Confirmando tu pago…',
    checkingDesc: 'Tu pago se está verificando de forma segura; normalmente tarda unos segundos. No cierres esta página.',
  },
  fr: {
    paid: 'Paiement confirmé', unlocked: 'Rapport complet débloqué',
    unlockedDesc: 'Paiement confirmé. Votre compte a accès au rapport complet. Vous pouvez générer votre lecture détaillée dès maintenant.',
    genNow: 'Générer mon rapport complet maintenant', viewLater: 'Voir mon compte plus tard',
    failed: 'Impossible de confirmer le paiement',
    failedDesc: 'Si votre paiement a bien été effectué, l’accès est généralement accordé en quelques minutes. Actualisez la page un peu plus tard ou consultez votre compte. Si le problème persiste, contactez-nous avec votre e-mail de paiement.',
    goAccount: 'Aller sur mon compte', checking: 'Confirmation du paiement…',
    checkingDesc: 'Votre paiement est vérifié de manière sécurisée ; cela prend généralement quelques secondes. Veuillez laisser cette page ouverte.',
  },
  de: {
    paid: 'Zahlung erfolgreich', unlocked: 'Vollbericht freigeschaltet',
    unlockedDesc: 'Zahlung bestätigt. Dein Konto hat nun Zugriff auf den Vollbericht. Du kannst jetzt deine detaillierte Deutung erstellen.',
    genNow: 'Jetzt meinen Vollbericht erstellen', viewLater: 'Später mein Konto ansehen',
    failed: 'Zahlung konnte nicht bestätigt werden',
    failedDesc: 'Wenn deine Zahlung durchgelaufen ist, wird der Zugang in der Regel innerhalb weniger Minuten gewährt. Bitte aktualisiere die Seite später oder prüfe dein Konto. Wenn es weiterhin nicht funktioniert, kontaktiere uns mit deiner Zahlungs-E-Mail.',
    goAccount: 'Zu meinem Konto', checking: 'Zahlung wird bestätigt…',
    checkingDesc: 'Deine Zahlung wird sicher geprüft; das dauert in der Regel nur wenige Sekunden. Bitte lass diese Seite offen.',
  },
  ja: {
    paid: '支払いが成功しました', unlocked: '完全版レポートのロックを解除しました',
    unlockedDesc: '支払いが確認され、アカウントで完全版レポートが利用できるようになりました。詳細な解読を今すぐ生成できます。',
    genNow: '今すぐ完全版レポートを生成', viewLater: '後でアカウントで確認',
    failed: '支払いを確認できませんでした',
    failedDesc: 'お支払いが完了している場合、通常数分以内に権限が付与されます。しばらくしてからこのページを更新するか、アカウントをご確認ください。解決しない場合は、支払いに使用したメールアドレスを添えてお問い合わせください。',
    goAccount: 'マイアカウントへ', checking: '支払いを確認しています…',
    checkingDesc: 'お支払いを安全に確認しています。通常数秒で完了します。このページを閉じないでください。',
  },
};

function PaymentSuccessContent() {
  const { lang } = useLang();
  const s = S[lang];
  const params = useSearchParams();
  const sessionId = params.get('session_id') ?? '';
  const orderId = params.get('order_id') ?? '';
  const paymentId = params.get('payment_id') ?? '';
  const provider = params.get('provider') ?? (sessionId ? 'stripe' : 'paypal');
  const lookup = sessionId || orderId;
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    if (!lookup) return; // 参数尚未就绪时保持“确认中”，不误判失败
    let cancelled = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      attempt += 1;
      try {
        const qs = new URLSearchParams({ provider });
        if (sessionId) qs.set('session_id', sessionId);
        else qs.set('order_id', orderId);
        if (paymentId) qs.set('payment_id', paymentId);
        const res = await fetch(`/api/payment/status?${qs.toString()}`);
        if (res.ok) {
          const data = await res.json();
          // 拿到确定结果就直接更新（即使 effect 已重跑，React 也会安全处理，
          // 避免「接口成功但界面不更新」）。
          if (data.unlocked) { setStatus('unlocked'); return; }
          if (data.status === 'refunded') { setStatus('failed'); return; }
        }
      } catch { /* 网络抖动，继续重试 */ }

      if (cancelled) return;
      if (attempt >= 20) { setStatus('failed'); return; }
      setStatus('processing');
      timer = setTimeout(tick, 1500);
    }

    // 稍等片刻再查，给 Webhook / 服务端核实留出时间
    timer = setTimeout(tick, 600);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookup]);

  return (
    <div className="mx-auto max-w-xl px-5 pt-28 pb-20 text-center">
      <div className="mx-auto flex justify-center"><LogoMark className="h-12 w-12 text-gold" /></div>

      {status === 'unlocked' ? (
        <>
          <div className="mt-6 flex justify-center"><StatusBadge label={s.paid} tone="completed" /></div>
          <h1 className="mt-5 font-serif text-[30px] font-normal leading-tight text-ink sm:text-[38px]">{s.unlocked}</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {s.unlockedDesc}
          </p>
          <Link href="/full-preview?v=3" className="btn mt-8 inline-block px-8 py-3.5">
            {s.genNow} →
          </Link>
          <div className="mt-4">
            <Link href="/account?v=3" className="link text-sm">{s.viewLater}</Link>
          </div>
        </>
      ) : status === 'failed' ? (
        <>
          <h1 className="mt-6 font-serif text-[30px] font-normal leading-tight text-ink sm:text-[34px]">{s.failed}</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {s.failedDesc}
          </p>
          <Link href="/account?v=3" className="btn mt-8 inline-block px-8 py-3.5">{s.goAccount} →</Link>
        </>
      ) : (
        <>
          <h1 className="mt-6 font-serif text-[30px] font-normal leading-tight text-ink sm:text-[34px]">{s.checking}</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {s.checkingDesc}
          </p>
          <div className="mx-auto mt-8 h-1 w-40 overflow-hidden rounded-full bg-line">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-gold" />
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl px-5 pt-28 pb-20 text-center text-ink-muted">…</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
