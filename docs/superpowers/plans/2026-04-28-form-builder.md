# Form Builder Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified medical form builder (Form Groups → Forms → Sections → Components) that replaces 6 existing per-department form section tables, with a Tree Nav + Section Editor UI and live read-only preview.

**Architecture:** 4 normalized DB tables (`form_groups`, `forms`, `form_sections`, `form_components`) with 4 API controllers. A single Blade page (`form-builder.blade.php`) loads `public/js/pages/form-builder.js` which handles all UI state via jQuery + Bootstrap modals. Old department-specific controllers keep their `index` endpoints pointing at the new tables for backward compat.

**Tech Stack:** Laravel 12, PHP 8.2, MySQL, jQuery + Bootstrap 5, Lucide icons, `HmsHelpers` trait (`toCamel` / `toCamelCollection` / `safeError`), `HMS.toast()` / `HMS.can()` from `public/js/app.js`.

---

## File Map

**New files:**
- `database/migrations/2026_04_27_000001_create_form_groups_table.php`
- `database/migrations/2026_04_27_000002_create_forms_table.php`
- `database/migrations/2026_04_27_000003_create_form_sections_table.php`
- `database/migrations/2026_04_27_000004_create_form_components_table.php`
- `database/migrations/2026_04_27_000005_migrate_and_drop_old_form_section_tables.php`
- `database/migrations/2026_04_27_000006_add_form_builder_permissions.php`
- `database/seeders/FormBuilderSeeder.php`
- `app/Models/FormGroup.php`
- `app/Models/Form.php`
- `app/Models/FormSection.php`
- `app/Models/FormComponent.php`
- `app/Http/Controllers/Api/FormGroupController.php`
- `app/Http/Controllers/Api/FormController.php`
- `app/Http/Controllers/Api/FormSectionController.php`
- `app/Http/Controllers/Api/FormComponentController.php`
- `resources/views/pages/form-builder.blade.php`
- `public/js/pages/form-builder.js`
- `tests/Feature/FormBuilderTest.php`

**Modified files:**
- `routes/api.php` — add 4 controller imports + 20 new routes
- `routes/web.php` — add `/form-builder` web route
- `resources/views/partials/sidebar.blade.php` — add Form Builder nav item
- `public/css/app.css` — append form-builder styles
- `database/seeders/DatabaseSeeder.php` — call `FormBuilderSeeder`
- `app/Http/Controllers/Api/OpdFormSectionController.php` — update index, remove store/update/destroy
- `app/Http/Controllers/Api/IpdFormSectionController.php` — same
- `app/Http/Controllers/Api/ErFormSectionController.php` — same
- `app/Http/Controllers/Api/OtFormSectionController.php` — update index only
- `app/Http/Controllers/Api/OtIntraopFormSectionController.php` — update index only
- `app/Http/Controllers/Api/OtPostopFormSectionController.php` — update index only

---

## Task 1: Create 4 new table migrations

**Files:**
- Create: `database/migrations/2026_04_27_000001_create_form_groups_table.php`
- Create: `database/migrations/2026_04_27_000002_create_forms_table.php`
- Create: `database/migrations/2026_04_27_000003_create_form_sections_table.php`
- Create: `database/migrations/2026_04_27_000004_create_form_components_table.php`

- [ ] **Step 1: Create migration 1 — form_groups**

```php
// database/migrations/2026_04_27_000001_create_form_groups_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('form_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->enum('context', ['ipd', 'opd', 'emergency', 'ot', 'general']);
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('form_groups');
    }
};
```

- [ ] **Step 2: Create migration 2 — forms**

```php
// database/migrations/2026_04_27_000002_create_forms_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_group_id')->constrained('form_groups')->cascadeOnDelete();
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('forms');
    }
};
```

- [ ] **Step 3: Create migration 3 — form_sections**

```php
// database/migrations/2026_04_27_000003_create_form_sections_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('form_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('forms')->cascadeOnDelete();
            $table->string('title', 150);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('form_sections');
    }
};
```

- [ ] **Step 4: Create migration 4 — form_components**

```php
// database/migrations/2026_04_27_000004_create_form_components_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('form_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_section_id')->constrained('form_sections')->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('label', 200);
            $table->integer('sort_order')->default(0);
            $table->json('config')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('form_components');
    }
};
```

- [ ] **Step 5: Run the 4 migrations**

```bash
/c/xampp/php/php artisan migrate
```

Expected: "4 migrations" listed, no errors.

- [ ] **Step 6: Verify tables exist**

```bash
/c/xampp/mysql/bin/mysql -u root -h 127.0.0.1 healthops -e "SHOW TABLES LIKE 'form%';"
```

Expected output shows: `form_groups`, `forms`, `form_sections`, `form_components`.

- [ ] **Step 7: Commit**

```bash
git add database/migrations/2026_04_27_000001_create_form_groups_table.php \
        database/migrations/2026_04_27_000002_create_forms_table.php \
        database/migrations/2026_04_27_000003_create_form_sections_table.php \
        database/migrations/2026_04_27_000004_create_form_components_table.php
git commit -m "feat: add form builder DB schema migrations (4 tables)"
```

---

## Task 2: Create 4 Eloquent models

**Files:**
- Create: `app/Models/FormGroup.php`
- Create: `app/Models/Form.php`
- Create: `app/Models/FormSection.php`
- Create: `app/Models/FormComponent.php`

- [ ] **Step 1: Create FormGroup model**

```php
// app/Models/FormGroup.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormGroup extends Model
{
    protected $fillable = ['name', 'context', 'description', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function forms()
    {
        return $this->hasMany(Form::class)->orderBy('sort_order')->orderBy('id');
    }
}
```

- [ ] **Step 2: Create Form model**

```php
// app/Models/Form.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Form extends Model
{
    protected $fillable = ['form_group_id', 'name', 'description', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function formGroup()
    {
        return $this->belongsTo(FormGroup::class);
    }

    public function sections()
    {
        return $this->hasMany(FormSection::class)->orderBy('sort_order')->orderBy('id');
    }
}
```

- [ ] **Step 3: Create FormSection model**

```php
// app/Models/FormSection.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSection extends Model
{
    protected $fillable = ['form_id', 'title', 'sort_order'];

    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    public function components()
    {
        return $this->hasMany(FormComponent::class)->orderBy('sort_order')->orderBy('id');
    }
}
```

- [ ] **Step 4: Create FormComponent model**

```php
// app/Models/FormComponent.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormComponent extends Model
{
    protected $fillable = ['form_section_id', 'type', 'label', 'sort_order', 'config'];

    protected function casts(): array
    {
        return ['config' => 'array'];
    }

    public function section()
    {
        return $this->belongsTo(FormSection::class, 'form_section_id');
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add app/Models/FormGroup.php app/Models/Form.php \
        app/Models/FormSection.php app/Models/FormComponent.php
git commit -m "feat: add FormGroup, Form, FormSection, FormComponent models"
```

---

## Task 3: Write API feature tests (failing first)

**Files:**
- Create: `tests/Feature/FormBuilderTest.php`

- [ ] **Step 1: Create the test file**

```php
// tests/Feature/FormBuilderTest.php
<?php
namespace Tests\Feature;

use App\Models\User;
use App\Models\FormGroup;
use App\Models\Form;
use App\Models\FormSection;
use App\Models\FormComponent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FormBuilderTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create([
            'role'      => 'superadmin',
            'is_active' => true,
        ]);
    }

    #[Test]
    public function can_list_form_groups(): void
    {
        FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->admin)->getJson('/api/form-groups');

        $response->assertOk()->assertJsonCount(1)->assertJsonFragment(['name' => 'IPD']);
    }

    #[Test]
    public function can_create_form_group(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/form-groups', [
            'name'    => 'OPD',
            'context' => 'opd',
        ]);

        $response->assertCreated()->assertJsonFragment(['name' => 'OPD']);
        $this->assertDatabaseHas('form_groups', ['name' => 'OPD', 'context' => 'opd']);
    }

    #[Test]
    public function can_update_form_group(): void
    {
        $group = FormGroup::create(['name' => 'Old', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->admin)->patchJson("/api/form-groups/{$group->id}", [
            'name' => 'New',
        ]);

        $response->assertOk()->assertJsonFragment(['name' => 'New']);
        $this->assertDatabaseHas('form_groups', ['id' => $group->id, 'name' => 'New']);
    }

    #[Test]
    public function can_delete_form_group(): void
    {
        $group = FormGroup::create(['name' => 'Test', 'context' => 'general', 'sort_order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->admin)->deleteJson("/api/form-groups/{$group->id}");

        $response->assertOk()->assertJsonFragment(['success' => true]);
        $this->assertDatabaseMissing('form_groups', ['id' => $group->id]);
    }

    #[Test]
    public function can_create_form_under_group(): void
    {
        $group = FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->admin)->postJson("/api/form-groups/{$group->id}/forms", [
            'name' => 'Pre-Op Checklist',
        ]);

        $response->assertCreated()->assertJsonFragment(['name' => 'Pre-Op Checklist']);
        $this->assertDatabaseHas('forms', ['form_group_id' => $group->id, 'name' => 'Pre-Op Checklist']);
    }

    #[Test]
    public function can_create_section_under_form(): void
    {
        $group = FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);
        $form  = Form::create(['form_group_id' => $group->id, 'name' => 'Checklist', 'sort_order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->admin)->postJson("/api/forms/{$form->id}/sections", [
            'title' => 'Patient Details',
        ]);

        $response->assertCreated()->assertJsonFragment(['title' => 'Patient Details']);
        $this->assertDatabaseHas('form_sections', ['form_id' => $form->id, 'title' => 'Patient Details']);
    }

    #[Test]
    public function can_create_component_under_section(): void
    {
        $group   = FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);
        $form    = Form::create(['form_group_id' => $group->id, 'name' => 'Checklist', 'sort_order' => 1, 'is_active' => true]);
        $section = FormSection::create(['form_id' => $form->id, 'title' => 'Details', 'sort_order' => 1]);

        $response = $this->actingAs($this->admin)->postJson("/api/form-sections/{$section->id}/components", [
            'type'   => 'text_input',
            'label'  => 'Patient Name',
            'config' => ['placeholder' => '', 'required' => true, 'maxlength' => 255, 'width' => 'full'],
        ]);

        $response->assertCreated()->assertJsonFragment(['type' => 'text_input', 'label' => 'Patient Name']);
        $this->assertDatabaseHas('form_components', ['form_section_id' => $section->id, 'type' => 'text_input']);
    }

    #[Test]
    public function can_get_full_form_with_sections_and_components(): void
    {
        $group   = FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);
        $form    = Form::create(['form_group_id' => $group->id, 'name' => 'Checklist', 'sort_order' => 1, 'is_active' => true]);
        $section = FormSection::create(['form_id' => $form->id, 'title' => 'Details', 'sort_order' => 1]);
        FormComponent::create(['form_section_id' => $section->id, 'type' => 'text_input', 'label' => 'Name', 'sort_order' => 1]);

        $response = $this->actingAs($this->admin)->getJson("/api/forms/{$form->id}/full");

        $response->assertOk()
            ->assertJsonFragment(['name' => 'Checklist'])
            ->assertJsonFragment(['title' => 'Details'])
            ->assertJsonFragment(['label' => 'Name']);
    }

    #[Test]
    public function cascades_delete_from_group_to_components(): void
    {
        $group   = FormGroup::create(['name' => 'IPD', 'context' => 'ipd', 'sort_order' => 1, 'is_active' => true]);
        $form    = Form::create(['form_group_id' => $group->id, 'name' => 'F', 'sort_order' => 1, 'is_active' => true]);
        $section = FormSection::create(['form_id' => $form->id, 'title' => 'S', 'sort_order' => 1]);
        $comp    = FormComponent::create(['form_section_id' => $section->id, 'type' => 'text_input', 'label' => 'L', 'sort_order' => 1]);

        $this->actingAs($this->admin)->deleteJson("/api/form-groups/{$group->id}");

        $this->assertDatabaseMissing('forms',           ['id' => $form->id]);
        $this->assertDatabaseMissing('form_sections',   ['id' => $section->id]);
        $this->assertDatabaseMissing('form_components', ['id' => $comp->id]);
    }
}
```

- [ ] **Step 2: Run the tests — expect all to FAIL (routes not yet defined)**

```bash
/c/xampp/php/php artisan test tests/Feature/FormBuilderTest.php
```

Expected: 8 failures with "404 Not Found" or "Route not found".

- [ ] **Step 3: Commit**

```bash
git add tests/Feature/FormBuilderTest.php
git commit -m "test: add FormBuilderTest — failing, awaiting controller implementation"
```

---

## Task 4: FormGroupController + routes

**Files:**
- Create: `app/Http/Controllers/Api/FormGroupController.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create FormGroupController**

```php
// app/Http/Controllers/Api/FormGroupController.php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormGroup;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class FormGroupController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        $groups = FormGroup::with('forms')->orderBy('sort_order')->orderBy('id')->get();
        return response()->json($this->toCamelCollection($groups));
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name'        => 'required|string|max:100',
                'context'     => 'required|in:ipd,opd,emergency,ot,general',
                'description' => 'nullable|string',
            ]);
            $maxOrder = FormGroup::max('sort_order') ?? 0;
            $group = FormGroup::create([
                'name'        => $request->input('name'),
                'context'     => $request->input('context'),
                'description' => $request->input('description'),
                'sort_order'  => $maxOrder + 1,
                'is_active'   => true,
            ]);
            return response()->json($this->toCamel($group->fresh()), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create form group');
        }
    }

    public function reorder(Request $request)
    {
        try {
            $request->validate(['*' => 'array']);
            foreach ($request->all() as $item) {
                FormGroup::where('id', $item['id'])->update(['sort_order' => $item['sortOrder']]);
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to reorder form groups');
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $group = FormGroup::findOrFail($id);
            $data  = [];
            if ($request->has('name'))        $data['name']        = $request->input('name');
            if ($request->has('description')) $data['description'] = $request->input('description');
            if ($request->has('isActive'))    $data['is_active']   = $request->boolean('isActive');
            $group->update($data);
            return response()->json($this->toCamel($group->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update form group');
        }
    }

    public function destroy(int $id)
    {
        try {
            FormGroup::findOrFail($id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete form group');
        }
    }
}
```

- [ ] **Step 2: Add routes to api.php** — add these imports at the top of the route use-block and the routes in a new section at the end of the file (before the closing `});`):

At the top of `routes/api.php`, add these use-statements with the existing ones:
```php
use App\Http\Controllers\Api\FormGroupController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormSectionController;
use App\Http\Controllers\Api\FormComponentController;
```

At the end of the `Route::middleware(['web', 'auth.hms'])->group(function () {` block, add:
```php
// ── Form Builder ──────────────────────────────────────────────────────────────
Route::get('/form-groups',           [FormGroupController::class, 'index']);
Route::post('/form-groups',          [FormGroupController::class, 'store']);
Route::patch('/form-groups/reorder', [FormGroupController::class, 'reorder']); // MUST be before /{id}
Route::patch('/form-groups/{id}',    [FormGroupController::class, 'update']);
Route::delete('/form-groups/{id}',   [FormGroupController::class, 'destroy']);
```

- [ ] **Step 3: Run tests targeting group CRUD**

```bash
/c/xampp/php/php artisan test tests/Feature/FormBuilderTest.php --filter=can_list_form_groups
/c/xampp/php/php artisan test tests/Feature/FormBuilderTest.php --filter=can_create_form_group
/c/xampp/php/php artisan test tests/Feature/FormBuilderTest.php --filter=can_update_form_group
/c/xampp/php/php artisan test tests/Feature/FormBuilderTest.php --filter=can_delete_form_group
```

Expected: all 4 PASS.

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/Api/FormGroupController.php routes/api.php
git commit -m "feat: add FormGroupController and routes (CRUD + reorder)"
```

---

## Task 5: FormController + routes

**Files:**
- Create: `app/Http/Controllers/Api/FormController.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create FormController**

```php
// app/Http/Controllers/Api/FormController.php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSection;
use App\Models\FormGroup;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class FormController extends Controller
{
    use HmsHelpers;

    public function index(int $groupId)
    {
        $forms = Form::where('form_group_id', $groupId)
            ->orderBy('sort_order')->orderBy('id')->get();
        return response()->json($this->toCamelCollection($forms));
    }

    public function store(Request $request, int $groupId)
    {
        try {
            FormGroup::findOrFail($groupId);
            $request->validate([
                'name'        => 'required|string|max:150',
                'description' => 'nullable|string',
            ]);
            $maxOrder = Form::where('form_group_id', $groupId)->max('sort_order') ?? 0;
            $form = Form::create([
                'form_group_id' => $groupId,
                'name'          => $request->input('name'),
                'description'   => $request->input('description'),
                'is_active'     => true,
                'sort_order'    => $maxOrder + 1,
            ]);
            return response()->json($this->toCamel($form->fresh()), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create form');
        }
    }

    public function reorder(Request $request)
    {
        try {
            foreach ($request->all() as $item) {
                Form::where('id', $item['id'])->update(['sort_order' => $item['sortOrder']]);
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to reorder forms');
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $form = Form::findOrFail($id);
            $data = [];
            if ($request->has('name'))        $data['name']        = $request->input('name');
            if ($request->has('description')) $data['description'] = $request->input('description');
            if ($request->has('isActive'))    $data['is_active']   = $request->boolean('isActive');
            $form->update($data);
            return response()->json($this->toCamel($form->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update form');
        }
    }

    public function destroy(int $id)
    {
        try {
            Form::findOrFail($id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete form');
        }
    }

    public function full(int $id)
    {
        try {
            $form = Form::with(['sections.components'])->findOrFail($id);
            return response()->json($this->toCamel($form->toArray()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to load form');
        }
    }
}
```

- [ ] **Step 2: Add routes to api.php** — add after the form-groups block:

```php
Route::get('/form-groups/{groupId}/forms',  [FormController::class, 'index']);
Route::post('/form-groups/{groupId}/forms', [FormController::class, 'store']);
Route::patch('/forms/reorder',              [FormController::class, 'reorder']); // MUST be before /{id}
Route::patch('/forms/{id}',                 [FormController::class, 'update']);
Route::delete('/forms/{id}',               [FormController::class, 'destroy']);
Route::get('/forms/{id}/full',             [FormController::class, 'full']);
```

- [ ] **Step 3: Run tests**

```bash
/c/xampp/php/php artisan test tests/Feature/FormBuilderTest.php --filter=can_create_form_under_group
/c/xampp/php/php artisan test tests/Feature/FormBuilderTest.php --filter=can_get_full_form_with_sections_and_components
```

Expected: both PASS.

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/Api/FormController.php routes/api.php
git commit -m "feat: add FormController and routes (CRUD + reorder + full)"
```

---

## Task 6: FormSectionController + routes

**Files:**
- Create: `app/Http/Controllers/Api/FormSectionController.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create FormSectionController**

```php
// app/Http/Controllers/Api/FormSectionController.php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSection;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class FormSectionController extends Controller
{
    use HmsHelpers;

    public function index(int $formId)
    {
        $sections = FormSection::with('components')
            ->where('form_id', $formId)
            ->orderBy('sort_order')->orderBy('id')->get();
        return response()->json($this->toCamelCollection($sections));
    }

    public function store(Request $request, int $formId)
    {
        try {
            Form::findOrFail($formId);
            $request->validate(['title' => 'required|string|max:150']);
            $maxOrder = FormSection::where('form_id', $formId)->max('sort_order') ?? 0;
            $section = FormSection::create([
                'form_id'    => $formId,
                'title'      => $request->input('title'),
                'sort_order' => $maxOrder + 1,
            ]);
            return response()->json($this->toCamel($section->fresh()), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create section');
        }
    }

    public function reorder(Request $request)
    {
        try {
            foreach ($request->all() as $item) {
                FormSection::where('id', $item['id'])->update(['sort_order' => $item['sortOrder']]);
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to reorder sections');
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $section = FormSection::findOrFail($id);
            $data    = [];
            if ($request->has('title'))     $data['title']      = $request->input('title');
            if ($request->has('sortOrder')) $data['sort_order'] = $request->input('sortOrder');
            $section->update($data);
            return response()->json($this->toCamel($section->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update section');
        }
    }

    public function destroy(int $id)
    {
        try {
            FormSection::findOrFail($id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete section');
        }
    }
}
```

- [ ] **Step 2: Add routes to api.php**

```php
Route::get('/forms/{formId}/sections',     [FormSectionController::class, 'index']);
Route::post('/forms/{formId}/sections',    [FormSectionController::class, 'store']);
Route::patch('/form-sections/reorder',     [FormSectionController::class, 'reorder']); // MUST be before /{id}
Route::patch('/form-sections/{id}',        [FormSectionController::class, 'update']);
Route::delete('/form-sections/{id}',       [FormSectionController::class, 'destroy']);
```

- [ ] **Step 3: Run tests**

```bash
/c/xampp/php/php artisan test tests/Feature/FormBuilderTest.php --filter=can_create_section_under_form
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/Api/FormSectionController.php routes/api.php
git commit -m "feat: add FormSectionController and routes (CRUD + reorder)"
```

---

## Task 7: FormComponentController + routes

**Files:**
- Create: `app/Http/Controllers/Api/FormComponentController.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create FormComponentController**

```php
// app/Http/Controllers/Api/FormComponentController.php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormComponent;
use App\Models\FormSection;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class FormComponentController extends Controller
{
    use HmsHelpers;

    public function store(Request $request, int $sectionId)
    {
        try {
            FormSection::findOrFail($sectionId);
            $request->validate([
                'type'   => 'required|in:text_input,textarea,checkbox,radio,dropdown,date,time,dynamic_table,signature,header',
                'label'  => 'required|string|max:200',
                'config' => 'nullable|array',
            ]);
            $maxOrder = FormComponent::where('form_section_id', $sectionId)->max('sort_order') ?? 0;
            $component = FormComponent::create([
                'form_section_id' => $sectionId,
                'type'            => $request->input('type'),
                'label'           => $request->input('label'),
                'sort_order'      => $maxOrder + 1,
                'config'          => $request->input('config'),
            ]);
            return response()->json($this->toCamel($component->fresh()), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create component');
        }
    }

    public function reorder(Request $request)
    {
        try {
            foreach ($request->all() as $item) {
                FormComponent::where('id', $item['id'])->update(['sort_order' => $item['sortOrder']]);
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to reorder components');
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $component = FormComponent::findOrFail($id);
            $data      = [];
            if ($request->has('label'))  $data['label']  = $request->input('label');
            if ($request->has('config')) $data['config'] = $request->input('config');
            if ($request->has('sortOrder')) $data['sort_order'] = $request->input('sortOrder');
            $component->update($data);
            return response()->json($this->toCamel($component->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update component');
        }
    }

    public function destroy(int $id)
    {
        try {
            FormComponent::findOrFail($id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete component');
        }
    }
}
```

- [ ] **Step 2: Add routes to api.php**

```php
Route::post('/form-sections/{sectionId}/components', [FormComponentController::class, 'store']);
Route::patch('/form-components/reorder',             [FormComponentController::class, 'reorder']); // MUST be before /{id}
Route::patch('/form-components/{id}',                [FormComponentController::class, 'update']);
Route::delete('/form-components/{id}',               [FormComponentController::class, 'destroy']);
```

- [ ] **Step 3: Run all tests — all should now pass**

```bash
/c/xampp/php/php artisan test tests/Feature/FormBuilderTest.php
```

Expected: 8 tests PASS. If any fail, check route ordering in api.php (`/reorder` must be before `/{id}`).

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/Api/FormComponentController.php routes/api.php
git commit -m "feat: add FormComponentController and routes — all builder tests passing"
```

---

## Task 8: Migration 5 — data migration and drop old tables

**Files:**
- Create: `database/migrations/2026_04_27_000005_migrate_and_drop_old_form_section_tables.php`

This migration reads all 6 old form section tables, seeds them into the new structure, then drops the old tables.

- [ ] **Step 1: Create migration 5**

```php
// database/migrations/2026_04_27_000005_migrate_and_drop_old_form_section_tables.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $now = now();

        // ── Create form groups ───────────────────────────────────────────────
        $opdGroupId = DB::table('form_groups')->insertGetId([
            'name' => 'Outpatient Department', 'context' => 'opd',
            'sort_order' => 1, 'is_active' => 1,
            'created_at' => $now, 'updated_at' => $now,
        ]);
        $ipdGroupId = DB::table('form_groups')->insertGetId([
            'name' => 'Inpatient Department', 'context' => 'ipd',
            'sort_order' => 2, 'is_active' => 1,
            'created_at' => $now, 'updated_at' => $now,
        ]);
        $erGroupId = DB::table('form_groups')->insertGetId([
            'name' => 'Emergency Department', 'context' => 'emergency',
            'sort_order' => 3, 'is_active' => 1,
            'created_at' => $now, 'updated_at' => $now,
        ]);
        $otGroupId = DB::table('form_groups')->insertGetId([
            'name' => 'Operation Theater', 'context' => 'ot',
            'sort_order' => 4, 'is_active' => 1,
            'created_at' => $now, 'updated_at' => $now,
        ]);

        // ── OPD: one form per old section becomes a form with one section ────
        // Old opd_form_sections: each row = a "form" in the new system
        if (Schema::hasTable('opd_form_sections')) {
            $opdSections = DB::table('opd_form_sections')->orderBy('sort_order')->orderBy('id')->get();
            foreach ($opdSections as $i => $old) {
                $formId = DB::table('forms')->insertGetId([
                    'form_group_id' => $opdGroupId,
                    'name'          => $old->label,
                    'sort_order'    => $i + 1,
                    'is_active'     => 1,
                    'created_at'    => $now, 'updated_at' => $now,
                ]);
                DB::table('form_sections')->insert([
                    'form_id'    => $formId,
                    'title'      => $old->label,
                    'sort_order' => 1,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ── IPD: same pattern ────────────────────────────────────────────────
        if (Schema::hasTable('ipd_form_sections')) {
            $ipdSections = DB::table('ipd_form_sections')->orderBy('sort_order')->orderBy('id')->get();
            foreach ($ipdSections as $i => $old) {
                $formId = DB::table('forms')->insertGetId([
                    'form_group_id' => $ipdGroupId,
                    'name'          => $old->label,
                    'sort_order'    => $i + 1,
                    'is_active'     => 1,
                    'created_at'    => $now, 'updated_at' => $now,
                ]);
                DB::table('form_sections')->insert([
                    'form_id'    => $formId,
                    'title'      => $old->label,
                    'sort_order' => 1,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ── ER ───────────────────────────────────────────────────────────────
        if (Schema::hasTable('er_form_sections')) {
            $erSections = DB::table('er_form_sections')->orderBy('sort_order')->orderBy('id')->get();
            foreach ($erSections as $i => $old) {
                $formId = DB::table('forms')->insertGetId([
                    'form_group_id' => $erGroupId,
                    'name'          => $old->label,
                    'sort_order'    => $i + 1,
                    'is_active'     => 1,
                    'created_at'    => $now, 'updated_at' => $now,
                ]);
                DB::table('form_sections')->insert([
                    'form_id'    => $formId,
                    'title'      => $old->label,
                    'sort_order' => 1,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ── OT pre-op checklist ───────────────────────────────────────────────
        if (Schema::hasTable('ot_form_sections')) {
            $otFormId = DB::table('forms')->insertGetId([
                'form_group_id' => $otGroupId,
                'name'          => 'Pre-Op Check List',
                'sort_order'    => 1,
                'is_active'     => 1,
                'created_at'    => $now, 'updated_at' => $now,
            ]);
            $otSections = DB::table('ot_form_sections')->orderBy('sort_order')->orderBy('id')->get();
            foreach ($otSections as $i => $old) {
                DB::table('form_sections')->insert([
                    'form_id'    => $otFormId,
                    'title'      => $old->label,
                    'sort_order' => $i + 1,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ── OT intra-op ───────────────────────────────────────────────────────
        if (Schema::hasTable('ot_intraop_form_sections')) {
            $intraopFormId = DB::table('forms')->insertGetId([
                'form_group_id' => $otGroupId,
                'name'          => 'Intra-Op Anesthesia Notes',
                'sort_order'    => 2,
                'is_active'     => 1,
                'created_at'    => $now, 'updated_at' => $now,
            ]);
            $intraopSections = DB::table('ot_intraop_form_sections')->orderBy('sort_order')->orderBy('id')->get();
            foreach ($intraopSections as $i => $old) {
                DB::table('form_sections')->insert([
                    'form_id'    => $intraopFormId,
                    'title'      => $old->label,
                    'sort_order' => $i + 1,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ── OT post-op ────────────────────────────────────────────────────────
        if (Schema::hasTable('ot_postop_form_sections')) {
            $postopFormId = DB::table('forms')->insertGetId([
                'form_group_id' => $otGroupId,
                'name'          => 'Post Op Orders',
                'sort_order'    => 3,
                'is_active'     => 1,
                'created_at'    => $now, 'updated_at' => $now,
            ]);
            $postopSections = DB::table('ot_postop_form_sections')->orderBy('sort_order')->orderBy('id')->get();
            foreach ($postopSections as $i => $old) {
                DB::table('form_sections')->insert([
                    'form_id'    => $postopFormId,
                    'title'      => $old->label,
                    'sort_order' => $i + 1,
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ── Drop old tables ───────────────────────────────────────────────────
        Schema::dropIfExists('ot_postop_form_sections');
        Schema::dropIfExists('ot_intraop_form_sections');
        Schema::dropIfExists('ot_form_sections');
        Schema::dropIfExists('er_form_sections');
        Schema::dropIfExists('ipd_form_sections');
        Schema::dropIfExists('opd_form_sections');
    }

    public function down(): void
    {
        // Down intentionally not restoring old tables — backup DB before running up()
        Schema::dropIfExists('form_components');
        Schema::dropIfExists('form_sections');
        Schema::dropIfExists('forms');
        Schema::dropIfExists('form_groups');
    }
};
```

- [ ] **Step 2: Run the migration**

```bash
/c/xampp/php/php artisan migrate
```

Expected: migration runs, old tables dropped, data present in new tables.

- [ ] **Step 3: Verify migration**

```bash
/c/xampp/mysql/bin/mysql -u root -h 127.0.0.1 healthops -e "SELECT COUNT(*) as groups FROM form_groups; SELECT COUNT(*) as forms FROM forms; SELECT COUNT(*) as sections FROM form_sections;"
```

Expected: groups ≥ 4, forms ≥ 18 (one per old section), sections ≥ 18.

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_27_000005_migrate_and_drop_old_form_section_tables.php
git commit -m "feat: migrate existing form sections into unified tables and drop old tables"
```

---

## Task 9: Update 6 old controllers for backward compatibility

Old API routes stay registered; only the `index` method changes to query new tables. The `store`, `update`, `destroy` methods are removed (mutations now go through Form Builder).

**Files:**
- Modify: `app/Http/Controllers/Api/OpdFormSectionController.php`
- Modify: `app/Http/Controllers/Api/IpdFormSectionController.php`
- Modify: `app/Http/Controllers/Api/ErFormSectionController.php`
- Modify: `app/Http/Controllers/Api/OtFormSectionController.php`
- Modify: `app/Http/Controllers/Api/OtIntraopFormSectionController.php`
- Modify: `app/Http/Controllers/Api/OtPostopFormSectionController.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Replace OpdFormSectionController**

```php
// app/Http/Controllers/Api/OpdFormSectionController.php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSection;
use App\Traits\HmsHelpers;

class OpdFormSectionController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        $sections = FormSection::whereHas('form.formGroup', fn($q) => $q->where('context', 'opd'))
            ->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'key'        => 'section_' . $s->id,
                'label'      => $s->title,
                'is_default' => true,
                'is_enabled' => true,
                'department' => null,
                'sort_order' => $s->sort_order,
                'fields'     => null,
                'created_at' => $s->created_at,
                'updated_at' => $s->updated_at,
            ]);

        return response()->json($this->toCamelCollection($sections));
    }
}
```

- [ ] **Step 2: Replace IpdFormSectionController**

```php
// app/Http/Controllers/Api/IpdFormSectionController.php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSection;
use App\Traits\HmsHelpers;

class IpdFormSectionController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        $sections = FormSection::whereHas('form.formGroup', fn($q) => $q->where('context', 'ipd'))
            ->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'key'        => 'section_' . $s->id,
                'label'      => $s->title,
                'is_default' => true,
                'is_enabled' => true,
                'department' => null,
                'sort_order' => $s->sort_order,
                'fields'     => null,
                'created_at' => $s->created_at,
                'updated_at' => $s->updated_at,
            ]);

        return response()->json($this->toCamelCollection($sections));
    }
}
```

- [ ] **Step 3: Replace ErFormSectionController**

```php
// app/Http/Controllers/Api/ErFormSectionController.php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSection;
use App\Traits\HmsHelpers;

class ErFormSectionController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        $sections = FormSection::whereHas('form.formGroup', fn($q) => $q->where('context', 'emergency'))
            ->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'key'        => 'section_' . $s->id,
                'label'      => $s->title,
                'is_default' => true,
                'is_enabled' => true,
                'department' => null,
                'sort_order' => $s->sort_order,
                'fields'     => null,
                'created_at' => $s->created_at,
                'updated_at' => $s->updated_at,
            ]);

        return response()->json($this->toCamelCollection($sections));
    }
}
```

- [ ] **Step 4: Replace OtFormSectionController**

```php
// app/Http/Controllers/Api/OtFormSectionController.php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSection;
use App\Traits\HmsHelpers;

class OtFormSectionController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        $sections = FormSection::whereHas('form', fn($q) => $q->where('name', 'Pre-Op Check List'))
            ->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'key'        => $s->id,
                'label'      => $s->title,
                'is_default' => true,
                'is_enabled' => true,
                'sort_order' => $s->sort_order,
                'fields'     => json_encode([]),
                'created_at' => $s->created_at,
                'updated_at' => $s->updated_at,
            ]);

        return response()->json($this->toCamelCollection($sections));
    }
}
```

- [ ] **Step 5: Replace OtIntraopFormSectionController**

```php
// app/Http/Controllers/Api/OtIntraopFormSectionController.php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSection;
use App\Traits\HmsHelpers;

class OtIntraopFormSectionController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        $sections = FormSection::whereHas('form', fn($q) => $q->where('name', 'Intra-Op Anesthesia Notes'))
            ->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'key'        => $s->id,
                'label'      => $s->title,
                'is_default' => true,
                'is_enabled' => true,
                'sort_order' => $s->sort_order,
                'fields'     => json_encode([]),
                'created_at' => $s->created_at,
                'updated_at' => $s->updated_at,
            ]);

        return response()->json($this->toCamelCollection($sections));
    }
}
```

- [ ] **Step 6: Replace OtPostopFormSectionController**

```php
// app/Http/Controllers/Api/OtPostopFormSectionController.php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSection;
use App\Traits\HmsHelpers;

class OtPostopFormSectionController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        $sections = FormSection::whereHas('form', fn($q) => $q->where('name', 'Post Op Orders'))
            ->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'key'        => $s->id,
                'label'      => $s->title,
                'is_default' => true,
                'is_enabled' => true,
                'sort_order' => $s->sort_order,
                'fields'     => json_encode([]),
                'created_at' => $s->created_at,
                'updated_at' => $s->updated_at,
            ]);

        return response()->json($this->toCamelCollection($sections));
    }
}
```

- [ ] **Step 7: Remove old mutation routes from api.php**

Find and remove these lines (the old store/update/destroy routes that no longer exist on the controllers):
```
Route::post('/opd/form-sections', ...)
Route::patch('/opd/form-sections/{id}', ...)
Route::delete('/opd/form-sections/{id}', ...)
Route::post('/ipd/form-sections', ...)
Route::patch('/ipd/form-sections/{id}', ...)
Route::delete('/ipd/form-sections/{id}', ...)
Route::post('/er/form-sections', ...)
Route::patch('/er/form-sections/{id}', ...)
Route::delete('/er/form-sections/{id}', ...)
```

(OT already only has GET routes in existing api.php — verify and leave GET routes only.)

- [ ] **Step 8: Verify backward-compat routes return data**

Visit in browser (while logged in) or use curl:
```bash
# Check OPD sections still load
curl -s http://localhost/healthops/api/opd/form-sections -b "XSRF-TOKEN=..." | head -c 200
```

Or open the OPD page in browser, open DevTools Network tab, confirm `GET /api/opd/form-sections` returns a JSON array.

- [ ] **Step 9: Commit**

```bash
git add app/Http/Controllers/Api/OpdFormSectionController.php \
        app/Http/Controllers/Api/IpdFormSectionController.php \
        app/Http/Controllers/Api/ErFormSectionController.php \
        app/Http/Controllers/Api/OtFormSectionController.php \
        app/Http/Controllers/Api/OtIntraopFormSectionController.php \
        app/Http/Controllers/Api/OtPostopFormSectionController.php \
        routes/api.php
git commit -m "feat: update legacy form section controllers to query new unified tables"
```

---

## Task 10: Permissions migration

**Files:**
- Create: `database/migrations/2026_04_27_000006_add_form_builder_permissions.php`

- [ ] **Step 1: Create migration**

```php
// database/migrations/2026_04_27_000006_add_form_builder_permissions.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $maxOrder = DB::table('permissions')->max('display_order') ?? 0;

        DB::table('permissions')->insert([
            [
                'name'           => 'Form Builder Access',
                'slug'           => 'form-builder.access',
                'description'    => 'View the Form Builder and preview forms',
                'module'         => 'form-builder',
                'parent_module'  => 'configuration',
                'level'          => 'page',
                'action_type'    => null,
                'is_dangerous'   => false,
                'display_order'  => $maxOrder + 1,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'name'           => 'Form Builder Manage',
                'slug'           => 'form-builder.manage',
                'description'    => 'Create, edit, and delete form groups, forms, sections, and components',
                'module'         => 'form-builder',
                'parent_module'  => 'configuration',
                'level'          => 'action',
                'action_type'    => 'write',
                'is_dangerous'   => false,
                'display_order'  => $maxOrder + 2,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('permissions')->whereIn('slug', ['form-builder.access', 'form-builder.manage'])->delete();
    }
};
```

- [ ] **Step 2: Run the migration**

```bash
/c/xampp/php/php artisan migrate
```

Expected: migration runs without error, 2 rows added to `permissions` table.

- [ ] **Step 3: Commit**

```bash
git add database/migrations/2026_04_27_000006_add_form_builder_permissions.php
git commit -m "feat: add form-builder.access and form-builder.manage permissions"
```

---

## Task 11: FormBuilderSeeder

Creates the full form structure described in the spec (28 forms across 4 groups).

**Files:**
- Create: `database/seeders/FormBuilderSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`

- [ ] **Step 1: Create FormBuilderSeeder**

```php
// database/seeders/FormBuilderSeeder.php
<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FormBuilderSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $groups = [
            [
                'name' => 'Inpatient Department', 'context' => 'ipd', 'sort_order' => 1,
                'forms' => [
                    'General Consent Form', 'Patient Guidelines', 'Investigation Flow Sheet',
                    'Pre-Operative Orders', 'Pre-Op Check List', 'Blood Transfusion Consent',
                    'Informed Consent (Operation)', 'Bed Side Pre-Op Assessment',
                    'Intra-Op Anesthesia Notes', 'Recovery Notes', 'Post Op Orders',
                    'Operation Notes', 'Outcome Summary / Important Notes', 'Discharge Slip (Gynaecology)',
                ],
            ],
            [
                'name' => 'Outpatient Department', 'context' => 'opd', 'sort_order' => 2,
                'forms' => ['Symptoms', 'Investigation Orders', 'Prescription', 'Clinical Notes'],
            ],
            [
                'name' => 'Emergency Department', 'context' => 'emergency', 'sort_order' => 3,
                'forms' => ['History / Examination', 'Case Summary', 'Daily Progress Notes'],
            ],
            [
                'name' => 'Operation Theater', 'context' => 'ot', 'sort_order' => 4,
                'forms' => [
                    'Nutritional Assessment', 'Blood Sugar Levels Chart', 'Partograph',
                    'Vital Sign Chart', 'Intravenous Fluids & Drugs', 'Regular Prescription',
                    'Day / Night Chart', 'Newborn Physical Examination',
                ],
            ],
        ];

        foreach ($groups as $g) {
            // Skip if already seeded (idempotent)
            $existingGroup = DB::table('form_groups')
                ->where('context', $g['context'])
                ->where('name', $g['name'])
                ->first();

            if ($existingGroup) {
                $groupId = $existingGroup->id;
            } else {
                $groupId = DB::table('form_groups')->insertGetId([
                    'name'       => $g['name'],
                    'context'    => $g['context'],
                    'sort_order' => $g['sort_order'],
                    'is_active'  => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            foreach ($g['forms'] as $i => $formName) {
                $existingForm = DB::table('forms')
                    ->where('form_group_id', $groupId)
                    ->where('name', $formName)
                    ->first();

                if ($existingForm) {
                    continue;
                }

                $formId = DB::table('forms')->insertGetId([
                    'form_group_id' => $groupId,
                    'name'          => $formName,
                    'sort_order'    => $i + 1,
                    'is_active'     => 1,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ]);

                // Create a default section for each form
                DB::table('form_sections')->insert([
                    'form_id'    => $formId,
                    'title'      => $formName,
                    'sort_order' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }
}
```

- [ ] **Step 2: Register seeder in DatabaseSeeder.php**

Open `database/seeders/DatabaseSeeder.php` and add `FormBuilderSeeder` to the `run()` method:

```php
$this->call([
    // ... existing seeders ...
    \Database\Seeders\FormBuilderSeeder::class,
]);
```

- [ ] **Step 3: Run the seeder**

```bash
/c/xampp/php/php artisan db:seed --class=FormBuilderSeeder
```

Expected: runs without errors. If groups already exist from migration 5, new seeder entries are skipped (idempotent).

- [ ] **Step 4: Commit**

```bash
git add database/seeders/FormBuilderSeeder.php database/seeders/DatabaseSeeder.php
git commit -m "feat: add FormBuilderSeeder with 28 hospital forms across 4 groups"
```

---

### Task 12: Web Route + Blade Page + Sidebar Nav Item

**Files:**
- Modify: `routes/web.php` — add form-builder route
- Modify: `resources/views/partials/sidebar.blade.php` — add nav item before Configuration Setup section
- Create: `resources/views/pages/form-builder.blade.php`

- [ ] **Step 1: Add route to `routes/web.php`**

Add before the closing `});` at line 116:

```php
Route::get('/form-builder', fn() => view('pages.form-builder', ['pageTitle' => 'Form Builder']))
    ->middleware('permission:form-builder.access');
```

- [ ] **Step 2: Add sidebar nav item to `resources/views/partials/sidebar.blade.php`**

Add immediately before the `@if(auth()->user()->canManageUsers())` line that opens "Configuration Setup":

```blade
@if(auth()->user()->hasPermission('form-builder.access'))
<li>
    <a href="{{ url('/form-builder') }}" class="{{ request()->is('form-builder') ? 'active' : '' }}">
        <i data-lucide="file-edit"></i>
        <span class="nav-label">Form Builder</span>
    </a>
</li>
@endif
```

- [ ] **Step 3: Create `resources/views/pages/form-builder.blade.php`**

```blade
@extends('layouts.app')

@section('content')
<div id="fb-container">
    <div id="fb-tree">
        <div class="fb-tree-header">
            <span>Form Groups</span>
            @if(auth()->user()->hasPermission('form-builder.manage'))
            <button class="btn btn-sm btn-primary" id="btnNewGroup">
                <i data-lucide="plus" style="width:14px;height:14px"></i> Group
            </button>
            @endif
        </div>
        <div id="fb-tree-body"></div>
    </div>

    <div id="fb-editor">
        <div id="fb-editor-empty" class="fb-empty-state">
            <i data-lucide="mouse-pointer-click" style="width:48px;height:48px;color:#94a3b8"></i>
            <p class="mt-3 text-muted">Select a form from the left panel to start editing</p>
        </div>
        <div id="fb-editor-content" style="display:none">
            <div class="fb-editor-header">
                <div>
                    <h5 id="fb-editor-title" class="mb-0"></h5>
                    <small id="fb-editor-subtitle" class="text-muted"></small>
                </div>
                <div class="d-flex gap-2">
                    @if(auth()->user()->hasPermission('form-builder.manage'))
                    <button class="btn btn-sm btn-outline-secondary" id="btnNewSection">
                        <i data-lucide="plus" style="width:14px;height:14px"></i> Section
                    </button>
                    @endif
                    <button class="btn btn-sm btn-outline-primary" id="btnPreview">
                        <i data-lucide="eye" style="width:14px;height:14px"></i> Preview
                    </button>
                </div>
            </div>
            <div id="fb-sections-list"></div>
        </div>
    </div>
</div>

{{-- Group Modal --}}
<div class="modal fade" id="groupModal" tabindex="-1" aria-labelledby="groupModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="groupModalLabel">Form Group</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="groupId">
                <div class="mb-3">
                    <label class="form-label">Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="groupName" placeholder="e.g. OPD Forms">
                </div>
                <div class="mb-3">
                    <label class="form-label">Context <span class="text-danger">*</span></label>
                    <select class="form-select" id="groupContext">
                        <option value="">Select context</option>
                        <option value="opd">OPD</option>
                        <option value="ipd">IPD</option>
                        <option value="emergency">Emergency</option>
                        <option value="ot">OT</option>
                        <option value="general">General</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" id="groupDescription" rows="2"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnSaveGroup">Save</button>
            </div>
        </div>
    </div>
</div>

{{-- Form Modal --}}
<div class="modal fade" id="formModal" tabindex="-1" aria-labelledby="formModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="formModalLabel">Form</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="formId">
                <input type="hidden" id="formGroupId">
                <div class="mb-3">
                    <label class="form-label">Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="formName" placeholder="e.g. Admission Form">
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" id="formDescription" rows="2"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnSaveForm">Save</button>
            </div>
        </div>
    </div>
</div>

{{-- Section Modal --}}
<div class="modal fade" id="sectionModal" tabindex="-1" aria-labelledby="sectionModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="sectionModalLabel">Section</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="sectionId">
                <div class="mb-3">
                    <label class="form-label">Title <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="sectionTitle" placeholder="e.g. Chief Complaint">
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <input type="text" class="form-control" id="sectionDescription">
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="sectionCollapsible">
                    <label class="form-check-label" for="sectionCollapsible">Collapsible</label>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnSaveSection">Save</button>
            </div>
        </div>
    </div>
</div>

{{-- Component Config Modal --}}
<div class="modal fade" id="componentModal" tabindex="-1" aria-labelledby="componentModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="componentModalLabel">Configure Component</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="componentId">
                <input type="hidden" id="componentSectionId">
                <input type="hidden" id="componentType">
                <div class="mb-3">
                    <label class="form-label">Label <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="componentLabel" placeholder="Field label">
                </div>
                <div class="mb-3">
                    <label class="form-label">Key <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="componentKey" placeholder="field_key">
                    <small class="text-muted">Unique identifier within this form (snake_case)</small>
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="componentRequired">
                    <label class="form-check-label" for="componentRequired">Required</label>
                </div>
                <div id="componentTypeConfig"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnSaveComponent">Save</button>
            </div>
        </div>
    </div>
</div>

{{-- Preview Modal --}}
<div class="modal fade" id="previewModal" tabindex="-1" aria-labelledby="previewModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="previewModalLabel">Form Preview</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="previewBody"></div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/pages/form-builder.js') }}"></script>
@endpush
```

- [ ] **Step 4: Verify page loads**

Navigate to `http://localhost/healthops/form-builder`. Expected: two-panel layout with empty tree and empty-state message. No JS errors in console. A user without `form-builder.access` gets a 403 page.

- [ ] **Step 5: Commit**

```bash
git add routes/web.php resources/views/pages/form-builder.blade.php resources/views/partials/sidebar.blade.php
git commit -m "feat: add form-builder route, Blade page, and sidebar nav item"
```

---

### Task 13: CSS — Form Builder Styles

**Files:**
- Modify: `public/css/app.css` — append form builder styles at end of file

- [ ] **Step 1: Append CSS to `public/css/app.css`**

Add at the very end of the file:

```css
/* ─── Form Builder ─────────────────────────────────────────────────────── */

#fb-container {
    display: flex;
    height: calc(100vh - 64px);
    overflow: hidden;
}

#fb-tree {
    width: 280px;
    min-width: 220px;
    max-width: 340px;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f8fafc;
}

.fb-tree-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
    font-size: 0.85rem;
    color: #475569;
}

#fb-tree-body {
    overflow-y: auto;
    flex: 1;
    padding: 8px 0;
}

.fb-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 14px;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 600;
    color: #334155;
    user-select: none;
}

.fb-group-header:hover { background: #e2e8f0; }

.fb-form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px 6px 28px;
    cursor: pointer;
    font-size: 0.82rem;
    color: #475569;
    border-left: 3px solid transparent;
}

.fb-form-item:hover { background: #e2e8f0; }

.fb-form-item.active {
    background: #eff6ff;
    border-left-color: #3b82f6;
    color: #1d4ed8;
    font-weight: 500;
}

.fb-form-actions,
.fb-group-actions { display: none; gap: 4px; }

.fb-form-item:hover .fb-form-actions,
.fb-group-header:hover .fb-group-actions { display: flex; }

.fb-action-btn {
    background: none;
    border: none;
    padding: 2px 4px;
    cursor: pointer;
    color: #64748b;
    border-radius: 4px;
    line-height: 1;
}

.fb-action-btn:hover { background: #cbd5e1; color: #1e293b; }

#fb-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.fb-empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.fb-editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
}

#fb-editor-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
}

.fb-section-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 16px;
}

.fb-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid #f1f5f9;
    background: #f8fafc;
    border-radius: 8px 8px 0 0;
}

.fb-section-title { font-weight: 600; font-size: 0.88rem; color: #334155; }

.fb-section-body { padding: 10px 14px; }

.fb-component-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.83rem;
}

.fb-component-row:last-child { border-bottom: none; }

.fb-component-type-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.72rem;
    background: #f1f5f9;
    color: #64748b;
    font-weight: 500;
    margin-left: 8px;
}

.fb-add-component-btn {
    display: block;
    width: 100%;
    padding: 7px;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    background: #f8fafc;
    color: #64748b;
    font-size: 0.82rem;
    text-align: center;
    cursor: pointer;
    margin-top: 8px;
}

.fb-add-component-btn:hover {
    background: #eff6ff;
    border-color: #93c5fd;
    color: #3b82f6;
}

.fb-component-picker {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    padding: 12px 0;
}

.fb-type-btn {
    padding: 10px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    text-align: center;
    font-size: 0.78rem;
    color: #475569;
    transition: all 0.15s;
}

.fb-type-btn:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1d4ed8;
}

.fb-preview-section {
    margin-bottom: 24px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
}

.fb-preview-section-title {
    padding: 10px 16px;
    background: #f1f5f9;
    font-weight: 600;
    font-size: 0.9rem;
    color: #334155;
}

.fb-preview-body { padding: 16px; }

.fb-preview-body .form-label { font-size: 0.85rem; color: #475569; }

.fb-preview-table th { font-size: 0.8rem; background: #f8fafc; }
```

- [ ] **Step 2: Hard-refresh and verify layout**

Open `/form-builder` with `Ctrl+Shift+R`. Expected: left tree panel 280px wide, right editor panel fills rest, empty state icon centered in editor.

- [ ] **Step 3: Commit**

```bash
git add public/css/app.css
git commit -m "feat: add form builder CSS styles"
```

---

### Task 14: Frontend JS — `public/js/pages/form-builder.js`

**Files:**
- Create: `public/js/pages/form-builder.js`

- [ ] **Step 1: Create `public/js/pages/form-builder.js`**

```js
/* global $, HMS, HMS_BASE, bootstrap, lucide */
$(document).ready(function () {

    // ── State ──────────────────────────────────────────────────────────────────
    var FB = {
        groups: [],
        activeFormId: null,
        activeForm: null,
    };

    // ── API helper ─────────────────────────────────────────────────────────────
    function api(method, url, data) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                method: method,
                url: HMS_BASE + url,
                contentType: 'application/json',
                data: data !== undefined ? JSON.stringify(data) : undefined,
                success: resolve,
                error: function (xhr) {
                    reject(new Error(HMS.ajaxError(xhr, 'Request failed')));
                },
            });
        });
    }

    // ── Load ───────────────────────────────────────────────────────────────────
    function loadAll() {
        return api('GET', '/api/form-builder/groups').then(function (groups) {
            FB.groups = groups;
            renderTree();
        });
    }

    // ── Tree ───────────────────────────────────────────────────────────────────
    function renderTree() {
        var canManage = HMS.can('form-builder.manage');
        var html = '';
        FB.groups.forEach(function (group) {
            html += '<div class="fb-group-item" data-group-id="' + group.id + '">';
            html += '<div class="fb-group-header">';
            html += '<span><i data-lucide="folder" style="width:13px;height:13px;margin-right:5px"></i>' + escHtml(group.name) + '</span>';
            if (canManage) {
                html += '<span class="fb-group-actions">';
                html += '<button class="fb-action-btn btn-add-form" data-group-id="' + group.id + '" title="Add form"><i data-lucide="plus" style="width:12px;height:12px"></i></button>';
                html += '<button class="fb-action-btn btn-edit-group" data-id="' + group.id + '" title="Edit"><i data-lucide="pencil" style="width:12px;height:12px"></i></button>';
                html += '<button class="fb-action-btn btn-delete-group" data-id="' + group.id + '" title="Delete"><i data-lucide="trash-2" style="width:12px;height:12px"></i></button>';
                html += '</span>';
            }
            html += '</div><div class="fb-group-forms">';
            (group.forms || []).forEach(function (form) {
                var activeClass = (FB.activeFormId === form.id) ? ' active' : '';
                html += '<div class="fb-form-item' + activeClass + '" data-form-id="' + form.id + '">';
                html += '<span>' + escHtml(form.name) + '</span>';
                if (canManage) {
                    html += '<span class="fb-form-actions">';
                    html += '<button class="fb-action-btn btn-edit-form" data-id="' + form.id + '" data-group-id="' + group.id + '" data-name="' + escAttr(form.name) + '" data-description="' + escAttr(form.description || '') + '" title="Edit"><i data-lucide="pencil" style="width:12px;height:12px"></i></button>';
                    html += '<button class="fb-action-btn btn-delete-form" data-id="' + form.id + '" title="Delete"><i data-lucide="trash-2" style="width:12px;height:12px"></i></button>';
                    html += '</span>';
                }
                html += '</div>';
            });
            html += '</div></div>';
        });
        if (!html) {
            html = '<div class="p-3 text-muted text-center" style="font-size:0.82rem">No groups yet.</div>';
        }
        document.getElementById('fb-tree-body').innerHTML = html;
        if (window.lucide) lucide.createIcons();
    }

    // ── Editor ─────────────────────────────────────────────────────────────────
    function loadForm(formId) {
        FB.activeFormId = formId;
        renderTree();
        return api('GET', '/api/form-builder/forms/' + formId + '/full').then(function (form) {
            FB.activeForm = form;
            renderEditor(form);
        }).catch(function (e) { HMS.toast(e.message, 'error'); });
    }

    function renderEditor(form) {
        document.getElementById('fb-editor-empty').style.display = 'none';
        document.getElementById('fb-editor-content').style.display = '';
        document.getElementById('fb-editor-title').textContent = form.name;
        document.getElementById('fb-editor-subtitle').textContent = form.description || '';
        var canManage = HMS.can('form-builder.manage');
        var html = '';
        (form.sections || []).forEach(function (section) {
            html += renderSectionCard(section, canManage);
        });
        if (!html) {
            html = '<div class="text-muted text-center py-4" style="font-size:0.85rem">No sections yet. Click "+ Section" to add one.</div>';
        }
        document.getElementById('fb-sections-list').innerHTML = html;
        if (window.lucide) lucide.createIcons();
    }

    function renderSectionCard(section, canManage) {
        var html = '<div class="fb-section-card" data-section-id="' + section.id + '">';
        html += '<div class="fb-section-header"><span class="fb-section-title">' + escHtml(section.title) + '</span>';
        if (canManage) {
            html += '<div class="d-flex gap-1">';
            html += '<button class="fb-action-btn btn-edit-section" data-id="' + section.id + '" data-title="' + escAttr(section.title) + '" data-description="' + escAttr(section.description || '') + '" data-collapsible="' + (section.isCollapsible ? '1' : '0') + '"><i data-lucide="pencil" style="width:13px;height:13px"></i></button>';
            html += '<button class="fb-action-btn btn-delete-section" data-id="' + section.id + '"><i data-lucide="trash-2" style="width:13px;height:13px"></i></button>';
            html += '</div>';
        }
        html += '</div><div class="fb-section-body">';
        (section.components || []).forEach(function (comp) {
            html += renderComponentRow(comp, canManage);
        });
        if (canManage) {
            html += '<button class="fb-add-component-btn btn-add-component" data-section-id="' + section.id + '"><i data-lucide="plus" style="width:13px;height:13px"></i> Add Component</button>';
        }
        html += '</div></div>';
        return html;
    }

    function renderComponentRow(comp, canManage) {
        var typeLabels = { text_input: 'Text', textarea: 'Textarea', checkbox: 'Checkbox', radio: 'Radio', dropdown: 'Dropdown', date: 'Date', time: 'Time', dynamic_table: 'Table', signature: 'Signature', header: 'Header' };
        var html = '<div class="fb-component-row" data-component-id="' + comp.id + '"><div>';
        html += escHtml(comp.label);
        if (comp.isRequired) html += ' <span class="text-danger">*</span>';
        html += '<span class="fb-component-type-badge">' + (typeLabels[comp.type] || comp.type) + '</span></div>';
        if (canManage) {
            var configJson = escAttr(JSON.stringify(comp.config || {}));
            html += '<div class="d-flex gap-1">';
            html += '<button class="fb-action-btn btn-edit-component" data-id="' + comp.id + '" data-section-id="' + comp.formSectionId + '" data-type="' + comp.type + '" data-label="' + escAttr(comp.label) + '" data-key="' + escAttr(comp.key) + '" data-required="' + (comp.isRequired ? '1' : '0') + '" data-config="' + configJson + '"><i data-lucide="pencil" style="width:12px;height:12px"></i></button>';
            html += '<button class="fb-action-btn btn-delete-component" data-id="' + comp.id + '"><i data-lucide="trash-2" style="width:12px;height:12px"></i></button>';
            html += '</div>';
        }
        html += '</div>';
        return html;
    }

    // ── Component Picker ───────────────────────────────────────────────────────
    function renderComponentPicker(sectionId) {
        var types = [
            { type: 'text_input', label: 'Text Input', icon: 'type' },
            { type: 'textarea', label: 'Textarea', icon: 'align-left' },
            { type: 'checkbox', label: 'Checkbox', icon: 'check-square' },
            { type: 'radio', label: 'Radio', icon: 'circle-dot' },
            { type: 'dropdown', label: 'Dropdown', icon: 'chevron-down-circle' },
            { type: 'date', label: 'Date', icon: 'calendar' },
            { type: 'time', label: 'Time', icon: 'clock' },
            { type: 'dynamic_table', label: 'Table', icon: 'table' },
            { type: 'signature', label: 'Signature', icon: 'pen-line' },
            { type: 'header', label: 'Header', icon: 'heading' },
        ];
        var html = '<p class="text-muted mb-2" style="font-size:0.82rem">Choose a component type:</p><div class="fb-component-picker">';
        types.forEach(function (t) {
            html += '<button class="fb-type-btn btn-pick-type" data-type="' + t.type + '" data-section-id="' + sectionId + '">';
            html += '<i data-lucide="' + t.icon + '" style="width:18px;height:18px;display:block;margin:0 auto 4px"></i>' + t.label + '</button>';
        });
        html += '</div>';
        return html;
    }

    // ── Type-specific config forms ─────────────────────────────────────────────
    function buildConfigForm(type, config) {
        config = config || {};
        if (type === 'text_input') {
            return '<div class="mb-2"><label class="form-label">Placeholder</label><input type="text" class="form-control form-control-sm" id="cfgPlaceholder" value="' + escAttr(config.placeholder || '') + '"></div>';
        }
        if (type === 'textarea') {
            return '<div class="mb-2"><label class="form-label">Placeholder</label><input type="text" class="form-control form-control-sm" id="cfgPlaceholder" value="' + escAttr(config.placeholder || '') + '"></div>' +
                '<div class="mb-2"><label class="form-label">Rows</label><input type="number" class="form-control form-control-sm" id="cfgRows" value="' + (config.rows || 3) + '" min="1" max="20"></div>';
        }
        if (type === 'checkbox' || type === 'radio' || type === 'dropdown') {
            return '<div class="mb-2"><label class="form-label">Options <small class="text-muted">(one per line)</small></label><textarea class="form-control form-control-sm" id="cfgOptions" rows="4">' + escHtml((config.options || []).join('\n')) + '</textarea></div>';
        }
        if (type === 'date') {
            return '<div class="mb-2"><label class="form-label">Format</label><select class="form-select form-select-sm" id="cfgFormat"><option value="YYYY-MM-DD"' + (config.format === 'YYYY-MM-DD' ? ' selected' : '') + '>YYYY-MM-DD</option><option value="DD/MM/YYYY"' + (config.format === 'DD/MM/YYYY' ? ' selected' : '') + '>DD/MM/YYYY</option></select></div>';
        }
        if (type === 'dynamic_table') {
            return '<div class="mb-2"><label class="form-label">Column Headers <small class="text-muted">(one per line)</small></label><textarea class="form-control form-control-sm" id="cfgColumns" rows="4">' + escHtml((config.columns || []).join('\n')) + '</textarea></div>';
        }
        if (type === 'header') {
            return '<div class="mb-2"><label class="form-label">Level</label><select class="form-select form-select-sm" id="cfgLevel"><option value="h3"' + (config.level === 'h3' ? ' selected' : '') + '>H3 — Large</option><option value="h4"' + (config.level === 'h4' ? ' selected' : '') + '>H4 — Medium</option><option value="h5"' + (config.level === 'h5' ? ' selected' : '') + '>H5 — Small</option></select></div>';
        }
        return '';
    }

    function collectConfig(type) {
        var config = {};
        if (type === 'text_input') {
            config.placeholder = $('#cfgPlaceholder').val().trim();
        } else if (type === 'textarea') {
            config.placeholder = $('#cfgPlaceholder').val().trim();
            config.rows = parseInt($('#cfgRows').val()) || 3;
        } else if (type === 'checkbox' || type === 'radio' || type === 'dropdown') {
            config.options = $('#cfgOptions').val().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        } else if (type === 'date') {
            config.format = $('#cfgFormat').val();
        } else if (type === 'dynamic_table') {
            config.columns = $('#cfgColumns').val().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        } else if (type === 'header') {
            config.level = $('#cfgLevel').val();
        }
        return config;
    }

    // ── Preview ────────────────────────────────────────────────────────────────
    function openPreviewModal() {
        if (!FB.activeFormId) return;
        api('GET', '/api/form-builder/forms/' + FB.activeFormId + '/full').then(function (form) {
            document.getElementById('previewModalLabel').textContent = form.name + ' — Preview';
            document.getElementById('previewBody').innerHTML = buildPreview(form);
            if (window.lucide) lucide.createIcons();
            new bootstrap.Modal(document.getElementById('previewModal')).show();
        }).catch(function (e) { HMS.toast(e.message, 'error'); });
    }

    function buildPreview(form) {
        var html = '';
        (form.sections || []).forEach(function (section) {
            html += '<div class="fb-preview-section"><div class="fb-preview-section-title">' + escHtml(section.title) + '</div><div class="fb-preview-body">';
            (section.components || []).forEach(function (comp) { html += renderPreviewComponent(comp); });
            html += '</div></div>';
        });
        return html || '<p class="text-muted text-center">No components to preview.</p>';
    }

    function renderPreviewComponent(comp) {
        var config = comp.config || {};
        var label = escHtml(comp.label);
        var req = comp.isRequired ? ' <span class="text-danger">*</span>' : '';
        if (comp.type === 'header') {
            var tag = config.level || 'h4';
            return '<' + tag + ' class="mt-3 mb-2">' + label + '</' + tag + '>';
        }
        var html = '<div class="mb-3"><label class="form-label">' + label + req + '</label>';
        if (comp.type === 'text_input') {
            html += '<input type="text" class="form-control form-control-sm" placeholder="' + escAttr(config.placeholder || '') + '" disabled>';
        } else if (comp.type === 'textarea') {
            html += '<textarea class="form-control form-control-sm" rows="' + (config.rows || 3) + '" placeholder="' + escAttr(config.placeholder || '') + '" disabled></textarea>';
        } else if (comp.type === 'checkbox') {
            (config.options || ['Option 1']).forEach(function (opt) {
                html += '<div class="form-check"><input class="form-check-input" type="checkbox" disabled><label class="form-check-label">' + escHtml(opt) + '</label></div>';
            });
        } else if (comp.type === 'radio') {
            (config.options || ['Option 1']).forEach(function (opt) {
                html += '<div class="form-check"><input class="form-check-input" type="radio" disabled><label class="form-check-label">' + escHtml(opt) + '</label></div>';
            });
        } else if (comp.type === 'dropdown') {
            html += '<select class="form-select form-select-sm" disabled><option>-- Select --</option>';
            (config.options || []).forEach(function (opt) { html += '<option>' + escHtml(opt) + '</option>'; });
            html += '</select>';
        } else if (comp.type === 'date') {
            html += '<input type="date" class="form-control form-control-sm" disabled>';
        } else if (comp.type === 'time') {
            html += '<input type="time" class="form-control form-control-sm" disabled>';
        } else if (comp.type === 'dynamic_table') {
            var cols = config.columns || ['Column 1', 'Column 2'];
            html += '<table class="table table-sm table-bordered fb-preview-table"><thead><tr>';
            cols.forEach(function (c) { html += '<th>' + escHtml(c) + '</th>'; });
            html += '</tr></thead><tbody><tr>';
            cols.forEach(function () { html += '<td><input type="text" class="form-control form-control-sm" disabled></td>'; });
            html += '</tr></tbody></table>';
        } else if (comp.type === 'signature') {
            html += '<div style="border:1px dashed #cbd5e1;border-radius:6px;height:80px;background:#f8fafc;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:0.8rem">Signature field</div>';
        }
        html += '</div>';
        return html;
    }

    // ── CRUD — Groups ──────────────────────────────────────────────────────────
    function openGroupModal(id) {
        $('#groupId').val(''); $('#groupName').val(''); $('#groupContext').val(''); $('#groupDescription').val('');
        $('#groupModalLabel').text(id ? 'Edit Form Group' : 'New Form Group');
        if (id) {
            var g = FB.groups.find(function (g) { return g.id === id; });
            if (g) { $('#groupId').val(g.id); $('#groupName').val(g.name); $('#groupContext').val(g.context); $('#groupDescription').val(g.description || ''); }
        }
        new bootstrap.Modal(document.getElementById('groupModal')).show();
    }

    $('#btnSaveGroup').on('click', function () {
        var id = $('#groupId').val();
        var payload = { name: $('#groupName').val().trim(), context: $('#groupContext').val(), description: $('#groupDescription').val().trim() };
        if (!payload.name || !payload.context) { HMS.toast('Name and context are required', 'error'); return; }
        var p = id ? api('PATCH', '/api/form-builder/groups/' + id, payload) : api('POST', '/api/form-builder/groups', payload);
        p.then(function () {
            bootstrap.Modal.getInstance(document.getElementById('groupModal')).hide();
            return loadAll();
        }).then(function () { HMS.toast(id ? 'Group updated' : 'Group created', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    // ── CRUD — Forms ───────────────────────────────────────────────────────────
    function openFormModal(groupId, formId, name, description) {
        $('#formId').val(formId || ''); $('#formGroupId').val(groupId || '');
        $('#formName').val(name || ''); $('#formDescription').val(description || '');
        $('#formModalLabel').text(formId ? 'Edit Form' : 'New Form');
        new bootstrap.Modal(document.getElementById('formModal')).show();
    }

    $('#btnSaveForm').on('click', function () {
        var id = $('#formId').val();
        var groupId = $('#formGroupId').val();
        var name = $('#formName').val().trim();
        var description = $('#formDescription').val().trim();
        if (!name) { HMS.toast('Name is required', 'error'); return; }
        var p = id
            ? api('PATCH', '/api/form-builder/forms/' + id, { name: name, description: description })
            : api('POST', '/api/form-builder/forms', { formGroupId: parseInt(groupId), name: name, description: description });
        p.then(function () {
            bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
            return loadAll();
        }).then(function () { HMS.toast(id ? 'Form updated' : 'Form created', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    // ── CRUD — Sections ────────────────────────────────────────────────────────
    function openSectionModal(sectionId, title, description, collapsible) {
        $('#sectionId').val(sectionId || ''); $('#sectionTitle').val(title || '');
        $('#sectionDescription').val(description || '');
        $('#sectionCollapsible').prop('checked', collapsible === '1' || collapsible === true);
        $('#sectionModalLabel').text(sectionId ? 'Edit Section' : 'New Section');
        new bootstrap.Modal(document.getElementById('sectionModal')).show();
    }

    $('#btnSaveSection').on('click', function () {
        var id = $('#sectionId').val();
        var payload = { title: $('#sectionTitle').val().trim(), description: $('#sectionDescription').val().trim(), isCollapsible: $('#sectionCollapsible').is(':checked') };
        if (!payload.title) { HMS.toast('Title is required', 'error'); return; }
        if (!id) { payload.formId = FB.activeFormId; }
        var p = id ? api('PATCH', '/api/form-builder/sections/' + id, payload) : api('POST', '/api/form-builder/sections', payload);
        p.then(function () {
            bootstrap.Modal.getInstance(document.getElementById('sectionModal')).hide();
            return loadForm(FB.activeFormId);
        }).then(function () { HMS.toast(id ? 'Section updated' : 'Section added', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    // ── CRUD — Components ──────────────────────────────────────────────────────
    function openComponentPickerModal(sectionId) {
        $('#componentId').val(''); $('#componentSectionId').val(sectionId); $('#componentType').val('');
        $('#componentLabel').val(''); $('#componentKey').val(''); $('#componentRequired').prop('checked', false);
        $('#componentModalLabel').text('Add Component');
        $('#componentTypeConfig').html(renderComponentPicker(sectionId));
        $('#btnSaveComponent').hide();
        new bootstrap.Modal(document.getElementById('componentModal')).show();
        if (window.lucide) lucide.createIcons();
    }

    function openComponentEditModal(id, sectionId, type, label, key, required, config) {
        if (typeof config === 'string') { try { config = JSON.parse(config); } catch (e) { config = {}; } }
        $('#componentId').val(id); $('#componentSectionId').val(sectionId); $('#componentType').val(type);
        $('#componentLabel').val(label); $('#componentKey').val(key);
        $('#componentRequired').prop('checked', required === '1' || required === true);
        $('#componentModalLabel').text('Edit Component');
        $('#componentTypeConfig').html(buildConfigForm(type, config));
        $('#btnSaveComponent').show();
        new bootstrap.Modal(document.getElementById('componentModal')).show();
    }

    $(document).on('click', '.btn-pick-type', function () {
        var type = $(this).data('type');
        var sectionId = $(this).data('section-id');
        $('#componentType').val(type); $('#componentSectionId').val(sectionId);
        $('#componentModalLabel').text('Configure Component');
        $('#componentTypeConfig').html(buildConfigForm(type, {}));
        $('#btnSaveComponent').show();
        if (window.lucide) lucide.createIcons();
    });

    $('#btnSaveComponent').on('click', function () {
        var id = $('#componentId').val();
        var sectionId = $('#componentSectionId').val();
        var type = $('#componentType').val();
        if (!type) { HMS.toast('Select a component type', 'error'); return; }
        var label = $('#componentLabel').val().trim();
        var key = $('#componentKey').val().trim();
        if (!label || !key) { HMS.toast('Label and key are required', 'error'); return; }
        var payload = { label: label, key: key, isRequired: $('#componentRequired').is(':checked'), config: collectConfig(type) };
        if (!id) { payload.formSectionId = parseInt(sectionId); payload.type = type; }
        var p = id ? api('PATCH', '/api/form-builder/components/' + id, payload) : api('POST', '/api/form-builder/components', payload);
        p.then(function () {
            bootstrap.Modal.getInstance(document.getElementById('componentModal')).hide();
            return loadForm(FB.activeFormId);
        }).then(function () { HMS.toast(id ? 'Component updated' : 'Component added', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    $('#componentLabel').on('input', function () {
        if (!$('#componentId').val()) {
            $('#componentKey').val($(this).val().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
        }
    });

    // ── Delete handlers ────────────────────────────────────────────────────────
    $(document).on('click', '.btn-delete-group', function (e) {
        e.stopPropagation();
        var id = $(this).data('id');
        if (!confirm('Delete this group and all its forms?')) return;
        api('DELETE', '/api/form-builder/groups/' + id).then(function () {
            var activeGroup = FB.groups.find(function (g) { return g.id === id; });
            if (activeGroup && (activeGroup.forms || []).find(function (f) { return f.id === FB.activeFormId; })) {
                FB.activeFormId = null; FB.activeForm = null;
                document.getElementById('fb-editor-empty').style.display = '';
                document.getElementById('fb-editor-content').style.display = 'none';
            }
            return loadAll();
        }).then(function () { HMS.toast('Group deleted', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    $(document).on('click', '.btn-delete-form', function (e) {
        e.stopPropagation();
        var id = $(this).data('id');
        if (!confirm('Delete this form and all its sections?')) return;
        api('DELETE', '/api/form-builder/forms/' + id).then(function () {
            if (FB.activeFormId === id) {
                FB.activeFormId = null; FB.activeForm = null;
                document.getElementById('fb-editor-empty').style.display = '';
                document.getElementById('fb-editor-content').style.display = 'none';
            }
            return loadAll();
        }).then(function () { HMS.toast('Form deleted', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    $(document).on('click', '.btn-delete-section', function () {
        var id = $(this).data('id');
        if (!confirm('Delete this section and all its components?')) return;
        api('DELETE', '/api/form-builder/sections/' + id)
            .then(function () { return loadForm(FB.activeFormId); })
            .then(function () { HMS.toast('Section deleted', 'success'); })
            .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    $(document).on('click', '.btn-delete-component', function () {
        var id = $(this).data('id');
        if (!confirm('Delete this component?')) return;
        api('DELETE', '/api/form-builder/components/' + id)
            .then(function () { return loadForm(FB.activeFormId); })
            .then(function () { HMS.toast('Component deleted', 'success'); })
            .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    // ── Event bindings ─────────────────────────────────────────────────────────
    $(document).on('click', '#btnNewGroup', function () { openGroupModal(null); });
    $(document).on('click', '.btn-edit-group', function (e) { e.stopPropagation(); openGroupModal($(this).data('id')); });
    $(document).on('click', '.btn-add-form', function (e) { e.stopPropagation(); openFormModal($(this).data('group-id')); });
    $(document).on('click', '.btn-edit-form', function (e) {
        e.stopPropagation();
        openFormModal($(this).data('group-id'), $(this).data('id'), $(this).data('name'), $(this).data('description'));
    });
    $(document).on('click', '.fb-form-item', function () {
        var formId = $(this).data('form-id');
        if (formId) loadForm(formId);
    });
    $(document).on('click', '#btnNewSection', function () { openSectionModal(); });
    $(document).on('click', '.btn-edit-section', function () {
        openSectionModal($(this).data('id'), $(this).data('title'), $(this).data('description'), $(this).data('collapsible'));
    });
    $(document).on('click', '.btn-add-component', function () { openComponentPickerModal($(this).data('section-id')); });
    $(document).on('click', '.btn-edit-component', function () {
        openComponentEditModal($(this).data('id'), $(this).data('section-id'), $(this).data('type'), $(this).data('label'), $(this).data('key'), $(this).data('required'), $(this).data('config'));
    });
    $(document).on('click', '#btnPreview', openPreviewModal);

    // ── Utilities ──────────────────────────────────────────────────────────────
    function escHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function escAttr(str) {
        return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ── Init ───────────────────────────────────────────────────────────────────
    loadAll().catch(function (e) { HMS.toast(e.message, 'error'); });
});
```

- [ ] **Step 2: Verify JS loads without errors**

Open browser console at `/form-builder`. Expected: no JS errors. Tree panel renders groups and forms from DB (seeded in Task 11). Clicking a form opens the editor panel.

- [ ] **Step 3: Smoke test the full builder flow**

1. Click "+ Group" → fill "Test Group" / context "general" → Save → group appears in tree
2. Hover group → click "+" (add form) → fill "Test Form" → Save → form appears under group
3. Click "Test Form" → editor opens with "No sections yet" message
4. Click "+ Section" → fill title "Patient Info" → Save → section card appears
5. Click "Add Component" → click "Text Input" → label "Patient Name" → key auto-fills → Save → row appears
6. Click "Add Component" again → "Dropdown" → add options Male/Female/Other → Save → row appears
7. Click "Preview" → modal shows rendered form fields
8. Edit a component → change label → Save → row label updates
9. Delete a component → confirm → row disappears
10. Delete section → confirm → card disappears

- [ ] **Step 4: Commit**

```bash
git add public/js/pages/form-builder.js
git commit -m "feat: add form-builder.js — CRUD + live preview for form builder UI"
```

---

### Task 15: Verification — Tests, Backward Compat, and Spec Coverage

**Files:** No new files.

- [ ] **Step 1: Run form builder tests**

```bash
/c/xampp/php/php artisan test --filter=FormBuilderTest
```

Expected output (all 8 pass):

```
PASS  Tests\Feature\FormBuilderTest
✓ can list form groups
✓ can create a form group
✓ can create a form under a group
✓ can add a section to a form
✓ can add a component to a section
✓ full form endpoint returns nested structure
✓ unauthenticated request is rejected
✓ missing permission returns 403

Tests: 8 passed
```

If a test fails: read the failure message, trace to the relevant controller/model, fix, re-run.

- [ ] **Step 2: Run the full test suite for regressions**

```bash
/c/xampp/php/php artisan test
```

Expected: all previously passing tests still pass. The old form section controllers now only expose `index()` — verify no existing test calls `store`, `update`, or `destroy` on them. If the migration 5 data migration failed silently, check `storage/logs/laravel.log`.

- [ ] **Step 3: Verify backward-compat API endpoints**

Make a GET request to each old endpoint (browser or curl):

```
GET /api/opd/form-sections
GET /api/ipd/form-sections
GET /api/er/form-sections
GET /api/ot/form-sections
GET /api/ot-intraop/form-sections
GET /api/ot-postop/form-sections
```

Each must return an array with the original camelCase shape:

```json
[
  {
    "id": 1,
    "key": "section_1",
    "label": "Chief Complaint",
    "isDefault": true,
    "isEnabled": true,
    "department": null,
    "sortOrder": 1,
    "fields": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

If data is missing: migration 5 data copy may have failed — run `php artisan migrate:fresh --seed` in development and check the log.

- [ ] **Step 4: Spec coverage table**

| Spec Requirement | Implemented In |
|---|---|
| 4 normalized tables: form_groups, forms, form_sections, form_components | Task 1 |
| FormGroup with context enum (opd, ipd, emergency, ot, general) | Tasks 1–2 |
| Form with soft deletes + sort_order | Tasks 1–2 |
| FormSection with sort_order + collapsible flag | Tasks 1–2 |
| FormComponent with type + config JSON cast + is_required | Tasks 1–2 |
| FormGroupController: index, store, update, destroy, reorder | Task 4 |
| FormController: index, store, update, destroy, reorder, full (nested) | Task 5 |
| FormSectionController: index, store, update, destroy, reorder | Task 6 |
| FormComponentController: store, update, destroy, reorder | Task 7 |
| Data migration from 6 old tables into new structure | Task 8 |
| Old controllers return backward-compat camelCase JSON shape | Task 9 |
| Permissions: form-builder.access + form-builder.manage | Task 10 |
| FormBuilderSeeder: 28 hospital forms across 4 groups | Task 11 |
| Web route + sidebar nav item | Task 12 |
| Blade page: tree nav + editor + 5 modals | Task 12 |
| CSS: two-panel layout, section cards, component rows, type picker | Task 13 |
| JS: tree renders groups + forms from API | Task 14 |
| JS: click form → loads nested editor via /full endpoint | Task 14 |
| JS: create/edit/delete groups, forms, sections, components | Task 14 |
| 10 component types with per-type config fields | Tasks 7 + 14 |
| Component picker modal with type grid | Task 14 |
| Auto-generate key from label input | Task 14 |
| Live preview modal rendering all 10 component types | Task 14 |
| permission:form-builder.manage gates all mutating buttons | Tasks 12 + 14 |

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete Form Builder Phase 1 — builder UI, CRUD API, data migration, backward compat"
```

---

*Form Builder Phase 1 implementation plan complete.*
