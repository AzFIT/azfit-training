import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { useAppDataStore } from '@/stores/useAppDataStore';
import { getAllExerciseHistories, formatShortDate } from '@/lib/workoutAnalytics';
import { SectionCard } from '../shared';
import { COLORS } from '../tabsConfig';

export function DatabaseTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const { workoutSessions, exercises } = useAppDataStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'times' | 'weight'>('times');

  const histories = clientId ? getAllExerciseHistories(workoutSessions, clientId) : [];

  const enriched = histories.map((h) => {
    const ex = exercises[h.exerciseId];
    return {
      exerciseId: h.exerciseId,
      name: h.exerciseName || 'Unknown',
      muscle: ex?.muscleGroup || 'General',
      equipment: ex?.equipment || 'Bodyweight',
      timesDone: h.totalSets,
      maxWeight: h.prLoad,
      lastDate: h.lastDate ? formatShortDate(h.lastDate) : '-',
    };
  });

  const filtered = enriched
    .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.muscle.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'times') return b.timesDone - a.timesDone;
      if (sortBy === 'weight') return b.maxWeight - a.maxWeight;
      return a.name.localeCompare(b.name);
    });

  const muscleDistribution = Object.entries(
    enriched.reduce((acc, e) => {
      acc[e.muscle] = (acc[e.muscle] || 0) + e.timesDone;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-dark-primary">Exercise Database</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#1A1A1A] rounded-lg border border-dark-border px-3">
            <Search size={14} className="text-dark-muted flex-shrink-0" />
            <input type="text" placeholder="Search exercises..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-dark-primary placeholder-[#6B6B6B] py-2 px-2 outline-none w-48" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-[#1A1A1A] border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-primary outline-none">
            <option value="times">Most Frequent</option>
            <option value="weight">Heaviest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Muscle Group Distribution">
          <div className="h-56">
            {muscleDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-dark-muted">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={muscleDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {muscleDistribution.map((_, i) => {
                      return <Cell key={i} fill={COLORS[i % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#A0A0A0' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Most Frequent Exercises">
          <div className="h-56">
            {filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-dark-muted">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filtered.slice(0, 6)} layout="vertical">
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#A0A0A0', fontSize: 10 }} width={100} />
                  <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
                  <Bar dataKey="timesDone" fill="#00AEEF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="All Exercises">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Exercise', 'Muscle Group', 'Equipment', 'Sets Logged', 'Max Weight', 'Last Date'].map((h) => (
                  <th key={h} className="text-left text-xs text-dark-muted font-semibold uppercase py-2 px-3 cursor-pointer hover:text-cyan transition-colors">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ex, i) => (
                <motion.tr key={ex.exerciseId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-dark-divider hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                  onClick={() => navigate(`/clients/${clientId}/exercises/${ex.exerciseId}`)}>
                  <td className="py-2.5 px-3 text-sm text-dark-primary font-medium">{ex.name}</td>
                  <td className="py-2.5 px-3"><span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,174,239,0.1)] text-cyan">{ex.muscle}</span></td>
                  <td className="py-2.5 px-3"><span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.1)] text-violet">{ex.equipment}</span></td>
                  <td className="py-2.5 px-3 text-sm text-dark-primary font-mono">{ex.timesDone}</td>
                  <td className="py-2.5 px-3 text-sm text-dark-primary font-mono font-semibold">{ex.maxWeight}kg</td>
                  <td className="py-2.5 px-3 text-sm text-dark-muted font-mono">{ex.lastDate}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-xs text-dark-muted">No exercises logged yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
