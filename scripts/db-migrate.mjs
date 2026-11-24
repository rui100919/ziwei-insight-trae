/**
 * 直连 Supabase 执行 migrations/ 下的增量迁移并验证。
 * 数据库密码从 .env.local 的 SUPABASE_DB_PASSWORD 读取，不写死。
 *
 * 用法：node scripts/db-migrate.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

// 读取 .env.local 里的数据库密码
const envText = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const password = envText.match(/^SUPABASE_DB_PASSWORD=(.*)$/m)?.[1]?.trim();
if (!password) {
  console.error('缺少 SUPABASE_DB_PASSWORD（.env.local）。');
  process.exit(1);
}

const client = new pg.Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.gnnygeuhgrdycuduqrut',
  password,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
  statement_timeout: 60000,
});

const file = process.argv[2] || '001_payments.sql';
const sqlPath = path.resolve(new URL('../migrations/', import.meta.url).pathname, file);
const sql = fs.readFileSync(sqlPath, 'utf8');

try {
  await client.connect();
  console.log('✓ 数据库连接成功');
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log(`✓ 迁移 ${file} 执行成功（事务已提交）`);

  const cols = await client.query(`
    select column_name from information_schema.columns
    where table_schema='public' and table_name='orders'
      and column_name in ('price_id','checkout_session_id','paid_at','refunded_at','currency_display','amount_tax')
    order by column_name;
  `);
  console.log('✓ orders 新字段:', cols.rows.map((r) => r.column_name).join(', '));

  const fn = await client.query(`
    select routine_name from information_schema.routines
    where routine_schema='public' and routine_name in ('fulfill_checkout','refund_checkout')
    order by routine_name;
  `);
  console.log('✓ 新增函数:', fn.rows.map((r) => r.routine_name).join(', '));

  const check = await client.query(`
    select pg_get_constraintdef(oid) as def from pg_constraint
    where conname='user_entitlements_benefit_code_check';
  `);
  console.log('✓ benefit_code 约束:', check.rows[0]?.def || '(未找到)');
} catch (err) {
  console.error('✗ 失败:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
