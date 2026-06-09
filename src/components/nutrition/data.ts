import type { FoodItem, FoodCategory, ActivityLevel, Goal, DietPreset } from './types'

/* ═══════════════════════════════════════════
   DEMO DATA — 120 HK FOODS
   ═══════════════════════════════════════════ */
export function generateFoodDatabase(): FoodItem[] {
  const foods: Omit<FoodItem, 'id'>[] = [
    // Proteins
    { name: 'Chicken Breast', category: 'Protein', calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: '100g' },
    { name: 'Salmon Fillet', category: 'Protein', calories: 208, protein: 20, carbs: 0, fats: 13, serving: '100g' },
    { name: 'Beef Sirloin', category: 'Protein', calories: 206, protein: 26, carbs: 0, fats: 11, serving: '100g' },
    { name: 'Pork Tenderloin', category: 'Protein', calories: 143, protein: 26, carbs: 0, fats: 3.5, serving: '100g' },
    { name: 'Eggs', category: 'Protein', calories: 155, protein: 13, carbs: 1.1, fats: 11, serving: '2 large' },
    { name: 'Tofu (Firm)', category: 'Protein', calories: 144, protein: 17, carbs: 3, fats: 9, serving: '100g' },
    { name: 'Greek Yogurt', category: 'Protein', calories: 97, protein: 9, carbs: 3.6, fats: 5, serving: '100g' },
    { name: 'Cottage Cheese', category: 'Protein', calories: 98, protein: 11, carbs: 3.4, fats: 4.3, serving: '100g' },
    { name: 'Whey Protein', category: 'Protein', calories: 120, protein: 24, carbs: 3, fats: 1, serving: '30g scoop' },
    { name: 'Tuna (Canned)', category: 'Protein', calories: 132, protein: 28, carbs: 0, fats: 1, serving: '100g' },
    { name: 'Shrimp', category: 'Protein', calories: 99, protein: 24, carbs: 0.2, fats: 0.3, serving: '100g' },
    { name: 'Turkey Breast', category: 'Protein', calories: 135, protein: 30, carbs: 0, fats: 1, serving: '100g' },
    { name: 'Lentils (Cooked)', category: 'Protein', calories: 116, protein: 9, carbs: 20, fats: 0.4, serving: '100g' },
    { name: 'Edamame', category: 'Protein', calories: 122, protein: 11, carbs: 9, fats: 5, serving: '100g' },
    { name: 'Tempeh', category: 'Protein', calories: 193, protein: 19, carbs: 9, fats: 11, serving: '100g' },
    // Carbs
    { name: 'White Rice (Cooked)', category: 'Carbs', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: '100g' },
    { name: 'Brown Rice (Cooked)', category: 'Carbs', calories: 112, protein: 2.6, carbs: 24, fats: 0.9, serving: '100g' },
    { name: 'Oats (Rolled)', category: 'Carbs', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, serving: '100g' },
    { name: 'Quinoa (Cooked)', category: 'Carbs', calories: 120, protein: 4.4, carbs: 21, fats: 1.9, serving: '100g' },
    { name: 'Sweet Potato', category: 'Carbs', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, serving: '100g' },
    { name: 'Whole Wheat Bread', category: 'Carbs', calories: 247, protein: 13, carbs: 41, fats: 3.4, serving: '100g' },
    { name: 'Pasta (Cooked)', category: 'Carbs', calories: 131, protein: 5, carbs: 25, fats: 1.1, serving: '100g' },
    { name: 'Banana', category: 'Carbs', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, serving: '1 medium' },
    { name: 'Apple', category: 'Carbs', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, serving: '1 medium' },
    { name: 'Blueberries', category: 'Carbs', calories: 57, protein: 0.7, carbs: 14, fats: 0.3, serving: '100g' },
    { name: 'Dates', category: 'Carbs', calories: 282, protein: 2.5, carbs: 75, fats: 0.4, serving: '100g' },
    { name: 'Honey', category: 'Carbs', calories: 304, protein: 0.3, carbs: 82, fats: 0, serving: '100g' },
    { name: 'Potato (Cooked)', category: 'Carbs', calories: 87, protein: 1.9, carbs: 20, fats: 0.1, serving: '100g' },
    { name: 'Couscous (Cooked)', category: 'Carbs', calories: 112, protein: 3.8, carbs: 23, fats: 0.2, serving: '100g' },
    { name: 'Barley (Cooked)', category: 'Carbs', calories: 123, protein: 2.3, carbs: 28, fats: 0.4, serving: '100g' },
    // Fats
    { name: 'Avocado', category: 'Fats', calories: 160, protein: 2, carbs: 8.5, fats: 15, serving: '100g' },
    { name: 'Almonds', category: 'Fats', calories: 579, protein: 21, carbs: 22, fats: 50, serving: '100g' },
    { name: 'Walnuts', category: 'Fats', calories: 654, protein: 15, carbs: 14, fats: 65, serving: '100g' },
    { name: 'Olive Oil', category: 'Fats', calories: 884, protein: 0, carbs: 0, fats: 100, serving: '100ml' },
    { name: 'Peanut Butter', category: 'Fats', calories: 588, protein: 25, carbs: 20, fats: 50, serving: '100g' },
    { name: 'Chia Seeds', category: 'Fats', calories: 486, protein: 17, carbs: 42, fats: 31, serving: '100g' },
    { name: 'Flaxseeds', category: 'Fats', calories: 534, protein: 18, carbs: 29, fats: 42, serving: '100g' },
    { name: 'Coconut Oil', category: 'Fats', calories: 862, protein: 0, carbs: 0, fats: 100, serving: '100ml' },
    { name: 'Dark Chocolate (70%)', category: 'Fats', calories: 598, protein: 7.8, carbs: 46, fats: 43, serving: '100g' },
    { name: 'Cashews', category: 'Fats', calories: 553, protein: 18, carbs: 30, fats: 44, serving: '100g' },
    { name: 'Pumpkin Seeds', category: 'Fats', calories: 559, protein: 30, carbs: 11, fats: 49, serving: '100g' },
    { name: 'Sunflower Seeds', category: 'Fats', calories: 584, protein: 21, carbs: 20, fats: 51, serving: '100g' },
    { name: 'Tahini', category: 'Fats', calories: 595, protein: 17, carbs: 21, fats: 54, serving: '100g' },
    { name: 'Macadamia Nuts', category: 'Fats', calories: 718, protein: 7.9, carbs: 14, fats: 76, serving: '100g' },
    { name: 'Pistachios', category: 'Fats', calories: 560, protein: 20, carbs: 28, fats: 45, serving: '100g' },
    // Vegetables
    { name: 'Broccoli', category: 'Vegetables', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving: '100g' },
    { name: 'Spinach', category: 'Vegetables', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, serving: '100g' },
    { name: 'Kale', category: 'Vegetables', calories: 49, protein: 4.3, carbs: 9, fats: 0.9, serving: '100g' },
    { name: 'Bell Pepper', category: 'Vegetables', calories: 31, protein: 1, carbs: 6, fats: 0.3, serving: '100g' },
    { name: 'Carrots', category: 'Vegetables', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, serving: '100g' },
    { name: 'Cauliflower', category: 'Vegetables', calories: 25, protein: 1.9, carbs: 5, fats: 0.3, serving: '100g' },
    { name: 'Asparagus', category: 'Vegetables', calories: 20, protein: 2.2, carbs: 3.9, fats: 0.1, serving: '100g' },
    { name: 'Brussels Sprouts', category: 'Vegetables', calories: 43, protein: 3.4, carbs: 9, fats: 0.3, serving: '100g' },
    { name: 'Zucchini', category: 'Vegetables', calories: 17, protein: 1.2, carbs: 3.1, fats: 0.3, serving: '100g' },
    { name: 'Mushrooms', category: 'Vegetables', calories: 22, protein: 3.1, carbs: 3.3, fats: 0.3, serving: '100g' },
    { name: 'Cucumber', category: 'Vegetables', calories: 16, protein: 0.7, carbs: 3.6, fats: 0.1, serving: '100g' },
    { name: 'Tomato', category: 'Vegetables', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, serving: '100g' },
    { name: 'Bok Choy', category: 'Vegetables', calories: 13, protein: 1.5, carbs: 2.2, fats: 0.2, serving: '100g' },
    { name: 'Chinese Broccoli', category: 'Vegetables', calories: 22, protein: 2.6, carbs: 3, fats: 0.3, serving: '100g' },
    { name: 'Snow Peas', category: 'Vegetables', calories: 42, protein: 2.8, carbs: 7.6, fats: 0.2, serving: '100g' },
    // Fruits
    { name: 'Orange', category: 'Fruits', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, serving: '1 medium' },
    { name: 'Strawberries', category: 'Fruits', calories: 32, protein: 0.7, carbs: 7.7, fats: 0.3, serving: '100g' },
    { name: 'Mango', category: 'Fruits', calories: 60, protein: 0.8, carbs: 15, fats: 0.4, serving: '100g' },
    { name: 'Pineapple', category: 'Fruits', calories: 50, protein: 0.5, carbs: 13, fats: 0.1, serving: '100g' },
    { name: 'Watermelon', category: 'Fruits', calories: 30, protein: 0.6, carbs: 8, fats: 0.2, serving: '100g' },
    { name: 'Grapes', category: 'Fruits', calories: 69, protein: 0.7, carbs: 18, fats: 0.2, serving: '100g' },
    { name: 'Kiwi', category: 'Fruits', calories: 61, protein: 1.1, carbs: 15, fats: 0.5, serving: '1 medium' },
    { name: 'Papaya', category: 'Fruits', calories: 43, protein: 0.5, carbs: 11, fats: 0.3, serving: '100g' },
    { name: 'Dragon Fruit', category: 'Fruits', calories: 60, protein: 1.2, carbs: 13, fats: 0, serving: '100g' },
    { name: 'Lychee', category: 'Fruits', calories: 66, protein: 0.8, carbs: 17, fats: 0.4, serving: '100g' },
    { name: 'Longan', category: 'Fruits', calories: 60, protein: 1.3, carbs: 15, fats: 0.1, serving: '100g' },
    { name: 'Durian', category: 'Fruits', calories: 147, protein: 1.5, carbs: 27, fats: 5.3, serving: '100g' },
    { name: 'Rambutan', category: 'Fruits', calories: 82, protein: 0.7, carbs: 21, fats: 0.2, serving: '100g' },
    { name: 'Mangosteen', category: 'Fruits', calories: 73, protein: 0.6, carbs: 18, fats: 0.6, serving: '100g' },
    { name: 'Starfruit', category: 'Fruits', calories: 31, protein: 1, carbs: 7, fats: 0.3, serving: '100g' },
    // Dairy
    { name: 'Milk (Whole)', category: 'Dairy', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, serving: '100ml' },
    { name: 'Milk (Skim)', category: 'Dairy', calories: 34, protein: 3.4, carbs: 5, fats: 0.1, serving: '100ml' },
    { name: 'Cheddar Cheese', category: 'Dairy', calories: 402, protein: 25, carbs: 1.3, fats: 33, serving: '100g' },
    { name: 'Mozzarella', category: 'Dairy', calories: 280, protein: 28, carbs: 3.1, fats: 17, serving: '100g' },
    { name: 'Feta Cheese', category: 'Dairy', calories: 264, protein: 14, carbs: 4.1, fats: 21, serving: '100g' },
    { name: 'Butter', category: 'Dairy', calories: 717, protein: 0.9, carbs: 0.1, fats: 81, serving: '100g' },
    { name: 'Cream Cheese', category: 'Dairy', calories: 342, protein: 6, carbs: 4.1, fats: 34, serving: '100g' },
    { name: 'Yogurt (Plain)', category: 'Dairy', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving: '100g' },
    { name: 'Kefir', category: 'Dairy', calories: 60, protein: 3.3, carbs: 4.8, fats: 3.5, serving: '100ml' },
    { name: 'Parmesan', category: 'Dairy', calories: 431, protein: 38, carbs: 4.1, fats: 29, serving: '100g' },
    { name: 'Ricotta', category: 'Dairy', calories: 174, protein: 11, carbs: 3, fats: 13, serving: '100g' },
    { name: 'Swiss Cheese', category: 'Dairy', calories: 380, protein: 27, carbs: 5.4, fats: 28, serving: '100g' },
    { name: 'Provolone', category: 'Dairy', calories: 351, protein: 26, carbs: 2.1, fats: 27, serving: '100g' },
    { name: 'Halloumi', category: 'Dairy', calories: 321, protein: 22, carbs: 2, fats: 25, serving: '100g' },
    { name: 'Mascarpone', category: 'Dairy', calories: 429, protein: 4.6, carbs: 4.1, fats: 46, serving: '100g' },
    // Grains
    { name: 'White Bread', category: 'Grains', calories: 265, protein: 9, carbs: 49, fats: 3.2, serving: '100g' },
    { name: 'Bagel', category: 'Grains', calories: 250, protein: 10, carbs: 48, fats: 1.5, serving: '1 medium' },
    { name: 'Croissant', category: 'Grains', calories: 406, protein: 8.2, carbs: 46, fats: 21, serving: '1 medium' },
    { name: 'Granola', category: 'Grains', calories: 471, protein: 10, carbs: 64, fats: 20, serving: '100g' },
    { name: 'Muesli', category: 'Grains', calories: 340, protein: 9, carbs: 68, fats: 5, serving: '100g' },
    { name: 'Rice Cakes', category: 'Grains', calories: 387, protein: 8, carbs: 81, fats: 3, serving: '100g' },
    { name: 'Crackers', category: 'Grains', calories: 502, protein: 7, carbs: 61, fats: 25, serving: '100g' },
    { name: 'Pita Bread', category: 'Grains', calories: 275, protein: 9, carbs: 56, fats: 1.2, serving: '1 large' },
    { name: 'Tortilla (Flour)', category: 'Grains', calories: 314, protein: 8, carbs: 53, fats: 8.5, serving: '1 large' },
    { name: 'Naan Bread', category: 'Grains', calories: 311, protein: 9, carbs: 50, fats: 8.5, serving: '1 piece' },
    { name: 'Sourdough Bread', category: 'Grains', calories: 289, protein: 12, carbs: 54, fats: 1.8, serving: '100g' },
    { name: 'Corn Tortilla', category: 'Grains', calories: 218, protein: 5.7, carbs: 45, fats: 2.8, serving: '1 medium' },
    { name: 'Rice Noodles', category: 'Grains', calories: 109, protein: 1.8, carbs: 24, fats: 0.2, serving: '100g' },
    { name: 'Egg Noodles', category: 'Grains', calories: 138, protein: 4.5, carbs: 25, fats: 2.1, serving: '100g' },
    { name: 'Udon Noodles', category: 'Grains', calories: 124, protein: 2.8, carbs: 25, fats: 0.4, serving: '100g' },
    // Snacks
    { name: 'Rice Crackers', category: 'Snacks', calories: 392, protein: 7, carbs: 85, fats: 1, serving: '100g' },
    { name: 'Protein Bar', category: 'Snacks', calories: 350, protein: 20, carbs: 40, fats: 10, serving: '1 bar' },
    { name: 'Popcorn (Air-popped)', category: 'Snacks', calories: 387, protein: 13, carbs: 78, fats: 4.5, serving: '100g' },
    { name: 'Seaweed Snacks', category: 'Snacks', calories: 40, protein: 2, carbs: 3, fats: 2, serving: '1 pack' },
    { name: 'Dried Mango', category: 'Snacks', calories: 319, protein: 2.5, carbs: 78, fats: 1.2, serving: '100g' },
    { name: 'Beef Jerky', category: 'Snacks', calories: 410, protein: 33, carbs: 11, fats: 26, serving: '100g' },
    { name: 'Trail Mix', category: 'Snacks', calories: 500, protein: 15, carbs: 50, fats: 30, serving: '100g' },
    { name: 'Rice Balls (Onigiri)', category: 'Snacks', calories: 180, protein: 3, carbs: 38, fats: 0.5, serving: '1 piece' },
    { name: 'Egg Tart', category: 'Snacks', calories: 280, protein: 4, carbs: 30, fats: 16, serving: '1 piece' },
    { name: 'Pineapple Bun', category: 'Snacks', calories: 320, protein: 7, carbs: 50, fats: 11, serving: '1 piece' },
    { name: 'Egg Waffle', category: 'Snacks', calories: 280, protein: 6, carbs: 35, fats: 13, serving: '1 piece' },
    { name: 'Curry Fishball', category: 'Snacks', calories: 150, protein: 8, carbs: 12, fats: 8, serving: '3 pieces' },
    { name: 'Siu Mai', category: 'Snacks', calories: 220, protein: 10, carbs: 18, fats: 12, serving: '4 pieces' },
    { name: 'Spring Roll', category: 'Snacks', calories: 250, protein: 6, carbs: 28, fats: 13, serving: '1 piece' },
    { name: 'Turnip Cake', category: 'Snacks', calories: 200, protein: 4, carbs: 30, fats: 7, serving: '1 piece' },
    // Beverages
    { name: 'Green Tea', category: 'Beverages', calories: 1, protein: 0.1, carbs: 0.2, fats: 0, serving: '100ml' },
    { name: 'Black Coffee', category: 'Beverages', calories: 2, protein: 0.1, carbs: 0, fats: 0, serving: '100ml' },
    { name: 'Orange Juice', category: 'Beverages', calories: 45, protein: 0.7, carbs: 10, fats: 0.2, serving: '100ml' },
    { name: 'Soy Milk', category: 'Beverages', calories: 54, protein: 3.5, carbs: 3.5, fats: 1.8, serving: '100ml' },
    { name: 'Coconut Water', category: 'Beverages', calories: 19, protein: 0.7, carbs: 3.7, fats: 0.2, serving: '100ml' },
    { name: 'Protein Shake', category: 'Beverages', calories: 120, protein: 24, carbs: 3, fats: 1, serving: '1 serving' },
    { name: 'Milk Tea (HK Style)', category: 'Beverages', calories: 85, protein: 2, carbs: 12, fats: 3, serving: '100ml' },
    { name: 'Lemon Tea', category: 'Beverages', calories: 35, protein: 0.1, carbs: 8.5, fats: 0, serving: '100ml' },
    { name: 'Yuan Yang', category: 'Beverages', calories: 60, protein: 2, carbs: 8, fats: 2, serving: '100ml' },
    { name: 'Red Bean Soup', category: 'Beverages', calories: 120, protein: 4, carbs: 22, fats: 1, serving: '1 bowl' },
    { name: 'Tofu Pudding', category: 'Beverages', calories: 80, protein: 5, carbs: 12, fats: 1.5, serving: '1 bowl' },
    { name: 'Herbal Tea', category: 'Beverages', calories: 5, protein: 0, carbs: 1, fats: 0, serving: '100ml' },
    { name: 'Barley Water', category: 'Beverages', calories: 30, protein: 0.5, carbs: 7, fats: 0, serving: '100ml' },
    { name: 'Chrysanthemum Tea', category: 'Beverages', calories: 10, protein: 0, carbs: 2.5, fats: 0, serving: '100ml' },
    { name: 'Sugar Cane Juice', category: 'Beverages', calories: 55, protein: 0.2, carbs: 13, fats: 0, serving: '100ml' },
  ]

  return foods.map((f, i) => ({ ...f, id: i + 1 }))
}

export const FOOD_DB = generateFoodDatabase()

export const CATEGORY_COLORS: Record<FoodCategory, string> = {
  Protein: 'cyan',
  Carbs: 'violet',
  Fats: 'orange',
  Vegetables: 'success',
  Fruits: 'trainer-accent',
  Dairy: 'info',
  Grains: 'warning',
  Snacks: 'orange',
  Beverages: 'teal',
}

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { label: string; value: number }> = {
  sedentary: { label: 'Sedentary', value: 1.2 },
  light: { label: 'Lightly Active', value: 1.375 },
  moderate: { label: 'Moderately Active', value: 1.55 },
  active: { label: 'Very Active', value: 1.725 },
  extreme: { label: 'Extremely Active', value: 1.9 },
}

export const GOAL_LABELS: Record<Goal, { label: string; adjustment: number }> = {
  maintain: { label: 'Maintain', adjustment: 0 },
  lose: { label: 'Lose Weight', adjustment: -500 },
  gain: { label: 'Gain Muscle', adjustment: 300 },
}

/* ─── FIXED Macro Targets ───
 * Uses g/kg bodyweight approach (industry standard).
 * Priority: protein → fat → carbs (remainder).
 * This fixes the "fat percentage stuck" bug.
 */
export const MACRO_TARGETS: Record<DietPreset, { proteinPerKg: number; fatPerKg: number; carbMin?: number; label: string; desc: string }> = {
  balanced:     { proteinPerKg: 2.0, fatPerKg: 0.9, label: 'Balanced', desc: 'Even distribution for general health' },
  'low-carb':   { proteinPerKg: 2.2, fatPerKg: 1.1, carbMin: 1.0, label: 'Low Carb', desc: 'Higher fat for fat loss and keto' },
  'high-carb':  { proteinPerKg: 1.8, fatPerKg: 0.5, label: 'High Carb', desc: 'High energy for endurance athletes' },
  'high-protein': { proteinPerKg: 2.5, fatPerKg: 0.7, label: 'High Protein', desc: 'Max muscle retention and growth' },
}

export function calcMacros(targetCalories: number, weight: number, preset: DietPreset) {
  const t = MACRO_TARGETS[preset]

  // Step 1: Protein calories (highest priority)
  const proteinGrams = Math.round(t.proteinPerKg * weight)
  const proteinCalories = proteinGrams * 4

  // Step 2: Fat calories (second priority)
  const fatGrams = Math.round(t.fatPerKg * weight)
  const fatCalories = fatGrams * 9

  // Step 3: Carb calories (fill the remainder)
  const remainingCalories = targetCalories - proteinCalories - fatCalories
  let carbGrams = Math.round(remainingCalories / 4)

  // Enforce carb minimum for low-carb (not below 1g/kg)
  if (t.carbMin && carbGrams < Math.round(t.carbMin * weight)) {
    carbGrams = Math.round(t.carbMin * weight)
  }

  // Ensure we don't go negative
  if (carbGrams < 0) carbGrams = 0

  return { proteinGrams, carbGrams, fatGrams }
}
