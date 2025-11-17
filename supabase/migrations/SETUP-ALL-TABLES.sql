-- ============================================
-- SCOUTFLOW - ALL-IN-ONE DATABASE SETUP
-- Run this FIRST if you're getting table/constraint errors
-- ============================================
-- This script will:
-- 1. Create all required tables with correct constraints
-- 2. Set up all indexes
-- 3. Insert default seasons
-- ============================================

-- Enable UUID extension (needed for report IDs)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. SEASONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.seasons (
    season_id TEXT PRIMARY KEY,
    start_year INTEGER NOT NULL,
    end_year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- ============================================
-- 2. PLAYERS TABLE
-- ============================================
-- Drop existing position constraint if any
ALTER TABLE IF EXISTS public.players 
DROP CONSTRAINT IF EXISTS players_position_profile_check;

CREATE TABLE IF NOT EXISTS public.players (
    player_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    current_team TEXT NOT NULL,
    current_league TEXT NOT NULL,
    matches_played INTEGER DEFAULT 0,
    nationality TEXT NOT NULL,
    foot TEXT CHECK (foot IN ('Left', 'Right', 'Both')),
    market_value NUMERIC,
    contract_end_date DATE,
    position_profile TEXT,
    data_available BOOLEAN DEFAULT false,
    current_list TEXT DEFAULT 'Prospects' CHECK (current_list IN ('Prospects', 'Datascouting list', 'Videoscouting list', 'Live scouting list', 'Potential list', 'Not interesting list')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add proper constraint for new position values
ALTER TABLE public.players 
ADD CONSTRAINT players_position_profile_check 
CHECK (position_profile IS NULL OR position_profile IN (
    'Goalkeeper',
    'Centre Back',
    'Left Fullback',
    'Right Fullback',
    'Defensive Midfielder',
    'Central Midfielder',
    'Attacking Midfielder',
    'Left Winger',
    'Right Winger',
    'Centre Forward'
));

-- ============================================
-- 3. PLAYER RATINGS TABLE (0-100 scale)
-- ============================================
-- Drop existing constraints if any
ALTER TABLE IF EXISTS public.player_ratings 
DROP CONSTRAINT IF EXISTS player_ratings_overall_rating_check,
DROP CONSTRAINT IF EXISTS player_ratings_physical_rating_check,
DROP CONSTRAINT IF EXISTS player_ratings_movement_rating_check,
DROP CONSTRAINT IF EXISTS player_ratings_passing_rating_check,
DROP CONSTRAINT IF EXISTS player_ratings_pressure_rating_check,
DROP CONSTRAINT IF EXISTS player_ratings_defensive_rating_check;

CREATE TABLE IF NOT EXISTS public.player_ratings (
    player_id TEXT NOT NULL,
    season_id TEXT NOT NULL,
    overall_rating NUMERIC(5,1),
    physical_rating NUMERIC(5,1),
    movement_rating NUMERIC(5,1),
    passing_rating NUMERIC(5,1),
    pressure_rating NUMERIC(5,1),
    defensive_rating NUMERIC(5,1),
    rated_by TEXT,
    rated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (player_id, season_id),
    FOREIGN KEY (player_id) REFERENCES public.players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES public.seasons(season_id) ON DELETE CASCADE
);

-- Add proper constraints (0-100 scale)
ALTER TABLE public.player_ratings 
ADD CONSTRAINT player_ratings_overall_rating_check 
    CHECK (overall_rating IS NULL OR (overall_rating >= 0 AND overall_rating <= 100));
    
ALTER TABLE public.player_ratings 
ADD CONSTRAINT player_ratings_physical_rating_check 
    CHECK (physical_rating IS NULL OR (physical_rating >= 0 AND physical_rating <= 100));
    
ALTER TABLE public.player_ratings 
ADD CONSTRAINT player_ratings_movement_rating_check 
    CHECK (movement_rating IS NULL OR (movement_rating >= 0 AND movement_rating <= 100));
    
ALTER TABLE public.player_ratings 
ADD CONSTRAINT player_ratings_passing_rating_check 
    CHECK (passing_rating IS NULL OR (passing_rating >= 0 AND passing_rating <= 100));
    
ALTER TABLE public.player_ratings 
ADD CONSTRAINT player_ratings_pressure_rating_check 
    CHECK (pressure_rating IS NULL OR (pressure_rating >= 0 AND pressure_rating <= 100));
    
ALTER TABLE public.player_ratings 
ADD CONSTRAINT player_ratings_defensive_rating_check 
    CHECK (defensive_rating IS NULL OR (defensive_rating >= 0 AND defensive_rating <= 100));

-- ============================================
-- 4. REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id TEXT NOT NULL,
    season_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (player_id) REFERENCES public.players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES public.seasons(season_id) ON DELETE CASCADE
);

-- ============================================
-- 5. VERDICTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.verdicts (
    verdict_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id TEXT NOT NULL,
    season_id TEXT NOT NULL,
    scout_id TEXT,
    scout_name TEXT,
    verdict_type TEXT CHECK (verdict_type IN ('Follow-up', 'Continue Monitoring', 'Not Good Enough')),
    notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (player_id) REFERENCES public.players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES public.seasons(season_id) ON DELETE CASCADE
);

-- ============================================
-- 6. DATA SCOUTING ENTRIES TABLE
-- ============================================
-- Drop existing constraint if any
ALTER TABLE IF EXISTS public.data_scouting_entries 
DROP CONSTRAINT IF EXISTS data_scouting_entries_data_verdict_check;

CREATE TABLE IF NOT EXISTS public.data_scouting_entries (
    player_id TEXT NOT NULL,
    season_id TEXT NOT NULL,
    data_verdict TEXT,
    sub_profile TEXT,
    datascout_id TEXT,
    datascouted_at TIMESTAMPTZ,
    notes TEXT,
    PRIMARY KEY (player_id, season_id),
    FOREIGN KEY (player_id) REFERENCES public.players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES public.seasons(season_id) ON DELETE CASCADE
);

-- Add proper constraint for data verdict
ALTER TABLE public.data_scouting_entries 
ADD CONSTRAINT data_scouting_entries_data_verdict_check 
CHECK (data_verdict IS NULL OR data_verdict IN ('Good', 'Average', 'Bad'));

-- ============================================
-- 7. VIDEOSCOUTING ENTRIES TABLE
-- ============================================
DROP TABLE IF EXISTS public.videoscouting_entries CASCADE;

CREATE TABLE public.videoscouting_entries (
    player_id TEXT NOT NULL,
    season_id TEXT NOT NULL,
    kyle_verdict TEXT CHECK (kyle_verdict IS NULL OR kyle_verdict IN ('Follow-up', 'Continue Monitoring', 'Not Good Enough')),
    kyle_videoscouted_at TIMESTAMPTZ,
    kyle_notes TEXT,
    toer_verdict TEXT CHECK (toer_verdict IS NULL OR toer_verdict IN ('Follow-up', 'Continue Monitoring', 'Not Good Enough')),
    toer_videoscouted_at TIMESTAMPTZ,
    toer_notes TEXT,
    PRIMARY KEY (player_id, season_id),
    FOREIGN KEY (player_id) REFERENCES public.players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES public.seasons(season_id) ON DELETE CASCADE
);

-- ============================================
-- 8. LIVE SCOUTING ENTRIES TABLE
-- ============================================
DROP TABLE IF EXISTS public.live_scouting_entries CASCADE;

CREATE TABLE public.live_scouting_entries (
    player_id TEXT NOT NULL,
    season_id TEXT NOT NULL,
    live_scouting_percentage NUMERIC(5,2) CHECK (live_scouting_percentage IS NULL OR (live_scouting_percentage >= 0 AND live_scouting_percentage <= 100)),
    livescout_id TEXT,
    livescouted_at TIMESTAMPTZ,
    notes TEXT,
    PRIMARY KEY (player_id, season_id),
    FOREIGN KEY (player_id) REFERENCES public.players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES public.seasons(season_id) ON DELETE CASCADE
);

-- ============================================
-- 9. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('datascout', 'videoscout', 'livescout', 'manager')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_players_current_list ON public.players(current_list);
CREATE INDEX IF NOT EXISTS idx_players_position ON public.players(position_profile);
CREATE INDEX IF NOT EXISTS idx_players_league ON public.players(current_league);
CREATE INDEX IF NOT EXISTS idx_player_ratings_player_id ON public.player_ratings(player_id);
CREATE INDEX IF NOT EXISTS idx_player_ratings_season_id ON public.player_ratings(season_id);
CREATE INDEX IF NOT EXISTS idx_reports_player_id ON public.reports(player_id);
CREATE INDEX IF NOT EXISTS idx_reports_season_id ON public.reports(season_id);
CREATE INDEX IF NOT EXISTS idx_verdicts_player_id ON public.verdicts(player_id);
CREATE INDEX IF NOT EXISTS idx_verdicts_season_id ON public.verdicts(season_id);
CREATE INDEX IF NOT EXISTS idx_data_scouting_player_id ON public.data_scouting_entries(player_id);
CREATE INDEX IF NOT EXISTS idx_data_scouting_season_id ON public.data_scouting_entries(season_id);
CREATE INDEX IF NOT EXISTS idx_videoscouting_player_id ON public.videoscouting_entries(player_id);
CREATE INDEX IF NOT EXISTS idx_videoscouting_season_id ON public.videoscouting_entries(season_id);
CREATE INDEX IF NOT EXISTS idx_live_scouting_player_id ON public.live_scouting_entries(player_id);
CREATE INDEX IF NOT EXISTS idx_live_scouting_season_id ON public.live_scouting_entries(season_id);

-- ============================================
-- Insert default seasons (2020-2026)
-- ============================================
INSERT INTO public.seasons (season_id, start_year, end_year, start_date, end_date) VALUES
    ('2020-2021', 2020, 2021, '2020-07-01', '2021-06-30'),
    ('2021-2022', 2021, 2022, '2021-07-01', '2022-06-30'),
    ('2022-2023', 2022, 2023, '2022-07-01', '2023-06-30'),
    ('2023-2024', 2023, 2024, '2023-07-01', '2024-06-30'),
    ('2024-2025', 2024, 2025, '2024-07-01', '2025-06-30'),
    ('2025-2026', 2025, 2026, '2025-07-01', '2026-06-30')
ON CONFLICT (season_id) DO NOTHING;

-- ============================================
-- VERIFY ALL TABLES WERE CREATED
-- ============================================
SELECT 
    'SUCCESS: All tables created!' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'seasons', 'players', 'player_ratings', 'reports', 'verdicts', 
    'data_scouting_entries', 'videoscouting_entries', 'live_scouting_entries', 'users'
);

-- Show all created tables and their columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'seasons', 'players', 'player_ratings', 'reports', 'verdicts', 
    'data_scouting_entries', 'videoscouting_entries', 'live_scouting_entries', 'users'
)
ORDER BY table_name, ordinal_position;
