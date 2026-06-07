import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, UserPlus, Play, Dumbbell, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useProgramDetails } from '../hooks/usePrograms'
import ProgramCardHeader from '../components/program-card/ProgramCardHeader'
import DayCard from '../components/program-card/DayCard'
import AssignClientModal from '../components/program-card/AssignClientModal'

interface DayTabProps {
  dayNumber: number
  dayLabel?: string
  exerciseCount: number
  isActive: boolean
  onClick: () => void
}

function DayTab({ dayNumber, dayLabel, exerciseCount, isActive, onClick }: DayTabProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-shrink-0 min-w-[140px] rounded-lg border p-3 text-left transition-all ${
        isActive
          ? 'bg-[az-black-elevated] border-cyan/50 ring-1 ring-[cyan]/20'
          : 'bg-[az-black-card] border-dark-border hover:border-dark-subtle'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold ${isActive ? 'text-cyan' : 'text-dark-secondary'}`}>
          Day {dayNumber}
        </span>
      </div>
      <div className="text-dark-primary text-sm font-medium truncate">{dayLabel || `Day ${dayNumber}`}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[gray-600] text-[10px]">· {exerciseCount} exercises</span>
      </div>
    </button>
  )
}

export default function ProgramCardPage() {
  const navigate = useNavigate()
  const { programId } = useParams<{ programId: string }>()
  const id = programId ? parseInt(programId, 10) : null
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [activeDay, setActiveDay] = useState(0)

  const { data: programData, isLoading, error } = useProgramDetails(id)

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[az-black] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-cyan" />
      </div>
    )
  }

  if (error || !programData) {
    return (
      <div className="min-h-[100dvh] bg-[az-black] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-dark-secondary">
            {error ? 'Failed to load program. Please try again.' : 'Program not found.'}
          </p>
        </div>
      </div>
    )
  }

  const { program, days } = programData
  const hasMultipleDays = days.length > 1
  const currentDay = days[activeDay]

  const handleAssigned = () => {
    toast.success(`Program "${program.program_name}" assigned successfully!`)
  }

  const handleStartWorkout = () => {
    navigate(`/clients/demo-client-1/workout/${program.program_id}`)
  }

  return (
    <div className="min-h-[100dvh] bg-[az-black]">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[cyan] to-[admin-accent] flex items-center justify-center shadow-[0_4px_14px_rgba(0,174,239,0.3)]">
            <Dumbbell size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-dark-primary text-xl font-semibold truncate">{program.program_name}</h1>
            <p className="text-dark-muted text-sm">
              <span className="text-cyan">Program Card</span>
              <span className="text-dark-border mx-2">|</span>
              <span>View exercises, sets, and training parameters</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="h-9 px-4 rounded-lg border border-dark-border text-dark-secondary hover:border-cyan hover:text-cyan bg-transparent text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </div>

        {/* Program meta info */}
        <ProgramCardHeader program={program} progressPercent={0} />

        {/* Day Selector Tabs */}
        {hasMultipleDays && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[dark-border] scrollbar-track-transparent">
            {days.map((day, idx) => (
              <DayTab
                key={day.day_number}
                dayNumber={day.day_number}
                dayLabel={day.day_label}
                exerciseCount={day.exercises.length}
                isActive={activeDay === idx}
                onClick={() => setActiveDay(idx)}
              />
            ))}
          </div>
        )}

        {/* Day info banner */}
        {currentDay && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[az-black-card] border border-dark-border/50">
            <div className="flex items-center gap-2">
              <span className="text-cyan text-sm font-medium">
                Day {currentDay.day_number}: {currentDay.day_label || `Day ${currentDay.day_number}`}
              </span>
            </div>
            <div className="w-px h-4 bg-dark-border" />
            <div className="text-[10px] text-dark-secondary">
              {currentDay.exercises.length} exercises · {currentDay.exercises.reduce((s, e) => s + e.sets, 0)} sets
            </div>
          </div>
        )}

        {/* Day cards */}
        {hasMultipleDays ? (
          // Show only active day when multiple days
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DayCard
              dayNumber={currentDay.day_number}
              dayLabel={currentDay.day_label}
              exercises={currentDay.exercises}
            />
          </motion.div>
        ) : (
          // Show all days when single day or expand all
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
          >
            {days.map((day, idx) => (
              <motion.div
                key={day.day_number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <DayCard
                  dayNumber={day.day_number}
                  dayLabel={day.day_label}
                  exercises={day.exercises}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom action bar */}
        <div className="sticky bottom-4 z-10 flex gap-2">
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[cyan] to-[admin-accent] hover:shadow-lg hover:shadow-[cyan]/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <UserPlus size={18} />
            Assign to Client
          </button>
          <button
            onClick={handleStartWorkout}
            className="px-4 py-3 rounded-xl font-semibold text-cyan bg-[az-black-card] border-2 border-cyan hover:bg-cyan/10 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Play size={18} />
            <span className="hidden sm:inline">Start Workout</span>
          </button>
        </div>
      </div>

      {/* Assign modal */}
      <AssignClientModal
        program={program}
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssigned={handleAssigned}
      />
    </div>
  )
}
