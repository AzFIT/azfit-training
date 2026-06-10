/**
 * AzFIT.ai — useSheet Hook
 * React hook for interacting with the SheetEngine
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SheetEngine } from '../engine/SheetEngine';
import type {
  SheetDefinition,
  CellValue,
  CellPosition,
  CellFormat,
} from '../types';

export interface UseSheetOptions {
  autoSave?: boolean;
  autoSaveInterval?: number;
}

export function useSheet(definition: SheetDefinition, options: UseSheetOptions = {}) {
  const { autoSave = true, autoSaveInterval = 5000 } = options;
  
  const engineRef = useRef<SheetEngine>(new SheetEngine(definition));
  const [version, setVersion] = useState(0); // Force re-render on changes
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: CellPosition; end: CellPosition } | null>(null);
  const [editValue, setEditValue] = useState('');

  const engine = engineRef.current;

  // Force re-render when engine changes
  const forceUpdate = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  // Subscribe to engine changes
  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      forceUpdate();
    });
    return unsubscribe;
  }, [engine, forceUpdate]);

  // Auto-save
  useEffect(() => {
    if (!autoSave) return;
    const interval = setInterval(() => {
      engine.saveToStorage();
    }, autoSaveInterval);
    return () => clearInterval(interval);
  }, [engine, autoSave, autoSaveInterval]);

  // Cell operations
  const setValue = useCallback((row: number, col: number, value: CellValue) => {
    engine.setCellValue(row, col, value);
    forceUpdate();
  }, [engine, forceUpdate]);

  const setFormat = useCallback((row: number, col: number, format: Partial<CellFormat>) => {
    engine.setCellFormat(row, col, format);
    forceUpdate();
  }, [engine, forceUpdate]);

  const getValue = useCallback((row: number, col: number): CellValue => {
    return engine.getCellValue(row, col);
  }, [engine]);

  const getCell = useCallback((row: number, col: number) => {
    return engine.getCell(row, col);
  }, [engine]);

  // Row operations
  const insertRow = useCallback((atIndex: number, data?: Partial<Record<string, CellValue>>) => {
    engine.insertRow(atIndex, data);
    forceUpdate();
  }, [engine, forceUpdate]);

  const deleteRow = useCallback((atIndex: number) => {
    engine.deleteRow(atIndex);
    forceUpdate();
  }, [engine, forceUpdate]);

  const appendRow = useCallback((data?: Partial<Record<string, CellValue>>) => {
    engine.insertRow(engine.rowCount, data);
    forceUpdate();
  }, [engine, forceUpdate]);

  // Column operations
  const setColumnWidth = useCallback((colIndex: number, width: number) => {
    engine.setColumnWidth(colIndex, width);
    forceUpdate();
  }, [engine, forceUpdate]);

  // Selection
  const selectCell = useCallback((pos: CellPosition | null) => {
    setSelectedCell(pos);
    setSelectedRange(null);
    if (pos) {
      const cell = engine.getCell(pos.row, pos.col);
      const val = cell?.formula ?? (cell?.computed !== undefined ? String(cell.computed) : String(cell?.value ?? ''));
      setEditValue(val);
    } else {
      setEditValue('');
    }
  }, [engine]);

  const startEditing = useCallback((pos: CellPosition) => {
    setEditingCell(pos);
    const cell = engine.getCell(pos.row, pos.col);
    const val = cell?.formula ?? (cell?.computed !== undefined ? String(cell.computed) : String(cell?.value ?? ''));
    setEditValue(val);
  }, [engine]);

  const stopEditing = useCallback((commit: boolean = true) => {
    if (editingCell && commit) {
      engine.setCellValue(editingCell.row, editingCell.col, editValue);
    }
    setEditingCell(null);
    forceUpdate();
  }, [editingCell, editValue, engine, forceUpdate]);

  // Undo/Redo
  const undo = useCallback(() => {
    engine.undo();
    forceUpdate();
  }, [engine, forceUpdate]);

  const redo = useCallback(() => {
    engine.redo();
    forceUpdate();
  }, [engine, forceUpdate]);

  const canUndo = engine.canUndo();
  const canRedo = engine.canRedo();

  // Export/Import
  const exportCSV = useCallback((): string => {
    return engine.exportToCSV();
  }, [engine]);

  const downloadCSV = useCallback(() => {
    const csv = engine.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${engine.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [engine]);

  const importCSV = useCallback((csv: string) => {
    engine.importFromCSV(csv);
    forceUpdate();
  }, [engine, forceUpdate]);

  // Aggregations
  const getAggregation = useCallback((type: 'sum' | 'avg' | 'min' | 'max' | 'count', colKey: string): number => {
    return engine.getAggregation(type, colKey);
  }, [engine]);

  // Computed properties
  const columns = engine.columns;
  const rows = engine.rows;
  const rowCount = engine.rowCount;
  const columnCount = engine.columnCount;

  const selectedCellValue = useMemo(() => {
    if (!selectedCell) return null;
    return engine.getCellValue(selectedCell.row, selectedCell.col);
  }, [selectedCell, engine, version]);

  const selectedCellFormula = useMemo(() => {
    if (!selectedCell) return null;
    const cell = engine.getCell(selectedCell.row, selectedCell.col);
    return cell?.formula ?? null;
  }, [selectedCell, engine, version]);

  return {
    // Data
    columns,
    rows,
    rowCount,
    columnCount,
    engine,
    version,

    // Selection
    selectedCell,
    selectedRange,
    editingCell,
    editValue,
    setEditValue,
    selectCell,
    startEditing,
    stopEditing,
    selectedCellValue,
    selectedCellFormula,

    // Cell operations
    setValue,
    setFormat,
    getValue,
    getCell,

    // Row operations
    insertRow,
    deleteRow,
    appendRow,

    // Column operations
    setColumnWidth,

    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,

    // Export/Import
    exportCSV,
    downloadCSV,
    importCSV,

    // Aggregations
    getAggregation,

    // Force update
    forceUpdate,
  };
}
