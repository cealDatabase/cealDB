# 08 — Migration

This page is for the worst-case scenario: you need to move the system off
its current vendors. Read it once now even if you don&apos;t need it.

## When you might need this

- Vercel pricing or policy changes.
- Neon disappears or becomes unaffordable.
- Resend stops working for the From domain you need.
- The committee decides to bring everything in-house at a member institution.
- A whole-codebase port to a different framework (rare, large project).

The system was rebuilt from PHP/MySQL into Next.js/Postgres in this repo,
so we have done the hardest possible migration once already.

## Before you start

1. Get **two** complete database dumps with `pg_dump --format=custom`. One
   from "today" and one from "the last clean shutdown". Store separately.
2. Snapshot the current Vercel project settings (env vars, domains, cron
   schedule). Take screenshots if needed.
3. Snapshot the Resend audience list (export contacts to CSV).
4. Confirm you control the DNS for `cealstats.org`. Without DNS you
   cannot finish a migration.
5. Decide your downtime budget. The minimum is "switch DNS"; realistic is
   2–6 hours including verification.

## Migration scenarios

### Scenario A — Move only the database (Neon → another Postgres)

Cheapest move. App stays on Vercel.

1. Create the new Postgres (e.g. AWS RDS, Supabase, Render).
2. Restore the most recent dump:
   ```bash
   pg_restore --no-owner --dbname="$NEW_DATABASE_URL" ceal_postgres_<date>.dump
   ```
3. Run `node scripts/fix-all-sequences.js` against the new DB.
4. Update Vercel env vars (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`,
   `POSTGRES_*` aliases) to the new strings.
5. Redeploy production.
6. Verify by signing in, viewing a chart, hitting the cron once.
7. Decommission Neon after a successful 7-day soak.

### Scenario B — Move the host (Vercel → another platform)

Possible targets: Netlify, Cloudflare Pages, AWS Amplify, a self-hosted
Node.js box. Next.js works on all of them but cron coverage varies.

1. On the new host, set up:
   - Node 20+ build environment.
   - All env vars from Vercel (`AUTH_SECRET`, `CRON_SECRET`, `DATABASE_URL`,
     `RESEND_*`, ...).
   - A scheduled task equivalent to Vercel cron pointing at
     `/api/cron/check-form-schedules`. Twice daily, with the
     `Authorization: Bearer $CRON_SECRET` header.
2. Build and deploy.
3. Move DNS:
   - Update `cealstats.org` to point at the new host.
   - TLS will be issued by the new host; wait for that.
4. Watch logs for the first day.
5. Tear down the Vercel project after a soak period.

If your new host doesn&apos;t support Next.js out of the box, you can run
`next build && next start` on a plain Node server behind an nginx reverse
proxy. The same works if a member institution is hosting it on a campus
VM.

### Scenario C — Move email (Resend → another provider)

Most likely targets: AWS SES, SendGrid, Mailgun, Postmark.

1. Pick provider, create account, verify the From domain (SPF + DKIM).
2. Create an "Audience" or "List" containing the same emails as the
   Resend audience. Export Resend → CSV → import.
3. Replace `lib/email.ts` to call the new provider&apos;s SDK. The
   abstraction is shallow; this is a couple of hundred lines, not a rewrite.
4. Replace `RESEND_API_KEY` / `RESEND_BROADCAST_LIST_ID` env vars with the
   equivalents.
5. Test end-to-end on a dev branch with a small "test list" before
   pointing at the real audience.
6. After a successful broadcast cycle, decommission Resend.

### Scenario D — Whole stack to a campus server

This is rarely the right call but sometimes a committee insists.

You will need:

- A persistent Linux box (any institution data center will work).
- Postgres 14+ on the same box or accessible to it.
- Node 20+ + nginx.
- A way to schedule cron (`crontab`, `systemd timers`).
- TLS via Let&apos;s Encrypt or institutional CA.
- Outbound SMTP via the institution mail relay, or keep using a SaaS email
  provider for deliverability.

Steps in order:

1. Stand up the box, install Postgres, Node, nginx.
2. Restore the dump; run the sequence fixer.
3. Clone this repo, `npm install`, `npm run build`.
4. Run `npx next start -p 3000` under `systemd` so it survives reboots.
5. Configure nginx to terminate TLS and proxy to `127.0.0.1:3000`.
6. Add a `crontab` entry that hits the cron endpoint twice daily with the
   `Authorization` header.
7. Move DNS, soak, decommission cloud vendors.

The single hardest part is **email deliverability** if you switch off
Resend. Plan that piece first.

## Schema migration tips

If a vendor change forces a Postgres-flavour change (e.g. Aurora,
CockroachDB), you may discover Prisma extensions that don&apos;t apply.
Today the schema uses only standard Postgres features (`serial`, JSONB
nowhere critical, `DateTime`). It should restore cleanly. Nothing relies
on Postgres-only features beyond what every Postgres-compatible system has.

`prisma db push --accept-data-loss` is your friend during exploratory
schema reshaping on dev branches. **Never** run it against production.

## Things that will break and how to spot them

| Symptom                                                          | Likely cause |
|------------------------------------------------------------------|--------------|
| Logins look fine but pages 500 with "JWT verify failed"          | `AUTH_SECRET` differs between environments |
| Cron returns 401 in logs                                         | `CRON_SECRET` mismatch |
| Broadcasts return 200 but no email                               | From domain not verified at the new email provider |
| Forms returns 404 in production but 200 in preview               | Dev had a `Library_Year` row that production doesn&apos;t — seed it |
| Slow cold starts on every request                                | DB sleep on auto-suspend; either disable auto-suspend or add a warmup ping |
| `Prisma Client did not initialize`                               | Build did not run `prisma generate`; verify the build command |

## Codebase port (Next.js → other framework)

This is rarely worth the cost. The schema, business rules, and bilingual
UI are the actual value; the framework is the easy part. If you must:

1. Reuse the Prisma schema as-is.
2. Reimplement the API routes (REST or GraphQL) targeting the same shapes.
3. Reimplement the UI; the in-app guides under `app/help/` and
   `app/(authentication)/admin/superguide/` document the user expectations.
4. The cron handler logic in `app/api/cron/check-form-schedules/route.ts`
   is small and self-contained — port it last.

Budget: this is a 4–6 month effort for a single mid-level engineer.

## Final checklist before declaring success

- [ ] All three URLs work: `/`, `/statistics/quickview?year=<recent>`, `/help`.
- [ ] Sign-in works for at least one Member account and one Super Admin.
- [ ] A test broadcast lands in your inbox (use a small audience).
- [ ] Cron returns `200 OK` when invoked manually with the right header.
- [ ] A test form submit succeeds during an open window.
- [ ] An audit log row was written for the test submit.
- [ ] DNS, TLS, and email DKIM/SPF all green.
- [ ] Backups are running on the new infra.
- [ ] Old infra is *off*, not just hidden.

Next: `09-glossary.md`.
