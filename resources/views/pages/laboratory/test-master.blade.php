@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="flask-conical" style="width:24px;height:24px;color:var(--aqua-mint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Test Master</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Manage laboratory tests, components, and packages</p>
        </div>
    </div>
    <div style="display:flex;gap:8px">
        <button id="btnAddTest" style="padding:8px 16px;background:var(--aquamint);border:none;border-radius:8px;font-size:13px;font-weight:600;color:var(--midnight-blue);cursor:pointer;display:flex;align-items:center;gap:6px">
            <i data-lucide="plus" style="width:14px;height:14px"></i> Add Test
        </button>
        <button id="btnAddPackage" style="padding:8px 16px;background:var(--midnight-blue);border:none;border-radius:8px;font-size:13px;font-weight:600;color:#fff;cursor:pointer;display:flex;align-items:center;gap:6px">
            <i data-lucide="package" style="width:14px;height:14px"></i> Add Package
        </button>
    </div>
</div>

<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px">
    <div style="background:#fff;border-radius:10px;border:1px solid var(--color-border);padding:16px;text-align:center">
        <div style="font-size:11px;text-transform:uppercase;font-weight:600;color:var(--color-muted-foreground);margin-bottom:6px">Total Tests</div>
        <div id="statTotal" style="font-size:24px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif">0</div>
    </div>
    <div style="background:#fff;border-radius:10px;border:1px solid var(--color-border);padding:16px;text-align:center">
        <div style="font-size:11px;text-transform:uppercase;font-weight:600;color:var(--color-muted-foreground);margin-bottom:6px">Active Tests</div>
        <div id="statActive" style="font-size:24px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">0</div>
    </div>
    <div style="background:#fff;border-radius:10px;border:1px solid var(--color-border);padding:16px;text-align:center">
        <div style="font-size:11px;text-transform:uppercase;font-weight:600;color:var(--color-muted-foreground);margin-bottom:6px">Test Packages</div>
        <div id="statPackages" style="font-size:24px;font-weight:700;color:#8b5cf6;font-family:'Roobert',sans-serif">0</div>
    </div>
    <div style="background:#fff;border-radius:10px;border:1px solid var(--color-border);padding:16px;text-align:center">
        <div style="font-size:11px;text-transform:uppercase;font-weight:600;color:var(--color-muted-foreground);margin-bottom:6px">Departments</div>
        <div id="statDepts" style="font-size:24px;font-weight:700;color:#f97316;font-family:'Roobert',sans-serif">0</div>
    </div>
    <div style="background:#fff;border-radius:10px;border:1px solid var(--color-border);padding:16px;text-align:center">
        <div style="font-size:11px;text-transform:uppercase;font-weight:600;color:var(--color-muted-foreground);margin-bottom:6px">Avg Price</div>
        <div id="statAvgPrice" style="font-size:24px;font-weight:700;color:var(--aqua-mint);font-family:'Roobert',sans-serif">0</div>
    </div>
</div>

<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px">
    <div style="display:flex;gap:4px;background:var(--color-background);border-radius:8px;border:1px solid var(--color-border);padding:3px">
        <button class="view-tab active" data-view="tests" style="padding:6px 16px;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s">All Tests</button>
        <button class="view-tab" data-view="packages" style="padding:6px 16px;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;background:transparent;transition:all 0.2s">Test Packages</button>
        <button class="view-tab" data-view="popular" style="padding:6px 16px;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;background:transparent;transition:all 0.2s">Popular Tests</button>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
        <input type="text" id="searchInput" placeholder="Search by test name, code, category..." style="padding:7px 14px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;width:280px;outline:none">
        <select id="filterDept" style="padding:7px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;outline:none">
            <option value="">All Departments</option>
            <option>Hematology</option>
            <option>Clinical Chemistry</option>
            <option>Microbiology</option>
            <option>Serology/Immunology</option>
            <option>Histopathology</option>
            <option>Cytology</option>
            <option>Molecular Biology</option>
        </select>
        <select id="filterCategory" style="padding:7px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;outline:none">
            <option value="">All Categories</option>
            <option>Routine</option>
            <option>Specialized</option>
            <option>STAT</option>
            <option>Screening</option>
        </select>
        <select id="filterStatus" style="padding:7px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;outline:none">
            <option value="">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Discontinued</option>
        </select>
        <button id="btnFilter" style="padding:7px 12px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px">
            <i data-lucide="sliders-horizontal" style="width:14px;height:14px"></i>
        </button>
    </div>
</div>

<div id="viewTests">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
        <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse" id="testsTable">
                <thead>
                    <tr style="background:var(--color-background)">
                        <th class="sortable" data-sort="test_code" style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;cursor:pointer;white-space:nowrap">Code</th>
                        <th class="sortable" data-sort="test_name" style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;cursor:pointer;white-space:nowrap">Test Name</th>
                        <th class="sortable" data-sort="department" style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;cursor:pointer;white-space:nowrap">Department</th>
                        <th class="sortable" data-sort="category" style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;cursor:pointer;white-space:nowrap">Category</th>
                        <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Sample</th>
                        <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Fasting</th>
                        <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">TAT</th>
                        <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Params</th>
                        <th class="sortable" data-sort="standard_price" style="padding:10px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;cursor:pointer;white-space:nowrap">Price</th>
                        <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Status</th>
                        <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody id="tbodyTests"></tbody>
            </table>
        </div>
    </div>
</div>

<div id="viewPackages" style="display:none">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
        <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse" id="packagesTable">
                <thead>
                    <tr style="background:var(--color-background)">
                        <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Code</th>
                        <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Package Name</th>
                        <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Tests</th>
                        <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Departments</th>
                        <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Individual</th>
                        <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Package</th>
                        <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Discount</th>
                        <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">TAT</th>
                        <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Status</th>
                        <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;white-space:nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody id="tbodyPackages"></tbody>
            </table>
        </div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="testDetailSheet" style="width:900px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 class="offcanvas-title" id="detailTitle"></h5>
            <p id="detailSubtitle" style="font-size:12px;color:var(--color-muted-foreground);margin:4px 0 0"></p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:0;overflow-y:auto">
        <div id="detailActions" style="display:flex;gap:8px;padding:16px 24px;border-bottom:1px solid var(--color-border)"></div>
        <div id="detailBody" style="padding:24px"></div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="addTestSheet" style="width:900px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 class="offcanvas-title" id="addTestTitle">Add New Test</h5>
            <p style="font-size:12px;color:var(--color-muted-foreground);margin:4px 0 0">Register new laboratory test</p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <form id="testForm">
            <input type="hidden" id="editTestCode" value="">

            <div style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--aquamint)">Basic Information</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Test Name (English) *</label>
                        <input type="text" id="fTestName" required style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="e.g. Complete Blood Count">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Short Name / Abbreviation *</label>
                        <input type="text" id="fShortName" required style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="e.g. CBC">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Test Name (Urdu)</label>
                        <input type="text" id="fTestNameUrdu" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;direction:rtl">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Alternative Names</label>
                        <input type="text" id="fAltNames" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="Comma-separated">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Department *</label>
                        <select id="fDepartment" required style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
                            <option value="">Select...</option>
                            <option>Hematology</option>
                            <option>Clinical Chemistry</option>
                            <option>Microbiology</option>
                            <option>Serology/Immunology</option>
                            <option>Histopathology</option>
                            <option>Cytology</option>
                            <option>Molecular Biology</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Category *</label>
                        <select id="fCategory" required style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
                            <option value="">Select...</option>
                            <option>Routine</option>
                            <option>Specialized</option>
                            <option>STAT</option>
                            <option>Screening</option>
                            <option>Diagnostic</option>
                        </select>
                    </div>
                </div>
                <div style="margin-top:12px">
                    <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Description</label>
                    <textarea id="fDescription" rows="2" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;resize:vertical" placeholder="Brief description of what this test measures"></textarea>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--aquamint)">Sample Requirements</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Sample Type *</label>
                        <select id="fSampleType" required style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
                            <option value="">Select...</option>
                            <option>Blood - EDTA (Purple top)</option>
                            <option>Blood - Serum (Red top)</option>
                            <option>Blood - Plasma (Green top)</option>
                            <option>Blood - Fluoride (Gray top)</option>
                            <option>Blood - Citrate (Blue top)</option>
                            <option>Whole Blood</option>
                            <option>Urine</option>
                            <option>Stool</option>
                            <option>Body Fluid (CSF, Pleural, Ascitic)</option>
                            <option>Tissue/Biopsy</option>
                            <option>Swab (Throat, Nasal, Wound)</option>
                            <option>Sputum</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Sample Volume</label>
                        <input type="text" id="fSampleVolume" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="e.g. 3-5 mL">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Collection Container</label>
                        <input type="text" id="fContainer" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="e.g. EDTA tube">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Fasting Required *</label>
                        <select id="fFasting" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                            <option value="Preferred">Preferred but not mandatory</option>
                        </select>
                    </div>
                    <div id="fastingHoursWrap" style="display:none">
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Fasting Hours</label>
                        <input type="number" id="fFastingHours" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="12">
                    </div>
                </div>
                <div style="margin-top:12px">
                    <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Special Collection Instructions</label>
                    <textarea id="fSpecialInstructions" rows="2" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;resize:vertical" placeholder="e.g. Avoid hemolysis during collection"></textarea>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--aquamint)">Test Components / Parameters</div>
                <div style="margin-bottom:12px">
                    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
                        <input type="checkbox" id="fHasComponents"> This test has multiple components/parameters
                    </label>
                </div>
                <div id="componentsSection" style="display:none">
                    <div id="componentsList"></div>
                    <button type="button" id="btnAddComponent" style="padding:6px 14px;background:var(--color-background);border:1px solid var(--color-border);border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;margin-top:8px">
                        <i data-lucide="plus" style="width:12px;height:12px;vertical-align:-2px"></i> Add Component
                    </button>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--aquamint)">Turnaround Time (TAT)</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Standard TAT</label>
                        <input type="text" id="fStandardTat" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="e.g. 2 hours">
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
                            <span class="tat-quick" data-val="30 min" style="padding:2px 8px;background:var(--color-background);border:1px solid var(--color-border);border-radius:4px;font-size:11px;cursor:pointer">30 min</span>
                            <span class="tat-quick" data-val="1 hour" style="padding:2px 8px;background:var(--color-background);border:1px solid var(--color-border);border-radius:4px;font-size:11px;cursor:pointer">1 hr</span>
                            <span class="tat-quick" data-val="2 hours" style="padding:2px 8px;background:var(--color-background);border:1px solid var(--color-border);border-radius:4px;font-size:11px;cursor:pointer">2 hrs</span>
                            <span class="tat-quick" data-val="4 hours" style="padding:2px 8px;background:var(--color-background);border:1px solid var(--color-border);border-radius:4px;font-size:11px;cursor:pointer">4 hrs</span>
                            <span class="tat-quick" data-val="6 hours" style="padding:2px 8px;background:var(--color-background);border:1px solid var(--color-border);border-radius:4px;font-size:11px;cursor:pointer">6 hrs</span>
                            <span class="tat-quick" data-val="24 hours" style="padding:2px 8px;background:var(--color-background);border:1px solid var(--color-border);border-radius:4px;font-size:11px;cursor:pointer">24 hrs</span>
                            <span class="tat-quick" data-val="48-72 hours" style="padding:2px 8px;background:var(--color-background);border:1px solid var(--color-border);border-radius:4px;font-size:11px;cursor:pointer">48-72 hrs</span>
                        </div>
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">STAT/Urgent TAT</label>
                        <input type="text" id="fStatTat" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="e.g. 1 hour">
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--aquamint)">Pricing</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Standard Price (PKR) *</label>
                        <input type="number" id="fStandardPrice" required min="0" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="800">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">STAT/Urgent Price (PKR)</label>
                        <input type="number" id="fStatPrice" min="0" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="1300">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Home Collection Fee (PKR)</label>
                        <input type="number" id="fHomeCollectionFee" min="0" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="500">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Reagent Cost (PKR)</label>
                        <input type="number" id="fReagentCost" min="0" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="200">
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--aquamint)">Additional Information</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Methodology</label>
                        <select id="fMethodology" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
                            <option value="">Select...</option>
                            <option>Automated Analyzer</option>
                            <option>Manual Method</option>
                            <option>ELISA</option>
                            <option>PCR</option>
                            <option>Culture</option>
                            <option>Microscopy</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Status</label>
                        <select id="fStatus" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
                            <option>Active</option>
                            <option>Inactive</option>
                            <option>Coming Soon</option>
                            <option>Discontinued</option>
                        </select>
                    </div>
                </div>
                <div style="margin-top:12px">
                    <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Patient Preparation Instructions</label>
                    <textarea id="fPatientPrep" rows="2" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;resize:vertical" placeholder="e.g. No special preparation needed"></textarea>
                </div>
            </div>

            <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:16px;border-top:1px solid var(--color-border)">
                <button type="button" class="btn-close-form" data-bs-dismiss="offcanvas" style="padding:8px 20px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;cursor:pointer">Cancel</button>
                <button type="submit" style="padding:8px 24px;background:var(--aquamint);border:none;border-radius:8px;font-size:13px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Save Test</button>
            </div>
        </form>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="addPackageSheet" style="width:800px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 class="offcanvas-title">Create Test Package</h5>
            <p style="font-size:12px;color:var(--color-muted-foreground);margin:4px 0 0">Bundle multiple tests into a package</p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <form id="packageForm">
            <div style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--aquamint)">Package Information</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Package Name *</label>
                        <input type="text" id="pName" required style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px" placeholder="e.g. Basic Health Checkup">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Package Name (Urdu)</label>
                        <input type="text" id="pNameUrdu" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;direction:rtl">
                    </div>
                </div>
                <div style="margin-top:12px">
                    <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Description</label>
                    <textarea id="pDescription" rows="2" style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;resize:vertical" placeholder="Brief description of the package"></textarea>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--aquamint)">Tests Included</div>
                <div style="display:flex;gap:8px;margin-bottom:12px">
                    <input type="text" id="pkgTestSearch" placeholder="Search test name to add..." style="flex:1;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
                </div>
                <div id="pkgTestResults" style="display:none;max-height:200px;overflow-y:auto;border:1px solid var(--color-border);border-radius:8px;margin-bottom:12px"></div>
                <div id="pkgSelectedTests"></div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--aquamint)">Pricing</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:8px">
                    <div style="padding:12px;background:var(--color-background);border-radius:8px;text-align:center">
                        <div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:4px">Individual Total</div>
                        <div id="pkgIndividualTotal" style="font-size:18px;font-weight:700;color:var(--color-muted-foreground);text-decoration:line-through">PKR 0</div>
                    </div>
                    <div style="padding:12px;background:rgba(127,255,212,0.1);border-radius:8px;text-align:center">
                        <div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:4px">Package Price</div>
                        <input type="number" id="pPrice" required min="0" style="width:100%;text-align:center;padding:4px;border:1px solid var(--color-border);border-radius:6px;font-size:18px;font-weight:700;color:var(--aqua-mint)">
                    </div>
                    <div style="padding:12px;background:rgba(34,197,94,0.08);border-radius:8px;text-align:center">
                        <div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:4px">Discount</div>
                        <div id="pkgDiscount" style="font-size:18px;font-weight:700;color:#22c55e">0% OFF</div>
                    </div>
                </div>
            </div>

            <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:16px;border-top:1px solid var(--color-border)">
                <button type="button" data-bs-dismiss="offcanvas" style="padding:8px 20px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;cursor:pointer">Cancel</button>
                <button type="submit" style="padding:8px 24px;background:var(--aquamint);border:none;border-radius:8px;font-size:13px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Create Package</button>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/laboratory-test-master.js') }}?v={{ filemtime(public_path('js/laboratory-test-master.js')) }}"></script>
@endpush
