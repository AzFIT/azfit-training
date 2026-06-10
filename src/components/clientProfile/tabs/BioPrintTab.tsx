import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { SectionCard, ChangePill } from '../shared';
import { useAppDataStore } from '../../../stores/useAppDataStore';
import type { BioPrintEntry } from '../../../types/entities';

const POLIQUIN_SITES: { key: keyof BioPrintEntry; label: string }[] = [
  { key: 'chin', label: 'Chin' },
  { key: 'cheek', label: 'Cheek' },
  { key: 'pec', label: 'Pec' },
  { key: 'tricep', label: 'Tricep' },
  { key: 'subscapular', label: 'Subscapular' },
  { key: 'midaxillary', label: 'Midaxillary' },
  { key: 'suprailiac', label: 'Suprailiac' },
  { key: 'umbilical', label: 'Umbilical' },
  { key: 'knee', label: 'Knee' },
  { key: 'patellar', label: 'Patellar' },
  { key: 'hamstring', label: 'Hamstring' },
  { key: 'medialCalf', label: 'Medial Calf' },
];

function formatDateDMY(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function BioPrintTab() {
  const navigate = useNavigate();
  const { id: clientId } = useParams<{ id: string }>();
  const bioPrintEntries = useAppDataStore((s) => s.bioPrintEntries);

  const entries = Object.values(bioPrintEntries)
    .filter((e) => e.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latest = entries[0];
  const previous = entries[1];

  const circumference = 2 * Math.PI * 50;
  const bodyFatPct = latest?.bodyFatPercent ?? 0;
  const offset = circumference - (Math.min(bodyFatPct, 40) / 40) * circumference;

  const historyChartData = entries
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => ({
      month: new Date(e.date).toLocaleString('default', { month: 'short' }),
      bf: e.bodyFatPercent,
    }));

  if (!latest) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dark-primary">BioPrint Assessment</h2>
            <p className="text-sm text-dark-muted">No assessments recorded yet</p>
          </div>
        </div>
        <div className="bg-az-black-card border border-dark-border rounded-xl p-10 text-center">
          <p className="text-dark-secondary mb-4">No BioPrint data available for this client.</p>
          <button
            onClick={() => navigate(`/clients/${clientId}/bioprint`)}
            className="inline-flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
          >
            <Plus size={16} /> New Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-dark-primary">BioPrint Assessment</h2>
          <p className="text-sm text-dark-muted">Last assessment: {formatDateDMY(latest.date)} · Poliquin 12-site method</p>
        </div>
        <button
          onClick={() => navigate(`/clients/${clientId}/bioprint`)}
          className="flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
        >
          <Plus size={16} /> New Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Skinfold Measurements (mm)">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Site', 'Current', 'Previous', 'Change', 'Goal'].map((h) => (
                    <th key={h} className="text-left text-xs text-dark-muted font-semibold uppercase py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POLIQUIN_SITES.map(({ key, label }) => {
                  const current = Number(latest[key]) || 0;
                  const prev = previous ? Number(previous[key]) || 0 : 0;
                  const change = prev ? +(current - prev).toFixed(1) : 0;
                  const goal = +(current * 0.85).toFixed(1);
                  return (
                    <tr key={label} className="border-b border-dark-divider hover:bg-az-black-elevated transition-colors">
                      <td className="py-2.5 px-3 text-sm text-dark-primary">{label}</td>
                      <td className="py-2.5 px-3 text-sm text-dark-primary font-mono">{current.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-sm text-dark-secondary font-mono">{prev ? prev.toFixed(1) : '—'}</td>
                      <td className="py-2.5 px-3">
                        {prev ? <ChangePill value={change} inverse /> : <span className="text-xs text-dark-muted">—</span>}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-success font-mono">{goal.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Body Composition Summary">
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="50" fill="none" stroke="dark-border" strokeWidth="8" />
                  <circle cx="64" cy="64" r="50" fill="none" stroke="cyan" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                    transform="rotate(-90 64 64)"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                  <text x="64" y="60" textAnchor="middle" fill="dark-primary" fontSize="22" fontWeight="700">{bodyFatPct.toFixed(1)}%</text>
                  <text x="64" y="78" textAnchor="middle" fill="dark-secondary" fontSize="11">Body Fat</text>
                </svg>
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-xs text-dark-muted">Total Body Fat</p>
                  <p className="text-xl font-bold text-dark-primary font-mono">{latest.fatMass.toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-xs text-dark-muted">Lean Mass</p>
                  <p className="text-xl font-bold text-dark-primary font-mono">{latest.leanMass.toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-xs text-dark-muted">Method</p>
                  <p className="text-sm text-dark-secondary">Poliquin 12-site</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Body Fat % History">
            <div className="h-52">
              {historyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyChartData}>
                    <defs>
                      <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="cyan" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="cyan" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--dark-muted)', fontSize: 12 }} />
                    <YAxis domain={[Math.max(0, bodyFatPct - 10), Math.min(40, bodyFatPct + 10)]} tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'az-black-card', border: '1px solid dark-border', borderRadius: 8, color: 'dark-primary' }} />
                    <Area type="monotone" dataKey="bf" stroke="cyan" strokeWidth={2} fill="url(#bfGrad)" />
                    <ReferenceLine y={16} stroke="success" strokeDasharray="4 4" label={{ value: 'Goal 16%', fill: 'success', fontSize: 11 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-dark-muted">
                  No historical data available
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
