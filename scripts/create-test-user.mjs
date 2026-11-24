/**
 * 用 service_role 创建（或复用）一个已验证的测试账号，用于端到端购买测试。
 * 幂等：已存在则直接重置密码为已知值。
 *
 * 用法：node scripts/create-test-user.mjs
 */
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const url = envText.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)?.[1]?.trim();
const serviceKey = envText.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m)?.[1]?.trim();
if (!url || !serviceKey) { console.error('缺少 Supabase 配置'); process.exit(1); }

const TEST_EMAIL = 'ziwei.buyer.test@gmail.com';
const TEST_PASSWORD = 'Test-Buyer-2026!';

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

try {
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const user = existing?.users?.find((u) => u.email === TEST_EMAIL);

  if (user) {
    // 确保验证状态 + 重置密码
    await admin.auth.admin.updateUserById(user.id, {
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    console.log(`✓ 复用测试账号 ${TEST_EMAIL} (id: ${user.id})，已确认邮箱并重置密码`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true, // 跳过邮箱验证（触发器会立即发放免费额度，正好测试注册链路）
    });
    if (error) throw error;
    console.log(`✓ 创建测试账号 ${TEST_EMAIL} (id: ${data.user.id})，邮箱已验证`);
  }
  console.log(`  密码: ${TEST_PASSWORD}`);
} catch (err) {
  console.error('✗ 失败:', err.message);
  process.exitCode = 1;
}
