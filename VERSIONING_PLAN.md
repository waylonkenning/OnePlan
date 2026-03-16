# Version History Feature Plan

This document outlines the architectural approach for implementing a persistent version history (snapshotting) system within **OnePlan**.

## 1. Goal
Provide users with the ability to "Save a Version" of their current plan. Each version is a complete, point-in-time snapshot of all application data (initiatives, assets, dependencies, etc.). Users should be able to compare versions and generate a diff report.

## 2. Storage Strategy: Persistent Snapshots
Since the application already uses **IndexedDB (via `idb`)**, the most robust way to store versions is to add a new `versions` object store.

### Data Structure
A `Version` object will encapsulate the entire state:

```typescript
export interface Version {
  id: string;         // Unique ID (e.g., timestamp-based)
  name: string;       // User-provided name (e.g., "Q1 Final", "Pre-refactor")
  timestamp: string;  // ISO date string
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
```

### Why this is the "Best Way":
1.  **Persistence:** Unlike the undo/redo stack (which is in-memory and lost on refresh), IndexedDB is persistent.
2.  **Performance:** `idb` handles large JSON objects efficiently. Modern browsers can store hundreds of megabytes in IndexedDB.
3.  **Atomicity:** We can save the entire state in a single transaction, ensuring data integrity.
4.  **Decoupling:** Current live data remains in its existing stores. Versions are stored separately, preventing accidental corruption of the "working" state.

## 3. Implementation Phases

### Phase 1: Database & Types (The Foundation)
1.  Update `src/types.ts` to include the `Version` interface.
2.  Update `src/lib/db.ts`:
    - Increment `DB_VERSION`.
    - Create the `versions` object store in the `upgrade` callback.
    - Add `saveVersion(version: Version)` and `getAllVersions()` helper functions.

### Phase 2: UI for Snapshotting
1.  **Header Update:** Add a "Versions" button to the main menu.
2.  **Save Version Modal:** A simple modal to capture the version name/description.
3.  **App Logic:** In `App.tsx`, implement a `handleSaveVersion` function that gathers the current state and calls `db.saveVersion`.

### Phase 3: Version Comparison (The "Report")
1.  **Version Manager Modal:** A list view of all saved versions.
2.  **Diff Engine:** A utility function to compare two `Version` objects.
    - **Added:** Items in Version B but not A.
    - **Removed:** Items in Version A but not B.
    - **Modified:** Items with same ID but different fields (dates, budget, status).
3.  **Report View:** A clean, readable modal/page summarizing these changes:
    - *"Passkey Rollout: Start date shifted from 2026-03-01 to 2026-04-15"*
    - *"New Relationship: SSO Consolidation now blocks Mobile App Update"*

## 4. Key Considerations
- **Storage Limits:** While high, we should offer a way to delete old versions.
- **Deep Cloning:** Ensure we deep-clone the state before saving to prevent mutations affecting stored snapshots.
- **Diffing Complexity:** Comparing dates and complex dependency graphs needs a structured approach (e.g., mapping by ID for fast lookups).

## 5. Next Steps
1.  [ ] Define the `Version` interface in `src/types.ts`.
2.  [ ] Implement database migration in `src/lib/db.ts`.
3.  [ ] Create a `VersionManager` component.
