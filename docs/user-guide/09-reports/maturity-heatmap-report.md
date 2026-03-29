# Maturity Heatmap Report

The Maturity Heatmap gives you an at-a-glance view of how mature every IT asset in your portfolio is. Assets are arranged by capability group and coloured according to a five-level scale, making gaps and strengths immediately visible without reading numbers or tables.

## What the Report Shows

The report renders a grid of asset tiles, grouped into panels by Asset Category (e.g. Identity & Access Management, Data Platform, Core Banking). Each tile represents one IT asset and is coloured according to its maturity level.

Categories are ordered by their sort order as configured in Data Manager → Asset Categories. Assets with no maturity assessment recorded appear in grey.

## Maturity Colour Scale

| Level | Label | Colour |
|-------|-------|--------|
| 1 | Emergent | Red — ad-hoc, undocumented, fragile |
| 2 | Developing | Orange — partially documented, inconsistent practice |
| 3 | Defined | Amber — standardised, documented, repeatable |
| 4 | Managed | Lime — measured, monitored, proactively improved |
| 5 | Optimised | Green — continuously improving, industry-leading practice |
| — | Unrated | Grey — no maturity assessment recorded |

A legend summarising this scale is shown at the top of the report.

## Setting an Asset's Maturity

Maturity is set per asset in **Data Manager → Assets**:

1. Open the **Data Manager** (table icon in the main navigation).
2. Select the **Assets** tab.
3. Find the asset row you want to update.
4. Click the **Maturity** dropdown in that row and select a level (1–5).

The change takes effect immediately. Return to the Maturity Heatmap to see the tile colour updated.

You can also update maturity directly from the heatmap by clicking any tile to open the Asset Panel, changing the Maturity field, and clicking **Save Changes**.

## Editing an Asset from the Heatmap

Clicking a tile opens the **Asset Panel** — a slide-over editor where you can update the asset's name, category, and maturity level. Changes saved in the Asset Panel are reflected on the heatmap immediately.

Clicking **Cancel** or clicking outside the panel closes it without making any changes.

## Notes

- The Maturity Heatmap is a desktop-only report. It is not available on mobile viewports.
- Maturity data is stored in IndexedDB alongside all other portfolio data and is included in Version snapshots.
- Assets with no maturity set are shown with a grey tile. They are not hidden, so you can see at a glance which assets still need an assessment.

---

- Previous: [Capacity Report](capacity-report.md)
- Next: [DTS Alignment Report](dts-alignment-report.md)
