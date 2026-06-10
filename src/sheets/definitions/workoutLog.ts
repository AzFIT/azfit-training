/**
 * AzFIT.ai — Workout Log Sheet Definition
 * Based on existing WorkoutLog storage + Excel structure
 */

import type { SheetDefinition } from '../types';

export const workoutLogDefinition: SheetDefinition = {
  id: 'workout-log',
  name: 'Workout Log',
  icon: 'dumbbell',
  description: 'Detailed workout session logs with sets, reps, load, and volume',
  frozenCols: 1,
  frozenRows: 1,
  defaultRowHeight: 32,
  defaultColWidth: 100,
  columns: [
    { key: 'date', label: 'Date', type: 'date', width: 120, editable: true },
    { key: 'client', label: 'Client', type: 'text', width: 130, editable: true },
    { key: 'program', label: 'Program', type: 'text', width: 130, editable: true },
    { key: 'phase', label: 'Phase', type: 'text', width: 100, editable: true },
    { key: 'week', label: 'Week', type: 'number', width: 70, editable: true },
    { key: 'day', label: 'Day', type: 'text', width: 80, editable: true },
    { key: 'exercise', label: 'Exercise', type: 'text', width: 180, editable: true },
    { key: 'sets', label: 'Sets', type: 'number', width: 60, editable: true },
    { key: 'reps', label: 'Reps', type: 'number', width: 60, editable: true },
    { key: 'load', label: 'Load (kg)', type: 'number', width: 95, editable: true },
    { key: 'rpe', label: 'RPE', type: 'number', width: 60, editable: true },
    { key: 'volume', label: 'Volume', type: 'formula', width: 90, editable: false, formula: '=VOLUME(J2,I2,H2)' },
    { key: 'rest', label: 'Rest (s)', type: 'number', width: 85, editable: true },
    { key: 'setType', label: 'Set Type', type: 'select', width: 110, options: ['Straight', 'Drop', 'Cluster', 'Rest-Pause', 'Myo', 'Pre-exhaust', 'Post-exhaust', 'Giant'], editable: true },
    { key: 'done', label: 'Done', type: 'checkbox', width: 65, editable: true },
    { key: 'notes', label: 'Notes', type: 'text', width: 200, editable: true },
  ],
  rows: [],
  aggregations: [
    { type: 'sum', columnKey: 'volume', label: 'Total Volume' },
    { type: 'sum', columnKey: 'sets', label: 'Total Sets' },
    { type: 'avg', columnKey: 'rpe', label: 'Avg RPE' },
    { type: 'count', columnKey: 'exercise', label: 'Exercises' },
  ],
};

export function createWorkoutLogRow(data: {
  date: string;
  client?: string;
  program?: string;
  phase?: string;
  week?: number;
  day?: string;
  exercise?: string;
  sets?: number;
  reps?: number;
  load?: number;
  rpe?: number;
  rest?: number;
  setType?: string;
  done?: boolean;
  notes?: string;
}) {
  const id = `wl_${data.date}_${data.exercise?.replace(/\s+/g, '_') ?? Date.now()}`;
  return {
    id,
    cells: {
      date: { value: data.date, type: 'date' },
      client: { value: data.client ?? '', type: 'text' },
      program: { value: data.program ?? '', type: 'text' },
      phase: { value: data.phase ?? '', type: 'text' },
      week: { value: data.week ?? 1, type: 'number' },
      day: { value: data.day ?? '', type: 'text' },
      exercise: { value: data.exercise ?? '', type: 'text' },
      sets: { value: data.sets ?? 0, type: 'number' },
      reps: { value: data.reps ?? 0, type: 'number' },
      load: { value: data.load ?? 0, type: 'number' },
      rpe: { value: data.rpe ?? 0, type: 'number' },
      volume: { value: null, type: 'formula', formula: `=VOLUME(J,I,H)` },
      rest: { value: data.rest ?? 60, type: 'number' },
      setType: { value: data.setType ?? 'Straight', type: 'select' },
      done: { value: data.done ?? false, type: 'checkbox' },
      notes: { value: data.notes ?? '', type: 'text' },
    },
  };
}
