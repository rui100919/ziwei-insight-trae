import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // 线上经过反代时 request.url 是内网主机名，必须用公开站点地址回跳，否则验证后会跳到 railway.app。
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
  const code = searchParams.get('code');
  // 只接受站内相对路径，避免被拿来做开放重定向。
  const nextParam = searchParams.get('next') ?? '';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/chart/new';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth?next=${encodeURIComponent(next)}`);
}
