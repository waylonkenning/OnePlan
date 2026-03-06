import React, { useMemo, useState } from 'react';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency } from '../types';
import { differenceInDays, format, parseISO, addQuarters, getYear, getQuarter, startOfYear } from 'date-fns';
import { cn } from '../lib/utils';
import { AlertTriangle, Star, Info, Palette, ArrowRight } from 'lucide-react';

interface TimelineProps {
  assets: Asset[];
  initiatives: Initiative[];
  milestones: Milestone[];
  programmes: Programme[];
  strategies: Strategy[];
  dependencies: Dependency[];
}

const CELL_WIDTH = 200; // Width of one quarter column
const START_YEAR = 2026;
const YEARS_TO_SHOW = 3;

export function Timeline({ assets, initiatives, milestones, programmes, strategies, dependencies }: TimelineProps) {
  const [colorBy, setColorBy] = useState<'programme' | 'strategy'>('programme');

  // Generate time columns (Quarters)
  const timeColumns = useMemo<{ date: Date; label: string; year: number; quarter: number }[]>(() => {
    const cols: { date: Date; label: string; year: number; quarter: number }[] = [];
    let currentDate = startOfYear(new Date(START_YEAR, 0, 1));
    for (let i = 0; i < YEARS_TO_SHOW * 4; i++) {
      cols.push({
        date: currentDate,
        label: `Q${getQuarter(currentDate)} ${getYear(currentDate)}`,
        year: getYear(currentDate),
        quarter: getQuarter(currentDate),
      });
      currentDate = addQuarters(currentDate, 1);
    }
    return cols;
  }, []);

  const startDate = timeColumns[0].date;
  const endDate = addQuarters(timeColumns[timeColumns.length - 1].date, 1);
  const totalDays = differenceInDays(endDate, startDate);
  const totalWidth = timeColumns.length * CELL_WIDTH;

  // Group assets by category
  const assetsByCategory = useMemo<Record<string, Asset[]>>(() => {
    const grouped: Record<string, Asset[]> = {};
    assets.forEach(a => {
      if (!grouped[a.category]) grouped[a.category] = [];
      grouped[a.category].push(a);
    });
    return grouped;
  }, [assets]);

  // Helper to get position and width
  const getPosition = (dateStr: string) => {
    const date = parseISO(dateStr);
    const daysFromStart = differenceInDays(date, startDate);
    const percentage = (daysFromStart / totalDays) * 100;
    return percentage;
  };

  const getWidth = (startStr: string, endStr: string) => {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    const days = differenceInDays(end, start);
    const percentage = (days / totalDays) * 100;
    return Math.max(0.5, percentage);
  };

  const MIN_ROW_HEIGHT = 100;
  const BAR_HEIGHT = 44;
  const BAR_GAP = 8;
  const ROW_PADDING = 24;

  const layoutAsset = (assetInitiatives: Initiative[]) => {
    const sorted = [...assetInitiatives].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const items: { init: Initiative; top: number; height: number; left: number; width: number }[] = [];
    const placedRects: { start: number; end: number; top: number; bottom: number }[] = [];

    sorted.forEach(init => {
      const left = getPosition(init.startDate);
      const width = getWidth(init.startDate, init.endDate);
      const right = left + width;
      const height = BAR_HEIGHT;
      
      let top = ROW_PADDING;
      let collision = true;
      const candidateTops = [ROW_PADDING];
      placedRects.forEach(r => candidateTops.push(r.bottom + BAR_GAP));
      candidateTops.sort((a, b) => a - b);

      for (const candidateTop of candidateTops) {
        const candidateBottom = candidateTop + height;
        let overlaps = false;
        for (const rect of placedRects) {
          const xOverlap = !(rect.end <= left || rect.start >= right);
          const yOverlap = !(rect.bottom <= candidateTop || rect.top >= candidateBottom);
          if (xOverlap && yOverlap) {
            overlaps = true;
            break;
          }
        }
        if (!overlaps) {
          top = candidateTop;
          collision = false;
          break;
        }
      }

      if (collision) {
         const maxBottom = Math.max(ROW_PADDING, ...placedRects.map(r => r.bottom));
         top = maxBottom + BAR_GAP;
      }

      items.push({ init, top, height, left, width });
      placedRects.push({ start: left, end: right, top, bottom: top + height });
    });

    const contentHeight = Math.max(MIN_ROW_HEIGHT, ...placedRects.map(r => r.bottom)) + ROW_PADDING;
    return { items, height: contentHeight };
  };

  const getConflictPoints = (assetId: string) => {
    const assetInitiatives = initiatives.filter(i => i.assetId === assetId);
    const points: string[] = [];
    for (let i = 0; i < assetInitiatives.length; i++) {
      for (let j = i + 1; j < assetInitiatives.length; j++) {
        const a = assetInitiatives[i];
        const b = assetInitiatives[j];
        if (a.startDate <= b.endDate && a.endDate >= b.startDate) {
           const conflictStart = a.startDate > b.startDate ? a.startDate : b.startDate;
           points.push(conflictStart);
        }
      }
    }
    return Array.from(new Set(points));
  };

  const now = new Date();
  const currentPos = getPosition(now.toISOString());
  const isCurrentTimeVisible = currentPos >= 0 && currentPos <= 100;

  // Calculate all initiative positions for arrows
  const allPlacements = useMemo(() => {
    const placements: Record<string, { top: number; left: number; width: number; height: number; rowTop: number; assetId: string }> = {};
    let currentTotalTop = 48; // Header height

    assets.forEach(asset => {
      // Add category header height if it's the first asset in category
      // This is complex because we map over categories in the render
      // Simplified approach: we'll use a more direct mapping
    });
    
    // Actually, it's easier to calculate these during render or use a ref-based approach
    // but for SVG arrows, we need absolute-ish coordinates relative to the timeline container.
    return placements;
  }, [assets, initiatives]);

  // Refined approach: Map each initiative to its absolute position within the timeline
  const initiativePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number; width: number; height: number }>();
    let currentY = 0; // Header height is handled by sticky, but we need absolute Y in the scrollable area
    
    // We need to mirror the render logic to find exact Y positions
    const categories = Object.keys(assetsByCategory);
    categories.forEach(category => {
      currentY += 25; // Category header height
      const categoryAssets = assetsByCategory[category];
      categoryAssets.forEach(asset => {
        const assetInitiatives = initiatives.filter(i => i.assetId === asset.id);
        const { items, height } = layoutAsset(assetInitiatives);
        
        items.forEach(({ init, top, left, width, height: barHeight }) => {
          positions.set(init.id, {
            x: left,
            y: currentY + top,
            width: width,
            height: barHeight
          });
        });
        
        currentY += height;
      });
    });
    
    return positions;
  }, [assetsByCategory, initiatives]);

  return (
    <div id="timeline-visualiser" className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* Legend & Controls Bar */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white p-3 flex flex-wrap gap-x-6 gap-y-3 items-center text-sm overflow-x-auto">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setColorBy('programme')}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                colorBy === 'programme' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Palette size={14} />
              By Programme
            </button>
            <button 
              onClick={() => setColorBy('strategy')}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                colorBy === 'strategy' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Palette size={14} />
              By Strategy
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex gap-4 items-center">
            <div className="font-semibold text-slate-700 whitespace-nowrap">
              {colorBy === 'programme' ? 'Programmes:' : 'Strategies:'}
            </div>
            {(colorBy === 'programme' ? programmes : strategies).map(item => (
                <div key={item.id} className="flex items-center gap-2 whitespace-nowrap">
                    <div className={cn("w-3 h-3 rounded-full", item.color)} />
                    <span className="text-slate-600">{item.name}</span>
                </div>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="w-6 h-px bg-blue-500 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-[3px] border-y-transparent border-l-[5px] border-l-blue-500" />
                </div>
                <span className="text-slate-600">Dependency</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
                <AlertTriangle size={14} className="text-red-500" />
                <span className="text-slate-600">Conflict</span>
            </div>
          </div>
      </div>

      <div className="flex-1 overflow-auto scroll-smooth">
        <div className="relative min-w-max">
          <div className="flex sticky top-0 z-30 bg-white shadow-sm border-b border-slate-200">
            <div className="sticky left-0 w-64 flex-shrink-0 p-4 font-bold text-slate-700 border-r border-slate-200 bg-slate-50 z-40 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
              IT Asset
            </div>
            <div className="flex" style={{ width: totalWidth }}>
              {timeColumns.map((col, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex-shrink-0 border-r border-slate-100 p-2 text-center text-sm font-medium text-slate-600 bg-white flex flex-col justify-center",
                    col.quarter === 1 && "border-l-2 border-l-slate-300"
                  )}
                  style={{ width: CELL_WIDTH }}
                >
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{col.year}</div>
                  <div>Q{col.quarter}</div>
                </div>
              ))}
            </div>
          </div>

          {isCurrentTimeVisible && (
             <div 
               className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
               style={{ left: `calc(16rem + ${currentPos}%)` }}
             >
               <div className="absolute top-0 -translate-y-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1 rounded">Now</div>
             </div>
          )}

          <div className="flex flex-col relative">
            {/* SVG Layer for arrows */}
            <svg 
              className="absolute inset-0 z-10 pointer-events-none" 
              style={{ width: totalWidth + 256, height: '100%' }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>
              {dependencies.map(dep => {
                const source = initiativePositions.get(dep.sourceId);
                const target = initiativePositions.get(dep.targetId);
                
                if (!source || !target) return null;

                // X positions: source end to target start
                const startX = 256 + (source.x / 100) * totalWidth + (source.width / 100) * totalWidth;
                const endX = 256 + (target.x / 100) * totalWidth;

                // Y positions: based on vertical relationship
                let startY, endY;
                
                if (source.y < target.y) {
                    // Source is above target
                    startY = source.y + source.height;
                    endY = target.y;
                } else if (source.y > target.y) {
                    // Source is below target
                    startY = source.y;
                    endY = target.y + target.height;
                } else {
                    // Same row
                    startY = source.y + source.height / 2;
                    endY = target.y + target.height / 2;
                }
                
                return (
                  <line
                    key={dep.id}
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                    opacity="0.6"
                    strokeDasharray={dep.type === 'related' ? "4 2" : ""}
                  />
                );
              })}
            </svg>

            {Object.entries(assetsByCategory).map(([category, categoryAssets]: [string, Asset[]]) => (
            <div key={category}>
              <div className="sticky left-0 z-20 bg-slate-100 px-4 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 w-full">
                {category}
              </div>

              {categoryAssets.map(asset => {
                const assetInitiatives = initiatives.filter(i => i.assetId === asset.id);
                const assetMilestones = milestones.filter(m => m.assetId === asset.id);
                const conflictPoints = getConflictPoints(asset.id);
                const { items: layoutItems, height: rowHeight } = layoutAsset(assetInitiatives);

                return (
                  <div key={asset.id} className="flex border-b border-slate-200 hover:bg-slate-50 transition-colors group relative">
                    <div 
                        className="sticky left-0 w-64 flex-shrink-0 p-4 border-r border-slate-200 bg-white z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 transition-colors flex flex-col justify-center"
                        style={{ height: rowHeight }}
                    >
                      <div className="font-semibold text-slate-800">{asset.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{assetInitiatives.length} Initiatives</div>
                    </div>

                    <div 
                      className="relative flex-shrink-0"
                      style={{ width: totalWidth, height: rowHeight }}
                    >
                      <div className="absolute inset-0 flex pointer-events-none">
                        {timeColumns.map((col, idx) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "border-r border-slate-100 h-full",
                              col.quarter === 1 && "border-l-2 border-l-slate-200"
                            )}
                            style={{ width: CELL_WIDTH }}
                          />
                        ))}
                      </div>

                      {layoutItems.map(({ init, top, height, left, width }) => {
                        const prog = programmes.find(p => p.id === init.programmeId);
                        const strat = strategies.find(s => s.id === init.strategyId);
                        
                        const colorClass = colorBy === 'programme' 
                          ? (prog?.color || 'bg-slate-500') 
                          : (strat?.color || 'bg-slate-400');

                        const subtitle = colorBy === 'programme' ? prog?.name : strat?.name;

                        if (left + width < 0 || left > 100) return null;

                        return (
                          <div
                            key={init.id}
                            className={cn(
                              "absolute rounded-md shadow-sm border border-white/20 flex flex-col justify-center px-2 text-white overflow-hidden transition-all hover:z-20 hover:shadow-xl cursor-pointer hover:scale-[1.01]",
                              colorClass
                            )}
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              height: height,
                              top: top,
                            }}
                            title={`${init.name}\nProgramme: ${prog?.name}\nStrategy: ${strat?.name}\nBudget: $${(init.budget || 0).toLocaleString()}`}
                          >
                            <div className="font-bold text-[11px] leading-tight drop-shadow-md line-clamp-2">{init.name}</div>
                            {subtitle && width > 5 && <div className="text-[9px] opacity-90 truncate drop-shadow-md mt-0.5">{subtitle}</div>}
                          </div>
                        );
                      })}

                      {conflictPoints.map((date, idx) => {
                         const pos = getPosition(date);
                         if (pos < 0 || pos > 100) return null;
                         return (
                          <div
                            key={`conflict-${idx}`}
                            className="absolute top-0 bottom-0 flex flex-col items-center justify-center group/marker z-30 pointer-events-none"
                            style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                          >
                            <div className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dotted border-red-500/60" />
                            <div className="relative p-1.5 rounded-full shadow-md border-2 border-white bg-red-500 text-white animate-pulse pointer-events-auto">
                                <AlertTriangle size={16} fill="currentColor" />
                            </div>
                            <div className="absolute top-full mt-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-40 pointer-events-none">
                                Conflict Detected
                                <div className="text-[10px] opacity-80">{format(parseISO(date), 'MMM d, yyyy')}</div>
                            </div>
                          </div>
                         );
                      })}

                      {assetMilestones.map(mile => {
                         const pos = getPosition(mile.date);
                         if (pos < 0) return null;
                         if (pos > 100) {
                             return (
                                 <div 
                                    key={mile.id}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-slate-400 text-xs bg-white/80 px-2 py-1 rounded-full border border-slate-200 shadow-sm z-10"
                                    title={`${mile.name} (${format(parseISO(mile.date), 'yyyy-MM-dd')})`}
                                 >
                                     <span className="mr-1 whitespace-nowrap">Future: {mile.name}</span>
                                     <Star size={12} className="text-slate-400" />
                                 </div>
                             )
                         }

                         return (
                          <div
                            key={mile.id}
                            className="absolute top-0 bottom-0 flex flex-col items-center justify-center group/marker z-20"
                            style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                          >
                            <div className="absolute top-0 bottom-0 w-px border-l border-dashed border-slate-400/50 group-hover/marker:border-slate-600" />
                            <div className={cn(
                                "relative p-1.5 rounded-full shadow-md border-2 border-white transition-transform group-hover/marker:scale-110",
                                mile.type === 'critical' ? "bg-red-100 text-red-600" : 
                                mile.type === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                            )}>
                                {mile.type === 'critical' ? <Star size={16} fill="currentColor" /> : <Info size={16} />}
                            </div>
                            <div className="absolute top-full mt-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                                {mile.name}
                                <div className="text-[10px] opacity-70">{format(parseISO(mile.date), 'MMM yyyy')}</div>
                            </div>
                          </div>
                         );
                      })}
                      
                      {assetInitiatives.length === 0 && (
                          <div className="absolute inset-x-4 inset-y-8 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50">
                              <span className="text-slate-400 text-xs font-medium italic flex items-center gap-2">
                                  No active initiatives
                              </span>
                          </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}
