# Stagging delivery ledger

Base: main e66685a. PRD-v2.md was copied from the PM revision, decisions and TRD were written before implementation.

- Domain, persistence, monitoring, planning, role UI and combined Pages deployment implemented.
- Independent domain review identified three reducer defects and an import projection integration gap. Fixed no-op idempotency tracking, issue-after-return reversal, cloned scenario payloads, and added reviewed dataset projection in persistence. Covering regression tests pass.
- Original implementer was unavailable for the fix round due to account quota; controller completed the reviewed finite fixes and regression checks. No broad independent final review is claimed.
- 36 automated tests pass. Strict TypeScript check passes. Production static bundle passes.
- Browser golden path passed: scenario -> confirmed request -> approval -> reserve -> linked shortage PR -> confirmed PO -> date advance -> receipt -> issue -> Fulfilled.
- Browser reload retains SQLite state; second tab is read-only. 390 / 768 / 1440 px layouts have no document overflow. Browser console has no runtime errors.
- Main source remains unchanged. Stagging workflow builds main separately and publishes it beside /stagging/.

Ruling: iCloud repeatedly evicted source and Git metadata. Build sources reside in stagging.nosync (original stagging path is a symlink); fresh main Git metadata resides in prototype codex/stagging-git.nosync. The old main checkout is untouched.

Remaining delivery check: push stagging, verify GitHub Actions and live routes.
