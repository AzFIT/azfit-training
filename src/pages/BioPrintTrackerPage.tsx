/**
 * BioPrintTrackerPage — Client-facing body composition tracking
 *
 * Route: /bioprint
 *
 * Features:
 * - Log new entry (weight, body fat, measurements, photo, notes)
 * - History table with edit/delete
 * - Progress charts (weight trend, BF% trend)
 * - Measurement comparison (latest vs first vs goal)
 * - Progress photos side-by-side
 * - Stats cards (start → current → goal, change, days, ETA)
 */

import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingDown,
  TrendingUp,
  Camera,
  Plus,
  Trash2,
  Edit3,
  X,
  ChevronLeft,
  Weight,
  Ruler,
  Target,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts'

import { getProfile, getBioHistory, saveBioEntry } from '@/components/onboarding/calculations'
import type { BioPrintEntry } from '@/components/onboarding/types'

/* ── Types ─────────────────────────────────────────────── */

interface MeasurementEntry {
  id: string
  date: string
  weight: number
  bodyFatPercentage?: number
  measurements?: {
    chest: number
    waist: number
    hips: number
    leftArm: number
    rightArm: number
    leftThigh: number
    rightThigh: number
    leftCalf: number
    rightCalf: number
  }
  photo?: string
  notes?: string
}

/* ── Helpers ───────────────────────────────────────────── */

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function calcWeeklyRate(entries: MeasurementEntry[]): number {
  if (entries.length < 2) return 0
  const first = entries[entries.length - 1]
  const last = entries[0]
  const weeks = Math.max(1, daysBetween(first.date, last.date) / 7)
  return (first.weight - last.weight) / weeks
}

function estimateWeeksToGoal(current: number, goal: number, weeklyRate: number): number | null {
  if (!weeklyRate || weeklyRate === 0) return null
  const diff = current - goal
  const weeks = diff / weeklyRate
  return weeks > 0 ? Math.ceil(weeks) : null
}

/* ── Main Page ─────────────────────────────────────────── */

export default function BioPrintTrackerPage() {
  const navigate = useNavigate()
  const profile = getProfile()
  const [history, setHistory] = useState<MeasurementEntry[]>(() => {
    const stored = getBioHistory()
    // Convert BioPrintEntry to MeasurementEntry format
    return stored.map((e) => ({
      id: e.id,
      date: e.date,
      weight: e.weight,
      bodyFatPercentage: e.bodyFatPercentage,
      measurements: e.measurements,
      photo: e.photo,
      notes: e.notes,
    }))
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Sort newest first
  const sorted = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [history])

  const latest = sorted[0]
  const first = sorted[sorted.length - 1]
  const goalWeight = profile?.goalWeight || 0

  // Stats
  const totalChange = latest && first ? +(latest.weight - first.weight).toFixed(1) : 0
  const weeklyRate = calcWeeklyRate(sorted)
  const weeksToGoal = goalWeight && latest ? estimateWeeksToGoal(latest.weight, goalWeight, weeklyRate) : null
  const daysSinceStart = first ? daysBetween(first.date, new Date().toISOString()) : 0

  // Chart data (oldest first for charts)
  const chartData = useMemo(() => {
    return [...sorted].reverse().map((e) => ({
      date: formatDate(e.date),
      weight: e.weight,
      bodyFat: e.bodyFatPercentage || 0,
    }))
  }, [sorted])

  // Measurement comparison data
  const measurementComparison = useMemo(() => {
    if (!first?.measurements || !latest?.measurements) return []
    const keys = Object.keys(first.measurements) as (keyof typeof first.measurements)[]
    return keys.map((key) => ({
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
      first: first.measurements![key],
      latest: latest.measurements![key],
      change: +(latest.measurements![key] - first.measurements![key]).toFixed(1),
    })).filter((m) => m.first > 0 || m.latest > 0)
  }, [first, latest])

  const handleSaveEntry = useCallback((entry: MeasurementEntry) => {
    setHistory((prev) => {
      const exists = prev.find((e) => e.id === entry.id)
      let next: MeasurementEntry[]
      if (exists) {
        next = prev.map((e) => (e.id === entry.id ? entry : e))
      } else {
        next = [entry, ...prev]
      }
      // Persist
      const bioEntries: BioPrintEntry[] = next.map((e) => ({
        id: e.id,
        date: e.date,
        weight: e.weight,
        bodyFatPercentage: e.bodyFatPercentage,
        measurements: e.measurements,
        photo: e.photo,
        notes: e.notes,
      }))
      bioEntries.forEach((e) => saveBioEntry(e))
      return next
    })
    setShowAddModal(false)
    setEditingId(null)
    toast.success(editingId ? 'Entry updated' : 'Entry saved')
  }, [])

  const handleDelete = useCallback((id: string) => {
    if (!confirm('Delete this entry?')) return
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id)
      // Re-save all
      localStorage.removeItem('azfit_bio_history')
      const bioEntries: BioPrintEntry[] = next.map((e) => ({
        id: e.id,
        date: e.date,
        weight: e.weight,
        bodyFatPercentage: e.bodyFatPercentage,
        measurements: e.measurements,
        photo: e.photo,
        notes: e.notes,
      }))
      bioEntries.forEach((e) => saveBioEntry(e))
      return next
    })
    toast.success('Entry deleted')
  }, [])

  const editingEntry = editingId ? history.find((e) => e.id === editingId) || null : null

  return (
    <div className="min-h-screen bg-[var(--page-bg)] pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--card-border)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-border)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">Bio Print Tracker</h1>
              <p className="text-xs text-[var(--text-muted)]">
                {sorted.length} {sorted.length === 1 ? 'entry' : 'entries'} recorded
              </p>
            </div>
          </div>
          <button
            onClick={() => { setEditingId(null); setShowAddModal(true) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)' }}
          >
            <Plus className="w-4 h-4" />
            Log Entry
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        {sorted.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={Weight}
              label="Current Weight"
              value={`${latest?.weight}kg`}
              sub={goalWeight ? `Goal: ${goalWeight}kg` : undefined}
              color="#00AEEF"
            />
            <StatCard
              icon={totalChange <= 0 ? TrendingDown : TrendingUp}
              label="Total Change"
              value={`${totalChange > 0 ? '+' : ''}${totalChange}kg`}
              sub={`${weeklyRate > 0 ? '+' : ''}${weeklyRate.toFixed(1)}kg/week`}
              color={totalChange < 0 ? '#22C55E' : totalChange > 0 ? '#EF4444' : '#94A3B8'}
            />
            <StatCard
              icon={Clock}
              label="Days Since Start"
              value={`${daysSinceStart}`}
              sub={first ? `Started ${formatDate(first.date)}` : undefined}
              color="#8B5CF6"
            />
            <StatCard
              icon={Target}
              label={weeksToGoal ? 'Est. Weeks to Goal' : 'Goal Progress'}
              value={weeksToGoal ? `${weeksToGoal} weeks` : goalWeight ? `${Math.round(((latest?.weight || 0) / goalWeight) * 100)}%` : '—'}
              sub={weeksToGoal ? `Target: ${goalWeight}kg` : 'Keep logging'}
              color="#F59E0B"
            />
          </div>
        )}

        {/* Progress Photos */}
        {sorted.some((e) => e.photo) && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Progress Photos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sorted
                .filter((e) => e.photo)
                .slice(0, 4)
                .map((entry) => (
                  <div key={entry.id} className="relative group">
                    <img
                      src={entry.photo}
                      alt={`Progress ${formatDate(entry.date)}`}
                      className="w-full aspect-[3/4] object-cover rounded-xl"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
                      <p className="text-xs text-white font-medium">{formatDate(entry.date)}</p>
                      <p className="text-[10px] text-white/70">{entry.weight}kg</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Charts */}
        {sorted.length >= 2 && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Weight Trend */}
            <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Weight Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00AEEF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--text-muted)" domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#00AEEF" fill="url(#weightGrad)" strokeWidth={2} />
                  {goalWeight > 0 && (
                    <Area type="monotone" dataKey={() => goalWeight} stroke="#22C55E" strokeDasharray="5 5" fill="none" strokeWidth={1} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Body Fat Trend */}
            {chartData.some((d) => d.bodyFat > 0) && (
              <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Body Fat % Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData.filter((d) => d.bodyFat > 0)}>
                    <defs>
                      <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area type="monotone" dataKey="bodyFat" stroke="#8B5CF6" fill="url(#bfGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Measurement Comparison */}
        {measurementComparison.length > 0 && (
          <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Measurement Changes (cm)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={measurementComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="var(--text-muted)" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="first" name="First" fill="#94A3B8" radius={[0, 4, 4, 0]} />
                <Bar dataKey="latest" name="Latest" fill="#00AEEF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History Table */}
        {sorted.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              History
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--card-border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--card-bg)] border-b border-[var(--card-border)]">
                    <th className="text-left px-4 py-2 text-[var(--text-muted)] font-medium">Date</th>
                    <th className="text-left px-4 py-2 text-[var(--text-muted)] font-medium">Weight</th>
                    <th className="text-left px-4 py-2 text-[var(--text-muted)] font-medium">Body Fat</th>
                    <th className="text-left px-4 py-2 text-[var(--text-muted)] font-medium">Change</th>
                    <th className="text-left px-4 py-2 text-[var(--text-muted)] font-medium">Photo</th>
                    <th className="text-right px-4 py-2 text-[var(--text-muted)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((entry, i) => {
                    const prev = sorted[i + 1]
                    const change = prev ? +(entry.weight - prev.weight).toFixed(1) : 0
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-[var(--card-border)] hover:bg-[var(--card-border)]/20 transition-colors"
                      >
                        <td className="px-4 py-3 text-[var(--text-primary)]">{formatDate(entry.date)}</td>
                        <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{entry.weight}kg</td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">
                          {entry.bodyFatPercentage ? `${entry.bodyFatPercentage}%` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {change !== 0 ? (
                            <span className={`text-xs font-medium ${change < 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {change > 0 ? '+' : ''}{change}kg
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {entry.photo ? (
                            <img src={entry.photo} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditingId(entry.id); setShowAddModal(true) }}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-cyan hover:bg-cyan/10 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {sorted.length === 0 && (
          <div className="text-center py-16">
            <Ruler className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">No entries yet</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1 mb-6">
              Log your first measurement to start tracking progress
            </p>
            <button
              onClick={() => { setEditingId(null); setShowAddModal(true) }}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)' }}
            >
              Log First Entry
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <LogEntryModal
            entry={editingEntry}
            onSave={handleSaveEntry}
            onClose={() => { setShowAddModal(false); setEditingId(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Stat Card ─────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
    </div>
  )
}

/* ── Log Entry Modal ───────────────────────────────────── */

function LogEntryModal({
  entry,
  onSave,
  onClose,
}: {
  entry: MeasurementEntry | null
  onSave: (e: MeasurementEntry) => void
  onClose: () => void
}) {
  const isEditing = !!entry
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0])
  const [weight, setWeight] = useState(entry?.weight?.toString() || '')
  const [bodyFat, setBodyFat] = useState(entry?.bodyFatPercentage?.toString() || '')
  const [measurements, setMeasurements] = useState({
    chest: entry?.measurements?.chest?.toString() || '',
    waist: entry?.measurements?.waist?.toString() || '',
    hips: entry?.measurements?.hips?.toString() || '',
    leftArm: entry?.measurements?.leftArm?.toString() || '',
    rightArm: entry?.measurements?.rightArm?.toString() || '',
    leftThigh: entry?.measurements?.leftThigh?.toString() || '',
    rightThigh: entry?.measurements?.rightThigh?.toString() || '',
    leftCalf: entry?.measurements?.leftCalf?.toString() || '',
    rightCalf: entry?.measurements?.rightCalf?.toString() || '',
  })
  const [photo, setPhoto] = useState(entry?.photo || '')
  const [notes, setNotes] = useState(entry?.notes || '')

  const handleSubmit = () => {
    if (!date || !weight) return
    onSave({
      id: entry?.id || `bio_${Date.now()}`,
      date,
      weight: parseFloat(weight),
      bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
      measurements: Object.values(measurements).some((v) => v)
        ? {
            chest: parseFloat(measurements.chest) || 0,
            waist: parseFloat(measurements.waist) || 0,
            hips: parseFloat(measurements.hips) || 0,
            leftArm: parseFloat(measurements.leftArm) || 0,
            rightArm: parseFloat(measurements.rightArm) || 0,
            leftThigh: parseFloat(measurements.leftThigh) || 0,
            rightThigh: parseFloat(measurements.rightThigh) || 0,
            leftCalf: parseFloat(measurements.leftCalf) || 0,
            rightCalf: parseFloat(measurements.rightCalf) || 0,
          }
        : undefined,
      photo: photo || undefined,
      notes: notes || undefined,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-lg md:rounded-2xl rounded-t-2xl bg-[var(--card-bg)] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card-bg)] px-6 pt-4 pb-3 border-b border-[var(--card-border)] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {isEditing ? 'Edit Entry' : 'Log New Entry'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-border)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Date & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)]">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)]">Weight (kg) *</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75.5"
                step="0.1"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan/50"
              />
            </div>
          </div>

          {/* Body Fat */}
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">Body Fat % (optional)</label>
            <input
              type="number"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="15"
              step="0.1"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan/50"
            />
          </div>

          {/* Measurements */}
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">Measurements (cm) — Optional</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(measurements).map(([key, value]) => (
                <input
                  key={key}
                  type="number"
                  value={value}
                  onChange={(e) => setMeasurements((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  className="px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-cyan/50"
                />
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">Progress Photo</label>
            {photo ? (
              <div className="mt-2 relative">
                <img src={photo} alt="Progress" className="w-full max-h-48 object-cover rounded-lg" />
                <button
                  onClick={() => setPhoto('')}
                  className="absolute top-2 right-2 p-1 rounded bg-black/50 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="mt-2 flex items-center justify-center gap-2 w-full px-4 py-6 rounded-xl border-2 border-dashed border-[var(--card-border)] text-[var(--text-muted)] hover:border-cyan/30 hover:text-cyan cursor-pointer transition-colors">
                <Camera className="w-5 h-5" />
                <span className="text-sm">Take or Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (ev) => setPhoto(ev.target?.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? Any observations?"
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-cyan/50 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-[var(--card-bg)] px-6 py-4 border-t border-[var(--card-border)]">
          <button
            onClick={handleSubmit}
            disabled={!date || !weight}
            className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)' }}
          >
            {isEditing ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
