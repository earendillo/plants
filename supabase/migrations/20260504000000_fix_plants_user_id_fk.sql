-- plants.user_id was created with a FK to auth.users(id) without ON DELETE CASCADE.
-- This blocks auth.admin.deleteUser() because Postgres enforces the constraint before
-- executing cascades. The column is redundant — ownership is captured via
-- plants.garden_id → gardens.owner_id → auth.users (already CASCADE).
-- Drop the constraint so user deletion can proceed.

DO $$
DECLARE
  _constraint_name text;
BEGIN
  SELECT conname INTO _constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.plants'::regclass
    AND contype = 'f'
    AND confrelid = 'auth.users'::regclass;

  IF _constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.plants DROP CONSTRAINT %I', _constraint_name);
  END IF;
END;
$$;
