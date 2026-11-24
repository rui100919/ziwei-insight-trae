-- =====================================================================
-- Zi Wei Insight — Supabase PostgreSQL Schema (MVP v1)
-- =====================================================================
-- 设计依据：用户系统规则（邮箱注册 + Google 登录、终身一次免费基础解盘、
-- 报告保存在账户中且可由用户删除）。
--
-- 执行方式：在 Supabase 项目 SQL Editor 中整体运行，或使用 psql 连接后 \i schema.sql
-- 前置条件：Supabase 项目已创建，auth schema、anon / authenticated / service_role
--           角色以及 auth.uid() 函数均为 Supabase 默认提供，无需手工创建。
--
-- 安全原则：
--   1. 密码只由 Supabase Auth 管理，本 schema 不保存任何密码。
--   2. 所有业务表开启 RLS；用户只能读写自己的数据。
--   3. user_entitlements 对前端只读，发放/预留/消耗/释放只能通过本文件中的
--      触发器和 SECURITY DEFINER 函数完成。
--   4. service_role 密钥与 AI API Key 只允许放在服务端，严禁进入前端。
--   5. 服务端调用 AI 时不要占用数据库事务：先 reserve，再调用 AI，最后
--      complete 或 fail。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. 基础函数：自动维护 updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;
grant execute on function public.set_updated_at() to authenticated, service_role;


-- ---------------------------------------------------------------------
-- 1. profiles — 用户账户表
--    与 auth.users 一对一；email 仅作展示/同步，认证邮箱以 auth.users 为准。
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key
                     references auth.users (id) on delete cascade,
  display_name       text not null default 'User',
  email              text,
  preferred_language text not null default 'zh'
                     check (preferred_language in ('zh', 'en', 'es', 'fr', 'de', 'ja')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.profiles is
  '用户展示资料；id 等于 auth.users.id，不保存密码。';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 2. birth_profiles — 出生资料表
--    一个用户可保存多份资料（自己/家人）。时区必须使用 IANA 名称，
--    因为 UTC 偏移量无法正确处理夏令时。
-- ---------------------------------------------------------------------
create table if not exists public.birth_profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null
                    references auth.users (id) on delete cascade,
  label             text not null check (length(trim(label)) > 0),
  birth_date        date not null,
  birth_time        time,
  birth_time_known  boolean not null default true,
  birth_place       text,
  timezone          text not null,
  utc_offset        text,
  chart_preferences jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

comment on column public.birth_profiles.timezone is
  'IANA 时区，例如 Asia/Kuala_Lumpur、Europe/London、America/New_York。';
comment on column public.birth_profiles.utc_offset is
  '用户输入时携带的偏移量，仅供参考；排盘以 timezone 为准。';


-- ---------------------------------------------------------------------
-- 3. charts — 命盘表
--    保存排盘引擎产出的完整结构化 JSON，并记录引擎/规则版本以便追溯。
-- ---------------------------------------------------------------------
create table if not exists public.charts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null
                    references auth.users (id) on delete cascade,
  birth_profile_id  uuid not null
                    references public.birth_profiles (id) on delete cascade,
  chart_data        jsonb not null,
  engine_name       text not null,
  engine_version    text not null,
  chart_rule_version text not null,
  created_at        timestamptz not null default now()
);

comment on column public.charts.chart_rule_version is
  '排盘流派/规则版本；升级引擎后历史报告仍可按当时的规则解释。';


-- ---------------------------------------------------------------------
-- 4. reports — 报告表
--    basic / full、zh / en 的报告内容都存 JSONB，便于多语言与导出。
-- ---------------------------------------------------------------------
create table if not exists public.reports (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null
                 references auth.users (id) on delete cascade,
  chart_id       uuid not null
                 references public.charts (id) on delete cascade,
  report_type    text not null default 'basic'
                 check (report_type in ('basic', 'full')),
  language       text not null default 'zh'
                 check (language in ('zh', 'en', 'es', 'fr', 'de', 'ja')),
  content        jsonb,
  status         text not null default 'pending'
                 check (status in ('pending', 'completed', 'failed', 'deleted')),
  ai_model       text,
  prompt_version text,
  created_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

comment on column public.reports.content is
  '结构化报告，例如 {overview, personality, strengths, career, caveats}，不存 HTML。';


-- ---------------------------------------------------------------------
-- 5. generation_jobs — 生成任务表
--    idempotency_key 唯一，保证重复点击不会重复调用 AI 或重复扣额度。
-- ---------------------------------------------------------------------
create table if not exists public.generation_jobs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null
                  references auth.users (id) on delete cascade,
  report_id       uuid not null
                  references public.reports (id) on delete cascade,
  idempotency_key text not null unique,
  status          text not null default 'queued'
                  check (status in ('queued', 'processing', 'succeeded', 'failed')),
  error_code      text,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);


-- ---------------------------------------------------------------------
-- 6. orders — 订单表
--    第一版不启用支付，但提前建表，避免以后重构账户体系。
--    user_id / report_id 使用 SET NULL，以便账户删除后仍保留法定会计记录。
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid
                    references auth.users (id) on delete set null,
  report_id         uuid
                    references public.reports (id) on delete set null,
  amount            numeric(12, 2) not null check (amount >= 0),
  currency          text not null default 'USD',
  payment_provider  text not null,
  provider_order_id text,
  status            text not null default 'pending'
                    check (status in ('pending', 'paid', 'refunded')),
  created_at        timestamptz not null default now()
);

create unique index if not exists orders_provider_order_uidx
  on public.orders (payment_provider, provider_order_id)
  where provider_order_id is not null;


-- ---------------------------------------------------------------------
-- 7. user_entitlements — 免费额度表（核心）
--    UNIQUE (user_id, benefit_code) 保证一个账号只能领取一次免费额度。
-- ---------------------------------------------------------------------
create table if not exists public.user_entitlements (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null
                     references auth.users (id) on delete cascade,
  benefit_code       text not null default 'free_basic_reading'
                     check (benefit_code = 'free_basic_reading'),
  status             text not null default 'available'
                     check (status in ('available', 'reserved', 'consumed')),
  granted_at         timestamptz not null default now(),
  reserved_at        timestamptz,
  consumed_at        timestamptz,
  consumed_report_id uuid
                     references public.reports (id) on delete set null,
  constraint user_entitlements_once_uniq
    unique (user_id, benefit_code)
);

comment on table public.user_entitlements is
  '终身一次免费基础解盘权益。前端只读；状态流转由服务端函数完成。';
comment on column public.user_entitlements.status is
  'available=未使用, reserved=生成中, consumed=已成功生成报告。';


-- ---------------------------------------------------------------------
-- 8. 索引
-- ---------------------------------------------------------------------
create index if not exists birth_profiles_user_idx
  on public.birth_profiles (user_id);

create index if not exists charts_user_idx
  on public.charts (user_id);
create index if not exists charts_birth_profile_idx
  on public.charts (birth_profile_id);

create index if not exists reports_user_created_idx
  on public.reports (user_id, created_at desc);
create index if not exists reports_chart_idx
  on public.reports (chart_id);

create index if not exists generation_jobs_user_idx
  on public.generation_jobs (user_id);
create index if not exists generation_jobs_report_idx
  on public.generation_jobs (report_id);

create index if not exists orders_user_idx
  on public.orders (user_id);

-- UNIQUE (user_id, benefit_code) 已自动建立 user_entitlements 的查询索引。


-- ---------------------------------------------------------------------
-- 9. 注册后自动发放免费额度
--    触发时机：auth.users 插入，或邮箱验证状态/邮箱发生更新。
--    Google OAuth 用户由 Supabase 写入 email_confirmed_at，同样会命中。
--    未验证邮箱的账号只建立 profiles，不发额度；验证后由 UPDATE 触发器补发。
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_language text;
  v_verified boolean;
begin
  v_language := lower(coalesce(new.raw_user_meta_data ->> 'preferred_language', 'zh'));
  if v_language not in ('zh', 'en', 'es', 'fr', 'de', 'ja') then
    v_language := 'zh';
  end if;

  insert into public.profiles (id, display_name, email, preferred_language)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
             nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'User'),
    new.email,
    v_language
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  -- 验证判定：邮箱或电话任一验证通过即发放免费额度（二者选其一即可）。
  -- 邮箱：email_confirmed_at，或 OAuth 写入的 email_verified 元数据。
  -- 电话：phone_confirmed_at，或 OTP 验证后写入的 phone_verified 元数据。
  v_verified := new.email_confirmed_at is not null
                or lower(coalesce(new.raw_user_meta_data ->> 'email_verified', '')) in ('true', '1')
                or new.phone_confirmed_at is not null
                or lower(coalesce(new.raw_user_meta_data ->> 'phone_verified', '')) in ('true', '1');

  if v_verified then
    insert into public.user_entitlements (user_id, benefit_code, status, granted_at)
    values (new.id, 'free_basic_reading', 'available', now())
    on conflict (user_id, benefit_code) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to service_role;

drop trigger if exists on_auth_user_created_or_verified on auth.users;
create trigger on_auth_user_created_or_verified
  after insert or update of email, email_confirmed_at, phone, phone_confirmed_at on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 10. 服务端额度状态机函数
--     以下函数均以 auth.uid() 判定调用者身份，不接受客户端传入 user_id。
--     前端只传 chart_id / language / idempotency_key / 报告内容。
-- ---------------------------------------------------------------------

-- 10.1 预留额度并创建报告与任务。重复请求返回同一个 job_id。
create or replace function public.reserve_free_basic_reading(
  p_chart_id        uuid,
  p_idempotency_key text,
  p_language        text default 'zh'
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id  uuid := auth.uid();
  v_verified boolean := false;
  v_ent      public.user_entitlements%rowtype;
  v_job_id   uuid;
  v_report_id uuid;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_language not in ('zh', 'en', 'es', 'fr', 'de', 'ja') then
    raise exception 'INVALID_LANGUAGE' using errcode = '22023';
  end if;
  if p_idempotency_key is null or length(p_idempotency_key) < 8 then
    raise exception 'INVALID_IDEMPOTENCY_KEY' using errcode = '22023';
  end if;

  -- 验证判定：邮箱或电话任一验证通过即可使用免费额度（注册二选一）。
  select (u.email_confirmed_at is not null
          or lower(coalesce(u.raw_user_meta_data ->> 'email_verified', '')) in ('true', '1')
          or u.phone_confirmed_at is not null
          or lower(coalesce(u.raw_user_meta_data ->> 'phone_verified', '')) in ('true', '1'))
    into v_verified
  from auth.users u
  where u.id = v_user_id;
  if not coalesce(v_verified, false) then
    raise exception 'IDENTITY_NOT_VERIFIED' using errcode = '42501';
  end if;

  -- 幂等：同一请求键直接返回已有任务，不重复生成。
  select id into v_job_id
  from public.generation_jobs
  where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if found then
    return v_job_id;
  end if;

  if not exists (select 1 from public.charts c
                 where c.id = p_chart_id and c.user_id = v_user_id) then
    raise exception 'CHART_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- 行锁并发控制：两个窗口同时点击时，第二个会等待并在下面重新检查。
  select * into v_ent
  from public.user_entitlements
  where user_id = v_user_id and benefit_code = 'free_basic_reading'
  for update;

  if not found then
    raise exception 'ENTITLEMENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- 拿锁后再查一次幂等键，覆盖并发同键的第二次请求。
  select id into v_job_id
  from public.generation_jobs
  where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if found then
    return v_job_id;
  end if;

  if v_ent.status <> 'available' then
    raise exception 'FREE_READING_UNAVAILABLE' using errcode = '23514';
  end if;

  update public.user_entitlements
     set status = 'reserved', reserved_at = now()
   where id = v_ent.id and status = 'available';
  if not found then
    raise exception 'FREE_READING_UNAVAILABLE' using errcode = '23514';
  end if;

  insert into public.reports (user_id, chart_id, report_type, language, status)
  values (v_user_id, p_chart_id, 'basic', p_language, 'pending')
  returning id into v_report_id;

  insert into public.generation_jobs (user_id, report_id, idempotency_key, status)
  values (v_user_id, v_report_id, p_idempotency_key, 'queued')
  returning id into v_job_id;

  return v_job_id;
end;
$$;

revoke all on function public.reserve_free_basic_reading(uuid, text, text) from public;
grant execute on function public.reserve_free_basic_reading(uuid, text, text)
  to authenticated, service_role;


-- 10.2 AI 成功后：保存报告、最终消耗额度、任务成功。重复调用幂等。
create or replace function public.complete_generation(
  p_job_id        uuid,
  p_content       jsonb,
  p_ai_model      text,
  p_prompt_version text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_job     public.generation_jobs%rowtype;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_content is null or jsonb_typeof(p_content) <> 'object' then
    raise exception 'INVALID_REPORT_CONTENT' using errcode = '22023';
  end if;

  select * into v_job
  from public.generation_jobs
  where id = p_job_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'JOB_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_job.status = 'succeeded' then
    return v_job.report_id;
  end if;
  if v_job.status not in ('queued', 'processing') then
    raise exception 'JOB_NOT_ACTIVE' using errcode = '23514';
  end if;

  update public.reports
     set content = p_content,
         status = 'completed',
         ai_model = p_ai_model,
         prompt_version = p_prompt_version
   where id = v_job.report_id and status = 'pending';

  update public.user_entitlements
     set status = 'consumed',
         consumed_at = now(),
         consumed_report_id = v_job.report_id
   where user_id = v_job.user_id
     and benefit_code = 'free_basic_reading'
     and status = 'reserved';

  update public.generation_jobs
     set status = 'succeeded', completed_at = now()
   where id = v_job.id;

  return v_job.report_id;
end;
$$;

revoke all on function public.complete_generation(uuid, jsonb, text, text) from public;
grant execute on function public.complete_generation(uuid, jsonb, text, text)
  to authenticated, service_role;


-- 10.3 AI 失败：任务失败并把预留额度释放回 available，用户不损失次数。
create or replace function public.fail_generation(
  p_job_id     uuid,
  p_error_code text
)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_job     public.generation_jobs%rowtype;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select * into v_job
  from public.generation_jobs
  where id = p_job_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'JOB_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_job.status in ('succeeded', 'failed') then
    return;
  end if;

  update public.reports
     set status = 'failed'
   where id = v_job.report_id and status = 'pending';

  update public.generation_jobs
     set status = 'failed', error_code = p_error_code, completed_at = now()
   where id = v_job.id;

  update public.user_entitlements
     set status = 'available', reserved_at = null, consumed_report_id = null
   where user_id = v_job.user_id
     and benefit_code = 'free_basic_reading'
     and status = 'reserved'
     and (consumed_report_id is null or consumed_report_id = v_job.report_id);
end;
$$;

revoke all on function public.fail_generation(uuid, text) from public;
grant execute on function public.fail_generation(uuid, text)
  to authenticated, service_role;


-- 10.4 用户软删除单份报告。删除不恢复免费次数。
create or replace function public.soft_delete_report(p_report_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  update public.reports
     set status = 'deleted', deleted_at = now()
   where id = p_report_id
     and user_id = v_user_id
     and status <> 'deleted';
end;
$$;

revoke all on function public.soft_delete_report(uuid) from public;
grant execute on function public.soft_delete_report(uuid)
  to authenticated, service_role;


-- ---------------------------------------------------------------------
-- 11. Row Level Security
--     service_role 在 Supabase 中默认绕过 RLS，供服务端可信接口使用。
-- ---------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.birth_profiles     enable row level security;
alter table public.charts             enable row level security;
alter table public.user_entitlements  enable row level security;
alter table public.reports            enable row level security;
alter table public.generation_jobs    enable row level security;
alter table public.orders             enable row level security;

-- profiles：本人可看、可改；不允许自行插入（由 register 触发器创建）。
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- birth_profiles：本人完整 CRUD。
drop policy if exists birth_profiles_all_own on public.birth_profiles;
create policy birth_profiles_all_own on public.birth_profiles
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- charts：服务端生成，前端只读。
drop policy if exists charts_select_own on public.charts;
create policy charts_select_own on public.charts
  for select to authenticated using (auth.uid() = user_id);

-- user_entitlements：前端只读，绝不开放 insert/update/delete。
drop policy if exists entitlements_select_own on public.user_entitlements;
create policy entitlements_select_own on public.user_entitlements
  for select to authenticated using (auth.uid() = user_id);

-- reports：本人可读未删除报告；写入和删除通过服务端函数完成。
drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports
  for select to authenticated
  using (auth.uid() = user_id and status <> 'deleted');

-- generation_jobs：本人只读。
drop policy if exists jobs_select_own on public.generation_jobs;
create policy jobs_select_own on public.generation_jobs
  for select to authenticated using (auth.uid() = user_id);

-- orders：本人只读，且账户删除后 user_id 为 NULL 的记录不再对任何人可见。
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select to authenticated using (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 12. 权限显式收口
--     Supabase 默认通过 default privileges 给 anon/authenticated 授权；
--     这里显式写出，便于迁移到其他 PostgreSQL 环境时行为一致。
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.birth_profiles to authenticated;
grant select on public.charts to authenticated;
grant select on public.user_entitlements to authenticated;
grant select on public.reports to authenticated;
grant select on public.generation_jobs to authenticated;
grant select on public.orders to authenticated;

grant all on all tables in schema public to service_role;

-- 禁止匿名用户直接访问任何业务表。
revoke all on public.profiles from anon;
revoke all on public.birth_profiles from anon;
revoke all on public.charts from anon;
revoke all on public.user_entitlements from anon;
revoke all on public.reports from anon;
revoke all on public.generation_jobs from anon;
revoke all on public.orders from anon;


-- =====================================================================
-- 13. 服务端调用顺序（供开发实现参考，非 SQL）
-- =====================================================================
-- 1) 注册/登录：Supabase Auth 完成，触发器自动创建 profiles；
--    邮箱或手机号任一验证通过（含 Google 已验证邮箱）即自动发放 free_basic_reading。
--    注册只需邮箱或电话二选一，验证后即可获得一次免费基础解读。
-- 2) 用户创建出生资料 -> 排盘引擎生成命盘 -> 写入 charts。
-- 3) 用户点击 Generate Free Reading：
--    const key = crypto.randomUUID(); // 前端生成并保存，重试复用同一个 key
--    supabase.rpc('reserve_free_basic_reading', {
--      p_chart_id: chartId, p_language: 'zh', p_idempotency_key: key
--    })
--    -> 返回 job_id；若报 FREE_READING_UNAVAILABLE 则引导购买完整报告。
-- 4) 服务端拿 job_id 调用 AI（不在数据库事务内）。
-- 5a) 成功：supabase.rpc('complete_generation', {
--       p_job_id: jobId, p_content: reportJson,
--       p_ai_model: '...', p_prompt_version: '...'
--     })
-- 5b) 失败：supabase.rpc('fail_generation', {
--       p_job_id: jobId, p_error_code: 'AI_TIMEOUT'
--     })
--     -> 额度回到 available，用户可重试。
-- 6) 删除报告：supabase.rpc('soft_delete_report', { p_report_id: id })
--    -> 免费次数不恢复；隐私政策需说明软删除到最终清理的期限。
-- 7) 删除出生资料前：先查询该资料关联的 charts/reports 并提示用户；
--    确认后删除 birth_profiles，关联命盘与报告会级联删除。
-- =====================================================================
