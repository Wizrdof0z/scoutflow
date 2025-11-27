-- Create on_ball_pressures_pmatch table for storing SkillCorner on-ball pressure statistics
CREATE TABLE IF NOT EXISTS on_ball_pressures_pmatch (
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
    
    -- Low Pressure metrics
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
    
    -- Medium Pressure metrics
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
    
    -- High Pressure metrics
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
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite primary key
    PRIMARY KEY (player_id, competition_edition_id, team_id, position)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_on_ball_pressures_player_id ON on_ball_pressures_pmatch(player_id);
CREATE INDEX IF NOT EXISTS idx_on_ball_pressures_competition_edition_id ON on_ball_pressures_pmatch(competition_edition_id);
CREATE INDEX IF NOT EXISTS idx_on_ball_pressures_team_id ON on_ball_pressures_pmatch(team_id);
CREATE INDEX IF NOT EXISTS idx_on_ball_pressures_season_name ON on_ball_pressures_pmatch(season_name);
CREATE INDEX IF NOT EXISTS idx_on_ball_pressures_competition_name ON on_ball_pressures_pmatch(competition_name);
CREATE INDEX IF NOT EXISTS idx_on_ball_pressures_position ON on_ball_pressures_pmatch(position);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_on_ball_pressures_player_season ON on_ball_pressures_pmatch(player_id, season_name);
CREATE INDEX IF NOT EXISTS idx_on_ball_pressures_player_competition ON on_ball_pressures_pmatch(player_id, competition_edition_id);
