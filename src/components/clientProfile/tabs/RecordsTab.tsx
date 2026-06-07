import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useAppDataStore } from '@/stores/useAppDataStore';
import {
  getPRs,
  getAllExerciseHistories,
  getSessionsByClient,
  formatDate,
  formatShortDate,
} from '@/lib/workoutAnalytics';
import { SectionCard, ChangePill } from '../shared';

export function RecordsTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const { workoutSessions } = useAppDataStore();
  const [filter, setFilter] = useState<'all' | 'prs' | 'recent'>('all');
  const navigate = useNavigate();

  const prs = clientId ? getPRs(workoutSessions, clientId) : [];
  const histories = clientId ? getAllExerciseHistories(workoutSessions, clientId) : [];

  const recentLifts = (clientId ? getSessionsByClient(workoutSessions, clientId) : [])
    .flatMap((s) =>
      s.exercises.flatMap((e) =>
        e.sets
          .filter((set) => set.completed && set.actualLoad && set.actualReps)
          .map((set) => ({
            date: formatShortDate(s.date),
            exercise: e.exerciseName,
            weight: set.actualLoad!,
            reps: set.actualReps!,
            rpe: set.actualRpe || 0,
            exerciseId: e.exerciseId,
          }))
      )
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const displayedPRs = filter === 'recent' ? prs.slice(0, 6) : filter === 'prs' ? prs.filter((p) => p.previousBest > 0) : prs;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-dark-primary">Exercise Records</h2>
        <div className="flex gap-1 bg-[#1A1A1A] rounded-lg p-1">
          {([
            { key: 'all' as const, label: 'All Records' },
            { key: 'prs' as const, label: 'Personal Records' },
            { key: 'recent' as const, label: 'Recent' },
          ]).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f.key ? 'bg-dark-hover text-cyan' : 'text-dark-secondary hover:text-dark-primary'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {prs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-dark-border rounded-xl">
          <Trophy size={32} className="mx-auto text-dark-muted mb-3" />
          <p className="text-sm text-dark-secondary">No records yet.</p>
          <p className="text-xs text-dark-muted mt-1">Complete workouts to see PRs here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedPRs.slice(0, 6).map((pr, i) => (
            <motion.div
              key={pr.exerciseId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(`/clients/${clientId}/exercises/${pr.exerciseId}`)}
              className="cursor-pointer bg-gradient-to-br from-[rgba(234,179,8,0.08)] to-[rgba(249,115,22,0.04)] bg-[#141414] border border-dark-border rounded-xl p-5 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(234,179,8,0.1)] transition-all duration-200"
            >
              <div className="absolute top-3 right-3">
                <Trophy size={20} className="text-warning" />
              </div>
              <p className="text-sm text-dark-secondary mb-1">{pr.exerciseName}</p>
              <p className="text-2xl font-bold text-dark-primary font-mono">{pr.load} <span className="text-sm text-dark-secondary">kg</span></p>
              <p className="text-xs text-dark-muted mt-1">{pr.reps} reps · {formatDate(pr.date)}</p>
              <div className="mt-3 pt-3 border-t border-dark-border flex items-center justify-between">
                <span className="text-xs text-dark-muted">Previous: {pr.previousBest}kg</span>
                <ChangePill value={+((pr.load - pr.previousBest)).toFixed(1)} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <SectionCard title="1RM Estimates (Epley Formula)">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Exercise', 'Estimated 1RM', 'Best Load', 'Best Reps'].map((h) => (
                  <th key={h} className="text-left text-xs text-dark-muted font-semibold uppercase py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {histories.slice(0, 8).map((h) => (
                <tr key={h.exerciseId} className="border-b border-dark-divider hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                  onClick={() => navigate(`/clients/${clientId}/exercises/${h.exerciseId}`)}>
                  <td className="py-2.5 px-3 text-sm text-dark-primary font-medium">{h.exerciseName}</td>
                  <td className="py-2.5 px-3 text-sm text-dark-primary font-mono font-bold">{h.bestEstimated1RM} kg</td>
                  <td className="py-2.5 px-3 text-sm text-dark-secondary font-mono">{h.prLoad} kg</td>
                  <td className="py-2.5 px-3 text-sm text-dark-secondary font-mono">{h.prReps}</td>
                </tr>
              ))}
              {histories.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-xs text-dark-muted">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Recent Lifts">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Date', 'Exercise', 'Weight', 'Reps', 'RPE'].map((h) => (
                  <th key={h} className="text-left text-xs text-dark-muted font-semibold uppercase py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLifts.map((lift, i) => (
                <tr key={i} className="border-b border-dark-divider hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                  onClick={() => navigate(`/clients/${clientId}/exercises/${lift.exerciseId}`)}>
                  <td className="py-2.5 px-3 text-sm text-dark-secondary font-mono">{lift.date}</td>
                  <td className="py-2.5 px-3 text-sm text-dark-primary">{lift.exercise}</td>
                  <td className="py-2.5 px-3 text-sm text-dark-primary font-mono font-semibold">{lift.weight}kg</td>
                  <td className="py-2.5 px-3 text-sm text-dark-secondary font-mono">{lift.reps}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lift.rpe >= 9 ? 'text-danger bg-[rgba(239,68,68,0.1)]' : lift.rpe >= 7 ? 'text-warning bg-[rgba(234,179,8,0.1)]' : 'text-success bg-[rgba(34,197,94,0.1)]'}`}>
                      {lift.rpe}/10
                    </span>
                  </td>
                </tr>
              ))}
              {recentLifts.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-xs text-dark-muted">No lifts logged yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
