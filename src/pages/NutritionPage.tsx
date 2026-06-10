import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Utensils, Search, Droplets, Pill, Info, Save, User, Sparkles, ClipboardList, BarChart3, Brain,
} from 'lucide-react'
import { useAppDataStore } from '../stores/useAppDataStore'
import { useClientById, useLatestBodyStats, useLatestProgressEntry, useClientProgramGoal } from '../stores/useAppDataStore.selectors'
import { useNutritionPlan, useSaveNutritionPlan } from '../hooks/useNutritionPlan'
import { useMealLogs, useSaveMealLog } from '../hooks/useMealLog'
import type { NutritionEntry } from '../types/entities'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MacroRing, MealPlannerTab, MealPlanDisplay, DailyNutritionLog, WeeklyNutritionSummary,
  AiMealAnalysis,
  FoodDatabaseTab, WaterTrackerTab, SupplementsTab,
  type Gender, type ActivityLevel, type Goal, type DietPreset, type MealType, type MealEntry,
  ACTIVITY_MULTIPLIERS, GOAL_LABELS, MACRO_TARGETS, calcMacros, FOOD_DB,
  generateMealPlan, type DailyMealPlan,
} from '@/components/nutrition'
import type { DailyLog } from '@/components/nutrition/DailyNutritionLog'

/* ═══════════════════════════════════════════
   MAIN NUTRITION PAGE
   Accepts optional :clientId param to auto-fill
   from client profile data.
   ═══════════════════════════════════════════ */
export default function NutritionPage() {
  const { clientId } = useParams<{ clientId?: string }>()
  const { addNutritionEntry } = useAppDataStore()

  // ── Client data selectors (auto-fill when clientId present) ──
  const client = useClientById(clientId ?? null)
  const latestBodyStats = useLatestBodyStats(clientId ?? null)
  const latestProgress = useLatestProgressEntry(clientId ?? null)
  const clientProgramGoal = useClientProgramGoal(clientId ?? null)

  // Helper: map client goal string → Nutrition Goal type
  function deriveGoal(clientGoal?: string): Goal {
    if (!clientGoal) return 'maintain'
    const g = clientGoal.toLowerCase()
    if (g.includes('lose') || g.includes('fat') || g.includes('cut') || g.includes('deficit')) return 'lose'
    if (g.includes('gain') || g.includes('bulk') || g.includes('muscle') || g.includes('surplus')) return 'gain'
    return 'maintain'
  }

  // Helper: derive gender from client data (fallback to male)
  // Note: Client entity doesn't have sex field; use goal context or default
  function deriveGender(_client?: typeof client): Gender {
    // Default to male; could be enhanced when sex field is added to Client
    return 'male'
  }

  const [gender, setGender] = useState<Gender>('male')
  const [age, setAge] = useState(32)
  const [weight, setWeight] = useState(78.5)
  const [height, setHeight] = useState(183)
  const [bodyFatPct, setBodyFatPct] = useState(0)
  const [activity, setActivity] = useState<ActivityLevel>('moderate')
  const [goal, setGoal] = useState<Goal>('maintain')
  const [dietPreset, setDietPreset] = useState<DietPreset>('balanced')

  // Auto-fill from client profile when clientId is present
  useEffect(() => {
    if (!client) return
    setGender(deriveGender(client))
    setAge(client.age || 32)
    setWeight(latestBodyStats?.weight ?? latestProgress?.weight ?? client.weight ?? 78.5)
    setHeight(client.height ?? 183)
    setBodyFatPct(latestBodyStats?.bodyFatPercent ?? latestProgress?.bodyFat ?? client.bodyFat ?? 0)
    setGoal(deriveGoal(clientProgramGoal ?? client.goal))
  }, [client, latestBodyStats, latestProgress, clientProgramGoal])
  // ── Generated Meal Plan State ──
  const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null)
  const [mealPlanDate, setMealPlanDate] = useState(new Date())

  // ── Supabase hooks (when clientId present) ──
  const planDateStr = mealPlanDate.toISOString().split('T')[0]
  const { data: savedPlan } = useNutritionPlan(clientId, planDateStr)
  const savePlanMutation = useSaveNutritionPlan()

  // Load saved plan from Supabase when available
  useEffect(() => {
    if (savedPlan && clientId) {
      setMealPlan(savedPlan)
    }
  }, [savedPlan, clientId])

  // Auto-save plan to Supabase when it changes
  useEffect(() => {
    if (mealPlan && clientId) {
      const timeout = setTimeout(() => {
        savePlanMutation.mutate({ plan: mealPlan, clientId })
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [mealPlan, clientId])

  const [mealDate, setMealDate] = useState(new Date())
  const [meals, setMeals] = useState<MealEntry[]>([
    { id: 'm1', foodId: 1, quantity: 80, mealType: 'Breakfast' },
    { id: 'm2', foodId: 5, quantity: 120, mealType: 'Breakfast' },
    { id: 'm3', foodId: 86, quantity: 250, mealType: 'Breakfast' },
    { id: 'm4', foodId: 1, quantity: 150, mealType: 'Lunch' },
    { id: 'm5', foodId: 15, quantity: 150, mealType: 'Lunch' },
    { id: 'm6', foodId: 31, quantity: 200, mealType: 'Lunch' },
    { id: 'm7', foodId: 2, quantity: 150, mealType: 'Dinner' },
    { id: 'm8', foodId: 17, quantity: 200, mealType: 'Dinner' },
    { id: 'm9', foodId: 30, quantity: 150, mealType: 'Dinner' },
    { id: 'm10', foodId: 47, quantity: 200, mealType: 'Snacks' },
    { id: 'm11', foodId: 55, quantity: 100, mealType: 'Snacks' },
    { id: 'm12', foodId: 39, quantity: 30, mealType: 'Snacks' },
  ])

  /* ─── BMR Calculation (Mifflin-St Jeor OR Katch-McArdle) ─── */
  const useKatchMcArdle = bodyFatPct > 0

  const bmr = useMemo(() => {
    if (useKatchMcArdle) {
      // Katch-McArdle: 370 + (21.6 × LBM)
      const lbm = weight * (1 - bodyFatPct / 100)
      return 370 + (21.6 * lbm)
    }
    // Mifflin-St Jeor: 10*weight + 6.25*height - 5*age + 5 (male) / -161 (female)
    const base = 10 * weight + 6.25 * height - 5 * age
    return gender === 'male' ? base + 5 : base - 161
  }, [gender, age, weight, height, bodyFatPct, useKatchMcArdle])

  const tdee = useMemo(() => {
    return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity].value)
  }, [bmr, activity])

  const targetCalories = useMemo(() => {
    return tdee + GOAL_LABELS[goal].adjustment
  }, [tdee, goal])

  // Macro targets based on selected diet preset
  const { proteinGrams: proteinTarget, carbGrams: carbTarget, fatGrams: fatTarget } = calcMacros(targetCalories, weight, dietPreset)

  // Generate meal plan when targets change
  useEffect(() => {
    const { proteinGrams, carbGrams, fatGrams } = calcMacros(targetCalories, weight, dietPreset)
    const plan = generateMealPlan(targetCalories, proteinGrams, carbGrams, fatGrams, FOOD_DB, mealPlanDate)
    setMealPlan(plan)
  }, [targetCalories, weight, dietPreset, mealPlanDate])

  // ── Daily Nutrition Log State ──
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('azfit_nutrition_logs') || '[]')
    } catch { return [] }
  })

  // Load weekly logs from Supabase
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: weeklyLogsFromDb } = useMealLogs(clientId, weekAgoStr, todayStr)

  // Merge Supabase logs with local logs
  const mergedLogs = useMemo(() => {
    if (!weeklyLogsFromDb || weeklyLogsFromDb.length === 0) return dailyLogs
    const dbDates = new Set(weeklyLogsFromDb.map((l) => l.date))
    const localOnly = dailyLogs.filter((l) => !dbDates.has(l.date))
    return [...weeklyLogsFromDb, ...localOnly]
  }, [weeklyLogsFromDb, dailyLogs])

  const todayLog = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return dailyLogs.find((l) => l.date === today) ?? {
      date: today,
      planned: mealPlan,
      logged: [],
      waterGlasses: 0,
      waterTarget: 8,
    }
  }, [dailyLogs, mealPlan])

  const saveLogMutation = useSaveMealLog()

  const updateTodayLog = useCallback((log: DailyLog) => {
    setDailyLogs((prev) => {
      const filtered = prev.filter((l) => l.date !== log.date)
      const updated = [...filtered, log]
      localStorage.setItem('azfit_nutrition_logs', JSON.stringify(updated))
      return updated
    })
    // Also save to Supabase if clientId is present
    if (clientId) {
      saveLogMutation.mutate({ log, clientId })
    }
  }, [clientId, saveLogMutation])

  const handleAddFood = useCallback((mealType: MealType, foodId: number, qty: number) => {
    setMeals((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, foodId, quantity: qty, mealType },
    ])
  }, [])

  const handleRemoveFood = useCallback((entryId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== entryId))
  }, [])

  // Macro calorie distribution percentages (must sum to ~100%)
  // Protein and fat grams are fixed (g/kg), carbs fill the remainder
  // When calories change (goal switch), percentages adjust:
  // - Lose Weight (lower cals): protein% ↑, fat% ↑, carb% ↓
  // - Gain Muscle (higher cals): protein% ↓, fat% ↓, carb% ↑
  const proteinCalories = proteinTarget * 4
  const fatCalories = fatTarget * 9
  const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories)
  const adjustedCarbTarget = Math.round(carbCalories / 4)

  const proteinPct = Math.round((proteinCalories / targetCalories) * 100)
  const fatPct = Math.round((fatCalories / targetCalories) * 100)
  const carbPct = Math.round((carbCalories / targetCalories) * 100)

  // Adherence data
  const adherenceData = [
    { day: 'Mon', adherence: 92 },
    { day: 'Tue', adherence: 98 },
    { day: 'Wed', adherence: 85 },
    { day: 'Thu', adherence: 90 },
    { day: 'Fri', adherence: 88 },
    { day: 'Sat', adherence: 62 },
    { day: 'Sun', adherence: 75 },
  ]

  const avgAdherence = Math.round(adherenceData.reduce((s, d) => s + d.adherence, 0) / adherenceData.length)

  const getBarColor = (val: number) => {
    if (val >= 90) return 'success'
    if (val >= 70) return 'warning'
    return 'danger'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* ═══ Client Header (when viewing specific client) ═══ */}
      {client && (
        <div className="bg-az-black-card border border-dark-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cyan/20 flex items-center justify-center">
            <User size={16} className="text-cyan" />
          </div>
          <div>
            <p className="text-dark-primary text-sm font-medium">{client.name}</p>
            <p className="text-dark-muted text-[10px]">
              {client.age} yrs · {Math.round(weight)}kg · {height}cm
              {clientProgramGoal ? ` · Goal: ${clientProgramGoal}` : client.goal ? ` · Goal: ${client.goal}` : ''}
            </p>
          </div>
        </div>
      )}

      {/* ═══ TDEE Summary + Macro Rings ═══ */}
      <div className="bg-az-black-card border border-dark-border rounded-2xl p-6">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* TDEE Calculation Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="xl:w-[45%] space-y-4"
          >
            <h3 className="text-dark-primary font-semibold text-base">Daily Energy Target</h3>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              {/* Gender */}
              <div className="flex items-center gap-1 bg-az-black-elevated rounded-lg p-1 border border-dark-border">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    gender === 'male' ? 'bg-cyan text-white' : 'text-dark-muted hover:text-dark-secondary'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    gender === 'female' ? 'bg-trainer-accent text-white' : 'text-dark-muted hover:text-dark-secondary'
                  }`}
                >
                  Female
                </button>
              </div>
              {/* Age */}
              <div className="flex items-center bg-az-black-elevated rounded-lg border border-dark-border px-3">
                <span className="text-dark-muted text-[10px] mr-2">Age</span>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-transparent text-dark-primary text-xs text-right focus:outline-none"
                  min={10}
                  max={100}
                />
              </div>
              {/* Weight */}
              <div className="flex items-center bg-az-black-elevated rounded-lg border border-dark-border px-3">
                <span className="text-dark-muted text-[10px] mr-2">Weight (kg)</span>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-transparent text-dark-primary text-xs text-right focus:outline-none"
                  min={20}
                  max={300}
                  step={0.1}
                />
              </div>
              {/* Height */}
              <div className="flex items-center bg-az-black-elevated rounded-lg border border-dark-border px-3">
                <span className="text-dark-muted text-[10px] mr-2">Height (cm)</span>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-transparent text-dark-primary text-xs text-right focus:outline-none"
                  min={50}
                  max={300}
                />
              </div>
              {/* Body Fat % */}
              <div className="flex items-center bg-az-black-elevated rounded-lg border border-dark-border px-3 col-span-2">
                <span className="text-dark-muted text-[10px] mr-2">Body Fat %</span>
                <input
                  type="number"
                  value={bodyFatPct || ''}
                  onChange={(e) => setBodyFatPct(Number(e.target.value))}
                  placeholder="optional"
                  className="w-full bg-transparent text-dark-primary text-xs text-right focus:outline-none"
                  min={0}
                  max={60}
                  step={0.1}
                />
                <span className="text-dark-muted text-[10px] ml-1">%</span>
                {bodyFatPct > 0 && (
                  <span className="text-cyan text-[10px] ml-2">Katch-McArdle</span>
                )}
              </div>
            </div>

            {/* Activity Level */}
            <Select value={activity} onValueChange={(v) => setActivity(v as ActivityLevel)}>
              <SelectTrigger className="bg-az-black-elevated border-dark-border text-dark-primary text-xs h-9">
                <SelectValue placeholder="Activity Level" />
              </SelectTrigger>
              <SelectContent className="bg-az-black-elevated border-dark-border">
                {(Object.entries(ACTIVITY_MULTIPLIERS) as [ActivityLevel, { label: string; value: number }][]).map(
                  ([key, { label }]) => (
                    <SelectItem key={key} value={key} className="text-dark-primary">
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            {/* Goal Toggle */}
            <div className="flex items-center gap-1 bg-az-black-elevated rounded-lg p-1 border border-dark-border">
              {(Object.entries(GOAL_LABELS) as [Goal, { label: string; adjustment: number }][]).map(
                ([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => setGoal(key)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                      goal === key
                        ? key === 'lose'
                          ? 'bg-danger text-white'
                          : key === 'gain'
                            ? 'bg-success text-white'
                            : 'bg-cyan text-white'
                        : 'text-dark-muted hover:text-dark-secondary'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            {/* Diet Preset */}
            <div className="space-y-2">
              <p className="text-xs text-dark-muted">Diet Preset</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(MACRO_TARGETS) as [DietPreset, { label: string; desc: string }][]).map(
                  ([key, { label, desc }]) => (
                    <button
                      key={key}
                      onClick={() => setDietPreset(key)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                        dietPreset === key
                          ? 'border-cyan bg-[rgba(0,174,239,0.1)] text-dark-primary'
                          : 'border-dark-border bg-az-black-elevated text-dark-muted hover:text-dark-secondary'
                      }`}
                    >
                      <span className="font-medium block">{label}</span>
                      <span className="text-[10px] opacity-70">{desc}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* TDEE Display */}
            <div className="bg-az-black-elevated rounded-xl p-4 border border-dark-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-cyan text-3xl font-bold font-mono">{targetCalories.toLocaleString()} kcal</span>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-dark-muted text-xs">BMR</span>
                  <span className="text-dark-secondary text-xs font-mono">{Math.round(bmr)} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-muted text-xs">Activity</span>
                  <span className="text-dark-secondary text-xs font-mono">
                    × {ACTIVITY_MULTIPLIERS[activity].value} ({ACTIVITY_MULTIPLIERS[activity].label})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-muted text-xs">TDEE</span>
                  <span className="text-dark-secondary text-xs font-mono">{tdee} kcal</span>
                </div>
                {GOAL_LABELS[goal].adjustment !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-dark-muted text-xs">Goal Adjust</span>
                    <span
                      className={`text-xs font-mono ${
                        GOAL_LABELS[goal].adjustment > 0 ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {GOAL_LABELS[goal].adjustment > 0 ? '+' : ''}
                      {GOAL_LABELS[goal].adjustment} kcal
                    </span>
                  </div>
                )}
              </div>
              {/* Formula */}
              <div className="pt-2 border-t border-dark-border">
                <p className="text-dark-subtle text-[10px] font-mono">
                  {useKatchMcArdle
                    ? `Katch-McArdle: 370 + 21.6 × ${Math.round(weight * (1 - bodyFatPct / 100))}kg LBM = ${Math.round(bmr)} kcal`
                    : `${gender === 'male' ? '10' : '10'} × ${weight}kg + 6.25 × ${height}cm − 5 × ${age} ${gender === 'male' ? '+ 5' : '− 161'} = ${Math.round(bmr)} kcal`
                  }
                </p>
              </div>
              {/* Save */}
              <button
                onClick={() => {
                  const entry: NutritionEntry = {
                    id: `nut_${Date.now()}`,
                    clientId: clientId ?? 'demo-client',
                    date: new Date().toISOString().split('T')[0],
                    gender,
                    age,
                    weight,
                    height,
                    activityLevel: activity,
                    goal,
                    bmr: Math.round(bmr),
                    tdee,
                    targetCalories,
                    dietPreset,
                    proteinGrams: proteinTarget,
                    carbGrams: carbTarget,
                    fatGrams: fatTarget,
                  }
                  addNutritionEntry(entry)
                }}
                className="w-full flex items-center justify-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
              >
                <Save size={14} /> Save to Client
              </button>
            </div>
          </motion.div>

          {/* Macro Rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="xl:w-[55%] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-8 sm:gap-12">
                <MacroRing
                  label="Protein"
                  grams={proteinTarget}
                  percentage={proteinPct}
                  color="cyan"
                  unit="g"
                  delay={0}
                />
                <MacroRing
                  label="Carbs"
                  grams={adjustedCarbTarget}
                  percentage={carbPct}
                  color="violet"
                  unit="g"
                  delay={150}
                />
                <MacroRing
                  label="Fats"
                  grams={fatTarget}
                  percentage={fatPct}
                  color="orange"
                  unit="g"
                  delay={300}
                />
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-cyan text-xs font-bold">{proteinPct}%</p>
                  <p className="text-dark-muted text-[10px]">Protein</p>
                  <p className="text-dark-subtle text-[10px] font-mono">{proteinCalories} kcal</p>
                </div>
                <div>
                  <p className="text-violet text-xs font-bold">{carbPct}%</p>
                  <p className="text-dark-muted text-[10px]">Carbs</p>
                  <p className="text-dark-subtle text-[10px] font-mono">{carbCalories} kcal</p>
                </div>
                <div>
                  <p className="text-orange text-xs font-bold">{fatPct}%</p>
                  <p className="text-dark-muted text-[10px]">Fats</p>
                  <p className="text-dark-subtle text-[10px] font-mono">{fatCalories} kcal</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══ Tabs ═══ */}
      <Tabs defaultValue="plan" className="w-full">
        <TabsList className="bg-az-black-card border border-dark-border p-1 rounded-xl w-full justify-start gap-1">
          <TabsTrigger value="plan" className="data-[state=active]:bg-az-black-elevated data-[state=active]:text-dark-primary data-[state=active]:border-dark-border data-[state=active]:border text-dark-muted text-xs rounded-lg px-4 py-2 transition-all">
            <Sparkles size={14} className="mr-1.5" />
            Meal Plan
          </TabsTrigger>
          <TabsTrigger value="planner" className="data-[state=active]:bg-az-black-elevated data-[state=active]:text-dark-primary data-[state=active]:border-dark-border data-[state=active]:border text-dark-muted text-xs rounded-lg px-4 py-2 transition-all">
            <Utensils size={14} className="mr-1.5" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-az-black-elevated data-[state=active]:text-dark-primary data-[state=active]:border-dark-border data-[state=active]:border text-dark-muted text-xs rounded-lg px-4 py-2 transition-all">
            <Search size={14} className="mr-1.5" />
            Food DB
          </TabsTrigger>
          <TabsTrigger value="water" className="data-[state=active]:bg-az-black-elevated data-[state=active]:text-dark-primary data-[state=active]:border-dark-border data-[state=active]:border text-dark-muted text-xs rounded-lg px-4 py-2 transition-all">
            <Droplets size={14} className="mr-1.5" />
            Water
          </TabsTrigger>
          <TabsTrigger value="supplements" className="data-[state=active]:bg-az-black-elevated data-[state=active]:text-dark-primary data-[state=active]:border-dark-border data-[state=active]:border text-dark-muted text-xs rounded-lg px-4 py-2 transition-all">
            <Pill size={14} className="mr-1.5" />
            Supplements
          </TabsTrigger>
          <TabsTrigger value="log" className="data-[state=active]:bg-az-black-elevated data-[state=active]:text-dark-primary data-[state=active]:border-dark-border data-[state=active]:border text-dark-muted text-xs rounded-lg px-4 py-2 transition-all">
            <ClipboardList size={14} className="mr-1.5" />
            Log
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-az-black-elevated data-[state=active]:text-dark-primary data-[state=active]:border-dark-border data-[state=active]:border text-dark-muted text-xs rounded-lg px-4 py-2 transition-all">
            <BarChart3 size={14} className="mr-1.5" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-az-black-elevated data-[state=active]:text-dark-primary data-[state=active]:border-dark-border data-[state=active]:border text-dark-muted text-xs rounded-lg px-4 py-2 transition-all">
            <Brain size={14} className="mr-1.5" />
            AI
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="plan" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {mealPlan ? (
                <MealPlanDisplay plan={mealPlan} onPlanChange={setMealPlan} onDateChange={setMealPlanDate} foodDb={FOOD_DB} />
              ) : (
                <div className="bg-az-black-card border border-dark-border rounded-2xl p-8 text-center">
                  <Sparkles size={32} className="text-cyan mx-auto mb-3" />
                  <p className="text-dark-primary text-sm font-medium">Generate a meal plan</p>
                  <p className="text-dark-muted text-xs mt-1">Set your TDEE targets above to auto-generate</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="planner" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <MealPlannerTab meals={meals} onAddFood={handleAddFood} onRemoveFood={handleRemoveFood} foodDb={FOOD_DB} date={mealDate} onDateChange={setMealDate} />
            </motion.div>
          </TabsContent>
          <TabsContent value="database" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <FoodDatabaseTab foodDb={FOOD_DB} />
            </motion.div>
          </TabsContent>
          <TabsContent value="water" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <WaterTrackerTab />
            </motion.div>
          </TabsContent>
          <TabsContent value="supplements" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <SupplementsTab />
            </motion.div>
          </TabsContent>
          <TabsContent value="log" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <DailyNutritionLog
                log={{ ...todayLog, planned: mealPlan }}
                onUpdateLog={(log) => updateTodayLog({ ...log, planned: mealPlan })}
              />
            </motion.div>
          </TabsContent>
          <TabsContent value="weekly" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <WeeklyNutritionSummary logs={mergedLogs} targetCalories={targetCalories} />
            </motion.div>
          </TabsContent>
          <TabsContent value="ai" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <AiMealAnalysis
                foodDb={FOOD_DB}
                onAddToLog={(items) => {
                  // eslint-disable-next-line no-console
                  console.log('AI analyzed items:', items)
                }}
              />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* ═══ Weekly Adherence Section ═══ */}
      <div className="bg-az-black-card border border-dark-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-cyan" />
          <h3 className="text-dark-primary font-semibold text-base">This Week&apos;s Adherence</h3>
        </div>
        <div className="h-40 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adherenceData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} axisLine={{ stroke: 'dark-border' }} tickLine={false} />
              <YAxis tick={{ fill: 'var(--dark-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'az-black-elevated', border: '1px solid dark-border', borderRadius: '8px', color: 'dark-primary', fontSize: '12px' }} formatter={(value: number) => [`${value}%`, 'Adherence']} />
              <Bar dataKey="adherence" radius={[6, 6, 0, 0]}>
                {adherenceData.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.adherence)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-dark-muted text-xs">Weekly Average</span>
            <p className="font-bold font-mono" style={{ color: getBarColor(avgAdherence) }}>{avgAdherence}%</p>
          </div>
          <div>
            <span className="text-dark-muted text-xs">Best Day</span>
            <p className="text-success font-medium text-xs">Tuesday — 98%</p>
          </div>
          <div>
            <span className="text-dark-muted text-xs">Needs Improvement</span>
            <p className="text-warning font-medium text-xs">Saturday — 62%</p>
          </div>
          <div>
            <span className="text-dark-muted text-xs">Calorie Avg</span>
            <p className="text-dark-secondary font-mono text-xs">2,280 / {targetCalories.toLocaleString()} kcal</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
