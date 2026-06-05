/**
 * Centralized Demo Data Generator
 *
 * Single source for all synthetic data. Replaces:
 *   - generateClients() from lib/demo-data.ts
 *   - generateSessions() from lib/demo-data.ts
 *   - generateAlerts() from lib/demo-data.ts
 *   - generateNotifications() from lib/demo-data.ts
 *   - useAuthStore.generateSyntheticData()
 *   - useProgramStore DEMO_PROGRAMS
 *   - useCalendarStore default events
 *
 * Returns data in the normalized shape expected by useAppDataStore.
 */

import { format, subDays } from 'date-fns'
import type {
  Client,
  Program,
  Exercise,
  CalendarSession,
  ClientProgramAssignment,
  ClientAlert,
  AppNotification,
  WorkoutCategory,
  WorkoutLevel,
  TrainingMethod,
} from '../types/entities'

// ── Helpers ────────────────────────────────────────────────────────

let _idCounter = 0
const genId = () => `demo_${++_idCounter}_${Math.random().toString(36).slice(2, 6)}`

const randomDateWithin = (days: number): string => {
  const d = subDays(new Date(), Math.floor(Math.random() * days))
  return d.toISOString().split('T')[0]
}

const todayISO = () => format(new Date(), 'yyyy-MM-dd')

// ── Reference Data ─────────────────────────────────────────────────

const CATEGORIES: WorkoutCategory[] = [
  { categoryId: 1, categoryName: 'Lose Weight', description: 'Fat loss focused programs' },
  { categoryId: 2, categoryName: 'Build Muscle', description: 'Hypertrophy focused programs' },
  { categoryId: 3, categoryName: 'Strength', description: 'Maximal strength development' },
  { categoryId: 4, categoryName: 'Hypertrophy', description: 'Muscle growth specialization' },
  { categoryId: 5, categoryName: 'Endurance', description: 'Cardiovascular and muscular endurance' },
  { categoryId: 6, categoryName: 'Fat Loss', description: 'Body recomposition protocols' },
  { categoryId: 7, categoryName: 'General Fitness', description: 'Well-rounded fitness programs' },
  { categoryId: 8, categoryName: 'Sports Performance', description: 'Athletic performance enhancement' },
]

const LEVELS: WorkoutLevel[] = [
  { levelId: 1, levelName: 'Beginner', description: 'New to structured training' },
  { levelId: 2, levelName: 'Intermediate', description: '6+ months consistent training' },
  { levelId: 3, levelName: 'Advanced', description: '2+ years structured training' },
  { levelId: 4, levelName: 'Elite', description: 'Competition-level athlete' },
]

const METHODS: TrainingMethod[] = [
  {
    id: 'method-gbc',
    name: 'German Body Composition',
    shortName: 'GBC',
    description: "Charles Poliquin's classic GBC pairs antagonistic exercises in supersets with short rest (30-60s). High lactate production drives GH release for fat loss while preserving muscle.",
    goals: ['lose-fat', 'build-muscle'],
    difficulty: 'intermediate',
    duration: 6,
    frequency: 4,
    equipment: ['Barbell', 'Dumbbells', 'Cable', 'Machine'],
  },
  {
    id: 'method-5x5',
    name: '5x5 Stronglifts',
    shortName: '5x5',
    description: 'The quintessential strength program. 5 sets of 5 reps on compound movements with progressive overload every session.',
    goals: ['strength', 'build-muscle'],
    difficulty: 'beginner',
    duration: 12,
    frequency: 3,
    equipment: ['Barbell', 'Squat Rack', 'Bench'],
  },
  {
    id: 'method-ppl',
    name: 'Push Pull Legs',
    shortName: 'PPL',
    description: 'Classic bodybuilding split organizing training by movement pattern. Push (chest/shoulders/tris), Pull (back/bis), Legs (quads/hams/calves).',
    goals: ['build-muscle', 'strength'],
    difficulty: 'intermediate',
    duration: 8,
    frequency: 6,
    equipment: ['Barbell', 'Dumbbells', 'Cable', 'Machine'],
  },
  {
    id: 'method-dup',
    name: 'Daily Undulating Periodization',
    shortName: 'DUP',
    description: 'DUP varies rep ranges and intensity across the week for the same muscle groups. Combines strength, hypertrophy, and power work.',
    goals: ['strength', 'build-muscle', 'endurance'],
    difficulty: 'advanced',
    duration: 8,
    frequency: 4,
    equipment: ['Barbell', 'Dumbbells', 'Cable', 'Machine'],
  },
  {
    id: 'method-hiit',
    name: 'HIIT Strength Circuit',
    shortName: 'HIIT',
    description: 'High-intensity interval training combining strength and conditioning. Short bursts of intense work with minimal rest.',
    goals: ['lose-fat', 'endurance', 'maintenance'],
    difficulty: 'intermediate',
    duration: 4,
    frequency: 3,
    equipment: ['Dumbbells', 'Kettlebell', 'Bodyweight'],
  },
  {
    id: 'method-ul',
    name: 'Upper / Lower Split',
    shortName: 'Upper/Lower',
    description: 'Splits training into upper body and lower body days. Balanced frequency with enough volume per session.',
    goals: ['build-muscle', 'strength', 'maintenance'],
    difficulty: 'beginner',
    duration: 8,
    frequency: 4,
    equipment: ['Barbell', 'Dumbbells', 'Cable', 'Machine'],
  },
]

// ── Demo Programs ──────────────────────────────────────────────────

const PROGRAM_TEMPLATES: Omit<Program, 'id' | 'timesUsed' | 'lastAssigned' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'GBC Fat Loss Protocol',
    description: 'German Body Composition program designed for rapid fat loss while preserving lean muscle mass.',
    tags: ['fat-loss', 'metabolic', 'supersets'],
    goal: 'lose-fat',
    difficulty: 'intermediate',
    durationWeeks: 6,
    daysPerWeek: 4,
    sessionDurationMinutes: 45,
    categoryId: 1,
    levelId: 2,
    difficultyRating: 7,
    trainingSplit: 'Upper/Lower',
    periodizationPhase: 'General Preparation',
  },
  {
    name: '5x5 Strength Foundation',
    description: 'Beginner strength program focused on the big 5 compound lifts with linear progression.',
    tags: ['strength', 'compounds', 'beginner'],
    goal: 'strength',
    difficulty: 'beginner',
    durationWeeks: 12,
    daysPerWeek: 3,
    sessionDurationMinutes: 60,
    categoryId: 3,
    levelId: 1,
    difficultyRating: 5,
    trainingSplit: 'Full Body',
    periodizationPhase: 'Linear Progression',
  },
  {
    name: 'PPL Hypertrophy Block',
    description: 'High-volume push/pull/legs split for maximum muscle growth.',
    tags: ['hypertrophy', 'bodybuilding', 'volume'],
    goal: 'build-muscle',
    difficulty: 'intermediate',
    durationWeeks: 8,
    daysPerWeek: 6,
    sessionDurationMinutes: 75,
    categoryId: 4,
    levelId: 2,
    difficultyRating: 8,
    trainingSplit: 'Push/Pull/Legs',
    periodizationPhase: 'Accumulation',
  },
  {
    name: 'DUP Advanced Strength',
    description: 'Daily undulating periodization for advanced trainees seeking concurrent strength and size gains.',
    tags: ['strength', 'periodization', 'advanced'],
    goal: 'strength',
    difficulty: 'advanced',
    durationWeeks: 8,
    daysPerWeek: 4,
    sessionDurationMinutes: 90,
    categoryId: 3,
    levelId: 3,
    difficultyRating: 9,
    trainingSplit: 'Upper/Lower',
    periodizationPhase: 'Daily Undulation',
  },
  {
    name: 'HIIT Metabolic Burn',
    description: 'High-intensity interval training for maximum calorie burn and conditioning improvement.',
    tags: ['hiit', 'fat-loss', 'conditioning'],
    goal: 'lose-fat',
    difficulty: 'intermediate',
    durationWeeks: 4,
    daysPerWeek: 3,
    sessionDurationMinutes: 30,
    categoryId: 6,
    levelId: 2,
    difficultyRating: 6,
    trainingSplit: 'Full Body',
    periodizationPhase: 'Metabolic Conditioning',
  },
  {
    name: 'Body Recomposition Basics',
    description: 'Upper/lower split designed for beginners to build strength and lose fat simultaneously.',
    tags: ['recomp', 'beginner', 'balanced'],
    goal: 'build-muscle',
    difficulty: 'beginner',
    durationWeeks: 8,
    daysPerWeek: 4,
    sessionDurationMinutes: 50,
    categoryId: 7,
    levelId: 1,
    difficultyRating: 4,
    trainingSplit: 'Upper/Lower',
    periodizationPhase: 'Base Building',
  },
]

// ── Demo Clients ───────────────────────────────────────────────────

const FIRST_NAMES = ['Sarah', 'Marcus', 'David', 'Jane', 'Michael', 'Emma', 'James', 'Lisa', 'Robert', 'Anna', 'John', 'Maria']
const LAST_NAMES = ['Chen', 'Tan', 'Lim', 'Wong', 'Lee', 'Ng', 'Koh', 'Ong', 'Goh', 'Chua', 'Sim', 'Teo']
const GOALS = [
  'Build muscle and increase strength',
  'Lose 5kg body fat in 3 months',
  'Improve cardiovascular endurance',
  'Rehabilitate shoulder injury',
  'General health and fitness',
  'Prepare for marathon',
  'Increase flexibility and mobility',
  'Body recomposition',
]

const PROGRAM_DISPLAY_NAMES = ['Strength', 'Weight Loss', 'Endurance', 'Hypertrophy', 'Rehabilitation', 'General Fitness']

function generateClients(): Client[] {
  return Array.from({ length: 12 }, (_, i) => {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length]
    const lastName = LAST_NAMES[i % LAST_NAMES.length]
    const isActive = i < 10
    const progress = Math.floor(Math.random() * 60) + 30
    return {
      id: genId(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      initials: `${firstName[0]}${lastName[0]}`,
      status: isActive ? 'active' : 'inactive',
      joinDate: randomDateWithin(90),
      lastActive: randomDateWithin(7),
      age: 22 + Math.floor(Math.random() * 25),
      weight: 50 + Math.floor(Math.random() * 45),
      height: 155 + Math.floor(Math.random() * 30),
      bodyFat: 10 + Math.floor(Math.random() * 25),
      goal: GOALS[i % GOALS.length],
      currentProgramId: undefined,
      programName: PROGRAM_DISPLAY_NAMES[i % PROGRAM_DISPLAY_NAMES.length],
      programProgress: progress,
      complianceScore: Math.floor(Math.random() * 40) + 55,
      sessionsCompleted: Math.floor(Math.random() * 30) + 5,
    }
  })
}

// ── Demo Sessions ──────────────────────────────────────────────────

const SESSION_TYPES = [
  'Strength Training', 'Upper Body Focus', 'Lower Body Power', 'Cardio & Core',
  'HIIT Circuit', 'Mobility & Stretch', 'BioPrint Assessment', 'Program Review',
  'Nutrition Check-in', 'Personal Training',
]

function generateSessions(clients: Client[]): CalendarSession[] {
  const sessions: CalendarSession[] = []
  const today = todayISO()

  for (let day = 0; day < 30; day++) {
    const date = format(subDays(new Date(), day), 'yyyy-MM-dd')
    const numSessions = Math.floor(Math.random() * 3) + 1

    for (let s = 0; s < numSessions; s++) {
      const client = clients[Math.floor(Math.random() * clients.length)]
      const hour = 8 + Math.floor(Math.random() * 11)
      let status: CalendarSession['status']
      if (day === 0) {
        const r = Math.random()
        status = r < 0.5 ? 'confirmed' : r < 0.8 ? 'in-progress' : 'cancelled'
      } else if (day < 7) {
        status = Math.random() < 0.9 ? 'completed' : 'cancelled'
      } else {
        status = 'completed'
      }

      sessions.push({
        id: genId(),
        clientId: client.id,
        clientName: client.name,
        title: SESSION_TYPES[Math.floor(Math.random() * SESSION_TYPES.length)],
        date,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        type: 'session',
        status,
      })
    }
  }

  // Ensure today has at least 4 sessions
  const todaySessions = sessions.filter((s) => s.date === today)
  if (todaySessions.length < 4) {
    const needed = 4 - todaySessions.length
    for (let i = 0; i < needed; i++) {
      const client = clients[i % clients.length]
      const hour = 9 + i * 2
      sessions.push({
        id: genId(),
        clientId: client.id,
        clientName: client.name,
        title: SESSION_TYPES[i % SESSION_TYPES.length],
        date: today,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        type: 'session',
        status: i === 1 ? 'in-progress' : 'confirmed',
      })
    }
  }

  return sessions.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
}

// ── Demo Alerts ────────────────────────────────────────────────────

function generateAlerts(clients: Client[]): ClientAlert[] {
  const alerts: ClientAlert[] = []
  const high = clients.filter((_, i) => i < 4)
  const med = clients.filter((_, i) => i >= 4 && i < 8)
  const low = clients.filter((_, i) => i >= 8)

  const highMsgs = [
    'Body stats overdue (7 days)',
    'Nutrition log missing (5 days)',
    'Session no-show yesterday',
    'PAR-Q assessment expired',
  ]
  const highActions = ['Log now', 'Send reminder', 'Follow up', 'Renew PAR-Q']

  high.forEach((client, i) => {
    alerts.push({
      id: genId(),
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
      priority: 'high',
      type: i < 2 ? 'body-stats' : 'session',
      message: highMsgs[i % highMsgs.length],
      action: highActions[i % highActions.length],
      createdAt: randomDateWithin(3),
    })
  })

  const medMsgs = [
    'Bi-weekly assessment due',
    'Inactive for 14 days',
    'Program adherence dropped below 70%',
    'Goal milestone check-in needed',
  ]
  const medActions = ['Schedule', 'Send message', 'Review program', 'Check in']

  med.forEach((client, i) => {
    alerts.push({
      id: genId(),
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
      priority: 'medium',
      type: i < 2 ? 'assessment' : 'adherence',
      message: medMsgs[i % medMsgs.length],
      action: medActions[i % medActions.length],
      createdAt: randomDateWithin(5),
    })
  })

  const lowMsgs = [
    'Weekly check-in reminder',
    'General notes: Adjust macros',
    'Celebration: 10 sessions completed!',
    'Form check needed on deadlift',
  ]
  const lowActions = ['Check in', 'View notes', 'Celebrate', 'Schedule form']

  low.forEach((client, i) => {
    alerts.push({
      id: genId(),
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
      priority: 'low',
      type: i < 2 ? 'checkin' : 'note',
      message: lowMsgs[i % lowMsgs.length],
      action: lowActions[i % lowActions.length],
      createdAt: randomDateWithin(7),
    })
  })

  return alerts
}

// ── Demo Notifications ─────────────────────────────────────────────

function generateNotifications(clients: Client[]): AppNotification[] {
  const notifications: AppNotification[] = []
  const now = Date.now()

  const templates: { type: AppNotification['type']; title: string; message: string }[] = [
    { type: 'session', title: 'New session scheduled', message: 'Session with {name} on Monday at 10:00 AM' },
    { type: 'milestone', title: 'Client milestone reached', message: '{name} completed 20 sessions!' },
    { type: 'alert', title: 'Body stats overdue', message: '{name} has not logged body stats in 7 days' },
    { type: 'system', title: 'AzFIT updated', message: 'New features available in v2.1' },
    { type: 'message', title: 'New message', message: '{name}: "Can we reschedule Thursday?"' },
    { type: 'milestone', title: 'Goal achieved!', message: '{name} hit their weight loss target!' },
    { type: 'session', title: 'Session cancelled', message: '{name} cancelled tomorrow\'s session' },
    { type: 'client', title: 'New client onboarded', message: '{name} completed PAR-Q assessment' },
    { type: 'alert', title: 'Compliance warning', message: '{name}\'s weekly compliance dropped to 45%' },
    { type: 'system', title: 'Weekly report ready', message: 'Your weekly summary is now available' },
    { type: 'message', title: 'Nutrition log updated', message: '{name} submitted 3 days of nutrition logs' },
    { type: 'milestone', title: 'Strength PR!', message: '{name} hit a new deadlift PR of 140kg' },
    { type: 'session', title: 'Assessment completed', message: 'BioPrint assessment done with {name}' },
    { type: 'client', title: 'Program updated', message: '{name} moved to Phase 2 of Strength program' },
    { type: 'alert', title: 'Payment due', message: 'Invoice for {name} is due in 3 days' },
  ]

  templates.forEach((tmpl, i) => {
    const client = clients[i % clients.length]
    const hoursAgo = i * 3 + Math.floor(Math.random() * 3)
    notifications.push({
      id: genId(),
      type: tmpl.type,
      title: tmpl.title,
      message: tmpl.message.replace('{name}', client.name),
      read: i > 6,
      timestamp: now - hoursAgo * 3600_000,
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.name.split(' ').map((n) => n[0]).join('').slice(0, 2),
    })
  })

  return notifications
}

// ── Demo Programs ──────────────────────────────────────────────────

function generatePrograms(): Program[] {
  const now = new Date().toISOString()
  return PROGRAM_TEMPLATES.map((template, i) => ({
    ...template,
    id: `prog-${String(i + 1).padStart(3, '0')}`,
    timesUsed: Math.floor(Math.random() * 15),
    lastAssigned: randomDateWithin(30),
    createdAt: now,
    updatedAt: now,
  }))
}

// ── Demo Exercises ─────────────────────────────────────────────────

function generateExercises(): Exercise[] {
  const defs = [
    { name: 'Barbell Back Squat', muscleGroup: 'Quads', equipment: 'Barbell', difficulty: 'intermediate' as const, description: 'The king of leg exercises. Place bar on upper traps, squat to parallel or below.' },
    { name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', difficulty: 'intermediate' as const, description: 'Classic horizontal press. Retract scapula, slight arch, controlled touch to chest.' },
    { name: 'Conventional Deadlift', muscleGroup: 'Back', equipment: 'Barbell', difficulty: 'advanced' as const, description: 'Full-body posterior chain pull. Keep neutral spine, drive through heels.' },
    { name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell', difficulty: 'intermediate' as const, description: 'Standing strict press. Brace core, drive bar vertically over mid-foot.' },
    { name: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell', difficulty: 'intermediate' as const, description: 'Hip-hinge row. Pull to lower chest, control eccentric.' },
    { name: 'Dumbbell Lunge', muscleGroup: 'Quads', equipment: 'Dumbbells', difficulty: 'beginner' as const, description: 'Walking or stationary lunge. Keep torso upright, controlled step.' },
    { name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbells', difficulty: 'beginner' as const, description: 'Seated or standing. Full ROM, control the negative.' },
    { name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable', difficulty: 'beginner' as const, description: 'Wide grip pull to upper chest. Drive elbows down and back.' },
    { name: 'Cable Flye', muscleGroup: 'Chest', equipment: 'Cable', difficulty: 'beginner' as const, description: 'Standing or bench flye. Squeeze pecs at peak contraction.' },
    { name: 'Leg Press', muscleGroup: 'Quads', equipment: 'Machine', difficulty: 'beginner' as const, description: 'Machine-based quad dominant press. Full ROM without locking knees.' },
    { name: 'Pull-Up', muscleGroup: 'Back', equipment: 'Bodyweight', difficulty: 'intermediate' as const, description: 'Bodyweight vertical pull. Dead hang to chin over bar.' },
    { name: 'Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'intermediate' as const, description: 'Parallel bar dips. Lean forward for chest, upright for triceps.' },
    { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', equipment: 'Barbell', difficulty: 'intermediate' as const, description: 'Hip hinge with slight knee bend. Feel hamstring stretch at bottom.' },
    { name: 'Leg Curl', muscleGroup: 'Hamstrings', equipment: 'Machine', difficulty: 'beginner' as const, description: 'Lying or seated hamstring curl. Control the negative fully.' },
    { name: 'Calf Raise', muscleGroup: 'Calves', equipment: 'Machine', difficulty: 'beginner' as const, description: 'Standing or seated calf raise. Full stretch and squeeze.' },
    { name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'beginner' as const, description: 'Static core hold. Neutral spine, squeeze glutes.' },
    { name: 'Kettlebell Swing', muscleGroup: 'Posterior Chain', equipment: 'Kettlebell', difficulty: 'intermediate' as const, description: 'Hip-power swing. Snap hips forward, float the bell.' },
    { name: 'Box Jump', muscleGroup: 'Quads', equipment: 'Bodyweight', difficulty: 'intermediate' as const, description: 'Explosive jump to box. Soft landing, full extension.' },
  ]

  return defs.map((d, i) => ({
    id: `ex-${String(i + 1).padStart(3, '0')}`,
    ...d,
  }))
}

// ── Demo Assignments ───────────────────────────────────────────────

function generateAssignments(clients: Client[], programs: Program[]): ClientProgramAssignment[] {
  const assignments: ClientProgramAssignment[] = []
  // Assign first 8 clients to random programs
  clients.slice(0, 8).forEach((client) => {
    const program = programs[Math.floor(Math.random() * programs.length)]
    assignments.push({
      id: genId(),
      clientId: client.id,
      programId: program.id,
      startDate: randomDateWithin(60),
      status: 'active',
      currentWeek: Math.floor(Math.random() * 4) + 1,
      currentDay: Math.floor(Math.random() * 3) + 1,
    })
  })
  return assignments
}

// ── Main Generator ─────────────────────────────────────────────────

export interface DemoDataPayload {
  clients: Record<string, Client>
  programs: Record<string, Program>
  exercises: Record<string, Exercise>
  sessions: Record<string, CalendarSession>
  assignments: Record<string, ClientProgramAssignment>
  alerts: Record<string, ClientAlert>
  notifications: Record<string, AppNotification>
  clientIds: string[]
  programIds: string[]
  sessionIds: string[]
  categories: WorkoutCategory[]
  levels: WorkoutLevel[]
  trainingMethods: TrainingMethod[]
}

export function generateDemoData(): DemoDataPayload {
  const clients = generateClients()
  const programs = generatePrograms()
  const exercises = generateExercises()
  const sessions = generateSessions(clients)
  const assignments = generateAssignments(clients, programs)
  const alerts = generateAlerts(clients)
  const notifications = generateNotifications(clients)

  // Build normalized maps
  const clientMap: Record<string, Client> = {}
  const clientIds: string[] = []
  for (const c of clients) {
    clientMap[c.id] = c
    clientIds.push(c.id)
  }

  const programMap: Record<string, Program> = {}
  const programIds: string[] = []
  for (const p of programs) {
    programMap[p.id] = p
    programIds.push(p.id)
  }

  const exerciseMap: Record<string, Exercise> = {}
  for (const e of exercises) {
    exerciseMap[e.id] = e
  }

  const sessionMap: Record<string, CalendarSession> = {}
  const sessionIds: string[] = []
  for (const sess of sessions) {
    sessionMap[sess.id] = sess
    sessionIds.push(sess.id)
  }

  const assignmentMap: Record<string, ClientProgramAssignment> = {}
  for (const a of assignments) {
    assignmentMap[a.id] = a
    // Link client to current program
    if (clientMap[a.clientId] && a.status === 'active') {
      clientMap[a.clientId].currentProgramId = a.programId
      // Sync program name from assigned program for consistency
      const assignedProgram = programMap[a.programId]
      if (assignedProgram) {
        const categoryMap: Record<string, string> = {
          'lose-fat': 'Weight Loss',
          'build-muscle': 'Build Muscle',
          'strength': 'Strength',
          'endurance': 'Endurance',
          'maintenance': 'General Fitness',
        }
        clientMap[a.clientId].programName = categoryMap[assignedProgram.goal] ?? assignedProgram.name
      }
    }
  }

  const alertMap: Record<string, ClientAlert> = {}
  for (const a of alerts) {
    alertMap[a.id] = a
  }

  const notificationMap: Record<string, AppNotification> = {}
  for (const n of notifications) {
    notificationMap[n.id] = n
  }

  return {
    clients: clientMap,
    programs: programMap,
    exercises: exerciseMap,
    sessions: sessionMap,
    assignments: assignmentMap,
    alerts: alertMap,
    notifications: notificationMap,
    clientIds,
    programIds,
    sessionIds,
    categories: CATEGORIES,
    levels: LEVELS,
    trainingMethods: METHODS,
  }
}
