import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings } from '../types';
import { differenceInDays, format, parseISO, addQuarters, getYear, getQuarter, startOfYear, addDays, isValid } from 'date-fns';
import { cn, reorder } from '../lib/utils';
import { AlertTriangle, Star, Info, Palette, ChevronRight, Settings, Grid, Calendar, Target } from 'lucide-react';
import { InitiativePanel } from './InitiativePanel';

interface TimelineProps {
  assets: Asset[];
  initiatives: Initiative[];
  milestones: Milestone[];
  programmes: Programme[];
  strategies: Strategy[];
  dependencies: Dependency[];
  assetCategories: AssetCategory[];
  settings: TimelineSettings;
  onUpdateInitiative?: (initiative: Initiative) => void;
  onAddInitiative?: (initiative: Initiative) => void;
  onUpdateAssets?: (assets: Asset[]) => void;
  onUpdateDependencies?: (dependencies: Dependency[]) => void;
  onUpdateMilestone?: (milestone: Milestone) => void;
  searchQuery?: string;
}

const CELL_WIDTH = 200; // Width of one quarter column

export function Timeline({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, settings, onUpdateInitiative, onAddInitiative, onUpdateAssets, onUpdateDependencies, onUpdateMilestone, searchQuery }: TimelineProps) {
  const [colorBy, setColorBy] = useState<'programme' | 'strategy'>('programme');
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const [resizing, setResizing] = useState<{ id: string; edge: 'start' | 'end'; initialX: number; initialDate: string } | null>(null);
  const [moving, setMoving] = useState<{ id: string; initialX: number; initialY: number; initialStart: string; initialEnd: string } | null>(null);
  const [movingMilestone, setMovingMilestone] = useState<{ id: string; initialX: number; initialDate: string } | null>(null);
  const [drawingDependency, setDrawingDependency] = useState<{
    sourceId: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [draggingCategory, setDraggingCategory] = useState<string | null>(null);
  const [draggingAssetId, setDraggingAssetId] = useState<string | null>(null);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  const [creatingInitiativeParams, setCreatingInitiativeParams] = useState<{ assetId: string, startDate: string, endDate: string } | null>(null);

  const [initiativePositions, setInitiativePositions] = useState<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());

  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize category order
  useEffect(() => {
    const categories = assetCategories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => c.id);
    setCategoryOrder(prev => {
      if (prev.length === 0) return categories;
      const newOrder = [...prev];
      categories.forEach(catId => {
        if (!newOrder.includes(catId)) newOrder.push(catId);
      });
      return newOrder.filter(id => categories.includes(id));
    });
  }, [assetCategories]);

  const filteredInitiatives = useMemo(() => {
    if (!searchQuery) return initiatives;
    const query = searchQuery.toLowerCase();
    return initiatives.filter(init => {
      const matchName = init.name.toLowerCase().includes(query);
      const matchDesc = init.description?.toLowerCase().includes(query);

      const asset = assets.find(a => a.id === init.assetId);
      const matchAsset = asset?.name.toLowerCase().includes(query);

      const programme = programmes.find(p => p.id === init.programmeId);
      const matchProg = programme?.name.toLowerCase().includes(query);

      const strategy = strategies.find(s => s.id === init.strategyId);
      const matchStrat = strategy?.name.toLowerCase().includes(query);

      return matchName || matchDesc || matchAsset || matchProg || matchStrat;
    });
  }, [initiatives, searchQuery, assets, programmes, strategies]);

  // Group assets by category ID
  const assetsByCategory = useMemo<Record<string, Asset[]>>(() => {
    const grouped: Record<string, Asset[]> = {};
    assets.forEach(a => {
      // Hide assets with no matching initiatives when searching
      if (searchQuery) {
        const hasMatchingInitiative = filteredInitiatives.some(i => i.assetId === a.id);
        if (!hasMatchingInitiative) return;
      }

      const catId = a.categoryId || 'uncategorized';
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(a);
    });
    return grouped;
  }, [assets, searchQuery, filteredInitiatives]);

  const sortedCategoryIds = useMemo(() => {
    const categoryIds = Object.keys(assetsByCategory);
    return [...categoryIds].sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [assetsByCategory, categoryOrder]);

  // Drag and drop for assets
  const handleAssetDragStart = (e: React.DragEvent, assetId: string) => {
    setDraggingAssetId(assetId);
    e.dataTransfer.setData('text/plain', assetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleAssetDragOver = (e: React.DragEvent, targetAsset: Asset) => {
    e.preventDefault();
    if (draggingAssetId && draggingAssetId !== targetAsset.id && onUpdateAssets) {
      const draggingAsset = assets.find(a => a.id === draggingAssetId);
      if (draggingAsset && draggingAsset.categoryId === targetAsset.categoryId) {
        const oldIndex = assets.findIndex(a => a.id === draggingAssetId);
        const newIndex = assets.findIndex(a => a.id === targetAsset.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          onUpdateAssets(reorder(assets, oldIndex, newIndex));
        }
      }
    }
  };

  const handleAssetDragEnd = () => {
    setDraggingAssetId(null);
  };

  // Generate time columns (Quarters)
  const timeColumns = useMemo<{ date: Date; label: string; year: number; quarter: number }[]>(() => {
    const cols: { date: Date; label: string; year: number; quarter: number }[] = [];
    let currentDate = startOfYear(new Date(settings.startYear, 0, 1));
    for (let i = 0; i < settings.yearsToShow * 4; i++) {
      cols.push({
        date: currentDate,
        label: `Q${getQuarter(currentDate)} ${getYear(currentDate)} `,
        year: getYear(currentDate),
        quarter: getQuarter(currentDate),
      });
      currentDate = addQuarters(currentDate, 1);
    }
    return cols;
  }, [settings.startYear, settings.yearsToShow]);

  const startDate = timeColumns[0].date;
  const endDate = addQuarters(timeColumns[timeColumns.length - 1].date, 1);
  const totalDays = differenceInDays(endDate, startDate);
  const totalWidth = timeColumns.length * CELL_WIDTH;

  // Helper to get position and width
  const getPosition = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return 0;
      const daysFromStart = differenceInDays(date, startDate);
      const percentage = (daysFromStart / totalDays) * 100;
      return percentage;
    } catch (e) {
      return 0;
    }
  };

  const getWidth = (startStr: string, endStr: string) => {
    try {
      const start = parseISO(startStr);
      const end = parseISO(endStr);
      if (!isValid(start) || !isValid(end)) return 0.5;
      const days = differenceInDays(end, start);
      const percentage = (days / totalDays) * 100;
      return Math.max(0.5, percentage);
    } catch (e) {
      return 0.5;
    }
  };

  const handleRowDoubleClick = (e: React.MouseEvent, assetId: string) => {
    // Avoid triggering if clicking on an existing initiative or milestone
    if ((e.target as HTMLElement).closest('[data-initiative-id]') || (e.target as HTMLElement).closest('[data-milestone-id]')) return;

    const offsetX = e.nativeEvent.offsetX;
    const percentage = (offsetX / totalWidth) * 100;
    const daysFromStart = Math.round((percentage / 100) * totalDays);
    const calculatedStartDate = format(addDays(startDate, daysFromStart), 'yyyy-MM-dd');
    const calculatedEndDate = format(addDays(startDate, daysFromStart + 90), 'yyyy-MM-dd'); // 90 days default duration

    setCreatingInitiativeParams({
      assetId,
      startDate: calculatedStartDate,
      endDate: calculatedEndDate
    });
  };

  const handleResizeStart = (e: React.MouseEvent, id: string, edge: 'start' | 'end', initialDate: string) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing({ id, edge, initialX: e.clientX, initialDate });
  };

  const handleMouseDown = (e: React.MouseEvent, init: Initiative) => {
    // If we click on the edge, handleResizeStart will be called via its own onMouseDown
    // which has e.stopPropagation(). So here we handle move or dependency draw.
    console.log('MouseDown on initiative:', init.id, e.clientX, e.clientY);
    setMoving({
      id: init.id,
      initialX: e.clientX,
      initialY: e.clientY,
      initialStart: init.startDate,
      initialEnd: init.endDate
    });
  };

  const handleMilestoneMouseDown = (e: React.MouseEvent, mile: Milestone) => {
    e.stopPropagation();
    e.preventDefault();
    setMovingMilestone({
      id: mile.id,
      initialX: e.clientX,
      initialDate: mile.date
    });
  };

  const [localInitiatives, setLocalInitiatives] = useState<Initiative[]>(filteredInitiatives);
  const [localMilestones, setLocalMilestones] = useState<Milestone[]>(milestones);

  useEffect(() => {
    if (!resizing && !moving) {
      setLocalInitiatives(filteredInitiatives);
    }
  }, [filteredInitiatives, resizing, moving]);

  useEffect(() => {
    if (!movingMilestone) {
      setLocalMilestones(milestones);
    }
  }, [milestones, movingMilestone]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) {
        const deltaX = e.clientX - resizing.initialX;
        const deltaDays = Math.round((deltaX / totalWidth) * totalDays);

        const initiative = localInitiatives.find(i => i.id === resizing.id);
        if (!initiative) return;

        const newDate = format(addDays(parseISO(resizing.initialDate), deltaDays), 'yyyy-MM-dd');

        const updatedInitiatives = localInitiatives.map(i => {
          if (i.id === resizing.id) {
            const updated = { ...i };
            if (resizing.edge === 'start') {
              if (newDate < i.endDate) updated.startDate = newDate;
            } else {
              if (newDate > i.startDate) updated.endDate = newDate;
            }
            return updated;
          }
          return i;
        });

        setLocalInitiatives(updatedInitiatives);
      } else if (moving) {
        const deltaX = e.clientX - moving.initialX;
        const deltaY = e.clientY - moving.initialY;

        // Mark as dragging if coordinates moved more than a few pixels
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
          isDraggingRef.current = true; // Assuming isDraggingRef is defined elsewhere
        }
        e.preventDefault();

        // If we moved vertically more than 30px, switch to drawing dependency
        if (!drawingDependency && Math.abs(deltaY) > 30) {
          const sourcePos = initiativePositions.get(moving.id);
          if (sourcePos && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const startX = 256 + ((sourcePos.x + sourcePos.width / 2) / 100) * totalWidth;
            const startY = sourcePos.y + sourcePos.height / 2;

            setDrawingDependency({
              sourceId: moving.id,
              startX,
              startY,
              currentX: e.clientX - containerRect.left,
              currentY: e.clientY - containerRect.top
            });
            setMoving(null);
            return;
          }
        }

        // Only update dates if we moved horizontally more than 5px
        if (Math.abs(deltaX) > 5) {
          const deltaDays = Math.round((deltaX / totalWidth) * totalDays);
          const updatedInitiatives = localInitiatives.map(i => {
            if (i.id === moving.id) {
              return {
                ...i,
                startDate: format(addDays(parseISO(moving.initialStart), deltaDays), 'yyyy-MM-dd'),
                endDate: format(addDays(parseISO(moving.initialEnd), deltaDays), 'yyyy-MM-dd'),
              };
            }
            return i;
          });
          setLocalInitiatives(updatedInitiatives);
        }
      } else if (movingMilestone) {
        const deltaX = e.clientX - movingMilestone.initialX;
        const deltaDays = Math.round((deltaX / totalWidth) * totalDays);
        const newDate = format(addDays(parseISO(movingMilestone.initialDate), deltaDays), 'yyyy-MM-dd');

        const updatedMilestones = localMilestones.map(m => {
          if (m.id === movingMilestone.id) {
            return { ...m, date: newDate };
          }
          return m;
        });
        setLocalMilestones(updatedMilestones);
      } else if (drawingDependency) {
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          setDrawingDependency({
            ...drawingDependency,
            currentX: e.clientX - containerRect.left,
            currentY: e.clientY - containerRect.top
          });
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (resizing && onUpdateInitiative) {
        const updated = localInitiatives.find(i => i.id === resizing.id);
        if (updated) onUpdateInitiative(updated);
      } else if (moving && onUpdateInitiative) {
        const updated = localInitiatives.find(i => i.id === moving.id);
        if (updated) onUpdateInitiative(updated);
      } else if (movingMilestone && onUpdateMilestone) {
        const updated = localMilestones.find(m => m.id === movingMilestone.id);
        if (updated) onUpdateMilestone(updated);
      } else if (drawingDependency && onUpdateDependencies) {
        // Find if we released over another initiative
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        const initiativeEl = targetElement?.closest('[data-initiative-id]');
        const targetId = initiativeEl?.getAttribute('data-initiative-id');

        if (targetId && targetId !== drawingDependency.sourceId) {
          const newDependency: Dependency = {
            id: `dep - ${Date.now()} `,
            sourceId: drawingDependency.sourceId,
            targetId: targetId,
            type: 'blocks'
          };
          onUpdateDependencies([...dependencies, newDependency]);
        }
      }
      setResizing(null);
      setMoving(null);
      setMovingMilestone(null);
      setDrawingDependency(null);
      setDraggingCategory(null);
    };

    if (resizing || moving || movingMilestone || drawingDependency) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, moving, movingMilestone, drawingDependency, localInitiatives, localMilestones, totalWidth, totalDays, onUpdateInitiative, onUpdateDependencies, onUpdateMilestone, dependencies, initiativePositions]);

  const handleCategoryDragStart = (e: React.DragEvent, category: string) => {
    setDraggingCategory(category);
    e.dataTransfer.setData('text/plain', category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCategoryDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    if (draggingCategory && draggingCategory !== category) {
      const newOrder = [...categoryOrder];
      const oldIndex = newOrder.indexOf(draggingCategory);
      const newIndex = newOrder.indexOf(category);
      if (oldIndex !== -1 && newIndex !== -1) {
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, draggingCategory);
        setCategoryOrder(newOrder);
      }
    }
  };

  const handleCategoryDragEnd = () => {
    setDraggingCategory(null);
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

      let height = BAR_HEIGHT;
      if (settings.budgetVisualisation === 'bar-height' && init.budget) {
        // Simple scaling: 44px base + 1px per $15k, max 120px
        height = Math.min(120, BAR_HEIGHT + (init.budget / 15000));
      }

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

  // Keep track of initiative positions for dependency drawing
  useEffect(() => {
    const positions = new Map<string, { x: number; y: number; width: number; height: number }>();
    let currentY = 0;

    // We need to mirror the rendering loop to calculate Y offsets
    // This is slightly complex because of the scrollable area
    // For now, we'll use a simplified version or use refs
    // Let's use a simpler approach: the dependency renderer already uses initiativePositions
    // which were previously calculated. We need to populate it.

    sortedCategoryIds.forEach(catId => {
      currentY += 26; // category header height
      const categoryAssets = assetsByCategory[catId];
      categoryAssets.forEach(asset => {
        const assetInitiatives = initiatives.filter(i => i.assetId === asset.id);
        const { items, height } = layoutAsset(assetInitiatives);
        items.forEach(item => {
          positions.set(item.init.id, {
            x: item.left,
            y: currentY + item.top,
            width: item.width,
            height: item.height
          });
        });
        currentY += height;
      });
    });
    setInitiativePositions(positions);
  }, [initiatives, assets, totalWidth, sortedCategoryIds, assetsByCategory]);


  const getConflictPoints = (assetId: string) => {
    const assetInitiatives = localInitiatives.filter(i => i.assetId === assetId);
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

  return (
    <div id="timeline-visualiser" ref={timelineRef} className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden">

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
                  data-testid={`timeline-col-${col.year}-q${col.quarter}`}
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
              style={{ left: `calc(16rem + ${currentPos} %)` }}
            >
              <div className="absolute top-0 -translate-y-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1 rounded">Now</div>
            </div>
          )}

          <div className="flex flex-col relative" ref={containerRef}>
            <svg
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ width: totalWidth + 256, height: '100%' }}
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>
              {dependencies.map(dep => {
                const source = initiativePositions.get(dep.sourceId);
                const target = initiativePositions.get(dep.targetId);
                if (!source || !target) return null;

                const sEndX = 256 + ((source.x + source.width) / 100) * totalWidth;
                const tStartX = 256 + (target.x / 100) * totalWidth;
                const sMidY = source.y + source.height / 2;
                const tMidY = target.y + target.height / 2;

                let path;
                let labelX, labelY;

                if (sEndX >= tStartX && 256 + (source.x / 100) * totalWidth <= 256 + ((target.x + target.width) / 100) * totalWidth) {
                  const overlapX = (Math.max(256 + (source.x / 100) * totalWidth, tStartX) + Math.min(sEndX, 256 + ((target.x + target.width) / 100) * totalWidth)) / 2;
                  const startY = source.y < target.y ? source.y + source.height : source.y;
                  const endY = source.y < target.y ? target.y : target.y + target.height;
                  path = `M ${overlapX} ${startY} L ${overlapX} ${endY} `;
                  labelX = overlapX + 5;
                  labelY = (startY + endY) / 2;
                } else {
                  const midX = (sEndX + tStartX) / 2;
                  path = `M ${sEndX} ${sMidY} L ${midX} ${sMidY} L ${midX} ${tMidY} L ${tStartX} ${tMidY} `;
                  labelX = midX;
                  labelY = (sMidY + tMidY) / 2;
                }

                return (
                  <React.Fragment key={dep.id}>
                    <path
                      d={path}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                      opacity="0.6"
                      strokeDasharray={dep.type === 'related' ? "4 2" : ""}
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      fill="#3b82f6"
                      fontSize="9"
                      fontWeight="bold"
                      className="select-none pointer-events-none"
                      textAnchor="middle"
                      style={{ filter: 'drop-shadow(0px 0px 2px white)' }}
                    >
                      {dep.type}
                    </text>
                  </React.Fragment>
                );
              })}

              {/* Live drawing arrow */}
              {drawingDependency && (
                <path
                  d={`M ${drawingDependency.startX} ${drawingDependency.startY} L ${drawingDependency.currentX} ${drawingDependency.currentY} `}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  opacity="0.8"
                  strokeDasharray="5 5"
                />
              )}
            </svg>

            {sortedCategoryIds.map((catId) => {
              const category = assetCategories.find(c => c.id === catId);
              const categoryName = category?.name || 'Uncategorized';
              const categoryAssets = assetsByCategory[catId];
              return (
                <div key={catId} onDragOver={(e) => handleCategoryDragOver(e, catId)}>
                  <div
                    draggable
                    onDragStart={(e) => handleCategoryDragStart(e, catId)}
                    onDragEnd={handleCategoryDragEnd}
                    className={cn(
                      "sticky left-0 z-20 bg-slate-100 px-4 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 w-full flex items-center gap-2 cursor-grab active:cursor-grabbing",
                      draggingCategory === catId && "opacity-50"
                    )}
                  >
                    <div className="p-0.5 hover:bg-slate-200 rounded text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                    </div>
                    {categoryName}
                  </div>

                  {categoryAssets.map(asset => {
                    const assetInitiatives = localInitiatives.filter(i => i.assetId === asset.id);
                    const assetMilestones = milestones.filter(m => m.assetId === asset.id);
                    const conflictPoints = getConflictPoints(asset.id);
                    const { items: layoutItems, height: rowHeight } = layoutAsset(assetInitiatives);
                    return (
                      <div
                        key={asset.id}
                        className={cn(
                          "flex border-b border-slate-200 hover:bg-slate-50 transition-colors group relative",
                          draggingAssetId === asset.id && "opacity-50"
                        )}
                        onDragOver={(e) => handleAssetDragOver(e, asset)}
                      >
                        {/* Asset Name Sidebar (Sticky Left) */}
                        <div
                          draggable
                          onDragStart={(e) => handleAssetDragStart(e, asset.id)}
                          onDragEnd={handleAssetDragEnd}
                          className="sticky left-0 w-64 flex-shrink-0 p-4 border-r border-slate-200 bg-white z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 transition-colors flex flex-col justify-center cursor-grab active:cursor-grabbing"
                          style={{ height: rowHeight }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-0.5 hover:bg-slate-100 rounded text-slate-300 group-hover:text-slate-400">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                            </div>
                            <div className="font-semibold text-slate-800">{asset.name}</div>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 ml-4">{assetInitiatives.length} Initiatives</div>
                        </div>


                        <div
                          className="relative flex-shrink-0"
                          style={{ width: totalWidth, height: rowHeight }}
                          onDoubleClick={(e) => handleRowDoubleClick(e, asset.id)}
                        >
                          <div className="absolute inset-0 flex pointer-events-none">
                            {timeColumns.map((col, idx) => (
                              <div key={idx} className={cn("border-r border-slate-100 h-full", col.quarter === 1 && "border-l-2 border-l-slate-200")} style={{ width: CELL_WIDTH }} />
                            ))}
                          </div>

                          {layoutItems.map(({ init, top, height, left, width }) => {
                            const prog = programmes.find(p => p.id === init.programmeId);
                            const strat = strategies.find(s => s.id === init.strategyId);
                            const colorClass = colorBy === 'programme' ? (prog?.color || 'bg-slate-500') : (strat?.color || 'bg-slate-400');
                            const subtitle = colorBy === 'programme' ? prog?.name : strat?.name;

                            if (left + width < 0 || left > 100) return null;

                            return (
                              <div
                                key={init.id}
                                data-initiative-id={init.id}
                                onMouseDown={(e) => {
                                  isDraggingRef.current = false;
                                  setMoving({
                                    id: init.id,
                                    initialX: e.clientX,
                                    initialY: e.clientY,
                                    initialStart: init.startDate,
                                    initialEnd: init.endDate
                                  });
                                }}
                                onClick={(e) => {
                                  // Prevent clicking if we just finished a drag
                                  if (isDraggingRef.current) {
                                    isDraggingRef.current = false;
                                    return;
                                  }
                                  setSelectedInitiativeId(init.id);
                                }}
                                className={cn(
                                  "absolute rounded-md shadow-sm border border-white/20 flex flex-col justify-center px-2 text-white overflow-hidden transition-all hover:z-20 hover:shadow-xl cursor-pointer group/item select-none",
                                  colorClass
                                )}
                                style={{ left: `${left}%`, width: `${width}%`, height: height, top: top }}
                                title={`${init.name}\nProgramme: ${prog?.name}\nStrategy: ${strat?.name}\nBudget: $${(init.budget || 0).toLocaleString()}${init.description ? `\n${init.description}` : ''}`}
                              >
                                <div draggable="false" className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/30 z-10" onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, init.id, 'start', init.startDate); }} />
                                <div draggable="false" className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/30 z-10" onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, init.id, 'end', init.endDate); }} />

                                <div className="flex items-start justify-between gap-2 overflow-hidden h-full py-1">
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <div draggable="false" className="font-bold text-[11px] leading-tight drop-shadow-md line-clamp-2">{init.name}</div>
                                    {subtitle && width > 5 && <div draggable="false" className="text-[9px] opacity-90 truncate drop-shadow-md mt-0.5">{subtitle}</div>}
                                  </div>

                                  {settings.budgetVisualisation === 'label' && init.budget > 0 && (
                                    <div className="flex-shrink-0 text-[10px] font-bold bg-white/20 px-1 rounded backdrop-blur-[2px] self-center">
                                      ${init.budget >= 1000000
                                        ? `${(init.budget / 1000000).toFixed(1)}m`
                                        : `${Math.round(init.budget / 1000)}k`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {conflictPoints.map((date, idx) => {
                            const pos = getPosition(date);
                            if (pos < 0 || pos > 100) return null;
                            return (
                              <div key={`conflict-${idx}`} className="absolute top-0 bottom-0 flex flex-col items-center justify-center group/marker z-30 pointer-events-none" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
                                <div className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dotted border-red-500/60" />
                                <div className="relative p-1.5 rounded-full shadow-md border-2 border-white bg-red-500 text-white animate-pulse pointer-events-auto">
                                  <AlertTriangle size={16} fill="currentColor" />
                                </div>
                              </div>
                            );
                          })}

                          {assetMilestones.map(mile => {
                            const currentMile = localMilestones.find(m => m.id === mile.id) || mile;
                            const pos = getPosition(currentMile.date);
                            if (pos < 0 || pos > 100) return null;
                            return (
                              <div
                                key={mile.id}
                                onMouseDown={(e) => handleMilestoneMouseDown(e, mile)}
                                className="absolute top-0 bottom-0 flex flex-col items-center justify-center group/marker z-20 cursor-grab active:cursor-grabbing"
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
                                <div className="absolute left-full ml-2 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-slate-200 shadow-sm opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap z-40 pointer-events-none">
                                  <div className="text-[10px] font-bold text-slate-800 leading-none">{mile.name}</div>
                                  <div className="text-[8px] text-slate-500 mt-0.5">{format(parseISO(currentMile.date), 'MMM yyyy')}</div>
                                </div>
                                {/* Always visible label */}
                                <div className="absolute top-full mt-1 bg-white/40 px-1 rounded text-[9px] font-semibold text-slate-700 whitespace-nowrap pointer-events-none">
                                  {mile.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <InitiativePanel
        isOpen={selectedInitiativeId !== null || creatingInitiativeParams !== null}
        onClose={() => {
          setSelectedInitiativeId(null);
          setCreatingInitiativeParams(null);
        }}
        initiative={
          selectedInitiativeId
            ? initiatives.find(i => i.id === selectedInitiativeId) || null
            : creatingInitiativeParams
              ? {
                id: `init-new-${Date.now()}`,
                name: '',
                description: '',
                assetId: creatingInitiativeParams.assetId,
                programmeId: programmes[0]?.id || '',
                strategyId: strategies[0]?.id || '',
                startDate: creatingInitiativeParams.startDate,
                endDate: creatingInitiativeParams.endDate,
                budget: 0,
              }
              : null
        }
        assets={assets}
        programmes={programmes}
        strategies={strategies}
        onSave={(initiative) => {
          if (selectedInitiativeId) {
            if (onUpdateInitiative) onUpdateInitiative(initiative);
          } else {
            if (onAddInitiative) onAddInitiative(initiative);
          }
          setSelectedInitiativeId(null);
          setCreatingInitiativeParams(null);
        }}
      />
    </div>
  );
}
