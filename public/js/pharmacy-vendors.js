const VendorsApp = {
    all: [], filtered: [], page: 1, rowsPer: 15,

    init() {
        this.load();

        let timer;
        document.getElementById('vendorSearch').addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => { this.page = 1; this.applyFilters(); }, 250);
        });
        document.getElementById('filterStatus').addEventListener('change', () => {
            this.page = 1; this.applyFilters();
        });

        lucide.createIcons();
    },

    load() {
        document.getElementById('vendorLoading').style.display = 'block';
        document.getElementById('tblVendors').style.display = 'none';
        document.getElementById('vendorEmpty').classList.add('is-hidden');

        const vendorUrl = (window.HMS_BASE || '') + '/api/vendors?_t=' + Date.now();
        $.get(vendorUrl, (data) => {
            this.all = Array.isArray(data) ? data : [];
            document.getElementById('vendorLoading').style.display = 'none';
            this.updateStats();
            this.page = 1;
            this.applyFilters();
        }).fail((xhr) => {
            document.getElementById('vendorLoading').style.display = 'none';
            document.getElementById('vendorEmpty').classList.remove('is-hidden');
            this.toast('Vendor load failed (HTTP ' + xhr.status + ')', 'error');
        });
    },

    updateStats() {
        const active   = this.all.filter(v => v.isActive).length;
        const inactive = this.all.filter(v => !v.isActive).length;
        const withPo   = this.all.filter(v => v.poCount > 0).length;
        document.getElementById('statTotal').textContent   = this.all.length;
        document.getElementById('statActive').textContent  = active;
        document.getElementById('statInactive').textContent = inactive;
        document.getElementById('statWithPo').textContent  = withPo;
    },

    applyFilters() {
        const search = (document.getElementById('vendorSearch').value || '').toLowerCase();
        const status = document.getElementById('filterStatus').value;

        this.filtered = this.all.filter(v => {
            if (status === 'active'   && !v.isActive) return false;
            if (status === 'inactive' && v.isActive)  return false;
            if (search) {
                const hay = [v.name, v.contactPerson, v.phone, v.email, v.id].join(' ').toLowerCase();
                if (!hay.includes(search)) return false;
            }
            return true;
        });

        this.renderTable();
        this.renderPagination();
    },

    renderTable() {
        const start = (this.page - 1) * this.rowsPer;
        const slice = this.filtered.slice(start, start + this.rowsPer);
        const tbody = document.getElementById('vendorTbody');

        if (!this.filtered.length) {
            document.getElementById('tblVendors').style.display = 'none';
            document.getElementById('vendorEmpty').classList.remove('is-hidden');
            document.getElementById('vendorPagination').style.display = 'none';
            return;
        }

        document.getElementById('vendorEmpty').classList.add('is-hidden');
        document.getElementById('tblVendors').style.display = '';

        tbody.innerHTML = slice.map(v => {
            const statusBadge = v.isActive
                ? `<span style="font-size:11px;padding:3px 8px;border-radius:4px;background:#dcfce7;color:#16a34a;font-weight:600">Active</span>`
                : `<span style="font-size:11px;padding:3px 8px;border-radius:4px;background:#fee2e2;color:#dc2626;font-weight:600">Inactive</span>`;

            const toggleLabel = v.isActive ? 'Deactivate' : 'Activate';
            const toggleColor = v.isActive ? '#e74c3c' : '#27ae60';

            return `<tr>
                <td style="padding:10px 16px;font-size:11px;font-weight:600;color:var(--aquamint)">${v.id}</td>
                <td style="padding:10px 16px">
                    <div style="font-size:13px;font-weight:600;color:var(--color-foreground)">${v.name}</div>
                </td>
                <td style="padding:10px 16px;font-size:12px">${v.contactPerson || '<span style="color:var(--color-muted-foreground)">—</span>'}</td>
                <td style="padding:10px 16px;font-size:12px">${v.phone || '<span style="color:var(--color-muted-foreground)">—</span>'}</td>
                <td style="padding:10px 16px;font-size:12px">${v.email || '<span style="color:var(--color-muted-foreground)">—</span>'}</td>
                <td style="padding:10px 16px;font-size:12px">${v.paymentTerms || '<span style="color:var(--color-muted-foreground)">—</span>'}</td>
                <td style="padding:10px 16px;font-size:12px;text-align:center">${v.leadTimeDays != null ? v.leadTimeDays + ' days' : '—'}</td>
                <td style="padding:10px 16px;font-size:12px;text-align:center">${v.poCount}</td>
                <td style="padding:10px 16px">${statusBadge}</td>
                <td style="padding:10px 16px">
                    <div style="display:flex;gap:6px;align-items:center">
                        <button onclick="VendorsApp.showForm('${v.id}')" style="height:28px;padding:0 10px;border:1px solid var(--color-border);border-radius:5px;background:var(--color-card);font-size:11px;font-weight:600;cursor:pointer">Edit</button>
                        <button onclick="VendorsApp.toggleStatus('${v.id}')" style="height:28px;padding:0 10px;border:1px solid ${toggleColor}30;border-radius:5px;background:${toggleColor}10;color:${toggleColor};font-size:11px;font-weight:600;cursor:pointer">${toggleLabel}</button>
                        ${v.poCount === 0 ? `<button onclick="VendorsApp.deleteVendor('${v.id}')" style="height:28px;padding:0 10px;border:1px solid #fee2e2;border-radius:5px;background:#fff0f0;color:#dc2626;font-size:11px;font-weight:600;cursor:pointer">Delete</button>` : ''}
                    </div>
                </td>
            </tr>`;
        }).join('');

        lucide.createIcons();
    },

    renderPagination() {
        const total = this.filtered.length;
        const pages = Math.ceil(total / this.rowsPer) || 1;
        document.getElementById('vendorPagination').style.display = total > 0 ? 'flex' : 'none';

        const start = total === 0 ? 0 : (this.page - 1) * this.rowsPer + 1;
        const end   = Math.min(this.page * this.rowsPer, total);
        document.getElementById('vendorPageInfo').textContent = `Showing ${start}–${end} of ${total} vendors`;
        document.getElementById('vendorPrevPage').disabled = this.page <= 1;
        document.getElementById('vendorNextPage').disabled = this.page >= pages;

        const range = this._pageRange(this.page, pages);
        document.getElementById('vendorPageNums').innerHTML = range.map(p =>
            p === '…'
                ? `<span style="padding:0 4px;color:var(--color-muted-foreground)">…</span>`
                : `<button class="opd-page-num${p === this.page ? ' active' : ''}" onclick="VendorsApp.goToPage(${p})">${p}</button>`
        ).join('');
    },

    _pageRange(current, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages = [1];
        if (current > 3) pages.push('…');
        for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
        if (current < total - 2) pages.push('…');
        pages.push(total);
        return pages;
    },

    goToPage(p) {
        const pages = Math.ceil(this.filtered.length / this.rowsPer) || 1;
        if (p < 1 || p > pages) return;
        this.page = p;
        this.renderTable();
        this.renderPagination();
    },

    showForm(id) {
        const vendor = id ? this.all.find(v => v.id === id) : null;
        document.getElementById('vendorPanelTitle').textContent = vendor ? 'Edit Vendor' : 'Add Vendor';
        document.getElementById('vendorId').value          = vendor?.id || '';
        document.getElementById('vName').value             = vendor?.name || '';
        document.getElementById('vContact').value          = vendor?.contactPerson || '';
        document.getElementById('vPhone').value            = vendor?.phone || '';
        document.getElementById('vEmail').value            = vendor?.email || '';
        document.getElementById('vAddress').value          = vendor?.address || '';
        document.getElementById('vPaymentTerms').value     = vendor?.paymentTerms || 'Cash';
        document.getElementById('vLeadTime').value         = vendor?.leadTimeDays ?? 7;
        document.getElementById('vendorSaveBtn').textContent = vendor ? 'Update Vendor' : 'Save Vendor';
        new bootstrap.Offcanvas(document.getElementById('vendorPanel')).show();
    },

    save() {
        const id   = document.getElementById('vendorId').value;
        const name = document.getElementById('vName').value.trim();
        if (!name) { this.toast('Vendor name is required', 'error'); return; }

        const payload = {
            name,
            contactPerson: document.getElementById('vContact').value.trim() || null,
            phone:         document.getElementById('vPhone').value.trim() || null,
            email:         document.getElementById('vEmail').value.trim() || null,
            address:       document.getElementById('vAddress').value.trim() || null,
            paymentTerms:  document.getElementById('vPaymentTerms').value || null,
            leadTimeDays:  parseInt(document.getElementById('vLeadTime').value) || 0,
        };

        const btn = document.getElementById('vendorSaveBtn');
        btn.disabled = true; btn.textContent = 'Saving…';

        const token = $('meta[name="csrf-token"]').attr('content');
        const req = id
            ? $.ajax({ url: '/api/vendors/' + id, method: 'PUT', contentType: 'application/json', data: JSON.stringify(payload), headers: { 'X-CSRF-TOKEN': token } })
            : $.ajax({ url: '/api/vendors',        method: 'POST', contentType: 'application/json', data: JSON.stringify(payload), headers: { 'X-CSRF-TOKEN': token } });

        req.done((resp) => {
            btn.disabled = false; btn.textContent = id ? 'Update Vendor' : 'Save Vendor';
            if (resp.success) {
                this.toast(id ? 'Vendor updated' : 'Vendor added', 'success');
                bootstrap.Offcanvas.getInstance(document.getElementById('vendorPanel'))?.hide();
                this.load();
            }
        }).fail((xhr) => {
            btn.disabled = false; btn.textContent = id ? 'Update Vendor' : 'Save Vendor';
            const msg = xhr.responseJSON?.error || xhr.responseJSON?.message || 'Failed to save vendor';
            this.toast(msg, 'error');
        });
    },

    toggleStatus(id) {
        const token = $('meta[name="csrf-token"]').attr('content');
        $.ajax({
            url: '/api/vendors/' + id + '/toggle', method: 'PATCH',
            headers: { 'X-CSRF-TOKEN': token },
        }).done((resp) => {
            if (resp.success) {
                this.toast(resp.isActive ? 'Vendor activated' : 'Vendor deactivated', 'success');
                this.load();
            }
        }).fail(() => this.toast('Failed to update status', 'error'));
    },

    deleteVendor(id) {
        const vendor = this.all.find(v => v.id === id);
        if (!confirm(`Delete vendor "${vendor?.name}"? This cannot be undone.`)) return;

        const token = $('meta[name="csrf-token"]').attr('content');
        $.ajax({
            url: '/api/vendors/' + id, method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': token },
        }).done((resp) => {
            if (resp.success) { this.toast('Vendor deleted', 'success'); this.load(); }
        }).fail((xhr) => {
            this.toast(xhr.responseJSON?.error || 'Failed to delete vendor', 'error');
        });
    },

    toast(msg, type) {
        if (window.HMS?.toast) { HMS.toast(msg, type); return; }
        alert(msg);
    },
};

document.addEventListener('DOMContentLoaded', () => VendorsApp.init());
