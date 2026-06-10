import { useState } from 'react'
import { Download, RefreshCw, Trash2, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionCard } from './SectionCard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function exportClientsCSV() {
  const headers = ['id', 'name', 'email', 'phone', 'status', 'joinedAt']
  const rows = [
    ['1', 'Michael T.', 'michael@example.com', '9123 4567', 'Active', '2026-01-15'],
    ['2', 'Sarah L.', 'sarah@example.com', '9234 5678', 'Active', '2026-02-20'],
    ['3', 'Jennifer W.', 'jennifer@example.com', '9345 6789', 'Inactive', '2026-03-10'],
  ]
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadBlob(csv, 'azfit-clients.csv', 'text/csv')
}

function exportSessionsCSV() {
  const headers = ['id', 'clientName', 'date', 'type', 'duration', 'status']
  const rows = [
    ['1', 'Michael T.', '2026-06-09', 'Strength', '60 min', 'Completed'],
    ['2', 'Sarah L.', '2026-06-08', 'HIIT', '45 min', 'Completed'],
    ['3', 'Jennifer W.', '2026-06-10', 'Recovery', '30 min', 'Scheduled'],
  ]
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadBlob(csv, 'azfit-sessions.csv', 'text/csv')
}

function backupLocalStorage() {
  const data: Record<string, string | null> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) data[key] = localStorage.getItem(key)
  }
  const json = JSON.stringify(data, null, 2)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  downloadBlob(json, `azfit-backup-${timestamp}.json`, 'application/json')
}

export function DataTab() {
  const [lastBackup, setLastBackup] = useState('Never')
  const [confirmText, setConfirmText] = useState('')
  const [resetText, setResetText] = useState('')
  const [cleared, setCleared] = useState(false)
  const [reset, setReset] = useState(false)

  const handleBackup = () => {
    backupLocalStorage()
    setLastBackup(new Date().toLocaleString())
  }

  const handleClearAll = () => {
    if (confirmText !== 'DELETE') return
    localStorage.clear()
    setCleared(true)
    setConfirmText('')
    setTimeout(() => setCleared(false), 3000)
  }

  const handleReset = () => {
    if (resetText !== 'RESET') return
    localStorage.clear()
    setReset(true)
    setResetText('')
    setTimeout(() => setReset(false), 3000)
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Export Data" description="Download your data in CSV format.">
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportClientsCSV} variant="outline" className="border-cyan text-cyan hover:bg-[rgba(0,174,239,0.1)]">
            <Download size={16} className="mr-2" />
            Export Clients as CSV
          </Button>
          <Button onClick={exportSessionsCSV} variant="outline" className="border-cyan text-cyan hover:bg-[rgba(0,174,239,0.1)]">
            <Download size={16} className="mr-2" />
            Export Sessions as CSV
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Backup" description="Create a local backup of all app data stored in this browser.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dark-primary text-sm">Last backup: <span className="text-dark-secondary">{lastBackup}</span></p>
            <p className="text-dark-muted text-xs mt-1">Backups are saved as JSON files to your device.</p>
          </div>
          <Button onClick={handleBackup} variant="outline" className="border-cyan text-cyan hover:bg-[rgba(0,174,239,0.1)]">
            <RefreshCw size={16} className="mr-2" />
            Backup Now
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Clear Data" description="Remove all locally stored data. This cannot be undone.">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-danger text-danger hover:bg-[rgba(239,68,68,0.1)]">
              <Trash2 size={16} className="mr-2" />
              Clear All Data
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-az-black-card border-dark-border text-dark-primary max-w-md">
            <DialogHeader>
              <DialogTitle className="text-danger flex items-center gap-2">
                <AlertTriangle size={18} /> Clear All Data
              </DialogTitle>
              <DialogDescription className="text-dark-muted">
                This will permanently delete all local data including settings, drafts, and cached information. Type DELETE to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="text-dark-secondary text-sm mb-2">Type DELETE to confirm</Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="bg-az-black-elevated border-dark-border text-dark-primary"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" className="text-dark-secondary">Cancel</Button>
              <Button
                onClick={handleClearAll}
                disabled={confirmText !== 'DELETE'}
                className="bg-danger hover:bg-[danger] text-white"
              >
                {cleared ? <><Check size={16} className="mr-2" /> Cleared</> : 'Permanently Clear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SectionCard>

      <SectionCard title="Reset App" description="Reset the app to its default state. All data will be lost.">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-danger hover:bg-[danger] text-white">
              <RefreshCw size={16} className="mr-2" />
              Reset App
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-az-black-card border-dark-border text-dark-primary max-w-md">
            <DialogHeader>
              <DialogTitle className="text-danger flex items-center gap-2">
                <AlertTriangle size={18} /> Reset App
              </DialogTitle>
              <DialogDescription className="text-dark-muted">
                This will reset the entire application to defaults. All local data will be erased. Type RESET to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="text-dark-secondary text-sm mb-2">Type RESET to confirm</Label>
              <Input
                value={resetText}
                onChange={(e) => setResetText(e.target.value)}
                placeholder="RESET"
                className="bg-az-black-elevated border-dark-border text-dark-primary"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" className="text-dark-secondary">Cancel</Button>
              <Button
                onClick={handleReset}
                disabled={resetText !== 'RESET'}
                className="bg-danger hover:bg-[danger] text-white"
              >
                {reset ? <><Check size={16} className="mr-2" /> Reset</> : 'Confirm Reset'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SectionCard>
    </div>
  )
}
