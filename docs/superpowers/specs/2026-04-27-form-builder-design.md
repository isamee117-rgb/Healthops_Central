# Form Builder — Design Specification
**Date:** 2026-04-27
**Project:** HealthOps — Rabia Welfare Hospital
**Phase:** Phase 1 — Builder + Preview (no patient data submission)

---

## 1. Overview

A unified, hierarchical Medical Form Builder that allows authorized users to create and configure hospital forms for any department. Forms are organized as:

```
Form Group (IPD / OPD / Emergency / OT)
  └── Form (Pre-Op Checklist, Partograph, Blood Sugar Chart…)
        └── Section (Patient Details, Vital Signs, Checklist Items…)
              └── Component (Text Input, Checkbox, Dynamic Table, Signature…)
```

### What Phase 1 Delivers
- Full CRUD for Form Groups, Forms, Sections, and Components
- 10 priority component types with configurable properties
- Tree-nav + section-editor UI (Option C — approved)
- Live form preview (read-only render, no data saving)
- Migration from 6 existing per-department form section tables to unified system

### What Phase 1 Does NOT Include
- Patient data submission / form filling
- Encounter or patient-level linking of filled forms
- Advanced components (Grid Chart, Partograph, Conditional fields, Digital signature capture)
- Multi-page form support

---

## 2. Decisions Made

| Question | Decision |
|---|---|
| Relation to existing system | Full replacement — 6 old tables dropped, data migrated |
| Form submission storage | Phase 2 — encounter-linked + standalone patient docs |
| Who can build forms | Role-controlled via existing Roles/Permissions system |
| UI layout | Option C — Tree Nav sidebar + Click-to-Add Section Editor |
| Database architecture | Option A — 4 fully normalized tables |
| Phase 1 scope | Builder + read-only preview; no data submission |
| Styling | Must match existing app: Tabler CSS + Bootstrap 5 |

---

## 3. Database Schema

### 3.1 New Tables (4)

#### `form_groups`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK auto-increment | |
| name | varchar(100) | e.g. "Inpatient Department" |
| context | enum('ipd','opd','emergency','ot','general') | Links group to a department type |
| description | text nullable | |
| sort_order | int default 0 | |
| is_active | boolean default true | |
| created_at / updated_at | timestamps | |

#### `forms`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK auto-increment | |
| form_group_id | bigint FK → form_groups | cascade delete |
| name | varchar(150) | e.g. "Pre-Op Checklist" |
| description | text nullable | |
| is_active | boolean default true | |
| sort_order | int default 0 | |
| created_at / updated_at | timestamps | |

#### `form_sections`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK auto-increment | |
| form_id | bigint FK → forms | cascade delete |
| title | varchar(150) | e.g. "Patient Details" |
| sort_order | int default 0 | |
| created_at / updated_at | timestamps | |

#### `form_components`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK auto-increment | |
| form_section_id | bigint FK → form_sections | cascade delete |
| type | varchar(50) | one of 10 component type keys |
| label | varchar(200) | display label |
| sort_order | int default 0 | |
| config | JSON nullable | type-specific settings (see §3.2) |
| created_at / updated_at | timestamps | |

### 3.2 Component Config JSON Schema

Each component type stores its settings in the `config` JSON column:

```json
text_input:     { "placeholder": "", "required": true, "maxlength": 255, "width": "full|half|third" }
textarea:       { "placeholder": "", "required": false, "rows": 3, "width": "full|half" }
checkbox:       { "options": [{"label": "Yes", "value": "yes"}], "required": false, "layout": "horizontal|vertical" }
radio:          { "options": [{"label": "Fit", "value": "fit"}], "required": true, "layout": "horizontal|vertical" }
dropdown:       { "options": [{"label": "Male", "value": "male"}], "required": false, "placeholder": "Select...", "width": "full|half|third" }
date:           { "required": false, "width": "full|half|third" }
time:           { "required": false, "width": "full|half|third" }
dynamic_table:  { "columns": [{"label": "Time", "type": "text|number|date", "width": ""}], "min_rows": 1, "max_rows": 50 }
signature:      { "required": false, "show_date": true }
header:         { "text": "Section Heading", "level": "h2|h3|h4", "align": "left|center" }
```

### 3.3 Tables to Drop (Migration)

These 6 existing tables are replaced. Their data is seeded into the new structure:
- `opd_form_sections`
- `ipd_form_sections`
- `er_form_sections`
- `ot_form_sections`
- `ot_intraop_form_sections`
- `ot_postop_form_sections`

Existing API routes (`/api/opd/form-sections`, etc.) are updated to read from the new tables during Phase 1.

---

## 4. Eloquent Models

### 4.1 Model List

| Model | Table | Relationships |
|---|---|---|
| `FormGroup` | form_groups | `hasMany(Form)` |
| `Form` | forms | `belongsTo(FormGroup)`, `hasMany(FormSection)` |
| `FormSection` | form_sections | `belongsTo(Form)`, `hasMany(FormComponent)` |
| `FormComponent` | form_components | `belongsTo(FormSection)` |

### 4.2 Model Rules
- Explicit `$fillable` on every model (no `$guarded = []`)
- `config` cast to `array` on `FormComponent`
- `is_active` cast to `boolean` on `FormGroup` and `Form`
- All cascade deletes handled at DB migration level (not just Eloquent)

---

## 5. API Design

### 5.1 Controllers (4 new)
- `FormGroupController`
- `FormController`
- `FormSectionController`
- `FormComponentController`

All controllers are thin — validation inline (no Form Request classes needed for this CRUD-only phase), business logic stays minimal.

### 5.2 Routes

**Important:** All `/reorder` routes must be registered BEFORE their corresponding `/{id}` routes in `api.php` to prevent Laravel treating "reorder" as an ID.

**Reorder request body** (all reorder endpoints): `[{"id": 1, "sortOrder": 0}, {"id": 2, "sortOrder": 1}, ...]`

```
# Form Groups
GET    /api/form-groups                          index — all groups with nested forms
POST   /api/form-groups                          store
PATCH  /api/form-groups/reorder                  bulk sort_order update  ← before /{id}
PATCH  /api/form-groups/{id}                     update
DELETE /api/form-groups/{id}                     destroy

# Forms
GET    /api/form-groups/{groupId}/forms          index — forms for a group
POST   /api/form-groups/{groupId}/forms          store
PATCH  /api/forms/reorder                        bulk sort_order update  ← before /{id}
PATCH  /api/forms/{id}                           update
DELETE /api/forms/{id}                           destroy

# Sections
GET    /api/forms/{formId}/sections              index — sections with components
POST   /api/forms/{formId}/sections              store
PATCH  /api/form-sections/reorder                bulk sort_order update  ← before /{id}
PATCH  /api/form-sections/{id}                   update (title, sort_order)
DELETE /api/form-sections/{id}                   destroy

# Components
POST   /api/form-sections/{sectionId}/components store
PATCH  /api/form-components/reorder              bulk sort_order update  ← before /{id}
PATCH  /api/form-components/{id}                 update (label, config, sort_order)
DELETE /api/form-components/{id}                 destroy

# Full form (for preview + future renderer)
GET    /api/forms/{id}/full                      form + all sections + all components (eager loaded)
```

### 5.3 Response Format
- All JSON keys in **camelCase** (matching existing app convention)
- Error format: `{ "error": "message" }` with appropriate 4xx status
- List responses: plain JSON arrays (no pagination needed — form counts stay small)

### 5.4 Existing Routes to Update

The 6 old controllers (`OpdFormSectionController`, `IpdFormSectionController`, etc.) are **replaced** — their index methods are updated to query from the new unified tables and return data in the **same JSON shape** the existing OPD/IPD/ER/OT page JS already expects (so those pages keep working without JS changes):

| Old Route | Updated To Query |
|---|---|
| `GET /api/opd/form-sections` | `FormSection` joined through `Form → FormGroup` where `context = 'opd'` |
| `GET /api/ipd/form-sections` | `FormSection` where `context = 'ipd'` |
| `GET /api/er/form-sections` | `FormSection` where `context = 'emergency'` |
| `GET /api/ot/form-sections` | `FormSection` where `context = 'ot'` and form name not containing Intra/Post |
| `GET /api/ot/intraop-form-sections` | `FormSection` where `context = 'ot'` and form name = "Intra-Op Anesthesia Notes" |
| `GET /api/ot/postop-form-sections` | `FormSection` where `context = 'ot'` and form name = "Post Op Orders" |

The store/update/delete methods on these old controllers are removed — all mutations now go through the new FormBuilder API endpoints.

---

## 6. Frontend Architecture

### 6.1 New Files
| File | Purpose |
|---|---|
| `resources/views/pages/form-builder.blade.php` | Blade page shell (no inline JS) |
| `public/js/pages/form-builder.js` | All page JS (Vanilla JS, ~600–900 lines) |
| `public/css/app.css` | Extended with form-builder specific styles |

### 6.2 New Web Route
```php
// routes/web.php
Route::get('/form-builder', fn() => view('pages.form-builder'))->name('form-builder');
```

### 6.3 Page Layout (Tabler CSS)

```
┌─────────────────────────────────────────────────────┐
│  Tabler sidebar (existing) │  Page content           │
│                             │  ┌─────────────────┐  │
│  [Form Builder menu item]   │  │ Form Builder     │  │
│                             │  │ ┌──────┬───────┐ │  │
│                             │  │ │Tree  │ Editor│ │  │
│                             │  │ │Nav   │ Area  │ │  │
│                             │  │ └──────┴───────┘ │  │
│                             │  └─────────────────┘  │
└─────────────────────────────────────────────────────┘
```

The form builder lives inside the existing Tabler layout. The tree nav and editor are a two-panel layout inside the page content area (not replacing the global sidebar).

### 6.4 JS State Structure

```js
var state = {
    groups:          [],    // all form groups
    activeGroupId:   null,
    activeForms:     [],    // forms for active group
    activeFormId:    null,
    activeForm:      null,  // full form with sections + components
    componentModal:  { open: false, sectionId: null, component: null },
    sectionModal:    { open: false, formId: null, section: null },
    previewOpen:     false,
};
```

### 6.5 Key UI Behaviours

**Tree Sidebar:**
- Groups are collapsible (click group header to expand/collapse)
- Clicking a form loads `GET /api/forms/{id}/full` and renders the section editor
- "+ Group" button → modal to create a new form group
- "+" button next to each group → modal to create a new form within that group

**Section Editor:**
- Each section is a Bootstrap card
- ↑↓ buttons call `PATCH /api/form-sections/reorder` to update sort_order
- "✎ Edit" on section title → inline edit (contenteditable or small input)
- "✕ Delete" section → confirm dialog → `DELETE /api/form-sections/{id}`
- "+ Add Component" buttons at bottom of each section → Component Picker

**Component Picker:**
- 10 buttons in a grid (one per component type)
- Clicking a type immediately creates the component via `POST /api/form-sections/{sectionId}/components` with default config
- Then opens the Component Config Modal pre-populated

**Component Config Modal:**
- Bootstrap modal
- Fields change depending on component type
- For checkbox/radio: dynamic option list (add/remove rows)
- For dynamic_table: dynamic column definition (add/remove columns, set type)
- Save → `PATCH /api/form-components/{id}`

**Preview Modal:**
- Bootstrap modal, full-width
- Renders form exactly as it will appear to clinical staff
- Hospital header (name, address, patient info bar)
- Each section rendered with its components as real HTML form elements (read-only — `disabled` attribute)
- Dynamic tables show 3 empty rows by default
- Signature fields show name + date underline fields

---

## 7. Component Catalog — Phase 1 (10 types)

| Type Key | Display Name | Description |
|---|---|---|
| `text_input` | Text Input | Single-line text field. Config: placeholder, required, maxlength, width |
| `textarea` | Text Area | Multi-line text. Config: placeholder, required, rows, width |
| `checkbox` | Checkbox Group | One or more checkboxes. Config: options array, required, layout |
| `radio` | Radio Button | Select one from options. Config: options array, required, layout |
| `dropdown` | Dropdown | Select element. Config: options array, required, placeholder, width |
| `date` | Date | Date picker. Config: required, width |
| `time` | Time | Time picker. Config: required, width |
| `dynamic_table` | Dynamic Table | Table with configurable columns, addable rows. Config: columns array, min/max rows |
| `signature` | Signature | Name underline + date field (Phase 1). Config: required, show_date |
| `header` | Heading / Label | Display-only text. Config: text, level (h2/h3/h4), align |

---

## 8. Permissions

A new permission entry `form_builder` is added to the existing permissions system.

| Action | Permission Check |
|---|---|
| View Form Builder page | `form_builder.view` |
| Create/Edit/Delete Form Groups & Forms | `form_builder.manage` |
| Preview forms | `form_builder.view` |

The existing `RoleController` and Roles UI are used to assign these permissions — no new permission system needed.

---

## 9. Migration & Seeder Strategy

### 9.1 Migration Files (in order)
1. `create_form_groups_table`
2. `create_forms_table`
3. `create_form_sections_table`
4. `create_form_components_table`
5. `migrate_and_drop_old_form_section_tables` — this migration reads the 6 old tables, copies their data into the new structure (inside the `up()` method), then drops the old tables. This keeps data migration atomic with schema change and avoids a separate seeder step for the migration path.

### 9.2 Seeder: `FormBuilderSeeder`
Creates the following structure from existing data + the PDF form set:

```
FormGroup: IPD (context: ipd)
  Form: General Consent Form
  Form: Patient Guidelines
  Form: Investigation Flow Sheet
  Form: Pre-Operative Orders
  Form: Pre-Op Check List
  Form: Blood Transfusion Consent
  Form: Informed Consent (Operation)
  Form: Bed Side Pre-Op Assessment
  Form: Intra-Op Anesthesia Notes
  Form: Recovery Notes
  Form: Post Op Orders
  Form: Operation Notes
  Form: Outcome Summary / Important Notes
  Form: Discharge Slip (Gynaecology)

FormGroup: OPD (context: opd)
  Form: Symptoms
  Form: Investigation Orders
  Form: Prescription
  Form: Clinical Notes

FormGroup: Emergency (context: emergency)
  Form: History / Examination
  Form: Case Summary
  Form: Daily Progress Notes

FormGroup: OT (context: ot)
  Form: Nutritional Assessment
  Form: Blood Sugar Levels Chart
  Form: Partograph
  Form: Vital Sign Chart
  Form: Intravenous Fluids & Drugs
  Form: Regular Prescription
  Form: Day / Night Chart
  Form: Newborn Physical Examination
```

---

## 10. Navigation Integration

A new "Form Builder" item is added to the existing Tabler sidebar navigation (in `app.blade.php`), visible only to users with `form_builder.view` permission. Icon: `ti-forms` or equivalent Tabler icon.

---

## 11. Out of Scope (Phase 2)

- Patient form submission and data storage
- Encounter-linked submissions (OPD visit, IPD admission, OT case)
- Standalone patient-level document submissions
- Conditional logic (show/hide fields based on answers)
- Advanced components: Grid Chart, Partograph renderer, Digital signature capture, Repeating sections
- Form versioning
- Multi-page forms
- PDF export of filled forms
- RTL / Urdu label support (noted for Phase 3)
