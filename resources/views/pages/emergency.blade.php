@extends('layouts.app')

@section('content')
<div class="module-page">
    <nav class="module-tabs">
        <button class="module-tab active" data-tab="triage" data-permission="emergency.triage.access">
            <i data-lucide="clipboard-list"></i>
            <span class="hide-mobile">Triage & Registration</span>
        </button>
        <button class="module-tab" data-tab="er-billing" data-permission="emergency.billing.access">
            <i data-lucide="credit-card"></i>
            <span class="hide-mobile">Billing &amp; Payment</span>
        </button>
        <button class="module-tab" data-tab="treatment" data-permission="emergency.treatment.access">
            <i data-lucide="stethoscope"></i>
            <span class="hide-mobile">Treatment & Orders</span>
        </button>
        <button class="module-tab" data-tab="investigations" data-permission="emergency.investigations.access">
            <i data-lucide="flask-conical"></i>
            <span class="hide-mobile">Investigations</span>
        </button>
        <button class="module-tab" data-tab="disposition" data-permission="emergency.disposition.access">
            <i data-lucide="log-out"></i>
            <span class="hide-mobile">Disposition</span>
        </button>
    </nav>

    {{-- HEADER --}}
    <div class="module-header" id="erDeptHeader">
        <div>
            <h1 style="color:var(--color-destructive)"><i data-lucide="siren" style="color:var(--color-destructive)"></i> Emergency Department</h1>
            <p class="module-subtitle">Trauma Center & Acute Care Management</p>
        </div>
        <div class="module-header-actions">
            <div class="er-trauma-alert hide-mobile">
                <i data-lucide="activity"></i>
                <span>Trauma Alert: Active</span>
            </div>
            <button class="btn-destructive" id="btnNewERVisit"><i data-lucide="plus"></i> New Emergency Arrival</button>
        </div>
    </div>

    {{-- TAB 1: Triage & Registration --}}
    <div class="tab-content" id="tab-triage">

        {{-- Toolbar --}}
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="erTriageSearch" placeholder="Search by MRN, Name...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" id="btnErTriFilter" onclick="toggleErTriFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="erTriFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" onclick="toggleErTriRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="erTriRowsMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setErTriRowsPer(10)">10 rows</button>
                        <button onclick="setErTriRowsPer(25)">25 rows</button>
                        <button onclick="setErTriRowsPer(50)">50 rows</button>
                        <button onclick="setErTriRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" onclick="toggleErTriColVis(event)" title="Show/Hide Columns">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="erTriColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" type="button" onclick="erTriColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="erTriColVisList">
                            <label><input type="checkbox" data-col="0" checked> MRN</label>
                            <label><input type="checkbox" data-col="1" checked> Patient Name</label>
                            <label><input type="checkbox" data-col="2" checked> Visit ID</label>
                            <label><input type="checkbox" data-col="3" checked> Arrival Time</label>
                            <label><input type="checkbox" data-col="4" checked> Triage Category</label>
                            <label><input type="checkbox" data-col="5" checked> Chief Complaint</label>
                            <label><input type="checkbox" data-col="6" checked> Assigned To</label>
                            <label><input type="checkbox" data-col="7" checked> Time in ER</label>
                            <label><input type="checkbox" data-col="8" checked> Status</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" type="button" onclick="applyErTriColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" onclick="toggleErTriExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="erTriExportMenu">
                        <button onclick="exportErTri('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportErTri('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Filter Pane --}}
        <div class="opd-filter-pane" id="erTriFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleErTriFilter()" type="button"><i data-lucide="x"></i></button>
            </div>
            <div class="opd-filter-pane-body">
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Triage Category</label>
                    <div class="opd-cs-wrap" id="erTriCsCategory" data-target="erTriCategoryFilter" data-placeholder="All Categories">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Categories</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erTriCategoryFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Status</label>
                    <div class="opd-cs-wrap" id="erTriCsStatus" data-target="erTriStatusFilter" data-placeholder="All Status">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Status</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erTriStatusFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Doctor</label>
                    <div class="opd-cs-wrap" id="erTriCsDoctor" data-target="erTriDoctorFilter" data-placeholder="All Doctors">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Doctors</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erTriDoctorFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="erTriDpDateFrom" data-target="erTriDateFrom" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="erTriDateFrom">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="erTriDpDateTo" data-target="erTriDateTo" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="erTriDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetErTriFilters()"><i data-lucide="rotate-ccw"></i> Reset</button>
                <button class="opd-filter-apply" type="button" onclick="applyErTriFilters()"><i data-lucide="check"></i> Apply Filters</button>
            </div>
        </div>

        {{-- Table --}}
        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="erTriageTable">
                    <thead>
                        <tr>
                            <th>MRN</th>
                            <th>Patient Name</th>
                            <th>Visit ID</th>
                            <th>Arrival Time</th>
                            <th>Triage Category</th>
                            <th>Chief Complaint</th>
                            <th>Assigned To</th>
                            <th>Time in ER</th>
                            <th>Status</th>
                            <th>Date &amp; Time</th>
                        </tr>
                    </thead>
                    <tbody id="erTriageTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="erTriPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="erTriTableInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="erTriPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="erTriPageNums"></div>
                    <button class="opd-page-btn" id="erTriNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>



    {{-- TAB 3: Treatment & Orders --}}
    <div class="tab-content" id="tab-treatment" style="display:none">
        <div class="module-header">
            <div>
                <h2 style="font-size:20px;font-weight:700;color:var(--midnight-blue);margin:0">Clinical Orders</h2>
                <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Manage medications, investigations, and procedures</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnERNewOrder"><i data-lucide="plus"></i> Create New Order</button>
            </div>
        </div>

        <div class="mini-stats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(245,158,11,0.1)"><i data-lucide="clock" style="color:#F59E0B"></i></div>
                    <div>
                        <p class="mini-stat-label">Pending Orders</p>
                        <h3 class="mini-stat-value" style="color:var(--midnight-blue)" id="erStatPendingOrders">0</h3>
                    </div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(127,255,212,0.2)"><i data-lucide="pill" style="color:var(--midnight-blue)"></i></div>
                    <div>
                        <p class="mini-stat-label">Active Meds</p>
                        <h3 class="mini-stat-value" id="erStatActiveMeds">0</h3>
                    </div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="flask-conical" style="color:#3B82F6"></i></div>
                    <div>
                        <p class="mini-stat-label">Investigations</p>
                        <h3 class="mini-stat-value" id="erStatInvestigations">0</h3>
                    </div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(239,68,68,0.1)"><i data-lucide="alert-triangle" style="color:#EF4444"></i></div>
                    <div>
                        <p class="mini-stat-label">Critical ESI</p>
                        <h3 class="mini-stat-value" style="color:#EF4444" id="erStatCriticalESI">0</h3>
                    </div>
                </div>
            </div>
        </div>

        {{-- Toolbar --}}
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="erOrdSearch" placeholder="Search by patient, visit ID, doctor...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" id="btnErOrdFilter" onclick="toggleErOrdFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="erOrdFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" onclick="toggleErOrdRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="erOrdRowsMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setErOrdRowsPer(10)">10 rows</button>
                        <button onclick="setErOrdRowsPer(25)">25 rows</button>
                        <button onclick="setErOrdRowsPer(50)">50 rows</button>
                        <button onclick="setErOrdRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" onclick="toggleErOrdColVis(event)" title="Show/Hide Columns">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="erOrdColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" type="button" onclick="erOrdColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="erOrdColVisList">
                            <label><input type="checkbox" data-col="0" checked> Patient Name</label>
                            <label><input type="checkbox" data-col="1" checked> Visit ID / ESI</label>
                            <label><input type="checkbox" data-col="2" checked> Chief Complaint</label>
                            <label><input type="checkbox" data-col="3" checked> Doctor</label>
                            <label><input type="checkbox" data-col="4" checked> Pending Orders</label>
                            <label><input type="checkbox" data-col="5" checked> Active Meds</label>
                            <label><input type="checkbox" data-col="6" checked> Last Order</label>
                            <label><input type="checkbox" data-col="7" checked> Status</label>
                            <label><input type="checkbox" data-col="8" checked> Action</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" type="button" onclick="applyErOrdColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" onclick="toggleErOrdExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="erOrdExportMenu">
                        <button onclick="exportErOrd('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportErOrd('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Filter Pane --}}
        <div class="opd-filter-pane" id="erOrdFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleErOrdFilter()" type="button"><i data-lucide="x"></i></button>
            </div>
            <div class="opd-filter-pane-body">
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Status</label>
                    <div class="opd-cs-wrap" id="erOrdCsStatus" data-target="erOrdStatusFilter" data-placeholder="All Status">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Status</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erOrdStatusFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Doctor</label>
                    <div class="opd-cs-wrap" id="erOrdCsDoctor" data-target="erOrdDoctorFilter" data-placeholder="All Doctors">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Doctors</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erOrdDoctorFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">ESI Level</label>
                    <div class="opd-cs-wrap" id="erOrdCsEsi" data-target="erOrdEsiFilter" data-placeholder="All ESI Levels">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All ESI Levels</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erOrdEsiFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="erOrdDpDateFrom" data-target="erOrdDateFrom" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="erOrdDateFrom">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="erOrdDpDateTo" data-target="erOrdDateTo" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="erOrdDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetErOrdFilters()"><i data-lucide="rotate-ccw"></i> Reset</button>
                <button class="opd-filter-apply" type="button" onclick="applyErOrdFilters()"><i data-lucide="check"></i> Apply Filters</button>
            </div>
        </div>

        {{-- Table --}}
        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="erOrdTable">
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Visit ID / ESI</th>
                            <th>Chief Complaint</th>
                            <th>Doctor</th>
                            <th class="text-center">Pending Orders</th>
                            <th class="text-center">Active Meds</th>
                            <th>Last Order</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody id="erOrdersTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="erOrdPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="erOrdTableInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="erOrdPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="erOrdPageNums"></div>
                    <button class="opd-page-btn" id="erOrdNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    {{-- TAB 4: Investigations --}}
    <div class="tab-content" id="tab-investigations" style="display:none">

        {{-- Header --}}
        <div class="module-header">
            <div>
                <h2 style="font-size:20px;font-weight:700;color:var(--midnight-blue);margin:0;display:flex;align-items:center;gap:8px">
                    <i data-lucide="flask-conical" style="width:20px;height:20px"></i> Investigations
                </h2>
                <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Manage lab and radiology orders</p>
            </div>
        </div>

        {{-- Stat Tiles --}}
        <div class="mini-stats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(245,158,11,0.1)"><i data-lucide="clock" style="color:#F59E0B"></i></div>
                    <div>
                        <p class="mini-stat-label">Pending</p>
                        <h3 class="mini-stat-value" style="color:var(--midnight-blue)" id="erInvStatPending">0</h3>
                    </div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="loader" style="color:#3B82F6"></i></div>
                    <div>
                        <p class="mini-stat-label">In Progress</p>
                        <h3 class="mini-stat-value" id="erInvStatInProgress">0</h3>
                    </div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(34,197,94,0.1)"><i data-lucide="circle-check" style="color:#16a34a"></i></div>
                    <div>
                        <p class="mini-stat-label">Completed</p>
                        <h3 class="mini-stat-value" style="color:#16a34a" id="erInvStatCompleted">0</h3>
                    </div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(239,68,68,0.1)"><i data-lucide="alert-triangle" style="color:#EF4444"></i></div>
                    <div>
                        <p class="mini-stat-label">Critical Results</p>
                        <h3 class="mini-stat-value" style="color:#EF4444" id="erInvStatCritical">0</h3>
                    </div>
                </div>
            </div>
        </div>

        {{-- Toolbar --}}
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="erInvSearch" placeholder="Search by Patient, Visit, Test Name...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" id="btnErInvFilter" onclick="toggleErInvFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="erInvFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" onclick="toggleErInvRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="erInvRowsMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setErInvRowsPer(10)">10 rows</button>
                        <button onclick="setErInvRowsPer(25)">25 rows</button>
                        <button onclick="setErInvRowsPer(50)">50 rows</button>
                        <button onclick="setErInvRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" onclick="toggleErInvColVis(event)" title="Show/Hide Columns">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="erInvColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" type="button" onclick="erInvColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="erInvColVisList">
                            <label><input type="checkbox" data-col="0" checked> Date/Time</label>
                            <label><input type="checkbox" data-col="1" checked> Patient</label>
                            <label><input type="checkbox" data-col="2" checked> Type</label>
                            <label><input type="checkbox" data-col="3" checked> Test Name</label>
                            <label><input type="checkbox" data-col="4" checked> Ordered By</label>
                            <label><input type="checkbox" data-col="5" checked> Priority</label>
                            <label><input type="checkbox" data-col="6" checked> Status</label>
                            <label><input type="checkbox" data-col="7" checked> Actions</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" type="button" onclick="applyErInvColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" onclick="toggleErInvExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="erInvExportMenu">
                        <button onclick="exportErInv('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportErInv('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Filter Pane --}}
        <div class="opd-filter-pane" id="erInvFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleErInvFilter()" type="button"><i data-lucide="x"></i></button>
            </div>
            <div class="opd-filter-pane-body">
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Status</label>
                    <div class="opd-cs-wrap" id="erInvCsStatus" data-target="erInvStatusFilter" data-placeholder="All Status">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Status</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erInvStatusFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Type</label>
                    <div class="opd-cs-wrap" id="erInvCsType" data-target="erInvTypeFilter" data-placeholder="All Types">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Types</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erInvTypeFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Priority</label>
                    <div class="opd-cs-wrap" id="erInvCsPriority" data-target="erInvPriorityFilter" data-placeholder="All Priorities">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Priorities</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erInvPriorityFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="erInvDpDateFrom" data-target="erInvDateFrom" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="erInvDateFrom">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="erInvDpDateTo" data-target="erInvDateTo" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="erInvDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetErInvFilters()"><i data-lucide="rotate-ccw"></i> Reset</button>
                <button class="opd-filter-apply" type="button" onclick="applyErInvFilters()"><i data-lucide="check"></i> Apply Filters</button>
            </div>
        </div>

        {{-- Table --}}
        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="erInvestigationsTable">
                    <thead>
                        <tr>
                            <th>Date/Time</th>
                            <th>Patient</th>
                            <th>Type</th>
                            <th>Test Name</th>
                            <th>Ordered By</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="erInvestigationsBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="erInvPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="erInvTableInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="erInvPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="erInvPageNums"></div>
                    <button class="opd-page-btn" id="erInvNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    {{-- ER Investigation Detail Offcanvas --}}
    <div id="erInvDetailPanel" style="position:fixed;top:0;right:-520px;width:520px;height:100vh;background:#fff;z-index:1055;box-shadow:-4px 0 32px rgba(0,0,0,0.15);transition:right 0.3s ease;display:flex;flex-direction:column">
        <div style="padding:20px 24px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
            <h3 style="font-size:17px;font-weight:700;color:var(--midnight-blue);margin:0">Investigation Details</h3>
            <button onclick="closeErInvDetail()" style="background:none;border:none;cursor:pointer;padding:4px;color:var(--color-muted-foreground)">
                <i data-lucide="x" style="width:20px;height:20px"></i>
            </button>
        </div>
        <div id="erInvDetailBody" style="flex:1;overflow-y:auto;padding:20px 24px"></div>
    </div>
    <div id="erInvDetailBackdrop" onclick="closeErInvDetail()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:1054"></div>

    {{-- TAB 5: Disposition --}}
    <div class="tab-content" id="tab-disposition" style="display:none">

        {{-- Header --}}
        <div class="module-header">
            <div>
                <h2 style="font-size:20px;font-weight:700;color:var(--midnight-blue);margin:0">Your Admitted Patients</h2>
                <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Select a patient to initiate or manage the discharge process</p>
            </div>
        </div>

        {{-- Stat Tiles --}}
        <div class="mini-stats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(99,102,241,0.1)"><i data-lucide="users" style="color:#6366f1"></i></div>
                    <div>
                        <p class="mini-stat-label">Total Admitted</p>
                        <h3 class="mini-stat-value" style="color:var(--midnight-blue)" id="erDispStatTotal">0</h3>
                    </div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(245,158,11,0.1)"><i data-lucide="clock" style="color:#F59E0B"></i></div>
                    <div>
                        <p class="mini-stat-label">Awaiting Clearance</p>
                        <h3 class="mini-stat-value" style="color:#F59E0B" id="erDispStatAwaiting">0</h3>
                    </div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(34,197,94,0.1)"><i data-lucide="circle-check" style="color:#16a34a"></i></div>
                    <div>
                        <p class="mini-stat-label">All Cleared</p>
                        <h3 class="mini-stat-value" style="color:#16a34a" id="erDispStatCleared">0</h3>
                    </div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div class="mini-stat-icon" style="background:rgba(100,116,139,0.1)"><i data-lucide="log-out" style="color:#64748b"></i></div>
                    <div>
                        <p class="mini-stat-label">Discharged</p>
                        <h3 class="mini-stat-value" style="color:#64748b" id="erDispStatDischarged">0</h3>
                    </div>
                </div>
            </div>
        </div>

        {{-- Toolbar --}}
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="erDispSearch" placeholder="Search by patient, MRN, visit ID...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" id="btnErDispFilter" onclick="toggleErDispFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="erDispFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" onclick="toggleErDispRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="erDispRowsMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setErDispRowsPer(10)">10 rows</button>
                        <button onclick="setErDispRowsPer(25)">25 rows</button>
                        <button onclick="setErDispRowsPer(50)">50 rows</button>
                        <button onclick="setErDispRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" onclick="toggleErDispColVis(event)" title="Show/Hide Columns">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="erDispColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" type="button" onclick="erDispColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="erDispColVisList">
                            <label><input type="checkbox" data-col="0" checked> Patient</label>
                            <label><input type="checkbox" data-col="1" checked> Chief Complaint</label>
                            <label><input type="checkbox" data-col="2" checked> Time in ER</label>
                            <label><input type="checkbox" data-col="3" checked> Disposition</label>
                            <label><input type="checkbox" data-col="4" checked> Discharge Status</label>
                            <label><input type="checkbox" data-col="5" checked> Action</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" type="button" onclick="applyErDispColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" onclick="toggleErDispExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="erDispExportMenu">
                        <button onclick="exportErDisp('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportErDisp('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Filter Pane --}}
        <div class="opd-filter-pane" id="erDispFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleErDispFilter()" type="button"><i data-lucide="x"></i></button>
            </div>
            <div class="opd-filter-pane-body">
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Discharge Status</label>
                    <div class="opd-cs-wrap" id="erDispCsStatus" data-target="erDispStatusFilter" data-placeholder="All Status">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Status</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erDispStatusFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Disposition Type</label>
                    <div class="opd-cs-wrap" id="erDispCsDisposition" data-target="erDispDispositionFilter" data-placeholder="All Types">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Types</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erDispDispositionFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Doctor</label>
                    <div class="opd-cs-wrap" id="erDispCsDoctor" data-target="erDispDoctorFilter" data-placeholder="All Doctors">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">All Doctors</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="erDispDoctorFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="erDispDpDateFrom" data-target="erDispDateFrom" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="erDispDateFrom">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="erDispDpDateTo" data-target="erDispDateTo" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="erDispDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetErDispFilters()"><i data-lucide="rotate-ccw"></i> Reset</button>
                <button class="opd-filter-apply" type="button" onclick="applyErDispFilters()"><i data-lucide="check"></i> Apply Filters</button>
            </div>
        </div>

        {{-- Table --}}
        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="erDispositionTable">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Chief Complaint</th>
                            <th>Time in ER</th>
                            <th>Disposition</th>
                            <th>Discharge Status</th>
                            <th class="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody id="erDispositionBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="erDispPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="erDispTableInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="erDispPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="erDispPageNums"></div>
                    <button class="opd-page-btn" id="erDispNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    {{-- Billing & Payment Tab --}}
    <div class="tab-content" id="tab-er-billing" style="display:none">

        {{-- Header --}}
        <div class="module-header">
            <div>
                <h1>Billing &amp; Payments</h1>
                <p class="module-subtitle">Manage emergency billing, charges and payment collection</p>
            </div>
        </div>

        {{-- Stats Tiles --}}
        <div class="mini-stats" id="erBillingStats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Outstanding</p>
                        <h3 class="mini-stat-value" style="color:#EF4444" id="erStatOutstanding">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(239,68,68,0.1)"><i data-lucide="dollar-sign" style="color:#EF4444"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Collected Today</p>
                        <h3 class="mini-stat-value" style="color:#10B981" id="erStatCollected">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(16,185,129,0.1)"><i data-lucide="dollar-sign" style="color:#10B981"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Pending Bills</p>
                        <h3 class="mini-stat-value" style="color:#F59E0B" id="erStatPending">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(245,158,11,0.1)"><i data-lucide="clock" style="color:#F59E0B"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Patients</p>
                        <h3 class="mini-stat-value" style="color:#3B82F6" id="erStatPatients">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="users" style="color:#3B82F6"></i></div>
                </div>
            </div>
        </div>

        {{-- Toolbar --}}
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="erBillSearch" placeholder="Search by MRN, Name, Bill ID...">
            </div>
            <div class="opd-toolbar-right">
                <select class="form-select" id="erBillStatusFilter" style="width:140px;font-size:13px;height:36px">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                </select>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" type="button" id="btnErBillExport" onclick="toggleErBillExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="erBillExportMenu">
                        <button onclick="exportERBilling('excel')"><i data-lucide="file-spreadsheet" style="width:14px;height:14px"></i> Export Excel</button>
                        <button onclick="exportERBilling('pdf')"><i data-lucide="file-text" style="width:14px;height:14px"></i> Export PDF</button>
                        <button onclick="exportERBilling('csv')"><i data-lucide="file" style="width:14px;height:14px"></i> Export CSV</button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Table --}}
        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="erBillingTable">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Visit ID</th>
                            <th>Bill ID</th>
                            <th class="text-right">Total</th>
                            <th class="text-right">Paid</th>
                            <th class="text-right">Balance</th>
                            <th>Status</th>
                            <th class="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody id="erBillingTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="erBillPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="erBillTableInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="erBillPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="erBillPageNums"></div>
                    <button class="opd-page-btn" id="erBillNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- ER Billing Detail Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="erBillingDetailSheet" style="width:820px;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px">
        <h5 class="offcanvas-title" id="erBillingDetailTitle" style="font-size:18px;font-weight:700;color:var(--midnight-blue)">Billing &amp; Payment</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="erBillingDetailBody" style="background:var(--color-muted);padding:24px;overflow-y:auto"></div>
    <div class="offcanvas-footer" id="erBillingDetailFooter" style="border-top:1px solid var(--color-border);padding:16px 24px"></div>
</div>

{{-- ER Discharge Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="erDischargeStepSheet" style="width:75%;max-width:95vw;border-left:4px solid var(--aquamint)">
    {{-- Breadcrumb stepper --}}
    <div style="background:var(--midnight-blue);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div style="display:flex;align-items:center;gap:6px" id="erDischStepperCrumbs">
            <span class="er-disch-step-crumb" data-step="2">Initiate</span>
            <i data-lucide="chevron-right" style="width:14px;height:14px;color:rgba(255,255,255,0.4)"></i>
            <span class="er-disch-step-crumb" data-step="3">Clearance</span>
            <i data-lucide="chevron-right" style="width:14px;height:14px;color:rgba(255,255,255,0.4)"></i>
            <span class="er-disch-step-crumb" data-step="4">Final Disposition</span>
            <i data-lucide="chevron-right" style="width:14px;height:14px;color:rgba(255,255,255,0.4)"></i>
            <span class="er-disch-step-crumb" data-step="5">Complete</span>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    {{-- Step content panels --}}
    <div class="offcanvas-body" style="background:var(--color-muted);padding:24px;overflow-y:auto">
        <div id="erDischStep2" style="display:none"><div id="erDischStep2Content"></div></div>
        <div id="erDischStep3" style="display:none"><div id="erDischStep3Content"></div></div>
        <div id="erDischStep4" style="display:none"><div id="erDischStep4Content"></div></div>
        <div id="erDischStep5" style="display:none"><div id="erDischStep5Content"></div></div>
    </div>
</div>

{{-- Registration Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="erRegistrationSheet" style="width:600px;max-width:95vw;border-left:4px solid var(--color-destructive)">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="erRegSheetTitle" style="color:var(--color-destructive);font-weight:700;display:flex;align-items:center;gap:8px"><i data-lucide="siren" style="width:20px;height:20px"></i> New Emergency Arrival</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="erRegSheetBody"></div>
    <div class="offcanvas-footer" id="erRegSheetFooter"></div>
</div>

{{-- Charges Breakdown Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="erChargesSheet" style="width:500px;max-width:95vw;border-left:4px solid var(--color-destructive)">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" style="color:var(--color-destructive);font-weight:700;display:flex;align-items:center;gap:8px"><i data-lucide="clipboard-list" style="width:20px;height:20px"></i> ER Charges Breakdown</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="erChargesSheetBody"></div>
    <div class="offcanvas-footer" id="erChargesSheetFooter"></div>
</div>

{{-- Clinical Orders Management Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="erOrdersDetailSheet" style="width:85%;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px;position:sticky;top:0;z-index:10;background:var(--color-card)">
        <h5 class="offcanvas-title" style="font-size:18px;font-weight:700;color:var(--midnight-blue)">Clinical Orders Management</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px" id="erOrdersDetailBody"></div>
</div>

{{-- ER Registration Detail Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="erDetailSheet" style="width:640px;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border)">
        <h5 class="offcanvas-title" style="color:#060740"><i data-lucide="clipboard-list"></i> Patient Registration Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="erDetailBody" style="background:var(--color-muted);padding:24px"></div>
    <div class="offcanvas-footer" id="erDetailFooter" style="border-top:1px solid var(--color-border);padding:16px 24px"></div>
</div>

@endsection

@push('styles')
<style>
/* ── Shared Toolbar / Filter / Pagination (ER) ─────────────────────────── */
.opd-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap}
.opd-search-wrap{position:relative;flex:1;min-width:200px}
.opd-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--color-muted-foreground);pointer-events:none}
.opd-search-input{width:100%;height:40px;padding:0 14px 0 40px;border:1px solid var(--color-border);border-radius:10px;background:#fff!important;background-color:#fff!important;font-size:13.5px;color:var(--color-foreground);outline:none;transition:border-color .15s,box-shadow .15s}
.opd-search-input::placeholder{color:var(--color-muted-foreground)}
.opd-search-input:focus{border-color:#060740;box-shadow:0 0 0 3px rgba(6,7,64,.08)}
.opd-toolbar-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.opd-tool-btn{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 16px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-card);font-size:13.5px;font-weight:600;color:var(--color-foreground);cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,box-shadow .15s}
.opd-tool-btn svg{width:15px;height:15px;color:var(--color-muted-foreground)}
.opd-tool-btn--icon{width:40px;padding:0;justify-content:center;gap:0}
.opd-tool-btn:hover{background:var(--color-muted);border-color:#060740;box-shadow:0 2px 6px rgba(6,7,64,.08)}
.opd-tool-btn.active{background:rgba(6,7,64,.06);border-color:#060740}
.opd-filter-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:20px;background:#060740;color:#7FFFD4;font-size:10px;font-weight:800;line-height:1;margin-left:2px}
.opd-export-wrap{position:relative}
.opd-export-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:200;min-width:180px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px}
.opd-export-menu.open{display:block}
.opd-export-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:none;font-size:13.5px;font-weight:500;color:var(--color-foreground);cursor:pointer;border-radius:7px;text-align:left;transition:background .12s}
.opd-export-menu button:hover{background:var(--color-muted)}
.opd-export-menu button svg{width:15px;height:15px;color:var(--color-muted-foreground);flex-shrink:0}
.opd-rows-wrap{position:relative}
.opd-rows-menu{display:none;position:absolute;left:0;top:calc(100% + 6px);z-index:200;min-width:140px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px}
.opd-rows-menu.open{display:block}
.opd-rows-head{padding:8px 10px 6px;font-size:11px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--color-border);margin-bottom:4px}
.opd-rows-menu button{display:flex;align-items:center;width:100%;padding:8px 10px;border:none;background:none;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer;border-radius:7px;text-align:left;transition:background .1s}
.opd-rows-menu button:hover{background:var(--color-muted)}
.opd-col-vis-wrap{position:relative}
.opd-col-vis-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:200;width:220px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);overflow:hidden}
.opd-col-vis-menu.open{display:block}
.opd-col-vis-list{padding:8px 6px;max-height:280px;overflow-y:auto}
.opd-col-vis-list label{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:6px;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer;transition:background .1s}
.opd-col-vis-list label:hover{background:var(--color-muted)}
.opd-col-vis-list input[type="checkbox"]{width:15px;height:15px;accent-color:#060740;cursor:pointer;flex-shrink:0}
.opd-filter-pane{background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.opd-filter-pane-head{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--color-border);background:rgba(6,7,64,.02);border-radius:12px 12px 0 0}
.opd-filter-close{width:28px;height:28px;border-radius:7px;border:1px solid var(--color-border);background:var(--color-card);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.opd-filter-close:hover{background:var(--color-muted)}
.opd-filter-close svg{width:14px;height:14px}
.opd-filter-pane-body{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:16px 18px}
@media(max-width:1100px){.opd-filter-pane-body{grid-template-columns:repeat(3,1fr)}}
@media(max-width:700px){.opd-filter-pane-body{grid-template-columns:1fr 1fr}}
.opd-filter-field{display:flex;flex-direction:column;gap:5px}
.opd-filter-label{font-size:11.5px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em}
.opd-filter-input,.opd-filter-select{height:38px;padding:0 12px;border:1px solid #e2e6ea;border-radius:8px;background:#fff!important;background-color:#fff!important;color-scheme:light;font-size:13.5px;color:#111827!important;outline:none;transition:border-color .15s,box-shadow .15s;width:100%}
.opd-filter-input:focus,.opd-filter-select:focus{border-color:#060740;box-shadow:0 0 0 3px rgba(6,7,64,.07);background:#fff!important}
input[type="date"].opd-filter-input{color-scheme:light}
.opd-filter-pane-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--color-border);background:rgba(6,7,64,.02)}
.opd-filter-reset{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-card);font-size:13px;font-weight:600;color:var(--color-muted-foreground);cursor:pointer;transition:all .15s}
.opd-filter-reset:hover{background:var(--color-muted);color:var(--color-foreground)}
.opd-filter-reset svg{width:13px;height:13px}
.opd-filter-apply{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 20px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .15s,transform .1s}
.opd-filter-apply:hover{opacity:.88}
.opd-filter-apply svg{width:13px;height:13px}
.opd-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-top:1px solid var(--color-border);flex-wrap:wrap;gap:10px}
.opd-pagination-left{display:flex;align-items:center;gap:16px}
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
.table-wrapper{overflow-x:auto;border-radius:12px;border:1px solid var(--color-border)}
/* ───────────────────────────────────────────────────────────────────────── */
.er-trauma-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    background: rgba(239,68,68,0.1);
    color: var(--color-destructive);
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    animation: pulse 2s infinite;
}
.er-trauma-alert i { width: 16px; height: 16px; }

.btn-destructive {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--color-destructive);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(239,68,68,0.2);
    transition: all 0.15s;
}
.btn-destructive:hover { background: #dc2626; }
.btn-destructive i { width: 16px; height: 16px; }

.er-board-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    height: calc(100vh - 280px);
    margin-top: 8px;
}
@media (max-width: 1024px) { .er-board-grid { grid-template-columns: repeat(2, 1fr); height: auto; } }
@media (max-width: 640px) { .er-board-grid { grid-template-columns: 1fr; } }

.er-board-column {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-card);
    border-radius: 12px;
    border: 1px solid var(--color-border);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    overflow: hidden;
}
.er-board-column-header {
    padding: 12px;
    border-bottom: 1px solid var(--color-border);
    background: rgba(245,246,250,0.3);
    font-size: 13px;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.er-board-column-body {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: rgba(245,246,250,0.1);
}
.er-board-card {
    background: #fff;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    cursor: pointer;
    transition: box-shadow 0.15s;
    position: relative;
    overflow: hidden;
}
.er-board-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.er-board-card.border-waiting { border-left: 4px solid #ffc107; }
.er-board-card.border-treatment { border-left: 4px solid #3B82F6; }
.er-board-card.border-observation { border-left: 4px solid #8B5CF6; }
.er-board-card.border-disposition { border-left: 4px solid #10B981; }

.er-triage-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
.er-triage-dot.triage-red { background: #dc3545; }
.er-triage-dot.triage-orange { background: #fd7e14; }
.er-triage-dot.triage-yellow { background: #ffc107; }
.er-triage-dot.triage-green { background: #198754; }
.er-triage-dot.triage-black { background: #000; }
.er-triage-dot.triage-default { background: #64748b; }

.badge-triage-red { background: #dc3545; color: #fff; }
.badge-triage-orange { background: #fd7e14; color: #fff; }
.badge-triage-yellow { background: #ffc107; color: #000; }
.badge-triage-green { background: #198754; color: #fff; }
.badge-triage-black { background: #000; color: #fff; }
.badge-triage-default { background: #64748b; color: #fff; }
.badge-triage-red.pulse-badge { animation: pulse 2s infinite; }

.er-treatment-layout {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 24px;
}
@media (max-width: 768px) { .er-treatment-layout { grid-template-columns: 1fr; } }
.er-treatment-sidebar {
    border-right: 1px solid var(--color-border);
    padding-right: 24px;
}
@media (max-width: 768px) { .er-treatment-sidebar { border-right: none; padding-right: 0; } }

.er-esi-selector {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
}
@media (max-width: 640px) { .er-esi-selector { grid-template-columns: repeat(3, 1fr); } }
.er-esi-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    transition: all 0.15s;
}
.er-esi-btn:hover { opacity: 0.8; }
.er-esi-btn.active { box-shadow: 0 0 0 2px var(--aquamint), 0 0 0 4px rgba(127,255,212,0.3); }
.er-esi-btn.esi-red { background: #fee2e2; border-color: #fecaca; color: #991b1b; }
.er-esi-btn.esi-orange { background: #ffedd5; border-color: #fed7aa; color: #9a3412; }
.er-esi-btn.esi-yellow { background: #fef9c3; border-color: #fde68a; color: #854d0e; }
.er-esi-btn.esi-green { background: #dcfce7; border-color: #bbf7d0; color: #166534; }
.er-esi-btn.esi-blue { background: #dbeafe; border-color: #bfdbfe; color: #1e40af; }

.contact-type-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    flex: 1;
    transition: all 0.15s;
}
.contact-type-option:hover { background: var(--color-muted); }
.contact-type-option.active {
    border-color: var(--aquamint);
    background: rgba(127,255,212,0.05);
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* ── ER Discharge stepper ─────────────────────────────────────────── */
.er-disch-step-crumb {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.4);
    padding: 4px 10px;
    border-radius: 20px;
    cursor: default;
    white-space: nowrap;
}
.er-disch-step-crumb.active {
    background: var(--aquamint);
    color: var(--midnight-blue);
}
.er-disch-step-crumb.done {
    color: rgba(255,255,255,0.7);
}

/* reuse IPD discharge card styles */
.billing-clearance-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    transition: border-color 0.2s;
}
.billing-clearance-row.cleared {
    border-color: rgba(16,185,129,0.3);
    background: rgba(16,185,129,0.04);
}
.clearance-status-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    white-space: nowrap;
}
.clearance-cleared { background: rgba(16,185,129,0.12); color: #065F46; }
.clearance-pending { background: rgba(245,158,11,0.12); color: #B45309; }

.er-disch-checklist-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    background: var(--color-card);
}
.er-disch-checklist-item:hover { background: var(--color-muted); }
.er-disch-checklist-item.checked { border-color: var(--aquamint); background: rgba(127,255,212,0.06); }
.er-disch-check-box {
    width: 18px; height: 18px;
    border-radius: 4px;
    border: 2px solid var(--color-border);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.15s, background 0.15s;
}
.er-disch-checklist-item.checked .er-disch-check-box {
    border-color: var(--aquamint);
    background: rgba(127,255,212,0.2);
}

.er-disch-type-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1.5px solid var(--color-border);
    background: var(--color-card);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    color: var(--midnight-blue);
}
.er-disch-type-btn:hover { border-color: var(--aquamint); }
.er-disch-type-btn.active { border-color: var(--aquamint); background: rgba(127,255,212,0.12); color: var(--midnight-blue); }

.er-disch-condition-group { display: grid; grid-template-columns: repeat(5,1fr); gap:8px; max-width:500px; }
.er-disch-condition-btn {
    display: flex; flex-direction: column; align-items: center;
    gap: 4px; padding: 10px 6px;
    border-radius: 10px; border: 2px solid var(--color-border);
    background: var(--color-card); cursor: pointer; font-size: 20px;
    transition: all 0.15s;
}
.er-disch-condition-btn:hover { border-color: var(--aquamint); }
.er-disch-condition-btn.active { border-color: var(--aquamint); background: rgba(127,255,212,0.12); }

/* ── data-table-wrapper ───────────────────────────────────────────────────── */
.data-table-wrapper { background:var(--color-card); border:1px solid var(--color-border); border-radius:12px; overflow:hidden; }
.data-table-wrapper .opd-pagination { border-top:1px solid var(--color-border); padding:12px 16px; display:flex; align-items:center; justify-content:space-between; background:var(--color-card); }

/* ── Column visibility (OPD-style) ───────────────────────────────────────── */
.opd-col-vis-head { display:flex; align-items:center; justify-content:space-between; padding:11px 14px 10px; border-bottom:1px solid var(--color-border); font-size:13px; font-weight:700; color:var(--color-foreground); }
.opd-col-vis-selall { font-size:11.5px; font-weight:500; color:#060740; background:none; border:none; cursor:pointer; padding:0; text-decoration:underline; text-underline-offset:2px; }
.opd-col-vis-foot { padding:10px 14px; border-top:1px solid var(--color-border); display:flex; justify-content:flex-end; }
.opd-col-vis-save { height:32px; padding:0 18px; background:#060740; color:#fff; border:none; border-radius:7px; font-size:13px; font-weight:600; cursor:pointer; transition:opacity .15s; }
.opd-col-vis-save:hover { opacity:.88; }

/* ── Custom Date Picker ───────────────────────────────────────────────────── */
.opd-dp-wrap { position:relative; }
.opd-dp-trigger { display:flex; align-items:center; justify-content:space-between; height:38px; padding:0 12px; border:1px solid #e2e6ea !important; border-radius:8px; background:#ffffff !important; background-color:#ffffff !important; font-size:13.5px; color:#111827 !important; cursor:pointer; gap:8px; transition:border-color .15s,box-shadow .15s; }
.opd-dp-trigger:hover { border-color:#9496b8 !important; }
.opd-dp-trigger.open { border-color:#060740 !important; box-shadow:0 0 0 3px rgba(6,7,64,.07); }
.opd-dp-val { flex:1; color:#111827; font-size:13.5px; }
.opd-dp-val.opd-ph { color:#374151 !important; }
.opd-dp-popup { display:none; position:fixed; z-index:9999; background:#fff; border:1px solid #e2e6ea; border-radius:12px; box-shadow:0 8px 28px rgba(0,0,0,0.13); padding:14px; min-width:268px; }
.opd-dp-popup.open { display:block; }
.opd-dp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.opd-dp-nav { background:none; border:none; cursor:pointer; padding:4px 10px; border-radius:6px; font-size:18px; color:var(--color-foreground); line-height:1; }
.opd-dp-nav:hover { background:var(--color-muted); }
.opd-dp-month-year { font-size:14px; font-weight:600; color:var(--color-foreground); }
.opd-dp-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
.opd-dp-dayname { font-size:11px; font-weight:600; color:var(--color-muted-foreground); text-align:center; padding:4px 0; }
.opd-dp-day { font-size:13px; text-align:center; padding:7px 2px; border-radius:6px; cursor:pointer; color:var(--color-foreground); }
.opd-dp-day:hover:not(.empty) { background:var(--color-muted); }
.opd-dp-day.selected { background:#2563EB; color:#fff; font-weight:600; }
.opd-dp-day.selected:hover { background:#1D4ED8; }
.opd-dp-day.other-month { color:var(--color-muted-foreground); opacity:.35; }
.opd-dp-day.empty { cursor:default; }

/* ── Custom Searchable Select ─────────────────────────────────────────────── */
.opd-cs-wrap { position:relative; }
.opd-cs-trigger { display:flex; align-items:center; justify-content:space-between; height:38px; padding:0 12px; border:1px solid #e2e6ea !important; border-radius:8px; background:#ffffff !important; background-color:#ffffff !important; font-size:13.5px; color:#111827 !important; cursor:pointer; gap:8px; user-select:none; transition:border-color .15s,box-shadow .15s; }
.opd-cs-trigger:hover { border-color:#9496b8 !important; }
.opd-cs-trigger.open { border-color:#060740 !important; box-shadow:0 0 0 3px rgba(6,7,64,.07); }
.opd-cs-trigger.open > i { transform:rotate(180deg); }
.opd-cs-trigger > i { transition:transform .2s; }
.opd-cs-val { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#111827; font-size:13.5px; }
.opd-cs-val.opd-ph { color:#374151 !important; }
.opd-cs-popup { display:none; position:fixed; z-index:9999; background:#fff; border:1px solid #e2e6ea; border-radius:10px; box-shadow:0 8px 28px rgba(0,0,0,0.13); overflow:hidden; }
.opd-cs-popup.open { display:block; }
.opd-cs-search { width:100%; padding:9px 14px; border:none; border-bottom:1px solid var(--color-border); font-size:13px; outline:none; background:#fff; color:var(--color-foreground); }
.opd-cs-list { max-height:200px; overflow-y:auto; }
.opd-cs-option { padding:10px 14px; font-size:13.5px; cursor:pointer; color:var(--color-foreground); border-bottom:1px solid rgba(0,0,0,0.04); }
.opd-cs-option:hover { background:var(--color-muted); }
.opd-cs-option.selected { background:#EFF6FF; color:#1D4ED8; font-weight:500; }
.opd-cs-option:last-child { border-bottom:none; }
.opd-cs-empty { padding:12px 14px; font-size:13px; color:var(--color-muted-foreground); text-align:center; }
</style>
@endpush

@push('scripts')
<script src="{{ asset('js/emergency.js') }}?v={{ filemtime(public_path('js/emergency.js')) }}"></script>
@endpush
