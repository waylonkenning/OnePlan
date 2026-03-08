import React, { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, FileText, Settings, X, AlertCircle, Check } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../lib/excel';
import { exportToPDF } from '../lib/pdf';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings } from '../types';

interface DataControlsProps {
  data: {
    assets: Asset[];
    initiatives: Initiative[];
    milestones: Milestone[];
    programmes: Programme[];
    strategies: Strategy[];
    dependencies: Dependency[];
    assetCategories: AssetCategory[];
    timelineSettings: TimelineSettings;
  };
  onImport: (data: {
    assets: Asset[];
    initiatives: Initiative[];
    milestones: Milestone[];
    programmes: Programme[];
    strategies: Strategy[];
    dependencies: Dependency[];
    assetCategories: AssetCategory[];
    timelineSettings: TimelineSettings;
  }) => void;
  timelineId?: string; // ID of the element to capture for PDF
}

export function DataControls({ data, onImport, timelineId }: DataControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    startYear: data.timelineSettings?.startYear?.toString() || '2026',
    yearsToShow: data.timelineSettings?.yearsToShow?.toString() || '3',
    budgetVisualisation: data.timelineSettings?.budgetVisualisation || 'off'
  });
  const [importPreviewData, setImportPreviewData] = useState<Partial<typeof data> | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleExportExcel = () => {
    exportToExcel(data);
  };

  const handleExportPDF = () => {
    if (timelineId) {
      exportToPDF(timelineId, `it-roadmap-${new Date().toISOString().split('T')[0]}.pdf`);
    } else {
      alert('Timeline view must be active to export PDF.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importFromExcel(file);

      // Basic validation/merging logic
      if (importedData.assets || importedData.initiatives) {
        setImportPreviewData(importedData);
        setShowImportModal(true);
      } else {
        alert('No valid data found in the Excel file.');
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import Excel file. Please check the format.');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveSettings = () => {
    console.log('handleSaveSettings called with:', localSettings);
    onImport({
      ...data,
      timelineSettings: {
        startYear: parseInt(localSettings.startYear.toString()) || new Date().getFullYear(),
        yearsToShow: parseInt(localSettings.yearsToShow.toString()) || 3,
        budgetVisualisation: localSettings.budgetVisualisation as 'off' | 'bar-height' | 'label',
      },
    });
    setShowSettings(false);
  };

  const handleOverwriteImport = () => {
    if (!importPreviewData) return;
    onImport({
      assets: importPreviewData.assets || [],
      initiatives: importPreviewData.initiatives || [],
      milestones: importPreviewData.milestones || [],
      programmes: importPreviewData.programmes || [],
      strategies: importPreviewData.strategies || [],
      dependencies: importPreviewData.dependencies || [],
      assetCategories: importPreviewData.assetCategories || [],
      timelineSettings: data.timelineSettings,
    });
    setShowImportModal(false);
    setImportPreviewData(null);
    alert('Data overwritten successfully!');
  };

  const handleMergeImport = () => {
    if (!importPreviewData) return;

    // Helper to merge arrays by ID
    const mergeArrays = <T extends { id: string }>(existing: T[], imported: T[] = []) => {
      const merged = [...existing];
      imported.forEach(importItem => {
        const index = merged.findIndex(e => e.id === importItem.id);
        if (index >= 0) {
          merged[index] = importItem;
        } else {
          merged.push(importItem);
        }
      });
      return merged;
    };

    onImport({
      assets: mergeArrays(data.assets, importPreviewData.assets),
      initiatives: mergeArrays(data.initiatives, importPreviewData.initiatives),
      milestones: mergeArrays(data.milestones, importPreviewData.milestones),
      programmes: mergeArrays(data.programmes, importPreviewData.programmes),
      strategies: mergeArrays(data.strategies, importPreviewData.strategies),
      dependencies: mergeArrays(data.dependencies, importPreviewData.dependencies),
      assetCategories: mergeArrays(data.assetCategories, importPreviewData.assetCategories),
      timelineSettings: data.timelineSettings,
    });
    setShowImportModal(false);
    setImportPreviewData(null);
    alert('Data merged successfully!');
  };

  return (
    <div className="flex items-center gap-2 relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        title="Timeline Settings"
      >
        <Settings size={16} />
        Timeline Settings
      </button>

      {showSettings && (
        <div className="absolute top-12 left-0 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800">Timeline Settings</h3>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="startYear" className="block text-sm font-medium text-slate-700 mb-1">
                Start Year
              </label>
              <input
                id="startYear"
                type="number"
                min="2000"
                max="2100"
                value={localSettings.startYear}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, startYear: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="yearsToShow" className="block text-sm font-medium text-slate-700 mb-1">
                Years to Show
              </label>
              <input
                id="yearsToShow"
                type="number"
                min="1"
                max="20"
                value={localSettings.yearsToShow}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, yearsToShow: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="budgetVisualisation" className="block text-sm font-medium text-slate-700 mb-1">
                Budget Visualisation
              </label>
              <select
                id="budgetVisualisation"
                value={localSettings.budgetVisualisation}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, budgetVisualisation: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="off">Off</option>
                <option value="bar-height">Bar Height</option>
                <option value="label">Right-aligned Label</option>
              </select>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      <div className="h-6 w-px bg-slate-200 mx-1" />

      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        title="Download roadmap as PDF"
        disabled={!timelineId}
      >
        <FileText size={16} />
        Export PDF
      </button>

      <div className="h-6 w-px bg-slate-200 mx-1" />

      <button
        onClick={handleExportExcel}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        title="Download current data as Excel"
      >
        <FileSpreadsheet size={16} />
        Export Excel
      </button>

      <button
        onClick={handleImportClick}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        title="Upload Excel file to update data"
      >
        <Upload size={16} />
        Import Excel
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {showImportModal && importPreviewData && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] import-preview-modal">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <AlertCircle size={24} />
              <h2 className="text-xl font-semibold text-slate-900">Import Preview</h2>
            </div>

            <p className="text-slate-600 mb-4">
              We found the following data in your Excel file:
            </p>

            <ul className="space-y-2 mb-6 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {importPreviewData.initiatives && <li><span className="font-semibold">{importPreviewData.initiatives.length}</span> Initiatives</li>}
              {importPreviewData.assets && <li><span className="font-semibold">{importPreviewData.assets.length}</span> Assets</li>}
              {importPreviewData.programmes && <li><span className="font-semibold">{importPreviewData.programmes.length}</span> Programmes</li>}
              {importPreviewData.strategies && <li><span className="font-semibold">{importPreviewData.strategies.length}</span> Strategies</li>}
              {importPreviewData.milestones && <li><span className="font-semibold">{importPreviewData.milestones.length}</span> Milestones</li>}
              {importPreviewData.dependencies && <li><span className="font-semibold">{importPreviewData.dependencies.length}</span> Dependencies</li>}
              {importPreviewData.assetCategories && <li><span className="font-semibold">{importPreviewData.assetCategories.length}</span> Categories</li>}
            </ul>

            <div className="space-y-3">
              <button
                onClick={handleMergeImport}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                title="Update exiting items and add new ones. Safest option."
              >
                <Check size={18} />
                Merge Data
              </button>

              <button
                onClick={handleOverwriteImport}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-medium transition-colors"
                title="Completely wipe current data and replace with Excel subset."
              >
                Overwrite All Data
              </button>

              <button
                onClick={() => { setShowImportModal(false); setImportPreviewData(null); }}
                className="w-full py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
