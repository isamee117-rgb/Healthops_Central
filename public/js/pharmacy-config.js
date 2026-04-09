$(document).ready(function () {
    var configData = {};

    function esc(s) { return $('<span>').text(s || '').html(); }

    function loadAll() {
        $.get('/api/pharmacy-config').done(function (data) {
            configData = data || {};
            renderAll();
        });
    }

    function renderAll() {
        $('#pharmConfigContainer .card[data-category]').each(function () {
            var category = $(this).data('category');
            var items = configData[category] || [];
            renderList($(this), items, category);
        });
    }

    function renderList($card, items, category) {
        var $list = $card.find('.config-list');
        $card.find('.item-count').text(items.filter(function (i) { return i.isActive; }).length);

        if (items.length === 0) {
            $list.html('<div style="padding:20px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No items configured</div>');
            return;
        }

        var isFreq = (category === 'rx_frequency');
        var html = '';
        items.forEach(function (item) {
            var timesHtml = '';
            if (isFreq) {
                var tpd = (item.timesPerDay !== null && item.timesPerDay !== undefined) ? item.timesPerDay : '';
                timesHtml = '<input type="number" class="freq-times-input" data-id="' + item.id + '" ' +
                    'value="' + esc(String(tpd)) + '" min="0" max="99" ' +
                    'title="Times per day" ' +
                    'style="width:52px;font-size:12px;padding:3px 6px;border:1px solid var(--color-border);border-radius:5px;text-align:center;background:var(--color-card);color:var(--color-foreground);outline:none;margin-right:6px" ' +
                    'placeholder="×/day">';
            }
            html += '<div class="config-item' + (item.isActive ? '' : ' inactive') + '" data-id="' + item.id + '">' +
                '<span class="item-name">' + esc(item.name) + '</span>' +
                '<div class="item-actions">' +
                    timesHtml +
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

    $(document).on('change blur', '.freq-times-input', function () {
        var $input = $(this);
        var id = $input.data('id');
        var val = parseInt($input.val());
        if (isNaN(val) || val < 0) { val = 0; $input.val(0); }

        $.ajax({
            url: '/api/pharmacy-config/' + id,
            method: 'PUT',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ timesPerDay: val }),
            error: function () { HMS.toast('Failed to save times per day', 'error'); }
        });
    });

    $(document).on('keypress', '.freq-times-input', function (e) {
        if (e.which === 13) { $(this).blur(); }
    });

    $(document).on('click', '.btn-add-item', function () {
        var $card = $(this).closest('.card');
        var $input = $card.find('.config-new-input');
        var name = $.trim($input.val());
        var category = $card.data('category');

        if (!name) { $input.focus(); return; }

        var payload = { category: category, name: name };
        if (category === 'rx_frequency') { payload.timesPerDay = 1; }

        $.ajax({
            url: '/api/pharmacy-config',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify(payload),
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
            url: '/api/pharmacy-config/' + id,
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
                url: '/api/pharmacy-config/' + id,
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
        if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
        $.ajax({
            url: '/api/pharmacy-config/' + id,
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            success: function () { loadAll(); },
            error: function () { HMS.toast('Failed to delete item', 'error'); }
        });
    });

    loadAll();
});
