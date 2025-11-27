-- Direct fix: Populate scout_player_id using simple inline generation

-- Step 1: Update scout_player_id directly with inline slug generation
UPDATE player 
SET scout_player_id = LOWER(
  TRIM(
    REGEXP_REPLACE(player_name, '\s+', '-', 'g')
  )
) || CASE 
  WHEN player_birthdate IS NOT NULL THEN '-' || player_birthdate::TEXT
  ELSE ''
END;

-- Step 2: Verify it worked
SELECT 
  'Verification after update' as check,
  COUNT(*) as total_rows,
  COUNT(scout_player_id) as rows_with_scout_id,
  COUNT(*) - COUNT(scout_player_id) as rows_still_null
FROM player;

-- Step 3: Show samples
SELECT 
  player_id,
  player_name,
  player_birthdate,
  scout_player_id,
  LENGTH(scout_player_id) as id_length
FROM player
LIMIT 20;

-- Step 4: Check matches with old players table
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
  p.scout_player_id
FROM players pl
INNER JOIN player p ON pl.player_id = p.scout_player_id
LIMIT 10;
