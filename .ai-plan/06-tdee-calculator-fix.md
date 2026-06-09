# Kimi Code — TDEE Calculator Fix & Enhancement

> **Mission:** Fix the diet preset bug (fat percentage stuck), verify all formulas match industry standards (tdeecalculator.net, calculator.net, tdee.is), and add Katch-McArdle formula support.
>
> **Do this in 3 phases. ONE phase at a time.**

---

## Current State Analysis

The TDEE calculator at `src/pages/NutritionPage.tsx` has:
- ✅ **Mifflin-St Jeor BMR formula** — CORRECT (matches all 3 reference sites)
- ✅ **Activity multipliers** — CORRECT (1.2, 1.375, 1.55, 1.725, 1.9)
- ✅ **TDEE = BMR × Activity** — CORRECT
- ⚠️ **Diet preset switching** — BUG: Fat percentage gets stuck when switching presets
- ❌ **Katch-McArdle formula** — Missing (needs body fat % input)
- ❌ **Body fat % input field** — Missing
- ❌ **Macro percentage display** — Shows calculated %, not preset %

---

## VERIFIED CORRECT FORMULAS (from tdeecalculator.net, calculator.net, tdee.is)

### BMR — Mifflin-St Jeor (default, most accurate for general population)

```typescript
// Male:
BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5

// Female:
BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
```

### BMR — Katch-McArdle (more accurate when body fat % is known)

```typescript
LBM = weight_kg × (1 − body_fat_percentage)
BMR = 370 + (21.6 × LBM_kg)
```

### Activity Multipliers

| Level | Multiplier | Description |
|-------|-----------|-------------|
| Sedentary | 1.2 | Little or no exercise |
| Lightly Active | 1.375 | Light exercise 1-3 days/week |
| Moderately Active | 1.55 | Moderate exercise 3-5 days/week |
| Very Active | 1.725 | Hard exercise 6-7 days/week |
| Extra Active | 1.9 | Very hard exercise, physical job, or 2× training |

### TDEE

```typescript
TDEE = Math.round(BMR × activityMultiplier)
```

### Goal Adjustments

| Goal | Adjustment | Result |
|------|-----------|--------|
| Maintain | 0 | TDEE as-is |
| Lose Weight | −500 kcal | ~0.5kg/week fat loss |
| Gain Muscle | +300 kcal | ~0.25kg/week lean gain |

### Macro Presets (grams per kg of bodyweight where applicable)

| Preset | Protein | Carbs | Fat | Description |
|--------|---------|-------|-----|-------------|
| Balanced | 2.0g/kg | Remainder | 0.9g/kg | Even distribution |
| Low Carb | 2.2g/kg | 1.0g/kg | 1.1g/kg | Keto-style, higher fat |
| High Carb | 1.8g/kg | Remainder | 0.5g/kg | Endurance athletes |
| High Protein | 2.5g/kg | Remainder | 0.7g/kg | Muscle building |

**Macro calculation priority:**
1. Calculate protein grams first (from g/kg target)
2. Calculate fat grams second (from g/kg target)
3. Calculate carbs as remainder: `(targetCalories − proteinCalories − fatCalories) / 4`

This ensures protein and fat minimums are hit before filling remaining calories with carbs.

---

## PHASE 1: Fix Diet Preset Switching Bug

### The Bug

When the user clicks "Low Carb" preset, fat shows 50% (correct). But when they switch back to "Balanced" or "High Protein", the fat percentage stays stuck at 50% instead of updating to 35% or 30%.

### Root Cause

The `calcMacros` function (line ~240) uses a protein floor (`Math.max(weight * 1.6, ...)`) that can throw off the percentage calculations. Also, the carb calculation uses the REMAINDER approach which can cause percentage drift.

### Fix

Replace the `calcMacros` function and `DIET_PRESETS` with this approach:

```typescript
// Macro targets in g/kg of body weight
const MACRO_TARGETS: Record<DietPreset, { proteinPerKg: number; fatPerKg: number; carbMin?: number }> = {
  balanced:     { proteinPerKg: 2.0, fatPerKg: 0.9 },
  'low-carb':   { proteinPerKg: 2.2, fatPerKg: 1.1, carbMin: 1.0 },
  'high-carb':  { proteinPerKg: 1.8, fatPerKg: 0.5 },
  'high-protein': { proteinPerKg: 2.5, fatPerKg: 0.7 },
}

function calcMacros(targetCalories: number, weight: number, preset: DietPreset) {
  const t = MACRO_TARGETS[preset]
  
  // Step 1: Protein calories (highest priority)
  const proteinGrams = Math.round(t.proteinPerKg * weight)
  const proteinCalories = proteinGrams * 4
  
  // Step 2: Fat calories (second priority)
  const fatGrams = Math.round(t.fatPerKg * weight)
  const fatCalories = fatGrams * 9
  
  // Step 3: Carb calories (fill the remainder)
  const remainingCalories = targetCalories - proteinCalories - fatCalories
  let carbGrams = Math.round(remainingCalories / 4)
  
  // Enforce carb minimum for low-carb (not below 1g/kg)
  if (t.carbMin && carbGrams < Math.round(t.carbMin * weight)) {
    carbGrams = Math.round(t.carbMin * weight)
  }
  
  // Ensure we don't go negative
  if (carbGrams < 0) carbGrams = 0
  
  return { proteinGrams, carbGrams, fatGrams }
}
```

### UI Fix for Percentage Display

The percentage display (lines ~1350-1362) should show the **actual calculated percentages** from the gram values, rounded:

```typescript
const proteinPct = Math.round((proteinTarget * 4 / targetCalories) * 100)
const carbPct = Math.round((carbTarget * 4 / targetCalories) * 100)
const fatPct = Math.round((fatTarget * 9 / targetCalories) * 100)
```

Add a check to ensure percentages sum to ~100% (within rounding error).

### Files to Modify
- `src/pages/NutritionPage.tsx`
  - Replace `DIET_PRESETS` constant
  - Replace `calcMacros` function
  - Fix percentage display in JSX

### Acceptance Criteria
- [ ] Clicking "Balanced" shows ~30% protein / ~35% carbs / ~35% fat
- [ ] Clicking "Low Carb" shows ~35% protein / ~15% carbs / ~50% fat
- [ ] Clicking "High Carb" shows ~25% protein / ~55% carbs / ~20% fat
- [ ] Clicking "High Protein" shows ~40% protein / ~30% carbs / ~30% fat
- [ ] Percentages update IMMEDIATELY when preset is clicked
- [ ] No preset shows fat stuck at 50% when it shouldn't be
- [ ] Build passes

**STOP HERE. Tell me when Phase 1 is done. I'll approve Phase 2.**

---

## PHASE 2: Add Katch-McArdle Formula + Body Fat % Input

### What to Add

1. **Body Fat % input field** — next to the weight/height inputs
2. **Formula toggle** — "Mifflin-St Jeor" (default) vs "Katch-McArdle" 
3. **Auto-switch**: When body fat % is entered (>0), automatically use Katch-McArdle
4. **BMR display**: Show which formula is being used

### Katch-McArdle Implementation

```typescript
// Add to state:
const [bodyFatPct, setBodyFatPct] = useState(0) // 0 = not set
const [useKatchMcArdle, setUseKatchMcArdle] = useState(false)

// In BMR calculation:
const bmr = useMemo(() => {
  if (useKatchMcArdle && bodyFatPct > 0) {
    // Katch-McArdle: 370 + (21.6 × LBM)
    const lbm = weight * (1 - bodyFatPct / 100)
    return 370 + (21.6 * lbm)
  }
  // Mifflin-St Jeor (default)
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}, [gender, age, weight, height, bodyFatPct, useKatchMcArdle])
```

### UI Changes

Add after the Height input:
```
┌─────────────────────────────────┐
│ Body Fat %    [____] %          │
│         optional — enables      │
│         Katch-McArdle formula   │
└─────────────────────────────────┘
```

Add formula indicator in TDEE display:
```
BMR: 1,774 kcal (Mifflin-St Jeor)
     — or —
BMR: 1,820 kcal (Katch-McArdle)
```

### Files to Modify
- `src/pages/NutritionPage.tsx`
  - Add `bodyFatPct` and `useKatchMcArdle` to state
  - Add body fat % input field in the form grid
  - Update BMR `useMemo` to support both formulas
  - Update formula display text
  - Add formula toggle button

### Acceptance Criteria
- [ ] Body Fat % input field visible in TDEE calculator
- [ ] When body fat = 0, uses Mifflin-St Jeor (default)
- [ ] When body fat > 0 entered, BMR recalculates using Katch-McArdle
- [ ] TDEE updates accordingly when formula changes
- [ ] Formula name shown in BMR display line
- [ ] Build passes

**STOP HERE. Tell me when Phase 2 is done. I'll approve Phase 3.**

---

## PHASE 3: Verify & Polish

### Verification Checklist

Test these scenarios and confirm results match tdeecalculator.net:

**Test 1: Male, 30, 78.5kg, 183cm, Moderately Active, Maintain**
- Expected BMR: ~1,774 kcal
- Expected TDEE: ~2,749 kcal
- Balanced: ~157g P / ~240g C / ~78g F

**Test 2: Same as Test 1 but with 15% body fat (Katch-McArdle)**
- Expected BMR: ~370 + 21.6 × (78.5 × 0.85) = ~1,811 kcal
- Expected TDEE: ~2,807 kcal

**Test 3: Female, 28, 60kg, 165cm, Lightly Active, Lose Weight**
- Expected BMR: (10×60) + (6.25×165) − (5×28) − 161 = ~1,370 kcal
- Expected TDEE: ~1,884 kcal
- Target: ~1,384 kcal ( Lose: −500)

**Test 4: Diet preset switching**
- Balanced → Low Carb → High Carb → High Protein
- Each switch updates macros within 1 second
- No preset gets stuck

### Polish Items

1. **Round displayed calories** to nearest whole number
2. **Show macro split as**: "30% Protein / 35% Carbs / 35% Fat" in one line
3. **Add "Reset" button** to clear body fat % and revert to Mifflin-St Jeor
4. **Formula reference tooltip**: Hover over BMR shows the formula used

### Files to Modify
- `src/pages/NutritionPage.tsx` — polish items

### Acceptance Criteria
- [ ] All 4 test scenarios produce correct results
- [ ] Diet presets switch immediately with no stuck values
- [ ] Body fat % input works and triggers Katch-McArdle
- [ ] Build passes
- [ ] Deploy and verify on https://azfit.fit/#/nutrition

---

## Golden Rules

1. **ONE phase at a time** — Do NOT start Phase N until Phase N-1 is approved
2. **Run `npm run build` after EVERY phase** — zero errors
3. **Use the verified formulas above** — they match tdeecalculator.net, calculator.net, and tdee.is
4. **Test the preset switching** — click each preset and verify percentages change
5. **Tell me what you did** — Summary of changes after each phase

---

*Phase 6 of AzFIT Integration Plan*
*TDEE Calculator Fix & Enhancement*
