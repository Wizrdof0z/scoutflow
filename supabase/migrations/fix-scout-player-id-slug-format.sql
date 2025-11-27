-- Fix: Generate scout_player_id using the correct slug format (not MD5 hash)

-- Step 1: Create function to generate slug-style player_id (matching old format)
CREATE OR REPLACE FUNCTION generate_scout_player_id_slug(p_name TEXT, p_birthdate DATE)
RETURNS TEXT AS $$
BEGIN
  -- Generate slug: lowercase name with spaces->dashes + birthdate
  -- Example: "Adam Sorensen" + "2000-11-10" = "adam-sorensen-2000-11-10"
  RETURN LOWER(TRIM(REGEXP_REPLACE(p_name, '\s+', '-', 'g'))) || 
         CASE 
           WHEN p_birthdate IS NOT NULL THEN '-' || p_birthdate::TEXT
           ELSE ''
         END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 2: Update all players with correct slug-format scout_player_id
UPDATE player 
SET scout_player_id = generate_scout_player_id_slug(player_name, player_birthdate);

-- Step 3: Verify scout_player_id was populated correctly
SELECT 
  'scout_player_id with slug format' as status,
  COUNT(*) as total_players,
  COUNT(scout_player_id) as players_with_scout_id
FROM player;

-- Step 4: Show sample scout_player_ids (should match old format now)
SELECT 
  player_id,
  player_name,
  player_birthdate,
  scout_player_id
FROM player
ORDER BY player_name
LIMIT 10;

-- Step 5: Now check if we can match with players table
SELECT 
  'Matching test after slug generation' as test,
  COUNT(*) as matched_count
FROM players pl
INNER JOIN player p ON pl.player_id = p.scout_player_id;

-- Step 6: Show sample matches
SELECT 
  pl.player_id as old_slug_id,
  p.player_id as new_integer_id,
  pl.name as old_name,
  p.player_name as new_name,
  pl.date_of_birth as old_dob,
  p.player_birthdate as new_dob,
  p.scout_player_id as generated_slug
FROM players pl
INNER JOIN player p ON pl.player_id = p.scout_player_id
ORDER BY pl.name
LIMIT 10;

-- Step 7: Check for still unmatched players
SELECT 
  'Still unmatched in old table' as status,
  COUNT(*) as count
FROM players pl
WHERE pl.player_id NOT IN (SELECT scout_player_id FROM player WHERE scout_player_id IS NOT NULL);

-- Step 8: Show a few unmatched to understand why
SELECT 
  pl.player_id as old_id,
  pl.name,
  pl.date_of_birth,
  -- Try to find close matches by name
  (SELECT p.scout_player_id 
   FROM player p 
   WHERE LOWER(TRIM(p.player_name)) = LOWER(TRIM(pl.name))
   AND p.player_birthdate = pl.date_of_birth
   LIMIT 1) as potential_match
FROM players pl
WHERE pl.player_id NOT IN (SELECT scout_player_id FROM player WHERE scout_player_id IS NOT NULL)
ORDER BY pl.name
LIMIT 10;
