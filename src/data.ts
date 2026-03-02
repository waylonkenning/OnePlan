import { Asset, Initiative, Milestone, Programme } from './types';

export const programmes: Programme[] = [
  { id: 'prog-1', name: 'SFTF', color: 'bg-blue-500' },
  { id: 'prog-2', name: 'ISART', color: 'bg-emerald-500' },
  { id: 'prog-3', name: 'Regulator', color: 'bg-amber-500' },
  { id: 'prog-4', name: 'Tech Debt', color: 'bg-rose-500' },
];

export const assets: Asset[] = [
  { id: 'asset-1', name: 'CIAM', category: 'Identity Assets' },
  { id: 'asset-2', name: 'PAM', category: 'Identity Assets' },
  { id: 'asset-3', name: 'Digital Credentials', category: 'Identity Assets' },
  { id: 'asset-4', name: 'Data Lake', category: 'Data Assets' },
  { id: 'asset-5', name: 'Warehouse', category: 'Data Assets' },
];

export const initiatives: Initiative[] = [
  {
    id: 'init-1',
    name: 'Web Channel Integration',
    programmeId: 'prog-1',
    assetId: 'asset-1',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    budget: 500000, // Medium height
  },
  {
    id: 'init-2',
    name: 'Enterprise CIAM',
    programmeId: 'prog-2',
    assetId: 'asset-1',
    startDate: '2027-01-01',
    endDate: '2027-12-31',
    budget: 800000, // Taller height
  },
  {
    id: 'init-3',
    name: 'Physical Accept',
    programmeId: 'prog-1',
    assetId: 'asset-3',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    budget: 200000, // Short height
  },
  {
    id: 'init-4',
    name: 'Digital Accept',
    programmeId: 'prog-1',
    assetId: 'asset-3',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    budget: 300000,
  },
  {
    id: 'init-5',
    name: 'Legacy Migration',
    programmeId: 'prog-4',
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
