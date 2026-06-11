/**
 * OnboardingPage — 5-Step Client Onboarding Wizard
 *
 * Route: /onboarding
 *
 * Steps:
 * 1. Personal Info (name, email, DOB, gender, photo)
 * 2. Body Composition (weight, height, body fat, measurements, Navy method)
 * 3. Fitness Background (PAR-Q, experience, frequency, goals, equipment)
 * 4. TDEE & Nutrition (auto-calculated TDEE, macro split, water, meals)
 * 5. Review & Submit (summary, save to localStorage)
 */

import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Ruler,
  Dumbbell,
  Apple,
  ClipboardCheck,
  AlertTriangle,
  Camera,
  Droplets,
} from 'lucide-react'

import type { OnboardingData } from '@/components/onboarding/types'
import {
  PARQ_QUESTIONS,
  GOAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  FREQUENCY_OPTIONS,
  ACTIVITY_LEVELS,
  STYLE_OPTIONS,
  EQUIPMENT_OPTIONS,
  MACRO_PRESETS,
  MEAL_COUNT_OPTIONS,
} from '@/components/onboarding/types'
import {
  calculateAge,
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateBodyFatNavy,
  calculateCalorieGoal,
  calculateMacros,
  calculateWaterGoal,
  getBodyFatCategory,
  buildClientProfile,
  saveProfile,
  saveBioEntry,
  saveNutritionPlan,
  saveOnboardingProgress,
  getOnboardingProgress,
} from '@/components/onboarding/calculations'

const TOTAL_STEPS = 5

const initialData: OnboardingData = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',

  weight: 0,
  goalWeight: 0,
  height: 0,
  bodyFatPercentage: undefined,
  useNavyMethod: false,
  navyMeasurements: { neck: 0, waist: 0, hip: 0 },
  measurements: { chest: 0, waist: 0, hips: 0, leftArm: 0, rightArm: 0, leftThigh: 0, rightThigh: 0, leftCalf: 0, rightCalf: 0 },

  parqAnswers: [false, false, false, false, false, false, false],
  trainingExperience: '',
  trainingFrequency: '',
  activityLevel: '',
  primaryGoal: '',
  secondaryGoal: '',
  injuries: '',
  preferredStyle: [],
  availableEquipment: [],

  tdee: 0,
  calorieGoal: 0,
  macroSplit: 'balanced',
  proteinGrams: 0,
  fatsGrams: 0,
  carbsGrams: 0,
  waterGoal: 0,
  mealCount: 4,
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(() => {
    const saved = getOnboardingProgress()
    return saved ? { ...initialData, ...saved } : initialData
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-save progress
  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => {
      const next = { ...prev, ...updates }
      saveOnboardingProgress(next)
      return next
    })
  }, [])

  // Computed values for Step 4
  const age = useMemo(() => calculateAge(data.dateOfBirth), [data.dateOfBirth])
  const bmi = useMemo(() => calculateBMI(data.weight, data.height), [data.weight, data.height])
  const bmr = useMemo(
    () => (data.gender ? calculateBMR(data.weight, data.height, age, data.gender) : 0),
    [data.weight, data.height, age, data.gender]
  )
  const tdee = useMemo(
    () => (data.activityLevel ? calculateTDEE(bmr, data.activityLevel) : 0),
    [bmr, data.activityLevel]
  )
  const navyBodyFat = useMemo(() => {
    if (!data.useNavyMethod || !data.gender) return 0
    return calculateBodyFatNavy(
      data.gender,
      data.navyMeasurements.waist,
      data.navyMeasurements.neck,
      data.height,
      data.gender === 'female' ? data.navyMeasurements.hip : undefined
    )
  }, [data.useNavyMethod, data.gender, data.navyMeasurements, data.height])

  const bodyFat = data.bodyFatPercentage || navyBodyFat || 0
  const bodyFatCategory = data.gender && bodyFat ? getBodyFatCategory(data.gender, bodyFat) : ''

  const calorieGoal = useMemo(
    () => (data.primaryGoal ? calculateCalorieGoal(tdee, data.primaryGoal) : tdee),
    [tdee, data.primaryGoal]
  )
  const macros = useMemo(
    () => (calorieGoal ? calculateMacros(calorieGoal, data.macroSplit) : { protein: 0, fats: 0, carbs: 0 }),
    [calorieGoal, data.macroSplit]
  )
  const waterGoal = useMemo(() => (data.weight ? calculateWaterGoal(data.weight) : 0), [data.weight])

  // Validation
  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return data.fullName.trim().length >= 2 && data.email.includes('@') && data.dateOfBirth && data.gender
      case 2:
        return data.weight > 0 && data.height > 0 && data.goalWeight > 0
      case 3:
        return data.primaryGoal && data.trainingExperience && data.trainingFrequency !== '' && data.activityLevel
      case 4:
        return true
      case 5:
        return true
      default:
        return false
    }
  }, [step, data])

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Build final data with computed values
    const finalData: OnboardingData = {
      ...data,
      tdee,
      calorieGoal: data.customCalories || calorieGoal,
      proteinGrams: macros.protein,
      fatsGrams: macros.fats,
      carbsGrams: macros.carbs,
      waterGoal,
      bodyFatPercentage: bodyFat || undefined,
    }

    const { profile, bioEntry } = buildClientProfile(finalData)

    // Save everything
    saveProfile(profile)
    saveBioEntry(bioEntry)
    saveNutritionPlan({
      calorieGoal: profile.calorieGoal,
      macroSplit: profile.macroSplit,
      proteinGrams: profile.proteinGrams,
      fatsGrams: profile.fatsGrams,
      carbsGrams: profile.carbsGrams,
      waterGoal: profile.waterGoal,
      mealCount: profile.mealCount,
    })

    toast.success(`Welcome to AzFIT, ${profile.name}! Your profile is ready.`)

    // Navigate to dashboard
    setTimeout(() => navigate('/dashboard'), 500)
  }

  const stepIcons = [User, Ruler, Dumbbell, Apple, ClipboardCheck]
  const stepLabels = ['Personal Info', 'Body Comp', 'Fitness', 'Nutrition', 'Review']

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--card-border)]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-[var(--text-primary)]">AzFIT Setup</h1>
            <span className="text-sm text-[var(--text-muted)]">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00AEEF, #8B5CF6)' }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-3">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1
              const isActive = step === stepNum
              const isCompleted = step > stepNum
              const Icon = stepIcons[i]
              return (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCompleted
                        ? 'bg-cyan text-white'
                        : isActive
                        ? 'bg-cyan/20 text-cyan border-2 border-cyan'
                        : 'bg-[var(--card-border)] text-[var(--text-muted)]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] ${isActive ? 'text-cyan font-medium' : 'text-[var(--text-muted)]'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <Step1PersonalInfo data={data} updateData={updateData} />}
            {step === 2 && <Step2BodyComp data={data} updateData={updateData} navyBodyFat={navyBodyFat} />}
            {step === 3 && <Step3FitnessBackground data={data} updateData={updateData} />}
            {step === 4 && (
              <Step4Nutrition
                data={data}
                updateData={updateData}
                age={age}
                bmi={bmi}
                bmr={bmr}
                tdee={tdee}
                calorieGoal={calorieGoal}
                macros={macros}
                waterGoal={waterGoal}
              />
            )}
            {step === 5 && (
              <Step5Review
                data={data}
                age={age}
                bmi={bmi}
                bodyFat={bodyFat}
                bodyFatCategory={bodyFatCategory}
                tdee={tdee}
                calorieGoal={calorieGoal}
                macros={macros}
                waterGoal={waterGoal}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--card-bg)] border-t border-[var(--card-border)] px-4 py-4"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-border)] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-1 px-6 py-2.5 rounded-lg font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)' }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1 px-6 py-2.5 rounded-lg font-semibold text-white disabled:opacity-60 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)' }}
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   STEP 1: PERSONAL INFO
   ═══════════════════════════════════════════ */

function Step1PersonalInfo({
  data,
  updateData,
}: {
  data: OnboardingData
  updateData: (u: Partial<OnboardingData>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Personal Information</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Let's get to know you</p>
      </div>

      <div className="space-y-4">
        <Field label="Full Name" required>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="John Doe"
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-cyan/50"
          />
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="john@example.com"
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-cyan/50"
          />
        </Field>

        <Field label="Phone" optional>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="+1 234 567 890"
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-cyan/50"
          />
        </Field>

        <Field label="Date of Birth" required>
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => updateData({ dateOfBirth: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan/50"
          />
        </Field>

        <Field label="Gender" required>
          <div className="grid grid-cols-2 gap-3">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => updateData({ gender: g })}
                className={`px-4 py-3 rounded-lg border-2 font-medium capitalize transition-all ${
                  data.gender === g
                    ? 'border-cyan bg-cyan/10 text-cyan'
                    : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-cyan/30'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Profile Photo" optional>
          <div className="flex items-center gap-4">
            {data.photo ? (
              <img src={data.photo} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--card-border)] flex items-center justify-center">
                <Camera className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--card-border)] text-sm text-[var(--text-primary)] hover:bg-[var(--card-border)]/50 cursor-pointer transition-colors">
              <Camera className="w-4 h-4" />
              {data.photo ? 'Change Photo' : 'Upload Photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (ev) => updateData({ photo: ev.target?.result as string })
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </label>
          </div>
        </Field>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   STEP 2: BODY COMPOSITION
   ═══════════════════════════════════════════ */

function Step2BodyComp({
  data,
  updateData,
  navyBodyFat,
}: {
  data: OnboardingData
  updateData: (u: Partial<OnboardingData>) => void
  navyBodyFat: number
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Body Composition</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Current stats and measurements</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Weight (kg)" required>
          <input
            type="number"
            value={data.weight || ''}
            onChange={(e) => updateData({ weight: parseFloat(e.target.value) || 0 })}
            placeholder="75"
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-cyan/50"
          />
        </Field>
        <Field label="Goal Wt (kg)" required>
          <input
            type="number"
            value={data.goalWeight || ''}
            onChange={(e) => updateData({ goalWeight: parseFloat(e.target.value) || 0 })}
            placeholder="70"
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-cyan/50"
          />
        </Field>
        <Field label="Height (cm)" required>
          <input
            type="number"
            value={data.height || ''}
            onChange={(e) => updateData({ height: parseFloat(e.target.value) || 0 })}
            placeholder="175"
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-cyan/50"
          />
        </Field>
      </div>

      {/* Body Fat */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!data.useNavyMethod}
              onChange={() => updateData({ useNavyMethod: false })}
              className="w-4 h-4 rounded border-[var(--card-border)]"
            />
            <span className="text-sm text-[var(--text-primary)]">I know my body fat %</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.useNavyMethod}
              onChange={() => updateData({ useNavyMethod: true })}
              className="w-4 h-4 rounded border-[var(--card-border)]"
            />
            <span className="text-sm text-[var(--text-primary)]">Estimate for me (Navy method)</span>
          </label>
        </div>

        {!data.useNavyMethod ? (
          <Field label="Body Fat %" optional>
            <input
              type="number"
              value={data.bodyFatPercentage || ''}
              onChange={(e) => updateData({ bodyFatPercentage: parseFloat(e.target.value) || undefined })}
              placeholder="15"
              min={1}
              max={60}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan/50"
            />
          </Field>
        ) : (
          <div className="space-y-3 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
            <p className="text-sm font-medium text-[var(--text-primary)]">Navy Method Measurements (cm)</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Neck">
                <input
                  type="number"
                  value={data.navyMeasurements.neck || ''}
                  onChange={(e) =>
                    updateData({
                      navyMeasurements: { ...data.navyMeasurements, neck: parseFloat(e.target.value) || 0 },
                    })
                  }
                  placeholder="40"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-cyan/50"
                />
              </Field>
              <Field label="Waist">
                <input
                  type="number"
                  value={data.navyMeasurements.waist || ''}
                  onChange={(e) =>
                    updateData({
                      navyMeasurements: { ...data.navyMeasurements, waist: parseFloat(e.target.value) || 0 },
                    })
                  }
                  placeholder="80"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-cyan/50"
                />
              </Field>
              {data.gender === 'female' && (
                <Field label="Hip">
                  <input
                    type="number"
                    value={data.navyMeasurements.hip || ''}
                    onChange={(e) =>
                      updateData({
                        navyMeasurements: { ...data.navyMeasurements, hip: parseFloat(e.target.value) || 0 },
                      })
                    }
                    placeholder="95"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-cyan/50"
                  />
                </Field>
              )}
            </div>
            {navyBodyFat > 0 && (
              <p className="text-sm text-cyan font-medium">Estimated Body Fat: {navyBodyFat}%</p>
            )}
          </div>
        )}
      </div>

      {/* Measurements */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--text-primary)]">Measurements (cm) — Optional</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(data.measurements).map(([key, value]) => (
            <Field key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}>
              <input
                type="number"
                value={value || ''}
                onChange={(e) =>
                  updateData({
                    measurements: { ...data.measurements, [key]: parseFloat(e.target.value) || 0 },
                  })
                }
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-cyan/50"
              />
            </Field>
          ))}
        </div>
      </div>

      {/* Progress Photo */}
      <Field label="Progress Photo" optional>
        <label className="flex items-center justify-center gap-2 w-full px-4 py-6 rounded-xl border-2 border-dashed border-[var(--card-border)] text-[var(--text-muted)] hover:border-cyan/30 hover:text-cyan cursor-pointer transition-colors">
          <Camera className="w-5 h-5" />
          <span className="text-sm">{data.progressPhoto ? 'Change Photo' : 'Take or Upload Photo'}</span>
          <input
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (ev) => updateData({ progressPhoto: ev.target?.result as string })
                reader.readAsDataURL(file)
              }
            }}
          />
        </label>
        {data.progressPhoto && (
          <img src={data.progressPhoto} alt="Progress" className="mt-3 w-full max-h-48 object-cover rounded-lg" />
        )}
      </Field>
    </div>
  )
}

/* ═══════════════════════════════════════════
   STEP 3: FITNESS BACKGROUND
   ═══════════════════════════════════════════ */

function Step3FitnessBackground({
  data,
  updateData,
}: {
  data: OnboardingData
  updateData: (u: Partial<OnboardingData>) => void
}) {
  const parqFlagged = data.parqAnswers.some((a) => a)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Fitness Background</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Help us tailor your program</p>
      </div>

      {/* PAR-Q */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Physical Activity Readiness (PAR-Q)</p>
        <p className="text-xs text-[var(--text-muted)]">Please answer honestly — your safety matters</p>
        {PARQ_QUESTIONS.map((q, i) => (
          <label key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--card-border)] cursor-pointer hover:bg-[var(--card-border)]/20 transition-colors">
            <input
              type="checkbox"
              checked={data.parqAnswers[i]}
              onChange={(e) => {
                const next = [...data.parqAnswers]
                next[i] = e.target.checked
                updateData({ parqAnswers: next })
              }}
              className="w-4 h-4 mt-0.5 rounded border-[var(--card-border)] text-red-500"
            />
            <span className="text-sm text-[var(--text-primary)] leading-relaxed">{q}</span>
          </label>
        ))}
        {parqFlagged && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber/10 border border-amber/30">
            <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
            <p className="text-sm text-amber">
              Please consult with your physician before starting this program. You can still continue, but we'll flag your profile.
            </p>
          </div>
        )}
      </div>

      {/* Training Experience */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Training Experience</p>
        <div className="grid grid-cols-1 gap-2">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => updateData({ trainingExperience: opt.key as OnboardingData['trainingExperience'] })}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                data.trainingExperience === opt.key
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-[var(--card-border)] text-[var(--text-primary)] hover:border-cyan/30'
              }`}
            >
              <span className="font-medium">{opt.label}</span>
              <span className="text-xs text-[var(--text-muted)]">{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Training Frequency */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Training Frequency</p>
        <div className="grid grid-cols-5 gap-2">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => updateData({ trainingFrequency: opt.key })}
              className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                data.trainingFrequency === opt.key
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-[var(--card-border)] text-[var(--text-primary)] hover:border-cyan/30'
              }`}
            >
              {opt.key}
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-[var(--text-muted)]">
          {FREQUENCY_OPTIONS.find((f) => f.key === data.trainingFrequency)?.label || 'Select days per week'}
        </p>
      </div>

      {/* Activity Level */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Current Activity Level</p>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level.key}
              onClick={() => updateData({ activityLevel: level.key as OnboardingData['activityLevel'] })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                data.activityLevel === level.key
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-[var(--card-border)] text-[var(--text-primary)] hover:border-cyan/30'
              }`}
            >
              <div className="text-left">
                <span className="font-medium block">{level.label}</span>
                <span className="text-xs text-[var(--text-muted)]">{level.sub}</span>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">×{level.multiplier}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Primary Goal</p>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal.key}
              onClick={() => updateData({ primaryGoal: goal.key })}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                data.primaryGoal === goal.key
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-[var(--card-border)] text-[var(--text-primary)] hover:border-cyan/30'
              }`}
            >
              <span className="text-lg">{goal.emoji}</span>
              <span className="text-sm font-medium">{goal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Goal */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Secondary Goal (Optional)</p>
        <select
          value={data.secondaryGoal}
          onChange={(e) => updateData({ secondaryGoal: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan/50"
        >
          <option value="">None</option>
          {GOAL_OPTIONS.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* Injuries */}
      <Field label="Injuries / Limitations" optional>
        <textarea
          value={data.injuries}
          onChange={(e) => updateData({ injuries: e.target.value })}
          placeholder="List any current injuries, pain, or movement limitations..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-cyan/50 resize-none"
        />
      </Field>

      {/* Preferred Style */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Preferred Training Style</p>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => {
            const selected = data.preferredStyle.includes(style)
            return (
              <button
                key={style}
                onClick={() => {
                  const next = selected
                    ? data.preferredStyle.filter((s) => s !== style)
                    : [...data.preferredStyle, style]
                  updateData({ preferredStyle: next })
                }}
                className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                  selected
                    ? 'border-cyan bg-cyan/10 text-cyan'
                    : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-cyan/30'
                }`}
              >
                {style}
              </button>
            )
          })}
        </div>
      </div>

      {/* Equipment */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Available Equipment</p>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((eq) => {
            const selected = data.availableEquipment.includes(eq)
            return (
              <button
                key={eq}
                onClick={() => {
                  const next = selected
                    ? data.availableEquipment.filter((e) => e !== eq)
                    : [...data.availableEquipment, eq]
                  updateData({ availableEquipment: next })
                }}
                className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                  selected
                    ? 'border-cyan bg-cyan/10 text-cyan'
                    : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-cyan/30'
                }`}
              >
                {eq}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   STEP 4: TDEE & NUTRITION
   ═══════════════════════════════════════════ */

function Step4Nutrition({
  data,
  updateData,
  age,
  bmi,
  bmr,
  tdee,
  calorieGoal,
  macros,
  waterGoal,
}: {
  data: OnboardingData
  updateData: (u: Partial<OnboardingData>) => void
  age: number
  bmi: number
  bmr: number
  tdee: number
  calorieGoal: number
  macros: { protein: number; fats: number; carbs: number }
  waterGoal: number
}) {
  const displayCalories = data.customCalories || calorieGoal

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">TDEE & Nutrition</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Auto-calculated from your profile</p>
      </div>

      {/* Auto-calculated stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Age" value={`${age} years`} color="#00AEEF" />
        <StatCard label="BMI" value={bmi.toFixed(1)} color="#8B5CF6" />
        <StatCard label="BMR" value={`${bmr} kcal`} color="#F59E0B" />
        <StatCard label="TDEE" value={`${tdee} kcal`} color="#22C55E" />
      </div>

      {/* Calorie Goal */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Calorie Goal</p>
        <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-cyan tabular-nums">{displayCalories.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">kcal / day</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text-muted)]">Maintenance: {tdee.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {data.primaryGoal === 'lose_fat' && 'Fat Loss (-500)'}
                {data.primaryGoal === 'build_muscle' && 'Muscle Gain (+300)'}
                {data.primaryGoal === 'strength' && 'Strength (+200)'}
                {data.primaryGoal === 'recomposition' && 'Recomp (maintenance)'}
                {data.primaryGoal === 'performance' && 'Performance (+400)'}
                {data.primaryGoal === 'general_health' && 'Maintenance'}
              </p>
            </div>
          </div>
        </div>

        {/* Custom override */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={!!data.customCalories}
              onChange={(e) => updateData({ customCalories: e.target.checked ? calorieGoal : undefined })}
              className="w-4 h-4 rounded"
            />
            Custom calories
          </label>
          {!!data.customCalories && (
            <input
              type="number"
              value={data.customCalories}
              onChange={(e) => updateData({ customCalories: parseInt(e.target.value) || calorieGoal })}
              className="w-24 px-2 py-1 rounded border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] text-sm"
            />
          )}
        </div>
      </div>

      {/* Macro Split */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Macro Split</p>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(MACRO_PRESETS) as [keyof typeof MACRO_PRESETS, typeof MACRO_PRESETS['balanced']][]).map(
            ([key, preset]) => {
              const selected = data.macroSplit === key
              const m = calculateMacros(displayCalories, key)
              return (
                <button
                  key={key}
                  onClick={() => updateData({ macroSplit: key })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? 'border-cyan bg-cyan/10'
                      : 'border-[var(--card-border)] hover:border-cyan/30'
                  }`}
                >
                  <p className={`text-sm font-bold ${selected ? 'text-cyan' : 'text-[var(--text-primary)]'}`}>
                    {preset.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{preset.desc}</p>
                  <div className="mt-2 space-y-0.5 text-xs">
                    <p className="text-teal-600">P: {m.protein}g</p>
                    <p className="text-amber-600">F: {m.fats}g</p>
                    <p className="text-green-600">C: {m.carbs}g</p>
                  </div>
                </button>
              )
            }
          )}
        </div>
      </div>

      {/* Macro display */}
      <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Daily Targets</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-teal-500 tabular-nums">{macros.protein}g</p>
            <p className="text-xs text-[var(--text-muted)]">Protein</p>
          </div>
          <div>
            <p className="text-xl font-bold text-amber-500 tabular-nums">{macros.fats}g</p>
            <p className="text-xs text-[var(--text-muted)]">Fats</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-500 tabular-nums">{macros.carbs}g</p>
            <p className="text-xs text-[var(--text-muted)]">Carbs</p>
          </div>
        </div>
      </div>

      {/* Water Goal */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Water Intake Goal</p>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
          <Droplets className="w-6 h-6 text-cyan" />
          <div className="flex-1">
            <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
              {(waterGoal / 1000).toFixed(1)}L
            </p>
            <p className="text-xs text-[var(--text-muted)]">{waterGoal}ml / day</p>
          </div>
          <input
            type="range"
            min={1000}
            max={5000}
            step={100}
            value={data.waterGoal || waterGoal}
            onChange={(e) => updateData({ waterGoal: parseInt(e.target.value) })}
            className="w-24"
          />
        </div>
      </div>

      {/* Meal Count */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Meals Per Day</p>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_COUNT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => updateData({ mealCount: opt.key })}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                data.mealCount === opt.key
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-[var(--card-border)] text-[var(--text-primary)] hover:border-cyan/30'
              }`}
            >
              <p className="font-bold">{opt.key}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   STEP 5: REVIEW & SUBMIT
   ═══════════════════════════════════════════ */

function Step5Review({
  data,
  age,
  bmi,
  bodyFat,
  bodyFatCategory,
  tdee,
  calorieGoal,
  macros,
  waterGoal,
}: {
  data: OnboardingData
  age: number
  bmi: number
  bodyFat: number
  bodyFatCategory: string
  tdee: number
  calorieGoal: number
  macros: { protein: number; fats: number; carbs: number }
  waterGoal: number
}) {
  const goalLabel = GOAL_OPTIONS.find((g) => g.key === data.primaryGoal)?.label || data.primaryGoal
  const expLabel = EXPERIENCE_OPTIONS.find((e) => e.key === data.trainingExperience)?.label || data.trainingExperience
  const freqLabel = FREQUENCY_OPTIONS.find((f) => f.key === data.trainingFrequency)?.label || `${data.trainingFrequency} days`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Review Your Profile</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Everything look good?</p>
      </div>

      {/* Profile card */}
      <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] space-y-4">
        <div className="flex items-center gap-3">
          {data.photo ? (
            <img src={data.photo} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-cyan/10 flex items-center justify-center">
              <User className="w-7 h-7 text-cyan" />
            </div>
          )}
          <div>
            <p className="font-bold text-[var(--text-primary)]">{data.fullName}</p>
            <p className="text-sm text-[var(--text-muted)]">{data.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <ReviewItem label="Age" value={`${age} years`} />
          <ReviewItem label="Gender" value={data.gender} />
          <ReviewItem label="Weight" value={`${data.weight}kg`} />
          <ReviewItem label="Goal Weight" value={`${data.goalWeight}kg`} />
          <ReviewItem label="Height" value={`${data.height}cm`} />
          <ReviewItem label="BMI" value={bmi.toFixed(1)} />
          {bodyFat > 0 && (
            <ReviewItem
              label="Body Fat"
              value={`${bodyFat.toFixed(1)}% (${bodyFatCategory})`}
            />
          )}
        </div>
      </div>

      {/* Fitness card */}
      <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Fitness Profile</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <ReviewItem label="Experience" value={expLabel} />
          <ReviewItem label="Frequency" value={freqLabel} />
          <ReviewItem label="Primary Goal" value={goalLabel} />
          <ReviewItem label="Activity" value={data.activityLevel} />
        </div>
        {data.injuries && (
          <p className="text-xs text-amber">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            {data.injuries}
          </p>
        )}
      </div>

      {/* Nutrition card */}
      <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] space-y-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Nutrition Plan</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">TDEE</span>
          <span className="font-semibold text-[var(--text-primary)]">{tdee.toLocaleString()} kcal</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">Daily Target</span>
          <span className="font-bold text-cyan">{calorieGoal.toLocaleString()} kcal</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center p-2 rounded-lg bg-teal/10">
            <p className="font-bold text-teal">{macros.protein}g</p>
            <p className="text-[10px] text-[var(--text-muted)]">Protein</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber/10">
            <p className="font-bold text-amber">{macros.fats}g</p>
            <p className="text-[10px] text-[var(--text-muted)]">Fats</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green/10">
            <p className="font-bold text-green">{macros.carbs}g</p>
            <p className="text-[10px] text-[var(--text-muted)]">Carbs</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)]">
          <span className="text-sm text-[var(--text-muted)]">Water Goal</span>
          <span className="font-semibold text-cyan">{(waterGoal / 1000).toFixed(1)}L</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">Meals</span>
          <span className="font-semibold text-[var(--text-primary)]">{data.mealCount} per day</span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════ */

function Field({
  label,
  children,
  required,
  optional,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
  optional?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-[var(--text-primary)]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {optional && <span className="text-[var(--text-muted)] ml-1 text-xs">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="p-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-center">
      <p className="text-lg font-bold tabular-nums" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  )
}

function ReviewItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-medium text-[var(--text-primary)] capitalize">{value}</span>
    </div>
  )
}
