# AzFIT Client Portal

> Professional fitness training management platform for AzTechFit Hong Kong.
>
> **Live Site:** https://azfit.fit/

---

## Overview

AzFIT is a comprehensive client portal designed for personal trainers and fitness coaches. It provides tools for client management, session scheduling, program design, nutrition tracking, and data-driven progress monitoring — all in one unified platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 7.2.4 |
| Styling | Tailwind CSS 3.4.19 + shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand + persist middleware |
| Router | HashRouter (for static deployment) |
| Icons | lucide-react |
| Dates | date-fns |
| Currency | HKD (Hong Kong Dollar) |
| Date Format | DD/MM/YYYY display / YYYY-MM-DD storage |

---

## Feature Checklist

| Feature | Status |
|---------|--------|
| **Landing Page** — Hero, stats, features, testimonials, CTA | ✅ |
| **Authentication** — Trainer/Client roles, demo mode, password reset | ✅ |
| **Dashboard** — KPI cards, sparklines, today's schedule, follow-ups | ✅ |
| **Client Directory** — Search, filter, sort, table view, pagination | ✅ |
| **Client Profile** — 12 tabs: Dashboard, BioPrint, BodyStats, Records, Notes, Sessions, Calendar, Programs, Diet/Nutrition, Lifestyle, Database, Goals | ✅ |
| **Client Edit Mode** — Full edit on all tabs (except email/password) | ✅ |
| **Goals Tab** — Progress timeline, milestones, weight/body fat charts | ✅ |
| **Calendar** — Week/Day/Month views, 35 time slots (0500-2200) | ✅ |
| **Calendar Click-to-Add** — Click any cell → New Event dialog | ✅ |
| **Programs Library** — 30+ programs, search, filter, assign | ✅ |
| **Program Wizard** — Exercise blocks, drag reorder, Poliquin notation | ✅ |
| **Exercise Database** — 1000+ exercises, filter by muscle/equipment | ✅ |
| **Nutrition Hub** — TDEE calculator, macro presets, meal logging | ✅ |
| **Nutrition Client Search** — Search clients, load body stats | ✅ |
| **Hydration Tracker** — Daily water intake log | ✅ |
| **Supplement Tracker** — Supplement schedule | ✅ |
| **PDF Export** — Professional nutrition report export | ✅ |
| **AI Chat Assistant** — Page-restricted AI, NLP commands, topic guard | ✅ |
| **Settings** — 7 sections: Appearance, Notifications, Calendar, Data, AI, Business, About | ✅ |
| **Responsive Design** — Desktop, tablet, mobile | ✅ |
| **Dark Mode** — Toggle support | ✅ |

---

## Complete Workflow Tree

```
AzFIT Client Portal
|
+-- Landing Page (/) — Public
|   +-- Hero section — gym background, "Smart Training. Engineered For You."
|   +-- Stats bar — 116+ clients, 11+ trainers, 2,333+ sessions, 22% satisfaction
|   +-- Features grid — Assessments, Data-Driven, Nutrition
|   +-- How It Works — 3 steps (Sign Up → Train → Track)
|   +-- Testimonial — client quote
|   +-- CTA Banner — Join as Trainer / Join as Client
|   +-- Footer — links, contact, AzTechFit Hong Kong
|
+-- Authentication
|   +-- Login (/login) — email/password, role tabs (Trainer/Client)
|   +-- Sign Up (/signup) — new account registration
|   +-- Forgot Password (/forgot-password) — password reset flow
|   +-- Onboarding (/onboarding) — guided setup after signup
|   +-- Demo Mode — bypass login with sample data
|
+-- Trainer Dashboard (/trainer/dashboard) — Protected
|   +-- KPI Cards (2-col mobile, 4-col desktop)
|   |   +-- Revenue — with sparkline + trend badge
|   |   +-- Active Clients — with sparkline + trend badge
|   |   +-- Sessions This Week — with sparkline + trend badge
|   |   +-- Avg Compliance — with circular ring chart
|   |
|   +-- Today's Schedule
|   |   +-- Synced from calendar events
|   |   +-- Shows sessions for today's date
|   |   +-- Click to view details
|   |
|   +-- Follow-ups & Alerts
|   |   +-- Clients with no session 5+ days
|   |   +-- Compliance < 70%
|   |   +-- Birthdays, overdue assessments
|   |
|   +-- Client Overview Grid (2-col mobile)
|   |   +-- Search by name/email/program
|   |   +-- Sort: alphabetical, last active, compliance, sessions
|   |   +-- Filter: program, status, compliance level
|   |   +-- Client cards — avatar, name, status badge, progress bar, stats
|   |   +-- Click → Client Profile
|   |
|   +-- Quick Action FAB (bottom-right)
|       +-- Add Client, New Session, Send Message, Create Program
|
+-- Client Directory (/trainer/clients) — Protected
|   +-- Stats cards (2-col mobile) — total, active, new, avg compliance
|   +-- Search + filters (program, status, compliance)
|   +-- Sortable table with pagination
|   +-- Click row → Client Profile
|
+-- Client Profile (/trainer/client/:id) — Protected
|   +-- Header — name, status, program, compliance, edit toggle
|   +-- Avatar upload (FileReader, camera hover overlay)
|   +-- Email/password protected (lock icon, never editable)
|   +-- 12 Tabs:
|   |   +-- Dashboard — weight, compliance, program, sessions
|   |   +-- BioPrint — body composition tracking
|   |   +-- Body Stats — measurements, progress photos
|   |   +-- Records — personal bests, benchmarks
|   |   +-- Notes — categorized notes, add/delete
|   |   +-- Sessions — session history, logs
|   |   +-- Calendar — client's personal calendar
|   |   +-- Programs — assigned program, progress
|   |   +-- Diet/Nutrition — macros, calories, meals
|   |   +-- Lifestyle — habits, activity, sleep
|   |   +-- Database — exercises, favourites
|   |   +-- Goals — NEW: targets, timeline, milestones, charts
|   +-- Edit Mode (EditModeContext) — toggles all tabs between view/edit
|
+-- Calendar (/trainer/calendar) — Protected
|   +-- 3 Views: Week, Day, Month
|   +-- 35 time slots: 0500-2200 every 30 minutes
|   +-- Click-to-Add: click any cell → New Event (pre-filled date/time)
|   +-- Session types: training, assessment, follow-up, personal, unavailable, birthday, reminder
|   +-- Client color coding
|   +-- Search, type filter, client filter
|   +-- Navigation: Today, prev/next, date display
|
+-- Programs (/trainer/programs) — Protected
|   +-- Programs Library — 30+ programs (strength, hypertrophy, fat loss, athletic)
|   +-- Search, filter by category/goal/difficulty
|   +-- Program detail modal
|   +-- Assign to client dialog
|   +-- Program Wizard (/programs/design) — exercise blocks, drag reorder
|
+-- Exercise Database (/exercises) — Protected
|   +-- 1000+ exercises loaded from public/exercises.json
|   +-- Filter: muscle group, equipment, difficulty
|   +-- Favourites system
|   +-- Video links
|
+-- Nutrition Hub (/trainer/nutrition) — Protected
|   +-- Client Search Bar — search clients, load body stats into calculator
|   +-- Body Stats Calculator
|   |   +-- TDEE/BMR with activity multiplier
|   |   +-- Gender, age, weight, height inputs
|   +-- Macro Targets
|   |   +-- Presets: Keto, Balanced, High Protein, Low Carb, Maintenance
|   |   +-- Custom macro adjustment
|   |   +-- Ring chart visualization
|   +-- Daily Meal Log
|   |   +-- Breakfast, Lunch, Dinner, Snacks
|   |   +-- Singapore/HK food database (120 items)
|   |   +-- Add/search foods, portion sizes
|   +-- Hydration Tracker — daily water intake
|   +-- Supplement Tracker — supplement schedule
|   +-- Weekly Adherence Chart (Recharts)
|   +-- Nutrition Gaming — streaks, achievements, scoring
|   +-- PDF Export — professional branded report
|
+-- AI Chat Assistant (bottom-left floating button)
|   +-- Page-restricted AI — only answers current page topics
|   +-- Polite redirect for off-topic questions
|   +-- Natural language commands:
|   |   +-- "Book Sarah at 5pm today"
|   |   +-- "Schedule John next Monday at 10am"
|   |   +-- "Show me quad exercises"
|   +-- Topic guard with keyword filtering
|   +-- Intent classification + entity extraction (dates, times, names)
|   +-- Fully client-side — no external AI API
|
+-- Settings (/settings) — Protected
|   +-- Appearance — theme, sidebar, font size, animations
|   +-- Notifications — reminders, alerts, sound
|   +-- Calendar — default view, week start, time format, working hours
|   +-- Data Management — export/import JSON, backup, clear all
|   +-- AI Assistant — toggle, suggestions, response style, restriction
|   +-- Business Info — gym name, trainer, address, currency, units
|   +-- About — version, build date, branding
|
+-- Notifications (/notifications) — Protected
|   +-- Notification list with read/unread
|   +-- Toast system
|
+-- Brand Story (/brand-story) — Public
|   +-- Company story, trainer bio, location (Hong Kong)
|
+-- Subscription (/subscribe) — Public
|   +-- Pricing tiers
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

## Credits

Built by AzTechFit Hong Kong — Smart Training. Engineered For You.
