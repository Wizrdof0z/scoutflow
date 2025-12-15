-- Fix reports table to auto-generate report_id
-- First check if report_id is uuid or text
DO $$ 
BEGIN
  -- Make report_id have a default value (UUID)
  ALTER TABLE reports 
  ALTER COLUMN report_id SET DEFAULT gen_random_uuid();
  
  -- If report_id is text, update to use uuid
  -- ALTER TABLE reports 
  -- ALTER COLUMN report_id TYPE uuid USING report_id::uuid;
  
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not alter report_id, it may already have correct settings';
END $$;

-- Make sure uploaded_at has default
ALTER TABLE reports 
ALTER COLUMN uploaded_at SET DEFAULT now();
