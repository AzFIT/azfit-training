/**
 * useAppDataStore — Central Data Store (Single Source of Truth)
 *
 * Replaces the fragmented store ecosystem:
 *   App data store (clients, programs, workouts, etc.)
 *   + useProgramStore (library) + useWorkoutBuilderStore
 *
 * Design principles:
 *   1. Normalized entities (Record<string, Entity>) for O(1) lookup
 *   2. Relationship tables instead of nested data
 *   3. Derived data via selectors (not stored state)
 *   4. One seedDemoData() action replaces per-store generators
 *   5. Selective persistence (only user-created data, not reference data)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Client,
  Program,
  Exercise,
  CalendarSession,
  ClientProgramAssignment,
  ProgressEntry,
  BioPrintEntry,
  BodyStatsEntry,
  NutritionEntry,
  WorkoutSessionLog,
  ClientAlert,
  AppNotification,
  WorkoutCategory,
  WorkoutLevel,
  TrainingMethod,
  ClientGoal,
  ClientNote,
  ClientPhoto,
} from '../types/entities'
import { generateDemoData } from './demoData'
import { v4 as uuidv4 } from 'uuid'

// ── Internal ID helpers ────────────────────────────────────────────

const genId = () => `az_${uuidv4().slice(0, 8)}_${Math.random().toString(36).slice(2, 6)}`

// ── State Interface ────────────────────────────────────────────────

interface AppDataState {
  // ── Entities (normalized) ──────────────────────────────────────
  clients: Record<string, Client>
  programs: Record<string, Program>
  exercises: Record<string, Exercise>
  sessions: Record<string, CalendarSession>
  assignments: Record<string, ClientProgramAssignment>
  progressEntries: Record<string, ProgressEntry>
  bioPrintEntries: Record<string, BioPrintEntry>
  bodyStatsEntries: Record<string, BodyStatsEntry>
  nutritionEntries: Record<string, NutritionEntry>
  workoutSessions: Record<string, WorkoutSessionLog>
  alerts: Record<string, ClientAlert>
  notifications: Record<string, AppNotification>
  goals: Record<string, ClientGoal>
  notes: Record<string, ClientNote>
  photos: Record<string, ClientPhoto>

  // ── Ordering / indexing ────────────────────────────────────────
  clientIds: string[]
  programIds: string[]
  sessionIds: string[] // chronological order
  workoutSessionIds: string[] // chronological order
  goalIds: string[]
  noteIds: string[]
  photoIds: string[]

  // ── Reference data (transient — re-seeded on load) ─────────────
  categories: WorkoutCategory[]
  levels: WorkoutLevel[]
  trainingMethods: TrainingMethod[]

  // ── Selection state (transient) ────────────────────────────────
  selectedClientId: string | null
  selectedProgramId: string | null
  selectedDate: string

  // ── Loading flags ──────────────────────────────────────────────
  isLoading: boolean
  lastSyncedAt: string | null

  // ── DEMO MODE ──────────────────────────────────────────────────
  isDemoMode: boolean

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════

  // ── Seed / Reset ───────────────────────────────────────────────
  seedDemoData: () => void
  clearAllData: () => void
  setDemoMode: (enabled: boolean) => void

  // ── Client CRUD ────────────────────────────────────────────────
  setClients: (clients: Client[]) => void
  addClient: (client: Client) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
  selectClient: (id: string | null) => void

  // ── Program CRUD ───────────────────────────────────────────────
  setPrograms: (programs: Program[]) => void
  addProgram: (program: Program) => void
  updateProgram: (id: string, data: Partial<Program>) => void
  deleteProgram: (id: string) => void

  // ── Session CRUD ───────────────────────────────────────────────
  setSessions: (sessions: CalendarSession[]) => void
  addSession: (session: CalendarSession) => void
  updateSession: (id: string, data: Partial<CalendarSession>) => void
  deleteSession: (id: string) => void
  moveSession: (id: string, newDate: string) => void

  // ── Assignment CRUD ────────────────────────────────────────────
  assignProgramToClient: (clientId: string, programId: string, assignedBy?: string) => void
  updateAssignment: (id: string, data: Partial<ClientProgramAssignment>) => void
  unassignProgram: (assignmentId: string) => void

  // ── Progress CRUD ──────────────────────────────────────────────
  addProgressEntry: (entry: ProgressEntry) => void

  // ── BioPrint CRUD ──────────────────────────────────────────────
  addBioPrintEntry: (entry: BioPrintEntry) => void
  deleteBioPrintEntry: (id: string) => void

  // ── BodyStats CRUD ─────────────────────────────────────────────
  addBodyStatsEntry: (entry: BodyStatsEntry) => void
  deleteBodyStatsEntry: (id: string) => void

  // ── Nutrition CRUD ─────────────────────────────────────────────
  addNutritionEntry: (entry: NutritionEntry) => void
  deleteNutritionEntry: (id: string) => void

  // ── Goal CRUD ──────────────────────────────────────────────────
  addGoal: (goal: ClientGoal) => void
  updateGoal: (id: string, data: Partial<ClientGoal>) => void
  deleteGoal: (id: string) => void

  // ── Note CRUD ────────────────────────────────────────────────────
  addNote: (note: ClientNote) => void
  updateNote: (id: string, data: Partial<ClientNote>) => void
  deleteNote: (id: string) => void

  // ── Photo CRUD ───────────────────────────────────────────────────
  addPhoto: (photo: ClientPhoto) => void
  deletePhoto: (id: string) => void

  // ── Workout Session CRUD ───────────────────────────────────────
  addWorkoutSession: (session: WorkoutSessionLog) => void
  setWorkoutSessions: (sessions: WorkoutSessionLog[]) => void
  deleteWorkoutSession: (id: string) => void

  // ── Alert CRUD ─────────────────────────────────────────────────
  addAlert: (alert: ClientAlert) => void
  resolveAlert: (id: string) => void
  dismissAlert: (id: string) => void

  // ── Notification CRUD ──────────────────────────────────────────
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  dismissNotification: (id: string) => void

  // ── Reference data setters ─────────────────────────────────────
  setCategories: (categories: WorkoutCategory[]) => void
  setLevels: (levels: WorkoutLevel[]) => void
  setTrainingMethods: (methods: TrainingMethod[]) => void

  // ── Bulk loaders ───────────────────────────────────────────────
  loadFromApi: (payload: {
    clients?: Client[]
    programs?: Program[]
    sessions?: CalendarSession[]
    assignments?: ClientProgramAssignment[]
    exercises?: Exercise[]
    workoutSessions?: WorkoutSessionLog[]
  }) => void

  // ── Sync flag ──────────────────────────────────────────────────
  markSynced: () => void
}

// ── Initial State Factory ──────────────────────────────────────────

const emptyState = () => ({
  clients: {} as Record<string, Client>,
  programs: {} as Record<string, Program>,
  exercises: {} as Record<string, Exercise>,
  sessions: {} as Record<string, CalendarSession>,
  assignments: {} as Record<string, ClientProgramAssignment>,
  progressEntries: {} as Record<string, ProgressEntry>,
  bioPrintEntries: {} as Record<string, BioPrintEntry>,
  bodyStatsEntries: {} as Record<string, BodyStatsEntry>,
  nutritionEntries: {} as Record<string, NutritionEntry>,
  workoutSessions: {} as Record<string, WorkoutSessionLog>,
  alerts: {} as Record<string, ClientAlert>,
  notifications: {} as Record<string, AppNotification>,
  goals: {} as Record<string, ClientGoal>,
  notes: {} as Record<string, ClientNote>,
  photos: {} as Record<string, ClientPhoto>,

  clientIds: [] as string[],
  programIds: [] as string[],
  sessionIds: [] as string[],
  workoutSessionIds: [] as string[],
  goalIds: [] as string[],
  noteIds: [] as string[],
  photoIds: [] as string[],

  categories: [] as WorkoutCategory[],
  levels: [] as WorkoutLevel[],
  trainingMethods: [] as TrainingMethod[],

  selectedClientId: null as string | null,
  selectedProgramId: null as string | null,
  selectedDate: new Date().toISOString().split('T')[0],

  isLoading: false,
  lastSyncedAt: null as string | null,
  isDemoMode: false,
})

// ── Zustand Store ──────────────────────────────────────────────────

export const useAppDataStore = create<AppDataState>()(
  persist(
    (set, get) => ({
      ...emptyState(),

      // ── Seed / Reset ───────────────────────────────────────────
      seedDemoData: () => {
        const data = generateDemoData()
        set({
          ...data,
          isDemoMode: true,
          lastSyncedAt: new Date().toISOString(),
        })
      },

      clearAllData: () => {
        set({ ...emptyState() })
      },

      setDemoMode: (enabled) => {
        if (enabled) {
          get().seedDemoData()
        } else {
          set({ isDemoMode: false })
        }
      },

      // ── Client CRUD ────────────────────────────────────────────
      setClients: (clients) => {
        const map: Record<string, Client> = {}
        const ids: string[] = []
        for (const c of clients) {
          map[c.id] = c
          ids.push(c.id)
        }
        set({ clients: map, clientIds: ids })
      },

      addClient: (client) =>
        set((s) => ({
          clients: { ...s.clients, [client.id]: client },
          clientIds: s.clientIds.includes(client.id) ? s.clientIds : [...s.clientIds, client.id],
        })),

      updateClient: (id, data) =>
        set((s) => {
          const existing = s.clients[id]
          if (!existing) return s
          return {
            clients: { ...s.clients, [id]: { ...existing, ...data } },
          }
        }),

      deleteClient: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.clients
          return {
            clients: rest,
            clientIds: s.clientIds.filter((cid) => cid !== id),
          }
        }),

      selectClient: (id) => set({ selectedClientId: id }),

      // ── Program CRUD ───────────────────────────────────────────
      setPrograms: (programs) => {
        const map: Record<string, Program> = {}
        const ids: string[] = []
        for (const p of programs) {
          map[p.id] = p
          ids.push(p.id)
        }
        set({ programs: map, programIds: ids })
      },

      addProgram: (program) =>
        set((s) => ({
          programs: { ...s.programs, [program.id]: program },
          programIds: s.programIds.includes(program.id) ? s.programIds : [...s.programIds, program.id],
        })),

      updateProgram: (id, data) =>
        set((s) => {
          const existing = s.programs[id]
          if (!existing) return s
          return {
            programs: { ...s.programs, [id]: { ...existing, ...data, updatedAt: new Date().toISOString() } },
          }
        }),

      deleteProgram: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.programs
          return {
            programs: rest,
            programIds: s.programIds.filter((pid) => pid !== id),
          }
        }),

      // ── Session CRUD ───────────────────────────────────────────
      setSessions: (sessions) => {
        const map: Record<string, CalendarSession> = {}
        const ids: string[] = []
        for (const sess of sessions) {
          map[sess.id] = sess
          ids.push(sess.id)
        }
        // Sort chronologically
        ids.sort((a, b) => {
          const sa = map[a]
          const sb = map[b]
          return sa.date.localeCompare(sb.date) || sa.startTime.localeCompare(sb.startTime)
        })
        set({ sessions: map, sessionIds: ids })
      },

      addSession: (session) =>
        set((s) => ({
          sessions: { ...s.sessions, [session.id]: session },
          sessionIds: [...s.sessionIds, session.id],
        })),

      updateSession: (id, data) =>
        set((s) => {
          const existing = s.sessions[id]
          if (!existing) return s
          return { sessions: { ...s.sessions, [id]: { ...existing, ...data } } }
        }),

      deleteSession: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.sessions
          return {
            sessions: rest,
            sessionIds: s.sessionIds.filter((sid) => sid !== id),
          }
        }),

      moveSession: (id, newDate) =>
        set((s) => {
          const existing = s.sessions[id]
          if (!existing) return s
          const updated = { ...existing, date: newDate }
          const newSessions = { ...s.sessions, [id]: updated }
          // Re-sort
          const newIds = [...s.sessionIds].sort((a, b) => {
            const sa = newSessions[a]
            const sb = newSessions[b]
            return sa.date.localeCompare(sb.date) || sa.startTime.localeCompare(sb.startTime)
          })
          return { sessions: newSessions, sessionIds: newIds }
        }),

      // ── Assignment CRUD ────────────────────────────────────────
      assignProgramToClient: (clientId, programId, assignedBy) => {
        const assignment: ClientProgramAssignment = {
          id: genId(),
          clientId,
          programId,
          startDate: new Date().toISOString().split('T')[0],
          status: 'active',
          currentWeek: 1,
          currentDay: 1,
          assignedBy,
        }
        set((s) => ({
          assignments: { ...s.assignments, [assignment.id]: assignment },
          // Update client's current program
          clients: {
            ...s.clients,
            [clientId]: { ...s.clients[clientId], currentProgramId: programId },
          },
          // Update program usage stats
          programs: {
            ...s.programs,
            [programId]: {
              ...s.programs[programId],
              timesUsed: (s.programs[programId]?.timesUsed ?? 0) + 1,
              lastAssigned: new Date().toISOString().split('T')[0],
            },
          },
        }))
      },

      updateAssignment: (id, data) =>
        set((s) => {
          const existing = s.assignments[id]
          if (!existing) return s
          return {
            assignments: { ...s.assignments, [id]: { ...existing, ...data } },
          }
        }),

      unassignProgram: (assignmentId) =>
        set((s) => {
          const assignment = s.assignments[assignmentId]
          if (!assignment) return s
          const { [assignmentId]: _, ...rest } = s.assignments
          return {
            assignments: rest,
            clients: {
              ...s.clients,
              [assignment.clientId]: {
                ...s.clients[assignment.clientId],
                currentProgramId: undefined,
              },
            },
          }
        }),

      // ── Progress CRUD ──────────────────────────────────────────
      addProgressEntry: (entry) =>
        set((s) => ({
          progressEntries: { ...s.progressEntries, [entry.id]: entry },
        })),

      // ── BioPrint CRUD ──────────────────────────────────────────
      addBioPrintEntry: (entry) =>
        set((s) => ({
          bioPrintEntries: { ...s.bioPrintEntries, [entry.id]: entry },
        })),
      deleteBioPrintEntry: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.bioPrintEntries
          return { bioPrintEntries: rest }
        }),

      // ── BodyStats CRUD ─────────────────────────────────────────
      addBodyStatsEntry: (entry) =>
        set((s) => ({
          bodyStatsEntries: { ...s.bodyStatsEntries, [entry.id]: entry },
        })),
      deleteBodyStatsEntry: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.bodyStatsEntries
          return { bodyStatsEntries: rest }
        }),

      // ── Nutrition CRUD ─────────────────────────────────────────
      addNutritionEntry: (entry) =>
        set((s) => ({
          nutritionEntries: { ...s.nutritionEntries, [entry.id]: entry },
        })),
      deleteNutritionEntry: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.nutritionEntries
          return { nutritionEntries: rest }
        }),

      // ── Goal CRUD ──────────────────────────────────────────────
      addGoal: (goal) =>
        set((s) => ({
          goals: { ...s.goals, [goal.id]: goal },
          goalIds: s.goalIds.includes(goal.id) ? s.goalIds : [...s.goalIds, goal.id],
        })),
      updateGoal: (id, data) =>
        set((s) => {
          const existing = s.goals[id]
          if (!existing) return s
          return { goals: { ...s.goals, [id]: { ...existing, ...data } } }
        }),
      deleteGoal: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.goals
          return { goals: rest, goalIds: s.goalIds.filter((gid) => gid !== id) }
        }),

      // ── Note CRUD ────────────────────────────────────────────────
      addNote: (note) =>
        set((s) => ({
          notes: { ...s.notes, [note.id]: note },
          noteIds: s.noteIds.includes(note.id) ? s.noteIds : [...s.noteIds, note.id],
        })),
      updateNote: (id, data) =>
        set((s) => {
          const existing = s.notes[id]
          if (!existing) return s
          return { notes: { ...s.notes, [id]: { ...existing, ...data } } }
        }),
      deleteNote: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.notes
          return { notes: rest, noteIds: s.noteIds.filter((nid) => nid !== id) }
        }),

      // ── Photo CRUD ─────────────────────────────────────────────────
      addPhoto: (photo) =>
        set((s) => ({
          photos: { ...s.photos, [photo.id]: photo },
          photoIds: s.photoIds.includes(photo.id) ? s.photoIds : [...s.photoIds, photo.id],
        })),
      deletePhoto: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.photos
          return { photos: rest, photoIds: s.photoIds.filter((pid) => pid !== id) }
        }),

      // ── Workout Session CRUD ───────────────────────────────────
      addWorkoutSession: (session) =>
        set((s) => ({
          workoutSessions: { ...s.workoutSessions, [session.id]: session },
          workoutSessionIds: s.workoutSessionIds.includes(session.id)
            ? s.workoutSessionIds
            : [...s.workoutSessionIds, session.id],
        })),
      setWorkoutSessions: (sessions) =>
        set((s) => {
          const map: Record<string, WorkoutSessionLog> = { ...s.workoutSessions }
          const ids = new Set(s.workoutSessionIds)
          for (const session of sessions) {
            map[session.id] = session
            ids.add(session.id)
          }
          const sortedIds = Array.from(ids).sort((a, b) => {
            const da = new Date(map[a]?.date || 0).getTime()
            const db = new Date(map[b]?.date || 0).getTime()
            return db - da
          })
          return { workoutSessions: map, workoutSessionIds: sortedIds }
        }),
      deleteWorkoutSession: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.workoutSessions
          return {
            workoutSessions: rest,
            workoutSessionIds: s.workoutSessionIds.filter((sid) => sid !== id),
          }
        }),

      // ── Alert CRUD ─────────────────────────────────────────────
      addAlert: (alert) =>
        set((s) => ({
          alerts: { ...s.alerts, [alert.id]: alert },
        })),

      resolveAlert: (id) =>
        set((s) => {
          const existing = s.alerts[id]
          if (!existing) return s
          return { alerts: { ...s.alerts, [id]: { ...existing, resolved: true } } }
        }),

      dismissAlert: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.alerts
          return { alerts: rest }
        }),

      // ── Notification CRUD ──────────────────────────────────────
      addNotification: (notification) => {
        const notif: AppNotification = {
          ...notification,
          id: genId(),
          timestamp: Date.now(),
          read: false,
        }
        set((s) => ({
          notifications: { ...s.notifications, [notif.id]: notif },
        }))
      },

      markNotificationRead: (id) =>
        set((s) => {
          const existing = s.notifications[id]
          if (!existing) return s
          return { notifications: { ...s.notifications, [id]: { ...existing, read: true } } }
        }),

      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: Object.fromEntries(
            Object.entries(s.notifications).map(([k, v]) => [k, { ...v, read: true }])
          ),
        })),

      dismissNotification: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.notifications
          return { notifications: rest }
        }),

      // ── Reference data setters ─────────────────────────────────
      setCategories: (categories) => set({ categories }),
      setLevels: (levels) => set({ levels }),
      setTrainingMethods: (trainingMethods) => set({ trainingMethods }),

      // ── Bulk loader ────────────────────────────────────────────
      loadFromApi: (payload) => {
        const next: Partial<AppDataState> = {}
        if (payload.clients) {
          const map: Record<string, Client> = {}
          const ids: string[] = []
          for (const c of payload.clients) {
            map[c.id] = c
            ids.push(c.id)
          }
          next.clients = map
          next.clientIds = ids
        }
        if (payload.programs) {
          const map: Record<string, Program> = {}
          const ids: string[] = []
          for (const p of payload.programs) {
            map[p.id] = p
            ids.push(p.id)
          }
          next.programs = map
          next.programIds = ids
        }
        if (payload.sessions) {
          const map: Record<string, CalendarSession> = {}
          const ids: string[] = []
          for (const sess of payload.sessions) {
            map[sess.id] = sess
            ids.push(sess.id)
          }
          ids.sort((a, b) => {
            const sa = map[a]
            const sb = map[b]
            return sa.date.localeCompare(sb.date) || sa.startTime.localeCompare(sb.startTime)
          })
          next.sessions = map
          next.sessionIds = ids
        }
        if (payload.assignments) {
          const map: Record<string, ClientProgramAssignment> = {}
          for (const a of payload.assignments) map[a.id] = a
          next.assignments = map
        }
        if (payload.exercises) {
          const map: Record<string, Exercise> = {}
          for (const e of payload.exercises) map[e.id] = e
          next.exercises = map
        }
        if (payload.workoutSessions) {
          const map: Record<string, WorkoutSessionLog> = { ...get().workoutSessions }
          const ids = new Set(get().workoutSessionIds)
          for (const s of payload.workoutSessions) {
            map[s.id] = s
            ids.add(s.id)
          }
          const sortedIds = Array.from(ids).sort((a, b) => {
            const da = new Date(map[a]?.date || 0).getTime()
            const db = new Date(map[b]?.date || 0).getTime()
            return db - da
          })
          next.workoutSessions = map
          next.workoutSessionIds = sortedIds
        }
        set(next)
      },

      markSynced: () => set({ lastSyncedAt: new Date().toISOString(), isLoading: false }),
    }),
    {
      name: 'azfit-app-data-v1',
      partialize: (state) => ({
        // Persist only user-created / mutable data
        clients: state.clients,
        programs: state.programs,
        sessions: state.sessions,
        assignments: state.assignments,
        progressEntries: state.progressEntries,
        alerts: state.alerts,
        notifications: state.notifications,
        clientIds: state.clientIds,
        programIds: state.programIds,
        sessionIds: state.sessionIds,
        workoutSessionIds: state.workoutSessionIds,
        workoutSessions: state.workoutSessions,
        goals: state.goals,
        notes: state.notes,
        photos: state.photos,
        goalIds: state.goalIds,
        noteIds: state.noteIds,
        photoIds: state.photoIds,
        selectedClientId: state.selectedClientId,
        selectedDate: state.selectedDate,
        isDemoMode: state.isDemoMode,
        lastSyncedAt: state.lastSyncedAt,
        // Do NOT persist reference data (categories, levels, methods)
        // Do NOT persist isLoading
      }),
    }
  )
)
