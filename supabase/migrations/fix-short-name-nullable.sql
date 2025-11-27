-- Remove NOT NULL constraint from short_name column in all in-possession tables

ALTER TABLE off_ball_runs_pmatch 
ALTER COLUMN short_name DROP NOT NULL;

ALTER TABLE on_ball_pressures_pmatch 
ALTER COLUMN short_name DROP NOT NULL;

ALTER TABLE passing_pmatch 
ALTER COLUMN short_name DROP NOT NULL;

-- Verify the changes
SELECT 
    table_name,
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('off_ball_runs_pmatch', 'on_ball_pressures_pmatch', 'passing_pmatch')
    AND column_name = 'short_name';
