import { create } from 'zustand'

import type {
  BuilderState,
  ClientContext,
  BuilderSession,
  SessionExercise,
} from '../types/program-builder-v2'

const STORAGE_KEY = 'azfit-program-builder-v2'

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
  saveDraft: () => void
  loadDraft: () => boolean
  clearDraft: () => void
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

// Helper to revive Maps and arrays from plain JSON
function reviveModifications(modifications: BuilderState['modifications']): BuilderState['modifications'] {
  return {
    swappedExercises: new Map(
      Array.isArray(modifications?.swappedExercises)
        ? modifications.swappedExercises
        : Object.entries(modifications?.swappedExercises || {})
    ),
    editedParameters: new Map(
      Array.isArray(modifications?.editedParameters)
        ? modifications.editedParameters
        : Object.entries(modifications?.editedParameters || {})
    ),
    addedExercises: modifications?.addedExercises || [],
    deletedExercises: modifications?.deletedExercises || [],
  }
}

export const useProgramBuilderV2Store = create<ProgramBuilderV2Store>((set, get) => ({
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
      const editKey = `${sessionNumber}-${orderNotation}`
      const edited = new Map(state.modifications.editedParameters)
      edited.set(editKey, { orderNotation, sessionNumber, field: 'multi', oldValue: '', newValue: updates })

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
      return {
        sessions,
        modifications: { ...state.modifications, editedParameters: edited },
      }
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

  saveDraft: () => {
    const state = get()
    const payload = {
      phaseCode: state.phaseCode,
      phaseName: state.phaseName,
      method: state.method,
      durationWeeks: state.durationWeeks,
      clientContext: state.clientContext,
      sessions: state.sessions,
      activeSessionIndex: state.activeSessionIndex,
      modifications: {
        swappedExercises: Array.from(state.modifications.swappedExercises.entries()),
        editedParameters: Array.from(state.modifications.editedParameters.entries()),
        addedExercises: state.modifications.addedExercises,
        deletedExercises: state.modifications.deletedExercises,
      },
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore
    }
  },

  loadDraft: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return false
      const draft = JSON.parse(raw)
      set({
        phaseCode: draft.phaseCode,
        phaseName: draft.phaseName,
        method: draft.method,
        durationWeeks: draft.durationWeeks,
        clientContext: draft.clientContext,
        sessions: draft.sessions,
        activeSessionIndex: draft.activeSessionIndex,
        modifications: reviveModifications(draft.modifications),
      })
      return true
    } catch {
      return false
    }
  },

  clearDraft: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    set({ ...initialState })
  },

  reset: () => set({ ...initialState }),
}))
