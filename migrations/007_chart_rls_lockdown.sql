-- =====================================================================
-- 007 收紧 charts 表直读权限
--
-- 006 的 get_report_chart 已经接管「读盘面」这件事。这里关闭前端直读
-- charts 表的能力，避免绕过 API 用 anon key + 自己的登录态直接取
-- chart_data（其中包含完整星曜、四化、大限）。
--
-- 执行顺序（重要）：
--   1) 先执行 006 并部署使用 get_report_chart 的前端代码；
--   2) 确认报告页能正常显示命盘后，再执行本迁移。
--   若先执行本迁移，旧版报告页的 charts 嵌套查询会失败（页面报错，不会泄露数据）。
--
-- 回滚：create policy charts_select_own on public.charts
--         for select to authenticated using (auth.uid() = user_id);
--       grant select on public.charts to authenticated;
-- =====================================================================

drop policy if exists charts_select_own on public.charts;

-- 表级 SELECT 一并收回；读盘面统一走 006 的函数（service_role 不受影响）。
revoke select on public.charts from authenticated;
