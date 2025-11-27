-- ============================================================================
-- CREATE CENTER FORWARD PLAYER STATS TABLE
-- ============================================================================
-- This table stores pre-computed CF player statistics from all stat tables
-- Much faster than views since data is materialized

-- Drop existing table if exists
DROP TABLE IF EXISTS cf_player_stats CASCADE;

-- Create the table
CREATE TABLE cf_player_stats (
  -- Player identification
  player_id INTEGER NOT NULL,
  player_name TEXT,
  short_name TEXT,
  
  -- Context
  competition_edition_id INTEGER NOT NULL,
  competition_name TEXT,
  season_name TEXT,
  team_id INTEGER NOT NULL,
  team_name TEXT,
  season_id INTEGER,
  
  -- Position
  position TEXT,
  
  -- Match count
  count_match INTEGER,
  
  -- ========== PHYSICAL STATS ==========
  timetohsrpostcod_top3 NUMERIC,
  timetosprintpostcod_top3 NUMERIC,
  timeto505around90_top3 NUMERIC,
  timeto505around180_top3 NUMERIC,
  timetohsr_top3 NUMERIC,
  timetosprint_top3 NUMERIC,
  psv99 NUMERIC,
  explacceltohsr_count_full_all_p90 NUMERIC,
  explacceltosprint_count_full_all_p90 NUMERIC,
  sprint_distance_full_all_p90 NUMERIC,
  sprint_count_full_all_p90 NUMERIC,
  running_distance_full_all_p90 NUMERIC,
  hsr_distance_full_all_p90 NUMERIC,
  hi_distance_full_all_p90 NUMERIC,
  
  -- ========== PRESSURE STATS ==========
  count_pass_attempts_under_low_pressure_per_match NUMERIC,
  count_completed_passes_under_low_pressure_per_match NUMERIC,
  count_dangerous_pass_attempts_under_low_pressure_per_match NUMERIC,
  count_completed_dangerous_passes_under_low_pressure_per_match NUMERIC,
  count_pass_attempts_under_medium_pressure_per_match NUMERIC,
  count_completed_passes_under_medium_pressure_per_match NUMERIC,
  count_medium_pressures_received_per_match NUMERIC,
  count_forced_losses_under_medium_pressure_per_match NUMERIC,
  count_high_pressures_received_per_match NUMERIC,
  count_forced_losses_under_high_pressure_per_match NUMERIC,
  count_pass_attempts_under_high_pressure_per_match NUMERIC,
  count_completed_passes_under_high_pressure_per_match NUMERIC,
  count_dangerous_pass_attempts_under_high_pressure_per_match NUMERIC,
  count_completed_dangerous_passes_under_high_pressure_per_match NUMERIC,
  
  -- ========== OFF-BALL RUNS STATS ==========
  total_attacking_runs_per_match NUMERIC,
  count_dangerous_runs_in_behind_per_match NUMERIC,
  count_dangerous_runs_ahead_of_the_ball_per_match NUMERIC,
  count_dangerous_cross_receiver_runs_per_match NUMERIC,
  count_runs_in_behind_leading_to_shot_per_match NUMERIC,
  count_runs_in_behind_leading_to_goal_per_match NUMERIC,
  count_runs_ahead_of_the_ball_leading_to_shot_per_match NUMERIC,
  count_runs_ahead_of_the_ball_leading_to_goal_per_match NUMERIC,
  count_cross_receiver_runs_leading_to_goal_per_match NUMERIC,
  count_cross_receiver_runs_leading_to_shot_per_match NUMERIC,
  count_pulling_wide_runs_per_match NUMERIC,
  count_coming_short_runs_per_match NUMERIC,
  count_pulling_half_space_runs_per_match NUMERIC,
  
  -- ========== PASSING STATS ==========
  count_pass_opportunities_to_dangerous_runs_in_behind_per_match NUMERIC,
  count_pass_attempts_to_dangerous_runs_in_behind_per_match NUMERIC,
  count_completed_pass_to_dangerous_runs_in_behind_per_match NUMERIC,
  count_pass_opportunities_to_dangerous_runs_ahead_of_the_ball_per_match NUMERIC,
  count_pass_attempts_to_dangerous_runs_ahead_of_the_ball_per_match NUMERIC,
  count_pass_opportunities_to_dangerous_underlap_runs_per_match NUMERIC,
  count_pass_attempts_to_dangerous_underlap_runs_per_match NUMERIC,
  count_completed_pass_to_dangerous_underlap_runs_per_match NUMERIC,
  count_pass_opportunities_to_dangerous_overlap_runs_per_match NUMERIC,
  count_pass_attempts_to_dangerous_overlap_runs_per_match NUMERIC,
  count_completed_pass_to_dangerous_overlap_runs_per_match NUMERIC,
  count_pass_attempts_to_runs_in_behind_per_match NUMERIC,
  count_completed_pass_to_runs_in_behind_per_match NUMERIC,
  count_pass_attempts_to_underlap_runs_per_match NUMERIC,
  count_completed_pass_to_underlap_runs_per_match NUMERIC,
  count_completed_pass_to_underlap_runs_leading_to_shot_per_match NUMERIC,
  count_pass_attempts_to_overlap_runs_per_match NUMERIC,
  count_completed_pass_to_overlap_runs_per_match NUMERIC,
  count_completed_pass_to_overlap_runs_leading_to_shot_per_match NUMERIC,
  count_pass_attempts_to_coming_short_runs_per_match NUMERIC,
  count_completed_pass_to_coming_short_runs_per_match NUMERIC,
  
  -- Composite primary key
  PRIMARY KEY (player_id, competition_edition_id, team_id)
);

-- Insert data from physical_p90 first (fastest, no complex joins)
INSERT INTO cf_player_stats (
  player_id, player_name, short_name,
  competition_edition_id, competition_name, season_name,
  team_id, team_name, season_id,
  position, count_match,
  timetohsrpostcod_top3, timetosprintpostcod_top3, timeto505around90_top3, timeto505around180_top3,
  timetohsr_top3, timetosprint_top3, psv99,
  explacceltohsr_count_full_all_p90, explacceltosprint_count_full_all_p90,
  sprint_distance_full_all_p90, sprint_count_full_all_p90,
  running_distance_full_all_p90, hsr_distance_full_all_p90, hi_distance_full_all_p90
)
SELECT DISTINCT ON (phys.player_id, phys.competition_edition_id, phys.team_id)
  phys.player_id,
  pl.player_name,
  pl.short_name,
  phys.competition_edition_id,
  ce.competition_name,
  ce.season_name,
  phys.team_id,
  t.team_name,
  phys.season_id,
  phys.position,
  phys.count_match,
  phys.timetohsrpostcod_top3,
  phys.timetosprintpostcod_top3,
  phys.timeto505around90_top3,
  phys.timeto505around180_top3,
  phys.timetohsr_top3,
  phys.timetosprint_top3,
  phys.psv99,
  phys.explacceltohsr_count_full_all_p90,
  phys.explacceltosprint_count_full_all_p90,
  phys.sprint_distance_full_all_p90,
  phys.sprint_count_full_all_p90,
  phys.running_distance_full_all_p90,
  phys.hsr_distance_full_all_p90,
  phys.hi_distance_full_all_p90
FROM physical_p90 phys
LEFT JOIN player pl ON phys.player_id = pl.player_id
LEFT JOIN teams t ON phys.team_id = t.team_id
LEFT JOIN competition_editions ce ON phys.competition_edition_id = ce.competition_edition_id
WHERE phys.position IN ('RF', 'LF', 'CF')
ORDER BY phys.player_id, phys.competition_edition_id, phys.team_id;

-- Update with pressure stats
UPDATE cf_player_stats cfs
SET
  count_pass_attempts_under_low_pressure_per_match = press.count_pass_attempts_under_low_pressure_per_match,
  count_completed_passes_under_low_pressure_per_match = press.count_completed_passes_under_low_pressure_per_match,
  count_dangerous_pass_attempts_under_low_pressure_per_match = press.count_dangerous_pass_attempts_under_low_pressure_per_match,
  count_completed_dangerous_passes_under_low_pressure_per_match = press.count_completed_dangerous_passes_under_low_pressure_per_match,
  count_pass_attempts_under_medium_pressure_per_match = press.count_pass_attempts_under_medium_pressure_per_match,
  count_completed_passes_under_medium_pressure_per_match = press.count_completed_passes_under_medium_pressure_per_match,
  count_medium_pressures_received_per_match = press.count_medium_pressures_received_per_match,
  count_forced_losses_under_medium_pressure_per_match = press.count_forced_losses_under_medium_pressure_per_match,
  count_high_pressures_received_per_match = press.count_high_pressures_received_per_match,
  count_forced_losses_under_high_pressure_per_match = press.count_forced_losses_under_high_pressure_per_match,
  count_pass_attempts_under_high_pressure_per_match = press.count_pass_attempts_under_high_pressure_per_match,
  count_completed_passes_under_high_pressure_per_match = press.count_completed_passes_under_high_pressure_per_match,
  count_dangerous_pass_attempts_under_high_pressure_per_match = press.count_dangerous_pass_attempts_under_high_pressure_per_match,
  count_completed_dangerous_passes_under_high_pressure_per_match = press.count_completed_dangerous_passes_under_high_pressure_per_match
FROM on_ball_pressures_pmatch press
WHERE cfs.player_id = press.player_id
  AND cfs.team_id = press.team_id
  AND cfs.competition_edition_id = press.competition_edition_id
  AND cfs.position = press.position;

-- Update with off-ball runs stats
UPDATE cf_player_stats cfs
SET
  total_attacking_runs_per_match = COALESCE(runs.count_runs_in_behind_per_match, 0) + COALESCE(runs.count_runs_ahead_of_the_ball_per_match, 0) + COALESCE(runs.count_cross_receiver_runs_per_match, 0),
  count_dangerous_runs_in_behind_per_match = runs.count_dangerous_runs_in_behind_per_match,
  count_dangerous_runs_ahead_of_the_ball_per_match = runs.count_dangerous_runs_ahead_of_the_ball_per_match,
  count_dangerous_cross_receiver_runs_per_match = runs.count_dangerous_cross_receiver_runs_per_match,
  count_runs_in_behind_leading_to_shot_per_match = runs.count_runs_in_behind_leading_to_shot_per_match,
  count_runs_in_behind_leading_to_goal_per_match = runs.count_runs_in_behind_leading_to_goal_per_match,
  count_runs_ahead_of_the_ball_leading_to_shot_per_match = runs.count_runs_ahead_of_the_ball_leading_to_shot_per_match,
  count_runs_ahead_of_the_ball_leading_to_goal_per_match = runs.count_runs_ahead_of_the_ball_leading_to_goal_per_match,
  count_cross_receiver_runs_leading_to_goal_per_match = runs.count_cross_receiver_runs_leading_to_goal_per_match,
  count_cross_receiver_runs_leading_to_shot_per_match = runs.count_cross_receiver_runs_leading_to_shot_per_match,
  count_pulling_wide_runs_per_match = runs.count_pulling_wide_runs_per_match,
  count_coming_short_runs_per_match = runs.count_coming_short_runs_per_match,
  count_pulling_half_space_runs_per_match = runs.count_pulling_half_space_runs_per_match
FROM off_ball_runs_pmatch runs
WHERE cfs.player_id = runs.player_id
  AND cfs.team_id = runs.team_id
  AND cfs.competition_edition_id = runs.competition_edition_id
  AND cfs.position = runs.position;

-- Update with passing stats
UPDATE cf_player_stats cfs
SET
  count_pass_opportunities_to_dangerous_runs_in_behind_per_match = pass.count_pass_opportunities_to_dangerous_runs_in_behind_per_match,
  count_pass_attempts_to_dangerous_runs_in_behind_per_match = pass.count_pass_attempts_to_dangerous_runs_in_behind_per_match,
  count_completed_pass_to_dangerous_runs_in_behind_per_match = pass.count_completed_pass_to_dangerous_runs_in_behind_per_match,
  count_pass_opportunities_to_dangerous_runs_ahead_of_the_ball_per_match = pass.count_pass_opportunities_to_dangerous_runs_ahead_of_the_ball_per_match,
  count_pass_attempts_to_dangerous_runs_ahead_of_the_ball_per_match = pass.count_pass_attempts_to_dangerous_runs_ahead_of_the_ball_per_match,
  count_pass_opportunities_to_dangerous_underlap_runs_per_match = pass.count_pass_opportunities_to_dangerous_underlap_runs_per_match,
  count_pass_attempts_to_dangerous_underlap_runs_per_match = pass.count_pass_attempts_to_dangerous_underlap_runs_per_match,
  count_completed_pass_to_dangerous_underlap_runs_per_match = pass.count_completed_pass_to_dangerous_underlap_runs_per_match,
  count_pass_opportunities_to_dangerous_overlap_runs_per_match = pass.count_pass_opportunities_to_dangerous_overlap_runs_per_match,
  count_pass_attempts_to_dangerous_overlap_runs_per_match = pass.count_pass_attempts_to_dangerous_overlap_runs_per_match,
  count_completed_pass_to_dangerous_overlap_runs_per_match = pass.count_completed_pass_to_dangerous_overlap_runs_per_match,
  count_pass_attempts_to_runs_in_behind_per_match = pass.count_pass_attempts_to_runs_in_behind_per_match,
  count_completed_pass_to_runs_in_behind_per_match = pass.count_completed_pass_to_runs_in_behind_per_match,
  count_pass_attempts_to_underlap_runs_per_match = pass.count_pass_attempts_to_underlap_runs_per_match,
  count_completed_pass_to_underlap_runs_per_match = pass.count_completed_pass_to_underlap_runs_per_match,
  count_completed_pass_to_underlap_runs_leading_to_shot_per_match = pass.count_completed_pass_to_underlap_runs_leading_to_shot_per_match,
  count_pass_attempts_to_overlap_runs_per_match = pass.count_pass_attempts_to_overlap_runs_per_match,
  count_completed_pass_to_overlap_runs_per_match = pass.count_completed_pass_to_overlap_runs_per_match,
  count_completed_pass_to_overlap_runs_leading_to_shot_per_match = pass.count_completed_pass_to_overlap_runs_leading_to_shot_per_match,
  count_pass_attempts_to_coming_short_runs_per_match = pass.count_pass_attempts_to_coming_short_runs_per_match,
  count_completed_pass_to_coming_short_runs_per_match = pass.count_completed_pass_to_coming_short_runs_per_match
FROM passing_pmatch pass
WHERE cfs.player_id = pass.player_id
  AND cfs.team_id = pass.team_id
  AND cfs.competition_edition_id = pass.competition_edition_id
  AND cfs.position = pass.position;

-- Create indexes for fast lookups
CREATE INDEX idx_cf_player_stats_player_name ON cf_player_stats(player_name);
CREATE INDEX idx_cf_player_stats_team_name ON cf_player_stats(team_name);
CREATE INDEX idx_cf_player_stats_competition ON cf_player_stats(competition_name);
CREATE INDEX idx_cf_player_stats_player_id ON cf_player_stats(player_id);

-- Enable Row Level Security
ALTER TABLE cf_player_stats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (adjust based on your auth requirements)
CREATE POLICY "Allow public read access to cf_player_stats" 
ON cf_player_stats 
FOR SELECT 
TO PUBLIC 
USING (true);

-- If you need authenticated-only access, use this instead:
-- CREATE POLICY "Allow authenticated read access to cf_player_stats" 
-- ON cf_player_stats 
-- FOR SELECT 
-- TO authenticated 
-- USING (true);
