-- 1. Create gardens table
CREATE TABLE gardens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  owner_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, name)
);

-- 2. Backfill: create a default garden for every existing user who has plants
INSERT INTO gardens (name, owner_id)
SELECT DISTINCT 'My Garden', user_id
FROM plants
ON CONFLICT (owner_id, name) DO NOTHING;

-- 3. Add garden_id column, initially nullable to allow backfill
ALTER TABLE plants ADD COLUMN garden_id uuid REFERENCES gardens(id);

-- 4. Assign existing plants to their owner's default garden
UPDATE plants p
SET garden_id = g.id
FROM gardens g
WHERE g.owner_id = p.user_id
  AND g.name = 'My Garden';

-- 5. Make garden_id NOT NULL after backfill
ALTER TABLE plants ALTER COLUMN garden_id SET NOT NULL;
