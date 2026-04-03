# User Story: Date Validation in Critical Path Algorithm

## Story ID
US-2026-04-04-005

## Context
The critical path algorithm in `criticalPath.ts` parses dates without validation. If an initiative has an invalid date (empty string, malformed ISO), `new Date()` returns `Invalid Date` which is `NaN` when converted, potentially causing incorrect critical path calculations.

## Requirements
- [ ] Validate dates before parsing in computeCriticalPath
- [ ] Handle invalid dates gracefully
- [ ] Skip initiatives with invalid dates in critical path calculation

## Acceptance Criteria

1. **Given** an initiative with an invalid startDate, **When** computeCriticalPath is called, **Then** the algorithm skips that initiative and calculates the critical path using only valid initiatives.

2. **Given** an initiative with an empty startDate or endDate, **When** computeCriticalPath is called, **Then** the algorithm handles this gracefully without throwing.

3. **Given** an initiative with a valid date range (startDate < endDate), **When** computeCriticalPath is called, **Then** the initiative is included in the calculation normally.

## Out of Scope
- Fixing the data in the UI (that's a separate issue)
- Providing error messages to users about invalid dates

## Technical Notes
- Check `isNaN(date.getTime())` after parsing to detect invalid dates
- Duration should default to 1 day minimum for any initiative
