import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Trophy,
  TrendingUp,
  Dumbbell,
  Target,
  Calendar,
  ArrowUp,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { useAppDataStore } from '../stores/useAppDataStore'
import { useSyncWorkoutSessions } from '../hooks/useWorkoutSync'
import {
  getExerciseHistory,
  getProgressiveOverloadSuggestion,
  formatShortDate,
} from '../lib/workoutAnalytics'

export default function ExerciseDetailPage() {
  const { clientId, exerciseId } = useParams<{ clientId: string; exerciseId: string }>()
  const navigate = useNavigate()
  const { workoutSessions, exercises } = useAppDataStore()
  const [activeChart, setActiveChart] = useState<'load' | 'volume' | '1rm'>('load')

  useSyncWorkoutSessions(clientId)

  const history = useMemo(() => {
    if (!clientId || !exerciseId) return null
    return getExerciseHistory(workoutSessions, clientId, exerciseId)
  }, [workoutSessions, clientId, exerciseId])

  const suggestion = useMemo(() => {
    if (!clientId || !exerciseId) return null
    return getProgressiveOverloadSuggestion(workoutSessions, clientId, exerciseId)
  }, [workoutSessions, clientId, exerciseId])

  const exercise = exerciseId ? exercises[exerciseId] : null

  const chartData = useMemo(() => {
    if (!history) return []
    const bySession = new Map<string, { date: string; load: number; volume: number; estimated1RM: number }>()
    for (const r of history.records) {
      const existing = bySession.get(r.sessionId)
      if (!existing || r.load > existing.load) {
        bySession.set(r.sessionId, {
          date: formatShortDate(r.date),
          load: r.load,
          volume: r.volume,
          estimated1RM: r.estimated1RM,
        })
      }
    }
    return Array.from(bySession.values())
  }, [history])

  if (!history) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <Dumbbell size={40} className="mx-auto text-dark-muted mb-3" />
          <p className="text-dark-secondary">No history for this exercise yet.</p>
          <button
            onClick={() => navigate(`/clients/${clientId}`)}
            className="mt-4 flex items-center gap-1 text-sm text-cyan hover:underline mx-auto"
          >
            <ChevronLeft size={16} /> Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={() => navigate(`/clients/${clientId}`)}
            className="flex items-center gap-1 text-sm text-dark-secondary hover:text-dark-primary transition-colors w-fit"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-dark-primary">{history.exerciseName}</h1>
            <p className="text-sm text-dark-muted">
              {exercise?.muscleGroup || 'Exercise'} • {history.sessionsCount} sessions • {history.totalSets} sets logged
            </p>
          </div>
        </div>

        {/* PR Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <PRCard label="Max Load" value={`${history.prLoad}kg`} icon={Trophy} color="#EAB308" />
          <PRCard label="Best Reps" value={`${history.prReps}`} icon={Target} color="#8B5CF6" />
          <PRCard label="Best Volume (set)" value={`${history.prVolume}kg`} icon={TrendingUp} color="#22C55E" />
          <PRCard label="Est. 1RM" value={`${history.bestEstimated1RM}kg`} icon={Dumbbell} color="#00AEEF" />
        </div>

        {/* Progressive Overload Suggestion */}
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[rgba(0,174,239,0.08)] to-[rgba(34,197,94,0.04)] border border-cyan/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center flex-shrink-0">
                <ArrowUp size={20} className="text-cyan" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-primary">Progressive Overload Suggestion</p>
                <p className="text-xs text-dark-secondary mt-1">{suggestion.reason}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-dark-primary">
                    Next:{' '}
                    <span className="font-mono font-bold text-cyan">
                      {suggestion.suggestedLoad}kg × {suggestion.suggestedReps}
                    </span>
                  </span>
                  <span className="text-xs text-dark-muted">
                    Last: {suggestion.lastLoad}kg × {suggestion.lastReps} @ RPE{suggestion.lastRpe}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chart */}
        <div className="bg-[#141414] border border-dark-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-dark-primary">Progress Over Time</h2>
            <div className="flex gap-1 bg-[#1A1A1A] rounded-lg p-1">
              {[
                { key: 'load' as const, label: 'Load' },
                { key: 'volume' as const, label: 'Volume' },
                { key: '1rm' as const, label: '1RM' },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveChart(c.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeChart === c.key
                      ? 'bg-dark-hover text-cyan'
                      : 'text-dark-muted hover:text-dark-secondary'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-dark-muted">No chart data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'volume' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#22C55E"
                      fillOpacity={1}
                      fill="url(#volGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }}
                    />
                    <Line
                      type="monotone"
                      dataKey={activeChart === 'load' ? 'load' : 'estimated1RM'}
                      stroke={activeChart === 'load' ? '#00AEEF' : '#EAB308'}
                      strokeWidth={2}
                      dot={{ r: 3, fill: activeChart === 'load' ? '#00AEEF' : '#EAB308' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Session history table */}
        <div className="bg-[#141414] border border-dark-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-dark-primary mb-4">Set History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Date', 'Program', 'Set', 'Load', 'Reps', 'RPE', 'Volume', 'Est. 1RM'].map((h) => (
                    <th key={h} className="text-left text-xs text-dark-muted font-semibold uppercase py-2 px-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...history.records].reverse().map((r, i) => (
                  <tr key={i} className="border-b border-dark-divider hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-2.5 px-3 text-xs text-dark-secondary font-mono whitespace-nowrap">
                      <Calendar size={12} className="inline mr-1" />
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-dark-secondary truncate max-w-[120px]">{r.programName}</td>
                    <td className="py-2.5 px-3 text-xs text-dark-primary">{r.setNumber}</td>
                    <td className="py-2.5 px-3 text-sm text-dark-primary font-mono font-semibold">{r.load}kg</td>
                    <td className="py-2.5 px-3 text-sm text-dark-secondary font-mono">{r.reps}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          r.rpe >= 9
                            ? 'text-danger bg-[rgba(239,68,68,0.1)]'
                            : r.rpe >= 7
                              ? 'text-warning bg-[rgba(234,179,8,0.1)]'
                              : 'text-success bg-[rgba(34,197,94,0.1)]'
                        }`}
                      >
                        {r.rpe}/10
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-sm text-dark-secondary font-mono">{r.volume}</td>
                    <td className="py-2.5 px-3 text-sm text-cyan font-mono">{r.estimated1RM}kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function PRCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-[#141414] border border-dark-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <span className="text-xs text-dark-muted">{label}</span>
      </div>
      <p className="text-xl font-bold text-dark-primary font-mono">{value}</p>
    </div>
  )
}
