$(document).ready(function () {
    let currentFilters = { status: '', department: '', priority: '', category: '', dateRange: '', criticalOnly: false, search: '' };
    let ordersData = [];

    function loadStats() {
        $.get('/api/lab/orders/stats', function (data) {
            $('#statPending').text(data.pending);
            $('#statSamplePending').text(data.samplePending);
            $('#statInProgress').text(data.inProgress);
            $('#statResultsReady').text(data.resultsReady);
            $('#statCompletedToday').text(data.completedToday);
            lucide.createIcons();
        });
    }

    function loadOrders() {
        let params = {};
        if (currentFilters.status) params.status = currentFilters.status;
        if (currentFilters.department) params.department = currentFilters.department;
        if (currentFilters.priority) params.priority = currentFilters.priority;
        if (currentFilters.category) params.category = currentFilters.category;
        if (currentFilters.dateRange) params.dateRange = currentFilters.dateRange;
        if (currentFilters.criticalOnly) params.criticalOnly = 'true';
        if (currentFilters.search) params.search = currentFilters.search;

        $('#ordersTableBody').html('<tr><td colspan="11" style="padding:40px;text-align:center;color:var(--color-muted-foreground)"><i data-lucide="loader" style="width:20px;height:20px"></i> Loading orders...</td></tr>');
        lucide.createIcons();

        $.get('/api/lab/orders', params, function (data) {
            ordersData = data;
            renderOrders(data);
        });
    }

    function getStatusBadge(status) {
        const colors = {
            'Pending': { bg: '#fef3c7', color: '#92400e', label: 'PENDING' },
            'Collected': { bg: '#dbeafe', color: '#1e40af', label: 'COLLECTED' },
            'In Progress': { bg: '#ede9fe', color: '#6d28d9', label: 'IN PROGRESS' },
            'Ready': { bg: '#dcfce7', color: '#166534', label: 'READY' },
            'Verified': { bg: '#ccfbf1', color: '#115e59', label: 'VERIFIED' },
            'Reported': { bg: '#f3f4f6', color: '#374151', label: 'REPORTED' },
            'Completed': { bg: '#f3f4f6', color: '#374151', label: 'COMPLETED' },
            'Rejected': { bg: '#fee2e2', color: '#991b1b', label: 'REJECTED' },
            'Cancelled': { bg: '#fee2e2', color: '#991b1b', label: 'CANCELLED' },
        };
        const c = colors[status] || { bg: '#f3f4f6', color: '#374151', label: status };
        return `<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;background:${c.bg};color:${c.color}">${c.label}</span>`;
    }

    function getPriorityBadge(priority) {
        if (priority === 'STAT') return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;background:#fee2e2;color:#dc2626" class="priority-stat-pulse">● STAT</span>';
        if (priority === 'Urgent') return '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;background:#ffedd5;color:#ea580c">URGENT</span>';
        return '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;background:#dcfce7;color:#16a34a">ROUTINE</span>';
    }

    function getDeptBadge(dept) {
        const icons = { 'OPD': 'stethoscope', 'IPD': 'bed-double', 'Emergency': 'siren', 'OT': 'scissors', 'Walk-in': 'footprints' };
        const icon = icons[dept] || 'building';
        return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:8px;font-size:11px;font-weight:500;background:rgba(0,51,102,0.06);color:var(--midnight-blue)"><i data-lucide="${icon}" style="width:12px;height:12px"></i> ${dept}</span>`;
    }

    function getSampleIcon(types) {
        const icons = [];
        types.forEach(t => {
            const tl = t.toLowerCase();
            if (tl.includes('blood') || tl.includes('edta') || tl.includes('serum') || tl.includes('citrate')) icons.push({ icon: 'droplets', label: 'Blood', color: '#dc2626' });
            else if (tl.includes('urine')) icons.push({ icon: 'beaker', label: 'Urine', color: '#eab308' });
            else if (tl.includes('swab')) icons.push({ icon: 'wind', label: 'Swab', color: '#8b5cf6' });
            else if (tl.includes('sputum')) icons.push({ icon: 'cloud', label: 'Sputum', color: '#6b7280' });
            else if (tl.includes('stool')) icons.push({ icon: 'package', label: 'Stool', color: '#92400e' });
            else icons.push({ icon: 'flask-conical', label: t, color: '#3b82f6' });
        });
        const unique = [];
        const seen = new Set();
        icons.forEach(i => { if (!seen.has(i.label)) { seen.add(i.label); unique.push(i); } });
        return unique.map(i => `<span class="sample-icon"><i data-lucide="${i.icon}" style="width:11px;height:11px;color:${i.color}"></i>${i.label}</span>`).join(' ');
    }

    function getSampleStatusBadge(status) {
        if (status === 'Collected') return '<span style="color:#16a34a;font-size:11px;font-weight:500">✓ Collected</span>';
        if (status === 'Rejected') return '<span style="color:#dc2626;font-size:11px;font-weight:500">✕ Rejected</span>';
        return '<span style="color:#f97316;font-size:11px;font-weight:500">○ Not Collected</span>';
    }

    function formatTat(order) {
        let barColor = '#22c55e';
        if (order.tatPercent > 75) barColor = '#f97316';
        if (order.tatExceeded) barColor = '#ef4444';

        let remaining = '';
        if (order.tatExceeded) {
            remaining = '<span style="color:#ef4444;font-size:10px;font-weight:600">⚠ EXCEEDED</span>';
        } else {
            const mins = order.tatRemaining;
            if (mins < 60) remaining = `<span style="font-size:10px;color:var(--color-muted-foreground)">${mins}m left</span>`;
            else remaining = `<span style="font-size:10px;color:var(--color-muted-foreground)">${Math.floor(mins / 60)}h ${mins % 60}m</span>`;
        }

        return `<div style="min-width:80px">
            <div class="tat-bar"><div class="tat-bar-fill" style="width:${Math.min(order.tatPercent, 100)}%;background:${barColor}"></div></div>
            <div style="margin-top:3px">${remaining}</div>
        </div>`;
    }

    function renderOrders(orders) {
        if (!orders.length) {
            $('#ordersTableBody').html('<tr><td colspan="11" style="padding:60px;text-align:center;color:var(--color-muted-foreground)"><i data-lucide="inbox" style="width:40px;height:40px;margin-bottom:8px;opacity:0.3"></i><br>No orders found matching your filters</td></tr>');
            lucide.createIcons();
            return;
        }

        let html = '';
        orders.forEach(o => {
            const borderClass = o.priority === 'STAT' ? 'priority-border-stat' : o.priority === 'Urgent' ? 'priority-border-urgent' : 'priority-border-routine';
            const exceededClass = o.tatExceeded ? 'tat-exceeded' : '';
            const criticalIcon = o.criticalFlag ? '<i data-lucide="alert-triangle" style="width:14px;height:14px;color:#ef4444" title="Critical"></i>' : '';

            const testDisplay = o.testsCount <= 2
                ? o.testNames.map(n => `<div style="font-size:11px;line-height:1.4">${n}</div>`).join('')
                : `<div style="font-size:12px;font-weight:500">${o.testsCount} tests</div><div style="font-size:10px;color:var(--color-muted-foreground)">${o.categories.join(', ')}</div>`;

            html += `<tr class="lab-order-row ${borderClass} ${exceededClass}" data-order-id="${o.orderId}" style="border-bottom:1px solid var(--color-border)">
                <td style="padding:10px 14px">
                    <div style="display:flex;align-items:center;gap:6px">
                        <span style="font-weight:600;color:var(--midnight-blue);font-size:12px">${o.orderId}</span>
                        ${criticalIcon}
                    </div>
                </td>
                <td style="padding:10px 14px">
                    <div style="font-size:12px">${o.ageLabel}</div>
                </td>
                <td style="padding:10px 14px">
                    <div style="font-weight:500">${o.patientName}</div>
                    <div style="font-size:11px;color:var(--color-muted-foreground)">${o.mrn}${o.visitNumber ? ' | ' + o.visitNumber : ''}</div>
                </td>
                <td style="padding:10px 14px">
                    ${getDeptBadge(o.sourceDepartment)}
                    ${o.ward ? `<div style="font-size:10px;color:var(--color-muted-foreground);margin-top:2px">${o.ward}${o.bed ? ', ' + o.bed : ''}</div>` : ''}
                </td>
                <td style="padding:10px 14px">${getPriorityBadge(o.priority)}</td>
                <td style="padding:10px 14px">${testDisplay}</td>
                <td style="padding:10px 14px">
                    <div style="margin-bottom:3px">${getSampleIcon(o.sampleTypes)}</div>
                    ${getSampleStatusBadge(o.sampleStatus)}
                </td>
                <td style="padding:10px 14px">${formatTat(o)}</td>
                <td style="padding:10px 14px">
                    <div style="font-size:12px">${o.orderedBy}</div>
                </td>
                <td style="padding:10px 14px">${getStatusBadge(o.status)}</td>
                <td style="padding:10px 14px;text-align:center">
                    <div style="display:flex;gap:4px;justify-content:center">
                        ${o.sampleStatus === 'Not Collected' && o.status === 'Pending' ? `<button class="btn-action-collect" data-id="${o.orderId}" title="Collect Sample" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:6px;background:#fff;cursor:pointer;font-size:11px" onclick="event.stopPropagation()"><i data-lucide="test-tube" style="width:13px;height:13px;color:#f97316"></i></button>` : ''}
                        <button class="btn-action-view" data-id="${o.orderId}" title="View Details" style="padding:4px 8px;border:1px solid var(--color-border);border-radius:6px;background:#fff;cursor:pointer;font-size:11px" onclick="event.stopPropagation()"><i data-lucide="eye" style="width:13px;height:13px;color:#3b82f6"></i></button>
                    </div>
                </td>
            </tr>`;
        });

        $('#ordersTableBody').html(html);
        lucide.createIcons();
    }

    function openOrderDetail(orderId) {
        $('#detailBody').html('<div style="padding:40px;text-align:center;color:var(--color-muted-foreground)">Loading order details...</div>');
        $('#detailFooter').html('');
        const panel = new bootstrap.Offcanvas(document.getElementById('orderDetailPanel'));
        panel.show();

        $.get(`/api/lab/orders/${orderId}`, function (d) {
            $('#detailOrderId').text(d.orderId);
            $('#detailPriorityBadge').html(getPriorityBadge(d.priority));
            $('#detailStatusBadge').html(getStatusBadge(d.status));

            let tatInfo = '';
            if (d.tatExceeded) tatInfo = `<span style="color:#fca5a5">⚠ TAT Exceeded (${d.tatMinutes}min limit)</span>`;
            else tatInfo = `TAT: ${d.tatRemaining}min remaining of ${d.tatMinutes}min`;
            $('#detailTatInfo').html(tatInfo);

            let html = '';

            html += `<div style="padding:16px 20px;background:rgba(0,51,102,0.03);border-bottom:1px solid var(--color-border)">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
                    <div style="width:44px;height:44px;border-radius:50%;background:var(--aqua-mint);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--midnight-blue);font-size:16px">
                        ${d.patientName.split(' ').map(w => w[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                        <div style="font-weight:600;font-size:15px">${d.patientName}</div>
                        <div style="font-size:12px;color:var(--color-muted-foreground)">${d.patientAge}${d.patientGender ? '/' + d.patientGender : ''} • ${d.mrn} • ${d.visitNumber || ''}</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
                    <div><span style="color:var(--color-muted-foreground)">Location:</span> ${d.patientLocation || d.sourceDepartment}${d.ward ? ', ' + d.ward : ''}${d.bed ? ', ' + d.bed : ''}</div>
                    <div><span style="color:var(--color-muted-foreground)">Source:</span> ${getDeptBadge(d.sourceDepartment)}</div>
                    ${d.diagnosis ? `<div style="grid-column:1/-1"><span style="color:var(--color-muted-foreground)">Diagnosis:</span> ${d.diagnosis}</div>` : ''}
                    ${d.fastingRequired ? `<div><span style="color:var(--color-muted-foreground)">Fasting:</span> ${d.fastingCompliant ? '<span style="color:#16a34a">✓ Compliant</span>' : '<span style="color:#ef4444">✕ Not confirmed</span>'}</div>` : ''}
                </div>
            </div>`;

            html += `<div style="padding:16px 20px;border-bottom:1px solid var(--color-border)">
                <h6 style="font-size:13px;font-weight:700;color:var(--color-foreground);margin:0 0 6px;font-family:'Roobert',sans-serif;display:flex;align-items:center;gap:6px"><i data-lucide="user" style="width:14px;height:14px"></i> Patient Context</h6>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
                    <div>
                        <div style="color:var(--color-muted-foreground);margin-bottom:2px">Clinical Indication</div>
                        <div>${d.clinicalIndication || 'Not specified'}</div>
                    </div>
                    <div>
                        <div style="color:var(--color-muted-foreground);margin-bottom:2px">Allergies</div>
                        <div>${d.allergies && d.allergies.length ? d.allergies.map(a => `<span style="padding:2px 8px;border-radius:10px;background:#fee2e2;color:#991b1b;font-size:11px">${a}</span>`).join(' ') : '<span style="color:var(--color-muted-foreground)">None known</span>'}</div>
                    </div>
                    ${d.relevantHistory && d.relevantHistory.length ? `<div style="grid-column:1/-1">
                        <div style="color:var(--color-muted-foreground);margin-bottom:2px">Relevant History</div>
                        <div>${d.relevantHistory.map(h => `<span style="display:inline-block;padding:2px 8px;border-radius:10px;background:rgba(0,0,0,0.04);font-size:11px;margin:1px 2px">${h}</span>`).join('')}</div>
                    </div>` : ''}
                    ${d.drugHistory && d.drugHistory.length ? `<div style="grid-column:1/-1">
                        <div style="color:var(--color-muted-foreground);margin-bottom:2px">Current Medications</div>
                        <div>${d.drugHistory.map(m => `<span style="display:inline-block;padding:2px 8px;border-radius:10px;background:rgba(59,130,246,0.08);font-size:11px;margin:1px 2px">${m}</span>`).join('')}</div>
                    </div>` : ''}
                </div>
            </div>`;

            html += `<div style="padding:16px 20px;border-bottom:1px solid var(--color-border)">
                <h6 style="font-size:13px;font-weight:700;color:var(--color-foreground);margin:0 0 12px;font-family:'Roobert',sans-serif;display:flex;align-items:center;gap:6px"><i data-lucide="test-tubes" style="width:14px;height:14px"></i> Tests Ordered (${d.tests.length})</h6>`;

            d.tests.forEach(t => {
                const statusSteps = buildTestStatusSteps(t);
                html += `<div class="test-card">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                        <div>
                            <div style="font-weight:600;font-size:13px">${t.testName}</div>
                            <div style="font-size:11px;color:var(--color-muted-foreground)">Dept: ${t.category} • Code: ${t.testCode || '-'}</div>
                        </div>
                        ${getStatusBadge(t.status)}
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin-bottom:8px;padding:8px;background:rgba(0,0,0,0.02);border-radius:6px">
                        <div><span style="color:var(--color-muted-foreground)">Sample:</span> ${t.specimenType}</div>
                        <div><span style="color:var(--color-muted-foreground)">Container:</span> ${t.containerType || '-'}</div>
                        <div><span style="color:var(--color-muted-foreground)">Volume:</span> ${t.volume || '-'}</div>
                        <div><span style="color:var(--color-muted-foreground)">Fasting:</span> ${t.fastingRequired ? '<span style="color:#ef4444">Required</span>' : 'Not required'}</div>
                        ${t.storageTemp ? `<div><span style="color:var(--color-muted-foreground)">Storage:</span> ${t.storageTemp}</div>` : ''}
                        ${t.transportMedium ? `<div><span style="color:var(--color-muted-foreground)">Transport:</span> ${t.transportMedium}</div>` : ''}
                        ${t.stability ? `<div><span style="color:var(--color-muted-foreground)">Stability:</span> ${t.stability}</div>` : ''}
                        ${t.specialInstructions ? `<div style="grid-column:1/-1"><span style="color:var(--color-muted-foreground)">Instructions:</span> <span style="color:#ea580c">${t.specialInstructions}</span></div>` : ''}
                    </div>
                    <div style="padding-left:4px">${statusSteps}</div>
                </div>`;
            });

            html += '</div>';

            if (d.clinicalNotes) {
                html += `<div style="padding:16px 20px;border-bottom:1px solid var(--color-border)">
                    <h6 style="font-size:13px;font-weight:700;color:var(--color-foreground);margin:0 0 6px;font-family:'Roobert',sans-serif;display:flex;align-items:center;gap:6px"><i data-lucide="file-text" style="width:14px;height:14px"></i> Clinical Information</h6>
                    <p style="font-size:12px;color:var(--color-foreground);margin:0">${d.clinicalNotes}</p>
                </div>`;
            }

            $('#detailBody').html(html);
            lucide.createIcons();

            let footer = '';
            footer += `<button style="padding:10px 16px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff;cursor:pointer;display:flex;align-items:center;gap:6px"><i data-lucide="printer" style="width:15px;height:15px"></i> Print Labels</button>`;
            footer += `<button style="padding:10px 16px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:#fff;cursor:pointer;display:flex;align-items:center;gap:6px"><i data-lucide="file-text" style="width:15px;height:15px"></i> Requisition</button>`;

            if (!['Completed', 'Reported', 'Cancelled', 'Rejected'].includes(d.status)) {
                footer += `<button class="btn-cancel-order" data-id="${d.orderId}" style="padding:10px 16px;border:1px solid #fca5a5;border-radius:8px;font-size:13px;background:#fff;color:#dc2626;cursor:pointer;display:flex;align-items:center;gap:6px"><i data-lucide="x-circle" style="width:15px;height:15px"></i> Cancel</button>`;
            }

            $('#detailFooter').html(footer);
            lucide.createIcons();
        });
    }

    function buildTestStatusSteps(test) {
        const steps = [
            { label: 'Pending Collection', key: 'Pending' },
            { label: 'Sample Collected', key: 'Collected', time: test.collectedAt },
            { label: 'In Progress (Analyzer)', key: 'In Progress' },
            { label: 'Results Entered', key: 'Ready', time: test.resultEnteredAt, by: test.resultEnteredBy },
            { label: 'Verified by Pathologist', key: 'Verified', time: test.verifiedAt, by: test.verifiedBy },
        ];

        const statusOrder = ['Pending', 'Collected', 'In Progress', 'Ready', 'Verified', 'Reported', 'Completed'];
        const currentIdx = statusOrder.indexOf(test.status);

        let html = '';
        steps.forEach((step, i) => {
            const stepIdx = statusOrder.indexOf(step.key);
            let dotClass = '';
            if (stepIdx < currentIdx) dotClass = 'completed';
            else if (stepIdx === currentIdx) dotClass = 'current';

            const timeStr = step.time ? ` <span style="color:var(--color-muted-foreground);font-size:11px">(${formatDateTime(step.time)})</span>` : '';
            const byStr = step.by ? ` <span style="color:var(--color-muted-foreground);font-size:11px">- ${step.by}</span>` : '';

            html += `<div class="test-status-step">
                <div class="step-dot ${dotClass}"></div>
                <span>${step.label}${timeStr}${byStr}</span>
            </div>`;
        });
        return html;
    }

    function formatDateTime(dt) {
        if (!dt) return '';
        const d = new Date(dt);
        const hours = d.getHours();
        const mins = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h = hours % 12 || 12;
        return `${h}:${mins} ${ampm}`;
    }

    $('#btnToggleFilters').on('click', function () {
        $('#filterPanel').slideToggle(200);
    });

    $('#btnRefresh').on('click', function () {
        loadStats();
        loadOrders();
    });

    $('#statusChips').on('click', '.filter-chip', function () {
        $('#statusChips .filter-chip').removeClass('active');
        $(this).addClass('active');
        currentFilters.status = $(this).data('value');
    });

    $(document).on('click', '.priority-chip', function () {
        $('.priority-chip').removeClass('active');
        $(this).addClass('active');
        currentFilters.priority = $(this).data('value');
    });

    $('#btnApplyFilters').on('click', function () {
        currentFilters.department = $('#filterDept').val();
        currentFilters.category = $('#filterCategory').val();
        currentFilters.dateRange = $('#filterDate').val();
        currentFilters.criticalOnly = $('#filterCritical').is(':checked');
        loadOrders();
    });

    $('#btnClearFilters').on('click', function () {
        currentFilters = { status: '', department: '', priority: '', category: '', dateRange: '', criticalOnly: false, search: '' };
        $('#statusChips .filter-chip').removeClass('active').first().addClass('active');
        $('.priority-chip').removeClass('active').first().addClass('active');
        $('#filterDept').val('');
        $('#filterCategory').val('');
        $('#filterDate').val('');
        $('#filterCritical').prop('checked', false);
        $('#labSearch').val('');
        loadOrders();
    });

    let searchTimer;
    $('#labSearch').on('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            currentFilters.search = $(this).val().trim();
            loadOrders();
        }, 400);
    });

    $(document).on('click', '.lab-order-row', function () {
        openOrderDetail($(this).data('order-id'));
    });

    $(document).on('click', '.btn-action-view', function () {
        openOrderDetail($(this).data('id'));
    });

    $(document).on('click', '.btn-action-collect, .btn-collect-all', function () {
        const orderId = $(this).data('id');
        if (!confirm('Mark all samples as collected for this order?')) return;

        $.post('/api/lab/orders/update-status', {
            _token: $('meta[name="csrf-token"]').attr('content'),
            orderId: orderId,
            status: 'Collected',
        }, function () {
            loadStats();
            loadOrders();
            const panelEl = document.getElementById('orderDetailPanel');
            if (panelEl.classList.contains('show')) {
                openOrderDetail(orderId);
            }
        });
    });

    $(document).on('click', '.btn-cancel-order', function () {
        const orderId = $(this).data('id');
        const reason = prompt('Please enter a reason for cancellation:');
        if (!reason) return;

        $.post('/api/lab/orders/update-status', {
            _token: $('meta[name="csrf-token"]').attr('content'),
            orderId: orderId,
            status: 'Cancelled',
            reason: reason,
        }, function () {
            loadStats();
            loadOrders();
            bootstrap.Offcanvas.getInstance(document.getElementById('orderDetailPanel'))?.hide();
        });
    });

    loadStats();
    loadOrders();
});
