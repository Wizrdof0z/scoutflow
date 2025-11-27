-- ============================================================================
-- BACKUP SCRIPT - Run this FIRST before any migration
-- ============================================================================
-- This creates backup copies of all tables that will be modified
-- Run this in Supabase SQL Editor before running the migration scripts
-- ============================================================================

-- Create backup schema to hold all backup tables
CREATE SCHEMA IF NOT EXISTS migration_backup;

-- Backup players table (will be dropped after migration)
CREATE TABLE migration_backup.players_backup AS 
SELECT * FROM players;

-- Backup player table (will be modified)
CREATE TABLE migration_backup.player_backup AS 
SELECT * FROM player;

-- Backup player_ratings table (will be modified)
CREATE TABLE migration_backup.player_ratings_backup AS 
SELECT * FROM player_ratings;

-- Backup reports table (will be modified)
CREATE TABLE migration_backup.reports_backup AS 
SELECT * FROM reports;

-- Backup verdicts table (will be modified)
CREATE TABLE migration_backup.verdicts_backup AS 
SELECT * FROM verdicts;

-- Backup data_scouting table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'data_scouting') THEN
    EXECUTE 'CREATE TABLE migration_backup.data_scouting_backup AS SELECT * FROM data_scouting';
  END IF;
END $$;

-- Backup videoscouting table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videoscouting') THEN
    EXECUTE 'CREATE TABLE migration_backup.videoscouting_backup AS SELECT * FROM videoscouting';
  END IF;
END $$;

-- Backup live_scouting table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_scouting') THEN
    EXECUTE 'CREATE TABLE migration_backup.live_scouting_backup AS SELECT * FROM live_scouting';
  END IF;
END $$;

-- Verification: Show what was backed up
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'migration_backup' AND table_name = t.table_name) as column_count,
  pg_size_pretty(pg_total_relation_size('migration_backup.' || table_name)) as table_size
FROM information_schema.tables t
WHERE table_schema = 'migration_backup'
ORDER BY table_name;

-- Show record counts
SELECT 'players_backup' as table_name, COUNT(*) as record_count FROM migration_backup.players_backup
UNION ALL
SELECT 'player_backup', COUNT(*) FROM migration_backup.player_backup
UNION ALL
SELECT 'player_ratings_backup', COUNT(*) FROM migration_backup.player_ratings_backup
UNION ALL
SELECT 'reports_backup', COUNT(*) FROM migration_backup.reports_backup
UNION ALL
SELECT 'verdicts_backup', COUNT(*) FROM migration_backup.verdicts_backup;

-- Backup timestamp
SELECT NOW() as backup_completed_at;
