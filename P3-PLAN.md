# P3 Plan: Component Extraction & Code Maintainability

## Current State: Massive Source Files

| File | Lines | Inline Components/Functions | Extraction Strategy |
|------|-------|----------------------------|---------------------|
| `NutritionPage.tsx` | 1,528 | 4 tab components + data + helpers | Extract 4 tabs to `nutrition/` |
| `CalendarPage.tsx` | 1,416 | 10+ view components + 4 hooks + modals | Extract views to `calendar/` |
| `ProgramsPage.tsx` | 1,320 | 6 card components + constants | Extract cards to `programs/` |
| `PhotosPage.tsx` | 1,099 | 6 components (StatsBar, UploadModal, Lightbox, etc.) | Extract to `photos/` |
| `ClientIntakeWizard.tsx` | 1,178 | 12 form components + 6 calc functions | Extract to `intake/` |
| `SettingsPage.tsx` | 1,004 | 7 section components | Extract to `settings/` |
| `AiChat.tsx` | 1,029 | 3 sub-components + 6 helpers | Extract to `ai-chat/` |
| `DashboardPage.tsx` | 749 | 4 sub-components + 3 mappers | Extract to `dashboard/` |
| `ClientDirectory.tsx` | 633 | StatsBar + inline SortIcon | Extract StatsBar |
| `ProgramMatcherPage.tsx` | 588 | 3 components + constants | Extract to `matcher/` |

**Total: ~9,300 lines across 10 files that should be ~3,000 lines**

---

## Proposed Approach

### Option A: Extract All Massive Pages (Comprehensive)
**Scope:** Extract inline components from ALL 10 files above.

**Breakdown:**

1. **NutritionPage** → `src/components/nutrition/`
   - `MealPlannerTab.tsx` (~300 lines)
   - `FoodDatabaseTab.tsx` (~110 lines)
   - `WaterTrackerTab.tsx` (~170 lines)
   - `SupplementsTab.tsx` (~115 lines)
   - `MacroRing.tsx` (shared)
   - `calcMacros.ts` (helper)

2. **CalendarPage** → `src/components/calendar/`
   - `WeekView.tsx` (~75 lines)
   - `DayView.tsx` (~65 lines)
   - `MonthView.tsx` (~110 lines)
   - `AgendaView.tsx` (~110 lines)
   - `NewSessionModal.tsx` (~160 lines)
   - `SessionDetailModal.tsx` (~150 lines)
   - `CalendarToolbar.tsx` (~45 lines)
   - `hooks/` (useCurrentTime, useFilteredSessions, etc.)

3. **ProgramsPage** → `src/components/programs/`
   - `ProgramCard.tsx` (~210 lines)
   - `ProgramListRow.tsx` (~80 lines)
   - `StatCard.tsx` (~40 lines)
   - `TemplateFeatureCard.tsx` (~65 lines)
   - `DifficultyBadge.tsx` (~15 lines)
   - `Pagination.tsx` (~65 lines)
   - `EmptyState.tsx` (~25 lines)

4. **PhotosPage** → `src/components/photos/`
   - `StatsBar.tsx` (~50 lines)
   - `UploadModal.tsx` (~245 lines)
   - `Lightbox.tsx` (~150 lines)
   - `ComparisonView.tsx` (~105 lines)
   - `PhotoCard.tsx` (~100 lines)
   - `ToggleRowInline.tsx` (~35 lines)

5. **SettingsPage** → `src/components/settings/`
   - `DisplaySection.tsx` (~85 lines)
   - `NotificationsSection.tsx` (~85 lines)
   - `AppearanceSection.tsx` (~130 lines)
   - `PrivacySection.tsx` (~40 lines)
   - `AccountSection.tsx` (~185 lines)
   - `DataSection.tsx` (~100 lines)
   - `IntegrationsSection.tsx` (~130 lines)
   - `SectionCard.tsx`, `ToggleRow.tsx`, `SegmentedControl.tsx` (shared)

6. **DashboardPage** → `src/components/dashboard/`
   - `SessionStatusBadge.tsx`
   - `AlertIcon.tsx`
   - `ClientStatusBadge.tsx`
   - `RecentActivityFeed.tsx`

7. **ClientDirectory** → Extract `StatsBar` + `SortIcon`

8. **ProgramMatcherPage** → Extract `QuestionCard`, `ScoreBadge`, `MatchResultCard`

9. **ClientIntakeWizard** → Extract form components + calculation utilities

10. **AiChat** → Extract `LinkableMessage`, `PlainText`, helpers

**Impact:**
- Source files shrink from 9,300 → ~3,000 lines
- Each component is independently testable
- Easier to navigate, review, and debug
- No bundle size change (Vite already splits by route)

**Effort:** ~3-4 hours
**Risk:** Very low — pure file moves, no logic changes

---

### Option B: Extract Top 3 Only (Focused)
**Scope:** Only the 3 largest pages: NutritionPage, CalendarPage, ProgramsPage

**Same extraction strategy as Option A but limited to 3 files.**

**Impact:** ~4,300 lines → ~1,500 lines
**Effort:** ~1.5 hours
**Risk:** Very low

---

### Option C: Extract Top 5 (Balanced)
**Scope:** Top 5: NutritionPage, CalendarPage, ProgramsPage, PhotosPage, SettingsPage

**Impact:** ~6,400 lines → ~2,000 lines
**Effort:** ~2.5 hours
**Risk:** Very low

---

## Recommended Execution Order

Within each extraction:
1. Create target directory
2. Copy component code to new file
3. Update imports in new file
4. Replace inline code with import in original
5. Verify build passes

## My Recommendation

**Option C (Top 5)** — best balance of impact vs. time. The top 5 files are the most painful to work with, and extracting them yields 70% of the benefit for 60% of the effort.

If you want maximum maintainability, go with **Option A (All 10)**.
