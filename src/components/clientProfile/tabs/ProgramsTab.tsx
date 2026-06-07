import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ClipboardList } from 'lucide-react';
import { SectionCard } from '../shared';
import { useAppDataStore } from '../../../stores/useAppDataStore';
import type { ClientProgramAssignment } from '../../../types/entities';

function formatDateRange(start?: string, end?: string): string {
  if (!start) return '—';
  const s = new Date(start);
  const startStr = `${s.getDate().toString().padStart(2, '0')} ${s.toLocaleString('default', { month: 'short' })} ${s.getFullYear()}`;
  if (!end) return startStr;
  const e = new Date(end);
  const endStr = `${e.getDate().toString().padStart(2, '0')} ${e.toLocaleString('default', { month: 'short' })} ${e.getFullYear()}`;
  return `${startStr} — ${endStr}`;
}

function formatDuration(weeks: number): string {
  return weeks === 1 ? '1 week' : `${weeks} weeks`;
}

export function ProgramsTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const assignments = useAppDataStore((s) => s.assignments);
  const programs = useAppDataStore((s) => s.programs);
  const workoutSessions = useAppDataStore((s) => s.workoutSessions);

  const clientAssignments = Object.values(assignments)
    .filter((a) => a.clientId === clientId)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const activeAssignment = clientAssignments.find((a) => a.status === 'active');
  const historyAssignments = clientAssignments.filter((a) => a.status !== 'active');

  function getProgramProgress(assignment: ClientProgramAssignment): number {
    const program = programs[assignment.programId];
    const totalWeeks = program?.durationWeeks ?? 16;
    const pct = Math.round((assignment.currentWeek / totalWeeks) * 100);
    return Math.min(Math.max(pct, 0), 100);
  }

  function getSessionCount(assignment: ClientProgramAssignment): number {
    return Object.values(workoutSessions).filter(
      (s) => s.clientId === clientId && s.programId === assignment.programId
    ).length;
  }

  const activeProgram = activeAssignment ? programs[activeAssignment.programId] : undefined;
  const activeProgress = activeAssignment ? getProgramProgress(activeAssignment) : 0;
  const activeSessions = activeAssignment ? getSessionCount(activeAssignment) : 0;

  if (clientAssignments.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark-primary">Programs</h2>
          <button
            onClick={() => navigate(`/programs?assignTo=${clientId}`)}
            className="flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
          >
            <Plus size={16} /> Assign New
          </button>
        </div>
        <div className="bg-[#141414] border border-dark-border rounded-xl p-10 text-center">
          <p className="text-dark-secondary mb-4">No programs assigned to this client yet.</p>
          <button
            onClick={() => navigate(`/programs?assignTo=${clientId}`)}
            className="inline-flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
          >
            <Plus size={16} /> Assign New Program
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-dark-primary">Programs</h2>
        <button
          onClick={() => navigate(`/programs?assignTo=${clientId}`)}
          className="flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
        >
          <Plus size={16} /> Assign New
        </button>
      </div>

      {/* Active Program */}
      {activeAssignment && activeProgram && (
        <div className="bg-gradient-to-br from-[rgba(0,174,239,0.08)] to-[rgba(139,92,246,0.04)] bg-[#141414] border border-dark-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-success font-semibold bg-[rgba(34,197,94,0.1)] px-2 py-0.5 rounded-full">Active</span>
                <span className="text-xs text-dark-secondary">{activeProgram.trainingSplit || 'General'}</span>
              </div>
              <h3 className="text-xl font-semibold text-dark-primary">{activeProgram.name}</h3>
              <p className="text-sm text-dark-secondary">{activeProgram.goal.replace(/-/g, ' ')}</p>
              <p className="text-sm text-dark-muted mt-1">Week {activeAssignment.currentWeek} of {activeProgram.durationWeeks || 16}</p>
            </div>
            <ClipboardList size={32} className="text-cyan opacity-50" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-secondary">Progress</span>
              <span className="text-dark-primary font-semibold">{activeProgress}%</span>
            </div>
            <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${activeProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#00AEEF] to-[#8B5CF6] rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-border">
            <div className="text-center">
              <p className="text-xl font-bold text-dark-primary font-mono">{activeAssignment.currentWeek}</p>
              <p className="text-xs text-dark-muted">Current Week</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-dark-primary font-mono">{activeAssignment.currentDay}</p>
              <p className="text-xs text-dark-muted">Current Day</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-dark-primary font-mono">{activeSessions}</p>
              <p className="text-xs text-dark-muted">Sessions</p>
            </div>
          </div>
        </div>
      )}

      {/* Program History */}
      <SectionCard title="Program History">
        {historyAssignments.length === 0 ? (
          <p className="text-sm text-dark-muted">No completed or paused programs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Program', 'Method', 'Duration', 'Dates', 'Status', 'Results'].map((h) => (
                    <th key={h} className="text-left text-xs text-dark-muted font-semibold uppercase py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historyAssignments.map((assignment) => {
                  const program = programs[assignment.programId];
                  const status = assignment.status;
                  const durationWeeks = program?.durationWeeks ?? 0;
                  return (
                    <tr key={assignment.id} className="border-b border-dark-divider hover:bg-[#1A1A1A] transition-colors">
                      <td className="py-2.5 px-3 text-sm text-dark-primary font-medium">{program?.name || 'Unknown Program'}</td>
                      <td className="py-2.5 px-3 text-sm text-dark-secondary">{program?.trainingSplit || '—'}</td>
                      <td className="py-2.5 px-3 text-sm text-dark-secondary font-mono">{durationWeeks ? formatDuration(durationWeeks) : '—'}</td>
                      <td className="py-2.5 px-3 text-sm text-dark-muted font-mono">{formatDateRange(assignment.startDate, assignment.endDate)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'completed' ? 'text-success bg-[rgba(34,197,94,0.1)]' : status === 'paused' ? 'text-warning bg-[rgba(234,179,8,0.1)]' : 'text-danger bg-[rgba(239,68,68,0.1)]'}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-dark-muted">Week {assignment.currentWeek} completed</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
