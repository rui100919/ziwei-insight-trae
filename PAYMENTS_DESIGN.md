# 全球收款落地方案（Stripe）

> 面向全球用户的付费完整报告收款设计。**当前状态（2026-11-17）：代码侧已全部接入**，只差在 Stripe 后台拿密钥/价格 ID 并填入环境变量即可启用。
>
> 已完成：数据库迁移 `migrations/001_payments.sql`（已在 Supabase 执行验证）；`stripe` SDK v23 已安装；`/api/checkout`、`/api/stripe/webhook`、`/api/payment/status`、`/api/payment/entitlement` 已实现；`/api/reading/full` 已接入真实权益校验（样品请求用 `sample:true` 跳过校验）；支付成功页 `/payment/success` 已加；前端购买卡片与账户页订单展示已完成。类型检查与浏览器渲染均通过。
>
> 待用户操作：按第 4 节在 Stripe 注册、建产品/价格、配 Webhook，把三个环境变量填进 `.env.local` 和部署平台。未配置时购买入口显示"支付通道正在开通中"，不影响其他功能。
>
> 注意：本项目用的 Stripe SDK 是 v23，`checkout.sessions.create/retrieve` 返回 `Response<Session>`（Session 本身附 `lastResponse`）。`automatic_tax` 需 Stripe 账号启用 Stripe Tax，否则创建会话会报错——初期可在 checkout 里临时关掉。
>
> 版本：2026-11-17 · 适用项目：ziwei-insight（Next.js App Router + Supabase）

---

## 0. 设计原则

1. **服务端定价**：金额与币种只存在于服务端（Stripe Price 对象），前端只传产品 ID，绝不信任客户端传来的金额。
2. **支付成功以 Webhook 为准**：用户跳回成功页不代表付款成功；只有 Stripe 签名验证通过的 `checkout.session.completed` 事件才发货。
3. **幂等**：Webhook 可能重复投递，`orders` 的 `(payment_provider, provider_order_id)` 唯一索引 + 状态机保证只发一次。
4. **退款可追**：订单状态支持 `refunded`，退款事件回收权益、但报告可保留（会计记录不可删）。
5. **全球适配**：Stripe Checkout 按客户所在地自动展示本地支付方式、本地币种、自动计税、自动处理 SCA。

---

## 1. 渠道与币种决策

### 1.1 主通道：Stripe Checkout

一张集成覆盖全球主要支付方式（无需为每个国家单独接通道）：

| 类别 | 覆盖 |
|---|---|
| 银行卡 | Visa / Mastercard / Amex 等，全球 |
| 数字钱包 | Apple Pay、Google Pay（除印度外全球） |
| 中国用户 | 支付宝、微信支付（面向中国消费者/海外华人/旅客，多币种） |
| 欧洲本地 | iDEAL（荷兰）、Bancontact（比利时）、P24/BLIK（波兰）、SEPA 转账 |
| 其他地区 | Pix（巴西）、Konbini（日本）、OXXO/Boleto（墨西哥/巴西）、FPX（马来西亚）等 |

> 说明：Stripe 的支付宝/微信支付面向的是"海外消费者购买境外商户"的场景。若目标用户在中国大陆且商户主体也在大陆，需另接国内持牌通道（微信支付/支付宝国内商户），这不在本方案范围。

### 1.2 补充通道（可选，第二阶段）

- **PayPal**：欧美用户认知度高，可加一个 PayPal 按钮，但会增加对账复杂度，建议先只上 Stripe。

### 1.3 定价与币种

- 以 **USD 为基准定价**（`orders.currency` 当前默认就是 `USD`）。
- 用 Stripe Checkout 的 `localized` / 多币种 Price 展示本币价格，提升转化；**结算币种固定为基准币种**，避免汇率损失。
- 建议定价：完整报告一次性买断（如 $9.9），不做订阅（与当前产品形态一致）。

---

## 2. 数据库变更

在现有 `schema.sql` 基础上做以下增量修改。建议新建迁移文件 `migrations/001_payments.sql`，不要直接改已执行过的 `schema.sql`。

### 2.1 扩展 `user_entitlements.benefit_code`

当前约束只允许 `free_basic_reading`，付费权益进不来：

```sql
-- 放开 benefit_code 取值
alter table public.user_entitlements
  drop constraint if exists user_entitlements_benefit_code_check;
alter table public.user_entitlements
  add constraint user_entitlements_benefit_code_check
  check (benefit_code in ('free_basic_reading', 'full_report'));

comment on column public.user_entitlements.benefit_code is
  'free_basic_reading=终身一次免费基础解盘; full_report=已购完整报告权益（可多次，用 orders 关联）';
```

> 注意：`user_entitlements_once_uniq` 是 `(user_id, benefit_code)` 唯一约束，意味着一个用户只能有一条 `full_report` 记录。若将来支持"按次购买多份"，需要改为按 `order_id` 授权的独立表（见 2.3 备选方案）。第一版按"买一次永久解锁完整报告"设计即可。

### 2.2 扩展 `orders` 字段

```sql
alter table public.orders
  add column if not exists price_id         text,
  add column if not exists checkout_session_id text,
  add column if not exists paid_at          timestamptz,
  add column if not exists refunded_at      timestamptz,
  add column if not exists currency_display text,   -- 用户看到的本币
  add column if not exists amount_tax       numeric(12,2) default 0;

create unique index if not exists orders_checkout_session_uidx
  on public.orders (checkout_session_id)
  where checkout_session_id is not null;
```

现有字段已够用：`amount`、`currency`、`payment_provider`、`provider_order_id`、`status('pending'|'paid'|'refunded')`、`report_id`、`user_id`（SET NULL 保留会计记录）。

### 2.3 备选：按次购买模型（如将来需要）

若产品改为"每份报告单独付费"，新建独立授权表，不动 `user_entitlements`：

```sql
create table if not exists public.report_purchases (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  order_id    uuid not null references public.orders (id),
  report_id   uuid references public.reports (id) on delete set null,
  consumed    boolean not null default false,
  created_at  timestamptz not null default now()
);
```

### 2.4 RLS

`orders` 当前已有 `orders_select_own` 策略（本人只读，匿名/删除用户不可见），保持不变。**写入只能通过 service_role（服务端）**，不要给 authenticated 任何 insert/update 权限。

---

## 3. 环境变量

在 `.env.example` 增加（真实值只放服务端，严禁 `NEXT_PUBLIC_` 前缀）：

```bash
# Stripe（服务端专用）
STRIPE_SECRET_KEY=sk_test_xxx              # 测试用 sk_test，上线换 sk_live
STRIPE_WEBHOOK_SECRET=whsec_xxx            # Webhook 签名密钥，从 Stripe CLI / Dashboard 获取

# 价格 ID（在 Stripe Dashboard 创建 Product/Price 后填入）
STRIPE_PRICE_FULL_REPORT=price_xxx

# 站点地址（已有，支付回跳用）
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

依赖：`npm install stripe`（服务端 SDK）。

---

## 4. Stripe 控制台配置步骤

1. **注册 Stripe 账号**，完成商户信息验证（个人/企业、银行账户）。测试阶段用 Test mode，无需真实资质即可拿测试密钥。
2. **创建产品与价格**：Products → Add product「完整命理报告」→ 一次性价格（One-time）USD 9.9 → 复制 `price_xxx` 填入 `STRIPE_PRICE_FULL_REPORT`。
3. **开启支付方式**：Settings → Payment methods，启用 Cards、Apple Pay、Google Pay、支付宝、微信支付及目标市场本地方式（多数默认开启，按需打开）。
4. **配置 Stripe Tax**（见第 7 节）：Settings → Tax，先只做计算，注册信息按税务顾问意见逐步补齐。
5. **创建 Webhook**：Developers → Webhooks → Add endpoint
   - URL：`https://YOUR_DOMAIN/api/stripe/webhook`
   - 监听事件：`checkout.session.completed`、`checkout.session.expired`、`charge.refunded`
   - 复制签名密钥 `whsec_xxx` 填入 `STRIPE_WEBHOOK_SECRET`。
6. **本地调试**：用 Stripe CLI 转发事件
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   #  outputs whsec_xxx → 填入 .env.local
   stripe trigger checkout.session.completed   # 造测试事件
   ```

---

## 5. API 设计

新增三个文件：

### 5.1 `app/api/checkout/route.ts` — 创建支付会话

```
POST /api/checkout
Auth: 需要登录
Body: { productId: 'full_report' }   // 只传产品 ID
```

流程：
1. 取当前登录用户（Supabase auth）。
2. 在 `orders` 插入一条 `status='pending'` 记录，拿到本地 `order.id`。
3. 调 `stripe.checkout.sessions.create`：
   - `line_items: [{ price: STRIPE_PRICE_FULL_REPORT, quantity: 1 }]`
   - `mode: 'payment'`
   - `client_reference_id: order.id`（关键：Webhook 靠它找回订单）
   - `customer_email: user.email`
   - `success_url: ${SITE_URL}/account?paid=1`
   - `cancel_url: ${SITE_URL}/full-preview?canceled=1`
   - `automatic_tax: { enabled: true }`（第 7 节）
4. 把 `session.id` 写回 `orders.checkout_session_id`。
5. 返回 `{ url: session.url }`，前端 `window.location = url` 跳转 Stripe。

**安全**：价格从环境变量读，不接收前端金额。

### 5.2 `app/api/stripe/webhook/route.ts` — 发货回调

```
POST /api/stripe/webhook
```

流程：
1. 读原始 body（`await request.text()`，**不要先 parse**），用 `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)` 验签，失败返回 400。
2. `checkout.session.completed`：
   - `session.payment_status === 'paid'` 才发货。
   - 用 `client_reference_id` 找 `orders`；校验 `status='pending'` 且 `amount` 与 `session.amount_total` 一致（防金额错配）。
   - 事务内：更新 `orders.status='paid', paid_at=now(), provider_order_id=session.payment_intent`；在 `user_entitlements` upsert `full_report` 权益。
   - 已是 `paid` 直接返回 200（幂等）。
3. `charge.refunded`：更新 `orders.status='refunded', refunded_at`；回收 `full_report` 权益。
4. 始终返回 200 给 Stripe（除非验签失败），避免 Stripe 无限重试。

> Supabase 没有跨请求事务，用一个 `SECURITY DEFINER` 的 Postgres 函数封装"更新订单 + 发权益"两步，保证原子性，参考现有 `complete_generation` 函数写法。

### 5.3 修改 `app/api/reading/full/route.ts` — 校验权益

把当前的 402 占位替换为：

```ts
if (!isDemoMode()) {
  // 1. 取登录用户
  // 2. 查 user_entitlements where user_id=me and benefit_code='full_report' and status='available'
  //    或查 report_purchases consumed=false（按次模型）
  // 3. 无权益 → return 402 { error: 'PAYMENT_REQUIRED' }
  //    有权益 → 继续生成
}
```

生成成功后：按次模型需把对应购买记录标记 `consumed=true` 并关联 `report_id`；永久解锁模型则权益保持不变。

### 5.4 前端改动

- `app/full-preview/page.tsx`：演示模式保持现状；正式模式在"生成完整报告"按钮旁增加"购买解锁"按钮，调 `/api/checkout`。
- `app/account/page.tsx`：增加订单/权益状态展示（已有报告列表可复用）。

---

## 6. 幂等与并发（重点）

| 风险 | 防护 |
|---|---|
| Webhook 重复投递 | `orders.status` 状态机 + `provider_order_id` 唯一索引，重复事件直接 200 跳过 |
| 用户狂点购买 | `/api/checkout` 先查是否已有该用户的 `pending` 订单，有则复用其 session 或拒绝 |
| 金额错配 | Webhook 校验 `session.amount_total` 与本地 `orders.amount` 一致 |
| 回调晚于跳转 | 成功页不直接发货，靠 Webhook；前端可轮询订单状态展示"处理中" |
| 退款后继续用 | `charge.refunded` 回收权益；已生成报告保留但新增生成被拦 |

---

## 7. 税务与合规清单

> 以下是工程实现参考，不构成法律/税务意见。上线前请咨询当地会计或税务顾问。

**Stripe Tax（自动计算/代收）**
- 数字服务属于"electronically supplied services"，在 Stripe 里给产品设置正确的 tax code。
- 开启 `automatic_tax: { enabled: true }`，Stripe 按客户所在地计算 VAT/GST/销售税。
- 覆盖：欧盟 OSS（一次注册覆盖 27 国）、英国 VAT、美国各州、加拿大 GST/HST/PST、澳洲 GST、印度 GST 等 100+ 国家。
- **关键**：Stripe Tax 只算税、代收、出报表，**不替你申报**。申报需自己或委托申报服务（如 Numeral、Anrok、当地会计）。
- 定价策略：欧盟用户习惯含税价（tax-inclusive），美国习惯不含税价（tax-exclusive），Checkout 可配置。

**SCA / PSD2**
- 欧洲支付强制强客户认证，Stripe Checkout 自动触发 3DS，无需自己接。

**PCI DSS**
- 用 Stripe 托管收银台，卡数据不进自己服务器，只需填最简单的 SAQ A 自查表。

**隐私与账目**
- `orders.user_id` 已是 `ON DELETE SET NULL`：用户删号后订单仍保留为匿名会计记录（账户删除页文案已说明）。
- 保留 Webhook 原始事件日志至少用于争议处理。

---

## 8. 测试清单

| 场景 | 验证点 |
|---|---|
| 测试卡支付成功 | 订单 pending→paid，权益生成，Webhook 签名通过 |
| 重复发送 completed 事件 | 不重复发权益，返回 200 |
| 金额不一致的事件 | 拒绝发货，记录告警 |
| 退款 | 订单 refunded，权益回收 |
| 未登录调 /api/checkout | 401 |
| 无权益调 /api/reading/full | 402 |
| 有权益调 /api/reading/full | 正常生成报告 |
| 取消支付 | 订单超时/过期处理（checkout.session.expired） |
| 各支付方式 | 用 Stripe 测试卡号逐个验证支付宝/微信/iDEAL 等（各自有测试号） |

---

## 9. 上线前检查

- [ ] Stripe 账号从 Test mode 切到 Live mode，密钥全部替换
- [ ] Webhook endpoint 指向生产域名，签名密钥更新
- [ ] `STRIPE_PRICE_FULL_REPORT` 换成生产价格 ID
- [ ] Stripe Tax 注册信息按税务顾问意见补齐
- [ ] 隐私政策/服务条款页面上线（Stripe 审核与合规需要）
- [ ] 退款政策明确并展示
- [ ] 用真实小额支付跑一遍端到端

---

## 10. 工作量拆分（建议顺序）

1. **数据库迁移**：扩展 benefit_code、orders 字段（2.1–2.2）
2. **安装 stripe SDK + 环境变量**（第 3 节）
3. **`/api/checkout` 创建会话**（5.1）
4. **`/api/stripe/webhook` 发货 + 幂等**（5.2，最关键）
5. **`/api/reading/full` 权益校验**（5.3）
6. **前端购买按钮 + 订单展示**（5.4）
7. **Stripe 控制台配置 + CLI 本地联调**（第 4 节）
8. **测试清单逐项验证**（第 8 节）
9. **税务合规 + 上线检查**（第 7、9 节）
