# PROJECT_OVERVIEW · 紫微光年 Zi Wei Insight

> 本文件是 AI 协作系统的项目总览。所有内容基于仓库现有资料（README、package.json、spec）如实填写，不做推测。
> 最后更新：2026-11-25

---

## 一、项目目标

面向全球用户的**传统文化性格分析 / 自我探索工具**（独立站）。

用户流程：输入出生信息 → 生成紫微斗数命盘 → 获得白话解读报告。

**核心定位（合规红线，不可偏离）**：
- 这是「文化娱乐 / 自我认知 / 自我探索」工具，**不是算命**。
- 全站严禁「预测未来、断吉凶、算命、占卜、改运」等确定性表述；现有文案中相关词均为**否定句**（"不预测、不判断吉凶"），必须保持。
- 英文口径关键词：`personality analysis`、`self-reflection`、`for entertainment`、`no predictions`、`does not constitute advice`。

## 二、产品定位

- **品牌方向**：Mystical Cosmic Luxury（神秘宇宙奢华）。目标用户为欧美年轻 Astrology / Spirituality / Self-discovery 人群，同时支持中文。
- **情绪价值**：克制、准确、被理解；不靠夸张预言制造焦虑。
- **差异化**：排盘由开源引擎精确计算，解读只基于命盘事实，不夸大、不预言。

## 三、业务模式

Freemium：

- 注册即赠送**一次免费基础解读**（数据库触发器控制免费额度）。
- 付费 **$9.99** 解锁完整报告（`lib/dodo.ts` 的 `FULL_REPORT_AMOUNT = 9.99`；历史 9.90 旧订单仍兼容）。
- 收款主线：**Dodo Payments（Merchant of Record）**——平台作为法定销售方、代缴全球税，免收单资质、免海外主体。
- 备用通道：PayPal（代码已就绪）、Stripe（全链路测试通过，代码保留）。通过环境变量 `PAYMENT_PROVIDER` 切换（`lib/payments/config.ts`，默认 `dodo`）。

## 四、技术架构（实际版本，来自 package.json）

| 层 | 选型 | 版本 |
|---|---|---|
| 框架 | Next.js（App Router）+ React + TypeScript | next 16.4.3 / react 19.2.5 / typescript 5.7.0 |
| 样式 | Tailwind CSS | 3.4.17（无 UI 库，样式主要在 `app/globals.css`，4163 行） |
| 数据库 / 登录 | Supabase（Postgres + Auth，邮箱验证） | @supabase/ssr 0.12.7 / @supabase/supabase-js 2.119.0 |
| 排盘引擎 | `lib/ziwei/`（MIT 许可 ziwei-doushu 衍生）+ iztro + lunar-javascript | iztro 2.6.5 / lunar-javascript 1.7.8 |
| AI 白话解读 | DeepSeek API（仅改写文案；排盘与样品报告不依赖 AI） | — |
| 收款 | Dodo Payments（主）/ PayPal / Stripe（备） | dodopayments 2.63.1 / stripe 23.1.0 |
| 限流 | 自研滑动窗口（无依赖） | — |
| 工具类 | clsx、standardwebhooks、tsx | — |
| 部署 | Vercel（正式站）+ workbuddy 托管（内地可访问演示站） | — |

**多语言**：6 种 —— `zh / en / es / fr / de / ja`（`lib/i18n.ts`）。

### 关键目录

```
app/                 页面与 API 路由（App Router）
  page.tsx → _home.tsx        首页
  chart/new/page.tsx          排盘（出生信息表单）
  report/[id]/page.tsx        报告
  full-preview/page.tsx       完整报告样品 + 购买卡片
  account/page.tsx            账户中心
  payment/success/page.tsx    支付成功
  auth/*                      注册/登录/回调/忘记/重置
  api/                        reading / report / dodo / stripe / paypal / checkout / payment / account
components/          UI 组件（ChartBoard / ChartWheel / CityPicker / OrientalNav 等）
components/oriental/ 品牌化组件（OrientalNav / CoverChart / Starfield 等）
lib/
  ziwei/             排盘引擎核心（MIT，22 个文件，严禁改动计算逻辑）
  engine.ts / full-report.ts / ai.ts / chart-cache.ts / report-cache.ts
  dodo.ts / payments/config.ts / stripe.ts / paypal.ts
  supabase/          client / server / admin
  i18n.ts            6 语言文案
middleware.ts        Supabase 会话中间件
schema.sql           7 张表 + RLS + 免费额度触发器
migrations/          支付相关迁移
scripts/             建表/迁移/验证脚本
```

## 五、部署

- 正式站（Vercel，海外可访问）：`https://ziwei-insight.vercel.app`
- 演示站（workbuddy 托管，内地可访问，演示模式）：`https://ziwei-insight.app.workbuddy.host/?sharecode=23XYOORTJV`

## 六、AI 协作边界（本轮起执行）

- AI 可改：**展示层**（`app/globals.css`、`tailwind.config.ts`、页面与组件的 markup / 样式）。
- AI **不可**改：排盘计算（`lib/ziwei/**`、`lib/engine.ts` 等）、AI 分析（`lib/ai.ts`、`lib/full-report.ts`、`app/api/reading|report/**`）、认证账号（`lib/supabase/**`、`middleware.ts`、`app/auth/**`）、支付（`lib/dodo.ts`、`lib/payments/**`、`lib/stripe.ts`、`lib/paypal.ts`、所有 `app/api/*` 支付路由与 webhook）、数据库（`schema.sql`、`migrations/**`）、现有 i18n 文案值。
- 详细受保护清单见 `docs/superpowers/specs/2026-11-25-ziwei-insight-mobile-first-redesign.md` 第 8 节。
