@extends('layouts.app')

@section('content')
<style>
/* ── Priority badge animation ──────────────────────────────────────────── */
@keyframes statPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
.priority-stat { animation: statPulse 1.5s ease-in-out infinite; }

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
.opd-col-vis-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:200;width:220px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);overflow:hidden}
.opd-col-vis-menu.open{display:block}
.opd-col-vis-head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px 10px;border-bottom:1px solid var(--color-border);font-size:13px;font-weight:700;color:var(--color-foreground)}
.opd-col-vis-selall{font-size:11.5px;font-weight:500;color:#060740;background:none;border:none;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px}
.opd-col-vis-list{padding:8px 6px;max-height:280px;overflow-y:auto}
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
.opd-filter-close svg{width:14px;height:14px}
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
.opd-filter-reset svg{width:13px;height:13px}
.opd-filter-apply{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 20px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .15s}
.opd-filter-apply:hover{opacity:.88}
.opd-filter-apply svg{width:13px;height:13px}
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
.data-table-wrapper .opd-pagination{border-top:1px solid var(--color-border);padding:12px 16px;background:var(--color-card)}
/* Searchable dropdown */
.opd-cs-wrap{position:relative}
.opd-cs-trigger{display:flex;align-items:center;justify-content:space-between;height:38px;padding:0 12px;border:1px solid #e2e6ea!important;border-radius:8px;background:#ffffff!important;font-size:13.5px;color:#111827!important;cursor:pointer;gap:8px;user-select:none;transition:border-color .15s,box-shadow .15s}
.opd-cs-trigger:hover{border-color:#9496b8!important}
.opd-cs-trigger.open{border-color:#060740!important;box-shadow:0 0 0 3px rgba(6,7,64,.07)}
.opd-cs-trigger.open>i{transform:rotate(180deg)}
.opd-cs-trigger>i{transition:transform .2s}
.opd-cs-val{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#111827;font-size:13.5px}
.opd-cs-val.opd-ph{color:#374151!important}
.opd-cs-popup{display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #e2e6ea;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,0.13);overflow:hidden}
.opd-cs-popup.open{display:block}
.opd-cs-search{width:100%;padding:9px 14px;border:none;border-bottom:1px solid var(--color-border);font-size:13px;outline:none;background:#fff;color:var(--color-foreground)}
.opd-cs-list{max-height:200px;overflow-y:auto}
.opd-cs-opt{padding:10px 14px;font-size:13.5px;cursor:pointer;color:var(--color-foreground);border-bottom:1px solid rgba(0,0,0,0.04)}
.opd-cs-opt:hover{background:var(--color-muted)}
.opd-cs-opt.selected{background:#EFF6FF;color:#1D4ED8;font-weight:500}
/* Date picker */
.opd-dp-wrap{position:relative}
.opd-dp-trigger{display:flex;align-items:center;justify-content:space-between;height:38px;padding:0 12px;border:1px solid #e2e6ea!important;border-radius:8px;background:#ffffff!important;font-size:13.5px;color:#111827!important;cursor:pointer;gap:8px;transition:border-color .15s,box-shadow .15s}
.opd-dp-trigger:hover{border-color:#9496b8!important}
.opd-dp-trigger.open{border-color:#060740!important;box-shadow:0 0 0 3px rgba(6,7,64,.07)}
.opd-dp-val{flex:1;color:#111827;font-size:13.5px}
.opd-dp-val.opd-ph{color:#374151!important}
.opd-dp-popup{display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #e2e6ea;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.13);padding:14px;min-width:268px}
.opd-dp-popup.open{display:block}
.opd-dp-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.opd-dp-nav{background:none;border:none;cursor:pointer;padding:4px 10px;border-radius:6px;font-size:18px;color:var(--color-foreground);line-height:1}
.opd-dp-nav:hover{background:var(--color-muted)}
.opd-dp-month-year{font-size:14px;font-weight:600;color:var(--color-foreground)}
.opd-dp-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.opd-dp-dayname{font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-align:center;padding:4px 0}
.opd-dp-day{font-size:13px;text-align:center;padding:7px 2px;border-radius:6px;cursor:pointer;color:var(--color-foreground)}
.opd-dp-day:hover:not(.empty){background:var(--color-muted)}
.opd-dp-day.selected{background:#2563EB;color:#fff;font-weight:600}
.opd-dp-day.empty{cursor:default}
</style>

{{-- ── Page Header ────────────────────────────────────────────────────────── --}}
<div class="module-header">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="clipboard-list" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h1 style="margin:0">Medication Orders Queue</h1>
            <p class="module-subtitle">Manage and process all hospital medication orders</p>
        </div>
    </div>
    <div class="module-header-actions">
        <button class="btn-primary" id="btnRefresh"><i data-lucide="refresh-cw"></i> Refresh</button>
    </div>
</div>

{{-- ── Stat Tiles ──────────────────────────────────────────────────────────── --}}
<div class="mini-stats">
    <div class="mini-stat-card">
        <div class="mini-stat-inner">
            <div>
                <p class="mini-stat-label">Pending Orders</p>
                <h3 class="mini-stat-value" style="color:#eab308" id="statPending">--</h3>
            </div>
            <div class="mini-stat-icon" style="background:rgba(234,179,8,0.1)"><i data-lucide="clock" style="color:#eab308"></i></div>
        </div>
    </div>
    <div class="mini-stat-card">
        <div class="mini-stat-inner">
            <div>
                <p class="mini-stat-label">In Progress</p>
                <h3 class="mini-stat-value" style="color:#3b82f6" id="statInProgress">--</h3>
            </div>
            <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="loader" style="color:#3b82f6"></i></div>
        </div>
    </div>
    <div class="mini-stat-card">
        <div class="mini-stat-inner">
            <div>
                <p class="mini-stat-label">Completed Orders</p>
                <h3 class="mini-stat-value" style="color:#22c55e" id="statReady">--</h3>
            </div>
            <div class="mini-stat-icon" style="background:rgba(34,197,94,0.1)"><i data-lucide="check-circle" style="color:#22c55e"></i></div>
        </div>
    </div>
    <div class="mini-stat-card">
        <div class="mini-stat-inner">
            <div>
                <p class="mini-stat-label">Completed Today</p>
                <h3 class="mini-stat-value" style="color:#6b7280" id="statCompleted">--</h3>
            </div>
            <div class="mini-stat-icon" style="background:rgba(107,114,128,0.1)"><i data-lucide="package-check" style="color:#6b7280"></i></div>
        </div>
    </div>
</div>

{{-- ── Toolbar ─────────────────────────────────────────────────────────────── --}}
<div class="opd-toolbar">
    <div class="opd-search-wrap">
        <i data-lucide="search" class="opd-search-icon"></i>
        <input type="text" class="opd-search-input" id="pharSearch" placeholder="Search by Order ID, Patient, Doctor...">
    </div>
    <div class="opd-toolbar-right">
        {{-- Filter --}}
        <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnPharFilter" onclick="togglePharFilter()" title="Filter">
            <i data-lucide="filter"></i>
            <span class="opd-filter-badge" id="pharFilterBadge" style="display:none">0</span>
        </button>
        {{-- Rows per page --}}
        <div class="opd-rows-wrap">
            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="togglePharRowsMenu(event)" title="Rows per page">
                <i data-lucide="layout-list"></i>
            </button>
            <div class="opd-rows-menu" id="pharRowsMenu">
                <div class="opd-rows-head font-normal">Rows per page</div>
                <button onclick="setPharRowsPer(10)">10 rows</button>
                <button onclick="setPharRowsPer(20)">20 rows</button>
                <button onclick="setPharRowsPer(50)">50 rows</button>
                <button onclick="setPharRowsPer(100)">100 rows</button>
            </div>
        </div>
        {{-- Column visibility --}}
        <div class="opd-col-vis-wrap">
            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="togglePharColVis(event)" title="Column visibility">
                <i data-lucide="columns-3"></i>
            </button>
            <div class="opd-col-vis-menu" id="pharColVisMenu">
                <div class="opd-col-vis-head font-medium">
                    <span>Column Visibility</span>
                    <button class="opd-col-vis-selall" type="button" onclick="pharColVisSelectAll()">Select All</button>
                </div>
                <div class="opd-col-vis-list" id="pharColVisList">
                    <label><input type="checkbox" data-col="0" checked> Order ID</label>
                    <label><input type="checkbox" data-col="1" checked> Order Time</label>
                    <label><input type="checkbox" data-col="2" checked> MRN</label>
                    <label><input type="checkbox" data-col="3" checked> Patient Name</label>
                    <label><input type="checkbox" data-col="4" checked> Department</label>
                    <label><input type="checkbox" data-col="5" checked> Priority</label>
                    <label><input type="checkbox" data-col="6" checked> Items</label>
                    <label><input type="checkbox" data-col="7" checked> Order Value</label>
                    <label><input type="checkbox" data-col="8" checked> Ordered By</label>
                    <label><input type="checkbox" data-col="9" checked> Status</label>
                    <label><input type="checkbox" data-col="10" checked> Payment</label>
                    <label><input type="checkbox" data-col="11" checked> Created At</label>
                </div>
                <div class="opd-col-vis-foot">
                    <button class="opd-col-vis-save" type="button" onclick="applyPharColVis()">Save</button>
                </div>
            </div>
        </div>
        {{-- Export --}}
        <div class="opd-export-wrap">
            <button class="opd-tool-btn" type="button" onclick="togglePharExportMenu(event)" title="Export" style="padding:0 10px">
                <i data-lucide="upload"></i>
                <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
            </button>
            <div class="opd-export-menu" id="pharExportMenu">
                <button onclick="exportPhar('excel')"><i data-lucide="table-2"></i> Excel (.xls)</button>
                <button onclick="exportPhar('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                <button onclick="exportPhar('pdf')"><i data-lucide="file-text"></i> PDF</button>
                <button onclick="exportPhar('print')"><i data-lucide="printer"></i> Print</button>
            </div>
        </div>
    </div>
</div>

{{-- ── Filter Pane ──────────────────────────────────────────────────────────── --}}
<div class="opd-filter-pane" id="pharFilterPane" style="display:none">
    <div class="opd-filter-pane-head">
        <div style="display:flex;align-items:center;gap:8px">
            <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
            <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
        </div>
        <button class="opd-filter-close" onclick="togglePharFilter()" type="button">
            <i data-lucide="x"></i>
        </button>
    </div>
    <div class="opd-filter-pane-body">
        {{-- Patient Name searchable dropdown --}}
        <div class="opd-filter-field">
            <label class="opd-filter-label">Patient Name</label>
            <div class="opd-cs-wrap" id="pharCsPatient" data-target="pharPatientFilter" data-placeholder="Any patient">
                <div class="opd-cs-trigger">
                    <span class="opd-cs-val opd-ph">Any patient</span>
                    <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                </div>
                <div class="opd-cs-popup">
                    <input type="text" class="opd-cs-search" placeholder="Search...">
                    <div class="opd-cs-list"></div>
                </div>
            </div>
            <input type="hidden" id="pharPatientFilter">
        </div>
        {{-- Doctor searchable dropdown --}}
        <div class="opd-filter-field">
            <label class="opd-filter-label">Ordered By (Doctor)</label>
            <div class="opd-cs-wrap" id="pharCsDoctor" data-target="pharDoctorFilter" data-placeholder="Any doctor">
                <div class="opd-cs-trigger">
                    <span class="opd-cs-val opd-ph">Any doctor</span>
                    <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                </div>
                <div class="opd-cs-popup">
                    <input type="text" class="opd-cs-search" placeholder="Search...">
                    <div class="opd-cs-list"></div>
                </div>
            </div>
            <input type="hidden" id="pharDoctorFilter">
        </div>
        {{-- Department --}}
        <div class="opd-filter-field">
            <label class="opd-filter-label">Department</label>
            <select class="opd-filter-select" id="pharDeptFilter">
                <option value="all">All Departments</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Emergency">Emergency</option>
                <option value="OT">OT</option>
                <option value="Walk-in">Walk-in</option>
            </select>
        </div>
        {{-- Order Status --}}
        <div class="opd-filter-field">
            <label class="opd-filter-label">Order Status</label>
            <select class="opd-filter-select" id="pharStatusFilter">
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Dispensing">Dispensing</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
        {{-- Priority --}}
        <div class="opd-filter-field">
            <label class="opd-filter-label">Priority</label>
            <select class="opd-filter-select" id="pharPriorityFilter">
                <option value="all">All Priority</option>
                <option value="STAT">STAT</option>
                <option value="Urgent">Urgent</option>
                <option value="Routine">Routine</option>
            </select>
        </div>
        {{-- Payment Status --}}
        <div class="opd-filter-field">
            <label class="opd-filter-label">Payment Status</label>
            <select class="opd-filter-select" id="pharPaymentFilter">
                <option value="all">All Payment</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
            </select>
        </div>
        {{-- Date From --}}
        <div class="opd-filter-field">
            <label class="opd-filter-label">Date From</label>
            <div class="opd-dp-wrap" id="pharDpDateFrom" data-target="pharDateFrom" data-placeholder="Select date">
                <div class="opd-dp-trigger">
                    <span class="opd-dp-val opd-ph">Select date</span>
                    <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                </div>
                <div class="opd-dp-popup"></div>
            </div>
            <input type="hidden" id="pharDateFrom">
        </div>
        {{-- Date To --}}
        <div class="opd-filter-field">
            <label class="opd-filter-label">Date To</label>
            <div class="opd-dp-wrap" id="pharDpDateTo" data-target="pharDateTo" data-placeholder="Select date">
                <div class="opd-dp-trigger">
                    <span class="opd-dp-val opd-ph">Select date</span>
                    <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                </div>
                <div class="opd-dp-popup"></div>
            </div>
            <input type="hidden" id="pharDateTo">
        </div>
    </div>
    <div class="opd-filter-pane-foot">
        <button class="opd-filter-reset" type="button" onclick="resetPharFilters()">
            <i data-lucide="rotate-ccw"></i> Reset
        </button>
        <button class="opd-filter-apply" type="button" onclick="applyPharFilters()">
            <i data-lucide="check"></i> Apply Filters
        </button>
    </div>
</div>

{{-- ── Table ────────────────────────────────────────────────────────────────── --}}
<div class="data-table-wrapper">
    <div style="overflow-x:auto">
        <table class="data-table" id="pharTable">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Order Time</th>
                    <th>MRN</th>
                    <th>Patient Name</th>
                    <th class="text-center">Department</th>
                    <th class="text-center">Priority</th>
                    <th class="text-center">Items</th>
                    <th class="text-right">Order Value</th>
                    <th>Ordered By</th>
                    <th class="text-center">Status</th>
                    <th class="text-center">Payment</th>
                    <th>Created At</th>
                </tr>
            </thead>
            <tbody id="pharTableBody"></tbody>
        </table>
    </div>
    <div class="opd-pagination" id="pharPagination">
        <div class="opd-pagination-left">
            <div class="opd-page-info" id="pharPageInfo">Showing — of — results</div>
        </div>
        <select id="pharPerPage" style="display:none">
            <option value="10" selected>10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
        </select>
        <div class="opd-page-btns">
            <button class="opd-page-btn" id="pharPrevPage" disabled><i data-lucide="chevron-left"></i></button>
            <div class="opd-page-nums" id="pharPageNums"></div>
            <button class="opd-page-btn" id="pharNextPage"><i data-lucide="chevron-right"></i></button>
        </div>
    </div>
</div>

{{-- ── Order Detail Offcanvas ─────────────────────────────────────────────── --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="orderDetailSheet" style="width:700px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div style="display:flex;align-items:center;gap:12px;flex:1">
            <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,rgba(127,255,212,0.2),rgba(0,51,102,0.1));display:flex;align-items:center;justify-content:center">
                <i data-lucide="clipboard-list" style="width:22px;height:22px;color:var(--aquamint)"></i>
            </div>
            <div style="flex:1">
                <div style="display:flex;align-items:center;gap:8px">
                    <h5 class="offcanvas-title" style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif" id="detailOrderId">ORDER DETAILS</h5>
                    <span id="detailPriorityBadge"></span>
                </div>
                <p id="detailOrderMeta" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:0;overflow-y:auto">
        <div id="orderDetailBody" style="padding:24px"></div>
        <div style="display:flex;gap:8px;padding:16px 24px;border-top:1px solid var(--color-border);background:var(--color-background);position:sticky;bottom:0">
            <button class="btn-hold-order" style="padding:8px 16px;background:#fff;border:1px solid #f97316;border-radius:8px;font-size:12px;font-weight:500;color:#f97316;cursor:pointer"><i data-lucide="pause-circle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Hold Order</button>
            <button class="btn-print-order" style="padding:8px 16px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:12px;font-weight:500;cursor:pointer"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Print Order Slip</button>
            <button class="btn-verify-order" style="padding:8px 16px;background:#3b82f6;border:none;border-radius:8px;font-size:12px;font-weight:600;color:#fff;cursor:pointer"><i data-lucide="shield-check" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Verify Order</button>
        </div>
    </div>
</div>
<!-- Alternative Medicine Modal -->
<div class="modal fade" id="altMedModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" style="max-width:460px">
        <div class="modal-content" style="border-radius:14px;border:1px solid var(--color-border)">
            <div class="modal-header" style="border-bottom:1px solid var(--color-border);padding:18px 24px">
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center">
                        <i data-lucide="arrow-left-right" style="width:18px;height:18px;color:#3b82f6"></i>
                    </div>
                    <div>
                        <h5 style="margin:0;font-size:15px;font-weight:700">Alternative Medicine</h5>
                        <p style="margin:0;font-size:12px;color:var(--color-muted-foreground)">Select replacement from inventory</p>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:20px 24px">
                <!-- Original medicine being replaced -->
                <p id="altMedOriginal" style="font-size:12px;color:var(--color-muted-foreground);margin:0 0 14px;padding:8px 12px;background:var(--color-background);border-radius:6px;border:1px solid var(--color-border)"></p>

                <!-- Inventory search -->
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;display:block">Search Inventory <span style="color:#ef4444">*</span></label>
                <div style="position:relative" id="altMedSearchWrap">
                    <input type="text" id="altMedSearch" autocomplete="off" placeholder="Type medicine name or generic..." style="width:100%;padding:10px 38px 10px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-family:inherit;outline:none;background:var(--color-background);color:var(--color-foreground);box-sizing:border-box">
                    <i data-lucide="search" style="position:absolute;right:11px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--color-muted-foreground);pointer-events:none"></i>
                    <!-- Dropdown results -->
                    <div id="altMedDropdown" style="display:none;position:absolute;top:calc(100% + 3px);left:0;right:0;background:#fff;border:1px solid var(--color-border);border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.12);max-height:210px;overflow-y:auto;z-index:9999"></div>
                </div>

                <!-- Selected medicine info panel -->
                <div id="altMedInfo" style="display:none;margin-top:10px;padding:12px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px">
                    <div style="font-size:13px;font-weight:700;color:#15803d;margin-bottom:6px" id="altMedInfoName"></div>
                    <div style="display:flex;flex-wrap:wrap;gap:18px;font-size:12px;color:#166534">
                        <span>&#128230; Stock: <strong id="altMedInfoStock"></strong></span>
                        <span>&#128176; Price: <strong id="altMedInfoPrice"></strong></span>
                        <span id="altMedInfoStatus"></span>
                    </div>
                </div>

                <p id="altMedError" style="color:#ef4444;font-size:12px;margin:8px 0 0;display:none">Please select a medicine from the inventory list.</p>
            </div>
            <div class="modal-footer" style="border-top:1px solid var(--color-border);padding:14px 24px;gap:8px">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal" style="font-size:13px;border-radius:8px">Cancel</button>
                <button type="button" id="altMedConfirmBtn" style="padding:8px 20px;background:#3b82f6;border:none;border-radius:8px;font-size:13px;font-weight:600;color:#fff;cursor:pointer">
                    <i data-lucide="check" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i> Confirm
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Hold Reason Modal -->
<div class="modal fade" id="holdReasonModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" style="max-width:440px">
        <div class="modal-content" style="border-radius:14px;border:1px solid var(--color-border)">
            <div class="modal-header" style="border-bottom:1px solid var(--color-border);padding:18px 24px">
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;border-radius:8px;background:#FFF7ED;display:flex;align-items:center;justify-content:center">
                        <i data-lucide="pause-circle" style="width:18px;height:18px;color:#f97316"></i>
                    </div>
                    <div>
                        <h5 style="margin:0;font-size:15px;font-weight:700">Hold Order</h5>
                        <p style="margin:0;font-size:12px;color:var(--color-muted-foreground)">Provide a reason for placing this order on hold</p>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:20px 24px">
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;display:block">Hold Reason <span style="color:#ef4444">*</span></label>
                <textarea id="holdReasonText" rows="3" placeholder="e.g. Awaiting patient consent, stock issue, doctor clarification needed..." style="width:100%;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;resize:vertical;font-family:inherit;outline:none;background:var(--color-background);color:var(--color-foreground)"></textarea>
                <p id="holdReasonError" style="color:#ef4444;font-size:12px;margin:4px 0 0;display:none">Please enter a reason before placing on hold.</p>
            </div>
            <div class="modal-footer" style="border-top:1px solid var(--color-border);padding:14px 24px;gap:8px">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal" style="font-size:13px;border-radius:8px">Cancel</button>
                <button type="button" id="holdReasonConfirmBtn" style="padding:8px 20px;background:#f97316;border:none;border-radius:8px;font-size:13px;font-weight:600;color:#fff;cursor:pointer">
                    <i data-lucide="pause-circle" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i> Confirm Hold
                </button>
            </div>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script src="{{ asset('js/pharmacy-medication-orders.js') }}?v={{ filemtime(public_path('js/pharmacy-medication-orders.js')) }}"></script>
@endpush
