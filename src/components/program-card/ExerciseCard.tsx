import { useState } from 'react'
import { ChevronDown, Dumbbell, Clock, Layers, StickyNote, Pencil, Check, X } from 'lucide-react'
import type { ProgramExercise } from '../../types/workout'
import { formatRestTime, formatTempo } from '../../utils/dateUtils'

const TYPE_OPTIONS = [
  'Straight Set',
  'Superset',
  'Triset',
  'Giant Set',
  'Drop Set',
  'Circuit',
  'Complex',
]

const TYPE_TO_ID: Record<string, number> = {
  'Straight Set': 1,
  'Superset': 2,
  'Triset': 3,
  'Giant Set': 4,
  'Drop Set': 5,
  'Circuit': 12,
  'Complex': 13,
}

interface Props {
  exercise: ProgramExercise
  notation: string
  index: number
  onUpdate?: (updated: ProgramExercise) => void
}

export default function ExerciseCard({ exercise, notation, index, onUpdate }: Props) {
  const [isExpanded, setIsExpanded] = useState(index === 0)
  const [isEditing, setIsEditing] = useState(false)

  // Local edit state
  const [editSets, setEditSets] = useState(exercise.sets)
  const [editReps, setEditReps] = useState(exercise.reps)
  const [editType, setEditType] = useState(exercise.set_type_name || 'Straight Set')

  // Use edited values for display
  const displaySets = isEditing ? editSets : exercise.sets
  const displayReps = isEditing ? editReps : exercise.reps
  const displayType = isEditing ? editType : (exercise.set_type_name || 'Straight Set')

  const scheme = `${displaySets}×${displayReps}`
  const estimatedVolume = displaySets * parseFloat(displayReps || '0') * 50

  const methodColors: Record<string, string> = {
    'Straight Set': 'bg-success/10 text-success border-success/30',
    'Superset': 'bg-[warning]/10 text-[warning] border-[warning]/30',
    'Triset': 'bg-danger/10 text-danger border-danger/30',
    'Circuit': 'bg-violet/10 text-violet border-violet/30',
    'Giant Set': 'bg-trainer-accent/10 text-trainer-accent border-trainer-accent/30',
    'Drop Set': 'bg-[teal]/10 text-[teal] border-[teal]/30',
    'Complex': 'bg-warning/10 text-warning border-warning/30',
  }

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...exercise,
        sets: editSets,
        reps: editReps,
        set_type_name: editType,
        set_type_id: TYPE_TO_ID[editType] || 1,
      })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditSets(exercise.sets)
    setEditReps(exercise.reps)
    setEditType(exercise.set_type_name || 'Straight Set')
    setIsEditing(false)
  }

  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        isExpanded
          ? 'pb-card-gradient border-cyan/25 shadow-[0_0_20px_rgba(0,174,239,0.06)]'
          : 'bg-az-black-card border-dark-border/30 hover:border-gray-750/50'
      }`}
    >
      {/* ── Card Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none min-h-[52px]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Notation badge */}
        <span className="text-[13px] px-2 py-0.5 rounded bg-cyan/10 text-cyan font-mono font-semibold shrink-0">
          {notation}
        </span>

        {/* Exercise name */}
        <span className="text-cyan font-semibold text-[15px] hover:brightness-125 transition-all truncate">
          {exercise.exercise_name}
        </span>

        {/* Method badge (only when not Straight Set) */}
        {displayType !== 'Straight Set' && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border shrink-0 ${methodColors[displayType] || 'bg-gray-550/10 text-gray-550 border-gray-550/30'}`}>
            {displayType}
          </span>
        )}

        {/* Equipment */}
        {exercise.equipment_primary && (
          <span className="hidden sm:inline text-[11px] text-dark-muted shrink-0">
            {exercise.equipment_primary}
          </span>
        )}

        {/* Scheme / Edit controls */}
        {isEditing ? (
          <div className="flex items-center gap-1.5 ml-auto shrink-0" onClick={(e) => e.stopPropagation()}>
            <input
              type="number"
              min={1}
              max={50}
              value={editSets}
              onChange={(e) => setEditSets(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 h-7 px-1 text-center text-[13px] font-semibold bg-az-black border border-dark-border rounded text-dark-primary focus:border-cyan outline-none tabular-nums"
            />
            <span className="text-dark-muted text-sm">×</span>
            <input
              type="text"
              value={editReps}
              onChange={(e) => setEditReps(e.target.value)}
              className="w-14 h-7 px-1 text-center text-[13px] font-semibold bg-az-black border border-dark-border rounded text-dark-primary focus:border-cyan outline-none"
            />
          </div>
        ) : (
          <span className="text-cyan font-semibold text-sm tabular-nums ml-auto shrink-0">
            {scheme}
          </span>
        )}

        {/* Edit toggle (only when expanded) */}
        {isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (isEditing) {
                handleCancel()
              } else {
                setIsEditing(true)
              }
            }}
            className="w-8 h-8 flex items-center justify-center text-dark-muted hover:text-cyan transition-colors shrink-0"
            title={isEditing ? 'Cancel edit' : 'Edit exercise'}
          >
            {isEditing ? <X size={16} /> : <Pencil size={15} />}
          </button>
        )}

        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
          className={`w-8 h-8 flex items-center justify-center text-dark-muted hover:text-cyan transition-all duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* ── Expanded Body ───────────────────────────────────────── */}
      <div
        className={`overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 overflow-x-auto">

          {/* Edit controls bar */}
          {isEditing && (
            <div className="flex items-center gap-3 mb-3 p-2.5 rounded-lg bg-cyan/5 border border-cyan/20">
              <span className="text-[11px] font-semibold text-cyan uppercase tracking-wider">Type</span>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="h-8 px-2 text-[13px] bg-az-black border border-dark-border rounded text-dark-primary focus:border-cyan outline-none cursor-pointer"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="h-8 px-3 rounded-lg text-[12px] font-medium text-dark-secondary hover:text-dark-primary hover:bg-dark-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="h-8 px-3 rounded-lg text-[12px] font-semibold bg-cyan text-white hover:bg-cyan-light transition-colors flex items-center gap-1"
                >
                  <Check size={14} />
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Set Table */}
          <table className="w-full min-w-[500px] text-[13px]">
            <thead>
              <tr className="text-left">
                {['Set', 'Prescribed', 'Tempo', 'Rest', 'RPE', 'Type'].map((h) => (
                  <th key={h} className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-dark-muted px-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: displaySets }).map((_, si) => (
                <tr
                  key={si}
                  className="transition-colors duration-300 border-b border-dark-border/20 last:border-0"
                >
                  {/* Set */}
                  <td className="py-2 px-2 text-dark-secondary tabular-nums font-mono">{si + 1}</td>

                  {/* Prescribed — auto-updates from edited sets/reps */}
                  <td className="py-2 px-2 text-dark-primary font-medium whitespace-nowrap">
                    {scheme}
                    {exercise.rpe_target && (
                      <span className="text-dark-muted font-normal ml-1">@ RPE {exercise.rpe_target}</span>
                    )}
                  </td>

                  {/* Tempo */}
                  <td className="py-2 px-2 text-dark-secondary tabular-nums">
                    {formatTempo(exercise.tempo)}
                  </td>

                  {/* Rest */}
                  <td className="py-2 px-2 text-dark-secondary tabular-nums">
                    {formatRestTime(exercise.rest_seconds)}
                  </td>

                  {/* RPE */}
                  <td className="py-2 px-2">
                    {exercise.rpe_target ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan/10 text-cyan">
                        {exercise.rpe_target}
                      </span>
                    ) : (
                      <span className="text-gray-650">—</span>
                    )}
                  </td>

                  {/* Type */}
                  <td className="py-2 px-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${methodColors[displayType] || 'bg-gray-550/10 text-gray-550 border-gray-550/30'}`}>
                      {displayType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Summary Bar ─────────────────────────────────────── */}
          <div className="mt-3 pt-3 border-t border-dark-border/30 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-1.5 text-[12px] text-dark-secondary">
              <Dumbbell size={12} className="text-dark-muted" />
              <span>{displaySets} sets</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-dark-secondary">
              <Layers size={12} className="text-dark-muted" />
              <span>{displayReps} reps</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-dark-secondary">
              <Clock size={12} className="text-dark-muted" />
              <span>{formatRestTime(exercise.rest_seconds)} rest</span>
            </div>
            {exercise.tempo && exercise.tempo !== 'Hold' && (
              <div className="text-[12px] text-dark-secondary">
                Tempo: <span className="text-dark-primary font-medium">{formatTempo(exercise.tempo)}</span>
              </div>
            )}

            {/* Estimated volume */}
            {estimatedVolume > 0 && (
              <div className="ml-auto text-[12px] text-dark-secondary">
                Est. Vol: <span className="text-cyan font-semibold">{estimatedVolume.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* ── Coach Notes ─────────────────────────────────────── */}
          {exercise.notes && (
            <div className="mt-3 p-3 rounded-lg bg-az-black-elevated border border-dark-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <StickyNote size={12} className="text-warning" />
                <span className="text-[11px] font-semibold text-warning uppercase tracking-wider">Coach Note</span>
              </div>
              <p className="text-[13px] text-gray-300 leading-relaxed">
                {exercise.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
