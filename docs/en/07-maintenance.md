# 07 — Maintenance

This page is the runbook. It assumes the system is already deployed and
something is either broken, slow, or about to be changed.

## Common operational tasks

### "Open the survey early / late" (one-off)

Go to `/admin/survey-dates`, set the new opening / closing date,
save. The next cron run picks them up. If you need it open *right now*,
also hit `/admin/broadcast` → "Open forms now" or use the `manual-open-forms`
API.

### "Re-send a broadcast"

`/admin/broadcast` has a "Send now" button per template. The cron flag
that suppresses repeats lives on `SurveySession`:

- `notifiedOnOpen`
- `notifiedOnClose`
- `notifiedClosingReminder`
- `announcementSentAt`

Setting any of these to `false` (or `NULL` for `announcementSentAt`) makes
the corresponding broadcast eligible to fire again on the next cron run,
**if** the date condition is also met.

### "A library&apos;s data is wrong after closing"

There are two paths:

1. **Member-side**: ask the institution&apos;s delegate to log in and edit.
   They cannot edit after close unless `is_open_for_editing` is true.
2. **Super Admin override**: see `/admin/superguide/parts/Part5...` for
   the post-collection edit pattern. The 10 form APIs all check
   `isSuperAdmin()` and bypass the editing gate. Audit log captures the
   change with `POST_COLLECTION_EDIT` action.

### "Add a new member library"

The Member User Guide tells public users to email the committee. Once
approved:

1. Insert a `Library` row.
2. Insert a `Library_Year` row for the current academic year.
3. Create a `User` and link via `User_Library`.
4. Use `/admin/users` to send the opening email so they get a credential.

There is no UI for step 1 today; it is a manual SQL insert until somebody
builds it. Use Prisma Studio or a SQL client.

### "Reset a user&apos;s password"

`/admin/users` → find user → "Reset password". The system emails a token
that&apos;s valid for a short window (see `User.password_reset_expires`).
The reset page is at `/reset-password?token=...`.

If the user can&apos;t receive email at all, you can manually:

1. Generate a new token (or set `requires_password_reset=true`).
2. Hand them the URL out-of-band.

### "Copy last year&apos;s e-resource subscriptions to this year"

The `/admin/...copy-records` flow uses `app/api/copy-records/route.ts`.
This is **idempotent-protected**: it refuses to copy if duplicates exist
in the target year. If you need to re-copy, manually delete the target
rows first.

### "Fix sequences after restoring a dump"

```bash
node scripts/fix-all-sequences.js
```

You should never need this in normal operation. Only after `pg_restore`
or any operation that bulk-inserts with explicit IDs.

## Diagnosing common issues

### Sign-in fails with "user not found"

- Check the username casing. The signin handler does case-insensitive
  fallback, so this should rarely matter, but custom inserts can break it.
- Check `User.isactive`. Disabled users return "user not found" by design.
- Check `User.email_verified`. Unverified users may be blocked.

### Sign-in fails with "incorrect password"

- The handler supports bcrypt (`$2y$/$2a$/$2b$`), MD5-crypt (`$1$`), and
  Argon2id. If the password column is empty (`null`), the user is in
  "needs reset" state — send them a reset link.

### Form submit returns 403 / 404

- 403 = `is_open_for_editing` is false and the user is not super admin.
- 404 = no `Library_Year` row exists for `(library, current year)`. For
  super admins, the API falls back to the most recent year; check
  `lib/libraryYearHelper.ts` and the create-API pattern documented in
  `08-migration.md`.

### Cron silent / not firing

- See `06-deployment.md` → "What to do if the cron stops firing".
- Confirm `vercel.json` is unchanged at the repo root.
- Confirm `CRON_SECRET` matches between Vercel env and any manual caller.

### Broadcast not delivered

- Check `RESEND_API_KEY` is set in Vercel env.
- Check the From address domain is verified in Resend.
- Check the audience UUID matches `RESEND_BROADCAST_LIST_ID`.
- Check Resend dashboard → Logs for hard bounces or suppressed addresses.
- Local dev sends nothing; the email body is logged. That is expected.

### "I can&apos;t see my charts" on `/statistics/quickview`

- Confirm `/api/statistics/metadata` returns a non-empty `years` array.
- Confirm there are `Library_Year` rows for the requested year.
- The metadata API filters out `year !== 1900`. Years like `1900` were
  used as placeholders; you can ignore.
- Pre-1998 data is NOT served from this endpoint; it lives at
  `/statistics/pre-1998` only.

## Backups (you must own this)

Today the repo has no backup automation. Recommended pattern:

```bash
# Weekly, e.g. via GitHub Actions or any cron host:
pg_dump --no-owner --format=custom \
  "$DATABASE_URL_UNPOOLED" \
  > "ceal_postgres_$(date +%Y-%m-%d).dump"

# Then upload to off-site storage (S3, Drive, institutional backup, ...).
```

Keep at least 12 monthlies and 4 weeklies. During the survey window
(Oct–Dec) bump to nightly.

## Rotating secrets

Rotate when:

- A maintainer leaves.
- Any value historically appeared in a public commit (e.g. the historical
  `.env` in this repo).
- A vendor recommends rotation (Resend, Vercel, etc.).

Rotation procedure:

1. Generate a new value (`openssl rand -base64 32` for `AUTH_SECRET` /
   `CRON_SECRET`; new key from Resend dashboard for `RESEND_API_KEY`).
2. Update Vercel env vars (Production + Preview).
3. Redeploy the production build.
4. (For `AUTH_SECRET`) all existing JWT cookies become invalid; users
   will be forced to sign in again. Plan rotations for low-traffic times.
5. (For `RESEND_API_KEY`) invalidate the old key in Resend.

## Health checks

There is no `/health` endpoint today. Recommended ones to add when you
have time:

- `/api/health` returning DB connectivity + Redis (none today, future) +
  current cron status.
- A simple uptime monitor (UptimeRobot, BetterUptime) hitting `/`.

## Logs

- **App logs**: Vercel project → Deployments → choose deployment → Logs.
  Filter by route to drill in.
- **Audit logs**: `AuditLog` table. Query directly via Prisma Studio or
  the admin UI.
- **Email logs**: Resend dashboard.
- **Database query logs**: Neon → Project → Monitoring (limited but
  enough for slow query investigation).

## Periodic tasks

A reasonable yearly cadence:

| When                  | Task                                                           |
|-----------------------|----------------------------------------------------------------|
| 1 month before opening| Verify cron is firing (manual curl), test broadcasts on a dev branch |
| 1 week before opening | Rotate `CRON_SECRET`, sanity-check user list                   |
| Opening day           | Watch logs for the first few hours                             |
| Mid-window            | Eyeball Resend bounces; nudge non-submitters                   |
| Close day             | Confirm forms locked; export full DB dump                      |
| After close           | Generate year-end reports; archive `Library_Year` rows         |
| Yearly                | Renew domain, audit Vercel/Neon/Resend access lists            |

Next: `08-migration.md`.
