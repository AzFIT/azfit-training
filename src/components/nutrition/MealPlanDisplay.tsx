import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, Flame, Dumbbell, Wheat as WheatIcon, Droplets, Clock, RefreshCw, Check } from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'
import type { DailyMealPlan, MealPlanItem } from './mealPlanGenerator'
import { calculatePlanTotals, swapMealOption } from './mealPlanGenerator'

interface MealPlanDisplayProps {
  plan: DailyMealPlan
  onPlanChange: (plan: DailyMealPlan) => void
  onDateChange: (date: Date) => void
}

export default function MealPlanDisplay({ plan, onPlanChange, onDateChange }: MealPlanDisplayProps) {
  const [swappingMeal, setSwappingMeal] = useState<string | null>(null)
  const date = new Date(plan.date)
  const totals = calculatePlanTotals(plan)

  const handleSwap = useCallback((mealType: string, altId: string) => {
    const updated = swapMealOption(plan, mealType, altId)
    onPlanChange(updated)
    setSwappingMeal(null)
  }, [plan, onPlanChange])

  return (
    <div className="space-y-4">
      {/* Date + Target Header */}
      <div className="bg-[az-black-card] border border-dark-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDateChange(subDays(date, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-secondary hover:text-dark-primary hover:bg-dark-hover transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 min-w-[200px] justify-center">
              <Calendar size={14} className="text-cyan" />
              <h3 className="text-dark-primary font-semibold text-sm">
                {format(date, 'EEEE, d MMMM yyyy')}
              </h3>
            </div>
            <button
              onClick={() => onDateChange(addDays(date, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-secondary hover:text-dark-primary hover:bg-dark-hover transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1.5 rounded-lg text-xs text-dark-secondary hover:text-dark-primary hover:bg-dark-hover border border-dark-border transition-colors"
          >
            Today
          </button>
        </div>

        {/* Target macros bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Flame size={12} className="text-orange" />
            <span className="text-dark-muted">Target:</span>
            <span className="text-dark-primary font-mono font-bold">{plan.targetCalories.toLocaleString()} kcal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell size={12} className="text-cyan" />
            <span className="text-dark-primary font-mono">{plan.targetProtein}g P</span>
          </div>
          <div className="flex items-center gap-1.5">
            <WheatIcon size={12} className="text-violet" />
            <span className="text-dark-primary font-mono">{plan.targetCarbs}g C</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets size={12} className="text-orange" />
            <span className="text-dark-primary font-mono">{plan.targetFat}g F</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-dark-muted">Plan total:</span>
            <span className={`font-mono font-bold ${Math.abs(totals.calories - plan.targetCalories) < 100 ? 'text-success' : 'text-warning'}`}>
              {totals.calories.toLocaleString()} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Meal Cards */}
      {plan.meals.map((meal, idx) => (
        <MealCard
          key={meal.type}
          meal={meal}
          index={idx}
          isSwapping={swappingMeal === meal.type}
          onToggleSwap={() => setSwappingMeal(swappingMeal === meal.type ? null : meal.type)}
          onSelectAlternative={(altId) => handleSwap(meal.type, altId)}
        />
      ))}
    </div>
  )
}

/* ─── Individual Meal Card ─── */
function MealCard({
  meal,
  index,
  isSwapping,
  onToggleSwap,
  onSelectAlternative,
}: {
  meal: MealPlanItem
  index: number
  isSwapping: boolean
  onToggleSwap: () => void
  onSelectAlternative: (altId: string) => void
}) {
  const p = meal.primary

  const mealEmoji: Record<string, string> = {
    Breakfast: '🍳',
    Lunch: '🍱',
    Dinner: '🍽️',
    Snacks: '🍎',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-[az-black-card] border border-dark-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{mealEmoji[meal.type]}</span>
            <div>
              <h4 className="text-dark-primary font-semibold text-sm">{meal.type}</h4>
              <span className="text-dark-muted text-[10px]">{meal.time}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-dark-primary text-sm font-bold font-mono">{p.calories} kcal</span>
            <div className="text-dark-muted text-[10px] font-mono">
              P:{p.protein}g · C:{p.carbs}g · F:{p.fats}g
            </div>
          </div>
        </div>
      </div>

      {/* Primary Option */}
      <div className="mx-4 mb-3 bg-[az-black-elevated] border border-cyan/30 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Check size={14} className="text-cyan" />
          <span className="text-cyan text-xs font-medium">Selected</span>
          <span className="text-dark-subtle text-[10px] flex items-center gap-1 ml-auto">
            <Clock size={10} /> {p.prepTime} min
          </span>
        </div>
        <p className="text-dark-primary text-sm font-medium mb-2">{p.name}</p>
        <div className="space-y-1">
          {p.foods.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="text-dark-secondary">{item.food.name}</span>
              <span className="text-dark-muted font-mono">{item.quantity}g</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alternatives */}
      <div className="px-4 pb-4">
        <button
          onClick={onToggleSwap}
          className="flex items-center gap-1.5 text-dark-muted hover:text-dark-primary text-xs transition-colors mb-2"
        >
          <RefreshCw size={12} className={isSwapping ? 'text-cyan animate-spin' : ''} />
          {isSwapping ? 'Hide alternatives' : `${meal.alternatives.length} alternatives`}
        </button>

        <AnimatePresence>
          {isSwapping && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {meal.alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => onSelectAlternative(alt.id)}
                  className="w-full text-left bg-[az-black-elevated] border border-dark-border hover:border-cyan/50 rounded-lg p-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-dark-primary text-xs font-medium">{alt.name}</span>
                    <span className="text-dark-secondary text-xs font-mono">{alt.calories} kcal</span>
                  </div>
                  <div className="text-dark-muted text-[10px] font-mono mt-1">
                    P:{alt.protein}g · C:{alt.carbs}g · F:{alt.fats}g · <Clock size={10} className="inline" /> {alt.prepTime}min
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
