# ROOTSYNC PRD v2 Implementation Plan

> For agentic workers: use executing-plans or subagent-driven-development task-by-task.

Goal: implement PRD v2 on isolated stagging and publish independently of main.
Architecture: shared pure domain commands, durable browser SQLite, class-specific simulation, two role workspaces.
Spec: PRD-v2.md, ../TRD.md, PRD-DECISIONS.md.

## Global constraints
Exactly Inventory/Technician. Source case data never rewritten as telemetry. A>B>C>S per user Q&A. Body16/table14/metadata12 Inter. Same-browser single-writer SQLite, atomic save semantics. Main remains e66685a. All stock changes via role-checked domain commands.

## Review focus
- Partial fulfillment and linked returns must reconcile physical stock and commitments.
- Idempotency key reuse with changed payload must reject, not silently replay.
- Date-dependent coverage cannot use late supply early.
- Save failures/tab conflicts cannot report successful mutations.
- Scenario promotion and existing policy PR must not duplicate the same need.

### Task 1: Domain and transactions
Files lib/domain.ts, tests/workflow.test.ts. Interface initializeWorkspace/applyCommand/stockPosition/requestFulfillment/timePhasedReadiness per TRD.
- [ ] Write failing permission/idempotency/partial workflow/overissue/late supply/return tests.
- [ ] Implement typed operational records and atomic command reducer.
- [ ] Run tests, review command invariants, commit.

### Task 2: Monitoring and scenario computation
Files lib/monitoring.ts, lib/planning.ts, tests/monitoring.test.ts. Consume Dataset and domain state; output deterministic observations and current/changed/mitigation, dated readiness and candidate scope.
- [ ] Write bound/staleness/condition-vs-readiness/cost unknown tests.
- [ ] Implement configured pump/exchanger observations and class-specific projection.
- [ ] Integrate residual policy and independent commitment timeline, test and review.

### Task 3: Persistence and source management
Files lib/persistence.ts, scripts/build-pages.mjs, data/schema.sql, tests/persistence.test.ts.
- [ ] Preserve seed SQLite and add runtime tables.
- [ ] Implement candidate-save-swap IndexedDB, exclusive tab ownership, reset/export.
- [ ] Add validated CSV preview with provenance, duplicate hashes/conflicts and atomic publish.
- [ ] Validate durable reload and failed-save behavior.

### Task 4: Role workspaces and readable design
Files components/staging/*, app/staging.css, scripts/pages-entry.tsx.
- [ ] Inventory overview/materials/procurement/transaction/data routes with exact KPI filters.
- [ ] Technician monitor/scenario/requests with observation and maintenance recording.
- [ ] Wire every action to command adapter; stale results and current version mandatory.
- [ ] Self-host Inter, mobile nav, keyboard labels and large readable controls.

### Task 5: Integration, review and staging deployment
- [ ] Run all unit/domain tests and TypeScript/static build.
- [ ] Browser golden path includes partial reservation, PR/PO, receipt, issue, reload, export, reset and tab lock.
- [ ] Independent review, fix meaningful findings, visual desktop/mobile inspection.
- [ ] Combined Pages workflow preserves main and serves stagging subdirectory; verify public golden path.
- [ ] Record acceptance status, updated SQLite/source ZIP, timestamp screenshot and English presentation; report actual limitations.
