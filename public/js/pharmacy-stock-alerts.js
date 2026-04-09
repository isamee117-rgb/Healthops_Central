$(document).ready(function() {
    var hospitalInfo = { currency: 'PKR' };
    var allSuppliers = [];
    var allMedicines = [];
    var poItems = [];
    var currentGrnPo = null;

    function esc(s) { return $('<span>').text(s || '').html(); }
    function fmt(n) { return hospitalInfo.currency + ' ' + Number(n || 0).toLocaleString(); }

    $.get('/api/config/hospital-info', function(d) { if (d && d.currency) hospitalInfo.currency = d.currency; });

    loadMainPOTable('');

    function loadMainPOTable(statusFilter) {
        var params = {};
        if (statusFilter) params.status = statusFilter;
        $('#poMainLoading').show();
        $('#poMainEmpty').hide();
        $('#tbodyMainPO').empty();

        $.get('/api/stock-alerts/purchase-orders', params, function(data) {
            $('#poMainLoading').hide();
            var $tb = $('#tbodyMainPO').empty();

            var totalCount = data.length;
            var draftCount = 0, sentCount = 0, partialCount = 0, completedCount = 0;
            data.forEach(function(po) {
                if (po.status === 'Draft') draftCount++;
                else if (po.status === 'Sent') sentCount++;
                else if (po.status === 'Partial') partialCount++;
                else if (po.status === 'Completed') completedCount++;
            });

            if (!statusFilter) {
                $('#dashTotalPOs').text(totalCount);
                $('#dashDraftPOs').text(draftCount);
                $('#dashSentPOs').text(sentCount);
                $('#dashPartialPOs').text(partialCount);
                $('#dashCompletedPOs').text(completedCount);
            }

            if (data.length === 0) {
                $('#poMainEmpty').show();
                $('#tblMainPO').hide();
                lucide.createIcons();
                return;
            }

            $('#tblMainPO').show();
            $('#poMainEmpty').hide();

            data.forEach(function(po) {
                var stBg = '#E0E7FF', stColor = '#3730a3';
                if (po.status === 'Draft') { stBg = '#F1F5F9'; stColor = '#475569'; }
                else if (po.status === 'Sent') { stBg = '#DBEAFE'; stColor = '#1e40af'; }
                else if (po.status === 'Partial') { stBg = '#FFF7ED'; stColor = '#9a3412'; }
                else if (po.status === 'Completed') { stBg = '#DCFCE7'; stColor = '#166534'; }

                var canReceive = (po.status === 'Sent' || po.status === 'Partial');

                var actionHtml = '';
                if (canReceive) {
                    actionHtml = '<button class="btn-receive-po" data-po-id="' + esc(po.poId) + '" style="padding:4px 12px;background:var(--aquamint);border:none;border-radius:6px;font-size:11px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Receive</button>';
                } else if (po.status === 'Completed') {
                    actionHtml = '<span style="font-size:11px;color:#166534;font-weight:500">Done</span>';
                } else {
                    actionHtml = '<span style="font-size:11px;color:var(--color-muted-foreground)">-</span>';
                }

                $tb.append(
                    '<tr class="po-row" data-po-id="' + esc(po.poId) + '" style="border-bottom:1px solid var(--color-border);cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'var(--color-background)\'" onmouseout="this.style.background=\'#fff\'">' +
                        '<td style="padding:10px 16px;font-size:13px;font-weight:700;font-family:monospace">' + esc(po.poId) + '</td>' +
                        '<td style="padding:10px 16px;font-size:13px;font-weight:500">' + esc(po.supplierName) + '</td>' +
                        '<td style="padding:10px 16px;font-size:13px;color:var(--color-muted-foreground)">' + esc(po.poDate) + '</td>' +
                        '<td style="padding:10px 16px;font-size:13px;color:var(--color-muted-foreground)">' + esc(po.expectedDelivery || '-') + '</td>' +
                        '<td style="padding:10px 16px;text-align:center;font-size:13px">' + po.totalItems + ' <span style="font-size:11px;color:var(--color-muted-foreground)">(' + po.totalQty + ' units)</span></td>' +
                        '<td style="padding:10px 16px;text-align:right;font-size:13px;font-weight:600;font-family:monospace">' + fmt(po.total) + '</td>' +
                        '<td style="padding:10px 16px;text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;background:' + stBg + ';color:' + stColor + '">' + esc(po.status) + '</span></td>' +
                        '<td style="padding:10px 16px;text-align:center">' + actionHtml + '</td>' +
                    '</tr>'
                );
            });
            lucide.createIcons();
        }).fail(function() {
            $('#poMainLoading').hide();
            $('#poMainEmpty').show().html('<div style="padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:14px">Failed to load purchase orders</div>');
        });
    }

    $(document).on('click', '.po-main-filter-btn', function() {
        $('.po-main-filter-btn').removeClass('active').css({ background: '#fff', color: 'var(--color-foreground)' });
        $(this).addClass('active').css({ background: 'var(--aquamint)', color: 'var(--midnight-blue)' });
        loadMainPOTable($(this).data('status'));
    });

    $(document).on('click', '.po-row', function(e) {
        if ($(e.target).closest('button').length) return;
        var poId = $(this).data('po-id');
        openPOView(poId);
    });

    function openPOView(poId) {
        $('#poViewLoading').show();
        $('#poViewContent').hide();
        var offcanvas = new bootstrap.Offcanvas(document.getElementById('poViewSheet'));
        offcanvas.show();

        $.get('/api/stock-alerts/purchase-orders/' + poId, function(po) {
            $('#poViewLoading').hide();
            $('#poViewContent').show();

            $('#poViewSub').text(po.poId + ' | ' + po.supplierName);
            $('#poViewId').text(po.poId);

            var stBg = '#E0E7FF', stColor = '#3730a3';
            if (po.status === 'Draft') { stBg = '#F1F5F9'; stColor = '#475569'; }
            else if (po.status === 'Sent') { stBg = '#DBEAFE'; stColor = '#1e40af'; }
            else if (po.status === 'Partial') { stBg = '#FFF7ED'; stColor = '#9a3412'; }
            else if (po.status === 'Completed') { stBg = '#DCFCE7'; stColor = '#166534'; }
            $('#poViewStatus').text(po.status).css({ background: stBg, color: stColor });
            $('#poViewOrderType').text(po.orderType);

            $('#poViewSupplierName').text(po.supplierName);
            $('#poViewSupplierPhone').text(po.supplierPhone ? 'Phone: ' + po.supplierPhone : '');
            $('#poViewSupplierEmail').text(po.supplierEmail ? 'Email: ' + po.supplierEmail : '');

            var poDate = po.poDate ? new Date(po.poDate) : null;
            var delDate = po.expectedDelivery ? new Date(po.expectedDelivery) : null;
            $('#poViewDate').text(poDate ? poDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
            $('#poViewDelivery').text(delDate ? delDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
            $('#poViewPayment').text(po.paymentMethod + (po.creditDays ? ' (' + po.creditDays + ' days)' : ''));

            var $tb = $('#tbodyPoView').empty();
            po.items.forEach(function(item) {
                var receivedPct = item.quantity > 0 ? Math.round((item.receivedQty / item.quantity) * 100) : 0;
                var rcvColor = receivedPct >= 100 ? '#22c55e' : (receivedPct > 0 ? '#f97316' : 'var(--color-muted-foreground)');
                $tb.append(
                    '<tr style="border-bottom:1px solid var(--color-border)">' +
                        '<td style="padding:8px 12px"><div style="font-size:13px;font-weight:600">' + esc(item.medicineName) + '</div></td>' +
                        '<td style="padding:8px 12px;text-align:right;font-size:13px;font-family:monospace">' + item.currentStock + ' <span style="font-size:11px;color:var(--color-muted-foreground)">' + esc(item.stockUnit) + '</span></td>' +
                        '<td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600">' + item.quantity + '</td>' +
                        '<td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;color:' + rcvColor + '">' + item.receivedQty + ' <span style="font-size:10px">(' + receivedPct + '%)</span></td>' +
                        '<td style="padding:8px 12px;text-align:right;font-size:13px;font-family:monospace">' + fmt(item.unitPrice) + '</td>' +
                        '<td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;font-family:monospace">' + fmt(item.total) + '</td>' +
                    '</tr>'
                );
            });

            $('#poViewSubtotal').text(fmt(po.subtotal));
            $('#poViewTax').text(fmt(po.tax));
            $('#poViewDiscount').text(fmt(po.discount));
            $('#poViewTotal').text(fmt(po.total));
            $('#poViewAdvance').text(fmt(po.advancePayment));
            $('#poViewCreditDays').text(po.creditDays || '-');

            var showNotes = false;
            if (po.deliveryInstructions) {
                $('#poViewDeliveryInstrWrap').show();
                $('#poViewDeliveryInstr').text(po.deliveryInstructions);
                showNotes = true;
            } else {
                $('#poViewDeliveryInstrWrap').hide();
            }
            if (po.notes) {
                $('#poViewNotesWrap').show();
                $('#poViewNotes').text(po.notes);
                showNotes = true;
            } else {
                $('#poViewNotesWrap').hide();
            }
            $('#poViewNotesSection').toggle(showNotes);

            var $actions = $('#poViewActions').empty();
            var canReceive = (po.status === 'Sent' || po.status === 'Partial');
            if (canReceive) {
                $actions.append(
                    '<button class="btn-view-receive-po" data-po-id="' + esc(po.poId) + '" style="padding:8px 20px;background:var(--aquamint);border:none;border-radius:8px;font-size:13px;font-weight:600;color:var(--midnight-blue);cursor:pointer;display:flex;align-items:center;gap:6px"><i data-lucide="package-check" style="width:15px;height:15px"></i> Receive Stock (GRN)</button>'
                );
            }
            if (po.status === 'Completed') {
                $actions.append('<span style="padding:8px 20px;font-size:13px;font-weight:600;color:#166534;display:flex;align-items:center;gap:6px"><i data-lucide="check-circle" style="width:15px;height:15px"></i> Order Completed</span>');
            }

            lucide.createIcons();
        }).fail(function() {
            $('#poViewLoading').html('<div style="color:#ef4444">Failed to load purchase order details</div>');
        });
    }

    $(document).on('click', '.btn-view-receive-po', function() {
        var poId = $(this).data('po-id');
        bootstrap.Offcanvas.getInstance(document.getElementById('poViewSheet'))?.hide();
        setTimeout(function() { openGRN(poId); }, 300);
    });

    $('#btnViewAlerts').on('click', function() {
        loadDashboard();
        loadAllSections();
        var offcanvas = new bootstrap.Offcanvas(document.getElementById('alertsSheet'));
        offcanvas.show();
        lucide.createIcons();
    });

    function loadDashboard() {
        $.get('/api/stock-alerts/dashboard', function(d) {
            $('#dashOutOfStock').text(d.outOfStockCount);
            $('#dashLowStock').text(d.lowStockCount);
            $('#dashExpiring').text(d.expiringSoonCount);
            $('#dashExpired').text(d.expiredCount);
            $('#dashReorder').text(d.reorderCount);
            lucide.createIcons();
        });
    }

    function loadAllSections() {
        loadOutOfStock();
        loadLowStock();
        loadExpiring();
        loadExpired();
        loadReorder();
    }

    function loadOutOfStock() {
        $.get('/api/stock-alerts/out-of-stock', function(d) {
            $('#badgeOutOfStock').text(d.totalCount);
            $('#lostRevenue').text('Est. Lost Revenue: ' + fmt(d.estimatedLostRevenue));
            var $tb = $('#tbodyOutOfStock').empty();
            if (d.items.length === 0) {
                $tb.append('<tr><td colspan="6" style="padding:20px;text-align:center;color:var(--color-muted-foreground)">No out-of-stock items</td></tr>');
            } else {
                d.items.forEach(function(item) {
                    var prBg = item.priority === 'URGENT' ? '#ef4444' : (item.priority === 'HIGH' ? '#f97316' : '#eab308');
                    $tb.append(
                        '<tr style="border-bottom:1px solid var(--color-border)">' +
                            '<td style="padding:10px 16px"><div style="font-size:13px;font-weight:600">' + esc(item.medicineName) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(item.genericName) + '</div></td>' +
                            '<td style="padding:10px 16px;font-size:13px;color:var(--color-muted-foreground)">' + esc(item.lastStockout) + '</td>' +
                            '<td style="padding:10px 16px;text-align:center;font-size:13px">' + item.pendingOrders + '</td>' +
                            '<td style="padding:10px 16px;font-size:13px">' + esc(item.avgDailyUsage) + '</td>' +
                            '<td style="padding:10px 16px;text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700;background:' + prBg + ';color:#fff">' + esc(item.priority) + '</span></td>' +
                            '<td style="padding:10px 16px;text-align:center"><button class="btn-create-po-for" data-id="' + esc(item.medicineId) + '" data-name="' + esc(item.medicineName) + '" data-price="' + item.purchasePrice + '" data-qty="' + item.reorderQty + '" style="padding:4px 12px;background:var(--aquamint);border:none;border-radius:6px;font-size:11px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Create PO</button></td>' +
                        '</tr>'
                    );
                });
            }
            $('#footerOutOfStock').html('Total: <strong>' + d.totalCount + '</strong> medicines out of stock &nbsp;|&nbsp; Estimated Lost Revenue: <strong>' + fmt(d.estimatedLostRevenue) + '</strong>');
        });
    }

    function loadLowStock() {
        $.get('/api/stock-alerts/low-stock', function(d) {
            $('#badgeLowStock').text(d.totalCount);
            var $tb = $('#tbodyLowStock').empty();
            if (d.items.length === 0) {
                $tb.append('<tr><td colspan="6" style="padding:20px;text-align:center;color:var(--color-muted-foreground)">No low-stock items</td></tr>');
            } else {
                d.items.forEach(function(item) {
                    var daysColor = parseInt(item.daysUntilOut) <= 3 ? '#ef4444' : (parseInt(item.daysUntilOut) <= 7 ? '#f97316' : '#eab308');
                    $tb.append(
                        '<tr style="border-bottom:1px solid var(--color-border)">' +
                            '<td style="padding:10px 16px"><div style="font-size:13px;font-weight:600">' + esc(item.medicineName) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(item.genericName) + '</div></td>' +
                            '<td style="padding:10px 16px;text-align:right;font-size:13px;font-weight:600;font-family:monospace">' + item.currentStock + '</td>' +
                            '<td style="padding:10px 16px;text-align:right;font-size:13px;font-family:monospace">' + item.minLevel + '</td>' +
                            '<td style="padding:10px 16px;text-align:center;font-size:13px;font-weight:600;color:' + daysColor + '">' + esc(item.daysUntilOut) + '</td>' +
                            '<td style="padding:10px 16px;font-size:13px">' + esc(item.reorderQty) + '</td>' +
                            '<td style="padding:10px 16px;text-align:center"><button class="btn-create-po-for" data-id="' + esc(item.medicineId) + '" data-name="' + esc(item.medicineName) + '" data-price="' + item.purchasePrice + '" style="padding:4px 12px;background:var(--aquamint);border:none;border-radius:6px;font-size:11px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Create PO</button></td>' +
                        '</tr>'
                    );
                });
            }
            $('#footerLowStock').html('Total: <strong>' + d.totalCount + '</strong> medicines below minimum');
        });
    }

    function loadExpiring() {
        $.get('/api/stock-alerts/expiring-soon', function(d) {
            $('#badgeExpiring').text(d.totalCount);
            $('#expiringLoss').text('Potential Loss: ' + fmt(d.potentialLoss));
            var $tb = $('#tbodyExpiring').empty();
            if (d.items.length === 0) {
                $tb.append('<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--color-muted-foreground)">No items expiring soon</td></tr>');
            } else {
                d.items.forEach(function(item) {
                    var dColor = item.daysRemaining <= 30 ? '#ef4444' : (item.daysRemaining <= 60 ? '#f97316' : '#eab308');
                    $tb.append(
                        '<tr style="border-bottom:1px solid var(--color-border)">' +
                            '<td style="padding:10px 16px"><div style="font-size:13px;font-weight:600">' + esc(item.medicineName) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(item.genericName) + '</div></td>' +
                            '<td style="padding:10px 16px;font-size:13px;font-family:monospace">' + esc(item.batchNumber) + '</td>' +
                            '<td style="padding:10px 16px;font-size:13px">' + esc(item.expiryDate) + '</td>' +
                            '<td style="padding:10px 16px;text-align:center;font-size:13px;font-weight:700;color:' + dColor + '">' + item.daysRemaining + ' days</td>' +
                            '<td style="padding:10px 16px;text-align:right;font-size:13px">' + item.qty + ' ' + esc(item.stockUnit) + '</td>' +
                            '<td style="padding:10px 16px;text-align:right;font-size:13px;font-family:monospace;color:#991B1B">' + fmt(item.estimatedLoss) + '</td>' +
                            '<td style="padding:10px 16px;text-align:center"><span style="padding:3px 10px;border-radius:4px;font-size:11px;font-weight:500;background:#FEF9C3;color:#854d0e;cursor:default">Use First</span></td>' +
                        '</tr>'
                    );
                });
            }
            $('#footerExpiring').html('Total: <strong>' + d.totalCount + '</strong> medicines expiring within 3 months &nbsp;|&nbsp; Potential Loss: <strong>' + fmt(d.potentialLoss) + '</strong>');
        });
    }

    function loadExpired() {
        $.get('/api/stock-alerts/expired', function(d) {
            $('#badgeExpired').text(d.totalCount);
            $('#expiredLoss').text('Total Loss: ' + fmt(d.totalLoss));
            var $tb = $('#tbodyExpired').empty();
            if (d.items.length === 0) {
                $tb.append('<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--color-muted-foreground)">No expired stock</td></tr>');
            } else {
                d.items.forEach(function(item) {
                    $tb.append(
                        '<tr style="border-bottom:1px solid var(--color-border)">' +
                            '<td style="padding:10px 16px;font-size:13px;font-weight:600">' + esc(item.medicineName) + '</td>' +
                            '<td style="padding:10px 16px;font-size:13px;font-family:monospace">' + esc(item.batchNumber) + '</td>' +
                            '<td style="padding:10px 16px;font-size:13px">' + esc(item.expiredDate) + '</td>' +
                            '<td style="padding:10px 16px;text-align:center;font-size:13px;font-weight:600;color:#ef4444">' + item.daysExpired + ' days</td>' +
                            '<td style="padding:10px 16px;text-align:right;font-size:13px">' + item.qty + ' ' + esc(item.stockUnit) + '</td>' +
                            '<td style="padding:10px 16px;text-align:right;font-size:13px;font-family:monospace;color:#991B1B">' + fmt(item.lossValue) + '</td>' +
                            '<td style="padding:10px 16px;text-align:center"><button class="btn-dispose" data-batch-id="' + esc(item.batchId) + '" data-name="' + esc(item.medicineName) + '" data-qty="' + item.qty + '" style="padding:4px 12px;background:#ef4444;border:none;border-radius:6px;font-size:11px;font-weight:600;color:#fff;cursor:pointer">Dispose</button></td>' +
                        '</tr>'
                    );
                });
            }
            $('#footerExpired').html('Total: <strong>' + d.totalCount + '</strong> medicines expired &nbsp;|&nbsp; Total Loss: <strong>' + fmt(d.totalLoss) + '</strong>');
        });
    }

    function loadReorder() {
        $.get('/api/stock-alerts/reorder-suggestions', function(d) {
            $('#badgeReorder').text(d.totalCount);
            $('#reorderValue').text('Est. Order Value: ' + fmt(d.estimatedOrderValue));
            var $tb = $('#tbodyReorder').empty();
            if (d.items.length === 0) {
                $tb.append('<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--color-muted-foreground)">No reorder suggestions</td></tr>');
            } else {
                d.items.forEach(function(item) {
                    $tb.append(
                        '<tr style="border-bottom:1px solid var(--color-border)">' +
                            '<td style="padding:10px 16px"><div style="font-size:13px;font-weight:600">' + esc(item.medicineName) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(item.genericName) + '</div></td>' +
                            '<td style="padding:10px 16px;text-align:right;font-size:13px;font-weight:600;font-family:monospace">' + item.currentStock + '</td>' +
                            '<td style="padding:10px 16px;font-size:13px"><span style="color:#3b82f6;font-weight:600">' + item.reorderPoint + '</span> <span style="font-size:11px;color:var(--color-muted-foreground)">(Triggered)</span></td>' +
                            '<td style="padding:10px 16px;font-size:13px">' + esc(item.suggestedQty) + '</td>' +
                            '<td style="padding:10px 16px;font-size:13px">' + esc(item.preferredSupplier) + '</td>' +
                            '<td style="padding:10px 16px;text-align:center;font-size:13px">' + esc(item.leadTime) + '</td>' +
                            '<td style="padding:10px 16px;text-align:center"><button class="btn-create-po-for" data-id="' + esc(item.medicineId) + '" data-name="' + esc(item.medicineName) + '" data-price="' + item.purchasePrice + '" data-qty="' + item.suggestedQtyNum + '" style="padding:4px 12px;background:var(--aquamint);border:none;border-radius:6px;font-size:11px;font-weight:600;color:var(--midnight-blue);cursor:pointer">Create PO</button></td>' +
                        '</tr>'
                    );
                });
            }
            $('#footerReorder').html('Total: <strong>' + d.totalCount + '</strong> reorder suggestions &nbsp;|&nbsp; Estimated Order Value: <strong>' + fmt(d.estimatedOrderValue) + '</strong>');
        });
    }

    $(document).on('click', '.alert-section-header', function() {
        var $body = $(this).closest('.alert-section').find('.alert-section-body');
        var $chev = $(this).find('.section-chevron');
        if ($body.is(':visible')) {
            $body.slideUp(200);
            $chev.css('transform', 'rotate(0deg)');
        } else {
            $body.slideDown(200);
            $chev.css('transform', 'rotate(180deg)');
        }
    });

    $('#btnCreatePO').on('click', function() { openPOForm(); });

    $(document).on('click', '.btn-create-po-for', function() {
        var medId = $(this).data('id');
        var medName = $(this).data('name');
        var price = parseFloat($(this).data('price')) || 0;
        var qty = parseInt($(this).data('qty')) || 100;
        bootstrap.Offcanvas.getInstance(document.getElementById('alertsSheet'))?.hide();
        openPOForm([{ medicineId: medId, name: medName, price: price, qty: qty }]);
    });

    function openPOForm(preItems) {
        poItems = [];
        $('#poNumber').val('Auto-generated');
        $('#poSupplier').val('');
        $('#supplierInfo').hide();
        var today = new Date().toISOString().split('T')[0];
        $('#poDate').val(today);
        var delivery = new Date();
        delivery.setDate(delivery.getDate() + 5);
        $('#poExpectedDelivery').val(delivery.toISOString().split('T')[0]);
        $('input[name="poOrderType"][value="Regular Stock Replenishment"]').prop('checked', true);
        $('#poPaymentMethod').val('Credit');
        $('#poCreditDays').val(30);
        $('#poAdvance').val(0);
        $('#poDeliveryInstructions').val('');
        $('#poNotes').val('');
        $('#tbodyPoItems').empty();
        updatePOSummary();

        loadSuppliers(function() {
            if (preItems && preItems.length > 0) {
                preItems.forEach(function(pi) {
                    addPOItem(pi.medicineId, pi.name, pi.price, pi.qty);
                });
            }
        });

        var offcanvas = new bootstrap.Offcanvas(document.getElementById('poFormSheet'));
        offcanvas.show();
        lucide.createIcons();
    }

    function loadSuppliers(cb) {
        $.get('/api/stock-alerts/suppliers', function(data) {
            allSuppliers = data;
            var $sel = $('#poSupplier').empty().append('<option value="">Select Supplier...</option>');
            data.forEach(function(s) {
                $sel.append('<option value="' + esc(s.supplierId) + '">' + esc(s.name) + '</option>');
            });
            if (cb) cb();
        });
    }

    $('#poSupplier').on('change', function() {
        var sid = $(this).val();
        var sup = allSuppliers.find(function(s) { return s.supplierId === sid; });
        if (sup) {
            $('#supContact').text(sup.contactPerson || '-');
            $('#supPhone').text(sup.phone || '-');
            $('#supEmail').text(sup.email || '-');
            $('#supLeadTime').text(sup.leadTimeDays + ' days');
            $('#supplierInfo').show();

            var delivery = new Date();
            delivery.setDate(delivery.getDate() + sup.leadTimeDays);
            $('#poExpectedDelivery').val(delivery.toISOString().split('T')[0]);
        } else {
            $('#supplierInfo').hide();
        }
    });

    $('#btnAddMedicine').on('click', function() {
        loadMedicinesFromInventory();
        var modal = new bootstrap.Modal(document.getElementById('addMedicineModal'));
        modal.show();
    });

    function loadMedicinesFromInventory() {
        $.get('/api/inventory/medicines', function(resp) {
            var medicines = Array.isArray(resp) ? resp : (resp.medicines || []);
            allMedicines = medicines.map(function(m) {
                return {
                    medicineId: m.medicineId,
                    name: m.name || (m.brandName + ' ' + (m.strength || '')).trim(),
                    genericName: m.genericName || '',
                    purchasePrice: parseFloat(m.purchasePrice || 0),
                    currentStock: parseInt(m.currentStock || 0),
                    stockUnit: m.stockUnit || 'units'
                };
            });
            renderMedicineSearch('');
        }).fail(function() {
            $.get('/api/stock-alerts/medicines-list', function(data) {
                allMedicines = data;
                renderMedicineSearch('');
            });
        });
    }

    $('#medSearchInput').on('input', function() {
        renderMedicineSearch($(this).val());
    });

    function renderMedicineSearch(search) {
        var $results = $('#medSearchResults').empty();
        var filtered = allMedicines;
        if (search) {
            var s = search.toLowerCase();
            filtered = allMedicines.filter(function(m) {
                return (m.name || '').toLowerCase().indexOf(s) > -1 || (m.genericName || '').toLowerCase().indexOf(s) > -1;
            });
        }

        if (filtered.length === 0) {
            $results.html('<div style="padding:20px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No medicines found</div>');
            return;
        }

        filtered.forEach(function(m) {
            var alreadyAdded = poItems.some(function(p) { return p.medicineId === m.medicineId; });
            $results.append(
                '<div class="med-search-item" data-id="' + esc(m.medicineId) + '" data-name="' + esc(m.name) + '" data-price="' + m.purchasePrice + '" data-stock="' + m.currentStock + '" data-unit="' + esc(m.stockUnit) + '" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--color-border);cursor:pointer;' + (alreadyAdded ? 'opacity:0.4;pointer-events:none' : '') + '">' +
                    '<div><div style="font-size:13px;font-weight:600">' + esc(m.name) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(m.genericName) + ' | Stock: ' + m.currentStock + ' ' + esc(m.stockUnit) + '</div></div>' +
                    '<div style="font-size:12px;font-family:monospace;color:var(--color-muted-foreground)">' + fmt(m.purchasePrice) + '</div>' +
                '</div>'
            );
        });
    }

    $(document).on('click', '.med-search-item', function() {
        var id = $(this).data('id');
        var name = $(this).data('name');
        var price = parseFloat($(this).data('price'));
        addPOItem(id, name, price, 100);
        bootstrap.Modal.getInstance(document.getElementById('addMedicineModal')).hide();
    });

    function addPOItem(medicineId, name, unitPrice, qty) {
        var existing = poItems.find(function(p) { return p.medicineId === medicineId; });
        if (existing) return;

        var med = allMedicines.find(function(m) { return m.medicineId === medicineId; });
        var currentStock = med ? med.currentStock : 0;
        var stockUnit = med ? med.stockUnit : '';

        poItems.push({ medicineId: medicineId, name: name, unitPrice: unitPrice, qty: qty, currentStock: currentStock, stockUnit: stockUnit });
        renderPOItems();
    }

    function renderPOItems() {
        var $tb = $('#tbodyPoItems').empty();
        if (poItems.length === 0) {
            $('#poItemEmpty').show();
            $('#tblPoItems').parent().hide();
        } else {
            $('#poItemEmpty').hide();
            $('#tblPoItems').parent().show();
            poItems.forEach(function(item, idx) {
                $tb.append(
                    '<tr style="border-bottom:1px solid var(--color-border)">' +
                        '<td style="padding:8px 12px;font-size:13px;font-weight:600">' + esc(item.name) + '</td>' +
                        '<td style="padding:8px 12px;text-align:right;font-size:13px;font-family:monospace">' + item.currentStock + '</td>' +
                        '<td style="padding:8px 12px;text-align:right"><input type="number" class="po-item-qty" data-idx="' + idx + '" value="' + item.qty + '" min="1" style="width:70px;padding:4px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:right"></td>' +
                        '<td style="padding:8px 12px;text-align:right"><input type="number" class="po-item-price" data-idx="' + idx + '" value="' + item.unitPrice + '" min="0" step="0.01" style="width:90px;padding:4px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;text-align:right"></td>' +
                        '<td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;font-family:monospace">' + fmt(item.qty * item.unitPrice) + '</td>' +
                        '<td style="padding:8px 12px;text-align:center"><button class="btn-remove-po-item" data-idx="' + idx + '" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;font-weight:700">&times;</button></td>' +
                    '</tr>'
                );
            });
        }
        updatePOSummary();
    }

    $(document).on('input', '.po-item-qty', function() {
        var idx = $(this).data('idx');
        poItems[idx].qty = parseInt($(this).val()) || 0;
        renderPOItems();
    });

    $(document).on('input', '.po-item-price', function() {
        var idx = $(this).data('idx');
        poItems[idx].unitPrice = parseFloat($(this).val()) || 0;
        renderPOItems();
    });

    $(document).on('click', '.btn-remove-po-item', function() {
        var idx = $(this).data('idx');
        poItems.splice(idx, 1);
        renderPOItems();
    });

    function updatePOSummary() {
        var totalItems = poItems.length;
        var totalQty = 0, subtotal = 0;
        poItems.forEach(function(item) {
            totalQty += item.qty;
            subtotal += item.qty * item.unitPrice;
        });
        $('#poTotalItems').text(totalItems);
        $('#poTotalQty').text(totalQty.toLocaleString() + ' items');
        $('#poSubtotal').text(fmt(subtotal));
        $('#poTotal').text(fmt(subtotal));
    }

    function submitPO(status) {
        if (!$('#poSupplier').val()) { HMS.toast('Please select a supplier', 'warning'); return; }
        if (poItems.length === 0) { HMS.toast('Please add at least one medicine', 'warning'); return; }

        var payload = {
            supplierId: $('#poSupplier').val(),
            expectedDelivery: $('#poExpectedDelivery').val(),
            orderType: $('input[name="poOrderType"]:checked').val(),
            items: poItems.map(function(i) { return { medicineId: i.medicineId, quantity: i.qty, unitPrice: i.unitPrice }; }),
            paymentMethod: $('#poPaymentMethod').val(),
            creditDays: parseInt($('#poCreditDays').val()) || 30,
            advancePayment: parseFloat($('#poAdvance').val()) || 0,
            deliveryInstructions: $('#poDeliveryInstructions').val(),
            notes: $('#poNotes').val(),
            status: status,
        };

        var $btns = $('#btnSaveDraft, #btnSendPO');
        $btns.prop('disabled', true);

        $.ajax({
            url: '/api/stock-alerts/purchase-orders',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(resp) {
                bootstrap.Offcanvas.getInstance(document.getElementById('poFormSheet')).hide();
                HMS.toast('Purchase Order ' + resp.poId + ' created successfully!', 'success');
                loadMainPOTable('');
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed');
            },
            complete: function() { $btns.prop('disabled', false); }
        });
    }

    $('#btnSaveDraft').on('click', function() { submitPO('Draft'); });
    $('#btnSendPO').on('click', function() { submitPO('Sent'); });

    $(document).on('click', '.btn-receive-po', function() {
        var poId = $(this).data('po-id');
        openGRN(poId);
    });

    function openGRN(poId) {
        $.get('/api/stock-alerts/purchase-orders/' + poId, function(po) {
            currentGrnPo = po;
            $('#grnPoRef').text('PO Number: ' + po.poId + ' | Supplier: ' + po.supplierName);

            var $container = $('#grnItemsContainer').empty();
            po.items.forEach(function(item, idx) {
                var remaining = item.quantity - item.receivedQty;
                if (remaining <= 0) return;

                $container.append(
                    '<div class="grn-item-block" data-idx="' + idx + '" style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:16px">' +
                        '<div style="font-size:14px;font-weight:700;color:var(--color-foreground);margin-bottom:12px">' + esc(item.medicineName) + '</div>' +
                        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
                            '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Expected Qty</label><div style="font-size:14px;font-weight:600">' + remaining + ' ' + esc(item.stockUnit) + '</div></div>' +
                            '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Received Qty</label><input type="number" class="grn-received-qty" data-idx="' + idx + '" value="' + remaining + '" min="0" max="' + remaining + '" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>' +
                        '</div>' +
                        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">' +
                            '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Batch Number</label><input type="text" class="grn-batch" data-idx="' + idx + '" value="B' + new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,'0') + '" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>' +
                            '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Mfg Date</label><input type="date" class="grn-mfg-date" data-idx="' + idx + '" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>' +
                            '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Expiry Date *</label><input type="date" class="grn-expiry-date" data-idx="' + idx + '" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>' +
                        '</div>' +
                        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
                            '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Unit Price</label><input type="number" class="grn-price" data-idx="' + idx + '" value="' + item.unitPrice + '" step="0.01" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>' +
                            '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);display:block;margin-bottom:2px">Remarks</label><input type="text" class="grn-remarks" data-idx="' + idx + '" value="Good condition" style="width:100%;padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px"></div>' +
                        '</div>' +
                        '<div style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:6px">Quality Check:</div>' +
                        '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
                            '<label style="display:flex;align-items:center;gap:4px;font-size:12px"><input type="checkbox" class="grn-qc" data-idx="' + idx + '" data-check="packaging" checked> Packaging intact</label>' +
                            '<label style="display:flex;align-items:center;gap:4px;font-size:12px"><input type="checkbox" class="grn-qc" data-idx="' + idx + '" data-check="correct_medicine" checked> Correct medicine</label>' +
                            '<label style="display:flex;align-items:center;gap:4px;font-size:12px"><input type="checkbox" class="grn-qc" data-idx="' + idx + '" data-check="correct_qty" checked> Correct quantity</label>' +
                            '<label style="display:flex;align-items:center;gap:4px;font-size:12px"><input type="checkbox" class="grn-qc" data-idx="' + idx + '" data-check="no_damage" checked> No visible damage</label>' +
                            '<label style="display:flex;align-items:center;gap:4px;font-size:12px"><input type="checkbox" class="grn-qc" data-idx="' + idx + '" data-check="expiry_ok" checked> Expiry acceptable</label>' +
                        '</div>' +
                    '</div>'
                );
            });

            updateGRNSummary();
            $('#grnDate').text(new Date().toLocaleString('en-PK'));

            var offcanvas = new bootstrap.Offcanvas(document.getElementById('grnSheet'));
            offcanvas.show();
            lucide.createIcons();
        });
    }

    $(document).on('input', '.grn-received-qty, .grn-price', function() { updateGRNSummary(); });

    function updateGRNSummary() {
        if (!currentGrnPo) return;
        var totalItems = 0, totalValue = 0;
        currentGrnPo.items.forEach(function(item, idx) {
            var remaining = item.quantity - item.receivedQty;
            if (remaining <= 0) return;
            var rQty = parseInt($('.grn-received-qty[data-idx="' + idx + '"]').val()) || 0;
            var price = parseFloat($('.grn-price[data-idx="' + idx + '"]').val()) || 0;
            if (rQty > 0) {
                totalItems++;
                totalValue += rQty * price;
            }
        });
        $('#grnTotalItems').text(totalItems);
        $('#grnTotalValue').text(fmt(totalValue));
    }

    $('#btnCompleteGRN').on('click', function() {
        if (!currentGrnPo) return;

        var items = [];
        var hasError = false;

        currentGrnPo.items.forEach(function(item, idx) {
            var remaining = item.quantity - item.receivedQty;
            if (remaining <= 0) return;
            var rQty = parseInt($('.grn-received-qty[data-idx="' + idx + '"]').val()) || 0;
            if (rQty <= 0) return;

            var expiry = $('.grn-expiry-date[data-idx="' + idx + '"]').val();
            var batch = $('.grn-batch[data-idx="' + idx + '"]').val();
            if (!expiry || !batch) { hasError = true; return; }

            var qcChecks = {};
            $('.grn-qc[data-idx="' + idx + '"]').each(function() {
                qcChecks[$(this).data('check')] = $(this).is(':checked');
            });

            items.push({
                medicineId: item.medicineId,
                expectedQty: remaining,
                receivedQty: rQty,
                batchNumber: batch,
                manufacturingDate: $('.grn-mfg-date[data-idx="' + idx + '"]').val() || null,
                expiryDate: expiry,
                unitPrice: parseFloat($('.grn-price[data-idx="' + idx + '"]').val()) || item.unitPrice,
                qualityChecks: qcChecks,
                remarks: $('.grn-remarks[data-idx="' + idx + '"]').val() || '',
            });
        });

        if (hasError) { HMS.toast('Please fill batch number and expiry date for all items', 'warning'); return; }
        if (items.length === 0) { HMS.toast('No items to receive', 'warning'); return; }

        var $btn = $(this);
        $btn.prop('disabled', true).text('Processing...');

        $.ajax({
            url: '/api/stock-alerts/grn',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ poId: currentGrnPo.poId, items: items }),
            success: function(resp) {
                bootstrap.Offcanvas.getInstance(document.getElementById('grnSheet')).hide();
                HMS.toast('GRN ' + resp.grnId + ' completed! Stock updated successfully.', 'success');
                loadMainPOTable('');
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed');
            },
            complete: function() { $btn.prop('disabled', false).text('Complete GRN & Update Stock'); }
        });
    });

    $(document).on('click', '.btn-dispose', function() {
        var batchId = $(this).data('batch-id');
        var name = $(this).data('name');
        var qty = $(this).data('qty');
        if (!confirm('Dispose ' + qty + ' units of ' + name + '? This will remove the stock permanently.')) return;

        var $btn = $(this);
        $btn.prop('disabled', true).text('...');

        $.ajax({
            url: '/api/stock-alerts/dispose',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ batchId: batchId }),
            success: function() {
                loadDashboard();
                loadExpired();
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed');
            },
            complete: function() { $btn.prop('disabled', false).text('Dispose'); }
        });
    });
});
