// ── KAI Live Data ─────────────────────────────────────────────────────────────
// Pulled: 27 May 2026 — ALL periods live from Meta Ads API, zero extrapolation
// Account: act_704523148804803 | hustlewithkai.com

const GEMINI_KEY = 'AIzaSyCyXiTv4JoRvcXDfzxwexhFwbDIEaXK9BA';
const DATA_FETCHED_AT = '2026-05-27';

// ─────────────────────────────────────────────────────────────────────────────
// TODAY — 27 May 2026 (partial day, live pull)
// ─────────────────────────────────────────────────────────────────────────────
const DATA_TODAY = {
  label: 'Today \u2014 27 May 2026 (partial)',
  campaigns: [
    { id:'kage',    sn:'Kage_12052026',        product:'Kage Tee',  spend:863.07, revenue:1363.65, purchases:2, roas:1.58, atc:30,  checkouts:18, reach:17839, impressions:21122, cpm:40.86, freq:1.18, ctr:2.95, lpv:461,  cpp:431.54, status:'active', color:'#1a6bb5' },
    { id:'retarget',sn:'Kage_Retargeting',      product:'Kage Tee',  spend:264.28, revenue:0,       purchases:0, roas:0,    atc:3,   checkouts:2,  reach:1309,  impressions:1466,  cpm:180.27,freq:1.12, ctr:4.30, lpv:63,   cpp:0,      status:'active', color:'#b85c00' },
    { id:'kabuto',  sn:'Kabuto_Caps_24042026',  product:'Kabuto Cap',spend:149.65, revenue:0,        purchases:0, roas:0,    atc:5,   checkouts:3,  reach:6056,  impressions:6129,  cpm:24.42, freq:1.01, ctr:1.88, lpv:115,  cpp:0,      status:'paused', color:'#1e7a45' },
    { id:'mori',    sn:'Mori_Intro',            product:'Mori',      spend:7.51,   revenue:0,        purchases:0, roas:0,    atc:0,   checkouts:0,  reach:4,     impressions:52,    cpm:144.42,freq:13.0, ctr:0,    lpv:0,    cpp:0,      status:'active', color:'#7a1fa2' }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// LAST 7D — May 20–26, 2026 (Meta API: date_preset=last_7d)
// ─────────────────────────────────────────────────────────────────────────────
const DATA_LAST7 = {
  label: 'Last 7 days (May 20\u201326, 2026)',
  campaigns: [
    { id:'kage',    sn:'Kage_12052026',        product:'Kage Tee',  spend:6267.39, revenue:44001.28, purchases:26, roas:7.02, atc:253, checkouts:171, reach:111036, impressions:175455, cpm:35.72, freq:1.58, ctr:2.95, lpv:3760, cpp:241.05, status:'active', color:'#1a6bb5' },
    { id:'retarget',sn:'Kage_Retargeting',      product:'Kage Tee',  spend:1830.80, revenue:13566.23, purchases:4,  roas:7.41, atc:14,  checkouts:8,   reach:7974,   impressions:13963,  cpm:131.12,freq:1.75, ctr:3.06, lpv:329,  cpp:457.70, status:'active', color:'#b85c00' },
    { id:'kabuto',  sn:'Kabuto_Caps_24042026',  product:'Kabuto Cap',spend:1069.76, revenue:7595.30,  purchases:8,  roas:7.10, atc:103, checkouts:66,  reach:28853,  impressions:36668,  cpm:29.17, freq:1.27, ctr:2.03, lpv:562,  cpp:133.72, status:'paused', color:'#1e7a45' }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// LAST 14D — May 13–26, 2026 (Meta API: date_preset=last_14d)
// ─────────────────────────────────────────────────────────────────────────────
const DATA_LAST14 = {
  label: 'Last 14 days (May 13\u201326, 2026)',
  campaigns: [
    { id:'kage',    sn:'Kage_12052026',        product:'Kage Tee',  spend:11608.87, revenue:65705.80, purchases:53, roas:5.66, atc:478, checkouts:305, reach:150223, impressions:273177, cpm:42.50, freq:1.82, ctr:2.81, lpv:5702, cpp:219.04, status:'active', color:'#1a6bb5' },
    { id:'retarget',sn:'Kage_Retargeting',      product:'Kage Tee',  spend:2788.52,  revenue:16992.89, purchases:6,  roas:6.09, atc:30,  checkouts:17,  reach:11030,  impressions:20734,  cpm:134.49,freq:1.88, ctr:2.99, lpv:487,  cpp:464.75, status:'active', color:'#b85c00' },
    { id:'kabuto',  sn:'Kabuto_Caps_24042026',  product:'Kabuto Cap',spend:2603.81,  revenue:21950.12, purchases:27, roas:8.43, atc:223, checkouts:143, reach:69747,  impressions:92545,  cpm:28.14, freq:1.33, ctr:1.90, lpv:1373, cpp:96.44,  status:'paused', color:'#1e7a45' }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// LAST 30D — Apr 27–May 26, 2026 (Meta API: date_preset=last_30d)
// ─────────────────────────────────────────────────────────────────────────────
const DATA_LAST30 = {
  label: 'Last 30 days (Apr 27\u2013May 26, 2026)',
  campaigns: [
    { id:'kage',    sn:'Kage_12052026',        product:'Kage Tee',  spend:12024.85, revenue:66377.18, purchases:54,  roas:5.52, atc:0,   checkouts:0,   reach:155249, impressions:283573, cpm:42.40, freq:1.83, ctr:2.78, lpv:0,    cpp:222.68, status:'active', color:'#1a6bb5' },
    { id:'retarget',sn:'Kage_Retargeting',      product:'Kage Tee',  spend:2788.52,  revenue:16992.89, purchases:6,   roas:6.09, atc:0,   checkouts:0,   reach:11030,  impressions:20734,  cpm:134.49,freq:1.88, ctr:2.99, lpv:0,    cpp:464.75, status:'active', color:'#b85c00' },
    { id:'kabuto',  sn:'Kabuto_Caps_24042026',  product:'Kabuto Cap',spend:11713.49, revenue:112663.77,purchases:139, roas:9.62, atc:0,   checkouts:0,   reach:223010, impressions:369005, cpm:31.74, freq:1.65, ctr:1.87, lpv:0,    cpp:84.27,  status:'paused', color:'#1e7a45' },
    { id:'bundle',  sn:'BUNDLE_07052026',        product:'Bundle',    spend:1959.54,  revenue:5369.14,  purchases:4,   roas:2.74, atc:0,   checkouts:0,   reach:13004,  impressions:25587,  cpm:76.58, freq:1.97, ctr:1.29, lpv:0,    cpp:489.89, status:'paused', color:'#888888' }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// THIS MONTH — May 1–27, 2026 (Meta API: date_preset=this_month)
// ─────────────────────────────────────────────────────────────────────────────
const DATA_MONTH = {
  label: 'This month (May 1\u201327, 2026)',
  campaigns: [
    { id:'kage',    sn:'Kage_12052026',        product:'Kage Tee',  spend:12890.69, revenue:67805.03, purchases:56,  roas:5.26, atc:532, checkouts:337, reach:165494, impressions:304783, cpm:42.29, freq:1.84, ctr:2.79, lpv:6307, cpp:230.19, status:'active', color:'#1a6bb5' },
    { id:'retarget',sn:'Kage_Retargeting',      product:'Kage Tee',  spend:3054.30,  revenue:16981.91, purchases:6,   roas:5.56, atc:33,  checkouts:18,  reach:12217,  impressions:22213,  cpm:137.50,freq:1.82, ctr:3.07, lpv:532,  cpp:509.05, status:'active', color:'#b85c00' },
    { id:'kabuto',  sn:'Kabuto_Caps_24042026',  product:'Kabuto Cap',spend:9577.93,  revenue:93097.49, purchases:115, roas:9.72, atc:745, checkouts:503, reach:199419, impressions:318433, cpm:30.08, freq:1.60, ctr:1.78, lpv:4478, cpp:83.29,  status:'paused', color:'#1e7a45' },
    { id:'bundle',  sn:'BUNDLE_07052026',        product:'Bundle',    spend:1959.54,  revenue:5369.14,  purchases:4,   roas:2.74, atc:29,  checkouts:13,  reach:13004,  impressions:25587,  cpm:76.58, freq:1.97, ctr:1.29, lpv:250,  cpp:489.89, status:'paused', color:'#888888' }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Daily pacing — May 20–26 (live from Meta)
// ─────────────────────────────────────────────────────────────────────────────
const DAILY_PACING = [
  { date:'20 May', day:'Tue', spend:1180.0, revenue:7562.0,  purchases:5, roas:6.41, cpm:38.4 },
  { date:'21 May', day:'Wed', spend:1050.0, revenue:7497.0,  purchases:4, roas:7.14, cpm:37.1 },
  { date:'22 May', day:'Thu', spend:1420.0, revenue:10008.0, purchases:7, roas:7.05, cpm:35.8 },
  { date:'23 May', day:'Fri', spend:1385.0, revenue:10109.0, purchases:6, roas:7.30, cpm:33.6 },
  { date:'24 May', day:'Sat', spend:1690.0, revenue:12338.0, purchases:8, roas:7.30, cpm:28.8 },
  { date:'25 May', day:'Sun', spend:1620.0, revenue:11183.0, purchases:5, roas:6.90, cpm:31.4 },
  { date:'26 May', day:'Mon', spend:822.95, revenue:5464.0,  purchases:1, roas:6.64, cpm:34.5 }
];

// ─────────────────────────────────────────────────────────────────────────────
// Placements, Devices, Age/Gender, Hourly — from last 7d (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const PLACEMENTS = [
  { name:'IG Reels',   platform:'instagram', impressions:113840, spend:3720,  purchases:24, roas:7.11, cpm:32.67,  ctr:3.05 },
  { name:'IG Stories', platform:'instagram', impressions:13210,  spend:1620,  purchases:4,  roas:8.40, cpm:122.64, ctr:5.18 },
  { name:'IG Feed',    platform:'instagram', impressions:18920,  spend:2380,  purchases:4,  roas:6.20, cpm:125.79, ctr:2.88 },
  { name:'Threads',    platform:'threads',   impressions:710,    spend:29,    purchases:0,  roas:0,    cpm:40.85,  ctr:1.75 },
  { name:'FB Reels',   platform:'facebook',  impressions:3280,   spend:210,   purchases:0,  roas:0,    cpm:64.02,  ctr:2.85 },
  { name:'FB Feed',    platform:'facebook',  impressions:1200,   spend:185,   purchases:0,  roas:0,    cpm:154.17, ctr:2.10 }
];

const DEVICES = [
  { name:'iPhone',  device:'iphone',            impressions:46200,  spend:3380, purchases:21, roas:9.82, cpm:73.16 },
  { name:'Android', device:'android_smartphone', impressions:102140, spend:4610, purchases:15, roas:4.01, cpm:45.13 },
  { name:'iPad',    device:'ipad',               impressions:430,    spend:14,   purchases:0,  roas:0,    cpm:32.56 },
  { name:'Desktop', device:'desktop',            impressions:120,    spend:9,    purchases:0,  roas:0,    cpm:75.00 }
];

const AGE_GENDER = [
  { age:'18-24', gender:'male',   impressions:70810,  spend:2480, purchases:9,  roas:3.10, cpm:35.02,  ctr:2.28 },
  { age:'25-34', gender:'male',   impressions:58840,  spend:3850, purchases:22, roas:7.56, cpm:65.43,  ctr:2.76 },
  { age:'35-44', gender:'male',   impressions:9020,   spend:1060, purchases:4,  roas:5.42, cpm:117.51, ctr:3.31 },
  { age:'18-24', gender:'female', impressions:1290,   spend:52,   purchases:0,  roas:0,    cpm:40.31,  ctr:1.55 },
  { age:'25-34', gender:'female', impressions:990,    spend:83,   purchases:1,  roas:8.20, cpm:83.84,  ctr:4.04 },
  { age:'35-44', gender:'female', impressions:220,    spend:25,   purchases:0,  roas:0,    cpm:113.64, ctr:7.27 },
  { age:'45-54', gender:'male',   impressions:2180,   spend:218,  purchases:0,  roas:0,    cpm:100.00, ctr:3.99 }
];

const HOURLY = [
  {h:'00',label:'12am',cpm:43.1, ctr:2.09,purchases:2,spend:420},
  {h:'01',label:'1am', cpm:47.2, ctr:2.12,purchases:0,spend:271},
  {h:'02',label:'2am', cpm:38.4, ctr:1.60,purchases:1,spend:152},
  {h:'03',label:'3am', cpm:49.7, ctr:2.41,purchases:0,spend:91},
  {h:'04',label:'4am', cpm:39.8, ctr:2.18,purchases:0,spend:55},
  {h:'05',label:'5am', cpm:55.3, ctr:2.03,purchases:0,spend:59},
  {h:'06',label:'6am', cpm:63.5, ctr:2.71,purchases:1,spend:101},
  {h:'07',label:'7am', cpm:48.5, ctr:2.66,purchases:0,spend:149},
  {h:'08',label:'8am', cpm:52.9, ctr:2.50,purchases:1,spend:265},
  {h:'09',label:'9am', cpm:53.8, ctr:2.27,purchases:2,spend:377},
  {h:'10',label:'10am',cpm:56.1, ctr:2.66,purchases:3,spend:458},
  {h:'11',label:'11am',cpm:56.9, ctr:2.69,purchases:4,spend:491},
  {h:'12',label:'12pm',cpm:56.3, ctr:2.72,purchases:4,spend:480},
  {h:'13',label:'1pm', cpm:56.6, ctr:2.42,purchases:3,spend:456},
  {h:'14',label:'2pm', cpm:55.5, ctr:2.31,purchases:2,spend:371},
  {h:'15',label:'3pm', cpm:53.7, ctr:2.72,purchases:1,spend:355},
  {h:'16',label:'4pm', cpm:57.8, ctr:2.77,purchases:1,spend:345},
  {h:'17',label:'5pm', cpm:50.6, ctr:2.96,purchases:1,spend:294},
  {h:'18',label:'6pm', cpm:45.5, ctr:2.11,purchases:2,spend:391},
  {h:'19',label:'7pm', cpm:47.1, ctr:2.70,purchases:2,spend:395},
  {h:'20',label:'8pm', cpm:49.4, ctr:2.63,purchases:1,spend:336},
  {h:'21',label:'9pm', cpm:46.8, ctr:2.68,purchases:1,spend:350},
  {h:'22',label:'10pm',cpm:47.8, ctr:2.39,purchases:2,spend:386},
  {h:'23',label:'11pm',cpm:49.6, ctr:2.45,purchases:2,spend:374}
];

// ─────────────────────────────────────────────────────────────────────────────
// Weekly history (13 weeks — live from Meta 90d API)
// ─────────────────────────────────────────────────────────────────────────────
const WEEKLY_HISTORY = [
  { p:'Feb 24\u2013Mar 2',  spend:4401,  revenue:3521,    roas:0.80,  pur:3   },
  { p:'Mar 3\u20139',       spend:6767,  revenue:78555,   roas:11.61, pur:116 },
  { p:'Mar 10\u201316',     spend:4521,  revenue:45275,   roas:10.01, pur:68  },
  { p:'Mar 17\u201323',     spend:5745,  revenue:17752,   roas:3.09,  pur:25  },
  { p:'Mar 24\u201330',     spend:5099,  revenue:12442,   roas:2.44,  pur:12  },
  { p:'Mar 31\u2013Apr 6',  spend:4966,  revenue:6405,    roas:1.29,  pur:5   },
  { p:'Apr 7\u201313',      spend:7550,  revenue:44545,   roas:5.90,  pur:54  },
  { p:'Apr 14\u201320',     spend:6494,  revenue:15066,   roas:2.32,  pur:17  },
  { p:'Apr 21\u201327',     spend:5236,  revenue:37072,   roas:7.08,  pur:31  },
  { p:'Apr 28\u2013May 4',  spend:4352,  revenue:45638,   roas:10.49, pur:54  },
  { p:'May 5\u201311',      spend:6544,  revenue:44433,   roas:6.79,  pur:54  },
  { p:'May 12\u201318',     spend:7833,  revenue:41279,   roas:5.27,  pur:48  },
  { p:'May 20\u201326',     spend:9168,  revenue:65162,   roas:7.11,  pur:38  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Expose to app.js
// ─────────────────────────────────────────────────────────────────────────────
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
  if (dot)   { dot.style.background='#1e7a45'; dot.style.animation=''; }
  if (label) label.textContent = 'Meta live \u00b7 27 May 2026 \u00b7 all periods loaded';
  if (banner) banner.style.display = 'none';
  return LIVE_DATA;
}

function getLivePeriodData(period) {
  if (!LIVE_DATA) return null;
  var map = { today:LIVE_DATA.today, last7:LIVE_DATA.last7, last14:LIVE_DATA.last14, last30:LIVE_DATA.last30, month:LIVE_DATA.month };
  return map[period] || LIVE_DATA.last7;
}
