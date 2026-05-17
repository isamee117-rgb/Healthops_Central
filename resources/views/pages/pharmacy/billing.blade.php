@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="receipt" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Billing & Financial Reconciliation</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Track pharmacy revenue, reconcile transactions, manage payments</p>
        </div>
    </div>
    <div style="display:flex;gap:8px">
        <button id="btnCashRecon" style="display:flex;align-items:center;gap:6px;padding:9px 16px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer"><i data-lucide="calculator" style="width:15px;height:15px"></i> Cash Reconciliation</button>
    </div>
</div>

<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Today's Sales</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="trending-up" style="width:16px;height:16px;color:#22c55e"></i></div>
        </div>
        <div id="statTodaySales" style="font-size:22px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Pending Payments</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(249,115,22,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="clock" style="width:16px;height:16px;color:#f97316"></i></div>
        </div>
        <div id="statPending" style="font-size:22px;font-weight:700;color:#f97316;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Outstanding IPD</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(234,179,8,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="bed-double" style="width:16px;height:16px;color:#eab308"></i></div>
        </div>
        <div id="statIPD" style="font-size:22px;font-weight:700;color:#eab308;font-family:'Roobert',sans-serif">--</div>
    </div>
</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Panel Outstanding</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(234,179,8,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="building-2" style="width:16px;height:16px;color:#eab308"></i></div>
        </div>
        <div id="statPanel" style="font-size:22px;font-weight:700;color:#eab308;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px;border-left:3px solid #dc2626">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Outstanding ER</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(220,38,38,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="siren" style="width:16px;height:16px;color:#dc2626"></i></div>
        </div>
        <div id="statER" style="font-size:22px;font-weight:700;color:#dc2626;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Cash Sales</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="banknote" style="width:16px;height:16px;color:#22c55e"></i></div>
        </div>
        <div id="statCash" style="font-size:22px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Card Sales</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="credit-card" style="width:16px;height:16px;color:#22c55e"></i></div>
        </div>
        <div id="statCard" style="font-size:22px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border)">
            <span style="font-size:14px;font-weight:700;font-family:'Roobert',sans-serif">Revenue by Department</span>
            <div style="display:flex;gap:4px">
                <button class="rev-period-btn active" data-period="today" style="padding:4px 12px;border-radius:6px;border:1px solid var(--color-border);font-size:11px;font-weight:500;cursor:pointer;background:var(--aquamint);color:var(--midnight-blue)">Today</button>
                <button class="rev-period-btn" data-period="month" style="padding:4px 12px;border-radius:6px;border:1px solid var(--color-border);font-size:11px;font-weight:500;cursor:pointer;background:#fff">This Month</button>
            </div>
        </div>
        <div id="revDeptContent" style="padding:16px 20px"></div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
        <div style="padding:16px 20px;border-bottom:1px solid var(--color-border)">
            <span style="font-size:14px;font-weight:700;font-family:'Roobert',sans-serif">Revenue by Payment Category</span>
        </div>
        <div id="revPayContent" style="padding:16px 20px"></div>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);margin-bottom:24px;overflow:hidden">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border)">
        <span style="font-size:14px;font-weight:700;font-family:'Roobert',sans-serif">Billing Transactions</span>
        <div style="display:flex;gap:8px;align-items:center">
            <input type="text" id="txnSearch" placeholder="Search transactions..." style="padding:7px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;width:200px">
            <select id="txnDeptFilter" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;background:#fff">
                <option value="">All Departments</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Emergency">Emergency</option>
                <option value="OT">OT</option>
                <option value="Walk-in">Walk-in</option>
            </select>
            <select id="txnStatusFilter" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;background:#fff">
                <option value="">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Voided">Voided</option>
            </select>
        </div>
    </div>
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse" id="tblTransactions">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Transaction ID</th>
                    <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Date/Time</th>
                    <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Patient Name</th>
                    <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Department</th>
                    <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Order ID</th>
                    <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Total</th>
                    <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Payment</th>
                    <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Status</th>
                    <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Billed To</th>
                    <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Reconciliation</th>
                </tr>
            </thead>
            <tbody id="tbodyTransactions"></tbody>
        </table>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden;margin-bottom:24px">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border);background:#FFF7ED">
        <div style="display:flex;align-items:center;gap:8px">
            <i data-lucide="clock" style="width:16px;height:16px;color:#f97316"></i>
            <span style="font-size:14px;font-weight:700;color:#9a3412;font-family:'Roobert',sans-serif">OPD/Walk-in Pending</span>
        </div>
        <span id="pendingOpdTotal" style="font-size:13px;font-weight:600;color:#f97316"></span>
    </div>
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Patient</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Date</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Order</th>
                    <th style="padding:8px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Due</th>
                    <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Days</th>
                    <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                </tr>
            </thead>
            <tbody id="tbodyPendingOpd"></tbody>
        </table>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);margin-bottom:24px;overflow:hidden">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border);background:#FEFCE8">
        <div style="display:flex;align-items:center;gap:8px">
            <i data-lucide="bed-double" style="width:16px;height:16px;color:#eab308"></i>
            <span style="font-size:14px;font-weight:700;color:#854d0e;font-family:'Roobert',sans-serif">IPD Pending</span>
        </div>
        <span id="pendingIpdTotal" style="font-size:13px;font-weight:600;color:#eab308"></span>
    </div>
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Patient</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">IPD #</th>
                    <th style="padding:8px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Charges</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Updated</th>
                    <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                </tr>
            </thead>
            <tbody id="tbodyPendingIpd"></tbody>
        </table>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);border-left:3px solid #dc2626;margin-bottom:24px;overflow:hidden">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border);background:#FEF2F2">
        <div style="display:flex;align-items:center;gap:8px">
            <i data-lucide="siren" style="width:16px;height:16px;color:#dc2626"></i>
            <span style="font-size:14px;font-weight:700;color:#991b1b;font-family:'Roobert',sans-serif">ER Pending</span>
            <span style="font-size:11px;font-weight:500;color:#dc2626;background:rgba(220,38,38,0.08);padding:2px 8px;border-radius:12px;border:1px solid rgba(220,38,38,0.2)">Emergency Room Dispensed Medicines</span>
        </div>
        <span id="pendingErTotal" style="font-size:13px;font-weight:600;color:#dc2626"></span>
    </div>
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Patient</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Visit #</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Order</th>
                    <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Status</th>
                    <th style="padding:8px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Charges</th>
                    <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Dispensed</th>
                    <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                </tr>
            </thead>
            <tbody id="tbodyPendingEr"></tbody>
        </table>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="txnDetailSheet" style="width:640px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 class="offcanvas-title">TRANSACTION DETAILS</h5>
            <p id="txnDetailId" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <div id="txnDetailBody"></div>
        <div style="display:flex;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--color-border)">
            <button class="btn-print-receipt" style="padding:8px 16px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:12px;font-weight:500;cursor:pointer"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Print Receipt</button>
            <button class="btn-reconcile-txn" style="padding:8px 16px;background:var(--aquamint);border:none;border-radius:8px;font-size:12px;font-weight:600;color:var(--midnight-blue);cursor:pointer"><i data-lucide="check-circle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Reconcile</button>
            <button class="btn-void-txn" style="padding:8px 16px;background:#ef4444;border:none;border-radius:8px;font-size:12px;font-weight:600;color:#fff;cursor:pointer"><i data-lucide="x-circle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Void</button>
        </div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="cashReconSheet" style="width:640px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 class="offcanvas-title">DAILY CASH RECONCILIATION</h5>
            <p id="reconDateLabel" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
            <div>
                <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Date</label>
                <input type="date" id="reconDate" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
            </div>
            <div>
                <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Shift</label>
                <select id="reconShift" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                    <option>Morning (7 AM - 3 PM)</option>
                    <option>Evening (3 PM - 11 PM)</option>
                    <option>Night (11 PM - 7 AM)</option>
                </select>
            </div>
            <div>
                <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Pharmacist</label>
                <input type="text" id="reconPharmacist" value="Admin" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
            </div>
        </div>

        <div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">System Records</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Opening Balance</label><input type="number" id="reconOpening" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Cash Sales</label><input type="number" id="reconCashSales" readonly style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-background)"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Payments Received</label><input type="number" id="reconPayments" readonly style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-background)"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Returns/Refunds</label><input type="number" id="reconReturns" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
            </div>
            <div style="border-top:1px solid var(--color-border);margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;font-size:14px;font-weight:700">
                <span>Expected Closing:</span>
                <span id="reconExpected" style="color:var(--aquamint)">PKR 0</span>
            </div>
        </div>

        <div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Physical Count (Denominations)</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">5000 x</label><input type="number" class="denom-input" data-denom="5000" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">1000 x</label><input type="number" class="denom-input" data-denom="1000" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">500 x</label><input type="number" class="denom-input" data-denom="500" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">100 x</label><input type="number" class="denom-input" data-denom="100" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">50 x</label><input type="number" class="denom-input" data-denom="50" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">20 x</label><input type="number" class="denom-input" data-denom="20" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">10 x</label><input type="number" class="denom-input" data-denom="10" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Coins</label><input type="number" class="denom-input" data-denom="coins" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:center"></div>
            </div>
            <div style="border-top:1px solid var(--color-border);margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;font-size:14px;font-weight:700">
                <span>Total Cash:</span>
                <span id="reconActualCash">PKR 0</span>
            </div>
        </div>

        <div id="reconVarianceBox" style="padding:16px;border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Variance</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;font-size:13px">
                <div><span style="color:var(--color-muted-foreground)">Expected:</span> <strong id="reconVarExpected">0</strong></div>
                <div><span style="color:var(--color-muted-foreground)">Actual:</span> <strong id="reconVarActual">0</strong></div>
                <div><span style="color:var(--color-muted-foreground)">Difference:</span> <strong id="reconVarDiff">0</strong></div>
            </div>
            <div style="margin-bottom:12px">
                <label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Reason for Variance</label>
                <input type="text" id="reconVarReason" placeholder="e.g. Small change given, not recorded" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px">
            </div>
            <div>
                <label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Authorized By</label>
                <input type="text" id="reconAuthorized" placeholder="Manager name" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px">
            </div>
        </div>

        <div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Bank Deposit</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Amount to Deposit</label><input type="number" id="reconDeposit" value="0" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Remaining Float</label><input type="number" id="reconFloat" value="0" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Deposited By</label><input type="text" id="reconDepositedBy" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
                <div><label style="font-size:11px;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Deposit Slip No.</label><input type="text" id="reconSlipNo" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>
            </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--color-border)">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas" style="border-radius:8px;font-size:13px;padding:8px 20px">Cancel</button>
            <button type="button" id="btnSaveRecon" style="padding:8px 20px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:500;cursor:pointer">Save Draft</button>
            <button type="button" id="btnSubmitRecon" style="padding:8px 24px;background:var(--aquamint);border:none;border-radius:8px;font-size:13px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Submit</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/pharmacy-billing.js') }}?v={{ filemtime(public_path('js/pharmacy-billing.js')) }}"></script>
@endpush
