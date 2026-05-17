@extends('layouts.app')

@section('content')
<div class="module-page">
    <nav class="module-tabs">
        <button class="module-tab active" data-tab="registration" data-permission="ipd.registration.access">
            <i data-lucide="user-plus"></i>
            <span class="hide-mobile">Patient Registration</span>
        </button>
        <button class="module-tab" data-tab="billing" data-permission="ipd.billing.access">
            <i data-lucide="receipt"></i>
            <span class="hide-mobile">Billing & Payment</span>
        </button>
        <button class="module-tab" data-tab="ipd-patient" data-permission="ipd.registration.access">
            <i data-lucide="bed-double"></i>
            <span class="hide-mobile">IPD Patient</span>
        </button>
    </nav>

    {{-- TAB 1: Patient Registration --}}
    <div class="tab-content" id="tab-registration">
        <div class="module-header">
            <div>
                <h1><i data-lucide="bed-double"></i> Inpatient Management</h1>
                <p class="module-subtitle">Manage all active IPD patients and new admissions</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnAdmitNew"><i data-lucide="user-plus"></i> Admit New Patient</button>
            </div>
        </div>

        <div class="mini-stats" id="regStats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Active Patients</p>
                    <h3 class="mini-stat-value" id="statActiveCount">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Total Admissions</p>
                    <h3 class="mini-stat-value" id="statTotalAdm">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Available Beds</p>
                    <h3 class="mini-stat-value" id="statAvailBeds">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Today's Admissions</p>
                    <h3 class="mini-stat-value" id="statTodayAdm">0</h3>
                </div>
            </div>
        </div>

        {{-- Toolbar ──────────────────────────────────────────────────────────── --}}
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="regSearch" placeholder="Search by Admission ID, MRN, Patient Name...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnIpdRegFilter" onclick="toggleIpdRegFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="ipdRegFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleIpdRegRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="ipdRegRowsMenu">
                        <div class="opd-rows-head">Rows per page</div>
                        <button onclick="setIpdRegRowsPer(10)">10 rows</button>
                        <button onclick="setIpdRegRowsPer(20)">20 rows</button>
                        <button onclick="setIpdRegRowsPer(50)">50 rows</button>
                        <button onclick="setIpdRegRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleIpdRegColVis(event)" title="Column visibility">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="ipdRegColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" type="button" onclick="ipdRegColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="ipdRegColVisList">
                            <label><input type="checkbox" data-col="0" checked> MRN</label>
                            <label><input type="checkbox" data-col="1" checked> Patient Name</label>
                            <label><input type="checkbox" data-col="2" checked> Visit ID</label>
                            <label><input type="checkbox" data-col="3" checked> Department</label>
                            <label><input type="checkbox" data-col="4" checked> Doctor</label>
                            <label><input type="checkbox" data-col="5" checked> Adm. Source</label>
                            <label><input type="checkbox" data-col="6" checked> Gender</label>
                            <label><input type="checkbox" data-col="7" checked> Ward / Bed</label>
                            <label><input type="checkbox" data-col="8" checked> Initial Diagnosis</label>
                            <label><input type="checkbox" data-col="9" checked> Status</label>
                            <label><input type="checkbox" data-col="10" checked> Payment</label>
                            <label><input type="checkbox" data-col="11" checked> Date / Time</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" type="button" onclick="applyIpdRegColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" type="button" onclick="toggleIpdRegExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="ipdRegExportMenu">
                        <button onclick="exportIpdReg('excel')"><i data-lucide="table-2"></i> Excel (.xls)</button>
                        <button onclick="exportIpdReg('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportIpdReg('pdf')"><i data-lucide="file-text"></i> PDF</button>
                        <button onclick="exportIpdReg('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Filter Pane ───────────────────────────────────────────────────────── --}}
        <div class="opd-filter-pane" id="ipdRegFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleIpdRegFilter()" type="button">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                {{-- MRN --}}
                <div class="opd-filter-field">
                    <label class="opd-filter-label">MRN</label>
                    <div class="opd-cs-wrap" id="ipdCsMrn" data-target="ipdRegMrnFilter" data-placeholder="Enter MRN">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter MRN</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="ipdRegMrnFilter">
                </div>
                {{-- Patient Name --}}
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Patient Name</label>
                    <div class="opd-cs-wrap" id="ipdCsPatName" data-target="ipdRegPatNameFilter" data-placeholder="Enter Patient Name">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter Patient Name</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="ipdRegPatNameFilter">
                </div>
                {{-- Doctor --}}
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Doctor</label>
                    <div class="opd-cs-wrap" id="ipdCsDoctor" data-target="ipdRegDoctorFilter" data-placeholder="Enter Doctor Name">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Enter Doctor Name</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="ipdRegDoctorFilter">
                </div>
                {{-- Department --}}
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Department</label>
                    <div class="opd-cs-wrap" id="ipdCsDept" data-target="ipdRegDeptFilter" data-placeholder="Any Department">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Any Department</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="ipdRegDeptFilter">
                </div>
                {{-- Admission Source --}}
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Adm. Source</label>
                    <div class="opd-cs-wrap" id="ipdCsAdmSource" data-target="ipdRegAdmSourceFilter" data-placeholder="Any Source">
                        <div class="opd-cs-trigger">
                            <span class="opd-cs-val opd-ph">Any Source</span>
                            <i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-cs-popup">
                            <input type="text" class="opd-cs-search" placeholder="Search...">
                            <div class="opd-cs-list"></div>
                        </div>
                    </div>
                    <input type="hidden" id="ipdRegAdmSourceFilter">
                </div>
                {{-- Ward --}}
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Ward</label>
                    <select class="opd-filter-select" id="ipdRegWardFilter">
                        <option value="all">All Wards</option>
                    </select>
                </div>
                {{-- Status --}}
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Status</label>
                    <select class="opd-filter-select" id="ipdRegStatusFilter">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="discharged">Discharged</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                {{-- Date From --}}
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="ipdDpDateFrom" data-target="ipdRegDateFrom" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="ipdRegDateFrom">
                </div>
                {{-- Date To --}}
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="ipdDpDateTo" data-target="ipdRegDateTo" data-placeholder="Select date">
                        <div class="opd-dp-trigger">
                            <span class="opd-dp-val opd-ph">Select date</span>
                            <i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>
                        </div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="ipdRegDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetIpdRegFilters()">
                    <i data-lucide="rotate-ccw"></i> Reset
                </button>
                <button class="opd-filter-apply" type="button" onclick="applyIpdRegFilters()">
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
                            <th>Adm. Source</th>
                            <th>Gender</th>
                            <th>Ward / Bed</th>
                            <th>Initial Diagnosis</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Date / Time</th>
                        </tr>
                    </thead>
                    <tbody id="regTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="ipdRegPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="regTableInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="ipdRegPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="ipdRegPageNums"></div>
                    <button class="opd-page-btn" id="ipdRegNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    {{-- TAB 2: Billing & Payment --}}
    <div class="tab-content" id="tab-billing" style="display:none">
        <div class="module-header">
            <div>
                <h1><i data-lucide="receipt"></i> Billing & Payment</h1>
                <p class="module-subtitle">Manage patient billing, charges, and payments</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnRecordPayment"><i data-lucide="credit-card"></i> Record Payment</button>
            </div>
        </div>

        <div class="mini-stats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Total Billed</p>
                    <h3 class="mini-stat-value" id="statBillTotal">PKR 0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Collected Today</p>
                    <h3 class="mini-stat-value" id="statBillCollected">PKR 0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Outstanding</p>
                    <h3 class="mini-stat-value" id="statBillOutstanding">PKR 0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Cleared Patients</p>
                    <h3 class="mini-stat-value" id="statBillCleared">0</h3>
                </div>
            </div>
        </div>

        {{-- Toolbar ──────────────────────────────────────────────────────────── --}}
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="billSearch" placeholder="Search by Admission ID, MRN, Patient Name...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnIpdBillFilter" onclick="toggleIpdBillFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="ipdBillFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleIpdBillRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="ipdBillRowsMenu">
                        <div class="opd-rows-head">Rows per page</div>
                        <button onclick="setIpdBillRowsPer(10)">10 rows</button>
                        <button onclick="setIpdBillRowsPer(20)">20 rows</button>
                        <button onclick="setIpdBillRowsPer(50)">50 rows</button>
                        <button onclick="setIpdBillRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleIpdBillColVis(event)" title="Column visibility">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="ipdBillColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" type="button" onclick="ipdBillColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="ipdBillColVisList">
                            <label><input type="checkbox" data-col="0" checked> MRN</label>
                            <label><input type="checkbox" data-col="1" checked> Patient Name</label>
                            <label><input type="checkbox" data-col="2" checked> Admission ID</label>
                            <label><input type="checkbox" data-col="3" checked> Department</label>
                            <label><input type="checkbox" data-col="4" checked> Doctor</label>
                            <label><input type="checkbox" data-col="5" checked> Adm. Source</label>
                            <label><input type="checkbox" data-col="6" checked> Ward / Bed</label>
                            <label><input type="checkbox" data-col="7" checked> Initial Diagnosis</label>
                            <label><input type="checkbox" data-col="8" checked> Total Charges</label>
                            <label><input type="checkbox" data-col="9" checked> Paid</label>
                            <label><input type="checkbox" data-col="10" checked> Balance</label>
                            <label><input type="checkbox" data-col="11" checked> Payment Status</label>
                            <label><input type="checkbox" data-col="12" checked> Date / Time</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" type="button" onclick="applyIpdBillColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" type="button" onclick="toggleIpdBillExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="ipdBillExportMenu">
                        <button onclick="exportIpdBill('excel')"><i data-lucide="table-2"></i> Excel (.xls)</button>
                        <button onclick="exportIpdBill('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportIpdBill('pdf')"><i data-lucide="file-text"></i> PDF</button>
                        <button onclick="exportIpdBill('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Filter Pane ───────────────────────────────────────────────────────── --}}
        <div class="opd-filter-pane" id="ipdBillFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleIpdBillFilter()" type="button">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                <div class="opd-filter-field">
                    <label class="opd-filter-label">MRN</label>
                    <div class="opd-cs-wrap" id="ipdBillCsMrn" data-target="ipdBillMrnFilter" data-placeholder="Enter MRN">
                        <div class="opd-cs-trigger"><span class="opd-cs-val opd-ph">Enter MRN</span><i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i></div>
                        <div class="opd-cs-popup"><input type="text" class="opd-cs-search" placeholder="Search..."><div class="opd-cs-list"></div></div>
                    </div>
                    <input type="hidden" id="ipdBillMrnFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Patient Name</label>
                    <div class="opd-cs-wrap" id="ipdBillCsPatName" data-target="ipdBillPatNameFilter" data-placeholder="Enter Patient Name">
                        <div class="opd-cs-trigger"><span class="opd-cs-val opd-ph">Enter Patient Name</span><i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i></div>
                        <div class="opd-cs-popup"><input type="text" class="opd-cs-search" placeholder="Search..."><div class="opd-cs-list"></div></div>
                    </div>
                    <input type="hidden" id="ipdBillPatNameFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Doctor</label>
                    <div class="opd-cs-wrap" id="ipdBillCsDoctor" data-target="ipdBillDoctorFilter" data-placeholder="Enter Doctor Name">
                        <div class="opd-cs-trigger"><span class="opd-cs-val opd-ph">Enter Doctor Name</span><i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i></div>
                        <div class="opd-cs-popup"><input type="text" class="opd-cs-search" placeholder="Search..."><div class="opd-cs-list"></div></div>
                    </div>
                    <input type="hidden" id="ipdBillDoctorFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Department</label>
                    <div class="opd-cs-wrap" id="ipdBillCsDept" data-target="ipdBillDeptFilter" data-placeholder="Any Department">
                        <div class="opd-cs-trigger"><span class="opd-cs-val opd-ph">Any Department</span><i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i></div>
                        <div class="opd-cs-popup"><input type="text" class="opd-cs-search" placeholder="Search..."><div class="opd-cs-list"></div></div>
                    </div>
                    <input type="hidden" id="ipdBillDeptFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Payment Status</label>
                    <select class="opd-filter-select" id="ipdBillStatusFilter">
                        <option value="all">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                    </select>
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="ipdBillDpDateFrom" data-target="ipdBillDateFrom" data-placeholder="Select date">
                        <div class="opd-dp-trigger"><span class="opd-dp-val opd-ph">Select date</span><i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i></div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="ipdBillDateFrom">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="ipdBillDpDateTo" data-target="ipdBillDateTo" data-placeholder="Select date">
                        <div class="opd-dp-trigger"><span class="opd-dp-val opd-ph">Select date</span><i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i></div>
                        <div class="opd-dp-popup"></div>
                    </div>
                    <input type="hidden" id="ipdBillDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetIpdBillFilters()">
                    <i data-lucide="rotate-ccw"></i> Reset
                </button>
                <button class="opd-filter-apply" type="button" onclick="applyIpdBillFilters()">
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
                            <th>Admission ID</th>
                            <th>Department</th>
                            <th>Doctor</th>
                            <th>Adm. Source</th>
                            <th>Ward / Bed</th>
                            <th>Initial Diagnosis</th>
                            <th class="text-right">Total Charges</th>
                            <th class="text-right">Paid</th>
                            <th class="text-right">Balance</th>
                            <th>Payment Status</th>
                            <th>Date / Time</th>
                        </tr>
                    </thead>
                    <tbody id="billTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="ipdBillPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="billTableInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="ipdBillPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="ipdBillPageNums"></div>
                    <button class="opd-page-btn" id="ipdBillNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    {{-- TAB 2b: IPD Patient --}}
    <div class="tab-content" id="tab-ipd-patient" style="display:none">
        <div class="module-header">
            <div>
                <h1><i data-lucide="bed-double"></i> IPD Patients</h1>
                <p class="module-subtitle">View all admitted IPD patients</p>
            </div>
        </div>

        <div class="mini-stats" id="ipdPatStats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Active Patients</p>
                    <h3 class="mini-stat-value" id="ipdPatStatActive">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Total Admissions</p>
                    <h3 class="mini-stat-value" id="ipdPatStatTotal">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Available Beds</p>
                    <h3 class="mini-stat-value" id="ipdPatStatBeds">0</h3>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <p class="mini-stat-label">Today's Admissions</p>
                    <h3 class="mini-stat-value" id="ipdPatStatToday">0</h3>
                </div>
            </div>
        </div>

        {{-- Toolbar --}}
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <i data-lucide="search" class="opd-search-icon"></i>
                <input type="text" class="opd-search-input" id="ipdPatSearch" placeholder="Search by Admission ID, MRN, Patient Name...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" type="button" id="btnIpdPatFilter" onclick="toggleIpdPatFilter()" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="ipdPatFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleIpdPatRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="ipdPatRowsMenu">
                        <div class="opd-rows-head">Rows per page</div>
                        <button onclick="setIpdPatRowsPer(10)">10 rows</button>
                        <button onclick="setIpdPatRowsPer(20)">20 rows</button>
                        <button onclick="setIpdPatRowsPer(50)">50 rows</button>
                        <button onclick="setIpdPatRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" type="button" onclick="toggleIpdPatColVis(event)" title="Column visibility">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="ipdPatColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" type="button" onclick="ipdPatColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="ipdPatColVisList">
                            <label><input type="checkbox" data-col="0" checked> MRN</label>
                            <label><input type="checkbox" data-col="1" checked> Patient Name</label>
                            <label><input type="checkbox" data-col="2" checked> Visit ID</label>
                            <label><input type="checkbox" data-col="3" checked> Department</label>
                            <label><input type="checkbox" data-col="4" checked> Doctor</label>
                            <label><input type="checkbox" data-col="5" checked> Adm. Source</label>
                            <label><input type="checkbox" data-col="6" checked> Gender</label>
                            <label><input type="checkbox" data-col="7" checked> Ward / Bed</label>
                            <label><input type="checkbox" data-col="8" checked> Initial Diagnosis</label>
                            <label><input type="checkbox" data-col="9" checked> Status</label>
                            <label><input type="checkbox" data-col="10" checked> Payment</label>
                            <label><input type="checkbox" data-col="11" checked> Date / Time</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" type="button" onclick="applyIpdPatColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" type="button" onclick="toggleIpdPatExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="ipdPatExportMenu">
                        <button onclick="exportIpdPat('excel')"><i data-lucide="table-2"></i> Excel (.xls)</button>
                        <button onclick="exportIpdPat('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportIpdPat('pdf')"><i data-lucide="file-text"></i> PDF</button>
                        <button onclick="exportIpdPat('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Filter Pane --}}
        <div class="opd-filter-pane" id="ipdPatFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <div style="display:flex;align-items:center;gap:8px">
                    <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:#060740"></i>
                    <span style="font-weight:700;font-size:14px;color:var(--color-foreground)">Filters</span>
                </div>
                <button class="opd-filter-close" onclick="toggleIpdPatFilter()" type="button">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Status</label>
                    <select class="opd-filter-select" id="ipdPatStatusFilter">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="discharged">Discharged</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Ward</label>
                    <select class="opd-filter-select" id="ipdPatWardFilter">
                        <option value="all">All Wards</option>
                    </select>
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" type="button" onclick="resetIpdPatFilters()">
                    <i data-lucide="rotate-ccw"></i> Reset
                </button>
                <button class="opd-filter-apply" type="button" onclick="applyIpdPatFilters()">
                    <i data-lucide="check"></i> Apply Filters
                </button>
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="ipdPatTable">
                    <thead>
                        <tr>
                            <th>MRN</th>
                            <th>Patient Name</th>
                            <th>Visit ID</th>
                            <th>Department</th>
                            <th>Doctor</th>
                            <th>Adm. Source</th>
                            <th>Gender</th>
                            <th>Ward / Bed</th>
                            <th>Initial Diagnosis</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Date / Time</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="ipdPatTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="ipdPatPagination">
                <div class="opd-pagination-left">
                    <div class="opd-page-info" id="ipdPatTableInfo">Showing — of — results</div>
                </div>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="ipdPatPrevPage" disabled><i data-lucide="chevron-left"></i></button>
                    <div class="opd-page-nums" id="ipdPatPageNums"></div>
                    <button class="opd-page-btn" id="ipdPatNextPage"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    <style>
    .disch-pill { display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:2px solid var(--color-border);border-radius:20px;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s;background:var(--color-card);color:var(--color-foreground); }
    .disch-pill.active { background:var(--aquamint);border-color:var(--aquamint);color:var(--midnight-blue);font-weight:700; }
    .disch-check-label { display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;transition:background 0.15s;font-size:13px; }
    .disch-check-label:hover { background:rgba(127,255,212,0.07); }
    .disch-check-label.disch-checked { background:rgba(127,255,212,0.12); }
    .disch-check-label.disch-checked input { accent-color:var(--aquamint); }
    .disch-clearance-row { display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-radius:10px;border:1px solid var(--color-border);transition:all 0.3s; }
    .disch-clearance-row.cleared { background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.2); }
    .disch-step-line { flex:1;height:2px;background:var(--color-border);margin:0 8px;transition:background 0.3s; }
    .disch-step-line.done { background:var(--midnight-blue); }
    </style>

<style>
.disch-step-item { display:flex;flex-direction:column;align-items:center;gap:6px; }
.disch-step-circle { width:36px;height:36px;border-radius:50%;border:2px solid var(--color-border);background:var(--color-card);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--color-muted-foreground);transition:all 0.25s; }
.disch-step-item.active .disch-step-circle { border-color:var(--aquamint);background:var(--aquamint);color:var(--midnight-blue); }
.disch-step-item.done .disch-step-circle { border-color:var(--midnight-blue);background:var(--midnight-blue);color:#fff; }
.disch-step-label { font-size:11px;font-weight:500;color:var(--color-muted-foreground);white-space:nowrap; }
.disch-step-item.active .disch-step-label { color:var(--midnight-blue);font-weight:700; }
.disch-step-item.done .disch-step-label { color:var(--midnight-blue); }
.disch-step-line { flex:1;height:2px;background:var(--color-border);margin-bottom:18px;min-width:32px;transition:background 0.25s; }
.disch-step-line.done { background:var(--midnight-blue); }
.disch-checklist-item { display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);cursor:pointer;transition:all 0.2s; }
.disch-checklist-item:hover { border-color:var(--aquamint); }
.disch-checklist-item.checked { border-color:var(--aquamint);background:rgba(127,255,212,0.08); }
.disch-check-box { width:20px;height:20px;border-radius:5px;border:2px solid var(--color-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s; }
.disch-checklist-item.checked .disch-check-box { background:var(--aquamint);border-color:var(--aquamint); }
.disch-type-btn { padding:8px 18px;border-radius:20px;border:1.5px solid var(--color-border);background:var(--color-card);font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s; }
.disch-type-btn.active { border-color:var(--midnight-blue);background:var(--midnight-blue);color:#fff; }
.disch-condition-btn { padding:10px 16px;border-radius:10px;border:1.5px solid var(--color-border);background:var(--color-card);font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s;text-align:center; }
.disch-condition-btn.active { border-color:var(--aquamint);background:rgba(127,255,212,0.12); }
.billing-clearance-row { display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:10px;border:1px solid var(--color-border);background:var(--color-card);transition:background 0.3s; }
.billing-clearance-row.cleared { background:rgba(16,185,129,0.07);border-color:rgba(16,185,129,0.3); }
.clearance-status-badge { font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px; }
.clearance-pending { background:rgba(245,158,11,0.12);color:#B45309; }
.clearance-verified { background:rgba(59,130,246,0.12);color:#1D4ED8; }
.clearance-cleared { background:rgba(16,185,129,0.12);color:#065F46; }
</style>

{{-- Registration Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="registrationSheet" style="width:600px;border-left:4px solid var(--aquamint)">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px">
        <h5 class="offcanvas-title" id="regSheetTitle">New IPD Admission</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px" id="regSheetBody"></div>
    <div style="border-top:1px solid var(--color-border);padding:16px 24px;background:var(--color-muted)" id="regSheetFooter"></div>
</div>

{{-- Charges Breakdown Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="chargesSheet" style="width:500px;border-left:4px solid var(--aquamint)">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px">
        <h5 class="offcanvas-title">IPD Charges Breakdown</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px" id="chargesSheetBody"></div>
    <div style="border-top:1px solid var(--color-border);padding:16px 24px;background:var(--color-muted)" id="chargesSheetFooter"></div>
</div>

{{-- Admission Detail Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="admissionDetailSheet" style="width:640px;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border)">
        <h5 class="offcanvas-title">Patient Registration Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="admissionDetailBody" style="background:var(--color-muted);padding:24px"></div>
    <div class="offcanvas-footer" id="admissionDetailFooter" style="border-top:1px solid var(--color-border);padding:16px 24px"></div>
</div>

{{-- Discharge Step Offcanvas (Steps 2-5) --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="dischargeStepSheet" style="width:75%;max-width:1000px;border-left:4px solid var(--aquamint)">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px;position:sticky;top:0;z-index:10;background:var(--color-card)">
        <div style="display:flex;flex-direction:column;gap:2px">
            <h5 class="offcanvas-title" id="dischargeStepTitle">Patient Discharge</h5>
            <div id="dischargeStepSubtitle" style="font-size:12px;color:var(--color-muted-foreground);padding-left:26px"></div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:28px">

        {{-- Breadcrumb --}}
        <div id="dischBreadcrumb" style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:14px 28px;margin-bottom:24px">
            <div style="display:flex;align-items:center">
                <div class="disch-step-item" id="dischStepDot2">
                    <div class="disch-step-circle">1</div>
                    <div class="disch-step-label">Initiate</div>
                </div>
                <div class="disch-step-line" id="dischStepLine23"></div>
                <div class="disch-step-item" id="dischStepDot3">
                    <div class="disch-step-circle">2</div>
                    <div class="disch-step-label">Awaiting Clearance</div>
                </div>
                <div class="disch-step-line" id="dischStepLine34"></div>
                <div class="disch-step-item" id="dischStepDot4">
                    <div class="disch-step-circle">3</div>
                    <div class="disch-step-label">Final Discharge</div>
                </div>
                <div class="disch-step-line" id="dischStepLine45"></div>
                <div class="disch-step-item" id="dischStepDot5">
                    <div class="disch-step-circle">4</div>
                    <div class="disch-step-label">Complete</div>
                </div>
            </div>
        </div>

        {{-- Step content containers --}}
        <div id="dischStep2"><div id="dischStep2Content"></div></div>
        <div id="dischStep3" style="display:none"><div id="dischStep3Content"></div></div>
        <div id="dischStep4" style="display:none"><div id="dischStep4Content"></div></div>
        <div id="dischStep5" style="display:none"><div id="dischStep5Content"></div></div>

    </div>
</div>

{{-- Billing Detail Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="billingDetailSheet" style="width:900px;max-width:100vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px;position:sticky;top:0;z-index:10;background:var(--color-card)">
        <h5 class="offcanvas-title" id="billingDetailTitle">Billing Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px" id="billingDetailBody"></div>
    <div style="border-top:1px solid var(--color-border);padding:16px 24px;display:flex;justify-content:space-between;align-items:center;background:var(--color-card)" id="billingDetailFooter"></div>
</div>

{{-- Clinical Orders Detail Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="ordersDetailSheet" style="width:85%">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px;position:sticky;top:0;z-index:10;background:var(--color-card)">
        <h5 class="offcanvas-title">Clinical Orders Management</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px" id="ordersDetailBody"></div>
</div>

{{-- Investigation Detail Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="invDetailSheet" style="width:85%">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px;position:sticky;top:0;z-index:10;background:var(--color-card)">
        <h5 class="offcanvas-title">Investigation Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px" id="invDetailBody"></div>
</div>

{{-- Nursing Patient Detail Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="nursingDetailSheet" style="width:85%">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px;position:sticky;top:0;z-index:10;background:var(--color-card)">
        <h5 class="offcanvas-title" id="nursingDetailTitle">Patient Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px" id="nursingDetailBody"></div>
</div>

{{-- Clinical Orders View Offcanvas (Nursing view-only) --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="clinicalOrdersSheet" style="width:72%;max-width:860px">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px;position:sticky;top:0;z-index:10;background:var(--color-card)">
        <div>
            <h5 class="offcanvas-title" id="clinicalOrdersTitle">Clinical Orders</h5>
            <p style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0" id="clinicalOrdersSubtitle"></p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px" id="clinicalOrdersBody">
        <div style="padding:40px;text-align:center;color:var(--color-muted-foreground)">Loading...</div>
    </div>
</div>

{{-- Payment Modal --}}
<div class="modal fade" id="paymentModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add Payment</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p style="font-size:14px;color:var(--color-muted-foreground);margin-bottom:16px">Process a new payment for selected patient</p>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:500;color:var(--color-muted-foreground);text-transform:uppercase;display:block;margin-bottom:6px">Amount (PKR)</label>
                    <div style="display:flex;gap:8px">
                        <span style="display:flex;height:48px;align-items:center;border-radius:6px;border:1px solid var(--color-border);background:var(--color-muted);padding:0 16px;font-size:14px;font-weight:600;color:var(--color-muted-foreground)">PKR</span>
                        <input type="number" class="form-control" id="paymentAmount" placeholder="0.00" style="height:48px;font-size:18px;font-weight:600">
                    </div>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:500;color:var(--color-muted-foreground);text-transform:uppercase;display:block;margin-bottom:6px">Payment Mode</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" id="paymentModeGrid">
                        <label class="payment-mode-option active" data-mode="cash">
                            <input type="radio" name="paymentMode" value="cash" checked style="display:none">
                            <i data-lucide="banknote" style="width:16px;height:16px"></i> <span>Cash</span>
                        </label>
                        <label class="payment-mode-option" data-mode="card">
                            <input type="radio" name="paymentMode" value="card" style="display:none">
                            <i data-lucide="credit-card" style="width:16px;height:16px"></i> <span>Card</span>
                        </label>
                        <label class="payment-mode-option" data-mode="online">
                            <input type="radio" name="paymentMode" value="online" style="display:none">
                            <i data-lucide="smartphone" style="width:16px;height:16px"></i> <span>Online</span>
                        </label>
                        <label class="payment-mode-option" data-mode="cheque">
                            <input type="radio" name="paymentMode" value="cheque" style="display:none">
                            <i data-lucide="file-text" style="width:16px;height:16px"></i> <span>Cheque</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-outline" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn-primary" id="btnProcessPayment">Process Payment</button>
            </div>
        </div>
    </div>
</div>

{{-- MAR Administration Modal --}}
<div class="modal fade" id="marAdminModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Administer Medication</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="marAdminModalBody"></div>
            <div class="modal-footer">
                <button type="button" class="btn-outline" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn-primary" id="btnConfirmAdmin">Confirm Administration</button>
            </div>
        </div>
    </div>
</div>

{{-- Lab Results Modal --}}
<div class="modal fade" id="labResultsModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="labResultsTitle">Lab Results</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="labResultsBody"></div>
        </div>
    </div>
</div>

{{-- IPD Patient Profile Overlay --}}
<div class="ipd-profile-overlay" id="ipdPatProfileOverlay">

    {{-- Top bar --}}
    <div class="ipd-profile-topbar">
        <div class="ipd-profile-breadcrumb">
            <button class="ipd-profile-back-btn" onclick="closeIpdPatProfile()">
                <i data-lucide="arrow-left" style="width:15px;height:15px"></i> Back
            </button>
            <span style="margin-left:6px">IPD Patients</span>
            <span>›</span>
            <span id="ipdProfileBreadName" style="color:var(--color-foreground);font-weight:500">Patient Profile</span>
        </div>
        <div class="ipd-profile-topbar-right">
            <span class="ipd-profile-pid">MRN: <strong id="ipdProfileMrnTop">—</strong></span>
        </div>
    </div>

    {{-- Content --}}
    <div class="ipd-profile-content">

        {{-- Merged header card --}}
        <div class="ipd-profile-identity">
            <div class="ipd-profile-avatar" id="ipdProfileAvatar">?</div>
            <div class="ipd-profile-identity-info">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
                    {{-- Left: name + meta + pills --}}
                    <div>
                        <h2 class="ipd-profile-name">
                            <span id="ipdProfileName">—</span>
                            <span class="ipd-profile-name-badge">
                                <i data-lucide="check" style="width:12px;height:12px"></i>
                            </span>
                        </h2>
                        <div class="ipd-profile-meta">
                            <span class="ipd-profile-meta-item">
                                <i data-lucide="map-pin" style="width:14px;height:14px"></i>
                                <span id="ipdProfileMrn">MRN-—</span>
                            </span>
                            <span class="ipd-profile-meta-item">
                                <i data-lucide="phone" style="width:14px;height:14px"></i>
                                <span id="ipdProfilePhone">—</span>
                            </span>
                            <span class="ipd-profile-meta-item">
                                <i data-lucide="user" style="width:14px;height:14px"></i>
                                <span id="ipdProfileAgeGender">—</span>
                            </span>
                        </div>
                        <div class="ipd-profile-pills">
                            <div class="ipd-profile-pill pill-mrn">
                                <span class="ipd-profile-pill-label">Admission ID</span>
                                <span id="ipdProfileAdmId">—</span>
                            </div>
                            <div class="ipd-profile-pill" id="ipdProfileStatusPill">
                                <span class="ipd-profile-pill-dot" id="ipdProfileStatusDot"></span>
                                <span class="ipd-profile-pill-label">Status</span>
                                <span id="ipdProfileStatus">—</span>
                            </div>
                            <div class="ipd-profile-pill" id="ipdProfilePayPill">
                                <span class="ipd-profile-pill-dot" id="ipdProfilePayDot"></span>
                                <span class="ipd-profile-pill-label">Payment</span>
                                <span id="ipdProfilePay">—</span>
                            </div>
                        </div>
                    </div>
                    {{-- Right: admission info inline --}}
                    <div class="ipd-merged-adminfo">
                        <span class="ipd-merged-adminfo-item">
                            <span class="ipd-merged-adminfo-key">Ward / Bed</span>
                            <span class="ipd-merged-adminfo-val" id="ipdProfileWardBed">—</span>
                        </span>
                        <span class="ipd-merged-adminfo-item">
                            <span class="ipd-merged-adminfo-key">Department</span>
                            <span class="ipd-merged-adminfo-val" id="ipdProfileDept">—</span>
                        </span>
                        <span class="ipd-merged-adminfo-item">
                            <span class="ipd-merged-adminfo-key">Doctor</span>
                            <span class="ipd-merged-adminfo-val" id="ipdProfileDoctor">—</span>
                        </span>
                        <span class="ipd-merged-adminfo-item">
                            <span class="ipd-merged-adminfo-key">Adm. Source</span>
                            <span class="ipd-merged-adminfo-val" id="ipdProfileSource">—</span>
                        </span>
                        <span class="ipd-merged-adminfo-item">
                            <span class="ipd-merged-adminfo-key">Adm. Date</span>
                            <span class="ipd-merged-adminfo-val" id="ipdProfileDate">—</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {{-- Body: sidebar + main --}}
        <div class="ipd-profile-body">

            {{-- Left sidebar - Quick Actions --}}
            <div class="ipd-profile-sidebar" id="ipdProfileSidebar">
                {{-- Actions populated by JS --}}
            </div>

            {{-- Right main panel --}}
            <div class="ipd-profile-main">
                {{-- Navigation tabs --}}
                <div class="ipd-profile-nav" id="ipdProfileNav">
                    <button class="ipd-profile-nav-tab active" data-pane="overview" onclick="switchIpdProfileTab(this, 'overview')">Overview</button>
                    <button class="ipd-profile-nav-tab" data-pane="clinical" onclick="switchIpdProfileTab(this, 'clinical')">Clinical Info</button>
                    <button class="ipd-profile-nav-tab" data-pane="billing" onclick="switchIpdProfileTab(this, 'billing')">Billing</button>
                    <button class="ipd-profile-nav-tab" data-pane="orders" onclick="switchIpdProfileTab(this, 'orders')">Orders</button>
                    <button class="ipd-profile-nav-tab" data-pane="investigations" onclick="switchIpdProfileTab(this, 'investigations')">Investigations</button>
                    <button class="ipd-profile-nav-tab" data-pane="nursing" onclick="switchIpdProfileTab(this, 'nursing')">Nursing</button>
                    <button class="ipd-profile-nav-tab" data-pane="discharge" onclick="switchIpdProfileTab(this, 'discharge')">Discharge</button>
                    <button class="ipd-profile-nav-tab" data-pane="mar" onclick="switchIpdProfileTab(this, 'mar')">Medication MAR</button>
                    <button class="ipd-profile-nav-tab" data-pane="ot" onclick="switchIpdProfileTab(this, 'ot')">OT Registration</button>
                    <button class="ipd-profile-nav-tab" data-pane="charting" onclick="switchIpdProfileTab(this, 'charting')">Charting & Docs</button>
                </div>

                {{-- Overview pane --}}
                <div class="ipd-profile-tab-pane active" id="ipdProfilePane-overview">
                    <div class="ipd-profile-placeholder">
                        <i data-lucide="layout-dashboard" style="width:40px;height:40px;opacity:.3"></i>
                        <p>Overview content will appear here</p>
                    </div>
                </div>

                {{-- Clinical Info pane --}}
                <div class="ipd-profile-tab-pane" id="ipdProfilePane-clinical">
                    <div class="ipd-profile-placeholder">
                        <i data-lucide="clipboard-list" style="width:40px;height:40px;opacity:.3"></i>
                        <p>Clinical information will appear here</p>
                    </div>
                </div>

                {{-- Billing pane --}}
                <div class="ipd-profile-tab-pane" id="ipdProfilePane-billing">
                    <div class="ipd-profile-placeholder">
                        <i data-lucide="receipt" style="width:40px;height:40px;opacity:.3"></i>
                        <p>Billing details will appear here</p>
                    </div>
                </div>

                {{-- Orders pane --}}
                <div class="ipd-profile-tab-pane" id="ipdProfilePane-orders">
                    <div class="ipd-profile-placeholder">
                        <i data-lucide="clipboard-check" style="width:40px;height:40px;opacity:.3"></i>
                        <p>Clinical orders will appear here</p>
                    </div>
                </div>

                {{-- Investigations pane --}}
                <div class="ipd-profile-tab-pane" id="ipdProfilePane-investigations">
                    <div class="ipd-profile-placeholder">
                        <i data-lucide="flask-conical" style="width:40px;height:40px;opacity:.3"></i>
                        <p>Investigation results will appear here</p>
                    </div>
                </div>

                {{-- Nursing pane --}}
                <div class="ipd-profile-tab-pane" id="ipdProfilePane-nursing">
                    <div class="ipd-profile-placeholder">
                        <i data-lucide="stethoscope" style="width:40px;height:40px;opacity:.3"></i>
                        <p>Nursing station records will appear here</p>
                    </div>
                </div>

                {{-- Discharge pane --}}
                <div class="ipd-profile-tab-pane" id="ipdProfilePane-discharge">
                    <div class="ipd-profile-placeholder">
                        <i data-lucide="log-out" style="width:40px;height:40px;opacity:.3"></i>
                        <p>Discharge details will appear here</p>
                    </div>
                </div>

                {{-- Medication MAR pane --}}
                <div class="ipd-profile-tab-pane" id="ipdProfilePane-mar">
                    <div class="ipd-profile-placeholder">
                        <i data-lucide="pill" style="width:40px;height:40px;opacity:.3"></i>
                        <p>Medication Administration Record will appear here</p>
                    </div>
                </div>

                {{-- Charting & Documentation pane --}}
                <div class="ipd-profile-tab-pane" id="ipdProfilePane-charting">
                    <div class="ipd-profile-placeholder">
                        <i data-lucide="file-text" style="width:40px;height:40px;opacity:.3"></i>
                        <p>Charting & Documentation will appear here</p>
                    </div>
                </div>

                {{-- OT Registration pane --}}
                <div class="ipd-profile-tab-pane" id="ipdProfilePane-ot">
                    <div class="ipd-profile-placeholder">
                        <i data-lucide="syringe" style="width:40px;height:40px;opacity:.3"></i>
                        <p>OT Registration will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@push('styles')
<style>

/* ═══════════════════════════════════════════════════════════════════════════
   IPD Registration — OPD-style toolbar / filter-pane / pagination
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Toolbar ─────────────────────────────────────────────────────────────── */
.opd-toolbar {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 14px; flex-wrap: wrap;
}
.opd-search-wrap { position: relative; flex: 1; min-width: 200px; }
.opd-search-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    width: 16px; height: 16px; color: var(--color-muted-foreground); pointer-events: none;
}
.opd-search-input {
    width: 100%; height: 40px; padding: 0 14px 0 40px;
    border: 1px solid var(--color-border); border-radius: 10px;
    background: var(--color-card) !important; background-color: #ffffff !important;
    font-size: 13.5px; color: var(--color-foreground); outline: none;
    transition: border-color .15s, box-shadow .15s;
}
.opd-search-input::placeholder { color: var(--color-muted-foreground); }
.opd-search-input:focus { border-color: #060740; box-shadow: 0 0 0 3px rgba(6,7,64,.08); }
.opd-toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.opd-tool-btn {
    display: inline-flex; align-items: center; gap: 7px;
    height: 40px; padding: 0 16px;
    border: 1px solid var(--color-border); border-radius: 10px;
    background: var(--color-card); font-size: 13.5px; font-weight: 600;
    color: var(--color-foreground); cursor: pointer; white-space: nowrap;
    transition: background .15s, border-color .15s, box-shadow .15s;
}
.opd-tool-btn svg { width: 15px; height: 15px; color: var(--color-muted-foreground); }
.opd-tool-btn--icon { width: 40px; padding: 0; justify-content: center; gap: 0; }
.opd-tool-btn:hover { background: var(--color-muted); border-color: #060740; box-shadow: 0 2px 6px rgba(6,7,64,.08); }
.opd-tool-btn:active { transform: scale(.97); }
.opd-tool-btn.filter-active { background: rgba(6,7,64,.06); border-color: #060740; color: #060740; }

/* ── Filter badge ────────────────────────────────────────────────────────── */
.opd-filter-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 18px; height: 18px; padding: 0 5px; border-radius: 20px;
    background: #060740; color: #7FFFD4; font-size: 10px; font-weight: 800;
    line-height: 1; margin-left: 2px;
}

/* ── Export dropdown ─────────────────────────────────────────────────────── */
.opd-export-wrap { position: relative; }
.opd-export-menu {
    display: none; position: absolute; right: 0; top: calc(100% + 6px);
    z-index: 200; min-width: 180px; background: var(--color-card);
    border: 1px solid var(--color-border); border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.12); padding: 6px; overflow: hidden;
}
.opd-export-menu.open { display: block; }
.opd-export-menu button {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 9px 12px; border: none; background: none;
    font-size: 13.5px; font-weight: 500; color: var(--color-foreground);
    cursor: pointer; border-radius: 7px; text-align: left; transition: background .12s;
}
.opd-export-menu button:hover { background: var(--color-muted); }
.opd-export-menu button svg { width: 15px; height: 15px; color: var(--color-muted-foreground); flex-shrink: 0; }

/* ── Rows-per-page dropdown ──────────────────────────────────────────────── */
.opd-rows-wrap { position: relative; }
.opd-rows-menu {
    display: none; position: absolute; left: 0; top: calc(100% + 6px);
    z-index: 200; min-width: 140px; background: var(--color-card);
    border: 1px solid var(--color-border); border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.12); padding: 6px; overflow: hidden;
}
.opd-rows-menu.open { display: block; }
.opd-rows-head {
    padding: 8px 10px 6px; font-size: 11px; font-weight: 700;
    color: var(--color-muted-foreground); text-transform: uppercase; letter-spacing: .04em;
    border-bottom: 1px solid var(--color-border); margin-bottom: 4px;
}
.opd-rows-menu button {
    display: flex; align-items: center; width: 100%; padding: 8px 10px;
    border: none; background: none; font-size: 13px; font-weight: 500;
    color: var(--color-foreground); cursor: pointer; border-radius: 7px;
    text-align: left; transition: background .1s;
}
.opd-rows-menu button:hover { background: var(--color-muted); }
.opd-rows-menu button.active { background: #060740; color: #fff; font-weight: 600; }

/* ── Column Visibility ───────────────────────────────────────────────────── */
.opd-col-vis-wrap { position: relative; }
.opd-col-vis-menu {
    display: none; position: absolute; right: 0; top: calc(100% + 6px);
    z-index: 200; width: 220px; background: var(--color-card);
    border: 1px solid var(--color-border); border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.12); overflow: hidden;
}
.opd-col-vis-menu.open { display: block; }
.opd-col-vis-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 14px 10px; border-bottom: 1px solid var(--color-border);
    font-size: 13px; font-weight: 700; color: var(--color-foreground);
}
.opd-col-vis-selall {
    font-size: 11.5px; font-weight: 500; color: #060740;
    background: none; border: none; cursor: pointer; padding: 0;
    text-decoration: underline; text-underline-offset: 2px;
}
.opd-col-vis-list { padding: 8px 6px; max-height: 280px; overflow-y: auto; }
.opd-col-vis-list label {
    display: flex; align-items: center; gap: 10px; padding: 7px 8px;
    border-radius: 6px; font-size: 13px; font-weight: 500; color: var(--color-foreground);
    cursor: pointer; transition: background .1s;
}
.opd-col-vis-list label:hover { background: var(--color-muted); }
.opd-col-vis-list input[type="checkbox"] { width: 15px; height: 15px; accent-color: #060740; cursor: pointer; flex-shrink: 0; }
.opd-col-vis-foot { padding: 10px 14px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; }
.opd-col-vis-save {
    height: 32px; padding: 0 18px; background: #060740; color: #fff;
    border: none; border-radius: 7px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: opacity .15s;
}
.opd-col-vis-save:hover { opacity: .88; }

/* ── Filter Pane ─────────────────────────────────────────────────────────── */
.opd-filter-pane {
    background: var(--color-card); border: 1px solid var(--color-border);
    border-radius: 12px; margin-bottom: 14px; overflow: visible;
    box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.opd-filter-pane-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 18px; border-bottom: 1px solid var(--color-border);
    background: rgba(6,7,64,.02); border-radius: 12px 12px 0 0; overflow: hidden;
}
.opd-filter-close {
    width: 28px; height: 28px; border-radius: 7px;
    border: 1px solid var(--color-border); background: var(--color-card);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background .15s;
}
.opd-filter-close:hover { background: var(--color-muted); }
.opd-filter-close svg { width: 14px; height: 14px; }
.opd-filter-pane-body {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; padding: 16px 18px;
}
@media(max-width:1100px) { .opd-filter-pane-body { grid-template-columns: repeat(3,1fr); } }
@media(max-width:700px)  { .opd-filter-pane-body { grid-template-columns: 1fr 1fr; } }
.opd-filter-field { display: flex; flex-direction: column; gap: 5px; }
.opd-filter-label {
    font-size: 11.5px; font-weight: 700; color: var(--color-muted-foreground);
    text-transform: uppercase; letter-spacing: .04em;
}
.opd-filter-input,
.opd-filter-select {
    height: 38px; padding: 0 12px;
    border: 1px solid #e2e6ea; border-radius: 8px;
    background: #ffffff !important; background-color: #ffffff !important;
    color-scheme: light;
    font-size: 13.5px; color: #111827 !important; outline: none;
    transition: border-color .15s, box-shadow .15s; width: 100%;
}
.opd-filter-input::placeholder { color: #6b7280; }
input[type="date"].opd-filter-input { color-scheme: light; }
.opd-filter-input:focus,
.opd-filter-select:focus {
    border-color: #060740; box-shadow: 0 0 0 3px rgba(6,7,64,.07); background: #fff !important;
}
.opd-filter-pane-foot {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 8px; padding: 12px 18px;
    border-top: 1px solid var(--color-border); background: rgba(6,7,64,.02);
}
.opd-filter-reset {
    display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 16px;
    border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-card);
    font-size: 13px; font-weight: 600; color: var(--color-muted-foreground);
    cursor: pointer; transition: all .15s;
}
.opd-filter-reset:hover { background: var(--color-muted); color: var(--color-foreground); }
.opd-filter-reset svg { width: 13px; height: 13px; }
.opd-filter-apply {
    display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 20px;
    border: none; border-radius: 8px; background: #060740; color: #7FFFD4;
    font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity .15s, transform .1s;
}
.opd-filter-apply:hover { opacity: .88; }
.opd-filter-apply:active { transform: scale(.97); }
.opd-filter-apply svg { width: 13px; height: 13px; }

/* ── Pagination ──────────────────────────────────────────────────────────── */
.opd-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-top: 1px solid var(--color-border);
    flex-wrap: wrap; gap: 10px;
}
.opd-pagination-left { display: flex; align-items: center; gap: 16px; }
.opd-page-info { font-size: 12.5px; color: var(--color-muted-foreground); font-weight: 500; }
.opd-page-btns { display: flex; align-items: center; gap: 4px; }
.opd-page-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1px solid var(--color-border); background: var(--color-card);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all .15s; color: var(--color-foreground);
}
.opd-page-btn svg { width: 15px; height: 15px; }
.opd-page-btn:hover:not(:disabled) { background: var(--color-muted); border-color: #060740; }
.opd-page-btn:disabled { opacity: .4; cursor: not-allowed; }
.opd-page-nums { display: flex; align-items: center; gap: 4px; }
.opd-page-num {
    min-width: 34px; height: 34px; padding: 0 8px; border-radius: 8px;
    border: 1px solid var(--color-border); background: var(--color-card);
    font-size: 13px; font-weight: 600; color: var(--color-foreground);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all .15s;
}
.opd-page-num:hover { background: var(--color-muted); }
.opd-page-num.active { background: #060740; color: #7FFFD4; border-color: #060740; }

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
.opd-dp-val.opd-ph { color: #9ca3af !important; }
.opd-dp-popup {
    display: none; position: fixed; z-index: 9999;
    background: #fff; border: 1px solid #e2e6ea;
    border-radius: 12px; box-shadow: 0 8px 28px rgba(0,0,0,0.13);
    padding: 14px; min-width: 268px;
}
.opd-dp-popup.open { display: block; }
.opd-dp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.opd-dp-nav { background: none; border: none; cursor: pointer; padding: 4px 10px; border-radius: 6px; font-size: 18px; color: var(--color-foreground); line-height: 1; }
.opd-dp-nav:hover { background: var(--color-muted); }
.opd-dp-month-year { font-size: 14px; font-weight: 600; color: var(--color-foreground); }
.opd-dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.opd-dp-dayname { font-size: 11px; font-weight: 600; color: var(--color-muted-foreground); text-align: center; padding: 4px 0; }
.opd-dp-day { font-size: 13px; text-align: center; padding: 7px 2px; border-radius: 6px; cursor: pointer; color: var(--color-foreground); }
.opd-dp-day:hover:not(.empty) { background: var(--color-muted); }
.opd-dp-day.selected { background: #2563EB; color: #fff; font-weight: 600; }
.opd-dp-day.selected:hover { background: #1D4ED8; }
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
.opd-cs-val.opd-ph { color: #9ca3af !important; }
.opd-cs-popup {
    display: none; position: fixed; z-index: 9999;
    background: #fff; border: 1px solid #e2e6ea;
    border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,0.13); overflow: hidden;
}
.opd-cs-popup.open { display: block; }
.opd-cs-search { width: 100%; padding: 9px 14px; border: none; border-bottom: 1px solid var(--color-border); font-size: 13px; outline: none; background: #fff; color: var(--color-foreground); }
.opd-cs-list { max-height: 200px; overflow-y: auto; }
.opd-cs-option { padding: 10px 14px; font-size: 13.5px; cursor: pointer; color: var(--color-foreground); border-bottom: 1px solid rgba(0,0,0,0.04); }
.opd-cs-option:hover { background: var(--color-muted); }
.opd-cs-option.selected { background: #EFF6FF; color: #1D4ED8; font-weight: 500; }
.opd-cs-option:last-child { border-bottom: none; }
.opd-cs-empty { padding: 12px 14px; font-size: 13px; color: var(--color-muted-foreground); text-align: center; }

/* ═══════════════════════════════════════════════════════════════════════════ */

@keyframes spin { to { transform: rotate(360deg); } }
.mar-filter-btn, .mar-shift-btn, .nursing-shift-btn {
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    border: none;
    background: transparent;
    color: var(--color-muted-foreground);
    cursor: pointer;
    transition: all 0.15s;
}
.mar-filter-btn.active { background: var(--aquamint); color: var(--midnight-blue); }
.mar-shift-btn.active, .nursing-shift-btn.active { background: var(--midnight-blue); color: #fff; border-radius: 999px; }
.mar-shift-btn:not(.active), .nursing-shift-btn:not(.active) { border-radius: 999px; }
.mar-shift-btn:not(.active):hover, .nursing-shift-btn:not(.active):hover { background: var(--color-muted); }

.mar-patient-btn {
    display: flex; width: 100%; align-items: center; gap: 12px;
    border-radius: 8px; padding: 12px; text-align: left;
    transition: all 0.15s; border: none; background: transparent;
    border-left: 4px solid transparent; cursor: pointer;
}
.mar-patient-btn:hover { background: rgba(0,0,0,0.03); }
.mar-patient-btn.active { background: var(--color-muted); border-left-color: var(--aquamint); }
.mar-patient-btn.overdue { border-left-color: var(--color-destructive); }

.med-schedule-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px; transition: background 0.15s; border-bottom: 1px solid var(--color-border);
}
.med-schedule-row:hover { background: rgba(0,0,0,0.02); }
.med-schedule-row.missed-bg { background: rgba(239,68,68,0.05); }

.nursing-bed-card {
    position: relative; border-radius: 12px; border: 1px solid var(--color-border);
    border-left-width: 4px; background: var(--color-card); padding: 12px;
    text-align: left; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: all 0.15s; cursor: pointer;
}
.nursing-bed-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.nursing-bed-card.selected { box-shadow: 0 0 0 2px var(--aquamint),0 4px 12px rgba(0,0,0,0.1); }
.nursing-bed-card.disabled { opacity: 0.5; cursor: default; }
.nursing-bed-card.border-stable { border-left-color: var(--color-success); }
.nursing-bed-card.border-attention { border-left-color: #F59E0B; }
.nursing-bed-card.border-critical { border-left-color: var(--color-destructive); }
.nursing-bed-card.border-vacant { border-left-color: var(--color-muted); }
.nursing-bed-card.border-maintenance { border-left-color: var(--color-muted-foreground); opacity: 0.5; }

.payment-mode-option {
    display: flex; cursor: pointer; align-items: center; gap: 8px;
    border-radius: 8px; border: 2px solid var(--color-border);
    padding: 10px 12px; transition: all 0.15s; font-size: 14px; font-weight: 500;
}
.payment-mode-option:hover { border-color: rgba(127,255,212,0.5); }
.payment-mode-option.active { border-color: var(--aquamint); background: var(--color-muted); }
.payment-mode-option.active i { color: var(--midnight-blue); }
.payment-mode-option.active span { color: var(--midnight-blue); }

.order-type-btn {
    display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    border-radius: 8px; padding: 12px 16px; transition: all 0.15s;
    border: 1px solid var(--color-border); background: var(--color-card);
    color: var(--color-muted-foreground); cursor: pointer; font-size: 14px; font-weight: 500;
}
.order-type-btn.active { background: var(--aquamint); color: var(--midnight-blue); border-color: var(--aquamint); box-shadow: 0 4px 12px rgba(127,255,212,0.3); }
.order-type-btn:not(.active):hover { background: var(--color-muted); }

.inv-filter-btn {
    display: flex; align-items: center; gap: 6px; border-radius: 999px;
    padding: 6px 12px; font-size: 12px; font-weight: 500;
    transition: all 0.15s; border: none; cursor: pointer;
    background: var(--color-muted); color: var(--color-muted-foreground);
}
.inv-filter-btn.active { background: var(--midnight-blue); color: #fff; }
.inv-filter-btn:not(.active):hover { background: rgba(0,0,0,0.08); }

.inv-status-dots { display: flex; align-items: center; gap: 2px; }
.inv-status-dots .dot { width: 8px; height: 8px; border-radius: 50%; }
.inv-status-dots .dot.active { background: var(--aquamint); }
.inv-status-dots .dot.inactive { background: var(--color-muted); }
.inv-status-dots .line { width: 12px; height: 2px; }
.inv-status-dots .line.active { background: var(--aquamint); }
.inv-status-dots .line.inactive { background: var(--color-muted); }

.discharge-condition-btn {
    display: flex; cursor: pointer; align-items: center; gap: 8px;
    border-radius: 8px; border: 2px solid var(--color-border);
    padding: 12px 16px; transition: all 0.15s; font-size: 14px; font-weight: 500;
}
.discharge-condition-btn:hover { border-color: rgba(127,255,212,0.3); }

.pain-scale-btn {
    width: 28px; height: 32px; border-radius: 4px; border: none;
    font-size: 10px; font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.pain-scale-btn.low { background: rgba(16,185,129,0.1); color: var(--color-success); }
.pain-scale-btn.low:hover { background: rgba(16,185,129,0.2); }
.pain-scale-btn.mid { background: rgba(245,158,11,0.1); color: #F59E0B; }
.pain-scale-btn.mid:hover { background: rgba(245,158,11,0.2); }
.pain-scale-btn.high { background: rgba(239,68,68,0.1); color: var(--color-destructive); }
.pain-scale-btn.high:hover { background: rgba(239,68,68,0.2); }
.pain-scale-btn.selected { box-shadow: inset 0 0 0 2px currentColor; }

.freq-btn {
    border-radius: 999px; border: 1px solid var(--color-border);
    padding: 4px 8px; font-size: 10px; font-weight: 500;
    background: transparent; cursor: pointer; transition: all 0.15s;
}
.freq-btn:hover, .freq-btn.active { background: var(--aquamint); color: var(--midnight-blue); border-color: var(--aquamint); }

@media (min-width: 768px) {
    .nursing-grid { grid-template-columns: repeat(3, 1fr) !important; }
}
@media (min-width: 1024px) {
    .nursing-grid { grid-template-columns: repeat(4, 1fr) !important; }
}
@media (min-width: 1280px) {
    .nursing-grid { grid-template-columns: repeat(6, 1fr) !important; }
}
</style>
@endpush

@push('scripts')
<script src="{{ asset('js/ipd.js') }}?v={{ filemtime(public_path('js/ipd.js')) }}"></script>
@endpush
