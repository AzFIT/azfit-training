import type { Program as EntityProgram } from '../../types/entities'
import type { DisplayProgram, TemplateDef } from './types'
import { GOAL_COLOR_MAP, GOAL_BG_MAP, DIFFICULTY_COLOR, TEMPLATES } from './constants'

export function normalizeGoal(goal: string): string {
  const g = goal.toLowerCase()
  if (g.includes('fat') || g.includes('loss')) return 'fat loss'
  if (g.includes('muscle') || g.includes('hypertrophy')) return 'muscle'
  if (g.includes('strength')) return 'strength'
  if (g.includes('endurance')) return 'endurance'
  if (g.includes('rehab')) return 'rehab'
  if (g.includes('athletic')) return 'athletic'
  return 'general'
}

export function getGoalBg(goal: string): string {
  return GOAL_BG_MAP[normalizeGoal(goal)] || GOAL_BG_MAP['general']
}

export function getDifficultyColor(diff: string) {
  return DIFFICULTY_COLOR[diff] || DIFFICULTY_COLOR['Intermediate']
}

export function deriveTemplate(p: EntityProgram): string {
  const tags = (p.tags || []).map(t => t.toLowerCase())
  const name = p.name.toLowerCase()
  const split = (p.trainingSplit || '').toLowerCase()
  if (tags.includes('gvt') || name.includes('gvt') || name.includes('german volume')) return 'GVT'
  if (tags.includes('gbc') || name.includes('gbc') || name.includes('german body')) return 'GBC'
  if (tags.includes('hiit') || name.includes('hiit')) return 'HIIT'
  if (split.includes('push') || split.includes('pull') || tags.includes('ppl')) return 'PPL'
  if (split.includes('full body') || tags.includes('full body')) return 'Full Body'
  if (tags.includes('strength') || name.includes('strength') || name.includes('power')) return 'Strength'
  return 'Custom'
}

export function getTemplateDef(key?: string): TemplateDef | undefined {
  return TEMPLATES.find(t => t.key === key) || TEMPLATES.find(t => t.key === 'Custom')
}

export function toDisplayProgram(p: EntityProgram): DisplayProgram {
  const goalMap: Record<string, string> = {
    'lose-fat': 'Lose Fat',
    'build-muscle': 'Build Muscle',
    'strength': 'Strength',
    'endurance': 'Endurance',
    'maintenance': 'General Fitness',
  }
  const methodMap: Record<string, string> = {
    'Upper/Lower': 'Upper/Lower',
    'Push/Pull/Legs': 'Push/Pull/Legs',
    'Full Body': 'Full Body',
    'Bro Split': 'Bro Split',
  }
  const diffMap: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    elite: 'Elite',
  }
  const goalKey = normalizeGoal(p.goal)
  const goalColor = GOAL_COLOR_MAP[goalKey] || GOAL_COLOR_MAP['general']
  const daysAgo = p.lastAssigned
    ? Math.floor((Date.now() - new Date(p.lastAssigned).getTime()) / 86400000)
    : 30

  // Derive template from tags or training split
  const template = deriveTemplate(p)

  return {
    id: p.id,
    name: p.name,
    goal: goalMap[p.goal] || p.goal,
    method: methodMap[p.trainingSplit || ''] || p.trainingSplit || 'Other',
    category: p.categoryName || p.goal,
    difficulty: diffMap[p.difficulty] || p.difficulty,
    durationWeeks: p.durationWeeks,
    daysPerWeek: p.daysPerWeek,
    totalExercises: p.totalExercises || 0,
    totalSets: p.totalWorkouts || p.durationWeeks * p.daysPerWeek * 4,
    equipment: p.tags?.join(', ') || 'Various',
    structure: p.trainingSplit || 'Full Body',
    timesAssigned: p.timesUsed,
    activeClients: Math.floor(p.timesUsed * 0.4),
    lastAssigned: daysAgo <= 1 ? '1 day ago' : `${daysAgo} days ago`,
    archived: !p.isActive,
    createdAt: p.createdAt,
    colorBanner: goalColor,
    periodizationPhase: p.periodizationPhase,
    template,
    trainingMethod: p.trainingSplit,
    isPublic: p.isPublic,
    authorName: p.authorName,
  }
}

export function toDisplayPrograms(programs: Record<string, EntityProgram>): DisplayProgram[] {
  return Object.values(programs).map(toDisplayProgram)
}
