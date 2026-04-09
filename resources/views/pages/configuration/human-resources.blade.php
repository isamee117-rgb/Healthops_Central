@extends('layouts.app')
@section('content')
<div class="module-page">
    <div class="module-header">
        <div>
            <h1><i data-lucide="settings-2"></i> Human Resources Configuration</h1>
            <p class="module-subtitle">Manage configurable dropdown lists and number series for Doctor and Staff modules</p>
        </div>
    </div>

    <div class="section-label">Dropdown Lists</div>

    <div class="row g-3" id="hrConfigContainer">
        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="specialization">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="stethoscope" style="width:16px;height:16px;margin-right:6px"></i>Primary Specialization</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new specialization..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:320px;overflow-y:auto"></div>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="department">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="building-2" style="width:16px;height:16px;margin-right:6px"></i>Primary Department</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new department..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:320px;overflow-y:auto"></div>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="designation">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="award" style="width:16px;height:16px;margin-right:6px"></i>Designation</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new designation..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:320px;overflow-y:auto"></div>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="employment_type">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="briefcase" style="width:16px;height:16px;margin-right:6px"></i>Employment Type</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new employment type..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:320px;overflow-y:auto"></div>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-xl-4">
            <div class="card h-100" data-category="sub_specialization">
                <div class="card-header d-flex justify-content-between align-items-center" style="background:var(--midnight-blue);color:#fff;padding:12px 16px">
                    <h6 class="mb-0" style="font-size:14px;font-weight:600"><i data-lucide="git-branch" style="width:16px;height:16px;margin-right:6px"></i>Sub-specialization</h6>
                    <span class="badge bg-light text-dark item-count">0</span>
                </div>
                <div class="card-body p-0">
                    <div class="config-add-bar">
                        <input type="text" class="form-control form-control-sm config-new-input" placeholder="Add new sub-specialization..." style="font-size:13px">
                        <button class="btn btn-sm btn-add-item" title="Add"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
                    </div>
                    <div class="config-list" style="max-height:320px;overflow-y:auto"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="section-label mt-4">Number Series</div>
    <p class="section-desc">Configure how system-generated IDs are formatted when a new Doctor record is created.</p>

    <div class="row g-3" id="numberSeriesContainer">
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
        border: 1px solid var(--color-border);
        border-radius: 10px;
        overflow: hidden;
        background: var(--color-card);
    }
    .series-card .series-header {
        background: var(--midnight-blue);
        color: #fff;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .series-card .series-header h6 { margin: 0; font-size: 14px; font-weight: 600; }
    .series-body { padding: 16px; }
    .series-body .form-label { font-size: 12px; font-weight: 600; color: var(--color-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .series-body .form-control { font-size: 13px; }
    .series-preview {
        background: var(--color-muted);
        border: 1px dashed var(--aqua-mint);
        border-radius: 6px;
        padding: 8px 14px;
        font-size: 14px;
        font-weight: 700;
        color: var(--midnight-blue);
        letter-spacing: 0.05em;
        display: inline-block;
        min-width: 120px;
    }
    .btn-save-series {
        background: var(--aqua-mint);
        color: var(--midnight-blue);
        border: none;
        font-weight: 600;
        font-size: 13px;
        padding: 6px 18px;
        border-radius: 6px;
    }
    .btn-save-series:hover { background: #6EEFC4; }
</style>
@endpush

@push('scripts')
<script src="{{ asset('js/hr-config.js') }}?v={{ filemtime(public_path('js/hr-config.js')) }}"></script>
@endpush
