-- Fix missing videoscouting and live scouting tables
-- Run this if you get errors about missing columns or tables

-- ============================================
-- Drop and recreate videoscouting_entries table
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
-- Drop and recreate live_scouting_entries table
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
-- Create indexes for better performance
-- ============================================
CREATE INDEX idx_videoscouting_entries_player_id ON public.videoscouting_entries(player_id);
CREATE INDEX idx_videoscouting_entries_season_id ON public.videoscouting_entries(season_id);
CREATE INDEX idx_live_scouting_entries_player_id ON public.live_scouting_entries(player_id);
CREATE INDEX idx_live_scouting_entries_season_id ON public.live_scouting_entries(season_id);

-- ============================================
-- Verify tables were created
-- ============================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('videoscouting_entries', 'live_scouting_entries')
ORDER BY table_name, ordinal_position;
