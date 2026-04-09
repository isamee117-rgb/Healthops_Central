$(document).ready(function () {
    var otFormSections = [];
    var otFormSectionDepts = [];
    var otSectionBuilderFields = [];

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
        $.get('/api/ot/form-sections').done(function(sections) {
            otFormSections = sections || [];
            renderFormSections();
        }).fail(function() {
            otFormSections = [];
            renderFormSections();
        });
        $.get('/api/hr-config/department').done(function(depts) {
            otFormSectionDepts = depts || [];
        }).fail(function() {
            otFormSectionDepts = [];
        });
    }

    // ===== RENDER SECTIONS =====
    var BUILTIN_ICONS = {
        patient_verification: 'user-check',
        consent:              'pen-line',
        preanesthetic:        'stethoscope',
        npo:                  'coffee',
        investigations:       'flask-conical',
        medications:          'pill',
        physical_prep:        'user-check',
        vitals:               'heart-pulse',
        allergies:            'alert-triangle',
        equipment:            'package-check',
        final_verification:   'clipboard-check'
    };

    function renderFormSections() {
        var builtins = otFormSections.filter(function(s) { return s.isDefault; });
        var customs  = otFormSections.filter(function(s) { return !s.isDefault; });

        // Built-in toggle cards
        var $bi = $('#otBuiltinSectionsContainer').empty();
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
                    '<input type="checkbox" class="ot-builtin-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '>' +
                    '<span class="vital-toggle-track" style="' + (on ? 'background:var(--aquamint);border-color:var(--aquamint)' : '') + '"></span>' +
                    '</label>' +
                    '</div></div>';
                $bi.append(card);
            });
        }

        // Custom sections table
        var $ci = $('#otCustomSectionsContainer').empty();
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
                    '<td><label class="vital-toggle" style="margin:0"><input type="checkbox" class="ot-custom-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '><span class="vital-toggle-track" style="' + (on ? 'background:var(--aquamint);border-color:var(--aquamint)' : '') + '"></span></label></td>' +
                    '<td style="display:flex;gap:6px;padding:8px 12px">' +
                    '<button class="ot-btn-edit-section" data-section-id="' + s.id + '" style="padding:4px 10px;font-size:12px;background:var(--midnight-blue);color:#fff;border:none;border-radius:5px;cursor:pointer">Edit</button>' +
                    '<button class="ot-btn-del-section" data-section-id="' + s.id + '" data-label="' + esc(s.label) + '" style="padding:4px 10px;font-size:12px;background:var(--color-destructive);color:#fff;border:none;border-radius:5px;cursor:pointer">Delete</button>' +
                    '</td></tr>';
            });
            table += '</tbody></table>';
            $ci.html(table);
        }
        lucide.createIcons();
    }

    // ===== TOGGLE HELPERS =====
    function patchOtSectionEnabled(id, isEnabled, onError) {
        $.ajax({
            url: '/api/ot/form-sections/' + id,
            method: 'PATCH',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ isEnabled: isEnabled }),
            error: function() { if (onError) onError(); HMS.toast('Failed to update section', 'error'); }
        });
    }

    $(document).on('change', '.ot-builtin-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $card = $cb.closest('.vital-field-card');
        $card.toggleClass('is-visible', isEnabled);
        $card.css({ 'border-color': isEnabled ? 'var(--aquamint)' : '', 'background': isEnabled ? 'rgba(127,255,212,0.06)' : '' });
        $card.find('.vital-toggle-track').css({ 'background': isEnabled ? 'var(--aquamint)' : '', 'border-color': isEnabled ? 'var(--aquamint)' : '' });
        patchOtSectionEnabled(id, isEnabled, function() { $cb.prop('checked', !isEnabled); });
    });

    $(document).on('change', '.ot-custom-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $track = $cb.siblings('.vital-toggle-track');
        $track.css({ 'background': isEnabled ? 'var(--aquamint)' : '', 'border-color': isEnabled ? 'var(--aquamint)' : '' });
        var sec = otFormSections.find(function(s) { return s.id === id; });
        if (sec) sec.isEnabled = isEnabled;
        patchOtSectionEnabled(id, isEnabled, function() {
            $cb.prop('checked', !isEnabled);
            $track.css({ 'background': !isEnabled ? 'var(--aquamint)' : '', 'border-color': !isEnabled ? 'var(--aquamint)' : '' });
        });
    });

    // ===== FIELD BUILDER =====
    function genFieldId() { return 'fld_' + Date.now() + '_' + Math.floor(Math.random() * 9999); }

    function renderOtFieldsList() {
        var $list = $('#otSectionFieldsList');
        if (otSectionBuilderFields.length === 0) {
            $list.html('<div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">No fields yet. Click "Add Field" to begin.</div>');
            return;
        }
        $list.empty();
        otSectionBuilderFields.forEach(function(f, i) {
            var hasOptions = needsOptions(f.type);
            var optionsVal = Array.isArray(f.options) ? f.options.join(', ') : (f.options || '');
            var typeOpts = ALL_FIELD_TYPES.map(function(t) {
                return '<option value="' + t.value + '"' + (f.type === t.value ? ' selected' : '') + '>' + t.label + '</option>';
            }).join('');
            var fHtml = '<div class="ot-field-row" data-field-idx="' + i + '" style="background:var(--color-card);border:1px solid var(--color-border);border-radius:8px;padding:10px 14px">' +
                '<div style="display:grid;grid-template-columns:1fr 180px auto;gap:8px;align-items:center">' +
                    '<input type="text" class="form-control ot-field-label-input" placeholder="Field label..." value="' + esc(f.label) + '" data-idx="' + i + '" style="font-size:13px">' +
                    '<select class="form-select ot-field-type-select" data-idx="' + i + '" style="font-size:13px">' + typeOpts + '</select>' +
                    '<button type="button" class="ot-btn-del-field" data-idx="' + i + '" style="background:var(--color-destructive);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer">&#10005;</button>' +
                '</div>' +
                '<div class="ot-field-options-row" data-idx="' + i + '" style="margin-top:8px;' + (hasOptions ? '' : 'display:none') + '">' +
                    '<input type="text" class="form-control ot-field-options-input" data-idx="' + i + '" placeholder="e.g. Option 1, Option 2, Option 3" value="' + esc(optionsVal) + '" style="font-size:12px">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:3px">Comma-separated list of choices</div>' +
                '</div>' +
                '</div>';
            $list.append(fHtml);
        });
    }

    $('#btnAddOtField').on('click', function() {
        otSectionBuilderFields.push({ id: genFieldId(), label: '', type: 'text', options: [] });
        renderOtFieldsList();
    });

    $(document).on('input', '.ot-field-label-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (otSectionBuilderFields[idx]) otSectionBuilderFields[idx].label = $(this).val();
    });

    $(document).on('change', '.ot-field-type-select', function() {
        var idx = parseInt($(this).data('idx'));
        if (!otSectionBuilderFields[idx]) return;
        otSectionBuilderFields[idx].type = $(this).val();
        var $row = $(this).closest('.ot-field-row').find('.ot-field-options-row');
        if (needsOptions($(this).val())) { $row.show(); } else { $row.hide(); otSectionBuilderFields[idx].options = []; }
    });

    $(document).on('input', '.ot-field-options-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (otSectionBuilderFields[idx]) {
            otSectionBuilderFields[idx].options = $(this).val().split(',').map(function(o) { return o.trim(); }).filter(Boolean);
        }
    });

    $(document).on('click', '.ot-btn-del-field', function() {
        var idx = parseInt($(this).data('idx'));
        otSectionBuilderFields.splice(idx, 1);
        renderOtFieldsList();
    });

    // ===== OPEN BUILDER (ADD) =====
    $('#btnAddOtCustomSection').on('click', function() {
        $('#otSectionBuilderTitle').text('Add Custom Section');
        $('#otSectionBuilderId').val('');
        $('#otSectionBuilderLabel').val('');
        otSectionBuilderFields = [];
        var $deptSel = $('#otSectionBuilderDept').empty().append('<option value="">All Departments</option>');
        otFormSectionDepts.forEach(function(d) {
            var name = d.name || d.value || d;
            $deptSel.append('<option value="' + esc(name) + '">' + esc(name) + '</option>');
        });
        renderOtFieldsList();
        new bootstrap.Offcanvas(document.getElementById('otSectionBuilderSheet')).show();
    });

    // ===== OPEN BUILDER (EDIT) =====
    $(document).on('click', '.ot-btn-edit-section', function() {
        var id = $(this).data('section-id');
        var sec = otFormSections.find(function(s) { return s.id === id; });
        if (!sec) return;
        $('#otSectionBuilderTitle').text('Edit Section: ' + sec.label);
        $('#otSectionBuilderId').val(sec.id);
        $('#otSectionBuilderLabel').val(sec.label);
        otSectionBuilderFields = JSON.parse(JSON.stringify(sec.fields || []));
        var $deptSel = $('#otSectionBuilderDept').empty().append('<option value="">All Departments</option>');
        otFormSectionDepts.forEach(function(d) {
            var name = d.name || d.value || d;
            $deptSel.append('<option value="' + esc(name) + '"' + (sec.department === name ? ' selected' : '') + '>' + esc(name) + '</option>');
        });
        renderOtFieldsList();
        new bootstrap.Offcanvas(document.getElementById('otSectionBuilderSheet')).show();
    });

    // ===== SAVE SECTION =====
    $('#btnSaveOtSectionBuilder').on('click', function() {
        var label = $('#otSectionBuilderLabel').val().trim();
        if (!label) { HMS.toast('Please enter a section name.', 'warning'); return; }
        for (var i = 0; i < otSectionBuilderFields.length; i++) {
            if (!otSectionBuilderFields[i].label.trim()) { HMS.toast('All fields must have a label.', 'warning'); return; }
        }
        if (otSectionBuilderFields.length === 0) { HMS.toast('Please add at least one field.', 'warning'); return; }

        var id      = $('#otSectionBuilderId').val();
        var dept    = $('#otSectionBuilderDept').val();
        var payload = { label: label, department: dept, fields: otSectionBuilderFields };
        var $btn    = $(this).prop('disabled', true).text('Saving...');

        var ajax = id
            ? $.ajax({ url: '/api/ot/form-sections/' + id, method: 'PATCH', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) })
            : $.ajax({ url: '/api/ot/form-sections', method: 'POST', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) });

        ajax.done(function() {
            bootstrap.Offcanvas.getInstance(document.getElementById('otSectionBuilderSheet')).hide();
            loadFormSections();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to save section');
        }).always(function() {
            $btn.prop('disabled', false).text('Save Section');
        });
    });

    // ===== DELETE SECTION =====
    $(document).on('click', '.ot-btn-del-section', function() {
        var id    = $(this).data('section-id');
        var label = $(this).data('label');
        if (!confirm('Delete custom section "' + label + '"? This cannot be undone.')) return;
        $.ajax({
            url: '/api/ot/form-sections/' + id,
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

// ===== INTRA-OP FORM SECTIONS CONFIG =====
$(document).ready(function () {
    var ioSections = [];
    var ioBuilderFields = [];

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

    var IO_BUILTIN_ICONS = {
        who_signin:              'shield-check',
        who_timeout:             'clock',
        anesthesia_induction:    'syringe',
        anesthesia_maintenance:  'activity',
        vitals_monitoring:       'heart-pulse',
        fluids_blood:            'droplets',
        surgery_timeline:        'clock',
        position_findings:       'user',
        procedure_specimens:     'file-text',
        drains_catheters:        'git-branch',
        surgical_counts:         'calculator',
        complications:           'alert-circle',
        surgical_team:           'users',
        postop_instructions:     'bed-double',
        who_signout:             'log-out'
    };

    // ===== LOAD =====
    function loadIoSections() {
        $.get('/api/ot/intraop-form-sections').done(function(sections) {
            ioSections = sections || [];
            renderIoSections();
        }).fail(function() {
            ioSections = [];
            renderIoSections();
        });
    }

    // ===== RENDER =====
    function renderIoSections() {
        var builtins = ioSections.filter(function(s) { return s.isDefault; });
        var customs  = ioSections.filter(function(s) { return !s.isDefault; });

        var $bi = $('#otIntraopBuiltinSectionsContainer').empty();
        if (builtins.length === 0) {
            $bi.html('<div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">No built-in sections found.</p></div>');
        } else {
            builtins.forEach(function(s) {
                var icon = IO_BUILTIN_ICONS[s.key] || 'layout';
                var on = s.isEnabled;
                var card = '<div class="col-sm-6 col-md-4 col-xl-3" data-io-section-id="' + s.id + '">' +
                    '<div class="vital-field-card' + (on ? ' is-visible' : '') + '" style="' + (on ? 'border-color:var(--aquamint);background:rgba(127,255,212,0.06)' : '') + '">' +
                    '<div class="vf-icon" style="background:' + (on ? 'var(--aquamint)' : 'var(--color-border)') + ';color:' + (on ? 'var(--midnight-blue)' : 'var(--color-muted-foreground)') + '">' +
                    '<i data-lucide="' + icon + '" style="width:18px;height:18px"></i></div>' +
                    '<div class="vf-info"><div class="vf-label">' + esc(s.label) + '</div>' +
                    '<div class="vf-unit">Built-in</div></div>' +
                    '<label class="vital-toggle" title="' + (on ? 'Disable' : 'Enable') + '">' +
                    '<input type="checkbox" class="io-builtin-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '>' +
                    '<span class="vital-toggle-track" style="' + (on ? 'background:var(--aquamint);border-color:var(--aquamint)' : '') + '"></span>' +
                    '</label>' +
                    '</div></div>';
                $bi.append(card);
            });
        }

        var $ci = $('#otIntraopCustomSectionsContainer').empty();
        if (customs.length === 0) {
            $ci.html('<p style="color:var(--color-muted-foreground);font-size:13px">No custom sections yet. Click &ldquo;Add Custom Section&rdquo; to create one.</p>');
        } else {
            var table = '<table class="data-table" style="margin-top:0"><thead><tr>' +
                '<th style="width:36px">#</th><th>Section Name</th><th>Fields</th><th style="width:110px">Enabled</th><th style="width:120px">Actions</th>' +
                '</tr></thead><tbody>';
            customs.forEach(function(s, i) {
                var fieldCount = (s.fields || []).length;
                var on = s.isEnabled;
                table += '<tr>' +
                    '<td>' + (i + 1) + '</td>' +
                    '<td style="font-weight:600">' + esc(s.label) + '</td>' +
                    '<td>' + fieldCount + ' field' + (fieldCount !== 1 ? 's' : '') + '</td>' +
                    '<td><label class="vital-toggle" style="margin:0"><input type="checkbox" class="io-custom-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '><span class="vital-toggle-track" style="' + (on ? 'background:var(--aquamint);border-color:var(--aquamint)' : '') + '"></span></label></td>' +
                    '<td style="display:flex;gap:6px;padding:8px 12px">' +
                    '<button class="io-btn-edit-section" data-section-id="' + s.id + '" style="padding:4px 10px;font-size:12px;background:var(--midnight-blue);color:#fff;border:none;border-radius:5px;cursor:pointer">Edit</button>' +
                    '<button class="io-btn-del-section" data-section-id="' + s.id + '" data-label="' + esc(s.label) + '" style="padding:4px 10px;font-size:12px;background:var(--color-destructive);color:#fff;border:none;border-radius:5px;cursor:pointer">Delete</button>' +
                    '</td></tr>';
            });
            table += '</tbody></table>';
            $ci.html(table);
        }
        lucide.createIcons();
    }

    // ===== TOGGLE HELPERS =====
    function patchIoSectionEnabled(id, isEnabled, onError) {
        $.ajax({
            url: '/api/ot/intraop-form-sections/' + id,
            method: 'PATCH',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ isEnabled: isEnabled }),
            error: function() { if (onError) onError(); HMS.toast('Failed to update section', 'error'); }
        });
    }

    $(document).on('change', '.io-builtin-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $card = $cb.closest('.vital-field-card');
        $card.toggleClass('is-visible', isEnabled);
        $card.css({ 'border-color': isEnabled ? 'var(--aquamint)' : '', 'background': isEnabled ? 'rgba(127,255,212,0.06)' : '' });
        $card.find('.vital-toggle-track').css({ 'background': isEnabled ? 'var(--aquamint)' : '', 'border-color': isEnabled ? 'var(--aquamint)' : '' });
        patchIoSectionEnabled(id, isEnabled, function() { $cb.prop('checked', !isEnabled); });
    });

    $(document).on('change', '.io-custom-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $track = $cb.siblings('.vital-toggle-track');
        $track.css({ 'background': isEnabled ? 'var(--aquamint)' : '', 'border-color': isEnabled ? 'var(--aquamint)' : '' });
        var sec = ioSections.find(function(s) { return s.id === id; });
        if (sec) sec.isEnabled = isEnabled;
        patchIoSectionEnabled(id, isEnabled, function() {
            $cb.prop('checked', !isEnabled);
            $track.css({ 'background': !isEnabled ? 'var(--aquamint)' : '', 'border-color': !isEnabled ? 'var(--aquamint)' : '' });
        });
    });

    // ===== FIELD BUILDER =====
    function genIoFieldId() { return 'iofld_' + Date.now() + '_' + Math.floor(Math.random() * 9999); }

    function renderIoFieldsList() {
        var $list = $('#otIntraopSectionFieldsList');
        if (ioBuilderFields.length === 0) {
            $list.html('<div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">No fields yet. Click "Add Field" to begin.</div>');
            return;
        }
        $list.empty();
        ioBuilderFields.forEach(function(f, i) {
            var hasOptions = needsOptions(f.type);
            var optionsVal = Array.isArray(f.options) ? f.options.join(', ') : (f.options || '');
            var typeOpts = ALL_FIELD_TYPES.map(function(t) {
                return '<option value="' + t.value + '"' + (f.type === t.value ? ' selected' : '') + '>' + t.label + '</option>';
            }).join('');
            var fHtml = '<div class="io-field-row" data-field-idx="' + i + '" style="background:var(--color-card);border:1px solid var(--color-border);border-radius:8px;padding:10px 14px">' +
                '<div style="display:grid;grid-template-columns:1fr 180px auto;gap:8px;align-items:center">' +
                    '<input type="text" class="form-control io-field-label-input" placeholder="Field label..." value="' + esc(f.label) + '" data-idx="' + i + '" style="font-size:13px">' +
                    '<select class="form-select io-field-type-select" data-idx="' + i + '" style="font-size:13px">' + typeOpts + '</select>' +
                    '<button type="button" class="io-btn-del-field" data-idx="' + i + '" style="background:var(--color-destructive);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer">&#10005;</button>' +
                '</div>' +
                '<div class="io-field-options-row" data-idx="' + i + '" style="margin-top:8px;' + (hasOptions ? '' : 'display:none') + '">' +
                    '<input type="text" class="form-control io-field-options-input" data-idx="' + i + '" placeholder="e.g. Option 1, Option 2, Option 3" value="' + esc(optionsVal) + '" style="font-size:12px">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:3px">Comma-separated list of choices</div>' +
                '</div>' +
                '</div>';
            $list.append(fHtml);
        });
    }

    $('#btnAddOtIntraopField').on('click', function() {
        ioBuilderFields.push({ id: genIoFieldId(), label: '', type: 'text', options: [] });
        renderIoFieldsList();
    });

    $(document).on('input', '.io-field-label-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (ioBuilderFields[idx]) ioBuilderFields[idx].label = $(this).val();
    });

    $(document).on('change', '.io-field-type-select', function() {
        var idx = parseInt($(this).data('idx'));
        if (!ioBuilderFields[idx]) return;
        ioBuilderFields[idx].type = $(this).val();
        var $row = $(this).closest('.io-field-row').find('.io-field-options-row');
        if (needsOptions($(this).val())) { $row.show(); } else { $row.hide(); ioBuilderFields[idx].options = []; }
    });

    $(document).on('input', '.io-field-options-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (ioBuilderFields[idx]) {
            ioBuilderFields[idx].options = $(this).val().split(',').map(function(o) { return o.trim(); }).filter(Boolean);
        }
    });

    $(document).on('click', '.io-btn-del-field', function() {
        var idx = parseInt($(this).data('idx'));
        ioBuilderFields.splice(idx, 1);
        renderIoFieldsList();
    });

    // ===== OPEN BUILDER (ADD) =====
    $('#btnAddOtIntraopCustomSection').on('click', function() {
        $('#otIntraopSectionBuilderTitle').text('Add Intra-Op Custom Section');
        $('#otIntraopSectionBuilderId').val('');
        $('#otIntraopSectionBuilderLabel').val('');
        ioBuilderFields = [];
        renderIoFieldsList();
        new bootstrap.Offcanvas(document.getElementById('otIntraopSectionBuilderSheet')).show();
    });

    // ===== OPEN BUILDER (EDIT) =====
    $(document).on('click', '.io-btn-edit-section', function() {
        var id = $(this).data('section-id');
        var sec = ioSections.find(function(s) { return s.id === id; });
        if (!sec) return;
        $('#otIntraopSectionBuilderTitle').text('Edit Section: ' + sec.label);
        $('#otIntraopSectionBuilderId').val(sec.id);
        $('#otIntraopSectionBuilderLabel').val(sec.label);
        ioBuilderFields = JSON.parse(JSON.stringify(sec.fields || []));
        renderIoFieldsList();
        new bootstrap.Offcanvas(document.getElementById('otIntraopSectionBuilderSheet')).show();
    });

    // ===== SAVE SECTION =====
    $('#btnSaveOtIntraopSectionBuilder').on('click', function() {
        var label = $('#otIntraopSectionBuilderLabel').val().trim();
        if (!label) { HMS.toast('Please enter a section name.', 'warning'); return; }
        for (var i = 0; i < ioBuilderFields.length; i++) {
            if (!ioBuilderFields[i].label.trim()) { HMS.toast('All fields must have a label.', 'warning'); return; }
        }
        if (ioBuilderFields.length === 0) { HMS.toast('Please add at least one field.', 'warning'); return; }

        var id      = $('#otIntraopSectionBuilderId').val();
        var payload = { label: label, fields: ioBuilderFields };
        var $btn    = $(this).prop('disabled', true).text('Saving...');

        var ajax = id
            ? $.ajax({ url: '/api/ot/intraop-form-sections/' + id, method: 'PATCH', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) })
            : $.ajax({ url: '/api/ot/intraop-form-sections', method: 'POST', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) });

        ajax.done(function() {
            bootstrap.Offcanvas.getInstance(document.getElementById('otIntraopSectionBuilderSheet')).hide();
            loadIoSections();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to save section');
        }).always(function() {
            $btn.prop('disabled', false).text('Save Section');
        });
    });

    // ===== DELETE SECTION =====
    $(document).on('click', '.io-btn-del-section', function() {
        var id    = $(this).data('section-id');
        var label = $(this).data('label');
        if (!confirm('Delete intra-op section "' + label + '"? This cannot be undone.')) return;
        $.ajax({
            url: '/api/ot/intraop-form-sections/' + id,
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
        }).done(function() {
            loadIoSections();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to delete section');
        });
    });

    loadIoSections();

    // =====================================================================
    // POST-OP RECORD FORM SECTIONS
    // =====================================================================
    var poSections = [];
    var poBuilderFields = [];

    var PO_BUILTIN_ICONS = {
        current_location:  'map-pin',
        pacu_assessment:   'activity',
        recovery_vitals:   'heart-pulse',
        pain_nausea:       'thermometer',
        pod_progress:      'clipboard-list',
        complications:     'alert-circle',
        discharge_planning:'log-out'
    };

    // ===== LOAD =====
    function loadPoSections() {
        $.get('/api/ot/postop-form-sections').done(function(sections) {
            poSections = sections || [];
            renderPoSections();
        }).fail(function() {
            poSections = [];
            renderPoSections();
        });
    }

    // ===== RENDER =====
    function renderPoSections() {
        var builtins = poSections.filter(function(s) { return s.isDefault; });
        var customs  = poSections.filter(function(s) { return !s.isDefault; });

        var $bi = $('#otPostopBuiltinSectionsContainer').empty();
        if (builtins.length === 0) {
            $bi.html('<div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">No built-in sections found.</p></div>');
        } else {
            builtins.forEach(function(s) {
                var icon = PO_BUILTIN_ICONS[s.key] || 'layout';
                var on = s.isEnabled;
                var card = '<div class="col-sm-6 col-md-4 col-xl-3" data-po-section-id="' + s.id + '">' +
                    '<div class="vital-field-card' + (on ? ' is-visible' : '') + '" style="' + (on ? 'border-color:var(--aquamint);background:rgba(127,255,212,0.06)' : '') + '">' +
                    '<div class="vf-icon" style="background:' + (on ? 'var(--aquamint)' : 'var(--color-border)') + ';color:' + (on ? 'var(--midnight-blue)' : 'var(--color-muted-foreground)') + '">' +
                    '<i data-lucide="' + icon + '" style="width:18px;height:18px"></i></div>' +
                    '<div class="vf-info"><div class="vf-label">' + esc(s.label) + '</div>' +
                    '<div class="vf-unit">Built-in</div></div>' +
                    '<label class="vital-toggle" title="' + (on ? 'Disable' : 'Enable') + '">' +
                    '<input type="checkbox" class="po-builtin-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '>' +
                    '<span class="vital-toggle-track" style="' + (on ? 'background:var(--aquamint);border-color:var(--aquamint)' : '') + '"></span>' +
                    '</label>' +
                    '</div></div>';
                $bi.append(card);
            });
        }

        var $ci = $('#otPostopCustomSectionsContainer').empty();
        if (customs.length === 0) {
            $ci.html('<p style="color:var(--color-muted-foreground);font-size:13px">No custom sections yet. Click &ldquo;Add Custom Section&rdquo; to create one.</p>');
        } else {
            var table = '<table class="data-table" style="margin-top:0"><thead><tr>' +
                '<th style="width:36px">#</th><th>Section Name</th><th>Fields</th><th style="width:110px">Enabled</th><th style="width:120px">Actions</th>' +
                '</tr></thead><tbody>';
            customs.forEach(function(s, i) {
                var fieldCount = (s.fields || []).length;
                var on = s.isEnabled;
                table += '<tr>' +
                    '<td>' + (i + 1) + '</td>' +
                    '<td style="font-weight:600">' + esc(s.label) + '</td>' +
                    '<td>' + fieldCount + ' field' + (fieldCount !== 1 ? 's' : '') + '</td>' +
                    '<td><label class="vital-toggle" style="margin:0"><input type="checkbox" class="po-custom-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '><span class="vital-toggle-track" style="' + (on ? 'background:var(--aquamint);border-color:var(--aquamint)' : '') + '"></span></label></td>' +
                    '<td style="display:flex;gap:6px;padding:8px 12px">' +
                    '<button class="po-btn-edit-section" data-section-id="' + s.id + '" style="padding:4px 10px;font-size:12px;background:var(--midnight-blue);color:#fff;border:none;border-radius:5px;cursor:pointer">Edit</button>' +
                    '<button class="po-btn-del-section" data-section-id="' + s.id + '" data-label="' + esc(s.label) + '" style="padding:4px 10px;font-size:12px;background:var(--color-destructive);color:#fff;border:none;border-radius:5px;cursor:pointer">Delete</button>' +
                    '</td></tr>';
            });
            table += '</tbody></table>';
            $ci.html(table);
        }
        lucide.createIcons();
    }

    // ===== TOGGLE HELPERS =====
    function patchPoSectionEnabled(id, isEnabled, onError) {
        $.ajax({
            url: '/api/ot/postop-form-sections/' + id,
            method: 'PATCH',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ isEnabled: isEnabled }),
            error: function() { if (onError) onError(); HMS.toast('Failed to update section', 'error'); }
        });
    }

    $(document).on('change', '.po-builtin-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $card = $cb.closest('.vital-field-card');
        $card.toggleClass('is-visible', isEnabled);
        $card.css({ 'border-color': isEnabled ? 'var(--aquamint)' : '', 'background': isEnabled ? 'rgba(127,255,212,0.06)' : '' });
        $card.find('.vital-toggle-track').css({ 'background': isEnabled ? 'var(--aquamint)' : '', 'border-color': isEnabled ? 'var(--aquamint)' : '' });
        patchPoSectionEnabled(id, isEnabled, function() { $cb.prop('checked', !isEnabled); });
    });

    $(document).on('change', '.po-custom-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $track = $cb.siblings('.vital-toggle-track');
        $track.css({ 'background': isEnabled ? 'var(--aquamint)' : '', 'border-color': isEnabled ? 'var(--aquamint)' : '' });
        var sec = poSections.find(function(s) { return s.id === id; });
        if (sec) sec.isEnabled = isEnabled;
        patchPoSectionEnabled(id, isEnabled, function() {
            $cb.prop('checked', !isEnabled);
            $track.css({ 'background': !isEnabled ? 'var(--aquamint)' : '', 'border-color': !isEnabled ? 'var(--aquamint)' : '' });
        });
    });

    // ===== FIELD BUILDER =====
    function genPoFieldId() { return 'pofld_' + Date.now() + '_' + Math.floor(Math.random() * 9999); }

    function renderPoFieldsList() {
        var $list = $('#otPostopSectionFieldsList');
        if (poBuilderFields.length === 0) {
            $list.html('<div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">No fields yet. Click "Add Field" to begin.</div>');
            return;
        }
        $list.empty();
        poBuilderFields.forEach(function(f, i) {
            var hasOptions = needsOptions(f.type);
            var optionsVal = Array.isArray(f.options) ? f.options.join(', ') : (f.options || '');
            var typeOpts = ALL_FIELD_TYPES.map(function(t) {
                return '<option value="' + t.value + '"' + (f.type === t.value ? ' selected' : '') + '>' + t.label + '</option>';
            }).join('');
            var fHtml = '<div class="po-field-row" data-field-idx="' + i + '" style="background:var(--color-card);border:1px solid var(--color-border);border-radius:8px;padding:10px 14px">' +
                '<div style="display:grid;grid-template-columns:1fr 180px auto;gap:8px;align-items:center">' +
                    '<input type="text" class="form-control po-field-label-input" placeholder="Field label..." value="' + esc(f.label) + '" data-idx="' + i + '" style="font-size:13px">' +
                    '<select class="form-select po-field-type-select" data-idx="' + i + '" style="font-size:13px">' + typeOpts + '</select>' +
                    '<button type="button" class="po-btn-del-field" data-idx="' + i + '" style="background:var(--color-destructive);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer">&#10005;</button>' +
                '</div>' +
                '<div class="po-field-options-row" data-idx="' + i + '" style="margin-top:8px;' + (hasOptions ? '' : 'display:none') + '">' +
                    '<input type="text" class="form-control po-field-options-input" data-idx="' + i + '" placeholder="e.g. Option 1, Option 2, Option 3" value="' + esc(optionsVal) + '" style="font-size:12px">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:3px">Comma-separated list of choices</div>' +
                '</div>' +
                '</div>';
            $list.append(fHtml);
        });
    }

    $('#btnAddOtPostopField').on('click', function() {
        poBuilderFields.push({ id: genPoFieldId(), label: '', type: 'text', options: [] });
        renderPoFieldsList();
    });

    $(document).on('input', '.po-field-label-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (poBuilderFields[idx]) poBuilderFields[idx].label = $(this).val();
    });

    $(document).on('change', '.po-field-type-select', function() {
        var idx = parseInt($(this).data('idx'));
        if (!poBuilderFields[idx]) return;
        poBuilderFields[idx].type = $(this).val();
        var $row = $(this).closest('.po-field-row').find('.po-field-options-row');
        if (needsOptions($(this).val())) { $row.show(); } else { $row.hide(); poBuilderFields[idx].options = []; }
    });

    $(document).on('input', '.po-field-options-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (poBuilderFields[idx]) {
            poBuilderFields[idx].options = $(this).val().split(',').map(function(o) { return o.trim(); }).filter(Boolean);
        }
    });

    $(document).on('click', '.po-btn-del-field', function() {
        var idx = parseInt($(this).data('idx'));
        poBuilderFields.splice(idx, 1);
        renderPoFieldsList();
    });

    // ===== OPEN BUILDER (ADD) =====
    $('#btnAddOtPostopCustomSection').on('click', function() {
        $('#otPostopSectionBuilderTitle').text('Add Post-Op Custom Section');
        $('#otPostopSectionBuilderId').val('');
        $('#otPostopSectionBuilderLabel').val('');
        poBuilderFields = [];
        renderPoFieldsList();
        new bootstrap.Offcanvas(document.getElementById('otPostopSectionBuilderSheet')).show();
    });

    // ===== OPEN BUILDER (EDIT) =====
    $(document).on('click', '.po-btn-edit-section', function() {
        var id = $(this).data('section-id');
        var sec = poSections.find(function(s) { return s.id === id; });
        if (!sec) return;
        $('#otPostopSectionBuilderTitle').text('Edit Section: ' + sec.label);
        $('#otPostopSectionBuilderId').val(sec.id);
        $('#otPostopSectionBuilderLabel').val(sec.label);
        poBuilderFields = JSON.parse(JSON.stringify(sec.fields || []));
        renderPoFieldsList();
        new bootstrap.Offcanvas(document.getElementById('otPostopSectionBuilderSheet')).show();
    });

    // ===== SAVE SECTION =====
    $('#btnSaveOtPostopSectionBuilder').on('click', function() {
        var label = $('#otPostopSectionBuilderLabel').val().trim();
        if (!label) { HMS.toast('Please enter a section name.', 'warning'); return; }
        for (var i = 0; i < poBuilderFields.length; i++) {
            if (!poBuilderFields[i].label.trim()) { HMS.toast('All fields must have a label.', 'warning'); return; }
        }
        if (poBuilderFields.length === 0) { HMS.toast('Please add at least one field.', 'warning'); return; }

        var id      = $('#otPostopSectionBuilderId').val();
        var payload = { label: label, fields: poBuilderFields };
        var $btn    = $(this).prop('disabled', true).text('Saving...');

        var ajax = id
            ? $.ajax({ url: '/api/ot/postop-form-sections/' + id, method: 'PATCH', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) })
            : $.ajax({ url: '/api/ot/postop-form-sections', method: 'POST', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) });

        ajax.done(function() {
            bootstrap.Offcanvas.getInstance(document.getElementById('otPostopSectionBuilderSheet')).hide();
            loadPoSections();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to save section');
        }).always(function() {
            $btn.prop('disabled', false).text('Save Section');
        });
    });

    // ===== DELETE SECTION =====
    $(document).on('click', '.po-btn-del-section', function() {
        var id    = $(this).data('section-id');
        var label = $(this).data('label');
        if (!confirm('Delete post-op section "' + label + '"? This cannot be undone.')) return;
        $.ajax({
            url: '/api/ot/postop-form-sections/' + id,
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
        }).done(function() {
            loadPoSections();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to delete section');
        });
    });

    loadPoSections();
});
