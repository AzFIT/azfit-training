import { useParams } from 'react-router-dom';
import {
  Moon, Activity, Heart, Flame, Target, CheckCircle2, XCircle, Edit3,
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { KpiCard, SectionCard } from '../shared';
import { useAppDataStore } from '../../../stores/useAppDataStore';

const LIFESTYLE_CATEGORIES = ['sleep', 'lifestyle', 'habit', 'stress'];

function isLifestyleNote(category: string): boolean {
  const lower = category.toLowerCase();
  return LIFESTYLE_CATEGORIES.some((c) => lower.includes(c));
}

function formatDateDMY(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function LifestyleTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const notes = useAppDataStore((s) => s.notes);
  const progressEntries = useAppDataStore((s) => s.progressEntries);
  const clients = useAppDataStore((s) => s.clients);

  const client = clientId ? clients[clientId] : undefined;

  const lifestyleNotes = Object.values(notes)
    .filter((n) => n.clientId === clientId && isLifestyleNote(n.category))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestProgress = Object.values(progressEntries)
    .filter((e) => e.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Derive simple placeholder lifestyle metrics from notes / client data
  const sleepAvg = 7.2; // placeholder — no dedicated sleep data yet
  const sleepQuality = 'Good';
  const stressScore = 4;
  const activityLevel = client?.goal?.toLowerCase().includes('endurance')
    ? 'Very Active'
    : client?.goal?.toLowerCase().includes('strength') || client?.goal?.toLowerCase().includes('muscle')
      ? 'Moderately Active'
      : 'Lightly Active';

  const sleep7Day = [
    { day: 'Mon', hours: 7.5, quality: 8 }, { day: 'Tue', hours: 6.8, quality: 7 },
    { day: 'Wed', hours: 7.2, quality: 8 }, { day: 'Thu', hours: 7.0, quality: 7 },
    { day: 'Fri', hours: 6.5, quality: 6 }, { day: 'Sat', hours: 8.0, quality: 9 },
    { day: 'Sun', hours: 7.8, quality: 9 },
  ];

  // Derive placeholder habits from lifestyle note categories
  const habitNames = Array.from(new Set(lifestyleNotes.map((n) => n.category)));
  const habits = habitNames.length
    ? habitNames.map((category) => ({
        name: category,
        week: Array.from({ length: 7 }, () => Math.random() > 0.3),
      }))
    : [
        { name: 'Protein Target', week: [true, true, true, true, false, true, true] },
        { name: '8h Sleep', week: [true, false, true, true, false, true, true] },
        { name: 'Water 2L', week: [true, true, true, false, true, true, true] },
        { name: 'No Alcohol', week: [true, true, true, true, true, false, true] },
        { name: 'Steps 10k', week: [true, true, false, true, true, true, true] },
      ];

  if (lifestyleNotes.length === 0) {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-dark-primary">Lifestyle</h2>
        <div className="bg-[az-black-card] border border-dark-border rounded-xl p-10 text-center">
          <p className="text-dark-secondary mb-2">No lifestyle notes recorded yet.</p>
          <p className="text-sm text-dark-muted mb-4">
            Add notes tagged with sleep, lifestyle, habit, or stress to build a lifestyle profile.
          </p>
          <button className="inline-flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
            <Edit3 size={16} /> Add Lifestyle Note
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-dark-primary">Lifestyle</h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Sleep (avg)" value={`${sleepAvg}h`} icon={Moon} />
        <KpiCard label="Sleep Quality" value={sleepQuality} icon={Activity} />
        <KpiCard label="Stress Level" value={`${stressScore}/10`} icon={Heart} inverse />
        <KpiCard label="Activity" value={activityLevel.split(' ')[0]} icon={Flame} />
        <KpiCard label="Occupation" value="Desk Job" icon={Target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Sleep History (7 Days)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={sleep7Day}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--dark-muted)', fontSize: 12 }} />
                <YAxis yAxisId="left" domain={[0, 10]} tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'az-black-card', border: '1px solid dark-border', borderRadius: 8, color: 'dark-primary' }} />
                <ReferenceLine yAxisId="left" y={8} stroke="success" strokeDasharray="4 4" />
                <Bar yAxisId="left" dataKey="hours" fill="cyan" radius={[4, 4, 0, 0]} name="Hours" />
                <Line yAxisId="right" type="monotone" dataKey="quality" stroke="violet" strokeWidth={2} name="Quality" dot={{ r: 4, fill: 'var(--violet)' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Summary Cards">
          <div className="space-y-3">
            {[
              { label: 'Occupation', value: 'Desk Job', icon: Target },
              { label: 'Activity Level', value: activityLevel, icon: Flame },
              { label: 'Injuries / Limitations', value: latestProgress?.notes ? 'See latest progress note' : 'None reported', icon: Heart },
              { label: 'Stress Trend', value: `Low (Stable)`, icon: Activity },
              { label: 'Sleep Trend', value: `${sleepQuality} (Improving)`, icon: Moon },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[az-black-elevated] rounded-lg border border-dark-border">
                <div className="w-8 h-8 rounded-lg bg-cyan-glow flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-dark-muted">{item.label}</p>
                  <p className="text-sm text-dark-primary font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Lifestyle Notes */}
      <SectionCard title="Lifestyle Notes">
        <div className="space-y-3">
          {lifestyleNotes.map((note) => (
            <div key={note.id} className="bg-[az-black-elevated] rounded-lg p-4 border border-dark-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-dark-primary">{note.title}</span>
                <span className="text-xs text-dark-muted font-mono">{formatDateDMY(note.date)}</span>
              </div>
              <p className="text-xs text-dark-secondary mb-2">{note.content}</p>
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[rgba(0,174,239,0.1)] text-cyan">
                {note.category}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Habit Tracker */}
      <SectionCard title="Weekly Habit Tracker">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-xs text-dark-muted font-semibold uppercase py-2 px-3">Habit</th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <th key={d} className="text-center text-xs text-dark-muted font-semibold uppercase py-2 px-2">{d}</th>
                ))}
                <th className="text-center text-xs text-dark-muted font-semibold uppercase py-2 px-3">%</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => {
                const completed = h.week.filter(Boolean).length;
                const pct = Math.round((completed / 7) * 100);
                return (
                  <tr key={h.name} className="border-b border-dark-divider hover:bg-[az-black-elevated] transition-colors">
                    <td className="py-2.5 px-3 text-sm text-dark-primary">{h.name}</td>
                    {h.week.map((done, i) => (
                      <td key={i} className="py-2.5 px-2 text-center">
                        {done ? <CheckCircle2 size={18} className="text-success mx-auto" /> : <XCircle size={18} className="text-danger mx-auto opacity-40" />}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-sm font-mono font-semibold ${pct >= 80 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-danger'}`}>{pct}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
          <Edit3 size={16} /> Update Questionnaire
        </button>
      </div>
    </div>
  );
}
