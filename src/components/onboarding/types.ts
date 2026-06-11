/**
 * Onboarding Wizard Types
 * Client-facing self-service onboarding
 */

export interface OnboardingData {
  // Step 1: Personal Info
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | ''
  photo?: string

  // Step 2: Body Composition
  weight: number // kg
  goalWeight: number // kg
  height: number // cm
  bodyFatPercentage?: number
  useNavyMethod: boolean
  navyMeasurements: {
    neck: number
    waist: number
    hip?: number // female only
  }
  measurements: {
    chest: number
    waist: number
    hips: number
    leftArm: number
    rightArm: number
    leftThigh: number
    rightThigh: number
    leftCalf: number
    rightCalf: number
  }
  progressPhoto?: string

  // Step 3: Fitness Background
  parqAnswers: boolean[] // 7 answers
  trainingExperience: 'beginner' | 'intermediate' | 'advanced' | ''
  trainingFrequency: 2 | 3 | 4 | 5 | 6 | ''
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme' | ''
  primaryGoal: string
  secondaryGoal: string
  injuries: string
  preferredStyle: string[]
  availableEquipment: string[]

  // Step 4: TDEE & Nutrition
  tdee: number
  calorieGoal: number
  customCalories?: number
  macroSplit: 'balanced' | 'high_protein' | 'high_carb'
  proteinGrams: number
  fatsGrams: number
  carbsGrams: number
  waterGoal: number // ml
  mealCount: 3 | 4 | 5 | 6
}

export interface ClientProfile {
  id: string
  name: string
  email: string
  phone?: string
  dateOfBirth: string
  gender: 'male' | 'female'
  photo?: string

  weight: number
  goalWeight: number
  height: number
  bodyFatPercentage?: number
  measurements?: BodyMeasurements
  progressPhoto?: string

  parqAnswers: boolean[]
  parqFlagged: boolean
  trainingExperience: 'beginner' | 'intermediate' | 'advanced'
  trainingFrequency: 2 | 3 | 4 | 5 | 6
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme'
  primaryGoal: string
  secondaryGoal?: string
  injuries?: string
  preferredStyle: string[]
  availableEquipment: string[]

  tdee: number
  calorieGoal: number
  macroSplit: 'balanced' | 'high_protein' | 'high_carb'
  proteinGrams: number
  fatsGrams: number
  carbsGrams: number
  waterGoal: number
  mealCount: 3 | 4 | 5 | 6

  createdAt: number
  updatedAt: number
}

export interface BodyMeasurements {
  chest: number
  waist: number
  hips: number
  leftArm: number
  rightArm: number
  leftThigh: number
  rightThigh: number
  leftCalf: number
  rightCalf: number
}

export interface BioPrintEntry {
  id: string
  date: string
  weight: number
  bodyFatPercentage?: number
  measurements?: BodyMeasurements
  photo?: string
  notes?: string
}

export const PARQ_QUESTIONS = [
  'Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?',
  'Do you feel pain in your chest when you do physical activity?',
  'In the past month, have you had chest pain when you were not doing physical activity?',
  'Do you lose your balance because of dizziness or do you ever lose consciousness?',
  'Do you have a bone or joint problem that could be made worse by a change in your physical activity?',
  'Is your doctor currently prescribing drugs for your blood pressure or heart condition?',
  'Do you know of any other reason why you should not do physical activity?',
]

export const GOAL_OPTIONS = [
  { key: 'lose_fat', label: 'Lose Fat', emoji: '🔥' },
  { key: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
  { key: 'strength', label: 'Strength', emoji: '🏋️' },
  { key: 'recomposition', label: 'Recomposition', emoji: '⚖️' },
  { key: 'performance', label: 'Athletic Performance', emoji: '🏃' },
  { key: 'general_health', label: 'General Health', emoji: '❤️' },
]

export const EXPERIENCE_OPTIONS = [
  { key: 'beginner', label: 'Beginner', sub: '0-1 years' },
  { key: 'intermediate', label: 'Intermediate', sub: '1-3 years' },
  { key: 'advanced', label: 'Advanced', sub: '3+ years' },
]

export const FREQUENCY_OPTIONS = [
  { key: 2, label: '2 days/week' },
  { key: 3, label: '3 days/week' },
  { key: 4, label: '4 days/week' },
  { key: 5, label: '5 days/week' },
  { key: 6, label: '6 days/week' },
]

export const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Sedentary', sub: 'Little to no exercise', multiplier: 1.2 },
  { key: 'light', label: 'Lightly Active', sub: 'Light exercise 1-3 days/week', multiplier: 1.375 },
  { key: 'moderate', label: 'Moderately Active', sub: 'Moderate exercise 3-5 days/week', multiplier: 1.55 },
  { key: 'very', label: 'Very Active', sub: 'Hard exercise 6-7 days/week', multiplier: 1.725 },
  { key: 'extreme', label: 'Extremely Active', sub: 'Very hard exercise + physical job', multiplier: 1.9 },
]

export const STYLE_OPTIONS = [
  'Free Weights (Barbell/Dumbbell)',
  'Machines',
  'Bodyweight / Calisthenics',
  'Mixed',
]

export const EQUIPMENT_OPTIONS = [
  'Full Gym',
  'Dumbbells Only',
  'Home Gym (limited)',
  'Bodyweight Only',
]

export const MACRO_PRESETS = {
  balanced: { protein: 0.30, fats: 0.35, carbs: 0.35, label: 'Balanced Diet', desc: 'General health & sustainability' },
  high_protein: { protein: 0.40, fats: 0.40, carbs: 0.20, label: 'High Protein', desc: 'Muscle building & strength' },
  high_carb: { protein: 0.30, fats: 0.20, carbs: 0.50, label: 'High Carb', desc: 'Endurance & performance' },
}

export const MEAL_COUNT_OPTIONS = [
  { key: 3, label: '3 meals', sub: 'Traditional' },
  { key: 4, label: '4 meals', sub: '3 meals + snack' },
  { key: 5, label: '5 meals', sub: 'Bodybuilding style' },
  { key: 6, label: '6 meals', sub: 'Frequent feeding' },
]
