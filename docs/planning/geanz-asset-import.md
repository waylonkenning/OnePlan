# GEANZ Technologies — Bulk Asset Import Integration

**Source:** [GEANZ Technologies CSV Export](https://catalogue.data.govt.nz/dataset/4a8c99a1-96f6-44bf-a38a-595e1c91ce92/resource/178da5c9-a246-4bf4-bd33-631c8225061c/download/geanz-technologies-csv-export.csv)
**Dataset:** Government Enterprise Architecture NZ (GEANZ) — technology taxonomy used across NZ public sector agencies.

---

## 1. Source Data Structure

The CSV has 11 columns and encodes a **hierarchical taxonomy** of government technologies using a parent/child key scheme:

| CSV Column | Description | Example |
|---|---|---|
| `Alias` | Dotted numeric code indicating hierarchy depth | `TAP.01.02` |
| `Name` | Technology name | `Human Resource Management applications` |
| `Notes` | Rich description, related terms, narrower terms | *(multi-line text)* |
| `Type` | `Package` (grouping) or `Activity` (leaf technology) | `Activity` |
| `GUID` | Globally unique identifier | `{uuid}` |
| `Stereotype` | ArchiMate 3 element type | `ArchiMate_ApplicationService` |
| `Profile Metatype` | ArchiMate 3 profile | `ArchiMate3::ApplicationService` |
| `Author` | Record author | `Jim Clendon` |
| `Keywords` | Sparse keyword tags | *(often empty)* |
| `CSV_KEY` | Internal row key for this record | `123` |
| `CSV_PARENT_KEY` | Parent row key — encodes the hierarchy | `45` |

### Taxonomy Structure

The GEANZ taxonomy has six top-level **Package** groupings:

| GEANZ Package | Description |
|---|---|
| Application Technology | Software applications (ERP, HRMS, CRM, etc.) |
| Technology Facilities | Data centres, physical facilities |
| Technology Devices | End-user and IoT devices |
| Infrastructure Technology | Servers, storage, cloud platforms |
| Network Technology | LAN, WAN, internet, SD-WAN |
| Technology Locations | Geographic and logical locations |

Within each package, `Activity` nodes carry dotted aliases (e.g. `TAP.01.02`) that reflect their depth in the tree.

---

## 2. Mapping to the Scenia Data Model

Scenia uses a two-tier asset hierarchy: **AssetCategory → Asset → Application**. GEANZ maps onto this as follows:

### Mapping Strategy

| GEANZ concept | Scenia entity | Notes |
|---|---|---|
| Top-level `Package` node | `AssetCategory` | e.g. "Application Technology", "Network Technology" |
| Second-level `Package` node (e.g. `TAP.01` — "Corporate application area") | `AssetCategory` or top-level `Asset` | Choose based on desired granularity |
| `Activity` node at any depth | `Asset` | Use `Alias` as a stable external reference |
| `Alias` dotted code | Stored in `Asset.name` prefix or a custom field | Aids sorting and cross-referencing |
| `Notes` | Can be stored as `Asset` description (requires schema extension) | Currently no `description` field on `Asset` |
| GEANZ `GUID` | Store alongside `Asset.id` as `externalId` (requires schema extension) | Enables re-sync |

### Recommended Scenia Schema

```typescript
// Minimal extension needed in src/types.ts
export interface Asset {
  id: string;           // Scenia internal UUID
  name: string;         // e.g. "TAP.01.02 – Human Resource Management applications"
  categoryId: string;   // Maps to GEANZ top-level Package
  maturity?: number;    // 1–5 (assigned by the user, not from GEANZ)
  // --- New optional fields for GEANZ integration ---
  externalId?: string;  // GEANZ GUID — enables idempotent re-sync
  alias?: string;       // GEANZ Alias code, e.g. "TAP.01.02"
  description?: string; // GEANZ Notes field
}
```

### AssetCategory Suggestions (from GEANZ top-level Packages)

| Scenia `AssetCategory.name` | Source GEANZ Package |
|---|---|
| Application Technology | Application Technology |
| Technology Facilities | Technology Facilities |
| Technology Devices | Technology Devices |
| Infrastructure Technology | Infrastructure Technology |
| Network Technology | Network Technology |
| Technology Locations | Technology Locations |

---

## 3. Import Approach Options

### Option A — Excel Import (Recommended, No Code Change)

The existing Excel import (`src/lib/excel.ts`) supports `Assets` and `AssetCategories` sheets. An intermediate transformation step converts the GEANZ CSV into the expected Excel format.

**Steps:**

1. **Transform CSV → Excel** using a small script (Node.js or Python):
   - Parse the CSV.
   - Extract top-level `Package` rows → `AssetCategories` sheet (`id`, `name`, `order`).
   - Extract `Activity` rows → `Assets` sheet (`id`, `name`, `categoryId`).
   - Map `CSV_PARENT_KEY` chains to resolve each asset's top-level category.
2. **Import via UI:** Data Controls → Import → select the `.xlsx` file → use **Merge** mode.

**Pros:** No code changes required. Works today.
**Cons:** GEANZ `Notes` / `GUID` / `alias` fields are dropped (no corresponding columns in the current Excel schema).

---

### Option B — CSV Import Feature (New Feature)

Add a dedicated CSV import pathway in `DataControls.tsx` that accepts the GEANZ format directly.

**Required work:**

1. **Schema extension** — add `externalId`, `alias`, `description` to `Asset` in `src/types.ts` and bump the IndexedDB version in `src/lib/db.ts`.
2. **Parser** (`src/lib/geanzImport.ts`) — new module:
   - Parse CSV (use `papaparse` or the existing `csv-paste` path).
   - Build a `keyMap` from `CSV_KEY` → node, then resolve `CSV_PARENT_KEY` chains to find each node's top-level Package.
   - Emit `AssetCategory[]` and `Asset[]` arrays.
3. **UI** — add a "Import GEANZ CSV" button in `DataControls.tsx`.
4. **Idempotency** — match on `externalId` (GEANZ GUID) during merge so re-importing the same file does not create duplicates.
5. **E2E test** (`e2e/geanz-import.spec.ts`) — upload a sample CSV slice and assert correct category/asset counts.

**Pros:** Preserves `Notes`, `alias`, `GUID`. Supports ongoing re-sync as GEANZ is updated.
**Cons:** Requires schema migration and new feature work (~1–2 days).

---

### Option C — Transformation Script Only (Bulk Seed)

Use a one-time Node.js script (`scripts/importGeanz.ts`) to fetch the live CSV, transform it, and write a seed JSON directly into the IndexedDB via the app's `db.ts` helpers in a test harness. Suitable for seeding a demo environment.

---

## 4. Recommended Workflow (Option B — Full Integration)

### User Story

> **As** an IT portfolio manager,
> **I want** to bulk-import GEANZ technology taxonomy items as assets,
> **So that** I can rapidly populate my asset catalogue with NZ government-standard technology names without manual data entry.

### Acceptance Criteria

- [ ] Uploading the GEANZ CSV via the Import dialog creates the correct `AssetCategory` and `Asset` records.
- [ ] Each `Asset` has its `alias` (dotted code), `name`, and optionally `description` (Notes) stored.
- [ ] Re-importing the same CSV in Merge mode does not create duplicates (matched on GEANZ GUID → `externalId`).
- [ ] Assets not present in the CSV are not deleted during a Merge import.
- [ ] The import reports a count of categories and assets created/updated.
- [ ] Full Playwright test suite passes with no regressions.

---

## 5. Data Volume Estimate

Based on the GEANZ dataset:

| Entity type | Estimated count |
|---|---|
| Top-level `Package` (AssetCategories) | ~6 |
| Second-level grouping `Package` nodes | ~30–50 |
| `Activity` leaf nodes (Assets) | ~300–600 |

The IndexedDB store handles this volume with no performance concerns.

---

## 6. Key Files to Touch

| File | Change |
|---|---|
| `src/types.ts` | Add `externalId?`, `alias?`, `description?` to `Asset` |
| `src/lib/db.ts` | Bump DB version; no store changes needed for optional fields |
| `src/lib/geanzImport.ts` | New: CSV parsing + hierarchy resolution |
| `src/components/DataControls.tsx` | Add GEANZ CSV import button + handler |
| `e2e/geanz-import.spec.ts` | New: E2E test for import flow |
| `docs/user-guide/11-import-export/geanz-import.md` | New: user-facing guide |
