# User Stories — Navigation, UX & Accessibility

## US-UX-01: Undo and Redo Changes

**As an** IT portfolio manager,
**I want** to undo and redo changes to the portfolio,
**so that** I can experiment freely without fear of making irreversible mistakes.

**Acceptance Criteria:**
- Undo (Cmd/Ctrl+Z) and Redo (Cmd/Ctrl+Shift+Z) keyboard shortcuts work
- Undo/Redo buttons are visible in the header
- The undo history stack holds at least 50 operations
- Operations beyond the limit drop the oldest entry (not the newest)

---

## US-UX-02: Use Keyboard Shortcuts

**As an** IT portfolio manager,
**I want** a keyboard shortcuts reference I can open from within the app,
**so that** I can discover and remember shortcuts without consulting external docs.

**Acceptance Criteria:**
- A keyboard shortcuts button is visible in the header
- Clicking it opens a modal listing all active shortcuts (Undo, Redo, Escape, Tab)
- The modal can be dismissed with Escape or the close button

---

## US-UX-03: Persist Data Across Sessions

**As an** IT portfolio manager,
**I want** my data to be saved automatically in the browser,
**so that** I never lose work when I close or refresh the tab.

**Acceptance Criteria:**
- All changes are persisted to IndexedDB automatically (no manual save button needed)
- On first load with an empty database, the demo dataset is initialised automatically
- All data is private and never leaves the browser

---

## US-UX-04: Recover from App Errors Gracefully

**As an** IT portfolio manager,
**I want** the app to show a friendly error screen if something goes wrong,
**so that** a render error doesn't leave me with a blank page.

**Acceptance Criteria:**
- A render error in any component shows a "Something went wrong" UI with a Reload button
- Normal operation is unaffected when no errors occur

---

## US-UX-05: Use an In-App Tutorial

**As a** new user,
**I want** to see an onboarding tutorial when I first open the app,
**so that** I can understand the key features before diving into my data.

**Acceptance Criteria:**
- The tutorial modal appears automatically on first load
- The tutorial can be manually triggered via the Help button at any time
- Tutorial content covers: timeline overview, visualiser interaction, initiative panel, insights/reports, data manager

---

## US-UX-06: Learn About Features via the Features Modal

**As an** IT portfolio manager,
**I want** to browse a gallery of all product features,
**so that** I can discover capabilities I haven't used yet.

**Acceptance Criteria:**
- A features modal opens and displays all feature cards
- Feature cards include: Dependency Mapping, Intuitive Canvas, Conflict Detection, Version History, Excel & PDF Export, 100% Private, and others
- Cards show either a screenshot or a compact icon+description layout where a screenshot is not applicable
- All feature card screenshots are valid images that load correctly

---

## US-UX-07: Confirm Before Destructive Actions

**As an** IT portfolio manager,
**I want** all destructive actions to require an in-app confirmation,
**so that** I don't accidentally delete important data.

**Acceptance Criteria:**
- All destructive actions use an in-app ConfirmModal — no browser `window.confirm` dialogs
- Cancel keeps data unchanged
- Confirm executes the action
- Covered actions: EditableTable Clear All, DataManager Reset, DependencyPanel delete, InitiativePanel delete, VersionManager delete/restore

---

## US-UX-08: Use Accessible Table Controls

**As a** user relying on assistive technology,
**I want** Data Manager table inputs to have descriptive labels,
**so that** screen readers can announce what each cell is for.

**Acceptance Criteria:**
- Real-row text inputs carry an `aria-label` matching the column label
- Ghost-row (new row) text inputs carry an `aria-label` matching the column label
- Real-row select fields carry an `aria-label` matching the column label
- Real-row checkbox fields carry an `aria-label` matching the column label

---

## US-UX-09: Keep Panels Focused with a Focus Trap

**As a** keyboard user,
**I want** focus to stay inside any open panel or modal,
**so that** Tab key navigation doesn't unexpectedly jump to elements behind the panel.

**Acceptance Criteria:**
- InitiativePanel, DependencyPanel, and VersionManager all close when Escape is pressed
- Tab cycles focus within the InitiativePanel without escaping to the background

---

## US-UX-10: Undo/Redo Edge Case Behaviour (Safety)

**As an** IT portfolio manager,
**I want** undo/redo to behave predictably in edge cases,
**so that** I can trust it won't silently fail or corrupt my in-progress edits.

**Acceptance Criteria:**
- AC1: On fresh page load with no edits, both the Undo and Redo buttons are disabled
- AC2: After undoing an action, performing any new edit clears the redo stack (Redo button becomes disabled)
- AC3: Pressing Cmd/Ctrl+Z while focus is inside an input or textarea field triggers the browser's native text undo — it does not pop the app-level undo stack
