# Medicine Category Configuration — Design Spec

**Date:** 2026-05-21
**Feature:** Make the Medicine Category dropdown configurable from the Pharmacy Configuration page
**Status:** Approved

---

## Overview

The "Category" dropdown in the Add Medicine modal on the Pharmacy Inventory page is currently hardcoded with 21 values in the Blade template. This spec describes making it configurable: categories are stored in `OpdConfigItem` (existing table), managed from the Pharmacy Configuration page, loaded dynamically in the Add Medicine modal, and validated in the Bulk Import service.

---

## What Is Changing

| Location | Before | After |
|---|---|---|
| `PharmacyConfigController::CATEGORIES` | `['rx_unit','rx_route','rx_frequency']` | Add `'medicine_category'` |
| `PharmacyConfigController::DEFAULTS` | 3 groups | Add `medicine_category` with 21 seeded values |
| `store` / `update` validation | `in:rx_unit,rx_route,rx_frequency` | Add `medicine_category` |
| `inventory.blade.php` Add modal | 21 hardcoded `<option>` tags | Empty select, populated via JS |
| `pharmacy-inventory.js` | No category fetch | Fetch once on load, populate select |
| `pharmacy.blade.php` (config page) | 3 cards | Add 4th card: Medicine Categories |
| `pharmacy-config.js` | Manages 3 categories | Add section for medicine_category |
| `PharmacyBulkImportService::validate()` | Accepts any non-empty string | Validates against configured list |

---

## What Is NOT Changing

- `OpdConfigItem` model and migration — table already has all needed columns (`id`, `category`, `name`, `value`, `is_active`, `sort_order`)
- `#filterCategory` filter on inventory page — already dynamic (reads distinct values from `medicines` table)
- Edit medicine modal — no category dropdown exists there
- Any other pharmacy feature

---

## Backend

### `PharmacyConfigController`

**`CATEGORIES` constant:**
```php
const CATEGORIES = ['rx_unit', 'rx_route', 'rx_frequency', 'medicine_category'];
```

**`DEFAULTS` addition:**
```php
'medicine_category' => [
    ['name' => 'Antibiotic'],
    ['name' => 'Analgesic'],
    ['name' => 'Antihistamine'],
    ['name' => 'Antidiabetic'],
    ['name' => 'Cardiovascular'],
    ['name' => 'Gastrointestinal'],
    ['name' => 'Respiratory'],
    ['name' => 'Antifungal'],
    ['name' => 'Antiviral'],
    ['name' => 'Anti-inflammatory'],
    ['name' => 'Antipyretic'],
    ['name' => 'Antihypertensive'],
    ['name' => 'Antidepressant'],
    ['name' => 'Supplement'],
    ['name' => 'Dermatological'],
    ['name' => 'Ophthalmic'],
    ['name' => 'ENT'],
    ['name' => 'Hormonal'],
    ['name' => 'Muscle Relaxant'],
    ['name' => 'Sedative'],
    ['name' => 'Other'],
],
```
All seeded with `value = null`, `is_active = true`. Seeds only if the category has zero rows (idempotent).

**Validation rules** in `store()` and `update()`:
```php
'category' => 'required|string|in:rx_unit,rx_route,rx_frequency,medicine_category',
```

`formatItem()` and all other methods need no changes — `medicine_category` items have `value = null`, same as `rx_unit` / `rx_route`.

**Existing endpoints reused without change:**
- `GET /api/pharmacy-config` — `index()` returns all four categories grouped
- `GET /api/pharmacy-config/medicine_category` — `listByCategory()` returns active category names as `["Antibiotic", "Analgesic", ...]`
- `POST /api/pharmacy-config` — `store()` creates new item
- `PUT /api/pharmacy-config/{id}` — `update()` toggles active/name
- `DELETE /api/pharmacy-config/{id}` — `destroy()` removes item

---

### `PharmacyBulkImportService::validate()`

Before the row loop, fetch the configured category list:

```php
$configuredCategories = OpdConfigItem::where('category', 'medicine_category')
    ->where('is_active', true)
    ->pluck('name')
    ->map(fn($n) => strtolower(trim($n)))
    ->flip()
    ->all();
```

Inside the row loop, after the required-field check, add:

```php
$cat = trim($row['category'] ?? '');
if (!empty($configuredCategories) && !isset($configuredCategories[strtolower($cat)])) {
    $errors[] = ['row' => $rowNum, 'column' => 'category',
        'message' => "Invalid category — '{$cat}' is not in the configured list"];
}
```

**Graceful degradation:** If `$configuredCategories` is empty (no seeds yet), the check is skipped — existing `required field` check still catches an empty value.

**Add `use` import** at top of service: `use App\Models\OpdConfigItem;`

**Error message** matches the spec's error message table style.

---

## Frontend

### Pharmacy Config Page — New Card

**File:** `resources/views/pages/configuration/pharmacy.blade.php`

Add a fourth card in the "Prescription Dropdowns" section, after the existing three cards (Units, Routes, Frequencies). Card title: "Medicine Categories". No `timesPerDay` input — only `name`.

Card HTML follows the same structure as the existing three cards (same CSS classes, same CRUD button pattern).

### Pharmacy Config JS — New Section

**File:** `public/js/pharmacy-config.js`

Add a `loadMedicineCategories()` function alongside `loadAll()`. This follows the exact pattern of the existing `loadRxUnit()`, `loadRxRoute()`, `loadRxFrequency()` functions:
- Fetches `GET /api/pharmacy-config/medicine_category` (via `listByCategory`)

Wait — the config page uses `GET /api/pharmacy-config` (the `index()` grouped endpoint) to get all categories for management. The per-category endpoint `GET /api/pharmacy-config/{category}` is used by OPD and the inventory modal.

The config page JS (`loadAll()`) already calls `GET /api/pharmacy-config` and renders cards for each category in `CATEGORIES`. Since `medicine_category` is now in `CATEGORIES`, `index()` will return it. The config page JS needs to render the fourth card's items.

**Specific JS change:** In the existing `loadAll()` rendering logic in `pharmacy-config.js`, add handling for `medicine_category` to render the fourth card's item list (same add/toggle/delete pattern as the other three). No `timesPerDay` field.

### Inventory Page — Add Medicine Modal

**File:** `resources/views/pages/pharmacy/inventory.blade.php`

Replace the 21 hardcoded `<option>` tags with just the empty placeholder:
```html
<select name="category" id="addMedCategory" required ...>
    <option value="">Select category...</option>
</select>
```

**File:** `public/js/pharmacy-inventory.js`

On page load (inside `$(document).ready`), fetch once:
```js
$.get('/api/pharmacy-config/medicine_category', function(cats) {
    var $sel = $('#addMedCategory');
    cats.forEach(function(c) {
        $sel.append('<option value="' + esc(c) + '">' + esc(c) + '</option>');
    });
});
```

Result cached in DOM — no re-fetch on each modal open.

---

## Error Messages

| Condition | Column | Message |
|---|---|---|
| Category not in configured list | `category` | `Invalid category — '{value}' is not in the configured list` |

---

## Testing

### Unit/Feature Tests (`PharmacyBulkImportTest`)

| Test | Scenario |
|---|---|
| `validate_fails_when_category_not_in_configured_list` | Seed one category in DB, upload row with different category → error |
| `validate_passes_when_category_matches_configured_list` | Seed categories, upload matching category → valid |
| `validate_skips_category_check_when_no_categories_configured` | Empty `OpdConfigItem` for `medicine_category` → no category error |

### Manual Checks

| Check | Expected |
|---|---|
| Pharmacy Config page loads | 4th card "Medicine Categories" visible with 21 seeded items |
| Add item in Medicine Categories card | New category appears in list |
| Toggle inactive | Category disappears from inventory modal dropdown |
| Inventory Add Modal opens | Category dropdown shows active configured categories |
| Bulk import with unconfigured category | Validation error: "Invalid category — 'X' is not in the configured list" |
| Bulk import with valid category | Passes validation |

---

## Scope — Explicitly Out

- Editing existing medicine records' category (no batch-update/migration of existing data)
- Category colours in the inventory list (still uses hardcoded colour map; can be a future feature)
- Category field in Edit Medicine modal (does not currently exist)
