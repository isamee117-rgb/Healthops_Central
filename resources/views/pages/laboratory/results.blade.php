@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="file-check" style="width:24px;height:24px;color:var(--aqua-mint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Result Entry & Verification</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Enter, review, and verify test results before release</p>
        </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
        <div style="display:inline-flex;border:1px solid var(--color-border);border-radius:8px;overflow:hidden" id="viewToggle">
            <button class="view-btn active" data-view="list" style="padding:7px 14px;font-size:12px;font-weight:600;border:none;cursor:pointer;display:flex;align-items:center;gap:5px;background:var(--midnight-blue);color:#fff">
                <i data-lucide="list" style="width:14px;height:14px"></i> List View
            </button>
            <button class="view-btn" data-view="department" style="padding:7px 14px;font-size:12px;font-weight:600;border:none;cursor:pointer;display:flex;align-items:center;gap:5px;background:var(--color-card);color:var(--color-muted-foreground)">
                <i data-lucide="building-2" style="width:14px;height:14px"></i> By Department
            </button>
            <button class="view-btn" data-view="analyzer" style="padding:7px 14px;font-size:12px;font-weight:600;border:none;cursor:pointer;display:flex;align-items:center;gap:5px;background:var(--color-card);color:var(--color-muted-foreground)">
                <i data-lucide="cpu" style="width:14px;height:14px"></i> By Analyzer
            </button>
        </div>
        <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;background:rgba(0,51,102,0.06);color:var(--midnight-blue);font-size:13px;font-weight:600">
            <i data-lucide="user-check" style="width:14px;height:14px"></i> Technologist: <strong>Sarah Ahmed</strong>
        </span>
    </div>
</div>

<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px">
    <div class="card" style="border:1px solid var(--color-border);border-radius:12px;padding:16px;background:var(--color-card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px">Pending Entry</div>
                <div style="font-size:28px;font-weight:800;color:var(--midnight-blue)" id="statPendingEntry">0</div>
            </div>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(234,179,8,0.12);display:flex;align-items:center;justify-content:center">
                <i data-lucide="edit-3" style="width:18px;height:18px;color:#eab308"></i>
            </div>
        </div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Awaiting result entry</div>
    </div>
    <div class="card" style="border:1px solid var(--color-border);border-radius:12px;padding:16px;background:var(--color-card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px">Entered Today</div>
                <div style="font-size:28px;font-weight:800;color:#22c55e" id="statEnteredToday">0</div>
            </div>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(34,197,94,0.12);display:flex;align-items:center;justify-content:center">
                <i data-lucide="check-circle" style="width:18px;height:18px;color:#22c55e"></i>
            </div>
        </div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Results entered today</div>
    </div>
    <div class="card" style="border:1px solid var(--color-border);border-radius:12px;padding:16px;background:var(--color-card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px">Pending Verification</div>
                <div style="font-size:28px;font-weight:800;color:#f97316" id="statPendingVerification">0</div>
            </div>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(249,115,22,0.12);display:flex;align-items:center;justify-content:center">
                <i data-lucide="shield-check" style="width:18px;height:18px;color:#f97316"></i>
            </div>
        </div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Awaiting verification</div>
    </div>
    <div class="card" style="border:1px solid var(--color-border);border-radius:12px;padding:16px;background:var(--color-card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px">Verified Today</div>
                <div style="font-size:28px;font-weight:800;color:#3b82f6" id="statVerifiedToday">0</div>
            </div>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(59,130,246,0.12);display:flex;align-items:center;justify-content:center">
                <i data-lucide="badge-check" style="width:18px;height:18px;color:#3b82f6"></i>
            </div>
        </div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Verified & released</div>
    </div>
    <div class="card" style="border:1px solid var(--color-border);border-radius:12px;padding:16px;background:var(--color-card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px">Critical Results</div>
                <div style="font-size:28px;font-weight:800;color:#ef4444" id="statCritical">0</div>
            </div>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(239,68,68,0.12);display:flex;align-items:center;justify-content:center">
                <i data-lucide="alert-triangle" style="width:18px;height:18px;color:#ef4444"></i>
            </div>
        </div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Require attention</div>
    </div>
</div>

<div class="card" style="border:1px solid var(--color-border);border-radius:12px;background:var(--color-card)">
    <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div style="display:flex;gap:6px;align-items:center" id="statusFilters">
            <button class="status-chip active" data-status="" style="padding:5px 12px;border-radius:16px;font-size:12px;font-weight:600;border:1px solid var(--midnight-blue);background:var(--midnight-blue);color:#fff;cursor:pointer">All</button>
            <button class="status-chip" data-status="Pending" style="padding:5px 12px;border-radius:16px;font-size:12px;font-weight:600;border:1px solid var(--color-border);background:var(--color-card);color:var(--color-muted-foreground);cursor:pointer">Pending</button>
            <button class="status-chip" data-status="Entered" style="padding:5px 12px;border-radius:16px;font-size:12px;font-weight:600;border:1px solid var(--color-border);background:var(--color-card);color:var(--color-muted-foreground);cursor:pointer">Entered</button>
            <button class="status-chip" data-status="Verified" style="padding:5px 12px;border-radius:16px;font-size:12px;font-weight:600;border:1px solid var(--color-border);background:var(--color-card);color:var(--color-muted-foreground);cursor:pointer">Verified</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="position:relative">
                <i data-lucide="search" style="width:14px;height:14px;position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--color-muted-foreground)"></i>
                <input type="text" id="searchInput" placeholder="Search Order ID, Patient, MRN..." style="padding:7px 10px 7px 32px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;width:260px;background:var(--color-card);color:var(--color-foreground)">
            </div>
            <select id="filterPriority" style="padding:7px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;background:var(--color-card);color:var(--color-foreground)">
                <option value="">All Priorities</option>
                <option value="STAT">STAT</option>
                <option value="Urgent">Urgent</option>
                <option value="Routine">Routine</option>
            </select>
            <select id="filterDepartment" style="padding:7px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;background:var(--color-card);color:var(--color-foreground)">
                <option value="">All Sources</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Emergency">Emergency</option>
                <option value="OT">OT</option>
                <option value="Walk-in">Walk-in</option>
            </select>
            <select id="filterCategory" style="padding:7px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;background:var(--color-card);color:var(--color-foreground)">
                <option value="">All Categories</option>
                <option value="Hematology">Hematology</option>
                <option value="Clinical Chemistry">Clinical Chemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Serology">Serology</option>
                <option value="Immunology">Immunology</option>
                <option value="Molecular Biology">Molecular Biology</option>
            </select>
        </div>
    </div>

    <div id="listView">
        <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:13px">
                <thead>
                    <tr style="border-bottom:1px solid var(--color-border)">
                        <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Order ID</th>
                        <th style="padding:12px 8px;text-align:left;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Patient</th>
                        <th style="padding:12px 8px;text-align:left;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">MR Number</th>
                        <th style="padding:12px 8px;text-align:left;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Test Name</th>
                        <th style="padding:12px 8px;text-align:left;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Sample Type</th>
                        <th style="padding:12px 8px;text-align:left;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Collected</th>
                        <th style="padding:12px 8px;text-align:left;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">TAT</th>
                        <th style="padding:12px 8px;text-align:left;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Priority</th>
                        <th style="padding:12px 8px;text-align:left;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Result Status</th>
                        <th style="padding:12px 8px;text-align:left;font-weight:600;color:var(--color-muted-foreground);font-size:11px;text-transform:uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody id="samplesTableBody">
                    <tr><td colspan="10" style="padding:40px;text-align:center;color:var(--color-muted-foreground)">Loading samples...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <div id="departmentView" style="display:none;padding:16px 20px">
        <div style="display:flex;gap:6px;margin-bottom:16px;border-bottom:1px solid var(--color-border);padding-bottom:12px" id="deptTabs">
            <button class="dept-tab active" data-dept="Hematology" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;background:var(--midnight-blue);color:#fff">Hematology</button>
            <button class="dept-tab" data-dept="Clinical Chemistry" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;background:var(--color-background);color:var(--color-muted-foreground)">Clinical Chemistry</button>
            <button class="dept-tab" data-dept="Microbiology" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;background:var(--color-background);color:var(--color-muted-foreground)">Microbiology</button>
            <button class="dept-tab" data-dept="Serology" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;background:var(--color-background);color:var(--color-muted-foreground)">Serology</button>
            <button class="dept-tab" data-dept="Immunology" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;background:var(--color-background);color:var(--color-muted-foreground)">Immunology</button>
        </div>
        <div id="deptContent">
            <div style="text-align:center;padding:30px;color:var(--color-muted-foreground)">Loading department data...</div>
        </div>
    </div>

    <div id="analyzerView" style="display:none;padding:16px 20px">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px" id="analyzerContent">
            <div style="text-align:center;padding:30px;color:var(--color-muted-foreground);grid-column:span 3">Loading analyzer data...</div>
        </div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="resultEntryPanel" style="width:75%;max-width:900px;border-left:3px solid var(--aqua-mint)">
    <div style="padding:16px 20px;background:linear-gradient(135deg,var(--midnight-blue),#004080);color:#fff;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10">
        <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
                <span style="font-size:18px;font-weight:700" id="panelTestName">Test Name</span>
                <span id="panelPriorityBadge" style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700"></span>
            </div>
            <div style="display:flex;align-items:center;gap:16px;font-size:13px;opacity:0.9">
                <span><i data-lucide="user" style="width:13px;height:13px;display:inline;vertical-align:middle"></i> <span id="panelPatientName">Patient</span></span>
                <span id="panelPatientAge"></span>
                <span>MRN: <strong id="panelMrn"></strong></span>
            </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
            <div style="text-align:right;font-size:12px;opacity:0.85">
                <div>Collected: <strong id="panelCollectionTime"></strong></div>
                <div>Order: <strong id="panelOrderId"></strong></div>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" style="opacity:0.8"></button>
        </div>
    </div>

    <div style="padding:20px;overflow-y:auto;height:calc(100vh - 140px)" id="panelBody">
        <div id="panelTestsList"></div>
    </div>

    <div style="padding:12px 20px;border-top:2px solid var(--color-border);background:var(--color-card);display:flex;align-items:center;justify-content:space-between;position:sticky;bottom:0;z-index:10" id="panelFooter">
        <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:13px;color:var(--color-muted-foreground)">Progress: <strong id="panelProgress">0/0</strong> tests entered</span>
            <div style="width:120px;height:6px;background:var(--color-border);border-radius:3px;overflow:hidden">
                <div id="panelProgressBar" style="height:100%;background:var(--aqua-mint);border-radius:3px;transition:width 0.3s;width:0%"></div>
            </div>
        </div>
        <div style="display:flex;gap:8px">
            <button class="btn" id="btnVerifyAll" style="padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;background:#3b82f6;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;gap:6px" disabled>
                <i data-lucide="shield-check" style="width:14px;height:14px"></i> Verify All Results
            </button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/laboratory-result-entry.js') }}?v={{ filemtime(public_path('js/laboratory-result-entry.js')) }}"></script>
@endpush
