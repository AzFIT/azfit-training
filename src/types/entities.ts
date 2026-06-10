/**
 * Unified Entity Types — Single Source of Truth
 *
 * All domain entities are defined here with consistent naming and shapes.
 * These types replace the fragmented Client/Program types scattered across
 * stores and component files.
 */

// ── Shared ─────────────────────────────────────────────────────────

export type EntityStatus = 'active' | 'inactive' | 'on-hold'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'elite'

// ── Client ─────────────────────────────────────────────────────────

export interface Client {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
  status: EntityStatus
  joinDate: string // ISO date
  lastActive: string // ISO date
  phone?: string

  // Body metrics
  age: number
  sex?: 'male' | 'female'
  weight: number // kg
  height: number // cm
  bodyFat: number // percentage
  goal: string

  // Program tracking
  currentProgramId?: string
  programName: string
  programProgress: number // 0-100
  complianceScore: number // 0-100
  sessionsCompleted: number
}

// ── Program ────────────────────────────────────────────────────────

export interface Program {
  id: string
  name: string
  description: string
  tags: string[]

  // Classification
  goal: string
  difficulty: Difficulty
  durationWeeks: number
  daysPerWeek: number
  sessionDurationMinutes: number
  trainingSplit?: string
  periodizationPhase?: string

  // Optional DB-aligned fields
  categoryId?: number
  levelId?: number
  difficultyRating?: number // 1-10

  // Workout-module aligned fields
  totalWorkouts?: number
  totalExercises?: number
  targetAudience?: string
  expectedOutcomes?: string
  categoryName?: string
  levelName?: string
  isActive?: boolean
  isPublic?: boolean
  isFeatured?: boolean
  isPremium?: boolean
  metadata?: Record<string, unknown>
  authorName?: string

  // Tracking
  timesUsed: number
  lastAssigned: string | null // ISO date
  createdAt: string
  updatedAt: string
}

// ── Exercise ───────────────────────────────────────────────────────

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  difficulty: Difficulty
  description: string
  videoUrl?: string

  // Workout-module aligned fields
  exerciseCategory?: string
  equipmentPrimary?: string
  equipmentSecondary?: string
  movementPattern?: string
  mechanics?: string
  forceType?: string
  exerciseType?: string
  instructionsBrief?: string
  difficultyBeginner?: boolean
  difficultyIntermediate?: boolean
  difficultyAdvanced?: boolean
  difficultyElite?: boolean
}

// ── Calendar Session ───────────────────────────────────────────────

export type SessionType = 'session' | 'assessment' | 'follow-up' | 'personal' | 'group'
export type SessionStatus = 'confirmed' | 'pending' | 'cancelled' | 'in-progress' | 'completed'

export interface CalendarSession {
  id: string
  clientId: string
  clientName: string
  title: string
  date: string // ISO date
  startTime: string // HH:mm
  endTime: string // HH:mm
  type: SessionType
  status: SessionStatus
  notes?: string
  color?: string
}

// ── Client-Program Assignment ──────────────────────────────────────

export type AssignmentStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export interface ClientProgramAssignment {
  id: string
  clientId: string
  programId: string
  startDate: string
  endDate?: string
  status: AssignmentStatus
  currentWeek: number
  currentDay: number
  assignedBy?: string
}

// ── TDEE / Nutrition Entry ─────────────────────────────────────────

export type DietPreset = 'balanced' | 'low-carb' | 'high-carb' | 'high-protein'

export interface NutritionEntry {
  id: string
  clientId: string
  date: string
  gender: 'male' | 'female'
  age: number
  weight: number
  height: number
  activityLevel: string
  goal: string
  bmr: number
  tdee: number
  targetCalories: number
  dietPreset: DietPreset
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  notes?: string
}

// ── BioPrint Entry (12-site skinfold) ──────────────────────────────

export interface BioPrintEntry {
  id: string
  clientId: string
  date: string
  assessor: string
  // 12 Poliquin sites
  chin: number
  cheek: number
  pec: number
  tricep: number
  subscapular: number
  midaxillary: number
  suprailiac: number
  umbilical: number
  knee: number
  patellar: number
  hamstring: number
  medialCalf: number
  // Computed
  sum12: number
  bodyFatPercent: number
  leanMass: number
  fatMass: number
  weight: number
  notes?: string
}

// ── Body Stats Entry ───────────────────────────────────────────────

export interface BodyStatsEntry {
  id: string
  clientId: string
  date: string
  weight: number
  neck: number
  shoulder: number
  chest: number
  waist: number
  hips: number
  thigh: number
  calf: number
  arm: number
  bodyFatPercent: number
  bmi: number
  whr: number
  notes?: string
}

// ── Workout Session Log ────────────────────────────────────────────

export interface WorkoutSet {
  setNumber: number
  prescribedSets: number
  prescribedReps: string
  prescribedLoad?: number
  prescribedRpe?: number
  actualLoad?: number
  actualReps?: number
  actualRpe?: number
  completed: boolean
}

export interface WorkoutSessionLog {
  id: string
  clientId: string
  programId: string
  programName: string
  dayNumber: number
  weekNumber: number
  date: string
  durationSeconds: number
  exercises: {
    exerciseId: string
    exerciseName: string
    notation: string
    sets: WorkoutSet[]
  }[]
  notes?: string
}

// ── Progress Entry ─────────────────────────────────────────────────

export interface ProgressEntry {
  id: string
  clientId: string
  date: string
  weight?: number
  bodyFat?: number
  measurements?: Record<string, number>
  notes?: string
}

// ── Alert / Follow-up ──────────────────────────────────────────────

export type AlertPriority = 'high' | 'medium' | 'low'

export interface ClientAlert {
  id: string
  clientId: string
  clientName: string
  clientInitials: string
  priority: AlertPriority
  type: string
  message: string
  action: string
  createdAt: string
  resolved?: boolean
}

// ── Notification ───────────────────────────────────────────────────

export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'alert'
  | 'message'
  | 'system'
  | 'session'
  | 'client'
  | 'milestone'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  timestamp: number
  clientId?: string
  clientName?: string
  clientInitials?: string
}

// ── Client Goal ────────────────────────────────────────────────────

export type GoalStatus = 'On Track' | 'At Risk' | 'Completed'

export interface ClientGoal {
  id: string
  clientId: string
  title: string
  category: string
  target: string
  current: string
  start: string
  deadline: string
  status: GoalStatus
  progress: number // 0-100
  createdAt: string
  completedAt?: string
}

// ── Client Note ────────────────────────────────────────────────────

export interface ClientNote {
  id: string
  clientId: string
  title: string
  content: string
  author: string
  date: string
  category: string
  important: boolean
}

// ── Progress Photo ─────────────────────────────────────────────────

export type PhotoCategory = 'Front' | 'Back' | 'Side' | 'Other'

export interface ClientPhoto {
  id: string
  clientId: string
  url: string
  thumbnailUrl: string
  date: string
  category: PhotoCategory
  notes?: string
  weight?: number
  bodyFatPercentage?: number
  trainerNotes?: string
  isMilestone?: boolean
  isGoalAchieved?: boolean
  createdAt: string
}

// ── Reference Data (from workout DB) ───────────────────────────────

export interface WorkoutCategory {
  categoryId: number
  categoryName: string
  description?: string
}

export interface WorkoutLevel {
  levelId: number
  levelName: string
  description?: string
}

export interface TrainingMethod {
  id: string
  name: string
  shortName: string
  description: string
  goals: string[]
  difficulty: Difficulty
  duration: number
  frequency: number
  equipment: string[]
}
