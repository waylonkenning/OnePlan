# Planning: Multi-Taxonomy IT Asset Support

## Problem

Different NZ government agencies align their IT portfolios to different reference taxonomies. Two prominent examples:

| Taxonomy | Source | Purpose |
|----------|--------|---------|
| **GEANZ Technologies Model** | Data.govt.nz (Crown copyright, CC BY 4.0) | Comprehensive catalogue of 17 TAP application technology areas (~300 canonical asset types) |
| **NZ Digital Target State (DTS)** | GCDO, February 2026 | Reference architecture describing NZ government's target digital layers and shared capability components |

A user on one agency may want to model their portfolio against GEANZ's flat application taxonomy. A user on another may want to show how their work maps to the DTS architecture layers. Currently Scenia only supports GEANZ.

---

## What DTS Actually Is

Unlike GEANZ (a taxonomy of asset *types*), the Digital Target State is an *architecture pattern* describing five layers and the capabilities within them:

| DTS Layer | Scenia representation |
|-----------|----------------------|
| Customer Layer | Asset category |
| Channels (All-of-Gov, Existing Agency, Non-Gov) | Asset category |
| Digital Public Infrastructure (DPI) | Asset category |
| Integration (Data, API & AI Services Exchange) | Asset category |
| Agency, Platform & Infrastructure | Asset category |

**DPI component assets** (the 11 defined capabilities):
- AI Broker / Gateway
- AI Platform Services
- Semantic Search
- Notifications & Messaging System
- Payments Management
- Identity & Credential Services
- Headless Content Management System
- Data Dictionary
- Data & AI Safeguard
- Data & Services Catalogue
- Rules Library

**Common Consolidated Platform assets** (back office, per cluster):
- EAM (Enterprise Asset Management)
- ITSM (IT Service Management)
- HRIS (Human Resource Information System)
- FMIS (Financial Management Information System)
- Contracts Management

The DTS diagram also shows **Channels** as distinct assets:
- All-of-Government Channels (e.g. Govt.nz App)
- Existing Agency Channels (e.g. MyIR, MyMSD)
- Non-Government Channels (e.g. banking, telco)

---

## Key Design Decisions

### 1. Taxonomy as Catalogue vs. Taxonomy as Workspace Template

Two fundamentally different approaches:

**Option A — Additive Catalogue Browsing** *(extends current GEANZ pattern)*

The GEANZ section at the bottom of the visualiser becomes a general "Catalogue" section. Multiple catalogues sit side-by-side. The user browses any catalogue and adds areas/assets progressively. Each catalogue is independent — adding assets from DTS doesn't conflict with assets from GEANZ.

- Pros: No breaking change. Natural extension of existing UX. Assets from multiple taxonomies can coexist in one portfolio.
- Cons: The GEANZ section header and visual treatment currently says "GEANZ Application Technology". Would need to be generalised.

**Option B — Workspace Template on First Load** *(onboarding choice)*

When a user first opens Scenia (or resets to a blank state), they are offered a template picker:
- *Blank workspace* — start from scratch
- *GEANZ Technology Catalogue* — NZ government application taxonomy
- *NZ Digital Target State* — GCDO reference architecture layers
- *Mixed* — DPI + GEANZ back-office

The template sets the initial asset categories and pre-populates the GEANZ catalogue section (or not, if DTS is chosen and DTS assets are modelled as regular categories).

- Pros: Clean onboarding; clear intent signal; DTS fits better as user-defined categories (not a catalogue section).
- Cons: Limits to one taxonomy at a time unless "Mixed" option is built; requires new onboarding UX.

**Recommendation: Option B with Option A as a longer-term layer.**

DTS and GEANZ serve fundamentally different purposes:
- **GEANZ** is a *technology catalogue* — a library of asset types to pick from. The existing catalogue section (collapsed by default) is the right home for it.
- **DTS** is a *reference architecture* — it defines layers and how they relate. It should live as regular **asset categories** in the visualiser (not a hidden catalogue section), because it defines the structure of the whole portfolio.

This means:
- DTS → workspace template (sets categories + assets as regular rows)
- GEANZ → catalogue section (unchanged, browse and add)
- Both together → Mixed template (DTS categories + GEANZ catalogue browsable)

### 2. Overlap Between Taxonomies

Both taxonomies include overlapping concepts (e.g. Identity & Credential Services in DTS ≈ TAP.07 IAM in GEANZ; ITSM in DTS ≈ TAP.12.01 in GEANZ). Options:

- **Treat as separate assets**: Accept that ITSM may appear in both a DTS category and the GEANZ catalogue. Users deduplicating is their problem.
- **Map aliases**: DTS assets carry their own alias (e.g. `DTS.DPI.04`) so deduplication tooling could later identify equivalents.
- **Recommendation**: Treat as separate for now. The use case for a mixed taxonomy user is rare enough that deduplication tooling is not worth building yet.

### 3. How DTS Categories Are Ordered

DTS has a natural top-to-bottom ordering that mirrors the architecture diagram:
1. Customer Layer
2. Channels
3. Digital Public Infrastructure
4. Integration
5. Agency, Platform & Infrastructure
6. Common Consolidated Platforms

This maps to Scenia's `AssetCategory.order` field — no new data model changes needed.

---

## Proposed Data Model Changes

### Minimal (Option B — Template approach)

No changes to `Asset`, `AssetCategory`, or `Initiative` types.

New file: `src/lib/dtsCatalogue.ts`
- Defines DTS asset categories and their canonical assets
- Assets carry `alias` (e.g. `DTS.DPI.02`) and `externalId` for idempotency
- Exported alongside `geanzCatalogue.ts`

New file: `src/lib/workspaceTemplates.ts`
- Exports a `WorkspaceTemplate` interface and an array of templates
- Each template specifies: name, description, initial `AssetCategory[]`, initial `Asset[]`, whether to show GEANZ catalogue section

```typescript
export interface WorkspaceTemplate {
  id: string;                    // e.g. 'geanz' | 'dts' | 'mixed' | 'blank'
  name: string;                  // e.g. 'NZ Digital Target State'
  description: string;
  assetCategories: AssetCategory[];
  assets: Asset[];               // pre-populated assets (empty for blank)
  showGeanzCatalogue: boolean;   // whether the GEANZ section appears
}
```

New component: `TemplatePickerModal.tsx`
- Shown on first load when IndexedDB is empty (no prior data)
- Cards for each template with name, description, and a preview description of what it includes
- "Start with this template" button → loads template data into IndexedDB
- "Skip / start blank" option

### IndexedDB change

Store a `templateId` key in the settings store so Scenia knows which template was selected (for future enhancements like "re-applying" a template or showing template-specific help).

---

## DTS Asset Structure

```
Asset Categories:
  cat-dts-customer    Customer Layer            order: 1
  cat-dts-channels    Channels                  order: 2
  cat-dts-dpi         Digital Public Infrastructure  order: 3
  cat-dts-integration Integration               order: 4
  cat-dts-agency      Agency, Platform & Infrastructure  order: 5
  cat-dts-platforms   Common Consolidated Platforms  order: 6

Assets (DPI layer — cat-dts-dpi):
  Identity & Credential Services      alias: DTS.DPI.01
  AI Platform Services                alias: DTS.DPI.02
  AI Broker / Gateway                 alias: DTS.DPI.03
  Notifications & Messaging System    alias: DTS.DPI.04
  Payments Management                 alias: DTS.DPI.05
  Semantic Search                     alias: DTS.DPI.06
  Data Dictionary                     alias: DTS.DPI.07
  Data & AI Safeguard                 alias: DTS.DPI.08
  Data & Services Catalogue           alias: DTS.DPI.09
  Rules Library                       alias: DTS.DPI.10
  Headless Content Management System  alias: DTS.DPI.11

Assets (Channels — cat-dts-channels):
  All-of-Government Channels          alias: DTS.CH.01
  Existing Agency Channels            alias: DTS.CH.02
  Non-Government Channels             alias: DTS.CH.03

Assets (Integration — cat-dts-integration):
  Data, API and AI Services Exchange  alias: DTS.INT.01

Assets (Common Consolidated Platforms — cat-dts-platforms):
  EAM (Enterprise Asset Management)   alias: DTS.PLT.01
  ITSM (IT Service Management)        alias: DTS.PLT.02
  HRIS (HR Information System)        alias: DTS.PLT.03
  FMIS (Financial Management)         alias: DTS.PLT.04
  Contracts Management                alias: DTS.PLT.05
```

---

## Templates

### Template: NZ Digital Target State

- Asset categories: the 6 DTS layers above
- Assets: all DTS assets above (pre-populated)
- GEANZ catalogue: **hidden** (DTS doesn't use TAP areas)
- Demo initiatives: a small set showing work across DTS layers (Identity uplift, AI platform, Payments consolidation)
- Best for: agencies modelling their portfolio against the GCDO target architecture

### Template: GEANZ Technology Catalogue

- Asset categories: none pre-set (user's own categories added manually)
- Assets: none pre-set from user-defined categories
- GEANZ catalogue: **shown** (all 17 TAP areas visible, same as today)
- Demo initiatives: the current GEANZ demo data (13 areas pre-populated)
- Best for: agencies building an application portfolio using the GEANZ taxonomy

### Template: Mixed (DTS + GEANZ)

- Asset categories: the 6 DTS layers
- Assets: all DTS assets
- GEANZ catalogue: **shown** (browsable alongside DTS assets)
- Demo initiatives: a minimal set
- Best for: agencies who want to map work both to the DTS architecture AND to the GEANZ taxonomy

### Template: Blank

- Asset categories: none
- Assets: none
- GEANZ catalogue: hidden (user adds their own structure)
- Demo initiatives: none
- Best for: agencies with their own internal taxonomy

---

## UX Flow

### First Load (empty IndexedDB)

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome to Scenia                                          │
│  Choose a starting template for your IT portfolio           │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ NZ Digital       │  │ GEANZ Technology │                │
│  │ Target State     │  │ Catalogue        │                │
│  │                  │  │                  │                │
│  │ Model your       │  │ Browse 17 TAP    │                │
│  │ portfolio against│  │ application areas│                │
│  │ the GCDO target  │  │ and add the ones │                │
│  │ architecture.    │  │ relevant to your │                │
│  │                  │  │ agency.          │                │
│  │ 6 layers · 20    │  │                  │                │
│  │ pre-built assets │  │ 17 areas · 300+  │                │
│  │                  │  │ asset types      │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Mixed            │  │ Blank            │                │
│  │                  │  │                  │                │
│  │ DTS architecture │  │ Start from       │                │
│  │ layers with GEANZ│  │ scratch with     │                │
│  │ catalogue for    │  │ your own asset   │                │
│  │ detailed asset   │  │ categories.      │                │
│  │ types.           │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Subsequent Loads

No template picker shown — the workspace loads as saved. A "Change template" or "Reset workspace" option exists in Settings or the Data Manager reset flow.

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `src/lib/dtsCatalogue.ts` | New — DTS asset categories and assets |
| `src/lib/workspaceTemplates.ts` | New — WorkspaceTemplate interface and 4 template definitions |
| `src/components/TemplatePickerModal.tsx` | New — first-load template selection UI |
| `src/App.tsx` | Show TemplatePickerModal when IndexedDB empty; store templateId in settings |
| `src/types.ts` | Add optional `templateId?: string` to `TimelineSettings` |
| `src/demoData.ts` | Rename/refactor to be GEANZ-specific demo data; DTS gets its own demo set |
| `docs/user-guide/` | New page for DTS template; update GEANZ page; new "Getting started" page |

---

## Out of Scope (for now)

- Mixing assets from two catalogues with automatic deduplication
- Custom / importable taxonomies (e.g. upload your own CSV)
- Taxonomy version management (e.g. GEANZ 2025 vs 2026)
- Taxonomy browsing within the visualiser when DTS template is active (not needed — DTS assets are pre-populated as regular rows)

---

## Recommended Build Order

1. ✅ **`dtsCatalogue.ts`** — static data, no UI changes
2. ✅ **`workspaceTemplates.ts`** — composites the catalogues into templates
3. ✅ **`TemplatePickerModal.tsx`** — first-load UX (shown only when IndexedDB empty)
4. ✅ **App.tsx wiring** — detect empty IndexedDB, show picker, apply template
5. **DTS demo data** — initiatives and segments for a realistic DTS portfolio
6. ✅ **Docs** — Getting started page + DTS template guide

Each step is independently testable and releasable.

---

*Source: GEANZ Technologies Model © Crown copyright, CC BY 4.0 (catalogue.data.govt.nz). NZ Digital Target State © Crown copyright, GCDO February 2026 (dns.govt.nz).*
