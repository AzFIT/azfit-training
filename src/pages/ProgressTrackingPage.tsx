import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Plus,
  Save,
  TrendingDown,
  Scale,
  Ruler,
  X,
  Calendar,
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { useAppDataStore } from '../stores/useAppDataStore'

export default function ProgressTrackingPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { clients, progressEntries } = useAppDataStore()
  const [showForm, setShowForm] = useState(false)

  const client = clientId ? clients[clientId] : null

  const entries = Object.values(progressEntries)
    .filter((e) => e.clientId === clientId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const chartData = entries.map((e) => ({
    date: new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    weight: e.weight,
    bodyFat: e.bodyFat,
  }))

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={() => navigate(`/clients/${clientId}`)}
            className="flex items-center gap-1 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors w-fit"
          >
            <ChevronLeft size={16} /> Back to Profile
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#F0F0F0]">Progress Tracking</h1>
            <p className="text-sm text-[#6B6B6B]">
              {client?.name || 'Client'} • {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} logged
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'Log Progress'}
          </button>
        </div>

        {/* Entry Form */}
        {showForm && <ProgressEntryForm clientId={clientId || ''} onSaved={() => setShowForm(false)} />}

        {/* Charts */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
              <h2 className="text-sm font-semibold text-[#F0F0F0] mb-4 flex items-center gap-2">
                <Scale size={16} className="text-[#00AEEF]" /> Weight
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00AEEF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: '#6B6B6B', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6B6B6B', fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
                    <Area type="monotone" dataKey="weight" stroke="#00AEEF" fill="url(#wGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
              <h2 className="text-sm font-semibold text-[#F0F0F0] mb-4 flex items-center gap-2">
                <TrendingDown size={16} className="text-[#22C55E]" /> Body Fat %
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: '#6B6B6B', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6B6B6B', fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
                    <Area type="monotone" dataKey="bodyFat" stroke="#22C55E" fill="url(#bfGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-[#F0F0F0] mb-4">History</h2>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Scale size={32} className="mx-auto text-[#6B6B6B] mb-3" />
              <p className="text-sm text-[#A0A0A0]">No progress entries yet.</p>
              <p className="text-xs text-[#6B6B6B] mt-1">Click "Log Progress" to record weight, body fat, and measurements.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    {['Date', 'Weight', 'Body Fat', 'Measurements', 'Notes'].map((h) => (
                      <th key={h} className="text-left text-xs text-[#6B6B6B] font-semibold uppercase py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...entries].reverse().map((e, i) => (
                    <motion.tr
                      key={e.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors"
                    >
                      <td className="py-2.5 px-3 text-sm text-[#A0A0A0] font-mono whitespace-nowrap">
                        <Calendar size={12} className="inline mr-1" />
                        {new Date(e.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-mono font-semibold">{e.weight ? `${e.weight} kg` : '-'}</td>
                      <td className="py-2.5 px-3 text-sm text-[#F0F0F0] font-mono">{e.bodyFat ? `${e.bodyFat}%` : '-'}</td>
                      <td className="py-2.5 px-3 text-xs text-[#A0A0A0]">
                        {e.measurements
                          ? Object.entries(e.measurements)
                              .map(([k, v]) => `${k}: ${v}cm`)
                              .join(', ')
                          : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[#6B6B6B] max-w-[200px] truncate">{e.notes || '-'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgressEntryForm({ clientId, onSaved }: { clientId: string; onSaved: () => void }) {
  const { addProgressEntry } = useAppDataStore()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [notes, setNotes] = useState('')
  const [measurements, setMeasurements] = useState<Record<string, string>>({
    neck: '', shoulder: '', chest: '', waist: '', hips: '', thigh: '', calf: '', arm: '',
  })

  const handleSave = () => {
    const parsedMeasurements: Record<string, number> = {}
    for (const [key, val] of Object.entries(measurements)) {
      const n = parseFloat(val)
      if (!isNaN(n) && n > 0) parsedMeasurements[key] = n
    }

    addProgressEntry({
      id: `pe_${Date.now()}`,
      clientId,
      date: new Date(date).toISOString(),
      weight: parseFloat(weight) || undefined,
      bodyFat: parseFloat(bodyFat) || undefined,
      measurements: Object.keys(parsedMeasurements).length > 0 ? parsedMeasurements : undefined,
      notes: notes || undefined,
    })
    onSaved()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 space-y-4"
    >
      <h3 className="text-sm font-semibold text-[#F0F0F0]">Log New Entry</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-[#6B6B6B] mb-1 block">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] outline-none focus:border-[#00AEEF]"
          />
        </div>
        <div>
          <label className="text-xs text-[#6B6B6B] mb-1 block">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 70.5"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] outline-none focus:border-[#00AEEF]"
          />
        </div>
        <div>
          <label className="text-xs text-[#6B6B6B] mb-1 block">Body Fat %</label>
          <input
            type="number"
            step="0.1"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="e.g. 18.5"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] outline-none focus:border-[#00AEEF]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-[#6B6B6B] mb-2 block flex items-center gap-1">
          <Ruler size={12} /> Measurements (cm)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(measurements).map(([key, val]) => (
            <div key={key}>
              <span className="text-[10px] text-[#6B6B6B] uppercase block mb-1">{key}</span>
              <input
                type="number"
                step="0.1"
                value={val}
                onChange={(e) => setMeasurements((m) => ({ ...m, [key]: e.target.value }))}
                placeholder="cm"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] outline-none focus:border-[#00AEEF]"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-[#6B6B6B] mb-1 block">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          rows={2}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] outline-none focus:border-[#00AEEF] resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#009BD6] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
        >
          <Save size={16} /> Save Entry
        </button>
      </div>
    </motion.div>
  )
}
