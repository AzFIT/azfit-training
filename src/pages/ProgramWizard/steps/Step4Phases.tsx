import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2, Copy } from 'lucide-react'
import { PHASE_FOCUSES, VOLUME_OPTIONS } from '../constants'
import { generateId } from '../helpers'
import type { Phase } from '../types'

interface Step4PhasesProps {
  phases: Phase[]
  onChange: (phases: Phase[]) => void
}

export default function Step4Phases({ phases, onChange }: Step4PhasesProps) {
  const totalWeeks = phases.reduce((s, p) => s + p.durationWeeks, 0)

  const addPhase = () => {
    if (phases.length >= 6) return
    onChange([...phases, {
      id: generateId(),
      name: `Phase ${phases.length + 1}`,
      durationWeeks: 4,
      focus: 'Volume',
      intensityMin: 65,
      intensityMax: 75,
      volume: 'Moderate',
      repRange: '8-12',
    }])
  }

  const removePhase = (id: string) => {
    if (phases.length <= 1) return
    onChange(phases.filter(p => p.id !== id))
  }

  const duplicatePhase = (phase: Phase) => {
    if (phases.length >= 6) return
    onChange([...phases, { ...phase, id: generateId(), name: `${phase.name} (Copy)` }])
  }

  const updatePhase = (id: string, updates: Partial<Phase>) => {
    onChange(phases.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const colors = ['#00AEEF', '#8B5CF6', '#22C55E', '#F97316', '#EC4899', '#EAB308']

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-dark-primary text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Configure phases
        </h2>
        <p className="text-dark-secondary text-sm">{phases.length} phases — {totalWeeks} weeks total</p>
      </div>

      {/* Timeline */}
      <div className="mb-8">
        <div className="h-10 flex rounded-xl overflow-hidden">
          {phases.map((phase, i) => (
            <motion.div
              key={phase.id}
              layout
              className="flex items-center justify-center text-xs font-bold text-white relative"
              style={{
                backgroundColor: colors[i % colors.length],
                width: `${(phase.durationWeeks / totalWeeks) * 100}%`,
              }}
            >
              {phase.name}
              <span className="absolute bottom-0.5 text-[9px] font-normal opacity-75">{phase.durationWeeks}w</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {phases.map((phase, i) => (
            <motion.div
              key={phase.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
              className="bg-[#141414] border border-dark-border rounded-xl p-5 relative"
              style={{ borderLeftWidth: 4, borderLeftColor: colors[i % colors.length] }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-dark-muted text-xs mb-1">Phase Name</label>
                  <input
                    value={phase.name}
                    onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-dark-border focus:border-cyan text-dark-primary text-sm px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-dark-muted text-xs mb-1">Duration (weeks)</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={phase.durationWeeks}
                    onChange={(e) => updatePhase(phase.id, { durationWeeks: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-[#1A1A1A] border border-dark-border focus:border-cyan text-dark-primary text-sm px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-dark-muted text-xs mb-1">Focus</label>
                  <select
                    value={phase.focus}
                    onChange={(e) => updatePhase(phase.id, { focus: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-dark-border focus:border-cyan text-dark-primary text-sm px-3 py-2 rounded-lg outline-none"
                  >
                    {PHASE_FOCUSES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-dark-muted text-xs mb-1">Intensity Range (% 1RM)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={30}
                      max={100}
                      value={phase.intensityMin}
                      onChange={(e) => updatePhase(phase.id, { intensityMin: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-[#1A1A1A] border border-dark-border focus:border-cyan text-dark-primary text-sm px-2 py-2 rounded-lg outline-none text-center"
                    />
                    <span className="text-dark-muted">—</span>
                    <input
                      type="number"
                      min={30}
                      max={100}
                      value={phase.intensityMax}
                      onChange={(e) => updatePhase(phase.id, { intensityMax: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-[#1A1A1A] border border-dark-border focus:border-cyan text-dark-primary text-sm px-2 py-2 rounded-lg outline-none text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-dark-muted text-xs mb-1">Volume</label>
                  <select
                    value={phase.volume}
                    onChange={(e) => updatePhase(phase.id, { volume: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-dark-border focus:border-cyan text-dark-primary text-sm px-3 py-2 rounded-lg outline-none"
                  >
                    {VOLUME_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-dark-muted text-xs mb-1">Rep Range</label>
                  <input
                    value={phase.repRange}
                    onChange={(e) => updatePhase(phase.id, { repRange: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-dark-border focus:border-cyan text-dark-primary text-sm px-3 py-2 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dark-divider">
                <button
                  onClick={() => duplicatePhase(phase)}
                  disabled={phases.length >= 6}
                  className="text-dark-secondary hover:text-dark-primary text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-dark-hover transition-colors disabled:opacity-30"
                >
                  <Copy size={12} /> Duplicate
                </button>
                <button
                  onClick={() => removePhase(phase.id)}
                  disabled={phases.length <= 1}
                  className="text-danger hover:text-[#DC2626] text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[rgba(239,68,68,0.1)] transition-colors disabled:opacity-30"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Phase */}
      {phases.length < 6 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={addPhase}
          className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-dark-border hover:border-cyan text-dark-muted hover:text-cyan text-sm font-semibold py-3 rounded-xl transition-colors"
        >
          <Plus size={16} /> Add Phase
        </motion.button>
      )}
    </div>
  )
}
