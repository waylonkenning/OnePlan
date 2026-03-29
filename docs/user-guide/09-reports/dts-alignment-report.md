# DTS Alignment Coverage Report

The DTS Alignment Coverage report gives a single-page view of where your agency stands against each of the 20 NZ Digital Target State assets. It is designed for GCDO reporting, cluster governance reviews, and internal progress tracking.

This report is only available in DTS and Mixed workspaces.

## What the Report Shows

The report renders a grid of all 20 DTS assets arranged in their six DTS layers. Each asset tile shows:

- **Adoption status** — colour-coded badge (see scale below)
- **Initiative count** — number of active or planned initiatives linked to that asset
- **Total budget** — sum of budgets for all initiatives linked to that asset

## Adoption Status Colour Scale

| Status | Colour | Meaning |
|---|---|---|
| Not Started | Grey | No delivery work planned or underway |
| Scoping | Yellow | Under investigation or in discovery |
| In Delivery | Blue | Active initiatives underway |
| Adopted | Green | DPI capability in production use |
| Decommissioning Incumbent | Orange | Legacy system being wound down as DPI equivalent goes live |
| Not Applicable | Light grey | This capability is not relevant to the agency |

## Setting Adoption Status

Adoption status is set per asset in **Data Manager → Assets**:

1. Open **Data Manager** and select the **Assets** tab.
2. Find the DTS asset row you want to update.
3. Click the **DTS Adoption Status** dropdown and select a value.

Changes take effect immediately and are reflected in the report on next open.

You can also enable the **DTS Adoption Status** toggle in the timeline display menu to show these status badges directly on asset row headers in the Visualiser.

## Navigating from the Report

Clicking any asset tile navigates to the timeline filtered to that asset, so you can inspect the initiatives and segments behind the figures.

## Exporting

The DTS Alignment Coverage report is included in the PDF and SVG export. Configure the view before exporting to capture it alongside the timeline.

For a structured data export, the [Excel export](../11-import-export/excel-export.md) includes a DTS Summary sheet with the same information in tabular form, suitable for attaching to a Treasury or GCDO submission.

---

- Previous: [Maturity Heatmap Report](maturity-heatmap-report.md)
- Next: [History Diff Report](history-diff-report.md)
