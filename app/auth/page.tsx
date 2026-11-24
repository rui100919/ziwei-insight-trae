'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { demoStore, isDemoMode } from '@/lib/demo';
import { t, type Lang } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { Starfield } from '@/components/oriental/Starfield';

// 手机短信验证需另接 Twilio 并充值。初期只开邮箱；日后要开，改成 true 即可（代码已保留）。
const PHONE_AUTH_ENABLED = false;

/** Supabase 的错误是英文且偏技术，这里翻成用户能理解的一句话。 */
type AuthErrorEntry = { match: RegExp } & Record<Lang, string>;
const AUTH_ERRORS: AuthErrorEntry[] = [
  {
    match: /invalid login credentials/i,
    zh: '邮箱或密码不正确。', en: 'Email or password is incorrect.',
    es: 'El correo o la contraseña son incorrectos.', fr: 'L’adresse e-mail ou le mot de passe est incorrect.',
    de: 'E-Mail oder Passwort ist falsch.', ja: 'メールアドレスまたはパスワードが正しくありません。',
  },
  {
    match: /email not confirmed/i,
    zh: '邮箱还没验证，请先点开邮件里的验证链接。', en: 'Your email is not verified yet. Open the verification link in your inbox first.',
    es: 'Tu correo aún no está verificado. Abre primero el enlace de verificación en tu bandeja de entrada.',
    fr: 'Votre e-mail n’est pas encore vérifié. Ouvrez d’abord le lien de vérification dans votre boîte de réception.',
    de: 'Deine E-Mail ist noch nicht verifiziert. Öffne zuerst den Bestätigungslink in deinem Postfach.',
    ja: 'メールアドレスはまだ認証されていません。受信トレイの認証リンクを先に開いてください。',
  },
  {
    match: /user already registered/i,
    zh: '这个邮箱已经注册过了，请直接登录。', en: 'That email is already registered — please sign in instead.',
    es: 'Este correo ya está registrado; inicia sesión directamente.',
    fr: 'Cet e-mail est déjà inscrit — connectez-vous plutôt.',
    de: 'Diese E-Mail ist bereits registriert — bitte melde dich stattdessen an.',
    ja: 'このメールアドレスはすでに登録されています。ログインしてください。',
  },
  {
    match: /password should be at least/i,
    zh: '密码至少需要 6 位。', en: 'Password must be at least 6 characters.',
    es: 'La contraseña debe tener al menos 6 caracteres.', fr: 'Le mot de passe doit comporter au moins 6 caractères.',
    de: 'Das Passwort muss mindestens 6 Zeichen lang sein.', ja: 'パスワードは6文字以上で入力してください。',
  },
  {
    match: /rate limit|too many requests/i,
    zh: '发送太频繁，请稍后再试。', en: 'Too many attempts. Please wait a moment and try again.',
    es: 'Demasiados intentos. Espera un momento y vuelve a intentarlo.',
    fr: 'Trop de tentatives. Attendez un instant et réessayez.',
    de: 'Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.',
    ja: '試行回数が多すぎます。しばらくしてからもう一度お試しください。',
  },
];

const AUTH_FALLBACK: Record<Lang, string> = {
  zh: '操作没有成功，请稍后再试。', en: 'That did not work. Please try again.',
  es: 'No se pudo completar. Inténtalo de nuevo más tarde.', fr: 'Ça n’a pas fonctionné. Veuillez réessayer.',
  de: 'Das hat nicht geklappt. Bitte versuche es erneut.', ja: '操作に失敗しました。しばらくしてからもう一度お試しください。',
};

function authError(message: string, lang: Lang): string {
  const hit = AUTH_ERRORS.find((entry) => entry.match.test(message));
  return hit ? hit[lang] : AUTH_FALLBACK[lang];
}

const S: Record<Lang, {
  hero1: string; hero2: string; heroDesc: string;
  eyebrowSignup: string; eyebrowSignin: string; subtitleAlt: string; demoBanner: string;
  termsPrefix: string; termsLink: string; termsSuffix: string;
}> = {
  zh: {
    hero1: '十二宫，', hero2: '一张属于你的地图。',
    heroDesc: '紫微斗数流传千年。我们把它翻译成清晰、私人的解读，只保存在你的账户里。',
    eyebrowSignup: '加入我们', eyebrowSignin: '欢迎回来',
    subtitleAlt: '创建账号，即可获得一次免费基础解读。',
    demoBanner: '演示环境：可直接用任意邮箱和密码体验完整流程；排盘由真实引擎计算，报告内容为示例。',
    termsPrefix: '注册即表示你已阅读并同意', termsLink: '服务条款与隐私政策', termsSuffix: '。须年满 18 岁。',
  },
  en: {
    hero1: 'Twelve palaces.', hero2: 'One map of your life.',
    heroDesc: 'Zi Wei Dou Shu has mapped lives for a thousand years. We turn that tradition into a clear, personal reading — kept private in your account.',
    eyebrowSignup: 'Get started', eyebrowSignin: 'Welcome back',
    subtitleAlt: 'Continue to your chart, your reading, and your account.',
    demoBanner: 'Demo environment: use any email and password to walk through the full flow. Charts are computed by the real engine; report text is sample content.',
    termsPrefix: 'By registering you agree to our', termsLink: 'Terms of Service and Privacy Policy', termsSuffix: '· You must be 18 or older.',
  },
  es: {
    hero1: 'Doce palacios,', hero2: 'un mapa de tu vida.',
    heroDesc: 'El Zi Wei Dou Shu ha descifrado vidas durante mil años. Convertimos esa tradición en una lectura clara y personal, guardada de forma privada en tu cuenta.',
    eyebrowSignup: 'Únete', eyebrowSignin: 'Bienvenido',
    subtitleAlt: 'Crea una cuenta y obtén una lectura básica gratuita.',
    demoBanner: 'Entorno demo: usa cualquier correo y contraseña para recorrer el flujo completo. Las cartas las calcula el motor real; el texto del informe es de ejemplo.',
    termsPrefix: 'Al registrarte aceptas nuestra', termsLink: 'Términos del servicio y Política de privacidad', termsSuffix: '· Debes tener 18 años o más.',
  },
  fr: {
    hero1: 'Douze palais,', hero2: 'une carte de votre vie.',
    heroDesc: 'Le Zi Wei Dou Shu éclaire les vies depuis mille ans. Nous transformons cette tradition en une lecture claire et personnelle — gardée pour vous dans votre compte.',
    eyebrowSignup: 'Commencer', eyebrowSignin: 'Bon retour',
    subtitleAlt: 'Créez un compte pour recevoir une lecture de base gratuite.',
    demoBanner: 'Environnement de démo : utilisez n’importe quel e-mail et mot de passe pour parcourir tout le parcours. Les thèmes sont calculés par le vrai moteur ; le texte des rapports est un exemple.',
    termsPrefix: 'En vous inscrivant, vous acceptez nos', termsLink: 'Conditions d’utilisation et Politique de confidentialité', termsSuffix: '· Vous devez avoir 18 ans ou plus.',
  },
  de: {
    hero1: 'Zwölf Paläste,', hero2: 'eine Karte deines Lebens.',
    heroDesc: 'Zi Wei Dou Shu deutet Leben seit tausenden von Jahren. Wir machen daraus eine klare, persönliche Deutung — privat in deinem Konto gespeichert.',
    eyebrowSignup: 'Loslegen', eyebrowSignin: 'Willkommen',
    subtitleAlt: 'Erstelle ein Konto und erhalte eine kostenlose Basisdeutung.',
    demoBanner: 'Demo-Umgebung: Nutze eine beliebige E-Mail und ein Passwort, um den gesamten Ablauf auszuprobieren. Horoskope werden von der echten Engine berechnet; der Berichtstext ist ein Beispiel.',
    termsPrefix: 'Mit der Registrierung stimmst du unseren', termsLink: 'Nutzungsbedingungen und Datenschutzerklärung', termsSuffix: '· Du musst mindestens 18 Jahre alt sein.',
  },
  ja: {
    hero1: '十二宮、', hero2: 'あなただけの人生の地図。',
    heroDesc: '紫微斗数は千年にわたり人々の人生を読み解いてきました。その伝統を、分かりやすくパーソナルな解読に翻訳し、あなたのアカウントにだけ保管します。',
    eyebrowSignup: 'はじめる', eyebrowSignin: 'おかえりなさい',
    subtitleAlt: 'アカウントを作成すると、無料の基礎解読を1回受けられます。',
    demoBanner: 'デモ環境：任意のメールアドレスとパスワードで全体の流れを体験できます。命盤は実際のエンジンで計算され、レポート本文はサンプルです。',
    termsPrefix: '登録することで、', termsLink: '利用規約とプライバシーポリシー', termsSuffix: 'に同意したものとみなされます。18歳以上である必要があります。',
  },
};

export default function AuthPage() {
  const { lang } = useLang();
  const s = S[lang];
  const router = useRouter();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendLeft, setResendLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  // 优先使用入口显式携带的 next；直接点导航登录时，则记住同站来源页。
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('next');
    let destination = param && param.startsWith('/') && !param.startsWith('//') ? param : null;
    if (!destination && document.referrer) {
      try {
        const referrer = new URL(document.referrer);
        if (referrer.origin === window.location.origin && !referrer.pathname.startsWith('/auth')) {
          destination = `${referrer.pathname}${referrer.search}${referrer.hash}`;
        }
      } catch {
        // 非法 referrer 不影响默认回跳。
      }
    }
    setNext(destination || '/');
  }, []);

  // 邮件链接失效（已被使用/过期）时给出明确提示，避免用户以为要重新注册。
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error') === 'confirm') {
      setMode('signin');
      setInfo(t(lang, 'confirmLinkInvalid'));
    }
  }, [lang]);

  useEffect(() => {
    if (next === null) return;
    if (isDemoMode()) {
      if (demoStore.getUser()) router.replace(next);
      return;
    }
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) router.replace(next);
    });
  }, [router, next]);

  const finish = () => router.replace(next || '/');
  const callbackUrl = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next || '/')}`;

  // 重发倒计时，避免用户或脚本频繁触发发信。
  useEffect(() => {
    if (resendLeft <= 0) return;
    const id = window.setInterval(() => setResendLeft((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [resendLeft > 0]);

  async function resendEmail() {
    setBusy(true); setError(''); setInfo('');
    if (isDemoMode()) { setInfo(t(lang, 'resent')); setResendLeft(60); setBusy(false); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: callbackUrl() },
    });
    if (error) setError(authError(error.message, lang));
    else { setInfo(t(lang, 'resent')); setResendLeft(60); }
    setBusy(false);
  }

  async function handleEmail() {
    setBusy(true); setError(''); setInfo('');
    if (isDemoMode()) {
      demoStore.setUser({ id: 'demo-user', email: email || 'demo@example.com' });
      finish();
      return;
    }
    const supabase = createClient();
    try {
      if (mode === 'signup') {
        const redirectTo = callbackUrl();
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        // 若开启了邮箱验证，注册后没有 session：进入「等待验证」状态，提供重发入口。
        if (data.user && !data.session) { setEmailSent(true); setResendLeft(60); }
        else finish();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        finish();
      }
    } catch (e) {
      setError(e instanceof Error ? authError(e.message, lang) : t(lang, 'errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  async function resendSms() {
    setBusy(true); setError(''); setInfo('');
    if (isDemoMode()) { setInfo(t(lang, 'codeSent')); setResendLeft(60); setBusy(false); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) setError(authError(error.message, lang));
    else { setInfo(t(lang, 'codeSent')); setResendLeft(60); }
    setBusy(false);
  }

  async function handlePhone() {
    setBusy(true); setError(''); setInfo('');
    if (isDemoMode()) {
      if (!codeSent) { setCodeSent(true); setInfo(t(lang, 'codeSent')); setBusy(false); return; }
      demoStore.setUser({ id: 'demo-user', phone });
      finish();
      return;
    }
    const supabase = createClient();
    try {
      if (!codeSent) {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
        setCodeSent(true);
        setResendLeft(60);
        setInfo(t(lang, 'codeSent'));
      } else {
        const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
        if (error) throw error;
        finish();
      }
    } catch (e) {
      setError(e instanceof Error ? authError(e.message, lang) : t(lang, 'errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="hero-media" aria-hidden="true" />
      <div className="hero-veil" aria-hidden="true" />
      <Starfield count={55} />

      <div className="auth-inner">
        <aside className="auth-intro rise">
          <p className="eyebrow">
            <span className="dot" />
            {mode === 'signup' ? s.eyebrowSignup : s.eyebrowSignin}
          </p>
          <p className="auth-brand">{t(lang, 'brand')}</p>
          <h2 className="auth-hero">
            {s.hero1}
            <br />
            {s.hero2}
          </h2>
          <p className="auth-desc">{s.heroDesc}</p>
        </aside>

        <section className="auth-panel rise" aria-label={mode === 'signup' ? t(lang, 'signUp') : t(lang, 'signIn')}>
          <p className="label">
            <span className="cn">{mode === 'signup' ? s.eyebrowSignup : s.eyebrowSignin}</span>
            <span className="en">Zi Wei Insight</span>
          </p>
          <h1 className="auth-title">{mode === 'signup' ? t(lang, 'signUp') : t(lang, 'signIn')}</h1>
          <p className="auth-subtitle">
            {next === '/chart/new' ? t(lang, 'authNextHint') : s.subtitleAlt}
          </p>
          <p className="auth-sample">
            <Link href="/full-preview">
              {t(lang, 'authSampleLink')} <span aria-hidden="true">→</span>
            </Link>
          </p>

          {isDemoMode() && <div className="auth-notice auth-demo">{s.demoBanner}</div>}

          {/* 邮箱 / 手机 切换。手机入口默认关闭，避免用户进入未配置的短信流程。 */}
          {PHONE_AUTH_ENABLED && (
            <div className="auth-tabs">
              <button
                className={method === 'email' ? 'active' : ''}
                onClick={() => { setMethod('email'); setEmailSent(false); setError(''); setInfo(''); }}
              >{t(lang, 'emailTab')}</button>
              <button
                className={method === 'phone' ? 'active' : ''}
                onClick={() => { setMethod('phone'); setEmailSent(false); setError(''); setInfo(''); }}
              >{t(lang, 'phoneTab')}</button>
            </div>
          )}

          <div className="auth-form">
            {method === 'email' ? (
              emailSent ? (
                <div className="auth-status">
                  <p className="auth-status-title">{t(lang, 'emailSentTitle')}</p>
                  <p className="auth-status-body">{t(lang, 'emailSentBody').replace('{email}', email)}</p>
                  <p className="auth-status-note">{t(lang, 'checkSpam')}</p>
                  <div className="auth-status-actions">
                    <button className="auth-inline-link" disabled={busy || resendLeft > 0} onClick={resendEmail}>
                      {busy ? t(lang, 'resending') : resendLeft > 0 ? t(lang, 'resendIn').replace('{n}', String(resendLeft)) : t(lang, 'resendEmail')}
                    </button>
                    <button className="auth-text-button" onClick={() => { setEmailSent(false); setInfo(''); }}>
                      {t(lang, 'useAnotherEmail')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="auth-email">{t(lang, 'emailLabel')}</label>
                    <input
                      id="auth-email"
                      className="auth-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  <div className="auth-field">
                    <div className="auth-password-head">
                      <label className="auth-label" htmlFor="auth-password">{t(lang, 'passwordLabel')}</label>
                      {mode === 'signin' && (
                        <Link href="/auth/forgot" className="auth-text-button">
                          {t(lang, 'forgotPassword')}
                        </Link>
                      )}
                    </div>
                    <input
                      id="auth-password"
                      className="auth-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    />
                  </div>
                  <button className="btn auth-submit" disabled={busy || !email || password.length < 6} onClick={handleEmail}>
                    {mode === 'signup' ? t(lang, 'signUp') : t(lang, 'signIn')}
                    <span className="arw" aria-hidden="true">→</span>
                  </button>
                </>
              )
            ) : (
              <>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-phone">{t(lang, 'phoneLabel')}</label>
                  <input id="auth-phone" className="auth-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={codeSent} placeholder="+14155552671" />
                </div>
                {codeSent && (
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="auth-code">{t(lang, 'codeLabel')}</label>
                    <input id="auth-code" className="auth-input" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
                  </div>
                )}
                <button className="btn auth-submit" disabled={busy || !phone || (codeSent && !code)} onClick={handlePhone}>
                  {codeSent ? t(lang, 'verify') : t(lang, 'sendCode')}
                  <span className="arw" aria-hidden="true">→</span>
                </button>
                {codeSent && (
                  <button className="auth-inline-link auth-resend" disabled={busy || resendLeft > 0} onClick={resendSms}>
                    {busy ? t(lang, 'resending') : resendLeft > 0 ? t(lang, 'resendIn').replace('{n}', String(resendLeft)) : t(lang, 'resendCode')}
                  </button>
                )}
              </>
            )}

            {info && <p className="auth-notice">{info}</p>}
            {error && <p className="auth-notice auth-error">{error}</p>}
          </div>

          <p className="auth-switch">
            {mode === 'signup' ? t(lang, 'haveAccount') : t(lang, 'noAccount')}{' '}
            <button
              className="auth-inline-link"
              onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setInfo(''); }}
            >
              {mode === 'signup' ? t(lang, 'signIn') : t(lang, 'signUp')}
            </button>
          </p>

          {mode === 'signup' && (
            <p className="auth-terms">
              {s.termsPrefix}{' '}
              <Link href="/legal" className="auth-inline-link">{s.termsLink}</Link>
              {' '}{s.termsSuffix}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
