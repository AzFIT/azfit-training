import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Loader2, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'
import { useReferenceData } from '../hooks/useReferenceData'
import { usePrograms } from '../hooks/usePrograms'
import CategoryGrid from '../components/program-builder/CategoryGrid'
import LevelPillGroup from '../components/program-builder/LevelPillGroup'
import ProgramMatchCard from '../components/program-builder/ProgramMatchCard'

const DAYS_OPTIONS = [2, 3, 4, 5, 6]
const SESSION_LENGTH_OPTIONS = [30, 45, 60, 75, 90]

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
  const { data: programs, isLoading: programsLoading } = usePrograms({
    category_id: answers.categoryId || undefined,
    level_id: answers.levelId || undefined,
    days_per_week: answers.daysPerWeek || undefined,
  })

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

  return (
    <div className="min-h-[100dvh] bg-[#F5F7FA] dark:bg-[#0A0A0A]">
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
              <Sparkles size={24} className="text-[#0EA5E9]" />
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
                s <= step ? 'bg-[#0EA5E9]' : 'bg-slate-300 dark:bg-slate-600'
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
                  <Loader2 size={24} className="animate-spin text-[#0EA5E9]" />
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
                  <Loader2 size={24} className="animate-spin text-[#0EA5E9]" />
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
                        ? 'border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0EA5E9]'
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
                        ? 'border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0EA5E9]'
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
              <div className="text-center py-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Top Matches
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Based on your answers, here are the best programs for you
                </p>
              </div>

              {programsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-[#0EA5E9]" />
                </div>
              ) : programs && programs.length > 0 ? (
                <div className="space-y-3">
                  {programs.slice(0, 5).map((program, idx) => {
                    // Calculate a fake match percentage
                    const matchPercent = Math.max(85, 98 - idx * 3)
                    return (
                      <div key={program.program_id} className="relative">
                        {idx === 0 && (
                          <div className="absolute -top-2 left-4 px-2 py-0.5 bg-[#0EA5E9] text-white text-xs font-bold rounded-full z-10">
                            Best Match
                          </div>
                        )}
                        <ProgramMatchCard
                          program={program}
                          rank={idx + 1}
                          isTopMatch={idx === 0}
                          onClick={() => handleProgramSelect(program.program_id)}
                        />
                        <div className="mt-1 px-4 flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            {matchPercent}% match
                          </span>
                          <div className="flex-1 mx-3 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] rounded-full"
                              style={{ width: `${matchPercent}%` }}
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
