# SkillCorner API Integration Documentation

## Overview

This document explains how ScoutFlow integrates with the SkillCorner API to fetch player statistics, how the data is stored in our database, and how we transform raw metrics into percentile-based ratings for player evaluation.

---

## Table of Contents

1. [API Request Architecture](#api-request-architecture)
2. [Data Storage Strategy](#data-storage-strategy)
3. [Percentile Calculation System](#percentile-calculation-system)
4. [Complete Data Flow](#complete-data-flow)

---

## API Request Architecture

### Authentication

All API requests use **Basic Authentication**:

```typescript
const SKILLCORNER_AUTH = 'Basic ' + btoa('email:password')
```

### API Endpoints Overview

We make requests to four main SkillCorner API endpoints:

#### 1. **Competition Editions API**
```
GET https://skillcorner.com/api/competition_editions/?user=true
```
- **Purpose**: Fetch all available competitions and seasons
- **Response**: List of competition editions with IDs, names, and season information
- **Use**: Foundation for hierarchical data fetching

#### 2. **Teams API**
```
GET https://skillcorner.com/api/teams/?competition_edition={id}&user=true
```
- **Purpose**: Fetch all teams in a specific competition edition
- **Response**: Team details including ID, name, and stadium information
- **Use**: Identify team contexts for player statistics

#### 3. **Players API**
```
GET https://skillcorner.com/api/players/?team={team_id}&competition_edition={edition_id}
```
- **Purpose**: Fetch player roster for a specific team and competition
- **Response**: Player biographical data (name, DOB, position)
- **Use**: Build player registry and link to statistics

#### 4. **Statistics APIs** (4 separate endpoints)

##### a. Physical Data
```
GET https://skillcorner.com/api/physical/
  ?competition_edition={id}
  &team={id}
  &position=LCB,CB,RCB,LWB,LB,RB,RWB,LDM,DM,RDM,LM,CM,RM,AM,LW,RW,LF,RF,CF
  &position_group=CentralDefender,FullBack,Midfield,WideAttacker,CenterForward
  &results=win,lose,draw
  &venue=home,away
  &period=full
  &possession=all
  &physical_check_passed=true
  &group_by=player,team,position_group,position,season
  &response_format=json
  &average_per=p90
  &data_version=3.0.2
```

**Key Metrics Returned:**
- Speed: `psv99` (peak speed), `timetosprint_top3`, `timetohsr_top3`
- Acceleration: `explacceltosprint_count_full_all_p90`, `explacceltohsr_count_full_all_p90`
- Agility: `timetohsrpostcod_top3`, `timetosprintpostcod_top3`, `cod_count_full_all_p90`
- Distance: `total_distance_full_all_p90`, `sprint_distance_full_all_p90`, `hsr_distance_full_all_p90`
- Intensity: `sprint_count_full_all_p90`, `total_metersperminute_full_all_p90`

##### b. Off-Ball Runs
```
GET https://skillcorner.com/api/in_possession/off_ball_runs/
  ?competition_edition={id}
  &team={id}
  &date__lte={today}
  &results=win,lose,draw
  &venue=home,away
  &channel=all
  &third=all
  &run_type=run_in_behind,run_ahead_of_the_ball,support_run,pulling_wide_run,
             coming_short_run,underlap_run,overlap_run,dropping_off_run,
             pulling_half_space_run,cross_receiver_run
  &average_per=match
  &group_by=player,team,position,season,competition
```

**Key Metrics Returned:**
- Run counts per match: `count_runs_in_behind_per_match`, `count_runs_ahead_of_the_ball_per_match`
- Dangerous runs: `count_dangerous_runs_in_behind_per_match`
- Run effectiveness: `count_runs_in_behind_leading_to_shot_per_match`, `count_runs_in_behind_leading_to_goal_per_match`
- Various run types: support runs, overlap runs, underlap runs, pulling wide/half-space runs

##### c. On-Ball Pressures
```
GET https://skillcorner.com/api/in_possession/on_ball_pressures/
  ?competition_edition={id}
  &team={id}
  &date__lte={today}
  &results=win,lose,draw
  &venue=home,away
  &channel=all
  &third=all
  &pressure_intensity=low,medium,high
  &average_per=match
  &group_by=player,team,position,season,competition
```

**Key Metrics Returned:**
- Ball retention under pressure: `ball_retention_ratio_under_low_pressure`, `ball_retention_ratio_under_medium_pressure`, `ball_retention_ratio_under_high_pressure`
- Pass effectiveness under pressure: `dangerous_pass_completion_ratio_under_high_pressure`
- Engagement counts: `count_total_on_ball_pressures_per_match`, `count_on_ball_high_pressures_per_match`

##### d. Passing
```
GET https://skillcorner.com/api/in_possession/passes/
  ?competition_edition={id}
  &team={id}
  &date__lte={today}
  &results=win,lose,draw
  &venue=home,away
  &channel=all
  &third=all
  &run_type=[same as off-ball runs]
  &average_per=match
  &group_by=player,team,position,season,competition
```

**Key Metrics Returned:**
- Pass opportunities: `count_pass_opportunities_to_dangerous_runs_in_behind_per_match`
- Pass attempts: `count_pass_attempts_to_dangerous_runs_in_behind_per_match`
- Pass completions: `count_completed_pass_to_dangerous_runs_in_behind_per_match`
- Threat created: `runs_in_behind_to_which_pass_completed_threat_per_match`

### Rate Limiting

We implement a **sliding window rate limiter** to respect API limits:

```typescript
const MAX_REQUESTS_PER_SECOND = 15
const MIN_INTERVAL_MS = 1000 / MAX_REQUESTS_PER_SECOND // ~67ms between requests
```

**Features:**
- Tracks recent request timestamps
- Automatically throttles requests to stay under 15 req/s
- Ensures fair distribution of API calls

### Request Flow Hierarchy

```
1. Fetch Competition Editions
   ↓
2. For each Competition Edition:
   ↓
   2a. Fetch Teams
       ↓
       2b. For each Team:
           ↓
           2b1. Fetch Players
           2b2. Fetch Physical Stats
           2b3. Fetch Off-Ball Runs
           2b4. Fetch On-Ball Pressures
           2b5. Fetch Passing Stats
```

---

## Data Storage Strategy

### Database Schema Overview

We store data in **three layers**:

#### Layer 1: Reference Data (Metadata)
```
competition_editions  ← Competition/season information
teams                 ← Team details
player                ← Player biographical data
```

#### Layer 2: Raw Statistics (Per-Match Averages)
```
physical_p90              ← Physical metrics normalized per 90 minutes
off_ball_runs_pmatch      ← Off-ball movement metrics per match
on_ball_pressures_pmatch  ← Pressure handling metrics per match
passing_pmatch            ← Passing metrics per match
```

#### Layer 3: Computed Ratings (Percentile-Based)
```
cf_player_ratings         ← Center Forward ratings
winger_player_ratings     ← Winger (LW/RW) ratings
am_player_ratings         ← Attacking Midfielder ratings
cm_player_ratings         ← Central Midfielder ratings
dm_player_ratings         ← Defensive Midfielder ratings
fullback_player_ratings   ← Fullback (LB/RB) ratings
cb_player_ratings         ← Center Back ratings
```

### Storage Process

#### Step 1: Fetch and Store Reference Data

**Competition Editions:**
```typescript
const data = await fetchFromSkillCorner('/competition_editions/?user=true')

await supabase.from('competition_editions').upsert({
  competition_edition_id: item.id,
  competition_id: item.competition.id,
  competition_name: item.competition.name,
  season_name: item.season.name
}, { onConflict: 'competition_edition_id' })
```

**Teams:**
```typescript
await supabase.from('teams').upsert({
  competition_edition_id,
  team_id: team.id,
  team_name: team.name,
  stadium_id: team.stadium?.id,
  stadium_name: team.stadium?.name
}, { onConflict: 'team_id,competition_edition_id' })
```

**Players:**
```typescript
await supabase.from('player').upsert({
  player_id: player.id,
  first_name: player.first_name,
  last_name: player.last_name,
  short_name: player.short_name,
  player_birthdate: player.birthday,
  team_id,
  competition_edition_id
}, { onConflict: 'player_id,team_id,competition_edition_id' })
```

#### Step 2: Fetch and Store Raw Statistics

Each statistics table uses **composite keys** to ensure uniqueness:

```typescript
// Physical Data
await supabase.from('physical_p90').upsert(records, {
  onConflict: 'player_id,competition_edition_id,position'
})

// Off-Ball Runs
await supabase.from('off_ball_runs_pmatch').upsert(records, {
  onConflict: 'player_id,competition_edition_id,team_id,position'
})

// On-Ball Pressures
await supabase.from('on_ball_pressures_pmatch').upsert(records, {
  onConflict: 'player_id,competition_edition_id,team_id,position'
})

// Passing
await supabase.from('passing_pmatch').upsert(records, {
  onConflict: 'player_id,competition_edition_id,team_id,position'
})
```

**Conflict Resolution:**
- `upsert` updates existing records or inserts new ones
- Composite keys prevent duplicates
- Ensures data freshness on re-fetch

#### Step 3: Generate Percentile Ratings

This happens through **SQL migrations** that create materialized tables with percentile calculations (see next section).

---

## Percentile Calculation System

### Concept

Instead of comparing raw numbers (e.g., "Player A ran 10.5 km"), we calculate **percentile rankings** (e.g., "Player A is in the 87th percentile for distance covered") by comparing each player to all others in the **same competition**.

### Why Competition-Based Percentiles?

- **Fair Comparison**: Premier League players shouldn't be compared to League Two players
- **Context Matters**: Competition quality varies significantly
- **Meaningful Rankings**: 75th percentile in La Liga means something specific to that competition

### Percentile Calculation Logic

We use PostgreSQL's `PERCENT_RANK()` window function:

```sql
PERCENT_RANK() OVER (
  PARTITION BY competition_edition_id 
  ORDER BY metric_value [ASC/DESC]
) * 100
```

**Key Points:**
- `PARTITION BY competition_edition_id`: Separate rankings per competition
- `ORDER BY metric_value`: Sort by metric value
  - `ASC` for metrics where **higher is better** (e.g., speed, distance)
  - `DESC` for metrics where **lower is better** (e.g., time to sprint)
- `* 100`: Convert 0-1 scale to 0-100 percentile

### Example Calculation: Attacking Midfielder Speed Rating

```sql
WITH percentiles AS (
  SELECT 
    player_id,
    competition_edition_id,
    
    -- Lower time is better → use DESC
    CASE WHEN timetohsr_top3 IS NOT NULL 
      THEN PERCENT_RANK() OVER (
        PARTITION BY competition_edition_id 
        ORDER BY timetohsr_top3 DESC
      ) * 100 
    END as pct_timetohsr,
    
    CASE WHEN timetosprint_top3 IS NOT NULL 
      THEN PERCENT_RANK() OVER (
        PARTITION BY competition_edition_id 
        ORDER BY timetosprint_top3 DESC
      ) * 100 
    END as pct_timetosprint,
    
    -- Higher speed is better → use ASC
    CASE WHEN psv99 IS NOT NULL 
      THEN PERCENT_RANK() OVER (
        PARTITION BY competition_edition_id 
        ORDER BY psv99 ASC
      ) * 100 
    END as pct_psv99,
    
    CASE WHEN explacceltosprint_count_full_all_p90 IS NOT NULL 
      THEN PERCENT_RANK() OVER (
        PARTITION BY competition_edition_id 
        ORDER BY explacceltosprint_count_full_all_p90 ASC
      ) * 100 
    END as pct_explacceltosprint
    
  FROM physical_p90
  WHERE position IN ('AM', 'CAM', 'LM', 'RM')
)
SELECT
  player_id,
  competition_edition_id,
  
  -- Speed Rating: Average of all speed percentiles
  ROUND((
    COALESCE(pct_timetohsr, 0) + 
    COALESCE(pct_timetosprint, 0) + 
    COALESCE(pct_psv99, 0) + 
    COALESCE(pct_explacceltosprint, 0)
  ) / 
  NULLIF(
    (CASE WHEN pct_timetohsr IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN pct_timetosprint IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN pct_psv99 IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN pct_explacceltosprint IS NOT NULL THEN 1 ELSE 0 END), 
    0
  ), 2) as speed
  
FROM percentiles
```

**This calculates:**
1. Percentile for each individual speed metric
2. Averages only the non-NULL percentiles
3. Rounds to 2 decimal places
4. Results in a 0-100 speed rating

### Position-Specific Rating Categories

Each position has custom categories relevant to their role:

#### **Center Forward (CF)**
1. **Speed**: Sprint speed, acceleration
2. **Agility**: Change of direction, turning speed
3. **Stamina**: Distance covered, sprint count
4. **Chance Creation**: Runs into box, dangerous runs
5. **Finishing Threat**: Shots per run, goals per run
6. **Hold-Up Play**: Ball retention under pressure
7. **Link-Up Play**: Pass completion to dangerous areas

#### **Winger (LW/RW)**
1. **Speed**: Peak speed, explosive acceleration
2. **Agility**: Quick turns, directional changes
3. **Stamina**: High-intensity distance
4. **Attacking Runs**: Runs in behind, pulling wide
5. **Dribbling Threat**: Successful take-ons under pressure
6. **Crossing**: Cross attempts and completion
7. **Creativity**: Pass attempts to dangerous runs

#### **Attacking Midfielder (AM)**
1. **Speed**: Acceleration, top speed
2. **Agility**: Maneuverability metrics
3. **Stamina**: Total distance, intensity
4. **Creativity**: Progressive passes, key passes
5. **Chance Creation**: Pass opportunities to runs
6. **Danger in the Box**: Goal-scoring runs
7. **Pressure Handling**: Ball retention under pressure

#### **Central Midfielder (CM)**
1. **Speed**: Sprint capability
2. **Agility**: Quick movements
3. **Stamina**: Box-to-box coverage
4. **Distribution**: Pass variety and completion
5. **Defensive Contribution**: Pressing, regains
6. **Creativity**: Through balls, line-breaking passes
7. **Pressure Handling**: Composure under pressure

#### **Defensive Midfielder (DM)**
1. **Speed**: Recovery runs
2. **Agility**: Positioning adjustments
3. **Stamina**: Defensive coverage
4. **Defensive Actions**: Interceptions, tackles
5. **Pressing**: Engagement frequency and success
6. **Distribution**: Pass accuracy from deep
7. **Shielding**: Ball retention in defensive third

#### **Fullback (LB/RB/LWB/RWB)**
1. **Speed**: Sprint speed for recovery/overlap
2. **Agility**: Directional changes
3. **Stamina**: Up-and-down the flank
4. **Defensive Actions**: 1v1 defending success
5. **Attacking Contribution**: Overlap runs, crosses
6. **Pressing**: Engagement in wide areas
7. **Distribution**: Pass completion in final third

#### **Center Back (CB)**
1. **Speed**: Recovery speed
2. **Agility**: Turning speed to track runs
3. **Stamina**: Positional coverage
4. **Defensive Actions**: Tackles, interceptions, clearances
5. **Aerial Ability**: Aerial duel success
6. **Composure**: Ball retention under pressure
7. **Distribution**: Pass accuracy from back

### Handling Missing Data

**Strategy: Average only available metrics**

```sql
-- Only count non-NULL values in average
(metric1 + metric2 + metric3) / 
NULLIF(
  (CASE WHEN metric1 IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN metric2 IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN metric3 IS NOT NULL THEN 1 ELSE 0 END),
  0
)
```

**Benefits:**
- Players aren't penalized for missing data
- Ratings reflect actual available performance
- No artificial zeros skewing results

---

## Complete Data Flow

### End-to-End Process

```
┌─────────────────────────────────────────────────────────────────┐
│                     1. API DATA FETCHING                        │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  SkillCorner API                                                │
│  ├── Competition Editions                                        │
│  ├── Teams                                                       │
│  ├── Players                                                     │
│  └── Statistics                                                  │
│      ├── Physical (per 90 min)                                  │
│      ├── Off-Ball Runs (per match)                              │
│      ├── On-Ball Pressures (per match)                          │
│      └── Passing (per match)                                    │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                   2. RAW DATA STORAGE                           │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Database - Layer 1: Reference Tables                  │
│  ├── competition_editions (competitions & seasons)              │
│  ├── teams (team information)                                   │
│  └── player (player biographical data)                          │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Database - Layer 2: Statistics Tables                │
│  ├── physical_p90 (physical metrics per 90 min)                │
│  ├── off_ball_runs_pmatch (movement metrics per match)          │
│  ├── on_ball_pressures_pmatch (pressure handling per match)     │
│  └── passing_pmatch (passing metrics per match)                 │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                3. PERCENTILE CALCULATION                        │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  SQL Migration Process (Automated)                              │
│  ├── Join physical_p90 + off_ball_runs + pressures + passing   │
│  ├── Calculate PERCENT_RANK() for each metric                  │
│  ├── Group metrics into position-specific categories           │
│  ├── Average percentiles within each category                  │
│  └── Round to 2 decimal places (0-100 scale)                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Database - Layer 3: Ratings Tables                   │
│  ├── cf_player_ratings (Center Forward ratings)                │
│  ├── winger_player_ratings (Winger ratings)                    │
│  ├── am_player_ratings (Attacking Midfielder ratings)          │
│  ├── cm_player_ratings (Central Midfielder ratings)            │
│  ├── dm_player_ratings (Defensive Midfielder ratings)          │
│  ├── fullback_player_ratings (Fullback ratings)                │
│  └── cb_player_ratings (Center Back ratings)                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                    4. FRONTEND DISPLAY                          │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  User Interface (SkillCorner Views Page)                        │
│  ├── Select Position → Query position-specific ratings table   │
│  ├── Apply Filters (age, matches, season, competition, team)   │
│  ├── Display in sortable table                                 │
│  │   ├── Player name, age, team                                │
│  │   ├── Category ratings (0-100, color-coded)                 │
│  │   └── Match count                                           │
│  └── Click player → View detailed profile with raw metrics     │
└─────────────────────────────────────────────────────────────────┘
```

### Triggering the Data Pipeline

**Manual Trigger (Settings Page):**

```typescript
// Admin users can trigger data fetching
const { populateInPossessionData } = await import('@/utils/populate-in-possession-data')

const stats = await populateInPossessionData(
  seasonFilter,      // Optional: e.g., "2023/2024"
  competitionFilter  // Optional: e.g., "Premier League"
)

// Returns statistics:
// {
//   physical: { success: X, skipped: Y, error: Z },
//   offBallRuns: { success: X, skipped: Y, error: Z },
//   onBallPressures: { success: X, skipped: Y, error: Z },
//   passing: { success: X, skipped: Y, error: Z }
// }
```

**Automated Process:**
1. User clicks "Fetch SkillCorner Statistics" in Settings
2. System fetches from all 4 API endpoints
3. Data is upserted into raw statistics tables
4. Percentile calculations auto-update (materialized tables)
5. Frontend queries position-specific ratings tables

### Performance Optimizations

**1. Position-Specific Tables**
- Instead of one giant `player_stats` table
- Separate table per position: `cf_player_ratings`, `am_player_ratings`, etc.
- Faster queries (smaller indexes, less data to scan)

**2. Composite Primary Keys**
```sql
PRIMARY KEY (player_id, competition_edition_id, team_id)
```
- Ensures uniqueness
- Fast lookups by player/competition/team

**3. Pre-Computed Percentiles**
- Ratings calculated during data import (not on-the-fly)
- Frontend queries are simple SELECTs
- No complex joins or window functions at query time

**4. Selective Data Fetching**
```typescript
// Query only the specific position table
const { data } = await supabase
  .from('cf_player_ratings')  // Not a giant unified table
  .select('*')
  .limit(5000)
```

---

## Example: From API to Display

### Step-by-Step for a Center Forward

**1. API Request**
```
GET https://skillcorner.com/api/physical/
  ?competition_edition=1230
  &team=456
  &position=CF
  &average_per=p90
```

**Response:**
```json
{
  "player_id": 12345,
  "player_name": "John Striker",
  "timetosprint_top3": 2.8,
  "psv99": 34.2,
  "sprint_count_full_all_p90": 8.5,
  "total_distance_full_all_p90": 10500,
  // ... more metrics
}
```

**2. Store in `physical_p90`**
```sql
INSERT INTO physical_p90 (
  player_id, 
  timetosprint_top3, 
  psv99, 
  sprint_count_full_all_p90,
  -- ...
) VALUES (12345, 2.8, 34.2, 8.5, ...);
```

**3. Calculate Percentiles (Migration)**
```sql
-- In create-cf-player-ratings-table.sql
WITH percentiles AS (
  SELECT 
    player_id,
    PERCENT_RANK() OVER (
      PARTITION BY competition_edition_id 
      ORDER BY timetosprint_top3 DESC  -- Lower is better
    ) * 100 as pct_timetosprint,
    
    PERCENT_RANK() OVER (
      PARTITION BY competition_edition_id 
      ORDER BY psv99 ASC  -- Higher is better
    ) * 100 as pct_psv99,
    
    -- ... more percentiles
  FROM physical_p90
  WHERE position = 'CF'
)
SELECT
  player_id,
  ROUND((
    COALESCE(pct_timetosprint, 0) + 
    COALESCE(pct_psv99, 0) + 
    -- average 5 speed metrics
  ) / 5, 2) as speed
FROM percentiles;
```

**Results:**
- John's `timetosprint_top3` of 2.8s ranks in **82nd percentile**
- John's `psv99` of 34.2 km/h ranks in **75th percentile**
- Average → John's **Speed Rating: 78.5 / 100**

**4. Store in `cf_player_ratings`**
```sql
INSERT INTO cf_player_ratings (
  player_id,
  player_name,
  speed,
  agility,
  stamina,
  -- ... other categories
) VALUES (12345, 'John Striker', 78.5, 72.3, 85.1, ...);
```

**5. Display in Frontend**
```tsx
// User selects "CF" position
const data = await supabase
  .from('cf_player_ratings')
  .select('*')

// Show in table:
// | Name         | Speed | Agility | Stamina | ... |
// | John Striker | 78.5  | 72.3    | 85.1    | ... |
```

---

## Summary

### API Requests
- **What**: Fetch player statistics from SkillCorner API
- **Where**: 4 endpoints (physical, off-ball runs, pressures, passing)
- **How**: Basic auth, rate-limited (15 req/s), hierarchical (competitions → teams → players → stats)

### Data Storage
- **What**: Store raw metrics and computed ratings
- **Where**: Supabase PostgreSQL database
- **How**: 3 layers (reference data, raw statistics, computed ratings)

### Percentile Calculations
- **What**: Transform raw metrics into 0-100 ratings
- **Where**: SQL migrations create position-specific ratings tables
- **How**: `PERCENT_RANK()` window function, partitioned by competition, averaged by category

### Result
- Fast, efficient player comparisons
- Position-relevant categories
- Fair, context-aware rankings within competitions
- Pre-computed ratings for instant querying

---

## Technical Files Reference

### Data Fetching
- `src/utils/populate-skillcorner-data.ts` - Competition/team/player data
- `src/utils/populate-in-possession-data.ts` - Statistics data (physical + in-possession)
- `src/utils/populate-physical-data.ts` - Legacy physical data fetcher

### Database Queries
- `src/lib/supabase-service.ts` - Query functions for frontend
- Function: `getSkillCornerStatsByPosition(position)` - Main query for ratings

### Percentile Calculations
- `supabase/migrations/create-cf-player-ratings-table.sql` - Center Forward
- `supabase/migrations/create-am-player-ratings-table.sql` - Attacking Midfielder
- `supabase/migrations/create-cm-player-ratings-table.sql` - Central Midfielder
- `supabase/migrations/create-dm-player-ratings-table.sql` - Defensive Midfielder
- `supabase/migrations/create-fullback-player-ratings-table.sql` - Fullbacks
- `supabase/migrations/create-cb-player-ratings-table.sql` - Center Backs
- `supabase/migrations/create-winger-player-ratings-table.sql` - Wingers

### Frontend Display
- `src/pages/SkillCornerViewsPage.tsx` - Main ratings display page
- `src/pages/SkillCornerPlayerProfilePage.tsx` - Individual player profile
