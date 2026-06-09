# P2 Plan: Bundle Optimization & Code Quality

## Current State Analysis

### Bundle Sizes (production build)
| Chunk | Size (raw) | Size (gzip) | Notes |
|-------|-----------|-------------|-------|
| `index-B24DTHqE.js` (main entry) | **561 kB** | 157 kB | Contains React, Router, all eagerly-imported stores |
| `vendor-recharts` | **447 kB** | 118 kB | Charts library — loaded by 10 files |
| `useAppDataStore` | **162 kB** | 29 kB | Central store — imported by almost every page |
| `vendor-ui` (lucide+radix) | **152 kB** | 50 kB | Icons + shadcn primitives |
| `ClientProfilePage` | **151 kB** | 24 kB | Eagerly imports ALL 14 tabs (6 use recharts) |
| `vendor-framer-motion` | **136 kB** | 45 kB | Animation library |
| `index-NyuFZdcY.js` | **93 kB** | 17 kB | Secondary shared chunk |
| `index-C19njTe_.js` | **33 kB** | 10 kB | Small shared utilities |

**Total JS: ~2.1 MB raw, ~560 kB gzipped**

### Key Problems Identified

#### 1. `ClientProfilePage` is 151 KB because it eagerly imports all 14 tabs
- **Root cause:** `src/components/clientProfile/tabs/index.ts` is a barrel file that re-exports all tabs
- `ClientProfilePage.tsx` imports from this barrel file: `import { DashboardTab, BioPrintTab, ... } from '../components/clientProfile/tabs'`
- 6 of the 14 tabs import `recharts`, which means **recharts is pulled into the ClientProfilePage chunk**
- This is the #1 reason the page is so large

#### 2. `useAppDataStore` is 162 KB and in the critical path
- Contains ALL entity types (clients, programs, exercises, sessions, alerts, notifications, workout logs, body stats, bio print, progress, nutrition)
- Imported by almost every page → must load before any app page renders
- Could be split into domain-specific stores that lazy-load their data

#### 3. `index-B24DTHqE.js` (main entry) is 561 KB
- Contains the route map + all eagerly-loaded dependencies
- Vite already code-splits pages via `React.lazy()`, but stores are eagerly imported

#### 4. Circular chunk warning
- Build warns: `Circular chunk: vendor-ui -> vendor-recharts -> vendor-ui`
- The manual chunk config in `vite.config.ts` causes recharts and ui to reference each other

#### 5. Massive source files (not directly a bundle issue, but maintenance)
- `NutritionPage.tsx`: 1,528 lines — 4 inline tab components
- `CalendarPage.tsx`: 1,416 lines — 10+ inline view components
- `ProgramsPage.tsx`: 1,320 lines — 6+ inline card components

---

## Proposed Approaches

### Option A: Lazy-Load ClientProfile Tabs (Recommended — High Impact, Low Risk)
**Goal:** Reduce `ClientProfilePage` from 151 KB → ~40 KB

**Changes:**
1. Convert each tab to `React.lazy()` import in `ClientProfilePage.tsx`
2. Replace the barrel file import with dynamic imports
3. Add `Suspense` fallback inside the tab content area
4. Only the active tab's code loads; switching tabs loads on demand

**Impact:**
- Initial ClientProfilePage load: ~40 KB (just the shell + active tab)
- `recharts` stays in its own vendor chunk, only loaded when a chart tab is opened
- No functional changes

**Effort:** ~30 minutes
**Risk:** Very low — pure code-splitting, no logic changes

---

### Option B: Fix Vite Manual Chunks + Add More Splitting
**Goal:** Reduce main entry chunk and fix circular dependency warning

**Changes:**
1. Fix `vite.config.ts` manual chunks to avoid circular references
2. Add `react`, `react-dom`, `react-router-dom` to their own vendor chunk
3. Split `lucide-react` from `@radix-ui` (they're unrelated)
4. Consider splitting `useAppDataStore` types from implementation

**Impact:**
- Better caching (vendor chunks change less often)
- Smaller main entry chunk
- Fixes build warning

**Effort:** ~20 minutes
**Risk:** Low — config-only changes

---

### Option C: Extract Tab Components from NutritionPage & CalendarPage
**Goal:** Reduce source file sizes for maintainability

**Changes:**
1. `NutritionPage.tsx` → Extract `MealPlannerTab`, `FoodDatabaseTab`, `WaterTrackerTab`, `SupplementsTab` to separate files
2. `CalendarPage.tsx` → Extract `WeekView`, `DayView`, `MonthView`, `AgendaView`, `NewSessionModal`, `SessionDetailModal` to separate files
3. `ProgramsPage.tsx` → Extract `ProgramCard`, `ProgramListRow`, `StatCard`, etc.

**Impact:**
- Better maintainability
- No bundle size change (Vite already splits by page)
- Enables future lazy-loading of individual views

**Effort:** ~60 minutes
**Risk:** Very low — file moves only

---

### Option D: Lazy-Load `useAppDataStore` Slices (Advanced)
**Goal:** Reduce initial store load

**Changes:**
1. Split `useAppDataStore` into domain stores: `useClientStore`, `useProgramStore`, `useSessionStore`, etc.
2. Keep a lightweight facade for backward compatibility
3. Pages only import the stores they need

**Impact:**
- Significant reduction in main chunk size
- More modular architecture

**Effort:** ~2-3 hours
**Risk:** Medium — touches many files, potential for subtle bugs

---

## Recommended Execution Order

1. **Option A** (lazy-load tabs) — highest ROI, immediate user benefit
2. **Option B** (fix chunks) — quick win, fixes build warning
3. **Option C** (extract components) — do incrementally as needed
4. **Option D** (store split) — defer to P3 or dedicated refactor sprint

## Expected Outcome

After Options A + B:
- `ClientProfilePage`: 151 KB → ~40 KB (-73%)
- Main entry chunk: 561 KB → ~450 KB (-20%)
- `recharts` only loads when chart tabs are opened
- No circular chunk warnings
- Faster initial page loads
