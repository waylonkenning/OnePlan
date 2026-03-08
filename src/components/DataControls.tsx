import React, { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, FileText, Settings, X } from 'lucide-react';
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
  const [localSettings, setLocalSettings] = useState(data.timelineSettings || { startYear: 2026, yearsToShow: 3 });

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
        onImport({
          assets: importedData.assets || [],
          initiatives: importedData.initiatives || [],
          milestones: importedData.milestones || [],
          programmes: importedData.programmes || [],
          strategies: importedData.strategies || [],
          dependencies: importedData.dependencies || [],
          assetCategories: importedData.assetCategories || [],
          timelineSettings: data.timelineSettings, // Keep existing settings
        });
        alert('Data imported successfully!');
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
    onImport({
      ...data,
      timelineSettings: localSettings,
    });
    setShowSettings(false);
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
                onChange={(e) => setLocalSettings(prev => ({ ...prev, startYear: parseInt(e.target.value) || new Date().getFullYear() }))}
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
                onChange={(e) => setLocalSettings(prev => ({ ...prev, yearsToShow: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
    </div>
  );
}
