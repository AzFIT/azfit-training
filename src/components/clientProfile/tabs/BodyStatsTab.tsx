import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Scale, Activity, Heart, Dumbbell } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAppDataStore } from '@/stores/useAppDataStore';
import { KpiCard, SectionCard, ChangePill } from '../shared';

export default function BodyStatsTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { progressEntries, clients } = useAppDataStore();
  const [range, setRange] = useState<'30d' | '90d'>('90d');

  const client = clientId ? clients[clientId] : null;

  const entries = Object.values(progressEntries)
    .filter((e) => e.clientId === clientId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latest = entries[entries.length - 1];
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;

  const weightChange = latest && prev && latest.weight && prev.weight ? +(latest.weight - prev.weight).toFixed(1) : 0;
  const bfChange = latest && prev && latest.bodyFat && prev.bodyFat ? +(latest.bodyFat - prev.bodyFat).toFixed(1) : 0;

  const days = range === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const chartData = entries
    .filter((e) => new Date(e.date) >= cutoff)
    .map((e) => ({
      day: new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      weight: e.weight,
      bodyFat: e.bodyFat,
    }));

  const measurementKeys = ['neck', 'shoulder', 'chest', 'waist', 'hips', 'thigh', 'calf', 'arm'];
  const measurementRows = measurementKeys.map((key) => {
    const current = latest?.measurements?.[key];
    const prevVal = prev?.measurements?.[key];
    return {
      name: key.charAt(0).toUpperCase() + key.slice(1),
      current: current !== undefined ? `${current}` : '-',
      prev30d: prevVal !== undefined ? `${prevVal}` : '-',
      change: current !== undefined && prevVal !== undefined ? +(current - prevVal).toFixed(1) : 0,
    };
  }).filter((m) => m.current !== '-');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-dark-primary">Body Statistics</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/clients/${clientId}/progress`)}
            className="flex items-center gap-1.5 text-xs font-medium text-cyan hover:text-white border border-cyan/30 hover:bg-cyan px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus size={14} /> Log Measurement
          </button>
          <div className="flex gap-1 bg-[az-black-elevated] rounded-lg p-1">
            {(['30d', '90d'] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${range === r ? 'bg-dark-hover text-cyan' : 'text-dark-secondary hover:text-dark-primary'}`}>
                {r === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Current Weight" value={latest?.weight || client?.weight || 0} unit="kg" change={weightChange} icon={Scale} inverse />
        <KpiCard label="Body Fat %" value={latest?.bodyFat || client?.bodyFat || 0} unit="%" change={bfChange} icon={Activity} inverse />
        <KpiCard label="BMI" value={client?.weight && client?.height ? +((client.weight / ((client.height / 100) ** 2))).toFixed(1) : 0} unit="" change={0} icon={Heart} inverse />
        <KpiCard label="Entries" value={entries.length} unit="" change={0} icon={Dumbbell} />
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-dark-border rounded-xl">
          <Scale size={32} className="mx-auto text-dark-muted mb-3" />
          <p className="text-sm text-dark-secondary">No body stats logged yet.</p>
          <button
            onClick={() => navigate(`/clients/${clientId}/progress`)}
            className="mt-3 text-xs text-cyan hover:underline"
          >
            Log your first measurement
          </button>
        </div>
      ) : (
        <>
          <SectionCard title="Weight History">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="cyan" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="cyan" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--dark-muted)', fontSize: 10 }} interval={range === '90d' ? 9 : 4} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'az-black-card', border: '1px solid dark-border', borderRadius: 8, color: 'dark-primary' }} />
                  <Area type="monotone" dataKey="weight" stroke="cyan" strokeWidth={2} fill="url(#wsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Body Fat % Trend">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="bfsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="violet" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="violet" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" tick={{ fill: 'var(--dark-muted)', fontSize: 10 }} interval={range === '90d' ? 9 : 4} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'az-black-card', border: '1px solid dark-border', borderRadius: 8, color: 'dark-primary' }} />
                    <Area type="monotone" dataKey="bodyFat" stroke="violet" strokeWidth={2} fill="url(#bfsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Measurements (cm)">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-border">
                      {['Measurement', 'Current', 'Previous', 'Change'].map((h) => (
                        <th key={h} className="text-left text-xs text-dark-muted font-semibold uppercase py-2 px-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {measurementRows.length === 0 ? (
                      <tr><td colSpan={4} className="py-6 text-center text-xs text-dark-muted">No measurements logged</td></tr>
                    ) : (
                      measurementRows.map((m) => (
                        <tr key={m.name} className="border-b border-dark-divider hover:bg-[az-black-elevated] transition-colors">
                          <td className="py-2 px-2 text-sm text-dark-primary">{m.name}</td>
                          <td className="py-2 px-2 text-sm text-dark-primary font-mono">{m.current}</td>
                          <td className="py-2 px-2 text-sm text-dark-secondary font-mono">{m.prev30d}</td>
                          <td className="py-2 px-2"><ChangePill value={+m.change.toFixed(1)} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
