# Lifecycle Segments

![](../../public/features/lifecycle-segments.png)

## What lifecycle segments are

A lifecycle segment is a time-bounded bar within the Applications swimlane that represents the status of a specific application during a specific period. For example, "Okta — In Production from 2025 to 2027" would appear as a single coloured bar spanning those years.

Segments let you model the full lifecycle of each application across your portfolio — from planning through to retirement.

## Creating a segment

1. Double-click an empty area in the Applications swimlane beneath an asset.
2. The **Add Lifecycle Segment** panel opens.
3. Choose which **Application** the segment belongs to.
4. Select a **Status**: Planned, Funded, In Production, Sunset, Out of Support, or Retired.
5. Optionally enter a custom **Label**. If you leave this blank, the application name is shown on the bar.
6. Set the **Start Date** and **End Date**.
7. Click **Add Segment**.

## Status colours and patterns

Each status has a distinct colour and stripe pattern so you can tell them apart at a glance without relying on labels alone. This is useful when multiple segments from different applications are stacked in the same swimlane.

## Modelling progression through a lifecycle

The same application can have multiple segments. Use this to represent progression — for example, a series of segments showing Funded, then In Production, then Sunset for the same application as it moves through its lifecycle over time.

## Labels near the left edge

If a segment's start date falls before the visible timeline window, its label is pinned to the left edge of the content area so it remains readable even when the bar itself begins off-screen.

## Persistence

Segments are stored in IndexedDB and survive page reload. They are also captured in version snapshots.

---

- Previous: [Adding Applications](adding-applications.md)
- Next: [Managing Segments](managing-segments.md)
