# User Story: Error Boundaries for Modals

## Story ID
US-2026-04-04-004

## Context
Currently, if a modal component (TutorialModal, FeaturesModal, etc.) throws an error during render, only the top-level ErrorBoundary catches it, potentially losing user's unsaved work. Individual error boundaries around modals would provide better error isolation and user experience.

## Requirements
- [ ] Add ErrorBoundary wrapper around each modal
- [ ] Ensure modals show graceful error state instead of crashing
- [ ] Preserve parent application state on modal errors
- [ ] Allow user to dismiss modal and continue working

## Acceptance Criteria

1. **Given** a modal throws an error during render, **When** the error occurs, **Then** the modal shows a graceful error message and the parent application remains functional.

2. **Given** the user dismisses the modal error, **When** they click close/dismiss, **Then** the modal closes and they can continue interacting with the application.

3. **Given** multiple modals are open, **When** one modal throws an error, **Then** only that modal is affected; other modals and the main application remain functional.

## Out of Scope
- Error recovery within a modal (re-rendering the modal content)
- Error logging/monitoring (Sentry integration)

## Technical Notes
- Create a ModalErrorBoundary component that wraps modal content
- Each wrapped modal should have its own error boundary instance
- Error boundary should not prevent the modal from closing
