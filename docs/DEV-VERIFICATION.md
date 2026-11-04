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
Final Actions result and live route verification will be appended after publication.

## Reproduce
Run `npm test`, `npm run typecheck:dev`, `npm run build:dev` from the source checkout.
Local browser script: `../../prototype codex/qa-runtime.nosync/verify-dev-guided.cjs` (desktop only; optional DEMO_URL).
Live route script: `../../prototype codex/qa-runtime.nosync/verify-dev-live.cjs`.
See root `handoff.md` for full setup, paths, assumptions, limitations and next-session instructions.
