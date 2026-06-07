import type { Phase, DaySession, TrainingMethod, Exercise, DayExercise } from './types'
import { DAYS_OF_WEEK, FOCUS_MUSCLE_MAP } from './constants'

export function normalizeGoal(goal: string): string {
  const g = goal.toLowerCase()
  if (g.includes('fat') || g.includes('loss')) return 'fat-loss'
  if (g.includes('muscle') || g.includes('hypertrophy')) return 'muscle'
  if (g.includes('strength')) return 'strength'
  if (g.includes('endurance')) return 'endurance'
  if (g.includes('rehab')) return 'rehab'
  return 'general'
}

export function goalMatches(goalId: string, methodGoal: string): boolean {
  const mg = methodGoal.toLowerCase()
  switch (goalId) {
    case 'muscle': return mg.includes('muscle') || mg.includes('hypertrophy')
    case 'fat-loss': return mg.includes('fat') || mg.includes('loss')
    case 'strength': return mg.includes('strength')
    case 'endurance': return mg.includes('endurance')
    case 'rehab': return mg.includes('rehab')
    case 'general': return true
    default: return false
  }
}

export function generateId() {
  return crypto.randomUUID()
}

export function getDefaultPhases(goal: string): Phase[] {
  const base: Phase[] = [
    { id: generateId(), name: 'Foundation', durationWeeks: 4, focus: 'Volume', intensityMin: 60, intensityMax: 70, volume: 'Moderate', repRange: '10-12' },
    { id: generateId(), name: 'Progression', durationWeeks: 4, focus: 'Intensity', intensityMin: 70, intensityMax: 82, volume: 'High', repRange: '6-10' },
    { id: generateId(), name: 'Peak', durationWeeks: 3, focus: 'Peak', intensityMin: 82, intensityMax: 92, volume: 'Moderate', repRange: '3-6' },
  ]
  if (goal === 'fat-loss') {
    return [
      { id: generateId(), name: 'Adaptation', durationWeeks: 2, focus: 'Volume', intensityMin: 55, intensityMax: 65, volume: 'Moderate', repRange: '12-15' },
      { id: generateId(), name: 'Intensification', durationWeeks: 4, focus: 'Intensity', intensityMin: 65, intensityMax: 78, volume: 'High', repRange: '10-12' },
    ]
  }
  if (goal === 'rehab') {
    return [
      { id: generateId(), name: 'Movement Prep', durationWeeks: 3, focus: 'Technique', intensityMin: 40, intensityMax: 55, volume: 'Low', repRange: '12-15' },
      { id: generateId(), name: 'Loading', durationWeeks: 4, focus: 'Volume', intensityMin: 55, intensityMax: 70, volume: 'Moderate', repRange: '8-12' },
    ]
  }
  return base
}

export function getDefaultWeeklySplit(_goal: string, method: TrainingMethod, availableDays: string[]): DaySession[] {
  const methodGoal = normalizeGoal(method.Goal)
  const freq = Math.min(parseInt(method.Frequency) || 4, availableDays.length)
  const sortedDays = DAYS_OF_WEEK.filter(d => availableDays.includes(d))
  const trainingDays = sortedDays.slice(0, freq)

  let focuses: string[] = []
  if (methodGoal === 'muscle' || method.Name.toLowerCase().includes('upper')) {
    focuses = ['Upper Body', 'Lower Body', 'Rest', 'Upper Body', 'Lower Body', 'Rest', 'Rest']
  } else if (method.Name.toLowerCase().includes('push')) {
    focuses = ['Push (Chest/Shoulders/Triceps)', 'Pull (Back/Biceps)', 'Legs (Quads/Hams/Glutes)', 'Push (Chest/Shoulders/Triceps)', 'Pull (Back/Biceps)', 'Legs (Quads/Hams/Glutes)', 'Rest']
  } else if (methodGoal === 'strength') {
    focuses = ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'Rest']
  } else if (methodGoal === 'fat-loss') {
    focuses = ['Full Body', 'HIIT / Cardio', 'Rest', 'Full Body', 'HIIT / Cardio', 'Rest', 'Rest']
  } else {
    focuses = ['Upper Body', 'Lower Body', 'Rest', 'Full Body', 'Rest', 'Rest', 'Rest']
  }

  return DAYS_OF_WEEK.map((day, i) => ({
    day,
    focus: trainingDays.includes(day) ? focuses[i] : 'Rest',
    isRest: !trainingDays.includes(day),
    exercises: [],
  }))
}

export function autoPopulateExercises(
  focus: string,
  exercises: Exercise[],
  equipment: string[],
  count: number = 6
): DayExercise[] {
  const targetMuscles = FOCUS_MUSCLE_MAP[focus] || []
  let filtered = exercises

  // Filter by equipment
  if (equipment.length > 0 && !equipment.includes('Full Gym')) {
    const eqMap: Record<string, string[]> = {
      'Dumbbells Only': ['Dumbbell'],
      'Bodyweight': ['Bodyweight', 'Pull-Up Bar'],
      'Home Gym': ['Dumbbell', 'Bodyweight', 'Pull-Up Bar', 'Resistance Band'],
      'Cable Machines': ['Cable', 'Machine'],
    }
    const allowed = equipment.flatMap(e => eqMap[e] || [e])
    filtered = filtered.filter(ex => allowed.some(a => ex.Equipment.toLowerCase().includes(a.toLowerCase())))
  }

  // Prioritize target muscle exercises
  const muscleMatches = filtered.filter(ex =>
    targetMuscles.some(m => ex.MuscleGroup.toLowerCase().includes(m.toLowerCase()))
  )
  const others = filtered.filter(ex =>
    !targetMuscles.some(m => ex.MuscleGroup.toLowerCase().includes(m.toLowerCase()))
  )

  const selected = [...muscleMatches, ...others].slice(0, count)

  return selected.map((ex, i) => ({
    id: generateId(),
    exerciseId: ex.ExerciseID,
    name: ex.Name,
    muscleGroup: ex.MuscleGroup,
    sets: i < 2 ? 4 : 3,
    reps: focus === 'HIIT / Cardio' ? '30s' : '8-12',
    rest: focus === 'HIIT / Cardio' ? '30s' : '90s',
    rpe: 8,
    notes: '',
  }))
}
