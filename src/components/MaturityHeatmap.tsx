import React from 'react';
import { Asset, AssetCategory } from '../types';

interface MaturityHeatmapProps {
  assets: Asset[];
  assetCategories: AssetCategory[];
  onTileClick: (asset: Asset) => void;
}

function maturityColor(level?: number | string): string {
  const colors: Record<number, string> = {
    1: '#ef4444',
    2: '#f97316',
    3: '#f59e0b',
    4: '#84cc16',
    5: '#22c55e',
  };
  if (level === undefined || level === '') return '#e2e8f0';
  return colors[Number(level)] ?? '#e2e8f0';
}

const LEGEND = [
  { level: 1, label: '1 Emergent' },
  { level: 2, label: '2 Developing' },
  { level: 3, label: '3 Defined' },
  { level: 4, label: '4 Managed' },
  { level: 5, label: '5 Optimised' },
  { level: undefined, label: 'Unrated' },
];

export function MaturityHeatmap({ assets, assetCategories, onTileClick }: MaturityHeatmapProps) {
  const sortedCategories = [...assetCategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div data-testid="report-view-maturity-heatmap" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 mb-3">Maturity Heatmap</h1>
        <div className="flex flex-wrap gap-3">
          {LEGEND.map(({ level, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="inline-block w-4 h-4 rounded-sm flex-shrink-0"
                style={{ backgroundColor: maturityColor(level) }}
              />
              <span className="text-xs text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {sortedCategories.map(category => {
        const categoryAssets = assets.filter(a => a.categoryId === category.id);
        return (
          <div
            key={category.id}
            data-testid={`heatmap-category-${category.id}`}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{category.name}</h2>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {categoryAssets.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No assets in this category.</p>
              ) : (
                categoryAssets.map(asset => (
                  <button
                    key={asset.id}
                    data-testid={`heatmap-tile-${asset.id}`}
                    data-maturity={asset.maturity !== undefined && asset.maturity !== ('' as unknown) ? String(asset.maturity) : undefined}
                    onClick={() => onTileClick(asset)}
                    style={{ backgroundColor: maturityColor(asset.maturity), width: 120, minHeight: 80 }}
                    className="flex items-center justify-center rounded-lg p-2 text-center hover:opacity-90 transition-opacity cursor-pointer border border-black/10 shadow-sm"
                  >
                    <span className="text-xs font-medium text-slate-800 leading-tight line-clamp-3 break-words">{asset.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
