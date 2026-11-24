# CURRENT_STATUS · 当前开发状态

> 如实记录，不推测。事实来源：仓库 README（截至 2026-11-19 的进度）、`git log`、`docs/superpowers/specs/`。
> 最后更新：2026-11-25

---

## 一、当前分支

- **当前分支**：`redesign/mobile-first`（从 `main` 新建，尚未提交任何代码改动）。
- `main` 共 20 个提交，最近集中在报告 V2.0 视觉结构与章节叙事（见 `CHANGELOG.md`）。

## 二、工作区状态

- 工作区有 **1 个未跟踪文件**（文档，非业务代码）：
  - `docs/superpowers/specs/2026-11-25-ziwei-insight-mobile-first-redesign.md`（本轮新增的移动端改版 spec）。
- 除上述文档外，**无任何已修改的业务代码 / CSS / 配置文件**。
- 本轮建立 AI 协作资料目录会新增 6 个 `.md` 文件，不触碰业务代码。

## 三、已完成工作

（来源：README 进度 + git 历史）

- 网站核心功能全部完成并可用：排盘、真太阳时校正、6 语言、城市搜索（带经纬度）、出生档案 CRUD、免费/付费报告、账户中心、订单。
- 数据库（Supabase）：7 张表 + RLS + 注册送一次免费额度触发器，已建好并验证。
- DeepSeek 白话解读已接入并可用（仅改写文案）。
- 法律页、限流（`lib/rate-limit.ts`）、SEO（robots / sitemap / OG 图）、错误页齐全。
- 支付：
  - Stripe **全链路测试通过**（测试卡支付 → 发货 → 解锁 → 付费生成 → 退款），代码保留备用。
  - PayPal 代码完成（抽象层 + 下单/捕获/按钮/成功页），类型检查与渲染通过。
  - Dodo 作为主线，账号已注册、KYC 资料已提交（截至 README，待确认通过）。
- 报告 V2.0 视觉结构已迭代多轮（collection-style cover、目录页、版权页、章节叙事、打印优化）。
- 已部署两个站点（见 `PROJECT_OVERVIEW.md` 第五节）。

## 四、正在进行的工作

1. **移动端优先全站视觉改版（第一阶段：方案）**——已完成高保真视觉稿与 spec，尚未动代码。
   - 视觉稿：`file:///Users/guoqingfeng/Documents/Trae-CN/ziwei-cosmic-redesign.html`（14 张预览，移动/桌面各 7 张）。
   - spec：`docs/superpowers/specs/2026-11-25-ziwei-insight-mobile-first-redesign.md`。
   - 分支：`redesign/mobile-first` 已创建。
   - **等待用户确认方案后才开始实施**。
2. **Dodo 支付接入**：账号已注册，KYC 待确认；通过后再接入代码（checkout / webhook / 幂等发货）。

## 五、待解决问题

| # | 问题 | 来源 | 状态 |
|---|---|---|---|
| 1 | Dodo KYC / Persona 验证是否通过（1–3 工作日） | README | 待确认 |
| 2 | 法务联系邮箱占位符 `privacy@example.com`（`lib/legal-content.ts`）未替换为真实邮箱，店审必查 | README | 待办 |
| 3 | 上线配套未完成：Supabase Auth URL Configuration 加线上域名、Resend SMTP 配置、自有域名 + Cloudflare | README / `LAUNCH_CHECKLIST.md` / `EMAIL_SETUP.md` | 待办 |
| 4 | `globals.css` 为桌面优先（10/12 个媒体查询为 `max-width`），移动端体验弱 | spec | 改版中 |
| 5 | 移动端无底部导航 / 折叠菜单，深层页面（十二宫、大限、账号）在手机上不可达 | spec | 改版中 |
| 6 | 德语（de）长词在 360/375 宽度下可能撑破按钮与导航 | spec 风险 | 待验证 |

## 六、已知限制 / 不做的事

- 不预测、不判断吉凶、不构成专业建议（合规红线）。
- 排盘引擎为 MIT 许可代码，**不得混入倪师原话等非商用语料**。
- 本轮（建立 AI 协作资料）**不修改任何业务代码、CSS 或配置文件**，不开始网站改版实施。
