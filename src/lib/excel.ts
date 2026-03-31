import * as XLSX from 'xlsx';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, DtsAdoptionStatus, TimelineSettings } from '../types';

interface AppData {
  assets: Asset[];
  initiatives: Initiative[];
  milestones: Milestone[];
  programmes: Programme[];
  strategies: Strategy[];
  dependencies: Dependency[];
  assetCategories: AssetCategory[];
  timelineSettings?: TimelineSettings;
}

const DTS_ADOPTION_STATUS_LABEL: Record<DtsAdoptionStatus, string> = {
  'not-started':    'Not Started',
  'scoping':        'Scoping',
  'in-delivery':    'In Delivery',
  'adopted':        'Adopted',
  'decommissioning':'Decommissioning Incumbent',
  'not-applicable': 'Not Applicable',
};

export const exportToExcel = (data: AppData) => {
  const wb = XLSX.utils.book_new();

  // 1. Initiatives
  const initiativesWs = XLSX.utils.json_to_sheet(data.initiatives);
  XLSX.utils.book_append_sheet(wb, initiativesWs, 'Initiatives');

  // 2. Assets
  const assetsWs = XLSX.utils.json_to_sheet(data.assets);
  XLSX.utils.book_append_sheet(wb, assetsWs, 'Assets');

  // 3. Asset Categories
  const categoriesWs = XLSX.utils.json_to_sheet(data.assetCategories || []);
  XLSX.utils.book_append_sheet(wb, categoriesWs, 'AssetCategories');

  // 4. Programmes
  const programmesWs = XLSX.utils.json_to_sheet(data.programmes);
  XLSX.utils.book_append_sheet(wb, programmesWs, 'Programmes');

  // 5. Strategies
  const strategiesWs = XLSX.utils.json_to_sheet(data.strategies || []);
  XLSX.utils.book_append_sheet(wb, strategiesWs, 'Strategies');

  // 6. Milestones
  const milestonesWs = XLSX.utils.json_to_sheet(data.milestones);
  XLSX.utils.book_append_sheet(wb, milestonesWs, 'Milestones');

  // 7. Dependencies
  const dependenciesWs = XLSX.utils.json_to_sheet(data.dependencies || []);
  XLSX.utils.book_append_sheet(wb, dependenciesWs, 'Dependencies');

  // 8. DTS Summary — only for workspaces that have DTS assets (alias starts with "DTS.")
  const dtsAssets = data.assets.filter(a => a.alias?.startsWith('DTS.'));
  if (dtsAssets.length > 0) {
    const activeInitiatives = data.initiatives.filter(i => !i.isPlaceholder);
    const dtsSummaryRows = dtsAssets
      .sort((a, b) => {
        const catA = data.assetCategories.find(c => c.id === a.categoryId);
        const catB = data.assetCategories.find(c => c.id === b.categoryId);
        const orderA = catA?.order ?? 999;
        const orderB = catB?.order ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.alias ?? '').localeCompare(b.alias ?? '');
      })
      .map(asset => {
        const category = data.assetCategories.find(c => c.id === asset.categoryId);
        const assetInits = activeInitiatives.filter(i => i.assetId === asset.id);
        const totalCapex = assetInits.reduce((sum, i) => sum + (i.capex || 0), 0);
        const totalOpex = assetInits.reduce((sum, i) => sum + (i.opex || 0), 0);
        return {
          'Layer': category?.name ?? '',
          'Asset Name': asset.name,
          'Alias': asset.alias ?? '',
          'Adoption Status': asset.dtsAdoptionStatus
            ? DTS_ADOPTION_STATUS_LABEL[asset.dtsAdoptionStatus] ?? asset.dtsAdoptionStatus
            : '',
          'Initiative Count': assetInits.length,
          'Total CapEx ($)': totalCapex,
          'Total OpEx ($)': totalOpex,
        };
      });

    const clusterName = data.timelineSettings?.clusterName;
    let dtsSummaryWs: XLSX.WorkSheet;
    if (clusterName) {
      // Add cluster name as a metadata header row, then a blank row, then the data
      dtsSummaryWs = XLSX.utils.aoa_to_sheet([
        ['Cluster', clusterName],
        [],
        ['Layer', 'Asset Name', 'Alias', 'Adoption Status', 'Initiative Count', 'Total CapEx ($)', 'Total OpEx ($)'],
        ...dtsSummaryRows.map(r => [r['Layer'], r['Asset Name'], r['Alias'], r['Adoption Status'], r['Initiative Count'], r['Total CapEx ($)'], r['Total OpEx ($)']]),
      ]);
    } else {
      dtsSummaryWs = XLSX.utils.json_to_sheet(dtsSummaryRows);
    }
    XLSX.utils.book_append_sheet(wb, dtsSummaryWs, 'DTS Summary');
  }

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

        result.initiatives = getSheetData<Initiative>('Initiatives').map((init: any) => ({
          ...init,
          capex: Number(init.capex) || Number(init.budget) || 0,  // backward compat: fall back to budget
          opex: Number(init.opex) || 0,
        }));
        result.assets = getSheetData<Asset>('Assets');
        result.assetCategories = getSheetData<AssetCategory>('AssetCategories');
        result.programmes = getSheetData<Programme>('Programmes');
        result.strategies = getSheetData<Strategy>('Strategies');
        result.milestones = getSheetData<Milestone>('Milestones');
        result.dependencies = getSheetData<Dependency>('Dependencies');

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
