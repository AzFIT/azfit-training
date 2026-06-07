import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Save,
  Calculator,
  Scale,
  Ruler,
  ClipboardCheck,
} from 'lucide-react'
import { useAppDataStore } from '../stores/useAppDataStore'
import type { BioPrintEntry } from '../types/entities'

// ── 12 Poliquin BioSignature sites ─────────────────────────────────

const SITES = [
  { key: 'chin', label: 'Chin', desc: 'Directly under the chin' },
  { key: 'cheek', label: 'Cheek', desc: 'Over the masseter muscle' },
  { key: 'pec', label: 'Pectoral', desc: 'Mid-pec, diagonal fold' },
  { key: 'tricep', label: 'Tricep', desc: 'Mid-posterior upper arm' },
  { key: 'subscapular', label: 'Subscapular', desc: '1cm below inferior angle' },
  { key: 'midaxillary', label: 'Midaxillary', desc: 'Mid-axillary line at xiphoid' },
  { key: 'suprailiac', label: 'Suprailiac', desc: 'Above iliac crest, diagonal' },
  { key: 'umbilical', label: 'Umbilical', desc: '2cm right of navel' },
  { key: 'knee', label: 'Knee', desc: 'Just above patella' },
  { key: 'patellar', label: 'Patellar', desc: 'Over patella tendon' },
  { key: 'hamstring', label: 'Hamstring', desc: 'Mid-posterior thigh' },
  { key: 'medialCalf', label: 'Medial Calf', desc: 'Max medial calf girth' },
] as const

type SiteKey = (typeof SITES)[number]['key']

// ── Helpers ────────────────────────────────────────────────────────

function calcBodyFat(sum: number, _age: number, _isMale = true): number {
  // Jackson-Pollock 12-site approximation
  const bd = 1.112 - 0.00043499 * sum + 0.00000055 * sum * sum - 0.00028826 * _age
  const bf = (495 / bd) - 450
  return Math.max(3, Math.min(50, Math.round(bf * 10) / 10))
}

function bodyFatCategory(pct: number): string {
  if (pct < 6) return 'Essential Fat'
  if (pct < 14) return 'Athletic'
  if (pct < 18) return 'Fitness'
  if (pct < 25) return 'Average'
  return 'Above Average'
}

import { v4 as uuidv4 } from 'uuid'
const genId = () => `bp_${uuidv4().slice(0, 8)}_${Date.now()}`

// ── Page ───────────────────────────────────────────────────────────

export default function BioPrintWizardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clientId = searchParams.get('client') || ''
  const { clients, addBioPrintEntry } = useAppDataStore()
  const client = clients[clientId]

  const [step, setStep] = useState<1 | 2>(1)
  const [weight, setWeight] = useState(client?.weight?.toString() || '')
  const [values, setValues] = useState<Record<SiteKey, string>>(
    Object.fromEntries(SITES.map((s) => [s.key, ''])) as Record<SiteKey, string>
  )
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const numValues = Object.values(values).filter((v) => v !== '').length
  const allFilled = numValues === SITES.length && weight !== ''

  const sum12 = allFilled
    ? Math.round(
        (Object.values(values) as string[]).reduce((s, v) => s + parseFloat(v || '0'), 0) * 10
      ) / 10
    : 0

  const bodyFatPct = allFilled ? calcBodyFat(sum12, client?.age || 30) : 0
  const fatMass = allFilled ? Math.round(parseFloat(weight) * (bodyFatPct / 100) * 10) / 10 : 0
  const leanMass = allFilled ? Math.round((parseFloat(weight) - fatMass) * 10) / 10 : 0

  const updateValue = (key: SiteKey, val: string) => {
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setValues((prev) => ({ ...prev, [key]: val }))
    }
  }

  const handleSave = () => {
    if (!allFilled || !clientId) return
    setSaving(true)

    const entry: BioPrintEntry = {
      id: genId(),
      clientId,
      date: new Date().toISOString().split('T')[0],
      assessor: 'Coach',
      chin: parseFloat(values.chin),
      cheek: parseFloat(values.cheek),
      pec: parseFloat(values.pec),
      tricep: parseFloat(values.tricep),
      subscapular: parseFloat(values.subscapular),
      midaxillary: parseFloat(values.midaxillary),
      suprailiac: parseFloat(values.suprailiac),
      umbilical: parseFloat(values.umbilical),
      knee: parseFloat(values.knee),
      patellar: parseFloat(values.patellar),
      hamstring: parseFloat(values.hamstring),
      medialCalf: parseFloat(values.medialCalf),
      sum12,
      bodyFatPercent: bodyFatPct,
      leanMass,
      fatMass,
      weight: parseFloat(weight),
      notes: notes || undefined,
    }

    addBioPrintEntry(entry)
    setTimeout(() => {
      navigate(`/clients/${clientId}`)
    }, 800)
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-[#94A3B8] mb-4">Client not found</p>
          <button
            onClick={() => navigate('/clients')}
            className="bg-cyan text-white px-4 py-2 rounded-lg text-sm"
          >
            Back to Clients
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-[#1A1A1A] text-[#94A3B8] transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-dark-primary">BioPrint Assessment</h1>
          <p className="text-sm text-dark-muted">
            {client.name} · 12-site Poliquin BioSignature
          </p>
        </div>
      </div>

      {/* Step 1 — Measurements */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Weight */}
          <div className="bg-navy border border-navy-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Scale size={18} className="text-cyan" />
              <h3 className="text-dark-primary font-medium">Body Weight</h3>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '' || /^\d*\.?\d*$/.test(v)) setWeight(v)
                }}
                placeholder="0.0"
                className="w-32 bg-navy-input border border-navy-border rounded-lg px-4 py-2.5 text-dark-primary text-sm focus:border-cyan outline-none"
              />
              <span className="text-dark-muted text-sm">kg</span>
            </div>
          </div>

          {/* Skinfold Sites */}
          <div className="bg-navy border border-navy-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Ruler size={18} className="text-cyan" />
                <h3 className="text-dark-primary font-medium">12-Site Skinfold</h3>
              </div>
              <span className="text-xs text-dark-muted">
                {numValues}/{SITES.length} entered
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SITES.map((site, i) => (
                <motion.div
                  key={site.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="space-y-1"
                >
                  <label className="text-xs text-[#94A3B8] block">
                    {site.label}
                    <span className="text-dark-muted ml-1">({site.desc})</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={values[site.key]}
                      onChange={(e) => updateValue(site.key, e.target.value)}
                      placeholder="0.0"
                      className={cn(
                        'flex-1 bg-navy-input border rounded-lg px-3 py-2 text-dark-primary text-sm outline-none transition-colors',
                        values[site.key] ? 'border-cyan/50' : 'border-navy-border focus:border-cyan'
                      )}
                    />
                    <span className="text-dark-muted text-xs w-8">mm</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-navy border border-navy-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <ClipboardCheck size={18} className="text-cyan" />
              <h3 className="text-dark-primary font-medium">Notes</h3>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations during assessment..."
              rows={3}
              className="w-full bg-navy-input border border-navy-border rounded-lg px-4 py-3 text-dark-primary text-sm focus:border-cyan outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-[#94A3B8] hover:text-dark-primary text-sm px-4 py-2.5 rounded-lg hover:bg-[#1A1A1A] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!allFilled}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all',
                allFilled
                  ? 'bg-cyan text-white hover:bg-cyan/90 hover:scale-[1.02]'
                  : 'bg-navy-border text-dark-muted cursor-not-allowed'
              )}
            >
              <Calculator size={16} />
              Review Results
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2 — Results */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ResultCard label="Sum of 12" value={`${sum12} mm`} color="#00AEEF" />
            <ResultCard label="Body Fat %" value={`${bodyFatPct}%`} color="#8B5CF6" />
            <ResultCard label="Fat Mass" value={`${fatMass} kg`} color="#F97316" />
            <ResultCard label="Lean Mass" value={`${leanMass} kg`} color="#22C55E" />
          </div>

          {/* Category */}
          <div className="bg-navy border border-navy-border rounded-xl p-5 text-center">
            <p className="text-sm text-dark-muted mb-1">Body Fat Category</p>
            <p className="text-2xl font-bold text-dark-primary">{bodyFatCategory(bodyFatPct)}</p>
          </div>

          {/* Site Breakdown */}
          <div className="bg-navy border border-navy-border rounded-xl p-5">
            <h3 className="text-dark-primary font-medium mb-4">Site Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {SITES.map((site) => (
                <div
                  key={site.key}
                  className="flex items-center justify-between bg-navy-input rounded-lg px-3 py-2"
                >
                  <span className="text-xs text-[#94A3B8]">{site.label}</span>
                  <span className="text-sm text-dark-primary font-mono">
                    {values[site.key]} mm
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-[#94A3B8] hover:text-dark-primary text-sm px-4 py-2.5 rounded-lg hover:bg-[#1A1A1A] transition-colors"
            >
              Back to Measurements
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all',
                saving
                  ? 'bg-navy-border text-dark-muted'
                  : 'bg-cyan text-white hover:bg-cyan/90 hover:scale-[1.02]'
              )}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Assessment'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── Components ─────────────────────────────────────────────────────

function ResultCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-navy border border-navy-border rounded-xl p-4 text-center">
      <p className="text-xs text-dark-muted mb-1">{label}</p>
      <p className="text-xl font-bold font-mono" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
