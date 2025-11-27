-- ============================================================================
-- CREATE UNIFIED STATISTICS VIEW
-- ============================================================================
CREATE VIEW vw_player_stats AS
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
  
  -- Normalized position (e.g., FB for LB/RB/LWB/RWB)
  CASE 
    WHEN phys.position IN ('RF', 'LF', 'CF') THEN 'CF'
    WHEN phys.position = 'RW' THEN 'RW'
    WHEN phys.position = 'LW' THEN 'LW'
    WHEN phys.position IN ('LAM', 'RAM', 'AM') THEN 'AM'
    WHEN phys.position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'CM'
    WHEN phys.position IN ('LDM', 'RDM', 'DM') THEN 'DM'
    WHEN phys.position IN ('LB', 'LWB') THEN 'LB'
    WHEN phys.position In ('RB', 'RWB') THEN 'RB'
    WHEN phys.position IN ('LCB', 'RCB', 'CB') THEN 'CB'
    ELSE phys.position
  END as position,
  
  -- Position group for analysis
  CASE 
    WHEN phys.position IN ('RF', 'LF', 'CF') THEN 'Forward'
    WHEN phys.position = 'RW' THEN 'Right Winger'
    WHEN phys.position = 'LW' THEN 'Left Winger'
    WHEN phys.position IN ('LAM', 'RAM', 'AM') THEN 'Attacking Midfield'
    WHEN phys.position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'Central Midfield'
    WHEN phys.position IN ('LDM', 'RDM', 'DM') THEN 'Defensive Midfield'
    WHEN phys.position IN ('LB', 'LWB') Then 'Left Fullback'
    WHEN phys.position IN ('RB', 'RWB') THEN 'Right Fullback'
    WHEN phys.position IN ('LCB', 'RCB', 'CB') THEN 'Center Back'
    ELSE 'Other'
  END as position_group,
  
  -- Match count (use physical as base, they should all match)
  SUM(phys.count_match) as count_match,
  
  -- ========== PHYSICAL STATS (weighted averages) ==========
  SUM(phys.timetohsr_top3 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as timetohsr_top3,
  SUM(phys.timetosprint_top3 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as timetosprint_top3,
  SUM(phys.psv99 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as psv99,
  SUM(phys.psv99_top5 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as psv99_top5,
  SUM(phys.total_distance_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as total_distance_full_all_p90,
  SUM(phys.total_metersperminute_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as total_metersperminute_full_all_p90,
  SUM(phys.running_distance_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as running_distance_full_all_p90,
  SUM(phys.hsr_distance_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as hsr_distance_full_all_p90,
  SUM(phys.hsr_count_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as hsr_count_full_all_p90,
  SUM(phys.sprint_distance_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as sprint_distance_full_all_p90,
  SUM(phys.sprint_count_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as sprint_count_full_all_p90,
  SUM(phys.hi_distance_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as hi_distance_full_all_p90,
  SUM(phys.hi_count_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as hi_count_full_all_p90,
  SUM(phys.medaccel_count_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as medaccel_count_full_all_p90,
  SUM(phys.highaccel_count_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as highaccel_count_full_all_p90,
  SUM(phys.meddecel_count_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as meddecel_count_full_all_p90,
  SUM(phys.highdecel_count_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as highdecel_count_full_all_p90,
  SUM(phys.explacceltohsr_count_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as explacceltohsr_count_full_all_p90,
  SUM(phys.explacceltosprint_count_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as explacceltosprint_count_full_all_p90,
  SUM(phys.timetohsrpostcod_top3 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as timetohsrpostcod_top3,
  SUM(phys.timetosprintpostcod_top3 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as timetosprintpostcod_top3,
  SUM(phys.timeto505around90_top3 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as timeto505around90_top3,
  SUM(phys.timeto505around180_top3 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as timeto505around180_top3,
  SUM(phys.cod_count_full_all_p90 * phys.count_match) / NULLIF(SUM(phys.count_match), 0) as cod_count_full_all_p90,
  
  -- ========== PRESSURE STATS (weighted averages) ==========
  SUM(press.count_low_pressures_received_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_low_pressures_received_per_match,
  SUM(press.count_forced_losses_under_low_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_forced_losses_under_low_pressure_per_match,
  SUM(press.ball_retention_ratio_under_low_pressure * press.count_match) / NULLIF(SUM(press.count_match), 0) as ball_retention_ratio_under_low_pressure,
  SUM(press.count_pass_attempts_under_low_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_pass_attempts_under_low_pressure_per_match,
  SUM(press.count_completed_passes_under_low_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_completed_passes_under_low_pressure_per_match,
  SUM(press.count_dangerous_pass_attempts_under_low_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_dangerous_pass_attempts_under_low_pressure_per_match,
  SUM(press.count_completed_dangerous_passes_under_low_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_completed_dangerous_passes_under_low_pressure_per_match,
  SUM(press.count_difficult_pass_attempts_under_low_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_difficult_pass_attempts_under_low_pressure_per_match,
  SUM(press.count_completed_difficult_passes_under_low_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_completed_difficult_passes_under_low_pressure_per_match,
  SUM(press.difficult_pass_completion_ratio_under_low_pressure * press.count_match) / NULLIF(SUM(press.count_match), 0) as difficult_pass_completion_ratio_under_low_pressure,

  SUM(press.count_medium_pressures_received_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_medium_pressures_received_per_match,
  SUM(press.count_forced_losses_under_medium_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_forced_losses_under_medium_pressure_per_match,
  SUM(press.ball_retention_ratio_under_medium_pressure * press.count_match) / NULLIF(SUM(press.count_match), 0) as ball_retention_ratio_under_medium_pressure,
  SUM(press.count_pass_attempts_under_medium_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_pass_attempts_under_medium_pressure_per_match,
  SUM(press.count_completed_passes_under_medium_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_completed_passes_under_medium_pressure_per_match,
  SUM(press.count_dangerous_pass_attempts_under_medium_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_dangerous_pass_attempts_under_medium_pressure_per_match,
  SUM(press.count_difficult_pass_attempts_under_medium_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_difficult_pass_attempts_under_medium_pressure_per_match,
  SUM(press.difficult_pass_completion_ratio_under_medium_pressure * press.count_match) / NULLIF(SUM(press.count_match), 0) as difficult_pass_completion_ratio_under_medium_pressure,

  SUM(press.count_high_pressures_received_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_high_pressures_received_per_match,
  SUM(press.count_forced_losses_under_high_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_forced_losses_under_high_pressure_per_match,
  SUM(press.ball_retention_ratio_under_high_pressure * press.count_match) / NULLIF(SUM(press.count_match), 0) as ball_retention_ratio_under_high_pressure,
  SUM(press.pass_completion_ratio_under_high_pressure * press.count_match) / NULLIF(SUM(press.count_match), 0) as pass_completion_ratio_under_high_pressure,
  SUM(press.count_pass_attempts_under_high_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_pass_attempts_under_high_pressure_per_match,
  SUM(press.count_completed_passes_under_high_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_completed_passes_under_high_pressure_per_match,
  SUM(press.count_dangerous_pass_attempts_under_high_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_dangerous_pass_attempts_under_high_pressure_per_match,
  SUM(press.count_completed_dangerous_passes_under_high_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_completed_dangerous_passes_under_high_pressure_per_match,
  SUM(press.count_difficult_pass_attempts_under_high_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_difficult_pass_attempts_under_high_pressure_per_match,
  SUM(press.count_completed_difficult_passes_under_high_pressure_per_match * press.count_match) / NULLIF(SUM(press.count_match), 0) as count_completed_difficult_passes_under_high_pressure_per_match,
  SUM(press.difficult_pass_completion_ratio_under_high_pressure * press.count_match) / NULLIF(SUM(press.count_match), 0) as difficult_pass_completion_ratio_under_high_pressure,
  
  -- ========== OFF-BALL RUNS STATS (weighted averages) ==========
  SUM(runs.count_runs_in_behind_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_runs_in_behind_per_match,
  SUM(runs.count_dangerous_runs_in_behind_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_dangerous_runs_in_behind_per_match,
  SUM(runs.runs_in_behind_threat_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as runs_in_behind_threat_per_match,
  SUM(runs.count_runs_in_behind_leading_to_goal_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_runs_in_behind_leading_to_goal_per_match,
  SUM(runs.count_runs_in_behind_leading_to_shot_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_runs_in_behind_leading_to_shot_per_match,
  SUM(runs.count_runs_ahead_of_the_ball_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_runs_ahead_of_the_ball_per_match,
  SUM(runs.count_dangerous_runs_ahead_of_the_ball_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_dangerous_runs_ahead_of_the_ball_per_match,
  SUM(runs.runs_ahead_of_the_ball_threat_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as runs_ahead_of_the_ball_threat_per_match,
  SUM(runs.count_runs_ahead_of_the_ball_leading_to_goal_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_runs_ahead_of_the_ball_leading_to_goal_per_match,
  SUM(runs.count_runs_ahead_of_the_ball_leading_to_shot_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_runs_ahead_of_the_ball_leading_to_shot_per_match,
  SUM(runs.count_support_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_support_runs_per_match,
  SUM(runs.count_dangerous_support_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_dangerous_support_runs_per_match,
  SUM(runs.support_runs_threat_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as support_runs_threat_per_match,
  SUM(runs.count_support_runs_leading_to_goal_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_support_runs_leading_to_goal_per_match,
  SUM(runs.count_support_runs_leading_to_shot_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_support_runs_leading_to_shot_per_match,
  SUM(runs.count_pulling_wide_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_pulling_wide_runs_per_match,
  SUM(runs.count_dangerous_pulling_wide_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_dangerous_pulling_wide_runs_per_match,
  SUM(runs.pulling_wide_runs_threat_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as pulling_wide_runs_threat_per_match,
  SUM(runs.count_coming_short_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_coming_short_runs_per_match,
  SUM(runs.count_underlap_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_underlap_runs_per_match,
  SUM(runs.count_dangerous_underlap_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_dangerous_underlap_runs_per_match,
  SUM(runs.underlap_runs_threat_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as underlap_runs_threat_per_match,
  SUM(runs.count_underlap_runs_leading_to_goal_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_underlap_runs_leading_to_goal_per_match,
  SUM(runs.count_underlap_runs_leading_to_shot_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_underlap_runs_leading_to_shot_per_match,
  SUM(runs.count_overlap_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_overlap_runs_per_match,
  SUM(runs.count_dangerous_overlap_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_dangerous_overlap_runs_per_match,
  SUM(runs.overlap_runs_threat_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as overlap_runs_threat_per_match,
  SUM(runs.count_overlap_runs_leading_to_goal_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_overlap_runs_leading_to_goal_per_match,
  SUM(runs.count_overlap_runs_leading_to_shot_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_overlap_runs_leading_to_shot_per_match,
  SUM(runs.count_dropping_off_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_dropping_off_runs_per_match,
  SUM(runs.count_pulling_half_space_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_pulling_half_space_runs_per_match,
  SUM(runs.count_dangerous_pulling_half_space_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_dangerous_pulling_half_space_runs_per_match,
  SUM(runs.pulling_half_space_runs_threat_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as pulling_half_space_runs_threat_per_match,
  SUM(runs.count_pulling_half_space_runs_leading_to_goal_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_pulling_half_space_runs_leading_to_goal_per_match,
  SUM(runs.count_pulling_half_space_runs_leading_to_shot_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_pulling_half_space_runs_leading_to_shot_per_match,
  SUM(runs.count_cross_receiver_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_cross_receiver_runs_per_match,
  SUM(runs.count_dangerous_cross_receiver_runs_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_dangerous_cross_receiver_runs_per_match,
  SUM(runs.cross_receiver_runs_threat_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as cross_receiver_runs_threat_per_match,
  SUM(runs.count_cross_receiver_runs_leading_to_goal_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_cross_receiver_runs_leading_to_goal_per_match,
  SUM(runs.count_cross_receiver_runs_leading_to_shot_per_match * runs.count_match) / NULLIF(SUM(runs.count_match), 0) as count_cross_receiver_runs_leading_to_shot_per_match,

  
  -- ========== PASSING STATS (weighted averages) - key metrics only ==========
  SUM(pass.count_pass_attempts_to_runs_in_behind_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_runs_in_behind_per_match,
  SUM(pass.count_completed_pass_to_runs_in_behind_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_runs_in_behind_per_match,
  SUM(pass.count_pass_opportunities_to_dangerous_runs_in_behind_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_opportunities_to_dangerous_runs_in_behind_per_match,
  SUM(pass.count_pass_attempts_to_dangerous_runs_in_behind_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_dangerous_runs_in_behind_per_match,
  SUM(pass.count_completed_pass_to_dangerous_runs_in_behind_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_dangerous_runs_in_behind_per_match,
  SUM(pass.count_pass_attempts_to_runs_ahead_of_the_ball_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_runs_ahead_of_the_ball_per_match,
  SUM(pass.count_completed_pass_to_runs_ahead_of_the_ball_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_runs_ahead_of_the_ball_per_match,
  SUM(pass.count_pass_opportunities_to_dangerous_runs_ahead_of_the_ball_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_opportunities_to_dangerous_runs_ahead_of_the_ball_per_match,
  SUM(pass.count_pass_attempts_to_dangerous_runs_ahead_of_the_ball_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_dangerous_runs_ahead_of_the_ball_per_match,
  SUM(pass.count_pass_attempts_to_support_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_support_runs_per_match,
  SUM(pass.count_completed_pass_to_support_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_support_runs_per_match,
  SUM(pass.count_completed_pass_to_support_runs_leading_to_shot_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_support_runs_leading_to_shot_per_match,
  SUM(pass.count_completed_pass_to_support_runs_leading_to_goal_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_support_runs_leading_to_goal_per_match,
  SUM(pass.count_pass_attempts_to_pulling_wide_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_pulling_wide_runs_per_match,
  SUM(pass.count_completed_pass_to_pulling_wide_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_pulling_wide_runs_per_match,
  SUM(pass.count_pass_opportunities_to_dangerous_pulling_wide_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_opportunities_to_dangerous_pulling_wide_runs_per_match,
  SUM(pass.count_pass_attempts_to_dangerous_pulling_wide_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_dangerous_pulling_wide_runs_per_match,
  SUM(pass.count_completed_pass_to_dangerous_pulling_wide_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_dangerous_pulling_wide_runs_per_match,
  SUM(pass.count_pass_attempts_to_coming_short_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_coming_short_runs_per_match,
  SUM(pass.count_completed_pass_to_coming_short_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_coming_short_runs_per_match,
  SUM(pass.count_pass_attempts_to_underlap_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_underlap_runs_per_match,
  SUM(pass.count_completed_pass_to_underlap_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_underlap_runs_per_match,
  SUM(pass.count_completed_pass_to_underlap_runs_leading_to_shot_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_underlap_runs_leading_to_shot_per_match,
  SUM(pass.count_completed_pass_to_underlap_runs_leading_to_goal_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_underlap_runs_leading_to_goal_per_match,
  SUM(pass.count_pass_opportunities_to_dangerous_underlap_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_opportunities_to_dangerous_underlap_runs_per_match,
  SUM(pass.count_pass_attempts_to_dangerous_underlap_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_dangerous_underlap_runs_per_match,
  SUM(pass.count_completed_pass_to_dangerous_underlap_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_dangerous_underlap_runs_per_match,
  SUM(pass.count_pass_attempts_to_overlap_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_overlap_runs_per_match,
  SUM(pass.count_completed_pass_to_overlap_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_overlap_runs_per_match,
  SUM(pass.count_completed_pass_to_overlap_runs_leading_to_shot_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_overlap_runs_leading_to_shot_per_match,
  SUM(pass.count_completed_pass_to_overlap_runs_leading_to_goal_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_overlap_runs_leading_to_goal_per_match,
  SUM(pass.count_pass_opportunities_to_dangerous_overlap_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_opportunities_to_dangerous_overlap_runs_per_match,
  SUM(pass.count_pass_attempts_to_dangerous_overlap_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_dangerous_overlap_runs_per_match,
  SUM(pass.count_completed_pass_to_dangerous_overlap_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_dangerous_overlap_runs_per_match,
  SUM(pass.count_pass_attempts_to_dropping_off_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_dropping_off_runs_per_match,
  SUM(pass.count_completed_pass_to_dropping_off_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_dropping_off_runs_per_match,
  SUM(pass.count_pass_attempts_to_pulling_half_space_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_pulling_half_space_runs_per_match,
  SUM(pass.pulling_half_space_runs_to_which_pass_completed_threat_per_matc * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as pulling_half_space_runs_to_which_pass_completed_threat_per_matc,
  SUM(pass.count_completed_pass_to_pulling_half_space_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_pulling_half_space_runs_per_match,
  SUM(pass.count_pass_opportunities_to_dangerous_pulling_half_space_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_opportunities_to_dangerous_pulling_half_space_runs_per_match,
  SUM(pass.count_pass_attempts_to_dangerous_pulling_half_space_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_dangerous_pulling_half_space_runs_per_match,
  SUM(pass.count_pass_attempts_to_cross_receiver_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_cross_receiver_runs_per_match,
  SUM(pass.pass_opportunities_to_cross_receiver_runs_threat_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as pass_opportunities_to_cross_receiver_runs_threat_per_match,
  SUM(pass.cross_receiver_runs_to_which_pass_completed_threat_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as cross_receiver_runs_to_which_pass_completed_threat_per_match,
  SUM(pass.count_completed_pass_to_cross_receiver_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_cross_receiver_runs_per_match,
  SUM(pass.count_pass_opportunities_to_dangerous_cross_receiver_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_opportunities_to_dangerous_cross_receiver_runs_per_match,
  SUM(pass.count_pass_attempts_to_dangerous_cross_receiver_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_pass_attempts_to_dangerous_cross_receiver_runs_per_match,
  SUM(pass.count_completed_pass_to_dangerous_cross_receiver_runs_per_match * pass.count_match) / NULLIF(SUM(pass.count_match), 0) as count_completed_pass_to_dangerous_cross_receiver_runs_per_match

FROM physical_p90 phys

-- Join the other stat tables
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

GROUP BY 
  phys.player_id,
  pl.player_name,
  pl.short_name,
  phys.competition_edition_id,
  ce.competition_name,
  ce.season_name,
  phys.team_id,
  t.team_name,
  phys.season_id,
  -- Normalized position
  CASE 
    WHEN phys.position IN ('RF', 'LF', 'CF') THEN 'CF'
    WHEN phys.position = 'RW' THEN 'RW'
    WHEN phys.position = 'LW' THEN 'LW'
    WHEN phys.position IN ('LAM', 'RAM', 'AM') THEN 'AM'
    WHEN phys.position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'CM'
    WHEN phys.position IN ('LDM', 'RDM', 'DM') THEN 'DM'
    WHEN phys.position IN ('LB', 'LWB') THEN 'LB'
    WHEN phys.position IN ('RB', 'RWB') THEN 'RB'
    WHEN phys.position IN ('LCB', 'RCB', 'CB') THEN 'CB'
    ELSE phys.position
  END,
  -- Position group
  CASE 
    WHEN phys.position IN ('RF', 'LF', 'CF') THEN 'Forward'
    WHEN phys.position = 'RW' THEN 'Right Winger'
    WHEN phys.position = 'LW' THEN 'Left Winger'
    WHEN phys.position IN ('LAM', 'RAM', 'AM') THEN 'Attacking Midfield'
    WHEN phys.position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'Central Midfield'
    WHEN phys.position IN ('LDM', 'RDM', 'DM') THEN 'Defensive Midfield'
    WHEN phys.position IN ('LB', 'LWB') THEN 'Left Fullback'
    WHEN phys.position IN ('RB', 'RWB') THEN 'Right Fullback'
    WHEN phys.position IN ('LCB', 'RCB', 'CB') THEN 'Center Back'
    ELSE 'Other'
  END;

-- Note: This view includes only the most important metrics from each table.
-- If you need all columns from passing_pmatch (there are 100+), you can add them to the SELECT clause.
