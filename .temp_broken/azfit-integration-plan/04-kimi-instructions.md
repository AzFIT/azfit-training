# Kimi Code — AzFIT Integration Instructions

> **Mission:** Evolve AzFIT into the world's best personal training platform by integrating superior design patterns from our portal repo and innovative UX from Strong, Freeletics, and 1FIT.
>
> **Mindset:** We're building this together. Quality over speed. Every feature must be production-ready. Test after each change. Deploy frequently.

---

## Project Context

**Local path:** `C:\Users\85254\Documents\azfit-training-main`
**Portal source:** `C:\Users\85254\Documents\azfit-training-main\.temp\azfit-client-portal-main`
**Live site:** https://azfit.fit
**Stack:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Supabase

**What's already done (DO NOT repeat):**
- ✅ HashRouter → BrowserRouter
- ✅ Code splitting (76% bundle reduction)
- ✅ Real Supabase Auth (all backdoors removed)
- ✅ Error boundaries
- ✅ Color tokenization
- ✅ Admin Dashboard, AI Chat, Program Matcher, Client Intake Wizard
- ✅ Reset password page
- ✅ Landing page "Try Demo" CTA

**Current state:** The app is functional and secure. Now we need to make it **beautiful and feature-rich**.

---

## Reference Materials in This Folder

Read these BEFORE starting:

| File | Purpose |
|------|---------|
| `01-comparison-report.html` | What to port from portal → training. Open in browser. |
| `02-ui-ux-research.html` | What Strong/Freeletics/1FIT do best. Open in browser. |
| `03-workflow-wireframes.html` | ASCII wireframes of how features should look. Open in browser. |
| `images/azfit-programs-mockup.png` | Target design for Programs page |
| `images/azfit-workout-session-mockup.png` | Target design for Workout Session logger |
| `images/azfit-client-roadmap-mockup.png` | Target design for Client Roadmap |

---

## PHASE 5: Visual Design — Match Portal's Superior UI

### 5.1 Dashboard KPI Cards (Priority: HIGHEST)

**Problem:** Current KPI cards use dark blue background with cyan-only rings. Portal uses charcoal background with multi-colored rings.

**Reference files:**
- Portal: `C:\Users\85254\Documents\azfit-training-main\.temp\azfit-client-portal-main\src\pages\DashboardPage.tsx`
- Target: `images/azfit-programs-mockup.png` (top KPI cards section)

**Changes needed:**

```
Current (training) → Target (portal style)
─────────────────────────────────────────
Card bg: dark blue → #1A1D21 (soft dark charcoal)
Layout:  2×2 grid   → 1×4 horizontal row
Numbers: cyan text  → white text (#FFFFFF)
Rings:   all cyan   → multi-colored per metric
  Sessions:     cyan → green (#22C55E)
  Active Clients: cyan → purple (#8B5CF6)
  New Signups:    cyan → orange (#F97316)
  Revenue:        cyan → cyan (#00AEEF)
Subtitles: minimal → rich context ("14 booked this week")
Corners: standard  → rounded-2xl
```

**Files to modify:**
- `src/pages/DashboardPage.tsx` — KPI card section
- `tailwind.config.js` — add KPI card background color token if needed

**Acceptance criteria:**
- [ ] 4 KPI cards in a horizontal row
- [ ] Each card has charcoal (#1A1D21) background
- [ ] Numbers are white, bold, large
- [ ] Each ring is a different color (green, purple, orange, cyan)
- [ ] Subtitles have rich context text
- [ ] Cards have rounded-2xl corners
- [ ] Build passes without errors

---

### 5.2 Alert Severity Borders

**Problem:** Current alerts are plain list items. Portal has colored left borders per severity.

**Reference:**
- Portal: `C:\Users\85254\Documents\azfit-training-main\.temp\azfit-client-portal-main\src\pages\DashboardPage.tsx` (alerts section)

**Changes needed:**

Add colored left border to alert items:
- Red left border (#EF4444): Urgent alerts (overdue body stats, expired PAR-Q)
- Yellow left border (#EAB308): Warning alerts (missing nutrition log, no-show)
- Blue left border (#3B82F6): Info alerts (assessment due)
- Green left border (#22C55E): Success alerts (celebrations, milestones)

Change timestamps from "5 day" / "3 day" format to relative: "2h ago", "1d ago", "5d ago"

**Files to modify:**
- `src/pages/DashboardPage.tsx` — alerts panel rendering
- `src/utils/dateUtils.ts` — add `formatRelativeTime()` function

**Acceptance criteria:**
- [ ] Each alert has colored left border matching severity
- [ ] Timestamps show relative time ("2h ago" not "5 day")
- [ ] Urgent alerts are visually distinct from info alerts
- [ ] Build passes

---

### 5.3 Calendar Time Range + Color Coding

**Problem:** Calendar shows 00:00 start (5 hours of dead space). Events are all cyan.

**Reference:**
- Portal: `C:\Users\85254\Documents\azfit-training-main\.temp\azfit-client-portal-main\src\pages\CalendarPage.tsx`

**Changes needed:**

```
Time range: 00:00-24:00 → 05:00-22:00
Session colors:
  Personal Training → Cyan (#00AEEF)
  Group Class       → Purple (#8B5CF6)
  Assessment        → Green (#22C55E)
  Online/Remote     → Orange (#F97316)
  Strength          → Red (#EF4444)
```

**Files to modify:**
- `src/pages/CalendarPage.tsx` — time range config, event color mapping

**Acceptance criteria:**
- [ ] Calendar day view starts at 05:00
- [ ] Calendar ends at 22:00
- [ ] Events are color-coded by session type
- [ ] Colors match the legend above
- [ ] Build passes

---

### 5.4 Programs Page — Full Redesign

**Problem:** Current Programs page shows "No programs found" empty state. Portal has rich program cards, templates, and full functionality.

**Reference:**
- Portal: `C:\Users\85254\Documents\azfit-training-main\.temp\azfit-client-portal-main\src\pages\ProgramsPage.tsx`
- Target mockup: `images/azfit-programs-mockup.png`

**This is a MAJOR redesign. Implement in sections:**

#### Part A: KPI Cards Row
Add 4 KPI cards at top of Programs page:
- "Active Programs" — purple ring, count of active programs
- "Templates" — cyan ring, count of available templates
- "Sessions This Week" — green ring, session count
- "Avg Completion" — orange ring, average program completion %

#### Part B: Program Templates Section
Add a "PROGRAM TEMPLATES" section with 6 template cards:

| Template | Description | Tag | Tag Color |
|----------|-------------|-----|-----------|
| GVT | 10x10 high-volume German Volume Training | Hypertrophy | Green |
| GBC | Superset-driven German Body Composition | Fat Loss | Orange |
| HIIT | High-intensity metabolic training | Conditioning | Red |
| PPL | Push Pull Legs — 3 to 6 day split | Hypertrophy | Purple |
| Full Body | Complete body training every session | Strength | Green |
| Strength | Low-rep high-load powerlifting | Power | Yellow |

Each template card has:
- Colored top border (matches tag color)
- Template name (bold)
- Description (1-2 lines)
- Colored tag badge
- "0 programs" count (or actual count if data exists)

#### Part C: Rich Program Cards
Replace empty state with rich program cards (when programs exist):

Each program card has:
- Colored top border (purple for hypertrophy, teal for fat loss, etc.)
- Program name (bold)
- Tag badges: goal tag (colored), "Custom"/"Built-in", method tag
- Stats row: Duration (12w), Days per week (4/wk), Exercises, Sets — in rounded metric pills
- Session progress bar: "48/72 sets completed" with visual bar
- Phase pills: "Accumulation", "Intensification", "Realization"
- Action buttons: "Start Session" (cyan), "Edit", "Duplicate"

#### Part D: Search + Filters
- Search input: "Search programs, templates, goals..."
- "Filters" button that opens filter panel (instead of individual dropdowns)

**Files to modify:**
- `src/pages/ProgramsPage.tsx` — complete rewrite
- May need: `src/components/ProgramCard.tsx` (new component)
- May need: `src/components/TemplateCard.tsx` (new component)

**Acceptance criteria:**
- [ ] KPI cards row at top (4 cards, multi-colored rings)
- [ ] Program Templates section with 6 template cards
- [ ] Template cards have colored top borders and tag badges
- [ ] Rich program cards with stats, progress bars, phase pills
- [ ] Search bar + Filters button
- [ ] "Smart Match" and "New Program" CTAs in header
- [ ] Build passes without errors

---

## PHASE 6: Workout Session Logger (Strong-Inspired)

### 6.1 Workout Session Page (NEW PAGE)

**Problem:** AzFIT has no in-workout logging screen. This is the #1 feature request for a training platform.

**Reference:**
- Strong app patterns (see `02-ui-ux-research.html`)
- Target mockup: `images/azfit-workout-session-mockup.png`
- Portal: `C:\Users\85254\Documents\azfit-training-main\.temp\azfit-client-portal-main\src\pages\WorkoutSessionPage.tsx` (if exists)

**Features to implement:**

#### Header
- Workout name (e.g., "Upper Body A")
- Client name
- Live elapsed timer
- Phase badge (e.g., "Phase: Intensification")
- Week/Day indicator + program progress bar

#### Exercise Blocks
Each exercise shows:
- Exercise name with letter prefix (A1, A2, B1, B2 for CoachRx notation)
- Previous session data: "Previous: 60kg x 10, 10, 9 (RPE 8)"
- Target for today: "Target: 62.5kg x 10, 10, 10 (RPE 8)"
- Info icon (tap for exercise details)
- Video icon (link to demo)
- Chart icon (link to exercise history)

#### Set Rows
Each set has:
- Weight input field (pre-filled with target)
- Reps input field (pre-filled with target)
- RPE input field (pre-filled with target)
- Checkbox circle (tap to complete)
- Completed sets show green checkmark

#### Rest Timer
- Auto-starts when a set is completed
- Circular progress indicator
- Shows remaining time (e.g., "01:30 remaining")
- "+15s" button and "Skip" button

#### Superset Indicator
- "SS" badge when exercises are paired
- Visual grouping of superset exercises

#### Bottom Actions
- "Finish Session" (cyan button)
- "Log Photo" (gray)
- "Adjust" (gray — to modify exercises on the fly)

**Files to create:**
- `src/pages/WorkoutSessionPage.tsx` — main page
- `src/components/workout/ExerciseBlock.tsx` — exercise component
- `src/components/workout/SetRow.tsx` — set row component
- `src/components/workout/RestTimer.tsx` — rest timer component
- `src/hooks/useWorkoutSession.ts` — workout session logic

**Files to modify:**
- `src/App.tsx` — add route for `/workout/:programId/:sessionId`

**Acceptance criteria:**
- [ ] Workout page loads from program card "Start Session" button
- [ ] Shows all exercises in the program
- [ ] Previous session data visible for each exercise
- [ ] Target weight/reps/RPE pre-filled in inputs
- [ ] Checkmark completes a set and auto-starts rest timer
- [ ] Rest timer shows circular countdown
- [ ] Can finish session and save data
- [ ] Build passes

---

### 6.2 Visual Plate Calculator (Strong-Inspired)

**Reference:**
- Strong app plate calculator pattern
- Target idea: When trainer prescribes a weight, show which plates to load

**Implementation:**
- Add a calculator icon/button next to weight input
- When tapped, show a modal with:
  - Target weight display
  - Bar weight (default 20kg Olympic)
  - Visual plate diagram (one side of bar)
  - Plate breakdown: "Each side: 20kg + 10kg + 5kg = 35kg per side"
  - Total: "(35 x 2) + 20 bar = 80.0kg"

**Files to create:**
- `src/components/workout/PlateCalculator.tsx`

**Acceptance criteria:**
- [ ] Opens from weight field tap
- [ ] Shows accurate plate breakdown
- [ ] Accounts for bar weight
- [ ] Handles kg and lb
- [ ] Visual representation of plates
- [ ] Build passes

---

## PHASE 7: Client Roadmaps (1FIT-Inspired)

### 7.1 Client Roadmap Tab (NEW TAB in Client Profile)

**Problem:** Client profiles show data but not the JOURNEY. Coaches and clients need to see where they are and what's coming.

**Reference:**
- 1FIT client roadmap pattern (see `02-ui-ux-research.html`)
- Target mockup: `images/azfit-client-roadmap-mockup.png`

**Features to implement:**

#### Header
- Client name + status dot (Green=On Track, Yellow=Needs Attention, Red=At Risk)
- Program name + duration (e.g., "Strength Foundation — 16-Week Program")
- Overall progress bar + "Week 6 of 16, 38%"
- Coach name, start date, estimated end date

#### Phase Timeline (vertical)
5 phases shown with:
- Phase number + name (bold)
- Week range (e.g., "W1-W2")
- Status: "COMPLETE" (green), "ACTIVE" (cyan), "UPCOMING" (gray)
- Deliverables with checkmarks for completed items
- For ACTIVE phase: week-by-week breakdown showing method used each week
- For ACTIVE phase: current method + target metrics

Example phases:
1. **ASSESSMENT** (W1-W2) — Body comp, 1RM test, photos, PAR-Q, mobility, goals
2. **FOUNDATION** (W3-W5) — Movement patterns, work capacity, technique
3. **INTENSIFICATION** (W6-W10) — GVT, 5-4-3-2-1, Rest-Pause, Cluster Sets, Wave Loading
4. **REALIZATION** (W11-W13) — 1RM retest, photos, BioPrint
5. **PEAK** (W14-W16) — Peak week, final assessment

#### Progress Metrics Strip
At bottom, show 6 key metrics:
- 1RM Bench: value + change
- 1RM Squat: value + change
- Weight: value + change
- Body Fat: value + change
- Adherence: percentage
- Sessions: completed/total

#### Action Buttons
- "View This Week's Sessions" (cyan)
- "Adjust Program" (gray)

**Files to create/modify:**
- `src/components/client-profile/RoadmapTab.tsx` — new tab component
- `src/components/client-profile/PhaseTimeline.tsx` — timeline component
- `src/components/client-profile/MetricsStrip.tsx` — metrics bar
- Modify client profile page to add "Roadmap" tab

**Acceptance criteria:**
- [ ] Roadmap tab visible in client profile
- [ ] Shows all 5 phases with correct status
- [ ] Completed phases show checkmarks on deliverables
- [ ] Active phase shows week-by-week breakdown
- [ ] Upcoming phases show planned deliverables (grayed)
- [ ] Progress metrics strip shows 6 key numbers
- [ ] Status dot color matches client health
- [ ] Build passes

---

### 7.2 Client Status System

**Implement status scoring per client:**

| Status | Color | Trigger Conditions |
|--------|-------|-------------------|
| On Track | Green | Adherence >80%, no missed sessions, HRV good |
| Needs Attention | Yellow | Adherence 60-80%, missed 1-2 sessions, or check-in overdue |
| At Risk | Red | Adherence <60%, missed 3+ sessions, or HRV low + no check-in |

**Display status on:**
- Client list cards (colored dot)
- Dashboard client grid
- Client profile header
- Coach dashboard overview

**Files to modify:**
- `src/utils/clientStatus.ts` — new utility for calculating status
- `src/pages/DashboardPage.tsx` — add status dots to client cards
- `src/pages/ClientDirectory.tsx` — add status filter
- Client profile components — add status badge

**Acceptance criteria:**
- [ ] Status calculated automatically from adherence + sessions + HRV
- [ ] Green/Yellow/Red dots appear on all client listings
- [ ] Status filter works on client directory
- [ ] Build passes

---

## PHASE 8: Conversational AI Program Builder

### 8.1 Chat-Style Program Wizard

**Reference:**
- Freeletics conversational pattern (see `02-ui-ux-research.html`)
- Existing AI Chat component in AzFIT (already built)

**Implementation:**

Use the existing AI Chat component but add a "Program Builder" mode. Instead of a complex form, the AI asks one question at a time:

```
AI Coach: "Who is this program for?"
[ Sarah Chen ] [ Marcus Tan ] [ David Lim ] [ + New Client ]

User taps: Sarah Chen

AI Coach: "Great! Building a program for Sarah. What's the primary goal?"
[ Strength ] [ Hypertrophy ] [ Fat Loss ] [ Endurance ] [ Rehab ]

User taps: Strength

AI Coach: "How many days per week can Sarah train?"
[ 2 days ] [ 3 days ] [ 4 days ] [ 5 days ] [ 6 days ]
...
```

After all questions answered, AI generates a program draft that the coach can review and adjust.

**Files to modify:**
- `src/components/AiChat.tsx` — add program builder mode
- `src/components/AiChat.tsx` — add quick-reply pill buttons
- May need: `src/hooks/useProgramBuilder.ts` — program builder logic

**Acceptance criteria:**
- [ ] Chat mode "Program Builder" available
- [ ] Asks one question at a time
- [ ] Shows tappable pill buttons for answers
- [ ] Progress indicator ("Step 2 of 6")
- [ ] Generates program draft at the end
- [ ] Draft can be reviewed and edited before saving
- [ ] Build passes

---

## PHASE 9: Recovery Dashboard

### 9.1 Recovery Tab (NEW TAB in Client Profile)

**Reference:**
- 1FIT recovery dashboard (see `02-ui-ux-research.html`)

**Features:**

#### Readiness Score
- Single headline number: "82/100"
- Color-coded: Green (70-100), Yellow (50-69), Red (0-49)
- Label: "READY" / "MODERATE" / "DELOAD"

#### Metrics Grid
- HRV: value + trend vs baseline
- Sleep: hours + deep/REM breakdown
- RHR: bpm + trend
- Sleep Quality: star rating
- Stress: level + trend

#### 7-Day Trend Chart
- Small line chart showing 7-day readiness trend
- Overlay sleep hours and RHR

#### Coach Action
- "Adjust Today's Training" button — links to workout modification

**Note:** For now, use manual entry or mock data. Wearable integration (Oura, Whoop, Apple Health) comes later.

**Files to create:**
- `src/components/client-profile/RecoveryTab.tsx`
- `src/components/recovery/ReadinessScore.tsx`
- `src/components/recovery/MetricCard.tsx`
- `src/components/recovery/TrendChart.tsx`

**Acceptance criteria:**
- [ ] Recovery tab visible in client profile
- [ ] Readiness score prominently displayed
- [ ] All 5 metrics shown with trends
- [ ] 7-day trend chart visible
- [ ] Color-coded readiness status
- [ ] Build passes

---

## PHASE 10: Polish & Differentiation

### 10.1 Progress Celebration Moments
- When client hits a PR or completes a program, trigger a celebration overlay
- Confetti animation (can use `canvas-confetti` library)
- "New Personal Record!" or "Program Complete!" message
- Option to share (future feature)

### 10.2 Weekly Coach Insights
- Add a section to the dashboard: "This Week's Insights"
- Aggregated metrics: avg adherence, sessions completed, clients needing attention, new leads
- Compare to previous week (trend arrows)

### 10.3 Sidebar Navigation Updates
- Rename "Program Builder" → "Program Creator" (match portal)
- Rename "Exercise Library" → "Exercises" (match portal)
- Ensure active item styling matches portal

---

## General Rules for All Phases

### DO:
- ✅ Preserve existing architecture (TanStack Query, Zustand, code splitting)
- ✅ Use existing shadcn/ui components
- ✅ Match the light theme (white cards on light gray-white background)
- ✅ Use cyan (#00AEEF) as primary accent
- ✅ Add `React.lazy()` for all new pages
- ✅ Run `npm run build` after each phase
- ✅ Reference portal code for visual design patterns
- ✅ Use the mockup images as visual targets

### DON'T:
- ❌ Change the auth system
- ❌ Modify the database schema without discussion
- ❌ Break existing pages
- ❌ Add new dependencies without approval
- ❌ Skip TypeScript types
- ❌ Leave console.log statements in production code

---

## Deployment Checklist (After Each Phase)

- [ ] `npm run build` passes with zero errors
- [ ] All new routes wrapped in `React.lazy()` + `Suspense`
- [ ] No new security issues introduced
- [ ] Visual matches mockup (check screenshot)
- [ ] Deploy to https://azfit.fit
- [ ] Verify on mobile (responsive)

---

## Questions?

If anything is unclear, ask before implementing. We're building this together — collaboration over assumptions.

---

*Created June 2026 for AzTechFit Hong Kong*
*Team: You + Kimi Code + Design Research (this folder)*
