# CEAL DB Developer Guide

This guide helps developers run, configure, and deploy the CEAL Statistics Database application on their own infrastructure.

## 1. Architecture Overview

- Next.js 15 (App Router) with TypeScript
- Prisma ORM with PostgreSQL
- Tailwind CSS + shadcn/ui
- Authentication: server-side session and protected admin area
- Modular Prisma schema (by domain) under `prisma/schema`
- API routes under `app/api/*` using Next.js Route Handlers
- Forms under `app/(authentication)/admin/forms/[libid]/*` with React Hook Form + Zod

### Key Entities
- `Library` and `Library_Year`: identify an institution and an annual survey period
- Domain tables: `Monographic_Acquisitions`, `Volume_Holdings`, `Serials`, `Other_Holdings`, `Unprocessed_Backlog_Materials`, `Fiscal_Support`, `Personnel_Support`, `Public_Services`, `Electronic`, `Electronic_Books`
- `Entry_Status`: a per-library-year row with boolean flags per form to indicate final submission

## 2. Repository Setup

1. Clone and install:
   ```bash
   git clone <repo-url>
   cd cealDB
   npm install
   ```

2. Environment variables (`.env`):
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/cealdb"
   NEXTAUTH_SECRET="change-me"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. Database and Prisma:
   ```bash
   # Generate Prisma Client, push schema, and seed
   npm run prisma
   # or
   npx prisma generate --schema=./prisma/schema
   npx prisma db push --schema=./prisma/schema
   npx prisma db seed
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

## 3. Configuration Notes

- Survey windows: configurable via admin UI (survey dates) and `Library_Year.is_open_for_editing`.
- Authentication: the app includes routes for admin access; ensure `NEXTAUTH_*` variables are configured for production.
- Data model: schemas are split per domain under `prisma/schema`. Keep fields synchronized with form code.

## 4. Form Flow and Statuses

- Each form has two actions:
  - Save Draft: persists record for the current `Library_Year` without altering `Entry_Status`.
  - Submit: sends `finalSubmit: true` to the corresponding `create` API route.
- The `create` API routes call `markEntryStatus(libraryYearId, formKey)` after a successful save to set the boolean flag for that form in `Entry_Status`.
- Dashboard (My Forms) shows:
  - Ready: no record exists yet for the form/year
  - Filled: a record exists (draft or update saved)
  - Submitted: the corresponding boolean in `Entry_Status` is true

## 5. Important Files

- `lib/db.ts`: Prisma client instance
- `lib/entryStatus.ts`: `markEntryStatus()` helper with sequence auto-fix
- `app/(authentication)/admin/forms/page.tsx`: server component building My Forms status
- `components/FormStatusBadge.tsx`: renders Ready / Filled / Submitted
- `app/api/<form>/create/route.ts`: upsert logic per form
- `components/forms/*-form.tsx`: front-end forms (onSubmit vs Save Draft)

## 6. Database Sequences and Reliability

- If you encounter `P2002: Unique constraint failed on (id)` on insert, it’s usually auto-increment sequence drift.
- `markEntryStatus()` auto-repairs sequence for `Entry_Status` and retries.
- For bulk repairs, include maintenance scripts to `setval()` sequences based on `MAX(id)` (example pattern in codebase).

## 7. Deployment

- Build and run:
  ```bash
  npm run build
  npm start
  ```
- Set `DATABASE_URL`, `NEXTAUTH_*` in your hosting environment.
- Ensure your PostgreSQL instance is reachable from the app environment.

## 8. Customization Tips

- Adding a new form:
  1. Create Prisma schema for the new domain.
  2. Add model to `Library_Year` relation.
  3. Create API `app/api/<newForm>/create/route.ts`.
  4. Build form UI under `components/forms` and page under `app/(authentication)/admin/forms/[libid]/<newForm>`.
  5. Map `<newForm>` to an Entry_Status boolean (extend `FormKey` and `fieldMap`).
  6. Add it to `constant/form.js` and update dashboard logic.

- Error handling:
  - Keep API routes resilient with validation and clear 4xx/5xx responses.
  - Use `try/catch` and log structured error messages.

## 9. Testing

- Local smoke tests: Save Draft and Submit each form for a test library/year.
- Check My Forms displays the correct status transitions.
- Verify Entry_Status row toggles per form in the database.

## 10. Security

- Do not log sensitive data (passwords, secrets, tokens).
- Use HTTPS in production and secure cookie/session settings.
- Restrict admin routes with authentication and authorization checks.

## 11. Troubleshooting

- Forms are closed: confirm `Library_Year.is_open_for_editing`.
- Missing statuses: ensure `finalSubmit` is included on Submit only and API calls `markEntryStatus()`.
- Sequence errors: rely on auto-fix in `lib/entryStatus.ts`; for persistent issues, repair sequences manually.

---

For questions or contributions, open an issue or submit a PR.
