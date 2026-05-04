-- Postgres function to delete a user account in one atomic transaction.
-- Called via admin.rpc() from the API route using the service role.
-- Bypasses GoTrue's deleteUser which has an internal failure on this project.
--
-- Deletion order (respects FK constraints):
--   plants → activity_logs (cascade)
--   gardens → garden_members, garden_share_links, plants (cascade)
--   profiles (cascade via auth.users FK, but deleted explicitly first)
--   auth.users → auth.sessions, auth.identities, auth.refresh_tokens (cascade)

CREATE OR REPLACE FUNCTION public.delete_user_account(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Leave gardens the user is a member of (not owner) — cascade handles their row
  DELETE FROM public.garden_members WHERE user_id = p_user_id;

  -- Delete plants in owned gardens (activity_logs cascade from plants)
  DELETE FROM public.plants
  WHERE garden_id IN (
    SELECT id FROM public.gardens WHERE owner_id = p_user_id
  );

  -- Delete owned gardens (garden_members, garden_share_links cascade)
  DELETE FROM public.gardens WHERE owner_id = p_user_id;

  -- Delete profile
  DELETE FROM public.profiles WHERE id = p_user_id;

  -- Delete auth user — cascades to auth.sessions, auth.identities,
  -- auth.refresh_tokens, auth.mfa_factors, auth.audit_log_entries
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Only service_role may call this
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO service_role;
