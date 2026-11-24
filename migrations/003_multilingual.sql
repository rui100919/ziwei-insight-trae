-- =====================================================================
-- 003_multilingual.sql — 支持 zh / en / es / fr / de / ja
-- 前置：已执行 schema.sql、migrations/001_payments.sql、002_full_report.sql
-- 说明：只放宽语言白名单，不回填历史数据，不改变权益、幂等与支付逻辑。
-- =====================================================================

begin;

alter table public.profiles
  drop constraint if exists profiles_preferred_language_check;
alter table public.profiles
  add constraint profiles_preferred_language_check
  check (preferred_language in ('zh', 'en', 'es', 'fr', 'de', 'ja'));

alter table public.reports
  drop constraint if exists reports_language_check;
alter table public.reports
  add constraint reports_language_check
  check (language in ('zh', 'en', 'es', 'fr', 'de', 'ja'));

-- 注册及验证后发放免费额度：逻辑保持原样，只扩展偏好语言白名单。
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

-- 免费基础报告预留：权益状态机与幂等逻辑保持原样。
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

  select * into v_ent
  from public.user_entitlements
  where user_id = v_user_id and benefit_code = 'free_basic_reading'
  for update;

  if not found then
    raise exception 'ENTITLEMENT_NOT_FOUND' using errcode = 'P0002';
  end if;

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

-- 完整报告保存：事务、永久权益与幂等逻辑保持原样。
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
  if p_language not in ('zh', 'en', 'es', 'fr', 'de', 'ja') then
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

  select status into v_ent_status
  from public.user_entitlements
  where user_id = v_user_id
    and benefit_code = 'full_report'
  for update;
  if not found or v_ent_status <> 'available' then
    raise exception 'PAYMENT_REQUIRED' using errcode = '42501';
  end if;

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

revoke all on function public.create_full_report(
  text, text, date, time, boolean, text, text, text, jsonb, jsonb,
  text, jsonb, text, text, text, text, text
) from public;
revoke execute on function public.create_full_report(
  text, text, date, time, boolean, text, text, text, jsonb, jsonb,
  text, jsonb, text, text, text, text, text
) from anon;
grant execute on function public.create_full_report(
  text, text, date, time, boolean, text, text, text, jsonb, jsonb,
  text, jsonb, text, text, text, text, text
) to authenticated, service_role;

commit;
