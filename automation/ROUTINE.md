# KAI Automation Routine

This file is the spec a scheduled Claude routine follows on each run to keep
`automation/queue.json` current. It is not executable code — the routine reads
this file, uses the Meta Ads MCP connection to pull live data, evaluates each
module below, and writes/updates `automation/queue.json`, then commits and
pushes (which triggers the normal Vercel redeploy of the dashboard).

Ad account: `704523148804803` ("Kai Ad Account", hustle_kai business
`511869488526421`). Product catalog: `1149969713295773` (Shopify).

## Every run, in order

1. Read `automation/queue.json` for current `settings` and existing
   `proposals`/`alerts` (for de-duplication — see below).
2. Pull fresh data via Meta Ads MCP: campaign/adset-level `ads_get_ad_entities`
   for `today`/`last_7d`/`last_14d`/`last_30d`/`this_month`, plus the specific
   breakdowns and tools each module below calls for.
3. Evaluate every module. Each module either produces nothing (conditions not
   met), a new **Alert** (informational), or a new **Proposal** (actionable,
   with a stored `metaAction`).
4. **De-duplication**: don't create a new proposal/alert for the same
   underlying issue if one with `status: "pending"` (or created in the last 3
   days, even if resolved) already exists for that module + entity. Update the
   existing one's `reasoning`/data instead if the underlying numbers moved.
5. Set `generatedAt` to the current ISO timestamp.
6. Write the file, `git add automation/queue.json && git commit -m "Automation run: <date>" && git push`.
7. Send a push notification summarizing what's new: counts of new
   proposals/alerts and the single highest-priority item, if any.

## Proposal schema

```json
{
  "id": "A-###",
  "module": "<module key below>",
  "title": "short human title",
  "reasoning": "why, in plain English, citing real numbers",
  "actionSummary": "what will actually happen if approved, in plain English",
  "metaAction": { "tool": "<MCP tool name>", "params": {...}, "followUp": {...optional} },
  "status": "pending",
  "createdAt": "ISO timestamp"
}
```

`metaAction` must contain everything needed to execute without re-deriving
anything — when a proposal is approved, execute exactly what's stored here,
not a fresh re-analysis.

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

## Modules

### Proposals (executable)

| # | Module key | Trigger | Data source | `metaAction.tool` |
|---|---|---|---|---|
| 1 | `pause-kill` | Active sales-objective campaign, spend ≥ `kill_roas_threshold` floor, ROAS below it | `ads_get_ad_entities` (campaign, last_14d) | `ads_update_entity` (status=PAUSED) |
| 2 | `reactivate-winner` | Paused campaign, last active-period ROAS ≥ `reactivate_min_historic_roas` | `ads_get_ad_entities` (campaign, last_30d + lifetime) | `ads_activate_entity` + `ads_update_entity` (budget) |
| 3 | `retargeting` | ATC/checkout events with no matching purchase in `retarget_window_days` | `ads_pixel_event_read` | `ads_create_custom_audience` + `ads_create_campaign`/`ads_create_ad_set` |
| 4 | `creative-fatigue` | Active ad frequency ≥ `fatigue_frequency_threshold` or CTR down ≥30% week-over-week | `ads_get_ad_entities` (ad, last_7d vs prior 7d) | `ads_creative_upload_image`/`video` + `ads_create_creative`/`ads_create_ad`, or `ads_update_entity` (narrow targeting) |
| 5 | `targeting-iteration` | A state/device/age segment's ROAS is materially above/below account average at meaningful spend | Geography/Audience breakdowns (same MCP calls the dashboard uses) | `ads_update_entity` (targeting spec) |
| 6 | `budget-reallocation` | Two+ active campaigns/adsets with ROAS gap ≥ `budget_reallocation_min_roas_gap` | `ads_get_ad_entities` (campaign, rolling 7d) | `ads_update_entity` (daily_budget, multiple) |
| 7 | `dayparting` | Hourly breakdown shows a clear, consistent low/high-ROAS window | `ads_get_ad_entities` (breakdown: `hourly_stats_aggregated_by_advertiser_time_zone`) | `ads_update_entity` (ad set schedule) |
| 8 | `lookalike` | A purchaser custom audience exists/can be built and has ≥100 matched users (Meta's practical minimum) | `ads_get_custom_audience`/`ads_get_ad_account_custom_audiences` | `ads_create_custom_audience` (subtype LOOKALIKE) |
| 9 | `auto-exclusion` | Prospecting campaign's targeting doesn't already exclude the purchaser/customer audience | `ads_get_ad_entities` (targeting spec) | `ads_update_entity` |
| 10 | `frequency-capping` | A segment (placement/device/age) shows rising frequency with falling ROAS | Insights breakdowns | `ads_update_entity` |
| 11 | `ab-test` | Two or more creative variants exist for the same concept with no structured test running | `ads_get_creatives` | `ads_experiment_abtest_create_test` |
| 12 | `campaign-consolidation` | Multiple active/recently-active campaigns targeting the same product+audience | `ads_get_ad_entities` (campaign) | `ads_update_entity` (pause), flagged for review before merge |
| 13 | `catalog-dpa` | Catalog connected, zero DPA/catalog-based campaigns running | `ads_catalog_get_diagnostics`, `ads_catalog_list_product_sets` | `ads_catalog_create_product_set` + `ads_create_ad` |

### Alerts (informational only)

| # | Module key | Trigger | Data source |
|---|---|---|---|
| 14 | `diminishing-returns` | Scaling budget on a campaign coincided with rising frequency + falling marginal ROAS | Derived from #6's inputs |
| 15 | `spend-pacing` | Month-to-date spend vs. `monthly_spend_goal_inr` (skip entirely if that setting is `null`) | `ads_get_ad_entities` (account, this_month) |
| 16 | `learning-phase-stuck` | Ad set has been in learning >7 days without exiting | `ads_get_ad_entities` (adset delivery status) |
| 17 | `competitor-rescrape` | Scheduled refresh of Gully Labs / Lotto Sport India active-ad counts | `ads_library_search` |
| 18 | `competitor-spike` | Competitor active-ad count moved ≥20% since the last recorded scrape | Derived from #17 run-over-run |
| 19 | `anomaly` | Native anomaly signal fires | `ads_insights_anomaly_signal` |
| 20 | `pixel-health` | Dataset quality/match-rate drops or an expected event stops firing | `ads_get_dataset_quality`, `ads_get_dataset_stats` |
| 21 | `weekly-digest` | Every 7th run (or Monday), regardless of other triggers | Rolled-up summary of the week's real numbers |

## Execution (on approval)

When the user approves proposal `A-###` in chat:

1. Read `automation/queue.json`, find that proposal, use its stored `metaAction`
   exactly as written — do not re-derive parameters from a fresh analysis.
2. Call the MCP tool(s) (`metaAction`, then `followUp` if present).
3. Update the proposal's `status` to `"executed"` (or `"failed"` with the
   error if the call failed), set `resolvedAt`.
4. Append an entry to `log`: `{ proposalId, action: <actionSummary>, result: "success"|"failed", executedAt }`.
5. Commit + push, then report the outcome back to the user in chat.

If the user says "reject A-###" instead, just set `status: "rejected"`,
`resolvedAt`, commit + push — no MCP call.
