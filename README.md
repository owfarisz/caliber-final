# KAUSYNC — Spare Intelligence

CALIBER 2026 final: an interactive, two-role spare-parts planning MVP built from all six supplied synthetic workbooks. Start with the visual [data audit](audit-report.html), [PM feedback](PM_FEEDBACK.md) and [technical requirements](TRD.md).

## Run
Node.js 22.13+; npm. The packaged SQLite snapshot is ready to use.

```sh
npm ci
npm run dev -- --port 3101
```

Open http://localhost:3101. Production: `npm run build` then `npm start -- --port 3101`.

## What works
- Procurement: all 7,481 materials, recorded-policy filters, search/pagination, material evidence, forecast interval, Safety Stock/ROP/Min–Max/reorder quantity, assumption controls and native-currency cost comparison.
- Technician: 4,516 locations with BoM assignments, notifications and maintenance calendar context, editable assumed hours/cycles/horizon, deterministic recalculation and Procurement handoff.
- Exactly two demo roles, with different controls. This is not authenticated RBAC.
- Evidence view, standalone Indonesian chart-led audit and downloadable SQLite/JSON.
- Read-only SQLite queries on the server. No persistent scenario writes or ERP actions. UI scenarios are ephemeral.

## Three-minute demo
1. Procurement → **Critical spare**. Inspect gasket `4100014740`, one EA on hand, material criticality A (highest of mapped locations). The selected pump `PX_PP-1155C` itself is B; these are different scopes.
2. Technician → default pump. Baseline is 16 h/day and 2 starts/day; edit to 20 and 3, 90 days; Run simulation. Fixed 85% rate is illustrative. Only 26.9% of this material's historical quantity is supported for this pump; the rest stays unchanged.
3. Review expected demand, 10th–90th percentile interval, stock policy and modeled pre-receipt exposure; hand off to Procurement.
4. Open Planning assumptions; select **Assume amount per unit** only while explaining that the teammate's QAQC cites this Q&A interpretation but the primary answer was not supplied. Costs are illustrative and currency-specific. Reordering does not instantly remove pre-receipt risk.
5. Explore **Excess stock**, **Critical standby**, and **No issue history**. The last two are intentionally distinct; neither means obsolete stock. Open Evidence for coverage and cleaning decisions.

## Data and reproducibility
`data/demo.sqlite` is the canonical, required database. `data/snapshot.json` is a generated inspectable projection, not a separate hand-authored source. `/api/data` actually reads SQLite. Original rows and row identities are retained; canonical lineages document duplicate export removal.

```sh
python3 -m pip install -r scripts/requirements.txt
python3 scripts/ingest.py --source /path/to/Supporting\ Data
python3 tests/data_checks.py
npm test
npm run typecheck
npm run build
```

The source ZIP includes `input_sources/` for reruns: `python3 scripts/ingest.py --source input_sources`. Pipeline does not alter source workbooks. Date range is 2025-05-06 through 2026-09-30 (513 days); stock as-of date and scope are unknown. Canonical CSV audit outputs are stored separately in the user-requested `final/1/prototype codex/normalized/` folder.

For browser QA, run a server then `node scripts/verify-browser.mjs` (installed Chrome required). `APP_URL` and `QA_DIR` override target and screenshot location. See `VERIFICATION.md` for results and deployment state.

## Boundaries that matter
- No-history forecast/risk is unassessed, not zero. Stationary demand and history coverage for observed materials are assumptions.
- 863 identical issue extras retained as suspects; no unique transaction item ID proves duplicates. 5,420 procurement export copies and 230 identical BoM assignments removed from canonical views only.
- 625 of 17,518 issues have unique order-location links that also match BoM. Only that supported share changes with asset scenarios. 2,106 mismatches are not guessed away.
- No causal equipment failure model. Notifications are not failure labels. Planned recurrence is not an executed job or confirmed parts requirement.
- Price variation is preserved. No FX; no cross-currency cost aggregation. Lead time is a requested delivery-date proxy, not goods receipt performance.
- No automatic disposal, PO placement, open-order inference or measured savings claims.

## Deployment
Deploy as a **new** Vercel project. Build `npm run build`, framework Next.js. The database is included by `outputFileTracingIncludes`. Public database/snapshot contain synthetic case data only. SQLite is read-only, so serverless persistence is not required. The previous prototype is untouched.

The brief also requires an English presentation with actual team profiles. `PRESENTATION_OUTLINE.md` provides evidence and a speaking structure; team names/roles must be filled by the team. It is an outline, not a completed deck.
