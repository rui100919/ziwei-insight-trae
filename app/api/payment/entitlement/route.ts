import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { isPaymentsConfigured, getPaymentProvider } from '@/lib/payments/config';

export const runtime = 'nodejs';

/**
 * GET /api/payment/entitlement — 前端展示购买/解锁状态
 * 返回：isDemo, paymentsEnabled, loggedIn, unlocked
 */
export async function GET() {
  const demo = isDemoMode();
  if (demo) {
    return NextResponse.json({ isDemo: true, paymentsEnabled: false, loggedIn: true, unlocked: true });
  }

  const paymentsEnabled = isPaymentsConfigured();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ isDemo: false, paymentsEnabled, loggedIn: false, unlocked: false });
  }

  const { data: ent } = await supabase
    .from('user_entitlements')
    .select('status')
    .eq('user_id', user.id)
    .eq('benefit_code', 'full_report')
    .eq('status', 'available')
    .maybeSingle();

  return NextResponse.json({
    isDemo: false,
    paymentsEnabled,
    provider: getPaymentProvider(),
    loggedIn: true,
    unlocked: Boolean(ent),
  });
}
