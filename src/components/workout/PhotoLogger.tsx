/**
 * Photo Logger — Capture workout photos during session
 *
 * Uses file input with camera capture fallback.
 * Shows thumbnail strip of logged photos.
 */

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Trash2, ImagePlus } from 'lucide-react'

export interface SessionPhoto {
  id: string
  url: string
  timestamp: number
  caption?: string
}

interface PhotoLoggerProps {
  photos: SessionPhoto[]
  onAddPhoto: (photo: SessionPhoto) => void
  onRemovePhoto: (id: string) => void
}

export default function PhotoLogger({ photos, onAddPhoto, onRemovePhoto }: PhotoLoggerProps) {
  const [expanded, setExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (ev) => {
        const url = ev.target?.result as string
        onAddPhoto({
          id: `photo_${Date.now()}`,
          url,
          timestamp: Date.now(),
        })
      }
      reader.readAsDataURL(file)

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [onAddPhoto]
  )

  return (
    <>
      {/* Photo strip (shows when photos exist) */}
      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-light-border rounded-xl overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-light-muted">
                  Session Photos ({photos.length})
                </span>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-cyan hover:underline"
                >
                  {expanded ? 'Collapse' : 'Expand'}
                </button>
              </div>
              <div className={`flex gap-2 overflow-x-auto pb-1 ${expanded ? '' : 'max-h-20'}`}>
                {photos.map((photo) => (
                  <div key={photo.id} className="relative flex-shrink-0 group">
                    <img
                      src={photo.url}
                      alt="Workout"
                      className="w-16 h-16 object-cover rounded-lg border border-light-border"
                    />
                    <button
                      onClick={() => onRemovePhoto(photo.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                    <span className="text-[9px] text-light-muted block text-center mt-0.5">
                      {new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                {/* Add more button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-light-border flex flex-col items-center justify-center text-light-muted hover:border-cyan hover:text-cyan transition-colors"
                >
                  <ImagePlus size={16} />
                  <span className="text-[9px] mt-0.5">Add</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  )
}

/**
 * Button to trigger photo capture
 */
export function PhotoCaptureButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 rounded-xl bg-light-surface text-light-secondary text-sm font-medium hover:bg-light-hover transition-colors"
      aria-label="Log Photo"
    >
      <Camera size={16} />
    </button>
  )
}
