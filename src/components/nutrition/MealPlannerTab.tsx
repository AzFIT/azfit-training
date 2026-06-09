import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Utensils, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'
import type { FoodItem, MealEntry, MealType } from './types'


interface MealEntryWithFood extends MealEntry {
  food: FoodItem
}

export default function MealPlannerTab({
  meals,
  onAddFood,
  onRemoveFood,
  foodDb,
  date,
  onDateChange,
}: {
  meals: MealEntry[]
  onAddFood: (mealType: MealType, foodId: number, qty: number) => void
  onRemoveFood: (entryId: string) => void
  foodDb: FoodItem[]
  date: Date
  onDateChange: (d: Date) => void
}) {
  const [addingToMeal, setAddingToMeal] = useState<MealType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFood, setSelectedFood] = useState('')
  const [quantity, setQuantity] = useState(100)

  const mealTypes: { type: MealType; time: string; target: number }[] = [
    { type: 'Breakfast', time: '7:00 AM', target: 600 },
    { type: 'Lunch', time: '12:30 PM', target: 700 },
    { type: 'Dinner', time: '7:00 PM', target: 700 },
    { type: 'Snacks', time: '3:00 PM', target: 400 },
  ]

  const filteredFoods = useMemo(() => {
    if (!searchTerm) return []
    return foodDb.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8)
  }, [searchTerm, foodDb])

  const getMealFoods = (type: MealType): MealEntryWithFood[] =>
    meals
      .filter((m) => m.mealType === type)
      .map((m) => {
        const food = foodDb.find((f) => f.id === m.foodId)
        return food ? { ...m, food } : null
      })
      .filter((m): m is MealEntryWithFood => m !== null)

  const getMealTotals = (type: MealType) => {
    const foods = getMealFoods(type)
    return foods.reduce(
      (acc, f) => ({
        calories: acc.calories + (f.food.calories * f.quantity) / 100,
        protein: acc.protein + (f.food.protein * f.quantity) / 100,
        carbs: acc.carbs + (f.food.carbs * f.quantity) / 100,
        fats: acc.fats + (f.food.fats * f.quantity) / 100,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
  }

  const dailyTotals = useMemo(() => {
    return mealTypes.reduce(
      (acc, m) => {
        const t = getMealTotals(m.type)
        return {
          calories: acc.calories + t.calories,
          protein: acc.protein + t.protein,
          carbs: acc.carbs + t.carbs,
          fats: acc.fats + t.fats,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
  }, [meals])

  const handleAddFood = (mealType: MealType) => {
    if (selectedFood) {
      onAddFood(mealType, parseInt(selectedFood), quantity)
      setSelectedFood('')
      setSearchTerm('')
      setQuantity(100)
      setAddingToMeal(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => onDateChange(subDays(date, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-secondary hover:text-dark-primary hover:bg-dark-hover transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-dark-primary font-semibold text-sm min-w-[180px] text-center">
          {format(date, 'EEEE, d MMMM')}
        </h3>
        <button
          onClick={() => onDateChange(addDays(date, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-secondary hover:text-dark-primary hover:bg-dark-hover transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onDateChange(new Date())}
          className="ml-1 px-3 py-1.5 rounded-lg text-xs text-dark-secondary hover:text-dark-primary hover:bg-dark-hover border border-dark-border transition-colors"
        >
          Today
        </button>
      </div>

      {/* Meal cards */}
      {mealTypes.map((mealType, idx) => {
        const foods = getMealFoods(mealType.type)
        const totals = getMealTotals(mealType.type)
        const progress = mealType.target > 0 ? Math.min((totals.calories / mealType.target) * 100, 100) : 0

        return (
          <motion.div
            key={mealType.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[az-black-card] border border-dark-border rounded-xl p-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Utensils size={16} className="text-cyan" />
                <h4 className="text-dark-primary font-semibold text-sm">{mealType.type}</h4>
                <span className="text-dark-muted text-xs font-mono">{mealType.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-dark-secondary text-xs font-mono">
                  {Math.round(totals.calories)} / {mealType.target} kcal
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-[az-black-elevated] rounded-full mb-3">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    progress > 100
                      ? 'danger'
                      : progress > 80
                        ? 'success'
                        : 'cyan',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              />
            </div>

            {/* Food items */}
            <div className="space-y-2 mb-3">
              <AnimatePresence>
                {foods.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between py-1.5 px-2 bg-[az-black-elevated] rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-dark-primary text-xs font-medium truncate">{f.food.name}</span>
                        <span className="text-dark-muted text-[10px] font-mono flex-shrink-0">{f.quantity}g</span>
                      </div>
                      <span className="text-dark-muted text-[10px] font-mono">
                        P:{Math.round((f.food.protein * f.quantity) / 100)} C:
                        {Math.round((f.food.carbs * f.quantity) / 100)} F:
                        {Math.round((f.food.fats * f.quantity) / 100)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-dark-secondary text-xs font-mono">
                        {Math.round((f.food.calories * f.quantity) / 100)} kcal
                      </span>
                      <button
                        onClick={() => onRemoveFood(f.id)}
                        className="text-dark-muted hover:text-danger transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add food */}
            {addingToMeal === mealType.type ? (
              <div className="bg-[az-black-elevated] rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSelectedFood('')
                  }}
                  className="w-full h-9 bg-dark-hover border border-dark-border rounded-lg px-3 text-dark-primary text-xs placeholder:text-dark-subtle focus:outline-none focus:border-cyan"
                  autoFocus
                />
                {filteredFoods.length > 0 && (
                  <div className="max-h-32 overflow-auto space-y-1">
                    {filteredFoods.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setSelectedFood(String(f.id))
                          setSearchTerm(f.name)
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                          selectedFood === String(f.id)
                            ? 'bg-cyan-glow text-cyan'
                            : 'text-dark-secondary hover:bg-dark-hover'
                        }`}
                      >
                        <span className="font-medium">{f.name}</span>
                        <span className="text-dark-muted ml-2">{f.calories} kcal/100g</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 h-8 bg-dark-hover border border-dark-border rounded-lg px-2 text-dark-primary text-xs focus:outline-none focus:border-cyan"
                    min={1}
                  />
                  <span className="text-dark-muted text-xs">grams</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddFood(mealType.type)}
                    className="px-3 py-1.5 bg-cyan hover:bg-cyan-hover text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setAddingToMeal(null)
                      setSearchTerm('')
                      setSelectedFood('')
                    }}
                    className="px-3 py-1.5 text-dark-muted hover:text-dark-primary rounded-lg text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingToMeal(mealType.type)}
                className="flex items-center gap-1 text-cyan hover:text-[cyan-light] text-xs font-medium transition-colors"
              >
                <Plus size={14} />
                Add Food
              </button>
            )}
          </motion.div>
        )
      })}

      {/* Daily summary bar */}
      <div className="bg-[az-black-card] border border-dark-border rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-dark-primary text-sm font-semibold">Daily Totals</span>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-dark-muted text-[10px]">Calories</p>
              <p className="text-dark-primary text-xs font-bold font-mono">
                {Math.round(dailyTotals.calories)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-cyan text-[10px]">Protein</p>
              <p className="text-cyan text-xs font-bold font-mono">{Math.round(dailyTotals.protein)}g</p>
            </div>
            <div className="text-center">
              <p className="text-violet text-[10px]">Carbs</p>
              <p className="text-violet text-xs font-bold font-mono">{Math.round(dailyTotals.carbs)}g</p>
            </div>
            <div className="text-center">
              <p className="text-orange text-[10px]">Fats</p>
              <p className="text-orange text-xs font-bold font-mono">{Math.round(dailyTotals.fats)}g</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
