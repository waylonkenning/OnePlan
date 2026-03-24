# User Story 15: Workspace Templates (Multi-Taxonomy Support)

## Story

As a new user opening Scenia for the first time,
I want to choose which taxonomy or reference framework best matches my agency's needs,
So that I start with a relevant portfolio structure without having to configure everything from scratch.

## Acceptance Criteria

**AC1:** On first load (empty IndexedDB, no prior session), a TemplatePickerModal is shown with 4 template cards before any data is loaded into the visualiser.

**AC2:** The modal shows exactly 4 template cards:
- NZ Digital Target State (`template-card-dts`)
- GEANZ Technology Catalogue (`template-card-geanz`)
- Mixed (`template-card-mixed`)
- Blank (`template-card-blank`)

**AC3:** Selecting "NZ Digital Target State" loads the 6 DTS layer categories and 20 DTS assets as regular swimlanes. The GEANZ catalogue section is hidden.

**AC4:** Selecting "GEANZ Technology Catalogue" loads the existing GEANZ demo portfolio (current default behaviour). The GEANZ catalogue section is visible.

**AC5:** Selecting "Mixed" loads the 6 DTS layer categories and 20 DTS assets, with the GEANZ catalogue section also visible for browsing.

**AC6:** Selecting "Blank" loads an empty workspace with no assets and no categories. The GEANZ catalogue section is hidden.

**AC7:** The template picker is NOT shown in E2E test mode (`scenia-e2e` localStorage flag). Demo data loads automatically (GEANZ template) so all existing tests continue to pass without modification.

**AC8:** The template picker is NOT shown on subsequent loads when IndexedDB already contains data.

## Scope

- No changes to `Asset`, `AssetCategory`, or `Initiative` types beyond optional `templateId?: string` in `TimelineSettings`
- DTS assets render as regular swimlane rows — no special rendering logic needed
- GEANZ catalogue section visibility is controlled by `settings.showGeanzCatalogue !== false`

## Files to Create / Modify

| File | Change |
|------|--------|
| `src/lib/dtsCatalogue.ts` | New — DTS categories and assets |
| `src/lib/workspaceTemplates.ts` | New — template descriptors and `getTemplateData()` |
| `src/components/TemplatePickerModal.tsx` | New — first-load modal with 4 template cards |
| `src/types.ts` | Add `templateId?: string` and `showGeanzCatalogue?: boolean` to `TimelineSettings` |
| `src/components/Timeline.tsx` | Make GEANZ section conditional on `settings.showGeanzCatalogue !== false` |
| `src/App.tsx` | Show TemplatePickerModal when DB empty (non-E2E); auto-load GEANZ in E2E mode |
| `e2e/workspace-templates.spec.ts` | New E2E tests |
