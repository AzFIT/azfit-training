import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Target,
  Calendar,
  Zap,
  User,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Flame,
  Wind,
  HeartPulse,
  Award,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Eye,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAppDataStore } from '../stores/useAppDataStore'
// Program type used implicitly via toMatchableProgram
import {
  findTopMatches,
  loadMatchingRules,
  toMatchableProgram,
  type ClientPreferences,
  type MatchResult,
} from '../lib/programMatcher'

// ── Question Config ─────────────────────────────────────────────
const GOAL_OPTIONS = [
  { id: 'Lose Weight', label: 'Lose Weight', icon: Flame, color: '#EF4444', desc: 'Reduce body fat while preserving muscle' },
  { id: 'Build Muscle', label: 'Build Muscle', icon: Dumbbell, color: '#8B5CF6', desc: 'Increase lean muscle mass and size' },
  { id: 'Strength', label: 'Strength', icon: Zap, color: '#00AEEF', desc: 'Maximize force production and power' },
  { id: 'Hypertrophy', label: 'Hypertrophy', icon: TrendingUp, color: '#A855F7', desc: 'Build muscle size and proportions' },
  { id: 'Endurance', label: 'Endurance', icon: Wind, color: '#F59E0B', desc: 'Improve aerobic and muscular endurance' },
  { id: 'Fat Loss', label: 'Fat Loss', icon: Flame, color: '#22C55E', desc: 'High-metabolic training for fat burning' },
  { id: 'General Fitness', label: 'General Fitness', icon: HeartPulse, color: '#6B7280', desc: 'Balanced fitness for everyday health' },
  { id: 'Sports Performance', label: 'Sports Performance', icon: Award, color: '#EAB308', desc: 'Sport-specific strength and conditioning' },
]

const EXPERIENCE_OPTIONS = [
  { id: 'Beginner', label: 'Beginner', desc: 'New to structured training (< 1 year)' },
  { id: 'Intermediate', label: 'Intermediate', desc: 'Consistent training (1–3 years)' },
  { id: 'Advanced', label: 'Advanced', desc: 'Experienced athlete (3+ years)' },
]

const EQUIPMENT_OPTIONS = [
  { id: 'Full Gym', label: 'Full Gym', desc: 'Barbells, machines, cables, racks' },
  { id: 'Dumbbells Only', label: 'Dumbbells Only', desc: 'Dumbbells and bench only' },
  { id: 'Minimal', label: 'Minimal', desc: 'Bands, bodyweight, minimal gear' },
  { id: 'Bodyweight', label: 'Bodyweight', desc: 'No equipment needed' },
]

const DAYS_OPTIONS = [2, 3, 4, 5, 6]

const TIME_OPTIONS = [30, 45, 60, 75, 90, 120]

// ── Question Card ───────────────────────────────────────────────
function QuestionCard({
  icon: Icon,
  label,
  desc,
  color,
  selected,
  onClick,
}: {
  icon: React.ElementType
  label: string
  desc: string
  color: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all w-full ${
        selected
          ? 'border-cyan/50 bg-cyan/5 ring-1 ring-cyan/20'
          : 'border-dark-border bg-navy hover:border-dark-hover'
      }`}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-dark-primary font-semibold text-sm">{label}</div>
        <div className="text-dark-muted text-xs mt-0.5">{desc}</div>
      </div>
      {selected && (
        <CheckCircle2 size={18} className="text-cyan ml-auto flex-shrink-0" />
      )}
    </motion.button>
  )
}

// ── Match Score Badge ───────────────────────────────────────────
function ScoreBadge({ percentage }: { percentage: number }) {
  const color = percentage >= 90 ? '#22C55E' : percentage >= 70 ? '#F59E0B' : '#EF4444'
  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#2A2A2A"
          strokeWidth={3}
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray={`${percentage}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-dark-primary font-bold text-xs">{percentage}%</span>
      </div>
    </div>
  )
}

// ── Match Result Card ───────────────────────────────────────────
function MatchResultCard({
  result,
  rank,
  onPreview,
}: {
  result: MatchResult
  rank: number
  onPreview: () => void
}) {
  const d = result.program.data
  const goalColors: Record<string, string> = {
    strength: 'from-cyan to-[#008DC4]',
    hypertrophy: 'from-[#8B5CF6] to-[#7C4FE4]',
    fatloss: 'from-success to-[#1EAD4E]',
    endurance: 'from-warning to-[#D97706]',
    rehab: 'from-[#6B7280] to-[#4B5563]',
    power: 'from-[#EAB308] to-[#CA8A04]',
  }
  const gradient = goalColors[d.goal?.toLowerCase()] || 'from-cyan to-[#A855F7]'
  const activeDays = d.days?.length || d.split?.filter(s => s.active).length || 0
  const totalExercises = d.exercises?.length || 0
  const isTop = rank === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`rounded-xl border overflow-hidden ${
        isTop
          ? 'border-cyan/30 bg-gradient-to-b from-cyan/5 to-transparent'
          : 'border-dark-border bg-navy'
      }`}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isTop && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan/10 text-cyan font-bold">
                  BEST MATCH
                </span>
              )}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-surface text-dark-muted">
                {d.template || 'Custom'}
              </span>
            </div>
            <h3 className="text-dark-primary font-semibold text-base">{d.programName}</h3>
            <p className="text-dark-muted text-xs mt-0.5 line-clamp-2">{d.description}</p>
          </div>
          <ScoreBadge percentage={result.percentage} />
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-dark-surface rounded-lg p-2 text-center border border-dark-border">
            <div className="text-dark-primary font-mono font-bold text-sm">{activeDays}d</div>
            <div className="text-dark-muted text-[10px]">Duration</div>
          </div>
          <div className="bg-dark-surface rounded-lg p-2 text-center border border-dark-border">
            <div className={`font-mono font-bold text-sm ${result.exactDayMatch ? 'text-success' : 'text-dark-primary'}`}>
              {activeDays}<span className="text-dark-muted text-[10px]">/wk</span>
            </div>
            <div className="text-dark-muted text-[10px]">Days</div>
          </div>
          <div className="bg-dark-surface rounded-lg p-2 text-center border border-dark-border">
            <div className="text-dark-primary font-mono font-bold text-sm">{totalExercises}</div>
            <div className="text-dark-muted text-[10px]">Exercises</div>
          </div>
          <div className="bg-dark-surface rounded-lg p-2 text-center border border-dark-border">
            <div className="text-dark-primary font-mono font-bold text-sm">{d.totalSets || '—'}</div>
            <div className="text-dark-muted text-[10px]">Sets</div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="space-y-1 mb-3">
          {[
            { label: 'Goal', score: result.breakdown.goalScore },
            { label: 'Days', score: result.breakdown.daysScore },
            { label: 'Experience', score: result.breakdown.experienceScore },
            { label: 'Equipment', score: result.breakdown.equipmentScore },
            { label: 'Time', score: result.breakdown.timeScore },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-[10px] text-dark-muted w-20">{item.label}</span>
              <div className="flex-1 h-1.5 bg-dark-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan/60"
                  style={{ width: `${Math.round(item.score * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-dark-secondary w-8 text-right">{Math.round(item.score * 100)}%</span>
            </div>
          ))}
        </div>

        {/* Phase pills */}
        {(d.phases ?? []).filter(p => p.active).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(d.phases ?? []).filter(p => p.active).map(p => (
              <span
                key={p.id}
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ backgroundColor: `${p.color}15`, color: p.color }}
              >
                {p.name} ({p.weeks}w)
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-dark-border">
          <Button
            onClick={onPreview}
            variant="outline"
            size="sm"
            className="flex-1 h-9 px-3 border-dark-border text-dark-secondary hover:text-cyan hover:border-cyan/30 bg-transparent text-xs"
          >
            <Eye size={13} className="mr-1.5" />
            View Program
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ───────────────────────────────────────────────────
export default function ProgramMatcherPage() {
  const navigate = useNavigate()
  const programs = Object.values(useAppDataStore().programs)
  const [step, setStep] = useState(0)
  const [prefs, setPrefs] = useState<ClientPreferences>({
    goal: '',
    daysPerWeek: 3,
    experience: '',
    equipment: '',
    timePerSession: 60,
  })
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadMatchingRules().then(() => setLoaded(true))
  }, [])

  const updatePref = useCallback(<K extends keyof ClientPreferences>(key: K, value: ClientPreferences[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }))
  }, [])

  const canProceed = useMemo(() => {
    if (step === 0) return !!prefs.goal
    if (step === 1) return !!prefs.experience
    if (step === 2) return !!prefs.equipment
    return true
  }, [step, prefs])

  const handleFindMatches = useCallback(async () => {
    setLoading(true)
    const matchable = programs.map(toMatchableProgram)
    const top = await findTopMatches(prefs, matchable, 3)
    setResults(top)
    setStep(4)
    setLoading(false)
  }, [prefs, programs])

  const steps = [
    { label: 'Goal', icon: Target },
    { label: 'Experience', icon: User },
    { label: 'Equipment', icon: Layers },
    { label: 'Schedule', icon: Calendar },
  ]

  return (
    <div className="w-full max-w-[900px] mx-auto py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan to-[#A855F7] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_20px_rgba(0,174,239,0.3)]">
          <Sparkles size={28} className="text-white" />
        </div>
        <h1 className="text-dark-primary text-2xl font-bold">Smart Program Matcher</h1>
        <p className="text-dark-muted text-sm mt-1">
          Answer 4 questions and we'll find the perfect program from your library.
        </p>
      </div>

      {/* Step indicator */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  i === step
                    ? 'bg-cyan/10 text-cyan border border-cyan/30'
                    : i < step
                    ? 'bg-success/10 text-success'
                    : 'bg-dark-surface text-dark-muted'
                }`}
              >
                <s.icon size={12} />
                {s.label}
              </div>
              {i < steps.length - 1 && (
                <ChevronRight size={14} className="text-dark-border" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-dark-primary text-lg font-semibold mb-1">What is your primary goal?</h2>
            <p className="text-dark-muted text-sm mb-4">Select the outcome you want to achieve.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOAL_OPTIONS.map(opt => (
                <QuestionCard
                  key={opt.id}
                  icon={opt.icon}
                  label={opt.label}
                  desc={opt.desc}
                  color={opt.color}
                  selected={prefs.goal === opt.id}
                  onClick={() => updatePref('goal', opt.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="experience"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-dark-primary text-lg font-semibold mb-1">What is your experience level?</h2>
            <p className="text-dark-muted text-sm mb-4">This helps us match the right intensity and complexity.</p>
            <div className="grid grid-cols-1 gap-3">
              {EXPERIENCE_OPTIONS.map(opt => (
                <QuestionCard
                  key={opt.id}
                  icon={User}
                  label={opt.label}
                  desc={opt.desc}
                  color="#00AEEF"
                  selected={prefs.experience === opt.id}
                  onClick={() => updatePref('experience', opt.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="equipment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-dark-primary text-lg font-semibold mb-1">What equipment do you have access to?</h2>
            <p className="text-dark-muted text-sm mb-4">We'll match programs that fit your setup.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EQUIPMENT_OPTIONS.map(opt => (
                <QuestionCard
                  key={opt.id}
                  icon={Layers}
                  label={opt.label}
                  desc={opt.desc}
                  color="#8B5CF6"
                  selected={prefs.equipment === opt.id}
                  onClick={() => updatePref('equipment', opt.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-dark-primary text-lg font-semibold mb-1">How often and for how long can you train?</h2>
            <p className="text-dark-muted text-sm mb-4">We'll find programs that fit your schedule exactly.</p>

            {/* Days per week */}
            <div className="mb-6">
              <label className="text-dark-secondary text-sm font-medium mb-2 block">Days per week</label>
              <div className="flex gap-2">
                {DAYS_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => updatePref('daysPerWeek', d)}
                    className={`flex-1 h-12 rounded-xl border text-sm font-semibold transition-all ${
                      prefs.daysPerWeek === d
                        ? 'border-cyan bg-cyan/10 text-cyan'
                        : 'border-dark-border bg-navy text-dark-muted hover:border-dark-hover'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time per session */}
            <div className="mb-6">
              <label className="text-dark-secondary text-sm font-medium mb-2 block">Time per session</label>
              <div className="flex gap-2 flex-wrap">
                {TIME_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => updatePref('timePerSession', t)}
                    className={`h-10 px-4 rounded-xl border text-sm font-semibold transition-all ${
                      prefs.timePerSession === t
                        ? 'border-cyan bg-cyan/10 text-cyan'
                        : 'border-dark-border bg-navy text-dark-muted hover:border-dark-hover'
                    }`}
                  >
                    {t} min
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-navy border border-dark-border">
              <div className="text-dark-secondary text-xs font-semibold uppercase tracking-wider mb-2">Your Preferences</div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded bg-cyan/10 text-cyan font-medium">{prefs.goal}</span>
                <span className="text-xs px-2 py-1 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium">{prefs.experience}</span>
                <span className="text-xs px-2 py-1 rounded bg-success/10 text-success font-medium">{prefs.equipment}</span>
                <span className="text-xs px-2 py-1 rounded bg-warning/10 text-warning font-medium">{prefs.daysPerWeek} days/week</span>
                <span className="text-xs px-2 py-1 rounded bg-danger/10 text-danger font-medium">{prefs.timePerSession} min</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {loading ? (
              <div className="text-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-2 border-cyan border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-dark-muted text-sm">Analyzing programs...</p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-dark-primary text-lg font-semibold">Top Matches</h2>
                    <p className="text-dark-muted text-sm">
                      Found {results.filter(r => r.exactDayMatch).length} programs with exactly {prefs.daysPerWeek} days/week
                    </p>
                  </div>
                  <button
                    onClick={() => { setStep(0); setResults([]); }}
                    className="text-xs text-dark-muted hover:text-dark-primary flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={12} />
                    Start Over
                  </button>
                </div>

                <div className="space-y-4">
                  {results.map((result, i) => (
                    <MatchResultCard
                      key={result.program.id}
                      result={result}
                      rank={i}
                      onPreview={() => navigate(`/programs/library?highlight=${result.program.id}`)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <AlertTriangle size={40} className="text-warning mx-auto mb-4" />
                <h3 className="text-dark-primary font-semibold mb-1">No Matches Found</h3>
                <p className="text-dark-muted text-sm mb-4">Try adjusting your preferences for better results.</p>
                <Button onClick={() => setStep(0)} variant="outline" className="border-dark-border">
                  <RotateCcw size={14} className="mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="h-10 px-5 border-dark-border text-dark-secondary hover:text-dark-primary bg-transparent"
          >
            <ArrowLeft size={14} className="mr-2" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed}
              className="h-10 px-6 bg-gradient-to-r from-cyan to-[#A855F7] text-white font-semibold"
            >
              Next
              <ArrowRight size={14} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleFindMatches}
              disabled={!canProceed || loading || !loaded}
              className="h-10 px-6 bg-gradient-to-r from-cyan to-[#A855F7] text-white font-semibold"
            >
              {loading ? 'Matching...' : 'Find My Program'}
              <Sparkles size={14} className="ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
