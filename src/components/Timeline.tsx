import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings } from '../types';
import { differenceInDays, format, parseISO, addQuarters, getYear, getQuarter, startOfYear, addDays, isValid, startOfMonth, endOfMonth, lastDayOfMonth, addMonths, addWeeks } from 'date-fns';
import { cn, reorder } from '../lib/utils';
import { AlertTriangle, Star, Info, Palette, ChevronRight, ChevronDown, Settings, Grid, Calendar, Target } from 'lucide-react';
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
  onDeleteInitiative?: (initiative: Initiative) => void;
  searchQuery?: string;
}

const SIDEBAR_WIDTH = 256; // 16rem in pixels

export function Timeline({ assets, initiatives, milestones, programmes, strategies, dependencies, assetCategories, settings, onUpdateInitiative, onAddInitiative, onUpdateAssets, onUpdateDependencies, onUpdateMilestone, onDeleteInitiative, searchQuery }: TimelineProps) {
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
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem('oneplan-collapsed-categories');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      sessionStorage.setItem('oneplan-collapsed-categories', JSON.stringify([...next]));
      return next;
    });
  };

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

  // Container width for dynamic column sizing
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width - SIDEBAR_WIDTH);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Local state for dragging operations
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

  // Generate time columns based on monthsToShow and latest data point
  const timeColumns = useMemo<{ date: Date; endDate: Date; label: string; sublabel: string }[]>(() => {
    const cols: { date: Date; endDate: Date; label: string; sublabel: string }[] = [];
    const ms = settings.monthsToShow || 36;
    const timelineStart = startOfYear(new Date(settings.startYear, 0, 1));

    // Find the latest end date among all initiatives and milestones to ensure the grid covers it
    let maxEndDate = timelineStart;
    if (localInitiatives.length > 0 || milestones.length > 0) {
      const initDates = localInitiatives.map(i => new Date(i.endDate).getTime());
      const mileDates = milestones.map(m => new Date(m.date).getTime());
      const maxTime = Math.max(...initDates, ...mileDates, timelineStart.getTime());
      maxEndDate = new Date(maxTime);
    }

    // minTimelineEnd ensures we AT LEAST render the requested duration (3/6/12/24/36 months)
    const minTimelineEnd = addMonths(timelineStart, ms);
    const timelineEnd = maxEndDate > minTimelineEnd ? maxEndDate : minTimelineEnd;

    if (ms === 3) {
      // Weekly columns
      let d = timelineStart;
      let i = 0;
      while (d < timelineEnd || i < 12) { // Guarantee at least 12 columns
        cols.push({ date: d, endDate: addWeeks(d, 1), label: format(d, 'dd MMM'), sublabel: `Wk ${i + 1}` });
        d = addWeeks(d, 1);
        i++;
      }
    } else if (ms === 6) {
      // Half-month columns
      let i = 0;
      let d = timelineStart;
      while (d < timelineEnd || i < 12) {
        const monthIdx = Math.floor(i / 2);
        const isSecondHalf = i % 2 === 1;
        const monthStart = addMonths(timelineStart, monthIdx);
        const currentD = isSecondHalf ? addDays(monthStart, 15) : monthStart;
        const nextD = isSecondHalf ? addMonths(timelineStart, monthIdx + 1) : addDays(monthStart, 15);
        cols.push({ date: currentD, endDate: nextD, label: format(currentD, 'MMM yyyy'), sublabel: isSecondHalf ? '16-end' : '1-15' });
        d = nextD;
        i++;
      }
    } else if (ms === 12) {
      // Monthly columns
      let d = timelineStart;
      let i = 0;
      while (d < timelineEnd || i < 12) {
        cols.push({ date: d, endDate: addMonths(d, 1), label: format(d, 'yyyy'), sublabel: format(d, 'MMM') });
        d = addMonths(d, 1);
        i++;
      }
    } else if (ms === 24) {
      // Quarterly columns
      let d = timelineStart;
      let i = 0;
      while (d < timelineEnd || i < 8) {
        cols.push({ date: d, endDate: addQuarters(d, 1), label: `${getYear(d)}`, sublabel: `Q${getQuarter(d)}` });
        d = addQuarters(d, 1);
        i++;
      }
    } else {
      // 36 months = Quarterly columns
      let d = timelineStart;
      let i = 0;
      while (d < timelineEnd || i < 12) {
        cols.push({ date: d, endDate: addQuarters(d, 1), label: `${getYear(d)}`, sublabel: `Q${getQuarter(d)}` });
        d = addQuarters(d, 1);
        i++;
      }
    }
    return cols;
  }, [settings.startYear, settings.monthsToShow, localInitiatives, milestones]);

  const startDate = timeColumns[0].date;
  const endDate = timeColumns[timeColumns.length - 1].endDate;
  const totalDays = differenceInDays(endDate, startDate);
  const totalWidth = Math.max(containerWidth, timeColumns.length * 80); // Min 80px per column
  const columnWidth = totalWidth / timeColumns.length;

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


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) {
        const deltaX = e.clientX - resizing.initialX;
        if (Math.abs(deltaX) > 3) {
          isDraggingRef.current = true;
        }
        const deltaDays = Math.round((deltaX / totalWidth) * totalDays);

        const initiative = localInitiatives.find(i => i.id === resizing.id);
        if (!initiative) return;

        const rawNewDate = addDays(parseISO(resizing.initialDate), deltaDays);
        let snappedDate = rawNewDate;
        if (settings.snapToPeriod === 'month') {
          snappedDate = resizing.edge === 'start' ? startOfMonth(rawNewDate) : lastDayOfMonth(rawNewDate);
        }
        const newDate = format(snappedDate, 'yyyy-MM-dd');

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
            const startX = sourcePos.x + sourcePos.width / 2;
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
              const rawStart = addDays(parseISO(moving.initialStart), deltaDays);
              const snappedStart = settings.snapToPeriod === 'month' ? startOfMonth(rawStart) : rawStart;
              const actualDeltaDays = differenceInDays(snappedStart, parseISO(moving.initialStart));
              const rawEnd = addDays(parseISO(moving.initialEnd), actualDeltaDays);
              const snappedEnd = settings.snapToPeriod === 'month' ? lastDayOfMonth(rawEnd) : rawEnd;

              return {
                ...i,
                startDate: format(snappedStart, 'yyyy-MM-dd'),
                endDate: format(snappedEnd, 'yyyy-MM-dd'),
              };
            }
            return i;
          });
          setLocalInitiatives(updatedInitiatives);
        }
      } else if (movingMilestone) {
        const deltaX = e.clientX - movingMilestone.initialX;
        const deltaDays = Math.round((deltaX / totalWidth) * totalDays);
        const rawNewDate = addDays(parseISO(movingMilestone.initialDate), deltaDays);
        const snappedDate = settings.snapToPeriod === 'month' ? startOfMonth(rawNewDate) : rawNewDate;
        const newDate = format(snappedDate, 'yyyy-MM-dd');

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
    const placedRects: { id: string; start: number; end: number; top: number; bottom: number }[] = [];

    // Check if there are dependencies between initiatives in this specific asset
    const hasIntraAssetDependencies = dependencies.some(dep =>
      assetInitiatives.some(i => i.id === dep.sourceId) &&
      assetInitiatives.some(i => i.id === dep.targetId)
    );
    const dynamicGap = hasIntraAssetDependencies ? 32 : BAR_GAP;

    sorted.forEach(init => {
      const left = getPosition(init.startDate);
      const width = getWidth(init.startDate, init.endDate);
      const right = left + width;

      let budgetHeight = BAR_HEIGHT;
      if (settings.budgetVisualisation === 'bar-height' && init.budget) {
        // Simple scaling: 44px base + 1px per $15k, max 120px
        budgetHeight = Math.min(120, BAR_HEIGHT + (init.budget / 15000));
      }

      let descHeight = BAR_HEIGHT;
      if (settings.descriptionDisplay === 'on' && init.description) {
        // Calculate exact height needed: py-1 (8px) + name (14px) + subtitle (16px) + desc spacing (8px)
        const hasSubtitle = init.programmeId || init.strategyId;
        const baseHeight = hasSubtitle ? 46 : 30;

        // Estimate characters per line based on bar width (approx 4 chars per % of width)
        const charsPerLine = Math.max(20, Math.floor(width * 4));
        const lines = Math.ceil(init.description.length / charsPerLine);
        const clampedLines = Math.min(3, lines); // We use line-clamp-3

        descHeight = Math.max(BAR_HEIGHT, baseHeight + clampedLines * 12 + 4); // 12px per line + 4px buffer
      }

      const height = Math.max(budgetHeight, descHeight, BAR_HEIGHT);

      let top = ROW_PADDING;
      let collision = true;
      const candidateTops = [ROW_PADDING];
      placedRects.forEach(r => candidateTops.push(r.bottom + dynamicGap));
      candidateTops.sort((a, b) => a - b);

      for (const candidateTop of candidateTops) {
        const candidateBottom = candidateTop + height;
        let overlaps = false;
        for (const rect of placedRects) {
          // If there's a dependency, we treat it as an overlap to force separate rows
          const hasDep = dependencies.some(d =>
            (d.sourceId === init.id && d.targetId === rect.id) ||
            (d.sourceId === rect.id && d.targetId === init.id)
          );

          const xOverlap = hasDep || !(rect.end <= left || rect.start >= right);
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
        top = maxBottom + dynamicGap;
      }

      items.push({ init, top, height, left, width });
      placedRects.push({ id: init.id, start: left, end: right, top, bottom: top + height });
    });

    const contentHeight = Math.max(MIN_ROW_HEIGHT, ...placedRects.map(r => r.bottom)) + ROW_PADDING;

    // Vertically center the content within the row
    if (items.length > 0) {
      const contentTop = Math.min(...items.map(i => i.top));
      const contentBottom = Math.max(...items.map(i => i.top + i.height));
      const contentSpan = contentBottom - contentTop;
      const offset = (contentHeight - contentSpan) / 2 - contentTop;
      items.forEach(item => { item.top += offset; });
    }

    return { items, height: contentHeight };
  };

  // Keep track of initiative positions for dependency drawing
  // Keep track of initiative positions for dependency drawing by reading the actual DOM rects.
  // This completely eliminates drift caused by borders, margins, or dynamic rendering.
  useEffect(() => {
    if (!containerRef.current) return;

    // We need to wait for the DOM to paint so we can read rects.
    // A small timeout ensures the React render loop has painted the DOM nodes before we measure.
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const positions = new Map<string, { x: number; y: number; width: number; height: number; assetId?: string }>();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Find every initiative block drawn in the DOM
      const elements = containerRef.current.querySelectorAll('[data-initiative-id]');

      elements.forEach((el) => {
        const initId = el.getAttribute('data-initiative-id');
        if (initId) {
          const rect = el.getBoundingClientRect();
          positions.set(initId, {
            // Calculate the true offset inside the relative container
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height,
          });
        }
      });

      setInitiativePositions(positions);
    }, 50);

    return () => clearTimeout(timer);
  }, [localInitiatives, assets, totalWidth, sortedCategoryIds, assetsByCategory, settings, collapsedCategories, dependencies]);

  const formatOverlapDuration = (days: number) => {
    if (settings.monthsToShow <= 3) {
      const weeks = Math.max(1, Math.round(days / 7));
      return `${weeks} Week${weeks !== 1 ? 's' : ''}`;
    } else if (settings.monthsToShow === 6) {
      const halfMonths = Math.max(1, Math.round(days / 15.2));
      return `${halfMonths} Half-month${halfMonths !== 1 ? 's' : ''}`;
    } else if (settings.monthsToShow <= 12) {
      const months = Math.max(1, Math.round(days / 30.4));
      return `${months} Month${months !== 1 ? 's' : ''}`;
    } else {
      const quarters = Math.max(1, Math.round(days / 91));
      return `${quarters} Quarter${quarters !== 1 ? 's' : ''}`;
    }
  };

  const getConflictPoints = (assetId: string) => {
    if (settings.conflictDetection === 'off') return [];
    const assetInitiatives = localInitiatives.filter(i => i.assetId === assetId);
    const conflictsMap = new Map<string, number>();

    for (let i = 0; i < assetInitiatives.length; i++) {
      for (let j = i + 1; j < assetInitiatives.length; j++) {
        const a = assetInitiatives[i];
        const b = assetInitiatives[j];
        if (a.startDate < b.endDate && a.endDate > b.startDate) {
          const conflictStart = a.startDate > b.startDate ? a.startDate : b.startDate;
          const conflictEnd = a.endDate < b.endDate ? a.endDate : b.endDate;

          const start = new Date(conflictStart).getTime();
          const end = new Date(conflictEnd).getTime();
          const overlapDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

          const existingOverlap = conflictsMap.get(conflictStart) || 0;
          if (overlapDays > existingOverlap) {
            conflictsMap.set(conflictStart, overlapDays);
          }
        }
      }
    }
    return Array.from(conflictsMap.entries()).map(([date, overlapDays]) => ({ date, overlapDays }));
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

      <div className="flex-1 overflow-auto scroll-smooth" ref={scrollContainerRef}>
        <div className="relative w-max min-w-full">
          <div className="flex sticky top-0 z-30 bg-white shadow-sm border-b border-slate-200">
            <div className="sticky left-0 w-64 flex-shrink-0 p-4 font-bold text-slate-700 border-r border-slate-200 bg-slate-50 z-40 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
              IT Asset
            </div>
            <div className="flex" style={{ width: totalWidth }}>
              {timeColumns.map((col, idx) => (
                <div
                  key={idx}
                  data-testid={`timeline-col-${idx}`}
                  className={cn(
                    "flex-shrink-0 border-r border-slate-100 p-2 text-center text-sm font-medium text-slate-600 bg-white flex flex-col justify-center",
                    idx === 0 && "border-l-2 border-l-slate-300"
                  )}
                  style={{ width: columnWidth }}
                >
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{col.label}</div>
                  <div>{col.sublabel}</div>
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
              data-testid="dependencies-svg"
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

                // Determine if same asset
                const sourceInit = initiatives.find(i => i.id === dep.sourceId);
                const targetInit = initiatives.find(i => i.id === dep.targetId);
                const sameAsset = sourceInit && targetInit && sourceInit.assetId === targetInit.assetId;

                const sStartX = source.x;
                const sEndX = source.x + source.width;
                const tStartX = target.x;
                const tEndX = target.x + target.width;
                const sMidY = source.y + source.height / 2;
                const tMidY = target.y + target.height / 2;
                const sBottom = source.y + source.height;
                const tBottom = target.y + target.height;

                let path: string;
                let labelX: number, labelY: number;

                const gap = tStartX - sEndX;
                const overlapLeft = Math.max(sStartX, tStartX);
                const overlapRight = Math.min(sEndX, tEndX);
                const overlapWidth = overlapRight - overlapLeft;

                if (gap >= 20) {
                  // State 1: Clear Horizontal Flow (exits right, enters left)
                  const midX = sEndX + gap / 2;
                  path = `M ${sEndX} ${sMidY} L ${midX} ${sMidY} L ${midX} ${tMidY} L ${tStartX - 6} ${tMidY}`;
                  labelX = midX;
                  labelY = (sMidY + tMidY) / 2;
                } else if (tEndX <= sStartX + 20) {
                  // State 2: Backwards Flow (exits left, enters right)
                  const midX = tEndX + (sStartX - tEndX) / 2;
                  path = `M ${sStartX} ${sMidY} L ${midX} ${sMidY} L ${midX} ${tMidY} L ${tEndX + 6} ${tMidY}`;
                  labelX = midX;
                  labelY = (sMidY + tMidY) / 2;
                } else if (overlapWidth > 40) {
                  // State 3: Significant Overlap (exits bottom/top, enters top/bottom)
                  const midX = overlapLeft + overlapWidth / 2;
                  if (sMidY < tMidY) {
                    path = `M ${midX} ${sBottom} L ${midX} ${target.y - 6}`;
                    labelX = midX;
                    labelY = (sBottom + target.y) / 2;
                  } else {
                    path = `M ${midX} ${source.y} L ${midX} ${tBottom + 6}`;
                    labelX = midX;
                    labelY = (source.y + tBottom) / 2;
                  }
                } else {
                  // State 4: Adjacent Proximity (Cramped Horizontal Gap)
                  // Exit source right, drop down/up into the top/bottom of target.
                  let dropX = tStartX + 30;
                  if (dropX > tEndX - 10) dropX = tEndX - 10;

                  if (sMidY < tMidY) {
                    path = `M ${sEndX} ${sMidY} L ${dropX} ${sMidY} L ${dropX} ${target.y - 6}`;
                    labelX = dropX;
                    labelY = (sMidY + target.y) / 2;
                  } else {
                    path = `M ${sEndX} ${sMidY} L ${dropX} ${sMidY} L ${dropX} ${tBottom + 6}`;
                    labelX = dropX;
                    labelY = (sMidY + tBottom) / 2;
                  }
                }

                const cycleType = () => {
                  if (!onUpdateDependencies) return;
                  const types: Dependency['type'][] = ['blocks', 'requires', 'related'];
                  const idx = types.indexOf(dep.type);
                  const nextType = types[(idx + 1) % types.length];
                  onUpdateDependencies(dependencies.map(d => d.id === dep.id ? { ...d, type: nextType } : d));
                };

                return (
                  <g key={dep.id} onClick={cycleType} className="cursor-pointer group" style={{ pointerEvents: 'all' }}>
                    <path
                      d={path}
                      stroke="transparent"
                      strokeWidth="16"
                      fill="none"
                    />
                    <path
                      d={path}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                      opacity="0.8"
                      strokeDasharray={dep.type === 'related' ? "4 2" : "none"}
                      className="group-hover:stroke-blue-600 transition-colors"
                    />
                    <rect
                      x={labelX - 25}
                      y={labelY - 9}
                      width="50"
                      height="18"
                      fill="#ffffff"
                      rx="9"
                      opacity="0.9"
                      stroke="#bfdbfe"
                      strokeWidth="1"
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      fill="#2563eb"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="select-none pointer-events-none"
                    >
                      {dep.type}
                    </text>
                  </g>
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
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </svg>

            {sortedCategoryIds.map((catId) => {
              const category = assetCategories.find(c => c.id === catId);
              const categoryName = category?.name || 'Uncategorized';
              const isCollapsed = collapsedCategories.has(catId);

              // Filter assets for this category based on empty row settings
              let categoryAssets = assetsByCategory[catId] || [];
              if (settings.emptyRowDisplay === 'hide') {
                categoryAssets = categoryAssets.filter(asset =>
                  localInitiatives.some(i => i.assetId === asset.id)
                );
              }

              // If the category is totally empty (or all assets hidden), don't render the category at all
              if (categoryAssets.length === 0) return null;

              return (
                <div key={catId} onDragOver={(e) => handleCategoryDragOver(e, catId)}>
                  <div
                    draggable
                    onDragStart={(e) => handleCategoryDragStart(e, catId)}
                    onDragEnd={handleCategoryDragEnd}
                    className={cn(
                      "flex z-20 bg-slate-100 border-y border-slate-200 w-max cursor-grab active:cursor-grabbing",
                      draggingCategory === catId && "opacity-50"
                    )}
                  >
                    <div className="sticky left-0 w-64 flex-shrink-0 px-4 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 bg-slate-100 z-30 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                      <div className="p-0.5 hover:bg-slate-200 rounded text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                      </div>
                      <button
                        onClick={() => toggleCategory(catId)}
                        className="flex items-center gap-1.5 hover:text-slate-700 focus:outline-none"
                      >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        {categoryName}
                        <span className="text-[10px] font-medium text-slate-400 tracking-normal normal-case">
                          ({categoryAssets.length} asset{categoryAssets.length !== 1 ? 's' : ''})
                        </span>
                      </button>
                    </div>
                    <div className="flex-shrink-0" style={{ width: totalWidth }} />
                  </div>

                  {!isCollapsed && categoryAssets.map(asset => {
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
                              <div key={idx} className={cn("border-r border-slate-100 h-full", idx === 0 && "border-l-2 border-l-slate-200")} style={{ width: columnWidth }} />
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
                                  "absolute rounded-md shadow-sm border flex flex-col justify-center px-2 overflow-hidden transition hover:z-20 hover:shadow-xl cursor-pointer group/item select-none",
                                  init.isPlaceholder
                                    ? "bg-transparent border-red-500 border-dashed border-2 text-red-600 opacity-70"
                                    : cn("text-white border-white/20", colorClass)
                                )}
                                style={{ left: `${left}%`, width: `${width}%`, height: height, top: top }}
                                title={`${init.isPlaceholder ? '[Placeholder] ' : ''}${init.name}\nProgramme: ${prog?.name}\nStrategy: ${strat?.name}\nBudget: $${(init.budget || 0).toLocaleString()}${init.description ? `\n${init.description}` : ''}`}
                              >
                                <div draggable="false" className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/30 z-10" onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, init.id, 'start', init.startDate); }} />
                                <div draggable="false" className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/30 z-10" onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, init.id, 'end', init.endDate); }} />

                                <div className="flex items-start justify-between gap-2 overflow-hidden h-full py-1">
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <div draggable="false" className={cn(
                                      "font-bold text-[11px] leading-tight line-clamp-2",
                                      !init.isPlaceholder && "drop-shadow-md"
                                    )}>{init.name}</div>
                                    {subtitle && width > 5 && (
                                      <div draggable="false" className={cn(
                                        "text-[9px] italic opacity-70 truncate mt-0.5",
                                        !init.isPlaceholder && "drop-shadow-md"
                                      )}>{subtitle}</div>
                                    )}
                                    {settings.descriptionDisplay === 'on' && init.description && (
                                      width > 8 ? (
                                        <div draggable="false" className={cn(
                                          "text-[9px] leading-[12px] opacity-90 mt-1 pt-1 border-t border-white/30 whitespace-pre-wrap break-words line-clamp-3",
                                          !init.isPlaceholder && "drop-shadow-md"
                                        )}>{init.description}</div>
                                      ) : null
                                    )}
                                  </div>

                                  {settings.budgetVisualisation === 'label' && init.budget > 0 && (
                                    <div className={cn(
                                      "flex-shrink-0 text-[10px] font-bold px-1 rounded backdrop-blur-[2px] self-center",
                                      init.isPlaceholder ? "bg-red-50 text-red-600 border border-red-200" : "bg-white/20 text-white"
                                    )}>
                                      ${init.budget >= 1000000
                                        ? `${(init.budget / 1000000).toFixed(1)}m`
                                        : `${Math.round(init.budget / 1000)}k`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {conflictPoints.map((conflict, idx) => {
                            const pos = getPosition(conflict.date);
                            if (pos < 0 || pos > 100) return null;
                            return (
                              <div key={`conflict-${idx}`} className="absolute top-0 bottom-0 flex flex-col items-center justify-center group/marker z-0 pointer-events-none" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
                                <div className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dotted border-red-500/60" />
                                <div className="relative p-1.5 rounded-full shadow-md border-2 border-white bg-red-500 text-white animate-pulse pointer-events-auto">
                                  <AlertTriangle size={16} />
                                </div>
                                <div className="absolute left-full ml-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-red-200 shadow-sm whitespace-nowrap z-40 pointer-events-none">
                                  <div className="text-[10px] font-bold text-red-600 leading-none">Conflict Detected</div>
                                  <div className="text-[8px] text-slate-500 mt-0.5">Overlaps by {formatOverlapDuration(conflict.overlapDays)}</div>
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
                                className="absolute top-0 bottom-0 flex flex-col items-center justify-center group/marker z-0 cursor-grab active:cursor-grabbing"
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
                                <div className="absolute left-full ml-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-slate-200 shadow-sm whitespace-nowrap z-40 pointer-events-none">
                                  <div className="text-[10px] font-bold text-slate-800 leading-none">{mile.name}</div>
                                  <div className="text-[8px] text-slate-500 mt-0.5">{format(parseISO(currentMile.date), 'MMM yyyy')}</div>
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
        onDelete={(initiative) => {
          if (onDeleteInitiative) onDeleteInitiative(initiative);
          setSelectedInitiativeId(null);
          setCreatingInitiativeParams(null);
        }}
      />
    </div>
  );
}
