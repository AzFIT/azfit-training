import { useState } from 'react'
import { ChevronDown, ChevronUp, User, Calendar, Target, Dumbbell, Clock } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import type { ClientContext } from '../../../types/program-builder-v2'

interface ClientContextCardProps {
  context: ClientContext
  clients: Array<{ id: string; name: string }>
  onChange: (ctx: Partial<ClientContext>) => void
  className?: string
}

const GOAL_OPTIONS = [
  { value: 'lose-fat', label: 'Lose Fat' },
  { value: 'build-muscle', label: 'Build Muscle' },
  { value: 'strength', label: 'Strength' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'rehab', label: 'Rehab / Prehab' },
]

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DURATION_OPTIONS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
  { value: '75', label: '75 min' },
  { value: '90', label: '90 min' },
]

export function ClientContextCard({ context, clients, onChange, className }: ClientContextCardProps) {
  const [isOpen, setIsOpen] = useState(true)

  const selectedClient = clients.find((c) => c.id === context.clientId)

  return (
    <div className={cn('rounded-xl border bg-card overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <User size={16} className="text-primary" />
          <span className="text-sm font-semibold text-light-primary">Client Context</span>
          {selectedClient && (
            <span className="text-xs text-muted-foreground">— {selectedClient.name}</span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Select */}
            <div className="space-y-1.5">
              <Label className="text-xs">Client</Label>
              <Select
                value={context.clientId || '_none'}
                onValueChange={(v) => {
                  const client = clients.find((c) => c.id === v)
                  onChange({
                    clientId: v === '_none' ? null : v,
                    clientName: client?.name || '',
                  })
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none" className="text-sm">No client (template only)</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-sm">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Calendar size={12} />
                Start Date
              </Label>
              <Input
                type="date"
                value={context.startDate}
                onChange={(e) => onChange({ startDate: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            {/* Goal */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Target size={12} />
                Goal
              </Label>
              <Select
                value={context.goal}
                onValueChange={(v) => onChange({ goal: v })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Dumbbell size={12} />
                Experience
              </Label>
              <Select
                value={context.experience}
                onValueChange={(v) => onChange({ experience: v })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Available Days */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((day) => {
                  const isSelected = context.availableDays.includes(day)
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = isSelected
                          ? context.availableDays.filter((d) => d !== day)
                          : [...context.availableDays, day]
                        onChange({ availableDays: newDays })
                      }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                      )}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Session Duration */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Clock size={12} />
                Session Duration
              </Label>
              <Select
                value={String(context.sessionDuration)}
                onValueChange={(v) => onChange({ sessionDuration: Number(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
