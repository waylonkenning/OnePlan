import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ClipboardPaste, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Option {
  value: string;
  label: string;
}

export interface Column<T> {
  key: keyof T;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'color';
  options?: Option[]; // For select type
  placeholder?: string;
  width?: string;
}

interface EditableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onUpdate: (newData: T[]) => void;
  idField: keyof T;
}

export function EditableTable<T extends { [key: string]: any }>({ 
  data, 
  columns, 
  onUpdate,
  idField 
}: EditableTableProps<T>) {
  const [rows, setRows] = useState<T[]>(data);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  // Only one blank row that spawns another when edited
  const GHOST_ROWS_COUNT = 1;

  useEffect(() => {
    setRows(data);
  }, [data]);

  const handleChange = (index: number, key: keyof T, value: any, isGhost: boolean = false) => {
    if (isGhost) {
        // Convert ghost row to real row
        const newRow: any = {};
        newRow[idField] = `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        columns.forEach(col => {
            if (col.key !== idField) {
                newRow[col.key] = col.type === 'number' ? 0 : '';
            }
        });

        // Set the specific value that triggered the change
        newRow[key] = value;

        const updatedRows = [...rows, newRow];
        setRows(updatedRows);
        onUpdate(updatedRows);
    } else {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [key]: value };
        setRows(newRows);
        onUpdate(newRows);
    }
  };

  const handleAdd = () => {
    const newRow: any = {};
    newRow[idField] = `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    columns.forEach(col => {
      if (col.key !== idField) {
        newRow[col.key] = col.type === 'number' ? 0 : '';
      }
    });

    const newRows = [...rows, newRow];
    setRows(newRows);
    onUpdate(newRows);
  };

  const handleDelete = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    onUpdate(newRows);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all rows in this table?')) {
      setRows([]);
      onUpdate([]);
    }
  };

  const handlePasteCsv = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    let updatedRows = [...rows];
    let hasHeader = false;
    let headerMapping: (keyof T | null)[] = [];

    // 1. Detect headers and create mapping
    if (lines.length > 0) {
      const firstLineValues = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().toLowerCase().replace(/^"|"$/g, ''));
      
      const colLabels = columns.map(c => c.label.toLowerCase());
      const colKeys = columns.map(c => String(c.key).toLowerCase());
      
      // Check if it looks like a header row
      const matches = firstLineValues.filter(v => 
        v === 'id' || colLabels.includes(v) || colKeys.includes(v)
      ).length;
      
      if (matches >= 1) {
        hasHeader = true;
        headerMapping = firstLineValues.map(val => {
          if (val === 'id' || val === String(idField).toLowerCase()) return idField;
          
          const colByKey = columns.find(c => String(c.key).toLowerCase() === val);
          if (colByKey) return colByKey.key;
          
          const colByLabel = columns.find(c => c.label.toLowerCase() === val);
          if (colByLabel) return colByLabel.key;
          
          return null;
        });
      }
    }

    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map(v => v.trim().replace(/^"|"$/g, ''));
      
      const rowData: any = {};
      
      if (hasHeader) {
        // Map values according to header position
        headerMapping.forEach((key, valIdx) => {
          if (key && valIdx < values.length) {
            let value: any = values[valIdx];
            const col = columns.find(c => c.key === key);
            if (col?.type === 'number') value = parseFloat(value) || 0;
            rowData[key] = value;
          }
        });
      } else {
        // Legacy positional mapping
        columns.forEach((col, colIdx) => {
          if (colIdx < values.length) {
            let value: any = values[colIdx];
            if (col.type === 'number') value = parseFloat(value) || 0;
            rowData[col.key] = value;
          } else if (rowData[col.key] === undefined) {
            rowData[col.key] = col.type === 'number' ? 0 : '';
          }
        });
      }

      // ID Management
      const targetId = rowData[idField] || `csv-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      rowData[idField] = targetId;

      const existingIndex = updatedRows.findIndex(r => String(r[idField]) === String(targetId));
      if (existingIndex !== -1) {
        updatedRows[existingIndex] = { ...updatedRows[existingIndex], ...rowData };
      } else {
        updatedRows.push(rowData as T);
      }
    }

    setRows(updatedRows);
    onUpdate(updatedRows);
    setCsvText('');
    setIsCsvModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-auto border border-slate-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} className="px-4 py-3 font-medium border-b border-r border-slate-200 last:border-r-0 whitespace-nowrap" style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 border-b border-slate-200 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {/* Real Data Rows */}
            {rows.map((row, rowIndex) => (
              <tr key={String(row[idField])} data-real="true" className="hover:bg-slate-50 group">
                {columns.map(col => (
                  <td key={`${String(row[idField])}-${String(col.key)}`} className="border-b border-r border-slate-100 last:border-r-0 p-0 relative">
                    {col.type === 'select' ? (
                      <select
                        value={String(row[col.key] || '')}
                        onChange={(e) => handleChange(rowIndex, col.key, e.target.value, false)}
                        className="w-full h-full px-3 py-2 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none appearance-none"
                      >
                        <option value="">Select...</option>
                        {col.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : col.type === 'color' ? (
                        <div className="flex items-center px-2">
                             <div className={cn("w-4 h-4 rounded-full mr-2 border border-slate-200", String(row[col.key]))} />
                             <select
                                value={String(row[col.key] || '')}
                                onChange={(e) => handleChange(rowIndex, col.key, e.target.value, false)}
                                className="w-full h-full py-2 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none text-xs"
                            >
                                <option value="">Select Color...</option>
                                <option value="bg-blue-500">Blue</option>
                                <option value="bg-emerald-500">Emerald</option>
                                <option value="bg-amber-500">Amber</option>
                                <option value="bg-rose-500">Rose</option>
                                <option value="bg-purple-500">Purple</option>
                                <option value="bg-indigo-500">Indigo</option>
                                <option value="bg-slate-500">Slate</option>
                            </select>
                        </div>
                    ) : (
                      <input
                        type={col.type}
                        value={col.type === 'number' ? Number(row[col.key]) : String(row[col.key] || '')}
                        onChange={(e) => handleChange(rowIndex, col.key, col.type === 'number' ? Number(e.target.value) : e.target.value, false)}
                        placeholder={col.placeholder}
                        className="w-full h-full px-3 py-2 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none"
                      />
                    )}
                  </td>
                ))}
                <td className="border-b border-slate-100 p-1 text-center">
                  <button
                    onClick={() => handleDelete(rowIndex)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete row"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {/* Blank (Empty) Rows for quick entry */}
            {Array.from({ length: GHOST_ROWS_COUNT }).map((_, i) => (
              <tr key={`blank-${i}`} className="hover:bg-slate-50 group">
                {columns.map(col => (
                  <td key={`blank-${i}-${String(col.key)}`} className="border-b border-r border-slate-100 last:border-r-0 p-0 relative">
                    {col.type === 'select' ? (
                      <select
                        value=""
                        onChange={(e) => handleChange(rows.length + i, col.key, e.target.value, true)}
                        className="w-full h-full px-3 py-2 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none appearance-none"
                      >
                        <option value=""></option>
                        {col.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : col.type === 'color' ? (
                        <div className="flex items-center px-2">
                             <div className="w-4 h-4 rounded-full mr-2 border border-slate-100 bg-slate-50" />
                             <select
                                value=""
                                onChange={(e) => handleChange(rows.length + i, col.key, e.target.value, true)}
                                className="w-full h-full py-2 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none text-xs"
                            >
                                <option value=""></option>
                                <option value="bg-blue-500">Blue</option>
                                <option value="bg-emerald-500">Emerald</option>
                                <option value="bg-amber-500">Amber</option>
                                <option value="bg-rose-500">Rose</option>
                                <option value="bg-purple-500">Purple</option>
                                <option value="bg-indigo-500">Indigo</option>
                                <option value="bg-slate-500">Slate</option>
                            </select>
                        </div>
                    ) : (
                      <input
                        type={col.type}
                        value=""
                        onChange={(e) => handleChange(rows.length + i, col.key, col.type === 'number' ? Number(e.target.value) : e.target.value, true)}
                        className="w-full h-full px-3 py-2 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none"
                      />
                    )}
                  </td>
                ))}
                <td className="border-b border-slate-100 p-1 text-center">
                  <div className="w-6 h-6" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
        >
          <Plus size={16} />
          Add Row
        </button>
        <button
          onClick={() => setIsCsvModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm"
        >
          <ClipboardPaste size={16} />
          Paste CSV
        </button>
        <div className="ml-auto">
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm font-medium text-sm"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>
      </div>

      {isCsvModalOpen && (
        <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 rounded-lg">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <ClipboardPaste size={18} className="text-blue-500" />
                Paste CSV Data
              </h3>
              <button onClick={() => setIsCsvModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex-1">
              <p className="text-xs text-slate-500 mb-3">
                Paste comma-separated values. Each line will become a new row.
                <br />
                Expected columns: <span className="font-mono text-blue-600">{columns.map(c => c.label).join(', ')}</span>
              </p>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full h-48 p-3 text-sm font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Value 1, Value 2, Value 3..."
                autoFocus
              />
            </div>
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteCsv}
                disabled={!csvText.trim()}
                data-testid="import-rows-button"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-sm"
              >
                <Check size={16} />
                Import Rows
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
