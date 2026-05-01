-- Add plant_type column and remove emoji column
ALTER TABLE plants ADD COLUMN plant_type text NOT NULL DEFAULT 'other';

ALTER TABLE plants DROP COLUMN emoji;
