export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface Strategy {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
}

export interface Programme {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
}

export interface Initiative {
  id: string;
  name: string;
  programmeId: string;
  strategyId?: string;
  assetId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  budget: number;    // Represents height
  description?: string;
}

export interface Dependency {
  id: string;
  sourceId: string; // The initiative that depends on another
  targetId: string; // The initiative being depended upon
  type: 'blocks' | 'requires' | 'related';
}

export interface Milestone {
  id: string;
  assetId: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'info' | 'warning' | 'critical';
}

export interface Asset {
  id: string;
  name: string;
  category: string;
}

export interface TimeColumn {
  id: string;
  label: string;
  year: number;
  quarter: number; // 1-4
}
