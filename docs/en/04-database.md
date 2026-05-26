# 04 — Database

This page is a tour of the Postgres schema. For the absolute truth, always
read the Prisma schema files at `prisma/schema/*.prisma`. This page tells
you *why* the tables look the way they do.

## Top-level shape

```
Library  (one row per institution, ~50 active)
   │
   │  1 : N
   ▼
Library_Year  (one row per institution per academic year)
   │
   │  1 : 1   (per form)
   ▼
┌────────────────────────────────────────────────────────────┐
│  The 10 form tables — each row hangs off a Library_Year:   │
│                                                            │
│  Monographic_Acquisitions        Volume_Holdings           │
│  Serials                         Other_Holdings            │
│  Unprocessed_Backlog_Materials   Fiscal_Support            │
│  Personnel_Support               Public_Services           │
│  Electronic                      Electronic_Books          │
└────────────────────────────────────────────────────────────┘

Plus side tables for catalog-style title lists:
  List_AV, List_EBook, List_EJournal
  + per-language join tables
  + LibraryYear_ListAV / LibraryYear_ListEBook / LibraryYear_ListEJournal
    (many-to-many between a library-year and the title lists it uses)
```

## Cycle / scheduling tables

| Table              | Purpose                                                                |
|--------------------|------------------------------------------------------------------------|
| `SurveySession`    | One row per academic year. Holds opening/closing dates + notification flags consumed by cron. |
| `ScheduledEvent`*  | (in `survey_session.prisma`) Concrete events the cron should fire — broadcast, form-open, form-close. |
| `Email_Template`   | Editable subject/body for each broadcast key.                          |
| `Entry_Status`     | Per-library-year submission progress (which forms saved/submitted).    |
| `AuditLog`         | Every meaningful mutation; written by `lib/auditLogger.ts`.            |

\* table name in Prisma is whatever the schema declares; check
`prisma/schema/survey_session.prisma`.

## Library_Year — the central hub

Open `prisma/schema/schema.prisma` and look at `model Library_Year`. It is
the single most important table in the system. Every form submission, every
edit gate, every annual report joins through it.

Key columns:

```
id                   serial PK
library              FK -> Library.id
year                 academic year (e.g. 2024 means 2024-2025 cycle)
is_open_for_editing  the toggle flipped by cron / Super Admin
admin_notes          free-text override notes
opening_date         per-year override; NULL means "use defaults"
closing_date         per-year override
fiscal_year_start    informational; "as of" date stamped on submitted data
fiscal_year_end      informational
publication_date     informational; intended JEAL issue
broadcast_sent       legacy flag; SurveySession is the new source of truth
is_active            soft-delete style flag
```

A library has one `Library_Year` per academic year, *whether or not* it
submits data. Empty Library_Year rows act as placeholders so the survey
window can be opened for them.

## The 10 form tables

| # | Table                          | What it counts                                       |
|---|--------------------------------|------------------------------------------------------|
| 1 | `Monographic_Acquisitions`     | Items added during the fiscal year, by language      |
| 2 | `Volume_Holdings`              | Total volumes held (cumulative), by language         |
| 3 | `Serials`                      | Print serial subscriptions and titles                |
| 4 | `Other_Holdings`               | AV materials, microforms, etc.                       |
| 5 | `Unprocessed_Backlog_Materials`| Backlog counts                                       |
| 6 | `Fiscal_Support`               | Acquisitions and operations spending                 |
| 7 | `Personnel_Support`            | FTE — librarians, support staff, students            |
| 8 | `Public_Services`              | Reference, presentations, ILL, circulations          |
| 9 | `Electronic`                   | Electronic resources (databases, etc.)               |
|10 | `Electronic_Books`             | E-book titles and volumes (with import shortcuts)    |

Common patterns across these tables:

- Foreign key `library_year` (`Library_Year.id`) — strict 1:1.
- Per-language columns: `_chinese`, `_japanese`, `_korean`, `_noncjk`,
  `_subtotal`. `Public_Services` was simplified to subtotals only.
- `notes` text column for member free-text.
- All tables have `created_at` / `updated_at` style fields (often called
  `entered`, `modified`, `last_changed`).

The Prisma generator emits client types into `prisma/generated/client/`.
Use those, not handwritten interfaces.

## Title list tables

E-resources, e-books, and AV use a **catalog + counts** split:

```
List_EJournal     ← one row per *title*; shared across libraries
List_EJournal_Counts  ← per-year per-title counts (volumes, etc.)
LibraryYear_ListEJournal  ← which titles a library subscribed to in year X
List_EJournal_Language    ← per-title language breakdown
```

This lets one e-journal title (say, "Asian Studies Review") be tracked once
in `List_EJournal` even though many libraries subscribe to it. The same
pattern is mirrored for `List_AV` and `List_EBook`.

## Sequences and auto-increment IDs

The legacy MySQL dump used numeric IDs that don&apos;t always match the
Postgres `serial` sequences after restore. After ANY restore from a dump,
**always** run:

```bash
node scripts/fix-all-sequences.js
```

This script walks every table with a serial PK and resets the sequence to
`MAX(id) + 1`. Failure to do this leads to mysterious unique-constraint
violations on insert. The script is invoked automatically by
`npm run db:reset` and `npm run db:seed`; you only need to run it manually
if you restore by hand.

## Migrations vs `db push`

Currently the team uses `prisma db push` for fast iteration and the manual
SQL files in `prisma/migrations/` (and `prisma/schema/migrations/`) for
larger changes. There is **no** `prisma migrate dev` history committed —
that is a deliberate choice.

To apply a schema change in production today:

1. Edit `prisma/schema/*.prisma`.
2. Locally: `npx prisma db push` against a Neon dev branch.
3. Verify in Prisma Studio.
4. Repeat against production via Vercel-injected `DATABASE_URL`, or via
   manual SQL from `prisma/migrations/*.sql`.

If the team ever needs to switch to `prisma migrate`, you will need to
baseline the production schema first. See the Prisma docs for "introspect
and baseline".

## Seeding

Entry point: `prisma/seed.ts`. It is **not** a "fresh install" seed — it
preserves the `User`, `AuditLog`, and `Session` tables in the `public`
schema by default (`SYNC_AUTH_TABLES=false`). It synchronises everything
else from a source schema.

Read the top of `prisma/seed.ts` carefully. The mode is controlled by
`SYNC_AUTH_TABLES` env var. Setting it to `true` overwrites users — only
do this when restoring from a known-good dump.

## Audit log

`lib/auditLogger.ts` defines the log payload. Every important mutation
calls `logAuditEvent(...)` so we can trace who changed what.

Allowed actions (TypeScript union):

```
'CREATE' | 'UPDATE' | 'DELETE' | 'SIGNIN' | 'SIGNOUT' |
'SIGNIN_FAILED' | 'UPDATE_ROLES' | 'SYSTEM_OPEN_FORMS' |
'SYSTEM_CLOSE_FORMS' | 'POST_COLLECTION_EDIT' | 'IMPORT'
```

When you add a new mutation route, **call** the audit logger. The Super
Admin Guide page treats the audit log as a first-class debugging tool.

## Backups

You must own this — Neon&apos;s default retention is short. Recommended:

- A scripted `pg_dump` of the Postgres DB on a known cadence (weekly is
  reasonable; nightly during the survey window).
- Store the dump somewhere **not** Neon (e.g. an S3 bucket or institutional
  storage with access controls).
- Keep at least 12 monthly snapshots and the last 4 weeklies.

There is no backup automation in this repo today. See `07-maintenance.md`
for what to set up.

Next: `05-annual-cycle.md`.
