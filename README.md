# 紫微光年 · Zi Wei Insight

面向全球用户的**传统文化性格分析工具**（独立站）。用户输入出生信息 → 生成紫微斗数命盘 → 得到白话解读报告。中英双语，注册送一次免费简易解读，付费 $9.90 解锁完整报告。

> **重要定位**：这是文化娱乐 / 自我认知工具，**不是算命**。全站严禁"预测未来、断吉凶、算命、占卜、改运"等确定性表述。现有文案里的相关词全部是否定句（"不预测、不判断吉凶"），务必保持。

---

## 一、技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16（App Router）+ React 19 + TypeScript |
| 样式 | Tailwind CSS 3 |
| 数据库 / 登录 | Supabase（Postgres + Auth，邮箱验证） |
| 排盘引擎 | MIT 许可的 `ziwei-doushu` 衍生代码（`lib/ziwei/`）+ `iztro` + `lunar-javascript` |
| AI 白话解读 | DeepSeek API（仅改写文案，排盘与样品报告不依赖 AI） |
| 收款 | **进行中**：主推 MoR 平台 Dodo Payments；PayPal 代码已就绪；Stripe 代码保留备用 |
| 部署 | Vercel（正式站）+ workbuddy 托管（内地可访问的演示站） |

---

## 二、快速启动

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # 类型检查（改动后必跑）
npm run build        # 生产构建
```

环境变量在 `.env.local`（已随包提供，含真实密钥，**不要提交到公开仓库**）。`.env.example` 是变量模板与说明。

数据库表结构在 `schema.sql`（7 张表 + RLS + 免费额度触发器），支付相关迁移在 `migrations/001_payments.sql`。已建好的 Supabase 项目地址见 `.env.local` 的 `NEXT_PUBLIC_SUPABASE_URL`。

---

## 三、目录结构

```
app/                       页面与 API 路由（App Router）
  page.tsx                 首页
  auth/page.tsx            注册/登录（PHONE_AUTH_ENABLED=false，初期只开邮箱）
  auth/callback/route.ts   邮箱验证回跳
  chart/new/page.tsx       新建出生档案（城市搜索带经纬度）
  report/[id]/page.tsx     免费简易解读报告
  full-preview/page.tsx    付费完整报告样品 + 购买卡片
  account/page.tsx         账户中心（档案/报告/额度/订单）
  legal/page.tsx           隐私政策/服务条款/免责声明
  api/reading/             免费解读生成（含限流）
  api/reading/full/        完整报告生成（含权益校验，sample 跳过）
  api/checkout/            Stripe 下单
  api/stripe/webhook/      Stripe 回调
  api/paypal/*             PayPal 下单/捕获/配置
  api/payment/*            权益与订单状态查询
components/                UI 组件（命盘/城市选择/支付按钮等）
lib/
  ziwei/                   排盘引擎核心（MIT，勿混入非商用语料）
  engine.ts / full-report.ts / ai.ts / demo.ts
  i18n.ts                  中英文案
  legal-content.ts         法务文案（LEGAL_CONTACT_EMAIL 仍是占位符，待换真实邮箱）
  payments/config.ts       支付抽象层：getPaymentProvider() / isPaymentsConfigured()
  stripe.ts / paypal.ts    各通道实现
  supabase/*               client / server / admin 客户端
  rate-limit.ts            无依赖滑动窗口限流
scripts/                   数据库建表/迁移、验证、截图等脚本（多为 .mjs，node 直接跑）
schema.sql / migrations/   数据库结构与迁移
public/data/cities.json    城市经纬度数据（GeoNames CC BY 4.0）
```

---

## 四、当前进度（截至 2026-11-19）

**已完成**
- 网站全部功能：排盘、真太阳时、双语、城市搜索、档案 CRUD、免费/付费报告、账户中心、订单。
- 数据库、RLS、注册送一次免费额度触发器、DeepSeek 白话解读，均已建好并验证可用。
- 法律页、限流、SEO（robots/sitemap/OG）、错误页齐全。
- Stripe 支付**全链路测试通过**（测试卡支付→发货→解锁→付费生成→退款），代码保留。
- PayPal 支付代码完成（抽象层 + 下单/捕获/按钮/成功页），类型检查与渲染通过。
- 已部署：Vercel 正式站 `https://ziwei-insight.vercel.app`（海外正常；`*.vercel.app` 在内地被墙）；内地可访问演示站 `https://ziwei-insight.app.workbuddy.host/?sharecode=23XYOORTJV`（分享码必带，演示模式任意邮箱可注册）。

**收款通道决策（重要背景）**
- Stripe / 空中云汇：需香港/海外主体，内地主体走不通 → Stripe 代码保留备用。
- 连连：客户经理书面说支持，后台实际"配置不了、不支持" → 正式排除。
- PayPal：内地主体敏感、风控不稳 → 代码就绪但非主线。
- **当前主线：Dodo Payments（Merchant of Record）**——平台当法定销售方、代缴全球税，我们免收单资质、免海外主体。详见 `MOR_SETUP.md`、`PAYMENT_PROVIDER_DECISION.md`。

**Dodo 注册进度（2026-11-19 已填完）**
- 已注册账号，主体走**个人**（身份证 + 自拍，免营业执照/对公账户）；企业名称填了真实执照名"三舍食品店"（注册必填，不影响个人 KYC）。
- 产品描述用了合规英文口径（"no predictions / entertainment and personal reflection"）；类别选"数字可下载内容"；交付勾"即时访问"；集成选"API/SDK/适配器"。
- 收款账户：China + CNY + Local 本地转账；绑本人"郭庆锋"个人银行卡。
- 待确认：KYC / Persona 验证是否通过（1–3 工作日）。

---

## 五、下一步待办（按优先级）

1. **确认 Dodo KYC 是否通过** → 通过后开始接代码。
2. **接入 Dodo 支付**：在 `lib/payments/config.ts` 新增 `dodo` provider → 创建 Checkout → Webhook 验签 → 复用 `fulfill_checkout` 幂等发货 → 成功页。报告引擎、权益表、数据库都不动。沙箱跑通「支付→发货→解锁→退款」再切正式。参考 `MOR_SETUP.md` 第 6 节。
3. **替换真实联系邮箱**：`lib/legal-content.ts` 的 `LEGAL_CONTACT_EMAIL = 'privacy@example.com'` 是占位符，店审必查，拿到真实邮箱后替换并重新部署两个站点。
4. **正式上线配套**：Supabase Auth → URL Configuration 加线上域名（否则注册 redirect 报错）；配 Resend SMTP（否则验证邮件发不出去或限流）；买自有域名 + Cloudflare（解决内地访问 + 品牌）。详见 `LAUNCH_CHECKLIST.md`、`EMAIL_SETUP.md`。

---

## 六、合规口径（红线，务必遵守）

- 定位："传统文化性格分析 / 自我认知 / 娱乐参考"，**不预测、不判断吉凶、不构成专业建议**。
- 英文描述关键词：`personality analysis`、`self-reflection`、`for entertainment`、`no predictions`、`does not constitute advice`。
- 禁用词：算命、占卜、预测未来、断吉凶、改运；fortune telling、psychic、predict（肯定句）。
- 排盘引擎是 MIT 许可代码，**不得使用倪师原话等非商用语料**；第三方署名见 `THIRD_PARTY_LICENSES.txt`。
- 全站出现"预测/吉凶"处均为否定句，这是合规加分项，勿改成肯定表述。

---

## 七、文档索引

| 文件 | 内容 |
|---|---|
| `MOR_SETUP.md` | MoR 方案、Dodo 品类合规论证、预确认信、接入步骤（**当前主线**） |
| `PAYMENT_PROVIDER_DECISION.md` | 各收款通道对比与决策演化（Stripe/PayPal/连连/空中云汇/Dodo） |
| `PAYMENTS_DESIGN.md` | 支付系统设计（订单状态机、幂等发货） |
| `STRIPE_SETUP.md` / `PAYPAL_SETUP.md` | 备用通道配置说明 |
| `LAUNCH_CHECKLIST.md` | 上线逐项清单与当前进度 |
| `EMAIL_SETUP.md` | 验证邮件（Resend SMTP）配置 |
| `THIRD_PARTY_LICENSES.txt` | 第三方许可与署名 |
