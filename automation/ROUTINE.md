# KAI Automation Routine

This file is the spec a scheduled Claude routine follows on each run to keep
`automation/queue.json` current. It is not executable code — the routine reads
this file, uses the Meta Ads MCP connection (and, for Phase 3 modules, the
Higgsfield MCP connection) to pull live data, evaluates each module below,
and writes/updates `automation/queue.json`, then commits and pushes (which
triggers the normal Vercel redeploy of the dashboard).

Ad account: `704523148804803` ("Kai Ad Account", hustle_kai business
`511869488526421`). Product catalog: `1149969713295773` (Shopify).

## Two execution tiers

Every module below carries a **tier**:

- **`auto`** — the routine executes it itself, during the same run it detects
  the trigger, via the Meta Ads MCP connection. No human is in the loop. It
  never appears as a pending proposal — it shows up already-completed in
  `log`, subject to rate limiting (see below).
- **`approval`** — the routine writes a pending **proposal** with a stored
  `metaAction`. A human decides. There are now **two equivalent approval
  paths**:
  1. **In-app**: the dashboard's Automation tab has real Approve/Reject
     buttons that call `api/automation-action.js`, which executes the
     `metaAction` via direct Meta Graph API calls and commits the result.
  2. **Chat**: the user tells Claude "approve `<id>`" / "reject `<id>`" and
     Claude executes it via the Meta Ads MCP connection, same as before.

  Both paths read/write the same `queue.json` and produce an identical `log`
  entry — pick whichever is convenient.

Default rule of thumb for tiering a module: if it creates a new spend
commitment, changes what's currently live/delivering, or moves budget, it's
`approval`. If it only refines targeting on already-approved spend, tags
creative, reports/monitors, or is itself a safety mechanism, it's `auto`.

Alerts (the informational-only schema below) are never gated by tier — they
never mutate the account, so they're always written directly, same as before.

## Safety infrastructure (required before any `auto` module may execute)

- **Rate limiting**: before an `auto` module executes, check `log` for an
  entry on the same `entity_id` from the same `module` within the last 24h.
  If `settings.max_auto_actions_per_entity_per_day` (default 1) has already
  been reached for that pair, skip execution this run and write an alert
  instead ("would have acted, rate-limited") rather than silently dropping it.
- **Rollback logging**: every `log` entry — auto or approved — must capture
  `previousState`: whatever the mutated field's value was immediately before
  the change (fetch it right before executing). This is what makes "revert
  A-0XX" a real, answerable request instead of a guess.
- **Hard spend circuit breaker**: every run, before evaluating anything else,
  pull today's account-level spend (`ads_get_ad_entities`, level=ad_account,
  date_preset=today) and compare to `settings.hard_spend_ceiling_inr`. If
  breached: immediately pause every active campaign (`ads_update_entity`,
  status=PAUSED, looped over all active campaign IDs — this itself is `auto`,
  it's the emergency brake), set top-level `circuitBreaker: {tripped:true,
  trippedAt, reason}`, and write a `severity:"high"` alert. **Do not
  auto-resume.** Coming back from a trip always requires a new
  `resume-after-circuit-breaker` proposal (`approval` tier, module below) —
  auto-resuming a tripped breaker defeats its purpose.
- **Pixel/data-quality gate**: before evaluating any ROAS-driven module
  (auto or approval), check `ads_get_dataset_quality`. If match-rate is below
  `settings.pixel_quality_min_match_rate`, suppress ROAS-based decisions this
  run — still emit the `pixel-health` alert, just don't act on numbers you
  don't trust yet.

## Proposal schema

```json
{
  "id": "A-###",
  "module": "<module key below>",
  "tier": "approval",
  "title": "short human title",
  "reasoning": "why, in plain English, citing real numbers",
  "actionSummary": "what will actually happen if approved, in plain English",
  "metaAction": { "tool": "<MCP tool name>", "params": {...}, "followUp": {...optional} },
  "status": "pending",
  "createdAt": "ISO timestamp"
}
```

`metaAction` must contain everything needed to execute without re-deriving
anything. Both the in-app endpoint and chat execution run exactly what's
stored here.

**In-app execution support** (see `api/automation-action.js`'s dispatcher)
covers: `ads_update_entity`, `ads_activate_entity`, `ads_create_custom_audience`,
`ads_create_campaign`, `ads_create_ad_set`, `ads_create_ad`, `ads_create_creative`,
`ads_catalog_create_product_set`, `ads_creative_upload_image`, `ads_creative_upload_video`,
`ads_experiment_abtest_create_test`. Any `metaAction.tool` outside this list
fails gracefully in-app with a message pointing back to chat approval instead.
Proposals whose `metaAction.params.field === "targeting"` get the full
targeting editor in the dashboard (age/gender/geo include-exclude/devices/
placements/excluded audiences/interest &amp; behavior search) instead of a raw
JSON field — see `api/meta.js`'s `adset_targeting` and `targeting_search`
endpoints. Proposals whose `metaAction.tool` (or `followUp.tool`) is
`ads_create_ad` or `ads_create_creative` get a creative editor — reuse an
existing creative by id, or write new primary text/headline/CTA and pick an
image or video from the account (see `lookups`' `images`/`videos`, and
`automation-action.js`'s `createCreativeFromFields`, which builds a standard
`link_data` object_story_spec against the account's connected Page).

Execution walks the full chain (`main` → `followUp` → `followUp.followUp` →
…) to arbitrary depth, resolving `"{{stepN.field}}"` placeholders in a later
step's params against an earlier step's real Meta API response (e.g. an ad
set's `campaign_id` can't be known until the campaign-creation call actually
returns one). Every step in a chain gets its own editor panel in the
dashboard (numbered "Step N — tool"), including the targeting/creative
editors wherever they apply — the earlier "overrides only apply to the first
two steps" limitation is gone; the dashboard sends a full `overridesChain`
array, one entry per step. `A-002` (`high-intent-retargeting`) is now a real
4-step chain (audience → campaign → ad set → ad) using the account's actual
active pixel (`833131719490535`) and the real Kage_Sales creative
(`1063318642863205`), rebuilt 2026-08-29 — every step is created `PAUSED`,
so approving it does not start spending; it needs a manual activate after
review. The `ads_create_ad_set`'s `daily_budget` (25000, i.e. ₹250/day in
Meta's minor-currency-unit field) is a concrete committed number, editable in
the dashboard like any other field, not a placeholder note.

## Alert schema

```json
{
  "id": "AL-###",
  "module": "<module key below>",
  "title": "short human title",
  "detail": "plain-English explanation",
  "severity": "low|medium|high",
  "dismissed": false,
  "createdAt": "ISO timestamp"
}
```

## Log schema

```json
{
  "proposalId": "A-### (or null for a pure-auto action with no proposal)",
  "action": "what happened, plain English",
  "result": "success|failed|rejected",
  "previousState": { "...": "whatever was true immediately before" },
  "detail": { "...": "raw API response, for debugging" },
  "tier": "auto|approval",
  "executedAt": "ISO timestamp"
}
```

## Every run, in order

1. Read `automation/queue.json` for current `settings`, `circuitBreaker`,
   and existing `proposals`/`alerts`/`log` (for de-duplication and rate
   limiting).
2. **Circuit breaker check first** (see Safety infrastructure). If it trips
   this run, still continue through the rest of the steps so alerts/digest
   still get written, but skip all other `auto`-tier mutations this run.
3. **Pixel quality gate check** — note whether ROAS-based modules are
   suppressed this run.
4. Pull fresh data via Meta Ads MCP: campaign/adset/ad-level
   `ads_get_ad_entities` for `today`/`last_7d`/`last_14d`/`last_30d`/
   `this_month`, plus the specific breakdowns/tools each module below calls
   for. For Phase 3 modules, pull creative assets and use the Higgsfield MCP
   connection as needed.
5. Evaluate every module in tier order — `auto` modules first (rate-limit
   check → execute → log), then `approval` modules (write/update proposals).
   Each module either produces nothing (conditions not met), a new **Alert**,
   a new **Proposal**, or — for `auto` modules — an immediate **Log** entry.
6. **De-duplication**: don't create a new proposal/alert for the same
   underlying issue if one with `status: "pending"` (or created in the last 3
   days, even if resolved) already exists for that module + entity. Update
   the existing one's `reasoning`/data instead if the underlying numbers
   moved. For `auto` modules, rate limiting (above) serves the equivalent
   purpose.
7. Any proposal still `status:"pending"` whose `tier` is now `auto` (e.g.
   left over from before this tiering system existed) should be executed
   immediately this run, same as any other `auto` module, then removed from
   the pending list into `log`.
8. Set `generatedAt` to the current ISO timestamp.
9. Write the file, `git add automation/queue.json && git commit -m
   "Automation run: <date>" && git push`.
10. Send a push notification summarizing what's new: counts of new
    proposals/alerts/auto-executed actions, and the single highest-priority
    item, if any (a circuit-breaker trip always wins here).

## Modules

### Alerts & auto-executed monitoring (always `auto` — never mutate delivery)

| # | Module key | Trigger | Data source |
|---|---|---|---|
| 1 | `threshold-alerts` | Active campaign's CPM/CTR/CPC moves outside historical-norm bands | `ads_get_ad_entities` (campaign, trailing 30d baseline vs 7d) |
| 2 | `anomaly` | Native anomaly signal fires | `ads_insights_anomaly_signal` |
| 3 | `anomaly-root-cause` | Extends #2 — once an anomaly fires, pull the breakdowns needed to name a likely driver (creative fatigue, targeting shift, seasonality, bid landscape) | Derived from #2's inputs |
| 4 | `learning-phase-stuck` | Ad set in learning >7 days without exiting | `ads_get_ad_entities` (adset delivery status) |
| 5 | `spend-pacing` | Month-to-date spend vs. `monthly_spend_goal_inr` (skip entirely if `null`) | `ads_get_ad_entities` (account, this_month) |
| 6 | `pixel-health` | Dataset quality/match-rate drops or an expected event stops firing | `ads_get_dataset_quality`, `ads_get_dataset_stats` |
| 7 | `competitor-rescrape` / `competitor-spike` | Scheduled refresh of Gully Labs / Lotto Sport India active-ad counts; alert if count moved ≥20% since last recorded scrape | `ads_library_search` |
| 8 | `weekly-digest` | Every 7th run (or Monday) | Rolled-up summary of the week's real numbers |
| 9 | `monthly-digest` | First run of a new calendar month | Rolled-up summary of the month's real numbers |
| 10 | `self-audit-check` | Re-pull the live numbers backing the dashboard's static snapshot (spend/ROAS/purchases for current period); alert if drift exceeds tolerance. Also the home for **KPI-to-trigger completeness**: confirm every metric surfaced on the dashboard maps to at least one module in this table — flag any that don't | `ads_get_ad_entities` vs. values baked into `index.html`'s `DATA`/`INSIGHTS_DATA` |
| 11 | `campaign-consolidation-watch` | Multiple active/recently-active campaigns targeting the same product+audience — informational flag; the actual pause is `campaign-consolidation` below (approval) | `ads_get_ad_entities` (campaign) |

### Proposals — `auto` tier (executes immediately, rate-limited + logged)

| # | Module key | Trigger | Data source | `metaAction.tool` |
|---|---|---|---|---|
| 12 | `purchaser-exclusion` | Active prospecting campaign's targeting doesn't already exclude the purchaser/customer custom audience | `ads_get_ad_entities` (targeting spec), `ads_get_ad_account_custom_audiences` | `ads_update_entity` (targeting) |
| 13 | `lookalike-refresh` | A purchaser-based LAL audience is older than `lookalike_refresh_days`, or the source purchaser audience grew ≥20% since last build | `ads_get_custom_audience` | `ads_create_custom_audience` (subtype LOOKALIKE) |
| 14 | `hook-angle-tagging` | An active/recently-active ad's creative has no `creativeTags` entry yet | `ads_get_ad_images`/`ads_get_ad_videos` + Higgsfield vision analysis | *(no Meta write — writes to `queue.json.creativeTags`)* |
| 15 | `hard-spend-circuit-breaker` | Today's account spend breaches `hard_spend_ceiling_inr` | `ads_get_ad_entities` (account, today) | `ads_update_entity` (status=PAUSED, all active campaigns) |

### Proposals — `approval` tier (pending card, in-app or chat approval)

| # | Module key | Trigger | Data source | `metaAction.tool` |
|---|---|---|---|---|
| 16 | `pause-kill` | Active sales-objective campaign, spend ≥ `kill_roas_threshold` floor, ROAS below it | `ads_get_ad_entities` (campaign, last_14d) | `ads_update_entity` (status=PAUSED) |
| 17 | `reactivate-winner` | Paused campaign, last active-period ROAS ≥ `reactivate_min_historic_roas` | `ads_get_ad_entities` (campaign, last_30d + lifetime) | `ads_activate_entity` + `ads_update_entity` (budget) |
| 18 | `resume-after-circuit-breaker` | Circuit breaker is tripped and account data now looks sane again (human-reviewable, never auto) | `ads_get_ad_entities` | `ads_activate_entity` (per paused campaign) |
| 19 | `high-intent-retargeting` | ATC/checkout/video-viewer events with no matching purchase in `retarget_window_days`, segmented by intent depth | `ads_pixel_event_read` | `ads_create_custom_audience` + `ads_create_campaign`/`ads_create_ad_set` |
| 20 | `engagement-tier-segmentation` | A retargeting audience mixes multiple intent depths (view/ATC/checkout) with a single bid/budget — propose splitting so higher-intent tiers get materially different bids/budgets | `ads_get_ad_entities` (adset targeting + results) | `ads_update_entity` (adset budget/bid) or `ads_create_ad_set` (split) |
| 21 | `age-gender-auto-shift` | An age/gender cell's ROAS is materially above/below account average at meaningful spend | Audience breakdown (`age`,`gender`) | `ads_update_entity` (targeting/budget) |
| 22 | `geo-scaling` | A state/city's ROAS beats account average at meaningful spend | Geography breakdown | `ads_update_entity` (budget increase, or targeting) |
| 23 | `geo-suppression` | A state/city's CTR/ROAS is poor at meaningful spend | Geography breakdown | `ads_update_entity` (exclude/cap region) |
| 24 | `new-geo-testing` | A geo similar to a winning geo (by demographic/behavioral profile) has no current spend | Geography breakdown + winners from #22 | `ads_create_ad_set` (small test budget) |
| 25 | `placement-optimization` | CPM/conversion-efficiency gap across Feed/Reels/Stories placements | `breakdowns=publisher_platform,platform_position` | `ads_update_entity` (placement budget/targeting) |
| 26 | `device-targeting` | A device segment shows high CPM + low conversion | `breakdowns=impression_device` | `ads_update_entity` (targeting) |
| 27 | `frequency-capping` | A segment (placement/device/age) shows rising frequency with falling ROAS | Insights breakdowns | `ads_update_entity` (frequency cap / schedule) |
| 28 | `creative-fatigue` | Active ad frequency ≥ `fatigue_frequency_threshold`, or CTR down ≥30% week-over-week | `ads_get_ad_entities` (ad, last_7d vs prior 7d) | `ads_creative_upload_image`/`video` + `ads_create_creative`/`ads_create_ad`, or `ads_update_entity` (narrow targeting) |
| 29 | `auto-creative-generation-launch` | A Higgsfield-generated variant (briefed off the current top performer — generation itself is `auto`, module 14's sibling) is ready to go live | Higgsfield MCP output + `ads_get_creatives` | `ads_creative_upload_image`/`video` + `ads_create_ad` |
| 30 | `ab-test` | Two or more creative variants exist for the same concept with no structured test running | `ads_get_creatives` | `ads_experiment_abtest_create_test` |
| 31 | `budget-reallocation` | Two+ active campaigns/adsets with ROAS gap ≥ `budget_reallocation_min_roas_gap` | `ads_get_ad_entities` (campaign, rolling 7d) | `ads_update_entity` (daily_budget, multiple) |
| 32 | `dayparting` | Hourly breakdown shows a clear, consistent low/high-ROAS window | `breakdowns=hourly_stats_aggregated_by_advertiser_time_zone` | `ads_update_entity` (ad set schedule) |
| 33 | `bid-strategy-adjustment` | Real CPA has drifted materially from the current bid/cost cap | `ads_get_ad_entities` (campaign, cost_per_result trend) | `ads_update_entity` (bid_amount/bid_strategy) |
| 34 | `campaign-consolidation` | Confirmed duplicate campaigns (flagged by #11) targeting the same product+audience | `ads_get_ad_entities` (campaign) | `ads_update_entity` (pause the weaker one) |
| 35 | `catalog-dpa-launch` | Catalog connected, zero DPA/catalog-based campaigns running | `ads_catalog_get_diagnostics`, `ads_catalog_list_product_sets` | `ads_catalog_create_product_set` + `ads_create_ad` |

## Settings editing

`settings` in `queue.json` is a flat key/value map (numbers or short strings;
`note` and any nested object like `competitor_last_scrape` are excluded from
the editable form). It's editable two ways, both ending in the same GitHub
commit:

1. **In-app**: the Automation tab's Settings panel renders every top-level
   scalar key as an input with a Save button, which calls
   `api/automation-action.js` with `{action:"update-settings", settings:{...}}`.
2. **Chat**: tell Claude the new value; it edits `queue.json` directly and
   commits.

Every module above reads its thresholds from `settings` at evaluation time —
there is no separate config anywhere else, so an in-app edit takes effect on
the very next scheduled run.

## Execution (on approval)

**Chat path** — when the user says "approve `A-###`":
1. Read `automation/queue.json`, find that proposal, use its stored
   `metaAction` exactly as written — do not re-derive parameters.
2. Capture `previousState` (fetch the current value of whatever's about to
   change), then call the MCP tool(s) (`metaAction`, then `followUp` if
   present).
3. Update the proposal's `status` to `"executed"` (or `"failed"` with the
   error), set `resolvedAt`.
4. Append the `log` entry per the schema above (including `previousState`
   and `tier`).
5. Commit + push, then report the outcome back to the user in chat.

If the user says "reject `A-###`" instead: set `status:"rejected"`,
`resolvedAt`, append a `log` entry with `result:"rejected"`, commit + push —
no Meta API call.

**In-app path** — `api/automation-action.js` does the identical sequence
server-side via direct Meta Graph API calls (not MCP, since a Vercel function
can't invoke MCP tools), reading/writing `queue.json` live via the GitHub
Contents API instead of chat. Same schema, same log shape, same commit.

## Mapping to the requested capability list

Every item from the original 34-point ask, traced to its module key above
(★ = new this rewrite, others existed pre-rewrite and just gained a tier):

Purchaser exclusion→★`purchaser-exclusion` · Lookalike refresh→★`lookalike-refresh` ·
High-intent retargeting→`high-intent-retargeting` · Engagement-tier segmentation→★`engagement-tier-segmentation` ·
Age/gender auto-shift→`age-gender-auto-shift` · Geo scaling→★`geo-scaling` · Geo suppression→★`geo-suppression` ·
New-geo testing→★`new-geo-testing` · Placement optimization→★`placement-optimization` · Device targeting→★`device-targeting` ·
Frequency capping→`frequency-capping` · Fatigue detection & rotation→`creative-fatigue` ·
Auto-creative generation→★`hook-angle-tagging`(gen)+★`auto-creative-generation-launch`(ship) ·
Structured A/B testing→`ab-test` · Hook/angle tagging→★`hook-angle-tagging` ·
CPM/CTR/CPC threshold alerts→★`threshold-alerts` · Budget reallocation→`budget-reallocation` ·
Dayparting→`dayparting` · Bid-strategy adjustment→★`bid-strategy-adjustment` · Spend-pacing tracking→`spend-pacing` ·
Auto pause/kill→`pause-kill` · Auto-reactivation→`reactivate-winner` · Campaign consolidation→`campaign-consolidation` ·
Learning-phase monitoring→`learning-phase-stuck` · Catalog/DPA activation→`catalog-dpa-launch` ·
Hard spend circuit breaker→★`hard-spend-circuit-breaker` · Approval tiers→★(this rewrite's core framework) ·
Rate limiting→★(Safety infrastructure) · Rollback logging→★(Safety infrastructure, `previousState`) ·
Pixel/data-quality gate→★(Safety infrastructure) + `pixel-health` alert · Anomaly detection→`anomaly` ·
KPI-to-trigger mapping→★(folded into `self-audit-check`) · Weekly/monthly digest→`weekly-digest`+★`monthly-digest` ·
Anomaly root-cause report→★`anomaly-root-cause` · Competitor benchmark cadence→`competitor-rescrape`/`competitor-spike` ·
Self-audit check→★`self-audit-check`.

## Build phasing (for whoever's extending this next)

- **Phase 1 (this rewrite)**: tiering, safety infrastructure, in-app
  approval + settings editing, all 21 pre-existing modules retagged. Modules
  12, 13, 16–35 execute against real Meta Ads MCP calls already proven out in
  earlier sessions.
- **Phase 2**: modules 19–27, 33 (geo/placement/device/bid/engagement-tier —
  new segmentation dimensions, same MCP calls as existing breakdown-driven
  modules).
- **Phase 3**: modules 14 and 29 (`hook-angle-tagging`,
  `auto-creative-generation-launch`). `api/automation-action.js`'s dispatcher
  now covers `ads_creative_upload_image`/`video` and
  `ads_experiment_abtest_create_test`, so proposal execution is no longer the
  blocker. `hook-angle-tagging` got a one-time manual bootstrap on 2026-08-29
  — the 9 creatives with real spend history were tagged (angle/hook) directly
  from their actual primary-text/headline via the Meta Ads MCP, recorded in
  `index.html`'s `CREATIVES` array. This was a manual pass in this session,
  not yet an automatic routine step — the routine still needs to (a) call
  this same tagging logic on every new creative going forward and (b) add a
  real vision pass (via Higgsfield) to also read the image/video content
  itself, not just the ad copy text, before `format` can distinguish e.g.
  lifestyle vs. studio photography. `auto-creative-generation-launch` (briefing
  Higgsfield off the current top performer to generate new variants) hasn't
  been attempted yet — next build step for this module.
