# 03 — Architecture

## High-level diagram

```
                    ┌─────────────────────────────┐
                    │        Vercel (host)        │
                    │  ┌───────────────────────┐  │
   Browser ───HTTPS─┼─▶│   Next.js 16 (app/)   │  │
                    │  │  - Pages              │  │
                    │  │  - Route Handlers     │  │
                    │  │  - Server Actions     │  │
                    │  └─────┬─────────────┬───┘  │
                    │        │             │      │
                    │  ┌─────▼─────┐ ┌────▼────┐  │
                    │  │ Prisma 7  │ │ Resend  │  │
                    │  │  client   │ │ (email) │  │
                    │  └─────┬─────┘ └────┬────┘  │
                    │        │            │       │
                    │  ┌─────▼─────┐      │       │
                    │  │  Cron     │      │       │
                    │  │  (vercel) │      │       │
                    │  └─────┬─────┘      │       │
                    └────────┼────────────┼───────┘
                             │            │
                             ▼            ▼
                    ┌─────────────┐  ┌─────────────┐
                    │ Neon        │  │ Resend SaaS │
                    │ Postgres    │  │ (audiences, │
                    │             │  │ broadcasts) │
                    └─────────────┘  └─────────────┘
```

## Framework: Next.js 16, App Router

The whole UI and API live in a single Next.js app under `app/`. We use
the App Router (not Pages Router). Key conventions:

- **Server Components by default.** Files under `app/` are server-rendered
  unless they start with `"use client"`.
- **Route handlers** live at `app/api/.../route.ts`. Each exports HTTP
  verbs (`GET`, `POST`, etc.).
- **Server Actions** are used for forms and mutations triggered from server
  components; see `actions/` for the catalog.
- Auth-gated pages live under `app/(authentication)/`. The parens are a
  Next.js *route group* — they are organisational only, not in the URL.

### Directory map

```
app/
├── (authentication)/        # Auth-gated routes; UI for signed-in users
│   ├── admin/               # Super Admin / Assistant Admin tools
│   │   ├── page.tsx         # Dashboard
│   │   ├── survey/          # The 10 forms (UI for entry)
│   │   ├── survey-dates/    # Manage opening / closing / publication dates
│   │   ├── broadcast/       # Send / queue broadcast emails
│   │   ├── users/           # User management
│   │   ├── year-end-reports/# Annual report exporters (Excel / PDF)
│   │   ├── superguide/      # Super Admin in-app guide (bilingual)
│   │   └── ...
│   ├── api/                 # Auth API routes (signin, signup, signout)
│   ├── signin/, signup/, forgot/, reset-password/, ...
│   └── ...
├── api/                     # Public + admin API routes
│   ├── cron/                # Cron endpoints (vercel.json points here)
│   ├── statistics/          # Public chart/table data endpoints
│   ├── admin/               # Admin-only mutations and queries
│   ├── monographic/, serials/, electronic/, ...   # The 10 forms&apos; APIs
│   └── ...
├── help/                    # Member User Guide (bilingual, public)
├── statistics/              # Public analytics views
│   ├── quickview/           # Aggregated table by year / institution
│   ├── tableview/           # Basic + advanced tabular views
│   ├── graphview/           # Basic + advanced charts
│   ├── pdf/                 # Published PDF index
│   └── pre-1998/            # Pre-1998 historical archive
├── libraries/               # Institutions list / detail pages
├── searchingdatabase/       # Public search hub
└── page.tsx                 # Public homepage
```

## Data layer: Prisma 7 with multi-file schema

The schema is **split** across `prisma/schema/*.prisma` for readability.
Prisma 7 supports this natively; do not flatten.

```
prisma/
├── schema/
│   ├── schema.prisma                  # Generator + datasource + Library_Year + User
│   ├── library.prisma                 # Library
│   ├── monographic.prisma             # Form 1
│   ├── volume_holdings.prisma         # Form 2
│   ├── serials.prisma                 # Form 3
│   ├── other_holdings.prisma          # Form 4
│   ├── unprocessed_backlog_materials.prisma  # Form 5
│   ├── fiscal_support.prisma          # Form 6
│   ├── personnel_support.prisma       # Form 7
│   ├── public_services.prisma         # Form 8
│   ├── electronic.prisma              # Form 9
│   ├── electronic_books.prisma        # Form 10
│   ├── list_av.prisma                 # AV title list
│   ├── list_ebook.prisma              # E-book title list
│   ├── list_ejournal.prisma           # E-journal title list
│   ├── library_year_list.prisma       # Many-to-many between Library_Year and lists
│   ├── survey_session.prisma          # SurveySession + ScheduledEvent (cron state)
│   ├── email_template.prisma          # Editable broadcast templates
│   ├── entry_status.prisma            # Per-library-year submission status
│   ├── published_report.prisma        # PDFs shown on /statistics/pdf
│   └── ...
├── seed.ts                            # Idempotent-ish seeder
└── generated/                         # Generated Prisma client (gitignored at runtime)
```

### Key relationships

- **Library** ←→ **Library_Year** (1:N): one row per library per academic year.
- **Library_Year** ←→ **each of the 10 form tables** (1:1): the form rows
  hang off the Library_Year, not the Library.
- **Library_Year.is_open_for_editing** is the *editing gate*. The cron
  flips it on `opening_date` and off at `closing_date`. Super Admin can
  override.
- **SurveySession** is the source of truth for the *current* survey
  cycle&apos;s dates and broadcast state.

See `04-database.md` for a deeper dive.

## Authentication: cookies + JWT + Argon2id

Files: `lib/auth.ts`, `lib/password.ts`, `app/(authentication)/api/signin/route.ts`.

- Passwords are stored as **Argon2id hashes**.
- On sign-in we issue a **JWT** signed with `AUTH_SECRET` (`HS256`) and set
  it as an `httpOnly` cookie.
- Roles come from the `Users_Roles` join table; super-admin status is
  detected via `lib/libraryYearHelper.ts:isSuperAdmin()`.
- Two-step password reset uses `password_reset_token` /
  `password_reset_expires` columns on `User`.

There is also legacy support for **bcrypt** and **MD5-crypt** hashes
because some pre-rebuild users still carry old credentials. The signin
handler detects the prefix (`$1$` / `$2y$` / `$2a$` / `$2b$`) and dispatches
to the right comparator. Do not remove this until every active user has
logged in at least once post-rebuild.

## Email: Resend

File: `lib/email.ts`, `lib/emailTemplate.ts`.

- Templates live in `email_template` rows in Postgres so the Super Admin
  can edit subject lines / HTML bodies through the UI.
- Four template keys exist:
  - `broadcast_announcement` (manual pre-announcement)
  - `broadcast_open_forms`   (auto on opening date)
  - `broadcast_closing_reminder` (auto 7 days before closing)
  - `individual_open_forms`  (manual one-off resend)
- Audience IDs map to a Resend "Audience" representing the entire CEAL
  contact list. The audience must be kept in sync with `User` rows.

If `RESEND_API_KEY` is missing, the code logs the would-have-been email
instead of sending. That is intended for local dev.

## Cron: Vercel scheduled functions

File: `vercel.json`, `app/api/cron/check-form-schedules/route.ts`.

```json
"crons": [
  { "path": "/api/cron/check-form-schedules", "schedule": "0 8 * * *" },
  { "path": "/api/cron/check-form-schedules", "schedule": "0 20 * * *" }
]
```

Both invocations point at the **same** handler. Inside, the handler:

1. Reads `SurveySession` rows whose dates fall in the current window.
2. Fires `broadcast_open_forms` when `opening_date` is reached and not yet
   notified.
3. Fires `broadcast_closing_reminder` 7 days before `closing_date`.
4. Flips `Library_Year.is_open_for_editing` on the right boundary days.
5. Logs to the audit log table.

The handler is idempotent: it sets `notifiedOnOpen`, `notifiedClosingReminder`,
etc. to avoid double-sending if the cron fires multiple times in a day.

## Hosting: Vercel + Neon

- **Vercel** runs the Next.js build, serves the app, and runs the cron.
  Environment variables are configured in the Vercel project dashboard.
- **Neon** hosts Postgres. We use the **pooled** connection string
  (`DATABASE_URL`) for the app and the **unpooled** one
  (`DATABASE_URL_UNPOOLED`) for migrations and Prisma Studio.
- **Resend** is the email provider; the API key in Vercel env vars must
  match a Resend project that has the CEAL audience configured.

## Why these choices

- **Next.js**: SSR + API routes in one stack; existing CEAL infra was already
  on Vercel.
- **Prisma**: type-safe access from TS; multi-file schema scales well as
  forms multiply.
- **Postgres**: relational, durable, easy to dump/restore; matches the
  existing pre-rebuild schema philosophy.
- **Neon**: serverless Postgres, branchable for safe dev environments.
- **Resend**: provides the audience-based broadcast model the workflow
  needs; cheaper than SES + custom list management.
- **Vercel cron**: zero ops; the schedule lives in the repo itself.

## Trade-offs you should know

- The system depends on **three external SaaS** (Vercel, Neon, Resend). If
  any one disappears, see `08-migration.md`.
- **Cron runs in UTC**, but business dates (Oct 1 / Dec 2) are *Pacific
  Time* in code. This causes a small "off-by-eight-hours" gotcha during the
  first cron of the day in winter; the handler tolerates it but document
  reviewers should be aware.
- We do **not** use a job queue. All scheduled work runs inside the cron
  handler. If broadcasts grow more complex, this should be revisited.

Next: `04-database.md`.
