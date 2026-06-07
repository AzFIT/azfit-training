import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { STEP_NAMES } from '../constants'

interface StepIndicatorProps {
  currentStep: number
  onStepClick: (step: number) => void
}

export default function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="bg-[#141414] border-b border-dark-border px-4 md:px-8 py-5 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[600px] max-w-[900px] mx-auto">
        {STEP_NAMES.map((name, i) => {
          const stepNum = i + 1
          const completed = stepNum < currentStep
          const current = stepNum === currentStep
          const upcoming = stepNum > currentStep

          return (
            <div key={name} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => completed && onStepClick(stepNum)}
                disabled={upcoming}
                className="flex flex-col items-center gap-1.5 group"
              >
                <motion.div
                  animate={
                    current
                      ? { scale: [1, 1.05, 1], boxShadow: ['0 0 0 0 rgba(0,174,239,0.3)', '0 0 12px 3px rgba(0,174,239,0.3)', '0 0 0 0 rgba(0,174,239,0.3)'] }
                      : {}
                  }
                  transition={current ? { duration: 2, repeat: Infinity } : {}}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2',
                    completed
                      ? 'bg-cyan border-cyan text-white'
                      : current
                        ? 'bg-cyan border-cyan text-white shadow-[0_0_12px_rgba(0,174,239,0.3)]'
                        : 'bg-[#1A1A1A] border-dark-border text-dark-muted'
                  )}
                >
                  {completed ? <Check size={16} /> : stepNum}
                </motion.div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors hidden md:block',
                    completed ? 'text-cyan' : current ? 'text-dark-primary' : 'text-dark-muted'
                  )}
                >
                  {name}
                </span>
              </button>

              {/* Connector */}
              {i < STEP_NAMES.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 md:mx-4 rounded-full overflow-hidden bg-dark-border">
                  <motion.div
                    className="h-full bg-cyan"
                    initial={{ width: '0%' }}
                    animate={{ width: stepNum < currentStep ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
