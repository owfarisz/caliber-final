# Canonical data dictionary

| Table | Grain / identity | Interpretation |
|---|---|---|
| raw_* | source workbook Data row, source_row = Excel row | Original field names/values; six sources. Never used as a joined stock sum. |
| functional_locations | id, 14,484 locations | A>B>C>S from user Q&A; Unknown for 33 blanks. No inferred parent tree. |
| materials | id, 7,481 materials | Description/UoM/recorded stock and policy invariant within material. Highest mapped criticality. No currency mixing. |
| bom_assignments | location_id + material_id, 20,423 | Installed quantity by location, not per-maintenance consumption. 230 exact duplicate copies removed. |
| material_movements | source_row, 17,518 | All Issue transactions. Quantity retained including suspected repeats. Date/UoM checked. attribution_status: supported / location_bom_mismatch / ambiguous_order / unmatched_order. |
| notifications | id, 5,795 | Orders nullable and not unique. Notification type codes are preserved without assigning failure meaning. |
| maintenance_items | id, 10,153 | 3,823 plans. Cycle converted to MONTH or WEEK; calendar years to12months; weeks never converted to months. nextDate is first recurrence strictly after cutoff, not confirmed work. |
| procurement_lines | PR+item+PO+item, 6,189 | All18 source columns plus typed price/qty and lead proxy. All unique business keys verified. 2 negative lead proxies excluded from duration sample only. |
| inventory_snapshots | material_id | on_hand once, stock_as_of NULL, unknown_source_scope. Not receipts ledger. |
| inventory_policies | material_id | supplied Min/Max; zero-zero flagged unconfigured. Current SS/ROP not supplied. |
| material_daily | material_id + date | Daily sum within material UoM; no mixed-unit totals. |
| canonical_lineage | source + source_row | Raw-to-canonical row mapping for export copies. |
| quality_exceptions | source + source_row + issue | Preserved anomalies requiring review; full diagnostic findings also in the audit report. |
| source_manifest | file | SHA-256 and raw row counts. |
| app_snapshot | id=1 | JSON projection used by API, regenerated only from canonical ETL. |

`amountMean` and `amountMedian` preserve a summary of native-currency PO amount history; only meaningful as unit prices when that interpretation is accepted. `lineUnitEstimate` = sum(amount)/sum(PR quantity), expressly an alternative assumption rather than verified PO unit value. Unconfirmed price basis is the default and monetary outputs remain N/A.

`daily` covers observed positive-day quantities; missing days within the global observed window are modeled as zeros only under the explicit completeness/stationarity assumption. No-history material is never assigned such a zero-demand series. `attributed` is supported quantity per location, not a full allocation of unmatched issues. Sum of attributed quantity cannot exceed total issued quantity.
