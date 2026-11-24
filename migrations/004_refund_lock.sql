-- 004_refund_lock.sql — 退款后关闭已生成的完整报告
-- 前置：已执行 schema.sql、001_payments.sql、002/003（full report 流程）
--
-- 背景：退款只会回收 full_report 权益（不可再生成）；但已生成的报告
--       仍可凭 reports_select_own 读到。本迁移补上「退款 → 锁定报告」。
--
-- 口径：
--   - 锁定 = reports.locked_at 非空；RLS 直接把锁定报告对本人隐藏。
--   - 重新购买（fulfill_checkout）会把该用户的完整报告解锁。
--   - 基础报告（report_type='basic'）不受影响。

-- ---------------------------------------------------------------------
-- 1. 锁定标记
-- ---------------------------------------------------------------------
alter table public.reports
  add column if not exists locked_at timestamptz;

comment on column public.reports.locked_at is
  '非空表示因订单退款被关闭，本人也不可再读取；重新购买后清空。';

-- ---------------------------------------------------------------------
-- 2. RLS：锁定报告不可读
-- ---------------------------------------------------------------------
drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports
  for select to authenticated
  using (auth.uid() = user_id and status <> 'deleted' and locked_at is null);

-- ---------------------------------------------------------------------
-- 3. 发货函数：补「重新购买 → 解锁历史完整报告」
-- ---------------------------------------------------------------------
create or replace function public.fulfill_checkout(
  p_order_id            uuid,
  p_provider_order_id   text,
  p_amount_total        numeric,
  p_currency_display    text default null,
  p_amount_tax          numeric default 0
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_order.status = 'paid' then
    return 'already_paid';
  end if;
  if v_order.status = 'refunded' then
    raise exception 'ORDER_REFUNDED' using errcode = '23514';
  end if;
  if v_order.status <> 'pending' then
    raise exception 'ORDER_NOT_PENDING' using errcode = '23514';
  end if;

  if abs(v_order.amount - coalesce(p_amount_total, -1)) > 0.01 then
    raise exception 'AMOUNT_MISMATCH' using errcode = '23514';
  end if;

  update public.orders
     set status = 'paid',
         provider_order_id = p_provider_order_id,
         paid_at = now(),
         currency_display = coalesce(p_currency_display, v_order.currency),
         amount_tax = coalesce(p_amount_tax, 0)
   where id = p_order_id;

  if v_order.user_id is not null then
    insert into public.user_entitlements (user_id, benefit_code, status, granted_at)
      values (v_order.user_id, 'full_report', 'available', now())
      on conflict (user_id, benefit_code)
      do update set status = 'available', granted_at = now();

    -- 之前退款关闭的报告，在重新购买后恢复可读。
    update public.reports
       set locked_at = null
     where user_id = v_order.user_id
       and report_type = 'full'
       and locked_at is not null;
  end if;

  return 'paid';
end;
$$;

revoke all on function public.fulfill_checkout(uuid, text, numeric, text, numeric) from public;
grant execute on function public.fulfill_checkout(uuid, text, numeric, text, numeric) to service_role;

-- ---------------------------------------------------------------------
-- 4. 退款函数：回收权益 + 锁定完整报告
-- ---------------------------------------------------------------------
create or replace function public.refund_checkout(
  p_provider_order_id text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders
   where provider_order_id = p_provider_order_id
   order by created_at desc
   limit 1
   for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_order.status = 'refunded' then
    return 'already_refunded';
  end if;

  update public.orders
     set status = 'refunded', refunded_at = now()
   where id = v_order.id;

  if v_order.user_id is not null then
    update public.user_entitlements
       set status = 'revoked'
     where user_id = v_order.user_id
       and benefit_code = 'full_report'
       and status = 'available';

    update public.reports
       set locked_at = coalesce(locked_at, now())
     where user_id = v_order.user_id
       and report_type = 'full'
       and status <> 'deleted'
       and locked_at is null;
  end if;

  return 'refunded';
end;
$$;

revoke all on function public.refund_checkout(text) from public;
grant execute on function public.refund_checkout(text) to service_role;

-- ---------------------------------------------------------------------
-- 5. 报告访问状态（供页面区分「不存在」与「退款关闭」）
-- ---------------------------------------------------------------------
create or replace function public.report_access_state(p_report_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_report public.reports%rowtype;
begin
  if auth.uid() is null then
    return 'not_found';
  end if;

  select * into v_report
    from public.reports
   where id = p_report_id
     and user_id = auth.uid();

  if not found or v_report.status = 'deleted' then
    return 'not_found';
  end if;
  if v_report.locked_at is not null then
    return 'locked';
  end if;
  return 'ok';
end;
$$;

revoke all on function public.report_access_state(uuid) from public;
grant execute on function public.report_access_state(uuid) to authenticated, service_role;
