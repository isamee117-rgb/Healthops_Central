@extends('layouts.app')

@section('content')
<style>
/* ── OPD-style toolbar ─────────────────────────────────────────────────── */
.opd-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap}
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
/* Export */
.opd-export-wrap{position:relative}
.opd-export-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:200;min-width:180px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px}
.opd-export-menu.open{display:block}
.opd-export-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:none;font-size:13.5px;font-weight:500;color:var(--color-foreground);cursor:pointer;border-radius:7px;text-align:left;transition:background .12s}
.opd-export-menu button:hover{background:var(--color-muted)}
.opd-export-menu button i{width:15px;height:15px;color:var(--color-muted-foreground);flex-shrink:0}
/* Rows per page */
.opd-rows-wrap{position:relative}
.opd-rows-menu{display:none;position:absolute;left:0;top:calc(100% + 6px);z-index:200;min-width:140px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px}
.opd-rows-menu.open{display:block}
.opd-rows-head{padding:8px 10px 6px;font-size:11px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--color-border);margin-bottom:4px}
.opd-rows-menu button{display:flex;align-items:center;width:100%;padding:8px 10px;border:none;background:none;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer;border-radius:7px;text-align:left;transition:background .1s}
.opd-rows-menu button:hover,.opd-rows-menu button.active{background:var(--color-muted)}
/* Column visibility */
.opd-col-vis-wrap{position:relative}
.opd-col-vis-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:200;width:200px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);overflow:hidden}
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
/* Filter pane */
.opd-filter-pane{background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
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
.opd-filter-input{height:38px;padding:0 12px;border:1px solid #e2e6ea;border-radius:8px;background:#fff;font-size:13.5px;color:#111827;outline:none;transition:border-color .15s}
.opd-filter-input:focus{border-color:#060740;box-shadow:0 0 0 3px rgba(6,7,64,.07)}
.opd-filter-pane-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--color-border);background:rgba(6,7,64,.02)}
.opd-filter-reset{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-card);font-size:13px;font-weight:600;color:var(--color-muted-foreground);cursor:pointer;transition:all .15s}
.opd-filter-reset:hover{background:var(--color-muted);color:var(--color-foreground)}
.opd-filter-apply{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 20px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .15s}
.opd-filter-apply:hover{opacity:.88}
/* Pagination */
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
.data-table-wrapper{background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;overflow:hidden}
</style>

{{-- ── Page Header ─────────────────────────────────────────────────────────── --}}
<div class="page-header mb-4">
    <div class="d-flex align-items-center gap-3">
        <div class="page-icon">
            <i data-lucide="alert-triangle"></i>
        </div>
        <div>
            <h1>Stock Alerts &amp; Procurement</h1>
            <p class="page-subtitle">Monitor stock levels, manage alerts, create purchase orders</p>
        </div>
    </div>
    <div class="d-flex gap-2">
        <button id="btnViewAlerts" class="btn-outline">
            <i data-lucide="bell"></i> Stock Alerts
        </button>
        <button id="btnCreatePO" class="btn-primary">
            <i data-lucide="plus"></i> Create PO
        </button>
    </div>
</div>

{{-- ── Stat Cards ───────────────────────────────────────────────────────────── --}}
<div id="dashStatCards" class="stat-cards-3">
    <div class="stat-card-sm">
        <div class="stat-card-header">
            <span class="stat-card-label">Total POs</span>
            <div class="stat-card-icon sci-blue"><i data-lucide="file-text"></i></div>
        </div>
        <div id="dashTotalPOs" class="stat-card-num scn-blue">--</div>
    </div>
    <div class="stat-card-sm">
        <div class="stat-card-header">
            <span class="stat-card-label">Pending</span>
            <div class="stat-card-icon sci-orange"><i data-lucide="clock"></i></div>
        </div>
        <div id="dashPendingPOs" class="stat-card-num scn-orange">--</div>
    </div>
    <div class="stat-card-sm">
        <div class="stat-card-header">
            <span class="stat-card-label">Completed</span>
            <div class="stat-card-icon sci-green"><i data-lucide="check-circle"></i></div>
        </div>
        <div id="dashCompletedPOs" class="stat-card-num scn-green">--</div>
    </div>
</div>

{{-- ── OPD Toolbar ──────────────────────────────────────────────────────────── --}}
<div class="opd-toolbar">
    <div class="opd-search-wrap">
        <i data-lucide="search" class="opd-search-icon"></i>
        <input type="text" class="opd-search-input" id="poSearch" placeholder="Search PO number, supplier...">
    </div>
    <div class="opd-toolbar-right">
        {{-- Filter --}}
        <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnPOFilter" onclick="togglePOFilter()" title="Filter">
            <i data-lucide="filter"></i>
            <span class="opd-filter-badge" id="poFilterBadge" style="display:none">0</span>
        </button>
        {{-- Rows per page --}}
        <div class="opd-rows-wrap">
            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="togglePORowsMenu(event)" title="Rows per page">
                <i data-lucide="layout-list"></i>
            </button>
            <div class="opd-rows-menu" id="poRowsMenu">
                <div class="opd-rows-head">Rows per page</div>
                <button onclick="setPORowsPer(10)" class="active">10 rows</button>
                <button onclick="setPORowsPer(20)">20 rows</button>
                <button onclick="setPORowsPer(50)">50 rows</button>
                <button onclick="setPORowsPer(100)">100 rows</button>
            </div>
        </div>
        {{-- Column visibility --}}
        <div class="opd-col-vis-wrap">
            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="togglePOColVis(event)" title="Column visibility">
                <i data-lucide="columns-3"></i>
            </button>
            <div class="opd-col-vis-menu" id="poColVisMenu">
                <div class="opd-col-vis-head">
                    <span>Columns</span>
                    <button class="opd-col-vis-selall" type="button" onclick="poColVisSelectAll()">Select All</button>
                </div>
                <div class="opd-col-vis-list" id="poColVisList">
                    <label><input type="checkbox" data-col="0" checked> PO Number</label>
                    <label><input type="checkbox" data-col="1" checked> Supplier</label>
                    <label><input type="checkbox" data-col="2" checked> Date</label>
                    <label><input type="checkbox" data-col="3" checked> Expected Delivery</label>
                    <label><input type="checkbox" data-col="4" checked> Items</label>
                    <label><input type="checkbox" data-col="5" checked> Total</label>
                    <label><input type="checkbox" data-col="6" checked> Status</label>
                    <label><input type="checkbox" data-col="7" checked> Action</label>
                </div>
                <div class="opd-col-vis-foot">
                    <button class="opd-col-vis-save" type="button" onclick="applyPOColVis()">Save</button>
                </div>
            </div>
        </div>
        {{-- Export --}}
        <div class="opd-export-wrap">
            <button class="opd-tool-btn" type="button" onclick="togglePOExportMenu(event)" style="padding:0 10px">
                <i data-lucide="upload"></i>
                <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
            </button>
            <div class="opd-export-menu" id="poExportMenu">
                <button onclick="exportPO('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                <button onclick="exportPO('pdf')"><i data-lucide="file-text"></i> PDF</button>
                <button onclick="exportPO('print')"><i data-lucide="printer"></i> Print</button>
            </div>
        </div>
    </div>
</div>

{{-- ── Filter Pane ───────────────────────────────────────────────────────────── --}}
<div class="opd-filter-pane" id="poFilterPane" style="display:none">
    <div class="opd-filter-pane-head">
        <div style="display:flex;align-items:center;gap:8px">
            <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
            <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
        </div>
        <button class="opd-filter-close" onclick="togglePOFilter()" type="button">
            <i data-lucide="x"></i>
        </button>
    </div>
    <div class="opd-filter-pane-body">
        <div class="opd-filter-field">
            <label class="opd-filter-label">Status</label>
            <select class="opd-filter-select" id="poStatusFilter">
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
            </select>
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Order Type</label>
            <select class="opd-filter-select" id="poTypeFilter">
                <option value="">All Types</option>
                <option value="Regular Stock Replenishment">Regular</option>
                <option value="Emergency Order">Emergency</option>
                <option value="Consignment">Consignment</option>
                <option value="Direct Patient Order">Direct Patient</option>
            </select>
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Date From</label>
            <input type="date" class="opd-filter-input" id="poDateFrom">
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Date To</label>
            <input type="date" class="opd-filter-input" id="poDateTo">
        </div>
    </div>
    <div class="opd-filter-pane-foot">
        <button class="opd-filter-reset" type="button" onclick="resetPOFilters()">
            <i data-lucide="rotate-ccw"></i> Reset
        </button>
        <button class="opd-filter-apply" type="button" onclick="applyPOFilters()">
            <i data-lucide="check"></i> Apply Filters
        </button>
    </div>
</div>

{{-- ── Purchase Orders Table ─────────────────────────────────────────────────── --}}
<div class="data-table-wrapper">
    {{-- Status quick-tabs --}}
    <div style="padding:12px 16px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="font-size:13px;font-weight:700;color:var(--color-foreground)">Purchase Orders</span>
        <div style="margin-left:8px;display:flex;gap:6px;flex-wrap:wrap">
            <button class="po-tab-btn active" data-status="" style="padding:4px 14px;border-radius:20px;border:1px solid var(--color-border);background:#060740;color:#7FFFD4;font-size:12px;font-weight:600;cursor:pointer">All</button>
            <button class="po-tab-btn" data-status="Pending" style="padding:4px 14px;border-radius:20px;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);font-size:12px;font-weight:600;cursor:pointer">Pending</button>
            <button class="po-tab-btn" data-status="Completed" style="padding:4px 14px;border-radius:20px;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);font-size:12px;font-weight:600;cursor:pointer">Completed</button>
        </div>
    </div>
    <div style="overflow-x:auto">
        <table class="data-table" id="tblMainPO">
            <thead>
                <tr>
                    <th>PO Number</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th>Expected Delivery</th>
                    <th class="text-center">Items</th>
                    <th class="text-right">Total</th>
                    <th class="text-center">Status</th>
                    <th class="text-center">Action</th>
                </tr>
            </thead>
            <tbody id="tbodyMainPO"></tbody>
        </table>
    </div>
    <div id="poMainEmpty" class="panel-notice is-hidden">
        <i data-lucide="inbox"></i>
        No purchase orders found. Click "+ Create PO" to create one.
    </div>
    <div id="poMainLoading" class="panel-notice">Loading...</div>
    {{-- Pagination --}}
    <div class="opd-pagination" id="poPagination" style="display:none">
        <div class="opd-pagination-left">
            <div class="opd-page-info" id="poPageInfo">Showing — of — results</div>
        </div>
        <div class="opd-page-btns">
            <button class="opd-page-btn" id="poPrevPage" disabled><i data-lucide="chevron-left"></i></button>
            <div class="opd-page-nums" id="poPageNums"></div>
            <button class="opd-page-btn" id="poNextPage"><i data-lucide="chevron-right"></i></button>
        </div>
    </div>
</div>

{{-- ── Stock Alerts Offcanvas ────────────────────────────────────────────────── --}}
<div class="offcanvas offcanvas-end offcanvas-800" tabindex="-1" id="alertsSheet">
    <div class="offcanvas-header">
        <div class="d-flex align-items-center gap-3">
            <div class="page-icon-md"><i data-lucide="bell"></i></div>
            <div>
                <h5 class="offcanvas-title">Stock Alerts</h5>
                <p class="offcanvas-subtitle">Monitor stock levels and expiry alerts</p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        {{-- Alerts search bar --}}
        <div style="position:relative;margin-bottom:16px">
            <i data-lucide="search" style="position:absolute;left:13px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--color-muted-foreground);pointer-events:none"></i>
            <input type="text" id="alertSearch" placeholder="Search medicine name across all alerts..." style="width:100%;height:38px;padding:0 14px 0 40px;border:1px solid var(--color-border);border-radius:10px;background:#fff;font-size:13px;outline:none;transition:border-color .15s">
        </div>

        <div class="mini-stat-grid">
            <div class="mini-stat-card">
                <div class="mini-stat-label">Out of Stock</div>
                <div id="dashOutOfStock" class="mini-stat-value msv-red">--</div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-label">Low Stock</div>
                <div id="dashLowStock" class="mini-stat-value msv-orange">--</div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-label">Expiring Soon</div>
                <div id="dashExpiring" class="mini-stat-value msv-yellow">--</div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-label">Expired</div>
                <div id="dashExpired" class="mini-stat-value msv-red">--</div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-label">Reorder Needed</div>
                <div id="dashReorder" class="mini-stat-value msv-blue">--</div>
            </div>
        </div>

        <div id="alertSections">
            {{-- Out of Stock --}}
            <div id="sectionOutOfStock" class="alert-section">
                <div class="alert-section-header ash-danger" data-section="outOfStock">
                    <div class="d-flex align-items-center gap-2">
                        <div class="section-icon si-red"><i data-lucide="package-x"></i></div>
                        <span class="fw-bold asc-danger">Out of Stock</span>
                        <span id="badgeOutOfStock" class="badge badge-destructive">0</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span id="lostRevenue" class="section-hint asc-danger"></span>
                        <i data-lucide="chevron-down" class="section-chevron asc-danger"></i>
                    </div>
                </div>
                <div class="alert-section-body">
                    <table class="data-table" id="tblOutOfStock">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Last Stockout</th>
                                <th class="text-center">Pending Orders</th>
                                <th>Avg Daily Usage</th>
                                <th class="text-center">Priority</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyOutOfStock"></tbody>
                    </table>
                    <div id="footerOutOfStock" class="alert-section-footer"></div>
                </div>
            </div>

            {{-- Low Stock --}}
            <div id="sectionLowStock" class="alert-section">
                <div class="alert-section-header ash-warning" data-section="lowStock">
                    <div class="d-flex align-items-center gap-2">
                        <div class="section-icon si-orange"><i data-lucide="alert-triangle"></i></div>
                        <span class="fw-bold asc-warning">Low Stock</span>
                        <span id="badgeLowStock" class="badge badge-orange">0</span>
                    </div>
                    <i data-lucide="chevron-down" class="section-chevron asc-warning"></i>
                </div>
                <div class="alert-section-body">
                    <table class="data-table" id="tblLowStock">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th class="text-right">Current</th>
                                <th class="text-right">Min Level</th>
                                <th class="text-center">Days Until Out</th>
                                <th>Reorder Qty</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyLowStock"></tbody>
                    </table>
                    <div id="footerLowStock" class="alert-section-footer"></div>
                </div>
            </div>

            {{-- Expiring Soon --}}
            <div id="sectionExpiring" class="alert-section">
                <div class="alert-section-header ash-yellow" data-section="expiring">
                    <div class="d-flex align-items-center gap-2">
                        <div class="section-icon si-yellow"><i data-lucide="clock"></i></div>
                        <span class="fw-bold asc-yellow">Expiring Soon (&lt;3 months)</span>
                        <span id="badgeExpiring" class="badge badge-warning">0</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span id="expiringLoss" class="section-hint asc-yellow"></span>
                        <i data-lucide="chevron-down" class="section-chevron asc-yellow"></i>
                    </div>
                </div>
                <div class="alert-section-body">
                    <table class="data-table" id="tblExpiring">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Batch</th>
                                <th>Expiry Date</th>
                                <th class="text-center">Days Remaining</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Estimated Loss</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyExpiring"></tbody>
                    </table>
                    <div id="footerExpiring" class="alert-section-footer"></div>
                </div>
            </div>

            {{-- Expired Stock --}}
            <div id="sectionExpired" class="alert-section">
                <div class="alert-section-header ash-danger" data-section="expired">
                    <div class="d-flex align-items-center gap-2">
                        <div class="section-icon si-red"><i data-lucide="x-circle"></i></div>
                        <span class="fw-bold asc-danger">Expired Stock</span>
                        <span id="badgeExpired" class="badge badge-destructive">0</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span id="expiredLoss" class="section-hint asc-danger"></span>
                        <i data-lucide="chevron-down" class="section-chevron asc-danger"></i>
                    </div>
                </div>
                <div class="alert-section-body">
                    <table class="data-table" id="tblExpired">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Batch</th>
                                <th>Expired Date</th>
                                <th class="text-center">Days Expired</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Loss Value</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyExpired"></tbody>
                    </table>
                    <div id="footerExpired" class="alert-section-footer"></div>
                </div>
            </div>

            {{-- Reorder Suggestions --}}
            <div id="sectionReorder" class="alert-section">
                <div class="alert-section-header ash-info" data-section="reorder">
                    <div class="d-flex align-items-center gap-2">
                        <div class="section-icon si-blue"><i data-lucide="refresh-cw"></i></div>
                        <span class="fw-bold asc-info">Reorder Suggestions</span>
                        <span id="badgeReorder" class="badge badge-info">0</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span id="reorderValue" class="section-hint asc-info"></span>
                        <i data-lucide="chevron-down" class="section-chevron asc-info"></i>
                    </div>
                </div>
                <div class="alert-section-body">
                    <div class="alert-section-info ash-info asc-info">
                        <i data-lucide="info" class="icon-inline"></i>
                        Based on: Usage patterns, Stock levels, Lead times, Seasonal trends
                    </div>
                    <table class="data-table" id="tblReorder">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th class="text-right">Current</th>
                                <th>Reorder Point</th>
                                <th>Suggested Qty</th>
                                <th>Preferred Supplier</th>
                                <th class="text-center">Lead Time</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyReorder"></tbody>
                    </table>
                    <div id="footerReorder" class="alert-section-footer"></div>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- ── View PO Offcanvas ─────────────────────────────────────────────────────── --}}
<div class="offcanvas offcanvas-end offcanvas-720" tabindex="-1" id="poViewSheet">
    <div class="offcanvas-header">
        <div class="d-flex align-items-center gap-3">
            <div class="page-icon-md"><i data-lucide="file-text"></i></div>
            <div>
                <h5 class="offcanvas-title">PURCHASE ORDER</h5>
                <p id="poViewSub" class="offcanvas-subtitle"></p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body offcanvas-body--flush">
        <div id="poViewLoading" class="panel-notice">Loading...</div>
        <div id="poViewContent" class="is-hidden">
            <div class="po-view-section">
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <span id="poViewId" class="po-id-tag"></span>
                        <span id="poViewStatus" class="badge"></span>
                    </div>
                    <span id="poViewOrderType" class="badge badge-outline"></span>
                </div>
                <div class="po-meta-grid">
                    <div class="po-meta-card">
                        <div class="po-meta-label">Supplier Details</div>
                        <div id="poViewSupplierName" class="supplier-name"></div>
                        <div class="supplier-contact">
                            <div id="poViewSupplierPhone"></div>
                            <div id="poViewSupplierEmail"></div>
                        </div>
                    </div>
                    <div class="po-meta-card">
                        <div class="po-meta-label">Order Dates</div>
                        <div class="po-meta-row">
                            <span class="text-muted-sm">PO Date:</span>
                            <span id="poViewDate" class="fw-semibold"></span>
                        </div>
                        <div class="po-meta-row">
                            <span class="text-muted-sm">Expected Delivery:</span>
                            <span id="poViewDelivery" class="fw-semibold"></span>
                        </div>
                        <div class="po-meta-row">
                            <span class="text-muted-sm">Payment:</span>
                            <span id="poViewPayment" class="fw-semibold"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="po-view-section">
                <div class="card-panel-title mb-3">
                    <i data-lucide="package" class="icon-inline"></i> Order Items
                </div>
                <div class="overflow-auto">
                    <table class="data-table" id="tblPoView">
                        <thead>
                            <tr>
                                <th>Medicine</th>
                                <th class="text-right">Current Stock</th>
                                <th class="text-right">Ordered</th>
                                <th class="text-right">Received</th>
                                <th class="text-right">Unit Price</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyPoView"></tbody>
                    </table>
                </div>
            </div>
            <div class="po-view-section">
                <div class="summary-box">
                    <div class="summary-box-title">Financial Summary</div>
                    <div class="summary-row"><span>Subtotal:</span><span id="poViewSubtotal" class="fw-semibold font-mono"></span></div>
                    <div class="summary-row"><span>Tax:</span><span id="poViewTax" class="fw-semibold font-mono"></span></div>
                    <div class="summary-row"><span>Discount:</span><span id="poViewDiscount" class="fw-semibold font-mono"></span></div>
                    <div class="summary-total">
                        <span>TOTAL:</span>
                        <span id="poViewTotal" class="text-aquamint font-mono"></span>
                    </div>
                    <div class="d-flex justify-content-between mt-2 text-muted-sm">
                        <span>Advance Payment: <strong id="poViewAdvance"></strong></span>
                        <span>Credit Days: <strong id="poViewCreditDays"></strong></span>
                    </div>
                </div>
            </div>
            <div id="poViewNotesSection" class="po-view-section is-hidden">
                <div class="po-meta-grid">
                    <div id="poViewDeliveryInstrWrap" class="is-hidden">
                        <div class="po-meta-label">Delivery Instructions</div>
                        <div id="poViewDeliveryInstr" class="summary-box"></div>
                    </div>
                    <div id="poViewNotesWrap" class="is-hidden">
                        <div class="po-meta-label">Special Notes</div>
                        <div id="poViewNotes" class="summary-box"></div>
                    </div>
                </div>
            </div>
            <div class="po-view-section">
                <div id="poViewActions" class="d-flex justify-content-end gap-2"></div>
            </div>
        </div>
    </div>
</div>

{{-- ── Create PO Offcanvas ───────────────────────────────────────────────────── --}}
<div class="offcanvas offcanvas-end offcanvas-720" tabindex="-1" id="poFormSheet">
    <div class="offcanvas-header">
        <div class="d-flex align-items-center gap-3">
            <div class="page-icon-md"><i data-lucide="file-plus"></i></div>
            <div>
                <h5 id="poFormTitle" class="offcanvas-title">CREATE PURCHASE ORDER</h5>
                <p id="poFormSub" class="offcanvas-subtitle">Fill in order details below</p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <div class="row g-3 mb-4">
            <div class="col-6">
                <label class="field-label">PO Number</label>
                <input type="text" id="poNumber" readonly class="field-input field-input--bg">
            </div>
            <div class="col-6">
                <label class="field-label">Supplier *</label>
                <select id="poSupplier" class="field-input">
                    <option value="">Select Supplier...</option>
                </select>
            </div>
        </div>
        <div id="supplierInfo" class="supplier-info-box is-hidden">
            <div><span class="info-label">Contact:</span> <span id="supContact" class="info-val"></span></div>
            <div><span class="info-label">Phone:</span> <span id="supPhone" class="info-val"></span></div>
            <div><span class="info-label">Email:</span> <span id="supEmail" class="info-val"></span></div>
            <div><span class="info-label">Lead Time:</span> <span id="supLeadTime" class="info-val"></span></div>
        </div>
        <div class="row g-3 mb-4">
            <div class="col-6">
                <label class="field-label">PO Date</label>
                <input type="date" id="poDate" class="field-input">
            </div>
            <div class="col-6">
                <label class="field-label">Expected Delivery</label>
                <input type="date" id="poExpectedDelivery" class="field-input">
            </div>
        </div>
        <div class="mb-4">
            <label class="field-label mb-2">Order Type</label>
            <div class="d-flex gap-2 flex-wrap">
                <label class="order-type-label"><input type="radio" name="poOrderType" value="Regular Stock Replenishment" checked> Regular</label>
                <label class="order-type-label"><input type="radio" name="poOrderType" value="Emergency Order"> Emergency</label>
                <label class="order-type-label"><input type="radio" name="poOrderType" value="Consignment"> Consignment</label>
                <label class="order-type-label"><input type="radio" name="poOrderType" value="Direct Patient Order"> Direct Patient</label>
            </div>
        </div>
        <div class="mb-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <label class="field-label mb-0">Medicines to Order</label>
                <button id="btnAddMedicine" class="btn-primary btn-sm">
                    <i data-lucide="plus"></i> Add Medicine
                </button>
            </div>
            <div id="poMedicinesContainer">
                <table class="data-table" id="tblPoItems">
                    <thead>
                        <tr>
                            <th>Medicine Name</th>
                            <th class="text-right">Current</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Unit Price</th>
                            <th class="text-right">Total</th>
                            <th class="text-center"></th>
                        </tr>
                    </thead>
                    <tbody id="tbodyPoItems"></tbody>
                </table>
            </div>
            <div id="poItemEmpty" class="panel-notice panel-notice-dashed is-hidden">
                Click "+ Add Medicine" to add items
            </div>
        </div>
        <div class="summary-box mb-4">
            <div class="summary-box-title">Summary</div>
            <div class="summary-row"><span>Total Items:</span><span id="poTotalItems" class="fw-semibold">0</span></div>
            <div class="summary-row"><span>Total Quantity:</span><span id="poTotalQty" class="fw-semibold">0 items</span></div>
            <div class="summary-row"><span>Subtotal:</span><span id="poSubtotal" class="fw-semibold">PKR 0</span></div>
            <div class="summary-row"><span>Tax:</span><span class="fw-semibold">PKR 0</span></div>
            <div class="summary-row"><span>Discount:</span><span class="fw-semibold">PKR 0</span></div>
            <div class="summary-total"><span>TOTAL:</span><span id="poTotal" class="text-aquamint">PKR 0</span></div>
        </div>
        <div class="row g-3 mb-3">
            <div class="col-4">
                <label class="field-label">Payment Method</label>
                <select id="poPaymentMethod" class="field-input">
                    <option value="Cash">Cash</option>
                    <option value="Credit" selected>Credit</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                </select>
            </div>
            <div class="col-4">
                <label class="field-label">Credit Days</label>
                <input type="number" id="poCreditDays" value="30" class="field-input">
            </div>
            <div class="col-4">
                <label class="field-label">Advance Payment</label>
                <input type="number" id="poAdvance" value="0" class="field-input">
            </div>
        </div>
        <div class="mb-3">
            <label class="field-label">Delivery Instructions</label>
            <textarea id="poDeliveryInstructions" rows="2" class="field-input resize-v" placeholder="Optional..."></textarea>
        </div>
        <div class="mb-4">
            <label class="field-label">Special Notes</label>
            <textarea id="poNotes" rows="2" class="field-input resize-v" placeholder="Optional..."></textarea>
        </div>
        <div class="po-form-footer">
            <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
            <button type="button" id="btnCreatePOSubmit" class="btn-primary">
                <i data-lucide="file-plus" style="width:15px;height:15px"></i> Create Purchase Order
            </button>
        </div>
    </div>
</div>

{{-- ── GRN Offcanvas ────────────────────────────────────────────────────────── --}}
<div class="offcanvas offcanvas-end offcanvas-720" tabindex="-1" id="grnSheet">
    <div class="offcanvas-header">
        <div class="d-flex align-items-center gap-3">
            <div class="page-icon-md"><i data-lucide="package-check"></i></div>
            <div>
                <h5 class="offcanvas-title">RECEIVE STOCK (GRN)</h5>
                <p id="grnPoRef" class="offcanvas-subtitle"></p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <div id="grnItemsContainer"></div>
        <div class="summary-box mt-4">
            <div class="summary-box-title">GRN Summary</div>
            <div class="summary-row"><span>Total Items:</span><span id="grnTotalItems" class="fw-semibold">0</span></div>
            <div class="summary-row"><span>Total Received Value:</span><span id="grnTotalValue" class="fw-semibold">PKR 0</span></div>
            <div class="summary-row"><span>Received By:</span><span class="fw-semibold">Admin</span></div>
            <div class="summary-row"><span>Date:</span><span id="grnDate" class="fw-semibold"></span></div>
        </div>
        <div class="po-form-footer mt-4">
            <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
            <button type="button" id="btnCompleteGRN" class="btn-primary">Complete GRN &amp; Update Stock</button>
        </div>
    </div>
</div>

{{-- ── Add Medicine Modal ────────────────────────────────────────────────────── --}}
<div class="modal fade" id="addMedicineModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-rounded">
            <div class="offcanvas-header modal-header-padded">
                <h5 class="offcanvas-title">Add Medicine to Order</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="offcanvas-body modal-body-padded">
                <div class="mb-3">
                    <input type="text" id="medSearchInput" placeholder="Search medicine from inventory..." class="field-input">
                </div>
                <div id="medSearchResults" class="search-results-list"></div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/pharmacy-stock-alerts.js') }}?v={{ filemtime(public_path('js/pharmacy-stock-alerts.js')) }}"></script>
@endpush
