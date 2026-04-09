@extends('layouts.app')
@section('content')
<div class="module-page">
    <div class="module-header">
        <div>
            <h1><i data-lucide="pill"></i> Pharmacy Configuration</h1>
            <p class="module-subtitle">Manage configurable dropdown lists used in OPD prescription writing</p>
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
