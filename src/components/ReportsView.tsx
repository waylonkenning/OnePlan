import React from 'react';
import { Asset, Initiative, Dependency } from '../types';

interface ReportsViewProps {
  assets: Asset[];
  initiatives: Initiative[];
  dependencies: Dependency[];
}

function depSentence(dep: Dependency, src: Initiative, tgt: Initiative): string {
  if (dep.type === 'blocks') return `${src.name} blocks ${tgt.name} — must finish before it can start.`;
  if (dep.type === 'requires') return `${src.name} requires ${tgt.name} to be complete first.`;
  return `${src.name} and ${tgt.name} have a general connection.`;
}

export function ReportsView({ assets, initiatives, dependencies }: ReportsViewProps) {
  return (
    <div data-testid="reports-view" className="h-full overflow-y-auto p-6 bg-slate-50">
      <div data-testid="report-dependencies" className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-base font-semibold text-slate-800">Initiatives &amp; Dependencies</h2>

        {assets.map(asset => {
          const assetInitiatives = initiatives.filter(i => i.assetId === asset.id && !i.isPlaceholder);
          if (assetInitiatives.length === 0) return null;

          return (
            <section key={asset.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">{asset.name}</h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {assetInitiatives.map(init => {
                  const related = dependencies.filter(
                    d => d.sourceId === init.id || d.targetId === init.id
                  );
                  return (
                    <li key={init.id} className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800 mb-1">{init.name}</p>
                      {related.length === 0 ? (
                        <p className="text-xs text-slate-400">No dependencies</p>
                      ) : (
                        <ul className="space-y-0.5">
                          {related.map(dep => {
                            const src = initiatives.find(i => i.id === dep.sourceId);
                            const tgt = initiatives.find(i => i.id === dep.targetId);
                            if (!src || !tgt) return null;
                            return (
                              <li key={dep.id} className="text-xs text-slate-600">
                                {depSentence(dep, src, tgt)}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
