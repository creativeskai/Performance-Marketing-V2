// ── Live Meta API Layer ────────────────────────────────────────────────────────
// Data pulled from Meta API on 25 May 2026 via Claude MCP connection
// Next update: refresh this file by asking Claude to pull fresh Meta data

const GEMINI_KEY = 'AIzaSyCyXiTv4JoRvcXDfzxwexhFwbDIEaXK9BA';
const DATA_FETCHED_AT = '2026-05-25';

// ── Campaigns (May 18-24, 2026 — live from Meta API) ──────────────────────────
const LIVE_CAMPAIGNS = [
  {
    id: 'kage', sn: 'Kage_12052026', product: 'Kage Tee',
    spend: 6296.34, revenue: 41804.7, purchases: 29, roas: 6.64,
    atc: 203, checkouts: 130, reach: 108207, impressions: 168680,
    cpm: 37.33, freq: 1.56, ctr: 2.96, lpv: 3496, cpp: 217,
    status: 'active', color: '#1a6bb5'
  },
  {
    id: 'retarget', sn: 'Kage_Retargeting_16052025', product: 'Kage Tee',
    spend: 1857.97, revenue: 16981.8, purchases: 6, roas: 9.14,
    atc: 42, checkouts: 27, reach: 8589, impressions: 15415,
    cpm: 120.53, freq: 1.79, ctr: 2.91, lpv: 314, cpp: 310,
    status: 'active', color: '#b85c00'
  },
  {
    id: 'kabuto', sn: 'Kabuto_Caps_24042026', product: 'Kabuto Cap',
    spend: 565.06, revenue: 3187.0, purchases: 4, roas: 5.64,
    atc: 28, checkouts: 18, reach: 16095, impressions: 18258,
    cpm: 30.94, freq: 1.13, ctr: 2.14, lpv: 391, cpp: 141,
    status: 'active', color: '#1e7a45'
  }
];

// ── Daily pacing (May 18-24, per campaign — live from Meta API) ───────────────
const DAILY_PACING = [
  { date: 'May 18', day: 'Sun', spend: 1108.27, revenue: 11391.9, purchases: 13, roas: 10.28, cpm: 53.2 },
  { date: 'May 19', day: 'Mon', spend: 651.99,  revenue: 1933.1,  purchases: 3,  roas: 2.96,  cpm: 45.1 },
  { date: 'May 20', day: 'Tue', spend: 1227.74, revenue: 1721.1,  purchases: 3,  roas: 1.40,  cpm: 44.8 },
  { date: 'May 21', day: 'Wed', spend: 965.42,  revenue: 1891.4,  purchases: 2,  roas: 1.96,  cpm: 45.2 },
  { date: 'May 22', day: 'Thu', spend: 1385.27, revenue: 11656.3, purchases: 6,  roas: 8.41,  cpm: 47.4 },
  { date: 'May 23', day: 'Fri', spend: 1224.00, revenue: 7437.5,  purchases: 6,  roas: 6.08,  cpm: 34.2 },
  { date: 'May 24', day: 'Sat', spend: 1576.05, revenue: 15760.5, purchases: 7,  roas: 10.00, cpm: 27.4 }
];

// ── Placement breakdown (live from Meta API) ──────────────────────────────────
const PLACEMENTS = [
  { name: 'IG Reels',    platform: 'instagram', impressions: 106877, spend: 3543.91, purchases: 26, roas: 6.64,  cpm: 33.16,  ctr: 2.10 },
  { name: 'IG Stories',  platform: 'instagram', impressions: 13554,  spend: 1515.36, purchases: 5,  roas: 7.73,  cpm: 111.80, ctr: 5.42 },
  { name: 'IG Feed',     platform: 'instagram', impressions: 19639,  spend: 2318.88, purchases: 6,  roas: 5.18,  cpm: 118.08, ctr: 3.07 },
  { name: 'Threads',     platform: 'threads',   impressions: 724,    spend: 30.36,   purchases: 1,  roas: 45.0,  cpm: 41.93,  ctr: 1.93 },
  { name: 'FB Reels',    platform: 'facebook',  impressions: 3591,   spend: 221.95,  purchases: 0,  roas: 0,     cpm: 61.81,  ctr: 3.12 },
  { name: 'FB Feed',     platform: 'facebook',  impressions: 1291,   spend: 193.23,  purchases: 0,  roas: 0,     cpm: 149.67, ctr: 2.32 }
];

// ── Device breakdown (live from Meta API) ─────────────────────────────────────
const DEVICES = [
  { name: 'iPhone',   device: 'iphone',            impressions: 47177, spend: 3305.43, purchases: 20, roas: 9.73, cpm: 70.06 },
  { name: 'Android',  device: 'android_smartphone', impressions: 99732, spend: 4530.39, purchases: 18, roas: 3.63, cpm: 45.43 },
  { name: 'iPad',     device: 'ipad',               impressions: 478,   spend: 17.64,   purchases: 0,  roas: 0,    cpm: 36.90 },
  { name: 'Desktop',  device: 'desktop',            impressions: 151,   spend: 11.45,   purchases: 0,  roas: 0,    cpm: 75.83 }
];

// ── Age / gender (live from Meta API) ─────────────────────────────────────────
const AGE_GENDER = [
  { age: '18-24', gender: 'male',   impressions: 72221, spend: 2529.77, purchases: 9,  roas: 3.12,   cpm: 35.03,  ctr: 2.31 },
  { age: '25-34', gender: 'male',   impressions: 60140, spend: 3777.97, purchases: 21, roas: 7.13,   cpm: 62.82,  ctr: 2.64 },
  { age: '35-44', gender: 'male',   impressions: 9372,  spend: 1089.65, purchases: 5,  roas: 5.08,   cpm: 116.27, ctr: 3.35 },
  { age: '18-24', gender: 'female', impressions: 1330,  spend: 53.11,   purchases: 1,  roas: 13.16,  cpm: 39.93,  ctr: 1.58 },
  { age: '25-34', gender: 'female', impressions: 1007,  spend: 83.83,   purchases: 1,  roas: 8.34,   cpm: 83.25,  ctr: 4.17 },
  { age: '35-44', gender: 'female', impressions: 226,   spend: 25.55,   purchases: 1,  roas: 267.95, cpm: 113.05, ctr: 7.52 },
  { age: '45-54', gender: 'male',   impressions: 2261,  spend: 224.86,  purchases: 0,  roas: 0,      cpm: 99.45,  ctr: 4.07 },
  { age: '55-64', gender: 'male',   impressions: 528,   spend: 41.67,   purchases: 0,  roas: 0,      cpm: 78.92,  ctr: 1.70 }
];

// ── Hourly (live from Meta API) ───────────────────────────────────────────────
const HOURLY = [
  {h:'00',label:'12am',cpm:45.67,ctr:2.17,purchases:2,spend:449},{h:'01',label:'1am', cpm:49.10,ctr:2.18,purchases:0,spend:290},
  {h:'02',label:'2am', cpm:40.00,ctr:1.66,purchases:1,spend:164},{h:'03',label:'3am', cpm:52.01,ctr:2.48,purchases:0,spend:97},
  {h:'04',label:'4am', cpm:41.44,ctr:2.25,purchases:0,spend:59}, {h:'05',label:'5am', cpm:57.69,ctr:2.09,purchases:0,spend:63},
  {h:'06',label:'6am', cpm:66.26,ctr:2.79,purchases:2,spend:107},{h:'07',label:'7am', cpm:50.76,ctr:2.74,purchases:0,spend:159},
  {h:'08',label:'8am', cpm:55.16,ctr:2.58,purchases:0,spend:282},{h:'09',label:'9am', cpm:56.36,ctr:2.34,purchases:2,spend:400},
  {h:'10',label:'10am',cpm:58.74,ctr:2.74,purchases:2,spend:488},{h:'11',label:'11am',cpm:59.46,ctr:2.77,purchases:4,spend:523},
  {h:'12',label:'12pm',cpm:58.93,ctr:2.80,purchases:4,spend:512},{h:'13',label:'1pm', cpm:59.24,ctr:2.49,purchases:4,spend:486},
  {h:'14',label:'2pm', cpm:57.96,ctr:2.38,purchases:4,spend:394},{h:'15',label:'3pm', cpm:56.15,ctr:2.80,purchases:1,spend:377},
  {h:'16',label:'4pm', cpm:60.46,ctr:2.85,purchases:1,spend:367},{h:'17',label:'5pm', cpm:52.89,ctr:3.05,purchases:1,spend:312},
  {h:'18',label:'6pm', cpm:47.68,ctr:2.18,purchases:2,spend:416},{h:'19',label:'7pm', cpm:49.37,ctr:2.78,purchases:2,spend:420},
  {h:'20',label:'8pm', cpm:51.78,ctr:2.71,purchases:0,spend:356},{h:'21',label:'9pm', cpm:49.07,ctr:2.76,purchases:1,spend:372},
  {h:'22',label:'10pm',cpm:50.05,ctr:2.46,purchases:2,spend:410},{h:'23',label:'11pm',cpm:52.02,ctr:2.53,purchases:3,spend:397}
];

// ── Expose to app.js ──────────────────────────────────────────────────────────
let LIVE_DATA = null;
let LIVE_LOADED = false;
let LIVE_ERROR = null;

async function loadLiveData() {
  // Data is already embedded — no API call needed
  // This runs instantly, no 404 errors
  LIVE_DATA = {
    fetchedAt: DATA_FETCHED_AT,
    campaigns: LIVE_CAMPAIGNS,
    dailyPacing: DAILY_PACING,
    placements: PLACEMENTS,
    devices: DEVICES,
    ageGender: AGE_GENDER,
    hourly: HOURLY,
    allDaily: DAILY_PACING
  };
  LIVE_LOADED = true;
  LIVE_ERROR = null;

  // Update status pill
  const dot = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  const banner = document.getElementById('live-error-banner');
  if (dot) { dot.style.background = '#1e7a45'; dot.style.animation = ''; }
  if (label) label.textContent = 'Meta \u00b7 May 18\u201324, 2026 \u00b7 3 campaigns';
  if (banner) banner.style.display = 'none';

  return LIVE_DATA;
}
