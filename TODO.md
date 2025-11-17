# ScoutFlow - To-Do List

## Priority Fixes

### 1. ✅ FIXED - Saving Player Ratings with Data Verdicts
**Issue:** Database constraint error when saving "Average" or "Bad" data verdicts
**Status:** FIXED - Code improvements made, database constraint needs to be updated
**Solution:** 
- Enhanced error handling to show actual Supabase errors
- Improved all save functions (ratings, videoscouting, live scouting)
- Created SQL migration to fix data_verdict constraint: `fix-data-verdict-constraint.sql`
**Action Required:** Run the SQL migration in Supabase SQL Editor:
  - Option 1 (Quick): Run `fix-data-verdict-constraint.sql`
  - Option 2 (Complete): Run `00-complete-schema-setup.sql` for full database setup

### 2. ✅ FIXED - Data Verdict Badge Color Coding
**Issue:** "Average" data verdict should show orange in the upper right corner badge, but isn't displaying correctly
**Status:** FIXED - Working correctly now
**Expected behavior:** 
- Good → Green badge ✓
- Average → Orange badge ✓
- Bad → Red badge ✓

## Feature Updates

### 3. ✅ COMPLETED - Adjust Available Positions
**New positions implemented:**
- Goalkeeper
- Centre Back (no hyphen)
- Left Fullback
- Right Fullback  
- Defensive Midfielder
- Central Midfielder
- Attacking Midfielder
- Left Winger
- Right Winger
- Centre Forward

**Files updated:**
- ✅ `src/types/index.ts` - PositionProfile type definition
- ✅ `src/pages/PlayerEntryPage.tsx` - position dropdown options
- ✅ `src/pages/TotalOverviewPage.tsx` - position filter options

### 3b. ✅ COMPLETED - Edit Player Information
**Feature:** Ability to edit player information after creation
- Added "Edit Player Info" button on player profile page
- Created edit form with all editable fields
- Can update: team, league, nationality, foot, position, matches played, market value, contract end date, current list

### 3c. ✅ COMPLETED - Position Subprofiles
**Feature:** Choose subprofile for player's position in Data Summary section
- Centre Back → Technical Centre Back / Physical Centre Back
- Left/Right Fullback → Technical Fullback / Intense Fullback
- Defensive/Central/Attacking Midfielder → Pivot / Box-to-Box
- Left/Right Winger → Inverted Winger / Traditional Winger
- Centre Forward → Second Striker / Direct Striker

**Implementation:**
- Added SubProfile type to types
- Added sub_profile field to DataScoutingEntry
- Selector appears between ratings and Data Verdict
- Subprofile saved with data scouting entry
- Database migration: `02-add-subprofile-column.sql`

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
