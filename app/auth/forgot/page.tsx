'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isDemoMode } from '@/lib/demo';
import { t } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';

export default function ForgotPasswordPage() {
  const { lang } = useLang();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setBusy(true); setError('');
    if (isDemoMode()) {
      setSent(true); setBusy(false);
      return;
    }
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/reset')}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setSent(true);
    } catch {
      setError(t(lang, 'errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 pt-28 pb-20">
      <Link href="/auth" className="link text-sm print:hidden">
        <span aria-hidden="true">←</span> {t(lang, 'backToSignIn')}
      </Link>

      <h1 className="mt-8 text-[30px] font-normal leading-tight tracking-tight text-ink sm:text-[34px]">{t(lang, 'forgotTitle')}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t(lang, 'forgotIntro')}</p>

      {sent ? (
        <div className="card mt-8 p-6">
          <p className="text-sm leading-relaxed text-ink-soft">{t(lang, 'resetSent')}</p>
          <Link href="/auth" className="link mt-4 inline-block text-sm">
            {t(lang, 'backToSignIn')} <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <div className="card mt-8 space-y-5 p-6">
          <div>
            <label className="label" htmlFor="forgot-email">{t(lang, 'emailLabel')}</label>
            <input
              id="forgot-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <button className="btn w-full py-3.5" disabled={busy || !email.trim()} onClick={submit}>
            {busy ? t(lang, 'resending') : t(lang, 'sendReset')} <span aria-hidden="true">→</span>
          </button>
          {error && <p className="rounded-xl border border-plum/40 bg-plum/10 px-4 py-3 text-sm text-ink-soft">{error}</p>}
        </div>
      )}
    </div>
  );
}
