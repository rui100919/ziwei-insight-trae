-- 005_reports_list.sql — 「我的报告」列表包含已退款关闭的报告
-- 前置：已执行 004_refund_lock.sql
--
-- 背景：004 让锁定报告对本人完全不可读，列表里也会消失。
--       产品要求：列表仍显示，点进去提示已关闭。
--
-- 口径：列表改走本函数，只返回元数据与未锁定报告的摘要；
--       正文仍由 reports_select_own 控制，锁定报告读不到 content。

create or replace function public.list_my_reports()
returns table (
  id          uuid,
  language    text,
  report_type text,
  status      text,
  created_at  timestamptz,
  locked      boolean,
  overview    text
)
language sql
stable
security definer
set search_path = public
as $$
  select r.id,
         r.language,
         r.report_type,
         r.status,
         r.created_at,
         (r.locked_at is not null) as locked,
         case when r.locked_at is null then r.content ->> 'overview' end as overview
    from public.reports r
   where r.user_id = auth.uid()
     and r.status <> 'deleted'
   order by r.created_at desc;
$$;

revoke all on function public.list_my_reports() from public;
grant execute on function public.list_my_reports() to authenticated;
