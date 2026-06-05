import { create } from 'zustand'
import type { Program } from '../types/workout'

interface BuilderState {
  step: 1 | 2 | 3
  selectedClientId: string | null
  selectedCategoryId: number | null
  selectedLevelId: number | null
  selectedDaysPerWeek: number | null
  selectedSessionLength: number | null
  matchingPrograms: Program[]
  selectedProgramId: number | null

  setStep: (step: 1 | 2 | 3) => void
  setSelectedClientId: (id: string | null) => void
  setSelectedCategoryId: (id: number | null) => void
  setSelectedLevelId: (id: number | null) => void
  setSelectedDaysPerWeek: (days: number | null) => void
  setSelectedSessionLength: (minutes: number | null) => void
  setMatchingPrograms: (programs: Program[]) => void
  setSelectedProgramId: (id: number | null) => void
  reset: () => void
}

const initialState = {
  step: 1 as 1 | 2 | 3,
  selectedClientId: null,
  selectedCategoryId: null,
  selectedLevelId: null,
  selectedDaysPerWeek: null,
  selectedSessionLength: null,
  matchingPrograms: [],
  selectedProgramId: null,
}

export const useWorkoutBuilderStore = create<BuilderState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setSelectedClientId: (id) => set({ selectedClientId: id }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedLevelId: (id) => set({ selectedLevelId: id }),
  setSelectedDaysPerWeek: (days) => set({ selectedDaysPerWeek: days }),
  setSelectedSessionLength: (minutes) => set({ selectedSessionLength: minutes }),
  setMatchingPrograms: (programs) => set({ matchingPrograms: programs }),
  setSelectedProgramId: (id) => set({ selectedProgramId: id }),
  reset: () => set(initialState),
}))
