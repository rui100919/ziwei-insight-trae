# Zi Wei Insight · Mobile-First Responsive Redesign Spec

- **Date:** 2026-11-25
- **Branch:** `redesign/mobile-first`
- **Status:** Spec approved pending; implementation NOT started
- **Task classification:** COMPLEX (major refactor of the styling foundation across 8 surfaces, two layouts, 7 breakpoints; presentation layer only)
- **Primary model:** DeepSeek-V4-Pro (0.36x) — most cost-effective capable model. Qwen3.8-Max (1.50x) reserved only for highest-risk slices (initial `globals.css`/`tailwind.config.ts` rewrite and the final cross-width regression) if quality gaps appear.
- **Visual companion (high-fidelity mockups, 14 frames):** `file:///Users/guoqingfeng/Documents/Trae-CN/ziwei-cosmic-redesign.html`

---

## 1. Goals & Non-Goals

### Goals
1. Make the **mobile experience the primary, polished experience** (360–430 px), not a shrunk desktop.
2. Establish **one unified design system** (deep-space five-color palette + two typefaces + token spacing/radius/motion) shared by mobile and desktop.
3. Deliver **two layouts from one system**: mobile = bottom tab bar + single-column narrative; desktop = top nav + wheel chart + three-column reading.
4. Raise perceived **luxury / brand recognition** (Mystical Cosmic Luxury) and emotional texture at the loading → reading → paying → end-of-report moments.
5. Preserve **all functionality and business logic**: chart calculation, star data, AI analysis, authentication, account, payment, user data.

### Non-Goals (explicitly out of scope this round)
- Any change to chart calculation, star tables, lunar/solar conversion, true-solar-time, si-hua, brightness, patterns, or da-xian engine logic.
- Any change to AI analysis prompts, response parsing, caching, or report generation flow.
- Any change to authentication, account data model, or Supabase access rules.
- Any change to payment providers (Dodo / Stripe / PayPal), prices, webhooks, or entitlement logic. Price remains **$9.99** (`FULL_REPORT_AMOUNT` in `lib/dodo.ts`).
- Any new dependencies or animation libraries. Fonts loaded via `next/font` only; no runtime Tailwind class concatenation (e.g. `bg-${hex}`) — use inline `style` or fixed class variants for dynamic theme values.
- No copy changes to existing i18n strings; new keys may be added but existing values are preserved.
- No database migrations, no API route signature changes.

---

## 2. Current State (evidence-based)

### Tech stack
- Next.js 16 (App Router) + React 19 + Tailwind CSS 3.4 + TypeScript 5.7.
- No UI component library. Styling is overwhelmingly hand-written CSS in `app/globals.css`.
- **No `next/font` usage** today; web fonts are not loaded (relies on system `Songti SC` / fallback serif).
- Supabase (SSR + client + admin), IZtro / lunar-javascript engine, Dodo + Stripe + PayPal, i18n via `lib/i18n.ts` (6 langs: zh/en/es/fr/de/ja).

### Problems found
- `app/globals.css` is **4,163 lines** with **12 `@media` blocks**, of which **10 use `max-width`** → desktop-first shrink-down. Mobile never gets a true reflow, only smaller text.
- `components/oriental/OrientalNav.tsx` is **96 lines**: a single-row desktop nav with **no mobile menu, no bottom tab bar, no hamburger**. Deep links (palaces, da-xian, account) are hard to reach on a phone.
- `components/ChartBoard.tsx` renders the chart at **9–11 px** type — the core asset is unreadable on mobile.
- Report reading is **15.5 px / 2.15 line-height / 760 px measure** — too wide for comfortable handheld reading; no emotional pacing (cover → reading → payoff).
- Twelve palaces are a **12-cell grid** — no hierarchy, no exploration path.
- Loading / empty / payment states are **unstyled stacks of forms** — the two highest-anxiety moments (waiting, paying) have no design care.

### Surfaces inventoried
`app/page.tsx` → `app/_home.tsx` (hero/creed/palaces/reading-sample/steps/final); `app/chart/new/page.tsx` (birth form); `app/report/[id]/page.tsx` (cover / meta-panel / prenote / chart / report + toc + chapters); `app/full-preview/page.tsx` (sample report + unlock/payment section); `app/account/page.tsx` (cards: profile / charts / settings / language / danger); `app/payment/success/page.tsx`; `app/auth/*`; `app/legal/page.tsx`; `app/not-found.tsx`, `app/error.tsx`.

---

## 3. Unified Design System (tokens — one system, both layouts)

### 3.1 Color — deep-space five
| Token | Hex | Use |
|---|---|---|
| `--midnight` | `#05081A` | base background (dark surfaces) |
| `--midnight-2` | `#080D24` | elevated dark surface |
| `--indigo` (cosmic indigo) | `#121A3C` | secondary surface / cards on dark |
| `--indigo-2` | `#1B2552` | hover / active on dark |
| `--nebula` (nebula purple) | `#2E2456` | accent surface / glow |
| `--nebula-lit` | `#6A57B3` | interactive accent, glows |
| `--champagne` (champagne gold) | `#C9A96A` | primary brand accent, links, numbers |
| `--champagne-lit` | `#EBD6A8` | highlight / focus |
| `--champagne-deep` | `#8C7145` | muted gold |
| `--ivory` (soft ivory) | `#F5EFE3` | reading paper background |
| `--ivory-2` | `#ECE4D3` | paper elevation |
| `--ivory-3` | `#FBF7EE` | paper highlight |

Semantic aliases: `--text`, `--muted`, `--faint`, `--line`, `--line-strong`, `--line-gold` on dark; `--paper`, `--ink-text`, `--ink-muted`, `--ink-soft`, `--ink-faint`, `--ink-line` on ivory reading surfaces.

### 3.2 Typography
- **Display (Latin + numerals):** Cormorant Garamond (300/400/500/600 + italics) — loaded via `next/font/google`. Used for titles, eyebrow labels, numerals, prices, section numbers.
- **Body + CJK:** Noto Serif SC (300/400/500/600) — loaded via `next/font/google`. Used for all body copy and all Chinese/Japanese text.
- No sans-serif in brand UI (system sans only for form inputs where legibility requires it, e.g. city picker).
- No runtime `font-${x}` concatenation; apply fixed `font-display` / `font-serif` utilities mapped in `tailwind.config.ts`.

### 3.3 Spacing (4 pt grid)
`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 72 / 96 / 128` → `--s1`…`--s12`.

### 3.4 Radius
`--r-xs: 2px`, `--r-sm: 8px`, `--r-md: 14px` (cards), `--r-lg: 22px` (mobile panels), `--r-pill: 999px` (tabs, tags, buttons).

### 3.5 Elevation & glow
`--shadow-1` (cards), `--shadow-2` (modals/panels), `--glow-gold`, `--glow-nebula`.

### 3.6 Motion
`--dur-1: .18s` (feedback), `--dur-2: .32s` (position), `--dur-3: .6s` (entrance), `--dur-4: 1.1s` (ambient). `--ease: cubic-bezier(.22,.68,.16,1)`. **All motion must degrade under `prefers-reduced-motion`** (instant / no transform).

### 3.7 Layout
`--maxw: 1320px` (desktop content), `--read: 620px` (reading measure), `--gutter: 20px` → `32px` (600+) → `48px` (1024+) → `64px` (1440+).

---

## 4. Breakpoint Strategy (mobile-first)

Replace all `max-width` breakpoints with `min-width`. Default styling targets the smallest screen; enhancements are added upward.

| Token | min-width | Role |
|---|---|---|
| base | 0–599 | Mobile — primary |
| `sm` | 600 | Large phone / small tablet |
| `md` | 900 | Tablet / small laptop — desktop layout begins |
| `lg` | 1024 | Standard desktop |
| `xl` | 1440 | Wide desktop (max width caps at 1320 + gutters) |

### 4.1 Seven-width regression matrix (all must pass)

| Width | Nav | Chart | Report | 12 Palaces | Da Xian |
|---|---|---|---|---|---|
| 360 | bottom tab bar, 4 cols | single-column compact board | 16px / 1.9 | cards, ~1.5 per screen | vertical timeline |
| 375 | bottom tab bar | single column | 17px / 1.95 | cards | vertical timeline |
| 390 | bottom tab bar | single column | 17px / 1.95 | cards | vertical timeline |
| 430 | bottom tab bar | 2-col star clusters | 17px / 1.95 | cards | vertical timeline |
| 768 | top collapsed menu | square board + side panel | 620px centered | cards + wheel toggle | timeline |
| 1024 | full top nav | wheel default | TOC + body | wheel + drawer | horizontal timeline |
| 1440 | top nav, 1320 container | wheel + right detail | 3-col (TOC + body + context) | wheel + persistent side | horizontal timeline |

German (`de`) long words are the risk case at 360/375 — verify button labels and nav tabs do not overflow; shorten `de` copy only if unavoidable (would require i18n key change, flagged separately).

---

## 5. Two Layouts

### 5.1 Mobile (default, < 900)
- **Bottom tab bar** (new component `MobileTabBar`): 4 fixed tabs `Chart / Report / Explore / Account`, 44 px touch targets, 9 px labels, active indicator in `--champagne`. Visible on app surfaces; hidden on auth/legal/payment-success flows.
- **Top bar**: brand mark + language switcher + account avatar. No global hamburger; secondary nav lives in the tab bar and in-page anchors.
- **Single-column narrative**: one card per screen-width; generous vertical rhythm; in-section scroll for the chart only.
- **12 palaces** = accordion cards (new `PalaceCards`): each shows palace name + major star + one-line summary; expands to reveal stars, brightness, si-hua, self-si-hua. Quick-jump chips for 命宫 / 身宫 pinned at top.
- **Da Xian** = vertical timeline (new `DaXianTimeline`): current decade highlighted and auto-scrolled into view; tap a node to expand its 4-transformations (禄/权/科/忌) and landing palace.
- **Report**: deep-space cover → ivory reading shell; 17 px / 1.95; gold chapter numbers; closing line returns to "this is your chart."
- **Payment** = one-thing-per-screen: price → what's included → provider → reassurance.
- **Account** = grouped settings list with chevrons; danger zone separated.

### 5.2 Desktop (≥ 900)
- **Top nav** (refactor `OrientalNav`): brand left, links center/right, language + account + CTA. Sticky, transparent → frosted on scroll.
- **Chart**: left = interactive **wheel** (new `PalaceWheel`, SVG 12 sectors, click → right detail), right = birth form / chart meta. Toggle wheel ↔ square board (`ChartBoard`) preserved.
- **Report**: three columns — fixed TOC (left), 620 px body (center), in-view chapter context (right: palace / stars / si-hua relevant to current section).
- **12 palaces**: wheel primary; square board as "compare view."
- **Da Xian**: horizontal timeline; tap node swaps detail panel.
- Max content width 1320 px, side gutters scale per §3.7.

---

## 6. Page-by-Page Specification

For each: **Current → Target → Files/Components affected**. All copy comes from existing `lib/i18n.ts` keys unless a new key is explicitly listed.

### 6.1 Home (`app/page.tsx` → `app/_home.tsx`)
- Current: hero + creed + palace grid + reading sample + steps + final. Heavy decorative CSS (starfield, seal, vertical scroll strip).
- Target (mobile): vertical narrative — title, real chart thumbnail, two sample excerpts, 3-step explainer, disclaimer. Cut decorative-only elements that don't survive small screens; keep `Starfield` as subtle ambient. Target (desktop): two-column hero (copy left, chart thumbnail right), then sections widen.
- Affected: `_home.tsx` (markup), `globals.css` (`.hero`, `.creed`, `.palaces`, `.reading`, `.steps`, `.final` → tokenized + min-width). `Starfield` reused.

### 6.2 Chart / birth form (`app/chart/new/page.tsx`)
- Current: single `.form-col`; uses `CityPicker`. Desktop-first layout.
- Target (mobile): four stacked field blocks (date / time / place / timezone) each its own card with inline validation; fixed/affordance CTA at bottom. Time input uses fixed separator (not flex-stretched). Target (desktop): left chart preview, right form.
- Affected: `chart/new/page.tsx` (markup only — **no calculation changes**), `components/CityPicker.tsx` (styling to fit mobile), `globals.css`.
- Protected: `lib/chart-cache.ts`, `lib/cities.ts`, `lib/ziwei/*`, `lib/engine.ts`, `lib/time.ts` — untouched.

### 6.3 Report (`app/report/[id]/page.tsx`)
- Current: cover → meta-panel → prenote → chart → `.report` (TOC + chapters). Desktop-first; wide measure.
- Target: **cover (deep space) → reading shell (ivory)** split. Cover shows name, chart thumbnail, date, "scroll to read." Reading shell: TOC hidden on mobile (replaced by chapter jump chips), visible ≥ 900. Body 17 px mobile / 15.5 px desktop, 620 px measure, gold chapter numbers. Chart panel stays on dark surface between cover and reading.
- Affected: `report/[id]/page.tsx` (markup only — **data fetching, status, entitlement unchanged**), `components/ChartBoard.tsx` (responsive sizing, mobile ≥ 12 px min), `components/oriental/CoverChart.tsx`, new `ReportCover` / `ReportToc` / `ReadingShell`.
- Protected: report content, `lib/report-cache.ts`, `app/api/reading/*`, `app/api/report/full/*` — untouched.

### 6.4 Twelve Palaces
- No standalone page today; palaces appear on home (decorative grid), report (chapter), full-preview (chapter), and the chart.
- Target: mobile = `PalaceCards` accordion (home/report/full-preview); desktop = `PalaceWheel` interactive. Data sourced from existing `chart.palaces` only — **no fabricated star data**. Empty palaces show "—" and reference borrowed star from opposite palace (data already in `Palace.borrowedFromName` / `borrowedStars`).
- Affected: `_home.tsx` palace section, report/full-preview palace chapters, new `PalaceCards`, `PalaceWheel`.
- Protected: `lib/ziwei/types.ts`, `lib/star-language.ts`, palace data shape — untouched.

### 6.5 Da Xian
- Appears within report/full-preview chapters today (flat).
- Target: `DaXianTimeline` — vertical (mobile) / horizontal (desktop). Current decade (`chart.currentDaXianIndex`) highlighted + auto-scrolled. Each node shows decade, palace, 4-transformations (data from `DaXian.siHua`).
- Affected: report/full-preview da-xian chapter markup, new `DaXianTimeline`.
- Protected: `lib/ziwei/*` da-xian calculation — untouched.

### 6.6 Payment / unlock (`app/full-preview/page.tsx` unlock section + report paywall + `app/payment/success/page.tsx`)
- Current: `PayPalButton` in full-preview `.unlock` section; paywall gating in report; success page.
- Target (mobile): one-thing-per-screen price card ($9.99 unchanged) → included items → provider buttons → reassurance line. Desktop: same content, two-column (summary + payment). Success page gets a proper "your report is ready" confirmation, not a bare form.
- Affected: `full-preview/page.tsx` markup, `components/PayPalButton.tsx` (styling only), report paywall markup, `payment/success/page.tsx`, new `PriceCard`.
- Protected: `lib/dodo.ts` (price $9.99), `lib/payments/config.ts`, `lib/stripe.ts`, `lib/paypal.ts`, `lib/rate-limit.ts`, all `app/api/{dodo,stripe,paypal,checkout,payment}/*`, webhooks, entitlement — **untouched**. No provider or price change.

### 6.7 Account (`app/account/page.tsx`)
- Current: stacked `.card` sections (profile, charts list, settings, language, danger).
- Target (mobile): grouped inset list with section headers and chevrons; danger zone visually separated by color. Desktop: two-column (main settings + side meta).
- Affected: `account/page.tsx` markup, `components/StatusBadge.tsx` styling, `globals.css`.
- Protected: account data fetching, delete logic (`app/api/account/delete/route.ts`), Supabase client/admin/server — untouched.

### 6.8 Navigation (`components/oriental/OrientalNav.tsx`, `components/Header.tsx`, `components/MainFrame.tsx`)
- Current: `OrientalNav` = single desktop row (96 lines); `Header.tsx` is an 8-line stub; `MainFrame` wraps content.
- Target: split into `DesktopNav` (≥ 900, top) + `MobileTabBar` (< 900, bottom) + `MobileSheet` (overflow links). Keep `OrientalNav` as the orchestrator that picks by breakpoint (CSS-driven, no JS width sniffing where avoidable). Auth-state detection logic (`useEffect` → `getUser`) is preserved exactly.
- Affected: refactor `OrientalNav.tsx`, new `MobileTabBar` / `MobileSheet`, possibly `MainFrame` bottom padding for tab bar.
- Protected: auth detection, `lib/supabase/*`, `lib/demo.ts` — untouched.

### 6.9 Auth, Legal, Error, Not-found
- Target: restyle to the design system (forms on deep space, ivory reading for legal). No flow/logic changes.
- Affected: `app/auth/page.tsx`, `forgot`, `reset`, `legal/page.tsx`, `error.tsx`, `not-found.tsx` (markup/styling).
- Protected: auth callback/confirm routes, Supabase auth — untouched.

---

## 7. New Components (presentation only — no data logic)

| Component | Purpose | Data source (existing, read-only) |
|---|---|---|
| `MobileTabBar` | bottom 4-tab nav | pathname (router) |
| `MobileSheet` | overflow menu / secondary nav | — |
| `DesktopNav` | ≥ 900 top nav (split out of `OrientalNav`) | — |
| `ReportCover` | deep-space report cover | existing cover props |
| `ReportToc` | chapter TOC (desktop) | chapter list (existing) |
| `ReadingShell` | ivory reading container with measure | — |
| `PalaceWheel` | interactive 12-sector SVG wheel (desktop) | `chart.palaces` |
| `PalaceCards` | accordion palace cards (mobile) | `chart.palaces` |
| `DaXianTimeline` | vertical/horizontal decade timeline | `chart.daXians`, `chart.currentDaXianIndex` |
| `PriceCard` | payment summary card | hard-coded $9.99 + existing included-items copy |
| `EmptyState` | no-chart / no-report states | — |
| `Skeleton` | loading placeholders for report/chart | — |

All new components must support `prefers-reduced-motion` and the 6 languages via existing `t(lang, key)` / `useLang`.

---

## 8. Protected Business Logic & Files — MUST NOT CHANGE

These files and directories are **read-only** for this redesign. Do not edit. Do not move. Do not rename exports consumed elsewhere.

### 8.1 Chart calculation & star data (never touch)
- `lib/ziwei/**` (22 files): `algorithm.ts`, `types.ts`, `sihua.ts`, `shier-shen.ts`, `lunar-solar.ts`, `true-solar-time.ts`, `clock-adjust.ts`, `dst-cn.ts`, `constants.ts`, `school-*.ts`, `patterns*.ts`, `famous.ts`, `heming-knowledge.ts`, `yunxian-context.ts`, `cities.ts`, `school-tables.generated.ts`, `lunar-javascript.d.ts`.
- `lib/engine.ts`, `lib/engine-version.ts`, `lib/chart-cache.ts`, `lib/chart-preview.ts`, `lib/time.ts`, `lib/sample-birth.ts`, `lib/star-language.ts`.
- `components/ChartWheel.tsx` (the IZtro rendering integration — data flow, not styling, is protected; styling-only CSS class tweaks allowed, no prop/data changes).

### 8.2 AI analysis & report generation (never touch)
- `lib/ai.ts`, `lib/full-report.ts`, `lib/report-cache.ts`, `lib/chart-cache.ts` (cache key logic).
- `app/api/reading/route.ts`, `app/api/reading/full/route.ts`, `app/api/report/full/route.ts`.
- Prompt text, response parsing, caching, entitlement checks inside these.

### 8.3 Authentication & account (never touch)
- `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`.
- `middleware.ts`.
- `app/auth/callback/route.ts`, `app/auth/confirm/route.ts`.
- `app/api/account/delete/route.ts`.
- `lib/demo.ts` (demo-mode auth/data store — behavior must stay identical; styling-only usage allowed).
- Account data model and RLS.

### 8.4 Payment (never touch)
- `lib/dodo.ts` — **price stays $9.99** (`FULL_REPORT_AMOUNT`).
- `lib/payments/config.ts`, `lib/stripe.ts`, `lib/paypal.ts`, `lib/rate-limit.ts`.
- `app/api/dodo/**`, `app/api/stripe/**`, `app/api/paypal/**`, `app/api/checkout/**`, `app/api/payment/**` (status / entitlement) — including all webhook handlers.
- `components/PayPalButton.tsx` — **logic, order-creation calls, and props must stay identical**; only CSS class names / visual styling may change, and only if behavior is unchanged.
- `schema.sql`, `migrations/**`, `scripts/**`, `tests/**`.

### 8.5 Other protected
- `lib/i18n.ts` — **do not alter existing string values**; adding new keys is allowed but must include all 6 languages and not change existing ones.
- `lib/analytics.ts` — tracking calls (`trackEvent`, `E`) must remain wired to the same user actions; do not remove events.
- `app/layout.tsx` — may add `next/font` loading and adjust `viewport.themeColor`/`body` classes; must **not** remove `LangProvider`, `Header`, `MainFrame`, `SiteFooter`, `ScrollProgress`, `RevealController`, or the Plausible script injection.
- `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` — no changes.
- `next.config.ts`, `postcss.config.js`, `tsconfig.json`, `railway.json` — no changes this round (unless adding `next/font` requires none — it does not).
- `package.json` / `package-lock.json` — **no new dependencies**.

---

## 9. Files To Modify (presentation layer only)

Confirmed scope (may grow only with approval):

**Rewrite / heavily edit**
- `app/globals.css` — tokenize, convert to `min-width` breakpoints, keep existing class names to minimize regression.
- `tailwind.config.ts` — add five-color palette, font families (`display`, `serif`), spacing scale, radius, breakpoints (`screens`), motion tokens.
- `app/layout.tsx` — add `next/font` for Cormorant Garamond + Noto Serif SC; update `viewport.themeColor` to deep space; body classes.

**Edit markup + styling**
- `app/_home.tsx`, `app/page.tsx`
- `app/chart/new/page.tsx`
- `app/report/[id]/page.tsx`
- `app/full-preview/page.tsx`
- `app/account/page.tsx`
- `app/payment/success/page.tsx`
- `app/auth/page.tsx`, `app/auth/forgot/page.tsx`, `app/auth/reset/page.tsx`
- `app/legal/page.tsx`, `app/not-found.tsx`, `app/error.tsx`
- `components/oriental/OrientalNav.tsx` (refactor → orchestrator)
- `components/ChartBoard.tsx` (responsive sizing)
- `components/Header.tsx`, `components/MainFrame.tsx` (wire new nav; bottom padding for tab bar)
- `components/CityPicker.tsx`, `components/StatusBadge.tsx`, `components/Logo.tsx`, `components/LanguageSwitcher.tsx` (styling fit)
- `components/oriental/CoverChart.tsx`, `Starfield.tsx`, `ScrollProgress.tsx`, `RevealController.tsx` (styling/token alignment; no behavior change)

**Add new** — see §7.

---

## 10. Implementation Order (phased, low-risk)

1. **Foundation (no visible pages yet):** tokens in `tailwind.config.ts` + `globals.css` `:root`; `next/font` in `layout.tsx`. Verify build + typecheck. *(highest-risk slice — reserve stronger model if needed)*
2. **Nav:** `DesktopNav` + `MobileTabBar` + `MobileSheet`; wire in `OrientalNav`/`MainFrame`. Verify no auth breakage.
3. **Home** mobile + desktop.
4. **Chart form** mobile + desktop (`CityPicker` fit).
5. **Report** cover + reading shell + TOC + chapter typography.
6. **12 palaces** (`PalaceCards` + `PalaceWheel`).
7. **Da Xian** timeline.
8. **Payment** price card + success page.
9. **Account** + auth + legal + error/not-found pass.
10. **Empty/loading states** (`Skeleton`, `EmptyState`).
11. **Regression sweep** across 7 widths + 6 languages; `prefers-reduced-motion`; contrast; build + typecheck + tests.

Each phase: `npm run typecheck`, `npm run test`, and a 7-width visual check before moving on. No phase merges protected files.

---

## 11. Regression & Acceptance Checklist

- [ ] `npm run build` succeeds.
- [ ] `npm run typecheck` passes with no new errors.
- [ ] `npm test` passes (`tests/chart-rls.test.ts`, `tests/report-cache.test.ts`) — confirms protected logic intact.
- [ ] No horizontal overflow at 360 / 375 / 390 / 430 / 768 / 1024 / 1440.
- [ ] Chart calculation output is byte-identical to `main` for a fixed birth input (smoke: generate a chart, compare JSON).
- [ ] Report content unchanged for a cached report (compare rendered text).
- [ ] Payment flow still reaches checkout at $9.99; webhook/entitlement untouched.
- [ ] Auth sign-in/sign-up still works; demo mode still works.
- [ ] All 6 languages render without broken layout (esp. `de` at 360).
- [ ] `prefers-reduced-motion` disables transforms/animations.
- [ ] Color contrast meets WCAG AA for body text on both dark and ivory surfaces.
- [ ] No new dependencies in `package.json`.

---

## 12. Risks & Open Questions

1. **Ring-chart touch precision:** SVG 12-sector hit targets are small on phones → wheel only at ≥ 768; cards below. Verify.
2. **`globals.css` rewrite blast radius:** 4,163 lines used across all pages. Strategy = keep existing class names, swap values to tokens, convert breakpoints to `min-width`. Risk of regression is high; mitigate via phased rollout + 7-width checks. **Do not** rename classes wholesale.
3. **Report chapter structure:** does the report have a stable chapter list to drive the TOC? Confirm before building `ReportToc`; if not, TOC is derived from rendered heading anchors (no data change).
4. **German long words** at 360 — may require `de`-only copy shortening (i18n change, flagged separately, not done silently).
5. **`next/font` + Cormorant/Noto Serif SC** load time — use `display: swap`; verify LCP doesn't regress. Both are OFL-licensed (free commercial use).
6. **Payment contrast on dark** — verify provider button colors (PayPal/Stripe/Dodo) meet contrast over deep-space backgrounds; may need a light card behind them (styling only).

---

## 13. Status

- Spec written: this file.
- Branch: `redesign/mobile-first` (created from clean `main`).
- No application source code, CSS, or protected logic modified.
- Awaiting approval before implementation begins.
