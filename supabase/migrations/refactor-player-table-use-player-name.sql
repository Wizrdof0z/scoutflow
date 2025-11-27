-- Refactor player table to use player_name instead of first_name/last_name
-- This aligns with the statistical tables structure

-- Step 1: Drop existing data (will be repopulated from physical_p90)
DELETE FROM player;

-- Step 2: Drop indexes that reference first_name/last_name
DROP INDEX IF EXISTS idx_player_name;
DROP INDEX IF EXISTS idx_player_composite;

-- Step 3: Remove first_name and last_name columns
ALTER TABLE player DROP COLUMN IF EXISTS first_name;
ALTER TABLE player DROP COLUMN IF EXISTS last_name;

-- Step 4: Add player_name column (to match statistical tables)
ALTER TABLE player ADD COLUMN IF NOT EXISTS player_name TEXT NOT NULL DEFAULT '';

-- Step 5: Rename short_name columns to match (player already has short_name)
-- Rename birthday to player_birthdate to match statistical tables
ALTER TABLE player RENAME COLUMN birthday TO player_birthdate;

-- Step 6: Add season_id to match physical_p90 structure
ALTER TABLE player ADD COLUMN IF NOT EXISTS season_id INTEGER NOT NULL DEFAULT 0;

-- Step 7: Add position columns (since player can play multiple positions)
ALTER TABLE player ADD COLUMN IF NOT EXISTS position VARCHAR(10);
ALTER TABLE player ADD COLUMN IF NOT EXISTS position_group TEXT;

-- Step 8: Update primary key to match physical_p90 composite key
-- This allows a player to have records per position
ALTER TABLE player DROP CONSTRAINT IF EXISTS player_pkey;
ALTER TABLE player ADD PRIMARY KEY (player_id, competition_edition_id, position);

-- Step 9: Create new indexes
CREATE INDEX IF NOT EXISTS idx_player_name ON player(player_name);
CREATE INDEX IF NOT EXISTS idx_player_short_name ON player(short_name);
CREATE INDEX IF NOT EXISTS idx_player_season ON player(season_name);
CREATE INDEX IF NOT EXISTS idx_player_competition ON player(competition_name);
CREATE INDEX IF NOT EXISTS idx_player_team ON player(team_name);

-- Step 10: Create function to populate player table from physical_p90
CREATE OR REPLACE FUNCTION populate_player_from_physical_p90()
RETURNS void AS $$
BEGIN
  -- Insert unique player records from physical_p90
  INSERT INTO player (
    player_id,
    team_id,
    team_name,
    competition_edition_id,
    competition_name,
    season_id,
    season_name,
    player_name,
    short_name,
    player_birthdate,
    position,
    position_group
  )
  SELECT DISTINCT
    player_id,
    team_id,
    team_name,
    competition_edition_id,
    competition_name,
    season_id,
    season_name,
    player_name,
    player_short_name as short_name,
    player_birthdate,
    position,
    position_group
  FROM physical_p90
  ON CONFLICT (player_id, competition_edition_id, position) 
  DO UPDATE SET
    player_name = EXCLUDED.player_name,
    short_name = EXCLUDED.short_name,
    player_birthdate = EXCLUDED.player_birthdate,
    team_name = EXCLUDED.team_name,
    season_name = EXCLUDED.season_name,
    position_group = EXCLUDED.position_group;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Populate the player table from physical_p90
SELECT populate_player_from_physical_p90();

-- Step 12: Create trigger to auto-update player table when physical_p90 is updated
CREATE OR REPLACE FUNCTION sync_player_from_physical_p90()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO player (
    player_id,
    team_id,
    team_name,
    competition_edition_id,
    competition_name,
    season_id,
    season_name,
    player_name,
    short_name,
    player_birthdate,
    position,
    position_group
  )
  VALUES (
    NEW.player_id,
    NEW.team_id,
    NEW.team_name,
    NEW.competition_edition_id,
    NEW.competition_name,
    NEW.season_id,
    NEW.season_name,
    NEW.player_name,
    NEW.player_short_name,
    NEW.player_birthdate,
    NEW.position,
    NEW.position_group
  )
  ON CONFLICT (player_id, competition_edition_id, position) 
  DO UPDATE SET
    player_name = EXCLUDED.player_name,
    short_name = EXCLUDED.short_name,
    player_birthdate = EXCLUDED.player_birthdate,
    team_name = EXCLUDED.team_name,
    season_name = EXCLUDED.season_name,
    position_group = EXCLUDED.position_group;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_player_from_physical_p90 ON physical_p90;

-- Create trigger
CREATE TRIGGER trigger_sync_player_from_physical_p90
  AFTER INSERT OR UPDATE ON physical_p90
  FOR EACH ROW
  EXECUTE FUNCTION sync_player_from_physical_p90();

-- Verification query (comment out after running)
-- SELECT COUNT(*) as player_count FROM player;
-- SELECT COUNT(DISTINCT player_id) as unique_players FROM player;
