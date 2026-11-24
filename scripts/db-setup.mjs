/**
 * 用 session pooler 直连 Supabase 数据库，执行 schema.sql 建表并验证。
 * 数据库密码从环境变量 SUPABASE_DB_PASSWORD 读取，绝不写死在代码里。
 *
 * 用法：
 *   SUPABASE_DB_PASSWORD='你的数据库密码' node scripts/db-setup.mjs
 * 注意：pg 已从 package.json 移除（避免部署平台误判需要本地数据库），
 *   运行前先执行：npm install --no-save pg
 */
import fs from 'node:fs';
import pg from 'pg';

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error('缺少 SUPABASE_DB_PASSWORD 环境变量。');
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

const sql = fs.readFileSync(new URL('../schema.sql', import.meta.url), 'utf8');

try {
  await client.connect();
  console.log('✓ 数据库连接成功');

  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('✓ schema.sql 执行成功（事务已提交）');

  // 验证 7 张表是否都建好
  const { rows } = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('profiles','birth_profiles','charts','user_entitlements','reports','generation_jobs','orders')
    order by table_name;
  `);
  const expected = ['birth_profiles','charts','generation_jobs','orders','profiles','reports','user_entitlements'];
  const got = rows.map((r) => r.table_name);
  console.log('✓ 已建表:', got.join(', '));
  const missing = expected.filter((t) => !got.includes(t));
  if (missing.length) {
    console.error('✗ 缺失表:', missing.join(', '));
    process.exitCode = 1;
  } else {
    console.log('✓ 7 张表全部就绪');
  }

  // 验证触发器与关键函数
  const fn = await client.query(`
    select routine_name from information_schema.routines
    where routine_schema = 'public'
      and routine_name in ('handle_new_user','reserve_free_basic_reading','complete_generation','fail_generation','soft_delete_report')
    order by routine_name;
  `);
  console.log('✓ 关键函数:', fn.rows.map((r) => r.routine_name).join(', '));
} catch (err) {
  console.error('✗ 失败:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
