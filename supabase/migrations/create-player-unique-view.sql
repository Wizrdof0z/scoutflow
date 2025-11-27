-- Create a view that shows unique players per team/season (not per position)
-- This solves the duplicate issue and improves performance

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
    array_agg(DISTINCT position_group ORDER BY position_group) as position_groups
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

-- Create indexes on the base player table for better performance
CREATE INDEX IF NOT EXISTS idx_player_lookup ON player(player_id, season_name, team_name, competition_name);
CREATE INDEX IF NOT EXISTS idx_player_filters ON player(season_name, competition_name, team_name);

-- Verify the view
-- SELECT COUNT(*) FROM player_unique;
-- SELECT * FROM player_unique LIMIT 10;
