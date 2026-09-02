# KAI Performance Hub — Project Notes

Session summary and reference doc for the `Performance-Marketing-V2` dashboard (repo: `creativeskai/Performance-Marketing-V2`, deployed at `performance-marketing-v2.vercel.app`).

**No credential values are stored in this file.** See [Secrets & Access](#secrets--access) for where they actually live.

---

## 1. What this project is

A single-file dashboard (`index.html`, ~2,700 lines, everything inline) for KAI by Hustle (hustlewithkai.com), an India D2C activewear/streetwear brand. It reads from Meta's Ad Account `act_704523148804803` ("Kai Ad Account") via a Vercel serverless proxy (`api/meta.js`) and renders campaign performance, product breakdowns, geography, audience, creatives, competitor intelligence, and an AI advisor (Gemini-backed).

Two legacy files — `app.js` and `live_api.js` — exist at repo root but are **not loaded by `index.html`** (it has no `<script src>` for them). They're dead code from an earlier architecture iteration. Everything real runs from the inline `<script>` block in `index.html`.

## 2. Architecture

- `index.html` — the entire app: markup, styles, and all JS inline.
- `api/meta.js` — Vercel serverless function. Proxies Meta Graph API v19.0 calls using `META_ACCESS_TOKEN` (server-side env var, never sent to the browser). Endpoints: `campaigns`, `insights_today/7d/14d/30d/month/daily`, `insights_placement/device/age/hourly`, `opportunity_score`.
- `vercel.json` — minimal, `{"version": 2}`.
- On page load, `init()` calls `fetchLiveData()`, which hits `/api/meta` for all periods + breakdowns in parallel and overwrites the in-memory `DATA`/`INSIGHTS_DATA`/`GEO_DATA`/`AUD_DATA` objects if the calls succeed. If they fail (e.g. bad token), the page falls back to whatever static values are baked into the file.

## 3. What changed this session (2026-08-17)

Chronological, each already committed and pushed to `main`:

1. **`0dd7fdb`** — Fixed the live-data pipeline. `meta.js` was sitting at repo root, not `/api/`, so Vercel never served it (`/api/meta` 404'd). Moved it. Also discovered `fetchLiveData()` existed but was never called — `init()` just faked a "Syncing…" spinner and wrote a hardcoded stale label. Wired it in. Extended live-fetch to cover Today/14d/30d/Month (previously only Last 7 Days ever refreshed). Fixed a campaign-objective exclusion filter that referenced a field never present in the API response. Added `insights_today`/`insights_14d`/`insights_month` proxy endpoints.
2. **`e016abc`** — Repopulated Last 7d/14d/30d/Month with real numbers pulled via the Meta Ads MCP (the static snapshot was frozen from ~Aug 2, showing campaigns that no longer exist as active).
3. **`53450a7`** — Rebuilt Products, Geography, Audience, and Creatives tabs from real MCP data. Geography/Audience ROAS figures are *estimated* (CTR-relative to account average, scaled to match real totals) because Meta's breakdown API doesn't return purchase attribution at that granularity — same methodology the app already used, just fed real inputs now. Also fixed a live bug where the Geography tab's charts silently failed to render every time the tab opened (`GEO_DATA.states` referenced a property that never existed).
4. **`84986ea`** — Fixed the Download Report feature, the on-screen Recommendations tab, and the Opportunity Score widget — all three were serving fabricated content (wrong dates, invented stats, references to campaigns like "Kabuto Caps", "Sales_KAGE", "HERO IMAGE" that don't exist in the current account). Rebuilt to compute from real data at render time. Pulled the real Opportunity Score (90, was hardcoded to 99 with a UI label falsely claiming it was live).

## 4. Current real account state (verified 2026-08-17)

**Only two campaigns are active:**
- `Kage_TOF` (LINK_CLICKS objective — traffic, not sales-optimized)
- `Kage_sales_1608`

Both launched **today**. Combined spend so far: ~₹287. Zero purchases yet — too early to judge.

**Every campaign that has generated a purchase in the last 30 days is currently paused**, most notably:
- `Kage_Sales` — 4.30x ROAS, ₹6,195 spend, 10 purchases (best-volume winner)
- `BUNDLE_07052026` — 7.28x ROAS, ₹1,281 spend, 3 purchases
- `KAI | Sales | Retargeting | 13072026` — 6.83x ROAS, ₹234 spend, 2 purchases
- `Essentials_21072026` / `ESSENTIALS_31072026` — 0.69x / 0.44x ROAS, correctly paused

**30-day account totals:** ₹14,267 spend, ₹40,544 revenue, 2.84x blended ROAS, 19 purchases.

**Opportunity Score:** 90/100. Top pending Meta suggestions: add fullscreen vertical video w/ audio to Reels ads (~8% lower cost/result), let Meta auto-add music (~31% lower cost/result), use AI-generated creative variety (~10% higher CTR).

## 5. Data honesty notes

- **Geography & Audience tabs**: spend/impressions/CTR/CPM are real (pulled via `ads_get_ad_entities` with `region`/`age`/`gender`/`impression_device`/`platform_position` breakdowns). Revenue/ROAS/purchases at that granularity are *estimated* — Meta does not return purchase attribution cross-tabbed with those breakdowns via this tool — using CTR-relative-to-account-average ROAS, scaled so the total matches real account revenue. This is disclosed in each tab's `note` field.
- **Creatives tab**: real ad-level spend/ROAS/CPM/CTR/frequency for 14 ads. Angle/hook/format fields are honestly set to "Not tagged" / "—" rather than fabricated marketing narrative — no creative-content inspection was performed.
- **Competitors tab**: only the "active ads" count for Gully Labs was refreshed live (66 → 170+, via Meta Ad Library search). Follower count, format/angle breakdowns, and creator-partnership data are unchanged from the original 2 Aug 2026 Apify scrape and explicitly flagged as not re-verified — refreshing those needs a full scrape + visual creative review, a different scope of work.
- **Weekly trend history**: only 5 real weeks (Jul 18 – Aug 17) are backed by actual data, replacing a previous 14-week fabricated series.

## 6. Known outstanding items

- **`META_ACCESS_TOKEN` in Vercel lacks `ads_read` permission** (confirmed via a direct `/api/meta` call returning an OAuthException). Until this is fixed, the deployed page's own live-fetch will keep failing and falling back to the static snapshot baked into `index.html` at each session's end — it will **not** self-update on its own. Fix: generate a new token for a Meta **System User** with `ads_read` scope on the Kai Ad Account (Business Settings → System Users), then update the env var in Vercel (Project → Settings → Environment Variables) and redeploy.
- Two Meta access tokens were pasted directly into this chat session earlier (2026-08-17). They were never saved to any file or committed, but **should be treated as compromised and rotated** in Meta Business Settings regardless, since chat history isn't a secure credential store.
- Competitors tab (Gully Labs deep analysis, emerging competitor Lotto Sport India) needs a fresh Ad Library scrape + creative review to be fully current — out of scope for this session.
- `app.js` and `live_api.js` at repo root are dead code (not loaded by `index.html`). Candidates for deletion if no one is relying on them for anything.

## 7. Secrets & Access

No values below — this section documents *what* exists and *where it's managed*, not the credentials themselves.

| What | Where it's managed | Notes |
|---|---|---|
| `META_ACCESS_TOKEN` | Vercel → `performance-marketing-v2` project → Settings → Environment Variables | Currently present but missing `ads_read` scope — see §6. Should be a long-lived System User token, not a short-lived user token (those expire and silently break the pipeline again). |
| GitHub access | github.com account `creativeskai` | Owns the `Performance-Marketing-V2` repo (public). |
| Vercel access | vercel.com, team `hustlewithkais-projects` | Owns the `performance-marketing-v2` project. |
| Meta Business access | business.facebook.com, Business Manager for `hustle_kai` (business ID `511869488526421`) | Owns ad account `704523148804803`. System User tokens are generated here. |
| Gemini API key | Stored client-side in the browser's `localStorage` (`kai_v10` key), entered via the dashboard's Settings modal | Used for the AI Advisor / AI Recommendations features. Per-browser, not server-side. |

**Recommendation:** if you want a durable, shared record of actual credential values, use a password manager (1Password, Bitwarden, etc.) — never a markdown file in a git repo, public or private.

## 8. Session update — 2026-08-27

Refreshed the static fallback data baked into `index.html` with fresh pulls via the Meta Ads MCP (account `704523148804803`). Note: during this pull, firing multiple `ads_get_ad_entities` calls in parallel with identical `ad_account_id`+`level`+`fields` but different `date_preset` returned duplicated/incorrect results (all periods came back identical) — had to be re-run sequentially to get correct per-period numbers. Worth remembering for future sessions.

**What was refreshed:**
- Dashboard (Today/7d/14d/30d/Month campaign tables) — real, verified numbers as of 27 Aug 2026.
- Geography tab (state-level, 7d & 30d) — spend/impressions/CTR/CPM real; revenue/ROAS/purchases still estimated (same disclosed CTR-relative methodology; Meta doesn't return purchase attribution at region granularity).
- Audience tab (age/gender/device/placement, 30d) — this time **purchases and ROAS are real Meta-attributed figures at this breakdown level**, not estimated (an improvement over the prior session's methodology — Meta does return purchase attribution for age/gender/device/platform_position, just not for region).
- Creatives tab — rebuilt from real 30d campaign data (still campaign-level, not true per-ad; format/angle/hook remain honestly "Not tagged").
- Insights tab — hourly, placement, device, age×gender, and daily-pacing (Aug 20–26) charts rebuilt from real 30d/7d breakdowns. **Frequency-decay chart was NOT refreshed** — Meta Ads MCP has no direct reach-by-frequency-bucket breakdown; those numbers are still the original stale placeholder (now labeled as such in a code comment).
- Opportunity Score: now **100/100, zero pending recommendations** (was 90/100 on 17 Aug).
- Competitors tab: only the stale "1.94x" KAI ROAS comparison figure was corrected to 2.09x. The Gully Labs / Lotto Sport scrape data is still from 2 Aug (ad count from 17 Aug) — re-scraping was out of scope again this session, same as before.
- `WEEKLY_TRENDS` (the multi-week product trend chart) was **not extended** — still ends at the Aug 18–24 week.

**Current real account state (verified 27 Aug 2026):** Same two campaigns active — `Kage_sales_1908` (sales) and `Kage_TOF` (traffic). Zero spend recorded yet today. 30-day account totals: ₹17,258 spend, ₹36,129 revenue, 2.09x blended ROAS, 15 purchases.

## 9. Session update — 2026-08-27 (continued): Management/Automation section + login gate

Added a "Management" section to the dashboard alongside the existing "Reporting" section (all prior tabs, unchanged), plus a login gate. Full design discussion and architecture is in this session's plan; summary:

- **Login gate**: a client-side overlay in `index.html` (`#login-gate`, functions `doLogin`/`checkAuth`). This is a knowing product decision, not real security — the repo is public, so the credential is visible in the page source and permanently recorded in git history. The credential value lives only in `index.html`; it is intentionally not repeated here. **Planned follow-up**: swap this for Vercel's native deployment Password Protection once the project moves to a Vercel Pro plan.
- **Automation tab** (`showView('automation')`, function `renderAutomation()`): reads `automation/queue.json` and renders pending proposals, alerts, recent activity, and current settings/thresholds. Read-only — there are no functional approve/reject buttons by design.
- **Approval model**: everything is chat-driven. A scheduled Claude routine (to be created via the `schedule` skill, following the spec in `automation/ROUTINE.md`) generates proposals from live Meta Ads MCP data and writes them into `automation/queue.json` (committed to git, which triggers the normal Vercel redeploy). The user approves by telling Claude "approve A-###" in chat; Claude then executes the proposal's stored `metaAction` via the same Meta Ads MCP connection (full read/write access already available — no second API token was introduced) and logs the result back into `queue.json`.
- **Scope**: 21 rule modules across pause/kill, reactivate winners, retargeting, creative fatigue, geo/device/age targeting iteration, budget reallocation, dayparting, lookalikes, auto-exclusions, frequency capping, A/B tests, campaign consolidation, catalog/DPA, plus informational alerts (anomaly detection via the native `ads_insights_anomaly_signal` tool, pixel health, learning-phase-stuck, spend pacing, competitor re-scrape/spike, weekly digest). Full mapping of module → data source → Meta Ads MCP tool is in `automation/ROUTINE.md`.
- **Seeded with 3 real proposals** from this session's actual account data (reactivate `Kage_Sales`, launch a retargeting campaign off real 30d add-to-cart/checkout numbers, launch a DPA campaign off the account's already-connected Shopify catalog `1149969713295773`) and 3 alerts, so the tab is verifiably working before the scheduled routine exists.
- **Not yet done**: the actual scheduled routine hasn't been created yet (next build step); no proposal has been approved/executed end-to-end yet.

### Pre-existing Competitors tab bug — found during verification and fixed same session

The Competitors tab had two disconnected data sources: a ~300-line hardcoded HTML block (claiming a "Jun 20 scrape," 251,578 followers, 90 active ads, with invented ad creative examples, hook-performance scores, and "5 KAI briefs") that was what actually rendered, sitting alongside a completely separate `renderCompTab()` JS function that populated real `COMPETITOR_DATA`/`COMP_VS`/`COMP_RECS` (170 active ads, 263,905 followers, "2 August 2026" scrape) into element IDs (`comp-kpis`, `comp-formats`, etc.) that **did not exist anywhere in the HTML** — `renderCompTab()` was dead code, never even called from `showView()`. So the tab had been showing fabricated/stale content this whole time, regardless of the real `COMPETITOR_DATA` refresh done earlier this session.

Fixed: removed the hardcoded block, replaced it with containers matching `renderCompTab()`'s target IDs plus a new `comp-header` block (name/handle/followers/scrape-date/emerging-competitor, all pulled live from `COMPETITOR_DATA`), and wired `showView('comp')` to call `renderCompTab()`. Also corrected two stale campaign-name references inside `COMP_RECS` that assumed 3 active campaigns and named `Kage_12052026`/`Kabuto_Caps` as currently running — neither is accurate to the current account state. Verified visually via Playwright: the tab now shows the real, internally-consistent numbers with no leftover "Jun 20"/"251,578" content anywhere.

## 10. Session update — 2026-09-02: full data refresh, all reporting tabs

Refreshed every data-driven tab in `index.html` with real pulls via the Meta Ads MCP (account `704523148804803`), following the same disclosed-methodology pattern as the 17/27 Aug sessions. No fabricated numbers — every figure below traces to a live MCP call or a real Ad Library / web search made this session.

**Active campaigns changed again since 27 Aug.** The account no longer runs `Kage_TOF` / `Kage_sales_1908` — those are now paused. Three new campaigns launched 31 Aug 2026 and are the only ones currently active:
- `Retargeting_31AUG` — retargeting, reuses the Kage launch creative
- `Tsuchi_TOF` — top-of-funnel launch for a **new product line, Tsuchi** ("Rooted in earth. Made to move."), separate from Kage
- `New_Sales_Kage_31AUG` — sales campaign for Kage, same creative as the retargeting campaign

**Today (2 Sep) real numbers:** ₹100.97 spend, 744 impressions, 2.66% CTR, ₹134.27 CPM, 0 purchases. Only `Retargeting_31AUG` has delivery so far today; the other two active campaigns haven't spent yet today.

**Period totals refreshed (Dashboard tab), all verified via Meta Ads MCP:**
- Last 7d (Aug 26–Sep 1): ₹5,105 spend, 1 purchase, ₹3,299 revenue, **0.65x ROAS** — a genuinely weak week since the big sales campaigns are paused and the new campaigns haven't converted yet.
- Last 14d (Aug 19–Sep 1): ₹9,528 spend, 4 purchases, ₹11,270 revenue, 1.18x ROAS.
- Last 30d (Aug 3–Sep 1): ₹20,416 spend, 15 purchases, ₹38,615 revenue, **1.89x ROAS** (down from 2.09x on 27 Aug — spend grew from new campaigns that haven't converted yet, purchase count held flat).
- This month (Sep 1–2): ₹375 spend, 0 purchases so far.

**Opportunity Score: 88/100** (down from 100/100 on 27 Aug). New pending recommendations, all tied to the freshly-launched campaigns: `Retargeting_31AUG` is budget-limited (+6 pts) and missing a fullscreen vertical Reels video (+1 pt); `New_Sales_Kage_31AUG`'s ad is missing AI creative variety (+1 pt) and Meta-added music (+1 pt).

**Insights tab** — hourly, placement, device, age×gender, and daily-pacing (Aug 26–Sep 1) charts all rebuilt from real 30d/7d breakdowns pulled fresh this session. Frequency-decay chart still NOT refreshed (same Meta Ads MCP limitation as every prior session — no reach-by-frequency-bucket breakdown available).

**Geography tab** — spend/impressions/CTR/CPM real for both 7d and 30d region breakdowns (pulled fresh); revenue/ROAS/purchases/ATC/checkouts/LPV are estimated using the same disclosed methodology as before (CTR-relative-to-account-average ROAS for revenue; spend-share proportional for ATC/checkouts/LPV — this session made the ATC/CO/LPV estimation method explicit in the `note` field, since prior sessions didn't spell out how those specific fields were derived).

**Audience tab** — age/gender/device/platform_position purchases and ROAS are real Meta-attributed figures at that breakdown level (not estimated), confirming Meta still returns real purchase attribution at these grains but not at region grain.

**Creatives tab** — rebuilt from real 30d campaign data. Added 3 new entries for the newly-active campaigns with real hook/angle text pulled from live ad-preview screenshots via `ads_get_ad_preview` (not fabricated) — this is the first time this session's refresh sourced creative copy from an actual rendered ad image rather than API text fields alone.

**Competitors tab** — did a fresh Meta Ad Library search this session (not just a re-date of old numbers): Gully Labs active-ad count is now **101** (down from 170+ on 17 Aug, via a page_ids-scoped search which is more reliable than the earlier keyword search), Lotto Sport India is at **59** active ads (down from 68), currently pushing an "Ekiden" running-shoe launch. Follower counts, format/angle breakdowns, and creator-partnership data were **not** re-verified this session (a web search for Gully Labs' current follower count returned an unreliable third-party estimate that conflicts with the precise 2 Aug scrape figure, so the old, more trustworthy 263,905 figure was deliberately kept rather than overwritten with a worse source) — still needs a full Apify re-scrape to be current.

**Not refreshed this session:** `WEEKLY_TRENDS` (per-product weekly breakdown) — still ends at the Aug 18–24 week; only account/campaign-level periods and breakdowns were pulled this session, not a per-product weekly series. The Automation tab (`automation/queue.json`) was out of scope for this refresh and untouched.

**Gotcha confirmed again:** firing parallel `ads_get_ad_entities` calls with identical params except `date_preset` still risks duplicated/incorrect results — all period pulls this session were run sequentially, consistent with the 27 Aug session's finding.

Committed locally (not pushed) — see git log for the commit hash.
