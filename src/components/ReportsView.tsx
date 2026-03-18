import React, { useState, useEffect } from 'react';
import { Asset, Initiative, Dependency, Milestone, Version, Programme, Strategy, AssetCategory, Resource } from '../types';
import { getAllVersions } from '../lib/db';
import { computeDiff, DiffResult } from '../lib/diff';

interface ReportsViewProps {
  assets: Asset[];
  initiatives: Initiative[];
  milestones: Milestone[];
  dependencies: Dependency[];
  currentData: Version['data'];
  programmes: Programme[];
  strategies: Strategy[];
  assetCategories: AssetCategory[];
  resources?: Resource[];
}

function depSentence(dep: Dependency, src: Initiative, tgt: Initiative, perspectiveId: string): string {
  const isSource = src.id === perspectiveId;
  if (dep.type === 'blocks') {
    if (isSource) return `Blocking: ${src.name} must finish before ${tgt.name} can start.`;
    return `Blocked: ${tgt.name} can't start until ${src.name} has finished.`;
  }
  if (dep.type === 'requires') {
    if (isSource) return `Required: ${src.name} requires ${tgt.name} to start first.`;
    return `Required by: ${tgt.name} must start first before ${src.name}.`;
  }
  return `${src.name} and ${tgt.name} are related.`;
}

export function ReportsView({ assets, initiatives, milestones, dependencies, currentData, programmes, strategies, assetCategories, resources = [] }: ReportsViewProps) {
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

        {/* Budget Summary */}
        {(() => {
          const realInitiatives = initiatives.filter(i => !i.isPlaceholder);
          const grandTotal = realInitiatives.reduce((sum, i) => sum + (i.budget || 0), 0);

          const fmt = (n: number) =>
            n >= 1_000_000
              ? `$${(n / 1_000_000).toFixed(1)}m`
              : n >= 1_000
              ? `$${Math.round(n / 1_000)}k`
              : `$${n.toLocaleString()}`;

          const byProgramme = programmes
            .map(p => ({
              id: p.id,
              name: p.name,
              color: p.color,
              total: realInitiatives.filter(i => i.programmeId === p.id).reduce((s, i) => s + (i.budget || 0), 0),
            }))
            .filter(r => r.total > 0)
            .sort((a, b) => b.total - a.total);

          const byStrategy = strategies
            .map(s => ({
              id: s.id,
              name: s.name,
              color: s.color,
              total: realInitiatives.filter(i => i.strategyId === s.id).reduce((sum, i) => sum + (i.budget || 0), 0),
            }))
            .filter(r => r.total > 0)
            .sort((a, b) => b.total - a.total);

          const byCategory = assetCategories
            .map(c => {
              const catAssets = assets.filter(a => a.categoryId === c.id).map(a => a.id);
              return {
                id: c.id,
                name: c.name,
                total: realInitiatives.filter(i => catAssets.includes(i.assetId)).reduce((s, i) => s + (i.budget || 0), 0),
              };
            })
            .filter(r => r.total > 0)
            .sort((a, b) => b.total - a.total);

          const BudgetBar = ({ total, max, color }: { total: number; max: number; color?: string }) => (
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${color ?? 'bg-blue-500'}`}
                style={{ width: `${max > 0 ? Math.round((total / max) * 100) : 0}%` }}
              />
            </div>
          );

          const Section = ({ testId, title, rows, max }: { testId: string; title: string; rows: { id: string; name: string; total: number; color?: string }[]; max: number }) => (
            <div data-testid={testId} className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
              {rows.map(row => (
                <div key={row.id} data-testid={`budget-row-${testId.replace('budget-by-', '')}-${row.id}`} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 w-44 truncate flex-shrink-0">{row.name}</span>
                  <BudgetBar total={row.total} max={max} color={row.color} />
                  <span className="text-sm font-semibold text-slate-800 w-16 text-right flex-shrink-0">{fmt(row.total)}</span>
                </div>
              ))}
            </div>
          );

          const maxProg = byProgramme[0]?.total ?? 0;
          const maxStrat = byStrategy[0]?.total ?? 0;
          const maxCat = byCategory[0]?.total ?? 0;

          return (
            <div data-testid="report-budget-summary" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-800">Budget Summary</h2>
                <span data-testid="budget-grand-total" className="text-sm font-bold text-slate-700">{fmt(grandTotal)} total</span>
              </div>
              <div className="p-4 space-y-6">
                <Section testId="budget-by-programme" title="By Programme" rows={byProgramme} max={maxProg} />
                <Section testId="budget-by-strategy" title="By Strategy" rows={byStrategy} max={maxStrat} />
                <Section testId="budget-by-category" title="By Category" rows={byCategory} max={maxCat} />
              </div>
            </div>
          );
        })()}

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
                                  {depSentence(dep, src, tgt, init.id)}
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

        {/* Capacity Report */}
        {(() => {
          const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' });

          const realInitiatives = initiatives.filter(i => !i.isPlaceholder);

          const assignmentsFor = (resourceId: string) =>
            realInitiatives.filter(i =>
              i.ownerId === resourceId || (i.resourceIds ?? []).includes(resourceId)
            );

          return (
            <div data-testid="capacity-report" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800">Capacity Report</h2>
              </div>
              <div className="p-4">
                {resources.length === 0 ? (
                  <p data-testid="capacity-no-resources" className="text-sm text-slate-400">
                    No resources defined. Add resources in Data Manager → Resources to track capacity.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {resources.map(resource => {
                      const assigned = assignmentsFor(resource.id);
                      return (
                        <div
                          key={resource.id}
                          data-testid="capacity-resource-row"
                          className="border border-slate-100 rounded-lg overflow-hidden"
                        >
                          <div
                            data-testid={`capacity-resource-row-${resource.id}`}
                            className="px-4 py-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="text-sm font-semibold text-slate-800">{resource.name}</span>
                                {resource.role && (
                                  <span className="ml-2 text-xs text-slate-400">({resource.role})</span>
                                )}
                              </div>
                              <span
                                data-testid="capacity-assignment-count"
                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  assigned.length === 0
                                    ? 'bg-slate-100 text-slate-400'
                                    : assigned.length >= 3
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {assigned.length}
                              </span>
                            </div>
                            {assigned.length === 0 ? (
                              <p data-testid="capacity-no-assignments" className="text-xs text-slate-400 italic">No initiatives assigned</p>
                            ) : (
                              <ul className="space-y-1">
                                {assigned.map(init => (
                                  <li key={init.id} className="flex items-center gap-2 text-xs text-slate-600">
                                    {init.ownerId === resource.id && (
                                      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1 rounded uppercase">Owner</span>
                                    )}
                                    <span className="font-medium text-slate-700">{init.name}</span>
                                    <span className="text-slate-400">{fmt(init.startDate)} → {fmt(init.endDate)}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Milestone Dependencies */}
        {(() => {
          const milestoneDeps = dependencies.filter(d => d.sourceType === 'milestone');
          if (milestoneDeps.length === 0) return null;
          return (
            <div data-testid="report-milestone-dependencies" className="max-w-3xl mx-auto space-y-4 mt-8">
              <h2 className="text-base font-semibold text-slate-800">Milestone Dependencies</h2>
              <ul className="space-y-2">
                {milestoneDeps.map(dep => {
                  const mile = milestones.find(m => m.id === dep.sourceId);
                  const tgt = initiatives.find(i => i.id === dep.targetId);
                  if (!mile || !tgt) return null;
                  return (
                    <li key={dep.id} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="font-semibold text-slate-700">{mile.name}</span>
                      <span>→</span>
                      <span>{tgt.name} requires this milestone to be reached first.</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
