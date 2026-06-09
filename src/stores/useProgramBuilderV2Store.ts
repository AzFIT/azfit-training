import { create } from 'zustand'
import type {
  BuilderState,
  ClientContext,
  BuilderSession,
  SessionExercise,
} from '../types/program-builder-v2'

const defaultClientContext: ClientContext = {
  clientId: null,
  clientName: '',
  startDate: new Date().toISOString().split('T')[0],
  goal: 'build-muscle',
  experience: 'intermediate',
  availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  sessionDuration: 60,
}

interface ProgramBuilderV2Store extends BuilderState {
  // Actions
  setPhase: (phaseCode: string, phaseName: string, method: string, durationWeeks: number) => void
  setClientContext: (ctx: Partial<ClientContext>) => void
  setSessions: (sessions: BuilderSession[]) => void
  setActiveSessionIndex: (index: number) => void
  swapExercise: (sessionNumber: number, orderNotation: string, newExercise: SessionExercise) => void
  editExercise: (sessionNumber: number, orderNotation: string, updates: Partial<SessionExercise>) => void
  deleteExercise: (sessionNumber: number, orderNotation: string) => void
  addExercise: (sessionNumber: number, exercise: SessionExercise) => void
  reset: () => void
}

const initialState: BuilderState = {
  phaseCode: null,
  phaseName: '',
  method: '',
  durationWeeks: 0,
  clientContext: { ...defaultClientContext },
  sessions: [],
  activeSessionIndex: 0,
  modifications: {
    swappedExercises: new Map(),
    editedParameters: new Map(),
    addedExercises: [],
    deletedExercises: [],
  },
  isLoading: false,
  saveError: null,
}

export const useProgramBuilderV2Store = create<ProgramBuilderV2Store>((set) => ({
  ...initialState,

  setPhase: (phaseCode, phaseName, method, durationWeeks) =>
    set({ phaseCode, phaseName, method, durationWeeks }),

  setClientContext: (ctx) =>
    set((state) => ({
      clientContext: { ...state.clientContext, ...ctx },
    })),

  setSessions: (sessions) => set({ sessions }),

  setActiveSessionIndex: (activeSessionIndex) => set({ activeSessionIndex }),

  swapExercise: (sessionNumber, orderNotation, newExercise) =>
    set((state) => {
      const key = `${sessionNumber}-${orderNotation}`
      const swapped = new Map(state.modifications.swappedExercises)
      swapped.set(key, newExercise.exerciseId)

      const sessions = state.sessions.map((s) => {
        if (s.sessionNumber !== sessionNumber) return s
        return {
          ...s,
          exercises: s.exercises.map((ex) =>
            ex.orderNotation === orderNotation
              ? { ...newExercise, isSubstituted: true }
              : ex
          ),
        }
      })

      return {
        sessions,
        modifications: { ...state.modifications, swappedExercises: swapped },
      }
    }),

  editExercise: (sessionNumber, orderNotation, updates) =>
    set((state) => {
      const sessions = state.sessions.map((s) => {
        if (s.sessionNumber !== sessionNumber) return s
        return {
          ...s,
          exercises: s.exercises.map((ex) =>
            ex.orderNotation === orderNotation
              ? { ...ex, ...updates, isModified: true }
              : ex
          ),
        }
      })
      return { sessions }
    }),

  deleteExercise: (sessionNumber, orderNotation) =>
    set((state) => {
      const key = `${sessionNumber}-${orderNotation}`
      const deleted = [...state.modifications.deletedExercises, key]
      const sessions = state.sessions.map((s) => {
        if (s.sessionNumber !== sessionNumber) return s
        return {
          ...s,
          exercises: s.exercises.filter((ex) => ex.orderNotation !== orderNotation),
        }
      })
      return {
        sessions,
        modifications: { ...state.modifications, deletedExercises: deleted },
      }
    }),

  addExercise: (sessionNumber, exercise) =>
    set((state) => {
      const added = [...state.modifications.addedExercises, exercise]
      const sessions = state.sessions.map((s) => {
        if (s.sessionNumber !== sessionNumber) return s
        return {
          ...s,
          exercises: [...s.exercises, exercise],
        }
      })
      return {
        sessions,
        modifications: { ...state.modifications, addedExercises: added },
      }
    }),

  reset: () => set({ ...initialState }),
}))
