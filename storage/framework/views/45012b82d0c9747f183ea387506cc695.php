<?php $__env->startSection('content'); ?>
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

    
    <div class="tab-content" id="tab-triage">

        
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



    
    <div class="tab-content" id="tab-treatment" style="display:none">
        <div class="module-header">
            <div>
                <h1>Clinical Orders</h1>
                <p class="module-subtitle">Manage medications, investigations, and procedures</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnERNewOrder"><i data-lucide="plus"></i> Create New Order</button>
            </div>
        </div>

        <div class="mini-stats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Pending Orders</p>
                    <h3 class="mini-stat-value" id="erStatPendingOrders">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Active Meds</p>
                    <h3 class="mini-stat-value" id="erStatActiveMeds">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Investigations</p>
                    <h3 class="mini-stat-value" id="erStatInvestigations">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Critical ESI</p>
                    <h3 class="mini-stat-value" id="erStatCriticalESI">0</h3>
                </div>
            </div>
        </div>

        
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

    
    <div class="tab-content" id="tab-investigations" style="display:none">

        
        <div class="module-header">
            <div>
                <h1>Investigations</h1>
                <p class="module-subtitle">Manage lab and radiology orders</p>
            </div>
        </div>

        
        <div class="mini-stats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Pending</p>
                    <h3 class="mini-stat-value" id="erInvStatPending">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">In Progress</p>
                    <h3 class="mini-stat-value" id="erInvStatInProgress">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Completed</p>
                    <h3 class="mini-stat-value" id="erInvStatCompleted">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Critical Results</p>
                    <h3 class="mini-stat-value" id="erInvStatCritical">0</h3>
                </div>
            </div>
        </div>

        
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

    
    <div class="tab-content" id="tab-disposition" style="display:none">

        
        <div class="module-header">
            <div>
                <h1>Your Admitted Patients</h1>
                <p class="module-subtitle">Select a patient to initiate or manage the discharge process</p>
            </div>
        </div>

        
        <div class="mini-stats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Total Admitted</p>
                    <h3 class="mini-stat-value" id="erDispStatTotal">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Awaiting Clearance</p>
                    <h3 class="mini-stat-value" id="erDispStatAwaiting">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">All Cleared</p>
                    <h3 class="mini-stat-value" id="erDispStatCleared">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Discharged</p>
                    <h3 class="mini-stat-value" id="erDispStatDischarged">0</h3>
                </div>
            </div>
        </div>

        
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

    
    <div class="tab-content" id="tab-er-billing" style="display:none">

        
        <div class="module-header">
            <div>
                <h1>Billing &amp; Payments</h1>
                <p class="module-subtitle">Manage emergency billing, charges and payment collection</p>
            </div>
        </div>

        
        <div class="mini-stats" id="erBillingStats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Total Outstanding</p>
                    <h3 class="mini-stat-value" id="erStatOutstanding">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Collected Today</p>
                    <h3 class="mini-stat-value" id="erStatCollected">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Pending Bills</p>
                    <h3 class="mini-stat-value" id="erStatPending">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Total Patients</p>
                    <h3 class="mini-stat-value" id="erStatPatients">0</h3>
                </div>
            </div>
        </div>

        
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


<div class="offcanvas offcanvas-end" tabindex="-1" id="erBillingDetailSheet" style="width:820px;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px">
        <h5 class="offcanvas-title" id="erBillingDetailTitle">Billing &amp; Payment</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="erBillingDetailBody" style="background:var(--color-muted);padding:24px;overflow-y:auto"></div>
    <div class="offcanvas-footer" id="erBillingDetailFooter" style="border-top:1px solid var(--color-border);padding:16px 24px"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="erDischargeStepSheet" style="width:75%;max-width:95vw;border-left:4px solid var(--aquamint)">
    
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
    
    <div class="offcanvas-body" style="background:var(--color-muted);padding:24px;overflow-y:auto">
        <div id="erDischStep2" style="display:none"><div id="erDischStep2Content"></div></div>
        <div id="erDischStep3" style="display:none"><div id="erDischStep3Content"></div></div>
        <div id="erDischStep4" style="display:none"><div id="erDischStep4Content"></div></div>
        <div id="erDischStep5" style="display:none"><div id="erDischStep5Content"></div></div>
    </div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="erRegistrationSheet" style="width:600px;max-width:95vw;border-left:4px solid var(--color-destructive)">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="erRegSheetTitle">New Emergency Arrival</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="erRegSheetBody"></div>
    <div class="offcanvas-footer" id="erRegSheetFooter"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="erChargesSheet" style="width:500px;max-width:95vw;border-left:4px solid var(--color-destructive)">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title">ER Charges Breakdown</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="erChargesSheetBody"></div>
    <div class="offcanvas-footer" id="erChargesSheetFooter"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="erOrdersDetailSheet" style="width:85%;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px;position:sticky;top:0;z-index:10;background:var(--color-card)">
        <h5 class="offcanvas-title">Clinical Orders Management</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px" id="erOrdersDetailBody"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="erDetailSheet" style="width:640px;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border)">
        <h5 class="offcanvas-title">Patient Registration Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="erDetailBody" style="background:var(--color-muted);padding:24px"></div>
    <div class="offcanvas-footer" id="erDetailFooter" style="border-top:1px solid var(--color-border);padding:16px 24px"></div>
</div>

<?php $__env->stopSection(); ?>


<?php $__env->startPush('scripts'); ?>
<script src="<?php echo e(asset('js/emergency.js')); ?>?v=<?php echo e(filemtime(public_path('js/emergency.js'))); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\healthops\resources\views/pages/emergency.blade.php ENDPATH**/ ?>