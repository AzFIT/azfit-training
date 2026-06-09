import { useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Upload,
  Columns2,
  Filter,
  ArrowUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import EmptyState from '../components/EmptyState'
import { useAppDataStore } from '../stores/useAppDataStore'
import {
  StatsBar,
  UploadModal,
  Lightbox,
  ComparisonView,
  PhotoCard,
  demoPhotos,
  ease,
} from '../components/photos'
import type { ProgressPhoto, PhotoCategory } from '../components/photos'

export default function PhotosPage() {
  const { id: clientId } = useParams<{ id: string }>()
  const { clients } = useAppDataStore()
  const clientName = clientId ? clients[clientId]?.name : null

  const [photos, setPhotos] = useState<ProgressPhoto[]>(demoPhotos)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [comparePair, setComparePair] = useState<[ProgressPhoto, ProgressPhoto] | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<PhotoCategory | 'All'>('All')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Filtered + sorted photos
  const filtered = useMemo(() => {
    let list = [...photos]
    if (categoryFilter !== 'All') {
      list = list.filter((p) => p.category === categoryFilter)
    }
    list.sort((a, b) => {
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      return sortOrder === 'newest' ? db - da : da - db
    })
    return list
  }, [photos, categoryFilter, sortOrder])

  const handleUpload = useCallback((newPhotos: ProgressPhoto[]) => {
    setPhotos((prev) => [...newPhotos, ...prev])
  }, [])

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id)
      }
      if (prev.length >= 2) {
        return [prev[1], id]
      }
      return [...prev, id]
    })
  }

  const startComparison = () => {
    if (selectedIds.length !== 2) return
    const a = photos.find((p) => p.id === selectedIds[0])
    const b = photos.find((p) => p.id === selectedIds[1])
    if (a && b) {
      const left = new Date(a.date) <= new Date(b.date) ? a : b
      const right = new Date(a.date) <= new Date(b.date) ? b : a
      setComparePair([left, right])
    }
  }

  const handleUpdatePhoto = (id: string, updates: Partial<ProgressPhoto>) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const lightboxPhoto = lightboxIdx !== null ? filtered[lightboxIdx] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-dark-primary text-2xl font-semibold mb-1">Progress Photos</h1>
        <p className="text-dark-muted text-sm">{clientName || 'Unknown Client'} — Visual transformation tracking</p>
      </div>

      {/* Stats */}
      <StatsBar photos={photos} />

      {/* Comparison Active Bar */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-cyan-glow border border-[rgba(0,174,239,0.3)] rounded-xl p-4 flex items-center justify-between">
              <p className="text-cyan text-sm">
                Select 2 photos to compare · <span className="font-medium">{selectedIds.length}/2 selected</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-dark-secondary"
                  onClick={() => { setCompareMode(false); setSelectedIds([]) }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-cyan hover:bg-cyan-hover text-white"
                  disabled={selectedIds.length !== 2}
                  onClick={startComparison}
                >
                  <Columns2 size={14} className="mr-1" />
                  Compare
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison View */}
      <AnimatePresence>
        {comparePair && (
          <div className="mb-6">
            <ComparisonView
              left={comparePair[0]}
              right={comparePair[1]}
              onClose={() => { setComparePair(null); setCompareMode(false); setSelectedIds([]) }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      {!comparePair && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Button className="bg-cyan hover:bg-cyan-hover text-white" onClick={() => setUploadOpen(true)}>
              <Upload size={16} className="mr-2" />
              Upload Photos
            </Button>
            <Button
              variant={compareMode ? 'default' : 'outline'}
              className={compareMode ? 'bg-cyan text-white' : 'border-dark-border text-dark-secondary hover:text-dark-primary'}
              onClick={() => { setCompareMode(!compareMode); setSelectedIds([]) }}
            >
              <Columns2 size={16} className="mr-2" />
              Compare
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-dark-muted" />
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as PhotoCategory | 'All')}>
              <SelectTrigger className="bg-[az-black-elevated] border-dark-border text-dark-primary h-8 text-xs w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[az-black-card] border-dark-border">
                <SelectItem value="All">All Categories</SelectItem>
                {(['Front', 'Back', 'Side', 'Other'] as const).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={() => setSortOrder((o) => (o === 'newest' ? 'oldest' : 'newest'))}
              className="flex items-center gap-1 h-8 px-3 bg-[az-black-elevated] border border-dark-border rounded-md text-xs text-dark-secondary hover:text-dark-primary transition-colors"
            >
              <ArrowUpDown size={12} />
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <AnimatePresence mode="wait">
        {!comparePair && (
          <motion.div
            key={`${categoryFilter}-${sortOrder}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {filtered.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                compareMode={compareMode}
                selected={selectedIds.includes(photo.id)}
                onSelect={() => handleSelect(photo.id)}
                onClick={() => setLightboxIdx(i)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filtered.length === 0 && (
        <EmptyState
          icon={<Camera size={48} />}
          title="No photos match"
          description="Try adjusting your filters or upload new photos."
          action={
            <Button variant="outline" className="border-cyan text-cyan hover:bg-[rgba(0,174,239,0.1)]" onClick={() => { setCategoryFilter('All') }}>
              Clear Filters
            </Button>
          }
        />
      )}

      {/* Upload Modal */}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={handleUpload} />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && lightboxIdx !== null && (
          <Lightbox
            photo={lightboxPhoto}
            onClose={() => setLightboxIdx(null)}
            onPrev={() => setLightboxIdx((i) => Math.max(0, (i ?? 1) - 1))}
            onNext={() => setLightboxIdx((i) => Math.min(filtered.length - 1, (i ?? 0) + 1))}
            hasPrev={lightboxIdx > 0}
            hasNext={lightboxIdx < filtered.length - 1}
            onUpdate={handleUpdatePhoto}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
