# Card View

![Asset cards grouped by category on mobile](../../public/features/mobile-card-view.png)

On mobile viewports the Visualiser tab replaces the timeline with Card View — a scrollable list of asset cards, each showing its initiatives grouped into configurable time buckets. This layout is designed for reviewing and navigating your portfolio on a phone without requiring horizontal scrolling or precise touch targets.

## How cards are organised

Each asset appears as its own card. Cards are grouped by asset category, so related assets stay together as you scroll. Within each card, initiatives are listed under the time bucket they fall into based on their start date.

## Time buckets

Initiatives are grouped into one of five bucket modes:

| Mode | Groups initiatives by |
|---|---|
| Timeline | Configured date range (default) |
| Quarter | Calendar quarter of start date |
| Year | Calendar year of start date |
| Programme | Programme name |
| Strategy | Strategic theme |

The active bucket mode is shown in the mobile settings sheet. See [Mobile Settings](mobile-settings.md) to change it.

## Filtering by date range

Card View respects the start date and months window configured in mobile settings. Only initiatives whose start date falls within that window are shown. When initiatives exist in the portfolio but all fall outside the configured range, the card displays a distinct "outside date range" message rather than a generic empty state — this tells you the filter is hiding results, not that no initiatives exist.

## Opening an initiative

Tap any initiative row within a card to open the Initiative Panel. The panel shows full details and allows editing, identical to the desktop experience.

## Conflict badges

If an asset has scheduling conflicts, a conflict badge appears in the card header showing the number of affected initiatives. Tapping the badge does not navigate away — open the relevant initiative row to review the conflict detail. The Conflicts toggle in mobile settings can hide badges if you want a cleaner view.

## DTS workspace features

In DTS and Mixed workspaces, Card View has two additional options in the mobile settings sheet:

- **DTS Phase bucket mode** — groups initiative rows within each card by DTS adoption phase instead of by date or programme. Select "DTS Phase" from the bucket mode picker in settings.
- **Adoption Status toggle** — when enabled, shows a coloured adoption status badge on each asset card header, matching the status set in Data Manager → Assets. Use this to scan adoption progress across the portfolio at a glance.

## Switching to timeline view

Card View is only active when the viewport is at mobile width. Rotating to landscape or opening Scenia on a wider screen automatically restores the standard timeline.

---

- Previous: [PDF & SVG Export](../11-import-export/pdf-svg-export.md)
- Next: [Mobile Settings](mobile-settings.md)
