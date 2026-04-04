# User Story: Excel Import Validation

## Story ID
US-2026-04-04-001

## Context
When a user imports a malformed or invalid Excel file, the application currently has no validation and may corrupt application state. Invalid data types, missing required fields, or malformed dates can cause runtime errors or silent data loss.

## Requirements
- [ ] Validate all required fields are present before import
- [ ] Validate data types match expected schema
- [ ] Validate dates are in ISO format and parseable
- [ ] Validate numeric fields (capex, opex) are valid numbers
- [ ] Display user-friendly error messages for each validation failure
- [ ] Prevent import if validation fails
- [ ] Allow partial imports with warnings if some data is valid

## Acceptance Criteria

1. **Given** a user imports an Excel file with a missing required field (e.g., initiative without a name), **When** the import is attempted, **Then** the application displays an error message listing the missing field and does not import the corrupted record.

2. **Given** a user imports an Excel file with an invalid date format (e.g., "not-a-date"), **When** the import is attempted, **Then** the application displays an error indicating which record has an invalid date and does not import that record.

3. **Given** a user imports an Excel file with negative capex/opex values, **When** the import is attempted, **Then** the application warns about the invalid values but allows the user to proceed or cancel.

4. **Given** a user imports an Excel file where some records are valid and some are invalid, **When** the import is attempted, **Then** the application reports all validation errors at once and does not import any data until all errors are resolved.

5. **Given** a user imports a valid Excel file, **When** the import is attempted, **Then** the data is imported successfully with a success message.

## Out of Scope
- Validating Excel file structure (sheet names, column headers)
- Importing from other file formats (CSV, JSON)
- Bulk edit or correction of invalid records

## Technical Notes
- Use Zod for schema validation (recommended by codebase patterns)
- Validation should occur in `src/lib/excel.ts` before data is processed
- Errors should be collected and displayed together
- Consider creating a validation utility in `src/lib/validation.ts`
