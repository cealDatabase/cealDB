# scripts/archive/

One-off maintenance and verification scripts that have already been run
against production and are kept here for **historical reference only**.

Do not invoke these scripts as part of normal development or deployment.
They are not idempotent in general, and several assume a database state
that no longer exists (e.g. a specific reporting year or a particular
data quirk that has since been corrected).

## Inventory

| File | Purpose | Run when |
|---|---|---|
| `check-ebook-volumes.js`            | Diagnostic: list E-book volume holdings inconsistencies. | One-off audit. |
| `fix-ebook-volume-holdings.js`      | Patches E-book volume-holdings totals from per-record sums. | After data import that left totals stale. |
| `fix-leading-zeros.ts`              | Normalizes leading zeros in legacy ID strings. | Post-migration from MySQL dump. |
| `fix-volume-holdings-2025.ts`       | Year-specific recompute of Volume_Holdings 2025 row. | Manual fix, January 2025. |
| `final-verification.sql`            | Hand-written SQL queries used to spot-check a previous data fix. | Post-fix verification. |
| `test-form9-structure.js`           | Validates Form 9 (Public Services) table shape. | One-off post-schema-change. |
| `test-institutional-reports.js`     | Smoke test for institutional report exports. | One-off after report rewrite. |
| `verify-backend.js` / `.mjs`        | General backend smoke tests. | One-off pre-deploy verification. |

## Live scripts (NOT in this archive)

The script `scripts/fix-all-sequences.js` is still active — `package.json`
calls it from `db:reset` and `db:seed`. Do not move it here.
