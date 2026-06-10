/**
 * Nutrition API Service Layer
 *
 * Dual-mode: Supabase when configured, localStorage fallback.
 * Follows the same pattern as workoutApi.ts
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { DailyMealPlan } from '../components/nutrition/mealPlanGenerator'
import type { DailyLog } from '../components/nutrition/DailyNutritionLog'

// ── Types for DB ───────────────────────────────────────────────────

export interface NutritionPlanDB {
  id?: string
  client_id: string
  date: string
  target_calories: number
  target_protein: number
  target_carbs: number
  target_fat: number
  meals: NutritionMealDB[]
  created_at?: string
}

export interface NutritionMealDB {
  type: string
  time: string
  target_calories: number
  primary_option: NutritionOptionDB
  alternative_options: NutritionOptionDB[]
}

export interface NutritionOptionDB {
  name: string
  foods: { food_id: number; food_name: string; quantity: number }[]
  calories: number
  protein: number
  carbs: number
  fats: number
  prep_time: number
}

export interface MealLogDB {
  id?: string
  client_id: string
  date: string
  meal_type: string
  status: string
  option_name: string
  foods: { food_id: number; food_name: string; quantity: number }[]
  actual_calories: number
  actual_protein: number
  actual_carbs: number
  actual_fats: number
  notes?: string
  created_at?: string
}

export interface WaterLogDB {
  id?: string
  client_id: string
  date: string
  glasses_consumed: number
  target_glasses: number
  created_at?: string
}

// ── localStorage Keys ──────────────────────────────────────────────

const LS_NUTRITION_PLANS = 'azfit_nutrition_plans'
const LS_MEAL_LOGS = 'azfit_meal_logs'
const LS_WATER_LOGS = 'azfit_water_logs'

function lsGet<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback }
  catch { return fallback }
}

function lsSet<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ── Converters: App → DB ───────────────────────────────────────────

function planToDB(plan: DailyMealPlan, clientId: string): NutritionPlanDB {
  return {
    client_id: clientId,
    date: plan.date,
    target_calories: plan.targetCalories,
    target_protein: plan.targetProtein,
    target_carbs: plan.targetCarbs,
    target_fat: plan.targetFat,
    meals: plan.meals.map((m) => ({
      type: m.type,
      time: m.time,
      target_calories: m.targetCalories,
      primary_option: optionToDB(m.primary),
      alternative_options: m.alternatives.map(optionToDB),
    })),
  }
}

function optionToDB(opt: DailyMealPlan['meals'][0]['primary']): NutritionOptionDB {
  return {
    name: opt.name,
    foods: opt.foods.map((f) => ({
      food_id: f.food.id,
      food_name: f.food.name,
      quantity: f.quantity,
    })),
    calories: opt.calories,
    protein: opt.protein,
    carbs: opt.carbs,
    fats: opt.fats,
    prep_time: opt.prepTime,
  }
}

function dbToPlan(db: NutritionPlanDB): DailyMealPlan {
  // Simplified: we can't fully reconstruct FoodItem from DB without the full DB
  // In production, we'd join with foods table. For now, store enough info.
  return {
    date: db.date,
    targetCalories: db.target_calories,
    targetProtein: db.target_protein,
    targetCarbs: db.target_carbs,
    targetFat: db.target_fat,
    meals: db.meals.map((m) => ({
      type: m.type as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks',
      time: m.time,
      targetCalories: m.target_calories,
      targetProtein: 0,
      targetCarbs: 0,
      targetFat: 0,
      primary: dbToOption(m.primary_option),
      alternatives: m.alternative_options.map(dbToOption),
    })),
  }
}

function dbToOption(db: NutritionOptionDB): DailyMealPlan['meals'][0]['primary'] {
  return {
    id: `db_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: db.name,
    foods: db.foods.map((f) => ({
      food: {
        id: f.food_id,
        name: f.food_name,
        category: 'Protein' as const,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        serving: '100g',
      },
      quantity: f.quantity,
    })),
    calories: db.calories,
    protein: db.protein,
    carbs: db.carbs,
    fats: db.fats,
    prepTime: db.prep_time,
  }
}

// ── API: Save Nutrition Plan ───────────────────────────────────────

export async function saveNutritionPlan(plan: DailyMealPlan, clientId: string): Promise<void> {
  const dbPlan = planToDB(plan, clientId)

  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('nutrition_plans')
      .upsert(dbPlan, { onConflict: 'client_id,date' })
    if (error) throw error
    return
  }

  // Offline: localStorage
  const plans = lsGet<NutritionPlanDB[]>(LS_NUTRITION_PLANS, [])
  const filtered = plans.filter((p) => !(p.client_id === clientId && p.date === plan.date))
  filtered.push(dbPlan)
  lsSet(LS_NUTRITION_PLANS, filtered)
}

// ── API: Get Nutrition Plan ────────────────────────────────────────

export async function getNutritionPlan(clientId: string, date: string): Promise<DailyMealPlan | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('client_id', clientId)
      .eq('date', date)
      .single()
    if (error || !data) return null
    return dbToPlan(data as NutritionPlanDB)
  }

  // Offline
  const plans = lsGet<NutritionPlanDB[]>(LS_NUTRITION_PLANS, [])
  const found = plans.find((p) => p.client_id === clientId && p.date === date)
  return found ? dbToPlan(found) : null
}

// ── API: Save Meal Log ─────────────────────────────────────────────

export async function saveMealLog(log: DailyLog, clientId: string): Promise<void> {
  const entries: MealLogDB[] = log.logged.map((m) => ({
    client_id: clientId,
    date: log.date,
    meal_type: m.mealType,
    status: m.status,
    option_name: m.option.name,
    foods: m.option.foods.map((f) => ({
      food_id: f.food.id,
      food_name: f.food.name,
      quantity: f.quantity,
    })),
    actual_calories: m.option.calories,
    actual_protein: m.option.protein,
    actual_carbs: m.option.carbs,
    actual_fats: m.option.fats,
    notes: m.note,
  }))

  if (isSupabaseConfigured) {
    // Delete old entries for this date, then insert new
    await supabase.from('meal_logs').delete().eq('client_id', clientId).eq('date', log.date)
    if (entries.length > 0) {
      const { error } = await supabase.from('meal_logs').insert(entries)
      if (error) throw error
    }
    // Save water
    await supabase.from('water_logs').upsert({
      client_id: clientId,
      date: log.date,
      glasses_consumed: log.waterGlasses,
      target_glasses: log.waterTarget,
    }, { onConflict: 'client_id,date' })
    return
  }

  // Offline
  const logs = lsGet<MealLogDB[]>(LS_MEAL_LOGS, [])
  const filtered = logs.filter((l) => !(l.client_id === clientId && l.date === log.date))
  filtered.push(...entries)
  lsSet(LS_MEAL_LOGS, filtered)

  // Water
  const waterLogs = lsGet<WaterLogDB[]>(LS_WATER_LOGS, [])
  const waterFiltered = waterLogs.filter((w) => !(w.client_id === clientId && w.date === log.date))
  waterFiltered.push({
    client_id: clientId,
    date: log.date,
    glasses_consumed: log.waterGlasses,
    target_glasses: log.waterTarget,
  })
  lsSet(LS_WATER_LOGS, waterFiltered)
}

// ── API: Get Meal Logs for Date Range ──────────────────────────────

export async function getMealLogs(clientId: string, startDate: string, endDate: string): Promise<DailyLog[]> {
  if (isSupabaseConfigured) {
    const { data: logs, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('client_id', clientId)
      .gte('date', startDate)
      .lte('date', endDate)
    if (error) throw error

    const { data: waterData } = await supabase
      .from('water_logs')
      .select('*')
      .eq('client_id', clientId)
      .gte('date', startDate)
      .lte('date', endDate)

    // Group by date
    const byDate = new Map<string, DailyLog>()
    for (const log of logs || []) {
      const entry: DailyLog = byDate.get(log.date) || {
        date: log.date,
        planned: null,
        logged: [],
        waterGlasses: 0,
        waterTarget: 8,
      }
      entry.logged.push({
        mealType: log.meal_type,
        status: log.status as 'planned' | 'eaten' | 'swapped' | 'missed' | 'custom',
        option: {
          id: `db_${log.id}`,
          name: log.option_name,
          foods: log.foods.map((f: { food_id: number; food_name: string; quantity: number }) => ({
            food: {
              id: f.food_id,
              name: f.food_name,
              category: 'Protein' as const,
              calories: 0, protein: 0, carbs: 0, fats: 0, serving: '100g',
            },
            quantity: f.quantity,
          })),
          calories: log.actual_calories,
          protein: log.actual_protein,
          carbs: log.actual_carbs,
          fats: log.actual_fats,
          prepTime: 0,
        },
        note: log.notes,
      })
      byDate.set(log.date, entry)
    }

    for (const w of waterData || []) {
      const entry = byDate.get(w.date)
      if (entry) {
        entry.waterGlasses = w.glasses_consumed
        entry.waterTarget = w.target_glasses
      }
    }

    return Array.from(byDate.values())
  }

  // Offline
  const logs = lsGet<MealLogDB[]>(LS_MEAL_LOGS, [])
  const waterLogs = lsGet<WaterLogDB[]>(LS_WATER_LOGS, [])

  const byDate = new Map<string, DailyLog>()
  for (const log of logs.filter((l) => l.client_id === clientId && l.date >= startDate && l.date <= endDate)) {
    const entry = byDate.get(log.date) || {
      date: log.date,
      planned: null,
      logged: [],
      waterGlasses: 0,
      waterTarget: 8,
    }
    entry.logged.push({
      mealType: log.meal_type,
      status: log.status as DailyLog['logged'][0]['status'],
      option: {
        id: `db_${log.id}`,
        name: log.option_name,
        foods: log.foods.map((f) => ({
          food: {
            id: f.food_id,
            name: f.food_name,
            category: 'Protein' as const,
            calories: 0, protein: 0, carbs: 0, fats: 0, serving: '100g',
          },
          quantity: f.quantity,
        })),
        calories: log.actual_calories,
        protein: log.actual_protein,
        carbs: log.actual_carbs,
        fats: log.actual_fats,
        prepTime: 0,
      },
      note: log.notes,
    })
    byDate.set(log.date, entry)
  }

  for (const w of waterLogs.filter((w) => w.client_id === clientId && w.date >= startDate && w.date <= endDate)) {
    const entry = byDate.get(w.date)
    if (entry) {
      entry.waterGlasses = w.glasses_consumed
      entry.waterTarget = w.target_glasses
    } else {
      byDate.set(w.date, {
        date: w.date,
        planned: null,
        logged: [],
        waterGlasses: w.glasses_consumed,
        waterTarget: w.target_glasses,
      })
    }
  }

  return Array.from(byDate.values())
}
