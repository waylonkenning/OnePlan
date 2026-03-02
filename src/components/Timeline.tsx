import React, { useMemo } from 'react';
import { Asset, Initiative, Milestone, Programme } from '../types';
import { differenceInDays, format, parseISO, addQuarters, getYear, getQuarter, startOfYear, isBefore, isAfter } from 'date-fns';
import { cn } from '../lib/utils';
import { AlertTriangle, Star, Info, DollarSign } from 'lucide-react';

interface TimelineProps {
  assets: Asset[];
  initiatives: Initiative[];
  milestones: Milestone[];
  programmes: Programme[];
}

const CELL_WIDTH = 200; // Width of one quarter column
const ROW_HEIGHT = 160; // Height of an asset row
const START_YEAR = 2026;
const YEARS_TO_SHOW = 3; // Changed from 4 to 3 as requested

export function Timeline({ assets, initiatives, milestones, programmes }: TimelineProps) {
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
    return percentage; // Can be negative or > 100
  };

  const getWidth = (startStr: string, endStr: string) => {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    const days = differenceInDays(end, start);
    const percentage = (days / totalDays) * 100;
    return Math.max(0.5, percentage); // Min width for visibility
  };

  // Helper to get height based on budget
  const maxBudget = Math.max(...initiatives.map(i => i.budget), 100000);
  
  // Constants for layout
  const MIN_ROW_HEIGHT = 100;
  const BAR_MIN_HEIGHT = 24;
  const BAR_MAX_HEIGHT = 60;
  const BAR_GAP = 8;
  const ROW_PADDING = 24;

  const getBarHeightPx = (budget: number) => {
    return (budget / maxBudget) * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT) + BAR_MIN_HEIGHT;
  };

  // Layout algorithm for an asset's initiatives
  const layoutAsset = (assetInitiatives: Initiative[]) => {
    // Sort by start date
    const sorted = [...assetInitiatives].sort((a, b) => a.startDate.localeCompare(b.startDate));
    
    const items: { init: Initiative; top: number; height: number; left: number; width: number }[] = [];
    
    // Track occupied spaces: { start: number, end: number, top: number, bottom: number }
    // We use percentage for start/end (x-axis) and pixels for top/bottom (y-axis)
    const placedRects: { start: number; end: number; top: number; bottom: number }[] = [];

    sorted.forEach(init => {
      const left = getPosition(init.startDate);
      const width = getWidth(init.startDate, init.endDate);
      const right = left + width;
      const height = getBarHeightPx(init.budget);
      
      let top = ROW_PADDING;
      let collision = true;

      // Simple greedy placement: try to place as high as possible
      // We check candidate Y positions: ROW_PADDING, and (existing.bottom + GAP)
      const candidateTops = [ROW_PADDING];
      placedRects.forEach(r => candidateTops.push(r.bottom + BAR_GAP));
      candidateTops.sort((a, b) => a - b);

      for (const candidateTop of candidateTops) {
        const candidateBottom = candidateTop + height;
        let overlaps = false;

        for (const rect of placedRects) {
          // Check intersection
          // X overlap: !(rect.end <= left || rect.start >= right)
          // Y overlap: !(rect.bottom <= candidateTop || rect.top >= candidateBottom)
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

      // If somehow we didn't find a spot (shouldn't happen with the logic above as we add new candidates), default to bottom
      if (collision) {
         // This fallback shouldn't be reached if we iterate all candidates correctly
         // But just in case, place at bottom of last placed
         const maxBottom = Math.max(ROW_PADDING, ...placedRects.map(r => r.bottom));
         top = maxBottom + BAR_GAP;
      }

      items.push({ init, top, height, left, width });
      placedRects.push({ start: left, end: right, top, bottom: top + height });
    });

    const contentHeight = Math.max(MIN_ROW_HEIGHT, ...placedRects.map(r => r.bottom)) + ROW_PADDING;
    return { items, height: contentHeight };
  };

  // Conflict detection - Returns array of conflict start dates
  const getConflictPoints = (assetId: string) => {
    const assetInitiatives = initiatives.filter(i => i.assetId === assetId);
    const points: string[] = []; // Array of ISO date strings

    for (let i = 0; i < assetInitiatives.length; i++) {
      for (let j = i + 1; j < assetInitiatives.length; j++) {
        const a = assetInitiatives[i];
        const b = assetInitiatives[j];

        // Check overlap
        if (a.startDate <= b.endDate && a.endDate >= b.startDate) {
           // Conflict starts at the later of the two start dates
           // We use string comparison for ISO dates which works, but let's be safe with date-fns if needed
           // Actually ISO string comparison is safe for YYYY-MM-DD
           const conflictStart = a.startDate > b.startDate ? a.startDate : b.startDate;
           points.push(conflictStart);
        }
      }
    }
    // Deduplicate points
    return Array.from(new Set(points));
  };

  // Current time position
  const now = new Date();
  const currentPos = getPosition(now.toISOString());
  const isCurrentTimeVisible = currentPos >= 0 && currentPos <= 100;

  return (
    <div id="timeline-visualiser" className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* Legend Bar - Fixed at top */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white p-3 flex gap-6 items-center text-sm overflow-x-auto">
          <div className="font-semibold text-slate-700 whitespace-nowrap">Programmes:</div>
          {programmes.map(p => (
              <div key={p.id} className="flex items-center gap-2 whitespace-nowrap">
                  <div className={cn("w-3 h-3 rounded-full", p.color)} />
                  <span>{p.name}</span>
              </div>
          ))}
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <div className="flex items-center gap-2 whitespace-nowrap">
              <AlertTriangle size={14} className="text-red-500" />
              <span>Change Conflict</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="h-4 w-1 bg-slate-300 rounded-full" />
              <span>Height = Spend</span>
          </div>
      </div>

      {/* Scrollable Timeline Area */}
      <div className="flex-1 overflow-auto relative scroll-smooth">
        
        {/* Header Row (Sticky Top) */}
        <div className="flex min-w-max sticky top-0 z-30 bg-white shadow-sm border-b border-slate-200">
          <div className="sticky left-0 w-64 flex-shrink-0 p-4 font-bold text-slate-700 border-r border-slate-200 bg-slate-50 z-40 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
            IT Asset
          </div>
          <div className="flex" style={{ width: totalWidth }}>
            {timeColumns.map((col, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex-shrink-0 border-r border-slate-100 p-2 text-center text-sm font-medium text-slate-600 bg-white flex flex-col justify-center",
                  col.quarter === 1 && "border-l-2 border-l-slate-300" // Emphasize start of year
                )}
                style={{ width: CELL_WIDTH }}
              >
                <div className="text-xs text-slate-400 uppercase tracking-wider">{col.year}</div>
                <div>Q{col.quarter}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Time Indicator Line (Absolute over the whole scrollable area) */}
        {isCurrentTimeVisible && (
           <div 
             className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
             style={{ left: `calc(16rem + ${currentPos}%)` }} // 16rem is w-64 (sidebar width)
           >
             <div className="absolute -top-1 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1 rounded">Now</div>
           </div>
        )}

        {/* Body Rows */}
        <div className="flex flex-col min-w-max">
          {Object.entries(assetsByCategory).map(([category, categoryAssets]: [string, Asset[]]) => (
            <div key={category}>
              {/* Category Header (Sticky Left, but scrolls with Y) */}
              <div className="sticky left-0 z-20 bg-slate-100 px-4 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 w-full">
                {category}
              </div>

              {categoryAssets.map(asset => {
                const assetInitiatives = initiatives.filter(i => i.assetId === asset.id);
                const assetMilestones = milestones.filter(m => m.assetId === asset.id);
                const conflictPoints = getConflictPoints(asset.id);
                
                // Calculate layout
                const { items: layoutItems, height: rowHeight } = layoutAsset(assetInitiatives);

                return (
                  <div key={asset.id} className="flex border-b border-slate-200 hover:bg-slate-50 transition-colors group relative">
                    {/* Asset Name Sidebar (Sticky Left) */}
                    <div 
                        className="sticky left-0 w-64 flex-shrink-0 p-4 border-r border-slate-200 bg-white z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 transition-colors flex flex-col justify-center"
                        style={{ height: rowHeight }}
                    >
                      <div className="font-semibold text-slate-800">{asset.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{assetInitiatives.length} Initiatives</div>
                    </div>

                    {/* Timeline Row Content */}
                    <div 
                      className="relative flex-shrink-0"
                      style={{ width: totalWidth, height: rowHeight }}
                    >
                      {/* Grid Lines */}
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

                      {/* Initiatives */}
                      {layoutItems.map(({ init, top, height, left, width }) => {
                        const prog = programmes.find(p => p.id === init.programmeId);
                        
                        // Skip if completely off-screen
                        if (left + width < 0 || left > 100) return null;

                        return (
                          <div
                            key={init.id}
                            className={cn(
                              "absolute rounded-md shadow-sm border border-white/20 flex flex-col justify-center px-3 text-white overflow-hidden transition-all hover:z-20 hover:shadow-xl cursor-pointer hover:scale-[1.01]",
                              prog?.color || 'bg-slate-500'
                            )}
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              height: height,
                              top: top,
                              // transform: 'translateY(-50%)' // Removed centering transform
                            }}
                            title={`${init.name} - ${prog?.name}\nBudget: $${init.budget.toLocaleString()}\n${init.startDate} to ${init.endDate}`}
                          >
                            <div className="font-bold text-xs truncate leading-tight drop-shadow-md">{init.name}</div>
                            <div className="text-[10px] opacity-90 truncate drop-shadow-md">{prog?.name}</div>
                          </div>
                        );
                      })}

                      {/* Conflict Markers */}
                      {conflictPoints.map((date, idx) => {
                         const pos = getPosition(date);
                         // Skip if off-screen
                         if (pos < 0 || pos > 100) return null;

                         return (
                          <div
                            key={`conflict-${idx}`}
                            className="absolute top-0 bottom-0 flex flex-col items-center justify-center group/marker z-30 pointer-events-none"
                            style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                          >
                            {/* Vertical Line */}
                            <div className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dotted border-red-500/60" />
                            
                            {/* Icon */}
                            <div className="relative p-1.5 rounded-full shadow-md border-2 border-white bg-red-500 text-white animate-pulse pointer-events-auto">
                                <AlertTriangle size={16} fill="currentColor" />
                            </div>

                            {/* Tooltip */}
                            <div className="absolute top-full mt-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-40 pointer-events-none">
                                Conflict Detected
                                <div className="text-[10px] opacity-80">{format(parseISO(date), 'MMM d, yyyy')}</div>
                            </div>
                          </div>
                         );
                      })}

                      {/* Milestones */}
                      {assetMilestones.map(mile => {
                         const pos = getPosition(mile.date);
                         const isFuture = pos > 100;
                         const isPast = pos < 0;
                         
                         if (isPast) return null;

                         if (isFuture) {
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
                            {/* Vertical Line */}
                            <div className="absolute top-0 bottom-0 w-px border-l border-dashed border-slate-400/50 group-hover/marker:border-slate-600" />
                            
                            {/* Icon */}
                            <div className={cn(
                                "relative p-1.5 rounded-full shadow-md border-2 border-white transition-transform group-hover/marker:scale-110",
                                mile.type === 'critical' ? "bg-red-100 text-red-600" : 
                                mile.type === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                            )}>
                                {mile.type === 'critical' ? <Star size={16} fill="currentColor" /> : <Info size={16} />}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute top-full mt-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                                {mile.name}
                                <div className="text-[10px] opacity-70">{format(parseISO(mile.date), 'MMM yyyy')}</div>
                            </div>
                          </div>
                         );
                      })}
                      
                      {/* Empty State */}
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
  );
}

