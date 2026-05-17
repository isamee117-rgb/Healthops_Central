<?php $__env->startSection('content'); ?>

<div class="page-header mb-4">
    <div class="d-flex align-items-center gap-3">
        <div class="page-icon">
            <i data-lucide="alert-triangle"></i>
        </div>
        <div>
            <h1>Stock Alerts & Procurement</h1>
            <p class="page-subtitle">Monitor stock levels, manage alerts, create purchase orders</p>
        </div>
    </div>
    <div class="d-flex gap-2">
        <button id="btnViewAlerts" class="btn-outline">
            <i data-lucide="bell"></i> Stock Alerts
        </button>
        <button id="btnCreatePO" class="btn-primary">
            <i data-lucide="plus"></i> Create PO
        </button>
    </div>
</div>


<div id="dashStatCards" class="stat-cards-5">
    <div class="stat-card-sm">
        <div class="stat-card-header">
            <span class="stat-card-label">Total POs</span>
            <div class="stat-card-icon sci-blue"><i data-lucide="file-text"></i></div>
        </div>
        <div id="dashTotalPOs" class="stat-card-num scn-blue">--</div>
    </div>
    <div class="stat-card-sm">
        <div class="stat-card-header">
            <span class="stat-card-label">Draft</span>
            <div class="stat-card-icon sci-slate"><i data-lucide="file-edit"></i></div>
        </div>
        <div id="dashDraftPOs" class="stat-card-num scn-slate">--</div>
    </div>
    <div class="stat-card-sm">
        <div class="stat-card-header">
            <span class="stat-card-label">Sent</span>
            <div class="stat-card-icon sci-blue"><i data-lucide="send"></i></div>
        </div>
        <div id="dashSentPOs" class="stat-card-num scn-blue">--</div>
    </div>
    <div class="stat-card-sm">
        <div class="stat-card-header">
            <span class="stat-card-label">Partial</span>
            <div class="stat-card-icon sci-orange"><i data-lucide="package"></i></div>
        </div>
        <div id="dashPartialPOs" class="stat-card-num scn-orange">--</div>
    </div>
    <div class="stat-card-sm">
        <div class="stat-card-header">
            <span class="stat-card-label">Completed</span>
            <div class="stat-card-icon sci-green"><i data-lucide="check-circle"></i></div>
        </div>
        <div id="dashCompletedPOs" class="stat-card-num scn-green">--</div>
    </div>
</div>


<div class="card-panel">
    <div class="card-panel-header">
        <span class="card-panel-title">Purchase Orders</span>
        <div class="filter-tabs">
            <button class="filter-tab-btn po-main-filter-btn active" data-status="">All</button>
            <button class="filter-tab-btn po-main-filter-btn" data-status="Draft">Draft</button>
            <button class="filter-tab-btn po-main-filter-btn" data-status="Sent">Sent</button>
            <button class="filter-tab-btn po-main-filter-btn" data-status="Partial">Partial</button>
            <button class="filter-tab-btn po-main-filter-btn" data-status="Completed">Completed</button>
        </div>
    </div>
    <div class="card-panel-body">
        <table class="data-table" id="tblMainPO">
            <thead>
                <tr>
                    <th>PO Number</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th>Expected Delivery</th>
                    <th class="text-center">Items</th>
                    <th class="text-right">Total</th>
                    <th class="text-center">Status</th>
                    <th class="text-center">Action</th>
                </tr>
            </thead>
            <tbody id="tbodyMainPO"></tbody>
        </table>
    </div>
    <div id="poMainEmpty" class="panel-notice is-hidden">
        <i data-lucide="inbox"></i>
        No purchase orders found. Click "+ Create PO" to create one.
    </div>
    <div id="poMainLoading" class="panel-notice">Loading...</div>
</div>


<div class="offcanvas offcanvas-end offcanvas-800" tabindex="-1" id="alertsSheet">
    <div class="offcanvas-header">
        <div class="d-flex align-items-center gap-3">
            <div class="page-icon-md"><i data-lucide="bell"></i></div>
            <div>
                <h5 class="offcanvas-title">Stock Alerts</h5>
                <p class="offcanvas-subtitle">Monitor stock levels and expiry alerts</p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <div class="mini-stat-grid">
            <div class="mini-stat-card">
                <div class="mini-stat-label">Out of Stock</div>
                <div id="dashOutOfStock" class="mini-stat-value msv-red">--</div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-label">Low Stock</div>
                <div id="dashLowStock" class="mini-stat-value msv-orange">--</div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-label">Expiring Soon</div>
                <div id="dashExpiring" class="mini-stat-value msv-yellow">--</div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-label">Expired</div>
                <div id="dashExpired" class="mini-stat-value msv-red">--</div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-label">Reorder Needed</div>
                <div id="dashReorder" class="mini-stat-value msv-blue">--</div>
            </div>
        </div>

        <div id="alertSections">
            
            <div id="sectionOutOfStock" class="alert-section">
                <div class="alert-section-header ash-danger" data-section="outOfStock">
                    <div class="d-flex align-items-center gap-2">
                        <div class="section-icon si-red"><i data-lucide="package-x"></i></div>
                        <span class="fw-bold asc-danger">Out of Stock</span>
                        <span id="badgeOutOfStock" class="badge badge-destructive">0</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span id="lostRevenue" class="section-hint asc-danger"></span>
                        <i data-lucide="chevron-down" class="section-chevron asc-danger"></i>
                    </div>
                </div>
                <div class="alert-section-body">
                    <table class="data-table" id="tblOutOfStock">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Last Stockout</th>
                                <th class="text-center">Pending Orders</th>
                                <th>Avg Daily Usage</th>
                                <th class="text-center">Priority</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyOutOfStock"></tbody>
                    </table>
                    <div id="footerOutOfStock" class="alert-section-footer"></div>
                </div>
            </div>

            
            <div id="sectionLowStock" class="alert-section">
                <div class="alert-section-header ash-warning" data-section="lowStock">
                    <div class="d-flex align-items-center gap-2">
                        <div class="section-icon si-orange"><i data-lucide="alert-triangle"></i></div>
                        <span class="fw-bold asc-warning">Low Stock</span>
                        <span id="badgeLowStock" class="badge badge-orange">0</span>
                    </div>
                    <i data-lucide="chevron-down" class="section-chevron asc-warning"></i>
                </div>
                <div class="alert-section-body">
                    <table class="data-table" id="tblLowStock">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th class="text-right">Current</th>
                                <th class="text-right">Min Level</th>
                                <th class="text-center">Days Until Out</th>
                                <th>Reorder Qty</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyLowStock"></tbody>
                    </table>
                    <div id="footerLowStock" class="alert-section-footer"></div>
                </div>
            </div>

            
            <div id="sectionExpiring" class="alert-section">
                <div class="alert-section-header ash-yellow" data-section="expiring">
                    <div class="d-flex align-items-center gap-2">
                        <div class="section-icon si-yellow"><i data-lucide="clock"></i></div>
                        <span class="fw-bold asc-yellow">Expiring Soon (&lt;3 months)</span>
                        <span id="badgeExpiring" class="badge badge-warning">0</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span id="expiringLoss" class="section-hint asc-yellow"></span>
                        <i data-lucide="chevron-down" class="section-chevron asc-yellow"></i>
                    </div>
                </div>
                <div class="alert-section-body">
                    <table class="data-table" id="tblExpiring">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Batch</th>
                                <th>Expiry Date</th>
                                <th class="text-center">Days Remaining</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Estimated Loss</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyExpiring"></tbody>
                    </table>
                    <div id="footerExpiring" class="alert-section-footer"></div>
                </div>
            </div>

            
            <div id="sectionExpired" class="alert-section">
                <div class="alert-section-header ash-danger" data-section="expired">
                    <div class="d-flex align-items-center gap-2">
                        <div class="section-icon si-red"><i data-lucide="x-circle"></i></div>
                        <span class="fw-bold asc-danger">Expired Stock</span>
                        <span id="badgeExpired" class="badge badge-destructive">0</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span id="expiredLoss" class="section-hint asc-danger"></span>
                        <i data-lucide="chevron-down" class="section-chevron asc-danger"></i>
                    </div>
                </div>
                <div class="alert-section-body">
                    <table class="data-table" id="tblExpired">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Batch</th>
                                <th>Expired Date</th>
                                <th class="text-center">Days Expired</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Loss Value</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyExpired"></tbody>
                    </table>
                    <div id="footerExpired" class="alert-section-footer"></div>
                </div>
            </div>

            
            <div id="sectionReorder" class="alert-section">
                <div class="alert-section-header ash-info" data-section="reorder">
                    <div class="d-flex align-items-center gap-2">
                        <div class="section-icon si-blue"><i data-lucide="refresh-cw"></i></div>
                        <span class="fw-bold asc-info">Reorder Suggestions</span>
                        <span id="badgeReorder" class="badge badge-info">0</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span id="reorderValue" class="section-hint asc-info"></span>
                        <i data-lucide="chevron-down" class="section-chevron asc-info"></i>
                    </div>
                </div>
                <div class="alert-section-body">
                    <div class="alert-section-info ash-info asc-info">
                        <i data-lucide="info" class="icon-inline"></i>
                        Based on: Usage patterns, Stock levels, Lead times, Seasonal trends
                    </div>
                    <table class="data-table" id="tblReorder">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th class="text-right">Current</th>
                                <th>Reorder Point</th>
                                <th>Suggested Qty</th>
                                <th>Preferred Supplier</th>
                                <th class="text-center">Lead Time</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyReorder"></tbody>
                    </table>
                    <div id="footerReorder" class="alert-section-footer"></div>
                </div>
            </div>
        </div>
    </div>
</div>


<div class="offcanvas offcanvas-end offcanvas-720" tabindex="-1" id="poViewSheet">
    <div class="offcanvas-header">
        <div class="d-flex align-items-center gap-3">
            <div class="page-icon-md"><i data-lucide="file-text"></i></div>
            <div>
                <h5 class="offcanvas-title">PURCHASE ORDER</h5>
                <p id="poViewSub" class="offcanvas-subtitle"></p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body offcanvas-body--flush">
        <div id="poViewLoading" class="panel-notice">Loading...</div>
        <div id="poViewContent" class="is-hidden">
            <div class="po-view-section">
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <span id="poViewId" class="po-id-tag"></span>
                        <span id="poViewStatus" class="badge"></span>
                    </div>
                    <span id="poViewOrderType" class="badge badge-outline"></span>
                </div>
                <div class="po-meta-grid">
                    <div class="po-meta-card">
                        <div class="po-meta-label">Supplier Details</div>
                        <div id="poViewSupplierName" class="supplier-name"></div>
                        <div class="supplier-contact">
                            <div id="poViewSupplierPhone"></div>
                            <div id="poViewSupplierEmail"></div>
                        </div>
                    </div>
                    <div class="po-meta-card">
                        <div class="po-meta-label">Order Dates</div>
                        <div class="po-meta-row">
                            <span class="text-muted-sm">PO Date:</span>
                            <span id="poViewDate" class="fw-semibold"></span>
                        </div>
                        <div class="po-meta-row">
                            <span class="text-muted-sm">Expected Delivery:</span>
                            <span id="poViewDelivery" class="fw-semibold"></span>
                        </div>
                        <div class="po-meta-row">
                            <span class="text-muted-sm">Payment:</span>
                            <span id="poViewPayment" class="fw-semibold"></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="po-view-section">
                <div class="card-panel-title mb-3">
                    <i data-lucide="package" class="icon-inline"></i> Order Items
                </div>
                <div class="overflow-auto">
                    <table class="data-table" id="tblPoView">
                        <thead>
                            <tr>
                                <th>Medicine</th>
                                <th class="text-right">Current Stock</th>
                                <th class="text-right">Ordered</th>
                                <th class="text-right">Received</th>
                                <th class="text-right">Unit Price</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyPoView"></tbody>
                    </table>
                </div>
            </div>

            <div class="po-view-section">
                <div class="summary-box">
                    <div class="summary-box-title">Financial Summary</div>
                    <div class="summary-row"><span>Subtotal:</span><span id="poViewSubtotal" class="fw-semibold font-mono"></span></div>
                    <div class="summary-row"><span>Tax:</span><span id="poViewTax" class="fw-semibold font-mono"></span></div>
                    <div class="summary-row"><span>Discount:</span><span id="poViewDiscount" class="fw-semibold font-mono"></span></div>
                    <div class="summary-total">
                        <span>TOTAL:</span>
                        <span id="poViewTotal" class="text-aquamint font-mono"></span>
                    </div>
                    <div class="d-flex justify-content-between mt-2 text-muted-sm">
                        <span>Advance Payment: <strong id="poViewAdvance"></strong></span>
                        <span>Credit Days: <strong id="poViewCreditDays"></strong></span>
                    </div>
                </div>
            </div>

            <div id="poViewNotesSection" class="po-view-section is-hidden">
                <div class="po-meta-grid">
                    <div id="poViewDeliveryInstrWrap" class="is-hidden">
                        <div class="po-meta-label">Delivery Instructions</div>
                        <div id="poViewDeliveryInstr" class="summary-box"></div>
                    </div>
                    <div id="poViewNotesWrap" class="is-hidden">
                        <div class="po-meta-label">Special Notes</div>
                        <div id="poViewNotes" class="summary-box"></div>
                    </div>
                </div>
            </div>

            <div class="po-view-section">
                <div id="poViewActions" class="d-flex justify-content-end gap-2"></div>
            </div>
        </div>
    </div>
</div>


<div class="offcanvas offcanvas-end offcanvas-720" tabindex="-1" id="poFormSheet">
    <div class="offcanvas-header">
        <div class="d-flex align-items-center gap-3">
            <div class="page-icon-md"><i data-lucide="file-plus"></i></div>
            <div>
                <h5 id="poFormTitle" class="offcanvas-title">CREATE PURCHASE ORDER</h5>
                <p id="poFormSub" class="offcanvas-subtitle">Fill in order details below</p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <div class="row g-3 mb-4">
            <div class="col-6">
                <label class="field-label">PO Number</label>
                <input type="text" id="poNumber" readonly class="field-input field-input--bg">
            </div>
            <div class="col-6">
                <label class="field-label">Supplier *</label>
                <select id="poSupplier" class="field-input">
                    <option value="">Select Supplier...</option>
                </select>
            </div>
        </div>

        <div id="supplierInfo" class="supplier-info-box is-hidden">
            <div><span class="info-label">Contact:</span> <span id="supContact" class="info-val"></span></div>
            <div><span class="info-label">Phone:</span> <span id="supPhone" class="info-val"></span></div>
            <div><span class="info-label">Email:</span> <span id="supEmail" class="info-val"></span></div>
            <div><span class="info-label">Lead Time:</span> <span id="supLeadTime" class="info-val"></span></div>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-6">
                <label class="field-label">PO Date</label>
                <input type="date" id="poDate" class="field-input">
            </div>
            <div class="col-6">
                <label class="field-label">Expected Delivery</label>
                <input type="date" id="poExpectedDelivery" class="field-input">
            </div>
        </div>

        <div class="mb-4">
            <label class="field-label mb-2">Order Type</label>
            <div class="d-flex gap-2 flex-wrap">
                <label class="order-type-label"><input type="radio" name="poOrderType" value="Regular Stock Replenishment" checked> Regular</label>
                <label class="order-type-label"><input type="radio" name="poOrderType" value="Emergency Order"> Emergency</label>
                <label class="order-type-label"><input type="radio" name="poOrderType" value="Consignment"> Consignment</label>
                <label class="order-type-label"><input type="radio" name="poOrderType" value="Direct Patient Order"> Direct Patient</label>
            </div>
        </div>

        <div class="mb-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <label class="field-label mb-0">Medicines to Order</label>
                <button id="btnAddMedicine" class="btn-primary btn-sm">
                    <i data-lucide="plus"></i> Add Medicine
                </button>
            </div>
            <div id="poMedicinesContainer">
                <table class="data-table" id="tblPoItems">
                    <thead>
                        <tr>
                            <th>Medicine Name</th>
                            <th class="text-right">Current</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Unit Price</th>
                            <th class="text-right">Total</th>
                            <th class="text-center"></th>
                        </tr>
                    </thead>
                    <tbody id="tbodyPoItems"></tbody>
                </table>
            </div>
            <div id="poItemEmpty" class="panel-notice panel-notice-dashed is-hidden">
                Click "+ Add Medicine" to add items
            </div>
        </div>

        <div class="summary-box mb-4">
            <div class="summary-box-title">Summary</div>
            <div class="summary-row"><span>Total Items:</span><span id="poTotalItems" class="fw-semibold">0</span></div>
            <div class="summary-row"><span>Total Quantity:</span><span id="poTotalQty" class="fw-semibold">0 items</span></div>
            <div class="summary-row"><span>Subtotal:</span><span id="poSubtotal" class="fw-semibold">PKR 0</span></div>
            <div class="summary-row"><span>Tax:</span><span class="fw-semibold">PKR 0</span></div>
            <div class="summary-row"><span>Discount:</span><span class="fw-semibold">PKR 0</span></div>
            <div class="summary-total"><span>TOTAL:</span><span id="poTotal" class="text-aquamint">PKR 0</span></div>
        </div>

        <div class="row g-3 mb-3">
            <div class="col-4">
                <label class="field-label">Payment Method</label>
                <select id="poPaymentMethod" class="field-input">
                    <option value="Cash">Cash</option>
                    <option value="Credit" selected>Credit</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                </select>
            </div>
            <div class="col-4">
                <label class="field-label">Credit Days</label>
                <input type="number" id="poCreditDays" value="30" class="field-input">
            </div>
            <div class="col-4">
                <label class="field-label">Advance Payment</label>
                <input type="number" id="poAdvance" value="0" class="field-input">
            </div>
        </div>

        <div class="mb-3">
            <label class="field-label">Delivery Instructions</label>
            <textarea id="poDeliveryInstructions" rows="2" class="field-input resize-v" placeholder="Optional..."></textarea>
        </div>
        <div class="mb-4">
            <label class="field-label">Special Notes</label>
            <textarea id="poNotes" rows="2" class="field-input resize-v" placeholder="Optional..."></textarea>
        </div>

        <div class="po-form-footer">
            <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
            <button type="button" id="btnSaveDraft" class="btn-outline">Save Draft</button>
            <button type="button" id="btnSendPO" class="btn-primary">Send to Supplier</button>
        </div>
    </div>
</div>


<div class="offcanvas offcanvas-end offcanvas-720" tabindex="-1" id="grnSheet">
    <div class="offcanvas-header">
        <div class="d-flex align-items-center gap-3">
            <div class="page-icon-md"><i data-lucide="package-check"></i></div>
            <div>
                <h5 class="offcanvas-title">RECEIVE STOCK (GRN)</h5>
                <p id="grnPoRef" class="offcanvas-subtitle"></p>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <div id="grnItemsContainer"></div>
        <div class="summary-box mt-4">
            <div class="summary-box-title">GRN Summary</div>
            <div class="summary-row"><span>Total Items:</span><span id="grnTotalItems" class="fw-semibold">0</span></div>
            <div class="summary-row"><span>Total Received Value:</span><span id="grnTotalValue" class="fw-semibold">PKR 0</span></div>
            <div class="summary-row"><span>Received By:</span><span class="fw-semibold">Admin</span></div>
            <div class="summary-row"><span>Date:</span><span id="grnDate" class="fw-semibold"></span></div>
        </div>
        <div class="po-form-footer mt-4">
            <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
            <button type="button" id="btnCompleteGRN" class="btn-primary">Complete GRN & Update Stock</button>
        </div>
    </div>
</div>


<div class="modal fade" id="addMedicineModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-rounded">
            <div class="offcanvas-header modal-header-padded">
                <h5 class="offcanvas-title">Add Medicine to Order</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="offcanvas-body modal-body-padded">
                <div class="mb-3">
                    <input type="text" id="medSearchInput" placeholder="Search medicine from inventory..." class="field-input">
                </div>
                <div id="medSearchResults" class="search-results-list"></div>
            </div>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
<script src="<?php echo e(asset('js/pharmacy-stock-alerts.js')); ?>?v=<?php echo e(filemtime(public_path('js/pharmacy-stock-alerts.js'))); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\healthops\resources\views/pages/pharmacy/stock-alerts.blade.php ENDPATH**/ ?>