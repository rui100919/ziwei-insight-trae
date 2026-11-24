# MoR 收款接入方案（2026-11-19）

连连全球收单已确认「后台配置不了、现在还不支持」，正式排除。本文件记录替代方案：**Merchant of Record（MoR，记录商户）**。

## 1. 为什么 MoR 能破局

| | PSP（Stripe / PayPal / 连连 / 空中云汇） | MoR（Dodo / Creem / Paddle） |
|---|---|---|
| 法定销售方 | **我们** | **平台** |
| 谁需要收单资质 | 我们 | 平台（已具备） |
| 谁处理全球 VAT/GST、开票、PCI | 我们 | 平台 |
| 需要海外主体吗 | Stripe/空中云汇需要；连连需要产品能力 | **不需要** |
| 我们做什么 | 接收单、对账、税务 | 建产品、定价、交付，收净额结算款 |

之前全部卡在「内地主体 + 虚拟数字内容」拿不到**收单资格**；MoR 把收款主体换成平台，这个卡点直接不存在。

## 2. 平台选择

**首选：Dodo Payments**（https://dodopayments.com/zh）
- 官网明确「无需海外实体」「支持中国身份证与中国证件」「结算直接到中国银行账户（人民币/美元）」「最快 5 分钟开通」，个人注册无需企业验证，有中国区负责人（Head of China）提供中文支持。
- 费率 4% + $0.40/笔，国际卡 +1.5%；一次性付款、Webhook、API/SDK 齐备。
- 支持 220+ 国家地区、40+ 支付方式（含支付宝、微信支付）。

**备选：Creem**（3.9% + $0.40，支付宝提现，单笔 ≤ ¥50,000）、**Waffo Pancake**（3.9% + $0.50，大陆银行卡/支付宝）。
**不推荐**：Lemon Squeezy（被 Stripe 收购后收缩）、Gumroad（10% + 卡费，大陆仅 PayPal 提现）。

## 3. 品类合规：我们落在「明文允许」的一侧

**Dodo 官方《Merchant Acceptance Policy》** 把 `Spiritual & Astrology services` 列入 **Businesses We Might Support**（需加强尽调、通常可获批），条件原文：

> "Spiritual & Astrology services – **Entertainment only; no claims or predictions**"

同文档另两条明确允许：
> "E-books and written digital publications – Including guides, playbooks, **reports**, or downloadable written content."
> "Productised services – **A fixed, pre-defined digital product** that is delivered the same way for every buyer."

**Gumroad 官方禁售清单**对 fortune tellers 的注释划得更清楚：
> "It does not cover astrology, tarot, numerology, **birth-chart and divination material sold for insight, reflection or entertainment** … **chart-generation tools and pre-written reports are all allowed**."

结论：我们「固定模板的一次性数字报告 + 仅供文化参考/不预测 + 完整免责页」的形态，在 MoR 体系里**是准入条件，不是扣分点**。这与 PSP 的模糊「高风险兜底」有本质区别。

## 4. 提交审核的材料清单

| 材料 | 状态 |
|---|---|
| 可访问的网站 | ✅ https://ziwei-insight.vercel.app （海外正式站）<br>✅ https://ziwei-insight.app.workbuddy.host/?sharecode=23XYOORTJV （可交互演示站，任意邮箱可体验） |
| 清晰定价 | ✅ `$9.90` 一次性买断（`/full-preview`） |
| 退款政策 | ✅ `/legal` 已有「数字内容生成即交付，除技术故障不支持无理由退款」 |
| 隐私政策 / 服务条款 / 免责声明 | ✅ `/legal` 完整，含 GDPR、18+ 提示 |
| 交付方式说明 | ✅ 付款后即时在账户内生成报告 |
| **真实联系邮箱** | ❌ **待补**：`lib/legal-content.ts` 中 `LEGAL_CONTACT_EMAIL = 'privacy@example.com'` 是占位符，店审必查 |
| 演示账号 | ⚠️ 演示站可直接用任意邮箱注册；正式站需先配好 Resend SMTP |

审核时业务描述统一口径（中英）：
> 在线数字内容平台，提供基于传统文化的性格分析与自我认知参考报告，属于数字出版物 / 线上教育类虚拟产品。报告为固定模板、即时在线交付，仅供文化参考与娱乐，不构成任何预测、断言或专业建议。
>
> An online digital-content platform offering traditional-culture-based personality and self-reflection reports. Fixed-template digital publications delivered instantly online, for cultural insight and entertainment only; no predictions, claims, or professional advice.

**红线**：全站不得出现「预测未来 / 吉凶 / 算命 / 占卜 / 改运」等确定性表述。当前 `/legal` 中所有相关词都是否定句（"不预测、不判断吉凶"），符合要求。

## 5. 预确认信（先发，再注册）

Dodo 官方明确鼓励「unsure if your business qualifies → reach out before applying」。为避免重演连连「客户经理说可以、后台配置不了」，**务必先拿到书面确认**。收件人：`compliance@dodopayments.com`

```
Subject: Pre-application category confirmation – digital personality report (entertainment)

Hi Dodo Compliance Team,

Before applying, I would like to confirm whether our product fits your
Merchant Acceptance Policy.

What we sell: a one-off, fixed-template digital report (USD 9.90) based on
traditional Chinese character-analysis (Zi Wei / birth-chart) framework.
The report is generated automatically and delivered instantly in the user's
account. It is positioned strictly as cultural insight, self-reflection and
entertainment. We make NO predictions, NO claims about future events, and
NO medical / legal / financial advice. No human consultation is involved.

Your policy lists "Spiritual & Astrology services – Entertainment only; no
claims or predictions" under Businesses We Might Support, and explicitly
allows written digital publications / reports and fixed pre-defined digital
products. Our product appears to fall within all three.

Website:  https://ziwei-insight.vercel.app
Sample:   https://ziwei-insight.vercel.app/full-preview
Legal:    https://ziwei-insight.vercel.app/legal
Demo:     https://ziwei-insight.app.workbuddy.host/?sharecode=23XYOORTJV

Could you confirm:
1. Is this category acceptable under your policy?
2. Can a mainland-China individual / company register and receive payouts
   to a Chinese bank account?
3. What additional documents do you need (disclaimers, demo access, etc.)?

Thank you.
```

## 6. 拿到确认后的步骤

1. 注册 Dodo：填产品信息 → 身份证 + 自拍（个人）或营业执照（公司）→ 绑定国内收款银行账户。
2. 提供 `LEGAL_CONTACT_EMAIL` 真实邮箱，我替换占位符并重新部署两个站点。
3. 我按现有 `lib/payments/config.ts` 抽象层新增 `dodo` provider：创建 Checkout → Webhook 验签 → 复用 `fulfill_checkout` 幂等发货 → 成功页。报告引擎、权益表、数据库均不动。
4. 沙箱跑通支付 → 发货 → 解锁 → 退款全链路，再切正式。

## 7. 风险

- MoR 仍需 KYC 与店审，**国家在支持名单上 ≠ 一定批准**。
- 拒付责任仍在卖家，数字商品争议费约 $15–25/笔，必须保留发货记录（现有 `orders` + `fulfill_checkout` 即是凭证）。
- 费率 4–5% 高于 Stripe 2.9%，换来免主体、免收单资质、免全球税务申报。
- 若店审因品类被拒，最后兜底：注册香港公司 → Stripe（代码已跑通）。
