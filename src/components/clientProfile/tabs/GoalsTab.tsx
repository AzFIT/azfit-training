import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Target } from 'lucide-react';
import { SectionCard } from '../shared';
import { useAppDataStore } from '../../../stores/useAppDataStore';
import type { ClientGoal } from '../../../types/entities';

function daysLeft(deadline: string): number | null {
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function statusClass(status: ClientGoal['status']) {
  if (status === 'On Track') return 'text-success bg-[rgba(34,197,94,0.1)]';
  if (status === 'At Risk') return 'text-warning bg-[rgba(234,179,8,0.1)]';
  return 'text-success bg-[rgba(34,197,94,0.1)]';
}

export default function GoalsTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const goals = useAppDataStore((s) => s.goals);

  const clientGoals = Object.values(goals)
    .filter((g) => g.clientId === clientId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeGoals = clientGoals.filter((g) => g.status !== 'Completed');
  const completedGoals = clientGoals.filter((g) => g.status === 'Completed');

  if (clientGoals.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark-primary">Goals</h2>
          <button className="flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
            <Plus size={16} /> New Goal
          </button>
        </div>
        <div className="bg-[az-black-card] border border-dark-border rounded-xl p-10 text-center">
          <Target size={40} className="text-dark-muted mx-auto mb-4" />
          <p className="text-dark-secondary mb-2">No goals set for this client yet.</p>
          <p className="text-sm text-dark-muted mb-4">Set measurable goals to track progress and keep clients motivated.</p>
          <button className="inline-flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
            <Plus size={16} /> Create First Goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-dark-primary">Goals</h2>
        <button className="flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
          <Plus size={16} /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeGoals.map((goal, i) => (
          <motion.div
            key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[az-black-card] border border-dark-border rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,174,239,0.1)] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,174,239,0.1)] text-cyan">{goal.category}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass(goal.status)}`}>{goal.status}</span>
            </div>
            <h3 className="text-base font-semibold text-dark-primary mb-2">{goal.title}</h3>
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div><p className="text-xs text-dark-muted">Starting</p><p className="text-sm text-dark-secondary font-mono">{goal.start}</p></div>
              <div><p className="text-xs text-dark-muted">Current</p><p className="text-sm text-cyan font-mono font-semibold">{goal.current}</p></div>
              <div><p className="text-xs text-dark-muted">Target</p><p className="text-sm text-success font-mono">{goal.target}</p></div>
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-secondary">Progress</span>
                <span className="text-dark-primary font-semibold">{goal.progress}%</span>
              </div>
              <div className="h-1.5 bg-[az-black-elevated] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[cyan] to-[success] rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-dark-muted">
              <span>Deadline: {goal.deadline}</span>
              {daysLeft(goal.deadline) !== null && <span>{daysLeft(goal.deadline)} days left</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <SectionCard title="Completed Goals">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Goal', 'Result', 'Achieved', 'Duration'].map((h) => (
                    <th key={h} className="text-left text-xs text-dark-muted font-semibold uppercase py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedGoals.map((g) => (
                  <tr key={g.id} className="border-b border-dark-divider hover:bg-[az-black-elevated] transition-colors">
                    <td className="py-2.5 px-3 text-sm text-dark-primary font-medium flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-success" /> {g.title}
                    </td>
                    <td className="py-2.5 px-3 text-sm text-success font-mono font-semibold">{g.target}</td>
                    <td className="py-2.5 px-3 text-sm text-dark-muted font-mono">{g.completedAt || '—'}</td>
                    <td className="py-2.5 px-3 text-sm text-dark-secondary">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
