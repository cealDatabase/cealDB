# 02 — Getting Started

This is the "Day 1" guide. By the end of this page you should have the app
running locally against a Postgres database.

## Prerequisites

| Tool       | Version (or newer)        | Why                                            |
|------------|---------------------------|------------------------------------------------|
| Node.js    | 20.x LTS                  | Next.js 16 minimum                             |
| npm        | bundled with Node          | package manager (`package.json` is npm-style)  |
| Git        | any recent version        | source control                                 |
| Postgres   | 14+ (or use Neon cloud)   | the production DB is Postgres on Neon          |

We do **not** use yarn or pnpm. Stick to npm to keep `package-lock.json` clean.

## 1. Clone

```bash
git clone https://github.com/cealDatabase/cealDB.git
cd cealDB
```

## 2. Install

```bash
npm install
```

This will:
- pull all dependencies listed in `package.json`
- run `prisma generate` (via the `postinstall`/`build` scripts) which writes
  the Prisma client into `prisma/generated/client/`

If you ever see "client not found" type errors, run `npx prisma generate`
manually.

## 3. Get the environment variables

The repository **does not** ship a working `.env`. You must obtain the real
values from the current maintainer (see `09-glossary.md` for contact). The
canonical variables are:

```ini
# Postgres (Neon recommended)
DATABASE_URL=postgres://USER:PASSWORD@HOST/DB?sslmode=require
DATABASE_URL_UNPOOLED=postgres://USER:PASSWORD@DIRECT_HOST/DB?sslmode=require

# Auth
AUTH_SECRET=<random 32+ char string used for JWT signing>
ALG=HS256

# Cron — protects /api/cron/check-form-schedules from abuse.
# Generate with: openssl rand -base64 32
CRON_SECRET=<random secret, must match Vercel cron Authorization header>

# Email (Resend) — required in production for broadcasts to fire
RESEND_API_KEY=<re_... key from Resend dashboard>
RESEND_BROADCAST_LIST_ID=<UUID for the CEAL audience in Resend>

# Optional sender override
BROADCAST_FROM_EMAIL="CEAL Database <notifications@cealstats.org>"
BROADCAST_FROM_NAME="CEAL Database"
```

> ⚠️ **Do not commit `.env`.** It is gitignored, but the file was committed
> at least once historically (`git log -p -- .env`). When you rotate
> credentials, also rotate any value that ever appeared in git history.

Place the file at the repo root:

```
cealDB/.env
```

## 4. Get a database

You have three reasonable choices. For day-to-day development, Option A is
the lowest friction.

### Option A — Use a Neon "branch" of production (recommended)

Neon supports cheap database branches. Ask the maintainer to create a
branch off the production DB; the connection string they give you replaces
`DATABASE_URL`. You get real data, isolated from production writes.

### Option B — Local Postgres + restored dump

If you prefer fully offline:

```bash
# Start a local Postgres (e.g. via Postgres.app or Docker)
createdb cealdb_local
pg_restore -d cealdb_local /path/to/ceal_postgres_<date>.dump
```

Set `DATABASE_URL=postgresql://localhost/cealdb_local` in `.env`.

### Option C — Empty schema + `prisma db seed`

If you have no dump and no Neon access:

```bash
npm run db:reset
```

This runs `prisma db push --force-reset && prisma db seed && node scripts/fix-all-sequences.js`.
You will get a structurally correct but content-light database. Member
libraries and historical years will be missing.

## 5. Run

```bash
npm run dev
```

Then open <http://localhost:3000>. Log in with a known account, or create
one through the sign-up flow if you reset and seeded.

## 6. Sanity checks

| Check                                                | What good looks like                                  |
|------------------------------------------------------|-------------------------------------------------------|
| Open `/`                                             | Hero page with year, institutions, total holdings     |
| Open `/statistics/quickview?year=2024`               | A long table of institutions for that year            |
| Open `/statistics/pre-1998`                          | Historical archive page renders                       |
| Open `/help` (logged out)                            | Member User Guide loads                               |
| Open `/admin/superguide` (logged in as Super Admin)  | Super Admin Guide loads                               |
| Run `npx prisma studio`                              | Schema explorer pops up at <http://localhost:5555>    |

## 7. Common first-day pitfalls

- **`Prisma client not generated`** — run `npx prisma generate`.
- **`P1001: Can&apos;t reach database server`** — your `DATABASE_URL` is
  wrong or your Neon branch is paused. Re-issue the URL.
- **Sign-in always says "user not found"** — your DB has the schema but no
  seeded users. Either ask for a seed dump or create one via signup.
- **Broadcast emails not arriving** — `RESEND_API_KEY` is missing in `.env`.
  In dev, broadcasts log to the console instead of sending; that&apos;s
  expected. See `lib/email.ts`.
- **Cron jobs do nothing locally** — Vercel cron only runs on Vercel.
  Locally, hit `/api/cron/check-form-schedules` manually with the
  `Authorization: Bearer $CRON_SECRET` header to test.

## 8. Useful npm scripts

| Script           | What it does                                                    |
|------------------|-----------------------------------------------------------------|
| `npm run dev`    | Next.js dev server (Turbopack)                                  |
| `npm run build`  | Generates Prisma client and builds for production               |
| `npm run start`  | Serves the production build                                     |
| `npm run lint`   | Runs ESLint                                                     |
| `npm run db:push`| `prisma db push` — apply schema without a migration             |
| `npm run db:reset`| Wipe and re-seed (DESTRUCTIVE — never run against production)  |
| `npm run db:seed`| Re-seed without wiping (DESTRUCTIVE for tables it touches)      |
| `npm run prisma:studio` | Schema/data explorer at <http://localhost:5555>          |

> Note: `package.json` also defines `db:check` and `db:verify`, but those
> reference scripts (`pre-deploy-checks.js`, `post-deploy-verify.js`) that
> do **not** currently exist in the repo. Treat those entries as broken
> until someone restores or removes them.

Next: `03-architecture.md`.
