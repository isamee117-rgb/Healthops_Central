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
.opd-tool-btn--icon{width:40px;padding:0;justify-content:center;gap:0}
.opd-tool-btn:hover{background:var(--color-muted);border-color:#060740;box-shadow:0 2px 6px rgba(6,7,64,.08)}
.opd-tool-btn.active,.opd-tool-btn.filter-active{background:rgba(6,7,64,.06);border-color:#060740}
.opd-filter-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:20px;background:#060740;color:#7FFFD4;font-size:10px;font-weight:800;line-height:1;margin-left:2px}
.opd-export-wrap{position:relative}
.opd-export-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:300;min-width:180px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px}
.opd-export-menu.open{display:block}
.opd-export-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:none;font-size:13.5px;font-weight:500;color:var(--color-foreground);cursor:pointer;border-radius:7px;text-align:left;transition:background .12s}
.opd-export-menu button:hover{background:var(--color-muted)}
.opd-export-menu button i{width:15px;height:15px;color:var(--color-muted-foreground);flex-shrink:0}
.opd-rows-wrap{position:relative}
.opd-rows-menu{display:none;position:absolute;left:0;top:calc(100% + 6px);z-index:300;min-width:140px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px}
.opd-rows-menu.open{display:block}
.opd-rows-head{padding:8px 10px 6px;font-size:11px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--color-border);margin-bottom:4px}
.opd-rows-menu button{display:flex;align-items:center;width:100%;padding:8px 10px;border:none;background:none;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer;border-radius:7px;text-align:left;transition:background .1s}
.opd-rows-menu button:hover,.opd-rows-menu button.active{background:var(--color-muted)}
.opd-col-vis-wrap{position:relative}
.opd-col-vis-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:300;width:200px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);overflow:hidden}
.opd-col-vis-menu.open{display:block}
.opd-col-vis-head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px 10px;border-bottom:1px solid var(--color-border);font-size:13px;font-weight:700;color:var(--color-foreground)}
.opd-col-vis-selall{font-size:11.5px;font-weight:500;color:#060740;background:none;border:none;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px}
.opd-col-vis-list{padding:8px 6px;max-height:240px;overflow-y:auto}
.opd-col-vis-list label{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:6px;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer;transition:background .1s}
.opd-col-vis-list label:hover{background:var(--color-muted)}
.opd-col-vis-list input[type="checkbox"]{width:15px;height:15px;accent-color:#060740;cursor:pointer;flex-shrink:0}
.opd-col-vis-foot{padding:10px 14px;border-top:1px solid var(--color-border);display:flex;justify-content:flex-end}
.opd-col-vis-save{height:32px;padding:0 18px;background:#060740;color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s}
.opd-col-vis-save:hover{opacity:.88}
.opd-filter-pane{background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;margin:0 16px 14px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.opd-filter-pane-head{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--color-border);background:rgba(6,7,64,.02);border-radius:12px 12px 0 0}
.opd-filter-close{width:28px;height:28px;border-radius:7px;border:1px solid var(--color-border);background:var(--color-card);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.opd-filter-close:hover{background:var(--color-muted)}
.opd-filter-pane-body{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:16px 18px}
@media(max-width:900px){.opd-filter-pane-body{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.opd-filter-pane-body{grid-template-columns:1fr}}
.opd-filter-field{display:flex;flex-direction:column;gap:5px}
.opd-filter-label{font-size:11.5px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em}
.opd-filter-select{height:38px;padding:0 10px;border:1px solid #e2e6ea;border-radius:8px;background:#fff;font-size:13.5px;color:#111827;outline:none;transition:border-color .15s}
.opd-filter-select:focus{border-color:#060740;box-shadow:0 0 0 3px rgba(6,7,64,.07)}
.opd-filter-pane-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--color-border);background:rgba(6,7,64,.02)}
.opd-filter-reset{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-card);font-size:13px;font-weight:600;color:var(--color-muted-foreground);cursor:pointer;transition:all .15s}
.opd-filter-reset:hover{background:var(--color-muted);color:var(--color-foreground)}
.opd-filter-apply{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 20px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .15s}
.opd-filter-apply:hover{opacity:.88}
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
.tab-toolbar{padding:14px 16px;border-bottom:1px solid var(--color-border)}
</style>

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
    <div class="col-md-3">
        <div style="background:#fff;border-radius:10px;padding:14px;border:1px solid var(--color-border)">
            <p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Patient Returns</p>
            <h4 id="statPatientReturns" style="font-size:22px;font-weight:700;color:#e67e22;margin:4px 0 0;font-family:'Roobert',sans-serif">0</h4>
            <span id="statPatientPending" style="font-size:11px;color:var(--color-muted-foreground)">0 pending</span>
        </div>
    </div>
    <div class="col-md-3">
        <div style="background:#fff;border-radius:10px;padding:14px;border:1px solid var(--color-border)">
            <p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Expired Stock</p>
            <h4 id="statExpired" style="font-size:22px;font-weight:700;color:#e74c3c;margin:4px 0 0;font-family:'Roobert',sans-serif">0</h4>
            <span id="statExpiredLoss" style="font-size:11px;color:#e74c3c">PKR 0 loss</span>
        </div>
    </div>
    <div class="col-md-3">
        <div style="background:#fff;border-radius:10px;padding:14px;border:1px solid var(--color-border)">
            <p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Near Expiry</p>
            <h4 id="statNearExpiry" style="font-size:22px;font-weight:700;color:#f39c12;margin:4px 0 0;font-family:'Roobert',sans-serif">0</h4>
            <span style="font-size:11px;color:var(--color-muted-foreground)">within 6 months</span>
        </div>
    </div>
    <div class="col-md-3">
        <div style="background:#fff;border-radius:10px;padding:14px;border:1px solid var(--color-border)">
            <p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Total Refunds</p>
            <h4 id="statRefunds" style="font-size:22px;font-weight:700;color:#27ae60;margin:4px 0 0;font-family:'Roobert',sans-serif">0</h4>
            <span style="font-size:11px;color:var(--color-muted-foreground)">approved</span>
        </div>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
    <ul class="nav nav-tabs" style="padding:0 20px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tabPatient" style="font-size:13px;font-weight:500;padding:12px 16px;border:none;color:var(--color-foreground)"><i data-lucide="receipt" style="width:14px;height:14px;margin-right:4px"></i> Sales Return</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabPurchaseReturn" style="font-size:13px;font-weight:500;padding:12px 16px;border:none;color:var(--color-muted-foreground)"><i data-lucide="package-x" style="width:14px;height:14px;margin-right:4px"></i> Purchase Return</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabExpired" style="font-size:13px;font-weight:500;padding:12px 16px;border:none;color:var(--color-muted-foreground)"><i data-lucide="alert-octagon" style="width:14px;height:14px;margin-right:4px"></i> Expired Stock</a></li>
        <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tabNearExpiry" style="font-size:13px;font-weight:500;padding:12px 16px;border:none;color:var(--color-muted-foreground)"><i data-lucide="clock" style="width:14px;height:14px;margin-right:4px"></i> Near-Expiry</a></li>
    </ul>

    <div class="tab-content">

        {{-- ── Patient Returns Tab ───────────────────────────────────────────── --}}
        <div class="tab-pane fade show active" id="tabPatient">
            <div class="tab-toolbar">
                <div class="opd-toolbar">
                    <div class="opd-search-wrap">
                        <i data-lucide="search" class="opd-search-icon"></i>
                        <input type="text" class="opd-search-input" id="searchPatientReturns" placeholder="Search patient, return ID, medicine...">
                    </div>
                    <div class="opd-toolbar-right">
                        <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnPatientFilter" onclick="ReturnsApp.togglePatientFilter()" title="Filter">
                            <i data-lucide="filter"></i>
                            <span class="opd-filter-badge" id="patientFilterBadge" style="display:none">0</span>
                        </button>
                        <div class="opd-rows-wrap">
                            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="ReturnsApp.togglePatientRowsMenu(event)" title="Rows per page"><i data-lucide="layout-list"></i></button>
                            <div class="opd-rows-menu" id="patientRowsMenu">
                                <div class="opd-rows-head">Rows per page</div>
                                <button onclick="ReturnsApp.setPatientRowsPer(10)" class="active">10 rows</button>
                                <button onclick="ReturnsApp.setPatientRowsPer(20)">20 rows</button>
                                <button onclick="ReturnsApp.setPatientRowsPer(50)">50 rows</button>
                            </div>
                        </div>
                        <div class="opd-col-vis-wrap">
                            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="ReturnsApp.togglePatientColVis(event)" title="Column visibility"><i data-lucide="columns-3"></i></button>
                            <div class="opd-col-vis-menu" id="patientColVisMenu">
                                <div class="opd-col-vis-head"><span>Columns</span><button class="opd-col-vis-selall" onclick="ReturnsApp.patientColVisSelectAll()">Select All</button></div>
                                <div class="opd-col-vis-list" id="patientColVisList">
                                    <label><input type="checkbox" data-col="0" checked> Return ID</label>
                                    <label><input type="checkbox" data-col="1" checked> Date</label>
                                    <label><input type="checkbox" data-col="2" checked> Patient</label>
                                    <label><input type="checkbox" data-col="3" checked> Order ID</label>
                                    <label><input type="checkbox" data-col="4" checked> Medicine</label>
                                    <label><input type="checkbox" data-col="5" checked> Qty</label>
                                    <label><input type="checkbox" data-col="6" checked> Reason</label>
                                    <label><input type="checkbox" data-col="7" checked> Condition</label>
                                    <label><input type="checkbox" data-col="8" checked> Refund</label>
                                    <label><input type="checkbox" data-col="9" checked> Status</label>
                                </div>
                                <div class="opd-col-vis-foot"><button class="opd-col-vis-save" onclick="ReturnsApp.applyPatientColVis()">Save</button></div>
                            </div>
                        </div>
                        <div class="opd-export-wrap">
                            <button class="opd-tool-btn" type="button" onclick="ReturnsApp.togglePatientExportMenu(event)" style="padding:0 10px">
                                <i data-lucide="upload"></i><i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                            </button>
                            <div class="opd-export-menu" id="patientExportMenu">
                                <button onclick="ReturnsApp.exportTab('patient','csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                                <button onclick="ReturnsApp.exportTab('patient','print')"><i data-lucide="printer"></i> Print</button>
                            </div>
                        </div>
                        <button onclick="ReturnsApp.showNewPatientReturn()" style="display:flex;align-items:center;gap:6px;height:38px;padding:0 14px;background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap">
                            <i data-lucide="plus" style="width:14px;height:14px"></i> New Return
                        </button>
                    </div>
                </div>
            </div>
            <div class="opd-filter-pane" id="patientFilterPane" style="display:none">
                <div class="opd-filter-pane-head">
                    <div style="display:flex;align-items:center;gap:8px">
                        <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                        <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                    </div>
                    <button class="opd-filter-close" onclick="ReturnsApp.togglePatientFilter()" type="button">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="opd-filter-pane-body">
                    <div class="opd-filter-field">
                        <label class="opd-filter-label">Status</label>
                        <select class="opd-filter-select" id="filterPatientStatus">
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                <div class="opd-filter-pane-foot">
                    <button class="opd-filter-reset" onclick="ReturnsApp.resetPatientFilters()"><i data-lucide="rotate-ccw"></i> Reset</button>
                    <button class="opd-filter-apply" onclick="ReturnsApp.applyPatientClientFilters()"><i data-lucide="check"></i> Apply Filters</button>
                </div>
            </div>
            <div style="overflow-x:auto">
                <table class="data-table" style="display:none" id="tblPatientReturns">
                    <thead><tr>
                        <th>Return ID</th>
                        <th>Date</th>
                        <th>Patient</th>
                        <th>Order ID</th>
                        <th>Medicine</th>
                        <th class="text-center">Qty</th>
                        <th>Reason</th>
                        <th>Condition</th>
                        <th class="text-right">Refund</th>
                        <th class="text-center">Status</th>
                        <th class="text-center">Action</th>
                    </tr></thead>
                    <tbody id="patientReturnsBody"></tbody>
                </table>
            </div>
            <div id="patientEmpty" class="panel-notice is-hidden"><i data-lucide="inbox"></i> No patient returns found.</div>
            <div id="patientLoading" class="panel-notice">Loading...</div>
            <div class="opd-pagination" id="patientPagination" style="display:none">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="patientPageInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="patientPrevPage" disabled onclick="ReturnsApp.goToPatientPage(ReturnsApp.patientPage-1)"><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="patientPageNums"></div>
                    <button class="opd-page-btn" id="patientNextPage" onclick="ReturnsApp.goToPatientPage(ReturnsApp.patientPage+1)"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>

        {{-- ── Purchase Return Tab ───────────────────────────────────────────── --}}
        <div class="tab-pane fade" id="tabPurchaseReturn">
            <div class="tab-toolbar">
                <div class="opd-toolbar">
                    <div class="opd-search-wrap">
                        <i data-lucide="search" class="opd-search-icon"></i>
                        <input type="text" class="opd-search-input" id="searchPurchaseReturn" placeholder="Search supplier, PO number, medicine...">
                    </div>
                    <div class="opd-toolbar-right">
                        <button class="opd-tool-btn" onclick="ReturnsApp.showNewPurchaseReturn()">
                            <i data-lucide="plus" style="width:15px;height:15px"></i> New Purchase Return
                        </button>
                    </div>
                </div>
            </div>

            <div style="overflow-x:auto">
                <div class="is-hidden" id="purchaseReturnLoading" style="padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:13px">
                    <i data-lucide="loader-2" style="width:20px;height:20px;margin-right:8px"></i> Loading...
                </div>
                <div class="is-hidden" id="purchaseReturnEmpty" style="padding:60px;text-align:center">
                    <i data-lucide="package-x" style="width:40px;height:40px;color:var(--color-muted-foreground);margin-bottom:12px"></i>
                    <p style="font-size:14px;color:var(--color-muted-foreground);margin:0">No purchase returns found.</p>
                </div>
                <table class="data-table" id="tblPurchaseReturn" style="display:none">
                    <thead>
                        <tr>
                            <th>Return ID</th>
                            <th>Date</th>
                            <th>Supplier</th>
                            <th>PO / Invoice</th>
                            <th>Medicine</th>
                            <th>Qty</th>
                            <th>Reason</th>
                            <th>Credit Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="purchaseReturnBody"></tbody>
                </table>
            </div>

            <div id="purchaseReturnPagination" class="opd-pagination" style="display:none">
                <div class="opd-pagination-left">
                    <span class="opd-page-info" id="purchaseReturnPageInfo"></span>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="purchaseReturnPrevPage" disabled onclick="ReturnsApp.goToPurchaseReturnPage(ReturnsApp.purchaseReturnPage-1)"><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="purchaseReturnPageNums"></div>
                    <button class="opd-page-btn" id="purchaseReturnNextPage" onclick="ReturnsApp.goToPurchaseReturnPage(ReturnsApp.purchaseReturnPage+1)"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>

        {{-- ── Expired Stock Tab ─────────────────────────────────────────────── --}}
        <div class="tab-pane fade" id="tabExpired">
            <div class="tab-toolbar">
                <div class="opd-toolbar">
                    <div class="opd-search-wrap">
                        <i data-lucide="search" class="opd-search-icon"></i>
                        <input type="text" class="opd-search-input" id="searchExpiredStock" placeholder="Search medicine name, batch...">
                    </div>
                    <div class="opd-toolbar-right">
                        <div class="opd-rows-wrap">
                            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="ReturnsApp.toggleExpiredRowsMenu(event)" title="Rows per page"><i data-lucide="layout-list"></i></button>
                            <div class="opd-rows-menu" id="expiredRowsMenu">
                                <div class="opd-rows-head">Rows per page</div>
                                <button onclick="ReturnsApp.setExpiredRowsPer(10)" class="active">10 rows</button>
                                <button onclick="ReturnsApp.setExpiredRowsPer(20)">20 rows</button>
                                <button onclick="ReturnsApp.setExpiredRowsPer(50)">50 rows</button>
                            </div>
                        </div>
                        <div class="opd-col-vis-wrap">
                            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="ReturnsApp.toggleExpiredColVis(event)" title="Column visibility"><i data-lucide="columns-3"></i></button>
                            <div class="opd-col-vis-menu" id="expiredColVisMenu">
                                <div class="opd-col-vis-head"><span>Columns</span><button class="opd-col-vis-selall" onclick="ReturnsApp.expiredColVisSelectAll()">Select All</button></div>
                                <div class="opd-col-vis-list" id="expiredColVisList">
                                    <label><input type="checkbox" data-col="1" checked> Medicine</label>
                                    <label><input type="checkbox" data-col="2" checked> Batch</label>
                                    <label><input type="checkbox" data-col="3" checked> Expiry Date</label>
                                    <label><input type="checkbox" data-col="4" checked> Days Expired</label>
                                    <label><input type="checkbox" data-col="5" checked> Qty</label>
                                    <label><input type="checkbox" data-col="6" checked> Purchase Value</label>
                                    <label><input type="checkbox" data-col="7" checked> Loss</label>
                                </div>
                                <div class="opd-col-vis-foot"><button class="opd-col-vis-save" onclick="ReturnsApp.applyExpiredColVis()">Save</button></div>
                            </div>
                        </div>
                        <div class="opd-export-wrap">
                            <button class="opd-tool-btn" type="button" onclick="ReturnsApp.toggleExpiredExportMenu(event)" style="padding:0 10px">
                                <i data-lucide="upload"></i><i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                            </button>
                            <div class="opd-export-menu" id="expiredExportMenu">
                                <button onclick="ReturnsApp.exportTab('expired','csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                                <button onclick="ReturnsApp.exportTab('expired','print')"><i data-lucide="printer"></i> Print</button>
                            </div>
                        </div>
                        <button onclick="ReturnsApp.showDisposalForm()" style="display:flex;align-items:center;gap:6px;height:38px;padding:0 14px;background:#e74c3c;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap">
                            <i data-lucide="trash-2" style="width:14px;height:14px"></i> Dispose Selected
                        </button>
                    </div>
                </div>
            </div>
            <div style="overflow-x:auto">
                <table class="data-table" style="display:none" id="tblExpiredStock">
                    <thead><tr>
                        <th style="width:36px"><input type="checkbox" class="form-check-input" onchange="ReturnsApp.toggleAllExpired(this.checked)" style="width:15px;height:15px;accent-color:#060740"></th>
                        <th>Medicine</th>
                        <th>Batch</th>
                        <th>Expiry Date</th>
                        <th class="text-center">Days Expired</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Purchase Value</th>
                        <th class="text-right">Loss</th>
                        <th class="text-center">Action</th>
                    </tr></thead>
                    <tbody id="expiredStockBody"></tbody>
                    <tfoot id="expiredStockFoot" style="display:none">
                        <tr style="background:var(--color-muted);font-weight:600">
                            <td colspan="5" style="padding:10px 16px;font-size:13px">Total Expired</td>
                            <td style="padding:10px 16px;font-size:13px;text-align:right" id="expiredTotalQty">0</td>
                            <td style="padding:10px 16px;font-size:13px;color:#e74c3c;text-align:right" id="expiredTotalValue">PKR 0</td>
                            <td style="padding:10px 16px;font-size:13px;color:#e74c3c;text-align:right">Loss</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div id="expiredEmpty" class="panel-notice is-hidden"><i data-lucide="inbox"></i> No expired stock found.</div>
            <div id="expiredLoading" class="panel-notice">Loading...</div>
            <div class="opd-pagination" id="expiredPagination" style="display:none">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="expiredPageInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="expiredPrevPage" disabled onclick="ReturnsApp.goToExpiredPage(ReturnsApp.expiredPage-1)"><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="expiredPageNums"></div>
                    <button class="opd-page-btn" id="expiredNextPage" onclick="ReturnsApp.goToExpiredPage(ReturnsApp.expiredPage+1)"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>

        {{-- ── Near-Expiry Tab ───────────────────────────────────────────────── --}}
        <div class="tab-pane fade" id="tabNearExpiry">
            <div class="tab-toolbar">
                <div class="opd-toolbar">
                    <div class="opd-search-wrap">
                        <i data-lucide="search" class="opd-search-icon"></i>
                        <input type="text" class="opd-search-input" id="searchNearExpiry" placeholder="Search medicine name, batch...">
                    </div>
                    <div class="opd-toolbar-right">
                        <div class="opd-rows-wrap">
                            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="ReturnsApp.toggleNearRowsMenu(event)" title="Rows per page"><i data-lucide="layout-list"></i></button>
                            <div class="opd-rows-menu" id="nearRowsMenu">
                                <div class="opd-rows-head">Rows per page</div>
                                <button onclick="ReturnsApp.setNearRowsPer(10)" class="active">10 rows</button>
                                <button onclick="ReturnsApp.setNearRowsPer(20)">20 rows</button>
                                <button onclick="ReturnsApp.setNearRowsPer(50)">50 rows</button>
                            </div>
                        </div>
                        <div class="opd-col-vis-wrap">
                            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="ReturnsApp.toggleNearColVis(event)" title="Column visibility"><i data-lucide="columns-3"></i></button>
                            <div class="opd-col-vis-menu" id="nearColVisMenu">
                                <div class="opd-col-vis-head"><span>Columns</span><button class="opd-col-vis-selall" onclick="ReturnsApp.nearColVisSelectAll()">Select All</button></div>
                                <div class="opd-col-vis-list" id="nearColVisList">
                                    <label><input type="checkbox" data-col="0" checked> Medicine</label>
                                    <label><input type="checkbox" data-col="1" checked> Batch</label>
                                    <label><input type="checkbox" data-col="2" checked> Expiry</label>
                                    <label><input type="checkbox" data-col="3" checked> Days Left</label>
                                    <label><input type="checkbox" data-col="4" checked> Stock</label>
                                    <label><input type="checkbox" data-col="5" checked> Est. Usage</label>
                                    <label><input type="checkbox" data-col="6" checked> Recommendation</label>
                                </div>
                                <div class="opd-col-vis-foot"><button class="opd-col-vis-save" onclick="ReturnsApp.applyNearColVis()">Save</button></div>
                            </div>
                        </div>
                        <div class="opd-export-wrap">
                            <button class="opd-tool-btn" type="button" onclick="ReturnsApp.toggleNearExportMenu(event)" style="padding:0 10px">
                                <i data-lucide="upload"></i><i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                            </button>
                            <div class="opd-export-menu" id="nearExportMenu">
                                <button onclick="ReturnsApp.exportTab('near','csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                                <button onclick="ReturnsApp.exportTab('near','print')"><i data-lucide="printer"></i> Print</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="overflow-x:auto">
                <table class="data-table" style="display:none" id="tblNearExpiry">
                    <thead><tr>
                        <th>Medicine</th>
                        <th>Batch</th>
                        <th>Expiry</th>
                        <th class="text-center">Days Left</th>
                        <th class="text-right">Stock</th>
                        <th>Est. Usage</th>
                        <th>Recommendation</th>
                        <th class="text-center">Action</th>
                    </tr></thead>
                    <tbody id="nearExpiryBody"></tbody>
                </table>
            </div>
            <div id="nearEmpty" class="panel-notice is-hidden"><i data-lucide="inbox"></i> No near-expiry items found.</div>
            <div id="nearLoading" class="panel-notice">Loading...</div>
            <div class="opd-pagination" id="nearPagination" style="display:none">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="nearPageInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="nearPrevPage" disabled onclick="ReturnsApp.goToNearPage(ReturnsApp.nearPage-1)"><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="nearPageNums"></div>
                    <button class="opd-page-btn" id="nearNextPage" onclick="ReturnsApp.goToNearPage(ReturnsApp.nearPage+1)"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>

    </div>
</div>

{{-- Offcanvases --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="processReturnPanel" style="width:700px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 24px">
        <h5 style="font-size:16px;font-weight:600;margin:0;font-family:'Roobert',sans-serif" id="processTitle">Process Return</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:20px" id="processBody"></div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="newPurchaseReturnPanel" style="width:700px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 24px">
        <h5 style="font-size:16px;font-weight:600;margin:0;font-family:'Roobert',sans-serif" id="newPurchaseReturnTitle">New Purchase Return</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:20px" id="newPurchaseReturnBody"></div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="newReturnPanel" style="width:700px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 24px">
        <h5 style="font-size:16px;font-weight:600;margin:0;font-family:'Roobert',sans-serif" id="newReturnTitle">New Patient Return</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:20px" id="newReturnBody"></div>
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
