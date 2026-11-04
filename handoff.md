# Current branch update: devnyadev

The latest user request creates **devnyadev**, branched from dev after interactive guides (`3a770c7`). This checkout directory still has its legacy stagging name; always verify git branch. Published and desktop-verified (43 passing tests; final Actions run 41815621853). New delivery URL: https://owfarisz.github.io/caliber-final/devnyadev/. The existing dev URL retains the five-case workspace and guide.

`ScenarioEntry.tsx` is now the static entry wrapper. Fresh tabs choose one of five scenarios and a starting role before loading SQLite. Selection persists in sessionStorage (`rootsync-devnyadev-selection-v1`); refresh resumes the current scenario. Change scenario unmounts and closes the repository, returns to entry, and preserves scenario progress. Roles can switch within the same scenario. These are demo roles, not authentication.

Each scenario uses separate IndexedDB/Web Lock key `root-sync-devnyadev-v1:<caseId>`. Full source data is retained. Optional Dataset.demoCaseId scopes only guided UI and seed operations; focusedCases returns the selected catalog case while guidedCases still validates all source-compatible examples. Repository loading reattaches demoCaseId after reading the immutable app_snapshot. Initial selection uses the selected asset rather than always choosing the bearing pump. Original seed indexes/IDs are retained; only matching case operations are executed. No other-case requests/POs/ledger events are seeded. Reset reseeds only the selected scenario. Portfolio aggregates remain full Excel totals.

Workflow dev.yml on this branch triggers on devnyadev and publishes main, stagging, dev, devnyadev together. A later deployment from an older branch can overwrite newer paths; rerun devnyadev workflow to restore all four. Do not change other source branches to fix that without authorization.

Validation: 43 domain/model tests including isolated seeding of every case; strict dev TypeScript/build; scripts/verify-scenario-entry.cjs tests all five selections, one request/asset/material, aggregate preservation, reload, saved approval after switching away/back, starting role and lock release. GUIDE_URL is for verify-guide; DEMO_URL is for verify-scenario-entry. Both default to http://127.0.0.1:3120. Desktop only; mobile remains deferred. The guide regression script now handles entry selection before route checks.

The sections below document inherited dev architecture. Where branch, URL, namespace or initial case counts differ, this update takes precedence.

# ROOTSYNC — DEV handoff

This is the continuation entry point for another session or AI. Read this before editing. The current task is the guided-demo revision on **branch `dev`**, based on published `stagging` commit `21d5ee6`. Do not merge into, rewrite, or publish changes to `main` or `stagging` without a new instruction.

## 1. User intent and accepted decisions

The user is a CALIBER 2026 hackathon finalist. The PM supplied a revised PRD, but the data must constrain implementation. The user wants autonomous execution, not repeated permission questions for routine work. They explicitly requested all current revisions on **DEV**.

Latest steering: do not develop or test additional mobile-specific behavior now; desktop is the priority until the user gives further instructions. Existing responsiveness remains inherited, not a new active workstream.

The current revision asks for populated, intuitive dashboards; 3–5 representative scenarios rather than thousands of visible assets; Excel-derived company aggregates; anomaly/vulnerability records rather than day-by-day replay; technician material requests directly in predictive monitoring after what-if; inventory recommendations for vendor, price-negotiation range and negotiation dates; conspicuous **AI decision brief** and **✦ AI-assisted, explainable recommendation** text; and this comprehensive handoff.

The user explicitly authorized generated vendor ratings **as assumptions** after being informed that ratings are absent from Excel. Therefore generated evaluations are allowed but must always be visibly synthetic. Do not erase this distinction in a future polish pass.

Visual identity: RootSync, not Kausync. Self-hosted Inter; light navy/cobalt/yellow palette; readable forms (16px), tables (14px), metadata at least 12px, 44px controls; responsive phone layout. Reuse actual equipment classes in the 3D viewer; never show a compressor/pump for an unsupported type without source support.

## 2. Where everything lives

Repository remote: https://github.com/owfarisz/caliber-final

Local current worktree path (legacy directory name, **branch is dev**):
`/Users/owfaris/Documents/lomba/bcc/caliber/final/1/codex work/stagging`

That path is a symlink to:
`/Users/owfaris/Documents/lomba/bcc/caliber/final/1/codex work/stagging.nosync`

Git metadata is in:
`/Users/owfaris/Documents/lomba/bcc/caliber/final/1/prototype codex/stagging-git.nosync/.git`

The local `.git` pointer routes there. `git status --short --branch` must show dev before editing. Directory names deliberately remain stable to avoid breaking ongoing references. If the pointer is ever replaced by iCloud, use `git --git-dir='<metadata path>'` temporarily; its core.worktree is configured to the real .nosync directory. Do not operate on the old worktree registration in the main repo.

Original main checkout: `final/1/prototype codex/github-pages`; main was `e66685aaf592662e41896b043663098e1053d339` before this revision. Published staging base is `21d5ee6`.

Original full product/data pipeline: `final/1/codex work/rototype codex` (spelling intentional). Scratch, QA and runtime files belong under `final/1/prototype codex`.

Runtime dependencies: `final/1/prototype codex/stagging-runtime.nosync/node_modules`; current worktree node_modules is a symlink. QA runtime: `final/1/prototype codex/qa-runtime.nosync`.

RootSync visual reference: `/Users/owfaris/Documents/lomba/bcc/caliber/new case 2/prototype`, its `rootsync` branch. Do not change the reference app.

Primary PM PRD: `final/1/case/CALIBER_2026_24H_Hackathon_PRD_Updated (1).md`; verbatim copy `docs/PRD-v2.md`.
Existing decisions: `docs/PRD-DECISIONS.md`. Architecture before implementation: `TRD.md`. Current delta plan: `docs/DEMO-USP-PLAN.md`. Prior domain contracts/reviews: `docs/DOMAIN_CONTRACT.md`, `docs/DOMAIN_REPORT.md`, `docs/DOMAIN_REVIEW.md`.

Raw / cleaned case files: `final/1/case/drive-download-20261104T042229Z-1-001`; original six workbooks also under `final/1/case/Supporting Data`.

## 3. Source truth and data lineage

The public seed SQLite is `public/demo.sqlite` (~25.6MB). It contains raw source tables, canonical tables, source hashes, quality exceptions, canonical lineage and an `app_snapshot` JSON projection. Never regenerate it from arbitrary mock rows or replay historical issues against its opening inventory.

Six source workbooks and original row counts:
- FuncLoc list.xlsx: 14,484.
- BoM.xlsx: 20,653; 20,423 canonical associations after 230 exact duplicates removed.
- Movement Material.xlsx: 17,518. Keep all original issue rows; 863 identical excess rows are flagged, not silently deleted.
- Notif History.xlsx: 5,795.
- Mitem & Mplan.xlsx: 10,153.
- PR PO.xlsx: 11,609; 6,189 canonical lines after 5,420 exact duplicates removed.

App projection: 7,481 materials; 4,516 BoM-linked assets (not all 14,484 functional locations). History begins 2025-05-06; cutoff is 2026-09-30, 513 days. Stock date is not supplied; demo opening date is explicitly assumed at cutoff. Criticality order confirmed in user Q&A: **A > B > C > S**; Unknown stays Unknown.

Issue-to-asset attribution is weak: only 625 / 17,518 supported asset links. Never invent a complete causal asset history. Different prices across suppliers or dates are not duplicates or automatically errors. Keep original evidence and currency/UoM; do not average currencies together.

The revised PRD treats PO Item Amount as a line total. `amount / PR quantity` is an optional, explicitly imperfect unit-price proxy: PR quantity may differ from actual PO quantity. Actual receipt dates, open PO statuses, supplier quality ratings and cooperation evaluations are not provided. Imported procurement is historical evidence, never confirmed inbound.

`data/data-dictionary.md` describes the source schema. `scripts/build-demo-evidence.py` reads canonical procurement and app_snapshot from SQLite and writes `lib/source-evidence.json`. That JSON contains six source hashes/counts, full-company totals, monthly canonical procurement counts/material-day activity, and 158 procurement records for the five representative materials. Monthly quantities are never summed across mixed UoMs. The generator is deterministic and uses only Python standard library.

## 4. Five guided scenarios

The catalog is `lib/demo-cases.ts`. All asset/material associations are validated against source BoM in tests.

| Case | Asset | Material | Example scope | Intended lesson |
|---|---|---|---|---|
| Pump bearing alert | PX_PP-1155C / condensate pump | 4100000142 bearing | 3 EA; need +7d | condition evidence, request review and urgent sourcing |
| Exchanger fouling | PX_HE-388A / charge gas exchanger | 4100024158 studbolt | 2 EA; need +21d | cleaning-first, reserved scope, separate execution/verification |
| Compressor spare gap | PX_KC-717 / flushing oil compressor | 4100014098 gasket | 2 EA; need +7d | zero stock and a confirmed demo PO arriving after need-by |
| Pump partial delivery | PY_PP-203B / demin water pump | 4100008783 shaft sleeve | 8 EA; need +14d | partial receipt, reservations and issue remain distinct |
| Planned exchanger service | PX_HE-234C / reflux exchanger | 4100014019 gasket | 5 EA next task; +180d | longer negotiation horizon; completed prior demo task uses 2 EA |

Example scope quantities, observations, interventions, POs and transactions are **simulated**, not inferred facts from the company. In particular vibration does not diagnose a gasket. The description explicitly requires inspection and technician confirmation before converting BoM compatibility into requested scope.

Default tables show the five representative materials. Company-level cards/charts retain the full Excel-derived portfolio. Advanced controls expose all source materials/assets; the large dataset has not been deleted.

## 5. Architecture and important files

- `components/staging/StagingWorkspace.tsx`: main role workspace, route/history state, forms, tables, technician monitoring/scenario/request editor, data management. Legacy staging directory is used by dev. It is currently dense; use exact targeted edits, or split deliberately with tests rather than blanket rewriting.
- `components/staging/GuidedDemo.tsx`: case selector, Excel company chart, technician decision brief, inventory vendor/negotiation brief and shortlist. Exact user-requested AI copy lives here in BriefHeading.
- `components/staging/staging.css`: RootSync UI and responsive rules; appended guided-demo classes use `gd-`.
- `components/EquipmentVisual.tsx`: reused procedural Three.js classes. `lib/equipment-kind.ts` infers class from real descriptions/peer prefixes, and exposes evidence/confidence. Unclassified equipment gets no false model.
- `lib/domain.ts`: pure immutable command reducer, role/version/idempotency enforcement, stock and time-phased readiness, request fulfillment.
- `lib/persistence.ts`: SQL.js + IndexedDB persistence, single-writer lock, atomic cloned-DB save, seed load and export.
- `lib/demo-seed.ts`: deterministic validated demo command sequence. Never directly inject inventory arrays. Includes five saved scenarios/requests, reservations, two POs, partial receipt/issues, maintenance and verification. Actor `guided-demo-model`, IDs `DEMO-*`, source labels `SIMULATED DEMO`.
- `lib/demo-cases.ts`: five IDs, narrative, quantities, dates and anomaly metrics.
- `lib/monitoring.ts`: metric definitions, simulated observations, freshness, asset class and deterministic projection. No telemetry integration or calibrated failure probability.
- `lib/planning.ts`: historical-window demand planning, time-phased candidate readiness and same-horizon cost alternatives.
- `lib/supplier.ts`: source evidence export, source-derived historical fit, deterministic synthetic ratings, negotiation band/dates and caveats.
- `lib/source-evidence.json`: generated Excel-only evidence, never user-entered demo transactions.
- `lib/imports.ts`: CSV parsing/normalization, SHA-256 identity and reviewed dataset projection.
- `scripts/staging-entry.tsx`: React root, self-hosted Inter Latin weights.
- `scripts/build-staging.mjs`: dev static build despite legacy name. Default base `/caliber-final/dev`; output `staging-dist`; copies SQLite/SQL.js/WASM and writes all deep-link index files.
- `.github/workflows/dev.yml`: builds main, stagging and dev together to preserve all three public paths.

## 6. Persistence, commands and invariants

Dev IndexedDB and Web Lock name: `root-sync-dev-guided-v1`. This is separate from staging’s `root-sync-stagging-v2`. Laptop and phone data do not synchronize. Roles are demo workflow permissions, not server authentication.

Fresh seed load runs `seedGuidedDemo`. Saved browser state is restored without re-seeding. Marker `guided-demo:v1:done` prevents duplicate examples. Existing operational arrays are protected; the seed helper returns unchanged for non-empty operational work. Reload-five-scenarios is an explicit ResetWorkspace action with the exact reason `Load guided demo examples`; it requires typing RESET and replaces only dev browser operations. Plain reset can leave a clean workspace.

Every command has type, role, actor, idempotencyKey, expectedVersion and payload. Domain errors do not partially mutate state. Repository clones SQLite, materializes runtime state, persists IndexedDB bytes, then swaps the live state; failed storage never reports success.

Physical on-hand changes only on receipt, issue, return, adjustment or linked reversal. Approval, reservation, PR, PO and scenarios do not create physical stock. Available = onHand minus active reservations. Position accounts for confirmed remaining inbound and outstanding approved demand once. Time-phased readiness can still flag an early gap despite a later sufficient PO. Draft PRs never count as inbound. Approval status and physical fulfillment status are separate.

Historical imports never execute stock movements. New imported material physical stock starts at zero and needs an explicit audited adjustment. Source decisions affect reviewed analytical projection, but source supplier evidence JSON is rebuilt offline; it does not automatically ingest every browser-imported commercial record.

Prior fixes retained: fresh-key duplicate origins/hashes record key metadata without duplicate business rows; reversed returns permit subsequent original-issue correction; SaveScenario clones input/output; backdated issues cannot borrow future receipts.

## 7. Monitoring / what-if / request flow

Technician opens Predictive monitoring, selects one of five cases, reads anomaly/vulnerability records and the AI decision brief, opens inline what-if, adjusts assumptions, reruns, confirms BoM-compatible quantities/dates/rationale and submits a material request. Requests are visible directly below monitoring. Legacy standalone scenario/request routes remain valid but the primary flow is inline.

Replay controls were removed. The evidence chart/table shows the latest eight abnormal observations for the selected metric. The original deterministic observation generator remains an implementation detail. Freshness is 3 days; advancing date can make condition Unknown. A maintenance record never automatically repairs readings; verification is separate.

Illustrative thresholds: velocity RMS 4.5/7.1 mm/s; bearing temperature 80/95°C; exchanger differential pressure 1.2/1.8 bar; thermal performance attention below75/critical below60%. These are demo envelopes, not validated asset limits. Rotating equipment and heat exchangers have distinct scenario inputs. Other assets may have unknown/unconfigured models.

Scenario preview is prepopulated for comprehension. Editing inputs marks results stale; rerun before save/request. Default cost assumptions are visible: optional historical price proxy, holding rate20%, intervention0.5×proxy, conditional event5×proxy. These are illustrative amounts in the source currency, not company downtime rates. Missing pricing/currency remains unavailable. The conditional event cost is counted once per alternative and is not probability-weighted expected loss.

Existing tasks remain visible. A what-if candidate is additional scope unless explicitly reconciled; the brief warns to review existing work before creating another request. Do not silently overwrite approved requests with speculative scenario changes.

## 8. Vendor recommendation and negotiation logic

Actual supplier IDs/names, historical counts, PR dates, PO line amounts, PR quantities, UoM and planned delivery dates come from PR PO.xlsx canonical rows. Negative/invalid lead proxies are excluded by source validity flags. Rows after workspace asOf are excluded from the recommendation.

Generated evaluations are deterministic per supplier code. Quality roughly3.7–4.8, delivery3.5–4.8, communication3.8–4.8; overall weights40/40/20. UI calls them **Assumption** and **Synthetic evaluation — not Excel**. Evaluation notes are explicitly prefixed Demo assumption. The actual `performanceRating` field remains null; generated values live under `assumedRating`.

Historical fit: 40% evidence volume capped at five rows, 35% relative median price proxy, 25% relative planned P80 lead proxy. Compare only same currency/UoM. Recommendation score =65% historical fit +35% synthetic rating. This is an explainable demo policy, not validated vendor performance or procurement approval.

Negotiation price band = historical P25–P50 unit-price proxy for the same material/currency/UoM. It is a target discussion reference, not a current quote or promised saving. No cross-currency mean/conversion. Missing evidence stays unavailable.

Latest feasible order date = need-by minus selected supplier’s historical planned P80 lead minus visible3-day buffer. Normal negotiation window spans up to14 days before that date, clipped to today. If already overdue, show an urgent contact window today→today+2d and explicitly say historical lead misses need-by; do not portray that as feasible delivery.

Inventory brief opens the related pending request review before procurement; approved lines retain request/line IDs. Existing linked PR quantity is reused for amendment. PO supplier field is prefilled from the recommendation but price stays manually confirmed. Do not automatically treat a historical proxy as the new PO price.

## 9. Local setup and verification

Follow `/Users/owfaris/.codex/RTK.md`: prefix shell commands with `rtk` (use `rtk proxy` for raw output). On a fresh clone:

```sh
rtk proxy git clone --branch dev https://github.com/owfarisz/caliber-final.git rootsync-dev
rtk proxy npm ci
rtk proxy python3 scripts/build-demo-evidence.py
rtk proxy node --import tsx --test tests/*.test.ts
rtk proxy npm run typecheck:dev
rtk proxy env PAGES_BASE='' npm run build:dev
rtk proxy python3 -m http.server 3120 --bind 127.0.0.1 --directory staging-dist
```

Run commands from the clone/worktree. For GitHub-path build omit PAGES_BASE override. `npm run build:pages` still builds the old main entry; use `build:dev` for this app. Node22 is used in CI; local Node26 has been tested. TypeScript configuration is `tsconfig.staging.json` with resolveJsonModule enabled.

Automated tests include old engine/classification tests plus workflow, staging, and guided-demo tests. Final local suite: 42 passing; run the current suite after further changes.

QA scripts in scratch runtime:
- `verify-staging-flow.cjs`: original golden path, reload, second-tab locking, 390/768/1440 layout.
- `verify-staging-live.cjs`: original eight live staging routes.
- `verify-dev-guided.cjs`: five-case/material/request seed, synthetic rating label, inventory brief→review, inline what-if→request, stale edits, reload without reseeding, and desktop 1440px overflow checks. Set DEMO_URL for live dev. Mobile work is deferred.

The guided script mutates a fresh isolated Playwright context only. Chrome channel is installed; use `--enable-unsafe-swiftshader` for software-rendered 3D in headless QA. Screenshot files are in the QA runtime directory. Browser launch/server/network may need environment escalation; explain concrete reasons and respect existing authorization.

## 10. Deployment and URLs

Main: https://owfarisz.github.io/caliber-final/
Stagging: https://owfarisz.github.io/caliber-final/stagging/
Dev: https://owfarisz.github.io/caliber-final/dev/

Push only dev. `.github/workflows/dev.yml` checks out main and stagging separately, builds each with its own entry/base, builds/tests dev, then uploads one Pages artifact containing all paths. GitHub Pages environment must explicitly allow branch dev, in addition to main/stagging. Do not remove existing environment rules.

Important hosting limitation: a later run of the OLD main-only or stagging workflow can replace the Pages artifact and omit dev. Rerun the dev workflow to restore all three. Updating those other branches’ workflows requires separate user authorization.

After push, inspect run status/jobs, verify all dev deep links and main/stagging HTTP200, then confirm branch hashes remain unchanged. Latest instruction defers further phone-specific QA; use desktop for this delivery. Do not report an intended URL as live before that check.

## 11. Known limitations and safe next steps

- This is a browser-local static hackathon prototype; no multi-user server, auth, live telemetry, real LLM or supplier API. AI-assisted wording is user-requested; the explanation explicitly discloses deterministic prototype rules.
- Synthetic ratings are unvalidated assumptions and must stay distinguishable from Excel facts, including screenshots and pitch copy.
- Source historical price and lead proxies are imperfect and not quotes/actual performance. No guaranteed savings or delivery promises.
- Full Excel portfolio remains available, but representative sample is not statistically representative of all assets; it is purposively selected to demonstrate five workflow situations.
- Seed stock date is assumed at cutoff. Operational demo movements are real within the sandbox ledger but simulated in business meaning.
- SQLite is about25MB; first phone load may take time. Do not claim instant loading on a slow network. Subsequent loads use local persistence.
- Model maintenance recovery is hypothetical. Recording maintenance/receipt must not normalize observed condition.
- Existing operational imports are reviewed normalized data, not a replacement for the full workbook cleaning pipeline.
- Source schema stores raw lineage; newly generated ratings must never be written into raw_procurement as if supplied by the organizers.
- Keep request/PR/PO identity and idempotency intact when simplifying UI. Do not create duplicate supply for a request that already has an order.

## 12. Next-session checklist

1. Read this file, current user steering, docs/DEMO-USP-PLAN.md and `git status --short --branch`.
2. Confirm actual current branch is dev; verify remote and latest commit before editing.
3. Read only relevant files above, not every prior rollout. The dataset/source evidence is the authority for facts.
4. Run current tests/typecheck if changing domain/model; use browser QA for affected workflows and the desktop layout; phone work is deferred by latest user instruction.
5. If adding suppliers/ratings: preserve source vs assumption provenance and same-currency/UoM comparisons.
6. If changing seeded scenarios: keep deterministic IDs, explicit reset, idempotency and existing-data preservation; update tests and scenario table here.
7. Build with correct `/caliber-final/dev` base, push dev, inspect Actions, verify live paths and preserve main/stagging.
8. Update this handoff and write concrete known gaps rather than claiming full production readiness.

## 13. Delivery status

Implementation, 42 tests, strict TypeScript, build, desktop guided workflow and eight live routes passed. Dev is published at https://owfarisz.github.io/caliber-final/dev/ (application commit 0935a61, Actions run 41812213026). Final deployment/run evidence is recorded in `docs/DEV-VERIFICATION.md` at delivery; consult that file and GitHub Actions for current status. Do not treat older docs/PROGRESS.md (staging v2 delivery) as the state of the guided dev revision.

### Final review corrections

`lib/brief-context.ts` binds the supplier brief to one active asset/material request line. Its need-by date and procurement identity always come from that same line. Completed/rejected tasks do not supply negotiation deadlines; existing procurement is matched by request and line. If no active task exists, the brief remains informative but its procurement action is disabled until a new technician task is confirmed. Requests awaiting clarification show a disabled waiting state until technician revision/resubmission. Regression coverage is in `tests/guided-demo.test.ts`.

## Interactive Page guide and Role flow

The top-bar **Guide** button opens a native modal walkthrough. `components/staging/WorkspaceGuide.tsx` owns the step catalog and UI. **Page guide** covers all eight routes; **Role flow** gives five ordered steps for Inventory or Technician and navigates actual screens. Guides never call domain commands or mutate SQLite. Close the guide to perform an action. They do not open automatically.

Spotlights follow target bounds on scroll/resize. Standard panels expose `data-guide` from their title; other steps use existing stable section classes/IDs. When renaming panel titles, update guide selectors and run the browser test. Missing sections fall back to the page heading with a visible explanation. Page-guide progress resets after browser history navigation; role-flow progress survives its intentional navigation. Escape, Close and Finish return keyboard focus to the launcher. The native modal provides focus containment.

Desktop browser regression script: `scripts/verify-guide.cjs` (requires @playwright/test and installed Chrome). Set `GUIDE_URL` to the serving base; default http://127.0.0.1:3120. It covers every page step, both role flows, Back, browser Back, Finish, Close, Escape, focus restoration and unchanged workspace version. Local screenshots are QA artifacts under prototype codex/qa-runtime.nosync. Mobile remains deferred.

Guide delivery: application commit `3890ca1`, successful Actions run `41813661237`; all page/role walkthroughs verified live on desktop. Guide is at the top right of each page on https://owfarisz.github.io/caliber-final/dev/. See `docs/DEV-VERIFICATION.md`.
