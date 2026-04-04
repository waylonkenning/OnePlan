# User Story: Modal Error Boundary

## Story ID
US-2026-04-04-004

## Context
If a modal component throws a JavaScript error during render, the current ErrorBoundary catches it and crashes the entire application, potentially causing data loss. Modals should be isolated so their errors don't take down the main app.

## Requirements
- Add a `ModalErrorBoundary` component that catches render errors inside modals
- Show a user-friendly "Something went wrong" dialog with a Close button
- Closing the error dialog dismisses the modal without crashing the app
- The main application remains fully functional after dismissal

## Acceptance Criteria

1. **Given** a modal throws a render error, **When** the error occurs, **Then** a `modal-error-boundary` overlay is shown instead of the full-page error boundary.

2. **Given** the `modal-error-boundary` is visible, **When** the user clicks Close, **Then** the overlay is dismissed and the modal is closed.

3. **Given** a modal error has been dismissed, **When** the user interacts with the rest of the app, **Then** the app functions normally (not crashed).

4. **Given** all modals, **When** any modal throws, **Then** the full-page `ErrorBoundary` is NOT triggered.

## Out of Scope
- Reporting modal errors to an external service
- Retry/reload functionality within the modal error UI

## Technical Notes
- `ModalErrorBoundary` is a React class component (required for `componentDidCatch`)
- `TestErrorThrower` in `ErrorBoundary.tsx` is used to trigger errors in e2e tests via `localStorage.setItem('scenia-test-throw', 'true')`
- `TestErrorThrower` is placed inside the `FeaturesModal` boundary for test targeting
