import { Layers, Flame, Zap, Columns, Circle, Trophy, Settings } from 'lucide-react'
import type { TemplateDef } from './types'

export const TEMPLATES: TemplateDef[] = [
  {
    key: 'GVT',
    label: 'GVT',
    icon: Layers({ size: 20 }),
    color: 'text-violet',
    bg: 'bg-violet/10',
    border: 'border-violet/30',
    gradient: 'from-violet to-violet-light',
    focus: 'Hypertrophy',
    description: '10×10 high-volume German Volume Training',
  },
  {
    key: 'GBC',
    label: 'GBC',
    icon: Flame({ size: 20 }),
    color: 'text-orange',
    bg: 'bg-orange/10',
    border: 'border-orange/30',
    gradient: 'from-orange to-orange-light',
    focus: 'Fat Loss',
    description: 'Superset-driven German Body Composition',
  },
  {
    key: 'HIIT',
    label: 'HIIT',
    icon: Zap({ size: 20 }),
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    gradient: 'from-danger to-rose',
    focus: 'Conditioning',
    description: 'High-intensity interval metabolic training',
  },
  {
    key: 'PPL',
    label: 'PPL',
    icon: Columns({ size: 20 }),
    color: 'text-cyan',
    bg: 'bg-cyan/10',
    border: 'border-cyan/30',
    gradient: 'from-cyan to-cyan-light',
    focus: 'Hypertrophy',
    description: 'Push Pull Legs — 3 to 6 day split',
  },
  {
    key: 'Full Body',
    label: 'Full Body',
    icon: Circle({ size: 20 }),
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    gradient: 'from-success to-emerald-light',
    focus: 'Strength',
    description: 'Complete body training every session',
  },
  {
    key: 'Strength',
    label: 'Strength',
    icon: Trophy({ size: 20 }),
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    gradient: 'from-warning to-amber-light',
    focus: 'Power',
    description: 'Low-rep, high-load powerlifting style',
  },
  {
    key: 'Custom',
    label: 'Custom',
    icon: Settings({ size: 20 }),
    color: 'text-light-muted',
    bg: 'bg-light-surface',
    border: 'border-light-border',
    gradient: 'from-silver to-silver-dark',
    focus: 'Flexible',
    description: 'User-defined template — any configuration',
  },
]

export const TEMPLATE_KEYS = TEMPLATES.map(t => t.key)

export const GOAL_COLOR_MAP: Record<string, string> = {
  'fat loss': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'lose fat': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'weight loss': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'muscle': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'hypertrophy': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'build muscle': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'strength': 'linear-gradient(135deg, #00AEEF, #0077B6)',
  'endurance': 'linear-gradient(135deg, #F97316, #EA580C)',
  'rehab': 'linear-gradient(135deg, #EAB308, #CA8A04)',
  'rehabilitation': 'linear-gradient(135deg, #EAB308, #CA8A04)',
  'general': 'linear-gradient(135deg, #C0C0C0, #9A9A9A)',
  'athletic': 'linear-gradient(135deg, #EC4899, #DB2777)',
}

export const GOAL_BG_MAP: Record<string, string> = {
  'fat loss': 'rgba(34,197,94,0.15)',
  'lose fat': 'rgba(34,197,94,0.15)',
  'weight loss': 'rgba(34,197,94,0.15)',
  'muscle': 'rgba(139,92,246,0.15)',
  'hypertrophy': 'rgba(139,92,246,0.15)',
  'build muscle': 'rgba(139,92,246,0.15)',
  'strength': 'rgba(0,174,239,0.15)',
  'endurance': 'rgba(249,115,22,0.15)',
  'rehab': 'rgba(234,179,8,0.15)',
  'rehabilitation': 'rgba(234,179,8,0.15)',
  'general': 'rgba(192,192,192,0.15)',
  'athletic': 'rgba(236,72,153,0.15)',
}

export const GOAL_OPTIONS = [
  { label: 'Lose Fat', value: 'fat loss' },
  { label: 'Build Muscle', value: 'muscle' },
  { label: 'Strength', value: 'strength' },
  { label: 'Endurance', value: 'endurance' },
  { label: 'Rehabilitation', value: 'rehab' },
  { label: 'General Fitness', value: 'general' },
]

export const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']

export const DIFFICULTY_COLOR: Record<string, { text: string; bg: string }> = {
  Beginner: { text: 'text-success', bg: 'rgba(34,197,94,0.15)' },
  Intermediate: { text: 'text-warning', bg: 'rgba(234,179,8,0.15)' },
  Advanced: { text: 'text-orange', bg: 'rgba(249,115,22,0.15)' },
  Elite: { text: 'text-danger', bg: 'rgba(239,68,68,0.15)' },
}
