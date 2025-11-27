-- Create competition_editions table
CREATE TABLE IF NOT EXISTS competition_editions (
    competition_edition_id INTEGER PRIMARY KEY,
    competition_id INTEGER NOT NULL,
    competition_area TEXT NOT NULL,
    competition_name TEXT NOT NULL,
    season_id INTEGER NOT NULL,
    season_name TEXT NOT NULL,
    competition_edition_name TEXT NOT NULL
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_competition_editions_competition_id ON competition_editions(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_editions_season_id ON competition_editions(season_id);
