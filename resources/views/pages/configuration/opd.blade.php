@extends('layouts.app')
@section('content')
<div class="module-page">
    <div class="module-header">
        <div>
            <h1><i data-lucide="stethoscope"></i> OPD Configuration</h1>
            <p class="module-subtitle">Manage configurable dropdown lists for the Outpatient Department module</p>
        </div>
    </div>

    <div class="section-label">Dropdown Lists</div>

    <div class="row g-3" id="opdConfigContainer">
        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="opd_symptom">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="activity" style="width:16px;height:16px;margin-right:6px"></i>Symptoms</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new symptom..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:420px;overflow-y:auto"></div>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="opd_visit_type">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="clipboard-list" style="width:16px;height:16px;margin-right:6px"></i>Visit Type</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new visit type..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:420px;overflow-y:auto"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="section-label mt-4">Vital Signs</div>
    <p class="section-desc">Choose which vital signs appear in the vital recording form. Toggle to show or hide each field. The list is fixed — contact your administrator to add new types.</p>
    <div class="row g-3" id="vitalFieldsContainer">
        <div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">Loading...</p></div>
    </div>

    <div class="section-label mt-4">Number Series</div>
    <p class="section-desc">Configure the prefix, starting number, and padding used to generate OPD Visit IDs automatically.</p>
    <div class="row g-3" id="numberSeriesContainer"></div>

    <div class="section-label mt-4">Note</div>
    <p class="section-desc">The <strong>Department</strong> dropdown in OPD visit registration uses the departments configured in <a href="{{ url('/configuration/human-resources') }}" style="color:var(--aqua-mint);font-weight:600">Human Resources Configuration</a>. Manage departments there.</p>

    {{-- CONSULTATION FORM SECTIONS --}}
    <div class="section-label mt-4">Consultation Form Sections</div>
    <p class="section-desc">Control which sections appear in the Doctor Consultation form. Toggle built-in sections on or off, and create custom sections with your own fields — assign them to specific departments.</p>

    {{-- Built-in Sections --}}
    <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.06em">Built-in Sections</div>
    <div class="row g-3" id="builtinSectionsContainer">
        <div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">Loading...</p></div>
    </div>

    {{-- Custom Sections --}}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.06em">Custom Sections</div>
        <button class="btn-add-item" id="btnAddCustomSection" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:7px 14px">
            <i data-lucide="plus" style="width:15px;height:15px"></i> Add Custom Section
        </button>
    </div>
    <div id="customSectionsContainer">
        <p style="color:var(--color-muted-foreground);font-size:13px">No custom sections yet.</p>
    </div>
</div>

{{-- Add / Edit Custom Section Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="sectionBuilderSheet" style="width:520px;max-width:95vw;border-left:4px solid var(--aquamint)">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="sectionBuilderTitle">Add Custom Section</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;background:var(--color-muted);overflow-y:auto">
        <input type="hidden" id="sectionBuilderId" value="">

        <div style="display:flex;flex-direction:column;gap:18px">
            <div>
                <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px">Section Name <span style="color:var(--color-destructive)">*</span></label>
                <input type="text" id="sectionBuilderLabel" class="form-control" placeholder="e.g. Dermatology Exam, Cardiology Notes..." maxlength="80">
            </div>

            <div>
                <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px">Department <span style="font-weight:400;font-style:italic">(optional)</span></label>
                <select id="sectionBuilderDept" class="form-select" style="font-size:13px">
                    <option value="">All Departments</option>
                </select>
                <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Leave blank to show this section for all departments. Select a department to restrict it to employees of that department only.</div>
            </div>

            <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                    <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">Fields <span style="color:var(--color-destructive)">*</span></label>
                    <button type="button" id="btnAddField" style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:5px 12px;background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:6px;cursor:pointer">
                        <i data-lucide="plus" style="width:13px;height:13px"></i> Add Field
                    </button>
                </div>
                <div id="sectionFieldsList" style="display:flex;flex-direction:column;gap:10px">
                    <div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px" id="sectionFieldsEmpty">
                        No fields yet. Click "Add Field" to begin.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="offcanvas-footer" style="padding:16px 24px;border-top:1px solid var(--color-border);background:var(--color-card);display:flex;justify-content:flex-end;gap:10px">
        <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
        <button type="button" id="btnSaveSectionBuilder" class="btn-save-series" style="padding:8px 24px">Save Section</button>
    </div>
</div>
@endsection

@push('styles')
<style>
    .section-label {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-muted-foreground);
        margin-bottom: 10px;
        margin-top: 4px;
    }
    .section-desc {
        font-size: 13px;
        color: var(--color-muted-foreground);
        margin-top: -6px;
        margin-bottom: 12px;
    }
    .config-add-bar {
        display: flex;
        gap: 6px;
        padding: 10px 12px;
        border-bottom: 1px solid var(--color-border);
        background: var(--color-muted);
    }
    .btn-add-item {
        background: var(--aqua-mint);
        color: var(--midnight-blue);
        border: none;
        border-radius: 6px;
        padding: 4px 10px;
        display: flex;
        align-items: center;
    }
    .btn-add-item:hover { background: #6EEFC4; }
    .config-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-bottom: 1px solid var(--color-border);
        font-size: 13px;
        transition: background 0.15s;
    }
    .config-item:hover { background: var(--color-muted); }
    .config-item.inactive { opacity: 0.5; }
    .config-item .item-name {
        flex: 1;
        font-weight: 500;
        color: var(--color-foreground);
    }
    .config-item .item-actions {
        display: flex;
        gap: 4px;
        align-items: center;
    }
    .config-item .item-actions button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        color: var(--color-muted-foreground);
        display: flex;
        align-items: center;
    }
    .config-item .item-actions button:hover {
        background: var(--color-muted);
        color: var(--color-foreground);
    }
    .config-item .item-actions button.btn-delete:hover { color: var(--color-destructive); }
    .config-item .edit-input {
        flex: 1;
        font-size: 13px;
        padding: 2px 8px;
        border: 1px solid var(--aqua-mint);
        border-radius: 4px;
        outline: none;
    }
    .series-card {
        background: var(--color-card);
        border: 1px solid var(--color-border);
        border-radius: 10px;
        overflow: hidden;
    }
    .series-header {
        background: var(--midnight-blue);
        color: #fff;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
    }
    .series-header h6 { margin: 0; font-size: 14px; font-weight: 600; }
    .series-body { padding: 16px; }
    .series-body .form-label { font-size: 12px; font-weight: 600; color: var(--color-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .series-preview { font-size: 18px; font-weight: 700; color: var(--aqua-mint); font-family: monospace; }
    .btn-save-series { background: var(--aqua-mint); color: var(--midnight-blue); border: none; border-radius: 6px; padding: 6px 18px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .btn-save-series:hover { background: #6EEFC4; }
    .vital-field-card {
        background: var(--color-card);
        border: 1px solid var(--color-border);
        border-radius: 10px;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: border-color 0.15s;
    }
    .vital-field-card.is-visible { border-color: transparent; }
    .vital-field-card .vf-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: opacity 0.2s;
    }
    .vital-field-card:not(.is-visible) { opacity: 0.52; }
    .vital-field-card:not(.is-visible):hover { opacity: 0.75; }
    .vital-field-card .vf-info { flex: 1; min-width: 0; }
    .vital-field-card .vf-label { font-size: 13px; font-weight: 600; color: var(--color-foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .vital-field-card .vf-unit { font-size: 11px; color: var(--color-muted-foreground); margin-top: 2px; }
    .vital-toggle {
        position: relative;
        width: 38px;
        height: 22px;
        cursor: pointer;
        flex-shrink: 0;
    }
    .vital-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
    .vital-toggle-track {
        position: absolute;
        inset: 0;
        border-radius: 22px;
        background: var(--color-muted);
        border: 1px solid var(--color-border);
        transition: background 0.2s, border-color 0.2s;
    }
    .vital-toggle input:checked + .vital-toggle-track { background: var(--aqua-mint); border-color: var(--aqua-mint); }
    .vital-toggle-track::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.2s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .vital-toggle input:checked + .vital-toggle-track::after { transform: translateX(16px); }
</style>
@endpush

@push('scripts')
<script src="{{ asset('js/opd-config.js') }}?v={{ filemtime(public_path('js/opd-config.js')) }}"></script>
@endpush
