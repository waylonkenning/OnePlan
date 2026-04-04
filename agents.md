# Scenia Agent Development Process

This document defines the development workflow for all agent work on the **Scenia** repository.

---

## Development Lifecycle

All feature development and bug fixes must follow this strict sequence:

### 1. Create User Story
Create a markdown file in the branch that defines the work:
- **File naming:** `docs/user-stories/YYYY-MM-DD-short-description.md`
- **Content:** User story with story ID, context, requirements, and clear acceptance criteria
- Acceptance criteria must be **testable** (given/when/then format recommended)

### 2. Write Test First (TDD)
Write a **Playwright E2E test** that:
- Reproduces the bug OR validates the new feature
- Places the test in `e2e/` directory following existing naming conventions
- Test should **fail initially** (Red phase)
- Run test to confirm: `npx playwright test e2e/test-name.spec.ts`

### 3. Implement
Write the minimal code necessary to:
- Fulfill the requirements from the user story
- Adhere to established patterns (React, Tailwind, IndexedDB)
- Follow existing code style and conventions

### 4. Verify
- Run the specific test to confirm it passes: `npx playwright test e2e/test-name.spec.ts`
- Run the **full test suite** to ensure no regressions: `npx playwright test`
- All tests must pass before proceeding

### 5. Update Documentation
- Update the relevant user guide pages in `docs/user-guide/`
- Update README sections if applicable
- Document any new features or changed behavior

### 6. Commit & Push
- Commit only when full test suite is green
- Push to your feature branch
- Create PR for review

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React (TypeScript) + Vite |
| Styling | Tailwind CSS |
| State/Persistence | IndexedDB (via `idb` library) |
| Testing | Playwright |
| Deployment | Docker + Google Cloud Run + Google Cloud Build |

---

## Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Bug Fix | `fix-{short-description}` | `fix-undo-redo-race` |
| Feature | `feat-{short-description}` | `feat-excel-import-validation` |
| Refactor | `refactor-{short-description}` | `refactor-timeline-component` |
| Chore | `chore-{short-description}` | `chore-update-dependencies` |

---

## Commit Message Format

```
<type>(<scope>): <short description>

<longer description if needed>

Fixes: <issue reference>
```

**Types:** `fix`, `feat`, `refactor`, `chore`, `docs`, `test`

---

## Pull Request Process

1. Create PR from feature branch to `main`
2. PR description must include:
   - Summary of changes
   - Link to user story
   - Testing performed
3. CI/CD runs automatically on push
4. Review and merge when green

---

## User Story Template

```markdown
# User Story: [Short Title]

## Story ID
US-YYYY-MM-DD-XXX

## Context
Why is this needed? What problem does it solve?

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Acceptance Criteria
1. **Given** [context], **When** [action], **Then** [result]
2. **Given** [context], **When** [action], **Then** [result]

## Out of Scope
- Item 1
- Item 2

## Technical Notes
Any implementation hints or constraints.
```

---

## Deployment Targets

| Environment | URL |
|-------------|-----|
| Production | https://scenia.website |
| CI/CD | cloudbuild.yaml |
| Container | Dockerfile (Nginx on port 8080) |

---

## Quick Reference Commands

```bash
# Run specific test
npx playwright test e2e/test-name.spec.ts

# Run all tests
npx playwright test

# Build
npm run build

# Type check
npm run lint  # or: npx tsc --noEmit
```
