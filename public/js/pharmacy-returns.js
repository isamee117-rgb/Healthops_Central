const ReturnsApp = {
    expiredData: [],
    selectedExpired: [],

    allPatient: [], filteredPatient: [], patientPage: 1, patientRowsPer: 10, patientFilters: { status: '' },
    allPurchaseReturn: [], filteredPurchaseReturn: [], purchaseReturnPage: 1, purchaseReturnRowsPer: 10,
    _prOrders: [], _prItems: [],
    allExpiredItems: [], filteredExpiredItems: [], expiredPage: 1, expiredRowsPer: 10,
    allNear: [], filteredNear: [], nearPage: 1, nearRowsPer: 10,

    init() {
        this.loadDashboard();
        this.loadPatientReturns();
        this.loadPurchaseReturns();
        this.loadExpiredStock();
        this.loadNearExpiry();

        let pTimer, prTimer, eTimer, nTimer;
        document.getElementById('searchPatientReturns').addEventListener('input', () => {
            clearTimeout(pTimer);
            pTimer = setTimeout(() => { this.patientPage = 1; this.applyPatientClientFilters(); }, 250);
        });
        document.getElementById('searchPurchaseReturn').addEventListener('input', () => {
            clearTimeout(prTimer);
            prTimer = setTimeout(() => { this.purchaseReturnPage = 1; this.applyPurchaseReturnFilters(); }, 250);
        });
        document.getElementById('searchExpiredStock').addEventListener('input', () => {
            clearTimeout(eTimer);
            eTimer = setTimeout(() => { this.expiredPage = 1; this.applyExpiredClientFilters(); }, 250);
        });
        document.getElementById('searchNearExpiry').addEventListener('input', () => {
            clearTimeout(nTimer);
            nTimer = setTimeout(() => { this.nearPage = 1; this.applyNearClientFilters(); }, 250);
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.opd-rows-menu,.opd-col-vis-menu,.opd-export-menu').forEach(m => m.classList.remove('open'));
        });

        document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', () => { lucide.createIcons(); });
        });
        lucide.createIcons();
    },

    // ── Dashboard ────────────────────────────────────────────────────────────────

    loadDashboard() {
        $.get('/api/returns/dashboard', (d) => {
            document.getElementById('statPatientReturns').textContent = d.patientReturns;
            document.getElementById('statPatientPending').textContent = d.patientReturnsPending + ' pending';
            document.getElementById('statExpired').textContent = d.expiredCount;
            document.getElementById('statExpiredLoss').textContent = 'PKR ' + Number(d.expiredLoss).toLocaleString() + ' loss';
            document.getElementById('statNearExpiry').textContent = d.nearExpiryCount;
            document.getElementById('statRefunds').textContent = 'PKR ' + Number(d.totalRefunds).toLocaleString();
        });
    },

    // ── Shared helpers ───────────────────────────────────────────────────────────

    buildPageRange(current, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages = [1];
        if (current > 3) pages.push('…');
        for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
        if (current < total - 2) pages.push('…');
        pages.push(total);
        return pages;
    },

    exportTab(tab, type) {
        const cfg = {
            patient:  { data: this.filteredPatient, headers: ['Return ID','Date','Patient','MRN','Order ID','Medicine','Qty','Reason','Condition','Refund','Status'], file: 'patient-returns.csv',
                row: r => [r.return_id, r.return_date, r.patient_name, r.mrn, r.order_id||'', r.medicine_name, r.quantity, r.reason, r.condition, r.refund_amount, r.status] },
            expired:  { data: this.filteredExpiredItems.map(x => x.item), headers: ['Medicine','Batch','Expiry Date','Days Expired','Qty','Unit','Purchase Value'], file: 'expired-stock.csv',
                row: r => [r.medicineName, r.batchNumber, r.expiryDate, r.daysExpired, r.qty, r.unit, r.purchaseValue] },
            near:     { data: this.filteredNear, headers: ['Medicine','Batch','Expiry','Days Left','Qty','Unit','Est. Usage','Recommendation'], file: 'near-expiry.csv',
                row: r => [r.medicineName, r.batchNumber, r.expiryMonth, r.daysRemaining, r.qty, r.unit, r.estimatedUsage, r.recommendation] },
        }[tab];

        if (!cfg) return;
        document.querySelectorAll('.opd-export-menu').forEach(m => m.classList.remove('open'));

        if (type === 'csv') {
            const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
            const csv = [cfg.headers.map(q).join(','), ...cfg.data.map(r => cfg.row(r).map(q).join(','))].join('\n');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            a.download = cfg.file;
            a.click();
        } else if (type === 'print') {
            window.print();
        }
    },

    _toggleMenu(menuId, e) {
        e.stopPropagation();
        const menu = document.getElementById(menuId);
        const wasOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu,.opd-col-vis-menu,.opd-export-menu').forEach(m => m.classList.remove('open'));
        if (!wasOpen) menu.classList.add('open');
    },

    _applyColVis(tableId, listId, menuId) {
        const table = document.getElementById(tableId);
        document.querySelectorAll('#' + listId + ' input[type="checkbox"]').forEach(cb => {
            const col = parseInt(cb.dataset.col);
            table.querySelectorAll('tr').forEach(tr => {
                const cell = tr.cells[col];
                if (cell) cell.style.display = cb.checked ? '' : 'none';
            });
        });
        document.getElementById(menuId).classList.remove('open');
    },

    _colVisSelectAll(listId) {
        document.querySelectorAll('#' + listId + ' input[type="checkbox"]').forEach(cb => { cb.checked = true; });
    },

    _updateFilterBadge(badgeId, filters) {
        const count = Object.values(filters).filter(v => v).length;
        const badge = document.getElementById(badgeId);
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    },

    _setRowsPerBtn(menuId, n) {
        document.querySelectorAll('#' + menuId + ' button').forEach(b => {
            b.classList.toggle('active', parseInt(b.textContent) === n);
        });
        document.getElementById(menuId).classList.remove('open');
    },

    _renderPagination(ids, page, rowsPer, total) {
        const pages = Math.ceil(total / rowsPer) || 1;
        document.getElementById(ids.pagination).style.display = total > 0 ? 'flex' : 'none';
        const start = (page - 1) * rowsPer + 1;
        const end = Math.min(page * rowsPer, total);
        document.getElementById(ids.info).textContent = `Showing ${start}–${end} of ${total} results`;
        document.getElementById(ids.prev).disabled = page <= 1;
        document.getElementById(ids.next).disabled = page >= pages;
        document.getElementById(ids.nums).innerHTML = this.buildPageRange(page, pages).map(p =>
            p === '…'
                ? `<span style="padding:0 4px;color:var(--color-muted-foreground)">…</span>`
                : `<button class="opd-page-num${p === page ? ' active' : ''}" onclick="ReturnsApp.${ids.goTo}(${p})">${p}</button>`
        ).join('');
    },

    // ── Patient Returns ──────────────────────────────────────────────────────────

    loadPatientReturns() {
        document.getElementById('patientLoading').classList.remove('is-hidden');
        document.getElementById('patientEmpty').classList.add('is-hidden');
        document.getElementById('tblPatientReturns').style.display = 'none';
        document.getElementById('patientPagination').style.display = 'none';

        $.get('/api/returns/patient', (data) => {
            this.allPatient = Array.isArray(data) ? data : [];
            document.getElementById('patientLoading').classList.add('is-hidden');
            this.patientPage = 1;
            this.applyPatientClientFilters();
        }).fail(() => {
            document.getElementById('patientLoading').classList.add('is-hidden');
            document.getElementById('patientEmpty').classList.remove('is-hidden');
        });
    },

    applyPatientClientFilters() {
        const search = (document.getElementById('searchPatientReturns').value || '').toLowerCase();
        const status = document.getElementById('filterPatientStatus').value;
        this.patientFilters = { status };

        this.filteredPatient = this.allPatient.filter(r => {
            if (status && r.status !== status) return false;
            if (search) {
                const hay = [r.return_id, r.patient_name, r.mrn, r.order_id, r.medicine_name].join(' ').toLowerCase();
                if (!hay.includes(search)) return false;
            }
            return true;
        });

        this._updateFilterBadge('patientFilterBadge', this.patientFilters);
        this.renderPatientTable();
        this.renderPatientPagination();
    },

    renderPatientTable() {
        const start = (this.patientPage - 1) * this.patientRowsPer;
        const slice = this.filteredPatient.slice(start, start + this.patientRowsPer);
        const tbody = document.getElementById('patientReturnsBody');

        if (!this.filteredPatient.length) {
            document.getElementById('tblPatientReturns').style.display = 'none';
            document.getElementById('patientEmpty').classList.remove('is-hidden');
            return;
        }
        document.getElementById('patientEmpty').classList.add('is-hidden');
        document.getElementById('tblPatientReturns').style.display = '';

        tbody.innerHTML = slice.map(r => {
            const statusColor = { Pending: '#e67e22', Approved: '#27ae60', Rejected: '#e74c3c' }[r.status] || '#6b7280';
            const condColor = r.condition === 'Unopened' ? '#27ae60' : '#e74c3c';
            const actionBtn = r.status === 'Pending'
                ? `<button class="btn btn-sm" onclick="ReturnsApp.showProcessReturn('${r.return_id}')" style="background:var(--aquamint);color:#003366;font-size:11px;padding:3px 10px;border-radius:5px;border:none;font-weight:600">Process</button>`
                : r.status === 'Approved'
                ? `<span style="font-size:11px;color:#27ae60;font-weight:500">Refunded</span>`
                : `<span style="font-size:11px;color:#e74c3c;font-weight:500">Rejected</span>`;
            const date = new Date(r.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            return `<tr>
                <td style="padding:10px 16px;font-weight:600;color:var(--aquamint);font-size:12px">${r.return_id}</td>
                <td style="padding:10px 16px;font-size:12px">${date}</td>
                <td style="padding:10px 16px"><span style="font-weight:500">${r.patient_name}</span><br><span style="font-size:11px;color:var(--color-muted-foreground)">${r.mrn}</span></td>
                <td style="padding:10px 16px;font-size:12px;color:var(--aquamint)">${r.order_id || '-'}</td>
                <td style="padding:10px 16px;font-size:12px">${r.medicine_name}</td>
                <td style="padding:10px 16px;font-size:12px">${r.quantity}</td>
                <td style="padding:10px 16px;font-size:11px">${r.reason}</td>
                <td style="padding:10px 16px"><span style="font-size:11px;padding:2px 6px;border-radius:4px;background:${condColor}15;color:${condColor}">${r.condition}</span></td>
                <td style="padding:10px 16px;font-weight:600;font-size:12px">PKR ${Number(r.refund_amount).toLocaleString()}</td>
                <td style="padding:10px 16px"><span style="font-size:11px;padding:3px 8px;border-radius:4px;background:${statusColor}15;color:${statusColor};font-weight:500">${r.status}</span></td>
                <td style="padding:10px 16px">${actionBtn}</td>
            </tr>`;
        }).join('');
        lucide.createIcons();
    },

    renderPatientPagination() {
        this._renderPagination(
            { pagination: 'patientPagination', info: 'patientPageInfo', prev: 'patientPrevPage', next: 'patientNextPage', nums: 'patientPageNums', goTo: 'goToPatientPage' },
            this.patientPage, this.patientRowsPer, this.filteredPatient.length
        );
    },

    goToPatientPage(p) {
        const pages = Math.ceil(this.filteredPatient.length / this.patientRowsPer) || 1;
        if (p < 1 || p > pages) return;
        this.patientPage = p;
        this.renderPatientTable();
        this.renderPatientPagination();
    },

    togglePatientFilter() {
        const pane = document.getElementById('patientFilterPane');
        const btn = document.getElementById('btnPatientFilter');
        const open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        btn.classList.toggle('filter-active', !open);
    },

    resetPatientFilters() {
        document.getElementById('filterPatientStatus').value = '';
        this.patientPage = 1;
        this.applyPatientClientFilters();
    },

    togglePatientRowsMenu(e) { this._toggleMenu('patientRowsMenu', e); },
    setPatientRowsPer(n) {
        this.patientRowsPer = n; this.patientPage = 1;
        this._setRowsPerBtn('patientRowsMenu', n);
        this.renderPatientTable(); this.renderPatientPagination();
    },
    togglePatientColVis(e) { this._toggleMenu('patientColVisMenu', e); },
    patientColVisSelectAll() { this._colVisSelectAll('patientColVisList'); },
    applyPatientColVis() { this._applyColVis('tblPatientReturns', 'patientColVisList', 'patientColVisMenu'); },
    togglePatientExportMenu(e) { this._toggleMenu('patientExportMenu', e); },

    // ── Patient offcanvas methods ────────────────────────────────────────────────

    showProcessReturn(returnId) {
        const r = this.allPatient.find(x => x.return_id === returnId);
        if (!r) {
            $.get('/api/returns/patient', (data) => {
                const found = data.find(x => x.return_id === returnId);
                if (found) this._renderProcessReturn(found);
            });
            return;
        }
        this._renderProcessReturn(r);
    },

    _renderProcessReturn(r) {
        const purchaseDate = r.purchase_date ? new Date(r.purchase_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
        const returnDate = new Date(r.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const daysSince = r.purchase_date ? Math.ceil((new Date(r.return_date) - new Date(r.purchase_date)) / 86400000) : 0;
        const policyText = daysSince <= 7 ? 'Full refund (<7 days)' : '80% refund (>7 days)';
        const refundAmt = daysSince <= 7 ? r.original_amount : Math.round(r.original_amount * 0.8);

        document.getElementById('processTitle').textContent = 'Process Return - ' + r.return_id;
        document.getElementById('processBody').innerHTML = `
            <div style="background:var(--color-background);border-radius:10px;padding:16px;border:1px solid var(--color-border);margin-bottom:16px">
                <h6 style="font-size:13px;font-weight:600;margin-bottom:12px;font-family:'Roobert',sans-serif">Return Details</h6>
                <div class="return-field"><label>Patient</label><div class="value">${r.patient_name} (${r.mrn})</div></div>
                <div class="return-field"><label>Original Order</label><div class="value" style="color:var(--aquamint)">${r.order_id || 'N/A'}</div></div>
                <div class="row">
                    <div class="col-6 return-field"><label>Purchase Date</label><div class="value">${purchaseDate}</div></div>
                    <div class="col-6 return-field"><label>Return Date</label><div class="value">${returnDate} (${daysSince} days)</div></div>
                </div>
            </div>
            <div style="background:var(--color-background);border-radius:10px;padding:16px;border:1px solid var(--color-border);margin-bottom:16px">
                <h6 style="font-size:13px;font-weight:600;margin-bottom:12px;font-family:'Roobert',sans-serif">Medicine Details</h6>
                <div class="return-field"><label>Medicine</label><div class="value">${r.medicine_name}</div></div>
                <div class="row">
                    <div class="col-4 return-field"><label>Batch</label><div class="value">${r.batch_number || 'N/A'}</div></div>
                    <div class="col-4 return-field"><label>Expiry</label><div class="value">${r.expiry_date || 'N/A'}</div></div>
                    <div class="col-4 return-field"><label>Quantity</label><div class="value">${r.quantity} ${r.unit}</div></div>
                </div>
                <div class="return-field"><label>Return Reason</label><div class="value">${r.reason}</div></div>
                <div class="return-field"><label>Patient Notes</label><div class="value" style="font-size:13px;color:var(--color-muted-foreground)">${r.patient_notes || 'None'}</div></div>
            </div>
            <div style="background:var(--color-background);border-radius:10px;padding:16px;border:1px solid var(--color-border);margin-bottom:16px">
                <h6 style="font-size:13px;font-weight:600;margin-bottom:12px;font-family:'Roobert',sans-serif">Condition Verification</h6>
                <div class="condition-option ${r.condition === 'Unopened' ? 'selected' : ''}" onclick="ReturnsApp.selectCondition(this,'Unopened')">
                    <input type="radio" name="condition" value="Unopened" ${r.condition === 'Unopened' ? 'checked' : ''}> Unopened <span style="font-size:11px;color:var(--color-muted-foreground)">(Can restock if expiry >6 months)</span>
                </div>
                <div class="condition-option ${r.condition === 'Opened' ? 'selected' : ''}" onclick="ReturnsApp.selectCondition(this,'Opened')">
                    <input type="radio" name="condition" value="Opened" ${r.condition === 'Opened' ? 'checked' : ''}> Opened <span style="font-size:11px;color:var(--color-muted-foreground)">(Cannot restock, dispose)</span>
                </div>
                <div class="condition-option" onclick="ReturnsApp.selectCondition(this,'Damaged')">
                    <input type="radio" name="condition" value="Damaged"> Damaged <span style="font-size:11px;color:var(--color-muted-foreground)">(Cannot restock, dispose)</span>
                </div>
            </div>
            <div style="background:var(--color-background);border-radius:10px;padding:16px;border:1px solid var(--color-border);margin-bottom:16px">
                <h6 style="font-size:13px;font-weight:600;margin-bottom:12px;font-family:'Roobert',sans-serif">Refund Calculation</h6>
                <div class="row">
                    <div class="col-6 return-field"><label>Original Amount</label><div class="value">PKR ${Number(r.original_amount).toLocaleString()}</div></div>
                    <div class="col-6 return-field"><label>Refund Policy</label><div class="value" style="color:#27ae60">${policyText}</div></div>
                </div>
                <div class="return-field"><label>Refund Amount</label><div class="value" style="font-size:18px;font-weight:700;color:#003366">PKR ${Number(refundAmt).toLocaleString()}</div></div>
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:6px">Refund Method</label>
                <div class="condition-option selected" onclick="ReturnsApp.selectRefundMethod(this,'Cash Refund')">
                    <input type="radio" name="refundMethod" value="Cash Refund" checked> Cash Refund
                </div>
                <div class="condition-option" onclick="ReturnsApp.selectRefundMethod(this,'Credit Note')">
                    <input type="radio" name="refundMethod" value="Credit Note"> Credit Note (for future purchase)
                </div>
                <div class="condition-option" onclick="ReturnsApp.selectRefundMethod(this,'Account Adjustment')">
                    <input type="radio" name="refundMethod" value="Account Adjustment"> Adjust in Account (if IPD patient)
                </div>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end">
                <button class="btn btn-sm" data-bs-dismiss="offcanvas" style="border:1px solid var(--color-border);font-size:13px;padding:6px 16px;border-radius:6px">Cancel</button>
                <button class="btn btn-sm" onclick="ReturnsApp.submitProcessReturn('${r.return_id}',${refundAmt})" style="background:var(--aquamint);color:#003366;font-size:13px;font-weight:600;padding:6px 20px;border-radius:6px;border:none">
                    <i data-lucide="check" style="width:14px;height:14px;margin-right:4px"></i> Approve Return & Process Refund
                </button>
            </div>
        `;
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('processReturnPanel')).show();
    },

    selectCondition(el) {
        document.querySelectorAll('.condition-option[onclick*="selectCondition"]').forEach(e => { e.classList.remove('selected'); e.querySelector('input').checked = false; });
        el.classList.add('selected');
        el.querySelector('input').checked = true;
    },

    selectRefundMethod(el) {
        document.querySelectorAll('.condition-option[onclick*="selectRefundMethod"]').forEach(e => { e.classList.remove('selected'); e.querySelector('input').checked = false; });
        el.classList.add('selected');
        el.querySelector('input').checked = true;
    },

    submitProcessReturn(returnId, refundAmount) {
        const condition = document.querySelector('input[name="condition"]:checked')?.value || 'Unopened';
        const refundMethod = document.querySelector('input[name="refundMethod"]:checked')?.value || 'Cash Refund';
        $.ajax({
            url: '/api/returns/patient/process', method: 'POST', contentType: 'application/json',
            data: JSON.stringify({ returnId, condition, refundMethod, refundAmount, _token: $('meta[name="csrf-token"]').attr('content') }),
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: (data) => {
                if (data.success) {
                    this.showToast(data.message, 'success');
                    bootstrap.Offcanvas.getInstance(document.getElementById('processReturnPanel'))?.hide();
                    this.loadPatientReturns();
                    this.loadDashboard();
                }
            },
            error: () => this.showToast('Failed to process return', 'error'),
        });
    },

    _nrOrders: [],
    _nrItems: [],

    showNewPatientReturn() {
        document.getElementById('newReturnTitle').textContent = 'New Patient Return';
        document.getElementById('newReturnBody').innerHTML = `
            <style>
            .nr-combo-wrap{position:relative}
            .nr-combo-drop{display:none;position:absolute;top:100%;left:0;right:0;max-height:220px;overflow-y:auto;background:#fff;border:1px solid #dee2e6;border-radius:8px;z-index:1050;box-shadow:0 6px 20px rgba(0,0,0,.12);margin-top:2px}
            .nr-combo-drop.open{display:block}
            .nr-combo-item{padding:9px 12px;cursor:pointer;border-bottom:1px solid #f3f4f6;font-size:13px}
            .nr-combo-item:last-child{border-bottom:none}
            .nr-combo-item:hover,.nr-combo-item.active{background:rgba(6,7,64,.05)}
            .nr-combo-item-id{font-weight:600;color:#003366}
            .nr-combo-item-meta{font-size:11px;color:#6b7280;margin-top:1px}
            .nr-readonly{background:#f8f9fa!important;cursor:default}
            .nr-items-table{width:100%;border-collapse:collapse;font-size:12px}
            .nr-items-table th{padding:7px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:var(--color-muted-foreground);background:var(--color-muted);white-space:nowrap}
            .nr-items-table td{padding:7px 10px;border-bottom:1px solid var(--color-border);vertical-align:middle}
            .nr-items-table tbody tr:last-child td{border-bottom:none}
            .nr-items-table tbody tr:hover td{background:rgba(6,7,64,.02)}
            .nr-qty-inp{width:60px;height:28px;text-align:center;padding:0 4px;border:1px solid #dee2e6;border-radius:5px;font-size:12px;font-weight:600;color:#003366}
            .nr-qty-inp:focus{border-color:#060740;outline:none;box-shadow:0 0 0 2px rgba(6,7,64,.08)}
            .nr-row-amt{font-family:monospace;font-size:12px;font-weight:600;color:#003366;text-align:right;white-space:nowrap}
            </style>

            <div class="return-field">
                <label>Order / Invoice ID <span style="color:#e74c3c">*</span></label>
                <div class="nr-combo-wrap">
                    <input type="text" class="form-control form-control-sm" id="nrOrderSearch" placeholder="Search by order ID, TXN ID or patient name..." autocomplete="off" oninput="ReturnsApp.onOrderSearch()" onfocus="ReturnsApp.onOrderSearchFocus()" style="border-radius:6px">
                    <input type="hidden" id="nrOrderId">
                    <div class="nr-combo-drop" id="nrOrderDrop"></div>
                </div>
            </div>

            <div id="nrPatientBlock" style="display:none">
                <div class="row">
                    <div class="col-6 return-field"><label>Patient Name</label><input type="text" class="form-control form-control-sm nr-readonly" id="nrPatientName" readonly style="border-radius:6px"></div>
                    <div class="col-6 return-field"><label>MRN</label><input type="text" class="form-control form-control-sm nr-readonly" id="nrMrn" readonly style="border-radius:6px"></div>
                </div>
            </div>

            <div id="nrItemsWrap" style="display:none">
                <div style="font-size:11.5px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">
                    Select Items to Return — enter qty &gt; 0 for each item you want to return
                </div>
                <div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden">
                    <table class="nr-items-table">
                        <thead>
                            <tr>
                                <th style="text-align:left">Medicine</th>
                                <th style="text-align:center">Batch</th>
                                <th style="text-align:center">Expiry</th>
                                <th style="text-align:center">Disp.</th>
                                <th style="text-align:center">Return Qty</th>
                                <th style="text-align:right">Refund</th>
                            </tr>
                        </thead>
                        <tbody id="nrItemsTbody"></tbody>
                        <tfoot>
                            <tr style="background:var(--color-muted)">
                                <td colspan="5" style="padding:8px 10px;font-size:12px;font-weight:700;text-align:right;color:var(--color-foreground)">Total Refund</td>
                                <td style="padding:8px 10px;font-family:monospace;font-size:13px;font-weight:700;color:#003366;text-align:right" id="nrTotalRefund">PKR 0</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div class="return-field" style="margin-top:14px">
                    <label>Return Reason <span style="color:#e74c3c">*</span></label>
                    <select class="form-select form-select-sm" id="nrReason" style="border-radius:6px">
                        <optgroup label="Patient Returns">
                            <option value="Medicine not needed">Medicine not needed</option>
                            <option value="Wrong medicine dispensed">Wrong medicine dispensed</option>
                            <option value="Patient condition improved">Patient condition improved</option>
                            <option value="Adverse reaction">Adverse reaction</option>
                            <option value="Duplicate dispensing">Duplicate dispensing</option>
                        </optgroup>
                        <optgroup label="Hospital / POS Returns">
                            <option value="Customer return">Customer return</option>
                            <option value="Billing error">Billing error</option>
                            <option value="Overstock">Overstock</option>
                            <option value="Near expiry">Near expiry</option>
                            <option value="Damaged item">Damaged item</option>
                            <option value="Wrong item issued">Wrong item issued</option>
                            <option value="Administrative correction">Administrative correction</option>
                        </optgroup>
                    </select>
                </div>
                <div class="return-field"><label>Notes</label><textarea class="form-control form-control-sm" id="nrNotes" rows="2" placeholder="Additional notes..." style="border-radius:6px"></textarea></div>
            </div>

            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
                <button class="btn btn-sm" data-bs-dismiss="offcanvas" style="border:1px solid var(--color-border);font-size:13px;padding:6px 16px;border-radius:6px">Cancel</button>
                <button class="btn btn-sm" id="nrSubmitBtn" onclick="ReturnsApp.submitNewReturn()" style="background:var(--aquamint);color:#003366;font-size:13px;font-weight:600;padding:6px 20px;border-radius:6px;border:none">Create Return</button>
            </div>
        `;

        this._nrItems = [];

        // close dropdown on outside click
        document.addEventListener('click', function _nrClose(e) {
            const drop = document.getElementById('nrOrderDrop');
            if (drop && !drop.closest('.nr-combo-wrap')?.contains(e.target)) {
                drop?.classList.remove('open');
            }
            if (!document.getElementById('newReturnPanel')?.contains(e.target)) {
                document.removeEventListener('click', _nrClose);
            }
        });

        // load completed medication orders + paid POS transactions in parallel
        this._nrOrders = [];
        const combined = this._nrOrders;
        $.get('/api/medication-orders?status=Completed', (orders) => {
            (orders || []).forEach(o => combined.push({
                _type: 'order', id: o.orderId,
                patientName: o.patientName, mrn: o.mrn || '',
                department: o.department || '', meta: o.status,
            }));
        });
        $.get('/api/pharmacy-billing/transactions?paymentStatus=Paid', (txns) => {
            (txns || []).forEach(t => combined.push({
                _type: 'txn', id: t.transactionId,
                patientName: t.patientName, mrn: t.mrn || '',
                department: t.department || '', meta: 'POS Sale',
            }));
        });

        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('newReturnPanel')).show();
    },

    onOrderSearchFocus() {
        this._nrRenderDrop(document.getElementById('nrOrderSearch').value);
    },

    onOrderSearch() {
        this._nrRenderDrop(document.getElementById('nrOrderSearch').value);
        document.getElementById('nrOrderId').value = '';
        document.getElementById('nrPatientBlock').style.display = 'none';
        document.getElementById('nrItemsWrap').style.display = 'none';
        this._nrItems = [];
    },

    _nrRenderDrop(term) {
        const drop = document.getElementById('nrOrderDrop');
        if (!drop) return;
        const q = (term || '').toLowerCase();
        const list = q
            ? this._nrOrders.filter(o =>
                o.id.toLowerCase().includes(q) ||
                (o.patientName || '').toLowerCase().includes(q) ||
                (o.mrn || '').toLowerCase().includes(q))
            : this._nrOrders.slice(0, 30);

        if (!list.length) {
            drop.innerHTML = '<div style="padding:10px 12px;font-size:12px;color:#6b7280">No records found — data may still be loading</div>';
        } else {
            drop.innerHTML = list.map(o => {
                const badge = o._type === 'order'
                    ? `<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;background:#003366;color:#7FFFD4;margin-left:6px">MO</span>`
                    : `<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;background:#22c55e;color:#fff;margin-left:6px">POS</span>`;
                return `
                <div class="nr-combo-item" onclick="ReturnsApp.onOrderSelect('${o.id}','${o._type}')">
                    <div class="nr-combo-item-id">${o.id}${badge}</div>
                    <div class="nr-combo-item-meta">${o.patientName} &nbsp;·&nbsp; ${o.mrn} &nbsp;·&nbsp; ${o.meta} &nbsp;·&nbsp; ${o.department}</div>
                </div>`;
            }).join('');
        }
        drop.classList.add('open');
    },

    onOrderSelect(id, type) {
        document.getElementById('nrOrderDrop')?.classList.remove('open');
        document.getElementById('nrOrderSearch').value = id;
        document.getElementById('nrOrderId').value = id;

        const tbody = document.getElementById('nrItemsTbody');
        const itemsWrap = document.getElementById('nrItemsWrap');
        itemsWrap.style.display = 'block';
        tbody.innerHTML = '<tr><td colspan="6" style="padding:14px;text-align:center;color:var(--color-muted-foreground);font-size:13px">Loading items…</td></tr>';
        document.getElementById('nrTotalRefund').textContent = 'PKR 0';

        const endpoint = type === 'txn'
            ? '/api/pharmacy-billing/transactions/' + id
            : '/api/medication-orders/' + id;

        $.get(endpoint, (data) => {
            document.getElementById('nrPatientName').value = data.patientName || '';
            document.getElementById('nrMrn').value = data.mrn || '';
            document.getElementById('nrPatientBlock').style.display = 'block';

            const raw = data.items || [];
            this._nrItems = raw.map(item => ({
                name: item.name + (item.form ? ' (' + item.form + ')' : ''),
                batch: item.batch?.batchNumber || item.batchNumber || '',
                expiry: item.batch?.expiryDate || item.expiryDate || '',
                qty: item.qty || 0,
                unitPrice: item.unitPrice || 0,
                total: item.total || ((item.unitPrice || 0) * (item.qty || 0)),
            }));

            this._nrRenderItemsTable();
        }).fail(() => {
            tbody.innerHTML = '<tr><td colspan="6" style="padding:14px;text-align:center;color:#e74c3c;font-size:13px">Failed to load items — please try again</td></tr>';
        });
    },

    _nrRenderItemsTable() {
        const tbody = document.getElementById('nrItemsTbody');
        if (!this._nrItems.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="padding:14px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No items found</td></tr>';
            return;
        }
        tbody.innerHTML = this._nrItems.map((item, i) => `
            <tr>
                <td style="padding:7px 10px">
                    <div style="font-size:12px;font-weight:500;color:var(--color-foreground)">${item.name}</div>
                </td>
                <td style="padding:7px 10px;text-align:center;font-size:11px;color:#6b7280">${item.batch || 'N/A'}</td>
                <td style="padding:7px 10px;text-align:center;font-size:11px;color:#6b7280">${item.expiry || 'N/A'}</td>
                <td style="padding:7px 10px;text-align:center;font-size:12px;font-weight:600">${item.qty}</td>
                <td style="padding:7px 10px;text-align:center">
                    <input type="number" class="nr-qty-inp" id="nrQty_${i}" value="0" min="0" max="${item.qty}"
                        oninput="ReturnsApp._nrUpdateRow(${i})" style="width:60px;height:28px;text-align:center;padding:0 4px;border:1px solid #dee2e6;border-radius:5px;font-size:12px;font-weight:600;color:#003366">
                    <div style="font-size:10px;color:#9ca3af;margin-top:2px">max ${item.qty}</div>
                </td>
                <td class="nr-row-amt" id="nrAmt_${i}" style="padding:7px 10px;font-family:monospace;font-size:12px;font-weight:600;color:#9ca3af;text-align:right">—</td>
            </tr>`).join('');
    },

    _nrUpdateRow(i) {
        const item = this._nrItems[i];
        if (!item) return;
        const inp = document.getElementById('nrQty_' + i);
        let qty = parseInt(inp.value) || 0;
        if (qty < 0) { qty = 0; inp.value = 0; }
        if (qty > item.qty) { qty = item.qty; inp.value = qty; }
        const amt = qty * item.unitPrice;
        const cell = document.getElementById('nrAmt_' + i);
        if (qty > 0) {
            cell.textContent = 'PKR ' + amt.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
            cell.style.color = '#003366';
        } else {
            cell.textContent = '—';
            cell.style.color = '#9ca3af';
        }
        this._nrUpdateTotal();
    },

    _nrUpdateTotal() {
        let total = 0;
        (this._nrItems || []).forEach((item, i) => {
            const qty = parseInt(document.getElementById('nrQty_' + i)?.value) || 0;
            total += qty * item.unitPrice;
        });
        document.getElementById('nrTotalRefund').textContent =
            'PKR ' + total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },

    async submitNewReturn() {
        const orderId = document.getElementById('nrOrderId').value;
        if (!orderId) { this.showToast('Please select an Order ID', 'error'); return; }

        const patientName = document.getElementById('nrPatientName').value;
        const mrn = document.getElementById('nrMrn').value;
        const reason = document.getElementById('nrReason').value;
        const notes = document.getElementById('nrNotes').value;
        const token = $('meta[name="csrf-token"]').attr('content');

        // collect rows where return qty > 0
        const selected = (this._nrItems || []).reduce((acc, item, i) => {
            const qty = parseInt(document.getElementById('nrQty_' + i)?.value) || 0;
            if (qty > 0) acc.push({ item, qty });
            return acc;
        }, []);

        if (!selected.length) { this.showToast('Enter return quantity for at least one item', 'error'); return; }

        const btn = document.getElementById('nrSubmitBtn');
        btn.disabled = true;
        btn.textContent = 'Creating…';

        let created = 0, failed = 0;
        for (const { item, qty } of selected) {
            try {
                await new Promise((resolve, reject) => {
                    $.ajax({
                        url: '/api/returns/patient', method: 'POST', contentType: 'application/json',
                        data: JSON.stringify({
                            patientName, mrn, orderId,
                            medicineName: item.name,
                            batchNumber: item.batch || '',
                            expiryDate: item.expiry || '',
                            quantity: qty,
                            reason,
                            patientNotes: notes,
                            originalAmount: parseFloat((qty * item.unitPrice).toFixed(2)),
                        }),
                        headers: { 'X-CSRF-TOKEN': token },
                        success: (r) => { if (r.success) { created++; resolve(); } else reject(); },
                        error: () => reject(),
                    });
                });
            } catch { failed++; }
        }

        btn.disabled = false;
        btn.textContent = 'Create Return';

        if (created > 0) {
            this.showToast(created + ' return' + (created > 1 ? 's' : '') + ' created' + (failed > 0 ? ', ' + failed + ' failed' : ''), created > 0 && failed === 0 ? 'success' : 'error');
            bootstrap.Offcanvas.getInstance(document.getElementById('newReturnPanel'))?.hide();
            this.loadPatientReturns();
            this.loadDashboard();
        } else {
            this.showToast('Failed to create returns', 'error');
        }
    },

    // ── Purchase Returns ──────────────────────────────────────────────────────────

    loadPurchaseReturns() {
        document.getElementById('purchaseReturnLoading').classList.remove('is-hidden');
        document.getElementById('purchaseReturnEmpty').classList.add('is-hidden');
        document.getElementById('tblPurchaseReturn').style.display = 'none';
        document.getElementById('purchaseReturnPagination').style.display = 'none';

        $.get('/api/returns/supplier', (data) => {
            this.allPurchaseReturn = Array.isArray(data) ? data : [];
            document.getElementById('purchaseReturnLoading').classList.add('is-hidden');
            this.purchaseReturnPage = 1;
            this.applyPurchaseReturnFilters();
        }).fail(() => {
            document.getElementById('purchaseReturnLoading').classList.add('is-hidden');
            document.getElementById('purchaseReturnEmpty').classList.remove('is-hidden');
        });
    },

    applyPurchaseReturnFilters() {
        const search = (document.getElementById('searchPurchaseReturn').value || '').toLowerCase();
        this.filteredPurchaseReturn = this.allPurchaseReturn.filter(r => {
            if (!search) return true;
            const hay = [r.rtv_id, r.supplier_name, r.po_reference, r.reason].join(' ').toLowerCase();
            return hay.includes(search);
        });
        this.renderPurchaseReturnTable();
        this.renderPurchaseReturnPagination();
    },

    renderPurchaseReturnTable() {
        const start = (this.purchaseReturnPage - 1) * this.purchaseReturnRowsPer;
        const slice = this.filteredPurchaseReturn.slice(start, start + this.purchaseReturnRowsPer);
        const tbody = document.getElementById('purchaseReturnBody');

        if (!this.filteredPurchaseReturn.length) {
            document.getElementById('tblPurchaseReturn').style.display = 'none';
            document.getElementById('purchaseReturnEmpty').classList.remove('is-hidden');
            return;
        }
        document.getElementById('purchaseReturnEmpty').classList.add('is-hidden');
        document.getElementById('tblPurchaseReturn').style.display = '';

        const statusColors = { Draft: '#6b7280', Initiated: '#3b82f6', Approved: '#27ae60', Rejected: '#e74c3c' };
        tbody.innerHTML = slice.map(r => {
            const statusColor = statusColors[r.status] || '#6b7280';
            const date = r.return_date ? new Date(r.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-';
            const items = Array.isArray(r.items) ? r.items : [];
            const medicinesSummary = items.length ? items.map(i => i.medicineName || i.name || '').filter(Boolean).join(', ') : '-';
            const totalQty = items.reduce((s, i) => s + (parseInt(i.qty) || 0), 0);
            return `<tr>
                <td style="padding:10px 16px;font-weight:600;color:var(--aquamint);font-size:12px">${r.rtv_id}</td>
                <td style="padding:10px 16px;font-size:12px">${date}</td>
                <td style="padding:10px 16px;font-size:12px;font-weight:500">${r.supplier_name || '-'}</td>
                <td style="padding:10px 16px;font-size:12px;color:var(--aquamint)">${r.po_reference || '-'}</td>
                <td style="padding:10px 16px;font-size:11px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${medicinesSummary}">${medicinesSummary}</td>
                <td style="padding:10px 16px;font-size:12px;text-align:center">${totalQty || r.items_count || '-'}</td>
                <td style="padding:10px 16px;font-size:11px;color:var(--color-muted-foreground)">${r.reason}</td>
                <td style="padding:10px 16px;font-weight:600;font-size:12px">PKR ${Number(r.total_credit || 0).toLocaleString()}</td>
                <td style="padding:10px 16px"><span style="font-size:11px;padding:3px 8px;border-radius:4px;background:${statusColor}15;color:${statusColor};font-weight:500">${r.status}</span></td>
            </tr>`;
        }).join('');
        lucide.createIcons();
    },

    renderPurchaseReturnPagination() {
        this._renderPagination(
            { pagination: 'purchaseReturnPagination', info: 'purchaseReturnPageInfo', prev: 'purchaseReturnPrevPage', next: 'purchaseReturnNextPage', nums: 'purchaseReturnPageNums', goTo: 'goToPurchaseReturnPage' },
            this.purchaseReturnPage, this.purchaseReturnRowsPer, this.filteredPurchaseReturn.length
        );
    },

    goToPurchaseReturnPage(p) {
        const pages = Math.ceil(this.filteredPurchaseReturn.length / this.purchaseReturnRowsPer) || 1;
        if (p < 1 || p > pages) return;
        this.purchaseReturnPage = p;
        this.renderPurchaseReturnTable();
        this.renderPurchaseReturnPagination();
    },

    showNewPurchaseReturn() {
        document.getElementById('newPurchaseReturnTitle').textContent = 'New Purchase Return';
        document.getElementById('newPurchaseReturnBody').innerHTML = `
            <style>
            .pr-combo-wrap{position:relative}
            .pr-combo-drop{display:none;position:absolute;top:100%;left:0;right:0;max-height:220px;overflow-y:auto;background:#fff;border:1px solid #dee2e6;border-radius:8px;z-index:1050;box-shadow:0 6px 20px rgba(0,0,0,.12);margin-top:2px}
            .pr-combo-drop.open{display:block}
            .pr-combo-item{padding:9px 12px;cursor:pointer;border-bottom:1px solid #f3f4f6;font-size:13px}
            .pr-combo-item:last-child{border-bottom:none}
            .pr-combo-item:hover{background:rgba(6,7,64,.05)}
            .pr-combo-item-id{font-weight:600;color:#003366}
            .pr-combo-item-meta{font-size:11px;color:#6b7280;margin-top:1px}
            .pr-readonly{background:#f8f9fa!important;cursor:default}
            .pr-items-table{width:100%;border-collapse:collapse;font-size:12px}
            .pr-items-table th{padding:7px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:var(--color-muted-foreground);background:var(--color-muted);white-space:nowrap}
            .pr-items-table td{padding:7px 10px;border-bottom:1px solid var(--color-border);vertical-align:middle}
            .pr-items-table tbody tr:last-child td{border-bottom:none}
            </style>

            <div class="return-field">
                <label>Purchase Order / PO ID <span style="color:#e74c3c">*</span></label>
                <div class="pr-combo-wrap">
                    <input type="text" class="form-control form-control-sm" id="prPoSearch" placeholder="Search by PO ID or supplier name..." autocomplete="off"
                        oninput="ReturnsApp.onPoSearch()" onfocus="ReturnsApp.onPoSearchFocus()" style="border-radius:6px">
                    <input type="hidden" id="prPoId">
                    <div class="pr-combo-drop" id="prPoDrop"></div>
                </div>
            </div>

            <div id="prSupplierBlock" style="display:none">
                <div class="row">
                    <div class="col-7 return-field"><label>Supplier</label><input type="text" class="form-control form-control-sm pr-readonly" id="prSupplierName" readonly style="border-radius:6px"></div>
                    <div class="col-5 return-field"><label>PO Date</label><input type="text" class="form-control form-control-sm pr-readonly" id="prPoDate" readonly style="border-radius:6px"></div>
                </div>
            </div>

            <div id="prItemsWrap" style="display:none">
                <div style="font-size:11.5px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">
                    Select Items to Return — enter qty &gt; 0 for each item
                </div>
                <div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden">
                    <table class="pr-items-table">
                        <thead>
                            <tr>
                                <th style="text-align:left">Medicine</th>
                                <th style="text-align:center">Batch No</th>
                                <th style="text-align:center">Mfg Date</th>
                                <th style="text-align:center">Expiry Date</th>
                                <th style="text-align:center">Ordered</th>
                                <th style="text-align:center">Return Qty</th>
                                <th style="text-align:right">Credit</th>
                            </tr>
                        </thead>
                        <tbody id="prItemsTbody"></tbody>
                        <tfoot>
                            <tr style="background:var(--color-muted)">
                                <td colspan="6" style="padding:8px 10px;font-size:12px;font-weight:700;text-align:right;color:var(--color-foreground)">Total Credit</td>
                                <td style="padding:8px 10px;font-family:monospace;font-size:13px;font-weight:700;color:#003366;text-align:right" id="prTotalCredit">PKR 0</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div class="return-field" style="margin-top:14px">
                    <label>Return Reason <span style="color:#e74c3c">*</span></label>
                    <select class="form-select form-select-sm" id="prReason" style="border-radius:6px">
                        <option value="Damaged on delivery">Damaged on delivery</option>
                        <option value="Wrong item received">Wrong item received</option>
                        <option value="Short expiry">Short expiry</option>
                        <option value="Quality issue">Quality issue</option>
                        <option value="Overstock">Overstock</option>
                        <option value="Billing error">Billing error</option>
                        <option value="Not ordered">Not ordered</option>
                    </select>
                </div>
                <div class="return-field"><label>Notes</label><textarea class="form-control form-control-sm" id="prNotes" rows="2" placeholder="Additional notes..." style="border-radius:6px"></textarea></div>
            </div>

            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
                <button class="btn btn-sm" data-bs-dismiss="offcanvas" style="border:1px solid var(--color-border);font-size:13px;padding:6px 16px;border-radius:6px">Cancel</button>
                <button class="btn btn-sm" id="prSubmitBtn" onclick="ReturnsApp.submitPurchaseReturn()" style="background:var(--aquamint);color:#003366;font-size:13px;font-weight:600;padding:6px 20px;border-radius:6px;border:none">Create Return</button>
            </div>
        `;

        this._prItems = [];

        document.addEventListener('click', function _prClose(e) {
            const drop = document.getElementById('prPoDrop');
            if (drop && !drop.closest('.pr-combo-wrap')?.contains(e.target)) drop?.classList.remove('open');
            if (!document.getElementById('newPurchaseReturnPanel')?.contains(e.target)) document.removeEventListener('click', _prClose);
        });

        this._prOrders = [];
        $.get('/api/stock-alerts/purchase-orders?status=Completed', (pos) => {
            ReturnsApp._prOrders = pos || [];
        });

        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('newPurchaseReturnPanel')).show();
    },

    onPoSearchFocus() {
        this._prRenderDrop(document.getElementById('prPoSearch').value);
    },

    onPoSearch() {
        this._prRenderDrop(document.getElementById('prPoSearch').value);
        document.getElementById('prPoId').value = '';
        document.getElementById('prSupplierBlock').style.display = 'none';
        document.getElementById('prItemsWrap').style.display = 'none';
        this._prItems = [];
    },

    _prRenderDrop(term) {
        const drop = document.getElementById('prPoDrop');
        if (!drop) return;
        const q = (term || '').toLowerCase();
        const list = q
            ? this._prOrders.filter(o => o.poId.toLowerCase().includes(q) || (o.supplierName || '').toLowerCase().includes(q))
            : this._prOrders.slice(0, 30);

        drop.innerHTML = list.length
            ? list.map(o => `
                <div class="pr-combo-item" onclick="ReturnsApp.onPoSelect('${o.poId}')">
                    <div class="pr-combo-item-id">${o.poId}</div>
                    <div class="pr-combo-item-meta">${o.supplierName} &nbsp;·&nbsp; ${o.poDate} &nbsp;·&nbsp; ${o.totalItems} items &nbsp;·&nbsp; ${o.status}</div>
                </div>`).join('')
            : '<div style="padding:10px 12px;font-size:12px;color:#6b7280">No completed POs found</div>';
        drop.classList.add('open');
    },

    onPoSelect(poId) {
        document.getElementById('prPoDrop')?.classList.remove('open');
        document.getElementById('prPoSearch').value = poId;
        document.getElementById('prPoId').value = poId;

        const tbody = document.getElementById('prItemsTbody');
        document.getElementById('prItemsWrap').style.display = 'block';
        tbody.innerHTML = '<tr><td colspan="4" style="padding:14px;text-align:center;color:var(--color-muted-foreground);font-size:13px">Loading items…</td></tr>';

        $.get('/api/stock-alerts/purchase-orders/' + poId, (po) => {
            document.getElementById('prSupplierName').value = po.supplierName || '';
            document.getElementById('prPoDate').value = po.poDate || '';
            document.getElementById('prSupplierBlock').style.display = 'block';

            this._prItems = (po.items || []).map(item => ({
                medicineName: item.medicineName || '',
                qty: item.quantity || item.receivedQty || 0,
                unitPrice: item.unitPrice || 0,
                batchNumber: item.batchNumber || '',
                manufacturingDate: item.manufacturingDate || '',
                expiryDate: item.expiryDate || '',
            }));
            this._prRenderItemsTable();
        }).fail(() => {
            tbody.innerHTML = '<tr><td colspan="4" style="padding:14px;text-align:center;color:#e74c3c;font-size:13px">Failed to load items</td></tr>';
        });
    },

    _prRenderItemsTable() {
        const tbody = document.getElementById('prItemsTbody');
        if (!this._prItems.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="padding:14px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No items found</td></tr>';
            return;
        }
        const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '<span style="color:#9ca3af">—</span>';
        tbody.innerHTML = this._prItems.map((item, i) => `
            <tr>
                <td style="padding:7px 10px;font-size:12px;font-weight:500">${item.medicineName}</td>
                <td style="padding:7px 10px;text-align:center;font-size:11px;color:#374151">${item.batchNumber || '<span style="color:#9ca3af">—</span>'}</td>
                <td style="padding:7px 10px;text-align:center;font-size:11px;color:#374151">${fmtDate(item.manufacturingDate)}</td>
                <td style="padding:7px 10px;text-align:center;font-size:11px;color:#374151">${fmtDate(item.expiryDate)}</td>
                <td style="padding:7px 10px;text-align:center;font-size:12px;font-weight:600">${item.qty}</td>
                <td style="padding:7px 10px;text-align:center">
                    <input type="number" value="0" min="0" max="${item.qty}" id="prQty_${i}"
                        oninput="ReturnsApp._prUpdateRow(${i})"
                        style="width:60px;height:28px;text-align:center;padding:0 4px;border:1px solid #dee2e6;border-radius:5px;font-size:12px;font-weight:600;color:#003366">
                    <div style="font-size:10px;color:#9ca3af;margin-top:2px">max ${item.qty}</div>
                </td>
                <td style="padding:7px 10px;font-family:monospace;font-size:12px;font-weight:600;color:#9ca3af;text-align:right" id="prAmt_${i}">—</td>
            </tr>`).join('');
        document.getElementById('prTotalCredit').textContent = 'PKR 0';
    },

    _prUpdateRow(i) {
        const item = this._prItems[i];
        if (!item) return;
        const inp = document.getElementById('prQty_' + i);
        let qty = parseInt(inp.value) || 0;
        if (qty < 0) { qty = 0; inp.value = 0; }
        if (qty > item.qty) { qty = item.qty; inp.value = qty; }
        const credit = qty * item.unitPrice;
        const cell = document.getElementById('prAmt_' + i);
        if (qty > 0) {
            cell.textContent = 'PKR ' + credit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
            cell.style.color = '#003366';
        } else {
            cell.textContent = '—';
            cell.style.color = '#9ca3af';
        }
        let total = 0;
        this._prItems.forEach((it, idx) => { total += (parseInt(document.getElementById('prQty_' + idx)?.value) || 0) * it.unitPrice; });
        document.getElementById('prTotalCredit').textContent = 'PKR ' + total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },

    submitPurchaseReturn() {
        const poId = document.getElementById('prPoId').value;
        if (!poId) { this.showToast('Please select a Purchase Order', 'error'); return; }

        const selectedItems = (this._prItems || []).reduce((acc, item, i) => {
            const qty = parseInt(document.getElementById('prQty_' + i)?.value) || 0;
            if (qty > 0) acc.push({
                medicineName: item.medicineName,
                batchNumber: item.batchNumber,
                manufacturingDate: item.manufacturingDate,
                expiryDate: item.expiryDate,
                qty, unitPrice: item.unitPrice,
                credit: parseFloat((qty * item.unitPrice).toFixed(2)),
            });
            return acc;
        }, []);

        if (!selectedItems.length) { this.showToast('Enter return quantity for at least one item', 'error'); return; }

        const po = this._prOrders.find(o => o.poId === poId);
        const btn = document.getElementById('prSubmitBtn');
        btn.disabled = true;
        btn.textContent = 'Creating…';

        const token = $('meta[name="csrf-token"]').attr('content');
        $.ajax({
            url: '/api/returns/supplier', method: 'POST', contentType: 'application/json',
            data: JSON.stringify({
                supplierId: po?.supplierId || '',
                supplierName: document.getElementById('prSupplierName').value,
                poReference: poId,
                reason: document.getElementById('prReason').value,
                notes: document.getElementById('prNotes').value,
                items: selectedItems,
            }),
            headers: { 'X-CSRF-TOKEN': token },
            success: (resp) => {
                btn.disabled = false; btn.textContent = 'Create Return';
                if (resp.success) {
                    this.showToast('Purchase return ' + resp.rtvId + ' created', 'success');
                    bootstrap.Offcanvas.getInstance(document.getElementById('newPurchaseReturnPanel'))?.hide();
                    this.loadPurchaseReturns();
                }
            },
            error: () => {
                btn.disabled = false; btn.textContent = 'Create Return';
                this.showToast('Failed to create purchase return', 'error');
            },
        });
    },

    // ── Expired Stock ─────────────────────────────────────────────────────────────

    loadExpiredStock() {
        document.getElementById('expiredLoading').classList.remove('is-hidden');
        document.getElementById('expiredEmpty').classList.add('is-hidden');
        document.getElementById('tblExpiredStock').style.display = 'none';
        document.getElementById('expiredPagination').style.display = 'none';
        document.getElementById('expiredStockFoot').style.display = 'none';

        $.get('/api/returns/expired', (data) => {
            this.allExpiredItems = Array.isArray(data.items) ? data.items : [];
            this.expiredData = this.allExpiredItems;
            document.getElementById('expiredLoading').classList.add('is-hidden');

            if (this.allExpiredItems.length) {
                document.getElementById('expiredTotalQty').textContent = this.allExpiredItems.reduce((s, e) => s + e.qty, 0);
                document.getElementById('expiredTotalValue').textContent = 'PKR ' + Number(data.totalLoss).toLocaleString();
            }

            this.expiredPage = 1;
            this.applyExpiredClientFilters();
        }).fail(() => {
            document.getElementById('expiredLoading').classList.add('is-hidden');
            document.getElementById('expiredEmpty').classList.remove('is-hidden');
        });
    },

    applyExpiredClientFilters() {
        const search = (document.getElementById('searchExpiredStock').value || '').toLowerCase();

        this.filteredExpiredItems = this.allExpiredItems
            .map((item, origIdx) => ({ item, origIdx }))
            .filter(({ item }) => {
                if (search) {
                    const hay = [item.medicineName, item.batchNumber].join(' ').toLowerCase();
                    if (!hay.includes(search)) return false;
                }
                return true;
            });

        this.renderExpiredTable();
        this.renderExpiredPagination();
    },

    renderExpiredTable() {
        const start = (this.expiredPage - 1) * this.expiredRowsPer;
        const slice = this.filteredExpiredItems.slice(start, start + this.expiredRowsPer);
        const tbody = document.getElementById('expiredStockBody');

        if (!this.filteredExpiredItems.length) {
            document.getElementById('tblExpiredStock').style.display = 'none';
            document.getElementById('expiredStockFoot').style.display = 'none';
            document.getElementById('expiredEmpty').classList.remove('is-hidden');
            return;
        }
        document.getElementById('expiredEmpty').classList.add('is-hidden');
        document.getElementById('tblExpiredStock').style.display = '';
        document.getElementById('expiredStockFoot').style.display = '';

        tbody.innerHTML = slice.map(({ item: e, origIdx: i }) => `<tr style="background:rgba(231,76,60,0.03)">
            <td style="padding:10px 16px"><input type="checkbox" class="form-check-input expired-check" data-idx="${i}" onchange="ReturnsApp.updateSelectedExpired()" style="width:15px;height:15px"></td>
            <td style="padding:10px 16px;font-weight:500">${e.medicineName}</td>
            <td style="padding:10px 16px;font-size:12px">${e.batchNumber}</td>
            <td style="padding:10px 16px;font-size:12px;color:#e74c3c">${e.expiryDate}</td>
            <td style="padding:10px 16px"><span style="font-size:11px;padding:2px 6px;border-radius:4px;background:#fef2f2;color:#dc2626">${e.daysExpired} days</span></td>
            <td style="padding:10px 16px;font-size:12px">${e.qty} ${e.unit}</td>
            <td style="padding:10px 16px;font-weight:600;font-size:12px">PKR ${Number(e.purchaseValue).toLocaleString()}</td>
            <td style="padding:10px 16px"><span style="font-size:11px;padding:2px 6px;border-radius:4px;background:#fef2f2;color:#dc2626;font-weight:500">Loss</span></td>
            <td style="padding:10px 16px"><button class="btn btn-sm" onclick="ReturnsApp.selectedExpired=[${i}];ReturnsApp.showDisposalForm()" style="background:#e74c3c;color:#fff;font-size:11px;padding:3px 10px;border-radius:5px;border:none">Dispose</button></td>
        </tr>`).join('');
    },

    renderExpiredPagination() {
        this._renderPagination(
            { pagination: 'expiredPagination', info: 'expiredPageInfo', prev: 'expiredPrevPage', next: 'expiredNextPage', nums: 'expiredPageNums', goTo: 'goToExpiredPage' },
            this.expiredPage, this.expiredRowsPer, this.filteredExpiredItems.length
        );
    },

    goToExpiredPage(p) {
        const pages = Math.ceil(this.filteredExpiredItems.length / this.expiredRowsPer) || 1;
        if (p < 1 || p > pages) return;
        this.expiredPage = p;
        this.renderExpiredTable();
        this.renderExpiredPagination();
    },

    toggleExpiredRowsMenu(e) { this._toggleMenu('expiredRowsMenu', e); },
    setExpiredRowsPer(n) {
        this.expiredRowsPer = n; this.expiredPage = 1;
        this._setRowsPerBtn('expiredRowsMenu', n);
        this.renderExpiredTable(); this.renderExpiredPagination();
    },
    toggleExpiredColVis(e) { this._toggleMenu('expiredColVisMenu', e); },
    expiredColVisSelectAll() { this._colVisSelectAll('expiredColVisList'); },
    applyExpiredColVis() { this._applyColVis('tblExpiredStock', 'expiredColVisList', 'expiredColVisMenu'); },
    toggleExpiredExportMenu(e) { this._toggleMenu('expiredExportMenu', e); },

    toggleAllExpired(checked) {
        document.querySelectorAll('.expired-check').forEach(cb => { cb.checked = checked; });
        this.updateSelectedExpired();
    },

    updateSelectedExpired() {
        this.selectedExpired = [];
        document.querySelectorAll('.expired-check:checked').forEach(cb => {
            this.selectedExpired.push(parseInt(cb.dataset.idx));
        });
    },

    showDisposalForm() {
        if (!this.selectedExpired.length) {
            this.showToast('Select expired items to dispose', 'error');
            return;
        }
        const items = this.selectedExpired.map(i => this.expiredData[i]);
        const totalLoss = items.reduce((s, e) => s + e.purchaseValue, 0);

        document.getElementById('disposalBody').innerHTML = `
            <div style="background:var(--color-background);border-radius:10px;padding:16px;border:1px solid var(--color-border);margin-bottom:16px">
                <h6 style="font-size:13px;font-weight:600;margin-bottom:12px;font-family:'Roobert',sans-serif">1. Expired Medicines (${items.length} items)</h6>
                ${items.map(e => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--color-border);font-size:13px">
                    <span>${e.medicineName} <span style="color:var(--color-muted-foreground);font-size:11px">(${e.batchNumber})</span></span>
                    <span>${e.qty} ${e.unit} - <strong>PKR ${Number(e.purchaseValue).toLocaleString()}</strong></span>
                </div>`).join('')}
                <div style="margin-top:8px;font-weight:700;text-align:right;color:#e74c3c">Total Loss: PKR ${totalLoss.toLocaleString()}</div>
            </div>
            <div style="background:var(--color-background);border-radius:10px;padding:16px;border:1px solid var(--color-border);margin-bottom:16px">
                <h6 style="font-size:13px;font-weight:600;margin-bottom:12px;font-family:'Roobert',sans-serif">2. Witnesses</h6>
                <div class="row g-2">
                    <div class="col-6 return-field"><label>Witness 1</label><input type="text" class="form-control form-control-sm" id="dspWitness1" value="Pharmacist Ahmed" style="border-radius:6px"></div>
                    <div class="col-6 return-field"><label>Witness 2</label><input type="text" class="form-control form-control-sm" id="dspWitness2" value="Dr. Ayesha Siddiqui" style="border-radius:6px"></div>
                </div>
            </div>
            <div style="background:var(--color-background);border-radius:10px;padding:16px;border:1px solid var(--color-border);margin-bottom:16px">
                <h6 style="font-size:13px;font-weight:600;margin-bottom:12px;font-family:'Roobert',sans-serif">3. Disposal Method</h6>
                <select class="form-select form-select-sm" id="dspMethod" style="border-radius:6px">
                    <option value="Return to Supplier">Return to Supplier (if allowed)</option>
                    <option value="Incineration">Incineration (via waste company)</option>
                    <option value="Waste Management Company" selected>Waste Management Company</option>
                    <option value="Chemical Deactivation">Chemical Deactivation</option>
                    <option value="Safe Disposal">Safe Disposal (as per guidelines)</option>
                </select>
            </div>
            <div style="background:var(--color-background);border-radius:10px;padding:16px;border:1px solid var(--color-border);margin-bottom:16px">
                <h6 style="font-size:13px;font-weight:600;margin-bottom:12px;font-family:'Roobert',sans-serif">4. Disposal Details</h6>
                <div class="return-field"><label>Disposal Facility</label><input type="text" class="form-control form-control-sm" id="dspFacility" placeholder="e.g. SafeDispose Pvt Ltd" style="border-radius:6px"></div>
                <div class="return-field"><label>Certificate Number</label><input type="text" class="form-control form-control-sm" id="dspCert" placeholder="CERT-2026-XXX" style="border-radius:6px"></div>
                <div class="return-field"><label>Notes</label><textarea class="form-control form-control-sm" id="dspNotes" rows="2" placeholder="Additional notes..." style="border-radius:6px"></textarea></div>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end">
                <button class="btn btn-sm" data-bs-dismiss="offcanvas" style="border:1px solid var(--color-border);font-size:13px;padding:6px 16px;border-radius:6px">Cancel</button>
                <button class="btn btn-sm" onclick="ReturnsApp.submitDisposal()" style="background:#e74c3c;color:#fff;font-size:13px;font-weight:600;padding:6px 20px;border-radius:6px;border:none">
                    <i data-lucide="trash-2" style="width:14px;height:14px;margin-right:4px"></i> Complete Disposal
                </button>
            </div>
        `;
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('disposalPanel')).show();
    },

    submitDisposal() {
        const items = this.selectedExpired.map(i => this.expiredData[i]);
        const data = {
            _token: $('meta[name="csrf-token"]').attr('content'),
            items,
            disposalMethod: document.getElementById('dspMethod').value,
            disposalFacility: document.getElementById('dspFacility').value,
            certificateNumber: document.getElementById('dspCert').value,
            witness1: document.getElementById('dspWitness1').value,
            witness2: document.getElementById('dspWitness2').value,
            notes: document.getElementById('dspNotes').value,
        };
        $.ajax({
            url: '/api/returns/disposals', method: 'POST', contentType: 'application/json',
            data: JSON.stringify(data), headers: { 'X-CSRF-TOKEN': data._token },
            success: (resp) => {
                if (resp.success) {
                    this.showToast(resp.message, 'success');
                    bootstrap.Offcanvas.getInstance(document.getElementById('disposalPanel'))?.hide();
                    this.loadExpiredStock();
                    this.loadDashboard();
                }
            },
            error: () => this.showToast('Failed to create disposal record', 'error'),
        });
    },

    // ── Near-Expiry ──────────────────────────────────────────────────────────────

    loadNearExpiry() {
        document.getElementById('nearLoading').classList.remove('is-hidden');
        document.getElementById('nearEmpty').classList.add('is-hidden');
        document.getElementById('tblNearExpiry').style.display = 'none';
        document.getElementById('nearPagination').style.display = 'none';

        $.get('/api/returns/near-expiry', (data) => {
            this.allNear = Array.isArray(data) ? data : [];
            document.getElementById('nearLoading').classList.add('is-hidden');
            this.nearPage = 1;
            this.applyNearClientFilters();
        }).fail(() => {
            document.getElementById('nearLoading').classList.add('is-hidden');
            document.getElementById('nearEmpty').classList.remove('is-hidden');
        });
    },

    applyNearClientFilters() {
        const search = (document.getElementById('searchNearExpiry').value || '').toLowerCase();

        this.filteredNear = this.allNear.filter(n => {
            if (search) {
                const hay = [n.medicineName, n.batchNumber].join(' ').toLowerCase();
                if (!hay.includes(search)) return false;
            }
            return true;
        });

        this.renderNearTable();
        this.renderNearPagination();
    },

    renderNearTable() {
        const start = (this.nearPage - 1) * this.nearRowsPer;
        const slice = this.filteredNear.slice(start, start + this.nearRowsPer);
        const tbody = document.getElementById('nearExpiryBody');

        if (!this.filteredNear.length) {
            document.getElementById('tblNearExpiry').style.display = 'none';
            document.getElementById('nearEmpty').classList.remove('is-hidden');
            return;
        }
        document.getElementById('nearEmpty').classList.add('is-hidden');
        document.getElementById('tblNearExpiry').style.display = '';

        tbody.innerHTML = slice.map(n => {
            const daysColor = n.daysRemaining <= 30 ? '#e74c3c' : n.daysRemaining <= 90 ? '#f39c12' : '#e67e22';
            const recColors = { 'Use First': '#27ae60', 'Return/Discount': '#e67e22', 'Discount Sale': '#f39c12', 'Accept Loss': '#e74c3c' };
            const recColor = recColors[n.recommendation] || '#6b7280';
            const usageColor = n.estimatedUsage === 'Will consume' ? '#27ae60' : '#e67e22';
            let actions = `<button class="btn btn-sm" style="font-size:10px;padding:2px 8px;border-radius:4px;background:${recColor}15;color:${recColor};border:1px solid ${recColor}30">`;
            if (n.recommendation === 'Use First') actions += 'Label FIFO</button>';
            else if (n.recommendation.includes('Return')) actions += 'Return</button> <button class="btn btn-sm" style="font-size:10px;padding:2px 8px;border-radius:4px;background:#f39c1215;color:#f39c12;border:1px solid #f39c1230">Discount</button>';
            else if (n.recommendation === 'Discount Sale') actions += 'Discount</button>';
            else actions += 'Prepare</button>';

            return `<tr>
                <td style="padding:10px 16px;font-weight:500">${n.medicineName}</td>
                <td style="padding:10px 16px;font-size:12px">${n.batchNumber}</td>
                <td style="padding:10px 16px;font-size:12px">${n.expiryMonth}</td>
                <td style="padding:10px 16px"><span style="font-size:11px;padding:2px 6px;border-radius:4px;background:${daysColor}15;color:${daysColor};font-weight:600">${n.daysRemaining} days</span></td>
                <td style="padding:10px 16px;font-size:12px">${n.qty} ${n.unit}</td>
                <td style="padding:10px 16px"><span style="font-size:11px;color:${usageColor};font-weight:500">${n.estimatedUsage}</span></td>
                <td style="padding:10px 16px"><span style="font-size:11px;padding:3px 8px;border-radius:4px;background:${recColor}15;color:${recColor};font-weight:500">${n.recommendation}</span></td>
                <td style="padding:10px 16px">${actions}</td>
            </tr>`;
        }).join('');
    },

    renderNearPagination() {
        this._renderPagination(
            { pagination: 'nearPagination', info: 'nearPageInfo', prev: 'nearPrevPage', next: 'nearNextPage', nums: 'nearPageNums', goTo: 'goToNearPage' },
            this.nearPage, this.nearRowsPer, this.filteredNear.length
        );
    },

    goToNearPage(p) {
        const pages = Math.ceil(this.filteredNear.length / this.nearRowsPer) || 1;
        if (p < 1 || p > pages) return;
        this.nearPage = p;
        this.renderNearTable();
        this.renderNearPagination();
    },

    toggleNearRowsMenu(e) { this._toggleMenu('nearRowsMenu', e); },
    setNearRowsPer(n) {
        this.nearRowsPer = n; this.nearPage = 1;
        this._setRowsPerBtn('nearRowsMenu', n);
        this.renderNearTable(); this.renderNearPagination();
    },
    toggleNearColVis(e) { this._toggleMenu('nearColVisMenu', e); },
    nearColVisSelectAll() { this._colVisSelectAll('nearColVisList'); },
    applyNearColVis() { this._applyColVis('tblNearExpiry', 'nearColVisList', 'nearColVisMenu'); },
    toggleNearExportMenu(e) { this._toggleMenu('nearExportMenu', e); },

    // ── Utilities ────────────────────────────────────────────────────────────────

    refresh() {
        this.loadDashboard();
        this.loadPatientReturns();
        this.loadWardReturns();
        this.loadSupplierReturns();
        this.loadExpiredStock();
        this.loadNearExpiry();
    },

    showToast(message, type) {
        const color = type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db';
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:' + color + ';color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
    },
};

document.addEventListener('DOMContentLoaded', () => ReturnsApp.init());
