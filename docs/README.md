# CEAL Statistics Database — Developer Documentation

Welcome. This folder contains everything a programmer needs to **build, run,
maintain, and migrate** the CEAL Statistics Database, written for someone who
has never met the previous developer and inherits the system cold.

> **English is primary.** Chinese translations live in `zh/` and are kept
> intentionally a little more compact. When the two diverge, English wins.

## How to read these docs

If you are completely new, read in this order:

1. `en/01-overview.md` — what this system is and who uses it
2. `en/02-getting-started.md` — clone, install, run locally
3. `en/03-architecture.md` — the moving parts and why
4. `en/04-database.md` — schema, key tables, seeding
5. `en/05-annual-cycle.md` — the once-a-year survey workflow
6. `en/06-deployment.md` — Vercel, Neon, Resend, cron, env vars
7. `en/07-maintenance.md` — common issues and Super Admin tools
8. `en/08-migration.md` — what to do if you need to move infrastructure
9. `en/09-glossary.md` — terms, URLs, contacts

## Other docs in this repo

- `app/(authentication)/admin/superguide/` — **Super Admin Guide** (in-app, bilingual)
- `app/help/` — **Member User Guide** (in-app, bilingual)
- `archive/` — historical reports kept for context, not maintenance

## Conventions used in these docs

- Code paths are written relative to repo root, e.g. `lib/surveyDates.ts`.
- "Super Admin" is the highest privilege role; see `09-glossary.md`.
- Default dates (Oct 1 / Dec 2) are **defaults only** — Super Admin can
  override per academic year.
- "Cron" means the Vercel scheduled function defined in `vercel.json`.

## Contact

The most recent maintainer is **Meng Qu** (qum@miamioh.edu), Web Service
Librarian at Miami University. The CEAL Statistics Committee is the system
owner.

---

中文版索引见 [`zh/README.md`](./zh/README.md)。
