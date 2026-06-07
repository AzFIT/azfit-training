import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Loader2, Sparkles, Target, Calendar, Clock, Zap } from 'lucide-react'
import { cn } from '../lib/utils'
import { useReferenceData } from '../hooks/useReferenceData'
import { usePrograms } from '../hooks/usePrograms'
import type { Program } from '../types/workout'
import CategoryGrid from '../components/program-builder/CategoryGrid'
import LevelPillGroup from '../components/program-builder/LevelPillGroup'
import ProgramMatchCard from '../components/program-builder/ProgramMatchCard'

const DAYS_OPTIONS = [2, 3, 4, 5, 6]
const SESSION_LENGTH_OPTIONS = [30, 45, 60, 75, 90]

// ── Scoring Weights ────────────────────────────────────────────────
const WEIGHTS = {
  category: 0.30,    // Primary goal match
  level: 0.25,       // Experience level match
  days: 0.25,        // Days per week match
  duration: 0.20,    // Session duration match
}

interface ScoredProgram {
  program: Program
  score: number
  percentage: number
  breakdown: {
    categoryScore: number
    levelScore: number
    daysScore: number
    durationScore: number
  }
  exactDayMatch: boolean
}

function scoreProgram(program: Program, answers: {
  categoryId: number | null
  levelId: number | null
  daysPerWeek: number | null
  sessionLength: number | null
}): ScoredProgram {
  // Category score (exact match = 1, partial = 0)
  let categoryScore = 0
  if (answers.categoryId !== null) {
    categoryScore = program.category_id === answers.categoryId ? 1 : 0
  }

  // Level score (exact = 1, off by 1 = 0.5, else 0)
  let levelScore = 0
  if (answers.levelId !== null) {
    const diff = Math.abs(program.level_id - answers.levelId)
    if (diff === 0) levelScore = 1
    else if (diff === 1) levelScore = 0.5
  }

  // Days score (exact = 1, off by 1 = 0.7, off by 2 = 0.3)
  let daysScore = 0
  let exactDayMatch = false
  if (answers.daysPerWeek !== null) {
    const diff = Math.abs(program.days_per_week - answers.daysPerWeek)
    if (diff === 0) { daysScore = 1; exactDayMatch = true }
    else if (diff === 1) daysScore = 0.7
    else if (diff === 2) daysScore = 0.3
  }

  // Duration score (within 10min = 1, 20min = 0.7, 30min = 0.3)
  let durationScore = 0
  if (answers.sessionLength !== null) {
    const diff = Math.abs(program.session_duration_minutes - answers.sessionLength)
    if (diff <= 10) durationScore = 1
    else if (diff <= 20) durationScore = 0.7
    else if (diff <= 30) durationScore = 0.3
  }

  const rawScore =
    categoryScore * WEIGHTS.category +
    levelScore * WEIGHTS.level +
    daysScore * WEIGHTS.days +
    durationScore * WEIGHTS.duration

  const maxScore = WEIGHTS.category + WEIGHTS.level + WEIGHTS.days + WEIGHTS.duration
  const percentage = Math.round((rawScore / maxScore) * 100)

  return {
    program,
    score: rawScore,
    percentage,
    breakdown: { categoryScore, levelScore, daysScore, durationScore },
    exactDayMatch,
  }
}

type QuestionStep = 1 | 2 | 3 | 4 | 5

export default function SmartProgramFinderPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<QuestionStep>(1)
  const [answers, setAnswers] = useState({
    categoryId: null as number | null,
    levelId: null as number | null,
    daysPerWeek: null as number | null,
    sessionLength: null as number | null,
  })

  const { data: referenceData, isLoading: refLoading } = useReferenceData()
  // Fetch ALL programs (no filters) so we can score them all
  const { data: allPrograms, isLoading: programsLoading } = usePrograms()

  const scoredPrograms = useMemo<ScoredProgram[]>(() => {
    if (!allPrograms) return []
    const scored = allPrograms.map(p => scoreProgram(p, answers))
    // Sort: exact day matches first, then by score descending
    scored.sort((a, b) => {
      if (a.exactDayMatch && !b.exactDayMatch) return -1
      if (!a.exactDayMatch && b.exactDayMatch) return 1
      return b.score - a.score
    })
    return scored
  }, [allPrograms, answers])

  const updateAnswer = (key: keyof typeof answers, value: number | null) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    if (step < 4) {
      setStep((s) => (s + 1) as QuestionStep)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as QuestionStep)
  }

  const handleProgramSelect = (programId: number) => {
    navigate(`/program-builder/card/${programId}`)
  }

  // Summary of answers for the results screen
  const selectedCategory = referenceData?.categories.find(c => c.category_id === answers.categoryId)
  const selectedLevel = referenceData?.levels.find(l => l.level_id === answers.levelId)

  return (
    <div className="min-h-[100dvh] bg-[off-white] dark:bg-[az-black]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={24} className="text-primary" />
              Smart Program Finder
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Answer a few questions to find your perfect program
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-colors',
                s <= step ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
              )}
            />
          ))}
        </div>

        {/* Question steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <QuestionCard
              key="q1"
              question="What's your primary goal?"
              subtitle="Choose the category that best matches what you want to achieve"
            >
              {refLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : (
                <CategoryGrid
                  categories={referenceData?.categories || []}
                  selectedId={answers.categoryId}
                  onSelect={(id) => updateAnswer('categoryId', id)}
                />
              )}
            </QuestionCard>
          )}

          {step === 2 && (
            <QuestionCard
              key="q2"
              question="What's your training experience?"
              subtitle="Be honest — this helps us match the right intensity"
            >
              {refLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : (
                <LevelPillGroup
                  levels={referenceData?.levels || []}
                  selectedId={answers.levelId}
                  onSelect={(id) => updateAnswer('levelId', id)}
                />
              )}
            </QuestionCard>
          )}

          {step === 3 && (
            <QuestionCard
              key="q3"
              question="How many days can you train?"
              subtitle="Consistency matters more than volume"
            >
              <div className="grid grid-cols-3 gap-3">
                {DAYS_OPTIONS.map((days) => (
                  <button
                    key={days}
                    onClick={() => updateAnswer('daysPerWeek', days)}
                    className={cn(
                      'py-4 rounded-2xl text-lg font-bold transition-all border-2',
                      answers.daysPerWeek === days
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    )}
                  >
                    {days}
                    <span className="block text-xs font-normal mt-1">days/week</span>
                  </button>
                ))}
              </div>
            </QuestionCard>
          )}

          {step === 4 && (
            <QuestionCard
              key="q4"
              question="How long per session?"
              subtitle="Include warm-up and cool-down"
            >
              <div className="grid grid-cols-3 gap-3">
                {SESSION_LENGTH_OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      updateAnswer('sessionLength', mins)
                      setStep(5)
                    }}
                    className={cn(
                      'py-4 rounded-2xl text-lg font-bold transition-all border-2',
                      answers.sessionLength === mins
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    )}
                  >
                    {mins}
                    <span className="block text-xs font-normal mt-1">minutes</span>
                  </button>
                ))}
              </div>
            </QuestionCard>
          )}

          {step === 5 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Answer Summary */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Your Preferences
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <SummaryItem
                    icon={<Target size={14} />}
                    label="Goal"
                    value={selectedCategory?.category_name || '—'}
                  />
                  <SummaryItem
                    icon={<Zap size={14} />}
                    label="Experience"
                    value={selectedLevel?.level_name || '—'}
                  />
                  <SummaryItem
                    icon={<Calendar size={14} />}
                    label="Days/Week"
                    value={answers.daysPerWeek ? `${answers.daysPerWeek} days` : '—'}
                  />
                  <SummaryItem
                    icon={<Clock size={14} />}
                    label="Session"
                    value={answers.sessionLength ? `${answers.sessionLength} min` : '—'}
                  />
                </div>
              </div>

              <div className="text-center py-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Top Matches
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Based on your answers, here are the best programs for you
                </p>
              </div>

              {programsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-primary" />
                </div>
              ) : scoredPrograms.length > 0 ? (
                <div className="space-y-3">
                  {scoredPrograms.slice(0, 5).map((scored, idx) => {
                    const { program, percentage, exactDayMatch } = scored
                    const isTopMatch = idx === 0 && exactDayMatch
                    return (
                      <div key={program.program_id} className="relative">
                        {isTopMatch && (
                          <div className="absolute -top-2 left-4 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full z-10">
                            Best Match
                          </div>
                        )}
                        <ProgramMatchCard
                          program={program}
                          rank={idx + 1}
                          isTopMatch={isTopMatch}
                          onClick={() => handleProgramSelect(program.program_id)}
                        />
                        <div className="mt-1 px-4 flex items-center justify-between text-xs">
                          <span className={cn(
                            'font-medium',
                            percentage >= 80 ? 'text-emerald-500' :
                            percentage >= 60 ? 'text-amber-500' : 'text-slate-400'
                          )}>
                            {percentage}% match
                          </span>
                          <div className="flex-1 mx-3 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                percentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                                percentage >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                                'bg-gradient-to-r from-slate-400 to-slate-500'
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">
                    No programs match your criteria. Try different answers.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function QuestionCard({
  question,
  subtitle,
  children,
}: {
  question: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{question}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  )
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-primary">{icon}</span>
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="font-medium text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  )
}
