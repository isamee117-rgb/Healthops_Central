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
.opd-export-wrap{position:relative}
.opd-export-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:200;min-width:180px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px}
.opd-export-menu.open{display:block}
.opd-export-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:none;font-size:13.5px;font-weight:500;color:var(--color-foreground);cursor:pointer;border-radius:7px;text-align:left;transition:background .12s}
.opd-export-menu button:hover{background:var(--color-muted)}
.opd-export-menu button i{width:15px;height:15px;color:var(--color-muted-foreground);flex-shrink:0}
.opd-rows-wrap{position:relative}
.opd-rows-menu{display:none;position:absolute;left:0;top:calc(100% + 6px);z-index:200;min-width:140px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px}
.opd-rows-menu.open{display:block}
.opd-rows-head{padding:8px 10px 6px;font-size:11px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--color-border);margin-bottom:4px}
.opd-rows-menu button{display:flex;align-items:center;width:100%;padding:8px 10px;border:none;background:none;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer;border-radius:7px;text-align:left;transition:background .1s}
.opd-rows-menu button:hover,.opd-rows-menu button.active{background:var(--color-muted)}
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
.data-table{width:100%;border-collapse:collapse;font-size:13.5px}
.data-table thead tr{background:var(--color-background);border-bottom:2px solid var(--color-border)}
.data-table thead th{padding:11px 14px;font-size:11.5px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}
.data-table tbody tr{border-bottom:1px solid var(--color-border);transition:background .12s}
.data-table tbody tr:last-child{border-bottom:none}
.data-table tbody tr:hover{background:var(--color-muted)}
.data-table tbody td{padding:11px 14px;color:var(--color-foreground);vertical-align:middle}
.data-table .text-center{text-align:center}
.data-table .text-right{text-align:right}
.font-mono{font-family:monospace}
</style>

{{-- ── Page Header ────────────────────────────────────────────────────────── --}}
<div class="module-header">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="package-check" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h1 style="margin:0">Dispensing & Fulfillment</h1>
            <p class="module-subtitle">Process and fulfill verified medication orders</p>
        </div>
    </div>
    <div class="module-header-actions">
        <div class="btn-group" role="group" id="viewToggle">
            <button type="button" class="btn btn-sm active" data-view="list" style="border:1px solid var(--color-border);background:var(--aquamint);color:#003366;font-size:13px;padding:6px 14px;border-radius:6px 0 0 6px">
                <i data-lucide="list" style="width:14px;height:14px;margin-right:4px"></i> List
            </button>
            <button type="button" class="btn btn-sm" data-view="kanban" style="border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);font-size:13px;padding:6px 14px">
                <i data-lucide="columns-3" style="width:14px;height:14px;margin-right:4px"></i> Kanban
            </button>
            <button type="button" class="btn btn-sm" data-view="department" style="border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);font-size:13px;padding:6px 14px;border-radius:0 6px 6px 0">
                <i data-lucide="building-2" style="width:14px;height:14px;margin-right:4px"></i> By Dept
            </button>
        </div>
        <button class="btn-primary" id="btnRefresh" onclick="DispensingApp.refresh()">
            <i data-lucide="refresh-cw"></i> Refresh
        </button>
    </div>
</div>

{{-- ── Stat Tiles ──────────────────────────────────────────────────────────── --}}
<div class="mini-stats">
    <div class="mini-stat-card">
        <div class="mini-stat-inner">
            <div>
                <p class="mini-stat-label">Awaiting Dispensing</p>
                <h3 class="mini-stat-value" style="color:#e67e22" id="statAwaiting">--</h3>
            </div>
            <div class="mini-stat-icon" style="background:rgba(230,126,34,0.1)"><i data-lucide="clock" style="color:#e67e22"></i></div>
        </div>
    </div>
    <div class="mini-stat-card">
        <div class="mini-stat-inner">
            <div>
                <p class="mini-stat-label">In Progress</p>
                <h3 class="mini-stat-value" style="color:#3498db" id="statInProgress">--</h3>
            </div>
            <div class="mini-stat-icon" style="background:rgba(52,152,219,0.1)"><i data-lucide="loader" style="color:#3498db"></i></div>
        </div>
    </div>
    <div class="mini-stat-card">
        <div class="mini-stat-inner">
            <div>
                <p class="mini-stat-label">Completed Orders</p>
                <h3 class="mini-stat-value" style="color:#27ae60" id="statReady">--</h3>
            </div>
            <div class="mini-stat-icon" style="background:rgba(39,174,96,0.1)"><i data-lucide="check-circle" style="color:#27ae60"></i></div>
        </div>
    </div>
    <div class="mini-stat-card">
        <div class="mini-stat-inner">
            <div>
                <p class="mini-stat-label">Completed Today</p>
                <h3 class="mini-stat-value" style="color:var(--color-foreground)" id="statCompleted">--</h3>
            </div>
            <div class="mini-stat-icon" style="background:rgba(127,255,212,0.15)"><i data-lucide="package-check" style="color:var(--aquamint)"></i></div>
        </div>
    </div>
</div>

{{-- ── Toolbar ─────────────────────────────────────────────────────────────── --}}
<div class="opd-toolbar" id="dispToolbar">
    <div class="opd-search-wrap">
        <i data-lucide="search" class="opd-search-icon"></i>
        <input type="text" class="opd-search-input" id="dispSearch" placeholder="Search by Order ID, Patient, MRN...">
    </div>
    <div class="opd-toolbar-right">
        {{-- Filter --}}
        <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnDispFilter" onclick="toggleDispFilter()" title="Filter">
            <i data-lucide="filter"></i>
            <span class="opd-filter-badge" id="dispFilterBadge" style="display:none">0</span>
        </button>
        {{-- Rows per page --}}
        <div class="opd-rows-wrap">
            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleDispRowsMenu(event)" title="Rows per page">
                <i data-lucide="layout-list"></i>
            </button>
            <div class="opd-rows-menu" id="dispRowsMenu">
                <div class="opd-rows-head">Rows per page</div>
                <button onclick="setDispRowsPer(10)" class="active">10 rows</button>
                <button onclick="setDispRowsPer(20)">20 rows</button>
                <button onclick="setDispRowsPer(50)">50 rows</button>
                <button onclick="setDispRowsPer(100)">100 rows</button>
            </div>
        </div>
        {{-- Column visibility --}}
        <div class="opd-col-vis-wrap">
            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleDispColVis(event)" title="Column visibility">
                <i data-lucide="columns-3"></i>
            </button>
            <div class="opd-col-vis-menu" id="dispColVisMenu">
                <div class="opd-col-vis-head">
                    <span>Column Visibility</span>
                    <button class="opd-col-vis-selall" type="button" onclick="dispColVisSelectAll()">Select All</button>
                </div>
                <div class="opd-col-vis-list" id="dispColVisList">
                    <label><input type="checkbox" data-col="0" checked> Order ID</label>
                    <label><input type="checkbox" data-col="1" checked> Order Time</label>
                    <label><input type="checkbox" data-col="2" checked> MRN</label>
                    <label><input type="checkbox" data-col="3" checked> Patient Name</label>
                    <label><input type="checkbox" data-col="4" checked> Department</label>
                    <label><input type="checkbox" data-col="5" checked> Priority</label>
                    <label><input type="checkbox" data-col="6" checked> Items</label>
                    <label><input type="checkbox" data-col="7" checked> Value</label>
                    <label><input type="checkbox" data-col="8" checked> Status</label>
                    <label><input type="checkbox" data-col="9" checked> Action</label>
                </div>
                <div class="opd-col-vis-foot">
                    <button class="opd-col-vis-save" type="button" onclick="applyDispColVis()">Apply</button>
                </div>
            </div>
        </div>
        {{-- Export --}}
        <div class="opd-export-wrap">
            <button class="opd-tool-btn" type="button" onclick="toggleDispExportMenu(event)">
                <i data-lucide="download"></i> Export
            </button>
            <div class="opd-export-menu" id="dispExportMenu">
                <button onclick="exportDisp('excel')"><i data-lucide="file-spreadsheet"></i> Excel</button>
                <button onclick="exportDisp('csv')"><i data-lucide="file-text"></i> CSV</button>
                <button onclick="exportDisp('pdf')"><i data-lucide="file-type"></i> PDF</button>
                <button onclick="exportDisp('print')"><i data-lucide="printer"></i> Print</button>
            </div>
        </div>
    </div>
</div>

{{-- ── Filter Pane ─────────────────────────────────────────────────────────── --}}
<div class="opd-filter-pane" id="dispFilterPane" style="display:none">
    <div class="opd-filter-pane-head">
        <span style="font-size:13px;font-weight:700;color:var(--color-foreground)">
            <i data-lucide="sliders-horizontal" style="width:14px;height:14px;margin-right:6px;vertical-align:-2px"></i> Filters
        </span>
        <button class="opd-filter-close" onclick="toggleDispFilter()"><i data-lucide="x"></i></button>
    </div>
    <div class="opd-filter-pane-body">
        <div class="opd-filter-field">
            <label class="opd-filter-label">Status</label>
            <select id="filterStatus" class="opd-filter-select">
                <option value="">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Dispensing">Dispensing</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
            </select>
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Department</label>
            <select id="filterDept" class="opd-filter-select">
                <option value="">All Departments</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Emergency">Emergency</option>
                <option value="OT">OT</option>
            </select>
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Priority</label>
            <select id="filterPriority" class="opd-filter-select">
                <option value="">All Priority</option>
                <option value="STAT">STAT</option>
                <option value="Urgent">Urgent</option>
                <option value="Routine">Routine</option>
            </select>
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Date From</label>
            <input type="date" id="dispDateFrom" class="opd-filter-input">
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Date To</label>
            <input type="date" id="dispDateTo" class="opd-filter-input">
        </div>
    </div>
    <div class="opd-filter-pane-foot">
        <button class="opd-filter-reset" onclick="resetDispFilters()">
            <i data-lucide="rotate-ccw"></i> Reset
        </button>
        <button class="opd-filter-apply" onclick="applyDispFilters()">
            <i data-lucide="check"></i> Apply Filters
        </button>
    </div>
</div>

{{-- ── List View ───────────────────────────────────────────────────────────── --}}
<div id="listView">
    <div class="data-table-wrapper">
        <div style="overflow-x:auto">
            <table class="data-table" id="dispTable">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Order Time</th>
                        <th>MRN</th>
                        <th>Patient Name</th>
                        <th class="text-center">Department</th>
                        <th class="text-center">Priority</th>
                        <th class="text-center">Items</th>
                        <th class="text-right">Value</th>
                        <th class="text-center">Status</th>
                        <th class="text-center">Action</th>
                    </tr>
                </thead>
                <tbody id="queueTableBody">
                    <tr><td colspan="10" style="text-align:center;padding:40px;color:var(--color-muted-foreground)">Loading dispensing queue...</td></tr>
                </tbody>
            </table>
        </div>
        <div class="opd-pagination">
            <div class="opd-pagination-left">
                <span class="opd-page-info" id="dispPageInfo">Showing 0 of 0</span>
            </div>
            <div class="opd-page-btns">
                <button class="opd-page-btn" id="dispPrevBtn" onclick="dispChangePage(-1)" disabled>
                    <i data-lucide="chevron-left"></i>
                </button>
                <div class="opd-page-nums" id="dispPageNums"></div>
                <button class="opd-page-btn" id="dispNextBtn" onclick="dispChangePage(1)">
                    <i data-lucide="chevron-right"></i>
                </button>
            </div>
        </div>
    </div>
</div>

{{-- ── Kanban View ─────────────────────────────────────────────────────────── --}}
<div id="kanbanView" style="display:none;padding:20px 0">
    <div class="row g-3">
        <div class="col-md-4">
            <div style="background:rgba(230,126,34,0.05);border-radius:10px;padding:12px;border:1px solid rgba(230,126,34,0.15)">
                <h6 style="font-size:13px;font-weight:600;color:#e67e22;margin-bottom:12px"><i data-lucide="clock" style="width:14px;height:14px;margin-right:4px"></i> Awaiting Dispensing</h6>
                <div id="kanbanVerified" class="kanban-column"></div>
            </div>
        </div>
        <div class="col-md-4">
            <div style="background:rgba(52,152,219,0.05);border-radius:10px;padding:12px;border:1px solid rgba(52,152,219,0.15)">
                <h6 style="font-size:13px;font-weight:600;color:#3498db;margin-bottom:12px"><i data-lucide="loader" style="width:14px;height:14px;margin-right:4px"></i> Fulfillment In Progress</h6>
                <div id="kanbanDispensing" class="kanban-column"></div>
            </div>
        </div>
        <div class="col-md-4">
            <div style="background:rgba(39,174,96,0.05);border-radius:10px;padding:12px;border:1px solid rgba(39,174,96,0.15)">
                <h6 style="font-size:13px;font-weight:600;color:#27ae60;margin-bottom:12px"><i data-lucide="check-circle" style="width:14px;height:14px;margin-right:4px"></i> Completed Order</h6>
                <div id="kanbanReady" class="kanban-column"></div>
            </div>
        </div>
    </div>
</div>

{{-- ── Department View ──────────────────────────────────────────────────────── --}}
<div id="departmentView" style="display:none;padding:20px 0">
    <div id="departmentGroups"></div>
</div>

{{-- ── Dispensing Workstation Offcanvas ────────────────────────────────────── --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="workstationPanel" style="width:95vw;max-width:1400px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 24px;border-bottom:none">
        <div style="display:flex;align-items:center;gap:12px;width:100%">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(127,255,212,0.2);display:flex;align-items:center;justify-content:center">
                <i data-lucide="pill" style="width:20px;height:20px;color:var(--aquamint)"></i>
            </div>
            <div style="flex:1">
                <h5 style="font-size:16px;font-weight:600;margin:0;font-family:'Roobert',sans-serif" id="wsTitle">Dispensing Workstation</h5>
                <p style="font-size:12px;margin:2px 0 0;opacity:0.7" id="wsSubtitle"></p>
            </div>
            <div id="wsOrderBadges" style="display:flex;gap:8px"></div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
    </div>
    <div class="offcanvas-body" style="padding:0;background:var(--color-background)">
        <div style="padding:12px 24px;background:#fff;border-bottom:1px solid var(--color-border);display:flex;align-items:center;gap:16px">
            <div style="display:flex;align-items:center;gap:8px">
                <div id="wsPatientAvatar" style="width:36px;height:36px;border-radius:50%;background:var(--aquamint);display:flex;align-items:center;justify-content:center;font-weight:600;color:#003366;font-size:14px"></div>
                <div>
                    <span id="wsPatientName" style="font-weight:600;font-size:14px"></span>
                    <span id="wsPatientDetails" style="font-size:12px;color:var(--color-muted-foreground);margin-left:8px"></span>
                </div>
            </div>
            <div id="wsAllergyBadge" style="display:none;background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:4px 10px;font-size:12px;color:#dc2626">
                <i data-lucide="alert-triangle" style="width:12px;height:12px;margin-right:4px"></i>
                <span id="wsAllergyText"></span>
            </div>
            <div style="margin-left:auto;display:flex;gap:6px" id="wsSafetyChecks">
                <span class="safety-check" style="font-size:11px;padding:3px 8px;border-radius:4px;background:rgba(39,174,96,0.1);color:#27ae60"><i data-lucide="check" style="width:10px;height:10px"></i> Correct Patient</span>
                <span class="safety-check" style="font-size:11px;padding:3px 8px;border-radius:4px;background:rgba(39,174,96,0.1);color:#27ae60"><i data-lucide="check" style="width:10px;height:10px"></i> Correct Dose</span>
                <span class="safety-check" style="font-size:11px;padding:3px 8px;border-radius:4px;background:rgba(39,174,96,0.1);color:#27ae60"><i data-lucide="shield-check" style="width:10px;height:10px"></i> Safety Verified</span>
            </div>
        </div>

        <div style="display:flex;height:calc(100vh - 200px);overflow:hidden">
            <div style="flex:1;padding:20px;overflow-y:auto" id="wsLeftPanel">
                <h6 style="font-size:14px;font-weight:600;margin-bottom:16px;font-family:'Roobert',sans-serif">
                    <i data-lucide="pill" style="width:16px;height:16px;margin-right:6px;color:var(--aquamint)"></i> Medication Dispensing
                </h6>
                <div id="wsItemCards"></div>
            </div>
        </div>

        <div style="background:#fff;border-top:1px solid var(--color-border);padding:14px 24px;position:sticky;bottom:0">
            <div style="display:flex;align-items:center;justify-content:space-between">
                <div style="display:flex;gap:20px;font-size:13px">
                    <span>Total Items: <strong id="wsSummaryTotal">0</strong></span>
                    <span>Dispensed: <strong id="wsSummaryDispensed" style="color:#27ae60">0/0</strong></span>
                    <span>Total Value: <strong id="wsSummaryValue" style="color:#003366">PKR 0</strong></span>
                    <span id="wsSummaryStock" style="color:#27ae60"><i data-lucide="check" style="width:12px;height:12px"></i> Stock Updated</span>
                    <span id="wsSummaryLabels"><i data-lucide="printer" style="width:12px;height:12px"></i> Labels: <strong>0/0</strong></span>
                </div>
                <div style="display:flex;gap:8px">
                    <button class="btn btn-sm" onclick="DispensingApp.cancelDispensing()" style="border:1px solid #e74c3c;color:#e74c3c;background:#fff;font-size:13px;padding:6px 16px;border-radius:6px">Cancel</button>
                    <button class="btn btn-sm" onclick="DispensingApp.saveProgress()" style="border:1px solid var(--color-border);color:var(--color-foreground);background:#fff;font-size:13px;padding:6px 16px;border-radius:6px">
                        <i data-lucide="save" style="width:14px;height:14px;margin-right:4px"></i> Save Progress
                    </button>
                    <button class="btn btn-sm" onclick="DispensingApp.printAllLabels()" style="border:1px solid var(--color-border);color:var(--color-foreground);background:#fff;font-size:13px;padding:6px 16px;border-radius:6px">
                        <i data-lucide="printer" style="width:14px;height:14px;margin-right:4px"></i> Print All Labels
                    </button>
                    <button class="btn btn-sm" id="btnComplete" onclick="DispensingApp.completeDispensing()" disabled style="background:var(--aquamint);color:#003366;font-size:13px;font-weight:600;padding:6px 20px;border-radius:6px;border:none;opacity:0.5">
                        <i data-lucide="check-circle" style="width:14px;height:14px;margin-right:4px"></i> Complete Dispensing
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- ── Label Modal ─────────────────────────────────────────────────────────── --}}
<div class="modal fade" id="labelModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered" style="max-width:380px">
        <div class="modal-content" style="border-radius:12px;border:none">
            <div class="modal-header" style="background:var(--midnight-blue);color:#fff;border-radius:12px 12px 0 0;padding:12px 20px">
                <h6 class="modal-title" style="font-size:14px;font-weight:600"><i data-lucide="printer" style="width:16px;height:16px;margin-right:6px"></i> Medicine Label</h6>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:0">
                <div id="labelContent" style="font-family:'Courier New',monospace;font-size:13px;padding:20px;border:2px dashed #ccc;margin:16px;border-radius:8px;background:#fafafa"></div>
            </div>
            <div class="modal-footer" style="border:none;padding:8px 16px 16px">
                <button class="btn btn-sm" data-bs-dismiss="modal" style="border:1px solid var(--color-border);font-size:13px;border-radius:6px">Close</button>
                <button class="btn btn-sm" onclick="window.print()" style="background:var(--aquamint);color:#003366;font-size:13px;font-weight:600;border:none;border-radius:6px">
                    <i data-lucide="printer" style="width:14px;height:14px;margin-right:4px"></i> Print
                </button>
            </div>
        </div>
    </div>
</div>

<style>
.kanban-column { min-height: 200px; }
.kanban-card {
    background: #fff; border-radius: 8px; padding: 12px; margin-bottom: 8px;
    border: 1px solid var(--color-border); cursor: pointer; transition: box-shadow 0.2s;
}
.kanban-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.dispensing-item-card {
    background: #fff; border-radius: 10px; border: 1px solid var(--color-border);
    margin-bottom: 12px; overflow: hidden; transition: all 0.2s;
}
.dispensing-item-card.dispensed { border-color: #27ae60; background: rgba(39,174,96,0.03); }
.dispensing-item-card .card-header-row {
    padding: 14px 16px; display: flex; align-items: center; gap: 12px;
    cursor: pointer; user-select: none;
}
.dispensing-item-card .card-body-content { padding: 0 16px 16px; }
.counseling-check { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 13px; }
.counseling-check input { width: 16px; height: 16px; cursor: pointer; }
.counseling-check label { cursor: pointer; flex: 1; }
.dept-group-section { margin-bottom: 20px; }
.dept-group-header {
    font-size: 14px; font-weight: 600; padding: 10px 16px; background: var(--color-background);
    border-radius: 8px; margin-bottom: 8px; font-family: 'Roobert', sans-serif;
}
.expiry-warning { background: #fef3cd; color: #856404; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
.expiry-ok { background: rgba(39,174,96,0.1); color: #27ae60; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
</style>
@endsection

@push('scripts')
<script src="{{ asset('js/pharmacy-dispensing.js') }}?v={{ filemtime(public_path('js/pharmacy-dispensing.js')) }}"></script>
@endpush
