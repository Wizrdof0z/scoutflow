-- Add new fields from SkillCorner API v3.0.2
-- Run this migration to add the 6 new fields to the physical_p90 table

-- Add 4 new time-related metrics
ALTER TABLE physical_p90 
ADD COLUMN IF NOT EXISTS timetohsrpostcod_top3 DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS timetosprintpostcod_top3 DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS timeto505around90_top3 DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS timeto505around180_top3 DECIMAL(10, 2);

-- Add change of direction metric
ALTER TABLE physical_p90 
ADD COLUMN IF NOT EXISTS cod_count_full_all_p90 DECIMAL(10, 2);

-- Update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_physical_p90_updated_at ON physical_p90;
CREATE TRIGGER update_physical_p90_updated_at
    BEFORE UPDATE ON physical_p90
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
