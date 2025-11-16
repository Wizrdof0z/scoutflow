# ScoutFlow - Football Scouting Workflow Application

## Overview
ScoutFlow is a comprehensive football scouting application designed to manage the complete scouting workflow from initial data analysis through video scouting to live match observation. The system ensures unbiased scouting by hiding previous verdicts at each stage.

## Core Concept
Players move through different lists in the scouting pipeline, with each stage providing only the relevant information to prevent bias:
1. **Prospects** - Initial player pool
2. **Datascouting list** - Players undergoing data analysis
3. **Videoscouting list** - Players being evaluated via video
4. **Live scouting list** - Players being watched live
5. **Potential list** - Players showing promise
6. **Not interesting list** - Players ruled out

## Key Features

### 1. Player Management
- Add players with comprehensive information (name, DOB, team, league, nationality, position, market value, contract details)
- Players automatically get a unique ID based on name + date of birth
- Track current list status for each player
- Move players between lists manually

### 2. Data Scouting (0-100 Rating Scale)
**Available for:** Prospects, Datascouting list
- Rate players across 6 metrics (0-100 with 0.1 precision):
  - Overall
  - Physical
  - Movement
  - Passing
  - Pressure
  - Defensive
- Assign Data Verdict: Good (green) / Average (orange) / Bad (red)
- Add notes about data analysis
- Upload scouting reports (PDFs)

**Privacy:** Video scouts cannot see data ratings or verdicts when player is on Videoscouting list

### 3. Video Scouting (Two Independent Scouts)
**Available for:** Videoscouting list
- Two videoscouts (Kyle and Toer) provide independent verdicts:
  - Follow-up (green) - Player worth pursuing
  - Continue Monitoring (orange) - Keep watching
  - Not Good Enough (red) - Not suitable
- Each scout has separate notes field
- Side-by-side verdict sections for easy comparison

**Privacy:** Video scouts don't see data scouting results; live scouts don't see video verdicts

### 4. Live Scouting (Percentage-Based with 7 Tiers)
**Available for:** Live scouting list
- Percentage slider (0-100) to grade live performance
- Automatically categorized into 7 tiers:
  - **Top (80%+)** - Green - Elite level
  - **Subtop (75-79%)** - Green - High quality
  - **Heracles (70-74%)** - Green - Mid-table Eredivisie
  - **Bottom Eredivisie (65-69%)** - Orange - Lower Eredivisie
  - **KKD Subtop (60-64%)** - Orange - Top second tier
  - **KKD Mid-Table (55-59%)** - Red - Mid second tier
  - **KKD Bottom (50-54%)** - Red - Lower second tier
- Add notes about live performance

**Privacy:** Live scouts don't see previous data or video verdicts

### 5. Dashboard (Homepage)
Shows three main sections:

**List Cards:**
- 6 cards showing player count in each list
- Click to view all players in that list

**Datascouting Access:**
- Good (count) - Players with good data verdicts
- Average (count) - Players with average data verdicts
- Bad (count) - Players with bad data verdicts

**Videoscouting Access:**
- Follow-up (count) - Players both scouts want to pursue
- Continue Monitoring (count) - Players to keep watching
- Not Good Enough (count) - Players ruled out by video

**Live Scouting Access:**
- 7 category cards showing player counts per tier
- Click any card to see filtered list of players

### 6. Total Overview
Comprehensive filterable table showing all players with:

**Filters (Multi-select):**
- Competition (league)
- Team
- Position
- Contract Until (year range slider)

**Player Information Displayed:**
- Name (clickable link to profile)
- Date of Birth + Age
- Position
- Market Value
- Contract End Date
- Overall Rating (if rated)
- Data Verdict (color-coded badge)
- Kyle Verdict (color-coded badge)
- Toer Verdict (color-coded badge)
- Live Scouting Grade (color-coded badge)

### 7. Player Profile Page
Conditional rendering based on player's current list:

**Always Visible:**
- Player details (header with badges)
- Basic information card
- Season selector

**Prospects:**
- Data Summary (ratings + verdict)
- Reports section
- Video Summary
- Live Summary

**Datascouting list:**
- Data Summary (ratings + verdict)
- Reports section

**Videoscouting list:**
- Video Summary ONLY (Kyle and Toer verdicts)
- No data ratings or verdicts shown

**Live scouting list:**
- Live Summary ONLY (percentage slider + category)
- No previous verdicts shown

**Potential list / Not interesting list:**
- All sections visible

**"View Full Profile" Button:**
- Toggle to show all sections regardless of current list
- Useful for scouts who need complete overview

## Technical Architecture

### Frontend Stack
- **Vite 6.4.1** - Build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation

### Backend/Database
- **Supabase** - PostgreSQL database
- Tables: players, player_ratings, reports, verdicts, data_scouting_entries, videoscouting_entries, live_scouting_entries, seasons, users

### Color Scheme
- Primary: #1D3557 (dark blue)
- Accent: #A8DADC (light blue)
- Background: #F1FAEE (off-white)
- Green badges: Follow-up, Good, Top tiers
- Orange badges: Continue Monitoring, Average, Mid tiers
- Red badges: Not Good Enough, Bad, Bottom tiers

## Data Flow

1. **Player Entry** → Added to Prospects list
2. **Data Scouting** → Move to Datascouting list → Rate (0-100) → Assign verdict
3. **Video Scouting** → Move to Videoscouting list → Kyle + Toer provide independent verdicts
4. **Live Scouting** → Move to Live scouting list → Grade with percentage slider
5. **Final Decision** → Move to Potential list or Not interesting list

## Key Design Principles

### Unbiased Scouting
Each scouting stage is isolated - scouts only see information relevant to their task:
- Video scouts don't see data ratings
- Live scouts don't see previous verdicts
- Prevents confirmation bias

### Flexible Workflow
- Players can move between lists manually
- No forced progression
- "View Full Profile" override for managers

### Season-Based Data
All ratings, verdicts, and notes are tied to specific seasons (July-June), allowing historical tracking

### Dual Video Scouting
Two independent video scouts provide verdicts to ensure quality control and reduce individual bias

## User Roles
- **Datascout** - Analyzes statistics and data
- **Videoscout (Kyle)** - Reviews video footage
- **Videoscout (Toer)** - Reviews video footage independently
- **Livescout** - Watches matches in person
- **Manager** - Can view all information

## Navigation
- **Dashboard** - Homepage with list cards and verdict access
- **Add Player** - Player entry form
- **Total Overview** - Comprehensive filterable table
- **Player Profile** - Detailed player page (click from any list)
- **Verdict Lists** - Filtered views (click verdict cards on dashboard)
