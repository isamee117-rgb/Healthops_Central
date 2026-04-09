$(document).ready(function() {

    /* ── State ────────────────────────────────────────────────────────────── */
    var hospitalInfo    = { currency: 'PKR' };
    var currentOrderId  = null;
    var currentOrderData= null;
    var allOrders       = [];          // master list from API
    var pharFiltered    = null;        // null = no filter active
    var pharCurrentPage = 1;
    var pharPerPageVal  = 10;
    var autoRefreshTimer;
    var _orderItemPatches = {};        // persists item edits per orderId while page is open

    function esc(s) { return $('<span>').text(s || '').html(); }
    function fmt(n) { return hospitalInfo.currency + ' ' + Number(n || 0).toLocaleString(); }

    $.get('/api/config/hospital-info', function(d) { if (d && d.currency) hospitalInfo.currency = d.currency; });

    /* ── Color maps ───────────────────────────────────────────────────────── */
    var statusColors = {
        'Pending'   : { bg:'#FEFCE8', color:'#eab308' },
        'Verified'  : { bg:'#DBEAFE', color:'#3b82f6' },
        'Dispensing': { bg:'#F3E8FF', color:'#8b5cf6' },
        'Ready'     : { bg:'#DCFCE7', color:'#22c55e' },
        'Completed' : { bg:'#F3F4F6', color:'#6b7280' },
        'On Hold'   : { bg:'#FFF7ED', color:'#f97316' },
        'Cancelled' : { bg:'#FEE2E2', color:'#ef4444' }
    };
    var priorityColors = {
        'STAT'   : { bg:'#FEE2E2', color:'#ef4444' },
        'Urgent' : { bg:'#FFF7ED', color:'#f97316' },
        'Routine': { bg:'#DCFCE7', color:'#22c55e' }
    };
    var deptColors = {
        'OPD'      : { bg:'#DBEAFE', color:'#3b82f6' },
        'IPD'      : { bg:'#EDE9FE', color:'#8b5cf6' },
        'Emergency': { bg:'#FEE2E2', color:'#ef4444' },
        'OT'       : { bg:'#FFF7ED', color:'#f97316' },
        'Walk-in'  : { bg:'#DCFCE7', color:'#22c55e' }
    };

    /* ── Init ─────────────────────────────────────────────────────────────── */
    loadStats();
    loadOrders();
    autoRefreshTimer = setInterval(function() { loadStats(); loadOrders(); }, 60000);

    /* ── API: Stats ───────────────────────────────────────────────────────── */
    function loadStats() {
        $.get('/api/medication-orders/stats', function(d) {
            $('#statPending').text(d.pending);
            $('#statInProgress').text(d.inProgress);
            $('#statReady').text(d.ready);
            $('#statCompleted').text(d.completedToday);
        });
    }

    /* ── API: Load all orders ─────────────────────────────────────────────── */
    function loadOrders() {
        $.get('/api/medication-orders', function(data) {
            allOrders = data || [];
            /* sort latest first */
            allOrders.sort(function(a, b) {
                return new Date(b.orderTime || 0) - new Date(a.orderTime || 0);
            });
            pharFiltered    = null;
            pharCurrentPage = 1;
            populatePharFilterOptions();
            renderPharPagination(allOrders);
        });
    }

    /* ── Populate searchable dropdowns ───────────────────────────────────── */
    function populatePharFilterOptions() {
        var patients = [], doctors = [];
        allOrders.forEach(function(o) {
            if (o.patientName && patients.indexOf(o.patientName) < 0) patients.push(o.patientName);
            if (o.orderedBy   && doctors.indexOf(o.orderedBy)   < 0) doctors.push(o.orderedBy);
        });
        var wp = document.getElementById('pharCsPatient'); if (wp && wp.setOptions) wp.setOptions(patients);
        var wd = document.getElementById('pharCsDoctor');  if (wd && wd.setOptions) wd.setOptions(doctors);
    }

    /* ── Build one table row ─────────────────────────────────────────────── */
    /* ── Badge helpers (OPD-style) ───────────────────────────────────────── */
    function pharStatusBadge(status) {
        var cls = { 'Pending':'badge-warning', 'Verified':'badge-info', 'Dispensing':'badge-purple',
                    'Ready':'badge-success', 'Completed':'badge-outline', 'On Hold':'badge-warning',
                    'Cancelled':'badge-danger' }[status] || 'badge-outline';
        return '<span class="badge ' + cls + '">' + esc((status || 'N/A')).toUpperCase() + '</span>';
    }
    function pharPayBadge(status) {
        if (status === 'Paid')    return '<span class="badge badge-success">PAID</span>';
        if (status === 'Partial') return '<span class="badge badge-info">PARTIAL</span>';
        return '<span class="badge badge-warning">PENDING</span>';
    }

    function buildPharRow(order) {
        var pc  = priorityColors[order.priority]|| { bg:'#f1f5f9', color:'#666' };
        var dc  = deptColors[order.department]  || { bg:'#f1f5f9', color:'#666' };

        var rowClass = 'order-row clickable-row';
        var priorityExtra = order.priority === 'STAT' ? ' priority-stat' : '';

        var orderTimeStr = '', orderTimeAge = '';
        if (order.orderTime) {
            var od = new Date(order.orderTime);
            orderTimeStr = od.toLocaleTimeString('en-PK', { hour:'2-digit', minute:'2-digit' });
            orderTimeAge = order.ageLabel || '';
        }

        var createdStr = '', createdDateStr = '';
        var createdRaw = order.createdAt || order.orderTime;
        if (createdRaw) {
            var cd = new Date(createdRaw);
            createdDateStr = cd.toLocaleDateString('en-PK', { day:'2-digit', month:'short', year:'numeric' });
            createdStr     = cd.toLocaleTimeString('en-PK', { hour:'2-digit', minute:'2-digit' });
        }

        var deptLabel = order.department || '';
        if (order.ward) deptLabel += '-' + order.ward;

        return '<tr class="' + rowClass + '" data-order-id="' + esc(order.orderId) + '" style="cursor:pointer">' +
            '<td class="font-mono" style="font-size:13px;font-weight:600;color:var(--aquamint)">' + esc(order.orderId) + '</td>' +
            '<td><div style="font-size:12px;font-weight:500">' + esc(orderTimeStr) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(orderTimeAge) + '</div></td>' +
            '<td style="font-size:12.5px;font-weight:600;color:var(--color-foreground)">' + esc(order.mrn || '--') + '</td>' +
            '<td><div style="font-size:13px;font-weight:500;color:var(--color-foreground)">' + esc(order.patientName) + '</div>' +
                (order.visitNumber ? '<div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(order.visitNumber) + '</div>' : '') +
            '</td>' +
            '<td class="text-center"><span class="badge" style="background:' + dc.bg + ';color:' + dc.color + '">' + esc(deptLabel) + '</span></td>' +
            '<td class="text-center"><span class="badge' + priorityExtra + '" style="background:' + pc.bg + ';color:' + pc.color + ';font-weight:700">' + esc(order.priority) + '</span></td>' +
            '<td class="text-center" style="font-size:13px;font-weight:600">' + (order.itemsCount || 0) + '</td>' +
            '<td class="text-right font-mono" style="font-size:13px;font-weight:600">' + fmt(order.orderValue) + '</td>' +
            '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(order.orderedBy) + '</td>' +
            '<td class="text-center">' + pharStatusBadge(order.status) + '</td>' +
            '<td class="text-center">' + pharPayBadge(order.paymentStatus) + '</td>' +
            '<td><div style="font-size:12px;font-weight:500">' + esc(createdDateStr) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(createdStr) + '</div></td>' +
        '</tr>';
    }

    /* ── Paginated render ────────────────────────────────────────────────── */
    window.renderPharPagination = function(source) {
        /* inline search */
        var q = ($('#pharSearch').val() || '').toLowerCase().trim();
        var rows = q ? source.filter(function(o) {
            return (o.orderId      || '').toLowerCase().indexOf(q) > -1 ||
                   (o.patientName  || '').toLowerCase().indexOf(q) > -1 ||
                   (o.mrn          || '').toLowerCase().indexOf(q) > -1 ||
                   (o.orderedBy    || '').toLowerCase().indexOf(q) > -1 ||
                   (o.department   || '').toLowerCase().indexOf(q) > -1;
        }) : source;

        var total  = rows.length;
        var pages  = Math.max(1, Math.ceil(total / pharPerPageVal));
        pharCurrentPage = Math.min(pharCurrentPage, pages);
        var start  = (pharCurrentPage - 1) * pharPerPageVal;
        var slice  = rows.slice(start, start + pharPerPageVal);
        var end    = Math.min(start + pharPerPageVal, total);

        var $tb = $('#pharTableBody');
        if (slice.length === 0) {
            $tb.html('<tr><td colspan="12" style="padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:13px"><i data-lucide="inbox" style="width:32px;height:32px;opacity:0.3;display:block;margin:0 auto 8px"></i>No medication orders found</td></tr>');
        } else {
            $tb.html(slice.map(buildPharRow).join(''));
        }

        /* re-apply column visibility */
        _applyColVisToTable();

        /* page info */
        $('#pharPageInfo').text(total === 0 ? 'No results' : 'Showing ' + (start + 1) + '–' + end + ' of ' + total + ' orders');

        /* page numbers */
        var nums = '';
        var sp = Math.max(1, pharCurrentPage - 2), ep = Math.min(pages, sp + 4);
        if (sp > 1) nums += '<button class="opd-page-num" onclick="pharGoPage(1)">1</button>' + (sp > 2 ? '<span style="padding:0 4px;color:#94a3b8">…</span>' : '');
        for (var p = sp; p <= ep; p++) nums += '<button class="opd-page-num' + (p === pharCurrentPage ? ' active' : '') + '" onclick="pharGoPage(' + p + ')">' + p + '</button>';
        if (ep < pages) nums += (ep < pages - 1 ? '<span style="padding:0 4px;color:#94a3b8">…</span>' : '') + '<button class="opd-page-num" onclick="pharGoPage(' + pages + ')">' + pages + '</button>';
        $('#pharPageNums').html(nums);

        $('#pharPrevPage').prop('disabled', pharCurrentPage <= 1);
        $('#pharNextPage').prop('disabled', pharCurrentPage >= pages);

        lucide.createIcons();
    };

    window.pharGoPage = function(p) { pharCurrentPage = p; renderPharPagination(pharFiltered !== null ? pharFiltered : allOrders); };
    $('#pharPrevPage').on('click', function() { if (pharCurrentPage > 1) { pharCurrentPage--; renderPharPagination(pharFiltered !== null ? pharFiltered : allOrders); } });
    $('#pharNextPage').on('click', function() { pharCurrentPage++; renderPharPagination(pharFiltered !== null ? pharFiltered : allOrders); });

    /* search */
    var searchTimer;
    $('#pharSearch').on('input', function() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function() {
            pharCurrentPage = 1;
            renderPharPagination(pharFiltered !== null ? pharFiltered : allOrders);
        }, 200);
    });

    /* refresh button */
    $('#btnRefresh').on('click', function() { loadStats(); loadOrders(); });

    /* ── Filter pane toggle ──────────────────────────────────────────────── */
    window.togglePharFilter = function() {
        var pane = document.getElementById('pharFilterPane');
        var btn  = document.getElementById('btnPharFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : '';
        btn && btn.classList.toggle('filter-active', !open);
        if (!open && window.lucide) lucide.createIcons();
    };

    /* ── Apply filters ───────────────────────────────────────────────────── */
    window.applyPharFilters = function() {
        var patient  = ($('#pharPatientFilter').val()  || '').toLowerCase().trim();
        var doctor   = ($('#pharDoctorFilter').val()   || '').toLowerCase().trim();
        var dept     = ($('#pharDeptFilter').val()     || 'all');
        var status   = ($('#pharStatusFilter').val()   || 'all');
        var priority = ($('#pharPriorityFilter').val() || 'all');
        var payment  = ($('#pharPaymentFilter').val()  || 'all');
        var dateFrom = ($('#pharDateFrom').val()       || '');
        var dateTo   = ($('#pharDateTo').val()         || '');

        var dfTs = dateFrom ? new Date(dateFrom).getTime() : 0;
        var dtTs = dateTo   ? new Date(dateTo + 'T23:59:59').getTime() : 0;

        var active = [patient, doctor, dept !== 'all' ? dept : '', status !== 'all' ? status : '', priority !== 'all' ? priority : '', payment !== 'all' ? payment : '', dateFrom, dateTo].filter(Boolean).length;

        pharFiltered = allOrders.filter(function(o) {
            if (patient  && (o.patientName || '').toLowerCase().indexOf(patient)   < 0) return false;
            if (doctor   && (o.orderedBy   || '').toLowerCase().indexOf(doctor)    < 0) return false;
            if (dept     !== 'all' && (o.department || '') !== dept)   return false;
            if (status   !== 'all' && (o.status     || '') !== status) return false;
            if (priority !== 'all' && (o.priority   || '') !== priority) return false;
            if (payment  !== 'all' && (o.paymentStatus || '') !== payment) return false;
            if (dfTs) { var t = o.orderTime ? new Date(o.orderTime).getTime() : 0; if (t < dfTs) return false; }
            if (dtTs) { var t = o.orderTime ? new Date(o.orderTime).getTime() : 0; if (t > dtTs) return false; }
            return true;
        });

        var badge = document.getElementById('pharFilterBadge');
        if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }

        pharCurrentPage = 1;
        renderPharPagination(pharFiltered);
    };

    /* ── Reset filters ───────────────────────────────────────────────────── */
    window.resetPharFilters = function() {
        ['pharDeptFilter','pharStatusFilter','pharPriorityFilter','pharPaymentFilter'].forEach(function(id) {
            var el = document.getElementById(id); if (el) el.value = 'all';
        });
        $('#pharPatientFilter').val('');
        $('#pharDoctorFilter').val('');
        $('#pharDateFrom').val('');
        $('#pharDateTo').val('');

        /* reset searchable dropdowns visually */
        document.querySelectorAll('#pharFilterPane .opd-cs-wrap').forEach(function(w) {
            var val = w.querySelector('.opd-cs-val');
            if (val) { val.textContent = w.dataset.placeholder || ''; val.classList.add('opd-ph'); }
        });
        /* reset date pickers visually */
        document.querySelectorAll('#pharFilterPane .opd-dp-wrap').forEach(function(w) {
            var val = w.querySelector('.opd-dp-val');
            if (val) { val.textContent = w.dataset.placeholder || 'Select date'; val.classList.add('opd-ph'); }
        });

        var badge = document.getElementById('pharFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }

        pharFiltered = null;
        pharCurrentPage = 1;
        renderPharPagination(allOrders);
    };

    /* ── Rows per page ───────────────────────────────────────────────────── */
    window.togglePharRowsMenu = function(e) {
        e && e.stopPropagation();
        closePharMenus('pharRowsMenu');
        var menu = document.getElementById('pharRowsMenu');
        if (!menu) return;
        if (menu.classList.toggle('open')) {
            menu.querySelectorAll('button').forEach(function(btn) {
                var v = parseInt(btn.textContent);
                btn.classList.toggle('active', v === pharPerPageVal);
            });
        }
    };
    window.setPharRowsPer = function(n) {
        var menu = document.getElementById('pharRowsMenu'); if (menu) menu.classList.remove('open');
        pharPerPageVal = n; pharCurrentPage = 1;
        renderPharPagination(pharFiltered !== null ? pharFiltered : allOrders);
    };

    /* ── Column visibility ───────────────────────────────────────────────── */
    var pharColHidden = {};

    window.togglePharColVis = function(e) {
        e && e.stopPropagation();
        closePharMenus('pharColVisMenu');
        var menu = document.getElementById('pharColVisMenu');
        if (menu) menu.classList.toggle('open');
    };
    window.pharColVisSelectAll = function() {
        document.querySelectorAll('#pharColVisList input[type="checkbox"]').forEach(function(cb) { cb.checked = true; });
    };
    window.applyPharColVis = function() {
        var menu = document.getElementById('pharColVisMenu'); if (menu) menu.classList.remove('open');
        pharColHidden = {};
        document.querySelectorAll('#pharColVisList input[type="checkbox"]').forEach(function(cb) {
            var col = parseInt(cb.getAttribute('data-col'));
            pharColHidden[col] = !cb.checked;
        });
        _applyColVisToTable();
    };
    function _applyColVisToTable() {
        var table = document.getElementById('pharTable'); if (!table) return;
        table.querySelectorAll('thead tr th').forEach(function(th, i) { th.style.display = pharColHidden[i] ? 'none' : ''; });
        table.querySelectorAll('tbody tr').forEach(function(row) {
            row.querySelectorAll('td').forEach(function(td, i) { td.style.display = pharColHidden[i] ? 'none' : ''; });
        });
    }

    /* ── Export ──────────────────────────────────────────────────────────── */
    window.togglePharExportMenu = function(e) {
        e && e.stopPropagation();
        closePharMenus('pharExportMenu');
        var menu = document.getElementById('pharExportMenu');
        if (menu) menu.classList.toggle('open');
    };

    window.exportPhar = function(type) {
        var menu = document.getElementById('pharExportMenu'); if (menu) menu.classList.remove('open');
        var src  = pharFiltered !== null ? pharFiltered : allOrders;
        var hdrs = ['Order ID','Order Time','MRN','Patient Name','Department','Priority','Items','Order Value','Ordered By','Status','Payment','Created At'];
        var rows = src.map(function(o) {
            var orderTimeStr = o.orderTime ? new Date(o.orderTime).toLocaleString() : '';
            var createdStr   = (o.createdAt || o.orderTime) ? new Date(o.createdAt || o.orderTime).toLocaleString() : '';
            return [o.orderId, orderTimeStr, o.mrn, o.patientName, o.department, o.priority, o.itemsCount, o.orderValue, o.orderedBy, o.status, o.paymentStatus, createdStr];
        });

        if (type === 'csv') {
            var csv = [hdrs].concat(rows).map(function(r) { return r.map(function(c) { return '"' + String(c || '').replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
            var blob = new Blob([csv], { type: 'text/csv' });
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'medication-orders.csv'; a.click();
        } else if (type === 'excel') {
            var xls = '<table><thead><tr>' + hdrs.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
                rows.map(function(r) { return '<tr>' + r.map(function(c) { return '<td>' + esc(String(c || '')) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
            var blob = new Blob([xls], { type: 'application/vnd.ms-excel' });
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'medication-orders.xls'; a.click();
        } else if (type === 'print') {
            var printHtml = '<html><head><title>Medication Orders</title><style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 10px}th{background:#f1f5f9;font-weight:600}</style></head><body>' +
                '<h2 style="margin-bottom:12px">Medication Orders Queue</h2>' +
                '<table><thead><tr>' + hdrs.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
                rows.map(function(r) { return '<tr>' + r.map(function(c) { return '<td>' + esc(String(c || '')) + '</td>'; }).join('') + '</tr>'; }).join('') +
                '</tbody></table></body></html>';
            var w = window.open('', '_blank'); w.document.write(printHtml); w.document.close(); w.print();
        } else if (type === 'pdf') {
            window.exportPhar('print');
        }
    };

    /* ── Close menus on outside click ───────────────────────────────────── */
    function closePharMenus(except) {
        ['pharRowsMenu','pharColVisMenu','pharExportMenu'].forEach(function(id) {
            if (id !== except) { var m = document.getElementById(id); if (m) m.classList.remove('open'); }
        });
    }
    $(document).on('click', function() { closePharMenus(null); });

    /* ── Row click → order detail ────────────────────────────────────────── */
    $(document).on('click', '.order-row', function() {
        openOrderDetail($(this).data('order-id'));
    });

    /* ── Order detail offcanvas ──────────────────────────────────────────── */
    function openOrderDetail(orderId) {
        currentOrderId = orderId;
        $.get('/api/medication-orders/' + orderId, function(order) {
            /* restore any client-side item edits made while order is still Pending */
            if (order.status === 'Pending' && _orderItemPatches[orderId]) {
                order.items = _orderItemPatches[orderId];
            }
            currentOrderData = order;
            $('#detailOrderId').text(order.orderId);

            var pc = { 'STAT':{ bg:'#FEE2E2',color:'#ef4444' }, 'Urgent':{ bg:'#FFF7ED',color:'#f97316' }, 'Routine':{ bg:'#DCFCE7',color:'#22c55e' } };
            var pstyle = pc[order.priority] || { bg:'#f1f5f9', color:'#666' };
            $('#detailPriorityBadge').html('<span style="padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700;background:' + pstyle.bg + ';color:' + pstyle.color + '">' + esc(order.priority) + '</span>');

            var dateStr = '';
            if (order.orderTime) {
                var d = new Date(order.orderTime);
                dateStr = 'Ordered: ' + d.toLocaleDateString('en-PK', { day:'2-digit', month:'short', year:'numeric' }) + ' ' + d.toLocaleTimeString('en-PK', { hour:'2-digit', minute:'2-digit', hour12:true });
            }
            var sc = { 'Pending':'#eab308','Verified':'#3b82f6','Dispensing':'#8b5cf6','Ready':'#22c55e','Completed':'#6b7280','On Hold':'#f97316','Cancelled':'#ef4444' };
            var statusColor = sc[order.status] || '#666';

            $('#detailOrderMeta').html(dateStr + ' &nbsp;|&nbsp; Status: <span style="color:' + statusColor + ';font-weight:600">' + esc(order.status) + '</span>');

            var holdReasonHtml = '';
            var holdReasonText = order.holdReason || order.hold_reason || order.reason || '';
            if (order.status === 'On Hold' && holdReasonText) {
                holdReasonHtml = '<div style="padding:10px 14px;background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;margin-top:10px;display:flex;align-items:flex-start;gap:8px">' +
                    '<i data-lucide="info" style="width:14px;height:14px;color:#f97316;flex-shrink:0;margin-top:1px"></i>' +
                    '<div><span style="font-size:11px;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:0.05em">Hold Reason</span>' +
                    '<div style="font-size:12px;color:#92400e;margin-top:2px">' + esc(holdReasonText) + '</div></div>' +
                '</div>';
            }

            var patientSection =
                '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">' +
                    '<div style="display:flex;align-items:center;gap:12px">' +
                        '<div><div style="font-size:15px;font-weight:700">' + esc(order.patientName) + ' (' + esc(order.mrn) + ')</div>' +
                        '<div style="font-size:12px;color:var(--color-muted-foreground)">' + (order.patientAge ? order.patientAge + 'Y/' + esc(order.patientGender) : '') + ' | Location: ' + esc(order.patientLocation || order.department) + '</div></div>' +
                    '</div>' +
                    holdReasonHtml +
                '</div>';

            var isPending = order.status === 'Pending';
            var itemsHtml = '<div class="phar-items-section" style="margin-bottom:20px"><div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Medication Order Details</div>';
            if (order.items && order.items.length > 0) {
                order.items.forEach(function(item, idx) {
                    var isRemoved = item._removed;
                    var isAlt     = item._isAlt;
                    var nameStyle = isRemoved ? 'text-decoration:line-through;color:#9ca3af;font-size:14px;font-weight:700;margin-bottom:6px' : 'font-size:14px;font-weight:700;margin-bottom:6px';
                    var cardStyle = 'padding:14px 16px;border:1px solid var(--color-border);border-radius:10px;margin-bottom:10px;background:' + (isRemoved ? '#f9fafb' : (isAlt ? '#f0fdf4' : '#fff'));
                    var stockIcon = item.inStock
                        ? '<span style="color:#22c55e">&#10003; Available (' + item.stockAvailable + ')</span>'
                        : '<span style="color:#ef4444">&#10007; Low Stock (' + item.stockAvailable + ')</span>';
                    var alertsHtml = '';
                    if (order.clinicalChecks) {
                        (order.clinicalChecks.allergyAlerts || []).forEach(function(alert) {
                            if (alert.medicine === item.name) alertsHtml += '<div style="padding:8px 12px;background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;margin-top:8px;font-size:12px"><span style="color:#ef4444;font-weight:700"><i data-lucide="alert-octagon" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> ALLERGY ALERT:</span> ' + esc(alert.message) + '</div>';
                        });
                        (order.clinicalChecks.drugInteractions || []).forEach(function(inter) {
                            if (inter.medicine === item.name) alertsHtml += '<div style="padding:8px 12px;background:#FFF7ED;border:1px solid #FED7AA;border-radius:6px;margin-top:8px;font-size:12px"><span style="color:#f97316;font-weight:700"><i data-lucide="alert-triangle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Drug Interaction:</span> ' + esc(inter.message) + '</div>';
                        });
                    }
                    var altBadge = isAlt ? ' <span style="font-size:10px;padding:1px 7px;background:#dcfce7;color:#16a34a;border-radius:4px;font-weight:700;vertical-align:middle">ALTERNATIVE</span>' : '';
                    var removedNote = isRemoved ? '<div style="font-size:11px;color:#ef4444;margin-top:4px">&#10007; Removed</div>' : '';
                    /* buttons — only shown for pending, hidden for removed/alt items */
                    var btnHtml = '';
                    if (isPending && !isRemoved) {
                        btnHtml = '<div style="display:flex;gap:6px;margin-top:10px">' +
                            '<button class="btn-remove-item" data-idx="' + idx + '" style="padding:3px 10px;background:#ef4444;border:none;border-radius:5px;font-size:11px;font-weight:600;color:#fff;cursor:pointer">&#10007; Remove</button>' +
                            (!isAlt ? '<button class="btn-alt-item" data-idx="' + idx + '" data-name="' + esc(item.name) + '" data-qty="' + esc((item.totalQty || item.qty) + '') + '" style="padding:3px 10px;background:var(--color-background);border:1px solid var(--color-border);border-radius:5px;font-size:11px;font-weight:500;cursor:pointer">Alternative</button>' : '') +
                        '</div>';
                    } else if (!isPending) {
                        btnHtml = '<div style="margin-top:8px;font-size:11px;color:#9ca3af;font-style:italic">Edit not available — order is ' + esc(order.status) + '</div>';
                    }
                    itemsHtml +=
                        '<div style="' + cardStyle + '">' +
                            '<div style="' + nameStyle + '">' + esc(item.name) + altBadge + (item.generic ? ' <span style="font-size:12px;font-weight:400;color:var(--color-muted-foreground)">(' + esc(item.generic) + ')</span>' : '') + '</div>' +
                            removedNote +
                            (!isRemoved ? (
                                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:var(--color-muted-foreground)">' +
                                    '<div>Dose: <strong style="color:var(--color-foreground)">' + esc(item.dose) + '</strong> | Frequency: <strong style="color:var(--color-foreground)">' + esc(item.frequency) + '</strong></div>' +
                                    '<div>Duration: <strong style="color:var(--color-foreground)">' + esc(item.duration) + '</strong> | Total: <strong style="color:var(--color-foreground)">' + (item.totalQty || item.qty) + ' ' + esc(item.form || 'units') + '</strong></div>' +
                                '</div>' +
                                '<div style="margin-top:8px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:12px"><span style="color:var(--color-muted-foreground)">Stock: ' + stockIcon + '</span>' + (item.livePrice ? '<span style="padding:2px 7px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;color:#16a34a;font-weight:600;font-size:11px">&#9679; Live Price</span>' : '') + '</div>' +
                                '<div style="margin-top:6px;padding:8px 10px;background:var(--color-background);border-radius:6px;border:1px solid var(--color-border);font-size:12px;display:flex;gap:16px">' +
                                    '<span>Unit Price: <strong style="font-family:monospace">' + fmt(item.unitPrice) + '</strong></span>' +
                                    '<span>Qty: <strong>' + (item.totalQty || item.qty) + '</strong></span>' +
                                    '<span>Subtotal: <strong style="font-family:monospace;color:#003366">' + fmt(item.total) + '</strong></span>' +
                                '</div>'
                            ) : '') +
                            alertsHtml +
                            btnHtml +
                        '</div>';
                });
            }
            itemsHtml += '</div>';

            var billingHtml =
                '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Billing Summary</div>' +
                    '<div style="font-size:13px">' +
                        '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed var(--color-border)"><span>Total Order Value:</span><strong style="font-family:monospace">' + fmt(order.orderValue) + '</strong></div>' +
                        '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:15px"><span style="font-weight:600">Patient Payable:</span><strong style="font-family:monospace;color:#003366;font-size:16px">' + fmt(order.patientPayable) + '</strong></div>' +
                    '</div>' +
                '</div>';

            $('#orderDetailBody').html(patientSection + itemsHtml + billingHtml);
            updateActionButtons(order.status);
            new bootstrap.Offcanvas(document.getElementById('orderDetailSheet')).show();
            lucide.createIcons();
        });
    }

    /* ── Order action buttons ────────────────────────────────────────────── */
    function updateActionButtons(status) {
        var $verify = $('.btn-verify-order');
        var $hold   = $('.btn-hold-order');

        /* Reset both to visible defaults */
        $verify.show();
        $hold.show()
             .html('<i data-lucide="pause-circle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Hold Order')
             .css({ color:'#f97316', borderColor:'#f97316' })
             .removeAttr('data-action');

        if (status === 'Verified' || status === 'Dispensing' || status === 'Ready') {
            $verify.hide();
        } else if (status === 'Completed' || status === 'Cancelled') {
            $verify.hide();
            $hold.hide();
        } else if (status === 'On Hold') {
            $hold.html('<i data-lucide="play-circle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Resume Order')
                 .css({ color:'#22c55e', borderColor:'#22c55e' })
                 .attr('data-action', 'resume');
        }
        /* Pending: all three buttons visible as-is */
        lucide.createIcons();
    }

    function _closeSheet() {
        bootstrap.Offcanvas.getInstance(document.getElementById('orderDetailSheet')).hide();
        loadStats();
        loadOrders();
    }

    function doStatusUpdate(status) {
        if (!currentOrderId) return;
        _flushPatch(function() {
            $.ajax({ url:'/api/medication-orders/update-status', method:'POST', contentType:'application/json',
                data: JSON.stringify({ orderId: currentOrderId, status: status }),
                success: _closeSheet,
                error: function(xhr) { HMS.ajaxError(xhr, 'Failed'); }
            });
        });
    }

    $(document).on('click', '.btn-verify-order', function() {
        if (!currentOrderId) return;
        _flushPatch(function() {
            $.ajax({ url:'/api/medication-orders/verify', method:'POST', contentType:'application/json',
                data: JSON.stringify({ orderId: currentOrderId }),
                success: _closeSheet,
                error: function(xhr) { HMS.ajaxError(xhr, 'Failed'); }
            });
        });
    });


    /* Hold button — opens reason modal; Resume button — resumes directly */
    $(document).on('click', '.btn-hold-order', function() {
        if (!currentOrderId) return;
        if ($(this).attr('data-action') === 'resume') {
            /* Resume Order */
            doStatusUpdate('Pending');
            $(this).css({ color:'#f97316', borderColor:'#f97316' })
                   .html('<i data-lucide="pause-circle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i> Hold Order')
                   .removeAttr('data-action');
            lucide.createIcons();
            return;
        }
        /* Hold Order — show reason modal */
        $('#holdReasonText').val('');
        $('#holdReasonError').hide();
        var modal = new bootstrap.Modal(document.getElementById('holdReasonModal'));
        modal.show();
        lucide.createIcons();
    });

    $('#holdReasonConfirmBtn').on('click', function() {
        var reason = $('#holdReasonText').val().trim();
        if (!reason) { $('#holdReasonError').show(); return; }
        $('#holdReasonError').hide();
        bootstrap.Modal.getInstance(document.getElementById('holdReasonModal')).hide();
        $('#holdReasonModal').one('hidden.bs.modal', function() {
            $.ajax({ url:'/api/medication-orders/hold', method:'POST', contentType:'application/json',
                data: JSON.stringify({ orderId: currentOrderId, reason: reason }),
                success: function() {
                    bootstrap.Offcanvas.getInstance(document.getElementById('orderDetailSheet')).hide();
                    loadStats(); loadOrders();
                },
                error: function(xhr) { HMS.ajaxError(xhr, 'Failed'); }
            });
        });
    });

    /* ── Remove item (Pending only) — client-side strikethrough ─────────── */
    $(document).on('click', '.btn-remove-item', function() {
        if (!currentOrderData || currentOrderData.status !== 'Pending') return;
        var idx = $(this).data('idx');
        if (!currentOrderData.items[idx]) return;
        currentOrderData.items[idx]._removed = true;
        _saveItemPatch();
        _rerenderItems();
    });

    /* ── Alternative item (Pending only) — ask name, strikethrough + add ── */
    var _pendingAltIdx = null;
    /* ── Alternative medicine — inventory search ────────────────────────── */
    var _pendingAltMed   = null;   /* selected inventory medicine object    */
    var _altMedSearchTmr = null;   /* debounce timer                        */

    function _altMedReset() {
        $('#altMedSearch').val('');
        $('#altMedDropdown').hide().empty();
        $('#altMedInfo').hide();
        $('#altMedError').hide();
        _pendingAltMed = null;
    }

    function _altMedSelectMed(med) {
        _pendingAltMed = med;
        $('#altMedSearch').val(med.name);
        $('#altMedDropdown').hide().empty();
        /* populate info panel */
        var statusColor = med.stockStatus === 'In Stock' ? '#16a34a' : (med.stockStatus === 'Low Stock' ? '#f97316' : '#ef4444');
        $('#altMedInfoName').text(med.name + (med.genericName ? ' (' + med.genericName + ')' : '') + (med.form ? ' — ' + med.form : ''));
        $('#altMedInfoStock').text((med.currentStock || 0) + ' ' + (med.stockUnit || 'units'));
        $('#altMedInfoPrice').text('PKR ' + (med.sellingPrice ? med.sellingPrice.toLocaleString('en-PK') : '0'));
        $('#altMedInfoStatus').html('<span style="padding:1px 8px;border-radius:4px;font-weight:700;font-size:11px;background:' + statusColor + '1a;color:' + statusColor + '">' + (med.stockStatus || '') + '</span>');
        $('#altMedInfo').show();
    }

    function _altMedSearch(query) {
        var $dd = $('#altMedDropdown');
        if (!query) { $dd.hide().empty(); return; }
        $dd.html('<div style="padding:10px 14px;font-size:12px;color:var(--color-muted-foreground)">Searching...</div>').show();
        $.get('/api/inventory/medicines', { search: query }, function(data) {
            var list = Array.isArray(data) ? data : (data.data || []);
            $dd.empty();
            if (!list.length) {
                $dd.html('<div style="padding:10px 14px;font-size:12px;color:var(--color-muted-foreground)">No medicines found.</div>');
                return;
            }
            list.slice(0, 30).forEach(function(med) {
                var stockColor = med.stockStatus === 'In Stock' ? '#16a34a' : (med.stockStatus === 'Low Stock' ? '#f97316' : '#ef4444');
                var $item = $('<div>').css({
                    padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                    fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'
                }).html(
                    '<div>' +
                        '<div style="font-weight:600;color:var(--color-foreground)">' + esc(med.name) + '</div>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:2px">' + esc(med.genericName || '') + (med.form ? ' &bull; ' + esc(med.form) : '') + '</div>' +
                    '</div>' +
                    '<div style="text-align:right;flex-shrink:0">' +
                        '<div style="font-size:11px;font-weight:700;color:' + stockColor + '">' + esc(med.stockStatus || '') + '</div>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground)">PKR ' + (med.sellingPrice || 0).toLocaleString('en-PK') + '</div>' +
                    '</div>'
                ).on('mousedown', function(e) { e.preventDefault(); })
                 .on('click', function() { _altMedSelectMed(med); });
                $item.hover(function() { $(this).css('background', '#f8fafc'); }, function() { $(this).css('background', ''); });
                $dd.append($item);
            });
        }).fail(function() {
            $dd.html('<div style="padding:10px 14px;font-size:12px;color:#ef4444">Failed to load medicines.</div>');
        });
    }

    /* open modal */
    $(document).on('click', '.btn-alt-item', function() {
        if (!currentOrderData || currentOrderData.status !== 'Pending') return;
        _pendingAltIdx = $(this).data('idx');
        var origName   = $(this).data('name');
        var qty        = $(this).data('qty');
        _altMedReset();
        $('#altMedOriginal').text('Replacing: ' + origName + ' (Qty: ' + qty + ')');
        var modal = new bootstrap.Modal(document.getElementById('altMedModal'));
        modal.show();
        setTimeout(function() { $('#altMedSearch').focus(); }, 400);
        lucide.createIcons();
    });

    /* live search with debounce */
    $('#altMedSearch').on('input', function() {
        var q = $(this).val().trim();
        _pendingAltMed = null;
        $('#altMedInfo').hide();
        clearTimeout(_altMedSearchTmr);
        if (q.length < 2) { $('#altMedDropdown').hide().empty(); return; }
        _altMedSearchTmr = setTimeout(function() { _altMedSearch(q); }, 280);
    }).on('blur', function() {
        setTimeout(function() { $('#altMedDropdown').hide(); }, 200);
    }).on('focus', function() {
        if ($(this).val().trim().length >= 2 && !_pendingAltMed) {
            $('#altMedDropdown').show();
        }
    });

    /* confirm selection */
    $('#altMedConfirmBtn').on('click', function() {
        if (!_pendingAltMed) { $('#altMedError').show(); return; }
        $('#altMedError').hide();
        bootstrap.Modal.getInstance(document.getElementById('altMedModal')).hide();
        $('#altMedModal').one('hidden.bs.modal', function() {
            if (_pendingAltIdx === null || !currentOrderData || !_pendingAltMed) return;
            var orig = currentOrderData.items[_pendingAltIdx];
            var qty  = orig.totalQty || orig.qty || 0;
            /* mark original as replaced */
            currentOrderData.items[_pendingAltIdx]._removed = true;
            /* build alternative item with live inventory data */
            var altItem = {
                name:          _pendingAltMed.name,
                generic:       _pendingAltMed.genericName || '',
                form:          _pendingAltMed.form || orig.form || '',
                dose:          orig.dose,
                frequency:     orig.frequency,
                duration:      orig.duration,
                totalQty:      qty,
                qty:           qty,
                unitPrice:     _pendingAltMed.sellingPrice || 0,
                total:         (_pendingAltMed.sellingPrice || 0) * qty,
                inStock:       _pendingAltMed.stockStatus === 'In Stock' || _pendingAltMed.stockStatus === 'Low Stock',
                stockAvailable:_pendingAltMed.currentStock || 0,
                livePrice:     true,
                _isAlt:        true,
                _removed:      false
            };
            currentOrderData.items.splice(_pendingAltIdx + 1, 0, altItem);
            _pendingAltIdx  = null;
            _pendingAltMed  = null;
            _saveItemPatch();
            _rerenderItems();
        });
    });

    function _saveItemPatch() {
        if (currentOrderId && currentOrderData && currentOrderData.status === 'Pending') {
            /* deep-clone the items array so later API refreshes don't mutate it */
            _orderItemPatches[currentOrderId] = JSON.parse(JSON.stringify(currentOrderData.items));
        }
    }

    /**
     * If the current Pending order has unsaved client-side edits, push them to
     * the backend first, then run `callback`. If no patch exists, runs callback
     * immediately. On failure shows an alert and does NOT proceed.
     */
    function _flushPatch(callback) {
        var orderId = currentOrderId;
        if (!orderId || !_orderItemPatches[orderId]) { callback(); return; }

        /* build effective items: exclude removed, strip client-only flags */
        var effectiveItems = _orderItemPatches[orderId]
            .filter(function(item) { return !item._removed; })
            .map(function(item) {
                var clean = $.extend({}, item);
                delete clean._removed;
                delete clean._isAlt;
                return clean;
            });

        $.ajax({
            url: '/api/medication-orders/update-items',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ orderId: orderId, items: effectiveItems }),
            success: function() {
                delete _orderItemPatches[orderId];   /* patch now persisted, clear cache */
                callback();
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed to save item changes');
            }
        });
    }

    function _rerenderItems() {
        if (!currentOrderData) return;
        var order = currentOrderData;
        var isPending = order.status === 'Pending';
        var itemsHtml = '<div class="phar-items-section" style="margin-bottom:20px"><div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Medication Order Details</div>';
        if (order.items && order.items.length > 0) {
            order.items.forEach(function(item, idx) {
                var isRemoved = item._removed;
                var isAlt     = item._isAlt;
                var nameStyle = isRemoved ? 'text-decoration:line-through;color:#9ca3af;font-size:14px;font-weight:700;margin-bottom:6px' : 'font-size:14px;font-weight:700;margin-bottom:6px';
                var cardStyle = 'padding:14px 16px;border:1px solid var(--color-border);border-radius:10px;margin-bottom:10px;background:' + (isRemoved ? '#f9fafb' : (isAlt ? '#f0fdf4' : '#fff'));
                var stockIcon = item.inStock
                    ? '<span style="color:#22c55e">&#10003; Available (' + item.stockAvailable + ')</span>'
                    : '<span style="color:#ef4444">&#10007; Low Stock (' + item.stockAvailable + ')</span>';
                var altBadge  = isAlt ? ' <span style="font-size:10px;padding:1px 7px;background:#dcfce7;color:#16a34a;border-radius:4px;font-weight:700;vertical-align:middle">ALTERNATIVE</span>' : '';
                var removedNote = isRemoved ? '<div style="font-size:11px;color:#ef4444;margin-top:4px">&#10007; Removed</div>' : '';
                var btnHtml = '';
                if (isPending && !isRemoved) {
                    btnHtml = '<div style="display:flex;gap:6px;margin-top:10px">' +
                        '<button class="btn-remove-item" data-idx="' + idx + '" style="padding:3px 10px;background:#ef4444;border:none;border-radius:5px;font-size:11px;font-weight:600;color:#fff;cursor:pointer">&#10007; Remove</button>' +
                        (!isAlt ? '<button class="btn-alt-item" data-idx="' + idx + '" data-name="' + esc(item.name) + '" data-qty="' + esc((item.totalQty || item.qty) + '') + '" style="padding:3px 10px;background:var(--color-background);border:1px solid var(--color-border);border-radius:5px;font-size:11px;font-weight:500;cursor:pointer">Alternative</button>' : '') +
                    '</div>';
                }
                itemsHtml +=
                    '<div style="' + cardStyle + '">' +
                        '<div style="' + nameStyle + '">' + esc(item.name) + altBadge + (item.generic ? ' <span style="font-size:12px;font-weight:400;color:var(--color-muted-foreground)">(' + esc(item.generic) + ')</span>' : '') + '</div>' +
                        removedNote +
                        (!isRemoved ? (
                            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:var(--color-muted-foreground)">' +
                                '<div>Dose: <strong style="color:var(--color-foreground)">' + esc(item.dose) + '</strong> | Frequency: <strong style="color:var(--color-foreground)">' + esc(item.frequency) + '</strong></div>' +
                                '<div>Duration: <strong style="color:var(--color-foreground)">' + esc(item.duration) + '</strong> | Total: <strong style="color:var(--color-foreground)">' + (item.totalQty || item.qty) + ' ' + esc(item.form || 'units') + '</strong></div>' +
                            '</div>' +
                            '<div style="margin-top:8px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:12px"><span style="color:var(--color-muted-foreground)">Stock: ' + stockIcon + '</span>' + (item.livePrice ? '<span style="padding:2px 7px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;color:#16a34a;font-weight:600;font-size:11px">&#9679; Live Price</span>' : '') + '</div>' +
                            '<div style="margin-top:6px;padding:8px 10px;background:var(--color-background);border-radius:6px;border:1px solid var(--color-border);font-size:12px;display:flex;gap:16px">' +
                                '<span>Unit Price: <strong style="font-family:monospace">' + fmt(item.unitPrice) + '</strong></span>' +
                                '<span>Qty: <strong>' + (item.totalQty || item.qty) + '</strong></span>' +
                                '<span>Subtotal: <strong style="font-family:monospace;color:#003366">' + fmt(item.total) + '</strong></span>' +
                            '</div>'
                        ) : '') +
                        btnHtml +
                    '</div>';
            });
        }
        itemsHtml += '</div>';
        $('#orderDetailBody .phar-items-section').replaceWith(itemsHtml);
        lucide.createIcons();
    }

    $(document).on('click', '.btn-print-order', function() { window.print(); });

    /* ── Custom date-picker & searchable-select widgets (self-contained) ─── */
    (function() {
        var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        var DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

        function closeAll() {
            document.querySelectorAll('.opd-dp-popup.open').forEach(function(p) { p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open'); });
            document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) { p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open'); });
        }
        document.addEventListener('click', closeAll);

        function repositionOpen() {
            document.querySelectorAll('.opd-dp-popup.open, .opd-cs-popup.open').forEach(function(p) {
                if (!p._trigger) return;
                var r = p._trigger.getBoundingClientRect();
                p.style.top = (r.bottom + 6) + 'px'; p.style.left = r.left + 'px';
            });
        }
        window.addEventListener('scroll', repositionOpen, true);
        window.addEventListener('resize', repositionOpen);

        function initDp(wrapId) {
            var wrap = document.getElementById(wrapId); if (!wrap) return;
            var hiddenId = wrap.dataset.target, ph = wrap.dataset.placeholder || 'Select date';
            var trigger = wrap.querySelector('.opd-dp-trigger'), valEl = wrap.querySelector('.opd-dp-val');
            var popup   = wrap.querySelector('.opd-dp-popup'), hidden = document.getElementById(hiddenId);
            var selDate = null, viewYear = new Date().getFullYear(), viewMonth = new Date().getMonth();
            function render() {
                var firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
                var dim = new Date(viewYear, viewMonth + 1, 0).getDate();
                var h = '<div class="opd-dp-header"><button class="opd-dp-nav" data-a="p">&#8249;</button><span class="opd-dp-month-year">' + MONTHS[viewMonth] + ' ' + viewYear + '</span><button class="opd-dp-nav" data-a="n">&#8250;</button></div><div class="opd-dp-grid">';
                DAYS.forEach(function(d) { h += '<div class="opd-dp-dayname">' + d + '</div>'; });
                for (var i = 0; i < firstDow; i++) h += '<div class="opd-dp-day empty"></div>';
                for (var d = 1; d <= dim; d++) { var cur = new Date(viewYear, viewMonth, d); var cls = 'opd-dp-day' + (selDate && cur.toDateString() === selDate.toDateString() ? ' selected' : ''); h += '<div class="' + cls + '" data-d="' + d + '">' + d + '</div>'; }
                h += '</div>'; popup.innerHTML = h;
                popup.querySelectorAll('.opd-dp-nav').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); if (this.dataset.a === 'p') { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } } else { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } } render(); }); });
                popup.querySelectorAll('.opd-dp-day:not(.empty)').forEach(function(el) { el.addEventListener('click', function(e) { e.stopPropagation(); selDate = new Date(viewYear, viewMonth, parseInt(this.dataset.d)); var dd = String(selDate.getDate()).padStart(2,'0'), mm = String(selDate.getMonth()+1).padStart(2,'0'), yyyy = selDate.getFullYear(); valEl.textContent = dd + '/' + mm + '/' + yyyy; valEl.classList.remove('opd-ph'); if (hidden) hidden.value = yyyy + '-' + mm + '-' + dd; closeAll(); }); });
            }
            trigger.addEventListener('click', function(e) { e.stopPropagation(); var isOpen = popup.classList.contains('open'); closeAll(); if (!isOpen) { var rect = trigger.getBoundingClientRect(); popup.style.top = (rect.bottom + 6) + 'px'; popup.style.left = rect.left + 'px'; popup._trigger = trigger; if (popup.parentNode !== document.body) document.body.appendChild(popup); render(); popup.classList.add('open'); trigger.classList.add('open'); } });
            wrap._reset = function() { selDate = null; viewYear = new Date().getFullYear(); viewMonth = new Date().getMonth(); valEl.textContent = ph; valEl.classList.add('opd-ph'); if (hidden) hidden.value = ''; };
        }

        function initCs(wrapId) {
            var wrap = document.getElementById(wrapId); if (!wrap) return;
            var hiddenId = wrap.dataset.target, ph = wrap.dataset.placeholder || 'Select...';
            var trigger = wrap.querySelector('.opd-cs-trigger'), valEl = wrap.querySelector('.opd-cs-val');
            var popup   = wrap.querySelector('.opd-cs-popup'), search = wrap.querySelector('.opd-cs-search');
            var list    = wrap.querySelector('.opd-cs-list'),  hidden = document.getElementById(hiddenId);
            var options = [], selVal = '';
            if (valEl) { valEl.textContent = ph; valEl.classList.add('opd-ph'); }
            function renderList(q) {
                q = (q || '').toLowerCase();
                var filtered = q ? options.filter(function(o) { return o.toLowerCase().indexOf(q) > -1; }) : options;
                if (!filtered.length) { list.innerHTML = '<div style="padding:12px 14px;font-size:13px;color:#94a3b8;text-align:center">No options</div>'; return; }
                list.innerHTML = filtered.map(function(o) { return '<div class="opd-cs-opt' + (o === selVal ? ' selected' : '') + '" data-v="' + o.replace(/"/g,'&quot;') + '">' + o + '</div>'; }).join('');
                list.querySelectorAll('.opd-cs-opt').forEach(function(el) { el.addEventListener('click', function(e) { e.stopPropagation(); selVal = this.dataset.v; valEl.textContent = selVal; valEl.classList.remove('opd-ph'); if (hidden) hidden.value = selVal; closeAll(); }); });
            }
            trigger.addEventListener('click', function(e) { e.stopPropagation(); var isOpen = popup.classList.contains('open'); closeAll(); if (!isOpen) { var rect = trigger.getBoundingClientRect(); popup.style.top = (rect.bottom + 6) + 'px'; popup.style.left = rect.left + 'px'; popup.style.width = rect.width + 'px'; popup._trigger = trigger; if (popup.parentNode !== document.body) document.body.appendChild(popup); popup.classList.add('open'); trigger.classList.add('open'); search.value = ''; renderList(''); setTimeout(function() { search.focus(); }, 40); } });
            search.addEventListener('input', function(e) { e.stopPropagation(); renderList(this.value); });
            search.addEventListener('click', function(e) { e.stopPropagation(); });
            popup.addEventListener('click', function(e) { e.stopPropagation(); });
            wrap.setOptions = function(opts) { options = opts || []; };
            wrap._reset = function() { selVal = ''; valEl.textContent = ph; valEl.classList.add('opd-ph'); if (hidden) hidden.value = ''; };
        }

        /* Init all pharmacy filter widgets */
        $(function() {
            ['pharDpDateFrom','pharDpDateTo'].forEach(initDp);
            ['pharCsPatient','pharCsDoctor'].forEach(initCs);
        });
    })();

});
