# Drawing Dependencies

![Dependency arrows](../../public/features/dependency.png)

A dependency is a relationship between two initiatives indicating that one must finish before the other can start, or that two pieces of work are connected. Dependencies are visualised as arrows on the timeline.

## How to Draw a Dependency

1. Hover over an initiative bar until you see the drag handle indicator appear.
2. Drag vertically toward another initiative bar — either on the same asset or on a different asset.
3. Release over the target bar to create the dependency.

The arrow starts from the centre of the source bar. New dependencies default to the **Requires** type, shown as a blue arrow.

## Cross-Asset Dependencies

You can draw dependencies between initiatives on different assets. There is no restriction on which initiatives can be connected — the dependency network can span the entire portfolio.

## Milestone Dependencies

You can also draw from a milestone diamond to an initiative bar. See [Milestone Dependencies](milestone-dependencies.md) for details.

## Application Segment Dependencies

You can link an application lifecycle segment to an initiative to show that the initiative depends on (or is related to) a specific application phase.

1. Click a segment bar to select it — a small **⤵** handle appears in the top-right corner.
2. Drag from the handle and release over an initiative bar.

The arrow is drawn using the same colour coding as other dependencies (blue for **Requires**, red for **Blocks**, grey for **Related**). Clicking the arrow opens the Edit Relationship panel showing the application name and status as the source.

> **Note:** Segment-to-segment linking is not supported. You can link a segment to an initiative but not to another segment.

---

Previous: [Deleting an Initiative](../03-initiatives/deleting-an-initiative.md) | Next: [Dependency Types](dependency-types.md)
