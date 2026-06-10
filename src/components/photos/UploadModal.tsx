import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ProgressPhoto, PhotoCategory, UploadFile } from './types'

export default function UploadModal({
  open,
  onClose,
  onUpload,
}: {
  open: boolean
  onClose: () => void
  onUpload: (photos: ProgressPhoto[]) => void
}) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    )
    addFiles(dropped)
  }, [])

  const addFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > 10) {
      alert('Maximum 10 files per upload')
      return
    }
    const uploads: UploadFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      category: 'Front',
      date: new Date().toISOString().slice(0, 10),
      weight: '',
      bodyFat: '',
      notes: '',
      progress: 0,
      status: 'pending',
    }))
    setFiles((prev) => [...prev, ...uploads])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const handleUpload = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading' as const })))

    // Simulate upload progress
    const interval = setInterval(() => {
      setFiles((prev) => {
        const allDone = prev.every((f) => f.progress >= 100)
        if (allDone) {
          clearInterval(interval)
          const newPhotos: ProgressPhoto[] = prev.map((f, idx) => ({
            id: `upload-${Date.now()}-${idx}`,
            clientId: 'sarah-johnson',
            url: f.preview,
            thumbnailUrl: f.preview,
            date: f.date,
            category: f.category,
            notes: f.notes || undefined,
            weight: f.weight ? parseFloat(f.weight) : undefined,
            bodyFatPercentage: f.bodyFat ? parseFloat(f.bodyFat) : undefined,
            trainerNotes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
          setTimeout(() => {
            onUpload(newPhotos)
            setFiles([])
            onClose()
          }, 500)
          return prev.map((f) => ({ ...f, status: 'done' as const, progress: 100 }))
        }
        return prev.map((f) => ({
          ...f,
          progress: Math.min(100, f.progress + 10 + Math.random() * 20),
        }))
      })
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setFiles([]); onClose() } }}>
      <DialogContent className="bg-az-black-card border-dark-border text-dark-primary max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Upload Progress Photos</DialogTitle>
        </DialogHeader>

        {/* Drop Zone */}
        {files.length === 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-cyan bg-cyan-glow scale-[1.02]'
                : 'border-dark-border bg-az-black-elevated hover:border-dark-subtle'
            }`}
          >
            <Upload size={40} className="mx-auto text-dark-muted mb-3" />
            <p className="text-dark-secondary text-sm mb-1">Drag photos here or click to browse</p>
            <p className="text-dark-muted text-xs">JPG, PNG, WebP up to 5MB each (max 10 files)</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3 mt-4">
            {files.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-az-black-elevated border rounded-xl p-3 space-y-3 ${
                  f.status === 'error' ? 'border-danger' : 'border-dark-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={f.preview} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-dark-primary text-sm truncate">{f.file.name}</p>
                    <p className="text-dark-muted text-xs">{(f.file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  {f.status === 'done' && <Check size={18} className="text-success" />}
                  {f.status === 'error' && <AlertTriangle size={18} className="text-danger" />}
                  <Button variant="ghost" size="icon" className="text-dark-muted hover:text-danger" onClick={() => removeFile(f.id)}>
                    <X size={16} />
                  </Button>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-dark-muted text-[10px]">Category</Label>
                    <Select value={f.category} onValueChange={(v) => updateFile(f.id, { category: v as PhotoCategory })}>
                      <SelectTrigger className="bg-az-black-card border-dark-border text-dark-primary h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-az-black-card border-dark-border">
                        {(['Front', 'Back', 'Side', 'Other'] as const).map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-dark-muted text-[10px]">Date</Label>
                    <Input
                      type="date"
                      value={f.date}
                      onChange={(e) => updateFile(f.id, { date: e.target.value })}
                      className="bg-az-black-card border-dark-border text-dark-primary h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-dark-muted text-[10px]">Weight (kg)</Label>
                    <Input
                      type="number"
                      value={f.weight}
                      onChange={(e) => updateFile(f.id, { weight: e.target.value })}
                      placeholder="78.0"
                      className="bg-az-black-card border-dark-border text-dark-primary h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-dark-muted text-[10px]">Body Fat %</Label>
                    <Input
                      type="number"
                      value={f.bodyFat}
                      onChange={(e) => updateFile(f.id, { bodyFat: e.target.value })}
                      placeholder="22.0"
                      className="bg-az-black-card border-dark-border text-dark-primary h-8 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-dark-muted text-[10px]">Notes</Label>
                  <Textarea
                    value={f.notes}
                    onChange={(e) => updateFile(f.id, { notes: e.target.value })}
                    placeholder="Optional notes..."
                    className="bg-az-black-card border-dark-border text-dark-primary min-h-[50px] text-xs"
                  />
                </div>

                {f.status === 'uploading' && (
                  <Progress value={f.progress} className="h-1 bg-az-black [&>div]:bg-cyan" />
                )}
              </motion.div>
            ))}

            {/* Add more files */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-dark-border rounded-xl text-dark-muted text-sm hover:border-cyan hover:text-cyan transition-colors"
            >
              + Add more files
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />

            {/* Progress */}
            {files.some((f) => f.status === 'uploading') && (
              <div className="pt-2">
                <p className="text-dark-muted text-xs mb-1">
                  Uploading... {Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length)}%
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" className="text-dark-secondary" onClick={() => { setFiles([]); onClose() }}>Cancel</Button>
              <Button
                className="bg-cyan hover:bg-cyan-hover text-white"
                onClick={handleUpload}
                disabled={files.length === 0 || files.some((f) => f.status === 'uploading')}
              >
                Upload {files.length} Photo{files.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
