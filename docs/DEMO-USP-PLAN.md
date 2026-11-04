# Guided demo and decision briefs implementation plan

Goal: judges understand five connected evidence-to-procurement stories without browsing thousands of assets.
Architecture: preserve the full Excel-derived SQLite dataset for portfolio aggregates. Add a curated five-case catalog, deterministic operational demo pack, and source-derived supplier evidence. Keep all mutations in the validated command/repository path.
Execution: inline, automatic mode already authorized by user. Main and stagging remain unchanged; publish dev.

## Decisions
- Five real source assets/materials selected for condition, stockout, partial fulfillment, lead-time and planned-maintenance cases.
- Fresh workspaces receive clearly labeled demo scenarios, observations, requests, reservations, POs, movements, maintenance and verification. Existing operational workspaces are preserved; explicit reload-demo action explains replacement.
- Historical supplier evidence is derived from canonical PR PO.xlsx rows. No supplied performance rating/quality score/actual delivery confirmation exists. The user explicitly requested generated ratings as assumptions; store actual performanceRating=null separately from assumedRating. Show an explainable historical-fit score, count/recency, planned lead proxy and same-currency unit-price proxy, plus an explicitly synthetic vendor rating and evaluation note (user authorized after initial design).
- Negotiation band is historical P25–P50 PO amount / PR quantity; dates derive from need-by minus planned P80 lead and a visible 3-day buffer. Overdue feasible dates produce an urgent warning, not a false feasible delivery claim.
- Technician monitoring contains anomaly/vulnerability evidence, what-if controls and material request promotion inline. No multi-day replay controls. Full source assets remain accessible in an expanded view.
- All insight panels use the user-requested text: AI decision brief; ✦ AI-assisted, explainable recommendation. State that the prototype uses deterministic rules and has no connected LLM.

## Tasks
- [x] Build source evidence artifact, five-case catalog, supplier ranking/date/band helpers and deterministic idempotent demo pack. Test source IDs, explicitly synthetic ratings, currency isolation, boundaries and seed stock invariants.
- [x] Integrate fresh-load/demo reset, focused lists, technician inline scenario + request, inventory vendor/negotiation briefs, populated source charts, anomaly records and clear source/simulation labels.
- [x] Run full tests/typecheck/build; browser workflow and desktop views (mobile work deferred by latest user instruction); review evidence joins and no destructive upgrades; publish dev.
- [x] Write comprehensive handoff.md: user intent, exact source paths, architecture, rules, data lineage, schema, commands, setup, deploy, QA, caveats and next-session checklist.

Review focus: existing browser preservation; selected BoM compatibility; actual ratings absent, generated assumptions separate; currency/unknown prices; supplier ETA beyond need-by; duplicate demo loads; stale scenario; seeded counts vs Excel totals.
