import React, { useState } from 'react';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings } from '../types';
import { EditableTable, Column } from './EditableTable';
import { cn } from '../lib/utils';
import { Database, Layers, Calendar, Flag, Target, Link2, FolderTree, Trash2, RotateCcw } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import {
  demoAssets, demoInitiatives, demoMilestones, demoProgrammes, demoStrategies,
  demoDependencies, demoAssetCategories, demoTimelineSettings
} from '../demoData';

interface DataManagerProps {
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
  onUpdate: (data: {
    assets: Asset[];
    initiatives: Initiative[];
    milestones: Milestone[];
    programmes: Programme[];
    strategies: Strategy[];
    dependencies: Dependency[];
    assetCategories: AssetCategory[];
    timelineSettings: TimelineSettings;
  }) => void;
  searchQuery?: string;
}

type Tab = 'initiatives' | 'dependencies' | 'assets' | 'assetCategories' | 'programmes' | 'strategies' | 'milestones';

export function DataManager({ data, onUpdate, searchQuery }: DataManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('initiatives');
  const [pendingConfirm, setPendingConfirm] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const confirm = (title: string, message: string, action: () => void) => {
    setPendingConfirm({ title, message, onConfirm: () => { setPendingConfirm(null); action(); } });
  };

  const updateData = (key: keyof typeof data, newData: any[]) => {
    onUpdate({
      ...data,
      [key]: newData
    });
  };

  // Shared helper: builds the confirm dialog and triggers the cascading update.
  const cascadeDelete = (
    title: string,
    entityName: string,
    cascadeParts: string[],
    updates: Partial<typeof data>,
    customMsg?: string
  ): boolean => {
    const msg = customMsg ?? (cascadeParts.length
      ? `Deleting "${entityName}" will also remove ${cascadeParts.join(', ')}. Continue?`
      : `Delete "${entityName}"?`);
    confirm(title, msg, () => onUpdate({ ...data, ...updates }));
    return true;
  };

  // Cascading delete handlers
  const handleDeleteAsset = (asset: Asset): boolean => {
    const affectedInits = data.initiatives.filter(i => i.assetId === asset.id);
    const affectedMiles = data.milestones.filter(m => m.assetId === asset.id);
    const affectedInitIds = new Set(affectedInits.map(i => i.id));
    const affectedDeps = data.dependencies.filter(d => affectedInitIds.has(d.sourceId) || affectedInitIds.has(d.targetId));
    const parts = [];
    if (affectedInits.length) parts.push(`${affectedInits.length} initiative(s)`);
    if (affectedMiles.length) parts.push(`${affectedMiles.length} milestone(s)`);
    if (affectedDeps.length) parts.push(`${affectedDeps.length} dependency(ies)`);
    return cascadeDelete('Delete Asset', asset.name, parts, {
      assets: data.assets.filter(a => a.id !== asset.id),
      initiatives: data.initiatives.filter(i => i.assetId !== asset.id),
      milestones: data.milestones.filter(m => m.assetId !== asset.id),
      dependencies: data.dependencies.filter(d => !affectedInitIds.has(d.sourceId) && !affectedInitIds.has(d.targetId)),
    });
  };

  const handleDeleteProgramme = (prog: Programme): boolean => {
    const affectedInits = data.initiatives.filter(i => i.programmeId === prog.id);
    const affectedInitIds = new Set(affectedInits.map(i => i.id));
    const affectedDeps = data.dependencies.filter(d => affectedInitIds.has(d.sourceId) || affectedInitIds.has(d.targetId));
    const parts = [];
    if (affectedInits.length) parts.push(`${affectedInits.length} initiative(s)`);
    if (affectedDeps.length) parts.push(`${affectedDeps.length} dependency(ies)`);
    return cascadeDelete('Delete Programme', prog.name, parts, {
      programmes: data.programmes.filter(p => p.id !== prog.id),
      initiatives: data.initiatives.filter(i => i.programmeId !== prog.id),
      dependencies: data.dependencies.filter(d => !affectedInitIds.has(d.sourceId) && !affectedInitIds.has(d.targetId)),
    });
  };

  const handleDeleteStrategy = (strat: Strategy): boolean => {
    const affected = data.initiatives.filter(i => i.strategyId === strat.id);
    const customMsg = affected.length
      ? `Deleting "${strat.name}" will clear the strategy on ${affected.length} initiative(s). Continue?`
      : undefined;
    return cascadeDelete('Delete Strategy', strat.name, [], {
      strategies: data.strategies.filter(s => s.id !== strat.id),
      initiatives: data.initiatives.map(i => i.strategyId === strat.id ? { ...i, strategyId: undefined } : i),
    }, customMsg);
  };

  const handleDeleteInitiative = (init: Initiative): boolean => {
    const affectedDeps = data.dependencies.filter(d => d.sourceId === init.id || d.targetId === init.id);
    const parts = affectedDeps.length ? [`${affectedDeps.length} dependency(ies)`] : [];
    return cascadeDelete('Delete Initiative', init.name, parts, {
      initiatives: data.initiatives.filter(i => i.id !== init.id),
      dependencies: data.dependencies.filter(d => d.sourceId !== init.id && d.targetId !== init.id),
    });
  };

  const handleDeleteCategory = (cat: AssetCategory): boolean => {
    const affectedAssets = data.assets.filter(a => a.categoryId === cat.id);
    const affectedAssetIds = new Set(affectedAssets.map(a => a.id));
    const affectedInits = data.initiatives.filter(i => affectedAssetIds.has(i.assetId));
    const affectedInitIds = new Set(affectedInits.map(i => i.id));
    const affectedMiles = data.milestones.filter(m => affectedAssetIds.has(m.assetId));
    const affectedDeps = data.dependencies.filter(d => affectedInitIds.has(d.sourceId) || affectedInitIds.has(d.targetId));
    const parts = [];
    if (affectedAssets.length) parts.push(`${affectedAssets.length} asset(s)`);
    if (affectedInits.length) parts.push(`${affectedInits.length} initiative(s)`);
    if (affectedMiles.length) parts.push(`${affectedMiles.length} milestone(s)`);
    if (affectedDeps.length) parts.push(`${affectedDeps.length} dependency(ies)`);
    return cascadeDelete('Delete Category', cat.name, parts, {
      assetCategories: data.assetCategories.filter(c => c.id !== cat.id),
      assets: data.assets.filter(a => a.categoryId !== cat.id),
      initiatives: data.initiatives.filter(i => !affectedAssetIds.has(i.assetId)),
      milestones: data.milestones.filter(m => !affectedAssetIds.has(m.assetId)),
      dependencies: data.dependencies.filter(d => !affectedInitIds.has(d.sourceId) && !affectedInitIds.has(d.targetId)),
    });
  };

  const assetOptions = data.assets.map(a => ({ value: a.id, label: a.name }));
  const programmeOptions = data.programmes.map(p => ({ value: p.id, label: p.name }));
  const strategyOptions = data.strategies.map(s => ({ value: s.id, label: s.name }));
  const initiativeOptions = data.initiatives.map(i => ({ value: i.id, label: i.name }));
  const categoryOptions = data.assetCategories.map(c => ({ value: c.id, label: c.name }));

  const initiativeColumns: Column<Initiative>[] = [
    { key: 'name', label: 'Initiative Name', type: 'text', width: '25%' },
    { key: 'assetId', label: 'Asset', type: 'select', options: assetOptions, width: '15%' },
    { key: 'programmeId', label: 'Programme', type: 'select', options: programmeOptions, width: '15%' },
    { key: 'strategyId', label: 'Strategy', type: 'select', options: strategyOptions, width: '15%' },
    { key: 'startDate', label: 'Start Date', type: 'date', width: '10%' },
    { key: 'endDate', label: 'End Date', type: 'date', width: '10%' },
    { key: 'budget', label: 'Budget ($)', type: 'number', width: '10%' },
    { key: 'isPlaceholder', label: 'Placeholder?', type: 'boolean', width: '5%' },
  ];

  const assetColumns: Column<Asset>[] = [
    { key: 'name', label: 'Asset Name', type: 'text', width: '50%' },
    { key: 'categoryId', label: 'Category', type: 'select', options: categoryOptions, width: '50%' },
  ];

  const categoryColumns: Column<AssetCategory>[] = [
    { key: 'name', label: 'Category Name', type: 'text', width: '80%' },
    { key: 'order', label: 'Sort Order', type: 'number', width: '20%' },
  ];

  const programmeColumns: Column<Programme>[] = [
    { key: 'name', label: 'Programme Name', type: 'text', width: '60%' },
    { key: 'color', label: 'Color', type: 'color', width: '40%' },
  ];

  const strategyColumns: Column<Strategy>[] = [
    { key: 'name', label: 'Strategy Name', type: 'text', width: '60%' },
    { key: 'color', label: 'Color', type: 'color', width: '40%' },
  ];

  const milestoneColumns: Column<Milestone>[] = [
    { key: 'name', label: 'Milestone Name', type: 'text', width: '30%' },
    { key: 'assetId', label: 'Asset', type: 'select', options: assetOptions, width: '20%' },
    { key: 'date', label: 'Date', type: 'date', width: '20%' },
    {
      key: 'type', label: 'Type', type: 'select', options: [
        { value: 'info', label: 'Info' },
        { value: 'warning', label: 'Warning' },
        { value: 'critical', label: 'Critical' }
      ], width: '20%'
    },
  ];

  const dependencyColumns: Column<Dependency>[] = [
    { key: 'sourceId', label: 'Dependent Initiative', type: 'select', options: initiativeOptions, width: '35%' },
    { key: 'targetId', label: 'Depends On', type: 'select', options: initiativeOptions, width: '35%' },
    {
      key: 'type', label: 'Dependency Type', type: 'select', options: [
        { value: 'blocks', label: 'Blocks' },
        { value: 'requires', label: 'Requires' },
        { value: 'related', label: 'Related' }
      ], width: '20%'
    },
  ];

  const handleColumnResize = (tableId: Tab, columnKey: string, newWidth: string) => {
    const updatedWidths = {
      ...(data.timelineSettings.columnWidths || {}),
      [tableId]: {
        ...(data.timelineSettings.columnWidths?.[tableId] || {}),
        [columnKey]: newWidth
      }
    };

    onUpdate({
      ...data,
      timelineSettings: {
        ...data.timelineSettings,
        columnWidths: updatedWidths
      }
    });
  };

  const getColumnsWithWidths = <T extends { [key: string]: any }>(tabId: Tab, baseColumns: Column<T>[]): Column<T>[] => {
    const savedWidths = data.timelineSettings.columnWidths?.[tabId] || {};
    return baseColumns.map(col => ({
      ...col,
      width: savedWidths[String(col.key)] || col.width
    }));
  };

  const tabs = [
    { id: 'initiatives', label: 'Initiatives', icon: Layers, count: data.initiatives.length },
    { id: 'dependencies', label: 'Dependencies', icon: Link2, count: data.dependencies.length },
    { id: 'assets', label: 'Assets', icon: Database, count: data.assets.length },
    { id: 'assetCategories', label: 'Categories', icon: FolderTree, count: data.assetCategories.length },
    { id: 'programmes', label: 'Programmes', icon: Calendar, count: data.programmes.length },
    { id: 'strategies', label: 'Strategies', icon: Target, count: data.strategies.length },
    { id: 'milestones', label: 'Milestones', icon: Flag, count: data.milestones.length },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex border-b border-slate-200 bg-white overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        {activeTab === 'initiatives' && (
          <EditableTable
            data={data.initiatives}
            columns={getColumnsWithWidths('initiatives', initiativeColumns)}
            onUpdate={(newData) => updateData('initiatives', newData)}
            onDelete={handleDeleteInitiative}
            idField="id"
            searchQuery={searchQuery}
            tableId="initiatives"
            onColumnResize={(key, width) => handleColumnResize('initiatives', key, width)}
          />
        )}
        {activeTab === 'dependencies' && (
          <EditableTable
            data={data.dependencies}
            columns={getColumnsWithWidths('dependencies', dependencyColumns)}
            onUpdate={(newData) => updateData('dependencies', newData)}
            idField="id"
            searchQuery={searchQuery}
            tableId="dependencies"
            onColumnResize={(key, width) => handleColumnResize('dependencies', key, width)}
          />
        )}
        {activeTab === 'assets' && (
          <EditableTable
            data={data.assets}
            columns={getColumnsWithWidths('assets', assetColumns)}
            onUpdate={(newData) => updateData('assets', newData)}
            onDelete={handleDeleteAsset}
            idField="id"
            searchQuery={searchQuery}
            tableId="assets"
            onColumnResize={(key, width) => handleColumnResize('assets', key, width)}
          />
        )}
        {activeTab === 'assetCategories' && (
          <EditableTable
            data={data.assetCategories}
            columns={getColumnsWithWidths('assetCategories', categoryColumns)}
            onUpdate={(newData) => updateData('assetCategories', newData)}
            onDelete={handleDeleteCategory}
            idField="id"
            searchQuery={searchQuery}
            tableId="assetCategories"
            onColumnResize={(key, width) => handleColumnResize('assetCategories', key, width)}
          />
        )}
        {activeTab === 'programmes' && (
          <EditableTable
            data={data.programmes}
            columns={getColumnsWithWidths('programmes', programmeColumns)}
            onUpdate={(newData) => updateData('programmes', newData)}
            onDelete={handleDeleteProgramme}
            idField="id"
            searchQuery={searchQuery}
            tableId="programmes"
            onColumnResize={(key, width) => handleColumnResize('programmes', key, width)}
          />
        )}
        {activeTab === 'strategies' && (
          <EditableTable
            data={data.strategies}
            columns={getColumnsWithWidths('strategies', strategyColumns)}
            onUpdate={(newData) => updateData('strategies', newData)}
            onDelete={handleDeleteStrategy}
            idField="id"
            searchQuery={searchQuery}
            tableId="strategies"
            onColumnResize={(key, width) => handleColumnResize('strategies', key, width)}
          />
        )}
        {activeTab === 'milestones' && (
          <EditableTable
            data={data.milestones}
            columns={getColumnsWithWidths('milestones', milestoneColumns)}
            onUpdate={(newData) => updateData('milestones', newData)}
            idField="id"
            searchQuery={searchQuery}
            tableId="milestones"
            onColumnResize={(key, width) => handleColumnResize('milestones', key, width)}
          />
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200">
        <button
          onClick={() => confirm(
            'Reset — delete all data',
            'This will permanently delete ALL data across every table (Initiatives, Assets, Programmes, etc.). This cannot be undone.',
            () => onUpdate({ ...data, assets: [], initiatives: [], milestones: [], programmes: [], strategies: [], dependencies: [], assetCategories: [] }),
          )}
          className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all shadow-sm font-medium text-sm"
        >
          <Trash2 size={16} />
          Reset - delete all data
        </button>
        <button
          onClick={() => confirm(
            'Reset — use demo data',
            'This will replace ALL current data with the demo dataset. Your existing data will be lost.',
            () => onUpdate({ assets: demoAssets, initiatives: demoInitiatives, milestones: demoMilestones, programmes: demoProgrammes, strategies: demoStrategies, dependencies: demoDependencies, assetCategories: demoAssetCategories, timelineSettings: demoTimelineSettings }),
          )}
          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm font-medium text-sm"
        >
          <RotateCcw size={16} />
          Reset - use demo data
        </button>
      </div>
      <ConfirmModal
        isOpen={pendingConfirm !== null}
        title={pendingConfirm?.title ?? ''}
        message={pendingConfirm?.message ?? ''}
        confirmLabel="Confirm"
        onConfirm={() => pendingConfirm?.onConfirm()}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}
