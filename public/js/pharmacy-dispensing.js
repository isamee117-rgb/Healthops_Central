const DispensingApp = {
    currentView: 'list',
    queueData: [],
    workstationData: null,
    currentOrderId: null,
    autoRefreshInterval: null,

    init() {
        this.loadStats();
        this.loadQueue();
        this.setupViewToggle();
        this.setupFilters();
        this.autoRefreshInterval = setInterval(() => {
            if (!this.currentOrderId) {
                this.loadStats();
                this.loadQueue();
            }
        }, 60000);
        lucide.createIcons();
    },

    setupViewToggle() {
        document.querySelectorAll('#viewToggle .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#viewToggle .btn').forEach(b => {
                    b.style.background = '#fff';
                    b.style.color = 'var(--color-foreground)';
                    b.classList.remove('active');
                });
                btn.style.background = 'var(--aquamint)';
                btn.style.color = '#003366';
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                document.getElementById('listView').style.display = this.currentView === 'list' ? '' : 'none';
                document.getElementById('kanbanView').style.display = this.currentView === 'kanban' ? '' : 'none';
                document.getElementById('departmentView').style.display = this.currentView === 'department' ? '' : 'none';

                // Kanban/Department need all statuses visible — reset status filter
                if (this.currentView === 'kanban' || this.currentView === 'department') {
                    document.getElementById('filterStatus').value = '';
                    this.loadQueue();
                } else {
                    this.renderCurrentView();
                }
            });
        });
    },

    dispCurrentPage: 1,
    dispPerPage: 10,

    setupFilters() {
        /* live search — client-side filter on already-loaded data */
        let searchTimeout;
        const searchEl = document.getElementById('dispSearch');
        if (searchEl) {
            searchEl.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => { this.dispCurrentPage = 1; this.renderListView(); }, 260);
            });
        }
    },

    loadStats() {
        $.get('/api/dispensing/stats', (data) => {
            document.getElementById('statAwaiting').textContent = data.awaitingDispensing;
            document.getElementById('statInProgress').textContent = data.inProgress;
            document.getElementById('statReady').textContent = data.readyForPickup;
            document.getElementById('statCompleted').textContent = data.completedToday;
        });
    },

    loadQueue() {
        const params = new URLSearchParams();
        const v = id => (document.getElementById(id) || {}).value || '';
        if (v('filterStatus'))   params.append('status', v('filterStatus'));
        if (v('filterDept'))     params.append('department', v('filterDept'));
        if (v('filterPriority')) params.append('priority', v('filterPriority'));
        if (v('dispDateFrom'))   params.append('dateFrom', v('dispDateFrom'));
        if (v('dispDateTo'))     params.append('dateTo', v('dispDateTo'));

        $.get('/api/dispensing/queue?' + params.toString(), (data) => {
            this.queueData = data;
            this.renderCurrentView();
        });
    },

    renderCurrentView() {
        if (this.currentView === 'list') this.renderListView();
        else if (this.currentView === 'kanban') this.renderKanbanView();
        else if (this.currentView === 'department') this.renderDepartmentView();
    },

    renderListView() {
        const tbody = document.getElementById('queueTableBody');
        const q = (document.getElementById('dispSearch') || {}).value || '';
        const src = q.trim()
            ? this.queueData.filter(o =>
                (o.orderId || '').toLowerCase().includes(q.toLowerCase()) ||
                (o.patientName || '').toLowerCase().includes(q.toLowerCase()) ||
                (o.mrn || '').toLowerCase().includes(q.toLowerCase()) ||
                (o.department || '').toLowerCase().includes(q.toLowerCase()))
            : this.queueData;

        const total = src.length;
        const pages = Math.max(1, Math.ceil(total / this.dispPerPage));
        if (this.dispCurrentPage > pages) this.dispCurrentPage = pages;
        const start = (this.dispCurrentPage - 1) * this.dispPerPage;
        const page  = src.slice(start, start + this.dispPerPage);

        if (!page.length) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="inbox" style="width:32px;height:32px;margin-bottom:8px;opacity:0.4;display:block;margin-inline:auto"></i>No orders in dispensing queue</td></tr>';
            lucide.createIcons();
            this._renderDispPagination(total, pages);
            return;
        }

        tbody.innerHTML = page.map(o => {
            const pc = { STAT:'background:#fef2f2;color:#dc2626', Urgent:'background:#fff7ed;color:#ea580c', Routine:'background:#f0fdf4;color:#16a34a' }[o.priority] || 'background:#f1f5f9;color:#64748b';
            const dc = { OPD:'#3b82f6', IPD:'#8b5cf6', Emergency:'#ef4444', OT:'#f59e0b' }[o.department] || '#6b7280';
            const sc = { Verified:'#e67e22', Dispensing:'#3498db', Ready:'#27ae60', Completed:'#6b7280' }[o.status] || '#6b7280';
            const time = o.orderTime ? new Date(o.orderTime).toLocaleTimeString('en-PK', { hour:'2-digit', minute:'2-digit', hour12:true }) : '--';
            const age  = o.ageLabel || '';
            const prog = o.status === 'Dispensing' ? `<div style="font-size:10px;color:var(--color-muted-foreground);margin-top:2px">${o.itemsDispensed||0}/${o.itemsCount} dispensed</div>` : '';
            const actionLabel = o.status === 'Verified' ? 'Start' : o.status === 'Dispensing' ? 'Continue' : 'View';
            const ward = o.ward ? ' · ' + o.ward : '';

            return `<tr style="cursor:pointer" onclick="DispensingApp.openWorkstation('${o.orderId}')">
                <td class="font-mono" style="font-size:13px;font-weight:600;color:var(--aquamint)">${o.orderId}</td>
                <td><div style="font-size:12px;font-weight:500">${time}</div><div style="font-size:11px;color:var(--color-muted-foreground)">${age}</div></td>
                <td style="font-size:12.5px;font-weight:600;color:var(--color-foreground)">${o.mrn || '--'}</td>
                <td><div style="font-size:13px;font-weight:500">${o.patientName}</div><div style="font-size:11px;color:var(--color-muted-foreground)">${ward}</div></td>
                <td class="text-center"><span style="font-size:11px;padding:3px 8px;border-radius:4px;background:${dc}15;color:${dc};font-weight:500">${o.department}</span></td>
                <td class="text-center"><span style="font-size:11px;padding:3px 8px;border-radius:4px;${pc};font-weight:600">${o.priority}</span></td>
                <td class="text-center" style="font-size:13px;font-weight:600">${o.itemsCount||0}</td>
                <td class="text-right font-mono" style="font-size:13px;font-weight:600">PKR ${Number(o.orderValue||0).toLocaleString()}</td>
                <td class="text-center"><span style="font-size:11px;padding:3px 10px;border-radius:20px;background:${sc}18;color:${sc};font-weight:600;border:1px solid ${sc}30">${o.status}</span>${prog}</td>
                <td class="text-center">
                    <button onclick="event.stopPropagation();DispensingApp.openWorkstation('${o.orderId}')" style="background:var(--aquamint);color:#003366;font-size:11px;padding:4px 12px;border-radius:6px;border:none;font-weight:600;cursor:pointer">${actionLabel}</button>
                </td>
            </tr>`;
        }).join('');

        lucide.createIcons();
        this._renderDispPagination(total, pages);

        /* re-apply column visibility */
        document.querySelectorAll('#dispColVisList input[type="checkbox"]').forEach(cb => {
            const col = parseInt(cb.dataset.col);
            document.querySelectorAll('#dispTable thead th:nth-child(' + (col+1) + '), #dispTable tbody td:nth-child(' + (col+1) + ')').forEach(el => {
                el.style.display = cb.checked ? '' : 'none';
            });
        });
    },

    _renderDispPagination(total, pages) {
        const pageInfo = document.getElementById('dispPageInfo');
        const prevBtn  = document.getElementById('dispPrevBtn');
        const nextBtn  = document.getElementById('dispNextBtn');
        const numsEl   = document.getElementById('dispPageNums');
        if (!pageInfo) return;

        const start = Math.min((this.dispCurrentPage - 1) * this.dispPerPage + 1, total);
        const end   = Math.min(this.dispCurrentPage * this.dispPerPage, total);
        pageInfo.textContent = total ? 'Showing ' + start + '–' + end + ' of ' + total + ' orders' : 'No orders';

        prevBtn.disabled = this.dispCurrentPage <= 1;
        nextBtn.disabled = this.dispCurrentPage >= pages;

        let numsHtml = '';
        for (let p = 1; p <= pages; p++) {
            if (pages > 7 && p > 3 && p < pages - 2 && Math.abs(p - this.dispCurrentPage) > 1) {
                if (p === 4 || p === pages - 3) numsHtml += '<span style="padding:0 4px;color:var(--color-muted-foreground)">…</span>';
                continue;
            }
            numsHtml += '<button class="opd-page-num' + (p === this.dispCurrentPage ? ' active' : '') + '" onclick="dispGoToPage(' + p + ')">' + p + '</button>';
        }
        numsEl.innerHTML = numsHtml;
        lucide.createIcons();
    },

    renderKanbanView() {
        const verified = this.queueData.filter(o => o.status === 'Verified');
        const dispensing = this.queueData.filter(o => o.status === 'Dispensing');
        const ready = this.queueData.filter(o => o.status === 'Ready');

        const renderCards = (orders) => orders.length === 0
            ? '<div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:12px">No orders</div>'
            : orders.map(o => this.renderKanbanCard(o)).join('');

        document.getElementById('kanbanVerified').innerHTML = renderCards(verified);
        document.getElementById('kanbanDispensing').innerHTML = renderCards(dispensing);
        document.getElementById('kanbanReady').innerHTML = renderCards(ready);
        lucide.createIcons();
    },

    renderKanbanCard(o) {
        const prColor = o.priority === 'STAT' ? '#e74c3c' : o.priority === 'Urgent' ? '#e67e22' : '#27ae60';
        return `<div class="kanban-card" onclick="DispensingApp.openWorkstation('${o.orderId}')" style="border-left:3px solid ${prColor}">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
                <span style="font-weight:600;color:var(--aquamint);font-size:12px">${o.orderId}</span>
                <span style="font-size:10px;padding:2px 6px;border-radius:3px;background:${prColor}15;color:${prColor};font-weight:500">${o.priority}</span>
            </div>
            <div style="font-weight:500;font-size:13px;margin-bottom:2px">${o.patientName}</div>
            <div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:6px">${o.mrn} | ${o.department}${o.ward ? ' | ' + o.ward : ''}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px">
                <span>${o.itemsCount} items</span>
                <span style="font-weight:600">PKR ${Number(o.orderValue).toLocaleString()}</span>
            </div>
            ${o.tatExceeded ? '<div style="margin-top:4px;font-size:10px;color:#dc2626;background:#fef2f2;padding:2px 6px;border-radius:3px;text-align:center"><i data-lucide="alert-triangle" style="width:10px;height:10px"></i> TAT Exceeded</div>' : ''}
        </div>`;
    },

    renderDepartmentView() {
        const groups = {};
        this.queueData.forEach(o => {
            if (!groups[o.department]) groups[o.department] = [];
            groups[o.department].push(o);
        });

        const container = document.getElementById('departmentGroups');
        if (Object.keys(groups).length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)">No orders in queue</div>';
            return;
        }

        const deptIcons = { OPD: 'stethoscope', IPD: 'bed-double', Emergency: 'siren', OT: 'scissors' };
        container.innerHTML = Object.entries(groups).map(([dept, orders]) => `
            <div class="dept-group-section">
                <div class="dept-group-header">
                    <i data-lucide="${deptIcons[dept] || 'building'}" style="width:16px;height:16px;margin-right:6px;color:var(--aquamint)"></i>
                    ${dept} <span style="font-weight:400;color:var(--color-muted-foreground);font-size:12px">(${orders.length} orders)</span>
                </div>
                <div class="row g-2">${orders.map(o => `
                    <div class="col-md-4">
                        ${this.renderKanbanCard(o)}
                    </div>
                `).join('')}</div>
            </div>
        `).join('');
        lucide.createIcons();
    },

    openWorkstation(orderId) {
        this.currentOrderId = orderId;
        $.get('/api/dispensing/workstation/' + orderId, (data) => {
            this.workstationData = data;
            this.renderWorkstation();
            const panel = new bootstrap.Offcanvas(document.getElementById('workstationPanel'));
            panel.show();
        }).fail(() => {
            HMS.toast('Failed to load order data', 'error');
        });
    },

    renderWorkstation() {
        const d = this.workstationData;
        document.getElementById('wsTitle').textContent = 'Dispensing Workstation - ' + d.orderId;
        document.getElementById('wsSubtitle').textContent = d.department + (d.ward ? ' | ' + d.ward : '') + (d.bed ? ' | ' + d.bed : '') + ' | ' + d.orderedBy;

        const prColor = d.priority === 'STAT' ? '#e74c3c' : d.priority === 'Urgent' ? '#e67e22' : '#27ae60';
        document.getElementById('wsOrderBadges').innerHTML = `
            <span style="font-size:11px;padding:3px 10px;border-radius:4px;background:${prColor}20;color:${prColor};font-weight:600">${d.priority}</span>
            <span style="font-size:11px;padding:3px 10px;border-radius:4px;background:rgba(127,255,212,0.2);color:var(--aquamint);font-weight:600">${d.status}</span>
        `;

        document.getElementById('wsPatientAvatar').textContent = d.patientName.charAt(0);
        document.getElementById('wsPatientName').textContent = d.patientName;
        document.getElementById('wsPatientDetails').textContent = d.mrn + ' | ' + (d.patientAge || '') + 'y ' + (d.patientGender || '') + ' | ' + (d.diagnosis || '');

        if (d.allergies && d.allergies.length > 0) {
            document.getElementById('wsAllergyBadge').style.display = '';
            document.getElementById('wsAllergyText').textContent = 'Allergies: ' + d.allergies.join(', ');
        } else {
            document.getElementById('wsAllergyBadge').style.display = 'none';
        }

        this.renderItemCards();
        this.updateSummary();
        lucide.createIcons();
    },

    renderItemCards() {
        const items = this.workstationData.itemsDispensing;
        const container = document.getElementById('wsItemCards');

        container.innerHTML = items.map((item, idx) => {
            const isDispensed = item.markedDispensed;
            const expiryOk = this.isExpiryOk(item.expiryDate);
            const stockOk = (item.stockAvailable || 0) >= (item.totalQty || 0);

            return `<div class="dispensing-item-card ${isDispensed ? 'dispensed' : ''}" id="itemCard${idx}">
                <div class="card-header-row" onclick="DispensingApp.toggleItemCard(${idx})">
                    <input type="checkbox" class="form-check-input" ${isDispensed ? 'checked' : ''} onchange="DispensingApp.markDispensed(${idx}, this.checked);event.stopPropagation()" style="width:18px;height:18px">
                    <div style="flex:1">
                        <div style="display:flex;align-items:center;gap:8px">
                            <span style="font-weight:600;font-size:14px">${item.form} ${item.name}</span>
                            ${isDispensed ? '<span style="font-size:10px;padding:2px 8px;border-radius:4px;background:#27ae6015;color:#27ae60;font-weight:600">Dispensed</span>' : ''}
                        </div>
                        <div style="font-size:12px;color:var(--color-muted-foreground);margin-top:2px">
                            Quantity: ${item.totalQty} ${item.form?.toLowerCase() || 'units'} (${item.duration} x ${item.frequency})
                        </div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:600;font-size:13px">PKR ${Number(item.total || 0).toLocaleString()}</div>
                        <div style="font-size:11px;color:var(--color-muted-foreground)">${item.dose} x ${item.totalQty}</div>
                    </div>
                    <i data-lucide="chevron-down" style="width:16px;height:16px;color:var(--color-muted-foreground);transition:transform 0.2s" id="itemChevron${idx}"></i>
                </div>
                <div class="card-body-content" id="itemBody${idx}" style="display:${isDispensed ? 'none' : ''}">
                    <div style="border-top:1px solid var(--color-border);padding-top:14px">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div style="background:var(--color-background);border-radius:8px;padding:12px;border:1px solid var(--color-border)">
                                    <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:8px">
                                        <i data-lucide="scan-line" style="width:12px;height:12px;margin-right:4px"></i> Barcode Scanner
                                    </label>
                                    <div style="display:flex;gap:8px">
                                        <input type="text" class="form-control form-control-sm" placeholder="Scan medicine barcode..." style="font-size:12px;border-radius:6px" id="barcode${idx}">
                                        <button class="btn btn-sm" onclick="DispensingApp.scanBarcode(${idx})" style="background:var(--aquamint);color:#003366;border:none;font-size:11px;padding:4px 10px;border-radius:6px;white-space:nowrap">
                                            <i data-lucide="search" style="width:12px;height:12px"></i> Verify
                                        </button>
                                    </div>
                                    <div id="barcodeResult${idx}" style="margin-top:6px;font-size:11px"></div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div style="background:var(--color-background);border-radius:8px;padding:12px;border:1px solid var(--color-border)">
                                    <label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:8px">Batch Information</label>
                                    <div class="row g-2">
                                        <div class="col-6">
                                            <label style="font-size:11px;color:var(--color-muted-foreground)">Batch Number</label>
                                            <select class="form-select form-select-sm" style="font-size:12px;border-radius:6px" id="batch${idx}">
                                                <option value="${item.batchNumber}" selected>${item.batchNumber}</option>
                                            </select>
                                        </div>
                                        <div class="col-6">
                                            <label style="font-size:11px;color:var(--color-muted-foreground)">Expiry Date</label>
                                            <div style="font-size:13px;font-weight:500;padding:5px 0">
                                                ${item.expiryDate}
                                                <span class="${expiryOk ? 'expiry-ok' : 'expiry-warning'}">${expiryOk ? 'OK' : '< 3 months'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label style="font-size:11px;color:var(--color-muted-foreground)">Location</label>
                                <div style="font-size:13px;font-weight:500">${item.location}</div>
                            </div>
                            <div class="col-md-4">
                                <label style="font-size:11px;color:var(--color-muted-foreground)">Stock Available</label>
                                <div style="font-size:13px;font-weight:500;color:${stockOk ? '#27ae60' : '#e74c3c'}">${item.stockAvailable} units ${stockOk ? '' : '(Insufficient!)'}</div>
                            </div>
                            <div class="col-md-4">
                                <label style="font-size:11px;color:var(--color-muted-foreground)">Quantity to Dispense</label>
                                <input type="number" class="form-control form-control-sm" value="${item.quantityDispensed || item.totalQty}" min="0" max="${item.stockAvailable}" style="font-size:13px;border-radius:6px;width:100px" onchange="DispensingApp.updateQty(${idx}, this.value)" id="qty${idx}">
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--color-border)">
                            <button class="btn btn-sm" onclick="DispensingApp.markDispensed(${idx}, true)" style="background:${isDispensed ? '#27ae6015' : 'var(--aquamint)'};color:${isDispensed ? '#27ae60' : '#003366'};font-size:12px;padding:5px 14px;border-radius:6px;border:none;font-weight:600">
                                <i data-lucide="check" style="width:12px;height:12px;margin-right:4px"></i> ${isDispensed ? 'Dispensed' : 'Mark as Dispensed'}
                            </button>
                            <button class="btn btn-sm" onclick="DispensingApp.printLabel(${idx})" style="border:1px solid var(--color-border);background:#fff;color:var(--color-foreground);font-size:12px;padding:5px 14px;border-radius:6px">
                                <i data-lucide="printer" style="width:12px;height:12px;margin-right:4px"></i> Print Label
                                ${item.labelPrinted ? '<span style="color:#27ae60;margin-left:4px">&#10003;</span>' : ''}
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
        lucide.createIcons();
    },

    toggleItemCard(idx) {
        const body = document.getElementById('itemBody' + idx);
        const chevron = document.getElementById('itemChevron' + idx);
        if (body.style.display === 'none') {
            body.style.display = '';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
        } else {
            body.style.display = 'none';
            if (chevron) chevron.style.transform = '';
        }
    },

    isExpiryOk(expiryStr) {
        if (!expiryStr) return true;
        const parts = expiryStr.split(' ');
        if (parts.length < 2) return true;
        const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        const expDate = new Date(parseInt(parts[1]), months[parts[0]] || 0, 28);
        const threeMonths = new Date();
        threeMonths.setMonth(threeMonths.getMonth() + 3);
        return expDate > threeMonths;
    },

    scanBarcode(idx) {
        const input = document.getElementById('barcode' + idx);
        const result = document.getElementById('barcodeResult' + idx);
        const item = this.workstationData.itemsDispensing[idx];

        setTimeout(() => {
            result.innerHTML = '<span style="color:#27ae60"><i data-lucide="check-circle" style="width:12px;height:12px;margin-right:4px"></i> Barcode verified: ' + item.name + ' matched</span>';
            item.barcodeScanned = true;
            lucide.createIcons();
        }, 500);
    },

    markDispensed(idx, checked) {
        const item = this.workstationData.itemsDispensing[idx];
        item.markedDispensed = checked;
        if (checked && !item.quantityDispensed) {
            item.quantityDispensed = item.totalQty;
        }
        this.renderItemCards();
        this.updateSummary();
        this.autoSave();
    },

    autoSave() {
        $.ajax({
            url: '/api/dispensing/save-progress',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(this.collectWorkstationData()),
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: (data) => {
                this.loadStats();
                this.loadQueue();
                if (data.statusChanged) {
                    this.workstationData.status = data.newStatus;
                    this.updateWorkstationStatusBadge(data.newStatus);
                    if (data.newStatus === 'Ready') {
                        this.showToast('All items dispensed — order moved to Completed Order', 'success');
                        const panel = bootstrap.Offcanvas.getInstance(document.getElementById('workstationPanel'));
                        setTimeout(() => { if (panel) panel.hide(); this.currentOrderId = null; }, 2000);
                    } else if (data.newStatus === 'Dispensing') {
                        this.showToast('Order is now In Progress', 'info');
                    }
                }
            },
        });
    },

    updateWorkstationStatusBadge(status) {
        const statusColor = { Verified: '#e67e22', Dispensing: '#3498db', Ready: '#27ae60', Completed: '#6b7280' }[status] || '#6b7280';
        const el = document.getElementById('wsOrderBadges');
        if (!el) return;
        const prColor = this.workstationData.priority === 'STAT' ? '#e74c3c' : this.workstationData.priority === 'Urgent' ? '#e67e22' : '#27ae60';
        el.innerHTML = `<span style="font-size:11px;padding:3px 10px;border-radius:4px;background:${prColor}20;color:${prColor};font-weight:600">${this.workstationData.priority}</span>
            <span style="font-size:11px;padding:3px 10px;border-radius:4px;background:${statusColor}20;color:${statusColor};font-weight:600">${status}</span>`;
    },

    updateQty(idx, value) {
        this.workstationData.itemsDispensing[idx].quantityDispensed = parseInt(value) || 0;
    },

    printLabel(idx) {
        $.post('/api/dispensing/print-label', {
            _token: $('meta[name="csrf-token"]').attr('content'),
            orderId: this.currentOrderId,
            itemIndex: idx,
        }, (data) => {
            if (data.success) {
                this.workstationData.itemsDispensing[idx].labelPrinted = true;
                this.renderLabelPreview(data.label);
                this.updateSummary();
                this.renderItemCards();
            }
        });
    },

    renderLabelPreview(label) {
        const content = document.getElementById('labelContent');
        content.innerHTML = `
            <div style="text-align:center;font-weight:700;margin-bottom:8px;font-size:14px">${label.hospitalName}</div>
            <hr style="border-style:dashed;margin:8px 0">
            <div style="font-weight:600">${label.patientName} (${label.mrn})</div>
            <div>${label.ward || ''}${label.bed ? ', ' + label.bed : ''}</div>
            <hr style="border-style:dashed;margin:8px 0">
            <div style="font-weight:700;font-size:15px;margin:6px 0">${label.medicineName}</div>
            <div style="color:#666">(${label.generic})</div>
            <div style="margin-top:8px"><strong>DOSE:</strong> ${label.dose}</div>
            <div><strong>FREQUENCY:</strong> ${label.frequency}</div>
            <div><strong>DURATION:</strong> ${label.duration}</div>
            <div style="margin-top:8px;white-space:pre-line;color:#333;font-style:italic">${label.instructions}</div>
            <hr style="border-style:dashed;margin:8px 0">
            <div style="text-align:center;font-size:12px;margin:6px 0">[ ${label.barcode} ]</div>
            <hr style="border-style:dashed;margin:8px 0">
            <div style="font-size:11px">Dispensed: ${label.dispensedDate}</div>
            <div style="font-size:11px">By: ${label.dispensedBy}</div>
        `;
        const modal = new bootstrap.Modal(document.getElementById('labelModal'));
        modal.show();
        lucide.createIcons();
    },

    printAllLabels() {
        const items = this.workstationData.itemsDispensing;
        items.forEach((item, idx) => {
            if (!item.labelPrinted) {
                $.post('/api/dispensing/print-label', {
                    _token: $('meta[name="csrf-token"]').attr('content'),
                    orderId: this.currentOrderId,
                    itemIndex: idx,
                }, (data) => {
                    if (data.success) {
                        this.workstationData.itemsDispensing[idx].labelPrinted = true;
                        this.renderItemCards();
                        this.updateSummary();
                    }
                });
            }
        });
    },

    updateSummary() {
        const items = this.workstationData.itemsDispensing;
        const total = items.length;
        const dispensed = items.filter(i => i.markedDispensed).length;
        const labelsPrinted = items.filter(i => i.labelPrinted).length;

        document.getElementById('wsSummaryTotal').textContent = total;
        document.getElementById('wsSummaryDispensed').innerHTML = dispensed + '/' + total + (dispensed === total ? ' <span style="color:#27ae60">&#10003;</span>' : '');
        document.getElementById('wsSummaryValue').textContent = 'PKR ' + Number(this.workstationData.orderValue).toLocaleString();
        document.getElementById('wsSummaryLabels').innerHTML = '<i data-lucide="printer" style="width:12px;height:12px"></i> Labels: <strong>' + labelsPrinted + '/' + total + '</strong>';

        const btn = document.getElementById('btnComplete');
        const canComplete = dispensed === total && total > 0;
        btn.disabled = !canComplete;
        btn.style.opacity = canComplete ? '1' : '0.5';

        lucide.createIcons();
    },

    collectWorkstationData() {
        return {
            _token: $('meta[name="csrf-token"]').attr('content'),
            orderId: this.currentOrderId,
            itemsDispensing: this.workstationData.itemsDispensing,
        };
    },

    saveProgress() {
        $.ajax({
            url: '/api/dispensing/save-progress',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(this.collectWorkstationData()),
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: (data) => {
                if (data.success) {
                    this.showToast('Progress saved: ' + data.itemsDispensed + '/' + data.totalItems + ' items dispensed', 'success');
                    this.loadStats();
                    this.loadQueue();
                }
            },
            error: () => this.showToast('Failed to save progress', 'error'),
        });
    },

    completeDispensing() {
        if (!confirm('Complete dispensing for this order? Stock will be deducted and the order status will be updated.')) return;

        $.ajax({
            url: '/api/dispensing/complete',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(this.collectWorkstationData()),
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: (data) => {
                if (data.success) {
                    this.showToast(data.message, 'success');
                    const panel = bootstrap.Offcanvas.getInstance(document.getElementById('workstationPanel'));
                    if (panel) panel.hide();
                    this.currentOrderId = null;
                    this.loadStats();
                    this.loadQueue();
                }
            },
            error: (xhr) => {
                const msg = xhr.responseJSON?.error || 'Failed to complete dispensing';
                this.showToast(msg, 'error');
            },
        });
    },

    cancelDispensing() {
        if (!confirm('Cancel dispensing for this order? All progress will be lost.')) return;

        $.ajax({
            url: '/api/dispensing/cancel',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                _token: $('meta[name="csrf-token"]').attr('content'),
                orderId: this.currentOrderId,
            }),
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: (data) => {
                if (data.success) {
                    this.showToast(data.message, 'success');
                    const panel = bootstrap.Offcanvas.getInstance(document.getElementById('workstationPanel'));
                    if (panel) panel.hide();
                    this.currentOrderId = null;
                    this.loadStats();
                    this.loadQueue();
                }
            },
        });
    },

    refresh() {
        this.loadStats();
        this.loadQueue();
    },

    showToast(message, type) {
        const color = type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db';
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:' + color + ';color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn 0.3s ease';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
    },
};

document.addEventListener('DOMContentLoaded', () => DispensingApp.init());

/* ── Toolbar global functions ────────────────────────────────────────────── */

function dispChangePage(dir) {
    DispensingApp.dispCurrentPage += dir;
    DispensingApp.renderListView();
}
function dispGoToPage(p) {
    DispensingApp.dispCurrentPage = p;
    DispensingApp.renderListView();
}

/* Filter pane */
function toggleDispFilter() {
    var pane = document.getElementById('dispFilterPane');
    var btn  = document.getElementById('btnDispFilter');
    var open = pane.style.display === 'none' || pane.style.display === '';
    pane.style.display = open ? 'block' : 'none';
    btn && btn.classList.toggle('filter-active', open);
}
function applyDispFilters() {
    DispensingApp.dispCurrentPage = 1;
    DispensingApp.loadQueue();
    _updateDispFilterBadge();
}
function resetDispFilters() {
    ['filterStatus','filterDept','filterPriority'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
    });
    ['dispDateFrom','dispDateTo'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
    });
    var badge = document.getElementById('dispFilterBadge');
    if (badge) { badge.style.display = 'none'; badge.textContent = '0'; }
    DispensingApp.dispCurrentPage = 1;
    DispensingApp.loadQueue();
}
function _updateDispFilterBadge() {
    var count = 0;
    ['filterStatus','filterDept','filterPriority','dispDateFrom','dispDateTo'].forEach(function(id) {
        var el = document.getElementById(id); if (el && el.value) count++;
    });
    var badge = document.getElementById('dispFilterBadge');
    if (badge) { badge.style.display = count ? 'inline-flex' : 'none'; badge.textContent = count; }
}

/* Rows per page */
function toggleDispRowsMenu(e) {
    e && e.stopPropagation();
    document.getElementById('dispRowsMenu').classList.toggle('open');
    document.getElementById('dispExportMenu') && document.getElementById('dispExportMenu').classList.remove('open');
    document.getElementById('dispColVisMenu') && document.getElementById('dispColVisMenu').classList.remove('open');
}
function setDispRowsPer(n) {
    DispensingApp.dispPerPage = n;
    DispensingApp.dispCurrentPage = 1;
    document.querySelectorAll('#dispRowsMenu button').forEach(function(b) {
        b.classList.toggle('active', parseInt(b.textContent) === n);
    });
    document.getElementById('dispRowsMenu').classList.remove('open');
    DispensingApp.renderListView();
}

/* Column visibility */
function toggleDispColVis(e) {
    e && e.stopPropagation();
    document.getElementById('dispColVisMenu').classList.toggle('open');
    document.getElementById('dispRowsMenu') && document.getElementById('dispRowsMenu').classList.remove('open');
    document.getElementById('dispExportMenu') && document.getElementById('dispExportMenu').classList.remove('open');
}
function dispColVisSelectAll() {
    var cbs = document.querySelectorAll('#dispColVisList input[type="checkbox"]');
    var allChecked = Array.from(cbs).every(function(c) { return c.checked; });
    cbs.forEach(function(c) { c.checked = !allChecked; });
}
function applyDispColVis() {
    document.querySelectorAll('#dispColVisList input[type="checkbox"]').forEach(function(cb) {
        var col = parseInt(cb.dataset.col) + 1;
        document.querySelectorAll('#dispTable thead th:nth-child(' + col + '), #dispTable tbody td:nth-child(' + col + ')').forEach(function(el) {
            el.style.display = cb.checked ? '' : 'none';
        });
    });
    document.getElementById('dispColVisMenu').classList.remove('open');
}

/* Export */
function toggleDispExportMenu(e) {
    e && e.stopPropagation();
    document.getElementById('dispExportMenu').classList.toggle('open');
    document.getElementById('dispRowsMenu') && document.getElementById('dispRowsMenu').classList.remove('open');
    document.getElementById('dispColVisMenu') && document.getElementById('dispColVisMenu').classList.remove('open');
}
function exportDisp(type) {
    var src = DispensingApp.queueData;
    var hdrs = ['Order ID','Order Time','MRN','Patient Name','Department','Priority','Items','Value','Status'];
    var rows = src.map(function(o) {
        var t = o.orderTime ? new Date(o.orderTime).toLocaleString() : '';
        return [o.orderId, t, o.mrn, o.patientName, o.department, o.priority, o.itemsCount, o.orderValue, o.status];
    });
    if (type === 'csv') {
        var csv = [hdrs.join(',')].concat(rows.map(function(r) { return r.map(function(v) { return '"' + String(v||'').replace(/"/g,'""') + '"'; }).join(','); })).join('\n');
        var a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        a.download = 'dispensing-queue.csv'; a.click();
    } else if (type === 'print') {
        var w = window.open('', '_blank');
        var trs = rows.map(function(r) { return '<tr>' + r.map(function(v) { return '<td style="padding:6px 10px;border:1px solid #e5e7eb">' + (v||'') + '</td>'; }).join('') + '</tr>'; }).join('');
        w.document.write('<html><head><title>Dispensing Queue</title><style>body{font-family:sans-serif;font-size:12px}table{border-collapse:collapse;width:100%}th{background:#f1f5f9;padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:11px}</style></head><body><h3 style="margin:0 0 12px">Dispensing & Fulfillment Queue</h3><table><thead><tr>' + hdrs.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + trs + '</tbody></table></body></html>');
        w.document.close(); w.print();
    }
    document.getElementById('dispExportMenu').classList.remove('open');
}

/* Close menus on outside click */
document.addEventListener('click', function() {
    ['dispRowsMenu','dispColVisMenu','dispExportMenu'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.classList.remove('open');
    });
});
