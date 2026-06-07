import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Save, UserPlus, FileText } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { GOAL_CARDS } from '../constants'
import type { WizardState } from '../types'

interface Step8SaveProps {
  state: WizardState
  onNameChange: (name: string) => void
  onDescChange: (desc: string) => void
  onFinish: () => void
}

export default function Step8Save({ state, onNameChange, onDescChange, onFinish }: Step8SaveProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  const handleSave = () => {
    setShowSuccess(true)
    setTimeout(() => onFinish(), 2000)
  }

  const activeDays = state.weeklySplit.filter(d => !d.isRest)
  const totalWeeks = state.phases.reduce((s, p) => s + p.durationWeeks, 0)

  if (showSuccess) {
    return (
      <div className="max-w-[600px] mx-auto flex flex-col items-center justify-center py-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-cyan rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,174,239,0.4)]"
        >
          <motion.svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-dark-primary text-2xl font-semibold mb-2"
        >
          Program Created!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-dark-secondary text-sm"
        >
          Redirecting to program library...
        </motion.p>
      </div>
    )
  }

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-dark-primary text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Save &amp; Assign
        </h2>
        <p className="text-dark-secondary text-sm">Finalize your program</p>
      </div>

      {/* Program Info */}
      <div className="bg-[az-black-card] border border-dark-border rounded-xl p-5 mb-6">
        <label className="block text-dark-muted text-xs mb-2 font-semibold uppercase tracking-wider">Program Name</label>
        <input
          value={state.programName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full bg-[az-black-elevated] border border-dark-border focus:border-cyan text-dark-primary text-base px-4 py-2.5 rounded-xl outline-none mb-4 transition-colors"
        />

        <label className="block text-dark-muted text-xs mb-2 font-semibold uppercase tracking-wider">Tags</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            GOAL_CARDS.find(g => g.id === state.selectedGoal)?.label,
            state.selectedMethod?.Category,
            state.clientContext.experience || 'Intermediate',
          ].filter(Boolean).map((tag) => (
            <span key={tag} className="text-xs text-cyan bg-[rgba(0,174,239,0.1)] border border-[rgba(0,174,239,0.2)] px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <label className="block text-dark-muted text-xs mb-2 font-semibold uppercase tracking-wider">Description</label>
        <textarea
          value={state.description}
          onChange={(e) => onDescChange(e.target.value)}
          rows={3}
          className="w-full bg-[az-black-elevated] border border-dark-border focus:border-cyan text-dark-primary text-sm placeholder-[dark-muted] px-4 py-2.5 rounded-xl outline-none resize-none transition-colors"
        />
      </div>

      {/* Action Cards */}
      <div className="space-y-3">
        {/* Assign to Client */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setAssignOpen(!assignOpen)}
          className="w-full bg-[az-black-card] border border-dark-border hover:border-cyan rounded-xl p-5 flex items-center gap-4 transition-colors text-left"
        >
          <div className="w-12 h-12 bg-[rgba(0,174,239,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
            <UserPlus size={22} className="text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-dark-primary font-semibold text-sm">Assign to Client</h4>
            <p className="text-dark-muted text-xs">Assign this program to a client immediately</p>
          </div>
          <ChevronRight size={16} className={cn('text-dark-muted transition-transform', assignOpen && 'rotate-90')} />
        </motion.button>

        <AnimatePresence>
          {assignOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[az-black-elevated] border border-dark-border rounded-xl p-4 space-y-3 mx-2">
                <div>
                  <label className="block text-dark-muted text-xs mb-1">Select Client</label>
                  <input
                    placeholder="Search client..."
                    className="w-full bg-[az-black-card] border border-dark-border focus:border-cyan text-dark-primary text-sm px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-dark-muted text-xs mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-[az-black-card] border border-dark-border focus:border-cyan text-dark-primary text-sm px-3 py-2 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-dark-muted text-xs mb-1">Starting Phase</label>
                    <select className="w-full bg-[az-black-card] border border-dark-border focus:border-cyan text-dark-primary text-sm px-3 py-2 rounded-lg outline-none">
                      {state.phases.map((p, i) => <option key={p.id} value={i}>Phase {i + 1}: {p.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save to Library */}
        <motion.button
          data-save-trigger
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleSave}
          className="w-full bg-[az-black-card] border border-dark-border hover:border-success rounded-xl p-5 flex items-center gap-4 transition-colors text-left"
        >
          <div className="w-12 h-12 bg-[rgba(34,197,94,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
            <Save size={22} className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-dark-primary font-semibold text-sm">Save to Library</h4>
            <p className="text-dark-muted text-xs">Store as a template for future use</p>
          </div>
          <ChevronRight size={16} className="text-dark-muted" />
        </motion.button>

        {/* Export PDF */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => alert('PDF export coming soon!')}
          className="w-full bg-[az-black-card] border border-dark-border hover:border-orange rounded-xl p-5 flex items-center gap-4 transition-colors text-left"
        >
          <div className="w-12 h-12 bg-[rgba(249,115,22,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={22} className="text-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-dark-primary font-semibold text-sm">Export PDF</h4>
            <p className="text-dark-muted text-xs">Download a printable program sheet</p>
          </div>
          <ChevronRight size={16} className="text-dark-muted" />
        </motion.button>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-[az-black-card] border border-dark-border rounded-xl p-5">
        <h4 className="text-dark-primary font-semibold text-sm mb-3">Program Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between"><span className="text-dark-muted">Goal:</span> <span className="text-dark-secondary">{GOAL_CARDS.find(g => g.id === state.selectedGoal)?.label}</span></div>
          <div className="flex justify-between"><span className="text-dark-muted">Method:</span> <span className="text-dark-secondary">{state.selectedMethod?.Name}</span></div>
          <div className="flex justify-between"><span className="text-dark-muted">Duration:</span> <span className="text-dark-secondary">{totalWeeks} weeks</span></div>
          <div className="flex justify-between"><span className="text-dark-muted">Frequency:</span> <span className="text-dark-secondary">{activeDays.length}x/week</span></div>
          <div className="flex justify-between"><span className="text-dark-muted">Phases:</span> <span className="text-dark-secondary">{state.phases.length}</span></div>
          <div className="flex justify-between"><span className="text-dark-muted">Exercises:</span> <span className="text-dark-secondary">{activeDays.reduce((s, d) => s + d.exercises.length, 0)}</span></div>
        </div>
      </div>
    </div>
  )
}
