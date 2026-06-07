export interface TrainingMethod {
  Name: string
  Goal: string
  Duration: string
  Frequency: string
  TargetAudience: string
  Equipment: string
  Structure: string
  Progression: string
  NutritionNotes: string
  TrackingMetrics: string
  SafetyNotes: string
  MediaAssets?: string
  Category: string
}

export interface Exercise {
  ExerciseID: string
  Name: string
  MuscleGroup: string
  Equipment: string
  Difficulty: string
  Type: string
  VideoURL: string
  Description: string
}

export interface Phase {
  id: string
  name: string
  durationWeeks: number
  focus: string
  intensityMin: number
  intensityMax: number
  volume: string
  repRange: string
}

export interface DayExercise {
  id: string
  exerciseId: string
  name: string
  muscleGroup: string
  sets: number
  reps: string
  rest: string
  rpe: number
  notes: string
  supersetWith?: string
}

export interface DaySession {
  day: string
  focus: string
  exercises: DayExercise[]
  isRest: boolean
}

export interface WizardState {
  currentStep: number
  selectedGoal: string
  selectedMethod: TrainingMethod | null
  clientContext: {
    clientId: string
    experience: string
    availableDays: string[]
    sessionDuration: string
    limitations: string[]
    equipment: string[]
  }
  phases: Phase[]
  weeklySplit: DaySession[]
  programName: string
  description: string
  tags: string[]
}
