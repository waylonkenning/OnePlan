# User Story 13: GEANZ Asset Catalogue Integration

## Story

> **As** an IT portfolio manager,
> **I want** to see GEANZ technology areas collapsed in the visualiser and selectively populate them with assets,
> **So that** I can build my asset catalogue progressively without being overwhelmed by hundreds of empty swimlanes.

---

## Background

The GEANZ (Government Enterprise Architecture NZ) Technologies taxonomy defines 17 Application Technology areas (`TAP.01` – `TAP.17`), each containing a set of standard IT asset types. This feature embeds the taxonomy directly into the visualiser as collapsed area rows, letting users "Pre-populate" individual areas on demand and delete assets they no longer need.

---

## Acceptance Criteria

### AC1 — Area rows appear in the visualiser

- [ ] The 17 GEANZ application technology areas (`TAP.01` – `TAP.17`) appear as collapsed rows in the visualiser below any existing user-defined assets.
- [ ] Each area row displays the full GEANZ area name (e.g. "Artificial Intelligence (AI) application area").
- [ ] Area rows have a visually distinct treatment from asset swimlanes — muted background, clear section-header styling — so users understand they are structural groupings, not empty assets awaiting work.
- [ ] Area rows are hidden/absent if all their child assets have been pre-populated (the area is fully expanded into individual asset swimlanes).

### AC2 — Pre-populate button

- [ ] Each area row label contains an "+ Add all assets" button.
- [ ] Clicking the button adds all child assets for that area as individual Scenia `Asset` records (e.g. clicking TAP.17 adds "Narrow AI", "Machine Learning platform", etc.).
- [ ] Each created asset has its GEANZ `alias` (e.g. `TAP.17.01`) and `name` stored.
- [ ] After pre-populating, the area row collapses/disappears and the newly created asset swimlanes appear in its place.
- [ ] The button displays the count of assets that will be added, e.g. "+ Add all 6 assets".

### AC3 — Remove all assets

- [ ] Once an area has been pre-populated, a "Remove all assets" option is available on the area group (accessible via a context menu or secondary button on the area header if re-collapsed).
- [ ] Clicking "Remove all assets" shows a confirmation dialog: _"Remove [n] assets from [area name]? Initiatives and segments linked to these assets will also be deleted."_
- [ ] On confirmation, all assets in the area and their linked initiatives, segments, and milestones are deleted.
- [ ] On cancellation, nothing changes.

### AC4 — Trashcan delete on individual asset swimlanes

- [ ] Every asset swimlane label row shows a trashcan icon on hover.
- [ ] Clicking the trashcan on an asset that has **no** linked initiatives or segments deletes it immediately with no confirmation prompt.
- [ ] Clicking the trashcan on an asset that **has** linked initiatives or segments shows a confirmation dialog: _"Delete [asset name]? [n] initiative(s) and [n] segment(s) linked to this asset will also be deleted."_
- [ ] On confirmation, the asset and all its linked data are deleted and the swimlane is removed from the visualiser.
- [ ] On cancellation, nothing changes.

### AC5 — Persistence

- [ ] Pre-populated assets persist across page reloads (stored in IndexedDB).
- [ ] Deleted assets are removed from IndexedDB and do not reappear on reload.
- [ ] GEANZ area rows that have not been pre-populated re-appear correctly on reload.

### AC6 — No regressions

- [ ] The full Playwright test suite passes with no failures after implementation.

---

## Scope

**In scope:**
- Application Technology areas only (`TAP.01` – `TAP.17`)
- Pre-populate and remove-all at the area level
- Trashcan delete at the individual asset swimlane level

**Out of scope (future):**
- Other GEANZ top-level packages (Infrastructure, Network, Devices, Facilities, Locations)
- Partial pre-populate (selecting individual assets from a picker)
- Editing GEANZ asset names or aliases

---

## Schema Changes

Add optional fields to `Asset` in `src/types.ts`:

```typescript
export interface Asset {
  id: string;
  name: string;
  categoryId: string;
  maturity?: number;
  // New
  alias?: string;        // GEANZ alias, e.g. "TAP.17.01"
  externalId?: string;   // GEANZ GUID — prevents duplicate import
}
```

Add a new static data file `src/lib/geanzCatalogue.ts` exporting the 17 TAP areas and their child assets (sourced from the GEANZ CSV).

---

## Files to Create / Modify

| File | Change |
|---|---|
| `src/types.ts` | Add `alias?` and `externalId?` to `Asset` |
| `src/lib/db.ts` | Bump DB version (optional fields are backward compatible) |
| `src/lib/geanzCatalogue.ts` | New: static catalogue of 17 areas + child assets |
| `src/components/TimelineRow.tsx` (or equivalent) | Area row rendering + "Add all assets" button |
| `src/components/AssetSwimlaneLabel.tsx` (or equivalent) | Trashcan icon on hover |
| `e2e/geanz-catalogue.spec.ts` | New: E2E tests covering AC1–AC5 |
| `docs/user-guide/11-import-export/geanz-catalogue.md` | New: user-facing guide |

---

## E2E Test Plan (`e2e/geanz-catalogue.spec.ts`)

| Test | Scenario |
|---|---|
| Area rows visible | 17 TAP area rows appear in the visualiser on load |
| Area row styling | Area rows are visually distinct from asset swimlanes |
| Pre-populate | Clicking "+ Add all assets" on TAP.17 creates the correct assets |
| Pre-populate count badge | Button shows correct asset count before clicking |
| Area row hides after populate | TAP.17 area row disappears after pre-populate |
| Persistence | Pre-populated assets survive page reload |
| Trashcan — no linked data | Deleting an asset with no initiatives removes it immediately |
| Trashcan — with linked data | Deleting an asset with initiatives shows confirmation dialog |
| Trashcan — cancel | Cancelling confirmation leaves asset intact |
| Remove all | "Remove all assets" deletes all pre-populated assets for an area |
| Remove all — cancel | Cancelling confirmation leaves all assets intact |
| No regression | Full suite passes |
