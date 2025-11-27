-- Add matches column to player table and update the sync logic

-- Step 1: Add matches column to player table
ALTER TABLE player ADD COLUMN IF NOT EXISTS matches INTEGER DEFAULT 0;

-- Step 2: Update the populate function to sum matches across all positions
CREATE OR REPLACE FUNCTION populate_player_from_physical_p90()
RETURNS void AS $$
BEGIN
  -- Delete existing data to repopulate fresh
  DELETE FROM player;
  
  -- Insert unique player records from physical_p90, summing matches across positions
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
    position_group,
    matches
  )
  SELECT 
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
    -- Take the position with most matches as the primary position
    (SELECT p.position 
     FROM physical_p90 p 
     WHERE p.player_id = physical_p90.player_id 
       AND p.competition_edition_id = physical_p90.competition_edition_id
       AND p.season_name = physical_p90.season_name
       AND p.team_name = physical_p90.team_name
     ORDER BY p.count_match DESC 
     LIMIT 1) as position,
    position_group,
    -- Sum all matches across all positions
    (SELECT SUM(p.count_match) 
     FROM physical_p90 p 
     WHERE p.player_id = physical_p90.player_id 
       AND p.competition_edition_id = physical_p90.competition_edition_id
       AND p.season_name = physical_p90.season_name
       AND p.team_name = physical_p90.team_name) as matches
  FROM physical_p90
  GROUP BY 
    player_id,
    team_id,
    team_name,
    competition_edition_id,
    competition_name,
    season_id,
    season_name,
    player_name,
    player_short_name,
    player_birthdate,
    position_group
  ON CONFLICT (player_id, competition_edition_id, position) 
  DO UPDATE SET
    player_name = EXCLUDED.player_name,
    short_name = EXCLUDED.short_name,
    player_birthdate = EXCLUDED.player_birthdate,
    team_name = EXCLUDED.team_name,
    season_name = EXCLUDED.season_name,
    position_group = EXCLUDED.position_group,
    matches = EXCLUDED.matches;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Repopulate the player table
SELECT populate_player_from_physical_p90();

-- Step 4: Update the trigger function to handle matches column
CREATE OR REPLACE FUNCTION sync_player_from_physical_p90()
RETURNS TRIGGER AS $$
DECLARE
  total_matches INTEGER;
  primary_pos VARCHAR(10);
BEGIN
  -- Calculate total matches for this player across all positions
  SELECT SUM(count_match) INTO total_matches
  FROM physical_p90
  WHERE player_id = NEW.player_id
    AND competition_edition_id = NEW.competition_edition_id
    AND season_name = NEW.season_name
    AND team_name = NEW.team_name;
  
  -- Get the position with most matches
  SELECT position INTO primary_pos
  FROM physical_p90
  WHERE player_id = NEW.player_id
    AND competition_edition_id = NEW.competition_edition_id
    AND season_name = NEW.season_name
    AND team_name = NEW.team_name
  ORDER BY count_match DESC
  LIMIT 1;
  
  -- Insert or update player record
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
    position_group,
    matches
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
    primary_pos,
    NEW.position_group,
    total_matches
  )
  ON CONFLICT (player_id, competition_edition_id, position) 
  DO UPDATE SET
    player_name = EXCLUDED.player_name,
    short_name = EXCLUDED.short_name,
    player_birthdate = EXCLUDED.player_birthdate,
    team_name = EXCLUDED.team_name,
    season_name = EXCLUDED.season_name,
    position_group = EXCLUDED.position_group,
    matches = EXCLUDED.matches;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verification
-- SELECT player_name, position, matches, season_name FROM player ORDER BY matches DESC LIMIT 10;
