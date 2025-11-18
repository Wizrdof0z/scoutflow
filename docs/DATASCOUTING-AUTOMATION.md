# Datascouting List Auto-Fill Feature

## Overview
The Datascouting List Auto-Fill feature automatically maintains a minimum of 5 players in the "Datascouting list" by promoting players from "Prospects" based on configurable priority positions.

## How It Works

### 1. User Configuration
- Navigate to **Settings** (icon in top-right header)
- Select up to 3 priority positions:
  - Priority 1 (highest)
  - Priority 2 (medium)
  - Priority 3 (lowest)
- Click **Save Preferences**
- Preferences are stored in the database (accessible across devices)

### 2. Automatic Execution
The automation runs automatically when:
- A datascout user loads the app (HomePage)
- Players are successfully loaded from the database
- The automation has not run yet in the current session

### 3. Selection Logic
When the Datascouting list has fewer than 5 players:

1. **Count Current Players**: Check how many players are in "Datascouting list"
2. **Calculate Needed**: Determine how many more players needed to reach 5
3. **Query Prospects**: Get all players in "Prospects" list, sorted by `createdAt` (oldest first)
4. **Apply Priorities**: 
   - First, select players matching Priority 1 position
   - Then, select players matching Priority 2 position
   - Finally, select players matching Priority 3 position
5. **Fill Remaining**: If still under 5 players, add any remaining prospects (regardless of position)
6. **Update Database**: Move selected players from "Prospects" to "Datascouting list"
7. **Refresh**: Reload player list to reflect changes

### 4. Tiebreaker Rules
When multiple prospects have the same position:
- Oldest prospects are selected first (by `createdAt` timestamp)
- If creation dates are identical, current list order is preserved

## Technical Details

### Database Schema
**Table**: `user_preferences`
- `user_id` (PRIMARY KEY): User identifier
- `priority_position_1`: First priority position
- `priority_position_2`: Second priority position
- `priority_position_3`: Third priority position
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

**RLS Policies**: Users can only view and modify their own preferences

### File Structure
- **Settings UI**: `src/pages/SettingsPage.tsx`
- **Automation Logic**: `src/lib/auto-fill-service.ts`
- **Integration**: `src/pages/HomePage.tsx` (useEffect hook)
- **Migration**: `supabase/migrations/create-user-preferences.sql`

### Key Functions

#### `getUserPreferences(userID: string)`
Fetches user's priority positions from the database.

#### `autoFillDataScoutingList(userID: string, players: Player[], onComplete?: () => void)`
Main automation function:
- Checks if Datascouting list needs filling
- Selects prospects based on priorities and age
- Updates player list assignments
- Calls `onComplete` callback to refresh UI

## Installation

1. **Run Database Migration**:
   ```bash
   # From Supabase dashboard, run:
   # supabase/migrations/create-user-preferences.sql
   ```

2. **Configure Priorities**:
   - Login as datascout user
   - Navigate to Settings
   - Select 3 priority positions
   - Save

3. **Test Automation**:
   - Manually move players from Datascouting list to other lists
   - Ensure Datascouting list has < 5 players
   - Reload the app
   - Verify automation fills list to 5 players

## User Roles
Only users with `role = 'datascout'` trigger the automation. Other roles (admin, videoscout, livescout, viewer) do not have this feature enabled.

## Example Scenario

**Setup**:
- Priority 1: Centre Back
- Priority 2: Fullback (Left)
- Priority 3: Midfielder (Central)
- Datascouting list: 2 players
- Prospects list: 20 players
  - 5 Centre Backs (created 10 days ago)
  - 3 Left Fullbacks (created 8 days ago)
  - 4 Central Midfielders (created 5 days ago)
  - 8 other positions (created 3 days ago)

**Result**:
- Automation needs 3 more players (5 - 2 = 3)
- Selects 3 oldest Centre Backs from Prospects
- Moves them to Datascouting list
- Final count: 5 players in Datascouting list

## Limitations
- Only fills to exactly 5 players (no more, no less)
- Automation runs once per session (uses `useRef` to prevent loops)
- Requires at least 1 priority position configured
- Only affects datascout role users

## Future Enhancements
- Configurable minimum threshold (not just 5)
- Email notifications when automation runs
- Automation history/audit log
- Override toggle to disable automation
- Position-specific weights for more granular control
