/**
 * Workout Module TypeScript Interfaces
 * Mirrors the Supabase database schema for the 320-program workout database
 */

// ── Reference Tables ───────────────────────────────────────────────

export interface Category {
  category_id: number
  category_name: string
  category_description?: string
  sort_order?: number
  is_active?: boolean
}

export interface Level {
  level_id: number
  level_name: string
  level_description?: string
  sort_order?: number
  is_active?: boolean
}

export interface SetType {
  set_type_id: number
  set_type_name: string
  set_type_code: string
  description?: string
  is_active?: boolean
}

export interface Equipment {
  equipment_id: number
  equipment_name: string
  equipment_category?: string
  is_active?: boolean
}

export interface TrainingSplit {
  split_id: number
  split_name: string
  split_code: string
  description?: string
  typical_days?: number
  is_active?: boolean
}

export interface PeriodizationPhase {
  phase_id: number
  phase_name: string
  phase_type?: string
  duration_weeks?: number
  is_active?: boolean
}

export interface MuscleGroup {
  muscle_group_id: number
  muscle_group_name: string
  body_region?: string
  is_active?: boolean
}

// ── Core Tables ────────────────────────────────────────────────────

export interface Program {
  program_id: number
  category_id: number
  level_id: number
  program_name: string
  program_description?: string
  duration_weeks: number
  days_per_week: number
  training_split?: string
  periodization_phase?: string
  session_duration_minutes: number
  total_workouts: number
  difficulty_rating: number
  target_audience?: string
  expected_outcomes?: string
  is_active?: boolean
  is_public?: boolean
  created_at?: string
  updated_at?: string
  // Joined fields from views
  category_name?: string
  level_name?: string
}

export interface Exercise {
  exercise_id: number
  exercise_name: string
  exercise_category?: string
  equipment_primary?: string
  equipment_secondary?: string
  movement_pattern?: string
  difficulty_beginner?: boolean
  difficulty_intermediate?: boolean
  difficulty_advanced?: boolean
  difficulty_elite?: boolean
  mechanics?: string
  force_type?: string
  exercise_type?: string
  instructions_brief?: string
  is_active?: boolean
  // Joined fields from views
  equipment_name?: string
  equipment_category?: string
  target_muscles?: string
}

export interface ProgramExercise {
  program_exercise_id: number
  program_id: number
  day_number: number
  exercise_order: number
  exercise_id: number
  set_type_id: number
  sets: number
  reps: string
  tempo?: string
  rest_seconds: number
  rpe_target?: number
  notes?: string
  // Joined fields
  exercise_name?: string
  equipment_primary?: string
  set_type_name?: string
  set_type_code?: string
  letter_notation?: string
}

export interface ExerciseMuscle {
  exercise_id: number
  muscle_group_id: number
  role: 'primary' | 'secondary' | 'synergist'
  muscle_group_name?: string
  body_region?: string
}

// ── Client Assignment ──────────────────────────────────────────────

export interface ClientProgram {
  client_program_id?: number
  client_id: string
  program_id: number
  start_date: string
  end_date?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  current_week: number
  current_day: number
  assigned_by?: string
  created_at?: string
  updated_at?: string
  // Joined fields
  program_name?: string
  program_description?: string
  duration_weeks?: number
  days_per_week?: number
}

// ── Workout Logging ────────────────────────────────────────────────

export interface WorkoutSession {
  session_id?: number
  client_id: string
  client_program_id: number
  program_id: number
  day_number: number
  week_number: number
  completed_at?: string
  duration_seconds?: number
  notes?: string
  created_at?: string
}

export interface WorkoutSetLog {
  set_log_id?: number
  session_id: number
  program_exercise_id: number
  exercise_id: number
  set_number: number
  prescribed_sets: number
  prescribed_reps: string
  prescribed_tempo?: string
  prescribed_rest_seconds: number
  prescribed_rpe_target?: number
  actual_load?: number
  actual_reps?: number
  actual_rpe?: number
  is_completed: boolean
  created_at?: string
}

// ── API Filter Types ───────────────────────────────────────────────

export interface ProgramFilters {
  category_id?: number
  level_id?: number
  days_per_week?: number
  training_split_id?: number
  periodization_phase_id?: number
  duration_weeks?: number
  searchQuery?: string
  offset?: number
  limit?: number
}

export interface ExerciseFilters {
  searchTerm?: string
  equipment_id?: number
  movement_pattern?: string
  difficulty?: string
  exercise_type?: string
  body_region?: string
  muscle_group_id?: number
}

// ── UI State Types ─────────────────────────────────────────────────

export interface BuilderWizardState {
  step: 1 | 2 | 3
  selectedClientId: string | null
  selectedCategoryId: number | null
  selectedLevelId: number | null
  selectedDaysPerWeek: number | null
  selectedSessionLength: number | null
  matchingPrograms: Program[]
  selectedProgramId: number | null
}

export interface DayExercises {
  day_number: number
  day_label?: string
  exercises: ProgramExerciseWithNotation[]
}

export interface ProgramExerciseWithNotation extends ProgramExercise {
  letter?: string
}

export interface ProgramWithExercises {
  program: Program
  days: DayExercises[]
}

// ── 1RM Types ──────────────────────────────────────────────────────

export type OneRMFormula = 'epley' | 'brzycki' | 'lombardi' | 'mayhew'

export interface OneRMResult {
  formula: OneRMFormula
  oneRM: number
  percentages: { percent: number; weight: number }[]
}
