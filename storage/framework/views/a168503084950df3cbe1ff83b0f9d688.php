<?php $__env->startSection('content'); ?>
<style>
    .um-stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
    }
    .um-stat-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    .um-stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #003366;
        margin-bottom: 8px;
    }
    .um-stat-label {
        font-size: 14px;
        color: #6C757D;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .um-table {
        width: 100%;
        border-collapse: collapse;
    }
    .um-table thead {
        background: #F8F9FA;
    }
    .um-table th {
        padding: 14px 20px;
        text-align: left;
        font-size: 12px;
        font-weight: 700;
        color: #6C757D;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #DEE2E6;
        white-space: nowrap;
    }
    .um-table td {
        padding: 14px 20px;
        border-bottom: 1px solid #F1F3F5;
        font-size: 14px;
        color: #2C3E50;
    }
    .um-table tbody tr:last-child td { border-bottom: none; }
    .um-table tbody tr:hover { background: #F8FFFE; }
    .um-table .um-name { font-weight: 600; color: #2C3E50; }
    .um-table .um-email { color: #6C757D; font-size: 13px; }
    .um-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .um-badge-superadmin { background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%); color: white; }
    .um-badge-admin { background: #7FFFD4; color: #003366; }
    .um-badge-user { background: #E5E7EB; color: #4B5563; }
    .um-badge-active { background: #D1FAE5; color: #059669; }
    .um-badge-inactive { background: #FEE2E2; color: #DC2626; }
    .um-action-btn {
        background: none; border: none; font-size: 20px; cursor: pointer;
        padding: 6px; color: #6C757D; border-radius: 6px; transition: all 0.2s ease;
        display: flex; align-items: center; justify-content: center;
    }
    .um-action-btn:hover { color: #003366; background: #F8F9FA; }
    .um-action-dropdown {
        position: absolute; right: 0; top: 100%; background: white;
        border: 1px solid #DEE2E6; border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 160px; z-index: 10; display: none;
    }
    .um-action-dropdown.show { display: block; }
    .um-action-item {
        padding: 10px 14px; cursor: pointer; font-size: 13px; color: #2C3E50;
        border-bottom: 1px solid #F1F3F5; display: flex; align-items: center;
        gap: 8px; transition: background 0.15s;
    }
    .um-action-item:last-child { border-bottom: none; }
    .um-action-item:hover { background: #F8F9FA; }
    .um-action-item.danger { color: #DC3545; }
    .um-action-item.danger:hover { background: #FEE2E2; }
    .um-page-header {
        background: white; padding: 24px 32px; border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 24px;
        display: flex; align-items: center; justify-content: space-between;
    }
    .um-page-header h1 {
        font-size: 28px; font-weight: 600; color: #003366;
        margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px;
    }
    .um-page-header p { font-size: 14px; color: #6C757D; margin: 0; }
    .um-btn-add {
        padding: 10px 20px; font-size: 14px; font-weight: 600; background: #060740;
        color: #7FFFD4; border: none; border-radius: 8px; cursor: pointer;
        transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; white-space: nowrap;
    }
    .um-btn-add:hover { opacity: 0.88; }
    .um-offcanvas-header {
        background: #003366; color: white; padding: 24px 32px;
        display: flex; align-items: center; justify-content: space-between;
        flex-shrink: 0;
    }
    .um-offcanvas-header h5 { font-size: 20px; font-weight: 600; margin: 0 0 4px 0; }
    .um-offcanvas-header p { font-size: 14px; margin: 0; opacity: 0.7; }
    .um-form-body { padding: 32px; background: #F8F9FA; flex: 1 1 0; overflow-y: auto; min-height: 0; }
    .um-form-card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .um-form-group { margin-bottom: 24px; }
    .um-form-label { display: block; font-size: 14px; font-weight: 600; color: #2C3E50; margin-bottom: 8px; }
    .um-form-label .required { color: #DC3545; }
    .um-form-input {
        width: 100%; padding: 12px 16px; font-size: 15px; border: 2px solid #DEE2E6;
        border-radius: 6px; transition: all 0.2s ease; background: white;
        font-family: inherit; color: #2C3E50;
    }
    .um-form-input:focus { outline: none; border-color: #7FFFD4; box-shadow: 0 0 0 3px rgba(127,255,212,0.15); }
    .um-form-input.is-invalid { border-color: #DC3545; }
    .um-form-input::placeholder { color: #ADB5BD; }
    .um-form-select {
        width: 100%; padding: 12px 16px; font-size: 15px; border: 2px solid #DEE2E6;
        border-radius: 6px; background: white; cursor: pointer; font-family: inherit;
        color: #2C3E50; transition: all 0.2s ease;
    }
    .um-form-select:focus { outline: none; border-color: #7FFFD4; box-shadow: 0 0 0 3px rgba(127,255,212,0.15); }
    .um-form-select.is-invalid { border-color: #DC3545; }
    .um-pw-wrapper { position: relative; }
    .um-pw-wrapper .um-form-input { padding-right: 48px; }
    .um-pw-toggle {
        position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
        background: none; border: none; cursor: pointer; color: #6C757D;
        padding: 4px; display: flex; align-items: center;
    }
    .um-pw-toggle:hover { color: #003366; }
    .um-form-help { font-size: 13px; color: #6C757D; margin-top: 6px; }
    .um-form-error { font-size: 13px; color: #DC3545; margin-top: 6px; }
    .um-radio-group { display: flex; gap: 24px; }
    .um-radio-option { display: flex; align-items: center; cursor: pointer; }
    .um-radio-option input[type="radio"] { width: 20px; height: 20px; margin-right: 8px; cursor: pointer; accent-color: #7FFFD4; }
    .um-radio-option label { font-size: 15px; color: #2C3E50; cursor: pointer; }
    .um-form-actions {
        display: flex; justify-content: flex-end; gap: 12px;
        padding: 20px 32px; border-top: 1px solid #DEE2E6; background: white;
        flex-shrink: 0;
    }
    .um-btn-cancel {
        padding: 12px 24px; font-size: 15px; font-weight: 600; background: #F8F9FA;
        color: #6C757D; border: 2px solid #DEE2E6; border-radius: 8px;
        cursor: pointer; transition: all 0.3s ease;
    }
    .um-btn-cancel:hover { background: #E9ECEF; border-color: #CED4DA; }
    .um-btn-save {
        padding: 12px 24px; font-size: 15px; font-weight: 600; background: #7FFFD4;
        color: #003366; border: none; border-radius: 8px; cursor: pointer;
        transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;
    }
    .um-btn-save:hover { background: #6EEFC4; box-shadow: 0 4px 12px rgba(127,255,212,0.4); transform: translateY(-2px); }
    .um-btn-save:active { transform: translateY(0); }
    .um-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
    .um-delete-modal .modal-content { border: none; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .um-empty { text-align: center; padding: 48px 24px; color: #6C757D; }
    .um-empty i { width: 48px; height: 48px; color: #ADB5BD; margin-bottom: 12px; }
    .um-empty p { font-size: 15px; margin: 0; }
</style>

<div class="module-page" data-user-role="<?php echo e(auth()->user()->role ?? 'user'); ?>" style="background:#F8F9FA;min-height:100vh;padding:24px">
    <div class="um-page-header">
        <div>
            <h1><i data-lucide="users" style="width:28px;height:28px"></i> User Management</h1>
            <p>Manage all system users</p>
        </div>
        <button class="um-btn-add" id="btnCreateUser" data-require-permission="user-management.create"><i data-lucide="user-plus" style="width:16px;height:16px"></i> Add User</button>
    </div>

    <div class="um-stats-row" id="userStats">
        <div class="um-stat-card">
            <div class="um-stat-value" id="statTotalUsers">0</div>
            <div class="um-stat-label">Total</div>
        </div>
        <div class="um-stat-card">
            <div class="um-stat-value" id="statAdmins" style="color:#003366">0</div>
            <div class="um-stat-label">Admins</div>
        </div>
        <div class="um-stat-card">
            <div class="um-stat-value" id="statUsers" style="color:#003366">0</div>
            <div class="um-stat-label">Users</div>
        </div>
    </div>

    
    <div class="opd-toolbar">
        <div class="opd-search-wrap">
            <svg class="opd-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" class="opd-search-input" id="userSearch" placeholder="Search by name or email...">
        </div>
        <div class="opd-toolbar-right">
            <button class="opd-tool-btn opd-tool-btn--icon" id="btnUmFilter" onclick="toggleUmFilter(event)" title="Filter">
                <i data-lucide="filter"></i>
                <span class="opd-filter-badge" id="umFilterBadge" style="display:none">0</span>
            </button>
            <div class="opd-rows-wrap">
                <button class="opd-tool-btn opd-tool-btn--icon" id="umRowsBtn" onclick="toggleUmRowsMenu(event)" title="Rows per page">
                    <i data-lucide="layout-list"></i>
                </button>
                <div class="opd-rows-menu" id="umRowsMenu">
                    <div class="opd-rows-head">Rows per page</div>
                    <button onclick="setUmRowsPer(10)">10 rows</button>
                    <button onclick="setUmRowsPer(25)">25 rows</button>
                    <button onclick="setUmRowsPer(50)">50 rows</button>
                    <button onclick="setUmRowsPer(100)">100 rows</button>
                </div>
            </div>
            <div class="opd-col-vis-wrap">
                <button class="opd-tool-btn opd-tool-btn--icon" title="Column Visibility" onclick="toggleUmColVis(event)">
                    <i data-lucide="columns-3"></i>
                </button>
                <div class="opd-col-vis-menu" id="umColVisMenu">
                    <div class="opd-col-vis-head">
                        <span>Column Visibility</span>
                        <button class="opd-col-vis-selall" onclick="umColVisSelectAll()">Select All</button>
                    </div>
                    <div class="opd-col-vis-list" id="umColVisList">
                        <label><input type="checkbox" checked data-col="0"> Name</label>
                        <label><input type="checkbox" checked data-col="1"> Email</label>
                        <label><input type="checkbox" checked data-col="2"> Role</label>
                        <label><input type="checkbox" checked data-col="3"> Status</label>
                    </div>
                    <div class="opd-col-vis-foot">
                        <button class="opd-col-vis-save" onclick="applyUmColVis()">Save</button>
                    </div>
                </div>
            </div>
            <div class="opd-export-wrap">
                <button class="opd-tool-btn" onclick="toggleUmExportMenu(event)" title="Export" style="padding:0 10px">
                    <i data-lucide="upload"></i>
                    <i data-lucide="chevron-down" style="width:13px;height:13px;margin-left:2px"></i>
                </button>
                <div class="opd-export-menu" id="umExportMenu">
                    <button onclick="exportUm('csv')"><i data-lucide="file-spreadsheet"></i> CSV</button>
                    <button onclick="exportUm('print')"><i data-lucide="printer"></i> Print</button>
                </div>
            </div>
        </div>
    </div>

    
    <div class="opd-filter-pane" id="umFilterPane" style="display:none">
        <div class="opd-filter-pane-head">
            <span style="font-size:13px;font-weight:700;color:var(--color-foreground)">Filter Users</span>
            <button class="opd-filter-close" onclick="toggleUmFilter(event)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="opd-filter-pane-body" style="grid-template-columns:repeat(2,1fr)">
            <div class="opd-filter-field">
                <label class="opd-filter-label">Role</label>
                <div class="opd-cs-wrap" id="umCsRole" data-target="umRoleFilter" data-placeholder="All Roles"></div>
                <input type="hidden" id="umRoleFilter">
            </div>
            <div class="opd-filter-field">
                <label class="opd-filter-label">Status</label>
                <div class="opd-cs-wrap" id="umCsStatus" data-target="umStatusFilter" data-placeholder="All Status"></div>
                <input type="hidden" id="umStatusFilter">
            </div>
        </div>
        <div class="opd-filter-pane-foot">
            <button class="opd-filter-reset" onclick="resetUmFilters()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.86"/></svg>
                Reset
            </button>
            <button class="opd-filter-apply" onclick="applyUmFilters()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                Apply Filters
            </button>
        </div>
    </div>

    <div class="data-table-wrapper">
        <div style="overflow-x:auto">
            <table class="um-table" id="usersTable">
                <thead>
                    <tr>
                        <th data-col="0">Name</th>
                        <th data-col="1">Email</th>
                        <th data-col="2">Role</th>
                        <th data-col="3">Status</th>
                        <th style="width:60px"></th>
                    </tr>
                </thead>
                <tbody id="usersTableBody">
                    <tr><td colspan="5"><div class="um-empty"><i data-lucide="users"></i><p>Loading users...</p></div></td></tr>
                </tbody>
            </table>
        </div>
        <div class="opd-pagination" id="umPagination">
            <span class="opd-page-info" id="umTableInfo">Showing 0–0 of 0 records</span>
            <div class="opd-page-btns">
                <button class="opd-page-btn" id="umPrevPage" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div class="opd-page-nums" id="umPageNums"></div>
                <button class="opd-page-btn" id="umNextPage" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
            </div>
        </div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="userFormSheet" style="width:500px;border:none;display:flex;flex-direction:column;height:100%">
    <div class="um-offcanvas-header">
        <div>
            <h5 id="userFormTitle">Create New User</h5>
            <p id="userFormSubtitle">Add a new user to the system</p>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="um-form-body">
        <div class="um-form-card">
            <form id="userForm" novalidate>
                <input type="hidden" id="userId" value="">

                <div class="um-form-group">
                    <label class="um-form-label" for="userName">Full Name <span class="required">*</span></label>
                    <input type="text" class="um-form-input" id="userName" name="name" required placeholder="Enter full name">
                    <div class="um-form-error" id="nameError" style="display:none"></div>
                </div>

                <div class="um-form-group">
                    <label class="um-form-label" for="userEmail">Email Address <span class="required">*</span></label>
                    <input type="email" class="um-form-input" id="userEmail" name="email" required placeholder="user@example.com">
                    <div class="um-form-error" id="emailError" style="display:none"></div>
                </div>

                <div class="um-form-group">
                    <label class="um-form-label" for="userPassword" id="passwordLabel">Password <span class="required">*</span></label>
                    <div class="um-pw-wrapper">
                        <input type="password" class="um-form-input" id="userPassword" name="password" placeholder="Enter password">
                        <button type="button" class="um-pw-toggle" onclick="togglePw('userPassword', this)">
                            <i data-lucide="eye" style="width:18px;height:18px"></i>
                        </button>
                    </div>
                    <div class="um-form-help" id="passwordHelp">Minimum 8 characters</div>
                    <div class="um-form-error" id="passwordError" style="display:none"></div>
                </div>

                <div class="um-form-group">
                    <label class="um-form-label" for="userPasswordConfirm" id="passwordConfirmLabel">Confirm Password <span class="required">*</span></label>
                    <div class="um-pw-wrapper">
                        <input type="password" class="um-form-input" id="userPasswordConfirm" name="password_confirmation" placeholder="Re-enter password">
                        <button type="button" class="um-pw-toggle" onclick="togglePw('userPasswordConfirm', this)">
                            <i data-lucide="eye" style="width:18px;height:18px"></i>
                        </button>
                    </div>
                    <div class="um-form-error" id="passwordConfirmError" style="display:none"></div>
                </div>

                <div class="um-form-group">
                    <label class="um-form-label" for="userRole">User Role <span class="required">*</span></label>
                    <select class="um-form-select" id="userRole" name="role" required></select>
                    <div class="um-form-error" id="roleError" style="display:none"></div>
                </div>

                <div class="um-form-group" style="margin-bottom:0">
                    <label class="um-form-label">Status</label>
                    <div class="um-radio-group">
                        <div class="um-radio-option">
                            <input type="radio" id="statusActive" name="is_active" value="1" checked>
                            <label for="statusActive">Active</label>
                        </div>
                        <div class="um-radio-option">
                            <input type="radio" id="statusInactive" name="is_active" value="0">
                            <label for="statusInactive">Inactive</label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div class="um-form-actions">
        <button class="um-btn-cancel" data-bs-dismiss="offcanvas">Cancel</button>
        <button class="um-btn-save" id="btnSaveUser"><i data-lucide="check" style="width:16px;height:16px"></i> <span id="btnSaveLabel">Create User</span></button>
    </div>
</div>

<div class="modal fade um-delete-modal" id="deleteUserModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-body" style="padding:32px;text-align:center">
                <div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
                    <i data-lucide="alert-triangle" style="width:28px;height:28px;color:#DC3545"></i>
                </div>
                <h5 style="font-size:18px;font-weight:600;color:#2C3E50;margin-bottom:8px">Delete User</h5>
                <p style="font-size:14px;color:#6C757D;margin-bottom:24px">Are you sure you want to delete <strong id="deleteUserName"></strong>? This action cannot be undone.</p>
                <div style="display:flex;justify-content:center;gap:12px">
                    <button type="button" class="um-btn-cancel" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" id="btnConfirmDelete" style="padding:12px 24px;font-size:15px;font-weight:600;background:#DC3545;color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s ease">Delete</button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function togglePw(inputId, btn) {
    var inp = document.getElementById(inputId);
    inp.type = inp.type === 'password' ? 'text' : 'password';
}
</script>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('styles'); ?>
<style>
.opd-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap}
.opd-search-wrap{position:relative;flex:1;min-width:200px}
.opd-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--color-muted-foreground);pointer-events:none}
.opd-search-input{width:100%;height:40px;padding:0 14px 0 40px;border:1px solid var(--color-border);border-radius:10px;background:#fff!important;font-size:13.5px;color:var(--color-foreground);outline:none;transition:border-color .15s,box-shadow .15s}
.opd-search-input::placeholder{color:var(--color-muted-foreground)}
.opd-search-input:focus{border-color:#060740;box-shadow:0 0 0 3px rgba(6,7,64,.08)}
.opd-toolbar-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.opd-tool-btn{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 16px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-card);font-size:13.5px;font-weight:600;color:var(--color-foreground);cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,box-shadow .15s}
.opd-tool-btn svg,.opd-tool-btn i{width:15px;height:15px;color:var(--color-muted-foreground)}
.opd-tool-btn--icon{width:40px;padding:0;justify-content:center;gap:0}
.opd-tool-btn:hover{background:var(--color-muted);border-color:#060740;box-shadow:0 2px 6px rgba(6,7,64,.08)}
.opd-tool-btn.active{background:rgba(6,7,64,.06);border-color:#060740}
.opd-filter-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:20px;background:#060740;color:#7FFFD4;font-size:10px;font-weight:800;line-height:1;margin-left:2px}
.opd-export-wrap{position:relative}
.opd-export-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:200;min-width:180px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px}
.opd-export-menu.open{display:block}
.opd-export-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:none;font-size:13.5px;font-weight:500;color:var(--color-foreground);cursor:pointer;border-radius:7px;text-align:left;transition:background .12s}
.opd-export-menu button:hover{background:var(--color-muted)}
.opd-export-menu button i{width:15px;height:15px;color:var(--color-muted-foreground);flex-shrink:0}
.opd-rows-wrap{position:relative}
.opd-rows-menu{display:none;position:absolute;left:0;top:calc(100% + 6px);z-index:200;min-width:140px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px}
.opd-rows-menu.open{display:block}
.opd-rows-head{padding:8px 10px 6px;font-size:11px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--color-border);margin-bottom:4px}
.opd-rows-menu button{display:flex;align-items:center;width:100%;padding:8px 10px;border:none;background:none;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer;border-radius:7px;text-align:left;transition:background .1s}
.opd-rows-menu button:hover{background:var(--color-muted)}
.opd-col-vis-wrap{position:relative}
.opd-col-vis-menu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:200;width:220px;background:var(--color-card);border:1px solid var(--color-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);overflow:hidden}
.opd-col-vis-menu.open{display:block}
.opd-col-vis-head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px 10px;border-bottom:1px solid var(--color-border);font-size:13px;font-weight:700;color:var(--color-foreground)}
.opd-col-vis-selall{font-size:11.5px;font-weight:500;color:#060740;background:none;border:none;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px}
.opd-col-vis-list{padding:8px 6px;max-height:280px;overflow-y:auto}
.opd-col-vis-list label{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:6px;font-size:13px;font-weight:500;color:var(--color-foreground);cursor:pointer;transition:background .1s}
.opd-col-vis-list label:hover{background:var(--color-muted)}
.opd-col-vis-list input[type="checkbox"]{width:15px;height:15px;accent-color:#060740;cursor:pointer;flex-shrink:0}
.opd-col-vis-foot{padding:10px 14px;border-top:1px solid var(--color-border);display:flex;justify-content:flex-end}
.opd-col-vis-save{height:32px;padding:0 18px;background:#060740;color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s}
.opd-col-vis-save:hover{opacity:.88}
.opd-filter-pane{background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.opd-filter-pane-head{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--color-border);background:rgba(6,7,64,.02);border-radius:12px 12px 0 0}
.opd-filter-close{width:28px;height:28px;border-radius:7px;border:1px solid var(--color-border);background:var(--color-card);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.opd-filter-close:hover{background:var(--color-muted)}
.opd-filter-close svg{width:14px;height:14px}
.opd-filter-pane-body{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:16px 18px}
@media(max-width:900px){.opd-filter-pane-body{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.opd-filter-pane-body{grid-template-columns:1fr}}
.opd-filter-field{display:flex;flex-direction:column;gap:5px}
.opd-filter-label{font-size:11.5px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:.04em}
.opd-filter-pane-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--color-border);background:rgba(6,7,64,.02)}
.opd-filter-reset{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-card);font-size:13px;font-weight:600;color:var(--color-muted-foreground);cursor:pointer;transition:all .15s}
.opd-filter-reset:hover{background:var(--color-muted);color:var(--color-foreground)}
.opd-filter-reset svg{width:13px;height:13px}
.opd-filter-apply{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 20px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .15s}
.opd-filter-apply:hover{opacity:.88}
.opd-filter-apply svg{width:13px;height:13px}
.opd-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-top:1px solid var(--color-border);flex-wrap:wrap;gap:10px}
.opd-page-info{font-size:12.5px;color:var(--color-muted-foreground);font-weight:500}
.opd-page-btns{display:flex;align-items:center;gap:4px}
.opd-page-btn{width:34px;height:34px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;color:var(--color-foreground)}
.opd-page-btn svg{width:15px;height:15px}
.opd-page-btn:hover:not(:disabled){background:var(--color-muted);border-color:#060740}
.opd-page-btn:disabled{opacity:.4;cursor:not-allowed}
.opd-page-nums{display:flex;align-items:center;gap:4px}
.opd-page-num{min-width:34px;height:34px;padding:0 8px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);font-size:13px;font-weight:600;color:var(--color-foreground);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.opd-page-num:hover{background:var(--color-muted)}
.opd-page-num.active{background:#060740;color:#7FFFD4;border-color:#060740}
.data-table-wrapper{background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;overflow:hidden}
.data-table-wrapper .opd-pagination{border-top:1px solid var(--color-border);padding:12px 16px;background:var(--color-card)}
.opd-cs-wrap{position:relative}
.opd-cs-trigger{display:flex;align-items:center;justify-content:space-between;height:38px;padding:0 12px;border:1px solid #e2e6ea!important;border-radius:8px;background:#ffffff!important;font-size:13.5px;color:#111827!important;cursor:pointer;gap:8px;user-select:none;transition:border-color .15s,box-shadow .15s}
.opd-cs-trigger:hover{border-color:#9496b8!important}
.opd-cs-trigger.open{border-color:#060740!important;box-shadow:0 0 0 3px rgba(6,7,64,.07)}
.opd-cs-trigger.open>i{transform:rotate(180deg)}
.opd-cs-trigger>i{transition:transform .2s}
.opd-cs-val{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#111827;font-size:13.5px}
.opd-cs-val.opd-ph{color:#374151!important}
.opd-cs-popup{display:none;position:fixed;z-index:9999;background:#fff;border:1px solid #e2e6ea;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,0.13);overflow:hidden}
.opd-cs-popup.open{display:block}
.opd-cs-search{width:100%;padding:9px 14px;border:none;border-bottom:1px solid var(--color-border);font-size:13px;outline:none;background:#fff;color:var(--color-foreground)}
.opd-cs-list{max-height:200px;overflow-y:auto}
.opd-cs-option{padding:10px 14px;font-size:13.5px;cursor:pointer;color:var(--color-foreground);border-bottom:1px solid rgba(0,0,0,0.04)}
.opd-cs-option:hover{background:var(--color-muted)}
.opd-cs-option.selected{background:#EFF6FF;color:#1D4ED8;font-weight:500}
.opd-cs-option:last-child{border-bottom:none}
.opd-cs-empty{padding:12px 14px;font-size:13px;color:var(--color-muted-foreground);text-align:center}
</style>
<?php $__env->stopPush(); ?>

<?php $__env->startPush('scripts'); ?>
<script src="<?php echo e(asset('js/users.js')); ?>?v=<?php echo e(filemtime(public_path('js/users.js'))); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\healthops\resources\views/pages/users.blade.php ENDPATH**/ ?>