import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale, Activity, Dumbbell, CheckCircle2, Calendar, TrendingDown, Target,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useAppDataStore } from '@/stores/useAppDataStore';
import { formatDate } from '@/lib/workoutAnalytics';
import { KpiCard, SectionCard } from '../shared';
import TodaysSessionWidget from './TodaysSessionWidget';
import LeaderboardWidget from '@/components/dashboard/LeaderboardWidget';

export default function DashboardTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const { clients, progressEntries, workoutSessions, notes, sessions } = useAppDataStore();
  const client = clientId ? clients[clientId] : null;

  const entries = Object.values(progressEntries)
    .filter((e) => e.clientId === clientId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latest = entries[entries.length - 1];
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;
  const weightChange = latest && prev && latest.weight && prev.weight ? +(latest.weight - prev.weight).toFixed(1) : 0;
  const bfChange = latest && prev && latest.bodyFat && prev.bodyFat ? +(latest.bodyFat - prev.bodyFat).toFixed(1) : 0;

  const clientWorkouts = Object.values(workoutSessions)
    .filter((s) => s.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const clientNotes = Object.values(notes)
    .filter((n) => n.clientId === clientId)
    .sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime());

  const upcomingSessions = Object.values(sessions)
    .filter((s) => s.clientId === clientId && new Date(s.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 3);

  const chartData = entries.slice(-30).map((e, i) => ({
    day: `Day ${i + 1}`,
    weight: e.weight,
    bodyFat: e.bodyFat,
  }));

  const daysAsClient = client?.joinDate
    ? Math.floor((Date.now() - new Date(client.joinDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Left Column */}
      <div className="lg:col-span-3 space-y-5">
        {client && <TodaysSessionWidget client={client} />}
        {client && <LeaderboardWidget />}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Current Weight" value={latest?.weight || client?.weight || 0} unit="kg" change={weightChange} icon={Scale} inverse />
          <KpiCard label="Body Fat %" value={latest?.bodyFat || client?.bodyFat || 0} unit="%" change={bfChange} icon={Activity} inverse />
          <KpiCard label="Sessions" value={client?.sessionsCompleted || 0} unit="total" change={0} icon={Dumbbell} />
        </div>

        <SectionCard title="Weight Trend (30 Days)">
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-dark-muted">No progress entries yet</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="cyan" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="cyan" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} interval={4} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'az-black-card', border: '1px solid dark-border', borderRadius: 8, color: 'dark-primary' }} />
                  <Area type="monotone" dataKey="weight" stroke="cyan" strokeWidth={2} fill="url(#wtGrad)" />
                  <ReferenceLine y={client?.weight || 0} stroke="success" strokeDasharray="4 4" label={{ value: 'Goal', fill: 'success', fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Activity">
          {clientWorkouts.length === 0 ? (
            <div className="text-center py-6 text-sm text-dark-muted">No recent activity</div>
          ) : (
            <div className="space-y-3">
              {clientWorkouts.slice(0, 5).map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-hover transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'success15' }}>
                    <CheckCircle2 size={16} style={{ color: 'success' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-primary truncate">Completed {s.programName || 'Workout'} session</p>
                    <p className="text-xs text-dark-muted">{formatDate(s.date)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-2 space-y-5">
        <SectionCard title="Weight Journey">
          {entries.length < 2 ? (
            <div className="text-center py-6 text-sm text-dark-muted">Not enough data</div>
          ) : (
            <>
              <div className="flex items-center justify-between text-center">
                <div><p className="text-xs text-dark-muted mb-1">Start</p><p className="text-lg font-bold text-dark-primary font-mono">{entries[0]?.weight || 0}</p><p className="text-xs text-dark-secondary">kg</p></div>
                <div className="flex-1 flex items-center justify-center"><div className="h-0.5 bg-gradient-to-r from-[danger] via-[warning] to-[success] flex-1 mx-3 rounded-full" /><TrendingDown size={16} className="text-success flex-shrink-0" /></div>
                <div><p className="text-xs text-dark-muted mb-1">Current</p><p className="text-lg font-bold text-cyan font-mono">{latest?.weight || 0}</p><p className="text-xs text-dark-secondary">kg</p></div>
                <div className="flex-1 flex items-center justify-center"><div className="h-0.5 bg-gradient-to-r from-[success] to-cyan flex-1 mx-3 rounded-full" /><Target size={16} className="text-cyan flex-shrink-0" /></div>
                <div><p className="text-xs text-dark-muted mb-1">Goal</p><p className="text-lg font-bold text-success font-mono">{client?.weight || 0}</p><p className="text-xs text-dark-secondary">kg</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-dark-border">
                <p className="text-xs text-dark-muted">Total lost: <span className="text-success font-semibold">{((entries[0]?.weight || 0) - (latest?.weight || 0)).toFixed(1)} kg</span></p>
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard title="Quick Stats">
          <div className="space-y-3">
            {[
              { label: 'Days as Client', value: daysAsClient + ' days' },
              { label: 'Current Program', value: client?.programName || 'None' },
              { label: 'Program Progress', value: (client?.programProgress || 0) + '%' },
              { label: 'Next Session', value: upcomingSessions[0] ? upcomingSessions[0].date + ' ' + upcomingSessions[0].startTime : 'None scheduled' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-dark-divider last:border-0">
                <span className="text-sm text-dark-secondary">{s.label}</span>
                <span className="text-sm text-dark-primary font-medium text-right">{s.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Sessions">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-6 text-sm text-dark-muted">No upcoming sessions</div>
          ) : (
            <div className="space-y-2">
              {upcomingSessions.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-az-black-elevated">
                  <div className="w-10 h-10 rounded-lg bg-cyan-glow flex items-center justify-center flex-shrink-0"><Calendar size={18} className="text-cyan" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm text-dark-primary font-medium truncate">{s.title}</p><p className="text-xs text-dark-muted">{s.date} {s.startTime}</p></div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Latest Notes">
          {clientNotes.length === 0 ? (
            <div className="text-center py-6 text-sm text-dark-muted">No notes yet</div>
          ) : (
            <div className="space-y-2">
              {clientNotes.slice(0, 2).map((n) => (
                <div key={n.id} className="p-3 rounded-lg bg-az-black-elevated border border-dark-border">
                  <div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium text-cyan">{n.category}</span><span className="text-xs text-dark-muted">{n.date}</span></div>
                  <p className="text-sm text-dark-primary font-medium">{n.title}</p>
                  <p className="text-xs text-dark-secondary line-clamp-2 mt-1">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
