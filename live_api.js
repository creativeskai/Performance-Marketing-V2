// ── Live Meta API Layer ────────────────────────────────────────────────────────
// All calls go through /api/meta serverless proxy — token never in browser

const API = '/api/meta';
const GEMINI_KEY = 'AIzaSyCyXiTv4JoRvcXDfzxwexhFwbDIEaXK9BA';

// Cache in memory for session
const _cache = {};
async function fetchMeta(endpoint) {
  if (_cache[endpoint]) return _cache[endpoint];
  const res = await fetch(`${API}?endpoint=${endpoint}`);
  if (!res.ok) throw new Error(`Meta API ${endpoint} failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || data.error);
  _cache[endpoint] = data;
  return data;
}

// ── Data normalisation ─────────────────────────────────────────────────────────
function getActions(actions, type) {
  if (!actions || !Array.isArray(actions)) return 0;
  const a = actions.find(x => x.action_type === type || x.action_type === 'omni_purchase');
  return a ? parseFloat(a.value) || 0 : 0;
}

function normaliseCampaign(ins, camp) {
  const spend = parseFloat(ins.spend) || 0;
  const impressions = parseInt(ins.impressions) || 0;
  const purchases = getActions(ins.actions, 'omni_purchase') || getActions(ins.actions, 'purchase');
  const atc = getActions(ins.actions, 'add_to_cart');
  const checkouts = getActions(ins.actions, 'initiate_checkout');
  const roas = ins.purchase_roas ? parseFloat(ins.purchase_roas[0]?.value || ins.purchase_roas) : (spend > 0 && purchases > 0 ? (purchases * 850) / spend : 0);
  const revenue = roas * spend;
  return {
    id: ins.campaign_id || camp?.id,
    sn: ins.campaign_name || camp?.name || 'Unknown',
    product: guessProduct(ins.campaign_name || camp?.name || ''),
    spend, revenue, purchases,
    atc: atc || Math.round(purchases * 7),
    checkouts: checkouts || Math.round(purchases * 4.5),
    reach: parseInt(ins.reach) || 0,
    impressions,
    cpm: parseFloat(ins.cpm) || 0,
    freq: parseFloat(ins.frequency) || 1,
    ctr: parseFloat(ins.ctr) || 0,
    lpv: Math.round((parseInt(ins.clicks) || 0) * 0.7),
    cpp: purchases > 0 ? spend / purchases : 0,
    status: camp?.effective_status?.toLowerCase() || 'active',
    color: campaignColor(ins.campaign_name || ''),
    roas
  };
}

function guessProduct(name) {
  const n = name.toLowerCase();
  if (n.includes('kabuto') || n.includes('cap')) return 'Kabuto Cap';
  if (n.includes('bundle') || n.includes('combo') || n.includes('tee_combo')) return 'Bundle';
  if (n.includes('retarget') || n.includes('kage')) return 'Kage Tee';
  return 'Kage Tee';
}

function campaignColor(name) {
  const n = name.toLowerCase();
  if (n.includes('kabuto')) return '#1e7a45';
  if (n.includes('retarget')) return '#b85c00';
  return '#1a6bb5';
}

// ── Main data loader ───────────────────────────────────────────────────────────
let LIVE_DATA = null;
let LIVE_LOADED = false;
let LIVE_ERROR = null;

async function loadLiveData() {
  setStatus('loading');
  try {
    // Fire all requests in parallel
    const [ins7d, insDaily, camps, insPlace, insDev, insAge, insHourly] = await Promise.all([
      fetchMeta('insights_7d'),
      fetchMeta('insights_daily'),
      fetchMeta('campaigns'),
      fetchMeta('insights_placement').catch(() => ({ data: [] })),
      fetchMeta('insights_device').catch(() => ({ data: [] })),
      fetchMeta('insights_age').catch(() => ({ data: [] })),
      fetchMeta('insights_hourly').catch(() => ({ data: [] }))
    ]);

    // Build campaign map
    const campMap = {};
    if (camps.data) camps.data.forEach(c => { campMap[c.id] = c; });

    // Filter to SALES campaigns only with spend > 0
    const activeSales = (ins7d.data || []).filter(i => {
      const c = campMap[i.campaign_id];
      if (!c) return false;
      const isLinkClick = c.objective === 'LINK_CLICKS' || c.objective === 'OUTCOME_AWARENESS' || c.objective === 'OUTCOME_LEADS';
      return !isLinkClick && (parseFloat(i.spend) > 0);
    });

    const campaigns = activeSales.map(i => normaliseCampaign(i, campMap[i.campaign_id]));

    // Sort by spend desc
    campaigns.sort((a, b) => b.spend - a.spend);

    // Build daily pacing per campaign
    const dailyMap = {};
    if (insDaily.data) {
      insDaily.data.forEach(row => {
        const cid = row.campaign_id;
        const c = campMap[cid];
        if (!c || c.objective === 'LINK_CLICKS') return;
        if (parseFloat(row.spend) <= 0) return;
        if (!dailyMap[cid]) dailyMap[cid] = [];
        dailyMap[cid].push({
          date: row.date_start,
          spend: parseFloat(row.spend) || 0,
          roas: row.purchase_roas ? parseFloat(row.purchase_roas[0]?.value || row.purchase_roas) : 0,
          purchases: getActions(row.actions, 'omni_purchase'),
          cpm: parseFloat(row.cpm) || 0
        });
      });
    }

    // Account totals
    const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
    const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
    const totalPurchases = campaigns.reduce((s, c) => s + c.purchases, 0);
    const blendedROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    // Weekly history from daily data (group by week)
    const allDaily = Object.values(dailyMap).flat();
    allDaily.sort((a, b) => new Date(a.date) - new Date(b.date));

    LIVE_DATA = {
      fetchedAt: new Date().toISOString(),
      period: 'last_7d',
      campaigns,
      dailyMap,
      allDaily,
      totals: { totalSpend, totalRevenue, totalPurchases, blendedROAS },
      placements: normalisePlacements(insPlace.data || []),
      devices: normaliseDevices(insDev.data || []),
      ageGender: insAge.data || [],
      hourly: normaliseHourly(insHourly.data || []),
      campMap
    };

    LIVE_LOADED = true;
    LIVE_ERROR = null;
    setStatus('live');
    return LIVE_DATA;

  } catch (err) {
    LIVE_ERROR = err.message;
    setStatus('error', err.message);
    console.error('Live data load failed:', err);
    throw err;
  }
}

function normalisePlacements(data) {
  return data.map(p => ({
    name: formatPlacementName(p.publisher_platform, p.platform_position),
    platform: p.publisher_platform || '',
    impressions: parseInt(p.impressions) || 0,
    spend: parseFloat(p.spend) || 0,
    purchases: getActions(p.actions, 'omni_purchase'),
    roas: p.purchase_roas ? parseFloat(p.purchase_roas[0]?.value || p.purchase_roas) : 0,
    cpm: parseFloat(p.cpm) || 0,
    ctr: parseFloat(p.ctr) || 0
  })).filter(p => p.impressions > 100).sort((a, b) => b.impressions - a.impressions);
}

function formatPlacementName(platform, position) {
  const map = {
    'instagram_reels': 'IG Reels', 'instagram_stories': 'IG Stories',
    'feed': platform === 'instagram' ? 'IG Feed' : 'FB Feed',
    'facebook_reels': 'FB Reels', 'threads_feed': 'Threads',
    'facebook_stories': 'FB Stories', 'instagram_explore_grid_home': 'IG Explore'
  };
  return map[position] || `${platform} ${position}`.replace(/_/g, ' ');
}

function normaliseDevices(data) {
  return data.map(d => ({
    name: formatDeviceName(d.impression_device),
    device: d.impression_device,
    impressions: parseInt(d.impressions) || 0,
    spend: parseFloat(d.spend) || 0,
    purchases: getActions(d.actions, 'omni_purchase'),
    roas: d.purchase_roas ? parseFloat(d.purchase_roas[0]?.value || d.purchase_roas) : 0,
    cpm: parseFloat(d.cpm) || 0
  })).filter(d => d.impressions > 50).sort((a, b) => b.spend - a.spend);
}

function formatDeviceName(d) {
  const map = { iphone: 'iPhone', android_smartphone: 'Android', ipad: 'iPad', android_tablet: 'Android Tablet', desktop: 'Desktop', other: 'Other' };
  return map[d] || d;
}

function normaliseHourly(data) {
  return data.map(h => ({
    h: h.hourly_stats_aggregated_by_advertiser_time_zone || '00',
    label: formatHour(h.hourly_stats_aggregated_by_advertiser_time_zone),
    cpm: parseFloat(h.cpm) || 0,
    ctr: parseFloat(h.ctr) || 0,
    purchases: getActions(h.actions, 'omni_purchase'),
    spend: parseFloat(h.spend) || 0,
    impressions: parseInt(h.impressions) || 0
  })).sort((a, b) => parseInt(a.h) - parseInt(b.h));
}

function formatHour(h) {
  if (!h) return '12am';
  const n = parseInt(h);
  if (n === 0) return '12am';
  if (n < 12) return n + 'am';
  if (n === 12) return '12pm';
  return (n - 12) + 'pm';
}

function setStatus(state, msg) {
  const dot = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  if (!dot || !label) return;
  if (state === 'loading') {
    dot.style.background = '#c97a18';
    dot.style.animation = 'pulse 1s ease infinite';
    label.textContent = 'Loading live data...';
  } else if (state === 'live') {
    dot.style.background = '#1e7a45';
    dot.style.animation = '';
    const d = LIVE_DATA;
    const ts = new Date(d.fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    label.textContent = `Meta live · ${d.campaigns.length} campaigns · ${ts}`;
  } else if (state === 'error') {
    dot.style.background = '#c0392b';
    dot.style.animation = '';
    label.textContent = 'API error — check token';
    const errEl = document.getElementById('live-error-banner');
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = '⚠ ' + msg; }
  }
}
