-- Diagnostic: find what is blocking auth.admin.deleteUser()
-- Run this in the Supabase SQL editor and share the output.

-- 1. All FK constraints in ALL schemas that reference auth.users
--    (uses explicit OID resolution to avoid schema search path issues)
SELECT
  c.conname                  AS constraint_name,
  c.conrelid::regclass       AS from_table,
  c.confdeltype              AS on_delete  -- a=NO ACTION, r=RESTRICT, c=CASCADE, n=SET NULL
FROM pg_constraint c
JOIN pg_class     cls ON cls.oid = c.confrelid
JOIN pg_namespace  ns ON  ns.oid = cls.relnamespace
WHERE cls.relname = 'users'
  AND ns.nspname  = 'auth'
  AND c.contype   = 'f'
ORDER BY c.conrelid::regclass::text;

-- 2. All triggers on public schema tables that touch deletion
SELECT
  trigger_name,
  event_object_table AS table_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_manipulation IN ('DELETE', 'UPDATE')
ORDER BY event_object_table, trigger_name;
