import React, { useState } from 'react';
import { Asset, Initiative, Programme, Strategy, Dependency, AssetCategory, TimelineSettings } from '../types';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { InitiativePanel } from './InitiativePanel';

interface MobileCardViewProps {
  assets: Asset[];
  initiatives: Initiative[];
  programmes: Programme[];
  strategies: Strategy[];
  dependencies: Dependency[];
  assetCategories: AssetCategory[];
  settings: TimelineSettings;
  onSaveInitiative: (initiative: Initiative) => void;
  onDeleteInitiative?: (initiative: Initiative) => void;
}

type BucketMode = 'timeline' | 'quarter' | 'year' | 'programme' | 'strategy';

// ── Date helpers ──────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' });
}

function getTimelineBucket(initiative: Initiative): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(initiative.startDate);
  const end = new Date(initiative.endDate);
  const sixtyDays = new Date(today);
  sixtyDays.setDate(today.getDate() + 60);

  if (end < today) return 'Completed';
  if (start <= today && end >= today) return 'Now';
  if (start <= sixtyDays) return 'Starting soon';
  return 'Upcoming';
}

const TIMELINE_BUCKET_ORDER = ['Now', 'Starting soon', 'Upcoming', 'Completed'];

function getQuarterBucket(initiative: Initiative): string {
  const d = new Date(initiative.startDate);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
}

function getYearBucket(initiative: Initiative): string {
  return String(new Date(initiative.startDate).getFullYear());
}

function bucketInitiatives(
  initiatives: Initiative[],
  mode: BucketMode,
  programmes: Programme[],
  strategies: Strategy[],
): Map<string, Initiative[]> {
  const map = new Map<string, Initiative[]>();

  const add = (key: string, init: Initiative) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(init);
  };

  for (const init of initiatives) {
    let key: string;
    if (mode === 'timeline') {
      key = getTimelineBucket(init);
    } else if (mode === 'quarter') {
      key = getQuarterBucket(init);
    } else if (mode === 'year') {
      key = getYearBucket(init);
    } else if (mode === 'programme') {
      const prog = programmes.find(p => p.id === init.programmeId);
      key = prog?.name ?? 'No programme';
    } else {
      const strat = strategies.find(s => s.id === init.strategyId);
      key = strat?.name ?? 'No strategy';
    }
    add(key, init);
  }

  // Sort initiatives within each bucket by start date
  for (const [, inits] of map) {
    inits.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  // Return buckets in a meaningful order
  if (mode === 'timeline') {
    const ordered = new Map<string, Initiative[]>();
    for (const label of TIMELINE_BUCKET_ORDER) {
      if (map.has(label)) ordered.set(label, map.get(label)!);
    }
    return ordered;
  }

  // For quarter/year: sort keys chronologically
  if (mode === 'quarter' || mode === 'year') {
    return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }

  return map;
}

// ── Conflict detection ────────────────────────────────────────────────────────

function hasConflicts(assetInitiatives: Initiative[]): boolean {
  for (let i = 0; i < assetInitiatives.length; i++) {
    for (let j = i + 1; j < assetInitiatives.length; j++) {
      const a = assetInitiatives[i];
      const b = assetInitiatives[j];
      if (a.startDate < b.endDate && a.endDate > b.startDate) return true;
    }
  }
  return false;
}

function conflictCount(assetInitiatives: Initiative[]): number {
  let count = 0;
  for (let i = 0; i < assetInitiatives.length; i++) {
    for (let j = i + 1; j < assetInitiatives.length; j++) {
      const a = assetInitiatives[i];
      const b = assetInitiatives[j];
      if (a.startDate < b.endDate && a.endDate > b.startDate) count++;
    }
  }
  return count;
}

// ── Programme colour dot ──────────────────────────────────────────────────────

function ProgrammeDot({ colorClass }: { colorClass: string }) {
  // colorClass is a Tailwind bg-* class e.g. "bg-blue-500"
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorClass}`} />;
}

// ── Initiative row ────────────────────────────────────────────────────────────

function InitiativeRow({
  initiative,
  programmes,
  onClick,
}: {
  initiative: Initiative;
  programmes: Programme[];
  onClick: () => void;
}) {
  const prog = programmes.find(p => p.id === initiative.programmeId);
  const dateRange = `${formatDate(initiative.startDate)} → ${formatDate(initiative.endDate)}`;

  return (
    <button
      data-testid={`initiative-row-${initiative.id}`}
      onClick={onClick}
      className="w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-start gap-3"
    >
      {prog && <div className={`w-1 self-stretch rounded-full flex-shrink-0 mt-0.5 ${prog.color}`} />}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800 truncate">{initiative.name}</div>
        <div className="text-xs text-slate-500 mt-0.5">{dateRange}</div>
        {prog && <div className="text-xs text-slate-400 mt-0.5">{prog.name}</div>}
      </div>
    </button>
  );
}

// ── Bucket section ────────────────────────────────────────────────────────────

function BucketSection({
  label,
  initiatives,
  programmes,
  onSelectInitiative,
}: {
  label: string;
  initiatives: Initiative[];
  programmes: Programme[];
  onSelectInitiative: (i: Initiative) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        className="w-full flex items-center gap-2 px-4 py-1.5 bg-slate-50 border-b border-slate-100 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        {expanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
        <span data-testid={`bucket-label-${label}`} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <span className="ml-auto text-xs text-slate-400">{initiatives.length}</span>
      </button>
      {expanded && initiatives.map(init => (
        <InitiativeRow
          key={init.id}
          initiative={init}
          programmes={programmes}
          onClick={() => onSelectInitiative(init)}
        />
      ))}
    </div>
  );
}

// ── Asset card ────────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  initiatives,
  programmes,
  strategies,
  dependencies,
  bucketMode,
  onSelectInitiative,
}: {
  asset: Asset;
  initiatives: Initiative[];
  programmes: Programme[];
  strategies: Strategy[];
  dependencies: Dependency[];
  bucketMode: BucketMode;
  onSelectInitiative: (i: Initiative) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const conflicts = conflictCount(initiatives);
  const activeCount = initiatives.filter(i => {
    const today = new Date();
    return new Date(i.startDate) <= today && new Date(i.endDate) >= today;
  }).length;

  const buckets = bucketInitiatives(initiatives, bucketMode, programmes, strategies);

  // Determine a representative colour: first initiative's programme colour
  const firstProg = initiatives.length > 0
    ? programmes.find(p => p.id === initiatives[0].programmeId)
    : undefined;

  return (
    <div data-testid={`asset-card-${asset.id}`} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 text-left"
        onClick={() => setCollapsed(c => !c)}
      >
        {firstProg
          ? <ProgrammeDot colorClass={firstProg.color} />
          : <span className="w-2.5 h-2.5 rounded-full bg-slate-300 flex-shrink-0" />
        }
        <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{asset.name}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {conflicts > 0 && (
            <span
              data-testid={`conflict-badge-${asset.id}`}
              className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5"
            >
              <AlertTriangle size={10} />
              {conflicts} conflict{conflicts !== 1 ? 's' : ''}
            </span>
          )}
          {activeCount > 0 && (
            <span className="text-xs text-slate-400">{activeCount} active</span>
          )}
          {collapsed
            ? <ChevronRight size={14} className="text-slate-400" />
            : <ChevronDown size={14} className="text-slate-400" />
          }
        </div>
      </button>

      {/* Card body */}
      {!collapsed && (
        initiatives.length === 0 ? (
          <div data-testid="card-no-initiatives" className="px-4 py-3 text-sm text-slate-400 italic">
            No initiatives
          </div>
        ) : (
          <div>
            {[...buckets.entries()].map(([label, inits]) => (
              <BucketSection
                key={label}
                label={label}
                initiatives={inits}
                programmes={programmes}
                onSelectInitiative={onSelectInitiative}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MobileCardView({
  assets,
  initiatives,
  programmes,
  strategies,
  dependencies,
  assetCategories,
  settings,
  onSaveInitiative,
  onDeleteInitiative,
}: MobileCardViewProps) {
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const bucketMode: BucketMode = settings.mobileBucketMode ?? 'timeline';

  // Group assets by category, preserving category order
  const sortedCategories = [...assetCategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const assetsByCategory = sortedCategories.map(cat => ({
    category: cat,
    assets: assets.filter(a => a.categoryId === cat.id),
  })).filter(g => g.assets.length > 0);

  // Assets with no category
  const uncategorised = assets.filter(a => !assetCategories.find(c => c.id === a.categoryId));

  const handleSelectInitiative = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
    setIsPanelOpen(true);
  };

  const handleSave = (initiative: Initiative) => {
    onSaveInitiative(initiative);
    setIsPanelOpen(false);
  };

  const handleDelete = onDeleteInitiative
    ? (initiative: Initiative) => {
        onDeleteInitiative(initiative);
        setIsPanelOpen(false);
      }
    : undefined;

  return (
    <>
      <div
        data-testid="mobile-card-view"
        className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-20 space-y-3"
      >
        {assetsByCategory.map(({ category, assets: catAssets }) => (
          <div key={category.id}>
            <div
              data-testid={`card-category-header-${category.id}`}
              className="flex items-center gap-2 px-1 py-2"
            >
              <div className="flex-1 h-px bg-slate-300" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                {category.name} ({catAssets.length})
              </span>
              <div className="flex-1 h-px bg-slate-300" />
            </div>
            <div className="space-y-2">
              {catAssets.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  initiatives={initiatives.filter(i => i.assetId === asset.id)}
                  programmes={programmes}
                  strategies={strategies}
                  dependencies={dependencies}
                  bucketMode={bucketMode}
                  onSelectInitiative={handleSelectInitiative}
                />
              ))}
            </div>
          </div>
        ))}

        {uncategorised.length > 0 && (
          <div className="space-y-2">
            {uncategorised.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                initiatives={initiatives.filter(i => i.assetId === asset.id)}
                programmes={programmes}
                strategies={strategies}
                dependencies={dependencies}
                bucketMode={bucketMode}
                onSelectInitiative={handleSelectInitiative}
              />
            ))}
          </div>
        )}
      </div>

      <InitiativePanel
        initiative={selectedInitiative}
        assets={assets}
        programmes={programmes}
        strategies={strategies}
        dependencies={dependencies}
        initiatives={initiatives}
        onClose={() => setIsPanelOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        isOpen={isPanelOpen}
      />
    </>
  );
}
