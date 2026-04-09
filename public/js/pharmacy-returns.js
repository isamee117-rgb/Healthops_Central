const ReturnsApp = {
    expiredData: [],
    selectedExpired: [],

    init() {
        this.loadDashboard();
        this.loadPatientReturns();
        this.loadWardReturns();
        this.loadSupplierReturns();
        this.loadExpiredStock();
        this.loadNearExpiry();

        document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', () => {
                lucide.createIcons();
            });
        });
        lucide.createIcons();
    },

    loadDashboard() {
        $.get('/api/returns/dashboard', (d) => {
            document.getElementById('statPatientReturns').textContent = d.patientReturns;
            document.getElementById('statPatientPending').textContent = d.patientReturnsPending + ' pending';
            document.getElementById('statWardReturns').textContent = d.wardReturns;
            document.getElementById('statWardPending').textContent = d.wardReturnsPending + ' pending';
            document.getElementById('statSupplierReturns').textContent = d.supplierReturns;
            document.getElementById('statSupplierPending').textContent = d.supplierReturnsPending + ' pending';
            document.getElementById('statExpired').textContent = d.expiredCount;
            document.getElementById('statExpiredLoss').textContent = 'PKR ' + Number(d.expiredLoss).toLocaleString() + ' loss';
            document.getElementById('statNearExpiry').textContent = d.nearExpiryCount;
            document.getElementById('statRefunds').textContent = 'PKR ' + Number(d.totalRefunds).toLocaleString();
        });
    },

    loadPatientReturns() {
        const params = new URLSearchParams();
        const st = document.getElementById('filterPatientStatus').value;
        const s = document.getElementById('searchPatientReturns').value;
        if (st) params.append('status', st);
        if (s) params.append('search', s);

        $.get('/api/returns/patient?' + params.toString(), (data) => {
            const tbody = document.getElementById('patientReturnsBody');
            if (!data.length) {
                tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:30px;color:var(--color-muted-foreground)">No patient returns found</td></tr>';
                return;
            }
            tbody.innerHTML = data.map(r => {
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
        });
    },

    showProcessReturn(returnId) {
        $.get('/api/returns/patient', (data) => {
            const r = data.find(x => x.return_id === returnId);
            if (!r) return;

            const purchaseDate = r.purchase_date ? new Date(r.purchase_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
            const returnDate = new Date(r.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const daysSince = r.purchase_date ? Math.ceil((new Date(r.return_date) - new Date(r.purchase_date)) / 86400000) : 0;
            const policyText = daysSince <= 7 ? 'Full refund (<7 days)' : '80% refund (>7 days)';
            const refundAmt = daysSince <= 7 ? r.original_amount : Math.round(r.original_amount * 0.8);

            document.getElementById('processTitle').textContent = 'Process Return - ' + returnId;
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
                    <div class="condition-option ${r.condition === 'Unopened' ? 'selected' : ''}" onclick="ReturnsApp.selectCondition(this, 'Unopened')">
                        <input type="radio" name="condition" value="Unopened" ${r.condition === 'Unopened' ? 'checked' : ''}> Unopened <span style="font-size:11px;color:var(--color-muted-foreground)">(Can restock if expiry >6 months)</span>
                    </div>
                    <div class="condition-option ${r.condition === 'Opened' ? 'selected' : ''}" onclick="ReturnsApp.selectCondition(this, 'Opened')">
                        <input type="radio" name="condition" value="Opened" ${r.condition === 'Opened' ? 'checked' : ''}> Opened <span style="font-size:11px;color:var(--color-muted-foreground)">(Cannot restock, dispose)</span>
                    </div>
                    <div class="condition-option" onclick="ReturnsApp.selectCondition(this, 'Damaged')">
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
                    <div class="condition-option selected" onclick="ReturnsApp.selectRefundMethod(this, 'Cash Refund')">
                        <input type="radio" name="refundMethod" value="Cash Refund" checked> Cash Refund
                    </div>
                    <div class="condition-option" onclick="ReturnsApp.selectRefundMethod(this, 'Credit Note')">
                        <input type="radio" name="refundMethod" value="Credit Note"> Credit Note (for future purchase)
                    </div>
                    <div class="condition-option" onclick="ReturnsApp.selectRefundMethod(this, 'Account Adjustment')">
                        <input type="radio" name="refundMethod" value="Account Adjustment"> Adjust in Account (if IPD patient)
                    </div>
                </div>
                <div style="display:flex;gap:8px;justify-content:flex-end">
                    <button class="btn btn-sm" data-bs-dismiss="offcanvas" style="border:1px solid var(--color-border);font-size:13px;padding:6px 16px;border-radius:6px">Cancel</button>
                    <button class="btn btn-sm" onclick="ReturnsApp.submitProcessReturn('${returnId}', ${refundAmt})" style="background:var(--aquamint);color:#003366;font-size:13px;font-weight:600;padding:6px 20px;border-radius:6px;border:none">
                        <i data-lucide="check" style="width:14px;height:14px;margin-right:4px"></i> Approve Return & Process Refund
                    </button>
                </div>
            `;
            lucide.createIcons();
            new bootstrap.Offcanvas(document.getElementById('processReturnPanel')).show();
        });
    },

    selectCondition(el, value) {
        document.querySelectorAll('.condition-option[onclick*="selectCondition"]').forEach(e => { e.classList.remove('selected'); e.querySelector('input').checked = false; });
        el.classList.add('selected');
        el.querySelector('input').checked = true;
    },

    selectRefundMethod(el, value) {
        document.querySelectorAll('.condition-option[onclick*="selectRefundMethod"]').forEach(e => { e.classList.remove('selected'); e.querySelector('input').checked = false; });
        el.classList.add('selected');
        el.querySelector('input').checked = true;
    },

    submitProcessReturn(returnId, refundAmount) {
        const condition = document.querySelector('input[name="condition"]:checked')?.value || 'Unopened';
        const refundMethod = document.querySelector('input[name="refundMethod"]:checked')?.value || 'Cash Refund';

        $.ajax({
            url: '/api/returns/patient/process',
            method: 'POST',
            contentType: 'application/json',
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

    showNewPatientReturn() {
        document.getElementById('newReturnTitle').textContent = 'New Patient Return';
        document.getElementById('newReturnBody').innerHTML = `
            <div class="return-field"><label>Patient Name</label><input type="text" class="form-control form-control-sm" id="nrPatientName" placeholder="Patient name" style="border-radius:6px"></div>
            <div class="return-field"><label>MRN</label><input type="text" class="form-control form-control-sm" id="nrMrn" placeholder="MRN-2026-XXXX" style="border-radius:6px"></div>
            <div class="return-field"><label>Order ID</label><input type="text" class="form-control form-control-sm" id="nrOrderId" placeholder="RX-2026-XXXX" style="border-radius:6px"></div>
            <div class="return-field"><label>Medicine Name</label><input type="text" class="form-control form-control-sm" id="nrMedicine" placeholder="Medicine name" style="border-radius:6px"></div>
            <div class="row">
                <div class="col-6 return-field"><label>Batch Number</label><input type="text" class="form-control form-control-sm" id="nrBatch" placeholder="Batch #" style="border-radius:6px"></div>
                <div class="col-6 return-field"><label>Expiry Date</label><input type="text" class="form-control form-control-sm" id="nrExpiry" placeholder="e.g. Dec 2025" style="border-radius:6px"></div>
            </div>
            <div class="row">
                <div class="col-6 return-field"><label>Quantity</label><input type="number" class="form-control form-control-sm" id="nrQty" value="1" min="1" style="border-radius:6px"></div>
                <div class="col-6 return-field"><label>Original Amount (PKR)</label><input type="number" class="form-control form-control-sm" id="nrAmount" placeholder="0" min="0" style="border-radius:6px"></div>
            </div>
            <div class="return-field">
                <label>Return Reason</label>
                <select class="form-select form-select-sm" id="nrReason" style="border-radius:6px">
                    <option value="Medicine not needed">Medicine not needed (treatment changed)</option>
                    <option value="Wrong medicine dispensed">Wrong medicine dispensed (pharmacy error)</option>
                    <option value="Patient condition improved">Patient condition improved</option>
                    <option value="Adverse reaction">Adverse reaction</option>
                    <option value="Duplicate dispensing">Duplicate dispensing</option>
                </select>
            </div>
            <div class="return-field"><label>Patient Notes</label><textarea class="form-control form-control-sm" id="nrNotes" rows="2" placeholder="Additional notes..." style="border-radius:6px"></textarea></div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
                <button class="btn btn-sm" data-bs-dismiss="offcanvas" style="border:1px solid var(--color-border);font-size:13px;padding:6px 16px;border-radius:6px">Cancel</button>
                <button class="btn btn-sm" onclick="ReturnsApp.submitNewReturn()" style="background:var(--aquamint);color:#003366;font-size:13px;font-weight:600;padding:6px 20px;border-radius:6px;border:none">Create Return</button>
            </div>
        `;
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('newReturnPanel')).show();
    },

    submitNewReturn() {
        const data = {
            _token: $('meta[name="csrf-token"]').attr('content'),
            patientName: document.getElementById('nrPatientName').value,
            mrn: document.getElementById('nrMrn').value,
            orderId: document.getElementById('nrOrderId').value,
            medicineName: document.getElementById('nrMedicine').value,
            batchNumber: document.getElementById('nrBatch').value,
            expiryDate: document.getElementById('nrExpiry').value,
            quantity: parseInt(document.getElementById('nrQty').value) || 1,
            reason: document.getElementById('nrReason').value,
            patientNotes: document.getElementById('nrNotes').value,
            originalAmount: parseFloat(document.getElementById('nrAmount').value) || 0,
        };

        $.ajax({
            url: '/api/returns/patient', method: 'POST', contentType: 'application/json',
            data: JSON.stringify(data), headers: { 'X-CSRF-TOKEN': data._token },
            success: (resp) => {
                if (resp.success) {
                    this.showToast('Return ' + resp.returnId + ' created', 'success');
                    bootstrap.Offcanvas.getInstance(document.getElementById('newReturnPanel'))?.hide();
                    this.loadPatientReturns();
                    this.loadDashboard();
                }
            },
            error: () => this.showToast('Failed to create return', 'error'),
        });
    },

    loadWardReturns() {
        const st = document.getElementById('filterWardStatus').value;
        const params = st ? '?status=' + st : '';
        $.get('/api/returns/ward' + params, (data) => {
            const tbody = document.getElementById('wardReturnsBody');
            if (!data.length) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--color-muted-foreground)">No ward returns</td></tr>';
                return;
            }
            tbody.innerHTML = data.map(w => {
                const statusColor = { Pending: '#e67e22', Received: '#3498db', Processed: '#27ae60' }[w.status] || '#6b7280';
                const date = new Date(w.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
                const actionBtn = w.status === 'Pending'
                    ? `<button class="btn btn-sm" onclick="ReturnsApp.processWard('${w.return_id}','receive')" style="background:var(--aquamint);color:#003366;font-size:11px;padding:3px 10px;border-radius:5px;border:none;font-weight:600">Receive</button>`
                    : w.status === 'Received'
                    ? `<button class="btn btn-sm" onclick="ReturnsApp.processWard('${w.return_id}','process')" style="background:var(--aquamint);color:#003366;font-size:11px;padding:3px 10px;border-radius:5px;border:none;font-weight:600">Process</button>`
                    : '<span style="font-size:11px;color:#27ae60">Done</span>';
                const itemsList = (w.items || []).map(i => i.name).join(', ');

                return `<tr>
                    <td style="padding:10px 16px;font-weight:600">${w.ward_name}</td>
                    <td style="padding:10px 16px;font-size:12px">${date}</td>
                    <td style="padding:10px 16px;font-weight:600;color:var(--aquamint);font-size:12px">${w.return_id}</td>
                    <td style="padding:10px 16px;font-size:12px"><span title="${itemsList}">${w.items_count} items</span></td>
                    <td style="padding:10px 16px;font-weight:600;font-size:12px">PKR ${Number(w.total_value).toLocaleString()}</td>
                    <td style="padding:10px 16px"><span style="font-size:11px;padding:3px 8px;border-radius:4px;background:${statusColor}15;color:${statusColor};font-weight:500">${w.status}</span></td>
                    <td style="padding:10px 16px">${actionBtn}</td>
                </tr>`;
            }).join('');
        });
    },

    processWard(returnId, action) {
        $.ajax({
            url: '/api/returns/ward/process', method: 'POST', contentType: 'application/json',
            data: JSON.stringify({ returnId, action, _token: $('meta[name="csrf-token"]').attr('content') }),
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: (d) => { if (d.success) { this.showToast(d.message, 'success'); this.loadWardReturns(); this.loadDashboard(); } },
        });
    },

    loadSupplierReturns() {
        const st = document.getElementById('filterRtvStatus').value;
        const params = st ? '?status=' + st : '';
        $.get('/api/returns/supplier' + params, (data) => {
            const tbody = document.getElementById('supplierReturnsBody');
            if (!data.length) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--color-muted-foreground)">No supplier returns</td></tr>';
                return;
            }
            tbody.innerHTML = data.map(s => {
                const statusColor = { Draft: '#6b7280', Initiated: '#e67e22', Shipped: '#3498db', 'Credit Received': '#27ae60' }[s.status] || '#6b7280';
                const date = new Date(s.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
                let actionBtn = `<button class="btn btn-sm" style="border:1px solid var(--color-border);font-size:11px;padding:3px 10px;border-radius:5px">Track</button>`;
                if (s.status === 'Draft') actionBtn = `<button class="btn btn-sm" onclick="ReturnsApp.submitRtv('${s.rtv_id}')" style="background:var(--aquamint);color:#003366;font-size:11px;padding:3px 10px;border-radius:5px;border:none;font-weight:600">Submit</button>`;
                else if (s.status === 'Initiated') actionBtn = `<button class="btn btn-sm" onclick="ReturnsApp.updateRtvStatus('${s.rtv_id}','Shipped')" style="background:#3498db;color:#fff;font-size:11px;padding:3px 10px;border-radius:5px;border:none">Mark Shipped</button>`;
                else if (s.status === 'Shipped') actionBtn = `<button class="btn btn-sm" onclick="ReturnsApp.updateRtvStatus('${s.rtv_id}','Credit Received')" style="background:#27ae60;color:#fff;font-size:11px;padding:3px 10px;border-radius:5px;border:none">Credit Recv'd</button>`;

                return `<tr>
                    <td style="padding:10px 16px;font-weight:600;color:var(--aquamint);font-size:12px">${s.rtv_id}</td>
                    <td style="padding:10px 16px;font-size:12px">${s.supplier_name}</td>
                    <td style="padding:10px 16px;font-size:12px;color:var(--aquamint)">${s.po_reference || '-'}</td>
                    <td style="padding:10px 16px;font-size:12px">${date}</td>
                    <td style="padding:10px 16px;font-size:12px">${s.items_count}</td>
                    <td style="padding:10px 16px;font-size:11px">${s.reason}</td>
                    <td style="padding:10px 16px;font-weight:600;font-size:12px;color:#27ae60">PKR ${Number(s.total_credit).toLocaleString()}</td>
                    <td style="padding:10px 16px"><span style="font-size:11px;padding:3px 8px;border-radius:4px;background:${statusColor}15;color:${statusColor};font-weight:500">${s.status}</span></td>
                    <td style="padding:10px 16px">${actionBtn}</td>
                </tr>`;
            }).join('');
        });
    },

    submitRtv(rtvId) {
        $.ajax({
            url: '/api/returns/supplier/submit', method: 'POST', contentType: 'application/json',
            data: JSON.stringify({ rtvId, _token: $('meta[name="csrf-token"]').attr('content') }),
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: (d) => { if (d.success) { this.showToast(d.message, 'success'); this.loadSupplierReturns(); } },
        });
    },

    updateRtvStatus(rtvId, status) {
        $.ajax({
            url: '/api/returns/supplier/status', method: 'POST', contentType: 'application/json',
            data: JSON.stringify({ rtvId, status, _token: $('meta[name="csrf-token"]').attr('content') }),
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: (d) => { if (d.success) { this.showToast(d.message, 'success'); this.loadSupplierReturns(); this.loadDashboard(); } },
        });
    },

    showNewRtv() {
        document.getElementById('rtvBody').innerHTML = `
            <div class="return-field"><label>Supplier</label>
                <select class="form-select form-select-sm" id="rtvSupplier" style="border-radius:6px">
                    <option value="">Select supplier...</option>
                </select>
            </div>
            <div class="return-field"><label>Original PO Reference</label><input type="text" class="form-control form-control-sm" id="rtvPo" placeholder="PO-2026-XXX" style="border-radius:6px"></div>
            <div class="return-field">
                <label>Return Reason</label>
                <select class="form-select form-select-sm" id="rtvReason" style="border-radius:6px">
                    <option value="Damaged on arrival">Damaged on arrival</option>
                    <option value="Wrong product sent">Wrong product sent</option>
                    <option value="Short expiry">Short expiry (&lt;6 months)</option>
                    <option value="Excess stock">Excess stock</option>
                    <option value="Product recall">Product recall</option>
                </select>
            </div>
            <div style="margin-bottom:12px">
                <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:8px">Medicines to Return</label>
                <div id="rtvItems"></div>
                <button class="btn btn-sm" onclick="ReturnsApp.addRtvItem()" style="border:1px dashed var(--color-border);color:var(--color-muted-foreground);font-size:12px;padding:6px 14px;border-radius:6px;width:100%;margin-top:6px">
                    <i data-lucide="plus" style="width:12px;height:12px;margin-right:4px"></i> Add Medicine
                </button>
            </div>
            <div class="return-field"><label>Notes</label><textarea class="form-control form-control-sm" id="rtvNotes" rows="2" placeholder="Detailed notes..." style="border-radius:6px"></textarea></div>
            <div style="padding:12px;background:var(--color-background);border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between">
                <span style="font-size:13px;font-weight:500">Total Credit Expected:</span>
                <span id="rtvTotalCredit" style="font-size:16px;font-weight:700;color:#003366">PKR 0</span>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end">
                <button class="btn btn-sm" data-bs-dismiss="offcanvas" style="border:1px solid var(--color-border);font-size:13px;padding:6px 16px;border-radius:6px">Cancel</button>
                <button class="btn btn-sm" onclick="ReturnsApp.submitNewRtv('Draft')" style="border:1px solid var(--color-border);font-size:13px;padding:6px 16px;border-radius:6px">Save Draft</button>
                <button class="btn btn-sm" onclick="ReturnsApp.submitNewRtv('Initiated')" style="background:var(--aquamint);color:#003366;font-size:13px;font-weight:600;padding:6px 20px;border-radius:6px;border:none">Submit RTV</button>
            </div>
        `;

        $.get('/api/stock-alerts/suppliers', (suppliers) => {
            const sel = document.getElementById('rtvSupplier');
            suppliers.forEach(s => {
                sel.innerHTML += `<option value="${s.supplierId}" data-name="${s.name}">${s.name}</option>`;
            });
        });

        this.addRtvItem();
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('rtvPanel')).show();
    },

    addRtvItem() {
        const container = document.getElementById('rtvItems');
        const idx = container.children.length;
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px';
        div.innerHTML = `
            <input type="text" class="form-control form-control-sm rtv-med" placeholder="Medicine name" style="flex:2;font-size:12px;border-radius:6px">
            <input type="text" class="form-control form-control-sm rtv-batch" placeholder="Batch" style="flex:1;font-size:12px;border-radius:6px">
            <input type="number" class="form-control form-control-sm rtv-qty" value="1" min="1" style="width:60px;font-size:12px;border-radius:6px" onchange="ReturnsApp.updateRtvTotal()">
            <input type="number" class="form-control form-control-sm rtv-credit" value="0" min="0" style="width:80px;font-size:12px;border-radius:6px" onchange="ReturnsApp.updateRtvTotal()">
            <button class="btn btn-sm" onclick="this.parentElement.remove();ReturnsApp.updateRtvTotal()" style="color:#e74c3c;border:none;padding:2px 6px"><i data-lucide="x" style="width:14px;height:14px"></i></button>
        `;
        container.appendChild(div);
        lucide.createIcons();
    },

    updateRtvTotal() {
        let total = 0;
        document.querySelectorAll('.rtv-credit').forEach(el => { total += parseFloat(el.value) || 0; });
        document.getElementById('rtvTotalCredit').textContent = 'PKR ' + total.toLocaleString();
    },

    submitNewRtv(initialStatus) {
        const supplierEl = document.getElementById('rtvSupplier');
        const items = [];
        document.querySelectorAll('#rtvItems > div').forEach(row => {
            items.push({
                name: row.querySelector('.rtv-med').value,
                batch: row.querySelector('.rtv-batch').value,
                qty: parseInt(row.querySelector('.rtv-qty').value) || 0,
                reason: document.getElementById('rtvReason').value,
                credit: parseFloat(row.querySelector('.rtv-credit').value) || 0,
            });
        });

        const data = {
            _token: $('meta[name="csrf-token"]').attr('content'),
            supplierId: supplierEl.value,
            supplierName: supplierEl.options[supplierEl.selectedIndex]?.text || '',
            poReference: document.getElementById('rtvPo').value,
            reason: document.getElementById('rtvReason').value,
            notes: document.getElementById('rtvNotes').value,
            items,
        };

        $.ajax({
            url: '/api/returns/supplier', method: 'POST', contentType: 'application/json',
            data: JSON.stringify(data), headers: { 'X-CSRF-TOKEN': data._token },
            success: (resp) => {
                if (resp.success) {
                    if (initialStatus === 'Initiated') {
                        $.ajax({
                            url: '/api/returns/supplier/submit', method: 'POST', contentType: 'application/json',
                            data: JSON.stringify({ rtvId: resp.rtvId, _token: data._token }),
                            headers: { 'X-CSRF-TOKEN': data._token },
                        });
                    }
                    this.showToast('RTV ' + resp.rtvId + ' created', 'success');
                    bootstrap.Offcanvas.getInstance(document.getElementById('rtvPanel'))?.hide();
                    this.loadSupplierReturns();
                    this.loadDashboard();
                }
            },
            error: () => this.showToast('Failed to create RTV', 'error'),
        });
    },

    loadExpiredStock() {
        $.get('/api/returns/expired', (data) => {
            this.expiredData = data.items || [];
            const tbody = document.getElementById('expiredStockBody');
            if (!this.expiredData.length) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--color-muted-foreground)">No expired stock</td></tr>';
                document.getElementById('expiredStockFoot').style.display = 'none';
                return;
            }

            tbody.innerHTML = this.expiredData.map((e, i) => `<tr style="background:rgba(231,76,60,0.03)">
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

            document.getElementById('expiredStockFoot').style.display = '';
            document.getElementById('expiredTotalQty').textContent = this.expiredData.reduce((s, e) => s + e.qty, 0);
            document.getElementById('expiredTotalValue').textContent = 'PKR ' + Number(data.totalLoss).toLocaleString();
        });
    },

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

    loadNearExpiry() {
        $.get('/api/returns/near-expiry', (data) => {
            const tbody = document.getElementById('nearExpiryBody');
            if (!data.length) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--color-muted-foreground)">No near-expiry items</td></tr>';
                return;
            }
            tbody.innerHTML = data.map(n => {
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
        });
    },

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
