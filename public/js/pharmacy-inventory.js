$(document).ready(function() {
    var hospitalInfo = { currency: 'PKR' };
    var allMedicines = [];
    var filteredMedicines = [];
    var currentMedicineId = null;
    var currentMedicineData = null;
    var adjustMedicineId = null;
    var adjustCurrentStock = 0;

    // Pagination state
    var invPage = 1;
    var invRowsPer = 10;

    // Active filter values
    var activeFilters = { category: '', form: '', stockStatus: '', abcClass: '' };

    function esc(s) { return $('<span>').text(s || '').html(); }

    $.get('/api/config/hospital-info', function(data) {
        if (data && data.currency) hospitalInfo.currency = data.currency;
    });

    loadStats();
    loadFilters();
    loadMedicines();

    $.get('/api/pharmacy-config/medicine_category', function(cats) {
        var $sel = $('#addMedCategory');
        cats.forEach(function(c) {
            $sel.append('<option value="' + esc(c) + '">' + esc(c) + '</option>');
        });
    });

    // ── Stats ──────────────────────────────────────────────────────────────────
    function loadStats() {
        $.get('/api/inventory/stats', function(data) {
            $('#statTotalMedicines').text(data.totalMedicines.toLocaleString());
            $('#statOutOfStock').text(data.outOfStock.toLocaleString());
            $('#statLowStock').text(data.lowStock.toLocaleString());
            $('#statExpiringSoon').text(data.expiringSoon.toLocaleString());
            var val = data.stockValue;
            if (val >= 1000000) {
                $('#statStockValue').text((val / 1000000).toFixed(1) + 'M ' + hospitalInfo.currency);
            } else if (val >= 1000) {
                $('#statStockValue').text((val / 1000).toFixed(1) + 'K ' + hospitalInfo.currency);
            } else {
                $('#statStockValue').text(hospitalInfo.currency + ' ' + val.toLocaleString());
            }
            lucide.createIcons();
        });
    }

    // ── Filters dropdown population ────────────────────────────────────────────
    function loadFilters() {
        $.get('/api/inventory/filters', function(data) {
            var $cat = $('#filterCategory');
            data.categories.forEach(function(c) { $cat.append('<option value="' + esc(c) + '">' + esc(c) + '</option>'); });
            var $form = $('#filterForm');
            data.forms.forEach(function(f) { $form.append('<option value="' + esc(f) + '">' + esc(f) + '</option>'); });
        });
    }

    // ── Load medicines from API ────────────────────────────────────────────────
    function loadMedicines() {
        var params = {};
        var search = $('#invSearch').val();
        if (search) params.search = search;
        if (activeFilters.category) params.category = activeFilters.category;
        if (activeFilters.form) params.form = activeFilters.form;
        if (activeFilters.stockStatus) params.stockStatus = activeFilters.stockStatus;
        if (activeFilters.abcClass) params.abcClass = activeFilters.abcClass;

        $.get('/api/inventory/medicines', params, function(data) {
            allMedicines = data;
            filteredMedicines = data;
            invPage = 1;
            renderTable();
            renderPagination();
        });
    }

    // ── Render current page slice ──────────────────────────────────────────────
    function renderTable() {
        var $tbody = $('#invTableBody');
        $tbody.empty();

        if (!filteredMedicines || filteredMedicines.length === 0) {
            $tbody.append('<tr><td colspan="12" style="padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:14px"><i data-lucide="inbox" style="width:32px;height:32px;display:block;margin:0 auto 8px;opacity:0.4"></i>No medicines found</td></tr>');
            lucide.createIcons();
            return;
        }

        var start = (invPage - 1) * invRowsPer;
        var end = Math.min(start + invRowsPer, filteredMedicines.length);
        var pageData = filteredMedicines.slice(start, end);

        pageData.forEach(function(m) {
            var statusBg, statusColor;
            if (m.stockStatus === 'In Stock') { statusBg = '#DCFCE7'; statusColor = '#166534'; }
            else if (m.stockStatus === 'Low Stock') { statusBg = '#FFF7ED'; statusColor = '#9a3412'; }
            else { statusBg = '#FEF2F2'; statusColor = '#991B1B'; }

            var expiryBadge = '';
            if (m.expiryStatus === 'Expiring Soon') {
                expiryBadge = ' <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;background:#FEF9C3;color:#854d0e">EXPIRING</span>';
            } else if (m.expiryStatus === 'Expired') {
                expiryBadge = ' <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;background:#FEF2F2;color:#991B1B;text-decoration:line-through">EXPIRED</span>';
            }

            var nearExp = m.nearestExpiry ? new Date(m.nearestExpiry).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

            var catBg = '#F1F5F9', catColor = '#475569';
            if (m.category === 'Antibiotic') { catBg = '#DBEAFE'; catColor = '#1e40af'; }
            else if (m.category === 'Analgesic') { catBg = '#FEF3C7'; catColor = '#92400e'; }
            else if (m.category === 'Cardiovascular') { catBg = '#FCE7F3'; catColor = '#9d174d'; }
            else if (m.category === 'Respiratory') { catBg = '#E0E7FF'; catColor = '#3730a3'; }

            $tbody.append(
                '<tr class="inv-row" data-id="' + esc(m.medicineId) + '" style="border-bottom:1px solid var(--color-border);cursor:pointer;transition:background 0.1s">' +
                    '<td style="padding:12px 16px;font-size:13px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(m.medicineCode) + '</td>' +
                    '<td style="padding:12px 16px"><div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(m.brandName) + ' ' + esc(m.strength) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(m.genericName) + '</div></td>' +
                    '<td style="padding:12px 16px;font-size:13px">' + esc(m.form) + '</td>' +
                    '<td style="padding:12px 16px"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:500;background:' + catBg + ';color:' + catColor + '">' + esc(m.category) + '</span></td>' +
                    '<td style="padding:12px 16px;font-size:13px;color:var(--color-muted-foreground)">' + esc(m.manufacturer) + '</td>' +
                    '<td style="padding:12px 16px;text-align:right;font-size:13px;font-weight:600;font-family:monospace">' + m.currentStock.toLocaleString() + ' <span style="font-size:11px;font-weight:400;color:var(--color-muted-foreground)">' + esc(m.stockUnit) + '</span></td>' +
                    '<td style="padding:12px 16px;text-align:center;font-size:12px;font-family:monospace;color:var(--color-muted-foreground)">' + m.minStock + '/' + m.maxStock + '</td>' +
                    '<td style="padding:12px 16px;text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;background:' + statusBg + ';color:' + statusColor + '">' + esc(m.stockStatus).toUpperCase() + '</span>' + expiryBadge + '</td>' +
                    '<td style="padding:12px 16px;text-align:right;font-size:13px;font-family:monospace"><div>' + hospitalInfo.currency + ' ' + m.sellingPrice.toLocaleString() + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">Cost: ' + m.purchasePrice.toLocaleString() + '</div></td>' +
                    '<td style="padding:12px 16px;text-align:center;font-size:13px;font-weight:500">' + m.batchCount + '</td>' +
                    '<td style="padding:12px 16px;font-size:12px;color:var(--color-muted-foreground)">' + nearExp + '</td>' +
                    '<td style="padding:12px 16px;text-align:center">' +
                        '<div style="display:flex;gap:4px;justify-content:center">' +
                            '<button class="btn-view-med" data-id="' + esc(m.medicineId) + '" style="background:none;border:1px solid var(--color-border);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;color:var(--color-muted-foreground)" title="View"><i data-lucide="eye" style="width:14px;height:14px"></i></button>' +
                            '<button class="btn-adjust-stock" data-id="' + esc(m.medicineId) + '" data-name="' + esc(m.brandName + ' ' + m.strength) + '" data-stock="' + m.currentStock + '" data-unit="' + esc(m.stockUnit) + '" style="background:none;border:1px solid var(--color-border);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;color:var(--color-muted-foreground)" title="Adjust Stock"><i data-lucide="sliders-horizontal" style="width:14px;height:14px"></i></button>' +
                        '</div>' +
                    '</td>' +
                '</tr>'
            );
        });

        lucide.createIcons();
        applyInvColVis();
    }

    // ── Pagination ─────────────────────────────────────────────────────────────
    function renderPagination() {
        var total = filteredMedicines.length;
        var totalPages = Math.max(1, Math.ceil(total / invRowsPer));
        var start = total === 0 ? 0 : (invPage - 1) * invRowsPer + 1;
        var end = Math.min(invPage * invRowsPer, total);

        $('#invPageInfo').text('Showing ' + start + ' – ' + end + ' of ' + total + ' results');

        // Prev / next
        $('#invPrevPage').prop('disabled', invPage <= 1);
        $('#invNextPage').prop('disabled', invPage >= totalPages);

        // Page number buttons
        var $nums = $('#invPageNums').empty();
        var pages = buildPageRange(invPage, totalPages);
        pages.forEach(function(p) {
            if (p === '…') {
                $nums.append('<span style="display:flex;align-items:center;padding:0 4px;font-size:13px;color:var(--color-muted-foreground)">…</span>');
            } else {
                var $btn = $('<button class="opd-page-num' + (p === invPage ? ' active' : '') + '">' + p + '</button>');
                $btn.on('click', function() { goToInvPage(p); });
                $nums.append($btn);
            }
        });

        lucide.createIcons();
    }

    function buildPageRange(current, total) {
        if (total <= 7) {
            var arr = [];
            for (var i = 1; i <= total; i++) arr.push(i);
            return arr;
        }
        var pages = [1];
        if (current > 3) pages.push('…');
        var lo = Math.max(2, current - 1);
        var hi = Math.min(total - 1, current + 1);
        for (var j = lo; j <= hi; j++) pages.push(j);
        if (current < total - 2) pages.push('…');
        pages.push(total);
        return pages;
    }

    function goToInvPage(p) {
        invPage = p;
        renderTable();
        renderPagination();
    }

    $('#invPrevPage').on('click', function() { if (invPage > 1) goToInvPage(invPage - 1); });
    $('#invNextPage').on('click', function() {
        var totalPages = Math.ceil(filteredMedicines.length / invRowsPer);
        if (invPage < totalPages) goToInvPage(invPage + 1);
    });

    // ── Search ─────────────────────────────────────────────────────────────────
    var searchTimer;
    $('#invSearch').on('input', function() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function() {
            invPage = 1;
            loadMedicines();
        }, 300);
    });

    // ── Filter pane toggle ─────────────────────────────────────────────────────
    window.toggleInvFilter = function() {
        var $pane = $('#invFilterPane');
        var $btn = $('#btnInvFilter');
        if ($pane.is(':visible')) {
            $pane.slideUp(150);
            $btn.removeClass('filter-active');
        } else {
            $pane.slideDown(150);
            $btn.addClass('filter-active');
            lucide.createIcons();
        }
    };

    window.applyInvFilters = function() {
        activeFilters.category = $('#filterCategory').val();
        activeFilters.form = $('#filterForm').val();
        activeFilters.stockStatus = $('#filterStockStatus').val();
        activeFilters.abcClass = $('#filterAbc').val();

        var count = [activeFilters.category, activeFilters.form, activeFilters.stockStatus, activeFilters.abcClass]
            .filter(function(v) { return v !== ''; }).length;

        var $badge = $('#invFilterBadge');
        if (count > 0) {
            $badge.text(count).show();
            $('#btnInvFilter').addClass('filter-active');
        } else {
            $badge.hide();
        }

        invPage = 1;
        loadMedicines();
    };

    window.resetInvFilters = function() {
        $('#filterCategory').val('');
        $('#filterForm').val('');
        $('#filterStockStatus').val('');
        $('#filterAbc').val('');
        activeFilters = { category: '', form: '', stockStatus: '', abcClass: '' };
        $('#invFilterBadge').hide();
        invPage = 1;
        loadMedicines();
    };

    // ── Rows per page ──────────────────────────────────────────────────────────
    window.toggleInvRowsMenu = function(e) {
        e.stopPropagation();
        $('#invRowsMenu').toggleClass('open');
    };

    window.setInvRowsPer = function(n) {
        invRowsPer = n;
        invPage = 1;
        $('#invRowsMenu button').removeClass('active');
        $('#invRowsMenu button').each(function() {
            if ($(this).text().indexOf(n + ' rows') !== -1) $(this).addClass('active');
        });
        $('#invRowsMenu').removeClass('open');
        renderTable();
        renderPagination();
    };

    // ── Column visibility ──────────────────────────────────────────────────────
    window.toggleInvColVis = function(e) {
        e.stopPropagation();
        $('#invColVisMenu').toggleClass('open');
    };

    window.invColVisSelectAll = function() {
        $('#invColVisList input[type="checkbox"]').prop('checked', true);
    };

    window.applyInvColVis = function() {
        $('#invColVisList input[type="checkbox"]').each(function() {
            var col = parseInt($(this).data('col'));
            var visible = $(this).is(':checked');
            $('#invTable thead th:eq(' + col + ')').toggle(visible);
            $('#invTable tbody tr').each(function() {
                $(this).find('td:eq(' + col + ')').toggle(visible);
            });
        });
        $('#invColVisMenu').removeClass('open');
    };

    // ── Export ─────────────────────────────────────────────────────────────────
    window.toggleInvExportMenu = function(e) {
        e.stopPropagation();
        $('#invExportMenu').toggleClass('open');
    };

    window.exportInv = function(type) {
        $('#invExportMenu').removeClass('open');
        var data = filteredMedicines;
        if (!data || data.length === 0) { HMS.toast('No data to export', 'warning'); return; }

        if (type === 'csv') {
            var csv = 'Code,Medicine Name,Generic Name,Form,Category,Manufacturer,Stock,Unit,Stock Status,Selling Price,Purchase Price,Batches,Nearest Expiry\n';
            data.forEach(function(m) {
                var nearExp = m.nearestExpiry ? new Date(m.nearestExpiry).toLocaleDateString() : '';
                csv += [
                    m.medicineCode, m.brandName + ' ' + (m.strength || ''), m.genericName,
                    m.form, m.category, m.manufacturer, m.currentStock, m.stockUnit,
                    m.stockStatus, m.sellingPrice, m.purchasePrice, m.batchCount, nearExp
                ].map(function(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(',') + '\n';
            });
            var blob = new Blob([csv], { type: 'text/csv' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = 'inventory.csv'; a.click();
            URL.revokeObjectURL(url);
        } else if (type === 'excel') {
            HMS.toast('Excel export coming soon', 'info');
        } else if (type === 'pdf') {
            HMS.toast('PDF export coming soon', 'info');
        } else if (type === 'print') {
            window.print();
        }
    };

    // ── Close dropdowns on outside click ──────────────────────────────────────
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.opd-rows-wrap').length) $('#invRowsMenu').removeClass('open');
        if (!$(e.target).closest('.opd-col-vis-wrap').length) $('#invColVisMenu').removeClass('open');
        if (!$(e.target).closest('.opd-export-wrap').length) $('#invExportMenu').removeClass('open');
    });

    // ── Row interactions ───────────────────────────────────────────────────────
    $(document).on('click', '.inv-row', function(e) {
        if ($(e.target).closest('button').length) return;
        openMedicineDetail($(this).data('id'));
    });

    $(document).on('click', '.btn-view-med', function(e) {
        e.stopPropagation();
        openMedicineDetail($(this).data('id'));
    });

    $(document).on('mouseenter', '.inv-row', function() { $(this).css('background', 'var(--color-background)'); });
    $(document).on('mouseleave', '.inv-row', function() { $(this).css('background', ''); });

    // ── Stock adjust ───────────────────────────────────────────────────────────
    $(document).on('click', '.btn-adjust-stock', function(e) {
        e.stopPropagation();
        adjustMedicineId = $(this).data('id');
        adjustCurrentStock = parseInt($(this).data('stock'));
        $('#adjMedicineName').text($(this).data('name'));
        $('#adjCurrentStock').text(adjustCurrentStock + ' ' + $(this).data('unit'));
        $('input[name="adjType"][value="increase"]').prop('checked', true);
        $('#adjQuantity').val('');
        $('#adjNewStock').text('--');
        $('#adjReason').val('');
        $('#adjOtherReasonWrap').hide();
        $('#adjOtherReason').val('');
        $('#adjNotes').val('');
        $('#adjDateTime').text(new Date().toLocaleString('en-PK'));
        var modal = new bootstrap.Modal(document.getElementById('stockAdjustModal'));
        modal.show();
        lucide.createIcons();
    });

    $('#adjQuantity').on('input', calcNewStock);
    $('input[name="adjType"]').on('change', calcNewStock);

    function calcNewStock() {
        var qty = parseInt($('#adjQuantity').val()) || 0;
        var type = $('input[name="adjType"]:checked').val();
        var newStock;
        if (type === 'increase') newStock = adjustCurrentStock + qty;
        else if (type === 'decrease') newStock = Math.max(0, adjustCurrentStock - qty);
        else newStock = qty;
        $('#adjNewStock').text(newStock);
    }

    $('#adjReason').on('change', function() {
        if ($(this).val() === 'Other') { $('#adjOtherReasonWrap').show(); } else { $('#adjOtherReasonWrap').hide(); }
    });

    $('#btnConfirmAdjust').on('click', function() {
        var reason = $('#adjReason').val();
        if (reason === 'Other') reason = $('#adjOtherReason').val();
        if (!reason) { HMS.toast('Please select a reason', 'warning'); return; }
        var qty = parseInt($('#adjQuantity').val());
        if (isNaN(qty) || qty < 0) { HMS.toast('Please enter a valid quantity', 'warning'); return; }
        var type = $('input[name="adjType"]:checked').val();

        var $btn = $(this);
        $btn.prop('disabled', true).text('Processing...');

        $.ajax({
            url: '/api/inventory/adjust',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                medicineId: adjustMedicineId,
                adjustmentType: type,
                quantity: qty,
                reason: reason,
                notes: $('#adjNotes').val()
            }),
            success: function() {
                bootstrap.Modal.getInstance(document.getElementById('stockAdjustModal')).hide();
                loadStats();
                loadMedicines();
                if (currentMedicineId === adjustMedicineId) openMedicineDetail(adjustMedicineId);
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed');
            },
            complete: function() {
                $btn.prop('disabled', false).text('Confirm Adjustment');
            }
        });
    });

    // ── Add Medicine ───────────────────────────────────────────────────────────
    $('#btnAddMedicine').on('click', function() {
        $('#addMedicineForm')[0].reset();
        $('#addMedError').hide();
        $('#addMedSuccess').hide();
        var offcanvas = new bootstrap.Offcanvas(document.getElementById('addMedicineSheet'));
        offcanvas.show();
        lucide.createIcons();
    });

    $('#addMedicineForm').on('submit', function(e) {
        e.preventDefault();
        $('#addMedError').hide();
        $('#addMedSuccess').hide();

        var formData = {};
        $(this).serializeArray().forEach(function(item) { formData[item.name] = item.value; });
        formData.requires_prescription = formData.requires_prescription === '1';
        formData.is_active = formData.is_active === '1';
        if (formData.purchase_price) formData.purchase_price = parseFloat(formData.purchase_price);
        if (formData.selling_price) formData.selling_price = parseFloat(formData.selling_price);
        if (formData.reorder_level) formData.reorder_level = parseInt(formData.reorder_level);

        var $btn = $('#btnSaveMedicine');
        $btn.prop('disabled', true).html('<i data-lucide="loader-2" style="width:16px;height:16px;animation:spin 1s linear infinite"></i> Saving...');

        $.ajax({
            url: '/api/inventory/medicines',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(resp) {
                $('#addMedSuccess').text('Medicine "' + (formData.brand_name || formData.medicine_name) + '" added successfully! (ID: ' + resp.medicineCode + ')').show();
                $('#addMedicineForm')[0].reset();
                loadStats();
                loadMedicines();
                loadFilters();
                setTimeout(function() {
                    bootstrap.Offcanvas.getInstance(document.getElementById('addMedicineSheet')).hide();
                }, 1500);
            },
            error: function(xhr) {
                var msg = 'Failed to add medicine.';
                if (xhr.responseJSON) {
                    if (xhr.responseJSON.errors) {
                        var errs = [];
                        $.each(xhr.responseJSON.errors, function(field, messages) { errs.push(messages.join(', ')); });
                        msg = errs.join('<br>');
                    } else if (xhr.responseJSON.message) {
                        msg = xhr.responseJSON.message;
                    }
                }
                $('#addMedError').html(msg).show();
            },
            complete: function() {
                $btn.prop('disabled', false).html('<i data-lucide="save" style="width:16px;height:16px"></i> Save Medicine');
                lucide.createIcons();
            }
        });
    });

    // ── Medicine Detail Offcanvas ──────────────────────────────────────────────
    function openMedicineDetail(medicineId) {
        currentMedicineId = medicineId;
        var offcanvas = new bootstrap.Offcanvas(document.getElementById('medicineDetailSheet'));
        offcanvas.show();

        $('.med-tab-btn').removeClass('active').css({ 'border-bottom-color': 'transparent', 'color': 'var(--color-muted-foreground)' });
        $('.med-tab-btn[data-tab="overview"]').addClass('active').css({ 'border-bottom-color': 'var(--aquamint)', 'color': 'var(--aquamint)' });

        $('#medTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)">Loading...</div>');

        $.get('/api/inventory/medicines/' + medicineId, function(data) {
            currentMedicineData = data;
            var med = data.medicine;
            $('#medDetailTitle').text(med.brandName + ' ' + (med.strength || ''));
            $('#medDetailSub').text(med.medicineCode + ' | ' + med.genericName + ' | ' + med.manufacturer);
            renderOverviewTab(med);
        });
    }

    $(document).on('click', '.med-tab-btn', function() {
        var tab = $(this).data('tab');
        $('.med-tab-btn').removeClass('active').css({ 'border-bottom-color': 'transparent', 'color': 'var(--color-muted-foreground)' });
        $(this).addClass('active').css({ 'border-bottom-color': 'var(--aquamint)', 'color': 'var(--aquamint)' });

        if (tab === 'overview') renderOverviewTab(currentMedicineData.medicine);
        else if (tab === 'batches') renderBatchesTab();
        else if (tab === 'transactions') renderTransactionsTab();
        else if (tab === 'analytics') renderAnalyticsTab();
        else if (tab === 'substitutes') renderSubstitutesTab();
    });

    function renderOverviewTab(med) {
        var stockStatus = med.currentStock <= 0 ? 'Out of Stock' : (med.currentStock < med.minStock ? 'Low Stock' : 'In Stock');
        var statusBg = stockStatus === 'In Stock' ? '#DCFCE7' : (stockStatus === 'Low Stock' ? '#FFF7ED' : '#FEF2F2');
        var statusColor = stockStatus === 'In Stock' ? '#166534' : (stockStatus === 'Low Stock' ? '#9a3412' : '#991B1B');

        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Medicine Info</div>' +
                infoRow('Medicine Code', med.medicineCode) +
                infoRow('Generic Name', med.genericName) +
                infoRow('Brand Name', med.brandName) +
                infoRow('Strength', med.strength || '-') +
                infoRow('Form', med.form) +
                infoRow('Category', med.category) +
                infoRow('Manufacturer', med.manufacturer) +
            '</div>' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Stock Summary</div>' +
                infoRow('Total', med.currentStock + ' ' + med.stockUnit) +
                infoRow('Available', med.available + ' ' + med.stockUnit) +
                infoRow('Reserved', med.reserved + ' ' + med.stockUnit) +
                infoRow('Expired', med.expiredQty + ' ' + med.stockUnit) +
                infoRow('Stock Value', hospitalInfo.currency + ' ' + med.stockValue.toLocaleString()) +
                '<div style="margin-top:8px"><span style="display:inline-block;padding:3px 12px;border-radius:4px;font-size:11px;font-weight:600;background:' + statusBg + ';color:' + statusColor + '">' + stockStatus.toUpperCase() + '</span></div>' +
            '</div>' +
        '</div>';

        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Pricing</div>' +
                infoRow('Purchase Price', hospitalInfo.currency + ' ' + med.purchasePrice.toLocaleString() + '/' + med.stockUnit.replace(/s$/, '')) +
                infoRow('Selling Price', hospitalInfo.currency + ' ' + med.sellingPrice.toLocaleString() + '/' + med.stockUnit.replace(/s$/, '')) +
                infoRow('Margin', med.margin + '%') +
            '</div>' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Reorder Levels</div>' +
                infoRow('Min Stock', med.minStock + ' ' + med.stockUnit) +
                infoRow('Max Stock', med.maxStock + ' ' + med.stockUnit) +
                infoRow('Reorder Point', med.reorderPoint + ' ' + med.stockUnit) +
                infoRow('EOQ', med.eoq + ' ' + med.stockUnit) +
            '</div>' +
        '</div>';

        html += '<div style="margin-top:16px;padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
            '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Storage</div>' +
            infoRow('Location', med.storageLocation || '-') +
            infoRow('Conditions', med.storageConditions || '-') +
        '</div>';

        $('#medTabContent').html(html);
    }

    function infoRow(label, value) {
        return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.04)">' +
            '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(label) + '</span>' +
            '<span style="font-size:12px;font-weight:600;color:var(--color-foreground)">' + esc(value) + '</span>' +
        '</div>';
    }

    function renderBatchesTab() {
        $('#medTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)">Loading batches...</div>');

        $.get('/api/inventory/batches/' + currentMedicineId, function(batches) {
            if (!batches || batches.length === 0) {
                $('#medTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="package" style="width:32px;height:32px;display:block;margin:0 auto 8px;opacity:0.4"></i>No batches found</div>');
                lucide.createIcons();
                return;
            }

            var fifo = batches.find(function(b) { return b.currentQty > 0 && b.daysToExpiry > 0; });

            var html = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">' +
                '<thead><tr style="background:var(--color-background)">' +
                    '<th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Batch #</th>' +
                    '<th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Received</th>' +
                    '<th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Expiry</th>' +
                    '<th style="padding:10px 8px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Days to Exp</th>' +
                    '<th style="padding:10px 8px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Qty Rcvd</th>' +
                    '<th style="padding:10px 8px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Current</th>' +
                    '<th style="padding:10px 8px;text-align:right;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Unit Price</th>' +
                    '<th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Supplier</th>' +
                    '<th style="padding:10px 8px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Status</th>' +
                '</tr></thead><tbody>';

            batches.forEach(function(b) {
                var expColor = b.daysToExpiry > 180 ? '#22c55e' : (b.daysToExpiry > 90 ? '#eab308' : (b.daysToExpiry > 0 ? '#f97316' : '#ef4444'));
                var expIcon = b.daysToExpiry > 0 ? '<span style="color:' + expColor + '">&#10003;</span>' : '<span style="color:#ef4444">&#10007;</span>';
                var stBg = b.status === 'Active' ? '#DCFCE7' : '#FEF2F2';
                var stColor = b.status === 'Active' ? '#166534' : '#991B1B';

                html += '<tr style="border-bottom:1px solid var(--color-border)">' +
                    '<td style="padding:10px 8px;font-family:monospace;font-weight:600">' + esc(b.batchNumber) + '</td>' +
                    '<td style="padding:10px 8px;color:var(--color-muted-foreground)">' + new Date(b.receivedDate).toLocaleDateString('en-PK', { day:'2-digit', month:'short', year:'numeric' }) + '</td>' +
                    '<td style="padding:10px 8px;color:var(--color-muted-foreground)">' + new Date(b.expiryDate).toLocaleDateString('en-PK', { month:'short', year:'numeric' }) + '</td>' +
                    '<td style="padding:10px 8px;text-align:center;font-weight:600;color:' + expColor + '">' + b.daysToExpiry + ' ' + expIcon + '</td>' +
                    '<td style="padding:10px 8px;text-align:right">' + b.qtyReceived + '</td>' +
                    '<td style="padding:10px 8px;text-align:right;font-weight:600">' + b.currentQty + '</td>' +
                    '<td style="padding:10px 8px;text-align:right;font-family:monospace">' + hospitalInfo.currency + ' ' + b.unitPrice.toLocaleString() + '</td>' +
                    '<td style="padding:10px 8px;color:var(--color-muted-foreground)">' + esc(b.supplier) + '</td>' +
                    '<td style="padding:10px 8px;text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:' + stBg + ';color:' + stColor + '">' + esc(b.status) + '</span></td>' +
                '</tr>';
            });

            html += '</tbody></table></div>';

            if (fifo) {
                html += '<div style="margin-top:16px;padding:12px 16px;background:#EFF6FF;border-radius:8px;border:1px solid #BFDBFE;display:flex;align-items:center;gap:8px">' +
                    '<i data-lucide="info" style="width:16px;height:16px;color:#2563eb"></i>' +
                    '<span style="font-size:13px;color:#1e40af"><strong>FIFO:</strong> Batch ' + esc(fifo.batchNumber) + ' will be dispensed first</span></div>';
            }

            $('#medTabContent').html(html);
            lucide.createIcons();
        });
    }

    function renderTransactionsTab() {
        $('#medTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)">Loading transactions...</div>');

        $.get('/api/inventory/transactions/' + currentMedicineId, function(txns) {
            if (!txns || txns.length === 0) {
                $('#medTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="history" style="width:32px;height:32px;display:block;margin:0 auto 8px;opacity:0.4"></i>No transactions recorded</div>');
                lucide.createIcons();
                return;
            }

            var html = '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Transaction History</div>';

            txns.forEach(function(t) {
                var d = new Date(t.createdAt);
                var isIn = t.quantity > 0;
                var iconName = isIn ? 'arrow-down-circle' : 'arrow-up-circle';
                var iconColor = isIn ? '#22c55e' : '#ef4444';
                var qtyLabel = (isIn ? '+' : '') + t.quantity;

                html += '<div style="display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--color-border)">' +
                    '<div style="flex-shrink:0;width:36px;height:36px;border-radius:8px;background:' + (isIn ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)') + ';display:flex;align-items:center;justify-content:center">' +
                        '<i data-lucide="' + iconName + '" style="width:18px;height:18px;color:' + iconColor + '"></i>' +
                    '</div>' +
                    '<div style="flex:1;min-width:0">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
                            '<span style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(t.type) + '</span>' +
                            '<span style="font-size:13px;font-weight:700;font-family:monospace;color:' + iconColor + '">' + qtyLabel + ' ' + (currentMedicineData ? currentMedicineData.medicine.stockUnit : '') + '</span>' +
                        '</div>' +
                        '<div style="font-size:12px;color:var(--color-muted-foreground);margin-bottom:2px">' +
                            (t.batchId ? 'Batch: ' + esc(t.batchId) + ' | ' : '') +
                            (t.reference ? esc(t.reference) + ' | ' : '') +
                            (t.reason ? esc(t.reason) : '') +
                        '</div>' +
                        (t.notes ? '<div style="font-size:12px;color:var(--color-muted-foreground);font-style:italic">' + esc(t.notes) + '</div>' : '') +
                        '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">' +
                            d.toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' }) + ', ' +
                            d.toLocaleTimeString('en-PK', { hour:'2-digit', minute:'2-digit', hour12:true }) +
                            ' | By: ' + esc(t.performedBy) +
                            ' | Stock: ' + t.stockBefore + ' → ' + t.stockAfter +
                        '</div>' +
                    '</div>' +
                '</div>';
            });

            $('#medTabContent').html(html);
            lucide.createIcons();
        });
    }

    function renderAnalyticsTab() {
        if (!currentMedicineData) return;
        var med = currentMedicineData.medicine;

        var months = [];
        var usage = [];
        var now = new Date();
        for (var i = 11; i >= 0; i--) {
            var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(d.toLocaleDateString('en-PK', { month: 'short', year: '2-digit' }));
            usage.push(Math.floor(Math.random() * 30) + 10 + (med.abcClass === 'A' ? 20 : (med.abcClass === 'B' ? 10 : 0)));
        }

        var avg = Math.round(usage.reduce(function(a, b) { return a + b; }, 0) / usage.length);
        var forecast = Math.round(avg * 1.05);

        var html = '<div style="margin-bottom:20px">' +
            '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Monthly Consumption Trend (12 months)</div>' +
            '<div style="background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);padding:16px">' +
                '<canvas id="usageChart" height="200"></canvas>' +
            '</div>' +
        '</div>';

        html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);text-align:center">' +
                '<div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:4px">Daily Average</div>' +
                '<div style="font-size:20px;font-weight:700;color:var(--color-foreground)">' + Math.round(avg / 30) + ' ' + med.stockUnit + '</div>' +
            '</div>' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);text-align:center">' +
                '<div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:4px">Forecast (next month)</div>' +
                '<div style="font-size:20px;font-weight:700;color:var(--color-foreground)">' + forecast + ' ' + med.stockUnit + '</div>' +
            '</div>' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);text-align:center">' +
                '<div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:4px">Stockout Incidents</div>' +
                '<div style="font-size:20px;font-weight:700;color:#22c55e">0</div>' +
                '<div style="font-size:10px;color:var(--color-muted-foreground)">last 6 months</div>' +
            '</div>' +
        '</div>';

        html += '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
            '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Usage by Department</div>' +
            deptBar('OPD', 45) + deptBar('IPD', 30) + deptBar('Emergency', 15) + deptBar('Walk-in', 10) +
        '</div>';

        $('#medTabContent').html(html);

        var ctx = document.getElementById('usageChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{ label: 'Usage', data: usage, borderColor: '#7FFFD4', backgroundColor: 'rgba(127,255,212,0.1)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#7FFFD4' }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
                }
            });
        }
    }

    function deptBar(name, pct) {
        return '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">' +
            '<span style="font-size:12px;color:var(--color-muted-foreground);width:80px">' + esc(name) + '</span>' +
            '<div style="flex:1;height:8px;background:var(--color-border);border-radius:4px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:var(--aquamint);border-radius:4px"></div></div>' +
            '<span style="font-size:12px;font-weight:600;color:var(--color-foreground);width:35px;text-align:right">' + pct + '%</span>' +
        '</div>';
    }

    function renderSubstitutesTab() {
        if (!currentMedicineData) return;
        var data = currentMedicineData;
        var med = data.medicine;
        var html = '';

        if (data.substitutes && data.substitutes.length > 0) {
            html += '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Same Generic, Different Brands</div>';
            data.substitutes.forEach(function(s) {
                var priceDiff = med.sellingPrice > 0 ? Math.round(((med.sellingPrice - s.sellingPrice) / med.sellingPrice) * 100) : 0;
                var priceLabel = priceDiff > 0 ? '<span style="color:#22c55e;font-size:11px;font-weight:600">(' + priceDiff + '% cheaper)</span>' : '';
                var stLabel = s.currentStock > 0 ? '<span style="color:#166534;font-size:11px">In Stock (' + s.currentStock + ')</span>' : '<span style="color:#991B1B;font-size:11px">Out of Stock</span>';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--color-background);border-radius:8px;border:1px solid var(--color-border);margin-bottom:8px">' +
                    '<div><div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(s.brandName) + ' ' + esc(s.strength) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(s.manufacturer) + ' | ' + stLabel + '</div></div>' +
                    '<div style="text-align:right"><div style="font-size:13px;font-weight:600;font-family:monospace">' + hospitalInfo.currency + ' ' + s.sellingPrice.toLocaleString() + '/' + med.stockUnit.replace(/s$/, '') + '</div>' + priceLabel + '</div>' +
                '</div>';
            });
        } else {
            html += '<div style="padding:20px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No same-generic substitutes found</div>';
        }

        if (data.sameCategory && data.sameCategory.length > 0) {
            html += '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin:20px 0 12px;letter-spacing:0.05em">Same Category Alternatives</div>';
            data.sameCategory.forEach(function(s) {
                var stLabel = s.currentStock > 0 ? '<span style="color:#166534;font-size:11px">In Stock (' + s.currentStock + ')</span>' : '<span style="color:#991B1B;font-size:11px">Out of Stock</span>';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--color-background);border-radius:8px;border:1px solid var(--color-border);margin-bottom:8px">' +
                    '<div><div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(s.brandName) + ' ' + esc(s.strength) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(s.genericName) + ' | ' + stLabel + '</div></div>' +
                    '<div style="text-align:right;font-size:13px;font-weight:600;font-family:monospace">' + hospitalInfo.currency + ' ' + s.sellingPrice.toLocaleString() + '/' + med.stockUnit.replace(/s$/, '') + '</div>' +
                '</div>';
            });
        }

        $('#medTabContent').html(html);
        lucide.createIcons();
    }
});
