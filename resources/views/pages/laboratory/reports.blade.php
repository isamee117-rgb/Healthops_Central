@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="file-text" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Reports & Document Management</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Generate, manage, and distribute laboratory reports</p>
        </div>
    </div>
    <button id="btnGenerateReport" style="padding:9px 20px;border-radius:8px;background:var(--aquamint);color:var(--midnight-blue);font-weight:600;font-size:13px;border:none;cursor:pointer;display:flex;align-items:center;gap:6px">
        <i data-lucide="plus" style="width:15px;height:15px"></i> Generate Report
    </button>
</div>

<div id="reportStats" style="display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-bottom:20px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Total Reports</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(127,255,212,0.12);display:flex;align-items:center;justify-content:center"><i data-lucide="file-text" style="width:16px;height:16px;color:var(--aquamint)"></i></div>
        </div>
        <div id="statTotalReports" style="font-size:26px;font-weight:700;color:var(--color-foreground);font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Generated Today</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="file-plus" style="width:16px;height:16px;color:#22c55e"></i></div>
        </div>
        <div id="statGenToday" style="font-size:26px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Pending Delivery</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(249,115,22,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="truck" style="width:16px;height:16px;color:#f97316"></i></div>
        </div>
        <div id="statPendingDel" style="font-size:26px;font-weight:700;color:#f97316;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Delivered Today</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(59,130,246,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="check-circle" style="width:16px;height:16px;color:#3b82f6"></i></div>
        </div>
        <div id="statDelToday" style="font-size:26px;font-weight:700;color:#3b82f6;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Critical Reports</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="alert-triangle" style="width:16px;height:16px;color:#ef4444"></i></div>
        </div>
        <div id="statCritical" style="font-size:26px;font-weight:700;color:#ef4444;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Archived</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(168,85,247,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="archive" style="width:16px;height:16px;color:#a855f7"></i></div>
        </div>
        <div id="statArchived" style="font-size:26px;font-weight:700;color:#a855f7;font-family:'Roobert',sans-serif">--</div>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
    <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div id="sectionTabs" style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="sec-tab active" data-sec="reports" style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:600;border:1px solid var(--aquamint);background:rgba(127,255,212,0.15);color:var(--midnight-blue);cursor:pointer">
                <i data-lucide="file-text" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i>Report Generation
            </button>
            <button class="sec-tab" data-sec="cumulative" style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:500;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);cursor:pointer">
                <i data-lucide="trending-up" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i>Cumulative Reports
            </button>
            <button class="sec-tab" data-sec="delivery" style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:500;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);cursor:pointer">
                <i data-lucide="send" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i>Report Delivery
            </button>
            <button class="sec-tab" data-sec="archive" style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:500;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);cursor:pointer">
                <i data-lucide="archive" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i>Report Archive
            </button>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
            <div style="position:relative">
                <i data-lucide="search" style="width:14px;height:14px;position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--color-muted-foreground)"></i>
                <input id="searchReports" type="text" placeholder="Search Report ID, Patient, MRN..." style="padding:7px 12px 7px 32px;border:1px solid var(--color-border);border-radius:6px;font-size:12px;width:260px;outline:none">
            </div>
            <select id="filterStatus" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:12px;outline:none;background:#fff">
                <option value="">All Status</option>
                <option value="Generated">Generated</option>
                <option value="Delivered">Delivered</option>
                <option value="Ready">Ready</option>
            </select>
            <select id="filterDept" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:12px;outline:none;background:#fff">
                <option value="">All Depts</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="ER">ER</option>
                <option value="OT">OT</option>
                <option value="Walk-in">Walk-in</option>
            </select>
        </div>
    </div>

    <div id="secReports" class="section-panel">
        <div style="padding:20px">
            <div id="reportsTable" style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;font-size:13px">
                    <thead>
                        <tr style="border-bottom:2px solid var(--color-border)">
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Report ID</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Patient</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">MRN</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Tests</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Report Date</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Status</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Delivery</th>
                            <th style="text-align:center;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="reportsBody"></tbody>
                </table>
            </div>
            <div id="noReports" style="display:none;text-align:center;padding:40px;color:var(--color-muted-foreground)">
                <i data-lucide="file-x" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i>
                <p style="font-size:14px;margin:0">No reports found. Generate a report from completed lab orders.</p>
            </div>
        </div>
    </div>

    <div id="secCumulative" class="section-panel" style="display:none">
        <div style="padding:20px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
                <div style="position:relative;flex:1;max-width:400px">
                    <i data-lucide="search" style="width:14px;height:14px;position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--color-muted-foreground)"></i>
                    <input id="cumulativeMrn" type="text" placeholder="Enter MRN to view cumulative reports..." style="padding:9px 12px 9px 32px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;width:100%;outline:none">
                </div>
                <button id="btnLoadCumulative" style="padding:9px 18px;border-radius:6px;background:var(--aquamint);color:var(--midnight-blue);font-weight:600;font-size:13px;border:none;cursor:pointer">Load Reports</button>
            </div>
            <div id="cumulativeContent" style="display:none">
                <div id="cumulativePatientInfo" style="background:rgba(127,255,212,0.06);border:1px solid rgba(127,255,212,0.2);border-radius:10px;padding:16px;margin-bottom:20px"></div>
                <div id="cumulativeReportsList" style="margin-bottom:20px"></div>
                <div id="trendSection" style="background:#fff;border:1px solid var(--color-border);border-radius:10px;padding:20px">
                    <h4 style="font-size:14px;font-weight:700;color:var(--color-foreground);margin:0 0 16px;font-family:'Roobert',sans-serif">
                        <i data-lucide="trending-up" style="width:16px;height:16px;vertical-align:-3px;margin-right:6px;color:var(--aquamint)"></i>Trend Analysis
                    </h4>
                    <canvas id="trendChart" height="250"></canvas>
                </div>
            </div>
            <div id="noCumulative" style="text-align:center;padding:40px;color:var(--color-muted-foreground)">
                <i data-lucide="trending-up" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i>
                <p style="font-size:14px;margin:0">Enter a patient MRN to view cumulative reports and trends.</p>
            </div>
        </div>
    </div>

    <div id="secDelivery" class="section-panel" style="display:none">
        <div style="padding:20px">
            <div id="deliveryQueue"></div>
            <div id="noDelivery" style="display:none;text-align:center;padding:40px;color:var(--color-muted-foreground)">
                <i data-lucide="check-circle" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i>
                <p style="font-size:14px;margin:0">All reports have been delivered. No pending deliveries.</p>
            </div>
        </div>
    </div>

    <div id="secArchive" class="section-panel" style="display:none">
        <div style="padding:20px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
                <div style="display:flex;align-items:center;gap:6px;padding:10px 14px;background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.15);border-radius:8px">
                    <i data-lucide="shield-check" style="width:16px;height:16px;color:#a855f7"></i>
                    <span style="font-size:12px;font-weight:500;color:var(--color-foreground)">Secure encrypted storage</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;padding:10px 14px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:8px">
                    <i data-lucide="clock" style="width:16px;height:16px;color:#3b82f6"></i>
                    <span style="font-size:12px;font-weight:500;color:var(--color-foreground)">5-year minimum retention</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;padding:10px 14px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:8px">
                    <i data-lucide="search" style="width:16px;height:16px;color:#22c55e"></i>
                    <span style="font-size:12px;font-weight:500;color:var(--color-foreground)">Searchable by patient, date, test</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;padding:10px 14px;background:rgba(234,179,8,0.06);border:1px solid rgba(234,179,8,0.15);border-radius:8px">
                    <i data-lucide="printer" style="width:16px;height:16px;color:#eab308"></i>
                    <span style="font-size:12px;font-weight:500;color:var(--color-foreground)">Re-print anytime</span>
                </div>
            </div>
            <div id="archiveTable" style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;font-size:13px">
                    <thead>
                        <tr style="border-bottom:2px solid var(--color-border)">
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Report ID</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Patient</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">MRN</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Tests</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Date</th>
                            <th style="text-align:left;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Retention</th>
                            <th style="text-align:center;padding:10px 12px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;text-transform:uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="archiveBody"></tbody>
                </table>
            </div>
            <div id="noArchive" style="display:none;text-align:center;padding:40px;color:var(--color-muted-foreground)">
                <i data-lucide="archive" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i>
                <p style="font-size:14px;margin:0">No archived reports yet.</p>
            </div>
        </div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="reportPreviewPanel" style="width:75%;max-width:900px">
    <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:16px 20px">
        <h5 style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif">
            <i data-lucide="file-text" style="width:18px;height:18px;vertical-align:-3px;margin-right:6px;color:var(--aquamint)"></i>Report Preview
        </h5>
        <div style="display:flex;gap:8px;align-items:center">
            <button id="btnPrintReport" style="padding:6px 14px;border-radius:6px;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);cursor:pointer;font-size:12px;font-weight:500">
                <i data-lucide="printer" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i>Print
            </button>
            <button id="btnDownloadPdf" style="padding:6px 14px;border-radius:6px;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);cursor:pointer;font-size:12px;font-weight:500">
                <i data-lucide="download" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i>PDF
            </button>
            <button id="btnEmailReport" style="padding:6px 14px;border-radius:6px;background:var(--aquamint);color:var(--midnight-blue);font-weight:600;font-size:12px;border:none;cursor:pointer">
                <i data-lucide="mail" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i>Email
            </button>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
    </div>
    <div class="offcanvas-body" style="padding:0;background:#f5f5f5">
        <div id="reportPreviewContent" style="max-width:700px;margin:20px auto;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,0.08);border-radius:2px;overflow:hidden"></div>
        <div style="max-width:700px;margin:16px auto 20px">
            <div style="background:#fff;border-radius:10px;border:1px solid var(--color-border);padding:16px">
                <h5 style="font-size:13px;font-weight:700;color:var(--color-foreground);margin:0 0 12px;font-family:'Roobert',sans-serif">
                    <i data-lucide="send" style="width:14px;height:14px;vertical-align:-2px;margin-right:6px;color:var(--aquamint)"></i>Report Delivery Status
                </h5>
                <div id="deliveryStatusPanel"></div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="generateModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius:12px;border:none">
            <div class="modal-header" style="border-bottom:1px solid var(--color-border);padding:16px 20px">
                <h5 style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif">
                    <i data-lucide="file-plus" style="width:18px;height:18px;vertical-align:-3px;margin-right:6px;color:var(--aquamint)"></i>Generate Patient Report
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:20px">
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-foreground);margin-bottom:6px;display:block">Lab Order ID *</label>
                    <select id="genOrderId" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;outline:none;background:#fff">
                        <option value="">Select a completed lab order...</option>
                    </select>
                </div>
                <div id="genOrderPreview" style="display:none;background:rgba(127,255,212,0.06);border:1px solid rgba(127,255,212,0.2);border-radius:8px;padding:14px;margin-bottom:16px"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-foreground);margin-bottom:6px;display:block">Performed By</label>
                        <input id="genPerformedBy" type="text" value="Ahmed Khan" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;outline:none;box-sizing:border-box">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-foreground);margin-bottom:6px;display:block">Verified By</label>
                        <input id="genVerifiedBy" type="text" value="Dr. Sarah Ahmed" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;outline:none;box-sizing:border-box">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-foreground);margin-bottom:6px;display:block">Verifier Title</label>
                        <input id="genVerifierTitle" type="text" value="Consultant Pathologist" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;outline:none;box-sizing:border-box">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-foreground);margin-bottom:6px;display:block">Qualifications</label>
                        <input id="genVerifierQual" type="text" value="FCPS, MCPS" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;outline:none;box-sizing:border-box">
                    </div>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;color:var(--color-foreground);margin-bottom:6px;display:block">Pathologist's Comments</label>
                    <textarea id="genComments" rows="3" placeholder="Enter pathologist's interpretation and comments..." style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;outline:none;resize:vertical;box-sizing:border-box"></textarea>
                </div>
            </div>
            <div class="modal-footer" style="border-top:1px solid var(--color-border);padding:14px 20px">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                <button id="btnSubmitGenerate" type="button" style="padding:8px 20px;border-radius:6px;background:var(--aquamint);color:var(--midnight-blue);font-weight:600;font-size:13px;border:none;cursor:pointer">
                    <i data-lucide="file-plus" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i>Generate Report
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="deliveryModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content" style="border-radius:12px;border:none">
            <div class="modal-header" style="border-bottom:1px solid var(--color-border);padding:16px 20px">
                <h5 style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif">
                    <i data-lucide="send" style="width:18px;height:18px;vertical-align:-3px;margin-right:6px;color:var(--aquamint)"></i>Deliver Report
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:20px">
                <input type="hidden" id="deliveryReportId">
                <div id="deliveryChannels"></div>
            </div>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script src="{{ asset('js/laboratory-reports.js') }}?v={{ filemtime(public_path('js/laboratory-reports.js')) }}"></script>
@endpush
