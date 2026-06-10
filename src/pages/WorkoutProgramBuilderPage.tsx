import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronRight, User, Users, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { useReferenceData } from '../hooks/useReferenceData'
import { usePrograms } from '../hooks/usePrograms'
import { useWorkoutBuilderStore } from '../stores/useWorkoutBuilderStore'
import CategoryGrid from '../components/program-builder/CategoryGrid'
import LevelPillGroup from '../components/program-builder/LevelPillGroup'
import ProgramMatchCard from '../components/program-builder/ProgramMatchCard'

const DAYS_OPTIONS = [2, 3, 4, 5, 6]
const SESSION_LENGTH_OPTIONS = [30, 45, 60, 75, 90]

function motionEnter<T extends Record<string, unknown>>(
  reduce: boolean | null,
  initial: T,
  transition?: import('framer-motion').Transition
): { initial: T | false; transition?: import('framer-motion').Transition } {
  if (reduce) return { initial: false }
  return { initial, transition }
}

export default function WorkoutProgramBuilderPage() {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const {
    step,
    selectedClientId,
    selectedCategoryId,
    selectedLevelId,
    selectedDaysPerWeek,
    selectedSessionLength,
    setStep,
    setSelectedClientId,
    setSelectedCategoryId,
    setSelectedLevelId,
    setSelectedDaysPerWeek,
    setSelectedSessionLength,
    reset,
  } = useWorkoutBuilderStore()

  const { data: referenceData, isLoading: refLoading } = useReferenceData()
  const { data: programs, isLoading: programsLoading } = usePrograms({
    category_id: selectedCategoryId || undefined,
    level_id: selectedLevelId || undefined,
    days_per_week: selectedDaysPerWeek || undefined,
  })

  // Auto-advance to step 3 when all filters are selected
  useEffect(() => {
    if (step === 2 && selectedCategoryId && selectedLevelId && selectedDaysPerWeek) {
      // Small delay for UX
      const timer = setTimeout(() => setStep(3), 300)
      return () => clearTimeout(timer)
    }
  }, [step, selectedCategoryId, selectedLevelId, selectedDaysPerWeek, setStep])

  const handleProgramSelect = (programId: number) => {
    navigate(`/program-builder/card/${programId}`)
  }

  return (
    <div className="min-h-[100dvh] bg-off-white dark:bg-az-black">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Program Builder
          </h1>
          <button
            onClick={reset}
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Client card (Step 1 visual) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <User size={20} className="text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {selectedClientId || 'No client selected'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a client or continue without one
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                step === 1
                  ? 'bg-[cyan] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
              )}
            >
              {step === 1 ? 'Selecting...' : 'Change'}
            </button>
          </div>
        </div>

        {/* Step 1: Client Selection */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              {...motionEnter(reduceMotion, { opacity: 0, y: 10 })}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 1: Select Client
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedClientId('demo-client-1')
                    setStep(2)
                  }}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[cyan] hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all text-left"
                >
                  <Users size={20} className="text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">Demo Client</p>
                    <p className="text-xs text-slate-500">Beginner • Lose Weight</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedClientId(null)
                    setStep(2)
                  }}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-[cyan] hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <span className="text-slate-500 text-lg">+</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-600 dark:text-slate-300">Continue without client</p>
                    <p className="text-xs text-slate-400">Browse programs freely</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Configure */}
          {step >= 2 && (
            <motion.div
              key="step2"
              {...motionEnter(reduceMotion, { opacity: 0, y: 10 })}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Category */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Step 2: Select Category
                </h2>
                {refLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-[cyan]" />
                  </div>
                ) : (
                  <CategoryGrid
                    categories={referenceData?.categories || []}
                    selectedId={selectedCategoryId}
                    onSelect={setSelectedCategoryId}
                  />
                )}
              </div>

              {/* Level */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Level
                </h2>
                {refLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={24} className="animate-spin text-[cyan]" />
                  </div>
                ) : (
                  <LevelPillGroup
                    levels={referenceData?.levels || []}
                    selectedId={selectedLevelId}
                    onSelect={setSelectedLevelId}
                  />
                )}
              </div>

              {/* Days per week + Session length */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Days/Week
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DAYS_OPTIONS.map((days) => (
                      <button
                        key={days}
                        onClick={() => setSelectedDaysPerWeek(days)}
                        className={cn(
                          'py-2.5 rounded-xl text-sm font-semibold transition-all border-2',
                          selectedDaysPerWeek === days
                            ? 'border-[cyan] bg-[cyan]/10 text-[cyan]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        )}
                      >
                        {days}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Session Length
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SESSION_LENGTH_OPTIONS.map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setSelectedSessionLength(mins)}
                        className={cn(
                          'py-2.5 rounded-xl text-sm font-semibold transition-all border-2',
                          selectedSessionLength === mins
                            ? 'border-[cyan] bg-[cyan]/10 text-[cyan]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        )}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Matching Programs */}
          {step === 3 && (
            <motion.div
              key="step3"
              {...motionEnter(reduceMotion, { opacity: 0, y: 10 })}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Step 3: Matching Programs
                </h2>
                {programsLoading && (
                  <Loader2 size={16} className="animate-spin text-[cyan]" />
                )}
              </div>

              {programs && programs.length > 0 ? (
                <div className="space-y-3">
                  {programs.slice(0, 10).map((program, idx) => (
                    <ProgramMatchCard
                      key={program.program_id}
                      program={program}
                      rank={idx + 1}
                      isTopMatch={idx === 0}
                      onClick={() => handleProgramSelect(program.program_id)}
                    />
                  ))}
                </div>
              ) : programsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-[cyan]" />
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">
                    No programs match your criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        {step === 3 && programs && programs.length > 0 && (
          <motion.div
            {...motionEnter(reduceMotion, { opacity: 0, y: 20 })}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-4 z-10"
          >
            <button
              onClick={() => handleProgramSelect(programs[0].program_id)}
              className={cn(
                'w-full py-4 rounded-2xl font-bold text-white text-lg',
                'bg-gradient-to-r from-cyan to-[indigo]',
                'hover:shadow-lg hover:shadow-sky-200/50 dark:hover:shadow-sky-900/30',
                'transition-all duration-200 flex items-center justify-center gap-2'
              )}
            >
              Generate Program Card
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
