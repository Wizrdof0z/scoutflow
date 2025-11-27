-- Fix: Manually populate scout_player_id since triggers didn't work

-- Step 1: Check if function exists
SELECT 
  'Function exists' as check_type,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'generate_scout_player_id';

-- Step 2: Manually generate and update scout_player_id for all players
-- This ensures the hash is created properly
UPDATE player 
SET scout_player_id = MD5(LOWER(TRIM(player_name)) || COALESCE(player_birthdate::TEXT, ''))
WHERE scout_player_id IS NULL;

-- Step 3: Verify scout_player_id was populated
SELECT 
  'scout_player_id populated' as status,
  COUNT(*) as total_players,
  COUNT(scout_player_id) as players_with_scout_id,
  COUNT(*) - COUNT(scout_player_id) as players_missing_scout_id
FROM player;

-- Step 4: Show sample scout_player_ids
SELECT 
  player_id,
  player_name,
  player_birthdate,
  scout_player_id,
  LENGTH(scout_player_id) as id_length
FROM player
WHERE scout_player_id IS NOT NULL
LIMIT 10;

-- Step 5: Now check if we can match with players table
SELECT 
  'Matching test after populating scout_player_id' as test,
  COUNT(*) as matched_count
FROM players pl
INNER JOIN player p ON pl.player_id = p.scout_player_id;

-- Step 6: Show sample matches
SELECT 
  pl.player_id as old_text_id,
  p.player_id as new_integer_id,
  pl.name as old_name,
  p.player_name as new_name,
  pl.date_of_birth as old_dob,
  p.player_birthdate as new_dob
FROM players pl
INNER JOIN player p ON pl.player_id = p.scout_player_id
LIMIT 10;

-- Step 7: Check for unmatched players in old table
SELECT 
  'Unmatched players in old table' as status,
  player_id,
  name,
  date_of_birth,
  current_team
FROM players
WHERE player_id NOT IN (SELECT scout_player_id FROM player WHERE scout_player_id IS NOT NULL)
ORDER BY name
LIMIT 20;
