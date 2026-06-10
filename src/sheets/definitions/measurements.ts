/**
 * AzFIT.ai — Measurements Sheet Definition
 * Based on Excel "MEASUREMENTS 1" tab
 */

import type { SheetDefinition } from '../types';

export const measurementsDefinition: SheetDefinition = {
  id: 'measurements',
  name: 'Measurements',
  icon: 'ruler',
  description: 'Body measurements, skinfolds, and composition tracking',
  frozenCols: 1,
  frozenRows: 1,
  defaultRowHeight: 32,
  defaultColWidth: 95,
  columns: [
    { key: 'date', label: 'Date', type: 'date', width: 120, editable: true },
    { key: 'weight', label: 'Weight (kg)', type: 'number', width: 105, editable: true },
    { key: 'chin', label: 'Chin', type: 'number', width: 80, editable: true },
    { key: 'cheek', label: 'Cheek', type: 'number', width: 80, editable: true },
    { key: 'pec', label: 'Pec', type: 'number', width: 80, editable: true },
    { key: 'tricep', label: 'Tricep', type: 'number', width: 85, editable: true },
    { key: 'subScap', label: 'Sub-Scap', type: 'number', width: 90, editable: true },
    { key: 'midAx', label: 'Mid-Ax', type: 'number', width: 85, editable: true },
    { key: 'supra', label: 'Supra', type: 'number', width: 80, editable: true },
    { key: 'umbil', label: 'Umbil', type: 'number', width: 85, editable: true },
    { key: 'knee', label: 'Knee', type: 'number', width: 80, editable: true },
    { key: 'calf', label: 'Calf', type: 'number', width: 80, editable: true },
    { key: 'quad', label: 'Quad', type: 'number', width: 80, editable: true },
    { key: 'ham', label: 'Ham', type: 'number', width: 80, editable: true },
    { key: 'sumSkinfolds', label: 'SUM', type: 'formula', width: 80, editable: false, formula: '=SUM(C2:N2)' },
    { key: 'bmi', label: 'BMI', type: 'formula', width: 80, editable: false, formula: '=BMI(B2,1.75)' },
    { key: 'bfp', label: 'BF%', type: 'formula', width: 80, editable: false, formula: '=BFP(K2,C2,175)' },
    { key: 'arm', label: 'Arm (cm)', type: 'number', width: 90, editable: true },
    { key: 'thigh', label: 'Thigh (cm)', type: 'number', width: 95, editable: true },
    { key: 'hips', label: 'Hips (cm)', type: 'number', width: 90, editable: true },
    { key: 'waist', label: 'Waist (cm)', type: 'number', width: 95, editable: true },
    { key: 'shoulder', label: 'Shoulder (cm)', type: 'number', width: 105, editable: true },
    { key: 'waistHipRatio', label: 'W/H Ratio', type: 'formula', width: 90, editable: false, formula: '=U2/T2' },
  ],
  rows: [],
  aggregations: [
    { type: 'avg', columnKey: 'weight', label: 'Avg Weight' },
    { type: 'avg', columnKey: 'bfp', label: 'Avg BF%' },
    { type: 'min', columnKey: 'weight', label: 'Min Weight' },
    { type: 'max', columnKey: 'weight', label: 'Max Weight' },
  ],
};

export function createMeasurementsRow(date: string, data?: Partial<Record<string, unknown>>) {
  return {
    id: `meas_${date}`,
    cells: {
      date: { value: date, type: 'date' },
      weight: { value: data?.weight ?? null, type: 'number' },
      chin: { value: data?.chin ?? null, type: 'number' },
      cheek: { value: data?.cheek ?? null, type: 'number' },
      pec: { value: data?.pec ?? null, type: 'number' },
      tricep: { value: data?.tricep ?? null, type: 'number' },
      subScap: { value: data?.subScap ?? null, type: 'number' },
      midAx: { value: data?.midAx ?? null, type: 'number' },
      supra: { value: data?.supra ?? null, type: 'number' },
      umbil: { value: data?.umbil ?? null, type: 'number' },
      knee: { value: data?.knee ?? null, type: 'number' },
      calf: { value: data?.calf ?? null, type: 'number' },
      quad: { value: data?.quad ?? null, type: 'number' },
      ham: { value: data?.ham ?? null, type: 'number' },
      sumSkinfolds: { value: null, type: 'formula', formula: '=SUM(C:N)' },
      bmi: { value: null, type: 'formula', formula: '=BMI(B,1.75)' },
      bfp: { value: null, type: 'formula', formula: '=BFP(K,C,175)' },
      arm: { value: data?.arm ?? null, type: 'number' },
      thigh: { value: data?.thigh ?? null, type: 'number' },
      hips: { value: data?.hips ?? null, type: 'number' },
      waist: { value: data?.waist ?? null, type: 'number' },
      shoulder: { value: data?.shoulder ?? null, type: 'number' },
      waistHipRatio: { value: null, type: 'formula', formula: '=U/T' },
    },
  };
}
