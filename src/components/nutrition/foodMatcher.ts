/* ═══════════════════════════════════════════
   FOOD MATCHER — Find best match in database
   Uses fuzzy string matching + keyword fallback
   ═══════════════════════════════════════════ */

import type { FoodItem } from './types'
import { FOOD_DB } from './data'

export interface MatchedFood {
  food: FoodItem
  matchedName: string
  quantity: number
  unit: string
  grams: number
  scaledCalories: number
  scaledProtein: number
  scaledCarbs: number
  scaledFats: number
  matchScore: number
  matchType: 'exact' | 'partial' | 'keyword'
}

/* ─── Simple fuzzy score (0-1) ─── */
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim()
  const t = target.toLowerCase().trim()

  if (q === t) return 1.0
  if (t.includes(q)) return 0.9
  if (q.includes(t)) return 0.8

  // Word overlap
  const qWords = q.split(/\s+/)
  const tWords = t.split(/\s+/)
  const overlap = qWords.filter((w) => tWords.some((tw) => tw.includes(w) || w.includes(tw))).length
  return overlap / Math.max(qWords.length, tWords.length) * 0.7
}

/* ─── Keyword expansion for common foods ─── */
const KEYWORD_ALIASES: Record<string, string[]> = {
  egg: ['eggs'],
  chicken: ['chicken breast', 'chicken thigh', 'chicken drumstick'],
  rice: ['white rice', 'brown rice', 'jasmine rice'],
  bread: ['white bread', 'whole wheat bread', 'sourdough bread'],
  milk: ['whole milk', 'skim milk', 'soy milk'],
  yogurt: ['greek yogurt', 'plain yogurt'],
  beef: ['beef sirloin', 'ground beef'],
  fish: ['salmon', 'tuna', 'shrimp', 'cod'],
  potato: ['potato', 'sweet potato'],
  pasta: ['pasta', 'spaghetti', 'noodles'],
  cheese: ['cheddar cheese', 'mozzarella', 'feta cheese'],
  oil: ['olive oil', 'coconut oil'],
  nut: ['almonds', 'walnuts', 'cashews'],
  juice: ['orange juice', 'apple juice'],
  coffee: ['black coffee'],
  tea: ['green tea', 'black tea'],
  butter: ['butter', 'peanut butter'],
  banana: ['banana'],
  apple: ['apple'],
  orange: ['orange'],
  steak: ['beef sirloin'],
  salmon: ['salmon fillet'],
  tuna: ['tuna (canned)'],
  shrimp: ['shrimp'],
  tofu: ['tofu (firm)'],
  oats: ['oats (rolled)'],
  quinoa: ['quinoa (cooked)'],
  broccoli: ['broccoli'],
  spinach: ['spinach'],
  carrot: ['carrots'],
  tomato: ['tomato'],
  avocado: ['avocado'],
  almond: ['almonds'],
  walnut: ['walnuts'],
  peanut: ['peanut butter'],
  chocolate: ['dark chocolate (70%)'],
  protein: ['whey protein', 'protein shake', 'protein bar'],
  shake: ['protein shake'],
  bar: ['protein bar'],
  granola: ['granola'],
  cracker: ['crackers', 'rice crackers'],
  soup: ['red bean soup'],
  pudding: ['tofu pudding'],
  tart: ['egg tart'],
  bun: ['pineapple bun'],
  dumpling: ['siu mai'],
  roll: ['spring roll'],
  cake: ['turnip cake'],
  fishball: ['curry fishball'],
  waffle: ['egg waffle'],
  onigiri: ['rice balls (onigiri)'],
  jerky: ['beef jerky'],
  seaweed: ['seaweed snacks'],
  popcorn: ['popcorn (air-popped)'],
  trailmix: ['trail mix'],
  mango: ['dried mango', 'mango'],
  lychee: ['lychee'],
  longan: ['longan'],
  durian: ['durian'],
  rambutan: ['rambutan'],
  mangosteen: ['mangosteen'],
  dragonfruit: ['dragon fruit'],
  starfruit: ['starfruit'],
  papaya: ['papaya'],
  kiwi: ['kiwi'],
  grape: ['grapes'],
  watermelon: ['watermelon'],
  pineapple: ['pineapple'],
  strawberry: ['strawberries'],
  blueberry: ['blueberries'],
  date: ['dates'],
  honey: ['honey'],
  croissant: ['croissant'],
  bagel: ['bagel'],
  naan: ['naan bread'],
  pita: ['pita bread'],
  tortilla: ['tortilla (flour)', 'corn tortilla'],
  noodle: ['rice noodles', 'egg noodles', 'udon noodles'],
  muesli: ['muesli'],
  ricecake: ['rice cakes'],
  kefir: ['kefir'],
  parmesan: ['parmesan'],
  ricotta: ['ricotta'],
  swiss: ['swiss cheese'],
  provolone: ['provolone'],
  halloumi: ['halloumi'],
  mascarpone: ['mascarpone'],
  creamcheese: ['cream cheese'],
  bokchoy: ['bok choy'],
  kale: ['kale'],
  cauliflower: ['cauliflower'],
  asparagus: ['asparagus'],
  brussels: ['brussels sprouts'],
  zucchini: ['zucchini'],
  mushroom: ['mushrooms'],
  cucumber: ['cucumber'],
  pepper: ['bell pepper'],
  snowpea: ['snow peas'],
  chinesebroccoli: ['chinese broccoli'],
  chia: ['chia seeds'],
  flax: ['flaxseeds'],
  tahini: ['tahini'],
  macadamia: ['macadamia nuts'],
  pistachio: ['pistachios'],
  pumpkinseed: ['pumpkin seeds'],
  sunflowerseed: ['sunflower seeds'],
  cashew: ['cashews'],
  lentil: ['lentils (cooked)'],
  edamame: ['edamame'],
  tempeh: ['tempeh'],
  soymilk: ['soy milk'],
  coconutwater: ['coconut water'],
  milktea: ['milk tea (hk style)'],
  lemontea: ['lemon tea'],
  yuanyang: ['yuan yang'],
  herbaltea: ['herbal tea'],
  barleywater: ['barley water'],
  chrysanthemum: ['chrysanthemum tea'],
  sugarcane: ['sugar cane juice'],
}

function expandKeyword(keyword: string): string[] {
  const k = keyword.toLowerCase().replace(/\s+/g, '')
  return KEYWORD_ALIASES[k] || []
}

/* ─── Find best match in database ─── */
export function findFoodMatch(foodName: string, foodDb: FoodItem[] = FOOD_DB): MatchedFood | null {
  const query = foodName.toLowerCase().trim()

  // 1. Exact or near-exact match
  let bestMatch: { food: FoodItem; score: number; type: 'exact' | 'partial' | 'keyword' } | null = null

  for (const food of foodDb) {
    const score = fuzzyScore(query, food.name)
    if (score >= 0.9 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { food, score, type: 'exact' }
    }
  }

  // 2. Partial match if no exact
  if (!bestMatch) {
    for (const food of foodDb) {
      const score = fuzzyScore(query, food.name)
      if (score >= 0.4 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { food, score, type: 'partial' }
      }
    }
  }

  // 3. Keyword alias fallback
  if (!bestMatch || bestMatch.score < 0.5) {
    const aliases = expandKeyword(query)
    for (const alias of aliases) {
      for (const food of foodDb) {
        const score = fuzzyScore(alias, food.name)
        if (score >= 0.6 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { food, score: score * 0.9, type: 'keyword' }
        }
      }
    }
  }

  if (!bestMatch) return null

  return {
    food: bestMatch.food,
    matchedName: bestMatch.food.name,
    quantity: 1,
    unit: 'serving',
    grams: 100,
    scaledCalories: bestMatch.food.calories,
    scaledProtein: bestMatch.food.protein,
    scaledCarbs: bestMatch.food.carbs,
    scaledFats: bestMatch.food.fats,
    matchScore: bestMatch.score,
    matchType: bestMatch.type,
  }
}

/* ─── Match with quantity and scale macros ─── */
export function matchAndScale(
  foodName: string,
  quantity: number,
  unit: string,
  foodDb: FoodItem[] = FOOD_DB
): MatchedFood | null {
  const base = findFoodMatch(foodName, foodDb)
  if (!base) return null

  // Inline convertToGrams to avoid circular dependency
  function toGrams(qty: number, u: string): number {
    switch (u) {
      case 'g': return qty
      case 'kg': return qty * 1000
      case 'oz': return qty * 28.35
      case 'lb': return qty * 453.6
      case 'cup': return qty * 240
      case 'tbsp': return qty * 15
      case 'tsp': return qty * 5
      case 'slice': return qty * 30
      case 'piece': return qty * 50
      case 'scoop': return qty * 30
      case 'bowl': return qty * 350
      case 'plate': return qty * 500
      case 'serving': return qty * 100
      case 'large': return qty * 60
      case 'medium': return qty * 50
      case 'small': return qty * 40
      default: return qty * 100
    }
  }
  const grams = toGrams(quantity, unit)
  const ratio = grams / 100

  return {
    ...base,
    quantity,
    unit,
    grams,
    scaledCalories: Math.round(base.food.calories * ratio),
    scaledProtein: Math.round(base.food.protein * ratio * 10) / 10,
    scaledCarbs: Math.round(base.food.carbs * ratio * 10) / 10,
    scaledFats: Math.round(base.food.fats * ratio * 10) / 10,
  }
}
