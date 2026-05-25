@extends('layouts.app')

@section('content')
<style>
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

<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="receipt" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Billing & Financial Reconciliation</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Track pharmacy revenue, reconcile transactions, manage payments</p>
        </div>
    </div>
    <div style="display:flex;gap:8px">
        <button id="btnCashRecon" style="display:flex;align-items:center;gap:6px;padding:9px 16px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer"><i data-lucide="calculator" style="width:15px;height:15px"></i> Cash Reconciliation</button>
    </div>
</div>

<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Today's Sales</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="trending-up" style="width:16px;height:16px;color:#22c55e"></i></div>
        </div>
        <div id="statTodaySales" style="font-size:22px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Pending Payments</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(249,115,22,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="clock" style="width:16px;height:16px;color:#f97316"></i></div>
        </div>
        <div id="statPending" style="font-size:22px;font-weight:700;color:#f97316;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Outstanding IPD</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(234,179,8,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="bed-double" style="width:16px;height:16px;color:#eab308"></i></div>
        </div>
        <div id="statIPD" style="font-size:22px;font-weight:700;color:#eab308;font-family:'Roobert',sans-serif">--</div>
    </div>
</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Panel Outstanding</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(234,179,8,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="building-2" style="width:16px;height:16px;color:#eab308"></i></div>
        </div>
        <div id="statPanel" style="font-size:22px;font-weight:700;color:#eab308;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px;border-left:3px solid #dc2626">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Outstanding ER</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(220,38,38,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="siren" style="width:16px;height:16px;color:#dc2626"></i></div>
        </div>
        <div id="statER" style="font-size:22px;font-weight:700;color:#dc2626;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Cash Sales</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="banknote" style="width:16px;height:16px;color:#22c55e"></i></div>
        </div>
        <div id="statCash" style="font-size:22px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Card Sales</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="credit-card" style="width:16px;height:16px;color:#22c55e"></i></div>
        </div>
        <div id="statCard" style="font-size:22px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border)">
            <span style="font-size:14px;font-weight:700;font-family:'Roobert',sans-serif">Revenue by Department</span>
            <div style="display:flex;gap:4px">
                <button class="rev-period-btn active" data-period="today" style="padding:4px 12px;border-radius:6px;border:1px solid var(--color-border);font-size:11px;font-weight:500;cursor:pointer;background:var(--aquamint);color:var(--midnight-blue)">Today</button>
                <button class="rev-period-btn" data-period="month" style="padding:4px 12px;border-radius:6px;border:1px solid var(--color-border);font-size:11px;font-weight:500;cursor:pointer;background:#fff">This Month</button>
            </div>
        </div>
        <div id="revDeptContent" style="padding:16px 20px"></div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
        <div style="padding:16px 20px;border-bottom:1px solid var(--color-border)">
            <span style="font-size:14px;font-weight:700;font-family:'Roobert',sans-serif">Revenue by Payment Category</span>
        </div>
        <div id="revPayContent" style="padding:16px 20px"></div>
    </div>
</div>

{{-- ── OPD Toolbar ──────────────────────────────────────────────────────────── --}}
<div class="opd-toolbar">
    <div class="opd-search-wrap">
        <i data-lucide="search" class="opd-search-icon"></i>
        <input type="text" class="opd-search-input" id="txnSearch" placeholder="Search transaction ID, patient, order...">
    </div>
    <div class="opd-toolbar-right">
        <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnTxnFilter" onclick="toggleTxnFilter()" title="Filter">
            <i data-lucide="filter"></i>
            <span class="opd-filter-badge" id="txnFilterBadge" style="display:none">0</span>
        </button>
        <div class="opd-rows-wrap">
            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleTxnRowsMenu(event)" title="Rows per page">
                <i data-lucide="layout-list"></i>
            </button>
            <div class="opd-rows-menu" id="txnRowsMenu">
                <div class="opd-rows-head">Rows per page</div>
                <button onclick="setTxnRowsPer(10)" class="active">10 rows</button>
                <button onclick="setTxnRowsPer(20)">20 rows</button>
                <button onclick="setTxnRowsPer(50)">50 rows</button>
                <button onclick="setTxnRowsPer(100)">100 rows</button>
            </div>
        </div>
        <div class="opd-col-vis-wrap">
            <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleTxnColVis(event)" title="Column visibility">
                <i data-lucide="columns-3"></i>
            </button>
            <div class="opd-col-vis-menu" id="txnColVisMenu">
                <div class="opd-col-vis-head">
                    <span>Columns</span>
                    <button class="opd-col-vis-selall" type="button" onclick="txnColVisSelectAll()">Select All</button>
                </div>
                <div class="opd-col-vis-list" id="txnColVisList">
                    <label><input type="checkbox" data-col="0" checked> Transaction ID</label>
                    <label><input type="checkbox" data-col="1" checked> Date/Time</label>
                    <label><input type="checkbox" data-col="2" checked> Patient Name</label>
                    <label><input type="checkbox" data-col="3" checked> Department</label>
                    <label><input type="checkbox" data-col="4" checked> Order ID</label>
                    <label><input type="checkbox" data-col="5" checked> Total</label>
                    <label><input type="checkbox" data-col="6" checked> Payment</label>
                    <label><input type="checkbox" data-col="7" checked> Status</label>
                    <label><input type="checkbox" data-col="8" checked> Billed To</label>
                    <label><input type="checkbox" data-col="9" checked> Reconciliation</label>
                </div>
                <div class="opd-col-vis-foot">
                    <button class="opd-col-vis-save" type="button" onclick="applyTxnColVis()">Save</button>
                </div>
            </div>
        </div>
        <div class="opd-export-wrap">
            <button class="opd-tool-btn" type="button" onclick="toggleTxnExportMenu(event)" style="padding:0 10px">
                <i data-lucide="upload"></i>
                <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
            </button>
            <div class="opd-export-menu" id="txnExportMenu">
                <button onclick="exportTxn('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                <button onclick="exportTxn('pdf')"><i data-lucide="file-text"></i> PDF</button>
                <button onclick="exportTxn('print')"><i data-lucide="printer"></i> Print</button>
            </div>
        </div>
    </div>
</div>

{{-- ── Filter Pane ──────────────────────────────────────────────────────────── --}}
<div class="opd-filter-pane" id="txnFilterPane" style="display:none">
    <div class="opd-filter-pane-head">
        <div style="display:flex;align-items:center;gap:8px">
            <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
            <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
        </div>
        <button class="opd-filter-close" onclick="toggleTxnFilter()" type="button">
            <i data-lucide="x"></i>
        </button>
    </div>
    <div class="opd-filter-pane-body">
        <div class="opd-filter-field">
            <label class="opd-filter-label">Department</label>
            <select class="opd-filter-select" id="txnDeptFilter">
                <option value="">All Departments</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Emergency">Emergency</option>
                <option value="OT">OT</option>
                <option value="Walk-in">Walk-in</option>
            </select>
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Status</label>
            <select class="opd-filter-select" id="txnStatusFilter">
                <option value="">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Voided">Voided</option>
            </select>
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Date From</label>
            <input type="date" class="opd-filter-input" id="txnDateFrom">
        </div>
        <div class="opd-filter-field">
            <label class="opd-filter-label">Date To</label>
            <input type="date" class="opd-filter-input" id="txnDateTo">
        </div>
    </div>
    <div class="opd-filter-pane-foot">
        <button class="opd-filter-reset" type="button" onclick="resetTxnFilters()">
            <i data-lucide="rotate-ccw"></i> Reset
        </button>
        <button class="opd-filter-apply" type="button" onclick="applyTxnFilters()">
            <i data-lucide="check"></i> Apply Filters
        </button>
    </div>
</div>

{{-- ── Billing Transactions Table ─────────────────────────────────────────────── --}}
<div class="data-table-wrapper" style="margin-bottom:24px">
    <div style="padding:12px 16px;border-bottom:1px solid var(--color-border)">
        <span style="font-size:14px;font-weight:700;color:var(--color-foreground)">Billing Transactions</span>
    </div>
    <div style="overflow-x:auto">
        <table class="data-table" id="tblTransactions" style="display:none">
            <thead>
                <tr>
                    <th>Transaction ID</th>
                    <th>Date/Time</th>
                    <th>Patient Name</th>
                    <th class="text-center">Department</th>
                    <th>Order ID</th>
                    <th class="text-right">Total</th>
                    <th class="text-center">Payment</th>
                    <th class="text-center">Status</th>
                    <th class="text-center">Billed To</th>
                    <th class="text-center">Reconciliation</th>
                </tr>
            </thead>
            <tbody id="tbodyTransactions"></tbody>
        </table>
    </div>
    <div id="txnEmpty" class="panel-notice is-hidden">
        <i data-lucide="inbox"></i>
        No transactions found.
    </div>
    <div id="txnLoading" class="panel-notice">Loading...</div>
    <div class="opd-pagination" id="txnPagination" style="display:none">
        <div class="opd-pagination-left">
            <div class="opd-page-info" id="txnPageInfo">Showing — of — results</div>
        </div>
        <div class="opd-page-btns">
            <button class="opd-page-btn" id="txnPrevPage" disabled><i data-lucide="chevron-left"></i></button>
            <div class="opd-page-nums" id="txnPageNums"></div>
            <button class="opd-page-btn" id="txnNextPage"><i data-lucide="chevron-right"></i></button>
        </div>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden;margin-bottom:24px">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border);background:#FFF7ED">
        <div style="display:flex;align-items:center;gap:8px">
            <i data-lucide="clock" style="width:16px;height:16px;color:#f97316"></i>
            <span style="font-size:14px;font-weight:700;color:#9a3412;font-family:'Roobert',sans-serif">OPD/Walk-in Pending</span>
        </div>
        <span id="pendingOpdTotal" style="font-size:13px;font-weight:600;color:#f97316"></span>
    </div>
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Patient</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Date</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Order</th>
                    <th style="padding:8px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Due</th>
                    <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Days</th>
                    <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                </tr>
            </thead>
            <tbody id="tbodyPendingOpd"></tbody>
        </table>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);margin-bottom:24px;overflow:hidden">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border);background:#FEFCE8">
        <div style="display:flex;align-items:center;gap:8px">
            <i data-lucide="bed-double" style="width:16px;height:16px;color:#eab308"></i>
            <span style="font-size:14px;font-weight:700;color:#854d0e;font-family:'Roobert',sans-serif">IPD Pending</span>
        </div>
        <span id="pendingIpdTotal" style="font-size:13px;font-weight:600;color:#eab308"></span>
    </div>
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Patient</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">IPD #</th>
                    <th style="padding:8px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Charges</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Updated</th>
                    <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                </tr>
            </thead>
            <tbody id="tbodyPendingIpd"></tbody>
        </table>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);border-left:3px solid #dc2626;margin-bottom:24px;overflow:hidden">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border);background:#FEF2F2">
        <div style="display:flex;align-items:center;gap:8px">
            <i data-lucide="siren" style="width:16px;height:16px;color:#dc2626"></i>
            <span style="font-size:14px;font-weight:700;color:#991b1b;font-family:'Roobert',sans-serif">ER Pending</span>
            <span style="font-size:11px;font-weight:500;color:#dc2626;background:rgba(220,38,38,0.08);padding:2px 8px;border-radius:12px;border:1px solid rgba(220,38,38,0.2)">Emergency Room Dispensed Medicines</span>
        </div>
        <span id="pendingErTotal" style="font-size:13px;font-weight:600;color:#dc2626"></span>
    </div>
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Patient</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Visit #</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Order</th>
                    <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Status</th>
                    <th style="padding:8px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Charges</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Dispensed</th>
                    <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                </tr>
            </thead>
            <tbody id="tbodyPendingEr"></tbody>
        </table>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="txnDetailSheet" style="width:640px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 class="offcanvas-title">TRANSACTION DETAILS</h5>
            <p id="txnDetailId" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <div id="txnDetailBody"></div>
        <div style="display:flex;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--color-border)">
            <button class="btn-print-receipt" style="padding:8px 16px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:12px;font-weight:500;cursor:pointer"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Print Receipt</button>
            <button class="btn-reconcile-txn" style="padding:8px 16px;background:var(--aquamint);border:none;border-radius:8px;font-size:12px;font-weight:600;color:var(--midnight-blue);cursor:pointer"><i data-lucide="check-circle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Reconcile</button>
            <button class="btn-void-txn" style="padding:8px 16px;background:#ef4444;border:none;border-radius:8px;font-size:12px;font-weight:600;color:#fff;cursor:pointer"><i data-lucide="x-circle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Void</button>
        </div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="cashReconSheet" style="width:640px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 class="offcanvas-title">DAILY CASH RECONCILIATION</h5>
            <p id="reconDateLabel" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
            <div>
                <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Date</label>
                <input type="date" id="reconDate" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
            </div>
            <div>
                <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Shift</label>
                <select id="reconShift" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                    <option>Morning (7 AM - 3 PM)</option>
                    <option>Evening (3 PM - 11 PM)</option>
                    <option>Night (11 PM - 7 AM)</option>
                </select>
            </div>
            <div>
                <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Pharmacist</label>
                <input type="text" id="reconPharmacist" value="Admin" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
            </div>
        </div>
        <div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">System Records</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Opening Balance</label><input type="number" id="reconOpening" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Cash Sales</label><input type="number" id="reconCashSales" readonly style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-background)"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Payments Received</label><input type="number" id="reconPayments" readonly style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-background)"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Returns/Refunds</label><input type="number" id="reconReturns" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
            </div>
            <div style="border-top:1px solid var(--color-border);margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;font-size:14px;font-weight:700">
                <span>Expected Closing:</span>
                <span id="reconExpected" style="color:var(--aquamint)">PKR 0</span>
            </div>
        </div>
        <div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Physical Count (Denominations)</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">5000 x</label><input type="number" class="denom-input" data-denom="5000" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">1000 x</label><input type="number" class="denom-input" data-denom="1000" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">500 x</label><input type="number" class="denom-input" data-denom="500" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">100 x</label><input type="number" class="denom-input" data-denom="100" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">50 x</label><input type="number" class="denom-input" data-denom="50" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">20 x</label><input type="number" class="denom-input" data-denom="20" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">10 x</label><input type="number" class="denom-input" data-denom="10" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Coins</label><input type="number" class="denom-input" data-denom="coins" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
            </div>
            <div style="border-top:1px solid var(--color-border);margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;font-size:14px;font-weight:700">
                <span>Total Cash:</span>
                <span id="reconActualCash">PKR 0</span>
            </div>
        </div>
        <div id="reconVarianceBox" style="padding:16px;border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Variance</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;font-size:13px">
                <div><span style="color:var(--color-muted-foreground)">Expected:</span> <strong id="reconVarExpected">0</strong></div>
                <div><span style="color:var(--color-muted-foreground)">Actual:</span> <strong id="reconVarActual">0</strong></div>
                <div><span style="color:var(--color-muted-foreground)">Difference:</span> <strong id="reconVarDiff">0</strong></div>
            </div>
            <div style="margin-bottom:12px">
                <label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Reason for Variance</label>
                <input type="text" id="reconVarReason" placeholder="e.g. Small change given, not recorded" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px">
            </div>
            <div>
                <label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Authorized By</label>
                <input type="text" id="reconAuthorized" placeholder="Manager name" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px">
            </div>
        </div>
        <div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Bank Deposit</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Amount to Deposit</label><input type="number" id="reconDeposit" value="0" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Remaining Float</label><input type="number" id="reconFloat" value="0" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Deposited By</label><input type="text" id="reconDepositedBy" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Deposit Slip No.</label><input type="text" id="reconSlipNo" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
            </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--color-border)">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas" style="border-radius:8px;font-size:13px;padding:8px 20px">Cancel</button>
            <button type="button" id="btnSaveRecon" style="padding:8px 20px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:500;cursor:pointer">Save Draft</button>
            <button type="button" id="btnSubmitRecon" style="padding:8px 24px;background:var(--aquamint);border:none;border-radius:8px;font-size:13px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Submit</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/pharmacy-billing.js') }}?v={{ filemtime(public_path('js/pharmacy-billing.js')) }}"></script>
@endpush
