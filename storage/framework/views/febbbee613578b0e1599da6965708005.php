<?php $__env->startSection('content'); ?>
<div class="module-page">

    <nav class="module-tabs">
        <button class="module-tab active" data-tab="floorplan">
            <i data-lucide="layout-dashboard"></i>
            <span class="hide-mobile">Floor Plan</span>
        </button>
        <button class="module-tab" data-tab="floors">
            <i data-lucide="building"></i>
            <span class="hide-mobile">Floors</span>
        </button>
        <button class="module-tab" data-tab="wards">
            <i data-lucide="grid-3x3"></i>
            <span class="hide-mobile">Wards / Rooms</span>
        </button>
        <button class="module-tab" data-tab="beds">
            <i data-lucide="bed"></i>
            <span class="hide-mobile">Beds</span>
        </button>
    </nav>

    
    <div class="tab-content" id="tab-floorplan">
        <div class="module-header">
            <div>
                <h1>Floor Plan</h1>
                <p class="module-subtitle">Visual overview of all floors, wards, and bed statuses</p>
            </div>
        </div>

        <div class="mini-stats" id="bedStats">
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Total Beds</p>
                        <h3 class="mini-stat-value" id="statTotal">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(79,70,229,0.1)"><i data-lucide="bed" style="color:#4f46e5"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Available</p>
                        <h3 class="mini-stat-value" style="color:#16a34a" id="statAvailable">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(22,163,74,0.1)"><i data-lucide="check-circle" style="color:#16a34a"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Occupied</p>
                        <h3 class="mini-stat-value" style="color:#dc2626" id="statOccupied">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(220,38,38,0.1)"><i data-lucide="user-check" style="color:#dc2626"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Cleaning</p>
                        <h3 class="mini-stat-value" style="color:#ca8a04" id="statCleaning">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(202,138,4,0.1)"><i data-lucide="sparkles" style="color:#ca8a04"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Out of Order</p>
                        <h3 class="mini-stat-value" style="color:#64748b" id="statOutOfOrder">0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(100,116,139,0.1)"><i data-lucide="wrench" style="color:#64748b"></i></div>
                </div>
            </div>
            <div class="mini-stat-card">
                <div class="mini-stat-inner">
                    <div>
                        <p class="mini-stat-label">Floors / Wards</p>
                        <h3 class="mini-stat-value" id="statFloors">0 / 0</h3>
                    </div>
                    <div class="mini-stat-icon" style="background:rgba(190,24,93,0.1)"><i data-lucide="layers" style="color:#be185d"></i></div>
                </div>
            </div>
        </div>

        <div class="search-filter-bar" style="margin-bottom:16px">
            <div class="filter-group">
                <select class="form-select" id="floorPlanFilter" style="height:40px;font-size:14px;min-width:180px">
                    <option value="">All Floors</option>
                </select>
            </div>
        </div>

        <div id="floorPlanContainer">
            <div style="text-align:center;padding:48px 0;color:var(--color-muted-foreground)">
                <i data-lucide="loader" style="width:28px;height:28px"></i>
                <p style="margin-top:10px;font-size:13px">Loading floor plan...</p>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-floors" style="display:none">
        <div class="module-header">
            <div>
                <h1>Floors</h1>
                <p class="module-subtitle">Define and manage the floors in your facility</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnAddFloor" data-require-permission="bed-management.create"><i data-lucide="plus"></i> Add Floor</button>
            </div>
        </div>

        <div class="search-filter-bar">
            <div class="search-wrapper">
                <i data-lucide="search"></i>
                <input type="text" class="search-input" id="floorSearch" placeholder="Search floors...">
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="floorsTable">
                    <thead>
                        <tr>
                            <th>Floor ID</th>
                            <th>Name</th>
                            <th>Code</th>
                            <th class="text-center">Wards</th>
                            <th class="text-center">Beds</th>
                            <th class="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="floorsTableBody">
                        <tr><td colspan="6" class="text-center" style="padding:32px;color:var(--color-muted-foreground)">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-wards" style="display:none">
        <div class="module-header">
            <div>
                <h1>Wards / Rooms</h1>
                <p class="module-subtitle">Manage wards and rooms linked to floors</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnAddWard" data-require-permission="bed-management.create"><i data-lucide="plus"></i> Add Ward</button>
            </div>
        </div>

        <div class="search-filter-bar">
            <div class="search-wrapper">
                <i data-lucide="search"></i>
                <input type="text" class="search-input" id="wardSearch" placeholder="Search wards...">
            </div>
            <div class="filter-group">
                <select class="form-select" id="wardFloorFilter" style="height:40px;font-size:14px;min-width:160px">
                    <option value="">All Floors</option>
                </select>
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="wardsTable">
                    <thead>
                        <tr>
                            <th>Ward ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Floor</th>
                            <th class="text-center">Beds</th>
                            <th class="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="wardsTableBody">
                        <tr><td colspan="6" class="text-center" style="padding:32px;color:var(--color-muted-foreground)">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-beds" style="display:none">
        <div class="module-header">
            <div>
                <h1>Beds</h1>
                <p class="module-subtitle">Manage individual beds, types, and statuses</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnAddBed" data-require-permission="bed-management.create"><i data-lucide="plus"></i> Add Bed</button>
            </div>
        </div>

        <div class="search-filter-bar">
            <div class="search-wrapper">
                <i data-lucide="search"></i>
                <input type="text" class="search-input" id="bedSearch" placeholder="Search by bed number, type, patient...">
            </div>
            <div class="filter-group">
                <select class="form-select" id="bedFloorFilter" style="height:40px;font-size:14px;min-width:140px">
                    <option value="">All Floors</option>
                </select>
                <select class="form-select" id="bedWardFilter" style="height:40px;font-size:14px;min-width:140px">
                    <option value="">All Wards</option>
                </select>
                <select class="form-select" id="bedStatusFilter" style="height:40px;font-size:14px;min-width:150px">
                    <option value="">All Statuses</option>
                    <option>Available</option>
                    <option>Occupied</option>
                    <option>Cleaning</option>
                    <option>Out of Order</option>
                </select>
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="bedsTable">
                    <thead>
                        <tr>
                            <th>Bed ID</th>
                            <th>Bed No.</th>
                            <th>Type</th>
                            <th>Ward</th>
                            <th>Floor</th>
                            <th class="text-center">Status</th>
                            <th>Patient</th>
                            <th class="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="bedsTableBody">
                        <tr><td colspan="8" class="text-center" style="padding:32px;color:var(--color-muted-foreground)">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="floorOffcanvas">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="floorOffcanvasTitle"><i data-lucide="building"></i> Add Floor</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <form id="floorForm">
            <input type="hidden" id="floorId">
            <div class="mb-3">
                <label class="form-label fw-semibold" style="font-size:13px">Floor Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="floorName" placeholder="e.g. Ground Floor, First Floor">
            </div>
            <div class="mb-4">
                <label class="form-label fw-semibold" style="font-size:13px">Short Code</label>
                <input type="text" class="form-control" id="floorCode" placeholder="e.g. GF, F1, B1">
                <div class="form-text">Optional short code used in labels</div>
            </div>
            <div class="d-flex gap-2">
                <button type="submit" class="btn-primary flex-fill" id="floorSubmitBtn">Save Floor</button>
                <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
            </div>
        </form>
    </div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="wardOffcanvas">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="wardOffcanvasTitle"><i data-lucide="grid-3x3"></i> Add Ward</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <form id="wardForm">
            <input type="hidden" id="wardId">
            <div class="mb-3">
                <label class="form-label fw-semibold" style="font-size:13px">Floor <span class="text-danger">*</span></label>
                <select class="form-select" id="wardFloorId">
                    <option value="">Select Floor...</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold" style="font-size:13px">Ward / Room Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="wardName" placeholder="e.g. General Ward, ICU, Maternity">
            </div>
            <div class="mb-4">
                <label class="form-label fw-semibold" style="font-size:13px">Category <span class="text-danger">*</span></label>
                <select class="form-select" id="wardCategory">
                    <option>General</option><option>ICU</option><option>NICU</option><option>PICU</option>
                    <option>Maternity</option><option>Pediatrics</option><option>Surgical</option>
                    <option>Orthopedic</option><option>Cardiac</option><option>Oncology</option>
                    <option>Neurology</option><option>Isolation</option><option>Burns</option>
                    <option>Private</option><option>Semi-Private</option><option>Other</option>
                </select>
            </div>
            <div class="d-flex gap-2">
                <button type="submit" class="btn-primary flex-fill" id="wardSubmitBtn">Save Ward</button>
                <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
            </div>
        </form>
    </div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="bedOffcanvas">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="bedOffcanvasTitle"><i data-lucide="bed"></i> Add Bed</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <form id="bedForm">
            <input type="hidden" id="bedEditId">
            <div class="mb-3">
                <label class="form-label fw-semibold" style="font-size:13px">Ward / Room <span class="text-danger">*</span></label>
                <select class="form-select" id="bedWardId">
                    <option value="">Select Ward...</option>
                </select>
            </div>
            <div class="row g-3 mb-4">
                <div class="col-7">
                    <label class="form-label fw-semibold" style="font-size:13px">Bed Number <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="bedNumber" placeholder="e.g. 101, A-01">
                </div>
                <div class="col-5">
                    <label class="form-label fw-semibold" style="font-size:13px">Type <span class="text-danger">*</span></label>
                    <select class="form-select" id="bedType">
                        <option>Standard</option><option>ICU</option><option>Electric</option>
                        <option>Pediatric</option><option>Bariatric</option><option>Recliner</option>
                    </select>
                </div>
            </div>
            <div class="d-flex gap-2">
                <button type="submit" class="btn-primary flex-fill" id="bedSubmitBtn">Save Bed</button>
                <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
            </div>
        </form>
    </div>
</div>


<div class="modal fade" id="statusModal" tabindex="-1">
    <div class="modal-dialog modal-sm">
        <div class="modal-content" style="border:none;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.15)">
            <div class="modal-header" style="border-bottom:1px solid var(--color-border);padding:16px 20px">
                <h6 class="modal-title" style="font-size:15px;font-weight:700;color:var(--color-foreground)">Change Bed Status</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:20px">
                <input type="hidden" id="statusBedId">
                <p id="statusBedLabel" style="font-size:13px;color:var(--color-muted-foreground);margin-bottom:16px"></p>
                <div class="mb-3">
                    <label class="form-label fw-semibold" style="font-size:12px">New Status</label>
                    <select class="form-select" id="newStatus">
                        <option>Available</option>
                        <option>Occupied</option>
                        <option>Cleaning</option>
                        <option>Out of Order</option>
                    </select>
                </div>
                <div id="patientFields" style="display:none">
                    <div class="mb-2">
                        <label class="form-label fw-semibold" style="font-size:12px">Patient Name</label>
                        <input type="text" class="form-control form-control-sm" id="statusPatientName" placeholder="Full name">
                    </div>
                    <div class="mb-2">
                        <label class="form-label fw-semibold" style="font-size:12px">Patient MRN</label>
                        <input type="text" class="form-control form-control-sm" id="statusPatientMrn" placeholder="MRN number">
                    </div>
                    <div class="mb-2">
                        <label class="form-label fw-semibold" style="font-size:12px">Admission Date</label>
                        <input type="date" class="form-control form-control-sm" id="statusAdmissionDate">
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="border-top:1px solid var(--color-border);padding:12px 20px;gap:8px">
                <button type="button" class="btn-outline" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn-primary" id="btnSaveStatus">Save Status</button>
            </div>
        </div>
    </div>
</div>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('styles'); ?>
<style>
/* ---- BED STATUS CHIPS ---- */
.bed-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
}
.bed-status-badge.available    { background: #dcfce7; color: #166534; }
.bed-status-badge.occupied     { background: #fee2e2; color: #991b1b; }
.bed-status-badge.cleaning     { background: #fef9c3; color: #854d0e; }
.bed-status-badge.out-of-order { background: #f1f5f9; color: #475569; }
.bed-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.bed-status-dot.available    { background: #16a34a; }
.bed-status-dot.occupied     { background: #dc2626; }
.bed-status-dot.cleaning     { background: #ca8a04; }
.bed-status-dot.out-of-order { background: #94a3b8; }

/* ---- FLOOR PLAN ---- */
.floor-section { margin-bottom: 32px; }
.floor-section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--color-border);
}
.floor-section-header h2 {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-foreground);
    margin: 0;
}
.floor-section-header .floor-code-badge {
    font-size: 11px;
    font-weight: 600;
    background: var(--color-muted);
    color: var(--color-muted-foreground);
    padding: 2px 8px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
}
.floor-section-header .floor-summary {
    margin-left: auto;
    font-size: 12px;
    color: var(--color-muted-foreground);
}

.ward-block {
    border: 1px solid var(--color-border);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 14px;
    background: var(--color-card);
}
.ward-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: var(--color-muted);
    border-bottom: 1px solid var(--color-border);
}
.ward-block-header h6 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-foreground);
    display: flex;
    align-items: center;
    gap: 8px;
}
.ward-category-chip {
    font-size: 11px;
    font-weight: 500;
    color: var(--midnight-blue);
    background: rgba(0,51,102,0.08);
    padding: 1px 8px;
    border-radius: 10px;
}
.ward-block-meta {
    font-size: 12px;
    color: var(--color-muted-foreground);
    display: flex;
    align-items: center;
    gap: 6px;
}
.ward-block-body { padding: 14px; }

.bed-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
}
.bed-card {
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: transform .15s, box-shadow .15s;
    border: 1.5px solid transparent;
}
.bed-card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,.1); }
.bed-card.available    { background: #f0fdf4; border-color: #86efac; }
.bed-card.occupied     { background: #fff1f2; border-color: #fca5a5; }
.bed-card.cleaning     { background: #fefce8; border-color: #fde047; }
.bed-card.out-of-order { background: #f8fafc; border-color: #cbd5e1; }
.bed-card-num  { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
.bed-card-type { font-size: 10px; color: var(--color-muted-foreground); margin-bottom: 5px; }
.bed-card-info { font-size: 10px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bed-card.available    .bed-card-num { color: #15803d; }
.bed-card.occupied     .bed-card-num { color: #b91c1c; }
.bed-card.cleaning     .bed-card-num { color: #a16207; }
.bed-card.out-of-order .bed-card-num { color: #64748b; }

.floor-plan-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    padding: 10px 14px;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    margin-bottom: 20px;
}
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--color-foreground); }
.legend-swatch {
    width: 14px;
    height: 14px;
    border-radius: 3px;
}
.legend-swatch.available    { background: #86efac; border: 1.5px solid #16a34a; }
.legend-swatch.occupied     { background: #fca5a5; border: 1.5px solid #dc2626; }
.legend-swatch.cleaning     { background: #fde047; border: 1.5px solid #ca8a04; }
.legend-swatch.out-of-order { background: #cbd5e1; border: 1.5px solid #94a3b8; }

.empty-ward-msg {
    color: var(--color-muted-foreground);
    font-size: 12px;
    font-style: italic;
    padding: 6px 0;
}
</style>
<?php $__env->stopPush(); ?>

<?php $__env->startPush('scripts'); ?>
<script src="<?php echo e(asset('js/bed-management.js')); ?>?v=<?php echo e(filemtime(public_path('js/bed-management.js'))); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\healthops\resources\views/pages/bed-management.blade.php ENDPATH**/ ?>