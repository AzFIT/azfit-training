# AzFIT XLSX Audit Analysis — Complete Action Map Breakdown

> **Source:** `AzFIT Client Portal — Complete Action Map & Audit.xlsx`
> **Total UI Elements:** 277 across 20 pages
> **Audit Date:** June 2026

---

## 📊 OVERALL HEALTH SUMMARY

```
Working:        131 elements (47.3%) ███████████████
Not Tested:     114 elements (41.2%) █████████████
Needs Review:    31 elements (11.2%) ███
Broken:           1 element   (0.4%) █
```

**Verdict:** 47% of the UI is verified working. **53% needs attention** — either untested or needs review. This is a **QA goldmine** that tells us exactly what to fix.

---

## 🚫 1 BROKEN ELEMENT (Fix Immediately)

| Sheet | Element | Problem | Fix |
|-------|---------|---------|-----|
| Sidebar | **Help** link | Links to `/help` which is a 404 | Create a Help page OR remove the link OR redirect to external docs |

**Action:** Either create `src/pages/HelpPage.tsx` and add the route, or remove the Help item from the sidebar navigation.

---

## ⚠️ 31 ELEMENTS NEEDING REVIEW (Fix Next)

### Programs Page — 11 Items (0% Working, All Need Review)

The entire Programs page filters and actions need attention:

| Element | Problem |
|---------|---------|
| Search input | Filters by name/description — needs testing |
| Goal filter dropdown | Filters by goal — may not work |
| Method filter dropdown | Filters by method — may not work |
| Level filter dropdown | Filters by difficulty — may not work |
| Equipment filter dropdown | Filters by equipment — may not work |
| Sort dropdown | Reorders list — needs testing |
| Program cards (×8) | Display info — cards may not render data |
| Duplicate (per card) | Duplicates in store — action may not work |
| Assign (per card) | Assigns to client — simulated only, not real |
| Archive (per card) | Sets isArchived=true — may not persist |
| + Design New Program | Header CTA — needs routing check |

**Fix:** The Programs page needs a full review. The filters likely don't wire to actual data. Program cards may show empty state incorrectly.

### Calendar Page — 16 Items (0% Working, All Need Review)

The entire Calendar page is marked "Needs Review" — every interaction:

| Element | Problem |
|---------|---------|
| View toggle (Day/Week/Month/Agenda) | View switching may not work |
| Date navigation ([<] [>]) | May not navigate properly |
| Today button | May not jump to today |
| Month grid cells | Date selection may not work |
| Time slots (×119) | Session booking dialogs may not open |
| Event blocks | Edit dialogs may not open |
| BookSessionDialog (4-step) | Wizard may be incomplete |
| EditSessionDialog | Save/Cancel may not work |
| CancelConfirmDialog | Cancellation may not work |
| BlockTimeDialog | Time blocking may not work |

**Fix:** Calendar dialogs are the biggest gap. The 4-step BookSessionDialog, EditSessionDialog, and CancelConfirmDialog all need testing and likely bug fixes.

### Global Dialogs — 4 Items Need Review

| Dialog | Status | Problem |
|--------|--------|---------|
| BookSessionDialog | Needs Review | 4-step wizard may have flow issues |
| EditSessionDialog | Needs Review | Save changes may not persist |
| CancelConfirmDialog | Needs Review | Cancellation may not remove event |
| BlockTimeDialog | Needs Review | Time blocking may not work |

---

## 🔶 114 ELEMENTS NOT TESTED (Test & Verify)

### 🔴 Completely Untested Pages (0% Working)

These 7 pages have **ZERO verified working elements**. They may render but haven't been tested:

| Page | Untested | Key Features |
|------|----------|-------------|
| **Settings** | 34/34 | Profile, Appearance, Notifications, Security, Data tabs — the entire settings system |
| **Nutrition** | 18/18 | TDEE calculator, macro charts, meal plan, water tracker |
| **Program Wizard** | 14/14 | 8-step program builder — goal, method, context, phases, split, exercises, preview, save |
| **Assessments** | 12/12 | PAR-Q form, BioPrint (8 skinfolds), Body Stats (7 circumferences) |
| **Exercise Library** | 10/10 | 200 exercises, filters, detail dialogs, add-to-program |
| **Progress Photos** | 9/9 | Upload, categories, comparison mode, timeline view, lightbox |
| **Notifications** | 4/4 | Mark read, dismiss, grouped by date |

### 🟡 Partially Working Pages (Small Gaps)

| Page | Working | Not Tested | What's Missing |
|------|---------|------------|----------------|
| Client Directory | 9/10 | 1 | Empty state CTA |
| Client Profile | 26/29 | 3 | Edit icon, View Program Details, some chat features |
| Dashboard | 12/13 | 1 | View Reports quick action |
| Landing | 7/9 | 2 | Watch Demo button, Footer links |
| Login | 12/13 | 1 | Forgot password link |
| Navbar | 19/20 | 1 | Search icon (placeholder) |
| Programs | 0/13 | 2 | Empty state CTA, Edit per card |

### ✅ Fully Working Pages (No Action Needed)

| Page | Working | Notes |
|------|---------|-------|
| **Onboarding** | 17/17 | Complete 3-step onboarding flow |
| **Signup** | 10/10 | Registration with validation |
| **FAB** | 4/4 | Floating action button + radial menu |
| **Login** | 12/13 | Nearly complete (only forgot password untested) |
| **Sidebar** | 10/11 | Nearly complete (only Help link broken) |

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

Based on user impact and business value, here's the priority order:

### Priority 1: Fix Broken + Needs Review (17 items)
1. **Remove/fix Help sidebar link** (1 broken)
2. **Fix Programs page filters** (11 needs review)
3. **Fix Calendar dialogs** (4 global dialogs + 16 calendar items)

### Priority 2: Core Trainer Features (50 items)
4. **Program Wizard** (14 untested) — trainers can't build programs without this
5. **Exercise Library** (10 untested) — needed for program building
6. **Assessments** (12 untested) — PAR-Q, BioPrint, Body Stats
7. **Nutrition TDEE calculator** (18 untested) — client dietary planning

### Priority 3: Client Management Features (46 items)
8. **Progress Photos** (9 untested) — client progress tracking
9. **Notifications** (4 untested) — system notifications
10. **Settings** (34 untested) — app configuration

### Priority 4: Polish (10 items)
11. **Landing page** — Watch Demo button, footer links
12. **Client Profile gaps** — Edit icon, View Program Details

---

## 📋 HOW TO APPLY THIS TO YOUR WEBSITE

### Option A: Systematic QA Pass (Recommended)

Work through the audit sheet by sheet:

1. Print out or open the XLSX
2. Go to each page in the app
3. Test each element marked "Not Tested"
4. Mark as Working or Broken
5. Fix anything that's broken
6. Move to next page

### Option B: Priority-Driven Development

Use the priority order above and tell Kimi Code:

> "Focus on Priority 1 first: Fix the Help sidebar link, fix Programs page filters, and fix Calendar dialogs. Read the audit file at `[path]` and work through the 'Needs Review' and 'Broken' items first."

### Option C: Feature-Driven (Per Sprint)

Pick a feature area each week:
- **Week 1:** Program Wizard (14 items)
- **Week 2:** Exercise Library + Assessments (22 items)
- **Week 3:** Nutrition + Progress Photos (27 items)
- **Week 4:** Settings + Notifications (38 items)

---

## 📁 FILES REFERENCED IN AUDIT

The audit maps to these source files:

| Sheet | Likely Source File |
|-------|-------------------|
| Landing | `src/pages/LandingPage.tsx` |
| Login | `src/pages/LoginPage.tsx` |
| Signup | `src/pages/SignupPage.tsx` |
| Onboarding | `src/pages/OnboardingPage.tsx` |
| Navbar | `src/components/Navbar.tsx` |
| Sidebar | `src/components/AppSidebar.tsx` or `src/components/Layout.tsx` |
| Dashboard | `src/pages/DashboardPage.tsx` |
| Client Directory | `src/pages/ClientDirectory.tsx` |
| Client Profile | `src/pages/ClientProfilePage.tsx` |
| Programs | `src/pages/ProgramsPage.tsx` |
| Program Wizard | `src/pages/ProgramWizardPage.tsx` |
| Exercise Library | `src/pages/ExerciseLibraryPage.tsx` |
| Calendar | `src/pages/CalendarPage.tsx` |
| Assessments | `src/pages/AssessmentsPage.tsx` or tabs in ClientProfile |
| Nutrition | `src/pages/NutritionPage.tsx` |
| Progress Photos | `src/pages/PhotosPage.tsx` or `src/pages/ProgressPhotosPage.tsx` |
| Settings | `src/pages/SettingsPage.tsx` |
| Notifications | `src/pages/NotificationsPage.tsx` or dropdown |
| FAB | `src/components/FAB.tsx` or `src/components/FloatingActionButton.tsx` |
| Global Dialogs | `src/components/dialogs/` or `src/components/` |

---

## 🔑 KEY INSIGHTS

1. **Onboarding and Auth are solid** — 47/50 elements working. The login/signup/onboarding flow is production-ready.

2. **Core trainer tools are untested** — Program Wizard, Exercise Library, and Assessments are the heart of a training platform but have 0% verified coverage.

3. **Calendar is the riskiest area** — 16 items all marked "Needs Review" suggests the calendar was built but never fully tested end-to-end.

4. **Settings is completely untested** — 34 elements, none verified. This is a low-priority page but should be tested before launch.

5. **The audit is a living document** — As you test and fix items, update the Status column. This becomes your QA tracking sheet.

---

## 💡 WHAT TO TELL KIMI CODE

### Short Version (Quick Start):

> Read the audit file `AzFIT Client Portal — Complete Action Map & Audit.xlsx`. Focus on items marked "Needs Review" and "Broken" first. Then tackle "Not Tested" pages in this order: Program Wizard → Exercise Library → Assessments → Nutrition → Calendar dialogs. Update the Status column as you verify each element. One page at a time.

### Detailed Version (Full Sprint):

> We have a complete UI audit of AzFIT with 277 elements across 20 pages. 131 are Working, 31 Need Review, 114 are Not Tested, and 1 is Broken. I need you to:
>
> **Phase 1 — Fix Broken & Needs Review:**
> 1. Fix the Sidebar "Help" link (404) — either create a Help page or remove the link
> 2. Fix Programs page filters — search, goal, method, level, equipment filters should all work
> 3. Fix Calendar dialogs — BookSessionDialog (4-step wizard), EditSessionDialog, CancelConfirmDialog, BlockTimeDialog
>
> **Phase 2 — Test Core Trainer Tools:**
> 4. Program Wizard — test all 14 elements (8 steps, goal cards, method cards, phase selector, day toggles, exercise swap, save, assign)
> 5. Exercise Library — test all 10 elements (search, filters, 200 cards, detail dialog, add-to-program)
> 6. Assessments — test all 12 elements (PAR-Q form, BioPrint 8 skinfolds, Body Stats 7 circumferences)
>
> **Phase 3 — Test Nutrition & Photos:**
> 7. Nutrition — test TDEE calculator, macro charts, meal plan, water tracker (18 elements)
> 8. Progress Photos — test upload, categories, comparison, timeline, lightbox (9 elements)
>
> **Phase 4 — Test Settings & Notifications:**
> 9. Settings — test all 5 tabs (Profile, Appearance, Notifications, Security, Data) — 34 elements
> 10. Notifications — test mark read, dismiss, grouped view (4 elements)
>
> Rules: One page at a time. Run `npm run build` after each page. Tell me what you found (Working vs Broken) before moving to the next page.

---

*Generated from AzFIT Client Portal — Complete Action Map & Audit.xlsx*
*Analysis generated June 2026*
