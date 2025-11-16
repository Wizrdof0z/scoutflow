-- Fix rating constraints to accept 0-100 scale instead of 0-10
-- Run this in Supabase SQL Editor

-- Drop old check constraints (0-10 range)
ALTER TABLE public.player_ratings 
DROP CONSTRAINT IF EXISTS player_ratings_overall_rating_check,
DROP CONSTRAINT IF EXISTS player_ratings_physical_rating_check,
DROP CONSTRAINT IF EXISTS player_ratings_movement_rating_check,
DROP CONSTRAINT IF EXISTS player_ratings_passing_rating_check,
DROP CONSTRAINT IF EXISTS player_ratings_pressure_rating_check,
DROP CONSTRAINT IF EXISTS player_ratings_defensive_rating_check;

-- Add new check constraints (0-100 range with decimal precision)
ALTER TABLE public.player_ratings 
ADD CONSTRAINT player_ratings_overall_rating_check 
    CHECK (overall_rating >= 0 AND overall_rating <= 100),
ADD CONSTRAINT player_ratings_physical_rating_check 
    CHECK (physical_rating >= 0 AND physical_rating <= 100),
ADD CONSTRAINT player_ratings_movement_rating_check 
    CHECK (movement_rating >= 0 AND movement_rating <= 100),
ADD CONSTRAINT player_ratings_passing_rating_check 
    CHECK (passing_rating >= 0 AND passing_rating <= 100),
ADD CONSTRAINT player_ratings_pressure_rating_check 
    CHECK (pressure_rating >= 0 AND pressure_rating <= 100),
ADD CONSTRAINT player_ratings_defensive_rating_check 
    CHECK (defensive_rating >= 0 AND defensive_rating <= 100);

-- Also ensure the columns are NUMERIC/DECIMAL type to support decimals
ALTER TABLE public.player_ratings
ALTER COLUMN overall_rating TYPE NUMERIC(5,1),
ALTER COLUMN physical_rating TYPE NUMERIC(5,1),
ALTER COLUMN movement_rating TYPE NUMERIC(5,1),
ALTER COLUMN passing_rating TYPE NUMERIC(5,1),
ALTER COLUMN pressure_rating TYPE NUMERIC(5,1),
ALTER COLUMN defensive_rating TYPE NUMERIC(5,1);

-- Verify changes
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.player_ratings'::regclass
AND contype = 'c'
ORDER BY conname;
