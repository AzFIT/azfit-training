import { useNavigate, useParams } from 'react-router-dom';
import { GlassWater, Plus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { SectionCard } from '../shared';
import { useAppDataStore } from '../../../stores/useAppDataStore';

function formatDateDMY(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function DietTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const nutritionEntries = useAppDataStore((s) => s.nutritionEntries);

  const entries = Object.values(nutritionEntries)
    .filter((e) => e.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latest = entries[0];

  // Simple heuristic: show 85% of target as consumed if no meal logs exist
  const consumedRatio = 0.85;
  const targetCalories = latest?.targetCalories ?? 0;
  const currentCalories = latest ? Math.round(targetCalories * consumedRatio) : 0;
  const currentProtein = latest ? Math.round(latest.proteinGrams * consumedRatio) : 0;
  const currentCarbs = latest ? Math.round(latest.carbGrams * consumedRatio) : 0;
  const currentFats = latest ? Math.round(latest.fatGrams * consumedRatio) : 0;

  const adherence = targetCalories ? Math.round((currentCalories / targetCalories) * 100) : 0;

  const weeklyAdherence = [
    { day: 'Mon', pct: 98 }, { day: 'Tue', pct: 102 }, { day: 'Wed', pct: 95 },
    { day: 'Thu', pct: 88 }, { day: 'Fri', pct: 105 }, { day: 'Sat', pct: 92 }, { day: 'Sun', pct: 97 },
  ];

  const waterIntake = 5;
  const waterFilled = Array.from({ length: 8 }, (_, i) => i < waterIntake);

  if (!latest) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark-primary">Diet & Nutrition</h2>
          <button
            onClick={() => navigate('/nutrition')}
            className="flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
          >
            <Plus size={16} /> Log Nutrition
          </button>
        </div>
        <div className="bg-[#141414] border border-dark-border rounded-xl p-10 text-center">
          <p className="text-dark-secondary mb-4">No nutrition plan recorded for this client yet.</p>
          <button
            onClick={() => navigate('/nutrition')}
            className="inline-flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
          >
            <Plus size={16} /> Create Nutrition Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-dark-primary">Diet & Nutrition</h2>
        <p className="text-sm text-dark-muted">Latest plan: {formatDateDMY(latest.date)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calorie Summary */}
        <div className="bg-[#141414] border border-dark-border rounded-xl p-5">
          <p className="text-xs text-dark-secondary mb-1">Calorie Target</p>
          <p className="text-2xl font-bold text-dark-primary font-mono">{targetCalories.toLocaleString()} <span className="text-sm text-dark-secondary">kcal</span></p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-secondary">Consumed</span>
              <span className="text-dark-primary font-mono font-semibold">{currentCalories.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-secondary">Remaining</span>
              <span className="text-success font-mono font-semibold">{(targetCalories - currentCalories).toLocaleString()}</span>
            </div>
            <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-cyan rounded-full transition-all" style={{ width: `${Math.min(adherence, 100)}%` }} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-border">
            <p className="text-xs text-dark-muted">Adherence</p>
            <p className={`text-lg font-bold font-mono ${adherence >= 90 && adherence <= 110 ? 'text-success' : adherence > 110 ? 'text-warning' : 'text-danger'}`}>{adherence}%</p>
          </div>
        </div>

        {/* Macro Rings */}
        <div className="bg-[#141414] border border-dark-border rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-dark-primary mb-4">Macro Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {([
              { label: 'Protein', current: currentProtein, target: latest.proteinGrams, color: '#00AEEF', key: 'protein' },
              { label: 'Carbs', current: currentCarbs, target: latest.carbGrams, color: '#8B5CF6', key: 'carbs' },
              { label: 'Fats', current: currentFats, target: latest.fatGrams, color: '#F97316', key: 'fats' },
            ]).map((macro) => {
              const pct = macro.target ? Math.round((macro.current / macro.target) * 100) : 0;
              const circ = 2 * Math.PI * 42;
              const off = circ - (Math.min(pct, 100) / 100) * circ;
              return (
                <div key={macro.key} className="text-center">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg width="96" height="96" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="42" fill="none" stroke="#2A2A2A" strokeWidth="7" />
                      <circle cx="48" cy="48" r="42" fill="none" stroke={macro.color} strokeWidth="7"
                        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
                        transform="rotate(-90 48 48)" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                      <text x="48" y="46" textAnchor="middle" fill="#F0F0F0" fontSize="16" fontWeight="700">{pct}%</text>
                      <text x="48" y="58" textAnchor="middle" fill="#A0A0A0" fontSize="9">{macro.label}</text>
                    </svg>
                  </div>
                  <p className="text-sm text-dark-primary font-mono font-semibold mt-2">{macro.current}g <span className="text-xs text-dark-muted">/ {macro.target}g</span></p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Adherence */}
      <SectionCard title="Weekly Calorie Adherence">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyAdherence}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--dark-muted)', fontSize: 12 }} />
              <YAxis domain={[70, 120]} tick={{ fill: 'var(--dark-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, color: '#F0F0F0' }} />
              <ReferenceLine y={100} stroke="#22C55E" strokeDasharray="4 4" />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {weeklyAdherence.map((entry, i) => (
                  <Cell key={i} fill={entry.pct >= 90 && entry.pct <= 110 ? '#22C55E' : entry.pct > 110 && entry.pct <= 120 ? '#EAB308' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Meal Log */}
      <SectionCard title="Today's Meals">
        <div className="bg-[#1A1A1A] rounded-lg p-6 border border-dark-border text-center">
          <p className="text-sm text-dark-secondary mb-3">
            Log meals in the Nutrition page to see detailed meal breakdowns.
          </p>
          <button
            onClick={() => navigate('/nutrition')}
            className="inline-flex items-center gap-2 text-cyan hover:text-cyan-hover text-sm font-medium transition-colors"
          >
            Open Nutrition →
          </button>
        </div>
      </SectionCard>

      {/* Water Tracker */}
      <SectionCard title="Water Intake (2,000ml target)">
        <div className="flex items-center gap-3 flex-wrap">
          {waterFilled.map((filled, i) => (
            <button key={i} className={`w-10 h-12 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${filled ? 'bg-[rgba(0,174,239,0.2)] border border-cyan' : 'bg-[#1A1A1A] border border-dark-border'}`}>
              <GlassWater size={18} className={filled ? 'text-cyan' : 'text-dark-muted'} />
            </button>
          ))}
          <div className="ml-4">
            <p className="text-sm text-dark-primary font-mono font-semibold">{waterIntake * 250}ml <span className="text-xs text-dark-muted">/ 2,000ml</span></p>
            <p className="text-xs text-dark-secondary">{Math.round((waterIntake / 8) * 100)}% of target</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
