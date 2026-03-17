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

### 3.2 Timeline / Visualiser → Mobile Card View

A Gantt timeline is a 2D layout: horizontal axis = time, vertical axis = assets. On a 390px screen there is simply not enough horizontal space to render a meaningful timeline — even at minimum zoom, a 12-month view requires ~480px of canvas, leaving no room for a sidebar. Horizontal scrolling is technically possible but loses the "at a glance" value of a timeline entirely.

**Decision: replace the timeline with an Asset Card View on mobile.** The desktop timeline is unchanged.

---

#### 3.2.1 Asset Card View — Layout

Each asset is rendered as a card. Within each card, initiatives are grouped into **buckets** chosen by the user via a toggle in the mobile settings sheet.

```
┌─────────────────────────────────────┐
│ ● Data Platform             2 active│  ← asset name + colour dot + summary
├─────────────────────────────────────┤
│ Now                                  │  ← bucket label
│  Cloud Migration      ends Jun 2026  │  ← initiative row
│  API Security Audit   ends Mar 2026  │
│                                      │
│ Starting soon                        │
│  Data Lake Phase 2   starts Apr 2026 │
│                                      │
│ Upcoming (2)                        ▸│  ← collapsed bucket; tap to expand
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ● Security Services         1 active│
├─────────────────────────────────────┤
│ Now                                  │
│  Pen Testing Programme  ends May 2026│
└─────────────────────────────────────┘
```

- Cards are grouped by asset category (same as the desktop swimlane grouping).
- Category headers separate the cards: `─── Customer Information Systems (3) ───`
- Tapping an initiative row opens the existing `InitiativePanel` slide-in.
- Tapping the card header collapses/expands the card.
- Assets with zero initiatives show a muted "No initiatives" state.

---

#### 3.2.2 Flexible Bucketing

The user can choose how initiatives are grouped within each card. This mirrors the desktop "color by" concept but applied to temporal/categorical grouping.

| Bucket Mode | Groups | Example labels |
|-------------|--------|---------------|
| **Timeline** (default) | Active status relative to today | Now · Starting soon · Upcoming · Completed |
| **Quarter** | Calendar quarter of initiative start date | Q1 2026 · Q2 2026 · Q3 2026 |
| **Year** | Calendar year of initiative start date | 2026 · 2027 · 2028 |
| **Programme** | Initiative's assigned programme | Cloud Transformation · Security · BAU |
| **Strategy** | Initiative's assigned strategy | Grow · Protect · Optimise |

**Timeline bucket definitions:**
- **Now** — start ≤ today AND end ≥ today (currently active)
- **Starting soon** — start is within the next 60 days
- **Upcoming** — start is more than 60 days away
- **Completed** — end < today

The bucket mode is stored in `TimelineSettings` (new field `mobileBucketMode`) and persisted to IndexedDB alongside other settings.

**UI:** A segmented control in the mobile settings bottom sheet:
```
Group by: [Timeline] [Quarter] [Year] [Programme] [Strategy]
```

---

#### 3.2.3 Initiative Row Design

Each initiative row within a card shows:

```
  Cloud Migration              ends Jun 2026
  Programme: Cloud Transform   £150,000
```

- **Line 1:** initiative name (truncated if needed) + date context (relative to bucket mode)
- **Line 2:** programme name + budget (if set) — shown in muted text
- A left border coloured by the initiative's programme/strategy (same palette as desktop)
- Tap anywhere on the row → opens `InitiativePanel`

---

#### 3.2.4 Dependency & Conflict Indicators

Since dependency arrows cannot be drawn in card view, surface them as text indicators:

- A small `⚡ 2 conflicts` badge on the card header if conflicts exist for that asset
- A `→ depends on X` sub-line beneath an initiative row if it has dependencies
- Tapping the dependency sub-line opens `DependencyPanel`

---

#### 3.2.5 Implementation Plan

**New component:** `src/components/MobileCardView.tsx`
- Accepts the same props as `Timeline` (assets, initiatives, milestones, programmes, strategies, dependencies, settings)
- Reads `settings.mobileBucketMode` for grouping
- Renders asset cards with initiative rows

**App.tsx change:**
```tsx
// In the Visualiser tab render:
{isMobile ? (
  <MobileCardView ... />
) : (
  <Timeline ... />
)}
```

**Types change:**
```ts
// In TimelineSettings:
mobileBucketMode?: 'timeline' | 'quarter' | 'year' | 'programme' | 'strategy';
```

**Settings sheet change:**
Add the bucket mode segmented control to the mobile settings bottom sheet.

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

### Phase 3 — Timeline Touch Optimisation (medium effort) ✅
- Disable drag handlers on touch devices.
- Improve touch targets on panels (44px min height).
- Add `inputmode` attributes.

### Phase 4 — Asset Card View (high effort) ← NEXT
- Replace mobile timeline with `MobileCardView` component.
- Flexible bucketing: Timeline / Quarter / Year / Programme / Strategy.
- Asset cards with collapsible initiative rows.
- Conflict and dependency text indicators.
- Bucket mode selector in mobile settings sheet.
- Persist `mobileBucketMode` in `TimelineSettings` / IndexedDB.

### Phase 5 — Data Manager Cards (deferred)
- Read-only card list view for Data Manager tables on mobile.
- Tap-to-edit opens panel or sheet.

---

## 7. Open Questions

1. **Should editing be fully disabled on mobile or just drag operations?** Inline cell editing in the Data Manager table is technically possible on mobile but poor UX. Recommendation: disable table editing on mobile; allow panel editing (InitiativePanel) which is already full-width.
2. **Pinch-to-zoom on the timeline canvas?** Could be implemented by mapping pinch scale to the `columnZoom` steps in TimelineSettings. Deferred to Phase 4.
3. **Offline PWA support?** The app is already fully local (IndexedDB, no backend). Adding a `manifest.json` and service worker would allow it to be installed as a PWA on iPhone, which is a natural fit with the mobile work. Low effort, high perceived value.
4. **Portrait vs landscape on tablet?** The 768px breakpoint (`md:`) covers both portrait iPad and landscape iPhone. A separate tablet-specific layout (e.g., narrowed sidebar but full editing) may be warranted above 768px but below 1024px.
