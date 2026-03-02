import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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

  useEffect(() => {
    setRows(data);
  }, [data]);

  const handleChange = (index: number, key: keyof T, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [key]: value };
    setRows(newRows);
    onUpdate(newRows);
  };

  const handleAdd = () => {
    // Create a generic empty object based on columns
    const newRow: any = {};
    // Generate a simple ID
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

  return (
    <div className="flex flex-col h-full">
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
            {rows.map((row, rowIndex) => (
              <tr key={String(row[idField])} className="hover:bg-slate-50 group">
                {columns.map(col => (
                  <td key={`${String(row[idField])}-${String(col.key)}`} className="border-b border-r border-slate-100 last:border-r-0 p-0 relative">
                    {col.type === 'select' ? (
                      <select
                        value={String(row[col.key] || '')}
                        onChange={(e) => handleChange(rowIndex, col.key, e.target.value)}
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
                                onChange={(e) => handleChange(rowIndex, col.key, e.target.value)}
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
                        onChange={(e) => handleChange(rowIndex, col.key, col.type === 'number' ? Number(e.target.value) : e.target.value)}
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
            {rows.length === 0 && (
                <tr>
                    <td colSpan={columns.length + 1} className="p-8 text-center text-slate-400 italic">
                        No data. Click "Add Row" to start.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
        >
          <Plus size={16} />
          Add Row
        </button>
      </div>
    </div>
  );
}
