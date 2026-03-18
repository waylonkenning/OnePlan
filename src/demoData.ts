import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings, Resource } from './types';

/**
 * Returns a date string (YYYY-MM-DD) relative to the current calendar year.
 * yearOffset=0 → current year, yearOffset=1 → next year, etc.
 */
function relDate(yearOffset: number, month: number, day: number): string {
    const year = new Date().getFullYear() + yearOffset;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export const demoTimelineSettings: TimelineSettings = {
    startDate: relDate(0, 1, 1),
    monthsToShow: 36,
    budgetVisualisation: 'off',
    descriptionDisplay: 'off',
    emptyRowDisplay: 'show',
    snapToPeriod: 'off',
    conflictDetection: 'on',
    showRelationships: 'on',
    collapsedGroups: [],
};

export const demoAssetCategories: AssetCategory[] = [
    { id: 'cat-iam', name: 'Identity & Access Management', order: 1 },
    { id: 'cat-data', name: 'Data Platform', order: 2 },
    { id: 'cat-channel', name: 'Customer Channels', order: 3 },
    { id: 'cat-core', name: 'Core Banking', order: 4 },
    { id: 'cat-cloud', name: 'Cloud Infrastructure', order: 5 },
    { id: 'cat-int', name: 'Integration & APIs', order: 6 },
];

export const demoStrategies: Strategy[] = [
    { id: 'strat-cloud', name: 'Cloud First', color: 'bg-sky-500' },
    { id: 'strat-cust', name: 'Customer First', color: 'bg-indigo-500' },
    { id: 'strat-zero', name: 'Zero Trust', color: 'bg-rose-500' },
    { id: 'strat-api', name: 'API-Led Architecture', color: 'bg-emerald-500' },
    { id: 'strat-data', name: 'Data-Driven Decisions', color: 'bg-amber-500' },
    { id: 'strat-reg', name: 'Regulatory Compliance', color: 'bg-orange-500' },
];

export const demoProgrammes: Programme[] = [
    { id: 'prog-dtp', name: 'Digital Transformation', color: 'bg-blue-500' },
    { id: 'prog-reg', name: 'Regulatory Programme', color: 'bg-amber-500' },
    { id: 'prog-cloud', name: 'Cloud Migration', color: 'bg-sky-500' },
    { id: 'prog-cx', name: 'Customer Experience', color: 'bg-fuchsia-500' },
    { id: 'prog-mod', name: 'Tech Modernisation', color: 'bg-rose-500' },
    { id: 'prog-data', name: 'Data & Analytics', color: 'bg-emerald-500' },
];

export const demoAssets: Asset[] = [
    // Identity & Access Management
    { id: 'a-ciam', name: 'Customer IAM (CIAM)', categoryId: 'cat-iam' },
    { id: 'a-eiam', name: 'Employee IAM', categoryId: 'cat-iam' },
    { id: 'a-pam', name: 'Privileged Access Mgmt', categoryId: 'cat-iam' },
    // Data Platform
    { id: 'a-lake', name: 'Enterprise Data Lake', categoryId: 'cat-data' },
    { id: 'a-dwh', name: 'Data Warehouse', categoryId: 'cat-data' },
    { id: 'a-mdm', name: 'Master Data Mgmt', categoryId: 'cat-data' },
    // Customer Channels
    { id: 'a-web', name: 'Internet Banking', categoryId: 'cat-channel' },
    { id: 'a-mobile', name: 'Mobile Banking App', categoryId: 'cat-channel' },
    { id: 'a-cc', name: 'Contact Centre Platform', categoryId: 'cat-channel' },
    // Core Banking
    { id: 'a-core', name: 'Core Ledger', categoryId: 'cat-core' },
    { id: 'a-pay', name: 'Payments Engine', categoryId: 'cat-core' },
    { id: 'a-lend', name: 'Lending Platform', categoryId: 'cat-core' },
    // Cloud Infrastructure
    { id: 'a-k8s', name: 'Kubernetes Platform', categoryId: 'cat-cloud' },
    { id: 'a-obs', name: 'Observability Stack', categoryId: 'cat-cloud' },
    // Integration & APIs
    { id: 'a-apigw', name: 'API Gateway', categoryId: 'cat-int' },
    { id: 'a-esb', name: 'Enterprise Service Bus', categoryId: 'cat-int' },
];

export const demoInitiatives: Initiative[] = [
    // CIAM
    {
        id: 'i-ciam-passkey', name: 'Passkey Rollout', programmeId: 'prog-dtp', strategyId: 'strat-zero',
        assetId: 'a-ciam', startDate: relDate(0, 1, 1), endDate: relDate(0, 6, 30), budget: 350000,
        description: 'Replace SMS OTP with FIDO2 passkeys for all customer-facing channels.',
        ownerId: 'res-4', resourceIds: ['res-2', 'res-3'],
    },
    {
        id: 'i-ciam-sso', name: 'SSO Consolidation', programmeId: 'prog-dtp', strategyId: 'strat-cust',
        assetId: 'a-ciam', startDate: relDate(0, 7, 1), endDate: relDate(1, 3, 31), budget: 600000,
        description: 'Unify 12 legacy identity providers into a single CIAM platform.',
        ownerId: 'res-1', resourceIds: ['res-3'],
    },
    // Employee IAM
    {
        id: 'i-eiam-ztna', name: 'Zero Trust Network Access', programmeId: 'prog-mod', strategyId: 'strat-zero',
        assetId: 'a-eiam', startDate: relDate(0, 4, 1), endDate: relDate(1, 1, 31), budget: 800000,
        description: 'Implement identity-centric perimeter for all internal applications.',
    },
    // PAM
    {
        id: 'i-pam-vault', name: 'Secrets Vault Migration', programmeId: 'prog-cloud', strategyId: 'strat-cloud',
        assetId: 'a-pam', startDate: relDate(0, 3, 1), endDate: relDate(0, 9, 30), budget: 250000,
        description: 'Move from legacy PAM to cloud-native HashiCorp Vault.',
    },
    // Data Lake
    {
        id: 'i-lake-ingest', name: 'Real-Time Ingestion', programmeId: 'prog-data', strategyId: 'strat-data',
        assetId: 'a-lake', startDate: relDate(0, 1, 1), endDate: relDate(0, 9, 30), budget: 1200000,
        description: 'Kafka-based streaming ingestion pipeline replacing nightly batch ETL.',
    },
    {
        id: 'i-lake-gov', name: 'Data Governance Framework', programmeId: 'prog-reg', strategyId: 'strat-reg',
        assetId: 'a-lake', startDate: relDate(0, 10, 1), endDate: relDate(1, 6, 30), budget: 500000,
        description: 'Implement data lineage, quality scoring, and automated PII tagging.',
    },
    // Data Warehouse
    {
        id: 'i-dwh-snow', name: 'Snowflake Migration', programmeId: 'prog-cloud', strategyId: 'strat-cloud',
        assetId: 'a-dwh', startDate: relDate(0, 4, 1), endDate: relDate(1, 3, 31), budget: 2000000,
        description: 'Migrate on-prem Teradata warehouse to Snowflake on AWS.',
    },
    // MDM
    {
        id: 'i-mdm-golden', name: 'Golden Customer Record', programmeId: 'prog-cx', strategyId: 'strat-data',
        assetId: 'a-mdm', startDate: relDate(0, 6, 1), endDate: relDate(1, 3, 31), budget: 750000,
        description: 'Create single 360° customer view across banking, insurance and wealth.',
    },
    // Internet Banking
    {
        id: 'i-web-redesign', name: 'Web Platform Redesign', programmeId: 'prog-cx', strategyId: 'strat-cust',
        assetId: 'a-web', startDate: relDate(0, 1, 1), endDate: relDate(0, 12, 31), budget: 3000000,
        description: 'Complete redesign of the internet banking UIUX using React + Tailwind micro-frontends.',
    },
    {
        id: 'i-web-a11y', name: 'WCAG 2.2 AA Compliance', programmeId: 'prog-reg', strategyId: 'strat-reg',
        assetId: 'a-web', startDate: relDate(1, 1, 1), endDate: relDate(1, 6, 30), budget: 400000,
        description: 'Accessibility remediation to meet WCAG 2.2 Level AA for all customer journeys.',
    },
    // Mobile Banking
    {
        id: 'i-mobile-rn', name: 'React Native Rewrite', programmeId: 'prog-dtp', strategyId: 'strat-cust',
        assetId: 'a-mobile', startDate: relDate(0, 3, 1), endDate: relDate(1, 6, 30), budget: 4500000,
        description: 'Rewrite native iOS and Android apps as a single React Native codebase.',
    },
    // Contact Centre
    {
        id: 'i-cc-ai', name: 'AI-Powered IVR', programmeId: 'prog-cx', strategyId: 'strat-data',
        assetId: 'a-cc', startDate: relDate(0, 7, 1), endDate: relDate(1, 3, 31), budget: 900000,
        description: 'Deploy conversational AI to handle 60% of Tier 1 support calls.',
    },
    // Core Ledger
    {
        id: 'i-core-iso', name: 'ISO 20022 Migration', programmeId: 'prog-reg', strategyId: 'strat-reg',
        assetId: 'a-core', startDate: relDate(0, 1, 1), endDate: relDate(1, 6, 30), budget: 5000000,
        description: 'Upgrade core messaging to ISO 20022 format for SWIFT and domestic payments.',
    },
    {
        id: 'i-core-api', name: 'Core Banking API Layer', programmeId: 'prog-mod', strategyId: 'strat-api',
        assetId: 'a-core', startDate: relDate(1, 1, 1), endDate: relDate(1, 12, 31), budget: 2500000,
        description: 'Wrap legacy COBOL core with gRPC and REST APIs for channel consumption.',
    },
    // Payments Engine
    {
        id: 'i-pay-rtp', name: 'Real-Time Payments Gateway', programmeId: 'prog-dtp', strategyId: 'strat-api',
        assetId: 'a-pay', startDate: relDate(0, 4, 1), endDate: relDate(1, 3, 31), budget: 1800000,
        description: 'Connect to the national real-time payments network (NPP/FPS).',
    },
    {
        id: 'i-pay-fraud', name: 'Transaction Fraud ML', programmeId: 'prog-data', strategyId: 'strat-data',
        assetId: 'a-pay', startDate: relDate(0, 10, 1), endDate: relDate(1, 6, 30), budget: 700000,
        description: 'Deploy ML models for real-time fraud scoring on all payment channels.',
    },
    // API Gateway
    {
        id: 'i-apigw-v2', name: 'API Gateway v2 Migration', programmeId: 'prog-mod', strategyId: 'strat-api',
        assetId: 'a-apigw', startDate: relDate(0, 1, 1), endDate: relDate(0, 6, 30), budget: 350000,
        description: 'Migrate from Kong to cloud-native AWS API Gateway with WAF integration.',
    },
    {
        id: 'i-apigw-portal', name: 'Developer Portal Launch', programmeId: 'prog-dtp', strategyId: 'strat-api',
        assetId: 'a-apigw', startDate: relDate(0, 7, 1), endDate: relDate(1, 1, 31), budget: 300000,
        description: 'Self-service developer portal for internal and partner API consumers.',
    },
    // Enterprise Service Bus
    {
        id: 'i-esb-decomm', name: 'ESB Decommission', programmeId: 'prog-mod', strategyId: 'strat-api',
        assetId: 'a-esb', startDate: relDate(1, 1, 1), endDate: relDate(2, 6, 30), budget: 1200000,
        description: 'Progressively decommission on-prem ESB by migrating integrations to event-driven architecture.',
    },
    // Lending
    {
        id: 'i-lend-auto', name: 'Automated Decisioning', programmeId: 'prog-mod', strategyId: 'strat-data',
        assetId: 'a-lend', startDate: relDate(0, 6, 1), endDate: relDate(1, 3, 31), budget: 1500000,
        description: 'New real-time credit scoring engine based on cloud-native decisioning platform.',
    },
    {
        id: 'i-lend-open', name: 'Open Banking Origination', programmeId: 'prog-reg', strategyId: 'strat-reg',
        assetId: 'a-lend', startDate: relDate(1, 4, 1), endDate: relDate(2, 3, 31), budget: 900000,
        description: 'Integrate CDR/Open Banking data into loan origination for richer affordability checks.',
    },
    {
        id: 'i-placeholder-1',
        name: 'Future Strategy',
        programmeId: 'prog-dtp',
        strategyId: 'strat-cloud',
        assetId: 'a-k8s',
        startDate: relDate(2, 1, 1),
        endDate: relDate(2, 12, 31),
        budget: 0,
        description: 'Placeholder for future cloud-native workloads.',
        isPlaceholder: true
    }
];

export const demoDependencies: Dependency[] = [
    { id: 'dep-1', sourceId: 'i-ciam-passkey', targetId: 'i-ciam-sso', type: 'blocks' },
    { id: 'dep-2', sourceId: 'i-lake-ingest', targetId: 'i-lake-gov', type: 'blocks' },
    { id: 'dep-3', sourceId: 'i-web-redesign', targetId: 'i-web-a11y', type: 'blocks' },
    { id: 'dep-5', sourceId: 'i-apigw-v2', targetId: 'i-apigw-portal', type: 'blocks' },
    { id: 'dep-6', sourceId: 'i-core-iso', targetId: 'i-core-api', type: 'blocks' },
    { id: 'dep-7', sourceId: 'i-pay-rtp', targetId: 'i-pay-fraud', type: 'requires' },
    { id: 'dep-8', sourceId: 'i-dwh-snow', targetId: 'i-mdm-golden', type: 'requires' },
    { id: 'dep-9', sourceId: 'i-apigw-v2', targetId: 'i-esb-decomm', type: 'blocks' },
    { id: 'dep-10', sourceId: 'i-lend-auto', targetId: 'i-lend-open', type: 'blocks' },
];

export const demoMilestones: Milestone[] = [
    { id: 'ms-1', assetId: 'a-core', date: relDate(0, 11, 1), name: 'SWIFT ISO 20022 Deadline', type: 'critical' },
    { id: 'ms-2', assetId: 'a-web', date: relDate(1, 7, 1), name: 'WCAG Compliance Audit', type: 'critical' },
    { id: 'ms-3', assetId: 'a-pay', date: relDate(1, 4, 1), name: 'NPP Go-Live', type: 'critical' },
    { id: 'ms-4', assetId: 'a-mobile', date: relDate(1, 7, 1), name: 'App Store Launch', type: 'warning' },
    { id: 'ms-5', assetId: 'a-k8s', date: relDate(0, 10, 1), name: 'DR Failover Test', type: 'warning' },
    { id: 'ms-6', assetId: 'a-esb', date: relDate(2, 7, 1), name: 'ESB End of Life', type: 'critical' },
    { id: 'ms-7', assetId: 'a-lake', date: relDate(1, 1, 1), name: 'Batch ETL Sunset', type: 'warning' },
    { id: 'ms-8', assetId: 'a-lend', date: relDate(1, 10, 1), name: 'Open Banking Phase 3', type: 'info' },
];

export const demoResources: Resource[] = [
    { id: 'res-1', name: 'Sarah Chen', role: 'Programme Manager' },
    { id: 'res-2', name: 'James Okafor', role: 'Enterprise Architect' },
    { id: 'res-3', name: 'Business Analyst' },
    { id: 'res-4', name: 'Maria Santos', role: 'Security Architect' },
    { id: 'res-5', name: 'Cloud Engineer' },
    { id: 'res-6', name: 'Tom Wright', role: 'Tech Lead' },
];
