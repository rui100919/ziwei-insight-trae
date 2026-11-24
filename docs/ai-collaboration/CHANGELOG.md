# CHANGELOG · 开发变更日志

> 记录每次开发的修改内容、涉及文件、测试结果和 Git 分支。最新在上。
> 本轮（建立 AI 协作资料）**未修改任何业务代码 / CSS / 配置**，仅新增文档。
> 最后更新：2026-11-25

---

## [Unreleased] · 2026-11-25 · 分支 `redesign/mobile-first`

### 建立 AI 半自动协作系统（第一阶段）
- **修改内容**：新建统一 AI 协作资料目录 `docs/ai-collaboration/`，含 6 个 Markdown 文件。
- **新增文件**：
  - `docs/ai-collaboration/PROJECT_OVERVIEW.md`
  - `docs/ai-collaboration/CURRENT_STATUS.md`
  - `docs/ai-collaboration/TASK_QUEUE.md`
  - `docs/ai-collaboration/DESIGN_DECISIONS.md`
  - `docs/ai-collaboration/REVIEW_FEEDBACK.md`
  - `docs/ai-collaboration/CHANGELOG.md`
- **涉及业务代码**：无。未改 CSS、配置、排盘、AI、账号、认证、支付。
- **测试结果**：本轮为文档创建，未触发构建/测试。
- **Git 状态**：6 个文件为新增未跟踪；工作区此前仅有 1 个未跟踪文档 `docs/superpowers/specs/2026-11-25-ziwei-insight-mobile-first-redesign.md`。

### 移动端改版方案定稿（未提交代码）
- **修改内容**：产出高保真视觉稿（14 张预览）与完整 spec，新建分支 `redesign/mobile-first`。
- **新增文件（未提交）**：`docs/superpowers/specs/2026-11-25-ziwei-insight-mobile-first-redesign.md`
- **视觉稿**：`file:///Users/guoqingfeng/Documents/Trae-CN/ziwei-cosmic-redesign.html`（工作区外，不纳入仓库）。
- **测试结果**：视觉稿已通过 7 档宽度渲染校验、无 JS 报错、无横向溢出（仅校验静态稿，非项目构建）。
- **状态**：等待用户确认方案；确认前不开始实施。

---

## 已合并到 `main` 的近期记录（来自 git log，供追溯）

> 以下为 `main` 分支已提交内容，仅摘录最近若干条；完整历史见 `git log`。

- `a3818fa` feat(report): 新增「一句话认识自己」「事业财富感情专题」「优势与挑战」三章（模板叙事，不接 AI）
- `81d1a9b` docs(spec): 记录「暂不限制生成数量」决策，待 V2.0-b 接入 AI 后复评
- `72bbdee` feat(report): 宫位与大限收尾改为轮换句式，避免十二段同句复用
- `951d1d2` feat(report): 免责声明集中化，移除每宫重复的「不是定论」
- `2f58ecc` fix(report): PDF 大限与章节标题禁止跨页拆分
- `538781c` feat(report): V2.0-a 视觉结构第一阶段
- `e6b9871` feat(report): collection-style cover, contents page and colophon for full reports
- `7f5ae14` fix(print): 隐藏站点导航、移除空白页、提升命盘与正文对比度

---

## 填写规范（后续每次开发更新此文件时遵守）

1. 一条记录包含：日期、分支、修改内容、涉及文件、测试结果（`npm run typecheck` / `npm test` / `npm run build` / 7 档宽度检查）、Git 状态。
2. 若触及受保护范围（排盘 / AI / 账号 / 认证 / 支付），必须在记录中显式标注并说明用户授权来源。
3. 未提交的工作写在 `[Unreleased]` 区块；提交/合并后移到对应区块并标注 commit。
4. 不自行合并或部署；合并与部署动作需用户明确指令。
