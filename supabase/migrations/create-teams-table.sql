-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    competition_edition_id INTEGER NOT NULL REFERENCES competition_editions(competition_edition_id) ON DELETE CASCADE,
    competition_name TEXT NOT NULL,
    competition_id INTEGER NOT NULL,
    team_id INTEGER PRIMARY KEY,
    team_name TEXT NOT NULL,
    stadium_id INTEGER,
    stadium_name TEXT,
    stadium_city TEXT,
    stadium_capacity INTEGER,
    season_name TEXT NOT NULL
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_teams_competition_edition_id ON teams(competition_edition_id);
CREATE INDEX IF NOT EXISTS idx_teams_team_name ON teams(team_name);
