import { ArrowLeft, Share2, Clock, Calendar, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Program } from '../../types/workout'
import { formatDuration, formatDaysPerWeek } from '../../utils/dateUtils'

interface ProgramCardHeaderProps {
  program: Program
  clientName?: string
  progressPercent?: number
}

export default function ProgramCardHeader({ program, clientName, progressPercent = 0 }: ProgramCardHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      {/* Top row: back button + title + share */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-[#141414] border border-[#2A2A2A]/50 text-[#A0A0A0] hover:text-[#00AEEF] hover:border-[#00AEEF]/30 transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-[#F0F0F0] text-xl font-semibold truncate">
            {program.program_name}
          </h1>
        </div>

        <button className="p-2.5 rounded-xl bg-[#141414] border border-[#2A2A2A]/50 text-[#A0A0A0] hover:text-[#00AEEF] hover:border-[#00AEEF]/30 transition-all">
          <Share2 size={18} />
        </button>
      </div>

      {/* Meta info bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 rounded-lg bg-[#141414] border border-[#2A2A2A]/30">
        {clientName && (
          <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
            <span className="text-[#F0F0F0] font-medium">{clientName}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
          <Calendar size={12} className="text-[#6B6B6B]" />
          <span>{formatDuration(program.duration_weeks)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
          <Clock size={12} className="text-[#6B6B6B]" />
          <span>{formatDaysPerWeek(program.days_per_week)}</span>
        </div>
        {program.training_split && (
          <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
            <BarChart3 size={12} className="text-[#6B6B6B]" />
            <span className="text-[#F0F0F0] font-medium">{program.training_split}</span>
          </div>
        )}
        {program.periodization_phase && (
          <div className="text-xs text-[#A0A0A0]">
            <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30">
              {program.periodization_phase}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {progressPercent > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B6B6B]">Progress</span>
            <span className="font-semibold text-[#00AEEF]">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00AEEF] to-[#A855F7] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
