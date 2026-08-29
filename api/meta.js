// /api/meta.js — Vercel serverless proxy for Meta Ads API
// Your META_ACCESS_TOKEN is stored as a Vercel environment variable.
// It never reaches the browser.

const AD_ACCOUNT = 'act_704523148804803';
const CAMPAIGN_FIELDS = 'campaign_id,campaign_name,impressions,reach,frequency,spend,cpm,ctr,clicks,purchase_roas,actions,cost_per_action_type';

export default async function handler(req, res) {
  // CORS — allow your domain only in production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'META_ACCESS_TOKEN not configured in Vercel env vars' });
  }

  const { endpoint = 'campaigns' } = req.query;

  try {
    let data;

    if (endpoint === 'campaigns') {
      // All campaigns with status/objective (used to merge real status + filter by objective)
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/campaigns` +
        `?fields=id,name,status,effective_status,objective` +
        `&limit=500&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_today') {
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=${CAMPAIGN_FIELDS}` +
        `&level=campaign&date_preset=today&limit=100&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_7d') {
      // Active campaigns with 7-day stats
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=${CAMPAIGN_FIELDS}` +
        `&level=campaign&date_preset=last_7d&limit=100&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_14d') {
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=${CAMPAIGN_FIELDS}` +
        `&level=campaign&date_preset=last_14d&limit=100&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_30d') {
      // 30-day insights
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=${CAMPAIGN_FIELDS}` +
        `&level=campaign&date_preset=last_30d&limit=100&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_month') {
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=${CAMPAIGN_FIELDS}` +
        `&level=campaign&date_preset=this_month&limit=100&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_daily') {
      // Daily breakdown for last 7 days
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=campaign_id,campaign_name,impressions,spend,cpm,ctr,purchase_roas,actions` +
        `&level=campaign&date_preset=last_7d&time_increment=1&limit=200&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_placement') {
      // Placement breakdown
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=impressions,spend,cpm,ctr,purchase_roas,actions` +
        `&level=account&date_preset=last_7d&breakdowns=publisher_platform,platform_position` +
        `&limit=50&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_device') {
      // Device breakdown
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=impressions,spend,cpm,ctr,purchase_roas,actions` +
        `&level=account&date_preset=last_7d&breakdowns=impression_device` +
        `&limit=50&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_age') {
      // Age/gender breakdown
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=impressions,spend,cpm,ctr,purchase_roas,actions` +
        `&level=account&date_preset=last_7d&breakdowns=age,gender` +
        `&limit=100&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_hourly') {
      // Hourly breakdown
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=impressions,spend,cpm,ctr,actions` +
        `&level=account&date_preset=last_7d` +
        `&breakdowns=hourly_stats_aggregated_by_advertiser_time_zone` +
        `&limit=100&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'opportunity_score') {
      // Opportunity score
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}` +
        `?fields=opportunity_score_recommendations` +
        `&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'lookups') {
      // Powers the Automation tab's parameter editor — real, pickable options
      // (not free text) for audience/creative/geo fields on a proposal.
      const [audRes, creaRes, geoRes] = await Promise.all([
        fetch(`https://graph.facebook.com/v19.0/${AD_ACCOUNT}/customaudiences` +
          `?fields=id,name,subtype,approximate_count_lower_bound,delivery_status` +
          `&limit=200&access_token=${token}`),
        fetch(`https://graph.facebook.com/v19.0/${AD_ACCOUNT}/adcreatives` +
          `?fields=id,name&limit=200&access_token=${token}`),
        fetch(`https://graph.facebook.com/v19.0/search` +
          `?type=adgeolocation&location_types=${encodeURIComponent('["region"]')}` +
          `&country_code=IN&limit=200&access_token=${token}`)
      ]);
      const [aud, crea, geo] = await Promise.all([audRes.json(), creaRes.json(), geoRes.json()]);
      data = {
        custom_audiences: aud.data || aud,
        creatives: crea.data || crea,
        regions: geo.data || geo
      };

    } else if (endpoint === 'adset_targeting') {
      // Live current targeting spec for one ad set — lets the dashboard's
      // targeting editor pre-fill with what's actually running, not blank.
      const { adset_id } = req.query;
      if (!adset_id) return res.status(400).json({ error: 'adset_id required' });
      const url = `https://graph.facebook.com/v19.0/${adset_id}` +
        `?fields=name,targeting&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'targeting_search') {
      // Powers the targeting editor's interest/behavior suggestion search box.
      // ?q=<term>&class=interests|behaviors (default interests)
      const { q = '', class: cls = 'interests' } = req.query;
      if (!q || q.trim().length < 2) {
        return res.status(200).json({ data: [] }); // don't hit Graph for 0-1 char queries
      }
      const type = cls === 'behaviors' ? 'adTargetingCategory' : 'adinterest';
      const classParam = cls === 'behaviors' ? '&class=behaviors' : '';
      const url = `https://graph.facebook.com/v19.0/search` +
        `?type=${type}${classParam}&q=${encodeURIComponent(q)}&limit=15&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else {
      return res.status(400).json({ error: 'Unknown endpoint: ' + endpoint });
    }

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (err) {
    console.error('Meta API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
