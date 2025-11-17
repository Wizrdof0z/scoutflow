# User Roles & Permissions System

## Roles

### 1. Admin
**Full access to everything**
- ✅ Add players
- ✅ Delete players
- ✅ Edit player information
- ✅ Change player list
- ✅ View & Edit Data Summary
- ✅ View & Edit Videoscouting Summary
- ✅ View & Edit Live Scouting Summary
- ✅ Upload, download & delete reports
- ✅ Edit ratings

### 2. Datascout
**Data scouting focused**
- ✅ Add players
- ❌ Delete players
- ✅ Edit player information
- ✅ Change player list
- ✅ View & Edit Data Summary
- ✅ View Videoscouting Summary (cannot edit)
- ✅ View Live Scouting Summary (cannot edit)
- ✅ Upload, download & delete reports
- ✅ Edit ratings

### 3. Videoscout
**Video scouting focused**
- ✅ Add players
- ❌ Delete players
- ✅ Edit player information
- ✅ Change player list
- ✅ View Data Summary (cannot edit)
- ✅ View & Edit Videoscouting Summary
- ✅ View Live Scouting Summary (cannot edit)
- ✅ Download reports (cannot upload/delete)
- ❌ Edit ratings

### 4. Livescout
**Live scouting focused**
- ✅ Add players
- ❌ Delete players
- ✅ Edit player information
- ✅ Change player list
- ✅ View Data Summary (cannot edit)
- ✅ View Videoscouting Summary (cannot edit)
- ✅ View & Edit Live Scouting Summary
- ✅ Download reports (cannot upload/delete)
- ❌ Edit ratings

### 5. Viewer
**Read-only access**
- ❌ Add players
- ❌ Delete players
- ❌ Edit player information
- ❌ Change player list
- ✅ View Data Summary (cannot edit)
- ✅ View Videoscouting Summary (cannot edit)
- ✅ View Live Scouting Summary (cannot edit)
- ❌ Upload/download/delete reports
- ❌ Edit ratings

## Database Migration

✅ Migration completed: `supabase/migrations/04-update-user-roles.sql`

This updated:
1. Role constraint to include all 5 roles
2. Added password_hash field for authentication
3. Set default password for existing users

## Creating an Admin User

Since the users table has a foreign key to `auth.users`, you need to:

1. **First check existing users:**
   ```sql
   SELECT id, email, name, role FROM public.users ORDER BY role, name;
   ```

2. **If you have an existing user, update their role:**
   ```sql
   UPDATE public.users 
   SET role = 'admin'
   WHERE email = 'your.email@example.com';
   ```

3. **Or create a new user via Supabase Dashboard:**
   - Go to: Authentication > Users > Add User
   - Email: `admin@scoutflow.com`
   - Password: `password123`
   - Copy the generated UUID
   - Then insert into public.users:
   ```sql
   INSERT INTO public.users (id, email, name, role, password_hash)
   VALUES (
     '[PASTE_UUID_HERE]',
     'admin@scoutflow.com',
     'Admin User',
     'admin',
     '$2a$10$rKJ5YKEw8vL7z8ZqKj8.eOQXV5XMJ5.1ZHGKZqKJZqKJZqKJZqKJZ'
   );
   ```

## Login System

✅ Login page created: `src/pages/LoginPage.tsx`

**Default password for all users:** `password123`

Users can now log in with their email and password. The app will:
1. Query the public.users table
2. Verify credentials (currently accepts any password for development)
3. Set the user in the auth store
4. Redirect to the dashboard

## Usage in Code

```typescript
import { UserPermissions } from '@/types';

// Check if user can perform action
if (UserPermissions.canDeletePlayers(user.role)) {
  // Show delete button
}

if (UserPermissions.canEditDataSummary(user.role)) {
  // Allow editing data summary
}
```

## Next Steps

1. ✅ Database schema updated
2. ✅ TypeScript types updated with permissions
3. ✅ Login page created
4. ⏳ Implement permission checks throughout the app
5. ⏳ Update UI to show/hide features based on role
