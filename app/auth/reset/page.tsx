'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isDemoMode } from '@/lib/demo';
import { t } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';

type Status = 'checking' | 'ready' | 'invalid' | 'done';

export default function ResetPasswordPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDemoMode()) { setStatus('ready'); return; }
    createClient().auth.getUser().then(({ data }) => setStatus(data.user ? 'ready' : 'invalid'));
  }, []);

  async function save() {
    if (password !== confirm) { setError(t(lang, 'passwordMismatch')); return; }
    setBusy(true); setError('');
    if (isDemoMode()) {
      setStatus('done');
      setBusy(false);
      return;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus('done');
      window.setTimeout(() => router.replace('/account'), 1200);
    } catch {
      setError(t(lang, 'errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 pt-28 pb-20">
      <h1 className="text-[34px] leading-tight tracking-tight text-ink">{t(lang, 'resetTitle')}</h1>

      {status === 'checking' && (
        <p className="mt-6 text-sm text-ink-muted">{t(lang, 'generating')}</p>
      )}

      {status === 'invalid' && (
        <div className="card mt-8 p-6">
          <p className="text-sm leading-relaxed text-ink-soft">{t(lang, 'resetInvalid')}</p>
          <Link href="/auth/forgot" className="link mt-4 inline-block text-sm">
            {t(lang, 'requestNewLink')} <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      {status === 'done' && (
        <div className="card mt-8 p-6">
          <p className="text-sm leading-relaxed text-ink-soft">{t(lang, 'passwordUpdated')}</p>
          <Link href="/account" className="link mt-4 inline-block text-sm">
            {t(lang, 'account')} <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      {status === 'ready' && (
        <div className="card mt-8 space-y-5 p-6">
          <div>
            <label className="label" htmlFor="new-password">{t(lang, 'newPassword')}</label>
            <input
              id="new-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm-password">{t(lang, 'confirmPassword')}</label>
            <input
              id="confirm-password"
              className="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <button
            className="btn w-full py-3.5"
            disabled={busy || password.length < 6 || confirm.length < 6}
            onClick={save}
          >
            {busy ? t(lang, 'resending') : t(lang, 'savePassword')} <span aria-hidden="true">→</span>
          </button>
          {error && <p className="rounded-xl border border-plum/40 bg-plum/10 px-4 py-3 text-sm text-ink-soft">{error}</p>}
        </div>
      )}
    </div>
  );
}
