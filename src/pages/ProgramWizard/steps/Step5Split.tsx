import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, GripVertical, Plus, X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { DAY_FOCUS_OPTIONS } from '../constants'
import { generateId } from '../helpers'
import type { DaySession } from '../types'

interface Step5SplitProps {
  weeklySplit: DaySession[]
  onChange: (split: DaySession[]) => void
  availableDays: string[]
}

export default function Step5Split({ weeklySplit, onChange, availableDays: _availableDays }: Step5SplitProps) {
  void _availableDays
  const [selectedDay, setSelectedDay] = useState(0)

  const currentDay = weeklySplit[selectedDay]

  const toggleRest = (index: number) => {
    const updated = [...weeklySplit]
    updated[index] = {
      ...updated[index],
      isRest: !updated[index].isRest,
      focus: updated[index].isRest ? 'Upper Body' : 'Rest',
      exercises: updated[index].isRest ? [] : updated[index].exercises,
    }
    onChange(updated)
  }

  const updateFocus = (focus: string) => {
    const updated = [...weeklySplit]
    updated[selectedDay] = { ...updated[selectedDay], focus, isRest: focus === 'Rest' }
    onChange(updated)
  }

  const addExercise = () => {
    const updated = [...weeklySplit]
    updated[selectedDay] = {
      ...updated[selectedDay],
      exercises: [...updated[selectedDay].exercises, {
        id: generateId(),
        exerciseId: '',
        name: '',
        muscleGroup: '',
        sets: 3,
        reps: '8-12',
        rest: '90s',
        rpe: 8,
        notes: '',
      }],
    }
    onChange(updated)
  }

  const updateExercise = (exId: string, updates: Partial<DaySession['exercises'][number]>) => {
    const updated = [...weeklySplit]
    updated[selectedDay] = {
      ...updated[selectedDay],
      exercises: updated[selectedDay].exercises.map(ex => ex.id === exId ? { ...ex, ...updates } : ex),
    }
    onChange(updated)
  }

  const removeExercise = (exId: string) => {
    const updated = [...weeklySplit]
    updated[selectedDay] = {
      ...updated[selectedDay],
      exercises: updated[selectedDay].exercises.filter(ex => ex.id !== exId),
    }
    onChange(updated)
  }

  const estimatedMinutes = currentDay?.exercises.length
    ? currentDay.exercises.reduce((s, ex) => s + (ex.sets * 3 * 60 + parseInt(ex.rest) * ex.sets), 0) / 60 + 10
    : 0

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-dark-primary text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Design your weekly split
        </h2>
        <p className="text-dark-secondary text-sm">
          {weeklySplit.filter(d => !d.isRest).length} training days configured
        </p>
      </div>

      {/* Week Overview */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {weeklySplit.map((day, i) => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(i)}
            className={cn(
              'relative rounded-xl p-3 text-center transition-all duration-200 border',
              selectedDay === i
                ? day.isRest
                  ? 'border-dark-border bg-[#1A1A1A]'
                  : 'border-cyan bg-[rgba(0,174,239,0.08)]'
                : day.isRest
                  ? 'border-dashed border-dark-border bg-[#0A0A0A]'
                  : 'border-dark-border bg-[#141414] hover:border-dark-subtle'
            )}
          >
            <p className={cn('text-xs font-semibold mb-1', day.isRest ? 'text-dark-muted' : 'text-dark-primary')}>
              {day.day.slice(0, 3)}
            </p>
            <p className={cn('text-[10px]', day.isRest ? 'text-dark-muted' : 'text-cyan')}>
              {day.isRest ? 'Rest' : (day.focus.length > 12 ? day.focus.slice(0, 10) + '...' : day.focus)}
            </p>
            {!day.isRest && (
              <p className="text-[9px] text-dark-muted mt-0.5">{day.exercises.length} ex</p>
            )}
            {selectedDay === i && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-cyan rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Day Detail */}
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#141414] border border-dark-border rounded-xl p-6"
        >
          {/* Day Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-dark-primary font-semibold text-lg">
                {currentDay.day} — {currentDay.isRest ? 'Rest Day' : currentDay.focus}
              </h3>
              {!currentDay.isRest && (
                <p className="text-dark-muted text-xs mt-0.5">
                  {currentDay.exercises.length} exercises{estimatedMinutes > 0 ? `, ~${Math.round(estimatedMinutes)} min estimated` : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!currentDay.isRest && (
                <select
                  value={currentDay.focus}
                  onChange={(e) => updateFocus(e.target.value)}
                  className="bg-[#1A1A1A] border border-dark-border text-dark-secondary text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan"
                >
                  {DAY_FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              )}
              <button
                onClick={() => toggleRest(selectedDay)}
                className={cn(
                  'text-xs font-semibold px-3 py-2 rounded-lg border transition-colors',
                  currentDay.isRest
                    ? 'border-cyan text-cyan hover:bg-[rgba(0,174,239,0.1)]'
                    : 'border-dark-border text-dark-muted hover:border-dark-subtle'
                )}
              >
                {currentDay.isRest ? 'Make Active' : 'Make Rest'}
              </button>
            </div>
          </div>

          {/* Exercise List */}
          {!currentDay.isRest && (
            <div className="space-y-3">
              {currentDay.exercises.length === 0 ? (
                <div className="text-center py-8 text-dark-muted text-sm">
                  <Dumbbell size={24} className="mx-auto mb-2 opacity-50" />
                  No exercises yet. Add exercises or use auto-populate.
                </div>
              ) : (
                currentDay.exercises.map((ex, idx) => (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-3 bg-[#0A0A0A] border border-dark-divider rounded-lg p-3"
                  >
                    <div className="text-dark-muted text-xs font-mono w-6 text-center">{idx + 1}</div>
                    <GripVertical size={14} className="text-dark-border flex-shrink-0" />
                    <input
                      placeholder="Exercise name"
                      value={ex.name}
                      onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                      className="flex-1 min-w-0 bg-transparent text-dark-primary text-sm placeholder-[#6B6B6B] outline-none"
                    />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-dark-muted text-[10px]">Sets</span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={ex.sets}
                          onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value) || 1 })}
                          className="w-10 bg-[#1A1A1A] border border-dark-border text-dark-primary text-xs px-1 py-1 rounded text-center outline-none focus:border-cyan"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-dark-muted text-[10px]">Reps</span>
                        <input
                          value={ex.reps}
                          onChange={(e) => updateExercise(ex.id, { reps: e.target.value })}
                          className="w-14 bg-[#1A1A1A] border border-dark-border text-dark-primary text-xs px-1 py-1 rounded text-center outline-none focus:border-cyan"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-dark-muted text-[10px]">Rest</span>
                        <select
                          value={ex.rest}
                          onChange={(e) => updateExercise(ex.id, { rest: e.target.value })}
                          className="w-16 bg-[#1A1A1A] border border-dark-border text-dark-primary text-xs px-1 py-1 rounded outline-none"
                        >
                          {['30s', '60s', '90s', '120s', '180s'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <button
                        onClick={() => removeExercise(ex.id)}
                        className="text-dark-muted hover:text-danger p-1 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Add Exercise */}
              <button
                onClick={addExercise}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-dark-border hover:border-cyan text-dark-muted hover:text-cyan text-xs font-semibold py-2.5 rounded-lg transition-colors"
              >
                <Plus size={14} /> Add Exercise
              </button>
            </div>
          )}
        </motion.div>
    </div>
  )
}
