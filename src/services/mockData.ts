/**
 * Mock Data Fallback
 *
 * Used when Supabase credentials are not configured.
 * Provides a representative sample of the 320 programs, 524 exercises, and 9,395 prescriptions
 * so development and testing can proceed without a live database connection.
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
  { category_id: 1, category_name: 'Lose Weight', category_description: 'Programs focused on fat loss and calorie burn' },
  { category_id: 2, category_name: 'Build Muscle', category_description: 'Hypertrophy-focused programs for muscle growth' },
  { category_id: 3, category_name: 'Strength', category_description: 'Maximal strength development programs' },
  { category_id: 4, category_name: 'Hypertrophy', category_description: 'Muscle growth and size-focused programs' },
  { category_id: 5, category_name: 'Endurance', category_description: 'Cardiovascular and muscular endurance programs' },
  { category_id: 6, category_name: 'Fat Loss', category_description: 'Intensive fat loss and metabolic conditioning' },
  { category_id: 7, category_name: 'General Fitness', category_description: 'Well-rounded fitness for overall health' },
  { category_id: 8, category_name: 'Sports Performance', category_description: 'Athletic performance enhancement programs' },
]

export const MOCK_LEVELS: Level[] = [
  { level_id: 1, level_name: 'Beginner', level_description: 'New to training or returning after a break' },
  { level_id: 2, level_name: 'Intermediate', level_description: 'Consistent training for 6+ months' },
  { level_id: 3, level_name: 'Advanced', level_description: '2+ years of consistent training' },
  { level_id: 4, level_name: 'Elite', level_description: 'Competitive or highly experienced' },
]

export const MOCK_SET_TYPES: SetType[] = [
  { set_type_id: 1, set_type_name: 'Straight Set', set_type_code: 'STRAIGHT', description: 'Standard sets with rest between' },
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
    program_description: 'Perfect starting point for beginners looking to lose weight and build foundational fitness.',
    duration_weeks: 4,
    days_per_week: 3,
    training_split: 'Full Body',
    periodization_phase: 'BASE',
    session_duration_minutes: 30,
    total_workouts: 12,
    difficulty_rating: 1,
    target_audience: 'Beginners new to training',
    expected_outcomes: 'Lose 4-8 lbs, improve fitness',
    category_name: 'Lose Weight',
    level_name: 'Beginner',
  },
  {
    program_id: 2,
    category_id: 1,
    level_id: 1,
    program_name: 'Body Recomposition Starter',
    program_description: 'Build muscle while losing fat with this balanced beginner program.',
    duration_weeks: 6,
    days_per_week: 4,
    training_split: 'Upper/Lower',
    periodization_phase: 'BASE',
    session_duration_minutes: 45,
    total_workouts: 24,
    difficulty_rating: 2,
    target_audience: 'Beginners wanting muscle + fat loss',
    expected_outcomes: 'Improved body composition, strength gains',
    category_name: 'Lose Weight',
    level_name: 'Beginner',
  },
  {
    program_id: 3,
    category_id: 1,
    level_id: 1,
    program_name: 'Lean Body Launch',
    program_description: 'Launch your fitness journey with this comprehensive fat-loss program.',
    duration_weeks: 8,
    days_per_week: 3,
    training_split: 'Full Body',
    periodization_phase: 'BASE',
    session_duration_minutes: 45,
    total_workouts: 24,
    difficulty_rating: 2,
    target_audience: 'Beginners with 3 days available',
    expected_outcomes: 'Significant fat loss, improved endurance',
    category_name: 'Lose Weight',
    level_name: 'Beginner',
  },
  {
    program_id: 4,
    category_id: 2,
    level_id: 2,
    program_name: 'Hypertrophy Foundation',
    program_description: 'Build a solid muscle base with this intermediate hypertrophy program.',
    duration_weeks: 8,
    days_per_week: 4,
    training_split: 'Upper/Lower',
    periodization_phase: 'HYPERTROPHY',
    session_duration_minutes: 60,
    total_workouts: 32,
    difficulty_rating: 5,
    target_audience: 'Intermediate lifters',
    expected_outcomes: 'Visible muscle growth, strength increase',
    category_name: 'Build Muscle',
    level_name: 'Intermediate',
  },
  {
    program_id: 5,
    category_id: 3,
    level_id: 3,
    program_name: 'Strength Peak Protocol',
    program_description: 'Advanced strength program using periodization for peak performance.',
    duration_weeks: 12,
    days_per_week: 4,
    training_split: 'Upper/Lower',
    periodization_phase: 'STRENGTH',
    session_duration_minutes: 75,
    total_workouts: 48,
    difficulty_rating: 8,
    target_audience: 'Advanced strength athletes',
    expected_outcomes: 'Major strength PRs, power development',
    category_name: 'Strength',
    level_name: 'Advanced',
  },
]

export const MOCK_EXERCISES: Exercise[] = [
  { exercise_id: 1001, exercise_name: 'Barbell Bench Press (Flat)', exercise_category: 'Compound', equipment_primary: 'Barbell', movement_pattern: 'Push (Horizontal)', mechanics: 'Compound', force_type: 'Push', exercise_type: 'Strength' },
  { exercise_id: 1002, exercise_name: 'Goblet Squat', exercise_category: 'Compound', equipment_primary: 'Kettlebell', movement_pattern: 'Squat', mechanics: 'Compound', force_type: 'Push', exercise_type: 'Strength' },
  { exercise_id: 1003, exercise_name: 'Romanian Deadlift', exercise_category: 'Compound', equipment_primary: 'Barbell', movement_pattern: 'Hinge', mechanics: 'Compound', force_type: 'Pull', exercise_type: 'Strength' },
  { exercise_id: 1004, exercise_name: 'Push-ups', exercise_category: 'Compound', equipment_primary: 'Bodyweight', movement_pattern: 'Push (Horizontal)', mechanics: 'Compound', force_type: 'Push', exercise_type: 'Strength' },
  { exercise_id: 1005, exercise_name: 'Dumbbell Row', exercise_category: 'Compound', equipment_primary: 'Dumbbell', movement_pattern: 'Pull (Horizontal)', mechanics: 'Compound', force_type: 'Pull', exercise_type: 'Strength' },
  { exercise_id: 1006, exercise_name: 'Lat Pulldown (Close Grip)', exercise_category: 'Compound', equipment_primary: 'Cable Machine', movement_pattern: 'Pull (Vertical)', mechanics: 'Compound', force_type: 'Pull', exercise_type: 'Strength' },
  { exercise_id: 1007, exercise_name: 'Plank', exercise_category: 'Core', equipment_primary: 'Bodyweight', movement_pattern: 'Core', mechanics: 'Isolation', force_type: 'Static', exercise_type: 'Endurance' },
  { exercise_id: 1008, exercise_name: 'Kettlebell Swing', exercise_category: 'Compound', equipment_primary: 'Kettlebell', movement_pattern: 'Hinge', mechanics: 'Compound', force_type: 'Pull', exercise_type: 'Power' },
]

export const MOCK_PROGRAM_EXERCISES: ProgramExercise[] = [
  // Program 1, Day 1 — Straight sets example
  { program_exercise_id: 1, program_id: 1, day_number: 1, exercise_order: 1, exercise_id: 1002, set_type_id: 1, sets: 3, reps: '12', tempo: '2010', rest_seconds: 45, rpe_target: 7.0, notes: 'Focus on depth', exercise_name: 'Goblet Squat', equipment_primary: 'Kettlebell', set_type_name: 'Straight Set' },
  { program_exercise_id: 2, program_id: 1, day_number: 1, exercise_order: 2, exercise_id: 1004, set_type_id: 1, sets: 3, reps: '15', tempo: '2010', rest_seconds: 45, rpe_target: 6.0, notes: 'Full range of motion', exercise_name: 'Push-ups', equipment_primary: 'Bodyweight', set_type_name: 'Straight Set' },
  { program_exercise_id: 3, program_id: 1, day_number: 1, exercise_order: 3, exercise_id: 1005, set_type_id: 1, sets: 3, reps: '12', tempo: '2010', rest_seconds: 45, rpe_target: 7.0, notes: 'Squeeze at the top', exercise_name: 'Dumbbell Row', equipment_primary: 'Dumbbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 4, program_id: 1, day_number: 1, exercise_order: 4, exercise_id: 1003, set_type_id: 1, sets: 3, reps: '12', tempo: '2110', rest_seconds: 60, rpe_target: 7.0, notes: 'Feel the hamstring stretch', exercise_name: 'Romanian Deadlift', equipment_primary: 'Barbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 5, program_id: 1, day_number: 1, exercise_order: 5, exercise_id: 1007, set_type_id: 1, sets: 3, reps: '30s', tempo: 'Hold', rest_seconds: 30, rpe_target: 6.0, notes: 'Keep core tight', exercise_name: 'Plank', equipment_primary: 'Bodyweight', set_type_name: 'Straight Set' },

  // Program 1, Day 2
  { program_exercise_id: 6, program_id: 1, day_number: 2, exercise_order: 1, exercise_id: 1003, set_type_id: 1, sets: 3, reps: '12', tempo: '2110', rest_seconds: 60, rpe_target: 7.0, notes: 'Control the eccentric', exercise_name: 'Romanian Deadlift', equipment_primary: 'Barbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 7, program_id: 1, day_number: 2, exercise_order: 2, exercise_id: 1001, set_type_id: 1, sets: 3, reps: '12', tempo: '2010', rest_seconds: 60, rpe_target: 7.0, notes: 'Pinch shoulder blades', exercise_name: 'Barbell Bench Press (Flat)', equipment_primary: 'Barbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 8, program_id: 1, day_number: 2, exercise_order: 3, exercise_id: 1006, set_type_id: 1, sets: 3, reps: '15', tempo: '2010', rest_seconds: 45, rpe_target: 6.0, notes: 'Pull to upper chest', exercise_name: 'Lat Pulldown (Close Grip)', equipment_primary: 'Cable Machine', set_type_name: 'Straight Set' },
  { program_exercise_id: 9, program_id: 1, day_number: 2, exercise_order: 4, exercise_id: 1002, set_type_id: 1, sets: 3, reps: '12', tempo: '3010', rest_seconds: 45, rpe_target: 6.0, notes: 'Slower descent', exercise_name: 'Goblet Squat', equipment_primary: 'Kettlebell', set_type_name: 'Straight Set' },

  // Program 1, Day 3
  { program_exercise_id: 10, program_id: 1, day_number: 3, exercise_order: 1, exercise_id: 1008, set_type_id: 1, sets: 3, reps: '15', tempo: 'X010', rest_seconds: 45, rpe_target: 7.0, notes: 'Explosive hip drive', exercise_name: 'Kettlebell Swing', equipment_primary: 'Kettlebell', set_type_name: 'Straight Set' },
  { program_exercise_id: 11, program_id: 1, day_number: 3, exercise_order: 2, exercise_id: 1001, set_type_id: 1, sets: 3, reps: '12', tempo: '2010', rest_seconds: 60, rpe_target: 7.0, notes: 'Control the bar path', exercise_name: 'Barbell Bench Press (Flat)', equipment_primary: 'Barbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 12, program_id: 1, day_number: 3, exercise_order: 3, exercise_id: 1005, set_type_id: 1, sets: 3, reps: '12', tempo: '2110', rest_seconds: 45, rpe_target: 7.0, notes: 'Pull to hip', exercise_name: 'Dumbbell Row', equipment_primary: 'Dumbbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 13, program_id: 1, day_number: 3, exercise_order: 4, exercise_id: 1002, set_type_id: 1, sets: 3, reps: '12', tempo: '3010', rest_seconds: 45, rpe_target: 6.0, notes: 'Deep squat position', exercise_name: 'Goblet Squat', equipment_primary: 'Kettlebell', set_type_name: 'Straight Set' },

  // Program 4, Day 1 — Superset example (B1, B2)
  { program_exercise_id: 14, program_id: 4, day_number: 1, exercise_order: 1, exercise_id: 1001, set_type_id: 1, sets: 4, reps: '8', tempo: '2010', rest_seconds: 90, rpe_target: 8.0, notes: 'Heavy weight', exercise_name: 'Barbell Bench Press (Flat)', equipment_primary: 'Barbell', set_type_name: 'Straight Set' },
  { program_exercise_id: 15, program_id: 4, day_number: 1, exercise_order: 2, exercise_id: 1005, set_type_id: 2, sets: 3, reps: '10', tempo: '2010', rest_seconds: 60, rpe_target: 7.5, notes: 'Superset with next', exercise_name: 'Dumbbell Row', equipment_primary: 'Dumbbell', set_type_name: 'Superset' },
  { program_exercise_id: 16, program_id: 4, day_number: 1, exercise_order: 3, exercise_id: 1004, set_type_id: 2, sets: 3, reps: '12', tempo: '2010', rest_seconds: 60, rpe_target: 7.5, notes: 'Superset with previous', exercise_name: 'Push-ups', equipment_primary: 'Bodyweight', set_type_name: 'Superset' },
  { program_exercise_id: 17, program_id: 4, day_number: 1, exercise_order: 4, exercise_id: 1006, set_type_id: 1, sets: 3, reps: '12', tempo: '2010', rest_seconds: 60, rpe_target: 7.0, notes: 'Full stretch at top', exercise_name: 'Lat Pulldown (Close Grip)', equipment_primary: 'Cable Machine', set_type_name: 'Straight Set' },
]

export function getMockProgramWithExercises(programId: number): ProgramWithExercises | null {
  const program = MOCK_PROGRAMS.find((p) => p.program_id === programId)
  if (!program) return null

  const exercises = MOCK_PROGRAM_EXERCISES.filter((pe) => pe.program_id === programId)

  // Group by day
  const dayMap = new Map<number, ProgramExercise[]>()
  for (const ex of exercises) {
    if (!dayMap.has(ex.day_number)) {
      dayMap.set(ex.day_number, [])
    }
    dayMap.get(ex.day_number)!.push(ex)
  }

  const days = Array.from(dayMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([day_number, dayExercises]) => ({
      day_number,
      day_label: getDayLabel(day_number, dayExercises),
      exercises: dayExercises.sort((a, b) => a.exercise_order - b.exercise_order),
    }))

  return { program, days }
}

function getDayLabel(dayNumber: number, exercises: ProgramExercise[]): string {
  // Infer from exercises or default
  if (exercises.some((e) => e.exercise_name?.includes('Squat') || e.exercise_name?.includes('Deadlift'))) {
    if (exercises.some((e) => e.exercise_name?.includes('Bench') || e.exercise_name?.includes('Press'))) {
      return 'Full Body'
    }
    return 'Lower Body'
  }
  if (exercises.some((e) => e.exercise_name?.includes('Bench') || e.exercise_name?.includes('Press') || e.exercise_name?.includes('Row'))) {
    return 'Upper Body'
  }
  return `Day ${dayNumber}`
}
