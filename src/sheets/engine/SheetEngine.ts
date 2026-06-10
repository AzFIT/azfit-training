/**
 * AzFIT.ai — Sheet Engine
 * Core spreadsheet engine with cell editing, formulas, undo/redo, and persistence
 */

import type {
  SheetDefinition,
  SheetRow,
  SheetColumn,
  CellState,
  CellValue,
  CellPosition,
  CellRange,
  CellFormat,
  SheetSnapshot,
  UndoState,
  SheetChangeEvent,
  SheetListener,
} from '../types';

import { evaluateFormula, isFormulaError } from './formulas';

const STORAGE_PREFIX = 'azfit_sheet_';
const MAX_UNDO_STACK = 50;

export class SheetEngine {
  private definition: SheetDefinition;
  private listeners: Set<SheetListener> = new Set();
  private undoState: UndoState;
  private isBatching = false;
  private pendingChanges: SheetChangeEvent[] = [];

  constructor(definition: SheetDefinition) {
    this.definition = { ...definition };
    this.undoState = {
      snapshots: [this.createSnapshot()],
      index: 0,
    };
    this.loadFromStorage();
  }

  // ==========================================================================
  // Getters
  // ==========================================================================

  get id(): string { return this.definition.id; }
  get name(): string { return this.definition.name; }
  get columns(): SheetColumn[] { return [...this.definition.columns]; }
  get rows(): SheetRow[] { return [...this.definition.rows]; }
  get columnCount(): number { return this.definition.columns.length; }
  get rowCount(): number { return this.definition.rows.length; }

  getColumn(index: number): SheetColumn | undefined {
    return this.definition.columns[index];
  }

  getColumnByKey(key: string): SheetColumn | undefined {
    return this.definition.columns.find(c => c.key === key);
  }

  getColumnIndex(key: string): number {
    return this.definition.columns.findIndex(c => c.key === key);
  }

  getRow(index: number): SheetRow | undefined {
    return this.definition.rows[index];
  }

  getCell(rowIndex: number, colIndex: number): CellState | undefined {
    const row = this.definition.rows[rowIndex];
    if (!row) return undefined;
    const col = this.definition.columns[colIndex];
    if (!col) return undefined;
    return row.cells[col.key];
  }

  getCellByKey(rowIndex: number, colKey: string): CellState | undefined {
    const row = this.definition.rows[rowIndex];
    if (!row) return undefined;
    return row.cells[colKey];
  }

  getCellValue(rowIndex: number, colIndex: number): CellValue {
    const cell = this.getCell(rowIndex, colIndex);
    if (!cell) return null;
    return cell.computed !== undefined ? cell.computed : cell.value;
  }

  getCellValueByKey(rowIndex: number, colKey: string): CellValue {
    const cell = this.getCellByKey(rowIndex, colKey);
    if (!cell) return null;
    return cell.computed !== undefined ? cell.computed : cell.value;
  }

  // ==========================================================================
  // Cell Editing
  // ==========================================================================

  setCellValue(rowIndex: number, colIndex: number, value: CellValue): void {
    const col = this.definition.columns[colIndex];
    if (!col) return;
    if (col.editable === false) return;

    const row = this.definition.rows[rowIndex];
    if (!row) return;

    const oldCell = row.cells[col.key];
    const oldValue = oldCell ? (oldCell.computed !== undefined ? oldCell.computed : oldCell.value) : null;

    const newCell: CellState = {
      ...(oldCell ?? { type: col.type }),
      value,
      computed: undefined,
    };

    // If value starts with =, it's a formula
    if (typeof value === 'string' && value.startsWith('=')) {
      newCell.formula = value;
      newCell.type = 'formula';
      const result = this.evaluateCellFormula(rowIndex, colIndex, value);
      newCell.computed = isFormulaError(result) ? `#${result.type}` : result;
    } else {
      newCell.formula = undefined;
      newCell.type = col.type;
      // Type coercion
      if (col.type === 'number' && typeof value === 'string') {
        const num = parseFloat(value);
        newCell.value = isNaN(num) ? value : num;
      } else if (col.type === 'checkbox') {
        newCell.value = Boolean(value);
      } else {
        newCell.value = value;
      }
    }

    row.cells[col.key] = newCell;

    const event: SheetChangeEvent = {
      sheetId: this.definition.id,
      position: { row: rowIndex, col: colIndex },
      oldValue,
      newValue: newCell.computed !== undefined ? newCell.computed : newCell.value,
      timestamp: Date.now(),
    };

    if (this.isBatching) {
      this.pendingChanges.push(event);
    } else {
      this.pushSnapshot();
      this.emit(event);
      this.saveToStorage();
    }
  }

  setCellFormat(rowIndex: number, colIndex: number, format: Partial<CellFormat>): void {
    const col = this.definition.columns[colIndex];
    if (!col) return;
    const row = this.definition.rows[rowIndex];
    if (!row) return;

    const cell = row.cells[col.key];
    if (!cell) return;

    cell.format = { ...cell.format, ...format };
    this.saveToStorage();
  }

  // ==========================================================================
  // Row Operations
  // ==========================================================================

  insertRow(atIndex: number, rowData?: Partial<Record<string, CellValue>>): void {
    const newRow: SheetRow = {
      id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      cells: {},
    };

    for (const col of this.definition.columns) {
      const val = rowData?.[col.key] ?? null;
      newRow.cells[col.key] = {
        value: val,
        type: col.type,
      };
    }

    this.definition.rows.splice(atIndex, 0, newRow);
    this.pushSnapshot();
    this.saveToStorage();
  }

  deleteRow(atIndex: number): void {
    if (atIndex < 0 || atIndex >= this.definition.rows.length) return;
    this.definition.rows.splice(atIndex, 1);
    this.pushSnapshot();
    this.saveToStorage();
  }

  moveRow(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.definition.rows.length) return;
    if (toIndex < 0 || toIndex > this.definition.rows.length) return;
    const [row] = this.definition.rows.splice(fromIndex, 1);
    this.definition.rows.splice(toIndex, 0, row);
    this.pushSnapshot();
    this.saveToStorage();
  }

  // ==========================================================================
  // Column Operations
  // ==========================================================================

  insertColumn(atIndex: number, column: SheetColumn): void {
    this.definition.columns.splice(atIndex, 0, column);
    for (const row of this.definition.rows) {
      row.cells[column.key] = {
        value: null,
        type: column.type,
      };
    }
    this.pushSnapshot();
    this.saveToStorage();
  }

  deleteColumn(atIndex: number): void {
    const col = this.definition.columns[atIndex];
    if (!col) return;
    this.definition.columns.splice(atIndex, 1);
    for (const row of this.definition.rows) {
      delete row.cells[col.key];
    }
    this.pushSnapshot();
    this.saveToStorage();
  }

  setColumnWidth(colIndex: number, width: number): void {
    const col = this.definition.columns[colIndex];
    if (col) {
      col.width = width;
      this.saveToStorage();
    }
  }

  // ==========================================================================
  // Formula Evaluation
  // ==========================================================================

  private evaluateCellFormula(_rowIndex: number, _colIndex: number, formula: string): CellValue {
    const resolveCell = (pos: CellPosition): CellValue => {
      return this.getCellValue(pos.row, pos.col);
    };

    const resolveRange = (range: CellRange): CellValue[] => {
      const values: CellValue[] = [];
      const startRow = Math.min(range.start.row, range.end.row);
      const endRow = Math.max(range.start.row, range.end.row);
      const startCol = Math.min(range.start.col, range.end.col);
      const endCol = Math.max(range.start.col, range.end.col);

      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          values.push(this.getCellValue(r, c));
        }
      }
      return values;
    };

    const result = evaluateFormula(formula, resolveCell, resolveRange);
    if (isFormulaError(result)) return `#${result.type}`;
    return result;
  }

  recalculateAll(): void {
    for (let r = 0; r < this.definition.rows.length; r++) {
      for (let c = 0; c < this.definition.columns.length; c++) {
        const col = this.definition.columns[c];
        const cell = this.definition.rows[r].cells[col.key];
        if (cell?.formula) {
          const result = this.evaluateCellFormula(r, c, cell.formula);
          cell.computed = isFormulaError(result) ? `#${result.type}` : result;
        }
      }
    }
    this.saveToStorage();
  }

  // ==========================================================================
  // Undo / Redo
  // ==========================================================================

  canUndo(): boolean {
    return this.undoState.index > 0;
  }

  canRedo(): boolean {
    return this.undoState.index < this.undoState.snapshots.length - 1;
  }

  undo(): void {
    if (!this.canUndo()) return;
    this.undoState.index--;
    this.restoreSnapshot(this.undoState.snapshots[this.undoState.index]);
  }

  redo(): void {
    if (!this.canRedo()) return;
    this.undoState.index++;
    this.restoreSnapshot(this.undoState.snapshots[this.undoState.index]);
  }

  private createSnapshot(): SheetSnapshot {
    return {
      id: this.definition.id,
      timestamp: Date.now(),
      rows: JSON.parse(JSON.stringify(this.definition.rows)),
    };
  }

  private pushSnapshot(): void {
    // Remove any redo states
    this.undoState.snapshots = this.undoState.snapshots.slice(0, this.undoState.index + 1);
    this.undoState.snapshots.push(this.createSnapshot());
    // Limit stack size
    if (this.undoState.snapshots.length > MAX_UNDO_STACK) {
      this.undoState.snapshots.shift();
    } else {
      this.undoState.index++;
    }
  }

  private restoreSnapshot(snapshot: SheetSnapshot): void {
    this.definition.rows = JSON.parse(JSON.stringify(snapshot.rows));
    this.saveToStorage();
  }

  // ==========================================================================
  // Batch Operations
  // ==========================================================================

  batchUpdate(updates: { row: number; col: number; value: CellValue }[]): void {
    this.isBatching = true;
    this.pendingChanges = [];

    for (const update of updates) {
      this.setCellValue(update.row, update.col, update.value);
    }

    this.isBatching = false;

    if (this.pendingChanges.length > 0) {
      this.pushSnapshot();
      for (const event of this.pendingChanges) {
        this.emit(event);
      }
      this.saveToStorage();
    }
    this.pendingChanges = [];
  }

  // ==========================================================================
  // Import / Export
  // ==========================================================================

  exportToCSV(): string {
    const headers = this.definition.columns.map(c => c.label).join(',');
    const rows = this.definition.rows.map(row => {
      return this.definition.columns.map(col => {
        const cell = row.cells[col.key];
        const val = cell?.computed !== undefined ? cell.computed : cell?.value;
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',');
    });
    return [headers, ...rows].join('\n');
  }

  importFromCSV(csv: string, options?: { hasHeader?: boolean; skipRows?: number }): void {
    const lines = csv.trim().split('\n');
    const skip = options?.skipRows ?? 0;
    const hasHeader = options?.hasHeader ?? true;
    const dataLines = lines.slice(skip + (hasHeader ? 1 : 0));

    // Clear existing rows
    this.definition.rows = [];

    for (const line of dataLines) {
      const values = this.parseCSVLine(line);
      const row: SheetRow = {
        id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        cells: {},
      };

      for (let i = 0; i < this.definition.columns.length; i++) {
        const col = this.definition.columns[i];
        const raw = values[i] ?? '';
        let val: CellValue = raw;

        if (col.type === 'number') {
          const num = parseFloat(raw);
          val = isNaN(num) ? null : num;
        } else if (col.type === 'checkbox') {
          val = raw.toLowerCase() === 'true' || raw === '1' || raw.toLowerCase() === 'yes';
        } else if (raw === '') {
          val = null;
        }

        row.cells[col.key] = {
          value: val,
          type: col.type,
        };
      }

      this.definition.rows.push(row);
    }

    this.pushSnapshot();
    this.saveToStorage();
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];

      if (ch === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  exportToJSON(): string {
    return JSON.stringify({
      definition: this.definition,
      timestamp: Date.now(),
    });
  }

  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json);
      if (data.definition) {
        this.definition = { ...data.definition };
        this.pushSnapshot();
        this.saveToStorage();
      }
    } catch {
      // Invalid JSON, ignore
    }
  }

  // ==========================================================================
  // Persistence
  // ==========================================================================

  private getStorageKey(): string {
    return `${STORAGE_PREFIX}${this.definition.id}`;
  }

  saveToStorage(): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.definition));
    } catch {
      // Storage full or unavailable
    }
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge stored rows with current definition structure
        if (parsed.rows) {
          this.definition.rows = parsed.rows;
        }
        if (parsed.columns) {
          // Update column widths but keep current structure
          for (let i = 0; i < Math.min(parsed.columns.length, this.definition.columns.length); i++) {
            if (parsed.columns[i].width) {
              this.definition.columns[i].width = parsed.columns[i].width;
            }
          }
        }
      }
    } catch {
      // Invalid stored data, ignore
    }
  }

  clearStorage(): void {
    localStorage.removeItem(this.getStorageKey());
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================

  subscribe(listener: SheetListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: SheetChangeEvent): void {
    for (const listener of this.listeners) {
      try { listener(event); } catch { /* ignore */ }
    }
  }

  // ==========================================================================
  // Aggregation
  // ==========================================================================

  getAggregation(type: 'sum' | 'avg' | 'min' | 'max' | 'count', colKey: string): number {
    const values = this.definition.rows
      .map(r => r.cells[colKey]?.computed ?? r.cells[colKey]?.value)
      .filter((v): v is number => typeof v === 'number');

    if (values.length === 0) return 0;

    switch (type) {
      case 'sum': return values.reduce((a, b) => a + b, 0);
      case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min': return Math.min(...values);
      case 'max': return Math.max(...values);
      case 'count': return values.length;
    }
  }

  // ==========================================================================
  // Search / Filter
  // ==========================================================================

  findRows(predicate: (row: SheetRow, index: number) => boolean): SheetRow[] {
    return this.definition.rows.filter(predicate);
  }

  getRowValues(rowIndex: number): Record<string, CellValue> {
    const row = this.definition.rows[rowIndex];
    if (!row) return {};
    const result: Record<string, CellValue> = {};
    for (const col of this.definition.columns) {
      const cell = row.cells[col.key];
      result[col.key] = cell?.computed ?? cell?.value ?? null;
    }
    return result;
  }

  getColumnValues(colKey: string): CellValue[] {
    return this.definition.rows.map(r => {
      const cell = r.cells[colKey];
      return cell?.computed ?? cell?.value ?? null;
    });
  }
}
