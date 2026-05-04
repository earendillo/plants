-- Find and drop all FK constraints in the public schema that reference
-- auth.users with ON DELETE NO ACTION or RESTRICT.
-- These block auth.admin.deleteUser() because Postgres enforces them
-- before executing cascades on other tables.
--
-- Safe to drop: any table that genuinely needs cleanup on user deletion
-- already has an explicit CASCADE or SET NULL constraint.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname, conrelid::regclass AS table_name
    FROM pg_constraint
    WHERE confrelid = 'auth.users'::regclass
      AND contype = 'f'
      AND confdeltype IN ('a', 'r')  -- 'a' = NO ACTION, 'r' = RESTRICT
  LOOP
    RAISE NOTICE 'Dropping constraint % on table %', r.conname, r.table_name;
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.table_name, r.conname);
  END LOOP;
END;
$$;
