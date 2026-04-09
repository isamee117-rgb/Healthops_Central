// ── Global pagination state ────────────────────────────────────────────────
var hdCurrentPage = 1, hdPerPageVal = 10, hdFiltered = null;
var txCurrentPage = 1, txPerPageVal = 10, txFiltered = null;

$(function() {
    var heads = [];
    var transactions = [];
    var editingHeadId = null;
    var editingTxnId = null;

    var incomeTypes = ['Patient Services Revenue','Non-Patient Services','Government Grants/Subsidies','Donations & Gifts','Investment Income','Other Income'];
    var expenseTypes = ['Medical Supplies & Equipment','Staff Salaries','Infrastructure & Maintenance','Utilities (Electricity, Water, Gas)','Administrative Expenses','Professional Services','Marketing & Business Development','Other Expenses'];
    var paymentModes = ['Cash','Cheque','Bank Transfer','Credit Card','Digital Wallet','Other'];
    var incomeTxnTypes = ['Receipt','Refund Reversal','Adjustment'];
    var expenseTxnTypes = ['Payment','Advance','Adjustment'];

    function esc(s) { return $('<span>').text(s || '').html(); }
    function fmtDate(d) { if (!d) return '—'; var dt = new Date(d); return dt.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }); }
    function fmtAmt(a) { return 'PKR ' + Number(a || 0).toLocaleString('en-PK'); }
    function todayStr() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

    function catBadge(cat) {
        if (cat === 'Income') return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(22,163,74,0.08);color:#16a34a"><i data-lucide="trending-up" style="width:12px;height:12px"></i> Income</span>';
        return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(220,38,38,0.08);color:#dc2626"><i data-lucide="trending-down" style="width:12px;height:12px"></i> Expense</span>';
    }

    function statusBadge(s) {
        var colors = { 'Active': '#16a34a', 'Inactive': '#dc2626', 'Draft': '#d97706', 'Submitted': '#2563eb', 'Posted': '#16a34a' };
        var icons = { 'Active': 'check-circle', 'Inactive': 'x-circle', 'Draft': 'file-edit', 'Submitted': 'send', 'Posted': 'check-circle-2' };
        var c = colors[s] || '#64748b';
        var ic = icons[s] || 'circle';
        return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:' + c + '12;color:' + c + '"><i data-lucide="' + ic + '" style="width:12px;height:12px"></i> ' + esc(s) + '</span>';
    }

    function errorDiv(msg) {
        return '<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#dc2626;font-size:13px;font-weight:500"><i data-lucide="alert-circle" style="width:14px;height:14px;margin-right:6px;vertical-align:-2px"></i>' + msg + '</div>';
    }

    $('.module-tab').on('click', function() {
        var tab = $(this).data('tab');
        $('.module-tab').removeClass('active');
        $(this).addClass('active');
        $('#tab-heads, #tab-transactions').hide();
        $('#tab-' + tab).show();
    });

    function loadAll() {
        $.get('/api/account-heads', function(data) {
            heads = data || [];
            window._heads_ref = heads;
            renderHeads();
        });
        $.get('/api/income-expense/transactions', function(data) {
            transactions = data || [];
            window._txns_ref = transactions;
            renderTxns();
        });
        $.get('/api/income-expense/summary', function(data) {
            $('#statIncome').text(fmtAmt(data.totalIncome));
            $('#statExpense').text(fmtAmt(data.totalExpense));
            var net = data.netProfitLoss || 0;
            $('#statNet').text(fmtAmt(Math.abs(net))).css('color', net >= 0 ? '#16a34a' : '#dc2626');
            if (net < 0) $('#statNet').text('- ' + fmtAmt(Math.abs(net)));
            var pct = data.totalBudget > 0 ? Math.round((data.budgetUsed / data.totalBudget) * 100) : 0;
            $('#statBudget').text(pct + '%');
        });
    }

    // ── Account Heads ─────────────────────────────────────────────────────────

    function getFilteredHeads() {
        var base = hdFiltered !== null ? hdFiltered : heads;
        var search = ($('#headSearch').val() || '').toLowerCase();
        return base.filter(function(h) {
            if (search) {
                var hay = ((h.headCode||'') + ' ' + (h.headName||'') + ' ' + (h.headType||'') + ' ' + (h.category||'')).toLowerCase();
                if (hay.indexOf(search) === -1) return false;
            }
            return true;
        });
    }

    function renderHeads() {
        hdCurrentPage = 1;
        _hdRenderPagination(getFilteredHeads());
    }

    function _hdRenderPagination(source) {
        var total = source.length;
        var totalPages = Math.max(1, Math.ceil(total / hdPerPageVal));
        if (hdCurrentPage > totalPages) hdCurrentPage = totalPages;
        var start = (hdCurrentPage - 1) * hdPerPageVal;
        var page = source.slice(start, start + hdPerPageVal);
        var html = '';
        if (page.length === 0) {
            html = '<tr><td colspan="7"><div class="empty-state"><i data-lucide="folder-tree"></i><p>No account heads found</p></div></td></tr>';
        } else {
            page.forEach(function(h) {
                html += '<tr>';
                html += '<td><span style="font-weight:600;color:var(--midnight-blue);font-family:monospace;font-size:13px">' + esc(h.headCode) + '</span></td>';
                html += '<td><span style="font-weight:600">' + esc(h.headName) + '</span>';
                if (h.description) html += '<br><span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(h.description).substring(0, 60) + '</span>';
                html += '</td>';
                html += '<td>' + catBadge(h.category) + '</td>';
                html += '<td style="font-size:13px;color:var(--color-muted-foreground)">' + esc(h.headType) + '</td>';
                html += '<td style="text-align:right"><span style="font-weight:700;color:var(--midnight-blue)">' + (h.budgetLimit ? fmtAmt(h.budgetLimit) : '—') + '</span></td>';
                html += '<td>' + statusBadge(h.status) + '</td>';
                html += '<td><div class="dropdown">';
                html += '<button class="action-menu-btn" data-bs-toggle="dropdown"><i data-lucide="more-vertical" style="width:16px;height:16px"></i></button>';
                html += '<ul class="dropdown-menu dropdown-menu-end">';
                html += '<li><a class="dropdown-item btn-edit-head" href="#" data-id="' + esc(h.headId) + '"><i data-lucide="pencil" style="width:14px;height:14px;margin-right:8px"></i> Edit</a></li>';
                if (h.status === 'Active') {
                    html += '<li><a class="dropdown-item btn-toggle-head" href="#" data-id="' + esc(h.headId) + '" data-status="Inactive"><i data-lucide="eye-off" style="width:14px;height:14px;margin-right:8px"></i> Deactivate</a></li>';
                } else {
                    html += '<li><a class="dropdown-item btn-toggle-head" href="#" data-id="' + esc(h.headId) + '" data-status="Active"><i data-lucide="eye" style="width:14px;height:14px;margin-right:8px"></i> Activate</a></li>';
                }
                html += '<li><hr class="dropdown-divider"></li>';
                html += '<li><a class="dropdown-item text-danger btn-delete-head" href="#" data-id="' + esc(h.headId) + '"><i data-lucide="trash-2" style="width:14px;height:14px;margin-right:8px"></i> Delete</a></li>';
                html += '</ul></div></td>';
                html += '</tr>';
            });
        }
        $('#headsTableBody').html(html);
        lucide.createIcons();
        var endRow = Math.min(start + hdPerPageVal, total);
        $('#hdTableInfo').text(total === 0 ? 'No records' : 'Showing ' + (start + 1) + '–' + endRow + ' of ' + total + ' records');
        var nums = '';
        for (var i = 1; i <= totalPages; i++) nums += '<button class="opd-page-num' + (i === hdCurrentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        $('#hdPageNums').html(nums);
        $('#hdPrevPage').prop('disabled', hdCurrentPage <= 1);
        $('#hdNextPage').prop('disabled', hdCurrentPage >= totalPages);
    }

    // ── Transactions ──────────────────────────────────────────────────────────

    function getFilteredTxns() {
        var base = txFiltered !== null ? txFiltered : transactions;
        var search = ($('#txnSearch').val() || '').toLowerCase();
        return base.filter(function(t) {
            if (search) {
                var hay = ((t.transactionId||'') + ' ' + (t.description||'') + ' ' + (t.headName||'') + ' ' + (t.headCode||'') + ' ' + (t.referenceNumber||'')).toLowerCase();
                if (hay.indexOf(search) === -1) return false;
            }
            return true;
        });
    }

    function renderTxns() {
        txCurrentPage = 1;
        _txRenderPagination(getFilteredTxns());
    }

    function _txRenderPagination(source) {
        var total = source.length;
        var totalPages = Math.max(1, Math.ceil(total / txPerPageVal));
        if (txCurrentPage > totalPages) txCurrentPage = totalPages;
        var start = (txCurrentPage - 1) * txPerPageVal;
        var page = source.slice(start, start + txPerPageVal);
        var html = '';
        if (page.length === 0) {
            html = '<tr><td colspan="8"><div class="empty-state"><i data-lucide="arrow-left-right"></i><p>No transactions found</p></div></td></tr>';
        } else {
            page.forEach(function(t) {
                var amtColor = t.type === 'Income' ? '#16a34a' : '#dc2626';
                var amtPrefix = t.type === 'Income' ? '+' : '-';
                html += '<tr>';
                html += '<td style="font-size:13px;white-space:nowrap">' + fmtDate(t.date) + '</td>';
                html += '<td><span style="font-weight:600;font-size:13px">' + esc(t.headName || t.head) + '</span>';
                if (t.headCode) html += '<br><span style="font-size:11px;color:var(--color-muted-foreground);font-family:monospace">' + esc(t.headCode) + '</span>';
                html += '</td>';
                html += '<td style="font-size:13px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(t.description || t.remarks || '') + '</td>';
                html += '<td>' + catBadge(t.type || t.headCategory) + '</td>';
                html += '<td style="text-align:right"><span style="font-weight:700;color:' + amtColor + '">' + amtPrefix + ' ' + fmtAmt(t.amount) + '</span></td>';
                html += '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(t.paymentMode || '—') + '</td>';
                html += '<td>' + statusBadge(t.status) + '</td>';
                html += '<td><div class="dropdown">';
                html += '<button class="action-menu-btn" data-bs-toggle="dropdown"><i data-lucide="more-vertical" style="width:16px;height:16px"></i></button>';
                html += '<ul class="dropdown-menu dropdown-menu-end">';
                if (t.status !== 'Posted') {
                    html += '<li><a class="dropdown-item btn-edit-txn" href="#" data-id="' + esc(t.transactionId) + '"><i data-lucide="pencil" style="width:14px;height:14px;margin-right:8px"></i> Edit</a></li>';
                    html += '<li><a class="dropdown-item btn-post-txn" href="#" data-id="' + esc(t.transactionId) + '"><i data-lucide="check-circle-2" style="width:14px;height:14px;margin-right:8px"></i> Post</a></li>';
                    html += '<li><hr class="dropdown-divider"></li>';
                    html += '<li><a class="dropdown-item text-danger btn-delete-txn" href="#" data-id="' + esc(t.transactionId) + '"><i data-lucide="trash-2" style="width:14px;height:14px;margin-right:8px"></i> Delete</a></li>';
                } else {
                    html += '<li><a class="dropdown-item disabled" href="#"><i data-lucide="lock" style="width:14px;height:14px;margin-right:8px"></i> Posted (locked)</a></li>';
                }
                html += '</ul></div></td>';
                html += '</tr>';
            });
        }
        $('#txnTableBody').html(html);
        lucide.createIcons();
        var endRow = Math.min(start + txPerPageVal, total);
        $('#txTableInfo').text(total === 0 ? 'No records' : 'Showing ' + (start + 1) + '–' + endRow + ' of ' + total + ' records');
        var nums = '';
        for (var i = 1; i <= totalPages; i++) nums += '<button class="opd-page-num' + (i === txCurrentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        $('#txPageNums').html(nums);
        $('#txPrevPage').prop('disabled', txCurrentPage <= 1);
        $('#txNextPage').prop('disabled', txCurrentPage >= totalPages);
    }

    // ── Expose functions for window toolbar calls ──────────────────────────
    window._hdGetFiltered = getFilteredHeads;
    window._hdRenderPagination = _hdRenderPagination;
    window._txGetFiltered = getFilteredTxns;
    window._txRenderPagination = _txRenderPagination;

    // ── Search bindings ────────────────────────────────────────────────────
    $('#headSearch').on('input', function() { hdCurrentPage = 1; _hdRenderPagination(getFilteredHeads()); });
    $('#txnSearch').on('input',  function() { txCurrentPage = 1; _txRenderPagination(getFilteredTxns()); });

    // ── Pagination delegated events ────────────────────────────────────────
    $(document).on('click', '#hdPageNums .opd-page-num', function() {
        hdCurrentPage = parseInt($(this).data('page')); _hdRenderPagination(getFilteredHeads());
    });
    $(document).on('click', '#hdPrevPage', function() {
        if (hdCurrentPage > 1) { hdCurrentPage--; _hdRenderPagination(getFilteredHeads()); }
    });
    $(document).on('click', '#hdNextPage', function() {
        var tp = Math.max(1, Math.ceil(getFilteredHeads().length / hdPerPageVal));
        if (hdCurrentPage < tp) { hdCurrentPage++; _hdRenderPagination(getFilteredHeads()); }
    });

    $(document).on('click', '#txPageNums .opd-page-num', function() {
        txCurrentPage = parseInt($(this).data('page')); _txRenderPagination(getFilteredTxns());
    });
    $(document).on('click', '#txPrevPage', function() {
        if (txCurrentPage > 1) { txCurrentPage--; _txRenderPagination(getFilteredTxns()); }
    });
    $(document).on('click', '#txNextPage', function() {
        var tp = Math.max(1, Math.ceil(getFilteredTxns().length / txPerPageVal));
        if (txCurrentPage < tp) { txCurrentPage++; _txRenderPagination(getFilteredTxns()); }
    });

    // ── Outside-click handler ──────────────────────────────────────────────
    $(document).on('click.ieMenus', function(e) {
        if (!$(e.target).closest('#hdRowsMenu, #hdRowsBtn').length)          $('#hdRowsMenu').removeClass('open');
        if (!$(e.target).closest('#hdColVisMenu, .opd-col-vis-wrap').length) $('#hdColVisMenu').removeClass('open');
        if (!$(e.target).closest('#hdExportMenu, .opd-export-wrap').length)  $('#hdExportMenu').removeClass('open');
        if (!$(e.target).closest('#txRowsMenu, #txRowsBtn').length)          $('#txRowsMenu').removeClass('open');
        if (!$(e.target).closest('#txColVisMenu, .opd-col-vis-wrap').length) $('#txColVisMenu').removeClass('open');
        if (!$(e.target).closest('#txExportMenu, .opd-export-wrap').length)  $('#txExportMenu').removeClass('open');
        if (!$(e.target).closest('.opd-dp-trigger,.opd-dp-popup,.opd-cs-trigger,.opd-cs-popup').length) ieCloseAll();
    });

    // ── Toolbar window functions — Account Heads ───────────────────────────
    window.toggleHdFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('hdFilterPane'); if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnHdFilter'); if (btn) btn.classList.toggle('active', !open);
    };

    window.applyHdFilters = function() {
        var catVal    = ($('#hdCatFilter').val()    || '').toLowerCase();
        var statusVal = ($('#hdStatusFilter').val() || '').toLowerCase();
        hdFiltered = (window._heads_ref || []).filter(function(h) {
            if (catVal    && catVal    !== 'all categories' && (h.category||'').toLowerCase() !== catVal)    return false;
            if (statusVal && statusVal !== 'all status'     && (h.status  ||'').toLowerCase() !== statusVal) return false;
            return true;
        });
        var count = 0;
        if (catVal    && catVal    !== 'all categories') count++;
        if (statusVal && statusVal !== 'all status')     count++;
        var badge = document.getElementById('hdFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }
        hdCurrentPage = 1;
        if (window._hdRenderPagination && window._hdGetFiltered) window._hdRenderPagination(window._hdGetFiltered());
        toggleHdFilter();
    };

    window.resetHdFilters = function() {
        hdFiltered = null; hdCurrentPage = 1;
        ['hdCsCategory','hdCsStatus'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        var badge = document.getElementById('hdFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        if (window._hdRenderPagination && window._hdGetFiltered) window._hdRenderPagination(window._hdGetFiltered());
    };

    window.toggleHdRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('hdRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setHdRowsPer = function(n) {
        hdPerPageVal = n; hdCurrentPage = 1;
        var m = document.getElementById('hdRowsMenu'); if (m) m.classList.remove('open');
        if (window._hdRenderPagination && window._hdGetFiltered) window._hdRenderPagination(window._hdGetFiltered());
    };

    window.toggleHdColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('hdColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.hdColVisSelectAll = function() { $('#hdColVisList input[type=checkbox]').prop('checked', true); };
    window.applyHdColVis = function() {
        var m = document.getElementById('hdColVisMenu'); if (m) m.classList.remove('open');
        $('#hdColVisList input[type=checkbox]').each(function() {
            var col = parseInt($(this).data('col')), show = $(this).is(':checked');
            $('#headsTable thead tr th:eq(' + col + ')').toggle(show);
            $('#headsTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleHdExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('hdExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportHd = function(type) {
        var m = document.getElementById('hdExportMenu'); if (m) m.classList.remove('open');
        var data = window._hdGetFiltered ? window._hdGetFiltered() : [];
        if (type === 'csv') {
            var hdrs = ['Head Code','Head Name','Category','Head Type','Budget Limit','Status'];
            var rows = data.map(function(h) { return [h.headCode||'', h.headName||'', h.category||'', h.headType||'', h.budgetLimit||0, h.status||'']; });
            var lines = [hdrs.map(function(h) { return '"' + h + '"'; }).join(',')];
            rows.forEach(function(r) { lines.push(r.map(function(c) { return '"' + (c+'').replace(/"/g,'""') + '"'; }).join(',')); });
            var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'account-heads.csv'; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
    };

    // ── Toolbar window functions — Transactions ────────────────────────────
    window.toggleTxFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('txFilterPane'); if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnTxFilter'); if (btn) btn.classList.toggle('active', !open);
    };

    window.applyTxFilters = function() {
        var typeVal   = ($('#txTypeFilter').val()   || '').toLowerCase();
        var statusVal = ($('#txStatusFilter').val() || '').toLowerCase();
        var dateFrom  = $('#txDateFrom').val() || '';
        var dateTo    = $('#txDateTo').val()   || '';
        txFiltered = (window._txns_ref || []).filter(function(t) {
            if (typeVal   && typeVal   !== 'all types'  && (t.type  ||t.headCategory||'').toLowerCase() !== typeVal)   return false;
            if (statusVal && statusVal !== 'all status' && (t.status||'').toLowerCase() !== statusVal) return false;
            var ds = t.date ? t.date.substring(0, 10) : '';
            if (dateFrom && ds && ds < dateFrom) return false;
            if (dateTo   && ds && ds > dateTo)   return false;
            return true;
        });
        var count = 0;
        if (typeVal   && typeVal   !== 'all types')  count++;
        if (statusVal && statusVal !== 'all status') count++;
        if (dateFrom) count++;
        if (dateTo)   count++;
        var badge = document.getElementById('txFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }
        txCurrentPage = 1;
        if (window._txRenderPagination && window._txGetFiltered) window._txRenderPagination(window._txGetFiltered());
        toggleTxFilter();
    };

    window.resetTxFilters = function() {
        txFiltered = null; txCurrentPage = 1;
        ['txCsType','txCsStatus'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        ['txDpDateFrom','txDpDateTo'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        var badge = document.getElementById('txFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        if (window._txRenderPagination && window._txGetFiltered) window._txRenderPagination(window._txGetFiltered());
    };

    window.toggleTxRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('txRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setTxRowsPer = function(n) {
        txPerPageVal = n; txCurrentPage = 1;
        var m = document.getElementById('txRowsMenu'); if (m) m.classList.remove('open');
        if (window._txRenderPagination && window._txGetFiltered) window._txRenderPagination(window._txGetFiltered());
    };

    window.toggleTxColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('txColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.txColVisSelectAll = function() { $('#txColVisList input[type=checkbox]').prop('checked', true); };
    window.applyTxColVis = function() {
        var m = document.getElementById('txColVisMenu'); if (m) m.classList.remove('open');
        $('#txColVisList input[type=checkbox]').each(function() {
            var col = parseInt($(this).data('col')), show = $(this).is(':checked');
            $('#txnTable thead tr th:eq(' + col + ')').toggle(show);
            $('#txnTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleTxExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('txExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportTx = function(type) {
        var m = document.getElementById('txExportMenu'); if (m) m.classList.remove('open');
        var data = window._txGetFiltered ? window._txGetFiltered() : [];
        if (type === 'csv') {
            var hdrs = ['Date','Head','Description','Type','Amount','Payment Mode','Status'];
            var rows = data.map(function(t) { return [t.date ? t.date.slice(0,10) : '', t.headName||'', t.description||'', t.type||'', t.amount||0, t.paymentMode||'', t.status||'']; });
            var lines = [hdrs.map(function(h) { return '"' + h + '"'; }).join(',')];
            rows.forEach(function(r) { lines.push(r.map(function(c) { return '"' + (c+'').replace(/"/g,'""') + '"'; }).join(',')); });
            var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'transactions.csv'; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
    };

    // ── Custom date picker & searchable select ────────────────────────────
    var IE_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var IE_DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    function ieCloseAll() {
        document.querySelectorAll('.opd-dp-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
        document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
    }
    document.addEventListener('click', ieCloseAll);
    window.addEventListener('scroll', function() {
        document.querySelectorAll('.opd-dp-popup.open, .opd-cs-popup.open').forEach(function(p) {
            if (!p._trigger) return;
            var rect = p._trigger.getBoundingClientRect();
            p.style.top = (rect.bottom + 6) + 'px'; p.style.left = rect.left + 'px';
        });
    }, true);

    function ieInitDp(wrapId) {
        var wrap = document.getElementById(wrapId); if (!wrap) return;
        var hidden = document.getElementById(wrap.dataset.target);
        var ph = wrap.dataset.placeholder || 'Select date';
        var selDate = null, viewYear = new Date().getFullYear(), viewMonth = new Date().getMonth();
        var triggerEl = document.createElement('div');
        triggerEl.className = 'opd-dp-trigger';
        triggerEl.innerHTML = '<span class="opd-dp-val opd-ph">' + ph + '</span><i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>';
        var popup = document.createElement('div'); popup.className = 'opd-dp-popup';
        wrap.appendChild(triggerEl); wrap.appendChild(popup); lucide.createIcons();
        var valEl = triggerEl.querySelector('.opd-dp-val');
        function render() {
            var firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
            var dim = new Date(viewYear, viewMonth + 1, 0).getDate();
            var h = '<div class="opd-dp-header"><button class="opd-dp-nav" data-a="p">&#8249;</button><span class="opd-dp-month-year">' + IE_MONTHS[viewMonth] + ' ' + viewYear + '</span><button class="opd-dp-nav" data-a="n">&#8250;</button></div><div class="opd-dp-grid">';
            IE_DAYS.forEach(function(d) { h += '<div class="opd-dp-dayname">' + d + '</div>'; });
            for (var i = 0; i < firstDow; i++) h += '<div class="opd-dp-day empty"></div>';
            for (var d = 1; d <= dim; d++) {
                var ds = viewYear + '-' + String(viewMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
                h += '<div class="opd-dp-day' + (selDate === ds ? ' selected' : '') + '" data-date="' + ds + '">' + d + '</div>';
            }
            popup.innerHTML = h + '</div>';
        }
        triggerEl.addEventListener('click', function(e) {
            e.stopPropagation(); var isOpen = popup.classList.contains('open'); ieCloseAll();
            if (!isOpen) {
                var rect = triggerEl.getBoundingClientRect();
                popup.style.top=(rect.bottom+6)+'px'; popup.style.left=rect.left+'px'; popup.style.width=rect.width+'px';
                popup._trigger=triggerEl;
                if (popup.parentNode !== document.body) document.body.appendChild(popup);
                render(); popup.classList.add('open'); triggerEl.classList.add('open');
            }
        });
        popup.addEventListener('click', function(e) {
            e.stopPropagation(); var tgt=e.target;
            if (tgt.dataset.a==='p'){if(--viewMonth<0){viewMonth=11;viewYear--;}render();}
            else if(tgt.dataset.a==='n'){if(++viewMonth>11){viewMonth=0;viewYear++;}render();}
            else if(tgt.dataset.date){selDate=tgt.dataset.date;valEl.textContent=selDate;valEl.classList.remove('opd-ph');if(hidden)hidden.value=selDate;ieCloseAll();}
        });
        wrap._reset=function(){selDate=null;viewYear=new Date().getFullYear();viewMonth=new Date().getMonth();valEl.textContent=ph;valEl.classList.add('opd-ph');if(hidden)hidden.value='';};
    }

    function ieInitCs(wrapId) {
        var wrap = document.getElementById(wrapId); if (!wrap) return;
        var hidden = document.getElementById(wrap.dataset.target);
        var ph = wrap.dataset.placeholder || 'Select...';
        var options = [], selVal = '';
        var triggerEl = document.createElement('div');
        triggerEl.className = 'opd-cs-trigger';
        triggerEl.innerHTML = '<span class="opd-cs-val opd-ph">' + ph + '</span><i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>';
        var popup = document.createElement('div'); popup.className = 'opd-cs-popup';
        popup.innerHTML = '<input type="text" class="opd-cs-search" placeholder="Search..."><div class="opd-cs-list"></div>';
        wrap.appendChild(triggerEl); wrap.appendChild(popup); lucide.createIcons();
        var valEl=triggerEl.querySelector('.opd-cs-val'), srch=popup.querySelector('.opd-cs-search'), list=popup.querySelector('.opd-cs-list');
        function renderList(q) {
            q=(q||'').toLowerCase();
            var filt=q?options.filter(function(o){return o.toLowerCase().indexOf(q)>-1;}):options;
            if(!filt.length){list.innerHTML='<div class="opd-cs-empty">No options</div>';return;}
            list.innerHTML=filt.map(function(o){return '<div class="opd-cs-option'+(o===selVal?' selected':'')+'" data-v="'+o.replace(/"/g,'&quot;')+'">'+o+'</div>';}).join('');
            list.querySelectorAll('.opd-cs-option').forEach(function(el){
                el.addEventListener('click',function(e){e.stopPropagation();selVal=this.dataset.v;valEl.textContent=selVal;valEl.classList.remove('opd-ph');if(hidden)hidden.value=selVal;ieCloseAll();});
            });
        }
        triggerEl.addEventListener('click',function(e){
            e.stopPropagation();var isOpen=popup.classList.contains('open');ieCloseAll();
            if(!isOpen){
                var rect=triggerEl.getBoundingClientRect();
                popup.style.top=(rect.bottom+6)+'px';popup.style.left=rect.left+'px';popup.style.width=rect.width+'px';
                popup._trigger=triggerEl;
                if(popup.parentNode!==document.body)document.body.appendChild(popup);
                popup.classList.add('open');triggerEl.classList.add('open');srch.value='';renderList('');
                setTimeout(function(){srch.focus();},40);
            }
        });
        srch.addEventListener('input',function(e){e.stopPropagation();renderList(this.value);});
        srch.addEventListener('click',function(e){e.stopPropagation();});
        popup.addEventListener('click',function(e){e.stopPropagation();});
        wrap.setOptions=function(opts){options=opts||[];};
        wrap._reset=function(){selVal='';valEl.textContent=ph;valEl.classList.add('opd-ph');if(hidden)hidden.value='';};
    }

    // ── Initialize toolbar components ──────────────────────────────────────
    ['txDpDateFrom','txDpDateTo'].forEach(ieInitDp);
    ['hdCsCategory','hdCsStatus','txCsType','txCsStatus'].forEach(ieInitCs);

    var w;
    w = document.getElementById('hdCsCategory'); if (w && w.setOptions) w.setOptions(['All Categories','Income','Expense']);
    w = document.getElementById('hdCsStatus');   if (w && w.setOptions) w.setOptions(['All Status','Active','Inactive']);
    w = document.getElementById('txCsType');     if (w && w.setOptions) w.setOptions(['All Types','Income','Expense']);
    w = document.getElementById('txCsStatus');   if (w && w.setOptions) w.setOptions(['All Status','Draft','Submitted','Posted']);

    // ── Form handlers (unchanged) ──────────────────────────────────────────

    $(document).on('click', '#btnAddHead', function() {
        editingHeadId = null;
        $('#headFormTitle').text('New Account Head');
        $('#btnSaveHead').html('<i data-lucide="check"></i> Save Head').prop('disabled', true);
        $('#headFormBody').html(buildHeadForm(null));
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('headFormSheet')).show();
    });

    $(document).on('click', '.btn-edit-head', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        var head = heads.find(function(h) { return h.headId === id; });
        if (!head) return;
        editingHeadId = id;
        $('#headFormTitle').text('Edit Account Head');
        $('#btnSaveHead').html('<i data-lucide="check"></i> Update Head').prop('disabled', false);
        $('#headFormBody').html(buildHeadForm(head));
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('headFormSheet')).show();
    });

    $(document).on('change', 'input[name="headCategory"]', function() {
        var cat = $(this).val();
        var color = cat === 'Income' ? '#16a34a' : '#dc2626';
        $('.cat-radio-card').css({ borderColor: 'var(--color-border)', background: '#fff' });
        $(this).closest('.cat-radio-card').css({ borderColor: color, background: color + '08' });
        var types = cat === 'Income' ? incomeTypes : expenseTypes;
        var opts = '<option value="">Select type...</option>';
        types.forEach(function(t) { opts += '<option value="' + t + '">' + t + '</option>'; });
        $('#headType').html(opts);
        $('#headFormError').empty();
        validateHeadForm();
    });

    $(document).on('input change', '#headType, #headName', function() { validateHeadForm(); });

    $(document).on('click', '#btnSaveHead', function() {
        if (!validateHeadForm()) return;
        var btn = $(this);
        btn.prop('disabled', true).html('<i data-lucide="loader-2" class="spin"></i> Saving...');
        var payload = {
            category: $('input[name="headCategory"]:checked').val(),
            headType: $('#headType').val(),
            headName: $('#headName').val().trim(),
            description: $('#headDescription').val() || null,
            budgetLimit: $('#headBudget').val() ? parseFloat($('#headBudget').val()) : null,
            glAccountCode: $('#headGLCode').val() || null
        };
        var url = editingHeadId ? '/api/account-heads/' + editingHeadId : '/api/account-heads';
        var method = editingHeadId ? 'PUT' : 'POST';
        $.ajax({
            url: url, method: method, contentType: 'application/json', data: JSON.stringify(payload),
            success: function() {
                try { bootstrap.Offcanvas.getInstance(document.getElementById('headFormSheet'))?.hide(); } catch(e) {}
                editingHeadId = null; loadAll();
            },
            error: function(xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'Failed to save';
                $('#headFormError').html(errorDiv(msg)); lucide.createIcons();
                btn.prop('disabled', false).html('<i data-lucide="check"></i> ' + (editingHeadId ? 'Update' : 'Save') + ' Head');
                lucide.createIcons();
            }
        });
    });

    $(document).on('click', '.btn-toggle-head', function(e) {
        e.preventDefault();
        $.ajax({
            url: '/api/account-heads/' + $(this).data('id'),
            method: 'PUT', contentType: 'application/json',
            data: JSON.stringify({ status: $(this).data('status') }),
            success: function() { loadAll(); }
        });
    });

    $(document).on('click', '.btn-delete-head', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        var head = heads.find(function(h) { return h.headId === id; });
        if (!confirm('Delete "' + (head ? head.headName : id) + '"? This cannot be undone.')) return;
        $.ajax({ url: '/api/account-heads/' + id, method: 'DELETE', success: function() { loadAll(); },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed to delete'); }
        });
    });

    $(document).on('click', '#btnAddTxn', function() {
        if (heads.filter(function(h) { return h.status === 'Active'; }).length === 0) {
            HMS.toast('Please create at least one active Account Head first.', 'warning');
            return;
        }
        editingTxnId = null;
        $('#txnFormTitle').text('New Transaction');
        $('#btnSaveTxn').html('<i data-lucide="check"></i> Save Transaction').prop('disabled', true);
        $('#txnFormBody').html(buildTxnForm(null));
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('txnFormSheet')).show();
    });

    $(document).on('click', '.btn-edit-txn', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        var txn = transactions.find(function(t) { return t.transactionId === id; });
        if (!txn) return;
        editingTxnId = id;
        $('#txnFormTitle').text('Edit Transaction');
        $('#btnSaveTxn').html('<i data-lucide="check"></i> Update Transaction').prop('disabled', false);
        $('#txnFormBody').html(buildTxnForm(txn));
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('txnFormSheet')).show();
    });

    $(document).on('change', '#txnHead', function() {
        var cat = $(this).find('option:selected').data('category');
        var tTypes = cat === 'Income' ? incomeTxnTypes : expenseTxnTypes;
        var opts = '<option value="">Select type...</option>';
        tTypes.forEach(function(tt) { opts += '<option value="' + tt + '">' + tt + '</option>'; });
        $('#txnType').html(opts);
        validateTxnForm();
    });

    $(document).on('input change', '#txnDate, #txnHead, #txnType, #txnDesc, #txnAmount, #txnPayment', function() { validateTxnForm(); });

    $(document).on('click', '#btnSaveTxn', function() {
        if (!validateTxnForm()) return;
        var btn = $(this);
        btn.prop('disabled', true).html('<i data-lucide="loader-2" class="spin"></i> Saving...');
        var payload = {
            headId: $('#txnHead').val(),
            transactionDate: $('#txnDate').val(),
            transactionType: $('#txnType').val(),
            description: $('#txnDesc').val().trim(),
            amount: parseFloat($('#txnAmount').val()),
            paymentMode: $('#txnPayment').val(),
            referenceNumber: $('#txnRef').val() || null,
            remarks: $('#txnRemarks').val() || null,
            status: $('#txnStatus').val()
        };
        var url = editingTxnId ? '/api/income-expense/transactions/' + editingTxnId : '/api/income-expense/transactions';
        var method = editingTxnId ? 'PUT' : 'POST';
        $.ajax({
            url: url, method: method, contentType: 'application/json', data: JSON.stringify(payload),
            success: function() {
                try { bootstrap.Offcanvas.getInstance(document.getElementById('txnFormSheet'))?.hide(); } catch(e) {}
                editingTxnId = null; loadAll();
            },
            error: function(xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'Failed to save';
                $('#txnFormError').html(errorDiv(msg)); lucide.createIcons();
                btn.prop('disabled', false).html('<i data-lucide="check"></i> ' + (editingTxnId ? 'Update' : 'Save') + ' Transaction');
                lucide.createIcons();
            }
        });
    });

    $(document).on('click', '.btn-post-txn', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        if (!confirm('Post this transaction? Once posted, it cannot be edited or deleted.')) return;
        $.ajax({
            url: '/api/income-expense/transactions/' + id + '/post', method: 'POST',
            success: function() { loadAll(); },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed to post'); }
        });
    });

    $(document).on('click', '.btn-delete-txn', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        if (!confirm('Delete this transaction? This cannot be undone.')) return;
        $.ajax({
            url: '/api/income-expense/transactions/' + id, method: 'DELETE',
            success: function() { loadAll(); },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed to delete'); }
        });
    });

    loadAll();

    // ── Form builders (unchanged) ──────────────────────────────────────────

    function buildHeadForm(head) {
        var isEdit = !!head;
        var h = '<div id="headFormError"></div>';
        h += '<div style="margin-bottom:16px">';
        h += '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Category <span style="color:#dc2626">*</span></label>';
        h += '<div style="display:flex;gap:12px">';
        ['Income','Expense'].forEach(function(cat) {
            var checked = (isEdit && head.category === cat) || (!isEdit && cat === 'Income') ? ' checked' : '';
            var color = cat === 'Income' ? '#16a34a' : '#dc2626';
            var icon = cat === 'Income' ? 'trending-up' : 'trending-down';
            h += '<label style="display:flex;align-items:center;gap:8px;padding:10px 20px;border:2px solid ' + (checked ? color : 'var(--color-border)') + ';border-radius:10px;cursor:pointer;background:' + (checked ? color + '08' : '#fff') + ';flex:1;transition:all .2s" class="cat-radio-card">';
            h += '<input type="radio" name="headCategory" value="' + cat + '"' + checked + ' style="display:none">';
            h += '<i data-lucide="' + icon + '" style="width:18px;height:18px;color:' + color + '"></i>';
            h += '<span style="font-weight:600;color:' + color + '">' + cat + '</span>';
            h += '</label>';
        });
        h += '</div></div>';
        h += '<div style="margin-bottom:16px">';
        h += '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Head Type <span style="color:#dc2626">*</span></label>';
        h += '<select class="form-select" id="headType"><option value="">Select type...</option>';
        var currentCat = isEdit ? head.category : 'Income';
        var types = currentCat === 'Income' ? incomeTypes : expenseTypes;
        types.forEach(function(t) { h += '<option value="' + t + '"' + (isEdit && head.headType === t ? ' selected' : '') + '>' + t + '</option>'; });
        h += '</select></div>';
        h += '<div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Head Name <span style="color:#dc2626">*</span></label>';
        h += '<input type="text" class="form-control" id="headName" placeholder="e.g., Ambulance Services, Staff Training" maxlength="100" value="' + esc(isEdit ? head.headName : '') + '"></div>';
        h += '<div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Description</label>';
        h += '<textarea class="form-control" id="headDescription" rows="2" maxlength="500" placeholder="Internal notes...">' + esc(isEdit ? head.description || '' : '') + '</textarea></div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
        h += '<div><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Budget Limit</label>';
        h += '<div style="position:relative"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:600;color:var(--color-muted-foreground)">Rs.</span>';
        h += '<input type="number" class="form-control" id="headBudget" min="0" step="1000" style="padding-left:40px" value="' + (isEdit && head.budgetLimit ? head.budgetLimit : '') + '"></div></div>';
        h += '<div><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">GL Account Code</label>';
        h += '<input type="text" class="form-control" id="headGLCode" placeholder="e.g., 4100" value="' + esc(isEdit ? head.glAccountCode || '' : '') + '"></div></div>';
        return h;
    }

    function validateHeadForm() {
        var cat = $('input[name="headCategory"]:checked').val();
        var type = $('#headType').val();
        var name = ($('#headName').val() || '').trim();
        var valid = cat && type && name.length >= 3;
        $('#btnSaveHead').prop('disabled', !valid);
        return valid;
    }

    function buildTxnForm(txn) {
        var isEdit = !!txn;
        var h = '<div id="txnFormError"></div>';
        h += '<div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Transaction Date <span style="color:#dc2626">*</span></label>';
        h += '<input type="date" class="form-control" id="txnDate" max="' + todayStr() + '" value="' + (isEdit ? (txn.date || '').substring(0,10) : todayStr()) + '"></div>';
        h += '<div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Account Head <span style="color:#dc2626">*</span></label>';
        h += '<select class="form-select" id="txnHead"><option value="">Select account head...</option>';
        var activeHeads = heads.filter(function(h) { return h.status === 'Active'; });
        var incHeads = activeHeads.filter(function(h) { return h.category === 'Income'; });
        var expHeads = activeHeads.filter(function(h) { return h.category === 'Expense'; });
        if (incHeads.length) {
            h += '<optgroup label="── Income ──">';
            incHeads.forEach(function(ah) { h += '<option value="' + esc(ah.headId) + '" data-category="Income"' + (isEdit && txn.headId === ah.headId ? ' selected' : '') + '>' + esc(ah.headCode) + ' — ' + esc(ah.headName) + '</option>'; });
            h += '</optgroup>';
        }
        if (expHeads.length) {
            h += '<optgroup label="── Expense ──">';
            expHeads.forEach(function(ah) { h += '<option value="' + esc(ah.headId) + '" data-category="Expense"' + (isEdit && txn.headId === ah.headId ? ' selected' : '') + '>' + esc(ah.headCode) + ' — ' + esc(ah.headName) + '</option>'; });
            h += '</optgroup>';
        }
        h += '</select></div>';
        var selCat = isEdit ? (txn.headCategory || txn.type || '') : '';
        h += '<div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Transaction Type <span style="color:#dc2626">*</span></label>';
        h += '<select class="form-select" id="txnType"><option value="">Select head first...</option>';
        if (selCat) {
            var tTypes = selCat === 'Income' ? incomeTxnTypes : expenseTxnTypes;
            h = h.replace('Select head first...', 'Select type...');
            tTypes.forEach(function(tt) { h += '<option value="' + tt + '"' + (isEdit && txn.transactionType === tt ? ' selected' : '') + '>' + tt + '</option>'; });
        }
        h += '</select></div>';
        h += '<div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Description <span style="color:#dc2626">*</span></label>';
        h += '<input type="text" class="form-control" id="txnDesc" placeholder="e.g., Monthly rent payment for OPD building" value="' + esc(isEdit ? txn.description || '' : '') + '">';
        h += '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Min 10 characters</div></div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
        h += '<div><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Amount <span style="color:#dc2626">*</span></label>';
        h += '<div style="position:relative"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:600;color:var(--color-muted-foreground)">Rs.</span>';
        h += '<input type="number" class="form-control" id="txnAmount" min="1" step="1" style="padding-left:40px" value="' + (isEdit ? txn.amount : '') + '"></div></div>';
        h += '<div><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Payment Mode <span style="color:#dc2626">*</span></label>';
        h += '<select class="form-select" id="txnPayment"><option value="">Select...</option>';
        paymentModes.forEach(function(pm) { h += '<option value="' + pm + '"' + (isEdit && txn.paymentMode === pm ? ' selected' : '') + '>' + pm + '</option>'; });
        h += '</select></div></div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
        h += '<div><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Reference Number</label>';
        h += '<input type="text" class="form-control" id="txnRef" placeholder="Cheque/Invoice #" maxlength="50" value="' + esc(isEdit ? txn.referenceNumber || '' : '') + '"></div>';
        h += '<div><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Status</label>';
        h += '<select class="form-select" id="txnStatus">';
        ['Draft','Posted'].forEach(function(s) { h += '<option value="' + s + '"' + (isEdit && txn.status === s ? ' selected' : '') + '>' + s + '</option>'; });
        h += '</select></div></div>';
        h += '<div style="margin-bottom:16px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Remarks</label>';
        h += '<textarea class="form-control" id="txnRemarks" rows="2" maxlength="250" placeholder="Additional notes...">' + esc(isEdit ? txn.remarks || '' : '') + '</textarea></div>';
        return h;
    }

    function validateTxnForm() {
        var head = $('#txnHead').val();
        var date = $('#txnDate').val();
        var type = $('#txnType').val();
        var desc = ($('#txnDesc').val() || '').trim();
        var amount = $('#txnAmount').val();
        var payment = $('#txnPayment').val();
        var valid = head && date && type && desc.length >= 10 && amount && parseFloat(amount) >= 1 && payment;
        $('#btnSaveTxn').prop('disabled', !valid);
        return valid;
    }
});
