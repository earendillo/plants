-- Fix accept_garden_share_link: add SET row_security = off so the
-- SECURITY DEFINER function bypasses RLS when looking up the share token.
-- Without this, Supabase's postgres role (row_security = on by default)
-- applies the garden_share_links RLS policy, which only allows garden owners
-- to read rows — meaning the recipient (non-owner) gets no rows back and the
-- token lookup always fails with "Invalid or expired token".

CREATE OR REPLACE FUNCTION accept_garden_share_link(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_garden_id uuid;
  v_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT gsl.garden_id, gsl.role
    INTO v_garden_id, v_role
  FROM garden_share_links gsl
  WHERE gsl.token = p_token
    AND gsl.allow_anonymous = false
    AND gsl.revoked_at IS NULL
    AND gsl.expires_at > now()
  LIMIT 1;

  IF v_garden_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM gardens
    WHERE id = v_garden_id
      AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Already the owner of this garden';
  END IF;

  INSERT INTO garden_members (garden_id, user_id, role)
  VALUES (v_garden_id, auth.uid(), v_role)
  ON CONFLICT (garden_id, user_id)
  DO UPDATE SET role = excluded.role;

  RETURN v_garden_id;
END;
$$;
