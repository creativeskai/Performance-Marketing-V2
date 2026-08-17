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
