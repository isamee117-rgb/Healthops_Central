$(document).ready(function () {
    var configData = {};

    function esc(s) { return $('<span>').text(s || '').html(); }

    // ── Department Routing ─────────────────────────────────────────────────────
    var deptDefs = [
        { key: 'IPD', label: 'Inpatient (IPD)',   icon: 'bed-single' },
        { key: 'ER',  label: 'Emergency (ER)',     icon: 'ambulance' },
    ];

    function loadDeptRouting() {
        $.get('/api/pharmacy-config/department-routing').done(function (data) {
            renderDeptRouting(data);
        }).fail(function () {
            $('#deptRoutingBody').html('<div style="padding:16px;color:var(--color-muted-foreground);font-size:13px">Failed to load.</div>');
        });
    }

    function renderDeptRouting(data) {
        var html = deptDefs.map(function (d) {
            var isOn = data[d.key] !== false;
            return '<div class="dept-routing-row">' +
                '<span class="dept-label"><i data-lucide="' + d.icon + '" style="width:15px;height:15px"></i> ' + d.label + '</span>' +
                '<label class="dept-toggle-wrap">' +
                '<input type="checkbox" data-dept="' + d.key + '"' + (isOn ? ' checked' : '') + '>' +
                '<span class="toggle-slider"></span>' +
                '</label>' +
                '<span class="dept-status ' + (isOn ? 'on' : 'off') + '">' + (isOn ? 'Orders accepted' : 'Orders blocked') + '</span>' +
                '</div>';
        }).join('');
        $('#deptRoutingBody').html(html);
        lucide.createIcons();
    }

    $(document).on('change', '#deptRoutingBody input[data-dept]', function () {
        var dept = $(this).data('dept');
        var isOn = $(this).is(':checked');
        var payload = {};
        payload[dept] = isOn;
        $.ajax({
            url: '/api/pharmacy-config/department-routing',
            method: 'PUT',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify(payload),
            success: function () {
                loadDeptRouting();
                HMS.toast(dept + ' orders ' + (isOn ? 'enabled' : 'blocked'), isOn ? 'success' : 'warning');
            },
            error: function () {
                HMS.toast('Failed to update', 'error');
                loadDeptRouting();
            },
        });
    });

    // ── Prescription Dropdowns ─────────────────────────────────────────────────
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
    loadDeptRouting();
});

// ── Pharmacy Bulk Import ─────────────────────────────────────────────────────

(function () {
    'use strict';

    var selectedFile = null;

    // ── State machine ─────────────────────────────────────────────────────────

    var STATES = {
        IDLE:       'idle',
        SELECTED:   'selected',
        VALIDATING: 'validating',
        ERROR:      'error',
        CONFIRM:    'confirm',
        IMPORTING:  'importing',
    };

    function setState(state, data) {
        // Hide all state panels
        $('#bulkStateIdle, #bulkStateFileSelected, #bulkStateValidating, #bulkStateError, #bulkStateConfirm, #bulkStateImporting').hide();
        // Reset step classes
        $('#bsStep1, #bsStep2, #bsStep3').removeClass('active done error');

        if (state === STATES.IDLE) {
            selectedFile = null;
            $('#bulkStateIdle').show();
            $('#bsStep1').addClass('active');
            $('#bulkImportHeader').css('background', '#060740');
            $('#bulkStepLabel').text('Step 1 of 3');
        }

        if (state === STATES.SELECTED) {
            $('#bulkStateFileSelected').show();
            $('#bulkSelectedFileName').text(data.name);
            $('#bulkSelectedFileMeta').text('• ' + (data.size / 1024).toFixed(1) + ' KB');
            $('#bsStep1').addClass('active');
            $('#bulkImportHeader').css('background', '#060740');
            $('#bulkStepLabel').text('Step 1 of 3');
        }

        if (state === STATES.VALIDATING) {
            $('#bulkStateValidating').show();
            $('#bsStep1').addClass('done');
            $('#bsStep2').addClass('active');
            $('#bulkImportHeader').css('background', '#060740');
            $('#bulkStepLabel').text('Step 2 of 3');
        }

        if (state === STATES.ERROR) {
            $('#bulkStateError').show();
            $('#bulkErrorFileName').text(data.fileName);
            $('#bulkErrorBannerTitle').text(data.errors.length + ' error(s) found — kuch bhi save nahi hua');
            var rows = data.errors.map(function (e) {
                return '<tr><td>' + e.row + '</td><td class="bulk-err-col">' + esc(e.column) + '</td><td class="bulk-err-msg">' + esc(e.message) + '</td></tr>';
            }).join('');
            $('#bulkErrorTableBody').html(rows || '<tr><td colspan="3">No errors</td></tr>');
            $('#bsStep1').addClass('done');
            $('#bsStep2').addClass('error');
            $('#bulkImportHeader').css('background', '#b91c1c');
            $('#bulkStepLabel').text('Step 2 of 3');
            lucide.createIcons();
        }

        if (state === STATES.CONFIRM) {
            $('#bulkStateConfirm').show();
            $('#bulkConfirmFileName').text(data.fileName);
            $('#bsSumMedicines').text(data.summary.medicines);
            $('#bsSumWithBatch').text(data.summary.with_batch);
            $('#bsSumNoBatch').text(data.summary.without_batch);
            $('#bulkConfirmBtnText').text('Confirm Import (' + data.summary.medicines + ' medicines)');
            var previewRows = (data.preview || []).map(function (r) {
                var batchBadge = r.has_batch
                    ? '<span class="bulk-badge-req" style="background:#dcfce7;color:#166534;border-color:#bbf7d0">Yes</span>'
                    : '<span class="bulk-badge-opt" style="background:#f3f4f6;color:#6b7280;border-color:#e5e7eb">No</span>';
                return '<tr><td>' + esc(r.medicine_code) + '</td><td>' + esc(r.generic_name) + '</td>'
                     + '<td>' + esc(r.form) + '</td><td>' + esc(r.category) + '</td>'
                     + '<td>' + batchBadge + '</td></tr>';
            }).join('');
            $('#bulkPreviewTableBody').html(previewRows || '<tr><td colspan="5">No preview</td></tr>');
            $('#bsStep1').addClass('done');
            $('#bsStep2').addClass('done');
            $('#bsStep3').addClass('active');
            $('#bulkImportHeader').css('background', '#047857');
            $('#bulkStepLabel').text('Step 3 of 3');
            lucide.createIcons();
        }

        if (state === STATES.IMPORTING) {
            $('#bulkStateImporting').show();
            $('#bsStep1').addClass('done');
            $('#bsStep2').addClass('done');
            $('#bsStep3').addClass('active');
            $('#bulkImportHeader').css('background', '#047857');
            $('#bulkStepLabel').text('Step 3 of 3');
        }
    }

    function esc(str) {
        return $('<span>').text(str || '').html();
    }

    // ── File selection ────────────────────────────────────────────────────────

    function onFileSelected(file) {
        if (!file) return;
        var ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'xlsx' && ext !== 'csv') {
            HMS.toast('Sirf .xlsx aur .csv files allowed hain.', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            HMS.toast('File size 5 MB se zyada hai.', 'error');
            return;
        }
        selectedFile = file;
        setState(STATES.SELECTED, { name: file.name, size: file.size });
    }

    $('#bulkBrowseBtn').on('click', function () {
        $('#bulkFileInput').trigger('click');
    });

    $('#bulkDropZone').on('click', function (e) {
        if (!$(e.target).is('#bulkBrowseBtn')) {
            $('#bulkFileInput').trigger('click');
        }
    });

    $('#bulkFileInput').on('change', function () {
        if (this.files && this.files[0]) {
            onFileSelected(this.files[0]);
            // Reset input so same file can be re-selected after re-upload
            this.value = '';
        }
    });

    // Drag & Drop
    $('#bulkDropZone').on('dragover', function (e) {
        e.preventDefault();
        $(this).addClass('drag-over');
    });
    $('#bulkDropZone').on('dragleave drop', function (e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
        if (e.type === 'drop' && e.originalEvent.dataTransfer.files.length) {
            onFileSelected(e.originalEvent.dataTransfer.files[0]);
        }
    });

    // Re-upload buttons — all reset to IDLE
    $('#bulkReuploadBtnSelected, #bulkReuploadBtnError, #bulkReuploadBtnConfirm, #bulkFixReuploadBtn').on('click', function () {
        setState(STATES.IDLE);
        $('#bulkFileInput').val('');
    });

    $('#bulkCancelConfirmBtn').on('click', function () {
        setState(STATES.IDLE);
    });

    // ── Validate ──────────────────────────────────────────────────────────────

    $('#bulkValidateBtn').on('click', function () {
        if (!selectedFile) return;
        setState(STATES.VALIDATING);

        var formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('_token', $('meta[name="csrf-token"]').attr('content'));

        $.ajax({
            url: '/api/pharmacy-bulk-import/validate',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                if (res.valid) {
                    setState(STATES.CONFIRM, {
                        fileName: selectedFile.name,
                        summary: res.summary,
                        preview: res.preview,
                    });
                } else {
                    setState(STATES.ERROR, {
                        fileName: selectedFile.name,
                        errors: res.errors,
                    });
                }
            },
            error: function (xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'Validation request fail ho gayi.';
                HMS.toast(msg, 'error');
                setState(STATES.SELECTED, { name: selectedFile.name, size: selectedFile.size });
            },
        });
    });

    // ── Confirm Import ────────────────────────────────────────────────────────

    $('#bulkConfirmImportBtn').on('click', function () {
        if (!selectedFile) return;
        setState(STATES.IMPORTING);

        var formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('_token', $('meta[name="csrf-token"]').attr('content'));

        $.ajax({
            url: '/api/pharmacy-bulk-import/import',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                var count = res.imported ? res.imported.medicines : 0;
                var batches = res.imported ? res.imported.batches : 0;
                HMS.toast(count + ' medicines aur ' + batches + ' batches successfully import ho gaye!', 'success');
                setState(STATES.IDLE);
            },
            error: function (xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'Import fail ho gaya.';
                HMS.toast(msg, 'error');
                setState(STATES.IDLE);
            },
        });
    });

    // ── Column reference toggle ───────────────────────────────────────────────

    $('#bulkColRefToggle').on('click', function () {
        var $body = $('#bulkColRefBody');
        $body.toggleClass('open');
        $(this).find('i').attr('data-lucide', $body.hasClass('open') ? 'chevron-up' : 'info');
        lucide.createIcons();
    });

    // ── Init ─────────────────────────────────────────────────────────────────

    setState(STATES.IDLE);

}());
