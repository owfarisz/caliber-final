# Dev delivery verification — 2026-11-04

Branch: `dev`, based on stagging `21d5ee6`. Main and stagging source branches are preserved.

## Local checks
- Full domain/model suite: 42 tests including five-case stock invariants, source compatibility, synthetic ratings, mixed currency isolation, persistence seed preservation and active-task procurement identity.
- Strict dev TypeScript check and production static build.
- Desktop Chrome at 1440px: five cases/materials/requests, explicit synthetic ratings, negotiation band, Inventory review from brief, Technician inline what-if, stale-input guard, confirmed request submission and reload persistence. No page errors or desktop horizontal overflow.
- Inventory and Technician desktop screenshots inspected visually.
- Independent review found three task-selection defects; corrected via `lib/brief-context.ts` and regression coverage. Focused independent re-review approved all three fixes.
- Latest user instruction defers additional mobile work and testing. No mobile readiness claim is made for this revision.

## Publication
Target: https://owfarisz.github.io/caliber-final/dev/
Workflow: `.github/workflows/dev.yml` publishes main, stagging and dev in one Pages artifact. The github-pages environment allows all three branches.
Deployment succeeded: [Actions run 41812213026](https://github.com/owfarisz/caliber-final/actions/runs/41812213026), application commit `0935a615d878e60881e1dc0ed6a6a98421bfe8a5`.

Live desktop verification passed for all eight routes: inventory, inventory/materials, inventory/procurement, inventory/transactions, inventory/data, technician, technician/scenarios, technician/requests. Each returned HTTP 200, rendered the workspace with Inter, one header, and no horizontal overflow at 1440px. No page errors were observed. Main and stagging returned HTTP 200 as well.

Remote hashes confirmed unchanged: main `e66685aaf592662e41896b043663098e1053d339`, stagging `21d5ee6ff3ab89bb7e24b28b18aab9105ffb87a3`.
The subsequent verification-document commit does not alter application code or the deployed artifact.

## Reproduce
Run `npm test`, `npm run typecheck:dev`, `npm run build:dev` from the source checkout.
Local browser script: `../../prototype codex/qa-runtime.nosync/verify-dev-guided.cjs` (desktop only; optional DEMO_URL).
Live route script: `../../prototype codex/qa-runtime.nosync/verify-dev-live.cjs`.
See root `handoff.md` for full setup, paths, assumptions, limitations and next-session instructions.


## Interactive guide delivery
Application commit `3890ca1`, deployed successfully in [Actions run 41813661237](https://github.com/owfarisz/caliber-final/actions/runs/41813661237).
Local and live desktop Chrome checks passed every step on all eight page guides and both five-step role flows. Back, Close, Finish, Escape, focus restoration and browser-history progress reset passed. No missing targets, page errors or operational version changes were observed. Strict TypeScript, production build and all 42 domain tests passed. Desktop Inventory page-guide and Technician role-flow screenshots were visually inspected. Phone-specific work remains deferred.


## devnyadev: focused scenario entry
New branch and URL: https://owfarisz.github.io/caliber-final/devnyadev/.
Feature commit `7ad90c2`; follow-up `d7b4bd1` preserves the client directive for Next compatibility. Initial deployment [41815348274](https://github.com/owfarisz/caliber-final/actions/runs/41815348274) succeeded. Final deployment succeeded in [41815621853](https://github.com/owfarisz/caliber-final/actions/runs/41815621853).

43 tests pass. Strict TypeScript/build pass. Desktop local and live tests selected every case, verified exactly one seeded request/asset/material, full 7,481-material source aggregate, refresh persistence, initial role selection and writer-lock release. A saved approval remained intact after switching through all other scenarios and returning. No browser page errors. All eight page guides and both role flows also passed locally with entry selection enabled. Final entry screen was visually inspected. No mobile work performed.

GitHub receive-pack returned repeated Internal Server Error. The feature tree and commit were uploaded through the Git Data API with the exact same hashes (`448577a13576e23aedc2054ea9c98d30e5741b6a`, `7ad90c206f07b9ab781d2dba797fba6cc9e8a915`) and the branch advanced without force. Subsequent git push succeeded.
Preserved branch hashes: dev `3a770c7449ec92af9a6b0e2ed89d04f94d0907af`, main `e66685aaf592662e41896b043663098e1053d339`, stagging `21d5ee6ff3ab89bb7e24b28b18aab9105ffb87a3`.
