-- Fix: Generate scout_player_id with date format WITHOUT dashes (matching players table)

-- Step 1: Update scout_player_id with correct format (no dashes in date)
UPDATE player 
SET scout_player_id = LOWER(
  TRIM(
    REGEXP_REPLACE(player_name, '\s+', '-', 'g')
  )
) || CASE 
  WHEN player_birthdate IS NOT NULL THEN '-' || REPLACE(player_birthdate::TEXT, '-', '')
  ELSE ''
END;

-- Step 2: Verify it worked
SELECT 
  'Verification after update' as check,
  COUNT(*) as total_rows,
  COUNT(scout_player_id) as rows_with_scout_id
FROM player;

-- Step 3: Show samples (should now match players table format)
SELECT 
  player_id,
  player_name,
  player_birthdate,
  scout_player_id,
  'Expected format: name-with-dashes-YYYYMMDD' as note
FROM player
LIMIT 10;

-- Step 4: Check matches with old players table (should work now!)
SELECT 
  'Match check' as test,
  COUNT(*) as matched_players
FROM players pl
INNER JOIN player p ON pl.player_id = p.scout_player_id;

-- Step 5: Show matched players
SELECT 
  pl.player_id as old_id,
  p.player_id as new_id,
  pl.name as old_name,
  p.player_name as new_name,
  p.scout_player_id as generated_id
FROM players pl
INNER JOIN player p ON pl.player_id = p.scout_player_id
ORDER BY pl.name
LIMIT 10;

-- Step 6: Check for unmatched
SELECT 
  'Unmatched players' as status,
  COUNT(*) as count
FROM players pl
WHERE pl.player_id NOT IN (SELECT scout_player_id FROM player WHERE scout_player_id IS NOT NULL);
