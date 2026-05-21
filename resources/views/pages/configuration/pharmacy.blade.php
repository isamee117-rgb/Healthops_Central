@extends('layouts.app')
@section('content')
<div class="module-page">
    <div class="module-header">
        <div>
            <h1><i data-lucide="pill"></i> Pharmacy Configuration</h1>
            <p class="module-subtitle">Manage configurable dropdown lists used in OPD prescription writing</p>
        </div>
    </div>

    <div class="section-label">Department Order Routing</div>
    <p class="section-desc">Control which departments can send medication orders to the Pharmacy queue. When a department is blocked, its orders will not appear on the Medication Orders page.</p>

    <div class="card mb-4" style="max-width:520px">
        <div class="card-header d-flex align-items-center gap-2" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
            <i data-lucide="git-branch" style="width:16px;height:16px"></i>
            <h6 class="mb-0" style="font-size:14px;font-weight:600">Departments</h6>
        </div>
        <div class="card-body p-0" id="deptRoutingBody">
            <div style="padding:20px;text-align:center;color:var(--color-muted-foreground);font-size:13px">Loading...</div>
        </div>
    </div>

    <div class="section-label">Prescription Dropdowns</div>
    <p class="section-desc">Add, edit, activate or remove the options that appear in the Unit, Route and Frequency selects when writing a prescription in OPD.</p>

    <div class="row g-3" id="pharmConfigContainer">

        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="rx_unit">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="scale" style="width:16px;height:16px;margin-right:6px"></i>Units</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new unit (e.g. mcg)..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:420px;overflow-y:auto"></div>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="rx_route">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="route" style="width:16px;height:16px;margin-right:6px"></i>Routes</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new route (e.g. Sublingual)..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:420px;overflow-y:auto"></div>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="rx_frequency">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="clock" style="width:16px;height:16px;margin-right:6px"></i>Frequencies</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new frequency (e.g. Q8H)..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:420px;overflow-y:auto"></div>
                </div>
            </div>
        </div>

    </div>

    <div class="section-label mt-4">Note</div>
    <p class="section-desc">Inactive items are hidden from the prescription form but are preserved here for reference. Changes take effect immediately in new OPD consultations.</p>

    {{-- ── Bulk Inventory Import ─────────────────────────────────────────────── --}}
    <div class="section-label mt-4" style="display:flex;align-items:center;gap:10px">
        Bulk Inventory Import
    </div>
    <p class="section-desc">Upload medicines aur unke initial batches ek hi Excel/CSV file mein. Validation fail hone par kuch bhi save nahi hoga.</p>

    {{-- Hidden file input --}}
    <input type="file" id="bulkFileInput" accept=".xlsx,.csv" style="display:none">

    <div class="bulk-import-card" id="bulkImportCard">
        {{-- Header --}}
        <div class="bulk-import-header" id="bulkImportHeader">
            <div class="bulk-import-header-title">
                <i data-lucide="package" style="width:16px;height:16px"></i>
                Import Inventory
                <span class="bulk-import-header-pill">All-or-nothing</span>
            </div>
            <span class="bulk-import-header-step" id="bulkStepLabel">Step 1 of 3</span>
        </div>

        {{-- Body --}}
        <div class="bulk-import-body">

            {{-- Step indicator --}}
            <div class="bulk-steps">
                <div class="bulk-step active" id="bsStep1">
                    <div class="bulk-step-circle">1</div> Upload
                </div>
                <div class="bulk-step-line"></div>
                <div class="bulk-step" id="bsStep2">
                    <div class="bulk-step-circle">2</div> Validate
                </div>
                <div class="bulk-step-line"></div>
                <div class="bulk-step" id="bsStep3">
                    <div class="bulk-step-circle">3</div> Import
                </div>
            </div>

            {{-- IDLE state --}}
            <div id="bulkStateIdle">
                <div class="bulk-drop-zone" id="bulkDropZone">
                    <div class="bulk-drop-zone-icon">
                        <i data-lucide="folder-open" style="width:36px;height:36px;color:#9ca3af"></i>
                    </div>
                    <div class="bulk-drop-title">File yahan drag &amp; drop karen</div>
                    <div class="bulk-drop-sub">ya neeche click kar ke browse karen</div>
                    <div class="bulk-fmt-badges">
                        <span class="bulk-fmt-badge">.xlsx</span>
                        <span class="bulk-fmt-badge">.csv</span>
                    </div><br>
                    <button class="bulk-browse-btn" id="bulkBrowseBtn">
                        <i data-lucide="folder" style="width:14px;height:14px"></i>
                        Browse File
                    </button>
                </div>

                <div class="bulk-action-row" style="margin-top:12px">
                    <a class="bulk-template-btn" id="bulkTemplateXlsx" href="/api/pharmacy-bulk-import/template" target="_blank">
                        <i data-lucide="download" style="width:14px;height:14px"></i>
                        Template Download (Excel)
                    </a>
                    <a class="bulk-template-btn" id="bulkTemplateCsv" href="/api/pharmacy-bulk-import/template?format=csv" target="_blank">
                        <i data-lucide="download" style="width:14px;height:14px"></i>
                        Template Download (CSV)
                    </a>
                    <span class="bulk-info-note">Max 5 MB &bull; Max 500 rows</span>
                </div>

                {{-- Column reference (collapsible) --}}
                <button class="bulk-col-ref-toggle" id="bulkColRefToggle">
                    <i data-lucide="info" style="width:13px;height:13px"></i>
                    Column reference daikhen
                </button>
                <div class="bulk-col-ref-body" id="bulkColRefBody">
                    <table class="bulk-col-ref-table">
                        <thead><tr><th>Column</th><th>Type</th><th>Required?</th><th>Example</th></tr></thead>
                        <tbody>
                            <tr><td>medicine_code</td><td>text</td><td><span class="bulk-badge-req">Required</span></td><td>MED-001</td></tr>
                            <tr><td>generic_name</td><td>text</td><td><span class="bulk-badge-req">Required</span></td><td>Paracetamol</td></tr>
                            <tr><td>brand_name</td><td>text</td><td><span class="bulk-badge-req">Required</span></td><td>Panadol</td></tr>
                            <tr><td>form</td><td>text</td><td><span class="bulk-badge-req">Required</span></td><td>Tablet</td></tr>
                            <tr><td>category</td><td>text</td><td><span class="bulk-badge-req">Required</span></td><td>Analgesic</td></tr>
                            <tr><td>manufacturer</td><td>text</td><td><span class="bulk-badge-req">Required</span></td><td>GSK</td></tr>
                            <tr><td>purchase_price</td><td>number</td><td><span class="bulk-badge-req">Required</span></td><td>45.00</td></tr>
                            <tr><td>selling_price</td><td>number</td><td><span class="bulk-badge-req">Required</span></td><td>60.00</td></tr>
                            <tr><td>strength</td><td>text</td><td><span class="bulk-badge-opt">Optional</span></td><td>500mg</td></tr>
                            <tr><td>stock_unit</td><td>text</td><td><span class="bulk-badge-opt">Optional</span></td><td>strips</td></tr>
                            <tr><td>min_stock / max_stock</td><td>integer</td><td><span class="bulk-badge-opt">Optional</span></td><td>50 / 500</td></tr>
                            <tr><td>batch_number</td><td>text</td><td><span class="bulk-badge-opt">Optional*</span></td><td>BT-001</td></tr>
                            <tr><td>batch_expiry</td><td>YYYY-MM-DD</td><td><span class="bulk-badge-opt">Optional*</span></td><td>2026-12-31</td></tr>
                            <tr><td>batch_qty</td><td>integer</td><td><span class="bulk-badge-opt">Optional*</span></td><td>200</td></tr>
                            <tr><td>batch_unit_price</td><td>number</td><td><span class="bulk-badge-opt">Optional</span></td><td>45.00</td></tr>
                            <tr><td>batch_supplier</td><td>text</td><td><span class="bulk-badge-opt">Optional</span></td><td>GSK Pharma</td></tr>
                            <tr><td>batch_received_date</td><td>YYYY-MM-DD</td><td><span class="bulk-badge-opt">Optional</span></td><td>2026-05-20</td></tr>
                        </tbody>
                    </table>
                    <div style="padding:8px 12px;font-size:11.5px;color:var(--color-muted-foreground);border-top:1px solid var(--color-border)">
                        * batch_number, batch_expiry, aur batch_qty teenon saath dene honge — partial fill error hai.
                    </div>
                </div>
            </div>

            {{-- FILE SELECTED state --}}
            <div id="bulkStateFileSelected" style="display:none">
                <div class="bulk-file-bar">
                    <div class="bulk-file-name">
                        <i data-lucide="file-spreadsheet" style="width:15px;height:15px;color:#060740"></i>
                        <span id="bulkSelectedFileName">-</span>
                        <span class="bulk-file-meta" id="bulkSelectedFileMeta"></span>
                    </div>
                    <button class="bulk-reupload-btn" id="bulkReuploadBtnSelected">
                        <i data-lucide="rotate-ccw" style="width:11px;height:11px"></i> Re-upload
                    </button>
                </div>
                <div class="bulk-action-row">
                    <span class="bulk-info-note">File ready hai — validate karne ke liye click karen.</span>
                    <button class="bulk-validate-btn" id="bulkValidateBtn">
                        <i data-lucide="shield-check" style="width:14px;height:14px"></i>
                        Validate File
                    </button>
                </div>
            </div>

            {{-- VALIDATING state (spinner) --}}
            <div id="bulkStateValidating" style="display:none;text-align:center;padding:28px 0">
                <div class="spinner-border text-primary" style="width:28px;height:28px" role="status"></div>
                <div style="margin-top:12px;font-size:13px;color:var(--color-muted-foreground)">File validate ho rahi hai...</div>
            </div>

            {{-- VALIDATION FAILED state --}}
            <div id="bulkStateError" style="display:none">
                <div class="bulk-file-bar">
                    <div class="bulk-file-name">
                        <i data-lucide="file-spreadsheet" style="width:15px;height:15px;color:#b91c1c"></i>
                        <span id="bulkErrorFileName">-</span>
                    </div>
                    <button class="bulk-reupload-btn" id="bulkReuploadBtnError">
                        <i data-lucide="rotate-ccw" style="width:11px;height:11px"></i> Re-upload
                    </button>
                </div>
                <div class="bulk-error-banner">
                    <i data-lucide="x-circle" style="width:20px;height:20px;color:#b91c1c;flex-shrink:0;margin-top:1px"></i>
                    <div>
                        <h6 id="bulkErrorBannerTitle">Errors found</h6>
                        <p>Koi bhi row save nahi hua. Neeche diye errors fix karen aur dobara upload karen.</p>
                    </div>
                </div>
                <div class="bulk-err-table-wrap">
                    <table class="bulk-err-table">
                        <thead><tr><th>Row #</th><th>Column</th><th>Error</th></tr></thead>
                        <tbody id="bulkErrorTableBody"></tbody>
                    </table>
                </div>
                <div class="bulk-action-row">
                    <span></span>
                    <button class="bulk-validate-btn" style="background:#b91c1c" id="bulkFixReuploadBtn">
                        <i data-lucide="rotate-ccw" style="width:14px;height:14px"></i>
                        Fix &amp; Re-upload
                    </button>
                </div>
            </div>

            {{-- CONFIRM state --}}
            <div id="bulkStateConfirm" style="display:none">
                <div class="bulk-file-bar">
                    <div class="bulk-file-name">
                        <i data-lucide="file-spreadsheet" style="width:15px;height:15px;color:#047857"></i>
                        <span id="bulkConfirmFileName">-</span>
                    </div>
                    <button class="bulk-reupload-btn" id="bulkReuploadBtnConfirm">
                        <i data-lucide="rotate-ccw" style="width:11px;height:11px"></i> Re-upload
                    </button>
                </div>
                <div class="bulk-success-banner">
                    <i data-lucide="check-circle" style="width:20px;height:20px;color:#047857;flex-shrink:0;margin-top:1px"></i>
                    <div>
                        <h6>Validation passed — import ke liye ready</h6>
                        <p>Sab rows valid hain. Summary check karen aur Confirm Import click karen.</p>
                    </div>
                </div>
                <div class="bulk-summary-grid">
                    <div class="bulk-summary-card">
                        <div class="bulk-summary-number" id="bsSumMedicines">0</div>
                        <div class="bulk-summary-label">Medicines</div>
                    </div>
                    <div class="bulk-summary-card">
                        <div class="bulk-summary-number" id="bsSumWithBatch">0</div>
                        <div class="bulk-summary-label">Batch ke saath</div>
                    </div>
                    <div class="bulk-summary-card">
                        <div class="bulk-summary-number" id="bsSumNoBatch">0</div>
                        <div class="bulk-summary-label">Batch ke bagair</div>
                    </div>
                </div>
                <div class="bulk-preview-wrap">
                    <table class="bulk-preview-table">
                        <thead><tr><th>Code</th><th>Generic Name</th><th>Form</th><th>Category</th><th>Batch?</th></tr></thead>
                        <tbody id="bulkPreviewTableBody"></tbody>
                    </table>
                </div>
                <div class="bulk-action-row">
                    <button class="bulk-cancel-btn" id="bulkCancelConfirmBtn">Cancel</button>
                    <button class="bulk-confirm-btn" id="bulkConfirmImportBtn">
                        <i data-lucide="upload" style="width:14px;height:14px"></i>
                        <span id="bulkConfirmBtnText">Confirm Import</span>
                    </button>
                </div>
            </div>

            {{-- IMPORTING state (spinner) --}}
            <div id="bulkStateImporting" style="display:none;text-align:center;padding:28px 0">
                <div class="spinner-border" style="width:28px;height:28px;color:#047857" role="status"></div>
                <div style="margin-top:12px;font-size:13px;color:var(--color-muted-foreground)">Import ho raha hai — please wait...</div>
            </div>

        </div>{{-- /bulk-import-body --}}
    </div>{{-- /bulk-import-card --}}

</div>
@endsection

@push('styles')
<style>
    .dept-routing-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        border-bottom: 1px solid var(--color-border);
        font-size: 13px;
    }
    .dept-routing-row:last-child { border-bottom: none; }
    .dept-routing-row .dept-label {
        flex: 1;
        font-weight: 600;
        color: var(--color-foreground);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .dept-status {
        font-size: 12px;
        font-weight: 500;
        min-width: 110px;
        text-align: right;
    }
    .dept-status.on  { color: #16A34A; }
    .dept-status.off { color: #DC2626; }
    .dept-toggle-wrap { position: relative; display: inline-flex; align-items: center; }
    .dept-toggle-wrap input[type="checkbox"] { opacity: 0; width: 0; height: 0; position: absolute; }
    .toggle-slider {
        display: block;
        width: 42px;
        height: 24px;
        border-radius: 12px;
        background: #D1D5DB;
        cursor: pointer;
        transition: background 0.2s;
        position: relative;
    }
    .toggle-slider::after {
        content: '';
        position: absolute;
        top: 3px; left: 3px;
        width: 18px; height: 18px;
        border-radius: 50%;
        background: #fff;
        transition: left 0.2s;
        box-shadow: 0 1px 3px rgba(0,0,0,.2);
    }
    .dept-toggle-wrap input:checked + .toggle-slider { background: #16A34A; }
    .dept-toggle-wrap input:checked + .toggle-slider::after { left: 21px; }
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
    .config-item:last-child { border-bottom: none; }
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
</style>
@endpush

@push('scripts')
<script src="{{ asset('js/pharmacy-config.js') }}?v={{ filemtime(public_path('js/pharmacy-config.js')) }}"></script>
@endpush
