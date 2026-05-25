@extends('layouts.app')

@section('content')
<style>
.opd-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.opd-search-wrap{position:relative;flex:1;min-width:200px}
.opd-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--color-muted-foreground);pointer-events:none}
.opd-search-input{width:100%;height:40px;padding:0 14px 0 40px;border:1px solid var(--color-border);border-radius:10px;background:#fff!important;font-size:13.5px;color:var(--color-foreground);outline:none;transition:border-color .15s,box-shadow .15s}
.opd-search-input::placeholder{color:var(--color-muted-foreground)}
.opd-search-input:focus{border-color:#060740;box-shadow:0 0 0 3px rgba(6,7,64,.08)}
.opd-toolbar-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.opd-tool-btn{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 16px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-card);font-size:13.5px;font-weight:600;color:var(--color-foreground);cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,box-shadow .15s}
.opd-tool-btn svg,.opd-tool-btn i{width:15px;height:15px;color:var(--color-muted-foreground)}
.opd-tool-btn:hover{background:var(--color-muted);border-color:#060740;box-shadow:0 2px 6px rgba(6,7,64,.08)}
.opd-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-top:1px solid var(--color-border);flex-wrap:wrap;gap:10px}
.opd-pagination-left{flex:1}
.opd-page-info{font-size:12.5px;color:var(--color-muted-foreground);font-weight:500}
.opd-page-btns{display:flex;align-items:center;gap:4px}
.opd-page-btn{width:34px;height:34px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;color:var(--color-foreground)}
.opd-page-btn svg{width:15px;height:15px}
.opd-page-btn:hover:not(:disabled){background:var(--color-muted);border-color:#060740}
.opd-page-btn:disabled{opacity:.4;cursor:not-allowed}
.opd-page-nums{display:flex;align-items:center;gap:4px}
.opd-page-num{min-width:34px;height:34px;padding:0 8px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);font-size:13px;font-weight:600;color:var(--color-foreground);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.opd-page-num:hover{background:var(--color-muted)}
.opd-page-num.active{background:#060740;color:#7FFFD4;border-color:#060740}
.return-field{margin-bottom:14px}
.return-field label{display:block;font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em}
</style>

<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="truck" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Vendors</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Manage supplier / vendor master data</p>
        </div>
    </div>
    <button class="opd-tool-btn" style="background:var(--aquamint);color:#003366;border-color:var(--aquamint)" onclick="VendorsApp.showForm()">
        <i data-lucide="plus" style="width:15px;height:15px;color:#003366"></i> Add Vendor
    </button>
</div>

{{-- Stat cards --}}
<div class="row g-3 mb-4">
    <div class="col-md-3">
        <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:18px 20px">
            <p style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin:0 0 6px;text-transform:uppercase;letter-spacing:.04em">Total Vendors</p>
            <p style="font-size:28px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif" id="statTotal">—</p>
        </div>
    </div>
    <div class="col-md-3">
        <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:18px 20px">
            <p style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin:0 0 6px;text-transform:uppercase;letter-spacing:.04em">Active</p>
            <p style="font-size:28px;font-weight:700;color:#27ae60;margin:0;font-family:'Roobert',sans-serif" id="statActive">—</p>
        </div>
    </div>
    <div class="col-md-3">
        <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:18px 20px">
            <p style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin:0 0 6px;text-transform:uppercase;letter-spacing:.04em">Inactive</p>
            <p style="font-size:28px;font-weight:700;color:#e74c3c;margin:0;font-family:'Roobert',sans-serif" id="statInactive">—</p>
        </div>
    </div>
    <div class="col-md-3">
        <div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:18px 20px">
            <p style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin:0 0 6px;text-transform:uppercase;letter-spacing:.04em">With POs</p>
            <p style="font-size:28px;font-weight:700;color:var(--aquamint);margin:0;font-family:'Roobert',sans-serif" id="statWithPo">—</p>
        </div>
    </div>
</div>

{{-- Table card --}}
<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;overflow:hidden">
    <div style="padding:14px 16px;border-bottom:1px solid var(--color-border)">
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="vendorSearch" placeholder="Search by name, contact, phone, email...">
            </div>
            <div class="opd-toolbar-right">
                <select class="opd-search-input" id="filterStatus" style="width:140px;padding-left:12px">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>
    </div>

    <div style="overflow-x:auto">
        <div id="vendorLoading" style="padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:13px">
            <i data-lucide="loader-2" style="width:20px;height:20px;margin-right:8px"></i> Loading...
        </div>
        <div class="is-hidden" id="vendorEmpty" style="padding:60px;text-align:center">
            <i data-lucide="truck" style="width:40px;height:40px;color:var(--color-muted-foreground);margin-bottom:12px"></i>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:0">No vendors found.</p>
        </div>
        <table class="data-table" id="tblVendors" style="display:none">
            <thead>
                <tr>
                    <th>Vendor ID</th>
                    <th>Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Payment Terms</th>
                    <th>Lead Time</th>
                    <th>POs</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="vendorTbody"></tbody>
        </table>
    </div>

    <div id="vendorPagination" class="opd-pagination" style="display:none">
        <div class="opd-pagination-left">
            <span class="opd-page-info" id="vendorPageInfo"></span>
        </div>
        <div class="opd-page-btns">
            <button class="opd-page-btn" id="vendorPrevPage" disabled onclick="VendorsApp.goToPage(VendorsApp.page-1)"><i data-lucide="chevron-left"></i></button>
            <div class="opd-page-nums" id="vendorPageNums"></div>
            <button class="opd-page-btn" id="vendorNextPage" onclick="VendorsApp.goToPage(VendorsApp.page+1)"><i data-lucide="chevron-right"></i></button>
        </div>
    </div>
</div>

{{-- Offcanvas: Add / Edit Vendor --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="vendorPanel" style="width:520px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 24px">
        <h5 style="font-size:16px;font-weight:600;margin:0;font-family:'Roobert',sans-serif" id="vendorPanelTitle">Add Vendor</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px">
        <input type="hidden" id="vendorId">
        <div class="return-field">
            <label>Vendor Name <span style="color:#e74c3c">*</span></label>
            <input type="text" class="form-control form-control-sm" id="vName" placeholder="e.g. MedPharma Distributors" style="border-radius:6px">
        </div>
        <div class="row">
            <div class="col-6 return-field">
                <label>Contact Person</label>
                <input type="text" class="form-control form-control-sm" id="vContact" placeholder="Full name" style="border-radius:6px">
            </div>
            <div class="col-6 return-field">
                <label>Phone</label>
                <input type="text" class="form-control form-control-sm" id="vPhone" placeholder="03xx-xxxxxxx" style="border-radius:6px">
            </div>
        </div>
        <div class="return-field">
            <label>Email</label>
            <input type="email" class="form-control form-control-sm" id="vEmail" placeholder="vendor@example.com" style="border-radius:6px">
        </div>
        <div class="return-field">
            <label>Address</label>
            <textarea class="form-control form-control-sm" id="vAddress" rows="2" placeholder="Full address..." style="border-radius:6px"></textarea>
        </div>
        <div class="row">
            <div class="col-6 return-field">
                <label>Payment Terms</label>
                <select class="form-select form-select-sm" id="vPaymentTerms" style="border-radius:6px">
                    <option value="Cash">Cash</option>
                    <option value="Credit 15 days">Credit 15 days</option>
                    <option value="Credit 30 days">Credit 30 days</option>
                    <option value="Credit 45 days">Credit 45 days</option>
                    <option value="Credit 60 days">Credit 60 days</option>
                </select>
            </div>
            <div class="col-6 return-field">
                <label>Lead Time (days)</label>
                <input type="number" class="form-control form-control-sm" id="vLeadTime" value="7" min="0" style="border-radius:6px">
            </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
            <button class="btn btn-sm" data-bs-dismiss="offcanvas" style="border:1px solid var(--color-border);font-size:13px;padding:6px 16px;border-radius:6px">Cancel</button>
            <button class="btn btn-sm" id="vendorSaveBtn" onclick="VendorsApp.save()" style="background:var(--aquamint);color:#003366;font-size:13px;font-weight:600;padding:6px 20px;border-radius:6px;border:none">Save Vendor</button>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script src="{{ asset('js/pharmacy-vendors.js') }}"></script>
@endpush
