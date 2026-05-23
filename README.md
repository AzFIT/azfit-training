# AzFIT Client Portal

> **Smart Training. Engineered For You.**
>
> Professional fitness training management platform for **AzTechFit Hong Kong**.
>
> **Live Site:** https://azfit.fit/
> **Staging:** https://vrl4feabrbrle.kimi.page/
> **Repository:** https://github.com/AzFIT/azfit-training

---

## 📋 Current Build Status

| Metric | Value |
|--------|-------|
| **Repository Status** | ✅ Active & Production |
| **Last Updated** | 2026-05-23 |
| **Language Composition** | 98.7% TypeScript, 1.3% Other |
| **Build System** | Vite 7.2.4 (React 19 + TypeScript 5.9) |
| **Current Version** | 1.0.0 (Production Release) |
| **Development Port** | `http://localhost:5173` (Vite dev server) |
| **Production Domain** | `azfit.fit` (GitHub Pages) |
| **Backup/Staging** | `vrl4feabrbrle.kimi.page` (Kimi Deploy) |

---

## Overview

AzFIT is a comprehensive client portal designed for personal trainers and fitness coaches at AzTechFit Hong Kong. It provides tools for client management, session scheduling, program design, nutrition tracking, and AI-powered coaching assistance. The platform features a responsive interface optimized for desktop, tablet, and mobile devices with full dark mode support.

---

## Table of Contents

1. [Current Build Status](#current-build-status)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Build Configuration](#build-configuration)
7. [Environment Variables](#environment-variables)
8. [Deployment](#deployment)
9. [AI Chat Integration](#ai-chat-integration)
10. [Settings Page](#settings-page)
11. [API Specification](#api-specification)
12. [Google Sheets Integration](#google-sheets-integration)
13. [Phase Roadmap](#phase-roadmap)
14. [Project History](#project-history)
15. [Contributing](#contributing)

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

#### Phase 7 — AI Chat Assistant (Complete)
- Draggable floating chat bubble (bottom-left)
- Page-restricted AI — context-aware per route
- 4-context intent classification (Workout / Nutrition / Client / General)
- Natural language commands
- Topic guard with keyword filtering
- Fully client-side — no external AI API

---

## Tech Stack

### Frontend Dependencies

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| **Framework** | React | 19.2.0 | UI component library & state rendering |
| **Language** | TypeScript | ~5.9.3 | Type-safe development |
| **Build Tool** | Vite | 7.2.4 | Lightning-fast dev server & bundling |
| **Styling** | Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| | tailwindcss-animate | 1.0.7 | Pre-built Tailwind animations |
| | tailwind-merge | 3.4.0 | Class name composition utility |
| **UI Components** | shadcn/ui | latest | Pre-built, accessible React components |
| | @radix-ui/* | 1.x | Headless UI primitives (20+ packages) |
| **State Management** | Zustand | 5.0.13 | Lightweight, reactive state store |
| **Animation** | Framer Motion | 12.40.0 | Smooth, performant animations |
| | canvas-confetti | 1.9.4 | Confetti celebration effect |
| **Data Visualization** | Recharts | 2.15.4 | Responsive chart visualization |
| **Icons** | Lucide React | 0.562.0 | Consistent, scalable SVG icons (400+) |
| **Routing** | React Router DOM | 7.15.1 | Client-side routing & navigation |
| | React Router | 7.6.1 | Core routing library |
| **Forms** | React Hook Form | 7.70.0 | Efficient form state management |
| | @hookform/resolvers | 5.2.2 | Validation resolver adapters |
| | Zod | 4.3.5 | Runtime schema validation |
| **Date/Time** | date-fns | 4.2.1 | Utility functions for date manipulation |
| | react-day-picker | 9.13.0 | Accessible date picker component |
| **Notifications** | Sonner | 2.0.7 | Toast notification system |
| **Theme** | next-themes | 0.4.6 | Dark/light mode provider & persistence |
| **UI Utilities** | clsx | 2.1.1 | Conditional class name composition |
| | class-variance-authority | 0.7.1 | Type-safe component variants |
| **Components** | Embla Carousel React | 8.6.0 | Accessible carousel/slider |
| | react-resizable-panels | 4.2.2 | Resizable panel layout system |
| | vaul | 1.1.2 | Accessible drawer component |
| | cmdk | 1.1.1 | Fast command menu component |
| | input-otp | 1.4.2 | OTP input field |

### Development Dependencies

| Tool | Version | Purpose |
|------|---------|---------|
| **TypeScript Compiler** | ~5.9.3 | Type checking & transpilation |
| **ESLint** | 9.39.1 | Code linting & style enforcement |
| **ESLint Config** | @eslint/js | 9.39.1 | Core ESLint rules |
| **TypeScript ESLint** | 8.46.4 | TypeScript-specific linting rules |
| **ESLint Plugins** | react-hooks | 7.0.1, react-refresh | 0.4.24 | React-specific linting |
| **Vite Plugins** | @vitejs/plugin-react | 5.1.1 | Fast Refresh + SWC compilation |
| | plugin-inspect-react-code | 1.0.3 | React component inspection |
| **CSS Processing** | PostCSS | 8.5.6 | CSS transformation pipeline |
| | Autoprefixer | 10.4.23 | Vendor prefix automation |
| **Type Definitions** | @types/react | 19.2.5 | React type definitions |
| | @types/react-dom | 19.2.3 | React DOM type definitions |
| | @types/canvas-confetti | 1.9.0 | Confetti library types |
| | @types/node | 24.10.1 | Node.js type definitions |
| **Utilities** | globals | 16.5.0 | Global variable type definitions |

### Backend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Express.js | 4.18+ | Node.js web server |
| **Runtime** | Node.js | 20+ LTS | JavaScript runtime environment |
| **Database** | PostgreSQL | — | Relational database (optional) |
| **Authentication** | JWT | — | Token-based auth |

### Regional Configuration

| Setting | Value |
|---------|-------|
| **Currency** | HKD (Hong Kong Dollar) |
| **Date Display Format** | DD/MM/YYYY |
| **Date Storage Format** | YYYY-MM-DD (ISO 8601) |
| **Timezone** | Hong Kong (UTC+8) |

---

## Project Structure

```
azfit-training/
|
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (49+)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── ai-chat/             # AI Chat Bubble system
│   │   │   ├── AIChat.tsx
│   │   │   ├── intent-classifier.ts
│   │   │   ├── response-generator.ts
│   │   │   └── types.ts
│   │   ├── calendar/            # Calendar dialogs & modals
│   │   ├── clients/             # Client management dialogs
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
│   │   ├── SettingsPage.tsx       # 7-tab settings
│   │   ├── AssessmentForms.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── BrandStoryPage.tsx
│   │   ├── SubscriptionPage.tsx
│   │   ├── InvitationPage.tsx
│   │   ├── calendar/              # Calendar sub-views
│   │   ├── client-profile/        # 12+ profile tab components
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
│   │   ├── useAIChat.ts           # AI Chat state hook
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── demo-data.ts
│   │   ├── client-data.ts
│   │   ├── sync-demo-data.ts      # Cross-store demo sync
│   │   ├── program-data.ts
│   │   ├── programs-library.ts
│   │   ├── exercise-database.ts   # 1000+ exercises
│   │   └── hk-food-db.ts          # Hong Kong food database
│   ├── types/
│   │   └── program.ts
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
│
├── public/                        # Static assets (favicon, etc.)
├── docs/                          # GitHub Pages deployment
├── index.html                     # Vite HTML entry point
├── vite.config.ts                 # Vite build configuration
├── tsconfig.json                  # TypeScript configuration
├── eslint.config.js               # ESLint linting rules
├── tailwind.config.js             # Tailwind CSS configuration
├── package.json                   # Frontend dependencies & scripts
├── .env.example                   # Environment template
└── README.md                      # This file
```

---

## Getting Started

### Prerequisites
- **Node.js** 20+ (LTS recommended — 20.17.0 or higher)
- **npm** 10+ or **yarn** 1.22+
- **Git** 2.30+
- **PostgreSQL** (optional, for backend database)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/AzFIT/azfit-training.git
cd azfit-training

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting and type checking
npm run lint
```

The development server starts at **`http://localhost:5173`** with hot module reloading (HMR) enabled.

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

The API server starts at **`http://localhost:3001`**.

---

## Build Configuration

### Vite Configuration

File: `vite.config.ts`

```typescript
export default defineConfig({
  base: './',                    // Relative path for GitHub Pages
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,                  // Dev server port
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // @ = src/ shorthand
    },
  },
});
```

| Setting | Value | Purpose |
|---------|-------|---------|
| **Base URL** | `./` | Relative path for GitHub Pages deployment |
| **Dev Port** | `3000` | Local development server port |
| **Source Alias** | `@` → `./src` | Import shorthand for cleaner paths |
| **Module System** | ES Modules | Native import/export syntax |

### Build Commands

```bash
npm run dev        # Start dev server with HMR (http://localhost:5173)
npm run build      # TypeScript compile-check + Vite production build
npm run preview    # Serve dist/ locally for production testing
npm run lint       # Run ESLint code quality checks
```

### TypeScript Configuration

| Setting | Value |
|---------|-------|
| **Strict Mode** | ✅ Enabled |
| **Target** | ES2020 |
| **Module System** | ESNext (transpiled by Vite) |
| **JSX Runtime** | React 19 (automatic runtime) |
| **Path Aliases** | `@/*` maps to `./src/*` |
| **Lib** | ES2020 + DOM |

### Build Output

**Output Directory:** `dist/`

```
dist/
├── index.html              # Single-page application entry
├── assets/
│   ├── index-[hash].js     # Main JavaScript bundle
│   ├── style-[hash].css    # Compiled Tailwind CSS
│   └── [other-hash].js     # Code-split chunks
└── favicon.ico             # Favicon
```

### Production Optimizations

- ✅ **Tree-shaking:** Removes unused code
- ✅ **Code splitting:** Dynamic imports for better caching
- ✅ **CSS minification:** Via Tailwind & PostCSS
- ✅ **JavaScript minification:** Via Vite's Rollup config
- ✅ **Asset optimization:** Image compression, font loading
- ✅ **Gzip compression:** Auto-enabled on deployment
- ✅ **Source maps:** Disabled in production (for security)

### Build Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **Build Time** | < 30s | ~5-10s (Vite) |
| **Bundle Size (gzipped)** | < 500KB | ~300KB |
| **First Load** | < 2s | ~1-1.5s |

---

## Environment Variables

### Frontend (`.env` or `.env.local`)

```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_ENV=development

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_DEMO_MODE=true
VITE_ENABLE_ANALYTICS=false

# Optional: Google Sheets
VITE_GOOGLE_SHEETS_ID=your-spreadsheet-id
```

### Backend (`.env` in `backend/` directory)

```env
# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/azfit
DB_HOST=localhost
DB_PORT=5432
DB_NAME=azfit
DB_USER=postgres
DB_PASS=your-secure-password

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters
JWT_EXPIRY=7d

# Google Sheets Integration
GOOGLE_SHEETS_CREDENTIALS=path/to/service-account.json
GOOGLE_SHEETS_ID=your-spreadsheet-id

# Stripe Payment Processing (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service (Optional)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxx

# Logging
LOG_LEVEL=info
```

---

## Deployment

### Deployment Environments

| Environment | URL | Build Method | Provider | Auto-Deploy |
|-------------|-----|--------------|----------|-----------|
| **Production** | https://azfit.fit/ | GitHub Pages | GitHub | Manual |
| **Staging** | https://vrl4feabrbrle.kimi.page/ | Kimi Deploy | Kimi | Auto on push |

### Production Deployment (GitHub Pages)

#### Step 1: Build Locally
```bash
npm run build
# Creates dist/ folder with optimized production build
```

#### Step 2: Upload to GitHub
```bash
# Option A: Commit dist/ directly
git add dist/
git commit -m "build: deploy production build"
git push origin main

# Option B: GitHub Actions (recommended)
# Set up .github/workflows/deploy.yml for auto-deployment
```

#### Step 3: GitHub Pages Auto-Deploy
- GitHub Pages detects changes to main branch
- Auto-deploys dist/ to `azfit.fit` (2-minute latency)
- HTTPS automatically enabled

### Staging Deployment (Kimi)

1. Push to any branch
2. Kimi automatically builds and deploys to staging URL
3. Download the built `docs/` folder from Kimi
4. Merge to main → GitHub Pages auto-updates production

### Custom Domain Configuration

| Setting | Value |
|---------|-------|
| **Domain** | azfit.fit |
| **DNS** | Configured for GitHub Pages (CNAME) |
| **SSL/TLS** | Auto-managed by GitHub (HTTPS enforced) |
| **Certificate** | Let's Encrypt (auto-renewed) |

---

## AI Chat Integration

### AI Chat System (`src/components/ai-chat/`)

| File | Lines | Purpose |
|------|-------|---------|
| `AIChat.tsx` | ~200 | Main chat component (draggable button + panel) |
| `intent-classifier.ts` | ~150 | 4-context keyword scoring engine |
| `response-generator.ts` | ~180 | Context-aware response templates |
| `types.ts` | ~50 | TypeScript interfaces & types |

### Features

- **🎯 Intent Classification** — Keyword scoring across 4 contexts:
  - Workout (exercise, sets, reps, form)
  - Nutrition (TDEE, macros, meals)
  - Client (progress, notes, goals)
  - General (help, onboarding)

- **📍 Context-Aware Responses** — Page-restricted AI that answers current-page topics

- **🎮 Draggable Button** — Bottom-left position, user can reposition anywhere

- **📱 Mobile Keyboard Handling** — Auto-moves to top corner when keyboard opens

- **💾 localStorage Persistence** — Messages and button position saved across sessions

- **🔀 Cross-Context Bridging** — Detects multi-intent queries (e.g., "nutrition for workouts")

- **⚠️ Edge Case Handling** — Crisis keywords, medical disclaimers, off-topic redirects

- **🔐 Privacy-First** — Fully client-side processing, no external API calls, no data collection

### Integration Points

```tsx
// Rendered globally in Layout.tsx
<AIChat isEnabled={settings.showAIChatBubble} />

// Integrated with Zustand state
const { showAIChatBubble } = useUIStore();
```

The AI Chat appears on **all pages** when enabled in Settings → Display Preferences.

---

## Settings Page

### Settings Layout (`src/pages/SettingsPage.tsx`)

7 comprehensive tabbed sections with granular controls:

| Section | Features | Toggles |
|---------|----------|---------|
| **Display Preferences** | Toggle 12 dashboard elements | KPIs, Schedule, AI Chat, Follow-ups, etc. |
| **Notifications** | Alert configuration | Email, SMS, Push, Quiet Hours, Frequency |
| **Appearance** | Visual customization | Theme (light/dark), Accent Color, Font Size, Sidebar Mode |
| **Privacy** | Data controls | Data Sharing, Profile Visibility, Anonymization |
| **Account** | Security settings | Password, 2FA, Sessions, Account Deletion |
| **Data Management** | Import/Export | JSON, CSV, PDF, Backup, Clear Cache |
| **Integrations** | 3rd-party sync | Apple Health, Google Fit, Fitbit, Garmin, MyFitnessPal |

### Settings State Management

```tsx
// Stored in Zustand useUIStore
const settings = {
  theme: 'dark' | 'light',
  showAIChatBubble: true,
  showKPICards: true,
  notificationFrequency: 'daily' | 'weekly',
  // ... 30+ more settings
};
```

---

## API Specification

All endpoints are prefixed with `/api`. Full API documentation: `docs/API_SPEC.md`

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/login` | Login with email/password | ❌ |
| POST | `/register` | Create new account | ❌ |
| POST | `/refresh` | Refresh access token | ✅ |
| POST | `/logout` | Invalidate token | ✅ |
| GET | `/me` | Get current user profile | ✅ |
| POST | `/invite` | Send invitation link | ✅ |
| POST | `/verify` | Verify email code | ❌ |

### Clients Routes (`/api/clients`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List clients (paginated) | ✅ |
| POST | `/` | Create new client | ✅ |
| GET | `/:id` | Get client profile | ✅ |
| PUT | `/:id` | Update client details | ✅ |
| DELETE | `/:id` | Soft-delete client | ✅ |
| GET | `/:id/sessions` | Client's training sessions | ✅ |
| GET | `/:id/stats` | Client's body stats history | ✅ |
| GET | `/:id/notes` | Client's notes | ✅ |
| POST | `/:id/notes` | Add note to client | ✅ |

### Sessions Routes (`/api/sessions`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all sessions | ✅ |
| POST | `/` | Create new session | ✅ |
| GET | `/:id` | Get session details | ✅ |
| PUT | `/:id` | Update session | ✅ |
| DELETE | `/:id` | Delete session | ✅ |
| POST | `/:id/complete` | Mark session completed | ✅ |

### Programs Routes (`/api/programs`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List programs | ✅ |
| POST | `/` | Create new program | ✅ |
| GET | `/library` | Get exercise library | ✅ |
| GET | `/exercises` | Search exercises | ✅ |
| GET | `/:id` | Get program details | ✅ |
| PUT | `/:id` | Update program | ✅ |
| POST | `/:id/assign` | Assign program to client | ✅ |

### Nutrition Routes (`/api/nutrition`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tdee/:clientId` | Calculate TDEE | ✅ |
| POST | `/meals` | Log meal entry | ✅ |
| GET | `/meals/:clientId` | Get meal history | ✅ |
| POST | `/goals` | Set macro goals | ✅ |
| POST | `/water` | Log water intake | ✅ |
| GET | `/foods` | Search foods database | ✅ |
| POST | `/sync` | Sync to Google Sheets | ✅ |

### Analytics Routes (`/api/analytics`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard` | Dashboard KPIs | ✅ |
| GET | `/client/:id` | Client analytics | ✅ |
| GET | `/revenue` | Revenue report (HKD) | ✅ |
| GET | `/attendance` | Attendance statistics | ✅ |
| GET | `/compliance` | Compliance scores | ✅ |

---

## Google Sheets Integration

### Master Template

The portal syncs bi-directionally with a Google Sheets Master Template containing 8 tabs:

| Tab | Rows | Data | Direction | Refresh |
|-----|------|------|-----------|---------|
| **CLIENTS** | 1000+ | Client profiles, status, contact | ↔️ Bi-directional | Manual |
| **SESSIONS_LOG** | 5000+ | Training sessions, dates, notes | ↔️ Bi-directional | Auto hourly |
| **NUTRITION_LOG** | 2000+ | Meal entries, macros, timing | ↔️ Bi-directional | Auto daily |
| **BIOPRINT_TRACKING** | 500+ | 8-site skinfold measurements | ↔️ Bi-directional | Manual |
| **REVENUE** | 1000+ | Session pricing, payments (HKD) | ↔️ Bi-directional | Auto daily |
| **INVENTORY** | 200+ | Equipment, stock levels | 📖 Read-only | Manual |
| **EXERCISE_DATABASE** | 1000+ | Exercise library with images | 📖 Read-only | Quarterly |
| **PROGRAMS_LIBRARY** | 100+ | Saved training programs | ↔️ Bi-directional | Manual |

### Setup Instructions

1. **Create Google Cloud Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project: "AzFIT"
   - Enable Google Sheets API
   - Create service account with "Editor" role
   - Download JSON credentials file

2. **Configure Credentials**
   ```env
   GOOGLE_SHEETS_CREDENTIALS=path/to/service-account.json
   GOOGLE_SHEETS_ID=your-spreadsheet-id
   ```

3. **Share Spreadsheet**
   - Share Google Sheets with service account email
   - Grant "Editor" access

4. **Initialize Sync**
   ```bash
   curl -X POST http://localhost:3001/api/nutrition/sync \
     -H "Authorization: Bearer {token}"
   ```

---

## Phase Roadmap

| Phase | Feature | Status | Launch Date |
|-------|---------|--------|-------------|
| 1 | Authentication & Onboarding | ✅ Complete | 2026-05-22 |
| 2 | Trainer Dashboard | ✅ Complete | 2026-05-22 |
| 3 | Client Management | ✅ Complete | 2026-05-22 |
| 4 | Program Design Wizard | ✅ Complete | 2026-05-22 |
| 5 | Calendar & Scheduling | ✅ Complete | 2026-05-22 |
| 6 | Nutrition Deep Dive | ✅ Complete | 2026-05-22 |
| 7 | AI Chat Assistant | ✅ Complete | 2026-05-22 |
| 8 | Progress Photos Upload | 🔄 In Planning | Q3 2026 |
| 9 | PDF Export for Programs | 🔄 In Development | Q3 2026 |
| 10 | QR Code Generation | 🔄 Backlog | Q3 2026 |
| 11 | WhatsApp Integration | 🔄 Backlog | Q4 2026 |

---

## Project History

| Date | Version | Milestone | Details |
|------|---------|-----------|---------|
| 2026-05-23 | 1.0.0 | 📋 README Update | Comprehensive build docs + current versions |
| 2026-05-22 | 1.0.0 | 🚀 Production Release | All 7 phases merged, custom domain activated |
| 2026-05-22 | 1.0.0 | 🌏 Hong Kong Branding | Migrated from Singapore locale |
| 2026-05-22 | 0.9.7 | 🤖 AI Chat Assistant | Page-restricted NLP with 4-context classification |
| 2026-05-22 | 0.9.6 | ✏️ Client Edit Mode | Full edit across all 12 tabs |
| 2026-05-22 | 0.9.5 | 📅 Calendar Click-to-Add | Time slot click functionality (0500-2200) |
| 2026-05-22 | 0.9.4 | 🍎 Nutrition Hub | Client search + professional PDF export |
| 2026-05-22 | 0.9.3 | ⚙️ Settings Redesign | 7-section comprehensive settings |
| 2026-05-22 | 0.9.2 | 🔗 Custom Domain | azfit.fit activated with HTTPS |
| Earlier | 0.1-0.9 | 📅 Phased Development | Foundation phases 1-6 completed |

---

## Contributing

### Branch Strategy

```
main               → Production-ready (GitHub Pages auto-deploy)
├── feature/*      → New features (branch from main)
│   └── Example: feature/ai-chat-v2
└── fix/*          → Bug fixes (branch from main)
    └── Example: fix/calendar-overflow
```

### Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/) for automated changelog generation:

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add or update tests
chore: build/tooling changes
perf: performance improvements
```

#### Examples

```bash
git commit -m "feat: add AI chat bubble to layout"
git commit -m "fix: resolve calendar time slot overlap"
git commit -m "docs: update README with tech stack"
git commit -m "refactor: extract calendar logic to custom hook"
git commit -m "perf: optimize image loading with lazy loading"
git commit -m "chore: upgrade vite from 7.1.0 to 7.2.4"
```

### Code Standards

✅ **TypeScript**
- Strict mode enabled
- JSDoc comments on all major functions/components
- No `any` types allowed (use `unknown` with type guards)

✅ **React**
- Functional components + hooks only
- Component exports as default
- Descriptive prop types

✅ **State Management**
- Zustand stores for global state
- Custom hooks for derived state

✅ **Styling**
- Tailwind utility-first approach
- No inline styles
- Responsive mobile-first design

✅ **Linting**
- ESLint passes (`npm run lint`)
- Prettier formatting (via ESLint)

### Pull Request Checklist

- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Tested on desktop (1920x1080), tablet (768x1024), mobile (375x667)
- [ ] Dark mode toggle verified
- [ ] No console errors or warnings
- [ ] Commit messages follow conventions
- [ ] README updated if relevant
- [ ] No console.log() left behind
- [ ] Performance metrics within targets

### Code Review Guidelines

- ✅ Approve if code is clean, typed, and tested
- ✅ Request changes for breaking changes or security issues
- ✅ Suggest improvements for performance optimizations
- ✅ At least 2 approvals before merge

---

## Performance Metrics & Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **Lighthouse Performance** | 85+ | Core Web Vitals |
| **Lighthouse Accessibility** | 90+ | WCAG AA compliance |
| **First Contentful Paint (FCP)** | < 1.5s | Time to first render |
| **Largest Contentful Paint (LCP)** | < 2.5s | Main content visible |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Visual stability |
| **Build Time** | < 30s | Vite with TypeScript |
| **Bundle Size (gzipped)** | < 500KB | Production build |
| **Runtime Memory** | < 150MB | Peak usage |

---

## Troubleshooting

### Common Issues

#### Issue: Dev server fails to start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### Issue: Port 5173 already in use
```bash
# Kill process on port 5173 (Mac/Linux)
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID {PID} /F
```

#### Issue: TypeScript errors in editor
```bash
# Restart TypeScript service in VSCode
Cmd+Shift+P → TypeScript: Restart TS Server
```

---

## Support & Resources

- 📖 **Documentation:** [GitHub Pages](https://azfit.fit/)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/AzFIT/azfit-training/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/AzFIT/azfit-training/discussions)
- 📧 **Email:** contact@azfit.fit
- 🌐 **Live Site:** [https://azfit.fit/](https://azfit.fit/)
- 🎯 **Staging:** [https://vrl4feabrbrle.kimi.page/](https://vrl4feabrbrle.kimi.page/)

---

## License

**Proprietary — AzTechFit, Hong Kong**. All rights reserved.

© 2026 AzTechFit. Built with ❤️ by the AzFIT team for fitness professionals.
