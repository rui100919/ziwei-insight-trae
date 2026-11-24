import { createClient } from '@supabase/supabase-js';

/** service_role 只能在服务端使用，绕过 RLS；不要把此客户端导入任何客户端组件。 */
export function createAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role environment variables are missing.');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
