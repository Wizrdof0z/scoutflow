# ScoutFlow - To-Do List

## Priority Fixes

### 1. Fix Saving Player Ratings
**Issue:** Players ratings cannot be saved - error is occurring when trying to save ratings
**Impact:** Critical - blocks core data scouting functionality
**Location:** PlayerProfilePage.tsx - handleSaveRatings function
**Investigation needed:**
- Check console error messages
- Verify Supabase player_ratings table schema
- Check if rated_by field expects UUID vs TEXT
- Verify rating value constraints (should be 0-100 floats)

### 2. Data Verdict Badge Color Coding
**Issue:** "Average" data verdict should show orange in the upper right corner badge, but isn't displaying correctly
**Current behavior:** "Good" verdict correctly shows green
**Expected behavior:** 
- Good → Green badge
- Average → Orange badge  
- Bad → Red badge
**Location:** PlayerProfilePage.tsx - badge rendering section (around line 430-450)
**Fix:** Check the variant prop mapping for dataVerdict badges

## Feature Updates

### 3. Adjust Available Positions
**Current positions:** Goalkeeper, Centre-Back, Full-Back, Defensive Midfielder, Central Midfielder, Attacking Midfielder, Winger, Striker

**New positions required:**
- Centre Back (note: no hyphen)
- Left Fullback
- Right Fullback  
- Defensive Midfielder
- Central Midfielder
- Attacking Midfielder
- Right Winger
- Left Winger
- Centre Forward

**Files to update:**
- `src/types/index.ts` - PositionProfile type definition
- `src/pages/PlayerEntryPage.tsx` - position dropdown options
- `src/pages/TotalOverviewPage.tsx` - position filter options
- Any other components referencing position options

### 4. Add Ratings-Based List Page
**Feature:** New page showing players grouped by their metric ratings

**Requirements:**
- Create new page accessible from navigation or dashboard
- Filter/sort players by rating metrics:
  - Overall (0-100)
  - Physical (0-100)
  - Movement (0-100)
  - Passing (0-100)
  - Pressure (0-100)
  - Defensive (0-100)
- Display options:
  - Select which metric to view
  - Sort by highest/lowest
  - Filter by rating ranges (e.g., 80-100, 60-79, 40-59, 0-39)
  - Show player name, position, team, rating value
  - Click player to go to profile
- UI suggestions:
  - Dropdown or tabs to select metric
  - Slider or range inputs for filtering
  - Table or card grid layout
  - Color-code ratings (green high, orange mid, red low)

**Implementation:**
- Create `src/pages/RatingsListPage.tsx`
- Add route in `src/App.tsx`
- Add navigation link in `src/components/Layout.tsx`
- Query players with ratings from store
- Filter and sort based on selected metric

## Database Migrations Needed

**Status:** The following SQL migration files are ready but NOT yet run in Supabase:

1. `fix-rating-constraints.sql` - Updates rating constraints from 0-10 to 0-100
2. `add-videoscouting-livescouting-tables.sql` - Creates videoscouting_entries and live_scouting_entries tables with Kyle/Toer fields
3. `fix-user-columns.sql` - Changes UUID columns to TEXT for rated_by, uploaded_by, scout_id, datascout_id

**Action required:** Run these migrations in Supabase SQL Editor before full testing

## Future Enhancements (Backlog)

- Export player data to CSV/Excel
- Advanced search functionality
- Player comparison view (side-by-side)
- Historical season comparisons
- User authentication and role-based permissions
- Notification system for scout assignments
- Mobile responsive improvements
- Dark mode support
- Bulk player import
- Integration with external data sources (Transfermarkt, etc.)
