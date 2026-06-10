import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import type { FoodItem, FoodCategory } from './types'
import { CATEGORY_COLORS } from './data'

export default function FoodDatabaseTab({ foodDb }: { foodDb: FoodItem[] }) {
  const [search, setSearch] = useState('')
  const [activeCategories, setActiveCategories] = useState<FoodCategory[]>([])

  const categories: FoodCategory[] = [
    'Protein', 'Carbs', 'Fats', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Snacks', 'Beverages',
  ]

  const toggleCategory = (cat: FoodCategory) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const filtered = useMemo(() => {
    return foodDb.filter((f) => {
      const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategories.length === 0 || activeCategories.includes(f.category)
      return matchSearch && matchCat
    })
  }, [foodDb, search, activeCategories])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
        <input
          type="text"
          placeholder="Search 120+ foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 bg-az-black-card border border-dark-border rounded-xl pl-10 pr-4 text-dark-primary text-sm placeholder:text-dark-subtle focus:outline-none focus:border-cyan"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = activeCategories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-cyan-glow text-cyan border border-[rgba(0,174,239,0.3)]'
                  : 'bg-az-black-elevated text-dark-secondary border border-dark-border hover:text-dark-primary'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      <p className="text-dark-muted text-xs">{filtered.length} results</p>

      {/* Food grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {filtered.map((food, idx) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-az-black-card border border-dark-border rounded-xl p-4 hover:border-dark-subtle transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-dark-primary text-sm font-semibold truncate">{food.name}</h4>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: `${CATEGORY_COLORS[food.category]}20`,
                    color: CATEGORY_COLORS[food.category],
                  }}
                >
                  {food.category}
                </span>
                <span className="text-dark-muted text-[10px]">{food.serving}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-primary text-sm font-bold font-mono">{food.calories} kcal</span>
                <span className="text-dark-muted text-[10px] font-mono">
                  P:{food.protein} C:{food.carbs} F:{food.fats}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
