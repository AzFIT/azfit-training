import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, CheckCircle2, Dumbbell, Clock, Filter, ChevronRight,
} from 'lucide-react';
import { useAppDataStore } from '@/stores/useAppDataStore';
import {
  getSessionsByClient,
  getSessionVolume,
  getSessionCompletedSets,
  getSessionTotalSets,
  formatDuration,
} from '@/lib/workoutAnalytics';
import { KpiCard } from '../shared';
import CalendarView from './CalendarView';

export default function SessionsTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const { workoutSessions } = useAppDataStore();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [monthFilter, setMonthFilter] = useState('All');

  const sessions = clientId ? getSessionsByClient(workoutSessions, clientId) : [];
  const completed = sessions.length;
  const totalDuration = sessions.reduce((a, s) => a + (s.durationSeconds || 0), 0);
  const avgDuration = completed > 0 ? Math.round(totalDuration / completed / 60) : 0;

  const filtered = monthFilter === 'All'
    ? sessions
    : sessions.filter((s) => {
        const d = new Date(s.date);
        return d.toLocaleString('en-GB', { month: 'long' }) === monthFilter;
      });

  const months = Array.from(new Set(sessions.map((s) => new Date(s.date).toLocaleString('en-GB', { month: 'long' }))));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-dark-primary">Session History</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/clients/${clientId}/workouts`)}
            className="flex items-center gap-1.5 text-xs font-medium text-cyan hover:text-white border border-cyan/30 hover:bg-cyan px-3 py-1.5 rounded-lg transition-all"
          >
            View All <ChevronRight size={14} />
          </button>
          <div className="flex gap-1 bg-az-black-elevated rounded-lg p-1">
            {([
              { key: 'list' as const, label: 'List View' },
              { key: 'calendar' as const, label: 'Calendar View' },
            ]).map((v) => (
              <button key={v.key} onClick={() => setView(v.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === v.key ? 'bg-dark-hover text-cyan' : 'text-dark-secondary hover:text-dark-primary'}`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Sessions" value={sessions.length} icon={Calendar} />
        <KpiCard label="Completed" value={completed} icon={CheckCircle2} />
        <KpiCard label="Total Volume" value={`${Math.round(sessions.reduce((a, s) => a + getSessionVolume(s), 0) / 1000)}k`} icon={Dumbbell} />
        <KpiCard label="Avg Duration" value={`${avgDuration}m`} icon={Clock} />
      </div>

      {view === 'list' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-dark-muted" />
            <span className="text-xs text-dark-muted">Filter:</span>
            <button
              onClick={() => setMonthFilter('All')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${monthFilter === 'All' ? 'bg-dark-hover text-cyan' : 'text-dark-muted hover:text-dark-secondary'}`}>
              All
            </button>
            {months.slice(0, 6).map((m) => (
              <button key={m} onClick={() => setMonthFilter(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${monthFilter === m ? 'bg-dark-hover text-cyan' : 'text-dark-muted hover:text-dark-secondary'}`}>
                {m}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-dark-border rounded-xl">
              <Calendar size={32} className="mx-auto text-dark-muted mb-3" />
              <p className="text-sm text-dark-secondary">No sessions logged yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((s, i) => {
                const completedSets = getSessionCompletedSets(s);
                const totalSets = getSessionTotalSets(s);
                const volume = getSessionVolume(s);
                const d = new Date(s.date);
                return (
                  <motion.div
                    key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-az-black-card border border-dark-border rounded-xl p-4 flex items-center gap-4 hover:bg-az-black-elevated transition-colors cursor-pointer"
                    onClick={() => navigate(`/clients/${clientId}/workouts`)}
                  >
                    <div className="flex-shrink-0 w-14 text-center">
                      <p className="text-xs text-dark-muted font-mono">{d.getDate().toString().padStart(2, '0')}/{(d.getMonth() + 1).toString().padStart(2, '0')}</p>
                      <p className="text-xs text-dark-secondary font-mono">{d.getFullYear()}</p>
                    </div>
                    <div className="w-px h-10 bg-dark-border flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-dark-primary font-medium truncate">{s.programName || 'Workout'}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 text-success bg-[rgba(34,197,94,0.1)]">
                          Completed
                        </span>
                      </div>
                      <p className="text-xs text-dark-muted">
                        {s.exercises.length} exercises · {completedSets}/{totalSets} sets · {formatDuration(s.durationSeconds || 0)} · {volume.toLocaleString()} kg vol
                        {s.notes ? ' · Has notes' : ''}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-dark-muted flex-shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <CalendarView />
      )}
    </div>
  );
}
