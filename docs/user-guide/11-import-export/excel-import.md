# Excel Import

![Excel import preview modal](../../public/features/excel-import-preview-modal.png)

Importing an `.xlsx` file lets you load portfolio data prepared outside Scenia — from a spreadsheet maintained by another team, a migration from a legacy tool, or a bulk update prepared offline.

## Supported file format

Upload a `.xlsx` file. The importer reads the following sheets by name: **Initiatives**, **Assets**, **Programmes**, **Strategies**, **Milestones**. Sheets with unrecognised names are ignored. Column headers must match the expected field names; the schema warnings panel reports any mismatches (see below).

## Uploading a file

**Via the Viewer template (first run):**

1. On the welcome screen, choose **Viewer**.
2. Click **Upload file** and select your `.xlsx` file.
3. The file loads directly into the app and the template picker closes.

**Via the Data Manager (existing workspace):**

1. Open the **Data Manager** panel.
2. Click **Import Excel**.
3. Select your `.xlsx` file. The **Import Preview** modal opens.

## Reviewing the preview

The preview shows the parsed data before anything is written to your portfolio. Check the row counts and sample values to confirm the file was read correctly.

If any required fields are missing or unrecognised column names are found, a **Schema Warnings** panel appears above the preview listing each issue by sheet and column. Address the warnings in your spreadsheet and re-upload, or proceed if the warnings are acceptable (for example, optional fields you intentionally omitted).

A missing `startDate` value on an initiative will not crash the timeline; the initiative will appear without a start position until the field is populated.

## Choosing an import mode

The modal offers two modes:

### Merge Data

- Initiatives and other records with an `id` matching an existing record are updated in place.
- Records with new `id` values are added.
- Existing records whose `id` does not appear in the file are left untouched.

Use **Merge Data** when your file contains a partial update or additions to an existing portfolio.

### Overwrite All Data

- All current portfolio data is replaced with the contents of the file.
- Records not present in the file are deleted.

Use **Overwrite All Data** when the file represents the complete intended state of the portfolio.

## Confirmation and notifications

After selecting a mode, click **Import**. A success notification appears inline when the import completes. If the import fails — for example due to a malformed file — an inline error notification describes the problem. No browser `alert()` dialogs are used.

---

- Previous: [Restoring a Version](../10-version-history/restoring-a-version.md)
- Next: [Excel Export](excel-export.md)
