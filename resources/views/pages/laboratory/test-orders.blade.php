@extends('layouts.app')

@section('content')
<style>
@keyframes statPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
@keyframes borderPulse { 0%,100%{border-left-color:#ef4444} 50%{border-left-color:#fca5a5} }
.priority-stat-pulse { animation: statPulse 1.5s ease-in-out infinite; }
.lab-order-row:hover { background: var(--color-background) !important; cursor:pointer; }
.priority-border-stat { border-left: 4px solid #ef4444 !important; animation: borderPulse 1.5s ease-in-out infinite; }
.priority-border-urgent { border-left: 4px solid #f97316 !important; }
.priority-border-routine { border-left: 4px solid #22c55e !important; }
.tat-exceeded { background: #fef2f2 !important; }
.filter-chip { display:inline-flex;align-items:center;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;border:1px solid var(--color-border);background:#fff;cursor:pointer;transition:all .2s; }
.filter-chip:hover { border-color:var(--aqua-mint); }
.filter-chip.active { background:var(--aqua-mint);color:var(--midnight-blue);border-color:var(--aqua-mint);font-weight:600; }
.sample-icon { display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,0.04); }
.tat-bar { height:6px;border-radius:3px;background:#e5e7eb;overflow:hidden; }
.tat-bar-fill { height:100%;border-radius:3px;transition:width .3s; }
.test-status-step { display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px; }
.test-status-step .step-dot { width:10px;height:10px;border-radius:50%;border:2px solid #d1d5db;flex-shrink:0; }
.test-status-step .step-dot.completed { background:var(--aqua-mint);border-color:var(--aqua-mint); }
.test-status-step .step-dot.current { background:#3b82f6;border-color:#3b82f6; }
.test-card { background:#fff;border:1px solid var(--color-border);border-radius:10px;padding:14px 16px;margin-bottom:10px; }
</style>

<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="flask-conical" style="width:24px;height:24px;color:var(--aqua-mint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Laboratory Test Orders</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Central queue for all lab orders from hospital departments</p>
        </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
        <div style="position:relative">
            <i data-lucide="search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--color-muted-foreground)"></i>
            <input type="text" id="labSearch" placeholder="Search by Patient Name, MR Number, Order ID" style="padding:9px 12px 9px 32px;width:320px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
        </div>
        <button id="btnToggleFilters" style="display:flex;align-items:center;gap:6px;padding:9px 16px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer"><i data-lucide="sliders-horizontal" style="width:15px;height:15px"></i> Filters</button>
        <button id="btnRefresh" style="display:flex;align-items:center;gap:6px;padding:9px 16px;background:var(--aqua-mint);border:none;border-radius:8px;font-size:13px;font-weight:600;color:var(--midnight-blue);cursor:pointer"><i data-lucide="refresh-cw" style="width:15px;height:15px"></i> Refresh</button>
    </div>
</div>

<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:14px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase">Pending Orders</span>
            <div style="width:30px;height:30px;border-radius:8px;background:rgba(234,179,8,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="clock" style="width:15px;height:15px;color:#eab308"></i></div>
        </div>
        <div id="statPending" style="font-size:24px;font-weight:700;color:#eab308;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:14px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase">Sample Collection</span>
            <div style="width:30px;height:30px;border-radius:8px;background:rgba(249,115,22,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="test-tube" style="width:15px;height:15px;color:#f97316"></i></div>
        </div>
        <div id="statSamplePending" style="font-size:24px;font-weight:700;color:#f97316;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:14px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase">In Progress</span>
            <div style="width:30px;height:30px;border-radius:8px;background:rgba(59,130,246,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="loader" style="width:15px;height:15px;color:#3b82f6"></i></div>
        </div>
        <div id="statInProgress" style="font-size:24px;font-weight:700;color:#3b82f6;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:14px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase">Results Ready</span>
            <div style="width:30px;height:30px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="check-circle" style="width:15px;height:15px;color:#22c55e"></i></div>
        </div>
        <div id="statResultsReady" style="font-size:24px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:14px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase">Completed Today</span>
            <div style="width:30px;height:30px;border-radius:8px;background:rgba(107,114,128,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="clipboard-check" style="width:15px;height:15px;color:#6b7280"></i></div>
        </div>
        <div id="statCompletedToday" style="font-size:24px;font-weight:700;color:#6b7280;font-family:'Roobert',sans-serif">--</div>
    </div>
</div>

<div id="filterPanel" style="display:none;background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px 20px;margin-bottom:20px">
    <div style="margin-bottom:14px">
        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:8px;text-transform:uppercase">Order Status</label>
        <div id="statusChips" style="display:flex;flex-wrap:wrap;gap:6px">
            <span class="filter-chip active" data-value="">All</span>
            <span class="filter-chip" data-value="Pending">Pending Sample Collection</span>
            <span class="filter-chip" data-value="Collected">Sample Collected</span>
            <span class="filter-chip" data-value="In Progress">In Progress (Testing)</span>
            <span class="filter-chip" data-value="Ready">Results Entered</span>
            <span class="filter-chip" data-value="Verified">Results Verified</span>
            <span class="filter-chip" data-value="Reported">Completed</span>
            <span class="filter-chip" data-value="Rejected">Rejected/Cancelled</span>
        </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;align-items:end">
        <div>
            <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px;text-transform:uppercase">Source Department</label>
            <select id="filterDept" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                <option value="">All Departments</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Emergency">Emergency</option>
                <option value="OT">Operation Theater</option>
                <option value="Walk-in">Walk-in</option>
            </select>
        </div>
        <div>
            <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px;text-transform:uppercase">Priority</label>
            <div style="display:flex;gap:6px;margin-top:4px">
                <span class="filter-chip active priority-chip" data-value="">All</span>
                <span class="filter-chip priority-chip" data-value="STAT">STAT</span>
                <span class="filter-chip priority-chip" data-value="Urgent">Urgent</span>
                <span class="filter-chip priority-chip" data-value="Routine">Routine</span>
            </div>
        </div>
        <div>
            <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px;text-transform:uppercase">Test Category</label>
            <select id="filterCategory" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                <option value="">All Categories</option>
                <option value="Hematology">Hematology</option>
                <option value="Clinical Chemistry">Clinical Chemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Serology">Serology</option>
                <option value="Immunology">Immunology</option>
                <option value="Molecular Biology">Molecular Biology</option>
            </select>
        </div>
        <div>
            <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px;text-transform:uppercase">Date Range</label>
            <select id="filterDate" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                <option value="">All Time</option>
                <option value="today" selected>Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
            </select>
        </div>
        <div>
            <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px;text-transform:uppercase">Critical Only</label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 0">
                <input type="checkbox" id="filterCritical" style="width:16px;height:16px;accent-color:var(--aqua-mint)">
                <span style="font-size:13px">Show critical results only</span>
            </label>
        </div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:12px;gap:8px">
        <button id="btnClearFilters" style="padding:8px 16px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff;cursor:pointer">Clear All</button>
        <button id="btnApplyFilters" style="padding:8px 16px;border:none;border-radius:8px;font-size:13px;font-weight:600;background:var(--aqua-mint);color:var(--midnight-blue);cursor:pointer">Apply Filters</button>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
                <tr style="background:var(--color-background);border-bottom:1px solid var(--color-border)">
                    <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">Order ID</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">Time</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">Patient</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">Department</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">Priority</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">Tests</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">Sample</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">TAT</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">Doctor</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">Status</th>
                    <th style="padding:10px 14px;text-align:center;font-weight:600;font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground)">Actions</th>
                </tr>
            </thead>
            <tbody id="ordersTableBody">
                <tr><td colspan="11" style="padding:40px;text-align:center;color:var(--color-muted-foreground)"><i data-lucide="loader" style="width:20px;height:20px;animation:spin 1s linear infinite"></i> Loading orders...</td></tr>
            </tbody>
        </table>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="orderDetailPanel" style="width:600px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:16px 20px;border-bottom:1px solid var(--color-border)">
        <div style="flex:1">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
                <h5 id="detailOrderId" class="offcanvas-title"></h5>
                <span id="detailPriorityBadge"></span>
                <span id="detailStatusBadge"></span>
            </div>
            <div id="detailTatInfo" style="font-size:12px;color:var(--color-muted-foreground)"></div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:0;overflow-y:auto" id="detailBody">
        <div style="padding:20px;text-align:center;color:var(--color-muted-foreground)">Loading...</div>
    </div>
    <div id="detailFooter" style="padding:14px 20px;border-top:1px solid var(--color-border);display:flex;gap:8px;flex-wrap:wrap;background:#fff">
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/laboratory-test-orders.js') }}?v={{ filemtime(public_path('js/laboratory-test-orders.js')) }}"></script>
@endpush
