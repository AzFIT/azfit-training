/**
 * ProgramWizardPage — Main container for the AzFIT Program Design Wizard
 *
 * Route: /programs/design
 *
 * Orchestrates the 8-step wizard flow:
 *   1. Goal Selection      → 2. Method Selection    → 3. Client Context
 *   4. Phase Configuration → 5. Weekly Split        → 6. Exercise Review
 *   7. Program Preview     → 8. Save & Assign
 *
 * Steps 1-4 read from useProgramStore directly.
 * Steps 5-8 receive program data as props from the store.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Settings, Users, Layers,
  CalendarDays, ListChecks, Eye,
  Save, Check, X
} from 'lucide-react';
import { useProgramStore } from '@/stores/useProgramStore';
import { Button } from '@/components/ui/button';

/* Steps 1-4 — read from store */
import GoalSelectionStep from './program-wizard/GoalSelectionStep';
import MethodSelectionStep from './program-wizard/MethodSelectionStep';
import ClientContextStep from './program-wizard/ClientContextStep';
import PhaseConfigurationStep from './program-wizard/PhaseConfigurationStep';

/* Steps 5-8 — receive props */
import WeeklySplitStep from './program-wizard/WeeklySplitStep';
import ExerciseReviewStep from './program-wizard/ExerciseReviewStep';
import ProgramPreviewStep from './program-wizard/ProgramPreviewStep';
import SaveAssignStep from './program-wizard/SaveAssignStep';

/* Types for steps 5-8 */
import type { Program, ProgramExercise } from '@/types/program';

/* ─────────────────────────────────────────────── */

interface StepMeta {
  label: string;
  icon: React.ElementType;
}

const STEP_META: StepMeta[] = [
  { label: 'Goal', icon: Target },
  { label: 'Method', icon: Settings },
  { label: 'Context', icon: Users },
  { label: 'Phases', icon: Layers },
  { label: 'Split', icon: CalendarDays },
  { label: 'Exercises', icon: ListChecks },
  { label: 'Preview', icon: Eye },
  { label: 'Save', icon: Save },
];

const STEP_TITLES = [
  'Select Goal',
  'Choose Method',
  'Client Context',
  'Configure Phases',
  'Weekly Split',
  'Exercise Review',
  'Program Preview',
  'Save & Assign',
];

const NEXT_LABELS = [
  'Next: Choose Method',
  'Next: Client Context',
  'Next: Configure Phases',
  'Next: Weekly Split',
  'Next: Exercise Review',
  'Next: Program Preview',
  'Next: Save & Assign',
  'Finish',
];

export default function ProgramWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    wizard,
    setWizardStep,
    setWizardClient,
    setWeeklySplit,
    saveWizardDraft,
    clearWizard,
    autoPopulateExercises,
    addProgram,
  } = useProgramStore();

  const currentStep = wizard.currentStep;
  const selectedGoal = wizard.selectedGoal;
  const selectedMethod = wizard.selectedMethod;
  const weeklySplit = wizard.weeklySplit;

  /* ---- Parse URL params on mount ---- */
  useEffect(() => {
    const clientId = searchParams.get('client');
    if (clientId) setWizardClient(clientId);
  }, []);

  /* ---- Build program data for steps 5-8 ---- */
  const [program, setProgram] = useState<Program>(() => {
    // Generate initial program from wizard state
    const now = new Date().toISOString();
    return {
      id: `program-${Date.now()}`,
      name: wizard.programName || 'New Program',
      description: wizard.description || '',
      tags: wizard.tags || [],
      goal: wizard.selectedGoal || 'build-muscle',
      method: wizard.selectedMethod || 'upper-lower',
      difficulty: 'intermediate',
      duration: wizard.phases.reduce((sum, p) => sum + (p.weekEnd - p.weekStart + 1), 0) || 4,
      frequency: 4,
      phases: wizard.phases,
      weeklySplit: wizard.weeklySplit,
      progressionRules: ['Progressive overload each week', 'Deload every 4th week'],
      equipmentRequired: ['Barbell', 'Dumbbells'],
      totalVolume: 120,
      estimatedTimePerSession: 60,
      timesUsed: 0,
      lastAssigned: null,
      createdAt: now,
      updatedAt: now,
    };
  });

  /* ---- Auto-populate when reaching step 5 ---- */
  useEffect(() => {
    if (currentStep === 5 && selectedGoal && selectedMethod) {
      const exercises = autoPopulateExercises(selectedMethod, selectedGoal);
      // Distribute exercises across active days
      const activeDays = weeklySplit.filter((d) => !d.isRestDay);
      if (activeDays.length > 0) {
        const perDay = Math.ceil(exercises.length / activeDays.length);
        const updatedSplit = weeklySplit.map((day) => {
          const idx = activeDays.findIndex((d) => d.dayOfWeek === day.dayOfWeek);
          if (idx >= 0) {
            const start = idx * perDay;
            return {
              ...day,
              exercises: exercises.slice(start, start + perDay),
            };
          }
          return day;
        });
        setProgram((prev) => ({ ...prev, weeklySplit: updatedSplit }));
        setWeeklySplit(updatedSplit);
      }
    }
  }, [currentStep]);

  /* ---- Step 5: Weekly Split handlers ---- */
  const handleToggleDay = useCallback((day: string) => {
    setProgram((prev) => {
      const newSplit = prev.weeklySplit.map((d) => {
        if (d.dayOfWeek === day) {
          return d.isRestDay
            ? { ...d, isRestDay: false, focus: 'Training', estimatedTime: 60, exercises: [] }
            : { ...d, isRestDay: true, focus: 'Rest Day', estimatedTime: 0, exercises: [] };
        }
        return d;
      });
      return { ...prev, weeklySplit: newSplit };
    });
  }, []);

  const handleResetSplit = useCallback(() => {
    const defaultSplit = weeklySplit.map((d) => ({
      ...d,
      isRestDay: !['Mon', 'Tue', 'Thu', 'Fri'].includes(d.dayOfWeek),
      focus: ['Mon', 'Tue', 'Thu', 'Fri'].includes(d.dayOfWeek) ? 'Upper Body' : 'Rest Day',
      estimatedTime: ['Mon', 'Tue', 'Thu', 'Fri'].includes(d.dayOfWeek) ? 60 : 0,
      exercises: [],
    }));
    setProgram((prev) => ({ ...prev, weeklySplit: defaultSplit }));
  }, []);

  /* ---- Step 6: Exercise Review handlers ---- */
  const handleUpdateExercise = useCallback(
    (dayOfWeek: string, exerciseId: string, updates: Partial<ProgramExercise>) => {
      setProgram((prev) => ({
        ...prev,
        weeklySplit: prev.weeklySplit.map((d) =>
          d.dayOfWeek === dayOfWeek
            ? { ...d, exercises: d.exercises.map((ex) => (ex.exerciseId === exerciseId ? { ...ex, ...updates } : ex)) }
            : d
        ),
      }));
    },
    []
  );

  const handleSwapExercise = useCallback(
    (dayOfWeek: string, oldExerciseId: string, newExercise: ProgramExercise) => {
      setProgram((prev) => ({
        ...prev,
        weeklySplit: prev.weeklySplit.map((d) =>
          d.dayOfWeek === dayOfWeek
            ? { ...d, exercises: d.exercises.map((ex) => (ex.exerciseId === oldExerciseId ? { ...newExercise, order: ex.order } : ex)) }
            : d
        ),
      }));
    },
    []
  );

  /* ---- Step 8: Save handlers ---- */
  const handleUpdateProgram = useCallback((updates: Partial<Program>) => {
    setProgram((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleFinish = useCallback(() => {
    addProgram(program);
    clearWizard();
    navigate('/programs/library');
  }, [program, addProgram, clearWizard, navigate]);

  /* ---- Navigation ---- */
  const goNext = useCallback(() => {
    if (currentStep < 8) setWizardStep(currentStep + 1);
    else handleFinish();
  }, [currentStep, setWizardStep, handleFinish]);

  const goBack = useCallback(() => {
    if (currentStep > 1) setWizardStep(currentStep - 1);
  }, [currentStep, setWizardStep]);

  const canGoNext = currentStep === 1 ? !!selectedGoal
    : currentStep === 2 ? !!selectedMethod
    : true;

  const progressPercent = ((currentStep - 1) / 7) * 100;

  /* ── Render ─────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* ── Header ── */}
      <div className="bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00AEEF] to-[#33BFF2] flex items-center justify-center shadow-lg shadow-[#00AEEF]/20">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Program Design Wizard</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Step {currentStep} of 8: {STEP_TITLES[currentStep - 1]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={saveWizardDraft} className="gap-2 text-xs">
                <Save className="w-3.5 h-3.5" /> Save Draft
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { clearWizard(); navigate('/programs/library'); }} className="gap-2 text-xs text-gray-500">
                <X className="w-3.5 h-3.5" /> Exit
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-[#1a1a1a] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#00AEEF] to-[#22C55E]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            {/* Step Dots */}
            <div className="flex items-center justify-between mt-3">
              {STEP_META.map((meta, idx) => {
                const stepNum = idx + 1;
                const isCompleted = currentStep > stepNum;
                const isActive = currentStep === stepNum;
                return (
                  <button
                    key={stepNum}
                    onClick={() => setWizardStep(stepNum)}
                    className="flex flex-col items-center gap-1 transition-all"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isActive
                          ? 'bg-[#00AEEF] text-white shadow-lg shadow-[#00AEEF]/25 scale-110'
                          : isCompleted
                          ? 'bg-[#22C55E] text-white'
                          : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                    </div>
                    <span
                      className={`text-[10px] font-medium hidden sm:block ${
                        isActive ? 'text-[#00AEEF]' : isCompleted ? 'text-[#22C55E]' : 'text-gray-400'
                      }`}
                    >
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ── Steps 1-4 (store-based) ── */}
          {currentStep === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <GoalSelectionStep />
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <MethodSelectionStep />
            </motion.div>
          )}
          {currentStep === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <ClientContextStep />
            </motion.div>
          )}
          {currentStep === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <PhaseConfigurationStep />
            </motion.div>
          )}

          {/* ── Steps 5-8 (prop-based) ── */}
          {currentStep === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <WeeklySplitStep
                weeklySplit={program.weeklySplit}
                onToggleDay={handleToggleDay}
                onEditDay={() => setWizardStep(6)}
                onResetSplit={handleResetSplit}
                onNext={goNext}
                onBack={goBack}
              />
            </motion.div>
          )}
          {currentStep === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <ExerciseReviewStep
                program={program}
                onUpdateExercise={handleUpdateExercise}
                onSwapExercise={handleSwapExercise}
                onNext={goNext}
                onBack={goBack}
              />
            </motion.div>
          )}
          {currentStep === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <ProgramPreviewStep program={program} onNext={goNext} onBack={goBack} />
            </motion.div>
          )}
          {currentStep === 8 && (
            <motion.div key="s8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <SaveAssignStep
                program={program}
                onUpdateProgram={handleUpdateProgram}
                onBack={goBack}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation Footer ── */}
        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={goBack} disabled={currentStep === 1} className="gap-2">
            ← Back
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep} of 8
          </span>
          <Button
            onClick={goNext}
            disabled={!canGoNext}
            className="gap-2 bg-gradient-to-r from-[#00AEEF] to-[#33BFF2] text-white hover:shadow-lg hover:shadow-[#00AEEF]/25"
          >
            {NEXT_LABELS[currentStep - 1]} →
          </Button>
        </div>
      </div>
    </div>
  );
}
