-- Update player_unique view to include the matches column
-- Run this AFTER running add-matches-column-to-player.sql

-- Drop the existing view
DROP VIEW IF EXISTS player_unique;

-- Recreate with matches column included
CREATE OR REPLACE VIEW player_unique AS
WITH aggregated_positions AS (
  SELECT 
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
    array_agg(DISTINCT position ORDER BY position) as positions,
    array_agg(DISTINCT position_group ORDER BY position_group) as position_groups,
    -- Sum up matches across all positions for this player-team-season
    SUM(matches) as matches
  FROM player
  WHERE position IS NOT NULL
  GROUP BY 
    player_id, 
    team_id, 
    team_name, 
    competition_edition_id, 
    competition_name,
    season_id,
    season_name,
    player_name,
    short_name,
    player_birthdate
)
SELECT * FROM aggregated_positions;

-- Recreate indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_unique_lookup 
ON player_unique(player_id, competition_edition_id, season_name);

CREATE INDEX IF NOT EXISTS idx_player_unique_filters 
ON player_unique(season_name, competition_name, team_name);

COMMENT ON VIEW player_unique IS 'Deduplicated player view with one row per player-team-season. Includes matches column that sums matches across all positions.';
