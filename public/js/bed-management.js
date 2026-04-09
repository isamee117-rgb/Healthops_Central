$(function () {
    var floors = [], wards = [], beds = [];

    // ---- Helpers ----
    function esc(v) {
        if (v === null || v === undefined) return '';
        return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function statusKey(s) {
        if (!s) return 'available';
        return s.toLowerCase().replace(/\s+/g, '-');
    }

    function statusBadge(s) {
        var k = statusKey(s);
        return '<span class="bed-status-badge ' + k + '"><span class="bed-status-dot ' + k + '"></span>' + esc(s || 'Available') + '</span>';
    }

    function safeGet(url) {
        return $.ajax({ url: url, type: 'GET', dataType: 'json', error: function () { return []; } });
    }

    function floorName(fid) {
        var f = floors.find(function (x) { return x.floorId === fid; });
        return f ? f.name : (fid || '—');
    }

    function wardName(wid) {
        var w = wards.find(function (x) { return x.wardId === wid; });
        return w ? w.name : (wid || '—');
    }

    function wardBedCount(wid) {
        return beds.filter(function (b) { return b.wardId === wid; }).length;
    }

    function floorBedCount(fid) {
        return beds.filter(function (b) { return b.floorId === fid; }).length;
    }

    function floorWardCount(fid) {
        return wards.filter(function (w) { return w.floorId === fid; }).length;
    }

    // ---- Data Load ----
    function loadAll() {
        var pending = 3;
        function done() { if (--pending === 0) renderAll(); }
        $.get('/api/bed-management/floors')
            .done(function (d) { floors = Array.isArray(d) ? d : []; }).always(done);
        $.get('/api/bed-management/wards')
            .done(function (d) { wards  = Array.isArray(d) ? d : []; }).always(done);
        $.get('/api/bed-management/beds')
            .done(function (d) { beds   = Array.isArray(d) ? d : []; }).always(done);
    }

    function renderAll() {
        updateStats();
        populateFloorDropdowns();
        renderFloorPlan();
        renderFloorsTable();
        renderWardsTable();
        renderBedsTable();
        lucide.createIcons();
    }

    // ---- Stats ----
    function updateStats() {
        var avail = beds.filter(function (b) { return b.status === 'Available'; }).length;
        var occ   = beds.filter(function (b) { return b.status === 'Occupied'; }).length;
        var cln   = beds.filter(function (b) { return b.status === 'Cleaning'; }).length;
        var oor   = beds.filter(function (b) { return b.status === 'Out of Order'; }).length;
        $('#statTotal').text(beds.length);
        $('#statAvailable').text(avail);
        $('#statOccupied').text(occ);
        $('#statCleaning').text(cln);
        $('#statOutOfOrder').text(oor);
        $('#statFloors').text(floors.length + ' / ' + wards.length);
    }

    // ---- Dropdown population ----
    function populateFloorDropdowns() {
        var allOpt = '<option value="">All Floors</option>';
        var selOpt = '<option value="">Select Floor...</option>';
        floors.forEach(function (f) {
            allOpt += '<option value="' + esc(f.floorId) + '">' + esc(f.name) + '</option>';
            selOpt += '<option value="' + esc(f.floorId) + '">' + esc(f.name) + '</option>';
        });
        $('#floorPlanFilter').html(allOpt);
        $('#wardFloorFilter').html(allOpt);
        $('#bedFloorFilter').html(allOpt);
        $('#wardFloorId').html(selOpt);
        $('#bedFloorId').html(selOpt);
        populateWardFilterDropdown('');
    }

    function populateWardFilterDropdown(floorId) {
        var w = floorId ? wards.filter(function (x) { return x.floorId === floorId; }) : wards;
        var html = '<option value="">All Wards</option>';
        w.forEach(function (x) { html += '<option value="' + esc(x.wardId) + '">' + esc(x.name) + '</option>'; });
        $('#bedWardFilter').html(html);
    }

    function populateWardSelectDropdown() {
        var html = '<option value="">Select Ward...</option>';
        wards.forEach(function (x) {
            var floorLabel = floorName(x.floorId);
            html += '<option value="' + esc(x.wardId) + '">' + esc(x.name) + ' (' + esc(floorLabel) + ')</option>';
        });
        $('#bedWardId').html(html);
    }

    // ---- FLOOR PLAN ----
    function renderFloorPlan() {
        var filterFloor = $('#floorPlanFilter').val();
        var showFloors = filterFloor ? floors.filter(function (f) { return f.floorId === filterFloor; }) : floors;

        if (showFloors.length === 0) {
            $('#floorPlanContainer').html(
                '<div class="data-table-wrapper" style="text-align:center;padding:48px">' +
                '<i data-lucide="bed" style="width:36px;height:36px;color:var(--color-border);margin-bottom:12px"></i>' +
                '<p style="color:var(--color-muted-foreground);font-size:14px;margin:0">No floors have been defined yet. Go to the <strong>Floors</strong> tab to add one.</p></div>'
            );
            lucide.createIcons();
            return;
        }

        var html = '<div class="floor-plan-legend">';
        html += '<span class="legend-item"><span class="legend-swatch available"></span>Available</span>';
        html += '<span class="legend-item"><span class="legend-swatch occupied"></span>Occupied</span>';
        html += '<span class="legend-item"><span class="legend-swatch cleaning"></span>Cleaning</span>';
        html += '<span class="legend-item"><span class="legend-swatch out-of-order"></span>Out of Order</span>';
        html += '<span style="margin-left:auto;font-size:12px;color:var(--color-muted-foreground)">Click any bed to change its status</span>';
        html += '</div>';

        showFloors.forEach(function (floor) {
            var floorWards = wards.filter(function (w) { return w.floorId === floor.floorId; });
            var floorBeds  = beds.filter(function (b)  { return b.floorId === floor.floorId; });
            var avail = floorBeds.filter(function (b) { return b.status === 'Available'; }).length;

            html += '<div class="floor-section">';
            html += '<div class="floor-section-header">';
            html += '<i data-lucide="building" style="width:18px;height:18px;color:var(--color-primary)"></i>';
            html += '<h2>' + esc(floor.name) + '</h2>';
            if (floor.code) html += '<span class="floor-code-badge">' + esc(floor.code) + '</span>';
            html += '<span class="floor-summary">' + floorBeds.length + ' beds &bull; ' + avail + ' available &bull; ' + floorWards.length + ' wards</span>';
            html += '</div>';

            if (floorWards.length === 0) {
                html += '<p class="empty-ward-msg">No wards on this floor.</p>';
            } else {
                floorWards.forEach(function (ward) {
                    var wardBeds = beds.filter(function (b) { return b.wardId === ward.wardId; });
                    var wAvail = wardBeds.filter(function (b) { return b.status === 'Available'; }).length;
                    html += '<div class="ward-block">';
                    html += '<div class="ward-block-header">';
                    html += '<h6><i data-lucide="grid-3x3" style="width:14px;height:14px;color:var(--color-muted-foreground)"></i>' + esc(ward.name);
                    html += ' <span class="ward-category-chip">' + esc(ward.category) + '</span></h6>';
                    html += '<span class="ward-block-meta">';
                    html += '<span class="bed-status-dot available" style="width:8px;height:8px"></span>' + wAvail + ' available of ' + wardBeds.length;
                    html += '</span>';
                    html += '</div>';
                    html += '<div class="ward-block-body">';
                    if (wardBeds.length === 0) {
                        html += '<p class="empty-ward-msg">No beds in this ward yet.</p>';
                    } else {
                        html += '<div class="bed-grid">';
                        wardBeds.forEach(function (bed) {
                            var sk = statusKey(bed.status);
                            html += '<div class="bed-card ' + sk + '" data-bed-id="' + esc(bed.bedId) + '">';
                            html += '<div class="bed-card-num">' + esc(bed.bedNumber) + '</div>';
                            html += '<div class="bed-card-type">' + esc(bed.type) + '</div>';
                            if (bed.status === 'Occupied' && bed.assignedPatientName) {
                                html += '<div class="bed-card-info" style="color:#b91c1c">' + esc(bed.assignedPatientName) + '</div>';
                            } else {
                                html += '<div class="bed-card-info" style="opacity:.55">' + esc(bed.status || 'Available') + '</div>';
                            }
                            html += '</div>';
                        });
                        html += '</div>';
                    }
                    html += '</div></div>';
                });
            }
            html += '</div>';
        });

        $('#floorPlanContainer').html(html);
        lucide.createIcons();
    }

    // ---- FLOORS TABLE ----
    function renderFloorsTable() {
        var search = ($('#floorSearch').val() || '').toLowerCase();
        var filtered = floors.filter(function (f) {
            return !search || f.name.toLowerCase().indexOf(search) > -1 ||
                (f.code || '').toLowerCase().indexOf(search) > -1 ||
                f.floorId.toLowerCase().indexOf(search) > -1;
        });

        if (filtered.length === 0) {
            var msg = floors.length === 0 ? 'No floors defined yet. Click <strong>Add Floor</strong> to get started.' : 'No floors match your search.';
            $('#floorsTableBody').html('<tr><td colspan="6"><div class="data-table empty-state"><i data-lucide="building"></i><p>' + msg + '</p></div></td></tr>');
            lucide.createIcons();
            return;
        }

        var html = '';
        filtered.forEach(function (f) {
            html += '<tr>';
            html += '<td class="font-mono">' + esc(f.floorId) + '</td>';
            html += '<td style="font-weight:600">' + esc(f.name) + '</td>';
            html += '<td>' + (f.code ? '<span style="font-size:12px;background:var(--color-muted);padding:2px 8px;border-radius:6px;border:1px solid var(--color-border)">' + esc(f.code) + '</span>' : '<span style="color:var(--color-muted-foreground)">—</span>') + '</td>';
            html += '<td class="text-center"><span style="font-size:12px;font-weight:600;color:var(--midnight-blue)">' + floorWardCount(f.floorId) + '</span></td>';
            html += '<td class="text-center"><span style="font-size:12px;font-weight:600;color:var(--midnight-blue)">' + floorBedCount(f.floorId) + '</span></td>';
            html += '<td class="text-right"><div style="display:flex;gap:6px;justify-content:flex-end">';
            html += '<button class="btn-icon btn-outline btn-edit-floor" data-id="' + esc(f.floorId) + '" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>';
            html += '<button class="btn-icon btn-outline btn-del-floor" data-id="' + esc(f.floorId) + '" data-name="' + esc(f.name) + '" title="Delete" style="color:var(--color-destructive);border-color:var(--color-destructive)"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
            html += '</div></td></tr>';
        });
        $('#floorsTableBody').html(html);
        lucide.createIcons();
    }

    // ---- WARDS TABLE ----
    function renderWardsTable() {
        var search  = ($('#wardSearch').val() || '').toLowerCase();
        var floorF  = $('#wardFloorFilter').val();
        var filtered = wards.filter(function (w) {
            if (floorF && w.floorId !== floorF) return false;
            if (search && w.name.toLowerCase().indexOf(search) < 0 &&
                (w.category || '').toLowerCase().indexOf(search) < 0 &&
                w.wardId.toLowerCase().indexOf(search) < 0) return false;
            return true;
        });

        if (filtered.length === 0) {
            var msg = wards.length === 0 ? 'No wards defined yet. Click <strong>Add Ward</strong> to get started.' : 'No wards match your filters.';
            $('#wardsTableBody').html('<tr><td colspan="6"><div class="data-table empty-state"><i data-lucide="grid-3x3"></i><p>' + msg + '</p></div></td></tr>');
            lucide.createIcons();
            return;
        }

        var html = '';
        filtered.forEach(function (w) {
            html += '<tr>';
            html += '<td class="font-mono">' + esc(w.wardId) + '</td>';
            html += '<td style="font-weight:600">' + esc(w.name) + '</td>';
            html += '<td><span style="font-size:11px;font-weight:600;background:rgba(0,51,102,0.08);color:var(--midnight-blue);padding:3px 10px;border-radius:20px">' + esc(w.category) + '</span></td>';
            html += '<td>' + esc(floorName(w.floorId)) + '</td>';
            html += '<td class="text-center"><span style="font-size:12px;font-weight:600;color:var(--midnight-blue)">' + wardBedCount(w.wardId) + '</span></td>';
            html += '<td class="text-right"><div style="display:flex;gap:6px;justify-content:flex-end">';
            html += '<button class="btn-icon btn-outline btn-edit-ward" data-id="' + esc(w.wardId) + '" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>';
            html += '<button class="btn-icon btn-outline btn-del-ward" data-id="' + esc(w.wardId) + '" data-name="' + esc(w.name) + '" title="Delete" style="color:var(--color-destructive);border-color:var(--color-destructive)"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
            html += '</div></td></tr>';
        });
        $('#wardsTableBody').html(html);
        lucide.createIcons();
    }

    // ---- BEDS TABLE ----
    function renderBedsTable() {
        var search  = ($('#bedSearch').val() || '').toLowerCase();
        var floorF  = $('#bedFloorFilter').val();
        var wardF   = $('#bedWardFilter').val();
        var statusF = $('#bedStatusFilter').val();

        var filtered = beds.filter(function (b) {
            if (floorF  && b.floorId !== floorF)  return false;
            if (wardF   && b.wardId !== wardF)     return false;
            if (statusF && b.status !== statusF)   return false;
            if (search  && b.bedNumber.toLowerCase().indexOf(search) < 0 &&
                (b.type || '').toLowerCase().indexOf(search) < 0 &&
                b.bedId.toLowerCase().indexOf(search) < 0 &&
                (b.assignedPatientName || '').toLowerCase().indexOf(search) < 0) return false;
            return true;
        });

        if (filtered.length === 0) {
            var msg = beds.length === 0 ? 'No beds defined yet. Click <strong>Add Bed</strong> to get started.' : 'No beds match your filters.';
            $('#bedsTableBody').html('<tr><td colspan="8"><div class="data-table empty-state"><i data-lucide="bed"></i><p>' + msg + '</p></div></td></tr>');
            lucide.createIcons();
            return;
        }

        var html = '';
        filtered.forEach(function (b) {
            html += '<tr>';
            html += '<td class="font-mono">' + esc(b.bedId) + '</td>';
            html += '<td style="font-weight:700;font-size:15px">' + esc(b.bedNumber) + '</td>';
            html += '<td style="color:var(--color-muted-foreground)">' + esc(b.type) + '</td>';
            html += '<td>' + esc(wardName(b.wardId)) + '</td>';
            html += '<td>' + esc(floorName(b.floorId)) + '</td>';
            html += '<td class="text-center">' + statusBadge(b.status) + '</td>';
            html += '<td style="font-size:12px">';
            if (b.assignedPatientName) {
                html += '<span style="font-weight:600">' + esc(b.assignedPatientName) + '</span>';
                if (b.assignedPatientMrn) html += ' <span style="color:var(--color-muted-foreground)">(' + esc(b.assignedPatientMrn) + ')</span>';
            } else {
                html += '<span style="color:var(--color-muted-foreground)">—</span>';
            }
            html += '</td>';
            html += '<td class="text-right"><div style="display:flex;gap:6px;justify-content:flex-end">';
            html += '<button class="btn-icon btn-outline btn-change-status" data-id="' + esc(b.bedId) + '" data-num="' + esc(b.bedNumber) + '" title="Change Status"><i data-lucide="refresh-cw" style="width:14px;height:14px"></i></button>';
            html += '<button class="btn-icon btn-outline btn-edit-bed" data-id="' + esc(b.bedId) + '" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>';
            html += '<button class="btn-icon btn-outline btn-del-bed" data-id="' + esc(b.bedId) + '" data-num="' + esc(b.bedNumber) + '" title="Delete" style="color:var(--color-destructive);border-color:var(--color-destructive)"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
            html += '</div></td></tr>';
        });
        $('#bedsTableBody').html(html);
        lucide.createIcons();
    }

    // ---- TABS ----
    $('.module-tab').on('click', function () {
        var tab = $(this).data('tab');
        $('.module-tab').removeClass('active');
        $(this).addClass('active');
        $('.tab-content').hide();
        $('#tab-' + tab).show();
        lucide.createIcons();
    });

    // ---- FILTER EVENTS ----
    $('#floorPlanFilter').on('change', renderFloorPlan);
    $('#floorSearch').on('input', renderFloorsTable);
    $('#wardSearch, #wardFloorFilter').on('input change', renderWardsTable);
    $('#bedSearch, #bedStatusFilter').on('input change', renderBedsTable);

    $('#bedFloorFilter').on('change', function () {
        populateWardFilterDropdown($(this).val());
        renderBedsTable();
    });
    $('#bedWardFilter').on('change', renderBedsTable);

    // ---- FLOOR CRUD ----
    $('#btnAddFloor').on('click', function () {
        $('#floorOffcanvasTitle').html('<i data-lucide="building"></i> Add Floor');
        $('#floorId').val('');
        $('#floorName, #floorCode').val('');
        new bootstrap.Offcanvas('#floorOffcanvas').show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-edit-floor', function () {
        var id = $(this).data('id');
        var f  = floors.find(function (x) { return x.floorId === id; });
        if (!f) return;
        $('#floorOffcanvasTitle').html('<i data-lucide="building"></i> Edit Floor');
        $('#floorId').val(f.floorId);
        $('#floorName').val(f.name);
        $('#floorCode').val(f.code || '');
        new bootstrap.Offcanvas('#floorOffcanvas').show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-del-floor', function () {
        var id = $(this).data('id'), name = $(this).data('name');
        if (!confirm('Delete floor "' + name + '"? This cannot be undone.')) return;
        $.ajax({ url: '/api/bed-management/floors/' + id, type: 'DELETE' })
            .done(loadAll)
            .fail(function (xhr) { HMS.ajaxError(xhr, 'Failed to delete floor.'); });
    });

    $('#floorForm').on('submit', function (e) {
        e.preventDefault();
        var id   = $('#floorId').val();
        var name = $('#floorName').val().trim();
        var code = $('#floorCode').val().trim();
        if (!name) { HMS.toast('Floor name is required.', 'warning'); return; }
        $.ajax({
            url: id ? '/api/bed-management/floors/' + id : '/api/bed-management/floors',
            type: id ? 'PUT' : 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ name: name, code: code })
        }).done(function () { bootstrap.Offcanvas.getInstance('#floorOffcanvas').hide(); loadAll(); })
          .fail(function (xhr) { HMS.ajaxError(xhr, 'Failed to save floor.'); });
    });

    // ---- WARD CRUD ----
    $('#btnAddWard').on('click', function () {
        $('#wardOffcanvasTitle').html('<i data-lucide="grid-3x3"></i> Add Ward');
        $('#wardId').val('');
        $('#wardName').val('');
        $('#wardCategory').val('General');
        $('#wardFloorId').val('');
        new bootstrap.Offcanvas('#wardOffcanvas').show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-edit-ward', function () {
        var id = $(this).data('id');
        var w  = wards.find(function (x) { return x.wardId === id; });
        if (!w) return;
        $('#wardOffcanvasTitle').html('<i data-lucide="grid-3x3"></i> Edit Ward');
        $('#wardId').val(w.wardId);
        $('#wardName').val(w.name);
        $('#wardCategory').val(w.category);
        $('#wardFloorId').val(w.floorId);
        new bootstrap.Offcanvas('#wardOffcanvas').show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-del-ward', function () {
        var id = $(this).data('id'), name = $(this).data('name');
        if (!confirm('Delete ward "' + name + '"? This cannot be undone.')) return;
        $.ajax({ url: '/api/bed-management/wards/' + id, type: 'DELETE' })
            .done(loadAll)
            .fail(function (xhr) { HMS.ajaxError(xhr, 'Failed to delete ward.'); });
    });

    $('#wardForm').on('submit', function (e) {
        e.preventDefault();
        var id   = $('#wardId').val();
        var data = { name: $('#wardName').val().trim(), category: $('#wardCategory').val(), floorId: $('#wardFloorId').val() };
        if (!data.name || !data.floorId) { HMS.toast('Name and floor are required.', 'warning'); return; }
        $.ajax({
            url: id ? '/api/bed-management/wards/' + id : '/api/bed-management/wards',
            type: id ? 'PUT' : 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        }).done(function () { bootstrap.Offcanvas.getInstance('#wardOffcanvas').hide(); loadAll(); })
          .fail(function (xhr) { HMS.ajaxError(xhr, 'Failed to save ward.'); });
    });

    // ---- BED CRUD ----
    $('#btnAddBed').on('click', function () {
        $('#bedOffcanvasTitle').html('<i data-lucide="bed"></i> Add Bed');
        $('#bedEditId').val('');
        $('#bedNumber').val('');
        $('#bedType').val('Standard');
        populateWardSelectDropdown();
        new bootstrap.Offcanvas('#bedOffcanvas').show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-edit-bed', function () {
        var id = $(this).data('id');
        var b  = beds.find(function (x) { return x.bedId === id; });
        if (!b) return;
        $('#bedOffcanvasTitle').html('<i data-lucide="bed"></i> Edit Bed');
        $('#bedEditId').val(b.bedId);
        $('#bedNumber').val(b.bedNumber);
        $('#bedType').val(b.type);
        populateWardSelectDropdown();
        $('#bedWardId').val(b.wardId);
        new bootstrap.Offcanvas('#bedOffcanvas').show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-del-bed', function () {
        var id = $(this).data('id'), num = $(this).data('num');
        if (!confirm('Delete bed "' + num + '"? This cannot be undone.')) return;
        $.ajax({ url: '/api/bed-management/beds/' + id, type: 'DELETE' })
            .done(loadAll)
            .fail(function (xhr) { HMS.ajaxError(xhr, 'Failed to delete bed.'); });
    });

    $('#bedForm').on('submit', function (e) {
        e.preventDefault();
        var id   = $('#bedEditId').val();
        var data = { bedNumber: $('#bedNumber').val().trim(), type: $('#bedType').val(), wardId: $('#bedWardId').val() };
        if (!data.bedNumber || !data.wardId) { HMS.toast('Bed number and ward are required.', 'warning'); return; }
        $.ajax({
            url: id ? '/api/bed-management/beds/' + id : '/api/bed-management/beds',
            type: id ? 'PUT' : 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        }).done(function () { bootstrap.Offcanvas.getInstance('#bedOffcanvas').hide(); loadAll(); })
          .fail(function (xhr) { HMS.ajaxError(xhr, 'Failed to save bed.'); });
    });

    // ---- BED STATUS ----
    function openStatusModal(bedId) {
        var b = beds.find(function (x) { return x.bedId === bedId; });
        if (!b) return;
        $('#statusBedId').val(b.bedId);
        $('#statusBedLabel').text('Bed ' + b.bedNumber + ' — ' + wardName(b.wardId) + ', ' + floorName(b.floorId));
        $('#newStatus').val(b.status || 'Available');
        $('#statusPatientName').val(b.assignedPatientName || '');
        $('#statusPatientMrn').val(b.assignedPatientMrn || '');
        $('#statusAdmissionDate').val(b.admissionDate ? b.admissionDate.substring(0, 10) : new Date().toISOString().substring(0, 10));
        $('#patientFields').toggle(b.status === 'Occupied');
        new bootstrap.Modal('#statusModal').show();
    }

    $(document).on('click', '.bed-card', function () { openStatusModal($(this).data('bed-id')); });
    $(document).on('click', '.btn-change-status', function () { openStatusModal($(this).data('id')); });
    $(document).on('change', '#newStatus', function () { $('#patientFields').toggle($(this).val() === 'Occupied'); });

    $('#btnSaveStatus').on('click', function () {
        var id     = $('#statusBedId').val();
        var status = $('#newStatus').val();
        var data   = { status: status };
        if (status === 'Occupied') {
            data.patientName   = $('#statusPatientName').val().trim();
            data.patientMrn    = $('#statusPatientMrn').val().trim();
            data.admissionDate = $('#statusAdmissionDate').val();
        }
        $.ajax({ url: '/api/bed-management/beds/' + id + '/status', type: 'PATCH', contentType: 'application/json', data: JSON.stringify(data) })
            .done(function () { bootstrap.Modal.getInstance('#statusModal').hide(); loadAll(); })
            .fail(function (xhr) { HMS.ajaxError(xhr, 'Failed to update status.'); });
    });

    // ---- INIT ----
    loadAll();
});
