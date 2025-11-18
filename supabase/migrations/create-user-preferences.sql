-- Drop existing table if it has RLS enabled
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Create user_preferences table for storing user settings
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  priority_position_1 TEXT,
  priority_position_2 TEXT,
  priority_position_3 TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Note: RLS is not enabled because this app uses custom authentication
-- instead of Supabase Auth. Access control is handled at the application level.
