-- Migration script to consolidate players table into player table
-- Strategy: Use scout_player_id as temporary bridge, then migrate to INTEGER player_id

-- ============================================================================
-- PHASE 1: MATCHING - Create mapping between old TEXT player_id and new INTEGER player_id
-- ============================================================================

-- Step 1: Create temporary mapping table
CREATE TEMP TABLE player_migration_map (
  old_text_player_id TEXT,      -- From players.player_id (TEXT hash)
  new_integer_player_id INTEGER, -- To player.player_id (INTEGER API ID)
  player_name TEXT,
  match_status TEXT
);

-- Step 2: Find matches using scout_player_id (TEXT hash)
INSERT INTO player_migration_map (old_text_player_id, new_integer_player_id, player_name, match_status)
SELECT 
  pl.player_id as old_text_player_id,
  p.player_id as new_integer_player_id,
  p.player_name,
  'matched' as match_status
FROM players pl
INNER JOIN player p ON p.scout_player_id = pl.player_id;

-- Step 3: Report matching results
SELECT 
  'Total players in old table' as description,
  COUNT(*) as count
FROM players;

SELECT 
  'Successfully matched' as description,
  COUNT(*) as count
FROM player_migration_map;

SELECT 
  'Unmatched (will lose data)' as description,
  COUNT(*) as count
FROM players pl
WHERE pl.player_id NOT IN (SELECT old_text_player_id FROM player_migration_map);

-- Step 4: Show unmatched players for review
SELECT 
  'UNMATCHED PLAYER' as warning,
  player_id,
  name,
  date_of_birth,
  current_team,
  current_list
FROM players
WHERE player_id NOT IN (SELECT old_text_player_id FROM player_migration_map)
ORDER BY name;

-- ============================================================================
-- PHASE 2: DATA MIGRATION - Copy scouting data from players to player table
-- ============================================================================

-- Step 5: Copy manually-entered scouting data
UPDATE player p
SET 
  nationality = pl.nationality,
  foot = pl.foot,
  market_value = pl.market_value,
  contract_end_date = pl.contract_end_date,
  current_list = COALESCE(pl.current_list, 'Backlog')
FROM players pl
INNER JOIN player_migration_map m ON m.old_text_player_id = pl.player_id
WHERE p.player_id = m.new_integer_player_id;

-- Verification
SELECT 
  'Players updated with scouting data' as description,
  COUNT(*) as count
FROM player
WHERE nationality IS NOT NULL OR foot IS NOT NULL OR current_list != 'Backlog';

-- ============================================================================
-- PHASE 3: FOREIGN KEY MIGRATION - Update related tables to use INTEGER player_id
-- ============================================================================

-- Step 6: Add new INTEGER player_id column to related tables (keep old column temporarily)
ALTER TABLE player_ratings ADD COLUMN IF NOT EXISTS new_player_id INTEGER;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS new_player_id INTEGER;
ALTER TABLE verdicts ADD COLUMN IF NOT EXISTS new_player_id INTEGER;

-- Check if data_scouting table exists and add column
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'data_scouting') THEN
    ALTER TABLE data_scouting ADD COLUMN IF NOT EXISTS new_player_id INTEGER;
  END IF;
END $$;

-- Check if videoscouting table exists and add column
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videoscouting') THEN
    ALTER TABLE videoscouting ADD COLUMN IF NOT EXISTS new_player_id INTEGER;
  END IF;
END $$;

-- Check if live_scouting table exists and add column
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_scouting') THEN
    ALTER TABLE live_scouting ADD COLUMN IF NOT EXISTS new_player_id INTEGER;
  END IF;
END $$;

-- Step 7: Populate new INTEGER player_id using mapping
UPDATE player_ratings pr
SET new_player_id = m.new_integer_player_id
FROM player_migration_map m
WHERE pr.player_id = m.old_text_player_id;

UPDATE reports r
SET new_player_id = m.new_integer_player_id
FROM player_migration_map m
WHERE r.player_id = m.old_text_player_id;

UPDATE verdicts v
SET new_player_id = m.new_integer_player_id
FROM player_migration_map m
WHERE v.player_id = m.old_text_player_id;

-- Update data_scouting if exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'data_scouting') THEN
    UPDATE data_scouting ds
    SET new_player_id = m.new_integer_player_id
    FROM player_migration_map m
    WHERE ds.player_id = m.old_text_player_id;
  END IF;
END $$;

-- Update videoscouting if exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videoscouting') THEN
    UPDATE videoscouting vs
    SET new_player_id = m.new_integer_player_id
    FROM player_migration_map m
    WHERE vs.player_id = m.old_text_player_id;
  END IF;
END $$;

-- Update live_scouting if exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_scouting') THEN
    UPDATE live_scouting ls
    SET new_player_id = m.new_integer_player_id
    FROM player_migration_map m
    WHERE ls.player_id = m.old_text_player_id;
  END IF;
END $$;

-- Step 8: Verify migration counts
SELECT 'player_ratings migrated' as table_name, COUNT(*) as migrated_count
FROM player_ratings WHERE new_player_id IS NOT NULL;

SELECT 'reports migrated' as table_name, COUNT(*) as migrated_count
FROM reports WHERE new_player_id IS NOT NULL;

SELECT 'verdicts migrated' as table_name, COUNT(*) as migrated_count
FROM verdicts WHERE new_player_id IS NOT NULL;

-- Step 9: Check for orphaned records (couldn't be mapped)
SELECT 'player_ratings orphaned' as warning, COUNT(*) as count
FROM player_ratings WHERE new_player_id IS NULL;

SELECT 'reports orphaned' as warning, COUNT(*) as count
FROM reports WHERE new_player_id IS NULL;

SELECT 'verdicts orphaned' as warning, COUNT(*) as count
FROM verdicts WHERE new_player_id IS NULL;

-- ============================================================================
-- PHASE 4: CUTOVER - Switch to new player_id column
-- ============================================================================
-- IMPORTANT: Review all verification queries above before proceeding!
-- The following steps are DESTRUCTIVE and cannot be easily reversed.
-- ============================================================================

-- Step 10: Drop old TEXT player_id column and rename new INTEGER column (COMMENTED - RUN MANUALLY AFTER VERIFICATION)
/*
-- player_ratings
ALTER TABLE player_ratings DROP COLUMN player_id;
ALTER TABLE player_ratings RENAME COLUMN new_player_id TO player_id;

-- reports
ALTER TABLE reports DROP COLUMN player_id;
ALTER TABLE reports RENAME COLUMN new_player_id TO player_id;

-- verdicts
ALTER TABLE verdicts DROP COLUMN player_id;
ALTER TABLE verdicts RENAME COLUMN new_player_id TO player_id;

-- data_scouting (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'data_scouting') THEN
    ALTER TABLE data_scouting DROP COLUMN player_id;
    ALTER TABLE data_scouting RENAME COLUMN new_player_id TO player_id;
  END IF;
END $$;

-- videoscouting (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videoscouting') THEN
    ALTER TABLE videoscouting DROP COLUMN player_id;
    ALTER TABLE videoscouting RENAME COLUMN new_player_id TO player_id;
  END IF;
END $$;

-- live_scouting (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_scouting') THEN
    ALTER TABLE live_scouting DROP COLUMN player_id;
    ALTER TABLE live_scouting RENAME COLUMN new_player_id TO player_id;
  END IF;
END $$;
*/

-- Step 11: Add foreign key constraints (COMMENTED - RUN MANUALLY AFTER CUTOVER)
/*
ALTER TABLE player_ratings 
ADD CONSTRAINT fk_player_ratings_player 
  FOREIGN KEY (player_id) 
  REFERENCES player(player_id) 
  ON DELETE CASCADE;

ALTER TABLE reports 
ADD CONSTRAINT fk_reports_player 
  FOREIGN KEY (player_id) 
  REFERENCES player(player_id) 
  ON DELETE CASCADE;

ALTER TABLE verdicts 
ADD CONSTRAINT fk_verdicts_player 
  FOREIGN KEY (player_id) 
  REFERENCES player(player_id) 
  ON DELETE CASCADE;
*/

-- Step 12: Drop scout_player_id from player table (no longer needed) (COMMENTED - RUN MANUALLY AFTER CUTOVER)
/*
DROP INDEX IF EXISTS idx_player_scout_player_id;
ALTER TABLE player DROP COLUMN scout_player_id;
*/

-- Step 13: Archive old players table (COMMENTED - RUN MANUALLY AFTER FULL VERIFICATION)
/*
-- Option A: Rename for backup
ALTER TABLE players RENAME TO players_archived_backup;

-- Option B: Drop completely (DANGEROUS - ensure you have external backup!)
-- DROP TABLE players;
*/

-- ============================================================================
-- FINAL VERIFICATION QUERY
-- ============================================================================
SELECT 
  p.player_id,
  p.player_name,
  p.team_name,
  p.season_name,
  p.current_list,
  p.nationality,
  p.foot,
  COUNT(DISTINCT pr.season_id) as seasons_with_ratings,
  COUNT(DISTINCT r.report_id) as report_count,
  COUNT(DISTINCT v.verdict_id) as verdict_count
FROM player p
LEFT JOIN player_ratings pr ON pr.new_player_id = p.player_id
LEFT JOIN reports r ON r.new_player_id = p.player_id
LEFT JOIN verdicts v ON v.new_player_id = p.player_id
WHERE p.current_list != 'Backlog'
GROUP BY p.player_id, p.player_name, p.team_name, p.season_name, p.current_list, p.nationality, p.foot
ORDER BY p.player_name
LIMIT 20;
