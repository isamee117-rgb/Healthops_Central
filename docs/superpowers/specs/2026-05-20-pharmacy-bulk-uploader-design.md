# Pharmacy Bulk Inventory Uploader — Design Spec

**Date:** 2026-05-20
**Feature:** Bulk Inventory Import on Pharmacy Configuration page
**Status:** Approved

---

## Overview

Add a **Bulk Inventory Import** card section to the existing `/configuration/pharmacy` page. Users can upload an Excel (.xlsx) or CSV file containing medicines and their initial batches. The system validates the entire file before importing — if any row fails, nothing is saved (all-or-nothing).

---

## UI Architecture

**Location:** `resources/views/pages/configuration/pharmacy.blade.php`
A new section appended below the existing "Prescription Dropdowns" section. No new page or modal required.

**JS file:** `public/js/pharmacy-config.js` (existing file, new functions added at the bottom)

**CSS:** `public/css/app.css` (bulk-card specific styles added)

### States / Flow

```
IDLE
  └─ User drops/selects file
       │
       ▼
FILE SELECTED (file name shown, "Validate" button)
       │
       ▼
VALIDATING (spinner, button disabled)
       │
       ├── Errors found ──▶ VALIDATION_FAILED (error table shown, Re-upload option)
       │                         └─ User fixes file → back to IDLE
       │
       └── All valid ──▶ CONFIRM (summary + preview table, "Confirm Import" button)
                               │
                               ▼
                         IMPORTING (spinner)
                               │
                               ├── Success ──▶ SUCCESS toast + card resets to IDLE
                               └── Server error ──▶ ERROR banner
```

### Card Sections (Step 1 — Idle)
- 3-step progress indicator: Upload → Validate → Import
- Drag-and-drop zone (click-to-browse fallback)
- Accepts `.xlsx` and `.csv` only, max 5 MB
- **Template Download** button (downloads Excel + CSV sample)
- Column reference table (inline, collapsible) showing required vs optional fields

### Step 2A — Validation Failed
- Red header, error banner: "X errors found — kuch bhi save nahi hua"
- Error table: Row #, Column, Error message
- "Fix & Re-upload" button (resets to Idle)

### Step 2B — Validation Passed → Confirm
- Green header, success banner
- Summary grid: Total Medicines | With Batch | Without Batch
- Preview table: first N rows (code, generic_name, form, category, batch?)
- "Confirm Import (N medicines)" primary button

---

## Template File Format

One flat file (both Excel sheet 1 and CSV). Each row = one medicine with optional batch columns.

### Required Columns

| Column | Type | Rules |
|---|---|---|
| `medicine_code` | text | Unique, must not exist in DB |
| `generic_name` | text | Non-empty |
| `brand_name` | text | Non-empty |
| `form` | text | Non-empty (e.g. Tablet, Capsule, Syrup) |
| `category` | text | Non-empty |
| `manufacturer` | text | Non-empty |
| `purchase_price` | decimal | >= 0 |
| `selling_price` | decimal | >= 0 |

### Optional Columns

| Column | Type | Default | Notes |
|---|---|---|---|
| `strength` | text | null | e.g. 500mg |
| `stock_unit` | text | strips | |
| `min_stock` | integer | 0 | |
| `max_stock` | integer | 0 | |
| `reorder_point` | integer | 0 | |
| `eoq` | integer | 0 | |
| `storage_location` | text | null | |
| `storage_conditions` | text | null | |
| `abc_class` | A/B/C | C | |
| `batch_number` | text | — | If provided, batch_expiry + batch_qty also needed |
| `batch_expiry` | date YYYY-MM-DD | — | Required if batch_number given |
| `batch_qty` | integer | — | Required if batch_number given |
| `batch_unit_price` | decimal | purchase_price | Falls back to purchase_price |
| `batch_supplier` | text | null | |
| `batch_received_date` | date YYYY-MM-DD | today | |

**Batch rule:** If `batch_number` is present, `batch_expiry` and `batch_qty` must also be present — otherwise it's a validation error. Partial batch columns = error.

---

## Backend

### New API Routes (add to `routes/api.php`)

```
POST   /api/pharmacy-bulk-import/validate   → PharmacyBulkImportController@validate
POST   /api/pharmacy-bulk-import/import     → PharmacyBulkImportController@import
GET    /api/pharmacy-bulk-import/template   → PharmacyBulkImportController@template
```

All routes use existing `auth:sanctum` (or project's ApiTokenAuth) middleware.

### New Controller: `app/Http/Controllers/Api/PharmacyBulkImportController.php`

**`validate(Request $request)`**
1. Accept `file` (multipart). Reject if not .xlsx/.csv or > 5 MB.
2. Parse file using `PharmacyBulkImportService::parse($file)` → array of rows.
3. Run `PharmacyBulkImportService::validate($rows)` → `['errors' => [...], 'summary' => [...]]`
4. Return JSON:
   - On errors: `{ valid: false, errors: [{row, column, message}], parsed_count: N }`
   - On success: `{ valid: true, summary: {medicines: N, with_batch: N, without_batch: N}, preview: [...first 10 rows] }`
5. **Does NOT write to DB.**

**`import(Request $request)`**
1. Accept same `file` again (or re-validate from session — simpler to re-accept file).
2. Re-run validation (guards against race conditions / tampering).
3. If still valid → `PharmacyBulkImportService::import($rows)` inside `DB::transaction()`.
4. Return `{ imported: {medicines: N, batches: N} }` or error.

**`template(Request $request)`**
1. Return downloadable Excel file with header row + 3 sample data rows.
2. Also serve a CSV version via `?format=csv` query param.

### New Service: `app/Services/PharmacyBulkImportService.php`

**`parse(UploadedFile $file): array`**
- Use `League\Csv` for CSV, `PhpSpreadsheet` for xlsx.
- Return array of associative rows keyed by column name.

**`validate(array $rows): array`**
- Per-row checks: required fields present, types correct, medicine_code unique in DB and in the file itself (no duplicates within the file).
- Batch partial-fill check: if any one of `batch_number/batch_expiry/batch_qty` is present, all three must be.
- Return `['valid' => bool, 'errors' => [...], 'summary' => [...]]`.

**`import(array $rows): array`**
- Wrapped in `DB::transaction()`.
- For each row: create `Medicine`, then if batch columns present create `MedicineBatch` + `StockTransaction` (type = 'import').
- Return `['medicines' => N, 'batches' => N]`.

### Dependencies

Check if `phpoffice/phpspreadsheet` is already installed. If not, it needs to be added. `league/csv` check similarly.

---

## File Constraints

| Constraint | Value |
|---|---|
| Max file size | 5 MB |
| Max rows | 500 |
| Accepted formats | .xlsx, .csv |
| Duplicate medicine_code | Validation error (all-or-nothing) |
| Partial batch columns | Validation error |

---

## Error Messages (user-facing)

| Condition | Message |
|---|---|
| medicine_code duplicate in DB | "Duplicate — {code} already exists in database" |
| medicine_code duplicate in file | "Duplicate within file — {code} appears on rows {a} and {b}" |
| Required field empty | "Required field is empty" |
| Invalid number | "Must be a number >= 0 (got: {value})" |
| Invalid date | "Invalid date format — use YYYY-MM-DD (got: {value})" |
| Partial batch | "batch_number, batch_expiry, and batch_qty must all be provided together" |
| File too large | "File size exceeds 5 MB limit" |
| Wrong format | "Only .xlsx and .csv files are accepted" |
| Over row limit | "File contains more than 500 rows — split into smaller batches" |

---

## Packages Required

| Package | Purpose | Status |
|---|---|---|
| `phpoffice/phpspreadsheet` | Parse .xlsx files + generate template | Check if installed |
| `league/csv` | Parse .csv files | Check if installed |

---

## What Is NOT in Scope

- Updating existing medicines via bulk upload (overwrite) — error if duplicate
- Bulk upload of batches only (without medicine creation)
- Scheduled/background import jobs
- Import history log page
- Column mapping UI (columns must match template exactly)

---

## Self-Review Checklist

- [x] No TBD or placeholders remaining
- [x] Architecture matches feature description (inline card, no modal, no new page)
- [x] All-or-nothing validation is enforced at both validate and import endpoints
- [x] Batch partial-column rule is explicit
- [x] Error messages are concrete and user-facing
- [x] Scope is bounded — no overwriting, no history log, no mapping UI
- [x] Package dependencies identified for checking
