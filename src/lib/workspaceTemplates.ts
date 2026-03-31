/**
 * Workspace templates for Scenia.
 *
 * Each template defines the initial data loaded into IndexedDB on first run.
 * Templates correspond to different NZ government IT taxonomy / reference architecture choices.
 */

import { Asset, AssetCategory, Initiative, Milestone, ApplicationSegment, Programme, Strategy, Dependency, Resource, ApplicationStatus, TimelineSettings, Application } from '../types';
import { DTS_CATEGORIES, DTS_ASSETS } from './dtsCatalogue';
import { dtsDemoInitiatives, dtsDemoMilestones, dtsDemoApplicationSegments, dtsDemoApplications, dtsDemoProgrammes, dtsDemoStrategies, dtsDemoAdoptionStatuses, dtsDemoInitiativePhases, dtsDemoDependencies } from './dtsDemoData';
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

export type TemplateId = 'dts' | 'geanz' | 'viewer' | 'blank';

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
    id: 'viewer',
    name: 'Viewer',
    description: 'Upload an Excel file shared by a colleague to view their portfolio.',
    tagline: 'Upload & view a shared file',
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
        assets: withDemoData
          ? DTS_ASSETS.map(a => ({ ...a, dtsAdoptionStatus: dtsDemoAdoptionStatuses[a.id] }))
          : DTS_ASSETS,
        initiatives: withDemoData ? dtsDemoInitiatives.map(i => ({ ...i, dtsPhase: dtsDemoInitiativePhases[i.id] })) : [],
        milestones: withDemoData ? dtsDemoMilestones : [],
        applicationSegments: withDemoData ? dtsDemoApplicationSegments : [],
        programmes: dtsDemoProgrammes,
        strategies: dtsDemoStrategies,
        dependencies: withDemoData ? dtsDemoDependencies : [],
        resources: withDemoData ? demoResources : [],
        applications: withDemoData ? dtsDemoApplications : [],
        applicationStatuses: demoApplicationStatuses,
        timelineSettings: { ...baseSettings, showGeanzCatalogue: false },
      };

    case 'viewer':
      // Viewer mode loads data from an uploaded Excel file — no preset data needed.
      // Return a blank workspace as the fallback.
      return {
        assetCategories: [],
        assets: [],
        initiatives: [],
        milestones: [],
        applicationSegments: [],
        programmes: [],
        strategies: [],
        dependencies: [],
        resources: [],
        applications: [],
        applicationStatuses: [],
        timelineSettings: { ...baseSettings, showGeanzCatalogue: false },
      };

    case 'blank':
      return {
        assetCategories: [],
        assets: [],
        initiatives: [],
        milestones: [],
        applicationSegments: [],
        programmes: [],
        strategies: [],
        dependencies: [],
        resources: [],
        applications: [],
        applicationStatuses: [],
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
