$(document).ready(function () {
    var configData = {};
    var seriesData = [];

    function esc(s) { return $('<span>').text(s || '').html(); }

    function loadAll() {
        $.get('/api/opd-config').done(function (data) {
            configData = data || {};
            renderAll();
        });
    }

    function loadSeries() {
        $.get('/api/ipd-number-series').done(function (data) {
            seriesData = data || [];
            renderSeries();
        });
    }

    function buildPreviewStr(prefix, startingNumber, padding) {
        var num = Math.max(parseInt(startingNumber) || 1, 1);
        var numStr = (parseInt(padding) > 0) ? String(num).padStart(parseInt(padding), '0') : String(num);
        return prefix + numStr;
    }

    function renderSeries() {
        var $container = $('#ipdNumberSeriesContainer');
        $container.empty();
        if (seriesData.length === 0) {
            $container.html('<div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">No number series configured.</p></div>');
            return;
        }
        var icons = { admission_id: 'hash' };
        seriesData.forEach(function (s) {
            var icon = icons[s.seriesKey] || 'hash';
            var html = '<div class="col-md-6 col-xl-4" data-series-key="' + esc(s.seriesKey) + '">' +
                '<div class="series-card">' +
                    '<div class="series-header">' +
                        '<i data-lucide="' + icon + '" style="width:16px;height:16px"></i>' +
                        '<h6>' + esc(s.label) + '</h6>' +
                    '</div>' +
                    '<div class="series-body">' +
                        '<div class="row g-3">' +
                            '<div class="col-12">' +
                                '<label class="form-label">Prefix</label>' +
                                '<input type="text" class="form-control series-prefix" value="' + esc(s.prefix) + '" maxlength="20" placeholder="e.g. IPD-">' +
                                '<div class="form-text" style="font-size:11px">Characters prepended to each generated Admission ID (e.g. <code>IPD-</code>, <code>ADM-</code>)</div>' +
                            '</div>' +
                            '<div class="col-6">' +
                                '<label class="form-label">Starting Number</label>' +
                                '<input type="number" class="form-control series-start" value="' + s.startingNumber + '" min="1" step="1">' +
                            '</div>' +
                            '<div class="col-6">' +
                                '<label class="form-label">Zero Padding</label>' +
                                '<select class="form-select series-padding" style="font-size:13px">' +
                                    '<option value="0"' + (s.padding === 0 ? ' selected' : '') + '>None (1, 2, 3…)</option>' +
                                    '<option value="3"' + (s.padding === 3 ? ' selected' : '') + '>3 digits (001…)</option>' +
                                    '<option value="4"' + (s.padding === 4 ? ' selected' : '') + '>4 digits (0001…)</option>' +
                                    '<option value="5"' + (s.padding === 5 ? ' selected' : '') + '>5 digits (00001…)</option>' +
                                    '<option value="6"' + (s.padding === 6 ? ' selected' : '') + '>6 digits (000001…)</option>' +
                                '</select>' +
                            '</div>' +
                            '<div class="col-12 d-flex align-items-center justify-content-between gap-3">' +
                                '<div>' +
                                    '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-muted-foreground);margin-bottom:4px">Next ID Preview</div>' +
                                    '<span class="series-preview">' + esc(s.preview) + '</span>' +
                                '</div>' +
                                '<button class="btn btn-save-series" data-key="' + esc(s.seriesKey) + '">Save</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
            $container.append(html);
        });
        lucide.createIcons();

        $container.find('.series-prefix, .series-start, .series-padding').on('input change', function () {
            var $card = $(this).closest('[data-series-key]');
            var prefix = $card.find('.series-prefix').val();
            var start  = $card.find('.series-start').val();
            var pad    = $card.find('.series-padding').val();
            $card.find('.series-preview').text(buildPreviewStr(prefix, start, pad));
        });
    }

    $(document).on('click', '.btn-save-series', function () {
        var $card = $(this).closest('[data-series-key]');
        var key     = $card.data('series-key');
        var prefix  = $.trim($card.find('.series-prefix').val());
        var start   = parseInt($card.find('.series-start').val()) || 1;
        var padding = parseInt($card.find('.series-padding').val()) || 0;

        if (!prefix) { HMS.toast('Prefix cannot be empty', 'warning'); return; }

        var $btn = $(this);
        $btn.prop('disabled', true).text('Saving…');

        $.ajax({
            url: '/api/ipd-number-series/' + key,
            method: 'PUT',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ prefix: prefix, startingNumber: start, padding: padding }),
            success: function () { loadSeries(); },
            error: function (xhr) { HMS.ajaxError(xhr, 'Failed to save series'); },
            complete: function () { $btn.prop('disabled', false).text('Save'); }
        });
    });

    function renderAll() {
        $('#ipdConfigContainer .card[data-category]').each(function () {
            var category = $(this).data('category');
            var items = configData[category] || [];
            renderList($(this), items);
        });
    }

    function renderList($card, items) {
        var $list = $card.find('.config-list');
        $card.find('.item-count').text(items.filter(function (i) { return i.isActive; }).length);

        if (items.length === 0) {
            $list.html('<div style="padding:20px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No items configured</div>');
            return;
        }

        var html = '';
        items.forEach(function (item) {
            html += '<div class="config-item' + (item.isActive ? '' : ' inactive') + '" data-id="' + item.id + '">' +
                '<span class="item-name">' + esc(item.name) + '</span>' +
                '<div class="item-actions">' +
                    '<button class="btn-toggle" title="' + (item.isActive ? 'Deactivate' : 'Activate') + '" data-id="' + item.id + '" data-active="' + (item.isActive ? '1' : '0') + '">' +
                        '<i data-lucide="' + (item.isActive ? 'eye' : 'eye-off') + '" style="width:14px;height:14px"></i>' +
                    '</button>' +
                    '<button class="btn-edit" title="Edit" data-id="' + item.id + '">' +
                        '<i data-lucide="pencil" style="width:14px;height:14px"></i>' +
                    '</button>' +
                    '<button class="btn-delete" title="Delete" data-id="' + item.id + '">' +
                        '<i data-lucide="trash-2" style="width:14px;height:14px"></i>' +
                    '</button>' +
                '</div>' +
            '</div>';
        });
        $list.html(html);
        lucide.createIcons();
    }

    $(document).on('click', '.btn-add-item', function () {
        var $card = $(this).closest('.card');
        var $input = $card.find('.config-new-input');
        var name = $.trim($input.val());
        var category = $card.data('category');

        if (!name) { $input.focus(); return; }

        $.ajax({
            url: '/api/opd-config',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ category: category, name: name }),
            success: function () { $input.val(''); loadAll(); },
            error: function (xhr) {
                HMS.ajaxError(xhr, 'Failed to add item');
            }
        });
    });

    $(document).on('keypress', '.config-new-input', function (e) {
        if (e.which === 13) { $(this).closest('.card').find('.btn-add-item').click(); }
    });

    $(document).on('click', '.btn-toggle', function () {
        var id = $(this).data('id');
        var currentActive = $(this).data('active') === 1;
        $.ajax({
            url: '/api/opd-config/' + id,
            method: 'PUT',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ isActive: !currentActive }),
            success: function () { loadAll(); },
            error: function () { HMS.toast('Failed to update item', 'error'); }
        });
    });

    $(document).on('click', '.btn-edit', function () {
        var $item = $(this).closest('.config-item');
        var id = $(this).data('id');
        var currentName = $item.find('.item-name').text();

        $item.find('.item-name').html('<input type="text" class="edit-input" value="' + esc(currentName) + '">');
        var $editInput = $item.find('.edit-input');
        $editInput.focus().select();

        function saveEdit() {
            var newName = $.trim($editInput.val());
            if (!newName || newName === currentName) { loadAll(); return; }
            $.ajax({
                url: '/api/opd-config/' + id,
                method: 'PUT',
                contentType: 'application/json',
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                data: JSON.stringify({ name: newName }),
                success: function () { loadAll(); },
                error: function (xhr) { HMS.ajaxError(xhr, 'Failed to update'); loadAll(); }
            });
        }
        $editInput.on('blur', saveEdit);
        $editInput.on('keypress', function (e) { if (e.which === 13) { $(this).blur(); } });
        $editInput.on('keydown', function (e) { if (e.which === 27) { loadAll(); } });
    });

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');
        var name = $(this).closest('.config-item').find('.item-name').text();
        if (!confirm('Are you sure you want to delete "' + name + '"? This cannot be undone.')) return;
        $.ajax({
            url: '/api/opd-config/' + id,
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: function () { loadAll(); },
            error: function () { HMS.toast('Failed to delete item', 'error'); }
        });
    });

    loadAll();
    loadSeries();
});

// ============================================================
// IPD Clinical Order Form Sections
// ============================================================
$(document).ready(function () {
    var ipdFormSectionsData = [];
    var ipdFormSectionDepts = [];
    var ipdSectionBuilderFields = [];

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

    function loadIpdFormSectionsConfig() {
        $.get('/api/ipd/form-sections').done(function(sections) {
            ipdFormSectionsData = sections || [];
            renderIpdFormSections();
        }).fail(function() {
            ipdFormSectionsData = [];
            renderIpdFormSections();
        });
        $.get('/api/hr-config/department').done(function(depts) {
            ipdFormSectionDepts = depts || [];
        }).fail(function() {
            ipdFormSectionDepts = [];
        });
    }

    var BUILTIN_ICONS = {
        medication: 'pill', investigation: 'flask-conical', ivfluids: 'droplets',
        diet: 'utensils', nursing: 'heart-pulse', procedure: 'stethoscope', ordersummary: 'clipboard-list'
    };

    function renderIpdFormSections() {
        var builtins = ipdFormSectionsData.filter(function(s) { return s.isDefault; });
        var customs  = ipdFormSectionsData.filter(function(s) { return !s.isDefault; });

        var $bi = $('#ipdBuiltinSectionsContainer').empty();
        if (builtins.length === 0) {
            $bi.html('<div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">No built-in sections found.</p></div>');
        } else {
            builtins.forEach(function(s) {
                var icon = BUILTIN_ICONS[s.key] || 'layout';
                var on = s.isEnabled;
                var card = '<div class="col-sm-6 col-md-4 col-xl-3" data-section-id="' + s.id + '">' +
                    '<div class="vital-field-card' + (on ? ' is-visible' : '') + '" style="' + (on ? 'border-color:var(--aqua-mint);background:rgba(127,255,212,0.06)' : '') + '">' +
                    '<div class="vf-icon" style="background:' + (on ? 'var(--aqua-mint)' : 'var(--color-border)') + ';color:' + (on ? 'var(--midnight-blue)' : 'var(--color-muted-foreground)') + '">' +
                    '<i data-lucide="' + icon + '" style="width:18px;height:18px"></i></div>' +
                    '<div class="vf-info"><div class="vf-label">' + esc(s.label) + '</div>' +
                    '<div class="vf-unit">Built-in</div></div>' +
                    '<label class="vital-toggle" title="' + (on ? 'Disable' : 'Enable') + '">' +
                    '<input type="checkbox" class="ipd-builtin-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '>' +
                    '<span class="vital-toggle-track" style="' + (on ? 'background:var(--aqua-mint);border-color:var(--aqua-mint)' : '') + '"></span>' +
                    '</label>' +
                    '</div></div>';
                $bi.append(card);
            });
        }

        var $ci = $('#ipdCustomSectionsContainer').empty();
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
                    '<td><label class="vital-toggle" style="margin:0"><input type="checkbox" class="ipd-custom-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '><span class="vital-toggle-track" style="' + (on ? 'background:var(--aqua-mint);border-color:var(--aqua-mint)' : '') + '"></span></label></td>' +
                    '<td style="display:flex;gap:6px;padding:8px 12px">' +
                    '<button class="ipd-btn-edit-section" data-section-id="' + s.id + '" style="padding:4px 10px;font-size:12px;background:var(--midnight-blue);color:#fff;border:none;border-radius:5px;cursor:pointer">Edit</button>' +
                    '<button class="ipd-btn-del-section" data-section-id="' + s.id + '" data-label="' + esc(s.label) + '" style="padding:4px 10px;font-size:12px;background:var(--color-destructive);color:#fff;border:none;border-radius:5px;cursor:pointer">Delete</button>' +
                    '</td></tr>';
            });
            table += '</tbody></table>';
            $ci.html(table);
        }
        lucide.createIcons();
    }

    function patchIpdSectionEnabled(id, isEnabled, onError) {
        $.ajax({
            url: '/api/ipd/form-sections/' + id,
            method: 'PATCH',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ isEnabled: isEnabled }),
            error: function() { if (onError) onError(); HMS.toast('Failed to update section', 'error'); }
        });
    }

    $(document).on('change', '.ipd-builtin-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $card = $cb.closest('.vital-field-card');
        $card.toggleClass('is-visible', isEnabled);
        $card.css({ 'border-color': isEnabled ? 'var(--aqua-mint)' : '', 'background': isEnabled ? 'rgba(127,255,212,0.06)' : '' });
        $card.find('.vital-toggle-track').css({ 'background': isEnabled ? 'var(--aqua-mint)' : '', 'border-color': isEnabled ? 'var(--aqua-mint)' : '' });
        patchIpdSectionEnabled(id, isEnabled, function() { $cb.prop('checked', !isEnabled); });
    });

    $(document).on('change', '.ipd-custom-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $track = $cb.siblings('.vital-toggle-track');
        $track.css({ 'background': isEnabled ? 'var(--aqua-mint)' : '', 'border-color': isEnabled ? 'var(--aqua-mint)' : '' });
        var sec = ipdFormSectionsData.find(function(s) { return s.id === id; });
        if (sec) sec.isEnabled = isEnabled;
        patchIpdSectionEnabled(id, isEnabled, function() {
            $cb.prop('checked', !isEnabled);
            $track.css({ 'background': !isEnabled ? 'var(--aqua-mint)' : '', 'border-color': !isEnabled ? 'var(--aqua-mint)' : '' });
        });
    });

    function genFieldId() { return 'fld_' + Date.now() + '_' + Math.floor(Math.random() * 9999); }

    function renderIpdFieldsList() {
        var $list = $('#ipdSectionFieldsList');
        if (ipdSectionBuilderFields.length === 0) {
            $list.html('<div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">No fields yet. Click "Add Field" to begin.</div>');
            return;
        }
        $list.empty();
        ipdSectionBuilderFields.forEach(function(f, i) {
            var hasOptions = needsOptions(f.type);
            var optionsVal = Array.isArray(f.options) ? f.options.join(', ') : (f.options || '');
            var typeOpts = ALL_FIELD_TYPES.map(function(t) {
                return '<option value="' + t.value + '"' + (f.type === t.value ? ' selected' : '') + '>' + t.label + '</option>';
            }).join('');
            var fHtml = '<div class="ipd-field-row" data-field-idx="' + i + '" style="background:var(--color-card);border:1px solid var(--color-border);border-radius:8px;padding:10px 14px">' +
                '<div style="display:grid;grid-template-columns:1fr 180px auto;gap:8px;align-items:center">' +
                    '<input type="text" class="form-control ipd-field-label-input" placeholder="Field label..." value="' + esc(f.label) + '" data-idx="' + i + '" style="font-size:13px">' +
                    '<select class="form-select ipd-field-type-select" data-idx="' + i + '" style="font-size:13px">' + typeOpts + '</select>' +
                    '<button type="button" class="ipd-btn-del-field" data-idx="' + i + '" style="background:var(--color-destructive);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer">✕</button>' +
                '</div>' +
                '<div class="ipd-field-options-row" data-idx="' + i + '" style="margin-top:8px;' + (hasOptions ? '' : 'display:none') + '">' +
                    '<input type="text" class="form-control ipd-field-options-input" data-idx="' + i + '" placeholder="e.g. Option 1, Option 2, Option 3" value="' + esc(optionsVal) + '" style="font-size:12px">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:3px">Comma-separated list of choices</div>' +
                '</div>' +
                '</div>';
            $list.append(fHtml);
        });
    }

    $('#btnAddIpdField').on('click', function() {
        ipdSectionBuilderFields.push({ id: genFieldId(), label: '', type: 'text', options: [] });
        renderIpdFieldsList();
    });

    $(document).on('input', '.ipd-field-label-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (ipdSectionBuilderFields[idx]) ipdSectionBuilderFields[idx].label = $(this).val();
    });

    $(document).on('change', '.ipd-field-type-select', function() {
        var idx = parseInt($(this).data('idx'));
        if (!ipdSectionBuilderFields[idx]) return;
        ipdSectionBuilderFields[idx].type = $(this).val();
        var $row = $(this).closest('.ipd-field-row').find('.ipd-field-options-row');
        if (needsOptions($(this).val())) { $row.show(); } else { $row.hide(); ipdSectionBuilderFields[idx].options = []; }
    });

    $(document).on('input', '.ipd-field-options-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (ipdSectionBuilderFields[idx]) {
            ipdSectionBuilderFields[idx].options = $(this).val().split(',').map(function(o) { return o.trim(); }).filter(Boolean);
        }
    });

    $(document).on('click', '.ipd-btn-del-field', function() {
        var idx = parseInt($(this).data('idx'));
        ipdSectionBuilderFields.splice(idx, 1);
        renderIpdFieldsList();
    });

    $('#btnAddIpdCustomSection').on('click', function() {
        $('#ipdSectionBuilderTitle').text('Add Custom Section');
        $('#ipdSectionBuilderId').val('');
        $('#ipdSectionBuilderLabel').val('');
        ipdSectionBuilderFields = [];
        var $deptSel = $('#ipdSectionBuilderDept').empty().append('<option value="">All Departments</option>');
        ipdFormSectionDepts.forEach(function(d) {
            var name = d.name || d.value || d;
            $deptSel.append('<option value="' + esc(name) + '">' + esc(name) + '</option>');
        });
        renderIpdFieldsList();
        new bootstrap.Offcanvas(document.getElementById('ipdSectionBuilderSheet')).show();
    });

    $(document).on('click', '.ipd-btn-edit-section', function() {
        var id = $(this).data('section-id');
        var sec = ipdFormSectionsData.find(function(s) { return s.id === id; });
        if (!sec) return;
        $('#ipdSectionBuilderTitle').text('Edit Section: ' + sec.label);
        $('#ipdSectionBuilderId').val(sec.id);
        $('#ipdSectionBuilderLabel').val(sec.label);
        ipdSectionBuilderFields = JSON.parse(JSON.stringify(sec.fields || []));
        var $deptSel = $('#ipdSectionBuilderDept').empty().append('<option value="">All Departments</option>');
        ipdFormSectionDepts.forEach(function(d) {
            var name = d.name || d.value || d;
            $deptSel.append('<option value="' + esc(name) + '"' + (sec.department === name ? ' selected' : '') + '>' + esc(name) + '</option>');
        });
        renderIpdFieldsList();
        new bootstrap.Offcanvas(document.getElementById('ipdSectionBuilderSheet')).show();
    });

    $('#btnSaveIpdSectionBuilder').on('click', function() {
        var label = $('#ipdSectionBuilderLabel').val().trim();
        if (!label) { HMS.toast('Please enter a section name.', 'warning'); return; }
        for (var i = 0; i < ipdSectionBuilderFields.length; i++) {
            if (!ipdSectionBuilderFields[i].label.trim()) { HMS.toast('All fields must have a label.', 'warning'); return; }
        }
        if (ipdSectionBuilderFields.length === 0) { HMS.toast('Please add at least one field.', 'warning'); return; }

        var id      = $('#ipdSectionBuilderId').val();
        var dept    = $('#ipdSectionBuilderDept').val();
        var payload = { label: label, department: dept, fields: ipdSectionBuilderFields };
        var $btn    = $(this).prop('disabled', true).text('Saving...');

        var ajax = id
            ? $.ajax({ url: '/api/ipd/form-sections/' + id, method: 'PATCH', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) })
            : $.ajax({ url: '/api/ipd/form-sections', method: 'POST', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) });

        ajax.done(function() {
            bootstrap.Offcanvas.getInstance(document.getElementById('ipdSectionBuilderSheet')).hide();
            loadIpdFormSectionsConfig();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to save section');
        }).always(function() {
            $btn.prop('disabled', false).text('Save Section');
        });
    });

    $(document).on('click', '.ipd-btn-del-section', function() {
        var id    = $(this).data('section-id');
        var label = $(this).data('label');
        if (!confirm('Delete custom section "' + label + '"? This cannot be undone.')) return;
        $.ajax({
            url: '/api/ipd/form-sections/' + id,
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
        }).done(function() {
            loadIpdFormSectionsConfig();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to delete section');
        });
    });

    if ($('#ipdBuiltinSectionsContainer').length) {
        loadIpdFormSectionsConfig();
    }
});

// ============================================================
// IPD Discharge Clearance Approvals
// ============================================================
$(document).ready(function () {
    if (!$('#ipdDischClearanceContainer').length) return;

    function esc(s) { return $('<span>').text(s || '').html(); }

    var CLEARANCE_ITEMS = [
        {
            key:  'discharge_require_hospital_clearance',
            icon: '🏥',
            label: 'Hospital / Billing Clearance',
            desc:  'All hospital charges (room, nursing, procedures) must be settled before discharge can proceed.'
        },
        {
            key:  'discharge_require_pharmacy_clearance',
            icon: '💊',
            label: 'Pharmacy Clearance',
            desc:  'All pharmacy and medication charges must be paid before the patient is discharged.'
        },
        {
            key:  'discharge_require_lab_clearance',
            icon: '🔬',
            label: 'Laboratory Clearance',
            desc:  'All lab and investigation charges must be settled before discharge can proceed.'
        }
    ];

    function loadDischClearance() {
        $.get('/api/hospital-info/settings/ipd_discharge', function(res) {
            renderDischClearance((res && res.settings) || {});
        }).fail(function() {
            renderDischClearance({});
        });
    }

    function renderDischClearance(settings) {
        var html = '';
        CLEARANCE_ITEMS.forEach(function(item) {
            var enabled = settings[item.key] !== '0';
            html +=
                '<div class="col-md-6 col-xl-4">' +
                    '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:20px;height:100%;display:flex;flex-direction:column;gap:14px">' +
                        // Header row: icon + label + toggle
                        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">' +
                            '<div style="display:flex;align-items:center;gap:12px">' +
                                '<span style="font-size:26px;line-height:1">' + item.icon + '</span>' +
                                '<div style="font-size:14px;font-weight:700;color:var(--midnight-blue);line-height:1.3">' + esc(item.label) + '</div>' +
                            '</div>' +
                            // Toggle switch
                            '<label style="cursor:pointer;flex-shrink:0;display:flex;align-items:center;gap:8px">' +
                                '<input type="checkbox" class="disch-clearance-toggle" data-key="' + item.key + '"' + (enabled ? ' checked' : '') + ' style="position:absolute;opacity:0;width:0;height:0">' +
                                '<div class="disch-toggle-track" style="width:46px;height:26px;border-radius:13px;position:relative;cursor:pointer;background:' + (enabled ? 'var(--aqua-mint,#5eead4)' : '#cbd5e1') + ';transition:background .2s;flex-shrink:0">' +
                                    '<div class="disch-toggle-thumb" style="position:absolute;top:3px;left:' + (enabled ? '23px' : '3px') + ';width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);transition:left .2s"></div>' +
                                '</div>' +
                                '<span class="disch-clearance-label" style="font-size:12px;font-weight:700;color:' + (enabled ? '#065F46' : '#94a3b8') + '">' + (enabled ? 'Required' : 'Off') + '</span>' +
                            '</label>' +
                        '</div>' +
                        // Description
                        '<div style="font-size:12px;color:var(--color-muted-foreground);line-height:1.6">' + esc(item.desc) + '</div>' +
                        // Status pill
                        '<div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;width:fit-content;' +
                            (enabled ? 'background:rgba(16,185,129,0.1);color:#065F46;border:1px solid rgba(16,185,129,0.25)' : 'background:rgba(100,116,139,0.1);color:#64748b;border:1px solid rgba(100,116,139,0.2)') + '">' +
                            (enabled ? '✅ Approval Required' : '⏭ Not Required — Skipped') +
                        '</div>' +
                    '</div>' +
                '</div>';
        });
        $('#ipdDischClearanceContainer').html(html);
    }

    $(document).on('change', '.disch-clearance-toggle', function() {
        var $cb      = $(this);
        var key      = $cb.data('key');
        var enabled  = $cb.is(':checked');
        var $card    = $cb.closest('[style]');
        var $track   = $cb.siblings('.disch-toggle-track');
        var $thumb   = $track.find('.disch-toggle-thumb');
        var $lbl     = $cb.siblings('.disch-clearance-label');
        var $pill    = $card.find('[style*="border-radius:20px"]').last();

        // Update toggle visual
        $track.css('background', enabled ? 'var(--aqua-mint,#5eead4)' : '#cbd5e1');
        $thumb.css('left', enabled ? '23px' : '3px');
        $lbl.css('color', enabled ? '#065F46' : '#94a3b8').text(enabled ? 'Required' : 'Off');

        // Update status pill
        $pill.css(enabled
            ? { background: 'rgba(16,185,129,0.1)', color: '#065F46', border: '1px solid rgba(16,185,129,0.25)' }
            : { background: 'rgba(100,116,139,0.1)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }
        ).text(enabled ? '✅ Approval Required' : '⏭ Not Required — Skipped');

        // Persist
        var payload = {};
        payload[key] = enabled ? '1' : '0';
        $.ajax({
            url: '/api/hospital-info/settings/ipd_discharge',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify(payload),
            success: function() {
                if (window.showToast) showToast('Clearance setting saved', 'success');
            },
            error: function() {
                if (window.showToast) showToast('Failed to save setting', 'error');
                // Revert toggle on failure
                $cb.prop('checked', !enabled);
                $track.css('background', !enabled ? 'var(--aqua-mint,#5eead4)' : '#cbd5e1');
                $thumb.css('left', !enabled ? '23px' : '3px');
            }
        });
    });

    loadDischClearance();
});
