/**
 * Roadmap Tab — 1FIT-inspired client training journey timeline
 *
 * Shows 5 phases: Assessment → Foundation → Intensification → Realization → Peak
 * With deliverables, week-by-week breakdown, and progress metrics
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Circle,
  ArrowRight,
  Dumbbell,
  Calendar,
  Target,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────

interface PhaseDeliverable {
  label: string
  completed: boolean
}

interface PhaseWeek {
  week: number
  method: string
  completed: boolean
  current: boolean
}

interface RoadmapPhase {
  number: number
  name: string
  weekRange: string
  status: 'complete' | 'active' | 'upcoming'
  deliverables: PhaseDeliverable[]
  weeks?: PhaseWeek[]
  currentMethod?: string
  targetMetrics?: string
}

interface ClientMetric {
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

// ── Demo Data ─────────────────────────────────────────────────────

const DEMO_PHASES: RoadmapPhase[] = [
  {
    number: 1,
    name: 'ASSESSMENT',
    weekRange: 'W1-W2',
    status: 'complete',
    deliverables: [
      { label: 'Body composition baseline', completed: true },
      { label: '1RM test', completed: true },
      { label: 'PAR-Q completed', completed: true },
      { label: 'Goal setting session', completed: true },
      { label: 'Progress photos', completed: true },
      { label: 'Mobility screen', completed: true },
    ],
  },
  {
    number: 2,
    name: 'FOUNDATION',
    weekRange: 'W3-W5',
    status: 'complete',
    deliverables: [
      { label: 'Movement pattern mastery', completed: true },
      { label: 'Technique refinement', completed: true },
      { label: 'Work capacity build', completed: true },
      { label: 'Core strength base', completed: true },
    ],
  },
  {
    number: 3,
    name: 'INTENSIFICATION',
    weekRange: 'W6-W10',
    status: 'active',
    deliverables: [
      { label: 'Volume progression', completed: true },
      { label: 'Intensity techniques', completed: false },
      { label: 'Strength benchmarks', completed: false },
      { label: 'BioPrint mid-point', completed: false },
    ],
    weeks: [
      { week: 6, method: 'GVT 10x10', completed: true, current: false },
      { week: 7, method: '5-4-3-2-1', completed: true, current: false },
      { week: 8, method: 'Rest-Pause', completed: true, current: false },
      { week: 9, method: 'Cluster Sets', completed: false, current: true },
      { week: 10, method: 'Wave Loading', completed: false, current: false },
    ],
    currentMethod: 'Rest-Pause (Poliquin)',
    targetMetrics: 'Bench 1RM 65kg, Squat 1RM 90kg',
  },
  {
    number: 4,
    name: 'REALIZATION',
    weekRange: 'W11-W13',
    status: 'upcoming',
    deliverables: [
      { label: '1RM test week', completed: false },
      { label: 'Progress photos', completed: false },
      { label: 'BioPrint retest', completed: false },
    ],
  },
  {
    number: 5,
    name: 'PEAK',
    weekRange: 'W14-W16',
    status: 'upcoming',
    deliverables: [
      { label: 'Peak week', completed: false },
      { label: 'Final assessment', completed: false },
      { label: 'Next program planning', completed: false },
    ],
  },
]

const DEMO_METRICS: ClientMetric[] = [
  { label: '1RM Bench', value: '62kg', change: '↑ 7kg', changeType: 'positive' },
  { label: '1RM Squat', value: '85kg', change: '↑ 10kg', changeType: 'positive' },
  { label: 'Weight', value: '65.8kg', change: '↓ 2.2kg', changeType: 'positive' },
  { label: 'Body Fat', value: '19.5%', change: '↓ 2.5%', changeType: 'positive' },
  { label: 'Adherence', value: '92%', change: '', changeType: 'neutral' },
  { label: 'Sessions', value: '18/20', change: '', changeType: 'neutral' },
]

// ── Components ────────────────────────────────────────────────────

function StatusDot({ status }: { status: RoadmapPhase['status'] }) {
  const colors = {
    complete: '#22C55E',
    active: '#00AEEF',
    upcoming: '#94A3B8',
  }
  return (
    <div
      className="w-3 h-3 rounded-full flex-shrink-0"
      style={{
        backgroundColor: colors[status],
        boxShadow: status === 'active' ? `0 0 8px ${colors[status]}` : 'none',
      }}
    />
  )
}

function PhaseTimelineConnector({ status }: { status: RoadmapPhase['status'] }) {
  const colors = {
    complete: '#22C55E',
    active: '#00AEEF',
    upcoming: '#E2E8F0',
  }
  return (
    <div
      className="absolute left-[5px] top-6 bottom-0 w-0.5"
      style={{ backgroundColor: colors[status] }}
    />
  )
}

function DeliverableItem({ deliverable }: { deliverable: PhaseDeliverable }) {
  return (
    <div className="flex items-center gap-2">
      {deliverable.completed ? (
        <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
          <Check size={10} className="text-success" strokeWidth={3} />
        </div>
      ) : (
        <div className="w-4 h-4 rounded-full border border-light-border flex-shrink-0" />
      )}
      <span
        className={`text-xs ${
          deliverable.completed ? 'text-light-secondary' : 'text-light-muted'
        }`}
      >
        {deliverable.label}
      </span>
    </div>
  )
}

function WeekPill({ week }: { week: PhaseWeek }) {
  return (
    <div
      className={`flex flex-col items-center p-2 rounded-lg min-w-[70px] ${
        week.current
          ? 'bg-cyan/10 border border-cyan/30'
          : week.completed
          ? 'bg-light-surface'
          : 'bg-light-surface opacity-60'
      }`}
    >
      <span className="text-[10px] font-semibold text-light-muted">W{week.week}</span>
      <div className="flex items-center gap-1 mt-0.5">
        {week.completed ? (
          <Check size={10} className="text-success" strokeWidth={3} />
        ) : week.current ? (
          <ArrowRight size={10} className="text-cyan" />
        ) : (
          <Circle size={10} className="text-light-muted" />
        )}
        <span
          className={`text-[10px] ${
            week.current ? 'text-cyan font-medium' : 'text-light-secondary'
          }`}
        >
          {week.method}
        </span>
      </div>
    </div>
  )
}

function PhaseCard({ phase, isLast }: { phase: RoadmapPhase; isLast: boolean }) {
  const [_expanded, _setExpanded] = useState(phase.status === 'active')

  const statusLabels = {
    complete: 'COMPLETE',
    active: 'ACTIVE',
    upcoming: 'UPCOMING',
  }

  const statusColors = {
    complete: 'text-success',
    active: 'text-cyan',
    upcoming: 'text-light-muted',
  }

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div className="absolute left-0 top-1">
        <StatusDot status={phase.status} />
      </div>

      {/* Connector line */}
      {!isLast && <PhaseTimelineConnector status={phase.status} />}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`rounded-xl border p-4 mb-4 ${
          phase.status === 'active'
            ? 'bg-cyan/5 border-cyan/20'
            : 'bg-white border-light-border'
        }`}
      >
        {/* Phase header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-light-primary font-semibold text-sm">
                Phase {phase.number}: {phase.name}
              </h3>
              <span className={`text-xs font-bold ${statusColors[phase.status]}`}>
                {statusLabels[phase.status]}
              </span>
            </div>
            <p className="text-light-muted text-xs mt-0.5">{phase.weekRange}</p>
          </div>
        </div>

        {/* Week-by-week breakdown (active phase only) */}
        {phase.weeks && (
          <div className="mb-3">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {phase.weeks.map((w) => (
                <WeekPill key={w.week} week={w} />
              ))}
            </div>
            {phase.currentMethod && (
              <p className="text-xs text-light-secondary mt-2">
                Current method: <span className="text-cyan font-medium">{phase.currentMethod}</span>
              </p>
            )}
            {phase.targetMetrics && (
              <p className="text-xs text-light-muted mt-1">{phase.targetMetrics}</p>
            )}
          </div>
        )}

        {/* Deliverables */}
        <div className="grid grid-cols-2 gap-2">
          {phase.deliverables.map((d, i) => (
            <DeliverableItem key={i} deliverable={d} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function MetricCard({ metric }: { metric: ClientMetric }) {
  const changeColors = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-light-muted',
  }

  return (
    <div className="bg-white border border-light-border rounded-xl p-4 text-center">
      <p className="text-light-muted text-xs mb-1">{metric.label}</p>
      <p className="text-light-primary text-xl font-bold">{metric.value}</p>
      {metric.change && (
        <p className={`text-xs font-medium mt-0.5 ${changeColors[metric.changeType]}`}>
          {metric.change}
        </p>
      )}
    </div>
  )
}

// ── Main Tab Component ────────────────────────────────────────────

export default function RoadmapTab() {
  return (
    <div className="space-y-6">
      {/* Program Header */}
      <div className="bg-white border border-light-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
              <Dumbbell size={18} className="text-cyan" />
            </div>
            <div>
              <h2 className="text-light-primary font-semibold text-base">Strength Foundation</h2>
              <p className="text-light-muted text-xs">16-Week Program</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-light-muted text-xs">Week 6 of 16</p>
            <p className="text-cyan text-sm font-bold">38%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-light-surface rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '38%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-cyan"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-light-muted">
          <span>Coach: You</span>
          <span>Started: May 1, 2026</span>
          <span>Est. end: Aug 21</span>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="bg-white border border-light-border rounded-xl p-5">
        <h3 className="text-light-primary font-semibold text-sm mb-4">Training Phases</h3>
        <div>
          {DEMO_PHASES.map((phase, idx) => (
            <PhaseCard key={phase.number} phase={phase} isLast={idx === DEMO_PHASES.length - 1} />
          ))}
        </div>
      </div>

      {/* Progress Metrics */}
      <div>
        <h3 className="text-light-primary font-semibold text-sm mb-3">Progress Metrics</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {DEMO_METRICS.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 bg-cyan text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-dark transition-colors">
          <Calendar size={16} />
          View This Week&apos;s Sessions
        </button>
        <button className="px-4 py-2.5 rounded-xl bg-light-surface text-light-secondary font-medium hover:bg-light-hover transition-colors">
          <Target size={16} />
          Adjust Program
        </button>
      </div>
    </div>
  )
}


