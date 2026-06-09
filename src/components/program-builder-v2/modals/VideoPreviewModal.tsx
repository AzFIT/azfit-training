import { ExternalLink, Play } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { MotionCategoryBadge } from '../shared/MotionCategoryBadge'

interface VideoPreviewModalProps {
  exerciseName: string
  motionCategory?: string
  videoLink: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoPreviewModal({
  exerciseName,
  motionCategory,
  videoLink,
  open,
  onOpenChange,
}: VideoPreviewModalProps) {
  // Extract a YouTube video ID if the link looks like one
  const youtubeId = videoLink
    ? videoLink.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1]
    : null

  const hasVideo = !!youtubeId || !!videoLink

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Play size={16} className="text-primary" />
            {exerciseName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {motionCategory && <MotionCategoryBadge category={motionCategory} />}

          {youtubeId ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={exerciseName}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : hasVideo ? (
            <div className="aspect-video rounded-lg bg-muted flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Play size={32} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Video link available but not embeddable.
              </p>
              <a
                href={videoLink || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Open Video
                <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <div className="aspect-video rounded-lg bg-muted flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Play size={32} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No video available for this exercise yet.
              </p>
            </div>
          )}

          {videoLink && !youtubeId && (
            <div className="text-xs text-muted-foreground break-all">
              Link: {videoLink}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
