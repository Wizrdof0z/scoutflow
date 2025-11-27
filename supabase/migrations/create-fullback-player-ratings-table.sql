-- ============================================================================
-- CREATE FULLBACK PLAYER RATINGS TABLE
-- ============================================================================
-- This table stores pre-computed percentile-based category ratings for Fullback players (LB + RB)
-- Categories: Speed, Agility, Stamina, Intensity, Lapping Runs, Attacking Movement, Pressure Handling, Pass Accuracy

-- Drop existing table if exists
DROP TABLE IF EXISTS fullback_player_ratings CASCADE;

-- Create the table
CREATE TABLE fullback_player_ratings (
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
  intensity NUMERIC(5,2),
  lapping_runs NUMERIC(5,2),
  attacking_movement NUMERIC(5,2),
  pressure_handling NUMERIC(5,2),
  pass_accuracy NUMERIC(5,2),
  
  -- Composite primary key
  PRIMARY KEY (player_id, competition_edition_id, team_id)
);

-- Calculate percentiles and insert data
INSERT INTO fullback_player_ratings
WITH base_data AS (
  -- Get all Fullback players with their metrics from source tables
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
      WHEN phys.position IN ('LB', 'LWB') THEN 'LB'
      WHEN phys.position IN ('RB', 'RWB') THEN 'RB'
      ELSE phys.position
    END as position,
    
    -- Position group
    CASE 
      WHEN phys.position IN ('LB', 'LWB', 'RB', 'RWB') THEN 'Fullback'
      ELSE 'Other'
    END as position_group,
    
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
    
    -- Intensity metrics
    phys.hi_distance_full_all_p90,
    phys.hi_count_full_all_p90,
    
    -- Lapping Runs metrics
    runs.count_overlap_runs_per_match,
    runs.overlap_runs_threat_per_match,
    runs.count_underlap_runs_per_match,
    runs.underlap_runs_threat_per_match,
    
    -- Attacking Movement metrics
    runs.count_runs_in_behind_per_match,
    runs.count_dangerous_runs_in_behind_per_match,
    runs.count_runs_ahead_of_the_ball_per_match,
    runs.count_dangerous_runs_ahead_of_the_ball_per_match,
    runs.count_cross_receiver_runs_per_match,
    runs.count_dangerous_cross_receiver_runs_per_match,
    
    -- Pressure Handling metrics
    press.ball_retention_ratio_under_high_pressure,
    press.ball_retention_ratio_under_medium_pressure,
    press.ball_retention_ratio_under_low_pressure,
    
    -- Pass Accuracy metrics
    pass.pass_completion_ratio_to_support_runs,
    pass.pass_completion_ratio_to_pulling_wide_runs,
    pass.pass_completion_ratio_to_coming_short_runs,
    pass.pass_completion_ratio_to_underlap_runs,
    pass.pass_completion_ratio_to_overlap_runs,
    pass.pass_completion_ratio_to_dropping_off_runs,
    pass.pass_completion_ratio_to_pulling_half_space_runs
    
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
  
  WHERE phys.position IN ('LB', 'LWB', 'RB', 'RWB')
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
    
    -- Intensity percentiles (higher is better)
    CASE WHEN hi_distance_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY hi_distance_full_all_p90) * 100 END as pct_hi_distance,
    CASE WHEN hi_count_full_all_p90 IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY hi_count_full_all_p90) * 100 END as pct_hi_count,
    
    -- Lapping Runs percentiles (higher is better)
    CASE WHEN count_overlap_runs_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_overlap_runs_per_match) * 100 END as pct_overlap_runs,
    CASE WHEN overlap_runs_threat_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY overlap_runs_threat_per_match) * 100 END as pct_overlap_threat,
    CASE WHEN count_underlap_runs_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_underlap_runs_per_match) * 100 END as pct_underlap_runs,
    CASE WHEN underlap_runs_threat_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY underlap_runs_threat_per_match) * 100 END as pct_underlap_threat,
    
    -- Attacking Movement percentiles (higher is better)
    CASE WHEN count_runs_in_behind_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_runs_in_behind_per_match) * 100 END as pct_runs_in_behind,
    CASE WHEN count_dangerous_runs_in_behind_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_dangerous_runs_in_behind_per_match) * 100 END as pct_dangerous_runs_behind,
    CASE WHEN count_runs_ahead_of_the_ball_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_runs_ahead_of_the_ball_per_match) * 100 END as pct_runs_ahead,
    CASE WHEN count_dangerous_runs_ahead_of_the_ball_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_dangerous_runs_ahead_of_the_ball_per_match) * 100 END as pct_dangerous_runs_ahead,
    CASE WHEN count_cross_receiver_runs_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_cross_receiver_runs_per_match) * 100 END as pct_cross_receiver,
    CASE WHEN count_dangerous_cross_receiver_runs_per_match IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY count_dangerous_cross_receiver_runs_per_match) * 100 END as pct_dangerous_cross,
    
    -- Pressure Handling percentiles (higher is better)
    CASE WHEN ball_retention_ratio_under_high_pressure IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY ball_retention_ratio_under_high_pressure) * 100 END as pct_ball_retention_high,
    CASE WHEN ball_retention_ratio_under_medium_pressure IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY ball_retention_ratio_under_medium_pressure) * 100 END as pct_ball_retention_medium,
    CASE WHEN ball_retention_ratio_under_low_pressure IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY ball_retention_ratio_under_low_pressure) * 100 END as pct_ball_retention_low,
    
    -- Pass Accuracy percentiles (higher is better)
    CASE WHEN pass_completion_ratio_to_support_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_support_runs) * 100 END as pct_pass_support,
    CASE WHEN pass_completion_ratio_to_pulling_wide_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_pulling_wide_runs) * 100 END as pct_pass_pulling_wide,
    CASE WHEN pass_completion_ratio_to_coming_short_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_coming_short_runs) * 100 END as pct_pass_coming_short,
    CASE WHEN pass_completion_ratio_to_underlap_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_underlap_runs) * 100 END as pct_pass_underlap,
    CASE WHEN pass_completion_ratio_to_overlap_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_overlap_runs) * 100 END as pct_pass_overlap,
    CASE WHEN pass_completion_ratio_to_dropping_off_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_dropping_off_runs) * 100 END as pct_pass_dropping_off,
    CASE WHEN pass_completion_ratio_to_pulling_half_space_runs IS NOT NULL THEN PERCENT_RANK() OVER (PARTITION BY competition_edition_id ORDER BY pass_completion_ratio_to_pulling_half_space_runs) * 100 END as pct_pass_half_space
    
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
  
  -- Intensity: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_hi_distance, 0) + COALESCE(pct_hi_count, 0)) / 
    NULLIF((CASE WHEN pct_hi_distance IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_hi_count IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as intensity,
  
  -- Lapping Runs: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_overlap_runs, 0) + COALESCE(pct_overlap_threat, 0) + COALESCE(pct_underlap_runs, 0) + COALESCE(pct_underlap_threat, 0)) / 
    NULLIF((CASE WHEN pct_overlap_runs IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_overlap_threat IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_underlap_runs IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_underlap_threat IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as lapping_runs,
  
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
  
  -- Pressure Handling: average of non-NULL metrics only
  ROUND((
    (COALESCE(pct_ball_retention_high, 0) + COALESCE(pct_ball_retention_medium, 0) + COALESCE(pct_ball_retention_low, 0)) / 
    NULLIF((CASE WHEN pct_ball_retention_high IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_ball_retention_medium IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN pct_ball_retention_low IS NOT NULL THEN 1 ELSE 0 END), 0)
  )::numeric, 2) as pressure_handling,
  
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
  )::numeric, 2) as pass_accuracy

FROM percentiles;

-- Create indexes for fast lookups
CREATE INDEX idx_fullback_player_ratings_player_name ON fullback_player_ratings(player_name);
CREATE INDEX idx_fullback_player_ratings_team_name ON fullback_player_ratings(team_name);
CREATE INDEX idx_fullback_player_ratings_competition ON fullback_player_ratings(competition_name);
CREATE INDEX idx_fullback_player_ratings_player_id ON fullback_player_ratings(player_id);

-- Enable Row Level Security
ALTER TABLE fullback_player_ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to fullback_player_ratings" 
ON fullback_player_ratings 
FOR SELECT 
TO PUBLIC 
USING (true);
