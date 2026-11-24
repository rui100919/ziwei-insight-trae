-- =====================================================================
-- 002_full_report.sql — 付费完整报告的事务性保存与幂等生成
-- 前置：已执行 schema.sql 与 migrations/001_payments.sql
-- 说明：full_report 是永久权益，生成报告不会消耗该权益，也不会触碰免费基础额度。
-- =====================================================================

create or replace function public.create_full_report(
  p_idempotency_key   text,
  p_profile_label     text,
  p_birth_date        date,
  p_birth_time        time,
  p_birth_time_known  boolean,
  p_birth_place       text,
  p_timezone          text,
  p_utc_offset        text,
  p_chart_preferences jsonb,
  p_chart_data        jsonb,
  p_language          text,
  p_content           jsonb,
  p_engine_name       text,
  p_engine_version    text,
  p_chart_rule_version text,
  p_ai_model          text,
  p_prompt_version    text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id    uuid := auth.uid();
  v_ent_status text;
  v_report_id  uuid;
  v_report_type text;
  v_profile_id uuid;
  v_chart_id   uuid;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_idempotency_key is null or length(p_idempotency_key) < 8 then
    raise exception 'INVALID_IDEMPOTENCY_KEY' using errcode = '22023';
  end if;
  if p_language not in ('zh', 'en') then
    raise exception 'INVALID_LANGUAGE' using errcode = '22023';
  end if;
  if p_content is null or jsonb_typeof(p_content) <> 'object'
     or p_chart_data is null or jsonb_typeof(p_chart_data) <> 'object' then
    raise exception 'INVALID_REPORT_CONTENT' using errcode = '22023';
  end if;
  if p_profile_label is null or length(trim(p_profile_label)) = 0
     or p_birth_place is null or length(trim(p_birth_place)) = 0
     or p_timezone is null or length(trim(p_timezone)) = 0 then
    raise exception 'INVALID_BIRTH_PROFILE' using errcode = '22023';
  end if;

  -- 同一用户、同一请求键直接返回已有完整报告；禁止复用其他报告类型的请求键。
  select j.report_id, r.report_type
    into v_report_id, v_report_type
  from public.generation_jobs j
  join public.reports r on r.id = j.report_id
  where j.user_id = v_user_id
    and j.idempotency_key = p_idempotency_key;
  if found then
    if v_report_type <> 'full' then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = '23505';
    end if;
    return v_report_id;
  end if;

  -- 行锁串行化同一用户的并发生成，永久权益保持 available，不置为 consumed。
  select status into v_ent_status
  from public.user_entitlements
  where user_id = v_user_id
    and benefit_code = 'full_report'
  for update;
  if not found or v_ent_status <> 'available' then
    raise exception 'PAYMENT_REQUIRED' using errcode = '42501';
  end if;

  -- 等待行锁后再次检查，覆盖两个相同请求同时到达的情况。
  select j.report_id, r.report_type
    into v_report_id, v_report_type
  from public.generation_jobs j
  join public.reports r on r.id = j.report_id
  where j.user_id = v_user_id
    and j.idempotency_key = p_idempotency_key;
  if found then
    if v_report_type <> 'full' then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = '23505';
    end if;
    return v_report_id;
  end if;

  insert into public.birth_profiles (
    user_id, label, birth_date, birth_time, birth_time_known,
    birth_place, timezone, utc_offset, chart_preferences
  ) values (
    v_user_id, trim(p_profile_label), p_birth_date,
    case when p_birth_time_known then p_birth_time else null end,
    p_birth_time_known, trim(p_birth_place), p_timezone,
    nullif(p_utc_offset, ''), coalesce(p_chart_preferences, '{}'::jsonb)
  ) returning id into v_profile_id;

  insert into public.charts (
    user_id, birth_profile_id, chart_data,
    engine_name, engine_version, chart_rule_version
  ) values (
    v_user_id, v_profile_id, p_chart_data,
    p_engine_name, p_engine_version, p_chart_rule_version
  ) returning id into v_chart_id;

  insert into public.reports (
    user_id, chart_id, report_type, language,
    content, status, ai_model, prompt_version
  ) values (
    v_user_id, v_chart_id, 'full', p_language,
    p_content, 'completed', p_ai_model, p_prompt_version
  ) returning id into v_report_id;

  insert into public.generation_jobs (
    user_id, report_id, idempotency_key, status, completed_at
  ) values (
    v_user_id, v_report_id, p_idempotency_key, 'succeeded', now()
  );

  return v_report_id;
end;
$$;

comment on function public.create_full_report(
  text, text, date, time, boolean, text, text, text, jsonb, jsonb,
  text, jsonb, text, text, text, text, text
) is '校验当前用户 full_report 权益，以同一事务创建出生档案、命盘、完整报告和成功任务；按 idempotency_key 幂等。';

revoke all on function public.create_full_report(
  text, text, date, time, boolean, text, text, text, jsonb, jsonb,
  text, jsonb, text, text, text, text, text
) from public;
-- Supabase 默认权限可能单独授予 anon，PUBLIC 撤销不会覆盖该显式授权。
revoke execute on function public.create_full_report(
  text, text, date, time, boolean, text, text, text, jsonb, jsonb,
  text, jsonb, text, text, text, text, text
) from anon;
grant execute on function public.create_full_report(
  text, text, date, time, boolean, text, text, text, jsonb, jsonb,
  text, jsonb, text, text, text, text, text
) to authenticated, service_role;
