/**
 * OnboardingPage - 7-step wizard for client onboarding
 * Steps: Preferences -> Goals -> Body Comp -> Workout -> Lifestyle -> PAR-Q -> Celebration
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Scale,
  Dumbbell,
  Gauge,
  Heart,
  Move,
  Zap,
  Activity,
  Bandage,
  RotateCcw,
  Trophy,
  Moon,
  Brain,
  Apple,
  Droplets,
  Footprints,
  BatteryCharging,
  Target,
  Check,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

/* ─── Types ─── */
interface OnboardingData {
  units: 'metric' | 'imperial';
  dateFormat: string;
  timeFormat: '24-hour' | '12-hour';
  language: string;
  goals: string[];
  phases: number;
  height: string;
  weight: string;
  bodyFat: string;
  targetWeight: string;
  experience: string;
  daysPerWeek: number;
  sessionLength: string;
  preferredTimes: string[];
  equipment: string[];
  lifestyle: Record<string, number>;
  parq: boolean[];
  parqAck: boolean;
}

const defaultData: OnboardingData = {
  units: 'metric',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24-hour',
  language: 'English',
  goals: [],
  phases: 2,
  height: '',
  weight: '',
  bodyFat: '',
  targetWeight: '',
  experience: '',
  daysPerWeek: 3,
  sessionLength: '60 min',
  preferredTimes: [],
  equipment: [],
  lifestyle: { sleep: 5, stress: 5, nutrition: 5, hydration: 5, activity: 5, recovery: 5, consistency: 5 },
  parq: [false, false, false, false, false, false, false],
  parqAck: false,
};

const goalOptions = [
  { key: 'weight_loss', label: 'Weight Loss', icon: Scale, desc: 'Reduce body fat and overall weight' },
  { key: 'muscle_gain', label: 'Muscle Gain', icon: Dumbbell, desc: 'Build lean muscle mass' },
  { key: 'strength', label: 'Strength', icon: Gauge, desc: 'Increase lifting capacity' },
  { key: 'endurance', label: 'Endurance', icon: Heart, desc: 'Improve cardiovascular fitness' },
  { key: 'flexibility', label: 'Flexibility', icon: Move, desc: 'Enhance mobility and range' },
  { key: 'athletic', label: 'Athletic Performance', icon: Zap, desc: 'Sport-specific conditioning' },
  { key: 'general', label: 'General Fitness', icon: Activity, desc: 'Overall health and wellness' },
  { key: 'rehab', label: 'Rehabilitation', icon: Bandage, desc: 'Recovery from injury' },
  { key: 'recomp', label: 'Body Recomposition', icon: RotateCcw, desc: 'Fat loss + muscle gain simultaneously' },
  { key: 'competition', label: 'Competition Prep', icon: Trophy, desc: 'Prepare for fitness events' },
];

const lifestyleCategories = [
  { key: 'sleep', label: 'Sleep Quality', low: 'Insomnia', high: 'Excellent sleep', icon: Moon },
  { key: 'stress', label: 'Stress Level', low: 'Very stressed', high: 'Stress-free', icon: Brain },
  { key: 'nutrition', label: 'Nutrition Habits', low: 'Poor diet', high: 'Optimal nutrition', icon: Apple },
  { key: 'hydration', label: 'Hydration', low: 'Rarely drink water', high: 'Well hydrated', icon: Droplets },
  { key: 'activity', label: 'Daily Activity', low: 'Sedentary', high: 'Very active', icon: Footprints },
  { key: 'recovery', label: 'Recovery', low: 'Never rest', high: 'Prioritize recovery', icon: BatteryCharging },
  { key: 'consistency', label: 'Consistency', low: 'Inconsistent', high: 'Highly consistent', icon: Target },
];

const parqQuestions = [
  'Has a doctor ever said you have a heart condition?',
  'Do you feel pain in your chest during physical activity?',
  'Have you had chest pain when not exercising in the past month?',
  'Do you lose balance due to dizziness or lose consciousness?',
  'Do you have a bone or joint problem that could be worsened by exercise?',
  'Is your doctor currently prescribing medication for blood pressure or heart condition?',
  'Do you know of any other reason why you should not exercise?',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [direction, setDirection] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);

  /* Save progress */
  useEffect(() => {
    localStorage.setItem('azfit_onboarding_progress', JSON.stringify({ step, data }));
  }, [step, data]);

  /* Restore on mount */
  useEffect(() => {
    const saved = localStorage.getItem('azfit_onboarding_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.data) setData((d) => ({ ...d, ...parsed.data }));
        if (parsed.step) setStep(parsed.step);
      } catch { /* ignore */ }
    }
  }, []);

  const update = (partial: Partial<OnboardingData>) => setData((d) => ({ ...d, ...partial }));

  const canContinue = () => {
    switch (step) {
      case 1: return !!data.units;
      case 2: return data.goals.length > 0;
      case 3: return !!data.height && !!data.weight;
      case 4: return !!data.experience && data.daysPerWeek > 0;
      case 5: return true;
      case 6: return data.parq.every((v) => v !== undefined) && data.parqAck;
      default: return true;
    }
  };

  const next = () => {
    if (step < 7) { setDirection(1); setStep((s) => s + 1); }
    else { localStorage.removeItem('azfit_onboarding_progress'); navigate('/trainer/dashboard'); }
  };
  const prev = () => { if (step > 1) { setDirection(-1); setStep((s) => s - 1); } };

  const progress = (step / 7) * 100;

  /* ─── Confetti on step 7 ─── */
  useEffect(() => {
    if (step === 7) {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 4,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00AEEF', '#C0C0C0', '#FFFFFF', '#33BFF2'],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [step]);

  /* ─── Render Steps ─── */
  const renderStep = () => {
    switch (step) {
      /* ── Step 1: Units & Preferences ── */
      case 1:
        return (
          <div className="space-y-6">
            {[
              { label: 'Measurement System', key: 'units' as const, options: [
                { val: 'metric', label: 'Metric (kg, cm)' },
                { val: 'imperial', label: 'Imperial (lbs, ft/in)' },
              ]},
            ].map((group) => (
              <div key={group.key}>
                <label className="text-caption font-medium text-gray-700 mb-2 block">{group.label}</label>
                <div className="flex gap-3">
                  {group.options.map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => update({ [group.key]: opt.val } as any)}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        (data as any)[group.key] === opt.val
                          ? 'bg-[#00AEEF] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="text-caption font-medium text-gray-700 mb-2 block">Date Format</label>
              <select
                value={data.dateFormat}
                onChange={(e) => update({ dateFormat: e.target.value })}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] outline-none"
              >
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="text-caption font-medium text-gray-700 mb-2 block">Time Format</label>
              <div className="flex gap-3">
                {['24-hour', '12-hour'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => update({ timeFormat: fmt as '24-hour' | '12-hour' })}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      data.timeFormat === fmt ? 'bg-[#00AEEF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-caption font-medium text-gray-700 mb-2 block">Language</label>
              <select
                value={data.language}
                onChange={(e) => update({ language: e.target.value })}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] outline-none"
              >
                <option>English</option>
                <option>Chinese</option>
              </select>
            </div>
          </div>
        );

      /* ── Step 2: Goals ── */
      case 2:
        return (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goalOptions.map((g) => {
                const selected = data.goals.includes(g.key);
                return (
                  <button
                    key={g.key}
                    onClick={() => {
                      const newGoals = selected
                        ? data.goals.filter((k) => k !== g.key)
                        : [...data.goals, g.key];
                      update({ goals: newGoals });
                    }}
                    className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      selected
                        ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.05)]'
                        : 'border-transparent bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    {selected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-[#00AEEF] rounded-full flex items-center justify-center"
                      >
                        <Check size={12} className="text-white" />
                      </motion.span>
                    )}
                    <g.icon size={22} className="text-gray-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{g.label}</p>
                      <p className="text-xs text-gray-500">{g.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {data.goals.length === 0 && (
              <p className="text-caption text-danger mt-2">Select at least one goal</p>
            )}

            <div className="mt-6">
              <label className="text-caption font-medium text-gray-700 mb-2 block">
                Training phases preference: {data.phases} {data.phases === 1 ? '(Single Focus)' : data.phases === 4 ? '(Periodized)' : ''}
              </label>
              <input
                type="range"
                min={1}
                max={4}
                value={data.phases}
                onChange={(e) => update({ phases: parseInt(e.target.value) })}
                className="w-full accent-[#00AEEF]"
              />
              <div className="flex justify-between text-caption text-gray-400 mt-1">
                <span>Single Focus</span>
                <span>Periodized</span>
              </div>
            </div>
          </div>
        );

      /* ── Step 3: Body Composition ── */
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-caption font-medium text-gray-700 mb-1 block">Height ({data.units === 'metric' ? 'cm' : 'ft/in'})</label>
              <input
                type="text"
                value={data.height}
                onChange={(e) => update({ height: e.target.value })}
                placeholder={data.units === 'metric' ? '175' : '5\'9"'}
                className="w-full py-3 px-4 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] outline-none"
              />
            </div>
            <div>
              <label className="text-caption font-medium text-gray-700 mb-1 block">Current Weight ({data.units === 'metric' ? 'kg' : 'lbs'})</label>
              <input
                type="text"
                value={data.weight}
                onChange={(e) => update({ weight: e.target.value })}
                placeholder={data.units === 'metric' ? '70' : '154'}
                className="w-full py-3 px-4 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] outline-none"
              />
            </div>
            <div>
              <label className="text-caption font-medium text-gray-700 mb-1 block">Body Fat % (optional)</label>
              <input
                type="text"
                value={data.bodyFat}
                onChange={(e) => update({ bodyFat: e.target.value })}
                placeholder="If known from recent assessment"
                className="w-full py-3 px-4 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] outline-none"
              />
              <p className="text-caption text-gray-400 mt-1">If known from recent assessment</p>
            </div>
            <div>
              <label className="text-caption font-medium text-gray-700 mb-1 block">Target Weight (optional)</label>
              <input
                type="text"
                value={data.targetWeight}
                onChange={(e) => update({ targetWeight: e.target.value })}
                placeholder={data.units === 'metric' ? '65' : '143'}
                className="w-full py-3 px-4 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] outline-none"
              />
            </div>

            {/* Photo upload placeholder */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#00AEEF] transition-colors cursor-pointer">
              <Camera size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Upload progress photos</p>
              <p className="text-caption text-gray-400">Front, side, and back views</p>
            </div>
          </div>
        );

      /* ── Step 4: Workout Preferences ── */
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-caption font-medium text-gray-700 mb-2 block">Training Experience</label>
              <div className="space-y-2">
                {[
                  { key: 'beginner', title: 'Beginner', desc: 'New to structured training' },
                  { key: 'intermediate', title: 'Intermediate', desc: '6+ months consistent training' },
                  { key: 'advanced', title: 'Advanced', desc: '2+ years, know your way around' },
                ].map((exp) => (
                  <button
                    key={exp.key}
                    onClick={() => update({ experience: exp.key })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      data.experience === exp.key
                        ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.05)]'
                        : 'border-transparent bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                    <p className="text-xs text-gray-500">{exp.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-caption font-medium text-gray-700 mb-2 block">
                Days per week: {data.daysPerWeek}
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={data.daysPerWeek}
                onChange={(e) => update({ daysPerWeek: parseInt(e.target.value) })}
                className="w-full accent-[#00AEEF]"
              />
              <div className="flex justify-between text-caption text-gray-400 mt-1">
                <span>1 day</span>
                <span>7 days</span>
              </div>
            </div>

            <div>
              <label className="text-caption font-medium text-gray-700 mb-2 block">Session Duration</label>
              <div className="flex flex-wrap gap-2">
                {['30 min', '45 min', '60 min', '90 min'].map((len) => (
                  <button
                    key={len}
                    onClick={() => update({ sessionLength: len })}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                      data.sessionLength === len
                        ? 'bg-[#00AEEF] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-caption font-medium text-gray-700 mb-2 block">Preferred Time</label>
              <div className="flex flex-wrap gap-2">
                {['Early Morning', 'Morning', 'Midday', 'Afternoon', 'Evening'].map((time) => {
                  const selected = data.preferredTimes.includes(time);
                  return (
                    <button
                      key={time}
                      onClick={() => {
                        const newTimes = selected
                          ? data.preferredTimes.filter((t) => t !== time)
                          : [...data.preferredTimes, time];
                        update({ preferredTimes: newTimes });
                      }}
                      className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                        selected ? 'bg-[#00AEEF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-caption font-medium text-gray-700 mb-2 block">Gym Equipment Access</label>
              <div className="space-y-2">
                {['Full gym', 'Dumbbells only', 'Home gym (limited)', 'Bodyweight only', 'Resistance bands'].map((eq) => {
                  const selected = data.equipment.includes(eq);
                  return (
                    <label key={eq} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          const newEq = selected
                            ? data.equipment.filter((e) => e !== eq)
                            : [...data.equipment, eq];
                          update({ equipment: newEq });
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-[#00AEEF] focus:ring-[#00AEEF]"
                      />
                      <span className="text-sm text-gray-700">{eq}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        );

      /* ── Step 5: Lifestyle ── */
      case 5:
        return (
          <div className="space-y-6">
            {lifestyleCategories.map((cat, i) => {
              const value = data.lifestyle[cat.key] ?? 5;
              const Icon = cat.icon;
              const pct = value * 10;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                    <span className="ml-auto font-mono text-data-sm text-[#00AEEF]">{value}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={value}
                    onChange={(e) =>
                      update({
                        lifestyle: { ...data.lifestyle, [cat.key]: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-[#00AEEF]"
                  />
                  {/* Gradient fill bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden -mt-2 mb-1 relative pointer-events-none">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, #EF4444 0%, #EAB308 50%, #22C55E 100%)`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-caption text-gray-400">
                    <span>{cat.low}</span>
                    <span>{cat.high}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );

      /* ── Step 6: PAR-Q ── */
      case 6:
        const anyYes = data.parq.some((v) => v === true);
        return (
          <div className="space-y-4">
            {parqQuestions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <p className="text-sm text-gray-800 flex-1">{q}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const newParq = [...data.parq];
                      newParq[i] = false;
                      update({ parq: newParq });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      data.parq[i] === false
                        ? 'bg-success text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    No
                  </button>
                  <button
                    onClick={() => {
                      const newParq = [...data.parq];
                      newParq[i] = true;
                      update({ parq: newParq });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      data.parq[i] === true
                        ? 'bg-danger text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
              {anyYes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-warning-light rounded-xl flex items-start gap-3"
                >
                  <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-warning">
                    Please consult with your doctor before beginning any exercise program.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={data.parqAck}
                onChange={(e) => update({ parqAck: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#00AEEF] focus:ring-[#00AEEF]"
              />
              <span className="text-body-sm text-gray-600">
                I have answered these questions honestly and to the best of my knowledge.
              </span>
            </label>
          </div>
        );

      /* ── Step 7: Celebration ── */
      case 7:
        return (
          <div className="text-center py-8">
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.05, 1] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full border-[3px] border-success flex items-center justify-center"
            >
              <motion.svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke="#22C55E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                />
              </motion.svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="font-playfair text-display-md text-white mb-3"
            >
              You&apos;re All Set!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="text-body-lg text-gray-300 mb-8"
            >
              Your profile is complete. Let&apos;s start training.
            </motion.p>

            {/* Summary card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
              className="glass-card rounded-2xl p-6 text-left max-w-sm mx-auto mb-8"
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Goals</span>
                  <span className="text-sm text-white font-medium">{data.goals.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Weight</span>
                  <span className="text-sm text-white font-medium">{data.weight} {data.units === 'metric' ? 'kg' : 'lbs'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Training days</span>
                  <span className="text-sm text-white font-medium">{data.daysPerWeek}/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Lifestyle avg</span>
                  <span className="text-sm text-white font-medium">
                    {(Object.values(data.lifestyle).reduce((a, b) => a + b, 0) / 7).toFixed(1)}/10
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              onClick={() => { localStorage.removeItem('azfit_onboarding_progress'); navigate('/trainer/dashboard'); }}
              className="btn-primary px-10 py-4 text-lg animate-pulseGlow"
            >
              Go to Dashboard
            </motion.button>
          </div>
        );

      default:
        return null;
    }
  };

  /* ─── Main Render ─── */
  const stepTitles = [
    '',
    "Let's Set Your Preferences",
    'What Are Your Fitness Goals?',
    'Body Composition Assessment',
    'Workout Preferences',
    'Lifestyle Assessment',
    'Health Screening',
    "You're All Set!",
  ];
  const stepDescs = [
    '',
    'Choose your preferred units and basic settings for the app.',
    'Select all that apply. This helps your trainer design the perfect program.',
    'Enter your current measurements for baseline tracking.',
    'Tell us about your training experience and schedule.',
    'Understanding your lifestyle helps us optimize your program. Rate each area honestly.',
    'The Physical Activity Readiness Questionnaire ensures it\'s safe for you to begin training.',
    'Welcome to AzFIT. Your fitness journey starts now.',
  ];

  const isCelebration = step === 7;

  return (
    <div className={`${isCelebration ? 'bg-[#0A0A0A] min-h-[100dvh]' : 'bg-gray-50 min-h-[100dvh]'} flex flex-col`}>
      {/* Progress Bar */}
      {!isCelebration && (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#141414]/80 backdrop-blur-lg border-b border-gray-200 dark:border-white/5">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
            {step > 1 && (
              <button onClick={prev} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors shrink-0">
                <ChevronLeft size={18} /> Back
              </button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      s < step ? 'bg-success' : s === step ? 'bg-[#00AEEF]' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider">
                <span>Step {step} of 7</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 flex flex-col ${isCelebration ? '' : 'max-w-3xl mx-auto w-full px-4 py-8'}`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            ref={contentRef}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.3 }}
            className={isCelebration ? 'flex-1 flex items-center justify-center px-4' : 'max-w-[640px] mx-auto w-full'}
          >
            {!isCelebration && (
              <div className="mb-8">
                <span className="inline-block px-3 py-1 bg-[#00AEEF] text-white text-caption font-medium rounded-full mb-3">
                  Step {step} of 7
                </span>
                <h2 className="text-display-md text-gray-900 dark:text-white">{stepTitles[step]}</h2>
                <p className="text-body-md text-gray-500 mt-1 max-w-[480px]">{stepDescs[step]}</p>
              </div>
            )}
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Action Bar */}
        {!isCelebration && (
          <div className="max-w-[640px] mx-auto w-full mt-8 pb-8 flex items-center justify-between">
            {step >= 3 && step <= 5 ? (
              <button onClick={next} className="text-sm text-gray-500 hover:text-[#00AEEF] font-medium transition-colors">
                Skip for now
              </button>
            ) : <div />}
            <button
              onClick={next}
              disabled={!canContinue()}
              className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 6 ? 'Complete' : 'Save & Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
