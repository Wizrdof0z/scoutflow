-- =====================================================
-- COMPLETE RECREATION OF ALL IN-POSSESSION TABLES
-- Run this ENTIRE file in Supabase SQL Editor
-- =====================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS off_ball_runs_pmatch CASCADE;
DROP TABLE IF EXISTS on_ball_pressures_pmatch CASCADE;
DROP TABLE IF EXISTS passing_pmatch CASCADE;

-- =====================================================
-- 1. OFF-BALL RUNS TABLE
-- =====================================================
CREATE TABLE off_ball_runs_pmatch (
    player_id INTEGER NOT NULL,
    competition_edition_id INTEGER NOT NULL REFERENCES competition_editions(competition_edition_id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    position VARCHAR(10) NOT NULL,
    player_name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    player_birthdate DATE,
    team_name TEXT NOT NULL,
    competition_id INTEGER NOT NULL,
    competition_name TEXT NOT NULL,
    season_id INTEGER NOT NULL,
    season_name TEXT NOT NULL,
    third VARCHAR(20),
    channel VARCHAR(20),
    minutes_played_per_match DECIMAL(10, 2),
    adjusted_min_tip_per_match DECIMAL(10, 2),
    count_match INTEGER NOT NULL,
    count_match_failed INTEGER DEFAULT 0,
    
    -- Runs in Behind
    count_runs_in_behind_in_sample INTEGER,
    count_runs_in_behind_per_match DECIMAL(10, 2),
    count_dangerous_runs_in_behind_per_match DECIMAL(10, 2),
    runs_in_behind_threat_per_match DECIMAL(10, 2),
    count_runs_in_behind_leading_to_goal_per_match DECIMAL(10, 2),
    count_runs_in_behind_targeted_per_match DECIMAL(10, 2),
    count_runs_in_behind_received_per_match DECIMAL(10, 2),
    count_runs_in_behind_leading_to_shot_per_match DECIMAL(10, 2),
    runs_in_behind_targeted_threat_per_match DECIMAL(10, 2),
    runs_in_behind_received_threat_per_match DECIMAL(10, 2),
    count_dangerous_runs_in_behind_targeted_per_match DECIMAL(10, 2),
    count_dangerous_runs_in_behind_received_per_match DECIMAL(10, 2),
    
    -- Runs Ahead of the Ball
    count_runs_ahead_of_the_ball_in_sample INTEGER,
    count_runs_ahead_of_the_ball_per_match DECIMAL(10, 2),
    count_dangerous_runs_ahead_of_the_ball_per_match DECIMAL(10, 2),
    runs_ahead_of_the_ball_threat_per_match DECIMAL(10, 2),
    count_runs_ahead_of_the_ball_leading_to_goal_per_match DECIMAL(10, 2),
    count_runs_ahead_of_the_ball_targeted_per_match DECIMAL(10, 2),
    count_runs_ahead_of_the_ball_received_per_match DECIMAL(10, 2),
    count_runs_ahead_of_the_ball_leading_to_shot_per_match DECIMAL(10, 2),
    runs_ahead_of_the_ball_targeted_threat_per_match DECIMAL(10, 2),
    runs_ahead_of_the_ball_received_threat_per_match DECIMAL(10, 2),
    count_dangerous_runs_ahead_of_the_ball_targeted_per_match DECIMAL(10, 2),
    count_dangerous_runs_ahead_of_the_ball_received_per_match DECIMAL(10, 2),
    
    -- Support Runs
    count_support_runs_in_sample INTEGER,
    count_support_runs_per_match DECIMAL(10, 2),
    count_dangerous_support_runs_per_match DECIMAL(10, 2),
    support_runs_threat_per_match DECIMAL(10, 2),
    count_support_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_support_runs_targeted_per_match DECIMAL(10, 2),
    count_support_runs_received_per_match DECIMAL(10, 2),
    count_support_runs_leading_to_shot_per_match DECIMAL(10, 2),
    support_runs_targeted_threat_per_match DECIMAL(10, 2),
    support_runs_received_threat_per_match DECIMAL(10, 2),
    count_dangerous_support_runs_targeted_per_match DECIMAL(10, 2),
    count_dangerous_support_runs_received_per_match DECIMAL(10, 2),
    
    -- Pulling Wide Runs
    count_pulling_wide_runs_in_sample INTEGER,
    count_pulling_wide_runs_per_match DECIMAL(10, 2),
    count_dangerous_pulling_wide_runs_per_match DECIMAL(10, 2),
    pulling_wide_runs_threat_per_match DECIMAL(10, 2),
    count_pulling_wide_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_pulling_wide_runs_targeted_per_match DECIMAL(10, 2),
    count_pulling_wide_runs_received_per_match DECIMAL(10, 2),
    count_pulling_wide_runs_leading_to_shot_per_match DECIMAL(10, 2),
    pulling_wide_runs_targeted_threat_per_match DECIMAL(10, 2),
    pulling_wide_runs_received_threat_per_match DECIMAL(10, 2),
    count_dangerous_pulling_wide_runs_targeted_per_match DECIMAL(10, 2),
    count_dangerous_pulling_wide_runs_received_per_match DECIMAL(10, 2),
    
    -- Coming Short Runs
    count_coming_short_runs_in_sample INTEGER,
    count_coming_short_runs_per_match DECIMAL(10, 2),
    count_dangerous_coming_short_runs_per_match DECIMAL(10, 2),
    coming_short_runs_threat_per_match DECIMAL(10, 2),
    count_coming_short_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_coming_short_runs_targeted_per_match DECIMAL(10, 2),
    count_coming_short_runs_received_per_match DECIMAL(10, 2),
    count_coming_short_runs_leading_to_shot_per_match DECIMAL(10, 2),
    coming_short_runs_targeted_threat_per_match DECIMAL(10, 2),
    coming_short_runs_received_threat_per_match DECIMAL(10, 2),
    count_dangerous_coming_short_runs_targeted_per_match DECIMAL(10, 2),
    count_dangerous_coming_short_runs_received_per_match DECIMAL(10, 2),
    
    -- Underlap Runs
    count_underlap_runs_in_sample INTEGER,
    count_underlap_runs_per_match DECIMAL(10, 2),
    count_dangerous_underlap_runs_per_match DECIMAL(10, 2),
    underlap_runs_threat_per_match DECIMAL(10, 2),
    count_underlap_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_underlap_runs_targeted_per_match DECIMAL(10, 2),
    count_underlap_runs_received_per_match DECIMAL(10, 2),
    count_underlap_runs_leading_to_shot_per_match DECIMAL(10, 2),
    underlap_runs_targeted_threat_per_match DECIMAL(10, 2),
    underlap_runs_received_threat_per_match DECIMAL(10, 2),
    count_dangerous_underlap_runs_targeted_per_match DECIMAL(10, 2),
    count_dangerous_underlap_runs_received_per_match DECIMAL(10, 2),
    
    -- Overlap Runs
    count_overlap_runs_in_sample INTEGER,
    count_overlap_runs_per_match DECIMAL(10, 2),
    count_dangerous_overlap_runs_per_match DECIMAL(10, 2),
    overlap_runs_threat_per_match DECIMAL(10, 2),
    count_overlap_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_overlap_runs_targeted_per_match DECIMAL(10, 2),
    count_overlap_runs_received_per_match DECIMAL(10, 2),
    count_overlap_runs_leading_to_shot_per_match DECIMAL(10, 2),
    overlap_runs_targeted_threat_per_match DECIMAL(10, 2),
    overlap_runs_received_threat_per_match DECIMAL(10, 2),
    count_dangerous_overlap_runs_targeted_per_match DECIMAL(10, 2),
    count_dangerous_overlap_runs_received_per_match DECIMAL(10, 2),
    
    -- Dropping Off Runs
    count_dropping_off_runs_in_sample INTEGER,
    count_dropping_off_runs_per_match DECIMAL(10, 2),
    count_dangerous_dropping_off_runs_per_match DECIMAL(10, 2),
    dropping_off_runs_threat_per_match DECIMAL(10, 2),
    count_dropping_off_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_dropping_off_runs_targeted_per_match DECIMAL(10, 2),
    count_dropping_off_runs_received_per_match DECIMAL(10, 2),
    count_dropping_off_runs_leading_to_shot_per_match DECIMAL(10, 2),
    dropping_off_runs_targeted_threat_per_match DECIMAL(10, 2),
    dropping_off_runs_received_threat_per_match DECIMAL(10, 2),
    count_dangerous_dropping_off_runs_targeted_per_match DECIMAL(10, 2),
    count_dangerous_dropping_off_runs_received_per_match DECIMAL(10, 2),
    
    -- Pulling Half Space Runs
    count_pulling_half_space_runs_in_sample INTEGER,
    count_pulling_half_space_runs_per_match DECIMAL(10, 2),
    count_dangerous_pulling_half_space_runs_per_match DECIMAL(10, 2),
    pulling_half_space_runs_threat_per_match DECIMAL(10, 2),
    count_pulling_half_space_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_pulling_half_space_runs_targeted_per_match DECIMAL(10, 2),
    count_pulling_half_space_runs_received_per_match DECIMAL(10, 2),
    count_pulling_half_space_runs_leading_to_shot_per_match DECIMAL(10, 2),
    pulling_half_space_runs_targeted_threat_per_match DECIMAL(10, 2),
    pulling_half_space_runs_received_threat_per_match DECIMAL(10, 2),
    count_dangerous_pulling_half_space_runs_targeted_per_match DECIMAL(10, 2),
    count_dangerous_pulling_half_space_runs_received_per_match DECIMAL(10, 2),
    
    -- Cross Receiver Runs
    count_cross_receiver_runs_in_sample INTEGER,
    count_cross_receiver_runs_per_match DECIMAL(10, 2),
    count_dangerous_cross_receiver_runs_per_match DECIMAL(10, 2),
    cross_receiver_runs_threat_per_match DECIMAL(10, 2),
    count_cross_receiver_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_cross_receiver_runs_targeted_per_match DECIMAL(10, 2),
    count_cross_receiver_runs_received_per_match DECIMAL(10, 2),
    count_cross_receiver_runs_leading_to_shot_per_match DECIMAL(10, 2),
    cross_receiver_runs_targeted_threat_per_match DECIMAL(10, 2),
    cross_receiver_runs_received_threat_per_match DECIMAL(10, 2),
    count_dangerous_cross_receiver_runs_targeted_per_match DECIMAL(10, 2),
    count_dangerous_cross_receiver_runs_received_per_match DECIMAL(10, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (player_id, competition_edition_id, team_id, position)
);

-- =====================================================
-- 2. ON-BALL PRESSURES TABLE
-- =====================================================
CREATE TABLE on_ball_pressures_pmatch (
    player_id INTEGER NOT NULL,
    competition_edition_id INTEGER NOT NULL REFERENCES competition_editions(competition_edition_id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    position VARCHAR(10) NOT NULL,
    player_name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    player_birthdate DATE,
    team_name TEXT NOT NULL,
    competition_id INTEGER NOT NULL,
    competition_name TEXT NOT NULL,
    season_id INTEGER NOT NULL,
    season_name TEXT NOT NULL,
    third VARCHAR(20),
    channel VARCHAR(20),
    minutes_played_per_match DECIMAL(10, 2),
    adjusted_min_tip_per_match DECIMAL(10, 2),
    count_match INTEGER NOT NULL,
    count_match_failed INTEGER DEFAULT 0,
    
    -- Low Pressure
    count_low_pressures_received_in_sample INTEGER,
    count_low_pressures_received_per_match DECIMAL(10, 2),
    count_forced_losses_under_low_pressure_per_match DECIMAL(10, 2),
    count_ball_retentions_under_low_pressure_per_match DECIMAL(10, 2),
    ball_retention_ratio_under_low_pressure DECIMAL(10, 2),
    pass_completion_ratio_under_low_pressure DECIMAL(10, 2),
    count_pass_attempts_under_low_pressure_per_match DECIMAL(10, 2),
    count_completed_passes_under_low_pressure_per_match DECIMAL(10, 2),
    count_dangerous_pass_attempts_under_low_pressure_per_match DECIMAL(10, 2),
    count_completed_dangerous_passes_under_low_pressure_per_match DECIMAL(10, 2),
    dangerous_pass_completion_ratio_under_low_pressure DECIMAL(10, 2),
    count_difficult_pass_attempts_under_low_pressure_per_match DECIMAL(10, 2),
    count_completed_difficult_passes_under_low_pressure_per_match DECIMAL(10, 2),
    difficult_pass_completion_ratio_under_low_pressure DECIMAL(10, 2),
    
    -- Medium Pressure
    count_medium_pressures_received_in_sample INTEGER,
    count_medium_pressures_received_per_match DECIMAL(10, 2),
    count_forced_losses_under_medium_pressure_per_match DECIMAL(10, 2),
    count_ball_retentions_under_medium_pressure_per_match DECIMAL(10, 2),
    ball_retention_ratio_under_medium_pressure DECIMAL(10, 2),
    pass_completion_ratio_under_medium_pressure DECIMAL(10, 2),
    count_pass_attempts_under_medium_pressure_per_match DECIMAL(10, 2),
    count_completed_passes_under_medium_pressure_per_match DECIMAL(10, 2),
    count_dangerous_pass_attempts_under_medium_pressure_per_match DECIMAL(10, 2),
    count_completed_dangerous_passes_under_medium_pressure_per_match DECIMAL(10, 2),
    dangerous_pass_completion_ratio_under_medium_pressure DECIMAL(10, 2),
    count_difficult_pass_attempts_under_medium_pressure_per_match DECIMAL(10, 2),
    count_completed_difficult_passes_under_medium_pressure_per_match DECIMAL(10, 2),
    difficult_pass_completion_ratio_under_medium_pressure DECIMAL(10, 2),
    
    -- High Pressure
    count_high_pressures_received_in_sample INTEGER,
    count_high_pressures_received_per_match DECIMAL(10, 2),
    count_forced_losses_under_high_pressure_per_match DECIMAL(10, 2),
    count_ball_retentions_under_high_pressure_per_match DECIMAL(10, 2),
    ball_retention_ratio_under_high_pressure DECIMAL(10, 2),
    pass_completion_ratio_under_high_pressure DECIMAL(10, 2),
    count_pass_attempts_under_high_pressure_per_match DECIMAL(10, 2),
    count_completed_passes_under_high_pressure_per_match DECIMAL(10, 2),
    count_dangerous_pass_attempts_under_high_pressure_per_match DECIMAL(10, 2),
    count_completed_dangerous_passes_under_high_pressure_per_match DECIMAL(10, 2),
    dangerous_pass_completion_ratio_under_high_pressure DECIMAL(10, 2),
    count_difficult_pass_attempts_under_high_pressure_per_match DECIMAL(10, 2),
    count_completed_difficult_passes_under_high_pressure_per_match DECIMAL(10, 2),
    difficult_pass_completion_ratio_under_high_pressure DECIMAL(10, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (player_id, competition_edition_id, team_id, position)
);

-- =====================================================
-- 3. PASSING TABLE
-- =====================================================
CREATE TABLE passing_pmatch (
    player_id INTEGER NOT NULL,
    competition_edition_id INTEGER NOT NULL REFERENCES competition_editions(competition_edition_id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    position VARCHAR(10) NOT NULL,
    player_name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    player_birthdate DATE,
    team_name TEXT NOT NULL,
    competition_id INTEGER NOT NULL,
    competition_name TEXT NOT NULL,
    season_id INTEGER NOT NULL,
    season_name TEXT NOT NULL,
    third VARCHAR(20),
    channel VARCHAR(20),
    minutes_played_per_match DECIMAL(10, 2),
    adjusted_min_tip_per_match DECIMAL(10, 2),
    count_match INTEGER NOT NULL,
    count_match_failed INTEGER DEFAULT 0,
    
    -- Passes to Runs in Behind
    count_opportunities_to_pass_to_runs_in_behind_in_sample INTEGER,
    count_opportunities_to_pass_to_runs_in_behind_per_match DECIMAL(10, 2),
    count_pass_attempts_to_runs_in_behind_per_match DECIMAL(10, 2),
    pass_opportunities_to_runs_in_behind_threat_per_match DECIMAL(10, 2),
    runs_in_behind_to_which_pass_attempted_threat_per_match DECIMAL(10, 2),
    pass_completion_ratio_to_runs_in_behind DECIMAL(10, 2),
    count_runs_in_behind_by_teammate_per_match DECIMAL(10, 2),
    runs_in_behind_to_which_pass_completed_threat_per_match DECIMAL(10, 2),
    count_completed_pass_to_runs_in_behind_per_match DECIMAL(10, 2),
    count_completed_pass_to_runs_in_behind_leading_to_shot_per_match DECIMAL(10, 2),
    count_completed_pass_to_runs_in_behind_leading_to_goal_per_match DECIMAL(10, 2),
    count_pass_opportunities_to_dangerous_runs_in_behind_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dangerous_runs_in_behind_per_match DECIMAL(10, 2),
    count_completed_pass_to_dangerous_runs_in_behind_per_match DECIMAL(10, 2),
    
    -- Passes to Runs Ahead of the Ball
    count_opportunities_to_pass_to_runs_ahead_of_the_ball_in_sample INTEGER,
    count_opportunities_to_pass_to_runs_ahead_of_the_ball_per_match DECIMAL(10, 2),
    count_pass_attempts_to_runs_ahead_of_the_ball_per_match DECIMAL(10, 2),
    pass_opportunities_to_runs_ahead_of_the_ball_threat_per_match DECIMAL(10, 2),
    runs_ahead_of_the_ball_to_which_pass_attempted_threat_per_match DECIMAL(10, 2),
    pass_completion_ratio_to_runs_ahead_of_the_ball DECIMAL(10, 2),
    count_runs_ahead_of_the_ball_by_teammate_per_match DECIMAL(10, 2),
    runs_ahead_of_the_ball_to_which_pass_completed_threat_per_match DECIMAL(10, 2),
    count_completed_pass_to_runs_ahead_of_the_ball_per_match DECIMAL(10, 2),
    count_completed_pass_to_runs_ahead_of_the_ball_leading_to_shot_per_match DECIMAL(10, 2),
    count_completed_pass_to_runs_ahead_of_the_ball_leading_to_goal_per_match DECIMAL(10, 2),
    count_pass_opportunities_to_dangerous_runs_ahead_of_the_ball_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dangerous_runs_ahead_of_the_ball_per_match DECIMAL(10, 2),
    count_completed_pass_to_dangerous_runs_ahead_of_the_ball_per_match DECIMAL(10, 2),
    
    -- Passes to Support Runs
    count_opportunities_to_pass_to_support_runs_in_sample INTEGER,
    count_opportunities_to_pass_to_support_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_support_runs_per_match DECIMAL(10, 2),
    pass_opportunities_to_support_runs_threat_per_match DECIMAL(10, 2),
    support_runs_to_which_pass_attempted_threat_per_match DECIMAL(10, 2),
    pass_completion_ratio_to_support_runs DECIMAL(10, 2),
    count_support_runs_by_teammate_per_match DECIMAL(10, 2),
    support_runs_to_which_pass_completed_threat_per_match DECIMAL(10, 2),
    count_completed_pass_to_support_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_support_runs_leading_to_shot_per_match DECIMAL(10, 2),
    count_completed_pass_to_support_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_pass_opportunities_to_dangerous_support_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dangerous_support_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_dangerous_support_runs_per_match DECIMAL(10, 2),
    
    -- Passes to Pulling Wide Runs
    count_opportunities_to_pass_to_pulling_wide_runs_in_sample INTEGER,
    count_opportunities_to_pass_to_pulling_wide_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_pulling_wide_runs_per_match DECIMAL(10, 2),
    pass_opportunities_to_pulling_wide_runs_threat_per_match DECIMAL(10, 2),
    pulling_wide_runs_to_which_pass_attempted_threat_per_match DECIMAL(10, 2),
    pass_completion_ratio_to_pulling_wide_runs DECIMAL(10, 2),
    count_pulling_wide_runs_by_teammate_per_match DECIMAL(10, 2),
    pulling_wide_runs_to_which_pass_completed_threat_per_match DECIMAL(10, 2),
    count_completed_pass_to_pulling_wide_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_pulling_wide_runs_leading_to_shot_per_match DECIMAL(10, 2),
    count_completed_pass_to_pulling_wide_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_pass_opportunities_to_dangerous_pulling_wide_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dangerous_pulling_wide_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_dangerous_pulling_wide_runs_per_match DECIMAL(10, 2),
    
    -- Passes to Coming Short Runs
    count_opportunities_to_pass_to_coming_short_runs_in_sample INTEGER,
    count_opportunities_to_pass_to_coming_short_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_coming_short_runs_per_match DECIMAL(10, 2),
    pass_opportunities_to_coming_short_runs_threat_per_match DECIMAL(10, 2),
    coming_short_runs_to_which_pass_attempted_threat_per_match DECIMAL(10, 2),
    pass_completion_ratio_to_coming_short_runs DECIMAL(10, 2),
    count_coming_short_runs_by_teammate_per_match DECIMAL(10, 2),
    coming_short_runs_to_which_pass_completed_threat_per_match DECIMAL(10, 2),
    count_completed_pass_to_coming_short_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_coming_short_runs_leading_to_shot_per_match DECIMAL(10, 2),
    count_completed_pass_to_coming_short_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_pass_opportunities_to_dangerous_coming_short_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dangerous_coming_short_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_dangerous_coming_short_runs_per_match DECIMAL(10, 2),
    
    -- Passes to Underlap Runs
    count_opportunities_to_pass_to_underlap_runs_in_sample INTEGER,
    count_opportunities_to_pass_to_underlap_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_underlap_runs_per_match DECIMAL(10, 2),
    pass_opportunities_to_underlap_runs_threat_per_match DECIMAL(10, 2),
    underlap_runs_to_which_pass_attempted_threat_per_match DECIMAL(10, 2),
    pass_completion_ratio_to_underlap_runs DECIMAL(10, 2),
    count_underlap_runs_by_teammate_per_match DECIMAL(10, 2),
    underlap_runs_to_which_pass_completed_threat_per_match DECIMAL(10, 2),
    count_completed_pass_to_underlap_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_underlap_runs_leading_to_shot_per_match DECIMAL(10, 2),
    count_completed_pass_to_underlap_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_pass_opportunities_to_dangerous_underlap_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dangerous_underlap_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_dangerous_underlap_runs_per_match DECIMAL(10, 2),
    
    -- Passes to Overlap Runs
    count_opportunities_to_pass_to_overlap_runs_in_sample INTEGER,
    count_opportunities_to_pass_to_overlap_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_overlap_runs_per_match DECIMAL(10, 2),
    pass_opportunities_to_overlap_runs_threat_per_match DECIMAL(10, 2),
    overlap_runs_to_which_pass_attempted_threat_per_match DECIMAL(10, 2),
    pass_completion_ratio_to_overlap_runs DECIMAL(10, 2),
    count_overlap_runs_by_teammate_per_match DECIMAL(10, 2),
    overlap_runs_to_which_pass_completed_threat_per_match DECIMAL(10, 2),
    count_completed_pass_to_overlap_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_overlap_runs_leading_to_shot_per_match DECIMAL(10, 2),
    count_completed_pass_to_overlap_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_pass_opportunities_to_dangerous_overlap_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dangerous_overlap_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_dangerous_overlap_runs_per_match DECIMAL(10, 2),
    
    -- Passes to Dropping Off Runs
    count_opportunities_to_pass_to_dropping_off_runs_in_sample INTEGER,
    count_opportunities_to_pass_to_dropping_off_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dropping_off_runs_per_match DECIMAL(10, 2),
    pass_opportunities_to_dropping_off_runs_threat_per_match DECIMAL(10, 2),
    dropping_off_runs_to_which_pass_attempted_threat_per_match DECIMAL(10, 2),
    pass_completion_ratio_to_dropping_off_runs DECIMAL(10, 2),
    count_dropping_off_runs_by_teammate_per_match DECIMAL(10, 2),
    dropping_off_runs_to_which_pass_completed_threat_per_match DECIMAL(10, 2),
    count_completed_pass_to_dropping_off_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_dropping_off_runs_leading_to_shot_per_match DECIMAL(10, 2),
    count_completed_pass_to_dropping_off_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_pass_opportunities_to_dangerous_dropping_off_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dangerous_dropping_off_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_dangerous_dropping_off_runs_per_match DECIMAL(10, 2),
    
    -- Passes to Pulling Half Space Runs
    count_opportunities_to_pass_to_pulling_half_space_runs_in_sample INTEGER,
    count_opportunities_to_pass_to_pulling_half_space_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_pulling_half_space_runs_per_match DECIMAL(10, 2),
    pass_opportunities_to_pulling_half_space_runs_threat_per_match DECIMAL(10, 2),
    pulling_half_space_runs_to_which_pass_attempted_threat_per_match DECIMAL(10, 2),
    pass_completion_ratio_to_pulling_half_space_runs DECIMAL(10, 2),
    count_pulling_half_space_runs_by_teammate_per_match DECIMAL(10, 2),
    pulling_half_space_runs_to_which_pass_completed_threat_per_match DECIMAL(10, 2),
    count_completed_pass_to_pulling_half_space_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_pulling_half_space_runs_leading_to_shot_per_match DECIMAL(10, 2),
    count_completed_pass_to_pulling_half_space_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_pass_opportunities_to_dangerous_pulling_half_space_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dangerous_pulling_half_space_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_dangerous_pulling_half_space_runs_per_match DECIMAL(10, 2),
    
    -- Passes to Cross Receiver Runs
    count_opportunities_to_pass_to_cross_receiver_runs_in_sample INTEGER,
    count_opportunities_to_pass_to_cross_receiver_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_cross_receiver_runs_per_match DECIMAL(10, 2),
    pass_opportunities_to_cross_receiver_runs_threat_per_match DECIMAL(10, 2),
    cross_receiver_runs_to_which_pass_attempted_threat_per_match DECIMAL(10, 2),
    pass_completion_ratio_to_cross_receiver_runs DECIMAL(10, 2),
    count_cross_receiver_runs_by_teammate_per_match DECIMAL(10, 2),
    cross_receiver_runs_to_which_pass_completed_threat_per_match DECIMAL(10, 2),
    count_completed_pass_to_cross_receiver_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_cross_receiver_runs_leading_to_shot_per_match DECIMAL(10, 2),
    count_completed_pass_to_cross_receiver_runs_leading_to_goal_per_match DECIMAL(10, 2),
    count_pass_opportunities_to_dangerous_cross_receiver_runs_per_match DECIMAL(10, 2),
    count_pass_attempts_to_dangerous_cross_receiver_runs_per_match DECIMAL(10, 2),
    count_completed_pass_to_dangerous_cross_receiver_runs_per_match DECIMAL(10, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (player_id, competition_edition_id, team_id, position)
);

-- =====================================================
-- 4. DISABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE off_ball_runs_pmatch DISABLE ROW LEVEL SECURITY;
ALTER TABLE on_ball_pressures_pmatch DISABLE ROW LEVEL SECURITY;
ALTER TABLE passing_pmatch DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE INDEXES
-- =====================================================

-- Off-ball runs indexes
CREATE INDEX idx_offball_player_id ON off_ball_runs_pmatch(player_id);
CREATE INDEX idx_offball_competition_edition_id ON off_ball_runs_pmatch(competition_edition_id);
CREATE INDEX idx_offball_team_id ON off_ball_runs_pmatch(team_id);
CREATE INDEX idx_offball_season_name ON off_ball_runs_pmatch(season_name);

-- On-ball pressures indexes
CREATE INDEX idx_pressure_player_id ON on_ball_pressures_pmatch(player_id);
CREATE INDEX idx_pressure_competition_edition_id ON on_ball_pressures_pmatch(competition_edition_id);
CREATE INDEX idx_pressure_team_id ON on_ball_pressures_pmatch(team_id);
CREATE INDEX idx_pressure_season_name ON on_ball_pressures_pmatch(season_name);

-- Passing indexes
CREATE INDEX idx_passing_player_id ON passing_pmatch(player_id);
CREATE INDEX idx_passing_competition_edition_id ON passing_pmatch(competition_edition_id);
CREATE INDEX idx_passing_team_id ON passing_pmatch(team_id);
CREATE INDEX idx_passing_season_name ON passing_pmatch(season_name);

-- =====================================================
-- 6. RELOAD POSTGREST SCHEMA CACHE
-- =====================================================
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- 7. VERIFY TABLES EXIST
-- =====================================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('off_ball_runs_pmatch', 'on_ball_pressures_pmatch', 'passing_pmatch')
ORDER BY table_name;
