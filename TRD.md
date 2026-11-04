# CALIBER Final — Technical Requirements & Data Decision Record

## Decision
Proceed with the PM's two-role inventory decision MVP after the corrections below. User authorized autonomous execution. This is a new isolated project in the exact requested folder; prior prototype and all supplied workbooks remain unchanged. Product copy is English; accompanying audit explanation is Indonesian.

## Evidence and feasibility
Six raw sources contain 80,212 rows. BoM has 7,481 materials and 20,423 distinct assignments after removing 230 identical assignment copies. Procurement has 6,189 distinct lines after 5,420 identical export copies. Preserve all 17,518 issues: 863 identical excess rows lack a transaction key and are suspect, not proven duplicates. Compare a deduplicated sensitivity view separately.

1,930 materials have issue history; 1,250 have procurement. Only 625 issue rows have both a single notification location and a matching BoM assignment. The 2,106 other uniquely located issues contradict the supplied assignment bridge; retain their material demand but exclude them from asset scenario attribution. Unmatched and ambiguous issues remain in material demand. No inferred parent hierarchy.

Policy counts: 504 below recorded Min; 1,376 above a positive recorded Max; 1,687 positive-stock materials have zero Min and Max and require policy review. Do not call all 3,063 raw above-Max comparisons overstock. Stock and policy are consistent within each material, so take one material snapshot; scope and measurement date are unknown. Never sum quantities across units into a business KPI.

## Required corrections to PRD
- Q&A establishes criticality A > B > C > S. Unknown stays unknown; material inherits highest observed mapped location rank, never an invented failure probability.
- No-history materials are not zero-demand/obsolete. Keep current policy as provisional fallback and show insufficient history; no numerical forecast/risk probability.
- Runtime/cycle changes scale only the supported historical share for the selected location. Shared materials' unrelated demand stays unchanged. There is no learned causal reliability model.
- All notifications are maintenance context, not labeled failures. No failure frequency/MTBF claim from N1/N2/N3 codes.
- Maintenance calendar is a recurrence projection, not proof of execution or required part quantity. No automatic additive planned-part demand (avoids double-counting historical maintenance).
- PO-Item Amount has unresolved unit-vs-line-total meaning; PR quantity is not confirmed PO quantity. Default monetary recommendations N/A. An explicit user-selected amount interpretation enables illustrative, currency-separated price estimates. Never silently divide or average across currency/UoM.
- Lead time is PR-to-PO-delivery-date proxy, not actual receipt performance. Negative pairs excluded from that metric only; no open supply inferred. Missing proxy uses visible editable 60-day assumption.
- Use historical replay as-of 2026-09-30, not wall-clock November date. Snapshot date remains unknown. Future promised delivery dates are usable only as proxy assumptions, not achieved lead time.
- Slow-moving threshold default 180 days is an explicit demo assumption and can be disabled. History window coverage is assumed for known-history materials; no-history stays unassessed.
- Cost-risk mitigation cannot instantly remove pre-receipt shortage. Show pre-receipt exposure unchanged; potential post-receipt improvement under explicit timely receipt assumption. No realized savings claims.

## Architecture and alternatives
Next.js App Router + React/TypeScript, ordinary CSS matching prior palette, sql.js read-only database, Python reproducible ETL. Prefer a single server snapshot and deterministic calculation engine shared by routes/UI. Browser-only static mockup rejected because mandatory MVP is interactive and database-backed. Separate Python server rejected because deployment must work on Vercel without a persistent external service.

SQLite contains original rows with source IDs, canonical relational tables, raw-to-canonical lineage, anomaly records, per-material daily history and JSON application projections. Server loads the bundled file read-only through sql.js; no persistent edits. Export includes all normalized records, not just demo assets. Synthetic inputs are configured separately from source tables.

## Data contract
`lib/types.ts` defines Dataset, Material, Equipment, ScenarioInput and PolicyResult. All IDs are strings. Material stores onHand/currentMin/currentMax/unit, criticality, locations, daily series, historyDays, lastIssue, issueRows/suspectRows, procurement proxy and price estimates, and supported attributable quantity by location. Equipment contains genuine notification/maintenance context and material IDs; monitoring is an explicitly assumed schedule, no fabricated sensor truth.

## Model
Use a compound Poisson occurrence/empirical positive-day-size model from daily issues over the shared 513-day observed window. Deterministic seeded Monte Carlo generates 512 draws for lead-time and lead+review demand. Clearly label stationary/intermittent baseline, not calibrated probability. Same draws/seed across comparisons; scenario demand multiplier = 1 + supported quantity share * (runtime factor * cycle factor - 1). Baseline 16 h/day, 2 starts/day; hypothetical elasticities runtime 1, cycling 0.15. Zero runtime => no attributable operating demand; zero hours plus positive cycles rejected. Cycling editable only for pump/compressor/motor type identified descriptively and explicitly modeled as an assumption.

Planning targets assumed A=.99, B=.975, C=.95, S=.90; 30-day review; explicit overrides allowed. ROP=ceil(service quantile lead demand); safety=max(0, ROP-ceil(mean lead demand)); Min=ROP; Max=max(Min,ceil(service quantile lead+review demand)). Preserve current Min as a conservative A/B floor, labeled assumption. Reorder=max(0,Max-IP) only when IP<=Min; IP=onHand only. Missing history => keep recorded policy, risk/forecast unassessed. No blanket disposal action.

## UI and roles
Procurement: inventory priority queue, search/filter all materials, detail/demand chart, four parameters, price-basis switch, planning controls and audit. Technician: equipment selection and what-if inputs, forecast impact, handoff to Procurement. Role selection is demo UX, not authentication. Scenario persists across role handoff in memory. Input drafts do not change applied results until Run Simulation. Changing planning controls refreshes the same calculation everywhere.

## Endpoints
GET /api/health; GET /api/data (single snapshot); GET /api/plant/overview; GET /api/equipment/[id]; GET /api/materials/[id]; GET /api/inventory/health; POST /api/scenarios/simulate. Missing IDs 404; invalid inputs 400. No writes, no ERP integration. API response includes assumptions and evidence flags.

## Verification and delivery
ETL reconciles raw counts, keys, quantity totals by unit, FK coverage, stock invariance, attribution bounds and idempotent content. Tests cover policy trigger, unknown history, deterministic scenario, shared-material scale, critical floors, invalid inputs and receipt timing. Browser checks both roles, asset/material selection, scenario changes, filters, download, mobile and API. Build/typecheck and source ZIP with SQLite required. Deploy new Vercel project if available; never overwrite previous prototype. Capture deployed screenshot with timestamp after smoke test. Presentation is a separate team deliverable; provide an English evidence/story outline without inventing member identities.

## References
Provided case brief pp. 2–9; supplied relationship diagram pp. 1–2; PM PRD v1.2; Q&A criticality instruction. Technical docs: https://nextjs.org/docs/app/getting-started/route-handlers ; https://vercel.com/kb/guide/is-sqlite-supported-in-vercel ; https://sql.js.org/documentation/ .
