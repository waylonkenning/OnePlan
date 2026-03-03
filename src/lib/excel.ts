import * as XLSX from 'xlsx';
import { Asset, Initiative, Milestone, Programme, Strategy } from '../types';

interface AppData {
  assets: Asset[];
  initiatives: Initiative[];
  milestones: Milestone[];
  programmes: Programme[];
  strategies: Strategy[];
}

export const exportToExcel = (data: AppData) => {
  const wb = XLSX.utils.book_new();

  // 1. Initiatives
  const initiativesWs = XLSX.utils.json_to_sheet(data.initiatives);
  XLSX.utils.book_append_sheet(wb, initiativesWs, 'Initiatives');

  // 2. Assets
  const assetsWs = XLSX.utils.json_to_sheet(data.assets);
  XLSX.utils.book_append_sheet(wb, assetsWs, 'Assets');

  // 3. Programmes
  const programmesWs = XLSX.utils.json_to_sheet(data.programmes);
  XLSX.utils.book_append_sheet(wb, programmesWs, 'Programmes');

  // 4. Strategies
  const strategiesWs = XLSX.utils.json_to_sheet(data.strategies || []);
  XLSX.utils.book_append_sheet(wb, strategiesWs, 'Strategies');

  // 5. Milestones
  const milestonesWs = XLSX.utils.json_to_sheet(data.milestones);
  XLSX.utils.book_append_sheet(wb, milestonesWs, 'Milestones');

  // Write file
  XLSX.writeFile(wb, `it-roadmap-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const importFromExcel = async (file: File): Promise<Partial<AppData>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        
        const result: Partial<AppData> = {};

        // Helper to safely get sheet data
        const getSheetData = <T>(name: string): T[] => {
          const ws = wb.Sheets[name];
          if (!ws) return [];
          return XLSX.utils.sheet_to_json(ws);
        };

        result.initiatives = getSheetData<Initiative>('Initiatives').map(init => ({
          ...init,
          budget: Number(init.budget) || 0
        }));
        result.assets = getSheetData<Asset>('Assets');
        result.programmes = getSheetData<Programme>('Programmes');
        result.strategies = getSheetData<Strategy>('Strategies');
        result.milestones = getSheetData<Milestone>('Milestones');

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
