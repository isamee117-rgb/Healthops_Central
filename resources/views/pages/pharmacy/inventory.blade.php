@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="warehouse" style="width:24px;height:24px;color:var(--aquamint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Inventory Management</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Manage medicine stock, batches, expiry &amp; locations</p>
        </div>
    </div>
    <button id="btnAddMedicine" style="display:flex;align-items:center;gap:8px;background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:10px;font-size:14px;font-weight:600;padding:10px 20px;cursor:pointer;font-family:'Roobert',sans-serif;transition:opacity 0.15s" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
        <i data-lucide="plus" style="width:18px;height:18px"></i> Add Medicine
    </button>
</div>

<div id="invStatsRow" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:20px">
    <div class="inv-stat-card" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--color-muted-foreground);font-weight:500">Total Medicines</span>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(127,255,212,0.12);display:flex;align-items:center;justify-content:center"><i data-lucide="pill" style="width:18px;height:18px;color:var(--aquamint)"></i></div>
        </div>
        <div id="statTotalMedicines" style="font-size:28px;font-weight:700;color:var(--color-foreground);font-family:'Roobert',sans-serif">--</div>
    </div>
    <div class="inv-stat-card" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--color-muted-foreground);font-weight:500">Out of Stock</span>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="package-x" style="width:18px;height:18px;color:#ef4444"></i></div>
        </div>
        <div id="statOutOfStock" style="font-size:28px;font-weight:700;color:#ef4444;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div class="inv-stat-card" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--color-muted-foreground);font-weight:500">Low Stock</span>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(249,115,22,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="alert-triangle" style="width:18px;height:18px;color:#f97316"></i></div>
        </div>
        <div id="statLowStock" style="font-size:28px;font-weight:700;color:#f97316;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div class="inv-stat-card" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--color-muted-foreground);font-weight:500">Expiring Soon</span>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(234,179,8,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="clock" style="width:18px;height:18px;color:#eab308"></i></div>
        </div>
        <div id="statExpiringSoon" style="font-size:28px;font-weight:700;color:#eab308;font-family:'Roobert',sans-serif">--</div>
    </div>
    <div class="inv-stat-card" style="background:#fff;border-radius:12px;border:1px solid var(--color-border);padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--color-muted-foreground);font-weight:500">Stock Value</span>
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center"><i data-lucide="banknote" style="width:18px;height:18px;color:#22c55e"></i></div>
        </div>
        <div id="statStockValue" style="font-size:28px;font-weight:700;color:#22c55e;font-family:'Roobert',sans-serif">--</div>
    </div>
</div>

<div style="background:#fff;border-radius:12px;border:1px solid var(--color-border);overflow:hidden">
    <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <div style="position:relative;flex:1;min-width:250px">
            <i data-lucide="search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--color-muted-foreground)"></i>
            <input type="text" id="invSearch" placeholder="Search medicine name, code, manufacturer..." style="width:100%;padding:9px 12px 9px 36px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:var(--color-background)">
        </div>
        <select id="filterCategory" style="padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff;min-width:140px">
            <option value="">All Categories</option>
        </select>
        <select id="filterForm" style="padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff;min-width:120px">
            <option value="">All Forms</option>
        </select>
        <select id="filterStockStatus" style="padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff;min-width:130px">
            <option value="">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
        </select>
        <select id="filterAbc" style="padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff;min-width:100px">
            <option value="">ABC All</option>
            <option value="A">A (Fast)</option>
            <option value="B">B (Medium)</option>
            <option value="C">C (Slow)</option>
        </select>
    </div>

    <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
            <thead>
                <tr style="background:var(--color-background)">
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Code</th>
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Medicine Name</th>
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Form</th>
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Category</th>
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Manufacturer</th>
                    <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Stock</th>
                    <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Min/Max</th>
                    <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Status</th>
                    <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Price</th>
                    <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Batches</th>
                    <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Nearest Expiry</th>
                    <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.03em">Actions</th>
                </tr>
            </thead>
            <tbody id="invTableBody">
                <tr><td colspan="12" style="padding:40px;text-align:center;color:var(--color-muted-foreground)">Loading...</td></tr>
            </tbody>
        </table>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="medicineDetailSheet" style="width:680px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 id="medDetailTitle" class="offcanvas-title">Medicine Detail</h5>
            <p id="medDetailSub" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:0;display:flex;flex-direction:column;height:100%">
        <div style="display:flex;border-bottom:1px solid var(--color-border);background:var(--color-background);padding:0 24px;gap:0">
            <button class="med-tab-btn active" data-tab="overview" style="padding:12px 16px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid var(--aquamint);color:var(--aquamint);cursor:pointer">Overview</button>
            <button class="med-tab-btn" data-tab="batches" style="padding:12px 16px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Batches</button>
            <button class="med-tab-btn" data-tab="transactions" style="padding:12px 16px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Transactions</button>
            <button class="med-tab-btn" data-tab="analytics" style="padding:12px 16px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Analytics</button>
            <button class="med-tab-btn" data-tab="substitutes" style="padding:12px 16px;font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;color:var(--color-muted-foreground);cursor:pointer">Substitutes</button>
        </div>
        <div id="medTabContent" style="flex:1;overflow-y:auto;padding:24px"></div>
        <div style="padding:16px 24px;border-top:1px solid var(--color-border);background:var(--color-background);flex-shrink:0;display:flex;justify-content:flex-end">
            <button id="btnEditMedicine" style="display:flex;align-items:center;gap:6px;background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:8px;font-size:13px;font-weight:600;padding:10px 20px;cursor:pointer">
                <i data-lucide="pencil" style="width:15px;height:15px"></i> Edit Medicine
            </button>
        </div>
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
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Medicine</label>
                    <div id="adjMedicineName" style="font-size:14px;font-weight:600;color:var(--color-foreground)"></div>
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
                            <input type="radio" name="adjType" value="set"> <i data-lucide="refresh-cw" style="width:16px;height:16px;color:#3b82f6"></i> Set Exact
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
                        <option value="Damaged Goods">Damaged Goods</option>
                        <option value="Lost/Stolen">Lost/Stolen</option>
                        <option value="Expired (not recorded)">Expired (not recorded)</option>
                        <option value="Transfer to Another Location">Transfer to Another Location</option>
                        <option value="System Error Correction">System Error Correction</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div id="adjOtherReasonWrap" style="margin-bottom:16px;display:none">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Specify Reason</label>
                    <input type="text" id="adjOtherReason" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none" placeholder="Enter reason">
                </div>
                <div style="margin-bottom:16px">
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Notes</label>
                    <textarea id="adjNotes" rows="2" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;resize:vertical" placeholder="Optional notes..."></textarea>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--color-muted-foreground)">
                    <span>Adjusted By: <strong>Admin</strong></span>
                    <span id="adjDateTime"></span>
                </div>
            </div>
            <div class="modal-footer" style="padding:16px 24px;border-top:1px solid var(--color-border)">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" style="border-radius:8px;font-size:13px;padding:8px 20px">Cancel</button>
                <button type="button" id="btnConfirmAdjust" style="background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:8px;font-size:13px;font-weight:600;padding:8px 24px;cursor:pointer">Confirm Adjustment</button>
            </div>
        </div>
    </div>
</div>
<div class="offcanvas offcanvas-end" tabindex="-1" id="addMedicineSheet" style="width:700px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 class="offcanvas-title">Add New Medicine</h5>
            <p style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0">Fill in the medicine master details</p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <form id="addMedicineForm" autocomplete="off">
            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="info" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Basic Info
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Medicine Name *</label>
                        <input type="text" name="medicine_name" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. Paracetamol 500mg Tab">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Medicine Code</label>
                        <input type="text" name="medicine_code" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="Auto-generated if left blank">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Generic Name *</label>
                        <input type="text" name="generic_name" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. Paracetamol">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Brand Name *</label>
                        <input type="text" name="brand_name" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. Panadol">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Form *</label>
                        <select name="form" id="addMedForm" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select type...</option>
                        </select>
                    </div>
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Category / Therapeutic Class *</label>
                        <select name="category" id="addMedCategory" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select category...</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="flask-conical" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Composition & Dosage
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Salt / Composition</label>
                        <input type="text" name="salt_composition" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. Paracetamol IP 500mg">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Strength / Dosage</label>
                        <input type="text" name="strength" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. 500mg">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Unit of Measurement</label>
                        <select name="unit_of_measurement" id="addMedUom" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="package" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Stock & Inventory
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">HSN Code</label>
                        <input type="text" name="hsn_code" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. 3004">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Unit of Purchase</label>
                        <select name="unit_of_purchase" id="addMedUnitPurchase" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Unit of Sale</label>
                        <select name="unit_of_sale" id="addMedUnitSale" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Reorder Level</label>
                        <input type="number" name="reorder_level" min="0" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. 50">
                    </div>
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Shelf Location</label>
                        <input type="text" name="shelf_location" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. Shelf A3, Bin 12-15">
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="shield-check" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Regulatory
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Manufacturer Name</label>
                        <input type="text" name="manufacturer" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="e.g. GSK, Abbott, Pfizer">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Schedule Type</label>
                        <select name="schedule_type" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                            <option value="OTC">OTC (Over the Counter)</option>
                            <option value="Schedule H">Schedule H</option>
                            <option value="Schedule H1">Schedule H1</option>
                            <option value="Schedule X">Schedule X</option>
                            <option value="Schedule G">Schedule G</option>
                            <option value="Narcotic">Narcotic</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Requires Prescription</label>
                        <select name="requires_prescription" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="banknote" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Pricing
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Purchase Price (MRP) *</label>
                        <input type="number" name="purchase_price" required min="0" step="0.01" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="0.00">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Sale Price *</label>
                        <input type="number" name="selling_price" required min="0" step="0.01" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="0.00">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Tax / GST Category</label>
                        <select name="tax_gst_category" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                            <option value="GST 0%">GST 0%</option>
                            <option value="GST 5%">GST 5%</option>
                            <option value="GST 12%">GST 12%</option>
                            <option value="GST 18%">GST 18%</option>
                            <option value="GST 28%">GST 28%</option>
                            <option value="Exempt">Exempt</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="toggle-right" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Status
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Status</label>
                    <select name="is_active" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>
            </div>

            <div id="addMedError" style="display:none;padding:12px 16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:16px;color:#991B1B;font-size:13px"></div>
            <div id="addMedSuccess" style="display:none;padding:12px 16px;background:#DCFCE7;border:1px solid #BBF7D0;border-radius:8px;margin-bottom:16px;color:#166534;font-size:13px"></div>

            <div style="display:flex;justify-content:flex-end;gap:10px;padding-top:8px;border-top:1px solid var(--color-border)">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas" style="border-radius:8px;font-size:13px;padding:10px 24px">Cancel</button>
                <button type="submit" id="btnSaveMedicine" style="background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:8px;font-size:13px;font-weight:600;padding:10px 28px;cursor:pointer;display:flex;align-items:center;gap:6px">
                    <i data-lucide="save" style="width:16px;height:16px"></i> Save Medicine
                </button>
            </div>
        </form>
    </div>
</div>
{{-- ── Edit Medicine Offcanvas ──────────────────────────────────────────────── --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="editMedicineSheet" style="width:700px;border-left:1px solid var(--color-border)">
    <div class="offcanvas-header" style="padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--color-background)">
        <div>
            <h5 class="offcanvas-title">Edit Medicine</h5>
            <p id="editMedSubtitle" style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0"></p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
        <form id="editMedicineForm" autocomplete="off">
            <input type="hidden" id="editMedId">

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="info" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Basic Info
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Brand Name *</label>
                        <input type="text" id="editMedBrand" name="brand_name" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Generic Name *</label>
                        <input type="text" id="editMedGeneric" name="generic_name" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Form *</label>
                        <select id="editMedForm" name="form" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select type...</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Medicine Code</label>
                        <input type="text" id="editMedCode" disabled style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:var(--color-background);color:var(--color-muted-foreground)">
                    </div>
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Category / Therapeutic Class *</label>
                        <select id="editMedCategory" name="category" required style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select category...</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="flask-conical" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Composition & Dosage
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Salt / Composition</label>
                        <input type="text" id="editMedSalt" name="salt_composition" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Strength / Dosage</label>
                        <input type="text" id="editMedStrength" name="strength" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Unit of Measurement</label>
                        <select id="editMedUom" name="unit_of_measurement" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="package" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Stock & Inventory
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">HSN Code</label>
                        <input type="text" id="editMedHsn" name="hsn_code" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Unit of Purchase</label>
                        <select id="editMedUnitPurchase" name="unit_of_purchase" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Unit of Sale</label>
                        <select id="editMedUnitSale" name="unit_of_sale" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Min Stock Level</label>
                        <input type="number" id="editMedMinStock" name="min_stock" min="0" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Max Stock Level</label>
                        <input type="number" id="editMedMaxStock" name="max_stock" min="0" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff">
                    </div>
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Shelf Location</label>
                        <input type="text" id="editMedShelf" name="shelf_location" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff">
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="shield-check" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Regulatory
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    <div style="grid-column:span 2">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Manufacturer Name</label>
                        <input type="text" id="editMedManufacturer" name="manufacturer" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Schedule Type</label>
                        <select id="editMedSchedule" name="schedule_type" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                            <option value="OTC">OTC (Over the Counter)</option>
                            <option value="Schedule H">Schedule H</option>
                            <option value="Schedule H1">Schedule H1</option>
                            <option value="Schedule X">Schedule X</option>
                            <option value="Schedule G">Schedule G</option>
                            <option value="Narcotic">Narcotic</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Requires Prescription</label>
                        <select id="editMedRx" name="requires_prescription" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="banknote" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Pricing
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Purchase Price *</label>
                        <input type="number" id="editMedPurchasePrice" name="purchase_price" required min="0" step="0.01" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="0.00">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Sale Price *</label>
                        <input type="number" id="editMedSalePrice" name="selling_price" required min="0" step="0.01" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;outline:none;background:#fff" placeholder="0.00">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Tax / GST Category</label>
                        <select id="editMedTax" name="tax_gst_category" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                            <option value="">Select...</option>
                            <option value="GST 0%">GST 0%</option>
                            <option value="GST 5%">GST 5%</option>
                            <option value="GST 12%">GST 12%</option>
                            <option value="GST 18%">GST 18%</option>
                            <option value="GST 28%">GST 28%</option>
                            <option value="Exempt">Exempt</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:24px">
                <div style="font-size:13px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--aquamint);display:inline-block;font-family:'Roobert',sans-serif">
                    <i data-lucide="toggle-right" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Status
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Status</label>
                    <select id="editMedStatus" name="is_active" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>
            </div>

            <div id="editMedError" style="display:none;padding:12px 16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:16px;color:#991B1B;font-size:13px"></div>
            <div id="editMedSuccess" style="display:none;padding:12px 16px;background:#DCFCE7;border:1px solid #BBF7D0;border-radius:8px;margin-bottom:16px;color:#166534;font-size:13px"></div>

            <div style="display:flex;justify-content:flex-end;gap:10px;padding-top:8px;border-top:1px solid var(--color-border)">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas" style="border-radius:8px;font-size:13px;padding:10px 24px">Cancel</button>
                <button type="submit" id="btnUpdateMedicine" style="background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:8px;font-size:13px;font-weight:600;padding:10px 28px;cursor:pointer;display:flex;align-items:center;gap:6px">
                    <i data-lucide="save" style="width:16px;height:16px"></i> Save Changes
                </button>
            </div>
        </form>
    </div>
</div>

@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="{{ asset('js/pharmacy-inventory.js') }}?v={{ filemtime(public_path('js/pharmacy-inventory.js')) }}"></script>
@endpush
