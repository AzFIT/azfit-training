# AzFIT Client Portal

**Science-Based Training, Beautifully Organized.**

A comprehensive SaaS dashboard for AzTechFit Hong Kong, bridging the gap between personal training science and digital management. Built with React 19, TypeScript, Tailwind CSS, and Framer Motion.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Application Routes & Pathways](#application-routes--pathways)
5. [Component Architecture](#component-architecture)
6. [Features](#features)
7. [Design System](#design-system)
8. [Getting Started](#getting-started)
9. [Available Scripts](#available-scripts)
10. [Environment Variables](#environment-variables)
11. [Contributing](#contributing)
12. [License](#license)

---

## Project Overview

AzFIT Client Portal is a professional trainer-client management platform featuring:

- **Public Landing Page** — Cinematic dark hero with animated particles, feature grid, testimonials
- **Trainer Dashboard** — KPI cards with sparklines, daily schedule timeline, client grid, alerts
- **Client Profiles** — 13-tab comprehensive profiles (BioPrint, BodyStats, Records, Sessions, etc.)
- **Calendar** — Week/Day/Month/Agenda views with color-coded session types
- **Program Library** — Searchable/filterable program catalog with Poliquin methods
- **Program Wizard** — 8-step guided program creation (Goal > Method > Context > Phases > Split > Review > Preview > Save)
- **Nutrition Hub** — TDEE calculator, macro rings, meal planner, water tracker
- **Progress Photos** — Upload, gallery, side-by-side comparison
- **AI Chat Assistant** — Draggable floating chat with contextual quick-action hints
- **Settings** — 7-section preferences panel

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19 |
| Language | TypeScript | 5.3 |
| Build Tool | Vite | 7.2.4 |
| Styling | Tailwind CSS | 3.4.19 |
| UI Components | shadcn/ui | 40+ components |
| Animation | Framer Motion | latest |
| Routing | React Router DOM | 6.20+ |
| Icons | Lucide React | latest |
| Charts | Recharts | latest |
| State | Zustand | latest |
| Forms | React Hook Form + Zod | latest |
| Date Utils | date-fns | latest |

---

## Directory Structure

```
AzFIT-Client-Portal/
├── public/                          # Static assets
│   ├── index.html                   # HTML entry point
│   ├── AzFIT_Logo_BlackBackground.png
│   ├── AzFIT_Logo_BlackBackground_Text.png
│   ├── AzFIT_Logo_WhiteBackground.png
│   ├── AzFIT_Logo_WhiteBackground_Text.png
│   ├── Azwar_Profile.jpg
│   ├── hero-bg.jpg                  # Landing page hero background
│   ├── landing-feature-1.jpg        # Feature images
│   ├── landing-feature-2.jpg
│   ├── landing-feature-3.jpg
│   ├── client-role-card.jpg
│   ├── trainer-role-card.jpg
│   ├── testimonial-1.jpg
│   ├── testimonial-2.jpg
│   ├── testimonial-3.jpg
│   ├── avatar-placeholder.png
│   ├── noise.png                    # Subtle texture overlay
│   ├── exercises_db.json            # Exercise database (200+ records)
│   ├── training_methods.json        # 84 training methods
│   └── safety_notes.json            # Exercise safety/contraindications
│
├── src/
│   ├── main.tsx                     # React entry point (renders App)
│   ├── App.tsx                      # Root component with all routes
│   ├── index.css                    # Global styles, Tailwind directives, custom CSS
│   │
│   ├── pages/                       # Page-level route components
│   │   ├── LandingPage.tsx          # Public landing page (8 sections)
│   │   ├── LoginPage.tsx            # Authentication - Login
│   │   ├── SignupPage.tsx           # Authentication - Sign Up
│   │   ├── DashboardPage.tsx        # Trainer dashboard (KPIs, schedule, clients)
│   │   ├── CalendarPage.tsx         # Full calendar (Week/Day/Month/Agenda)
│   │   ├── ProgramsPage.tsx         # Program library with search/filter
│   │   ├── ProgramWizardPage.tsx    # 8-step program creation wizard
│   │   ├── ClientProfilePage.tsx    # 13-tab client profile detail view
│   │   ├── NutritionPage.tsx        # TDEE calc, meal planner, water tracker
│   │   ├── PhotosPage.tsx           # Progress photo gallery & comparison
│   │   ├── SettingsPage.tsx         # 7-section user preferences
│   │   └── PlannedFeaturesPage.tsx  # Product roadmap / feature status
│   │
│   ├── components/                  # Reusable components
│   │   ├── Navbar.tsx               # Landing page navigation
│   │   ├── Footer.tsx               # Landing page footer
│   │   ├── Layout.tsx               # Authenticated page shell (sidebar + topbar + content)
│   │   ├── AiChat.tsx               # Draggable AI chat floating widget
│   │   ├── EmptyState.tsx           # Empty state placeholder component
│   │   │
│   │   └── ui/                      # shadcn/ui component primitives (40+)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       ├── table.tsx
│   │       ├── toast.tsx
│   │       ├── chart.tsx
│   │       ├── calendar.tsx
│   │       ├── sidebar.tsx
│   │       ├── badge.tsx
│   │       ├── avatar.tsx
│   │       ├── tooltip.tsx
│   │       ├── accordion.tsx
│   │       ├── checkbox.tsx
│   │       ├── switch.tsx
│   │       ├── slider.tsx
│   │       ├── progress.tsx
│   │       ├── skeleton.tsx
│   │       ├── spinner.tsx
│   │       ├── separator.tsx
│   │       ├── scroll-area.tsx
│   │       ├── popover.tsx
│   │       ├── sheet.tsx
│   │       ├── drawer.tsx
│   │       ├── alert.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button-group.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── carousel.tsx
│   │       ├── form.tsx
│   │       ├── field.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-group.tsx
│   │       ├── input-otp.tsx
│   │       ├── item.tsx
│   │       ├── kbd.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── sonner.tsx
│   │       ├── textarea.tsx
│   │       ├── toggle.tsx
│   │       └── toggle-group.tsx
│   │
│   ├── hooks/
│   │   └── use-mobile.ts            # Mobile viewport detection hook
│   │
│   ├── lib/
│   │   └── utils.ts                 # cn() utility (Tailwind class merging)
│   │
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript interfaces
│   │
│   └── store.ts                     # Global Zustand store
│
├── docs/                            # Documentation (this is deployed, not dist/)
│   └── architecture.md              # Detailed architecture documentation
│
├── index.html                       # Vite HTML entry point
├── package.json                     # Dependencies & scripts
├── vite.config.ts                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS theme configuration
├── postcss.config.js                # PostCSS configuration
├── tsconfig.json                    # TypeScript base configuration
├── tsconfig.app.json                # TypeScript app configuration
├── tsconfig.node.json               # TypeScript node configuration
├── components.json                  # shadcn/ui configuration
├── eslint.config.js                 # ESLint configuration
└── README.md                        # This file
```

---

## Application Routes & Pathways

### Public Routes (No Authentication)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Cinematic landing page with hero, features, testimonials |
| `/login` | `LoginPage` | Login form with demo mode, auto-filled credentials |
| `/signup` | `SignupPage` | Registration form with role selection |

### Authenticated Routes (Wrapped in Layout)

| Route | Component | Description | Sidebar Label |
|-------|-----------|-------------|---------------|
| `/dashboard` | `DashboardPage` | KPI cards, daily schedule, client grid, FAB | Dashboard |
| `/calendar` | `CalendarPage` | 4-view calendar (Week/Day/Month/Agenda) | Calendar |
| `/programs` | `ProgramsPage` | Program library with search/filter/ranking | Programs |
| `/programs/new` | `ProgramWizardPage` | 8-step guided program builder | Programs > New |
| `/clients` | *(redirect)* | Redirects to `/dashboard` | Clients |
| `/clients/:id` | `ClientProfilePage` | 13-tab client profile | Clients |
| `/nutrition` | `NutritionPage` | TDEE, macros, meal planner, water | Nutrition |
| `/settings` | `SettingsPage` | 7-section preferences panel | Settings |
| `/photos` | `PhotosPage` | Progress photo gallery & comparison | Photos |
| `/roadmap` | `PlannedFeaturesPage` | Product roadmap | (none) |

### Route Guards & Behaviors

- **`/clients`** (without `:id`) → redirects to `/dashboard`
- **`/clients/:id`** → loads client profile with `:id` parameter
- **Demo mode** → Login form has "Demo Mode" button that bypasses auth
- **Default login** → Auto-filled: `trainer@azfit.com` / `password`
- **Theme** → Persists to `localStorage` key `azfit-theme`
- **AI Chat position** → Persists to `localStorage` key `azfit-chat-pos`

---

## Component Architecture

### App Shell (Authenticated Pages)

```
Layout.tsx
├── Sidebar (260px, collapsible to 72px)
│   ├── Logo (AzFIT black background logo)
│   ├── Nav Items: Dashboard, Calendar, Programs, Nutrition, Clients, Photos, Settings
│   └── User Profile (Trainer / Pro Plan)
├── Top Bar (64px fixed)
│   ├── Page Title (dynamic per route)
│   ├── Search Bar (expandable, 240px)
│   ├── Theme Toggle (dark/light)
│   ├── Notifications (bell with badge)
│   └── Avatar
├── Main Content Area
│   └── {page component}
└── AiChat.tsx (floating, draggable)
```

### Client Profile — 13 Tab System

```
ClientProfilePage
├── Sticky Header Bar
│   ├── Avatar + Name + Status
│   ├── Quick Stats (Age/Sex, Weight, Body Fat, Sessions)
│   └── Action Buttons (Edit, Book, Message, More)
├── Horizontal Scrollable Tab Bar (13 tabs)
│   ├── Dashboard    — KPI cards, weight chart, activity feed
│   ├── BioPrint     — Skinfold measurements with ring chart
│   ├── BodyStats    — 90-day weight/bodyfat charts
│   ├── Records      — Personal records table
│   ├── Notes        — Rich text trainer notes
│   ├── Sessions     — Session history timeline
│   ├── Calendar     — Mini calendar view
│   ├── Programs     — Active programs with progress bars
│   ├── Diet/Nutrition — Macro breakdown, meal log
│   ├── Lifestyle    — Questionnaire (sleep, stress, etc.)
│   ├── Database     — Exercise library browser
│   ├── Goals        — Milestone timeline
│   └── Progress Photos — Photo gallery grid
└── Tab Content Area
```

### Program Wizard — 8 Step Flow

```
ProgramWizardPage
├── Step Indicator Bar (1-8)
├── Step Content (conditional render)
│   ├── Step 1: Goal Selection       — 6 goal cards
│   ├── Step 2: Method Selection     — Filtered methods with "Best Match"
│   ├── Step 3: Client Context       — Experience, days, duration, limitations
│   ├── Step 4: Phase Configuration  — Dynamic timeline with add/remove
│   ├── Step 5: Weekly Split         — Drag-reorder exercise lists
│   ├── Step 6: Exercise Review      — Accordion tables
│   ├── Step 7: Program Preview      — Summary + timeline
│   └── Step 8: Save & Assign        — Confirmation with success animation
└── Bottom Navigation (Back / Continue)
```

---

## Features

### Landing Page
- Cinematic dark hero with 50 animated particles (Canvas 2D)
- Stats bar (116+ clients, 11+ trainers, 2333+ sessions, 22% improvement)
- 3-column features grid with images
- 4-step vertical timeline (how it works)
- 2-card role selection (trainer / client)
- Testimonials carousel with auto-advance
- Dark CTA banner with pulseGlow animation
- Multi-column footer

### Dashboard
- 4 KPI cards with sparkline charts (Recharts)
- Today's schedule timeline (7am-7pm, color-coded)
- Current time indicator with pulseGlow
- Follow-ups & alerts panel (5 contextual alerts)
- Client search & filter (name, status)
- 12+ client cards grid with status dots
- Floating action button (FAB) with 4 quick actions

### Calendar
- 4 views: Week / Day / Month / Agenda
- Toolbar: view toggle, date nav, filters
- 35 time slots (7am-11pm, 30-min blocks)
- 6 color-coded session types
- Current time indicator
- Click-to-add sessions

### Program Library
- Stats bar (total, active, most used, archived)
- Filter bar: search + goal + method + difficulty
- "Most Used" ranking system
- Grid/list view toggle
- Program cards with gradient color banners
- Hover overlay with quick actions

### Nutrition Hub
- TDEE calculator (Mifflin-St Jeor formula)
- 3 animated macro rings (protein/cyan, carbs/purple, fats/orange)
- 4 tabs: Meal Planner, Food DB, Water Tracker, Supplements
- Weekly adherence bar chart

### Progress Photos
- Drag-and-drop upload modal (JPG/PNG/WebP, 5MB, 10 files)
- Filterable gallery grid with hover overlays
- Side-by-side comparison with delta calculations
- Full-size lightbox with metadata sidebar

### AI Chat
- Floating button (gradient + pulseGlow)
- **Draggable** — reposition anywhere on screen
- **Mobile keyboard aware** — visualViewport API
- Expandable chat panel (380x520px)
- Glassmorphism header with gradient avatar
- Message bubbles with markdown support
- Typing indicator (animated dots)
- Quick-action hints per page context

### Settings
- 7-section sidebar layout:
  1. Display Preferences (units, timezone, language)
  2. Notifications (email, push, in-app)
  3. Appearance (theme, accent, density, animations)
  4. Privacy (visibility, activity, data collection)
  5. Account (profile, password, 2FA, sessions)
  6. Data Management (export, import, backup)
  7. Integrations (connected apps, API keys)

---

## Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#00AEEF` | Primary actions, links, highlights |
| `--primary-hover` | `#009BD6` | Button/link hover |
| `--bg-dark` | `#0A0A0A` | Page background |
| `--bg-dark-elevated` | `#141414` | Cards, sidebar |
| `--bg-dark-surface` | `#1A1A1A` | Inputs, dropdowns |
| `--text-primary` | `#F0F0F0` | Headings |
| `--text-secondary` | `#A0A0A0` | Body text |
| `--text-muted` | `#6B6B6B` | Placeholders |
| `--success` | `#22C55E` | Positive states |
| `--danger` | `#EF4444` | Errors, alerts |
| `--warning` | `#EAB308` | Warnings |

### Typography

| Role | Font | Usage |
|------|------|-------|
| Display | Playfair Display | Hero headlines, section titles |
| Body | Inter | UI text, body copy, labels |
| Data | Space Mono | Numbers, KPIs, tables, calendar |

### Layout

- **Sidebar**: 260px (full) / 72px (collapsed) / hidden on mobile
- **Top Bar**: 64px fixed height
- **Container max-width**: 1440px (dashboard), 1280px (landing)
- **Grid**: 12-column, 24px gap
- **Breakpoints**: sm 640px, md 768px, lg 1024px, xl 1280px, 2xl 1536px

### Animations

| Name | Type | Usage |
|------|------|-------|
| fadeIn | opacity 0>1 | Page entrances |
| slideUp | translateY 30px>0 | Content reveals |
| pulseGlow | box-shadow oscillation | Active elements, FAB |
| countUp | translateY 10px>0 | KPI numbers |
| ringFill | stroke-dashoffset | Progress rings |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project
cd AzFIT-Client-Portal

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build (outputs to dist/)
npm run lint     # Run ESLint
```

### Deployment (GitHub Pages)

This project uses `HashRouter` for compatibility with static hosting.

```bash
# Build the project
npm run build

# The dist/ folder contains static files ready for deployment
# Copy contents to docs/ folder for GitHub Pages:
cp -r dist/* docs/

# Or deploy dist/ directly to any static host
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on codebase |

---

## Data Assets

| File | Description | Size |
|------|-------------|------|
| `exercises_db.json` | Exercise database (200+ records) | ~72KB |
| `training_methods.json` | 84 training methods catalog | ~42KB |
| `safety_notes.json` | Exercise safety/contraindications | ~2KB |

---

## Currency & Localization

- **Currency**: HKD (Hong Kong Dollar)
- **Date Format**: DD/MM/YYYY
- **Time Format**: 24-hour
- **Weight Unit**: kg (primary)
- **Measurement**: cm (primary)
- **Timezone**: Asia/Hong Kong (GMT+8)

---

## Known Issues & Technical Notes

1. **AnimatePresence mode="wait"** — Removed from ClientProfilePage and ProgramWizardPage due to React 19 compatibility issues. Replaced with simple motion.div animations.
2. **Full-stack backend** — This is a frontend-only SPA. API endpoints would need a separate backend service.
3. **AI Chat** — Responses are simulated; real AI integration requires a backend LLM service.
4. **Chunk size** — The main JS bundle is ~1.4MB. For production optimization, consider dynamic imports for heavy pages (ClientProfilePage, ProgramWizardPage).

---

## License

Copyright (c) 2025 AzTechFit Hong Kong. All rights reserved.

---

*Built with precision, energy, and clarity.*
