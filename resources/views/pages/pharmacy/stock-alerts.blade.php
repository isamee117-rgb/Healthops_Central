@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="alert-triangle" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Stock Alerts & Procurement</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Monitor stock levels, manage alerts, create purchase orders</p>
        </div>
    </div>
    <div style="display:flex;gap:8px">
        <button id="btnViewAlerts" style="display:flex;align-items:center;gap:6px;padding:9px 16px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer"><i data-lucide="bell" style="width:15px;height:15px"></i> Stock Alerts</button>
        <button id="btnCreatePO" style="display:flex;align-items:center;gap:6px;padding:9px 16px;background:var(--aquamint);border:none;border-radius:8px;font-size:13px;font-weight:600;color:var(--midnight-blue);cursor:pointer"><i data-lucide="plus" style="width:15px;height:15px"></i> Create PO</button>
    </div>
</div>

<div id="dashStatCards" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:24px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Total POs</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="file-text" style="width:16px;height:16px;color:#3b82f6"></i></div>
        </div>
        <div id="dashTotalPOs" style="font-size:24px;font-weight:700;color:#3b82f6;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Draft</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(100,116,139,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="file-edit" style="width:16px;height:16px;color:#64748b"></i></div>
        </div>
        <div id="dashDraftPOs" style="font-size:24px;font-weight:700;color:#64748b;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Sent</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="send" style="width:16px;height:16px;color:#3b82f6"></i></div>
        </div>
        <div id="dashSentPOs" style="font-size:24px;font-weight:700;color:#3b82f6;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Partial</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(249,115,22,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="package" style="width:16px;height:16px;color:#f97316"></i></div>
        </div>
        <div id="dashPartialPOs" style="font-size:24px;font-weight:700;color:#f97316;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Completed</span>
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="check-circle" style="width:16px;height:16px;color:#22c55e"></i></div>
        </div>
        <div id="dashCompletedPOs" style="font-size:24px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border)">
        <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:15px;font-weight:700;color:var(--color-foreground);font-family:'Roobert',sans-serif">Purchase Orders</span>
        </div>
        <div style="display:flex;gap:8px">
            <button class="po-main-filter-btn active" data-status="" style="padding:5px 12px;border-radius:6px;border:1px solid var(--color-border);font-size:12px;font-weight:500;cursor:pointer;background:var(--aquamint);color:var(--midnight-blue)">All</button>
            <button class="po-main-filter-btn" data-status="Draft" style="padding:5px 12px;border-radius:6px;border:1px solid var(--color-border);font-size:12px;font-weight:500;cursor:pointer;background:#fff">Draft</button>
            <button class="po-main-filter-btn" data-status="Sent" style="padding:5px 12px;border-radius:6px;border:1px solid var(--color-border);font-size:12px;font-weight:500;cursor:pointer;background:#fff">Sent</button>
            <button class="po-main-filter-btn" data-status="Partial" style="padding:5px 12px;border-radius:6px;border:1px solid var(--color-border);font-size:12px;font-weight:500;cursor:pointer;background:#fff">Partial</button>
            <button class="po-main-filter-btn" data-status="Completed" style="padding:5px 12px;border-radius:6px;border:1px solid var(--color-border);font-size:12px;font-weight:500;cursor:pointer;background:#fff">Completed</button>
        </div>
    </div>
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse" id="tblMainPO">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">PO Number</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Supplier</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Date</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Expected Delivery</th>
                    <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Items</th>
                    <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Total</th>
                    <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Status</th>
                    <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                </tr>
            </thead>
            <tbody id="tbodyMainPO"></tbody>
        </table>
    </div>
    <div id="poMainEmpty" style="display:none;padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:14px">
        <i data-lucide="inbox" style="width:32px;height:32px;display:block;margin:0 auto 8px;opacity:0.4"></i>
        No purchase orders found. Click "+ Create PO" to create one.
    </div>
    <div id="poMainLoading" style="padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:14px">Loading...</div>
</div>

{{-- Stock Alerts Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="alertsSheet" style="width:800px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,rgba(127,255,212,0.2),rgba(0,51,102,0.1));display:flex;align-items:center;justify-content:center">
                <i data-lucide="bell" style="width:22px;height:22px;color:var(--aquamint)"></i>
            </div>
            <div>
                <h5 class="offcanvas-title" style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif">Stock Alerts</h5>
                <p style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0">Monitor stock levels and expiry alerts</p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:16px 24px;overflow-y:auto">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
            <div style="background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);padding:12px;text-align:center">
                <div style="font-size:11px;color:var(--color-muted-foreground);font-weight:500;margin-bottom:4px">Out of Stock</div>
                <div id="dashOutOfStock" style="font-size:20px;font-weight:700;color:#ef4444">--</div>
            </div>
            <div style="background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);padding:12px;text-align:center">
                <div style="font-size:11px;color:var(--color-muted-foreground);font-weight:500;margin-bottom:4px">Low Stock</div>
                <div id="dashLowStock" style="font-size:20px;font-weight:700;color:#f97316">--</div>
            </div>
            <div style="background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);padding:12px;text-align:center">
                <div style="font-size:11px;color:var(--color-muted-foreground);font-weight:500;margin-bottom:4px">Expiring Soon</div>
                <div id="dashExpiring" style="font-size:20px;font-weight:700;color:#eab308">--</div>
            </div>
            <div style="background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);padding:12px;text-align:center">
                <div style="font-size:11px;color:var(--color-muted-foreground);font-weight:500;margin-bottom:4px">Expired</div>
                <div id="dashExpired" style="font-size:20px;font-weight:700;color:#ef4444">--</div>
            </div>
            <div style="background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);padding:12px;text-align:center">
                <div style="font-size:11px;color:var(--color-muted-foreground);font-weight:500;margin-bottom:4px">Reorder Needed</div>
                <div id="dashReorder" style="font-size:20px;font-weight:700;color:#3b82f6">--</div>
            </div>
        </div>

        <div id="alertSections">
            <div id="sectionOutOfStock" class="alert-section" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);margin-bottom:16px;overflow:hidden">
                <div class="alert-section-header" data-section="outOfStock" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;border-bottom:1px solid var(--color-border);background:#FEF2F2">
                    <div style="display:flex;align-items:center;gap:10px">
                        <div style="width:28px;height:28px;border-radius:6px;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center"><i data-lucide="package-x" style="width:14px;height:14px;color:#ef4444"></i></div>
                        <span style="font-size:14px;font-weight:700;color:#991B1B">Out of Stock</span>
                        <span id="badgeOutOfStock" style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:#ef4444;color:#fff">0</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px">
                        <span id="lostRevenue" style="font-size:12px;color:#991B1B;font-weight:500"></span>
                        <i data-lucide="chevron-down" class="section-chevron" style="width:16px;height:16px;color:#991B1B;transition:transform 0.2s"></i>
                    </div>
                </div>
                <div class="alert-section-body" style="display:none;overflow-x:auto">
                    <table style="width:100%;border-collapse:collapse" id="tblOutOfStock">
                        <thead>
                            <tr style="background:var(--color-background)">
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Medicine Name</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Last Stockout</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Pending Orders</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Avg Daily Usage</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Priority</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyOutOfStock"></tbody>
                    </table>
                    <div id="footerOutOfStock" style="padding:12px 20px;border-top:1px solid var(--color-border);display:flex;justify-content:space-between;font-size:13px;color:var(--color-muted-foreground)"></div>
                </div>
            </div>

            <div id="sectionLowStock" class="alert-section" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);margin-bottom:16px;overflow:hidden">
                <div class="alert-section-header" data-section="lowStock" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;border-bottom:1px solid var(--color-border);background:#FFF7ED">
                    <div style="display:flex;align-items:center;gap:10px">
                        <div style="width:28px;height:28px;border-radius:6px;background:rgba(249,115,22,0.15);display:flex;align-items:center;justify-content:center"><i data-lucide="alert-triangle" style="width:14px;height:14px;color:#f97316"></i></div>
                        <span style="font-size:14px;font-weight:700;color:#9a3412">Low Stock</span>
                        <span id="badgeLowStock" style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:#f97316;color:#fff">0</span>
                    </div>
                    <i data-lucide="chevron-down" class="section-chevron" style="width:16px;height:16px;color:#9a3412;transition:transform 0.2s"></i>
                </div>
                <div class="alert-section-body" style="display:none;overflow-x:auto">
                    <table style="width:100%;border-collapse:collapse" id="tblLowStock">
                        <thead>
                            <tr style="background:var(--color-background)">
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Medicine Name</th>
                                <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Current</th>
                                <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Min Level</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Days Until Out</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Reorder Qty</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyLowStock"></tbody>
                    </table>
                    <div id="footerLowStock" style="padding:12px 20px;border-top:1px solid var(--color-border);font-size:13px;color:var(--color-muted-foreground)"></div>
                </div>
            </div>

            <div id="sectionExpiring" class="alert-section" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);margin-bottom:16px;overflow:hidden">
                <div class="alert-section-header" data-section="expiring" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;border-bottom:1px solid var(--color-border);background:#FEFCE8">
                    <div style="display:flex;align-items:center;gap:10px">
                        <div style="width:28px;height:28px;border-radius:6px;background:rgba(234,179,8,0.15);display:flex;align-items:center;justify-content:center"><i data-lucide="clock" style="width:14px;height:14px;color:#eab308"></i></div>
                        <span style="font-size:14px;font-weight:700;color:#854d0e">Expiring Soon (&lt;3 months)</span>
                        <span id="badgeExpiring" style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:#eab308;color:#fff">0</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px">
                        <span id="expiringLoss" style="font-size:12px;color:#854d0e;font-weight:500"></span>
                        <i data-lucide="chevron-down" class="section-chevron" style="width:16px;height:16px;color:#854d0e;transition:transform 0.2s"></i>
                    </div>
                </div>
                <div class="alert-section-body" style="display:none;overflow-x:auto">
                    <table style="width:100%;border-collapse:collapse" id="tblExpiring">
                        <thead>
                            <tr style="background:var(--color-background)">
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Medicine Name</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Batch</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Expiry Date</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Days Remaining</th>
                                <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Qty</th>
                                <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Estimated Loss</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyExpiring"></tbody>
                    </table>
                    <div id="footerExpiring" style="padding:12px 20px;border-top:1px solid var(--color-border);display:flex;justify-content:space-between;font-size:13px;color:var(--color-muted-foreground)"></div>
                </div>
            </div>

            <div id="sectionExpired" class="alert-section" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);margin-bottom:16px;overflow:hidden">
                <div class="alert-section-header" data-section="expired" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;border-bottom:1px solid var(--color-border);background:#FEF2F2">
                    <div style="display:flex;align-items:center;gap:10px">
                        <div style="width:28px;height:28px;border-radius:6px;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center"><i data-lucide="x-circle" style="width:14px;height:14px;color:#ef4444"></i></div>
                        <span style="font-size:14px;font-weight:700;color:#991B1B">Expired Stock</span>
                        <span id="badgeExpired" style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:#ef4444;color:#fff">0</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px">
                        <span id="expiredLoss" style="font-size:12px;color:#991B1B;font-weight:500"></span>
                        <i data-lucide="chevron-down" class="section-chevron" style="width:16px;height:16px;color:#991B1B;transition:transform 0.2s"></i>
                    </div>
                </div>
                <div class="alert-section-body" style="display:none;overflow-x:auto">
                    <table style="width:100%;border-collapse:collapse" id="tblExpired">
                        <thead>
                            <tr style="background:var(--color-background)">
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Medicine Name</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Batch</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Expired Date</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Days Expired</th>
                                <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Qty</th>
                                <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Loss Value</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyExpired"></tbody>
                    </table>
                    <div id="footerExpired" style="padding:12px 20px;border-top:1px solid var(--color-border);display:flex;justify-content:space-between;font-size:13px;color:var(--color-muted-foreground)"></div>
                </div>
            </div>

            <div id="sectionReorder" class="alert-section" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);margin-bottom:16px;overflow:hidden">
                <div class="alert-section-header" data-section="reorder" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;border-bottom:1px solid var(--color-border);background:#EFF6FF">
                    <div style="display:flex;align-items:center;gap:10px">
                        <div style="width:28px;height:28px;border-radius:6px;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center"><i data-lucide="refresh-cw" style="width:14px;height:14px;color:#3b82f6"></i></div>
                        <span style="font-size:14px;font-weight:700;color:#1e40af">Reorder Suggestions</span>
                        <span id="badgeReorder" style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:#3b82f6;color:#fff">0</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px">
                        <span id="reorderValue" style="font-size:12px;color:#1e40af;font-weight:500"></span>
                        <i data-lucide="chevron-down" class="section-chevron" style="width:16px;height:16px;color:#1e40af;transition:transform 0.2s"></i>
                    </div>
                </div>
                <div class="alert-section-body" style="display:none;overflow-x:auto">
                    <div style="padding:12px 20px;background:#EFF6FF;border-bottom:1px solid var(--color-border);font-size:12px;color:#1e40af">
                        <i data-lucide="info" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i>
                        Based on: Usage patterns, Stock levels, Lead times, Seasonal trends
                    </div>
                    <table style="width:100%;border-collapse:collapse" id="tblReorder">
                        <thead>
                            <tr style="background:var(--color-background)">
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Medicine Name</th>
                                <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Current</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Reorder Point</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Suggested Qty</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Preferred Supplier</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Lead Time</th>
                                <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyReorder"></tbody>
                    </table>
                    <div id="footerReorder" style="padding:12px 20px;border-top:1px solid var(--color-border);display:flex;justify-content:space-between;font-size:13px;color:var(--color-muted-foreground)"></div>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- View PO Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="poViewSheet" style="width:720px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,rgba(127,255,212,0.2),rgba(0,51,102,0.1));display:flex;align-items:center;justify-content:center">
                <i data-lucide="file-text" style="width:22px;height:22px;color:var(--aquamint)"></i>
            </div>
            <div>
                <h5 class="offcanvas-title" style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif">PURCHASE ORDER</h5>
                <p id="poViewSub" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:0;overflow-y:auto">
        <div id="poViewLoading" style="padding:40px;text-align:center;color:var(--color-muted-foreground)">Loading...</div>
        <div id="poViewContent" style="display:none">
            <div style="padding:20px 24px;border-bottom:1px solid var(--color-border)">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
                    <div style="display:flex;align-items:center;gap:10px">
                        <span id="poViewId" style="font-size:18px;font-weight:700;font-family:monospace;color:var(--color-foreground)"></span>
                        <span id="poViewStatus" style="padding:3px 12px;border-radius:6px;font-size:12px;font-weight:600"></span>
                    </div>
                    <span id="poViewOrderType" style="font-size:12px;color:var(--color-muted-foreground);font-weight:500;padding:4px 10px;background:var(--color-background);border-radius:6px;border:1px solid var(--color-border)"></span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div style="background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);padding:14px">
                        <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:8px;letter-spacing:0.05em">Supplier Details</div>
                        <div style="font-size:14px;font-weight:700;color:var(--color-foreground);margin-bottom:4px" id="poViewSupplierName"></div>
                        <div style="font-size:12px;color:var(--color-muted-foreground);line-height:1.6">
                            <div id="poViewSupplierPhone"></div>
                            <div id="poViewSupplierEmail"></div>
                        </div>
                    </div>
                    <div style="background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);padding:14px">
                        <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:8px;letter-spacing:0.05em">Order Dates</div>
                        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px">
                            <span style="color:var(--color-muted-foreground)">PO Date:</span>
                            <span id="poViewDate" style="font-weight:600"></span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px">
                            <span style="color:var(--color-muted-foreground)">Expected Delivery:</span>
                            <span id="poViewDelivery" style="font-weight:600"></span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px">
                            <span style="color:var(--color-muted-foreground)">Payment:</span>
                            <span id="poViewPayment" style="font-weight:600"></span>
                        </div>
                    </div>
                </div>
            </div>

            <div style="padding:20px 24px;border-bottom:1px solid var(--color-border)">
                <div style="font-size:13px;font-weight:700;color:var(--color-foreground);margin-bottom:12px;font-family:'Roobert',sans-serif">
                    <i data-lucide="package" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Order Items
                </div>
                <div style="overflow-x:auto">
                    <table style="width:100%;border-collapse:collapse" id="tblPoView">
                        <thead>
                            <tr style="background:var(--color-background)">
                                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Medicine</th>
                                <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Current Stock</th>
                                <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Ordered</th>
                                <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Received</th>
                                <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Unit Price</th>
                                <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyPoView"></tbody>
                    </table>
                </div>
            </div>

            <div style="padding:20px 24px;border-bottom:1px solid var(--color-border)">
                <div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">
                    <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Financial Summary</div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Subtotal:</span><span id="poViewSubtotal" style="font-weight:600;font-family:monospace"></span></div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Tax:</span><span id="poViewTax" style="font-weight:600;font-family:monospace"></span></div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Discount:</span><span id="poViewDiscount" style="font-weight:600;font-family:monospace"></span></div>
                    <div style="border-top:1px solid var(--color-border);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-size:16px;font-weight:700"><span>TOTAL:</span><span id="poViewTotal" style="color:var(--aquamint);font-family:monospace"></span></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0 0;font-size:12px;color:var(--color-muted-foreground)">
                        <span>Advance Payment: <strong id="poViewAdvance"></strong></span>
                        <span>Credit Days: <strong id="poViewCreditDays"></strong></span>
                    </div>
                </div>
            </div>

            <div id="poViewNotesSection" style="padding:20px 24px;border-bottom:1px solid var(--color-border);display:none">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div id="poViewDeliveryInstrWrap" style="display:none">
                        <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:6px">Delivery Instructions</div>
                        <div id="poViewDeliveryInstr" style="font-size:13px;color:var(--color-foreground);padding:10px;background:var(--color-background);border-radius:8px;border:1px solid var(--color-border)"></div>
                    </div>
                    <div id="poViewNotesWrap" style="display:none">
                        <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:6px">Special Notes</div>
                        <div id="poViewNotes" style="font-size:13px;color:var(--color-foreground);padding:10px;background:var(--color-background);border-radius:8px;border:1px solid var(--color-border)"></div>
                    </div>
                </div>
            </div>

            <div style="padding:20px 24px">
                <div id="poViewActions" style="display:flex;justify-content:flex-end;gap:8px"></div>
            </div>
        </div>
    </div>
</div>

{{-- Create PO Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="poFormSheet" style="width:720px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,rgba(127,255,212,0.2),rgba(0,51,102,0.1));display:flex;align-items:center;justify-content:center">
                <i data-lucide="file-plus" style="width:22px;height:22px;color:var(--aquamint)"></i>
            </div>
            <div>
                <h5 id="poFormTitle" class="offcanvas-title" style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif">CREATE PURCHASE ORDER</h5>
                <p id="poFormSub" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0">Fill in order details below</p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
            <div>
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">PO Number</label>
                <input type="text" id="poNumber" readonly style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:var(--color-background);color:var(--color-muted-foreground)">
            </div>
            <div>
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Supplier *</label>
                <select id="poSupplier" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                    <option value="">Select Supplier...</option>
                </select>
            </div>
        </div>
        <div id="supplierInfo" style="display:none;padding:12px;background:var(--color-background);border-radius:8px;border:1px solid var(--color-border);margin-bottom:16px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
                <div><span style="color:var(--color-muted-foreground)">Contact:</span> <span id="supContact" style="font-weight:500"></span></div>
                <div><span style="color:var(--color-muted-foreground)">Phone:</span> <span id="supPhone" style="font-weight:500"></span></div>
                <div><span style="color:var(--color-muted-foreground)">Email:</span> <span id="supEmail" style="font-weight:500"></span></div>
                <div><span style="color:var(--color-muted-foreground)">Lead Time:</span> <span id="supLeadTime" style="font-weight:500"></span></div>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
            <div>
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">PO Date</label>
                <input type="date" id="poDate" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
            </div>
            <div>
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Expected Delivery</label>
                <input type="date" id="poExpectedDelivery" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
            </div>
        </div>
        <div style="margin-bottom:20px">
            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:8px">Order Type</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px"><input type="radio" name="poOrderType" value="Regular Stock Replenishment" checked> Regular</label>
                <label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px"><input type="radio" name="poOrderType" value="Emergency Order"> Emergency</label>
                <label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px"><input type="radio" name="poOrderType" value="Consignment"> Consignment</label>
                <label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px"><input type="radio" name="poOrderType" value="Direct Patient Order"> Direct Patient</label>
            </div>
        </div>

        <div style="margin-bottom:20px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Medicines to Order</label>
                <button id="btnAddMedicine" style="display:flex;align-items:center;gap:4px;padding:6px 12px;background:var(--aquamint);border:none;border-radius:6px;font-size:12px;font-weight:600;color:var(--midnight-blue);cursor:pointer"><i data-lucide="plus" style="width:12px;height:12px"></i> Add Medicine</button>
            </div>
            <div id="poMedicinesContainer">
                <table style="width:100%;border-collapse:collapse;font-size:13px" id="tblPoItems">
                    <thead>
                        <tr style="background:var(--color-background)">
                            <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Medicine Name</th>
                            <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Current</th>
                            <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Qty</th>
                            <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Unit Price</th>
                            <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Total</th>
                            <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase"></th>
                        </tr>
                    </thead>
                    <tbody id="tbodyPoItems"></tbody>
                </table>
            </div>
            <div id="poItemEmpty" style="padding:20px;text-align:center;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px;margin-top:8px">Click "+ Add Medicine" to add items</div>
        </div>

        <div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Summary</div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Total Items:</span><span id="poTotalItems" style="font-weight:600">0</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Total Quantity:</span><span id="poTotalQty" style="font-weight:600">0 items</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Subtotal:</span><span id="poSubtotal" style="font-weight:600">PKR 0</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Tax:</span><span style="font-weight:600">PKR 0</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Discount:</span><span style="font-weight:600">PKR 0</span></div>
            <div style="border-top:1px solid var(--color-border);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-size:15px;font-weight:700"><span>TOTAL:</span><span id="poTotal" style="color:var(--aquamint)">PKR 0</span></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
            <div>
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Payment Method</label>
                <select id="poPaymentMethod" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                    <option value="Cash">Cash</option>
                    <option value="Credit" selected>Credit</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                </select>
            </div>
            <div>
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Credit Days</label>
                <input type="number" id="poCreditDays" value="30" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
            </div>
            <div>
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Advance Payment</label>
                <input type="number" id="poAdvance" value="0" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px">
            </div>
        </div>
        <div style="margin-bottom:16px">
            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Delivery Instructions</label>
            <textarea id="poDeliveryInstructions" rows="2" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;resize:vertical" placeholder="Optional..."></textarea>
        </div>
        <div style="margin-bottom:20px">
            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Special Notes</label>
            <textarea id="poNotes" rows="2" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;resize:vertical" placeholder="Optional..."></textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--color-border)">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas" style="border-radius:8px;font-size:13px;padding:8px 20px">Cancel</button>
            <button type="button" id="btnSaveDraft" style="padding:8px 20px;background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;font-size:13px;font-weight:500;cursor:pointer">Save Draft</button>
            <button type="button" id="btnSendPO" style="padding:8px 24px;background:var(--aquamint);border:none;border-radius:8px;font-size:13px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Send to Supplier</button>
        </div>
    </div>
</div>

{{-- GRN Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="grnSheet" style="width:720px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,rgba(127,255,212,0.2),rgba(0,51,102,0.1));display:flex;align-items:center;justify-content:center">
                <i data-lucide="package-check" style="width:22px;height:22px;color:var(--aquamint)"></i>
            </div>
            <div>
                <h5 class="offcanvas-title" style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif">RECEIVE STOCK (GRN)</h5>
                <p id="grnPoRef" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <div id="grnItemsContainer"></div>
        <div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-top:20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">GRN Summary</div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Total Items:</span><span id="grnTotalItems" style="font-weight:600">0</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Total Received Value:</span><span id="grnTotalValue" style="font-weight:600">PKR 0</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Received By:</span><span style="font-weight:600">Admin</span></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Date:</span><span id="grnDate" style="font-weight:600"></span></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:12px;border-top:1px solid var(--color-border)">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas" style="border-radius:8px;font-size:13px;padding:8px 20px">Cancel</button>
            <button type="button" id="btnCompleteGRN" style="padding:8px 24px;background:var(--aquamint);border:none;border-radius:8px;font-size:13px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Complete GRN & Update Stock</button>
        </div>
    </div>
</div>

{{-- Add Medicine Modal - integrated with Inventory Management --}}
<div class="modal fade" id="addMedicineModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius:16px;border:1px solid var(--color-border);overflow:hidden">
            <div class="modal-header" style="padding:16px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
                <h5 class="modal-title" style="font-size:15px;font-weight:700;font-family:'Roobert',sans-serif">Add Medicine to Order</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:20px 24px">
                <div style="margin-bottom:12px">
                    <input type="text" id="medSearchInput" placeholder="Search medicine from inventory..." style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none">
                </div>
                <div id="medSearchResults" style="max-height:300px;overflow-y:auto"></div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/pharmacy-stock-alerts.js') }}?v={{ filemtime(public_path('js/pharmacy-stock-alerts.js')) }}"></script>
@endpush
