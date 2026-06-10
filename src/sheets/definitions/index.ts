/**
 * AzFIT.ai — Sheet Definitions Index
 * All sheet definitions exported for use in the Sheets View
 */

export { dailyLogDefinition, createDailyLogRow } from './dailyLog';
export { volumeTrackerDefinition } from './volumeTracker';
export { measurementsDefinition, createMeasurementsRow } from './measurements';
export { workoutLogDefinition, createWorkoutLogRow } from './workoutLog';
export { foodLogDefinition, createFoodLogRow } from './foodLog';
export { weeklyCheckInDefinition, createCheckInRow } from './weeklyCheckIn';

import type { SheetDefinition } from '../types';
import { dailyLogDefinition } from './dailyLog';
import { volumeTrackerDefinition } from './volumeTracker';
import { measurementsDefinition } from './measurements';
import { workoutLogDefinition } from './workoutLog';
import { foodLogDefinition } from './foodLog';
import { weeklyCheckInDefinition } from './weeklyCheckIn';

/** All available sheet definitions */
export const ALL_SHEET_DEFINITIONS: SheetDefinition[] = [
  dailyLogDefinition,
  volumeTrackerDefinition,
  measurementsDefinition,
  workoutLogDefinition,
  foodLogDefinition,
  weeklyCheckInDefinition,
];

/** Get a sheet definition by ID */
export function getSheetDefinition(id: string): SheetDefinition | undefined {
  return ALL_SHEET_DEFINITIONS.find(s => s.id === id);
}
