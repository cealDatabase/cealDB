# 05 — The Annual Cycle

This is the most important *operational* page in the docs. The system
exists to drive a once-a-year survey, and a lot of the code only makes
sense in that context.

## TL;DR timeline (defaults — adjustable each year)

```
   July 1 (prev. year)                     ─┬─  Fiscal year begins (informational)
                                             │
   Sept (~)                                  │
   ├──  Super Admin opens admin/survey-dates │
   ├──  Reviews dates and the user list      │
   └──  (Optional) sends "surveys WILL open" │   ← Broadcast 1 (manual)
                                             │
   Oct 1 (default 00:00 PT)            ─────►│   ← cron flips is_open_for_editing
   ├── Cron sends "surveys are NOW open"     │   ← Broadcast 2 (auto)
   └── Member libraries fill 10 forms        │
                                             │
   Nov 25 (= closing - 7 days, default)─────►│   ← cron sends closing reminder
                                             │       ← Broadcast 3 (auto)
                                             │
   Dec 2 (default 23:59 PT)            ─────►│   ← cron flips is_open_for_editing OFF
                                             │       (Super Admin can still edit
                                             │        with override; see 07-maintenance)
                                             │
   Dec — Jan                                 │
   ├── Super Admin reviews data              │
   ├── Generates year-end Excel + PDF        │
   └── Hands off to JEAL editor              │
                                             │
   Feb — May (typical, NOT enforced)        │   ← Manual JEAL publication
   └── JEAL issue containing the report      │      Actual issue date varies by JEAL
       posted on scholarsarchive.byu.edu     │      editorial cycle.
                                             │
   June 30 (current year)             ─────►─┴─  Fiscal year ends (informational)
```

> **Read this carefully:** Oct 1 and Dec 2 are *defaults* in the code.
> The Super Admin can override per-year via `app/(authentication)/admin/survey-dates/page.tsx`.

> **JEAL publication is manual.** The system does not publish to JEAL
> automatically. The publication date in the database (`publication_date`)
> is informational only. Real JEAL issues land somewhere between **February
> and May**, depending on the editor&apos;s schedule that year.

## Where each step lives in the code

| Step                             | File / route                                                            |
|----------------------------------|-------------------------------------------------------------------------|
| Defaults for dates               | `lib/surveyDates.ts:getSurveyDates()`                                   |
| Per-year override UI             | `app/(authentication)/admin/survey-dates/page.tsx`                     |
| Per-year override API            | `app/api/admin/...` (set-dates handler under admin)                     |
| Send broadcast manually          | `app/(authentication)/admin/broadcast/BroadcastClient.tsx`              |
| Broadcast API                    | `app/api/admin/broadcast/route.ts`                                      |
| Cron handler (twice daily)       | `app/api/cron/check-form-schedules/route.ts`                            |
| Cron schedule                    | `vercel.json`                                                           |
| Email templates                  | `lib/emailTemplate.ts` + `email_template` DB rows                       |
| Force open / force close manual  | `app/api/admin/manual-open-forms/route.ts` and similar                  |
| Year-end Excel/PDF export        | `app/(authentication)/admin/year-end-reports/page.tsx`, `lib/excelExporter.ts`, `lib/pdfExporter.ts` |
| Participation report             | `app/(authentication)/admin/participation-reports/page.tsx`             |

## The default dates, precisely

From `lib/surveyDates.ts`:

| Field              | Default value (PT)              |
|--------------------|---------------------------------|
| `opening_date`     | Oct 1 of the academic year, 00:00 |
| `closing_date`     | Dec 2 of the academic year, 23:59 |
| `fiscal_year_start`| Jul 1 of the previous year      |
| `fiscal_year_end`  | Jun 30 of the academic year     |
| `publication_date` | Feb 1 of the next year          |

> `closing_date` in the Prisma schema comment says "default Dec 1" while
> `lib/surveyDates.ts` uses Dec 2. The runtime default in `surveyDates.ts`
> wins. If you ever need to reconcile, prefer the code over the comment.

## How the cron works

`app/api/cron/check-form-schedules/route.ts` runs twice a day on Vercel:

```
00:00 UTC → 16:00 / 17:00 PT  (winter / summer)
12:00 UTC → 04:00 / 05:00 PT
```

Wait — the schedule is actually `0 8 * * *` and `0 20 * * *` in
`vercel.json`, i.e. **08:00 UTC and 20:00 UTC**, which lands at PT
midnight-ish and noon-ish. Either way, the handler does this each invocation:

1. Authenticate. The request must carry `Authorization: Bearer $CRON_SECRET`
   (Vercel adds this automatically; manual hits must send it).
2. Pull the active `SurveySession` row(s).
3. For each:
   - If `now >= openingDate` and `notifiedOnOpen=false`, send
     `broadcast_open_forms` and flip `is_open_for_editing` true on every
     `Library_Year` for that academic year.
   - If `now >= closingDate - 7d` and `notifiedClosingReminder=false`,
     send `broadcast_closing_reminder`.
   - If `now >= closingDate` and `notifiedOnClose=false`, flip
     `is_open_for_editing` false and mark `notifiedOnClose=true`.
4. Write an audit log row for each action taken.

Idempotency: every action is gated by a flag on `SurveySession`, so a
double-fire (e.g. cron runs 8am and 8pm same day) does not send duplicate
emails.

## The three broadcasts

| Key                            | Trigger              | Subject template                                    |
|--------------------------------|----------------------|-----------------------------------------------------|
| `broadcast_announcement`       | Manual click         | "CEAL Statistics Survey — opens {{openingDate}}"    |
| `broadcast_open_forms`         | Auto on opening date | "CEAL Statistics Survey is NOW OPEN"                |
| `broadcast_closing_reminder`   | Auto 7 days pre-close| "Reminder: CEAL Statistics Survey Closes in One Week ({{closingDate}})" |
| `individual_open_forms`        | Manual per user      | (one-off resend; used to nudge a single delegate)   |

The exact bodies are stored in the `email_template` Postgres table and can
be edited by the Super Admin under
`app/(authentication)/admin/email-templates/...`. The defaults that ship
with `lib/emailTemplate.ts` are the fallback if the DB row is missing.

## Forms open and close

A library can submit form data when **all** of these are true:

- They are signed in.
- Their user has the `member` role for that library.
- A `Library_Year` row exists for `(library_id, current_year)`.
- That `Library_Year.is_open_for_editing` is true.

If `is_open_for_editing` is false, the API returns 403. Super Admin (and
Assistant Admin, with limits) can bypass this — see `lib/libraryYearHelper.ts:isSuperAdmin()`
and the override pattern documented in `07-maintenance.md`.

## Year-end report publication

After closing:

1. Super Admin goes to `/admin/year-end-reports` and selects the year.
2. They can export per-library or batch (ZIP) reports as Excel or PDF.
   Generators live in `lib/excelExporter.ts` and `lib/pdfExporter.ts`.
3. They can export `/admin/participation-reports` to show who did/did not
   submit.
4. **Outside the system**, the Super Admin sends the result to the JEAL
   editor and the report appears in a future JEAL issue (typically Feb-May).
5. Once published, they can flip a `PublishedReport.isPublished=true` flag
   so the public PDF page (`/statistics/pdf`) lists it.

There is no automated submission to JEAL. There is no automated PDF push.
The "publication date" stored in the DB is purely informational.

## What if dates need to slip?

Use `app/(authentication)/admin/survey-dates/page.tsx`:

- Change `openingDate` and/or `closingDate` on the active SurveySession.
- The cron will pick up the new values on its next run.
- If you change a date *to a value already in the past*, the cron will
  trigger on the next run regardless. Be aware of this if you push the
  closing date backward.
- If you change *forward* (extend the window), the broadcast for the new
  date will fire when that date arrives. Old broadcast flags do not
  reset automatically — if you need to re-send the closing reminder after
  pushing the date out, manually clear `notifiedClosingReminder=false` in
  the DB.

## What if the cron is broken?

The Super Admin has manual override endpoints:

- `app/api/admin/manual-open-forms/route.ts` — force open immediately.
- An equivalent close endpoint exists for symmetry.
- The Broadcast page has a "Send now" button for each template.

These are last-resort tools. Always prefer fixing the cron.

Next: `06-deployment.md`.
