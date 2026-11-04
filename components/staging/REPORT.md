# Staging UI implementation report

Implemented `StagingWorkspace.tsx`, `staging.css`, and `scripts/staging-entry.tsx`. Existing source components and domain/persistence modules were not edited.

## Routes and navigation

Exactly Inventory and Technician workspaces, with distinct sidebar navigation and history/popstate restoration:

- `/inventory/`: operational KPI filters, dated supply chart, deterministic next-decision insight, priority material actions, request review and fulfillment.
- `/inventory/materials/`: searchable/paginated 7,481-material projection, active/imported/recommended policy comparison, dated demand and inbound, policy/master command forms, reservation release.
- `/inventory/procurement/`: linked draft PR creation/amendment, explicit supplier/quantity/ETA/pricing PO confirmation, partial receipts, request reserve/shortage/issue actions.
- `/inventory/transactions/`: issue, return, signed adjustment, source-linked reversal, immutable operational ledger and JSON export.
- `/inventory/data/`: normalized CSV/JSON file import, six dataset kinds, source reference, SHA-256 identity, pure domain preview, publish, explicit exception decisions, batch history, command audit, full SQLite/JSON export, typed RESET confirmation and reason.
- `/technician/`: asset selection, reused native `EquipmentVisual` 3D pump/exchanger, class-specific condition evidence, independent condition/readiness/action status, source/event timestamps, read-only dated replay, manual observations, nominal source maintenance schedule, confirmed execution logs, separate verification, unclassified source notifications.
- `/technician/scenarios/`: class-specific bounded inputs, isolated shared `simulate` result, stale indication, historical/baseline/changed/mitigation series and assumption envelope, dated candidate readiness, three cost alternatives with unavailable values preserved, explicit price-proxy opt-in, separate intervention/shared downtime cost inputs, model assumptions and alternative explanations, saved scenarios, technician-confirmed request promotion.
- `/technician/requests/`: explicit compatible BoM scope, multi-line quantities/dates/rationale/confirmation, revision of Draft/Needs Clarification requests, approval and physical fulfillment shown independently.

## Persistence and command behavior

The root component opens `WorkspaceRepository.load(base)`. Every mutation calls `repo.execute` with the exact PascalCase command, current role/actor, fresh idempotency key, and latest repository version. React exposes the new state only after repository execution resolves. Repository errors remain visible globally and in command/request dialogs. Successful writes display the saved workspace version; the top bar distinguishes saving, saved, and read-only state. No stock-array writes or mocked command success are used.

The UI rereads `repo.dataset` after state updates, enabling the repository's reviewed import projection. Import preview uses `applyCommand` without persisting or updating live UI state, then requires a separate publish action. Full SQLite export uses `repo.export()`.

The complete operational path is present: condition evidence → scenario → confirmed material request → review including partial approval → partial reserve → linked shortage PR → confirmed PO → explicit date advancement → physical receipt → reserve/issue → separate fulfillment status. Approval, reservation, and procurement never pretend to physically issue stock or normalize condition.

## Visual and accessibility choices

RootSync navy/cobalt/yellow on light surfaces, self-hosted Inter Latin weights 400/500/600/700, restrained desktop role sidebar, responsive mobile drawer, stacked narrow forms, scrolling wide tables, tabular numbers, minimum 12px metadata, 14px table type, 44px action controls, visible focus, dialog cancellation, live status/error feedback, reduced-motion rules. Charts have expandable accessible data tables. Existing 3D viewer is scoped with staging CSS and keeps its fallback behavior.

## Verification status

- `esbuild components/staging/StagingWorkspace.tsx --outfile=/private/tmp/staging-ui-check.js --format=esm --jsx=automatic` passed after final code edits.
- Full TypeScript and bundled-entry validation started but stalled on dataless iCloud source imports (`lib/types.ts`, `lib/planning.ts`, and `components/EquipmentVisual.tsx`). Parent is restoring those source files into stable runtime storage. No passing typecheck or browser golden path is claimed here.
- Bundle command must configure both `.woff` and `.woff2` file loaders for Fontsource CSS.
- Root is performing final bundle, desktop/mobile visual QA, command golden path, and deployed route verification; this report records implementation scope, not completed acceptance evidence.

## Integration notes

The entry reads `process.env.NEXT_PUBLIC_STATIC_BASE` and renders the root component with that base. The parent build supplies `window.initSqlJs` and SQL.js WASM assets. Current planning integration calls `inventoryPlan(dataset,state,windowDays)` and uses expected/lower/upper, recommendedMin/Max, leadDays/leadBasis/orderBy when returned. Unknown demand/cost are unavailable. A clearly labeled slow-moving material filter uses lastIssue older than 180 days; source criticality S remains visible. Failure probability is explicitly unavailable and is never invented.

Remaining QA targets: compile all source types after hydration, actual command flows across role/reload, browser read-only lock behavior, scenario save/stale transitions, full data-import publishing/conflict decisions, and visual desktop/mobile review. Parent requested edits pause for sequential domain repairs before that QA.
