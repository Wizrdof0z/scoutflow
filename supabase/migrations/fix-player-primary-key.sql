-- Drop existing primary key constraint and recreate with composite key
-- to allow same player to play for multiple teams

-- Drop the existing primary key
ALTER TABLE player DROP CONSTRAINT IF EXISTS player_pkey;

-- Add composite primary key (player_id + team_id + competition_edition_id)
-- This allows the same player to exist for different teams/competitions
ALTER TABLE player ADD PRIMARY KEY (player_id, team_id, competition_edition_id);

-- Remove the old composite index since we now have it in the PK
DROP INDEX IF EXISTS idx_player_composite;

-- Add a non-unique index on player_id for queries that filter by player
CREATE INDEX IF NOT EXISTS idx_player_id ON player(player_id);
