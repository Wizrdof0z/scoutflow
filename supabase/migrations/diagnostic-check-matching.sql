-- Diagnostic script to understand the player_id format and fix matching

-- Step 1: Check what player_id format looks like in players table
SELECT 
  'Sample player_id from players table' as description,
  player_id,
  name,
  date_of_birth,
  LENGTH(player_id) as id_length
FROM players
LIMIT 5;

-- Step 2: Check what scout_player_id looks like in player table
SELECT 
  'Sample scout_player_id from player table' as description,
  scout_player_id,
  player_name,
  player_birthdate,
  LENGTH(scout_player_id) as id_length
FROM player
WHERE scout_player_id IS NOT NULL
LIMIT 5;

-- Step 3: Try to manually generate a matching ID for one player
-- Let's see if we can match a specific player
WITH sample_from_players AS (
  SELECT 
    player_id as old_id,
    name,
    date_of_birth
  FROM players
  LIMIT 1
),
sample_from_player AS (
  SELECT 
    player_id as new_id,
    scout_player_id,
    player_name,
    player_birthdate
  FROM player
  LIMIT 1
)
SELECT 
  'Comparison' as test,
  p1.old_id,
  p1.name,
  p1.date_of_birth,
  p2.scout_player_id,
  p2.player_name,
  p2.player_birthdate,
  -- Try different hash methods
  MD5(LOWER(TRIM(p1.name)) || COALESCE(p1.date_of_birth::TEXT, '')) as md5_hash,
  MD5(p1.name || p1.date_of_birth::TEXT) as md5_hash_no_lower,
  encode(digest(LOWER(TRIM(p1.name)) || COALESCE(p1.date_of_birth::TEXT, ''), 'sha256'), 'hex') as sha256_hash
FROM sample_from_players p1, sample_from_player p2;

-- Step 4: Check if there's any overlap in names between tables
SELECT 
  'Name overlap check' as test,
  COUNT(*) as matching_names
FROM players pl
INNER JOIN player p ON LOWER(TRIM(pl.name)) = LOWER(TRIM(p.player_name));

-- Step 5: Show side-by-side comparison of a few players
SELECT 
  'Players table' as source,
  player_id,
  name,
  date_of_birth,
  current_team
FROM players
ORDER BY name
LIMIT 10;

SELECT 
  'Player table' as source,
  player_id,
  scout_player_id,
  player_name,
  player_birthdate,
  team_name
FROM player
ORDER BY player_name
LIMIT 10;
