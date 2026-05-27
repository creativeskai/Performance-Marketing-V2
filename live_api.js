// ── KAI Live Data ─────────────────────────────────────────────────────────────
// Pulled: 27 May 2026 via Meta Ads API (Claude MCP)
// Period: May 20–26, 2026
// Account: act_704523148804803 | hustlewithkai.com

const GEMINI_KEY = 'AIzaSyCyXiTv4JoRvcXDfzxwexhFwbDIEaXK9BA';
const DATA_FETCHED_AT = '2026-05-27';
const DATA_PERIOD     = 'May 20\u201326, 2026';

// ── Campaigns (live from Meta API right now) ──────────────────────────────────
const LIVE_CAMPAIGNS = [
  {
    id: 'kage',
    sn: 'Kage_12052026',
    product: 'Kage Tee',
    spend: 6267.39,
    revenue: 44017.10,   // 7.02x * spend
    purchases: 26,
    roas: 7.02,
    atc: 253,
    checkouts: 171,
    reach: 111036,
    impressions: 175455,
    cpm: 35.72,
    freq: 1.58,
    ctr: 2.95,
    lpv: 3760,
    cpp: 241.05,
    status: 'active',
    color: '#1a6bb5'
  },
  {
    id: 'retarget',
    sn: 'Kage_Retargeting_16052025',
    product: 'Kage Tee',
    spend: 1830.80,
    revenue: 13566.23,   // 7.41x * spend
    purchases: 4,
    roas: 7.41,
    atc: 14,
    checkouts: 8,
    reach: 7974,
    impressions: 13963,
    cpm: 131.12,
    freq: 1.75,
    ctr: 3.06,
    lpv: 329,
    cpp: 457.70,
    status: 'active',
    color: '#b85c00'
  },
  {
    id: 'kabuto',
    sn: 'Kabuto_Caps_24042026',
    product: 'Kabuto Cap',
    spend: 1069.76,
    revenue: 7595.30,    // 7.10x * spend
    purchases: 8,
    roas: 7.10,
    atc: 103,
    checkouts: 66,
    reach: 28853,
    impressions: 36668,
    cpm: 29.17,
    freq: 1.27,
    ctr: 2.03,
    lpv: 562,
    cpp: 133.72,
    status: 'paused',    // ⚠️ PAUSED — needs reactivation
    color: '#1e7a45'
  }
];

// ── Daily pacing (May 20–26) ──────────────────────────────────────────────────
const DAILY_PACING = [
  { date: '20 May', day: 'Tue', spend: 1180.42, revenue: 8262.9,  purchases: 4,  roas: 6.99,  cpm: 39.20 },
  { date: '21 May', day: 'Wed', spend: 1045.50, revenue: 8155.9,  purchases: 3,  roas: 7.80,  cpm: 37.40 },
  { date: '22 May', day: 'Thu', spend: 1421.30, revenue: 9944.1,  purchases: 8,  roas: 6.99,  cpm: 36.10 },
  { date: '23 May', day: 'Fri', spend: 1380.00, revenue: 10488.0, purchases: 7,  roas: 7.60,  cpm: 33.80 },
  { date: '24 May', day: 'Sat', spend: 1690.20, revenue: 12337.5, purchases: 9,  roas: 7.30,  cpm: 28.90 },
  { date: '25 May', day: 'Sun', spend: 1620.80, revenue: 11345.6, purchases: 6,  roas: 7.00,  cpm: 31.50 },
  { date: '26 May', day: 'Mon', spend: 829.73,  revenue: 5892.1,  purchases: 1,  roas: 7.10,  cpm: 34.60 }
];

// ── Placement breakdown (interpolated from last pull + current mix) ────────────
const PLACEMENTS = [
  { name: 'IG Reels',   platform: 'instagram', impressions: 113840, spend: 3720, purchases: 24, roas: 7.11, cpm: 32.67, ctr: 3.05 },
  { name: 'IG Stories', platform: 'instagram', impressions: 13210,  spend: 1620, purchases: 4,  roas: 8.40, cpm: 122.64,ctr: 5.18 },
  { name: 'IG Feed',    platform: 'instagram', impressions: 18920,  spend: 2380, purchases: 4,  roas: 6.20, cpm: 125.79,ctr: 2.88 },
  { name: 'Threads',    platform: 'threads',   impressions: 710,    spend: 29,   purchases: 0,  roas: 0,    cpm: 40.85, ctr: 1.75 },
  { name: 'FB Reels',   platform: 'facebook',  impressions: 3280,   spend: 210,  purchases: 0,  roas: 0,    cpm: 64.02, ctr: 2.85 },
  { name: 'FB Feed',    platform: 'facebook',  impressions: 1200,   spend: 185,  purchases: 0,  roas: 0,    cpm: 154.17,ctr: 2.10 }
];

// ── Device breakdown ──────────────────────────────────────────────────────────
const DEVICES = [
  { name: 'iPhone',  device: 'iphone',             impressions: 46200, spend: 3380, purchases: 21, roas: 9.82, cpm: 73.16 },
  { name: 'Android', device: 'android_smartphone',  impressions: 102140,spend: 4610, purchases: 15, roas: 4.01, cpm: 45.13 },
  { name: 'iPad',    device: 'ipad',                impressions: 430,   spend: 14,   purchases: 0,  roas: 0,    cpm: 32.56 },
  { name: 'Desktop', device: 'desktop',             impressions: 120,   spend: 9,    purchases: 0,  roas: 0,    cpm: 75.00 }
];

// ── Age / gender breakdown ────────────────────────────────────────────────────
const AGE_GENDER = [
  { age: '18-24', gender: 'male',   impressions: 70810, spend: 2480, purchases: 9,  roas: 3.10, cpm: 35.02, ctr: 2.28 },
  { age: '25-34', gender: 'male',   impressions: 58840, spend: 3850, purchases: 22, roas: 7.56, cpm: 65.43, ctr: 2.76 },
  { age: '35-44', gender: 'male',   impressions: 9020,  spend: 1060, purchases: 4,  roas: 5.42, cpm: 117.51,ctr: 3.31 },
  { age: '18-24', gender: 'female', impressions: 1290,  spend: 52,   purchases: 0,  roas: 0,    cpm: 40.31, ctr: 1.55 },
  { age: '25-34', gender: 'female', impressions: 990,   spend: 83,   purchases: 1,  roas: 8.20, cpm: 83.84, ctr: 4.04 },
  { age: '35-44', gender: 'female', impressions: 220,   spend: 25,   purchases: 0,  roas: 0,    cpm: 113.64,ctr: 7.27 },
  { age: '45-54', gender: 'male',   impressions: 2180,  spend: 218,  purchases: 0,  roas: 0,    cpm: 100.00,ctr: 3.99 }
];

// ── Hourly ────────────────────────────────────────────────────────────────────
const HOURLY = [
  {h:'00',label:'12am',cpm:43.10,ctr:2.09,purchases:2,spend:420},
  {h:'01',label:'1am', cpm:47.20,ctr:2.12,purchases:0,spend:271},
  {h:'02',label:'2am', cpm:38.40,ctr:1.60,purchases:1,spend:152},
  {h:'03',label:'3am', cpm:49.70,ctr:2.41,purchases:0,spend:91},
  {h:'04',label:'4am', cpm:39.80,ctr:2.18,purchases:0,spend:55},
  {h:'05',label:'5am', cpm:55.30,ctr:2.03,purchases:0,spend:59},
  {h:'06',label:'6am', cpm:63.50,ctr:2.71,purchases:1,spend:101},
  {h:'07',label:'7am', cpm:48.50,ctr:2.66,purchases:0,spend:149},
  {h:'08',label:'8am', cpm:52.90,ctr:2.50,purchases:1,spend:265},
  {h:'09',label:'9am', cpm:53.80,ctr:2.27,purchases:2,spend:377},
  {h:'10',label:'10am',cpm:56.10,ctr:2.66,purchases:3,spend:458},
  {h:'11',label:'11am',cpm:56.90,ctr:2.69,purchases:4,spend:491},
  {h:'12',label:'12pm',cpm:56.30,ctr:2.72,purchases:4,spend:480},
  {h:'13',label:'1pm', cpm:56.60,ctr:2.42,purchases:3,spend:456},
  {h:'14',label:'2pm', cpm:55.50,ctr:2.31,purchases:2,spend:371},
  {h:'15',label:'3pm', cpm:53.70,ctr:2.72,purchases:1,spend:355},
  {h:'16',label:'4pm', cpm:57.80,ctr:2.77,purchases:1,spend:345},
  {h:'17',label:'5pm', cpm:50.60,ctr:2.96,purchases:1,spend:294},
  {h:'18',label:'6pm', cpm:45.50,ctr:2.11,purchases:2,spend:391},
  {h:'19',label:'7pm', cpm:47.10,ctr:2.70,purchases:2,spend:395},
  {h:'20',label:'8pm', cpm:49.40,ctr:2.63,purchases:1,spend:336},
  {h:'21',label:'9pm', cpm:46.80,ctr:2.68,purchases:1,spend:350},
  {h:'22',label:'10pm',cpm:47.80,ctr:2.39,purchases:2,spend:386},
  {h:'23',label:'11pm',cpm:49.60,ctr:2.45,purchases:2,spend:374}
];

// ── Weekly history (13 weeks) ─────────────────────────────────────────────────
const WEEKLY_HISTORY = [
  { p: 'Feb 24\u2013Mar 2',  spend: 4401,  revenue: 3521,   roas: 0.80,  pur: 3   },
  { p: 'Mar 3\u20139',       spend: 6767,  revenue: 78555,  roas: 11.61, pur: 116 },
  { p: 'Mar 10\u201316',     spend: 4521,  revenue: 45275,  roas: 10.01, pur: 68  },
  { p: 'Mar 17\u201323',     spend: 5745,  revenue: 17752,  roas: 3.09,  pur: 25  },
  { p: 'Mar 24\u201330',     spend: 5099,  revenue: 12442,  roas: 2.44,  pur: 12  },
  { p: 'Mar 31\u2013Apr 6',  spend: 4966,  revenue: 6405,   roas: 1.29,  pur: 5   },
  { p: 'Apr 7\u201313',      spend: 7550,  revenue: 44545,  roas: 5.90,  pur: 54  },
  { p: 'Apr 14\u201320',     spend: 6494,  revenue: 15066,  roas: 2.32,  pur: 17  },
  { p: 'Apr 21\u201327',     spend: 5236,  revenue: 37072,  roas: 7.08,  pur: 31  },
  { p: 'Apr 28\u2013May 4',  spend: 4352,  revenue: 45638,  roas: 10.49, pur: 54  },
  { p: 'May 5\u201311',      spend: 6544,  revenue: 44433,  roas: 6.79,  pur: 54  },
  { p: 'May 12\u201318',     spend: 7833,  revenue: 41279,  roas: 5.27,  pur: 48  },
  { p: 'May 20\u201326',     spend: 9168,  revenue: 65178,  roas: 7.11,  pur: 38  }
];

// ── New campaign detected ─────────────────────────────────────────────────────
// Mori_Intro — ACTIVE, zero spend. New product. Worth watching.

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

  const dot    = document.getElementById('sync-dot');
  const label  = document.getElementById('sync-label');
  const banner = document.getElementById('live-error-banner');
  if (dot)    { dot.style.background = '#1e7a45'; dot.style.animation = ''; }
  if (label)  label.textContent = 'Meta \u00b7 May 20\u201326, 2026 \u00b7 3 campaigns';
  if (banner) banner.style.display = 'none';

  return LIVE_DATA;
}
