import { useState, useCallback } from 'react'
import {
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { SectionCard } from './SectionCard'
import { SegmentedControl } from './SegmentedControl'

export function DataSection() {
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV'>('JSON')
  const [importFiles, setImportFiles] = useState<File[]>([])
  const [lastBackup] = useState('15/04/2026 03:00')
  const [storageUsed] = useState(62)

  const handleImportDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ['application/json', 'text/csv'].includes(f.type) || f.name.endsWith('.json') || f.name.endsWith('.csv')
    )
    setImportFiles(files)
  }, [])

  return (
    <div>
      <SectionCard title="Export Your Data" description="Download all your data in your preferred format.">
        <div className="space-y-4">
          <div>
            <Label className="text-dark-secondary text-sm mb-2">Format</Label>
            <SegmentedControl options={['JSON', 'CSV']} value={exportFormat} onChange={(v) => setExportFormat(v as 'JSON' | 'CSV')} />
          </div>
          <Button className="bg-cyan hover:bg-cyan-hover text-white">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Import Data" description="Import data from a previous export or another platform.">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImportDrop}
          className="border-2 border-dashed border-dark-border hover:border-cyan rounded-xl bg-[az-black-elevated] p-8 text-center transition-colors cursor-pointer"
          onClick={() => document.getElementById('import-file')?.click()}
        >
          <Upload size={32} className="mx-auto text-dark-muted mb-3" />
          <p className="text-dark-secondary text-sm mb-1">Drag files here or click to browse</p>
          <p className="text-dark-muted text-xs">JSON, CSV supported</p>
          <input
            id="import-file"
            type="file"
            accept=".json,.csv"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && setImportFiles(Array.from(e.target.files))}
          />
        </div>
        {importFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {importFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[az-black-elevated] border border-dark-border">
                <span className="text-dark-primary text-sm">{f.name}</span>
                <span className="text-dark-muted text-xs">{(f.size / 1024).toFixed(0)} KB</span>
              </div>
            ))}
            <Button className="mt-2 bg-cyan hover:bg-cyan-hover text-white">
              <Upload size={16} className="mr-2" />
              Import {importFiles.length} File{importFiles.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Backup" description="Automatic backups are created weekly.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dark-primary text-sm">Last backup: <span className="text-dark-secondary">{lastBackup}</span></p>
            <p className="text-dark-muted text-xs mt-1">Next backup: 22/04/2026 03:00</p>
          </div>
          <Button variant="outline" className="border-cyan text-cyan hover:bg-[rgba(0,174,239,0.1)]">
            <RefreshCw size={16} className="mr-2" />
            Backup Now
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Storage Usage">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-secondary">1.2 GB / 5 GB used</span>
            <span className="text-cyan font-medium">{storageUsed}%</span>
          </div>
          <Progress value={storageUsed} className="h-2 bg-[az-black-elevated] [&>div]:bg-cyan" />
          <div className="flex gap-4 text-xs text-dark-muted pt-2">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan" /> Photos (60%)</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet" /> Documents (25%)</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange" /> Other (15%)</span>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
