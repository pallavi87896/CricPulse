# CricPulse Project Changelog

This changelog records all updates, API endpoints, schemas, and UI components implemented in this project.

---

## Commit: `be1fa85` - Implemented Live Matches Page & Front-End Structure
**Author**: Pallavi Singh  
**Date**: Sat Jul 11 19:17:37 2026 +0530

### Key Implementations
- **UI Components:** Built a premium component library:
  - `Badge` (Dynamic badges for Live, Upcoming, and Ended matches)
  - `Button` (Variant styles: primary, secondary, danger)
  - `Card` (Clean container component with headers and custom paddings)
  - `ConfirmationModal` (User confirm modals for dangerous actions)
  - `EmptyState` (Fallback UI for empty lists)
  - `Input` & `Select` (Form elements for match configuration)
  - `Modal` (Accessible overlay dialogs)
  - `PageHeader` (Breadcrumbs, titles, and actions header)
  - `Sidebar` (Dashboard, Teams, Players, Matches, and Live Match navigation)
  - `SimpleTable` (Tabular layout component with row hover highlights)
- **Live Scoring Console (`/live-match`):**
  - Starter configurations modal (batsman selection, bowler setup).
  - Scoring Keypad interface (record runs off bat, extras, wickets).
  - Over tracker history and commentary logs.
  - Active Batsmen/Bowler cards showing real-time overs, runs, balls, economy rates.
- **Match Setup (`/matches`):**
  - List of all matches.
  - Create and edit match forms (teams, toss choices, overs limit, dates).
- **Dashboard (`/`):**
  - Grid card statistics (Total Teams, Players, Matches, Live Matches).
  - Overview list of matches with direct navigation paths.
- **Context API (`AppContext.tsx`):**
  - Local state mock templates and fallback data structure.

### Files Added/Modified
- [live-match/page.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/live-match/page.tsx)
- [matches/page.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/matches/page.tsx)
- [players/page.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/players/page.tsx)
- [teams/page.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/teams/page.tsx)
- [components/Badge.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/components/Badge.tsx)
- [components/Button.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/components/Button.tsx)
- [components/Card.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/components/Card.tsx)
- [components/ConfirmationModal.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/components/ConfirmationModal.tsx)
- [components/Modal.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/components/Modal.tsx)
- [components/Sidebar.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/components/Sidebar.tsx)
- [components/SimpleTable.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/components/SimpleTable.tsx)
- [context/AppContext.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/context/AppContext.tsx)
- [app/api/match/route.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/api/match/route.ts)
- [app/page.tsx](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/page.tsx)

---

## Commit: `d9e26b4` - Made Changes in the Route & Backend Calculations
**Author**: Pallavi Singh  
**Date**: Wed Jul 8 01:17:54 2026 +0530

### Key Implementations
- **Math Scoring Calculations:** Created pure helper modules under `lib/helpers/`:
  - `updateMatchScore` (handles batsman runs, extras like wides, no-balls, leg-byes, and wickets).
  - `updateBatsmanStats` (tracks balls faced, runs scored, boundaries, and wicket state).
  - `updateBowlerStats` (tracks legal balls bowled, runs conceded, wickets taken, maidens).
  - `startSecondInnings` (swaps batting/bowling teams, resets score/wickets/legalBalls, sets target).
  - `finishMatch` (ends the match, marks winner).
  - `handleWicket` (places out batsman, configures new batsman).
- **Backend API Extensions:**
  - Dynamic route `/api/match/[id]/live` to retrieve details of a specific live match.
  - POST handler `/api/ballEvent` for creating individual delivery items.
  - POST/GET handler `/api/comment` for adding commentaries.

### Files Added/Modified
- [api/match/[id]/live/route.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/api/match/%5Bid%5D/live/route.ts)
- [lib/helpers/finishMatch.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/lib/helpers/finishMatch.ts)
- [lib/helpers/handleWicket.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/lib/helpers/handleWicket.ts)
- [lib/helpers/startSecondInnings.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/lib/helpers/startSecondInnings.ts)
- [lib/helpers/updateBatsmanStats.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/lib/helpers/updateBatsmanStats.ts)
- [lib/helpers/updateBowlerStats.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/lib/helpers/updateBowlerStats.ts)
- [lib/helpers/updateMatchScore.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/lib/helpers/updateMatchScore.ts)
- [app/api/ballEvent/route.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/api/ballEvent/route.ts)
- [app/api/match/route.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/api/match/route.ts)

---

## Commit: `6121c4e` - APIs Written (Database Handlers)
**Author**: Pallavi Singh  
**Date**: Mon Jul 6 00:56:12 2026 +0530

### Key Implementations
- Created standard database fetch endpoints for `match`, `player`, `scorecard`, `team`, and `ballEvent`.
- Set up route handlers for POST, GET, PATCH, and DELETE match operations.

### Files Added/Modified
- [app/api/player/route.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/api/player/route.ts)
- [app/api/team/route.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/api/team/route.ts)
- [app/api/ballEvent/[matchId]/route.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/app/api/ballEvent/%5BmatchId%5D/route.ts)

---

## Commit: `7bf208c` - Wrote Database Schemas
**Author**: Pallavi Singh  
**Date**: Mon Jun 29 20:17:10 2026 +0530

### Key Implementations
- Set up MongoDB configuration using `mongoose` in `lib/mongodb.ts`.
- Created Database Schema Definitions for models:
  - `Admin`
  - `BallEvent`
  - `Comment`
  - `Match`
  - `Player`
  - `PlayerStats`
  - `Team`

### Files Added/Modified
- [lib/mongodb.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/lib/mongodb.ts)
- [models/Admin.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/models/Admin.ts)
- [models/BallEvent.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/models/BallEvent.ts)
- [models/CommentModel.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/models/CommentModel.ts)
- [models/Match.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/models/Match.ts)
- [models/Player.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/models/Player.ts)
- [models/PlayerStats.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/live-score/models/PlayerStats.ts)
- [models/Team.ts](file:///c:/Users/PALLAVI%20SINGH/CricPulse/models/Team.ts)

---

## Commit: `a179039` - Initial Commit
**Author**: Pallavi Singh  
**Date**: Sun Jun 28 23:03:04 2026 +0530

### Key Implementations
- Initial Next.js workspace setup with Tailwind styles, favicon, lint configurations, and README.
