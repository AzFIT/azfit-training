/**
 * Program Builder v2 — Type Definitions
 * Based on the 12 AzFIT phases extracted from Excel
 */

// ─────────────────────────────────────────────
// Phase / Template Types
// ─────────────────────────────────────────────

export interface PhaseTemplateExercise {
  orderNotation: string
  exerciseName: string
  reps: string
  sets: number
  tempo: string
  tut: number | null
  restSeconds: number
  restDisplay: string
  videoLink: string | null
  motionCategory?: string
}

export interface PhaseTemplateSession {
  sessionNumber: number
  sessionName: string
  focus: string
  exercises: PhaseTemplateExercise[]
}

export interface PhaseTemplate {
  phaseCode: string
  phaseName: string
  method: string
  durationWeeks: number
  sessions: PhaseTemplateSession[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  focusArea?: string
  description?: string
  sortOrder: number
}

// ─────────────────────────────────────────────
// Builder State Types
// ─────────────────────────────────────────────

export interface ClientContext {
  clientId: string | null
  clientName: string
  startDate: string
  goal: string
  experience: string
  availableDays: string[]
  sessionDuration: number
}

export interface SessionExercise extends PhaseTemplateExercise {
  exerciseId: number
  isModified: boolean
  isSubstituted: boolean
  originalExerciseId: number
  notes: string
}

export interface BuilderSession {
  sessionNumber: number
  sessionName: string
  focus: string
  exercises: SessionExercise[]
}

export interface ExerciseModification {
  orderNotation: string
  sessionNumber: number
  field: 'sets' | 'reps' | 'tempo' | 'restSeconds' | 'notes' | 'multi'
  oldValue: unknown
  newValue: unknown
}

export interface BuilderState {
  // Phase selection
  phaseCode: string | null
  phaseName: string
  method: string
  durationWeeks: number

  // Client context
  clientContext: ClientContext

  // Sessions (mutable working copy)
  sessions: BuilderSession[]
  activeSessionIndex: number

  // Modifications tracking
  modifications: {
    swappedExercises: Map<string, number> // key: "sessionNumber-orderNotation" → new exerciseId
    editedParameters: Map<string, ExerciseModification>
    addedExercises: SessionExercise[]
    deletedExercises: string[] // "sessionNumber-orderNotation"
  }

  // UI
  isLoading: boolean
  saveError: string | null
}

// ─────────────────────────────────────────────
// Filter Types
// ─────────────────────────────────────────────

export type MethodFilter = 'all' | 'GBC' | 'Structural Balance' | 'Relative Strength' | 'Functional Hypertrophy' | 'Hypertrophy' | 'Metabolic' | 'Maintenance'
export type DurationFilter = 'all' | '2' | '3' | '4' | '6' | '8' | '12' | '16'
export type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced'

export interface PhaseFilters {
  method: MethodFilter
  duration: DurationFilter
  difficulty: DifficultyFilter
  search: string
}

// ─────────────────────────────────────────────
// Custom Program (for "My Custom Programs" section)
// ─────────────────────────────────────────────

export interface CustomProgram {
  id: string
  name: string
  basedOnPhaseCode: string
  basedOnPhaseName: string
  clientName: string | null
  modifiedAt: string
  exerciseCount: number
  sessionCount: number
}
