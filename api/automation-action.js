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

  const { action, proposalId, settings, overrides, followUpOverrides, overridesChain, title, reasoning, actionSummary, metaAction, module } = req.body || {};
  // overridesChain (array, index 0 = main step, 1 = followUp, 2 = followUp.followUp, ...)
  // is the current shape sent by the dashboard's chain-aware editor. overrides/
  // followUpOverrides are kept accepted for backward compatibility (old 2-step UI).
  const chainOverrides = overridesChain || [overrides, followUpOverrides];
  if (!['approve', 'reject', 'update-settings', 'create-proposal'].includes(action)) {
    return res.status(400).json({ error: 'action must be approve, reject, update-settings, or create-proposal' });
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

    } else if (action === 'create-proposal') {
      // Manual campaign built from scratch via the dashboard's "+ New campaign"
      // builder — same proposal shape and execution path as a routine-generated
      // one, just authored by a person instead of a rule module.
      if (!title || !metaAction || !metaAction.tool) {
        return res.status(400).json({ error: 'title and metaAction.tool are required' });
      }
      queue.proposals = queue.proposals || [];
      const existingNums = queue.proposals.map(p => Number(String(p.id).split('-')[1]) || 0);
      const nextId = 'A-' + String(Math.max(0, ...existingNums) + 1).padStart(3, '0');
      const newProposal = {
        id: nextId,
        module: module || 'manual-campaign',
        tier: 'approval',
        title,
        reasoning: reasoning || 'Created manually via the dashboard campaign builder.',
        actionSummary: actionSummary || 'Manually configured campaign chain.',
        metaAction,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      queue.proposals.push(newProposal);
      commitMessage = `New manual proposal ${nextId} created via dashboard`;
      responsePayload.newProposalId = nextId;

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
        // approve — flatten the whole chain (main, followUp, followUp.followUp, ...)
        // into a list of steps, merging each step's dashboard overrides over its
        // stored defaults. Nothing here re-derives an action, it only overrides values.
        const steps = [];
        let node = proposal.metaAction;
        let i = 0;
        while (node) {
          steps.push({ tool: node.tool, params: { ...node.params, ...(chainOverrides[i] || {}) } });
          node = node.followUp;
          i++;
        }
        const previousState = await captureState(steps[0], metaToken);
        const stepResults = [];
        let failedAt = -1;
        let failureError = null;
        for (let idx = 0; idx < steps.length; idx++) {
          try {
            // Resolve {{stepN.field}} placeholders against prior steps' real API
            // responses — a new ad set can't know its campaign_id until Meta
            // actually returns one from the campaign-creation call, etc.
            const resolvedParams = resolveTemplates(steps[idx].params, stepResults);
            const result = await execute({ tool: steps[idx].tool, params: resolvedParams }, metaToken);
            if (result && result.error) throw new Error(result.error.message || JSON.stringify(result.error));
            stepResults.push(result);
          } catch (e) {
            failedAt = idx;
            failureError = String((e && e.message) || e);
            break;
          }
        }
        proposal.status = failedAt === -1 ? 'executed' : 'failed';
        proposal.resolvedAt = resolvedAt;
        if (chainOverrides.some(Boolean)) proposal.appliedOverrides = chainOverrides;
        const detail = failedAt === -1
          ? { steps: stepResults }
          : { steps: stepResults, failedAtStep: failedAt, error: failureError };
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
        if (proposal.status === 'failed') responsePayload.executionError = failureError;
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

// Resolves the Facebook Page connected to this ad account — needed as
// object_story_spec.page_id whenever the dashboard's creative editor is used
// in "write new ad copy" mode (vs. reusing an existing creative_id).
async function resolvePageId(token) {
  const r = await fetch(`${GRAPH}/${AD_ACCOUNT}/promote_pages?fields=id&limit=1&access_token=${token}`);
  const j = await r.json();
  const id = j.data && j.data[0] && j.data[0].id;
  if (!id) throw new Error('Could not resolve a connected Facebook Page for this ad account — needed to build a new creative.');
  return id;
}

// Turns the dashboard creative editor's flat fields (body/title/cta/image_hash|
// video_id) into a real Meta ad creative via a standard link_data object_story_spec.
async function createCreativeFromFields(fields, token) {
  const pageId = await resolvePageId(token);
  const destLink = fields.link || 'https://hustlewithkai.com';
  const linkData = { message: fields.body, name: fields.title, link: destLink };
  if (fields.call_to_action_type) linkData.call_to_action = { type: fields.call_to_action_type, value: { link: destLink } };
  if (fields.video_id) linkData.video_id = fields.video_id;
  else if (fields.image_hash) linkData.image_hash = fields.image_hash;
  const objectStorySpec = { page_id: pageId, link_data: linkData };
  const body = new URLSearchParams({
    name: fields.name || 'New creative',
    object_story_spec: JSON.stringify(objectStorySpec),
    access_token: token
  });
  const r = await fetch(`${GRAPH}/${AD_ACCOUNT}/adcreatives`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  return await r.json();
}

// Resolves "{{stepN.field}}" placeholder strings against earlier steps' real
// API responses in a multi-step chain (e.g. an ad set's campaign_id can't be
// known until the campaign-creation call actually returns one from Meta).
// Walks arrays/objects recursively; non-matching strings pass through unchanged.
function resolveTemplates(value, stepResults) {
  if (typeof value === 'string') {
    const m = value.match(/^\{\{step(\d+)\.(\w+)\}\}$/);
    if (!m) return value;
    const stepResult = stepResults[Number(m[1])];
    return stepResult ? stepResult[m[2]] : value;
  }
  if (Array.isArray(value)) return value.map(v => resolveTemplates(v, stepResults));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = resolveTemplates(v, stepResults);
    return out;
  }
  return value;
}

// Generic dispatcher covering the finite metaAction.tool vocabulary used in ROUTINE.md.
// Mirrors what chat-driven execution does via the Meta Ads MCP, re-implemented as plain
// Graph API calls since a Vercel function can't call MCP tools directly.
async function execute(action, token) {
  let { tool, params = {} } = action;
  const qs = (obj) => Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : v)}`)
    .join('&');

  // The dashboard's creative editor ("write new ad copy" mode) sends its fields
  // under params.new_creative regardless of the target tool. Resolve that into
  // a real creative before doing anything else.
  if (params.new_creative) {
    const created = await createCreativeFromFields(params.new_creative, token);
    if (created.error) throw new Error(`Creative creation failed: ${created.error.message || JSON.stringify(created.error)}`);
    if (tool === 'ads_create_creative') return created; // the creative itself is the requested output
    const { new_creative, ...rest } = params;
    params = { ...rest, creative: { creative_id: created.id } };
  }

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
    case 'ads_creative_upload_image': {
      // params: { image_url, name? } — fetch the image and push it as base64 bytes.
      const { image_url, name } = params;
      if (!image_url) throw new Error('ads_creative_upload_image needs an image_url param');
      const imgResp = await fetch(image_url);
      if (!imgResp.ok) throw new Error(`Couldn't fetch image_url (${imgResp.status})`);
      const b64 = Buffer.from(await imgResp.arrayBuffer()).toString('base64');
      const r = await fetch(`${GRAPH}/${AD_ACCOUNT}/adimages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `bytes=${encodeURIComponent(b64)}${name ? `&name=${encodeURIComponent(name)}` : ''}&access_token=${token}`
      });
      return await r.json();
    }
    case 'ads_creative_upload_video': {
      // params: { file_url, name? } — Graph accepts a remote URL directly for videos.
      const { file_url, name } = params;
      if (!file_url) throw new Error('ads_creative_upload_video needs a file_url param');
      const r = await fetch(`${GRAPH}/${AD_ACCOUNT}/advideos?${qs({ file_url, name, access_token: token })}`, { method: 'POST' });
      return await r.json();
    }
    case 'ads_experiment_abtest_create_test': {
      // params: name, description?, start_time, end_time, cells (array of
      // {name, treatment_percentage, campaign_ids|adset_ids}), objectives?
      const r = await fetch(`${GRAPH}/${AD_ACCOUNT}/ad_studies?${qs({ ...params, type: 'SPLIT_TEST', access_token: token })}`, { method: 'POST' });
      return await r.json();
    }
    default:
      throw new Error(`"${tool}" isn't supported by in-app execution — approve this one via chat instead.`);
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
