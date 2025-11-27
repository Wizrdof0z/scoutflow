-- Create player table
CREATE TABLE IF NOT EXISTS player (
    player_id INTEGER PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    competition_edition_id INTEGER NOT NULL REFERENCES competition_editions(competition_edition_id) ON DELETE CASCADE,
    competition_name TEXT NOT NULL,
    season_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    birthday DATE
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_player_team_id ON player(team_id);
CREATE INDEX IF NOT EXISTS idx_player_competition_edition_id ON player(competition_edition_id);
CREATE INDEX IF NOT EXISTS idx_player_name ON player(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_player_composite ON player(team_id, competition_edition_id, first_name, last_name, birthday);
