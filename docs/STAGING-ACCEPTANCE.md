# Stagging acceptance and demo guide

## Run the connected workflow

1. Technician > Scenario lab: choose PX_PP-1155C; run a scenario and confirm candidate material scope.
2. Inventory > Overview: review request; approve all or partial scope; reserve available stock.
3. Create the linked shortage PR. Procurement > Confirm PO: enter supplier and arrival date.
4. Advance the demo date if required; receive the physical quantity; issue the approved request line.
5. Confirm Fulfilled and reload. Export the updated SQLite database from Data & audit.

## Evidence

36 domain/model/import tests; strict TypeScript; static bundle; real Chrome golden path, reload, tab lock and 390/768/1440 responsive checks. Inter is self-hosted; controls use readable 16px form text and 44px targets. Wide tables scroll within their panel.

## Explicit prototype boundaries

- Two roles are demo workflow permissions, not server-authenticated identities. Browser data is local to that device/browser and does not synchronize between laptop and phone.
- Seed XLSX lineage, raw data and canonical tables remain in SQLite. Normalized CSV/JSON import supports reviewed projections and immutable operational audit. New material imports start with zero physical stock; use an explicit audited adjustment for a verified opening balance.
- Imported historical records do not execute stock movements or fabricate open POs. Historical record IDs must be unique and source-reviewed; source workbook reprocessing remains an offline audited ETL task.
- Condition streams on two actual source assets are labeled deterministic simulated readings. Thresholds and progression are illustrative. Other asset classes keep unknown condition without evidence. No calibrated failure probability is claimed.
- Historical prices are optional PO line amount / PR quantity proxies; unknown currency/cost is not zero. Readiness is separate from equipment condition.
- GitHub Pages is the user-requested preview host instead of the PRD Vercel target. A later main-only deployment can replace Pages contents; rerun the stagging workflow to publish both trees together.
