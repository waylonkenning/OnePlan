# Scenia SDLC Guide — From Idea to Production

This guide walks through the full development lifecycle for a Scenia feature, following the process defined in `CLAUDE.md`. Every step is mandatory — skip none.

---

## Overview

```
1. Write User Story  →  2. Write Failing Test  →  3. Implement  →  4. Verify  →  5. Document  →  6. Commit & Push
```

---

## Step 1 — Define the User Story

Before writing a single line of code or test, document the requirement.

### Where to put it

User stories live in `docs/user-stories/`. Each file covers a feature domain (e.g. `02-initiative-management.md`). Add your story to the appropriate file, or create a new numbered file if it belongs to a new domain.

### Format

```markdown
## US-{DOMAIN}-{NUMBER}: {Short Title}

**As an** {role},
**I want** {capability},
**so that** {benefit}.

**Acceptance Criteria:**
- {Specific, testable criterion}
- {Specific, testable criterion}
- {Specific, testable criterion}
```

### Example

```markdown
## US-IM-02: Delete an Initiative

**As an** IT portfolio manager,
**I want** to delete an initiative from the edit panel,
**so that** I can remove cancelled or mistaken entries.

**Acceptance Criteria:**
- A delete button is visible in the InitiativePanel for existing initiatives
- Clicking delete shows a confirmation modal (no browser `window.confirm`)
- Confirming removes the initiative from the timeline and from IndexedDB
- Cancelling keeps the initiative unchanged
```

### Rules
- Each acceptance criterion must be directly testable — avoid vague language like "works correctly".
- The story is the source of truth. If a criterion is not in the AC, it is out of scope.
- Use the `US-{DOMAIN}-{NUMBER}` ID convention (e.g. `US-TV-01`, `US-IM-03`).

---

## Step 2 — Write the Failing Test (Red)

With the AC written, translate each criterion into a Playwright E2E test **before implementing anything**.

### Where to put it

Tests live in `e2e/`. Name the file after the feature being tested:

```
e2e/confirm-modal.spec.ts
e2e/initiative-delete.spec.ts
e2e/version-history.spec.ts
```

### Test structure

```typescript
import { test, expect, Page } from '@playwright/test';

// Selector constants at the top — never inline magic strings
const PANEL = '[data-testid="initiative-panel"]';
const DELETE_BTN = '[data-testid="delete-initiative-btn"]';
const CONFIRM_MODAL = '[data-testid="confirm-modal"]';
const CONFIRM_BTN = '[data-testid="confirm-modal-confirm"]';
const CANCEL_BTN = '[data-testid="confirm-modal-cancel"]';

// Helper functions for repeated navigation steps
async function openInitiativePanel(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[data-initiative-id]');
  const bar = page.locator('[data-initiative-id]').first();
  await bar.click({ force: true });
  await page.getByTestId('initiative-action-edit').click();
  await expect(page.locator(PANEL)).toBeVisible();
}

test.describe('Initiative deletion', () => {
  test('delete button is visible in the panel', async ({ page }) => {
    await openInitiativePanel(page);
    await expect(page.locator(DELETE_BTN)).toBeVisible();
  });

  test('clicking delete opens confirm modal, not a browser dialog', async ({ page }) => {
    // Fail immediately if a native browser dialog fires
    page.on('dialog', async dialog => {
      await dialog.dismiss();
      throw new Error(`Unexpected browser dialog: "${dialog.message()}"`);
    });

    await openInitiativePanel(page);
    await page.locator(DELETE_BTN).click();
    await expect(page.locator(CONFIRM_MODAL)).toBeVisible();
  });

  test('cancelling keeps the initiative unchanged', async ({ page }) => {
    await openInitiativePanel(page);
    await page.locator(DELETE_BTN).click();
    await page.locator(CANCEL_BTN).click();
    await expect(page.locator(PANEL)).toBeVisible(); // panel still open
  });

  test('confirming removes the initiative from the timeline', async ({ page }) => {
    await openInitiativePanel(page);
    const initiativeId = await page.locator('[data-initiative-id]').first().getAttribute('data-initiative-id');

    await page.locator(DELETE_BTN).click();
    await page.locator(CONFIRM_BTN).click();

    await expect(page.locator(`[data-initiative-id="${initiativeId}"]`)).not.toBeVisible();
  });
});
```

### Confirm the test fails

Run only the new test file:

```bash
npx playwright test e2e/initiative-delete.spec.ts
```

Verify it **fails** (Red). If it passes before implementation, the test is wrong — fix it.

---

## Step 3 — Implement the Feature

With a failing test as the target, write the minimal code to make it pass.

### Guidelines

- **Minimal:** only add what is required to satisfy the AC. Do not add extra fields, options, or abstractions "for later".
- **Patterns:** follow established patterns — React functional components, Tailwind for styling, `idb` for IndexedDB persistence.
- **`data-testid` attributes:** every interactive element the tests target must have a stable `data-testid`. Never use class names or text content as test selectors.
- **No `window.confirm`:** all destructive confirmations use the in-app `ConfirmModal` component.

### Common file locations

| What | Where |
|------|-------|
| React components | `src/components/` |
| IndexedDB logic | `src/db/` or `src/hooks/` |
| Types / interfaces | `src/types.ts` |
| Utility functions | `src/utils/` |

---

## Step 4 — Verify (Green + No Regressions)

### Run the specific test

```bash
npx playwright test e2e/initiative-delete.spec.ts
```

All tests in the file must pass (Green).

### Run the full suite

```bash
npx playwright test
```

**Every test must pass.** A regression anywhere blocks the commit — fix the regression before proceeding. Do not skip or disable existing tests.

### Debugging failures

```bash
# Run with UI for interactive debugging
npx playwright test --ui

# Run headed to watch the browser
npx playwright test --headed

# Show the HTML report after a run
npx playwright show-report
```

---

## Step 5 — Document

Update the relevant documentation before committing. Documentation is not optional.

### User guide

Add or update pages in `docs/user-guide/` that describe the feature to an end user. The directory mirrors the feature domain structure:

```
docs/user-guide/03-initiatives/deleting-an-initiative.md
```

Keep pages concise — what the user sees, what they click, what happens.

### User story file

If the implementation deviated from any AC (e.g. the design evolved during coding), update `docs/user-stories/` to match reality.

### README / FEATURES

If the feature is user-visible and significant, add a line to `FEATURES.md`.

---

## Step 6 — Commit & Push

Only commit once:
- The specific test passes (Green)
- The full suite passes (no regressions)
- Documentation is updated

### Commit message format

Use a conventional commit prefix and keep the subject line under 72 characters:

```
feat: add delete confirmation modal to InitiativePanel (US-IM-02)
fix: prevent browser dialog on dependency delete (US-DM-05)
test: add E2E coverage for cascading deletes (US-IM-02)
docs: update deleting-an-initiative user guide
```

Reference the User Story ID in the message when applicable.

### Push

```bash
git push
```

Google Cloud Build detects the push automatically via the GitHub trigger and runs the `cloudbuild.yaml` pipeline. **No manual GCP console steps are needed.** The build will containerise the app and deploy to Cloud Run at https://scenia.website.

---

## Quick Reference Checklist

```
[ ] User story written with testable AC in docs/user-stories/
[ ] E2E test written in e2e/ — confirmed FAILING before implementation
[ ] Feature implemented with data-testid attributes on all interactive elements
[ ] Specific test passes (Green)
[ ] Full suite passes — npx playwright test
[ ] User guide page created/updated in docs/user-guide/
[ ] Committed with conventional message referencing US ID
[ ] Pushed — Cloud Build deploys automatically
```
