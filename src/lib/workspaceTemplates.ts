/**
 * Workspace templates for Scenia.
 *
 * Each template defines the initial data loaded into IndexedDB on first run.
 * Templates correspond to different NZ government IT taxonomy / reference architecture choices.
 */

import { Asset, AssetCategory, Initiative, Milestone, ApplicationSegment, Programme, Strategy, Dependency, Resource, ApplicationStatus, TimelineSettings, Application } from '../types';
import { DTS_CATEGORIES, DTS_ASSETS } from './dtsCatalogue';
import { dtsDemoInitiatives, dtsDemoMilestones, dtsDemoApplicationSegments } from './dtsDemoData';
import {
  demoAssets,
  demoInitiatives,
  demoMilestones,
  demoApplicationSegments,
  demoAssetCategories,
  demoProgrammes,
  demoStrategies,
  demoDependencies,
  demoResources,
  demoApplications,
  demoApplicationStatuses,
  demoTimelineSettings,
} from '../demoData';

export type TemplateId = 'dts' | 'geanz' | 'mixed' | 'blank';

export interface WorkspaceTemplate {
  id: TemplateId;
  name: string;
  description: string;
  tagline: string;
}

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'dts',
    name: 'NZ Digital Target State',
    description: 'Model your portfolio against the GCDO target architecture.',
    tagline: '6 layers · 20 pre-built assets',
  },
  {
    id: 'geanz',
    name: 'GEANZ Technology Catalogue',
    description: 'Browse 17 TAP application areas and add the ones relevant to your agency.',
    tagline: '17 areas · 300+ asset types',
  },
  {
    id: 'mixed',
    name: 'Mixed',
    description: 'DTS architecture layers with GEANZ catalogue for detailed asset types.',
    tagline: 'DTS structure + GEANZ catalogue',
  },
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from scratch with your own asset categories.',
    tagline: 'Your own structure',
  },
];

export interface TemplateAppData {
  assetCategories: AssetCategory[];
  assets: Asset[];
  initiatives: Initiative[];
  milestones: Milestone[];
  applicationSegments: ApplicationSegment[];
  programmes: Programme[];
  strategies: Strategy[];
  dependencies: Dependency[];
  resources: Resource[];
  applications: Application[];
  applicationStatuses: ApplicationStatus[];
  timelineSettings: TimelineSettings;
}

export function getTemplateData(templateId: TemplateId | string, withDemoData = true): TemplateAppData {
  const baseSettings: TimelineSettings = {
    ...demoTimelineSettings,
    templateId,
  };

  switch (templateId) {
    case 'dts':
      return {
        assetCategories: DTS_CATEGORIES,
        assets: DTS_ASSETS,
        initiatives: withDemoData ? dtsDemoInitiatives : [],
        milestones: withDemoData ? dtsDemoMilestones : [],
        applicationSegments: withDemoData ? dtsDemoApplicationSegments : [],
        programmes: demoProgrammes,
        strategies: demoStrategies,
        dependencies: [],
        resources: withDemoData ? demoResources : [],
        applications: [],
        applicationStatuses: demoApplicationStatuses,
        timelineSettings: { ...baseSettings, showGeanzCatalogue: false },
      };

    case 'mixed':
      return {
        assetCategories: DTS_CATEGORIES,
        assets: DTS_ASSETS,
        initiatives: withDemoData ? dtsDemoInitiatives : [],
        milestones: withDemoData ? dtsDemoMilestones : [],
        applicationSegments: withDemoData ? dtsDemoApplicationSegments : [],
        programmes: demoProgrammes,
        strategies: demoStrategies,
        dependencies: [],
        resources: withDemoData ? demoResources : [],
        applications: [],
        applicationStatuses: demoApplicationStatuses,
        timelineSettings: { ...baseSettings, showGeanzCatalogue: true },
      };

    case 'blank':
      return {
        assetCategories: [],
        assets: [],
        initiatives: [],
        milestones: [],
        applicationSegments: [],
        programmes: demoProgrammes,
        strategies: demoStrategies,
        dependencies: [],
        resources: [],
        applications: [],
        applicationStatuses: demoApplicationStatuses,
        timelineSettings: { ...baseSettings, showGeanzCatalogue: false },
      };

    case 'geanz':
    default:
      return {
        assetCategories: demoAssetCategories,
        assets: demoAssets,
        initiatives: withDemoData ? demoInitiatives : [],
        milestones: withDemoData ? demoMilestones : [],
        applicationSegments: withDemoData ? demoApplicationSegments : [],
        programmes: demoProgrammes,
        strategies: demoStrategies,
        dependencies: withDemoData ? demoDependencies : [],
        resources: withDemoData ? demoResources : [],
        applications: withDemoData ? demoApplications : [],
        applicationStatuses: demoApplicationStatuses,
        timelineSettings: { ...baseSettings, showGeanzCatalogue: true },
      };
  }
}
