/**
 * ProgramLibraryPage — Displays all 84 programs from the AzFIT Programs Library.
 * Route: /programs/library
 * Filterable by category, goal, difficulty. Shows business metrics.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, Plus, Star, TrendingUp, Users, DollarSign, Grid3X3, Dumbbell } from 'lucide-react';
import { PROGRAMS_LIBRARY, PROGRAM_CATEGORIES } from '@/lib/programs-library';

/* ── Constants ────────────────────────────────────────────── */

const GOAL_OPTIONS = [...new Set(PROGRAMS_LIBRARY.map((p) => p.goal))].sort();
const DIFFICULTY_OPTIONS = [...new Set(PROGRAMS_LIBRARY.map((p) => p.difficulty))].sort();

const GOAL_COLORS: Record<string, string> = {
  'Fat Loss': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  'Strength': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  'Hypertrophy': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  'General Fitness': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  'Weight Loss': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};
const DEFAULT_GOAL_COLOR = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  Elite: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  'All Levels': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  'Intermediate-Advanced': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
};

const CAT_COLORS: Record<string, string> = {
  'Strength Training': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  'Weight Loss': 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  'Sports-Specific': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  Functional: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  Hybrid: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  'Rehab/Prehab': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  'Performance Coaches': 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
};
const DEFAULT_CAT_COLOR = 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

/* ── Star Rating ──────────────────────────────────────────── */

function StarRating({ score }: { score: number }) {
  const stars = Math.min(5, Math.max(0, Math.round(score / 20)));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'}`} />
      ))}
    </div>
  );
}

/* ── Stats Card ───────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white dark:bg-[#141414] rounded-xl p-4 border border-gray-100 dark:border-white/5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────── */

export default function ProgramLibraryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [goalFilter, setGoalFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const activeCount = [categoryFilter, goalFilter, difficultyFilter].filter(Boolean).length;

  const filtered = useMemo(() => {
    return PROGRAMS_LIBRARY.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) &&
            !p.goal.toLowerCase().includes(q) &&
            !p.method.toLowerCase().includes(q) &&
            !p.category.toLowerCase().includes(q) &&
            !p.description.toLowerCase().includes(q)) return false;
      }
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (goalFilter && p.goal !== goalFilter) return false;
      if (difficultyFilter && p.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [search, categoryFilter, goalFilter, difficultyFilter]);

  // Stats
  const totalPrograms = PROGRAMS_LIBRARY.length;
  const totalCategories = new Set(PROGRAMS_LIBRARY.map((p) => p.category)).size;
  const avgAdherence = PROGRAMS_LIBRARY.reduce((s, p) => s + p.avgAdherencePct, 0) / totalPrograms;
  const totalRevenue = PROGRAMS_LIBRARY.reduce((s, p) => s + p.revenueHkd, 0);

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setGoalFilter('');
    setDifficultyFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Program Library</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filtered.length} of {totalPrograms} programs
                {activeCount > 0 && <span className="text-[#00AEEF]"> (filtered)</span>}
              </p>
            </div>
            <button
              onClick={() => navigate('/programs/design')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#33BFF2] text-white text-sm font-medium shadow-lg shadow-[#00AEEF]/25 hover:shadow-xl transition-shadow"
            >
              <Plus className="w-4 h-4" /> New Program
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Programs" value={String(totalPrograms)} icon={Grid3X3} color="bg-[#00AEEF]/10 text-[#00AEEF]" />
            <StatCard label="Categories" value={String(totalCategories)} icon={Dumbbell} color="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" />
            <StatCard label="Avg Adherence" value={`${avgAdherence.toFixed(1)}%`} icon={TrendingUp} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" />
            <StatCard label="Total Revenue" value={`$${(totalRevenue / 1000000).toFixed(2)}M`} icon={DollarSign} color="bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-sm focus:border-[#00AEEF] outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#1A1A1A]">
              <option value="">All Categories</option>
              {PROGRAM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={goalFilter} onChange={(e) => setGoalFilter(e.target.value)} className="text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#1A1A1A] max-w-[200px]">
              <option value="">All Goals</option>
              {GOAL_OPTIONS.slice(0, 30).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#1A1A1A]">
              <option value="">All Levels</option>
              {DIFFICULTY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {activeCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-[#00AEEF] hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Program Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No programs match your filters.</p>
            <button onClick={clearFilters} className="text-sm text-[#00AEEF] hover:underline mt-2">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((program, i) => (
              <motion.div
                key={program.programId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.4) }}
                className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-lg transition-shadow"
              >
                {/* Goal + Category badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${GOAL_COLORS[program.goal] || DEFAULT_GOAL_COLOR}`}>
                    {program.goal}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${CAT_COLORS[program.category] || DEFAULT_CAT_COLOR}`}>
                    {program.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${DIFFICULTY_COLORS[program.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                    {program.difficulty}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1" title={program.name}>
                  {program.name}
                </h3>

                {/* Method + Duration */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {program.method} · {program.durationWeeks} weeks · {program.frequencyPerWeek}x/week
                </p>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {program.description}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3 pb-3 border-b border-gray-50 dark:border-white/5">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{program.timesUsed}</span>
                  <span>{program.avgAdherencePct.toFixed(0)}% adherence</span>
                  <span>${(program.revenueHkd / 1000).toFixed(0)}k</span>
                </div>

                {/* Satisfaction + Actions */}
                <div className="flex items-center justify-between">
                  <StarRating score={program.clientSatisfaction} />
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5">
                      View
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-[#00AEEF] text-white hover:bg-[#008DC4]">
                      Use
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
