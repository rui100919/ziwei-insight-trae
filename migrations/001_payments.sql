-- =====================================================================
-- 001_payments.sql — 接入 Stripe 收款所需的增量变更
-- 适用项目：ziwei-insight
-- 执行方式：用 scripts/db-setup.mjs 同样的方式直连 Supabase 执行（幂等）
-- 设计文档见 PAYMENTS_DESIGN.md
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 放开 user_entitlements.benefit_code：加入 full_report（永久解锁完整报告）
-- ---------------------------------------------------------------------
alter table public.user_entitlements
  drop constraint if exists user_entitlements_benefit_code_check;
alter table public.user_entitlements
  add constraint user_entitlements_benefit_code_check
  check (benefit_code in ('free_basic_reading', 'full_report'));

-- 权益状态增加 revoked（退款后回收）。原有 available/reserved/consumed 不变。
alter table public.user_entitlements
  drop constraint if exists user_entitlements_status_check;
alter table public.user_entitlements
  add constraint user_entitlements_status_check
  check (status in ('available', 'reserved', 'consumed', 'revoked'));

comment on column public.user_entitlements.benefit_code is
  'free_basic_reading=终身一次免费基础解盘; full_report=已购完整报告权益（永久解锁）';
comment on column public.user_entitlements.status is
  'available=可用, reserved=生成中, consumed=已使用, revoked=已退款回收（仅 full_report）';

-- ---------------------------------------------------------------------
-- 2. 扩展 orders 字段
-- ---------------------------------------------------------------------
alter table public.orders
  add column if not exists price_id             text,
  add column if not exists checkout_session_id  text,
  add column if not exists paid_at              timestamptz,
  add column if not exists refunded_at          timestamptz,
  add column if not exists currency_display     text,
  add column if not exists amount_tax           numeric(12,2) not null default 0;

create unique index if not exists orders_checkout_session_uidx
  on public.orders (checkout_session_id)
  where checkout_session_id is not null;

-- ---------------------------------------------------------------------
-- 3. 发货函数（Webhook 调用）：订单 pending → paid + 发放 full_report 权益
--    幂等：已是 paid 直接返回成功，不重复发权益。
--    安全：仅 service_role 可执行；校验传入金额与订单金额一致。
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

  -- 幂等：已发货直接返回，避免 Webhook 重复投递重复发权益。
  if v_order.status = 'paid' then
    return 'already_paid';
  end if;
  if v_order.status = 'refunded' then
    raise exception 'ORDER_REFUNDED' using errcode = '23514';
  end if;
  if v_order.status <> 'pending' then
    raise exception 'ORDER_NOT_PENDING' using errcode = '23514';
  end if;

  -- 防金额错配：Stripe 回调金额须与本地订单金额一致。
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

  -- 永久解锁：upsert full_report 权益。退款回收后再购买会重新置为 available。
  if v_order.user_id is not null then
    insert into public.user_entitlements (user_id, benefit_code, status, granted_at)
      values (v_order.user_id, 'full_report', 'available', now())
      on conflict (user_id, benefit_code)
      do update set status = 'available', granted_at = now();
  end if;

  return 'paid';
end;
$$;

revoke all on function public.fulfill_checkout(uuid, text, numeric, text, numeric) from public;
grant execute on function public.fulfill_checkout(uuid, text, numeric, text, numeric) to service_role;


-- ---------------------------------------------------------------------
-- 4. 退款函数（Webhook 调用）：订单 paid → refunded + 回收 full_report 权益
--    幂等：已 refunded 直接返回。
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
  end if;

  return 'refunded';
end;
$$;

revoke all on function public.refund_checkout(text) from public;
grant execute on function public.refund_checkout(text) to service_role;
