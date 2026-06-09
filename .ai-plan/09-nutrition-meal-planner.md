# Kimi Code — Nutrition & Meal Planner (Exclusive Focus)

> **Mission:** Build a complete nutrition system that links to workout programs, auto-generates meal plans with options, and supports manual meal entry. The other Kimi Code is handling Program Builder + UI Audit — you focus ONLY on nutrition. NO overlap.
>
> **Context:** The other Kimi Code has already seeded Supabase with 413 foods for the Meal Planner. You have a database to work with.

---

## WHAT THE OTHER KIMI CODE IS DOING (Don't Touch)

- Program Builder v2 UI
- UI Audit fixes (Help link, Programs filters, Calendar dialogs)
- Exercise library with motion categories

**Your exclusive domain:** Nutrition page, meal planning, macro generation, food database integration.

---

## THE VISION: Program-Linked Nutrition System

When a trainer assigns a workout program to a client, the nutrition system should:

1. **Read the program** → detect goal (fat loss / muscle gain / maintenance)
2. **Calculate TDEE** → using client's age/weight/height/activity
3. **Set calorie target** → based on goal (+300 surplus / -500 deficit / maintain)
4. **Set macro targets** → protein prioritized, then fats, then carbs
5. **Generate meal plan** → breakfast/lunch/dinner/snacks with 2-4 options each
6. **Allow manual override** → client can input their own meals
7. **Track adherence** → daily check-in, weekly review

---

## PHASE 1: Fix TDEE Calculator + Link to Client Data

### 1.1 Fix Current TDEE Calculator

The current Nutrition page has 18 untested elements. The TDEE calculator exists but:
- Diet presets don't switch properly (fat stuck at 50%)
- No body fat % input for Katch-McArdle
- Not connected to client profile data

**Fix:**
```
- Replace DIET_PRESETS with g/kg-based macro calculation
- Protein: 2.0-2.5g/kg (varies by preset)
- Fat: 0.5-1.1g/kg (varies by preset)
- Carbs: remainder calories
- Percentages update immediately on preset switch
```

**Files:** `src/pages/NutritionPage.tsx` — lines ~240 (calcMacros function)

### 1.2 Auto-Fill Client Data

When the nutrition page loads for a specific client, auto-populate:
- Gender (from client profile)
- Age (from client profile DOB)
- Weight (from latest body stats entry)
- Height (from client profile)
- Activity level (from assigned program frequency)
- Goal (from client goal field)

This removes manual entry for trainers — one click and TDEE is calculated.

**Files to modify:**
- `src/pages/NutritionPage.tsx` — add client data auto-load
- `src/lib/db.ts` or data hooks — fetch latest client body stats

### 1.3 Link Calories to Program Goal

When a program is assigned:
- **Fat Loss program** → TDEE − 500kcal
- **Muscle Gain program** → TDEE + 300kcal
- **Maintenance/Rehab** → TDEE as-is

Show the adjustment clearly: "TDEE: 2,749 kcal → Target: 2,249 kcal (Fat Loss: −500)"

**Acceptance Criteria:**
- [ ] Diet presets switch correctly (Balanced/Low Carb/High Carb/High Protein)
- [ ] Fat percentage updates immediately (not stuck)
- [ ] Client data auto-fills from profile
- [ ] Calorie target adjusts based on program goal
- [ ] Build passes

**STOP. Tell me when Phase 1 is done.**

---

## PHASE 2: Meal Plan Generator

### 2.1 Database: Food Table (Already Exists!)

The other Kimi Code seeded 413 foods. Verify the table structure:

```sql
-- Expected table: foods
-- id, name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_size_g, serving_description
```

If needed, create a query to fetch foods by macro category:
```sql
-- High protein foods (for protein-focused meals)
SELECT * FROM foods WHERE (protein_per_100g / calories_per_100g * 100) > 20

-- Low carb foods (for low-carb meals)
SELECT * FROM foods WHERE carbs_per_100g < 10

-- Complex carb foods (for pre-workout)
SELECT * FROM foods WHERE carbs_per_100g > 15 AND fiber_per_100g > 3
```

### 2.2 Meal Plan Structure

A meal plan has 4-6 meals per day:

| Meal | Timing | Macro Focus |
|------|--------|-------------|
| Breakfast | Morning | Protein + Complex Carbs |
| Lunch | Midday | Balanced P/C/F |
| Pre-Workout | Before training | Carbs (energy) + moderate protein |
| Post-Workout | After training | Protein (recovery) + simple carbs |
| Dinner | Evening | Protein + Vegetables + Low carb |
| Snack | Optional | Fills remaining macros |

Each meal shows:
- **Primary option** (default)
- **2-4 alternatives** (swappable)
- Calories and macros per option
- Prep time indicator

### 2.3 Meal Plan Generator Algorithm

```typescript
function generateMealPlan(targetCalories: number, targetProtein: number, targetCarbs: number, targetFat: number) {
  // 1. Divide calories across meals (breakfast 25%, lunch 30%, dinner 30%, snacks 15%)
  const mealCalories = {
    breakfast: targetCalories * 0.25,
    lunch: targetCalories * 0.30,
    dinner: targetCalories * 0.30,
    snack: targetCalories * 0.15,
  }

  // 2. For each meal, find foods that fit the calorie + macro target
  // 3. Select primary option + 3 alternatives
  // 4. Ensure variety (different proteins, different cuisines)
  // 5. Return structured meal plan
}
```

### 2.4 UI: Meal Plan Display

Create a new component: `MealPlanDisplay.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Monday, June 9, 2026          [◀ Prev] [Next ▶]        │
│  Target: 2,249 kcal  P:156g  C:225g  F:75g                │
├─────────────────────────────────────────────────────────────┤
│  🍳 BREAKFAST  ~562 kcal (P:40g C:60g F:18g)              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✅ Scrambled eggs (3) + Oatmeal + Berries          │   │
│  │    562 kcal | P:40g | C:60g | F:18g | ⏱️ 15 min    │   │
│  └─────────────────────────────────────────────────────┘   │
│  🔄 Alternatives:                                           │
│  [Greek Yogurt Parfait] [Protein Pancakes] [Smoothie Bowl] │
├─────────────────────────────────────────────────────────────┤
│  🍱 LUNCH  ~675 kcal (P:50g C:70g F:22g)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✅ Grilled Chicken Breast + Rice + Broccoli        │   │
│  │    675 kcal | P:50g | C:70g | F:22g | ⏱️ 25 min    │   │
│  └─────────────────────────────────────────────────────┘   │
│  🔄 Alternatives:                                           │
│  [Salmon + Quinoa] [Turkey Wrap] [Tofu Stir Fry]           │
├─────────────────────────────────────────────────────────────┤
│  🏋️ PRE-WORKOUT  ~300 kcal (P:15g C:50g F:5g)             │
│  ...                                                        │
├─────────────────────────────────────────────────────────────┤
│  💪 POST-WORKOUT  ~400 kcal (P:40g C:40g F:8g)             │
│  ...                                                        │
├─────────────────────────────────────────────────────────────┤
│  🍽️ DINNER  ~675 kcal (P:50g C:45g F:25g)                  │
│  ...                                                        │
├─────────────────────────────────────────────────────────────┤
│  🍎 SNACK  ~337 kcal (P:10g C:20g F:20g)                   │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

**Files to create:**
- `src/components/nutrition/MealPlanDisplay.tsx`
- `src/components/nutrition/MealCard.tsx` (individual meal with alternatives)
- `src/components/nutrition/MealOptionPill.tsx` (swappable alternative)
- `src/utils/mealPlanGenerator.ts` (algorithm)
- `src/hooks/useMealPlan.ts` (data fetching)

### 2.5 Swap Meal Functionality

When a user clicks an alternative:
1. Update the primary option to the selected alternative
2. Recalculate day's total macros
3. Show macro change animation
4. Save preference to localStorage (for demo) or Supabase (for production)

**Acceptance Criteria:**
- [ ] Meal plan generates based on TDEE + macro targets
- [ ] Each meal has 1 primary + 3 alternative options
- [ ] Alternatives are clickable and swap the meal
- [ ] Daily macro totals update when meals are swapped
- [ ] Day navigation (prev/next) works
- [ ] Build passes

**STOP. Tell me when Phase 2 is done.**

---

## PHASE 3: Manual Meal Input + Food Search

### 3.1 Add Meal Button

Each meal section has an "+ Add Custom Meal" button that opens a form:

```
┌─────────────────────────────────────────────────────────────┐
│  📝 Add Custom Meal                                         │
├─────────────────────────────────────────────────────────────┤
│  Food: [Search foods...                    ] 🔍              │
│         ┌─────────────────────────────────────┐              │
│         │ Chicken Breast (100g)      165 kcal │              │
│         │ Chicken Thigh (100g)       179 kcal │              │
│         │ Chicken Drumstick (100g)   155 kcal │              │
│         └─────────────────────────────────────┘              │
│  Serving: [150] g                                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Calories: 248 kcal                                  │    │
│  │ Protein:  46g  |  Carbs: 0g  |  Fat: 7g            │    │
│  └─────────────────────────────────────────────────────┘    │
│  [Cancel]              [Add to Breakfast]                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Food Search

- Query the 413-food database
- Filter as user types (debounced 300ms)
- Show calories + macros per 100g
- Allow custom serving size input
- Auto-calculate macros based on serving size

### 3.3 Recent/Favorite Foods

Track foods the user has added before:
- "Recently Used" section (last 10 foods)
- "Favorites" (starred foods)
- Saves to localStorage for demo / Supabase for production

**Files to create:**
- `src/components/nutrition/AddMealDialog.tsx`
- `src/components/nutrition/FoodSearch.tsx`
- `src/components/nutrition/FoodResultItem.tsx`
- `src/components/nutrition/MacroMiniDisplay.tsx`

**Acceptance Criteria:**
- [ ] "+ Add Custom Meal" button opens dialog
- [ ] Food search queries the 413-food database
- [ ] Search filters in real-time as user types
- [ ] Serving size input auto-calculates macros
- [ ] Added meal appears in the meal plan
- [ ] Daily macro totals update
- [ ] "Recently Used" foods shown for quick re-add
- [ ] Build passes

**STOP. Tell me when Phase 3 is done.**

---

## PHASE 4: Daily/Weekly Nutrition Tracking

### 4.1 Daily Nutrition Log

Show what the client actually ate vs. what was planned:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Today — Monday, June 9                                  │
├─────────────────────────────────────────────────────────────┤
│                    Planned  │  Actual   │  Status           │
│  Calories:         2,249   │  2,180   │  ✅ On Track      │
│  Protein:            156g  │   148g   │  ⚠️ −8g          │
│  Carbs:              225g  │   210g   │  ✅ On Track      │
│  Fat:                 75g  │    72g   │  ✅ On Track      │
│  Water:              8/8   │   6/8    │  💧 +2 needed     │
├─────────────────────────────────────────────────────────────┤
│  Breakfast:          ✅ Eaten as planned                    │
│  Lunch:              ✅ Eaten as planned                    │
│  Pre-Workout:        🔄 Swapped: Banana + PB instead        │
│  Post-Workout:       ✅ Eaten as planned                    │
│  Dinner:             ❌ Custom: Salmon + Salad (logged)     │
│  Snack:              ⬜ Not logged yet                      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Weekly Nutrition Summary

Show a 7-day overview with adherence scoring:

```
│  M    T    W    T    F    S    S                            │
│  ✅   ✅   ⚠️   ✅   ❓   ⬜   ⬜                           │
│  98%  95%  82%  99%  —   —   —                            │
│                                                             │
│  Weekly Avg: 92% adherence                                  │
│  Avg Calories: 2,210 / 2,249 target                         │
│  Weight Change: −0.3kg                                      │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Water Tracker

Simple 8-glass tracker:
- Click to fill/empty a glass
- Visual: 8 empty glass icons → fill as clicked
- Target: 8 glasses (≈ 2L)

**Files to create:**
- `src/components/nutrition/DailyNutritionLog.tsx`
- `src/components/nutrition/WeeklyNutritionSummary.tsx`
- `src/components/nutrition/WaterTracker.tsx`
- `src/components/nutrition/AdherenceBadge.tsx`

**Acceptance Criteria:**
- [ ] Daily log shows planned vs actual macros
- [ ] Meals can be marked as eaten/swapped/missed
- [ ] Weekly summary shows 7-day adherence
- [ ] Water tracker with 8 clickable glasses
- [ ] Adherence percentage calculated
- [ ] Build passes

**STOP. Tell me when Phase 4 is done.**

---

## PHASE 5: AI Meal Analysis (Foundation for Future)

### 5.1 Manual Meal Description Input

Create a text input where clients can describe what they ate:

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 AI Meal Analysis (Beta)                                 │
├─────────────────────────────────────────────────────────────┤
│  Describe what you ate:                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ "2 eggs, 2 slices toast with butter, orange juice"  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Analyze]                                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🍳 Estimated Macros:                                │   │
│  │                                                     │   │
│  │ 2 Large Eggs       180 kcal  P:12g  C:1g   F:12g  │   │
│  │ 2 Toast Slices     160 kcal  P:6g   C:30g  F:2g   │   │
│  │ 1 tbsp Butter      102 kcal  P:0g   C:0g   F:12g  │   │
│  │ Orange Juice (1c)  112 kcal  P:2g   C:26g  F:0g   │   │
│  │ ─────────────────────────────────────────────────  │   │
│  │ TOTAL:             554 kcal  P:20g  C:57g  F:26g  │   │
│  └─────────────────────────────────────────────────────┘   │
│  [✓ Add to My Meals]  [✏️ Edit]  [🗑️ Discard]             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 How It Works (Without Real AI)

For now, use a **keyword-matching approach**:

```typescript
// Parse the input text for known food keywords
const knownFoods = {
  'egg': { serving: '1 large', calories: 90, protein: 6, carbs: 0.6, fat: 7 },
  'toast': { serving: '1 slice', calories: 80, protein: 3, carbs: 15, fat: 1 },
  'butter': { serving: '1 tbsp', calories: 102, protein: 0, carbs: 0, fat: 12 },
  'orange juice': { serving: '1 cup', calories: 112, protein: 2, carbs: 26, fat: 0 },
  // ... match against the 413-food database
}

// Extract quantities with regex:
// "2 eggs" → { food: 'egg', quantity: 2 }
// "1 tbsp butter" → { food: 'butter', quantity: 1, unit: 'tbsp' }
```

Parse quantity + food name, look up in food database, multiply by quantity, sum totals.

**Future upgrade:** Replace keyword matching with an actual AI API call (OpenAI/Claude) that parses natural language meal descriptions.

**Files to create:**
- `src/components/nutrition/AiMealAnalysis.tsx`
- `src/utils/mealParser.ts` (keyword extraction)
- `src/utils/foodMatcher.ts` (database lookup)

**Acceptance Criteria:**
- [ ] Text input accepts meal description
- [ ] Keywords are extracted and matched to food database
- [ ] Quantities are parsed (2 eggs, 1 cup, etc.)
- [ ] Estimated macros shown with breakdown
- [ ] Can add parsed meal to daily log
- [ ] Build passes

**STOP. Tell me when Phase 5 is done.**

---

## PHASE 6: Integration & Polish

### 6.1 Program-Nutrition Link

When a client is assigned a program:
- Auto-generate a meal plan based on program goal
- Show in client profile: "Nutrition plan linked to [Program Name]"
- Adjust calories when program phase changes

### 6.2 Client-Facing Nutrition View

Create a simplified view for clients (not trainers):
- Today's meals only
- Simple check-off ("I ate this")
- Water tracker
- Weekly adherence score

### 6.3 Supabase Data Persistence

Save meal plans to Supabase:
```sql
-- meal_plans table
-- id, client_id, date, meals (JSON), target_calories, target_protein, target_carbs, target_fat

-- meal_logs table
-- id, client_id, date, meal_type, foods (JSON), actual_calories, actual_protein, actual_carbs, actual_fat

-- water_logs table
-- id, client_id, date, glasses_consumed, target_glasses
```

**Acceptance Criteria:**
- [ ] Meal plans save to Supabase
- [ ] Daily logs persist across sessions
- [ ] Client-facing simplified view exists
- [ ] Program-nutrition link works
- [ ] Build passes
- [ ] Deploy to https://azfit.fit

---

## Golden Rules

1. **You own nutrition. The other Kimi Code owns program builder + audit fixes.** No overlap.
2. **ONE phase at a time.** Finish Phase 1 before starting Phase 2.
3. **Run `npm run build` after EVERY phase.** Zero errors.
4. **Use the 413-food database** already seeded by the other Kimi Code.
5. **Demo data is fine** for now. Supabase integration can come in Phase 6.
6. **Tell me what you did** after each phase. Summary of files changed.
7. **Ask if unclear.** Don't guess.

---

## Estimated Timeline

| Phase | What | Est. Time |
|-------|------|-----------|
| 1 | TDEE fix + client data link | 2-3 hours |
| 2 | Meal plan generator with options | 4-6 hours |
| 3 | Manual meal input + food search | 3-4 hours |
| 4 | Daily/weekly tracking + water | 3-4 hours |
| 5 | AI meal analysis (keyword parser) | 2-3 hours |
| 6 | Integration + Supabase persistence | 2-3 hours |
| | **Total** | **16-23 hours** |

---

*Phase 9 of AzFIT Integration Plan*
*Nutrition & Meal Planner — Exclusive to this Kimi Code instance*
