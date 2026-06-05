
import type { ProgramExercise } from '../../types/workout'
import { formatRestTime, formatTempo } from '../../utils/dateUtils'

interface ExerciseDetailPanelProps {
  exercise: ProgramExercise
}

export default function ExerciseDetailPanel({ exercise }: ExerciseDetailPanelProps) {
  return (
    <div className="px-4 pb-4 bg-slate-50/50 dark:bg-slate-700/20">
      {/* Set table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 pr-3 font-medium">Set</th>
              <th className="text-left py-2 pr-3 font-medium">Prescribed</th>
              <th className="text-left py-2 pr-3 font-medium hidden sm:table-cell">Tempo</th>
              <th className="text-left py-2 pr-3 font-medium hidden sm:table-cell">Rest</th>
              <th className="text-left py-2 pr-3 font-medium hidden md:table-cell">RPE</th>
              <th className="text-left py-2 font-medium hidden lg:table-cell">Type</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: exercise.sets }).map((_, setIdx) => (
              <tr
                key={setIdx}
                className="border-b border-slate-100 dark:border-slate-700/50 last:border-0"
              >
                <td className="py-2 pr-3 font-medium text-slate-700 dark:text-slate-300">
                  {setIdx + 1}
                </td>
                <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">
                  {exercise.sets}×{exercise.reps}
                </td>
                <td className="py-2 pr-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                  {formatTempo(exercise.tempo)}
                </td>
                <td className="py-2 pr-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                  {formatRestTime(exercise.rest_seconds)}
                </td>
                <td className="py-2 pr-3 hidden md:table-cell">
                  {exercise.rpe_target ? (
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium">
                      {exercise.rpe_target}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="py-2 hidden lg:table-cell">
                  {exercise.set_type_name ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                      {exercise.set_type_name}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {exercise.notes && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Coach note:</span> {exercise.notes}
          </p>
        </div>
      )}
    </div>
  )
}
