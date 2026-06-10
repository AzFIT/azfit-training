import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDataStore } from '../../stores/useAppDataStore'
import type { Program } from '../../types/entities'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Save,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import StepIndicator from './components/StepIndicator'
import Step1Goal from './steps/Step1Goal'
import Step2Method from './steps/Step2Method'
import Step3Context from './steps/Step3Context'
import Step4Phases from './steps/Step4Phases'
import Step5Split from './steps/Step5Split'
import Step6Review from './steps/Step6Review'
import Step7Preview from './steps/Step7Preview'
import Step8Save from './steps/Step8Save'
import { getDefaultPhases, getDefaultWeeklySplit, autoPopulateExercises } from './helpers'
import type { TrainingMethod, Exercise, Phase, DaySession, WizardState } from './types'

const DRAFT_KEY = 'azfit_wizard_draft'

export default function ProgramWizardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clientParam = searchParams.get('client')

  const [currentStep, setCurrentStep] = useState(1)
  const [showDraftDialog, setShowDraftDialog] = useState(false)
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false)

  // Data
  const [methods, setMethods] = useState<TrainingMethod[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Wizard state
  const [selectedGoal, setSelectedGoal] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<TrainingMethod | null>(null)
  const [clientContext, setClientContext] = useState<WizardState['clientContext']>({
    clientId: clientParam || '',
    experience: 'Intermediate',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    sessionDuration: '60 min',
    limitations: [],
    equipment: ['Full Gym'],
  })
  const [phases, setPhases] = useState<Phase[]>([])
  const [weeklySplit, setWeeklySplit] = useState<DaySession[]>([])
  const [programName, setProgramName] = useState('')
  const [description, setDescription] = useState('')

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch('/training_methods.json').then(r => r.json()).catch(() => []),
      fetch('/exercises_db.json').then(r => r.json()).catch(() => []),
    ]).then(([mData, eData]) => {
      setMethods(Array.isArray(mData) ? mData : [])
      setExercises(Array.isArray(eData) ? eData : [])
      setDataLoaded(true)
    })
  }, [])

  // Check for draft on mount
  useEffect(() => {
    const draftRaw = localStorage.getItem(DRAFT_KEY)
    if (draftRaw) {
      try {
        const draft = JSON.parse(draftRaw)
        if (draft.selectedGoal || draft.selectedMethod) {
          setShowDraftDialog(true)
        }
      } catch { /* ignore */ }
    }
  }, [])

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const draft: Partial<WizardState> = {
        currentStep,
        selectedGoal,
        selectedMethod,
        clientContext,
        phases,
        weeklySplit,
        programName,
        description,
        tags: [],
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      setAutoSaveIndicator(true)
      setTimeout(() => setAutoSaveIndicator(false), 2000)
    }, 30000)
    return () => clearInterval(interval)
  }, [currentStep, selectedGoal, selectedMethod, clientContext, phases, weeklySplit, programName, description])

  // Auto-populate when entering step 5
  useEffect(() => {
    if (currentStep === 5 && weeklySplit.length > 0 && exercises.length > 0) {
      const updated = weeklySplit.map(day => {
        if (day.isRest || day.exercises.length > 0) return day
        const autoExercises = autoPopulateExercises(day.focus, exercises, clientContext.equipment, 6)
        return { ...day, exercises: autoExercises }
      })
      setWeeklySplit(updated)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  // Auto-generate program name
  useEffect(() => {
    if (selectedGoal && selectedMethod && !programName) {
      const goalLabel = (() => {
        const map: Record<string, string> = {
          muscle: 'Muscle Gain',
          'fat-loss': 'Fat Loss',
          strength: 'Strength',
          endurance: 'Endurance',
          rehab: 'Rehabilitation',
          general: 'General Fitness',
        }
        return map[selectedGoal] || selectedGoal
      })()
      setProgramName(`${goalLabel} — ${selectedMethod.Name}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGoal, selectedMethod])

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal)
    setPhases(getDefaultPhases(goal))
  }

  const handleMethodSelect = (method: TrainingMethod) => {
    setSelectedMethod(method)
  }

  const handleContinue = () => {
    if (currentStep === 1 && selectedGoal) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedMethod) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Generate split when moving to step 5
      if (selectedMethod && weeklySplit.length === 0) {
        const split = getDefaultWeeklySplit(selectedGoal, selectedMethod, clientContext.availableDays)
        setWeeklySplit(split)
      }
      setCurrentStep(4)
    } else if (currentStep === 4) {
      setCurrentStep(5)
    } else if (currentStep === 5) {
      setCurrentStep(6)
    } else if (currentStep === 6) {
      setCurrentStep(7)
    } else if (currentStep === 7) {
      setCurrentStep(8)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleStepClick = (step: number) => {
    if (step < currentStep) setCurrentStep(step)
  }

  const handleSaveDraft = () => {
    const draft: Partial<WizardState> = {
      currentStep,
      selectedGoal,
      selectedMethod,
      clientContext,
      phases,
      weeklySplit,
      programName,
      description,
      tags: [],
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    setAutoSaveIndicator(true)
    setTimeout(() => setAutoSaveIndicator(false), 2000)
  }

  const handleLoadDraft = () => {
    const draftRaw = localStorage.getItem(DRAFT_KEY)
    if (draftRaw) {
      try {
        const draft = JSON.parse(draftRaw)
        if (draft.currentStep) setCurrentStep(draft.currentStep)
        if (draft.selectedGoal) setSelectedGoal(draft.selectedGoal)
        if (draft.selectedMethod) setSelectedMethod(draft.selectedMethod)
        if (draft.clientContext) setClientContext(draft.clientContext)
        if (draft.phases) setPhases(draft.phases)
        if (draft.weeklySplit) setWeeklySplit(draft.weeklySplit)
        if (draft.programName) setProgramName(draft.programName)
        if (draft.description) setDescription(draft.description)
      } catch { /* ignore */ }
    }
    setShowDraftDialog(false)
  }

  const { addProgram } = useAppDataStore()

  const handleFinish = () => {
    // Build program from wizard state and save to central store
    const now = new Date().toISOString()
    const totalWeeks = phases.reduce((s, p) => s + p.durationWeeks, 0)
    const activeDays = weeklySplit.filter(d => !d.isRest).length
    const methodName = typeof selectedMethod === 'string' ? selectedMethod : selectedMethod?.Name || 'Custom'
    const experience = clientContext.experience || 'intermediate'

    const newProgram: Program = {
      id: `prog-${Date.now()}`,
      name: programName.trim() || 'Untitled Program',
      description: description.trim() || `${methodName} program for ${selectedGoal}`,
      tags: [selectedGoal, methodName, experience].filter(Boolean),
      goal: selectedGoal,
      difficulty: experience as Program['difficulty'] || 'intermediate',
      durationWeeks: totalWeeks || 4,
      daysPerWeek: activeDays || 3,
      sessionDurationMinutes: Number(clientContext.sessionDuration) || 60,
      trainingSplit: weeklySplit.filter(d => !d.isRest).map(d => d.day).join('/') || 'Full Body',
      periodizationPhase: phases[0]?.name || 'Base',
      categoryId: 1,
      levelId: experience === 'beginner' ? 1 : experience === 'intermediate' ? 2 : experience === 'advanced' ? 3 : 2,
      difficultyRating: experience === 'beginner' ? 3 : experience === 'intermediate' ? 6 : experience === 'advanced' ? 9 : 6,
      totalWorkouts: totalWeeks * activeDays,
      totalExercises: 0,
      targetAudience: clientContext.limitations.join(', ') || 'General fitness',
      expectedOutcomes: selectedGoal || 'Improved fitness',
      categoryName: selectedGoal,
      levelName: experience || 'Intermediate',
      isActive: true,
      isPublic: true,
      authorName: 'Coach',
      timesUsed: 0,
      lastAssigned: null,
      createdAt: now,
      updatedAt: now,
    }

    addProgram(newProgram)
    localStorage.removeItem(DRAFT_KEY)
    navigate('/programs')
  }

  // Validation per step
  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 1: return !!selectedGoal
      case 2: return !!selectedMethod
      case 3: return clientContext.availableDays.length >= 2
      case 4: return phases.length > 0
      case 5: return weeklySplit.some(d => !d.isRest)
      case 6: return true
      case 7: return !!programName.trim()
      case 8: return true
      default: return false
    }
  }, [currentStep, selectedGoal, selectedMethod, clientContext, phases, weeklySplit, programName])

  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1440px] mx-auto -mt-6 -mx-4 sm:-mx-6 lg:-mx-8"
    >
      {/* Draft Dialog */}
      <AnimatePresence>
        {showDraftDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]"
              onClick={() => setShowDraftDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/3 md:left-1/2 md:-translate-x-1/2 md:w-[400px] bg-az-black-card border border-dark-border rounded-2xl z-[201] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
            >
              <h3 className="text-dark-primary font-semibold text-lg mb-2">Resume Draft?</h3>
              <p className="text-dark-secondary text-sm mb-6">A saved draft was found. Would you like to resume where you left off?</p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => { setShowDraftDialog(false); localStorage.removeItem(DRAFT_KEY) }}
                  className="text-dark-secondary hover:text-dark-primary text-sm px-4 py-2 rounded-lg hover:bg-dark-hover transition-colors"
                >
                  Start Fresh
                </button>
                <button
                  onClick={handleLoadDraft}
                  className="bg-cyan hover:bg-cyan-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Resume Draft
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} onStepClick={handleStepClick} />

      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-dark-divider">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="text-dark-secondary hover:text-dark-primary disabled:opacity-30 disabled:cursor-not-allowed text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <button
            onClick={handleSaveDraft}
            className="text-dark-secondary hover:text-cyan text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <Save size={12} /> Save Draft
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-dark-muted text-xs">Step {currentStep} of 8</span>
          {autoSaveIndicator && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-success text-xs"
            >
              Auto-saved
            </motion.span>
          )}
        </div>
        <button
          onClick={() => navigate('/programs')}
          className="text-dark-secondary hover:text-danger text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors"
        >
          <X size={12} /> Exit
        </button>
      </div>

      {/* Step Content */}
      <div className="px-4 md:px-8 py-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {currentStep === 1 && (
              <Step1Goal selectedGoal={selectedGoal} onSelect={handleGoalSelect} />
            )}
            {currentStep === 2 && (
              <Step2Method
                methods={methods}
                selectedGoal={selectedGoal}
                selectedMethod={selectedMethod}
                onSelect={handleMethodSelect}
              />
            )}
            {currentStep === 3 && (
              <Step3Context context={clientContext} onChange={setClientContext} />
            )}
            {currentStep === 4 && (
              <Step4Phases phases={phases} onChange={setPhases} />
            )}
            {currentStep === 5 && (
              <Step5Split
                weeklySplit={weeklySplit}
                onChange={setWeeklySplit}
                availableDays={clientContext.availableDays}
              />
            )}
            {currentStep === 6 && (
              <Step6Review
                weeklySplit={weeklySplit}
                exercises={exercises}
                onChange={setWeeklySplit}
              />
            )}
            {currentStep === 7 && (
              <Step7Preview
                state={{
                  currentStep,
                  selectedGoal,
                  selectedMethod,
                  clientContext,
                  phases,
                  weeklySplit,
                  programName,
                  description,
                  tags: [],
                }}
                onNameChange={setProgramName}
                onDescChange={setDescription}
              />
            )}
            {currentStep === 8 && (
              <Step8Save
                state={{
                  currentStep,
                  selectedGoal,
                  selectedMethod,
                  clientContext,
                  phases,
                  weeklySplit,
                  programName,
                  description,
                  tags: [],
                }}
                onNameChange={setProgramName}
                onDescChange={setDescription}
                onFinish={handleFinish}
              />
            )}
          </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-az-black-card/95 backdrop-blur-sm border-t border-dark-border px-4 md:px-8 py-4 z-10">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="text-dark-secondary hover:text-dark-primary disabled:opacity-30 disabled:cursor-not-allowed text-sm flex items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-dark-hover transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleSaveDraft}
              className="hidden sm:flex text-cyan hover:text-cyan-hover text-sm items-center gap-1.5 px-4 py-2.5 rounded-xl border border-cyan hover:bg-[rgba(0,174,239,0.1)] transition-colors"
            >
              <Save size={14} /> Save Draft
            </button>
          </div>

          <span className="text-dark-muted text-xs hidden sm:block">
            Step {currentStep} of 8
          </span>

          {currentStep < 8 ? (
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={cn(
                'bg-cyan text-white font-semibold text-sm flex items-center gap-1.5 px-6 py-2.5 rounded-xl transition-all duration-200',
                canContinue
                  ? 'hover:bg-cyan-hover hover:scale-[1.02] shadow-[0_4px_16px_rgba(0,174,239,0.3)]'
                  : 'opacity-40 cursor-not-allowed'
              )}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                // Trigger save from Step8Save
                const saveBtn = document.querySelector('[data-save-trigger]') as HTMLButtonElement
                saveBtn?.click()
              }}
              className="bg-gradient-to-r from-cyan to-[violet] text-white font-semibold text-sm flex items-center gap-1.5 px-6 py-2.5 rounded-xl hover:scale-[1.02] transition-all duration-200 shadow-[0_4px_20px_rgba(0,174,239,0.3)]"
            >
              <Check size={16} /> Finish &amp; Save
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
