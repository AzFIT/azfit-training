import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, RefreshCw, AlertTriangle, Droplets } from 'lucide-react'
import type { DailyMealPlan, MealOption } from './mealPlanGenerator'
import { calculatePlanTotals } from './mealPlanGenerator'

export type MealStatus = 'planned' | 'eaten' | 'swapped' | 'missed' | 'custom'

export interface LoggedMeal {
  mealType: string
  status: MealStatus
  option: MealOption
  note?: string
}

export interface DailyLog {
  date: string
  planned: DailyMealPlan | null
  logged: LoggedMeal[]
  waterGlasses: number
  waterTarget: number
}

interface DailyNutritionLogProps {
  log: DailyLog
  onUpdateLog: (log: DailyLog) => void
}

const STATUS_CONFIG: Record<MealStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  planned: { icon: <span className="w-4 h-4 rounded-full border-2 border-dark-border" />, label: 'Planned', color: 'text-dark-muted', bg: 'bg-transparent' },
  eaten: { icon: <Check size={14} className="text-success" />, label: 'Eaten', color: 'text-success', bg: 'bg-success/10' },
  swapped: { icon: <RefreshCw size={14} className="text-warning" />, label: 'Swapped', color: 'text-warning', bg: 'bg-warning/10' },
  missed: { icon: <X size={14} className="text-danger" />, label: 'Missed', color: 'text-danger', bg: 'bg-danger/10' },
  custom: { icon: <AlertTriangle size={14} className="text-info" />, label: 'Custom', color: 'text-info', bg: 'bg-info/10' },
}

export default function DailyNutritionLog({ log, onUpdateLog }: DailyNutritionLogProps) {
  const [editingMeal, setEditingMeal] = useState<string | null>(null)

  const plannedTotals = log.planned ? calculatePlanTotals(log.planned) : null
  const loggedTotals = log.logged.reduce(
    (acc, m) => {
      if (m.status === 'missed') return acc
      return {
        calories: acc.calories + m.option.calories,
        protein: acc.protein + m.option.protein,
        carbs: acc.carbs + m.option.carbs,
        fats: acc.fats + m.option.fats,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  )

  const waterPercent = Math.round((log.waterGlasses / log.waterTarget) * 100)

  function updateMealStatus(mealType: string, status: MealStatus) {
    const existing = log.logged.find((m) => m.mealType === mealType)
    const plannedMeal = log.planned?.meals.find((m) => m.type === mealType)

    const updatedLogged = existing
      ? log.logged.map((m) => (m.mealType === mealType ? { ...m, status } : m))
      : [...log.logged, { mealType, status, option: plannedMeal?.primary || { id: '', name: 'Unknown', foods: [], calories: 0, protein: 0, carbs: 0, fats: 0, prepTime: 0 } }]

    onUpdateLog({ ...log, logged: updatedLogged })
    setEditingMeal(null)
  }

  function getMealStatus(mealType: string): MealStatus {
    return log.logged.find((m) => m.mealType === mealType)?.status ?? 'planned'
  }

  function getStatusBadge(status: MealStatus) {
    const cfg = STATUS_CONFIG[status]
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color} ${cfg.bg}`}>
        {cfg.icon}
        {cfg.label}
      </span>
    )
  }

  function macroDiff(actual: number, planned: number): string {
    const diff = actual - planned
    if (Math.abs(diff) < 5) return '✅ On Track'
    return diff > 0 ? `+${Math.round(diff)}` : `${Math.round(diff)}`
  }

  function macroDiffColor(actual: number, planned: number): string {
    const diff = actual - planned
    if (Math.abs(diff) < planned * 0.1) return 'text-success'
    if (Math.abs(diff) < planned * 0.2) return 'text-warning'
    return 'text-danger'
  }

  return (
    <div className="space-y-4">
      {/* Macro comparison table */}
      <div className="bg-az-black-card border border-dark-border rounded-2xl p-4">
        <h3 className="text-dark-primary font-semibold text-sm mb-3">Today's Nutrition</h3>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="text-dark-muted text-[10px]"></div>
          <div className="text-dark-muted text-[10px] text-center">Planned</div>
          <div className="text-dark-muted text-[10px] text-center">Actual</div>
          <div className="text-dark-muted text-[10px] text-center">Status</div>
          <div className="text-dark-muted text-[10px] text-center">Diff</div>

          {/* Calories */}
          <div className="text-dark-secondary py-1.5">Calories</div>
          <div className="text-dark-primary font-mono text-center py-1.5">{plannedTotals?.calories ?? 0}</div>
          <div className="text-dark-primary font-mono text-center py-1.5">{loggedTotals.calories}</div>
          <div className="text-center py-1.5">{getStatusBadge(Math.abs(loggedTotals.calories - (plannedTotals?.calories ?? 0)) < 100 ? 'eaten' : 'swapped')}</div>
          <div className={`text-center font-mono py-1.5 ${macroDiffColor(loggedTotals.calories, plannedTotals?.calories ?? 0)}`}>
            {macroDiff(loggedTotals.calories, plannedTotals?.calories ?? 0)}
          </div>

          {/* Protein */}
          <div className="text-dark-secondary py-1.5">Protein</div>
          <div className="text-dark-primary font-mono text-center py-1.5">{plannedTotals?.protein ?? 0}g</div>
          <div className="text-dark-primary font-mono text-center py-1.5">{loggedTotals.protein}g</div>
          <div className="text-center py-1.5">{getStatusBadge(Math.abs(loggedTotals.protein - (plannedTotals?.protein ?? 0)) < 10 ? 'eaten' : 'swapped')}</div>
          <div className={`text-center font-mono py-1.5 ${macroDiffColor(loggedTotals.protein, plannedTotals?.protein ?? 0)}`}>
            {macroDiff(loggedTotals.protein, plannedTotals?.protein ?? 0)}
          </div>

          {/* Carbs */}
          <div className="text-dark-secondary py-1.5">Carbs</div>
          <div className="text-dark-primary font-mono text-center py-1.5">{plannedTotals?.carbs ?? 0}g</div>
          <div className="text-dark-primary font-mono text-center py-1.5">{loggedTotals.carbs}g</div>
          <div className="text-center py-1.5">{getStatusBadge(Math.abs(loggedTotals.carbs - (plannedTotals?.carbs ?? 0)) < 15 ? 'eaten' : 'swapped')}</div>
          <div className={`text-center font-mono py-1.5 ${macroDiffColor(loggedTotals.carbs, plannedTotals?.carbs ?? 0)}`}>
            {macroDiff(loggedTotals.carbs, plannedTotals?.carbs ?? 0)}
          </div>

          {/* Fat */}
          <div className="text-dark-secondary py-1.5">Fat</div>
          <div className="text-dark-primary font-mono text-center py-1.5">{plannedTotals?.fats ?? 0}g</div>
          <div className="text-dark-primary font-mono text-center py-1.5">{loggedTotals.fats}g</div>
          <div className="text-center py-1.5">{getStatusBadge(Math.abs(loggedTotals.fats - (plannedTotals?.fats ?? 0)) < 8 ? 'eaten' : 'swapped')}</div>
          <div className={`text-center font-mono py-1.5 ${macroDiffColor(loggedTotals.fats, plannedTotals?.fats ?? 0)}`}>
            {macroDiff(loggedTotals.fats, plannedTotals?.fats ?? 0)}
          </div>
        </div>

        {/* Water row */}
        <div className="mt-3 pt-3 border-t border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={14} className="text-cyan" />
            <span className="text-dark-secondary text-xs">Water</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {Array.from({ length: log.waterTarget }, (_, i) => (
                <button
                  key={i}
                  onClick={() => onUpdateLog({ ...log, waterGlasses: i < log.waterGlasses ? i : i + 1 })}
                  className={`w-5 h-6 rounded-sm border transition-all ${
                    i < log.waterGlasses
                      ? 'bg-cyan/60 border-cyan'
                      : 'bg-transparent border-dark-border hover:border-cyan/50'
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-mono ${waterPercent >= 100 ? 'text-success' : waterPercent >= 50 ? 'text-warning' : 'text-danger'}`}>
              {log.waterGlasses}/{log.waterTarget}
            </span>
          </div>
        </div>
      </div>

      {/* Meal status list */}
      <div className="bg-az-black-card border border-dark-border rounded-2xl p-4">
        <h3 className="text-dark-primary font-semibold text-sm mb-3">Meals</h3>
        <div className="space-y-2">
          {log.planned?.meals.map((meal) => {
            const status = getMealStatus(meal.type)
            const isEditing = editingMeal === meal.type

            return (
              <motion.div
                key={meal.type}
                layout
                className="bg-az-black-elevated border border-dark-border rounded-xl p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {meal.type === 'Breakfast' && '🍳'}
                      {meal.type === 'Lunch' && '🍱'}
                      {meal.type === 'Dinner' && '🍽️'}
                      {meal.type === 'Snacks' && '🍎'}
                    </span>
                    <span className="text-dark-primary text-xs font-medium">{meal.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    <button
                      onClick={() => setEditingMeal(isEditing ? null : meal.type)}
                      className="text-dark-muted hover:text-dark-primary text-[10px] transition-colors"
                    >
                      {isEditing ? 'Done' : 'Edit'}
                    </button>
                  </div>
                </div>

                <p className="text-dark-secondary text-xs mt-1 truncate">
                  {log.logged.find((m) => m.mealType === meal.type)?.option.name ?? meal.primary.name}
                </p>

                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-dark-border"
                  >
                    <div className="flex flex-wrap gap-2">
                      {(['eaten', 'swapped', 'missed', 'custom'] as MealStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateMealStatus(meal.type, s)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                            status === s
                              ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border border-current`
                              : 'bg-dark-hover text-dark-muted hover:text-dark-secondary border border-transparent'
                          }`}
                        >
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
