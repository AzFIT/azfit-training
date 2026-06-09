import { Save, ClipboardList, RotateCcw } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui/button'

interface BottomActionBarProps {
  onSaveDraft: () => void
  onReview: () => void
  onReset: () => void
  hasModifications: boolean
  className?: string
}

export function BottomActionBar({
  onSaveDraft,
  onReview,
  onReset,
  hasModifications,
  className,
}: BottomActionBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 bg-background/95 backdrop-blur-sm border-t px-4 py-3',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {hasModifications && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={onReset}
          >
            <RotateCcw size={13} className="mr-1" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={onSaveDraft}
          >
            <Save size={13} className="mr-1" />
            Save Draft
          </Button>
          <Button
            size="sm"
            className="text-xs"
            onClick={onReview}
          >
            <ClipboardList size={13} className="mr-1" />
            Review &amp; Assign →
          </Button>
        </div>
      </div>
    </div>
  )
}
