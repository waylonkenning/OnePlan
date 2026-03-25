# User Story 17: DTS Asset Label Wrapping and Attribution

## Story

As a user viewing the NZ Digital Target State template,
I want asset names to wrap fully within the sidebar and see a clear copyright notice,
So that long DTS asset names are readable and the data source is properly attributed.

## Acceptance Criteria

**AC1:** Long DTS asset names (e.g. "Headless Content Management System") wrap within the sidebar label rather than being truncated with an ellipsis.

**AC2:** Every DTS category header (cat-dts-*) displays a `© Crown copyright, CC BY 4.0` attribution note, matching the treatment of the GEANZ section header.

**AC3:** Non-DTS category headers (e.g. GEANZ demo categories like "Identity & Access Management") do NOT show the DTS attribution note.

## Scope

- `src/components/Timeline.tsx` — remove `truncate` from asset name label; add attribution to DTS category headers
- No data model changes
