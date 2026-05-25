# Medicine Category Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the medicine category dropdown configurable from the Pharmacy Configuration page instead of being hardcoded in the Add Medicine modal.

**Architecture:** Add `medicine_category` as a 4th managed category in `PharmacyConfigController` (seeds 26 default values); the config page renders a new card automatically via `renderAll()`; the inventory modal fetches active categories dynamically on page load; the bulk import service validates uploaded category values against the configured list.

**Tech Stack:** Laravel 12 / PHP 8.2, MySQL via Eloquent, jQuery AJAX, Blade templates

---

## File Map

| File | Change |
|---|---|
| `app/Http/Controllers/Api/PharmacyConfigController.php` | Add `medicine_category` to CATEGORIES, DEFAULTS (26 items), and `in:` validation rules |
| `app/Services/PharmacyBulkImportService.php` | Add `OpdConfigItem` import; fetch configured categories before row loop; add row-level category check |
| `resources/views/pages/configuration/pharmacy.blade.php` | Add 4th card `data-category="medicine_category"` inside `#pharmConfigContainer .row.g-3` |
| `resources/views/pages/pharmacy/inventory.blade.php` | Replace 21 hardcoded `<option>` tags with single empty placeholder; add `id="addMedCategory"` |
| `public/js/pharmacy-inventory.js` | Fetch `GET /api/pharmacy-config/medicine_category` on page load; populate `#addMedCategory` |
| `tests/Feature/PharmacyConfigTest.php` | New test file: index returns medicine_category, listByCategory works, store rejects unknown category |
| `tests/Feature/PharmacyBulkImportTest.php` | Add 3 tests for category validation |

---

### Task 1: Extend PharmacyConfigController with medicine_category

**Files:**
- Modify: `app/Http/Controllers/Api/PharmacyConfigController.php`
- Create: `tests/Feature/PharmacyConfigTest.php`

- [ ] **Step 1: Write the failing tests**

Create `tests/Feature/PharmacyConfigTest.php`:

```php
<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PharmacyConfigTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'superadmin', 'is_active' => true]);
    }

    #[Test]
    public function index_includes_medicine_category(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/pharmacy-config');

        $response->assertOk();
        $response->assertJsonHasKey('medicine_category');
    }

    #[Test]
    public function list_by_category_returns_medicine_category_names(): void
    {
        // Trigger seeding via index first
        $this->actingAs($this->admin)->getJson('/api/pharmacy-config');

        $response = $this->actingAs($this->admin)->getJson('/api/pharmacy-config/medicine_category');

        $response->assertOk();
        $response->assertJsonIsArray();
        $this->assertNotEmpty($response->json());
        $this->assertContains('Analgesics & Antipyretics', $response->json());
    }

    #[Test]
    public function store_rejects_unknown_category(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/pharmacy-config', [
            'category' => 'unknown_type',
            'name'     => 'Test',
        ]);

        $response->assertUnprocessable();
    }

    #[Test]
    public function store_accepts_medicine_category(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/pharmacy-config', [
            'category' => 'medicine_category',
            'name'     => 'Antidiabetics',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('opd_config_items', [
            'category' => 'medicine_category',
            'name'     => 'Antidiabetics',
        ]);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```
C:\xampp\php\php artisan test tests/Feature/PharmacyConfigTest.php
```

Expected: `index_includes_medicine_category` FAILS (medicine_category not in CATEGORIES), others may fail similarly.

- [ ] **Step 3: Extend PharmacyConfigController**

In `app/Http/Controllers/Api/PharmacyConfigController.php`:

**Change line 11** — add `medicine_category` to CATEGORIES:
```php
const CATEGORIES = ['rx_unit', 'rx_route', 'rx_frequency', 'medicine_category'];
```

**After the `rx_frequency` block inside DEFAULTS (after line 51's `],`), add** — insert before the closing `];` of DEFAULTS:
```php
        'medicine_category' => [
            ['name' => 'Amoebicides',                        'value' => null],
            ['name' => 'Anaesthetic & Adjuvant',             'value' => null],
            ['name' => 'Analgesics & Antipyretics',          'value' => null],
            ['name' => 'Anthelmintic Drugs',                 'value' => null],
            ['name' => 'Anti Fungal Drugs',                  'value' => null],
            ['name' => 'Anti Histamines/Anti Allergic',      'value' => null],
            ['name' => 'Anti Infective Drugs',               'value' => null],
            ['name' => 'Anti Malarial Drugs',                'value' => null],
            ['name' => 'Anti Viral Drugs',                   'value' => null],
            ['name' => 'Antidotes',                          'value' => null],
            ['name' => 'Antineoplastics/Immunosuppressants', 'value' => null],
            ['name' => 'Blood Formation/Coagulants',         'value' => null],
            ['name' => 'Cardio Vascular & Diuretic',         'value' => null],
            ['name' => 'Disinfectants & Antiseptics',        'value' => null],
            ['name' => 'Ear Nose & Throat',                  'value' => null],
            ['name' => 'Gastrointestinal Drugs',             'value' => null],
            ['name' => 'Hormones/Endocrine',                 'value' => null],
            ['name' => 'Immunological',                      'value' => null],
            ['name' => 'Immunological/Biological',           'value' => null],
            ['name' => 'IV Fluids/Electrolytes',             'value' => null],
            ['name' => 'Miscellaneous Therapeutics',         'value' => null],
            ['name' => 'Psychotropics & Anticonvulsants',    'value' => null],
            ['name' => 'Respiratory Drugs',                  'value' => null],
            ['name' => 'Sterile Ophthalmic',                 'value' => null],
            ['name' => 'Topical Drug Preparations',          'value' => null],
            ['name' => 'Vitamins & Minerals',                'value' => null],
        ],
```

**Change line 167** — fix `store()` validation rule:
```php
'category' => 'required|string|in:rx_unit,rx_route,rx_frequency,medicine_category',
```

No other methods need changes — `index()`, `listByCategory()`, `update()`, and `destroy()` all use `self::CATEGORIES` which already includes the new entry after this change.

- [ ] **Step 4: Run tests to verify they pass**

```
C:\xampp\php\php artisan test tests/Feature/PharmacyConfigTest.php
```

Expected: 4 tests PASS.

- [ ] **Step 5: Run full suite to check for regressions**

```
C:\xampp\php\php artisan test
```

Expected: All tests pass (no regressions).

- [ ] **Step 6: Commit**

```
git add app/Http/Controllers/Api/PharmacyConfigController.php tests/Feature/PharmacyConfigTest.php
git commit -m "feat: add medicine_category to PharmacyConfigController with 26 seeded defaults"
```

---

### Task 2: Validate bulk import category against configured list

**Files:**
- Modify: `app/Services/PharmacyBulkImportService.php`
- Modify: `tests/Feature/PharmacyBulkImportTest.php`

- [ ] **Step 1: Write the 3 failing tests**

Append to `tests/Feature/PharmacyBulkImportTest.php` inside the class, before the final `}`:

```php
    // ── category validation tests ────────────────────────────────────────────

    #[Test]
    public function validate_fails_when_category_not_in_configured_list(): void
    {
        \App\Models\OpdConfigItem::create([
            'category'   => 'medicine_category',
            'name'       => 'Analgesics & Antipyretics',
            'value'      => null,
            'is_active'  => true,
            'sort_order' => 0,
        ]);

        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow(['category' => 'InvalidCat']);
        $rows = $this->service->parse($this->makeCsvFile($csv));
        $result = $this->service->validate($rows);

        $this->assertFalse($result['valid']);
        $categoryError = collect($result['errors'])->first(fn($e) => $e['column'] === 'category');
        $this->assertNotNull($categoryError);
        $this->assertStringContainsString('InvalidCat', $categoryError['message']);
    }

    #[Test]
    public function validate_passes_when_category_matches_configured_list(): void
    {
        \App\Models\OpdConfigItem::create([
            'category'   => 'medicine_category',
            'name'       => 'Analgesics & Antipyretics',
            'value'      => null,
            'is_active'  => true,
            'sort_order' => 0,
        ]);

        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow(['category' => 'Analgesics & Antipyretics']);
        $rows = $this->service->parse($this->makeCsvFile($csv));
        $result = $this->service->validate($rows);

        $categoryErrors = collect($result['errors'])->filter(fn($e) => $e['column'] === 'category');
        $this->assertCount(0, $categoryErrors);
    }

    #[Test]
    public function validate_skips_category_check_when_no_categories_configured(): void
    {
        // No OpdConfigItem rows for medicine_category — graceful degradation

        $csv = $this->csvHeaders() . "\n" . $this->validCsvRow(['category' => 'AnythingAtAll']);
        $rows = $this->service->parse($this->makeCsvFile($csv));
        $result = $this->service->validate($rows);

        $categoryErrors = collect($result['errors'])->filter(fn($e) => $e['column'] === 'category');
        $this->assertCount(0, $categoryErrors);
    }
```

- [ ] **Step 2: Run new tests to verify they fail**

```
C:\xampp\php\php artisan test tests/Feature/PharmacyBulkImportTest.php --filter="validate_fails_when_category\|validate_passes_when\|validate_skips_category"
```

Expected: All 3 FAIL (category check not yet implemented).

- [ ] **Step 3: Update PharmacyBulkImportService**

**Add `use` import** at line 7 (after `use App\Models\MedicineBatch;`):
```php
use App\Models\OpdConfigItem;
```

**Inside `validate()` method, after the `$existingCodes` block (after line 109) and before `foreach ($rows as $idx => $row)`, add:**
```php
        $configuredCategories = OpdConfigItem::where('category', 'medicine_category')
            ->where('is_active', true)
            ->pluck('name')
            ->map(fn($n) => strtolower(trim($n)))
            ->flip()
            ->all();
```

**Inside the `foreach` loop, after the required-field check block (after the `foreach (self::REQUIRED_COLUMNS as $col)` block, around line 118) and before the `$code` duplicate check, add:**
```php
            $cat = trim($row['category'] ?? '');
            if (!empty($configuredCategories) && $cat !== '' && !isset($configuredCategories[strtolower($cat)])) {
                $errors[] = [
                    'row'     => $rowNum,
                    'column'  => 'category',
                    'message' => "Invalid category — '{$cat}' is not in the configured list",
                ];
            }
```

- [ ] **Step 4: Run new tests to verify they pass**

```
C:\xampp\php\php artisan test tests/Feature/PharmacyBulkImportTest.php
```

Expected: All 23 tests PASS (20 existing + 3 new).

- [ ] **Step 5: Commit**

```
git add app/Services/PharmacyBulkImportService.php tests/Feature/PharmacyBulkImportTest.php
git commit -m "feat: validate bulk import category against configured medicine_category list"
```

---

### Task 3: Add Medicine Categories card to Pharmacy Config page

**Files:**
- Modify: `resources/views/pages/configuration/pharmacy.blade.php`

No JS changes needed — `renderAll()` in `pharmacy-config.js` already iterates `#pharmConfigContainer .card[data-category]` and calls `renderList()` for each. `renderList()` correctly handles non-frequency categories (`isFreq = (category === 'rx_frequency')` is false for `medicine_category`).

- [ ] **Step 1: Add the 4th card**

In `resources/views/pages/configuration/pharmacy.blade.php`, find the closing `</div>` of the `.row.g-3#pharmConfigContainer` (line 77, after the rx_frequency card's `</div></div></div>`). Insert the new card **before** that closing `</div>`:

```html
        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="medicine_category">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="tag" style="width:16px;height:16px;margin-right:6px"></i>Medicine Categories</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new category (e.g. Antidiabetics)..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:420px;overflow-y:auto"></div>
                </div>
            </div>
        </div>
```

The exact insertion point is between the `</div>` closing the `col-md-6 col-xl-4` div that wraps the rx_frequency card (line 75) and the `</div>` closing the `.row.g-3` (line 77).

- [ ] **Step 2: Manual verification**

Load `http://localhost/healthops/public/pharmacy-configuration` in the browser. Confirm:
- 4 cards visible: Units, Routes, Frequencies, Medicine Categories
- Medicine Categories card shows 26 seeded items
- Add/toggle/delete works the same as other cards

- [ ] **Step 3: Commit**

```
git add resources/views/pages/configuration/pharmacy.blade.php
git commit -m "feat: add Medicine Categories card to Pharmacy Config page"
```

---

### Task 4: Dynamic category dropdown in inventory Add Medicine modal

**Files:**
- Modify: `resources/views/pages/pharmacy/inventory.blade.php`
- Modify: `public/js/pharmacy-inventory.js`

- [ ] **Step 1: Replace hardcoded options in inventory.blade.php**

In `resources/views/pages/pharmacy/inventory.blade.php`, lines 450–473, replace the entire `<select name="category" ...>...</select>` block with:

```html
<select name="category" id="addMedCategory" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
    <option value="">Select category...</option>
</select>
```

The label line above (`Category / Therapeutic Class *`) stays unchanged.

- [ ] **Step 2: Add dynamic fetch in pharmacy-inventory.js**

In `public/js/pharmacy-inventory.js`, after the `loadMedicines()` call on line 26 (the three `load*()` calls at page-ready), add:

```js
    $.get('/api/pharmacy-config/medicine_category', function(cats) {
        var $sel = $('#addMedCategory');
        cats.forEach(function(c) {
            $sel.append('<option value="' + esc(c) + '">' + esc(c) + '</option>');
        });
    });
```

This fetches once on page load. Result is cached in the DOM — no re-fetch on each modal open.

- [ ] **Step 3: Manual verification**

1. Load `http://localhost/healthops/public/pharmacy-inventory`
2. Click "Add Medicine"
3. Open the Category dropdown — confirm it shows the configured categories (not the old hardcoded ones)
4. Go to Pharmacy Config → Medicine Categories, toggle one inactive
5. Reload inventory page, open modal — confirm toggled category is absent from dropdown
6. Confirm `#filterCategory` (the filter bar dropdown) still works as before (it uses a different endpoint)

- [ ] **Step 4: Commit**

```
git add resources/views/pages/pharmacy/inventory.blade.php public/js/pharmacy-inventory.js
git commit -m "feat: populate Add Medicine category dropdown dynamically from config"
```
