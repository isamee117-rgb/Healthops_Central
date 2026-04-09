@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="receipt" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Billing & Financial Reconciliation</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Track laboratory revenue, reconcile transactions, manage payments</p>
        </div>
    </div>
    <div style="display:flex;gap:8px">
        <button id="btnCashRecon" style="display:flex;align-items:center;gap:6px;padding:9px 16px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer"><i data-lucide="calculator" style="width:15px;height:15px"></i> Cash Reconciliation</button>
    </div>
</div>

{{-- Stat Cards Row 1 --}}
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

{{-- Stat Cards Row 2 --}}
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Panel Outstanding</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(234,179,8,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="building-2" style="width:16px;height:16px;color:#eab308"></i></div>
        </div>
        <div id="statPanel" style="font-size:22px;font-weight:700;color:#eab308;font-family:'Roobert',sans-serif">--</div>
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

{{-- Revenue Charts --}}
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

{{-- Billing Transactions Table --}}
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

{{-- OPD/Walk-in Pending --}}
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

{{-- IPD Pending --}}
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

{{-- Transaction Detail Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="txnDetailSheet" style="width:640px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,rgba(127,255,212,0.2),rgba(0,51,102,0.1));display:flex;align-items:center;justify-content:center">
                <i data-lucide="receipt" style="width:22px;height:22px;color:var(--aquamint)"></i>
            </div>
            <div>
                <h5 class="offcanvas-title" style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif">TRANSACTION DETAILS</h5>
                <p id="txnDetailId" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
            </div>
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

{{-- Collect Payment Modal --}}
<div id="collectPayModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1060;align-items:center;justify-content:center">
    <div style="background:#fff;border-radius:14px;padding:28px;width:380px;box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <h4 style="font-size:16px;font-weight:700;margin:0 0 16px;color:var(--midnight-blue)">Collect Payment</h4>
        <div style="margin-bottom:12px">
            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Payment Mode</label>
            <select id="collectPayMode" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                <option>Cash</option><option>Card</option><option>Mobile</option><option>Cheque</option>
            </select>
        </div>
        <div style="display:flex;gap:8px;margin-top:20px">
            <button id="collectPayConfirm" style="flex:1;padding:10px;background:var(--aquamint);border:none;border-radius:8px;font-size:13px;font-weight:700;color:var(--midnight-blue);cursor:pointer">Confirm Payment</button>
            <button onclick="document.getElementById('collectPayModal').style.display='none'" style="padding:10px 16px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;cursor:pointer">Cancel</button>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script src="{{ asset('js/laboratory-billing.js') }}?v={{ filemtime(public_path('js/laboratory-billing.js')) }}"></script>
@endpush
