# OnePlan — Enhancement Opportunities Report

_Generated: 2026-03-17_

---

## 1. Collaboration & Multi-User

The app is entirely local-first (IndexedDB, no backend). The largest architectural gap is single-user isolation.

- **Cloud sync / shared workspaces** — store data in a backend (Supabase, Firebase, or custom API) so teams can share a roadmap
- **Real-time collaborative editing** — CRDTs or operational transforms for simultaneous edits
- **Role-based access** — read-only viewers vs. editors vs. admins
- **Comments on initiatives** — threaded annotations visible to all team members

---

## 2. Integrations & Data Sources

- **Jira / Azure DevOps import** — pull epics or work items directly into the timeline as initiatives
- **CSV import** — currently only XLSX is supported; CSV is a common export from project tools
- **Google Sheets / Excel Online sync** — live two-way sync rather than manual upload/download
- **Calendar export (iCal)** — export milestone dates to team calendars
- **Slack / Teams notifications** — alert on milestone dates or version restores

---

## 3. Planning & Scheduling Features

- **Resource / capacity planning** — budget is currently a single number; expand to headcount, team allocation, or cost breakdown by category
- **Critical path highlighting** — traverse the dependency graph to identify the longest chain and highlight it
- **Baseline comparison overlay** — display a ghost version of a saved snapshot overlaid on the live timeline
- **Milestone dependencies** — milestones currently have no dependency links; allow a milestone to block an initiative start
- **Initiative templates / cloning** — duplicate an initiative (with or without its dependencies) as a starting point
- **Recurring initiatives** — model repeating cycles (e.g. quarterly security reviews)
- **Progress tracking** — an actual % complete field per initiative, visualised as a fill on the bar

---

## 4. Visualiser Improvements

- **Zoom / scale control** — currently months are fixed-width; a zoom slider would help for large roadmaps or close-up inspection
- **Swimlane grouping by strategy** — the timeline rows are always by asset/category; allow grouping by strategy or programme instead
- **Today indicator line** — a vertical red line at today's date for immediate orientation
- **Mini-map / overview panel** — a thumbnail of the full timeline for navigation on very wide views
- **Colour-by-status** — in addition to programme/strategy, colour bars by a status field (planned / in-flight / done)
- **SVG export** — vector export in addition to PDF for use in presentations

---

## 5. Reporting & Analytics

- **Budget summary charts** — bar or pie charts of spend by programme, strategy, or category
- **Timeline density / workload chart** — count of concurrent initiatives per month as a heatmap
- **Dependency graph view** — a network diagram (not the timeline) showing the full dependency web
- **Exportable HTML/Word report** — formatted narrative report with embedded charts, suitable for stakeholders who don't use the app
- **Scheduled report emails** — send a PDF snapshot to a distribution list on a schedule

---

## 6. Data Model Gaps

- **Initiative status field** — no first-class status (planned/active/done/cancelled); currently users work around this with naming
- **Owner / assignee** — initiatives have no person attached to them
- **Tags / custom labels** — free-form categorisation beyond programme and strategy
- **Priority field** — no way to rank initiatives within an asset
- **Risk level** — a simple field (low/medium/high) to surface at-risk items in reports
- **Actual start/end dates** — separate from planned dates to track slippage

---

## 7. UX & Accessibility

- **Dark mode** — no theming system exists; the CSS custom property setup in `index.css` is well-positioned for it
- **Keyboard shortcuts reference** — no discoverable list; users rely on the tutorial
- **Undo depth increase** — history is capped at 10 operations; power users on complex roadmaps will hit this
- **Drag-to-reorder initiatives within an asset** — assets and categories can be reordered but individual initiatives within an asset row cannot
- **Mobile / tablet layout** — the visualiser is desktop-only; a read-only responsive view would be useful for stakeholder reviews on tablets. See `docs/mobile-research.md` for a detailed design analysis.

---

## 8. Performance & Scale

- **SVG rendering at scale** — all dependency arrows are re-rendered on every state update; at 100+ initiatives with many dependencies this will become noticeably slow. Virtualisation or a canvas-based renderer would be needed
- **IndexedDB data size** — no pruning or archiving strategy; old version snapshots accumulate indefinitely
- **Web Worker offload** — the layout algorithm (greedy placement) and Excel import/export both block the main thread; moving them to a Worker would keep the UI responsive on large datasets

---

## 9. Developer & Open Source Health

- **Google GenAI dependency** — `@google/genai` is listed in `package.json` but unused; either implement AI features or remove it
- **OPEN_SOURCE_TODO.md** — contains unresolved items around security audit, dependency licence audit, and contribution guidelines
- **End-to-end test coverage for large datasets** — the `PLAYWRIGHT_TODO.md` has one optional unchecked item: 20+ overlapping initiatives stress test
- **Storybook / component documentation** — no isolated component development environment; harder for contributors to work on UI components independently
