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
  dependencies as initialDependencies
} from './data';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency } from './types';
import { LayoutGrid, Table, Loader2 } from 'lucide-react';
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
          };
          await saveAppData(defaults);
          setAssets(defaults.assets);
          setInitiatives(defaults.initiatives);
          setMilestones(defaults.milestones);
          setProgrammes(defaults.programmes);
          setStrategies(defaults.strategies);
          setDependencies(defaults.dependencies);
        } else {
          console.log('Loaded data from DB');
          setAssets(dbData.assets);
          setInitiatives(dbData.initiatives.map(i => ({ ...i, budget: Number(i.budget) || 0 })));
          setMilestones(dbData.milestones);
          setProgrammes(dbData.programmes);
          setStrategies(dbData.strategies || []);
          setDependencies(dbData.dependencies || []);
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
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpdate = async (data: {
    assets: Asset[];
    initiatives: Initiative[];
    milestones: Milestone[];
    programmes: Programme[];
    strategies: Strategy[];
    dependencies: Dependency[];
  }) => {
    // Update state immediately for UI responsiveness
    setAssets(data.assets);
    setInitiatives(data.initiatives);
    setMilestones(data.milestones);
    setProgrammes(data.programmes);
    setStrategies(data.strategies);
    setDependencies(data.dependencies);

    // Persist to DB
    try {
      await saveAppData(data);
      console.log('Data saved to DB');
    } catch (error) {
      console.error('Failed to save data to DB:', error);
      alert('Failed to save changes to local storage.');
    }
  };

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
      <header className="mb-6 flex-shrink-0 flex justify-between items-start">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">OnePlan</h1>
            <p className="text-slate-500">Strategic roadmap and conflict detection for IT assets</p>
          </div>
          
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm self-start">
            <button
              onClick={() => setView('visualiser')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                view === 'visualiser' 
                  ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <LayoutGrid size={16} />
              Visualiser
            </button>
            <button
              onClick={() => setView('data')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                view === 'data' 
                  ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Table size={16} />
              Data Manager
            </button>
          </div>
        </div>

        <DataControls 
          data={{ assets, initiatives, milestones, programmes, strategies, dependencies }}
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
            onUpdateInitiative={(updatedInit) => {
              const updatedInitiatives = initiatives.map(i => i.id === updatedInit.id ? updatedInit : i);
              handleUpdate({
                assets,
                initiatives: updatedInitiatives,
                milestones,
                programmes,
                strategies,
                dependencies
              });
            }}
            onUpdateAssets={(updatedAssets) => {
              handleUpdate({
                assets: updatedAssets,
                initiatives,
                milestones,
                programmes,
                strategies,
                dependencies
              });
            }}
            onUpdateDependencies={(updatedDependencies) => {
              handleUpdate({
                assets,
                initiatives,
                milestones,
                programmes,
                strategies,
                dependencies: updatedDependencies
              });
            }}
          />
        ) : (
          <DataManager 
            data={{ assets, initiatives, milestones, programmes, strategies, dependencies }}
            onUpdate={handleUpdate}
          />
        )}
      </main>
    </div>
  );
}
