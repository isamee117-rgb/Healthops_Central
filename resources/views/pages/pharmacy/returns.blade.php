@extends('layouts.app')

@section('content')
<div class="page-header-row" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="rotate-ccw" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Returns & Expiry Management</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Manage returns, expired stock, and disposal tracking</p>
        </div>
    </div>
    <button class="btn btn-sm" onclick="ReturnsApp.refresh()" style="border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);font-size:13px;padding:6px 14px;border-radius:6px">
        <i data-lucide="refresh-cw" style="width:14px;height:14px;margin-right:4px"></i> Refresh
    </button>
</div>

<div class="row g-3 mb-4" id="dashStats">
    <div class="col-md-2">
        <div style="background:#fff;border-radius:10px;padding:14px;border:1px solid var(--color-border)">
            <p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Patient Returns</p>
            <h4 id="statPatientReturns" style="font-size:22px;font-weight:700;color:#e67e22;margin:4px 0 0;font-family:'Roobert',sans-serif">0</h4>
            <span id="statPatientPending" style="font-size:11px;color:var(--color-muted-foreground)">0 pending</span>
        </div>
    </div>
    <div class="col-md-2">
        <div style="background:#fff;border-radius:10px;padding:14px;border:1px solid var(--color-border)">
            <p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Ward Returns</p>
            <h4 id="statWardReturns" style="font-size:22px;font-weight:700;color:#3498db;margin:4px 0 0;font-family:'Roobert',sans-serif">0</h4>
            <span id="statWardPending" style="font-size:11px;color:var(--color-muted-foreground)">0 pending</span>
        </div>
    </div>
    <div class="col-md-2">
        <div style="background:#fff;border-radius:10px;padding:14px;border:1px solid var(--color-border)">
            <p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Supplier RTV</p>
            <h4 id="statSupplierReturns" style="font-size:22px;font-weight:700;color:#8e44ad;margin:4px 0 0;font-family:'Roobert',sans-serif">0</h4>
            <span id="statSupplierPending" style="font-size:11px;color:var(--color-muted-foreground)">0 pending</span>
        </div>
    </div>
    <div class="col-md-2">
        <div style="background:#fff;border-radius:10px;padding:14px;border:1px solid var(--color-border)">
            <p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Expired Stock</p>
            <h4 id="statExpired" style="font-size:22px;font-weight:700;color:#e74c3c;margin:4px 0 0;font-family:'Roobert',sans-serif">0</h4>
            <span id="statExpiredLoss" style="font-size:11px;color:#e74c3c">PKR 0 loss</span>
        </div>
    </div>
    <div class="col-md-2">
        <div style="background:#fff;border-radius:10px;padding:14px;border:1px solid var(--color-border)">
            <p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Near Expiry</p>
            <h4 id="statNearExpiry" style="font-size:22px;font-weight:700;color:#f39c12;margin:4px 0 0;font-family:'Roobert',sans-serif">0</h4>
            <span style="font-size:11px;color:var(--color-muted-foreground)">within 6 months</span>
        </div>
    </div>
    <div class="col-md-2">
        <div style="background:#fff;border-radius:10px;padding:14px;border:1px solid var(--color-border)">
            <p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Total Refunds</p>
            <h4 id="statRefunds" style="font-size:22px;font-weight:700;color:#27ae60;margin:4px 0 0;font-family:'Roobert',sans-serif">0</h4>
            <span style="font-size:11px;color:var(--color-muted-foreground)">approved</span>
        </div>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
    <ul class="nav nav-tabs" style="padding:0 20px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tabPatient" style="font-size:13px;font-weight:500;padding:12px 16px;border:none;color:var(--color-foreground)"><i data-lucide="user" style="width:14px;height:14px;margin-right:4px"></i> Patient Returns</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabWard" style="font-size:13px;font-weight:500;padding:12px 16px;border:none;color:var(--color-muted-foreground)"><i data-lucide="building" style="width:14px;height:14px;margin-right:4px"></i> Ward Returns</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabSupplier" style="font-size:13px;font-weight:500;padding:12px 16px;border:none;color:var(--color-muted-foreground)"><i data-lucide="truck" style="width:14px;height:14px;margin-right:4px"></i> Supplier RTV</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabExpired" style="font-size:13px;font-weight:500;padding:12px 16px;border:none;color:var(--color-muted-foreground)"><i data-lucide="alert-octagon" style="width:14px;height:14px;margin-right:4px"></i> Expired Stock</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabNearExpiry" style="font-size:13px;font-weight:500;padding:12px 16px;border:none;color:var(--color-muted-foreground)"><i data-lucide="clock" style="width:14px;height:14px;margin-right:4px"></i> Near-Expiry</a></li>
    </ul>

    <div class="tab-content">
        <div class="tab-pane fade show active" id="tabPatient">
            <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between">
                <h6 style="font-size:14px;font-weight:600;margin:0;font-family:'Roobert',sans-serif">Patient Returns</h6>
                <div style="display:flex;gap:8px">
                    <select id="filterPatientStatus" class="form-select form-select-sm" style="width:130px;font-size:12px;border-radius:6px" onchange="ReturnsApp.loadPatientReturns()">
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <input type="text" id="searchPatientReturns" class="form-control form-control-sm" placeholder="Search..." style="width:160px;font-size:12px;border-radius:6px" oninput="ReturnsApp.loadPatientReturns()">
                    <button class="btn btn-sm" onclick="ReturnsApp.showNewPatientReturn()" style="background:var(--aquamint);color:#003366;font-size:12px;padding:5px 12px;border-radius:6px;border:none;font-weight:600">
                        <i data-lucide="plus" style="width:12px;height:12px;margin-right:3px"></i> New Return
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0" style="font-size:13px">
                    <thead><tr style="background:var(--color-background)">
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Return ID</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Date</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Patient</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Order ID</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Medicine</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Qty</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Reason</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Condition</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Refund</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Status</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Action</th>
                    </tr></thead>
                    <tbody id="patientReturnsBody"><tr><td colspan="11" style="text-align:center;padding:30px;color:var(--color-muted-foreground)">Loading...</td></tr></tbody>
                </table>
            </div>
        </div>

        <div class="tab-pane fade" id="tabWard">
            <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between">
                <h6 style="font-size:14px;font-weight:600;margin:0;font-family:'Roobert',sans-serif">Ward / Department Returns</h6>
                <select id="filterWardStatus" class="form-select form-select-sm" style="width:130px;font-size:12px;border-radius:6px" onchange="ReturnsApp.loadWardReturns()">
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                    <option value="Processed">Processed</option>
                </select>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0" style="font-size:13px">
                    <thead><tr style="background:var(--color-background)">
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Ward/Dept</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Return Date</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Return ID</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Medicines</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Total Value</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Status</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Action</th>
                    </tr></thead>
                    <tbody id="wardReturnsBody"><tr><td colspan="7" style="text-align:center;padding:30px;color:var(--color-muted-foreground)">Loading...</td></tr></tbody>
                </table>
            </div>
        </div>

        <div class="tab-pane fade" id="tabSupplier">
            <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between">
                <h6 style="font-size:14px;font-weight:600;margin:0;font-family:'Roobert',sans-serif">Supplier Returns (RTV)</h6>
                <div style="display:flex;gap:8px">
                    <select id="filterRtvStatus" class="form-select form-select-sm" style="width:140px;font-size:12px;border-radius:6px" onchange="ReturnsApp.loadSupplierReturns()">
                        <option value="">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Initiated">Initiated</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Credit Received">Credit Received</option>
                    </select>
                    <button class="btn btn-sm" onclick="ReturnsApp.showNewRtv()" style="background:var(--aquamint);color:#003366;font-size:12px;padding:5px 12px;border-radius:6px;border:none;font-weight:600">
                        <i data-lucide="plus" style="width:12px;height:12px;margin-right:3px"></i> Create RTV
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0" style="font-size:13px">
                    <thead><tr style="background:var(--color-background)">
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">RTV ID</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Supplier</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">PO Ref</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Return Date</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Items</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Reason</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Credit</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Status</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Action</th>
                    </tr></thead>
                    <tbody id="supplierReturnsBody"><tr><td colspan="9" style="text-align:center;padding:30px;color:var(--color-muted-foreground)">Loading...</td></tr></tbody>
                </table>
            </div>
        </div>

        <div class="tab-pane fade" id="tabExpired">
            <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between">
                <h6 style="font-size:14px;font-weight:600;margin:0;font-family:'Roobert',sans-serif">Expired Stock</h6>
                <button class="btn btn-sm" onclick="ReturnsApp.showDisposalForm()" style="background:#e74c3c;color:#fff;font-size:12px;padding:5px 12px;border-radius:6px;border:none;font-weight:600">
                    <i data-lucide="trash-2" style="width:12px;height:12px;margin-right:3px"></i> Dispose Selected
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0" style="font-size:13px">
                    <thead><tr style="background:var(--color-background)">
                        <th style="padding:10px 16px;width:30px"><input type="checkbox" class="form-check-input" onchange="ReturnsApp.toggleAllExpired(this.checked)" style="width:15px;height:15px"></th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Medicine</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Batch</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Expiry Date</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Days Expired</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Qty</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Purchase Value</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Loss</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Action</th>
                    </tr></thead>
                    <tbody id="expiredStockBody"><tr><td colspan="9" style="text-align:center;padding:30px;color:var(--color-muted-foreground)">Loading...</td></tr></tbody>
                    <tfoot id="expiredStockFoot" style="display:none">
                        <tr style="background:var(--color-background);font-weight:600">
                            <td colspan="5" style="padding:10px 16px">Total Expired</td>
                            <td style="padding:10px 16px" id="expiredTotalQty">0</td>
                            <td style="padding:10px 16px;color:#e74c3c" id="expiredTotalValue">PKR 0</td>
                            <td style="padding:10px 16px;color:#e74c3c">Loss</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <div class="tab-pane fade" id="tabNearExpiry">
            <div style="padding:16px 20px;border-bottom:1px solid var(--color-border)">
                <h6 style="font-size:14px;font-weight:600;margin:0;font-family:'Roobert',sans-serif">Near-Expiry Management (3-6 months)</h6>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0" style="font-size:13px">
                    <thead><tr style="background:var(--color-background)">
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Medicine</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Batch</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Expiry</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Days Left</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Stock</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Est. Usage</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Recommendation</th>
                        <th style="padding:10px 16px;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Action</th>
                    </tr></thead>
                    <tbody id="nearExpiryBody"><tr><td colspan="8" style="text-align:center;padding:30px;color:var(--color-muted-foreground)">Loading...</td></tr></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="processReturnPanel" style="width:550px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 24px">
        <h5 style="font-size:16px;font-weight:600;margin:0;font-family:'Roobert',sans-serif" id="processTitle">Process Return</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:20px" id="processBody"></div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="newReturnPanel" style="width:500px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 24px">
        <h5 style="font-size:16px;font-weight:600;margin:0;font-family:'Roobert',sans-serif" id="newReturnTitle">New Patient Return</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:20px" id="newReturnBody"></div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="rtvPanel" style="width:600px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 24px">
        <h5 style="font-size:16px;font-weight:600;margin:0;font-family:'Roobert',sans-serif">Create Return to Vendor (RTV)</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:20px" id="rtvBody"></div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="disposalPanel" style="width:600px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 24px">
        <h5 style="font-size:16px;font-weight:600;margin:0;font-family:'Roobert',sans-serif">Expired Stock Disposal</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:20px" id="disposalBody"></div>
</div>

<style>
.nav-tabs .nav-link.active { color: var(--aquamint) !important; border-bottom: 2px solid var(--aquamint) !important; background: transparent !important; }
.nav-tabs .nav-link:hover { color: var(--color-foreground) !important; }
.return-field { margin-bottom: 14px; }
.return-field label { font-size: 12px; font-weight: 600; color: var(--color-muted-foreground); display: block; margin-bottom: 4px; }
.return-field .value { font-size: 14px; font-weight: 500; }
.condition-option { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 6px; cursor: pointer; margin-bottom: 6px; font-size: 13px; }
.condition-option.selected { border-color: var(--aquamint); background: rgba(127,255,212,0.08); }
.condition-option input { width: 16px; height: 16px; }
</style>
@endsection

@push('scripts')
<script src="{{ asset('js/pharmacy-returns.js') }}?v={{ filemtime(public_path('js/pharmacy-returns.js')) }}"></script>
@endpush
