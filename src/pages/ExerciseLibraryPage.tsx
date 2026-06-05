import { useState, useEffect } from 'react'

import { motion } from 'framer-motion'
import { Search, Loader2, Dumbbell, Filter } from 'lucide-react'
import { cn } from '../lib/utils'
import { useExercises } from '../hooks/useExercises'
import type { Exercise } from '../types/workout'

export default function ExerciseLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: exercises, isLoading } = useExercises(debouncedQuery)

  return (
    <div className="min-h-[100dvh] bg-[#F5F7FA] dark:bg-[#0A0A0A]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Exercise Library
        </h1>

        {/* Search bar */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700',
              'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100',
              'placeholder:text-slate-400',
              'focus:outline-none focus:border-[#0EA5E9] transition-colors'
            )}
          />
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[#0EA5E9]" />
          </div>
        ) : exercises && exercises.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {exercises.map((exercise, idx) => (
              <motion.div
                key={exercise.exercise_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <ExerciseListCard exercise={exercise} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Dumbbell size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? 'No exercises found. Try a different search.' : 'Start typing to search exercises.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ExerciseListCard({ exercise }: { exercise: Exercise }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
        <Dumbbell size={18} className="text-sky-600 dark:text-sky-400" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
          {exercise.exercise_name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {exercise.equipment_primary && <span>{exercise.equipment_primary}</span>}
          {exercise.movement_pattern && (
            <>
              <span>•</span>
              <span>{exercise.movement_pattern}</span>
            </>
          )}
          {exercise.exercise_type && (
            <>
              <span>•</span>
              <span>{exercise.exercise_type}</span>
            </>
          )}
        </div>
      </div>

      <Filter size={14} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
    </div>
  )
}
