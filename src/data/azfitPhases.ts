/**
 * AzFIT 12-Phase Training Templates
 * Extracted from NEWAZFIT Trainer master sheet.xlsx
 * These are the canonical phase definitions for Program Builder v2
 */

import type { PhaseTemplate } from '../types/program-builder-v2'

// Import the raw JSON extracted from Excel
import rawPhases from '../../.temp/Sheets/extracted/program_phases.json'

// Motion category mapping — inferred from exercise names
// This is a best-effort mapping; in production this comes from the DB
const MOTION_CATEGORY_MAP: Record<string, string> = {
  // PRESSING
  'DB Incline Press': 'PRESSING',
  'Incline Press': 'PRESSING',
  'Bench Press': 'PRESSING',
  'Shoulder Press': 'PRESSING',
  'Military Press': 'PRESSING',
  'Push Up': 'PRESSING',
  'Dip': 'PRESSING',
  'Chest Press': 'PRESSING',
  'Landmine Press': 'PRESSING',
  // PULLING
  'Chin up': 'PULLING',
  'Pull up': 'PULLING',
  'Pulldown': 'PULLING',
  'Row': 'PULLING',
  'Cable Row': 'PULLING',
  'DB Row': 'PULLING',
  'Barbell Row': 'PULLING',
  'T-Bar Row': 'PULLING',
  'Seated Row': 'PULLING',
  'Inverted Row': 'PULLING',
  // UNILATERAL_QUAD
  'Split Squat': 'UNILATERAL_QUAD',
  'Step Up': 'UNILATERAL_QUAD',
  'Lunge': 'UNILATERAL_QUAD',
  'Bulgarian': 'UNILATERAL_QUAD',
  'Pistol': 'UNILATERAL_QUAD',
  // BILATERAL_QUAD
  'Squat': 'BILATERAL_QUAD',
  'Hack Squat': 'BILATERAL_QUAD',
  'Leg Press': 'BILATERAL_QUAD',
  'Goblet Squat': 'BILATERAL_QUAD',
  'Front Squat': 'BILATERAL_QUAD',
  'Back Squat': 'BILATERAL_QUAD',
  // POSTERIOR
  'Leg Curl': 'POSTERIOR',
  'RDL': 'POSTERIOR',
  'Deadlift': 'POSTERIOR',
  'Hyper': 'POSTERIOR',
  'Hip Thrust': 'POSTERIOR',
  'Glute': 'POSTERIOR',
  'Hamstring': 'POSTERIOR',
  'Good Morning': 'POSTERIOR',
  'Nordic': 'POSTERIOR',
  // TARGET_AREAS
  'Lateral Raise': 'TARGET_AREAS',
  'Rear Delt': 'TARGET_AREAS',
  'Face Pull': 'TARGET_AREAS',
  'Shrug': 'TARGET_AREAS',
  'Fly': 'TARGET_AREAS',
  // METCON_BRACING
  'Plank': 'METCON_BRACING',
  'Dead Bug': 'METCON_BRACING',
  'Pallof': 'METCON_BRACING',
  'Farmer': 'METCON_BRACING',
  'Suitcase': 'METCON_BRACING',
  'Carry': 'METCON_BRACING',
  // BRACING
  'Ab Wheel': 'BRACING',
  'Hanging Leg Raise': 'BRACING',
  'Cable Crunch': 'BRACING',
  // BICEPS
  'Curl': 'BICEPS',
  'Hammer Curl': 'BICEPS',
  'Incline Curl': 'BICEPS',
  // TRICEPS
  'Tricep': 'TRICEPS',
  'Pushdown': 'TRICEPS',
  'Overhead Extension': 'TRICEPS',
  'Skull': 'TRICEPS',
  // DELT_SCAP_CONTROL
  'External Rotation': 'DELT_SCAP_CONTROL',
  'Scap': 'DELT_SCAP_CONTROL',
  'Wall Slide': 'DELT_SCAP_CONTROL',
}

function inferMotionCategory(exerciseName: string): string {
  const name = exerciseName.toLowerCase()
  for (const [keyword, category] of Object.entries(MOTION_CATEGORY_MAP)) {
    if (name.includes(keyword.toLowerCase())) {
      return category
    }
  }
  return 'OTHER'
}

// Difficulty mapping by phase
const PHASE_DIFFICULTY: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
  'P1-GBC1': 'beginner',
  'P2-GBC2': 'beginner',
  'P3-GBC3': 'intermediate',
  'P4-BLSB1': 'intermediate',
  'P5-BLSB2': 'intermediate',
  'P6-STR1': 'intermediate',
  'P7-STR2': 'advanced',
  'P8-STR3': 'advanced',
  'P9-TRANS': 'intermediate',
  'P10-HYP1': 'advanced',
  'P11-HYP2': 'advanced',
  'P12-M12': 'intermediate',
}

const PHASE_DESCRIPTIONS: Record<string, string> = {
  'P1-GBC1': 'German Body Composition Block 1 — Full body training with moderate volume to establish baseline work capacity and movement patterns.',
  'P2-GBC2': 'German Body Composition Block 2 — Increased density and slightly higher intensity. Continued full body approach with progressive overload.',
  'P3-GBC3': 'German Body Composition Block 3 — Peak GBC phase with highest density. Prepares body for structural balance work.',
  'P4-BLSB1': 'Back Loaded Structural Balance 1 — Addresses asymmetries and weak links. Unilateral focus with corrective exercises.',
  'P5-BLSB2': 'Back Loaded Structural Balance 2 — Advanced structural balance with increased loading. Prepares for strength phases.',
  'P6-STR1': 'Strength Phase 1 — Relative strength development with lower reps and higher loads. Neural adaptation focus.',
  'P7-STR2': 'Strength Phase 2 — Continued strength progression with wave loading and cluster sets.',
  'P8-STR3': 'Strength Phase 3 — Peak strength phase. Maximum intensity with longer rest periods.',
  'P9-TRANS': 'Transition Phase — Functional hypertrophy bridging strength and hypertrophy blocks. Mixed rep ranges.',
  'P10-HYP1': 'Hypertrophy Phase 1: High Intensity Tension — Mechanical tension focus. Controlled eccentrics and high time under tension.',
  'P11-HYP2': 'Hypertrophy Phase 2: Metabolite Sustained Tension — Metabolic stress focus. Shorter rest, higher reps, drop sets.',
  'P12-M12': 'Month 12 — Maintenance phase. Consolidated programming to retain gains with reduced volume.',
}

const PHASE_FOCUS: Record<string, string> = {
  'P1-GBC1': 'Full Body / Work Capacity',
  'P2-GBC2': 'Full Body / Density',
  'P3-GBC3': 'Full Body / Peak Density',
  'P4-BLSB1': 'Structural Balance / Unilateral',
  'P5-BLSB2': 'Structural Balance / Advanced',
  'P6-STR1': 'Relative Strength / Neural',
  'P7-STR2': 'Relative Strength / Wave Loading',
  'P8-STR3': 'Relative Strength / Peak',
  'P9-TRANS': 'Functional Hypertrophy / Mixed',
  'P10-HYP1': 'Hypertrophy / Mechanical Tension',
  'P11-HYP2': 'Hypertrophy / Metabolic Stress',
  'P12-M12': 'Maintenance / Consolidation',
}

// Transform raw JSON into typed PhaseTemplate array
export const AZFIT_PHASES: PhaseTemplate[] = (Array.isArray(rawPhases) ? rawPhases : Object.values(rawPhases))
  .map((p: unknown, index: number) => {
    const phase = p as {
      phase_code: string
      phase_name: string
      method: string
      duration_weeks: number
      sessions: Array<{
        session_number: number
        session_name: string
        focus: string
        exercises: Array<{
          order_notation: string
          exercise_name: string
          reps: string
          sets: number
          tempo: string
          tut: number | null
          rest_seconds: number
          rest_display: string
          video_link: string | null
        }>
      }>
    }

    return {
      phaseCode: phase.phase_code,
      phaseName: phase.phase_name,
      method: phase.method,
      durationWeeks: phase.duration_weeks,
      difficulty: PHASE_DIFFICULTY[phase.phase_code] || 'intermediate',
      focusArea: PHASE_FOCUS[phase.phase_code] || 'General',
      description: PHASE_DESCRIPTIONS[phase.phase_code] || '',
      sortOrder: index + 1,
      sessions: phase.sessions.map((s) => ({
        sessionNumber: s.session_number,
        sessionName: s.session_name,
        focus: s.focus,
        exercises: s.exercises.map((e) => ({
          orderNotation: e.order_notation,
          exerciseName: e.exercise_name,
          reps: String(e.reps),
          sets: e.sets,
          tempo: e.tempo,
          tut: e.tut,
          restSeconds: e.rest_seconds,
          restDisplay: e.rest_display,
          videoLink: e.video_link,
          motionCategory: inferMotionCategory(e.exercise_name),
        })),
      })),
    }
  })
  .sort((a, b) => a.sortOrder - b.sortOrder)

// Quick-access: most commonly used phases (for Quick Start Strip)
export const QUICK_START_PHASE_CODES = [
  'P1-GBC1',
  'P6-STR1',
  'P10-HYP1',
  'P4-BLSB1',
  'P9-TRANS',
  'P12-M12',
]

export const getPhaseByCode = (code: string): PhaseTemplate | undefined =>
  AZFIT_PHASES.find((p) => p.phaseCode === code)

export const getQuickStartPhases = (): PhaseTemplate[] =>
  QUICK_START_PHASE_CODES.map((code) => getPhaseByCode(code)).filter(Boolean) as PhaseTemplate[]

// Method options for filter dropdown
export const METHOD_OPTIONS = [
  { value: 'all', label: 'All Methods' },
  { value: 'GBC', label: 'GBC (German Body Comp)' },
  { value: 'Structural Balance', label: 'Structural Balance' },
  { value: 'Relative Strength', label: 'Relative Strength' },
  { value: 'Functional Hypertrophy', label: 'Functional Hypertrophy' },
  { value: 'Hypertrophy', label: 'Hypertrophy' },
  { value: 'Metabolic', label: 'Metabolic' },
  { value: 'Maintenance', label: 'Maintenance' },
] as const

// Duration options for filter dropdown
export const DURATION_OPTIONS = [
  { value: 'all', label: 'Any Duration' },
  { value: '4', label: '4 weeks' },
  { value: '6', label: '6 weeks' },
  { value: '8', label: '8 weeks' },
  { value: '12', label: '12 weeks' },
  { value: '16', label: '16 weeks' },
] as const

// Difficulty options for filter dropdown
export const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Any Difficulty' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const
