-- Create statistical views with position aggregation and weighted averages
-- Each view aggregates players by position_group, calculating weighted averages for p90/pmatch metrics

-- ============================================================================
-- PHYSICAL STATISTICS VIEW
-- ============================================================================
CREATE OR REPLACE VIEW vw_physical_player AS
SELECT 
  player_id,
  competition_edition_id,
  team_id,
  season_id,
  -- Normalized position (e.g., RB for RB/RWB)
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'CF'
    WHEN position = 'RW' THEN 'RW'
    WHEN position = 'LW' THEN 'LW'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'AM'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'CM'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'DM'
    WHEN position IN ('LB', 'LWB') THEN 'LB'
    WHEN position IN ('RB', 'RWB') THEN 'RB'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'CB'
    ELSE position
  END as position,
  -- Position group for analysis
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'Forward'
    WHEN position = 'RW' THEN 'Right Winger'
    WHEN position = 'LW' THEN 'Left Winger'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'Attacking Midfield'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'Central Midfield'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'Defensive Midfield'
    WHEN position IN ('LB', 'LWB') THEN 'Left Fullback'
    WHEN position IN ('RB', 'RWB') THEN 'Right Full Back'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'Center Back'
    ELSE 'Other'
  END as position_group,
  -- Total matches at this position group
  SUM(count_match) as count_match,
  -- Weighted averages for all statistical columns (metric * count_match) / total_matches
  SUM(timetohsr_top3 * count_match) / SUM(count_match) as timetohsr_top3,
  SUM(timetosprint_top3 * count_match) / SUM(count_match) as timetosprint_top3,
  SUM(psv99 * count_match) / SUM(count_match) as psv99,
  SUM(psv99_top5 * count_match) / SUM(count_match) as psv99_top5,
  SUM(total_distance_full_all_p90 * count_match) / SUM(count_match) as total_distance_full_all_p90,
  SUM(total_metersperminute_full_all_p90 * count_match) / SUM(count_match) as total_metersperminute_full_all_p90,
  SUM(running_distance_full_all_p90 * count_match) / SUM(count_match) as running_distance_full_all_p90,
  SUM(hsr_distance_full_all_p90 * count_match) / SUM(count_match) as hsr_distance_full_all_p90,
  SUM(hsr_count_full_all_p90 * count_match) / SUM(count_match) as hsr_count_full_all_p90,
  SUM(sprint_distance_full_all_p90 * count_match) / SUM(count_match) as sprint_distance_full_all_p90,
  SUM(sprint_count_full_all_p90 * count_match) / SUM(count_match) as sprint_count_full_all_p90,
  SUM(hi_distance_full_all_p90 * count_match) / SUM(count_match) as hi_distance_full_all_p90,
  SUM(hi_count_full_all_p90 * count_match) / SUM(count_match) as hi_count_full_all_p90,
  SUM(medaccel_count_full_all_p90 * count_match) / SUM(count_match) as medaccel_count_full_all_p90,
  SUM(highaccel_count_full_all_p90 * count_match) / SUM(count_match) as highaccel_count_full_all_p90,
  SUM(meddecel_count_full_all_p90 * count_match) / SUM(count_match) as meddecel_count_full_all_p90,
  SUM(highdecel_count_full_all_p90 * count_match) / SUM(count_match) as highdecel_count_full_all_p90,
  SUM(explacceltohsr_count_full_all_p90 * count_match) / SUM(count_match) as explacceltohsr_count_full_all_p90,
  SUM(explacceltosprint_count_full_all_p90 * count_match) / SUM(count_match) as explacceltosprint_count_full_all_p90,
  SUM(timetohsrpostcod_top3 * count_match) / SUM(count_match) as timetohsrpostcod_top3,
  SUM(timetosprintpostcod_top3 * count_match) / SUM(count_match) as timetosprintpostcod_top3,
  SUM(timeto505around90_top3 * count_match) / SUM(count_match) as timeto505around90_top3,
  SUM(timeto505around180_top3 * count_match) / SUM(count_match) as timeto505around180_top3,
  SUM(cod_count_full_all_p90 * count_match) / SUM(count_match) as cod_count_full_all_p90
FROM physical_p90
GROUP BY 
  player_id, 
  competition_edition_id, 
  team_id, 
  season_id,
  -- Group by the normalized position
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'CF'
    WHEN position = 'RW' THEN 'RW'
    WHEN position = 'LW' THEN 'LW'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'AM'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'CM'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'DM'
    WHEN position IN ('LB', 'LWB') THEN 'LB'
    WHEN position IN ('RB', 'RWB') THEN 'RB'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'CB'
    ELSE position
  END,
  -- Group by position_group
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'Forward'
    WHEN position = 'RW' THEN 'Right Winger'
    WHEN position = 'LW' THEN 'Left Winger'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'Attacking Midfield'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'Central Midfield'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'Defensive Midfield'
    WHEN position IN ('LB', 'LWB') THEN 'Left Fullback'
    WHEN position IN ('RB', 'RWB') THEN 'Right Full Back'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'Center Back'
    ELSE 'Other'
  END;

-- ============================================================================
-- PASSING STATISTICS VIEW
-- ============================================================================
CREATE OR REPLACE VIEW vw_passing_player AS
SELECT 
  player_id,
  competition_edition_id,
  team_id,
  season_id,
  -- Normalized position (e.g., RB for RB/RWB)
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'CF'
    WHEN position = 'RW' THEN 'RW'
    WHEN position = 'LW' THEN 'LW'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'AM'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'CM'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'DM'
    WHEN position IN ('LB', 'LWB') THEN 'LB'
    WHEN position IN ('RB', 'RWB') THEN 'RB'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'CB'
    ELSE position
  END as position,
  -- Position group for analysis
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'Forward'
    WHEN position = 'RW' THEN 'Right Winger'
    WHEN position = 'LW' THEN 'Left Winger'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'Attacking Midfield'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'Central Midfield'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'Defensive Midfield'
    WHEN position IN ('LB', 'LWB') THEN 'Left Fullback'
    WHEN position IN ('RB', 'RWB') THEN 'Right Full Back'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'Center Back'
    ELSE 'Other'
  END as position_group,
  -- Total matches at this position group
  SUM(count_match) as count_match,
  -- Weighted averages for all passing statistical columns
  SUM(count_opportunities_to_pass_to_runs_in_behind_per_match * count_match) / SUM(count_match) as count_opportunities_to_pass_to_runs_in_behind_per_match,
  SUM(count_pass_attempts_to_runs_in_behind_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_runs_in_behind_per_match,
  SUM(pass_opportunities_to_runs_in_behind_threat_per_match * count_match) / SUM(count_match) as pass_opportunities_to_runs_in_behind_threat_per_match,
  SUM(runs_in_behind_to_which_pass_attempted_threat_per_match * count_match) / SUM(count_match) as runs_in_behind_to_which_pass_attempted_threat_per_match,
  SUM(pass_completion_ratio_to_runs_in_behind * count_match) / SUM(count_match) as pass_completion_ratio_to_runs_in_behind,
  SUM(count_runs_in_behind_by_teammate_per_match * count_match) / SUM(count_match) as count_runs_in_behind_by_teammate_per_match,
  SUM(runs_in_behind_to_which_pass_completed_threat_per_match * count_match) / SUM(count_match) as runs_in_behind_to_which_pass_completed_threat_per_match,
  SUM(count_completed_pass_to_runs_in_behind_per_match * count_match) / SUM(count_match) as count_completed_pass_to_runs_in_behind_per_match,
  SUM(count_pass_opportunities_to_dangerous_runs_in_behind_per_match * count_match) / SUM(count_match) as count_pass_opportunities_to_dangerous_runs_in_behind_per_match,
  SUM(count_pass_attempts_to_dangerous_runs_in_behind_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_dangerous_runs_in_behind_per_match,
  SUM(count_completed_pass_to_dangerous_runs_in_behind_per_match * count_match) / SUM(count_match) as count_completed_pass_to_dangerous_runs_in_behind_per_match,
  SUM(count_opportunities_to_pass_to_runs_ahead_of_the_ball_per_match * count_match) / SUM(count_match) as count_opportunities_to_pass_to_runs_ahead_of_the_ball_per_match,
  SUM(count_pass_attempts_to_runs_ahead_of_the_ball_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_runs_ahead_of_the_ball_per_match,
  SUM(pass_opportunities_to_runs_ahead_of_the_ball_threat_per_match * count_match) / SUM(count_match) as pass_opportunities_to_runs_ahead_of_the_ball_threat_per_match,
  SUM(runs_ahead_of_the_ball_to_which_pass_attempted_threat_per_match * count_match) / SUM(count_match) as runs_ahead_of_the_ball_to_which_pass_attempted_threat_per_match,
  SUM(pass_completion_ratio_to_runs_ahead_of_the_ball * count_match) / SUM(count_match) as pass_completion_ratio_to_runs_ahead_of_the_ball,
  SUM(count_runs_ahead_of_the_ball_by_teammate_per_match * count_match) / SUM(count_match) as count_runs_ahead_of_the_ball_by_teammate_per_match,
  SUM(runs_ahead_of_the_ball_to_which_pass_completed_threat_per_match * count_match) / SUM(count_match) as runs_ahead_of_the_ball_to_which_pass_completed_threat_per_match,
  SUM(count_completed_pass_to_runs_ahead_of_the_ball_per_match * count_match) / SUM(count_match) as count_completed_pass_to_runs_ahead_of_the_ball_per_match,
  SUM(count_pass_opportunities_to_dangerous_runs_ahead_of_the_ball_pe * count_match) / SUM(count_match) as count_pass_opportunities_to_dangerous_runs_ahead_of_the_ball_pe,
  SUM(count_pass_attempts_to_dangerous_runs_ahead_of_the_ball_per_mat * count_match) / SUM(count_match) as count_pass_attempts_to_dangerous_runs_ahead_of_the_ball_per_mat,
  SUM(count_opportunities_to_pass_to_support_runs_per_match * count_match) / SUM(count_match) as count_opportunities_to_pass_to_support_runs_per_match,
  SUM(count_pass_attempts_to_support_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_support_runs_per_match,
  SUM(pass_opportunities_to_support_runs_threat_per_match * count_match) / SUM(count_match) as pass_opportunities_to_support_runs_threat_per_match,
  SUM(support_runs_to_which_pass_attempted_threat_per_match * count_match) / SUM(count_match) as support_runs_to_which_pass_attempted_threat_per_match,
  SUM(pass_completion_ratio_to_support_runs * count_match) / SUM(count_match) as pass_completion_ratio_to_support_runs,
  SUM(count_support_runs_by_teammate_per_match * count_match) / SUM(count_match) as count_support_runs_by_teammate_per_match,
  SUM(support_runs_to_which_pass_completed_threat_per_match * count_match) / SUM(count_match) as support_runs_to_which_pass_completed_threat_per_match,
  SUM(count_completed_pass_to_support_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_support_runs_per_match,
  SUM(count_completed_pass_to_support_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_completed_pass_to_support_runs_leading_to_shot_per_match,
  SUM(count_completed_pass_to_support_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_completed_pass_to_support_runs_leading_to_goal_per_match,
  SUM(count_pass_opportunities_to_dangerous_support_runs_per_match * count_match) / SUM(count_match) as count_pass_opportunities_to_dangerous_support_runs_per_match,
  SUM(count_pass_attempts_to_dangerous_support_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_dangerous_support_runs_per_match,
  SUM(count_completed_pass_to_dangerous_support_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_dangerous_support_runs_per_match,
  SUM(count_opportunities_to_pass_to_pulling_wide_runs_per_match * count_match) / SUM(count_match) as count_opportunities_to_pass_to_pulling_wide_runs_per_match,
  SUM(count_pass_attempts_to_pulling_wide_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_pulling_wide_runs_per_match,
  SUM(pass_opportunities_to_pulling_wide_runs_threat_per_match * count_match) / SUM(count_match) as pass_opportunities_to_pulling_wide_runs_threat_per_match,
  SUM(pulling_wide_runs_to_which_pass_attempted_threat_per_match * count_match) / SUM(count_match) as pulling_wide_runs_to_which_pass_attempted_threat_per_match,
  SUM(pass_completion_ratio_to_pulling_wide_runs * count_match) / SUM(count_match) as pass_completion_ratio_to_pulling_wide_runs,
  SUM(count_pulling_wide_runs_by_teammate_per_match * count_match) / SUM(count_match) as count_pulling_wide_runs_by_teammate_per_match,
  SUM(pulling_wide_runs_to_which_pass_completed_threat_per_match * count_match) / SUM(count_match) as pulling_wide_runs_to_which_pass_completed_threat_per_match,
  SUM(count_completed_pass_to_pulling_wide_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_pulling_wide_runs_per_match,
  SUM(count_pass_opportunities_to_dangerous_pulling_wide_runs_per_mat * count_match) / SUM(count_match) as count_pass_opportunities_to_dangerous_pulling_wide_runs_per_mat,
  SUM(count_pass_attempts_to_dangerous_pulling_wide_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_dangerous_pulling_wide_runs_per_match,
  SUM(count_completed_pass_to_dangerous_pulling_wide_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_dangerous_pulling_wide_runs_per_match,
  SUM(count_opportunities_to_pass_to_coming_short_runs_per_match * count_match) / SUM(count_match) as count_opportunities_to_pass_to_coming_short_runs_per_match,
  SUM(count_pass_attempts_to_coming_short_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_coming_short_runs_per_match,
  SUM(pass_opportunities_to_coming_short_runs_threat_per_match * count_match) / SUM(count_match) as pass_opportunities_to_coming_short_runs_threat_per_match,
  SUM(coming_short_runs_to_which_pass_attempted_threat_per_match * count_match) / SUM(count_match) as coming_short_runs_to_which_pass_attempted_threat_per_match,
  SUM(pass_completion_ratio_to_coming_short_runs * count_match) / SUM(count_match) as pass_completion_ratio_to_coming_short_runs,
  SUM(count_coming_short_runs_by_teammate_per_match * count_match) / SUM(count_match) as count_coming_short_runs_by_teammate_per_match,
  SUM(coming_short_runs_to_which_pass_completed_threat_per_match * count_match) / SUM(count_match) as coming_short_runs_to_which_pass_completed_threat_per_match,
  SUM(count_completed_pass_to_coming_short_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_coming_short_runs_per_match,
  SUM(count_pass_opportunities_to_dangerous_coming_short_runs_per_mat * count_match) / SUM(count_match) as count_pass_opportunities_to_dangerous_coming_short_runs_per_mat,
  SUM(count_pass_attempts_to_dangerous_coming_short_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_dangerous_coming_short_runs_per_match,
  SUM(count_completed_pass_to_dangerous_coming_short_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_dangerous_coming_short_runs_per_match,
  SUM(count_opportunities_to_pass_to_underlap_runs_per_match * count_match) / SUM(count_match) as count_opportunities_to_pass_to_underlap_runs_per_match,
  SUM(count_pass_attempts_to_underlap_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_underlap_runs_per_match,
  SUM(pass_opportunities_to_underlap_runs_threat_per_match * count_match) / SUM(count_match) as pass_opportunities_to_underlap_runs_threat_per_match,
  SUM(underlap_runs_to_which_pass_attempted_threat_per_match * count_match) / SUM(count_match) as underlap_runs_to_which_pass_attempted_threat_per_match,
  SUM(pass_completion_ratio_to_underlap_runs * count_match) / SUM(count_match) as pass_completion_ratio_to_underlap_runs,
  SUM(count_underlap_runs_by_teammate_per_match * count_match) / SUM(count_match) as count_underlap_runs_by_teammate_per_match,
  SUM(underlap_runs_to_which_pass_completed_threat_per_match * count_match) / SUM(count_match) as underlap_runs_to_which_pass_completed_threat_per_match,
  SUM(count_completed_pass_to_underlap_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_underlap_runs_per_match,
  SUM(count_completed_pass_to_underlap_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_completed_pass_to_underlap_runs_leading_to_shot_per_match,
  SUM(count_completed_pass_to_underlap_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_completed_pass_to_underlap_runs_leading_to_goal_per_match,
  SUM(count_pass_opportunities_to_dangerous_underlap_runs_per_match * count_match) / SUM(count_match) as count_pass_opportunities_to_dangerous_underlap_runs_per_match,
  SUM(count_pass_attempts_to_dangerous_underlap_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_dangerous_underlap_runs_per_match,
  SUM(count_completed_pass_to_dangerous_underlap_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_dangerous_underlap_runs_per_match,
  SUM(count_opportunities_to_pass_to_overlap_runs_per_match * count_match) / SUM(count_match) as count_opportunities_to_pass_to_overlap_runs_per_match,
  SUM(count_pass_attempts_to_overlap_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_overlap_runs_per_match,
  SUM(pass_opportunities_to_overlap_runs_threat_per_match * count_match) / SUM(count_match) as pass_opportunities_to_overlap_runs_threat_per_match,
  SUM(overlap_runs_to_which_pass_attempted_threat_per_match * count_match) / SUM(count_match) as overlap_runs_to_which_pass_attempted_threat_per_match,
  SUM(pass_completion_ratio_to_overlap_runs * count_match) / SUM(count_match) as pass_completion_ratio_to_overlap_runs,
  SUM(count_overlap_runs_by_teammate_per_match * count_match) / SUM(count_match) as count_overlap_runs_by_teammate_per_match,
  SUM(overlap_runs_to_which_pass_completed_threat_per_match * count_match) / SUM(count_match) as overlap_runs_to_which_pass_completed_threat_per_match,
  SUM(count_completed_pass_to_overlap_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_overlap_runs_per_match,
  SUM(count_completed_pass_to_overlap_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_completed_pass_to_overlap_runs_leading_to_shot_per_match,
  SUM(count_completed_pass_to_overlap_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_completed_pass_to_overlap_runs_leading_to_goal_per_match,
  SUM(count_pass_opportunities_to_dangerous_overlap_runs_per_match * count_match) / SUM(count_match) as count_pass_opportunities_to_dangerous_overlap_runs_per_match,
  SUM(count_pass_attempts_to_dangerous_overlap_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_dangerous_overlap_runs_per_match,
  SUM(count_completed_pass_to_dangerous_overlap_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_dangerous_overlap_runs_per_match,
  SUM(count_opportunities_to_pass_to_dropping_off_runs_per_match * count_match) / SUM(count_match) as count_opportunities_to_pass_to_dropping_off_runs_per_match,
  SUM(count_pass_attempts_to_dropping_off_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_dropping_off_runs_per_match,
  SUM(pass_opportunities_to_dropping_off_runs_threat_per_match * count_match) / SUM(count_match) as pass_opportunities_to_dropping_off_runs_threat_per_match,
  SUM(dropping_off_runs_to_which_pass_attempted_threat_per_match * count_match) / SUM(count_match) as dropping_off_runs_to_which_pass_attempted_threat_per_match,
  SUM(pass_completion_ratio_to_dropping_off_runs * count_match) / SUM(count_match) as pass_completion_ratio_to_dropping_off_runs,
  SUM(count_dropping_off_runs_by_teammate_per_match * count_match) / SUM(count_match) as count_dropping_off_runs_by_teammate_per_match,
  SUM(dropping_off_runs_to_which_pass_completed_threat_per_match * count_match) / SUM(count_match) as dropping_off_runs_to_which_pass_completed_threat_per_match,
  SUM(count_completed_pass_to_dropping_off_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_dropping_off_runs_per_match,
  SUM(count_pass_opportunities_to_dangerous_dropping_off_runs_per_mat * count_match) / SUM(count_match) as count_pass_opportunities_to_dangerous_dropping_off_runs_per_mat,
  SUM(count_pass_attempts_to_dangerous_dropping_off_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_dangerous_dropping_off_runs_per_match,
  SUM(count_completed_pass_to_dangerous_dropping_off_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_dangerous_dropping_off_runs_per_match,
  SUM(count_opportunities_to_pass_to_pulling_half_space_runs_per_matc * count_match) / SUM(count_match) as count_opportunities_to_pass_to_pulling_half_space_runs_per_matc,
  SUM(count_pass_attempts_to_pulling_half_space_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_pulling_half_space_runs_per_match,
  SUM(pass_opportunities_to_pulling_half_space_runs_threat_per_match * count_match) / SUM(count_match) as pass_opportunities_to_pulling_half_space_runs_threat_per_match,
  SUM(pulling_half_space_runs_to_which_pass_attempted_threat_per_matc * count_match) / SUM(count_match) as pulling_half_space_runs_to_which_pass_attempted_threat_per_matc,
  SUM(pass_completion_ratio_to_pulling_half_space_runs * count_match) / SUM(count_match) as pass_completion_ratio_to_pulling_half_space_runs,
  SUM(count_pulling_half_space_runs_by_teammate_per_match * count_match) / SUM(count_match) as count_pulling_half_space_runs_by_teammate_per_match,
  SUM(pulling_half_space_runs_to_which_pass_completed_threat_per_matc * count_match) / SUM(count_match) as pulling_half_space_runs_to_which_pass_completed_threat_per_matc,
  SUM(count_completed_pass_to_pulling_half_space_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_pulling_half_space_runs_per_match,
  SUM(count_pass_opportunities_to_dangerous_pulling_half_space_runs_p * count_match) / SUM(count_match) as count_pass_opportunities_to_dangerous_pulling_half_space_runs_p,
  SUM(count_pass_attempts_to_dangerous_pulling_half_space_runs_per_ma * count_match) / SUM(count_match) as count_pass_attempts_to_dangerous_pulling_half_space_runs_per_ma,
  SUM(count_opportunities_to_pass_to_cross_receiver_runs_per_match * count_match) / SUM(count_match) as count_opportunities_to_pass_to_cross_receiver_runs_per_match,
  SUM(count_pass_attempts_to_cross_receiver_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_cross_receiver_runs_per_match,
  SUM(pass_opportunities_to_cross_receiver_runs_threat_per_match * count_match) / SUM(count_match) as pass_opportunities_to_cross_receiver_runs_threat_per_match,
  SUM(cross_receiver_runs_to_which_pass_attempted_threat_per_match * count_match) / SUM(count_match) as cross_receiver_runs_to_which_pass_attempted_threat_per_match,
  SUM(pass_completion_ratio_to_cross_receiver_runs * count_match) / SUM(count_match) as pass_completion_ratio_to_cross_receiver_runs,
  SUM(count_cross_receiver_runs_by_teammate_per_match * count_match) / SUM(count_match) as count_cross_receiver_runs_by_teammate_per_match,
  SUM(cross_receiver_runs_to_which_pass_completed_threat_per_match * count_match) / SUM(count_match) as cross_receiver_runs_to_which_pass_completed_threat_per_match,
  SUM(count_completed_pass_to_cross_receiver_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_cross_receiver_runs_per_match,
  SUM(count_pass_opportunities_to_dangerous_cross_receiver_runs_per_m * count_match) / SUM(count_match) as count_pass_opportunities_to_dangerous_cross_receiver_runs_per_m,
  SUM(count_pass_attempts_to_dangerous_cross_receiver_runs_per_match * count_match) / SUM(count_match) as count_pass_attempts_to_dangerous_cross_receiver_runs_per_match,
  SUM(count_completed_pass_to_dangerous_cross_receiver_runs_per_match * count_match) / SUM(count_match) as count_completed_pass_to_dangerous_cross_receiver_runs_per_match
FROM passing_pmatch
GROUP BY 
  player_id, 
  competition_edition_id, 
  team_id, 
  season_id,
  -- Group by the normalized position
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'CF'
    WHEN position = 'RW' THEN 'RW'
    WHEN position = 'LW' THEN 'LW'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'AM'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'CM'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'DM'
    WHEN position IN ('LB', 'LWB') THEN 'LB'
    WHEN position IN ('RB', 'RWB') THEN 'RB'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'CB'
    ELSE position
  END,
  -- Group by position_group
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'Forward'
    WHEN position = 'RW' THEN 'Right Winger'
    WHEN position = 'LW' THEN 'Left Winger'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'Attacking Midfield'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'Central Midfield'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'Defensive Midfield'
    WHEN position IN ('LB', 'LWB') THEN 'Left Fullback'
    WHEN position IN ('RB', 'RWB') THEN 'Right Full Back'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'Center Back'
    ELSE 'Other'
  END;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check a sample player who played multiple positions in physical view
SELECT * FROM vw_physical_player 
WHERE player_id IN (
  SELECT player_id 
  FROM physical_p90 
  GROUP BY player_id 
  HAVING COUNT(DISTINCT position) > 1
  LIMIT 1
)
ORDER BY position_group, count_match DESC;

-- Check a sample player who played multiple positions in passing view
SELECT * FROM vw_passing_player 
WHERE player_id IN (
  SELECT player_id 
  FROM passing_pmatch 
  GROUP BY player_id 
  HAVING COUNT(DISTINCT position) > 1
  LIMIT 1
)
ORDER BY position_group, count_match DESC;

-- ============================================================================
-- PRESSURES STATISTICS VIEW
-- ============================================================================
CREATE OR REPLACE VIEW vw_pressures_player AS
SELECT 
  player_id,
  competition_edition_id,
  team_id,
  season_id,
  -- Normalized position (e.g., RB for RB/RWB)
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'CF'
    WHEN position = 'RW' THEN 'RW'
    WHEN position = 'LW' THEN 'LW'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'AM'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'CM'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'DM'
    WHEN position IN ('LB', 'LWB') THEN 'LB'
    WHEN position IN ('RB', 'RWB') THEN 'RB'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'CB'
    ELSE position
  END as position,
  -- Position group for analysis
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'Forward'
    WHEN position = 'RW' THEN 'Right Winger'
    WHEN position = 'LW' THEN 'Left Winger'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'Attacking Midfield'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'Central Midfield'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'Defensive Midfield'
    WHEN position IN ('LB', 'LWB') THEN 'Left Fullback'
    WHEN position IN ('RB', 'RWB') THEN 'Right Full Back'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'Center Back'
    ELSE 'Other'
  END as position_group,
  -- Total matches at this position group
  SUM(count_match) as count_match,
  -- Weighted averages for all pressure statistical columns
  SUM(count_low_pressures_received_per_match * count_match) / SUM(count_match) as count_low_pressures_received_per_match,
  SUM(count_forced_losses_under_low_pressure_per_match * count_match) / SUM(count_match) as count_forced_losses_under_low_pressure_per_match,
  SUM(count_ball_retentions_under_low_pressure_per_match * count_match) / SUM(count_match) as count_ball_retentions_under_low_pressure_per_match,
  SUM(ball_retention_ratio_under_low_pressure * count_match) / SUM(count_match) as ball_retention_ratio_under_low_pressure,
  SUM(pass_completion_ratio_under_low_pressure * count_match) / SUM(count_match) as pass_completion_ratio_under_low_pressure,
  SUM(count_pass_attempts_under_low_pressure_per_match * count_match) / SUM(count_match) as count_pass_attempts_under_low_pressure_per_match,
  SUM(count_completed_passes_under_low_pressure_per_match * count_match) / SUM(count_match) as count_completed_passes_under_low_pressure_per_match,
  SUM(count_dangerous_pass_attempts_under_low_pressure_per_match * count_match) / SUM(count_match) as count_dangerous_pass_attempts_under_low_pressure_per_match,
  SUM(count_completed_dangerous_passes_under_low_pressure_per_match * count_match) / SUM(count_match) as count_completed_dangerous_passes_under_low_pressure_per_match,
  SUM(dangerous_pass_completion_ratio_under_low_pressure * count_match) / SUM(count_match) as dangerous_pass_completion_ratio_under_low_pressure,
  SUM(count_difficult_pass_attempts_under_low_pressure_per_match * count_match) / SUM(count_match) as count_difficult_pass_attempts_under_low_pressure_per_match,
  SUM(count_completed_difficult_passes_under_low_pressure_per_match * count_match) / SUM(count_match) as count_completed_difficult_passes_under_low_pressure_per_match,
  SUM(difficult_pass_completion_ratio_under_low_pressure * count_match) / SUM(count_match) as difficult_pass_completion_ratio_under_low_pressure,
  SUM(count_medium_pressures_received_per_match * count_match) / SUM(count_match) as count_medium_pressures_received_per_match,
  SUM(count_forced_losses_under_medium_pressure_per_match * count_match) / SUM(count_match) as count_forced_losses_under_medium_pressure_per_match,
  SUM(count_ball_retentions_under_medium_pressure_per_match * count_match) / SUM(count_match) as count_ball_retentions_under_medium_pressure_per_match,
  SUM(ball_retention_ratio_under_medium_pressure * count_match) / SUM(count_match) as ball_retention_ratio_under_medium_pressure,
  SUM(pass_completion_ratio_under_medium_pressure * count_match) / SUM(count_match) as pass_completion_ratio_under_medium_pressure,
  SUM(count_pass_attempts_under_medium_pressure_per_match * count_match) / SUM(count_match) as count_pass_attempts_under_medium_pressure_per_match,
  SUM(count_completed_passes_under_medium_pressure_per_match * count_match) / SUM(count_match) as count_completed_passes_under_medium_pressure_per_match,
  SUM(count_dangerous_pass_attempts_under_medium_pressure_per_match * count_match) / SUM(count_match) as count_dangerous_pass_attempts_under_medium_pressure_per_match,
  SUM(dangerous_pass_completion_ratio_under_medium_pressure * count_match) / SUM(count_match) as dangerous_pass_completion_ratio_under_medium_pressure,
  SUM(count_difficult_pass_attempts_under_medium_pressure_per_match * count_match) / SUM(count_match) as count_difficult_pass_attempts_under_medium_pressure_per_match,
  SUM(difficult_pass_completion_ratio_under_medium_pressure * count_match) / SUM(count_match) as difficult_pass_completion_ratio_under_medium_pressure,
  SUM(count_high_pressures_received_per_match * count_match) / SUM(count_match) as count_high_pressures_received_per_match,
  SUM(count_forced_losses_under_high_pressure_per_match * count_match) / SUM(count_match) as count_forced_losses_under_high_pressure_per_match,
  SUM(count_ball_retentions_under_high_pressure_per_match * count_match) / SUM(count_match) as count_ball_retentions_under_high_pressure_per_match,
  SUM(ball_retention_ratio_under_high_pressure * count_match) / SUM(count_match) as ball_retention_ratio_under_high_pressure,
  SUM(pass_completion_ratio_under_high_pressure * count_match) / SUM(count_match) as pass_completion_ratio_under_high_pressure,
  SUM(count_pass_attempts_under_high_pressure_per_match * count_match) / SUM(count_match) as count_pass_attempts_under_high_pressure_per_match,
  SUM(count_completed_passes_under_high_pressure_per_match * count_match) / SUM(count_match) as count_completed_passes_under_high_pressure_per_match,
  SUM(count_dangerous_pass_attempts_under_high_pressure_per_match * count_match) / SUM(count_match) as count_dangerous_pass_attempts_under_high_pressure_per_match,
  SUM(count_completed_dangerous_passes_under_high_pressure_per_match * count_match) / SUM(count_match) as count_completed_dangerous_passes_under_high_pressure_per_match,
  SUM(dangerous_pass_completion_ratio_under_high_pressure * count_match) / SUM(count_match) as dangerous_pass_completion_ratio_under_high_pressure,
  SUM(count_difficult_pass_attempts_under_high_pressure_per_match * count_match) / SUM(count_match) as count_difficult_pass_attempts_under_high_pressure_per_match,
  SUM(count_completed_difficult_passes_under_high_pressure_per_match * count_match) / SUM(count_match) as count_completed_difficult_passes_under_high_pressure_per_match,
  SUM(difficult_pass_completion_ratio_under_high_pressure * count_match) / SUM(count_match) as difficult_pass_completion_ratio_under_high_pressure
FROM on_ball_pressures_pmatch
GROUP BY 
  player_id, 
  competition_edition_id, 
  team_id, 
  season_id,
  -- Group by the normalized position
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'CF'
    WHEN position = 'RW' THEN 'RW'
    WHEN position = 'LW' THEN 'LW'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'AM'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'CM'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'DM'
    WHEN position IN ('LB', 'LWB') THEN 'LB'
    WHEN position IN ('RB', 'RWB') THEN 'RB'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'CB'
    ELSE position
  END,
  -- Group by position_group
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'Forward'
    WHEN position = 'RW' THEN 'Right Winger'
    WHEN position = 'LW' THEN 'Left Winger'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'Attacking Midfield'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'Central Midfield'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'Defensive Midfield'
    WHEN position IN ('LB', 'LWB') THEN 'Left Fullback'
    WHEN position IN ('RB', 'RWB') THEN 'Right Full Back'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'Center Back'
    ELSE 'Other'
  END;

-- Check a sample player who played multiple positions in pressures view
SELECT * FROM vw_pressures_player 
WHERE player_id IN (
  SELECT player_id 
  FROM on_ball_pressures_pmatch 
  GROUP BY player_id 
  HAVING COUNT(DISTINCT position) > 1
  LIMIT 1
)
ORDER BY position_group, count_match DESC;

-- ============================================================================
-- OFF-BALL RUNS STATISTICS VIEW
-- ============================================================================
CREATE OR REPLACE VIEW vw_runs_player AS
SELECT 
  player_id,
  competition_edition_id,
  team_id,
  season_id,
  -- Normalized position (e.g., RB for RB/RWB)
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'CF'
    WHEN position = 'RW' THEN 'RW'
    WHEN position = 'LW' THEN 'LW'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'AM'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'CM'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'DM'
    WHEN position IN ('LB', 'LWB') THEN 'LB'
    WHEN position IN ('RB', 'RWB') THEN 'RB'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'CB'
    ELSE position
  END as position,
  -- Position group for analysis
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'Forward'
    WHEN position = 'RW' THEN 'Right Winger'
    WHEN position = 'LW' THEN 'Left Winger'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'Attacking Midfield'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'Central Midfield'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'Defensive Midfield'
    WHEN position IN ('LB', 'LWB') THEN 'Left Fullback'
    WHEN position IN ('RB', 'RWB') THEN 'Right Full Back'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'Center Back'
    ELSE 'Other'
  END as position_group,
  -- Total matches at this position group
  SUM(count_match) as count_match,
  -- Weighted averages for all off-ball runs statistical columns
  SUM(count_runs_in_behind_per_match * count_match) / SUM(count_match) as count_runs_in_behind_per_match,
  SUM(count_dangerous_runs_in_behind_per_match * count_match) / SUM(count_match) as count_dangerous_runs_in_behind_per_match,
  SUM(runs_in_behind_threat_per_match * count_match) / SUM(count_match) as runs_in_behind_threat_per_match,
  SUM(count_runs_in_behind_leading_to_goal_per_match * count_match) / SUM(count_match) as count_runs_in_behind_leading_to_goal_per_match,
  SUM(count_runs_in_behind_targeted_per_match * count_match) / SUM(count_match) as count_runs_in_behind_targeted_per_match,
  SUM(count_runs_in_behind_received_per_match * count_match) / SUM(count_match) as count_runs_in_behind_received_per_match,
  SUM(count_runs_in_behind_leading_to_shot_per_match * count_match) / SUM(count_match) as count_runs_in_behind_leading_to_shot_per_match,
  SUM(runs_in_behind_targeted_threat_per_match * count_match) / SUM(count_match) as runs_in_behind_targeted_threat_per_match,
  SUM(runs_in_behind_received_threat_per_match * count_match) / SUM(count_match) as runs_in_behind_received_threat_per_match,
  SUM(count_dangerous_runs_in_behind_targeted_per_match * count_match) / SUM(count_match) as count_dangerous_runs_in_behind_targeted_per_match,
  SUM(count_dangerous_runs_in_behind_received_per_match * count_match) / SUM(count_match) as count_dangerous_runs_in_behind_received_per_match,
  SUM(count_runs_ahead_of_the_ball_per_match * count_match) / SUM(count_match) as count_runs_ahead_of_the_ball_per_match,
  SUM(count_dangerous_runs_ahead_of_the_ball_per_match * count_match) / SUM(count_match) as count_dangerous_runs_ahead_of_the_ball_per_match,
  SUM(runs_ahead_of_the_ball_threat_per_match * count_match) / SUM(count_match) as runs_ahead_of_the_ball_threat_per_match,
  SUM(count_runs_ahead_of_the_ball_leading_to_goal_per_match * count_match) / SUM(count_match) as count_runs_ahead_of_the_ball_leading_to_goal_per_match,
  SUM(count_runs_ahead_of_the_ball_targeted_per_match * count_match) / SUM(count_match) as count_runs_ahead_of_the_ball_targeted_per_match,
  SUM(count_runs_ahead_of_the_ball_received_per_match * count_match) / SUM(count_match) as count_runs_ahead_of_the_ball_received_per_match,
  SUM(count_runs_ahead_of_the_ball_leading_to_shot_per_match * count_match) / SUM(count_match) as count_runs_ahead_of_the_ball_leading_to_shot_per_match,
  SUM(runs_ahead_of_the_ball_targeted_threat_per_match * count_match) / SUM(count_match) as runs_ahead_of_the_ball_targeted_threat_per_match,
  SUM(runs_ahead_of_the_ball_received_threat_per_match * count_match) / SUM(count_match) as runs_ahead_of_the_ball_received_threat_per_match,
  SUM(count_dangerous_runs_ahead_of_the_ball_targeted_per_match * count_match) / SUM(count_match) as count_dangerous_runs_ahead_of_the_ball_targeted_per_match,
  SUM(count_dangerous_runs_ahead_of_the_ball_received_per_match * count_match) / SUM(count_match) as count_dangerous_runs_ahead_of_the_ball_received_per_match,
  SUM(count_support_runs_per_match * count_match) / SUM(count_match) as count_support_runs_per_match,
  SUM(count_dangerous_support_runs_per_match * count_match) / SUM(count_match) as count_dangerous_support_runs_per_match,
  SUM(support_runs_threat_per_match * count_match) / SUM(count_match) as support_runs_threat_per_match,
  SUM(count_support_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_support_runs_leading_to_goal_per_match,
  SUM(count_support_runs_targeted_per_match * count_match) / SUM(count_match) as count_support_runs_targeted_per_match,
  SUM(count_support_runs_received_per_match * count_match) / SUM(count_match) as count_support_runs_received_per_match,
  SUM(count_support_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_support_runs_leading_to_shot_per_match,
  SUM(support_runs_targeted_threat_per_match * count_match) / SUM(count_match) as support_runs_targeted_threat_per_match,
  SUM(support_runs_received_threat_per_match * count_match) / SUM(count_match) as support_runs_received_threat_per_match,
  SUM(count_dangerous_support_runs_targeted_per_match * count_match) / SUM(count_match) as count_dangerous_support_runs_targeted_per_match,
  SUM(count_dangerous_support_runs_received_per_match * count_match) / SUM(count_match) as count_dangerous_support_runs_received_per_match,
  SUM(count_pulling_wide_runs_per_match * count_match) / SUM(count_match) as count_pulling_wide_runs_per_match,
  SUM(count_dangerous_pulling_wide_runs_per_match * count_match) / SUM(count_match) as count_dangerous_pulling_wide_runs_per_match,
  SUM(pulling_wide_runs_threat_per_match * count_match) / SUM(count_match) as pulling_wide_runs_threat_per_match,
  SUM(count_pulling_wide_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_pulling_wide_runs_leading_to_goal_per_match,
  SUM(count_pulling_wide_runs_targeted_per_match * count_match) / SUM(count_match) as count_pulling_wide_runs_targeted_per_match,
  SUM(count_pulling_wide_runs_received_per_match * count_match) / SUM(count_match) as count_pulling_wide_runs_received_per_match,
  SUM(count_pulling_wide_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_pulling_wide_runs_leading_to_shot_per_match,
  SUM(pulling_wide_runs_targeted_threat_per_match * count_match) / SUM(count_match) as pulling_wide_runs_targeted_threat_per_match,
  SUM(pulling_wide_runs_received_threat_per_match * count_match) / SUM(count_match) as pulling_wide_runs_received_threat_per_match,
  SUM(count_dangerous_pulling_wide_runs_targeted_per_match * count_match) / SUM(count_match) as count_dangerous_pulling_wide_runs_targeted_per_match,
  SUM(count_dangerous_pulling_wide_runs_received_per_match * count_match) / SUM(count_match) as count_dangerous_pulling_wide_runs_received_per_match,
  SUM(count_coming_short_runs_per_match * count_match) / SUM(count_match) as count_coming_short_runs_per_match,
  SUM(count_dangerous_coming_short_runs_per_match * count_match) / SUM(count_match) as count_dangerous_coming_short_runs_per_match,
  SUM(coming_short_runs_threat_per_match * count_match) / SUM(count_match) as coming_short_runs_threat_per_match,
  SUM(count_coming_short_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_coming_short_runs_leading_to_goal_per_match,
  SUM(count_coming_short_runs_targeted_per_match * count_match) / SUM(count_match) as count_coming_short_runs_targeted_per_match,
  SUM(count_coming_short_runs_received_per_match * count_match) / SUM(count_match) as count_coming_short_runs_received_per_match,
  SUM(count_coming_short_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_coming_short_runs_leading_to_shot_per_match,
  SUM(coming_short_runs_targeted_threat_per_match * count_match) / SUM(count_match) as coming_short_runs_targeted_threat_per_match,
  SUM(coming_short_runs_received_threat_per_match * count_match) / SUM(count_match) as coming_short_runs_received_threat_per_match,
  SUM(count_dangerous_coming_short_runs_targeted_per_match * count_match) / SUM(count_match) as count_dangerous_coming_short_runs_targeted_per_match,
  SUM(count_dangerous_coming_short_runs_received_per_match * count_match) / SUM(count_match) as count_dangerous_coming_short_runs_received_per_match,
  SUM(count_underlap_runs_per_match * count_match) / SUM(count_match) as count_underlap_runs_per_match,
  SUM(count_dangerous_underlap_runs_per_match * count_match) / SUM(count_match) as count_dangerous_underlap_runs_per_match,
  SUM(underlap_runs_threat_per_match * count_match) / SUM(count_match) as underlap_runs_threat_per_match,
  SUM(count_underlap_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_underlap_runs_leading_to_goal_per_match,
  SUM(count_underlap_runs_targeted_per_match * count_match) / SUM(count_match) as count_underlap_runs_targeted_per_match,
  SUM(count_underlap_runs_received_per_match * count_match) / SUM(count_match) as count_underlap_runs_received_per_match,
  SUM(count_underlap_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_underlap_runs_leading_to_shot_per_match,
  SUM(underlap_runs_targeted_threat_per_match * count_match) / SUM(count_match) as underlap_runs_targeted_threat_per_match,
  SUM(underlap_runs_received_threat_per_match * count_match) / SUM(count_match) as underlap_runs_received_threat_per_match,
  SUM(count_dangerous_underlap_runs_targeted_per_match * count_match) / SUM(count_match) as count_dangerous_underlap_runs_targeted_per_match,
  SUM(count_dangerous_underlap_runs_received_per_match * count_match) / SUM(count_match) as count_dangerous_underlap_runs_received_per_match,
  SUM(count_overlap_runs_per_match * count_match) / SUM(count_match) as count_overlap_runs_per_match,
  SUM(count_dangerous_overlap_runs_per_match * count_match) / SUM(count_match) as count_dangerous_overlap_runs_per_match,
  SUM(overlap_runs_threat_per_match * count_match) / SUM(count_match) as overlap_runs_threat_per_match,
  SUM(count_overlap_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_overlap_runs_leading_to_goal_per_match,
  SUM(count_overlap_runs_targeted_per_match * count_match) / SUM(count_match) as count_overlap_runs_targeted_per_match,
  SUM(count_overlap_runs_received_per_match * count_match) / SUM(count_match) as count_overlap_runs_received_per_match,
  SUM(count_overlap_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_overlap_runs_leading_to_shot_per_match,
  SUM(overlap_runs_targeted_threat_per_match * count_match) / SUM(count_match) as overlap_runs_targeted_threat_per_match,
  SUM(overlap_runs_received_threat_per_match * count_match) / SUM(count_match) as overlap_runs_received_threat_per_match,
  SUM(count_dangerous_overlap_runs_targeted_per_match * count_match) / SUM(count_match) as count_dangerous_overlap_runs_targeted_per_match,
  SUM(count_dangerous_overlap_runs_received_per_match * count_match) / SUM(count_match) as count_dangerous_overlap_runs_received_per_match,
  SUM(count_dropping_off_runs_per_match * count_match) / SUM(count_match) as count_dropping_off_runs_per_match,
  SUM(count_dangerous_dropping_off_runs_per_match * count_match) / SUM(count_match) as count_dangerous_dropping_off_runs_per_match,
  SUM(dropping_off_runs_threat_per_match * count_match) / SUM(count_match) as dropping_off_runs_threat_per_match,
  SUM(count_dropping_off_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_dropping_off_runs_leading_to_goal_per_match,
  SUM(count_dropping_off_runs_targeted_per_match * count_match) / SUM(count_match) as count_dropping_off_runs_targeted_per_match,
  SUM(count_dropping_off_runs_received_per_match * count_match) / SUM(count_match) as count_dropping_off_runs_received_per_match,
  SUM(count_dropping_off_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_dropping_off_runs_leading_to_shot_per_match,
  SUM(dropping_off_runs_targeted_threat_per_match * count_match) / SUM(count_match) as dropping_off_runs_targeted_threat_per_match,
  SUM(dropping_off_runs_received_threat_per_match * count_match) / SUM(count_match) as dropping_off_runs_received_threat_per_match,
  SUM(count_dangerous_dropping_off_runs_targeted_per_match * count_match) / SUM(count_match) as count_dangerous_dropping_off_runs_targeted_per_match,
  SUM(count_dangerous_dropping_off_runs_received_per_match * count_match) / SUM(count_match) as count_dangerous_dropping_off_runs_received_per_match,
  SUM(count_pulling_half_space_runs_per_match * count_match) / SUM(count_match) as count_pulling_half_space_runs_per_match,
  SUM(count_dangerous_pulling_half_space_runs_per_match * count_match) / SUM(count_match) as count_dangerous_pulling_half_space_runs_per_match,
  SUM(pulling_half_space_runs_threat_per_match * count_match) / SUM(count_match) as pulling_half_space_runs_threat_per_match,
  SUM(count_pulling_half_space_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_pulling_half_space_runs_leading_to_goal_per_match,
  SUM(count_pulling_half_space_runs_targeted_per_match * count_match) / SUM(count_match) as count_pulling_half_space_runs_targeted_per_match,
  SUM(count_pulling_half_space_runs_received_per_match * count_match) / SUM(count_match) as count_pulling_half_space_runs_received_per_match,
  SUM(count_pulling_half_space_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_pulling_half_space_runs_leading_to_shot_per_match,
  SUM(pulling_half_space_runs_targeted_threat_per_match * count_match) / SUM(count_match) as pulling_half_space_runs_targeted_threat_per_match,
  SUM(pulling_half_space_runs_received_threat_per_match * count_match) / SUM(count_match) as pulling_half_space_runs_received_threat_per_match,
  SUM(count_dangerous_pulling_half_space_runs_targeted_per_match * count_match) / SUM(count_match) as count_dangerous_pulling_half_space_runs_targeted_per_match,
  SUM(count_dangerous_pulling_half_space_runs_received_per_match * count_match) / SUM(count_match) as count_dangerous_pulling_half_space_runs_received_per_match,
  SUM(count_cross_receiver_runs_per_match * count_match) / SUM(count_match) as count_cross_receiver_runs_per_match,
  SUM(count_dangerous_cross_receiver_runs_per_match * count_match) / SUM(count_match) as count_dangerous_cross_receiver_runs_per_match,
  SUM(cross_receiver_runs_threat_per_match * count_match) / SUM(count_match) as cross_receiver_runs_threat_per_match,
  SUM(count_cross_receiver_runs_leading_to_goal_per_match * count_match) / SUM(count_match) as count_cross_receiver_runs_leading_to_goal_per_match,
  SUM(count_cross_receiver_runs_targeted_per_match * count_match) / SUM(count_match) as count_cross_receiver_runs_targeted_per_match,
  SUM(count_cross_receiver_runs_received_per_match * count_match) / SUM(count_match) as count_cross_receiver_runs_received_per_match,
  SUM(count_cross_receiver_runs_leading_to_shot_per_match * count_match) / SUM(count_match) as count_cross_receiver_runs_leading_to_shot_per_match,
  SUM(cross_receiver_runs_targeted_threat_per_match * count_match) / SUM(count_match) as cross_receiver_runs_targeted_threat_per_match,
  SUM(cross_receiver_runs_received_threat_per_match * count_match) / SUM(count_match) as cross_receiver_runs_received_threat_per_match,
  SUM(count_dangerous_cross_receiver_runs_targeted_per_match * count_match) / SUM(count_match) as count_dangerous_cross_receiver_runs_targeted_per_match,
  SUM(count_dangerous_cross_receiver_runs_received_per_match * count_match) / SUM(count_match) as count_dangerous_cross_receiver_runs_received_per_match
FROM off_ball_runs_pmatch
GROUP BY 
  player_id, 
  competition_edition_id, 
  team_id, 
  season_id,
  -- Group by the normalized position
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'CF'
    WHEN position = 'RW' THEN 'RW'
    WHEN position = 'LW' THEN 'LW'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'AM'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'CM'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'DM'
    WHEN position IN ('LB', 'LWB') THEN 'LB'
    WHEN position IN ('RB', 'RWB') THEN 'RB'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'CB'
    ELSE position
  END,
  -- Group by position_group
  CASE 
    WHEN position IN ('RF', 'LF', 'CF') THEN 'Forward'
    WHEN position = 'RW' THEN 'Right Winger'
    WHEN position = 'LW' THEN 'Left Winger'
    WHEN position IN ('LAM', 'RAM', 'AM') THEN 'Attacking Midfield'
    WHEN position IN ('LCM', 'RCM', 'RM', 'LM', 'CM') THEN 'Central Midfield'
    WHEN position IN ('LDM', 'RDM', 'DM') THEN 'Defensive Midfield'
    WHEN position IN ('LB', 'LWB') THEN 'Left Fullback'
    WHEN position IN ('RB', 'RWB') THEN 'Right Full Back'
    WHEN position IN ('LCB', 'RCB', 'CB') THEN 'Center Back'
    ELSE 'Other'
  END;

-- Check a sample player who played multiple positions in runs view
SELECT * FROM vw_runs_player 
WHERE player_id IN (
  SELECT player_id 
  FROM off_ball_runs_pmatch 
  GROUP BY player_id 
  HAVING COUNT(DISTINCT position) > 1
  LIMIT 1
)
ORDER BY position_group, count_match DESC;
