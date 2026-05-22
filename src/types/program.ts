/**
 * AzFIT Program Design Wizard — shared type definitions
 * These types support the full program creation lifecycle from
 * initial goal selection through exercise assignment and final save/assign.
 */

/** Training goal categories */
export type GoalType = 'lose-fat' | 'build-muscle' | 'strength' | 'endurance' | 'maintenance';

/** Difficulty tiers for exercises and programs */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/** Exercise classification by movement pattern */
export type ExerciseType = 'compound' | 'isolation' | 'olympic';

/** Days of the week used in weekly split configuration */
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

/**
 * A single exercise within a program day.
 * Contains all training parameters plus metadata for substitution tracking.
 */
export interface ProgramExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  tempo: string;
  supersetWith: string | null;
  order: number;
  notes: string;
  isSubstituted: boolean;
  originalExerciseId: string | null;
}

/**
 * A training phase spanning a range of weeks.
 * Used for periodization within a program.
 */
export interface ProgramPhase {
  id: string;
  name: string;
  weekStart: number;
  weekEnd: number;
  focus: string;
  intensityTarget: string;
  volumeTarget: string;
  exercises: ProgramExercise[];
}

/**
 * Daily plan within a weekly split.
 * Either contains exercises or is a rest day.
 */
export interface DayPlan {
  dayOfWeek: string;  // 'Mon' | 'Tue' | ... | 'Sun'
  isRestDay: boolean;
  focus: string;
  estimatedTime: number;
  exercises: ProgramExercise[];
}

/**
 * A complete training program.
 * Contains all metadata, weekly split, phases, and exercise details.
 */
export interface Program {
  id: string;
  name: string;
  description: string;
  tags: string[];
  goal: GoalType;
  method: string;
  difficulty: DifficultyLevel;
  duration: number;
  frequency: number;
  phases: ProgramPhase[];
  weeklySplit: DayPlan[];
  progressionRules: string[];
  equipmentRequired: string[];
  totalVolume: number;
  estimatedTimePerSession: number;
  timesUsed: number;
  lastAssigned: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Master exercise definition from the exercise library.
 * Used as reference when building programs or swapping exercises.
 */
export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: DifficultyLevel;
  type: ExerciseType;
  description: string;
}

/** Wizard step configuration */
export interface WizardStep {
  number: number;
  title: string;
  description: string;
}

/** Filter state for the exercise picker dialog */
export interface ExerciseFilters {
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  type: string;
}
