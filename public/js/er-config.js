$(document).ready(function () {
    var erFormSections = [];
    var erFormSectionDepts = [];
    var erSectionBuilderFields = [];

    function esc(s) { return $('<span>').text(s || '').html(); }

    var ALL_FIELD_TYPES = [
        { value: 'text',         label: 'Text' },
        { value: 'number',       label: 'Number' },
        { value: 'textarea',     label: 'Text Area' },
        { value: 'dropdown',     label: 'Dropdown / Select' },
        { value: 'multi-select', label: 'Multi-Select' },
        { value: 'radio',        label: 'Radio Button' },
        { value: 'checkbox',     label: 'Checkbox' },
        { value: 'date',         label: 'Date Picker' },
        { value: 'time',         label: 'Time Picker' },
        { value: 'email',        label: 'Email Field' },
        { value: 'password',     label: 'Password Field' }
    ];

    var OPTION_TYPES = ['dropdown', 'multi-select', 'radio', 'checkbox'];
    function needsOptions(type) { return OPTION_TYPES.indexOf(type) > -1; }

    // ===== LOAD DATA =====
    function loadFormSections() {
        $.get('/api/er/form-sections').done(function(sections) {
            erFormSections = sections || [];
            renderFormSections();
        }).fail(function() {
            erFormSections = [];
            renderFormSections();
        });
        $.get('/api/hr-config/department').done(function(depts) {
            erFormSectionDepts = depts || [];
        }).fail(function() {
            erFormSectionDepts = [];
        });
    }

    // ===== RENDER SECTIONS =====
    var BUILTIN_ICONS = {
        medication: 'pill', investigation: 'flask-conical', ivfluids: 'droplets',
        diet: 'utensils', nursing: 'heart-pulse', procedure: 'stethoscope', ordersummary: 'clipboard-list'
    };

    function renderFormSections() {
        var builtins = erFormSections.filter(function(s) { return s.isDefault; });
        var customs  = erFormSections.filter(function(s) { return !s.isDefault; });

        // Built-in toggle cards
        var $bi = $('#erBuiltinSectionsContainer').empty();
        if (builtins.length === 0) {
            $bi.html('<div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">No built-in sections found.</p></div>');
        } else {
            builtins.forEach(function(s) {
                var icon = BUILTIN_ICONS[s.key] || 'layout';
                var on = s.isEnabled;
                var card = '<div class="col-sm-6 col-md-4 col-xl-3" data-section-id="' + s.id + '">' +
                    '<div class="vital-field-card' + (on ? ' is-visible' : '') + '" style="' + (on ? 'border-color:var(--aquamint);background:rgba(127,255,212,0.06)' : '') + '">' +
                    '<div class="vf-icon" style="background:' + (on ? 'var(--aquamint)' : 'var(--color-border)') + ';color:' + (on ? 'var(--midnight-blue)' : 'var(--color-muted-foreground)') + '">' +
                    '<i data-lucide="' + icon + '" style="width:18px;height:18px"></i></div>' +
                    '<div class="vf-info"><div class="vf-label">' + esc(s.label) + '</div>' +
                    '<div class="vf-unit">Built-in</div></div>' +
                    '<label class="vital-toggle" title="' + (on ? 'Disable' : 'Enable') + '">' +
                    '<input type="checkbox" class="er-builtin-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '>' +
                    '<span class="vital-toggle-track" style="' + (on ? 'background:var(--aquamint);border-color:var(--aquamint)' : '') + '"></span>' +
                    '</label>' +
                    '</div></div>';
                $bi.append(card);
            });
        }

        // Custom sections table
        var $ci = $('#erCustomSectionsContainer').empty();
        if (customs.length === 0) {
            $ci.html('<p style="color:var(--color-muted-foreground);font-size:13px">No custom sections yet. Click &ldquo;Add Custom Section&rdquo; to create one.</p>');
        } else {
            var table = '<table class="data-table" style="margin-top:0"><thead><tr>' +
                '<th style="width:36px">#</th><th>Section Name</th><th>Department</th><th>Fields</th><th style="width:110px">Enabled</th><th style="width:120px">Actions</th>' +
                '</tr></thead><tbody>';
            customs.forEach(function(s, i) {
                var fieldCount = (s.fields || []).length;
                var on = s.isEnabled;
                table += '<tr>' +
                    '<td>' + (i + 1) + '</td>' +
                    '<td style="font-weight:600">' + esc(s.label) + '</td>' +
                    '<td>' + (s.department ? esc(s.department) : '<span style="color:var(--color-muted-foreground);font-style:italic;font-size:12px">All Departments</span>') + '</td>' +
                    '<td>' + fieldCount + ' field' + (fieldCount !== 1 ? 's' : '') + '</td>' +
                    '<td><label class="vital-toggle" style="margin:0"><input type="checkbox" class="er-custom-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '><span class="vital-toggle-track" style="' + (on ? 'background:var(--aquamint);border-color:var(--aquamint)' : '') + '"></span></label></td>' +
                    '<td style="display:flex;gap:6px;padding:8px 12px">' +
                    '<button class="er-btn-edit-section" data-section-id="' + s.id + '" style="padding:4px 10px;font-size:12px;background:var(--midnight-blue);color:#fff;border:none;border-radius:5px;cursor:pointer">Edit</button>' +
                    '<button class="er-btn-del-section" data-section-id="' + s.id + '" data-label="' + esc(s.label) + '" style="padding:4px 10px;font-size:12px;background:var(--color-destructive);color:#fff;border:none;border-radius:5px;cursor:pointer">Delete</button>' +
                    '</td></tr>';
            });
            table += '</tbody></table>';
            $ci.html(table);
        }
        lucide.createIcons();
    }

    // ===== TOGGLE HELPERS =====
    function patchErSectionEnabled(id, isEnabled, onError) {
        $.ajax({
            url: '/api/er/form-sections/' + id,
            method: 'PATCH',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ isEnabled: isEnabled }),
            error: function() { if (onError) onError(); HMS.toast('Failed to update section', 'error'); }
        });
    }

    $(document).on('change', '.er-builtin-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $card = $cb.closest('.vital-field-card');
        $card.toggleClass('is-visible', isEnabled);
        $card.css({ 'border-color': isEnabled ? 'var(--aquamint)' : '', 'background': isEnabled ? 'rgba(127,255,212,0.06)' : '' });
        $card.find('.vital-toggle-track').css({ 'background': isEnabled ? 'var(--aquamint)' : '', 'border-color': isEnabled ? 'var(--aquamint)' : '' });
        patchErSectionEnabled(id, isEnabled, function() { $cb.prop('checked', !isEnabled); });
    });

    $(document).on('change', '.er-custom-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $track = $cb.siblings('.vital-toggle-track');
        $track.css({ 'background': isEnabled ? 'var(--aquamint)' : '', 'border-color': isEnabled ? 'var(--aquamint)' : '' });
        var sec = erFormSections.find(function(s) { return s.id === id; });
        if (sec) sec.isEnabled = isEnabled;
        patchErSectionEnabled(id, isEnabled, function() {
            $cb.prop('checked', !isEnabled);
            $track.css({ 'background': !isEnabled ? 'var(--aquamint)' : '', 'border-color': !isEnabled ? 'var(--aquamint)' : '' });
        });
    });

    // ===== FIELD BUILDER =====
    function genFieldId() { return 'fld_' + Date.now() + '_' + Math.floor(Math.random() * 9999); }

    function renderErFieldsList() {
        var $list = $('#erSectionFieldsList');
        if (erSectionBuilderFields.length === 0) {
            $list.html('<div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">No fields yet. Click "Add Field" to begin.</div>');
            return;
        }
        $list.empty();
        erSectionBuilderFields.forEach(function(f, i) {
            var hasOptions = needsOptions(f.type);
            var optionsVal = Array.isArray(f.options) ? f.options.join(', ') : (f.options || '');
            var typeOpts = ALL_FIELD_TYPES.map(function(t) {
                return '<option value="' + t.value + '"' + (f.type === t.value ? ' selected' : '') + '>' + t.label + '</option>';
            }).join('');
            var fHtml = '<div class="er-field-row" data-field-idx="' + i + '" style="background:var(--color-card);border:1px solid var(--color-border);border-radius:8px;padding:10px 14px">' +
                '<div style="display:grid;grid-template-columns:1fr 180px auto;gap:8px;align-items:center">' +
                    '<input type="text" class="form-control er-field-label-input" placeholder="Field label..." value="' + esc(f.label) + '" data-idx="' + i + '" style="font-size:13px">' +
                    '<select class="form-select er-field-type-select" data-idx="' + i + '" style="font-size:13px">' + typeOpts + '</select>' +
                    '<button type="button" class="er-btn-del-field" data-idx="' + i + '" style="background:var(--color-destructive);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer">✕</button>' +
                '</div>' +
                '<div class="er-field-options-row" data-idx="' + i + '" style="margin-top:8px;' + (hasOptions ? '' : 'display:none') + '">' +
                    '<input type="text" class="form-control er-field-options-input" data-idx="' + i + '" placeholder="e.g. Option 1, Option 2, Option 3" value="' + esc(optionsVal) + '" style="font-size:12px">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:3px">Comma-separated list of choices</div>' +
                '</div>' +
                '</div>';
            $list.append(fHtml);
        });
    }

    $('#btnAddErField').on('click', function() {
        erSectionBuilderFields.push({ id: genFieldId(), label: '', type: 'text', options: [] });
        renderErFieldsList();
    });

    $(document).on('input', '.er-field-label-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (erSectionBuilderFields[idx]) erSectionBuilderFields[idx].label = $(this).val();
    });

    $(document).on('change', '.er-field-type-select', function() {
        var idx = parseInt($(this).data('idx'));
        if (!erSectionBuilderFields[idx]) return;
        erSectionBuilderFields[idx].type = $(this).val();
        var $row = $(this).closest('.er-field-row').find('.er-field-options-row');
        if (needsOptions($(this).val())) { $row.show(); } else { $row.hide(); erSectionBuilderFields[idx].options = []; }
    });

    $(document).on('input', '.er-field-options-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (erSectionBuilderFields[idx]) {
            erSectionBuilderFields[idx].options = $(this).val().split(',').map(function(o) { return o.trim(); }).filter(Boolean);
        }
    });

    $(document).on('click', '.er-btn-del-field', function() {
        var idx = parseInt($(this).data('idx'));
        erSectionBuilderFields.splice(idx, 1);
        renderErFieldsList();
    });

    // ===== OPEN BUILDER (ADD) =====
    $('#btnAddErCustomSection').on('click', function() {
        $('#erSectionBuilderTitle').text('Add Custom Section');
        $('#erSectionBuilderId').val('');
        $('#erSectionBuilderLabel').val('');
        erSectionBuilderFields = [];
        var $deptSel = $('#erSectionBuilderDept').empty().append('<option value="">All Departments</option>');
        erFormSectionDepts.forEach(function(d) {
            var name = d.name || d.value || d;
            $deptSel.append('<option value="' + esc(name) + '">' + esc(name) + '</option>');
        });
        renderErFieldsList();
        new bootstrap.Offcanvas(document.getElementById('erSectionBuilderSheet')).show();
    });

    // ===== OPEN BUILDER (EDIT) =====
    $(document).on('click', '.er-btn-edit-section', function() {
        var id = $(this).data('section-id');
        var sec = erFormSections.find(function(s) { return s.id === id; });
        if (!sec) return;
        $('#erSectionBuilderTitle').text('Edit Section: ' + sec.label);
        $('#erSectionBuilderId').val(sec.id);
        $('#erSectionBuilderLabel').val(sec.label);
        erSectionBuilderFields = JSON.parse(JSON.stringify(sec.fields || []));
        var $deptSel = $('#erSectionBuilderDept').empty().append('<option value="">All Departments</option>');
        erFormSectionDepts.forEach(function(d) {
            var name = d.name || d.value || d;
            $deptSel.append('<option value="' + esc(name) + '"' + (sec.department === name ? ' selected' : '') + '>' + esc(name) + '</option>');
        });
        renderErFieldsList();
        new bootstrap.Offcanvas(document.getElementById('erSectionBuilderSheet')).show();
    });

    // ===== SAVE SECTION =====
    $('#btnSaveErSectionBuilder').on('click', function() {
        var label = $('#erSectionBuilderLabel').val().trim();
        if (!label) { HMS.toast('Please enter a section name.', 'warning'); return; }
        for (var i = 0; i < erSectionBuilderFields.length; i++) {
            if (!erSectionBuilderFields[i].label.trim()) { HMS.toast('All fields must have a label.', 'warning'); return; }
        }
        if (erSectionBuilderFields.length === 0) { HMS.toast('Please add at least one field.', 'warning'); return; }

        var id      = $('#erSectionBuilderId').val();
        var dept    = $('#erSectionBuilderDept').val();
        var payload = { label: label, department: dept, fields: erSectionBuilderFields };
        var $btn    = $(this).prop('disabled', true).text('Saving...');

        var ajax = id
            ? $.ajax({ url: '/api/er/form-sections/' + id, method: 'PATCH', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) })
            : $.ajax({ url: '/api/er/form-sections', method: 'POST', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) });

        ajax.done(function() {
            bootstrap.Offcanvas.getInstance(document.getElementById('erSectionBuilderSheet')).hide();
            loadFormSections();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to save section');
        }).always(function() {
            $btn.prop('disabled', false).text('Save Section');
        });
    });

    // ===== DELETE SECTION =====
    $(document).on('click', '.er-btn-del-section', function() {
        var id    = $(this).data('section-id');
        var label = $(this).data('label');
        if (!confirm('Delete custom section "' + label + '"? This cannot be undone.')) return;
        $.ajax({
            url: '/api/er/form-sections/' + id,
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
        }).done(function() {
            loadFormSections();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to delete section');
        });
    });

    loadFormSections();
});

// ============================================================
// ER Disposition Clearance Approvals
// ============================================================
$(document).ready(function () {
    if (!$('#erDispClearanceContainer').length) return;

    function esc(s) { return $('<span>').text(s || '').html(); }

    var CLEARANCE_ITEMS = [
        {
            key:  'er_discharge_require_hospital_clearance',
            icon: '🏥',
            label: 'ER / Hospital Clearance',
            desc:  'All ER and hospital charges (consultation, doctor fee, procedures) must be settled before disposition can proceed.'
        },
        {
            key:  'er_discharge_require_pharmacy_clearance',
            icon: '💊',
            label: 'Pharmacy Clearance',
            desc:  'All pharmacy and medication charges dispensed during the ER visit must be paid before the patient is discharged.'
        },
        {
            key:  'er_discharge_require_lab_clearance',
            icon: '🔬',
            label: 'Laboratory Clearance',
            desc:  'All lab and investigation charges ordered during the ER visit must be settled before disposition can proceed.'
        }
    ];

    function loadErDispClearance() {
        $.get('/api/hospital-info/settings/er_discharge', function(res) {
            renderErDispClearance((res && res.settings) || {});
        }).fail(function() {
            renderErDispClearance({});
        });
    }

    function renderErDispClearance(settings) {
        var html = '';
        CLEARANCE_ITEMS.forEach(function(item) {
            var enabled = settings[item.key] !== '0';
            html +=
                '<div class="col-md-6 col-xl-4">' +
                    '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:20px;height:100%;display:flex;flex-direction:column;gap:14px">' +
                        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">' +
                            '<div style="display:flex;align-items:center;gap:12px">' +
                                '<span style="font-size:26px;line-height:1">' + item.icon + '</span>' +
                                '<div style="font-size:14px;font-weight:700;color:var(--midnight-blue);line-height:1.3">' + esc(item.label) + '</div>' +
                            '</div>' +
                            '<label style="cursor:pointer;flex-shrink:0;display:flex;align-items:center;gap:8px">' +
                                '<input type="checkbox" class="er-disch-clearance-toggle" data-key="' + item.key + '"' + (enabled ? ' checked' : '') + ' style="position:absolute;opacity:0;width:0;height:0">' +
                                '<div class="er-disch-toggle-track" style="width:46px;height:26px;border-radius:13px;position:relative;cursor:pointer;background:' + (enabled ? 'var(--aqua-mint,#5eead4)' : '#cbd5e1') + ';transition:background .2s;flex-shrink:0">' +
                                    '<div class="er-disch-toggle-thumb" style="position:absolute;top:3px;left:' + (enabled ? '23px' : '3px') + ';width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);transition:left .2s"></div>' +
                                '</div>' +
                                '<span class="er-disch-clearance-label" style="font-size:12px;font-weight:700;color:' + (enabled ? '#065F46' : '#94a3b8') + '">' + (enabled ? 'Required' : 'Off') + '</span>' +
                            '</label>' +
                        '</div>' +
                        '<div style="font-size:12px;color:var(--color-muted-foreground);line-height:1.6">' + esc(item.desc) + '</div>' +
                        '<div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;width:fit-content;' +
                            (enabled ? 'background:rgba(16,185,129,0.1);color:#065F46;border:1px solid rgba(16,185,129,0.25)' : 'background:rgba(100,116,139,0.1);color:#64748b;border:1px solid rgba(100,116,139,0.2)') + '">' +
                            (enabled ? '✅ Approval Required' : '⏭ Not Required — Skipped') +
                        '</div>' +
                    '</div>' +
                '</div>';
        });
        $('#erDispClearanceContainer').html(html);
    }

    $(document).on('change', '.er-disch-clearance-toggle', function() {
        var $cb     = $(this);
        var key     = $cb.data('key');
        var enabled = $cb.is(':checked');
        var $card   = $cb.closest('[style]');
        var $track  = $cb.siblings('.er-disch-toggle-track');
        var $thumb  = $track.find('.er-disch-toggle-thumb');
        var $lbl    = $cb.siblings('.er-disch-clearance-label');
        var $pill   = $card.find('[style*="border-radius:20px"]').last();

        $track.css('background', enabled ? 'var(--aqua-mint,#5eead4)' : '#cbd5e1');
        $thumb.css('left', enabled ? '23px' : '3px');
        $lbl.css('color', enabled ? '#065F46' : '#94a3b8').text(enabled ? 'Required' : 'Off');
        $pill.css(enabled
            ? { background: 'rgba(16,185,129,0.1)', color: '#065F46', border: '1px solid rgba(16,185,129,0.25)' }
            : { background: 'rgba(100,116,139,0.1)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }
        ).text(enabled ? '✅ Approval Required' : '⏭ Not Required — Skipped');

        var payload = {};
        payload[key] = enabled ? '1' : '0';
        $.ajax({
            url: '/api/hospital-info/settings/er_discharge',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify(payload),
            success: function() {
                if (window.showToast) showToast('Clearance setting saved', 'success');
            },
            error: function() {
                if (window.showToast) showToast('Failed to save setting', 'error');
                $cb.prop('checked', !enabled);
                $track.css('background', !enabled ? 'var(--aqua-mint,#5eead4)' : '#cbd5e1');
                $thumb.css('left', !enabled ? '23px' : '3px');
            }
        });
    });

    loadErDispClearance();
});
