# Mobile Viewport Design Research

_Generated: 2026-03-17_

This document analyses what a mobile-responsive version of OnePlan would look like on iPhone and Android smartphones (320–430px viewport width). It covers the current layout's constraints, a proposed design for each view, and the implementation approach.

---

## 1. Current State — Why It Breaks on Mobile

The app has no mobile layout. All header controls use `shrink-0` (they refuse to compress), the Timeline sidebar is a fixed 256px, and no Tailwind breakpoint classes are applied to the main app shell. The result on a 390px iPhone:

| Area | Problem |
|------|---------|
| **Header** | ~35 controls in a single flex row — overflows horizontally at any width below ~1100px |
| **Search input** | `w-44` (176px) — consumes 45% of a 390px screen by itself |
| **Timeline sidebar** | Fixed 256px — leaves only 134px for the entire timeline canvas |
| **Timeline canvas** | `w-max` layout; 12-month view at default zoom is ~960px wide |
| **DataManager table** | `table-fixed` with 9+ columns — requires ~800px to be usable |
| **Panels** | `w-full max-w-md` — already full-width on mobile, this is fine |
| **LandingPage** | Already responsive with `md:` / `sm:` breakpoints — no changes needed |
| **ReportsView** | `max-w-3xl mx-auto` — readable on mobile as-is |

The viewport meta tag is present (`width=device-width, initial-scale=1.0`), so the browser will not scale down — the overflow will just clip.

---

## 2. Guiding Principles

1. **Read-first on mobile.** Stakeholders reviewing a roadmap on a phone need to scan and understand it, not build it. Heavy editing actions (inline cell editing, dependency drawing, drag-resize) can be desktop-only.
2. **Progressively enhance.** Keep all existing desktop code intact. Add mobile-specific layouts using Tailwind breakpoints (`<md:` styles), not by replacing existing components.
3. **One primary action per screen.** The header on desktop has ~35 controls. On mobile it should have at most 5–6 visible, with the rest in a sheet or drawer.
4. **Horizontal scroll is acceptable on the timeline.** This is standard on mobile Gantt/calendar apps. The sidebar should shrink but the timeline canvas can still scroll.

---

## 3. Proposed Design — View by View

### 3.1 App Shell & Header

**Desktop (unchanged):** Single-row header with all controls.

**Mobile (`< md`, i.e. < 768px):**

```
┌─────────────────────────────────────┐
│ OnePlan          [search] [⋮ menu]  │  ← ~48px tall
└─────────────────────────────────────┘
│  [Visualiser] [Data] [Reports]      │  ← tab bar, full width
└─────────────────────────────────────┘
```

- **Logo** stays top-left (whitespace-nowrap already handles this).
- **View tabs** move to a full-width tab bar below the logo row, or become a bottom navigation bar (iOS convention).
- **Search** collapses to an icon button that expands to a full-width input on tap.
- **All timeline settings** (Start date, Months, zoom, conflict/relationship toggles) move into a bottom sheet triggered by a single settings icon (`⋮` or `SlidersHorizontal`).
- **History, Undo/Redo, Export** consolidate into the `⋮` overflow menu.
- **Features/Tutorial** hidden on mobile (or accessible via the `⋮` menu).

**Implementation:** Wrap the header controls in conditional rendering blocks:
```tsx
// Show on desktop only
<div className="hidden md:flex items-center gap-3">
  {/* full desktop controls */}
</div>

// Show on mobile only
<div className="flex md:hidden items-center gap-2">
  <SearchToggleButton />
  <MobileMenuButton />
</div>
```

---

### 3.2 Timeline / Visualiser

This is the hardest view. The core challenge is that a swimlane chart is inherently wide.

**Proposed mobile layout:**

```
┌──────────────┬──────────────────────────────────────────→ scroll
│ Asset Name   │  Jan 2026  │  Feb 2026  │  Mar 2026  │
│ (120px)      ├────────────┼────────────┼────────────┤
│ Data         │  ████ Initiative A ████ │            │
│ Platform     │            │  ██ Init B │            │
├──────────────┼────────────┼────────────┼────────────┤
│ Security     │            │  ████████████████████   │
└──────────────┴────────────┴────────────┴────────────┘
```

**Changes:**
- **Sidebar narrows to 120px** on mobile (from 256px). Asset names truncate with a tooltip on tap.
- **Default zoom auto-reduces** to 0.75× on viewports < 768px so more months fit without scrolling.
- **Dependency arrows still render** but are thinner on mobile (`stroke-width: 1` instead of 1.5).
- **Initiative bars** show a truncated name only; description and budget labels are hidden on mobile (they're already gated by the `descriptionDisplay` toggle, which would default to off on narrow viewports).
- **Tapping a bar** opens the InitiativePanel slide-in sheet (already full-width on mobile — works as-is).
- **Drag-to-resize and drag-to-move** are disabled on mobile (touch events on SVG are unreliable and the UX for dragging a 20px handle on a touchscreen is poor). A banner or tooltip indicates "Use desktop for editing."
- **Dependency drawing** (vertical drag to create arrows) is disabled on mobile.
- **The "Now" indicator line** still renders.

**Implementation:**
- Add a `useMobileLayout` hook: `const isMobile = useMediaQuery('(max-width: 767px)')`.
- Pass `isMobile` into Timeline as a prop.
- In Timeline.tsx: `const SIDEBAR_WIDTH = isMobile ? 120 : 256`.
- Gate drag handlers: `if (!isMobile) { /* attach drag handlers */ }`.

---

### 3.3 Data Manager

The table editor is not usable on mobile in its current form. Options:

**Option A — Horizontal scroll only (minimal effort):**
Wrap the table in `overflow-x-auto`. The table stays the same; users can scroll horizontally to see all columns. Acceptable for read-only review.

**Option B — Card layout (medium effort):**
On mobile, replace each table row with a card:
```
┌─────────────────────────────────┐
│ Initiative A                    │
│ Asset: Data Platform            │
│ Programme: Cloud Transformation │
│ Jan 2026 → Jun 2026   £150,000  │
│                    [Edit] [Del] │
└─────────────────────────────────┘
```
Cards are easier to read and tap. Editing opens the existing panel components. This requires a separate mobile render path for EditableTable.

**Option C — Read-only on mobile, edit on desktop (recommended for v1):**
Display a simplified read-only card list on mobile. Show a "Switch to desktop for editing" banner. This matches the "read-first" principle and requires the least engineering risk.

**Recommendation:** Implement Option A immediately (1-line change), plan Option C for a future release.

---

### 3.4 Panels (InitiativePanel & DependencyPanel)

Already work on mobile:
- `w-full max-w-md` means they go full-width on screens narrower than 448px.
- Slide-in from right animation works on mobile.
- The scrollable form body (`flex-1 overflow-y-auto p-6`) handles tall forms.

**Minor improvements needed:**
- Reduce padding from `p-6` to `p-4` on mobile for more form space.
- Ensure `<input>` and `<select>` elements are at least 44px tall for touch targets (currently they are ~32px with `py-1.5`).
- Add `inputmode="numeric"` to budget and date fields for better mobile keyboards.

---

### 3.5 Reports View

Already reads well on mobile. The `max-w-3xl mx-auto` container constrains content width. Only change needed:
- Reduce `p-6` padding to `p-4` on mobile.
- Ensure the version selector dropdowns have adequate touch target height.

---

### 3.6 Landing Page

Already fully responsive. No changes needed.

---

## 4. Touch Interaction Model

| Gesture | Desktop | Mobile |
|---------|---------|--------|
| Tap initiative bar | Open InitiativePanel | Open InitiativePanel ✓ |
| Drag bar left/right | Move dates | Disabled (scroll instead) |
| Drag bar edge | Resize dates | Disabled |
| Vertical drag between bars | Create dependency | Disabled |
| Tap dependency arrow | Open DependencyPanel | Open DependencyPanel ✓ |
| Tap milestone | Drag to move | Read-only ✓ |
| Double-tap empty row | Create initiative | Disabled (use + button) |
| Pinch | N/A | Consider for zoom (future) |
| Two-finger scroll | N/A | Standard OS scroll ✓ |

**Mobile "create initiative" alternative:** A floating `+` button (FAB) in the bottom-right corner that opens the InitiativePanel in create mode, with asset/date fields pre-populated to sensible defaults.

---

## 5. Bottom Navigation (iOS-style Alternative)

Rather than squeezing the view tabs into the top header on mobile, a bottom tab bar is the iOS/Android convention:

```
┌─────────────────────────────────────┐
│                                     │
│         [Timeline content]          │
│                                     │
├──────────┬────────────┬─────────────┤
│ 📅       │    📊      │    📄       │
│Visualiser│  Data Mgr  │  Reports    │
└──────────┴────────────┴─────────────┘
```

This frees up the top bar for just the logo + search + settings icon.

---

## 6. Implementation Phasing

### Phase 1 — Foundation (low effort, high impact)
- Add `useMediaQuery` hook.
- Shrink outer padding: `p-6` → `p-3` on mobile.
- Make header overflow-x-auto so at least the controls are reachable.
- Narrow the timeline sidebar to 120px on mobile.
- Set default zoom to 0.75× on mobile.
- Wrap DataManager table in `overflow-x-auto`.

### Phase 2 — Mobile Header (medium effort)
- Collapse header to logo + search icon + menu icon on mobile.
- Build a bottom sheet for timeline settings (start date, months, toggles).
- Bottom tab bar for view switching.

### Phase 3 — Timeline Touch Optimisation (medium effort)
- Disable drag handlers on touch devices.
- Add FAB for initiative creation.
- Improve touch targets on panels (44px min height).
- Add `inputmode` attributes.

### Phase 4 — Data Manager Cards (high effort)
- Read-only card list view for tables on mobile.
- Tap-to-edit opens panel or sheet.

---

## 7. Open Questions

1. **Should editing be fully disabled on mobile or just drag operations?** Inline cell editing in the Data Manager table is technically possible on mobile but poor UX. Recommendation: disable table editing on mobile; allow panel editing (InitiativePanel) which is already full-width.
2. **Pinch-to-zoom on the timeline canvas?** Could be implemented by mapping pinch scale to the `columnZoom` steps in TimelineSettings. Deferred to Phase 4.
3. **Offline PWA support?** The app is already fully local (IndexedDB, no backend). Adding a `manifest.json` and service worker would allow it to be installed as a PWA on iPhone, which is a natural fit with the mobile work. Low effort, high perceived value.
4. **Portrait vs landscape on tablet?** The 768px breakpoint (`md:`) covers both portrait iPad and landscape iPhone. A separate tablet-specific layout (e.g., narrowed sidebar but full editing) may be warranted above 768px but below 1024px.
