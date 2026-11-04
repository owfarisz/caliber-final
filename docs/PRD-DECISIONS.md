# PRD v2 implementation decisions

The supplied PRD is retained verbatim in PRD-v2.md. It is the staging specification. Main remains e66685a.

1. User explicitly requests branch `stagging` and a separate GitHub Pages preview. Deliver at `/caliber-final/stagging/`; preserve `/caliber-final/` main. This overrides the PRD's mandatory Vercel host for the requested preview. Keep a Vercel-compatible static build; no fake stateless mutation APIs.
2. Source files currently available are six original XLSX workbooks, not the CSV files named in the PRD. Reuse the audited canonical SQLite generated from those workbooks and provide CSV import preview/publish for normalized exports. Preserve all original source tables and lineage. No invented replacement dataset.
3. Earlier explicit organizer Q&A supplied by the user establishes A > B > C > S. Preserve that priority and Unknown; service targets remain assumptions, not organizer policy.
4. PRD v2 treats historical PO amount as line amount. Currency estimates remain disabled unless user accepts amount / requested PR quantity as a proxy. Never transfer old unit-price assumptions silently.
5. Original stock date unknown. Seed analytical date 2026-09-30 with visibly assumed stock date, shared warehouse DEMO-WH. Only new posted ledger events change on-hand.
6. Demo state is same-browser SQL.js persisted in IndexedDB with one writer-tab lock; role switching preserves state. Other devices have independent state. No authentication claims.
7. Monitor a small labeled pump/exchanger subset with synthetic deterministic telemetry; all other equipment remains Unknown without observations. Retain existing 11-family 3D visuals as optional context; inventory action queue has priority.
8. Font: self-host Inter, matching RootSync workspace family. Base 16px, table 14px, form controls 16px, metadata >=12px, headings 20–32px, touch targets >=44px.
9. Optional full physical topology, calibrated failure probability/RUL, multi-asset correlated optimization, email, external supplier actions and enterprise auth are excluded. Unsupported estimates remain null.
10. Deck deliverable can be generated as an English HTML presentation from verified results; team identities are not invented. Clearly distinguish supplied actual content from team-details placeholders.
