#!/usr/bin/env node
/**
 * GSC + Plausible 数据体检脚本（零依赖）。
 *
 * 为什么要有它：Google Search Console 与 Plausible 都没有「阈值告警」，
 * 只能主动拉数据自己判断。这个脚本每次输出一份 Markdown 周报，
 * 并把需要人管的问题打成 [ALERT] / [WARN]，其余只列数字。
 *
 * 凭据（写在 .env.local，已被 .gitignore 排除）：
 *   PLAUSIBLE_API_KEY        Plausible → Settings → API keys 生成
 *   PLAUSIBLE_SITE_ID        默认取 NEXT_PUBLIC_PLAUSIBLE_DOMAIN
 *   GSC_SERVICE_ACCOUNT_FILE 服务账号 JSON 的本地路径
 *   GSC_SITE                 默认 sc-domain:ziwei-insight.com
 *
 * 用法：npm run monitor
 */

import fs from 'node:fs';
import crypto from 'node:crypto';

const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ziwei-insight.com').replace(/\/$/, '');
const GSC_API = 'https://searchconsole.googleapis.com/webmasters/v3';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

/** 读取 .env.local / .env；真实环境变量优先。 */
function loadEnv() {
  const fromFile = {};
  for (const file of ['.env.local', '.env']) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && m[2] !== '') fromFile[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return { ...fromFile, ...process.env };
}

const env = loadEnv();
const PLAUSIBLE_BASE = (env.PLAUSIBLE_BASE || 'https://plausible.io').replace(/\/$/, '');
const PLAUSIBLE_SITE = env.PLAUSIBLE_SITE_ID || env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '';
const PLAUSIBLE_KEY = env.PLAUSIBLE_API_KEY || '';
const GSC_SITE = env.GSC_SITE || 'sc-domain:ziwei-insight.com';
const GSC_SA_FILE = env.GSC_SERVICE_ACCOUNT_FILE || '';

const alerts = [];
const lines = [];
const say = (text = '') => lines.push(text);
const flag = (level, text) => alerts.push(`- **[${level}]** ${text}`);

const b64url = (input) => Buffer.from(input).toString('base64url');
const pct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
const change = (now, before) => (before > 0 ? ((now - before) / before) * 100 : now > 0 ? 100 : 0);
const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return iso(d);
};

// —————————————————— 站点健康（不需要任何密钥） ——————————————————
async function checkSite() {
  const checks = ['/', '/liunian/2027', '/liunian/2028', '/guides', '/full-preview', '/sitemap.xml', '/robots.txt'];
  const rows = [];
  for (const path of checks) {
    try {
      const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: 'follow' });
      rows.push({ path, status: res.status });
      if (res.status !== 200) flag('ALERT', `${path} 返回 ${res.status}`);
    } catch (error) {
      rows.push({ path, status: `ERR ${error.message.slice(0, 40)}` });
      flag('ALERT', `${path} 请求失败：${error.message.slice(0, 60)}`);
    }
  }
  let sitemapCount = 0;
  try {
    const xml = await (await fetch(`${SITE_ORIGIN}/sitemap.xml`)).text();
    sitemapCount = (xml.match(/<loc>/g) || []).length;
    if (sitemapCount < 30) flag('WARN', `sitemap 只有 ${sitemapCount} 条，低于预期 32 条`);
  } catch {
    flag('ALERT', 'sitemap.xml 无法读取');
  }
  say('### 站点健康');
  say('');
  say('| 路径 | 状态 |');
  say('| --- | --- |');
  for (const r of rows) say(`| \`${r.path}\` | ${r.status} |`);
  say('');
  say(`sitemap 收录条目：**${sitemapCount}**`);
  say('');
}

// —————————————————— Plausible ——————————————————
async function plausible(path, params) {
  const url = new URL(`${PLAUSIBLE_BASE}/api/v1/stats/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${PLAUSIBLE_KEY}` } });
  if (!res.ok) throw new Error(`Plausible ${path} ${res.status}: ${(await res.text()).slice(0, 120)}`);
  return res.json();
}

async function checkPlausible() {
  say('### 流量（Plausible，近 7 天 vs 前 7 天）');
  say('');
  if (!PLAUSIBLE_KEY || !PLAUSIBLE_SITE) {
    flag('WARN', '未配置 PLAUSIBLE_API_KEY / PLAUSIBLE_SITE_ID，本节跳过（其余检查照常）');
    say('_未配置 API Key，跳过。_');
    say('');
    return;
  }

  const agg = await plausible('aggregate', {
    site_id: PLAUSIBLE_SITE,
    period: '7d',
    metrics: 'visitors,pageviews,bounce_rate,visit_duration',
    compare: 'previous_period',
  });
  const r = agg.results || {};
  const v = r.visitors?.value ?? 0;
  const vPrev = r.visitors?.value === undefined ? 0 : Math.round(v / (1 + (r.visitors.change ?? 0) / 100));
  const pv = r.pageviews?.value ?? 0;
  const pvPrev = Math.round(pv / (1 + (r.pageviews.change ?? 0) / 100)) || 0;

  say('| 指标 | 本期 | 上期 | 变化 |');
  say('| --- | --- | --- | --- |');
  say(`| 访客 | ${v} | ${vPrev} | ${pct(change(v, vPrev))} |`);
  say(`| 浏览 | ${pv} | ${pvPrev} | ${pct(change(pv, pvPrev))} |`);
  say(`| 跳出率 | ${Math.round(r.bounce_rate?.value ?? 0)}% | — | — |`);
  say('');

  if (v === 0) flag('ALERT', '近 7 天访客为 0：埋点可能失效，或站点没有流量');
  else if (vPrev > 0 && change(v, vPrev) < -50) flag('WARN', `访客较上期下降 ${pct(change(v, vPrev))}，先确认埋点是否正常再判断流量`);

  const events = await plausible('breakdown', {
    site_id: PLAUSIBLE_SITE,
    period: '7d',
    property: 'event:name',
    metrics: 'events',
    limit: '20',
  });
  const counts = Object.fromEntries(
    (events.results || []).map((row) => [row['event:name'] ?? row.name ?? '', row.events ?? row.count ?? 0]),
  );
  say('事件计数（7 天）：');
  say('');
  for (const [name, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) say(`- \`${name}\`：${count}`);
  say('');

  const pages = await plausible('breakdown', {
    site_id: PLAUSIBLE_SITE,
    period: '7d',
    property: 'event:page',
    metrics: 'visitors',
    limit: '10',
  });
  say('落地页 Top 10（访客）：');
  say('');
  for (const row of pages.results || []) say(`- \`${row.page}\`：${row.visitors}`);
  say('');

  // 漏斗：排盘 → 付费墙 → 发起支付 → 成功
  const generated = counts.chart_generated ?? 0;
  const paywall = counts.paywall_seen ?? 0;
  const started = counts.payment_start ?? 0;
  const success = counts.payment_success ?? 0;
  if (generated > 0 && paywall === 0) flag('WARN', '有排盘生成但无 paywall_seen，检查付费墙事件是否漏埋');
  if (paywall > 0 && started === 0) flag('WARN', `付费墙 ${paywall} 次曝光但 0 次发起支付，付费页说服力需要复核`);
  if (success > 0) say(`**已出现 ${success} 笔 payment_success（7 天内）—— 首单信号，值得回看来源页与文案。**`);
  say('');

  const preview = (pages.results || []).find((row) => String(row.page || '').startsWith('/full-preview'));
  if (preview) say(`\`/full-preview\` 访客：**${preview.visitors}**（对照 payment_start 判断解锁卡效果）`);
  say('');
}

// —————————————————— Google Search Console ——————————————————
function gscJwt(clientEmail, privateKey) {
  const iat = Math.floor(Date.now() / 1000);
  const claim = b64url(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: TOKEN_URL,
      iat,
      exp: iat + 3600,
    }),
  );
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${head}.${claim}`);
  return `${head}.${claim}.${signer.sign(privateKey, 'base64url')}`;
}

async function gscToken() {
  const raw = GSC_SA_FILE ? fs.readFileSync(GSC_SA_FILE, 'utf8') : env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('缺少服务账号：请设置 GSC_SERVICE_ACCOUNT_FILE 或 GSC_SERVICE_ACCOUNT_JSON');
  const sa = JSON.parse(raw);
  const assertion = gscJwt(sa.client_email, sa.private_key);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!res.ok) throw new Error(`获取 GSC token 失败 ${res.status}：${(await res.text()).slice(0, 160)}`);
  return (await res.json()).access_token;
}

async function gscQuery(token, site, body) {
  const res = await fetch(`${GSC_API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GSC 查询失败 ${res.status}：${(await res.text()).slice(0, 160)}`);
  return res.json();
}

async function checkGsc() {
  say('### 搜索表现（GSC，近 7 个完整数据日）');
  say('');
  if (!GSC_SA_FILE && !env.GSC_SERVICE_ACCOUNT_JSON) {
    flag('WARN', '未配置 GSC 服务账号，本节跳过（其余检查照常）');
    say('_未配置服务账号，跳过。_');
    say('');
    return;
  }

  const token = await gscToken();
  // GSC 数据有 2–3 天延迟，取最近 7 个可用日。
  const end = daysAgo(3);
  const start = daysAgo(9);
  const prevEnd = daysAgo(10);
  const prevStart = daysAgo(16);
  const sum = (rows) =>
    rows.reduce(
      (acc, row) => ({
        clicks: acc.clicks + (row.clicks || 0),
        impressions: acc.impressions + (row.impressions || 0),
        ctr: acc.ctr + (row.ctr || 0),
        position: acc.position + (row.position || 0),
        n: acc.n + 1,
      }),
      { clicks: 0, impressions: 0, ctr: 0, position: 0, n: 0 },
    );

  const cur = sum((await gscQuery(token, GSC_SITE, { startDate: start, endDate: end, dimensions: ['date'] })).rows || []);
  const prev = sum((await gscQuery(token, GSC_SITE, { startDate: prevStart, endDate: prevEnd, dimensions: ['date'] })).rows || []);
  const ctr = (s) => (s.impressions ? (s.clicks / s.impressions) * 100 : 0);
  const pos = (s) => (s.n ? s.position / s.n : 0);

  say('| 指标 | 本期 | 上期 | 变化 |');
  say('| --- | --- | --- | --- |');
  say(`| 点击 | ${cur.clicks} | ${prev.clicks} | ${pct(change(cur.clicks, prev.clicks))} |`);
  say(`| 曝光 | ${cur.impressions} | ${prev.impressions} | ${pct(change(cur.impressions, prev.impressions))} |`);
  say(`| 点击率 | ${ctr(cur).toFixed(2)}% | ${ctr(prev).toFixed(2)}% | — |`);
  say(`| 平均排名 | ${pos(cur).toFixed(1)} | ${pos(prev).toFixed(1)} | — |`);
  say('');
  if (cur.impressions === 0) flag('ALERT', `GSC 近 7 天 0 曝光（${start}~${end}）：页面可能尚未被索引`);

  const queries = (await gscQuery(token, GSC_SITE, { startDate: start, endDate: end, dimensions: ['query'], rowLimit: 15 })).rows || [];
  if (queries.length) {
    say('搜索词 Top 15（本期）：');
    say('');
    say('| 查询 | 曝光 | 点击 | 排名 |');
    say('| --- | --- | --- | --- |');
    for (const q of queries) say(`| ${q.keys[0]} | ${q.impressions} | ${q.clicks} | ${q.position.toFixed(1)} |`);
    say('');
  }

  const pages = (await gscQuery(token, GSC_SITE, { startDate: start, endDate: end, dimensions: ['page'], rowLimit: 15 })).rows || [];
  const forecast = pages.filter((p) => String(p.keys[0]).includes('/liunian/'));
  const guides = pages.filter((p) => String(p.keys[0]).includes('/guides'));
  say('内容簇表现（本期曝光）：');
  say('');
  say(`- 流年页（/liunian/*）：${forecast.reduce((a, p) => a + p.impressions, 0)}`);
  say(`- 命理笔记（/guides*）：${guides.reduce((a, p) => a + p.impressions, 0)}`);
  say('');
  if (!forecast.length) flag('WARN', '流年页在 GSC 中无任何曝光记录：还没进索引，或上线不足一周');
  for (const row of [...forecast, ...guides].slice(0, 6)) {
    say(`- \`${String(row.keys[0]).replace(SITE_ORIGIN, '')}\`：曝光 ${row.impressions}，点击 ${row.clicks}`);
  }
  say('');
}

// —————————————————— 主流程 ——————————————————
async function main() {
  say(`# 数据体检 · ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}`);
  say('');
  say(`站点：${SITE_ORIGIN}　GSC 资源：\`${GSC_SITE}\``);
  say('');

  await checkSite();
  try {
    await checkPlausible();
  } catch (error) {
    flag('ALERT', `Plausible 拉数失败：${error.message}`);
  }
  try {
    await checkGsc();
  } catch (error) {
    flag('ALERT', `GSC 拉数失败：${error.message}`);
  }

  say('## 需要处理');
  say('');
  if (alerts.length) alerts.forEach((a) => say(a));
  else say('无。所有指标在预期范围内。');
  say('');
  say('---');
  say('');
  say('口径：GSC 取最近 7 个完整数据日（含 3 天延迟）并与前 7 日对比；Plausible 取 7d 与 previous_period 对比。');
  console.log(lines.join('\n'));
}

main().catch((error) => {
  console.error(`体检脚本异常：${error.stack || error.message}`);
  process.exit(1);
});