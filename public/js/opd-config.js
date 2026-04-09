$(document).ready(function () {
    var configData = {};
    var seriesData = [];
    var formSections = [];
    var formSectionDepts = [];
    var sectionBuilderFields = [];

    function esc(s) { return $('<span>').text(s || '').html(); }

    function loadAll() {
        $.get('/api/opd-config').done(function (data) {
            configData = data || {};
            renderAll();
        });
    }

    function loadSeries() {
        $.get('/api/opd-number-series').done(function (data) {
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
        var $container = $('#numberSeriesContainer');
        $container.empty();
        if (seriesData.length === 0) {
            $container.html('<div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">No number series configured.</p></div>');
            return;
        }
        var icons = { visit_id: 'clipboard-list' };
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
                                '<input type="text" class="form-control series-prefix" value="' + esc(s.prefix) + '" maxlength="20" placeholder="e.g. OPD-">' +
                                '<div class="form-text" style="font-size:11px">Characters prepended to each generated Visit ID (e.g. <code>OPD-</code>, <code>V-</code>)</div>' +
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
            url: '/api/opd-number-series/' + key,
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
        $('#opdConfigContainer .card[data-category]').each(function () {
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

    /* ── Vital Fields ── */
    var vitalFieldsData = [];

    var VITAL_COLORS = {
        temperature:         { bg: '#FEE2E2', color: '#DC2626' },
        blood_pressure:      { bg: '#FCE7F3', color: '#DB2777' },
        heart_rate:          { bg: '#DBEAFE', color: '#2563EB' },
        respiratory_rate:    { bg: '#E0F2FE', color: '#0284C7' },
        sp_o2:               { bg: '#EDE9FE', color: '#7C3AED' },
        blood_sugar:         { bg: '#FEF3C7', color: '#D97706' },
        weight:              { bg: '#D1FAE5', color: '#059669' },
        pain_scale:          { bg: '#FFF7ED', color: '#EA580C' },
        height:              { bg: '#DCFCE7', color: '#16A34A' },
        temperature_c:       { bg: '#FEE2E2', color: '#DC2626' },
        bmi:                 { bg: '#FEF9C3', color: '#CA8A04' },
        head_circumference:  { bg: '#DBEAFE', color: '#1D4ED8' },
        waist_circumference: { bg: '#F3E8FF', color: '#7E22CE' },
        urine_output:        { bg: '#CFFAFE', color: '#0E7490' },
        glasgow_coma:        { bg: '#E0E7FF', color: '#3730A3' },
    };

    function loadVitalFields() {
        $.get('/api/opd-vital-fields').done(function (data) {
            vitalFieldsData = data || [];
            renderVitalFields();
        });
    }

    function renderVitalFields() {
        var $container = $('#vitalFieldsContainer');
        $container.empty();

        if (vitalFieldsData.length === 0) {
            $container.html('<div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">No vital fields found.</p></div>');
            return;
        }

        vitalFieldsData.forEach(function (f) {
            var isVisible = f.isVisible;
            var palette = VITAL_COLORS[f.fieldKey] || { bg: '#F3F4F6', color: '#6B7280' };
            var iconStyle = 'background:' + palette.bg + ';color:' + palette.color + ';';
            var cardStyle = isVisible ? 'border-color:' + palette.bg + ';background:' + palette.bg + '1A;' : '';
            var html = '<div class="col-sm-6 col-md-4 col-xl-3" data-vital-key="' + esc(f.fieldKey) + '">' +
                '<div class="vital-field-card' + (isVisible ? ' is-visible' : '') + '" style="' + cardStyle + '">' +
                    '<div class="vf-icon" style="' + iconStyle + '">' +
                        '<i data-lucide="' + esc(f.icon) + '" style="width:18px;height:18px"></i>' +
                    '</div>' +
                    '<div class="vf-info">' +
                        '<div class="vf-label">' + esc(f.label) + '</div>' +
                        (f.unit ? '<div class="vf-unit">' + esc(f.unit) + '</div>' : '') +
                    '</div>' +
                    '<label class="vital-toggle" title="' + (isVisible ? 'Hide' : 'Show') + ' in vital recording form">' +
                        '<input type="checkbox" class="vital-visibility-toggle" data-key="' + esc(f.fieldKey) + '"' + (isVisible ? ' checked' : '') + '>' +
                        '<span class="vital-toggle-track" style="' + (isVisible ? 'background:' + palette.color + ';border-color:' + palette.color + ';' : '') + '"></span>' +
                    '</label>' +
                '</div>' +
            '</div>';
            $container.append(html);
        });

        lucide.createIcons();
    }

    $(document).on('change', '.vital-visibility-toggle', function () {
        var $checkbox = $(this);
        var key = $checkbox.data('key');
        var isVisible = $checkbox.is(':checked');
        var $card = $checkbox.closest('.vital-field-card');
        var palette = VITAL_COLORS[key] || { bg: '#F3F4F6', color: '#6B7280' };

        $card.toggleClass('is-visible', isVisible);
        $card.css({ 'border-color': isVisible ? palette.bg : '', 'background': isVisible ? palette.bg + '1A' : '' });
        $card.find('.vital-toggle-track').css({ 'background': isVisible ? palette.color : '', 'border-color': isVisible ? palette.color : '' });
        $card.find('.vital-toggle').attr('title', isVisible ? 'Hide in vital recording form' : 'Show in vital recording form');

        $.ajax({
            url: '/api/opd-vital-fields/' + key,
            method: 'PUT',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ isVisible: isVisible }),
            error: function () {
                $checkbox.prop('checked', !isVisible);
                $card.toggleClass('is-visible', !isVisible);
                $card.css({ 'border-color': '', 'background': '' });
                HMS.toast('Failed to update vital field visibility', 'error');
            }
        });
    });

    // ===== FORM SECTIONS =====
    function loadFormSections() {
        $.get('/api/opd/form-sections').done(function(sections) {
            formSections = sections || [];
            renderFormSections();
        }).fail(function() {
            formSections = [];
            renderFormSections();
        });
        $.get('/api/hr-config/department').done(function(depts) {
            formSectionDepts = depts || [];
        }).fail(function() {
            formSectionDepts = [];
        });
    }

    function renderFormSections() {
        var builtins = formSections.filter(function(s) { return s.isDefault; });
        var customs = formSections.filter(function(s) { return !s.isDefault; });

        // Built-in toggle cards
        var $bi = $('#builtinSectionsContainer').empty();
        var ICONS = { symptoms: 'stethoscope', investigation: 'flask-conical', prescription: 'pill', notes: 'file-text' };
        if (builtins.length === 0) {
            $bi.html('<div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">No built-in sections found.</p></div>');
        } else {
            builtins.forEach(function(s) {
                var icon = ICONS[s.key] || 'layout';
                var on = s.isEnabled;
                var card = '<div class="col-sm-6 col-md-4 col-xl-3" data-section-id="' + s.id + '">' +
                    '<div class="vital-field-card' + (on ? ' is-visible' : '') + '" style="' + (on ? 'border-color:var(--aquamint);background:rgba(127,255,212,0.06)' : '') + '">' +
                    '<div class="vf-icon" style="background:' + (on ? 'var(--aquamint)' : 'var(--color-border)') + ';color:' + (on ? 'var(--midnight-blue)' : 'var(--color-muted-foreground)') + '">' +
                    '<i data-lucide="' + icon + '" style="width:18px;height:18px"></i></div>' +
                    '<div class="vf-info"><div class="vf-label">' + esc(s.label) + '</div>' +
                    '<div class="vf-unit">Built-in</div></div>' +
                    '<label class="vital-toggle" title="' + (on ? 'Disable' : 'Enable') + '">' +
                    '<input type="checkbox" class="builtin-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '>' +
                    '<span class="vital-toggle-track" style="' + (on ? 'background:var(--aquamint);border-color:var(--aquamint)' : '') + '"></span>' +
                    '</label>' +
                    '</div></div>';
                $bi.append(card);
            });
        }

        // Custom sections list
        var $ci = $('#customSectionsContainer').empty();
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
                    '<td>' +
                        '<label class="vital-toggle" style="margin:0" title="' + (on ? 'Disable' : 'Enable') + '">' +
                            '<input type="checkbox" class="custom-section-toggle" data-section-id="' + s.id + '"' + (on ? ' checked' : '') + '>' +
                            '<span class="vital-toggle-track" style="' + (on ? 'background:var(--aquamint);border-color:var(--aquamint)' : '') + '"></span>' +
                        '</label>' +
                    '</td>' +
                    '<td style="display:flex;gap:6px;padding:8px 12px">' +
                    '<button class="btn-edit-section" data-section-id="' + s.id + '" style="padding:4px 10px;font-size:12px;background:var(--midnight-blue);color:#fff;border:none;border-radius:5px;cursor:pointer">Edit</button>' +
                    '<button class="btn-del-section" data-section-id="' + s.id + '" data-label="' + esc(s.label) + '" style="padding:4px 10px;font-size:12px;background:var(--color-destructive);color:#fff;border:none;border-radius:5px;cursor:pointer">Delete</button>' +
                    '</td></tr>';
            });
            table += '</tbody></table>';
            $ci.html(table);
        }
        lucide.createIcons();
    }

    function patchSectionEnabled(id, isEnabled, onError) {
        $.ajax({
            url: '/api/opd/form-sections/' + id,
            method: 'PATCH',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ isEnabled: isEnabled }),
            error: function() { if (onError) onError(); HMS.toast('Failed to update section', 'error'); }
        });
    }

    // Built-in section toggle
    $(document).on('change', '.builtin-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $card = $cb.closest('.vital-field-card');
        $card.toggleClass('is-visible', isEnabled);
        $card.css({ 'border-color': isEnabled ? 'var(--aquamint)' : '', 'background': isEnabled ? 'rgba(127,255,212,0.06)' : '' });
        $card.find('.vital-toggle-track').css({ 'background': isEnabled ? 'var(--aquamint)' : '', 'border-color': isEnabled ? 'var(--aquamint)' : '' });
        patchSectionEnabled(id, isEnabled, function() { $cb.prop('checked', !isEnabled); });
    });

    // Custom section toggle
    $(document).on('change', '.custom-section-toggle', function() {
        var $cb = $(this);
        var id = $cb.data('section-id');
        var isEnabled = $cb.is(':checked');
        var $track = $cb.siblings('.vital-toggle-track');
        $track.css({ 'background': isEnabled ? 'var(--aquamint)' : '', 'border-color': isEnabled ? 'var(--aquamint)' : '' });
        var sec = formSections.find(function(s) { return s.id === id; });
        if (sec) sec.isEnabled = isEnabled;
        patchSectionEnabled(id, isEnabled, function() {
            $cb.prop('checked', !isEnabled);
            $track.css({ 'background': !isEnabled ? 'var(--aquamint)' : '', 'border-color': !isEnabled ? 'var(--aquamint)' : '' });
        });
    });

    // Field builder helpers
    function genFieldId() { return 'fld_' + Date.now() + '_' + Math.floor(Math.random() * 9999); }

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

    function renderSectionFieldsList() {
        var $list = $('#sectionFieldsList');
        if (sectionBuilderFields.length === 0) {
            $list.html('<div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">No fields yet. Click "Add Field" to begin.</div>');
            return;
        }
        $list.empty();
        sectionBuilderFields.forEach(function(f, i) {
            var hasOptions = needsOptions(f.type);
            var optionsVal = Array.isArray(f.options) ? f.options.join(', ') : (f.options || '');
            var typeOpts = ALL_FIELD_TYPES.map(function(t) {
                return '<option value="' + t.value + '"' + (f.type === t.value ? ' selected' : '') + '>' + t.label + '</option>';
            }).join('');
            var fHtml = '<div class="field-row" data-field-idx="' + i + '" style="background:var(--color-card);border:1px solid var(--color-border);border-radius:8px;padding:10px 14px">' +
                '<div style="display:grid;grid-template-columns:1fr 180px auto;gap:8px;align-items:center">' +
                    '<input type="text" class="form-control field-label-input" placeholder="Field label..." value="' + esc(f.label) + '" data-idx="' + i + '" style="font-size:13px">' +
                    '<select class="form-select field-type-select" data-idx="' + i + '" style="font-size:13px">' + typeOpts + '</select>' +
                    '<button type="button" class="btn-del-field" data-idx="' + i + '" style="background:var(--color-destructive);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer">✕</button>' +
                '</div>' +
                '<div class="field-options-row" data-idx="' + i + '" style="margin-top:8px;' + (hasOptions ? '' : 'display:none') + '">' +
                    '<input type="text" class="form-control field-options-input" data-idx="' + i + '" placeholder="e.g. Option 1, Option 2, Option 3" value="' + esc(optionsVal) + '" style="font-size:12px">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:3px">Comma-separated list of choices</div>' +
                '</div>' +
                '</div>';
            $list.append(fHtml);
        });
    }

    $('#btnAddField').on('click', function() {
        sectionBuilderFields.push({ id: genFieldId(), label: '', type: 'text', options: [] });
        renderSectionFieldsList();
    });

    $(document).on('input', '.field-label-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (sectionBuilderFields[idx]) sectionBuilderFields[idx].label = $(this).val();
    });

    $(document).on('change', '.field-type-select', function() {
        var idx = parseInt($(this).data('idx'));
        if (!sectionBuilderFields[idx]) return;
        sectionBuilderFields[idx].type = $(this).val();
        var $row = $(this).closest('.field-row').find('.field-options-row');
        if (needsOptions($(this).val())) {
            $row.show();
        } else {
            $row.hide();
            sectionBuilderFields[idx].options = [];
        }
    });

    $(document).on('input', '.field-options-input', function() {
        var idx = parseInt($(this).data('idx'));
        if (sectionBuilderFields[idx]) {
            sectionBuilderFields[idx].options = $(this).val().split(',').map(function(o) { return o.trim(); }).filter(Boolean);
        }
    });

    $(document).on('click', '.btn-del-field', function() {
        var idx = parseInt($(this).data('idx'));
        sectionBuilderFields.splice(idx, 1);
        renderSectionFieldsList();
    });

    // Open builder for "Add"
    $('#btnAddCustomSection').on('click', function() {
        $('#sectionBuilderTitle').text('Add Custom Section');
        $('#sectionBuilderId').val('');
        $('#sectionBuilderLabel').val('');
        sectionBuilderFields = [];

        // Populate department select
        var $deptSel = $('#sectionBuilderDept').empty().append('<option value="">All Departments</option>');
        formSectionDepts.forEach(function(d) {
            var name = d.name || d.value || d;
            $deptSel.append('<option value="' + esc(name) + '">' + esc(name) + '</option>');
        });

        renderSectionFieldsList();
        new bootstrap.Offcanvas(document.getElementById('sectionBuilderSheet')).show();
    });

    // Open builder for "Edit"
    $(document).on('click', '.btn-edit-section', function() {
        var id = $(this).data('section-id');
        var sec = formSections.find(function(s) { return s.id === id; });
        if (!sec) return;
        $('#sectionBuilderTitle').text('Edit Section: ' + sec.label);
        $('#sectionBuilderId').val(sec.id);
        $('#sectionBuilderLabel').val(sec.label);
        sectionBuilderFields = JSON.parse(JSON.stringify(sec.fields || []));

        var $deptSel = $('#sectionBuilderDept').empty().append('<option value="">All Departments</option>');
        formSectionDepts.forEach(function(d) {
            var name = d.name || d.value || d;
            $deptSel.append('<option value="' + esc(name) + '"' + (sec.department === name ? ' selected' : '') + '>' + esc(name) + '</option>');
        });

        renderSectionFieldsList();
        new bootstrap.Offcanvas(document.getElementById('sectionBuilderSheet')).show();
    });

    // Save section
    $('#btnSaveSectionBuilder').on('click', function() {
        var label = $('#sectionBuilderLabel').val().trim();
        if (!label) { HMS.toast('Please enter a section name.', 'warning'); return; }

        // Validate fields have labels
        for (var i = 0; i < sectionBuilderFields.length; i++) {
            if (!sectionBuilderFields[i].label.trim()) { HMS.toast('All fields must have a label.', 'warning'); return; }
        }

        if (sectionBuilderFields.length === 0) { HMS.toast('Please add at least one field.', 'warning'); return; }

        var id = $('#sectionBuilderId').val();
        var dept = $('#sectionBuilderDept').val();
        var payload = { label: label, department: dept, fields: sectionBuilderFields };
        var $btn = $(this).prop('disabled', true).text('Saving...');

        var ajax;
        if (id) {
            ajax = $.ajax({ url: '/api/opd/form-sections/' + id, method: 'PATCH', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) });
        } else {
            ajax = $.ajax({ url: '/api/opd/form-sections', method: 'POST', contentType: 'application/json', headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }, data: JSON.stringify(payload) });
        }
        ajax.done(function() {
            bootstrap.Offcanvas.getInstance(document.getElementById('sectionBuilderSheet')).hide();
            loadFormSections();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to save section');
        }).always(function() {
            $btn.prop('disabled', false).text('Save Section');
        });
    });

    // Delete section
    $(document).on('click', '.btn-del-section', function() {
        var id = $(this).data('section-id');
        var label = $(this).data('label');
        if (!confirm('Delete custom section "' + label + '"? This cannot be undone.')) return;
        $.ajax({
            url: '/api/opd/form-sections/' + id,
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
        }).done(function() {
            loadFormSections();
        }).fail(function(xhr) {
            HMS.ajaxError(xhr, 'Failed to delete section');
        });
    });

    loadAll();
    loadSeries();
    loadVitalFields();
    loadFormSections();
});
