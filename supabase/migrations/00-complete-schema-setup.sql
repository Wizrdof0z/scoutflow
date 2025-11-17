-- Complete database setup for ScoutFlow
-- Run this script in Supabase SQL Editor to set up all tables

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

-- ============================================
-- 3. PLAYER RATINGS TABLE (0-100 scale)
-- ============================================
CREATE TABLE IF NOT EXISTS public.player_ratings (
    player_id TEXT NOT NULL,
    season_id TEXT NOT NULL,
    overall_rating NUMERIC(5,1) CHECK (overall_rating >= 0 AND overall_rating <= 100),
    physical_rating NUMERIC(5,1) CHECK (physical_rating >= 0 AND physical_rating <= 100),
    movement_rating NUMERIC(5,1) CHECK (movement_rating >= 0 AND movement_rating <= 100),
    passing_rating NUMERIC(5,1) CHECK (passing_rating >= 0 AND passing_rating <= 100),
    pressure_rating NUMERIC(5,1) CHECK (pressure_rating >= 0 AND pressure_rating <= 100),
    defensive_rating NUMERIC(5,1) CHECK (defensive_rating >= 0 AND defensive_rating <= 100),
    rated_by TEXT,
    rated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (player_id, season_id),
    FOREIGN KEY (player_id) REFERENCES public.players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES public.seasons(season_id) ON DELETE CASCADE
);

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
CREATE TABLE IF NOT EXISTS public.data_scouting_entries (
    player_id TEXT NOT NULL,
    season_id TEXT NOT NULL,
    data_verdict TEXT CHECK (data_verdict IS NULL OR data_verdict IN ('Good', 'Average', 'Bad')),
    datascout_id TEXT,
    datascouted_at TIMESTAMPTZ,
    notes TEXT,
    PRIMARY KEY (player_id, season_id),
    FOREIGN KEY (player_id) REFERENCES public.players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES public.seasons(season_id) ON DELETE CASCADE
);

-- ============================================
-- 7. VIDEOSCOUTING ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.videoscouting_entries (
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
CREATE TABLE IF NOT EXISTS public.live_scouting_entries (
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
-- 9. USERS TABLE (for scouts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('datascout', 'videoscout', 'livescout', 'manager')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for better query performance
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
-- Verify all tables were created
-- ============================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'seasons', 'players', 'player_ratings', 'reports', 'verdicts', 
    'data_scouting_entries', 'videoscouting_entries', 'live_scouting_entries', 'users'
)
ORDER BY table_name;
