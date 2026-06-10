/**
 * AzFIT.ai — Toolbar Component
 * Sheet toolbar with undo/redo, formatting, and data operations
 */


import { cn } from '@/lib/utils';
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Download,
  Upload,
  Filter,
  ArrowUpDown,
  Table2,
} from 'lucide-react';

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onInsertRow: () => void;
  onDeleteRow: () => void;
  onExportCSV: () => void;
  onImportCSV?: () => void;
  onToggleBold?: () => void;
  onToggleItalic?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  selectedCell: { row: number; col: number } | null;
}

export default function Toolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onInsertRow,
  onDeleteRow,
  onExportCSV,
  onImportCSV,
  onToggleBold,
  onToggleItalic,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  selectedCell,
}: ToolbarProps) {
  const btnClass = (active?: boolean, disabled?: boolean) =>
    cn(
      'p-1.5 rounded-md transition-colors',
      disabled
        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
        : active
        ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    );

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex-wrap">
      {/* Undo/Redo group */}
      <div className="flex items-center gap-0.5">
        <button
          className={btnClass(false, !canUndo)}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          className={btnClass(false, !canRedo)}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Formatting group */}
      <div className="flex items-center gap-0.5">
        <button
          className={btnClass()}
          onClick={onToggleBold}
          disabled={!selectedCell}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          className={btnClass()}
          onClick={onToggleItalic}
          disabled={!selectedCell}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Alignment group */}
      <div className="flex items-center gap-0.5">
        <button
          className={btnClass()}
          onClick={onAlignLeft}
          disabled={!selectedCell}
          title="Align left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          className={btnClass()}
          onClick={onAlignCenter}
          disabled={!selectedCell}
          title="Align center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          className={btnClass()}
          onClick={onAlignRight}
          disabled={!selectedCell}
          title="Align right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Row operations */}
      <div className="flex items-center gap-0.5">
        <button
          className={btnClass()}
          onClick={onInsertRow}
          title="Insert row"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          className={btnClass()}
          onClick={onDeleteRow}
          disabled={!selectedCell}
          title="Delete row"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Data operations */}
      <div className="flex items-center gap-0.5">
        <button
          className={btnClass()}
          onClick={onExportCSV}
          title="Export CSV"
        >
          <Download className="w-4 h-4" />
        </button>
        {onImportCSV && (
          <button
            className={btnClass()}
            onClick={onImportCSV}
            title="Import CSV"
          >
            <Upload className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Sort/Filter placeholders */}
      <div className="flex items-center gap-0.5 opacity-50">
        <button className={btnClass()} disabled title="Sort (coming soon)">
          <ArrowUpDown className="w-4 h-4" />
        </button>
        <button className={btnClass()} disabled title="Filter (coming soon)">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Sheet info */}
      <div className="ml-auto flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <Table2 className="w-3.5 h-3.5" />
        <span>{selectedCell ? `Row ${selectedCell.row + 1}, Col ${selectedCell.col + 1}` : 'No selection'}</span>
      </div>
    </div>
  );
}
