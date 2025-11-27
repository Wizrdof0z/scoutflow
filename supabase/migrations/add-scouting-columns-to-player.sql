-- Add scouting workflow columns to player table
-- These columns enable the player table to replace the players table

-- Add scout_player_id - generated hash from name+birthdate (matching old players table logic)
ALTER TABLE player ADD COLUMN IF NOT EXISTS scout_player_id TEXT;

-- Add new scouting workflow columns
ALTER TABLE player ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE player ADD COLUMN IF NOT EXISTS foot TEXT CHECK (foot IN ('Left', 'Right', 'Both'));
ALTER TABLE player ADD COLUMN IF NOT EXISTS market_value DECIMAL(12, 2);
ALTER TABLE player ADD COLUMN IF NOT EXISTS contract_end_date DATE;
ALTER TABLE player ADD COLUMN IF NOT EXISTS current_list TEXT DEFAULT 'Backlog' CHECK (
  current_list IN (
    'Backlog',
    'Prospects', 
    'Datascouting list', 
    'Videoscouting list', 
    'Live scouting list', 
    'Potential list', 
    'Not interesting list'
  )
);

-- Add metadata columns for tracking changes
ALTER TABLE player ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE player ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to generate scout_player_id from name + birthdate (matching old logic)
CREATE OR REPLACE FUNCTION generate_scout_player_id(p_name TEXT, p_birthdate DATE)
RETURNS TEXT AS $$
BEGIN
  -- Generate hash similar to old players table logic (name+DOB)
  -- Using MD5 hash of concatenated name and birthdate
  RETURN MD5(LOWER(TRIM(p_name)) || COALESCE(p_birthdate::TEXT, ''));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Populate scout_player_id for all existing players
UPDATE player 
SET scout_player_id = generate_scout_player_id(player_name, player_birthdate)
WHERE scout_player_id IS NULL;

-- Create unique index on scout_player_id for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_scout_player_id ON player(scout_player_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_player_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_player_timestamp ON player;
CREATE TRIGGER trigger_update_player_timestamp
  BEFORE UPDATE ON player
  FOR EACH ROW
  EXECUTE FUNCTION update_player_updated_at();

-- Create trigger to auto-generate scout_player_id on insert
CREATE OR REPLACE FUNCTION auto_generate_scout_player_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scout_player_id IS NULL THEN
    NEW.scout_player_id = generate_scout_player_id(NEW.player_name, NEW.player_birthdate);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_scout_player_id ON player;
CREATE TRIGGER trigger_auto_scout_player_id
  BEFORE INSERT OR UPDATE ON player
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_scout_player_id();

-- Update existing records to set created_at/updated_at to now (for existing API data)
UPDATE player 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at IS NULL;

-- Verification
-- SELECT player_id, player_name, scout_player_id, team_name, season_name, current_list
-- FROM player 
-- ORDER BY player_name 
-- LIMIT 10;
