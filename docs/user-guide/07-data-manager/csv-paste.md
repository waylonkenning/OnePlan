# CSV Paste

*Screenshot: the CSV paste dialog open — to be captured.*

The **Paste CSV** button in any table tab lets you bulk-import or update rows by pasting CSV text directly — no file upload required.

## How to use it

1. Click **Paste CSV** in the tab you want to update.
2. Paste your CSV text into the input area. Headers are optional — if included, column names are matched automatically.
3. Click **Import**.

## Merge behaviour

- If a pasted row contains an `id` field that matches an existing record, that record is **updated** rather than duplicated.
- If no `id` is provided (or it doesn't match), a new row is created with an auto-generated ID.

## Format notes

- Quoted values containing commas are handled correctly (e.g. `"Security Services, NZ"`).
- Multi-word values are parsed correctly and not truncated.
- Missing optional columns are ignored — you only need to include the fields you want to set.

**Tip**: export the current data to Excel first to see the expected column names and IDs, then build your CSV from that structure.

---

- Previous: [Inline Editing](inline-editing.md)
- Next: [Search and Filter](search-and-filter.md)
