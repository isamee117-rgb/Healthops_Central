$(document).ready(function () {
    var configData = {};

    function esc(s) { return $('<span>').text(s || '').html(); }

    /* ── Dropdown Config ── */
    function loadAll() {
        $.get('/api/hr-config').done(function (data) {
            configData = data || {};
            renderAll();
        });
    }

    function renderAll() {
        $('#hrConfigContainer .card[data-category]').each(function () {
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
            url: '/api/hr-config',
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
            url: '/api/hr-config/' + id,
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
                url: '/api/hr-config/' + id,
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
            url: '/api/hr-config/' + id,
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: function () { loadAll(); },
            error: function () { HMS.toast('Failed to delete item', 'error'); }
        });
    });

    /* ── Number Series ── */
    var seriesData = [];

    function loadSeries() {
        $.get('/api/hr-number-series').done(function (data) {
            seriesData = data || [];
            renderSeries();
        });
    }

    function buildPreviewStr(prefix, startingNumber, padding) {
        var num = Math.max(parseInt(startingNumber) || 1, 1);
        var numStr = (parseInt(padding) > 0)
            ? String(num).padStart(parseInt(padding), '0')
            : String(num);
        return prefix + numStr;
    }

    function renderSeries() {
        var $container = $('#numberSeriesContainer');
        $container.empty();

        if (seriesData.length === 0) {
            $container.html('<div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">No number series configured.</p></div>');
            return;
        }

        var icons = { doctor_id: 'user-round', employee_id: 'badge' };

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
                                '<input type="text" class="form-control series-prefix" value="' + esc(s.prefix) + '" maxlength="20" placeholder="e.g. DOC-">' +
                                '<div class="form-text" style="font-size:11px">Characters prepended to each generated ID (e.g. <code>DOC-</code>, <code>DR.</code>)</div>' +
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
        var key    = $card.data('series-key');
        var prefix = $.trim($card.find('.series-prefix').val());
        var start  = parseInt($card.find('.series-start').val()) || 1;
        var pad    = parseInt($card.find('.series-padding').val()) || 0;

        if (!prefix) {
            HMS.toast('Prefix cannot be empty.', 'warning');
            $card.find('.series-prefix').focus();
            return;
        }

        var $btn = $(this);
        $btn.prop('disabled', true).text('Saving…');

        $.ajax({
            url: '/api/hr-number-series/' + key,
            method: 'PUT',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ prefix: prefix, startingNumber: start, padding: pad }),
            success: function (res) {
                $card.find('.series-preview').text(res.preview);
                $btn.prop('disabled', false).text('Save');
            },
            error: function (xhr) {
                HMS.ajaxError(xhr, 'Failed to save number series');
                $btn.prop('disabled', false).text('Save');
            }
        });
    });

    loadAll();
    loadSeries();
});
