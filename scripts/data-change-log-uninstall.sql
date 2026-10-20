-- scripts/data-change-log-uninstall.sql
--
-- Turns off the change log installed by scripts/data-change-log.sql. Use it
-- only if the triggers ever get in the way. The "DataChangeLog" table and
-- what it has recorded are kept; run data-change-log.sql again to turn
-- logging back on.
--
-- Run the two steps in order, one at a time.

-- Step 1: remove the triggers from every table.
DO $uninstall$
DECLARE
  g record;
BEGIN
  FOR g IN
    SELECT c.relname, t.tgname
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND t.tgname IN ('data_change_log', 'data_change_log_truncate', 'data_change_log_tamper')
  LOOP
    EXECUTE format('DROP TRIGGER %I ON public.%I', g.tgname, g.relname);
  END LOOP;
END
$uninstall$;

-- Step 2: remove the function.
DROP FUNCTION IF EXISTS public.data_change_log();
