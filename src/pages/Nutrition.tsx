/**
 * AzFIT Nutrition Hub
 * Features: Food Database, Meal Plans, Goal Setting Calculator, Macro Tracking
 * Extracted from NEWAZFIT Trainer master sheet
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Apple,
  ChevronRight,
  Flame,
  Target,
  TrendingDown,
  TrendingUp,
  Scale,
  Calendar,
  Utensils,
  Calculator,
} from 'lucide-react';
import Layout from '@/components/Layout';
import {
  FOOD_DATABASE,
  FOOD_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  type FoodItem,
  type FoodCategory,
  searchFoods,
} from '@/data/foodDatabase';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MealPlanTemplate {
  id: string;
  name: string;
  description: string;
  calorieTarget: number;
  proteinTarget: number;
  fatsTarget: number;
  carbsTarget: number;
  meals: Meal[];
}

interface Meal {
  name: string;
  items: MealItem[];
}

interface MealItem {
  foodId: string;
  servings: number;
}

interface GoalSettings {
  currentWeight: number;
  bodyFatPercent: number;
  goalBodyFatPercent: number;
  weeks: number;
  goalType: 'fat_loss' | 'muscle_gain' | 'maintenance';
}

/* ------------------------------------------------------------------ */
/*  Meal Plan Templates (from Excel Meal Plan sheet)                   */
/* ------------------------------------------------------------------ */

const MEAL_PLAN_TEMPLATES: MealPlanTemplate[] = [
  {
    id: 'plan-a',
    name: 'Meal Plan A',
    description: 'Higher fat, moderate carb approach. Ideal for clients who prefer satiating meals and steady energy.',
    calorieTarget: 1900,
    proteinTarget: 190,
    fatsTarget: 106,
    carbsTarget: 71,
    meals: [
      {
        name: 'Meal 1',
        items: [
          { foodId: 'p47', servings: 2 },
          { foodId: 'f3', servings: 1 },
          { foodId: 'v4', servings: 1 },
        ],
      },
      {
        name: 'Meal 2',
        items: [
          { foodId: 'p64', servings: 1.5 },
          { foodId: 'f21', servings: 2 },
          { foodId: 'f17', servings: 2 },
          { foodId: 'v47', servings: 1 },
          { foodId: 'v45', servings: 1 },
        ],
      },
      {
        name: 'Meal 3',
        items: [
          { foodId: 'p35', servings: 2 },
        ],
      },
      {
        name: 'Meal 4',
        items: [
          { foodId: 'p65', servings: 2 },
          { foodId: 'c12', servings: 2 },
          { foodId: 'v49', servings: 1 },
          { foodId: 'v62', servings: 1 },
        ],
      },
    ],
  },
  {
    id: 'plan-b',
    name: 'Meal Plan B',
    description: 'Higher carb, lower fat approach. Great for clients with high activity levels and training volume.',
    calorieTarget: 1900,
    proteinTarget: 190,
    fatsTarget: 74,
    carbsTarget: 119,
    meals: [
      {
        name: 'Meal 1',
        items: [
          { foodId: 'p36', servings: 2 },
          { foodId: 'p2', servings: 1 },
          { foodId: 'c38', servings: 2 },
        ],
      },
      {
        name: 'Meal 2',
        items: [
          { foodId: 'p64', servings: 2.5 },
          { foodId: 'c12', servings: 1 },
          { foodId: 'v61', servings: 1 },
          { foodId: 'v47', servings: 1 },
        ],
      },
      {
        name: 'Meal 3',
        items: [
          { foodId: 'p35', servings: 2 },
          { foodId: 'c3', servings: 1 },
          { foodId: 'v3', servings: 1 },
        ],
      },
      {
        name: 'Meal 4',
        items: [
          { foodId: 'p65', servings: 2 },
          { foodId: 'c10', servings: 2 },
          { foodId: 'v42', servings: 1 },
          { foodId: 'v45', servings: 1 },
        ],
      },
    ],
  },
  {
    id: 'refeed',
    name: 'Maintenance / Refeed Day',
    description: 'Strategic high-carb day to replenish glycogen and boost leptin. Use 1x per week during fat loss phases.',
    calorieTarget: 3040,
    proteinTarget: 190,
    fatsTarget: 84,
    carbsTarget: 380,
    meals: [
      {
        name: 'Meal 1',
        items: [
          { foodId: 'p36', servings: 1 },
          { foodId: 'p2', servings: 1 },
          { foodId: 'f20', servings: 1 },
        ],
      },
      {
        name: 'Meal 2',
        items: [
          { foodId: 'p64', servings: 1.5 },
          { foodId: 'c10', servings: 1 },
          { foodId: 'v42', servings: 1 },
          { foodId: 'v45', servings: 1 },
        ],
      },
      {
        name: 'Meal 3',
        items: [
          { foodId: 'p35', servings: 1 },
        ],
      },
      {
        name: 'Meal 4',
        items: [
          { foodId: 'p65', servings: 1.5 },
          { foodId: 'c20', servings: 1.5 },
          { foodId: 'f21', servings: 1 },
          { foodId: 'v49', servings: 1 },
          { foodId: 'v62', servings: 1 },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function calculateMealTotals(items: MealItem[]) {
  return items.reduce(
    (totals, item) => {
      const food = FOOD_DATABASE.find((f) => f.id === item.foodId);
      if (!food) return totals;
      return {
        calories: totals.calories + food.calories * item.servings,
        protein: totals.protein + food.protein * item.servings,
        fats: totals.fats + food.fats * item.servings,
        carbs: totals.carbs + food.carbs * item.servings,
      };
    },
    { calories: 0, protein: 0, fats: 0, carbs: 0 }
  );
}

function calculatePlanTotals(plan: MealPlanTemplate) {
  return plan.meals.reduce(
    (totals, meal) => {
      const mealTotals = calculateMealTotals(meal.items);
      return {
        calories: totals.calories + mealTotals.calories,
        protein: totals.protein + mealTotals.protein,
        fats: totals.fats + mealTotals.fats,
        carbs: totals.carbs + mealTotals.carbs,
      };
    },
    { calories: 0, protein: 0, fats: 0, carbs: 0 }
  );
}

function calculateGoalSettings(settings: GoalSettings) {
  const { currentWeight, bodyFatPercent, goalBodyFatPercent, weeks } = settings;
  const fatMass = currentWeight * (bodyFatPercent / 100);
  const lbm = currentWeight - fatMass;
  const goalWeight = lbm / (1 - goalBodyFatPercent / 100);
  const weightChange = goalWeight - currentWeight;
  const weeklyChange = weightChange / weeks;
  const weeklyChangePercent = (weeklyChange / currentWeight) * 100;

  let rateLabel: string;
  let rateColor: string;
  if (settings.goalType === 'fat_loss') {
    if (weeklyChangePercent <= -1.5) {
      rateLabel = 'Aggressive';
      rateColor = '#F87171';
    } else if (weeklyChangePercent <= -1.0) {
      rateLabel = 'Moderate';
      rateColor = '#F59E0B';
    } else {
      rateLabel = 'Slow';
      rateColor = '#84CC16';
    }
  } else if (settings.goalType === 'muscle_gain') {
    if (weeklyChangePercent >= 1.0) {
      rateLabel = 'Aggressive';
      rateColor = '#F87171';
    } else if (weeklyChangePercent >= 0.5) {
      rateLabel = 'Recommended';
      rateColor = '#84CC16';
    } else {
      rateLabel = 'Moderate';
      rateColor = '#0D9488';
    }
  } else {
    rateLabel = 'Maintenance';
    rateColor = '#06B6D4';
  }

  return {
    fatMass,
    lbm,
    goalWeight,
    weightChange,
    weeklyChange,
    weeklyChangePercent,
    rateLabel,
    rateColor,
  };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'var(--light-text-secondary)' }}>{label}</span>
        <span className="font-semibold" style={{ color }}>
          {Math.round(value)}g
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--light-border)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function FoodCard({ food }: { food: FoodItem }) {
  const color = CATEGORY_COLORS[food.category];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-3 border transition-shadow hover:shadow-md"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--light-border)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--light-text-primary)' }}>
            {food.name}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--light-text-muted)' }}>
            {food.serving}
          </p>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {food.calories} kcal
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { label: 'P', value: food.protein, color: '#0D9488' },
          { label: 'F', value: food.fats, color: '#F59E0B' },
          { label: 'C', value: food.carbs, color: '#06B6D4' },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-[10px] font-semibold" style={{ color: m.color }}>
              {m.value}g
            </p>
            <p className="text-[9px]" style={{ color: 'var(--light-text-muted)' }}>
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Food Database                                                 */
/* ------------------------------------------------------------------ */

function FoodDatabaseTab() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FoodCategory | 'All'>('All');

  const filtered = useMemo(() => {
    let result = FOOD_DATABASE;
    if (activeCategory !== 'All') {
      result = result.filter((f) => f.category === activeCategory);
    }
    if (search.trim()) {
      result = searchFoods(search).filter((f) => (activeCategory === 'All' ? true : f.category === activeCategory));
    }
    return result;
  }, [search, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: FOOD_DATABASE.length };
    FOOD_CATEGORIES.forEach((cat) => {
      counts[cat] = FOOD_DATABASE.filter((f) => f.category === cat).length;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--light-text-muted)' }} />
        <input
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-opacity-20 transition-all"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--light-border)',
            color: 'var(--light-text-primary)',
            '--tw-ring-color': '#0D9488',
          } as React.CSSProperties}
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {(['All', ...FOOD_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: activeCategory === cat ? (cat === 'All' ? '#0D9488' : CATEGORY_COLORS[cat as FoodCategory]) : 'var(--light-elevated)',
              color: activeCategory === cat ? '#fff' : 'var(--light-text-secondary)',
            }}
          >
            {cat === 'All' ? '🍽️ All' : `${CATEGORY_ICONS[cat as FoodCategory]} ${cat}`}
            <span className="ml-1 opacity-70">({categoryCounts[cat]})</span>
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs" style={{ color: 'var(--light-text-muted)' }}>
        Showing {filtered.length} food{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Food grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Apple className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--light-text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--light-text-secondary)' }}>
            No foods found matching your search
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Meal Plans                                                    */
/* ------------------------------------------------------------------ */

function MealPlansTab() {
  const [selectedPlan, setSelectedPlan] = useState<MealPlanTemplate | null>(null);

  if (selectedPlan) {
    const totals = calculatePlanTotals(selectedPlan);
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedPlan(null)}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--light-elevated)' }}
          >
            <ChevronRight className="w-4 h-4 rotate-180" style={{ color: 'var(--light-text-secondary)' }} />
          </button>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--light-text-primary)' }}>
              {selectedPlan.name}
            </h2>
            <p className="text-xs" style={{ color: 'var(--light-text-muted)' }}>
              {selectedPlan.description}
            </p>
          </div>
        </div>

        {/* Macro targets vs actuals */}
        <div
          className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--light-border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4" style={{ color: '#0D9488' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--light-text-primary)' }}>
              Macro Targets
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MacroBar label="Calories" value={totals.calories} max={selectedPlan.calorieTarget} color="#F59E0B" />
            <MacroBar label="Protein" value={totals.protein} max={selectedPlan.proteinTarget} color="#0D9488" />
            <MacroBar label="Fats" value={totals.fats} max={selectedPlan.fatsTarget} color="#F59E0B" />
            <MacroBar label="Carbs" value={totals.carbs} max={selectedPlan.carbsTarget} color="#06B6D4" />
          </div>
          <div className="mt-4 pt-3 border-t grid grid-cols-4 gap-2 text-center" style={{ borderColor: 'var(--light-border)' }}>
            {[
              { label: 'Target', value: selectedPlan.calorieTarget, color: '#F59E0B' },
              { label: 'Actual', value: Math.round(totals.calories), color: '#0D9488' },
              { label: 'Protein', value: `${Math.round(totals.protein)}g`, color: '#0D9488' },
              { label: 'Diff', value: `${Math.round(totals.calories - selectedPlan.calorieTarget)}`, color: totals.calories > selectedPlan.calorieTarget ? '#F87171' : '#84CC16' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px]" style={{ color: 'var(--light-text-muted)' }}>{item.label}</p>
                <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-4">
          {selectedPlan.meals.map((meal, idx) => {
            const mealTotals = calculateMealTotals(meal.items);
            return (
              <motion.div
                key={meal.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--light-border)' }}
              >
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--light-border)' }}>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--light-text-primary)' }}>
                    {meal.name}
                  </h4>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#0D948815', color: '#0D9488' }}>
                    {Math.round(mealTotals.calories)} kcal
                  </span>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--light-border)' }}>
                  {meal.items.map((item) => {
                    const food = FOOD_DATABASE.find((f) => f.id === item.foodId);
                    if (!food) return null;
                    return (
                      <div key={item.foodId} className="px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{CATEGORY_ICONS[food.category]}</span>
                          <div>
                            <p className="text-sm" style={{ color: 'var(--light-text-primary)' }}>{food.name}</p>
                            <p className="text-[10px]" style={{ color: 'var(--light-text-muted)' }}>
                              {item.servings}x {food.serving}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium" style={{ color: 'var(--light-text-primary)' }}>
                            {Math.round(food.calories * item.servings)} kcal
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--light-text-muted)' }}>
                            P:{Math.round(food.protein * item.servings)}g F:{Math.round(food.fats * item.servings)}g C:{Math.round(food.carbs * item.servings)}g
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2 text-[10px] text-right" style={{ color: 'var(--light-text-muted)', backgroundColor: 'var(--light-elevated)' }}>
                  Meal total: P {Math.round(mealTotals.protein)}g · F {Math.round(mealTotals.fats)}g · C {Math.round(mealTotals.carbs)}g
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MEAL_PLAN_TEMPLATES.map((plan, idx) => {
          const totals = calculatePlanTotals(plan);
          return (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedPlan(plan)}
              className="text-left rounded-xl border p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--light-border)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <Utensils className="w-5 h-5" style={{ color: '#0D9488' }} />
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--light-text-muted)' }} />
              </div>
              <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--light-text-primary)' }}>
                {plan.name}
              </h3>
              <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--light-text-muted)' }}>
                {plan.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--light-text-muted)' }}>Calories</span>
                  <span className="font-semibold" style={{ color: '#F59E0B' }}>{plan.calorieTarget}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--light-text-muted)' }}>Protein</span>
                  <span className="font-semibold" style={{ color: '#0D9488' }}>{plan.proteinTarget}g</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--light-text-muted)' }}>Fats</span>
                  <span className="font-semibold" style={{ color: '#F59E0B' }}>{plan.fatsTarget}g</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--light-text-muted)' }}>Carbs</span>
                  <span className="font-semibold" style={{ color: '#06B6D4' }}>{plan.carbsTarget}g</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--light-border)' }}>
                <p className="text-[10px]" style={{ color: 'var(--light-text-muted)' }}>
                  {plan.meals.length} meals · Actual: {Math.round(totals.calories)} kcal
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Goal Setting Calculator                                       */
/* ------------------------------------------------------------------ */

function GoalCalculatorTab() {
  const [settings, setSettings] = useState<GoalSettings>({
    currentWeight: 75,
    bodyFatPercent: 18,
    goalBodyFatPercent: 12,
    weeks: 12,
    goalType: 'fat_loss',
  });

  const results = useMemo(() => calculateGoalSettings(settings), [settings]);

  const timetable = [
    { day: 'Monday', training: 'Training Session 1', calories: settings.goalType === 'fat_loss' ? 'Deficit' : 'Surplus', steps: '10,000', cardio: '-', mobility: 'Hip Flexors, Hamstrings, Glutes' },
    { day: 'Tuesday', training: 'REST', calories: settings.goalType === 'fat_loss' ? 'Deficit' : 'Surplus', steps: '10,000', cardio: '-', mobility: '-' },
    { day: 'Wednesday', training: 'Training Session 2', calories: settings.goalType === 'fat_loss' ? 'Deficit' : 'Surplus', steps: '10,000', cardio: '-', mobility: 'Thoracic Spine, Shoulders' },
    { day: 'Thursday', training: 'REST', calories: settings.goalType === 'fat_loss' ? 'Deficit' : 'Surplus', steps: '10,000', cardio: '20 min LISS', mobility: '-' },
    { day: 'Friday', training: 'Training Session 3', calories: settings.goalType === 'fat_loss' ? 'Deficit' : 'Surplus', steps: '10,000', cardio: '-', mobility: 'Ankles, Hip Flexors' },
    { day: 'Saturday', training: 'Training Session 4', calories: settings.goalType === 'fat_loss' ? 'Deficit' : 'Surplus', steps: '10,000', cardio: '-', mobility: 'Full Body' },
    { day: 'Sunday', training: 'REST', calories: settings.goalType === 'fat_loss' ? 'Refeed' : 'Maintenance', steps: '8,000', cardio: '30 min walk', mobility: '-' },
  ];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--light-border)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4" style={{ color: '#0D9488' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--light-text-primary)' }}>
            Body Composition Inputs
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Current Weight (kg)', key: 'currentWeight', min: 30, max: 200, step: 0.1 },
            { label: 'Body Fat %', key: 'bodyFatPercent', min: 3, max: 50, step: 0.1 },
            { label: 'Goal Body Fat %', key: 'goalBodyFatPercent', min: 3, max: 50, step: 0.1 },
            { label: 'Weeks', key: 'weeks', min: 1, max: 52, step: 1 },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--light-text-secondary)' }}>
                {field.label}
              </label>
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={settings[field.key as keyof GoalSettings] as number}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, [field.key]: parseFloat(e.target.value) || 0 }))
                }
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--light-elevated)',
                  borderColor: 'var(--light-border)',
                  color: 'var(--light-text-primary)',
                  '--tw-ring-color': '#0D9488',
                } as React.CSSProperties}
              />
            </div>
          ))}
        </div>

        {/* Goal type */}
        <div className="mt-4">
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--light-text-secondary)' }}>
            Goal Type
          </label>
          <div className="flex gap-2">
            {([
              { value: 'fat_loss', label: 'Fat Loss', icon: TrendingDown, color: '#F59E0B' },
              { value: 'muscle_gain', label: 'Muscle Gain', icon: TrendingUp, color: '#84CC16' },
              { value: 'maintenance', label: 'Maintenance', icon: Scale, color: '#06B6D4' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSettings((s) => ({ ...s, goalType: opt.value }))}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: settings.goalType === opt.value ? `${opt.color}15` : 'var(--light-elevated)',
                  color: settings.goalType === opt.value ? opt.color : 'var(--light-text-secondary)',
                  border: settings.goalType === opt.value ? `1px solid ${opt.color}40` : '1px solid transparent',
                }}
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Fat Mass', value: `${results.fatMass.toFixed(1)} kg`, icon: Flame, color: '#F59E0B' },
          { label: 'Lean Body Mass', value: `${results.lbm.toFixed(1)} kg`, icon: Scale, color: '#0D9488' },
          { label: 'Goal Weight', value: `${results.goalWeight.toFixed(1)} kg`, icon: Target, color: '#8B5CF6' },
          { label: 'Weekly Change', value: `${results.weeklyChangePercent.toFixed(2)}%`, icon: TrendingDown, color: results.rateColor },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--light-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
              <span className="text-xs" style={{ color: 'var(--light-text-muted)' }}>{item.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Rate assessment */}
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: `${results.rateColor}08`,
          borderColor: `${results.rateColor}30`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: results.rateColor }}
          />
          <span className="text-sm font-semibold" style={{ color: results.rateColor }}>
            {results.rateLabel} Rate
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--light-text-secondary)' }}>
          {settings.goalType === 'fat_loss'
            ? `Losing ${Math.abs(results.weeklyChange).toFixed(2)} kg/week. ${results.rateLabel === 'Aggressive' ? 'Consider slowing down to preserve muscle mass.' : results.rateLabel === 'Moderate' ? 'Good sustainable pace.' : 'Conservative approach — very sustainable.'}`
            : settings.goalType === 'muscle_gain'
            ? `Gaining ${results.weeklyChange.toFixed(2)} kg/week. ${results.rateLabel === 'Aggressive' ? 'Higher fat gain risk. Monitor body composition closely.' : results.rateLabel === 'Recommended' ? 'Optimal for lean muscle gain.' : 'Minimal fat gain expected.'}`
            : 'Focus on performance and recovery. Maintain current body composition.'}
        </p>
      </div>

      {/* Weekly Timetable */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--light-border)' }}
      >
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--light-border)' }}>
          <Calendar className="w-4 h-4" style={{ color: '#0D9488' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--light-text-primary)' }}>
            Weekly Timetable
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: 'var(--light-elevated)' }}>
                {['Day', 'Training', 'Calories', 'Steps', 'Cardio', 'Mobility'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: 'var(--light-text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--light-border)' }}>
              {timetable.map((row) => (
                <tr key={row.day}>
                  <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--light-text-primary)' }}>{row.day}</td>
                  <td className="px-3 py-2.5" style={{ color: row.training === 'REST' ? 'var(--light-text-muted)' : '#0D9488' }}>{row.training}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--light-text-secondary)' }}>{row.calories}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--light-text-secondary)' }}>{row.steps}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--light-text-secondary)' }}>{row.cardio}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--light-text-muted)' }}>{row.mobility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate reference tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--light-border)' }}
        >
          <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--light-text-primary)' }}>
            Fat Loss Rate Reference
          </h4>
          <div className="space-y-2">
            {[
              { rate: '-0.5% / week', label: 'Slow', desc: 'Minimal muscle loss, sustainable long-term', color: '#84CC16' },
              { rate: '-1.0% / week', label: 'Moderate', desc: 'Good balance of fat loss and muscle preservation', color: '#F59E0B' },
              { rate: '-1.5% / week', label: 'Aggressive', desc: 'Faster results, higher muscle loss risk', color: '#F87171' },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${r.color}15`, color: r.color }}>
                  {r.label}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--light-text-secondary)' }}>{r.rate}</span>
                <span className="text-[10px]" style={{ color: 'var(--light-text-muted)' }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--light-border)' }}
        >
          <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--light-text-primary)' }}>
            Muscle Building Rate Reference
          </h4>
          <div className="space-y-2">
            {[
              { rate: '+0.5% / month', label: 'Moderate', desc: 'Minimal fat gain, slow strength gains', color: '#0D9488' },
              { rate: '+1.0% / month', label: 'Recommended', desc: 'Optimal muscle gain with manageable fat', color: '#84CC16' },
              { rate: '+1.5% / month', label: 'Aggressive', desc: 'Faster muscle gain, more fat accumulation', color: '#F59E0B' },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${r.color}15`, color: r.color }}>
                  {r.label}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--light-text-secondary)' }}>{r.rate}</span>
                <span className="text-[10px]" style={{ color: 'var(--light-text-muted)' }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

type NutritionTab = 'foods' | 'meal-plans' | 'calculator';

const TABS: { key: NutritionTab; label: string; icon: React.ElementType }[] = [
  { key: 'foods', label: 'Food Database', icon: Apple },
  { key: 'meal-plans', label: 'Meal Plans', icon: Utensils },
  { key: 'calculator', label: 'Goal Calculator', icon: Calculator },
];

export default function Nutrition() {
  const [activeTab, setActiveTab] = useState<NutritionTab>('foods');

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--light-text-primary)' }}>
              Nutrition Hub
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--light-text-muted)' }}>
              Food database, meal plans, and goal setting tools
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--light-elevated)' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--card-bg)' : 'transparent',
                  color: isActive ? '#0D9488' : 'var(--light-text-muted)',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'foods' && <FoodDatabaseTab />}
            {activeTab === 'meal-plans' && <MealPlansTab />}
            {activeTab === 'calculator' && <GoalCalculatorTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}
