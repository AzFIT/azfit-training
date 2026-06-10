/**
 * AzFIT.ai — Food Log Sheet Definition
 * Based on existing Nutrition hub + Excel Meal Plan
 */

import type { SheetDefinition, CellType } from '../types';

export const foodLogDefinition: SheetDefinition = {
  id: 'food-log',
  name: 'Food Log',
  icon: 'apple',
  description: 'Daily food logging with macro tracking',
  frozenCols: 1,
  frozenRows: 1,
  defaultRowHeight: 32,
  defaultColWidth: 110,
  columns: [
    { key: 'date', label: 'Date', type: 'date', width: 120, editable: true },
    { key: 'meal', label: 'Meal', type: 'select', width: 110, options: ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Snack 3'], editable: true },
    { key: 'foodItem', label: 'Food Item', type: 'text', width: 180, editable: true },
    { key: 'serving', label: 'Serving', type: 'text', width: 100, editable: true },
    { key: 'servings', label: 'Servings', type: 'number', width: 85, editable: true },
    { key: 'calories', label: 'Calories', type: 'number', width: 90, editable: true },
    { key: 'protein', label: 'Protein (g)', type: 'number', width: 95, editable: true },
    { key: 'fats', label: 'Fats (g)', type: 'number', width: 85, editable: true },
    { key: 'carbs', label: 'Carbs (g)', type: 'number', width: 90, editable: true },
    { key: 'fiber', label: 'Fiber (g)', type: 'number', width: 85, editable: true },
    { key: 'notes', label: 'Notes', type: 'text', width: 200, editable: true },
  ],
  rows: [],
  aggregations: [
    { type: 'sum', columnKey: 'calories', label: 'Total Calories' },
    { type: 'sum', columnKey: 'protein', label: 'Total Protein' },
    { type: 'sum', columnKey: 'fats', label: 'Total Fats' },
    { type: 'sum', columnKey: 'carbs', label: 'Total Carbs' },
  ],
};

export function createFoodLogRow(data: {
  date: string;
  meal?: string;
  foodItem?: string;
  serving?: string;
  servings?: number;
  calories?: number;
  protein?: number;
  fats?: number;
  carbs?: number;
  fiber?: number;
  notes?: string;
}) {
  const tText = 'text' as CellType;
  const tNum = 'number' as CellType;
  const tSelect = 'select' as CellType;
  const tDate = 'date' as CellType;
  return {
    id: `fl_${data.date}_${data.foodItem?.replace(/\s+/g, '_') ?? Date.now()}`,
    cells: {
      date: { value: data.date, type: tDate },
      meal: { value: data.meal ?? 'Breakfast', type: tSelect },
      foodItem: { value: data.foodItem ?? '', type: tText },
      serving: { value: data.serving ?? '100g', type: tText },
      servings: { value: data.servings ?? 1, type: tNum },
      calories: { value: data.calories ?? 0, type: tNum },
      protein: { value: data.protein ?? 0, type: tNum },
      fats: { value: data.fats ?? 0, type: tNum },
      carbs: { value: data.carbs ?? 0, type: tNum },
      fiber: { value: data.fiber ?? 0, type: tNum },
      notes: { value: data.notes ?? '', type: tText },
    },
  };
}
