$(document).ready(function() {
    var hospitalInfo = { currency: 'PKR' };
    var currentTxnId = null;

    function esc(s) { return $('<span>').text(s || '').html(); }
    function fmt(n) { return hospitalInfo.currency + ' ' + Number(n || 0).toLocaleString(); }

    $.get('/api/config/hospital-info', function(d) { if (d && d.currency) hospitalInfo.currency = d.currency; });

    loadDashboard();
    loadRevenue('today');
    loadTransactions();
    loadPendingOPD();
    loadPendingIPD();
    loadPendingER();

    function loadDashboard() {
        $.get('/api/pharmacy-billing/dashboard', function(d) {
            $('#statTodaySales').text(fmt(d.todaySales));
            $('#statPending').text(fmt(d.pendingPayments));
            $('#statIPD').text(fmt(d.outstandingIpd));
            $('#statER').text(fmt(d.outstandingEr));
            $('#statPanel').text(fmt(d.panelOutstanding));
            $('#statCash').text(fmt(d.cashSales));
            $('#statCard').text(fmt(d.cardSales));
            lucide.createIcons();
        });
    }

    function loadRevenue(period) {
        $.get('/api/pharmacy-billing/revenue', { period: period }, function(d) {
            var $dept = $('#revDeptContent').empty();
            if (d.departments.length === 0) {
                $dept.html('<div style="padding:20px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No revenue data for this period</div>');
            } else {
                var colors = ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#eab308'];
                d.departments.forEach(function(item, idx) {
                    var color = colors[idx % colors.length];
                    $dept.append(
                        '<div style="margin-bottom:12px">' +
                            '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
                                '<span style="font-size:13px;font-weight:500">' + esc(item.department) + '</span>' +
                                '<span style="font-size:13px;font-weight:600;font-family:monospace">' + fmt(item.total) + ' (' + item.percentage + '%)</span>' +
                            '</div>' +
                            '<div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden"><div style="height:100%;width:' + item.percentage + '%;background:' + color + ';border-radius:4px;transition:width 0.3s"></div></div>' +
                        '</div>'
                    );
                });
                $dept.append('<div style="border-top:1px solid var(--color-border);padding-top:8px;margin-top:8px;display:flex;justify-content:space-between;font-size:14px;font-weight:700"><span>Total</span><span>' + fmt(d.grandTotal) + '</span></div>');
            }

            var $pay = $('#revPayContent').empty();
            if (d.paymentCategories.length === 0) {
                $pay.html('<div style="padding:20px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No data</div>');
            } else {
                var payColors = ['#22c55e', '#3b82f6', '#8b5cf6'];
                d.paymentCategories.forEach(function(item, idx) {
                    var color = payColors[idx % payColors.length];
                    $pay.append(
                        '<div style="margin-bottom:12px">' +
                            '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
                                '<span style="font-size:13px;font-weight:500">' + esc(item.category) + '</span>' +
                                '<span style="font-size:13px;font-weight:600;font-family:monospace">' + fmt(item.total) + ' (' + item.percentage + '%)</span>' +
                            '</div>' +
                            '<div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden"><div style="height:100%;width:' + item.percentage + '%;background:' + color + ';border-radius:4px;transition:width 0.3s"></div></div>' +
                        '</div>'
                    );
                });
                $pay.append('<div style="border-top:1px solid var(--color-border);padding-top:8px;margin-top:8px;display:flex;justify-content:space-between;font-size:14px;font-weight:700"><span>Total</span><span>' + fmt(d.grandTotal) + '</span></div>');
            }
        });
    }

    $(document).on('click', '.rev-period-btn', function() {
        $('.rev-period-btn').removeClass('active').css({ background: '#fff', color: 'var(--color-foreground)' });
        $(this).addClass('active').css({ background: 'var(--aquamint)', color: 'var(--midnight-blue)' });
        loadRevenue($(this).data('period'));
    });

    function loadTransactions() {
        var params = {};
        var search = $('#txnSearch').val();
        var dept = $('#txnDeptFilter').val();
        var status = $('#txnStatusFilter').val();
        if (search) params.search = search;
        if (dept) params.department = dept;
        if (status) params.paymentStatus = status;

        $.get('/api/pharmacy-billing/transactions', params, function(data) {
            var $tb = $('#tbodyTransactions').empty();
            if (data.length === 0) {
                $tb.append('<tr><td colspan="10" style="padding:24px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No transactions found</td></tr>');
                return;
            }

            data.forEach(function(txn) {
                var deptColors = { 'OPD': '#3b82f6', 'IPD': '#8b5cf6', 'Emergency': '#ef4444', 'OT': '#f97316', 'Walk-in': '#22c55e' };
                var deptBg = { 'OPD': '#DBEAFE', 'IPD': '#EDE9FE', 'Emergency': '#FEE2E2', 'OT': '#FFF7ED', 'Walk-in': '#DCFCE7' };
                var statusColors = { 'Paid': '#22c55e', 'Pending': '#f97316', 'Partial': '#eab308', 'Voided': '#ef4444' };
                var statusBg = { 'Paid': '#DCFCE7', 'Pending': '#FFF7ED', 'Partial': '#FEFCE8', 'Voided': '#FEE2E2' };
                var reconIcons = { 'Matched': '<span style="color:#22c55e;font-weight:600">&#10003; Matched</span>', 'Pending': '<span style="color:#f97316;font-weight:600">&#9888; Pending</span>', 'Mismatch': '<span style="color:#ef4444;font-weight:600">&#10007; Mismatch</span>' };

                var dateStr = '';
                if (txn.transactionDate) {
                    var d = new Date(txn.transactionDate);
                    dateStr = d.toLocaleDateString('en-PK') + ' ' + d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
                }

                $tb.append(
                    '<tr class="txn-row" data-txn-id="' + esc(txn.transactionId) + '" style="border-bottom:1px solid var(--color-border);cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'var(--color-background)\'" onmouseout="this.style.background=\'#fff\'">' +
                        '<td style="padding:10px 14px;font-size:13px;font-weight:600;font-family:monospace;color:var(--aquamint)">' + esc(txn.transactionId) + '</td>' +
                        '<td style="padding:10px 14px;font-size:12px;color:var(--color-muted-foreground)">' + dateStr + '</td>' +
                        '<td style="padding:10px 14px"><div style="font-size:13px;font-weight:500">' + esc(txn.patientName) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(txn.mrn) + '</div></td>' +
                        '<td style="padding:10px 14px;text-align:center"><span style="padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;background:' + (deptBg[txn.department] || '#f1f5f9') + ';color:' + (deptColors[txn.department] || '#666') + '">' + esc(txn.department) + '</span></td>' +
                        '<td style="padding:10px 14px;font-size:12px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(txn.orderId) + '</td>' +
                        '<td style="padding:10px 14px;text-align:right;font-size:13px;font-weight:600;font-family:monospace">' + fmt(txn.totalAmount) + '</td>' +
                        '<td style="padding:10px 14px;text-align:center;font-size:12px">' + esc(txn.paymentMode) + '</td>' +
                        '<td style="padding:10px 14px;text-align:center"><span style="padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;background:' + (statusBg[txn.paymentStatus] || '#f1f5f9') + ';color:' + (statusColors[txn.paymentStatus] || '#666') + '">' + esc(txn.paymentStatus) + '</span></td>' +
                        '<td style="padding:10px 14px;text-align:center;font-size:12px">' + esc(txn.billedTo) + '</td>' +
                        '<td style="padding:10px 14px;text-align:center;font-size:12px">' + (reconIcons[txn.reconciliationStatus] || esc(txn.reconciliationStatus)) + '</td>' +
                    '</tr>'
                );
            });
        });
    }

    var searchTimer;
    $('#txnSearch').on('input', function() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadTransactions, 300);
    });
    $('#txnDeptFilter, #txnStatusFilter').on('change', loadTransactions);

    $(document).on('click', '.txn-row', function() {
        var txnId = $(this).data('txn-id');
        openTxnDetail(txnId);
    });

    function openTxnDetail(txnId) {
        currentTxnId = txnId;
        $.get('/api/pharmacy-billing/transactions/' + txnId, function(txn) {
            $('#txnDetailId').text('Transaction ID: ' + txn.transactionId);

            var dateStr = '';
            if (txn.transactionDate) {
                var d = new Date(txn.transactionDate);
                dateStr = d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
            }

            var itemsHtml = '';
            if (txn.items && txn.items.length > 0) {
                itemsHtml = '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:8px">' +
                    '<thead><tr style="background:var(--color-background)"><th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Medicine</th><th style="padding:6px 10px;text-align:center;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Qty</th><th style="padding:6px 10px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Unit Price</th><th style="padding:6px 10px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Total</th></tr></thead><tbody>';
                txn.items.forEach(function(item) {
                    itemsHtml += '<tr style="border-bottom:1px solid var(--color-border)"><td style="padding:6px 10px">' + esc(item.name) + '</td><td style="padding:6px 10px;text-align:center">' + item.qty + '</td><td style="padding:6px 10px;text-align:right;font-family:monospace">' + fmt(item.unitPrice) + '</td><td style="padding:6px 10px;text-align:right;font-family:monospace;font-weight:600">' + fmt(item.total) + '</td></tr>';
                });
                itemsHtml += '</tbody></table>';
            }

            var reconColor = txn.reconciliationStatus === 'Matched' ? '#22c55e' : (txn.reconciliationStatus === 'Mismatch' ? '#ef4444' : '#f97316');
            var reconIcon = txn.reconciliationStatus === 'Matched' ? '&#10003;' : (txn.reconciliationStatus === 'Mismatch' ? '&#10007;' : '&#9888;');

            var html =
                '<div style="margin-bottom:20px">' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">' +
                        '<div><span style="color:var(--color-muted-foreground)">Patient:</span> <strong>' + esc(txn.patientName) + '</strong> (' + esc(txn.mrn) + ')</div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Order ID:</span> <strong>' + esc(txn.orderId) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Date/Time:</span> <strong>' + dateStr + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Department:</span> <strong>' + esc(txn.department) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Ordered By:</span> <strong>' + esc(txn.orderedBy) + '</strong></div>' +
                    '</div>' +
                '</div>' +

                '<div style="margin-bottom:20px">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:8px;letter-spacing:0.05em">Dispensed Medicines</div>' +
                    itemsHtml +
                '</div>' +

                '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Financial Breakdown</div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Subtotal:</span><span style="font-family:monospace">' + fmt(txn.subtotal) + '</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Discount:</span><span style="font-family:monospace">' + fmt(txn.discount) + '</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Tax:</span><span style="font-family:monospace">' + fmt(txn.tax) + '</span></div>' +
                    '<div style="border-top:1px solid var(--color-border);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-size:15px;font-weight:700"><span>TOTAL:</span><span style="color:var(--aquamint)">' + fmt(txn.totalAmount) + '</span></div>' +
                '</div>' +

                '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Payment Information</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">' +
                        '<div><span style="color:var(--color-muted-foreground)">Payment Category:</span> <strong>' + esc(txn.billedTo) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Payment Mode:</span> <strong>' + esc(txn.paymentMode) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Payment Date:</span> <strong>' + dateStr + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Receipt Number:</span> <strong>' + esc(txn.receiptNumber) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Received By:</span> <strong>' + esc(txn.receivedBy) + '</strong></div>' +
                    '</div>' +
                '</div>' +

                '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Billing Integration</div>' +
                    '<div style="font-size:13px;line-height:2">' +
                        '<div>' + (txn.chargePosted ? '<span style="color:#22c55e">&#10003;</span>' : '<span style="color:#ef4444">&#10007;</span>') + ' Charge recorded in billing system</div>' +
                        '<div><span style="color:#22c55e">&#10003;</span> Payment updated in financial records</div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Billing Reference:</span> <strong>' + esc(txn.billingReference) + '</strong></div>' +
                    '</div>' +
                '</div>' +

                '<div style="padding:16px;border-radius:10px;border:2px solid ' + reconColor + ';background:' + reconColor + '10">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:8px;letter-spacing:0.05em">Reconciliation</div>' +
                    '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>Pharmacy Record:</span><span style="font-family:monospace;font-weight:600">' + fmt(txn.totalAmount) + '</span></div>' +
                    '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px"><span>Billing Record:</span><span style="font-family:monospace;font-weight:600">' + fmt(txn.totalAmount) + '</span></div>' +
                    '<div style="text-align:center;font-size:15px;font-weight:700;color:' + reconColor + '">' + reconIcon + ' ' + esc(txn.reconciliationStatus).toUpperCase() + '</div>' +
                '</div>';

            $('#txnDetailBody').html(html);

            var offcanvas = new bootstrap.Offcanvas(document.getElementById('txnDetailSheet'));
            offcanvas.show();
            lucide.createIcons();
        });
    }

    function openIpdOrderDetail(orderId) {
        currentTxnId = orderId;
        $.get('/api/pharmacy-billing/ipd-order/' + orderId, function(txn) {
            $('#txnDetailId').text('Order ID: ' + txn.transactionId);

            var dateStr = '';
            if (txn.transactionDate) {
                var d = new Date(txn.transactionDate);
                dateStr = d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
            }

            var itemsHtml = '';
            if (txn.items && txn.items.length > 0) {
                itemsHtml = '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:8px">' +
                    '<thead><tr style="background:var(--color-background)"><th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Medicine</th><th style="padding:6px 10px;text-align:center;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Qty</th><th style="padding:6px 10px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Unit Price</th><th style="padding:6px 10px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Total</th></tr></thead><tbody>';
                txn.items.forEach(function(item) {
                    itemsHtml += '<tr style="border-bottom:1px solid var(--color-border)"><td style="padding:6px 10px">' + esc(item.name) + '</td><td style="padding:6px 10px;text-align:center">' + item.qty + '</td><td style="padding:6px 10px;text-align:right;font-family:monospace">' + fmt(item.unitPrice) + '</td><td style="padding:6px 10px;text-align:right;font-family:monospace;font-weight:600">' + fmt(item.total) + '</td></tr>';
                });
                itemsHtml += '</tbody></table>';
            } else {
                itemsHtml = '<p style="font-size:13px;color:var(--color-muted-foreground)">No items found.</p>';
            }

            var html =
                '<div style="margin-bottom:20px">' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">' +
                        '<div><span style="color:var(--color-muted-foreground)">Patient:</span> <strong>' + esc(txn.patientName) + '</strong> (' + esc(txn.mrn) + ')</div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Order ID:</span> <strong>' + esc(txn.orderId) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Date/Time:</span> <strong>' + dateStr + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Department:</span> <strong>' + esc(txn.department) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Ordered By:</span> <strong>' + esc(txn.orderedBy) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Dispensed By:</span> <strong>' + esc(txn.receivedBy) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">IPD Ref:</span> <strong>' + esc(txn.billingReference) + '</strong></div>' +
                    '</div>' +
                '</div>' +

                '<div style="margin-bottom:20px">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:8px;letter-spacing:0.05em">Dispensed Medicines</div>' +
                    itemsHtml +
                '</div>' +

                '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Financial Breakdown</div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Subtotal:</span><span style="font-family:monospace">' + fmt(txn.subtotal) + '</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Discount:</span><span style="font-family:monospace">' + fmt(txn.discount) + '</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Tax:</span><span style="font-family:monospace">' + fmt(txn.tax) + '</span></div>' +
                    '<div style="border-top:1px solid var(--color-border);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-size:15px;font-weight:700"><span>TOTAL:</span><span style="color:var(--aquamint)">' + fmt(txn.totalAmount) + '</span></div>' +
                '</div>' +

                '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Billing Status</div>' +
                    '<div style="font-size:13px;line-height:2">' +
                        '<div><span style="color:#22c55e">&#10003;</span> Charge recorded — IPD Account</div>' +
                        '<div><span style="color:#f97316">&#9888;</span> Awaiting payment reconciliation</div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Payment Mode:</span> <strong>IPD Account</strong></div>' +
                    '</div>' +
                '</div>';

            $('#txnDetailBody').html(html);
            var offcanvas = new bootstrap.Offcanvas(document.getElementById('txnDetailSheet'));
            offcanvas.show();
            lucide.createIcons();
        }).fail(function() {
            HMS.toast('Could not load order details.', 'error');
        });
    }

    $(document).on('click', '.btn-void-txn', function() {
        if (!currentTxnId) return;
        if (!confirm('Are you sure you want to void this transaction?')) return;

        $.ajax({
            url: '/api/pharmacy-billing/void',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ transactionId: currentTxnId }),
            success: function() {
                bootstrap.Offcanvas.getInstance(document.getElementById('txnDetailSheet')).hide();
                HMS.toast('Transaction voided successfully', 'success');
                loadDashboard();
                loadTransactions();
            },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed'); }
        });
    });

    $(document).on('click', '.btn-reconcile-txn', function() {
        if (!currentTxnId) return;
        $.ajax({
            url: '/api/pharmacy-billing/reconcile',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ transactionId: currentTxnId, status: 'Matched' }),
            success: function() {
                bootstrap.Offcanvas.getInstance(document.getElementById('txnDetailSheet')).hide();
                HMS.toast('Transaction marked as reconciled', 'success');
                loadTransactions();
            },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed'); }
        });
    });

    function loadPendingOPD() {
        $.get('/api/pharmacy-billing/pending-opd', function(d) {
            $('#pendingOpdTotal').text('Total: ' + fmt(d.totalPending));
            var $tb = $('#tbodyPendingOpd').empty();
            if (d.items.length === 0) {
                $tb.append('<tr><td colspan="6" style="padding:16px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No pending OPD payments</td></tr>');
            } else {
                d.items.forEach(function(item) {
                    $tb.append(
                        '<tr style="border-bottom:1px solid var(--color-border)">' +
                            '<td style="padding:8px 14px"><div style="font-size:13px;font-weight:500">' + esc(item.patientName) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(item.mrn) + '</div></td>' +
                            '<td style="padding:8px 14px;font-size:12px;color:var(--color-muted-foreground)">' + esc(item.date) + '</td>' +
                            '<td style="padding:8px 14px;font-size:12px;font-family:monospace">' + esc(item.orderId) + '</td>' +
                            '<td style="padding:8px 14px;text-align:right;font-size:13px;font-weight:600;font-family:monospace;color:#f97316">' + fmt(item.amountDue) + '</td>' +
                            '<td style="padding:8px 14px;text-align:center;font-size:12px;color:var(--color-muted-foreground)">' + esc(item.daysPending) + '</td>' +
                            '<td style="padding:8px 14px;text-align:center"><button class="btn-collect" data-txn-id="' + esc(item.transactionId) + '" style="padding:4px 12px;background:var(--aquamint);border:none;border-radius:6px;font-size:11px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Collect</button></td>' +
                        '</tr>'
                    );
                });
            }
        });
    }

    function loadPendingIPD() {
        $.get('/api/pharmacy-billing/pending-ipd', function(d) {
            $('#pendingIpdTotal').text('Total: ' + fmt(d.totalRunning));
            var $tb = $('#tbodyPendingIpd').empty();
            if (d.items.length === 0) {
                $tb.append('<tr><td colspan="5" style="padding:16px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No pending IPD charges</td></tr>');
            } else {
                d.items.forEach(function(item) {
                    $tb.append(
                        '<tr style="border-bottom:1px solid var(--color-border)">' +
                            '<td style="padding:8px 14px"><div style="font-size:13px;font-weight:500">' + esc(item.patientName) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(item.mrn) + '</div></td>' +
                            '<td style="padding:8px 14px;font-size:12px;font-family:monospace">' + esc(item.ipdNumber) + '</td>' +
                            '<td style="padding:8px 14px;text-align:right;font-size:13px;font-weight:600;font-family:monospace;color:#eab308">' + fmt(item.totalCharges) + '</td>' +
                            '<td style="padding:8px 14px;font-size:12px;color:var(--color-muted-foreground)">' + esc(item.lastUpdated) + '</td>' +
                            '<td style="padding:8px 14px;text-align:center"><button class="btn-view-txn" data-txn-id="' + esc(item.transactionId) + '" data-source="' + esc(item.source || 'transaction') + '" style="padding:4px 12px;background:var(--color-background);border:1px solid var(--color-border);border-radius:6px;font-size:11px;font-weight:500;cursor:pointer">View</button></td>' +
                        '</tr>'
                    );
                });
            }
        });
    }

    function loadPendingER() {
        $.get('/api/pharmacy-billing/pending-er', function(d) {
            $('#pendingErTotal').text('Total: ' + fmt(d.totalRunning));
            var $tb = $('#tbodyPendingEr').empty();
            if (!d.items || d.items.length === 0) {
                $tb.append('<tr><td colspan="7" style="padding:16px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No pending ER dispensed medicine charges</td></tr>');
            } else {
                d.items.forEach(function(item) {
                    var statusColor = item.orderStatus === 'Completed' ? '#16a34a' : '#2563eb';
                    var statusBg    = item.orderStatus === 'Completed' ? 'rgba(22,163,74,0.08)' : 'rgba(37,99,235,0.08)';
                    $tb.append(
                        '<tr style="border-bottom:1px solid var(--color-border)">' +
                            '<td style="padding:8px 14px"><div style="font-size:13px;font-weight:500">' + esc(item.patientName) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(item.mrn) + '</div></td>' +
                            '<td style="padding:8px 14px;font-size:12px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(item.visitNumber) + '</td>' +
                            '<td style="padding:8px 14px;font-size:12px;font-family:monospace">' + esc(item.transactionId) + '</td>' +
                            '<td style="padding:8px 14px;text-align:center"><span style="font-size:11px;font-weight:600;color:' + statusColor + ';background:' + statusBg + ';padding:2px 8px;border-radius:10px">' + esc(item.orderStatus) + '</span></td>' +
                            '<td style="padding:8px 14px;text-align:right;font-size:13px;font-weight:600;font-family:monospace;color:#dc2626">' + fmt(item.totalCharges) + '</td>' +
                            '<td style="padding:8px 14px;font-size:12px;color:var(--color-muted-foreground)">' + esc(item.lastUpdated) + '</td>' +
                            '<td style="padding:8px 14px;text-align:center"><button class="btn-view-er-order" data-order-id="' + esc(item.transactionId) + '" style="padding:4px 12px;background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.2);border-radius:6px;font-size:11px;font-weight:600;color:#dc2626;cursor:pointer">View</button></td>' +
                        '</tr>'
                    );
                });
            }
            lucide.createIcons();
        });
    }

    function openErOrderDetail(orderId) {
        currentTxnId = orderId;
        $.get('/api/pharmacy-billing/er-order/' + orderId, function(txn) {
            $('#txnDetailId').text('ER Order: ' + txn.transactionId);

            var dateStr = '';
            if (txn.transactionDate) {
                var d = new Date(txn.transactionDate);
                dateStr = d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
            }

            var itemsHtml = '';
            if (txn.items && txn.items.length > 0) {
                itemsHtml = '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:8px">' +
                    '<thead><tr style="background:var(--color-background)"><th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Medicine</th><th style="padding:6px 10px;text-align:center;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Qty</th><th style="padding:6px 10px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Unit Price</th><th style="padding:6px 10px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground)">Total</th></tr></thead><tbody>';
                txn.items.forEach(function(item) {
                    itemsHtml += '<tr style="border-bottom:1px solid var(--color-border)"><td style="padding:6px 10px">' + esc(item.name) + '</td><td style="padding:6px 10px;text-align:center">' + item.qty + '</td><td style="padding:6px 10px;text-align:right;font-family:monospace">' + fmt(item.unitPrice) + '</td><td style="padding:6px 10px;text-align:right;font-family:monospace;font-weight:600">' + fmt(item.total) + '</td></tr>';
                });
                itemsHtml += '</tbody></table>';
            } else {
                itemsHtml = '<p style="font-size:13px;color:var(--color-muted-foreground)">No items found.</p>';
            }

            var html =
                '<div style="margin-bottom:16px;padding:10px 14px;background:#FEF2F2;border-radius:8px;border:1px solid rgba(220,38,38,0.2);display:flex;align-items:center;gap:8px">' +
                    '<i data-lucide="siren" style="width:14px;height:14px;color:#dc2626"></i>' +
                    '<span style="font-size:12px;font-weight:600;color:#991b1b">Emergency Department — Pharmacy Charge</span>' +
                '</div>' +

                '<div style="margin-bottom:20px">' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">' +
                        '<div><span style="color:var(--color-muted-foreground)">Patient:</span> <strong>' + esc(txn.patientName) + '</strong> (' + esc(txn.mrn) + ')</div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Order ID:</span> <strong>' + esc(txn.orderId) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Date/Time:</span> <strong>' + dateStr + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Department:</span> <strong style="color:#dc2626">ER — Emergency</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Ordered By:</span> <strong>' + esc(txn.orderedBy) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Dispensed By:</span> <strong>' + esc(txn.receivedBy) + '</strong></div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Visit Ref:</span> <strong>' + esc(txn.billingReference) + '</strong></div>' +
                    '</div>' +
                '</div>' +

                '<div style="margin-bottom:20px">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:8px;letter-spacing:0.05em">Dispensed Medicines</div>' +
                    itemsHtml +
                '</div>' +

                '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:20px">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Financial Breakdown</div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Subtotal:</span><span style="font-family:monospace">' + fmt(txn.subtotal) + '</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Discount:</span><span style="font-family:monospace">' + fmt(txn.discount) + '</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Tax:</span><span style="font-family:monospace">' + fmt(txn.tax) + '</span></div>' +
                    '<div style="border-top:1px solid var(--color-border);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-size:15px;font-weight:700"><span>TOTAL:</span><span style="color:#dc2626">' + fmt(txn.totalAmount) + '</span></div>' +
                '</div>' +

                '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                    '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Billing Status</div>' +
                    '<div style="font-size:13px;line-height:2">' +
                        '<div><span style="color:#22c55e">&#10003;</span> Charge recorded — ER Account</div>' +
                        '<div><span style="color:#f97316">&#9888;</span> Awaiting payment reconciliation</div>' +
                        '<div><span style="color:var(--color-muted-foreground)">Payment Mode:</span> <strong>ER Account</strong></div>' +
                    '</div>' +
                '</div>';

            $('#txnDetailBody').html(html);
            var offcanvas = new bootstrap.Offcanvas(document.getElementById('txnDetailSheet'));
            offcanvas.show();
            lucide.createIcons();
        }).fail(function() {
            HMS.toast('Could not load ER order details.', 'error');
        });
    }

    $(document).on('click', '.btn-view-er-order', function() {
        var orderId = $(this).data('order-id');
        openErOrderDetail(orderId);
    });

    $(document).on('click', '.btn-collect', function() {
        var txnId = $(this).data('txn-id');
        if (!confirm('Collect payment for this transaction?')) return;

        $.ajax({
            url: '/api/pharmacy-billing/collect-payment',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ transactionId: txnId, paymentMode: 'Cash' }),
            success: function() {
                HMS.toast('Payment collected successfully', 'success');
                loadDashboard();
                loadTransactions();
                loadPendingOPD();
            },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed'); }
        });
    });

    $(document).on('click', '.btn-view-txn', function() {
        var id = $(this).data('txn-id');
        var source = $(this).data('source') || 'transaction';
        if (source === 'dispensing') {
            openIpdOrderDetail(id);
        } else {
            openTxnDetail(id);
        }
    });

    $('#btnCashRecon').on('click', function() {
        openCashRecon();
    });

    function openCashRecon() {
        var today = new Date().toISOString().split('T')[0];
        $('#reconDate').val(today);

        $.get('/api/pharmacy-billing/cash-reconciliation', { date: today }, function(d) {
            $('#reconDateLabel').text('Date: ' + today);
            $('#reconShift').val(d.shift);
            $('#reconPharmacist').val(d.pharmacist);
            $('#reconOpening').val(d.openingBalance);
            $('#reconCashSales').val(d.cashSales);
            $('#reconPayments').val(d.paymentsReceived);
            $('#reconReturns').val(d.returnsRefunds);

            if (d.denominations) {
                Object.keys(d.denominations).forEach(function(k) {
                    $('.denom-input[data-denom="' + k + '"]').val(d.denominations[k]);
                });
            }

            $('#reconVarReason').val(d.varianceReason || '');
            $('#reconAuthorized').val(d.authorizedBy || '');
            $('#reconDeposit').val(d.bankDepositAmount || 0);
            $('#reconFloat').val(d.remainingFloat || 0);
            $('#reconDepositedBy').val(d.depositedBy || '');
            $('#reconSlipNo').val(d.depositSlipNo || '');

            updateReconCalc();
        });

        var offcanvas = new bootstrap.Offcanvas(document.getElementById('cashReconSheet'));
        offcanvas.show();
        lucide.createIcons();
    }

    $('#reconDate').on('change', function() {
        $.get('/api/pharmacy-billing/cash-reconciliation', { date: $(this).val() }, function(d) {
            $('#reconCashSales').val(d.cashSales);
            $('#reconPayments').val(d.paymentsReceived);
            if (d.exists) {
                $('#reconOpening').val(d.openingBalance);
                $('#reconReturns').val(d.returnsRefunds);
                if (d.denominations) {
                    Object.keys(d.denominations).forEach(function(k) {
                        $('.denom-input[data-denom="' + k + '"]').val(d.denominations[k]);
                    });
                }
            }
            updateReconCalc();
        });
    });

    $(document).on('input', '#reconOpening, #reconReturns, .denom-input', function() {
        updateReconCalc();
    });

    function updateReconCalc() {
        var opening = parseFloat($('#reconOpening').val()) || 0;
        var cashSales = parseFloat($('#reconCashSales').val()) || 0;
        var payments = parseFloat($('#reconPayments').val()) || 0;
        var returns = parseFloat($('#reconReturns').val()) || 0;
        var expected = opening + cashSales + payments - returns;
        $('#reconExpected').text(fmt(expected));

        var actualCash = 0;
        $('.denom-input').each(function() {
            var denom = $(this).data('denom');
            var count = parseInt($(this).val()) || 0;
            if (denom === 'coins') {
                actualCash += count;
            } else {
                actualCash += parseInt(denom) * count;
            }
        });
        $('#reconActualCash').text(fmt(actualCash));

        var variance = actualCash - expected;
        $('#reconVarExpected').text(fmt(expected));
        $('#reconVarActual').text(fmt(actualCash));

        var varText = fmt(Math.abs(variance));
        if (variance > 0) varText = varText + ' (Over)';
        else if (variance < 0) varText = varText + ' (Short)';
        $('#reconVarDiff').text(varText).css('color', variance === 0 ? '#22c55e' : (variance < 0 ? '#ef4444' : '#f97316'));

        var varBg = variance === 0 ? '#f0fdf4' : (variance < 0 ? '#fef2f2' : '#fff7ed');
        $('#reconVarianceBox').css('background', varBg);
    }

    function submitRecon(status) {
        var denominations = {};
        $('.denom-input').each(function() {
            denominations[$(this).data('denom')] = parseInt($(this).val()) || 0;
        });

        var actualCash = 0;
        Object.keys(denominations).forEach(function(k) {
            if (k === 'coins') actualCash += denominations[k];
            else actualCash += parseInt(k) * denominations[k];
        });

        var payload = {
            date: $('#reconDate').val(),
            shift: $('#reconShift').val(),
            pharmacist: $('#reconPharmacist').val(),
            openingBalance: parseFloat($('#reconOpening').val()) || 0,
            cashSales: parseFloat($('#reconCashSales').val()) || 0,
            paymentsReceived: parseFloat($('#reconPayments').val()) || 0,
            returnsRefunds: parseFloat($('#reconReturns').val()) || 0,
            denominations: denominations,
            actualCash: actualCash,
            varianceReason: $('#reconVarReason').val(),
            authorizedBy: $('#reconAuthorized').val(),
            bankDepositAmount: parseFloat($('#reconDeposit').val()) || 0,
            remainingFloat: parseFloat($('#reconFloat').val()) || 0,
            depositedBy: $('#reconDepositedBy').val(),
            depositSlipNo: $('#reconSlipNo').val(),
            status: status,
        };

        $.ajax({
            url: '/api/pharmacy-billing/cash-reconciliation',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(resp) {
                HMS.toast('Reconciliation ' + (status === 'Draft' ? 'saved' : 'submitted') + ' successfully! ID: ' + resp.reconciliationId, 'success');
                if (status === 'Submitted') {
                    bootstrap.Offcanvas.getInstance(document.getElementById('cashReconSheet')).hide();
                }
            },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed'); }
        });
    }

    $('#btnSaveRecon').on('click', function() { submitRecon('Draft'); });
    $('#btnSubmitRecon').on('click', function() { submitRecon('Submitted'); });
});
