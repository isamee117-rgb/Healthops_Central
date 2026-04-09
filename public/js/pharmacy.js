$(document).ready(function() {
    var MEDICINES = [];
    var CATEGORIES = [];
    var cart = [];
    var activeCategory = 'All';
    var searchQuery = '';
    var viewMode = 'grid';
    var paymentMethod = 'cash';
    var discountPercent = 0;
    var selectedMedicine = null;
    var customerType = 'walkin';
    var walkinName = '';
    var walkinPhone = '';
    var regularSource = '';
    var regularMrn = '';
    var regularVisitId = '';
    var regularPatientName = '';
    var allVisits = [];
    var allMrns = [];

    function loadMedicines() {
        $.get('/api/inventory/medicines', function(data) {
            MEDICINES = (data || []).map(function(m) {
                return {
                    id: m.medicineId,
                    name: m.name || (m.brandName + ' ' + m.strength),
                    genericName: m.genericName || '',
                    brand: m.manufacturer || '',
                    category: m.category || 'Uncategorized',
                    stock: m.currentStock || 0,
                    stockUnit: m.stockUnit || 'units',
                    expiryDate: m.nearestExpiry || '-',
                    pricePerUnit: m.sellingPrice || 0,
                    pricePerPack: m.sellingPrice || 0,
                    unitsPerPack: 1,
                    packType: m.stockUnit || 'unit',
                    form: m.form || '',
                    strength: m.strength || '',
                    batchCount: m.batchCount || 0,
                    requiresPrescription: false
                };
            });
            renderMedicines();
        });
        $.get('/api/inventory/filters', function(data) {
            CATEGORIES = data.categories || [];
            renderCategories();
        });
    }

    function renderCategories() {
        var scroll = $('#categoryScroll');
        var html = '<button class="category-btn active" data-category="All">All Medicines</button>';
        CATEGORIES.forEach(function(cat) {
            html += '<button class="category-btn" data-category="' + esc(cat) + '">' + esc(cat) + '</button>';
        });
        scroll.html(html);
        lucide.createIcons();
    }

    function esc(str) {
        if (!str) return '';
        return $('<div>').text(str).html();
    }

    function getFilteredMedicines() {
        return MEDICINES.filter(function(m) {
            var matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              m.genericName.toLowerCase().includes(searchQuery.toLowerCase());
            var matchCategory = activeCategory === 'All' || m.category === activeCategory;
            return matchSearch && matchCategory;
        });
    }

    function getStockBadge(stock) {
        if (stock > 50) return '<span class="stock-badge in-stock">In Stock: ' + stock + '</span>';
        if (stock > 10) return '<span class="stock-badge low-stock">Low Stock: ' + stock + '</span>';
        if (stock <= 0) return '<span class="stock-badge critical">Out of Stock</span>';
        return '<span class="stock-badge critical">Critical: ' + stock + '</span>';
    }

    function renderMedicines() {
        var filtered = getFilteredMedicines();
        var area = $('#medicineArea');

        if (filtered.length === 0) {
            area.html(
                '<div class="medicine-empty">' +
                    '<i data-lucide="search"></i>' +
                    '<h4>No medicines found</h4>' +
                    '<p>Try a different search or category</p>' +
                '</div>'
            );
            lucide.createIcons();
            return;
        }

        if (viewMode === 'grid') {
            var html = '<div class="medicine-grid">';
            filtered.forEach(function(med) {
                html += '<div class="med-card" data-med-id="' + esc(med.id) + '">' +
                    '<div class="med-card-top">' +
                        '<div class="med-icon-box"><i data-lucide="pill" style="width:24px;height:24px"></i></div>' +
                        getStockBadge(med.stock) +
                    '</div>' +
                    '<div class="med-card-info">' +
                        '<h3>' + esc(med.name) + '</h3>' +
                        '<p class="generic">' + esc(med.genericName) + '</p>' +
                        '<p class="meta">' + esc(med.brand) + (med.form ? ' &bull; ' + esc(med.form) : '') + '</p>' +
                    '</div>' +
                    '<div class="med-card-bottom">' +
                        '<div><span class="price-label">Price</span><div class="price">PKR ' + med.pricePerPack.toLocaleString() + '</div></div>' +
                        (med.stock > 0 ? '<button class="btn-add-cart" data-add-id="' + esc(med.id) + '" onclick="event.stopPropagation()"><i data-lucide="plus" style="width:14px;height:14px"></i> Add</button>' : '<span style="font-size:11px;color:#b91c1c;font-weight:600">Unavailable</span>') +
                    '</div>' +
                '</div>';
            });
            html += '</div>';
            area.html(html);
        } else {
            var html = '<div class="medicine-list-view">';
            filtered.forEach(function(med) {
                html += '<div class="list-item" data-med-id="' + esc(med.id) + '">' +
                    '<div class="list-item-left">' +
                        '<div class="icon-box"><i data-lucide="pill" style="width:20px;height:20px"></i></div>' +
                        '<div>' +
                            '<h3>' + esc(med.name) + '</h3>' +
                            '<span class="sub">' + esc(med.genericName) + ' &bull; ' + med.stock + ' in stock</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="list-item-right">' +
                        '<div class="price"><strong>PKR ' + med.pricePerPack.toLocaleString() + '</strong><small>Per ' + esc(med.packType) + '</small></div>' +
                        (med.stock > 0 ? '<button class="btn-add-cart" data-add-id="' + esc(med.id) + '" onclick="event.stopPropagation()">Add to Cart</button>' : '<span style="font-size:11px;color:#b91c1c;font-weight:600">Unavailable</span>') +
                    '</div>' +
                '</div>';
            });
            html += '</div>';
            area.html(html);
        }
        lucide.createIcons();
    }

    function addToCart(medId) {
        var med = MEDICINES.find(function(m) { return m.id === medId; });
        if (!med || med.stock <= 0) return;
        var existing = cart.find(function(c) { return c.medicineId === medId; });
        if (existing) {
            if (existing.quantity >= existing.stock) {
                _showStockWarn(existing.name, existing.stock);
                return;
            }
            existing.quantity += 1;
            existing.totalPrice = existing.quantity * existing.unitPrice;
        } else {
            cart.push({
                medicineId: med.id,
                name:       med.name,
                genericName:med.genericName,
                quantity:   1,
                unitPrice:  med.pricePerPack,
                totalPrice: med.pricePerPack,
                packType:   med.packType,
                stock:      med.stock          /* available stock ceiling */
            });
        }
        renderCart();
        updateBill();
    }

    function removeFromCart(medId) {
        cart = cart.filter(function(c) { return c.medicineId !== medId; });
        renderCart();
        updateBill();
    }

    var _stockWarnTimer = null;
    function _showStockWarn(name, max) {
        clearTimeout(_stockWarnTimer);
        var $w = $('#posStockWarn');
        if (!$w.length) {
            $('body').append('<div id="posStockWarn" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:500;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.25);pointer-events:none;white-space:nowrap"></div>');
            $w = $('#posStockWarn');
        }
        $w.text('Only ' + max + ' ' + (name ? '"' + name + '"' : 'units') + ' available in stock').fadeIn(150);
        _stockWarnTimer = setTimeout(function() { $w.fadeOut(300); }, 2500);
    }

    function updateQuantity(medId, qty) {
        if (qty < 1) return;
        var item = cart.find(function(c) { return c.medicineId === medId; });
        if (!item) return;
        if (item.stock && qty > item.stock) {
            _showStockWarn(item.name, item.stock);
            qty = item.stock;
        }
        item.quantity = qty;
        item.totalPrice = qty * item.unitPrice;
        renderCart();
        updateBill();
    }

    function renderCart() {
        var container = $('#cartItems');
        $('#cartCount').text('(' + cart.length + ' items)');

        if (cart.length === 0) {
            container.html(
                '<div class="cart-empty" id="cartEmpty">' +
                    '<i data-lucide="shopping-cart"></i>' +
                    '<p style="font-weight:500">Cart is empty</p>' +
                    '<p class="hint">Select medicines from the left to add them to bill</p>' +
                '</div>'
            );
            $('#btnClearCart').hide();
            $('#btnCompleteSale').prop('disabled', true);
            lucide.createIcons();
            return;
        }

        $('#btnClearCart').show();
        $('#btnCompleteSale').prop('disabled', false);

        var html = '';
        cart.forEach(function(item) {
            var rxBadge = item.rxNote
                ? '<div style="font-size:10px;color:#7c3aed;margin-top:2px;display:flex;align-items:center;gap:3px">' +
                    '<i data-lucide="pill" style="width:10px;height:10px;flex-shrink:0"></i>' +
                    '<span>' + esc(item.rxNote) + '</span>' +
                  '</div>'
                : '';
            html += '<div class="cart-item">' +
                '<div class="cart-item-info">' +
                    '<h4>' + esc(item.name) + '</h4>' +
                    '<span class="qty-price">' + item.quantity + ' x ' + esc(item.packType) + ' @ PKR ' + item.unitPrice.toLocaleString() + '</span>' +
                    rxBadge +
                '</div>' +
                '<div class="cart-item-controls">' +
                    '<div class="qty-stepper">' +
                        '<button data-qty-dec="' + esc(item.medicineId) + '"><i data-lucide="minus" style="width:12px;height:12px"></i></button>' +
                        '<input class="qty-val qty-input" type="number" min="1" data-qty-input="' + esc(item.medicineId) + '" value="' + item.quantity + '">' +
                        '<button data-qty-inc="' + esc(item.medicineId) + '"><i data-lucide="plus" style="width:12px;height:12px"></i></button>' +
                    '</div>' +
                    '<div class="cart-item-total"><strong>PKR ' + item.totalPrice.toLocaleString() + '</strong></div>' +
                '</div>' +
                '<button class="cart-item-remove" data-remove-id="' + esc(item.medicineId) + '"><i data-lucide="x" style="width:14px;height:14px"></i></button>' +
            '</div>';
        });
        container.html(html);
        lucide.createIcons();
    }

    function updateBill() {
        var subtotal = cart.reduce(function(acc, item) { return acc + item.totalPrice; }, 0);
        var discountAmount = (subtotal * discountPercent) / 100;
        var total = subtotal - discountAmount;

        $('#billSubtotal').text('PKR ' + subtotal.toLocaleString());
        if (discountPercent > 0) {
            $('#billDiscount').text('- PKR ' + discountAmount.toLocaleString() + ' (' + discountPercent + '%)');
        } else {
            $('#billDiscount').text('-');
        }
        $('#billTotal').text('PKR ' + total.toLocaleString());
    }

    function showMedicineDetail(medId) {
        var med = MEDICINES.find(function(m) { return m.id === medId; });
        if (!med) return;
        selectedMedicine = med;

        $('#modalMedName').text(med.name);
        $('#modalMedSub').text(med.genericName + ' \u2022 ' + med.brand);

        var body = '<div class="medicine-detail-grid">' +
            '<div class="detail-section">' +
                '<h4>Product Details</h4>' +
                '<div class="detail-grid">' +
                    '<span class="dlabel">Category:</span><span class="dvalue">' + esc(med.category) + '</span>' +
                    '<span class="dlabel">Form:</span><span class="dvalue">' + esc(med.form || '-') + '</span>' +
                    '<span class="dlabel">Strength:</span><span class="dvalue">' + esc(med.strength || '-') + '</span>' +
                    '<span class="dlabel">Batches:</span><span class="dvalue">' + med.batchCount + '</span>' +
                    '<span class="dlabel">Expiry:</span><span class="dvalue expiry">' + esc(med.expiryDate) + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="detail-section">' +
                '<h4>Stock & Pricing</h4>' +
                '<div class="stock-pricing-card">' +
                    '<div class="sp-row">' +
                        '<span class="sp-label">Current Stock</span>' +
                        '<span class="sp-value stock-val">' + med.stock + ' ' + esc(med.stockUnit) + '</span>' +
                    '</div>' +
                    '<div class="sp-row">' +
                        '<span class="sp-label">Selling Price</span>' +
                        '<span class="sp-value">PKR ' + med.pricePerPack.toLocaleString() + '</span>' +
                    '</div>' +
                '</div>';

        if (med.requiresPrescription) {
            body += '<div class="rx-warning">' +
                '<i data-lucide="alert-circle" style="width:20px;height:20px;flex-shrink:0"></i>' +
                '<span>This medicine requires a valid prescription before dispensing</span>' +
            '</div>';
        }

        body += '</div></div>';

        $('#modalMedBody').html(body);
        lucide.createIcons();
        new bootstrap.Modal(document.getElementById('medicineDetailModal')).show();
    }

    function renderRegularContent() {
        var html = '';
        if (!regularSource) {
            html = '<div style="display:flex;gap:8px;margin-bottom:12px">' +
                '<button class="pos-source-btn" data-source="OPD" style="flex:1;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:6px"><i data-lucide="stethoscope" style="width:16px;height:16px"></i> OPD</button>' +
                '<button class="pos-source-btn" data-source="ER" style="flex:1;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:6px"><i data-lucide="siren" style="width:16px;height:16px"></i> Emergency</button>' +
            '</div>' +
            '<p style="font-size:12px;color:#94a3b8;text-align:center;margin:0">Select department to fetch patient prescriptions</p>';
        } else if (regularSource === 'ER') {
            html = '<div style="padding:12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;display:flex;align-items:center;gap:10px">' +
                '<i data-lucide="construction" style="width:20px;height:20px;color:#ea580c"></i>' +
                '<div><div style="font-size:13px;font-weight:600;color:#9a3412">Emergency Integration</div><div style="font-size:12px;color:#c2410c">Coming soon - use Walk-in for ER patients</div></div>' +
            '</div>' +
            '<button class="pos-back-btn" style="margin-top:8px;padding:6px 12px;border:none;background:transparent;color:#64748b;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px"><i data-lucide="arrow-left" style="width:12px;height:12px"></i> Back</button>';
        } else if (regularSource === 'OPD') {
            html = '<div style="margin-bottom:8px">' +
                '<label style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;display:block">Search Patient MRN</label>' +
                '<div style="position:relative">' +
                    '<input type="text" id="posMrnSearch" placeholder="Search by MRN or patient name..." style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;background:#fff">' +
                    '<div class="pos-mrn-dropdown" id="posMrnDropdown" style="display:none;position:absolute;top:100%;left:0;right:0;max-height:200px;overflow-y:auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:100;margin-top:2px"></div>' +
                '</div>' +
            '</div>';

            if (regularMrn) {
                html += '<div style="margin-bottom:8px">' +
                    '<label style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;display:block">Select Visit</label>' +
                    '<select id="posVisitSelect" style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;background:#fff">' +
                        '<option value="">-- Select Visit ID --</option>' +
                    '</select>' +
                '</div>';
            }

            if (regularVisitId) {
                html += '<div id="posRxStatus" style="padding:10px 12px;background:#dcfce7;border:1px solid #bbf7d0;border-radius:8px;display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
                    '<i data-lucide="check-circle" style="width:16px;height:16px;color:#16a34a"></i>' +
                    '<span style="font-size:12px;font-weight:600;color:#166534">Prescription loaded to cart</span>' +
                '</div>';
            }

            html += '<button class="pos-back-btn" style="margin-top:4px;padding:6px 12px;border:none;background:transparent;color:#64748b;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px"><i data-lucide="arrow-left" style="width:12px;height:12px"></i> Back</button>';
        }

        $('#customerRegular').html(html);
        lucide.createIcons();
    }

    function loadMrnList() {
        $.get('/api/opd/visits', function(data) {
            allVisits = data || [];
            var seen = {};
            allMrns = [];
            allVisits.forEach(function(v) {
                if (!seen[v.mrn]) {
                    seen[v.mrn] = true;
                    allMrns.push({ mrn: v.mrn, patientName: v.patientName });
                }
            });
        });
    }

    function calcRxQty(rx) {
        var dose = parseFloat(rx.dose);
        var tpd  = parseInt(rx.timesPerDay);
        var dur  = parseInt(rx.duration);
        if (!isNaN(dose) && dose > 0 && !isNaN(tpd) && tpd > 0 && !isNaN(dur) && dur > 0) {
            return dose * tpd * dur;
        }
        return null;
    }

    function rxNoteStr(rx) {
        var qty = calcRxQty(rx);
        var parts = [];
        if (rx.dose) parts.push(rx.dose + (rx.unit ? ' ' + rx.unit : ''));
        if (rx.frequency) parts.push(rx.frequency);
        if (rx.duration) parts.push(rx.duration);
        var base = parts.join(' \u00B7 ');
        if (qty !== null) {
            base += ' \u2192 ' + qty + ' ' + (rx.unit || 'unit(s)');
        }
        return base;
    }

    function loadPrescription(visitId) {
        $.get('/api/opd/consultations', function(data) {
            var consultation = (data || []).find(function(c) { return c.visitId === visitId; });
            if (consultation && consultation.prescriptions && consultation.prescriptions.length > 0) {
                cart = [];
                consultation.prescriptions.forEach(function(rx) {
                    var qty = calcRxQty(rx) || 1;
                    var note = rxNoteStr(rx);
                    var med = MEDICINES.find(function(m) { return m.id === rx.medicineId; });
                    if (med) {
                        cart.push({
                            medicineId: med.id,
                            name: med.name,
                            genericName: med.genericName,
                            quantity: qty,
                            unitPrice: med.pricePerPack,
                            totalPrice: qty * med.pricePerPack,
                            packType: med.packType,
                            rxNote: note
                        });
                    } else {
                        cart.push({
                            medicineId: rx.medicineId || 'rx-' + Math.random(),
                            name: rx.medicine,
                            genericName: '',
                            quantity: qty,
                            unitPrice: 0,
                            totalPrice: 0,
                            packType: rx.unit || 'unit',
                            rxNote: note
                        });
                    }
                });
                renderCart();
                updateBill();
                regularVisitId = visitId;
                renderRegularContent();
            } else {
                regularVisitId = '';
                renderRegularContent();
                var notice = '<div style="padding:10px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;display:flex;align-items:center;gap:8px;margin-top:8px">' +
                    '<i data-lucide="alert-circle" style="width:16px;height:16px;color:#b91c1c"></i>' +
                    '<span style="font-size:12px;color:#991b1b">No prescription found for this visit</span>' +
                '</div>';
                $('#customerRegular').append(notice);
                lucide.createIcons();
            }
        });
    }

    $('#pharmacySearch').on('input', function() {
        searchQuery = $(this).val();
        renderMedicines();
    });

    $('#categoryScroll').on('click', '.category-btn', function() {
        activeCategory = $(this).data('category');
        $('#categoryScroll .category-btn').removeClass('active');
        $(this).addClass('active');
        renderMedicines();
    });

    $('.view-toggle').on('click', 'button', function() {
        viewMode = $(this).data('view');
        $('.view-toggle button').removeClass('active');
        $(this).addClass('active');
        renderMedicines();
    });

    $('#medicineArea').on('click', '.med-card, .list-item', function() {
        var medId = $(this).data('med-id');
        addToCart(medId);
    });

    $('#medicineArea').on('click', '[data-add-id]', function(e) {
        e.stopPropagation();
        addToCart($(this).data('add-id'));
    });

    $('#cartItems').on('click', '[data-qty-dec]', function() {
        var medId = $(this).data('qty-dec');
        var item = cart.find(function(c) { return c.medicineId === medId; });
        if (item && item.quantity > 1) updateQuantity(medId, item.quantity - 1);
    });

    $('#cartItems').on('click', '[data-qty-inc]', function() {
        var medId = $(this).data('qty-inc');
        var item = cart.find(function(c) { return c.medicineId === medId; });
        if (item) updateQuantity(medId, item.quantity + 1);
    });

    $('#cartItems').on('change', '[data-qty-input]', function() {
        var medId = $(this).data('qty-input');
        var val   = parseInt($(this).val(), 10);
        if (!val || val < 1) { $(this).val(1); val = 1; }
        var item  = cart.find(function(c) { return c.medicineId === medId; });
        if (item && item.stock && val > item.stock) {
            _showStockWarn(item.name, item.stock);
            val = item.stock;
            $(this).val(val);
        }
        updateQuantity(medId, val);
    });

    $('#cartItems').on('keydown', '[data-qty-input]', function(e) {
        if (e.key === 'Enter') { $(this).trigger('change'); $(this).blur(); }
    });

    $('#cartItems').on('click', '[data-remove-id]', function() {
        removeFromCart($(this).data('remove-id'));
    });

    $('#btnClearCart').on('click', function() {
        cart = [];
        renderCart();
        updateBill();
    });

    $('.customer-tabs').on('click', 'button', function() {
        var tab = $(this).data('tab');
        customerType = tab;
        $('.customer-tabs button').removeClass('active');
        $(this).addClass('active');
        $('.customer-content .tab-pane').hide();
        if (tab === 'walkin') {
            $('#customerWalkin').show();
        } else if (tab === 'regular') {
            regularSource = '';
            regularMrn = '';
            regularVisitId = '';
            regularPatientName = '';
            $('#customerRegular').show();
            renderRegularContent();
            loadMrnList();
        } else if (tab === 'new') {
            $('#customerNew').show();
        }
    });

    $(document).on('click', '.pos-source-btn', function() {
        regularSource = $(this).data('source');
        renderRegularContent();
    });

    $(document).on('click', '.pos-back-btn', function() {
        regularSource = '';
        regularMrn = '';
        regularVisitId = '';
        regularPatientName = '';
        renderRegularContent();
    });

    $(document).on('input', '#posMrnSearch', function() {
        var q = $(this).val().toLowerCase();
        if (q.length < 1) { $('#posMrnDropdown').hide(); return; }
        var filtered = allMrns.filter(function(m) {
            return m.mrn.toLowerCase().indexOf(q) > -1 || m.patientName.toLowerCase().indexOf(q) > -1;
        });
        if (filtered.length > 0) {
            var dh = '';
            filtered.slice(0, 10).forEach(function(m) {
                dh += '<button class="pos-mrn-item" data-mrn="' + esc(m.mrn) + '" data-name="' + esc(m.patientName) + '" style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 12px;border:none;background:transparent;cursor:pointer;text-align:left;border-bottom:1px solid rgba(0,0,0,0.04);transition:background 0.15s" onmouseover="this.style.background=\'#f8f9fa\'" onmouseout="this.style.background=\'transparent\'">' +
                    '<div><div style="font-size:13px;font-weight:600">' + esc(m.patientName) + '</div></div>' +
                    '<span style="font-size:12px;color:#64748b;font-family:monospace">' + esc(m.mrn) + '</span>' +
                '</button>';
            });
            $('#posMrnDropdown').html(dh).show();
        } else {
            $('#posMrnDropdown').html('<div style="padding:10px;font-size:12px;color:#94a3b8;text-align:center">No patients found</div>').show();
        }
    });

    $(document).on('click', '.pos-mrn-item', function() {
        regularMrn = $(this).data('mrn');
        regularPatientName = $(this).data('name') || '';
        $('#posMrnSearch').val(regularPatientName + ' (' + regularMrn + ')');
        $('#posMrnDropdown').hide();
        regularVisitId = '';
        renderRegularContent();

        setTimeout(function() {
            var visits = allVisits.filter(function(v) { return v.mrn === regularMrn; });
            var sel = $('#posVisitSelect');
            sel.find('option:not(:first)').remove();
            visits.forEach(function(v) {
                var dateStr = v.consultationDate ? new Date(v.consultationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
                sel.append('<option value="' + esc(v.visitId) + '">' + esc(v.visitId) + ' - ' + esc(v.department) + ' - Dr. ' + esc(v.doctorName) + ' (' + dateStr + ')</option>');
            });
        }, 100);
    });

    $(document).on('change', '#posVisitSelect', function() {
        var visitId = $(this).val();
        if (visitId) {
            loadPrescription(visitId);
        }
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('#posMrnSearch, #posMrnDropdown').length) {
            $('#posMrnDropdown').hide();
        }
    });

    $('.payment-methods').on('click', '.pay-method-btn', function() {
        paymentMethod = $(this).data('method');
        $('.pay-method-btn').removeClass('active');
        $(this).addClass('active');
    });

    $('#discountInput').on('input', function() {
        var val = parseInt($(this).val()) || 0;
        if (val < 0) val = 0;
        if (val > 100) val = 100;
        discountPercent = val;
        updateBill();
    });


    $('#modalAddToCart').on('click', function() {
        if (selectedMedicine) {
            addToCart(selectedMedicine.id);
            bootstrap.Modal.getInstance(document.getElementById('medicineDetailModal')).hide();
        }
    });

    $('#btnCompleteSale').on('click', function() {
        if (cart.length === 0) return;
        var subtotal = cart.reduce(function(acc, item) { return acc + item.totalPrice; }, 0);
        var discountAmount = (subtotal * discountPercent) / 100;
        var total = subtotal - discountAmount;

        var isOpdSale = (customerType === 'regular' && regularSource === 'OPD' && regularMrn);
        var opdVisit = isOpdSale && regularVisitId ? allVisits.find(function(v) { return v.visitId === regularVisitId; }) : null;

        var customerInfo = '';
        if (customerType === 'walkin') {
            var wn = $('#walkinName').val() || '';
            var wp = $('#walkinPhone').val() || '';
            if (wn || wp) customerInfo = (wn || 'Walk-in') + (wp ? ' (' + wp + ')' : '');
            else customerInfo = 'Walk-in Customer';
        } else if (customerType === 'regular') {
            customerInfo = regularPatientName ? regularPatientName + ' — ' + regularMrn : (regularMrn || 'Regular Customer');
        } else {
            customerInfo = ($('#newCustName').val() || 'New Customer') + ($('#newCustPhone').val() ? ' (' + $('#newCustPhone').val() + ')' : '');
        }

        var patientCardHtml = '';
        if (isOpdSale) {
            var visitDate = opdVisit && opdVisit.consultationDate
                ? new Date(opdVisit.consultationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '';
            patientCardHtml =
                '<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:12px 14px;margin:0 0 16px;text-align:left">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
                        '<div style="width:34px;height:34px;border-radius:50%;background:#0ea5e9;display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
                            '<i data-lucide="user" style="width:16px;height:16px;color:#fff"></i>' +
                        '</div>' +
                        '<div>' +
                            '<div style="font-size:14px;font-weight:700;color:#0c4a6e">' + esc(regularPatientName || 'Patient') + '</div>' +
                            '<div style="font-size:11px;color:#0284c7;font-weight:600">MRN: ' + esc(regularMrn) + '</div>' +
                        '</div>' +
                    '</div>' +
                    (opdVisit ? (
                        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:11px">' +
                            '<div style="color:#64748b">Visit ID</div><div style="font-weight:600;color:#0c4a6e">' + esc(opdVisit.visitId) + '</div>' +
                            (opdVisit.department ? '<div style="color:#64748b">Department</div><div style="font-weight:600;color:#0c4a6e">' + esc(opdVisit.department) + '</div>' : '') +
                            (opdVisit.doctorName ? '<div style="color:#64748b">Doctor</div><div style="font-weight:600;color:#0c4a6e">Dr. ' + esc(opdVisit.doctorName) + '</div>' : '') +
                            (visitDate ? '<div style="color:#64748b">Visit Date</div><div style="font-weight:600;color:#0c4a6e">' + visitDate + '</div>' : '') +
                        '</div>'
                    ) : '<div style="font-size:11px;color:#64748b">No visit selected</div>') +
                '</div>';
        }

        var receiptHtml = '<div style="text-align:center;padding:20px">' +
            '<div style="width:64px;height:64px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
                '<i data-lucide="check-circle" style="width:32px;height:32px;color:#16a34a"></i>' +
            '</div>' +
            '<h4 style="font-size:20px;font-weight:700;margin:0 0 4px">Sale Complete!</h4>' +
            '<p style="color:#64748b;font-size:14px;margin:0 0 4px">Payment via ' + paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1) + '</p>' +
            '<p style="color:#94a3b8;font-size:12px;margin:0 0 16px">' + esc(customerInfo) + '</p>' +
            patientCardHtml +
            '<div style="background:#f8f9fa;padding:16px;border-radius:12px;text-align:left">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8">Items</span><span>' + cart.length + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8">Subtotal</span><span>PKR ' + subtotal.toLocaleString() + '</span></div>';
        if (discountPercent > 0) {
            receiptHtml += '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8">Discount</span><span style="color:#16a34a">-PKR ' + discountAmount.toLocaleString() + '</span></div>';
        }
        receiptHtml += '<hr style="border-color:#e2e8f0;margin:8px 0">' +
                '<div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700"><span>Total Paid</span><span style="color:#003366">PKR ' + total.toLocaleString() + '</span></div>' +
            '</div>' +
            '<div style="margin-top:20px;display:flex;gap:8px;justify-content:center">' +
                '<button class="btn btn-secondary btn-sm" onclick="window.printReceipt()"><i data-lucide="receipt" style="width:14px;height:14px"></i> Print Receipt</button>' +
                '<button class="btn btn-primary btn-sm" onclick="window.newSale()">New Sale</button>' +
            '</div>' +
        '</div>';

        var itemsPayload = cart.map(function(item) {
            return {
                medicineId: item.medicineId || '',
                name: item.name || '',
                qty: item.quantity,
                unitPrice: item.unitPrice,
                total: item.totalPrice
            };
        });

        var dept = 'Walk-in';
        if (customerType === 'regular') {
            dept = regularSource === 'OPD' ? 'OPD' : (regularSource || 'OPD');
        }

        var patientName = '';
        if (customerType === 'walkin') {
            patientName = $('#walkinName').val() || 'Walk-in Customer';
        } else if (customerType === 'regular') {
            patientName = regularPatientName || regularMrn || 'Patient';
        } else {
            patientName = $('#newCustName').val() || 'New Customer';
        }

        var mrnVal = (customerType === 'regular') ? (regularMrn || null) : null;
        var orderedByVal = (opdVisit && opdVisit.doctorName) ? opdVisit.doctorName : null;
        var orderIdVal = regularVisitId || null;

        function showReceiptModal(txnId) {
            var receiptWithId = receiptHtml.replace('Sale Complete!',
                'Sale Complete!' + (txnId ? '<br><span style="font-size:13px;font-weight:400;color:#94a3b8">' + txnId + '</span>' : ''));
            $('#modalMedName').text('Sale Complete');
            $('#modalMedSub').text('');
            $('#modalMedBody').html(receiptWithId);
            $('.modal-header .med-icon-box').hide();
            $('.modal-footer').hide();
            lucide.createIcons();
            new bootstrap.Modal(document.getElementById('medicineDetailModal')).show();
        }

        $.ajax({
            url: '/api/pharmacy-billing/create-transaction',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                items: itemsPayload,
                subtotal: subtotal,
                discount: discountAmount,
                total: total,
                paymentMethod: paymentMethod,
                customerType: customerType,
                department: dept,
                patientName: patientName,
                mrn: mrnVal,
                orderId: orderIdVal,
                orderedBy: orderedByVal
            }),
            success: function(res) {
                showReceiptModal(res.transactionId);
            },
            error: function() {
                showReceiptModal(null);
            }
        });
    });

    window.newSale = function() {
        cart = [];
        regularSource = '';
        regularMrn = '';
        regularVisitId = '';
        regularPatientName = '';
        renderCart();
        updateBill();
        bootstrap.Modal.getInstance(document.getElementById('medicineDetailModal')).hide();
        $('.modal-header .med-icon-box').show();
        $('.modal-footer').show();
        $('.customer-tabs button').first().addClass('active').siblings().removeClass('active');
        $('.customer-content .tab-pane').hide();
        $('#customerWalkin').show();
        customerType = 'walkin';
    };

    window.printReceipt = function() {
        HMS.toast('Receipt printing would be triggered here.', 'info');
    };

    loadMedicines();
    renderCart();
    updateBill();
});
