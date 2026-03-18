/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Timeline } from './components/Timeline';
import { MobileCardView } from './components/MobileCardView';
import { useMediaQuery } from './lib/useMediaQuery';
import { DataControls } from './components/DataControls';
import { DataManager } from './components/DataManager';
import { TutorialModal } from './components/TutorialModal';
import { FeaturesModal } from './components/FeaturesModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
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
  demoTimelineSettings as defaultTimelineSettings,
  demoResources as initialResources,
} from './demoData';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings, Resource } from './types';
import { LayoutGrid, Table, Loader2, Search, Undo2, Redo2, HelpCircle, BookOpen, History, AlertTriangle, GitBranch, AlignLeft, DollarSign, MoreHorizontal, BarChart2, ZoomIn, ZoomOut, SlidersHorizontal, X, Keyboard, GitCommit, Palette, Box, Boxes, Target, Users } from 'lucide-react';
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
  resources: Resource[];
};
import { cn } from './lib/utils';
import { getAppData, saveAppData } from './lib/db';
import { useRef } from 'react';

export default function App() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [view, setView] = useState<'visualiser' | 'data' | 'reports'>('visualiser');
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
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
  const [resources, setResources] = useState<Resource[]>([]);

  const [undoStack, setUndoStack] = useState<AppState[]>([]);
  const [redoStack, setRedoStack] = useState<AppState[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isVersionManagerOpen, setIsVersionManagerOpen] = useState(false);
  const [showMoreSettingsPanel, setShowMoreSettingsPanel] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const moreSettingsPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMobileSheet) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowMobileSheet(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showMobileSheet]);
  const undoRef = useRef<() => void>(() => {});
  const redoRef = useRef<() => void>(() => {});

  const getCurrentState = (): AppState => ({
    assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources
  });

  const getCurrentStateRef = useRef(getCurrentState);

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
            resources: initialResources,
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
          setResources(defaults.resources);
          
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
          setResources(dbData.resources || []);
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
        setResources(initialResources);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpdate = useCallback(async (data: AppState, skipHistory = false) => {
    if (!skipHistory) {
      setUndoStack(prev => {
        const newStack = [...prev, getCurrentStateRef.current()];
        if (newStack.length > 50) return newStack.slice(newStack.length - 50);
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
    setResources(data.resources || []);

    // Persist to DB
    try {
      await saveAppData(data);
      console.log('Data saved to DB. Collapsed groups:', data.timelineSettings.collapsedGroups);
    } catch (error) {
      console.error('Failed to save data to DB:', error);
      alert('Failed to save changes to local storage.');
    }
  }, []);

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];

    setRedoStack(prev => {
      const newStack = [...prev, getCurrentState()];
      if (newStack.length > 50) return newStack.slice(newStack.length - 50);
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
      if (newStack.length > 50) return newStack.slice(newStack.length - 50);
      return newStack;
    });
    setRedoStack(prev => prev.slice(0, -1));

    handleUpdate(nextState, true);
  };

  // Keep refs pointing to latest callbacks so the keyboard listener never needs to re-register
  undoRef.current = handleUndo;
  redoRef.current = handleRedo;
  getCurrentStateRef.current = getCurrentState;

  const handleAddInitiative = useCallback((newInit: Initiative) => {
    if (initiatives.some(i => i.id === newInit.id)) return;
    handleUpdate({ assets, initiatives: [...initiatives, newInit], milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources });
  }, [assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources, handleUpdate]);

  const handleUpdateInitiative = useCallback((updatedInit: Initiative) => {
    handleUpdate({ assets, initiatives: initiatives.map(i => i.id === updatedInit.id ? updatedInit : i), milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources });
  }, [assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources, handleUpdate]);

  const handleUpdateAssets = useCallback((updatedAssets: Asset[]) => {
    handleUpdate({ assets: updatedAssets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources });
  }, [initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources, handleUpdate]);

  const handleUpdateDependencies = useCallback((updatedDependencies: Dependency[]) => {
    handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies: updatedDependencies, assetCategories, timelineSettings, resources });
  }, [assets, initiatives, milestones, programmes, strategies, assetCategories, timelineSettings, resources, handleUpdate]);

  const handleUpdateMilestone = useCallback((updatedMilestone: Milestone) => {
    handleUpdate({ assets, initiatives, milestones: milestones.map(m => m.id === updatedMilestone.id ? updatedMilestone : m), programmes, strategies, dependencies, assetCategories, timelineSettings, resources });
  }, [assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources, handleUpdate]);

  const handleDeleteInitiative = useCallback((deletedInit: Initiative) => {
    handleUpdate({ assets, initiatives: initiatives.filter(i => i.id !== deletedInit.id), milestones, programmes, strategies, dependencies: dependencies.filter(d => d.sourceId !== deletedInit.id && d.targetId !== deletedInit.id), assetCategories, timelineSettings, resources });
  }, [assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources, handleUpdate]);

  const handleUpdateSettings = useCallback((updatedSettings: TimelineSettings) => {
    handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: updatedSettings, resources });
  }, [assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, handleUpdate]);

  const handleRestoreVersion = useCallback((version: { data: AppState }) => {
    handleUpdate(version.data);
  }, [handleUpdate]);

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

      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }

      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undoRef.current();
        } else if (e.key === 'Z' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redoRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <div className="h-screen w-full bg-slate-100 p-3 md:p-6 flex flex-col">
      <header className="mb-4 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">

        {/* ── Mobile header ── */}
        <div data-testid="mobile-header" className="flex md:hidden items-center gap-3 px-4 py-2">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">OnePlan</h1>
          <div className="flex-1" />
          <button
            data-testid="mobile-settings-btn"
            onClick={() => setShowMobileSheet(true)}
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Timeline settings"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* ── Desktop header ── */}
        <div data-testid="desktop-header-controls" className="hidden md:flex flex-wrap items-center gap-3 px-4 py-2">
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
                resources,
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
                resources,
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
          const criticalPathOn = (timelineSettings.criticalPath || 'off') === 'on';
          const showResourcesOn = (timelineSettings.showResources || 'off') === 'on';
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
                aria-label="Conflict Detection"
                aria-pressed={conflictsOn}
                onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, conflictDetection: conflictsOn ? 'off' : 'on' }, resources })}
                className={toggleClass(conflictsOn)}
                title="Conflict Detection"
              >
                <AlertTriangle size={13} />
              </button>
              <button
                data-testid="toggle-relationships"
                data-active={relationshipsOn ? 'true' : 'false'}
                aria-label="Relationship Lines"
                aria-pressed={relationshipsOn}
                onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, showRelationships: relationshipsOn ? 'off' : 'on' }, resources })}
                className={toggleClass(relationshipsOn)}
                title="Relationship Lines"
              >
                <GitBranch size={13} />
              </button>
              <button
                data-testid="toggle-descriptions"
                data-active={descriptionsOn ? 'true' : 'false'}
                aria-label="Descriptions"
                aria-pressed={descriptionsOn}
                onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, descriptionDisplay: descriptionsOn ? 'off' : 'on' }, resources })}
                className={toggleClass(descriptionsOn)}
                title="Descriptions"
              >
                <AlignLeft size={13} />
              </button>
              <button
                data-testid="toggle-budget"
                data-mode={budgetMode}
                aria-label={`Budget visualisation: ${budgetMode}`}
                aria-pressed={budgetMode !== 'off'}
                onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, budgetVisualisation: nextBudget }, resources })}
                className={toggleClass(budgetMode !== 'off')}
                title={`Budget: ${budgetMode}`}
              >
                <DollarSign size={13} />
              </button>
              <button
                data-testid="toggle-critical-path"
                data-active={criticalPathOn ? 'true' : 'false'}
                aria-label="Critical Path"
                aria-pressed={criticalPathOn}
                onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, criticalPath: criticalPathOn ? 'off' : 'on' }, resources })}
                className={toggleClass(criticalPathOn)}
                title="Critical Path"
              >
                <GitCommit size={13} />
              </button>
              <button
                data-testid="toggle-resources"
                data-active={showResourcesOn ? 'true' : 'false'}
                aria-label="Show Resources"
                aria-pressed={showResourcesOn}
                onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, showResources: showResourcesOn ? 'off' : 'on' }, resources })}
                className={toggleClass(showResourcesOn)}
                title="Show Resources"
              >
                <Users size={13} />
              </button>

              {/* Zoom controls */}
              {(() => {
                const ZOOM_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];
                const currentZoom = timelineSettings.columnZoom ?? 1.0;
                const currentIdx = ZOOM_STEPS.findIndex(z => Math.abs(z - currentZoom) < 0.01);
                const idx = currentIdx === -1 ? ZOOM_STEPS.indexOf(1.0) : currentIdx;
                const canZoomOut = idx > 0;
                const canZoomIn = idx < ZOOM_STEPS.length - 1;
                return (
                  <>
                    <div className="w-px h-4 bg-slate-200 mx-0.5" />
                    <button
                      data-testid="zoom-out"
                      aria-label="Zoom out"
                      disabled={!canZoomOut}
                      onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, columnZoom: ZOOM_STEPS[idx - 1] }, resources })}
                      className={cn(toggleClass(false), !canZoomOut && 'opacity-30 cursor-not-allowed')}
                      title="Zoom out"
                    >
                      <ZoomOut size={13} />
                    </button>
                    <button
                      data-testid="zoom-in"
                      aria-label="Zoom in"
                      disabled={!canZoomIn}
                      onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, columnZoom: ZOOM_STEPS[idx + 1] }, resources })}
                      className={cn(toggleClass(false), !canZoomIn && 'opacity-30 cursor-not-allowed')}
                      title="Zoom in"
                    >
                      <ZoomIn size={13} />
                    </button>
                  </>
                );
              })()}

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
                                resources,
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

        {/* Color-by and Group-by selectors (visualiser only) */}
        {view === 'visualiser' && (
          <>
            <div className="w-px h-6 bg-slate-200 shrink-0" />
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => handleUpdateSettings({ ...timelineSettings, colorBy: 'programme' })}
                className={cn("px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5", (timelineSettings.colorBy || 'programme') === 'programme' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <Palette size={14} />
                By Programme
              </button>
              <button
                onClick={() => handleUpdateSettings({ ...timelineSettings, colorBy: 'strategy' })}
                className={cn("px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5", (timelineSettings.colorBy || 'programme') === 'strategy' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <Palette size={14} />
                By Strategy
              </button>
              <button
                onClick={() => handleUpdateSettings({ ...timelineSettings, colorBy: 'status' })}
                className={cn("px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5", (timelineSettings.colorBy || 'programme') === 'status' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <Palette size={14} />
                By Status
              </button>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button
                data-testid="group-by-asset"
                aria-pressed={(timelineSettings.groupBy || 'asset') === 'asset'}
                onClick={() => handleUpdateSettings({ ...timelineSettings, groupBy: 'asset' })}
                className={cn("px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5", (timelineSettings.groupBy || 'asset') === 'asset' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                title="Group by Asset"
              >
                <Box size={14} />
                Asset
              </button>
              <button
                data-testid="group-by-programme"
                aria-pressed={(timelineSettings.groupBy || 'asset') === 'programme'}
                onClick={() => handleUpdateSettings({ ...timelineSettings, groupBy: 'programme' })}
                className={cn("px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5", (timelineSettings.groupBy || 'asset') === 'programme' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                title="Group by Programme"
              >
                <Boxes size={14} />
                Programme
              </button>
              <button
                data-testid="group-by-strategy"
                aria-pressed={(timelineSettings.groupBy || 'asset') === 'strategy'}
                onClick={() => handleUpdateSettings({ ...timelineSettings, groupBy: 'strategy' })}
                className={cn("px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5", (timelineSettings.groupBy || 'asset') === 'strategy' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                title="Group by Strategy"
              >
                <Target size={14} />
                Strategy
              </button>
            </div>
          </>
        )}

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
          data={{ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources }}
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
          <div className="w-px h-3.5 bg-slate-200 my-auto mx-0.5" />
          <button
            onClick={() => setShowShortcuts(true)}
            data-testid="keyboard-shortcuts-btn"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard size={16} />
          </button>
        </div>
        </div>{/* end desktop-header-controls */}
      </header>

      {/* ── Mobile settings bottom sheet ── */}
      {showMobileSheet && (
        <>
          <div
            data-testid="mobile-settings-backdrop"
            className="fixed inset-0 bg-slate-900/40 z-40 md:hidden"
            onClick={() => setShowMobileSheet(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowMobileSheet(false)}
          />
          <div
            data-testid="mobile-settings-sheet"
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 p-5 space-y-4"
            onKeyDown={(e) => e.key === 'Escape' && setShowMobileSheet(false)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-700">Settings</span>
              <button onClick={() => setShowMobileSheet(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>
            </div>
            <label className="flex items-center justify-between text-sm text-slate-600">
              Start date
              <input
                type="date"
                value={timelineSettings.startDate}
                onChange={(e) => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, startDate: e.target.value }, resources })}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between text-sm text-slate-600">
              Months
              <select
                value={timelineSettings.monthsToShow || 36}
                onChange={(e) => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, monthsToShow: parseInt(e.target.value) as 3 | 6 | 12 | 24 | 36 }, resources })}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="36">36</option>
              </select>
            </label>
            {/* Group by — bucket mode for card view */}
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Group by</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {(['Timeline', 'Quarter', 'Year', 'Programme', 'Strategy'] as const).map(label => {
                  const mode = label.toLowerCase() as 'timeline' | 'quarter' | 'year' | 'programme' | 'strategy';
                  const active = (timelineSettings.mobileBucketMode ?? 'timeline') === mode;
                  return (
                    <button
                      key={mode}
                      data-testid={`bucket-mode-${mode}`}
                      onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, mobileBucketMode: mode }, resources })}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                        active ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {(() => {
              const conflictsOn = (timelineSettings.conflictDetection || 'on') === 'on';
              const relationshipsOn = (timelineSettings.showRelationships || 'on') === 'on';
              const descriptionsOn = (timelineSettings.descriptionDisplay || 'off') === 'on';
              const budgetMode = timelineSettings.budgetVisualisation || 'off';
              const budgetCycle: Array<'off' | 'label' | 'bar-height'> = ['off', 'label', 'bar-height'];
              const nextBudget = budgetCycle[(budgetCycle.indexOf(budgetMode as 'off' | 'label' | 'bar-height') + 1) % 3];
              const sheetToggleClass = (active: boolean) => cn(
                'px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                active ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'
              );
              return (
                <div className="flex flex-wrap gap-2">
                  <button className={sheetToggleClass(conflictsOn)} onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, conflictDetection: conflictsOn ? 'off' : 'on' }, resources })}>Conflicts</button>
                  <button className={sheetToggleClass(relationshipsOn)} onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, showRelationships: relationshipsOn ? 'off' : 'on' }, resources })}>Relationships</button>
                  <button className={sheetToggleClass(descriptionsOn)} onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, descriptionDisplay: descriptionsOn ? 'off' : 'on' }, resources })}>Descriptions</button>
                  <button className={sheetToggleClass(budgetMode !== 'off')} onClick={() => handleUpdate({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings: { ...timelineSettings, budgetVisualisation: nextBudget }, resources })}>Budget: {budgetMode}</button>
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* ── Mobile bottom tab bar ── */}
      <div data-testid="mobile-tab-bar" className="flex md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg">
        {([
          { id: 'visualiser', testid: 'mobile-tab-visualiser', icon: <LayoutGrid size={20} />, label: 'Visualiser' },
          { id: 'reports',    testid: 'mobile-tab-reports',    icon: <BarChart2 size={20} />,  label: 'Reports' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            data-testid={tab.testid}
            onClick={() => setView(tab.id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors border-t-2',
              view === tab.id ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 min-h-0 pb-16 md:pb-0">
        {view === 'visualiser' ? (
          isMobile ? (
            <MobileCardView
              assets={assets}
              initiatives={initiatives}
              programmes={programmes}
              strategies={strategies}
              dependencies={dependencies}
              assetCategories={assetCategories}
              settings={timelineSettings}
              onSaveInitiative={handleUpdateInitiative}
              onDeleteInitiative={handleDeleteInitiative}
            />
          ) : (
          <Timeline
            assets={assets}
            initiatives={initiatives}
            milestones={milestones}
            programmes={programmes}
            strategies={strategies}
            dependencies={dependencies}
            assetCategories={assetCategories}
            resources={resources}
            settings={timelineSettings}
            searchQuery={searchQuery}
            onAddInitiative={handleAddInitiative}
            onUpdateInitiative={handleUpdateInitiative}
            onUpdateAssets={handleUpdateAssets}
            onUpdateDependencies={handleUpdateDependencies}
            onUpdateMilestone={handleUpdateMilestone}
            onDeleteInitiative={handleDeleteInitiative}
            onUpdateSettings={handleUpdateSettings}
          />
          )
        ) : view === 'data' ? (
          <DataManager
            data={{ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, timelineSettings, resources }}
            onUpdate={handleUpdate}
            searchQuery={searchQuery}
          />
        ) : (
          <ReportsView assets={assets} initiatives={initiatives} milestones={milestones} dependencies={dependencies} currentData={getCurrentState()} programmes={programmes} strategies={strategies} assetCategories={assetCategories} />
        )}
      </main>

      <footer className="hidden md:flex flex-shrink-0 pt-2 items-center justify-center gap-1 text-xs text-slate-400">
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

      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

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
        onRestore={handleRestoreVersion}
        currentData={{
          assets,
          initiatives,
          milestones,
          programmes,
          strategies,
          dependencies,
          assetCategories,
          timelineSettings,
          resources,
        }}
      />
    </div>
  );
}
