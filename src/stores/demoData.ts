/**
 * Centralized Demo Data Generator
 *
 * Single source for all synthetic data. Replaces:
 *   - generateClients() from lib/demo-data.ts
 *   - generateSessions() from lib/demo-data.ts
 *   - generateAlerts() from lib/demo-data.ts
 *   - generateNotifications() from lib/demo-data.ts
 *   - Demo data generation for local testing
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
  Difficulty,
  ClientGoal,
  ClientNote,
  ClientPhoto,
  GoalStatus,
  PhotoCategory,
} from '../types/entities'
import exercisesJson from '../data/exercises_db.json'

// ── Helpers ────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid'
const genId = () => `demo_${uuidv4().slice(0, 8)}_${Math.random().toString(36).slice(2, 6)}`

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

// ── Demo Goals ─────────────────────────────────────────────────────

function generateGoals(clients: Client[]): ClientGoal[] {
  const goalTemplates = [
    { title: 'Reach 16% body fat', category: 'Body Composition', target: '16%', start: '24%' },
    { title: 'Back Squat 100kg x1', category: 'Strength', target: '100 kg', start: '60 kg' },
    { title: 'Deadlift 130kg x1', category: 'Strength', target: '130 kg', start: '80 kg' },
    { title: '4 sessions per week', category: 'Habit', target: '4/week', start: '2/week' },
    { title: 'Sleep 7.5+ hrs avg', category: 'Lifestyle', target: '7.5h', start: '6.0h' },
    { title: 'Lose 5kg bodyweight', category: 'Body Composition', target: '-5 kg', start: '0 kg' },
    { title: 'First pull-up unassisted', category: 'Strength', target: '1 rep', start: '0 reps' },
    { title: 'Bench Press 80kg', category: 'Strength', target: '80 kg', start: '50 kg' },
  ]

  const goals: ClientGoal[] = []
  clients.forEach((client, ci) => {
    // Each client gets 2-4 goals
    const count = 2 + (ci % 3)
    for (let i = 0; i < count; i++) {
      const tmpl = goalTemplates[(ci + i) % goalTemplates.length]
      const progress = Math.floor(Math.random() * 60) + 20
      const status: GoalStatus = progress > 80 ? 'On Track' : progress > 50 ? 'On Track' : 'At Risk'
      goals.push({
        id: genId(),
        clientId: client.id,
        title: tmpl.title,
        category: tmpl.category,
        target: tmpl.target,
        current: `${Math.round(parseFloat(tmpl.start) + (parseFloat(tmpl.target) - parseFloat(tmpl.start)) * (progress / 100))}${tmpl.target.replace(/[0-9.]/g, '')}`,
        start: tmpl.start,
        deadline: format(subDays(new Date(), -60 - i * 15), 'dd/MM/yyyy'),
        status,
        progress,
        createdAt: randomDateWithin(90),
      })
    }
  })
  return goals
}

// ── Demo Notes ─────────────────────────────────────────────────────

function generateNotes(clients: Client[]): ClientNote[] {
  const noteTemplates = [
    { title: 'Form Check — Deadlift', content: 'Hip hinge pattern has improved significantly. Still need to cue shoulder blade retraction at the top. Consider adding paused deadlifts next phase.', category: 'Form Check', important: true },
    { title: 'Weekly Check-in', content: 'Weight down 0.5kg this week. Sleep has been consistent 7+ hours. Stress levels moderate due to work project. Macro adherence at 88%.', category: 'General', important: false },
    { title: 'Nutrition Adjustment', content: 'Dropped carbs by 20g to 220g, increased protein to 145g. Reports feeling good, no energy crashes during workouts.', category: 'Nutrition', important: true },
    { title: 'Client Update', content: 'Feeling stronger on squats! Hip mobility drills are helping. Requested more core work in warm-ups.', category: 'Goals', important: false },
    { title: 'Phase 2 Review', content: 'Completed Phase 2 with 94% session adherence. All strength metrics improved. Ready to progress to power-focused Phase 3.', category: 'General', important: true },
    { title: 'Mobility Assessment', content: 'Ankle dorsiflexion improved by 2cm. Hip flexor tightness persists — continue couch stretch daily.', category: 'Form Check', important: false },
    { title: 'Macro Check', content: 'Protein consistently hitting 140g+. Carbs slightly low on rest days. Recommend increasing fruit intake.', category: 'Nutrition', important: false },
  ]

  const notes: ClientNote[] = []
  clients.forEach((client, ci) => {
    const count = 2 + (ci % 4)
    for (let i = 0; i < count; i++) {
      const tmpl = noteTemplates[(ci + i) % noteTemplates.length]
      notes.push({
        id: genId(),
        clientId: client.id,
        title: tmpl.title,
        content: tmpl.content,
        author: i % 3 === 0 ? client.name : 'Trainer',
        date: format(subDays(new Date(), i * 5 + ci), 'dd/MM/yyyy'),
        category: tmpl.category,
        important: tmpl.important,
      })
    }
  })
  return notes
}

// ── Demo Photos ────────────────────────────────────────────────────

function generatePhotos(clients: Client[]): ClientPhoto[] {
  const categories: PhotoCategory[] = ['Front', 'Back', 'Side', 'Other']
  const photos: ClientPhoto[] = []

  clients.forEach((client) => {
    // Generate 3-6 photos per client over time
    const count = 3 + Math.floor(Math.random() * 4)
    for (let i = 0; i < count; i++) {
      const weight = client.weight + (count - i - 1) * 0.5 // Earlier photos = heavier
      const bf = Math.max(12, client.bodyFat + (count - i - 1) * 0.8)
      photos.push({
        id: genId(),
        clientId: client.id,
        url: '/avatar-placeholder.jpg',
        thumbnailUrl: '/avatar-placeholder.jpg',
        date: format(subDays(new Date(), i * 30), 'yyyy-MM-dd'),
        category: categories[i % categories.length],
        notes: i === count - 1 ? 'Starting point' : i === 0 ? 'Latest check-in' : `${i * 4} week progress`,
        weight: +weight.toFixed(1),
        bodyFatPercentage: +bf.toFixed(1),
        trainerNotes: i === 0 ? 'Approaching goal body fat. Maintain strength.' : undefined,
        isMilestone: i === 0 || i === count - 1,
        isGoalAchieved: i === 0 && client.bodyFat < 20,
        createdAt: format(subDays(new Date(), i * 30), 'yyyy-MM-dd'),
      })
    }
  })
  return photos
}

// ── Demo Programs ──────────────────────────────────────────────────

import { PROGRAM_TEMPLATES as CANONICAL_PROGRAM_TEMPLATES } from '../data/programTemplates'

const PROGRAM_TEMPLATES = CANONICAL_PROGRAM_TEMPLATES

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

const DIFFICULTY_MAP: Record<string, Difficulty> = {
  Beginner: 'beginner',
  Intermediate: 'intermediate',
  Advanced: 'advanced',
  Elite: 'elite',
}

function generateExercises(): Exercise[] {
  return (exercisesJson as Array<{
    ExerciseID: string
    Name: string
    MuscleGroup: string
    Equipment: string
    Difficulty: string
    Type: string
    VideoURL: string
    Description: string
  }>).map((j) => ({
    id: j.ExerciseID,
    name: j.Name,
    muscleGroup: j.MuscleGroup,
    equipment: j.Equipment,
    difficulty: DIFFICULTY_MAP[j.Difficulty] ?? 'intermediate',
    description: j.Description,
    videoUrl: j.VideoURL,
    exerciseCategory: j.Type,
    equipmentPrimary: j.Equipment,
    movementPattern: j.MuscleGroup.includes('Push') || j.MuscleGroup.includes('Chest')
      ? 'Push (Horizontal)'
      : j.MuscleGroup.includes('Pull') || j.MuscleGroup.includes('Back')
        ? 'Pull (Vertical)'
        : j.MuscleGroup.includes('Quads') || j.MuscleGroup.includes('Legs')
          ? 'Squat'
          : j.MuscleGroup.includes('Hamstrings') || j.MuscleGroup.includes('Glutes')
            ? 'Hinge'
            : 'Other',
    mechanics: j.Type === 'Compound' ? 'Compound' : 'Isolation',
    forceType: j.MuscleGroup.includes('Pull') || j.MuscleGroup.includes('Back') ? 'Pull' : 'Push',
    exerciseType: j.Type === 'Compound' ? 'Strength' : 'Hypertrophy',
    instructionsBrief: j.Description.slice(0, 120) + (j.Description.length > 120 ? '...' : ''),
    difficultyBeginner: j.Difficulty === 'Beginner',
    difficultyIntermediate: j.Difficulty === 'Intermediate',
    difficultyAdvanced: j.Difficulty === 'Advanced',
    difficultyElite: j.Difficulty === 'Elite',
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
  goals: Record<string, ClientGoal>
  notes: Record<string, ClientNote>
  photos: Record<string, ClientPhoto>
  clientIds: string[]
  programIds: string[]
  sessionIds: string[]
  goalIds: string[]
  noteIds: string[]
  photoIds: string[]
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
  const goals = generateGoals(clients)
  const notes = generateNotes(clients)
  const photos = generatePhotos(clients)

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

  const goalMap: Record<string, ClientGoal> = {}
  const goalIds: string[] = []
  for (const g of goals) {
    goalMap[g.id] = g
    goalIds.push(g.id)
  }

  const noteMap: Record<string, ClientNote> = {}
  const noteIds: string[] = []
  for (const n of notes) {
    noteMap[n.id] = n
    noteIds.push(n.id)
  }

  const photoMap: Record<string, ClientPhoto> = {}
  const photoIds: string[] = []
  for (const p of photos) {
    photoMap[p.id] = p
    photoIds.push(p.id)
  }

  return {
    clients: clientMap,
    programs: programMap,
    exercises: exerciseMap,
    sessions: sessionMap,
    assignments: assignmentMap,
    alerts: alertMap,
    notifications: notificationMap,
    goals: goalMap,
    notes: noteMap,
    photos: photoMap,
    clientIds,
    programIds,
    sessionIds,
    goalIds,
    noteIds,
    photoIds,
    categories: CATEGORIES,
    levels: LEVELS,
    trainingMethods: METHODS,
  }
}
