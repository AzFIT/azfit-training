import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Star, Trophy, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import type { ProgressPhoto } from './types'
import { fmtDate } from './utils'
import ToggleRowInline from './ToggleRowInline'

export default function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onUpdate,
}: {
  photo: ProgressPhoto
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  onUpdate: (id: string, updates: Partial<ProgressPhoto>) => void
}) {
  const [trainerNotes, setTrainerNotes] = useState(photo.trainerNotes || '')
  const [isMilestone, setIsMilestone] = useState(photo.isMilestone || false)
  const [isGoalAchieved, setIsGoalAchieved] = useState(photo.isGoalAchieved || false)

  const handleSave = () => {
    onUpdate(photo.id, { trainerNotes, isMilestone, isGoalAchieved })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-az-black border-dark-border text-dark-primary max-w-5xl max-h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Image Area */}
          <div className="flex-1 bg-az-black flex items-center justify-center relative min-h-[300px] lg:min-h-0">
            <img src={photo.url} alt="" className="max-w-full max-h-[60vh] lg:max-h-[85vh] object-contain" />

            {/* Nav buttons */}
            {hasPrev && (
              <button
                onClick={onPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
            >
              <X size={16} />
            </button>
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-[300px] border-t lg:border-t-0 lg:border-l border-dark-border bg-az-black-card p-5 overflow-y-auto max-h-[40vh] lg:max-h-[85vh]">
            <div className="space-y-4">
              <div>
                <p className="text-dark-muted text-xs mb-1">Date</p>
                <p className="text-dark-primary font-semibold text-base">{fmtDate(photo.date)}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-glow text-cyan">
                  {photo.category}
                </span>
                {isMilestone && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(234,179,8,0.15)] text-warning">
                    Milestone
                  </span>
                )}
                {isGoalAchieved && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(34,197,94,0.15)] text-success">
                    Goal Achieved
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-az-black-elevated rounded-lg p-3">
                  <p className="text-dark-muted text-[10px]">Weight</p>
                  <p className="text-dark-primary font-semibold font-mono text-lg">{photo.weight ? `${photo.weight} kg` : '-'}</p>
                </div>
                <div className="bg-az-black-elevated rounded-lg p-3">
                  <p className="text-dark-muted text-[10px]">Body Fat</p>
                  <p className="text-dark-primary font-semibold font-mono text-lg">{photo.bodyFatPercentage ? `${photo.bodyFatPercentage}%` : '-'}</p>
                </div>
              </div>

              {photo.notes && (
                <div>
                  <p className="text-dark-muted text-xs mb-1">Client Notes</p>
                  <p className="text-dark-secondary text-sm italic">&ldquo;{photo.notes}&rdquo;</p>
                </div>
              )}

              <div className="h-px bg-dark-border" />

              {/* Trainer Annotations */}
              <div>
                <p className="text-dark-primary text-sm font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare size={14} className="text-cyan" />
                  Trainer Annotations
                </p>

                <div className="space-y-3">
                  <div>
                    <Label className="text-dark-muted text-[10px]">Trainer Notes</Label>
                    <Textarea
                      value={trainerNotes}
                      onChange={(e) => setTrainerNotes(e.target.value)}
                      placeholder="Add your observations..."
                      className="bg-az-black-elevated border-dark-border text-dark-primary min-h-[80px] text-xs mt-1"
                    />
                  </div>

                  <ToggleRowInline
                    title="Mark as Milestone"
                    icon={<Star size={14} className="text-warning" />}
                    checked={isMilestone}
                    onChange={setIsMilestone}
                  />
                  <ToggleRowInline
                    title="Goal Achieved"
                    icon={<Trophy size={14} className="text-success" />}
                    checked={isGoalAchieved}
                    onChange={setIsGoalAchieved}
                  />

                  <Button className="w-full bg-cyan hover:bg-cyan-hover text-white mt-2" onClick={handleSave}>
                    Save Annotations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
