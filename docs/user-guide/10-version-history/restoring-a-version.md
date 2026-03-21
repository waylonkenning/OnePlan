# Restoring a Version

![Restore version confirmation modal](../../public/features/version-history-restore-modal.png)

Restoring replaces your entire current portfolio state with a previously saved version. Use this to roll back an unwanted change or to reset to an approved baseline.

## Before you restore

Restoration is destructive: any changes made since the selected version was saved will be lost. If you want to keep a record of the current state, [save it as a version](saving-a-version.md) before proceeding.

## How to restore a version

1. Open the **Version History** panel.
2. Locate the version you want to restore in the list.
3. Click **Restore** on that version's row.
4. Read the confirmation modal, which names the version and warns that the current state will be overwritten.
5. Click **Confirm Restore**.

The app loads the saved state, the Version History panel closes automatically, and you are returned to the timeline with the restored data.

## After restoring

The restoration writes the saved snapshot back into IndexedDB as the active state. The version history list itself is unchanged — the version you restored from remains available for future comparisons or restores.

If you realise the restore was a mistake, save the restored state as a new named version immediately so you have a recovery point, then make whatever corrections are needed.

---

- Previous: [Comparing Versions](comparing-versions.md)
- Next: [Excel Import](../11-import-export/excel-import.md)
