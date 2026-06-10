import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X, Flame, Dumbbell, Wheat as WheatIcon, Droplets, Star, History } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import type { FoodItem, MealType } from './types'

interface AddMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealType: MealType
  foodDb: FoodItem[]
  onAdd: (foodId: number, quantity: number) => void
}

/* ─── Recent foods (localStorage) ─── */
const RECENT_KEY = 'azfit_recent_foods'
const FAVORITES_KEY = 'azfit_favorite_foods'

function getRecentFoodIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch { return [] }
}

function addRecentFoodId(id: number) {
  const recent = getRecentFoodIds()
  const updated = [id, ...recent.filter((fid) => fid !== id)].slice(0, 10)
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
}

function getFavoriteFoodIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  } catch { return [] }
}

function toggleFavoriteFoodId(id: number) {
  const favs = getFavoriteFoodIds()
  const updated = favs.includes(id) ? favs.filter((fid) => fid !== id) : [...favs, id]
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
  return updated
}

/* ─── Debounce hook ─── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function AddMealDialog({ open, onOpenChange, mealType, foodDb, onAdd }: AddMealDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState(100)
  const [favorites, setFavorites] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'recent' | 'favorites'>('search')
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (open) {
      setFavorites(getFavoriteFoodIds())
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setSearchTerm('')
      setSelectedFood(null)
      setQuantity(100)
      setActiveTab('search')
    }
  }, [open])

  const filteredFoods = useMemo(() => {
    if (!debouncedSearch.trim()) return []
    const q = debouncedSearch.toLowerCase()
    return foodDb
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, 10)
  }, [debouncedSearch, foodDb])

  const recentFoods = useMemo(() => {
    const ids = getRecentFoodIds()
    return ids.map((id) => foodDb.find((f) => f.id === id)).filter(Boolean) as FoodItem[]
  }, [foodDb, open])

  const favoriteFoods = useMemo(() => {
    return favorites.map((id) => foodDb.find((f) => f.id === id)).filter(Boolean) as FoodItem[]
  }, [favorites, foodDb])

  const handleSelectFood = useCallback((food: FoodItem) => {
    setSelectedFood(food)
    setQuantity(100)
  }, [])

  const handleAdd = useCallback(() => {
    if (!selectedFood) return
    addRecentFoodId(selectedFood.id)
    onAdd(selectedFood.id, quantity)
    onOpenChange(false)
  }, [selectedFood, quantity, onAdd, onOpenChange])

  const handleToggleFavorite = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setFavorites(toggleFavoriteFoodId(id))
  }, [])

  // Macro preview for selected food
  const preview = useMemo(() => {
    if (!selectedFood) return null
    const ratio = quantity / 100
    return {
      calories: Math.round(selectedFood.calories * ratio),
      protein: Math.round(selectedFood.protein * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbs * ratio * 10) / 10,
      fats: Math.round(selectedFood.fats * ratio * 10) / 10,
    }
  }, [selectedFood, quantity])

  const mealEmoji: Record<MealType, string> = {
    Breakfast: '🍳',
    Lunch: '🍱',
    Dinner: '🍽️',
    Snacks: '🍎',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-az-black-card border-dark-border text-dark-primary max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-dark-primary text-base flex items-center gap-2">
            <span>{mealEmoji[mealType]}</span>
            Add to {mealType}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 mt-2">
          {(['search', 'recent', 'favorites'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-cyan/20 text-cyan'
                  : 'text-dark-muted hover:text-dark-secondary hover:bg-dark-hover'
              }`}
            >
              {tab === 'search' && <Search size={12} className="inline mr-1" />}
              {tab === 'recent' && <History size={12} className="inline mr-1" />}
              {tab === 'favorites' && <Star size={12} className="inline mr-1" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search input (only for search tab) */}
        {activeTab === 'search' && (
          <div className="relative mt-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-az-black-elevated border border-dark-border rounded-lg pl-9 pr-3 text-dark-primary text-sm placeholder:text-dark-subtle focus:outline-none focus:border-cyan"
            />
          </div>
        )}

        {/* Food list */}
        <div className="flex-1 overflow-y-auto mt-2 space-y-1 min-h-[120px]">
          <AnimatePresence mode="wait">
            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {debouncedSearch.trim() === '' ? (
                  <div className="text-center py-8">
                    <Search size={24} className="text-dark-subtle mx-auto mb-2" />
                    <p className="text-dark-muted text-xs">Type to search 120+ foods</p>
                  </div>
                ) : filteredFoods.length === 0 ? (
                  <div className="text-center py-8">
                    <X size={24} className="text-dark-subtle mx-auto mb-2" />
                    <p className="text-dark-muted text-xs">No foods found</p>
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <FoodListItem
                      key={food.id}
                      food={food}
                      isSelected={selectedFood?.id === food.id}
                      isFavorite={favorites.includes(food.id)}
                      onSelect={() => handleSelectFood(food)}
                      onToggleFavorite={(e) => handleToggleFavorite(e, food.id)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'recent' && (
              <motion.div
                key="recent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {recentFoods.length === 0 ? (
                  <div className="text-center py-8">
                    <History size={24} className="text-dark-subtle mx-auto mb-2" />
                    <p className="text-dark-muted text-xs">No recently used foods</p>
                  </div>
                ) : (
                  recentFoods.map((food) => (
                    <FoodListItem
                      key={food.id}
                      food={food}
                      isSelected={selectedFood?.id === food.id}
                      isFavorite={favorites.includes(food.id)}
                      onSelect={() => handleSelectFood(food)}
                      onToggleFavorite={(e) => handleToggleFavorite(e, food.id)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {favoriteFoods.length === 0 ? (
                  <div className="text-center py-8">
                    <Star size={24} className="text-dark-subtle mx-auto mb-2" />
                    <p className="text-dark-muted text-xs">No favorites yet</p>
                    <p className="text-dark-subtle text-[10px] mt-1">Star foods from search to add here</p>
                  </div>
                ) : (
                  favoriteFoods.map((food) => (
                    <FoodListItem
                      key={food.id}
                      food={food}
                      isSelected={selectedFood?.id === food.id}
                      isFavorite={true}
                      onSelect={() => handleSelectFood(food)}
                      onToggleFavorite={(e) => handleToggleFavorite(e, food.id)}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected food detail + serving + preview */}
        <AnimatePresence>
          {selectedFood && preview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-3 bg-az-black-elevated border border-dark-border rounded-xl p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-dark-primary text-sm font-medium">{selectedFood.name}</span>
                <button
                  onClick={() => setSelectedFood(null)}
                  className="text-dark-muted hover:text-danger"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Serving size */}
              <div className="flex items-center gap-3">
                <span className="text-dark-muted text-xs">Serving:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-20 h-8 bg-dark-hover border border-dark-border rounded-lg px-2 text-dark-primary text-sm text-center focus:outline-none focus:border-cyan"
                    min={1}
                  />
                  <span className="text-dark-muted text-xs">grams</span>
                </div>
                <span className="text-dark-subtle text-[10px] ml-auto">{selectedFood.serving} = {selectedFood.calories} kcal</span>
              </div>

              {/* Macro preview */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center bg-az-black-card rounded-lg py-2">
                  <Flame size={12} className="text-orange mx-auto mb-1" />
                  <p className="text-dark-primary text-xs font-bold font-mono">{preview.calories}</p>
                  <p className="text-dark-subtle text-[9px]">kcal</p>
                </div>
                <div className="text-center bg-az-black-card rounded-lg py-2">
                  <Dumbbell size={12} className="text-cyan mx-auto mb-1" />
                  <p className="text-cyan text-xs font-bold font-mono">{preview.protein}g</p>
                  <p className="text-dark-subtle text-[9px]">protein</p>
                </div>
                <div className="text-center bg-az-black-card rounded-lg py-2">
                  <WheatIcon size={12} className="text-violet mx-auto mb-1" />
                  <p className="text-violet text-xs font-bold font-mono">{preview.carbs}g</p>
                  <p className="text-dark-subtle text-[9px]">carbs</p>
                </div>
                <div className="text-center bg-az-black-card rounded-lg py-2">
                  <Droplets size={12} className="text-orange mx-auto mb-1" />
                  <p className="text-orange text-xs font-bold font-mono">{preview.fats}g</p>
                  <p className="text-dark-subtle text-[9px]">fats</p>
                </div>
              </div>

              {/* Add button */}
              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium py-2.5 rounded-lg text-sm transition-all hover:scale-[1.02]"
              >
                <Plus size={14} />
                Add to {mealType}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Food list item ─── */
function FoodListItem({
  food,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  food: FoodItem
  isSelected: boolean
  isFavorite: boolean
  onSelect: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
}) {
  const categoryColors: Record<string, string> = {
    Protein: 'text-cyan',
    Carbs: 'text-violet',
    Fats: 'text-orange',
    Vegetables: 'text-success',
    Fruits: 'text-trainer-accent',
    Dairy: 'text-info',
    Grains: 'text-warning',
    Snacks: 'text-orange',
    Beverages: 'text-teal',
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
        isSelected
          ? 'bg-cyan/10 border border-cyan/30'
          : 'hover:bg-dark-hover border border-transparent'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-dark-primary text-xs font-medium truncate">{food.name}</span>
          <span className={`text-[9px] ${categoryColors[food.category] || 'text-dark-muted'}`}>{food.category}</span>
        </div>
        <span className="text-dark-muted text-[10px] font-mono">
          {food.calories} kcal/100g · P:{food.protein}g C:{food.carbs}g F:{food.fats}g
        </span>
      </div>
      <button
        onClick={onToggleFavorite}
        className={`flex-shrink-0 transition-colors ${
          isFavorite ? 'text-warning' : 'text-dark-subtle hover:text-warning'
        }`}
      >
        <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </button>
  )
}
