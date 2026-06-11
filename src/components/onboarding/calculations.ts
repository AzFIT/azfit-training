/**
 * Onboarding Calculations
 * BMI, BMR, TDEE, Body Fat %, Macros, Water
 */

import type { OnboardingData } from './types'

export function calculateAge(dob: string): number {
  if (!dob) return 0
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0
  const heightM = heightCm / 100
  return +(weightKg / (heightM * heightM)).toFixed(1)
}

/** Mifflin-St Jeor BMR */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (!weightKg || !heightCm || !age || !gender) return 0
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

export function calculateTDEE(
  bmr: number,
  activityLevel: string
): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
    extreme: 1.9,
  }
  return Math.round(bmr * (multipliers[activityLevel] || 1.2))
}

/** Navy Method Body Fat % */
export function calculateBodyFatNavy(
  gender: 'male' | 'female',
  waist: number, // cm
  neck: number, // cm
  height: number, // cm
  hip?: number // cm (female only)
): number {
  if (!waist || !neck || !height) return 0

  // Convert cm to inches for formula
  const w = waist / 2.54
  const n = neck / 2.54
  const h = height / 2.54

  if (gender === 'male') {
    return +(86.01 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76).toFixed(1)
  } else {
    const hp = (hip || waist) / 2.54
    return +(163.205 * Math.log10(w + hp - n) - 97.684 * Math.log10(h) - 78.387).toFixed(1)
  }
}

/** Calculate calorie goal based on primary goal */
export function calculateCalorieGoal(tdee: number, goal: string): number {
  const adjustments: Record<string, number> = {
    lose_fat: -500,
    build_muscle: 300,
    strength: 200,
    recomposition: 0,
    performance: 400,
    general_health: 0,
  }
  return Math.round(tdee + (adjustments[goal] || 0))
}

/** Calculate macros from calories and split */
export function calculateMacros(
  calories: number,
  split: 'balanced' | 'high_protein' | 'high_carb'
): { protein: number; fats: number; carbs: number } {
  const presets = {
    balanced: { protein: 0.30, fats: 0.35, carbs: 0.35 },
    high_protein: { protein: 0.40, fats: 0.40, carbs: 0.20 },
    high_carb: { protein: 0.30, fats: 0.20, carbs: 0.50 },
  }
  const p = presets[split]
  return {
    protein: Math.round((calories * p.protein) / 4),
    fats: Math.round((calories * p.fats) / 9),
    carbs: Math.round((calories * p.carbs) / 4),
  }
}

/** Water intake: weight(kg) × 35ml */
export function calculateWaterGoal(weightKg: number): number {
  return Math.round(weightKg * 35)
}

/** Body fat category badge */
export function getBodyFatCategory(gender: 'male' | 'female', bf: number): string {
  if (gender === 'male') {
    if (bf < 10) return 'Lean'
    if (bf < 15) return 'Athletic'
    if (bf < 20) return 'Fit'
    if (bf < 25) return 'Average'
    return 'Higher'
  } else {
    if (bf < 18) return 'Lean'
    if (bf < 23) return 'Athletic'
    if (bf < 28) return 'Fit'
    if (bf < 33) return 'Average'
    return 'Higher'
  }
}

/** Build complete profile from onboarding data */
export function buildClientProfile(data: OnboardingData): {
  profile: import('./types').ClientProfile
  bioEntry: import('./types').BioPrintEntry
} {
  const age = calculateAge(data.dateOfBirth)
  const bmr = calculateBMR(data.weight, data.height, age, data.gender as 'male' | 'female')
  const tdee = calculateTDEE(bmr, data.activityLevel)
  const calorieGoal = data.customCalories || calculateCalorieGoal(tdee, data.primaryGoal)
  const macros = calculateMacros(calorieGoal, data.macroSplit || 'balanced')
  const waterGoal = calculateWaterGoal(data.weight)

  const now = Date.now()
  const id = `client_${now}`

  const profile: import('./types').ClientProfile = {
    id,
    name: data.fullName,
    email: data.email,
    phone: data.phone || undefined,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender as 'male' | 'female',
    photo: data.photo,

    weight: data.weight,
    goalWeight: data.goalWeight,
    height: data.height,
    bodyFatPercentage: data.bodyFatPercentage,
    measurements: data.measurements,
    progressPhoto: data.progressPhoto,

    parqAnswers: data.parqAnswers,
    parqFlagged: data.parqAnswers.some((a) => a),
    trainingExperience: data.trainingExperience as 'beginner' | 'intermediate' | 'advanced',
    trainingFrequency: data.trainingFrequency as 2 | 3 | 4 | 5 | 6,
    activityLevel: data.activityLevel as 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme',
    primaryGoal: data.primaryGoal,
    secondaryGoal: data.secondaryGoal || undefined,
    injuries: data.injuries || undefined,
    preferredStyle: data.preferredStyle,
    availableEquipment: data.availableEquipment,

    tdee,
    calorieGoal,
    macroSplit: data.macroSplit || 'balanced',
    proteinGrams: macros.protein,
    fatsGrams: macros.fats,
    carbsGrams: macros.carbs,
    waterGoal,
    mealCount: data.mealCount || 4,

    createdAt: now,
    updatedAt: now,
  }

  const bioEntry: import('./types').BioPrintEntry = {
    id: `bio_${now}`,
    date: new Date().toISOString().split('T')[0],
    weight: data.weight,
    bodyFatPercentage: data.bodyFatPercentage,
    measurements: data.measurements,
    photo: data.progressPhoto,
    notes: 'Initial onboarding entry',
  }

  return { profile, bioEntry }
}

/** Storage helpers */
const STORAGE_KEYS = {
  profile: 'azfit_client_profile',
  bioHistory: 'azfit_bio_history',
  nutritionPlan: 'azfit_nutrition_plan',
  onboardingData: 'azfit_onboarding_data',
}

export function saveProfile(profile: import('./types').ClientProfile): void {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile))
}

export function getProfile(): import('./types').ClientProfile | null {
  const stored = localStorage.getItem(STORAGE_KEYS.profile)
  return stored ? JSON.parse(stored) : null
}

export function saveBioEntry(entry: import('./types').BioPrintEntry): void {
  const history = getBioHistory()
  history.unshift(entry)
  localStorage.setItem(STORAGE_KEYS.bioHistory, JSON.stringify(history))
}

export function getBioHistory(): import('./types').BioPrintEntry[] {
  const stored = localStorage.getItem(STORAGE_KEYS.bioHistory)
  return stored ? JSON.parse(stored) : []
}

export function saveNutritionPlan(plan: {
  calorieGoal: number
  macroSplit: string
  proteinGrams: number
  fatsGrams: number
  carbsGrams: number
  waterGoal: number
  mealCount: number
}): void {
  localStorage.setItem(STORAGE_KEYS.nutritionPlan, JSON.stringify(plan))
}

export function saveOnboardingProgress(data: Partial<OnboardingData>): void {
  const existing = localStorage.getItem(STORAGE_KEYS.onboardingData)
  const current = existing ? JSON.parse(existing) : {}
  localStorage.setItem(STORAGE_KEYS.onboardingData, JSON.stringify({ ...current, ...data }))
}

export function getOnboardingProgress(): Partial<OnboardingData> | null {
  const stored = localStorage.getItem(STORAGE_KEYS.onboardingData)
  return stored ? JSON.parse(stored) : null
}

export function clearOnboardingProgress(): void {
  localStorage.removeItem(STORAGE_KEYS.onboardingData)
}
