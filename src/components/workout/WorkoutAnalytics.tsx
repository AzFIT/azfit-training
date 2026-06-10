/**
 * Workout Analytics — Charts and insights for workout history
 *
 * Phase 8: Volume trends, PR tracking, workout frequency, muscle group distribution
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts'
import { Trophy, TrendingUp, Calendar, Activity, Dumbbell } from 'lucide-react'
import type { WorkoutSessionLog } from '../../types/entities'
import {
  getSessionVolume,
  getPRs,
  formatShortDate,
} from '../../lib/workoutAnalytics'

interface WorkoutAnalyticsProps {
  sessions: WorkoutSessionLog[]
  clientId: string
}

export default function WorkoutAnalytics({ sessions, clientId }: WorkoutAnalyticsProps) {
  // Sort chronologically
  const sorted = useMemo(
    () => [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [sessions]
  )

  // ── Volume trend (per session) ──────────────────────────────────
  const volumeData = useMemo(
    () =>
      sorted.map((s) => ({
        date: formatShortDate(s.date),
        volume: Math.round(getSessionVolume(s)),
        sets: s.exercises.reduce((t, e) => t + e.sets.filter((set) => set.completed).length, 0),
      })),
    [sorted]
  )

  // ── Weekly volume aggregation ───────────────────────────────────
  const weeklyData = useMemo(() => {
    const weeks = new Map<string, { week: string; volume: number; sessions: number }>()
    for (const s of sorted) {
      const d = new Date(s.date)
      const weekKey = `${d.getFullYear()}-W${String(Math.ceil((d.getDate()) / 7)).padStart(2, '0')}`
      const existing = weeks.get(weekKey)
      if (existing) {
        existing.volume += getSessionVolume(s)
        existing.sessions += 1
      } else {
        weeks.set(weekKey, { week: weekKey, volume: getSessionVolume(s), sessions: 1 })
      }
    }
    return Array.from(weeks.values()).slice(-12) // Last 12 weeks
  }, [sorted])

  // ── PRs ─────────────────────────────────────────────────────────
  const prs = useMemo(() => getPRs(Object.fromEntries(sessions.map((s) => [s.id, s])), clientId), [sessions, clientId])

  // ── Exercise frequency (top exercises) ──────────────────────────
  const exerciseFreq = useMemo(() => {
    const freq = new Map<string, { name: string; count: number; totalVolume: number }>()
    for (const s of sorted) {
      for (const ex of s.exercises) {
        const existing = freq.get(ex.exerciseId)
        const exVolume = ex.sets.reduce(
          (t, set) => (set.completed && set.actualLoad && set.actualReps ? t + set.actualLoad * set.actualReps : t),
          0
        )
        if (existing) {
          existing.count += 1
          existing.totalVolume += exVolume
        } else {
          freq.set(ex.exerciseId, { name: ex.exerciseName, count: 1, totalVolume: exVolume })
        }
      }
    }
    return Array.from(freq.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [sorted])

  // ── Workout frequency heatmap (last 28 days) ────────────────────
  const heatmapData = useMemo(() => {
    const days: { date: string; intensity: number; label: string }[] = []
    const today = new Date()
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().split('T')[0]
      const daySessions = sorted.filter((s) => s.date.startsWith(iso))
      const dayVolume = daySessions.reduce((t, s) => t + getSessionVolume(s), 0)
      const intensity = dayVolume > 10000 ? 4 : dayVolume > 5000 ? 3 : dayVolume > 0 ? 2 : daySessions.length > 0 ? 1 : 0
      days.push({
        date: iso,
        intensity,
        label: d.toLocaleDateString('en-GB', { weekday: 'narrow' }),
      })
    }
    return days
  }, [sorted])

  const heatmapColor = (i: number): string => {
    if (i === 0) return 'bg-slate-800'
    if (i === 1) return 'bg-cyan/20'
    if (i === 2) return 'bg-cyan/40'
    if (i === 3) return 'bg-cyan/60'
    return 'bg-cyan'
  }

  if (sessions.length === 0) return null

  return (
    <div className="space-y-6">
      {/* PRs Section */}
      {prs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-az-black-card border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-warning" />
            <h3 className="text-sm font-semibold text-dark-primary">Personal Records</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {prs.slice(0, 8).map((pr) => (
              <div
                key={pr.exerciseId}
                className="bg-az-black-elevated rounded-lg p-3 border border-dark-border"
              >
                <p className="text-xs text-dark-muted truncate">{pr.exerciseName}</p>
                <p className="text-lg font-bold text-dark-primary font-mono">{pr.load}kg</p>
                <p className="text-[10px] text-dark-muted">
                  {pr.reps} reps · Est 1RM {pr.estimated1RM}kg
                </p>
                {pr.previousBest > 0 && (
                  <p className="text-[10px] text-success">
                    +{(pr.load - pr.previousBest).toFixed(1)}kg from before
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Volume Trend Chart */}
      {volumeData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-az-black-card border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-cyan" />
            <h3 className="text-sm font-semibold text-dark-primary">Volume Trend</h3>
            <span className="text-xs text-dark-muted ml-auto">kg per session</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00AEEF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#00AEEF"
                  strokeWidth={2}
                  fill="url(#volGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Weekly Volume + Frequency Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Volume */}
        {weeklyData.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-az-black-card border border-dark-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-success" />
              <h3 className="text-sm font-semibold text-dark-primary">Weekly Volume</h3>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="volume" fill="#00AEEF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Workout Frequency Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-az-black-card border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-violet" />
            <h3 className="text-sm font-semibold text-dark-primary">Last 28 Days</h3>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {heatmapData.map((day) => (
              <div
                key={day.date}
                className={`aspect-square rounded-md ${heatmapColor(day.intensity)} flex items-center justify-center`}
                title={`${day.date}: ${day.intensity > 0 ? 'Workout logged' : 'Rest'}`}
              >
                <span className="text-[9px] text-dark-muted">{day.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-dark-muted">Less</span>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${heatmapColor(i)}`} />
            ))}
            <span className="text-[10px] text-dark-muted">More</span>
          </div>
        </motion.div>
      </div>

      {/* Top Exercises */}
      {exerciseFreq.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-az-black-card border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell size={16} className="text-orange" />
            <h3 className="text-sm font-semibold text-dark-primary">Most Trained Exercises</h3>
          </div>
          <div className="space-y-2">
            {exerciseFreq.map((ex, i) => (
              <div key={ex.name} className="flex items-center gap-3">
                <span className="text-xs text-dark-muted w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-primary">{ex.name}</span>
                    <span className="text-xs text-dark-muted">{ex.count} sessions</span>
                  </div>
                  <div className="h-1.5 bg-az-black-elevated rounded-full overflow-hidden mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(ex.count / exerciseFreq[0].count) * 100}%` }}
                      className="h-full rounded-full bg-cyan"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
