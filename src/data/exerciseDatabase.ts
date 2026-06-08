/**
 * Canonical Exercise & Program Database
 *
 * Imported from AzFIT_Database_Restructured.xlsx (02_DATABASE/)
 * - 200 exercises with full metadata
 * - 84 programs with classifications
 * - 33 muscle groups, 46 equipment types
 * - 10 program-exercise mappings
 *
 * Also includes Smart Matching Pipeline from Complete linking categories_FIXED.xlsx:
 * - 38 goals across 3 categories
 * - 39 training methods across 5 categories
 * - 48 programs with tag-based scoring
 * - Top 10 recommendations per goal
 */

import rawDb from './exercise-db.json'
import rawPipeline from './pipeline-db.json'

// ── Types ─────────────────────────────────────────────────────────

export interface Exercise {
  id: string
  name: string
  primaryMuscle: string
  secondaryMuscle: string
  equipment: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  type: 'Compound' | 'Isolation' | 'Olympic' | 'Plyo' | 'Isometric'
  videoUrl: string
  description: string
  safetyNotes: string
  metValue: number
  isActive: boolean
}

export interface ProgramTemplate {
  id: string
  name: string
  sets: string
  reps: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  durationWeeks: number
  frequency: number
  split: string
  focus: string
  totalSessions: number
  avgTimeMin: number
  equipmentNeeded: string
  description: string
  isActive: boolean
}

export interface MuscleGroup {
  id: string
  name: string
  bodyRegion: 'Upper' | 'Lower' | 'Core'
  isPrimary: boolean
}

export interface EquipmentItem {
  id: string
  name: string
  category: string
  isAvailable: boolean
}

export interface Goal {
  item: string
  category: string
  tags: string
}

export interface TrainingMethod {
  item: string
  category: string
  tags: string
}

export interface ProgramRecommendation {
  program: string
  method: string
  score: number
}

// ── Transformers ──────────────────────────────────────────────────

function transformExercise(raw: Record<string, unknown>): Exercise {
  return {
    id: String(raw.Exercise_ID || ''),
    name: String(raw.Name || ''),
    primaryMuscle: String(raw.Primary_Muscle || ''),
    secondaryMuscle: String(raw.Secondary_Muscle || ''),
    equipment: String(raw.Equipment || ''),
    difficulty: String(raw.Difficulty || 'Intermediate') as Exercise['difficulty'],
    type: String(raw.Type || 'Compound') as Exercise['type'],
    videoUrl: String(raw.Video_URL || ''),
    description: String(raw.Description || ''),
    safetyNotes: String(raw.Safety_Notes || ''),
    metValue: Number(raw.MET_Value || 0),
    isActive: String(raw.Is_Active) === 'TRUE',
  }
}

function transformProgram(raw: Record<string, unknown>): ProgramTemplate {
  return {
    id: String(raw.Program_ID || ''),
    name: String(raw.Name || ''),
    sets: String(raw.Sets || ''),
    reps: String(raw.Reps || ''),
    category: String(raw.Category || ''),
    level: String(raw.Level || 'Intermediate') as ProgramTemplate['level'],
    durationWeeks: Number(raw.Duration_wk || 0),
    frequency: Number(raw.Frequency || 0),
    split: String(raw.Split || ''),
    focus: String(raw.Focus || ''),
    totalSessions: Number(raw.Total_Sessions || 0),
    avgTimeMin: Number(raw.Avg_Time_min || 0),
    equipmentNeeded: String(raw.Equipment_Needed || ''),
    description: String(raw.Description || ''),
    isActive: String(raw.Is_Active) === 'TRUE',
  }
}

function transformMuscle(raw: Record<string, unknown>): MuscleGroup {
  return {
    id: String(raw.Muscle_ID || ''),
    name: String(raw.Muscle_Name || ''),
    bodyRegion: String(raw.Body_Region || 'Upper') as MuscleGroup['bodyRegion'],
    isPrimary: String(raw.Is_Primary) === 'TRUE',
  }
}

function transformEquipment(raw: Record<string, unknown>): EquipmentItem {
  return {
    id: String(raw.Equipment_ID || ''),
    name: String(raw.Equipment_Name || ''),
    category: String(raw.Category || ''),
    isAvailable: String(raw.Is_Available) === 'TRUE',
  }
}

// ── Exported Data ─────────────────────────────────────────────────

export const EXERCISES: Exercise[] = (rawDb.exercises as Record<string, unknown>[]).map(transformExercise)

export const PROGRAM_TEMPLATES: ProgramTemplate[] = (rawDb.programs as Record<string, unknown>[]).map(transformProgram)

export const MUSCLE_GROUPS: MuscleGroup[] = (rawDb.muscles as Record<string, unknown>[]).map(transformMuscle)

export const EQUIPMENT_LIST: EquipmentItem[] = (rawDb.equipment as Record<string, unknown>[]).map(transformEquipment)

export const GOALS: Goal[] = rawPipeline.goals as Goal[]

export const TRAINING_METHODS: TrainingMethod[] = rawPipeline.methods as TrainingMethod[]

export const PIPELINE_RECOMMENDATIONS: Record<string, ProgramRecommendation[]> =
  rawPipeline.recommendations as Record<string, ProgramRecommendation[]>

// ── Lookup Helpers ────────────────────────────────────────────────

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id)
}

export function getExercisesByMuscle(muscle: string): Exercise[] {
  return EXERCISES.filter((e) => e.primaryMuscle === muscle || e.secondaryMuscle === muscle)
}

export function getExercisesByEquipment(equipment: string): Exercise[] {
  return EXERCISES.filter((e) => e.equipment === equipment)
}

export function getExercisesByDifficulty(difficulty: string): Exercise[] {
  return EXERCISES.filter((e) => e.difficulty === difficulty)
}

export function getProgramById(id: string): ProgramTemplate | undefined {
  return PROGRAM_TEMPLATES.find((p) => p.id === id)
}

export function getProgramsByCategory(category: string): ProgramTemplate[] {
  return PROGRAM_TEMPLATES.filter((p) => p.category === category)
}

export function getProgramsByLevel(level: string): ProgramTemplate[] {
  return PROGRAM_TEMPLATES.filter((p) => p.level === level)
}

export function getProgramsByGoal(goal: string): ProgramTemplate[] {
  const recs = PIPELINE_RECOMMENDATIONS[goal] || []
  const programNames = new Set(recs.map((r) => r.program))
  return PROGRAM_TEMPLATES.filter((p) => programNames.has(p.name))
}

export function searchExercises(query: string): Exercise[] {
  const q = query.toLowerCase()
  return EXERCISES.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.primaryMuscle.toLowerCase().includes(q) ||
      e.equipment.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
  )
}

export function searchPrograms(query: string): ProgramTemplate[] {
  const q = query.toLowerCase()
  return PROGRAM_TEMPLATES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.focus.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  )
}

// ── Stats ─────────────────────────────────────────────────────────

export const DB_STATS = {
  totalExercises: EXERCISES.length,
  totalPrograms: PROGRAM_TEMPLATES.length,
  totalMuscleGroups: MUSCLE_GROUPS.length,
  totalEquipment: EQUIPMENT_LIST.length,
  totalGoals: GOALS.length,
  totalTrainingMethods: TRAINING_METHODS.length,
  categories: [...new Set(PROGRAM_TEMPLATES.map((p) => p.category))],
  difficulties: [...new Set(EXERCISES.map((e) => e.difficulty))],
  equipmentTypes: [...new Set(EXERCISES.map((e) => e.equipment))],
  muscleGroups: [...new Set(EXERCISES.map((e) => e.primaryMuscle))],
}
