# User Story: Bundle Size Optimization via Code Splitting

## Story ID
US-2026-04-04-003

## Context
The production bundle is 1.8MB (552KB gzipped), which is too large for initial page load. The application should use code splitting to reduce the initial bundle, loading heavy components like ReportsView, DataManager, and modals only when needed.

## Requirements
- [ ] Implement code splitting using dynamic `import()`
- [ ] Split heavy components (ReportsView, DataManager, HelpView)
- [ ] Lazy load modals (TutorialModal, FeaturesModal, etc.)
- [ ] Ensure no regression in functionality
- [ ] Bundle size should be reduced by at least 30%

## Acceptance Criteria

1. **Given** a user loads the application, **When** the initial page loads, **Then** the main bundle is reduced by at least 30% and the critical path loads faster.

2. **Given** a user navigates to the Reports view, **When** the view is accessed, **Then** the ReportsView code is loaded dynamically.

3. **Given** a user opens any modal, **When** the modal is triggered, **Then** the modal code is loaded dynamically.

4. **Given** a user runs the build, **When** the build completes, **Then** the build output shows smaller chunk sizes with no single chunk exceeding 500KB.

## Out of Scope
- Service worker / offline caching
- Preloading strategies
- DNS prefetching

## Technical Notes
- Use React.lazy() for component-level code splitting
- Use Vite's built-in chunking configuration
- Consider route-based splitting for views (visualiser, data, reports, guide)
- Ensure ErrorBoundary is in place for lazy loaded components
