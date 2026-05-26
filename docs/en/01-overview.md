# 01 — System Overview

## What this system is

The **CEAL Statistics Database** (cealstats.org) is the official annual
statistics platform of the **Council on East Asian Libraries**, a committee
of the Association for Asian Studies. Roughly 50 North American academic
libraries with East Asian collections submit annual data through it, and the
results are published in the **Journal of East Asian Libraries (JEAL)** and
exposed to the public on the website.

It replaces an older PHP system that used to live at `ceal.ku.edu`. The
current Next.js app was launched in 1999 (per the homepage banner), digitised
older reports were added in 2007, and the system was rebuilt on Next.js 16 +
Postgres in this repository.

Public URL: <https://cealstats.org>
Parent committee site: <https://www.eastasianlib.org/newsite/statistics/>

## Who uses it

Three user roles. See `09-glossary.md` for exact definitions.

| Role               | Audience                                 | Privileges (high level)                                    |
|--------------------|------------------------------------------|-----------------------------------------------------------|
| **Super Admin**    | CEAL Statistics Committee chair / officers | Open and close forms, send broadcasts, edit any institution&apos;s data, manage users |
| **Assistant Admin**| Designated helpers                        | Subset of Super Admin; cannot manage users or rotate dates |
| **Member**         | One delegate per participating library    | Submit and edit only their own institution&apos;s 10 forms while the form window is open |

The general public can view aggregated statistics and historical PDFs
without logging in.

## What the system does, in one paragraph

Once a year (default Oct 1 → Dec 2 PT, but adjustable), the Super Admin
opens the survey window. Every member library receives an email and submits
ten standardised forms covering monographic acquisitions, volume holdings,
serials, other holdings, unprocessed backlog, fiscal support, personnel
(FTE), public services, electronic resources, and electronic books. After
the window closes, the Super Admin reviews the data, exports
year-end reports, and (manually) publishes the result in JEAL. The system
keeps the historical record online and queryable indefinitely.

## What this system is NOT

- **Not a real-time dashboard.** Member libraries do not enter live data.
  Each form submission is once per academic year.
- **Not a content management system for the parent CEAL site.** The
  committee&apos;s website at eastasianlib.org is separate.
- **Not a public submission portal.** Only credentialed member libraries
  can submit; new libraries must be approved by the committee.
- **Not authoritative for pre-1998 data.** A methodology change in the
  1998-1999 cycle means older statistics use a different schema. See
  `app/statistics/pre-1998/page.tsx`.

## Where the moving parts live

| Layer       | What                                          | Where                          |
|-------------|-----------------------------------------------|--------------------------------|
| Frontend    | Next.js 16 App Router, React 19, Tailwind 4   | `app/`, `components/`          |
| API         | Next.js Route Handlers                        | `app/api/`                     |
| ORM         | Prisma 7 with multi-file schema               | `prisma/schema/*.prisma`       |
| Database    | Postgres on Neon (cloud)                      | external                       |
| Email       | Resend                                        | `lib/email.ts`                 |
| Cron        | Vercel scheduled functions, twice daily       | `vercel.json` + `app/api/cron/`|
| Auth        | Cookies + JWT + Argon2id                      | `lib/auth.ts`, `app/(authentication)/api/signin/`|
| Hosting     | Vercel                                        | external                       |

Read `03-architecture.md` for how these connect.

## Reference data flow for the annual survey

```
Super Admin           Cron (twice daily)         Member library
     |                       |                        |
     | -- set dates -------> |                        |
     | -- send broadcast --> |                        |
     |                       | -- on opening_date --> | open forms
     |                       |                        | submit/edit
     |                       | -- 7d before close --> | reminder email
     |                       | -- on closing_date --> | freeze forms
     | -- export reports --> |                        |
     | -- publish in JEAL    |                        |
```

## What "the 1998 cutoff" means

The questionnaire was substantially revised in the 1998–1999 cycle. New
form categories (electronic resources, electronic books) were added and the
language breakdown (Chinese / Japanese / Korean / Non-CJK) was standardised.
Pre-1998 reports are preserved on the dedicated archive page at
`app/statistics/pre-1998/page.tsx`. Do not attempt to combine pre-1998 and
post-1998 data in the same query.

## Where to go next

- For a hands-on walkthrough: `02-getting-started.md`.
- For "how is the codebase organised?": `03-architecture.md`.
- For "what tables back this?": `04-database.md`.
