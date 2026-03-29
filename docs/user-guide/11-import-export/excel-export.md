# Excel Export

![Excel export button in Data Manager](../../public/features/excel-export-data-manager.png)

Exporting to Excel produces a structured `.xlsx` file containing your full portfolio data. Use this to share data with stakeholders who work outside Scenia, feed downstream reporting tools, or create an offline backup of the current state.

## How to export

1. Open the **Data Manager** panel.
2. Click **Export Excel**.

The file downloads automatically. No configuration or confirmation step is required.

## File contents

The exported workbook contains one sheet per data type:

| Sheet | Contents |
|---|---|
| Sheet | Contents |
|---|---|
| **Initiatives** | All initiatives with their fields |
| **Assets** | All application assets |
| **Programmes** | All programmes |
| **Strategies** | All strategies |
| **Milestones** | All milestones |
| **DTS Summary** | One row per DTS asset showing adoption status, active initiative count, total budget, lead owner, and target adoption date. Only included when exporting from a DTS or Mixed workspace. |

Each sheet (except DTS Summary) uses column headers that match the field names expected by the [Excel Import](excel-import.md) process. This means an exported file can be edited and re-imported without reformatting.

## Keeping exports current

The export reflects the state of the portfolio at the moment you click the button. It is not a live feed. If you share the file with others and the portfolio changes afterward, export again to produce an updated file.

---

- Previous: [Excel Import](excel-import.md)
- Next: [PDF & SVG Export](pdf-svg-export.md)
