// ── HMS Permission Helper ─────────────────────────────────────────────────────
window.HMS = window.HMS || {};

/**
 * Check if the current user has a specific permission.
 * Supports exact slugs: HMS.can('patients.create')
 * Supports module wildcard: HMS.can('opd.*')  → true if any opd.* permission exists
 */
HMS.can = function(permission) {
    var u = window.HMS_USER;
    if (!u) return false;
    if (u.isSuperadmin) return true;
    var perms = u.permissions || [];
    if (perms.indexOf('*') !== -1) return true;

    // Wildcard check: 'opd.*'
    if (permission.slice(-2) === '.*') {
        var prefix = permission.slice(0, -2) + '.';
        return perms.some(function(p) { return p.indexOf(prefix) === 0; });
    }
    return perms.indexOf(permission) !== -1;
};

/**
 * Enforce tab and button visibility based on data-permission attributes.
 * Called automatically on DOM ready and re-exported for dynamic content.
 *
 * Usage in HTML:
 *   <button class="module-tab" data-tab="vitals" data-permission="opd.vitals.access">Vitals</button>
 *   <button id="btnAddPatient" data-require-permission="patients.create">Add Patient</button>
 */
HMS.enforcePermissions = function() {
    // Hide tabs the user cannot access
    $('[data-permission]').each(function() {
        var perm = $(this).data('permission');
        if (perm && !HMS.can(perm)) {
            $(this).hide();
            // If all tabs in a group are hidden, hide the group wrapper too
            var $group = $(this).closest('.module-tabs, .nav-tabs, [data-tab-group]');
            if ($group.length && $group.find('[data-permission]:visible').length === 0) {
                $group.hide();
            }
        }
    });

    // If the currently active tab was hidden, switch to the first visible one
    setTimeout(function() {
        $('.module-tabs, .nav-tabs').each(function() {
            var $tabs = $(this).find('.module-tab[data-permission]');
            if (!$tabs.length) return;
            var $active = $tabs.filter('.active');
            // Active tab is hidden or no active tab — activate first visible
            if (!$active.length || $active.is(':hidden')) {
                $active.removeClass('active');
                var $first = $tabs.filter(':visible').first();
                if ($first.length) $first.trigger('click');
            }
        });
    }, 0);

    // Hide action buttons the user cannot use
    $('[data-require-permission]').each(function() {
        var perm = $(this).data('require-permission');
        if (perm && !HMS.can(perm)) {
            $(this).hide();
        }
    });
};

// ── HMS Toast Notification System ──────────────────────────────────────────────
(function() {
    var containerId = 'hms-toast-container';
    function ensureContainer() {
        var c = document.getElementById(containerId);
        if (!c) {
            c = document.createElement('div');
            c.id = containerId;
            document.body.appendChild(c);
        }
        return c;
    }

    /**
     * Show a toast notification.
     * HMS.toast('Patient saved successfully', 'success')
     * HMS.toast('Failed to save record', 'error')
     * HMS.toast('Please fill required fields', 'warning')
     */
    HMS.toast = function(message, type, duration) {
        type = type || 'info';
        duration = duration || (type === 'error' ? 6000 : 4000);
        var container = ensureContainer();

        var icons = {
            success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        var el = document.createElement('div');
        el.className = 'hms-toast hms-toast-' + type;
        el.innerHTML = '<span class="hms-toast-icon">' + (icons[type] || icons.info) + '</span>' +
                        '<span class="hms-toast-msg">' + message + '</span>' +
                        '<button class="hms-toast-close">&times;</button>';
        container.appendChild(el);

        // Trigger animation
        setTimeout(function() { el.classList.add('hms-toast-show'); }, 10);

        // Close button
        el.querySelector('.hms-toast-close').onclick = function() { dismissToast(el); };

        // Auto-dismiss
        setTimeout(function() { dismissToast(el); }, duration);
    };

    function dismissToast(el) {
        if (el._dismissed) return;
        el._dismissed = true;
        el.classList.remove('hms-toast-show');
        el.classList.add('hms-toast-hide');
        setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }

    /**
     * Parse AJAX error response and show a user-friendly toast.
     * HMS.ajaxError(xhr, 'Failed to save doctor')
     */
    HMS.ajaxError = function(xhr, fallback) {
        var msg = fallback || 'Something went wrong';
        try {
            var json = xhr.responseJSON || JSON.parse(xhr.responseText);
            if (json.message && json.message.indexOf('SQLSTATE') === -1) {
                msg = json.message;
            } else if (json.error && json.error.indexOf('SQLSTATE') === -1) {
                msg = json.error;
            } else if (json.errors) {
                // Laravel validation errors
                var msgs = [];
                for (var field in json.errors) {
                    msgs.push(json.errors[field][0]);
                }
                msg = msgs.join('<br>');
            }
        } catch(e) {}

        if (xhr.status === 422) {
            HMS.toast(msg, 'warning');
        } else {
            HMS.toast(msg, 'error');
        }

        // Highlight invalid fields from Laravel validation response
        try {
            var json2 = xhr.responseJSON;
            if (json2 && json2.errors) {
                for (var fieldName in json2.errors) {
                    var $field = $('[name="' + fieldName + '"]');
                    if ($field.length) {
                        $field.addClass('is-invalid');
                        $field.one('input change', function() { $(this).removeClass('is-invalid'); });
                    }
                }
            }
        } catch(e2) {}
    };
})();

// Base URL for all AJAX and navigation (supports subdirectory installs)
window.HMS_BASE = ($('meta[name="base-url"]').attr('content') || '').replace(/\/+$/, '');

// Auto-prefix native fetch() calls with base URL
(function() {
    var _origFetch = window.fetch;
    window.fetch = function(url, opts) {
        if (typeof url === 'string' && url.charAt(0) === '/' && url.indexOf(HMS_BASE) !== 0) {
            url = HMS_BASE + url;
        }
        return _origFetch.call(this, url, opts);
    };
})();

$(document).ready(function() {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
            'Accept': 'application/json'
        }
    });

    // Auto-prefix absolute paths with base URL for all jQuery AJAX calls
    $.ajaxPrefilter(function(options) {
        if (options.url && options.url.charAt(0) === '/' && options.url.indexOf(HMS_BASE) !== 0) {
            options.url = HMS_BASE + options.url;
        }
    });

    lucide.createIcons();

    // Enforce tab/button visibility based on permissions after icons are loaded
    HMS.enforcePermissions();

    var sidebar = $('#sidebar');
    $('#sidebarToggle').on('click', function() {
        sidebar.toggleClass('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.hasClass('collapsed'));
    });

    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.addClass('collapsed');
    }

    $(document).on('click', '.sidebar-submenu-toggle', function(e) {
        e.preventDefault();
        var $parent = $(this).closest('.sidebar-has-submenu');
        $parent.toggleClass('open');
    });

    // Auto-activate tab from ?tab= query param
    var tabParam = new URLSearchParams(window.location.search).get('tab');
    if (tabParam) {
        setTimeout(function() {
            var $tab = $('.module-tab[data-tab="' + tabParam + '"]').first();
            if ($tab.length) $tab.click();
        }, 600);
    }

    // ── Global Search ─────────────────────────────────────────────────────────
    var HMS_INDEX = [
        // Pages
        { label: 'Dashboard',                     url: '/',                              icon: 'layout-dashboard', type: 'page', kw: 'home overview' },
        { label: 'Outpatient (OPD)',               url: '/opd',                           icon: 'stethoscope',      type: 'page', kw: 'opd clinic visits' },
        { label: 'Inpatient (IPD)',                url: '/ipd',                           icon: 'building-2',       type: 'page', kw: 'ipd ward admission' },
        { label: 'Emergency (ER)',                 url: '/emergency',                     icon: 'siren',            type: 'page', kw: 'er emergency' },
        { label: 'Operation Theater',             url: '/ot',                            icon: 'scissors',         type: 'page', kw: 'ot surgery operation' },
        { label: 'Bed Management',                url: '/bed-management',                icon: 'bed-double',       type: 'page', kw: 'beds wards rooms' },
        { label: 'Patients',                      url: '/patients',                      icon: 'users',            type: 'page', kw: 'patient master records mrn' },
        { label: 'Doctor Management',             url: '/doctors',                       icon: 'user-check',       type: 'page', kw: 'doctors management' },
        { label: 'Staff Management',              url: '/staff',                         icon: 'users-2',          type: 'page', kw: 'staff hr employees' },
        { label: 'Doctor Fees',                   url: '/doctor-fees',                   icon: 'banknote',         type: 'page', kw: 'fees doctors charges' },
        { label: 'Charges Management',            url: '/charges',                       icon: 'receipt',          type: 'page', kw: 'charges billing' },
        { label: 'IPD Discharge Clearance',       url: '/billing/ipd-discharge',         icon: 'credit-card',      type: 'page', kw: 'billing discharge clearance payment' },
        { label: 'Income & Expense',              url: '/income-expense',                icon: 'trending-up',      type: 'page', kw: 'income expense finance' },
        { label: 'Pharmacy — Medication Orders',  url: '/pharmacy/medication-orders',    icon: 'pill',             type: 'page', kw: 'pharmacy medication orders' },
        { label: 'Pharmacy — Dispensing',         url: '/pharmacy/dispensing',           icon: 'package',          type: 'page', kw: 'pharmacy dispensing fulfillment' },
        { label: 'Pharmacy — POS',                url: '/pharmacy/pos',                  icon: 'shopping-cart',    type: 'page', kw: 'pharmacy pos terminal sale' },
        { label: 'Pharmacy — Inventory',          url: '/pharmacy/inventory',            icon: 'archive',          type: 'page', kw: 'pharmacy inventory stock medicines' },
        { label: 'Pharmacy — Stock Alerts',       url: '/pharmacy/stock-alerts',         icon: 'bell',             type: 'page', kw: 'pharmacy stock alerts procurement' },
        { label: 'Pharmacy — Billing',            url: '/pharmacy/billing',              icon: 'file-text',        type: 'page', kw: 'pharmacy billing reconciliation' },
        { label: 'Pharmacy — Returns',            url: '/pharmacy/returns',              icon: 'rotate-ccw',       type: 'page', kw: 'pharmacy returns expiry' },
        { label: 'Lab — Test Orders',             url: '/laboratory/test-orders',        icon: 'flask-conical',    type: 'page', kw: 'lab test orders queue' },
        { label: 'Lab — Walk-in',                 url: '/laboratory/walk-in',            icon: 'user-plus',        type: 'page', kw: 'lab walk-in registration' },
        { label: 'Lab — Test Master',             url: '/laboratory/test-master',        icon: 'database',         type: 'page', kw: 'lab test master' },
        { label: 'Lab — Sample Collection',       url: '/laboratory/sample-collection',  icon: 'droplet',          type: 'page', kw: 'lab sample collection processing' },
        { label: 'Lab — Results',                 url: '/laboratory/results',            icon: 'file-check',       type: 'page', kw: 'lab results entry verification' },
        { label: 'Lab — Quality Control',         url: '/laboratory/quality-control',    icon: 'shield-check',     type: 'page', kw: 'lab quality control calibration' },
        { label: 'Lab — Inventory',               url: '/laboratory/inventory',          icon: 'archive',          type: 'page', kw: 'lab inventory reagent' },
        { label: 'Lab — Billing',                 url: '/laboratory/billing',            icon: 'file-text',        type: 'page', kw: 'lab billing reconciliation' },
        { label: 'Lab — Reports',                 url: '/laboratory/reports',            icon: 'bar-chart-2',      type: 'page', kw: 'lab reports documents' },
        { label: 'Lab — Analytics',               url: '/laboratory/analytics',          icon: 'activity',         type: 'page', kw: 'lab analytics statistics' },
        { label: 'Config — OPD',                  url: '/configuration/opd',             icon: 'settings',         type: 'page', kw: 'configuration opd settings' },
        { label: 'Config — IPD',                  url: '/configuration/ipd',             icon: 'settings',         type: 'page', kw: 'configuration ipd settings' },
        { label: 'Config — ER',                   url: '/configuration/er',              icon: 'settings',         type: 'page', kw: 'configuration er emergency settings' },
        { label: 'Config — OT',                   url: '/configuration/ot',              icon: 'settings',         type: 'page', kw: 'configuration ot settings' },
        { label: 'Config — Human Resources',      url: '/configuration/human-resources', icon: 'settings',         type: 'page', kw: 'configuration hr human resources settings' },
        { label: 'Config — Financials',           url: '/configuration/financials',      icon: 'settings',         type: 'page', kw: 'configuration financials settings' },
        { label: 'Config — Pharmacy',             url: '/configuration/pharmacy',        icon: 'settings',         type: 'page', kw: 'configuration pharmacy settings' },
        { label: 'Config — Laboratory',           url: '/configuration/laboratory',      icon: 'settings',         type: 'page', kw: 'configuration laboratory settings' },
        // IPD Tabs
        { label: 'IPD — Patient Registration',    url: '/ipd?tab=registration',          icon: 'user-plus',        type: 'tab',  kw: 'ipd registration admission' },
        { label: 'IPD — Billing & Payment',       url: '/ipd?tab=billing',               icon: 'receipt',          type: 'tab',  kw: 'ipd billing payment' },
        { label: 'IPD — Clinical Orders',         url: '/ipd?tab=orders',                icon: 'clipboard-list',   type: 'tab',  kw: 'ipd clinical orders prescriptions' },
        { label: 'IPD — Medication MAR',          url: '/ipd?tab=mar',                   icon: 'pill',             type: 'tab',  kw: 'ipd mar medication administration record' },
        { label: 'IPD — Investigations',          url: '/ipd?tab=investigations',        icon: 'flask-conical',    type: 'tab',  kw: 'ipd investigations lab tests' },
        { label: 'IPD — Nursing Station',         url: '/ipd?tab=nursing',               icon: 'heart-pulse',      type: 'tab',  kw: 'ipd nursing vitals' },
        { label: 'IPD — Discharge',               url: '/ipd?tab=discharge',             icon: 'log-out',          type: 'tab',  kw: 'ipd discharge' },
        // OPD Tabs
        { label: 'OPD — Patient Registration',    url: '/opd?tab=registration',          icon: 'user-plus',        type: 'tab',  kw: 'opd registration' },
        { label: 'OPD — Billing',                 url: '/opd?tab=billing',               icon: 'receipt',          type: 'tab',  kw: 'opd billing payment' },
        { label: 'OPD — Vitals',                  url: '/opd?tab=vitals',                icon: 'activity',         type: 'tab',  kw: 'opd vitals signs bp' },
        { label: 'OPD — Consultation',            url: '/opd?tab=consultation',          icon: 'stethoscope',      type: 'tab',  kw: 'opd consultation doctor notes' },
        // ER Tabs
        { label: 'ER — Triage',                   url: '/emergency?tab=triage',          icon: 'alert-triangle',   type: 'tab',  kw: 'er triage emergency priority' },
        { label: 'ER — Patient Board',            url: '/emergency?tab=board',           icon: 'layout-dashboard', type: 'tab',  kw: 'er board emergency patients' },
        { label: 'ER — Treatment',                url: '/emergency?tab=treatment',       icon: 'stethoscope',      type: 'tab',  kw: 'er treatment' },
        { label: 'ER — Investigations',           url: '/emergency?tab=investigations',  icon: 'flask-conical',    type: 'tab',  kw: 'er investigations lab' },
        { label: 'ER — Disposition',              url: '/emergency?tab=disposition',     icon: 'log-out',          type: 'tab',  kw: 'er disposition discharge admit transfer' },
        // OT Tabs
        { label: 'OT — Scheduling',               url: '/ot?tab=scheduling',             icon: 'calendar',         type: 'tab',  kw: 'ot scheduling operation theater' },
        { label: 'OT — Dashboard',                url: '/ot?tab=dashboard',              icon: 'layout-dashboard', type: 'tab',  kw: 'ot dashboard' },
        { label: 'OT — Checklist',                url: '/ot?tab=checklist',              icon: 'clipboard-check',  type: 'tab',  kw: 'ot checklist safety' },
        { label: 'OT — Intra-op',                 url: '/ot?tab=intraop',                icon: 'scissors',         type: 'tab',  kw: 'ot intraoperative procedure' },
        { label: 'OT — Post-op',                  url: '/ot?tab=postop',                 icon: 'heart-pulse',      type: 'tab',  kw: 'ot postoperative recovery' },
        { label: 'OT — Reports',                  url: '/ot?tab=reports',                icon: 'bar-chart-2',      type: 'tab',  kw: 'ot reports' },
    ];

    var $input    = $('#globalSearch');
    var $results  = $('#globalSearchResults');
    var _activeIdx = -1;
    var _filtered  = [];

    function scoreItem(item, q) {
        var label = item.label.toLowerCase();
        var kw    = (item.kw || '').toLowerCase();
        if (label.startsWith(q))  return 3;
        if (label.includes(q))    return 2;
        if (kw.includes(q))       return 1;
        return 0;
    }

    function esc(s) {
        return $('<span>').text(s).html();
    }

    function renderResults(q) {
        if (!q) { $results.hide().empty(); _activeIdx = -1; return; }

        _filtered = HMS_INDEX.map(function(item) {
            return { item: item, s: scoreItem(item, q) };
        }).filter(function(x) { return x.s > 0; })
          .sort(function(a, b) { return b.s - a.s; })
          .slice(0, 10)
          .map(function(x) { return x.item; });

        if (!_filtered.length) {
            $results.html('<div class="gs-empty">No results for <strong>' + esc(q) + '</strong></div>').show();
            return;
        }

        var html = '';
        _filtered.forEach(function(item, i) {
            var badge = item.type === 'tab'
                ? '<span class="gs-badge gs-badge-tab">Tab</span>'
                : '<span class="gs-badge gs-badge-page">Page</span>';
            html += '<div class="gs-item" data-idx="' + i + '" data-url="' + esc(item.url) + '">' +
                '<i data-lucide="' + item.icon + '" class="gs-icon"></i>' +
                '<span class="gs-label">' + esc(item.label) + '</span>' +
                badge +
            '</div>';
        });
        $results.html(html).show();
        lucide.createIcons();
        _activeIdx = -1;
    }

    $(document).on('click', '.gs-item', function() {
        window.location.href = HMS_BASE + $(this).data('url');
    });

    $input.on('input', function() {
        renderResults($(this).val().trim().toLowerCase());
    });

    $input.on('keydown', function(e) {
        var $items = $results.find('.gs-item');
        if (!$items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            _activeIdx = Math.min(_activeIdx + 1, $items.length - 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            _activeIdx = Math.max(_activeIdx - 1, 0);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (_activeIdx >= 0 && _filtered[_activeIdx]) { window.location.href = HMS_BASE + _filtered[_activeIdx].url; return; }
            if (_filtered.length) { window.location.href = HMS_BASE + _filtered[0].url; return; }
        } else if (e.key === 'Escape') {
            $results.hide().empty(); $input.val(''); _activeIdx = -1; return;
        } else { return; }

        $items.removeClass('active');
        if (_activeIdx >= 0) $items.eq(_activeIdx).addClass('active')[0].scrollIntoView({ block: 'nearest' });
    });

    $input.on('focus', function() {
        if ($(this).val().trim()) renderResults($(this).val().trim().toLowerCase());
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('#globalSearch, #globalSearchResults').length) {
            $results.hide();
        }
    });
});
