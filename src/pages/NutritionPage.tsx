import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calculator,
  PieChartIcon,
  LineChartIcon,
  CalendarDays,
  Trophy,
  Flame,
  Beef,
  Wheat,
  ShoppingCart,
  Droplets,
} from 'lucide-react';

/* ---- Sub-pages ---- */
import TDEEPage from './nutrition/TDEEPage';
import MacroRingPage from './nutrition/MacroRingPage';
import MetabolicTimelinePage from './nutrition/MetabolicTimelinePage';
import GamificationPage from './nutrition/GamificationPage';
import NutritionLogPage from './nutrition/NutritionLogPage';
import MealPlannerPage from './nutrition/MealPlannerPage';
import ShoppingListPage from './nutrition/ShoppingListPage';

/* ------------------------------------------------------------------ */
/*  Tab definition                                                     */
/* ------------------------------------------------------------------ */

interface TabDef {
  id: string;
  label: string;
  icon: typeof Calculator;
  component?: React.ComponentType;
  placeholder?: string;
  placeholderDesc?: string;
}

const TABS: TabDef[] = [
  {
    id: 'tdee',
    label: 'TDEE',
    icon: Calculator,
    component: TDEEPage,
  },
  {
    id: 'macro-ring',
    label: 'Macro Ring',
    icon: PieChartIcon,
    component: MacroRingPage,
  },
  {
    id: 'log',
    label: 'Daily Log',
    icon: Droplets,
    component: NutritionLogPage,
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: LineChartIcon,
    component: MetabolicTimelinePage,
  },
  {
    id: 'meal-planner',
    label: 'Meal Planner',
    icon: CalendarDays,
    component: MealPlannerPage,
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: ShoppingCart,
    component: ShoppingListPage,
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    component: GamificationPage,
  },
];

const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Placeholder component                                              */
/* ------------------------------------------------------------------ */

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: EASE_SMOOTH }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00AEEF] to-[#33BFF2] flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25">
        <Flame className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-heading-lg text-gray-900 dark:text-white mb-2">{title}</h2>
      <p className="text-body-md text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Nutrition Hub                                                 */
/* ------------------------------------------------------------------ */

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState('tdee');
  const store = useNutritionStore();

  const todayISO = new Date().toISOString().split('T')[0];
  const todayLog = store.dailyLogs.find((l) => l.date === todayISO);

  // Today's consumed macros
  const consumed = todayLog
    ? todayLog.meals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fats: acc.fats + m.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      )
    : { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const calPct = store.macroTargets.calories > 0
    ? Math.min(Math.round((consumed.calories / store.macroTargets.calories) * 100), 100)
    : 0;

  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header with summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_SMOOTH }}
        className="mb-8"
      >
        <h1 className="text-display-md text-gray-900 dark:text-white mb-2">
          Nutrition Hub
        </h1>
        <p className="text-body-md text-gray-500 dark:text-gray-400 mb-6">
          Track macros, calculate TDEE, plan meals, and achieve your nutrition goals.
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="dark:bg-[#141414] dark:border-white/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Today</span>
              </div>
              <div className="text-data-sm text-gray-900 dark:text-white">
                {consumed.calories}
                <span className="text-xs text-gray-400 font-normal">/{store.macroTargets.calories}</span>
              </div>
              <div className="text-[10px] text-gray-400">kcal consumed</div>
            </CardContent>
          </Card>

          <Card className="dark:bg-[#141414] dark:border-white/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Beef className="w-3.5 h-3.5 text-[#00AEEF]" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Protein</span>
              </div>
              <div className="text-data-sm text-gray-900 dark:text-white">
                {consumed.protein}g
              </div>
              <div className="text-[10px] text-gray-400">/ {store.macroTargets.protein}g target</div>
            </CardContent>
          </Card>

          <Card className="dark:bg-[#141414] dark:border-white/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wheat className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Carbs</span>
              </div>
              <div className="text-data-sm text-gray-900 dark:text-white">
                {consumed.carbs}g
              </div>
              <div className="text-[10px] text-gray-400">/ {store.macroTargets.carbs}g target</div>
            </CardContent>
          </Card>

          <Card className="dark:bg-[#141414] dark:border-white/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Streak</span>
              </div>
              <div className="text-data-sm text-gray-900 dark:text-white">
                {store.streaks.currentStreak}
                <span className="text-xs text-gray-400 font-normal"> days</span>
              </div>
              <div className="text-[10px] text-gray-400">
                Best: {store.streaks.longestStreak} days
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall calorie progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Daily calorie progress</span>
            <span className={`text-xs font-semibold ${calPct >= 100 ? 'text-emerald-500' : 'text-[#00AEEF]'}`}>
              {calPct}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calPct}%` }}
              transition={{ duration: 0.8, ease: EASE_SMOOTH }}
              className={`h-full rounded-full ${
                calPct >= 100
                  ? 'bg-emerald-500'
                  : calPct >= 75
                    ? 'bg-[#00AEEF]'
                    : calPct >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      </motion.div>

      {/* Tab navigation */}
      <div className="relative mb-6 border-b border-gray-200 dark:border-white/5">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[#00AEEF]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="nutrition-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00AEEF] to-[#33BFF2]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: EASE_SMOOTH }}
        >
          {currentTab?.component ? (
            <currentTab.component />
          ) : (
            <PlaceholderPage
              title={currentTab?.placeholder ?? 'Coming Soon'}
              description={currentTab?.placeholderDesc ?? 'This feature is under development.'}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
