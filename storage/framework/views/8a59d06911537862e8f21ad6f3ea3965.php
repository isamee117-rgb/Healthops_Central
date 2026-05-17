

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
                    <p class="mini-stat-label">Total Patients Today</p>
                    <h3 class="mini-stat-value" id="statRegToday">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Total Patients This Month</p>
                    <h3 class="mini-stat-value" id="statRegMonth">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Total Unpaid Today</p>
                    <h3 class="mini-stat-value" id="statRegUnpaid">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Total Paid Today</p>
                    <h3 class="mini-stat-value" id="statRegPaid">0</h3>
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
                    <button class="opd-tool-btn opd-tool-btn--export" type="button" id="btnRegExport" onclick="toggleExportMenu(event)" title="Export">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" class="icon-chevron-export"></i>
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
                <div class="opd-filter-head-left">
                    <i data-lucide="sliders-horizontal" class="icon-filter-head"></i>
                    <span class="opd-filter-head-label">Filters</span>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="calendar" class="icon-sm-flex"></i>
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
                            <i data-lucide="calendar" class="icon-sm-flex"></i>
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
            <div class="table-scroll">
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
                    <p class="mini-stat-label">Total Outstanding</p>
                    <h3 class="mini-stat-value" id="statOutstanding">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Collected Today</p>
                    <h3 class="mini-stat-value" id="statCollected">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Pending Bills</p>
                    <h3 class="mini-stat-value" id="statPending">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Total Patients</p>
                    <h3 class="mini-stat-value" id="statBillPatients">0</h3>
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
                    <button class="opd-tool-btn opd-tool-btn--export" type="button" id="btnBillExport" onclick="toggleBillExportMenu(event)" title="Export">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" class="icon-chevron-export"></i>
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
                <div class="opd-filter-head-left">
                    <i data-lucide="sliders-horizontal" class="icon-filter-head"></i>
                    <span class="opd-filter-head-label">Filters</span>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="calendar" class="icon-sm-flex"></i>
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
                            <i data-lucide="calendar" class="icon-sm-flex"></i>
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
            <div class="table-scroll">
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
                    <p class="mini-stat-label">Total Patients</p>
                    <h3 class="mini-stat-value" id="statVitalTotal">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Vitals Recorded</p>
                    <h3 class="mini-stat-value" id="statVitalRecorded">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Pending</p>
                    <h3 class="mini-stat-value" id="statVitalPending">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Alerts</p>
                    <h3 class="mini-stat-value" id="statVitalAlerts">0</h3>
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
                    <button class="opd-tool-btn opd-tool-btn--export" type="button" id="btnVitalExport" onclick="toggleVitalExportMenu(event)" title="Export">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" class="icon-chevron-export"></i>
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
                <div class="opd-filter-head-left">
                    <i data-lucide="sliders-horizontal" class="icon-filter-head"></i>
                    <span class="opd-filter-head-label">Filters</span>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="calendar" class="icon-sm-flex"></i>
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
                            <i data-lucide="calendar" class="icon-sm-flex"></i>
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
                    <p class="mini-stat-label">Total Consultations</p>
                    <h3 class="mini-stat-value" id="statTotalConsult">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">In Progress</p>
                    <h3 class="mini-stat-value" id="statInProgress">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Completed</p>
                    <h3 class="mini-stat-value" id="statCompleted">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Pending Queue</p>
                    <h3 class="mini-stat-value" id="statPendingQueue">0</h3>
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
                    <button class="opd-tool-btn opd-tool-btn--export" type="button" id="btnConsultExport" onclick="toggleConsultExportMenu(event)" title="Export">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" class="icon-chevron-export"></i>
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
                <div class="opd-filter-head-left">
                    <i data-lucide="sliders-horizontal" class="icon-filter-head"></i>
                    <span class="opd-filter-head-label">Filters</span>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="chevron-down" class="icon-sm-flex"></i>
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
                            <i data-lucide="calendar" class="icon-sm-flex"></i>
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
                            <i data-lucide="calendar" class="icon-sm-flex"></i>
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
            <div class="table-scroll">
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


<div class="offcanvas offcanvas-end offcanvas-600" tabindex="-1" id="registrationSheet">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="regSheetTitle">New Patient Registration</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="regSheetBody"></div>
    <div class="offcanvas-footer" id="regSheetFooter"></div>
</div>


<div class="offcanvas offcanvas-end offcanvas-600" tabindex="-1" id="chargesSheet">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title">Charges Breakdown</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="chargesSheetBody"></div>
    <div class="offcanvas-footer" id="chargesSheetFooter"></div>
</div>


<div class="offcanvas offcanvas-end offcanvas-640" tabindex="-1" id="regDetailSheet">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title">Patient Registration Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body offcanvas-body--detail" id="regDetailBody"></div>
    <div class="offcanvas-footer" id="regDetailFooter"></div>
</div>


<div class="offcanvas offcanvas-end offcanvas-850" tabindex="-1" id="billingDetailSheet">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title">Billing Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body offcanvas-body--detail" id="billingDetailBody"></div>
    <div class="offcanvas-footer" id="billingDetailFooter"></div>
</div>


<div class="offcanvas offcanvas-end offcanvas-85p" tabindex="-1" id="vitalSheet">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="vitalSheetTitle">Patient Vitals</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="vitalSheetBody"></div>
</div>


<div class="offcanvas offcanvas-end offcanvas-95p" tabindex="-1" id="consultSheet">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="consultSheetTitle">Doctor Consultation</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body offcanvas-body--flush" id="consultSheetBody"></div>
</div>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
<script src="<?php echo e(asset('js/opd.js')); ?>?v=<?php echo e(filemtime(public_path('js/opd.js'))); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\healthops\resources\views/pages/opd.blade.php ENDPATH**/ ?>