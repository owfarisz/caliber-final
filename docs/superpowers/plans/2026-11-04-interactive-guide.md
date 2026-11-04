# Interactive guide implementation plan

Goal: implement the screenshot-approved Page guide and Role flow on dev, desktop only.
Architecture: a declarative route/role step catalog and a native dialog with a spotlight, scroll tracking and accessible keyboard controls. Read-only navigation never executes domain commands. Reuse RootSync type and navy/yellow colors; no new dependencies. User authorized direct automatic execution.

Design: persistent Guide launcher; two tabs; per-step progress, title, explanation and role-specific focus; Back, Close, Continue/Finish. Page guides cover all eight routes. Role flows navigate to the real screens in order. Native modal focus and Escape dismissal; return focus to launcher. Missing targets fall back to page heading with a clear note. No automatic popup or repeated onboarding.

- [x] Add components/staging/WorkspaceGuide.tsx with catalog, spotlight and dialog lifecycle.
- [x] Add stable section anchors in StagingWorkspace and mount guide after data load; style in staging.css.
- [x] Verify all eight page guides, both role flows, back/close/finish, keyboard and no operational mutations in desktop browser; run typecheck/build/tests.
- [x] Review, update handoff, commit dev, deploy and verify live guide.

Review focus: missing anchors, route transitions, off-screen spotlight, keyboard focus, accidental transactions. Prefer a native component over a new tour dependency because the current React app already owns navigation and role state.
