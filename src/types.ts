/**
 * @license
 * Apache License 2.0
 */

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

/**
 * Represents a high-level strategic goal.
 * Used for categorising and colouring initiatives.
 */
export interface Strategy {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex string
}

/**
 * Represents a delivery programme that groups multiple initiatives.
 */
export interface Programme {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex string
}

/**
 * High-level grouping for IT Assets (e.g., "Infrastructure", "Applications").
 */
export interface AssetCategory {
  id: string;
  name: string;
  order?: number; // Optional sort order for the categories
}

/**
 * The core entity representing a specific project or piece of work.
 */
export interface Initiative {
  id: string;
  name: string;
  programmeId: string;
  strategyId?: string;
  assetId: string;
  startDate: string; // ISO format: YYYY-MM-DD
  endDate: string;   // ISO format: YYYY-MM-DD
  budget: number;    // Numeric value, also used to scale bar height in some views
  description?: string;
  isPlaceholder?: boolean;
  status?: 'planned' | 'active' | 'done' | 'cancelled';
}

/**
 * Defines a directed relationship between two initiatives.
 */
export interface Dependency {
  id: string;
  sourceId: string; // The ID of the initiative that has the dependency
  targetId: string; // The ID of the initiative that is being depended upon
  type: 'blocks' | 'requires' | 'related';
  midXOffset?: number; // Manual horizontal offset for the vertical segment of the arrow
}

/**
 * Significant point in time for a specific Asset.
 */
export interface Milestone {
  id: string;
  assetId: string;
  date: string; // ISO format: YYYY-MM-DD
  name: string;
  type: 'info' | 'warning' | 'critical';
}

/**
 * Represents a specific system, team, or resource area.
 */
export interface Asset {
  id: string;
  name: string;
  categoryId: string;
}

/**
 * Internal type used for rendering the timeline grid columns.
 */
export interface TimeColumn {
  date: Date;
  label: string;
  year: number;
  quarter: number;
}

/**
 * Global UI and rendering configuration.
 */
export interface TimelineSettings {
  startDate: string; // YYYY-MM-DD
  monthsToShow: 3 | 6 | 12 | 24 | 36;
  budgetVisualisation: 'label' | 'bar-height' | 'off';
  descriptionDisplay: 'on' | 'off';
  emptyRowDisplay: 'show' | 'hide';
  snapToPeriod: 'off' | 'month';
  conflictDetection: 'on' | 'off';
  showRelationships: 'on' | 'off';
  columnWidths?: Record<string, Record<string, string>>;
  collapsedGroups?: string[];
  hasSeenTutorial?: boolean;
  columnZoom?: number; // Multiplier for minimum column width (0.5–3.0, default 1.0)
  mobileBucketMode?: 'timeline' | 'quarter' | 'year' | 'programme' | 'strategy';
}

/**
 * A persistent snapshot of the entire application state.
 */
export interface Version {
  id: string;
  name: string;
  timestamp: string; // ISO string
  description?: string;
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
}
