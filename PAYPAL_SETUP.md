# PayPal 收款配置指引

> 为什么换成 PayPal：当前收款主体只有中国大陆主体，Stripe / 空中云汇的独立站信用卡收单都要求香港或海外主体，PayPal 是内地主体唯一能直接开通的通道。完整分析见 `PAYMENT_PROVIDER_DECISION.md`。
> 代码已全部接好，你只需在 PayPal 后台拿两组值填进环境变量即可启用。
> 日期：2026-11-17

---

## 一、代码侧已完成（无需你操作）

- 支付通道抽象层：默认 PayPal，`PAYMENT_PROVIDER=paypal`；Stripe 代码保留，随时可切回。
- PayPal 服务端客户端：OAuth token（带缓存）、创建订单、捕获订单、查询订单。
- 三个 API：`/api/paypal/config`（下发给前端的公开配置）、`/api/paypal/create-order`、`/api/paypal/capture-order`。
- 安全：金额服务端定价、订单归属校验、金额比对、幂等发货（复用 `fulfill_checkout`）。
- 前端：完整报告页渲染 PayPal 智能按钮；支付成功页支持 PayPal 回跳；未配置时显示"支付通道正在开通中"。
- 类型检查通过；未配置时各接口返回预期状态，页面无报错。

---

## 二、需要你在 PayPal 后台操作（约 15 分钟）

### 步骤 1：注册 PayPal 账号

- **测试阶段**：到 `developer.paypal.com` 用普通 PayPal 账号登录即可，无需商户资质。
- **正式收款**：
  - 中国大陆主体：到 `paypal.cn` 注册**企业账户**（跨境收款），需营业执照、法人身份证、对公账户。
  - 个人也可收国际款，但企业账户额度更高、更稳。

### 步骤 2：创建开发者应用，拿 Client ID 和 Secret

1. 打开 `developer.paypal.com → Dashboard → My Apps & Credentials`。
2. 选择 **Sandbox**（测试）标签，点 **Create App**。
3. 应用名随意（如 `ZiWei Insight`），创建后会显示：
   - **Client ID**（公开标识）
   - **Secret**（点击 Show 查看，只显示一次）
4. 把这两个值记下来。测试时用 Sandbox 的；正式上线切到 **Live** 标签，再建一个 App 拿 Live 的 Client ID / Secret。

### 步骤 3：创建沙箱测试买家账号（用于自测）

1. `developer.paypal.com → Sandbox → Accounts`。
2. 系统会默认给一个个人买家账号（类型 Personal，带余额），记下它的邮箱和密码（可点 ... 查看）。
3. 付款时用这个账号登录 PayPal 弹窗即可，不会产生真实扣款。

### 步骤 4：填入环境变量

打开项目根目录 `.env.local`，找到收款段，填入：

```
PAYMENT_PROVIDER=paypal
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=你的_sandbox_Client_ID
PAYPAL_SECRET=你的_sandbox_Secret
```

- `PAYPAL_MODE=sandbox` = 测试（用 Sandbox 的 Client ID/Secret）
- `PAYPAL_MODE=live` = 正式（换成 Live 的凭证）

填完**重启开发服务**（`npm run dev`），购买卡片就会从"支付通道正在开通中"变成 PayPal 按钮。

---

## 三、端到端自测（用沙箱账号）

1. 登录测试账号（或注册一个新账号并验证邮箱）。
2. 打开 `/full-preview`，点 PayPal 按钮。
3. 弹窗中用**沙箱买家账号**登录并确认付款。
4. 自动跳回 `/payment/success`，显示"完整报告已解锁"。
5. 到账户页确认：订单显示"已支付"，权益显示"已解锁"。
6. 生成一次付费完整报告，确认放行。

> 测试卡付的是沙箱虚拟货币，无真实扣款。

---

## 四、正式上线清单

- [ ] PayPal 企业账户完成认证（营业执照 / 法人身份证 / 对公账户）
- [ ] 在 `developer.paypal.com` 的 **Live** 标签创建 App，拿 Live Client ID / Secret
- [ ] `.env.local`（或部署平台环境变量）改为 `PAYPAL_MODE=live` + Live 凭证
- [ ] 用真实小额支付跑一遍完整流程
- [ ] 在 PayPal 后台开启 Webhook（可选增强：`PAYMENT.SALE.COMPLETED` / `PAYMENT.SALE.REFUNDED` 指向 `/api/paypal/webhook`；当前靠下单捕获 + 状态核实已能闭环，Webhook 是双保险）

---

## 五、费用与风险提醒（务必知晓）

| 项目 | 说明 |
|---|---|
| 收款费率 | 大陆账户收国际交易约 4.4% + 固定费，另有 1.5% 国际交易附加费，综合接近 5% |
| 结汇 | 人民币结算标准费率 1%，2026-01-15 至 2026-12-31 限时优惠 0.5%（仅美元余额），另加 6% 增值税 |
| 风控 | PayPal 争议机制偏买家；数字商品交付凭证弱，易触发准备金或冻结 |
| 品类敏感 | 旗下 Braintree 明确禁 "fortune tellers"；PayPal 主站有"高欺诈风险服务"兜底条款 |

**降低风险的合规包装**（项目已做，你在 PayPal 后台填写业务描述时也照此口径）：

- 业务类型：数字内容 / 在线工具 / 教育娱乐
- 描述写："传统文化性格分析工具，供娱乐与自我认知参考，不构成预测或建议"
- 避免用"算命 / 占卜 / fortune telling / psychic / prediction"等词

---

## 六、密钥安全

- Client ID 和 Secret 只填服务端 `.env.local`（已被 `.gitignore` 排除，不会进仓库）。
- 若曾把凭证贴到对话里，正式上线前建议在 PayPal 后台重新生成一组替换。
