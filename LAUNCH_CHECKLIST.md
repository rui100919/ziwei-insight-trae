# 上线前检查清单（Launch checklist）

> 紫微光年 · Zi Wei Insight 独立站正式上线前的逐项确认清单。
> 用法：每完成一项，把 `[ ]` 改成 `[x]`。标 ✅ 的是代码里已经做好、只需确认的项；标 ⬜ 的是需要你去平台操作或提供信息的项。

---

## 0. 当前进度速览

| 模块 | 状态 | 说明 |
|---|---|---|
| 网站功能（排盘 / 双语 / 档案 / 报告 / 付费样品） | ✅ 已完成 | 演示模式全流程已验证 |
| 视觉设计（杂志风） | ✅ 已完成 | 六套页面截图确认 |
| MIT 合规增强（格局 / 夏令时 / 署名） | ✅ 已完成 | 未使用非商用语料 |
| 隐私政策 / 服务条款 / 免责声明页面 | ✅ 已完成 | `/legal`，页脚与注册页已挂链接 |
| 防滥用限流 | ✅ 已完成 | 两个生成接口按 IP 限流 |
| 收款链路（代码） | ✅ 已完成 | checkout/webhook/权益校验/成功页/前端购买已接入，类型检查+渲染通过；见 `PAYMENTS_DESIGN.md` |
| 收款链路（测试模式） | ✅ 已验证跑通 | 真实测试卡支付→发货→解锁→付费生成→退款回收全部通过；产品/价格/Link 已配置；见 `STRIPE_SETUP.md` |
| 收款通道选型 | ✅ 已定 PayPal | 用户无香港主体，必须换掉 Stripe；结论见 `PAYMENT_PROVIDER_DECISION.md` |
| 收款链路（PayPal 代码） | ✅ 已完成 | 支付层抽象 + PayPal 下单/捕获/状态 + 智能按钮 + 成功页；类型检查与渲染通过 |
| 收款链路（正式模式） | ⬜ 待你操作 | PayPal 拿 Client ID/Secret、填环境变量、企业认证、真实小额支付；见 `PAYPAL_SETUP.md` |
| 真实密钥与数据库 | ✅ 已完成 | Supabase 项目/建表/直连已就绪；DeepSeek 密钥已写入并验证可用（2026-11-17）；仅剩 SMTP 与 Stripe |
| 线上部署（审核用） | ✅ 已完成 | Vercel 项目 `ziwei-insight`，正式地址 **https://ziwei-insight.vercel.app**（2026-11-18 部署，构建状态 Ready） |
| 内地网络可访问性 | ⚠️ 已知限制 | `*.vercel.app` 在内地网络被墙：海外用户正常，国内（含连连审核）需翻墙或看 `screenshots/` 截图；解决靠自有域名+Cloudflare 或国内镜像 |
| Supabase 回跳白名单 | ⬜ 待你操作 | 控制台 Auth → URL Configuration 加线上域名，否则线上注册会因 redirect 不在白名单而失败 |
| 域名解析与 HTTPS | ⬜ 待操作 | 见第 6 节（自有域名，解决内地访问 + 品牌） |
| 全链路真实验证 | ⬜ 待执行 | 见第 8 节 |

---

## 1. 注册账号与拿密钥（约 30 分钟）

- ⬜ **Supabase**：到 supabase.com 注册，新建一个 Project（区域建议选离目标用户近的，如新加坡 / 美国东部），记下 Project URL。
- ⬜ 在 Project Settings → API 里复制两个 anon key：**`NEXT_PUBLIC_SUPABASE_URL`**、**`NEXT_PUBLIC_SUPABASE_ANON_KEY`**（可公开）。
- ⬜ 同页面复制 **`SUPABASE_SERVICE_ROLE_KEY`**（保密，仅服务端）。
- ⬜ **DeepSeek**：到 platform.deepseek.com 注册，充值（$10 起够用很久），创建 API Key → **`DEEPSEEK_API_KEY`**。
- ⬜ **Stripe**：到 stripe.com 注册，先切到 Test mode，拿到 Publishable / Secret key（收款接入时用）。
- ⬜ **Resend**（可选，用于发验证邮件）：resend.com 注册，免费档 3000 封/月。

## 2. 初始化数据库（约 10 分钟）

- ⬜ 打开 Supabase 控制台 → SQL Editor → 粘贴执行项目根目录的 **`schema.sql`** 全部内容。
- ⬜ 确认 7 张表创建成功：`profiles`、`birth_profiles`、`charts`、`user_entitlements`、`reports`、`generation_jobs`、`orders`。
- ⬜ 确认 RLS 策略已启用（脚本里已包含，检查表是否显示 "RLS enabled"）。

## 2.5 免费额度的发放规则（重要 · 已按需求实现）

> 需求：**注册只需邮箱或电话二选一；完成验证后才发放一次免费简易推演；体验要顺。**

- ✅ 注册页邮箱 / 电话两个 Tab，**二选一即可**，都是一条完整流程。
- ✅ `schema.sql` 已改为「**邮箱已验证 或 电话已验证**」任一成立即发放 `free_basic_reading`：
  - 邮箱：点击验证链接 → `/auth/callback` 换 session → 触发器发放 → 跳排盘页；
  - 电话：短信验证码验证成功 → `phone_confirmed_at` 写入 → 触发器发放。
- ✅ 触发器监听 `email_confirmed_at` 和 `phone_confirmed_at` 两个字段，任一验证都会补发额度。
- ✅ 未验证就点生成：接口返回 `NEED_VERIFY`，前端显示友好提示 + 「去验证」按钮，不显示英文错误码。
- ✅ 演示模式：注册即发额度（因为演示环境发不了真邮件/短信），这是刻意为之，正式模式才强制验证。

- ⬜ **上线验证**：分别用邮箱注册（未验证时点生成应被友好拦截 → 点验证链接后能生成）和电话注册（验证码通过后能生成）各走一遍。

---

## 3. 配置认证（约 20 分钟）

- ⬜ Supabase → Authentication → Providers → Email：开启，建议打开 **Confirm email**。
- ⬜ Supabase → Authentication → URL Configuration：把 Site URL 设为你的正式域名，Redirect URLs 加上 `https://你的域名/**`。
- ⬜ 配置 SMTP（用 Resend）：Authentication → Email → Custom SMTP，填 Resend 的 SMTP 主机与 API Key，否则验证邮件可能进垃圾箱或发送受限。详见 `EMAIL_SETUP.md`（含精确参数与本地回调地址）。
- ✅ 手机号登录：**已决定初期关闭**，入口在代码中收起（开关 `PHONE_AUTH_ENABLED`）。日后要开需绑定 Twilio 并充值。
- ⬜ 在 Authentication → Rate Limit 里打开capcha或降低发送频率（可选，进一步防刷）。

## 4. 填写环境变量

在项目根目录 `.env.local`（本地）与部署平台的环境变量里填：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # 保密，绝不进 NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=https://你的域名
DEEPSEEK_API_KEY=sk-...
# 可选
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

- ⬜ **关键确认**：只要上面 Supabase 两个变量填了，演示模式就会自动关闭。填完访问网站，顶部"演示模式"黄条应消失。
- ✅ `SERVICE_ROLE_KEY` 只在服务端使用（代码已隔离）；确认 `.env.local` 已被 `.gitignore` 排除，不会提交到 Git。

## 5. 接入收款（按 PAYMENTS_DESIGN.md）

- ⬜ 执行文档里的数据库变更 SQL（放开 `benefit_code` 约束、给 `orders` 加字段）。
- ⬜ 在 Stripe 控制台建 Product + Price（如 $9.9/份完整报告），记下 Price ID。
- ⬜ 实现 `/api/checkout` 创建结账会话、`/api/stripe/webhook` 验签发货。
- ⬜ 把 `/api/reading/full` 的 402 占位改成真实权益校验。
- ⬜ 配好 Webhook 端点并本地用 Stripe CLI 联调一次。
- ⬜ 决定是否开启 Stripe Tax（自动算税/代收，但申报仍需你或会计处理）。

## 6. 域名与部署（约 30 分钟）

- ⬜ 在 Cloudflare / Porkbun 买 `.com` 域名（约 $9–11/年，WHOIS 隐私免费）。
- ⬜ 代码推送到 GitHub（确认 `.env.local`、`node_modules` 未被提交）。
- ⬜ Vercel 导入仓库，填好第 4 节的环境变量，升级到 **Pro**（商用必需，$20/月）。
- ⬜ 在 Vercel → Settings → Domains 绑定域名，DNS 按提示解析，等待 HTTPS 证书自动签发。

## 7. 上线前安全与消费上限

- ⬜ ✅ 防滥用限流已接入（基础报告 10 次/分·IP，完整报告 6 次/分·IP）。
- ⬜ 在 DeepSeek 控制台开启余额告警 / 设置消费上限，防止被刷爆。
- ⬜ Supabase Pro 默认开启 spend cap，确认未被关闭。
- ⬜ Vercel Pro 设置 spend limit 与账单告警。
- ✅ 隐私政策、服务条款、免责声明、18+ 提示已上线（`/legal`，页脚与注册页入口）。

## 8. 真实全链路验证（必须做一遍）

- ⬜ 用真实邮箱注册 → 收到验证邮件 → 点击验证 → 登录成功。
- ⬜ 填出生资料 → 生成免费报告 → 报告出现在账户页。
- ⬜ 再生成一次 → 应提示"免费次数已用完"（额度状态机生效）。
- ⬜ 删除一份报告 → 删除成功且不恢复额度。
- ⬜ 删除账户 → 数据被清除（GDPR 删除权）。
- ⬜ 走一遍 Stripe Test 支付 → Webhook 到账 → 完整报告可生成。
- ⬜ 切换中英文 → 各页面文案正确。
- ⬜ 手机端打开 → 排版正常。

## 9. 上线后

- ⬜ 把 Stripe 从 Test mode 切到 Live mode，换上 Live keys，重建 Webhook。
- ⬜ 提交站点到 Google Search Console，开始 SEO。
- ⬜ 确认每月账单（Vercel $20 + Supabase $25 + 域名摊销 + AI 用量）。

---

## 需要你提供的信息（填好后我可以继续接收款与正式模式）

| 信息 | 用途 | 状态 |
|---|---|---|
| Supabase URL + anon key + service role key | 数据库与登录 | ⬜ 待提供 |
| DeepSeek API key | AI 解读 | ✅ 已配置并验证 |
| Stripe 密钥（先 Test mode） | 收款 | ⬜ 待提供 |
| 正式域名 | 部署绑定 | ⬜ 待提供 |
| 运营主体名称 + 隐私联系邮箱 | 替换 `/legal` 里的占位符 | ⬜ 待提供 |

> 注：密钥属于敏感信息。若要发给我，请确认你接受在对话中提供；更稳妥的做法是你自己填入部署平台的环境变量，我只负责代码接入。
