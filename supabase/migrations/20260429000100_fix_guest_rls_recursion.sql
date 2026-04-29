-- Fix infinite RLS recursion introduced by guest garden access.
-- The gardens policy queried garden_share_links, which had its own RLS policy
-- that queried back to gardens — creating a circular dependency.
-- Solution: wrap the guest token check in a SECURITY DEFINER function
-- (row_security = off) so it bypasses RLS on garden_share_links entirely.

CREATE OR REPLACE FUNCTION is_valid_guest_token(p_token text, p_garden_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM garden_share_links gsl
    WHERE gsl.token = p_token
      AND gsl.allow_anonymous = true
      AND gsl.revoked_at IS NULL
      AND gsl.expires_at > now()
      AND gsl.garden_id = p_garden_id
  );
END;
$$;

-- Rebuild gardens policy using the helper function
DROP POLICY IF EXISTS "Gardens readable by owner or members or guests" ON gardens;

CREATE POLICY "Gardens readable by owner or members or guests"
ON gardens FOR SELECT
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM garden_members gm
    WHERE gm.garden_id = gardens.id
      AND gm.user_id = auth.uid()
  )
  OR (
    auth.jwt()->>'guest_token' IS NOT NULL
    AND is_valid_guest_token(auth.jwt()->>'guest_token', gardens.id)
  )
);

-- Rebuild plants policy using the helper function
DROP POLICY IF EXISTS "Plants readable by garden owner or members or guests" ON plants;

CREATE POLICY "Plants readable by garden owner or members or guests"
ON plants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM gardens g
    WHERE g.id = plants.garden_id
      AND (
        g.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM garden_members gm
          WHERE gm.garden_id = g.id
            AND gm.user_id = auth.uid()
        )
      )
  )
  OR (
    auth.jwt()->>'guest_token' IS NOT NULL
    AND is_valid_guest_token(auth.jwt()->>'guest_token', plants.garden_id)
  )
);
