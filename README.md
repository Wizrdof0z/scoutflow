# ScoutFlow

A comprehensive football scouting workflow application built with React, TypeScript, and Supabase.

## Overview

ScoutFlow manages the complete scouting pipeline from data analysis through video scouting to live match observation, with bias prevention through conditional information display at each stage.

## Documentation

- **[FUNCTIONALITY.md](./FUNCTIONALITY.md)** - Complete explanation of how the app works, features, and workflows
- **[TODO.md](./TODO.md)** - Current bug fixes needed and future enhancements

## Tech Stack

- **Frontend:** Vite 6.4.1, React 18, TypeScript, Tailwind CSS
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Routing:** React Router

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd full-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run database migrations

In your Supabase SQL Editor, run the migrations in `supabase/migrations/`:
- `fix-rating-constraints.sql`
- `add-videoscouting-livescouting-tables.sql`

5. Start development server
```bash
npm run dev
```

## Project Structure

```
full-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (Button, Card, etc.)
│   │   └── Layout.tsx   # Main layout with navigation
│   ├── lib/             # Utilities and services
│   │   ├── supabase.ts          # Supabase client
│   │   └── supabase-service.ts  # Database operations
│   ├── pages/           # Page components
│   │   ├── HomePage.tsx
│   │   ├── PlayerEntryPage.tsx
│   │   ├── PlayerProfilePage.tsx
│   │   ├── PlayerListPage.tsx
│   │   ├── VerdictListPage.tsx
│   │   └── TotalOverviewPage.tsx
│   ├── store/           # Zustand state management
│   │   └── index.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Helper functions
│   │   └── helpers.ts
│   ├── App.tsx          # Root component with routing
│   └── main.tsx         # Entry point
├── supabase/
│   └── migrations/      # Database migration files
├── FUNCTIONALITY.md     # App documentation
├── TODO.md             # Task list
└── README.md           # This file
```

## Key Features

- **Player Management** - Add, edit, and track players through scouting pipeline
- **Data Scouting** - 0-100 rating scale across 6 metrics with verdicts
- **Video Scouting** - Dual independent verdicts (Kyle & Toer)
- **Live Scouting** - Percentage-based grading with 7 performance tiers
- **List-Based Workflow** - 6 manual lists for pipeline management
- **Bias Prevention** - Conditional rendering hides previous verdicts
- **Dashboard** - Overview cards with verdict-based filtering
- **Total Overview** - Comprehensive filterable player table

## Database Tables

- `players` - Player information and current list
- `player_ratings` - Seasonal ratings (0-100 scale)
- `reports` - PDF scouting reports
- `verdicts` - Historical verdict tracking
- `data_scouting_entries` - Data verdicts and notes
- `videoscouting_entries` - Kyle and Toer video verdicts
- `live_scouting_entries` - Live match grades
- `seasons` - Season definitions (July-June)
- `users` - Scout information

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Known Issues

See [TODO.md](./TODO.md) for current bugs and planned fixes.

## License

Private project - All rights reserved
