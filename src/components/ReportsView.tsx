import React, { useState, useEffect } from 'react';
import { Asset, Initiative, Dependency, Version } from '../types';
import { getAllVersions } from '../lib/db';
import { computeDiff, DiffResult } from '../lib/diff';

interface ReportsViewProps {
  assets: Asset[];
  initiatives: Initiative[];
  dependencies: Dependency[];
  currentData: Version['data'];
}

function depSentence(dep: Dependency, src: Initiative, tgt: Initiative): string {
  if (dep.type === 'blocks') return `${src.name} must finish before ${tgt.name} can start.`;
  if (dep.type === 'requires') return `${src.name} requires ${tgt.name} to finish first.`;
  return `${src.name} and ${tgt.name} are related.`;
}

export function ReportsView({ assets, initiatives, dependencies, currentData }: ReportsViewProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [versionsError, setVersionsError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('oneplan-test-versions-fail') === 'true') {
      setVersionsError('Failed to load saved versions. Please try reloading.');
      return;
    }
    getAllVersions().then(loaded => {
      const sorted = loaded.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setVersions(sorted);
    }).catch(() => {
      setVersionsError('Failed to load saved versions. Please try reloading.');
    });
  }, []);

  const handleRunDiff = () => {
    const base = versions.find(v => v.id === selectedVersionId);
    if (!base) return;
    setDiffResult(computeDiff(base, currentData));
  };

  return (
    <div data-testid="reports-view" className="h-full overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* History Differences */}
        <div data-testid="report-history-diff" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">History Differences</h2>
          </div>
          <div className="p-4">
            {versionsError ? (
              <p data-testid="versions-load-error" className="text-sm text-red-500">{versionsError}</p>
            ) : versions.length === 0 ? (
              <p className="text-sm text-slate-400">No saved versions</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <select
                    data-testid="version-select"
                    value={selectedVersionId}
                    onChange={e => { setSelectedVersionId(e.target.value); setDiffResult(null); }}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a version…</option>
                    {versions.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleRunDiff}
                    disabled={!selectedVersionId}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40"
                  >
                    Run Difference Report
                  </button>
                </div>

                {diffResult && (
                  <div data-testid="diff-result" className="mt-4 space-y-4">
                    {!diffResult.hasChanges ? (
                      <p className="text-sm text-slate-500 text-center py-4">No changes detected — this version matches the current state.</p>
                    ) : (
                      <>
                        {/* Initiatives */}
                        {(diffResult.initiatives.added.length > 0 || diffResult.initiatives.removed.length > 0 || diffResult.initiatives.modified.length > 0) && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Initiatives</h4>
                            <div className="space-y-2">
                              {diffResult.initiatives.added.map((name, i) => (
                                <div key={`add-${i}`} className="flex gap-2 items-start text-sm p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase">Added</span>
                                  <span className="text-emerald-900">{name}</span>
                                </div>
                              ))}
                              {diffResult.initiatives.removed.map((name, i) => (
                                <div key={`rem-${i}`} className="flex gap-2 items-start text-sm p-2 bg-red-50 rounded-lg border border-red-100">
                                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Removed</span>
                                  <span className="text-red-900 line-through">{name}</span>
                                </div>
                              ))}
                              {diffResult.initiatives.modified.map((item, i) => (
                                <div key={`mod-${i}`} className="p-2 bg-amber-50 rounded-lg border border-amber-100 text-sm">
                                  <div className="flex gap-2 items-start mb-1">
                                    <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase">Changed</span>
                                    <span className="font-medium text-amber-900">{item.name}</span>
                                  </div>
                                  <ul className="ml-14 space-y-0.5">
                                    {item.changes.map((c, ci) => (
                                      <li key={ci} className="text-xs text-amber-700">• {c}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dependencies */}
                        {(diffResult.dependencies.added.length > 0 || diffResult.dependencies.removed.length > 0 || diffResult.dependencies.modified.length > 0) && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Relationships</h4>
                            <div className="space-y-2">
                              {diffResult.dependencies.added.map((name, i) => (
                                <div key={i} className="flex gap-2 items-start text-sm p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase">Added</span>
                                  <span className="text-emerald-900">{name}</span>
                                </div>
                              ))}
                              {diffResult.dependencies.removed.map((name, i) => (
                                <div key={i} className="flex gap-2 items-start text-sm p-2 bg-red-50 rounded-lg border border-red-100">
                                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Removed</span>
                                  <span className="text-red-900 line-through">{name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Milestones */}
                        {(diffResult.milestones.added.length > 0 || diffResult.milestones.removed.length > 0 || diffResult.milestones.modified.length > 0) && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Milestones</h4>
                            <div className="space-y-2">
                              {diffResult.milestones.added.map((name, i) => (
                                <div key={i} className="flex gap-2 items-start text-sm p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase">Added</span>
                                  <span className="text-emerald-900">{name}</span>
                                </div>
                              ))}
                              {diffResult.milestones.removed.map((name, i) => (
                                <div key={i} className="flex gap-2 items-start text-sm p-2 bg-red-50 rounded-lg border border-red-100">
                                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Removed</span>
                                  <span className="text-red-900 line-through">{name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Initiatives & Dependencies */}
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
    </div>
  );
}
