-- Create physical_p90 table for storing SkillCorner physical statistics
CREATE TABLE IF NOT EXISTS physical_p90 (
    -- Composite primary key: player + competition_edition + position
    player_id INTEGER NOT NULL,
    competition_edition_id INTEGER NOT NULL REFERENCES competition_editions(competition_edition_id) ON DELETE CASCADE,
    position VARCHAR(10) NOT NULL,
    
    -- Player info
    player_name TEXT NOT NULL,
    player_short_name TEXT NOT NULL,
    player_birthdate DATE,
    
    -- Team info
    team_id INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    
    -- Competition/Season info
    season_id INTEGER NOT NULL,
    season_name TEXT NOT NULL,
    competition_name TEXT NOT NULL,
    
    -- Position info
    position_group TEXT NOT NULL,
    
    -- Match data
    minutes_full_all DECIMAL(10, 2),
    count_match INTEGER NOT NULL,
    count_match_failed INTEGER DEFAULT 0,
    
    -- Speed metrics
    timetohsr_top3 DECIMAL(10, 2),
    timetohsrpostcod_top3 DECIMAL(10, 2),
    timetosprint_top3 DECIMAL(10, 2),
    timetosprintpostcod_top3 DECIMAL(10, 2),
    timeto505around90_top3 DECIMAL(10, 2),
    timeto505around180_top3 DECIMAL(10, 2),
    psv99 DECIMAL(10, 2),
    psv99_top5 DECIMAL(10, 2),
    
    -- Distance metrics (per 90 min)
    total_distance_full_all_p90 DECIMAL(10, 2),
    total_metersperminute_full_all_p90 DECIMAL(10, 2),
    running_distance_full_all_p90 DECIMAL(10, 2),
    
    -- High Speed Running (per 90 min)
    hsr_distance_full_all_p90 DECIMAL(10, 2),
    hsr_count_full_all_p90 DECIMAL(10, 2),
    
    -- Sprint metrics (per 90 min)
    sprint_distance_full_all_p90 DECIMAL(10, 2),
    sprint_count_full_all_p90 DECIMAL(10, 2),
    
    -- High Intensity (per 90 min)
    hi_distance_full_all_p90 DECIMAL(10, 2),
    hi_count_full_all_p90 DECIMAL(10, 2),
    
    -- Acceleration metrics (per 90 min)
    medaccel_count_full_all_p90 DECIMAL(10, 2),
    highaccel_count_full_all_p90 DECIMAL(10, 2),
    
    -- Deceleration metrics (per 90 min)
    meddecel_count_full_all_p90 DECIMAL(10, 2),
    highdecel_count_full_all_p90 DECIMAL(10, 2),
    
    -- Change of Direction (per 90 min)
    cod_count_full_all_p90 DECIMAL(10, 2),
    
    -- Explosive acceleration metrics (per 90 min)
    explacceltohsr_count_full_all_p90 DECIMAL(10, 2),
    explacceltosprint_count_full_all_p90 DECIMAL(10, 2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite primary key
    PRIMARY KEY (player_id, competition_edition_id, position)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_physical_p90_player_id ON physical_p90(player_id);
CREATE INDEX IF NOT EXISTS idx_physical_p90_competition_edition_id ON physical_p90(competition_edition_id);
CREATE INDEX IF NOT EXISTS idx_physical_p90_team_id ON physical_p90(team_id);
CREATE INDEX IF NOT EXISTS idx_physical_p90_position_group ON physical_p90(position_group);
CREATE INDEX IF NOT EXISTS idx_physical_p90_season_name ON physical_p90(season_name);
CREATE INDEX IF NOT EXISTS idx_physical_p90_competition_name ON physical_p90(competition_name);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_physical_p90_player_season ON physical_p90(player_id, season_name);
CREATE INDEX IF NOT EXISTS idx_physical_p90_player_competition ON physical_p90(player_id, competition_edition_id);
