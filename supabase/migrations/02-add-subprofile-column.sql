-- Add sub_profile column to data_scouting_entries table
-- Run this if you already have the data_scouting_entries table but need to add the sub_profile column

ALTER TABLE public.data_scouting_entries 
ADD COLUMN IF NOT EXISTS sub_profile TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'data_scouting_entries'
ORDER BY ordinal_position;
