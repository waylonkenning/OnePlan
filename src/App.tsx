/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Timeline } from './components/Timeline';
import { DataControls } from './components/DataControls';
import { DataManager } from './components/DataManager';
import {
  assets as initialAssets,
  initiatives as initialInitiatives,
  milestones as initialMilestones,
  programmes as initialProgrammes,
  strategies as initialStrategies,
  dependencies as initialDependencies,
  assetCategories as initialAssetCategories,
  defaultTimelineSettings
} from './data';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings } from './types';
import { LayoutGrid, Table, Loader2, Search, Undo2, Redo2 } from 'lucide-react';

type AppState = {
  assets: Asset[];
  initiatives: Initiative[];
  milestones: Milestone[];
  programmes: Programme[];
  strategies: Strategy[];
  dependencies: Dependency[];
  assetCategories: AssetCategory[];
  timelineSettings: TimelineSettings;
};
import { cn } from './lib/utils';
import { getAppData, saveAppData } from './lib/db';

export default function App() {
  const [view, setView] = useState<'visualiser' | 'data'>('visualiser');
  const [isLoading, setIsLoading] = useState(true);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>(defaultTimelineSettings);

  const [undoStack, setUndoStack] = useState<AppState[]>([]);
  const [redoStack, setRedoStack] = useState<AppState[]>([]);

  const [searchQuery, setSearchQuery] = useState('');

  const getCurrentState = (): AppState => ({
    assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const dbData = await getAppData();

        // If DB is empty (first run), use initial data and save it
        if (dbData.assets.length === 0 && dbData.initiatives.length === 0) {
          console.log('Initializing DB with default data...');
          const defaults = {
            assets: initialAssets,
            initiatives: initialInitiatives,
            milestones: initialMilestones,
            programmes: initialProgrammes,
            strategies: initialStrategies,
            dependencies: initialDependencies,
            assetCategories: initialAssetCategories,
            timelineSettings: defaultTimelineSettings,
          };
          await saveAppData(defaults);
          setAssets(defaults.assets);
          setInitiatives(defaults.initiatives);
          setMilestones(defaults.milestones);
          setProgrammes(defaults.programmes);
          setStrategies(defaults.strategies);
          setDependencies(defaults.dependencies);
          setAssetCategories(defaults.assetCategories);
          setTimelineSettings(defaults.timelineSettings);
        } else {
          console.log('Loaded data from DB');
          setAssets(dbData.assets);
          setInitiatives(dbData.initiatives.map(i => ({ ...i, budget: Number(i.budget) || 0 })));
          setMilestones(dbData.milestones);
          setProgrammes(dbData.programmes);
          setStrategies(dbData.strategies || []);
          setDependencies(dbData.dependencies || []);
          setAssetCategories(dbData.assetCategories || []);
          setTimelineSettings(dbData.timelineSettings || defaultTimelineSettings);
        }
      } catch (error) {
        console.error('Failed to load data from DB:', error);
        // Fallback to initial data
        setAssets(initialAssets);
        setInitiatives(initialInitiatives);
        setMilestones(initialMilestones);
        setProgrammes(initialProgrammes);
        setStrategies(initialStrategies);
        setDependencies(initialDependencies);
        setAssetCategories(initialAssetCategories);
        setTimelineSettings(defaultTimelineSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpdate = async (data: AppState, skipHistory = false) => {
    if (!skipHistory) {
      setUndoStack(prev => {
        const newStack = [...prev, getCurrentState()];
        if (newStack.length > 10) return newStack.slice(newStack.length - 10);
        return newStack;
      });
      setRedoStack([]);
    }
    // Update state immediately for UI responsiveness
    setAssets(data.assets);
    setInitiatives(data.initiatives);
    setMilestones(data.milestones);
    setProgrammes(data.programmes);
    setStrategies(data.strategies);
    setDependencies(data.dependencies);
    setAssetCategories(data.assetCategories);
    setTimelineSettings(data.timelineSettings);

    // Persist to DB
    try {
      await saveAppData(data);
      console.log('Data saved to DB');
    } catch (error) {
      console.error('Failed to save data to DB:', error);
      alert('Failed to save changes to local storage.');
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];

    setRedoStack(prev => {
      const newStack = [...prev, getCurrentState()];
      if (newStack.length > 10) return newStack.slice(newStack.length - 10);
      return newStack;
    });
    setUndoStack(prev => prev.slice(0, -1));

    handleUpdate(previousState, true);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];

    setUndoStack(prev => {
      const newStack = [...prev, getCurrentState()];
      if (newStack.length > 10) return newStack.slice(newStack.length - 10);
      return newStack;
    });
    setRedoStack(prev => prev.slice(0, -1));

    handleUpdate(nextState, true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'Z' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-100 p-6 flex flex-col">
      <header className="mb-4 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2 flex items-center gap-3">
        {/* Logo */}
        <h1 className="text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">OnePlan</h1>

        <div className="w-px h-6 bg-slate-200" />

        {/* View Toggle */}
        <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button
            onClick={() => setView('visualiser')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              view === 'visualiser'
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
                : "text-slate-600 hover:text-slate-800"
            )}
          >
            <LayoutGrid size={14} />
            Visualiser
          </button>
          <button
            onClick={() => setView('data')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              view === 'data'
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
                : "text-slate-600 hover:text-slate-800"
            )}
          >
            <Table size={14} />
            Data Manager
          </button>
        </div>

        {/* Search */}
        <div className="relative w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="search"
            placeholder="Search initiatives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* Inline Timeline Settings */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            Start
            <input
              type="number"
              min="2000"
              max="2100"
              value={timelineSettings.startYear}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 2000 && val <= 2100) {
                  handleUpdate({
                    assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories,
                    timelineSettings: { ...timelineSettings, startYear: val },
                  });
                }
              }}
              className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            Years
            <input
              type="number"
              min="1"
              max="20"
              value={timelineSettings.yearsToShow}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 1 && val <= 20) {
                  handleUpdate({
                    assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories,
                    timelineSettings: { ...timelineSettings, yearsToShow: val },
                  });
                }
              }}
              className="w-12 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            Budget
            <select
              id="budgetVisualisation"
              value={timelineSettings.budgetVisualisation || 'off'}
              onChange={(e) => {
                handleUpdate({
                  assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories,
                  timelineSettings: { ...timelineSettings, budgetVisualisation: e.target.value as 'off' | 'bar-height' | 'label' },
                });
              }}
              className="px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="off">Off</option>
              <option value="bar-height">Bar Height</option>
              <option value="label">Label</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            Desc
            <select
              id="descriptionDisplay"
              value={timelineSettings.descriptionDisplay || 'off'}
              onChange={(e) => {
                handleUpdate({
                  assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories,
                  timelineSettings: { ...timelineSettings, descriptionDisplay: e.target.value as 'off' | 'on' },
                });
              }}
              className="px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="off">Off</option>
              <option value="on">On</option>
            </select>
          </label>
        </div>

        {/* Spacer pushes remaining items right */}
        <div className="flex-1" />

        {/* Undo/Redo */}
        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-1.5 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
            title="Undo"
          >
            <Undo2 size={14} />
          </button>
          <div className="w-px h-3.5 bg-slate-200" />
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
            title="Redo"
          >
            <Redo2 size={14} />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* Data Controls (Export, Import only) */}
        <DataControls
          data={{ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings }}
          onImport={handleUpdate}
          timelineId={view === 'visualiser' ? 'timeline-visualiser' : undefined}
        />
      </header>

      <main className="flex-1 min-h-0">
        {view === 'visualiser' ? (
          <Timeline
            assets={assets}
            initiatives={initiatives}
            milestones={milestones}
            programmes={programmes}
            strategies={strategies}
            dependencies={dependencies}
            assetCategories={assetCategories}
            settings={timelineSettings}
            searchQuery={searchQuery}
            onAddInitiative={(newInit) => {
              handleUpdate({
                assets,
                initiatives: [...initiatives, newInit],
                milestones,
                programmes,
                strategies,
                dependencies,
                assetCategories,
                timelineSettings,
              });
            }}
            onUpdateInitiative={(updatedInit) => {
              const updatedInitiatives = initiatives.map(i => i.id === updatedInit.id ? updatedInit : i);
              handleUpdate({
                assets,
                initiatives: updatedInitiatives,
                milestones,
                programmes,
                strategies,
                dependencies,
                assetCategories,
                timelineSettings,
              });
            }}
            onUpdateAssets={(updatedAssets) => {
              handleUpdate({
                assets: updatedAssets,
                initiatives,
                milestones,
                programmes,
                strategies,
                dependencies,
                assetCategories,
                timelineSettings,
              });
            }}
            onUpdateDependencies={(updatedDependencies) => {
              handleUpdate({
                assets,
                initiatives,
                milestones,
                programmes,
                strategies,
                dependencies: updatedDependencies,
                assetCategories,
                timelineSettings,
              });
            }}
            onUpdateMilestone={(updatedMilestone) => {
              const updatedMilestones = milestones.map(m => m.id === updatedMilestone.id ? updatedMilestone : m);
              handleUpdate({
                assets,
                initiatives,
                milestones: updatedMilestones,
                programmes,
                strategies,
                dependencies,
                assetCategories,
                timelineSettings,
              });
            }}
          />
        ) : (
          <DataManager
            data={{ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings }}
            onUpdate={handleUpdate}
            searchQuery={searchQuery}
          />
        )}
      </main>
    </div>
  );
}
