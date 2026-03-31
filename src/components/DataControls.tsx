import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, FileText, AlertCircle, Check, TriangleAlert, ImageDown } from 'lucide-react';

interface SchemaIssue {
  entity: string;
  issue: string;
  severity: 'error' | 'warning';
}

const REQUIRED_FIELDS: Record<string, string[]> = {
  initiatives: ['id', 'name', 'programmeId', 'assetId', 'startDate', 'endDate', 'capex', 'opex'],
  assets: ['id', 'name', 'categoryId'],
  programmes: ['id', 'name', 'color'],
  strategies: ['id', 'name', 'color'],
  milestones: ['id', 'assetId', 'date', 'name', 'type'],
  dependencies: ['id', 'sourceId', 'targetId', 'type'],
  assetCategories: ['id', 'name'],
};

function validateImportSchema(data: Record<string, unknown[]>): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  for (const [entityType, fields] of Object.entries(REQUIRED_FIELDS)) {
    const records = data[entityType] as Record<string, unknown>[] | undefined;
    if (!records?.length) continue;
    for (const field of fields) {
      const missingCount = records.filter(r => r[field] === undefined || r[field] === null || r[field] === '').length;
      if (missingCount > 0) {
        issues.push({
          entity: entityType,
          issue: `"${field}" missing in ${missingCount} record${missingCount > 1 ? 's' : ''}`,
          severity: field === 'id' || field === 'name' ? 'error' : 'warning',
        });
      }
    }
  }
  return issues;
}
import { exportToExcel, importFromExcel } from '../lib/excel';
import { exportToPDF, exportToSVG } from '../lib/pdf';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings, Resource } from '../types';

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
    resources: Resource[];
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
    resources: Resource[];
  }) => void;
  timelineId?: string; // ID of the element to capture for PDF
}

export function DataControls({ data, onImport, timelineId }: DataControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreviewData, setImportPreviewData] = useState<Partial<typeof data> | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSchemaIssues, setImportSchemaIssues] = useState<SchemaIssue[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportExcel = () => {
    exportToExcel(data);
  };

  const handleExportPDF = () => {
    if (timelineId) {
      exportToPDF(timelineId, `it-roadmap-${new Date().toISOString().split('T')[0]}.pdf`)
        .catch(() => showNotification('error', 'Failed to export PDF. Please try again.'));
    } else {
      showNotification('error', 'Switch to Visualiser view to export PDF.');
    }
  };

  const handleExportSVG = () => {
    if (timelineId) {
      exportToSVG(timelineId, `it-roadmap-${new Date().toISOString().split('T')[0]}.svg`)
        .catch(() => showNotification('error', 'Failed to export SVG. Please try again.'));
    } else {
      showNotification('error', 'Switch to Visualiser view to export SVG.');
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
      const hasData = Object.values(importedData).some(arr => Array.isArray(arr) && arr.length > 0);
      if (hasData) {
        setImportSchemaIssues(validateImportSchema(importedData as Record<string, unknown[]>));
        setImportPreviewData(importedData);
        setShowImportModal(true);
      } else {
        showNotification('error', 'No valid data found in the Excel file.');
      }
    } catch (error) {
      console.error('Import failed:', error);
      showNotification('error', 'Failed to import Excel file. Please check the format.');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      resources: importPreviewData.resources || [],
    });
    setShowImportModal(false);
    setImportPreviewData(null);
    setImportSchemaIssues([]);
    showNotification('success', 'Data overwritten successfully.');
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
      resources: mergeArrays(data.resources, importPreviewData.resources),
    });
    setShowImportModal(false);
    setImportPreviewData(null);
    setImportSchemaIssues([]);
    showNotification('success', 'Data merged successfully.');
  };

  return (
    <div className="flex items-center gap-1.5 relative">
      <button
        onClick={handleExportPDF}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        title="Download roadmap as PDF"
        disabled={!timelineId}
      >
        <FileText size={14} />
        PDF
      </button>

      <button
        data-testid="export-svg"
        onClick={handleExportSVG}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        title="Download roadmap as SVG"
        disabled={!timelineId}
      >
        <ImageDown size={14} />
        SVG
      </button>

      <button
        data-testid="export-excel"
        onClick={handleExportExcel}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        title="Download current data as Excel"
      >
        <FileSpreadsheet size={14} />
        Export
      </button>

      <button
        onClick={handleImportClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        title="Upload Excel file to update data"
      >
        <Upload size={14} />
        Import
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {notification && (
        <div
          data-testid={notification.type === 'success' ? 'import-success-notification' : 'import-error-notification'}
          className={`absolute top-full right-0 mt-2 px-3 py-2 rounded-lg text-xs font-medium shadow-md z-50 whitespace-nowrap ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notification.message}
        </div>
      )}

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

            <ul className="space-y-2 mb-4 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {importPreviewData.initiatives && <li><span className="font-semibold">{importPreviewData.initiatives.length}</span> Initiatives</li>}
              {importPreviewData.assets && <li><span className="font-semibold">{importPreviewData.assets.length}</span> Assets</li>}
              {importPreviewData.programmes && <li><span className="font-semibold">{importPreviewData.programmes.length}</span> Programmes</li>}
              {importPreviewData.strategies && <li><span className="font-semibold">{importPreviewData.strategies.length}</span> Strategies</li>}
              {importPreviewData.milestones && <li><span className="font-semibold">{importPreviewData.milestones.length}</span> Milestones</li>}
              {importPreviewData.dependencies && <li><span className="font-semibold">{importPreviewData.dependencies.length}</span> Dependencies</li>}
              {importPreviewData.assetCategories && <li><span className="font-semibold">{importPreviewData.assetCategories.length}</span> Categories</li>}
            </ul>

            {importSchemaIssues.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 text-amber-700">
                  <TriangleAlert size={16} />
                  <span className="text-sm font-semibold">Schema warnings — this file may be from an older version</span>
                </div>
                <ul className="space-y-1 text-xs bg-amber-50 border border-amber-200 rounded-lg p-3">
                  {importSchemaIssues.map((issue, i) => (
                    <li key={i} className={`flex items-start gap-1.5 ${issue.severity === 'error' ? 'text-rose-700' : 'text-amber-800'}`}>
                      <span className="font-semibold capitalize shrink-0">{issue.entity}:</span>
                      <span>{issue.issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                onClick={() => { setShowImportModal(false); setImportPreviewData(null); setImportSchemaIssues([]); }}
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
