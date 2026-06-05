/**
 * Workout API Service Layer
 *
 * All Supabase database calls go through here.
 * Falls back to mock data when Supabase is not configured.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  MOCK_CATEGORIES,
  MOCK_LEVELS,
  MOCK_SET_TYPES,
  MOCK_PROGRAMS,
  MOCK_EXERCISES,
  getMockProgramWithExercises,
} from './mockData'
import type {
  Category,
  Level,
  SetType,
  TrainingSplit,
  PeriodizationPhase,
  MuscleGroup,
  Equipment,
  Program,
  Exercise,
  ProgramExercise,
  ProgramFilters,
  ExerciseFilters,
  ProgramWithExercises,
  ClientProgram,
  WorkoutSession,
  WorkoutSetLog,
} from '../types/workout'

// ── Programs ───────────────────────────────────────────────────────

export async function getPrograms(filters?: ProgramFilters): Promise<Program[]> {
  const offset = filters?.offset ?? 0
  const limit = filters?.limit ?? 50

  if (!isSupabaseConfigured) {
    let result = [...MOCK_PROGRAMS]
    if (filters?.category_id) result = result.filter((p) => p.category_id === filters.category_id)
    if (filters?.level_id) result = result.filter((p) => p.level_id === filters.level_id)
    if (filters?.days_per_week) result = result.filter((p) => p.days_per_week === filters.days_per_week)
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      result = result.filter((p) => p.program_name.toLowerCase().includes(q))
    }
    return result.slice(offset, offset + limit)
  }

  let query = supabase
    .from('program_details')
    .select(`
      program_id:id,
      program_name,
      program_description:description,
      duration_weeks:program_weeks,
      days_per_week:training_days,
      session_duration_minutes:session_minutes,
      training_split:training_split_name,
      periodization_phase:periodization_phase_name,
      category_id,
      level_id,
      training_split_id,
      periodization_phase_id,
      total_workouts,
      total_exercises,
      difficulty_rating:avg_rating,
      avg_rating,
      rating_count,
      is_active,
      is_public,
      is_featured,
      is_premium,
      metadata,
      tags,
      author_name
    `)
    .eq('is_active', true)
    .eq('is_public', true)

  if (filters?.category_id) query = query.eq('category_id', filters.category_id)
  if (filters?.level_id) query = query.eq('level_id', filters.level_id)
  if (filters?.days_per_week) query = query.eq('training_days', filters.days_per_week)
  if (filters?.training_split_id) query = query.eq('training_split_id', filters.training_split_id)
  if (filters?.periodization_phase_id) query = query.eq('periodization_phase_id', filters.periodization_phase_id)
  if (filters?.duration_weeks) query = query.eq('program_weeks', filters.duration_weeks)

  const { data, error } = await query.order('program_name').range(offset, offset + limit - 1)

  if (error) throw error
  return (data as Program[]) || []
}

export async function getProgramById(programId: number): Promise<Program | null> {
  if (!isSupabaseConfigured) {
    return MOCK_PROGRAMS.find((p) => p.program_id === programId) || null
  }

  const { data, error } = await supabase
    .from('program_details')
    .select(`
      program_id:id,
      program_name,
      program_description:description,
      duration_weeks:program_weeks,
      days_per_week:training_days,
      session_duration_minutes:session_minutes,
      training_split:training_split_name,
      periodization_phase:periodization_phase_name,
      category_id,
      level_id,
      training_split_id,
      periodization_phase_id,
      total_workouts,
      total_exercises,
      difficulty_rating:avg_rating,
      avg_rating,
      rating_count,
      is_active,
      is_public,
      is_featured,
      is_premium,
      metadata,
      tags,
      author_name
    `)
    .eq('id', programId)
    .single()

  if (error) throw error
  return data as Program | null
}

export async function getProgramWithExercises(programId: number): Promise<ProgramWithExercises | null> {
  if (!isSupabaseConfigured) {
    return getMockProgramWithExercises(programId)
  }

  // Get program details from view with aliases
  const { data: program, error: pError } = await supabase
    .from('program_details')
    .select(`
      program_id:id,
      program_name,
      program_description:description,
      duration_weeks:program_weeks,
      days_per_week:training_days,
      session_duration_minutes:session_minutes,
      training_split:training_split_name,
      periodization_phase:periodization_phase_name,
      category_id,
      level_id,
      total_workouts,
      total_exercises,
      difficulty_rating:avg_rating,
      avg_rating,
      rating_count,
      is_active,
      is_public,
      is_featured,
      is_premium,
      metadata,
      tags,
      author_name
    `)
    .eq('id', programId)
    .single()

  if (pError) throw pError
  if (!program) return null

  // Get all exercises for this program with exercise details
  // Use actual DB column names (id, order_index, reps_preset, etc.)
  const { data: exercises, error: eError } = await supabase
    .from('program_exercises')
    .select(`
      id,
      program_id,
      day_number,
      order_index,
      exercise_id,
      set_type_id,
      sets,
      reps_preset,
      tempo_preset,
      rest_seconds,
      load_value,
      notes,
      exercises(id,name,equipment_id,equipment!equipment_id(name)),
      set_types(id,name)
    `)
    .eq('program_id', programId)
    .order('day_number', { ascending: true })
    .order('order_index', { ascending: true })

  if (eError) throw eError

  // Group by day
  const dayMap = new Map<number, ProgramExercise[]>()
  for (const ex of (exercises || [])) {
    const day = ex.day_number as number
    if (!dayMap.has(day)) dayMap.set(day, [])

    // Flatten the joined data — Supabase returns single object for 1:1 joins
    const exerciseData = Array.isArray(ex.exercises) ? ex.exercises[0] : ex.exercises
    const setTypeData = Array.isArray(ex.set_types) ? ex.set_types[0] : ex.set_types
    const equipmentRaw = exerciseData?.equipment
    const equipmentData = Array.isArray(equipmentRaw) ? equipmentRaw[0] : equipmentRaw

    dayMap.get(day)!.push({
      program_exercise_id: ex.id as number,
      program_id: ex.program_id as number,
      day_number: day,
      exercise_order: ex.order_index as number,
      exercise_id: ex.exercise_id as number,
      set_type_id: ex.set_type_id as number,
      sets: ex.sets as number,
      reps: ex.reps_preset as string,
      tempo: ex.tempo_preset as string | undefined,
      rest_seconds: ex.rest_seconds as number,
      rpe_target: ex.load_value as number | undefined,
      notes: ex.notes as string | undefined,
      exercise_name: exerciseData?.name as string | undefined,
      equipment_primary: equipmentData?.name as string | undefined,
      set_type_name: setTypeData?.name as string | undefined,
    })
  }

  const days = Array.from(dayMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([day_number, dayExercises]) => ({
      day_number,
      day_label: `Day ${day_number}`,
      exercises: dayExercises,
    }))

  return { program: program as Program, days }
}

// ── Exercises ──────────────────────────────────────────────────────

export async function searchExercises(query: string, filters?: ExerciseFilters): Promise<Exercise[]> {
  if (!isSupabaseConfigured) {
    let result = [...MOCK_EXERCISES]
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (e) =>
          e.exercise_name.toLowerCase().includes(q) ||
          (e.equipment_primary && e.equipment_primary.toLowerCase().includes(q))
      )
    }
    if (filters?.equipment_id) {
      // Simplified mock filter
    }
    return result
  }

  let dbQuery = supabase
    .from('exercise_details')
    .select(`
      exercise_id:id,
      exercise_name,
      exercise_type,
      equipment_primary:equipment_name,
      movement_pattern,
      difficulty,
      mechanics,
      force_type,
      is_active
    `)
    .eq('is_active', true)

  if (query) {
    dbQuery = dbQuery.ilike('exercise_name', `%${query}%`)
  }
  if (filters?.movement_pattern) {
    dbQuery = dbQuery.eq('movement_pattern', filters.movement_pattern)
  }
  if (filters?.exercise_type) {
    dbQuery = dbQuery.eq('exercise_type', filters.exercise_type)
  }

  const { data, error } = await dbQuery.limit(50)

  if (error) throw error
  return (data as Exercise[]) || []
}

export async function getExerciseById(exerciseId: number): Promise<Exercise | null> {
  if (!isSupabaseConfigured) {
    return MOCK_EXERCISES.find((e) => e.exercise_id === exerciseId) || null
  }

  const { data, error } = await supabase
    .from('exercise_details')
    .select(`
      exercise_id:id,
      exercise_name,
      exercise_type,
      equipment_primary:equipment_name,
      movement_pattern,
      difficulty,
      mechanics,
      force_type,
      description,
      instructions,
      is_active
    `)
    .eq('id', exerciseId)
    .single()

  if (error) throw error
  return data as Exercise | null
}

// ── Reference Data ─────────────────────────────────────────────────

export interface ReferenceData {
  categories: Category[]
  levels: Level[]
  setTypes: SetType[]
  splits: TrainingSplit[]
  phases: PeriodizationPhase[]
  equipment: Equipment[]
  muscleGroups: MuscleGroup[]
}

export async function getReferenceData(): Promise<ReferenceData> {
  if (!isSupabaseConfigured) {
    return {
      categories: MOCK_CATEGORIES,
      levels: MOCK_LEVELS,
      setTypes: MOCK_SET_TYPES,
      splits: [],
      phases: [],
      equipment: [],
      muscleGroups: [],
    }
  }

  const [
    categoriesRes,
    levelsRes,
    setTypesRes,
    splitsRes,
    phasesRes,
    equipmentRes,
    muscleGroupsRes,
  ] = await Promise.all([
    supabase.from('categories').select('category_id:id, category_name:name, slug, description, icon, sort_order, is_active').eq('is_active', true).order('sort_order'),
    supabase.from('levels').select('level_id:id, level_name:name, slug, description, sort_order, is_active').eq('is_active', true).order('sort_order'),
    supabase.from('set_types').select('set_type_id:id, set_type_name:name, set_type_code:slug, description, category, is_active').eq('is_active', true).order('id'),
    supabase.from('training_splits').select('split_id:id, split_name:name, split_code:slug, description, days_count, is_active').eq('is_active', true).order('id'),
    supabase.from('periodization_phases').select('phase_id:id, phase_name:name, phase_type:slug, code, description, sort_order, duration_weeks, is_active').eq('is_active', true).order('id'),
    supabase.from('equipment').select('equipment_id:id, equipment_name:name, slug, equipment_category:category, description, is_active').eq('is_active', true).order('name'),
    supabase.from('muscle_groups').select('muscle_group_id:id, muscle_group_name:name, slug, body_region, area, is_primary, description, sort_order, is_active').eq('is_active', true).order('name'),
  ])

  return {
    categories: (categoriesRes.data as Category[]) || [],
    levels: (levelsRes.data as Level[]) || [],
    setTypes: (setTypesRes.data as SetType[]) || [],
    splits: (splitsRes.data as TrainingSplit[]) || [],
    phases: (phasesRes.data as PeriodizationPhase[]) || [],
    equipment: (equipmentRes.data as Equipment[]) || [],
    muscleGroups: (muscleGroupsRes.data as MuscleGroup[]) || [],
  }
}

// ── Client Programs ────────────────────────────────────────────────

export async function assignProgramToClient(
  clientId: string,
  programId: number,
  startDate: string
): Promise<ClientProgram> {
  if (!isSupabaseConfigured) {
    return {
      client_id: clientId,
      program_id: programId,
      start_date: startDate,
      status: 'active',
      current_week: 1,
      current_day: 1,
    }
  }

  const { data, error } = await supabase
    .from('client_programs')
    .insert({
      client_id: clientId,
      program_id: programId,
      start_date: startDate,
      status: 'active',
      current_week: 1,
      current_day: 1,
    })
    .select()
    .single()

  if (error) throw error
  return data as ClientProgram
}

export async function getClientPrograms(clientId: string): Promise<ClientProgram[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  const { data, error } = await supabase
    .from('client_programs')
    .select('*, programs(*)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as ClientProgram[]) || []
}

// ── Workout Logging ────────────────────────────────────────────────

export async function logWorkoutSession(session: Omit<WorkoutSession, 'session_id'>): Promise<WorkoutSession> {
  if (!isSupabaseConfigured) {
    return { ...session, session_id: Math.floor(Math.random() * 100000) }
  }

  const { data, error } = await supabase.from('workout_sessions').insert(session).select().single()
  if (error) throw error
  return data as WorkoutSession
}

export async function logWorkoutSets(sets: Omit<WorkoutSetLog, 'set_log_id'>[]): Promise<WorkoutSetLog[]> {
  if (!isSupabaseConfigured) {
    return sets.map((s, i) => ({ ...s, set_log_id: i + 1 }))
  }

  const { data, error } = await supabase.from('workout_set_logs').insert(sets).select()
  if (error) throw error
  return (data as WorkoutSetLog[]) || []
}

export async function getWorkoutHistory(clientId: string, programId?: number): Promise<WorkoutSession[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  let query = supabase.from('workout_sessions').select('*').eq('client_id', clientId)
  if (programId) query = query.eq('program_id', programId)

  const { data, error } = await query.order('completed_at', { ascending: false })
  if (error) throw error
  return (data as WorkoutSession[]) || []
}
