-- supabase/migrations/20260506000000_add_plant_groups.sql
-- Plant groups: new table, RLS policies, and plants.group_id column

-- ============================================================
-- 1. Create plant_groups table
-- ============================================================

CREATE TABLE IF NOT EXISTS plant_groups (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id  uuid NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  name       text NOT NULL,
  position   integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (garden_id, name)
);

-- ============================================================
-- 2. Enable RLS on plant_groups
-- ============================================================

ALTER TABLE plant_groups ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Add group_id column to plants
-- ============================================================

ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES plant_groups(id) ON DELETE SET NULL;

-- ============================================================
-- 4. Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_plant_groups_garden_id
  ON plant_groups (garden_id);

CREATE INDEX IF NOT EXISTS idx_plants_group_id
  ON plants (group_id);

-- ============================================================
-- 5. RLS policies for plant_groups
-- ============================================================

-- SELECT: garden owner OR garden members OR guests with valid share link
DROP POLICY IF EXISTS "Plant groups readable by garden owner or members or guests" ON plant_groups;

CREATE POLICY "Plant groups readable by garden owner or members or guests"
ON plant_groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM gardens g
    WHERE g.id = plant_groups.garden_id
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
        AND gsl.garden_id = plant_groups.garden_id
    )
  )
);

-- INSERT: garden owner only
DROP POLICY IF EXISTS "Plant groups insertable by garden owner" ON plant_groups;

CREATE POLICY "Plant groups insertable by garden owner"
ON plant_groups FOR INSERT
WITH CHECK (
  public.is_garden_owner(garden_id)
);

-- UPDATE: garden owner only
DROP POLICY IF EXISTS "Plant groups updatable by garden owner" ON plant_groups;

CREATE POLICY "Plant groups updatable by garden owner"
ON plant_groups FOR UPDATE
USING (
  public.is_garden_owner(garden_id)
);

-- DELETE: garden owner only
DROP POLICY IF EXISTS "Plant groups deletable by garden owner" ON plant_groups;

CREATE POLICY "Plant groups deletable by garden owner"
ON plant_groups FOR DELETE
USING (
  public.is_garden_owner(garden_id)
);
