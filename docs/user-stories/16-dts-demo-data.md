# User Story 16: DTS Template Demo Data

## Story

As a new user selecting the "NZ Digital Target State" template,
I want to see a pre-populated portfolio of NZ government initiatives across the DTS layers,
So that I can immediately understand how to use Scenia against the GCDO reference architecture without having to enter data from scratch.

## Acceptance Criteria

**AC1:** After selecting the DTS template, at least 6 initiative bars are visible in the timeline without any further user interaction.

**AC2:** Initiative bars appear across at least three distinct DTS layers (e.g. Digital Public Infrastructure, Channels, Common Consolidated Platforms).

**AC3:** At least one application lifecycle segment (coloured bar below the swimlane) is visible for a DTS asset.

**AC4:** Specific named initiatives are visible:
- "Identity Platform Uplift" (against Identity & Credential Services)
- "API Gateway Implementation" (against Data, API and AI Services Exchange)

**AC5:** DTS demo data is also loaded when the "Mixed" template is selected.

## Scope

- New file `src/lib/dtsDemoData.ts` — initiatives, milestones, applicationSegments for DTS assets
- Update `src/lib/workspaceTemplates.ts` to include DTS demo data for `dts` and `mixed` templates
- No changes to GEANZ demo data, types, or the DTS asset/category structure

## Files to Touch

- `src/lib/dtsDemoData.ts` — new
- `src/lib/workspaceTemplates.ts` — import and include DTS demo data
- `e2e/dts-demo-data.spec.ts` — new E2E tests
