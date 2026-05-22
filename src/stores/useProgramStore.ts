/**
 * useProgramStore.ts — Zustand store for the AzFIT Program Design Wizard & Program Library
 *
 * Manages the full wizard state across 8 steps (goal → method → client context → phases →
 * weekly split → exercise review → preview → save/assign) plus the program library with
 * CRUD, duplication, and assignment actions. Demo exercise and method definitions are
 * bundled for offline-first operation.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

/** Training goal categories */
export type GoalType = 'lose-fat' | 'build-muscle' | 'strength' | 'endurance' | 'maintenance';

/** Difficulty tiers */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/** Single exercise within a program / day plan */
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

/** A training phase (mesocycle) */
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

/** A single day in the weekly split */
export interface DayPlan {
  dayOfWeek: string; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
  isRestDay: boolean;
  focus: string;
  estimatedTime: number;
  exercises: ProgramExercise[];
}

/** Complete program definition */
export interface Program {
  id: string;
  name: string;
  description: string;
  tags: string[];
  goal: GoalType;
  method: string;
  difficulty: DifficultyLevel;
  duration: number; // weeks
  frequency: number; // sessions per week
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

/** Wizard UI + draft state */
export interface WizardState {
  currentStep: number;
  selectedGoal: GoalType | null;
  selectedMethod: string | null;
  targetClientId: string | null;
  phases: ProgramPhase[];
  weeklySplit: DayPlan[];
  programName: string;
  tags: string[];
  description: string;
  draftSaved: boolean;
}

/** Training method metadata */
export interface MethodDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  goals: GoalType[];
  difficulty: DifficultyLevel;
  duration: number;
  frequency: number;
  equipment: string[];
  structure: string;
  phases: { name: string; weeks: number; focus: string }[];
  pros: string[];
  bestFor: string[];
}

/** Exercise metadata from the library */
export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: DifficultyLevel;
  description: string;
  videoUrl?: string;
}

/* ------------------------------------------------------------------ */
/*  DEMO DATA — Exercise Library                                       */
/* ------------------------------------------------------------------ */

export const EXERCISE_DEFINITIONS: ExerciseDefinition[] = [
  { id: 'ex-001', name: 'Barbell Back Squat', muscleGroup: 'Quads', equipment: 'Barbell', difficulty: 'intermediate', description: 'The king of leg exercises. Place bar on upper traps, squat to parallel or below.' },
  { id: 'ex-002', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', difficulty: 'intermediate', description: 'Classic horizontal press. Retract scapula, slight arch, controlled touch to chest.' },
  { id: 'ex-003', name: 'Conventional Deadlift', muscleGroup: 'Back', equipment: 'Barbell', difficulty: 'advanced', description: 'Full-body posterior chain pull. Keep neutral spine, drive through heels.' },
  { id: 'ex-004', name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell', difficulty: 'intermediate', description: 'Standing strict press. Brace core, drive bar vertically over mid-foot.' },
  { id: 'ex-005', name: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell', difficulty: 'intermediate', description: 'Hip-hinge row. Pull to lower chest, control eccentric.' },
  { id: 'ex-006', name: 'Dumbbell Lunge', muscleGroup: 'Quads', equipment: 'Dumbbells', difficulty: 'beginner', description: 'Walking or stationary lunge. Keep torso upright, controlled step.' },
  { id: 'ex-007', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbells', difficulty: 'beginner', description: 'Seated or standing. Full ROM, control the negative.' },
  { id: 'ex-008', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable', difficulty: 'beginner', description: 'Wide grip pull to upper chest. Drive elbows down and back.' },
  { id: 'ex-009', name: 'Cable Flye', muscleGroup: 'Chest', equipment: 'Cable', difficulty: 'beginner', description: 'Standing or bench flye. Squeeze pecs at peak contraction.' },
  { id: 'ex-010', name: 'Leg Press', muscleGroup: 'Quads', equipment: 'Machine', difficulty: 'beginner', description: 'Machine-based quad dominant press. Full ROM without locking knees.' },
  { id: 'ex-011', name: 'Pull-Up', muscleGroup: 'Back', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Bodyweight vertical pull. Dead hang to chin over bar.' },
  { id: 'ex-012', name: 'Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Parallel bar dips. Lean forward for chest, upright for triceps.' },
  { id: 'ex-013', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', equipment: 'Barbell', difficulty: 'intermediate', description: 'Hip hinge with slight knee bend. Feel hamstring stretch at bottom.' },
  { id: 'ex-014', name: 'Leg Curl', muscleGroup: 'Hamstrings', equipment: 'Machine', difficulty: 'beginner', description: 'Lying or seated hamstring curl. Control the negative fully.' },
  { id: 'ex-015', name: 'Calf Raise', muscleGroup: 'Calves', equipment: 'Machine', difficulty: 'beginner', description: 'Standing or seated calf raise. Full stretch and squeeze.' },
  { id: 'ex-016', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Static core hold. Neutral spine, squeeze glutes.' },
  { id: 'ex-017', name: 'Kettlebell Swing', muscleGroup: 'Posterior Chain', equipment: 'Kettlebell', difficulty: 'intermediate', description: 'Hip-power swing. Snap hips forward, float the bell.' },
  { id: 'ex-018', name: 'Box Jump', muscleGroup: 'Quads', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Explosive jump to box. Soft landing, full extension.' },
];

/* ------------------------------------------------------------------ */
/*  DEMO DATA — Training Methods                                       */
/* ------------------------------------------------------------------ */

export const METHOD_DEFINITIONS: MethodDefinition[] = [
  {
    id: 'method-gbc',
    name: 'German Body Composition',
    shortName: 'GBC',
    description: 'Charles Poliquin\'s classic GBC pairs antagonistic exercises in supersets with short rest (30-60s). High lactate production drives GH release for fat loss while preserving muscle.',
    goals: ['lose-fat', 'build-muscle'],
    difficulty: 'intermediate',
    duration: 6,
    frequency: 4,
    equipment: ['Barbell', 'Dumbbells', 'Cable', 'Machine'],
    structure: '6 exercises paired into 3 supersets. 3-4 sets of 10-12 reps per exercise. 30-60s rest between supersets.',
    phases: [{ name: 'Foundation', weeks: 6, focus: 'Work capacity & metabolic stress' }],
    pros: ['Time efficient (45 min sessions)', 'Drives fat loss while maintaining muscle', 'High calorie burn during & after'],
    bestFor: ['Clients with 4+ days/week availability', 'Intermediate trainees', 'Fat loss phases'],
  },
  {
    id: 'method-5x5',
    name: '5x5 Stronglifts',
    shortName: '5x5',
    description: 'The quintessential strength program. 5 sets of 5 reps on compound movements with progressive overload every session. Simple, effective, proven.',
    goals: ['strength', 'build-muscle'],
    difficulty: 'beginner',
    duration: 12,
    frequency: 3,
    equipment: ['Barbell', 'Squat Rack', 'Bench'],
    structure: 'Workout A: Squat 5x5, Bench 5x5, Row 5x5. Workout B: Squat 5x5, Press 5x5, Deadlift 1x5. Alternate A/B 3x/week.',
    phases: [
      { name: 'Linear Progression', weeks: 8, focus: 'Add 2.5kg per session' },
      { name: 'Advanced 5x5', weeks: 4, focus: 'Weekly progression & deload' },
    ],
    pros: ['Maximum strength development', 'Minimal equipment', 'Clear progression rules'],
    bestFor: ['Beginners', 'Strength-focused clients', 'Time-limited trainees'],
  },
  {
    id: 'method-ppl',
    name: 'Push Pull Legs',
    shortName: 'PPL',
    description: 'Classic bodybuilding split organizing training by movement pattern. Push (chest/shoulders/tris), Pull (back/bis), Legs (quads/hams/calves). High volume, high frequency.',
    goals: ['build-muscle', 'strength'],
    difficulty: 'intermediate',
    duration: 8,
    frequency: 6,
    equipment: ['Barbell', 'Dumbbells', 'Cable', 'Machine'],
    structure: 'Push Day: 5-6 pressing exercises. Pull Day: 5-6 pulling exercises. Leg Day: 5-6 leg exercises. 3-4 sets of 8-12 reps.',
    phases: [
      { name: 'Accumulation', weeks: 4, focus: 'Volume building, moderate intensity' },
      { name: 'Intensification', weeks: 4, focus: 'Heavier loads, lower reps' },
    ],
    pros: ['High frequency per muscle group', 'Clear structure', 'Scalable volume'],
    bestFor: ['Intermediate+ lifters', 'Clients with 5-6 days/week', 'Hypertrophy goals'],
  },
  {
    id: 'method-dup',
    name: 'Daily Undulating Periodization',
    shortName: 'DUP',
    description: 'DUP varies rep ranges and intensity across the week for the same muscle groups. Combines strength, hypertrophy, and power work in a microcycle.',
    goals: ['strength', 'build-muscle', 'endurance'],
    difficulty: 'advanced',
    duration: 8,
    frequency: 4,
    equipment: ['Barbell', 'Dumbbells', 'Cable', 'Machine'],
    structure: 'Day 1: Heavy (3-5 reps @ 80-85%). Day 2: Hypertrophy (8-12 reps @ 65-75%). Day 3: Power (2-3 reps @ 70-80% explosive). Day 4: Moderate (6-8 reps @ 70-78%).',
    phases: [
      { name: 'Base', weeks: 4, focus: 'Technique & work capacity' },
      { name: 'Peak', weeks: 4, focus: 'Strength expression & overload' },
    ],
    pros: ['Concurrent strength + size gains', 'Reduced overuse injuries', 'Scientifically validated'],
    bestFor: ['Advanced trainees', 'Athletes', 'Strength & size simultaneously'],
  },
  {
    id: 'method-hiit',
    name: 'HIIT Strength Circuit',
    shortName: 'HIIT',
    description: 'High-intensity interval training combining strength and conditioning. Short bursts of intense work with minimal rest. Maximum calorie burn, improved VO2 max.',
    goals: ['lose-fat', 'endurance', 'maintenance'],
    difficulty: 'intermediate',
    duration: 4,
    frequency: 3,
    equipment: ['Dumbbells', 'Kettlebell', 'Bodyweight'],
    structure: '30s work / 15s rest per exercise. 8-10 exercises per circuit. 3-4 rounds. 2-3 minutes between rounds.',
    phases: [{ name: 'Metabolic Conditioning', weeks: 4, focus: 'Work capacity & EPOC' }],
    pros: ['Maximum calorie burn', 'Improved cardiovascular fitness', 'Minimal equipment needed'],
    bestFor: ['Fat loss focused clients', 'Time-constrained trainees', 'Conditioning improvement'],
  },
  {
    id: 'method-ul',
    name: 'Upper / Lower Split',
    shortName: 'Upper/Lower',
    description: 'Splits training into upper body and lower body days. Balanced frequency with enough volume per session. Great for strength and muscle gain.',
    goals: ['build-muscle', 'strength', 'maintenance'],
    difficulty: 'beginner',
    duration: 8,
    frequency: 4,
    equipment: ['Barbell', 'Dumbbells', 'Cable', 'Machine'],
    structure: 'Upper A: Horizontal push/pull + arms. Lower A: Squat pattern + posterior chain. Upper B: Vertical push/pull + arms. Lower B: Hinge pattern + legs.',
    phases: [
      { name: 'Base Building', weeks: 4, focus: 'Technique & moderate volume' },
      { name: 'Development', weeks: 4, focus: 'Progressive overload & intensity' },
    ],
    pros: ['Balanced muscle development', 'Manageable session length', 'Good frequency for recovery'],
    bestFor: ['Beginners to intermediate', '4-day/week availability', 'Balanced strength & size'],
  },
];

/* ------------------------------------------------------------------ */
/*  DEMO DATA — Pre-built Programs                                     */
/* ------------------------------------------------------------------ */

const DEMO_PROGRAMS: Program[] = [
  {
    id: 'prog-001',
    name: 'GBC Fat Loss Protocol',
    description: 'German Body Composition program designed for rapid fat loss while preserving lean muscle mass. Uses antagonistic supersets with short rest periods.',
    tags: ['fat-loss', 'metabolic', 'supersets'],
    goal: 'lose-fat',
    method: 'method-gbc',
    difficulty: 'intermediate',
    duration: 6,
    frequency: 4,
    phases: [
      { id: 'phase-001', name: 'Foundation', weekStart: 1, weekEnd: 6, focus: 'Work capacity & metabolic stress', intensityTarget: 'RPE 8-9', volumeTarget: '24 sets/session', exercises: [] },
    ],
    weeklySplit: [
      { dayOfWeek: 'Mon', isRestDay: false, focus: 'Upper Body Supersets', estimatedTime: 45, exercises: [] },
      { dayOfWeek: 'Tue', isRestDay: false, focus: 'Lower Body Supersets', estimatedTime: 45, exercises: [] },
      { dayOfWeek: 'Wed', isRestDay: true, focus: 'Rest / Active Recovery', estimatedTime: 0, exercises: [] },
      { dayOfWeek: 'Thu', isRestDay: false, focus: 'Full Body Circuit', estimatedTime: 45, exercises: [] },
      { dayOfWeek: 'Fri', isRestDay: false, focus: 'Upper Body Supersets', estimatedTime: 45, exercises: [] },
      { dayOfWeek: 'Sat', isRestDay: true, focus: 'Rest', estimatedTime: 0, exercises: [] },
      { dayOfWeek: 'Sun', isRestDay: true, focus: 'Rest', estimatedTime: 0, exercises: [] },
    ],
    progressionRules: ['Add 1 set per exercise every 2 weeks', 'Reduce rest by 10s each week (floor at 30s)'],
    equipmentRequired: ['Barbell', 'Dumbbells', 'Cable Machine', 'Bench'],
    totalVolume: 288,
    estimatedTimePerSession: 45,
    timesUsed: 4,
    lastAssigned: '2025-04-15',
    createdAt: '2025-01-10',
    updatedAt: '2025-04-01',
  },
  {
    id: 'prog-002',
    name: '5x5 Strength Foundation',
    description: 'Beginner strength program focused on the big 5 compound lifts with linear progression.',
    tags: ['strength', 'compounds', 'beginner'],
    goal: 'strength',
    method: 'method-5x5',
    difficulty: 'beginner',
    duration: 12,
    frequency: 3,
    phases: [
      { id: 'phase-002', name: 'Linear Progression', weekStart: 1, weekEnd: 8, focus: 'Add 2.5kg per session', intensityTarget: '5x5 @ 80-85%', volumeTarget: '15 sets/session', exercises: [] },
      { id: 'phase-003', name: 'Advanced 5x5', weekStart: 9, weekEnd: 12, focus: 'Weekly progression & deload', intensityTarget: '5x5 @ 85-90%', volumeTarget: '12-15 sets/session', exercises: [] },
    ],
    weeklySplit: [
      { dayOfWeek: 'Mon', isRestDay: false, focus: 'Workout A: Squat/Bench/Row', estimatedTime: 60, exercises: [] },
      { dayOfWeek: 'Tue', isRestDay: true, focus: 'Rest', estimatedTime: 0, exercises: [] },
      { dayOfWeek: 'Wed', isRestDay: false, focus: 'Workout B: Squat/Press/DL', estimatedTime: 60, exercises: [] },
      { dayOfWeek: 'Thu', isRestDay: true, focus: 'Rest', estimatedTime: 0, exercises: [] },
      { dayOfWeek: 'Fri', isRestDay: false, focus: 'Workout A: Squat/Bench/Row', estimatedTime: 60, exercises: [] },
      { dayOfWeek: 'Sat', isRestDay: true, focus: 'Rest', estimatedTime: 0, exercises: [] },
      { dayOfWeek: 'Sun', isRestDay: true, focus: 'Rest', estimatedTime: 0, exercises: [] },
    ],
    progressionRules: ['Add 2.5kg to squat/press/bench every session', 'Add 5kg to deadlift every session', 'Deload 10% after 3 failed sessions'],
    equipmentRequired: ['Barbell', 'Squat Rack', 'Bench', 'Power Rack'],
    totalVolume: 180,
    estimatedTimePerSession: 60,
    timesUsed: 12,
    lastAssigned: '2025-05-01',
    createdAt: '2025-01-15',
    updatedAt: '2025-05-01',
  },
];

/* ------------------------------------------------------------------ */
/*  HELPER FUNCTIONS                                                   */
/* ------------------------------------------------------------------ */

const generateId = () => Math.random().toString(36).substring(2, 9);

const createEmptyDayPlan = (): DayPlan[] => [
  { dayOfWeek: 'Mon', isRestDay: false, focus: '', estimatedTime: 0, exercises: [] },
  { dayOfWeek: 'Tue', isRestDay: false, focus: '', estimatedTime: 0, exercises: [] },
  { dayOfWeek: 'Wed', isRestDay: false, focus: '', estimatedTime: 0, exercises: [] },
  { dayOfWeek: 'Thu', isRestDay: false, focus: '', estimatedTime: 0, exercises: [] },
  { dayOfWeek: 'Fri', isRestDay: false, focus: '', estimatedTime: 0, exercises: [] },
  { dayOfWeek: 'Sat', isRestDay: true,  focus: 'Rest', estimatedTime: 0, exercises: [] },
  { dayOfWeek: 'Sun', isRestDay: true,  focus: 'Rest', estimatedTime: 0, exercises: [] },
];

const defaultWizardState = (): WizardState => ({
  currentStep: 1,
  selectedGoal: null,
  selectedMethod: null,
  targetClientId: null,
  phases: [],
  weeklySplit: createEmptyDayPlan(),
  programName: '',
  tags: [],
  description: '',
  draftSaved: false,
});

/* ------------------------------------------------------------------ */
/*  STORE INTERFACE                                                    */
/* ------------------------------------------------------------------ */

interface ProgramState {
  // Library
  programs: Program[];

  // Wizard
  wizard: WizardState;

  // Data
  methods: MethodDefinition[];
  exercises: ExerciseDefinition[];

  // Actions
  setWizardStep: (step: number) => void;
  setWizardGoal: (goal: GoalType) => void;
  setWizardMethod: (method: string) => void;
  setWizardClient: (clientId: string | null) => void;
  addPhase: (phase: ProgramPhase) => void;
  removePhase: (phaseId: string) => void;
  updatePhase: (phaseId: string, data: Partial<ProgramPhase>) => void;
  setWeeklySplit: (split: DayPlan[]) => void;
  updateDayPlan: (dayOfWeek: string, data: Partial<DayPlan>) => void;
  addExerciseToDay: (dayOfWeek: string, exercise: ProgramExercise) => void;
  removeExerciseFromDay: (dayOfWeek: string, exerciseId: string) => void;
  swapExercise: (dayOfWeek: string, oldId: string, newExercise: ProgramExercise) => void;
  saveWizardDraft: () => void;
  loadWizardDraft: () => boolean;
  clearWizard: () => void;
  createProgram: (data: Partial<Program>) => Program;
  addProgram: (program: Program) => void;
  deleteProgram: (id: string) => void;
  duplicateProgram: (id: string) => void;
  assignProgram: (programId: string, clientId: string) => void;
  getMethodsForGoal: (goal: GoalType) => MethodDefinition[];
  getExercisesForMuscle: (muscle: string) => ExerciseDefinition[];
  autoPopulateExercises: (method: string, goal: GoalType) => ProgramExercise[];
}

/* ------------------------------------------------------------------ */
/*  ZUSTAND STORE                                                      */
/* ------------------------------------------------------------------ */

export const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      /* --- initial state --- */
      programs: DEMO_PROGRAMS,
      wizard: defaultWizardState(),
      methods: METHOD_DEFINITIONS,
      exercises: EXERCISE_DEFINITIONS,

      /* --- wizard navigation --- */
      setWizardStep: (step: number) =>
        set((state) => ({ wizard: { ...state.wizard, currentStep: step } })),

      setWizardGoal: (goal: GoalType) =>
        set((state) => ({
          wizard: { ...state.wizard, selectedGoal: goal, currentStep: 2 },
        })),

      setWizardMethod: (method: string) =>
        set((state) => {
          const methodDef = get().methods.find((m) => m.id === method);
          const newPhases: ProgramPhase[] = methodDef
            ? methodDef.phases.map((p, i) => ({
                id: `phase-${generateId()}`,
                name: p.name,
                weekStart: i === 0 ? 1 : methodDef.phases.slice(0, i).reduce((acc, cp) => acc + cp.weeks, 1),
                weekEnd: i === 0 ? p.weeks : methodDef.phases.slice(0, i + 1).reduce((acc, cp) => acc + cp.weeks, 0),
                focus: p.focus,
                intensityTarget: methodDef.difficulty === 'beginner' ? 'RPE 7-8' : methodDef.difficulty === 'intermediate' ? 'RPE 8-9' : 'RPE 9-10',
                volumeTarget: `${methodDef.frequency * 6} sets/muscle/week`,
                exercises: [],
              }))
            : [];
          return {
            wizard: {
              ...state.wizard,
              selectedMethod: method,
              phases: newPhases,
              currentStep: 3,
            },
          };
        }),

      setWizardClient: (clientId: string | null) =>
        set((state) => ({ wizard: { ...state.wizard, targetClientId: clientId } })),

      /* --- phase management --- */
      addPhase: (phase: ProgramPhase) =>
        set((state) => ({
          wizard: { ...state.wizard, phases: [...state.wizard.phases, phase] },
        })),

      removePhase: (phaseId: string) =>
        set((state) => ({
          wizard: {
            ...state.wizard,
            phases: state.wizard.phases.filter((p) => p.id !== phaseId),
          },
        })),

      updatePhase: (phaseId: string, data: Partial<ProgramPhase>) =>
        set((state) => ({
          wizard: {
            ...state.wizard,
            phases: state.wizard.phases.map((p) =>
              p.id === phaseId ? { ...p, ...data } : p
            ),
          },
        })),

      /* --- weekly split management --- */
      setWeeklySplit: (split: DayPlan[]) =>
        set((state) => ({ wizard: { ...state.wizard, weeklySplit: split } })),

      updateDayPlan: (dayOfWeek: string, data: Partial<DayPlan>) =>
        set((state) => ({
          wizard: {
            ...state.wizard,
            weeklySplit: state.wizard.weeklySplit.map((d) =>
              d.dayOfWeek === dayOfWeek ? { ...d, ...data } : d
            ),
          },
        })),

      addExerciseToDay: (dayOfWeek: string, exercise: ProgramExercise) =>
        set((state) => ({
          wizard: {
            ...state.wizard,
            weeklySplit: state.wizard.weeklySplit.map((d) =>
              d.dayOfWeek === dayOfWeek
                ? { ...d, exercises: [...d.exercises, { ...exercise, order: d.exercises.length }] }
                : d
            ),
          },
        })),

      removeExerciseFromDay: (dayOfWeek: string, exerciseId: string) =>
        set((state) => ({
          wizard: {
            ...state.wizard,
            weeklySplit: state.wizard.weeklySplit.map((d) =>
              d.dayOfWeek === dayOfWeek
                ? { ...d, exercises: d.exercises.filter((e) => e.exerciseId !== exerciseId) }
                : d
            ),
          },
        })),

      swapExercise: (dayOfWeek: string, oldId: string, newExercise: ProgramExercise) =>
        set((state) => ({
          wizard: {
            ...state.wizard,
            weeklySplit: state.wizard.weeklySplit.map((d) =>
              d.dayOfWeek === dayOfWeek
                ? {
                    ...d,
                    exercises: d.exercises.map((e) =>
                      e.exerciseId === oldId
                        ? { ...newExercise, order: e.order, isSubstituted: true, originalExerciseId: oldId }
                        : e
                    ),
                  }
                : d
            ),
          },
        })),

      /* --- draft persistence --- */
      saveWizardDraft: () => {
        const { wizard } = get();
        localStorage.setItem('azfit_wizard_draft', JSON.stringify(wizard));
        set((state) => ({ wizard: { ...state.wizard, draftSaved: true } }));
      },

      loadWizardDraft: () => {
        const raw = localStorage.getItem('azfit_wizard_draft');
        if (!raw) return false;
        try {
          const draft = JSON.parse(raw) as WizardState;
          set({ wizard: { ...draft, draftSaved: true } });
          return true;
        } catch {
          return false;
        }
      },

      clearWizard: () => {
        localStorage.removeItem('azfit_wizard_draft');
        set({ wizard: defaultWizardState() });
      },

      /* --- program CRUD --- */
      createProgram: (data: Partial<Program>) => {
        const now = new Date().toISOString();
        const program: Program = {
          id: `prog-${generateId()}`,
          name: data.name ?? 'Untitled Program',
          description: data.description ?? '',
          tags: data.tags ?? [],
          goal: data.goal ?? 'maintenance',
          method: data.method ?? '',
          difficulty: data.difficulty ?? 'intermediate',
          duration: data.duration ?? 4,
          frequency: data.frequency ?? 3,
          phases: data.phases ?? [],
          weeklySplit: data.weeklySplit ?? createEmptyDayPlan(),
          progressionRules: data.progressionRules ?? [],
          equipmentRequired: data.equipmentRequired ?? [],
          totalVolume: data.totalVolume ?? 0,
          estimatedTimePerSession: data.estimatedTimePerSession ?? 60,
          timesUsed: 0,
          lastAssigned: null,
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        set((state) => ({ programs: [...state.programs, program] }));
        return program;
      },

      addProgram: (program: Program) =>
        set((state) => ({ programs: [...state.programs, program] })),

      deleteProgram: (id: string) =>
        set((state) => ({
          programs: state.programs.filter((p) => p.id !== id),
        })),

      duplicateProgram: (id: string) => {
        const { programs } = get();
        const original = programs.find((p) => p.id === id);
        if (!original) return;
        const copy: Program = {
          ...original,
          id: `prog-${generateId()}`,
          name: `${original.name} (Copy)`,
          timesUsed: 0,
          lastAssigned: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ programs: [...programs, copy] });
      },

      assignProgram: (programId: string, clientId: string) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? { ...p, timesUsed: p.timesUsed + 1, lastAssigned: clientId }
              : p
          ),
        })),

      /* --- selectors / helpers --- */
      getMethodsForGoal: (goal: GoalType) => {
        return get().methods.filter((m) => m.goals.includes(goal));
      },

      getExercisesForMuscle: (muscle: string) => {
        return get().exercises.filter((e) => e.muscleGroup.toLowerCase() === muscle.toLowerCase());
      },

      autoPopulateExercises: (method: string, goal: GoalType) => {
        const { exercises } = get();
        const methodDef = get().methods.find((m) => m.id === method);
        if (!methodDef) return [];

        // Select exercises based on method structure and goal
        const selected: ProgramExercise[] = [];
        const muscleGroups = ['Chest', 'Back', 'Quads', 'Hamstrings', 'Shoulders', 'Core'];
        
        muscleGroups.forEach((muscle, i) => {
          const available = exercises.filter((e) => e.muscleGroup === muscle);
          if (available.length === 0) return;
          
          const ex = available[i % available.length];
          selected.push({
            exerciseId: ex.id,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            equipment: ex.equipment,
            sets: goal === 'strength' ? 5 : goal === 'endurance' ? 3 : 4,
            reps: goal === 'strength' ? '5' : goal === 'endurance' ? '15-20' : '8-12',
            weight: 'TBD',
            rest: methodDef.shortName === 'HIIT' ? '30s' : methodDef.shortName === '5x5' ? '3 min' : '60-90s',
            tempo: methodDef.shortName === 'GBC' ? '4-0-1-0' : '3-1-1-0',
            supersetWith: methodDef.shortName === 'GBC' && i % 2 === 0 && selected.length > 0 ? selected[selected.length - 1].exerciseId : null,
            order: i,
            notes: '',
            isSubstituted: false,
            originalExerciseId: null,
          });
        });

        return selected;
      },
    }),
    {
      name: 'azfit_programs',
      partialize: (state) => ({
        programs: state.programs,
        wizard: state.wizard,
      }),
    }
  )
);
