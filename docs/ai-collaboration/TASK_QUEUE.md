# TASK_QUEUE · 任务队列

> 统一记录待执行任务、优先级与状态。新增任务请追加到对应优先级区块，并更新状态。
> 状态枚举：`待执行` / `进行中` / `已完成` / `阻塞` / `已取消`
> 优先级：P0（最高）> P1 > P2 > P3
> 最后更新：2026-11-25

---

## P0 — 阻塞主线 / 正在推进

| 任务 | 说明 | 状态 | 负责 |
|---|---|---|---|
| 确认 Dodo KYC 通过 | 账号已注册、资料已提交；通过后才能接入支付代码 | 阻塞（等平台审核） | — |
| 移动端改版方案确认 | 视觉稿 + spec 已产出，等用户确认后开始实施 | 待执行（等确认） | Trae |
| 移动端改版实施 | 按 spec 分 11 个阶段，仅动展示层 | 待执行 | Trae（主模型 DeepSeek-V4-Pro） |

## P1 — 近期必须完成

| 任务 | 说明 | 涉及文件（仅展示，不动逻辑） | 状态 |
|---|---|---|---|
| 接入 Dodo 支付代码 | 新增 dodo provider → Checkout → Webhook 验签 → 复用幂等发货 → 成功页；沙箱跑通「支付→发货→解锁→退款」再切正式 | `lib/payments/config.ts`、`lib/dodo.ts`、`app/api/dodo/**`、`app/payment/success/page.tsx` | 待执行 |
| 替换真实法务联系邮箱 | `LEGAL_CONTACT_EMAIL` 从占位符换为真实邮箱，重新部署两站 | `lib/legal-content.ts` | 待执行 |

## P2 — 上线配套

| 任务 | 说明 | 参考 | 状态 |
|---|---|---|---|
| Supabase Auth 线上域名配置 | URL Configuration 加正式域名，否则注册 redirect 报错 | `LAUNCH_CHECKLIST.md` | 待执行 |
| Resend SMTP 配置 | 否则验证邮件发不出或被限流 | `EMAIL_SETUP.md` | 待执行 |
| 自有域名 + Cloudflare | 解决内地访问 + 品牌 | `LAUNCH_CHECKLIST.md` | 待执行 |

## P3 — 移动端改版实施拆解（来自 spec 第 10 节，确认方案后启动）

> 约束：每阶段都要 `npm run typecheck` + `npm test` + 7 档宽度（360/375/390/430/768/1024/1440）视觉检查；不得触碰受保护文件。

| # | 阶段 | 状态 |
|---|---|---|
| 1 | 设计令牌基座：`tailwind.config.ts` + `globals.css :root` + `next/font`（Cormorant Garamond + Noto Serif SC） | 待执行 |
| 2 | 导航：`DesktopNav` + `MobileTabBar` + `MobileSheet`，接入 `OrientalNav`/`MainFrame` | 待执行 |
| 3 | 首页 移动 + 桌面 | 待执行 |
| 4 | 排盘表单 移动 + 桌面（含 `CityPicker` 适配） | 待执行 |
| 5 | 报告：封面 + 阅读壳 + 目录 + 章节排版 | 待执行 |
| 6 | 十二宫：`PalaceCards`（移动）+ `PalaceWheel`（桌面） | 待执行 |
| 7 | 大限：`DaXianTimeline`（移动纵向 / 桌面横向） | 待执行 |
| 8 | 支付：价格卡片 + 成功页 | 待执行 |
| 9 | 账户 + 认证 + 法务 + 错误页 | 待执行 |
| 10 | 空态 / 骨架屏（`EmptyState` / `Skeleton`） | 待执行 |
| 11 | 全量回归：7 宽度 × 6 语言 × `prefers-reduced-motion` × 对比度 × 构建/类型/测试 | 待执行 |

---

## 已完成（归档，供追溯）

| 任务 | 完成时间 | 备注 |
|---|---|---|
| 网站核心功能开发（排盘/解读/账户/订单） | 2026-11-19 前 | README |
| Stripe 全链路测试 | 2026-11-19 前 | 代码保留备用 |
| PayPal 代码完成 | 2026-11-19 前 | 非主线 |
| 报告 V2.0 视觉结构迭代 | 近期 | `git log` |
| 移动端改版高保真视觉稿 + spec | 2026-11-25 | 待确认 |
| 建立 AI 协作资料目录（本文件所在目录） | 2026-11-25 | 6 个文档 |
