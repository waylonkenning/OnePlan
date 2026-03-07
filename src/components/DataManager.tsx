import React, { useState } from 'react';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency } from '../types';
import { EditableTable, Column } from './EditableTable';
import { cn } from '../lib/utils';
import { Database, Layers, Calendar, Flag, Target, Link2 } from 'lucide-react';

interface DataManagerProps {
  data: {
    assets: Asset[];
    initiatives: Initiative[];
    milestones: Milestone[];
    programmes: Programme[];
    strategies: Strategy[];
    dependencies: Dependency[];
  };
  onUpdate: (data: {
    assets: Asset[];
    initiatives: Initiative[];
    milestones: Milestone[];
    programmes: Programme[];
    strategies: Strategy[];
    dependencies: Dependency[];
  }) => void;
}

type Tab = 'initiatives' | 'assets' | 'programmes' | 'milestones' | 'strategies' | 'dependencies';

export function DataManager({ data, onUpdate }: DataManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('initiatives');

  const updateData = (key: keyof typeof data, newData: any[]) => {
    onUpdate({
      ...data,
      [key]: newData
    });
  };

  const assetOptions = data.assets.map(a => ({ value: a.id, label: a.name }));
  const programmeOptions = data.programmes.map(p => ({ value: p.id, label: p.name }));
  const strategyOptions = data.strategies.map(s => ({ value: s.id, label: s.name }));
  const initiativeOptions = data.initiatives.map(i => ({ value: i.id, label: i.name }));

  const initiativeColumns: Column<Initiative>[] = [
    { key: 'name', label: 'Initiative Name', type: 'text', width: '25%' },
    { key: 'assetId', label: 'Asset', type: 'select', options: assetOptions, width: '15%' },
    { key: 'programmeId', label: 'Programme', type: 'select', options: programmeOptions, width: '15%' },
    { key: 'strategyId', label: 'Strategy', type: 'select', options: strategyOptions, width: '15%' },
    { key: 'startDate', label: 'Start Date', type: 'date', width: '10%' },
    { key: 'endDate', label: 'End Date', type: 'date', width: '10%' },
    { key: 'budget', label: 'Budget ($)', type: 'number', width: '10%' },
  ];

  const assetColumns: Column<Asset>[] = [
    { key: 'name', label: 'Asset Name', type: 'text', width: '50%' },
    { key: 'category', label: 'Category', type: 'text', width: '50%' },
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
    { key: 'type', label: 'Type', type: 'select', options: [
      { value: 'info', label: 'Info' },
      { value: 'warning', label: 'Warning' },
      { value: 'critical', label: 'Critical' }
    ], width: '20%' },
  ];

  const dependencyColumns: Column<Dependency>[] = [
    { key: 'sourceId', label: 'Dependent Initiative', type: 'select', options: initiativeOptions, width: '35%' },
    { key: 'targetId', label: 'Depends On', type: 'select', options: initiativeOptions, width: '35%' },
    { key: 'type', label: 'Dependency Type', type: 'select', options: [
      { value: 'blocks', label: 'Blocks' },
      { value: 'requires', label: 'Requires' },
      { value: 'related', label: 'Related' }
    ], width: '20%' },
  ];

  const tabs = [
    { id: 'initiatives', label: 'Initiatives', icon: Layers, count: data.initiatives.length },
    { id: 'dependencies', label: 'Dependencies', icon: Link2, count: data.dependencies.length },
    { id: 'assets', label: 'Assets', icon: Database, count: data.assets.length },
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
            columns={initiativeColumns} 
            onUpdate={(newData) => updateData('initiatives', newData)}
            idField="id"
          />
        )}
        {activeTab === 'dependencies' && (
          <EditableTable 
            data={data.dependencies} 
            columns={dependencyColumns} 
            onUpdate={(newData) => updateData('dependencies', newData)}
            idField="id"
          />
        )}
        {activeTab === 'assets' && (
          <EditableTable 
            data={data.assets} 
            columns={assetColumns} 
            onUpdate={(newData) => updateData('assets', newData)}
            idField="id"
          />
        )}
        {activeTab === 'programmes' && (
          <EditableTable 
            data={data.programmes} 
            columns={programmeColumns} 
            onUpdate={(newData) => updateData('programmes', newData)}
            idField="id"
          />
        )}
        {activeTab === 'strategies' && (
          <EditableTable 
            data={data.strategies} 
            columns={strategyColumns} 
            onUpdate={(newData) => updateData('strategies', newData)}
            idField="id"
          />
        )}
        {activeTab === 'milestones' && (
          <EditableTable 
            data={data.milestones} 
            columns={milestoneColumns} 
            onUpdate={(newData) => updateData('milestones', newData)}
            idField="id"
          />
        )}
      </div>
    </div>
  );
}
