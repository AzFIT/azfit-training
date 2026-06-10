import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Scale, Ruler, Activity } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { useAppDataStore } from '../../stores/useAppDataStore'

interface MyProgressTabProps {
  clientId: string
}

export default function MyProgressTab({ clientId }: MyProgressTabProps) {
  const bodyStatsEntries = useAppDataStore((s) => s.bodyStatsEntries)
  const workoutSessions = useAppDataStore((s) => s.workoutSessions)

  // Get body stats history for this client
  const bodyStatsHistory = useMemo(() => {
    const entries = Object.values(bodyStatsEntries)
      .filter((e) => e.clientId === clientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return entries
  }, [bodyStatsEntries, clientId])

  // Get workout history for adherence calculation
  const workoutHistory = useMemo(() => {
    return Object.values(workoutSessions)
      .filter((ws) => ws.clientId === clientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [workoutSessions, clientId])

  // Weight chart data
  const weightData = useMemo(() => {
    return bodyStatsHistory.map((e) => ({
      date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: e.weight,
    }))
  }, [bodyStatsHistory])

  // Body fat chart data
  const bodyFatData = useMemo(() => {
    return bodyStatsHistory.map((e) => ({
      date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bodyFat: e.bodyFatPercent,
    }))
  }, [bodyStatsHistory])

  // Weekly adherence data (last 8 weeks)
  const adherenceData = useMemo(() => {
    const weeks: { week: string; adherence: number }[] = []
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - i * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weekWorkouts = workoutHistory.filter((ws) => {
        const d = new Date(ws.date)
        return d >= weekStart && d <= weekEnd
      })

      // Assume 4 workouts per week target
      const adherence = Math.min(100, Math.round((weekWorkouts.length / 4) * 100))
      weeks.push({
        week: `W${8 - i}`,
        adherence,
      })
    }
    return weeks
  }, [workoutHistory])

  const latest = bodyStatsHistory[bodyStatsHistory.length - 1]
  const first = bodyStatsHistory[0]

  const weightChange = latest && first ? +(latest.weight - first.weight).toFixed(1) : 0
  const bodyFatChange = latest && first ? +(latest.bodyFatPercent - first.bodyFatPercent).toFixed(1) : 0

  const chartTextColor = '#A0A0A0'
  const chartGridColor = '#2A2A2A'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-az-black-card border border-dark-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={18} className="text-cyan" />
          <span className="text-sm font-medium text-cyan">My Progress</span>
        </div>
        <h2 className="text-xl font-semibold text-dark-primary">Body Composition</h2>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-az-black-card border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Scale size={16} className="text-cyan" />
            <span className="text-sm text-dark-secondary">Weight</span>
          </div>
          <p className="text-2xl font-bold text-dark-primary">{latest?.weight ?? '-'} kg</p>
          {weightChange !== 0 && (
            <p className={`text-sm mt-1 ${weightChange < 0 ? 'text-success' : 'text-danger'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange} kg since start
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-az-black-card border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Ruler size={16} className="text-warning" />
            <span className="text-sm text-dark-secondary">Body Fat</span>
          </div>
          <p className="text-2xl font-bold text-dark-primary">{latest?.bodyFatPercent ?? '-'}%</p>
          {bodyFatChange !== 0 && (
            <p className={`text-sm mt-1 ${bodyFatChange < 0 ? 'text-success' : 'text-danger'}`}>
              {bodyFatChange > 0 ? '+' : ''}{bodyFatChange}% since start
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-az-black-card border border-dark-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-success" />
            <span className="text-sm text-dark-secondary">Workouts</span>
          </div>
          <p className="text-2xl font-bold text-dark-primary">{workoutHistory.length}</p>
          <p className="text-sm text-dark-muted mt-1">Total logged</p>
        </motion.div>
      </div>

      {/* Weight Chart */}
      {weightData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-az-black-card border border-dark-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-dark-primary mb-4">Weight Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartTextColor} fontSize={12} />
                <YAxis stroke={chartTextColor} fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141414',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    color: '#F0F0F0',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#00AEEF"
                  strokeWidth={2}
                  dot={{ fill: '#00AEEF', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Body Fat Chart */}
      {bodyFatData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-az-black-card border border-dark-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-dark-primary mb-4">Body Fat % Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bodyFatData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartTextColor} fontSize={12} />
                <YAxis stroke={chartTextColor} fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141414',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    color: '#F0F0F0',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Weekly Adherence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-az-black-card border border-dark-border rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-dark-primary mb-4">Weekly Adherence</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adherenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="week" stroke={chartTextColor} fontSize={12} />
              <YAxis stroke={chartTextColor} fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141414',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: '#F0F0F0',
                }}
                formatter={(value: number) => [`${value}%`, 'Adherence']}
              />
              <Bar dataKey="adherence" fill="#00AEEF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* No data state */}
      {bodyStatsHistory.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-az-black-card border border-dark-border rounded-2xl p-8 text-center"
        >
          <TrendingUp size={32} className="text-dark-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-dark-primary mb-1">No Data Yet</h3>
          <p className="text-dark-secondary text-sm">
            Your progress data will appear here once your trainer logs your body stats.
          </p>
        </motion.div>
      )}
    </div>
  )
}
