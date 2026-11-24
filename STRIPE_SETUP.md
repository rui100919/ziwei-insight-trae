# Stripe 收款启用指引

> **当前状态（2026-11-17）：测试模式已完整跑通。** 通过真实 Stripe 测试支付验证了全链路：登录 → 购买 → 收银台支付 → 发货 → 解锁 → 付费生成 → 退款回收，全部通过。
>
> 尚未做的只有「切到正式模式」：完成 Stripe 商户 KYC、换 live 密钥、配生产 Webhook、换正式域名。

---

## 已经完成的部分（无需你操作）

### 账户与产品
- Stripe 账户已识别（测试模式，`acct_1UaXBJKrp9J9HVmS`）。
- 产品已创建：`Full Report · 完整命理报告`
- 价格已创建：**US$9.90 一次性**，price ID `price_1UcgCGKrp9J9HVmSMJz5MKWu`，已写入 `.env.local`。
- **Link 支付方式已关闭**（它会强制弹注册窗，增加支付摩擦）。若想恢复：Stripe Dashboard → Settings → Payment methods → 打开 Link。

### 代码与环境
| 文件 | 作用 |
|---|---|
| `migrations/001_payments.sql` | orders 扩展字段、`full_report` 权益、发货/退款函数（已在 Supabase 执行） |
| `lib/stripe.ts` | 服务端 Stripe 客户端；`isPaymentsConfigured()` 只需密钥+价格 |
| `app/api/checkout/route.ts` | 创建支付会话，服务端定价，防狂点复用 pending 会话 |
| `app/api/stripe/webhook/route.ts` | 验签 + 发货 + 退款（正式上线用） |
| `app/api/payment/status/route.ts` | 成功页轮询 + **服务端主动核实发货**（不依赖 Webhook 也能闭环） |
| `app/api/payment/entitlement/route.ts` | 前端查询购买/解锁状态 |
| `app/api/reading/full/route.ts` | 已购校验 `full_report`；`sample:true` 样品免校验 |
| `app/payment/success/page.tsx` | 支付成功页（轮询确认后显示解锁） |
| `app/full-preview/page.tsx` / `app/account/page.tsx` | 购买卡片、权益与订单展示 |

### 已验证的测试结果
| 场景 | 结果 |
|---|---|
| 测试卡 `4242...` 支付 | ✅ 会话创建、支付成功、跳回成功页 |
| 发货 | ✅ 订单 `pending→paid`，权益 `available` |
| 成功页解锁 | ✅ 轮询后显示「完整报告已解锁」 |
| 账户页 | ✅ 显示已解锁 + 订单「已支付」 |
| 已购用户生成完整报告 | ✅ 200 放行 |
| 未购用户生成完整报告 | ✅ 402 拦截 |
| 退款 | ✅ 订单 `refunded`，权益 `revoked` |
| 幂等 | ✅ 重复事件不重复发货 |

---

## 你还需要做的（正式上线前）

### 1. 完成 Stripe 商户验证（KYC）
测试模式可以随便收款测试，但 **live 模式必须通过商户验证**：Stripe Dashboard → Settings → Business settings，提交个人身份证件/银行账户，或企业营业执照。审核通常 1–3 个工作日。

### 2. 切换到 Live 模式
1. Stripe Dashboard 右上角切到 **Live mode**。
2. Developers → API keys → 复制 **Secret key**（`sk_live_...`）。
3. Products 里为 live 模式重新创建产品和价格（live 与 test 数据隔离），拿到 `price_...`。
4. 更新部署平台环境变量：
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRICE_FULL_REPORT=price_...（live 的）
   STRIPE_WEBHOOK_SECRET=whsec_...（下一步的 live 密钥）
   STRIPE_TAX_ENABLED=false
   ```

### 3. 配置生产 Webhook（重要）
虽然代码里有「服务端主动核实」兜底，但**退款回收、异步支付方式完成通知**等都依赖 Webhook，正式上线必须配：

1. Developers → Webhooks → Add endpoint
2. URL：`https://你的域名/api/stripe/webhook`
3. 事件：`checkout.session.completed`、`checkout.session.expired`、`charge.refunded`
4. 复制 **Signing secret**（`whsec_...`）填入 `STRIPE_WEBHOOK_SECRET`

### 4. 用真实小额支付跑一遍
live 模式下用真实卡付一次最小金额，确认发货、账户显示、退款都正常。

---

## 本地/测试模式怎么自己体验

已保留一个测试账号（邮箱已验证、当前为未购买状态）：

- 账号：`ziwei.buyer.test@gmail.com`
- 密码：`Test-Buyer-2026!`

在 `http://localhost:3000/auth` 切到「登录」进入 → 打开 `/full-preview` → 点「购买解锁完整报告」→ 收银台填测试卡：

| 场景 | 卡号 |
|---|---|
| 支付成功 | `4242 4242 4242 4242` |
| 卡片被拒 | `4000 0000 0000 0002` |
| 需要 3DS | `4000 0025 0000 3155` |

有效期任意未来日期，CVC 任意三位。

自动化回归：`node scripts/verify-purchase.mjs`（需先确保测试账号为未购买状态）。

---

## 常见问题

- **点购买报 `PAYMENTS_NOT_CONFIGURED`**：`.env.local` 里缺 `STRIPE_SECRET_KEY` 或 `STRIPE_PRICE_FULL_REPORT`，或没重启服务。
- **创建会话报 `payment_method_types` 不支持**：新版 Stripe 已废弃该参数，支付方式在 Dashboard 统一管理（代码已移除该参数）。
- **付款成功但没解锁**：先看成功页是否在轮询（会显示"正在确认付款"）；服务端会主动向 Stripe 核实。若一直失败，检查 `STRIPE_SECRET_KEY` 是否匹配当前模式（test/live 混用会查不到会话）。
- **金额校验失败 `AMOUNT_MISMATCH`**：Stripe Price 必须是 US$9.90；改了价格要同步改 `lib/stripe.ts` 的 `FULL_REPORT_AMOUNT`。
- **退款后仍能用**：需要配置 Webhook 监听 `charge.refunded`；否则退款只发生在本代码的 `refund_checkout` 被调用时。

---

## 安全提醒

- Stripe 密钥只放服务端环境变量，不加 `NEXT_PUBLIC_`，不进代码仓库。
- 对话中出现过的 DeepSeek 与 Stripe 测试密钥，正式上线前建议在各自平台**轮换**（删除重建）。
