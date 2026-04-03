# Budget Report

![Budget summary report with spend broken down by programme, strategy, and asset category](../../public/features/budget-report.png)

The Budget report summarises total spend across your portfolio, broken down by programme, strategy, and asset category. Use it to confirm funding allocation before a planning review or to spot categories that are over- or under-resourced.

## What the Report Shows

Spend figures are derived from the **CapEx** and **OpEx** fields recorded on each initiative in Data Manager. Each initiative has two separate budget inputs — Capital Expenditure (CapEx) and Operational Expenditure (OpEx) — and the report aggregates their combined total into four views:

- **By programme** — total budget across all initiatives belonging to each programme
- **By strategy** — total budget grouped by the strategic theme each initiative is tagged to
- **By asset category** — total budget grouped by the category of the asset each initiative belongs to
- **By DTS Phase** — total budget grouped by DTS adoption phase (Phase 1 – Register & Expose, Phase 2 – Integrate DPI, Phase 3 – AI & Legacy Exit, Back-Office Consolidation, Not DTS). This breakdown is only shown in DTS and Mixed workspaces.

The grand total displayed in the report equals the sum of all initiative CapEx + OpEx values in Data Manager. If a figure looks unexpected, check that both CapEx and OpEx fields are entered in Data Manager before investigating further.

## Verifying Totals

If you need to reconcile a figure, open Data Manager and filter by the programme, strategy, or asset category in question. Sum the CapEx and OpEx fields for the filtered initiatives — the combined sum should match the corresponding line in this report.

## Limitations

The report reflects only initiatives that have a budget value entered. Initiatives with no budget recorded do not contribute to any total and are not listed.

---

- Previous: [Initiatives & Dependencies Report](initiatives-dependencies-report.md)
- Next: [Capacity Report](capacity-report.md)
