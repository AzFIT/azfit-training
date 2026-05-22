/**
 * ExerciseLibraryPage — Searchable, filterable exercise library with YouTube videos.
 * Route: /exercises
 * Displays all 200 exercises from the AzFIT Exercise Database.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Play, Shield, Flame, Dumbbell, AlertTriangle } from 'lucide-react';
import { EXERCISE_DATABASE, MUSCLE_GROUPS, EQUIPMENT_TYPES, type ExerciseData } from '@/lib/exercise-database';

/* ── Color helpers ────────────────────────────────────────── */

const MUSCLE_COLORS: Record<string, string> = {
  Chest: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  Back: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  Legs: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  Shoulders: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  Arms: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  Core: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  Glutes: 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
  Hamstrings: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
  Quadriceps: 'bg-lime-100 text-lime-700 dark:bg-lime-900/20 dark:text-lime-400',
  Calves: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

const TYPE_COLORS: Record<string, string> = {
  Compound: 'bg-[#00AEEF]/10 text-[#00AEEF]',
  Isolation: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  Isometric: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  Olympic: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  Plyo: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
};

function getMuscleColor(m: string) { return MUSCLE_COLORS[m] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'; }

/* ── Filter bar component ─────────────────────────────────── */

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 focus:border-[#00AEEF] outline-none"
      >
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ── Exercise Card ────────────────────────────────────────── */

function ExerciseCard({ exercise, index }: { exercise: ExerciseData; index: number }) {
  const [showSafety, setShowSafety] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const hasVideo = exercise.videoUrl && exercise.videoUrl !== 'PLACEHOLDER';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
      className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Video or Placeholder */}
      <div className="aspect-video bg-gray-100 dark:bg-[#0A0A0A] relative">
        {hasVideo ? (
          <iframe
            src={exercise.videoUrl.replace('watch?v=', 'embed/')}
            title={exercise.name}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
            <Play className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">Video coming soon</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name + Badges */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{exercise.name}</h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getMuscleColor(exercise.primaryMuscle)}`}>
            {exercise.primaryMuscle}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${DIFFICULTY_COLORS[exercise.difficulty] || 'bg-gray-100 text-gray-700'}`}>
            {exercise.difficulty}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${TYPE_COLORS[exercise.type] || 'bg-gray-100 text-gray-700'}`}>
            {exercise.type}
          </span>
          {exercise.met > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 flex items-center gap-1">
              <Flame className="w-3 h-3" /> MET {exercise.met}
            </span>
          )}
        </div>

        {/* Equipment + Secondary */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <Dumbbell className="w-3.5 h-3.5" />
          <span>{exercise.equipment}</span>
          {exercise.secondaryMuscle && (
            <>
              <span className="text-gray-300">|</span>
              <span>+ {exercise.secondaryMuscle}</span>
            </>
          )}
        </div>

        {/* Description */}
        <p className={`text-sm text-gray-600 dark:text-gray-400 mb-3 ${expanded ? '' : 'line-clamp-2'}`}>
          {exercise.description}
        </p>
        {exercise.description.length > 80 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-[#00AEEF] hover:underline mb-2">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Safety Notes */}
        {exercise.safetyNotes && (
          <div className="mt-2">
            <button
              onClick={() => setShowSafety(!showSafety)}
              className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700"
            >
              <Shield className="w-3.5 h-3.5" />
              {showSafety ? 'Hide' : 'Show'} safety notes
              <AlertTriangle className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showSafety && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 mt-2">
                    {exercise.safetyNotes}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main Page ────────────────────────────────────────────── */

export default function ExerciseLibraryPage() {
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const activeFilterCount = [muscleFilter, equipmentFilter, difficultyFilter, typeFilter].filter(Boolean).length;

  const filtered = useMemo(() => {
    return EXERCISE_DATABASE.filter((e) => {
      if (search) {
        const q = search.toLowerCase();
        if (!e.name.toLowerCase().includes(q) &&
            !e.primaryMuscle.toLowerCase().includes(q) &&
            !e.equipment.toLowerCase().includes(q) &&
            !e.description.toLowerCase().includes(q)) return false;
      }
      if (muscleFilter && e.primaryMuscle !== muscleFilter) return false;
      if (equipmentFilter && e.equipment !== equipmentFilter) return false;
      if (difficultyFilter && e.difficulty !== difficultyFilter) return false;
      if (typeFilter && e.type !== typeFilter) return false;
      return true;
    });
  }, [search, muscleFilter, equipmentFilter, difficultyFilter, typeFilter]);

  const clearFilters = () => {
    setSearch('');
    setMuscleFilter('');
    setEquipmentFilter('');
    setDifficultyFilter('');
    setTypeFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise Library</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filtered.length} of {EXERCISE_DATABASE.length} exercises
                {activeFilterCount > 0 && <span className="text-[#00AEEF]"> (filtered)</span>}
              </p>
            </div>
            {/* Search */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-sm text-gray-700 dark:text-gray-300 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-4 items-center">
            <FilterSelect label="Muscle" value={muscleFilter} onChange={setMuscleFilter} options={MUSCLE_GROUPS} />
            <FilterSelect label="Equipment" value={equipmentFilter} onChange={setEquipmentFilter} options={EQUIPMENT_TYPES} />
            <FilterSelect label="Difficulty" value={difficultyFilter} onChange={setDifficultyFilter} options={['Beginner', 'Intermediate', 'Advanced']} />
            <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={['Compound', 'Isolation', 'Isometric', 'Olympic', 'Plyo']} />
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-[#00AEEF] hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No exercises match your filters.</p>
            <button onClick={clearFilters} className="text-sm text-[#00AEEF] hover:underline mt-2">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((exercise, i) => (
              <ExerciseCard key={exercise.exerciseId} exercise={exercise} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
