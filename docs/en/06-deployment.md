# 06 — Deployment

## Where production lives today

| Layer       | Vendor       | What you need                                              |
|-------------|--------------|------------------------------------------------------------|
| Hosting     | Vercel       | Owner of the project; ability to view/edit env vars        |
| Database    | Neon (Postgres)| Project access; main + branch databases                  |
| Email       | Resend       | API key + audience IDs                                     |
| Domain      | (registrar)  | `cealstats.org` DNS pointed at Vercel                      |

You will need credentials for all four to run a full production deploy or
disaster recovery. See `09-glossary.md` for who currently holds them.

## Vercel project

- **Framework preset:** Next.js (Vercel auto-detects).
- **Build command:** `npm run build` (which runs `prisma generate && next build`).
- **Output directory:** `.next` (default).
- **Node version:** 20.x or whatever Next.js 16 currently requires.

The cron jobs are declared in `vercel.json` at the repo root and are
deployed automatically with the rest of the app. There is no separate
cron config in the Vercel dashboard.

## Environment variables (Vercel → Project Settings → Environment Variables)

These must exist in **Production** (and ideally **Preview** for testing):

```
DATABASE_URL                # Neon pooled URL
DATABASE_URL_UNPOOLED       # Neon direct URL
PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGHOST_UNPOOLED   # alternates
POSTGRES_URL, POSTGRES_PRISMA_URL, ...                    # template aliases
AUTH_SECRET                 # JWT signing
ALG=HS256
CRON_SECRET                 # required so cron endpoints reject random callers
RESEND_API_KEY              # broadcast email
RESEND_BROADCAST_LIST_ID    # CEAL audience UUID in Resend
BROADCAST_FROM_EMAIL        # optional override
BROADCAST_FROM_NAME         # optional override
SYNC_AUTH_TABLES            # leave unset; default false
```

After changing any env var on Vercel, **redeploy** so the new values are
baked into the running build. Cron functions read env at invocation time,
so they will pick up changes on the next run, but page builds cache them.

## Build pipeline

```
Vercel → npm install → prisma generate → next build → deploy
```

Prisma generation runs in CI thanks to the `build` script:

```json
"build": "prisma generate && next build"
```

If you ever see "Cannot find module '@prisma/client/...'" in production
logs, that script did not run; check the build output.

## Cron security

The cron path is publicly reachable at:

```
https://cealstats.org/api/cron/check-form-schedules
```

Vercel auto-injects an `Authorization: Bearer <CRON_SECRET>` header for
its own scheduled invocations. The handler **rejects** anything else with
a 401. If you ever need to test from your laptop:

```bash
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  https://cealstats.org/api/cron/check-form-schedules
```

Do not commit `CRON_SECRET` anywhere. Rotate it via:

```bash
openssl rand -base64 32
```

then update both Vercel env vars **and** any other place a manual caller
needs it.

## DNS

`cealstats.org` is configured to point at Vercel. Verify with:

```bash
dig +short cealstats.org
```

You should see Vercel&apos;s edge IPs (or a CNAME to `cname.vercel-dns.com`).
If the domain is moved off Vercel, repeat the same configuration on the
new host and wait for DNS propagation.

## Resend

In the Resend dashboard:

- **API keys** → keep one named "cealstats production". Use it for
  `RESEND_API_KEY`. Restrict to "Sending access" only.
- **Audiences** → there should be a single "CEAL Members" audience whose
  ID matches `RESEND_BROADCAST_LIST_ID`. Audience members are *normal
  email contacts*, not Resend "users".
- **Domains** → `cealstats.org` (or whichever domain is in the From
  address) must be verified with SPF/DKIM. If you switch From addresses,
  re-verify.
- **From address** must match a verified domain or Resend will silently
  drop the send.

There is no "Resend webhook" wired in. Bounce/complaint handling is
manual — check the Resend dashboard during/after each broadcast.

## Neon

- **Project**: cealDB (or whatever it is named).
- **Production branch**: `main`. Connection string is what `DATABASE_URL`
  points at.
- **Dev branches**: create one per developer. Branches share the same
  storage but write isolated data; cheap and ideal for testing.
- **Connection pooling**: We use the *pooled* connection string in app
  code (compatible with Vercel serverless). Use the *unpooled* one for
  Prisma migrations and Prisma Studio.
- **Auto-suspend**: Neon free/scale plans suspend when idle. The first
  request to a cold DB takes a couple of seconds. This is harmless in
  production; in dev you may see slow first hits.

## Deployment workflow

For non-emergency changes:

1. Branch from `main`.
2. Open a PR. Vercel builds a Preview URL.
3. Test on the Preview URL with a Neon dev branch.
4. Merge to `main`. Vercel auto-deploys to production.
5. Smoke-check the production site (sign-in, view a form, view a chart).

For emergency hotfixes:

1. Create the patch branch.
2. Cherry-pick or push directly if you have rights.
3. Watch the Vercel deployment dashboard for build errors.
4. If the build fails, **revert immediately** — production stays on the
   last green deploy automatically, but Preview previews on PRs do not.

## What to do if the cron stops firing

1. Check Vercel → Project → Cron Jobs tab for invocation history and any
   errors.
2. Hit the endpoint manually with `curl` (see "Cron security" above) to
   see the response body.
3. If the body says "unauthorised", `CRON_SECRET` is mismatched between
   Vercel and the request.
4. If it returns 200 but does nothing visible, look at recent
   `SurveySession` rows. Notification flags may already be `true`,
   suppressing further sends. Reset them only if you want to re-send.

## What to do if a deploy fails

1. Open the build log on Vercel.
2. The most common failures:
   - Prisma generate errors (run `npx prisma generate` locally to repro).
   - TypeScript build errors (run `npm run build` locally).
   - Out-of-memory in build (rare; usually a runaway dependency).
3. If the failure is environmental, redeploy the previous commit ("Promote
   to Production" on the last green build).

## Domain / TLS

Vercel issues TLS certificates automatically. If `https://cealstats.org`
shows a cert error, check:

- The custom domain still points at Vercel.
- DNS hasn&apos;t expired or rotated.
- Vercel&apos;s domain config still lists the production domain.

Next: `07-maintenance.md`.
