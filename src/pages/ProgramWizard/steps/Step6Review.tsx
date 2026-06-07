import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Search, X, RefreshCw } from 'lucide-react'
import type { DaySession, Exercise } from '../types'

interface Step6ReviewProps {
  weeklySplit: DaySession[]
  exercises: Exercise[]
  onChange: (split: DaySession[]) => void
}

export default function Step6Review({ weeklySplit, exercises, onChange }: Step6ReviewProps) {
  const [swapModal, setSwapModal] = useState<{ dayIndex: number; exId: string; currentName: string } | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]))

  const activeDays = weeklySplit.filter(d => !d.isRest)

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>()
    exercises.forEach(e => groups.add(e.MuscleGroup))
    return Array.from(groups).sort()
  }, [exercises])

  const toggleDay = (idx: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const filteredExercises = useMemo(() => {
    let result = exercises
    if (searchFilter) {
      const q = searchFilter.toLowerCase()
      result = result.filter(e => e.Name.toLowerCase().includes(q) || e.MuscleGroup.toLowerCase().includes(q))
    }
    if (muscleFilter) {
      result = result.filter(e => e.MuscleGroup === muscleFilter)
    }
    return result
  }, [exercises, searchFilter, muscleFilter])

  const handleSwap = (dayIndex: number, exId: string, newEx: Exercise) => {
    const updated = [...weeklySplit]
    updated[dayIndex] = {
      ...updated[dayIndex],
      exercises: updated[dayIndex].exercises.map(ex =>
        ex.id === exId
          ? { ...ex, exerciseId: newEx.ExerciseID, name: newEx.Name, muscleGroup: newEx.MuscleGroup }
          : ex
      ),
    }
    onChange(updated)
    setSwapModal(null)
  }

  // Summary stats
  const totalExercises = activeDays.reduce((s, d) => s + d.exercises.length, 0)
  const totalSets = activeDays.reduce((s, d) => s + d.exercises.reduce((es, ex) => es + ex.sets, 0), 0)

  // Muscle distribution
  const muscleDist = useMemo(() => {
    const dist: Record<string, number> = {}
    activeDays.forEach(d => d.exercises.forEach(ex => {
      const mg = ex.muscleGroup || 'Other'
      dist[mg] = (dist[mg] || 0) + ex.sets
    }))
    return Object.entries(dist).sort((a, b) => b[1] - a[1])
  }, [activeDays])

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-dark-primary text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Review exercises
        </h2>
        <p className="text-dark-secondary text-sm">
          {totalExercises} exercises across {activeDays.length} training days — {totalSets} total sets/week
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {weeklySplit.map((day, dayIdx) => {
            if (day.isRest) return null
            const expanded = expandedDays.has(dayIdx)
            const daySets = day.exercises.reduce((s, ex) => s + ex.sets, 0)

            return (
              <div key={day.day} className="bg-[#141414] border border-dark-border rounded-xl overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleDay(dayIdx)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1A1A1A] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-dark-primary font-semibold text-base">{day.day} — {day.focus}</h3>
                    <span className="text-dark-muted text-xs">{day.exercises.length} exercises</span>
                    <span className="text-dark-muted text-xs">{daySets} sets</span>
                  </div>
                  <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={16} className="text-dark-muted rotate-90" />
                  </motion.div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4">
                        {day.exercises.length === 0 ? (
                          <p className="text-dark-muted text-sm py-4 text-center">No exercises for this day</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-dark-divider">
                                  {['#', 'Exercise', 'Muscle', 'Sets', 'Reps', 'Rest', 'RPE', ''].map(h => (
                                    <th key={h} className="text-left text-dark-muted text-[10px] font-semibold uppercase tracking-wider px-2 py-2">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {day.exercises.map((ex, i) => (
                                  <motion.tr
                                    key={ex.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-dark-divider last:border-b-0 hover:bg-[#1A1A1A] transition-colors"
                                  >
                                    <td className="px-2 py-2.5 text-dark-muted text-xs font-mono">{i + 1}</td>
                                    <td className="px-2 py-2.5">
                                      <div>
                                        <p className="text-dark-primary text-xs font-medium">{ex.name || '—'}</p>
                                        {ex.muscleGroup && (
                                          <p className="text-dark-muted text-[10px]">{ex.muscleGroup}</p>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-2 py-2.5 text-dark-secondary text-xs">{ex.muscleGroup || '—'}</td>
                                    <td className="px-2 py-2.5 text-dark-secondary text-xs font-mono">{ex.sets}</td>
                                    <td className="px-2 py-2.5 text-dark-secondary text-xs font-mono">{ex.reps}</td>
                                    <td className="px-2 py-2.5 text-dark-secondary text-xs font-mono">{ex.rest}</td>
                                    <td className="px-2 py-2.5">
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[rgba(0,174,239,0.1)] text-cyan">
                                        {ex.rpe}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2.5">
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => setSwapModal({ dayIndex: dayIdx, exId: ex.id, currentName: ex.name })}
                                          className="text-dark-muted hover:text-cyan p-1 rounded transition-colors"
                                          title="Swap exercise"
                                        >
                                          <RefreshCw size={12} />
                                        </button>
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#141414] border border-dark-border rounded-xl p-5">
            <h4 className="text-dark-primary font-semibold text-sm mb-4">Program Summary</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-dark-muted text-xs">Total Exercises</span>
                <span className="text-dark-primary text-sm font-semibold font-mono">{totalExercises}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-muted text-xs">Sets / Week</span>
                <span className="text-dark-primary text-sm font-semibold font-mono">{totalSets}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-muted text-xs">Training Days</span>
                <span className="text-dark-primary text-sm font-semibold font-mono">{activeDays.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-dark-border rounded-xl p-5">
            <h4 className="text-dark-primary font-semibold text-sm mb-3">Muscle Distribution</h4>
            <div className="space-y-2">
              {muscleDist.slice(0, 8).map(([muscle, sets]) => {
                const pct = totalSets > 0 ? (sets / totalSets) * 100 : 0
                return (
                  <div key={muscle}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-dark-secondary truncate">{muscle}</span>
                      <span className="text-dark-primary font-mono">{sets}</span>
                    </div>
                    <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full bg-cyan rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
              {muscleDist.length === 0 && <p className="text-dark-muted text-xs">No exercises added</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Swap Modal */}
      <AnimatePresence>
        {swapModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]"
              onClick={() => setSwapModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
              className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] md:max-w-[90vw] max-h-[80vh] bg-[#141414] border border-dark-border rounded-2xl z-[201] flex flex-col shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border flex-shrink-0">
                <div>
                  <h3 className="text-dark-primary font-semibold text-base">Swap Exercise</h3>
                  <p className="text-dark-muted text-xs">Current: {swapModal.currentName || '—'}</p>
                </div>
                <button onClick={() => setSwapModal(null)} className="text-dark-muted hover:text-dark-primary p-1 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Filters */}
              <div className="px-6 py-3 border-b border-dark-divider flex items-center gap-2 flex-shrink-0">
                <div className="flex-1 flex items-center bg-[#1A1A1A] border border-dark-border rounded-lg px-3">
                  <Search size={14} className="text-dark-muted flex-shrink-0" />
                  <input
                    placeholder="Search exercises..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-transparent text-dark-primary text-sm placeholder-[#6B6B6B] px-2 py-2 w-full outline-none"
                    autoFocus
                  />
                </div>
                <select
                  value={muscleFilter}
                  onChange={(e) => setMuscleFilter(e.target.value)}
                  className="bg-[#1A1A1A] border border-dark-border text-dark-secondary text-xs px-2 py-2 rounded-lg outline-none"
                >
                  <option value="">All Muscles</option>
                  {muscleGroups.map(mg => <option key={mg} value={mg}>{mg}</option>)}
                </select>
              </div>

              {/* Exercise List */}
              <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1 min-h-0">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.ExerciseID}
                    onClick={() => handleSwap(swapModal.dayIndex, swapModal.exId, ex)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1A1A1A] transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-dark-primary text-sm font-medium truncate">{ex.Name}</p>
                      <p className="text-dark-muted text-[10px]">{ex.MuscleGroup} — {ex.Equipment} — {ex.Difficulty}</p>
                    </div>
                    <span className="text-dark-muted text-[10px] flex-shrink-0">{ex.Type}</span>
                  </button>
                ))}
                {filteredExercises.length === 0 && (
                  <p className="text-center text-dark-muted text-sm py-8">No exercises match your filters</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
