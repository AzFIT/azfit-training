/**
 * Workout API Service Layer
 *
 * Bridges the workout module to useAppDataStore (central store).
 * When Supabase is configured, calls go to the DB.
 * When offline, reads/writes go to useAppDataStore with localStorage persistence.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAppDataStore } from '../stores/useAppDataStore'
import type {
  Category,
  Level,
  SetType,
  Program as WorkoutProgram,
  Exercise as WorkoutExercise,
  ProgramFilters,
  ExerciseFilters,
  ProgramWithExercises,
  ProgramExercise,
  ClientProgram,
  WorkoutSession,
  WorkoutSetLog,
} from '../types/workout'
import type { Program as EntityProgram, Exercise as EntityExercise, WorkoutSessionLog } from '../types/entities'

// ── Type Converters ────────────────────────────────────────────────

let _programIdCounter = 0
const nextProgramId = () => ++_programIdCounter

let _exerciseIdCounter = 1000
const nextExerciseId = () => ++_exerciseIdCounter

function toWorkoutProgram(p: EntityProgram): WorkoutProgram {
  return {
    program_id: Number(p.id.replace(/\D/g, '')) || nextProgramId(),
    program_name: p.name,
    program_description: p.description,
    category_id: p.categoryId ?? 1,
    level_id: p.levelId ?? 1,
    duration_weeks: p.durationWeeks,
    days_per_week: p.daysPerWeek,
    session_duration_minutes: p.sessionDurationMinutes,
    training_split: p.trainingSplit ?? 'Full Body',
    periodization_phase: p.periodizationPhase ?? 'Base',
    total_workouts: p.totalWorkouts ?? p.durationWeeks * p.daysPerWeek,
    // total_exercises not in workout Program type
    difficulty_rating: p.difficultyRating ?? 5,
    target_audience: p.targetAudience ?? '',
    expected_outcomes: p.expectedOutcomes ?? '',
    category_name: p.categoryName ?? '',
    level_name: p.levelName ?? '',
    is_active: p.isActive ?? true,
    is_public: p.isPublic ?? true,
  }
}

function toWorkoutExercise(e: EntityExercise): WorkoutExercise {
  return {
    exercise_id: Number(e.id.replace(/\D/g, '')) || nextExerciseId(),
    exercise_name: e.name,
    exercise_category: e.exerciseCategory ?? 'Compound',
    equipment_primary: e.equipmentPrimary ?? e.equipment,
    movement_pattern: e.movementPattern ?? 'Other',
    // difficulty mapped via boolean flags below
    mechanics: e.mechanics ?? 'Compound',
    force_type: e.forceType ?? 'Push',
    exercise_type: e.exerciseType ?? 'Strength',
    instructions_brief: e.instructionsBrief ?? e.description,
    is_active: true,
  }
}

// Helper to read store data synchronously (wrapped in getState)
function getStore() {
  return useAppDataStore.getState()
}

// ── Programs ───────────────────────────────────────────────────────

export async function getPrograms(filters?: ProgramFilters): Promise<WorkoutProgram[]> {
  if (isSupabaseConfigured) {
    const offset = filters?.offset ?? 0
    const limit = filters?.limit ?? 50
    let query = supabase.from('program_details').select('*').eq('is_active', true).eq('is_public', true)
    if (filters?.category_id) query = query.eq('category_id', filters.category_id)
    if (filters?.level_id) query = query.eq('level_id', filters.level_id)
    if (filters?.days_per_week) query = query.eq('training_days', filters.days_per_week)
    const { data, error } = await query.order('program_name').range(offset, offset + limit - 1)
    if (error) throw error
    return (data as WorkoutProgram[]) || []
  }

  // Offline: read from central store
  const store = getStore()
  let result = store.programIds.map((id) => toWorkoutProgram(store.programs[id]))

  if (filters?.category_id) result = result.filter((p) => p.category_id === filters.category_id)
  if (filters?.level_id) result = result.filter((p) => p.level_id === filters.level_id)
  if (filters?.days_per_week) result = result.filter((p) => p.days_per_week === filters.days_per_week)
  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase()
    result = result.filter((p) => p.program_name.toLowerCase().includes(q))
  }

  const offset = filters?.offset ?? 0
  const limit = filters?.limit ?? 50
  return result.slice(offset, offset + limit)
}

export async function getProgramById(programId: number): Promise<WorkoutProgram | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('program_details').select('*').eq('id', programId).single()
    if (error) throw error
    return data as WorkoutProgram | null
  }

  const store = getStore()
  const match = store.programIds
    .map((id) => store.programs[id])
    .find((p) => Number(p.id.replace(/\D/g, '')) === programId || p.id === String(programId))
  return match ? toWorkoutProgram(match) : null
}

export async function getProgramWithExercises(programId: number): Promise<ProgramWithExercises | null> {
  if (isSupabaseConfigured) {
    const { data: program, error: pError } = await supabase.from('program_details').select('*').eq('id', programId).single()
    if (pError) throw pError
    if (!program) return null

    const { data: exercises } = await supabase.from('program_exercises').select('*').eq('program_id', programId).order('day_number').order('order_index')
    const dayMap = new Map<number, ProgramExercise[]>()
    for (const ex of (exercises || [])) {
      const day = ex.day_number as number
      if (!dayMap.has(day)) dayMap.set(day, [])
      dayMap.get(day)!.push(ex as ProgramExercise)
    }
    const days = Array.from(dayMap.entries()).sort(([a], [b]) => a - b).map(([day_number, exercises]) => ({
      day_number,
      day_label: `Day ${day_number}`,
      exercises: exercises.sort((a, b) => a.exercise_order - b.exercise_order),
    }))
    return { program: program as WorkoutProgram, days }
  }

  // Offline: build from store
  const program = await getProgramById(programId)
  if (!program) return null

  // Build synthetic day structure from program metadata
  const days: { day_number: number; day_label: string; exercises: ProgramExercise[] }[] = []
  for (let d = 1; d <= program.days_per_week; d++) {
    days.push({
      day_number: d,
      day_label: `Day ${d}`,
      exercises: [],
    })
  }
  return { program, days }
}

// ── Exercises ──────────────────────────────────────────────────────

export async function searchExercises(query: string, filters?: ExerciseFilters): Promise<WorkoutExercise[]> {
  if (isSupabaseConfigured) {
    let dbQuery = supabase.from('exercise_details').select('*').eq('is_active', true)
    if (query) dbQuery = dbQuery.ilike('exercise_name', `%${query}%`)
    if (filters?.movement_pattern) dbQuery = dbQuery.eq('movement_pattern', filters.movement_pattern)
    if (filters?.exercise_type) dbQuery = dbQuery.eq('exercise_type', filters.exercise_type)
    const { data, error } = await dbQuery.limit(50)
    if (error) throw error
    return (data as WorkoutExercise[]) || []
  }

  const store = getStore()
  let result = Object.values(store.exercises).map(toWorkoutExercise)
  if (query) {
    const q = query.toLowerCase()
    result = result.filter((e) => e.exercise_name.toLowerCase().includes(q) || (e.equipment_primary && e.equipment_primary.toLowerCase().includes(q)))
  }
  return result
}

export async function getExerciseById(exerciseId: number): Promise<WorkoutExercise | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('exercise_details').select('*').eq('id', exerciseId).single()
    if (error) throw error
    return data as WorkoutExercise | null
  }

  const store = getStore()
  const match = Object.values(store.exercises).find((e) => Number(e.id.replace(/\D/g, '')) === exerciseId)
  return match ? toWorkoutExercise(match) : null
}

// ── Reference Data ─────────────────────────────────────────────────

export interface ReferenceData {
  categories: Category[]
  levels: Level[]
  setTypes: SetType[]
}

export async function getReferenceData(): Promise<ReferenceData> {
  if (isSupabaseConfigured) {
    const [categoriesRes, levelsRes, setTypesRes] = await Promise.all([
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('levels').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('set_types').select('*').eq('is_active', true).order('id'),
    ])
    return {
      categories: (categoriesRes.data as Category[]) || [],
      levels: (levelsRes.data as Level[]) || [],
      setTypes: (setTypesRes.data as SetType[]) || [],
    }
  }

  const store = getStore()
  return {
    categories: store.categories.map((c) => ({
      category_id: c.categoryId,
      category_name: c.categoryName,
      category_description: c.description ?? '',
    })),
    levels: store.levels.map((l) => ({
      level_id: l.levelId,
      level_name: l.levelName,
      level_description: l.description ?? '',
    })),
    setTypes: [
      { set_type_id: 1, set_type_name: 'Straight Set', set_type_code: 'STRAIGHT', description: 'Standard sets with rest' },
      { set_type_id: 2, set_type_name: 'Superset', set_type_code: 'SUPERSET', description: 'Two exercises back-to-back' },
      { set_type_id: 3, set_type_name: 'Triset', set_type_code: 'TRISET', description: 'Three exercises back-to-back' },
      { set_type_id: 4, set_type_name: 'Giant Set', set_type_code: 'GIANT_SET', description: 'Four+ exercises back-to-back' },
      { set_type_id: 5, set_type_name: 'Drop Set', set_type_code: 'DROP_SET', description: 'Reduce weight and continue' },
      { set_type_id: 12, set_type_name: 'Circuit', set_type_code: 'CIRCUIT', description: 'Consecutive exercises, minimal rest' },
      { set_type_id: 13, set_type_name: 'Complex', set_type_code: 'COMPLEX', description: 'Barbell sequence without putting down' },
    ],
  }
}

// ── Client Programs ────────────────────────────────────────────────

export async function assignProgramToClient(
  clientId: string,
  programId: number,
  startDate: string
): Promise<ClientProgram> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('client_programs').insert({
      client_id: clientId,
      program_id: programId,
      start_date: startDate,
      status: 'active',
      current_week: 1,
      current_day: 1,
    }).select().single()
    if (error) throw error
    return data as ClientProgram
  }

  // Offline: write to central store
  const store = getStore()
  const program = Object.values(store.programs).find((p) => Number(p.id.replace(/\D/g, '')) === programId)
  store.assignProgramToClient(clientId, program?.id ?? String(programId), 'coach')

  return {
    client_id: clientId,
    program_id: programId,
    start_date: startDate,
    status: 'active',
    current_week: 1,
    current_day: 1,
  }
}

export async function getClientPrograms(clientId: string): Promise<ClientProgram[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('client_programs').select('*, programs(*)').eq('client_id', clientId).order('created_at', { ascending: false })
    if (error) throw error
    return (data as ClientProgram[]) || []
  }

  const store = getStore()
  return Object.values(store.assignments)
    .filter((a) => a.clientId === clientId)
    .map((a) => ({
      client_id: a.clientId,
      program_id: Number(a.programId.replace(/\D/g, '')) || 0,
      start_date: a.startDate,
      status: a.status,
      current_week: a.currentWeek,
      current_day: a.currentDay,
    }))
}

// ── Workout Logging ────────────────────────────────────────────────

function getExerciseNameMap(): Record<number, string> {
  const store = getStore()
  const map: Record<number, string> = {}
  for (const ex of Object.values(store.exercises)) {
    const numId = Number(ex.id.replace(/\D/g, ''))
    if (numId) map[numId] = ex.name
  }
  return map
}

function dbSessionToLog(session: WorkoutSession, sets: WorkoutSetLog[], nameMap: Record<number, string>): WorkoutSessionLog {
  // Group sets by exercise_id
  const byExercise = new Map<number, WorkoutSetLog[]>()
  for (const s of sets) {
    if (!byExercise.has(s.exercise_id)) byExercise.set(s.exercise_id, [])
    byExercise.get(s.exercise_id)!.push(s)
  }

  const exercises: WorkoutSessionLog['exercises'] = []
  let notationIdx = 0
  for (const [exerciseId, exSets] of byExercise.entries()) {
    const sorted = exSets.sort((a, b) => a.set_number - b.set_number)
    exercises.push({
      exerciseId: String(exerciseId),
      exerciseName: nameMap[exerciseId] || `Exercise ${exerciseId}`,
      notation: String.fromCharCode(65 + notationIdx),
      sets: sorted.map((s) => ({
        setNumber: s.set_number,
        prescribedSets: s.prescribed_sets,
        prescribedReps: s.prescribed_reps,
        prescribedLoad: undefined,
        prescribedRpe: s.prescribed_rpe_target,
        actualLoad: s.actual_load,
        actualReps: s.actual_reps,
        actualRpe: s.actual_rpe,
        completed: s.is_completed,
      })),
    })
    notationIdx++
  }

  return {
    id: `ws_db_${session.session_id}_${Date.now()}`,
    clientId: session.client_id,
    programId: String(session.program_id),
    programName: `Program ${session.program_id}`,
    dayNumber: session.day_number,
    weekNumber: session.week_number,
    date: session.completed_at || new Date().toISOString(),
    durationSeconds: session.duration_seconds || 0,
    exercises,
    notes: session.notes,
  }
}

export async function logWorkoutSession(session: Omit<WorkoutSession, 'session_id'>): Promise<WorkoutSession> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('workout_sessions').insert(session).select().single()
    if (error) throw error
    return data as WorkoutSession
  }
  return { ...session, session_id: Math.floor(Math.random() * 100000) }
}

export async function logWorkoutSets(sets: Omit<WorkoutSetLog, 'set_log_id'>[]): Promise<WorkoutSetLog[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('workout_set_logs').insert(sets).select()
    if (error) throw error
    return (data as WorkoutSetLog[]) || []
  }
  return sets.map((s, i) => ({ ...s, set_log_id: i + 1 }))
}

export async function saveWorkoutSessionLog(log: WorkoutSessionLog): Promise<WorkoutSessionLog> {
  if (!isSupabaseConfigured) return log

  const session: Omit<WorkoutSession, 'session_id'> = {
    client_id: log.clientId,
    client_program_id: 1, // placeholder
    program_id: Number(log.programId) || 0,
    day_number: log.dayNumber,
    week_number: log.weekNumber,
    completed_at: log.date,
    duration_seconds: log.durationSeconds,
    notes: log.notes,
  }

  const savedSession = await logWorkoutSession(session)
  const sessionId = savedSession.session_id!

  const dbSets: Omit<WorkoutSetLog, 'set_log_id'>[] = []
  for (const ex of log.exercises) {
    const exerciseIdNum = Number(ex.exerciseId) || 0
    for (const set of ex.sets) {
      dbSets.push({
        session_id: sessionId,
        program_exercise_id: 0,
        exercise_id: exerciseIdNum,
        set_number: set.setNumber,
        prescribed_sets: set.prescribedSets,
        prescribed_reps: set.prescribedReps,
        prescribed_rest_seconds: 60,
        prescribed_rpe_target: set.prescribedRpe,
        actual_load: set.actualLoad,
        actual_reps: set.actualReps,
        actual_rpe: set.actualRpe,
        is_completed: set.completed,
      })
    }
  }

  if (dbSets.length > 0) {
    await logWorkoutSets(dbSets)
  }

  return {
    ...log,
    id: `ws_db_${sessionId}_${Date.now()}`,
  }
}

export async function getWorkoutHistory(clientId: string, programId?: number): Promise<WorkoutSessionLog[]> {
  const store = getStore()
  const nameMap = getExerciseNameMap()

  if (isSupabaseConfigured) {
    let query = supabase.from('workout_sessions').select('*').eq('client_id', clientId)
    if (programId) query = query.eq('program_id', programId)
    const { data: sessions, error } = await query.order('completed_at', { ascending: false })
    if (error) throw error
    if (!sessions || sessions.length === 0) return []

    const sessionIds = sessions.map((s) => s.session_id).filter(Boolean) as number[]
    const { data: sets } = await supabase
      .from('workout_set_logs')
      .select('*')
      .in('session_id', sessionIds)

    const setsBySession = new Map<number, WorkoutSetLog[]>()
    for (const s of sets || []) {
      if (!setsBySession.has(s.session_id)) setsBySession.set(s.session_id, [])
      setsBySession.get(s.session_id)!.push(s)
    }

    return sessions.map((s) => dbSessionToLog(s as WorkoutSession, setsBySession.get(s.session_id!) || [], nameMap))
  }

  // Offline: read from central store
  return Object.values(store.workoutSessions)
    .filter((s) => s.clientId === clientId && (programId === undefined || Number(s.programId) === programId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
