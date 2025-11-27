-- Deep dive comparison to find why identical-looking IDs don't match

-- Step 1: Direct comparison of a specific player
SELECT 
  'Gustav Mortensen comparison' as test,
  pl.player_id as players_id,
  p.scout_player_id as player_scout_id,
  pl.player_id = p.scout_player_id as direct_match,
  LENGTH(pl.player_id) as players_length,
  LENGTH(p.scout_player_id) as player_length,
  -- Check for hidden characters
  encode(pl.player_id::bytea, 'hex') as players_hex,
  encode(p.scout_player_id::bytea, 'hex') as player_hex
FROM players pl
CROSS JOIN player p
WHERE pl.name = 'Gustav Mortensen' 
  AND p.player_name LIKE '%Gustav%Mortensen%'
LIMIT 1;

-- Step 2: Check for leading/trailing spaces or special characters
SELECT 
  'Space/whitespace check' as test,
  player_id,
  name,
  LENGTH(player_id) as id_length,
  LENGTH(TRIM(player_id)) as trimmed_length,
  player_id = TRIM(player_id) as no_extra_spaces
FROM players
WHERE name = 'Gustav Mortensen';

SELECT 
  'Space/whitespace check' as test,
  scout_player_id,
  player_name,
  LENGTH(scout_player_id) as id_length,
  LENGTH(TRIM(scout_player_id)) as trimmed_length,
  scout_player_id = TRIM(scout_player_id) as no_extra_spaces
FROM player
WHERE player_name LIKE '%Gustav%Mortensen%';

-- Step 3: Try matching with aggressive trimming
SELECT 
  'Match with TRIM' as test,
  COUNT(*) as matched_count
FROM players pl
INNER JOIN player p ON TRIM(pl.player_id) = TRIM(p.scout_player_id);

-- Step 4: Show first 5 from each table side by side
SELECT 
  'Side by side first 5' as comparison,
  pl.player_id as old_id,
  p.scout_player_id as new_id,
  pl.player_id = p.scout_player_id as match,
  pl.name as old_name,
  p.player_name as new_name
FROM players pl
CROSS JOIN LATERAL (
  SELECT player_id, scout_player_id, player_name 
  FROM player 
  WHERE scout_player_id IS NOT NULL
  LIMIT 1
) p
LIMIT 5;

-- Step 5: Check data types
SELECT 
  'players table column type' as info,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'players' AND column_name = 'player_id';

SELECT 
  'player table column type' as info,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'player' AND column_name = 'scout_player_id';

-- Step 6: List all unique player_ids from players to manually check
SELECT DISTINCT
  player_id,
  name
FROM players
ORDER BY name
LIMIT 10;

-- Step 7: List all unique scout_player_ids from player to manually check
SELECT DISTINCT
  scout_player_id,
  player_name
FROM player
WHERE scout_player_id IS NOT NULL
ORDER BY player_name
LIMIT 10;
