$(document).ready(function () {
    var roles = [];
    var editingRoleId = null;
    var deleteRoleId = null;
    var duplicateRoleId = null;
    var permRoleId = null;
    var allPermissions = [];
    var assignedPermIds = [];
    var formSheet = new bootstrap.Offcanvas(document.getElementById('roleFormSheet'));
    var permSheet = new bootstrap.Offcanvas(document.getElementById('permSheet'));
    var deleteModal = new bootstrap.Modal(document.getElementById('deleteRoleModal'));
    var duplicateModal = new bootstrap.Modal(document.getElementById('duplicateRoleModal'));

    function esc(str) {
        return $('<span>').text(str || '').html();
    }

    function slugify(str) {
        return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    function typeBadge(type) {
        if (type === 'system') {
            return '<span class="rm-badge rm-badge-system">System</span>';
        }
        return '<span class="rm-badge rm-badge-custom">Custom</span>';
    }

    function statusBadge(isActive) {
        if (isActive) {
            return '<span class="rm-badge rm-badge-active">Active</span>';
        }
        return '<span class="rm-badge rm-badge-inactive">Inactive</span>';
    }

    function loadRoles() {
        $.get('/api/roles', function (response) {
            roles = response.roles || response.data || [];
            if (!Array.isArray(roles)) roles = [];
            renderTable();
            applyStats(response.stats || {});
        }).fail(function () {
            $('#rolesTableBody').html('<tr><td colspan="7"><div class="rm-empty"><i data-lucide="alert-circle"></i><p>Failed to load roles</p></div></td></tr>');
            lucide.createIcons();
        });
    }

    function applyStats(stats) {
        $('#statTotalRoles').text(stats.total || roles.length || 0);
        $('#statSystemRoles').text(stats.system || 0);
        $('#statCustomRoles').text(stats.custom || 0);
        $('#statTotalPerms').text(stats.total_permissions || 0);
    }

    function getFilteredRoles() {
        var search = $('#roleSearch').val().toLowerCase();
        var typeFilter = $('#filterType').val();
        var statusFilter = $('#filterStatus').val();

        return roles.filter(function (r) {
            var matchesSearch = !search ||
                r.name.toLowerCase().indexOf(search) !== -1 ||
                (r.slug && r.slug.toLowerCase().indexOf(search) !== -1) ||
                (r.description && r.description.toLowerCase().indexOf(search) !== -1);
            var matchesType = typeFilter === 'all' || r.type === typeFilter;
            var matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && r.is_active) ||
                (statusFilter === 'inactive' && !r.is_active);
            return matchesSearch && matchesType && matchesStatus;
        });
    }

    function renderTable() {
        var filtered = getFilteredRoles();
        var $tbody = $('#rolesTableBody');

        if (filtered.length === 0) {
            $tbody.html('<tr><td colspan="7"><div class="rm-empty"><i data-lucide="shield"></i><p>No roles found</p></div></td></tr>');
            $('#rolesCount').text('Showing 0 roles');
            lucide.createIcons();
            return;
        }

        var html = '';
        filtered.forEach(function (r) {
            html += '<tr data-id="' + r.id + '">';
            html += '<td><div class="rm-name">' + esc(r.name) + '</div><div class="rm-slug">' + esc(r.slug) + '</div></td>';
            html += '<td class="rm-desc">' + esc(r.description || '-') + '</td>';
            html += '<td>' + typeBadge(r.type) + '</td>';
            html += '<td><span class="rm-count-badge"><i data-lucide="users" style="width:14px;height:14px"></i> ' + (r.users_count || r.user_count || 0) + '</span></td>';
            html += '<td><span class="rm-count-badge"><i data-lucide="key" style="width:14px;height:14px"></i> ' + (r.permissions_count || r.permission_count || 0) + '</span></td>';
            html += '<td>' + statusBadge(r.is_active) + '</td>';
            html += '<td>';
            html += '<div style="position:relative">';
            html += '<button class="rm-action-btn btn-action-menu" data-id="' + r.id + '"><i data-lucide="more-vertical" style="width:18px;height:18px"></i></button>';
            html += '<div class="rm-action-dropdown" id="roleActionMenu' + r.id + '">';
            html += '<div class="rm-action-item btn-edit-role" data-id="' + r.id + '"><i data-lucide="pencil" style="width:14px;height:14px"></i> Edit</div>';
            html += '<div class="rm-action-item btn-perm-role" data-id="' + r.id + '"><i data-lucide="key" style="width:14px;height:14px"></i> Permissions</div>';
            html += '<div class="rm-action-item btn-duplicate-role" data-id="' + r.id + '" data-name="' + esc(r.name) + '"><i data-lucide="copy" style="width:14px;height:14px"></i> Duplicate</div>';
            if (r.type !== 'system') {
                html += '<div class="rm-action-item danger btn-delete-role" data-id="' + r.id + '" data-name="' + esc(r.name) + '"><i data-lucide="trash-2" style="width:14px;height:14px"></i> Delete</div>';
            }
            html += '</div>';
            html += '</div>';
            html += '</td>';
            html += '</tr>';
        });

        $tbody.html(html);
        $('#rolesCount').text('Showing ' + filtered.length + ' role' + (filtered.length !== 1 ? 's' : ''));
        lucide.createIcons();
    }

    $(document).on('click', '.btn-action-menu', function (e) {
        e.stopPropagation();
        var id = $(this).data('id');
        $('.rm-action-dropdown').not('#roleActionMenu' + id).removeClass('show');
        $('#roleActionMenu' + id).toggleClass('show');
    });

    $(document).on('click', function () {
        $('.rm-action-dropdown').removeClass('show');
    });

    function clearForm() {
        $('#roleForm')[0].reset();
        $('#roleId').val('');
        $('#typeCustom').prop('checked', true);
        $('#roleStatusActive').prop('checked', true);
        $('.rm-form-input, .rm-form-textarea').removeClass('is-invalid');
        $('.rm-form-error').hide().text('');
        editingRoleId = null;
    }

    function showErrors(errors) {
        $('.rm-form-input, .rm-form-textarea').removeClass('is-invalid');
        $('.rm-form-error').hide().text('');
        if (errors) {
            Object.keys(errors).forEach(function (field) {
                var msg = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
                if (field === 'name') {
                    $('#roleName').addClass('is-invalid');
                    $('#nameError').text(msg).show();
                }
                if (field === 'slug') {
                    $('#roleSlug').addClass('is-invalid');
                    $('#slugError').text(msg).show();
                }
                if (field === 'description') {
                    $('#roleDescription').addClass('is-invalid');
                    $('#descriptionError').text(msg).show();
                }
            });
        }
    }

    $('#roleName').on('input', function () {
        if (!editingRoleId) {
            $('#roleSlug').val(slugify($(this).val()));
        }
    });

    $('#btnCreateRole').on('click', function () {
        clearForm();
        $('#roleFormTitle').text('Create New Role');
        $('#roleFormSubtitle').text('Add a new role to the system');
        $('#btnSaveLabel').text('Create Role');
        $('#typeSystem').closest('.rm-radio-option').show();
        formSheet.show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-edit-role', function () {
        var id = $(this).data('id');
        var role = roles.find(function (r) { return r.id === id; });
        if (!role) return;

        clearForm();
        editingRoleId = id;
        $('#roleId').val(id);
        $('#roleFormTitle').text('Edit Role');
        $('#roleFormSubtitle').text('Update role information');
        $('#btnSaveLabel').text('Save Changes');
        $('#roleName').val(role.name);
        $('#roleSlug').val(role.slug);
        $('#roleDescription').val(role.description || '');
        if (role.type === 'system') {
            $('#typeSystem').prop('checked', true);
        } else {
            $('#typeCustom').prop('checked', true);
        }
        if (role.is_active) {
            $('#roleStatusActive').prop('checked', true);
        } else {
            $('#roleStatusInactive').prop('checked', true);
        }
        if (role.type === 'system') {
            $('#typeSystem').closest('.rm-radio-option').show();
        }
        $('.rm-action-dropdown').removeClass('show');
        formSheet.show();
        lucide.createIcons();
    });

    $('#btnSaveRole').on('click', function () {
        var $btn = $(this);
        $btn.prop('disabled', true);

        var data = {
            name: $('#roleName').val(),
            slug: $('#roleSlug').val(),
            description: $('#roleDescription').val(),
            type: $('input[name="type"]:checked').val(),
            is_active: $('input[name="is_active"]:checked').val()
        };

        var url, method;
        if (editingRoleId) {
            url = '/api/roles/' + editingRoleId;
            method = 'PUT';
        } else {
            url = '/api/roles';
            method = 'POST';
        }

        $.ajax({
            url: url,
            method: method,
            data: data,
            success: function () {
                formSheet.hide();
                loadRoles();
                $btn.prop('disabled', false);
            },
            error: function (xhr) {
                $btn.prop('disabled', false);
                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    showErrors(xhr.responseJSON.errors);
                } else {
                    HMS.ajaxError(xhr, 'An error occurred');
                }
            }
        });
    });

    $(document).on('click', '.btn-delete-role', function () {
        deleteRoleId = $(this).data('id');
        $('#deleteRoleName').text($(this).data('name'));
        $('.rm-action-dropdown').removeClass('show');
        deleteModal.show();
        lucide.createIcons();
    });

    $('#btnConfirmDelete').on('click', function () {
        if (!deleteRoleId) return;
        var $btn = $(this);
        $btn.prop('disabled', true);

        $.ajax({
            url: '/api/roles/' + deleteRoleId,
            method: 'DELETE',
            success: function () {
                deleteModal.hide();
                loadRoles();
                $btn.prop('disabled', false);
                deleteRoleId = null;
            },
            error: function (xhr) {
                $btn.prop('disabled', false);
                HMS.ajaxError(xhr, 'Failed to delete role');
            }
        });
    });

    $(document).on('click', '.btn-duplicate-role', function () {
        duplicateRoleId = $(this).data('id');
        var name = $(this).data('name');
        $('#duplicateRoleName').val(name + ' (Copy)');
        $('.rm-action-dropdown').removeClass('show');
        duplicateModal.show();
        lucide.createIcons();
    });

    $('#btnConfirmDuplicate').on('click', function () {
        if (!duplicateRoleId) return;
        var $btn = $(this);
        $btn.prop('disabled', true);

        $.ajax({
            url: '/api/roles/' + duplicateRoleId + '/duplicate',
            method: 'POST',
            data: { name: $('#duplicateRoleName').val() },
            success: function () {
                duplicateModal.hide();
                loadRoles();
                $btn.prop('disabled', false);
                duplicateRoleId = null;
            },
            error: function (xhr) {
                $btn.prop('disabled', false);
                HMS.ajaxError(xhr, 'Failed to duplicate role');
            }
        });
    });

    $(document).on('click', '.btn-perm-role', function () {
        var id = $(this).data('id');
        var role = roles.find(function (r) { return r.id === id; });
        if (!role) return;

        permRoleId = id;
        $('#permSheetTitle').text('Permissions: ' + role.name);
        $('#permSheetSubtitle').text(role.slug === 'superadmin' ? 'Superadmin has all permissions (read-only)' : 'Assign permissions to this role');
        $('.rm-action-dropdown').removeClass('show');

        $('#permModuleList').html('<div style="padding:20px 16px;text-align:center;color:#9CA3AF;font-size:13px">Loading…</div>');
        $('#permDetailPanel').html('<div class="perm-detail-placeholder"><i data-lucide="loader" style="width:32px;height:32px;color:#ADB5BD;margin-bottom:12px"></i><p style="color:#6C757D;font-size:13px">Loading permissions…</p></div>');
        permSheet.show();
        lucide.createIcons();

        loadPermissions(id, role.slug === 'superadmin');
    });

    function loadPermissions(roleId, readOnly) {
        $.get('/api/roles/' + roleId + '/permissions', function (response) {
            var grouped = response.permissions || {};
            allPermissions = [];
            assignedPermIds = [];
            Object.keys(grouped).forEach(function (parentMod) {
                var modules = grouped[parentMod];
                Object.keys(modules).forEach(function (mod) {
                    modules[mod].forEach(function (p) {
                        p.parent_module = parentMod;
                        p.module = mod;
                        allPermissions.push(p);
                        if (p.assigned) {
                            assignedPermIds.push(p.id);
                        }
                    });
                });
            });
            renderPermissions(readOnly);
        }).fail(function () {
            $('#permDetailPanel').html('<div class="perm-detail-placeholder"><p style="color:#DC3545">Failed to load permissions</p></div>');
            lucide.createIcons();
        });
    }

    // ── Two-panel permission UI ───────────────────────────────────────────────

    var selectedModule = null;
    var permReadOnly = false;

    var MODULE_ICONS = {
        'dashboard': 'layout-dashboard', 'patients': 'users', 'doctors': 'user-check',
        'staff': 'users-2', 'opd': 'stethoscope', 'ipd': 'building-2',
        'emergency': 'siren', 'ot': 'scissors', 'bed-management': 'bed-double',
        'pharmacy': 'pill', 'laboratory': 'flask-conical', 'billing': 'credit-card',
        'income-expense': 'trending-up', 'charges': 'receipt', 'doctor-fees': 'banknote',
        'user-management': 'shield', 'role-management': 'key', 'configuration': 'settings'
    };

    function getModuleIcon(name) {
        var lower = (name || '').toLowerCase().replace(/\s+/g, '-');
        return MODULE_ICONS[lower] || 'circle';
    }

    function buildPermTree() {
        var tree = {};
        allPermissions.forEach(function (p) {
            var parent = p.parent_module || p.module;
            var mod = p.module;
            if (!tree[parent]) tree[parent] = {};
            if (!tree[parent][mod]) tree[parent][mod] = [];
            tree[parent][mod].push(p);
        });
        return tree;
    }

    function updatePermProgress() {
        var total = allPermissions.length;
        var assigned = assignedPermIds.length;
        var pct = total > 0 ? Math.round((assigned / total) * 100) : 0;
        $('#permProgressFill').css('width', pct + '%');
        $('#permProgressText').text(assigned + ' / ' + total);
    }

    function renderPermissions(readOnly) {
        permReadOnly = readOnly;
        selectedModule = null;
        renderModuleList();
        $('#permDetailPanel').html(
            '<div class="perm-detail-placeholder">' +
            '<i data-lucide="key" style="width:40px;height:40px;color:#ADB5BD;margin-bottom:12px"></i>' +
            '<p style="color:#6C757D;font-size:14px">Select a module from the left to manage permissions</p>' +
            '</div>'
        );
        lucide.createIcons();
        updatePermProgress();
        if (readOnly) {
            $('#btnSavePermissions').prop('disabled', true).css('opacity', '0.5');
            $('#btnGrantAll, #btnRevokeAll').prop('disabled', true);
        } else {
            $('#btnSavePermissions').prop('disabled', false).css('opacity', '1');
            $('#btnGrantAll, #btnRevokeAll').prop('disabled', false);
        }
    }

    function renderModuleList() {
        var tree = buildPermTree();
        var search = ($('#permSearch').val() || '').toLowerCase();
        var parentKeys = Object.keys(tree).sort();
        var html = '';

        parentKeys.forEach(function (parentMod) {
            var modules = tree[parentMod];
            var allPerms = [];
            var matchesSearch = !search;
            Object.keys(modules).forEach(function (mod) {
                modules[mod].forEach(function (p) {
                    allPerms.push(p);
                    if (search && (p.name.toLowerCase().indexOf(search) !== -1 || (p.slug || '').toLowerCase().indexOf(search) !== -1)) {
                        matchesSearch = true;
                    }
                });
            });
            if (search && !matchesSearch) return;

            var assignedCount = allPerms.filter(function (p) { return assignedPermIds.indexOf(p.id) !== -1; }).length;
            var isActive = selectedModule === parentMod;
            var hasSome = assignedCount > 0;

            html += '<div class="perm-mod-item' + (isActive ? ' active' : '') + '" data-module="' + esc(parentMod) + '">';
            html += '<div class="perm-mod-icon"><i data-lucide="' + getModuleIcon(parentMod) + '"></i></div>';
            html += '<div class="perm-mod-info"><div class="perm-mod-name">' + esc(parentMod) + '</div></div>';
            html += '<span class="perm-mod-pill' + (hasSome ? ' has-perms' : '') + '">' + assignedCount + '/' + allPerms.length + '</span>';
            html += '</div>';
        });

        if (!html) {
            html = '<div style="padding:20px 16px;text-align:center;color:#9CA3AF;font-size:13px">No modules found</div>';
        }
        $('#permModuleList').html(html);
        lucide.createIcons();
    }

    function renderToggleItem(p) {
        var checked = assignedPermIds.indexOf(p.id) !== -1;
        var dangerClass = p.is_dangerous ? ' is-dangerous' : '';
        var checkedClass = checked ? ' is-checked' : '';
        var iconName = p.is_dangerous ? 'alert-triangle' : (p.level === 'page' ? 'layout-dashboard' : (p.level === 'tab' ? 'panel-top' : 'zap'));
        var disabled = permReadOnly ? ' disabled' : '';
        return '<div class="perm-toggle-item' + dangerClass + checkedClass + '" data-id="' + p.id + '">' +
            '<div class="perm-toggle-left">' +
            '<div class="perm-toggle-icon' + (p.is_dangerous ? ' danger-icon' : '') + '"><i data-lucide="' + iconName + '"></i></div>' +
            '<div class="perm-toggle-text">' +
            '<div class="perm-toggle-name">' + esc(p.name) + '</div>' +
            '<div class="perm-toggle-slug">' + esc(p.slug || '') + '</div>' +
            '</div></div>' +
            '<label class="perm-switch' + (permReadOnly ? ' perm-switch-disabled' : '') + '" onclick="event.stopPropagation()">' +
            '<input type="checkbox" class="perm-cb" data-id="' + p.id + '"' + (checked ? ' checked' : '') + disabled + '>' +
            '<span class="perm-switch-track"></span></label></div>';
    }

    function renderPermDetail(moduleName) {
        selectedModule = moduleName;
        if (!moduleName) {
            $('#permDetailPanel').html('<div class="perm-detail-placeholder"><i data-lucide="key" style="width:40px;height:40px;color:#ADB5BD;margin-bottom:12px"></i><p style="color:#6C757D;font-size:14px">Select a module from the left to manage permissions</p></div>');
            lucide.createIcons();
            return;
        }
        var search = ($('#permSearch').val() || '').toLowerCase();
        var tree = buildPermTree();
        var modules = tree[moduleName];
        if (!modules) { renderPermDetail(null); return; }

        var allModPerms = [];
        Object.keys(modules).forEach(function (mod) { modules[mod].forEach(function (p) { allModPerms.push(p); }); });
        var assignedInMod = allModPerms.filter(function (p) { return assignedPermIds.indexOf(p.id) !== -1; }).length;

        var html = '<div class="perm-detail-header">';
        html += '<div><div class="perm-detail-title">' + esc(moduleName) + '</div>';
        html += '<div class="perm-detail-subtitle">' + assignedInMod + ' of ' + allModPerms.length + ' permissions granted</div></div>';
        if (!permReadOnly) {
            html += '<div class="perm-detail-actions">';
            html += '<button class="perm-detail-action-btn" id="btnGrantModule" data-module="' + esc(moduleName) + '">Grant All</button>';
            html += '<button class="perm-detail-action-btn" id="btnRevokeModule" data-module="' + esc(moduleName) + '">Revoke All</button>';
            html += '</div>';
        }
        html += '</div><div class="perm-detail-body">';

        Object.keys(modules).sort().forEach(function (mod) {
            var perms = modules[mod];
            var pagePerms = perms.filter(function (p) { return p.level === 'page'; });
            var tabPerms = perms.filter(function (p) { return p.level === 'tab'; });
            var actionPerms = perms.filter(function (p) { return p.level === 'action'; });

            if (search) {
                function ms(p) { return p.name.toLowerCase().indexOf(search) !== -1 || (p.slug||'').toLowerCase().indexOf(search) !== -1; }
                pagePerms = pagePerms.filter(ms); tabPerms = tabPerms.filter(ms); actionPerms = actionPerms.filter(ms);
            }
            if (!pagePerms.length && !tabPerms.length && !actionPerms.length) return;

            if (mod !== moduleName) {
                html += '<div class="perm-submod-header">' + esc(mod) + '</div>';
            }
            if (pagePerms.length) {
                html += '<div class="perm-section-title"><i data-lucide="layout-dashboard" style="width:12px;height:12px"></i> Page Access</div>';
                pagePerms.forEach(function (p) { html += renderToggleItem(p); });
            }
            if (tabPerms.length) {
                html += '<div class="perm-section-title"><i data-lucide="panel-top" style="width:12px;height:12px"></i> Tab Access</div>';
                tabPerms.forEach(function (p) { html += renderToggleItem(p); });
            }
            if (actionPerms.length) {
                html += '<div class="perm-section-title"><i data-lucide="zap" style="width:12px;height:12px"></i> Actions</div>';
                actionPerms.forEach(function (p) { html += renderToggleItem(p); });
            }
        });

        html += '</div>';
        $('#permDetailPanel').html(html);
        lucide.createIcons();
    }

    // Module list click – select module
    $(document).on('click', '.perm-mod-item', function () {
        selectedModule = $(this).data('module');
        renderModuleList();
        renderPermDetail(selectedModule);
    });

    // Row click = toggle switch
    $(document).on('click', '.perm-toggle-item', function (e) {
        if (permReadOnly) return;
        if ($(e.target).is('input') || $(e.target).closest('label').length) return;
        var $cb = $(this).find('.perm-cb');
        $cb.prop('checked', !$cb.prop('checked')).trigger('change');
    });

    // Checkbox change
    $(document).on('change', '.perm-cb', function () {
        if (permReadOnly) return;
        var id = parseInt($(this).data('id'));
        if ($(this).is(':checked')) {
            if (assignedPermIds.indexOf(id) === -1) assignedPermIds.push(id);
            $(this).closest('.perm-toggle-item').addClass('is-checked');
        } else {
            assignedPermIds = assignedPermIds.filter(function (pid) { return pid !== id; });
            $(this).closest('.perm-toggle-item').removeClass('is-checked');
        }
        // Live-update subtitle count
        var $sub = $('#permDetailPanel .perm-detail-subtitle');
        if ($sub.length && selectedModule) {
            var t = buildPermTree()[selectedModule];
            if (t) {
                var all = []; Object.keys(t).forEach(function (m) { t[m].forEach(function (p) { all.push(p); }); });
                $sub.text(all.filter(function (p) { return assignedPermIds.indexOf(p.id) !== -1; }).length + ' of ' + all.length + ' permissions granted');
            }
        }
        renderModuleList();
        updatePermProgress();
    });

    // Grant / Revoke current module
    $(document).on('click', '#btnGrantModule', function () {
        if (permReadOnly) return;
        var mod = $(this).data('module');
        var t = buildPermTree()[mod];
        if (!t) return;
        Object.keys(t).forEach(function (sm) { t[sm].forEach(function (p) { if (assignedPermIds.indexOf(p.id) === -1) assignedPermIds.push(p.id); }); });
        renderModuleList(); renderPermDetail(mod); updatePermProgress();
    });

    $(document).on('click', '#btnRevokeModule', function () {
        if (permReadOnly) return;
        var mod = $(this).data('module');
        var t = buildPermTree()[mod];
        if (!t) return;
        var ids = [];
        Object.keys(t).forEach(function (sm) { t[sm].forEach(function (p) { ids.push(p.id); }); });
        assignedPermIds = assignedPermIds.filter(function (id) { return ids.indexOf(id) === -1; });
        renderModuleList(); renderPermDetail(mod); updatePermProgress();
    });

    // Grant / Revoke all
    $('#btnGrantAll').on('click', function () {
        if (permReadOnly) return;
        assignedPermIds = allPermissions.map(function (p) { return p.id; });
        renderModuleList(); if (selectedModule) renderPermDetail(selectedModule); updatePermProgress();
    });

    $('#btnRevokeAll').on('click', function () {
        if (permReadOnly) return;
        assignedPermIds = [];
        renderModuleList(); if (selectedModule) renderPermDetail(selectedModule); updatePermProgress();
    });

    $('#permSearch').on('input', function () {
        renderModuleList();
        if (selectedModule) renderPermDetail(selectedModule);
    });

    $('#btnSavePermissions').on('click', function () {
        if (!permRoleId) return;
        var $btn = $(this);
        $btn.prop('disabled', true);

        $.ajax({
            url: '/api/roles/' + permRoleId + '/permissions',
            method: 'POST',
            data: { permission_ids: assignedPermIds },
            success: function () {
                permSheet.hide();
                loadRoles();
                $btn.prop('disabled', false);
            },
            error: function (xhr) {
                $btn.prop('disabled', false);
                HMS.ajaxError(xhr, 'Failed to save permissions');
            }
        });
    });

    $('#roleSearch').on('input', function () {
        renderTable();
    });

    $('#filterType, #filterStatus').on('change', function () {
        renderTable();
    });

    loadRoles();
});
