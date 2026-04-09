$(document).ready(function() {
    var allItems = [];
    var currentId = null;
    var currentData = null;
    var adjustId = null;
    var adjustStock = 0;
    var consumptionChart = null;
    var currency = 'PKR';

    function esc(s) { return $('<span>').text(s || '').html(); }

    $.get('/api/config/hospital-info', function(d) { if (d && d.currency) currency = d.currency; });

    loadStats();
    loadStorage();
    loadFilters();
    loadItems();

    function loadStats() {
        $.get('/api/lab-inventory/stats', function(d) {
            $('#statTotal').text(d.totalItems);
            $('#statOOS').text(d.outOfStock);
            $('#statLow').text(d.lowStock);
            $('#statExpiring').text(d.expiringSoon);
            $('#statLowKits').text(d.lowReagentKits);
            var v = d.stockValue;
            if (v >= 1000000) $('#statValue').text((v/1000000).toFixed(1) + 'M');
            else if (v >= 1000) $('#statValue').text((v/1000).toFixed(0) + 'K');
            else $('#statValue').text(currency + ' ' + v.toLocaleString());
            lucide.createIcons();
        });
    }

    function loadStorage() {
        $.get('/api/lab-inventory/storage-conditions', function(data) {
            var html = '';
            var colors = {
                'Room Temperature': { bg: '#FEF3C7', border: '#F59E0B', icon: '#D97706' },
                'Refrigerated': { bg: '#DBEAFE', border: '#3B82F6', icon: '#2563EB' },
                'Frozen': { bg: '#E0E7FF', border: '#6366F1', icon: '#4F46E5' },
                'Ultra-Frozen': { bg: '#EDE9FE', border: '#8B5CF6', icon: '#7C3AED' }
            };
            data.forEach(function(s) {
                var c = colors[s.name] || { bg: '#F1F5F9', border: '#94A3B8', icon: '#64748B' };
                html += '<div style="padding:16px;border-radius:10px;border:2px solid ' + c.border + ';background:' + c.bg + '">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
                        '<i data-lucide="' + esc(s.icon) + '" style="width:18px;height:18px;color:' + c.icon + '"></i>' +
                        '<span style="font-size:13px;font-weight:600;color:' + c.icon + '">' + esc(s.name) + '</span>' +
                    '</div>' +
                    '<div style="font-size:24px;font-weight:700;color:' + c.icon + ';font-family:\'Roobert\',sans-serif;margin-bottom:4px">' + s.count + '</div>' +
                    '<div style="font-size:11px;color:' + c.icon + ';opacity:0.8">' + esc(s.range) + '</div>' +
                '</div>';
            });
            $('#storageCards').html(html);
            lucide.createIcons();
        });
    }

    function loadFilters() {
        $.get('/api/lab-inventory/filters', function(d) {
            var $a = $('#filterAnalyzer');
            d.analyzers.forEach(function(a) { $a.append('<option value="' + esc(a) + '">' + esc(a) + '</option>'); });
        });
    }

    function loadItems() {
        var params = {};
        var search = $('#invSearch').val();
        if (search) params.search = search;
        var cat = $('.cat-tab.active').data('cat');
        if (cat) params.category = cat;
        var storage = $('#filterStorage').val();
        if (storage) params.storage = storage;
        var status = $('#filterStockStatus').val();
        if (status) params.stockStatus = status;
        var analyzer = $('#filterAnalyzer').val();
        if (analyzer) params.analyzer = analyzer;

        $.get('/api/lab-inventory/items', params, function(data) {
            allItems = data;
            renderTable(data);
        });
    }

    function renderTable(items) {
        var $tbody = $('#invTableBody');
        $tbody.empty();

        if (!items || items.length === 0) {
            $tbody.append('<tr><td colspan="11" style="padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:14px"><i data-lucide="inbox" style="width:32px;height:32px;display:block;margin:0 auto 8px;opacity:0.4"></i>No items found</td></tr>');
            lucide.createIcons();
            return;
        }

        items.forEach(function(r) {
            var stBg, stColor;
            if (r.stockStatus === 'In Stock') { stBg = '#DCFCE7'; stColor = '#166534'; }
            else if (r.stockStatus === 'Low Stock') { stBg = '#FFF7ED'; stColor = '#9a3412'; }
            else { stBg = '#FEF2F2'; stColor = '#991B1B'; }

            var catColors = {
                'Reagents': { bg: '#DBEAFE', color: '#1e40af' },
                'QC Materials': { bg: '#FCE7F3', color: '#9d174d' },
                'Calibrators': { bg: '#FEF3C7', color: '#92400e' },
                'Consumables': { bg: '#E0E7FF', color: '#3730a3' },
                'Stains & Chemicals': { bg: '#D1FAE5', color: '#065f46' }
            };
            var cc = catColors[r.category] || { bg: '#F1F5F9', color: '#475569' };

            var storageIcons = {
                'Room Temperature': '🌡️',
                'Refrigerated': '❄️',
                'Frozen': '🧊',
                'Ultra-Frozen': '⛄'
            };
            var storageIcon = storageIcons[r.storageCondition] || '';

            var expBadge = '';
            if (r.expiryStatus === 'Expiring Soon') {
                expBadge = ' <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;background:#FEF9C3;color:#854d0e">EXPIRING</span>';
            } else if (r.expiryStatus === 'Expired') {
                expBadge = ' <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;background:#FEF2F2;color:#991B1B">EXPIRED</span>';
            }

            var nearExp = r.nearestExpiry ? new Date(r.nearestExpiry).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

            var reagentLevel = '-';
            if (r.reagentPct !== null) {
                var pctColor = r.reagentPct > 50 ? '#22c55e' : (r.reagentPct > 20 ? '#f97316' : '#ef4444');
                reagentLevel = '<div style="display:flex;align-items:center;gap:6px;justify-content:center">' +
                    '<div style="width:50px;height:6px;border-radius:3px;background:#e5e7eb;overflow:hidden">' +
                        '<div style="width:' + r.reagentPct + '%;height:100%;border-radius:3px;background:' + pctColor + '"></div>' +
                    '</div>' +
                    '<span style="font-size:11px;font-weight:600;color:' + pctColor + '">' + r.reagentPct + '%</span>' +
                '</div>' +
                '<div style="font-size:10px;color:var(--color-muted-foreground);text-align:center">' + r.remainingTests + '/' + r.testsPerKit + ' tests</div>';
            }

            var analyzerBadge = '';
            if (r.analyzerName) {
                analyzerBadge = '<div style="font-size:10px;color:var(--aquamint);margin-top:2px"><i data-lucide="cpu" style="width:10px;height:10px;vertical-align:-1px"></i> ' + esc(r.analyzerName) + '</div>';
            }

            $tbody.append(
                '<tr class="inv-row" data-id="' + esc(r.reagentId) + '" style="border-bottom:1px solid var(--color-border);cursor:pointer;transition:background 0.1s">' +
                    '<td style="padding:12px 14px;font-size:12px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(r.reagentCode) + '</td>' +
                    '<td style="padding:12px 14px"><div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(r.name) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(r.manufacturer) + (r.catalogNumber ? ' | ' + esc(r.catalogNumber) : '') + '</div>' + analyzerBadge + '</td>' +
                    '<td style="padding:12px 14px"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:500;background:' + cc.bg + ';color:' + cc.color + '">' + esc(r.category) + '</span></td>' +
                    '<td style="padding:12px 14px;font-size:12px">' + storageIcon + ' <span style="color:var(--color-muted-foreground)">' + esc(r.storageTempRange || r.storageCondition) + '</span></td>' +
                    '<td style="padding:12px 14px;text-align:right;font-size:13px;font-weight:600;font-family:monospace">' + r.currentStock + ' <span style="font-size:11px;font-weight:400;color:var(--color-muted-foreground)">' + esc(r.unit) + '</span></td>' +
                    '<td style="padding:12px 14px;text-align:center;font-size:12px;font-family:monospace;color:var(--color-muted-foreground)">' + r.minStock + '/' + r.maxStock + '</td>' +
                    '<td style="padding:12px 14px;text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;background:' + stBg + ';color:' + stColor + '">' + esc(r.stockStatus).toUpperCase() + '</span>' + expBadge + '</td>' +
                    '<td style="padding:12px 14px">' + reagentLevel + '</td>' +
                    '<td style="padding:12px 14px;text-align:center;font-size:13px;font-weight:500">' + r.batchCount + '</td>' +
                    '<td style="padding:12px 14px;font-size:12px;color:var(--color-muted-foreground)">' + nearExp + '</td>' +
                    '<td style="padding:12px 14px;text-align:center">' +
                        '<div style="display:flex;gap:4px;justify-content:center">' +
                            '<button class="btn-view" data-id="' + esc(r.reagentId) + '" style="background:none;border:1px solid var(--color-border);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;color:var(--color-muted-foreground)" title="View"><i data-lucide="eye" style="width:14px;height:14px"></i></button>' +
                            '<button class="btn-adjust" data-id="' + esc(r.reagentId) + '" data-name="' + esc(r.name) + '" data-stock="' + r.currentStock + '" data-unit="' + esc(r.unit) + '" style="background:none;border:1px solid var(--color-border);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;color:var(--color-muted-foreground)" title="Adjust Stock"><i data-lucide="sliders-horizontal" style="width:14px;height:14px"></i></button>' +
                        '</div>' +
                    '</td>' +
                '</tr>'
            );
        });
        lucide.createIcons();
    }

    var searchTimer;
    $('#invSearch').on('input', function() { clearTimeout(searchTimer); searchTimer = setTimeout(loadItems, 300); });
    $('#filterStorage, #filterStockStatus, #filterAnalyzer').on('change', loadItems);

    $(document).on('click', '.cat-tab', function() {
        $('.cat-tab').removeClass('active').css({ border: '1px solid var(--color-border)', background: '#fff', color: 'var(--color-foreground)', fontWeight: '500' });
        $(this).addClass('active').css({ border: '1px solid var(--aquamint)', background: 'rgba(127,255,212,0.15)', color: 'var(--midnight-blue)', fontWeight: '600' });
        loadItems();
    });

    $(document).on('click', '.inv-row', function(e) {
        if ($(e.target).closest('button').length) return;
        openDetail($(this).data('id'));
    });
    $(document).on('click', '.btn-view', function(e) {
        e.stopPropagation();
        openDetail($(this).data('id'));
    });

    function openDetail(reagentId) {
        currentId = reagentId;
        var offcanvas = new bootstrap.Offcanvas(document.getElementById('reagentDetailSheet'));
        offcanvas.show();
        $('.detail-tab').removeClass('active').css({ 'border-bottom-color': 'transparent', color: 'var(--color-muted-foreground)' });
        $('.detail-tab[data-tab="overview"]').addClass('active').css({ 'border-bottom-color': 'var(--aquamint)', color: 'var(--aquamint)' });
        $('#detailTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)">Loading...</div>');
        $.get('/api/lab-inventory/items/' + reagentId, function(data) {
            currentData = data;
            var r = data.reagent;
            $('#detailTitle').text(r.name);
            $('#detailSub').text(r.reagent_code + ' | ' + r.manufacturer + ' | ' + r.category);
            renderOverview(r);
        });
    }

    $(document).on('click', '.detail-tab', function() {
        var tab = $(this).data('tab');
        $('.detail-tab').removeClass('active').css({ 'border-bottom-color': 'transparent', color: 'var(--color-muted-foreground)' });
        $(this).addClass('active').css({ 'border-bottom-color': 'var(--aquamint)', color: 'var(--aquamint)' });
        if (tab === 'overview') renderOverview(currentData.reagent);
        else if (tab === 'lots') renderLots();
        else if (tab === 'consumption') renderConsumption();
        else if (tab === 'transactions') renderTransactions();
        else if (tab === 'storage') renderStorage();
    });

    function infoRow(l, v) {
        return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.04)">' +
            '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(l) + '</span>' +
            '<span style="font-size:12px;font-weight:600;color:var(--color-foreground)">' + esc(String(v)) + '</span></div>';
    }

    function renderOverview(r) {
        var stBg = r.stockStatus === 'In Stock' ? '#DCFCE7' : (r.stockStatus === 'Low Stock' ? '#FFF7ED' : '#FEF2F2');
        var stColor = r.stockStatus === 'In Stock' ? '#166534' : (r.stockStatus === 'Low Stock' ? '#9a3412' : '#991B1B');

        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Item Information</div>' +
                infoRow('Code', r.reagent_code) +
                infoRow('Name', r.name) +
                infoRow('Category', r.category) +
                infoRow('Sub-Category', r.sub_category || '-') +
                infoRow('Manufacturer', r.manufacturer) +
                infoRow('Catalog #', r.catalog_number || '-') +
                infoRow('Unit', r.unit) +
            '</div>' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Stock Summary</div>' +
                infoRow('Current Stock', r.current_stock + ' ' + r.unit) +
                infoRow('Unit Price', currency + ' ' + Number(r.unit_price).toLocaleString()) +
                infoRow('Stock Value', currency + ' ' + Number(r.stockValue).toLocaleString()) +
                '<div style="margin-top:8px"><span style="display:inline-block;padding:3px 12px;border-radius:4px;font-size:11px;font-weight:600;background:' + stBg + ';color:' + stColor + '">' + esc(r.stockStatus).toUpperCase() + '</span></div>' +
            '</div>' +
        '</div>';

        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Reorder Levels</div>' +
                infoRow('Min Stock', r.min_stock + ' ' + r.unit) +
                infoRow('Max Stock', r.max_stock + ' ' + r.unit) +
                infoRow('Reorder Point', r.reorder_point + ' ' + r.unit) +
                infoRow('Auto-Reorder', r.auto_reorder ? 'Enabled' : 'Disabled') +
            '</div>' +
            '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Storage & Analyzer</div>' +
                infoRow('Storage Condition', r.storage_condition) +
                infoRow('Temperature', r.storage_temp_range || '-') +
                infoRow('Location', r.storage_location || '-') +
                infoRow('Analyzer', r.analyzer_name || 'N/A') +
            '</div>' +
        '</div>';

        if (r.tests_per_kit) {
            var pct = r.tests_per_kit > 0 ? Math.round((r.remaining_tests / r.tests_per_kit) * 100) : 0;
            var pctColor = pct > 50 ? '#22c55e' : (pct > 20 ? '#f97316' : '#ef4444');
            html += '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Reagent Consumption</div>' +
                '<div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">' +
                    '<div style="flex:1;height:10px;border-radius:5px;background:#e5e7eb;overflow:hidden"><div style="width:' + pct + '%;height:100%;border-radius:5px;background:' + pctColor + '"></div></div>' +
                    '<span style="font-size:16px;font-weight:700;color:' + pctColor + '">' + pct + '%</span>' +
                '</div>' +
                infoRow('Remaining Tests', r.remaining_tests + ' / ' + r.tests_per_kit) +
                (pct < 20 ? '<div style="margin-top:8px;padding:8px 12px;background:#FEF2F2;border-radius:6px;border:1px solid #FECACA;font-size:12px;color:#991B1B"><i data-lucide="alert-circle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i>Auto-reorder triggered: less than 20% remaining</div>' : '') +
            '</div>';
        }

        $('#detailTabContent').html(html);
        lucide.createIcons();
    }

    function renderLots() {
        $('#detailTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)">Loading lots...</div>');
        $.get('/api/lab-inventory/batches/' + currentId, function(batches) {
            if (!batches || batches.length === 0) {
                $('#detailTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="package" style="width:32px;height:32px;display:block;margin:0 auto 8px;opacity:0.4"></i>No lot/batch records found</div>');
                lucide.createIcons();
                return;
            }

            var fifo = batches.find(function(b) { return b.currentQty > 0 && b.daysToExpiry > 0; });
            var html = '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Lot / Batch Tracking</div>';

            batches.forEach(function(b) {
                var expColor = b.daysToExpiry > 180 ? '#22c55e' : (b.daysToExpiry > 90 ? '#eab308' : (b.daysToExpiry > 0 ? '#f97316' : '#ef4444'));
                var qcBadge = b.qcVerified
                    ? '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#DCFCE7;color:#166534"><i data-lucide="check-circle" style="width:10px;height:10px;vertical-align:-1px"></i> QC Verified</span>'
                    : '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#FEF9C3;color:#854d0e">QC Pending</span>';

                html += '<div style="padding:14px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:10px' + (fifo && fifo.batchId === b.batchId ? ';border-color:var(--aquamint);border-width:2px' : '') + '">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
                        '<div>' +
                            '<span style="font-size:14px;font-weight:700;font-family:monospace;color:var(--color-foreground)">' + esc(b.lotNumber) + '</span>' +
                            '<span style="font-size:11px;color:var(--color-muted-foreground);margin-left:8px">Batch: ' + esc(b.batchNumber) + '</span>' +
                            (fifo && fifo.batchId === b.batchId ? ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:rgba(127,255,212,0.2);color:var(--midnight-blue);margin-left:6px">FIFO NEXT</span>' : '') +
                        '</div>' +
                        '<div>' + qcBadge + '</div>' +
                    '</div>' +
                    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' +
                        '<div><div style="font-size:10px;color:var(--color-muted-foreground)">Received</div><div style="font-size:12px;font-weight:500">' + new Date(b.receivedDate).toLocaleDateString('en-PK', { day:'2-digit', month:'short', year:'numeric' }) + '</div></div>' +
                        '<div><div style="font-size:10px;color:var(--color-muted-foreground)">Expiry</div><div style="font-size:12px;font-weight:500;color:' + expColor + '">' + new Date(b.expiryDate).toLocaleDateString('en-PK', { month:'short', year:'numeric' }) + ' (' + b.daysToExpiry + 'd)</div></div>' +
                        '<div><div style="font-size:10px;color:var(--color-muted-foreground)">Qty</div><div style="font-size:12px;font-weight:600">' + b.currentQty + ' / ' + b.qtyReceived + '</div></div>' +
                        '<div><div style="font-size:10px;color:var(--color-muted-foreground)">Supplier</div><div style="font-size:12px;font-weight:500">' + esc(b.supplier) + '</div></div>' +
                    '</div>' +
                    (b.qcVerified ? '<div style="margin-top:8px;padding:6px 10px;background:rgba(34,197,94,0.05);border-radius:6px;font-size:11px;color:var(--color-muted-foreground)">Verified by ' + esc(b.qcVerifiedBy) + (b.qcNotes ? ' — ' + esc(b.qcNotes) : '') + '</div>' : '') +
                    (b.linkedResults && b.linkedResults.length > 0 ? '<div style="margin-top:6px;font-size:11px;color:var(--aquamint)"><i data-lucide="link" style="width:11px;height:11px;vertical-align:-1px"></i> Linked to ' + b.linkedResults.length + ' test results</div>' : '') +
                '</div>';
            });

            if (fifo) {
                html += '<div style="margin-top:12px;padding:12px 16px;background:#EFF6FF;border-radius:8px;border:1px solid #BFDBFE;display:flex;align-items:center;gap:8px">' +
                    '<i data-lucide="info" style="width:16px;height:16px;color:#2563eb"></i>' +
                    '<span style="font-size:13px;color:#1e40af"><strong>FIFO:</strong> Lot ' + esc(fifo.lotNumber) + ' (Batch ' + esc(fifo.batchNumber) + ') will be used next</span></div>';
            }

            html += '<div style="margin-top:12px;padding:12px 16px;background:#FFFBEB;border-radius:8px;border:1px solid #FDE68A;display:flex;align-items:center;gap:8px">' +
                '<i data-lucide="alert-triangle" style="width:16px;height:16px;color:#D97706"></i>' +
                '<span style="font-size:13px;color:#92400e">Lot change triggers QC re-run requirement for traceability</span></div>';

            $('#detailTabContent').html(html);
            lucide.createIcons();
        });
    }

    function renderConsumption() {
        $('#detailTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)">Loading consumption data...</div>');
        $.get('/api/lab-inventory/consumption/' + currentId, function(data) {
            var html = '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:16px;letter-spacing:0.05em">Consumption Analytics</div>';

            html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">' +
                '<div style="padding:14px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);text-align:center">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:4px">Avg Daily Usage</div>' +
                    '<div style="font-size:22px;font-weight:700;color:var(--color-foreground);font-family:\'Roobert\',sans-serif">' + data.avgDailyUsage + '</div>' +
                '</div>' +
                '<div style="padding:14px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);text-align:center">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:4px">Days Remaining</div>' +
                    '<div style="font-size:22px;font-weight:700;color:' + (data.daysRemaining !== null && data.daysRemaining < 14 ? '#ef4444' : 'var(--color-foreground)') + ';font-family:\'Roobert\',sans-serif">' + (data.daysRemaining !== null ? data.daysRemaining : 'N/A') + '</div>' +
                '</div>' +
                '<div style="padding:14px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);text-align:center">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:4px">Remaining Tests</div>' +
                    '<div style="font-size:22px;font-weight:700;color:var(--color-foreground);font-family:\'Roobert\',sans-serif">' + (data.remainingTests !== null ? data.remainingTests : 'N/A') + '</div>' +
                '</div>' +
            '</div>';

            if (data.remainingPct !== null) {
                var pctColor = data.remainingPct > 50 ? '#22c55e' : (data.remainingPct > 20 ? '#f97316' : '#ef4444');
                html += '<div style="margin-bottom:20px;padding:14px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;color:var(--color-muted-foreground)">Kit Remaining</span><span style="font-size:14px;font-weight:700;color:' + pctColor + '">' + data.remainingPct + '%</span></div>' +
                    '<div style="height:12px;border-radius:6px;background:#e5e7eb;overflow:hidden"><div style="width:' + data.remainingPct + '%;height:100%;border-radius:6px;background:' + pctColor + ';transition:width 0.3s"></div></div>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">' + data.remainingTests + ' of ' + data.testsPerKit + ' tests remaining</div>' +
                    (data.remainingPct < 20 ? '<div style="margin-top:8px;padding:8px 10px;background:#FEF2F2;border-radius:6px;border:1px solid #FECACA;font-size:12px;color:#991B1B"><i data-lucide="alert-circle" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"></i>Below 20% — auto-reorder triggered</div>' : '') +
                '</div>';
            }

            html += '<div style="margin-bottom:12px;font-size:12px;font-weight:600;color:var(--color-foreground)">Monthly Usage (6 months)</div>' +
                '<div style="height:200px"><canvas id="consumptionChart"></canvas></div>';

            $('#detailTabContent').html(html);
            lucide.createIcons();

            if (consumptionChart) { consumptionChart.destroy(); consumptionChart = null; }
            var ctx = document.getElementById('consumptionChart');
            if (ctx && data.monthlyUsage) {
                consumptionChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.monthlyUsage.map(function(m) { return m.month; }),
                        datasets: [{
                            label: 'Usage',
                            data: data.monthlyUsage.map(function(m) { return m.usage; }),
                            backgroundColor: 'rgba(127,255,212,0.4)',
                            borderColor: 'var(--aquamint)',
                            borderWidth: 1,
                            borderRadius: 4,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }
        });
    }

    function renderTransactions() {
        $('#detailTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)">Loading transactions...</div>');
        $.get('/api/lab-inventory/transactions/' + currentId, function(txns) {
            if (!txns || txns.length === 0) {
                $('#detailTabContent').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="history" style="width:32px;height:32px;display:block;margin:0 auto 8px;opacity:0.4"></i>No transactions recorded</div>');
                lucide.createIcons();
                return;
            }

            var html = '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Transaction History</div>';

            txns.forEach(function(t) {
                var isIn = t.quantity > 0;
                var iconColor = isIn ? '#22c55e' : '#ef4444';
                var qtyLabel = (isIn ? '+' : '') + t.quantity;

                html += '<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--color-border)">' +
                    '<div style="flex-shrink:0;width:36px;height:36px;border-radius:8px;background:' + (isIn ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)') + ';display:flex;align-items:center;justify-content:center">' +
                        '<i data-lucide="' + (isIn ? 'arrow-down-circle' : 'arrow-up-circle') + '" style="width:18px;height:18px;color:' + iconColor + '"></i>' +
                    '</div>' +
                    '<div style="flex:1">' +
                        '<div style="display:flex;justify-content:space-between;margin-bottom:2px">' +
                            '<span style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(t.type) + '</span>' +
                            '<span style="font-size:13px;font-weight:700;color:' + iconColor + ';font-family:monospace">' + qtyLabel + '</span>' +
                        '</div>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(t.reason || '') + '</div>' +
                        '<div style="display:flex;justify-content:space-between;margin-top:4px">' +
                            '<span style="font-size:11px;color:var(--color-muted-foreground)">' + esc(t.performedBy || '') + '</span>' +
                            '<span style="font-size:11px;color:var(--color-muted-foreground)">Balance: ' + t.balanceAfter + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            });

            $('#detailTabContent').html(html);
            lucide.createIcons();
        });
    }

    function renderStorage() {
        var r = currentData.reagent;
        var condColors = {
            'Room Temperature': { bg: '#FEF3C7', color: '#D97706', icon: 'thermometer' },
            'Refrigerated': { bg: '#DBEAFE', color: '#2563EB', icon: 'snowflake' },
            'Frozen': { bg: '#E0E7FF', color: '#4F46E5', icon: 'cloud-snow' },
            'Ultra-Frozen': { bg: '#EDE9FE', color: '#7C3AED', icon: 'zap' }
        };
        var cc = condColors[r.storage_condition] || { bg: '#F1F5F9', color: '#64748B', icon: 'thermometer' };

        var html = '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:16px;letter-spacing:0.05em">Storage Requirements</div>';

        html += '<div style="padding:20px;background:' + cc.bg + ';border-radius:12px;border:2px solid ' + cc.color + ';margin-bottom:16px;text-align:center">' +
            '<i data-lucide="' + cc.icon + '" style="width:32px;height:32px;color:' + cc.color + ';margin-bottom:8px"></i>' +
            '<div style="font-size:18px;font-weight:700;color:' + cc.color + ';font-family:\'Roobert\',sans-serif">' + esc(r.storage_condition) + '</div>' +
            '<div style="font-size:14px;color:' + cc.color + ';margin-top:4px">' + esc(r.storage_temp_range || '') + '</div>' +
        '</div>';

        html += '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:16px">' +
            '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Location Details</div>' +
            infoRow('Storage Location', r.storage_location || 'Not assigned') +
            infoRow('Condition', r.storage_condition) +
            infoRow('Temperature Range', r.storage_temp_range || '-') +
            infoRow('Status', r.status) +
        '</div>';

        html += '<div style="padding:16px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border)">' +
            '<div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px;letter-spacing:0.05em">Storage Guidelines</div>' +
            '<ul style="margin:0;padding:0 0 0 16px;font-size:12px;color:var(--color-foreground);line-height:1.8">';

        if (r.storage_condition === 'Room Temperature') {
            html += '<li>Store between 15-25°C in dry location</li><li>Protect from direct sunlight</li><li>Keep away from heat sources</li><li>Monitor ambient temperature daily</li>';
        } else if (r.storage_condition === 'Refrigerated') {
            html += '<li>Store between 2-8°C in laboratory refrigerator</li><li>Do not freeze — freezing may damage reagent</li><li>Check fridge temperature twice daily</li><li>Keep temperature log updated</li>';
        } else if (r.storage_condition === 'Frozen') {
            html += '<li>Store at -20°C in dedicated freezer</li><li>Avoid repeated freeze-thaw cycles</li><li>Aliquot if multiple uses needed</li><li>Label with date when first thawed</li>';
        } else {
            html += '<li>Store at -80°C in ultra-low temperature freezer</li><li>Handle with cryogenic gloves</li><li>Minimize door opening frequency</li><li>Ensure backup power supply for freezer</li>';
        }
        html += '</ul></div>';

        $('#detailTabContent').html(html);
        lucide.createIcons();
    }

    $(document).on('click', '.btn-adjust', function(e) {
        e.stopPropagation();
        adjustId = $(this).data('id');
        adjustStock = parseInt($(this).data('stock'));
        $('#adjName').text($(this).data('name'));
        $('#adjCurrentStock').text(adjustStock + ' ' + $(this).data('unit'));
        $('input[name="adjType"][value="increase"]').prop('checked', true);
        $('#adjQuantity').val('');
        $('#adjNewStock').text('--');
        $('#adjReason').val('');
        $('#adjOtherWrap').hide();
        $('#adjOtherReason').val('');
        $('#adjNotes').val('');
        var modal = new bootstrap.Modal(document.getElementById('stockAdjustModal'));
        modal.show();
        lucide.createIcons();
    });

    $('#adjQuantity').on('input', calcNew);
    $('input[name="adjType"]').on('change', calcNew);
    function calcNew() {
        var qty = parseInt($('#adjQuantity').val()) || 0;
        var type = $('input[name="adjType"]:checked').val();
        var n;
        if (type === 'increase') n = adjustStock + qty;
        else if (type === 'decrease') n = Math.max(0, adjustStock - qty);
        else n = qty;
        $('#adjNewStock').text(n);
    }

    $('#adjReason').on('change', function() {
        if ($(this).val() === 'Other') $('#adjOtherWrap').show(); else $('#adjOtherWrap').hide();
    });

    $('#btnConfirmAdjust').on('click', function() {
        var reason = $('#adjReason').val();
        if (reason === 'Other') reason = $('#adjOtherReason').val();
        if (!reason) { HMS.toast('Please select a reason', 'warning'); return; }
        var qty = parseInt($('#adjQuantity').val());
        if (isNaN(qty) || qty < 0) { HMS.toast('Please enter a valid quantity', 'warning'); return; }

        var $btn = $(this);
        $btn.prop('disabled', true).text('Processing...');

        $.ajax({
            url: '/api/lab-inventory/adjust',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                reagentId: adjustId,
                adjustmentType: $('input[name="adjType"]:checked').val(),
                quantity: qty,
                reason: reason,
                notes: $('#adjNotes').val()
            }),
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: function() {
                bootstrap.Modal.getInstance(document.getElementById('stockAdjustModal')).hide();
                loadStats();
                loadStorage();
                loadItems();
                if (currentId === adjustId) openDetail(adjustId);
            },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed'); },
            complete: function() { $btn.prop('disabled', false).text('Confirm Adjustment'); }
        });
    });

    $('#btnTempLog').on('click', function() {
        var html = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">' +
            '<thead><tr style="background:var(--color-background)">' +
                '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Equipment</th>' +
                '<th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Target</th>' +
                '<th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Current</th>' +
                '<th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Status</th>' +
                '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Last Check</th>' +
            '</tr></thead><tbody>';

        var logs = [
            { eq: 'Fridge A (Hematology)', target: '2-8°C', current: '4.2°C', ok: true, time: '10 min ago' },
            { eq: 'Fridge B (Chemistry)', target: '2-8°C', current: '5.8°C', ok: true, time: '10 min ago' },
            { eq: 'Fridge C (Immunology)', target: '2-8°C', current: '3.1°C', ok: true, time: '10 min ago' },
            { eq: 'Freezer F-1 (QC Materials)', target: '-20°C', current: '-18.5°C', ok: true, time: '15 min ago' },
            { eq: 'Freezer F-2 (Coagulation)', target: '-20°C', current: '-19.2°C', ok: true, time: '15 min ago' },
            { eq: 'Ultra-Freezer J-1 (Molecular)', target: '-80°C', current: '-78.8°C', ok: true, time: '20 min ago' },
        ];

        logs.forEach(function(l) {
            html += '<tr style="border-bottom:1px solid var(--color-border)">' +
                '<td style="padding:10px 12px;font-weight:500">' + l.eq + '</td>' +
                '<td style="padding:10px 12px;text-align:center;font-family:monospace">' + l.target + '</td>' +
                '<td style="padding:10px 12px;text-align:center;font-family:monospace;font-weight:600">' + l.current + '</td>' +
                '<td style="padding:10px 12px;text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;background:' + (l.ok ? '#DCFCE7' : '#FEF2F2') + ';color:' + (l.ok ? '#166534' : '#991B1B') + '">' + (l.ok ? 'NORMAL' : 'ALARM') + '</span></td>' +
                '<td style="padding:10px 12px;font-size:12px;color:var(--color-muted-foreground)">' + l.time + '</td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        $('#tempLogContent').html(html);
        var modal = new bootstrap.Modal(document.getElementById('tempLogModal'));
        modal.show();
        lucide.createIcons();
    });

    $('#btnAlarmHistory').on('click', function() {
        var alarms = [
            { time: 'Today, 03:42 AM', eq: 'Fridge B (Chemistry)', type: 'Temperature High', detail: 'Temperature reached 9.1°C (threshold: 8°C)', resolved: true, resolvedBy: 'Lab Tech. Amir', resolvedAt: 'Today, 03:58 AM' },
            { time: 'Yesterday, 11:20 PM', eq: 'Ultra-Freezer J-1', type: 'Power Fluctuation', detail: 'Brief power interruption detected, backup engaged', resolved: true, resolvedBy: 'System', resolvedAt: 'Yesterday, 11:22 PM' },
            { time: '3 days ago', eq: 'Freezer F-1', type: 'Door Open', detail: 'Door left open for >5 minutes', resolved: true, resolvedBy: 'Lab Tech. Sarah', resolvedAt: '3 days ago' },
        ];

        var html = '';
        alarms.forEach(function(a) {
            html += '<div style="padding:14px;background:var(--color-background);border-radius:10px;border:1px solid var(--color-border);margin-bottom:10px">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
                    '<div style="display:flex;align-items:center;gap:8px">' +
                        '<i data-lucide="bell-ring" style="width:16px;height:16px;color:#ef4444"></i>' +
                        '<span style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + a.type + '</span>' +
                    '</div>' +
                    '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:' + (a.resolved ? '#DCFCE7' : '#FEF2F2') + ';color:' + (a.resolved ? '#166534' : '#991B1B') + '">' + (a.resolved ? 'RESOLVED' : 'ACTIVE') + '</span>' +
                '</div>' +
                '<div style="font-size:12px;color:var(--color-muted-foreground);margin-bottom:4px">' + a.eq + ' — ' + a.time + '</div>' +
                '<div style="font-size:12px;color:var(--color-foreground)">' + a.detail + '</div>' +
                (a.resolved ? '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:6px">Resolved by ' + a.resolvedBy + ' at ' + a.resolvedAt + '</div>' : '') +
            '</div>';
        });

        $('#alarmContent').html(html);
        var modal = new bootstrap.Modal(document.getElementById('alarmModal'));
        modal.show();
        lucide.createIcons();
    });
});
