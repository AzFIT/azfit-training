/**
 * AzFIT.ai — SheetsView Page
 * Master spreadsheet interface — the "website IS the sheet"
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SheetEngine } from '@/sheets/engine/SheetEngine';
import { useSheet } from '@/sheets/hooks/useSheet';
import SheetGrid from '@/sheets/components/SheetGrid';
import FormulaBar from '@/sheets/components/FormulaBar';
import SheetTabs, { type SheetTab } from '@/sheets/components/SheetTabs';
import Toolbar from '@/sheets/components/Toolbar';
import { ALL_SHEET_DEFINITIONS, getSheetDefinition } from '@/sheets/definitions';
import type { SheetDefinition } from '@/sheets/types';

import {
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Save,
  ChevronLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Engine registry to persist across tab switches
const engineRegistry = new Map<string, SheetEngine>();

function getOrCreateEngine(def: SheetDefinition): SheetEngine {
  if (!engineRegistry.has(def.id)) {
    engineRegistry.set(def.id, new SheetEngine(def));
  }
  return engineRegistry.get(def.id)!;
}

export default function SheetsView() {
  const [activeSheetId, setActiveSheetId] = useState<string>('daily-log');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDef = getSheetDefinition(activeSheetId) ?? ALL_SHEET_DEFINITIONS[0];
  const sheet = useSheet(activeDef, { autoSave: true, autoSaveInterval: 3000 });

  // Sync engine with hook
  useEffect(() => {
    // When switching sheets, the hook gets a new definition
    // The engine is already persisted in the registry
  }, [activeSheetId]);

  const tabs: SheetTab[] = ALL_SHEET_DEFINITIONS.map(d => ({
    id: d.id,
    name: d.name,
    icon: d.icon,
  }));

  const handleSelectSheet = useCallback((id: string) => {
    setActiveSheetId(id);
  }, []);

  const handleExportAll = useCallback(() => {
    const allData: Record<string, string> = {};
    for (const def of ALL_SHEET_DEFINITIONS) {
      const eng = getOrCreateEngine(def);
      allData[def.id] = eng.exportToCSV();
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `azfit_sheets_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
      setShowImportModal(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleImportCSV = useCallback(() => {
    if (importText.trim()) {
      sheet.importCSV(importText);
      setShowImportModal(false);
      setImportText('');
    }
  }, [sheet, importText]);

  const handleClearSheet = useCallback(() => {
    if (confirm(`Clear all data from "${activeDef.name}"? This cannot be undone.`)) {
      sheet.engine.clearStorage();
      window.location.reload();
    }
  }, [activeDef, sheet]);

  const handleFormatToggle = useCallback((formatKey: 'bold' | 'italic') => {
    if (!sheet.selectedCell) return;
    const cell = sheet.getCell(sheet.selectedCell.row, sheet.selectedCell.col);
    const current = cell?.format?.[formatKey] ?? false;
    sheet.setFormat(sheet.selectedCell.row, sheet.selectedCell.col, { [formatKey]: !current });
  }, [sheet]);

  const handleAlign = useCallback((align: 'left' | 'center' | 'right') => {
    if (!sheet.selectedCell) return;
    sheet.setFormat(sheet.selectedCell.row, sheet.selectedCell.col, { align });
  }, [sheet]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-500" />
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
              AzFIT Sheets
            </h1>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {activeDef.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.txt"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={handleClearSheet}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={() => sheet.engine.saveToStorage()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        canUndo={sheet.canUndo}
        canRedo={sheet.canRedo}
        onUndo={sheet.undo}
        onRedo={sheet.redo}
        onInsertRow={() => {
          const idx = sheet.selectedCell?.row ?? sheet.rowCount;
          sheet.insertRow(idx);
        }}
        onDeleteRow={() => {
          if (sheet.selectedCell) sheet.deleteRow(sheet.selectedCell.row);
        }}
        onExportCSV={sheet.downloadCSV}
        onImportCSV={() => setShowImportModal(true)}
        onToggleBold={() => handleFormatToggle('bold')}
        onToggleItalic={() => handleFormatToggle('italic')}
        onAlignLeft={() => handleAlign('left')}
        onAlignCenter={() => handleAlign('center')}
        onAlignRight={() => handleAlign('right')}
        selectedCell={sheet.selectedCell}
      />

      {/* Formula Bar */}
      <FormulaBar
        selectedCell={sheet.selectedCell}
        selectedValue={sheet.selectedCellValue}
        selectedFormula={sheet.selectedCellFormula}
        editValue={sheet.editValue}
        isEditing={!!sheet.editingCell}
        onEditValueChange={sheet.setEditValue}
        onCommit={() => sheet.stopEditing(true)}
        onCancel={() => sheet.stopEditing(false)}
        onStartEdit={() => sheet.selectedCell && sheet.startEditing(sheet.selectedCell)}
      />

      {/* Sheet Grid */}
      <div className="flex-1 overflow-hidden p-2">
        <SheetGrid
          columns={sheet.columns}
          rows={sheet.rows}
          rowCount={sheet.rowCount}
          columnCount={sheet.columnCount}
          selectedCell={sheet.selectedCell}
          editingCell={sheet.editingCell}
          editValue={sheet.editValue}
          frozenCols={activeDef.frozenCols ?? 1}
          frozenRows={activeDef.frozenRows ?? 1}
          defaultRowHeight={activeDef.defaultRowHeight ?? 32}
          defaultColWidth={activeDef.defaultColWidth ?? 120}
          onSelectCell={sheet.selectCell}
          onStartEditing={sheet.startEditing}
          onStopEditing={sheet.stopEditing}
          onSetEditValue={sheet.setEditValue}
          onSetValue={sheet.setValue}
          onSetColumnWidth={sheet.setColumnWidth}
          onInsertRow={sheet.insertRow}
          onDeleteRow={sheet.deleteRow}
        />
      </div>

      {/* Aggregations bar */}
      {activeDef.aggregations && activeDef.aggregations.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Totals:</span>
          {activeDef.aggregations.map(agg => {
            const value = sheet.getAggregation(agg.type, agg.columnKey);
            return (
              <span key={`${agg.type}-${agg.columnKey}`} className="text-slate-600 dark:text-slate-300">
                {agg.label ?? `${agg.type} ${agg.columnKey}`}:{' '}
                <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">
                  {typeof value === 'number' ? value.toFixed(1) : value}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Sheet Tabs */}
      <SheetTabs
        sheets={tabs}
        activeSheetId={activeSheetId}
        onSelectSheet={handleSelectSheet}
      />

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Import CSV to {activeDef.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Paste CSV data below. The first row will be treated as headers.
                </p>
              </div>
              <div className="p-6">
                <textarea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="Date,BW (kg),Training/Rest,Calories...&#10;2024-01-01,75.5,Training,2500..."
                  className="w-full h-64 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportCSV}
                  className="px-4 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                >
                  Import
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
