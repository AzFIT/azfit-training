/**
 * AzFIT.ai — Sheet Engine Types
 * Core type definitions for the spreadsheet engine
 */

export type CellValue = string | number | boolean | null;

export type CellType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'formula';

export interface CellPosition {
  row: number;
  col: number;
}

export interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

export interface CellState {
  value: CellValue;
  formula?: string;           // Raw formula string (e.g. "=SUM(A1:A5)")
  computed?: CellValue;       // Computed result after formula evaluation
  type: CellType;
  format?: CellFormat;
  readonly?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bgColor?: string;
  align?: 'left' | 'center' | 'right';
  numberFormat?: string;      // e.g. "0.00", "0%", "yyyy-mm-dd"
}

export interface SheetColumn {
  key: string;
  label: string;
  type: CellType;
  width?: number;             // Pixel width
  minWidth?: number;
  options?: string[];         // For select type
  formula?: string;           // Default formula for the column
  editable?: boolean;
  format?: CellFormat;
}

export interface SheetRow {
  id: string;
  cells: Record<string, CellState>;
  height?: number;            // Pixel height
  metadata?: Record<string, unknown>;
}

export interface SheetDefinition {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  columns: SheetColumn[];
  rows: SheetRow[];
  frozenCols?: number;        // Number of frozen left columns
  frozenRows?: number;        // Number of frozen header rows
  defaultRowHeight?: number;
  defaultColWidth?: number;
  aggregations?: Aggregation[];
  // Computed columns that auto-fill from other sheets
  computedColumns?: ComputedColumn[];
}

export interface Aggregation {
  type: 'sum' | 'avg' | 'min' | 'max' | 'count';
  columnKey: string;
  label?: string;
  filter?: (row: SheetRow) => boolean;
}

export interface ComputedColumn {
  key: string;
  sourceSheet: string;
  sourceColumn: string;
  matchKey: string;           // Key to match between sheets
}

export interface SheetSnapshot {
  id: string;
  timestamp: number;
  rows: SheetRow[];
}

export interface UndoState {
  snapshots: SheetSnapshot[];
  index: number;
}

export interface FormulaError {
  type: 'REF' | 'VALUE' | 'DIV/0' | 'NAME' | 'NUM' | 'N/A' | 'CIRCULAR';
  message: string;
}

export interface ParsedFormula {
  raw: string;
  name: string;
  args: (string | number | CellRange | CellPosition)[];
}

export interface SheetChangeEvent {
  sheetId: string;
  position: CellPosition;
  oldValue: CellValue;
  newValue: CellValue;
  timestamp: number;
}

export type SheetListener = (event: SheetChangeEvent) => void;

// Cell reference utilities
export function colLabel(index: number): string {
  let result = '';
  let n = index;
  do {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return result;
}

export function colIndex(label: string): number {
  let result = 0;
  for (let i = 0; i < label.length; i++) {
    result = result * 26 + (label.charCodeAt(i) - 64);
  }
  return result - 1;
}

export function cellRef(row: number, col: number): string {
  return `${colLabel(col)}${row + 1}`;
}

export function parseCellRef(ref: string): CellPosition | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  return {
    row: parseInt(match[2], 10) - 1,
    col: colIndex(match[1]),
  };
}

export function parseRange(range: string): CellRange | null {
  const parts = range.split(':');
  if (parts.length !== 2) return null;
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return null;
  return { start, end };
}
