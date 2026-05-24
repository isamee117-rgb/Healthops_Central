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
</style>

{{-- ── Page Header ─────────────────────────────────────────────────────────── --}}
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="warehouse" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Inventory Management</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Manage medicine stock, batches, expiry &amp; locations</p>
        </div>
    </div>
    <button id="btnAddMedicine" style="display:flex;align-items:center;gap:8px;background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:10px;font-size:14px;font-weight:600;padding:10px 20px;cursor:pointer;font-family:'Roobert',sans-serif;transition:opacity 0.15s" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
        <i data-lucide="plus" style="width:18px;height:18px"></i> Add Medicine
    </button>
</div>

{{-- ── Stats Row ────────────────────────────────────────────────────────────── --}}
<div id="invStatsRow" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:20px">
    <div class="inv-stat-card" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--color-muted-foreground);font-weight:500">Total Medicines</span>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(127,255,212,0.12);display:flex;align-items:center;justify-content:center"><i data-lucide="pill" style="width:18px;height:18px;color:var(--aquamint)"></i></div>
        </div>
        <div id="statTotalMedicines" style="font-size:28px;font-weight:700;color:var(--color-foreground);font-family:'Roobert',sans-serif">--</div>
    </div>
    <div class="inv-stat-card" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--color-muted-foreground);font-weight:500">Out of Stock</span>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="package-x" style="width:18px;height:18px;color:#ef4444"></i></div>
        </div>
        <div id="statOutOfStock" style="font-size:28px;font-weight:700;color:#ef4444;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div class="inv-stat-card" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--color-muted-foreground);font-weight:500">Low Stock</span>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(249,115,22,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="alert-triangle" style="width:18px;height:18px;color:#f97316"></i></div>
        </div>
        <div id="statLowStock" style="font-size:28px;font-weight:700;color:#f97316;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div class="inv-stat-card" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--color-muted-foreground);font-weight:500">Expiring Soon</span>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(234,179,8,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="clock" style="width:18px;height:18px;color:#eab308"></i></div>
        </div>
        <div id="statExpiringSoon" style="font-size:28px;font-weight:700;color:#eab308;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div class="inv-stat-card" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--color-muted-foreground);font-weight:500">Stock Value</span>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="banknote" style="width:18px;height:18px;color:#22c55e"></i></div>
        </div>
        <div id="statStockValue" style="font-size:28px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
</div>

{{-- ── Toolbar ──────────────────────────────────────────────────────────────── --}}
<div class="opd-toolbar">
    <div class="opd-search-wrap">
        <i data-lucide="search" class="opd-search-icon"></i>
        <input type="text" class="opd-search-input" id="invSearch" placeholder="Search medicine name, code, manufacturer...">
    </div>
    <div class="opd-toolbar-right">
        {{-- Filter --}}
        <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnInvFilter" onclick="toggleInvFilter()" title="Filter">
            <i data-lucide="filter"></i>
            <span class="opd-filter-badge" id="invFilterBadge" style="display:none">0</span>
        </button>
        {{-- Rows per page --}}
        <div class="opd-rows-wrap">
            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleInvRowsMenu(event)" title="Rows per page">
                <i data-lucide="layout-list"></i>
            </button>
            <div class="opd-rows-menu" id="invRowsMenu">
                <div class="opd-rows-head">Rows per page</div>
                <button onclick="setInvRowsPer(10)" class="active">10 rows</button>
                <button onclick="setInvRowsPer(20)">20 rows</button>
                <button onclick="setInvRowsPer(50)">50 rows</button>
                <button onclick="setInvRowsPer(100)">100 rows</button>
            </div>
        </div>
        {{-- Column visibility --}}
        <div class="opd-col-vis-wrap">
            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleInvColVis(event)" title="Column visibility">
                <i data-lucide="columns-3"></i>
            </button>
            <div class="opd-col-vis-menu" id="invColVisMenu">
                <div class="opd-col-vis-head">
                    <span>Column Visibility</span>
                    <button class="opd-col-vis-selall" type="button" onclick="invColVisSelectAll()">Select All</button>
                </div>
                <div class="opd-col-vis-list" id="invColVisList">
                    <label><input type="checkbox" data-col="0" checked> Code</label>
                    <label><input type="checkbox" data-col="1" checked> Medicine Name</label>
                    <label><input type="checkbox" data-col="2" checked> Form</label>
                    <label><input type="checkbox" data-col="3" checked> Category</label>
                    <label><input type="checkbox" data-col="4" checked> Manufacturer</label>
                    <label><input type="checkbox" data-col="5" checked> Stock</label>
                    <label><input type="checkbox" data-col="6" checked> Min/Max</label>
                    <label><input type="checkbox" data-col="7" checked> Status</label>
                    <label><input type="checkbox" data-col="8" checked> Price</label>
                    <label><input type="checkbox" data-col="9" checked> Batches</label>
                    <label><input type="checkbox" data-col="10" checked> Nearest Expiry</label>
                    <label><input type="checkbox" data-col="11" checked> Actions</label>
                </div>
                <div class="opd-col-vis-foot">
                    <button class="opd-col-vis-save" type="button" onclick="applyInvColVis()">Save</button>
                </div>
            </div>
        </div>
        {{-- Export --}}
        <div class="opd-export-wrap">
            <button class="opd-tool-btn" type="button" onclick="toggleInvExportMenu(event)" title="Export" style="padding:0 10px">
                <i data-lucide="upload"></i>
                <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
            </button>
            <div class="opd-export-menu" id="invExportMenu">
                <button onclick="exportInv('excel')"><i data-lucide="table-2"></i> Excel (.xls)</button>
                <button onclick="exportInv('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                <button onclick="exportInv('pdf')"><i data-lucide="file-text"></i> PDF</button>
                <button onclick="exportInv('print')"><i data-lucide="printer"></i> Print</button>
            </div>
        </div>
    </div>
</div>

{{-- ── Filter Pane ───────────────────────────────────────────────────────────── --}}
<div class="opd-filter-pane" id="invFilterPane" style="display:none">
    <div class="opd-filter-pane-head">
        <div style="display:flex;align-items:center;gap:8px">
            <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
            <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
        </div>
        <button class="opd-filter-close" onclick="toggleInvFilter()" type="button">
            <i data-lucide="x"></i>
        </button>
    </div>
    <div class="opd-filter-pane-body">
        <div class="opd-filter-field">
            <label class="opd-filter-label">Category</label>
            <select class="opd-filter-select" id="filterCategory">
                <option value="">All Categories</option>
            </select>
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Form</label>
            <select class="opd-filter-select" id="filterForm">
                <option value="">All Forms</option>
            </select>
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Stock Status</label>
            <select class="opd-filter-select" id="filterStockStatus">
                <option value="">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
            </select>
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">ABC Class</label>
            <select class="opd-filter-select" id="filterAbc">
                <option value="">All Classes</option>
                <option value="A">A (Fast Moving)</option>
                <option value="B">B (Medium Moving)</option>
                <option value="C">C (Slow Moving)</option>
            </select>
        </div>
    </div>
    <div class="opd-filter-pane-foot">
        <button class="opd-filter-reset" type="button" onclick="resetInvFilters()">
            <i data-lucide="rotate-ccw"></i> Reset
        </button>
        <button class="opd-filter-apply" type="button" onclick="applyInvFilters()">
            <i data-lucide="check"></i> Apply Filters
        </button>
    </div>
</div>

{{-- ── Table ─────────────────────────────────────────────────────────────────── --}}
<div class="data-table-wrapper">
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse" id="invTable">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Code</th>
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Medicine Name</th>
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Form</th>
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Category</th>
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Manufacturer</th>
                    <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Stock</th>
                    <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Min/Max</th>
                    <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Status</th>
                    <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Price</th>
                    <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Batches</th>
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Nearest Expiry</th>
                    <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Actions</th>
                </tr>
            </thead>
            <tbody id="invTableBody">
                <tr><td colspan="12" style="padding:40px;text-align:center;color:var(--color-muted-foreground)">Loading...</td></tr>
            </tbody>
        </table>
    </div>
    <div class="opd-pagination" id="invPagination">
        <div class="opd-pagination-left">
            <div class="opd-page-info" id="invPageInfo">Showing — of — results</div>
        </div>
        <div class="opd-page-btns">
            <button class="opd-page-btn" id="invPrevPage" disabled><i data-lucide="chevron-left"></i></button>
            <div class="opd-page-nums" id="invPageNums"></div>
            <button class="opd-page-btn" id="invNextPage"><i data-lucide="chevron-right"></i></button>
        </div>
    </div>
</div>

{{-- ── Medicine Detail Offcanvas ─────────────────────────────────────────────── --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="medicineDetailSheet" style="width:680px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 id="medDetailTitle" class="offcanvas-title">Medicine Detail</h5>
            <p id="medDetailSub" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:0;display:flex;flex-direction:column;height:100%">
        <div style="display:flex;border-bottom:1px solid var(--color-border);background:var(--color-background);padding:0 24px;gap:0">
            <button class="med-tab-btn active" data-tab="overview" style="padding:12px 16px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid var(--aquamint);color:var(--aquamint);cursor:pointer">Overview</button>
            <button class="med-tab-btn" data-tab="batches" style="padding:12px 16px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Batches</button>
            <button class="med-tab-btn" data-tab="transactions" style="padding:12px 16px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Transactions</button>
            <button class="med-tab-btn" data-tab="analytics" style="padding:12px 16px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Analytics</button>
            <button class="med-tab-btn" data-tab="substitutes" style="padding:12px 16px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Substitutes</button>
        </div>
        <div id="medTabContent" style="flex:1;overflow-y:auto;padding:24px"></div>
    </div>
</div>

{{-- ── Stock Adjust Modal ────────────────────────────────────────────────────── --}}
<div class="modal fade" id="stockAdjustModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius:16px;border:1px solid var(--color-border);overflow:hidden">
            <div class="modal-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
                <h5 class="modal-title" style="font-size:16px;font-weight:700;font-family:'Roobert',sans-serif"><i data-lucide="sliders-horizontal" style="width:18px;height:18px;vertical-align:-3px;margin-right:8px;color:var(--aquamint)"></i>Adjust Stock</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:24px">
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Medicine</label>
                    <div id="adjMedicineName" style="font-size:14px;font-weight:600;color:var(--color-foreground)"></div>
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Current Stock</label>
                    <div id="adjCurrentStock" style="font-size:14px;font-weight:600;color:var(--color-foreground)"></div>
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:6px">Adjustment Type</label>
                    <div style="display:flex;gap:8px">
                        <label style="flex:1;display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px">
                            <input type="radio" name="adjType" value="increase" checked> <i data-lucide="plus-circle" style="width:16px;height:16px;color:#22c55e"></i> Increase
                        </label>
                        <label style="flex:1;display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px">
                            <input type="radio" name="adjType" value="decrease"> <i data-lucide="minus-circle" style="width:16px;height:16px;color:#ef4444"></i> Decrease
                        </label>
                        <label style="flex:1;display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px">
                            <input type="radio" name="adjType" value="set"> <i data-lucide="refresh-cw" style="width:16px;height:16px;color:#3b82f6"></i> Set Exact
                        </label>
                    </div>
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Quantity</label>
                    <input type="number" id="adjQuantity" min="0" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;outline:none" placeholder="Enter quantity">
                </div>
                <div style="margin-bottom:16px;padding:12px;background:var(--color-background);border-radius:8px;display:flex;justify-content:space-between;align-items:center">
                    <span style="font-size:13px;color:var(--color-muted-foreground)">New Stock Level:</span>
                    <span id="adjNewStock" style="font-size:16px;font-weight:700;color:var(--color-foreground)">--</span>
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Reason *</label>
                    <select id="adjReason" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                        <option value="">Select reason...</option>
                        <option value="Physical Count Correction">Physical Count Correction</option>
                        <option value="Damaged Goods">Damaged Goods</option>
                        <option value="Lost/Stolen">Lost/Stolen</option>
                        <option value="Expired (not recorded)">Expired (not recorded)</option>
                        <option value="Transfer to Another Location">Transfer to Another Location</option>
                        <option value="System Error Correction">System Error Correction</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div id="adjOtherReasonWrap" style="margin-bottom:16px;display:none">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Specify Reason</label>
                    <input type="text" id="adjOtherReason" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none" placeholder="Enter reason">
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Notes</label>
                    <textarea id="adjNotes" rows="2" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;resize:vertical" placeholder="Optional notes..."></textarea>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--color-muted-foreground)">
                    <span>Adjusted By: <strong>Admin</strong></span>
                    <span id="adjDateTime"></span>
                </div>
            </div>
            <div class="modal-footer" style="padding:16px 24px;border-top:1px solid var(--color-border)">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" style="border-radius:8px;font-size:13px;padding:8px 20px">Cancel</button>
                <button type="button" id="btnConfirmAdjust" style="background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:8px;font-size:13px;font-weight:600;padding:8px 24px;cursor:pointer">Confirm Adjustment</button>
            </div>
        </div>
    </div>
</div>

{{-- ── Add Medicine Offcanvas ────────────────────────────────────────────────── --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="addMedicineSheet" style="width:700px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 class="offcanvas-title">Add New Medicine</h5>
            <p style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0">Fill in the medicine master details</p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <form id="addMedicineForm" autocomplete="off">
            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="info" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Basic Info
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Medicine Name *</label>
                        <input type="text" name="medicine_name" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. Paracetamol 500mg Tab">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Medicine Code</label>
                        <input type="text" name="medicine_code" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="Auto-generated if left blank">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Generic Name *</label>
                        <input type="text" name="generic_name" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. Paracetamol">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Brand Name *</label>
                        <input type="text" name="brand_name" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. Panadol">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Medicine Type *</label>
                        <select name="medicine_type" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select type...</option>
                            <option value="Tablet">Tablet</option>
                            <option value="Capsule">Capsule</option>
                            <option value="Syrup">Syrup</option>
                            <option value="Injection">Injection</option>
                            <option value="Inhaler">Inhaler</option>
                            <option value="Cream">Cream</option>
                            <option value="Ointment">Ointment</option>
                            <option value="Drops">Drops</option>
                            <option value="Powder">Powder</option>
                            <option value="Suppository">Suppository</option>
                            <option value="Patch">Patch</option>
                            <option value="Solution">Solution</option>
                            <option value="Suspension">Suspension</option>
                            <option value="Gel">Gel</option>
                            <option value="Spray">Spray</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Category / Therapeutic Class *</label>
                        <select name="category" id="addMedCategory" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select category...</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="flask-conical" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Composition &amp; Dosage
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Salt / Composition</label>
                        <input type="text" name="salt_composition" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. Paracetamol IP 500mg">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Strength / Dosage</label>
                        <input type="text" name="strength" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. 500mg">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Unit of Measurement</label>
                        <select name="unit_of_measurement" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                            <option value="mg">mg</option>
                            <option value="ml">ml</option>
                            <option value="g">g</option>
                            <option value="mcg">mcg</option>
                            <option value="IU">IU</option>
                            <option value="L">L</option>
                            <option value="units">units</option>
                        </select>
                    </div>
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Form *</label>
                        <select name="form" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select form...</option>
                            <option value="Oral">Oral</option>
                            <option value="Topical">Topical</option>
                            <option value="IV">IV (Intravenous)</option>
                            <option value="IM">IM (Intramuscular)</option>
                            <option value="SC">SC (Subcutaneous)</option>
                            <option value="Inhalation">Inhalation</option>
                            <option value="Rectal">Rectal</option>
                            <option value="Ophthalmic">Ophthalmic</option>
                            <option value="Otic">Otic</option>
                            <option value="Nasal">Nasal</option>
                            <option value="Sublingual">Sublingual</option>
                            <option value="Transdermal">Transdermal</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="package" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Stock &amp; Inventory
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">HSN Code</label>
                        <input type="text" name="hsn_code" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. 3004">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Unit of Purchase</label>
                        <select name="unit_of_purchase" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                            <option value="strips">Strips</option>
                            <option value="bottles">Bottles</option>
                            <option value="boxes">Boxes</option>
                            <option value="vials">Vials</option>
                            <option value="ampoules">Ampoules</option>
                            <option value="pieces">Pieces</option>
                            <option value="packs">Packs</option>
                            <option value="tubes">Tubes</option>
                            <option value="sachets">Sachets</option>
                            <option value="units">Units</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Unit of Sale</label>
                        <select name="unit_of_sale" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                            <option value="strips">Strips</option>
                            <option value="bottles">Bottles</option>
                            <option value="boxes">Boxes</option>
                            <option value="vials">Vials</option>
                            <option value="ampoules">Ampoules</option>
                            <option value="pieces">Pieces</option>
                            <option value="packs">Packs</option>
                            <option value="tubes">Tubes</option>
                            <option value="sachets">Sachets</option>
                            <option value="units">Units</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Reorder Level</label>
                        <input type="number" name="reorder_level" min="0" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. 50">
                    </div>
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Shelf Location</label>
                        <input type="text" name="shelf_location" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. Shelf A3, Bin 12-15">
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="shield-check" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Regulatory
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Manufacturer Name</label>
                        <input type="text" name="manufacturer" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. GSK, Abbott, Pfizer">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Schedule Type</label>
                        <select name="schedule_type" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                            <option value="OTC">OTC (Over the Counter)</option>
                            <option value="Schedule H">Schedule H</option>
                            <option value="Schedule H1">Schedule H1</option>
                            <option value="Schedule X">Schedule X</option>
                            <option value="Schedule G">Schedule G</option>
                            <option value="Narcotic">Narcotic</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Requires Prescription</label>
                        <select name="requires_prescription" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="banknote" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Pricing
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Purchase Price (MRP) *</label>
                        <input type="number" name="purchase_price" required min="0" step="0.01" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="0.00">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Sale Price *</label>
                        <input type="number" name="selling_price" required min="0" step="0.01" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="0.00">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Tax / GST Category</label>
                        <select name="tax_gst_category" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                            <option value="GST 0%">GST 0%</option>
                            <option value="GST 5%">GST 5%</option>
                            <option value="GST 12%">GST 12%</option>
                            <option value="GST 18%">GST 18%</option>
                            <option value="GST 28%">GST 28%</option>
                            <option value="Exempt">Exempt</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="toggle-right" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Status
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Status</label>
                    <select name="is_active" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>
            </div>

            <div id="addMedError" style="display:none;padding:12px 16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:16px;color:#991B1B;font-size:13px"></div>
            <div id="addMedSuccess" style="display:none;padding:12px 16px;background:#DCFCE7;border:1px solid #BBF7D0;border-radius:8px;margin-bottom:16px;color:#166534;font-size:13px"></div>

            <div style="display:flex;justify-content:flex-end;gap:10px;padding-top:8px;border-top:1px solid var(--color-border)">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas" style="border-radius:8px;font-size:13px;padding:10px 24px">Cancel</button>
                <button type="submit" id="btnSaveMedicine" style="background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:8px;font-size:13px;font-weight:600;padding:10px 28px;cursor:pointer;display:flex;align-items:center;gap:6px">
                    <i data-lucide="save" style="width:16px;height:16px"></i> Save Medicine
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="{{ asset('js/pharmacy-inventory.js') }}?v={{ filemtime(public_path('js/pharmacy-inventory.js')) }}"></script>
@endpush
