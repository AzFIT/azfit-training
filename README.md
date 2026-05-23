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

### Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19.2.0 | UI component library & state rendering |
| **Language** | TypeScript | ~5.9.3 | Type-safe development |
| **Build Tool** | Vite | 7.2.4 | Lightning-fast dev server & bundling |
| **Styling** | Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| **UI Components** | shadcn/ui | latest | Pre-built, accessible React components |
| **State Management** | Zustand | 5.0.13 | Lightweight, reactive state store |
| **Animation** | Framer Motion | 12.40.0 | Smooth, performant animations |
| **Charts** | Recharts | 2.15.4 | Responsive chart visualization |
| **Icons** | Lucide React | 0.562.0 | Consistent, scalable SVG icons |
| **Router** | React Router DOM | 7.15.1 | Client-side routing & navigation |
| **Forms** | React Hook Form | 7.70.0 | Efficient form state management |
| **Form Validation** | Zod | 4.3.5 | Runtime schema validation |
| **Date Handling** | date-fns | 4.2.1 | Utility functions for date manipulation |
| **Notifications** | Sonner | 2.0.7 | Toast notification system |
| **Theme Management** | next-themes | 0.4.6 | Dark/light mode provider |
| **UI Animations** | tailwindcss-animate | 1.0.7 | Pre-built Tailwind animations |
| **Carousel** | Embla Carousel React | 8.6.0 | Accessible carousel component |
| **Class Utilities** | clsx | 2.1.1 & tailwind-merge | 3.4.0 | Class name composition |

### Backend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Express.js | 4.18+ | Node.js web server |
| **Runtime** | Node.js | 20+ LTS | JavaScript runtime environment |
| **Database** | PostgreSQL | — | Relational database (optional) |
| **Authentication** | JWT (JWT Secret) | — | Token-based auth |

### Build & Development

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.39.1 | Code linting & style enforcement |
| **TypeScript Compiler** | 5.9.3 | Type checking & compilation |
| **PostCSS** | 8.5.6 | CSS transformation pipeline |
| **Autoprefixer** | 10.4.23 | Vendor prefix automation |
| **Module System** | ES Module | — | Native JavaScript modules |

### Regional Settings

| Setting | Value |
|---------|-------|
| **Currency** | HKD (Hong Kong Dollar) |
| **Date Format** | DD/MM/YYYY display / YYYY-MM-DD storage |
| **Region** | Hong Kong |

---

## Project Structure
