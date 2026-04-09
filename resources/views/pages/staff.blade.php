@extends('layouts.app')

@section('content')
<div class="module-page">
    <div class="module-header">
        <div>
            <h1><i data-lucide="users"></i> Staff Master</h1>
            <p class="module-subtitle">Manage all hospital staff and employees</p>
        </div>
        <div class="module-header-actions">
            <button class="btn-primary" id="btnAddStaff" data-require-permission="staff.create"><i data-lucide="user-plus"></i> Add Staff</button>
        </div>
    </div>

    <div class="mini-stats" id="staffStats">
        <div class="mini-stat-card">
            <div class="mini-stat-inner">
                <div>
                    <p class="mini-stat-label">Total Staff</p>
                    <h3 class="mini-stat-value" style="color:#2563eb" id="statTotal">0</h3>
                </div>
                <div class="mini-stat-icon" style="background:rgba(37,99,235,0.05)"><i data-lucide="users" style="color:#2563eb"></i></div>
            </div>
        </div>
        <div class="mini-stat-card">
            <div class="mini-stat-inner">
                <div>
                    <p class="mini-stat-label">Clinical Staff</p>
                    <h3 class="mini-stat-value" style="color:#16a34a" id="statClinical">0</h3>
                </div>
                <div class="mini-stat-icon" style="background:rgba(22,163,74,0.05)"><i data-lucide="heart-pulse" style="color:#16a34a"></i></div>
            </div>
        </div>
        <div class="mini-stat-card">
            <div class="mini-stat-inner">
                <div>
                    <p class="mini-stat-label">Support Staff</p>
                    <h3 class="mini-stat-value" style="color:#9333ea" id="statSupport">0</h3>
                </div>
                <div class="mini-stat-icon" style="background:rgba(147,51,234,0.05)"><i data-lucide="hard-hat" style="color:#9333ea"></i></div>
            </div>
        </div>
        <div class="mini-stat-card">
            <div class="mini-stat-inner">
                <div>
                    <p class="mini-stat-label">Admin Staff</p>
                    <h3 class="mini-stat-value" style="color:#ea580c" id="statAdmin">0</h3>
                </div>
                <div class="mini-stat-icon" style="background:rgba(234,88,12,0.05)"><i data-lucide="briefcase" style="color:#ea580c"></i></div>
            </div>
        </div>
        <div class="mini-stat-card">
            <div class="mini-stat-inner">
                <div>
                    <p class="mini-stat-label">Active</p>
                    <h3 class="mini-stat-value" style="color:#0891b2" id="statActive">0</h3>
                </div>
                <div class="mini-stat-icon" style="background:rgba(8,145,178,0.05)"><i data-lucide="check-circle" style="color:#0891b2"></i></div>
            </div>
        </div>
        <div class="mini-stat-card">
            <div class="mini-stat-inner">
                <div>
                    <p class="mini-stat-label">On Leave</p>
                    <h3 class="mini-stat-value" style="color:#dc2626" id="statLeave">0</h3>
                </div>
                <div class="mini-stat-icon" style="background:rgba(220,38,38,0.05)"><i data-lucide="calendar-off" style="color:#dc2626"></i></div>
            </div>
        </div>
    </div>

    {{-- Toolbar --}}
    <div class="opd-toolbar">
        <div class="opd-search-wrap">
            <svg class="opd-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" class="opd-search-input" id="staffSearch" placeholder="Search by name, employee ID, department, designation...">
        </div>
        <div class="opd-toolbar-right">
            <button class="opd-tool-btn opd-tool-btn--icon" id="btnSfFilter" onclick="toggleSfFilter(event)" title="Filter">
                <i data-lucide="filter"></i>
                <span class="opd-filter-badge" id="sfFilterBadge" style="display:none">0</span>
            </button>
            <div class="opd-rows-wrap">
                <button class="opd-tool-btn opd-tool-btn--icon" id="sfRowsBtn" onclick="toggleSfRowsMenu(event)" title="Rows per page">
                    <i data-lucide="layout-list"></i>
                </button>
                <div class="opd-rows-menu" id="sfRowsMenu">
                    <div class="opd-rows-head">Rows per page</div>
                    <button onclick="setSfRowsPer(10)">10 rows</button>
                    <button onclick="setSfRowsPer(25)">25 rows</button>
                    <button onclick="setSfRowsPer(50)">50 rows</button>
                    <button onclick="setSfRowsPer(100)">100 rows</button>
                </div>
            </div>
            <div class="opd-col-vis-wrap">
                <button class="opd-tool-btn opd-tool-btn--icon" title="Column Visibility" onclick="toggleSfColVis(event)">
                    <i data-lucide="columns-3"></i>
                </button>
                <div class="opd-col-vis-menu" id="sfColVisMenu">
                    <div class="opd-col-vis-head">
                        <span>Column Visibility</span>
                        <button class="opd-col-vis-selall" onclick="sfColVisSelectAll()">Select All</button>
                    </div>
                    <div class="opd-col-vis-list" id="sfColVisList">
                        <label><input type="checkbox" checked data-col="0"> Photo</label>
                        <label><input type="checkbox" checked data-col="1"> Staff ID</label>
                        <label><input type="checkbox" checked data-col="2"> Name</label>
                        <label><input type="checkbox" checked data-col="3"> Category</label>
                        <label><input type="checkbox" checked data-col="4"> Designation</label>
                        <label><input type="checkbox" checked data-col="5"> Department</label>
                        <label><input type="checkbox" checked data-col="6"> Shift</label>
                        <label><input type="checkbox" checked data-col="7"> Contact</label>
                        <label><input type="checkbox" checked data-col="8"> Status</label>
                    </div>
                    <div class="opd-col-vis-foot">
                        <button class="opd-col-vis-save" onclick="applySfColVis()">Save</button>
                    </div>
                </div>
            </div>
            <div class="opd-export-wrap">
                <button class="opd-tool-btn" onclick="toggleSfExportMenu(event)" title="Export" style="padding:0 10px">
                    <i data-lucide="upload"></i>
                    <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                </button>
                <div class="opd-export-menu" id="sfExportMenu">
                    <button onclick="exportSf('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                    <button onclick="exportSf('print')"><i data-lucide="printer"></i> Print</button>
                </div>
            </div>
        </div>
    </div>

    {{-- Filter Pane --}}
    <div class="opd-filter-pane" id="sfFilterPane" style="display:none">
        <div class="opd-filter-pane-head">
            <span style="font-size:13px;font-weight:700;color:var(--color-foreground)">Filter Staff</span>
            <button class="opd-filter-close" onclick="toggleSfFilter(event)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="opd-filter-pane-body">
            <div class="opd-filter-field">
                <label class="opd-filter-label">Status</label>
                <div class="opd-cs-wrap" id="sfCsStatus" data-target="sfStatusFilter" data-placeholder="All Status"></div>
                <input type="hidden" id="sfStatusFilter">
            </div>
            <div class="opd-filter-field">
                <label class="opd-filter-label">Category</label>
                <div class="opd-cs-wrap" id="sfCsCategory" data-target="sfCatFilter" data-placeholder="All Categories"></div>
                <input type="hidden" id="sfCatFilter">
            </div>
            <div class="opd-filter-field">
                <label class="opd-filter-label">Department</label>
                <div class="opd-cs-wrap" id="sfCsDept" data-target="sfDeptFilter" data-placeholder="All Departments"></div>
                <input type="hidden" id="sfDeptFilter">
            </div>
            <div class="opd-filter-field">
                <label class="opd-filter-label">Joining Date From</label>
                <div class="opd-dp-wrap" id="sfDpDateFrom" data-target="sfDateFrom" data-placeholder="Select date"></div>
                <input type="hidden" id="sfDateFrom">
            </div>
            <div class="opd-filter-field">
                <label class="opd-filter-label">Joining Date To</label>
                <div class="opd-dp-wrap" id="sfDpDateTo" data-target="sfDateTo" data-placeholder="Select date"></div>
                <input type="hidden" id="sfDateTo">
            </div>
        </div>
        <div class="opd-filter-pane-foot">
            <button class="opd-filter-reset" onclick="resetSfFilters()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.86"/></svg>
                Reset
            </button>
            <button class="opd-filter-apply" onclick="applySfFilters()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                Apply Filters
            </button>
        </div>
    </div>

    <div class="data-table-wrapper">
        <div style="overflow-x:auto">
            <table class="data-table" id="staffTable">
                <thead>
                    <tr>
                        <th style="width:50px">Photo</th>
                        <th>Staff ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Designation</th>
                        <th>Department</th>
                        <th>Shift</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th style="width:60px">Actions</th>
                    </tr>
                </thead>
                <tbody id="staffTableBody">
                    <tr><td colspan="10"><div class="empty-state"><i data-lucide="users"></i><p>Loading staff...</p></div></td></tr>
                </tbody>
            </table>
        </div>
        <div class="opd-pagination" id="sfPagination">
            <span class="opd-page-info" id="sfTableInfo">Showing 0–0 of 0 records</span>
            <div class="opd-page-btns">
                <button class="opd-page-btn" id="sfPrevPage" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div class="opd-page-nums" id="sfPageNums"></div>
                <button class="opd-page-btn" id="sfNextPage" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
            </div>
        </div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="staffDetailSheet" style="width:700px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 20px">
        <h5 class="offcanvas-title" id="staffDetailTitle">Staff Details</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="staffDetailBody" style="padding:0"></div>
    <div class="offcanvas-footer" id="staffDetailFooter" style="display:flex;justify-content:space-between;padding:12px 20px;border-top:1px solid var(--color-border)"></div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="staffFormSheet" style="width:800px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 20px">
        <h5 class="offcanvas-title" id="staffFormTitle">Add New Staff Member</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="staffFormBody" style="padding:20px"></div>
    <div class="offcanvas-footer" style="display:flex;justify-content:flex-end;gap:8px;padding:12px 20px;border-top:1px solid var(--color-border)">
        <button class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
        <button class="btn-primary" id="btnSaveStaff"><i data-lucide="check"></i> Save Staff</button>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="filterSheet" style="width:380px">
    <div class="offcanvas-header" style="background:var(--midnight-blue);color:#fff;padding:16px 20px">
        <h5 class="offcanvas-title">Filters</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="filterBody" style="padding:20px"></div>
    <div class="offcanvas-footer" style="display:flex;justify-content:flex-end;gap:8px;padding:12px 20px;border-top:1px solid var(--color-border)">
        <button class="btn-outline" id="btnClearFilters">Clear All</button>
        <button class="btn-primary" id="btnApplyFilters">Apply Filters</button>
    </div>
</div>
@endsection

@push('styles')
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
.opd-tool-btn.active{background:rgba(6,7,64,.06);border-color:#060740}
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
.opd-rows-menu button:hover{background:var(--color-muted)}
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
.data-table-wrapper .opd-pagination{border-top:1px solid var(--color-border);padding:12px 16px;background:var(--color-card)}
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
</style>
@endpush

@push('scripts')
<script src="{{ asset('js/staff.js') }}?v={{ filemtime(public_path('js/staff.js')) }}"></script>
@endpush
