import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { DAYS_OF_WEEK, EXPERIENCE_LEVELS, SESSION_DURATIONS, LIMITATION_OPTIONS, EQUIPMENT_OPTIONS } from '../constants'
import type { WizardState } from '../types'

interface Step3ContextProps {
  context: WizardState['clientContext']
  onChange: (ctx: WizardState['clientContext']) => void
}

export default function Step3Context({ context, onChange }: Step3ContextProps) {
  const [hasClient, setHasClient] = useState(!!context.clientId)

  const toggleDay = (day: string) => {
    onChange({
      ...context,
      availableDays: context.availableDays.includes(day)
        ? context.availableDays.filter(d => d !== day)
        : [...context.availableDays, day],
    })
  }

  const toggleLimitation = (lim: string) => {
    onChange({
      ...context,
      limitations: context.limitations.includes(lim)
        ? context.limitations.filter(l => l !== lim)
        : [...context.limitations, lim],
    })
  }

  const toggleEquipment = (eq: string) => {
    onChange({
      ...context,
      equipment: context.equipment.includes(eq)
        ? context.equipment.filter(e => e !== eq)
        : [...context.equipment, eq],
    })
  }

  const allFields = [
    { label: 'Assign to Client', content: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasClient(!hasClient)}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors duration-200',
              hasClient ? 'bg-cyan' : 'bg-dark-border'
            )}
          >
            <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200', hasClient ? 'translate-x-[22px]' : 'translate-x-0.5')} />
          </button>
          <span className="text-dark-secondary text-sm">{hasClient ? 'Assigning to client' : 'Create as template'}</span>
        </div>
        {hasClient && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
            <input
              type="text"
              placeholder="Search client..."
              value={context.clientId}
              onChange={(e) => onChange({ ...context, clientId: e.target.value })}
              className="w-full bg-az-black-elevated border border-dark-border focus:border-cyan text-dark-primary text-sm px-4 py-2.5 rounded-xl outline-none transition-colors"
            />
          </motion.div>
        )}
      </div>
    )},
    { label: 'Training Experience', content: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {EXPERIENCE_LEVELS.map((exp) => (
          <button
            key={exp}
            onClick={() => onChange({ ...context, experience: exp })}
            className={cn(
              'text-xs font-semibold px-3 py-2.5 rounded-xl border transition-all duration-200',
              context.experience === exp
                ? 'border-cyan bg-[rgba(0,174,239,0.1)] text-cyan'
                : 'border-dark-border bg-az-black-card text-dark-secondary hover:border-dark-subtle'
            )}
          >
            {exp}
          </button>
        ))}
      </div>
    )},
    { label: 'Available Days', content: (
      <div>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={cn(
                'text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200 min-w-[72px]',
                context.availableDays.includes(day)
                  ? 'border-cyan bg-cyan text-white'
                  : 'border-dark-border bg-az-black-card text-dark-muted hover:border-dark-subtle'
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        {context.availableDays.length < 2 && (
          <p className="text-danger text-xs mt-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            Select at least 2 training days
          </p>
        )}
      </div>
    )},
    { label: 'Session Duration', content: (
      <div className="flex flex-wrap gap-2">
        {SESSION_DURATIONS.map((dur) => (
          <button
            key={dur}
            onClick={() => onChange({ ...context, sessionDuration: dur })}
            className={cn(
              'text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all duration-200',
              context.sessionDuration === dur
                ? 'border-cyan bg-[rgba(0,174,239,0.1)] text-cyan'
                : 'border-dark-border bg-az-black-card text-dark-secondary hover:border-dark-subtle'
            )}
          >
            {dur}
          </button>
        ))}
      </div>
    )},
    { label: 'Limitations / Injuries', content: (
      <div className="flex flex-wrap gap-2">
        {LIMITATION_OPTIONS.map((lim) => (
          <button
            key={lim}
            onClick={() => toggleLimitation(lim)}
            className={cn(
              'text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200',
              context.limitations.includes(lim)
                ? lim === 'None'
                  ? 'border-success bg-[rgba(34,197,94,0.1)] text-success'
                  : 'border-warning bg-[rgba(234,179,8,0.1)] text-warning'
                : 'border-dark-border bg-az-black-card text-dark-muted hover:border-dark-subtle'
            )}
          >
            {lim}
          </button>
        ))}
      </div>
    )},
    { label: 'Equipment Access', content: (
      <div className="flex flex-wrap gap-2">
        {EQUIPMENT_OPTIONS.map((eq) => (
          <button
            key={eq}
            onClick={() => toggleEquipment(eq)}
            className={cn(
              'text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200',
              context.equipment.includes(eq)
                ? 'border-cyan bg-[rgba(0,174,239,0.1)] text-cyan'
                : 'border-dark-border bg-az-black-card text-dark-muted hover:border-dark-subtle'
            )}
          >
            {eq}
          </button>
        ))}
      </div>
    )},
  ]

  return (
    <div className="max-w-[700px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-dark-primary text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Set the context
        </h2>
        <p className="text-dark-secondary text-sm">Tailor the program to your client&apos;s needs</p>
      </div>

      <div className="space-y-6">
        {allFields.map((field, i) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <label className="block text-dark-primary text-sm font-semibold mb-2">{field.label}</label>
            {field.content}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
