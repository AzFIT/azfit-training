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
    'Straight Set': 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30',
    'Superset': 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
    'Triset': 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
    'Circuit': 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30',
    'Giant Set': 'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30',
    'Drop Set': 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30',
    'Complex': 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30',
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
          ? 'pb-card-gradient border-[#00AEEF]/25 shadow-[0_0_20px_rgba(0,174,239,0.06)]'
          : 'bg-[#141414] border-[#2A2A2A]/30 hover:border-[#374151]/50'
      }`}
    >
      {/* ── Card Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none min-h-[52px]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Notation badge */}
        <span className="text-[13px] px-2 py-0.5 rounded bg-[#00AEEF]/10 text-[#00AEEF] font-mono font-semibold shrink-0">
          {notation}
        </span>

        {/* Exercise name */}
        <span className="text-[#00AEEF] font-semibold text-[15px] hover:brightness-125 transition-all truncate">
          {exercise.exercise_name}
        </span>

        {/* Method badge (only when not Straight Set) */}
        {displayType !== 'Straight Set' && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border shrink-0 ${methodColors[displayType] || 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/30'}`}>
            {displayType}
          </span>
        )}

        {/* Equipment */}
        {exercise.equipment_primary && (
          <span className="hidden sm:inline text-[11px] text-[#6B6B6B] shrink-0">
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
              className="w-12 h-7 px-1 text-center text-[13px] font-semibold bg-[#0A0A0A] border border-[#2A2A2A] rounded text-[#F0F0F0] focus:border-[#00AEEF] outline-none tabular-nums"
            />
            <span className="text-[#6B6B6B] text-sm">×</span>
            <input
              type="text"
              value={editReps}
              onChange={(e) => setEditReps(e.target.value)}
              className="w-14 h-7 px-1 text-center text-[13px] font-semibold bg-[#0A0A0A] border border-[#2A2A2A] rounded text-[#F0F0F0] focus:border-[#00AEEF] outline-none"
            />
          </div>
        ) : (
          <span className="text-[#00AEEF] font-semibold text-sm tabular-nums ml-auto shrink-0">
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
            className="w-8 h-8 flex items-center justify-center text-[#6B6B6B] hover:text-[#00AEEF] transition-colors shrink-0"
            title={isEditing ? 'Cancel edit' : 'Edit exercise'}
          >
            {isEditing ? <X size={16} /> : <Pencil size={15} />}
          </button>
        )}

        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
          className={`w-8 h-8 flex items-center justify-center text-[#6B6B6B] hover:text-[#00AEEF] transition-all duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
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
            <div className="flex items-center gap-3 mb-3 p-2.5 rounded-lg bg-[#00AEEF]/5 border border-[#00AEEF]/20">
              <span className="text-[11px] font-semibold text-[#00AEEF] uppercase tracking-wider">Type</span>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="h-8 px-2 text-[13px] bg-[#0A0A0A] border border-[#2A2A2A] rounded text-[#F0F0F0] focus:border-[#00AEEF] outline-none cursor-pointer"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="h-8 px-3 rounded-lg text-[12px] font-medium text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#2A2A2A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="h-8 px-3 rounded-lg text-[12px] font-semibold bg-[#00AEEF] text-white hover:bg-[#33BFF2] transition-colors flex items-center gap-1"
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
                  <th key={h} className="pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] px-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: displaySets }).map((_, si) => (
                <tr
                  key={si}
                  className="transition-colors duration-300 border-b border-[#2A2A2A]/20 last:border-0"
                >
                  {/* Set */}
                  <td className="py-2 px-2 text-[#A0A0A0] tabular-nums font-mono">{si + 1}</td>

                  {/* Prescribed — auto-updates from edited sets/reps */}
                  <td className="py-2 px-2 text-[#F0F0F0] font-medium whitespace-nowrap">
                    {scheme}
                    {exercise.rpe_target && (
                      <span className="text-[#6B6B6B] font-normal ml-1">@ RPE {exercise.rpe_target}</span>
                    )}
                  </td>

                  {/* Tempo */}
                  <td className="py-2 px-2 text-[#A0A0A0] tabular-nums">
                    {formatTempo(exercise.tempo)}
                  </td>

                  {/* Rest */}
                  <td className="py-2 px-2 text-[#A0A0A0] tabular-nums">
                    {formatRestTime(exercise.rest_seconds)}
                  </td>

                  {/* RPE */}
                  <td className="py-2 px-2">
                    {exercise.rpe_target ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#00AEEF]/10 text-[#00AEEF]">
                        {exercise.rpe_target}
                      </span>
                    ) : (
                      <span className="text-[#4B5563]">—</span>
                    )}
                  </td>

                  {/* Type */}
                  <td className="py-2 px-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${methodColors[displayType] || 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/30'}`}>
                      {displayType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Summary Bar ─────────────────────────────────────── */}
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]/30 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-1.5 text-[12px] text-[#A0A0A0]">
              <Dumbbell size={12} className="text-[#6B6B6B]" />
              <span>{displaySets} sets</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#A0A0A0]">
              <Layers size={12} className="text-[#6B6B6B]" />
              <span>{displayReps} reps</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#A0A0A0]">
              <Clock size={12} className="text-[#6B6B6B]" />
              <span>{formatRestTime(exercise.rest_seconds)} rest</span>
            </div>
            {exercise.tempo && exercise.tempo !== 'Hold' && (
              <div className="text-[12px] text-[#A0A0A0]">
                Tempo: <span className="text-[#F0F0F0] font-medium">{formatTempo(exercise.tempo)}</span>
              </div>
            )}

            {/* Estimated volume */}
            {estimatedVolume > 0 && (
              <div className="ml-auto text-[12px] text-[#A0A0A0]">
                Est. Vol: <span className="text-[#00AEEF] font-semibold">{estimatedVolume.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* ── Coach Notes ─────────────────────────────────────── */}
          {exercise.notes && (
            <div className="mt-3 p-3 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]/50">
              <div className="flex items-center gap-1.5 mb-1">
                <StickyNote size={12} className="text-[#EAB308]" />
                <span className="text-[11px] font-semibold text-[#EAB308] uppercase tracking-wider">Coach Note</span>
              </div>
              <p className="text-[13px] text-[#D1D5DB] leading-relaxed">
                {exercise.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
