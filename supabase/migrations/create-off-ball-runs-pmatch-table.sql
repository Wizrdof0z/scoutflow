-- Create off_ball_runs_pmatch table for storing SkillCorner off-ball runs statistics
CREATE TABLE IF NOT EXISTS off_ball_runs_pmatch (
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
    
    -- Runs in Behind metrics
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
    
    -- Runs Ahead of the Ball metrics
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
    
    -- Support Runs metrics
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
    
    -- Pulling Wide Runs metrics
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
    
    -- Coming Short Runs metrics
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
    
    -- Underlap Runs metrics
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
    
    -- Overlap Runs metrics
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
    
    -- Dropping Off Runs metrics
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
    
    -- Pulling Half Space Runs metrics
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
    
    -- Cross Receiver Runs metrics
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
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite primary key
    PRIMARY KEY (player_id, competition_edition_id, team_id, position)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_off_ball_runs_player_id ON off_ball_runs_pmatch(player_id);
CREATE INDEX IF NOT EXISTS idx_off_ball_runs_competition_edition_id ON off_ball_runs_pmatch(competition_edition_id);
CREATE INDEX IF NOT EXISTS idx_off_ball_runs_team_id ON off_ball_runs_pmatch(team_id);
CREATE INDEX IF NOT EXISTS idx_off_ball_runs_season_name ON off_ball_runs_pmatch(season_name);
CREATE INDEX IF NOT EXISTS idx_off_ball_runs_competition_name ON off_ball_runs_pmatch(competition_name);
CREATE INDEX IF NOT EXISTS idx_off_ball_runs_position ON off_ball_runs_pmatch(position);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_off_ball_runs_player_season ON off_ball_runs_pmatch(player_id, season_name);
CREATE INDEX IF NOT EXISTS idx_off_ball_runs_player_competition ON off_ball_runs_pmatch(player_id, competition_edition_id);
