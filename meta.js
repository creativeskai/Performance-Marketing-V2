// /api/meta.js — Vercel serverless proxy for Meta Ads API
// Your META_ACCESS_TOKEN is stored as a Vercel environment variable.
// It never reaches the browser.

const AD_ACCOUNT = 'act_704523148804803';

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
      // Active campaigns with 7-day stats
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/campaigns` +
        `?fields=id,name,status,effective_status,objective` +
        `&limit=50&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_7d') {
      // Account-level 7-day insights
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=campaign_id,campaign_name,impressions,reach,frequency,spend,cpm,ctr,clicks,purchase_roas,actions,cost_per_action_type` +
        `&level=campaign&date_preset=last_7d&limit=50&access_token=${token}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (endpoint === 'insights_daily') {
      // Daily breakdown for last 7 days
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=campaign_id,campaign_name,impressions,spend,cpm,ctr,purchase_roas,actions` +
        `&level=campaign&date_preset=last_7d&time_increment=1&limit=100&access_token=${token}`;
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

    } else if (endpoint === 'insights_30d') {
      // 30-day insights
      const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT}/insights` +
        `?fields=campaign_id,campaign_name,impressions,reach,frequency,spend,cpm,ctr,clicks,purchase_roas,actions` +
        `&level=campaign&date_preset=last_30d&limit=50&access_token=${token}`;
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
