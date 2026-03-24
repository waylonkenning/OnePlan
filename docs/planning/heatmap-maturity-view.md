# Feature Plan: IT Asset Maturity Heatmap (Report)

## Overview

A new **Maturity Heatmap** report that renders an ontology of IT assets — styled similarly to a TOGAF Technical Reference Model (TRM) — where each asset is represented as a coloured square within its capability group, with colour indicating maturity from red (1 – Emergent) through to green (5 – Optimised).

The report lives inside the existing **Reports** view, accessible via a new card on the reports landing page alongside Version History, Budget, Initiatives & Dependencies, and Capacity.

---

## User Story

**As a** technology portfolio manager,
**I want to** view all IT assets arranged by capability group and coloured by their maturity level,
**So that** I can immediately see where the portfolio is strong, where gaps exist, and where investment is needed.

### Acceptance Criteria

1. A "Maturity Heatmap" card appears on the Reports landing screen.
2. Selecting it renders a full-width TRM-style grid grouped by Asset Category (e.g. Identity & Access Management, Data Platform, Customer Channels, Core Banking, Cloud Infrastructure, Integration & APIs).
3. Each Asset Category is rendered as a labelled section/panel containing one square tile per asset belonging to that category.
4. Each tile displays:
   - The asset name (truncated if necessary).
   - A background colour derived from the asset's maturity level.
5. The maturity colour scale is:
   - **1 – Emergent:** Red (`#ef4444`)
   - **2 – Developing:** Orange (`#f97316`)
   - **3 – Defined:** Amber (`#f59e0b`)
   - **4 – Managed:** Lime (`#84cc16`)
   - **5 – Optimised:** Green (`#22c55e`)
6. Assets with no maturity set are rendered with a neutral grey tile and no colour fill.
7. A legend explaining the 1–5 colour scale is shown at the top of the report.
8. Clicking a tile opens an `AssetPanel` modal where the asset's maturity (and other fields) can be edited and saved.
9. Maturity can be set on any Asset via the Data Manager (Assets table) with a 1–5 dropdown.
10. Maturity data persists in IndexedDB and is captured in Version snapshots.
11. The full Playwright test suite remains green after the change.

---

## Maturity Scale

| Level | Label      | Colour  | Hex       | Meaning                                              |
|-------|------------|---------|-----------|------------------------------------------------------|
| 1     | Emergent   | Red     | `#ef4444` | Ad-hoc, undocumented, fragile                        |
| 2     | Developing | Orange  | `#f97316` | Partially documented, inconsistent practice          |
| 3     | Defined    | Amber   | `#f59e0b` | Standardised, documented, repeatable                 |
| 4     | Managed    | Lime    | `#84cc16` | Measured, monitored, proactively improved            |
| 5     | Optimised  | Green   | `#22c55e` | Continuously improving, industry-leading practice    |
| —     | Unrated    | Grey    | `#e2e8f0` | No maturity assessment has been recorded             |

---

## Visual Design

The report is laid out as a series of stacked capability group panels, mirroring the structure of a TOGAF TRM:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Maturity Heatmap                                                   │
│  Legend: [■ 1 Emergent] [■ 2 Developing] [■ 3 Defined]            │
│          [■ 4 Managed]  [■ 5 Optimised]  [■ Unrated]              │
├─────────────────────────────────────────────────────────────────────┤
│  IDENTITY & ACCESS MANAGEMENT                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Customer IAM │  │ Employee IAM │  │ Privileged   │             │
│  │    (CIAM)    │  │              │  │ Access Mgmt  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│   (green – 5)       (amber – 3)       (red – 1)                    │
├─────────────────────────────────────────────────────────────────────┤
│  DATA PLATFORM                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Enterprise  │  │    Data      │  │  Master Data │             │
│  │  Data Lake   │  │  Warehouse   │  │     Mgmt     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
├─────────────────────────────────────────────────────────────────────┤
│  CUSTOMER CHANNELS      CORE BANKING      CLOUD INFRASTRUCTURE ...  │
│  ...                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

- Tiles are a fixed square size (e.g. 120×80px), wrapping within their group panel.
- Group panels span full width, with a bold category label header.
- Category order follows the existing `AssetCategory.order` field.
- The report is desktop-only — it is not rendered or accessible on mobile viewports.
- The report is print/export friendly (full width, no horizontal scroll).

---

## Data Model Changes

### 1. Extend `Asset` type

```typescript
// src/types.ts
interface Asset {
  id: string;
  name: string;
  categoryId: string;
  maturity?: number;  // 1–5, optional — existing records unaffected
}
```

No changes to `Application` in MVP (heatmap is asset-level only).

### 2. No IndexedDB migration required

The `assets` object store already exists. Adding an optional field to stored records is backwards-compatible — `db.ts` version does not need to increment.

### 3. Demo data enrichment

Add `maturity` values to the existing demo assets in `demoData.ts` so the heatmap is populated on first run and visually demonstrates the full colour range.

---

## Component Changes

### New component: `AssetPanel.tsx`

**Location:** `src/components/AssetPanel.tsx`

**Purpose:** A slide-over edit modal for an individual Asset, following the exact same pattern as `InitiativePanel` and `DependencyPanel` — overlay backdrop, focus trap via `useFocusTrap`, Save and Delete buttons, `onSave` / `onDelete` / `onClose` callbacks.

**Fields:**
- Asset Name (text)
- Category (select, sourced from `assetCategories`)
- Maturity (select: blank / 1 Emergent / 2 Developing / 3 Defined / 4 Managed / 5 Optimised)

**Props:**
```typescript
interface AssetPanelProps {
  asset: Asset | null;
  assetCategories: AssetCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
}
```

This component is reusable — it can also be wired into the DataManager's Assets table in a future iteration to replace inline editing if desired. For now it is introduced by this feature and used exclusively from the heatmap.

---

### New report component: `MaturityHeatmap.tsx`

**Location:** `src/components/reports/MaturityHeatmap.tsx` (or inline in `ReportsView.tsx` consistent with existing report sections)

**Inputs:** `assets: Asset[]`, `assetCategories: AssetCategory[]` — already available in `ReportsViewProps`.

**Logic:**
1. Sort categories by `AssetCategory.order`.
2. For each category, filter assets by `categoryId`.
3. For each asset, derive tile background colour from `maturity` using the scale above; default to grey if unset.
4. Render category panels with wrapped tile grid.

**Colour helper:**

```typescript
function maturityColor(level?: number): string {
  const colors: Record<number, string> = {
    1: '#ef4444',
    2: '#f97316',
    3: '#f59e0b',
    4: '#84cc16',
    5: '#22c55e',
  };
  return level !== undefined ? colors[level] : '#e2e8f0';
}
```

### Changes to existing components

| Component | Change |
|---|---|
| `ReportsView.tsx` | Add `'maturity-heatmap'` to the `ReportSlug` union type; add a report card on the landing screen; render `<MaturityHeatmap />` when selected |
| `DataManager.tsx` | Add a **Maturity** column to the Assets table with a dropdown cell editor (values: blank / 1 / 2 / 3 / 4 / 5, labels matching the scale) |
| `demoData.ts` | Enrich demo assets with representative maturity values spanning the full 1–5 range |
| `App.tsx` | Wire `AssetPanel` open/close state and `onSave` handler (updates `appData.assets` and persists to IndexedDB, same pattern as initiative saves) |

---

## Development Sequence (CLAUDE.md TDD process)

### Step 1 — Requirements (this document) ✓

### Step 2 — E2E Tests (`e2e/heatmap.spec.ts`) — Red first

Tests to write:

- The Maturity Heatmap card is visible on the Reports landing screen.
- Navigating to it renders category group panels with correct headings.
- An asset with `maturity: 5` renders a tile with the green colour (`#22c55e`).
- An asset with `maturity: 1` renders a tile with the red colour (`#ef4444`).
- An asset with no maturity set renders a grey tile.
- Asset category order is respected (Core Banking before Cloud Infrastructure, etc.).
- Clicking a tile opens the `AssetPanel` modal.
- Saving a maturity change in `AssetPanel` updates the tile colour immediately.
- Maturity set in the Data Manager Assets table is reflected in the heatmap on the same session.
- Maturity persists across page reload.

### Step 3 — Implementation order

1. `src/types.ts` — add optional `maturity` to `Asset`.
2. `src/demoData.ts` — add maturity values to demo assets.
3. `src/components/AssetPanel.tsx` — new edit modal following `InitiativePanel` pattern.
4. `src/components/MaturityHeatmap.tsx` — build the heatmap report component.
5. `src/components/ReportsView.tsx` — add slug, landing card, and render.
6. `src/App.tsx` — wire `AssetPanel` state and save handler.
7. `src/components/DataManager.tsx` — add maturity column to Assets table.

### Step 4 — Verification

```bash
npx playwright test e2e/heatmap.spec.ts   # target tests green
npx playwright test                        # full suite green
```

### Step 5 — Documentation

Add a **Maturity Heatmap** section to `docs/user-guide/` covering:
- What the report shows.
- How to set an asset's maturity in the Data Manager.
- The maturity scale and what each level means.

### Step 6 — Commit & Push

Single commit once the full suite is green. Cloud Build deploys automatically to `https://scenia.website`.

---

## Resolved Design Decisions

| Decision | Resolution |
|---|---|
| Tile click behaviour | Clicking opens an `AssetPanel` modal to edit the asset (name, category, maturity). Saves update the heatmap immediately. |
| Category with no assessed assets | Panel is shown with all tiles rendered in grey ("Unrated"), making it visually clear the category exists but has not been assessed. |
| Mobile | Desktop-only. The report is not rendered or accessible on mobile viewports. |
