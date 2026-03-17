/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Timeline } from './components/Timeline';
import { DataControls } from './components/DataControls';
import { DataManager } from './components/DataManager';
import { TutorialModal } from './components/TutorialModal';
import { FeaturesModal } from './components/FeaturesModal';
import { LandingPage } from './components/LandingPage';
import { VersionManager } from './components/VersionManager';
import {
  demoAssets as initialAssets,
  demoInitiatives as initialInitiatives,
  demoMilestones as initialMilestones,
  demoProgrammes as initialProgrammes,
  demoStrategies as initialStrategies,
  demoDependencies as initialDependencies,
  demoAssetCategories as initialAssetCategories,
  demoTimelineSettings as defaultTimelineSettings
} from './demoData';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings } from './types';
import { LayoutGrid, Table, Loader2, Search, Undo2, Redo2, HelpCircle, BookOpen, History, AlertTriangle, GitBranch, AlignLeft, DollarSign, MoreHorizontal, BarChart2 } from 'lucide-react';
import { ReportsView } from './components/ReportsView';

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
import { useRef } from 'react';

export default function App() {
  const [view, setView] = useState<'visualiser' | 'data' | 'reports'>('visualiser');
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(
    !localStorage.getItem('oneplan_has_seen_landing') && !localStorage.getItem('oneplan-e2e')
  );

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
  const [isVersionManagerOpen, setIsVersionManagerOpen] = useState(false);
  const [showMoreSettingsPanel, setShowMoreSettingsPanel] = useState(false);
  const moreSettingsPanelRef = useRef<HTMLDivElement>(null);

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
          
          if (!defaults.timelineSettings.hasSeenTutorial && !localStorage.getItem('oneplan-e2e')) {
            setShowTutorial(true);
          }
        } else {
          console.log('Loaded data from DB');
          setAssets(dbData.assets);
          setInitiatives(dbData.initiatives.map(i => ({ ...i, budget: Number(i.budget) || 0 })));
          setMilestones(dbData.milestones);
          setProgrammes(dbData.programmes);
          setStrategies(dbData.strategies || []);
          setDependencies(dbData.dependencies || []);
          setAssetCategories(dbData.assetCategories || []);
          const mergedSettings = { ...defaultTimelineSettings, ...(dbData.timelineSettings || {}) };
          // Migration: if we have startYear but no startDate, convert it
          if ('startYear' in mergedSettings && !mergedSettings.startDate) {
            mergedSettings.startDate = `${mergedSettings.startYear}-01-01`;
            delete (mergedSettings as any).startYear;
          }
          setTimelineSettings(mergedSettings);

          if (!mergedSettings.hasSeenTutorial && !localStorage.getItem('oneplan-e2e')) {
            setShowTutorial(true);
          }
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
      console.log('Data saved to DB. Collapsed groups:', data.timelineSettings.collapsedGroups);
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
    const handleClickOutside = (e: MouseEvent) => {
      if (moreSettingsPanelRef.current && !moreSettingsPanelRef.current.contains(e.target as Node)) {
        setShowMoreSettingsPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* View Toggle */}
        <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
          <button
            onClick={() => setView('visualiser')}
            data-testid="nav-visualiser"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
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
            data-testid="nav-data-manager"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
              view === 'data'
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
                : "text-slate-600 hover:text-slate-800"
            )}
          >
            <Table size={14} />
            Data Manager
          </button>
          <button
            onClick={() => setView('reports')}
            data-testid="nav-reports"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
              view === 'reports'
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
                : "text-slate-600 hover:text-slate-800"
            )}
          >
            <BarChart2 size={14} />
            Reports
          </button>
        </div>

        {/* Search */}
        <div className="relative w-44 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="search"
            placeholder="Search initiatives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* Timeline Range */}
        <label className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
          Start
          <input
            type="date"
            value={timelineSettings.startDate}
            onChange={(e) => {
              handleUpdate({
                assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories,
                timelineSettings: { ...timelineSettings, startDate: e.target.value },
              });
            }}
            className="px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
          Months
          <select
            value={timelineSettings.monthsToShow || 36}
            onChange={(e) => {
              handleUpdate({
                assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories,
                timelineSettings: { ...timelineSettings, monthsToShow: parseInt(e.target.value) as 3 | 6 | 12 | 24 | 36 },
              });
            }}
            className="px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="3">3</option>
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="36">36</option>
          </select>
        </label>

        {/* Inline Display Toggles */}
        {(() => {
          const conflictsOn = (timelineSettings.conflictDetection || 'on') === 'on';
          const relationshipsOn = (timelineSettings.showRelationships || 'on') === 'on';
          const descriptionsOn = (timelineSettings.descriptionDisplay || 'off') === 'on';
          const budgetMode = timelineSettings.budgetVisualisation || 'off';
          const budgetCycle: Array<'off' | 'label' | 'bar-height'> = ['off', 'label', 'bar-height'];
          const nextBudget = budgetCycle[(budgetCycle.indexOf(budgetMode as 'off' | 'label' | 'bar-height') + 1) % 3];

          const toggleClass = (active: boolean) => cn(
            "p-1.5 rounded-md border transition-colors",
            active
              ? "bg-blue-50 border-blue-200 text-blue-600"
              : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          );

          return (
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                data-testid="toggle-conflicts"
                data-active={conflictsOn ? 'true' : 'false'}
                onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, conflictDetection: conflictsOn ? 'off' : 'on' } })}
                className={toggleClass(conflictsOn)}
                title="Conflict Detection"
              >
                <AlertTriangle size={13} />
              </button>
              <button
                data-testid="toggle-relationships"
                data-active={relationshipsOn ? 'true' : 'false'}
                onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, showRelationships: relationshipsOn ? 'off' : 'on' } })}
                className={toggleClass(relationshipsOn)}
                title="Relationship Lines"
              >
                <GitBranch size={13} />
              </button>
              <button
                data-testid="toggle-descriptions"
                data-active={descriptionsOn ? 'true' : 'false'}
                onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, descriptionDisplay: descriptionsOn ? 'off' : 'on' } })}
                className={toggleClass(descriptionsOn)}
                title="Descriptions"
              >
                <AlignLeft size={13} />
              </button>
              <button
                data-testid="toggle-budget"
                data-mode={budgetMode}
                onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, budgetVisualisation: nextBudget } })}
                className={toggleClass(budgetMode !== 'off')}
                title={`Budget: ${budgetMode}`}
              >
                <DollarSign size={13} />
              </button>

              {/* More settings (snap, empty rows) */}
              <div className="relative" ref={moreSettingsPanelRef}>
                <button
                  data-testid="display-more-btn"
                  onClick={() => setShowMoreSettingsPanel(v => !v)}
                  className={toggleClass(showMoreSettingsPanel)}
                  title="More settings"
                >
                  <MoreHorizontal size={13} />
                </button>
                {showMoreSettingsPanel && (
                  <div
                    className="absolute top-full left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 w-48"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-2">
                      {[
                        { label: 'Empty Rows', id: 'emptyRowDisplay', value: timelineSettings.emptyRowDisplay || 'show', options: [['show', 'Show'], ['hide', 'Hide']], key: 'emptyRowDisplay' as const },
                        { label: 'Snap to Month', id: 'snapToPeriod', value: timelineSettings.snapToPeriod || 'off', options: [['off', 'Off'], ['month', 'Month']], key: 'snapToPeriod' as const },
                      ].map(({ label, id, value, options, key }) => (
                        <div key={id} className="flex items-center justify-between gap-3">
                          <label htmlFor={id} className="text-xs text-slate-600 whitespace-nowrap">{label}</label>
                          <select
                            id={id}
                            value={value}
                            onChange={(e) => {
                              handleUpdate({
                                assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories,
                                timelineSettings: { ...timelineSettings, [key]: e.target.value },
                              });
                            }}
                            className="px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {options.map(([val, lbl]) => (
                              <option key={val} value={val}>{lbl}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Spacer */}
        <div className="flex-1" />

        {/* History */}
        <button
          onClick={() => setIsVersionManagerOpen(true)}
          data-testid="nav-history"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          title="Version History"
        >
          <History size={14} />
          History
        </button>

        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* Data Controls (PDF, Export, Import) */}
        <DataControls
          data={{ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings }}
          onImport={handleUpdate}
          timelineId={view === 'visualiser' ? 'timeline-visualiser' : undefined}
        />

        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* Undo/Redo */}
        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5 shrink-0">
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

        {/* Features / Tutorial */}
        <div className="flex bg-slate-50 rounded-lg border border-slate-200 p-0.5 shrink-0">
          <button
            onClick={() => setShowFeatures(true)}
            data-testid="nav-features"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
            title="Features"
          >
            <BookOpen size={16} />
          </button>
          <div className="w-px h-3.5 bg-slate-200 my-auto mx-0.5" />
          <button
            onClick={() => setShowTutorial(true)}
            data-testid="nav-tutorial"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
            title="Tutorial"
          >
            <HelpCircle size={16} />
          </button>
        </div>
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
              if (initiatives.some(i => i.id === newInit.id)) return;
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
            onDeleteInitiative={(deletedInit) => {
              handleUpdate({
                assets,
                initiatives: initiatives.filter(i => i.id !== deletedInit.id),
                milestones,
                programmes,
                strategies,
                dependencies: dependencies.filter(d => d.sourceId !== deletedInit.id && d.targetId !== deletedInit.id),
                assetCategories,
                timelineSettings,
              });
            }}
            onUpdateSettings={(updatedSettings) => {
              handleUpdate({
                assets,
                initiatives,
                milestones,
                programmes,
                strategies,
                dependencies,
                assetCategories,
                timelineSettings: updatedSettings,
              });
            }}
          />
        ) : view === 'data' ? (
          <DataManager
            data={{ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings }}
            onUpdate={handleUpdate}
            searchQuery={searchQuery}
          />
        ) : (
          <ReportsView assets={assets} initiatives={initiatives} dependencies={dependencies} currentData={getCurrentState()} />
        )}
      </main>

      <footer className="flex-shrink-0 pt-2 flex items-center justify-center gap-1 text-xs text-slate-400">
        OnePlan IT Initiative Planner — an{' '}
        <a
          href="https://github.com/waylonkenning/OnePlan"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-600 transition-colors"
        >
          open source
        </a>
        {' '}tool from{' '}
        <a
          href="https://kenning.co.nz"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-600 transition-colors"
        >
          Waylon Kenning
        </a>
      </footer>

      {showFeatures && (
        <FeaturesModal onClose={() => setShowFeatures(false)} />
      )}

      {showTutorial && (
        <TutorialModal 
          onClose={() => {
            setShowTutorial(false);
            if (!timelineSettings.hasSeenTutorial) {
              handleUpdate({
                assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories,
                timelineSettings: { ...timelineSettings, hasSeenTutorial: true },
              });
            }
          }} 
        />
      )}

      {showLandingPage && (
        <LandingPage
          onGetStarted={() => {
            setShowLandingPage(false);
            localStorage.setItem('oneplan_has_seen_landing', 'true');
          }}
        />
      )}

      <VersionManager
        isOpen={isVersionManagerOpen}
        onClose={() => setIsVersionManagerOpen(false)}
        onRestore={(version) => {
          handleUpdate(version.data);
        }}
        currentData={{
          assets,
          initiatives,
          milestones,
          programmes,
          strategies,
          dependencies,
          assetCategories,
          timelineSettings,
        }}
      />
    </div>
  );
}
