-- Fix nullable fields in physical_p90 table
-- Some fields should allow NULL values since the API doesn't always return them

-- Make player_birthdate nullable
ALTER TABLE physical_p90 
ALTER COLUMN player_birthdate DROP NOT NULL;

-- Make competition_name nullable (in case API doesn't return it)
-- Actually we're now getting it from the pair, but just in case
ALTER TABLE physical_p90 
ALTER COLUMN competition_name DROP NOT NULL;

-- Verify changes
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'physical_p90' 
AND column_name IN ('player_birthdate', 'competition_name')
ORDER BY column_name;
