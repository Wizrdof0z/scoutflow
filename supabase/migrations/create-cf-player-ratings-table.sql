-- ============================================================================
-- CREATE CENTER FORWARD PLAYER RATINGS TABLE
-- ============================================================================
-- This table stores pre-computed percentile-based category ratings for CF players
-- Categories: Speed, Agility, Stamina, Attacking Movement, Danger in the Box

-- Drop existing table if exists
DROP TABLE IF EXISTS cf_player_ratings CASCADE;

-- Create the table
CREATE TABLE cf_player_ratings (
  -- Player identification
  player_id INTEGER NOT NULL,
  player_name TEXT,
  short_name TEXT,
  player_birthdate DATE,
  
  -- Context
  competition_edition_id INTEGER NOT NULL,
  competition_name TEXT,
  season_name TEXT,
  team_id INTEGER NOT NULL,
  team_name TEXT,
  season_id INTEGER,
  
  -- Position info
  position TEXT,
  position_group TEXT,
  
  -- Match count
  count_match INTEGER,
  
  -- ========== CATEGORY RATINGS (0-100, 2 decimals) ==========
  speed NUMERIC(5,2),
  agility NUMERIC(5,2),
  stamina NUMERIC(5,2),
  attacking_movement NUMERIC(5,2),
  danger_in_the_box NUMERIC(5,2),
  
  -- Composite primary key
  PRIMARY KEY (player_id, competition_edition_id, team_id)
);

-- Calculate percentiles and insert data
INSERT INTO cf_player_ratings
WITH base_data AS (
  -- Get all CF players with their metrics from source tables
  SELECT DISTINCT ON (phys.player_id, phys.competition_edition_id, phys.team_id)
    phys.player_id,
    pl.player_name,
    pl.short_name,
    phys.player_birthdate,
    phys.competition_edition_id,
    ce.competition_name,
    ce.season_name,
    phys.team_id,
    t.team_name,
    phys.season_id,
    
    -- Position normalization
    CASE 
      WHEN phys.position IN ('RF', 'LF', 'CF') THEN 'CF'
      ELSE phys.position
    END as position,
    
    -- Position group
    CASE 
      WHEN phys.position IN ('RF', 'LF', 'CF') THEN 'Forward'
      ELSE 'Other'
    END as position_group,
    
    phys.count_match,
    
    -- Speed metrics
    phys.timetohsr_top3,
    phys.timetosprint_top3,
    phys.psv99,
    phys.explacceltohsr_count_full_all_p90,
    phys.explacceltosprint_count_full_all_p90,
    
    -- Agility metrics (lower is better - we'll invert these)
    phys.timetohsrpostcod_top3,
    phys.timetosprintpostcod_top3,
    phys.timeto505around90_top3,
    phys.timeto505around180_top3,
    
    -- Stamina metrics
    phys.total_distance_full_all_p90,
    phys.sprint_distance_full_all_p90,
    phys.sprint_count_full_all_p90,
    phys.running_distance_full_all_p90,
    phys.hsr_distance_full_all_p90,
    phys.total_metersperminute_full_all_p90,
    
    -- Attacking Movement metrics
    runs.count_runs_in_behind_per_match,
    runs.count_dangerous_runs_in_behind_per_match,
    runs.count_runs_ahead_of_the_ball_per_match,
    runs.count_dangerous_runs_ahead_of_the_ball_per_match,
    runs.count_cross_receiver_runs_per_match,
    runs.count_dangerous_cross_receiver_runs_per_match,
    
    -- Danger in the Box metrics
    runs.count_runs_in_behind_leading_to_shot_per_match,
    runs.count_runs_in_behind_leading_to_goal_per_match,
    runs.count_cross_receiver_runs_leading_to_shot_per_match,
    runs.count_cross_receiver_runs_leading_to_goal_per_match
    
  FROM physical_p90 phys
  LEFT JOIN off_ball_runs_pmatch runs ON 
    phys.player_id = runs.player_id 
    AND phys.team_id = runs.team_id 
    AND phys.competition_edition_id = runs.competition_edition_id
    AND phys.position = runs.position
  LEFT JOIN player pl ON phys.player_id = pl.player_id
  LEFT JOIN teams t ON phys.team_id = t.team_id
  LEFT JOIN competition_editions ce ON phys.competition_edition_id = ce.competition_edition_id
  
  WHERE phys.position IN ('RF', 'LF', 'CF')
  ORDER BY phys.player_id, phys.competition_edition_id, phys.team_id
),
percentiles AS (
  -- Calculate percentiles for each metric within competition
  SELECT 
    *,
    
    -- Speed percentiles (lower time is better for timetohsr/timetosprint - use DESC)
    CASE WHEN timetohsr_top3 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY timetohsr_top3 DESC) * 100 END as pct_timetohsr,
    CASE WHEN timetosprint_top3 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY timetosprint_top3 DESC) * 100 END as pct_timetosprint,
    CASE WHEN psv99 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY psv99) * 100 END as pct_psv99,
    CASE WHEN explacceltohsr_count_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY explacceltohsr_count_full_all_p90) * 100 END as pct_explacceltohsr,
    CASE WHEN explacceltosprint_count_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY explacceltosprint_count_full_all_p90) * 100 END as pct_explacceltosprint,
    
    -- Agility percentiles (lower is better - invert by using DESC)
    CASE WHEN timetohsrpostcod_top3 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY timetohsrpostcod_top3 DESC) * 100 END as pct_timetohsrpostcod,
    CASE WHEN timetosprintpostcod_top3 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY timetosprintpostcod_top3 DESC) * 100 END as pct_timetosprintpostcod,
    CASE WHEN timeto505around90_top3 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY timeto505around90_top3 DESC) * 100 END as pct_timeto505_90,
    CASE WHEN timeto505around180_top3 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY timeto505around180_top3 DESC) * 100 END as pct_timeto505_180,
    
    -- Stamina percentiles (higher is better)
    CASE WHEN total_distance_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY total_distance_full_all_p90) * 100 END as pct_total_distance,
    CASE WHEN sprint_distance_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY sprint_distance_full_all_p90) * 100 END as pct_sprint_distance,
    CASE WHEN sprint_count_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY sprint_count_full_all_p90) * 100 END as pct_sprint_count,
    CASE WHEN running_distance_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY running_distance_full_all_p90) * 100 END as pct_running_distance,
    CASE WHEN hsr_distance_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY hsr_distance_full_all_p90) * 100 END as pct_hsr_distance,
    CASE WHEN total_metersperminute_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY total_metersperminute_full_all_p90) * 100 END as pct_metersperminute,
    
    -- Attacking Movement percentiles (higher is better)
    CASE WHEN count_runs_in_behind_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_runs_in_behind_per_match) * 100 END as pct_runs_in_behind,
    CASE WHEN count_dangerous_runs_in_behind_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_dangerous_runs_in_behind_per_match) * 100 END as pct_dangerous_runs_behind,
    CASE WHEN count_runs_ahead_of_the_ball_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_runs_ahead_of_the_ball_per_match) * 100 END as pct_runs_ahead,
    CASE WHEN count_dangerous_runs_ahead_of_the_ball_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_dangerous_runs_ahead_of_the_ball_per_match) * 100 END as pct_dangerous_runs_ahead,
    CASE WHEN count_cross_receiver_runs_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_cross_receiver_runs_per_match) * 100 END as pct_cross_receiver,
    CASE WHEN count_dangerous_cross_receiver_runs_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_dangerous_cross_receiver_runs_per_match) * 100 END as pct_dangerous_cross,
    
    -- Danger in the Box percentiles (higher is better)
    CASE WHEN count_runs_in_behind_leading_to_shot_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_runs_in_behind_leading_to_shot_per_match) * 100 END as pct_runs_to_shot,
    CASE WHEN count_runs_in_behind_leading_to_goal_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_runs_in_behind_leading_to_goal_per_match) * 100 END as pct_runs_to_goal,
    CASE WHEN count_cross_receiver_runs_leading_to_shot_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_cross_receiver_runs_leading_to_shot_per_match) * 100 END as pct_cross_to_shot,
    CASE WHEN count_cross_receiver_runs_leading_to_goal_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_cross_receiver_runs_leading_to_goal_per_match) * 100 END as pct_cross_to_goal
    
  FROM base_data
)
SELECT
  player_id,
  player_name,
  short_name,
  player_birthdate,
  competition_edition_id,
  competition_name,
  season_name,
  team_id,
  team_name,
  season_id,
  position,
  position_group,
  count_match,
  
  -- Speed: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_timetohsr, 0) + COALESCE(pct_timetosprint, 0) + COALESCE(pct_psv99, 0) + COALESCE(pct_explacceltohsr, 0) + COALESCE(pct_explacceltosprint, 0)) / 
    NULLIF((CASE WHEN pct_timetohsr IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_timetosprint IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_psv99 IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_explacceltohsr IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_explacceltosprint IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as speed,
  
  -- Agility: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_timetohsrpostcod, 0) + COALESCE(pct_timetosprintpostcod, 0) + COALESCE(pct_timeto505_90, 0) + COALESCE(pct_timeto505_180, 0)) / 
    NULLIF((CASE WHEN pct_timetohsrpostcod IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_timetosprintpostcod IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_timeto505_90 IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_timeto505_180 IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as agility,
  
  -- Stamina: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_total_distance, 0) + COALESCE(pct_sprint_distance, 0) + COALESCE(pct_sprint_count, 0) + COALESCE(pct_running_distance, 0) + COALESCE(pct_hsr_distance, 0) + COALESCE(pct_metersperminute, 0)) / 
    NULLIF((CASE WHEN pct_total_distance IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_sprint_distance IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_sprint_count IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_running_distance IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_hsr_distance IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_metersperminute IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as stamina,
  
  -- Attacking Movement: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_runs_in_behind, 0) + COALESCE(pct_dangerous_runs_behind, 0) + COALESCE(pct_runs_ahead, 0) + COALESCE(pct_dangerous_runs_ahead, 0) + COALESCE(pct_cross_receiver, 0) + COALESCE(pct_dangerous_cross, 0)) / 
    NULLIF((CASE WHEN pct_runs_in_behind IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_dangerous_runs_behind IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_runs_ahead IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_dangerous_runs_ahead IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_cross_receiver IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_dangerous_cross IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as attacking_movement,
  
  -- Danger in the Box: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_runs_to_shot, 0) + COALESCE(pct_runs_to_goal, 0) + COALESCE(pct_cross_to_shot, 0) + COALESCE(pct_cross_to_goal, 0)) / 
    NULLIF((CASE WHEN pct_runs_to_shot IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_runs_to_goal IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_cross_to_shot IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_cross_to_goal IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as danger_in_the_box

FROM percentiles;

-- Create indexes for fast lookups
CREATE INDEX idx_cf_player_ratings_player_name ON cf_player_ratings(player_name);
CREATE INDEX idx_cf_player_ratings_team_name ON cf_player_ratings(team_name);
CREATE INDEX idx_cf_player_ratings_competition ON cf_player_ratings(competition_name);
CREATE INDEX idx_cf_player_ratings_player_id ON cf_player_ratings(player_id);

-- Enable Row Level Security (optional)
ALTER TABLE cf_player_ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to cf_player_ratings" 
ON cf_player_ratings 
FOR SELECT 
TO PUBLIC 
USING (true);
