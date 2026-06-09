import { useState, useEffect } from 'react'
import { format, getHours, getMinutes } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useClientList } from '@/stores/useAppDataStore.selectors'
import type { CalendarSession, SessionType } from './types'
import { HK_TIME_SLOTS, SESSION_TYPE_LABELS } from './constants'

interface NewSessionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedSlot?: Date
  onSubmit?: (session: CalendarSession) => void
}

export function NewSessionModal({
  isOpen,
  onClose,
  selectedSlot,
  onSubmit,
}: NewSessionModalProps) {
  const clients = useClientList()
  const [client, setClient] = useState('')
  const [type, setType] = useState<SessionType>('Personal Training')
  const [duration, setDuration] = useState('60')
  const [dateStr, setDateStr] = useState('')
  const [timeStr, setTimeStr] = useState('09:00')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (selectedSlot) {
      setDateStr(format(selectedSlot, 'yyyy-MM-dd'))
      const h = getHours(selectedSlot)
      const m = getMinutes(selectedSlot)
      setTimeStr(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    } else {
      setDateStr(format(new Date(), 'yyyy-MM-dd'))
    }
  }, [selectedSlot, isOpen])

  const handleSubmit = () => {
    if (!client || !dateStr || !timeStr) return
    const startTime = new Date(`${dateStr}T${timeStr}`)
    const session: CalendarSession = {
      id: `session-${Date.now()}`,
      clientName: client,
      type,
      startTime,
      duration: Number(duration),
      notes: notes || undefined,
    }
    onSubmit?.(session)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[white] border-[light-border] text-[light-primary] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Book New Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs text-[light-secondary] mb-1 block">Client</label>
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger className="bg-[light-surface] border-[light-border] text-[light-primary]">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-[light-surface] border-[light-border] z-[100] max-h-60">
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.name} className="text-[light-primary]">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[light-secondary] mb-1 block">Date</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full h-10 bg-[light-surface] border border-[light-border] rounded-lg px-3 text-[light-primary] text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[light-secondary] mb-1 block">Time</label>
              <select
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full h-10 bg-[light-surface] border border-[light-border] rounded-lg px-3 text-[light-primary] text-sm"
              >
                {HK_TIME_SLOTS.map((h) =>
                  [0, 30].map((m) => (
                    <option key={`${h}-${m}`} value={`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`}>
                      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[light-secondary] mb-1 block">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-[light-surface] border-[light-border] text-[light-primary]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[light-surface] border-[light-border]">
                  {['30', '45', '60', '90', '120'].map((d) => (
                    <SelectItem key={d} value={d} className="text-[light-primary]">
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-[light-secondary] mb-1 block">Session Type</label>
              <Select value={type} onValueChange={(v) => setType(v as SessionType)}>
                <SelectTrigger className="bg-[light-surface] border-[light-border] text-[light-primary]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[light-surface] border-[light-border]">
                  {SESSION_TYPE_LABELS.map((t) => (
                    <SelectItem key={t} value={t} className="text-[light-primary]">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[light-secondary] mb-1 block">Notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add session notes..."
              className="w-full bg-[light-surface] border border-[light-border] rounded-lg px-3 py-2 text-[light-primary] text-sm placeholder:text-[gray-300] resize-none focus:outline-none focus:border-cyan"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[light-secondary] hover:text-[light-primary] hover:bg-[light-hover]"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-cyan hover:bg-cyan-hover text-white">
            Book Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
