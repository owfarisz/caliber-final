# Domain Task 1 report

Implemented `lib/domain.ts`, `tests/workflow.test.ts` and `docs/DOMAIN_CONTRACT.md`. No commits made; other agents' files were left unchanged.

## Delivered behavior

Typed Inventory/Technician commands and all operational record arrays. Command envelope guards role, expected version, and immutable idempotency payload fingerprint. Every candidate is cloned and fully validated before returning a new version/audit entry; failed commands retain the previous state. No wall clock, persistence, source-stock mutation, historical issue replay, imported open PO, or scenario candidate commitment.

Request scope is explicit and BoM checked; origin is unique, revision permitted only for Draft/Needs Clarification, review status remains distinct from net issued fulfillment. Partial approval, own/other reservation protection, draft PR amendment, confirmed PO amendment, partial receipts, issues, linked returns, signed adjustment and linked reversal reconcile. Position subtracts approved outstanding once; reservations subtract available only. Dated readiness preserves earlier shortfalls even with later supply. Backdated movements cannot create negative historical stock.

Policies keep separate active versions and strategic floors. Observations validate metric/applicability/unit/bounds; maintenance accepts no-part activities and verification remains independent. Scenarios are isolated snapshots with context versions. Normalized imports validate keys, positive quantities/UoM/FKs where applicable, retain raw normalized rows, deduplicate hashes, stage changed existing values as explicit conflicts, and never replay physical stock. Exception resolutions record explicit disposition/source/reason.

## Verification

`rtk proxy node --import tsx --test tests/workflow.test.ts`: 11/11 passed (latest focused run, 127 ms).

Tests cover role/stale/idempotency mismatch/atomicity; origin/BoM/source initialization; full partial approval→reservation→PR amendment→PO→partial receipt→issue→return; protection of other reservations; late supply; no-part maintenance and separate verification; import hash/conflict/no stock replay; backdated issue rejection; policy floors/observation applicability/scenario isolation; linked return reversals; confirmed procurement amendment without duplicate inbound.

Observed RED→GREEN failures for backdated borrowing and confirmed procurement amendment, then fixed both. Initial tests were authored before reducer implementation, but their first attempted run was blocked by missing dependencies/tsx IPC. Do not claim all original cases had an observed RED phase.

Strict semantic domain typecheck passed using a temporary config with ES2022, bundler resolution, strict, noEmit and types:[] over lib/domain.ts + lib/types.ts. Project `npm run typecheck` could not work because this worktree initially had no tsconfig.json. Full `node --import tsx --test tests/*.test.ts` initial completed run passed 27/27 before the final amendment regression was added; current all-file run is reported to parent separately.

## Integration rulings and limits

- Full payload/state contracts are in DOMAIN_CONTRACT.md. Quantities named `quantity`; movement quantities signed; PO receipt counter is `receivedQuantity`.
- Duplicate origin/import hash is a no-op returning the original state; no extra audit/version is generated. A new unused command key on such a no-op is not recorded. Ordinary successful command replays are strictly protected.
- Import publication stores normalized rows/provenance and conflicts without promoting new materials into Dataset. Resolving an exception records the decision; it does not silently patch master data or opening stock. Active policy/master edits require their separate explicit commands.
- Scenario storage validates domain context versions/hash shape; simulation input bounds/output reproducibility remain the monitoring service's responsibility.
- Maintenance/verification never modify observations or normalize condition. Future observations can be stored; monitoring must filter against its replay cursor.
- Readiness groups supply/demand on each ISO day (same-day arrival usable that day); overdue ETA remainder is placed on the current date, visibly still inbound rather than physical stock.
- Fulfillment aggregate numerical totals may combine lines with different UoM; UI should show individual line quantities and only use aggregate status for mixed-unit requests.
- Authorization is demo role enforcement, not production authentication. Source exception initialization explicitly preserves uncertainty; it does not fabricate inferred case facts.

## Integration fixes and verification
No-op origin/hash submissions now record accepted idempotency keys without duplicate business records. Reversed returns no longer permanently block issue correction. Saved scenario input/output is cloned. `tests/workflow.test.ts` includes regression coverage; all 36 tests pass including staging analytics/import tests. Reviewed imports feed repository.dataset via lib/imports.ts.
