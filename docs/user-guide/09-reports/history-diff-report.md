# History Diff Report

![History diff report showing inline differences between two saved portfolio versions](../../public/features/history-diff-report.png)

The History Diff report lets you compare two saved versions of your portfolio side by side. Use it to understand what changed between planning cycles, audit edits made during a review, or produce a change summary for stakeholders.

## Before You Start

The diff report requires at least one saved version. If no versions have been saved yet, the report displays an empty state with a prompt to save your first version. See [Saving a Version](../10-version-history/saving-a-version.md) for instructions.

## Selecting Versions to Compare

Once at least one version exists, a version selector appears at the top of the report. Choose the two versions you want to compare — a baseline (older) version and a comparison (newer) version. The report generates an inline diff immediately after both versions are selected.

## Reading the Diff

Changes are displayed inline. Added content is highlighted to indicate it did not exist in the baseline version. Removed content is marked to show it was present in the baseline but absent in the comparison. Unchanged content appears without highlighting.

Work through the diff section by section — initiatives, dependencies, budgets, and resource assignments — to build a complete picture of what changed between the two snapshots.

## Error States

If the report cannot load the selected versions, an error message is displayed. This can occur if a version was deleted or if the underlying data is corrupt. If you see an error, return to the version selector, choose a different version, and try again. If the problem persists, check the Version History section to confirm the version still exists.

---

- Previous: [DTS Alignment Report](dts-alignment-report.md)
- Next: [Saving a Version](../10-version-history/saving-a-version.md)
