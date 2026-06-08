# AzFIT Integration Plan — Building the Next Best Fitness Coaching Platform

> This folder contains everything needed to evolve AzFIT into the world's best personal training platform. We're taking the best ideas from Strong, Freeletics, 1FIT, and combining them with AzFIT's existing architecture.

---

## What's in This Folder

### 📄 Documents (Read in Order)

| # | File | What It Contains |
|---|------|-----------------|
| 1 | `01-comparison-report.html` | Full comparison of azfit.fit vs azfit-client-portal. Shows which features to port and which design to follow. **Open in browser.** |
| 2 | `02-ui-ux-research.html` | Deep research on Strong, Freeletics, 1FIT, Strava, and 10+ fitness apps. Identifies the most unique UI/UX patterns in the industry. **Open in browser.** |
| 3 | `03-workflow-wireframes.html` | ASCII wireframes showing how Strong + Freeletics + 1FIT workflows would look merged into AzFIT. **Open in browser.** |
| 4 | `04-kimi-instructions.md` | **THE MAIN FILE** — Detailed instructions for Kimi Code on what to implement, in what order, with acceptance criteria. |
| 5 | `README.md` | This file — overview of the entire project. |

### 🖼️ Mockup Images (`/images/` folder)

| Image | What It Shows | Source Inspiration |
|-------|---------------|-------------------|
| `images/azfit-programs-mockup.png` | Programs page with templates, KPI cards, rich program cards | Portal design + 1FIT organization |
| `images/azfit-workout-session-mockup.png` | In-workout session logger (live set/rep/RPE tracking) | Strong's workout UX |
| `images/azfit-client-roadmap-mockup.png` | Client phased training roadmap timeline | 1FIT's client journey |

---

## Project Vision

**AzFIT** is an AI-powered personal training platform for Hong Kong. We have two existing codebases:

- **azfit.fit** (production) — Live at https://azfit.fit — React 19 + TypeScript + Vite + Tailwind + Supabase. More feature-rich (26 pages, workout tracking, 1RM calc, exercise library) with better architecture (TanStack Query, normalized Zustand store).
- **azfit-client-portal** (GitHub Pages) — Live at https://azfit.github.io/azfit-client-portal — Same stack. Better visual design (charcoal KPI cards, multi-colored rings, severity-colored alerts) and unique features (Admin Dashboard, Program Matcher, AI Chat with @-commands, Excel export).

**The Goal:** Take the best of BOTH repos, add unique features inspired by Strong, Freeletics, and 1FIT, and build a unified platform that is the best personal training software in the world.

---

## What Makes AzFIT Different

No competitor combines:
- Deep strength coaching science (Poliquin methods, BioPrint, 1RM, periodization)
- Beautiful modern coach dashboard UX
- Client-facing progress visualization
- AI-powered program building
- In-workout session logging
- Recovery tracking integration

We have the opportunity to **own the high-end strength coach market**.

---

## Current Status (What's Already Done)

| Phase | Status | Details |
|-------|--------|---------|
| 1 — Foundation Cleanup | ✅ | HashRouter fix, file splitting, UUID |
| 2 — Port Portal Features | ✅ | Admin Dashboard, AI Chat, Program Matcher, Intake Wizard, RLS |
| 2.5 — Code Splitting | ✅ | 76% bundle reduction (2,290KB → 551KB) |
| 3 — Auth/Security | ✅ | Real Supabase Auth, backdoors removed |
| 3.5 — Landing Page CTA | ✅ | "Try Demo" button |
| 4 — Error Boundaries | ✅ | Crash isolation |
| 4 — Color Tokenization | ✅ | 1,328 hex values cleaned |
| 4 — Dead Code Cleanup | ✅ | -1,700 lines removed |
| 4 — Reset Password Page | ✅ | Full auth recovery flow |

---

## What's Next (Implementation Plan)

See `04-kimi-instructions.md` for the full detailed plan. High-level phases:

### Phase 5: Visual Design — Match Portal's Superior UI
- KPI card redesign (charcoal + multi-colored rings)
- Alert severity borders + relative timestamps
- Calendar time range 05:00 + color-coded events
- Programs page full redesign (templates + rich cards)

### Phase 6: Workout Session Logger — Strong-Inspired
- In-workout set/rep/RPE logging
- Previous session data inline
- Auto rest timer between sets
- Visual plate calculator
- Checkmark to complete sets

### Phase 7: Client Roadmaps — 1FIT-Inspired
- Visual phased timeline per client
- Phase deliverables with checkmarks
- Status dots (On Track / Needs Attention / At Risk)
- Per-client roadmap progress bars

### Phase 8: Conversational AI Program Builder — Freeletics-Inspired
- Chat-style program creation wizard
- One question at a time
- Tappable pill buttons
- Progress indicator

### Phase 9: Recovery Dashboard
- Readiness score (HRV + sleep + RHR combined)
- 7-day trend charts
- Color-coded readiness (Green/Yellow/Red)
- "Adjust Training" coach action

### Phase 10: Polish & Differentiation
- Progress celebration moments (confetti on PR)
- Weekly coach insights summary
- Social accountability features
- Mobile PWA setup

---

## How to Use This Folder with Kimi Code

1. **Copy this entire folder** to your local project directory:
   ```
   C:\Users\85254\Documents\azfit-training-main\.ai-plan\
   ```

2. **Tell Kimi Code:**
   > "Read the .ai-plan folder. Start with 04-kimi-instructions.md. We're building the next best fitness coaching platform — follow the plan step by step."

3. **Kimi Code will:**
   - Read all documents in order
   - Review the mockup images
   - Follow the implementation phases
   - Execute each phase with the provided acceptance criteria

---

## Team Working Agreement

- **We're building together** — this is a collaborative effort
- **Quality over speed** — every feature should be production-ready
- **Preserve existing architecture** — keep TanStack Query, normalized Zustand, code splitting
- **Reference portal code** — `C:\Users\85254\Documents\azfit-training-main\.temp\azfit-client-portal-main` has the superior visual design
- **Test after each change** — run `npm run build` after every modification
- **Deploy frequently** — push to https://azfit.fit after each phase

---

*Created June 2026 for AzTechFit Hong Kong*
