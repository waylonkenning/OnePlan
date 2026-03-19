# User Stories — Version History & Snapshots

## US-VH-01: Save a Named Version Snapshot

**As an** IT portfolio manager,
**I want** to save a named snapshot of the current portfolio state,
**so that** I can preserve a baseline before making significant changes.

**Acceptance Criteria:**
- A "Save Current State" button opens a form to enter a version name and optional description
- Saving creates a version entry visible in the version history list
- Saved versions are deep clones — mutations after saving do not affect the snapshot
- Snapshot data is persisted in full to IndexedDB (survives page reload)

---

## US-VH-02: Restore a Previous Version

**As an** IT portfolio manager,
**I want** to restore a previous snapshot,
**so that** I can undo large batches of changes or roll back to a known-good state.

**Acceptance Criteria:**
- Selecting a version and clicking "Restore" shows a confirmation modal
- Confirming overwrites the current state with the snapshot data
- The VersionManager closes automatically after a successful restore
- If the selected version is deleted while the comparison report is open, the app does not crash

---

## US-VH-03: Delete a Version

**As an** IT portfolio manager,
**I want** to delete old version snapshots I no longer need,
**so that** the history list stays manageable.

**Acceptance Criteria:**
- A delete button is available for each version entry
- Clicking delete shows a confirmation modal
- Confirming removes the version from IndexedDB

---

## US-VH-04: Compare Two Versions with a Diff Report

**As an** IT portfolio manager,
**I want** to compare two versions and see a diff report highlighting what changed,
**so that** I can communicate the impact of planning decisions to stakeholders.

**Acceptance Criteria:**
- A "Difference Report" can be generated between a saved baseline version and the current state
- The diff report shows which initiatives/assets were added, removed, or modified
- The diff report is accessible from the Reports view under "History Differences"
- An empty state is shown in the report when no versions have been saved
- A version selector appears once at least one version exists
- An appropriate error message is shown if versions fail to load
