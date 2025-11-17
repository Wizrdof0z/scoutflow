-- View all current users
SELECT id, email, name, role, created_at 
FROM public.users 
ORDER BY role, name;

-- Create an admin user (if you need one)
-- First, you need to create the user in Supabase Auth
-- Go to: Authentication > Users > Add User
-- Email: admin@scoutflow.com
-- Password: password123
-- Then run this to add them to public.users:

-- INSERT INTO public.users (id, email, name, role, password_hash)
-- VALUES (
--   '[COPY_THE_UUID_FROM_AUTH_USERS]',
--   'admin@scoutflow.com',
--   'Admin User',
--   'admin',
--   '$2a$10$rKJ5YKEw8vL7z8ZqKj8.eOQXV5XMJ5.1ZHGKZqKJZqKJZqKJZqKJZ'
-- );

-- Or if a user already exists in public.users, update their role:
-- UPDATE public.users 
-- SET role = 'admin'
-- WHERE email = 'your.email@example.com';
