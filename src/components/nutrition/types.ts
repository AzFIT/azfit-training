export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme'
export type Goal = 'maintain' | 'lose' | 'gain'
export type FoodCategory = 'Protein' | 'Carbs' | 'Fats' | 'Vegetables' | 'Fruits' | 'Dairy' | 'Grains' | 'Snacks' | 'Beverages'
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
export type DietPreset = 'balanced' | 'low-carb' | 'high-carb' | 'high-protein'

export interface FoodItem {
  id: number
  name: string
  category: FoodCategory
  calories: number
  protein: number
  carbs: number
  fats: number
  serving: string
}

export interface MealEntry {
  id: string
  foodId: number
  quantity: number
  mealType: MealType
}

export interface Supplement {
  id: string
  name: string
  dosage: string
  timing: string
  frequency: string
  taken: boolean
}
