import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 自有域名确认入口。
 *
 * 邮件模板里不再用默认的 *.supabase.co 链接，而是指向本站：
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/account
 * 这样链接域名与站点一致，收件方（QQ / Outlook）对陌生域名链接的拦截更少。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
  const tokenHash = searchParams.get('token_hash');
  const rawType = searchParams.get('type') ?? 'email';
  // 只接受站内相对路径，避免开放重定向。
  const nextParam = searchParams.get('next') ?? '';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/account';

  const allowed = ['signup', 'magiclink', 'email', 'recovery', 'invite', 'email_change'] as const;
  const type = (allowed as readonly string[]).includes(rawType)
    ? (rawType as (typeof allowed)[number])
    : 'email';

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth?error=confirm`);
}
