import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdmin } from '@/lib/supabase/admin';
import { isDemoMode } from '@/lib/demo';

export async function POST(request: Request) {
  if (isDemoMode()) return NextResponse.json({ ok: true });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'NEED_LOGIN' }, { status: 401 });

  const body = await request.json() as { confirm?: string };
  if (body.confirm !== 'DELETE') return NextResponse.json({ error: 'CONFIRM_REQUIRED' }, { status: 400 });

  const { error } = await createAdmin().auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
