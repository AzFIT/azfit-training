export interface DisplayProgram {
  id: string
  name: string
  goal: string
  method: string
  category: string
  difficulty: string
  durationWeeks: number
  daysPerWeek: number
  totalExercises: number
  totalSets: number
  equipment: string
  structure: string
  timesAssigned: number
  activeClients: number
  lastAssigned: string
  archived: boolean
  createdAt: string
  colorBanner: string
  periodizationPhase?: string
  template?: string
  trainingMethod?: string
  isPublic?: boolean
  authorName?: string
}

export interface TemplateDef {
  key: string
  label: string
  icon: React.ReactNode
  color: string
  bg: string
  border: string
  gradient: string
  focus: string
  description: string
}
