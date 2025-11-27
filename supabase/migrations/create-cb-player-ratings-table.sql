-- ============================================================================
-- CREATE CENTRAL DEFENDER PLAYER RATINGS TABLE
-- ============================================================================
-- This table stores pre-computed percentile-based category ratings for Central Defender players (CB)
-- Categories: Speed, Agility, Stamina, Building Up, Pass Accuracy, Low Pressure, Medium Pressure, High Pressure

-- Drop existing table if exists
DROP TABLE IF EXISTS cb_player_ratings CASCADE;

-- Create the table
CREATE TABLE cb_player_ratings (
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
  building_up NUMERIC(5,2),
  pass_accuracy NUMERIC(5,2),
  low_pressure NUMERIC(5,2),
  medium_pressure NUMERIC(5,2),
  high_pressure NUMERIC(5,2),
  
  -- Composite primary key
  PRIMARY KEY (player_id, competition_edition_id, team_id)
);

-- Calculate percentiles and insert data
INSERT INTO cb_player_ratings
WITH base_data AS (
  -- Get all CB players with their metrics from source tables
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
      WHEN phys.position IN ('CB', 'LCB', 'RCB') THEN 'CB'
      ELSE phys.position
    END as position,
    
    -- Position group
    'Central Defender' as position_group,
    
    phys.count_match,
    
    -- Speed metrics
    phys.timetohsr_top3,
    phys.timetosprint_top3,
    phys.psv99,
    phys.explacceltohsr_count_full_all_p90,
    phys.explacceltosprint_count_full_all_p90,
    
    -- Agility metrics (lower is better)
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
    
    -- Building Up metrics
    runs.count_coming_short_runs_per_match,
    runs.count_dropping_off_runs_per_match,
    pass.pass_completion_ratio_to_runs_ahead_of_the_ball,
    
    -- Pass Accuracy metrics
    pass.pass_completion_ratio_to_support_runs,
    pass.pass_completion_ratio_to_pulling_wide_runs,
    pass.pass_completion_ratio_to_coming_short_runs,
    pass.pass_completion_ratio_to_underlap_runs,
    pass.pass_completion_ratio_to_overlap_runs,
    pass.pass_completion_ratio_to_dropping_off_runs,
    pass.pass_completion_ratio_to_pulling_half_space_runs,
    
    -- Low Pressure metrics
    press.count_low_pressures_received_per_match,
    press.count_forced_losses_under_low_pressure_per_match,
    press.ball_retention_ratio_under_low_pressure,
    press.pass_completion_ratio_under_low_pressure,
    
    -- Medium Pressure metrics
    press.count_medium_pressures_received_per_match,
    press.count_forced_losses_under_medium_pressure_per_match,
    press.ball_retention_ratio_under_medium_pressure,
    press.pass_completion_ratio_under_medium_pressure,
    
    -- High Pressure metrics
    press.count_high_pressures_received_per_match,
    press.count_forced_losses_under_high_pressure_per_match,
    press.ball_retention_ratio_under_high_pressure,
    press.pass_completion_ratio_under_high_pressure
    
  FROM physical_p90 phys
  LEFT JOIN off_ball_runs_pmatch runs ON 
    phys.player_id = runs.player_id 
    AND phys.team_id = runs.team_id 
    AND phys.competition_edition_id = runs.competition_edition_id
    AND phys.position = runs.position
  LEFT JOIN on_ball_pressures_pmatch press ON 
    phys.player_id = press.player_id 
    AND phys.team_id = press.team_id 
    AND phys.competition_edition_id = press.competition_edition_id
    AND phys.position = press.position
  LEFT JOIN passing_pmatch pass ON 
    phys.player_id = pass.player_id 
    AND phys.team_id = pass.team_id 
    AND phys.competition_edition_id = pass.competition_edition_id
    AND phys.position = pass.position
  LEFT JOIN player pl ON phys.player_id = pl.player_id
  LEFT JOIN teams t ON phys.team_id = t.team_id
  LEFT JOIN competition_editions ce ON phys.competition_edition_id = ce.competition_edition_id
  
  WHERE phys.position IN ('CB', 'LCB', 'RCB')
  ORDER BY phys.player_id, phys.competition_edition_id, phys.team_id
),
percentiles AS (
  -- Calculate percentiles for each metric within competition
  SELECT 
    *,
    
    -- Speed percentiles (lower time is better for time metrics - use DESC)
    CASE WHEN timetohsr_top3 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY timetohsr_top3 DESC) * 100 END as pct_timetohsr,
    CASE WHEN timetosprint_top3 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY timetosprint_top3 DESC) * 100 END as pct_timetosprint,
    CASE WHEN psv99 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY psv99) * 100 END as pct_psv99,
    CASE WHEN explacceltohsr_count_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY explacceltohsr_count_full_all_p90) * 100 END as pct_explacceltohsr,
    CASE WHEN explacceltosprint_count_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY explacceltosprint_count_full_all_p90) * 100 END as pct_explacceltosprint,
    
    -- Agility percentiles (lower is better - use DESC)
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
    
    -- Building Up percentiles (higher is better)
    CASE WHEN count_coming_short_runs_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_coming_short_runs_per_match) * 100 END as pct_coming_short,
    CASE WHEN count_dropping_off_runs_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_dropping_off_runs_per_match) * 100 END as pct_dropping_off,
    CASE WHEN pass_completion_ratio_to_runs_ahead_of_the_ball IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_runs_ahead_of_the_ball) * 100 END as pct_pass_runs_ahead,
    
    -- Pass Accuracy percentiles (higher is better)
    CASE WHEN pass_completion_ratio_to_support_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_support_runs) * 100 END as pct_pass_support,
    CASE WHEN pass_completion_ratio_to_pulling_wide_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_pulling_wide_runs) * 100 END as pct_pass_pulling_wide,
    CASE WHEN pass_completion_ratio_to_coming_short_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_coming_short_runs) * 100 END as pct_pass_coming_short,
    CASE WHEN pass_completion_ratio_to_underlap_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_underlap_runs) * 100 END as pct_pass_underlap,
    CASE WHEN pass_completion_ratio_to_overlap_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_overlap_runs) * 100 END as pct_pass_overlap,
    CASE WHEN pass_completion_ratio_to_dropping_off_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_dropping_off_runs) * 100 END as pct_pass_dropping_off,
    CASE WHEN pass_completion_ratio_to_pulling_half_space_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_pulling_half_space_runs) * 100 END as pct_pass_half_space,
    
    -- Low Pressure percentiles (higher pressures received is better, lower forced losses is better, higher ratios are better)
    CASE WHEN count_low_pressures_received_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_low_pressures_received_per_match) * 100 END as pct_low_pressures_received,
    CASE WHEN count_forced_losses_under_low_pressure_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_forced_losses_under_low_pressure_per_match DESC) * 100 END as pct_low_forced_losses,
    CASE WHEN ball_retention_ratio_under_low_pressure IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY ball_retention_ratio_under_low_pressure) * 100 END as pct_low_ball_retention,
    CASE WHEN pass_completion_ratio_under_low_pressure IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_under_low_pressure) * 100 END as pct_low_pass_completion,
    
    -- Medium Pressure percentiles (higher pressures received is better, lower forced losses is better, higher ratios are better)
    CASE WHEN count_medium_pressures_received_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_medium_pressures_received_per_match) * 100 END as pct_medium_pressures_received,
    CASE WHEN count_forced_losses_under_medium_pressure_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_forced_losses_under_medium_pressure_per_match DESC) * 100 END as pct_medium_forced_losses,
    CASE WHEN ball_retention_ratio_under_medium_pressure IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY ball_retention_ratio_under_medium_pressure) * 100 END as pct_medium_ball_retention,
    CASE WHEN pass_completion_ratio_under_medium_pressure IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_under_medium_pressure) * 100 END as pct_medium_pass_completion,
    
    -- High Pressure percentiles (higher pressures received is better, lower forced losses is better, higher ratios are better)
    CASE WHEN count_high_pressures_received_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_high_pressures_received_per_match) * 100 END as pct_high_pressures_received,
    CASE WHEN count_forced_losses_under_high_pressure_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_forced_losses_under_high_pressure_per_match DESC) * 100 END as pct_high_forced_losses,
    CASE WHEN ball_retention_ratio_under_high_pressure IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY ball_retention_ratio_under_high_pressure) * 100 END as pct_high_ball_retention,
    CASE WHEN pass_completion_ratio_under_high_pressure IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_under_high_pressure) * 100 END as pct_high_pass_completion
    
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
  
  -- Building Up: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_coming_short, 0) + COALESCE(pct_pass_coming_short, 0) + COALESCE(pct_dropping_off, 0) + COALESCE(pct_pass_pulling_wide, 0) + COALESCE(pct_pass_runs_ahead, 0)) / 
    NULLIF((CASE WHEN pct_coming_short IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_pass_coming_short IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_dropping_off IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_pass_pulling_wide IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_pass_runs_ahead IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as building_up,
  
  -- Pass Accuracy: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_pass_support, 0) + COALESCE(pct_pass_pulling_wide, 0) + COALESCE(pct_pass_coming_short, 0) + COALESCE(pct_pass_underlap, 0) + COALESCE(pct_pass_overlap, 0) + COALESCE(pct_pass_dropping_off, 0) + COALESCE(pct_pass_half_space, 0)) / 
    NULLIF((CASE WHEN pct_pass_support IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_pass_pulling_wide IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_pass_coming_short IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_pass_underlap IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_pass_overlap IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_pass_dropping_off IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_pass_half_space IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as pass_accuracy,
  
  -- Low Pressure: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_low_pressures_received, 0) + COALESCE(pct_low_forced_losses, 0) + COALESCE(pct_low_ball_retention, 0) + COALESCE(pct_low_pass_completion, 0)) / 
    NULLIF((CASE WHEN pct_low_pressures_received IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_low_forced_losses IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_low_ball_retention IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_low_pass_completion IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as low_pressure,
  
  -- Medium Pressure: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_medium_pressures_received, 0) + COALESCE(pct_medium_forced_losses, 0) + COALESCE(pct_medium_ball_retention, 0) + COALESCE(pct_medium_pass_completion, 0)) / 
    NULLIF((CASE WHEN pct_medium_pressures_received IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_medium_forced_losses IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_medium_ball_retention IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_medium_pass_completion IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as medium_pressure,
  
  -- High Pressure: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_high_pressures_received, 0) + COALESCE(pct_high_forced_losses, 0) + COALESCE(pct_high_ball_retention, 0) + COALESCE(pct_high_pass_completion, 0)) / 
    NULLIF((CASE WHEN pct_high_pressures_received IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_high_forced_losses IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_high_ball_retention IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_high_pass_completion IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as high_pressure

FROM percentiles;

-- Create indexes for fast lookups
CREATE INDEX idx_cb_player_ratings_player_name ON cb_player_ratings(player_name);
CREATE INDEX idx_cb_player_ratings_team_name ON cb_player_ratings(team_name);
CREATE INDEX idx_cb_player_ratings_competition ON cb_player_ratings(competition_name);
CREATE INDEX idx_cb_player_ratings_player_id ON cb_player_ratings(player_id);

-- Enable Row Level Security
ALTER TABLE cb_player_ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to cb_player_ratings" 
ON cb_player_ratings 
FOR SELECT 
TO PUBLIC 
USING (true);
