/**
 * Minimal Mock Data Fallback
 *
 * Used only when Supabase credentials are not configured.
 * Trimmed to a tiny representative sample for offline dev/testing.
 */

import type {
  Category,
  Level,
  SetType,
  Program,
  Exercise,
  ProgramExercise,
  ProgramWithExercises,
} from '../types/workout'

export const MOCK_CATEGORIES: Category[] = [
  { category_id: 1, category_name: 'Lose Weight', category_description: 'Fat loss and calorie burn' },
  { category_id: 2, category_name: 'Build Muscle', category_description: 'Hypertrophy-focused' },
  { category_id: 3, category_name: 'Strength', category_description: 'Maximal strength' },
  { category_id: 4, category_name: 'Hypertrophy', category_description: 'Muscle growth' },
  { category_id: 5, category_name: 'Endurance', category_description: 'Cardio & muscular endurance' },
  { category_id: 6, category_name: 'Fat Loss', category_description: 'Metabolic conditioning' },
  { category_id: 7, category_name: 'General Fitness', category_description: 'Overall health' },
  { category_id: 8, category_name: 'Sports Performance', category_description: 'Athletic performance' },
]

export const MOCK_LEVELS: Level[] = [
  { level_id: 1, level_name: 'Beginner', level_description: 'New to training' },
  { level_id: 2, level_name: 'Intermediate', level_description: '6+ months consistent' },
  { level_id: 3, level_name: 'Advanced', level_description: '2+ years consistent' },
  { level_id: 4, level_name: 'Elite', level_description: 'Competitive' },
]

export const MOCK_SET_TYPES: SetType[] = [
  { set_type_id: 1, set_type_name: 'Straight Set', set_type_code: 'STRAIGHT', description: 'Standard sets with rest' },
  { set_type_id: 2, set_type_name: 'Superset', set_type_code: 'SUPERSET', description: 'Two exercises back-to-back' },
  { set_type_id: 3, set_type_name: 'Triset', set_type_code: 'TRISET', description: 'Three exercises back-to-back' },
  { set_type_id: 4, set_type_name: 'Giant Set', set_type_code: 'GIANT_SET', description: 'Four+ exercises back-to-back' },
  { set_type_id: 5, set_type_name: 'Drop Set', set_type_code: 'DROP_SET', description: 'Reduce weight and continue' },
  { set_type_id: 12, set_type_name: 'Circuit', set_type_code: 'CIRCUIT', description: 'Consecutive exercises, minimal rest' },
  { set_type_id: 13, set_type_name: 'Complex', set_type_code: 'COMPLEX', description: 'Barbell sequence without putting down' },
]

export const MOCK_PROGRAMS: Program[] = [
  {
    program_id: 1,
    category_id: 1,
    level_id: 1,
    program_name: 'Foundation Fat Burn',
    program_description: 'Perfect starting point for beginners looking to lose weight.',
    duration_weeks: 4,
    days_per_week: 3,
    training_split: 'Full Body',
    periodization_phase: 'BASE',
    session_duration_minutes: 30,
    total_workouts: 12,
    difficulty_rating: 1,
    target_audience: 'Beginners',
    expected_outcomes: 'Lose 4-8 lbs',
    category_name: 'Lose Weight',
    level_name: 'Beginner',
  },
  {
    program_id: 2,
    category_id: 2,
    level_id: 2,
    program_name: 'Hypertrophy Foundation',
    program_description: 'Build a solid muscle base.',
    duration_weeks: 8,
    days_per_week: 4,
    training_split: 'Upper/Lower',
    periodization_phase: 'HYPERTROPHY',
    session_duration_minutes: 60,
    total_workouts: 32,
    difficulty_rating: 5,
    target_audience: 'Intermediate lifters',
    expected_outcomes: 'Visible muscle growth',
    category_name: 'Build Muscle',
    level_name: 'Intermediate',
  },
]

export const MOCK_EXERCISES: Exercise[] = [
  { exercise_id: 1001, exercise_name: 'Barbell Bench Press (Flat)', exercise_category: 'Compound', equipment_primary: 'Barbell', movement_pattern: 'Push (Horizontal)', mechanics: 'Compound', force_type: 'Push', exercise_type: 'Strength' },
  { exercise_id: 1002, exercise_name: 'Goblet Squat', exercise_category: 'Compound', equipment_primary: 'Kettlebell', movement_pattern: 'Squat', mechanics: 'Compound', force_type: 'Push', exercise_type: 'Strength' },
  { exercise_id: 1003, exercise_name: 'Romanian Deadlift', exercise_category: 'Compound', equipment_primary: 'Barbell', movement_pattern: 'Hinge', mechanics: 'Compound', force_type: 'Pull', exercise_type: 'Strength' },
  { exercise_id: 1004, exercise_name: 'Push-ups', exercise_category: 'Compound', equipment_primary: 'Bodyweight', movement_pattern: 'Push (Horizontal)', mechanics: 'Compound', force_type: 'Push', exercise_type: 'Strength' },
  { exercise_id: 1005, exercise_name: 'Dumbbell Row', exercise_category: 'Compound', equipment_primary: 'Dumbbell', movement_pattern: 'Pull (Horizontal)', mechanics: 'Compound', force_type: 'Pull', exercise_type: 'Strength' },
]

export const MOCK_PROGRAM_EXERCISES: ProgramExercise[] = [
  { program_exercise_id: 1, program_id: 1, day_number: 1, exercise_order: 1, exercise_id: 1002, set_type_id: 1, sets: 3, reps: '12', tempo: '2010', rest_seconds: 45, rpe_target: 7.0, notes: 'Focus on depth', exercise_name: 'Goblet Squat', equipment_primary: 'Kettlebell', set_type_name: 'Straight Set' },
  { program_exercise_id: 2, program_id: 1, day_number: 1, exercise_order: 2, exercise_id: 1004, set_type_id: 1, sets: 3, reps: '15', tempo: '2010', rest_seconds: 45, rpe_target: 6.0, notes: 'Full ROM', exercise_name: 'Push-ups', equipment_primary: 'Bodyweight', set_type_name: 'Straight Set' },
  { program_exercise_id: 3, program_id: 1, day_number: 1, exercise_order: 3, exercise_id: 1005, set_type_id: 1, sets: 3, reps: '12', tempo: '2010', rest_seconds: 45, rpe_target: 7.0, notes: 'Squeeze at top', exercise_name: 'Dumbbell Row', equipment_primary: 'Dumbbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 4, program_id: 1, day_number: 1, exercise_order: 4, exercise_id: 1003, set_type_id: 1, sets: 3, reps: '12', tempo: '2110', rest_seconds: 60, rpe_target: 7.0, notes: 'Hamstring stretch', exercise_name: 'Romanian Deadlift', equipment_primary: 'Barbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 5, program_id: 1, day_number: 2, exercise_order: 1, exercise_id: 1003, set_type_id: 1, sets: 3, reps: '12', tempo: '2110', rest_seconds: 60, rpe_target: 7.0, notes: 'Control eccentric', exercise_name: 'Romanian Deadlift', equipment_primary: 'Barbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 6, program_id: 1, day_number: 2, exercise_order: 2, exercise_id: 1001, set_type_id: 1, sets: 3, reps: '12', tempo: '2010', rest_seconds: 60, rpe_target: 7.0, notes: 'Pinch shoulder blades', exercise_name: 'Barbell Bench Press (Flat)', equipment_primary: 'Barbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 7, program_id: 1, day_number: 2, exercise_order: 3, exercise_id: 1002, set_type_id: 1, sets: 3, reps: '12', tempo: '3010', rest_seconds: 45, rpe_target: 6.0, notes: 'Slower descent', exercise_name: 'Goblet Squat', equipment_primary: 'Kettlebell', set_type_name: 'Straight Set' },
]

export function getMockProgramWithExercises(programId: number): ProgramWithExercises | null {
  const program = MOCK_PROGRAMS.find((p) => p.program_id === programId)
  if (!program) return null

  const exercises = MOCK_PROGRAM_EXERCISES.filter((pe) => pe.program_id === programId)
  const dayMap = new Map<number, ProgramExercise[]>()
  for (const ex of exercises) {
    if (!dayMap.has(ex.day_number)) dayMap.set(ex.day_number, [])
    dayMap.get(ex.day_number)!.push(ex)
  }

  const days = Array.from(dayMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([day_number, dayExercises]) => ({
      day_number,
      day_label: `Day ${day_number}`,
      exercises: dayExercises.sort((a, b) => a.exercise_order - b.exercise_order),
    }))

  return { program, days }
}
