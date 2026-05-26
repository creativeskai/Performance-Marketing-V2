// ── KAI Live Data ─────────────────────────────────────────────────────────────
// Pulled: 26 May 2026 via Meta Ads API (Claude MCP)
// Period: May 19–25, 2026 (last 7 days)
// Account: act_704523148804803 | hustlewithkai.com

const GEMINI_KEY = 'AIzaSyCyXiTv4JoRvcXDfzxwexhFwbDIEaXK9BA';
const DATA_FETCHED_AT = '2026-05-26';
const DATA_PERIOD     = 'May 19\u201325, 2026';

// ── Campaigns ─────────────────────────────────────────────────────────────────
// 3 active SALES campaigns | 0 paused with spend this period
const LIVE_CAMPAIGNS = [
  {
    id: 'kage',
    sn: 'Kage_12052026',
    product: 'Kage Tee',
    spend: 5775.70,
    revenue: 40844.20,  // roas * spend
    purchases: 22,
    roas: 7.07,
    atc: 194,           // estimated: purchases * 8.8 (account ratio)
    checkouts: 99,      // estimated: purchases * 4.5
    reach: 106981,
    impressions: 162485,
    cpm: 35.55,
    freq: 1.52,
    ctr: 3.00,
    lpv: 3407,          // clicks * 0.70
    cpp: 262.53,
    status: 'active',
    color: '#1a6bb5'
  },
  {
    id: 'retarget',
    sn: 'Kage_Retargeting_16052025',
    product: 'Kage Tee',
    spend: 1686.77,
    revenue: 15029.12,  // roas * spend
    purchases: 5,
    roas: 8.91,
    atc: 38,
    checkouts: 23,
    reach: 7675,
    impressions: 13688,
    cpm: 123.23,
    freq: 1.78,
    ctr: 3.00,
    lpv: 287,
    cpp: 337.35,
    status: 'active',
    color: '#b85c00'
  },
  {
    id: 'kabuto',
    sn: 'Kabuto_Caps_24042026',
    product: 'Kabuto Cap',
    spend: 700.59,
    revenue: 3187.68,   // roas * spend
    purchases: 4,
    roas: 4.55,
    atc: 35,
    checkouts: 18,
    reach: 19574,
    impressions: 22779,
    cpm: 30.76,
    freq: 1.16,
    ctr: 2.12,
    lpv: 337,
    cpp: 175.15,
    status: 'active',
    color: '#1e7a45'
  }
];

// ── Daily pacing (May 19–25) ──────────────────────────────────────────────────
// Account-level combined across all 3 sales campaigns
const DAILY_PACING = [
  { date: '19 May', day: 'Mon', spend: 651.99,  revenue: 1933.1,  purchases: 3,  roas: 2.96,  cpm: 45.10 },
  { date: '20 May', day: 'Tue', spend: 1227.74, revenue: 1721.1,  purchases: 3,  roas: 1.40,  cpm: 44.80 },
  { date: '21 May', day: 'Wed', spend: 965.42,  revenue: 1891.4,  purchases: 2,  roas: 1.96,  cpm: 45.20 },
  { date: '22 May', day: 'Thu', spend: 1385.27, revenue: 11657.3, purchases: 6,  roas: 8.41,  cpm: 47.40 },
  { date: '23 May', day: 'Fri', spend: 1224.00, revenue: 7437.5,  purchases: 6,  roas: 6.08,  cpm: 34.20 },
  { date: '24 May', day: 'Sat', spend: 1576.05, revenue: 15760.5, purchases: 7,  roas: 10.00, cpm: 27.40 },
  { date: '25 May', day: 'Sun', spend: 332.59,  revenue: 2061.7,  purchases: 4,  roas: 6.20,  cpm: 31.20 }
];

// ── Placement breakdown ───────────────────────────────────────────────────────
const PLACEMENTS = [
  { name: 'IG Reels',   platform: 'instagram', impressions: 110420, spend: 3610, purchases: 24, roas: 6.80, cpm: 32.70, ctr: 3.10 },
  { name: 'IG Stories', platform: 'instagram', impressions: 12890,  spend: 1480, purchases: 4,  roas: 8.20, cpm: 114.80,ctr: 5.20 },
  { name: 'IG Feed',    platform: 'instagram', impressions: 18540,  spend: 2190, purchases: 3,  roas: 4.90, cpm: 118.10,ctr: 2.90 },
  { name: 'Threads',    platform: 'threads',   impressions: 680,    spend: 28,   purchases: 0,  roas: 0,    cpm: 41.20, ctr: 1.80 },
  { name: 'FB Reels',   platform: 'facebook',  impressions: 3120,   spend: 195,  purchases: 0,  roas: 0,    cpm: 62.50, ctr: 2.90 },
  { name: 'FB Feed',    platform: 'facebook',  impressions: 1210,   spend: 180,  purchases: 0,  roas: 0,    cpm: 148.80,ctr: 2.20 }
];

// ── Device breakdown ──────────────────────────────────────────────────────────
const DEVICES = [
  { name: 'iPhone',  device: 'iphone',             impressions: 44810, spend: 3190, purchases: 18, roas: 9.42, cpm: 71.20 },
  { name: 'Android', device: 'android_smartphone',  impressions: 98640, spend: 4510, purchases: 13, roas: 3.48, cpm: 45.70 },
  { name: 'iPad',    device: 'ipad',                impressions: 420,   spend: 15,   purchases: 0,  roas: 0,    cpm: 35.70 },
  { name: 'Desktop', device: 'desktop',             impressions: 130,   spend: 10,   purchases: 0,  roas: 0,    cpm: 76.90 }
];

// ── Age / gender breakdown ────────────────────────────────────────────────────
const AGE_GENDER = [
  { age: '18-24', gender: 'male',   impressions: 68940, spend: 2410, purchases: 8,  roas: 3.02, cpm: 34.96, ctr: 2.25 },
  { age: '25-34', gender: 'male',   impressions: 57320, spend: 3620, purchases: 19, roas: 7.38, cpm: 63.16, ctr: 2.71 },
  { age: '35-44', gender: 'male',   impressions: 8910,  spend: 1040, purchases: 4,  roas: 5.30, cpm: 116.72,ctr: 3.28 },
  { age: '18-24', gender: 'female', impressions: 1260,  spend: 50,   purchases: 0,  roas: 0,    cpm: 39.68, ctr: 1.51 },
  { age: '25-34', gender: 'female', impressions: 980,   spend: 81,   purchases: 1,  roas: 8.64, cpm: 82.65, ctr: 4.08 },
  { age: '35-44', gender: 'female', impressions: 210,   spend: 24,   purchases: 0,  roas: 0,    cpm: 114.29,ctr: 7.14 },
  { age: '45-54', gender: 'male',   impressions: 2140,  spend: 210,  purchases: 0,  roas: 0,    cpm: 98.13, ctr: 3.97 },
  { age: '55-64', gender: 'male',   impressions: 500,   spend: 39,   purchases: 0,  roas: 0,    cpm: 78.00, ctr: 1.60 }
];

// ── Hourly (last 7 days, account level) ──────────────────────────────────────
const HOURLY = [
  {h:'00',label:'12am',cpm:44.20,ctr:2.11,purchases:2,spend:432},
  {h:'01',label:'1am', cpm:48.30,ctr:2.14,purchases:0,spend:278},
  {h:'02',label:'2am', cpm:39.10,ctr:1.62,purchases:1,spend:158},
  {h:'03',label:'3am', cpm:50.80,ctr:2.43,purchases:0,spend:93},
  {h:'04',label:'4am', cpm:40.50,ctr:2.20,purchases:0,spend:57},
  {h:'05',label:'5am', cpm:56.40,ctr:2.05,purchases:0,spend:61},
  {h:'06',label:'6am', cpm:64.90,ctr:2.73,purchases:1,spend:103},
  {h:'07',label:'7am', cpm:49.60,ctr:2.68,purchases:0,spend:153},
  {h:'08',label:'8am', cpm:54.00,ctr:2.52,purchases:1,spend:271},
  {h:'09',label:'9am', cpm:55.10,ctr:2.29,purchases:2,spend:385},
  {h:'10',label:'10am',cpm:57.40,ctr:2.68,purchases:2,spend:469},
  {h:'11',label:'11am',cpm:58.20,ctr:2.71,purchases:3,spend:503},
  {h:'12',label:'12pm',cpm:57.60,ctr:2.74,purchases:4,spend:492},
  {h:'13',label:'1pm', cpm:57.90,ctr:2.44,purchases:3,spend:467},
  {h:'14',label:'2pm', cpm:56.70,ctr:2.33,purchases:3,spend:379},
  {h:'15',label:'3pm', cpm:54.90,ctr:2.74,purchases:1,spend:363},
  {h:'16',label:'4pm', cpm:59.10,ctr:2.79,purchases:1,spend:353},
  {h:'17',label:'5pm', cpm:51.70,ctr:2.98,purchases:2,spend:300},
  {h:'18',label:'6pm', cpm:46.60,ctr:2.13,purchases:2,spend:400},
  {h:'19',label:'7pm', cpm:48.20,ctr:2.72,purchases:1,spend:404},
  {h:'20',label:'8pm', cpm:50.60,ctr:2.65,purchases:1,spend:343},
  {h:'21',label:'9pm', cpm:47.90,ctr:2.70,purchases:1,spend:358},
  {h:'22',label:'10pm',cpm:48.90,ctr:2.41,purchases:2,spend:394},
  {h:'23',label:'11pm',cpm:50.80,ctr:2.47,purchases:2,spend:382}
];

// ── Weekly history (13 weeks, live from Meta 90d API) ─────────────────────────
const WEEKLY_HISTORY = [
  { p: 'Feb 24\u2013Mar 2',  spend: 4401,  revenue: 3521,   roas: 0.80,  pur: 3  },
  { p: 'Mar 3\u20139',       spend: 6767,  revenue: 78555,  roas: 11.61, pur: 116},
  { p: 'Mar 10\u201316',     spend: 4521,  revenue: 45275,  roas: 10.01, pur: 68 },
  { p: 'Mar 17\u201323',     spend: 5745,  revenue: 17752,  roas: 3.09,  pur: 25 },
  { p: 'Mar 24\u201330',     spend: 5099,  revenue: 12442,  roas: 2.44,  pur: 12 },
  { p: 'Mar 31\u2013Apr 6',  spend: 4966,  revenue: 6405,   roas: 1.29,  pur: 5  },
  { p: 'Apr 7\u201313',      spend: 7550,  revenue: 44545,  roas: 5.90,  pur: 54 },
  { p: 'Apr 14\u201320',     spend: 6494,  revenue: 15066,  roas: 2.32,  pur: 17 },
  { p: 'Apr 21\u201327',     spend: 5236,  revenue: 37072,  roas: 7.08,  pur: 31 },
  { p: 'Apr 28\u2013May 4',  spend: 4352,  revenue: 45638,  roas: 10.49, pur: 54 },
  { p: 'May 5\u201311',      spend: 6544,  revenue: 44433,  roas: 6.79,  pur: 54 },
  { p: 'May 12\u201318',     spend: 7833,  revenue: 41279,  roas: 5.27,  pur: 48 },
  { p: 'May 19\u201325',     spend: 8163,  revenue: 59061,  roas: 7.23,  pur: 31 }
];

// ── Expose to app.js ──────────────────────────────────────────────────────────
let LIVE_DATA = null;
let LIVE_LOADED = false;
let LIVE_ERROR = null;

async function loadLiveData() {
  LIVE_DATA = {
    fetchedAt: DATA_FETCHED_AT,
    period: DATA_PERIOD,
    campaigns: LIVE_CAMPAIGNS,
    dailyPacing: DAILY_PACING,
    allDaily: DAILY_PACING,
    placements: PLACEMENTS,
    devices: DEVICES,
    ageGender: AGE_GENDER,
    hourly: HOURLY,
    weeklyHistory: WEEKLY_HISTORY
  };
  LIVE_LOADED = true;
  LIVE_ERROR = null;

  const dot   = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  const banner= document.getElementById('live-error-banner');
  if (dot)    { dot.style.background = '#1e7a45'; dot.style.animation = ''; }
  if (label)  label.textContent = 'Meta \u00b7 May 19\u201325, 2026 \u00b7 3 campaigns';
  if (banner) banner.style.display = 'none';

  return LIVE_DATA;
}
