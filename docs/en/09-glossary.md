# 09 — Glossary, URLs, Contacts

A reference, not a tutorial. If something in this codebase makes no sense,
look here first.

## People and organisations

| Term                  | Meaning                                                                |
|-----------------------|-----------------------------------------------------------------------|
| **CEAL**              | Council on East Asian Libraries — the parent committee.                |
| **AAS**               | Association for Asian Studies — CEAL is a committee of AAS.            |
| **Statistics Committee** | Subset of CEAL that owns this database; sets schedule and policy.   |
| **JEAL**              | *Journal of East Asian Libraries*, hosted by Brigham Young University. |
| **Super Admin**       | Highest privilege role in the system. The Statistics Committee chair / officers. |
| **Assistant Admin**   | Helper role with most Super Admin powers but reduced scope.            |
| **Member**            | Per-library delegate who submits the annual data.                      |

## Roles

| Role             | Read all institutions? | Edit any institution? | Send broadcasts? | Manage users? |
|------------------|:----------------------:|:---------------------:|:----------------:|:-------------:|
| Super Admin      | ✅                     | ✅                    | ✅               | ✅            |
| Assistant Admin  | ✅                     | ✅ (limited)           | ✅ (limited)     | ❌            |
| Member           | Their own only         | Their own only, while open | ❌          | ❌            |

The exact gating logic lives in `lib/libraryYearHelper.ts`,
`lib/formPermissions.ts`, and per-route checks under `app/api/admin/`.

## Annual cycle terms

| Term                  | Meaning                                                                |
|-----------------------|-----------------------------------------------------------------------|
| **Academic year**     | The year the survey is *labelled* with. e.g. "2024" means the 2024-2025 cycle. |
| **Fiscal year**       | The accounting period the data covers. Default Jul 1 (prev) → Jun 30 (academic year). |
| **Opening date**      | When forms become editable for members. Default Oct 1 PT.              |
| **Closing date**      | When forms freeze. Default Dec 2 PT.                                   |
| **Publication date**  | Informational target for JEAL publication. Default Feb 1 next year. **Actual JEAL issues land Feb–May.** |
| **Survey window**     | Opening date → closing date.                                           |

## System terms

| Term                          | Meaning                                                        |
|-------------------------------|----------------------------------------------------------------|
| `Library_Year`                | One row per institution per academic year. Central hub.        |
| `is_open_for_editing`         | Boolean on `Library_Year` controlling write access for members.|
| `SurveySession`               | One row per academic year. Source of truth for cron.           |
| `Email_Template`              | Editable templates the broadcast handler uses.                 |
| `Broadcast`                   | A bulk email to the entire CEAL audience.                      |
| `Audience` (Resend)           | The contact list at the email provider.                        |
| `Cron`                        | Vercel scheduled function; runs `0 8 * * *` and `0 20 * * *` UTC.|
| `Override` / `Super admin override` | Special path in create APIs that lets Super Admin bypass the editing gate or year-mismatch checks. |
| `Post-collection edit`        | Edit performed after `closing_date`. Allowed only for privileged roles; stamped in audit log. |

## Key URLs

| URL                                                | What lives there                          |
|----------------------------------------------------|-------------------------------------------|
| <https://cealstats.org>                            | Production homepage                       |
| <https://www.eastasianlib.org/newsite/statistics/> | CEAL Statistics Committee landing page    |
| <https://scholarsarchive.byu.edu/jeal/>            | JEAL archive (publication target)         |
| `/help`                                            | Public Member User Guide                  |
| `/admin`                                           | Privileged dashboard (sign-in required)   |
| `/admin/superguide`                                | Super Admin Guide (in-app, bilingual)     |
| `/admin/survey-dates`                              | Per-year date overrides                   |
| `/admin/broadcast`                                 | Manual broadcast UI                       |
| `/admin/users`                                     | User management                           |
| `/admin/year-end-reports`                          | Excel/PDF exporters                       |
| `/admin/participation-reports`                     | Who submitted, who didn&apos;t            |
| `/statistics/quickview`                            | Public aggregated table                   |
| `/statistics/tableview`                            | Public table views                        |
| `/statistics/graphview`                            | Public chart views                        |
| `/statistics/pdf`                                  | Published PDFs (post-1998)                |
| `/statistics/pre-1998`                             | Pre-1998 historical archive               |
| `/api/cron/check-form-schedules`                   | Cron handler (auth: `Bearer $CRON_SECRET`)|

## Source code landmarks

| File                                                | Why it matters                                  |
|-----------------------------------------------------|-------------------------------------------------|
| `vercel.json`                                       | Cron schedule                                   |
| `lib/surveyDates.ts`                                | Default opening/closing/publication dates       |
| `lib/email.ts`                                      | Email send logic + dev-mode logging fallback    |
| `lib/emailTemplate.ts`                              | Template keys and default bodies                |
| `lib/auth.ts`                                       | JWT issue/verify, role lookups                  |
| `lib/libraryYearHelper.ts`                          | `isSuperAdmin()` + create-API year fallback     |
| `lib/auditLogger.ts`                                | Audit action union, `logAuditEvent()`           |
| `app/api/cron/check-form-schedules/route.ts`        | The single most important automation file       |
| `prisma/schema/schema.prisma`                       | Library_Year + User + global models             |
| `prisma/schema/survey_session.prisma`               | SurveySession (cron state)                      |
| `app/(authentication)/admin/superguide/`            | In-app Super Admin Guide content                |
| `app/help/`                                         | In-app Member User Guide content                |
| `app/statistics/pre-1998/page.tsx`                  | Pre-1998 archive entry                          |

## Environment variables (cheat-sheet)

| Var                          | Required? | Comes from                    |
|------------------------------|-----------|-------------------------------|
| `DATABASE_URL`               | ✅        | Neon dashboard (pooled)       |
| `DATABASE_URL_UNPOOLED`      | ✅        | Neon dashboard (direct)       |
| `AUTH_SECRET`                | ✅        | `openssl rand -base64 32`     |
| `ALG`                        | ✅        | constant: `HS256`             |
| `CRON_SECRET`                | ✅ in prod| `openssl rand -base64 32`     |
| `RESEND_API_KEY`             | ✅ in prod| Resend dashboard              |
| `RESEND_BROADCAST_LIST_ID`   | ✅ in prod| Resend audience UUID          |
| `BROADCAST_FROM_EMAIL`       | optional  | Verified domain in Resend     |
| `BROADCAST_FROM_NAME`        | optional  | Free-form                     |
| `SYNC_AUTH_TABLES`           | optional  | `true`/`false`; default false |

## Contacts

| Role                          | Person / channel                                 |
|-------------------------------|--------------------------------------------------|
| Most recent maintainer        | **Meng Qu** — qum@miamioh.edu (Web Service Librarian, Miami University) |
| System owner                  | CEAL Statistics Committee                        |
| Email vendor (Resend)         | Resend account holder (currently Meng Qu)        |
| Hosting (Vercel)              | Vercel project owner (currently Meng Qu)         |
| Database (Neon)               | Neon project owner (currently Meng Qu)           |
| Domain (`cealstats.org`)      | Confirm with the registrar of record             |

When the maintainer changes, the new maintainer must be added to:

1. The GitHub repo (`cealDatabase/cealDB`).
2. The Vercel project as Owner / Admin.
3. The Neon project as a member.
4. The Resend account as a team member.
5. Whoever holds the domain registrar credentials.

A `MAINTAINER_HANDOFF.md` checklist is a good idea when the role changes.

## Pre-1998 cutoff (FAQ)

**Q: Why can&apos;t I plot 1995 alongside 2020?**
A: The questionnaire was substantially revised in the 1998-1999 cycle.
Pre-1998 reports use a different schema and different column meanings.
Combining them silently misrepresents trends. See the dedicated archive
page at `/statistics/pre-1998`.

**Q: Where did the data go?**
A: Pre-1998 reports are the digitised PDFs listed under
`/statistics/pre-1998` and `/statistics/pdf/year-pdf-version`. The raw
numbers were never re-keyed into the post-1998 schema and (today) cannot
be queried alongside modern data.

**Q: Should I add an in-database guard against pre-1998 queries?**
A: It is currently a documentation-only convention. If you want a hard
guard, add it to `app/api/statistics/metadata/route.ts` and the chart-data
API; both filter year lists.

---

End of developer documentation. Read the in-app guides
(`/admin/superguide`, `/help`) for user-facing detail.
