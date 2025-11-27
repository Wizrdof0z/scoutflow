-- ============================================================================
-- ROLLBACK SCRIPT - Only run if migration fails
-- ============================================================================
-- This restores all tables from the backup schema
-- WARNING: This will OVERWRITE current data with backup data
-- ============================================================================

-- Step 1: Drop modified tables
DROP TABLE IF EXISTS player CASCADE;
DROP TABLE IF EXISTS player_ratings CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS verdicts CASCADE;
DROP TABLE IF EXISTS data_scouting CASCADE;
DROP TABLE IF EXISTS videoscouting CASCADE;
DROP TABLE IF EXISTS live_scouting CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- Step 2: Restore from backups
CREATE TABLE players AS 
SELECT * FROM migration_backup.players_backup;

CREATE TABLE player AS 
SELECT * FROM migration_backup.player_backup;

CREATE TABLE player_ratings AS 
SELECT * FROM migration_backup.player_ratings_backup;

CREATE TABLE reports AS 
SELECT * FROM migration_backup.reports_backup;

CREATE TABLE verdicts AS 
SELECT * FROM migration_backup.verdicts_backup;

-- Restore data_scouting if backup exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'migration_backup' AND table_name = 'data_scouting_backup') THEN
    EXECUTE 'CREATE TABLE data_scouting AS SELECT * FROM migration_backup.data_scouting_backup';
  END IF;
END $$;

-- Restore videoscouting if backup exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'migration_backup' AND table_name = 'videoscouting_backup') THEN
    EXECUTE 'CREATE TABLE videoscouting AS SELECT * FROM migration_backup.videoscouting_backup';
  END IF;
END $$;

-- Restore live_scouting if backup exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'migration_backup' AND table_name = 'live_scouting_backup') THEN
    EXECUTE 'CREATE TABLE live_scouting AS SELECT * FROM migration_backup.live_scouting_backup';
  END IF;
END $$;

-- Step 3: Recreate primary keys and indexes (adjust based on your actual schema)
ALTER TABLE players ADD PRIMARY KEY (player_id);
ALTER TABLE player ADD PRIMARY KEY (player_id, competition_edition_id, position);
ALTER TABLE player_ratings ADD PRIMARY KEY (player_id, season_id);
ALTER TABLE reports ADD PRIMARY KEY (report_id);
ALTER TABLE verdicts ADD PRIMARY KEY (verdict_id);

-- Step 4: Verification
SELECT 'players restored' as table_name, COUNT(*) as record_count FROM players
UNION ALL
SELECT 'player restored', COUNT(*) FROM player
UNION ALL
SELECT 'player_ratings restored', COUNT(*) FROM player_ratings
UNION ALL
SELECT 'reports restored', COUNT(*) FROM reports
UNION ALL
SELECT 'verdicts restored', COUNT(*) FROM verdicts;

SELECT NOW() as rollback_completed_at;

-- NOTE: After successful rollback, you can drop the backup schema:
-- DROP SCHEMA migration_backup CASCADE;
