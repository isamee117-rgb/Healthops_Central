var chCurrentPage = 1;
var chPerPageVal = 10;
var chFiltered = null;

$(function() {
    var charges = [];
    var editingId = null;
    var categories = [];

    var modules = [
        { id: 'OPD', label: 'OPD', color: '#16a34a', bg: 'rgba(22,163,74,0.08)', icon: 'stethoscope' },
        { id: 'IPD', label: 'IPD', color: '#9333ea', bg: 'rgba(147,51,234,0.08)', icon: 'building-2' },
        { id: 'OT',  label: 'OT',  color: '#ea580c', bg: 'rgba(234,88,12,0.08)', icon: 'scissors' },
        { id: 'ER',  label: 'ER',  color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: 'siren' }
    ];

    function esc(s) { return $('<span>').text(s || '').html(); }
    function fmtDate(d) { if (!d) return '—'; var dt = new Date(d); return dt.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }); }
    function fmtAmount(a) { return 'PKR ' + Number(a).toLocaleString('en-PK'); }

    function modInfo(id) {
        var m = modules.find(function(x) { return x.id === id; });
        return m || { id: id, label: id, color: '#64748b', bg: 'rgba(100,116,139,0.08)', icon: 'circle' };
    }

    function moduleBadge(moduleId) {
        var m = modInfo(moduleId);
        return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:' + m.bg + ';color:' + m.color + '"><i data-lucide="' + m.icon + '" style="width:12px;height:12px"></i> ' + esc(m.label) + '</span>';
    }

    function catBadge(cat) {
        var colors = {
            'Diagnostics': '#2563eb',
            'Consultation': '#16a34a',
            'Procedure': '#ea580c',
            'Facility': '#9333ea',
            'Equipment': '#0891b2',
            'Medication': '#d97706',
            'Other': '#64748b'
        };
        var c = colors[cat] || '#64748b';
        return '<span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:' + c + '12;color:' + c + '">' + esc(cat) + '</span>';
    }

    function statusBadge(isActive) {
        if (isActive) {
            return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(22,163,74,0.08);color:#16a34a"><i data-lucide="check-circle" style="width:12px;height:12px"></i> Active</span>';
        }
        return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(220,38,38,0.08);color:#dc2626"><i data-lucide="x-circle" style="width:12px;height:12px"></i> Inactive</span>';
    }

    function loadCategories(callback) {
        $.get('/api/finance-config/charge_category', function (data) {
            categories = data || [];
            var catWrap = document.getElementById('chCsCategory');
            if (catWrap && catWrap.setOptions) catWrap.setOptions(['All Categories'].concat(categories));
            if (callback) callback();
        }).fail(function () {
            if (callback) callback();
        });
    }

    function loadCharges() {
        $.get('/api/config/hospital-charges', function(data) {
            charges = data || [];
            window.charges_ref = charges;
            updateStats();
            renderTable();
        }).fail(function() {
            charges = [];
            window.charges_ref = charges;
            renderTable();
        });
    }

    function updateStats() {
        var total = charges.length;
        var opd = charges.filter(function(c) { return c.module === 'OPD'; }).length;
        var ipd = charges.filter(function(c) { return c.module === 'IPD'; }).length;
        var ot = charges.filter(function(c) { return c.module === 'OT'; }).length;
        var er = charges.filter(function(c) { return c.module === 'ER'; }).length;
        var active = charges.filter(function(c) { return c.isActive !== false; }).length;
        $('#statTotal').text(total);
        $('#statOPD').text(opd);
        $('#statIPD').text(ipd);
        $('#statOT').text(ot);
        $('#statER').text(er);
        $('#statActive').text(active);
    }

    function getFiltered() {
        var base = chFiltered !== null ? chFiltered : charges;
        var search = ($('#chargeSearch').val() || '').toLowerCase();
        return base.filter(function(c) {
            if (search) {
                var hay = ((c.chargeId || '') + ' ' + (c.name || '') + ' ' + (c.module || '') + ' ' + (c.category || '')).toLowerCase();
                if (hay.indexOf(search) === -1) return false;
            }
            return true;
        });
    }

    function renderTable() {
        chCurrentPage = 1;
        _chRenderPagination(getFiltered());
    }

    function _chRenderPagination(source) {
        var total = source.length;
        var totalPages = Math.max(1, Math.ceil(total / chPerPageVal));
        if (chCurrentPage > totalPages) chCurrentPage = totalPages;
        var start = (chCurrentPage - 1) * chPerPageVal;
        var page = source.slice(start, start + chPerPageVal);
        var h = '';
        if (page.length === 0) {
            h = '<tr><td colspan="8"><div class="empty-state"><i data-lucide="badge-dollar-sign"></i><p>No charges found</p></div></td></tr>';
        } else {
            page.forEach(function(c) {
                h += '<tr>';
                h += '<td><span style="font-weight:600;color:var(--midnight-blue)">' + esc(c.chargeId) + '</span></td>';
                h += '<td><span style="font-weight:600">' + esc(c.name) + '</span></td>';
                h += '<td>' + moduleBadge(c.module) + '</td>';
                h += '<td>' + catBadge(c.category) + '</td>';
                h += '<td style="text-align:right"><span style="font-weight:700;color:var(--midnight-blue)">' + fmtAmount(c.amount) + '</span></td>';
                h += '<td>' + statusBadge(c.isActive !== false) + '</td>';
                h += '<td style="color:var(--color-muted-foreground);font-size:13px">' + fmtDate(c.createdAt) + '</td>';
                h += '<td>';
                h += '<div class="dropdown">';
                h += '<button class="action-menu-btn" data-bs-toggle="dropdown"><i data-lucide="more-vertical" style="width:16px;height:16px"></i></button>';
                h += '<ul class="dropdown-menu dropdown-menu-end">';
                h += '<li><a class="dropdown-item btn-edit-charge" href="#" data-id="' + esc(c.chargeId) + '"><i data-lucide="pencil" style="width:14px;height:14px;margin-right:8px"></i> Edit</a></li>';
                if (c.isActive !== false) {
                    h += '<li><a class="dropdown-item btn-toggle-charge" href="#" data-id="' + esc(c.chargeId) + '" data-active="false"><i data-lucide="eye-off" style="width:14px;height:14px;margin-right:8px"></i> Deactivate</a></li>';
                } else {
                    h += '<li><a class="dropdown-item btn-toggle-charge" href="#" data-id="' + esc(c.chargeId) + '" data-active="true"><i data-lucide="eye" style="width:14px;height:14px;margin-right:8px"></i> Activate</a></li>';
                }
                h += '<li><hr class="dropdown-divider"></li>';
                h += '<li><a class="dropdown-item text-danger btn-delete-charge" href="#" data-id="' + esc(c.chargeId) + '"><i data-lucide="trash-2" style="width:14px;height:14px;margin-right:8px"></i> Delete</a></li>';
                h += '</ul></div></td>';
                h += '</tr>';
            });
        }
        $('#chargesTableBody').html(h);
        lucide.createIcons();

        var endRow = Math.min(start + chPerPageVal, total);
        $('#chTableInfo').text(total === 0 ? 'No records' : 'Showing ' + (start + 1) + '–' + endRow + ' of ' + total + ' records');
        var nums = '';
        for (var i = 1; i <= totalPages; i++) {
            nums += '<button class="opd-page-num' + (i === chCurrentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        $('#chPageNums').html(nums);
        $('#chPrevPage').prop('disabled', chCurrentPage <= 1);
        $('#chNextPage').prop('disabled', chCurrentPage >= totalPages);
    }

    function buildForm(charge) {
        var isEdit = !!charge;
        var h = '';
        h += '<div id="chargeFormError"></div>';

        h += '<div style="margin-bottom:20px">';
        h += '<label style="display:block;font-size:13px;font-weight:600;color:var(--color-foreground);margin-bottom:8px">Select Module <span style="color:#dc2626">*</span></label>';
        h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">';
        modules.forEach(function(m) {
            var sel = (isEdit && charge.module === m.id) ? true : false;
            h += '<label class="module-card' + (sel ? ' selected' : '') + '" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border:2px solid ' + (sel ? m.color : 'var(--color-border)') + ';border-radius:10px;cursor:pointer;transition:all .2s;background:' + (sel ? m.bg : '#fff') + ';text-align:center">';
            h += '<input type="radio" name="chargeModule" value="' + m.id + '"' + (sel ? ' checked' : '') + ' style="display:none">';
            h += '<i data-lucide="' + m.icon + '" style="width:24px;height:24px;color:' + m.color + '"></i>';
            h += '<span style="font-size:13px;font-weight:600;color:' + m.color + '">' + m.label + '</span>';
            h += '</label>';
        });
        h += '</div></div>';

        h += '<div style="margin-bottom:16px">';
        h += '<label style="display:block;font-size:13px;font-weight:600;color:var(--color-foreground);margin-bottom:6px">Charge Name <span style="color:#dc2626">*</span></label>';
        h += '<input type="text" class="form-control" id="chargeName" placeholder="e.g., Lab Test, Bed Charge, Equipment Fee" maxlength="100" value="' + esc(isEdit ? charge.name : '') + '">';
        h += '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Min 3, Max 100 characters</div>';
        h += '</div>';

        h += '<div style="margin-bottom:16px">';
        h += '<label style="display:block;font-size:13px;font-weight:600;color:var(--color-foreground);margin-bottom:6px">Charge Category <span style="color:#dc2626">*</span></label>';
        h += '<select class="form-select" id="chargeCategory">';
        h += '<option value="">Select category...</option>';
        categories.forEach(function(cat) {
            h += '<option value="' + cat + '"' + (isEdit && charge.category === cat ? ' selected' : '') + '>' + cat + '</option>';
        });
        h += '</select></div>';

        h += '<div style="margin-bottom:16px">';
        h += '<label style="display:block;font-size:13px;font-weight:600;color:var(--color-foreground);margin-bottom:6px">Charge Amount <span style="color:#dc2626">*</span></label>';
        h += '<div style="position:relative">';
        h += '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:600;color:var(--color-muted-foreground)">Rs.</span>';
        h += '<input type="number" class="form-control" id="chargeAmount" min="0" step="50" placeholder="0" style="padding-left:40px" value="' + (isEdit ? charge.amount : '') + '">';
        h += '</div></div>';

        var isMandatory = isEdit ? (charge.isMandatory === true || charge.isMandatory === 1) : false;
        h += '<div style="margin-bottom:16px">';
        h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:var(--color-muted);border-radius:8px;border:1px solid var(--color-border)">';
        h += '<div><label style="font-size:13px;font-weight:600;color:var(--color-foreground);margin:0;cursor:pointer" for="chargeMandatory">Mandatory</label>';
        h += '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:2px">Auto-applied to every bill in this module</div></div>';
        h += '<div class="form-check form-switch" style="margin:0;padding-left:0">';
        h += '<input type="checkbox" class="form-check-input" id="chargeMandatory" style="width:42px;height:22px;cursor:pointer"' + (isMandatory ? ' checked' : '') + '>';
        h += '</div></div></div>';

        return h;
    }

    function validateForm() {
        var module = $('input[name="chargeModule"]:checked').val();
        var name = ($('#chargeName').val() || '').trim();
        var category = $('#chargeCategory').val();
        var amount = $('#chargeAmount').val();
        var valid = module && name.length >= 3 && category && amount && parseFloat(amount) >= 0;
        $('#btnSaveCharge').prop('disabled', !valid);
        return valid;
    }

    $(document).on('click', '#btnAddCharge', function() {
        editingId = null;
        $('#chargeFormTitle').text('Add Charge');
        $('#btnSaveCharge').html('<i data-lucide="check"></i> Save Charge').prop('disabled', true);
        $('#chargeFormBody').html(buildForm(null));
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('chargeFormSheet')).show();
    });

    $(document).on('click', '.btn-edit-charge', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        var charge = charges.find(function(c) { return c.chargeId === id; });
        if (!charge) return;
        editingId = id;
        $('#chargeFormTitle').text('Edit Charge');
        $('#btnSaveCharge').html('<i data-lucide="check"></i> Update Charge').prop('disabled', false);
        $('#chargeFormBody').html(buildForm(charge));
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('chargeFormSheet')).show();
    });

    $(document).on('click', '.module-card', function() {
        var radio = $(this).find('input[name="chargeModule"]');
        radio.prop('checked', true);
        var val = radio.val();
        var m = modInfo(val);
        $('.module-card').css({ borderColor: 'var(--color-border)', background: '#fff' }).removeClass('selected');
        $(this).css({ borderColor: m.color, background: m.bg }).addClass('selected');
        $('#chargeFormError').empty();
        validateForm();
    });

    $(document).on('input change', '#chargeName, #chargeCategory, #chargeAmount, #chargeMandatory', function() {
        validateForm();
    });

    $(document).on('click', '#btnSaveCharge', function() {
        if (!validateForm()) return;
        var btn = $(this);
        btn.prop('disabled', true).html('<i data-lucide="loader-2" class="spin"></i> Saving...');

        var payload = {
            module: $('input[name="chargeModule"]:checked').val(),
            name: $('#chargeName').val().trim(),
            category: $('#chargeCategory').val(),
            amount: parseFloat($('#chargeAmount').val()),
            isMandatory: $('#chargeMandatory').is(':checked')
        };

        var url = editingId ? '/api/config/hospital-charges/' + editingId : '/api/config/hospital-charges';
        var method = editingId ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function() {
                try { bootstrap.Offcanvas.getInstance(document.getElementById('chargeFormSheet'))?.hide(); } catch(e) {}
                editingId = null;
                loadCharges();
            },
            error: function(xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'Failed to save charge';
                $('#chargeFormError').html('<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#dc2626;font-size:13px;font-weight:500"><i data-lucide="alert-circle" style="width:14px;height:14px;margin-right:6px;vertical-align:-2px"></i>' + msg + '</div>');
                lucide.createIcons();
                btn.prop('disabled', false).html('<i data-lucide="check"></i> ' + (editingId ? 'Update' : 'Save') + ' Charge');
                lucide.createIcons();
            }
        });
    });

    $(document).on('click', '.btn-toggle-charge', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        var activate = $(this).data('active') === true || $(this).data('active') === 'true';
        $.ajax({
            url: '/api/config/hospital-charges/' + id,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ isActive: activate }),
            success: function() { loadCharges(); }
        });
    });

    $(document).on('click', '.btn-delete-charge', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        var charge = charges.find(function(c) { return c.chargeId === id; });
        if (!confirm('Delete charge "' + (charge ? charge.name : id) + '"? This action cannot be undone.')) return;
        $.ajax({
            url: '/api/config/hospital-charges/' + id,
            method: 'DELETE',
            success: function() { loadCharges(); }
        });
    });

    window._chGetFiltered = getFiltered;
    window._chRenderPagination = _chRenderPagination;

    $('#chargeSearch').on('input', function() { chCurrentPage = 1; _chRenderPagination(getFiltered()); });

    $(document).on('click', '#chPageNums .opd-page-num', function() {
        chCurrentPage = parseInt($(this).data('page'));
        _chRenderPagination(getFiltered());
    });
    $(document).on('click', '#chPrevPage', function() {
        if (chCurrentPage > 1) { chCurrentPage--; _chRenderPagination(getFiltered()); }
    });
    $(document).on('click', '#chNextPage', function() {
        var total = getFiltered().length;
        var totalPages = Math.max(1, Math.ceil(total / chPerPageVal));
        if (chCurrentPage < totalPages) { chCurrentPage++; _chRenderPagination(getFiltered()); }
    });

    // ── Outside-click handler ─────────────────────────────────────────────────
    $(document).on('click.chMenus', function(e) {
        if (!$(e.target).closest('#chRowsMenu, #chRowsBtn').length)          $('#chRowsMenu').removeClass('open');
        if (!$(e.target).closest('#chColVisMenu, .opd-col-vis-wrap').length) $('#chColVisMenu').removeClass('open');
        if (!$(e.target).closest('#chExportMenu, .opd-export-wrap').length)  $('#chExportMenu').removeClass('open');
        if (!$(e.target).closest('.opd-dp-trigger,.opd-dp-popup,.opd-cs-trigger,.opd-cs-popup').length) chCloseAll();
    });

    // ── Toolbar window functions ───────────────────────────────────────────────
    window.toggleChFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('chFilterPane');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnChFilter');
        if (btn) btn.classList.toggle('active', !open);
    };

    window.applyChFilters = function() {
        var modVal   = ($('#chModuleFilter').val()  || '').toLowerCase();
        var catVal   = ($('#chCatFilter').val()     || '').toLowerCase();
        var dateFrom = $('#chDateFrom').val() || '';
        var dateTo   = $('#chDateTo').val()   || '';
        chFiltered = (window.charges_ref || []).filter(function(c) {
            if (modVal   && modVal   !== 'all modules'    && (c.module   || '').toLowerCase() !== modVal)   return false;
            if (catVal   && catVal   !== 'all categories' && (c.category || '').toLowerCase() !== catVal)   return false;
            var ds = c.createdAt ? c.createdAt.substring(0, 10) : '';
            if (dateFrom && ds && ds < dateFrom) return false;
            if (dateTo   && ds && ds > dateTo)   return false;
            return true;
        });
        var count = 0;
        if (modVal   && modVal   !== 'all modules')    count++;
        if (catVal   && catVal   !== 'all categories') count++;
        if (dateFrom) count++;
        if (dateTo)   count++;
        var badge = document.getElementById('chFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }
        chCurrentPage = 1;
        if (window._chRenderPagination && window._chGetFiltered) window._chRenderPagination(window._chGetFiltered());
        toggleChFilter();
    };

    window.resetChFilters = function() {
        chFiltered = null; chCurrentPage = 1;
        ['chCsModule','chCsCategory'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        ['chDpDateFrom','chDpDateTo'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        var badge = document.getElementById('chFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        if (window._chRenderPagination && window._chGetFiltered) window._chRenderPagination(window._chGetFiltered());
    };

    window.toggleChRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('chRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setChRowsPer = function(n) {
        chPerPageVal = n; chCurrentPage = 1;
        var m = document.getElementById('chRowsMenu'); if (m) m.classList.remove('open');
        if (window._chRenderPagination && window._chGetFiltered) window._chRenderPagination(window._chGetFiltered());
    };

    window.toggleChColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('chColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.chColVisSelectAll = function() {
        $('#chColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyChColVis = function() {
        var m = document.getElementById('chColVisMenu'); if (m) m.classList.remove('open');
        $('#chColVisList input[type=checkbox]').each(function() {
            var col  = parseInt($(this).data('col'));
            var show = $(this).is(':checked');
            $('#chargesTable thead tr th:eq(' + col + ')').toggle(show);
            $('#chargesTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleChExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('chExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportCh = function(type) {
        var m = document.getElementById('chExportMenu'); if (m) m.classList.remove('open');
        var data = window._chGetFiltered ? window._chGetFiltered() : [];
        if (type === 'csv') {
            var hdrs = ['Charge ID','Charge Name','Module','Category','Amount','Status','Date Added'];
            var rows = data.map(function(c) {
                return [c.chargeId||'', c.name||'', c.module||'', c.category||'', c.amount||0, c.isActive !== false ? 'Active' : 'Inactive', c.createdAt ? c.createdAt.slice(0,10) : ''];
            });
            var lines = [hdrs.map(function(h) { return '"' + h + '"'; }).join(',')];
            rows.forEach(function(r) { lines.push(r.map(function(c) { return '"' + (c+'').replace(/"/g,'""') + '"'; }).join(',')); });
            var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'charges.csv'; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
    };

    // ── Custom date picker & searchable select ────────────────────────────────
    var CH_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var CH_DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    function chCloseAll() {
        document.querySelectorAll('.opd-dp-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
        document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
    }
    document.addEventListener('click', chCloseAll);
    window.addEventListener('scroll', function() {
        document.querySelectorAll('.opd-dp-popup.open, .opd-cs-popup.open').forEach(function(p) {
            if (!p._trigger) return;
            var rect = p._trigger.getBoundingClientRect();
            p.style.top = (rect.bottom + 6) + 'px'; p.style.left = rect.left + 'px';
        });
    }, true);

    function chInitDp(wrapId) {
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
            var h = '<div class="opd-dp-header"><button class="opd-dp-nav" data-a="p">&#8249;</button><span class="opd-dp-month-year">' + CH_MONTHS[viewMonth] + ' ' + viewYear + '</span><button class="opd-dp-nav" data-a="n">&#8250;</button></div><div class="opd-dp-grid">';
            CH_DAYS.forEach(function(d) { h += '<div class="opd-dp-dayname">' + d + '</div>'; });
            for (var i = 0; i < firstDow; i++) h += '<div class="opd-dp-day empty"></div>';
            for (var d = 1; d <= dim; d++) {
                var ds = viewYear + '-' + String(viewMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
                h += '<div class="opd-dp-day' + (selDate === ds ? ' selected' : '') + '" data-date="' + ds + '">' + d + '</div>';
            }
            popup.innerHTML = h + '</div>';
        }
        triggerEl.addEventListener('click', function(e) {
            e.stopPropagation(); var isOpen = popup.classList.contains('open'); chCloseAll();
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
            else if(tgt.dataset.date){selDate=tgt.dataset.date;valEl.textContent=selDate;valEl.classList.remove('opd-ph');if(hidden)hidden.value=selDate;chCloseAll();}
        });
        wrap._reset=function(){selDate=null;viewYear=new Date().getFullYear();viewMonth=new Date().getMonth();valEl.textContent=ph;valEl.classList.add('opd-ph');if(hidden)hidden.value='';};
    }

    function chInitCs(wrapId) {
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
                el.addEventListener('click',function(e){e.stopPropagation();selVal=this.dataset.v;valEl.textContent=selVal;valEl.classList.remove('opd-ph');if(hidden)hidden.value=selVal;chCloseAll();});
            });
        }
        triggerEl.addEventListener('click',function(e){
            e.stopPropagation();var isOpen=popup.classList.contains('open');chCloseAll();
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

    // ── Initialize toolbar components ─────────────────────────────────────────
    ['chDpDateFrom','chDpDateTo'].forEach(chInitDp);
    ['chCsModule','chCsCategory'].forEach(chInitCs);

    var modWrap = document.getElementById('chCsModule');
    if (modWrap && modWrap.setOptions) modWrap.setOptions(['All Modules','OPD','IPD','OT','ER']);

    loadCategories(function () { loadCharges(); });
});
