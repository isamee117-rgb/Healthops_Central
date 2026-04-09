// ── Global pagination state ────────────────────────────────────────────────
var umCurrentPage = 1;
var umPerPageVal  = 10;
var umFiltered    = null;

$(function() {
    var currentUserRole = $('.module-page').data('user-role') || 'user';
    var users = [];
    var editingUserId = null;
    var deleteUserId  = null;
    var formSheet   = new bootstrap.Offcanvas(document.getElementById('userFormSheet'));
    var deleteModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));

    // Fetch all roles from API and populate the dropdown
    function populateRoleDropdown(selectedValue) {
        var $select = $('#userRole');
        $select.empty().append('<option value="">Loading roles...</option>').prop('disabled', true);
        $.get('/api/roles', function(response) {
            var roles = response.roles || response.data || response || [];
            if (!Array.isArray(roles)) roles = Object.values(roles);
            $select.empty().append('<option value="">-- Select Role --</option>');
            roles.forEach(function(r) {
                if (!r.is_active && r.is_active !== undefined) return; // skip inactive roles
                var val   = r.slug || r.name.toLowerCase().replace(/\s+/g, '-');
                var label = r.name;
                $select.append('<option value="' + val + '">' + label + '</option>');
            });
            if (selectedValue) $select.val(selectedValue);
            $select.prop('disabled', false);
        }).fail(function() {
            // Fallback to built-in roles if API fails
            $select.empty().append('<option value="">-- Select Role --</option>');
            [{ value: 'superadmin', label: 'Superadmin' }, { value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }]
                .forEach(function(opt) { $select.append('<option value="' + opt.value + '">' + opt.label + '</option>'); });
            if (selectedValue) $select.val(selectedValue);
            $select.prop('disabled', false);
        });
    }

    function esc(str) { return $('<span>').text(str || '').html(); }

    function roleBadge(role) {
        return '<span class="um-badge um-badge-' + role + '">' + role + '</span>';
    }

    function statusBadge(isActive) {
        return isActive
            ? '<span class="um-badge um-badge-active">Active</span>'
            : '<span class="um-badge um-badge-inactive">Inactive</span>';
    }

    function loadUsers() {
        $.get('/api/users', function(response) {
            users = response.users || response.data || [];
            if (!Array.isArray(users)) users = [];
            window._users_ref = users;
            updateStats(response.stats);
            renderTable();
        }).fail(function() {
            $('#usersTableBody').html('<tr><td colspan="5"><div class="um-empty"><i data-lucide="alert-circle"></i><p>Failed to load users</p></div></td></tr>');
            lucide.createIcons();
        });
    }

    function updateStats(stats) {
        if (!stats) {
            $.get('/api/users/stats', function(s) { applyStats(s); });
        } else {
            applyStats(stats);
        }
    }

    function applyStats(stats) {
        $('#statTotalUsers').text(stats.total || 0);
        $('#statAdmins').text((stats.superadmins || 0) + (stats.admins || 0));
        $('#statUsers').text(stats.users || 0);
    }

    // ── Filtered data (umFiltered set by applyUmFilters, search applied on top) ─
    function getFilteredUsers() {
        var base   = umFiltered !== null ? umFiltered : users;
        var search = ($('#userSearch').val() || '').toLowerCase().trim();
        if (!search) return base;
        return base.filter(function(u) {
            return (u.name  || '').toLowerCase().indexOf(search) !== -1 ||
                   (u.email || '').toLowerCase().indexOf(search) !== -1;
        });
    }

    function renderTable() {
        umCurrentPage = 1;
        _umRenderPagination(getFilteredUsers());
    }

    function _umRenderPagination(source) {
        var total      = source.length;
        var totalPages = Math.max(1, Math.ceil(total / umPerPageVal));
        if (umCurrentPage > totalPages) umCurrentPage = totalPages;
        var start = (umCurrentPage - 1) * umPerPageVal;
        var page  = source.slice(start, start + umPerPageVal);

        var h = '';
        if (page.length === 0) {
            h = '<tr><td colspan="5"><div class="um-empty"><i data-lucide="users"></i><p>No users found</p></div></td></tr>';
        } else {
            page.forEach(function(u) {
                h += '<tr data-id="' + u.id + '">';
                h += '<td data-col="0" class="um-name">' + esc(u.name) + '</td>';
                h += '<td data-col="1" class="um-email">' + esc(u.email) + '</td>';
                h += '<td data-col="2">' + roleBadge(u.role) + '</td>';
                h += '<td data-col="3">' + statusBadge(u.is_active) + '</td>';
                h += '<td><div style="position:relative">';
                h += '<button class="um-action-btn btn-action-menu" data-id="' + u.id + '"><i data-lucide="more-vertical" style="width:18px;height:18px"></i></button>';
                h += '<div class="um-action-dropdown" id="actionMenu' + u.id + '">';
                h += '<div class="um-action-item btn-edit-user" data-id="' + u.id + '"><i data-lucide="pencil" style="width:14px;height:14px"></i> Edit</div>';
                if (u.role !== 'superadmin') {
                    h += '<div class="um-action-item danger btn-delete-user" data-id="' + u.id + '" data-name="' + esc(u.name) + '"><i data-lucide="trash-2" style="width:14px;height:14px"></i> Delete</div>';
                }
                h += '</div></div></td></tr>';
            });
        }
        $('#usersTableBody').html(h);
        lucide.createIcons();

        var endRow = Math.min(start + umPerPageVal, total);
        $('#umTableInfo').text(total === 0 ? 'No records' : 'Showing ' + (start + 1) + '–' + endRow + ' of ' + total + ' records');

        var nums = '';
        for (var i = 1; i <= totalPages; i++) {
            nums += '<button class="opd-page-num' + (i === umCurrentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        $('#umPageNums').html(nums);
        $('#umPrevPage').prop('disabled', umCurrentPage <= 1);
        $('#umNextPage').prop('disabled', umCurrentPage >= totalPages);
    }

    // ── Expose for window functions ─────────────────────────────────────────────
    window._umGetFiltered      = getFilteredUsers;
    window._umRenderPagination = _umRenderPagination;

    // ── Search ──────────────────────────────────────────────────────────────────
    $('#userSearch').on('input', function() {
        umCurrentPage = 1;
        _umRenderPagination(getFilteredUsers());
    });

    // ── Pagination delegated events ─────────────────────────────────────────────
    $(document).on('click', '#umPageNums .opd-page-num', function() {
        umCurrentPage = parseInt($(this).data('page'));
        _umRenderPagination(getFilteredUsers());
    });
    $(document).on('click', '#umPrevPage', function() {
        if (umCurrentPage > 1) { umCurrentPage--; _umRenderPagination(getFilteredUsers()); }
    });
    $(document).on('click', '#umNextPage', function() {
        var totalPages = Math.max(1, Math.ceil(getFilteredUsers().length / umPerPageVal));
        if (umCurrentPage < totalPages) { umCurrentPage++; _umRenderPagination(getFilteredUsers()); }
    });

    // ── Row action dropdown ──────────────────────────────────────────────────────
    $(document).on('click', '.btn-action-menu', function(e) {
        e.stopPropagation();
        var id = $(this).data('id');
        $('.um-action-dropdown').not('#actionMenu' + id).removeClass('show');
        $('#actionMenu' + id).toggleClass('show');
    });

    $(document).on('click', function() {
        $('.um-action-dropdown').removeClass('show');
    });

    // ── Outside-click handler (menus) ───────────────────────────────────────────
    $(document).on('click.umMenus', function(e) {
        if (!$(e.target).closest('#umRowsMenu, #umRowsBtn').length)          $('#umRowsMenu').removeClass('open');
        if (!$(e.target).closest('#umColVisMenu, .opd-col-vis-wrap').length) $('#umColVisMenu').removeClass('open');
        if (!$(e.target).closest('#umExportMenu, .opd-export-wrap').length)  $('#umExportMenu').removeClass('open');
        if (!$(e.target).closest('.opd-cs-trigger,.opd-cs-popup').length)    umCloseAll();
    });

    // ── Toolbar window functions ────────────────────────────────────────────────
    window.toggleUmFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('umFilterPane');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnUmFilter');
        if (btn) btn.classList.toggle('active', !open);
    };

    window.applyUmFilters = function() {
        var roleVal   = ($('#umRoleFilter').val()   || '').toLowerCase().trim();
        var statusVal = ($('#umStatusFilter').val() || '').toLowerCase().trim();
        umFiltered = (window._users_ref || []).filter(function(u) {
            if (roleVal && roleVal !== 'all roles' && (u.role || '').toLowerCase() !== roleVal) return false;
            if (statusVal && statusVal !== 'all status') {
                if (statusVal === 'active'   && !u.is_active) return false;
                if (statusVal === 'inactive' &&  u.is_active) return false;
            }
            return true;
        });
        var count = 0;
        if (roleVal   && roleVal   !== 'all roles')   count++;
        if (statusVal && statusVal !== 'all status')  count++;
        var badge = document.getElementById('umFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }
        var btn = document.getElementById('btnUmFilter');
        if (btn) btn.classList.toggle('active', count > 0);
        umCurrentPage = 1;
        if (window._umRenderPagination && window._umGetFiltered) window._umRenderPagination(window._umGetFiltered());
        toggleUmFilter();
    };

    window.resetUmFilters = function() {
        umFiltered = null; umCurrentPage = 1;
        ['umCsRole', 'umCsStatus'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        var badge = document.getElementById('umFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        var btn = document.getElementById('btnUmFilter');
        if (btn) btn.classList.remove('active');
        if (window._umRenderPagination && window._umGetFiltered) window._umRenderPagination(window._umGetFiltered());
    };

    window.toggleUmRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('umRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setUmRowsPer = function(n) {
        umPerPageVal = n; umCurrentPage = 1;
        var m = document.getElementById('umRowsMenu'); if (m) m.classList.remove('open');
        if (window._umRenderPagination && window._umGetFiltered) window._umRenderPagination(window._umGetFiltered());
    };

    window.toggleUmColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('umColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.umColVisSelectAll = function() {
        $('#umColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyUmColVis = function() {
        var m = document.getElementById('umColVisMenu'); if (m) m.classList.remove('open');
        $('#umColVisList input[type=checkbox]').each(function() {
            var col  = parseInt($(this).data('col'));
            var show = $(this).is(':checked');
            $('#usersTable thead tr th:eq(' + col + ')').toggle(show);
            $('#usersTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleUmExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('umExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportUm = function(type) {
        var m = document.getElementById('umExportMenu'); if (m) m.classList.remove('open');
        var data = window._umGetFiltered ? window._umGetFiltered() : [];
        if (type === 'csv') {
            var hdrs = ['Name', 'Email', 'Role', 'Status'];
            var rows = data.map(function(u) {
                return [u.name || '', u.email || '', u.role || '', u.is_active ? 'Active' : 'Inactive'];
            });
            var lines = [hdrs.map(function(h) { return '"' + h + '"'; }).join(',')];
            rows.forEach(function(r) { lines.push(r.map(function(c) { return '"' + (c + '').replace(/"/g, '""') + '"'; }).join(',')); });
            var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'users.csv'; a.click(); URL.revokeObjectURL(url);
        } else {
            window.print();
        }
    };

    // ── Searchable select (cs-wrap) ─────────────────────────────────────────────
    function umCloseAll() {
        document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
    }
    document.addEventListener('click', umCloseAll);

    function umInitCs(wrapId) {
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
        var valEl = triggerEl.querySelector('.opd-cs-val');
        var srch  = popup.querySelector('.opd-cs-search');
        var list  = popup.querySelector('.opd-cs-list');
        function renderList(q) {
            q = (q || '').toLowerCase();
            var filt = q ? options.filter(function(o) { return o.toLowerCase().indexOf(q) > -1; }) : options;
            if (!filt.length) { list.innerHTML = '<div class="opd-cs-empty">No options</div>'; return; }
            list.innerHTML = filt.map(function(o) {
                return '<div class="opd-cs-option' + (o === selVal ? ' selected' : '') + '" data-v="' + o.replace(/"/g, '&quot;') + '">' + o + '</div>';
            }).join('');
            list.querySelectorAll('.opd-cs-option').forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.stopPropagation();
                    selVal = this.dataset.v;
                    valEl.textContent = selVal; valEl.classList.remove('opd-ph');
                    if (hidden) hidden.value = selVal;
                    umCloseAll();
                });
            });
        }
        triggerEl.addEventListener('click', function(e) {
            e.stopPropagation(); var isOpen = popup.classList.contains('open'); umCloseAll();
            if (!isOpen) {
                var rect = triggerEl.getBoundingClientRect();
                popup.style.top  = (rect.bottom + 6) + 'px';
                popup.style.left = rect.left + 'px';
                popup.style.width = rect.width + 'px';
                popup._trigger = triggerEl;
                if (popup.parentNode !== document.body) document.body.appendChild(popup);
                popup.classList.add('open'); triggerEl.classList.add('open');
                srch.value = ''; renderList('');
                setTimeout(function() { srch.focus(); }, 40);
            }
        });
        srch.addEventListener('input', function(e) { e.stopPropagation(); renderList(this.value); });
        srch.addEventListener('click', function(e) { e.stopPropagation(); });
        popup.addEventListener('click', function(e) { e.stopPropagation(); });
        wrap.setOptions = function(opts) { options = opts || []; };
        wrap._reset = function() {
            selVal = ''; valEl.textContent = ph; valEl.classList.add('opd-ph');
            if (hidden) hidden.value = '';
        };
    }

    // ── Initialize cs-wraps ─────────────────────────────────────────────────────
    ['umCsRole', 'umCsStatus'].forEach(umInitCs);

    var roleWrap   = document.getElementById('umCsRole');
    var statusWrap = document.getElementById('umCsStatus');
    if (roleWrap   && roleWrap.setOptions)   roleWrap.setOptions(['All Roles', 'Superadmin', 'Admin', 'User']);
    if (statusWrap && statusWrap.setOptions) statusWrap.setOptions(['All Status', 'Active', 'Inactive']);

    // ── Form helpers ────────────────────────────────────────────────────────────
    function clearForm() {
        $('#userForm')[0].reset();
        $('#userId').val('');
        $('#statusActive').prop('checked', true);
        $('.um-form-input, .um-form-select').removeClass('is-invalid');
        $('.um-form-error').hide().text('');
        editingUserId = null;
    }

    function showErrors(errors) {
        $('.um-form-input, .um-form-select').removeClass('is-invalid');
        $('.um-form-error').hide().text('');
        if (errors) {
            Object.keys(errors).forEach(function(field) {
                var msg = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
                if (field === 'name')                 { $('#userName').addClass('is-invalid');          $('#nameError').text(msg).show(); }
                if (field === 'email')                { $('#userEmail').addClass('is-invalid');         $('#emailError').text(msg).show(); }
                if (field === 'password')             { $('#userPassword').addClass('is-invalid');      $('#passwordError').text(msg).show(); }
                if (field === 'password_confirmation'){ $('#userPasswordConfirm').addClass('is-invalid'); $('#passwordConfirmError').text(msg).show(); }
                if (field === 'role')                 { $('#userRole').addClass('is-invalid');          $('#roleError').text(msg).show(); }
            });
        }
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────────
    $('#btnCreateUser').on('click', function() {
        clearForm();
        populateRoleDropdown(null);
        $('#userFormTitle').text('Create New User');
        $('#userFormSubtitle').text('Add a new user to the system');
        $('#btnSaveLabel').text('Create User');
        // Password required for new users
        $('#userPassword').attr('placeholder', 'Enter password').removeAttr('disabled');
        $('#userPasswordConfirm').attr('placeholder', 'Re-enter password');
        $('#passwordHelp').text('Minimum 8 characters');
        $('#passwordLabel').html('Password <span class="required">*</span>');
        $('#passwordConfirmLabel').html('Confirm Password <span class="required">*</span>');
        formSheet.show(); lucide.createIcons();
    });

    $(document).on('click', '.btn-edit-user', function() {
        var id   = $(this).data('id');
        var user = users.find(function(u) { return u.id === id; });
        if (!user) return;
        clearForm();
        populateRoleDropdown(user.role);
        editingUserId = id;
        $('#userId').val(id);
        $('#userFormTitle').text('Edit User');
        $('#userFormSubtitle').text('Update user information');
        $('#btnSaveLabel').text('Save Changes');
        $('#userName').val(user.name);
        $('#userEmail').val(user.email);
        if (user.is_active) { $('#statusActive').prop('checked', true); }
        else                { $('#statusInactive').prop('checked', true); }
        // Password optional in edit mode — show placeholder to indicate it's already set
        $('#userPassword').attr('placeholder', '••••••••  (leave blank to keep current)').removeAttr('required');
        $('#userPasswordConfirm').attr('placeholder', '••••••••  (leave blank to keep current)');
        $('#passwordHelp').text('Only fill this if you want to change the password.');
        $('#passwordLabel').html('Password <span style="color:#6C757D;font-weight:400;font-size:13px">(optional)</span>');
        $('#passwordConfirmLabel').html('Confirm Password <span style="color:#6C757D;font-weight:400;font-size:13px">(optional)</span>');
        $('.um-action-dropdown').removeClass('show');
        formSheet.show(); lucide.createIcons();
    });

    $('#btnSaveUser').on('click', function() {
        // Basic client-side guard
        if (!$('#userName').val().trim()) { $('#userName').addClass('is-invalid'); $('#nameError').text('Name is required').show(); return; }
        if (!$('#userEmail').val().trim()) { $('#userEmail').addClass('is-invalid'); $('#emailError').text('Email is required').show(); return; }
        if (!$('#userRole').val()) { $('#userRole').addClass('is-invalid'); $('#roleError').text('Please select a role').show(); return; }
        if (!editingUserId && !$('#userPassword').val()) { $('#userPassword').addClass('is-invalid'); $('#passwordError').text('Password is required').show(); return; }

        var $btn = $(this); $btn.prop('disabled', true);
        var data = {
            name:      $('#userName').val(),
            email:     $('#userEmail').val(),
            role:      $('#userRole').val(),
            is_active: $('input[name="is_active"]:checked').val() || '1'
        };
        var password = $('#userPassword').val();
        if (password) {
            data.password = password;
            data.password_confirmation = $('#userPasswordConfirm').val();
        }
        var url    = editingUserId ? '/api/users/' + editingUserId : '/api/users';
        var method = editingUserId ? 'PUT' : 'POST';
        $.ajax({
            url: url, method: method, data: data,
            success: function() { formSheet.hide(); loadUsers(); $btn.prop('disabled', false); },
            error: function(xhr) {
                $btn.prop('disabled', false);
                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    showErrors(xhr.responseJSON.errors);
                } else if (xhr.status === 403) {
                    HMS.ajaxError(xhr, 'Permission denied');
                } else {
                    HMS.ajaxError(xhr, 'An error occurred. Please try again.');
                }
            }
        });
    });

    $(document).on('click', '.btn-delete-user', function() {
        deleteUserId = $(this).data('id');
        $('#deleteUserName').text($(this).data('name'));
        $('.um-action-dropdown').removeClass('show');
        deleteModal.show(); lucide.createIcons();
    });

    $('#btnConfirmDelete').on('click', function() {
        if (!deleteUserId) return;
        var $btn = $(this); $btn.prop('disabled', true);
        $.ajax({
            url: '/api/users/' + deleteUserId, method: 'DELETE',
            success: function() { deleteModal.hide(); loadUsers(); $btn.prop('disabled', false); deleteUserId = null; },
            error: function(xhr) { $btn.prop('disabled', false); HMS.ajaxError(xhr, 'Failed to delete user'); }
        });
    });

    loadUsers();
});
