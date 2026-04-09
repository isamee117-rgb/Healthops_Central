@extends('layouts.app')
@section('content')
<div class="module-page">
    <div class="module-header">
        <div>
            <h1><i data-lucide="bed-double"></i> IPD Configuration</h1>
            <p class="module-subtitle">Manage configurable dropdown lists for the Inpatient Department module</p>
        </div>
    </div>

    <div class="section-label">Dropdown Lists</div>
    <p class="section-desc">Add, edit, or deactivate items that appear as dropdown options inside the IPD admission form.</p>

    <div class="row g-3" id="ipdConfigContainer">
        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="ipd_admission_type">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="tag" style="width:16px;height:16px;margin-right:6px"></i>Admission Type</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new admission type..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:420px;overflow-y:auto"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="section-label mt-4">Admission ID Format</div>
    <p class="section-desc">Configure the prefix, starting number, and zero-padding used to generate IPD Admission IDs automatically.</p>
    <div class="row g-3" id="ipdNumberSeriesContainer"></div>

    <div class="section-label mt-4">Note</div>
    <p class="section-desc">
        The <strong>Department</strong> dropdown in IPD admission uses departments configured in
        <a href="{{ url('/configuration/human-resources') }}" style="color:var(--aqua-mint);font-weight:600">Human Resources Configuration</a>.
        The <strong>Bed</strong> dropdown shows beds created in
        <a href="{{ url('/bed-management') }}" style="color:var(--aqua-mint);font-weight:600">Bed Management</a>.
        Manage those there.
    </p>

    {{-- CLINICAL ORDER FORM SECTIONS --}}
    <div class="section-label mt-4">Clinical Order Form Sections</div>
    <p class="section-desc">Control which sections appear in the Clinical Orders panel for each IPD admission. Toggle built-in clinical order sections on or off, and create custom sections with your own fields.</p>

    {{-- Built-in Sections --}}
    <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.06em">Built-in Sections</div>
    <div class="row g-3" id="ipdBuiltinSectionsContainer">
        <div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">Loading...</p></div>
    </div>

    {{-- Custom Sections --}}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.06em">Custom Sections</div>
        <button class="btn-add-item" id="btnAddIpdCustomSection" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:7px 14px">
            <i data-lucide="plus" style="width:15px;height:15px"></i> Add Custom Section
        </button>
    </div>
    <div id="ipdCustomSectionsContainer">
        <p style="color:var(--color-muted-foreground);font-size:13px">No custom sections yet.</p>
    </div>

    {{-- DISCHARGE CLEARANCE APPROVALS --}}
    <div class="section-label mt-4">Discharge Clearance Approvals</div>
    <p class="section-desc">Choose which department clearances must be obtained before a patient can proceed to the final discharge step. Disabled clearances are skipped automatically — if none are required, patients move straight to the final form.</p>
    <div class="row g-3" id="ipdDischClearanceContainer">
        <div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">Loading...</p></div>
    </div>
</div>

{{-- Add / Edit Custom Section Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="ipdSectionBuilderSheet" style="width:520px;max-width:95vw;border-left:4px solid var(--aqua-mint)">
    <div class="offcanvas-header" style="background:var(--midnight-blue)">
        <h5 class="offcanvas-title" style="color:var(--aqua-mint);font-weight:700;font-size:16px" id="ipdSectionBuilderTitle">Add Custom Section</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;background:var(--color-muted);overflow-y:auto">
        <input type="hidden" id="ipdSectionBuilderId" value="">

        <div style="display:flex;flex-direction:column;gap:18px">
            <div>
                <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px">Section Name <span style="color:var(--color-destructive)">*</span></label>
                <input type="text" id="ipdSectionBuilderLabel" class="form-control" placeholder="e.g. Wound Care, Pain Assessment..." maxlength="80">
            </div>

            <div>
                <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px">Department <span style="font-weight:400;font-style:italic">(optional)</span></label>
                <select id="ipdSectionBuilderDept" class="form-select" style="font-size:13px">
                    <option value="">All Departments</option>
                </select>
                <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Leave blank to show for all. Select a department to restrict it to matching staff.</div>
            </div>

            <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                    <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">Fields <span style="color:var(--color-destructive)">*</span></label>
                    <button type="button" id="btnAddIpdField" style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:5px 12px;background:var(--aqua-mint);color:var(--midnight-blue);border:none;border-radius:6px;cursor:pointer">
                        <i data-lucide="plus" style="width:13px;height:13px"></i> Add Field
                    </button>
                </div>
                <div id="ipdSectionFieldsList" style="display:flex;flex-direction:column;gap:10px">
                    <div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">
                        No fields yet. Click "Add Field" to begin.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="offcanvas-footer" style="padding:16px 24px;border-top:1px solid var(--color-border);background:var(--color-card);display:flex;justify-content:flex-end;gap:10px">
        <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
        <button type="button" id="btnSaveIpdSectionBuilder" class="btn-save-series" style="padding:8px 24px">Save Section</button>
    </div>
</div>
@endsection

@push('styles')
<style>
    .vital-field-card { display:flex;align-items:center;gap:12px;background:var(--color-card);border:2px solid var(--color-border);border-radius:10px;padding:14px 16px;transition:border-color .2s,background .2s; }
    .vital-field-card.is-visible { border-color:var(--aqua-mint); background:rgba(127,255,212,0.06); }
    .vf-icon { width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .vf-info { flex:1;min-width:0; }
    .vf-label { font-size:13px;font-weight:600;color:var(--midnight-blue); }
    .vf-unit  { font-size:11px;color:var(--color-muted-foreground);margin-top:1px; }
    .vital-toggle { position:relative;display:inline-flex;align-items:center;cursor:pointer;margin:0; }
    .vital-toggle input { opacity:0;width:0;height:0;position:absolute; }
    .vital-toggle-track { width:36px;height:20px;background:#cbd5e1;border:2px solid #cbd5e1;border-radius:10px;display:inline-block;transition:.2s;position:relative;flex-shrink:0; }
    .vital-toggle-track::after { content:'';position:absolute;top:1px;left:1px;width:14px;height:14px;background:#fff;border-radius:50%;transition:.2s; }
    .vital-toggle input:checked + .vital-toggle-track { background:var(--aqua-mint);border-color:var(--aqua-mint); }
    .vital-toggle input:checked + .vital-toggle-track::after { left:16px; }
</style>
@endpush

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
        transition: background 0.15s;
        font-size: 13px;
    }
    .config-item:last-child { border-bottom: none; }
    .config-item:hover { background: var(--color-muted); }
    .config-item.inactive { opacity: 0.45; }
    .item-name { flex: 1; }
    .edit-input { font-size: 13px; border: 1px solid var(--aqua-mint); border-radius: 4px; padding: 2px 6px; width: 100%; }
    .item-actions { display: flex; gap: 4px; }
    .item-actions button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 3px 5px;
        border-radius: 4px;
        color: var(--color-muted-foreground);
        display: flex;
        align-items: center;
        transition: background 0.15s, color 0.15s;
    }
    .item-actions button:hover { background: var(--color-border); color: var(--color-foreground); }
    .btn-delete:hover { color: var(--color-destructive) !important; }
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
</style>
@endpush

@push('scripts')
<script src="{{ asset('js/ipd-config.js') }}?v={{ filemtime(public_path('js/ipd-config.js')) }}"></script>
@endpush
