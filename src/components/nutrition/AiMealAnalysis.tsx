import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Search, Plus, X, Check, AlertCircle, Flame, Dumbbell, Wheat as WheatIcon, Droplets } from 'lucide-react'
import { parseMealDescription } from './mealParser'
import { matchAndScale } from './foodMatcher'
import type { FoodItem } from './types'

interface AiMealAnalysisProps {
  foodDb: FoodItem[]
  onAddToLog: (items: { food: FoodItem; quantity: number; grams: number; calories: number; protein: number; carbs: number; fats: number }[]) => void
}

export default function AiMealAnalysis({ foodDb, onAddToLog }: AiMealAnalysisProps) {
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<ReturnType<typeof analyzeMeal> | null>(null)

  interface MatchResult {
    parsed: ReturnType<typeof parseMealDescription>[0]
    matched: NonNullable<ReturnType<typeof matchAndScale>>
  }

  function analyzeMeal(text: string) {
    const parsed = parseMealDescription(text)
    const matches: MatchResult[] = []
    for (const p of parsed) {
      const matched = matchAndScale(p.foodName, p.quantity, p.unit, foodDb)
      if (matched) {
        matches.push({ parsed: p, matched })
      }
    }

    const unmatched = parsed.filter((p) => !matches.some((m) => m.parsed.rawText === p.rawText))

    const totals = matches.reduce(
      (acc, m) => ({
        calories: acc.calories + m.matched.scaledCalories,
        protein: acc.protein + m.matched.scaledProtein,
        carbs: acc.carbs + m.matched.scaledCarbs,
        fats: acc.fats + m.matched.scaledFats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )

    return { matches, unmatched, totals }
  }

  const handleAnalyze = useCallback(() => {
    if (!input.trim()) return
    setIsAnalyzing(true)
    // Simulate brief "thinking" delay for UX
    setTimeout(() => {
      const result = analyzeMeal(input)
      setResults(result)
      setIsAnalyzing(false)
    }, 400)
  }, [input])

  const handleAddAll = useCallback(() => {
    if (!results) return
    const items = results.matches.map((m) => ({
      food: m.matched.food,
      quantity: m.matched.quantity,
      grams: m.matched.grams,
      calories: m.matched.scaledCalories,
      protein: m.matched.scaledProtein,
      carbs: m.matched.scaledCarbs,
      fats: m.matched.scaledFats,
    }))
    onAddToLog(items)
    setInput('')
    setResults(null)
  }, [results, onAddToLog])

  const confidenceColor = (type: string) => {
    switch (type) {
      case 'exact': return 'text-success'
      case 'partial': return 'text-warning'
      default: return 'text-dark-muted'
    }
  }

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-az-black-card border border-dark-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-cyan" />
          <h3 className="text-dark-primary font-semibold text-sm">AI Meal Analysis (Beta)</h3>
        </div>
        <p className="text-dark-muted text-xs mb-3">
          Describe what you ate in plain English. We'll estimate the macros.
        </p>

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`e.g. "2 eggs, 2 slices toast with butter, orange juice"`}
            className="w-full h-24 bg-az-black-elevated border border-dark-border rounded-xl p-3 text-dark-primary text-sm placeholder:text-dark-subtle focus:outline-none focus:border-cyan resize-none"
          />
          {input && (
            <button
              onClick={() => { setInput(''); setResults(null) }}
              className="absolute top-2 right-2 text-dark-muted hover:text-dark-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-dark-subtle text-[10px]">
            Try: "150g chicken breast, 1 cup rice, steamed broccoli"
          </span>
          <button
            onClick={handleAnalyze}
            disabled={!input.trim() || isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-cyan hover:bg-cyan-hover disabled:opacity-50 disabled:hover:bg-cyan text-white text-xs font-medium rounded-lg transition-all"
          >
            {isAnalyzing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Sparkles size={14} />
              </motion.div>
            ) : (
              <Search size={14} />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-az-black-card border border-dark-border rounded-2xl p-4 space-y-4"
          >
            {/* Matched items */}
            {results.matches.length > 0 && (
              <div>
                <h4 className="text-dark-primary text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Check size={12} className="text-success" />
                  Matched Foods ({results.matches.length})
                </h4>
                <div className="space-y-2">
                  {results.matches.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-az-black-elevated rounded-lg px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-dark-primary text-xs font-medium truncate">
                            {item.matched.food.name}
                          </span>
                          <span className={`text-[9px] ${confidenceColor(item.matched.matchType)}`}>
                            {item.matched.matchType}
                          </span>
                        </div>
                        <span className="text-dark-subtle text-[10px]">
                          {item.parsed.quantity} {item.parsed.unit} → {item.matched.grams}g
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-dark-primary text-xs font-mono">{item.matched.scaledCalories} kcal</span>
                        <div className="text-dark-muted text-[9px] font-mono">
                          P:{Math.round(item.matched.scaledProtein)}g C:{Math.round(item.matched.scaledCarbs)}g F:{Math.round(item.matched.scaledFats)}g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unmatched items */}
            {results.unmatched.length > 0 && (
              <div>
                <h4 className="text-warning text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  Couldn't Match ({results.unmatched.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {results.unmatched.map((u, i) => (
                    <span key={i} className="px-2 py-1 bg-warning/10 text-warning text-[10px] rounded-full">
                      "{u.rawText}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="bg-az-black-elevated border border-dark-border rounded-xl p-3">
              <h4 className="text-dark-primary text-xs font-semibold mb-2">Estimated Totals</h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <Flame size={12} className="text-orange mx-auto mb-1" />
                  <p className="text-dark-primary text-sm font-bold font-mono">{results.totals.calories}</p>
                  <p className="text-dark-subtle text-[9px]">kcal</p>
                </div>
                <div className="text-center">
                  <Dumbbell size={12} className="text-cyan mx-auto mb-1" />
                  <p className="text-cyan text-sm font-bold font-mono">{Math.round(results.totals.protein)}g</p>
                  <p className="text-dark-subtle text-[9px]">protein</p>
                </div>
                <div className="text-center">
                  <WheatIcon size={12} className="text-violet mx-auto mb-1" />
                  <p className="text-violet text-sm font-bold font-mono">{Math.round(results.totals.carbs)}g</p>
                  <p className="text-dark-subtle text-[9px]">carbs</p>
                </div>
                <div className="text-center">
                  <Droplets size={12} className="text-orange mx-auto mb-1" />
                  <p className="text-orange text-sm font-bold font-mono">{Math.round(results.totals.fats)}g</p>
                  <p className="text-dark-subtle text-[9px]">fats</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleAddAll}
                className="flex-1 flex items-center justify-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium py-2.5 rounded-lg text-sm transition-all hover:scale-[1.02]"
              >
                <Plus size={14} />
                Add to My Meals
              </button>
              <button
                onClick={() => setResults(null)}
                className="px-4 py-2.5 text-dark-muted hover:text-dark-primary rounded-lg text-sm transition-colors"
              >
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
