# Initiatives & Dependencies Report

![Initiatives and dependencies report grouped by asset](../../public/features/initiatives-dependencies-report.png)

This report lists every initiative in your portfolio grouped by asset, and shows each initiative's dependency relationships in plain language. Use it to audit dependency chains, identify blockers, and prepare briefings for delivery teams.

## How Initiatives Are Grouped

Initiatives are organised under their parent asset. Expand an asset to see all its initiatives. Each initiative that has at least one dependency shows a dependency list beneath it.

## Dependency Language

Dependency descriptions use perspective-aware language so the relationship is unambiguous regardless of which side you are reading from.

| Label | Meaning |
|---|---|
| **Blocked:** [initiative] can't start until [other] has finished. | This initiative is the target of a `blocks` relationship — it cannot start until the other initiative completes. |
| **Blocking:** [initiative] must finish before [other] can start. | This initiative is the source of a `blocks` relationship — it is holding another initiative back. |
| **Required:** [initiative] requires [other] to start first. | This initiative depends on another initiative starting before it can begin (`requires` source). |
| **Required by:** [other] requires this to start first. | Another initiative depends on this one starting first (`requires` target). |

Milestone dependencies appear in the same list using the same labelling pattern.

## Reading the Report

Start at the top of each asset group and scan for **Blocked** or **Blocking** labels — these indicate hard sequencing constraints that affect scheduling. **Required** and **Required by** labels indicate softer start-order dependencies.

An initiative with no dependency entries has no recorded relationships and can be scheduled independently.

---

- Previous: [Overview](overview.md)
- Next: [Budget Report](budget-report.md)
