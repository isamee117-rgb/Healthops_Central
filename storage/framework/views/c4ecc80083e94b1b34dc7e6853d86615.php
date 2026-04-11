<?php $__env->startSection('content'); ?>
<style>
    .rm-stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
    }
    .rm-stat-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    .rm-stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #003366;
        margin-bottom: 8px;
    }
    .rm-stat-label {
        font-size: 14px;
        color: #6C757D;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .rm-table-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
    .rm-table-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid #DEE2E6;
        gap: 12px;
        flex-wrap: wrap;
    }
    .rm-search-input {
        padding: 10px 16px 10px 40px;
        font-size: 14px;
        border: 2px solid #DEE2E6;
        border-radius: 6px;
        width: 280px;
        transition: all 0.2s ease;
        font-family: inherit;
    }
    .rm-search-input:focus {
        outline: none;
        border-color: #7FFFD4;
        box-shadow: 0 0 0 3px rgba(127, 255, 212, 0.15);
    }
    .rm-search-wrapper {
        position: relative;
    }
    .rm-search-wrapper i {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #6C757D;
        pointer-events: none;
    }
    .rm-filter-select {
        padding: 10px 16px;
        font-size: 14px;
        border: 2px solid #DEE2E6;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        font-family: inherit;
        min-width: 140px;
        transition: all 0.2s ease;
    }
    .rm-filter-select:focus {
        outline: none;
        border-color: #7FFFD4;
        box-shadow: 0 0 0 3px rgba(127, 255, 212, 0.15);
    }
    .rm-table {
        width: 100%;
        border-collapse: collapse;
    }
    .rm-table thead {
        background: #F8F9FA;
    }
    .rm-table th {
        padding: 16px 24px;
        text-align: left;
        font-size: 13px;
        font-weight: 600;
        color: #6C757D;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #DEE2E6;
    }
    .rm-table td {
        padding: 16px 24px;
        border-bottom: 1px solid #F1F3F5;
        font-size: 15px;
        color: #2C3E50;
    }
    .rm-table tbody tr:hover {
        background: #F8FFFE;
    }
    .rm-table .rm-name {
        font-weight: 600;
        color: #2C3E50;
    }
    .rm-table .rm-slug {
        color: #6C757D;
        font-size: 13px;
        font-family: monospace;
    }
    .rm-table .rm-desc {
        color: #6C757D;
        font-size: 14px;
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .rm-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .rm-badge-system {
        background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
        color: white;
    }
    .rm-badge-custom {
        background: #7FFFD4;
        color: #003366;
    }
    .rm-badge-active {
        background: #D1FAE5;
        color: #059669;
    }
    .rm-badge-inactive {
        background: #FEE2E2;
        color: #DC2626;
    }
    .rm-count-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        background: #F0F4FF;
        color: #003366;
    }
    .rm-action-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 8px;
        color: #6C757D;
        border-radius: 6px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .rm-action-btn:hover {
        color: #003366;
        background: #F8F9FA;
    }
    .rm-action-dropdown {
        position: absolute;
        right: 0;
        top: 100%;
        background: white;
        border: 1px solid #DEE2E6;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 180px;
        z-index: 10;
        display: none;
    }
    .rm-action-dropdown.show {
        display: block;
    }
    .rm-action-item {
        padding: 12px 16px;
        cursor: pointer;
        font-size: 14px;
        color: #2C3E50;
        border-bottom: 1px solid #F1F3F5;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.15s;
    }
    .rm-action-item:last-child {
        border-bottom: none;
    }
    .rm-action-item:hover {
        background: #F8F9FA;
    }
    .rm-action-item.danger {
        color: #DC3545;
    }
    .rm-action-item.danger:hover {
        background: #FEE2E2;
    }
    .rm-table-footer {
        padding: 16px 24px;
        font-size: 14px;
        color: #6C757D;
        border-top: 1px solid #F1F3F5;
    }
    .rm-page-header {
        background: white;
        padding: 24px 32px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .rm-page-header h1 {
        font-size: 28px;
        font-weight: 600;
        color: #003366;
        margin: 0 0 4px 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .rm-page-header p {
        font-size: 14px;
        color: #6C757D;
        margin: 0;
    }
    .rm-btn-add {
        padding: 12px 24px;
        font-size: 15px;
        font-weight: 600;
        background: #7FFFD4;
        color: #003366;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .rm-btn-add:hover {
        background: #6EEFC4;
        box-shadow: 0 4px 12px rgba(127, 255, 212, 0.4);
        transform: translateY(-2px);
    }
    .rm-btn-add:active {
        transform: translateY(0);
    }
    .rm-offcanvas-header {
        background: #003366;
        color: white;
        padding: 24px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
    }
    .rm-offcanvas-header h5 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 4px 0;
    }
    .rm-offcanvas-header p {
        font-size: 14px;
        margin: 0;
        opacity: 0.7;
    }
    .rm-form-body {
        padding: 32px;
        background: #F8F9FA;
        flex: 1 1 0;
        overflow-y: auto;
        min-height: 0;
    }
    .rm-form-card {
        background: white;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .rm-form-group {
        margin-bottom: 24px;
    }
    .rm-form-label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #2C3E50;
        margin-bottom: 8px;
    }
    .rm-form-label .required {
        color: #DC3545;
    }
    .rm-form-input {
        width: 100%;
        padding: 12px 16px;
        font-size: 15px;
        border: 2px solid #DEE2E6;
        border-radius: 6px;
        transition: all 0.2s ease;
        background: white;
        font-family: inherit;
        color: #2C3E50;
    }
    .rm-form-input:focus {
        outline: none;
        border-color: #7FFFD4;
        box-shadow: 0 0 0 3px rgba(127, 255, 212, 0.15);
    }
    .rm-form-input.is-invalid {
        border-color: #DC3545;
    }
    .rm-form-input::placeholder {
        color: #ADB5BD;
    }
    .rm-form-textarea {
        width: 100%;
        padding: 12px 16px;
        font-size: 15px;
        border: 2px solid #DEE2E6;
        border-radius: 6px;
        transition: all 0.2s ease;
        background: white;
        font-family: inherit;
        color: #2C3E50;
        resize: vertical;
        min-height: 80px;
    }
    .rm-form-textarea:focus {
        outline: none;
        border-color: #7FFFD4;
        box-shadow: 0 0 0 3px rgba(127, 255, 212, 0.15);
    }
    .rm-form-error {
        font-size: 13px;
        color: #DC3545;
        margin-top: 6px;
    }
    .rm-form-help {
        font-size: 13px;
        color: #6C757D;
        margin-top: 6px;
    }
    .rm-radio-group {
        display: flex;
        gap: 24px;
    }
    .rm-radio-option {
        display: flex;
        align-items: center;
        cursor: pointer;
    }
    .rm-radio-option input[type="radio"] {
        width: 20px;
        height: 20px;
        margin-right: 8px;
        cursor: pointer;
        accent-color: #7FFFD4;
    }
    .rm-radio-option label {
        font-size: 15px;
        color: #2C3E50;
        cursor: pointer;
    }
    .rm-form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 32px;
        border-top: 1px solid #DEE2E6;
        background: white;
        flex-shrink: 0;
    }
    .rm-btn-cancel {
        padding: 12px 24px;
        font-size: 15px;
        font-weight: 600;
        background: #F8F9FA;
        color: #6C757D;
        border: 2px solid #DEE2E6;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .rm-btn-cancel:hover {
        background: #E9ECEF;
        border-color: #CED4DA;
    }
    .rm-btn-save {
        padding: 12px 24px;
        font-size: 15px;
        font-weight: 600;
        background: #7FFFD4;
        color: #003366;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .rm-btn-save:hover {
        background: #6EEFC4;
        box-shadow: 0 4px 12px rgba(127, 255, 212, 0.4);
        transform: translateY(-2px);
    }
    .rm-btn-save:active {
        transform: translateY(0);
    }
    .rm-btn-save:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
    .rm-empty {
        text-align: center;
        padding: 48px 24px;
        color: #6C757D;
    }
    .rm-empty i {
        width: 48px;
        height: 48px;
        color: #ADB5BD;
        margin-bottom: 12px;
    }
    .rm-empty p {
        font-size: 15px;
        margin: 0;
    }
    .rm-delete-modal .modal-content {
        border: none;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    /* ── Two-panel permissions layout ───────────────────────────────── */
    .perm-body {
        display: flex;
        flex: 1 1 0;
        overflow: hidden;
        min-height: 0;
    }
    .perm-toolbar {
        padding: 12px 20px;
        background: white;
        border-bottom: 1px solid #DEE2E6;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        flex-shrink: 0;
    }
    .perm-search {
        padding: 7px 12px 7px 34px;
        font-size: 13px;
        border: 2px solid #DEE2E6;
        border-radius: 6px;
        width: 200px;
        font-family: inherit;
        transition: all 0.2s ease;
    }
    .perm-search:focus {
        outline: none;
        border-color: #7FFFD4;
        box-shadow: 0 0 0 3px rgba(127, 255, 212, 0.15);
    }
    .perm-search-wrap {
        position: relative;
    }
    .perm-search-wrap i {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #6C757D;
        pointer-events: none;
    }
    .perm-bulk-btn {
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        border: 1.5px solid #DEE2E6;
        border-radius: 6px;
        background: white;
        color: #2C3E50;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .perm-bulk-btn:hover:not(:disabled) {
        border-color: #7FFFD4;
        background: #F0FFF8;
    }
    .perm-bulk-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .perm-progress {
        margin-left: auto;
        font-size: 12px;
        font-weight: 600;
        color: #003366;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .perm-progress-bar {
        width: 100px;
        height: 5px;
        background: #E5E7EB;
        border-radius: 3px;
        overflow: hidden;
    }
    .perm-progress-fill {
        height: 100%;
        background: #7FFFD4;
        border-radius: 3px;
        transition: width 0.3s ease;
    }

    /* Left panel – module list */
    .perm-module-list {
        width: 230px;
        min-width: 230px;
        border-right: 1px solid #E9ECEF;
        background: #F8F9FA;
        overflow-y: auto;
        padding: 8px 0;
    }
    .perm-mod-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 14px;
        cursor: pointer;
        transition: all 0.15s;
        border-left: 3px solid transparent;
        user-select: none;
    }
    .perm-mod-item:hover {
        background: rgba(127,255,212,0.1);
    }
    .perm-mod-item.active {
        background: white;
        border-left-color: #7FFFD4;
        box-shadow: inset -1px 0 0 #E9ECEF;
    }
    .perm-mod-icon {
        width: 28px;
        height: 28px;
        border-radius: 7px;
        background: #EEF2FF;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .perm-mod-icon i {
        width: 14px;
        height: 14px;
        color: #003366;
    }
    .perm-mod-info {
        flex: 1;
        min-width: 0;
    }
    .perm-mod-name {
        font-size: 12.5px;
        font-weight: 600;
        color: #2C3E50;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-transform: capitalize;
    }
    .perm-mod-pill {
        font-size: 10.5px;
        font-weight: 700;
        background: #E9ECEF;
        color: #6C757D;
        border-radius: 20px;
        padding: 2px 7px;
        white-space: nowrap;
        flex-shrink: 0;
    }
    .perm-mod-pill.has-perms {
        background: #D1FAE5;
        color: #065F46;
    }

    /* Right panel – detail */
    .perm-detail-panel {
        flex: 1;
        overflow-y: auto;
        background: white;
    }
    .perm-detail-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 40px;
        text-align: center;
    }
    .perm-detail-header {
        padding: 14px 20px;
        border-bottom: 1px solid #F0F0F0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        background: white;
        z-index: 1;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .perm-detail-title {
        font-size: 14px;
        font-weight: 700;
        color: #2C3E50;
        text-transform: capitalize;
    }
    .perm-detail-subtitle {
        font-size: 11px;
        color: #6C757D;
        margin-top: 2px;
    }
    .perm-detail-actions { display: flex; gap: 8px; }
    .perm-detail-action-btn {
        padding: 5px 11px;
        font-size: 11.5px;
        font-weight: 600;
        border: 1.5px solid #DEE2E6;
        border-radius: 6px;
        background: white;
        color: #6C757D;
        cursor: pointer;
        transition: all 0.15s;
    }
    .perm-detail-action-btn:hover {
        border-color: #7FFFD4;
        color: #003366;
        background: #F0FFF8;
    }
    .perm-detail-body { padding: 14px 18px 20px; }

    /* Sub-module header */
    .perm-submod-header {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: #9CA3AF;
        padding: 12px 0 6px;
        border-bottom: 1px solid #F3F4F6;
        margin-bottom: 8px;
        margin-top: 4px;
    }

    /* Section title */
    .perm-section-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #9CA3AF;
        margin: 12px 0 6px;
    }
    .perm-section-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #F3F4F6;
    }

    /* Toggle items */
    .perm-toggle-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 12px;
        border-radius: 8px;
        margin-bottom: 5px;
        border: 1.5px solid #F3F4F6;
        transition: all 0.15s;
        cursor: pointer;
        background: #FAFAFA;
    }
    .perm-toggle-item:hover {
        border-color: #C7F0E0;
        background: #FAFFFE;
    }
    .perm-toggle-item.is-checked {
        border-color: #7FFFD4;
        background: #F0FFF8;
    }
    .perm-toggle-item.is-dangerous { border-color: #FEE2E2; background: #FFF9F9; }
    .perm-toggle-item.is-dangerous.is-checked { border-color: #FECACA; background: #FFF5F5; }
    .perm-toggle-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .perm-toggle-icon {
        width: 26px; height: 26px; border-radius: 6px;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        background: #EEF2FF;
    }
    .perm-toggle-icon i { width: 12px; height: 12px; color: #003366; }
    .perm-toggle-icon.danger-icon { background: #FEE2E2; }
    .perm-toggle-icon.danger-icon i { color: #DC3545; }
    .perm-toggle-text { min-width: 0; }
    .perm-toggle-name { font-size: 13px; font-weight: 600; color: #2C3E50; }
    .perm-toggle-slug { font-size: 10.5px; color: #9CA3AF; font-family: monospace; }

    /* Toggle switch */
    .perm-switch {
        position: relative; display: inline-block;
        width: 36px; height: 20px; flex-shrink: 0;
    }
    .perm-switch input { opacity: 0; width: 0; height: 0; }
    .perm-switch-track {
        position: absolute; cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background: #CED4DA; border-radius: 20px; transition: 0.2s;
    }
    .perm-switch-track:before {
        position: absolute; content: "";
        height: 14px; width: 14px;
        left: 3px; bottom: 3px;
        background: white; border-radius: 50%; transition: 0.2s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    input:checked + .perm-switch-track { background: #7FFFD4; }
    input:checked + .perm-switch-track:before { transform: translateX(16px); }
    .perm-switch-disabled .perm-switch-track { cursor: not-allowed; opacity: 0.6; }

    .perm-sub-module { margin-bottom: 8px; }
    .perm-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 32px;
        border-top: 1px solid #DEE2E6;
        background: white;
        flex-shrink: 0;
    }
</style>

<div class="module-page" data-user-role="<?php echo e(auth()->user()->role ?? 'user'); ?>" style="background:#F8F9FA;min-height:100vh;padding:24px">
    <div class="rm-page-header">
        <div>
            <h1><i data-lucide="shield" style="width:28px;height:28px"></i> Role Management</h1>
            <p>Manage roles and permissions</p>
        </div>
        <button class="rm-btn-add" id="btnCreateRole" data-require-permission="role-management.create"><i data-lucide="plus" style="width:18px;height:18px"></i> Add Role</button>
    </div>

    <div class="rm-stats-row" id="roleStats">
        <div class="rm-stat-card">
            <div class="rm-stat-value" id="statTotalRoles">0</div>
            <div class="rm-stat-label">Total Roles</div>
        </div>
        <div class="rm-stat-card">
            <div class="rm-stat-value" id="statSystemRoles" style="color:#764BA2">0</div>
            <div class="rm-stat-label">System Roles</div>
        </div>
        <div class="rm-stat-card">
            <div class="rm-stat-value" id="statCustomRoles" style="color:#003366">0</div>
            <div class="rm-stat-label">Custom Roles</div>
        </div>
        <div class="rm-stat-card">
            <div class="rm-stat-value" id="statTotalPerms" style="color:#059669">0</div>
            <div class="rm-stat-label">Permissions</div>
        </div>
    </div>

    <div class="rm-table-card">
        <div class="rm-table-toolbar">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <div class="rm-search-wrapper">
                    <i data-lucide="search" style="width:16px;height:16px"></i>
                    <input type="text" class="rm-search-input" id="roleSearch" placeholder="Search roles...">
                </div>
                <select class="rm-filter-select" id="filterType">
                    <option value="all">All Types</option>
                    <option value="system">System</option>
                    <option value="custom">Custom</option>
                </select>
                <select class="rm-filter-select" id="filterStatus">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>
        <table class="rm-table" id="rolesTable">
            <thead>
                <tr>
                    <th>Role</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Users</th>
                    <th>Permissions</th>
                    <th>Status</th>
                    <th style="width:60px"></th>
                </tr>
            </thead>
            <tbody id="rolesTableBody">
                <tr><td colspan="7"><div class="rm-empty"><i data-lucide="shield"></i><p>Loading roles...</p></div></td></tr>
            </tbody>
        </table>
        <div class="rm-table-footer" id="rolesTableFooter">
            <span id="rolesCount">Showing 0 roles</span>
        </div>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="roleFormSheet" style="width:500px;border:none;display:flex;flex-direction:column;height:100%">
    <div class="rm-offcanvas-header">
        <div>
            <h5 id="roleFormTitle">Create New Role</h5>
            <p id="roleFormSubtitle">Add a new role to the system</p>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="rm-form-body">
        <div class="rm-form-card">
            <form id="roleForm" novalidate>
                <input type="hidden" id="roleId" value="">

                <div class="rm-form-group">
                    <label class="rm-form-label" for="roleName">Role Name <span class="required">*</span></label>
                    <input type="text" class="rm-form-input" id="roleName" name="name" required placeholder="e.g. Lab Technician">
                    <div class="rm-form-error" id="nameError" style="display:none"></div>
                </div>

                <div class="rm-form-group">
                    <label class="rm-form-label" for="roleSlug">Slug <span class="required">*</span></label>
                    <input type="text" class="rm-form-input" id="roleSlug" name="slug" required placeholder="auto-generated" style="font-family:monospace;font-size:14px">
                    <div class="rm-form-help">Auto-generated from name. Must be unique.</div>
                    <div class="rm-form-error" id="slugError" style="display:none"></div>
                </div>

                <div class="rm-form-group">
                    <label class="rm-form-label" for="roleDescription">Description</label>
                    <textarea class="rm-form-textarea" id="roleDescription" name="description" placeholder="Brief description of this role"></textarea>
                    <div class="rm-form-error" id="descriptionError" style="display:none"></div>
                </div>

                <div class="rm-form-group">
                    <label class="rm-form-label">Type <span class="required">*</span></label>
                    <div class="rm-radio-group">
                        <div class="rm-radio-option">
                            <input type="radio" id="typeCustom" name="type" value="custom" checked>
                            <label for="typeCustom">Custom</label>
                        </div>
                        <div class="rm-radio-option">
                            <input type="radio" id="typeSystem" name="type" value="system">
                            <label for="typeSystem">System</label>
                        </div>
                    </div>
                </div>

                <div class="rm-form-group" style="margin-bottom:0">
                    <label class="rm-form-label">Status</label>
                    <div class="rm-radio-group">
                        <div class="rm-radio-option">
                            <input type="radio" id="roleStatusActive" name="is_active" value="1" checked>
                            <label for="roleStatusActive">Active</label>
                        </div>
                        <div class="rm-radio-option">
                            <input type="radio" id="roleStatusInactive" name="is_active" value="0">
                            <label for="roleStatusInactive">Inactive</label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div class="rm-form-actions">
        <button class="rm-btn-cancel" data-bs-dismiss="offcanvas">Cancel</button>
        <button class="rm-btn-save" id="btnSaveRole"><i data-lucide="check" style="width:16px;height:16px"></i> <span id="btnSaveLabel">Create Role</span></button>
    </div>
</div>

<div class="offcanvas offcanvas-end" tabindex="-1" id="permSheet" style="width:820px;border:none;display:flex;flex-direction:column;height:100%">
    <div class="rm-offcanvas-header">
        <div>
            <h5 id="permSheetTitle">Manage Permissions</h5>
            <p id="permSheetSubtitle">Assign permissions to role</p>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="perm-toolbar">
        <div class="perm-search-wrap">
            <i data-lucide="search" style="width:14px;height:14px"></i>
            <input type="text" class="perm-search" id="permSearch" placeholder="Search permissions...">
        </div>
        <button class="perm-bulk-btn" id="btnGrantAll">
            <i data-lucide="check-square" style="width:13px;height:13px"></i> Grant All
        </button>
        <button class="perm-bulk-btn" id="btnRevokeAll">
            <i data-lucide="square" style="width:13px;height:13px"></i> Revoke All
        </button>
        <div class="perm-progress">
            <div class="perm-progress-bar"><div class="perm-progress-fill" id="permProgressFill" style="width:0%"></div></div>
            <span id="permProgressText">0 / 0</span>
        </div>
    </div>
    <div class="perm-body" id="permBody">
        <div class="perm-module-list" id="permModuleList">
            <div style="padding:20px 16px;text-align:center;color:#9CA3AF;font-size:13px">Loading…</div>
        </div>
        <div class="perm-detail-panel" id="permDetailPanel">
            <div class="perm-detail-placeholder">
                <i data-lucide="key" style="width:40px;height:40px;color:#ADB5BD;margin-bottom:12px"></i>
                <p style="color:#6C757D;font-size:14px">Select a module from the left to manage permissions</p>
            </div>
        </div>
    </div>
    <div class="perm-actions">
        <button class="rm-btn-cancel" data-bs-dismiss="offcanvas">Cancel</button>
        <button class="rm-btn-save" id="btnSavePermissions"><i data-lucide="check" style="width:16px;height:16px"></i> Save Permissions</button>
    </div>
</div>

<div class="modal fade rm-delete-modal" id="deleteRoleModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-body" style="padding:32px;text-align:center">
                <div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
                    <i data-lucide="alert-triangle" style="width:28px;height:28px;color:#DC3545"></i>
                </div>
                <h5 style="font-size:18px;font-weight:600;color:#2C3E50;margin-bottom:8px">Delete Role</h5>
                <p style="font-size:14px;color:#6C757D;margin-bottom:24px">Are you sure you want to delete <strong id="deleteRoleName"></strong>? This action cannot be undone.</p>
                <div style="display:flex;justify-content:center;gap:12px">
                    <button type="button" class="rm-btn-cancel" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" id="btnConfirmDelete" style="padding:12px 24px;font-size:15px;font-weight:600;background:#DC3545;color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s ease">Delete</button>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade rm-delete-modal" id="duplicateRoleModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-body" style="padding:32px;text-align:center">
                <div style="width:56px;height:56px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
                    <i data-lucide="copy" style="width:28px;height:28px;color:#003366"></i>
                </div>
                <h5 style="font-size:18px;font-weight:600;color:#2C3E50;margin-bottom:8px">Duplicate Role</h5>
                <p style="font-size:14px;color:#6C757D;margin-bottom:16px">Enter a name for the new role:</p>
                <input type="text" class="rm-form-input" id="duplicateRoleName" placeholder="New role name" style="margin-bottom:24px;text-align:center">
                <div style="display:flex;justify-content:center;gap:12px">
                    <button type="button" class="rm-btn-cancel" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" id="btnConfirmDuplicate" style="padding:12px 24px;font-size:15px;font-weight:600;background:#7FFFD4;color:#003366;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s ease">Duplicate</button>
                </div>
            </div>
        </div>
    </div>
</div>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
<script src="<?php echo e(asset('js/roles.js')); ?>?v=<?php echo e(filemtime(public_path('js/roles.js'))); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\healthops\resources\views/pages/roles.blade.php ENDPATH**/ ?>