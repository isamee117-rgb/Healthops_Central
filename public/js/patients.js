$(document).ready(function() {
    var patients = [];

    // ── Patients table state ──────────────────────────────────────────────────
    var ptCurrentPage = 1;
    var ptPerPageVal  = 10;
    var ptFiltered    = null;

    // ── Data loading ──────────────────────────────────────────────────────────
    function loadPatients() {
        $.get('/api/patients', function(data) {
            patients = (data || []).map(function(p) {
                return $.extend({}, p, {
                    status: p.visitCount > 5 ? 'Active' : 'Discharged',
                    outstandingBalance: p.visitCount % 2 === 0 ? 5000 : 0,
                    lastVisit: '2 days ago',
                    department: 'Cardiology',
                    type: 'OPD'
                });
            });
            updateStats();
            renderTable();
            lucide.createIcons();
        });
    }

    function updateStats() {
        $('#statTotal').text(patients.length.toLocaleString());
        var active = patients.filter(function(p) { return p.status === 'Active'; }).length;
        $('#statActive').text(active);
        $('#statNew').text(Math.min(28, patients.length));
        $('#statVip').text(Math.min(12, Math.floor(patients.length / 10)));
    }

    function getInitials(name) {
        return name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
    }

    // ── Render table with search applied, delegates to pagination ────────────
    function renderTable() {
        var search    = ($('#patientSearch').val() || '').toLowerCase();
        var statusVal = ($('#ptStatusFilter').val() || '').toLowerCase();
        var deptVal   = ($('#ptDeptFilter').val()   || '').toLowerCase();

        var base = ptFiltered !== null ? ptFiltered : patients;
        var filtered = base.filter(function(p) {
            if (search &&
                p.name.toLowerCase().indexOf(search) < 0 &&
                p.mrn.toLowerCase().indexOf(search) < 0 &&
                !(p.cnic && p.cnic.toLowerCase().indexOf(search) > -1)) return false;
            if (statusVal && statusVal !== 'all status' &&
                (p.status || '').toLowerCase() !== statusVal) return false;
            if (deptVal && deptVal !== 'all departments' &&
                (p.type || '').toLowerCase() !== deptVal) return false;
            return true;
        });

        _ptRenderPagination(filtered);
    }

    // ── Pagination renderer ───────────────────────────────────────────────────
    function _ptRenderPagination(source) {
        var total    = source.length;
        var totalPgs = Math.max(1, Math.ceil(total / ptPerPageVal));
        if (ptCurrentPage > totalPgs) ptCurrentPage = totalPgs;
        var start = (ptCurrentPage - 1) * ptPerPageVal;
        var page  = source.slice(start, start + ptPerPageVal);

        var html = '';
        if (page.length === 0) {
            html = '<tr><td colspan="10"><div class="empty-state"><i data-lucide="users"></i><p>No patients found</p><p class="empty-sub">Try adjusting your search or filters</p></div></td></tr>';
        } else {
            page.forEach(function(p) {
                var balanceHtml = p.outstandingBalance > 0
                    ? '<span style="color:var(--color-destructive);font-weight:700">PKR ' + p.outstandingBalance.toLocaleString() + '</span>'
                    : '<span style="color:var(--color-success)">PKR 0</span>';
                var statusBadge = p.status === 'Active'
                    ? '<span class="badge badge-success" style="font-size:10px">' + p.status + '</span>'
                    : '<span class="badge badge-outline" style="font-size:10px">' + p.status + '</span>';

                html += '<tr onclick="viewPatient(\'' + p.mrn + '\')" style="cursor:pointer">' +
                    '<td><div class="avatar avatar-sm avatar-primary">' + getInitials(p.name) + '</div></td>' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + p.mrn + '</td>' +
                    '<td style="font-weight:500">' + p.name + '</td>' +
                    '<td><div style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="user" style="width:12px;height:12px"></i> ' + p.age + 'y | ' + p.gender + '</div></td>' +
                    '<td class="font-mono" style="font-size:12px;color:var(--color-muted-foreground)">' + (p.cnic || '-') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + (p.phone || '-') + '</td>' +
                    '<td><div style="font-size:12px"><span style="font-weight:500">' + p.lastVisit + '</span><div style="font-size:10px;color:var(--color-muted-foreground)">' + p.department + '</div></div></td>' +
                    '<td>' + statusBadge + '</td>' +
                    '<td class="text-right font-mono" style="font-size:12px">' + balanceHtml + '</td>' +
                    '<td class="text-right"><button class="btn-ghost btn-icon" onclick="event.stopPropagation()"><i data-lucide="more-horizontal"></i></button></td>' +
                    '</tr>';
            });
        }
        $('#patientsBody').html(html);

        // Pagination info
        var from = total === 0 ? 0 : start + 1;
        var to   = Math.min(start + ptPerPageVal, total);
        $('#ptTableInfo').text('Showing ' + from + '\u2013' + to + ' of ' + total + ' records');

        // Page number buttons
        var numsHtml = '';
        var maxBtns = 5, half = Math.floor(maxBtns / 2);
        var pStart = Math.max(1, ptCurrentPage - half);
        var pEnd   = Math.min(totalPgs, pStart + maxBtns - 1);
        if (pEnd - pStart < maxBtns - 1) pStart = Math.max(1, pEnd - maxBtns + 1);
        for (var pg = pStart; pg <= pEnd; pg++) {
            numsHtml += '<button class="opd-page-num' + (pg === ptCurrentPage ? ' active' : '') + '" data-page="' + pg + '">' + pg + '</button>';
        }
        $('#ptPageNums').html(numsHtml);
        $('#ptPrevPage').prop('disabled', ptCurrentPage <= 1);
        $('#ptNextPage').prop('disabled', ptCurrentPage >= totalPgs);

        lucide.createIcons();
    }

    // ── Search & pagination events ────────────────────────────────────────────
    $('#patientSearch').on('input', function() { ptCurrentPage = 1; renderTable(); });

    $(document).on('click', '#ptPageNums .opd-page-num', function() {
        ptCurrentPage = parseInt($(this).data('page')); renderTable();
    });
    $(document).on('click', '#ptPrevPage', function() {
        if (ptCurrentPage > 1) { ptCurrentPage--; renderTable(); }
    });
    $(document).on('click', '#ptNextPage', function() {
        ptCurrentPage++; renderTable();
    });

    // ── Toolbar window functions ──────────────────────────────────────────────
    window.togglePtFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('ptFilterPane');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnPtFilter');
        if (btn) btn.classList.toggle('active', !open);
    };

    window.applyPtFilters = function() {
        var stVal   = ($('#ptStatusFilter').val() || '').toLowerCase();
        var deptVal = ($('#ptDeptFilter').val()   || '').toLowerCase();
        var dfVal   = $('#ptDateFrom').val() || '';
        var dtVal   = $('#ptDateTo').val()   || '';

        ptFiltered = patients.filter(function(p) {
            if (stVal   && stVal   !== 'all status'       && (p.status || '').toLowerCase() !== stVal)   return false;
            if (deptVal && deptVal !== 'all departments'  && (p.type   || '').toLowerCase() !== deptVal) return false;
            if (dfVal && p.registrationDate && p.registrationDate < dfVal) return false;
            if (dtVal && p.registrationDate && p.registrationDate > dtVal) return false;
            return true;
        });

        var count = 0;
        if (stVal   && stVal   !== 'all status')      count++;
        if (deptVal && deptVal !== 'all departments') count++;
        if (dfVal) count++;
        if (dtVal) count++;
        var badge = document.getElementById('ptFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }

        ptCurrentPage = 1;
        renderTable();
        togglePtFilter();
    };

    window.resetPtFilters = function() {
        ptFiltered = null; ptCurrentPage = 1;
        ['ptCsStatus','ptCsDept'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        ['ptDpDateFrom','ptDpDateTo'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        var badge = document.getElementById('ptFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        renderTable();
    };

    window.togglePtRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('ptRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setPtRowsPer = function(n) {
        ptPerPageVal = n; ptCurrentPage = 1;
        var m = document.getElementById('ptRowsMenu'); if (m) m.classList.remove('open');
        renderTable();
    };

    window.togglePtColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('ptColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.ptColVisSelectAll = function() {
        $('#ptColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyPtColVis = function() {
        var m = document.getElementById('ptColVisMenu'); if (m) m.classList.remove('open');
        $('#ptColVisList input[type=checkbox]').each(function() {
            var col  = parseInt($(this).data('col'));
            var show = $(this).is(':checked');
            $('#patientsTable thead tr th:eq(' + col + ')').toggle(show);
            $('#patientsTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.togglePtExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('ptExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportPt = function(type) {
        var m = document.getElementById('ptExportMenu'); if (m) m.classList.remove('open');
        var source = ptFiltered !== null ? ptFiltered : patients;
        if (type === 'csv') {
            var hdrs = ['MR Number','Full Name','Age','Gender','CNIC','Contact','Department','Status','Balance'];
            var rows = source.map(function(p) {
                return [p.mrn||'', p.name||'', p.age||'', p.gender||'', p.cnic||'', p.phone||'', p.department||'', p.status||'', p.outstandingBalance||0];
            });
            var lines = [hdrs.map(function(h) { return '"' + h + '"'; }).join(',')];
            rows.forEach(function(r) { lines.push(r.map(function(c) { return '"' + (c + '').replace(/"/g, '""') + '"'; }).join(',')); });
            var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'patients.csv'; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
    };

    // ── Outside-click handler ─────────────────────────────────────────────────
    $(document).on('click.ptMenus', function(e) {
        if (!$(e.target).closest('#ptRowsMenu, #ptRowsBtn').length)          $('#ptRowsMenu').removeClass('open');
        if (!$(e.target).closest('#ptColVisMenu, .opd-col-vis-wrap').length) $('#ptColVisMenu').removeClass('open');
        if (!$(e.target).closest('#ptExportMenu, .opd-export-wrap').length)  $('#ptExportMenu').removeClass('open');
        if (!$(e.target).closest('.opd-dp-trigger,.opd-dp-popup,.opd-cs-trigger,.opd-cs-popup').length) ptCloseAll();
    });

    // ── Custom date picker & searchable select ────────────────────────────────
    var PT_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var PT_DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    function ptCloseAll() {
        document.querySelectorAll('.opd-dp-popup.open').forEach(function(p) {
            p.classList.remove('open');
            if (p._trigger) p._trigger.classList.remove('open');
        });
        document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) {
            p.classList.remove('open');
            if (p._trigger) p._trigger.classList.remove('open');
        });
    }
    document.addEventListener('click', ptCloseAll);

    function ptRepositionOpen() {
        document.querySelectorAll('.opd-dp-popup.open, .opd-cs-popup.open').forEach(function(p) {
            if (!p._trigger) return;
            var rect = p._trigger.getBoundingClientRect();
            p.style.top  = (rect.bottom + 6) + 'px';
            p.style.left = rect.left + 'px';
        });
    }
    window.addEventListener('scroll', ptRepositionOpen, true);
    window.addEventListener('resize', ptRepositionOpen);

    function ptInitDp(wrapId) {
        var wrap = document.getElementById(wrapId);
        if (!wrap) return;
        var hiddenId = wrap.dataset.target;
        var ph       = wrap.dataset.placeholder || 'Select date';
        var hidden   = document.getElementById(hiddenId);
        var selDate  = null;
        var viewYear = new Date().getFullYear();
        var viewMonth = new Date().getMonth();

        var triggerEl = document.createElement('div');
        triggerEl.className = 'opd-dp-trigger';
        triggerEl.innerHTML = '<span class="opd-dp-val opd-ph">' + ph + '</span><i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>';
        var popup = document.createElement('div');
        popup.className = 'opd-dp-popup';
        wrap.appendChild(triggerEl);
        wrap.appendChild(popup);
        lucide.createIcons();

        var valEl = triggerEl.querySelector('.opd-dp-val');

        function render() {
            var firstDow    = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
            var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
            var h = '<div class="opd-dp-header"><button class="opd-dp-nav" data-a="p">&#8249;</button><span class="opd-dp-month-year">' + PT_MONTHS[viewMonth] + ' ' + viewYear + '</span><button class="opd-dp-nav" data-a="n">&#8250;</button></div><div class="opd-dp-grid">';
            PT_DAYS.forEach(function(d) { h += '<div class="opd-dp-dayname">' + d + '</div>'; });
            for (var i = 0; i < firstDow; i++) h += '<div class="opd-dp-day empty"></div>';
            for (var d = 1; d <= daysInMonth; d++) {
                var ds = viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
                h += '<div class="opd-dp-day' + (selDate === ds ? ' selected' : '') + '" data-date="' + ds + '">' + d + '</div>';
            }
            h += '</div>';
            popup.innerHTML = h;
        }

        triggerEl.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = popup.classList.contains('open');
            ptCloseAll();
            if (!isOpen) {
                var rect = triggerEl.getBoundingClientRect();
                popup.style.top   = (rect.bottom + 6) + 'px';
                popup.style.left  = rect.left + 'px';
                popup.style.width = rect.width + 'px';
                popup._trigger = triggerEl;
                if (popup.parentNode !== document.body) document.body.appendChild(popup);
                render();
                popup.classList.add('open'); triggerEl.classList.add('open');
            }
        });
        popup.addEventListener('click', function(e) {
            e.stopPropagation();
            var tgt = e.target;
            if (tgt.dataset.a === 'p') { if (--viewMonth < 0) { viewMonth = 11; viewYear--; } render(); }
            else if (tgt.dataset.a === 'n') { if (++viewMonth > 11) { viewMonth = 0; viewYear++; } render(); }
            else if (tgt.dataset.date) {
                selDate = tgt.dataset.date;
                valEl.textContent = selDate; valEl.classList.remove('opd-ph');
                if (hidden) hidden.value = selDate;
                ptCloseAll();
            }
        });
        wrap._reset = function() {
            selDate = null; viewYear = new Date().getFullYear(); viewMonth = new Date().getMonth();
            valEl.textContent = ph; valEl.classList.add('opd-ph');
            if (hidden) hidden.value = '';
        };
    }

    function ptInitCs(wrapId) {
        var wrap = document.getElementById(wrapId);
        if (!wrap) return;
        var hiddenId = wrap.dataset.target;
        var ph       = wrap.dataset.placeholder || 'Select...';
        var hidden   = document.getElementById(hiddenId);
        var options  = [];
        var selVal   = '';

        var triggerEl = document.createElement('div');
        triggerEl.className = 'opd-cs-trigger';
        triggerEl.innerHTML = '<span class="opd-cs-val opd-ph">' + ph + '</span><i data-lucide="chevron-down" style="width:15px;height:15px;flex-shrink:0"></i>';
        var popup = document.createElement('div');
        popup.className = 'opd-cs-popup';
        popup.innerHTML = '<input type="text" class="opd-cs-search" placeholder="Search..."><div class="opd-cs-list"></div>';
        wrap.appendChild(triggerEl);
        wrap.appendChild(popup);
        lucide.createIcons();

        var valEl  = triggerEl.querySelector('.opd-cs-val');
        var search = popup.querySelector('.opd-cs-search');
        var list   = popup.querySelector('.opd-cs-list');

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
                    ptCloseAll();
                });
            });
        }
        triggerEl.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = popup.classList.contains('open');
            ptCloseAll();
            if (!isOpen) {
                var rect = triggerEl.getBoundingClientRect();
                popup.style.top   = (rect.bottom + 6) + 'px';
                popup.style.left  = rect.left + 'px';
                popup.style.width = rect.width + 'px';
                popup._trigger = triggerEl;
                if (popup.parentNode !== document.body) document.body.appendChild(popup);
                popup.classList.add('open'); triggerEl.classList.add('open');
                search.value = ''; renderList('');
                setTimeout(function() { search.focus(); }, 40);
            }
        });
        search.addEventListener('input', function(e) { e.stopPropagation(); renderList(this.value); });
        search.addEventListener('click', function(e) { e.stopPropagation(); });
        popup.addEventListener('click', function(e) { e.stopPropagation(); });
        wrap.setOptions = function(opts) { options = opts || []; };
        wrap._reset = function() {
            selVal = ''; valEl.textContent = ph; valEl.classList.add('opd-ph');
            if (hidden) hidden.value = '';
        };
    }

    // ── Initialize toolbar components ─────────────────────────────────────────
    ['ptDpDateFrom','ptDpDateTo'].forEach(ptInitDp);
    ['ptCsStatus','ptCsDept'].forEach(ptInitCs);

    var stWrap = document.getElementById('ptCsStatus');
    if (stWrap && stWrap.setOptions) stWrap.setOptions(['All Status','Active','Discharged']);
    var deptWrap = document.getElementById('ptCsDept');
    if (deptWrap && deptWrap.setOptions) deptWrap.setOptions(['All Departments','OPD','IPD','Emergency']);

    // ── Patient detail modal ──────────────────────────────────────────────────
    window.viewPatient = function(mrn) {
        var patient = patients.find(function(p) { return p.mrn === mrn; });
        if (!patient) return;

        var headerHtml = '<div class="profile-info">' +
            '<div class="avatar avatar-lg avatar-aquamint">' + getInitials(patient.name) + '</div>' +
            '<div>' +
            '<h2 class="profile-name">' + patient.name + ' <span class="badge badge-outline" style="background:rgba(255,255,255,0.1);color:#fff;border:none;font-size:11px">' + patient.mrn + '</span></h2>' +
            '<div class="profile-meta">' + patient.age + ' Years | ' + patient.gender + ' | ' + (patient.bloodGroup || 'O+') + '</div>' +
            '<div class="profile-contact"><i data-lucide="phone"></i> ' + (patient.phone || 'N/A') + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="profile-stats">' +
            '<div class="profile-stat"><p class="stat-label">Outstanding</p><p class="stat-value" style="color:var(--color-destructive)">PKR ' + patient.outstandingBalance.toLocaleString() + '</p></div>' +
            '<div class="profile-stat"><p class="stat-label">Last Visit</p><p class="stat-value" style="font-size:18px">' + patient.lastVisit + '</p><p class="stat-sub">' + patient.department + '</p></div>' +
            '</div>';
        $('#profileHeader').html(headerHtml);

        renderProfileTab('overview', patient);

        $('.profile-tab-btn').off('click').on('click', function() {
            $('.profile-tab-btn').removeClass('active');
            $(this).addClass('active');
            renderProfileTab($(this).data('tab'), patient);
        });

        $('#profileModal').modal('show');
        setTimeout(function() { lucide.createIcons(); }, 100);
    };

    function renderProfileTab(tab, patient) {
        var html = '';
        if (tab === 'overview') {
            html = '<div class="row g-4">' +
                '<div class="col-md-4">' +
                '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px">' +
                '<h5 style="font-size:14px;font-weight:600;margin:0 0 12px">Demographics</h5>' +
                '<div style="font-size:13px">' +
                '<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--color-border);padding:6px 0"><span style="color:var(--color-muted-foreground)">CNIC</span><span>' + (patient.cnic || 'N/A') + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--color-border);padding:6px 0"><span style="color:var(--color-muted-foreground)">DOB</span><span>01-Jan-' + (new Date().getFullYear() - patient.age) + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:var(--color-muted-foreground)">Address</span><span style="max-width:150px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (patient.address || 'N/A') + '</span></div>' +
                '</div></div></div>' +
                '<div class="col-md-8">' +
                '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px">' +
                '<h5 style="font-size:14px;font-weight:600;margin:0 0 12px">Recent Activity</h5>' +
                '<div style="display:flex;flex-direction:column;gap:16px">';

            [
                { icon: 'stethoscope', title: 'OPD Consultation - Cardiology', date: '15-Feb-2026 \u2022 Dr. Ahmed Khan' },
                { icon: 'flask-conical', title: 'Lab Investigation - CBC', date: '13-Feb-2026 \u2022 Dr. Fatima Ali' },
                { icon: 'pill', title: 'Medication Refill', date: '10-Feb-2026 \u2022 Pharmacy' }
            ].forEach(function(a) {
                html += '<div style="display:flex;gap:16px;align-items:flex-start">' +
                    '<div style="margin-top:2px;background:rgba(127,255,212,0.1);padding:8px;border-radius:50%;color:var(--aquamint)"><i data-lucide="' + a.icon + '" style="width:16px;height:16px"></i></div>' +
                    '<div style="flex:1"><h4 style="font-weight:600;font-size:14px;margin:0">' + a.title + '</h4><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">' + a.date + '</p></div>' +
                    '<span class="badge badge-outline" style="font-size:10px">Completed</span></div>';
            });

            html += '</div></div></div></div>';
        } else if (tab === 'timeline') {
            html = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:256px;color:var(--color-muted-foreground)">' +
                '<i data-lucide="activity" style="width:48px;height:48px;opacity:0.2;margin-bottom:16px"></i>' +
                '<p>Full clinical timeline view would be here</p></div>';
        } else if (tab === 'finance') {
            html = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:256px;color:var(--color-muted-foreground)">' +
                '<i data-lucide="credit-card" style="width:48px;height:48px;opacity:0.2;margin-bottom:16px"></i>' +
                '<p>Financial history view would be here</p></div>';
        }
        $('#profileContent').html(html);
        lucide.createIcons();
    }

    // ── Save new patient ──────────────────────────────────────────────────────
    $('#btnSavePatient').on('click', function() {
        var name   = $('#regName').val().trim();
        var gender = $('#regGender').val();
        var phone  = $('#regPhone').val().trim();

        if (!name)   { HMS.toast('Full Name is required', 'warning'); return; }
        if (!gender) { HMS.toast('Gender is required', 'warning'); return; }

        var btn = $(this);
        btn.prop('disabled', true).text('Saving...');

        $.ajax({
            url: '/api/patients',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name:        name,
                age:         parseInt($('#regDob').val() ? (new Date().getFullYear() - new Date($('#regDob').val()).getFullYear()) : 30),
                gender:      gender,
                phone:       phone,
                cnic:        $('#regCnic').val().trim(),
                contactType: 'SELF'
            }),
            success: function() {
                $('#registerModal').modal('hide');
                loadPatients();
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed to save patient');
            },
            complete: function() {
                btn.prop('disabled', false).html('<i data-lucide="user-plus" style="width:16px;height:16px"></i> Save & Create Patient');
                lucide.createIcons();
            }
        });
    });

    loadPatients();
});
