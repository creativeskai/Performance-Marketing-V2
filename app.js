// ── KAI Performance Hub — Live Dashboard App ──────────────────────────────────
// Depends on live_api.js being loaded first

const CFG = 'kai_v10';
let cfg = lC();
function lC() { try { return JSON.parse(localStorage.getItem(CFG) || '{}') } catch { return {} } }
function sC(c) { localStorage.setItem(CFG, JSON.stringify(c)); cfg = c; }

// Fallback static data while live loads (or if API fails)
const FALLBACK = {
  label: 'Last 7 days (May 18–24, 2026)',
  campaigns: [
    { id: 'kage', sn: 'Kage_12052026', product: 'Kage Tee', spend: 6296, revenue: 41805, purchases: 29, atc: 203, checkouts: 130, reach: 108207, impressions: 168680, cpm: 37.33, freq: 1.56, ctr: 2.96, lpv: 3496, cpp: 217, status: 'active', color: '#1a6bb5', roas: 6.64 },
    { id: 'retarget', sn: 'Kage_Retargeting', product: 'Kage Tee', spend: 1858, revenue: 16982, purchases: 6, atc: 42, checkouts: 27, reach: 8589, impressions: 15415, cpm: 120.53, freq: 1.79, ctr: 2.91, lpv: 314, cpp: 310, status: 'active', color: '#b85c00', roas: 9.14 },
    { id: 'kabuto', sn: 'Kabuto_Caps_24042026', product: 'Kabuto Cap', spend: 565, revenue: 3187, purchases: 4, atc: 28, checkouts: 18, reach: 16095, impressions: 18258, cpm: 30.94, freq: 1.13, ctr: 2.14, lpv: 391, cpp: 141, status: 'active', color: '#1e7a45', roas: 5.64 }
  ]
};

let activeCampaigns = FALLBACK.campaigns;
let period = 'last_7d';
let activeCamp = 'ALL';
let advMode = 'daily';
let isStr = false;
let sc = null;
let fo = '';
let aHist = [];
let charts = {};
let geoLevel = 'state';
let geoState = null;

// ── Helpers ────────────────────────────────────────────────────────────────────
const INR = v => v >= 10000 ? '₹' + (v / 1000).toFixed(1) + 'k' : '₹' + Math.round(v).toLocaleString('en-IN');
const FMT = v => v >= 10000 ? (v / 1000).toFixed(0) + 'k' : v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
const PCT = v => (isNaN(v) || !isFinite(v) ? 0 : v).toFixed(1) + '%';
const roasColor = r => r >= 5 ? '#1e7a45' : r >= 3.5 ? '#1a6bb5' : r >= 2 ? '#b85c00' : '#c0392b';
const cpmColor = c => c < 80 ? '#1e7a45' : c < 150 ? '#1a6bb5' : c < 250 ? '#b85c00' : '#c0392b';

function mkChart(id, type, labels, datasets, extra) {
  const ctx = document.getElementById(id); if (!ctx) return;
  if (charts[id]) charts[id].destroy();
  const base = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: datasets.length > 1, labels: { color: '#555', font: { family: 'DM Mono', size: 10 }, boxWidth: 10, padding: 8 } }, tooltip: { backgroundColor: '#fff', titleColor: '#111', bodyColor: '#333', borderColor: '#ddd', borderWidth: 1 } },
    scales: { x: { grid: { color: '#f0f0f0' }, ticks: { color: '#666', font: { family: 'DM Mono', size: 10 } } }, y: { grid: { color: '#f0f0f0' }, ticks: { color: '#666', font: { family: 'DM Mono', size: 10 } } } }
  };
  charts[id] = new Chart(ctx, { type, data: { labels, datasets }, options: Object.assign({}, base, extra || {}) });
}

function bench(m, v) {
  if (m === 'roas') return v >= 5 ? { c: 'g', t: 'STRONG' } : v >= 3.5 ? { c: 'b', t: 'ON TRACK' } : v >= 2 ? { c: 'w', t: 'WATCH' } : { c: 'r', t: 'CRITICAL' };
  if (m === 'cpm') return v < 80 ? { c: 'g', t: 'STRONG' } : v < 150 ? { c: 'b', t: 'OK' } : v < 250 ? { c: 'w', t: 'WATCH' } : { c: 'r', t: 'CRITICAL' };
  if (m === 'freq') return v < 2 ? { c: 'g', t: 'OK' } : v < 2.5 ? { c: 'w', t: 'WATCH' } : { c: 'r', t: 'RETIRE' };
  return { c: 'n', t: '' };
}

function kCard(label, val, sub, cls, b) {
  return '<div class="kc ' + cls + '"><div class="kl">' + label + '</div><div class="kv">' + val + '</div><div class="ks">' + sub + '</div>' + (b ? '<div class="kbd s' + b.c + '">' + b.t + '</div>' : '') + '</div>';
}

function getSignal(c) {
  const roas = c.roas || (c.spend > 0 ? c.revenue / c.spend : 0);
  if (c.status === 'off' && roas >= 5) return { cls: 'sig-s', t: '🔥 REACTIVATE' };
  if (roas >= 5 && c.cpm < 80) return { cls: 'sig-s', t: '▲ SCALE' };
  if (c.cpm > 200 || (roas < 1 && c.spend > 500)) return { cls: 'sig-k', t: '✕ KILL' };
  if (c.freq > 2 || c.cpm > 150) return { cls: 'sig-w', t: '◎ WATCH' };
  if (c.status === 'active' && roas >= 2) return { cls: 'sig-h', t: '→ HOLD' };
  return { cls: 'sig-h', t: '— OFF' };
}

function getCamps() { return activeCampaigns; }
function getFiltered() { const c = getCamps(); return activeCamp === 'ALL' ? c : c.filter(x => x.id === activeCamp); }
function getAccount() {
  const c = getFiltered();
  return c.reduce((acc, x) => ({
    spend: acc.spend + x.spend, revenue: acc.revenue + x.revenue, purchases: acc.purchases + x.purchases,
    atc: acc.atc + x.atc, checkouts: acc.checkouts + x.checkouts,
    impressions: acc.impressions + x.impressions, reach: acc.reach + x.reach
  }), { spend: 0, revenue: 0, purchases: 0, atc: 0, checkouts: 0, impressions: 0, reach: 0 });
}

// ── View routing ───────────────────────────────────────────────────────────────
function showView(v) {
  document.querySelectorAll('.view').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(e => e.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  ['dash', 'insights', 'rec', 'advisor'].forEach((x, i) => {
    if (x === v) document.querySelectorAll('.nav-tab')[i].classList.add('active');
  });
  if (v === 'dash') refreshDash();
  if (v === 'insights') renderLiveInsights();
  if (v === 'rec') renderRecs();
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function refreshDash() {
  renderCampTabs(); renderAccountKPIs(); renderFunnel(); renderDashCharts(); renderCampTable(); renderDailyPacing();
}

function renderCampTabs() {
  const all = [{ id: 'ALL', sn: 'All', color: '#111' }, ...getCamps()];
  document.getElementById('camp-tabs').innerHTML = all.map(c => {
    const on = c.id === activeCamp;
    return '<button class="ctab' + (on ? ' on' : '') + '" onclick="setCamp(\'' + c.id + '\')" style="' + (on ? 'color:' + c.color + ';border-color:' + c.color + ';background:#f5f5f5' : '') + '">' + c.sn + (c.status === 'off' ? ' ●' : ' ○') + '</button>';
  }).join('');
}

function setCamp(id) { activeCamp = id; refreshDash(); }

function renderAccountKPIs() {
  const a = getAccount();
  const roas = a.spend > 0 ? a.revenue / a.spend : 0;
  const aov = a.purchases > 0 ? a.revenue / a.purchases : 0;
  const cpm = a.impressions > 0 ? a.spend / a.impressions * 1000 : 0;
  const rb = bench('roas', roas), cb = bench('cpm', cpm);
  document.getElementById('kpi-account').innerHTML = [
    kCard('Total spend', INR(a.spend), 'last 7 days', 'b', null),
    kCard('Total revenue', INR(a.revenue), 'attributed', 'g', null),
    kCard('ROAS', roas.toFixed(2) + 'x', 'blended', roas >= 3.5 ? 'g' : roas >= 2 ? 'w' : 'r', rb),
    kCard('Purchases', a.purchases.toString(), 'total orders', 'n', null),
    kCard('AOV', INR(aov), 'avg order', 'n', null),
    kCard('Avg CPM', INR(cpm), 'per 1k impr', cpm < 80 ? 'g' : cpm < 150 ? 'b' : 'r', cb),
    kCard('Impressions', FMT(a.impressions), 'total', 'n', null),
    kCard('ATC', a.atc.toString(), 'add to cart', 'n', null)
  ].join('');
}

function renderFunnel() {
  const c = getFiltered().filter(x => x.spend > 0);
  const tot = k => c.reduce((s, x) => s + (x[k] || 0), 0);
  const reach = tot('reach'), imp = tot('impressions'), lpv = tot('lpv'), atc = tot('atc'), co = tot('checkouts'), pur = tot('purchases');
  const avgCtr = c.length > 0 ? c.reduce((s, x) => s + x.ctr, 0) / c.length : 2.5;
  const clicks = Math.round(imp * avgCtr / 100);
  const atcRate = lpv > 0 ? atc / lpv * 100 : 0;
  const coRate = atc > 0 ? co / atc * 100 : 0;
  const purRate = co > 0 ? pur / co * 100 : 0;
  const steps = [
    { l: 'Reach', v: FMT(reach), s: 'unique', lk: false },
    { l: 'Impr.', v: FMT(imp), s: 'total', lk: false },
    { l: 'Clicks', v: FMT(clicks), s: PCT(avgCtr) + ' CTR', lk: false },
    { l: 'LPV', v: lpv || '—', s: 'landing views', lk: atcRate < 15 && atcRate > 0 },
    { l: 'ATC', v: atc, s: lpv > 0 ? PCT(atcRate) + ' of LPV' : '', lk: coRate < 40 && atc > 0 },
    { l: 'Checkout', v: co, s: atc > 0 ? PCT(coRate) + ' of ATC' : '', lk: purRate < 40 && co > 0 },
    { l: 'Purchase', v: pur, s: co > 0 ? PCT(purRate) + ' of CO' : '', lk: false }
  ];
  document.getElementById('funnel-row').innerHTML = steps.map(s =>
    '<div class="fs' + (s.lk ? ' leak-step' : '') + '"><div class="fn">' + s.v + '</div><div class="fl">' + s.l + '</div><div class="fc">' + s.s + '</div>' + (s.lk ? '<div class="fleak">⚠ leak</div>' : '') + '</div>'
  ).join('');
  const n = document.getElementById('funnel-leak-note');
  if (n) n.textContent = co > 0 ? '⚠ Checkout→Purchase: ' + PCT(purRate) + ' only — ' + PCT(100 - purRate) + ' abandon' : '';
}

function renderDashCharts() {
  const active = getCamps().filter(c => c.spend > 0);
  const names = active.map(c => c.sn.replace('_12052026', '').replace('_Caps_24042026', ' Caps').replace('_Retargeting_16052025', ' Retargeting').split('_')[0]);
  mkChart('ch-rev', 'bar', names, [
    { label: 'Spend', data: active.map(c => c.spend), backgroundColor: '#93bbde', borderColor: '#1a6bb5', borderWidth: 1 },
    { label: 'Revenue', data: active.map(c => c.revenue), backgroundColor: '#90c9a8', borderColor: '#1e7a45', borderWidth: 1 }
  ], {});
  const rd = active.map(c => parseFloat((c.roas || 0).toFixed(2)));
  mkChart('ch-roas', 'bar', names, [{ data: rd, backgroundColor: rd.map(r => roasColor(r)), borderWidth: 0 }], { plugins: { legend: { display: false } } });
  mkChart('ch-cpm', 'bar', names, [{ data: active.map(c => c.cpm), backgroundColor: active.map(c => cpmColor(c.cpm)), borderWidth: 0 }], { plugins: { legend: { display: false } } });
  mkChart('ch-freq', 'bar', names, [{ data: active.map(c => c.freq), backgroundColor: active.map(c => c.freq < 2 ? '#1e7a45' : c.freq < 2.5 ? '#c97a18' : '#c0392b'), borderWidth: 0 }], { plugins: { legend: { display: false } } });
}

function renderCampTable() {
  document.getElementById('camp-tbody').innerHTML = getCamps().map(function (c) {
    const roas = c.roas || 0;
    const s = getSignal(c);
    const scls = c.status === 'active' ? 'sp-a' : c.status === 'off' ? 'sp-o' : 'sp-w';
    const coRate = c.checkouts > 0 ? PCT(c.purchases / c.checkouts * 100) : '--';
    const shortName = c.sn.replace('_12052026', '').replace('_Caps_24042026', ' Caps').replace('_Retargeting_16052025', ' Retargeting').replace('_16052025', '');
    return '<tr><td style="font-weight:600">' + shortName + '</td><td>' + INR(c.spend) + '</td>'
      + '<td style="color:#1e7a45;font-weight:500">' + INR(c.revenue) + '</td>'
      + '<td style="color:' + roasColor(roas) + ';font-weight:700">' + roas.toFixed(2) + 'x</td>'
      + '<td>' + c.purchases + '</td><td>' + INR(c.revenue / Math.max(c.purchases, 1)) + '</td>'
      + '<td>' + c.atc + '</td><td>' + c.checkouts + '</td>'
      + '<td style="color:' + cpmColor(c.cpm) + '">' + INR(c.cpm) + '</td>'
      + '<td style="color:' + (c.freq < 2 ? '#1e7a45' : c.freq < 2.5 ? '#b85c00' : '#c0392b') + '">' + c.freq.toFixed(2) + 'x</td>'
      + '<td>' + PCT(c.ctr) + '</td><td>' + coRate + '</td>'
      + '<td><span class="sp ' + scls + '">' + c.status.toUpperCase() + '</span></td>'
      + '<td><span class="' + s.cls + '">' + s.t + '</span></td></tr>';
  }).join('');
}

function renderDailyPacing() {
  if (!LIVE_DATA || !LIVE_DATA.allDaily || LIVE_DATA.allDaily.length === 0) {
    document.getElementById('hist-tbody').innerHTML = '<tr><td colspan="6" style="color:var(--text3);text-align:center;padding:20px">Loading live daily data...</td></tr>';
    return;
  }
  // Group by date across all campaigns
  const byDate = {};
  LIVE_DATA.allDaily.forEach(d => {
    if (!byDate[d.date]) byDate[d.date] = { spend: 0, revenue: 0, purchases: 0, cpm: [] };
    byDate[d.date].spend += d.spend;
    byDate[d.date].purchases += d.purchases;
    byDate[d.date].revenue += d.roas * d.spend;
    if (d.cpm > 0) byDate[d.date].cpm.push(d.cpm);
  });
  const rows = Object.entries(byDate).sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 7);
  document.getElementById('hist-tbody').innerHTML = rows.map(([date, d]) => {
    const roas = d.spend > 0 ? d.revenue / d.spend : 0;
    const avgCpm = d.cpm.length > 0 ? d.cpm.reduce((a, b) => a + b, 0) / d.cpm.length : 0;
    const dateObj = new Date(date + 'T12:00:00Z');
    const label = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
    return '<tr><td>' + label + '</td><td>' + INR(d.spend) + '</td>'
      + '<td style="color:#1e7a45;font-weight:500">' + INR(d.revenue) + '</td>'
      + '<td style="color:' + roasColor(roas) + ';font-weight:700">' + roas.toFixed(2) + 'x</td>'
      + '<td>' + d.purchases + '</td><td>' + INR(avgCpm) + '</td></tr>';
  }).join('');
}

// ── Live Insights ──────────────────────────────────────────────────────────────
function renderLiveInsights() {
  if (!LIVE_DATA) {
    document.getElementById('insights-loading').style.display = 'block';
    return;
  }
  document.getElementById('insights-loading').style.display = 'none';

  // Placement charts
  const pl = LIVE_DATA.placements.slice(0, 7);
  if (pl.length > 0) {
    mkChart('ch-placement-roas', 'bar', pl.map(p => p.name),
      [{ data: pl.map(p => parseFloat(p.roas.toFixed(2))), backgroundColor: pl.map(p => p.roas >= 5 ? '#1e7a45' : p.roas >= 2 ? '#1a6bb5' : p.roas > 0 ? '#c97a18' : '#e0e4ea'), borderWidth: 0 }],
      { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => v + 'x', color: '#666', font: { family: 'DM Mono', size: 9 } }, grid: { color: '#f0f0f0' } }, x: { ticks: { color: '#666', font: { family: 'DM Mono', size: 9 } }, grid: { color: '#f0f0f0' } } } });
    mkChart('ch-placement-cpm', 'bar', pl.map(p => p.name),
      [{ data: pl.map(p => p.cpm), backgroundColor: pl.map(p => cpmColor(p.cpm)), borderWidth: 0 }],
      { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => '₹' + v, color: '#666', font: { family: 'DM Mono', size: 9 } }, grid: { color: '#f0f0f0' } }, x: { ticks: { color: '#666', font: { family: 'DM Mono', size: 9 } }, grid: { color: '#f0f0f0' } } } });
  }

  // Device charts
  const dv = LIVE_DATA.devices;
  if (dv.length > 0) {
    mkChart('ch-device-roas', 'bar', dv.map(d => d.name),
      [{ data: dv.map(d => parseFloat(d.roas.toFixed(2))), backgroundColor: dv.map(d => roasColor(d.roas)), borderWidth: 0 }],
      { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => v + 'x', color: '#666', font: { family: 'DM Mono', size: 9 } }, grid: { color: '#f0f0f0' } }, x: { ticks: { color: '#666', font: { family: 'DM Mono', size: 9 } }, grid: { color: '#f0f0f0' } } } });
  }

  // Hourly charts
  const hr = LIVE_DATA.hourly;
  if (hr.length > 0) {
    const minCPM = Math.min(...hr.map(h => h.cpm).filter(v => v > 0));
    const maxCPM = Math.max(...hr.map(h => h.cpm));
    mkChart('ch-daypart-cpm', 'bar', hr.map(h => h.label),
      [{ data: hr.map(h => h.cpm), backgroundColor: hr.map(h => { const pct = maxCPM > minCPM ? (h.cpm - minCPM) / (maxCPM - minCPM) : 0.5; const r = Math.round(30 + pct * 180), g = Math.round(122 - pct * 80); return `rgba(${r},${g},68,0.8)`; }), borderWidth: 0 }],
      { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => '₹' + v, color: '#666', font: { family: 'DM Mono', size: 9 } }, grid: { color: '#f0f0f0' } }, x: { ticks: { color: '#666', font: { family: 'DM Mono', size: 8 } }, grid: { color: '#f0f0f0' } } } });
    mkChart('ch-daypart-pur', 'bar', hr.map(h => h.label),
      [{ data: hr.map(h => h.purchases), backgroundColor: hr.map(h => h.purchases >= 4 ? '#1e7a45' : h.purchases >= 2 ? '#4a9e6a' : h.purchases >= 1 ? '#90c9a8' : '#e8f5ee'), borderWidth: 0 }],
      { plugins: { legend: { display: false } }, scales: { y: { ticks: { stepSize: 1, color: '#666', font: { family: 'DM Mono', size: 9 } }, grid: { color: '#f0f0f0' } }, x: { ticks: { color: '#666', font: { family: 'DM Mono', size: 8 } }, grid: { color: '#f0f0f0' } } } });
  }

  // Age/gender table
  const ag = LIVE_DATA.ageGender;
  const agTbl = document.getElementById('age-gender-tbl');
  if (ag.length > 0 && agTbl) {
    const sorted = [...ag].map(r => ({
      age: r.age, gender: r.gender,
      spend: parseFloat(r.spend) || 0,
      roas: r.purchase_roas ? parseFloat(r.purchase_roas[0]?.value || r.purchase_roas) : 0,
      cpm: parseFloat(r.cpm) || 0,
      ctr: parseFloat(r.ctr) || 0,
      purchases: getActions(r.actions, 'omni_purchase'),
      impressions: parseInt(r.impressions) || 0
    })).sort((a, b) => b.roas - a.roas);
    agTbl.innerHTML = sorted.map(r => {
      const bg = r.roas >= 7 ? '#e8f5ee' : r.roas >= 4 ? '#eff6ff' : r.roas >= 1 ? '#fffbeb' : '#fff';
      const rc = r.roas >= 7 ? '#1e7a45' : r.roas >= 4 ? '#1a6bb5' : r.roas >= 1 ? '#b85c00' : '#666';
      return '<tr style="background:' + bg + '"><td style="font-weight:600">' + r.age + '</td><td style="text-transform:capitalize">' + r.gender + '</td><td>' + INR(r.spend) + '</td><td style="color:' + rc + ';font-weight:700">' + (r.roas > 0 ? r.roas.toFixed(2) + 'x' : '--') + '</td><td style="color:' + cpmColor(r.cpm) + '">' + INR(r.cpm) + '</td><td>' + PCT(r.ctr) + '</td><td>' + r.purchases + '</td><td style="font-family:var(--mono);font-size:.72rem">' + r.impressions.toLocaleString('en-IN') + '</td></tr>';
    }).join('');
  }

  // Daily pacing alerts
  const dailyAll = LIVE_DATA.allDaily;
  const paEl = document.getElementById('pacing-alerts');
  if (dailyAll.length > 0 && paEl) {
    const byDate = {};
    dailyAll.forEach(d => {
      if (!byDate[d.date]) byDate[d.date] = { spend: 0, revenue: 0, purchases: 0 };
      byDate[d.date].spend += d.spend;
      byDate[d.date].purchases += d.purchases;
      byDate[d.date].revenue += d.roas * d.spend;
    });
    const days = Object.entries(byDate).map(([date, d]) => ({ date, ...d, roas: d.spend > 0 ? d.revenue / d.spend : 0 })).sort((a, b) => new Date(a.date) - new Date(b.date));
    const worst = days.reduce((a, b) => b.roas < a.roas ? b : a);
    const best = days.reduce((a, b) => b.roas > a.roas ? b : a);
    const avgSpend = days.reduce((s, d) => s + d.spend, 0) / days.length;
    const fmt = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
    paEl.innerHTML =
      '<div class="alert-card alert-warn"><div class="alert-icon">⚠</div><div><div class="alert-title">Worst day: ' + fmt(worst.date) + ' — ' + worst.roas.toFixed(2) + 'x ROAS</div><div class="alert-body">' + INR(worst.spend) + ' spent for ' + worst.purchases + ' purchases. Review what changed that day.</div></div></div>'
      + '<div class="alert-card alert-good"><div class="alert-icon">✓</div><div><div class="alert-title">Best day: ' + fmt(best.date) + ' — ' + best.roas.toFixed(2) + 'x ROAS</div><div class="alert-body">' + INR(best.spend) + ' spent for ' + best.purchases + ' purchases. Scale on similar days.</div></div></div>'
      + '<div class="alert-card alert-info"><div class="alert-icon">ℹ</div><div><div class="alert-title">Avg daily spend: ' + INR(avgSpend) + '</div><div class="alert-body">Range: ' + INR(Math.min(...days.map(d => d.spend))) + ' – ' + INR(Math.max(...days.map(d => d.spend))) + '. Consider weekly budget for smoother pacing.</div></div></div>';
  }

  // Placement table
  const plTbl = document.getElementById('placement-live-tbody');
  if (pl.length > 0 && plTbl) {
    const rc2 = r => r >= 5 ? '#1e7a45' : r >= 2 ? '#1a6bb5' : r > 0 ? '#c97a18' : '#999';
    const vt = r => r >= 5 ? '▲ SCALE' : r >= 2 ? '→ HOLD' : r > 0 ? '◎ WATCH' : '✕ NO CONV';
    plTbl.innerHTML = pl.map(p =>
      '<tr><td style="font-weight:600">' + p.name + '</td><td><span style="font-family:var(--mono);font-size:.65rem;padding:2px 6px;border-radius:3px;background:#f0f2f5">' + p.platform + '</span></td>'
      + '<td>' + FMT(p.impressions) + '</td><td>' + INR(p.spend) + '</td><td>' + p.purchases + '</td>'
      + '<td style="font-weight:700;color:' + rc2(p.roas) + '">' + p.roas.toFixed(2) + 'x</td>'
      + '<td style="color:' + cpmColor(p.cpm) + '">₹' + Math.round(p.cpm) + '</td>'
      + '<td>' + p.ctr.toFixed(2) + '%</td>'
      + '<td style="font-family:var(--mono);font-size:.68rem;font-weight:600;color:' + rc2(p.roas) + '">' + vt(p.roas) + '</td></tr>'
    ).join('');
  }
}

// ── Recommendations ────────────────────────────────────────────────────────────
function renderRecs() {
  const camps = getCamps();
  const worstROAS = [...camps].sort((a, b) => a.roas - b.roas)[0];
  const bestROAS = [...camps].sort((a, b) => b.roas - a.roas)[0];
  const totalSpend = camps.reduce((s, c) => s + c.spend, 0);

  // Dynamic recs based on live data
  const recs = [];

  // Scale winners
  camps.filter(c => c.roas >= 4 && c.status === 'active').forEach(c => {
    recs.push({ p: 'urgent', sec: 'Scale Winners', icon: '▲', title: 'Scale ' + c.sn.split('_')[0] + ' — ' + c.roas.toFixed(2) + 'x ROAS at ₹' + Math.round(c.cpm) + ' CPM', why: '<strong>' + c.roas.toFixed(2) + 'x ROAS at ₹' + Math.round(c.cpm) + ' CPM</strong>, freq ' + c.freq.toFixed(2) + 'x — room to scale.', action: 'Increase budget +30% for 72h. Monitor CPM. If stays below ₹' + Math.round(c.cpm * 1.3) + ', scale another +20%.', impact: 'Est. +₹' + Math.round(c.revenue * 0.3 / 1000) + 'k additional weekly revenue' });
  });

  // Reduce waste
  camps.filter(c => c.roas < 2 && c.spend > 300).forEach(c => {
    recs.push({ p: 'urgent', sec: 'Reduce Waste', icon: '✕', title: 'Kill ' + c.sn.split('_')[0] + ' — ' + c.roas.toFixed(2) + 'x ROAS', why: '<strong>' + c.roas.toFixed(2) + 'x ROAS</strong> — below break-even floor of 2x. ₹' + Math.round(c.spend) + ' spent this week.', action: 'Pause now. Redirect ₹' + Math.round(c.spend / 7) + '/day to best-performing campaign.', impact: 'Save ₹' + Math.round(c.spend / 7) + '/day' });
  });

  // High frequency
  camps.filter(c => c.freq > 2 && c.status === 'active').forEach(c => {
    recs.push({ p: 'high', sec: 'Creative Refresh', icon: '🔄', title: c.sn.split('_')[0] + ' frequency ' + c.freq.toFixed(2) + 'x — refresh creative', why: 'Frequency above 2x threshold. CTR likely declining. Audience fatiguing.', action: 'Shoot 2 new variants this week. Set frequency cap: max 3x/week in adset.', impact: 'Prevent CPM spike from ₹' + Math.round(c.cpm) + ' to ₹' + Math.round(c.cpm * 1.5) + '+' });
  });

  // Checkout fix
  const totalCO = camps.reduce((s, c) => s + c.checkouts, 0);
  const totalPur = camps.reduce((s, c) => s + c.purchases, 0);
  if (totalCO > 0 && totalPur / totalCO < 0.4) {
    const cvr = (totalPur / totalCO * 100).toFixed(1);
    recs.push({ p: 'high', sec: 'Winning Product Angles', icon: '📌', title: 'Fix checkout drop-off — only ' + cvr + '% convert', why: '<strong>' + (100 - parseFloat(cvr)).toFixed(0) + '% of checkout initiations abandon.</strong> Not a Meta issue — site/UX friction.', action: '1. Show COD fee upfront. 2. Add Microsoft Clarity. 3. Test ₹30 prepaid discount popup at checkout.', impact: cvr + '% → 50% CVR = revenue doubles with zero extra ad spend' });
  }

  // Default if no dynamic issues
  if (recs.length === 0) {
    recs.push({ p: 'high', sec: 'Scale Winners', icon: '▲', title: 'Account performing well — scale top campaigns', why: 'All active campaigns within acceptable ROAS range.', action: 'Increase top campaign budget by 20% and monitor for 72 hours.', impact: '+20% revenue at maintained ROAS' });
  }

  const sections = [...new Set(recs.map(r => r.sec))];
  document.getElementById('rec-cards').innerHTML = sections.map(sec => {
    const items = recs.filter(r => r.sec === sec);
    return '<div style="margin-bottom:1.75rem"><div style="font-family:var(--mono);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:.75rem;padding-bottom:.5rem;border-bottom:1px solid var(--border)">' + sec + '</div>'
      + items.map(r => '<div class="rec-card ' + r.p + '"><span class="rec-priority ' + r.p + '">' + r.p.toUpperCase() + '</span><div class="rec-title">' + r.icon + ' ' + r.title + '</div><div class="rec-why">' + r.why + '</div><div class="rec-action">' + r.action + '</div><div class="rec-impact">↑ ' + r.impact + '</div></div>').join('')
      + '</div>';
  }).join('');
}

function shareRecs() {
  let text = 'KAI Performance Hub — Recommendations\n' + new Date().toLocaleDateString('en-IN') + '\n\n';
  document.querySelectorAll('.rec-card').forEach(card => {
    const t = card.querySelector('.rec-title');
    const a = card.querySelector('.rec-action');
    const i = card.querySelector('.rec-impact');
    if (t) text += t.textContent.trim() + '\n';
    if (a) text += 'Action: ' + a.textContent.trim() + '\n';
    if (i) text += i.textContent.trim() + '\n\n';
  });
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('share-rec-btn');
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = '📄 Share'; }, 2000); }
  });
}

async function genAIRecs() {
  const gKey = cfg.geminiKey || GEMINI_KEY;
  const btn = document.getElementById('ai-rec-btn'); btn.disabled = true; btn.textContent = 'Analysing...';
  const out = document.getElementById('ai-rec-text'); const sec = document.getElementById('ai-rec-output');
  sec.style.display = 'block'; out.innerHTML = ''; out.classList.add('cur');
  const camps = getCamps();
  const campSum = camps.map(c => c.sn.split('_')[0] + ' [' + c.status.toUpperCase() + ']: ₹' + Math.round(c.spend) + ' | ₹' + Math.round(c.revenue) + ' rev | ' + c.roas.toFixed(2) + 'x ROAS | CPM ₹' + Math.round(c.cpm) + ' | freq ' + c.freq.toFixed(2) + 'x').join('\n');
  const prompt = 'You are the CMO advisor for KAI by Hustle (hustlewithkai.com) — India D2C activewear/streetwear.\n\nLIVE CAMPAIGNS (last 7 days):\n' + campSum + '\n\nCOMPETITORS: Wear Comet, Gully Labs, WTFlex, Bluorng, Farak\nFLOORS: Hold 2.0x ROAS | Scale +30%: 3.5x | Scale +80%: 4.5x\n\nProvide:\n# IMMEDIATE ACTIONS (₹ ranked)\n# BUDGET REALLOCATION TABLE (before vs after ₹/day)\n# CREATIVE BRIEF (next creative to make)\n# 30-DAY FORECAST (conservative vs growth)\n\nBe specific. Use ₹. Cite actual campaign names and data.';
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=' + gKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 2048, temperature: 0.3 } }) });
    const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '', full = '';
    while (true) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop(); for (const line of lines) { if (!line.startsWith('data: ')) continue; const d2 = line.slice(6).trim(); if (!d2 || d2 === '[DONE]') continue; try { const ev = JSON.parse(d2); const chunk = ev.candidates?.[0]?.content?.parts?.[0]?.text || ''; if (chunk) { full += chunk; out.innerHTML = renderMD(full); } } catch {} } }
    out.classList.remove('cur');
  } catch (e) { out.classList.remove('cur'); out.innerHTML += '<p style="color:#c0392b">⚠ ' + e.message + '</p>'; }
  finally { btn.disabled = false; btn.textContent = '✦ AI deep analysis'; }
}

// ── Download Report ────────────────────────────────────────────────────────────
function downloadReport() {
  const camps = getCamps();
  const total = camps.reduce((acc, c) => ({ spend: acc.spend + c.spend, revenue: acc.revenue + c.revenue, purchases: acc.purchases + c.purchases }), { spend: 0, revenue: 0, purchases: 0 });
  const blendedROAS = total.spend > 0 ? (total.revenue / total.spend).toFixed(2) : '0';
  const lines = [];
  lines.push('KAI PERFORMANCE HUB — WEEKLY REPORT (LIVE DATA)');
  lines.push('Generated: ' + new Date().toLocaleString('en-IN'));
  lines.push('Data source: Meta Ads API (real-time)');
  lines.push('='.repeat(60));
  lines.push('');
  lines.push('ACCOUNT SUMMARY (Last 7 days)');
  lines.push('-'.repeat(40));
  lines.push('Total Spend:     ₹' + Math.round(total.spend).toLocaleString('en-IN'));
  lines.push('Total Revenue:   ₹' + Math.round(total.revenue).toLocaleString('en-IN'));
  lines.push('Blended ROAS:    ' + blendedROAS + 'x');
  lines.push('Total Purchases: ' + total.purchases);
  lines.push('');
  lines.push('CAMPAIGN PERFORMANCE');
  lines.push('-'.repeat(40));
  camps.forEach(c => {
    lines.push('');
    lines.push(c.sn + ' [' + c.status.toUpperCase() + ']');
    lines.push('  Spend: ₹' + Math.round(c.spend) + ' | Revenue: ₹' + Math.round(c.revenue) + ' | ROAS: ' + c.roas.toFixed(2) + 'x');
    lines.push('  Purchases: ' + c.purchases + ' | CPM: ₹' + Math.round(c.cpm) + ' | Freq: ' + c.freq.toFixed(2) + 'x | CTR: ' + c.ctr.toFixed(2) + '%');
  });
  lines.push('');
  lines.push('RECOMMENDATIONS');
  lines.push('-'.repeat(40));
  document.querySelectorAll('.rec-card').forEach(card => {
    const t = card.querySelector('.rec-title'); const a = card.querySelector('.rec-action'); const i = card.querySelector('.rec-impact');
    if (t) { lines.push(''); lines.push(t.textContent.trim()); if (a) lines.push('  Action: ' + a.textContent.trim()); if (i) lines.push('  Impact: ' + i.textContent.trim()); }
  });
  lines.push('');
  lines.push('='.repeat(60));
  lines.push('Generated by KAI Performance Hub — hustlewithkai.com');
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const dlnk = document.createElement('a'); dlnk.href = url;
  dlnk.download = 'KAI_Report_' + new Date().toISOString().slice(0, 10) + '.txt';
  document.body.appendChild(dlnk); dlnk.click(); document.body.removeChild(dlnk); URL.revokeObjectURL(url);
}

// ── AI Advisor ─────────────────────────────────────────────────────────────────
const AMODES = { daily: { c: '#1e7a45', t: 'DAILY', p: "Today's situation or just press run" }, weekly: { c: '#1a6bb5', t: 'WEEKLY', p: 'Type "weekly" or add context' }, brief: { c: '#b85c00', t: 'BRIEF', p: 'Describe the campaign need' }, monthly: { c: '#7a1fa2', t: 'MONTHLY', p: 'Add context' } };
const SYS = 'You are the CMO advisor for KAI by Hustle (hustlewithkai.com) — India D2C activewear/streetwear. No fluff. Actionable only.\nFLOORS: Hold 2.0x | Scale +30%: 3.5x | Scale +80%: 4.5x\nCOMPETITORS: Wear Comet, Gully Labs, WTFlex, Bluorng, Farak\nSTYLE: Insight first | ₹ always | Data-cited only';

function buildCtx() {
  const camps = getCamps();
  let ctx = '\n=== LIVE META DATA ===\n';
  camps.forEach(c => { ctx += c.sn + ' [' + c.status.toUpperCase() + ']: ₹' + Math.round(c.spend) + ' | ₹' + Math.round(c.revenue) + ' | ' + c.roas.toFixed(2) + 'x ROAS | CPM ₹' + Math.round(c.cpm) + ' | freq ' + c.freq.toFixed(2) + 'x\n'; });
  return ctx;
}

function renderMD(t) {
  return t.replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^# (.+)$/gm, '<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/^[-=]{3,}$/gm, '<hr>').replace(/\b(STRONG)\b/g, '<span class="bs">$1</span>').replace(/\b(CRITICAL)\b/g, '<span class="bc">$1</span>').replace(/\b(WATCH)\b/g, '<span class="bw">$1</span>').replace(/\n\n/g, '</p><p>').replace(/^([^<\n].*)$/gm, x => x.startsWith('<') ? x : '<p>' + x + '</p>');
}

function sM(m) {
  advMode = m;
  Object.keys(AMODES).forEach(k => { const b = document.getElementById('md-' + k); if (b) { b.classList.toggle('on', k === m); b.style.borderLeftColor = k === m ? AMODES[k].c : 'transparent'; } });
  rAdvTabs();
  const ta = document.getElementById('adv-area'); if (ta) ta.placeholder = AMODES[m].t + ' — ' + AMODES[m].p;
}
function rAdvTabs() {
  const row = document.getElementById('adv-trow'); if (!row) return;
  row.innerHTML = Object.entries(AMODES).map(([id, mo]) => '<button class="tbtn' + (id === advMode ? ' on' : '') + '" onclick="sM(\'' + id + '\')" style="' + (id === advMode ? 'color:' + mo.c + ';border-color:' + mo.c + ';background:#f5f5f5' : '') + '">' + mo.t + '</button>').join('');
}

async function runAdv() {
  const inp = document.getElementById('adv-area'), input = inp && inp.value.trim();
  if (!input || isStr) return;
  const gKey = cfg.geminiKey || GEMINI_KEY;
  const ctx = buildCtx();
  const msg = advMode.toUpperCase() + ' — ' + ctx + '\nNotes:\n' + input;
  inp.value = ''; isStr = true; fo = '';
  document.getElementById('adv-empty').style.display = 'none';
  document.getElementById('adv-oc').style.display = 'block';
  document.getElementById('adv-oact').style.display = 'none';
  document.getElementById('adv-stpb').style.display = 'block';
  document.getElementById('run-btn').disabled = true;
  const mo = AMODES[advMode];
  document.getElementById('adv-omi').innerHTML = '<span style="color:' + mo.c + '">◈</span>';
  document.getElementById('adv-oml').textContent = mo.t;
  document.getElementById('adv-oml').style.color = mo.c;
  document.getElementById('adv-otm').textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const otxt = document.getElementById('adv-otxt'); otxt.innerHTML = ''; otxt.classList.add('cur');
  const msgs = [{ role: 'user', parts: [{ text: SYS + '\nReady?' }] }, { role: 'model', parts: [{ text: 'KAI ready.' }] }]
    .concat(aHist.slice(-6).map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })))
    .concat([{ role: 'user', parts: [{ text: msg }] }]);
  sc = new AbortController();
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=' + gKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: msgs, generationConfig: { maxOutputTokens: 8192, temperature: 0.3 } }), signal: sc.signal });
    if (!res.ok) { const e2 = await res.json(); throw new Error(e2.error?.message || 'Error ' + res.status); }
    const reader = res.body.getReader(), dec = new TextDecoder(); let buf = '';
    while (true) { const rd = await reader.read(); if (rd.done) break; buf += dec.decode(rd.value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop(); for (const line of lines) { if (!line.startsWith('data: ')) continue; const d2 = line.slice(6).trim(); if (!d2 || d2 === '[DONE]') continue; try { const ev = JSON.parse(d2); const chunk = ev.candidates?.[0]?.content?.parts?.[0]?.text || ''; if (chunk) { fo += chunk; otxt.innerHTML = renderMD(fo); document.getElementById('adv-out').scrollTop = document.getElementById('adv-out').scrollHeight; } } catch (ignored) {} } }
    otxt.classList.remove('cur'); aHist.push({ role: 'user', content: input }, { role: 'assistant', content: fo });
  } catch (e) { if (e.name !== 'AbortError') { otxt.classList.remove('cur'); otxt.innerHTML += '<p style="color:#c0392b">⚠ ' + e.message + '</p>'; } }
  finally { isStr = false; document.getElementById('adv-stpb').style.display = 'none'; document.getElementById('run-btn').disabled = false; otxt.classList.remove('cur'); document.getElementById('adv-oact').style.display = 'flex'; }
}
function stp() { if (sc) sc.abort(); }
function cpO() { if (!fo) return; navigator.clipboard.writeText(fo); const b = document.getElementById('adv-cpb'); b.textContent = 'Copied!'; setTimeout(() => { b.textContent = 'Copy'; }, 1800); }
function clrO() { document.getElementById('adv-oc').style.display = 'none'; document.getElementById('adv-empty').style.display = 'block'; fo = ''; }

// ── Settings ───────────────────────────────────────────────────────────────────
function oS() { document.getElementById('c0').value = cfg.geminiKey || ''; document.getElementById('sov').classList.add('op'); }
function cS() { document.getElementById('sov').classList.remove('op'); }
function svS() {
  const key = document.getElementById('c0').value.trim();
  sC({ geminiKey: key });
  const b = document.getElementById('csb'); b.textContent = 'Saved ✓'; b.style.background = 'var(--green)';
  setTimeout(() => { b.textContent = 'Save'; b.style.background = ''; cS(); }, 1500);
}

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); if (document.getElementById('view-advisor').classList.contains('active')) runAdv(); }
  if (e.key === 'Escape') { cS(); }
});
document.getElementById('adv-area').addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); runAdv(); }
});

// ── Init ───────────────────────────────────────────────────────────────────────
async function init() {
  document.getElementById('tdate').textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  sM('daily'); rAdvTabs();
  // Pre-render with fallback data immediately
  refreshDash();
  renderRecs();
  // Then load live data and re-render
  try {
    await loadLiveData();
    // Update activeCampaigns with live data
    if (LIVE_DATA && LIVE_DATA.campaigns.length > 0) {
      activeCampaigns = LIVE_DATA.campaigns;
    }
    refreshDash();
    renderRecs();
  } catch (err) {
    console.warn('Live data failed, using fallback:', err.message);
    // Fallback already rendered
  }
}
init();
