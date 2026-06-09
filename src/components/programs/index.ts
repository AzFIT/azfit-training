export { DifficultyBadge } from './DifficultyBadge'
export { StatCard } from './StatCard'
export { TemplateFeatureCard } from './TemplateFeatureCard'
export { ProgramCard } from './ProgramCard'
export { ProgramListRow } from './ProgramListRow'
export { Pagination } from './Pagination'
export { EmptyState } from './EmptyState'

export type { DisplayProgram, TemplateDef } from './types'

export {
  toDisplayProgram,
  toDisplayPrograms,
  deriveTemplate,
  getTemplateDef,
  normalizeGoal,
  getGoalBg,
  getDifficultyColor,
} from './utils'

export {
  TEMPLATES,
  TEMPLATE_KEYS,
  GOAL_COLOR_MAP,
  GOAL_BG_MAP,
  GOAL_OPTIONS,
  DIFFICULTY_OPTIONS,
  DIFFICULTY_COLOR,
} from './constants'
