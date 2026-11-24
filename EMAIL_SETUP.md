# 验证邮件配置指引（Resend + Supabase）

这份文档说明如何让用户「注册邮箱后收到验证邮件 → 点链接 → 验证完成 → 自动进入排盘页拿免费解读」这条链路真正跑起来。

当前策略：**初期只开放邮箱注册**。手机入口已在代码里收起（开关 `PHONE_AUTH_ENABLED = false`，位于 `app/auth/page.tsx` 顶部），日后要开短信验证时改成 `true` 即可，代码全部保留。因此本阶段**无需注册 Twilio / 买号充值**。

代码侧已经完成的部分（无需你操作）：
- 注册成功后显示「验证邮件已发送」提示，并说明验证后会自动进入排盘页。
- 提供「重新发送邮件」按钮（60 秒倒计时防刷）和「换个邮箱」。
- 手机验证码同样提供「重新发送」。
- 验证完成后由数据库触发器自动发放一次免费额度（邮箱或电话任一验证即可，符合「二选一」要求）。

需要你在**网页后台点选**的部分，按下面步骤做。这些涉及你的 Resend / Supabase 账号，我无法代操作。

---

## 为什么必须做

Supabase 自带的邮件服务只适合测试，有两个硬限制：
1. **只能发给项目团队成员的邮箱**——真实用户收不到。
2. **每小时最多 2 封**——正式使用立刻触顶。

所以必须接一个自定义 SMTP 服务。这里用 **Resend**（免费档每月 3000 封，足够起步，发信稳定、不易进垃圾箱）。

---

## 第 1 步：注册 Resend 并拿到 API Key

1. 打开 https://resend.com ，用邮箱注册（可用 GitHub 账号快捷登录）。
2. 进入控制台 → **API Keys** → **Create API Key**：
   - Name 随意，例如 `ziwei-auth`
   - Permission 选 **Sending access**
   - 生成后**立即复制保存**（形如 `re_xxxxxxxx...`，只显示一次）。
3. （正式发信给任意用户前必须做）**验证发件域名**：
   - 控制台 → **Domains** → **Add Domain**，填你自己的域名，例如 `yourdomain.com`（或子域 `auth.yourdomain.com`）。
   - Resend 会给出 3 条 DNS 记录（SPF / DKIM / DMARC），去你的域名注册商（如 Cloudflare）后台添加。
   - 等状态变为 **Verified**。
   - 注意：Resend 免费档允许发给**任意邮箱**，但发件人 `From` 必须来自已验证域名。未验证域名时只能发给你注册 Resend 的那个邮箱——可用于本地测试。

---

## 第 2 步：在 Supabase 后台填 SMTP

1. 打开你的项目：https://supabase.com/dashboard/project/gnnygeuhgrdycuduqrut
2. 左侧 **Authentication** → **Email**（Notifications 下）→ 打开 **Custom SMTP** 开关。
3. 按下面填写（来自 Resend 官方文档）：

| 字段 | 填什么 |
|---|---|
| Sender email | `no-reply@你的已验证域名`（例：`no-reply@yourdomain.com`） |
| Sender name | `紫微光年` 或 `Zi Wei Insight` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | 第 1 步拿到的 Resend API Key（`re_...`） |
| Encryption | `SSL/TLS`（port 465 对应 SSL；若用 587 则选 STARTTLS） |

4. 点 **Save**。保存后 Supabase 会有一封测试发送，确认成功即可。

---

## 第 3 步：配置邮箱验证与回调地址

仍在 **Authentication** 下：

1. **Providers → Email**：确保 **Enable** 打开，**Confirm email** 打开（这样才会发验证邮件）。
2. **URL Configuration**：
   - **Site URL**：本地测试填 `http://localhost:3000`；正式上线改成 `https://你的域名`。
   - **Redirect URLs**：点 **Add URL**，加入以下两条（本地+正式各一条）：
     - `http://localhost:3000/auth/callback`
     - `https://你的域名/auth/callback`
   - 说明：注册邮件里的链接会跳到 `/auth/callback`，代码在那里兑换登录态并自动进入排盘页。回调地址不在白名单会被拒绝。

3.（可选）**Rate Limits**：把邮箱发送频率调到合理值（默认自定义 SMTP 为每小时 30 封），配合前端 60 秒重发冷却，足以防刷。

---

## 第 4 步：验证整条链路

1. 确认本地服务在跑（`http://localhost:3000`），且 `.env.local` 里 Supabase 配置正确（已填）。
2. 打开 `http://localhost:3000/auth`，用**你自己的真实邮箱**注册（该邮箱必须能收信；若域名还没验证，就必须是注册 Resend 用的那个邮箱）。
3. 收验证邮件 → 点链接 → 应自动跳到 `/chart/new`。
4. 填出生资料 → 生成免费解读 → 应成功（说明验证状态已被识别、额度已发放）。
5. 回到 `/auth` 重新登录，确认能正常进入（验证后才可登录）。

如果邮件没到：先看垃圾箱；再看 Supabase 后台 Authentication → Logs 是否有发送记录/报错；确认 Custom SMTP 已 Save 且 Sender 域名已验证。

---

## 关于手机验证（二选一的另一条路）

用户注册「邮箱或电话二选一」都支持，代码已写好。但**手机短信验证需要额外接 SMS 服务商**（Supabase 默认绑定 Twilio，需注册 Twilio、买号码、充值，按条计费），成本和维护都高于邮箱。

**当前决定：初期只开邮箱，手机入口已收起**（见文首说明，开关在 `app/auth/page.tsx` 顶部）。等有真实需求再接 SMS，届时告诉我，我给出 Twilio 的配置步骤和成本测算即可。

---

## 安全提醒

- Resend API Key 和 Supabase Service Role Key 都是敏感信息，只填在后台/服务端，不要提交到代码仓库（`.env.local` 已被 `.gitignore` 排除）。
- 正式上线前，建议把对话中出现过的密钥在对应平台**轮换**（删除后重新生成），再用新值替换。
