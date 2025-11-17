-- Add initial users for testing
-- Note: This temporarily drops the foreign key constraint to allow direct insertion

-- Drop the foreign key constraint temporarily
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Insert test users
INSERT INTO public.users (id, email, name, role, password_hash) VALUES
  (gen_random_uuid(), 'jeroen', 'Jeroen', 'datascout', '$2a$10$rKJ5YKEw8vL7z8ZqKj8.eOQXV5XMJ5.1ZHGKZqKJZqKJZqKJZqKJZ'),
  (gen_random_uuid(), 'kyle', 'Kyle', 'videoscout', '$2a$10$rKJ5YKEw8vL7z8ZqKj8.eOQXV5XMJ5.1ZHGKZqKJZqKJZqKJZqKJZ'),
  (gen_random_uuid(), 'toer', 'Toer', 'videoscout', '$2a$10$rKJ5YKEw8vL7z8ZqKj8.eOQXV5XMJ5.1ZHGKZqKJZqKJZqKJZqKJZ'),
  (gen_random_uuid(), 'jurjan', 'Jurjan', 'livescout', '$2a$10$rKJ5YKEw8vL7z8ZqKj8.eOQXV5XMJ5.1ZHGKZqKJZqKJZqKJZqKJZ'),
  (gen_random_uuid(), 'guest', 'Guest', 'viewer', '$2a$10$rKJ5YKEw8vL7z8ZqKj8.eOQXV5XMJ5.1ZHGKZqKJZqKJZqKJZqKJZ')
ON CONFLICT (email) DO NOTHING;

-- Verify the users were created
SELECT id, email, name, role 
FROM public.users 
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1
    WHEN 'datascout' THEN 2
    WHEN 'videoscout' THEN 3
    WHEN 'livescout' THEN 4
    WHEN 'viewer' THEN 5
  END,
  name;
