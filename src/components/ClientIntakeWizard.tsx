import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Flame,
  Dumbbell,
  Trophy,
  HeartPulse,
  Shield,
  Activity,
  User,
  Info,
} from 'lucide-react'
import { useAppDataStore } from '../stores/useAppDataStore'
import type { Client, ClientNote } from '../types/entities'
import { v4 as uuidv4 } from 'uuid'

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const GOAL_OPTIONS = [
  { key: 'Fat Loss', icon: Flame, color: '#EF4444' },
  { key: 'Muscle Gain', icon: Dumbbell, color: '#22C55E' },
  { key: 'Strength', icon: Trophy, color: '#8B5CF6' },
  { key: 'Endurance', icon: HeartPulse, color: '#F59E0B' },
  { key: 'Athletic Performance', icon: Activity, color: '#00AEEF' },
  { key: 'Rehab & Mobility', icon: Shield, color: '#EC4899' },
  { key: 'General Fitness', icon: User, color: '#64748B' },
]

const EXPERIENCE_OPTIONS = [
  'Beginner (0-1 year)',
  'Intermediate (1-3 years)',
  'Advanced (3+ years)',
]
const EQUIPMENT_OPTIONS = [
  'Full Gym',
  'Dumbbells Only',
  'Bodyweight',
  'Home Gym',
  'Commercial Gym',
]
const TRAINING_DAYS = ['1', '2', '3', '4', '5', '6', '7']
const TIME_OPTIONS = [
  'Early Morning (05:00-07:00)',
  'Morning (06:00-09:00)',
  'Afternoon (14:00-17:00)',
  'Evening (17:00-20:00)',
  'Night (20:00-22:00)',
]
const ACTIVITY_LEVELS = ['Sedentary', 'Low', 'Moderate', 'High', 'Athlete']

const SKINFOLD_SITES = [
  { key: 'tricep', label: 'Tricep' },
  { key: 'subscap', label: 'Sub-Scapular' },
  { key: 'supra', label: 'Suprailiac' },
  { key: 'umbil', label: 'Umbilical' },
  { key: 'thigh', label: 'Thigh' },
  { key: 'pec', label: 'Pectoral' },
  { key: 'midax', label: 'Mid-Axillary' },
]

const OPTIONAL_SKINFOLDS = [
  { key: 'chin', label: 'Chin' },
  { key: 'cheek', label: 'Cheek' },
  { key: 'knee', label: 'Knee' },
  { key: 'calf', label: 'Calf' },
  { key: 'ham', label: 'Hamstring' },
]

const CIRCUMFERENCES = [
  { key: 'leftArm', label: 'Left Arm' },
  { key: 'rightArm', label: 'Right Arm' },
  { key: 'leftThigh', label: 'Left Thigh' },
  { key: 'rightThigh', label: 'Right Thigh' },
  { key: 'hips', label: 'Hips' },
  { key: 'waist', label: 'Waist' },
  { key: 'shoulder', label: 'Shoulder' },
  { key: 'neck', label: 'Neck' },
  { key: 'chest', label: 'Chest' },
]

const SAFETY_CHECKS = [
  { key: 'noCardio', label: 'No cardiovascular conditions' },
  { key: 'noBP', label: 'No uncontrolled blood pressure' },
  { key: 'noDizziness', label: 'No dizziness or fainting history' },
  { key: 'noJointPain', label: 'No joint pain during movement' },
  { key: 'clearedRT', label: 'Cleared for resistance training' },
  { key: 'clearedHIIT', label: 'Cleared for high-intensity exercise' },
]

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function genId(): string {
  return `az_${uuidv4().slice(0, 8)}_${Math.random().toString(36).slice(2, 6)}`
}

function calculateAge(dob: string): number {
  if (!dob) return 0
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0
  return +(weightKg / Math.pow(heightCm / 100, 2)).toFixed(1)
}

function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: string,
  activity: string
) {
  if (!weightKg || !heightCm || !age || !sex || !activity) return { bmr: 0, tdee: 0 }
  let bmr = 0
  if (sex === 'Male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }
  const multipliers: Record<string, number> = {
    Sedentary: 1.2,
    Low: 1.375,
    Moderate: 1.55,
    High: 1.725,
    Athlete: 1.9,
  }
  const tdee = Math.round(bmr * (multipliers[activity] || 1.2))
  return { bmr: Math.round(bmr), tdee }
}

function calculateBodyFatJP7(sum7: number, age: number, sex: string): number {
  if (!sum7 || sum7 <= 0) return 0
  let density = 0
  if (sex === 'Male') {
    density =
      1.112 -
      0.00043499 * sum7 +
      0.00000055 * sum7 * sum7 -
      0.00028826 * age
  } else {
    density =
      1.097 -
      0.00046971 * sum7 +
      0.00000056 * sum7 * sum7 -
      0.00012828 * age
  }
  if (density <= 0) return 0
  return +(((4.95 / density) - 4.5) * 100).toFixed(1)
}

function calculateMacros(calories: number, weightKg: number, dietType: string) {
  const ratios: Record<string, { p: number; c: number; f: number }> = {
    balanced: { p: 30, c: 35, f: 35 },
    lowCarb: { p: 35, c: 15, f: 50 },
    highCarb: { p: 25, c: 55, f: 20 },
    highProtein: { p: 40, c: 30, f: 30 },
  }
  const r = ratios[dietType] || ratios.balanced
  const proteinFromPct = (calories * r.p) / 100 / 4
  const minProtein = weightKg * 1.6
  const protein = Math.round(Math.max(proteinFromPct, minProtein))
  const pCal = protein * 4
  const rem = calories - pCal
  const carbs = Math.round((rem * (r.c / (r.c + r.f))) / 4)
  const fat = Math.round((rem * (r.f / (r.c + r.f))) / 9)
  return { protein, carbs, fat, calories }
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi <= 0) return { label: '', color: '' }
  if (bmi < 18.5) return { label: 'Underweight', color: '#F59E0B' }
  if (bmi < 25) return { label: 'Normal', color: '#22C55E' }
  if (bmi < 30) return { label: 'Overweight', color: '#F97316' }
  return { label: 'Obese', color: '#EF4444' }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* ═══════════════════════════════════════════
   MODULE-LEVEL UI COMPONENTS
   ═══════════════════════════════════════════ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-dark-primary mb-3">{children}</h3>
}

function Label({
  children,
  required,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="text-xs text-dark-secondary mb-1 block">
      {children} {required && <span className="text-danger">*</span>}
    </label>
  )
}

function Input({
  value,
  onChange,
  type = 'text',
  placeholder = '',
}: {
  value: string | number
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 bg-navy-input border border-navy-border rounded-lg px-3 text-dark-primary text-sm placeholder:text-dark-muted focus:outline-none focus:border-cyan transition-colors"
    />
  )
}

function NumberInput({
  value,
  onChange,
  placeholder = '',
}: {
  value: number
  onChange: (v: number) => void
  placeholder?: string
}) {
  return (
    <input
      type="number"
      step="0.1"
      value={value || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      className="w-full h-10 bg-navy-input border border-navy-border rounded-lg px-3 text-dark-primary text-sm placeholder:text-dark-muted focus:outline-none focus:border-cyan transition-colors"
    />
  )
}

function TextArea({
  value,
  onChange,
  placeholder = '',
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      rows={rows}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-navy-input border border-navy-border rounded-lg px-3 py-2 text-dark-primary text-sm placeholder:text-dark-muted resize-none focus:outline-none focus:border-cyan transition-colors"
    />
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 bg-navy-input border border-navy-border rounded-lg px-3 text-dark-primary text-sm focus:outline-none focus:border-cyan transition-colors"
    >
      <option value="" className="bg-navy-input">
        Select...
      </option>
      {options.map((o) => (
        <option key={o} value={o} className="bg-navy-input">
          {o}
        </option>
      ))}
    </select>
  )
}

function CardSelect({
  options,
  selected,
  onSelect,
  multi = false,
}: {
  options: {
    key: string
    label?: string
    icon?: React.ElementType
    color?: string
  }[]
  selected: string | string[]
  onSelect: (key: string) => void
  multi?: boolean
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((opt) => {
        const isSelected = multi
          ? (selected as string[]).includes(opt.key)
          : selected === opt.key
        const Icon = opt.icon
        return (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className={`p-3 rounded-xl border text-left transition-all duration-200 ${
              isSelected
                ? 'border-cyan bg-cyan/10'
                : 'border-dark-border bg-az-black-elevated hover:border-dark-subtle'
            }`}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon size={16} style={{ color: opt.color || '#00AEEF' }} />}
              <span
                className={`text-xs font-medium ${isSelected ? 'text-cyan' : 'text-dark-primary'}`}
              >
                {opt.label || opt.key}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm border-b border-dark-divider py-2">
      <span className="text-dark-muted">{label}</span>
      <span className="text-dark-primary">{value || '—'}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

interface Props {
  open: boolean
  onClose: () => void
}

export default function ClientIntakeWizard({ open, onClose }: Props) {
  const [step, setStep] = useState(1)
  const addClient = useAppDataStore((s) => s.addClient)
  const addNote = useAppDataStore((s) => s.addNote)

  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    dob: '',
    sex: 'Female' as 'Male' | 'Female' | 'Other',
    emergencyContactName: '',
    emergencyContactPhone: '',
    goal: '',
    secondaryGoal: '',
    experienceLevel: '',
    equipmentAccess: [] as string[],
    trainingDaysPerWeek: '',
    preferredTime: '',
    weight: 0,
    height: 0,
    activityLevel: '',
    bodyFatManual: 0,
    skinfolds: {} as Record<string, number>,
    circumferences: {} as Record<string, number>,
    medicalConditions: '',
    injuries: '',
    medications: '',
    allergies: '',
    clearedToExercise: '',
    restrictions: '',
    safetyCheckboxes: {} as Record<string, boolean>,
    notes: '',
  }

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (open) {
      setForm(emptyForm)
      setStep(1)
    }
  }, [open])

  const age = useMemo(() => calculateAge(form.dob), [form.dob])

  const bmi = useMemo(
    () => calculateBMI(form.weight, form.height),
    [form.weight, form.height]
  )
  const bmiCat = useMemo(() => bmiCategory(bmi), [bmi])

  const { bmr, tdee } = useMemo(
    () => calculateTDEE(form.weight, form.height, age, form.sex, form.activityLevel),
    [form.weight, form.height, age, form.sex, form.activityLevel]
  )

  const sum7 = useMemo(() => {
    return SKINFOLD_SITES.reduce((sum, s) => sum + (form.skinfolds[s.key] || 0), 0)
  }, [form.skinfolds])

  const bodyFatCalc = useMemo(() => {
    if (sum7 <= 0) return 0
    return calculateBodyFatJP7(sum7, age, form.sex)
  }, [sum7, age, form.sex])

  const bodyFat = useMemo(() => {
    return form.bodyFatManual > 0 ? form.bodyFatManual : bodyFatCalc
  }, [form.bodyFatManual, bodyFatCalc])

  const leanMass = useMemo(() => {
    if (!form.weight || !bodyFat) return 0
    return +(form.weight * (1 - bodyFat / 100)).toFixed(1)
  }, [form.weight, bodyFat])

  const fatMass = useMemo(() => {
    if (!form.weight || !bodyFat) return 0
    return +(form.weight * (bodyFat / 100)).toFixed(1)
  }, [form.weight, bodyFat])

  const calorieTargets = useMemo(() => {
    if (!tdee) return null
    return {
      maintenance: tdee,
      fatLoss: tdee - 500,
      aggressive: tdee - 750,
      muscleGain: tdee + 250,
    }
  }, [tdee])

  const macros = useMemo(() => {
    if (!calorieTargets || !form.weight) return null
    return {
      balanced: calculateMacros(calorieTargets.maintenance, form.weight, 'balanced'),
      lowCarb: calculateMacros(calorieTargets.maintenance, form.weight, 'lowCarb'),
      highCarb: calculateMacros(calorieTargets.maintenance, form.weight, 'highCarb'),
      highProtein: calculateMacros(calorieTargets.maintenance, form.weight, 'highProtein'),
    }
  }, [calorieTargets, form.weight])

  const update = (field: keyof typeof form, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateSkinfold = (key: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      skinfolds: { ...prev.skinfolds, [key]: value },
    }))
  }

  const updateCirc = (key: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      circumferences: { ...prev.circumferences, [key]: value },
    }))
  }

  const toggleEquipment = (item: string) => {
    setForm((prev) => ({
      ...prev,
      equipmentAccess: prev.equipmentAccess.includes(item)
        ? prev.equipmentAccess.filter((e) => e !== item)
        : [...prev.equipmentAccess, item],
    }))
  }

  const toggleSafety = (key: string) => {
    setForm((prev) => ({
      ...prev,
      safetyCheckboxes: { ...prev.safetyCheckboxes, [key]: !prev.safetyCheckboxes[key] },
    }))
  }

  const handleSubmit = () => {
    const today = new Date().toISOString().split('T')[0]
    const clientId = genId()

    const client: Client = {
      id: clientId,
      name: form.name,
      email: form.email,
      avatar: '/avatar-placeholder.png',
      initials: getInitials(form.name),
      status: 'active',
      joinDate: today,
      lastActive: today,
      phone: form.phone || undefined,
      age,
      weight: form.weight,
      height: form.height,
      bodyFat: bodyFat || 0,
      goal: form.goal,
      programName: 'Unassigned',
      programProgress: 0,
      complianceScore: 0,
      sessionsCompleted: 0,
    }

    addClient(client)

    // Store detailed intake data as a note
    const intakeNote: ClientNote = {
      id: genId(),
      clientId,
      title: 'Intake Assessment',
      author: 'System',
      date: today,
      category: 'intake',
      important: true,
      content: JSON.stringify(
        {
          dob: form.dob,
          sex: form.sex,
          emergencyContact: {
            name: form.emergencyContactName,
            phone: form.emergencyContactPhone,
          },
          secondaryGoal: form.secondaryGoal,
          experienceLevel: form.experienceLevel,
          equipmentAccess: form.equipmentAccess,
          trainingDaysPerWeek: form.trainingDaysPerWeek,
          preferredTime: form.preferredTime,
          activityLevel: form.activityLevel,
          bmi,
          bmr,
          tdee,
          bodyFatManual: form.bodyFatManual,
          bodyFatCalculated: bodyFatCalc,
          leanMass,
          fatMass,
          sumOfSkinfolds: sum7,
          skinfolds: form.skinfolds,
          circumferences: form.circumferences,
          calorieTargets,
          macros,
          medicalConditions: form.medicalConditions,
          injuries: form.injuries,
          medications: form.medications,
          allergies: form.allergies,
          clearedToExercise: form.clearedToExercise,
          restrictions: form.restrictions,
          safetyCheckboxes: form.safetyCheckboxes,
          coachNotes: form.notes,
        },
        null,
        2
      ),
    }

    addNote(intakeNote)
    onClose()
  }

  const steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Goals' },
    { num: 3, label: 'Body Assessment' },
    { num: 4, label: 'Medical' },
    { num: 5, label: 'Review' },
  ]

  const canProceed = () => {
    if (step === 1) return form.name && form.dob
    if (step === 2) return form.goal && form.experienceLevel
    if (step === 3) return form.weight > 0 && form.height > 0 && form.activityLevel
    if (step === 4) return form.clearedToExercise
    return true
  }

  /* ── Inline step content (NOT component functions) ── */

  const step1Content = (
    <div className="space-y-4">
      <SectionTitle>Personal Information</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Full Name</Label>
          <Input
            value={form.name}
            onChange={(v) => update('name', v)}
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            value={form.email}
            onChange={(v) => update('email', v)}
            type="email"
            placeholder="john@email.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(v) => update('phone', v)}
            placeholder="+852 9123 4567"
          />
        </div>
        <div>
          <Label required>Date of Birth</Label>
          <input
            type="date"
            value={form.dob || ''}
            onChange={(e) => update('dob', e.target.value)}
            className="w-full h-10 bg-navy-input border border-navy-border rounded-lg px-3 text-dark-primary text-sm focus:outline-none focus:border-cyan transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Age</Label>
          <div className="w-full h-10 bg-navy-input border border-navy-border rounded-lg px-3 text-dark-primary text-sm flex items-center">
            {age > 0 ? (
              <span>{age} years</span>
            ) : (
              <span className="text-dark-muted">Auto-calculated</span>
            )}
          </div>
        </div>
        <div>
          <Label required>Gender</Label>
          <CardSelect
            options={[
              { key: 'Male', label: 'Male' },
              { key: 'Female', label: 'Female' },
              { key: 'Other', label: 'Other' },
            ]}
            selected={form.sex}
            onSelect={(k) => update('sex', k as unknown as typeof form.sex)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Emergency Contact Name</Label>
          <Input
            value={form.emergencyContactName}
            onChange={(v) => update('emergencyContactName', v)}
          />
        </div>
        <div>
          <Label>Emergency Contact Phone</Label>
          <Input
            value={form.emergencyContactPhone}
            onChange={(v) => update('emergencyContactPhone', v)}
          />
        </div>
      </div>
    </div>
  )

  const step2Content = (
    <div className="space-y-4">
      <SectionTitle>Primary Goal</SectionTitle>
      <CardSelect
        options={GOAL_OPTIONS.map((g) => ({
          key: g.key,
          label: g.key,
          icon: g.icon,
          color: g.color,
        }))}
        selected={form.goal}
        onSelect={(k) => update('goal', k)}
      />

      <SectionTitle>Secondary Goal</SectionTitle>
      <Select
        value={form.secondaryGoal}
        onChange={(v) => update('secondaryGoal', v)}
        options={['None', ...GOAL_OPTIONS.map((g) => g.key)]}
      />

      <SectionTitle>Experience Level</SectionTitle>
      <CardSelect
        options={EXPERIENCE_OPTIONS.map((e) => ({ key: e, label: e }))}
        selected={form.experienceLevel}
        onSelect={(k) => update('experienceLevel', k)}
      />

      <SectionTitle>Available Equipment</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {EQUIPMENT_OPTIONS.map((item) => {
          const isSelected = form.equipmentAccess.includes(item)
          return (
            <button
              key={item}
              onClick={() => toggleEquipment(item)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-cyan bg-cyan/10'
                  : 'border-dark-border bg-az-black-elevated hover:border-dark-subtle'
              }`}
            >
              <span
                className={`text-xs font-medium ${isSelected ? 'text-cyan' : 'text-dark-primary'}`}
              >
                {item}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Sessions Per Week</Label>
          <Select
            value={form.trainingDaysPerWeek}
            onChange={(v) => update('trainingDaysPerWeek', v)}
            options={TRAINING_DAYS}
          />
        </div>
        <div>
          <Label required>Preferred Time</Label>
          <Select
            value={form.preferredTime}
            onChange={(v) => update('preferredTime', v)}
            options={TIME_OPTIONS}
          />
        </div>
      </div>
    </div>
  )

  const step3Content = (
    <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
      <SectionTitle>Body Measurements</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Weight (kg)</Label>
          <NumberInput
            value={form.weight}
            onChange={(v) => update('weight', v)}
            placeholder="e.g. 75"
          />
        </div>
        <div>
          <Label required>Height (cm)</Label>
          <NumberInput
            value={form.height}
            onChange={(v) => update('height', v)}
            placeholder="e.g. 175"
          />
        </div>
      </div>

      {bmi > 0 && (
        <div className="bg-az-black-elevated border border-dark-border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-secondary">BMI</span>
            <span className="text-sm font-bold" style={{ color: bmiCat.color }}>
              {bmi} — {bmiCat.label}
            </span>
          </div>
        </div>
      )}

      <SectionTitle>Activity Level</SectionTitle>
      <CardSelect
        options={ACTIVITY_LEVELS.map((a) => ({ key: a, label: a }))}
        selected={form.activityLevel}
        onSelect={(k) => update('activityLevel', k)}
      />

      {tdee > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-az-black-elevated border border-cyan/30 rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-cyan">
            <Info size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              TDEE Calculation
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-dark-primary">{bmr}</div>
              <div className="text-[10px] text-dark-secondary">BMR kcal/day</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyan">{tdee}</div>
              <div className="text-[10px] text-dark-secondary">TDEE kcal/day</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-dark-primary">{bmi}</div>
              <div className="text-[10px] text-dark-secondary">BMI</div>
            </div>
          </div>
        </motion.div>
      )}

      <SectionTitle>7-Site Skinfold (mm)</SectionTitle>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {SKINFOLD_SITES.map((site) => (
          <div key={site.key}>
            <Label>{site.label}</Label>
            <NumberInput
              value={form.skinfolds[site.key] || 0}
              onChange={(v) => updateSkinfold(site.key, v)}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <SectionTitle>Optional Additional Sites (mm)</SectionTitle>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {OPTIONAL_SKINFOLDS.map((site) => (
          <div key={site.key}>
            <Label>{site.label}</Label>
            <NumberInput
              value={form.skinfolds[site.key] || 0}
              onChange={(v) => updateSkinfold(site.key, v)}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {(bodyFat > 0 || leanMass > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-az-black-elevated border border-dark-border rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-cyan">
            <Activity size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Body Composition (7-Site)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <div className="text-[10px] text-dark-secondary">Sum of Skinfolds</div>
              <div className="text-sm font-bold text-dark-primary">
                {sum7.toFixed(1)} mm
              </div>
            </div>
            <div>
              <div className="text-[10px] text-dark-secondary">Body Fat</div>
              <div className="text-sm font-bold text-dark-primary">
                {bodyFat.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-dark-secondary">Lean Mass</div>
              <div className="text-sm font-bold text-dark-primary">{leanMass} kg</div>
            </div>
            <div>
              <div className="text-[10px] text-dark-secondary">Fat Mass</div>
              <div className="text-sm font-bold text-dark-primary">{fatMass} kg</div>
            </div>
          </div>
        </motion.div>
      )}

      <div>
        <Label>
          Body Fat % (manual override — leave 0 to use BioPrint calc)
        </Label>
        <NumberInput
          value={form.bodyFatManual}
          onChange={(v) => update('bodyFatManual', v)}
          placeholder="0"
        />
      </div>

      <SectionTitle>Circumference Measurements (cm)</SectionTitle>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {CIRCUMFERENCES.map((c) => (
          <div key={c.key}>
            <Label>{c.label}</Label>
            <NumberInput
              value={form.circumferences[c.key] || 0}
              onChange={(v) => updateCirc(c.key, v)}
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  )

  const step4Content = (
    <div className="space-y-4">
      <SectionTitle>Medical History</SectionTitle>
      <div>
        <Label>Medical Conditions</Label>
        <TextArea
          value={form.medicalConditions}
          onChange={(v) => update('medicalConditions', v)}
          placeholder="List any medical conditions..."
        />
      </div>
      <div>
        <Label>Injuries</Label>
        <TextArea
          value={form.injuries}
          onChange={(v) => update('injuries', v)}
          placeholder="Past or current injuries..."
        />
      </div>
      <div>
        <Label>Medications</Label>
        <TextArea
          value={form.medications}
          onChange={(v) => update('medications', v)}
          placeholder="Current medications..."
        />
      </div>
      <div>
        <Label>Allergies</Label>
        <TextArea
          value={form.allergies}
          onChange={(v) => update('allergies', v)}
          placeholder="Known allergies..."
        />
      </div>

      <SectionTitle>Cleared to Exercise *</SectionTitle>
      <CardSelect
        options={[
          { key: 'Yes', label: 'Yes' },
          { key: 'No', label: 'No' },
          { key: 'With Restrictions', label: 'With Restrictions' },
        ]}
        selected={form.clearedToExercise}
        onSelect={(k) => update('clearedToExercise', k)}
      />

      {form.clearedToExercise === 'With Restrictions' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Label>Restriction Details</Label>
          <TextArea
            value={form.restrictions}
            onChange={(v) => update('restrictions', v)}
            placeholder="Describe restrictions..."
          />
        </motion.div>
      )}

      <SectionTitle>Safety Checklist</SectionTitle>
      <div className="space-y-2">
        {SAFETY_CHECKS.map((check) => (
          <label key={check.key} className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                form.safetyCheckboxes[check.key]
                  ? 'bg-cyan border-cyan'
                  : 'border-dark-border bg-az-black-elevated'
              }`}
            >
              {form.safetyCheckboxes[check.key] && (
                <Check size={10} className="text-white" />
              )}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={!!form.safetyCheckboxes[check.key]}
              onChange={() => toggleSafety(check.key)}
            />
            <span className="text-xs text-dark-primary">{check.label}</span>
          </label>
        ))}
      </div>

      <div>
        <Label>Coach Notes</Label>
        <TextArea
          value={form.notes}
          onChange={(v) => update('notes', v)}
          placeholder="Any other relevant information..."
          rows={4}
        />
      </div>
    </div>
  )

  const step5Content = (
    <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
      <div className="bg-az-black-elevated border border-dark-border rounded-lg p-4">
        <h4 className="text-xs font-semibold text-cyan uppercase tracking-wider mb-2">
          Personal Info
        </h4>
        <ReviewRow label="Name" value={form.name} />
        <ReviewRow label="Email" value={form.email} />
        <ReviewRow label="Phone" value={form.phone} />
        <ReviewRow label="DOB" value={form.dob} />
        <ReviewRow label="Age" value={`${age} years`} />
        <ReviewRow label="Gender" value={form.sex} />
      </div>

      <div className="bg-az-black-elevated border border-dark-border rounded-lg p-4">
        <h4 className="text-xs font-semibold text-cyan uppercase tracking-wider mb-2">
          Goals & Preferences
        </h4>
        <ReviewRow label="Primary Goal" value={form.goal} />
        <ReviewRow label="Secondary Goal" value={form.secondaryGoal} />
        <ReviewRow label="Experience" value={form.experienceLevel} />
        <ReviewRow label="Equipment" value={form.equipmentAccess.join(', ')} />
        <ReviewRow label="Sessions/Week" value={form.trainingDaysPerWeek} />
        <ReviewRow label="Preferred Time" value={form.preferredTime} />
      </div>

      <div className="bg-az-black-elevated border border-dark-border rounded-lg p-4">
        <h4 className="text-xs font-semibold text-cyan uppercase tracking-wider mb-2">
          Body Assessment
        </h4>
        <ReviewRow label="Weight" value={`${form.weight} kg`} />
        <ReviewRow label="Height" value={`${form.height} cm`} />
        <ReviewRow label="BMI" value={`${bmi} (${bmiCat.label})`} />
        <ReviewRow label="BMR" value={`${bmr} kcal/day`} />
        <ReviewRow label="TDEE" value={`${tdee} kcal/day`} />
        <ReviewRow label="Body Fat" value={`${bodyFat.toFixed(1)}%`} />
        <ReviewRow label="Lean Mass" value={`${leanMass} kg`} />
        <ReviewRow label="Sum of Skinfolds" value={`${sum7.toFixed(1)} mm`} />
      </div>

      <div className="bg-az-black-elevated border border-dark-border rounded-lg p-4">
        <h4 className="text-xs font-semibold text-cyan uppercase tracking-wider mb-2">
          Medical
        </h4>
        <ReviewRow label="Medical Conditions" value={form.medicalConditions} />
        <ReviewRow label="Injuries" value={form.injuries} />
        <ReviewRow label="Medications" value={form.medications} />
        <ReviewRow label="Allergies" value={form.allergies} />
        <ReviewRow label="Cleared to Exercise" value={form.clearedToExercise} />
        {form.restrictions && <ReviewRow label="Restrictions" value={form.restrictions} />}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-navy border-navy-border text-dark-primary max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">New Client Intake</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    step >= s.num ? 'bg-cyan text-white' : 'bg-dark-border text-dark-muted'
                  }`}
                >
                  {step > s.num ? <Check size={12} /> : s.num}
                </div>
                <span
                  className={`text-[10px] hidden sm:block ${
                    step >= s.num ? 'text-dark-primary' : 'text-dark-muted'
                  }`}
                >
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className="w-3 h-[2px] bg-dark-border ml-1" />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-dark-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan to-cyan-light"
              initial={{ width: 0 }}
              animate={{ width: `${(step / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && step1Content}
            {step === 2 && step2Content}
            {step === 3 && step3Content}
            {step === 4 && step4Content}
            {step === 5 && step5Content}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-dark-border">
          <Button
            variant="ghost"
            onClick={step > 1 ? () => setStep(step - 1) : onClose}
            className="text-dark-secondary hover:text-dark-primary"
          >
            {step > 1 ? (
              <>
                <ChevronLeft size={14} className="mr-1" /> Back
              </>
            ) : (
              'Cancel'
            )}
          </Button>

          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-cyan hover:bg-cyan-dark text-white disabled:opacity-40"
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-cyan hover:bg-cyan-dark text-white"
            >
              Create Client
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
