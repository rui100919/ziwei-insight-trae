-- =====================================================================
-- 006 完整命盘付费墙：按权益返回完整盘面或预览盘面
--
-- 背景：
--   商业化第一阶段把「完整紫微命盘」改为付费解锁。免费用户可以看十二宫
--   骨架与主星名；辅星/煞星、亮度、四化、大限段与当前大限需购买后解锁。
--
-- 为什么用 SECURITY DEFINER 函数：
--   盘面存在 charts.chart_data，若前端直读该表，未付费用户改一下前端参数
--   就能拿到完整盘面。这里把「读盘 + 权益判断 + 预览裁剪」收进一个函数，
--   数据库层保证未付费只可能拿到预览数据，与前端实现无关。
--
-- 裁剪口径必须与 lib/chart-preview.ts 的 toPreviewChart 保持一致。
-- =====================================================================

create or replace function public.get_report_chart(p_report_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_chart        jsonb;
  v_status       text;
  v_locked_at    timestamptz;
  v_profile_id   uuid;
  v_language     text;
  v_report_type  text;
  v_entitled     boolean;
  v_profile      jsonb;
begin
  if auth.uid() is null then
    return null;
  end if;

  select c.chart_data,
         r.status,
         r.locked_at,
         c.birth_profile_id,
         r.language,
         r.report_type
    into v_chart, v_status, v_locked_at, v_profile_id, v_language, v_report_type
    from public.reports r
    join public.charts c on c.id = r.chart_id
   where r.id = p_report_id
     and r.user_id = auth.uid();

  -- 不存在 / 已删除 / 订单退款关闭：一律当作不可见。
  if v_chart is null then
    return null;
  end if;
  if v_status = 'deleted' or v_locked_at is not null then
    return null;
  end if;

  select jsonb_build_object(
           'label', bp.label,
           'birthDate', bp.birth_date,
           'birthTime', to_char(bp.birth_time, 'HH24:MI'),
           'timeKnown', bp.birth_time_known,
           'birthPlace', bp.birth_place,
           'timezone', bp.timezone
         )
    into v_profile
    from public.birth_profiles bp
   where bp.id = v_profile_id
     and bp.user_id = auth.uid();

  select exists (
           select 1
             from public.user_entitlements e
            where e.user_id = auth.uid()
              and e.benefit_code = 'full_report'
              and e.status = 'available'
         )
    into v_entitled;

  if v_entitled then
    return jsonb_build_object(
      'full', true,
      'chart', v_chart,
      'profile', v_profile,
      'language', v_language,
      'reportType', v_report_type
    );
  end if;

  -- 预览：十二宫骨架 + 命宫/身宫标记 + 主星名。
  -- 去掉：辅星/煞星、亮度、四化、大限年龄段、当前大限、长生/博士十二神、
  --       十二宫大限表、当前虚岁。
  return jsonb_build_object(
    'full', false,
    'chart', jsonb_build_object(
      'birthInfo', v_chart -> 'birthInfo',
      'lunarInfo', v_chart -> 'lunarInfo',
      'mingGongBranch', v_chart -> 'mingGongBranch',
      'shenGongBranch', v_chart -> 'shenGongBranch',
      'wuxingJu', v_chart -> 'wuxingJu',
      'wuxingJuName', v_chart -> 'wuxingJuName',
      'ziweiPos', v_chart -> 'ziweiPos',
      'mingZhu', v_chart -> 'mingZhu',
      'shenZhu', v_chart -> 'shenZhu',
      'yinYangGender', v_chart -> 'yinYangGender',
      'palaces', coalesce((
        select jsonb_agg(
                 jsonb_build_object(
                   'branch', p -> 'branch',
                   'stem', p -> 'stem',
                   'name', p -> 'name',
                   'isMingGong', p -> 'isMingGong',
                   'isShenGong', p -> 'isShenGong',
                   'isEmpty', p -> 'isEmpty',
                   'borrowedStars', p -> 'borrowedStars',
                   'stars', coalesce((
                     select jsonb_agg(jsonb_build_object('name', s -> 'name', 'type', s -> 'type'))
                       from jsonb_array_elements(coalesce(p -> 'stars', '[]'::jsonb)) s
                      where s ->> 'type' = 'major'
                   ), '[]'::jsonb)
                 )
               )
          from jsonb_array_elements(coalesce(v_chart -> 'palaces', '[]'::jsonb)) p
      ), '[]'::jsonb)
    ),
    'profile', v_profile,
    'language', v_language,
    'reportType', v_report_type
  );
end;
$$;

revoke all on function public.get_report_chart(uuid) from public;
grant execute on function public.get_report_chart(uuid) to authenticated, service_role;

comment on function public.get_report_chart(uuid) is
  '按当前用户权益返回报告的命盘：已购 full_report 返回完整盘面，否则返回预览盘面（十二宫骨架 + 主星）。';
