-- scripts/data-change-log.sql
--
-- Records every insert, update and delete in the database in
-- "DataChangeLog" (prisma/schema/data_change_log.prisma): the row's values
-- before and after, when, and which connection wrote it.
--
-- AuditLog only holds what the website chose to log, and the catalogue Edit
-- dialogs logged nothing, so an overwritten note could not be traced or put
-- back. A trigger sees every write, whoever makes it: the website, a
-- script, the Neon SQL editor, or a developer's or AI tool's connection.
--
-- - INSERT logs the new row, DELETE the old row, UPDATE only the columns
--   that changed (old and new). An UPDATE that changes nothing is skipped.
-- - Password and token columns are written as "[hidden]".
-- - TRUNCATE (emptying a whole table) is logged too.
-- - Changes to existing AuditLog entries, and any edit to this log itself,
--   are logged; new AuditLog entries are not (they are a log already).
-- - Session and VerificationToken are left out: sign-in tokens only.
-- - If writing the log ever fails, the change itself still goes through
--   and Postgres prints a warning. Logging never blocks the website.
--
-- Run the steps in order, one at a time (the Neon SQL editor runs one
-- statement per run). Run on a Neon branch first, then on production. Safe
-- to run again: re-running step 4 also covers tables added since.
-- scripts/data-change-log-uninstall.sql removes the triggers again.


-- Step 1: the log table (the same table `prisma db push` would create).
CREATE TABLE IF NOT EXISTS "DataChangeLog" (
    "id" BIGSERIAL NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "table_name" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "row_key" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "db_user" TEXT,
    "application" TEXT,
    "client_addr" TEXT,
    "transaction_id" BIGINT,
    CONSTRAINT "DataChangeLog_pkey" PRIMARY KEY ("id")
);

-- Step 2a and 2b: its indexes.
CREATE INDEX IF NOT EXISTS "DataChangeLog_table_name_row_key_idx" ON "DataChangeLog"("table_name", "row_key");

CREATE INDEX IF NOT EXISTS "DataChangeLog_changed_at_idx" ON "DataChangeLog"("changed_at");


-- Step 3: the function every trigger calls. Its arguments are the table's
-- primary key columns, so each entry names the row it is about.
CREATE OR REPLACE FUNCTION public.data_change_log() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER            -- any role that may write a table may log it
SET search_path = public, pg_temp
AS $fn$
DECLARE
  old_row jsonb;
  new_row jsonb;
  old_out jsonb;
  new_out jsonb;
  key_text text;
BEGIN
  BEGIN
    IF TG_LEVEL = 'ROW' THEN
      IF TG_OP <> 'INSERT' THEN old_row := to_jsonb(OLD); END IF;
      IF TG_OP <> 'DELETE' THEN new_row := to_jsonb(NEW); END IF;

      IF TG_NARGS > 0 THEN
        SELECT string_agg(coalesce(coalesce(new_row, old_row) ->> a.col, ''), ',' ORDER BY a.ord)
          INTO key_text
          FROM unnest(TG_ARGV) WITH ORDINALITY AS a(col, ord);
      END IF;

      IF TG_OP = 'UPDATE' THEN
        SELECT jsonb_object_agg(n.key, o.value), jsonb_object_agg(n.key, n.value)
          INTO old_out, new_out
          FROM jsonb_each(new_row) AS n
          LEFT JOIN jsonb_each(old_row) AS o ON o.key = n.key
         WHERE n.value IS DISTINCT FROM o.value;
        IF new_out IS NULL THEN
          RETURN NULL;          -- nothing changed
        END IF;
      ELSE
        old_out := old_row;
        new_out := new_row;
      END IF;

      -- Never copy password hashes or tokens into the log.
      SELECT jsonb_object_agg(key, CASE
               WHEN key ~* '(^password$|token$|secret)' AND value <> 'null'::jsonb THEN '"[hidden]"'::jsonb
               ELSE value END)
        INTO old_out FROM jsonb_each(old_out);
      SELECT jsonb_object_agg(key, CASE
               WHEN key ~* '(^password$|token$|secret)' AND value <> 'null'::jsonb THEN '"[hidden]"'::jsonb
               ELSE value END)
        INTO new_out FROM jsonb_each(new_out);
    END IF;

    INSERT INTO "DataChangeLog"
      ("changed_at", "table_name", "operation", "row_key", "old_values", "new_values",
       "db_user", "application", "client_addr", "transaction_id")
    VALUES
      (clock_timestamp(), TG_TABLE_NAME, TG_OP, key_text, old_out, new_out,
       session_user, current_setting('application_name', true), host(inet_client_addr()), txid_current());
  EXCEPTION WHEN OTHERS THEN
    -- Logging must never stop the change it describes.
    RAISE WARNING 'data_change_log on %: %', TG_TABLE_NAME, SQLERRM;
  END;
  RETURN NULL;
END;
$fn$;


-- Step 4: a trigger on every table.
DO $install$
DECLARE
  t record;
  pk text;
BEGIN
  FOR t IN
    SELECT c.oid, c.relname
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relkind = 'r'
       AND c.relname NOT IN ('DataChangeLog', 'AuditLog', 'Session', 'VerificationToken', '_prisma_migrations')
  LOOP
    SELECT string_agg(quote_literal(a.attname), ', ' ORDER BY k.ord)
      INTO pk
      FROM pg_index i
      CROSS JOIN LATERAL unnest(i.indkey::int2[]) WITH ORDINALITY AS k(attnum, ord)
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum
     WHERE i.indrelid = t.oid AND i.indisprimary;

    EXECUTE format('DROP TRIGGER IF EXISTS data_change_log ON public.%I', t.relname);
    EXECUTE format('CREATE TRIGGER data_change_log AFTER INSERT OR UPDATE OR DELETE ON public.%I '
                   'FOR EACH ROW EXECUTE FUNCTION public.data_change_log(%s)', t.relname, coalesce(pk, ''));
    EXECUTE format('DROP TRIGGER IF EXISTS data_change_log_truncate ON public.%I', t.relname);
    EXECUTE format('CREATE TRIGGER data_change_log_truncate AFTER TRUNCATE ON public.%I '
                   'FOR EACH STATEMENT EXECUTE FUNCTION public.data_change_log()', t.relname);
  END LOOP;

  -- AuditLog: only changes to entries already written.
  DROP TRIGGER IF EXISTS data_change_log ON public."AuditLog";
  CREATE TRIGGER data_change_log AFTER UPDATE OR DELETE ON public."AuditLog"
    FOR EACH ROW EXECUTE FUNCTION public.data_change_log('id');
  DROP TRIGGER IF EXISTS data_change_log_truncate ON public."AuditLog";
  CREATE TRIGGER data_change_log_truncate AFTER TRUNCATE ON public."AuditLog"
    FOR EACH STATEMENT EXECUTE FUNCTION public.data_change_log();

  -- This log: note any edit or deletion of it.
  DROP TRIGGER IF EXISTS data_change_log_tamper ON public."DataChangeLog";
  CREATE TRIGGER data_change_log_tamper AFTER UPDATE OR DELETE OR TRUNCATE ON public."DataChangeLog"
    FOR EACH STATEMENT EXECUTE FUNCTION public.data_change_log();
END
$install$;


-- Step 5: check. Every table should say "logged"; only Session and
-- VerificationToken say "not logged".
SELECT c.relname AS table_name,
       CASE WHEN EXISTS (SELECT 1 FROM pg_trigger g
                          WHERE g.tgrelid = c.oid AND g.tgname IN ('data_change_log', 'data_change_log_tamper'))
            THEN 'logged' ELSE 'not logged' END AS status
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE n.nspname = 'public' AND c.relkind = 'r'
 ORDER BY status DESC, c.relname;


-- Looking things up (examples; change the table and id):
--
-- Every change to one entry, newest first, in Eastern time:
--   SELECT changed_at AT TIME ZONE 'America/New_York' AS changed_et, operation,
--          old_values, new_values, application
--     FROM "DataChangeLog"
--    WHERE table_name = 'List_EBook' AND row_key = '387'
--    ORDER BY id DESC;
--
-- Who it was: the website's AuditLog entry for the same table and id at the
-- same moment (the AuditLog timestamp is UTC):
--   SELECT timestamp, username, action, old_values, new_values
--     FROM "AuditLog"
--    WHERE table_name = 'List_EBook' AND record_id = '387'
--    ORDER BY id DESC;
--
-- Writes that did not come from the deployed website:
--   SELECT changed_at AT TIME ZONE 'America/New_York' AS changed_et, table_name,
--          operation, row_key, db_user, application, client_addr
--     FROM "DataChangeLog"
--    WHERE application IS DISTINCT FROM 'cealdb-vercel-production'
--    ORDER BY id DESC
--    LIMIT 100;
