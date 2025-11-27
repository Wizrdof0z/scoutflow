-- Create passing_pmatch table for storing SkillCorner passing statistics
-- This is a VERY large table with 174+ fields covering all pass types to different run types
CREATE TABLE IF NOT EXISTS passing_pmatch (
    -- Composite primary key: player + competition_edition + team + position
    player_id INTEGER NOT NULL,
    competition_edition_id INTEGER NOT NULL REFERENCES competition_editions(competition_edition_id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    position VARCHAR(10) NOT NULL,
    
    -- Player info
    player_name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    player_birthdate DATE,
    
    -- Team info
    team_name TEXT NOT NULL,
    
    -- Competition/Season info
    competition_id INTEGER NOT NULL,
    competition_name TEXT NOT NULL,
    season_id INTEGER NOT NULL,
    season_name TEXT NOT NULL,
    
    -- Match context
    third VARCHAR(20),
    channel VARCHAR(20),
    
    -- Match data
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
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite primary key
    PRIMARY KEY (player_id, competition_edition_id, team_id, position)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_passing_player_id ON passing_pmatch(player_id);
CREATE INDEX IF NOT EXISTS idx_passing_competition_edition_id ON passing_pmatch(competition_edition_id);
CREATE INDEX IF NOT EXISTS idx_passing_team_id ON passing_pmatch(team_id);
CREATE INDEX IF NOT EXISTS idx_passing_season_name ON passing_pmatch(season_name);
CREATE INDEX IF NOT EXISTS idx_passing_competition_name ON passing_pmatch(competition_name);
CREATE INDEX IF NOT EXISTS idx_passing_position ON passing_pmatch(position);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_passing_player_season ON passing_pmatch(player_id, season_name);
CREATE INDEX IF NOT EXISTS idx_passing_player_competition ON passing_pmatch(player_id, competition_edition_id);
