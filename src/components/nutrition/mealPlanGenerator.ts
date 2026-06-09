import type { FoodItem } from './types'

export interface MealOption {
  id: string
  name: string
  foods: { food: FoodItem; quantity: number }[]
  calories: number
  protein: number
  carbs: number
  fats: number
  prepTime: number // minutes
}

export interface MealPlanItem {
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
  time: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  primary: MealOption
  alternatives: MealOption[]
}

export interface DailyMealPlan {
  date: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  meals: MealPlanItem[]
}

/* ─── Meal calorie distribution ─── */
const MEAL_DISTRIBUTION = {
  Breakfast: 0.25,
  Lunch: 0.30,
  Dinner: 0.30,
  Snacks: 0.15,
} as const

const MEAL_TIMES = {
  Breakfast: '7:00 AM',
  Lunch: '12:30 PM',
  Dinner: '7:00 PM',
  Snacks: '3:00 PM',
} as const

/* ─── Macro focus per meal type ─── */
const MEAL_MACRO_FOCUS: Record<string, { proteinBias: number; carbBias: number; fatBias: number }> = {
  Breakfast: { proteinBias: 1.1, carbBias: 1.2, fatBias: 0.8 },
  Lunch: { proteinBias: 1.0, carbBias: 1.0, fatBias: 1.0 },
  Dinner: { proteinBias: 1.1, carbBias: 0.7, fatBias: 1.1 },
  Snacks: { proteinBias: 0.8, carbBias: 0.9, fatBias: 1.2 },
}

/* ─── Score a food for a meal's macro target ─── */
function scoreFoodForMeal(
  food: FoodItem,
  targetCals: number,
  targetP: number,
  targetC: number,
  targetF: number,
  focus: { proteinBias: number; carbBias: number; fatBias: number }
): number {
  // Normalize per 100g
  const cals = food.calories
  const p = food.protein
  const c = food.carbs
  const f = food.fats

  if (cals === 0) return 0

  // How well does this food match the per-calorie macro ratio?
  const calRatio = cals / targetCals // e.g. 0.3 means 30% of meal cals in 100g
  const pRatio = p / targetP
  const cRatio = c / targetC
  const fRatio = f / targetF

  // Prefer foods that contribute meaningfully but not overwhelmingly
  const portionScore = calRatio > 0.05 && calRatio < 0.6 ? 1 : 0.3

  // Match macro focus
  const macroScore =
    (pRatio * focus.proteinBias) +
    (cRatio * focus.carbBias) +
    (fRatio * focus.fatBias)

  // Penalty for beverages as main meal items
  const categoryPenalty = food.category === 'Beverages' ? 0.1 : 1

  return portionScore * macroScore * categoryPenalty
}

/* ─── Build a meal option from 2-4 foods ─── */
function buildMealOption(
  foods: FoodItem[],
  mealType: string,
  targetCals: number,
  targetP: number,
  targetC: number,
  targetF: number,
  seedOffset: number
): MealOption {
  const focus = MEAL_MACRO_FOCUS[mealType] || { proteinBias: 1, carbBias: 1, fatBias: 1 }

  // Score and rank all foods for this meal
  const scored = foods
    .map((f, i) => ({
      food: f,
      score: scoreFoodForMeal(f, targetCals, targetP, targetC, targetF, focus),
      idx: i,
    }))
    .sort((a, b) => b.score - a.score)

  // Pick top foods with variety (different categories)
  const picked: { food: FoodItem; quantity: number }[] = []
  const usedCategories = new Set<string>()
  let remainingCals = targetCals
  let remainingP = targetP
  let remainingC = targetC
  let remainingF = targetF

  // Seed-based deterministic selection
  const startIdx = (seedOffset * 7) % Math.min(scored.length, 30)
  const pool = scored.slice(startIdx, startIdx + 40)

  for (const item of pool) {
    if (picked.length >= 4) break
    if (remainingCals < 50) break

    const f = item.food
    // Skip if we already have this category (unless it's protein and we need more)
    if (usedCategories.has(f.category) && f.category !== 'Protein') continue

    // Calculate ideal quantity to hit remaining targets
    const calRatio = f.calories / 100
    const pRatio = f.protein / 100

    // Target: contribute ~25-50% of remaining calories
    let qty = Math.round((remainingCals * (0.25 + Math.random() * 0.25)) / calRatio)
    qty = Math.max(30, Math.min(qty, 300)) // Clamp 30-300g

    // For protein sources, prioritize hitting protein target
    if (f.category === 'Protein' && remainingP > 10) {
      const proteinQty = Math.round((remainingP * 0.5) / pRatio)
      qty = Math.max(qty, Math.min(proteinQty, 250))
    }

    const cals = (f.calories * qty) / 100
    if (cals > remainingCals * 0.7 && picked.length > 0) {
      // Too big, reduce
      qty = Math.round((remainingCals * 0.4) / calRatio)
    }

    picked.push({ food: f, quantity: qty })
    usedCategories.add(f.category)
    remainingCals -= (f.calories * qty) / 100
    remainingP -= (f.protein * qty) / 100
    remainingC -= (f.carbs * qty) / 100
    remainingF -= (f.fats * qty) / 100
  }

  // Calculate totals
  const totals = picked.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.food.calories * item.quantity) / 100,
      protein: acc.protein + (item.food.protein * item.quantity) / 100,
      carbs: acc.carbs + (item.food.carbs * item.quantity) / 100,
      fats: acc.fats + (item.food.fats * item.quantity) / 100,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  )

  // Build name from foods
  const mainFood = picked[0]?.food.name ?? 'Custom Meal'
  const name = picked.length <= 2
    ? mainFood
    : `${mainFood} + ${picked.length - 1} items`

  return {
    id: `opt_${mealType}_${seedOffset}`,
    name,
    foods: picked,
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fats: Math.round(totals.fats),
    prepTime: 10 + picked.length * 8,
  }
}

/* ─── Generate alternatives for a meal ─── */
function generateAlternatives(
  foods: FoodItem[],
  mealType: string,
  targetCals: number,
  targetP: number,
  targetC: number,
  targetF: number,
  count: number
): MealOption[] {
  const alts: MealOption[] = []
  for (let i = 1; i <= count; i++) {
    alts.push(buildMealOption(foods, mealType, targetCals, targetP, targetC, targetF, i * 3))
  }
  return alts
}

/* ─── Main generator ─── */
export function generateMealPlan(
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number,
  foods: FoodItem[],
  date: Date = new Date()
): DailyMealPlan {
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const

  const meals: MealPlanItem[] = mealTypes.map((type) => {
    const dist = MEAL_DISTRIBUTION[type]
    const mCals = Math.round(targetCalories * dist)
    const mProtein = Math.round(targetProtein * dist)
    const mCarbs = Math.round(targetCarbs * dist)
    const mFat = Math.round(targetFat * dist)

    const primary = buildMealOption(foods, type, mCals, mProtein, mCarbs, mFat, 0)
    const alternatives = generateAlternatives(foods, type, mCals, mProtein, mCarbs, mFat, 3)

    return {
      type,
      time: MEAL_TIMES[type],
      targetCalories: mCals,
      targetProtein: mProtein,
      targetCarbs: mCarbs,
      targetFat: mFat,
      primary,
      alternatives,
    }
  })

  return {
    date: date.toISOString().split('T')[0],
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    meals,
  }
}

/* ─── Swap a meal's primary option ─── */
export function swapMealOption(
  plan: DailyMealPlan,
  mealType: string,
  alternativeId: string
): DailyMealPlan {
  return {
    ...plan,
    meals: plan.meals.map((m) => {
      if (m.type !== mealType) return m
      const alt = m.alternatives.find((a) => a.id === alternativeId)
      if (!alt) return m
      return {
        ...m,
        primary: alt,
        alternatives: [
          m.primary,
          ...m.alternatives.filter((a) => a.id !== alternativeId),
        ].slice(0, 3),
      }
    }),
  }
}

/* ─── Calculate plan totals from primaries ─── */
export function calculatePlanTotals(plan: DailyMealPlan) {
  return plan.meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.primary.calories,
      protein: acc.protein + m.primary.protein,
      carbs: acc.carbs + m.primary.carbs,
      fats: acc.fats + m.primary.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  )
}
