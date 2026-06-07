import type { Program } from '../types/entities'

// ── Types (local to matcher) ─────────────────────────────────────

export interface ClientPreferences {
  goal: string
  daysPerWeek: number
  experience: string
  equipment: string
  timePerSession: number
  limitations?: string[]
}

export interface MatchBreakdown {
  goalScore: number
  daysScore: number
  experienceScore: number
  equipmentScore: number
  timeScore: number
  bonusScore: number
}

export interface MatchResult {
  program: MatchableProgram
  score: number
  maxScore: number
  percentage: number
  breakdown: MatchBreakdown
  exactDayMatch: boolean
}

export interface MatchingRules {
  version: string
  generatedAt: string
  goalMethodMatrix: Array<{ goal: string; method: string; score: number }>
  goalProgramPipelines: Array<{ goal: string; method: string; program: string; score: number }>
  canonicalLists: Record<string, string[]>
  equipmentCompatibility: Record<string, string[]>
  experienceMethodPreference: Record<string, string[]>
  scoringWeights: {
    goal: number
    days: number
    experience: number
    equipment: number
    time: number
  }
}

/** Shape expected by the matcher algorithm (mirrors portal's SavedProgram.data) */
export interface MatchableProgram {
  id: string
  data: {
    programName: string
    goal: string
    days?: Array<unknown>
    split?: Array<{ active: boolean }>
    tags: string[]
    clientProfile?: {
      experience?: string
      equipment?: string
      timePerSession?: number
    }
    trainingMethod?: string
    method?: string
    description?: string
    template?: string
    totalSets?: number
    phases?: Array<{ id: string; name: string; weeks: number; color: string; active: boolean }>
    exercises?: Array<unknown>
  }
}

// ── Rules Loader ─────────────────────────────────────────────────

let rulesCache: MatchingRules | null = null

export async function loadMatchingRules(): Promise<MatchingRules> {
  if (rulesCache) return rulesCache
  const res = await fetch('./matching_rules.json')
  if (!res.ok) throw new Error('Failed to load matching rules')
  rulesCache = await res.json()
  return rulesCache!
}

// ── Adapter: Training Program → MatchableProgram ─────────────────

export function toMatchableProgram(program: Program): MatchableProgram {
  return {
    id: program.id,
    data: {
      programName: program.name,
      goal: program.goal || program.categoryName || '',
      days: Array.from({ length: program.daysPerWeek || 0 }),
      split: Array.from({ length: program.daysPerWeek || 0 }).map(() => ({ active: true })),
      tags: program.tags || [],
      clientProfile: {
        experience: program.difficulty || program.levelName || '',
        equipment: program.metadata?.equipment as string || '',
        timePerSession: program.sessionDurationMinutes || 60,
      },
      trainingMethod: program.trainingSplit || '',
      method: program.trainingSplit || '',
      description: program.description || '',
      template: program.categoryName || program.levelName || 'Custom',
      totalSets: program.totalWorkouts,
      phases: [],
      exercises: [],
    },
  }
}

// ── Scoring Helpers ──────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function partialMatch(a: string, b: string): boolean {
  const na = normalize(a)
  const nb = normalize(b)
  return na === nb || na.includes(nb) || nb.includes(na)
}

function scoreGoal(program: MatchableProgram, prefs: ClientPreferences, _rules: MatchingRules): number {
  const pg = normalize(program.data.goal || '')
  const g = normalize(prefs.goal)
  if (pg === g) return 1
  if (pg.includes(g) || g.includes(pg)) return 0.7

  const tags = (program.data.tags || []).map(normalize)
  if (tags.some(t => t === g)) return 0.8
  if (tags.some(t => t.includes(g) || g.includes(t))) return 0.5

  return 0
}

function scoreDays(program: MatchableProgram, prefs: ClientPreferences): number {
  const programDays = program.data.days?.length || program.data.split?.filter(d => d.active).length || 0
  const preferred = prefs.daysPerWeek

  if (programDays === preferred) return 1
  if (Math.abs(programDays - preferred) === 1) return 0.7
  if (Math.abs(programDays - preferred) === 2) return 0.3
  return 0
}

function scoreExperience(program: MatchableProgram, prefs: ClientPreferences): number {
  const pe = normalize(
    program.data.clientProfile?.experience ||
    program.data.tags?.find(t => /beginner|intermediate|advanced/i.test(t)) ||
    ''
  )
  const e = normalize(prefs.experience)
  if (pe === e) return 1
  if (pe.includes(e) || e.includes(pe)) return 0.7

  const tags = (program.data.tags || []).map(normalize)
  if (tags.some(t => t === e)) return 0.8

  return 0
}

function scoreEquipment(program: MatchableProgram, prefs: ClientPreferences, rules: MatchingRules): number {
  const progEquip = normalize(program.data.clientProfile?.equipment || '')
  const prefEquip = normalize(prefs.equipment)

  if (progEquip === prefEquip) return 1

  const compat = rules.equipmentCompatibility[prefs.equipment] || []
  const progCompat = rules.equipmentCompatibility[program.data.clientProfile?.equipment || ''] || []

  if (compat.some(c => partialMatch(c, program.data.clientProfile?.equipment || ''))) return 0.9
  if (progCompat.some(c => partialMatch(c, prefs.equipment))) return 0.8

  if (partialMatch(progEquip, prefEquip)) return 0.6

  return 0.2
}

function scoreTime(program: MatchableProgram, prefs: ClientPreferences): number {
  const progTime = program.data.clientProfile?.timePerSession || 60
  const prefTime = prefs.timePerSession
  const diff = Math.abs(progTime - prefTime)

  if (diff <= 10) return 1
  if (diff <= 20) return 0.7
  if (diff <= 30) return 0.4
  return 0.1
}

function scoreBonus(program: MatchableProgram, prefs: ClientPreferences, rules: MatchingRules): number {
  let bonus = 0
  const progName = program.data.programName || ''
  const progMethod = program.data.trainingMethod || program.data.method || ''

  const gmMatch = rules.goalMethodMatrix.find(
    gm => partialMatch(gm.goal, prefs.goal) && partialMatch(gm.method, progMethod)
  )
  if (gmMatch) {
    bonus += Math.min(gmMatch.score / 100, 0.15)
  }

  const gpMatch = rules.goalProgramPipelines.find(
    gp => partialMatch(gp.goal, prefs.goal) && partialMatch(gp.method, progMethod) && partialMatch(gp.program, progName)
  )
  if (gpMatch) {
    bonus += Math.min(gpMatch.score / 100, 0.10)
  }

  const prefMethods = rules.experienceMethodPreference[prefs.experience] || []
  if (prefMethods.some(m => partialMatch(m, progMethod))) {
    bonus += 0.05
  }

  return Math.min(bonus, 0.30)
}

// ── Public API ───────────────────────────────────────────────────

export function scoreProgram(
  program: MatchableProgram,
  prefs: ClientPreferences,
  rules: MatchingRules
): MatchResult {
  const w = rules.scoringWeights

  const goalScore = scoreGoal(program, prefs, rules)
  const daysScore = scoreDays(program, prefs)
  const experienceScore = scoreExperience(program, prefs)
  const equipmentScore = scoreEquipment(program, prefs, rules)
  const timeScore = scoreTime(program, prefs)
  const bonusScore = scoreBonus(program, prefs, rules)

  const rawScore =
    goalScore * w.goal +
    daysScore * w.days +
    experienceScore * w.experience +
    equipmentScore * w.equipment +
    timeScore * w.time +
    bonusScore

  const maxScore = w.goal + w.days + w.experience + w.equipment + w.time + 0.30
  const percentage = Math.round((rawScore / maxScore) * 100)

  const programDays = program.data.days?.length || program.data.split?.filter(d => d.active).length || 0

  return {
    program,
    score: rawScore,
    maxScore,
    percentage,
    breakdown: {
      goalScore,
      daysScore,
      experienceScore,
      equipmentScore,
      timeScore,
      bonusScore,
    },
    exactDayMatch: programDays === prefs.daysPerWeek,
  }
}

export async function findMatches(
  prefs: ClientPreferences,
  programs: MatchableProgram[],
  rules?: MatchingRules
): Promise<MatchResult[]> {
  const r = rules || await loadMatchingRules()

  const scored = programs.map(p => scoreProgram(p, prefs, r))

  scored.sort((a, b) => {
    if (a.exactDayMatch && !b.exactDayMatch) return -1
    if (!a.exactDayMatch && b.exactDayMatch) return 1
    return b.score - a.score
  })

  return scored
}

export async function findTopMatches(
  prefs: ClientPreferences,
  programs: MatchableProgram[],
  limit: number = 3,
  rules?: MatchingRules
): Promise<MatchResult[]> {
  const all = await findMatches(prefs, programs, rules)
  return all.slice(0, limit)
}
