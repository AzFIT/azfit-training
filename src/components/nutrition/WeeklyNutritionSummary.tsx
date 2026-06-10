import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Minus, Award } from 'lucide-react'
import type { DailyLog } from './DailyNutritionLog'

interface WeeklyNutritionSummaryProps {
  logs: DailyLog[]
  targetCalories: number
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function WeeklyNutritionSummary({ logs, targetCalories }: WeeklyNutritionSummaryProps) {
  const stats = useMemo(() => {
    const validLogs = logs.filter((l) => l.logged.length > 0)
    if (validLogs.length === 0) return null

    const totalAdherence = validLogs.reduce((sum, log) => {
      const plannedCals = log.planned ? log.planned.targetCalories : targetCalories
      const actualCals = log.logged.reduce((acc, m) => acc + (m.status === 'missed' ? 0 : m.option.calories), 0)
      const adherence = plannedCals > 0 ? Math.min((actualCals / plannedCals) * 100, 100) : 0
      return sum + adherence
    }, 0)

    const avgAdherence = Math.round(totalAdherence / validLogs.length)
    const avgCalories = Math.round(validLogs.reduce((sum, log) => {
      return sum + log.logged.reduce((acc, m) => acc + (m.status === 'missed' ? 0 : m.option.calories), 0)
    }, 0) / validLogs.length)

    const avgWater = Math.round(validLogs.reduce((sum, log) => sum + log.waterGlasses, 0) / validLogs.length)

    // Best day
    const bestDay = validLogs.reduce((best, log) => {
      const plannedCals = log.planned ? log.planned.targetCalories : targetCalories
      const actualCals = log.logged.reduce((acc, m) => acc + (m.status === 'missed' ? 0 : m.option.calories), 0)
      const adherence = plannedCals > 0 ? Math.min((actualCals / plannedCals) * 100, 100) : 0
      return adherence > best.adherence ? { day: log.date, adherence } : best
    }, { day: '', adherence: 0 })

    return { avgAdherence, avgCalories, avgWater, bestDay }
  }, [logs, targetCalories])

  function getDayData(dateStr: string) {
    const log = logs.find((l) => l.date === dateStr)
    if (!log || log.logged.length === 0) return { status: 'empty' as const, adherence: 0 }

    const plannedCals = log.planned ? log.planned.targetCalories : targetCalories
    const actualCals = log.logged.reduce((acc, m) => acc + (m.status === 'missed' ? 0 : m.option.calories), 0)
    const adherence = plannedCals > 0 ? Math.min((actualCals / plannedCals) * 100, 100) : 0

    let status: 'good' | 'warning' | 'missed' | 'empty' = 'good'
    if (adherence < 50) status = 'missed'
    else if (adherence < 80) status = 'warning'

    return { status, adherence: Math.round(adherence) }
  }

  function getLast7Days(): { date: string; label: string }[] {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({
        date: d.toISOString().split('T')[0],
        label: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      })
    }
    return days
  }

  const weekDays = getLast7Days()

  const statusConfig = {
    good: { icon: '✅', color: 'text-success', bg: 'bg-success/15', border: 'border-success/30' },
    warning: { icon: '⚠️', color: 'text-warning', bg: 'bg-warning/15', border: 'border-warning/30' },
    missed: { icon: '❌', color: 'text-danger', bg: 'bg-danger/15', border: 'border-danger/30' },
    empty: { icon: '⬜', color: 'text-dark-subtle', bg: 'bg-transparent', border: 'border-dark-border' },
  }

  return (
    <div className="space-y-4">
      {/* 7-day grid */}
      <div className="bg-az-black-card border border-dark-border rounded-2xl p-4">
        <h3 className="text-dark-primary font-semibold text-sm mb-4">This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const data = getDayData(day.date)
            const cfg = statusConfig[data.status]

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="text-dark-muted text-[10px]">{day.label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm border ${cfg.bg} ${cfg.border}`}>
                  {cfg.icon}
                </div>
                <span className={`text-[9px] font-mono ${data.status === 'empty' ? 'text-dark-subtle' : cfg.color}`}>
                  {data.status === 'empty' ? '—' : `${data.adherence}%`}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Summary stats */}
      {stats && (
        <div className="bg-az-black-card border border-dark-border rounded-2xl p-4">
          <h3 className="text-dark-primary font-semibold text-sm mb-3">Weekly Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-az-black-elevated rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award size={14} className="text-cyan" />
                <span className="text-dark-muted text-[10px]">Avg Adherence</span>
              </div>
              <p className={`text-xl font-bold font-mono ${stats.avgAdherence >= 80 ? 'text-success' : stats.avgAdherence >= 60 ? 'text-warning' : 'text-danger'}`}>
                {stats.avgAdherence}%
              </p>
            </div>

            <div className="bg-az-black-elevated rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                {stats.avgCalories >= targetCalories ? <TrendingUp size={14} className="text-success" /> : <TrendingDown size={14} className="text-warning" />}
                <span className="text-dark-muted text-[10px]">Avg Calories</span>
              </div>
              <p className="text-dark-primary text-xl font-bold font-mono">
                {stats.avgCalories.toLocaleString()}
                <span className="text-dark-muted text-xs font-normal"> / {targetCalories.toLocaleString()}</span>
              </p>
            </div>

            <div className="bg-az-black-elevated rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Minus size={14} className="text-info" />
                <span className="text-dark-muted text-[10px]">Avg Water</span>
              </div>
              <p className="text-dark-primary text-xl font-bold font-mono">
                {stats.avgWater}
                <span className="text-dark-muted text-xs font-normal"> / 8 glasses</span>
              </p>
            </div>

            <div className="bg-az-black-elevated rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award size={14} className="text-warning" />
                <span className="text-dark-muted text-[10px]">Best Day</span>
              </div>
              <p className="text-dark-primary text-sm font-bold">
                {stats.bestDay.day ? new Date(stats.bestDay.day).toLocaleDateString('en-US', { weekday: 'short' }) : '—'}
              </p>
              <p className="text-success text-[10px] font-mono">{stats.bestDay.adherence}% adherence</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
