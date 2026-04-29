-- supabase/migrations/20260429000000_guest_garden_access.sql
-- Guest garden access: schema changes, RLS updates, new RPCs

-- ============================================================
-- 1. Schema changes to garden_share_links
-- ============================================================

ALTER TABLE garden_share_links
  ADD COLUMN IF NOT EXISTS allow_anonymous BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS label TEXT NULL,
  ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 7;

-- Set a safe default so existing inserts without expires_at don't break
ALTER TABLE garden_share_links
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '6 months');

-- Backfill existing rows that have expires_at null
UPDATE garden_share_links
  SET expires_at = now() + interval '6 months'
  WHERE expires_at IS NULL;

-- Now enforce NOT NULL
ALTER TABLE garden_share_links
  ALTER COLUMN expires_at SET NOT NULL;

-- Performance indexes for guest token lookups
CREATE INDEX IF NOT EXISTS idx_garden_share_links_token
  ON garden_share_links (token);

CREATE INDEX IF NOT EXISTS idx_garden_share_links_garden_token
  ON garden_share_links (garden_id, token);

-- ============================================================
-- 2. Update gardens SELECT policy — add guest branch
-- ============================================================

DROP POLICY IF EXISTS "Gardens readable by owner or members" ON gardens;

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
    AND EXISTS (
      SELECT 1 FROM garden_share_links gsl
      WHERE gsl.token = (auth.jwt()->>'guest_token')
        AND gsl.allow_anonymous = true
        AND gsl.revoked_at IS NULL
        AND gsl.expires_at > now()
        AND gsl.garden_id = gardens.id
    )
  )
);

-- ============================================================
-- 3. Update plants SELECT policy — add guest branch
-- ============================================================

DROP POLICY IF EXISTS "Plants readable by garden owner or members" ON plants;

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
    AND EXISTS (
      SELECT 1 FROM garden_share_links gsl
      WHERE gsl.token = (auth.jwt()->>'guest_token')
        AND gsl.allow_anonymous = true
        AND gsl.revoked_at IS NULL
        AND gsl.expires_at > now()
        AND gsl.garden_id = plants.garden_id
    )
  )
);

-- ============================================================
-- 4. Validation RPC (used by /api/guest/token — no auth needed)
-- ============================================================

CREATE OR REPLACE FUNCTION validate_anonymous_share_link(p_token text)
RETURNS TABLE (garden_id uuid, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN QUERY
  SELECT gsl.garden_id, gsl.expires_at
  FROM garden_share_links gsl
  WHERE gsl.token = p_token
    AND gsl.allow_anonymous = true
    AND gsl.revoked_at IS NULL
    AND gsl.expires_at > now()
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_anonymous_share_link(text) TO anon;

-- ============================================================
-- 5. Guest water RPC
-- ============================================================

CREATE OR REPLACE FUNCTION water_plant_guest(p_plant_id uuid, p_token text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_garden_id uuid;
  v_rows_updated integer;
BEGIN
  -- Resolve share link once; all six conditions checked here
  SELECT gsl.garden_id INTO v_garden_id
  FROM garden_share_links gsl
  WHERE gsl.token = p_token
    AND gsl.allow_anonymous = true
    AND gsl.revoked_at IS NULL
    AND gsl.expires_at > now()
  LIMIT 1;

  IF v_garden_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Update only if: plant belongs to the resolved garden AND is due
  UPDATE plants p
  SET last_watered_at = now()
  WHERE p.id = p_plant_id
    AND p.garden_id = v_garden_id   -- explicit defense-in-depth, not relying on RLS
    AND (
      p.last_watered_at IS NULL
      OR p.last_watered_at + (p.watering_interval_days * interval '1 day') <= now()
    );

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION water_plant_guest(uuid, text) TO anon;

-- ============================================================
-- 6. Guest feed RPC
-- ============================================================

CREATE OR REPLACE FUNCTION feed_plant_guest(p_plant_id uuid, p_token text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_garden_id uuid;
  v_rows_updated integer;
BEGIN
  -- Resolve share link once; all six conditions checked here
  SELECT gsl.garden_id INTO v_garden_id
  FROM garden_share_links gsl
  WHERE gsl.token = p_token
    AND gsl.allow_anonymous = true
    AND gsl.revoked_at IS NULL
    AND gsl.expires_at > now()
  LIMIT 1;

  IF v_garden_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Update only if: plant belongs to the resolved garden AND is due
  UPDATE plants p
  SET last_fed_at = now()
  WHERE p.id = p_plant_id
    AND p.garden_id = v_garden_id   -- explicit defense-in-depth, not relying on RLS
    AND (
      p.last_fed_at IS NULL
      OR p.last_fed_at + (p.feeding_interval_days * interval '1 day') <= now()
    );

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION feed_plant_guest(uuid, text) TO anon;
