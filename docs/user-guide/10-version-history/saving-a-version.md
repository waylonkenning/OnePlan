# Saving a Version

![Save Named Version dialog](../../public/features/version-history-save-dialog.png)

Versions are named snapshots of your entire portfolio state at a point in time. Saving a version before a significant change — a planning cycle, a major reprioritisation, a board review — gives you a baseline you can compare against or restore later.

## When to save a version

Save a version before:

- submitting a plan for approval
- making bulk changes you may want to undo
- starting a what-if scenario

## How to save a version

1. Open the **Version History** panel from the toolbar or the main menu.
2. Click **Save Current State**.
3. Enter a name (required). Names should be short and descriptive, for example `Q2 Baseline` or `Pre-board 2026-03`.
4. Optionally add a description to record the context or reason for the snapshot.
5. Click **Save**.

The new version appears at the top of the version history list with the timestamp at which it was saved.

## What is saved

A saved version is a deep clone of the full portfolio state, including all initiatives, assets, programmes, strategies, milestones, and their relationships. The snapshot is persisted to IndexedDB and survives page reloads and browser restarts.

## Managing versions

Each version entry in the list shows its name, optional description, and creation timestamp. To remove a version you no longer need, click the **delete** icon on its row and confirm the deletion in the modal. Deleted versions are removed from IndexedDB and cannot be recovered.

---

- Previous: [History Diff Report](../09-reports/history-diff-report.md)
- Next: [Comparing Versions](comparing-versions.md)
