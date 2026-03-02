import React, { useRef } from 'react';
import { Download, Upload, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../lib/excel';
import { exportToPDF } from '../lib/pdf';
import { Asset, Initiative, Milestone, Programme } from '../types';

interface DataControlsProps {
  data: {
    assets: Asset[];
    initiatives: Initiative[];
    milestones: Milestone[];
    programmes: Programme[];
  };
  onImport: (data: {
    assets: Asset[];
    initiatives: Initiative[];
    milestones: Milestone[];
    programmes: Programme[];
  }) => void;
  timelineId?: string; // ID of the element to capture for PDF
}

export function DataControls({ data, onImport, timelineId }: DataControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex items-center gap-2">
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
