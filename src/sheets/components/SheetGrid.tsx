/**
 * AzFIT.ai — SheetGrid Component
 * Virtualized spreadsheet grid with cell editing, selection, and formatting
 */

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

import type { CellPosition, CellValue, CellFormat } from '../types';

interface SheetGridProps {
  columns: { key: string; label: string; type: string; width?: number; editable?: boolean }[];
  rows: { id: string; cells: Record<string, { value: CellValue; computed?: CellValue; formula?: string; type: string; format?: CellFormat }> }[];
  rowCount: number;
  columnCount: number;
  selectedCell: CellPosition | null;
  editingCell: CellPosition | null;
  editValue: string;
  frozenCols?: number;
  frozenRows?: number;
  defaultRowHeight?: number;
  defaultColWidth?: number;
  onSelectCell: (pos: CellPosition | null) => void;
  onStartEditing: (pos: CellPosition) => void;
  onStopEditing: (commit: boolean) => void;
  onSetEditValue: (value: string) => void;
  onSetValue: (row: number, col: number, value: CellValue) => void;
  onSetColumnWidth: (colIndex: number, width: number) => void;
  onInsertRow: (atIndex: number) => void;
  onDeleteRow: (atIndex: number) => void;
}

const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_COL_WIDTH = 120;
const HEADER_HEIGHT = 36;
const ROW_HEADER_WIDTH = 50;

export default function SheetGrid({
  columns,
  rows,
  rowCount,
  columnCount,
  selectedCell,
  editingCell,
  editValue,
  frozenCols: _frozenCols = 1,
  frozenRows: _frozenRows = 1,
  defaultRowHeight = DEFAULT_ROW_HEIGHT,
  defaultColWidth = DEFAULT_COL_WIDTH,
  onSelectCell,
  onStartEditing,
  onStopEditing,
  onSetEditValue,
  onSetValue,
  onSetColumnWidth,
  onInsertRow,
  onDeleteRow,
}: SheetGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [isResizing, setIsResizing] = useState<{ colIndex: number; startX: number; startWidth: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowIndex: number } | null>(null);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  // Column resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const width = columns[colIndex]?.width ?? defaultColWidth;
    setIsResizing({ colIndex, startX: e.clientX, startWidth: width });
  }, [columns, defaultColWidth]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - isResizing.startX;
      const newWidth = Math.max(60, isResizing.startWidth + delta);
      onSetColumnWidth(isResizing.colIndex, newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onSetColumnWidth]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selectedCell) return;

    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onStopEditing(true);
        // Move to next row
        onSelectCell({ row: selectedCell.row + 1, col: selectedCell.col });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onStopEditing(false);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        onStopEditing(true);
        const nextCol = e.shiftKey ? selectedCell.col - 1 : selectedCell.col + 1;
        onSelectCell({ row: selectedCell.row, col: Math.max(0, nextCol) });
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        onSelectCell({ row: Math.max(0, selectedCell.row - 1), col: selectedCell.col });
        break;
      case 'ArrowDown':
        e.preventDefault();
        onSelectCell({ row: Math.min(rowCount - 1, selectedCell.row + 1), col: selectedCell.col });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onSelectCell({ row: selectedCell.row, col: Math.max(0, selectedCell.col - 1) });
        break;
      case 'ArrowRight':
        e.preventDefault();
        onSelectCell({ row: selectedCell.row, col: Math.min(columnCount - 1, selectedCell.col + 1) });
        break;
      case 'Enter':
        e.preventDefault();
        onStartEditing(selectedCell);
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        onSetValue(selectedCell.row, selectedCell.col, null);
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          onStartEditing(selectedCell);
          onSetEditValue(e.key);
        }
        break;
    }
  }, [selectedCell, editingCell, rowCount, columnCount, onSelectCell, onStartEditing, onStopEditing, onSetValue, onSetEditValue]);

  // Get cell display value
  const getCellDisplay = (rowIndex: number, colIndex: number): string => {
    const col = columns[colIndex];
    if (!col) return '';
    const row = rows[rowIndex];
    if (!row) return '';
    const cell = row.cells[col.key];
    if (!cell) return '';
    const val = cell.computed !== undefined ? cell.computed : cell.value;
    if (val === null || val === undefined) return '';
    if (typeof val === 'boolean') return val ? '✓' : '';
    return String(val);
  };

  // Get cell style
  const getCellStyle = (rowIndex: number, colIndex: number): React.CSSProperties => {
    const col = columns[colIndex];
    if (!col) return {};
    const row = rows[rowIndex];
    if (!row) return {};
    const cell = row.cells[col.key];
    if (!cell?.format) return {};
    return {
      fontWeight: cell.format.bold ? 'bold' : undefined,
      fontStyle: cell.format.italic ? 'italic' : undefined,
      color: cell.format.color,
      backgroundColor: cell.format.bgColor,
      textAlign: cell.format.align,
    };
  };

  // Render cell
  const renderCell = (rowIndex: number, colIndex: number) => {
    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
    const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
    const col = columns[colIndex];
    const width = col?.width ?? defaultColWidth;

    if (isEditing) {
      return (
        <div
          className="absolute inset-0 z-20"
          style={{ minWidth: width }}
        >
          <input
            ref={editInputRef}
            type="text"
            value={editValue}
            onChange={(e) => onSetEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onStopEditing(true)}
            className="w-full h-full px-2 text-sm border-2 border-teal-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            style={{ height: defaultRowHeight }}
          />
        </div>
      );
    }

    const displayValue = getCellDisplay(rowIndex, colIndex);
    const cellStyle = getCellStyle(rowIndex, colIndex);
    const isFormula = rows[rowIndex]?.cells[col.key]?.formula !== undefined;

    return (
      <div
        className={cn(
          'w-full h-full px-2 flex items-center text-sm truncate cursor-cell select-none',
          'border-r border-b border-slate-200 dark:border-slate-700',
          isSelected && 'ring-2 ring-inset ring-teal-500 z-10',
          colIndex === 0 && 'border-l',
          rowIndex === 0 && 'border-t',
          isFormula && 'text-purple-600 dark:text-purple-400',
          cellStyle.color && 'text-current',
        )}
        style={{
          width,
          height: defaultRowHeight,
          ...cellStyle,
        }}
        onClick={() => onSelectCell({ row: rowIndex, col: colIndex })}
        onDoubleClick={() => onStartEditing({ row: rowIndex, col: colIndex })}
      >
        {displayValue}
      </div>
    );
  };

  // Calculate total width
  const totalWidth = useMemo(() => {
    return ROW_HEADER_WIDTH + columns.reduce((sum, c) => sum + (c.width ?? defaultColWidth), 0);
  }, [columns, defaultColWidth]);

  const totalHeight = HEADER_HEIGHT + rowCount * defaultRowHeight;

  return (
    <div
      ref={gridRef}
      className="relative overflow-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Grid container */}
      <div
        className="relative"
        style={{ width: totalWidth, height: totalHeight }}
      >
        {/* Corner cell (row/col header intersection) */}
        <div
          className="absolute top-0 left-0 z-30 bg-slate-100 dark:bg-slate-800 border-r border-b border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400"
          style={{ width: ROW_HEADER_WIDTH, height: HEADER_HEIGHT }}
        >
          #
        </div>

        {/* Column headers */}
        {columns.map((col, colIndex) => (
          <div
            key={col.key}
            className="absolute top-0 z-20 bg-slate-100 dark:bg-slate-800 border-r border-b border-slate-300 dark:border-slate-600 flex items-center px-2 text-xs font-semibold text-slate-600 dark:text-slate-300 select-none"
            style={{
              left: ROW_HEADER_WIDTH + columns.slice(0, colIndex).reduce((s, c) => s + (c.width ?? defaultColWidth), 0),
              width: col.width ?? defaultColWidth,
              height: HEADER_HEIGHT,
            }}
          >
            <span className="flex-1 truncate">{col.label}</span>
            {/* Resize handle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-teal-500"
              onMouseDown={(e) => handleResizeStart(e, colIndex)}
            />
          </div>
        ))}

        {/* Row headers */}
        {Array.from({ length: rowCount }, (_, rowIndex) => (
          <div
            key={`rh-${rowIndex}`}
            className="absolute left-0 z-20 bg-slate-100 dark:bg-slate-800 border-r border-b border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 select-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
            style={{
              top: HEADER_HEIGHT + rowIndex * defaultRowHeight,
              width: ROW_HEADER_WIDTH,
              height: defaultRowHeight,
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, rowIndex });
            }}
          >
            {rowIndex + 1}
          </div>
        ))}

        {/* Data cells */}
        {Array.from({ length: rowCount }, (_, rowIndex) =>
          columns.map((_col, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="absolute"
              style={{
                top: HEADER_HEIGHT + rowIndex * defaultRowHeight,
                left: ROW_HEADER_WIDTH + columns.slice(0, colIndex).reduce((s, c) => s + (c.width ?? defaultColWidth), 0),
              }}
            >
              {renderCell(rowIndex, colIndex)}
            </div>
          ))
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => {
                onInsertRow(contextMenu.rowIndex);
                setContextMenu(null);
              }}
            >
              Insert row above
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => {
                onInsertRow(contextMenu.rowIndex + 1);
                setContextMenu(null);
              }}
            >
              Insert row below
            </button>
            <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
            <button
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => {
                onDeleteRow(contextMenu.rowIndex);
                setContextMenu(null);
              }}
            >
              Delete row
            </button>
          </div>
        </>
      )}
    </div>
  );
}
