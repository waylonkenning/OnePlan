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
| **Initiatives** | All initiatives with their fields (including CapEx and OpEx) |
| **Assets** | All application assets |
| **AssetCategories** | All asset category groupings |
| **Programmes** | All programmes |
| **Strategies** | All strategies |
| **Milestones** | All milestones |
| **Dependencies** | All initiative dependency relationships |
| **Applications** | All applications linked to assets |
| **ApplicationSegments** | All application lifecycle segments |
| **ApplicationStatuses** | All named status labels for segments |
| **Resources** | All people and roles in the resources roster |
| **DTS Summary** | One row per DTS asset showing adoption status, active initiative count, and total CapEx/OpEx. Only included when exporting from a DTS or Mixed workspace. |

Each sheet (except DTS Summary) uses column headers that match the field names expected by the [Excel Import](excel-import.md) process. This means an exported file can be edited and re-imported without reformatting.

## Keeping exports current

The export reflects the state of the portfolio at the moment you click the button. It is not a live feed. If you share the file with others and the portfolio changes afterward, export again to produce an updated file.

---

- Previous: [Excel Import](excel-import.md)
- Next: [PDF & SVG Export](pdf-svg-export.md)
