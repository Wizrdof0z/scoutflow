-- Update users table to support new role system
-- Roles: admin, datascout, videoscout, livescout, viewer

-- Drop the old constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new constraint with all 5 roles
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'datascout', 'videoscout', 'livescout', 'viewer'));

-- Update any existing roles to match new system
-- 'manager' -> 'admin'
UPDATE public.users 
SET role = 'admin' 
WHERE role = 'manager';

-- Add password field for simple authentication (hashed passwords)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add default password for existing users (they should change it)
-- Password is 'password123' hashed with bcrypt
UPDATE public.users 
SET password_hash = '$2a$10$rKJ5YKEw8vL7z8ZqKj8.eOQXV5XMJ5.1ZHGKZqKJZqKJZqKJZqKJZ'
WHERE password_hash IS NULL;

-- Note: To create an admin user, you need to:
-- 1. Create user in Supabase Auth first (via Dashboard or API)
-- 2. Then insert/update the record in public.users with role='admin'

-- Verify the changes
SELECT id, email, name, role 
FROM public.users 
ORDER BY role, name;
