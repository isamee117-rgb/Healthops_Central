@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="flask-conical" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Inventory & Reagent Management</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Manage lab reagents, consumables, QC materials &amp; equipment inventory</p>
        </div>
    </div>
</div>

<div id="invStatsRow" style="display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-bottom:20px">
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Total Items</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(127,255,212,0.12);display:flex;align-items:center;justify-content:center"><i data-lucide="flask-conical" style="width:16px;height:16px;color:var(--aquamint)"></i></div>
        </div>
        <div id="statTotal" style="font-size:26px;font-weight:700;color:var(--color-foreground);font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Out of Stock</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="package-x" style="width:16px;height:16px;color:#ef4444"></i></div>
        </div>
        <div id="statOOS" style="font-size:26px;font-weight:700;color:#ef4444;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Low Stock</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(249,115,22,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="alert-triangle" style="width:16px;height:16px;color:#f97316"></i></div>
        </div>
        <div id="statLow" style="font-size:26px;font-weight:700;color:#f97316;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Expiring Soon</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(234,179,8,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="clock" style="width:16px;height:16px;color:#eab308"></i></div>
        </div>
        <div id="statExpiring" style="font-size:26px;font-weight:700;color:#eab308;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Low Reagent Kits</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(168,85,247,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="beaker" style="width:16px;height:16px;color:#a855f7"></i></div>
        </div>
        <div id="statLowKits" style="font-size:26px;font-weight:700;color:#a855f7;font-family:'Roobert',sans-serif">--</div>
        <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:2px">&lt;20% remaining</div>
    </div>
    <div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--color-muted-foreground);font-weight:500">Stock Value</span>
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="banknote" style="width:16px;height:16px;color:#22c55e"></i></div>
        </div>
        <div id="statValue" style="font-size:26px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
</div>

<div id="storagePanel" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px;margin-bottom:20px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-size:14px;font-weight:700;color:var(--color-foreground);font-family:'Roobert',sans-serif">
            <i data-lucide="thermometer" style="width:16px;height:16px;vertical-align:-3px;margin-right:6px;color:var(--aquamint)"></i>Reagents by Storage Condition
        </div>
        <div style="display:flex;gap:8px">
            <button id="btnTempLog" style="font-size:12px;padding:6px 14px;border:1px solid var(--color-border);border-radius:6px;background:#fff;color:var(--color-foreground);cursor:pointer;font-weight:500"><i data-lucide="thermometer-sun" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i>Temperature Log</button>
            <button id="btnAlarmHistory" style="font-size:12px;padding:6px 14px;border:1px solid var(--color-border);border-radius:6px;background:#fff;color:var(--color-foreground);cursor:pointer;font-weight:500"><i data-lucide="bell-ring" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i>Alarm History</button>
        </div>
    </div>
    <div id="storageCards" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px"></div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
    <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <div id="categoryTabs" style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="cat-tab active" data-cat="" style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:600;border:1px solid var(--aquamint);background:rgba(127,255,212,0.15);color:var(--midnight-blue);cursor:pointer">All Items</button>
            <button class="cat-tab" data-cat="Reagents" style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:500;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);cursor:pointer">Reagents</button>
            <button class="cat-tab" data-cat="QC Materials" style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:500;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);cursor:pointer">QC Materials</button>
            <button class="cat-tab" data-cat="Calibrators" style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:500;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);cursor:pointer">Calibrators</button>
            <button class="cat-tab" data-cat="Consumables" style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:500;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);cursor:pointer">Consumables</button>
            <button class="cat-tab" data-cat="Stains & Chemicals" style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:500;border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);cursor:pointer">Stains &amp; Chemicals</button>
        </div>
    </div>
    <div style="padding:12px 20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <div style="position:relative;flex:1;min-width:220px">
            <i data-lucide="search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--color-muted-foreground)"></i>
            <input type="text" id="invSearch" placeholder="Search reagent, code, manufacturer, catalog..." style="width:100%;padding:9px 12px 9px 36px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:var(--color-background)">
        </div>
        <select id="filterStorage" style="padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff;min-width:150px">
            <option value="">All Storage</option>
            <option value="Room Temperature">Room Temperature</option>
            <option value="Refrigerated">Refrigerated</option>
            <option value="Frozen">Frozen</option>
            <option value="Ultra-Frozen">Ultra-Frozen</option>
        </select>
        <select id="filterStockStatus" style="padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff;min-width:130px">
            <option value="">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
        </select>
        <select id="filterAnalyzer" style="padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff;min-width:150px">
            <option value="">All Analyzers</option>
        </select>
    </div>
    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Code</th>
                    <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Reagent / Item</th>
                    <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Category</th>
                    <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Storage</th>
                    <th style="padding:12px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Stock</th>
                    <th style="padding:12px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Min/Max</th>
                    <th style="padding:12px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Status</th>
                    <th style="padding:12px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Reagent Level</th>
                    <th style="padding:12px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Batches</th>
                    <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Nearest Expiry</th>
                    <th style="padding:12px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Actions</th>
                </tr>
            </thead>
            <tbody id="invTableBody">
                <tr><td colspan="11" style="padding:40px;text-align:center;color:var(--color-muted-foreground)">Loading...</td></tr>
            </tbody>
        </table>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="reagentDetailSheet" style="width:700px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,rgba(127,255,212,0.2),rgba(0,51,102,0.1));display:flex;align-items:center;justify-content:center">
                <i data-lucide="flask-conical" style="width:22px;height:22px;color:var(--aquamint)"></i>
            </div>
            <div>
                <h5 id="detailTitle" class="offcanvas-title" style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif">Reagent Detail</h5>
                <p id="detailSub" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:0;display:flex;flex-direction:column;height:100%">
        <div style="display:flex;border-bottom:1px solid var(--color-border);background:var(--color-background);padding:0 24px;gap:0">
            <button class="detail-tab active" data-tab="overview" style="padding:12px 14px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid var(--aquamint);color:var(--aquamint);cursor:pointer">Overview</button>
            <button class="detail-tab" data-tab="lots" style="padding:12px 14px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Lot Tracking</button>
            <button class="detail-tab" data-tab="consumption" style="padding:12px 14px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Consumption</button>
            <button class="detail-tab" data-tab="transactions" style="padding:12px 14px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Transactions</button>
            <button class="detail-tab" data-tab="storage" style="padding:12px 14px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Storage</button>
        </div>
        <div id="detailTabContent" style="flex:1;overflow-y:auto;padding:24px"></div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="analyzerSheet" style="width:700px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,rgba(127,255,212,0.2),rgba(0,51,102,0.1));display:flex;align-items:center;justify-content:center">
                <i data-lucide="cpu" style="width:22px;height:22px;color:var(--aquamint)"></i>
            </div>
            <div>
                <h5 class="offcanvas-title" style="font-size:16px;font-weight:700;margin:0;font-family:'Roobert',sans-serif">Analyzer Reagent Status</h5>
                <p style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0">On-board reagent levels &amp; alerts</p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px">
        <div id="analyzerContent"></div>
    </div>
</div>

<div class="modal fade" id="stockAdjustModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius:16px;border:1px solid var(--color-border);overflow:hidden">
            <div class="modal-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
                <h5 class="modal-title" style="font-size:16px;font-weight:700;font-family:'Roobert',sans-serif"><i data-lucide="sliders-horizontal" style="width:18px;height:18px;vertical-align:-3px;margin-right:8px;color:var(--aquamint)"></i>Adjust Stock</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:24px">
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Reagent</label>
                    <div id="adjName" style="font-size:14px;font-weight:600;color:var(--color-foreground)"></div>
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Current Stock</label>
                    <div id="adjCurrentStock" style="font-size:14px;font-weight:600;color:var(--color-foreground)"></div>
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:6px">Adjustment Type</label>
                    <div style="display:flex;gap:8px">
                        <label style="flex:1;display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px">
                            <input type="radio" name="adjType" value="increase" checked> <i data-lucide="plus-circle" style="width:16px;height:16px;color:#22c55e"></i> Increase
                        </label>
                        <label style="flex:1;display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px">
                            <input type="radio" name="adjType" value="decrease"> <i data-lucide="minus-circle" style="width:16px;height:16px;color:#ef4444"></i> Decrease
                        </label>
                        <label style="flex:1;display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px">
                            <input type="radio" name="adjType" value="set"> <i data-lucide="refresh-cw" style="width:16px;height:16px;color:#3b82f6"></i> Set
                        </label>
                    </div>
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Quantity</label>
                    <input type="number" id="adjQuantity" min="0" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;outline:none" placeholder="Enter quantity">
                </div>
                <div style="margin-bottom:16px;padding:12px;background:var(--color-background);border-radius:8px;display:flex;justify-content:space-between;align-items:center">
                    <span style="font-size:13px;color:var(--color-muted-foreground)">New Stock Level:</span>
                    <span id="adjNewStock" style="font-size:16px;font-weight:700;color:var(--color-foreground)">--</span>
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Reason *</label>
                    <select id="adjReason" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                        <option value="">Select reason...</option>
                        <option value="Physical Count Correction">Physical Count Correction</option>
                        <option value="QC Use">QC Use</option>
                        <option value="Expired/Damaged">Expired/Damaged</option>
                        <option value="Reagent Kit Replacement">Reagent Kit Replacement</option>
                        <option value="Lot Change (QC Re-run Required)">Lot Change (QC Re-run Required)</option>
                        <option value="Transfer Between Labs">Transfer Between Labs</option>
                        <option value="New Stock Received">New Stock Received</option>
                        <option value="Wastage">Wastage</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div id="adjOtherWrap" style="margin-bottom:16px;display:none">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Specify Reason</label>
                    <input type="text" id="adjOtherReason" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none" placeholder="Enter reason">
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Notes</label>
                    <textarea id="adjNotes" rows="2" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;resize:vertical" placeholder="Optional notes..."></textarea>
                </div>
            </div>
            <div class="modal-footer" style="padding:16px 24px;border-top:1px solid var(--color-border)">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" style="border-radius:8px;font-size:13px;padding:8px 20px">Cancel</button>
                <button type="button" id="btnConfirmAdjust" style="background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:8px;font-size:13px;font-weight:600;padding:8px 24px;cursor:pointer">Confirm Adjustment</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="tempLogModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="border-radius:16px;border:1px solid var(--color-border);overflow:hidden">
            <div class="modal-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
                <h5 class="modal-title" style="font-size:16px;font-weight:700;font-family:'Roobert',sans-serif"><i data-lucide="thermometer-sun" style="width:18px;height:18px;vertical-align:-3px;margin-right:8px;color:var(--aquamint)"></i>Temperature Log</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:24px">
                <div id="tempLogContent"></div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="alarmModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="border-radius:16px;border:1px solid var(--color-border);overflow:hidden">
            <div class="modal-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
                <h5 class="modal-title" style="font-size:16px;font-weight:700;font-family:'Roobert',sans-serif"><i data-lucide="bell-ring" style="width:18px;height:18px;vertical-align:-3px;margin-right:8px;color:#ef4444"></i>Alarm History</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:24px">
                <div id="alarmContent"></div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="{{ asset('js/laboratory-inventory.js') }}?v={{ filemtime(public_path('js/laboratory-inventory.js')) }}"></script>
@endpush
