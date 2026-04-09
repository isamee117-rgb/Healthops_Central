<?php $__env->startSection('content'); ?>
<div class="module-page">
    <nav class="module-tabs">
        <button class="module-tab active" data-tab="registration" data-permission="opd.registration.access">
            <i data-lucide="clipboard-list"></i>
            <span class="hide-mobile">Patient Registration</span>
        </button>
        <button class="module-tab" data-tab="billing" data-permission="opd.billing.access">
            <i data-lucide="receipt"></i>
            <span class="hide-mobile">Billing & Payments</span>
        </button>
        <button class="module-tab" data-tab="vitals" data-permission="opd.vitals.access">
            <i data-lucide="thermometer"></i>
            <span class="hide-mobile">Vital Recording</span>
        </button>
        <button class="module-tab" data-tab="consultation" data-permission="opd.consultation.access">
            <i data-lucide="stethoscope"></i>
            <span class="hide-mobile">Doctor Consultation</span>
        </button>
    </nav>

    
    <div class="tab-content" id="tab-registration">
        <div class="module-header">
            <div>
                <h1 id="tabTitle">Outpatient Registration</h1>
                <p class="module-subtitle">Manage outpatient patient journey and workflow</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnNewRegistration"><i data-lucide="user-plus"></i> New Registration</button>
            </div>
        </div>

        
        <div class="mini-stats" id="regStats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Patients Today</p>
                        <h3 class="mini-stat-value" style="color:#3B82F6" id="statRegToday">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="users" style="color:#3B82F6"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Patients This Month</p>
                        <h3 class="mini-stat-value" style="color:#060740" id="statRegMonth">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(6,7,64,0.08)"><i data-lucide="calendar" style="color:#060740"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Unpaid Today</p>
                        <h3 class="mini-stat-value" style="color:#F59E0B" id="statRegUnpaid">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(245,158,11,0.1)"><i data-lucide="clock" style="color:#F59E0B"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Paid Today</p>
                        <h3 class="mini-stat-value" style="color:#10B981" id="statRegPaid">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(16,185,129,0.1)"><i data-lucide="check-circle-2" style="color:#10B981"></i></div>
                </div>
            </div>
        </div>

        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="regSearch" placeholder="Search by MRN, Name, Doctor...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnRegFilter" onclick="toggleRegFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="regFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnRowsPer" onclick="toggleRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="rowsPerMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setRowsPer(10)">10 rows</button>
                        <button onclick="setRowsPer(20)">20 rows</button>
                        <button onclick="setRowsPer(50)">50 rows</button>
                        <button onclick="setRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnColVis" onclick="toggleColVis(event)" title="Column visibility">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="colVisMenu">
                        <div class="opd-col-vis-head font-medium">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" type="button" onclick="colVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="colVisList">
                            <label><input type="checkbox" data-col="0" checked> MRN</label>
                            <label><input type="checkbox" data-col="1" checked> Patient Name</label>
                            <label><input type="checkbox" data-col="2" checked> Visit ID</label>
                            <label><input type="checkbox" data-col="3" checked> Department</label>
                            <label><input type="checkbox" data-col="4" checked> Doctor</label>
                            <label><input type="checkbox" data-col="5" checked> Visit Type</label>
                            <label><input type="checkbox" data-col="6" checked> Gender</label>
                            <label><input type="checkbox" data-col="7" checked> Amount</label>
                            <label><input type="checkbox" data-col="8" checked> Status</label>
                            <label><input type="checkbox" data-col="9" checked> Referred By</label>
                            <label><input type="checkbox" data-col="10" checked> Date/Time</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" type="button" onclick="applyColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" type="button" id="btnRegExport" onclick="toggleExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="regExportMenu">
                        <button onclick="exportReg('excel')"><i data-lucide="table-2"></i> Excel (.xls)</button>
                        <button onclick="exportReg('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportReg('pdf')"><i data-lucide="file-text"></i> PDF</button>
                        <button onclick="exportReg('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="opd-filter-pane" id="regFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleRegFilter()" type="button">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">MRN</label>
                    <div class="opd-cs-wrap" id="csMrn" data-target="regMrnFilter" data-placeholder="Enter Your MRN">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter Your MRN</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="regMrnFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Patient Name</label>
                    <div class="opd-cs-wrap" id="csPatName" data-target="regPatNameFilter" data-placeholder="Enter Patient Name">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter Patient Name</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="regPatNameFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Doctor</label>
                    <div class="opd-cs-wrap" id="csDoctor" data-target="regDoctorFilter" data-placeholder="Enter Doctor Name">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter Doctor Name</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="regDoctorFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Department</label>
                    <select class="opd-filter-select" id="regDeptFilter">
                        <option value="all">Any department</option>
                    </select>
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Status</label>
                    <select class="opd-filter-select" id="regStatusFilter">
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                    </select>
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="dpDateFrom" data-target="regDateFrom" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="regDateFrom">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="dpDateTo" data-target="regDateTo" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="regDateTo">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Referred By</label>
                    <input type="text" class="opd-filter-input" id="regRefByFilter" placeholder="Any referrer">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetRegFilters()">
                    <i data-lucide="rotate-ccw"></i> Reset
                </button>
                <button class="opd-filter-apply" type="button" onclick="applyRegFilters()">
                    <i data-lucide="check"></i> Apply Filters
                </button>
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="regTable">
                    <thead>
                        <tr>
                            <th>MRN</th>
                            <th>Patient Name</th>
                            <th>Visit ID</th>
                            <th>Department</th>
                            <th>Doctor</th>
                            <th>Visit Type</th>
                            <th>Gender</th>
                            <th class="text-right">Amount</th>
                            <th class="text-center">Status</th>
                            <th>Referred By</th>
                            <th>Date/Time</th>
                        </tr>
                    </thead>
                    <tbody id="regTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="regPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="regPageInfo">Showing — of — results</div>
                </div>
                
                <select id="regPerPage" style="display:none">
                    <option value="10" selected>10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="regPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="regPageNums"></div>
                    <button class="opd-page-btn" id="regNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-billing" style="display:none">
        <div class="module-header">
            <div>
                <h1>Billing & Payments</h1>
                <p class="module-subtitle">Manage outpatient billing, charges and payment collection</p>
            </div>
        </div>

        <div class="mini-stats" id="billingStats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Outstanding</p>
                        <h3 class="mini-stat-value" style="color:#EF4444" id="statOutstanding">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(239,68,68,0.1)"><i data-lucide="dollar-sign" style="color:#EF4444"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Collected Today</p>
                        <h3 class="mini-stat-value" style="color:#10B981" id="statCollected">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(16,185,129,0.1)"><i data-lucide="dollar-sign" style="color:#10B981"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Pending Bills</p>
                        <h3 class="mini-stat-value" style="color:#F59E0B" id="statPending">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(245,158,11,0.1)"><i data-lucide="clock" style="color:#F59E0B"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Patients</p>
                        <h3 class="mini-stat-value" style="color:#3B82F6" id="statBillPatients">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="users" style="color:#3B82F6"></i></div>
                </div>
            </div>
        </div>

        
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="billSearch" placeholder="Search by MRN, Name, Doctor...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnBillFilter" onclick="toggleBillFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="billFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnBillRowsPer" onclick="toggleBillRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="billRowsMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setBillRowsPer(10)">10 rows</button>
                        <button onclick="setBillRowsPer(20)">20 rows</button>
                        <button onclick="setBillRowsPer(50)">50 rows</button>
                        <button onclick="setBillRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnBillColVis" onclick="toggleBillColVis(event)" title="Column visibility">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="billColVisMenu">
                        <div class="opd-col-vis-head font-medium">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" type="button" onclick="billColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="billColVisList">
                            <label><input type="checkbox" data-col="0" checked> MRN</label>
                            <label><input type="checkbox" data-col="1" checked> Patient Name</label>
                            <label><input type="checkbox" data-col="2" checked> Visit ID</label>
                            <label><input type="checkbox" data-col="3" checked> Department</label>
                            <label><input type="checkbox" data-col="4" checked> Doctor</label>
                            <label><input type="checkbox" data-col="5" checked> Visit Type</label>
                            <label><input type="checkbox" data-col="6" checked> Total Amount</label>
                            <label><input type="checkbox" data-col="7" checked> Paid</label>
                            <label><input type="checkbox" data-col="8" checked> Balance</label>
                            <label><input type="checkbox" data-col="9" checked> Status</label>
                            <label><input type="checkbox" data-col="10" checked> Date/Time</label>
                            <label><input type="checkbox" data-col="11" checked> Actions</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" type="button" onclick="applyBillColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" type="button" id="btnBillExport" onclick="toggleBillExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="billExportMenu">
                        <button onclick="exportBill('excel')"><i data-lucide="table-2"></i> Excel (.xls)</button>
                        <button onclick="exportBill('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportBill('pdf')"><i data-lucide="file-text"></i> PDF</button>
                        <button onclick="exportBill('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="opd-filter-pane" id="billFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleBillFilter()" type="button">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">MRN</label>
                    <div class="opd-cs-wrap" id="csBillMrn" data-target="billMrnFilter" data-placeholder="Enter MRN">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter MRN</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="billMrnFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Patient Name</label>
                    <div class="opd-cs-wrap" id="csBillPatName" data-target="billPatNameFilter" data-placeholder="Enter Patient Name">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter Patient Name</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="billPatNameFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Department</label>
                    <select class="opd-filter-select" id="billDeptFilter">
                        <option value="all">Any department</option>
                    </select>
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Payment Status</label>
                    <select class="opd-filter-select" id="billStatusFilter">
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                    </select>
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="dpBillDateFrom" data-target="billDateFrom" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="billDateFrom">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="dpBillDateTo" data-target="billDateTo" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="billDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetBillFilters()">
                    <i data-lucide="rotate-ccw"></i> Reset
                </button>
                <button class="opd-filter-apply" type="button" onclick="applyBillFilters()">
                    <i data-lucide="check"></i> Apply Filters
                </button>
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="billTable">
                    <thead>
                        <tr>
                            <th>MRN</th>
                            <th>Patient Name</th>
                            <th>Visit ID</th>
                            <th>Department</th>
                            <th>Doctor</th>
                            <th>Visit Type</th>
                            <th class="text-right">Total Amount</th>
                            <th class="text-right">Paid</th>
                            <th class="text-right">Balance</th>
                            <th class="text-center">Status</th>
                            <th>Date/Time</th>
                            <th class="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="billTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="billPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="billPageInfo">Showing — of — results</div>
                </div>
                <select id="billPerPage" style="display:none">
                    <option value="10" selected>10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="billPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="billPageNums"></div>
                    <button class="opd-page-btn" id="billNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-vitals" style="display:none">
        <div class="module-header">
            <div>
                <h1>Vital Recording</h1>
                <p class="module-subtitle">Record and monitor outpatient vital signs</p>
            </div>
        </div>

        
        <div class="mini-stats" id="vitalStats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Patients</p>
                        <h3 class="mini-stat-value" style="color:#3B82F6" id="statVitalTotal">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="users" style="color:#3B82F6"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Vitals Recorded</p>
                        <h3 class="mini-stat-value" style="color:#10B981" id="statVitalRecorded">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(16,185,129,0.1)"><i data-lucide="activity" style="color:#10B981"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Pending</p>
                        <h3 class="mini-stat-value" style="color:#F59E0B" id="statVitalPending">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(245,158,11,0.1)"><i data-lucide="clock" style="color:#F59E0B"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Alerts</p>
                        <h3 class="mini-stat-value" style="color:#EF4444" id="statVitalAlerts">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(239,68,68,0.1)"><i data-lucide="alert-triangle" style="color:#EF4444"></i></div>
                </div>
            </div>
        </div>

        
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="vitalSearch" placeholder="Search by MRN, Name, Doctor...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnVitalFilter" onclick="toggleVitalFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="vitalFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnVitalRowsPer" onclick="toggleVitalRowsMenu(event)" title="Cards per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="vitalRowsMenu">
                        <div class="opd-rows-head font-normal">Cards per page</div>
                        <button onclick="setVitalRowsPer(12)">12 cards</button>
                        <button onclick="setVitalRowsPer(24)">24 cards</button>
                        <button onclick="setVitalRowsPer(48)">48 cards</button>
                        <button onclick="setVitalRowsPer(100)">100 cards</button>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" type="button" id="btnVitalExport" onclick="toggleVitalExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="vitalExportMenu">
                        <button onclick="exportVital('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportVital('pdf')"><i data-lucide="file-text"></i> PDF</button>
                        <button onclick="exportVital('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="opd-filter-pane" id="vitalFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleVitalFilter()" type="button">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">MRN</label>
                    <div class="opd-cs-wrap" id="csVitalMrn" data-target="vitalMrnFilter" data-placeholder="Enter MRN">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter MRN</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="vitalMrnFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Patient Name</label>
                    <div class="opd-cs-wrap" id="csVitalPatName" data-target="vitalPatNameFilter" data-placeholder="Enter Patient Name">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter Patient Name</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="vitalPatNameFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Doctor</label>
                    <div class="opd-cs-wrap" id="csVitalDoctor" data-target="vitalDoctorFilter" data-placeholder="Enter Doctor Name">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter Doctor Name</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="vitalDoctorFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Department</label>
                    <select class="opd-filter-select" id="vitalDeptFilter">
                        <option value="all">Any department</option>
                    </select>
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Vital Status</label>
                    <select class="opd-filter-select" id="vitalStatusFilter">
                        <option value="all">All Status</option>
                        <option value="recorded">Recorded</option>
                        <option value="pending">Pending</option>
                        <option value="alert">Alert</option>
                    </select>
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="dpVitalDateFrom" data-target="vitalDateFrom" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="vitalDateFrom">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="dpVitalDateTo" data-target="vitalDateTo" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="vitalDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetVitalFilters()">
                    <i data-lucide="rotate-ccw"></i> Reset
                </button>
                <button class="opd-filter-apply" type="button" onclick="applyVitalFilters()">
                    <i data-lucide="check"></i> Apply Filters
                </button>
            </div>
        </div>

        <div class="vital-list-card">
            <div class="vital-cards-grid" id="vitalCardsGrid"></div>

            
            <div class="opd-pagination" id="vitalPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="vitalPageInfo">Showing — of — patients</div>
                </div>
                <select id="vitalPerPage" style="display:none">
                    <option value="12" selected>12</option>
                    <option value="24">24</option>
                    <option value="48">48</option>
                    <option value="100">100</option>
                </select>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="vitalPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="vitalPageNums"></div>
                    <button class="opd-page-btn" id="vitalNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-consultation" style="display:none">
        <div class="module-header">
            <div>
                <h1>Doctor Consultation</h1>
                <p class="module-subtitle">Manage outpatient doctor consultations and workflow</p>
            </div>
        </div>

        <div class="mini-stats" id="consultStats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Consultations</p>
                        <h3 class="mini-stat-value" style="color:#3B82F6" id="statTotalConsult">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="stethoscope" style="color:#3B82F6"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">In Progress</p>
                        <h3 class="mini-stat-value" style="color:#060740" id="statInProgress">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(6,7,64,0.08)"><i data-lucide="clock" style="color:#060740"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Completed</p>
                        <h3 class="mini-stat-value" style="color:#10B981" id="statCompleted">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(16,185,129,0.1)"><i data-lucide="check-circle-2" style="color:#10B981"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Pending Queue</p>
                        <h3 class="mini-stat-value" style="color:#F59E0B" id="statPendingQueue">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(245,158,11,0.1)"><i data-lucide="users" style="color:#F59E0B"></i></div>
                </div>
            </div>
        </div>

        
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="consultSearch" placeholder="Search by MRN, Name, Doctor...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnConsultFilter" onclick="toggleConsultFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="consultFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnConsultRowsPer" onclick="toggleConsultRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="consultRowsMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setConsultRowsPer(10)">10 rows</button>
                        <button onclick="setConsultRowsPer(20)">20 rows</button>
                        <button onclick="setConsultRowsPer(50)">50 rows</button>
                        <button onclick="setConsultRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnConsultColVis" onclick="toggleConsultColVis(event)" title="Column visibility">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="consultColVisMenu">
                        <div class="opd-col-vis-head font-medium">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" type="button" onclick="consultColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="consultColVisList">
                            <label><input type="checkbox" data-col="0" checked> MRN</label>
                            <label><input type="checkbox" data-col="1" checked> Patient Name</label>
                            <label><input type="checkbox" data-col="2" checked> Visit ID</label>
                            <label><input type="checkbox" data-col="3" checked> Department</label>
                            <label><input type="checkbox" data-col="4" checked> Doctor</label>
                            <label><input type="checkbox" data-col="5" checked> Visit Type</label>
                            <label><input type="checkbox" data-col="6" checked> Status</label>
                            <label><input type="checkbox" data-col="7" checked> Date/Time</label>
                            <label><input type="checkbox" data-col="8" checked> Action</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" type="button" onclick="applyConsultColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" type="button" id="btnConsultExport" onclick="toggleConsultExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="consultExportMenu">
                        <button onclick="exportConsult('excel')"><i data-lucide="table-2"></i> Excel (.xls)</button>
                        <button onclick="exportConsult('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportConsult('pdf')"><i data-lucide="file-text"></i> PDF</button>
                        <button onclick="exportConsult('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="opd-filter-pane" id="consultFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleConsultFilter()" type="button">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">MRN</label>
                    <div class="opd-cs-wrap" id="csConsultMrn" data-target="consultMrnFilter" data-placeholder="Enter MRN">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter MRN</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="consultMrnFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Patient Name</label>
                    <div class="opd-cs-wrap" id="csConsultPatName" data-target="consultPatNameFilter" data-placeholder="Enter Patient Name">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter Patient Name</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="consultPatNameFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Doctor</label>
                    <div class="opd-cs-wrap" id="csConsultDoctor" data-target="consultDoctorFilter" data-placeholder="Enter Doctor Name">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter Doctor Name</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="consultDoctorFilter">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Department</label>
                    <select class="opd-filter-select" id="consultDeptFilter">
                        <option value="all">Any department</option>
                    </select>
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Status</label>
                    <select class="opd-filter-select" id="consultStatusFilter">
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="in progress">In Progress</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="dpConsultDateFrom" data-target="consultDateFrom" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="consultDateFrom">
                </div>
                
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="dpConsultDateTo" data-target="consultDateTo" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="consultDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetConsultFilters()">
                    <i data-lucide="rotate-ccw"></i> Reset
                </button>
                <button class="opd-filter-apply" type="button" onclick="applyConsultFilters()">
                    <i data-lucide="check"></i> Apply Filters
                </button>
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="consultTable">
                    <thead>
                        <tr>
                            <th>MRN</th>
                            <th>Patient Name</th>
                            <th>Visit ID</th>
                            <th>Department</th>
                            <th>Doctor</th>
                            <th>Visit Type</th>
                            <th class="text-center">Status</th>
                            <th>Date/Time</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody id="consultTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="consultPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="consultPageInfo">Showing — of — results</div>
                </div>
                <select id="consultPerPage" style="display:none">
                    <option value="10" selected>10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="consultPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="consultPageNums"></div>
                    <button class="opd-page-btn" id="consultNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="registrationSheet" style="width:600px;max-width:95vw">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="regSheetTitle"><i data-lucide="user-plus"></i> New Patient Registration</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="regSheetBody"></div>
    <div class="offcanvas-footer" id="regSheetFooter"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="chargesSheet" style="width:600px;max-width:95vw">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title"><i data-lucide="receipt"></i> Charges Breakdown</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="chargesSheetBody"></div>
    <div class="offcanvas-footer" id="chargesSheetFooter"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="regDetailSheet" style="width:640px;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border)">
        <h5 class="offcanvas-title" style="color:#060740"><i data-lucide="clipboard-list"></i> Patient Registration Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="regDetailBody" style="background:var(--color-muted);padding:24px"></div>
    <div class="offcanvas-footer" id="regDetailFooter" style="border-top:1px solid var(--color-border);padding:16px 24px"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="billingDetailSheet" style="width:820px;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border)">
        <h5 class="offcanvas-title"><i data-lucide="file-text"></i> Billing Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="billingDetailBody" style="background:var(--color-muted);padding:24px"></div>
    <div class="offcanvas-footer" id="billingDetailFooter" style="border-top:1px solid var(--color-border);padding:16px 24px"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="vitalSheet" style="width:85%;max-width:95vw">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="vitalSheetTitle"><i data-lucide="thermometer"></i> Patient Vitals</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="vitalSheetBody"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="consultSheet" style="width:95%;max-width:98vw">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="consultSheetTitle"><i data-lucide="stethoscope"></i> Doctor Consultation</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="consultSheetBody" style="padding:0"></div>
</div>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('styles'); ?>
<style>

/* ── OPD Registration toolbar (search + filter + export) ─────────────────── */
.opd-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    flex-wrap: wrap;
}

.opd-search-wrap {
    position: relative;
    flex: 1;
    min-width: 200px;
}
.opd-search-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: var(--color-muted-foreground);
    pointer-events: none;
}
.opd-search-input {
    width: 100%;
    height: 40px;
    padding: 0 14px 0 40px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-card);
    font-size: 13.5px;
    color: var(--color-foreground);
    outline: none;
    transition: border-color .15s, box-shadow .15s;
}
.opd-search-input::placeholder { color: var(--color-muted-foreground); }
.opd-search-input:focus {
    border-color: #060740;
    box-shadow: 0 0 0 3px rgba(6,7,64,.08);
}

.opd-toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.opd-status-select {
    height: 40px;
    padding: 0 32px 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-card);
    font-size: 13.5px;
    color: var(--color-foreground);
    font-weight: 500;
    cursor: pointer;
    outline: none;
    appearance: auto;
    transition: border-color .15s;
}
.opd-status-select:focus { border-color: #060740; }

.opd-tool-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 40px;
    padding: 0 16px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-card);
    font-size: 13.5px;
    font-weight: 600;
    color: var(--color-foreground);
    cursor: pointer;
    white-space: nowrap;
    transition: background .15s, border-color .15s, box-shadow .15s;
}
.opd-tool-btn svg { width: 15px; height: 15px; color: var(--color-muted-foreground); }
.opd-tool-btn--icon { width: 40px; padding: 0; justify-content: center; gap: 0; }
.opd-tool-btn:hover {
    background: var(--color-muted);
    border-color: #060740;
    box-shadow: 0 2px 6px rgba(6,7,64,.08);
}
.opd-tool-btn:active { transform: scale(.97); }

/* ── Filter badge on Filter button ──────────────────────────────────────── */
.opd-filter-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 20px;
    background: #060740;
    color: #7FFFD4;
    font-size: 10px;
    font-weight: 800;
    line-height: 1;
    margin-left: 2px;
}

/* ── Export dropdown ─────────────────────────────────────────────────────── */
.opd-export-wrap {
    position: relative;
}
.opd-export-menu {
    display: none;
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    z-index: 200;
    min-width: 180px;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.12);
    padding: 6px;
    overflow: hidden;
}
.opd-export-menu.open { display: block; }
.opd-export-menu button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 12px;
    border: none;
    background: none;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--color-foreground);
    cursor: pointer;
    border-radius: 7px;
    text-align: left;
    transition: background .12s;
}
.opd-export-menu button:hover { background: var(--color-muted); }
.opd-export-menu button svg { width: 15px; height: 15px; color: var(--color-muted-foreground); flex-shrink: 0; }

/* ── Rows-per-page toolbar dropdown ─────────────────────────────────────── */
.opd-rows-wrap { position: relative; }
.opd-rows-menu {
    display: none; position: absolute;
    left: 0; top: calc(100% + 6px);
    z-index: 200; min-width: 140px;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.12);
    padding: 6px; overflow: hidden;
}
.opd-rows-menu.open { display: block; }
.opd-rows-head {
    padding: 8px 10px 6px;
    font-size: 11px; font-weight: 700;
    color: var(--color-muted-foreground);
    text-transform: uppercase; letter-spacing: .04em;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 4px;
}
.opd-rows-menu button {
    display: flex; align-items: center;
    width: 100%; padding: 8px 10px;
    border: none; background: none;
    font-size: 13px; font-weight: 500;
    color: var(--color-foreground);
    cursor: pointer; border-radius: 7px;
    text-align: left; transition: background .1s;
}
.opd-rows-menu button:hover { background: var(--color-muted); }
.opd-rows-menu button.active {
    background: #060740; color: #fff; font-weight: 600;
}

/* ── Column Visibility ───────────────────────────────────────────────────── */
.opd-col-vis-wrap { position: relative; }
.opd-col-vis-menu {
    display: none; position: absolute;
    right: 0; top: calc(100% + 6px);
    z-index: 200; width: 220px;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.12);
    overflow: hidden;
}
.opd-col-vis-menu.open { display: block; }
.opd-col-vis-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 14px 10px;
    border-bottom: 1px solid var(--color-border);
    font-size: 13px; font-weight: 700; color: var(--color-foreground);
}
.opd-col-vis-selall {
    font-size: 11.5px; font-weight: 500; color: #060740;
    background: none; border: none; cursor: pointer; padding: 0;
    text-decoration: underline; text-underline-offset: 2px;
}
.opd-col-vis-list {
    padding: 8px 6px;
    max-height: 280px; overflow-y: auto;
}
.opd-col-vis-list label {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 8px; border-radius: 6px;
    font-size: 13px; font-weight: 500; color: var(--color-foreground);
    cursor: pointer; transition: background .1s;
}
.opd-col-vis-list label:hover { background: var(--color-muted); }
.opd-col-vis-list input[type="checkbox"] {
    width: 15px; height: 15px; accent-color: #060740; cursor: pointer; flex-shrink: 0;
}
.opd-col-vis-foot {
    padding: 10px 14px;
    border-top: 1px solid var(--color-border);
    display: flex; justify-content: flex-end;
}
.opd-col-vis-save {
    height: 32px; padding: 0 18px;
    background: #060740; color: #fff;
    border: none; border-radius: 7px;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: opacity .15s;
}
.opd-col-vis-save:hover { opacity: .88; }

/* ── Filter pane ─────────────────────────────────────────────────────────── */
.opd-filter-pane {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    margin-bottom: 14px;
    overflow: visible;
    box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.opd-filter-pane-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid var(--color-border);
    background: rgba(6,7,64,.02);
    border-radius: 12px 12px 0 0;
    overflow: hidden;
}
.opd-filter-close {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background .15s;
}
.opd-filter-close:hover { background: var(--color-muted); }
.opd-filter-close svg { width: 14px; height: 14px; }

.opd-filter-pane-body {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    padding: 16px 18px;
}
@media(max-width:1100px) { .opd-filter-pane-body { grid-template-columns: repeat(3,1fr); } }
@media(max-width:700px)  { .opd-filter-pane-body { grid-template-columns: 1fr 1fr; } }

.opd-filter-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}
.opd-filter-label {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--color-muted-foreground);
    text-transform: uppercase;
    letter-spacing: .04em;
}
.opd-filter-input,
.opd-filter-select {
    height: 38px;
    padding: 0 12px;
    border: 1px solid #e2e6ea;
    border-radius: 8px;
    background: #ffffff !important;
    background-color: #ffffff !important;
    color-scheme: light;
    font-size: 13.5px;
    color: #111827 !important;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    width: 100%;
}
.opd-filter-input::placeholder { color: #6b7280; }
input[type="date"].opd-filter-input { color-scheme: light; }
.opd-filter-input:focus,
.opd-filter-select:focus {
    border-color: #060740;
    box-shadow: 0 0 0 3px rgba(6,7,64,.07);
    background: #ffffff !important;
}

/* ── Custom Date Picker ───────────────────────────────────────────────────── */
.opd-dp-wrap { position: relative; }
.opd-dp-trigger {
    display: flex; align-items: center; justify-content: space-between;
    height: 38px; padding: 0 12px;
    border: 1px solid #e2e6ea !important; border-radius: 8px;
    background: #ffffff !important; background-color: #ffffff !important;
    color-scheme: light; font-size: 13.5px;
    color: #111827 !important; cursor: pointer; gap: 8px;
    transition: border-color .15s, box-shadow .15s;
}
.opd-dp-trigger:hover { border-color: #9496b8 !important; }
.opd-dp-trigger.open { border-color: #060740 !important; box-shadow: 0 0 0 3px rgba(6,7,64,.07); }
.opd-dp-val { flex: 1; color: #111827; font-size: 13.5px; }
.opd-dp-val.opd-ph { color: #374151 !important; }
.opd-dp-popup {
    display: none; position: fixed;
    z-index: 9999; background: #fff; border: 1px solid #e2e6ea;
    border-radius: 12px; box-shadow: 0 8px 28px rgba(0,0,0,0.13);
    padding: 14px; min-width: 268px;
}
.opd-dp-popup.open { display: block; }
.opd-dp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.opd-dp-nav {
    background: none; border: none; cursor: pointer;
    padding: 4px 10px; border-radius: 6px; font-size: 18px;
    color: var(--color-foreground); line-height: 1;
}
.opd-dp-nav:hover { background: var(--color-muted); }
.opd-dp-month-year { font-size: 14px; font-weight: 600; color: var(--color-foreground); }
.opd-dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.opd-dp-dayname { font-size: 11px; font-weight: 600; color: var(--color-muted-foreground); text-align: center; padding: 4px 0; }
.opd-dp-day {
    font-size: 13px; text-align: center; padding: 7px 2px;
    border-radius: 6px; cursor: pointer; color: var(--color-foreground);
}
.opd-dp-day:hover:not(.empty) { background: var(--color-muted); }
.opd-dp-day.selected { background: #2563EB; color: #fff; font-weight: 600; }
.opd-dp-day.selected:hover { background: #1D4ED8; }
.opd-dp-day.other-month { color: var(--color-muted-foreground); opacity: 0.35; }
.opd-dp-day.empty { cursor: default; }

/* ── Custom Searchable Select ─────────────────────────────────────────────── */
.opd-cs-wrap { position: relative; }
.opd-cs-trigger {
    display: flex; align-items: center; justify-content: space-between;
    height: 38px; padding: 0 12px;
    border: 1px solid #e2e6ea !important; border-radius: 8px;
    background: #ffffff !important; background-color: #ffffff !important;
    color-scheme: light; font-size: 13.5px;
    color: #111827 !important; cursor: pointer; gap: 8px;
    user-select: none; transition: border-color .15s, box-shadow .15s;
}
.opd-cs-trigger:hover { border-color: #9496b8 !important; }
.opd-cs-trigger.open { border-color: #060740 !important; box-shadow: 0 0 0 3px rgba(6,7,64,.07); }
.opd-cs-trigger.open > i { transform: rotate(180deg); }
.opd-cs-trigger > i { transition: transform .2s; }
.opd-cs-val { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #111827; font-size: 13.5px; }
.opd-cs-val.opd-ph { color: #374151 !important; }
.opd-cs-popup {
    display: none; position: fixed;
    z-index: 9999; background: #fff; border: 1px solid #e2e6ea;
    border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,0.13); overflow: hidden;
}
.opd-cs-popup.open { display: block; }
.opd-cs-search {
    width: 100%; padding: 9px 14px; border: none;
    border-bottom: 1px solid var(--color-border);
    font-size: 13px; outline: none; background: #fff; color: var(--color-foreground);
}
.opd-cs-list { max-height: 200px; overflow-y: auto; }
.opd-cs-option {
    padding: 10px 14px; font-size: 13.5px; cursor: pointer;
    color: var(--color-foreground); border-bottom: 1px solid rgba(0,0,0,0.04);
}
.opd-cs-option:hover { background: var(--color-muted); }
.opd-cs-option.selected { background: #EFF6FF; color: #1D4ED8; font-weight: 500; }
.opd-cs-option:last-child { border-bottom: none; }
.opd-cs-empty { padding: 12px 14px; font-size: 13px; color: var(--color-muted-foreground); text-align: center; }

.opd-filter-pane-foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid var(--color-border);
    background: rgba(6,7,64,.02);
}
.opd-filter-reset {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 16px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-card);
    font-size: 13px;
    font-weight: 600;
    color: var(--color-muted-foreground);
    cursor: pointer;
    transition: all .15s;
}
.opd-filter-reset:hover { background: var(--color-muted); color: var(--color-foreground); }
.opd-filter-reset svg { width: 13px; height: 13px; }

.opd-filter-apply {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 20px;
    border: none;
    border-radius: 8px;
    background: #060740;
    color: #7FFFD4;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity .15s, transform .1s;
}
.opd-filter-apply:hover { opacity: .88; }
.opd-filter-apply:active { transform: scale(.97); }
.opd-filter-apply svg { width: 13px; height: 13px; }

/* Active filter button state */
.opd-tool-btn.filter-active {
    background: rgba(6,7,64,.06);
    border-color: #060740;
    color: #060740;
}

/* ── OPD Pagination ──────────────────────────────────────────────────────── */
.opd-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-top: 1px solid var(--color-border);
    flex-wrap: wrap;
    gap: 10px;
}
.opd-page-info {
    font-size: 12.5px;
    color: var(--color-muted-foreground);
    font-weight: 500;
}
.opd-page-btns {
    display: flex;
    align-items: center;
    gap: 4px;
}
.opd-page-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all .15s;
    color: var(--color-foreground);
}
.opd-page-btn svg { width: 15px; height: 15px; }
.opd-page-btn:hover:not(:disabled) { background: var(--color-muted); border-color: #060740; }
.opd-page-btn:disabled { opacity: .4; cursor: not-allowed; }
.opd-pagination-left {
    display: flex;
    align-items: center;
    gap: 16px;
}
.opd-per-page {
    display: flex;
    align-items: center;
    gap: 8px;
}
.opd-per-page label {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--color-muted-foreground);
    white-space: nowrap;
}
.opd-per-page select {
    height: 34px;
    padding: 0 28px 0 10px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 9px center;
    -webkit-appearance: none;
    appearance: none;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-foreground);
    cursor: pointer;
    outline: none;
    transition: border-color .15s;
}
.opd-per-page select:focus { border-color: #060740; }
.opd-page-nums {
    display: flex;
    align-items: center;
    gap: 4px;
}
.opd-page-num {
    min-width: 34px;
    height: 34px;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    font-size: 13px;
    font-weight: 600;
    color: var(--color-foreground);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s;
}
.opd-page-num:hover { background: var(--color-muted); }
.opd-page-num.active {
    background: #060740;
    color: #7FFFD4;
    border-color: #060740;
}
.opd-page-ellipsis {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--color-muted-foreground);
}

.info-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
}

.vital-cards-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
}
@media (max-width: 1280px) { .vital-cards-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 1024px) { .vital-cards-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .vital-cards-grid { grid-template-columns: repeat(2, 1fr); } }

/* ── Vital Patient Card (vpc) ─────────────────────────────────────────────── */
.vpc {
    border-radius: 14px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow .18s, transform .18s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
}
.vpc:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.11); transform: translateY(-2px); }
.vpc.selected { box-shadow: 0 0 0 2px var(--aquamint), 0 4px 14px rgba(0,0,0,0.10); }
/* Midnight blue header */
.vpc-head {
    background: var(--midnight-blue);
    padding: 14px 16px 12px;
    min-width: 0;
}
.vpc-name { font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.vpc-sub  { font-size: 11.5px; color: rgba(255,255,255,0.50); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* Info body */
.vpc-body { padding: 12px 16px 10px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.vpc-row  { font-size: 12.5px; color: var(--color-muted-foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* Footer */
.vpc-footer {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    padding: 9px 16px 12px; border-top: 1px solid var(--color-border);
}
.vpc-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.vpc-tag  { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 600; letter-spacing: .3px; }
.vpc-tag--red    { background: rgba(239,68,68,.12);  color: #DC2626; }
.vpc-tag--orange { background: rgba(245,158,11,.12); color: #B45309; }
.vpc-tag--blue   { background: rgba(59,130,246,.12); color: #1D4ED8; }
.vpc-tag--purple { background: rgba(139,92,246,.12); color: #6D28D9; }
.vpc-tag--green  { background: rgba(16,185,129,.12); color: #047857; }
.vpc-view {
    display: inline-flex; align-items: center; gap: 2px;
    font-size: 12px; font-weight: 600;
    color: var(--midnight-blue); cursor: pointer; white-space: nowrap;
    flex-shrink: 0; background: none; border: none; padding: 0;
}
.vpc-view:hover { text-decoration: underline; }
/* Wrapper card that holds the grid + pagination */
.vital-list-card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    overflow: hidden;
}
.vital-list-card > .vital-cards-grid {
    padding: 20px;
}

.vital-card {
    position: relative;
    border-radius: 12px;
    border: 1px solid var(--color-border);
    border-left: 4px solid;
    background: var(--color-card);
    padding: 12px;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.vital-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.vital-card.alert-border { border-left-color: var(--color-destructive); }
.vital-card.recorded-border { border-left-color: var(--color-success); }
.vital-card.pending-border { border-left-color: var(--color-warning); }
.vital-card.selected { ring: 2px; box-shadow: 0 0 0 2px var(--aquamint), 0 4px 12px rgba(0,0,0,0.08); }

.consult-section-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    font-size: 14px;
    font-weight: 500;
    color: var(--color-muted-foreground);
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
}
.consult-section-btn:hover { background: var(--color-muted); }
.consult-section-btn.active {
    background: var(--aquamint);
    color: var(--midnight-blue);
    border-color: var(--aquamint);
    box-shadow: 0 2px 8px rgba(127,255,212,0.3);
}
.consult-section-btn i { width: 16px; height: 16px; }

.symptom-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
    background: rgba(127,255,212,0.1);
    border: 1px solid rgba(127,255,212,0.2);
    color: var(--midnight-blue);
}
.symptom-tag .remove-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--color-muted-foreground);
    display: flex;
}
.symptom-tag .remove-btn:hover { color: var(--color-destructive); }

.autocomplete-dropdown {
    position: absolute;
    z-index: 50;
    margin-top: 4px;
    width: 100%;
    max-height: 208px;
    overflow-y: auto;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.autocomplete-dropdown button {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: none;
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s;
}
.autocomplete-dropdown button:hover { background: var(--color-muted); }
.autocomplete-dropdown button i { width: 12px; height: 12px; color: var(--color-muted-foreground); flex-shrink: 0; }

.pain-scale-btns {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}
.pain-scale-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.pain-scale-btn:hover { background: var(--color-muted); }
.pain-scale-btn.active {
    background: var(--aquamint);
    color: var(--midnight-blue);
    border-color: var(--aquamint);
}

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

.vital-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    border-radius: 8px;
    background: rgba(245,246,250,0.3);
}
.vital-row .vital-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--color-muted-foreground);
}
.vital-row .vital-label i { width: 14px; height: 14px; }
.vital-row .vital-value {
    font-size: 14px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-weight: 500;
}

.dropdown-actions {
    position: relative;
    display: inline-block;
}
.dropdown-actions .dropdown-menu-custom {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    z-index: 50;
    min-width: 160px;
    padding: 4px 0;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.dropdown-actions.open .dropdown-menu-custom { display: block; }
.dropdown-actions .dropdown-menu-custom button {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: none;
    font-size: 13px;
    cursor: pointer;
    text-align: left;
}
.dropdown-actions .dropdown-menu-custom button:hover { background: var(--color-muted); }
.dropdown-actions .dropdown-menu-custom button i { width: 14px; height: 14px; }
</style>
<?php $__env->stopPush(); ?>

<?php $__env->startPush('scripts'); ?>
<script src="<?php echo e(asset('js/opd.js')); ?>?v=<?php echo e(filemtime(public_path('js/opd.js'))); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\healthops\resources\views/pages/opd.blade.php ENDPATH**/ ?>