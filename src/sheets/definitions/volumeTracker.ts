/**
 * AzFIT.ai — Volume Tracker Sheet Definition
 * Based on Excel "Volume Tracker" tab
 */

import type { SheetDefinition, CellType } from '../types';

export const volumeTrackerDefinition: SheetDefinition = {
  id: 'volume-tracker',
  name: 'Volume Tracker',
  icon: 'bar-chart',
  description: 'Track training volume per body part across all program phases',
  frozenCols: 1,
  frozenRows: 1,
  defaultRowHeight: 32,
  defaultColWidth: 100,
  columns: [
    { key: 'bodyPart', label: 'Body Part', type: 'text', width: 130, editable: false },
    { key: 'refRange', label: 'Ref Range', type: 'text', width: 110, editable: true },
    { key: 'p1Sets', label: 'P1 Sets', type: 'number', width: 85, editable: true },
    { key: 'p2Sets', label: 'P2 Sets', type: 'number', width: 85, editable: true },
    { key: 'p3Sets', label: 'P3 Sets', type: 'number', width: 85, editable: true },
    { key: 'p4Sets', label: 'P4 Sets', type: 'number', width: 85, editable: true },
    { key: 'p5Sets', label: 'P5 Sets', type: 'number', width: 85, editable: true },
    { key: 'p6Sets', label: 'P6 Sets', type: 'number', width: 85, editable: true },
    { key: 'p7Sets', label: 'P7 Sets', type: 'number', width: 85, editable: true },
    { key: 'p8Sets', label: 'P8 Sets', type: 'number', width: 85, editable: true },
    { key: 'p9Sets', label: 'P9 Sets', type: 'number', width: 85, editable: true },
    { key: 'p10Sets', label: 'P10 Sets', type: 'number', width: 90, editable: true },
    { key: 'p11Sets', label: 'P11 Sets', type: 'number', width: 90, editable: true },
    { key: 'p12Sets', label: 'P12 Sets', type: 'number', width: 90, editable: true },
    { key: 'totalSets', label: 'Total Sets', type: 'formula', width: 90, editable: false, formula: '=SUM(C2:N2)' },
    { key: 'totalVolume', label: 'Total Volume', type: 'formula', width: 105, editable: false, formula: '=SUM(C2:N2)' },
    { key: 'indicatorLift', label: 'Indicator Lift', type: 'text', width: 120, editable: true },
    { key: 'pctAim', label: '% Aim', type: 'formula', width: 80, editable: false, formula: '=P2/O2*100' },
    { key: 'predictedWeight', label: 'Predicted Wt', type: 'number', width: 110, editable: true },
    { key: 'maxLoad', label: 'Max Load', type: 'number', width: 95, editable: true },
  ],
  rows: [
    createVolumeRow('Chest', '12-20'),
    createVolumeRow('Back (Vertical)', '10-16'),
    createVolumeRow('Back (Horizontal)', '10-16'),
    createVolumeRow('Shoulders', '12-20'),
    createVolumeRow('Biceps', '8-14'),
    createVolumeRow('Triceps', '8-14'),
    createVolumeRow('Quads', '12-20'),
    createVolumeRow('Hamstrings', '8-14'),
    createVolumeRow('Glutes', '8-14'),
    createVolumeRow('Calves', '6-12'),
    createVolumeRow('Abs', '8-14'),
    createVolumeRow('Traps', '6-10'),
    createVolumeRow('Forearms', '4-8'),
  ],
  aggregations: [
    { type: 'sum', columnKey: 'totalSets', label: 'Total Sets' },
    { type: 'sum', columnKey: 'totalVolume', label: 'Total Volume' },
  ],
};

function createVolumeRow(bodyPart: string, refRange: string) {
  const tText = 'text' as CellType;
  const tNum = 'number' as CellType;
  const tFormula = 'formula' as CellType;
  return {
    id: `vt_${bodyPart.toLowerCase().replace(/\s+/g, '_')}`,
    cells: {
      bodyPart: { value: bodyPart, type: tText },
      refRange: { value: refRange, type: tText },
      p1Sets: { value: 0, type: tNum },
      p2Sets: { value: 0, type: tNum },
      p3Sets: { value: 0, type: tNum },
      p4Sets: { value: 0, type: tNum },
      p5Sets: { value: 0, type: tNum },
      p6Sets: { value: 0, type: tNum },
      p7Sets: { value: 0, type: tNum },
      p8Sets: { value: 0, type: tNum },
      p9Sets: { value: 0, type: tNum },
      p10Sets: { value: 0, type: tNum },
      p11Sets: { value: 0, type: tNum },
      p12Sets: { value: 0, type: tNum },
      totalSets: { value: null, type: tFormula, formula: `=SUM(C:N)` },
      totalVolume: { value: null, type: tFormula, formula: `=SUM(C:N)` },
      indicatorLift: { value: '', type: tText },
      pctAim: { value: null, type: tFormula, formula: `=IF(B>0,O/B*100,0)` },
      predictedWeight: { value: null, type: tNum },
      maxLoad: { value: null, type: tNum },
    },
  };
}
