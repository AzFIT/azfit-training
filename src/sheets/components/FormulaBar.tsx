/**
 * AzFIT.ai — FormulaBar Component
 * Shows selected cell reference, value, and formula input
 */


import { cellRef } from '../types';
import type { CellPosition, CellValue } from '../types';
import { Calculator, Check, X, FunctionSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormulaBarProps {
  selectedCell: CellPosition | null;
  selectedValue: CellValue;
  selectedFormula: string | null;
  editValue: string;
  isEditing: boolean;
  onEditValueChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  onStartEdit: () => void;
}

export default function FormulaBar({
  selectedCell,
  selectedValue,
  selectedFormula,
  editValue,
  isEditing,
  onEditValueChange,
  onCommit,
  onCancel,
  onStartEdit,
}: FormulaBarProps) {
  const cellName = selectedCell ? cellRef(selectedCell.row, selectedCell.col) : '';
  const isFormula = selectedFormula !== null && selectedFormula !== '';

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      {/* Cell reference */}
      <div className="flex items-center gap-1.5 min-w-[80px]">
        <FunctionSquare className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-mono font-medium text-slate-600 dark:text-slate-300 w-12 text-center bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5">
          {cellName || ''}
        </span>
      </div>

      {/* Formula/value input */}
      <div className="flex-1 flex items-center gap-2">
        {isFormula && !isEditing && (
          <Calculator className="w-4 h-4 text-purple-500 shrink-0" />
        )}
        <input
          type="text"
          value={isEditing ? editValue : (selectedFormula ?? String(selectedValue ?? ''))}
          onChange={(e) => onEditValueChange(e.target.value)}
          onFocus={onStartEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder={selectedCell ? 'Enter value or formula' : 'Select a cell'}
          className={cn(
            'flex-1 px-2 py-1.5 text-sm rounded border outline-none transition-colors',
            isEditing
              ? 'border-teal-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            !selectedCell && 'cursor-not-allowed opacity-50'
          )}
          disabled={!selectedCell}
        />
      </div>

      {/* Action buttons */}
      {isEditing && (
        <div className="flex items-center gap-1">
          <button
            onClick={onCommit}
            className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors"
            title="Confirm (Enter)"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formula indicator */}
      {isFormula && !isEditing && (
        <span className="text-xs text-purple-500 dark:text-purple-400 font-mono bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
          =FORMULA
        </span>
      )}
    </div>
  );
}
