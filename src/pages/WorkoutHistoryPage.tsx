import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, Dumbbell, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { useAppDataStore } from '../stores/useAppDataStore'
import {
  getSessionsByClient,
  getSessionVolume,
  getSessionCompletedSets,
  getSessionTotalSets,
  formatDate,
  formatDuration,
} from '../lib/workoutAnalytics'

export default function WorkoutHistoryPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { workoutSessions, clients } = useAppDataStore()
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const client = clientId ? clients[clientId] : null
  const sessions = clientId ? getSessionsByClient(workoutSessions, clientId) : []

  const filtered = sessions.filter((s) =>
    (s.programName || '').toLowerCase().includes(search.toLowerCase()) ||
    s.exercises.some((e) => (e.exerciseName || '').toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={() => navigate(`/clients/${clientId}`)}
            className="flex items-center gap-1 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors w-fit"
          >
            <ChevronLeft size={16} /> Back to Profile
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#F0F0F0]">Workout History</h1>
            <p className="text-sm text-[#6B6B6B]">
              {client?.name || 'Client'} • {sessions.length} session{sessions.length !== 1 ? 's' : ''} logged
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#141414] border border-[#2A2A2A] rounded-xl px-4 py-2.5">
          <Search size={16} className="text-[#6B6B6B]" />
          <input
            type="text"
            placeholder="Search by program or exercise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#F0F0F0] placeholder-[#6B6B6B] outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#6B6B6B] hover:text-[#F0F0F0]">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Sessions" value={sessions.length} icon={Calendar} />
          <StatCard
            label="Total Volume"
            value={`${Math.round(sessions.reduce((a, s) => a + getSessionVolume(s), 0) / 1000)}k kg`}
            icon={Dumbbell}
          />
          <StatCard
            label="Total Time"
            value={formatDuration(sessions.reduce((a, s) => a + (s.durationSeconds || 0), 0))}
            icon={Clock}
          />
          <StatCard
            label="Avg Volume"
            value={`${Math.round(
              (sessions.length > 0
                ? sessions.reduce((a, s) => a + getSessionVolume(s), 0) / sessions.length
                : 0) / 1000
            )}k kg`}
            icon={Dumbbell}
          />
        </div>

        {/* Sessions list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#2A2A2A] rounded-xl">
              <Dumbbell size={40} className="mx-auto text-[#6B6B6B] mb-3" />
              <p className="text-[#A0A0A0]">No workouts found.</p>
              <p className="text-xs text-[#6B6B6B] mt-1">
                {search ? 'Try a different search term' : 'Complete a workout to see it here'}
              </p>
            </div>
          ) : (
            filtered.map((s, i) => {
              const isExpanded = expandedId === s.id
              const completedSets = getSessionCompletedSets(s)
              const totalSets = getSessionTotalSets(s)
              const volume = getSessionVolume(s)

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    className="w-full p-4 flex items-center gap-4 text-left"
                  >
                    <div className="flex-shrink-0 w-14 text-center">
                      <p className="text-lg font-bold text-[#F0F0F0]">
                        {new Date(s.date).getDate().toString().padStart(2, '0')}
                      </p>
                      <p className="text-xs text-[#6B6B6B] uppercase">
                        {new Date(s.date).toLocaleString('en-GB', { month: 'short' })}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-[#2A2A2A]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#F0F0F0] truncate">{s.programName || 'Workout'}</p>
                      <p className="text-xs text-[#6B6B6B]">
                        Day {s.dayNumber} • Week {s.weekNumber} • {completedSets}/{totalSets} sets •{' '}
                        {formatDuration(s.durationSeconds || 0)}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-mono font-semibold text-[#00AEEF]">{volume.toLocaleString()} kg</p>
                      <p className="text-xs text-[#6B6B6B]">volume</p>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-[#6B6B6B] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[#2A2A2A]">
                      <p className="text-xs text-[#6B6B6B] mt-3 mb-2">{formatDate(s.date)}</p>
                      {s.notes && (
                        <div className="mb-3 p-2 bg-[#1A1A1A] rounded-lg text-sm text-[#A0A0A0]">
                          {s.notes}
                        </div>
                      )}
                      <div className="space-y-3">
                        {s.exercises.map((ex) => (
                          <div key={ex.exerciseId} className="bg-[#1A1A1A] rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-[#F0F0F0]">
                                <span className="text-[#00AEEF] mr-1">{ex.notation}</span>
                                {ex.exerciseName}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {ex.sets.map((set) => (
                                <div
                                  key={set.setNumber}
                                  className={`text-xs px-2 py-1 rounded-md border ${
                                    set.completed
                                      ? 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)] text-[#22C55E]'
                                      : 'bg-[#141414] border-[#2A2A2A] text-[#6B6B6B]'
                                  }`}
                                >
                                  {set.completed && set.actualLoad !== undefined && set.actualReps !== undefined
                                    ? `${set.actualLoad}kg × ${set.actualReps}`
                                    : `Set ${set.setNumber}`}
                                  {set.actualRpe ? ` @ RPE${set.actualRpe}` : ''}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: React.ElementType
}) {
  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-[#00AEEF]" />
        <span className="text-xs text-[#6B6B6B]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#F0F0F0] font-mono">{value}</p>
    </div>
  )
}
