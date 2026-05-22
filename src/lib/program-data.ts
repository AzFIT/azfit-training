/**
 * AzFIT Program Design Wizard — demo data generators
 * Provides sample programs, exercise definitions, and helper utilities
 * for populating the wizard and program library with realistic demo content.
 */

import type {
  ExerciseDefinition,
  ExerciseType,
  DifficultyLevel,
  Program,
  DayPlan,
  ProgramPhase,
  ProgramExercise,
  GoalType,
} from '@/types/program';

// ─────────────────────────────────────────────────────────────────────────────
// Exercise Library — 30+ exercises covering all major muscle groups
// ─────────────────────────────────────────────────────────────────────────────

const EXERCISE_SEED_DATA: Array<{
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: DifficultyLevel;
  type: ExerciseType;
  description: string;
}> = [
  {
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'The king of chest exercises. Lie on a flat bench and press the barbell from chest to full arm extension.',
  },
  {
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Fundamental lower-body exercise. Place barbell on upper back, squat until thighs are parallel to floor.',
  },
  {
    name: 'Conventional Deadlift',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    difficulty: 'advanced',
    type: 'compound',
    description: 'Full-body pulling exercise. Lift barbell from floor to hip level with neutral spine throughout.',
  },
  {
    name: 'Standing Overhead Press',
    muscleGroup: 'Shoulders',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Press barbell from shoulder to overhead. Builds strong deltoids and triceps.',
  },
  {
    name: 'Bent Over Barbell Row',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Hinge at hips and pull barbell toward lower chest. Builds thickness in lats and rhomboids.',
  },
  {
    name: 'Walking Lunge',
    muscleGroup: 'Legs',
    equipment: 'Dumbbell',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Step forward into lunge position, alternating legs. Great for leg development and balance.',
  },
  {
    name: 'Pull-up',
    muscleGroup: 'Back',
    equipment: 'Pull-up Bar',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Hang from bar and pull body up until chin clears. Wide grip targets lats; close grip hits rhomboids.',
  },
  {
    name: 'Parallel Bar Dip',
    muscleGroup: 'Chest',
    equipment: 'Dip Station',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Lower body between parallel bars until shoulders are below elbows, then press back up.',
  },
  {
    name: 'Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell',
    difficulty: 'beginner',
    type: 'compound',
    description: 'Seated or standing, press dumbbells from shoulder height to full overhead extension.',
  },
  {
    name: 'Romanian Deadlift',
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Hinge at hips lowering bar along thighs until hamstrings stretch, then squeeze glutes to stand.',
  },
  {
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    equipment: 'Dumbbell',
    difficulty: 'beginner',
    type: 'compound',
    description: 'Press dumbbells on a 30-45° incline bench. Targets upper chest and front delts.',
  },
  {
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Cable',
    difficulty: 'beginner',
    type: 'compound',
    description: 'Pull cable bar down to upper chest. Excellent for building lat width.',
  },
  {
    name: 'Cable Row',
    muscleGroup: 'Back',
    equipment: 'Cable',
    difficulty: 'beginner',
    type: 'compound',
    description: 'Seated row pulling cable attachment toward midsection. Squeeze shoulder blades together.',
  },
  {
    name: 'Leg Press',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    difficulty: 'beginner',
    type: 'compound',
    description: 'Push weight away on 45° leg press machine. Full range of motion for quad development.',
  },
  {
    name: 'Leg Curl',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Lie face down and curl heels toward glutes. Isolates hamstrings.',
  },
  {
    name: 'Leg Extension',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Extend knees against padded bar. Isolates quadriceps for definition and strength.',
  },
  {
    name: 'Dumbbell Bicep Curl',
    muscleGroup: 'Arms',
    equipment: 'Dumbbell',
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Curl dumbbells from full extension to peak contraction. Keep elbows stationary.',
  },
  {
    name: 'Tricep Rope Pushdown',
    muscleGroup: 'Arms',
    equipment: 'Cable',
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Push rope attachment down until arms are fully extended. Squeeze triceps at bottom.',
  },
  {
    name: 'Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell',
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Raise dumbbells to side until arms are parallel with floor. Builds shoulder width.',
  },
  {
    name: 'Face Pull',
    muscleGroup: 'Shoulders',
    equipment: 'Cable',
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Pull rope attachment toward face, externally rotating shoulders. Great for rear delts and posture.',
  },
  {
    name: 'Plank',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Hold push-up position on forearms. Maintain straight line from head to heels.',
  },
  {
    name: 'Hanging Leg Raise',
    muscleGroup: 'Core',
    equipment: 'Pull-up Bar',
    difficulty: 'intermediate',
    type: 'isolation',
    description: 'Hang from bar and raise legs to 90°. Advanced variation: raise all the way to bar.',
  },
  {
    name: 'Pallof Press',
    muscleGroup: 'Core',
    equipment: 'Cable',
    difficulty: 'intermediate',
    type: 'isolation',
    description: 'Anti-rotation core exercise. Press cable away from body while resisting rotation.',
  },
  {
    name: 'Barbell Hip Thrust',
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Place upper back on bench, thrust hips upward squeezing glutes. Peak contraction at top.',
  },
  {
    name: 'Chest-Supported Row',
    muscleGroup: 'Back',
    equipment: 'Machine',
    difficulty: 'beginner',
    type: 'compound',
    description: 'Lie face down on incline bench and row dumbbells. Eliminates momentum, isolates back muscles.',
  },
  {
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Legs',
    equipment: 'Dumbbell',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Rear foot elevated on bench. Single-leg squat variation for unilateral leg strength.',
  },
  {
    name: 'Cable Fly',
    muscleGroup: 'Chest',
    equipment: 'Cable',
    difficulty: 'intermediate',
    type: 'isolation',
    description: 'Stand between cable stacks and bring handles together in wide arc. Squeeze pecs at peak.',
  },
  {
    name: 'Skull Crusher',
    muscleGroup: 'Arms',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    type: 'isolation',
    description: 'Lie on bench, lower bar to forehead by bending elbows, extend back up. Isolates triceps long head.',
  },
  {
    name: 'Hammer Curl',
    muscleGroup: 'Arms',
    equipment: 'Dumbbell',
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Neutral grip curl targeting brachialis and forearms. Keep elbows pinned to sides.',
  },
  {
    name: 'Power Clean',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    difficulty: 'advanced',
    type: 'olympic',
    description: 'Explosive pull from floor to front rack position. Full-body power development.',
  },
  {
    name: 'Front Squat',
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    difficulty: 'advanced',
    type: 'compound',
    description: 'Barbell rests on front delts. Upright torso emphasizes quads and core stability.',
  },
  {
    name: 'Close-Grip Bench Press',
    muscleGroup: 'Arms',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    type: 'compound',
    description: 'Narrow grip bench press emphasizing triceps. Keep elbows tucked to sides.',
  },
  {
    name: 'Seated Calf Raise',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    difficulty: 'beginner',
    type: 'isolation',
    description: 'Seated calf raise targeting soleus muscle. Hold peak contraction for 1 second.',
  },
  {
    name: 'Ab Wheel Rollout',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'intermediate',
    type: 'isolation',
    description: 'Kneel and roll wheel forward until body is near parallel. Maintain neutral spine throughout.',
  },
];

/** Generate the full exercise library with IDs */
export function generateExerciseLibrary(): ExerciseDefinition[] {
  return EXERCISE_SEED_DATA.map((ex, i) => ({
    ...ex,
    id: `ex-${String(i + 1).padStart(3, '0')}`,
  }));
}

/** Cache for exercise library to avoid regeneration */
let _exerciseLibrary: ExerciseDefinition[] | null = null;

/** Get cached exercise library */
export function getExerciseLibrary(): ExerciseDefinition[] {
  if (!_exerciseLibrary) {
    _exerciseLibrary = generateExerciseLibrary();
  }
  return _exerciseLibrary;
}

/** Look up an exercise definition by ID */
export function getExerciseById(id: string): ExerciseDefinition | undefined {
  return getExerciseLibrary().find((e) => e.id === id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Program Exercise Generators
// ─────────────────────────────────────────────────────────────────────────────

/** Create a ProgramExercise from an ExerciseDefinition with default parameters */
export function createProgramExercise(
  exercise: ExerciseDefinition,
  order: number,
  overrides: Partial<ProgramExercise> = {}
): ProgramExercise {
  return {
    exerciseId: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
    sets: 3,
    reps: '8-10',
    weight: 'RPE 8',
    rest: '90s',
    tempo: '3010',
    supersetWith: null,
    order,
    notes: '',
    isSubstituted: false,
    originalExerciseId: null,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Weekly Splits
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a 4-day Upper/Lower split with exercises */
export function generateUpperLowerSplit(): DayPlan[] {
  const lib = getExerciseLibrary();
  const find = (name: string) => lib.find((e) => e.name === name)!;

  const upper1Exercises: ProgramExercise[] = [
    createProgramExercise(find('Barbell Bench Press'), 1, { sets: 4, reps: '6-8', rest: '2-3 min' }),
    createProgramExercise(find('Bent Over Barbell Row'), 2, { sets: 4, reps: '6-8', rest: '2-3 min' }),
    createProgramExercise(find('Standing Overhead Press'), 3, { sets: 3, reps: '8-10', rest: '90s' }),
    createProgramExercise(find('Lat Pulldown'), 4, { sets: 3, reps: '10-12', rest: '60s' }),
    createProgramExercise(find('Dumbbell Bicep Curl'), 5, { sets: 3, reps: '10-12', rest: '60s' }),
    createProgramExercise(find('Tricep Rope Pushdown'), 6, { sets: 3, reps: '10-12', rest: '60s' }),
    createProgramExercise(find('Lateral Raise'), 7, { sets: 3, reps: '12-15', rest: '45s' }),
  ];

  // Add superset pairings A1/A2
  upper1Exercises[0].supersetWith = null; // Bench — main lift
  upper1Exercises[1].supersetWith = null; // Row — main lift
  upper1Exercises[4].supersetWith = 'ex-018'; // Bicep curl supersets with tricep
  upper1Exercises[5].supersetWith = 'ex-017'; // Tricep pushdown supersets with bicep

  const lower1Exercises: ProgramExercise[] = [
    createProgramExercise(find('Barbell Back Squat'), 1, { sets: 4, reps: '6-8', rest: '2-3 min' }),
    createProgramExercise(find('Romanian Deadlift'), 2, { sets: 4, reps: '8-10', rest: '2 min' }),
    createProgramExercise(find('Bulgarian Split Squat'), 3, { sets: 3, reps: '10-12', rest: '90s' }),
    createProgramExercise(find('Leg Curl'), 4, { sets: 3, reps: '12-15', rest: '60s' }),
    createProgramExercise(find('Leg Extension'), 5, { sets: 3, reps: '12-15', rest: '60s' }),
    createProgramExercise(find('Seated Calf Raise'), 6, { sets: 4, reps: '15-20', rest: '45s' }),
    createProgramExercise(find('Plank'), 7, { sets: 3, reps: '45s', rest: '30s', tempo: 'N/A' }),
  ];

  const upper2Exercises: ProgramExercise[] = [
    createProgramExercise(find('Incline Dumbbell Press'), 1, { sets: 4, reps: '8-10', rest: '2 min' }),
    createProgramExercise(find('Pull-up'), 2, { sets: 4, reps: '8-10', rest: '2 min' }),
    createProgramExercise(find('Dumbbell Shoulder Press'), 3, { sets: 3, reps: '10-12', rest: '90s' }),
    createProgramExercise(find('Cable Row'), 4, { sets: 3, reps: '10-12', rest: '60s' }),
    createProgramExercise(find('Cable Fly'), 5, { sets: 3, reps: '12-15', rest: '60s' }),
    createProgramExercise(find('Face Pull'), 6, { sets: 3, reps: '15-20', rest: '45s' }),
    createProgramExercise(find('Hammer Curl'), 7, { sets: 3, reps: '10-12', rest: '60s' }),
  ];

  const lower2Exercises: ProgramExercise[] = [
    createProgramExercise(find('Conventional Deadlift'), 1, { sets: 4, reps: '5', rest: '3 min' }),
    createProgramExercise(find('Front Squat'), 2, { sets: 4, reps: '6-8', rest: '2-3 min' }),
    createProgramExercise(find('Walking Lunge'), 3, { sets: 3, reps: '12 each', rest: '90s' }),
    createProgramExercise(find('Barbell Hip Thrust'), 4, { sets: 3, reps: '10-12', rest: '90s' }),
    createProgramExercise(find('Hanging Leg Raise'), 5, { sets: 3, reps: '12-15', rest: '60s' }),
    createProgramExercise(find('Pallof Press'), 6, { sets: 3, reps: '12 each', rest: '45s' }),
  ];

  const days: DayPlan[] = [
    { dayOfWeek: 'Mon', isRestDay: false, focus: 'Upper Body — Push Focus', estimatedTime: 58, exercises: upper1Exercises },
    { dayOfWeek: 'Tue', isRestDay: false, focus: 'Lower Body — Quad & Hamstring', estimatedTime: 52, exercises: lower1Exercises },
    { dayOfWeek: 'Wed', isRestDay: true, focus: 'Rest Day — Active recovery optional', estimatedTime: 0, exercises: [] },
    { dayOfWeek: 'Thu', isRestDay: false, focus: 'Upper Body — Pull Focus', estimatedTime: 55, exercises: upper2Exercises },
    { dayOfWeek: 'Fri', isRestDay: false, focus: 'Lower Body — Posterior Chain', estimatedTime: 50, exercises: lower2Exercises },
    { dayOfWeek: 'Sat', isRestDay: true, focus: 'Rest Day — Active recovery optional', estimatedTime: 0, exercises: [] },
    { dayOfWeek: 'Sun', isRestDay: true, focus: 'Rest Day — Complete rest', estimatedTime: 0, exercises: [] },
  ];

  return days;
}

/** Generate a default 4-week program with the upper/lower split */
export function generateDemoProgram(goal: GoalType = 'build-muscle'): Program {
  const split = generateUpperLowerSplit();
  const now = new Date().toISOString();

  // Calculate total volume (sets × exercises across all training days)
  const totalVolume = split.reduce(
    (acc, day) => acc + day.exercises.reduce((dAcc, ex) => dAcc + ex.sets, 0),
    0
  );

  // Calculate average session time
  const trainingDays = split.filter((d) => !d.isRestDay);
  const avgTime = Math.round(
    trainingDays.reduce((acc, d) => acc + d.estimatedTime, 0) / trainingDays.length
  );

  // Build phases
  const phases: ProgramPhase[] = [
    {
      id: 'phase-1',
      name: 'Hypertrophy Foundation',
      weekStart: 1,
      weekEnd: 2,
      focus: 'Build work capacity and muscle base',
      intensityTarget: 'RPE 7-8, 65-75% 1RM',
      volumeTarget: 'Moderate: 15-20 sets per muscle/week',
      exercises: split.flatMap((d) => d.exercises),
    },
    {
      id: 'phase-2',
      name: 'Strength Accumulation',
      weekStart: 3,
      weekEnd: 4,
      focus: 'Increase load while maintaining volume',
      intensityTarget: 'RPE 8-9, 75-85% 1RM',
      volumeTarget: 'High: 20-22 sets per muscle/week',
      exercises: split.flatMap((d) =>
        d.exercises.map((e) => ({
          ...e,
          reps: e.reps === '12-15' ? '10-12' : e.reps === '10-12' ? '8-10' : e.reps === '8-10' ? '6-8' : e.reps,
        }))
      ),
    },
  ];

  const goalLabels: Record<GoalType, string> = {
    'lose-fat': 'Fat Loss',
    'build-muscle': 'Muscle Building',
    strength: 'Strength',
    endurance: 'Endurance',
    maintenance: 'Maintenance',
  };

  return {
    id: 'prog-demo-001',
    name: `${goalLabels[goal]} — Upper/Lower Split`,
    description: `A 4-week ${goalLabels[goal].toLowerCase()} program using an upper/lower split. Designed for intermediate lifters with compound movements as the foundation and progressive overload across two phases.`,
    tags: [goalLabels[goal], 'Upper/Lower', 'Intermediate', '4 Weeks'],
    goal,
    method: 'Upper/Lower Split',
    difficulty: 'intermediate',
    duration: 4,
    frequency: 4,
    phases,
    weeklySplit: split,
    progressionRules: [
      'Add 2.5kg to upper body lifts when you hit the top of the rep range',
      'Add 5kg to lower body lifts when you hit the top of the rep range',
      'Deload if you fail to progress for 2 consecutive sessions',
      'Reduce volume by 40% in week 5 if continuing to a new phase',
    ],
    equipmentRequired: ['Barbell', 'Dumbbell', 'Cable Machine', 'Pull-up Bar', 'Dip Station', 'Leg Press Machine'],
    totalVolume,
    estimatedTimePerSession: avgTime,
    timesUsed: 3,
    lastAssigned: now.split('T')[0],
    createdAt: now,
    updatedAt: now,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Program Library Demo Data
// ─────────────────────────────────────────────────────────────────────────────

/** Generate 8 sample programs for the library */
export function generateProgramLibrary(): Program[] {
  const now = new Date();
  const dateStr = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const programs: Program[] = [
    {
      ...generateDemoProgram('build-muscle'),
      id: 'prog-001',
      name: 'Hypertrophy — Upper/Lower Split',
      tags: ['Muscle Building', 'Upper/Lower', 'Intermediate', '4 Weeks'],
      timesUsed: 12,
      lastAssigned: dateStr(3),
      createdAt: dateStr(90),
    },
    {
      ...generateDemoProgram('strength'),
      id: 'prog-002',
      name: 'Strength — 5x5 Foundation',
      description: 'Classic 5x5 strength program focused on the big three lifts. 3 full-body sessions per week with progressive overload.',
      tags: ['Strength', 'Full Body', 'Beginner', '6 Weeks'],
      method: '5x5 Full Body',
      difficulty: 'beginner',
      duration: 6,
      frequency: 3,
      timesUsed: 8,
      lastAssigned: dateStr(14),
      createdAt: dateStr(120),
    },
    {
      ...generateDemoProgram('lose-fat'),
      id: 'prog-003',
      name: 'Fat Loss — Metabolic Conditioning',
      description: 'High-intensity program combining strength circuits with conditioning. Designed to maximize calorie burn and preserve lean mass.',
      tags: ['Fat Loss', 'Circuit', 'Intermediate', '8 Weeks'],
      method: 'Circuit Training',
      difficulty: 'intermediate',
      duration: 8,
      frequency: 5,
      timesUsed: 5,
      lastAssigned: dateStr(7),
      createdAt: dateStr(60),
    },
    {
      ...generateDemoProgram('endurance'),
      id: 'prog-004',
      name: 'Endurance — Athlete Prep',
      description: 'Sport-specific conditioning with emphasis on work capacity, muscular endurance, and recovery optimization.',
      tags: ['Endurance', 'Athletic', 'Advanced', '6 Weeks'],
      method: 'Athletic Performance',
      difficulty: 'advanced',
      duration: 6,
      frequency: 5,
      timesUsed: 2,
      lastAssigned: dateStr(30),
      createdAt: dateStr(45),
    },
    {
      ...generateDemoProgram('maintenance'),
      id: 'prog-005',
      name: 'Maintenance — Balanced Fitness',
      description: 'Well-rounded 3-day program for maintaining strength and conditioning. Perfect for busy schedules.',
      tags: ['Maintenance', 'Full Body', 'Beginner', 'Ongoing'],
      method: 'Full Body',
      difficulty: 'beginner',
      duration: 12,
      frequency: 3,
      timesUsed: 20,
      lastAssigned: dateStr(1),
      createdAt: dateStr(180),
    },
    {
      ...generateDemoProgram('build-muscle'),
      id: 'prog-006',
      name: 'Push Pull Legs — Hypertrophy',
      description: '6-day PPL split for maximum volume and muscle growth. Each muscle group trained twice per week.',
      tags: ['Muscle Building', 'PPL', 'Advanced', '8 Weeks'],
      method: 'Push Pull Legs',
      difficulty: 'advanced',
      duration: 8,
      frequency: 6,
      timesUsed: 4,
      lastAssigned: dateStr(10),
      createdAt: dateStr(75),
    },
    {
      ...generateDemoProgram('strength'),
      id: 'prog-007',
      name: 'Powerlifting — Peak Strength',
      description: 'Advanced peaking program for powerlifting competition prep. Heavy singles, doubles, and triples with meticulous periodization.',
      tags: ['Strength', 'Powerlifting', 'Advanced', '12 Weeks'],
      method: 'Powerlifting Peaking',
      difficulty: 'advanced',
      duration: 12,
      frequency: 4,
      timesUsed: 1,
      lastAssigned: dateStr(60),
      createdAt: dateStr(30),
    },
    {
      ...generateDemoProgram('lose-fat'),
      id: 'prog-008',
      name: 'HIIT & Strength — Fat Burner',
      description: 'Combines high-intensity interval training with resistance work. 4-day split optimized for metabolic demand.',
      tags: ['Fat Loss', 'HIIT', 'Intermediate', '4 Weeks'],
      method: 'HIIT + Strength Hybrid',
      difficulty: 'intermediate',
      duration: 4,
      frequency: 4,
      timesUsed: 6,
      lastAssigned: dateStr(5),
      createdAt: dateStr(50),
    },
  ];

  // Ensure each program has its own weeklySplit for demo purposes
  programs.forEach((p) => {
    if (!p.weeklySplit || p.weeklySplit.length === 0) {
      p.weeklySplit = generateUpperLowerSplit();
    }
    // Recalculate total volume
    p.totalVolume = p.weeklySplit.reduce(
      (acc, day) => acc + day.exercises.reduce((dAcc, ex) => dAcc + ex.sets, 0),
      0
    );
    const trainingDays = p.weeklySplit.filter((d) => !d.isRestDay);
    p.estimatedTimePerSession = trainingDays.length
      ? Math.round(trainingDays.reduce((acc, d) => acc + d.estimatedTime, 0) / trainingDays.length)
      : 0;
  });

  return programs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Calculate muscle group distribution from a list of exercises */
export function calculateMuscleDistribution(exercises: ProgramExercise[]): Array<{
  muscleGroup: string;
  sets: number;
  percentage: number;
}> {
  const grouped: Record<string, number> = {};
  let totalSets = 0;

  exercises.forEach((ex) => {
    grouped[ex.muscleGroup] = (grouped[ex.muscleGroup] || 0) + ex.sets;
    totalSets += ex.sets;
  });

  if (totalSets === 0) return [];

  return Object.entries(grouped)
    .map(([muscleGroup, sets]) => ({
      muscleGroup,
      sets,
      percentage: Math.round((sets / totalSets) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

/** Get goal label for display */
export function getGoalLabel(goal: GoalType): string {
  const labels: Record<GoalType, string> = {
    'lose-fat': 'Lose Fat',
    'build-muscle': 'Build Muscle',
    strength: 'Strength',
    endurance: 'Endurance',
    maintenance: 'Maintenance',
  };
  return labels[goal];
}

/** Get goal badge color class */
export function getGoalColor(goal: GoalType): string {
  const colors: Record<GoalType, string> = {
    'lose-fat': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'build-muscle': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    strength: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    endurance: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    maintenance: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };
  return colors[goal];
}

/** Get difficulty badge color class */
export function getDifficultyColor(diff: DifficultyLevel): string {
  const colors: Record<DifficultyLevel, string> = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[diff];
}

/** Get unique muscle groups from exercise library */
export function getMuscleGroups(): string[] {
  const groups = new Set(getExerciseLibrary().map((e) => e.muscleGroup));
  return ['All', ...Array.from(groups).sort()];
}

/** Get unique equipment types from exercise library */
export function getEquipmentTypes(): string[] {
  const eq = new Set(getExerciseLibrary().map((e) => e.equipment));
  return ['All', ...Array.from(eq).sort()];
}
