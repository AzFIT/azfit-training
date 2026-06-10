/**
 * AzFIT.ai — Daily Log Sheet Definition
 * Based on Excel "Daily Log" tab
 */

import type { SheetDefinition } from '../types';

export const dailyLogDefinition: SheetDefinition = {
  id: 'daily-log',
  name: 'Daily Log',
  icon: 'calendar',
  description: 'Daily tracking of body weight, nutrition, activity, sleep, and wellness markers',
  frozenCols: 1,
  frozenRows: 1,
  defaultRowHeight: 32,
  defaultColWidth: 110,
  columns: [
    { key: 'date', label: 'Date', type: 'date', width: 120, editable: true },
    { key: 'bodyweight', label: 'BW (kg)', type: 'number', width: 90, editable: true },
    { key: 'training', label: 'Training/Rest', type: 'select', width: 110, options: ['Training', 'Rest', 'Active Recovery', 'Deload'], editable: true },
    { key: 'calories', label: 'Calories', type: 'number', width: 90, editable: true },
    { key: 'protein', label: 'Protein (g)', type: 'number', width: 95, editable: true },
    { key: 'carbs', label: 'Carbs (g)', type: 'number', width: 90, editable: true },
    { key: 'fats', label: 'Fats (g)', type: 'number', width: 85, editable: true },
    { key: 'mealsOut', label: 'Meals Out', type: 'number', width: 90, editable: true },
    { key: 'steps', label: 'Steps', type: 'number', width: 90, editable: true },
    { key: 'cardioKcals', label: 'Cardio kcals', type: 'number', width: 100, editable: true },
    { key: 'sleepHours', label: 'Sleep Hrs', type: 'number', width: 90, editable: true },
    { key: 'stress', label: 'Stress (1-10)', type: 'number', width: 100, editable: true },
    { key: 'energy', label: 'Energy (1-10)', type: 'number', width: 105, editable: true },
    { key: 'hunger', label: 'Hunger (1-10)', type: 'number', width: 105, editable: true },
    { key: 'digestion', label: 'Digestion (1-10)', type: 'number', width: 120, editable: true },
    { key: 'restingHR', label: 'Resting HR', type: 'number', width: 95, editable: true },
    { key: 'hrv', label: 'HRV', type: 'number', width: 80, editable: true },
    { key: 'bloodPressure', label: 'Blood Pressure', type: 'text', width: 120, editable: true },
    { key: 'bloodGlucose', label: 'Blood Glucose', type: 'number', width: 115, editable: true },
    { key: 'cycle', label: 'Cycle Tracker', type: 'text', width: 110, editable: true },
    { key: 'comments', label: 'Comments', type: 'text', width: 200, editable: true },
    // Computed columns
    { key: 'avgWeekBW', label: 'Avg Week BW', type: 'formula', width: 105, editable: false, formula: '=AVG(B2:B8)' },
    { key: 'totalDiff', label: 'Total Diff', type: 'formula', width: 95, editable: false, formula: '=B2-B3' },
  ],
  rows: [],
  aggregations: [
    { type: 'avg', columnKey: 'bodyweight', label: 'Avg Weight' },
    { type: 'avg', columnKey: 'calories', label: 'Avg Calories' },
    { type: 'avg', columnKey: 'protein', label: 'Avg Protein' },
    { type: 'avg', columnKey: 'steps', label: 'Avg Steps' },
    { type: 'avg', columnKey: 'sleepHours', label: 'Avg Sleep' },
  ],
};

export function createDailyLogRow(date: string, data?: Partial<Record<string, unknown>>) {
  return {
    id: `dl_${date}`,
    cells: {
      date: { value: date, type: 'date' },
      bodyweight: { value: data?.bodyweight ?? null, type: 'number' },
      training: { value: data?.training ?? 'Training', type: 'select' },
      calories: { value: data?.calories ?? null, type: 'number' },
      protein: { value: data?.protein ?? null, type: 'number' },
      carbs: { value: data?.carbs ?? null, type: 'number' },
      fats: { value: data?.fats ?? null, type: 'number' },
      mealsOut: { value: data?.mealsOut ?? 0, type: 'number' },
      steps: { value: data?.steps ?? null, type: 'number' },
      cardioKcals: { value: data?.cardioKcals ?? null, type: 'number' },
      sleepHours: { value: data?.sleepHours ?? null, type: 'number' },
      stress: { value: data?.stress ?? null, type: 'number' },
      energy: { value: data?.energy ?? null, type: 'number' },
      hunger: { value: data?.hunger ?? null, type: 'number' },
      digestion: { value: data?.digestion ?? null, type: 'number' },
      restingHR: { value: data?.restingHR ?? null, type: 'number' },
      hrv: { value: data?.hrv ?? null, type: 'number' },
      bloodPressure: { value: data?.bloodPressure ?? null, type: 'text' },
      bloodGlucose: { value: data?.bloodGlucose ?? null, type: 'number' },
      cycle: { value: data?.cycle ?? null, type: 'text' },
      comments: { value: data?.comments ?? null, type: 'text' },
      avgWeekBW: { value: null, type: 'formula', formula: '=AVG(B:B)' },
      totalDiff: { value: null, type: 'formula', formula: '=B2-B3' },
    },
  };
}
