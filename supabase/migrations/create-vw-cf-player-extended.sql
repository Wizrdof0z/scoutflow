-- ============================================================================
-- CREATE EXTENDED CENTER FORWARD PLAYER VIEW (MATERIALIZED)
-- ============================================================================
-- This view extends the CF player statistics with relevant metrics from all stat tables
-- Includes: Physical stats, Pressure stats, Off-ball runs, Passing stats
-- Using MATERIALIZED VIEW for better performance

CREATE MATERIALIZED VIEW IF NOT EXISTS vw_cf_player_extended AS
SELECT 
  -- Player identification
  phys.player_id,
  pl.player_name,
  pl.short_name,
  
  -- Context
  phys.competition_edition_id,
  ce.competition_name,
  ce.season_name,
  phys.team_id,
  t.team_name,
  phys.season_id,
  
  -- Position
  phys.position,
  
  -- Match count
  phys.count_match,
  
  -- ========== PHYSICAL STATS ==========
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
  phys.hi_distance_full_all_p90,
  
  -- ========== PRESSURE STATS ==========
  press.count_pass_attempts_under_low_pressure_per_match,
  press.count_completed_passes_under_low_pressure_per_match,
  press.count_dangerous_pass_attempts_under_low_pressure_per_match,
  press.count_completed_dangerous_passes_under_low_pressure_per_match,
  press.count_pass_attempts_under_medium_pressure_per_match,
  press.count_completed_passes_under_medium_pressure_per_match,
  press.count_medium_pressures_received_per_match,
  press.count_forced_losses_under_medium_pressure_per_match,
  press.count_high_pressures_received_per_match,
  press.count_forced_losses_under_high_pressure_per_match,
  press.count_pass_attempts_under_high_pressure_per_match,
  press.count_completed_passes_under_high_pressure_per_match,
  press.count_dangerous_pass_attempts_under_high_pressure_per_match,
  press.count_completed_dangerous_passes_under_high_pressure_per_match,
  
  -- ========== OFF-BALL RUNS STATS ==========
  -- Combined runs metric
  (COALESCE(runs.count_runs_in_behind_per_match, 0) + COALESCE(runs.count_runs_ahead_of_the_ball_per_match, 0) + COALESCE(runs.count_cross_receiver_runs_per_match, 0)) as total_attacking_runs_per_match,
  runs.count_dangerous_runs_in_behind_per_match,
  runs.count_dangerous_runs_ahead_of_the_ball_per_match,
  runs.count_dangerous_cross_receiver_runs_per_match,
  runs.count_runs_in_behind_leading_to_shot_per_match,
  runs.count_runs_in_behind_leading_to_goal_per_match,
  runs.count_runs_ahead_of_the_ball_leading_to_shot_per_match,
  runs.count_runs_ahead_of_the_ball_leading_to_goal_per_match,
  runs.count_cross_receiver_runs_leading_to_goal_per_match,
  runs.count_cross_receiver_runs_leading_to_shot_per_match,
  runs.count_pulling_wide_runs_per_match,
  runs.count_coming_short_runs_per_match,
  runs.count_pulling_half_space_runs_per_match,
  
  -- ========== PASSING STATS ==========
  pass.count_pass_opportunities_to_dangerous_runs_in_behind_per_match,
  pass.count_pass_attempts_to_dangerous_runs_in_behind_per_match,
  pass.count_completed_pass_to_dangerous_runs_in_behind_per_match,
  pass.count_pass_opportunities_to_dangerous_runs_ahead_of_the_ball_per_match,
  pass.count_pass_attempts_to_dangerous_runs_ahead_of_the_ball_per_match,
  pass.count_pass_opportunities_to_dangerous_underlap_runs_per_match,
  pass.count_pass_attempts_to_dangerous_underlap_runs_per_match,
  pass.count_completed_pass_to_dangerous_underlap_runs_per_match,
  pass.count_pass_opportunities_to_dangerous_overlap_runs_per_match,
  pass.count_pass_attempts_to_dangerous_overlap_runs_per_match,
  pass.count_completed_pass_to_dangerous_overlap_runs_per_match,
  pass.count_pass_attempts_to_runs_in_behind_per_match,
  pass.count_completed_pass_to_runs_in_behind_per_match,
  pass.count_pass_attempts_to_underlap_runs_per_match,
  pass.count_completed_pass_to_underlap_runs_per_match,
  pass.count_completed_pass_to_underlap_runs_leading_to_shot_per_match,
  pass.count_pass_attempts_to_overlap_runs_per_match,
  pass.count_completed_pass_to_overlap_runs_per_match,
  pass.count_completed_pass_to_overlap_runs_leading_to_shot_per_match,
  pass.count_pass_attempts_to_coming_short_runs_per_match,
  pass.count_completed_pass_to_coming_short_runs_per_match

FROM physical_p90 phys

-- Join other stat tables (all CF positions: RF, LF, CF)
LEFT JOIN on_ball_pressures_pmatch press ON 
  phys.player_id = press.player_id 
  AND phys.team_id = press.team_id 
  AND phys.competition_edition_id = press.competition_edition_id
  AND phys.position = press.position

LEFT JOIN off_ball_runs_pmatch runs ON 
  phys.player_id = runs.player_id 
  AND phys.team_id = runs.team_id 
  AND phys.competition_edition_id = runs.competition_edition_id
  AND phys.position = runs.position

LEFT JOIN passing_pmatch pass ON 
  phys.player_id = pass.player_id 
  AND phys.team_id = pass.team_id 
  AND phys.competition_edition_id = pass.competition_edition_id
  AND phys.position = pass.position

-- Join reference tables for names
LEFT JOIN player pl ON phys.player_id = pl.player_id
LEFT JOIN teams t ON phys.team_id = t.team_id
LEFT JOIN competition_editions ce ON phys.competition_edition_id = ce.competition_edition_id

-- Filter for CF positions only
WHERE phys.position IN ('RF', 'LF', 'CF');

-- Create indexes on materialized view for fast lookups
CREATE INDEX IF NOT EXISTS idx_vw_cf_player_extended_player_name ON vw_cf_player_extended(player_name);
CREATE INDEX IF NOT EXISTS idx_vw_cf_player_extended_team_name ON vw_cf_player_extended(team_name);
CREATE INDEX IF NOT EXISTS idx_vw_cf_player_extended_competition ON vw_cf_player_extended(competition_name);
CREATE INDEX IF NOT EXISTS idx_vw_cf_player_extended_player_id ON vw_cf_player_extended(player_id);
