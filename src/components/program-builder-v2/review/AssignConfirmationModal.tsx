import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Rocket, User, Calendar, CheckCircle } from 'lucide-react'

interface AssignConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientName: string
  phaseName: string
  durationWeeks: number
  sessionCount: number
  onConfirm: () => void
}

export function AssignConfirmationModal({
  open,
  onOpenChange,
  clientName,
  phaseName,
  durationWeeks,
  sessionCount,
  onConfirm,
}: AssignConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Rocket size={18} className="text-primary" />
            Assign Program
          </DialogTitle>
          <DialogDescription className="text-xs">
            Confirm assignment details before launching.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-muted space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-primary" />
              <span className="text-muted-foreground">Client:</span>
              <span className="font-semibold text-[light-primary]">{clientName || 'Not selected'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={14} className="text-primary" />
              <span className="text-muted-foreground">Program:</span>
              <span className="font-semibold text-[light-primary]">{phaseName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-primary" />
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-semibold text-[light-primary]">
                {durationWeeks} weeks · {sessionCount} sessions
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            The client will receive their first session on the start date. Linked tracking
            (Daily Log, Weekly Check-In, Measurements) will be enabled automatically.
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1 text-xs" onClick={onConfirm}>
              <Rocket size={13} className="mr-1" />
              Assign Program
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
