# Database Setup Instructions

## 🚨 Current Issues

1. ❌ **Data Verdict Constraint Error**: `"data_scouting_entries" violates check constraint`
2. ❌ **Missing Videoscouting Table**: `Could not find the 'kyle_notes' column`
3. ❌ **Missing Live Scouting Table**: Similar error for live scouting

## ⚡ QUICK FIX - Run This ONE File

### 🎯 **RECOMMENDED: Run `SETUP-ALL-TABLES.sql`**

This single file will:
- ✅ Create ALL required tables
- ✅ Fix ALL constraints
- ✅ Set up ALL indexes
- ✅ Insert default seasons
- ✅ Handle existing tables gracefully

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire content of `SETUP-ALL-TABLES.sql`
3. Paste and click "Run"
4. **Refresh your browser** (important!)
5. Test all save functions

That's it! This fixes everything at once.

---

## 📋 Alternative: Run Migrations in Order

If you prefer step-by-step or already have some tables:

### Step 1: Complete Schema Setup
Run: `00-complete-schema-setup.sql`

This creates all tables with correct constraints:
- ✅ seasons
- ✅ players
- ✅ player_ratings (0-100 scale)
- ✅ reports
- ✅ verdicts
- ✅ data_scouting_entries
- ✅ videoscouting_entries
- ✅ live_scouting_entries
- ✅ users

### Step 2 (Alternative): If Tables Already Exist

If you already have some tables and just need to fix/add specific ones:

1. **Fix data verdict constraint**: Run `fix-data-verdict-constraint.sql`
2. **Create videoscouting/live scouting tables**: Run `01-create-videoscouting-livescouting-tables.sql`

## Individual Fixes (If Needed)

### Fix: Data Verdict Constraint Only
```sql
ALTER TABLE public.data_scouting_entries 
DROP CONSTRAINT IF EXISTS data_scouting_entries_data_verdict_check;

ALTER TABLE public.data_scouting_entries 
ADD CONSTRAINT data_scouting_entries_data_verdict_check 
CHECK (data_verdict IS NULL OR data_verdict IN ('Good', 'Average', 'Bad'));
```

### Fix: Missing Videoscouting/Live Scouting Tables
Run: `01-create-videoscouting-livescouting-tables.sql`

## How to Run Migrations

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the content from the migration file
4. Paste and execute in the SQL Editor
5. Verify there are no errors

## What Was Fixed in the Code

✅ Enhanced error handling to show actual Supabase errors
✅ Improved all save functions (ratings, videoscouting, live scouting)
✅ Added detailed console logging for debugging
✅ Changed undefined values to explicit null for database compatibility
✅ Made data verdict optional when only notes are provided

## Testing After Fix

1. **Refresh your browser** (important - clears Supabase cache)
2. Try saving with "Good" verdict ✓
3. Try saving with "Average" verdict ✓
4. Try saving with "Bad" verdict ✓
5. Try saving **Kyle's videoscouting verdict** ✓
6. Try saving **Toer's videoscouting verdict** ✓
7. Try saving **live scouting percentage** ✓

**Note**: After running any SQL migrations, always refresh your browser to clear the Supabase client cache!

## Migration Files Available

### Core Migrations (Run in Order):
1. **`SETUP-ALL-TABLES.sql`** - Complete database setup with all tables ⭐ RECOMMENDED (includes position & subprofile fixes)
2. **`01-create-videoscouting-livescouting-tables.sql`** - Creates/recreates videoscouting and live scouting tables

### Individual Fixes:
- **`02-add-subprofile-column.sql`** - Adds sub_profile column to data_scouting_entries
- **`03-fix-position-constraint.sql`** - Updates position constraint for new position values ⭐ **RUN THIS NOW**
- **`fix-data-verdict-constraint.sql`** - Fixes data verdict constraint only
- **`fix-rating-constraints.sql`** - Updates rating scale from 0-10 to 0-100
- **`add-videoscouting-livescouting-tables.sql`** - Original migration (use 01-create... instead)

## Environment Setup

Make sure you have a `.env` file with:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
