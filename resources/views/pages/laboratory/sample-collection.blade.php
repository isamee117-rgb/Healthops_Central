@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="test-tubes" style="width:24px;height:24px;color:var(--aqua-mint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Sample Collection Station</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Collect, label, and process patient samples for testing</p>
        </div>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
        <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;background:rgba(0,51,102,0.06);color:var(--midnight-blue);font-size:13px;font-weight:600">
            <i data-lucide="user-check" style="width:14px;height:14px"></i> Phlebotomist: <strong>Ahmed Khan</strong>
        </span>
    </div>
</div>

<!-- Stat Cards -->
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px">
    <div class="card" style="border:1px solid var(--color-border);border-radius:12px;padding:16px;background:var(--color-card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px">Pending</div>
                <div style="font-size:28px;font-weight:800;color:var(--midnight-blue)" id="statPending">0</div>
            </div>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(234,179,8,0.12);display:flex;align-items:center;justify-content:center">
                <i data-lucide="clock" style="width:18px;height:18px;color:#eab308"></i>
            </div>
        </div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Awaiting collection</div>
    </div>
    <div class="card" style="border:1px solid var(--color-border);border-radius:12px;padding:16px;background:var(--color-card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px">Collected Today</div>
                <div style="font-size:28px;font-weight:800;color:#22c55e" id="statCollected">0</div>
            </div>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(34,197,94,0.12);display:flex;align-items:center;justify-content:center">
                <i data-lucide="check-circle" style="width:18px;height:18px;color:#22c55e"></i>
            </div>
        </div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Samples collected</div>
    </div>
    <div class="card" style="border:1px solid var(--color-border);border-radius:12px;padding:16px;background:var(--color-card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px">STAT / Urgent</div>
                <div style="font-size:28px;font-weight:800;color:#ef4444" id="statUrgent">0</div>
            </div>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(239,68,68,0.12);display:flex;align-items:center;justify-content:center">
                <i data-lucide="zap" style="width:18px;height:18px;color:#ef4444"></i>
            </div>
        </div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Priority collections</div>
    </div>
    <div class="card" style="border:1px solid var(--color-border);border-radius:12px;padding:16px;background:var(--color-card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px">Avg Wait</div>
                <div style="font-size:28px;font-weight:800;color:var(--midnight-blue)" id="statAvgWait">0</div>
            </div>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(127,255,212,0.15);display:flex;align-items:center;justify-content:center">
                <i data-lucide="timer" style="width:18px;height:18px;color:var(--aqua-mint)"></i>
            </div>
        </div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Minutes average</div>
    </div>
    <div class="card" style="border:1px solid var(--color-border);border-radius:12px;padding:16px;background:var(--color-card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
                <div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px">Rejected</div>
                <div style="font-size:28px;font-weight:800;color:#f97316" id="statRejected">0</div>
            </div>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(249,115,22,0.12);display:flex;align-items:center;justify-content:center">
                <i data-lucide="x-circle" style="width:18px;height:18px;color:#f97316"></i>
            </div>
        </div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Rejected today</div>
    </div>
</div>

<!-- Tabs -->
<div class="card" style="border:1px solid var(--color-border);border-radius:12px;overflow:hidden">
    <div style="display:flex;border-bottom:1px solid var(--color-border);background:rgba(0,51,102,0.03)">
        <button class="sc-tab active" data-tab="pending" style="padding:14px 24px;font-size:14px;font-weight:700;border:none;cursor:pointer;background:transparent;color:var(--midnight-blue);border-bottom:3px solid var(--aqua-mint);display:flex;align-items:center;gap:8px">
            <i data-lucide="clock" style="width:16px;height:16px"></i> Pending Collections (<span id="pendingCount">0</span>)
        </button>
        <button class="sc-tab" data-tab="today" style="padding:14px 24px;font-size:14px;font-weight:600;border:none;cursor:pointer;background:transparent;color:var(--color-muted-foreground);border-bottom:3px solid transparent;display:flex;align-items:center;gap:8px">
            <i data-lucide="calendar-check" style="width:16px;height:16px"></i> Today's Collections (<span id="todayCount">0</span>)
        </button>
    </div>

    <!-- Pending Collections Table -->
    <div id="tabPending" style="padding:0">
        <div style="padding:14px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--color-border)">
            <div style="position:relative;flex:1">
                <i data-lucide="search" style="width:16px;height:16px;position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--color-muted-foreground)"></i>
                <input type="text" id="pendingSearch" placeholder="Search by Order ID, Patient, MRN..." style="width:100%;padding:9px 12px 9px 36px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:var(--color-card)">
            </div>
            <select id="filterPriority" style="padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:var(--color-card)">
                <option value="">All Priorities</option>
                <option value="STAT">STAT</option>
                <option value="Urgent">Urgent</option>
                <option value="Routine">Routine</option>
            </select>
            <select id="filterSource" style="padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:var(--color-card)">
                <option value="">All Sources</option>
                <option value="Walk-in">Walk-in</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Emergency">ER</option>
                <option value="OT">OT</option>
            </select>
        </div>
        <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse" id="pendingTable">
                <thead>
                    <tr style="background:rgba(0,51,102,0.03)">
                        <th style="text-align:left;padding:10px 16px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Order ID</th>
                        <th style="text-align:left;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Patient</th>
                        <th style="text-align:left;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">MR Number</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Age/Gender</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Source</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Tests</th>
                        <th style="text-align:left;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Samples</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Priority</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Ordered</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Wait Time</th>
                        <th style="text-align:left;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Location</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);white-space:nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody id="pendingTableBody"></tbody>
            </table>
        </div>
        <div id="pendingEmpty" style="display:none;text-align:center;padding:60px 20px;color:var(--color-muted-foreground)">
            <i data-lucide="check-circle-2" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i>
            <p style="font-size:15px;font-weight:600;margin:0 0 4px">All caught up!</p>
            <p style="font-size:13px;margin:0">No pending sample collections at the moment</p>
        </div>
    </div>

    <!-- Today's Collections Table -->
    <div id="tabToday" style="display:none;padding:0">
        <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse">
                <thead>
                    <tr style="background:rgba(0,51,102,0.03)">
                        <th style="text-align:left;padding:10px 16px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Order ID</th>
                        <th style="text-align:left;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Patient</th>
                        <th style="text-align:left;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">MR Number</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Source</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Tests</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Priority</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Collected At</th>
                        <th style="text-align:left;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Collected By</th>
                        <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Status</th>
                    </tr>
                </thead>
                <tbody id="todayTableBody"></tbody>
            </table>
        </div>
        <div id="todayEmpty" style="display:none;text-align:center;padding:60px 20px;color:var(--color-muted-foreground)">
            <i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i>
            <p style="font-size:15px;font-weight:600;margin:0">No collections recorded today yet</p>
        </div>
    </div>
</div>

<!-- Sample Collection Offcanvas -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="collectionPanel" style="width:75%;max-width:900px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="background:var(--midnight-blue);padding:16px 24px;border-bottom:none" id="collectionPanelHeader">
        <div style="display:flex;align-items:center;gap:16px;flex:1">
            <div style="width:48px;height:48px;border-radius:50%;background:rgba(127,255,212,0.2);display:flex;align-items:center;justify-content:center">
                <i data-lucide="user" style="width:24px;height:24px;color:var(--aqua-mint)"></i>
            </div>
            <div>
                <h5 style="margin:0;font-size:18px;font-weight:700;color:#fff;font-family:'Roobert',sans-serif" id="cpPatientName">Patient Name</h5>
                <div style="display:flex;gap:12px;align-items:center;margin-top:4px">
                    <span style="font-size:13px;color:rgba(255,255,255,0.7)" id="cpPatientInfo">Age/Gender</span>
                    <span style="font-size:12px;color:var(--aqua-mint);font-weight:600" id="cpMrn">MRN</span>
                    <span class="badge" id="cpSourceBadge" style="font-size:11px;padding:2px 8px;border-radius:10px">Source</span>
                    <span class="badge" id="cpPriorityBadge" style="font-size:11px;padding:2px 8px;border-radius:10px">Priority</span>
                </div>
            </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
            <span id="cpFastingBadge" style="display:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600"></span>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
    </div>
    <div class="offcanvas-body" style="padding:0;overflow-y:auto" id="collectionPanelBody">
        <!-- Section: Sample Collection Checklist -->
        <div style="padding:20px 24px;border-bottom:1px solid var(--color-border)">
            <h6 style="margin:0 0 14px;font-size:15px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif;display:flex;align-items:center;gap:8px">
                <i data-lucide="list-checks" style="width:18px;height:18px;color:var(--aqua-mint)"></i> Sample Collection Checklist
            </h6>
            <div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;border:1px solid var(--color-border);border-radius:8px;overflow:hidden" id="samplesTable">
                    <thead>
                        <tr style="background:rgba(0,51,102,0.04)">
                            <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);width:40px">#</th>
                            <th style="text-align:left;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Tests</th>
                            <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Tube / Container</th>
                            <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Volume</th>
                            <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:var(--color-muted-foreground)">Status</th>
                        </tr>
                    </thead>
                    <tbody id="samplesTableBody"></tbody>
                    <tfoot id="samplesTfoot" style="background:rgba(0,51,102,0.03)"></tfoot>
                </table>
            </div>
        </div>

        <!-- Section: Sample Documentation -->
        <div style="padding:20px 24px;border-bottom:1px solid var(--color-border)">
            <h6 style="margin:0 0 14px;font-size:15px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif;display:flex;align-items:center;gap:8px">
                <i data-lucide="file-edit" style="width:18px;height:18px;color:var(--aqua-mint)"></i> Sample Documentation
            </h6>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                <div>
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Collection Time</label>
                    <div style="padding:9px 12px;background:rgba(0,51,102,0.04);border-radius:8px;font-size:14px;font-weight:600;color:var(--midnight-blue)" id="docCollectionTime">Auto-filled</div>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Collected By</label>
                    <div style="padding:9px 12px;background:rgba(0,51,102,0.04);border-radius:8px;font-size:14px;font-weight:600;color:var(--midnight-blue)" id="docCollectedBy">Ahmed Khan - Phlebotomist</div>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Venipuncture Site</label>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="radio" name="veniSite" value="Right AC" checked style="accent-color:var(--aqua-mint)"> Right AC</label>
                        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="radio" name="veniSite" value="Left AC" style="accent-color:var(--aqua-mint)"> Left AC</label>
                        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="radio" name="veniSite" value="Hand" style="accent-color:var(--aqua-mint)"> Hand</label>
                        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="radio" name="veniSite" value="Other" style="accent-color:var(--aqua-mint)"> Other</label>
                    </div>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Number of Attempts</label>
                    <div style="display:flex;gap:8px">
                        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="radio" name="attempts" value="1" checked style="accent-color:var(--aqua-mint)"> 1st</label>
                        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="radio" name="attempts" value="2" style="accent-color:var(--aqua-mint)"> 2nd</label>
                        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="radio" name="attempts" value="3" style="accent-color:var(--aqua-mint)"> 3rd</label>
                    </div>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Sample Quality</label>
                    <div style="display:flex;flex-direction:column;gap:4px">
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="radio" name="sampleQuality" value="Clear" checked style="accent-color:var(--aqua-mint)"> Clear (no hemolysis, lipemia, icterus)</label>
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="radio" name="sampleQuality" value="Hemolyzed" style="accent-color:var(--aqua-mint)"> Hemolyzed</label>
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="radio" name="sampleQuality" value="Lipemic" style="accent-color:var(--aqua-mint)"> Lipemic</label>
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="radio" name="sampleQuality" value="Icteric" style="accent-color:var(--aqua-mint)"> Icteric</label>
                    </div>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Patient Condition</label>
                    <div style="display:flex;flex-direction:column;gap:4px">
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="radio" name="patCondition" value="Stable" checked style="accent-color:var(--aqua-mint)"> Stable</label>
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="radio" name="patCondition" value="Anxious" style="accent-color:var(--aqua-mint)"> Anxious</label>
                        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="radio" name="patCondition" value="Fainted" style="accent-color:var(--aqua-mint)"> Fainted</label>
                    </div>
                </div>
                <div style="grid-column:1/-1">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Special Notes</label>
                    <textarea id="docNotes" rows="2" placeholder="Difficult venipuncture, small veins..." style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:var(--color-card);resize:vertical"></textarea>
                </div>
            </div>

            <div id="adverseReaction" style="display:none;margin-top:14px;padding:12px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:8px">
                <h6 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#ef4444">Adverse Reaction Protocol</h6>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;margin-bottom:4px"><input type="checkbox" style="accent-color:#ef4444"> Patient laid down, recovered</label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;margin-bottom:4px"><input type="checkbox" style="accent-color:#ef4444"> Doctor/nurse notified</label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" style="accent-color:#ef4444"> Incident report filed</label>
            </div>
        </div>

        <!-- Section 5: Barcode Label Preview -->
        <div style="padding:20px 24px">
            <h6 style="margin:0 0 14px;font-size:15px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif;display:flex;align-items:center;gap:8px">
                <i data-lucide="barcode" style="width:18px;height:18px;color:var(--aqua-mint)"></i> Barcode Labels
            </h6>
            <div id="labelsPreview" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-bottom:16px"></div>
            <button id="printLabelsBtn" style="padding:10px 20px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:var(--color-card);display:flex;align-items:center;gap:6px">
                <i data-lucide="printer" style="width:14px;height:14px"></i> Print All Labels
            </button>
        </div>
    </div>

    <!-- Panel Footer -->
    <div style="padding:14px 24px;border-top:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center;background:var(--color-card)">
        <div style="display:flex;gap:8px">
            <button id="rejectSampleBtn" style="padding:10px 18px;border:1px solid #ef4444;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:rgba(239,68,68,0.06);color:#ef4444;display:flex;align-items:center;gap:6px">
                <i data-lucide="x-circle" style="width:14px;height:14px"></i> Reject Sample
            </button>
            <button id="printLabelsAgain" style="padding:10px 18px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:var(--color-card);display:flex;align-items:center;gap:6px">
                <i data-lucide="printer" style="width:14px;height:14px"></i> Print Labels
            </button>
        </div>
        <div style="display:flex;gap:8px">
            <button id="saveProgressBtn" style="padding:10px 18px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:var(--color-card)">Save Progress</button>
            <button id="completeCollectionBtn" style="padding:12px 28px;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;background:var(--aqua-mint);color:var(--midnight-blue);display:flex;align-items:center;gap:6px">
                <i data-lucide="check-circle" style="width:16px;height:16px"></i> Complete Sample Collection
            </button>
        </div>
    </div>
</div>

<!-- Reject Modal -->
<div class="modal fade" id="rejectModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
            <div class="modal-header" style="background:rgba(239,68,68,0.06);border-bottom:1px solid var(--color-border);padding:16px 20px">
                <h5 style="margin:0;font-size:16px;font-weight:700;color:#ef4444;display:flex;align-items:center;gap:8px">
                    <i data-lucide="x-circle" style="width:18px;height:18px"></i> Reject Sample
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:20px">
                <label style="font-size:13px;font-weight:600;color:var(--color-foreground);margin-bottom:8px;display:block">Reason for rejection:</label>
                <select id="rejectReason" style="width:100%;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-card);margin-bottom:12px">
                    <option value="">Select reason...</option>
                    <option>Unlabeled or mislabeled sample</option>
                    <option>Incorrect tube type</option>
                    <option>Insufficient volume</option>
                    <option>Hemolyzed sample (for sensitive tests)</option>
                    <option>Clotted sample (for coagulation studies)</option>
                    <option>Expired sample (collected >4 hours ago)</option>
                    <option>Broken/leaking container</option>
                    <option>Patient not fasting (for fasting tests)</option>
                    <option>Other</option>
                </select>
                <textarea id="rejectNotes" rows="2" placeholder="Additional notes..." style="width:100%;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:var(--color-card)"></textarea>
            </div>
            <div class="modal-footer" style="border-top:1px solid var(--color-border);padding:12px 20px">
                <button type="button" data-bs-dismiss="modal" style="padding:8px 16px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;cursor:pointer;background:var(--color-card)">Cancel</button>
                <button id="confirmRejectBtn" style="padding:8px 16px;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;background:#ef4444;color:#fff">Confirm Rejection</button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/laboratory-sample-collection.js') }}?v={{ filemtime(public_path('js/laboratory-sample-collection.js')) }}"></script>
@endpush
