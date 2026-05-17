/* global $, HMS, HMS_BASE, bootstrap, lucide */
$(document).ready(function () {

    // ── State ──────────────────────────────────────────────────────────────────
    var FB = {
        groups: [],
        activeFormId: null,
        activeForm: null,
    };

    // ── API helper ─────────────────────────────────────────────────────────────
    function api(method, url, data) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                method: method,
                url: HMS_BASE + url,
                contentType: 'application/json',
                data: data !== undefined ? JSON.stringify(data) : undefined,
                success: resolve,
                error: function (xhr) {
                    reject(new Error(HMS.ajaxError(xhr, 'Request failed')));
                },
            });
        });
    }

    // ── Load ───────────────────────────────────────────────────────────────────
    function loadAll() {
        return api('GET', '/api/form-groups').then(function (groups) {
            FB.groups = groups;
            renderTree();
        });
    }

    // ── Tree ───────────────────────────────────────────────────────────────────
    function renderTree() {
        var canManage = HMS.can('form-builder.manage');
        var html = '';
        FB.groups.forEach(function (group) {
            html += '<div class="fb-group-item" data-group-id="' + group.id + '">';
            html += '<div class="fb-group-header">';
            html += '<span><i data-lucide="folder" style="width:13px;height:13px;margin-right:5px"></i>' + escHtml(group.name) + '</span>';
            if (canManage) {
                html += '<span class="fb-group-actions">';
                html += '<button class="fb-action-btn btn-add-form" data-group-id="' + group.id + '" title="Add form"><i data-lucide="plus" style="width:12px;height:12px"></i></button>';
                html += '<button class="fb-action-btn btn-edit-group" data-id="' + group.id + '" title="Edit"><i data-lucide="pencil" style="width:12px;height:12px"></i></button>';
                html += '<button class="fb-action-btn btn-delete-group" data-id="' + group.id + '" title="Delete"><i data-lucide="trash-2" style="width:12px;height:12px"></i></button>';
                html += '</span>';
            }
            html += '</div><div class="fb-group-forms">';
            (group.forms || []).forEach(function (form) {
                var activeClass = (FB.activeFormId === form.id) ? ' active' : '';
                html += '<div class="fb-form-item' + activeClass + '" data-form-id="' + form.id + '">';
                html += '<span class="fb-form-name">' + escHtml(form.name) + '</span>';
                if (canManage) {
                    html += '<span class="fb-form-actions">';
                    html += '<input type="number" class="fb-order-input form-order-input" data-id="' + form.id + '" value="' + (form.sortOrder || 0) + '" min="1" title="Sort order">';
                    html += '<button class="fb-action-btn btn-edit-form" data-id="' + form.id + '" data-group-id="' + group.id + '" data-name="' + escAttr(form.name) + '" data-description="' + escAttr(form.description || '') + '" data-instructions="' + escAttr(form.instructions || '') + '" data-declaration="' + escAttr(form.declaration || '') + '" title="Edit"><i data-lucide="pencil" style="width:12px;height:12px"></i></button>';
                    html += '<button class="fb-action-btn btn-delete-form" data-id="' + form.id + '" title="Delete"><i data-lucide="trash-2" style="width:12px;height:12px"></i></button>';
                    html += '</span>';
                }
                html += '</div>';
            });
            html += '</div></div>';
        });
        if (!html) {
            html = '<div class="p-3 text-muted text-center" style="font-size:0.82rem">No groups yet.</div>';
        }
        document.getElementById('fb-tree-body').innerHTML = html;
        if (window.lucide) lucide.createIcons();
    }

    // ── Editor ─────────────────────────────────────────────────────────────────
    function loadForm(formId) {
        FB.activeFormId = formId;
        renderTree();
        return api('GET', '/api/forms/' + formId + '/full').then(function (form) {
            FB.activeForm = form;
            renderEditor(form);
        }).catch(function (e) { HMS.toast(e.message, 'error'); });
    }

    function renderEditor(form) {
        document.getElementById('fb-editor-empty').style.display = 'none';
        document.getElementById('fb-editor-content').style.display = '';
        document.getElementById('fb-editor-title').textContent = form.name;
        document.getElementById('fb-editor-subtitle').textContent = form.description || '';
        var canManage = HMS.can('form-builder.manage');
        var html = '';
        (form.sections || []).forEach(function (section) {
            html += renderSectionCard(section, canManage);
        });
        if (!html) {
            html = '<div class="text-muted text-center py-4" style="font-size:0.85rem">No sections yet. Click "+ Section" to add one.</div>';
        }
        document.getElementById('fb-sections-list').innerHTML = html;
        if (window.lucide) lucide.createIcons();
    }

    function renderSectionCard(section, canManage) {
        var html = '<div class="fb-section-card" data-section-id="' + section.id + '">';
        html += '<div class="fb-section-header"><span class="fb-section-title">' + escHtml(section.title) + '</span>';
        if (canManage) {
            html += '<div class="d-flex gap-1 align-items-center">';
            html += '<input type="number" class="fb-order-input section-order-input" data-id="' + section.id + '" value="' + (section.sortOrder || 0) + '" min="1" title="Sort order">';
            html += '<button class="fb-action-btn btn-edit-section" data-id="' + section.id + '" data-title="' + escAttr(section.title) + '" data-description="' + escAttr(section.description || '') + '" data-collapsible="' + (section.isCollapsible ? '1' : '0') + '"><i data-lucide="pencil" style="width:13px;height:13px"></i></button>';
            html += '<button class="fb-action-btn btn-delete-section" data-id="' + section.id + '"><i data-lucide="trash-2" style="width:13px;height:13px"></i></button>';
            html += '</div>';
        }
        html += '</div><div class="fb-section-body">';
        (section.components || []).forEach(function (comp) {
            html += renderComponentRow(comp, canManage);
        });
        if (canManage) {
            html += '<button class="fb-add-component-btn btn-add-component" data-section-id="' + section.id + '"><i data-lucide="plus" style="width:13px;height:13px"></i> Add Component</button>';
        }
        html += '</div></div>';
        return html;
    }

    function renderComponentRow(comp, canManage) {
        var typeLabels = { text_input: 'Text', textarea: 'Textarea', checkbox: 'Checkbox', radio: 'Radio', dropdown: 'Dropdown', date: 'Date', time: 'Time', dynamic_table: 'Table', signature: 'Signature', header: 'Header' };
        var html = '<div class="fb-component-row" data-component-id="' + comp.id + '"><div>';
        html += escHtml(comp.label);
        if (comp.isRequired) html += ' <span class="text-danger">*</span>';
        html += '<span class="fb-component-type-badge">' + (typeLabels[comp.type] || comp.type) + '</span></div>';
        if (canManage) {
            var configJson = escAttr(JSON.stringify(comp.config || {}));
            var conditionsJson = escAttr(JSON.stringify(comp.conditions || []));
            html += '<div class="d-flex gap-1 align-items-center">';
            html += '<input type="number" class="fb-order-input component-order-input" data-id="' + comp.id + '" value="' + (comp.sortOrder || 0) + '" min="1" title="Sort order">';
            html += '<button class="fb-action-btn btn-edit-component" data-id="' + comp.id + '" data-section-id="' + comp.formSectionId + '" data-type="' + comp.type + '" data-label="' + escAttr(comp.label) + '" data-key="' + escAttr(comp.key) + '" data-required="' + (comp.isRequired ? '1' : '0') + '" data-config="' + configJson + '" data-conditions="' + conditionsJson + '"><i data-lucide="pencil" style="width:12px;height:12px"></i></button>';
            html += '<button class="fb-action-btn btn-delete-component" data-id="' + comp.id + '"><i data-lucide="trash-2" style="width:12px;height:12px"></i></button>';
            html += '</div>';
        }
        html += '</div>';
        return html;
    }

    // ── Component Picker ───────────────────────────────────────────────────────
    function renderComponentPicker(sectionId) {
        var types = [
            { type: 'text_input', label: 'Text Input', icon: 'type' },
            { type: 'textarea', label: 'Textarea', icon: 'align-left' },
            { type: 'checkbox', label: 'Checkbox', icon: 'check-square' },
            { type: 'radio', label: 'Radio', icon: 'circle-dot' },
            { type: 'dropdown', label: 'Dropdown', icon: 'chevron-down-circle' },
            { type: 'date', label: 'Date', icon: 'calendar' },
            { type: 'time', label: 'Time', icon: 'clock' },
            { type: 'dynamic_table', label: 'Table', icon: 'table' },
            { type: 'signature', label: 'Signature', icon: 'pen-line' },
            { type: 'header', label: 'Header', icon: 'heading' },
        ];
        var html = '<p class="text-muted mb-2" style="font-size:0.82rem">Choose a component type:</p><div class="fb-component-picker">';
        types.forEach(function (t) {
            html += '<button class="fb-type-btn btn-pick-type" data-type="' + t.type + '" data-section-id="' + sectionId + '">';
            html += '<i data-lucide="' + t.icon + '" style="width:18px;height:18px;display:block;margin:0 auto 4px"></i>' + t.label + '</button>';
        });
        html += '</div>';
        return html;
    }

    // ── Type-specific config forms ─────────────────────────────────────────────
    function buildConfigForm(type, config) {
        config = config || {};
        if (type === 'text_input') {
            return '<div class="mb-2"><label class="form-label">Placeholder</label><input type="text" class="form-control form-control-sm" id="cfgPlaceholder" value="' + escAttr(config.placeholder || '') + '"></div>';
        }
        if (type === 'textarea') {
            return '<div class="mb-2"><label class="form-label">Placeholder</label><input type="text" class="form-control form-control-sm" id="cfgPlaceholder" value="' + escAttr(config.placeholder || '') + '"></div>' +
                '<div class="mb-2"><label class="form-label">Rows</label><input type="number" class="form-control form-control-sm" id="cfgRows" value="' + (config.rows || 3) + '" min="1" max="20"></div>';
        }
        if (type === 'checkbox' || type === 'radio' || type === 'dropdown') {
            return '<div class="mb-2"><label class="form-label">Options <small class="text-muted">(one per line)</small></label><textarea class="form-control form-control-sm" id="cfgOptions" rows="4">' + escHtml((config.options || []).join('\n')) + '</textarea></div>';
        }
        if (type === 'date') {
            return '<div class="mb-2"><label class="form-label">Format</label><select class="form-select form-select-sm" id="cfgFormat"><option value="YYYY-MM-DD"' + (config.format === 'YYYY-MM-DD' ? ' selected' : '') + '>YYYY-MM-DD</option><option value="DD/MM/YYYY"' + (config.format === 'DD/MM/YYYY' ? ' selected' : '') + '>DD/MM/YYYY</option></select></div>';
        }
        if (type === 'dynamic_table') {
            var existingCols = config.columns || [];
            var colRowsHtml = existingCols.map(function(c) {
                var cname = typeof c === 'string' ? c : (c.name || '');
                var ctype = typeof c === 'string' ? 'text' : (c.type || 'text');
                return '<div class="d-flex gap-1 mb-1 align-items-center cfg-col-row">' +
                    '<input type="text" class="form-control form-control-sm cfg-col-name" placeholder="Column name" value="' + escAttr(cname) + '">' +
                    '<select class="form-select form-select-sm cfg-col-type" style="max-width:110px">' +
                    '<option value="text"' + (ctype === 'text' ? ' selected' : '') + '>Text</option>' +
                    '<option value="number"' + (ctype === 'number' ? ' selected' : '') + '>Number</option>' +
                    '<option value="date"' + (ctype === 'date' ? ' selected' : '') + '>Date</option>' +
                    '<option value="textarea"' + (ctype === 'textarea' ? ' selected' : '') + '>Textarea</option>' +
                    '</select>' +
                    '<button type="button" class="btn btn-sm btn-outline-danger px-2" onclick="this.closest(\'.cfg-col-row\').remove()">×</button>' +
                    '</div>';
            }).join('');
            return '<div class="mb-2"><label class="form-label">Columns</label>' +
                '<div id="cfgColumnsList">' + colRowsHtml + '</div>' +
                '<button type="button" class="btn btn-sm btn-outline-secondary mt-1" onclick="addTableConfigColumn()">+ Add Column</button>' +
                '</div>';
        }
        if (type === 'header') {
            return '<div class="mb-2"><label class="form-label">Level</label><select class="form-select form-select-sm" id="cfgLevel"><option value="h3"' + (config.level === 'h3' ? ' selected' : '') + '>H3 — Large</option><option value="h4"' + (config.level === 'h4' ? ' selected' : '') + '>H4 — Medium</option><option value="h5"' + (config.level === 'h5' ? ' selected' : '') + '>H5 — Small</option></select></div>';
        }
        return '';
    }

    function collectConfig(type) {
        var config = {};
        if (type === 'text_input') {
            config.placeholder = $('#cfgPlaceholder').val().trim();
        } else if (type === 'textarea') {
            config.placeholder = $('#cfgPlaceholder').val().trim();
            config.rows = parseInt($('#cfgRows').val()) || 3;
        } else if (type === 'checkbox' || type === 'radio' || type === 'dropdown') {
            config.options = $('#cfgOptions').val().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        } else if (type === 'date') {
            config.format = $('#cfgFormat').val();
        } else if (type === 'dynamic_table') {
            config.columns = [];
            document.querySelectorAll('#cfgColumnsList .cfg-col-row').forEach(function(row) {
                var name = (row.querySelector('.cfg-col-name').value || '').trim();
                var colType = row.querySelector('.cfg-col-type').value;
                if (name) config.columns.push({ name: name, type: colType });
            });
        } else if (type === 'header') {
            config.level = $('#cfgLevel').val();
        }
        return config;
    }

    // ── Preview ────────────────────────────────────────────────────────────────
    function openPreviewModal() {
        if (!FB.activeFormId) return;
        api('GET', '/api/forms/' + FB.activeFormId + '/full').then(function (form) {
            document.getElementById('previewModalLabel').textContent = form.name + ' — Preview';
            var body = document.getElementById('previewBody');
            body.innerHTML = buildPreview(form);
            if (window.lucide) lucide.createIcons();
            applyConditionalVisibility(body);
            new bootstrap.Modal(document.getElementById('previewModal')).show();
        }).catch(function (e) { HMS.toast(e.message, 'error'); });
    }

    function buildPreview(form) {
        var html = '';
        if (form.instructions) {
            html += '<div class="alert alert-info mb-3" style="font-size:0.88rem;white-space:pre-wrap"><strong>Instructions</strong><br>' + escHtml(form.instructions) + '</div>';
        }
        (form.sections || []).forEach(function (section) {
            html += '<div class="fb-preview-section"><div class="fb-preview-section-title">' + escHtml(section.title) + '</div><div class="fb-preview-body">';
            (section.components || []).forEach(function (comp) { html += renderPreviewComponent(comp); });
            html += '</div></div>';
        });
        if (form.declaration) {
            html += '<div class="alert alert-secondary mt-3" style="font-size:0.88rem;white-space:pre-wrap"><strong>Declaration</strong><br>' + escHtml(form.declaration) + '</div>';
        }
        return html || '<p class="text-muted text-center">No components to preview.</p>';
    }

    function renderPreviewComponent(comp) {
        var config = comp.config || {};
        var label = escHtml(comp.label);
        var req = comp.isRequired ? ' <span class="text-danger">*</span>' : '';
        var conditions = comp.conditions || [];
        var condAttr = conditions.length ? ' data-conditions=\'' + JSON.stringify(conditions).replace(/'/g, '&#39;') + '\'' : '';
        if (comp.type === 'header') {
            var tag = config.level || 'h4';
            return '<' + tag + ' class="mt-3 mb-2" data-field-key="' + escAttr(comp.key || '') + '"' + condAttr + '>' + label + '</' + tag + '>';
        }
        var html = '<div class="mb-3" data-field-key="' + escAttr(comp.key || '') + '"' + condAttr + '><label class="form-label">' + label + req + '</label>';
        if (comp.type === 'text_input') {
            html += '<input type="text" class="form-control form-control-sm" placeholder="' + escAttr(config.placeholder || '') + '">';
        } else if (comp.type === 'textarea') {
            html += '<textarea class="form-control form-control-sm" rows="' + (config.rows || 3) + '" placeholder="' + escAttr(config.placeholder || '') + '"></textarea>';
        } else if (comp.type === 'checkbox') {
            var cbName = 'prev_cb_' + (comp.key || comp.id);
            (config.options || ['Option 1']).forEach(function (opt) {
                html += '<div class="form-check"><input class="form-check-input" type="checkbox" name="' + escAttr(cbName) + '" value="' + escAttr(opt) + '"><label class="form-check-label">' + escHtml(opt) + '</label></div>';
            });
        } else if (comp.type === 'radio') {
            var rdName = 'prev_rd_' + (comp.key || comp.id);
            (config.options || ['Option 1']).forEach(function (opt) {
                html += '<div class="form-check"><input class="form-check-input" type="radio" name="' + escAttr(rdName) + '" value="' + escAttr(opt) + '"><label class="form-check-label">' + escHtml(opt) + '</label></div>';
            });
        } else if (comp.type === 'dropdown') {
            html += '<select class="form-select form-select-sm"><option value="">-- Select --</option>';
            (config.options || []).forEach(function (opt) { html += '<option value="' + escAttr(opt) + '">' + escHtml(opt) + '</option>'; });
            html += '</select>';
        } else if (comp.type === 'date') {
            html += '<input type="date" class="form-control form-control-sm">';
        } else if (comp.type === 'time') {
            html += '<input type="time" class="form-control form-control-sm">';
        } else if (comp.type === 'dynamic_table') {
            var rawPrevCols = config.columns || [{ name: 'Column 1', type: 'text' }, { name: 'Column 2', type: 'text' }];
            var prevCols = rawPrevCols.map(function(c) { return typeof c === 'string' ? { name: c, type: 'text' } : c; });
            html += '<table class="table table-sm table-bordered fb-preview-table"><thead><tr>';
            prevCols.forEach(function(c) { html += '<th>' + escHtml(c.name) + '</th>'; });
            html += '<th style="width:30px"></th></tr></thead><tbody><tr>';
            prevCols.forEach(function(c) {
                var inp = c.type === 'date' ? '<input type="date" class="form-control form-control-sm">'
                    : c.type === 'textarea' ? '<textarea class="form-control form-control-sm" rows="1"></textarea>'
                    : c.type === 'number' ? '<input type="number" class="form-control form-control-sm">'
                    : '<input type="text" class="form-control form-control-sm">';
                html += '<td>' + inp + '</td>';
            });
            html += '<td style="text-align:center"><span style="color:#EF4444;cursor:pointer;font-size:14px;font-weight:700">×</span></td>';
            html += '</tr></tbody></table>';
            html += '<button type="button" class="btn btn-sm btn-outline-secondary mt-1" style="font-size:0.8rem">+ Add Row</button>';
        } else if (comp.type === 'signature') {
            html += '<div style="border:1px dashed #cbd5e1;border-radius:6px;height:80px;background:#f8fafc;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:0.8rem">Signature field</div>';
        }
        html += '</div>';
        return html;
    }

    // ── CRUD — Groups ──────────────────────────────────────────────────────────
    function openGroupModal(id) {
        $('#groupId').val(''); $('#groupName').val(''); $('#groupContext').val(''); $('#groupDescription').val('');
        $('#groupModalLabel').text(id ? 'Edit Form Group' : 'New Form Group');
        if (id) {
            var g = FB.groups.find(function (g) { return g.id === id; });
            if (g) { $('#groupId').val(g.id); $('#groupName').val(g.name); $('#groupContext').val(g.context); $('#groupDescription').val(g.description || ''); }
        }
        new bootstrap.Modal(document.getElementById('groupModal')).show();
    }

    $('#btnSaveGroup').on('click', function () {
        var id = $('#groupId').val();
        var payload = { name: $('#groupName').val().trim(), context: $('#groupContext').val(), description: $('#groupDescription').val().trim() };
        if (!payload.name || !payload.context) { HMS.toast('Name and context are required', 'error'); return; }
        var p = id ? api('PATCH', '/api/form-groups/' + id, payload) : api('POST', '/api/form-groups', payload);
        p.then(function () {
            bootstrap.Modal.getInstance(document.getElementById('groupModal')).hide();
            return loadAll();
        }).then(function () { HMS.toast(id ? 'Group updated' : 'Group created', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    // ── CRUD — Forms ───────────────────────────────────────────────────────────
    function openFormModal(groupId, formId, name, description, instructions, declaration) {
        $('#formId').val(formId || ''); $('#formGroupId').val(groupId || '');
        $('#formName').val(name || ''); $('#formDescription').val(description || '');
        $('#formInstructions').val(instructions || ''); $('#formDeclaration').val(declaration || '');
        $('#formModalLabel').text(formId ? 'Edit Form' : 'New Form');
        new bootstrap.Modal(document.getElementById('formModal')).show();
    }

    $('#btnSaveForm').on('click', function () {
        var id = $('#formId').val();
        var groupId = $('#formGroupId').val();
        var name = $('#formName').val().trim();
        var payload = {
            name:         name,
            description:  $('#formDescription').val().trim(),
            instructions: $('#formInstructions').val().trim(),
            declaration:  $('#formDeclaration').val().trim(),
        };
        if (!name) { HMS.toast('Name is required', 'error'); return; }
        var p = id
            ? api('PATCH', '/api/forms/' + id, payload)
            : api('POST', '/api/form-groups/' + parseInt(groupId) + '/forms', payload);
        p.then(function () {
            bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
            return loadAll();
        }).then(function () { HMS.toast(id ? 'Form updated' : 'Form created', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    // ── CRUD — Sections ────────────────────────────────────────────────────────
    function openSectionModal(sectionId, title, description, collapsible) {
        $('#sectionId').val(sectionId || ''); $('#sectionTitle').val(title || '');
        $('#sectionDescription').val(description || '');
        $('#sectionCollapsible').prop('checked', collapsible === '1' || collapsible === true);
        $('#sectionModalLabel').text(sectionId ? 'Edit Section' : 'New Section');
        new bootstrap.Modal(document.getElementById('sectionModal')).show();
    }

    $('#btnSaveSection').on('click', function () {
        var id = $('#sectionId').val();
        var payload = { title: $('#sectionTitle').val().trim(), description: $('#sectionDescription').val().trim(), isCollapsible: $('#sectionCollapsible').is(':checked') };
        if (!payload.title) { HMS.toast('Title is required', 'error'); return; }
        var p = id
            ? api('PATCH', '/api/form-sections/' + id, payload)
            : api('POST', '/api/forms/' + FB.activeFormId + '/sections', payload);
        p.then(function () {
            bootstrap.Modal.getInstance(document.getElementById('sectionModal')).hide();
            return loadForm(FB.activeFormId);
        }).then(function () { HMS.toast(id ? 'Section updated' : 'Section added', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    // ── CRUD — Components ──────────────────────────────────────────────────────
    function openComponentPickerModal(sectionId) {
        $('#componentId').val(''); $('#componentSectionId').val(sectionId); $('#componentType').val('');
        $('#componentLabel').val(''); $('#componentKey').val(''); $('#componentRequired').prop('checked', false);
        $('#conditionsList').html('');
        $('#componentModalLabel').text('Add Component');
        $('#componentTypeConfig').html(renderComponentPicker(sectionId));
        $('#btnSaveComponent').hide();
        new bootstrap.Modal(document.getElementById('componentModal')).show();
        if (window.lucide) lucide.createIcons();
    }

    function openComponentEditModal(id, sectionId, type, label, key, required, config, conditions) {
        if (typeof config === 'string') { try { config = JSON.parse(config); } catch (e) { config = {}; } }
        if (typeof conditions === 'string') { try { conditions = JSON.parse(conditions); } catch (e) { conditions = []; } }
        $('#componentId').val(id); $('#componentSectionId').val(sectionId); $('#componentType').val(type);
        $('#componentLabel').val(label); $('#componentKey').val(key);
        $('#componentRequired').prop('checked', required === '1' || required === true);
        $('#componentModalLabel').text('Edit Component');
        $('#componentTypeConfig').html(buildConfigForm(type, config));
        var condHtml = '';
        (conditions || []).forEach(function (cond, i) { condHtml += renderConditionRow(cond, i); });
        $('#conditionsList').html(condHtml);
        $('#btnSaveComponent').show();
        if (window.lucide) lucide.createIcons();
        new bootstrap.Modal(document.getElementById('componentModal')).show();
    }

    $(document).on('click', '.btn-pick-type', function () {
        var type = $(this).data('type');
        var sectionId = $(this).data('section-id');
        $('#componentType').val(type); $('#componentSectionId').val(sectionId);
        $('#componentModalLabel').text('Configure Component');
        $('#componentTypeConfig').html(buildConfigForm(type, {}));
        $('#btnSaveComponent').show();
        if (window.lucide) lucide.createIcons();
    });

    $('#btnSaveComponent').on('click', function () {
        var id = $('#componentId').val();
        var sectionId = $('#componentSectionId').val();
        var type = $('#componentType').val();
        if (!type) { HMS.toast('Select a component type', 'error'); return; }
        var label = $('#componentLabel').val().trim();
        var key = $('#componentKey').val().trim();
        if (!label || !key) { HMS.toast('Label and key are required', 'error'); return; }
        var payload = { label: label, key: key, isRequired: $('#componentRequired').is(':checked'), config: collectConfig(type), conditions: collectConditions() };
        var p = id
            ? api('PATCH', '/api/form-components/' + id, payload)
            : api('POST', '/api/form-sections/' + parseInt(sectionId) + '/components', Object.assign({ type: type }, payload));
        p.then(function () {
            bootstrap.Modal.getInstance(document.getElementById('componentModal')).hide();
            return loadForm(FB.activeFormId);
        }).then(function () { HMS.toast(id ? 'Component updated' : 'Component added', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    $('#componentLabel').on('input', function () {
        if (!$('#componentId').val()) {
            $('#componentKey').val($(this).val().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
        }
    });

    // ── Delete handlers ────────────────────────────────────────────────────────
    $(document).on('click', '.btn-delete-group', function (e) {
        e.stopPropagation();
        var id = $(this).data('id');
        if (!confirm('Delete this group and all its forms?')) return;
        api('DELETE', '/api/form-groups/' + id).then(function () {
            var activeGroup = FB.groups.find(function (g) { return g.id === id; });
            if (activeGroup && (activeGroup.forms || []).find(function (f) { return f.id === FB.activeFormId; })) {
                FB.activeFormId = null; FB.activeForm = null;
                document.getElementById('fb-editor-empty').style.display = '';
                document.getElementById('fb-editor-content').style.display = 'none';
            }
            return loadAll();
        }).then(function () { HMS.toast('Group deleted', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    $(document).on('click', '.btn-delete-form', function (e) {
        e.stopPropagation();
        var id = $(this).data('id');
        if (!confirm('Delete this form and all its sections?')) return;
        api('DELETE', '/api/forms/' + id).then(function () {
            if (FB.activeFormId === id) {
                FB.activeFormId = null; FB.activeForm = null;
                document.getElementById('fb-editor-empty').style.display = '';
                document.getElementById('fb-editor-content').style.display = 'none';
            }
            return loadAll();
        }).then(function () { HMS.toast('Form deleted', 'success'); })
          .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    $(document).on('click', '.btn-delete-section', function () {
        var id = $(this).data('id');
        if (!confirm('Delete this section and all its components?')) return;
        api('DELETE', '/api/form-sections/' + id)
            .then(function () { return loadForm(FB.activeFormId); })
            .then(function () { HMS.toast('Section deleted', 'success'); })
            .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    $(document).on('click', '.btn-delete-component', function () {
        var id = $(this).data('id');
        if (!confirm('Delete this component?')) return;
        api('DELETE', '/api/form-components/' + id)
            .then(function () { return loadForm(FB.activeFormId); })
            .then(function () { HMS.toast('Component deleted', 'success'); })
            .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    // ── Event bindings ─────────────────────────────────────────────────────────
    $(document).on('click', '#btnNewGroup', function () { openGroupModal(null); });
    $(document).on('click', '.btn-edit-group', function (e) { e.stopPropagation(); openGroupModal($(this).data('id')); });
    $(document).on('click', '.btn-add-form', function (e) { e.stopPropagation(); openFormModal($(this).data('group-id')); });
    $(document).on('click', '.btn-edit-form', function (e) {
        e.stopPropagation();
        openFormModal($(this).data('group-id'), $(this).data('id'), $(this).data('name'), $(this).data('description'), $(this).data('instructions'), $(this).data('declaration'));
    });
    $(document).on('click', '.fb-form-item', function (e) {
        if ($(e.target).hasClass('fb-order-input') || $(e.target).closest('.fb-form-actions').length) return;
        var formId = $(this).data('form-id');
        if (formId) loadForm(formId);
    });
    $(document).on('click', '#btnNewSection', function () { openSectionModal(); });
    $(document).on('click', '.btn-edit-section', function () {
        openSectionModal($(this).data('id'), $(this).data('title'), $(this).data('description'), $(this).data('collapsible'));
    });
    $(document).on('click', '.btn-add-component', function () { openComponentPickerModal($(this).data('section-id')); });
    $(document).on('click', '.btn-edit-component', function () {
        openComponentEditModal($(this).data('id'), $(this).data('section-id'), $(this).data('type'), $(this).data('label'), $(this).data('key'), $(this).data('required'), $(this).data('config'), $(this).data('conditions'));
    });
    $(document).on('click', '#btnPreview', openPreviewModal);

    // ── Reorder handlers ──────────────────────────────────────────────────────
    $(document).on('click', '#btnReorderForms', function () {
        var items = [];
        $('.form-order-input').each(function () {
            items.push({ id: parseInt($(this).data('id')), sortOrder: parseInt($(this).val()) || 1 });
        });
        if (!items.length) { HMS.toast('No forms to reorder', 'error'); return; }
        api('PATCH', '/api/forms/reorder', items)
            .then(function () { HMS.toast('Form order saved', 'success'); return loadAll(); })
            .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    $(document).on('click', '#btnReorderEditor', function () {
        if (!FB.activeFormId) return;
        var sectionItems = [];
        var componentItems = [];
        $('.section-order-input').each(function () {
            sectionItems.push({ id: parseInt($(this).data('id')), sortOrder: parseInt($(this).val()) || 1 });
        });
        $('.component-order-input').each(function () {
            componentItems.push({ id: parseInt($(this).data('id')), sortOrder: parseInt($(this).val()) || 1 });
        });
        var p1 = sectionItems.length   ? api('PATCH', '/api/form-sections/reorder',   sectionItems)   : Promise.resolve();
        var p2 = componentItems.length ? api('PATCH', '/api/form-components/reorder', componentItems) : Promise.resolve();
        Promise.all([p1, p2])
            .then(function () { HMS.toast('Order saved', 'success'); return loadForm(FB.activeFormId); })
            .catch(function (e) { HMS.toast(e.message, 'error'); });
    });

    // ── Conditions builder ─────────────────────────────────────────────────────
    function getAllFormFields() {
        var fields = [];
        if (!FB.activeForm) return fields;
        (FB.activeForm.sections || []).forEach(function (section) {
            (section.components || []).forEach(function (comp) {
                if (comp.key && comp.type !== 'header') {
                    fields.push({ key: comp.key, label: comp.label });
                }
            });
        });
        return fields;
    }

    function renderConditionRow(cond, index) {
        var fields = getAllFormFields();
        var fieldOptions = '<option value="">-- Select field --</option>';
        fields.forEach(function (f) {
            var sel = (cond && cond.field === f.key) ? ' selected' : '';
            fieldOptions += '<option value="' + escAttr(f.key) + '"' + sel + '>' + escHtml(f.label) + ' (' + escHtml(f.key) + ')</option>';
        });
        var eqSel  = (!cond || cond.operator === 'equals')     ? ' selected' : '';
        var neSel  = (cond && cond.operator === 'not_equals')  ? ' selected' : '';
        var coSel  = (cond && cond.operator === 'contains')    ? ' selected' : '';
        return '<div class="condition-row d-flex gap-2 mb-2 align-items-center" data-index="' + index + '">' +
            '<select class="form-select form-select-sm cond-field" style="flex:2">' + fieldOptions + '</select>' +
            '<select class="form-select form-select-sm cond-operator" style="flex:1">' +
                '<option value="equals"'     + eqSel + '>equals</option>' +
                '<option value="not_equals"' + neSel + '>not equals</option>' +
                '<option value="contains"'   + coSel + '>contains</option>' +
            '</select>' +
            '<input type="text" class="form-control form-control-sm cond-value" style="flex:2" placeholder="Value" value="' + escAttr((cond && cond.value) || '') + '">' +
            '<button type="button" class="btn btn-sm btn-outline-danger btn-remove-condition"><i data-lucide="x" style="width:12px;height:12px"></i></button>' +
            '</div>';
    }

    function collectConditions() {
        var conditions = [];
        $('#conditionsList .condition-row').each(function () {
            var field    = $(this).find('.cond-field').val();
            var operator = $(this).find('.cond-operator').val();
            var value    = $(this).find('.cond-value').val().trim();
            if (field && value) {
                conditions.push({ field: field, operator: operator, value: value });
            }
        });
        return conditions;
    }

    $(document).on('click', '#btnAddCondition', function () {
        var index = $('#conditionsList .condition-row').length;
        var rowHtml = renderConditionRow(null, index);
        $('#conditionsList').append(rowHtml);
        if (window.lucide) lucide.createIcons();
    });

    $(document).on('click', '.btn-remove-condition', function () {
        $(this).closest('.condition-row').remove();
    });

    // ── Conditional visibility (preview) ──────────────────────────────────────
    function evaluateCondition($el, $container) {
        var conditions = $el.data('conditions');
        if (!conditions || !conditions.length) return;
        var visible = conditions.every(function (cond) {
            var $field = $container.find('[data-field-key="' + cond.field + '"]');
            var $input = $field.find('input[type="radio"], input[type="checkbox"]');
            var val;
            if ($input.length) {
                val = $field.find('input:checked').val() || '';
            } else {
                val = $field.find('input, select, textarea').first().val() || '';
            }
            if (cond.operator === 'equals')     return val === cond.value;
            if (cond.operator === 'not_equals') return val !== cond.value;
            if (cond.operator === 'contains')   return val.indexOf(cond.value) !== -1;
            return true;
        });
        $el.toggle(visible);
    }

    function applyConditionalVisibility(container) {
        var $container = $(container);
        $container.find('[data-conditions]').each(function () { evaluateCondition($(this), $container); });
        $container.on('change input', 'input, select, textarea', function () {
            $container.find('[data-conditions]').each(function () { evaluateCondition($(this), $container); });
        });
    }

    // ── Utilities ──────────────────────────────────────────────────────────────
    function escHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function escAttr(str) {
        return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    window.addTableConfigColumn = function() {
        var list = document.getElementById('cfgColumnsList');
        if (!list) return;
        var row = document.createElement('div');
        row.className = 'd-flex gap-1 mb-1 align-items-center cfg-col-row';
        row.innerHTML =
            '<input type="text" class="form-control form-control-sm cfg-col-name" placeholder="Column name">' +
            '<select class="form-select form-select-sm cfg-col-type" style="max-width:110px">' +
            '<option value="text">Text</option><option value="number">Number</option>' +
            '<option value="date">Date</option><option value="textarea">Textarea</option>' +
            '</select>' +
            '<button type="button" class="btn btn-sm btn-outline-danger px-2" onclick="this.closest(\'.cfg-col-row\').remove()">×</button>';
        list.appendChild(row);
    };

    // ── Init ───────────────────────────────────────────────────────────────────
    loadAll().catch(function (e) { HMS.toast(e.message, 'error'); });
});
