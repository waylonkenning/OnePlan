# Comparing Versions

![Version comparison diff report](../../public/features/version-history-diff-report.png)

The diff report lets you see exactly what changed between a saved baseline and your current portfolio state. Use it to audit changes before a board review, document decisions after a planning cycle, or investigate how the plan evolved over time.

## Opening the diff report

1. Navigate to the **Reports** view.
2. Select **History Differences** from the report list.
3. If no versions have been saved, the panel shows an empty state with a prompt to save your first version. Follow the link to [Saving a Version](saving-a-version.md).
4. If one or more versions exist, a version selector appears. Choose the saved version you want to compare against your current state.

## Reading the diff report

The report groups changes into three categories:

| Category | Meaning |
|---|---|
| **Added** | Items present in the current state but not in the selected baseline |
| **Removed** | Items present in the baseline but deleted from the current state |
| **Modified** | Items present in both, where one or more fields have changed |

Each row identifies the item by name and type (initiative, asset, programme, strategy, or milestone). Modified rows show the old and new values for each changed field.

## Limitations

The diff compares the selected saved version against the live current state only. Comparing two arbitrary saved versions against each other is not supported; save a version immediately after the state you want as "version A", then compare from there.

If a version fails to load — for example because its IndexedDB record was removed outside the app — an error message is shown in place of the report. Saving a new version and retrying will resolve the issue.

---

- Previous: [Saving a Version](saving-a-version.md)
- Next: [Restoring a Version](restoring-a-version.md)
