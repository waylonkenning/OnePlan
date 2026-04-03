# User Story: Unit Tests for Critical Path Algorithm

## Story ID
US-2026-04-04-002

## Context
The critical path algorithm in `src/lib/criticalPath.ts` is a core algorithm that determines the longest path through the dependency graph. It has no unit tests, making it difficult to verify correctness and prone to regressions.

## Requirements
- [ ] Write unit tests covering the critical path algorithm
- [ ] Test with various dependency scenarios
- [ ] Test cycle detection behavior
- [ ] Test edge cases (empty inputs, single node, etc.)

## Acceptance Criteria

1. **Given** a simple linear chain of initiatives (A → B → C), **When** computeCriticalPath is called, **Then** it returns all three initiative IDs and both dependency IDs.

2. **Given** a branching dependency graph, **When** computeCriticalPath is called, **Then** it returns the longest path (not just any path).

3. **Given** a dependency graph with a cycle (A → B → C → A), **When** computeCriticalPath is called, **Then** it handles the cycle gracefully without infinite recursion and returns the longest acyclic path.

4. **Given** an empty initiatives array, **When** computeCriticalPath is called, **Then** it returns empty sets for both initiative IDs and dependency IDs.

5. **Given** initiatives with no dependencies between them, **When** computeCriticalPath is called, **Then** it returns empty sets.

6. **Given** a diamond dependency pattern (A → B, A → C, B → D, C → D), **When** computeCriticalPath is called, **Then** it returns the longest duration path (considering durations).

## Out of Scope
- Testing the UI visualization of the critical path
- Performance testing with large datasets

## Technical Notes
- Use Vitest (or Jest) for unit testing
- The algorithm uses DFS with memoization - test that memoization works correctly
- Test the `blocks` and `requires` dependency types only (not `related`)
