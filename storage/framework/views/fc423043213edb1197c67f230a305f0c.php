<?php $__env->startSection('content'); ?>
<div class="module-page">
    <nav class="module-tabs">
        <button class="module-tab active" data-tab="scheduling" data-permission="ot.scheduling.access">
            <i data-lucide="calendar"></i>
            <span class="hide-mobile">Scheduling</span>
        </button>
        <button class="module-tab" data-tab="checklist" data-permission="ot.checklist.access">
            <i data-lucide="clipboard-list"></i>
            <span class="hide-mobile">Pre-Op Checklist</span>
        </button>
        <button class="module-tab" data-tab="intraop" data-permission="ot.intraop.access">
            <i data-lucide="syringe"></i>
            <span class="hide-mobile">Intra-Op</span>
        </button>
        <button class="module-tab" data-tab="postop" data-permission="ot.postop.access">
            <i data-lucide="bed-double"></i>
            <span class="hide-mobile">Post-Op</span>
        </button>
    </nav>

    
    <div class="tab-content" id="tab-scheduling">
        <div class="module-header">
            <div>
                <h1 id="otTabTitle">Surgery Scheduling</h1>
                <p class="module-subtitle">Manage surgical operations and theater resources</p>
            </div>
            <div class="module-header-actions" id="otHeaderActions">
                <button class="btn-primary" id="btnBookNewSurgery"><i data-lucide="plus"></i> Book New Surgery</button>
            </div>
        </div>

        <div class="mini-stats" id="otStats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Surgeries</p>
                        <h3 class="mini-stat-value" style="color:#3B82F6" id="statTotalSurgeries">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="calendar" style="color:#3B82F6"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Scheduled</p>
                        <h3 class="mini-stat-value" style="color:#CA8A04" id="statScheduled">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(202,138,4,0.1)"><i data-lucide="clock" style="color:#CA8A04"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Completed Today</p>
                        <h3 class="mini-stat-value" style="color:#10B981" id="statCompletedToday">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(16,185,129,0.1)"><i data-lucide="check-circle" style="color:#10B981"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">In Progress</p>
                        <h3 class="mini-stat-value" style="color:#7C3AED" id="statInProgress">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(124,58,237,0.1)"><i data-lucide="activity" style="color:#7C3AED"></i></div>
                </div>
            </div>
        </div>

        
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <svg class="opd-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" class="opd-search-input" id="otSchSearch" placeholder="Search by MRN, Patient, Procedure...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" id="btnOtSchFilter" onclick="toggleOtSchFilter(event)" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="otSchFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" id="otSchRowsBtn" onclick="toggleOtSchRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="otSchRowsMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setOtSchRowsPer(10)">10 rows</button>
                        <button onclick="setOtSchRowsPer(25)">25 rows</button>
                        <button onclick="setOtSchRowsPer(50)">50 rows</button>
                        <button onclick="setOtSchRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" title="Column Visibility" onclick="toggleOtSchColVis(event)">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="otSchColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" onclick="otSchColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="otSchColVisList">
                            <label><input type="checkbox" checked data-col="0"> MRN</label>
                            <label><input type="checkbox" checked data-col="1"> Visit ID</label>
                            <label><input type="checkbox" checked data-col="2"> Patient Name</label>
                            <label><input type="checkbox" checked data-col="3"> Procedure</label>
                            <label><input type="checkbox" checked data-col="4"> Surgeon</label>
                            <label><input type="checkbox" checked data-col="5"> Theater</label>
                            <label><input type="checkbox" checked data-col="6"> Priority</label>
                            <label><input type="checkbox" checked data-col="7"> Status</label>
                            <label><input type="checkbox" checked data-col="8"> Payment</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" onclick="applyOtSchColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" onclick="toggleOtSchExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="otSchExportMenu">
                        <button onclick="exportOtSch('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportOtSch('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="opd-filter-pane" id="otSchFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <span style="font-size:13px;font-weight:700;color:var(--color-foreground)">Filter Surgeries</span>
                <button class="opd-filter-close" onclick="toggleOtSchFilter()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Status</label>
                    <div class="opd-cs-wrap" id="otSchCsStatus" data-target="otSchStatusFilter" data-placeholder="All Status"></div>
                    <input type="hidden" id="otSchStatusFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Surgeon</label>
                    <div class="opd-cs-wrap" id="otSchCsSurgeon" data-target="otSchSurgeonFilter" data-placeholder="All Surgeons"></div>
                    <input type="hidden" id="otSchSurgeonFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Priority</label>
                    <div class="opd-cs-wrap" id="otSchCsPriority" data-target="otSchPriorityFilter" data-placeholder="All Priorities"></div>
                    <input type="hidden" id="otSchPriorityFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="otSchDpDateFrom" data-target="otSchDateFrom" data-placeholder="Select date"></div>
                    <input type="hidden" id="otSchDateFrom">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="otSchDpDateTo" data-target="otSchDateTo" data-placeholder="Select date"></div>
                    <input type="hidden" id="otSchDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" onclick="resetOtSchFilters()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.86"/></svg>
                    Reset
                </button>
                <button class="opd-filter-apply" onclick="applyOtSchFilters()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Apply Filters
                </button>
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="otSchTable">
                    <thead>
                        <tr>
                            <th>MRN</th>
                            <th>Visit ID</th>
                            <th>Patient Name</th>
                            <th>Procedure</th>
                            <th>Surgeon</th>
                            <th>Theater</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Scheduled Date &amp; Time</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="otTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="otSchPagination">
                <span class="opd-page-info" id="otSchTableInfo">Showing 0–0 of 0 surgeries</span>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="otSchPrevPage" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div class="opd-page-nums" id="otSchPageNums"></div>
                    <button class="opd-page-btn" id="otSchNextPage" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-checklist" style="display:none">
        <div class="module-header">
            <div>
                <h1>Pre-Operative Checklist</h1>
                <p class="module-subtitle">Patients scheduled for surgery — verify all pre-op requirements</p>
            </div>
        </div>

        <div class="mini-stats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Today's Surgeries</p>
                        <h3 class="mini-stat-value" style="color:#3B82F6" id="preOpStatTotal">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="calendar" style="color:#3B82F6"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Checklist Complete</p>
                        <h3 class="mini-stat-value" style="color:#10B981" id="preOpStatComplete">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(16,185,129,0.1)"><i data-lucide="check-circle" style="color:#10B981"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">In Progress</p>
                        <h3 class="mini-stat-value" style="color:#CA8A04" id="preOpStatInProgress">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(202,138,4,0.1)"><i data-lucide="clock" style="color:#CA8A04"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Not Started</p>
                        <h3 class="mini-stat-value" style="color:#EF4444" id="preOpStatNotStarted">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(239,68,68,0.1)"><i data-lucide="alert-circle" style="color:#EF4444"></i></div>
                </div>
            </div>
        </div>

        
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <svg class="opd-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" class="opd-search-input" id="preOpSearch" placeholder="Search patient or procedure...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" id="btnOtPreFilter" onclick="toggleOtPreFilter(event)" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="otPreFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" id="otPreRowsBtn" onclick="toggleOtPreRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="otPreRowsMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setOtPreRowsPer(10)">10 rows</button>
                        <button onclick="setOtPreRowsPer(25)">25 rows</button>
                        <button onclick="setOtPreRowsPer(50)">50 rows</button>
                        <button onclick="setOtPreRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" title="Column Visibility" onclick="toggleOtPreColVis(event)">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="otPreColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" onclick="otPreColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="otPreColVisList">
                            <label><input type="checkbox" checked data-col="0"> Surgery ID</label>
                            <label><input type="checkbox" checked data-col="1"> Patient Name</label>
                            <label><input type="checkbox" checked data-col="2"> Procedure</label>
                            <label><input type="checkbox" checked data-col="3"> Scheduled Time</label>
                            <label><input type="checkbox" checked data-col="4"> OT Number</label>
                            <label><input type="checkbox" checked data-col="5"> Pre-Op Status</label>
                            <label><input type="checkbox" checked data-col="6"> Consent</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" onclick="applyOtPreColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" onclick="toggleOtPreExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="otPreExportMenu">
                        <button onclick="exportOtPre('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportOtPre('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="opd-filter-pane" id="otPreFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <span style="font-size:13px;font-weight:700;color:var(--color-foreground)">Filter Pre-Op Checklist</span>
                <button class="opd-filter-close" onclick="toggleOtPreFilter(event)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Checklist Status</label>
                    <div class="opd-cs-wrap" id="otPreCsStatus" data-target="otPreStatusFilter" data-placeholder="All Status"></div>
                    <input type="hidden" id="otPreStatusFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">OT Number</label>
                    <div class="opd-cs-wrap" id="otPreCsTheater" data-target="otPreTheaterFilter" data-placeholder="All OTs"></div>
                    <input type="hidden" id="otPreTheaterFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="otPreDpDateFrom" data-target="otPreDateFrom" data-placeholder="Select date"></div>
                    <input type="hidden" id="otPreDateFrom">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="otPreDpDateTo" data-target="otPreDateTo" data-placeholder="Select date"></div>
                    <input type="hidden" id="otPreDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" onclick="resetOtPreFilters()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.86"/></svg>
                    Reset
                </button>
                <button class="opd-filter-apply" onclick="applyOtPreFilters()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Apply Filters
                </button>
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="otPreTable">
                    <thead>
                        <tr>
                            <th>Surgery ID</th>
                            <th>Patient Name</th>
                            <th>Procedure</th>
                            <th>Scheduled Time</th>
                            <th>OT Number</th>
                            <th>Pre-Op Status</th>
                            <th>Consent</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody id="preOpTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="otPrePagination">
                <span class="opd-page-info" id="otPreTableInfo">Showing 0–0 of 0 records</span>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="otPrePrevPage" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div class="opd-page-nums" id="otPrePageNums"></div>
                    <button class="opd-page-btn" id="otPreNextPage" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-intraop" style="display:none">
        <div class="module-header">
            <div>
                <h1>Intra-Operative Records</h1>
                <p class="module-subtitle">Live surgery documentation — anesthesia, surgical notes, and WHO safety checklist</p>
            </div>
        </div>

        <div class="mini-stats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Active Surgeries</p>
                        <h3 class="mini-stat-value" style="color:#7C3AED" id="intraOpStatActive">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(124,58,237,0.1)"><i data-lucide="activity" style="color:#7C3AED"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Scheduled Today</p>
                        <h3 class="mini-stat-value" style="color:#CA8A04" id="intraOpStatScheduled">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(202,138,4,0.1)"><i data-lucide="clock" style="color:#CA8A04"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Completed Today</p>
                        <h3 class="mini-stat-value" style="color:#10B981" id="intraOpStatCompleted">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(16,185,129,0.1)"><i data-lucide="check-circle" style="color:#10B981"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Avg Duration</p>
                        <h3 class="mini-stat-value" style="color:#3B82F6" id="intraOpStatAvgDuration">-</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="timer" style="color:#3B82F6"></i></div>
                </div>
            </div>
        </div>

        
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <svg class="opd-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" class="opd-search-input" id="intraOpSearch" placeholder="Search patient, procedure, or surgeon...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" id="btnOtIoFilter" onclick="toggleOtIoFilter(event)" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="otIoFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" id="otIoRowsBtn" onclick="toggleOtIoRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="otIoRowsMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setOtIoRowsPer(10)">10 rows</button>
                        <button onclick="setOtIoRowsPer(25)">25 rows</button>
                        <button onclick="setOtIoRowsPer(50)">50 rows</button>
                        <button onclick="setOtIoRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" title="Column Visibility" onclick="toggleOtIoColVis(event)">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="otIoColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" onclick="otIoColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="otIoColVisList">
                            <label><input type="checkbox" checked data-col="0"> Surgery ID</label>
                            <label><input type="checkbox" checked data-col="1"> Patient Name</label>
                            <label><input type="checkbox" checked data-col="2"> Procedure</label>
                            <label><input type="checkbox" checked data-col="3"> OT Number</label>
                            <label><input type="checkbox" checked data-col="4"> Started Time</label>
                            <label><input type="checkbox" checked data-col="5"> Duration</label>
                            <label><input type="checkbox" checked data-col="6"> Current Phase</label>
                            <label><input type="checkbox" checked data-col="7"> Surgeon</label>
                            <label><input type="checkbox" checked data-col="8"> Status</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" onclick="applyOtIoColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" onclick="toggleOtIoExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="otIoExportMenu">
                        <button onclick="exportOtIo('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportOtIo('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="opd-filter-pane" id="otIoFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <span style="font-size:13px;font-weight:700;color:var(--color-foreground)">Filter Intra-Op Records</span>
                <button class="opd-filter-close" onclick="toggleOtIoFilter(event)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Status</label>
                    <div class="opd-cs-wrap" id="otIoCsStatus" data-target="otIoStatusFilter" data-placeholder="All Status"></div>
                    <input type="hidden" id="otIoStatusFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Surgeon</label>
                    <div class="opd-cs-wrap" id="otIoCsSurgeon" data-target="otIoSurgeonFilter" data-placeholder="All Surgeons"></div>
                    <input type="hidden" id="otIoSurgeonFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">OT Number</label>
                    <div class="opd-cs-wrap" id="otIoCsTheater" data-target="otIoTheaterFilter" data-placeholder="All OTs"></div>
                    <input type="hidden" id="otIoTheaterFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="otIoDpDateFrom" data-target="otIoDateFrom" data-placeholder="Select date"></div>
                    <input type="hidden" id="otIoDateFrom">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="otIoDpDateTo" data-target="otIoDateTo" data-placeholder="Select date"></div>
                    <input type="hidden" id="otIoDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" onclick="resetOtIoFilters()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.86"/></svg>
                    Reset
                </button>
                <button class="opd-filter-apply" onclick="applyOtIoFilters()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Apply Filters
                </button>
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="otIoTable">
                    <thead>
                        <tr>
                            <th>Surgery ID</th>
                            <th>Patient Name</th>
                            <th>Procedure</th>
                            <th>OT Number</th>
                            <th>Started Time</th>
                            <th>Duration</th>
                            <th>Current Phase</th>
                            <th>Surgeon</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody id="intraOpTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="otIoPagination">
                <span class="opd-page-info" id="otIoTableInfo">Showing 0–0 of 0 records</span>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="otIoPrevPage" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div class="opd-page-nums" id="otIoPageNums"></div>
                    <button class="opd-page-btn" id="otIoNextPage" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-postop" style="display:none">
        <div class="module-header">
            <div>
                <h1>Post-Operative Recovery</h1>
                <p class="module-subtitle">Recovery room monitoring, daily progress notes, and discharge planning</p>
            </div>
        </div>

        <div class="mini-stats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">In Recovery (PACU)</p>
                        <h3 class="mini-stat-value" style="color:#7C3AED" id="postOpStatPACU">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(124,58,237,0.1)"><i data-lucide="activity" style="color:#7C3AED"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">In ICU</p>
                        <h3 class="mini-stat-value" style="color:#EF4444" id="postOpStatICU">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(239,68,68,0.1)"><i data-lucide="heart-pulse" style="color:#EF4444"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">In Ward</p>
                        <h3 class="mini-stat-value" style="color:#3B82F6" id="postOpStatWard">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(59,130,246,0.1)"><i data-lucide="bed-double" style="color:#3B82F6"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Ready for Discharge</p>
                        <h3 class="mini-stat-value" style="color:#10B981" id="postOpStatReady">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(16,185,129,0.1)"><i data-lucide="log-out" style="color:#10B981"></i></div>
                </div>
            </div>
        </div>

        
        <div class="opd-toolbar">
            <div class="opd-search-wrap">
                <svg class="opd-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" class="opd-search-input" id="postOpSearch" placeholder="Search patient, procedure, or location...">
            </div>
            <div class="opd-toolbar-right">
                <button class="opd-tool-btn opd-tool-btn--icon" id="btnOtPoFilter" onclick="toggleOtPoFilter(event)" title="Filter">
                    <i data-lucide="filter"></i>
                    <span class="opd-filter-badge" id="otPoFilterBadge" style="display:none">0</span>
                </button>
                <div class="opd-rows-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" id="otPoRowsBtn" onclick="toggleOtPoRowsMenu(event)" title="Rows per page">
                        <i data-lucide="layout-list"></i>
                    </button>
                    <div class="opd-rows-menu" id="otPoRowsMenu">
                        <div class="opd-rows-head font-normal">Rows per page</div>
                        <button onclick="setOtPoRowsPer(10)">10 rows</button>
                        <button onclick="setOtPoRowsPer(25)">25 rows</button>
                        <button onclick="setOtPoRowsPer(50)">50 rows</button>
                        <button onclick="setOtPoRowsPer(100)">100 rows</button>
                    </div>
                </div>
                <div class="opd-col-vis-wrap">
                    <button class="opd-tool-btn opd-tool-btn--icon" title="Column Visibility" onclick="toggleOtPoColVis(event)">
                        <i data-lucide="columns-3"></i>
                    </button>
                    <div class="opd-col-vis-menu" id="otPoColVisMenu">
                        <div class="opd-col-vis-head">
                            <span>Column Visibility</span>
                            <button class="opd-col-vis-selall" onclick="otPoColVisSelectAll()">Select All</button>
                        </div>
                        <div class="opd-col-vis-list" id="otPoColVisList">
                            <label><input type="checkbox" checked data-col="0"> Surgery ID</label>
                            <label><input type="checkbox" checked data-col="1"> Patient Name</label>
                            <label><input type="checkbox" checked data-col="2"> Procedure</label>
                            <label><input type="checkbox" checked data-col="3"> Completed Time</label>
                            <label><input type="checkbox" checked data-col="4"> Current Location</label>
                            <label><input type="checkbox" checked data-col="5"> Post-Op Status</label>
                            <label><input type="checkbox" checked data-col="6"> Complications</label>
                        </div>
                        <div class="opd-col-vis-foot">
                            <button class="opd-col-vis-save" onclick="applyOtPoColVis()">Save</button>
                        </div>
                    </div>
                </div>
                <div class="opd-export-wrap">
                    <button class="opd-tool-btn" onclick="toggleOtPoExportMenu(event)" title="Export" style="padding:0 10px">
                        <i data-lucide="upload"></i>
                        <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                    </button>
                    <div class="opd-export-menu" id="otPoExportMenu">
                        <button onclick="exportOtPo('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                        <button onclick="exportOtPo('print')"><i data-lucide="printer"></i> Print</button>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="opd-filter-pane" id="otPoFilterPane" style="display:none">
            <div class="opd-filter-pane-head">
                <span style="font-size:13px;font-weight:700;color:var(--color-foreground)">Filter Post-Op Records</span>
                <button class="opd-filter-close" onclick="toggleOtPoFilter(event)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="opd-filter-pane-body">
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Status</label>
                    <div class="opd-cs-wrap" id="otPoCsStatus" data-target="otPoStatusFilter" data-placeholder="All Status"></div>
                    <input type="hidden" id="otPoStatusFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Location</label>
                    <div class="opd-cs-wrap" id="otPoCsLocation" data-target="otPoLocationFilter" data-placeholder="All Locations"></div>
                    <input type="hidden" id="otPoLocationFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Complications</label>
                    <div class="opd-cs-wrap" id="otPoCsComp" data-target="otPoCompFilter" data-placeholder="All"></div>
                    <input type="hidden" id="otPoCompFilter">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date From</label>
                    <div class="opd-dp-wrap" id="otPoDpDateFrom" data-target="otPoDateFrom" data-placeholder="Select date"></div>
                    <input type="hidden" id="otPoDateFrom">
                </div>
                <div class="opd-filter-field">
                    <label class="opd-filter-label">Date To</label>
                    <div class="opd-dp-wrap" id="otPoDpDateTo" data-target="otPoDateTo" data-placeholder="Select date"></div>
                    <input type="hidden" id="otPoDateTo">
                </div>
            </div>
            <div class="opd-filter-pane-foot">
                <button class="opd-filter-reset" onclick="resetOtPoFilters()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.86"/></svg>
                    Reset
                </button>
                <button class="opd-filter-apply" onclick="applyOtPoFilters()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Apply Filters
                </button>
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="otPoTable">
                    <thead>
                        <tr>
                            <th>Surgery ID</th>
                            <th>Patient Name</th>
                            <th>Procedure</th>
                            <th>Completed Time</th>
                            <th>Current Location</th>
                            <th>Post-Op Status</th>
                            <th>Complications</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody id="postOpTableBody"></tbody>
                </table>
            </div>
            <div class="opd-pagination" id="otPoPagination">
                <span class="opd-page-info" id="otPoTableInfo">Showing 0–0 of 0 records</span>
                <div class="opd-page-btns">
                    <button class="opd-page-btn" id="otPoPrevPage" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div class="opd-page-nums" id="otPoPageNums"></div>
                    <button class="opd-page-btn" id="otPoNextPage" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="otBookingSheet" style="width:600px;max-width:95vw">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="otBookingSheetTitle"><i data-lucide="syringe"></i> Book New Surgery</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="otBookingSheetBody"></div>
    <div class="offcanvas-footer" id="otBookingSheetFooter"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="otChargesSheet" style="width:500px;max-width:95vw">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title"><i data-lucide="receipt"></i> Surgery Charges</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="otChargesSheetBody"></div>
    <div class="offcanvas-footer" id="otChargesSheetFooter"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="otDetailSheet" style="width:640px;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border)">
        <h5 class="offcanvas-title" style="color:#060740"><i data-lucide="clipboard-list"></i> Patient Registration Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="otDetailSheetBody" style="background:var(--color-muted);padding:24px"></div>
    <div class="offcanvas-footer" id="otDetailSheetFooter" style="border-top:1px solid var(--color-border);padding:16px 24px"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="otPostOpSheet" style="width:88%;max-width:98vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border)">
        <div style="display:flex;align-items:center;gap:12px">
            <h5 class="offcanvas-title" id="otPostOpSheetTitle"><i data-lucide="bed-double"></i> Post-Operative Notes</h5>
            <span class="badge" id="postOpLocationBadge" style="background:rgba(59,130,246,0.15);color:#3B82F6;font-size:11px;font-weight:600">Recovery</span>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:0;overflow-y:auto" id="otPostOpSheetBody"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="otIntraOpSheet" style="width:90%;max-width:98vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border)">
        <div style="display:flex;align-items:center;gap:12px">
            <h5 class="offcanvas-title" id="otIntraOpSheetTitle"><i data-lucide="syringe"></i> Intra-Operative Record</h5>
            <span class="badge" id="intraOpLivePhase" style="background:rgba(124,58,237,0.15);color:#7C3AED;font-size:11px;font-weight:600">Pre-Induction</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
            <span id="intraOpLiveTimer" style="font-size:14px;font-weight:700;font-family:monospace;color:#EF4444;display:none">00:00:00</span>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
    </div>
    <div class="offcanvas-body" style="padding:0;overflow-y:auto" id="otIntraOpSheetBody"></div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="otPreOpSheet" style="width:85%;max-width:95vw">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border)">
        <h5 class="offcanvas-title" id="otPreOpSheetTitle"><i data-lucide="clipboard-check"></i> Pre-Operative Checklist</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:0;overflow-y:auto" id="otPreOpSheetBody"></div>
</div>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('styles'); ?>
<style>
/* ── Shared Toolbar / Filter / Pagination (OT) ─────────────────────────── */
.opd-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap}
.opd-search-wrap{position:relative;flex:1;min-width:200px}
.opd-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--color-muted-foreground);pointer-events:none}
.opd-search-input{width:100%;height:40px;padding:0 14px 0 40px;border:1px solid var(--color-border);border-radius:10px;background:#fff!important;font-size:13.5px;color:var(--color-foreground);outline:none;transition:border-color .15s,box-shadow .15s}
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
.opd-filter-pane-body{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;padding:16px 18px}
@media(max-width:1100px){.opd-filter-pane-body{grid-template-columns:repeat(3,1fr)}}
@media(max-width:700px){.opd-filter-pane-body{grid-template-columns:1fr 1fr}}
.opd-filter-field{display:flex;flex-direction:column;gap:5px}
.opd-filter-label{font-size:11.5px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em}
.opd-filter-pane-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--color-border);background:rgba(6,7,64,.02)}
.opd-filter-reset{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-card);font-size:13px;font-weight:600;color:var(--color-muted-foreground);cursor:pointer;transition:all .15s}
.opd-filter-reset:hover{background:var(--color-muted);color:var(--color-foreground)}
.opd-filter-reset svg{width:13px;height:13px}
.opd-filter-apply{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 20px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .15s}
.opd-filter-apply:hover{opacity:.88}
.opd-filter-apply svg{width:13px;height:13px}
.opd-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-top:1px solid var(--color-border);flex-wrap:wrap;gap:10px}
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
.data-table-wrapper .opd-pagination{border-top:1px solid var(--color-border);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;background:var(--color-card)}
.opd-col-vis-head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px 10px;border-bottom:1px solid var(--color-border);font-size:13px;font-weight:700;color:var(--color-foreground)}
.opd-col-vis-selall{font-size:11.5px;font-weight:500;color:#060740;background:none;border:none;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px}
.opd-col-vis-foot{padding:10px 14px;border-top:1px solid var(--color-border);display:flex;justify-content:flex-end}
.opd-col-vis-save{height:32px;padding:0 18px;background:#060740;color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s}
.opd-col-vis-save:hover{opacity:.88}
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
.opd-dp-day.selected:hover{background:#1D4ED8}
.opd-dp-day.other-month{color:var(--color-muted-foreground);opacity:.35}
.opd-dp-day.empty{cursor:default}
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
.opd-cs-option{padding:10px 14px;font-size:13.5px;cursor:pointer;color:var(--color-foreground);border-bottom:1px solid rgba(0,0,0,0.04)}
.opd-cs-option:hover{background:var(--color-muted)}
.opd-cs-option.selected{background:#EFF6FF;color:#1D4ED8;font-weight:500}
.opd-cs-option:last-child{border-bottom:none}
.opd-cs-empty{padding:12px 14px;font-size:13px;color:var(--color-muted-foreground);text-align:center}
/* ─────────────────────────────────────────────────────────────────────────── */
.ot-source-btn {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border: 2px solid var(--color-border);
    border-radius: 12px;
    background: none;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
}
.ot-source-btn:hover { background: var(--color-muted); }
.ot-source-btn .ot-source-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: var(--color-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.ot-source-btn .ot-source-icon i { width: 24px; height: 24px; color: var(--midnight-blue); }
.ot-source-btn.source-opd:hover { border-color: #93C5FD; background: #EFF6FF; }
.ot-source-btn.source-er:hover { border-color: #FCA5A5; background: #FEF2F2; }
.ot-source-btn.source-ipd:hover { border-color: #C4B5FD; background: #F5F3FF; }
.ot-source-btn.source-direct:hover { border-color: #86EFAC; background: #F0FDF4; }

.ot-duration-btn {
    flex: 1;
    padding: 8px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-card);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
}
.ot-duration-btn:hover { background: var(--color-muted); }
.ot-duration-btn.active {
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

.ot-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.ot-detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ot-detail-item .ot-detail-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-muted-foreground);
}

.ot-detail-item .ot-detail-value {
    font-size: 14px;
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
<script src="<?php echo e(asset('js/ot.js')); ?>?v=<?php echo e(filemtime(public_path('js/ot.js'))); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\healthops\resources\views/pages/ot.blade.php ENDPATH**/ ?>