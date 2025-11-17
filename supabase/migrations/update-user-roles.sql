-- Update user roles
-- 1. Change jurjan from livescout to admin
-- 2. Add robin as livescout

-- Update jurjan to admin role
UPDATE users
SET role = 'admin'
WHERE username = 'jurjan';

-- Add robin as livescout (if not exists)
INSERT INTO users (username, password, role, name)
VALUES ('robin', 'robin', 'livescout', 'Robin')
ON CONFLICT (username) DO UPDATE
SET role = 'livescout',
    password = 'robin',
    name = 'Robin';

-- Verify the changes
SELECT username, role, name FROM users ORDER BY role, username;
