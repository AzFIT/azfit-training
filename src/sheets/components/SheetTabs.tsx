/**
 * AzFIT.ai — SheetTabs Component
 * Multi-sheet tab bar for switching between sheets
 */


import { cn } from '@/lib/utils';
import { FileSpreadsheet, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface SheetTab {
  id: string;
  name: string;
  icon?: string;
}

interface SheetTabsProps {
  sheets: SheetTab[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onAddSheet?: () => void;
  onRemoveSheet?: (id: string) => void;
  onRenameSheet?: (id: string, name: string) => void;
}

export default function SheetTabs({
  sheets,
  activeSheetId,
  onSelectSheet,
  onAddSheet,
  onRemoveSheet,
}: SheetTabsProps) {
  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      {/* Scroll left */}
      <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0">
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Tabs */}
      <div className="flex-1 flex overflow-x-auto scrollbar-hide">
        {sheets.map((sheet) => {
          const isActive = sheet.id === activeSheetId;
          return (
            <div
              key={sheet.id}
              className={cn(
                'group flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer select-none whitespace-nowrap transition-colors border-r border-slate-200 dark:border-slate-700',
                isActive
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 font-medium border-t-2 border-t-teal-500'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
              onClick={() => onSelectSheet(sheet.id)}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{sheet.name}</span>
              {onRemoveSheet && sheets.length > 1 && (
                <button
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSheet(sheet.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add sheet */}
      {onAddSheet && (
        <button
          onClick={onAddSheet}
          className="p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shrink-0"
          title="Add sheet"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}

      {/* Scroll right */}
      <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
