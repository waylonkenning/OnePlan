import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings } from './types';

export const defaultTimelineSettings: TimelineSettings = {
  startYear: 2026,
  yearsToShow: 3,
  budgetVisualisation: 'off',
  descriptionDisplay: 'off',
  emptyRowDisplay: 'show',
  snapToPeriod: 'off',
};

export const assetCategories: AssetCategory[] = [
  { id: 'cat-1', name: 'Identity Assets', order: 1 },
  { id: 'cat-2', name: 'Data Assets', order: 2 },
];

export const strategies: Strategy[] = [
  { id: 'strat-1', name: 'Customer First', color: 'bg-indigo-500' },
  { id: 'strat-2', name: 'Operational Excellence', color: 'bg-cyan-500' },
  { id: 'strat-3', name: 'Digital Innovation', color: 'bg-fuchsia-500' },
  { id: 'strat-4', name: 'Regulatory Compliance', color: 'bg-orange-500' },
];

export const programmes: Programme[] = [
  { id: 'prog-1', name: 'SFTF', color: 'bg-blue-500' },
  { id: 'prog-2', name: 'ISART', color: 'bg-emerald-500' },
  { id: 'prog-3', name: 'Regulator', color: 'bg-amber-500' },
  { id: 'prog-4', name: 'Tech Debt', color: 'bg-rose-500' },
];

export const assets: Asset[] = [
  { id: 'asset-1', name: 'CIAM', categoryId: 'cat-1' },
  { id: 'asset-2', name: 'PAM', categoryId: 'cat-1' },
  { id: 'asset-3', name: 'Digital Credentials', categoryId: 'cat-1' },
  { id: 'asset-4', name: 'Data Lake', categoryId: 'cat-2' },
  { id: 'asset-5', name: 'Warehouse', categoryId: 'cat-2' },
];

export const initiatives: Initiative[] = [
  {
    id: 'init-1',
    name: 'Web Channel Integration',
    programmeId: 'prog-1',
    strategyId: 'strat-1',
    assetId: 'asset-1',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    budget: 500000, // Medium height
  },
  {
    id: 'init-2',
    name: 'Enterprise CIAM',
    programmeId: 'prog-2',
    strategyId: 'strat-3',
    assetId: 'asset-1',
    startDate: '2027-01-01',
    endDate: '2027-12-31',
    budget: 800000, // Taller height
  },
  {
    id: 'init-3',
    name: 'Physical Accept',
    programmeId: 'prog-1',
    strategyId: 'strat-1',
    assetId: 'asset-3',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    budget: 200000, // Short height
  },
  {
    id: 'init-4',
    name: 'Digital Accept',
    programmeId: 'prog-1',
    strategyId: 'strat-1',
    assetId: 'asset-3',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    budget: 300000,
  },
  {
    id: 'init-5',
    name: 'Legacy Migration',
    programmeId: 'prog-4',
    strategyId: 'strat-2',
    assetId: 'asset-5',
    startDate: '2026-06-01',
    endDate: '2027-06-01',
    budget: 450000,
  }
];

export const milestones: Milestone[] = [
  {
    id: 'mile-1',
    assetId: 'asset-1',
    date: '2030-01-01',
    name: 'Out of Support',
    type: 'critical',
  },
  {
    id: 'mile-2',
    assetId: 'asset-2',
    date: '2026-01-01',
    name: 'Review Investment',
    type: 'warning',
  }
];

export const dependencies: Dependency[] = [];
