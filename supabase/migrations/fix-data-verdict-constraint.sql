-- Fix data_scouting_entries data_verdict constraint
-- This allows 'Good', 'Average', and 'Bad' as valid values

-- Drop the existing constraint if it exists
ALTER TABLE public.data_scouting_entries 
DROP CONSTRAINT IF EXISTS data_scouting_entries_data_verdict_check;

-- Add the correct constraint that allows 'Good', 'Average', 'Bad', or NULL
ALTER TABLE public.data_scouting_entries 
ADD CONSTRAINT data_scouting_entries_data_verdict_check 
CHECK (data_verdict IS NULL OR data_verdict IN ('Good', 'Average', 'Bad'));

-- Verify the constraint was added
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.data_scouting_entries'::regclass
AND conname = 'data_scouting_entries_data_verdict_check';
