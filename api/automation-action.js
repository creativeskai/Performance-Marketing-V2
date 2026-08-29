// /api/automation-action.js — Vercel serverless endpoint for in-app automation actions.
// Powers the Automation tab's Approve / Reject buttons and the editable Settings form.
//
// Auth: shared-secret header (x-automation-key), checked against AUTOMATION_API_KEY.
// This is the SAME accepted security model as the existing login gate (see
// PROJECT_NOTES.md #9 / index.html's AUTH_USER comment) — client-side visible,
// not real protection against someone reading the public repo source, just
// stops casual/automated abuse. Not a session/auth system by design.
//
// Storage: automation/queue.json is read/written live via the GitHub Contents
// API (not the bundled static file, which only reflects the last deploy) so
// back-to-back actions never clobber each other's changes. Every write is a
// real commit, which triggers the normal Vercel redeploy.
//
// Required env vars: META_ACCESS_TOKEN (already in use by api/meta.js),
// AUTOMATION_API_KEY (new), GITHUB_TOKEN (new — repo-scoped PAT with
// Contents read/write on creativeskai/Performance-Marketing-V2).

const REPO_OWNER = 'creativeskai';
const REPO_NAME = 'Performance-Marketing-V2';
const QUEUE_PATH = 'automation/queue.json';
const AD_ACCOUNT = 'act_704523148804803';
const GRAPH = 'https://graph.facebook.com/v19.0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-automation-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const key = req.headers['x-automation-key'];
  if (!key || key !== process.env.AUTOMATION_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const metaToken = process.env.META_ACCESS_TOKEN;
  const ghToken = process.env.GITHUB_TOKEN;
  if (!metaToken || !ghToken) {
    return res.status(500).json({ error: 'Server misconfigured: missing META_ACCESS_TOKEN or GITHUB_TOKEN env var' });
  }

  const { action, proposalId, settings } = req.body || {};
  if (!['approve', 'reject', 'update-settings'].includes(action)) {
    return res.status(400).json({ error: 'action must be approve, reject, or update-settings' });
  }

  try {
    // 1. Read the live file from GitHub (not the deploy bundle) to avoid stale reads.
    const getResp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${QUEUE_PATH}`,
      { headers: { Authorization: `Bearer ${ghToken}`, Accept: 'application/vnd.github+json' } }
    );
    if (!getResp.ok) throw new Error(`GitHub read failed: ${getResp.status} ${await getResp.text()}`);
    const getJson = await getResp.json();
    const sha = getJson.sha;
    const queue = JSON.parse(Buffer.from(getJson.content, 'base64').toString('utf8'));

    let commitMessage;
    let responsePayload = {};

    if (action === 'update-settings') {
      if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        return res.status(400).json({ error: 'settings must be an object' });
      }
      queue.settings = { ...queue.settings, ...settings };
      commitMessage = `Settings update via dashboard: ${Object.keys(settings).join(', ')}`;

    } else {
      const proposal = (queue.proposals || []).find(p => p.id === proposalId);
      if (!proposal) return res.status(404).json({ error: `Proposal ${proposalId} not found` });
      if (proposal.status !== 'pending') {
        return res.status(409).json({ error: `Proposal ${proposalId} is already "${proposal.status}"` });
      }
      if (proposal.tier === 'auto') {
        return res.status(409).json({ error: `${proposalId} is an auto-tier action and should never be pending — check the routine.` });
      }

      const resolvedAt = new Date().toISOString();

      if (action === 'reject') {
        proposal.status = 'rejected';
        proposal.resolvedAt = resolvedAt;
        commitMessage = `Rejected ${proposalId} via dashboard`;
        queue.log = queue.log || [];
        queue.log.push({ proposalId, action: proposal.actionSummary, result: 'rejected', tier: proposal.tier, executedAt: resolvedAt });

      } else {
        // approve
        const previousState = await captureState(proposal.metaAction, metaToken);
        let detail;
        try {
          detail = await execute(proposal.metaAction, metaToken);
          if (proposal.metaAction.followUp) {
            detail.followUp = await execute(proposal.metaAction.followUp, metaToken);
          }
          proposal.status = 'executed';
        } catch (e) {
          proposal.status = 'failed';
          detail = { error: String((e && e.message) || e) };
        }
        proposal.resolvedAt = resolvedAt;
        queue.log = queue.log || [];
        queue.log.push({
          proposalId,
          action: proposal.actionSummary,
          result: proposal.status === 'executed' ? 'success' : 'failed',
          previousState,
          detail,
          tier: proposal.tier,
          executedAt: resolvedAt
        });
        commitMessage = `${proposal.status === 'executed' ? 'Executed' : 'Failed executing'} ${proposalId} via dashboard`;
        responsePayload.executionResult = proposal.status;
        if (proposal.status === 'failed') responsePayload.executionError = detail.error;
      }
    }

    queue.generatedAt = new Date().toISOString();

    // 2. Commit the updated file back.
    const putResp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${QUEUE_PATH}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${ghToken}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: commitMessage,
          content: Buffer.from(JSON.stringify(queue, null, 2)).toString('base64'),
          sha
        })
      }
    );
    if (!putResp.ok) throw new Error(`GitHub write failed: ${putResp.status} ${await putResp.text()}`);

    return res.status(200).json({ ok: true, queue, ...responsePayload });
  } catch (err) {
    console.error('automation-action error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Generic dispatcher covering the finite metaAction.tool vocabulary used in ROUTINE.md.
// Mirrors what chat-driven execution does via the Meta Ads MCP, re-implemented as plain
// Graph API calls since a Vercel function can't call MCP tools directly.
async function execute(action, token) {
  const { tool, params = {} } = action;
  const qs = (obj) => Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : v)}`)
    .join('&');

  switch (tool) {
    case 'ads_update_entity': {
      const { entity_id, field, value } = params;
      const r = await fetch(`${GRAPH}/${entity_id}?${qs({ [field]: value, access_token: token })}`, { method: 'POST' });
      return await r.json();
    }
    case 'ads_activate_entity': {
      const { entity_id } = params;
      const r = await fetch(`${GRAPH}/${entity_id}?${qs({ status: 'ACTIVE', access_token: token })}`, { method: 'POST' });
      return await r.json();
    }
    case 'ads_create_custom_audience': {
      const r = await fetch(`${GRAPH}/${AD_ACCOUNT}/customaudiences?${qs({ ...params, access_token: token })}`, { method: 'POST' });
      return await r.json();
    }
    case 'ads_create_campaign': {
      const r = await fetch(`${GRAPH}/${AD_ACCOUNT}/campaigns?${qs({ ...params, access_token: token })}`, { method: 'POST' });
      return await r.json();
    }
    case 'ads_create_ad_set': {
      const r = await fetch(`${GRAPH}/${AD_ACCOUNT}/adsets?${qs({ ...params, access_token: token })}`, { method: 'POST' });
      return await r.json();
    }
    case 'ads_create_ad': {
      const r = await fetch(`${GRAPH}/${AD_ACCOUNT}/ads?${qs({ ...params, access_token: token })}`, { method: 'POST' });
      return await r.json();
    }
    case 'ads_create_creative': {
      const r = await fetch(`${GRAPH}/${AD_ACCOUNT}/adcreatives?${qs({ ...params, access_token: token })}`, { method: 'POST' });
      return await r.json();
    }
    case 'ads_catalog_create_product_set': {
      const { catalog_id, ...rest } = params;
      const r = await fetch(`${GRAPH}/${catalog_id}/product_sets?${qs({ ...rest, access_token: token })}`, { method: 'POST' });
      return await r.json();
    }
    default:
      // Multipart uploads (ads_creative_upload_image/video) and the split-test API
      // (ads_experiment_abtest_create_test) aren't wired into the app dispatcher yet —
      // those proposals still need "approve <id>" in chat. Fail loudly, not silently.
      throw new Error(`"${tool}" isn't supported by in-app execution yet — approve this one via chat instead.`);
  }
}

// Best-effort "before" snapshot for rollback logging. Only meaningful for the
// two mutation types that change a single scalar field on an existing entity.
async function captureState(action, token) {
  const { tool, params = {} } = action;
  if (tool !== 'ads_update_entity' && tool !== 'ads_activate_entity') return null;
  const { entity_id, field } = params;
  const fieldsToFetch = tool === 'ads_activate_entity' ? 'status' : (field || 'status');
  try {
    const r = await fetch(`${GRAPH}/${entity_id}?fields=${encodeURIComponent(fieldsToFetch)}&access_token=${token}`);
    return await r.json();
  } catch {
    return null;
  }
}
