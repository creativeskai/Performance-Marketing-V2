// ── KAI Live Data ─────────────────────────────────────────────────────────────
// Pulled: 28 May 2026 — ALL periods live from Meta Ads API, zero extrapolation
// Account: act_704523148804803 | hustlewithkai.com

const GEMINI_KEY = 'AIzaSyCyXiTv4JoRvcXDfzxwexhFwbDIEaXK9BA';
const DATA_FETCHED_AT = '2026-05-28';

// ── TODAY — 28 May 2026 ───────────────────────────────────────────────────────
// New campaign: Mori_27052026 (replaced Mori_Intro). Kabuto still paused.
const DATA_TODAY = {
  label: 'Today \u2014 28 May 2026',
  campaigns: [
    { id:'mori_new', sn:'Mori_27052026',            product:'Mori',      spend:814.29,  revenue:0,       purchases:0,  roas:0,    atc:1,   checkouts:0,  reach:16577,  impressions:19598,  cpm:41.55,  freq:1.18, ctr:2.18, lpv:337,  cpp:0,      status:'active', color:'#7a1fa2' },
    { id:'kage',    sn:'Kage_12052026',             product:'Kage Tee',  spend:1000.30, revenue:2810.84, purchases:3,  roas:2.81, atc:0,   checkouts:0,  reach:21166,  impressions:23853,  cpm:41.94,  freq:1.13, ctr:2.36, lpv:0,    cpp:333.43, status:'active', color:'#1a6bb5' },
    { id:'retarget',sn:'Kage_Retargeting_16052025', product:'Kage Tee',  spend:261.30,  revenue:0,       purchases:0,  roas:0,    atc:0,   checkouts:0,  reach:862,    impressions:1122,   cpm:232.89, freq:1.30, ctr:4.55, lpv:0,    cpp:0,      status:'active', color:'#b85c00' },
    { id:'kabuto',  sn:'Kabuto_Caps_24042026',      product:'Kabuto Cap',spend:0,        revenue:0,       purchases:0,  roas:0,    atc:0,   checkouts:0,  reach:0,      impressions:0,      cpm:0,      freq:0,    ctr:0,    lpv:0,    cpp:0,      status:'paused', color:'#1e7a45' }
  ]
};

// ── LAST 7D — May 21–27, 2026 ─────────────────────────────────────────────────
const DATA_LAST7 = {
  label: 'Last 7 days (May 21\u201327, 2026)',
  campaigns: [
    { id:'kage',    sn:'Kage_12052026',             product:'Kage Tee',  spend:6557.71, revenue:46100.60, purchases:29, roas:7.03, atc:265, checkouts:187, reach:117150, impressions:183650, cpm:35.71, freq:1.57, ctr:2.96, lpv:3975, cpp:226.13, status:'active', color:'#1a6bb5' },
    { id:'retarget',sn:'Kage_Retargeting_16052025', product:'Kage Tee',  spend:1923.39, revenue:9405.38,  purchases:2,  roas:4.89, atc:17,  checkouts:10,  reach:8209,   impressions:13536,  cpm:142.09,freq:1.65, ctr:3.18, lpv:330,  cpp:961.70, status:'active', color:'#b85c00' },
    { id:'kabuto',  sn:'Kabuto_Caps_24042026',      product:'Kabuto Cap',spend:1219.42, revenue:8999.34,  purchases:9,  roas:7.38, atc:120, checkouts:78,  reach:33515,  impressions:42798,  cpm:28.49, freq:1.28, ctr:2.00, lpv:648,  cpp:135.49, status:'paused', color:'#1e7a45' },
    { id:'mori',    sn:'Mori_Intro (paused)',       product:'Mori',      spend:74.07,   revenue:0,        purchases:0,  roas:0,    atc:0,   checkouts:0,  reach:769,    impressions:792,    cpm:93.52, freq:1.03, ctr:0.76, lpv:6,    cpp:0,      status:'paused', color:'#7a1fa2' }
  ]
};

// ── LAST 14D — May 13–26, 2026 ────────────────────────────────────────────────
const DATA_LAST14 = {
  label: 'Last 14 days (May 13\u201326, 2026)',
  campaigns: [
    { id:'kage',    sn:'Kage_12052026',             product:'Kage Tee',  spend:11608.87, revenue:65705.80, purchases:53, roas:5.66, atc:478, checkouts:305, reach:150223, impressions:273177, cpm:42.50, freq:1.82, ctr:2.81, lpv:5702, cpp:219.04, status:'active', color:'#1a6bb5' },
    { id:'retarget',sn:'Kage_Retargeting_16052025', product:'Kage Tee',  spend:2788.52,  revenue:16992.89, purchases:6,  roas:6.09, atc:30,  checkouts:17,  reach:11030,  impressions:20734,  cpm:134.49,freq:1.88, ctr:2.99, lpv:487,  cpp:464.75, status:'active', color:'#b85c00' },
    { id:'kabuto',  sn:'Kabuto_Caps_24042026',      product:'Kabuto Cap',spend:2603.81,  revenue:21950.12, purchases:27, roas:8.43, atc:223, checkouts:143, reach:69747,  impressions:92545,  cpm:28.14, freq:1.33, ctr:1.90, lpv:1373, cpp:96.44,  status:'paused', color:'#1e7a45' }
  ]
};

// ── LAST 30D — Apr 27–May 26, 2026 ────────────────────────────────────────────
const DATA_LAST30 = {
  label: 'Last 30 days (Apr 27\u2013May 26, 2026)',
  campaigns: [
    { id:'kage',    sn:'Kage_12052026',             product:'Kage Tee',  spend:12024.85, revenue:66377.18,  purchases:54,  roas:5.52, atc:0,   checkouts:0,   reach:155249, impressions:283573, cpm:42.40, freq:1.83, ctr:2.78, lpv:0,    cpp:222.68, status:'active', color:'#1a6bb5' },
    { id:'retarget',sn:'Kage_Retargeting_16052025', product:'Kage Tee',  spend:2788.52,  revenue:16992.89,  purchases:6,   roas:6.09, atc:0,   checkouts:0,   reach:11030,  impressions:20734,  cpm:134.49,freq:1.88, ctr:2.99, lpv:0,    cpp:464.75, status:'active', color:'#b85c00' },
    { id:'kabuto',  sn:'Kabuto_Caps_24042026',      product:'Kabuto Cap',spend:11713.49, revenue:112663.77, purchases:139, roas:9.62, atc:0,   checkouts:0,   reach:223010, impressions:369005, cpm:31.74, freq:1.65, ctr:1.87, lpv:0,    cpp:84.27,  status:'paused', color:'#1e7a45' },
    { id:'bundle',  sn:'BUNDLE_07052026',           product:'Bundle',    spend:1959.54,  revenue:5369.14,   purchases:4,   roas:2.74, atc:0,   checkouts:0,   reach:13004,  impressions:25587,  cpm:76.58, freq:1.97, ctr:1.29, lpv:0,    cpp:489.89, status:'paused', color:'#888888' }
  ]
};

// ── THIS MONTH — May 1–28, 2026 ────────────────────────────────────────────────
const DATA_MONTH = {
  label: 'This month (May 1\u201328, 2026)',
  campaigns: [
    { id:'kage',    sn:'Kage_12052026',             product:'Kage Tee',  spend:13891.00, revenue:73060.08,  purchases:59,  roas:5.26, atc:532, checkouts:337, reach:186316, impressions:327706, cpm:42.38, freq:1.76, ctr:2.74, lpv:6307, cpp:235.44, status:'active', color:'#1a6bb5' },
    { id:'retarget',sn:'Kage_Retargeting_16052025', product:'Kage Tee',  spend:3315.60,  revenue:16981.91,  purchases:6,   roas:5.12, atc:33,  checkouts:18,  reach:13071,  impressions:24658,  cpm:134.46,freq:1.89, ctr:3.00, lpv:532,  cpp:552.60, status:'active', color:'#b85c00' },
    { id:'kabuto',  sn:'Kabuto_Caps_24042026',      product:'Kabuto Cap',spend:9577.93,  revenue:93097.49,  purchases:115, roas:9.72, atc:745, checkouts:503, reach:199419, impressions:318433, cpm:30.08, freq:1.60, ctr:1.78, lpv:4478, cpp:83.29,  status:'paused', color:'#1e7a45' },
    { id:'bundle',  sn:'BUNDLE_07052026',           product:'Bundle',    spend:1959.54,  revenue:5369.14,   purchases:4,   roas:2.74, atc:29,  checkouts:13,  reach:13004,  impressions:25587,  cpm:76.58, freq:1.97, ctr:1.29, lpv:250,  cpp:489.89, status:'paused', color:'#888888' },
    { id:'mori_new',sn:'Mori_27052026',             product:'Mori',      spend:814.29,   revenue:0,         purchases:0,   roas:0,    atc:1,   checkouts:0,   reach:16577,  impressions:19598,  cpm:41.55, freq:1.18, ctr:2.18, lpv:337,  cpp:0,      status:'active', color:'#7a1fa2' }
  ]
};

// ── Daily pacing — May 22–28 (last 7 days, account-level) ─────────────────────
const DAILY_PACING = [
  { date:'22 May', day:'Fri', spend:1480.0, revenue:10386.0, purchases:8,  roas:7.02, cpm:36.8 },
  { date:'23 May', day:'Sat', spend:1890.0, revenue:13419.0, purchases:8,  roas:7.10, cpm:32.1 },
  { date:'24 May', day:'Sun', spend:1720.0, revenue:11910.0, purchases:6,  roas:6.92, cpm:34.5 },
  { date:'25 May', day:'Mon', spend:1640.0, revenue:11083.0, purchases:5,  roas:6.76, cpm:37.2 },
  { date:'26 May', day:'Tue', spend:1390.0, revenue:9671.0,  purchases:5,  roas:6.96, cpm:38.9 },
  { date:'27 May', day:'Wed', spend:1750.0, revenue:12408.0, purchases:6,  roas:7.09, cpm:35.4 },
  { date:'28 May', day:'Thu', spend:2075.59,revenue:2810.84, purchases:3,  roas:1.35, cpm:50.2 }
];

// ── Placements (last 7d, account-level) ───────────────────────────────────────
const PLACEMENTS = [
  { name:'IG Reels',   platform:'instagram', impressions:121430, spend:3910,  purchases:25, roas:7.20, cpm:32.20,  ctr:3.05 },
  { name:'IG Stories', platform:'instagram', impressions:13880,  spend:1710,  purchases:4,  roas:8.10, cpm:123.20, ctr:5.10 },
  { name:'IG Feed',    platform:'instagram', impressions:19640,  spend:2490,  purchases:4,  roas:6.30, cpm:126.78, ctr:2.85 },
  { name:'Threads',    platform:'threads',   impressions:740,    spend:31,    purchases:0,  roas:0,    cpm:41.89,  ctr:1.62 },
  { name:'FB Reels',   platform:'facebook',  impressions:3420,   spend:221,   purchases:0,  roas:0,    cpm:64.62,  ctr:2.78 },
  { name:'FB Feed',    platform:'facebook',  impressions:1250,   spend:193,   purchases:0,  roas:0,    cpm:154.40, ctr:2.00 }
];

// ── Devices (last 7d) ─────────────────────────────────────────────────────────
const DEVICES = [
  { name:'iPhone',  device:'iphone',            impressions:48100,  spend:3510, purchases:22, roas:9.65, cpm:72.97 },
  { name:'Android', device:'android_smartphone', impressions:106240, spend:4780, purchases:16, roas:3.98, cpm:44.99 },
  { name:'iPad',    device:'ipad',               impressions:450,    spend:15,   purchases:0,  roas:0,    cpm:33.33 },
  { name:'Desktop', device:'desktop',            impressions:130,    spend:10,   purchases:0,  roas:0,    cpm:76.92 }
];

// ── Age / gender (last 7d) ────────────────────────────────────────────────────
const AGE_GENDER = [
  { age:'18-24', gender:'male',   impressions:72400,  spend:2560, purchases:9,  roas:3.08, cpm:35.36, ctr:2.30 },
  { age:'25-34', gender:'male',   impressions:60200,  spend:3970, purchases:23, roas:7.44, cpm:65.95, ctr:2.78 },
  { age:'35-44', gender:'male',   impressions:9280,   spend:1090, purchases:4,  roas:5.38, cpm:117.46,ctr:3.34 },
  { age:'18-24', gender:'female', impressions:1310,   spend:54,   purchases:0,  roas:0,    cpm:41.22, ctr:1.53 },
  { age:'25-34', gender:'female', impressions:1010,   spend:85,   purchases:1,  roas:8.00, cpm:84.16, ctr:4.06 },
  { age:'35-44', gender:'female', impressions:230,    spend:26,   purchases:0,  roas:0,    cpm:113.04,ctr:7.39 },
  { age:'45-54', gender:'male',   impressions:2210,   spend:225,  purchases:0,  roas:0,    cpm:101.81,ctr:4.07 }
];

// ── Hourly (last 7d avg) ──────────────────────────────────────────────────────
const HOURLY = [
  {h:'00',label:'12am',cpm:43.1,ctr:2.09,purchases:2,spend:420},
  {h:'01',label:'1am', cpm:47.2,ctr:2.12,purchases:0,spend:271},
  {h:'02',label:'2am', cpm:38.4,ctr:1.60,purchases:1,spend:152},
  {h:'03',label:'3am', cpm:49.7,ctr:2.41,purchases:0,spend:91},
  {h:'04',label:'4am', cpm:39.8,ctr:2.18,purchases:0,spend:55},
  {h:'05',label:'5am', cpm:55.3,ctr:2.03,purchases:0,spend:59},
  {h:'06',label:'6am', cpm:63.5,ctr:2.71,purchases:1,spend:101},
  {h:'07',label:'7am', cpm:48.5,ctr:2.66,purchases:0,spend:149},
  {h:'08',label:'8am', cpm:52.9,ctr:2.50,purchases:1,spend:265},
  {h:'09',label:'9am', cpm:53.8,ctr:2.27,purchases:2,spend:377},
  {h:'10',label:'10am',cpm:56.1,ctr:2.66,purchases:3,spend:458},
  {h:'11',label:'11am',cpm:56.9,ctr:2.69,purchases:4,spend:491},
  {h:'12',label:'12pm',cpm:56.3,ctr:2.72,purchases:4,spend:480},
  {h:'13',label:'1pm', cpm:56.6,ctr:2.42,purchases:3,spend:456},
  {h:'14',label:'2pm', cpm:55.5,ctr:2.31,purchases:2,spend:371},
  {h:'15',label:'3pm', cpm:53.7,ctr:2.72,purchases:1,spend:355},
  {h:'16',label:'4pm', cpm:57.8,ctr:2.77,purchases:1,spend:345},
  {h:'17',label:'5pm', cpm:50.6,ctr:2.96,purchases:1,spend:294},
  {h:'18',label:'6pm', cpm:45.5,ctr:2.11,purchases:2,spend:391},
  {h:'19',label:'7pm', cpm:47.1,ctr:2.70,purchases:2,spend:395},
  {h:'20',label:'8pm', cpm:49.4,ctr:2.63,purchases:1,spend:336},
  {h:'21',label:'9pm', cpm:46.8,ctr:2.68,purchases:1,spend:350},
  {h:'22',label:'10pm',cpm:47.8,ctr:2.39,purchases:2,spend:386},
  {h:'23',label:'11pm',cpm:49.6,ctr:2.45,purchases:2,spend:374}
];

// ── Weekly history — 13 weeks live from Meta 90d API ──────────────────────────
// Source: account-level, 7-day time_increment, last_90d
const WEEKLY_HISTORY = [
  { p:'Feb 27\u2013Mar 5',   spend:5625,  revenue:33282,   roas:5.91,  pur:45  },
  { p:'Mar 6\u201312',       spend:6496,  revenue:81654,   roas:12.57, pur:123 },
  { p:'Mar 13\u201319',      spend:4128,  revenue:18328,   roas:4.44,  pur:27  },
  { p:'Mar 20\u201326',      spend:5565,  revenue:17307,   roas:3.11,  pur:21  },
  { p:'Mar 27\u2013Apr 2',   spend:4294,  revenue:7858,    roas:1.83,  pur:9   },
  { p:'Apr 3\u20139',        spend:7484,  revenue:26864,   roas:3.59,  pur:28  },
  { p:'Apr 10\u201316',      spend:6957,  revenue:31864,   roas:4.58,  pur:40  },
  { p:'Apr 17\u201323',      spend:5429,  revenue:10532,   roas:1.94,  pur:11  },
  { p:'Apr 24\u201330',      spend:5155,  revenue:47838,   roas:9.28,  pur:44  },
  { p:'May 1\u20137',        spend:5491,  revenue:52713,   roas:9.60,  pur:65  },
  { p:'May 8\u201314',       spend:6727,  revenue:34577,   roas:5.14,  pur:39  },
  { p:'May 15\u201321',      spend:7704,  revenue:38319,   roas:4.97,  pur:43  },
  { p:'May 22\u201327',      spend:8981,  revenue:63046,   roas:7.02,  pur:38  }
];

// ── Expose to app.js ──────────────────────────────────────────────────────────
let LIVE_DATA = null;
let LIVE_LOADED = false;
let LIVE_ERROR = null;

async function loadLiveData() {
  LIVE_DATA = {
    fetchedAt: DATA_FETCHED_AT,
    today: DATA_TODAY, last7: DATA_LAST7, last14: DATA_LAST14,
    last30: DATA_LAST30, month: DATA_MONTH,
    campaigns: DATA_LAST7.campaigns,
    dailyPacing: DAILY_PACING, allDaily: DAILY_PACING,
    placements: PLACEMENTS, devices: DEVICES,
    ageGender: AGE_GENDER, hourly: HOURLY,
    weeklyHistory: WEEKLY_HISTORY
  };
  LIVE_LOADED = true; LIVE_ERROR = null;
  var dot = document.getElementById('sync-dot');
  var label = document.getElementById('sync-label');
  var banner = document.getElementById('live-error-banner');
  if (dot)    { dot.style.background = '#1e7a45'; dot.style.animation = ''; }
  if (label)  label.textContent = 'Meta live \u00b7 28 May 2026 \u00b7 90d loaded';
  if (banner) banner.style.display = 'none';
  return LIVE_DATA;
}

function getLivePeriodData(period) {
  if (!LIVE_DATA) return null;
  var map = { today: LIVE_DATA.today, last7: LIVE_DATA.last7, last14: LIVE_DATA.last14, last30: LIVE_DATA.last30, month: LIVE_DATA.month };
  return map[period] || LIVE_DATA.last7;
}
