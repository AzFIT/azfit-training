# AzFIT Client Portal

> **Smart Training. Engineered For You.**
>
> Professional fitness training management platform for **AzTechFit Hong Kong**.
>
> **Live Site:** https://azfit.fit/
> **Staging:** https://vrl4feabrbrle.kimi.page/

---

## Overview

AzFIT is a comprehensive client portal designed for personal trainers and fitness coaches at AzTechFit Hong Kong. It provides tools for client management, session scheduling, program design, nutrition tracking, and data-driven progress monitoring — all in one unified platform. The portal serves both **Trainers** and **Clients** with role-based access, and is designed to scale to multiple gym locations.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Deployment](#deployment)
7. [AI Chat Integration](#ai-chat-integration)
8. [Settings Page](#settings-page)
9. [API Specification](#api-specification)
10. [Google Sheets Integration](#google-sheets-integration)
11. [Phase Roadmap](#phase-roadmap)
12. [Project History](#project-history)
13. [Contributing](#contributing)

---

## Features

### Complete Feature Checklist

| Feature | Status |
|---------|--------|
| **Landing Page** — Hero, stats, features, testimonials, CTA, selling script | ✅ |
| **Authentication** — Trainer/Client roles, demo mode, password reset | ✅ |
| **Dashboard** — KPI cards, sparklines, today's schedule, follow-ups | ✅ |
| **Client Directory** — Search, filter, sort, table view, pagination | ✅ |
| **Client Profile** — 12 tabs: Dashboard, BioPrint, BodyStats, Records, Notes, Sessions, Calendar, Programs, Diet/Nutrition, Lifestyle, Database, Goals | ✅ |
| **Client Edit Mode** — Full edit on all tabs (except email/password) | ✅ |
| **Goals Tab** — Progress timeline, milestones, weight/body fat charts | ✅ |
| **Calendar** — Week/Day/Month/Agenda views, 35 time slots (0500-2200) | ✅ |
| **Calendar Click-to-Add** — Click any cell → New Event dialog | ✅ |
| **Programs Library** — 30+ programs, search, filter, assign | ✅ |
| **Program Wizard** — 8-step wizard, exercise blocks, drag reorder, Poliquin notation | ✅ |
| **Exercise Database** — 1000+ exercises, filter by muscle/equipment | ✅ |
| **Nutrition Hub** — TDEE calculator, macro presets, meal logging | ✅ |
| **Nutrition Client Search** — Search clients, load body stats | ✅ |
| **Hydration Tracker** — Daily water intake log | ✅ |
| **Supplement Tracker** — Supplement schedule | ✅ |
| **PDF Export** — Professional nutrition report export | ✅ |
| **AI Chat Assistant** — Draggable bubble, intent classification, 4-context NLP | ✅ |
| **Settings** — 7 sections: Appearance, Notifications, Calendar, Data, AI, Business, About | ✅ |
| **Responsive Design** — Desktop, tablet, mobile | ✅ |
| **Dark Mode** — Toggle support | ✅ |

### Phase Breakdown

#### Phase 1 — Authentication & Onboarding (Complete)
- Role-based login (Trainer / Client / Admin)
- 7-step onboarding wizard (goals, body composition, lifestyle, PAR-Q)
- Demo mode with 12 synthetic clients + 30 days of session data
- Email verification + password recovery
- Invitation link acceptance for admin onboarding

#### Phase 2 — Trainer Dashboard (Complete)
- 4 KPI cards with sparklines (Active Clients, Sessions, Revenue (HKD), Compliance)
- Today's timeline with quick actions
- Priority follow-up alerts (body stats, nutrition, assessments)
- Client overview grid with sort/filter
- Expandable quick-action FAB

#### Phase 3 — Client Management (Complete)
- Client directory with 6-column sortable table
- Full client profile with 12 sub-tabs
- Multi-client tab bar for parallel profile viewing
- Assessment forms: PAR-Q, BioPrint, Body Stats

#### Phase 4 — Program Design Wizard (Complete)
- 8-step wizard: Goal Selection, Method Selection, Client Context, Phase Configuration, Weekly Split, Exercise Review, Program Preview, Save & Assign
- A/B exercise system + muscle topology diagram
- Program library with search and filter

#### Phase 5 — Calendar & Scheduling (Complete)
- Week / Month / Day / Agenda views
- Drag-and-drop rescheduling
- Smart dialogs (conflict detection, availability, first-timer alerts)
- Color-coded events (confirmed/pending/cancelled/completed)
- Click-to-add on any time slot

#### Phase 6 — Nutrition Deep Dive (Complete)
- TDEE Calculator with multi-formula comparison
- Interactive macro ring with Smart Swap
- Metabolic Timeline (6-month adaptive tracking)
- Gamification badge system
- 7-day meal planner with Hong Kong food intelligence
- PDF Export — professional branded report

#### Phase 7 — AI Chat Assistant (New)
- Draggable floating chat bubble (bottom-left)
- Page-restricted AI — context-aware per route
- 4-context intent classification (Workout / Nutrition / Client / General)
- Natural language commands
- Topic guard with keyword filtering
- Fully client-side — no external AI API

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19 |
| Language | TypeScript | 5.3+ |
| Bundler | Vite | 7.2.4 |
| Styling | Tailwind CSS | 3.4.19 |
| Components | shadcn/ui | latest |
| State | Zustand | 4.4+ |
| Animation | Framer Motion | 11+ |
| Charts | Recharts | 2.10+ |
| Icons | Lucide React | latest |
| Router | React Router DOM | 6.20+ |
| Backend | Express.js | 4.18+ |
| Currency | HKD (Hong Kong Dollar) | — |
| Date Format | DD/MM/YYYY display / YYYY-MM-DD storage | — |

---

## Project Structure

```
azfit-training/
|
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (49+)
│   │   ├── ai-chat/             # AI Chat Bubble system
│   │   ├── calendar/            # Calendar dialogs
│   │   ├── clients/             # Client dialogs
│   │   ├── program-wizard/      # Wizard shared components
│   │   ├── AppSidebar.tsx
│   │   ├── AppNavbar.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── TrainerDashboard.tsx
│   │   ├── ClientDirectory.tsx
│   │   ├── ClientProfile.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── ProgramsPage.tsx
│   │   ├── ProgramWizardPage.tsx
│   │   ├── ProgramLibraryPage.tsx
│   │   ├── ExerciseLibraryPage.tsx
│   │   ├── NutritionPage.tsx
│   │   ├── SettingsPage.tsx       # NEW: 7-tab settings
│   │   ├── AssessmentForms.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── BrandStoryPage.tsx
│   │   ├── SubscriptionPage.tsx
│   │   ├── InvitationPage.tsx
│   │   ├── calendar/              # Calendar sub-views
│   │   ├── client-profile/        # 14 profile tab components
│   │   ├── program-wizard/        # 10 wizard step components
│   │   └── nutrition/             # 7 nutrition sub-pages
│   ├── stores/
│   │   ├── useAuthStore.ts
│   │   ├── useClientStore.ts
│   │   ├── useCalendarStore.ts
│   │   ├── useProgramStore.ts
│   │   ├── useNotificationStore.ts
│   │   ├── useUIStore.ts
│   │   └── useNutritionStore.ts
│   ├── hooks/
│   │   ├── useAIChat.ts           # NEW: AI Chat state
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── demo-data.ts
│   │   ├── client-data.ts
│   │   ├── sync-demo-data.ts      # NEW: Cross-store demo sync
│   │   ├── program-data.ts
│   │   ├── programs-library.ts
│   │   ├── exercise-database.ts
│   │   └── hk-food-db.ts          # Hong Kong food database
│   ├── types/
│   │   └── program.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/                        # Static assets
├── docs/                          # GitHub Pages deployment
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm 10+ or yarn 1.22+

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server starts at `http://localhost:5173`.

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Start production server
npm start
```

The API server starts at `http://localhost:3001`.

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:pass@localhost:5432/azfit
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_SHEETS_CREDENTIALS=path/to/service-account.json
GOOGLE_SHEETS_ID=your-spreadsheet-id
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Deployment

| Environment | URL | Method |
|-------------|-----|--------|
| **Production (Custom Domain)** | https://azfit.fit/ | GitHub Pages |
| **Staging/Backup** | https://vrl4feabrbrle.kimi.page/ | Kimi Deploy |
| **GitHub Repo** | https://github.com/AzFIT/azfit-training | Source + docs/ |

### Update Process

1. Kimi builds → deploys to staging URL for preview
2. Download `docs/` zip from Kimi
3. Replace `docs/` folder on GitHub
4. GitHub Pages auto-updates `azfit.fit` within 2 minutes

---

## AI Chat Integration

### AI Chat System (`src/components/ai-chat/`)

| File | Purpose |
|------|---------|
| `AIChat.tsx` | Main chat component (draggable button + panel) |
| `intent-classifier.ts` | 4-context keyword scoring engine |
| `response-generator.ts` | Context-aware response templates |
| `types.ts` | TypeScript interfaces |

### Features
- **Intent Classification** — Keyword scoring across 4 contexts (Workout, Nutrition, Client, General)
- **Context-Aware Responses** — Page-restricted AI that answers current-page topics
- **Draggable Button** — Bottom-left position, user can reposition anywhere
- **Mobile Keyboard Handling** — Auto-moves to top corner when keyboard opens
- **localStorage Persistence** — Messages and button position saved across sessions
- **Cross-Context Bridging** — Detects multi-intent queries
- **Edge Case Handling** — Crisis keywords, medical disclaimers, off-topic redirect

### Integration
The AI Chat is automatically rendered by `Layout.tsx` and appears on all pages when `showAIChatBubble` is enabled in Settings.

---

## Settings Page

### Settings (`src/pages/SettingsPage.tsx`)

7 tabbed sections with toggle-able display controls:

| Section | Features |
|---------|----------|
| **Display Preferences** | Toggle 12 dashboard elements (KPIs, Schedule, AI Chat, etc.) |
| **Notifications** | Email/SMS/Push toggles, quiet hours, frequency |
| **Appearance** | Theme (light/dark), accent color, font size, sidebar mode |
| **Privacy** | Data sharing, profile visibility, anonymization |
| **Account** | Password, 2FA, session management, account deletion |
| **Data Management** | Export (JSON/CSV/PDF), import, backup, clear cache |
| **Integrations** | Apple Health, Google Fit, Fitbit, Garmin, MyFitnessPal, calendar sync |

---

## API Specification

All endpoints are prefixed with `/api`. See `docs/API_SPEC.md` for full details.

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Login with email/password |
| POST | `/register` | Create new account |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Invalidate token |
| GET | `/me` | Get current user |
| POST | `/invite` | Send invitation |
| POST | `/verify` | Verify email code |

### Clients (`/api/clients`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List clients (paginated) |
| POST | `/` | Create client |
| GET | `/:id` | Get client profile |
| PUT | `/:id` | Update client |
| DELETE | `/:id` | Soft-delete client |
| GET | `/:id/sessions` | Client's sessions |
| GET | `/:id/stats` | Client's body stats |
| GET | `/:id/notes` | Client's notes |
| POST | `/:id/notes` | Add note |

### Sessions (`/api/sessions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List sessions |
| POST | `/` | Create session |
| GET | `/:id` | Get session |
| PUT | `/:id` | Update session |
| DELETE | `/:id` | Delete session |
| POST | `/:id/complete` | Mark completed |

### Programs (`/api/programs`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List programs |
| POST | `/` | Create program |
| GET | `/library` | Exercise library |
| GET | `/exercises` | Search exercises |
| GET | `/:id` | Get program |
| PUT | `/:id` | Update program |
| POST | `/:id/assign` | Assign to client |

### Nutrition (`/api/nutrition`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tdee/:clientId` | Calculate TDEE |
| POST | `/meals` | Log meal |
| GET | `/meals/:clientId` | Meal history |
| POST | `/goals` | Set macro goals |
| POST | `/water` | Log water |
| GET | `/foods` | Search foods |
| POST | `/sync` | Sync to Sheets |

### Analytics (`/api/analytics`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Dashboard KPIs |
| GET | `/client/:id` | Client analytics |
| GET | `/revenue` | Revenue report (HKD) |
| GET | `/attendance` | Attendance stats |
| GET | `/compliance` | Compliance scores |

---

## Google Sheets Integration

The portal syncs bi-directionally with a Google Sheets Master Template containing 8 tabs:

| Tab | Data | Direction |
|-----|------|-----------|
| CLIENTS | Client profiles + status | Bi-directional |
| SESSIONS_LOG | All training sessions | Bi-directional |
| NUTRITION_LOG | Meal entries + macros | Bi-directional |
| BIOPRINT_TRACKING | 8-site skinfold measurements | Bi-directional |
| REVENUE | Session pricing + payments (HKD) | Bi-directional |
| INVENTORY | Equipment + stock | Read-only |
| EXERCISE_DATABASE | Exercise library | Read-only |
| PROGRAMS_LIBRARY | Saved training programs | Bi-directional |

Setup:
1. Create a Google Cloud service account
2. Download credentials JSON
3. Set `GOOGLE_SHEETS_CREDENTIALS` and `GOOGLE_SHEETS_ID` in `.env`
4. Run `POST /api/nutrition/sync` to initialize

---

## Phase Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Authentication & Onboarding | ✅ Complete |
| 2 | Trainer Dashboard | ✅ Complete |
| 3 | Client Management | ✅ Complete |
| 4 | Program Design Wizard | ✅ Complete |
| 5 | Calendar & Scheduling | ✅ Complete |
| 6 | Nutrition Deep Dive | ✅ Complete |
| 7 | AI Chat Assistant | ✅ Complete |
| 8 | Progress Photos Upload | Planned |
| 9 | PDF Export for Programs | Planned |
| 10 | QR Code Generation | Planned |
| 11 | WhatsApp Integration | Planned |

---

## Project History

| Date | Milestone |
|------|-----------|
| 2026-05-22 | Initial production release — all 7 improvement batches merged |
| 2026-05-22 | Hong Kong branding (was Singapore) |
| 2026-05-22 | AI Chat Assistant — page-restricted NLP |
| 2026-05-22 | Client Profile Edit — all 12 tabs |
| 2026-05-22 | Calendar Click-to-Add + 0500-2200 time slots |
| 2026-05-22 | Nutrition Client Search + PDF Export |
| 2026-05-22 | Comprehensive Settings (7 sections) |
| 2026-05-22 | Custom domain activated — azfit.fit |

---

## Contributing

### Branch Strategy
- `master` — Production-ready code
- `feature/<name>` — New features
- `fix/<name>` — Bug fixes

### Commit Conventions
```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: build/tooling changes
```

### Code Style
- TypeScript strict mode enabled
- JSDoc comments on all major functions/components
- Component exports as default
- Zustand stores for state management
- Tailwind utility-first styling
- Responsive mobile-first design

---

## License

Proprietary — AzTechFit, Hong Kong. All rights reserved.
