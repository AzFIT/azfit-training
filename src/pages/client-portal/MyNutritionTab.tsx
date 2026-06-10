import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Apple, Droplets, CheckCircle2, XCircle, Flame, Beef, Wheat } from 'lucide-react'
import { useAppDataStore } from '../../stores/useAppDataStore'

interface MyNutritionTabProps {
  clientId: string
}

const WATER_GOAL = 8

export default function MyNutritionTab({ clientId }: MyNutritionTabProps) {
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false })
  const [waterGlasses, setWaterGlasses] = useState(0)

  const nutritionEntries = useAppDataStore((s) => s.nutritionEntries)

  // Get latest nutrition entry for this client
  const latestNutrition = useMemo(() => {
    const entries = Object.values(nutritionEntries).filter((e) => e.clientId === clientId)
    if (entries.length === 0) return undefined
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }, [nutritionEntries, clientId])

  const toggleMeal = (meal: keyof typeof meals) => {
    setMeals((prev) => ({ ...prev, [meal]: !prev[meal] }))
  }

  const toggleWater = (index: number) => {
    setWaterGlasses((prev) => (prev > index ? index : index + 1))
  }

  const mealOrder: { key: keyof typeof meals; label: string; icon: typeof Apple }[] = [
    { key: 'breakfast', label: 'Breakfast', icon: Apple },
    { key: 'lunch', label: 'Lunch', icon: Beef },
    { key: 'dinner', label: 'Dinner', icon: Wheat },
  ]

  const macros = latestNutrition
    ? {
        protein: latestNutrition.proteinGrams,
        carbs: latestNutrition.carbGrams,
        fat: latestNutrition.fatGrams,
        calories: latestNutrition.targetCalories,
      }
    : { protein: 150, carbs: 250, fat: 70, calories: 2200 }

  const totalMacros = macros.protein + macros.carbs + macros.fat
  const proteinPct = Math.round((macros.protein / totalMacros) * 100)
  const carbsPct = Math.round((macros.carbs / totalMacros) * 100)
  const fatPct = Math.round((macros.fat / totalMacros) * 100)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-az-black-card border border-dark-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <Apple size={18} className="text-cyan" />
          <span className="text-sm font-medium text-cyan">My Nutrition</span>
        </div>
        <h2 className="text-xl font-semibold text-dark-primary">Daily Tracking</h2>
        <p className="text-sm text-dark-secondary mt-1">
          {latestNutrition
            ? `Target: ${macros.calories} kcal · ${macros.protein}g protein`
            : 'Track your meals and hydration for today'}
        </p>
      </motion.div>

      {/* Meal Check-off */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-az-black-card border border-dark-border rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-dark-primary mb-4">Meals</h3>
        <div className="space-y-3">
          {mealOrder.map((meal) => {
            const isDone = meals[meal.key]
            return (
              <div
                key={meal.key}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-success/5 border-success/30'
                    : 'bg-az-black border-dark-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <meal.icon
                    size={20}
                    className={isDone ? 'text-success' : 'text-dark-muted'}
                  />
                  <span
                    className={`font-medium ${
                      isDone ? 'text-success line-through' : 'text-dark-primary'
                    }`}
                  >
                    {meal.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMeal(meal.key)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDone
                        ? 'bg-success/20 text-success hover:bg-success/30'
                        : 'bg-dark-hover text-dark-muted hover:text-success hover:bg-success/10'
                    }`}
                    title="Mark as eaten"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <button
                    onClick={() => setMeals((prev) => ({ ...prev, [meal.key]: false }))}
                    className="p-2 rounded-lg bg-dark-hover text-dark-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    title="Mark as missed"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Water Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-az-black-card border border-dark-border rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-cyan" />
            <h3 className="text-lg font-semibold text-dark-primary">Water Intake</h3>
          </div>
          <span className="text-sm text-dark-muted">
            {waterGlasses} / {WATER_GOAL} glasses
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {Array.from({ length: WATER_GOAL }, (_, i) => (
            <button
              key={i}
              onClick={() => toggleWater(i)}
              className={`w-12 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${
                i < waterGlasses
                  ? 'bg-cyan/20 border-cyan text-cyan'
                  : 'bg-az-black border-dark-border text-dark-muted hover:border-cyan/50'
              }`}
            >
              <Droplets size={20} />
            </button>
          ))}
        </div>

        <div className="mt-4 w-full h-2 bg-dark-hover rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyan rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(waterGlasses / WATER_GOAL) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Macro Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-az-black-card border border-dark-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Flame size={18} className="text-warning" />
          <h3 className="text-lg font-semibold text-dark-primary">Macro Targets</h3>
        </div>

        <div className="space-y-4">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-dark-secondary">Protein</span>
              <span className="text-dark-primary font-medium">{macros.protein}g</span>
            </div>
            <div className="w-full h-3 bg-dark-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-dark-secondary">Carbs</span>
              <span className="text-dark-primary font-medium">{macros.carbs}g</span>
            </div>
            <div className="w-full h-3 bg-dark-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-warning rounded-full"
                style={{ width: `${carbsPct}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-dark-secondary">Fat</span>
              <span className="text-dark-primary font-medium">{macros.fat}g</span>
            </div>
            <div className="w-full h-3 bg-dark-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan rounded-full"
                style={{ width: `${fatPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-dark-border flex items-center justify-between">
          <span className="text-dark-secondary text-sm">Daily Calories</span>
          <span className="text-xl font-bold text-dark-primary">{macros.calories} kcal</span>
        </div>
      </motion.div>
    </div>
  )
}
