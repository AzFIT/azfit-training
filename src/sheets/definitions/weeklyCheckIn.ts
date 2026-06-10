/**
 * AzFIT.ai — Weekly Check-In Sheet Definition
 * Based on existing CheckIn page + Excel Weekly Check-In
 */

import type { SheetDefinition, CellType } from '../types';

export const weeklyCheckInDefinition: SheetDefinition = {
  id: 'weekly-checkin',
  name: 'Weekly Check-In',
  icon: 'clipboard',
  description: 'Weekly client check-in with ratings and discussion points',
  frozenCols: 1,
  frozenRows: 1,
  defaultRowHeight: 32,
  defaultColWidth: 130,
  columns: [
    { key: 'week', label: 'Week', type: 'number', width: 70, editable: true },
    { key: 'date', label: 'Date', type: 'date', width: 120, editable: true },
    { key: 'wins', label: 'Wins', type: 'text', width: 200, editable: true },
    { key: 'stress', label: 'Stress (1-10)', type: 'number', width: 105, editable: true },
    { key: 'gymPerformance', label: 'Gym Performance (1-10)', type: 'number', width: 170, editable: true },
    { key: 'recovery', label: 'Recovery (1-10)', type: 'number', width: 130, editable: true },
    { key: 'weeksOnProgram', label: 'Weeks on Program', type: 'number', width: 140, editable: true },
    { key: 'weeksSinceDeload', label: 'Weeks Since Deload', type: 'number', width: 160, editable: true },
    { key: 'struggles', label: 'Struggles', type: 'text', width: 200, editable: true },
    { key: 'improvements', label: 'Improvements', type: 'text', width: 200, editable: true },
    { key: 'discussion', label: 'Discussion', type: 'text', width: 250, editable: true },
    { key: 'questions', label: 'Questions', type: 'text', width: 200, editable: true },
    { key: 'payment', label: 'Payment', type: 'text', width: 100, editable: true },
    { key: 'avgRating', label: 'Avg Rating', type: 'formula', width: 100, editable: false, formula: '=AVG(D2:F2)' },
  ],
  rows: [],
  aggregations: [
    { type: 'avg', columnKey: 'stress', label: 'Avg Stress' },
    { type: 'avg', columnKey: 'gymPerformance', label: 'Avg Gym Perf' },
    { type: 'avg', columnKey: 'recovery', label: 'Avg Recovery' },
    { type: 'avg', columnKey: 'avgRating', label: 'Overall Avg' },
  ],
};

export function createCheckInRow(data: {
  week: number;
  date: string;
  wins?: string;
  stress?: number;
  gymPerformance?: number;
  recovery?: number;
  weeksOnProgram?: number;
  weeksSinceDeload?: number;
  struggles?: string;
  improvements?: string;
  discussion?: string;
  questions?: string;
  payment?: string;
}) {
  const tText = 'text' as CellType;
  const tNum = 'number' as CellType;
  const tDate = 'date' as CellType;
  const tFormula = 'formula' as CellType;
  return {
    id: `ci_${data.week}_${data.date}`,
    cells: {
      week: { value: data.week, type: tNum },
      date: { value: data.date, type: tDate },
      wins: { value: data.wins ?? '', type: tText },
      stress: { value: data.stress ?? 5, type: tNum },
      gymPerformance: { value: data.gymPerformance ?? 5, type: tNum },
      recovery: { value: data.recovery ?? 5, type: tNum },
      weeksOnProgram: { value: data.weeksOnProgram ?? data.week, type: tNum },
      weeksSinceDeload: { value: data.weeksSinceDeload ?? 0, type: tNum },
      struggles: { value: data.struggles ?? '', type: tText },
      improvements: { value: data.improvements ?? '', type: tText },
      discussion: { value: data.discussion ?? '', type: tText },
      questions: { value: data.questions ?? '', type: tText },
      payment: { value: data.payment ?? '', type: tText },
      avgRating: { value: null, type: tFormula, formula: '=AVG(D:F)' },
    },
  };
}
