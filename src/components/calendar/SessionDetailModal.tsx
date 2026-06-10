import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { User, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { CalendarSession, SessionType } from './types'
import { SESSION_COLORS, SESSION_TYPE_LABELS } from './constants'
import { addMinutes } from './utils'

interface SessionDetailModalProps {
  session: CalendarSession | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (id: string) => void
  onEdit?: (session: CalendarSession) => void
  hasWorkout?: boolean
}

export function SessionDetailModal({
  session,
  isOpen,
  onClose,
  onDelete,
  onEdit,
  hasWorkout,
}: SessionDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [editType, setEditType] = useState<SessionType>('Personal Training')
  const [editDuration, setEditDuration] = useState(60)

  useEffect(() => {
    if (session) {
      setEditType(session.type)
      setEditDuration(session.duration)
      setShowCancelConfirm(false)
    }
  }, [session])

  if (!session) return null

  const colors = SESSION_COLORS[session.type]

  const handleSaveEdit = () => {
    onEdit?.({ ...session, type: editType, duration: editDuration })
    setIsEditing(false)
  }

  const handleDeleteClick = () => {
    setShowCancelConfirm(true)
  }

  const handleConfirmDelete = () => {
    onDelete?.(session.id)
    setShowCancelConfirm(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-white border-light-border text-light-primary max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {isEditing ? 'Edit Session' : 'Session Details'}
            {hasWorkout && !isEditing && (
              <span className="flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} />
                Workout logged
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {isEditing ? (
            <>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Session Type</label>
                  <Select value={editType} onValueChange={(v) => setEditType(v as SessionType)}>
                    <SelectTrigger className="bg-light-surface border-light-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_TYPE_LABELS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Duration (minutes)</label>
                  <div className="flex gap-2">
                    {[30, 45, 60, 90].map((d) => (
                      <button
                        key={d}
                        onClick={() => setEditDuration(d)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          editDuration === d
                            ? 'bg-cyan text-white'
                            : 'bg-light-surface text-light-secondary hover:bg-light-hover'
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-light-secondary">Cancel</Button>
                <Button onClick={handleSaveEdit} className="bg-cyan text-white hover:bg-cyan-dark">Save</Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: colors.border }}>
                  <User size={18} style={{ color: colors.text }} />
                </div>
                <div>
                  <p className="text-light-primary font-semibold">{session.clientName}</p>
                  <p className="text-light-muted text-xs">{session.type}</p>
                </div>
              </div>
              <div className="bg-light-surface rounded-xl p-4 border border-light-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-light-muted text-xs">Date</span>
                  <span className="text-light-primary text-xs font-medium">{format(session.startTime, 'EEEE, d MMMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light-muted text-xs">Time</span>
                  <span className="text-light-primary text-xs font-medium font-mono">
                    {format(session.startTime, 'HH:mm')} - {format(addMinutes(session.startTime, session.duration), 'HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light-muted text-xs">Duration</span>
                  <span className="text-light-primary text-xs font-medium">{session.duration} minutes</span>
                </div>
              </div>
              {showCancelConfirm ? (
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 space-y-3">
                  <p className="text-danger text-sm font-medium">Cancel this session?</p>
                  <p className="text-light-secondary text-xs">This will remove "{session.clientName}" from {format(session.startTime, 'EEEE, d MMMM')} at {format(session.startTime, 'HH:mm')}.</p>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowCancelConfirm(false)} className="text-light-secondary hover:text-light-primary text-xs">Keep Session</Button>
                    <Button onClick={handleConfirmDelete} className="bg-danger hover:bg-danger/90 text-white text-xs">Yes, Cancel Session</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleDeleteClick}
                    className="text-danger hover:text-danger hover:bg-danger/10"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="text-light-secondary hover:text-light-primary"
                  >
                    <Pencil size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={onClose} className="text-light-secondary hover:text-light-primary">Close</Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
