-- Delete all existing players (you'll re-fetch with correct player_id from API)
DELETE FROM player;

-- Drop the old primary key first
ALTER TABLE player DROP CONSTRAINT IF EXISTS player_pkey;

-- Allow birthday to be nullable
ALTER TABLE player ALTER COLUMN birthday DROP NOT NULL;

-- Add player_id column
ALTER TABLE player ADD COLUMN IF NOT EXISTS player_id INTEGER NOT NULL;

-- Create new primary key using player_id
ALTER TABLE player ADD PRIMARY KEY (player_id);

-- Add index for the composite lookup that was previously the primary key
CREATE INDEX IF NOT EXISTS idx_player_composite ON player(team_id, competition_edition_id, first_name, last_name, birthday);
